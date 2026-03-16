<div align="center">

# OpenResume AI

**AI-powered resume editor that makes surgical, explainable edits — never rewrites your story.**

[![License: MIT](https://img.shields.io/badge/License-MIT-00e5a0.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.12-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Python_%26_JS-blueviolet)](https://langchain-ai.github.io/langgraph)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Live Demo](#) · [Report Bug](https://github.com/myekini/openresume-ai/issues) · [Request Feature](https://github.com/myekini/openresume-ai/issues)

</div>

---

## What is this?

OpenResume AI parses your resume (PDF or DOCX) into a structured AST, runs a LangGraph agent against a target job description, and surfaces a set of **edit cards** — each proposing a single bullet improvement with a plain-English reason. You accept or revert each one. The agent never touches dates, org names, structure, or anything you didn't ask it to change.

The result is a clean, ATS-optimized PDF — exported via LaTeX — that still sounds exactly like you.

```
Upload resume → Paste JD → Review AI edit cards → Accept / Revert → Export PDF
```

---

## Two Branches, One Contract

This repo ships two production backends behind an identical API surface. The frontend is **shared and unchanged** across both.

| | `main` | `dev/muhammad` |
|---|---|---|
| **Backend language** | TypeScript (Node.js) | Python 3.12 |
| **Agent framework** | LangGraph.js | LangGraph Python |
| **API layer** | Express.js | FastAPI + Uvicorn |
| **Streaming** | Vercel AI SDK (SSE) | sse-starlette (SSE) |
| **Hosting target** | Vercel | Railway / Render / Fly.io |
| **Frontend** | Next.js 15 — identical | Next.js 15 — identical |

The frontend points to whichever backend is running via a single env var:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3000   # main  (Node.js)
NEXT_PUBLIC_API_URL=http://localhost:8000   # dev/muhammad (Python)
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  BROWSER  (TypeScript)                   │
│                                                         │
│   ┌──────────────────┐      ┌────────────────────────┐  │
│   │   CHAT PANEL     │      │   CANVAS (live resume) │  │
│   │   35% width      │◄────►│   65% width            │  │
│   │   Zustand store  │      │   Edit card overlay    │  │
│   └────────┬─────────┘      └──────────┬─────────────┘  │
└────────────┼─────────────────────────── ┼───────────────┘
             │  HTTP / SSE                │  Zustand state
┌────────────▼────────────────────────────────────────────┐
│                    BACKEND  (two impls, one contract)    │
│                                                         │
│  POST /parse          multipart → ResumeAST JSON        │
│  POST /agent          AgentRequest → SSE stream         │
│  POST /agent/resume   patch decisions → SSE stream      │
│  POST /export         {ast, template} → PDF bytes       │
│  GET  /versions/:id   → version list / snapshot         │
└──────────────────────────────┬──────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────┐
│                       DATA LAYER                         │
│  Supabase  — Postgres (resume AST, versions)            │
│  Redis     — rate limiting, session metadata            │
└──────────────────────────────┬──────────────────────────┘
                               │
               ┌───────────────▼──────────────┐
               │          LLM BACKENDS        │
               │  Claude 3.5 Sonnet (default) │
               │  GPT-4o                      │
               │  Gemini 1.5 Pro              │
               │  Ollama  (local / private)   │
               └──────────────────────────────┘
```

---

## Repository Structure

```
openresume-ai/
│
├── frontend/                         # Next.js 15 — shared by both branches
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── onboarding/           # Upload → Extract → Template → Align
│   │   │   ├── canvas/               # Main editor (chat + resume canvas)
│   │   │   └── settings/             # AI model config, account
│   │   ├── components/
│   │   │   ├── canvas/               # ResumeCanvas, ChatPanel, VersionHistory
│   │   │   ├── onboarding/           # Step components
│   │   │   ├── landing/              # Hero, Features, HeroMockup
│   │   │   ├── settings/             # AIModels, Account settings panels
│   │   │   ├── shared/               # Navbar, Footer
│   │   │   └── ui/                   # Button, Badge, Input, Toggle primitives
│   │   └── store/
│   │       └── useResumeStore.ts     # Zustand — global edit card + UI state
│   ├── .env.example
│   └── package.json
│
├── backend/                          # main branch — Node.js + LangGraph.js
│   ├── src/
│   │   ├── index.ts                  # Express entry point
│   │   ├── agent/
│   │   │   ├── state.ts              # AgentState, EditPatch types
│   │   │   ├── nodes.ts              # parse_jd, analyze_gaps, generate_edits
│   │   │   └── graph.ts              # LangGraph StateGraph + checkpointer
│   │   └── routes/
│   │       ├── parse.ts              # POST /parse
│   │       ├── agent.ts              # POST /agent, POST /agent/resume
│   │       ├── export.ts             # POST /export
│   │       └── versions.ts           # GET|POST /versions
│   └── package.json
│
└── backend-py/                       # dev/muhammad branch — FastAPI + Python
    ├── main.py                       # FastAPI entry point + CORS
    ├── agent/
    │   ├── state.py                  # Pydantic: ResumeAST, EditPatch, AgentState
    │   ├── nodes.py                  # parse_jd, analyze_gaps, generate_edits, apply
    │   └── graph.py                  # LangGraph StateGraph + MemorySaver
    ├── parsers/
    │   ├── docx_parser.py            # mammoth → raw text → LLM → ResumeAST
    │   └── pdf_parser.py             # pdfplumber → raw text → LLM → ResumeAST
    ├── routes/
    │   ├── parse.py                  # POST /parse
    │   ├── agent.py                  # POST /agent, POST /agent/resume (SSE)
    │   ├── export.py                 # POST /export → PDF bytes
    │   └── versions.py               # GET|POST /versions
    ├── export/
    │   └── latex.py                  # Jinja2 → .tex → tectonic → PDF
    ├── templates/
    │   └── clean/main.tex            # LaTeX resume template
    ├── requirements.txt
    ├── Dockerfile
    └── .env.example
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+ *(dev/muhammad branch only)*
- An [Anthropic API key](https://console.anthropic.com) *(or OpenAI / Ollama)*

### 1. Clone and pick your branch

```bash
# Full-stack TypeScript (main)
git clone https://github.com/myekini/openresume-ai.git
cd openresume-ai

# Python backend variant
git checkout dev/muhammad
```

### 2. Frontend (both branches)

```bash
cd frontend
cp .env.example .env.local       # then edit NEXT_PUBLIC_API_URL
npm install
npm run dev                       # http://localhost:3000
```

### 3a. Node.js Backend (`main`)

```bash
cd backend
cp .env.example .env              # add ANTHROPIC_API_KEY
npm install
npm run dev                       # http://localhost:3001
```

### 3b. Python Backend (`dev/muhammad`)

```bash
cd backend-py
python -m venv .venv
source .venv/bin/activate         # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # add ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

---

## API Reference

Both backends expose identical endpoints. The frontend calls these via `NEXT_PUBLIC_API_URL`.

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| `POST` | `/parse` | `multipart/form-data` — `.pdf` or `.docx` | `ResumeAST` JSON |
| `POST` | `/agent` | `AgentRequest` JSON | SSE stream |
| `POST` | `/agent/resume` | `ResumeRequest` JSON (patch decisions) | SSE stream |
| `POST` | `/export` | `{ ast: ResumeAST, template_id: string }` | `application/pdf` bytes |
| `POST` | `/versions` | `VersionRecord` JSON | `{ id: string }` |
| `GET` | `/versions/:user_id` | — | `VersionSummary[]` |
| `GET` | `/versions/detail/:id` | — | Full version with AST snapshot |

### SSE Event Types

The `/agent` endpoint streams the following events:

```
event: token          data: { "text": "..." }           # LLM reasoning tokens
event: edits_ready    data: EditPatch[]                  # patches ready for review
event: checkpoint     data: {}                           # graph paused, awaiting user
event: ast_updated    data: ResumeAST                   # edits applied, AST refreshed
event: done           data: {}                           # stream closed
```

### Core Data Model

```typescript
// Shared contract — TypeScript (backend/) and Pydantic (backend-py/)

interface ResumeAST {
  meta: ResumeMeta;
  sections: ResumeSection[];
}

interface EditPatch {
  item_id: string;
  section_title: string;
  original: string;       // exact bullet being replaced
  proposed: string;       // AI's suggested version
  reason: string;         // shown to user — always present
  note?: string;          // shown if AI added a placeholder (e.g. a %)
  status: "pending" | "accepted" | "reverted";
}
```

> **Constraint:** The AI is only permitted to modify `bullets[]` inside a `ResumeItem`. Dates, org names, roles, and structure are immutable. This is enforced at the agent prompt level and the `apply_approved` graph node.

---

## Tech Stack

### Frontend

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme inline` tokens) |
| State | Zustand |
| UI Primitives | Custom — Button, Badge, Input, Toggle |
| Icons | Lucide React |

### Backend — `main` (Node.js)

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20 |
| API | Express.js |
| Agent | LangGraph.js |
| Streaming | SSE via `express` |
| LLM | Anthropic SDK (`@langchain/anthropic`) |
| Parsing | mammoth (DOCX), pdf-parse (PDF) |
| Validation | Zod |

### Backend — `dev/muhammad` (Python)

| Layer | Choice |
|-------|--------|
| Runtime | Python 3.12 |
| API | FastAPI + Uvicorn |
| Agent | LangGraph Python |
| Streaming | sse-starlette |
| LLM | Anthropic Python SDK |
| Parsing | mammoth (DOCX), pdfplumber (PDF) |
| Validation | Pydantic v2 |
| Export | Jinja2 → tectonic (LaTeX) |

### Infrastructure (both)

| Layer | Choice |
|-------|--------|
| Auth | Clerk |
| Database | Supabase (Postgres) |
| File Storage | Supabase Storage |
| Rate Limiting | Redis (Upstash) |
| Frontend Hosting | Vercel |
| Python Hosting | Railway / Render / Fly.io |

---

## Environment Variables

### `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000    # point to whichever backend is running
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### `backend-py/.env`

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...                        # optional
OLLAMA_BASE_URL=http://localhost:11434       # optional, local models
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://...
```

---

## Design Principles

**1. The AI is an editor, not an author.**
It proposes changes to individual bullets. It does not rewrite sections, invent experience, or alter the structure of your resume.

**2. Every edit is explainable.**
Each `EditPatch` carries a `reason` field shown directly in the UI. The user always knows why a change was suggested.

**3. Human in the loop.**
The LangGraph agent pauses at a `human_review` checkpoint after generating patches. Nothing is applied to the resume AST until the user explicitly accepts each card.

**4. Privacy mode is a first-class feature.**
Ollama integration allows the entire pipeline to run locally. No resume data leaves the machine.

---

## Roadmap

- [x] Frontend — landing, onboarding, canvas, settings
- [x] Python backend scaffold — FastAPI, LangGraph, parsers, export
- [ ] `/parse` endpoint — DOCX + PDF → ResumeAST
- [ ] `/agent` endpoint — single-turn edit suggestions
- [ ] SSE streaming on `/agent`
- [ ] LangGraph multi-node agent with `interrupt` / resume
- [ ] LaTeX export via tectonic
- [ ] Supabase — AST persistence and version history
- [ ] Ollama local model support
- [ ] Clerk authentication + JWT validation in FastAPI
- [ ] Docker Compose for local full-stack dev

---

## Contributing

Contributions are welcome. Please open an issue before submitting a large PR.

```bash
# Fork → clone your fork
git clone https://github.com/YOUR_USERNAME/openresume-ai.git

# Create a feature branch off the correct base
git checkout -b feat/your-feature main          # for Node.js changes
git checkout -b feat/your-feature dev/muhammad  # for Python changes

# Make changes, then open a PR against the correct base branch
```

**Branch targeting:**
- Changes to `frontend/` → PR against `main`
- Changes to `backend/` → PR against `main`
- Changes to `backend-py/` → PR against `dev/muhammad`

---

## License

MIT © [Muhammad Yekini](https://github.com/myekini)

---

<div align="center">
<sub>Built with Next.js, FastAPI, and LangGraph · TypeScript frontend, Python AI backend</sub>
</div>
