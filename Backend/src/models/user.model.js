import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required : [true, "username is required for registration"],
    unique: true,
    trim:true
  },
  
  email:{
    type:String,
    required: [true, "email is required for registration"],
    unique: true,
    trim: true,
    lowercase: true
  },

  password : {
    type: String,
    required: [true, "password is required"]
  },

  githubUsername: {
    type: String,
    default: null
  },

  leetcodeUsername: {
    type: String,
    default: null
  }
}, {
  timestamps: true
})

const userModel = mongoose.model('User', userSchema)

export default userModel