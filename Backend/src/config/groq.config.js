import Groq from 'groq-sdk'
import { config } from './config.js'

export const groq = new Groq({apiKey: config.GROQ_API_KEY})