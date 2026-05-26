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

function isRateLimitError(err) {
  return err?.status === 429 || err?.error?.error?.code === "rate_limit_exceeded";
}

export async function askCareerAssistant({
  contextType,
  contextData,
  question
}){
  let prompt=""

  if(contextType === 'resume'){
    const optimizedResumeContext = {
      results: contextData.results?.map((result) => ({
        atsScore: result.atsScore,
        missingSkills: result.missingSkills,
        weakPoints: result.weakPoints,
        improvedPoints: result.improvedPoints,
        overallFeedback: result.overallFeedback,
        difficulty: result.difficulty,
      })),
    };
    prompt=`
      You are an expert career coach and resume mentor.
      The user has completed a resume analysis.

      Resume Analysis Data:
      ${JSON.stringify(optimizedResumeContext, null, 2)}

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
    const optimizedInterviewContext = {
        role: contextData.role,
        difficulty: contextData.difficulty,
        interviewType: contextData.interviewType,

        finalReport: {
          overallScore: contextData.finalReport?.overallScore,
          technicalScore: contextData.finalReport?.technicalScore,
          communicationScore: contextData.finalReport?.communicationScore,
          strengths: contextData.finalReport?.strengths,
          weakAreas: contextData.finalReport?.weakAreas,
          recommendedTopics: contextData.finalReport?.recommendedTopics,
          finalVerdict: contextData.finalReport?.finalVerdict,
        },
      };
    prompt = `
      You are CareerForge's AI career assistant.

      You are given the user's interview data only as background context.

      

      Interview Data:
      ${JSON.stringify(optimizedInterviewContext, null, 2)}

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
  try{
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
      messages:[
        {
          role:'system',
          content: `
            You are CareerForge's professional but friendly AI career coach.

            Guidelines:
            - Be supportive and conversational.
            - Be polite and encouraging.
            - Do not mimic slang aggressively.
            - Maintain a mentor-like tone.
            - Do NOT force interview analysis into every response.
            - Only discuss interview feedback when relevant to the user's question.
            `,
        },
        {
          role:"system",
          content: prompt 
        }
      ]
    })

    return completion.choices[0].message.content
  } catch(err){
    if(isRateLimitError(err)){
      const error = new Error("AI usage limit reached. Please try again after some time.")
      error.statusCode = 429
      throw error
    }

    throw err
  }
}