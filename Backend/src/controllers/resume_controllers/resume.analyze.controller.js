import { config } from "../../config/config.js";
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse-fork'
import resumeAnalysisModel from "../../models/resumeAnalysis.model.js";

const groq = new Groq({apiKey: config.GROQ_API_KEY})

async function analyzeOneJD(resumeText, jobDescription){
  const response = await groq.chat.completions.create({
    model:'llama-3.3-70b-versatile',
    messages:[{
      role:'system',
      content: `You are an expert ATS resume analyer.Always respond with valid JSON only, no markdown, no extra text`
    }, {
      role:'user',
      content: `Analyze this resume against the job description and return a JSON object with exactly these fields:
      {
        "atsScore": <number 0-100>,
        "difficulty": <"Junior" | "Mid" | "Senior">,  
        "missingSkills": [<list of missing skills>],
        "weakPoints": [<list of weak bullet points from resume>],
        "improvedPoints": [<list of improved versions of weak points>],
        "overallFeedback": "<2-3 lines of general advice>"
      }

      Resume:
      ${resumeText}

      Job Description:
      ${jobDescription}`
    }],
    temperature: 0.3
  })

  const raw = response.choices[0].message.content
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)

}

export async function analyzeResume(req, res){
  try{
    if(!req.file){
      return res.status(400).json({message:"Please provide resume first"})
    }

    // 1. get the job description

    const { jobDescriptions } = req.body

    if(!jobDescriptions){
      return res.status(400).json({message: "Please provide atleast one job description"})
    }

    const jdArray = JSON.parse(jobDescriptions)

    if(!jdArray.length){
      return res.status(400).json({message:"Please provide atleast one job description"})
    }

    // 2. extract text from resume

    const pdfData = await pdfParse(req.file.buffer)
    const resumeText = pdfData.text

    // 3. analyze all JDs in parallel

    const analyses = await Promise.all(
      jdArray.map(async(jd) =>{
        const analysis = await analyzeOneJD(resumeText, jd)
        return {
          jobDescription: jd,
          difficulty: analysis.difficulty,
          atsScore: analysis.atsScore,
          missingSkills: analysis.missingSkills,
          weakPoints: analysis.weakPoints,
          improvedPoints: analysis.improvedPoints,
          overallFeedback: analysis.overallFeedback
        }
      })
    )

    analyses.sort((a, b) => b.atsScore - a.atsScore)

    // save to database

    const session = await resumeAnalysisModel.create({
      user: req.user._id,
      results: analyses
    })
    
    res.status(200).json({
      message:"Analysis Complete",
      sessionId: session._id,
      results: analyses
    })
  }   catch(err){
    console.log(err)
    return res.status(500).json({message:"Internal Server Error"})
  }
}