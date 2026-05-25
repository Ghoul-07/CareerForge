import express from 'express';
import { askChatbot } from '../controllers/chatbot_controller/chatbot.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const chatbotRouter = express.Router()

chatbotRouter.post('/ask', verifyToken, askChatbot)

export default chatbotRouter