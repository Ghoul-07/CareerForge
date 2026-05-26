import userModel from "../models/user.model.js";
import sessionModel from "../models/session.model.js";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { config } from "../config/config.js";
import jwt from 'jsonwebtoken'


export async function postRegisterUser(req, res, next) {
  try{
    const {username, email, password} = req.body;

    if(!username || !email || !password){
      return res.status(400).json({ message: "All fields are required" })
    }

    const isAlreadyRegistered = await userModel.findOne({
      $or : [
        {username},
        {email}
      ]
    })
    
    if(isAlreadyRegistered){
      return res.status(409).json({message: "User already exists"})
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

     const user = await userModel.create({
      username,
      email,
      password: hashedPassword
    })

    res.status(201).json({
      message: "user registered successfully",
      user:{
        username,
        email
      }
    })
  } catch(err){
    res.status(500).json({
      message: "Internal server error"
    })
  }
}
export async function postLoginUser(req, res, next){
  try{
    const {email, password} = req.body

    if(!email || !password){
      return res.status(400).json({message:"all details are required to log in"});
    }

    const user = await userModel.findOne({email})
       
    if(!user){
      return res.status(400).json({message : "Invalid email or password"})
    }

    const isValidPass = await bcrypt.compare(password, user.password)
   
    if(!isValidPass){
      return res.status(400).json({message: "Invalid email or password"})
    }

    const refreshToken = jwt.sign({id:user._id}, config.REFRESH_TOKEN_SECRET, {expiresIn: '7d'})

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest('hex')

    const session = await sessionModel.create({
      user: user._id,
      refreshTokenHash,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    })

    const accessToken = jwt.sign({id: user._id, sessionId: session._id}, config.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message:"user successfully logged in",
      user:{
        id:user._id,
        username: user.username,
        email: user.email,
        githubUsername: user.githubUsername,
        leetcodeUsername: user.leetcodeUsername
      },
      accessToken
    })
  }
  catch(err){
    return res.status(500).json({message: "internal server error"})
  }

}
export async function getMe(req, res, next){

  const user = req.user
  
  res.status(200).json({
    message:"user successfully fetched",
    user:{
      id: user._id,
      username: user.username,
      email: user.email,
      githubUsername: user.githubUsername,
      leetcodeUsername: user.leetcodeUsername
    }
  })
}
export async function refreshToken(req, res, next){

  try{
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){

      return res.status(401).json({
        message: "refresh Token not found"
      })
    }

    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

    const user = await userModel.findById(decoded.id)
    if(!user){
      return res.status(400).json({message: "User not found"})
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    const session = await sessionModel.findOne({
      refreshTokenHash,
      revoked : false
    }) 

    if(!session){
      return res.status(401).json({message: "invalid refresh token"})
    }

    const accessToken = jwt.sign({id:decoded.id, sessionId:session._id}, config.ACCESS_TOKEN_SECRET, {expiresIn:"15m"})

    const newRefreshToken = jwt.sign({id:decoded.id}, config.REFRESH_TOKEN_SECRET, {expiresIn: "7d"})

    const newRefreshTokenHash = crypto.createHash("sha256").update(newRefreshToken).digest("hex")

    session.refreshTokenHash = newRefreshTokenHash
    await session.save()

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly:true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      message:"token successfully refreshed",
      accessToken
    })
  }
  catch(err){
    return res.status(401).json({message:"Invalid or expired token"})
  }
}
export async function logout(req, res, next){
  try{
    const refreshToken = req.cookies.refreshToken

    if(!refreshToken){
      return res.status(401).json({message:"refresh Token not found"})
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex")

    await sessionModel.findOneAndDelete({
      refreshTokenHash,
      revoked:false
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
    })

    return res.status(200).json({message:"successfully logged out"})
  }
  catch(err){
    return res.status(401).json({message:"invalid refresh token"})
  }

}
export async function logoutAll(req, res, next){
  try{
    const refreshToken = req.cookies.refreshToken
    
    if(!refreshToken){
      return res.status(401).json({message:"refresh Token not found"})
    }

    const decoded = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET)

    await sessionModel.deleteMany({
      user: decoded.id,
      revoked:false
    })

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === "production" ? "none" : "strict",
    })

    return res.status(200).json({message:"successfully logged out"})
    
  }
  catch(err){
    return res.status(401).json({message:"invalid refresh token"})
  }
}