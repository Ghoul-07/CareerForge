import mongoose, { modelNames } from 'mongoose'

const resultSchema = new mongoose.Schema({
  jobDescription:{
    type:String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Junior' , 'Mid', 'Senior']
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
})
const resumeAnalysisSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  }, 
  results: [resultSchema]

}, {timestamps:true}
)

const resumeAnalysisModel = mongoose.model('ResumeAnalysis', resumeAnalysisSchema)

export default resumeAnalysisModel