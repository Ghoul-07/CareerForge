import express from 'express'
import { analyzeResume } from '../controllers/resume_controllers/resume.analyze.controller.js'
import { verifyToken} from '../middlewares/auth.middleware.js'
import upload from '../middlewares//multer.config.js'

const resumeRouter = express.Router()

resumeRouter.post('/analyze', verifyToken, upload.single('resume'), analyzeResume)

export default resumeRouter