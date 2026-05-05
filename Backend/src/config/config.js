import dotenv from 'dotenv'
dotenv.config()

if(!process.env.MONGO_URI){
  throw new Error("MONGO_URI is not defined in env");
  
}
if(!process.env.REFRESH_TOKEN_SECRET){
  throw new Error("REFRESH_TOKEN_SECRET is not defined in env")
}
if(!process.env.ACCESS_TOKEN_SECRET){
  throw new Error("ACCESS_TOKEN_SECRET is not defined in env")
}

if(!process.env.NODE_ENV){
  throw new Error("NODE_ENV is not defined in env")
}

if(!process.env.GITHUB_TOKEN){
  throw new Error("GITHUB_TOKEN is not defined in env")
}
if(!process.env.GROQ_API_KEY){
  throw new Error("GROQ_API_KEY is not defined in env")
}
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("CLOUDINARY_CLOUD_NAME is not defined in env");
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("CLOUDINARY_API_KEY is not defined in env");
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error("CLOUDINARY_API_SECRET is not defined in env");
}

export const config = {
  MONGO_URI: process.env.MONGO_URI,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
}

