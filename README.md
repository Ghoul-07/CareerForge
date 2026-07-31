# CareerForge

AI-powered resume analysis and mock interview preparation platform built using the MERN stack.

## Live Demo

* Frontend: [https://career-forge-two.vercel.app/](https://career-forge-two.vercel.app/)
* Backend: Deployed on Render

---

# Features

## Authentication & Security

* JWT-based authentication
* Refresh token rotation
* Protected routes
* Persistent login sessions
* API rate limiting for AI endpoints
* Secure httpOnly cookies

## Resume Analysis

* Upload resumes using PDF support
* ATS-style resume analysis against job descriptions
* AI-generated feedback and improvement suggestions
* Resume history tracking
* Cloudinary-based resume storage

## AI Mock Interviews

* AI-generated interview plans
* Multiple interview types:

  * Technical
  * HR
  * Project-based
  * Mixed
* Difficulty levels:

  * Fresher
  * Intermediate
  * Senior
* Dynamic question generation using LLMs
* AI answer evaluation
* Final interview performance reports
* Resumable interview sessions
* Interview history tracking

## Dashboard Analytics

* Interview performance trends
* Weak area analytics
* ATS score tracking
* Resume session statistics
* GitHub and LeetCode profile integration

## AI Career Assistant

* Context-aware chatbot
* Personalized suggestions based on:

  * Resume analyses
  * Interview reports
* Persistent local chat history
* Optimized token usage

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Axios
* React Router
* Recharts

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* Express Rate Limit

## AI & APIs

* Groq API
* GitHub REST API
* LeetCode GraphQL API

## Cloud & Deployment

* Vercel
* Render
* Cloudinary
* MongoDB Atlas

---

# Architecture Highlights

* Refresh token rotation with session persistence
* AI workflow orchestration for interview generation and evaluation
* Context-aware chatbot system
* Production-ready cookie and CORS handling
* Resume and interview analytics pipeline
* Persistent interview session tracking

---

# Environment Variables

## Backend (.env)

```env
MONGO_URI=

REFRESH_TOKEN_SECRET=
ACCESS_TOKEN_SECRET=

NODE_ENV=

GITHUB_TOKEN=
GROQ_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

FRONTEND_URL=
```

## Frontend (.env)

```env
VITE_BACKEND_URL=
```

---

# Local Setup

## Clone repository

```bash
git clone https://github.com/Ghoul-07/CareerForge.git
```

---

## Backend Setup

```bash
cd Backend
npm install
npm run dev
```

---

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

---

# Future Improvements

* Database-backed chat history
* Real-time collaborative interview rooms
* Advanced AI resume parsing
* Voice-based mock interviews
* Email notifications and reminders
* Mobile optimization

---

# Author

Vedant Chaturvedi

* GitHub: [https://github.com/Ghoul-07](https://github.com/Ghoul-07)
* LeetCode: [https://leetcode.com/u/vedant_chaturvedi/](https://leetcode.com/u/vedant_chaturvedi/)
