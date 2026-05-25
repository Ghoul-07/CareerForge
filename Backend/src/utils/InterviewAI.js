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
    You are an expert interview coach.

    Generate a mock interview plan for this candidate.

    Candidate resume:
    ${resumeText}

    Job description:
    ${jobDescription}

    Role:
    ${role}

    Difficulty:
    ${difficulty}

    Selected interview type:
    ${interviewType}

    Resume analysis insights:
    ${JSON.stringify(analysisResults, null, 2)}

    Interview Type Rules:
    - If interviewType is "technical", generate only technical/backend/coding/system/API/database questions.
    - If interviewType is "hr", generate only HR and behavioral questions. Do NOT ask technical implementation questions.
    - If interviewType is "project-based", generate only questions about the candidate's projects, architecture, challenges, debugging, decisions, and tradeoffs.
    - If interviewType is "mixed", generate a balanced mix of technical, HR, and project-based questions.

    Difficulty Rules:
    - If difficulty is "fresher", ask beginner-friendly questions focused on fundamentals and basic project explanation.
    - If difficulty is "intermediate", ask deeper questions involving design choices, debugging, APIs, databases, and tradeoffs.
    - If difficulty is "senior", ask advanced system design, scalability, architecture, ownership, and leadership-style questions.

    Return ONLY valid JSON. No markdown. No explanation.

    JSON format:
    {
      "focusAreas": ["string"],
      "questions": [
        {
          "question": "string",
          "category": "technical | hr | project-based",
          "difficulty": "fresher | intermediate | senior",
          "expectedAnswerPoints": ["string"],
          "whyAsked": "string"
        }
      ]
    }

    Rules:
    - Generate exactly 6 questions.
    - Every question must strictly follow the selected interview type.
    - Every question must match the requested difficulty.
    - For "hr", avoid code, implementation, database, API, or architecture questions.
    - For "technical", avoid personal/behavioral HR questions.
    - For "project-based", focus only on the candidate's resume projects and implementation decisions.
    - For "mixed", include 2 technical, 2 project-based, and 2 HR questions.
    - Questions must feel like a real interview.
    `;
  const completion = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    temperature: 0.7,
    messages:[
      {
        role: 'system',
        content: "You are an expert interview coach who creates questions based on the requested interview type. Return only valid JSON."
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
    Interview Type: ${interviewType}

    Evaluations:
    ${JSON.stringify(evaluations, null, 2)}

    Return ONLY valid JSON. No markdown. No explanation.

    JSON format:
    {
      "overallScore": number,
      "technicalScore": number,
      "communicationScore": number,
      "strengths": ["string"],
      "weakAreas": ["string"],
      "recommendedTopics": ["string"],
      "finalVerdict": "string"
    }

    Score Meaning Rules:
    - If interviewType is "technical":
      technicalScore means technical correctness, implementation depth, backend/API/database/system understanding.
      communicationScore means clarity, structure, and explanation quality.

    - If interviewType is "hr":
      technicalScore means role readiness, professionalism, maturity, and workplace judgment. It does NOT mean coding ability.
      communicationScore means confidence, clarity, behavioral storytelling, and ability to explain experiences using examples.

    - If interviewType is "project-based":
      technicalScore means project depth, architecture understanding, tradeoffs, debugging, implementation decisions, and ownership.
      communicationScore means ability to explain the project clearly and convincingly.

    - If interviewType is "mixed":
      technicalScore means combined technical and project depth.
      communicationScore means clarity, behavioral readiness, and explanation quality.

    Rules:
    - Scores must be from 1 to 10.
    - overallScore should reflect total performance.
    - strengths should contain 3-5 clear points.
    - weakAreas should contain 3-5 clear points.
    - recommendedTopics should contain 3-6 practical study topics.
    - finalVerdict should be concise but useful.
    - Be honest but encouraging.
    - For HR interviews, do not mention coding, APIs, databases, or technical implementation unless the candidate discussed them directly.
    - For HR interviews, focus feedback on confidence, clarity, examples, behavioral framing, professionalism, and role readiness.
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