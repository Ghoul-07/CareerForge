import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import userModel from '../models/user.model.js'

export async function verifyToken(req, res, next){
  try{
    
    const accessToken = req.headers.authorization?.split(" ")[1]

    if(!accessToken){
      return res.status(401).json({message: "Access Token is missing"})
    }

    const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET)
  
    const user = await userModel.findById(decoded.id).select("-password")

    if(!user){
      return res.status(400).json({message: "User not found"})
    }
    req.user = user

    next()
  }
  catch(err){
    return res.status(401).json({message: "User is unauthorized"})
  }

}