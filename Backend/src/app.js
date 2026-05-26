import express from "express"
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from "cookie-parser"
import { config } from "./config/config.js"

// ROUTERS
import authRouter from "./routes/auth.routes.js"
import userRouter from "./routes/user.routes.js"
import resumeRouter from "./routes/resume.routes.js"
import interviewRouter from "./routes/interview.routes.js"
import chatbotRouter from "./routes/chatbot.routes.js"

const app = express()

// MIDDLEWARES

app.use(express.json())
app.use(cookieParser())
app.use(cors({
  origin: config.FRONTEND_URL,  // frontend URL
  credentials: true                  // allow cookies
}))
app.use(morgan('dev'))       // logs request


// USINIG ROUTERS
app.use('/api/auth', authRouter)
app.use('/api/user', userRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/interview', interviewRouter)
app.use('/api/chatbot', chatbotRouter)

export default app


