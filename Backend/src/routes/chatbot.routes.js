import express from 'express';
import { askChatbot } from '../controllers/chatbot_controller/chatbot.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';

const chatbotRouter = express.Router()

chatbotRouter.post('/ask', verifyToken, aiLimiter ,askChatbot)

export default chatbotRouter