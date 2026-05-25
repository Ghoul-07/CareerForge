import Groq from 'groq-sdk'
import {config} from '../config/config.js'

const groq = new Groq({
  apiKey: config.GROQ_API_KEY
})

function extractJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("Invalid JSON response");
    }

    return JSON.parse(match[0]);
  }
}

export async function askCareerAssistant({
  contextType,
  contextData,
  question
}){
  let prompt=""

  if(contextType === 'resume'){
    prompt=`
      You are an expert career coach and resume mentor.
      The user has completed a resume analysis.

      Resume Analysis Data:
      ${JSON.stringify(contextData, null, 2)}

      User Question:
      ${question}

      Instructions:
      - Give practical advice
      - Be specific and actionable
      - Explain weak areas clearly
      - Suggest improvements for resume and interview preparation
      - Keep response concise but helpful
    `;
  }

  else if(contextType === 'interview'){
    prompt=`
      You are an expert technical interview coach.
      The user has completed an AI mock interview.

      Interview Data:
      ${JSON.stringify(contextData, null, 2)}

      User Question:
      ${question}

      Instructions:
      - Analyze interview performance carefully
      - Explain mistakes clearly
      - Suggest how to improve answers
      - Recommend study topics if needed
      - Be supportive but honest
      - Keep response structured and actionable
    `
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    messages:[
      {
        role:'system',
        content:
          "You are an expert career coach and interview mentor"
      },
      {
        role:"system",
        content: prompt 
      }
    ]
  })

  return completion.choices[0].message.content
}