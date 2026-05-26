import resumeAnalysisModel from '../../models/resumeAnalysis.model.js'
import interviewSessionModel from '../../models/interviewSession.model.js'
import {askCareerAssistant} from '../../utils/chatbotAI.js'

export async function askChatbot(req, res) {
  try{
    const {contextType, contextId, question} = req.body

    if(!contextType || !contextId || !question){
      return res.status(400).json({message:"Please Provide all details"})
    }

    let contextData = null

    if(contextType === 'resume'){
      const resumeSession = await resumeAnalysisModel.findById(contextId)

      if(!resumeSession){
        return res.status(404).json({message: "Resume Analysis session not found"})
      }

      contextData = resumeSession
    }
    else if(contextType === 'interview'){
      const interviewSession = await interviewSessionModel.findById(contextId)

      if(!interviewSession){
        return res.status(404).json({message: "Interview session not found"})
      }

      contextData = interviewSession
    }
    else{
      return res.status(400).json({message: "Invalid context type"})
    }

    const casualReplies = {
      "ok": "Glad I could help!",
      "okay": "Glad I could help!",
      "got it": "Awesome 👍",
      "k": "👍",
      "k noted": "Gotcha 😄",
      "thanks": "You're welcome!",
      "thank you": "Happy to help!",
    };

    const normalizedQuestion = question.trim().toLowerCase();

    if (casualReplies[normalizedQuestion]) {
      return res.status(200).json({
        message: "Quick reply generated",
        answer: casualReplies[normalizedQuestion],
      });
    }
    
    const answer = await askCareerAssistant({
      contextType,
      contextData,
      question
    })

    return res.status(200).json({
      message:"Assistant response generated",
      answer,
    })

  }catch(err){
    return res.status(500).json({message:"internal server error"})
  }
}

