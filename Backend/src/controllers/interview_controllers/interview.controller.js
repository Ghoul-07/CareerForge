import resumeAnalysisModel from '../../models/resumeAnalysis.model.js'
import interviewSessionModel from '../../models/interviewSession.model.js'
import { generateInterviewPlan , evaluateInterviewAnswer} from '../../utils/InterviewAI.js'


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

    const totalScore = interviewSession.evaluations.reduce((sum, evalItem) => sum + evalItem.score, 0)

    const averageScore = Math.round(totalScore / interviewSession.evaluations.length)

    // extracting strengths and weaknesses

    const strengths = []
    const weakAreas = []

    interviewSession.evaluations.forEach((evalItem) =>{
      strengths.push(...evalItem.strengths),
      weakAreas.push(...evalItem.weaknesses)
    })

    const uniqueStrengths = [...new Set(strengths)];
    const uniqueWeakAreas = [...new Set(weakAreas)];

    const recommendedTopics = uniqueWeakAreas.map((w) => {
      if (w.toLowerCase().includes("api")) return "API Design";
      if (w.toLowerCase().includes("database")) return "MongoDB";
      if (w.toLowerCase().includes("depth")) return "System Design";
      return "General Backend Concepts";
    });


    let finalVerdict = "";

    if (averageScore >= 8) {
      finalVerdict = "Strong candidate";
    } else if (averageScore >= 6) {
      finalVerdict = "Good candidate, needs improvement";
    } else {
      finalVerdict = "Needs significant improvement";
    }

    const finalReport = {
      overallScore: averageScore,
      technicalScore: averageScore,
      communicationScore: averageScore,
      strengths: uniqueStrengths,
      weakAreas: uniqueWeakAreas,
      recommendedTopics: [... new Set(recommendedTopics)],
      finalVerdict: finalVerdict
    }

    interviewSession.finalReport = finalReport
    interviewSession.status = 'finished'

    await interviewSession.save()

    return res.status(200).json({
      message: "Interview finished successfully",
      finalReport
    });

  } catch(err){
    return res.status(500).json({message:"internal server error"})
  }

}