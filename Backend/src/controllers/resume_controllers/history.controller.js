import resumeAnalysisModel from "../../models/resumeAnalysis.model.js";

export async function getHistory(req, res){
  try{
    const sessions = await resumeAnalysisModel.find({user: req.user._id}).sort({createdAt: -1}).select('results createdAt')
    
    return res.status(200).json({message:"Past Sessions fetched",
      sessions : sessions
    })
  } catch(err){
    return res.status(500).json({message:"internal server error"})
  }
}
