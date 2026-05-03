import { config } from "./src/config/config.js";

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: config.GROQ_API_KEY });

async function test() {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: "Say hello in one sentence" }],
  });
  console.log(response.choices[0].message.content);
}

test();
