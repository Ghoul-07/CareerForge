import express from "express"

// CONTROLLERS
import { postLoginUser, postRegisterUser, getMe, refreshToken, logout, logoutAll } from '../controllers/auth.controller.js'

// MIDDLEWARES
import { verifyToken } from "../middlewares/auth.middleware.js"


const authRouter = express.Router()

authRouter.post('/register', postRegisterUser)
authRouter.post('/login', postLoginUser)
authRouter.get('/getme', verifyToken, getMe)
authRouter.post('/refresh-token', refreshToken)
authRouter.post('/logout',logout)
authRouter.post('/logout-all', logoutAll)


export default authRouter