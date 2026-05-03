import mongoose, { mongo } from "mongoose";

const sessionSchema = new mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user id is required"]
  },
  refreshTokenHash:{
    type:String,
    required: [true, 'refresh Token is required']
  },
  ip:{
    type: String,
    required: [true, 'ip is required']
  },
  userAgent:{
    type: String, 
    required: [true, "userAgent is required"]
  },
  revoked:{
    type: Boolean,
    default: false
  }
},{
  timestamps:true
})

const sessionModel = mongoose.model('Session', sessionSchema)

export default sessionModel