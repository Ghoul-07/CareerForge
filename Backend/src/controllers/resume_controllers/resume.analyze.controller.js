import { config } from "../../config/config.js";
import Groq from 'groq-sdk'
import pdfParse from 'pdf-parse-fork'

const groq = new Groq({apiKey: config.GROQ_API_KEY})

export async function analyzeResume(req, res){
  try{
    if(!req.file){
      return res.status(400).json({message:"Please provide resume first"})
    }

    // 1. get the job description

    const { jobDescription } = req.body

    if(!jobDescription){
      return res.status(400).json({message: "Please provide the job description"})
    }

    // 2. extract text from resume

    const pdfData = await pdfParse(req.file.buffer)
    const resumeText = pdfData.text

    // 3. Send to Groq

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages:[
        {
          role:"system",
          content:`You are an expert ATS resume analyzer. Always respond with valid JSON only, no markdown, no extra text`
        },
        {
          role:'user',
          content: `Analyze this resume against the job description and return a JSON object with exactly these fields :
          {
              "atsScore": <number 0-100>,
              "missingSkills": [<list of missing skills>],
              "weakPoints": [<list of weak bullet points from resume>],
              "improvedPoints": [<list of improved versions of weak points>],
              "overallFeedback": "<2-3 lines of general advice>"
            }
            
            Resume: 
            ${resumeText}

            job Description: 
            ${jobDescription}`
        }
      ],
      temperature: 0.3  // lower = more consistent, structered output
    })

    // 4. Parse the response
    const raw = response.choices[0].message.content

    // strip markdown code blocks if present
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    const analysis = JSON.parse(cleaned)
    
    res.status(200).json({message:"Analysis Complete",
      analysis
    })
  }   catch(err){
    console.log(err)
    return res.status(500).json({message:"Internal Server Error"})
  }
}