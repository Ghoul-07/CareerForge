import mongoose, { modelNames } from 'mongoose'

const resumeAnalysisSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  }, 
  atsScore: {
    type: Number , 
    required:true
  },
  missingSkills: [String],
  weakPoints: [String],
  improvedPoints: [String],
  overallFeedback: {
    type:String
  }
}, {timestamps:true}
)

const resumeAnalysisModel = mongoose.model('ResumeAnalysis', resumeAnalysisSchema)

export default resumeAnalysisModel