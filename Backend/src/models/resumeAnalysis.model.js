import mongoose from 'mongoose'

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
  resume : {
    originalName : {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    publicId : {
      type : String,
      required : true
    },
    size:{
      type: Number
    },
    mimetype: {type : String}
  },
  resumeText:{
    type: String,
    default: null
  },
  results: [resultSchema]

}, {timestamps:true}
)

const resumeAnalysisModel = mongoose.model('ResumeAnalysis', resumeAnalysisSchema)

export default resumeAnalysisModel