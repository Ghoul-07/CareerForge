import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  question: String,
  category: String,   
  difficulty: String,
  expectedAnswerPoints: [String],
  whyAsked: String,
}, 
{
  _id: false
})

const evaluationSchema = new mongoose.Schema(
  {
    questionIndex : Number,
    question: String,
    userAnswer: String,
    score: Number,
    strengths: [String],
    weaknesses: [String],
    improvedAnswer: String,
    followUpQuestion: String,
  },
  {_id: false}
)

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  },
  resumeAnalysisSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'ResumeAnalysis',
    required: true
  },
  role:{
    type:String,
    required: true
  },
  difficulty:{
    type:String,
    enum: ['fresher', 'intermediate', 'senior'],
    default : 'fresher'
  },
  interviewType : {
    type: String,
    enum: ['technical', 'hr', 'mixed', 'project-based'],
    default:'mixed'
  },
  status:{
    type:String,
    enum: ['created', 'in_progress', 'finished'],
    default: 'created'
  },
  plan: {
    focusAreas: [String],
    questions: [questionSchema]
  },
  currentQuestionIndex: {
    type: Number,
    default: 0
  },

  evaluations: [evaluationSchema],

  finalReport:{
    overallScore: Number,
    technicalScore: Number,
    communicationScore: Number,
    strengths: [String],
    weakAreas: [String],
    recommendedTopics: [String],
    finalVerdict: String
  }
},
  {timestamps: true}
)

const interviewSessionModel = mongoose.model('InterviewSession', interviewSessionSchema)

export default interviewSessionModel