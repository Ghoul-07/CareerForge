import express from 'express'
import {verifyToken} from '../middlewares/auth.middleware.js'
import { storeUserProfiles } from '../controllers/user_controllers/onboarding.controller.js'
import { getDashboard } from '../controllers/user_controllers/dashboard.controller.js'

const userRouter = express.Router()

userRouter.post('/onboarding', verifyToken ,storeUserProfiles)
userRouter.get('/dashboard', verifyToken ,getDashboard)


export default userRouter