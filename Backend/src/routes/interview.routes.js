import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js'
import { createInterview , startInterview, answerQuestion, finishInterview, getInterviewSession, getUserInterviews, getInterviewHistory} from '../controllers/interview_controllers/interview.controller.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';


const interviewRouter = express.Router()

interviewRouter.post('/create',  verifyToken , createInterview);
interviewRouter.post('/start/:id', verifyToken, aiLimiter, startInterview);
interviewRouter.post('/answer/:id', verifyToken, aiLimiter, answerQuestion);
interviewRouter.post('/finish/:id', verifyToken, aiLimiter, finishInterview);
interviewRouter.get('/history', verifyToken, getInterviewHistory);

interviewRouter.get('/:id', verifyToken , getInterviewSession)
interviewRouter.get('/', verifyToken, getUserInterviews)


export default interviewRouter
