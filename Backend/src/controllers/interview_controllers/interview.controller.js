import resumeAnalysisModel from '../../models/resumeAnalysis.model.js'
import interviewSessionModel from '../../models/interviewSession.model.js'
import { generateInterviewPlan , evaluateInterviewAnswer, generateFinalInterviewReport} from '../../utils/InterviewAI.js'
import { populate } from 'dotenv'


export async function createInterview(req, res){
  try{
    const {resumeAnalysisSessionId, resultId, role, difficulty, interviewType} = req.body

    if(!resumeAnalysisSessionId || !resultId || !role || !difficulty || !interviewType){
      return res.status(400).json({message: "Please provide all details"})
    }

    const resumeAnalysisSession = await resumeAnalysisModel.findById(resumeAnalysisSessionId)

    if(!resumeAnalysisSession){
      return res.status(400).json({message: "Session does not exist"})
    }

    if(!resumeAnalysisSession.user.equals(req.user._id)){
      return res.status(400).json({message: "Session doesn't belong to active user, please enter valid sessionId"})
    }

    const selectedResult = resumeAnalysisSession.results.find(
      (result) => result._id.toString() === resultId.toString()
    );

    if(!selectedResult){
      return res.status(400).json({message:"Selected job description does not exist"})
    }

    const interviewSession = await interviewSessionModel.create({
      user: req.user._id,
      resumeAnalysisSession : resumeAnalysisSession._id,
      selectedResultId: selectedResult._id,
      role,
      difficulty,
      interviewType,
      status: 'created'
    })

    res.status(200).json({message: "Interview Session created successfully",
      interviewSession
    })
  } catch(err){
    return res.status(500).json("internal server error")
  }
  
}

export async function startInterview(req, res) {
  try{
    const interviewID = req.params.id
    
    if(!interviewID){
      return res.status(400).json({message: "please provide interview ID"})
    }

    const interviewSession = await interviewSessionModel.findById(interviewID)

    if(!interviewSession){
      return res.status(400).json({message: "Interview session not found, please create a session first"})
    }

    if (!interviewSession.user.equals(req.user._id)) {
      return res.status(403).json({ message: "Unauthorized access" });
    }


    // ensure the  interview in not finished or ongoing

    if(interviewSession.status === 'in_progress'){
      return res.status(400).json({message: "interview is already in progress"})
    }

    if(interviewSession.status === 'finished'){
      return res.status(400).json({message: "interview has ended"})
    }

    const resumeAnalysis = await resumeAnalysisModel.findById(
      interviewSession.resumeAnalysisSession
    )

    if (!resumeAnalysis) {
      return res.status(404).json({ message: "Linked resume analysis not found" });
    }
    
    const selectedResult = resumeAnalysis.results.id(interviewSession.selectedResultId)

    if(!selectedResult){
      return res.status(400).json({message : "job description does not exist"})
    }

    const jobDescription = selectedResult.jobDescription


    {/* for AI interview evalutaion */}
    const resumeText = resumeAnalysis.resumeText

    const aiPlan = await generateInterviewPlan({
      resumeText,
      jobDescription,
      role: interviewSession.role,
      difficulty: interviewSession.difficulty,
      interviewType: interviewSession.interviewType,
      analysisResults: selectedResult
    })

    interviewSession.plan = aiPlan

    interviewSession.status = 'in_progress',
    interviewSession.currentQuestionIndex = 0

    await interviewSession.save()

    res.status(200).json({message:"interview started successfully", interviewSession,
      firstQuestion: aiPlan.questions[0],
      totalQuestions :  aiPlan.questions.length
    })
  } catch(err){
    if (err.statusCode === 429) {
      return res.status(429).json({
        message: err.message,
      });
    }
    return res.status(500).json({message:"internal server error"})
  }

}

export async function answerQuestion(req, res){
  try{
    const interviewSessionId = req.params.id

    if(!interviewSessionId){
      return res.status(400).json({message:"please provide session id"})
    }

    const interviewSession = await interviewSessionModel.findById(interviewSessionId)

    if(!interviewSession){
      return res.status(400).json({message:"session does not exist"})
    }

    if(!interviewSession.user.equals(req.user._id)){
      return res.status(403).json({message:"UnAuthorized access"})
    }

    if(interviewSession.status === 'created'){
      return res.status(400).json({message:"the session hasn't begun yet"})
    }
    if(interviewSession.status === 'finished'){
      return res.status(400).json({message:"Session has already ended"})
    }

    const {answer} = req.body

    if(!answer){
      return res.status(400).json({message: "Please answer the question first"})
    }

    const currentQuestionIndex = interviewSession.currentQuestionIndex

    if(currentQuestionIndex >= interviewSession.plan.questions.length){
    
      return res.status(200).json({
        message: "All questions already answered",
        nextQuestion : null,
        canFinish: true
      })
    }

    const currentQuestion = interviewSession.plan.questions[currentQuestionIndex]

    const aiEvaluation = await evaluateInterviewAnswer({
      question: currentQuestion.question,
      expectedAnswerPoints: currentQuestion.expectedAnswerPoints,
      whyAsked: currentQuestion.whyAsked,
      userAnswer: answer,
      role: interviewSession.role,
      difficulty: interviewSession.difficulty,
      interviewType: interviewSession.interviewType
    })

    const evaluation = {
      questionIndex: currentQuestionIndex,
      question: currentQuestion.question,
      userAnswer: answer,
      score: aiEvaluation.score,
      strengths: aiEvaluation.strengths,
      weaknesses: aiEvaluation.weaknesses,
      improvedAnswer: aiEvaluation.improvedAnswer,
      followUpQuestion: aiEvaluation.followUpQuestion
    }

    interviewSession.evaluations.push(evaluation)
    interviewSession.currentQuestionIndex += 1

    const nextIndex = interviewSession.currentQuestionIndex

    if(nextIndex >= interviewSession.plan.questions.length){
      await interviewSession.save()

      return res.status(200).json({
        message:"Interview completed",
        evaluation: evaluation,
        nextQuestion: null,
        canFinish: true
      })
    }

    await interviewSession.save()

    res.status(200).json({message:"Answer submitted successfully",
      evaluation: evaluation,
      nextQuestion : interviewSession.plan.questions[nextIndex],
      currentQuestionIndex: nextIndex,
      totalQuestions: interviewSession.plan.questions.length
    })
  } catch(err){
    if (err.statusCode === 429) {
      return res.status(429).json({
        message: err.message,
      });
    }
    return res.status(500).json({message:"Internal server error"})
  }
}

export async function finishInterview(req, res){
  try{
    const interviewSessionId = req.params.id

    if(!interviewSessionId){
      return res.status(400).json({message:"please provide session id"})
    }

    const interviewSession = await interviewSessionModel.findById(interviewSessionId)

    if(!interviewSession){
      return res.status(400).json({message:"Session does not exist"})
    }

    if(!interviewSession.user.equals(req.user._id)){
      return res.status(403).json({message:"user is unAuthorized"})
    }

    if(interviewSession.status === 'created'){
      return res.status(400).json({message:"Interview has not started"})
    }

    if(interviewSession.status === 'finished'){
      return res.status(400).json({message: "Interview has ended"})
    }

    if(!interviewSession.evaluations || interviewSession.evaluations.length === 0){
      return res.status(400).json({message: "Please answer the questions first"})
    }

    const finalReport = await generateFinalInterviewReport({
      role: interviewSession.role,
      difficulty: interviewSession.difficulty,
      interviewType: interviewSession.interviewType,
      evaluations: interviewSession.evaluations
    })

    interviewSession.finalReport = finalReport
    interviewSession.status = 'finished'

    await interviewSession.save()

    return res.status(200).json({
      message: "Interview finished successfully",
      finalReport,
      interviewType: interviewSession.interviewType
    });

  } catch(err){
    if (err.statusCode === 429) {
      return res.status(429).json({
        message: err.message,
      });
    }
    return res.status(500).json({message:"internal server error"})
  }

}

export async function getInterviewSession(req, res){
  try{
    const interviewId  = req.params.id

    if(!interviewId){
      return res.status(400).json({message:"please provide interview session id"})
    }

    const interviewSession = await interviewSessionModel.findById(interviewId)

    if(!interviewSession){
      return res.status(400).json({message:"session does not exist"})
    }

    if(!interviewSession.user.equals(req.user._id)){
      return res.status(403).json({message:"User is not authorized"})
    }

    const totalQuestions = interviewSession.plan.questions.length
    const currentIndex = interviewSession.currentQuestionIndex

    const currentQuestion = interviewSession.status === 'in_progress' && currentIndex < totalQuestions 
      ? interviewSession.plan.questions[currentIndex] 
      : null


    return res.status(200).json({message: "Interview session fetched successfully",
      interviewSession,
      currentQuestion,
      totalQuestions,
      currentQuestionIndex: currentIndex,
      canFinish: interviewSession.status === 'in_progress' && currentIndex >= totalQuestions
    })
  } catch(err){
    return res.status(500).json({message:"Internal server error"})
  }

}

export async function getUserInterviews(req, res){
  try{
    if(!req.user._id){
      return res.status(403).json({message:"UnAuthorized access"})
    }
    const interviews = await interviewSessionModel.find({
      user: req.user._id,
      status: 'in_progress'
    }).populate("resumeAnalysisSession", "resume createdAt").sort({updatedAt: -1})


    res.status(200).json({
      message: "In-progress interviews fetched successfully",
      count : interviews.length,
      interviews
    })
  }
  catch(err){
    return res.status(500).json({message:"internal server error"})
  }
}

export async function getInterviewHistory(req, res){
  try{
    const user = req.user._id

    const interviews = await interviewSessionModel.find({user: user})
      .populate("resumeAnalysisSession", "resume results createdAt")
      .sort({updatedAt: -1})
    
    if(!interviews){
      return res.status(200).json({message:"No interview found"})
    }
    const formattedInterviews = interviews.map((interview) => {

      const selectedResult = interview.resumeAnalysisSession?.results?.find(
        (result) => result._id.toString() === interview.selectedResultId?.toString()
      )
      return{
          _id: interview._id,
          role: interview.role,
          difficulty: interview.difficulty,
          interviewType: interview.interviewType,
          status: interview.status,

          resume: interview.resumeAnalysisSession?.resume,
          jobDescription: selectedResult?.jobDescription || null,
          atsScore: selectedResult?.atsScore || null,
          analysisDifficulty: selectedResult?.difficulty || null,
          resumeAnalysisCreatedAt: interview.resumeAnalysisSession?.createdAt,

          currentQuestionIndex: interview.currentQuestionIndex,
          totalQuestions: interview.plan?.questions?.length || 0,

          finalReport: interview.finalReport,
          overallScore: interview.finalReport?.overallScore || null,
          technicalScore: interview.finalReport?.technicalScore || null,
          communicationScore: interview.finalReport?.communicationScore || null,

          createdAt: interview.createdAt,
          updatedAt: interview.updatedAt,
      }
    });
    

      res.status(200).json({message: "Interview history fetched successfully",
        count: formattedInterviews.length,
        interviews: formattedInterviews
      })
    } catch(err){
      return res.status(500).json({message: "internal server error"})
    }
}
