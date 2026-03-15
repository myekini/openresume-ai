# OpenResume AI

OpenResume AI is a precision-driven, AI-powered resume editor. It extracts your existing resume (DOCX or PDF), allows you to review AI-suggested surgical bullet improvements based on target job descriptions, and finally exports an ATS-friendly standalone PDF. 

## Technical Architecture

The architecture relies on a **Typescript Frontend** coupled with two distinct backend branches, exposing identical API contracts:

### 1. `main` branch (LangGraph.js)
The default shipped branch using **Node.js**:
- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, Zustand.
- **Backend:** Next.js API Routes, Vercel AI SDK, LangGraph.js

### 2. `dev/muhammad` branch (FastAPI + Python LangGraph)
The Python backend variant using **FastAPI**:
- **Frontend:** Identical to `main`.
- **Backend:** FastAPI, Python LangGraph, Pydantic v2, sse-starlette, Anthropic Python SDK.

## Core Features
1. **Intelligent Parsing**: Extracts structural AST from PDF and DOCX files without hallucinating content (`mammoth` and `pdfplumber`).
2. **Surgical AI Editing**: The AI acts purely as an editor, modifying strictly the description `bullets[]` while keeping structural schema (dates, roles, location) completely locked to preserve truthfulness.
3. **Local Privacy Mode**: Run locally entirely on your own device using Ollama. (In development)
4. **ATS-Ready PDF Export**: Lossless rendering of structured data cleanly generated via `tectonic` / LaTeX template pipelines. 

## Running locally

### 1. The Frontend
Ensure Node/npm is installed.
```bash
cd frontend
npm install
npm run dev
```

### 2. The Python Backend (running from dev/muhammad branch)
Ensure Python 3.12+ is installed.
```bash
cd backend-py
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

> Remember to duplicate `backend-py/.env.example` as `backend-py/.env` and insert your API keys.

---
*Built with modern software engineering practices, prioritizing UX clarity, explicit system states, and safe AI delegation.*
