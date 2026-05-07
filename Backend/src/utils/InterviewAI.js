import { groq } from "../config/groq.config.js";

function extractJSON(text){
  const cleaned = text.replace(/```json/g, "")
  .replace(/```/g, "").trim()

  return JSON.parse(cleaned)
}

export async function generateInterviewPlan({
  resumeText,
  jobDescription,
  role,
  difficulty,
  interviewType,
  analysisResults
}){
  const prompt = `
  You are an expert technical interviewer.

  Generate a mock interview plan for this candidate.
  
  Candidate resume:
  ${resumeText}

  Job description:
  ${jobDescription}

  role :
  ${role}

  difficulty:
  ${difficulty}

  Interview Type:
  ${interviewType}

  Resume Analysis insights:
  ${JSON.stringify(analysisResults, null,2)}


  Return ONLY valid JSON.

  JSON format:
  {
    "focusAreas" : ['string'],
    "questions" : [
    
      {
        "questions" : "string",
        "category": "technical | hr | project-based | mixed",
        "difficulty": "fresher | intermediate | senior",
        "expectedAnswerPoints": ["string"],
        "whyAsked": "string"
      }
    ]
  }

 
  Rules:
  - Generate exactly 6 questions.
  - Questions must match the requested interview type.
  - Questions must match the requested difficulty.
  - Include project-based questions from the candidate resume.
  - Questions must feel like a real interview.
  - Return ONLY valid JSON.

  `
  const completion = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    temperature: 0.7,
    messages:[
      {
        role: 'system',
        content: "You are an expert technical interviewer who only return valid JSON"
      },
      {
        role: 'user',
        content:prompt
      }
    ]
  })

  const text = completion.choices[0].message.content

  return extractJSON(text)
}
export async function evaluateInterviewAnswer({
  question,
  expectedAnswerPoints,
  whyAsked,
  userAnswer,
  role,
  difficulty,
  interviewType
}){
  const prompt = `
  You are an expert interview evaluator.
  
  Evaluate the candidate's answer.

  Interview context:
  Role : ${role}
  Difficulty: ${difficulty}
  Interview Type : ${interviewType}

  Question: 
  ${question}

  Why was this asked:
  ${whyAsked}
   
  Expected Answer Points:
  ${JSON.stringify(expectedAnswerPoints, null,2)}

  Candidate Answer:
  ${userAnswer}

  Return ONLY valid JSON. No markdown. No explaination.

  JSON format:{
    "score" : number,
    "strengths": ["string"],
    "weaknesses": ["string"],
    "improvedAnswer": "string",
    "followUpQuestion": "string"
  }

  Rules:
- score must be from 1 to 10
- strengths must contain 2-3 points
- weaknesses must contain 2-3 points
- improvedAnswer should be practical and interview-ready
- followUpQuestion should be based on the user's answer
  `

  const completion = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    temperature:0.4,
    messages: [
      {
        role:'system',
        content: 'You are an expert technical interview evaluator. Return only valid JSON'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

  })

  const text = completion.choices[0].message.content
  return extractJSON(text)
}

export async function generateFinalInterviewReport({
  role,
  difficulty,
  interviewType,
  evaluations
}){
  const prompt = `
  You are an expert interview coach.
  
  Generate a final interview performance report based on the candidate's answers and evaluations.

  Interview Context:
  Role: ${role}
  Difficulty: ${difficulty}
  Interview Type : ${interviewType}

  Evaluations:
  ${JSON.stringify(evaluations, null, 2)}
  
  Return ONLY valid JSON. No markdown. No explaination.

  JSON format:{
    "overallScore": number,
    "technicalScore": number,
    "communicationScore": number,
    "strengths": ["string"],
    "weakAreas": ["string"],
    "recommendedTopics": ["string"],
    "finalVerdict": "string"
  }

  Rules:
  - Scores must be from 1 to 10.
  - overallScore should reflect total performance.
  - technicalScore should reflect correctness, depth, and technical clarity.
  - communicationScore should reflect explanation quality and structure.
  - strengths should contain 3-5 clear points.
  - weakAreas should contain 3-5 clear points.
  - recommendedTopics should contain 3-6 practical study topics.
  - finalVerdict should be concise but useful.
  - Be honest but encouraging.
  `;
  
  const completion = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    messages:[
      {
        role:'system',
        content:'You are an expert interview coach. Return only valid JSON.'
      },
      {
        role:'user',
        content: prompt
      }
    ]
  })

  const text = completion.choices[0].message.content
  return extractJSON(text)

}