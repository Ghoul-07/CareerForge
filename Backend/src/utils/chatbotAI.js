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
    prompt = `
      You are CareerForge's AI career assistant.

      You are given the user's interview data only as background context.

      Interview Data:
      ${JSON.stringify(contextData, null, 2)}

      User Question:
      ${question}

      Instructions:
      - Answer the user's exact question first.
      - Use the interview data only if it is relevant.
      - Do NOT generate a full interview report unless the user explicitly asks for one.
      - If the question is casual or short, respond briefly.
      - If the user asks for improvement advice, provide specific actionable suggestions.
      - If the user asks whether something will work, answer directly.
      - Keep the response under 180 words.
    `;
  }

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    messages:[
      {
        role:'system',
        content:
          "You are CareerForge's career assistant. Answer the user's exact question using context only when helpful.",
      },
      {
        role:"system",
        content: prompt 
      }
    ]
  })

  return completion.choices[0].message.content
}