# ResumeAI - Premium AI Resume Analyzer & ATS Optimizer

ResumeAI is a beautiful, modern, full-stack web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). Using advanced **Retrieval-Augmented Generation (RAG)** and **Gemini 1.5 Flash**, the system parses PDF resumes, compares them against target job descriptions, evaluates ATS compatibility, identifies critical skill gaps, and suggests actionable bullet re-writes. Users can also chat in real-time with an AI Career Coach trained directly on their specific resume content!

---

## Key Features

- **ATS Optimization Score**: Visual SVG dials measuring document structure, formatting readability, and semantic clarity.
- **Job Description Matcher**: Cosine Similarity matching showing percentage alignments with target roles.
- **Skill Gaps Matrix**: Color-coded emerald matching list vs. glowing crimson priority missing skill trackers.
- **Interactive Guide Checklist**: Multi-step optimization tasks that you can dynamically check off as you refine your text.
- **RAG-Powered Career Chatbot**: Real-time Q&A sidebar featuring context retrieval and citation drawers showing exact source chunks.
- **Premium Dark Mode**: Seamlessly toggled HSL tailored dark-to-light modes.
- **Downloadable Vector PDF Reports**: Beautiful vector-perfect reports using browser native engines with zero blur.

---

## Tech Stack

- **Frontend**: Vite + React, Tailwind CSS v3, Lucide Icons, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Multer, `pdf-parse`.
- **AI & Embedding Engine**: Official `@google/generative-ai` SDK (`text-embedding-004` & `gemini-1.5-flash`).
- **RAG Architecture**: Highly resilient JS-native Cosine Similarity vector database calculation for chunk search.

---

## Local Setup Instructions

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Running locally or MongoDB Atlas connection string)
- **Gemini API Key** (Get a free API key from [Google AI Studio](https://aistudio.google.com/))

---

### 2. Backend Installation & Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/resume-analyzer
   JWT_SECRET=your_custom_jwt_secret_key_here
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the backend developer server:
   ```bash
   npm run dev
   ```
   *The backend will boot up at `http://localhost:5000`.*

---

### 3. Frontend Installation & Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Verify or create a `.env` file containing the backend URL:
   ```bash
   VITE_API_URL=http://localhost:5000/api
   ```

3. Install dependencies (handles React 19 peer constraints safely):
   ```bash
   npm install --legacy-peer-deps
   ```

4. Launch the frontend developer dev server:
   ```bash
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173`.*

---

## Production Deployments Guide

### Backend Deployment (Render)

Render is excellent for hosting Node/Express API backends with MongoDB integration.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Link your GitHub repository.
4. Select the path pointing to the backend subdirectory:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under the **Environment** tab, click **Add Environment Variable** and define:
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string*
   - `JWT_SECRET`: *Your JWT encryption password*
   - `GEMINI_API_KEY`: *Your Google AI Studio Gemini API Key*
6. Click **Deploy Web Service**. Render will assign a public URL (e.g. `https://your-app-backend.onrender.com`).

---

### Frontend Deployment (Vercel)

Vercel is optimized for blazing-fast React static sites.

1. Install Vercel CLI globally or deploy directly using the [Vercel Dashboard](https://vercel.com/).
2. Create a new project pointing to your GitHub repository.
3. Configure the directory settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the frontend environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-app-backend.onrender.com/api` *(Point to your Render backend URL)*
5. Click **Deploy**. Vercel will build your assets and generate a production URL!

---

## Code Architecture (MVC)

```text
├── backend/
│   ├── config/          # Database connections
│   ├── controllers/     # MVC controller handlers (Auth, Resume processing, RAG search)
│   ├── middleware/      # Auth (JWT parsing) & file upload limits
│   ├── models/          # Mongoose schemas (User records, Resumes, Text Chunks)
│   ├── routes/          # Express route bindings
│   └── services/        # Gemini API connectors, Chunking logic, embeddings
└── frontend/
    └── src/
        ├── components/  # Uploader, Gauges, Improvement lists, AI Chat sidebar
        ├── context/     # Auth Context (JWT session) & class Theme switches
        └── services/    # Axios client instances
```

Enjoy grading and optimizing your resume with AI! 🚀

demo video:"C:\Users\DELL\Videos\Screen Recordings\Screen Recording 2026-05-24 122347.mp4"

