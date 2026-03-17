<div align="center">

# OpenResume AI

**AI-powered resume editor — surgical, explainable edits, human always in control.**

[![License: MIT](https://img.shields.io/badge/License-MIT-00e5a0.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python&logoColor=white)](https://python.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-JS_%26_Python-blueviolet)](https://langchain-ai.github.io/langgraph)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Report Bug](https://github.com/myekini/openresume-ai/issues) · [Request Feature](https://github.com/myekini/openresume-ai/issues) · [Contributing Guide](CONTRIBUTING.md)

</div>

---

## What is this?

OpenResume AI parses your resume (PDF or DOCX) into a structured AST, runs a multi-node LangGraph agent against a target job description, and surfaces **edit cards** — each one proposing a single bullet improvement with a plain-English reason.

You accept or revert each edit individually. The agent **never touches dates, org names, role titles, or structure**. When you're done, it exports a clean, ATS-optimized PDF via LaTeX that still sounds exactly like you.

```
Upload resume  →  Paste JD  →  Review AI edit cards  →  Accept / Revert  →  Export PDF
```

---

## Core Principles

**The AI is an editor, not an author.**
It proposes changes to individual bullet points only. It cannot rewrite sections, invent experience, or alter structure.

**Every edit is explainable.**
Each `EditPatch` carries a `reason` field rendered directly in the UI. The user always sees *why* a change was suggested before deciding.

**Human-in-the-loop is mandatory, not optional.**
The LangGraph agent pauses at a `humanReview` checkpoint after generating patches. Nothing is written to the resume AST until the user explicitly accepts each card.

**Privacy mode is a first-class feature.**
Ollama integration runs the entire pipeline locally. No resume data leaves the machine.

---

## How the Agent Works

This is the most important part of the system. The LangGraph graph has 5 nodes:

```
                    ┌─────────────────────────────────────────────────────┐
  POST /agent       │                   LANGGRAPH AGENT                   │
  ─────────────►    │                                                     │
                    │   ┌──────────┐    ┌─────────────┐    ┌──────────┐  │
  {                 │   │ parseJd  │───►│ analyzeGaps │───►│ generate │  │
    session_id,     │   │          │    │             │    │  Edits   │  │
    resume_ast,     │   │ Extract  │    │ Find gaps   │    │          │  │
    jd_text         │   │ skills,  │    │ between     │    │ Produce  │  │
  }                 │   │ tone,    │    │ resume and  │    │ EditPatch│  │
                    │   │ keywords │    │ JD reqs     │    │ array    │  │
                    │   └──────────┘    └─────────────┘    └────┬─────┘  │
                    │                                           │         │
  ◄─────────────    │   event: edits_ready        ◄────────────┘         │
  SSE stream        │                                                     │
                    │                    ── INTERRUPT ──                  │
                    │            (graph serialised to MemorySaver)        │
                    └─────────────────────────────────────────────────────┘

  [User reviews edit cards in browser — accept / revert each one]

                    ┌─────────────────────────────────────────────────────┐
  POST /agent       │                   LANGGRAPH AGENT                   │
  /resume           │         (resumes from saved checkpoint)             │
  ─────────────►    │                                                     │
                    │   ┌──────────────┐    ┌─────────────────────────┐  │
  {                 │   │ humanReview  │───►│     applyApproved       │  │
    session_id,     │   │              │    │                         │  │
    approved_       │   │ Receives     │    │ Mutates bullets[] only  │  │
    patches         │   │ patch        │    │ for accepted patches    │  │
  }                 │   │ decisions    │    │ Discards reverted ones  │  │
                    │   └──────────────┘    └────────────┬────────────┘  │
                    │                                    │                │
  ◄─────────────    │   event: ast_updated  ◄────────────┘               │
  SSE stream        │                                                     │
                    └─────────────────────────────────────────────────────┘
```

The `session_id` is the LangGraph `thread_id` — the checkpoint key that lets the graph resume from the exact pause point across HTTP requests.

**What the AI can modify:** `bullets[]` inside any `ResumeItem` where `locked: false`.
**What the AI cannot touch:** `role`, `org`, `date`, `location`, section structure, or any item where `locked: true`.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER  (Next.js 15)                               │
│                                                                                  │
│  ┌───────────────────────────┐        ┌───────────────────────────────────────┐  │
│  │       CHAT PANEL          │        │         RESUME CANVAS                 │  │
│  │                           │        │                                       │  │
│  │  • Message history        │◄──────►│  • Live resume renderer (AST-driven)  │  │
│  │  • Streaming token output │ Zustand│  • Edit card overlay (per bullet)     │  │
│  │  • Edit card decisions    │ store  │  • Version history panel              │  │
│  │  • JD paste input         │        │  • Lock / unlock sections             │  │
│  └─────────────┬─────────────┘        └─────────────────┬─────────────────────┘  │
└────────────────┼──────────────────────────────────────── ┼────────────────────────┘
                 │                                          │
                 │  HTTP  ·  SSE stream                     │  Zustand state updates
                 ▼                                          ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND  (two implementations, one API contract)          │
│                                                                                  │
│    main branch                         dev/muhammad branch                       │
│    ────────────────────────────         ───────────────────────────────          │
│    Node.js 20 + TypeScript             Python 3.12                              │
│    Express.js                          FastAPI + Uvicorn                        │
│    LangGraph.js                        LangGraph Python                         │
│    Vercel AI SDK (SSE)                 sse-starlette (SSE)                      │
│    Zod validation                      Pydantic v2 validation                   │
│                                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────┐   │
│    │                       SHARED API CONTRACT                               │   │
│    │                                                                         │   │
│    │  POST /parse           multipart (.pdf | .docx) → ResumeAST JSON       │   │
│    │  POST /agent           AgentRequest → SSE stream (tokens + patches)    │   │
│    │  POST /agent/resume    patch decisions → SSE stream (ast_updated)      │   │
│    │  POST /export          { ast, template_id } → application/pdf          │   │
│    │  GET  /versions/:uid   → VersionSummary[]                              │   │
│    │  POST /versions        VersionRecord → { id }                          │   │
│    │  POST /models/test     { provider, api_key? } → { ok, model_list? }   │   │
│    └─────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬────────────────────────────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
┌─────────────────┐    ┌─────────────────────┐    ┌──────────────────────────┐
│   LLM LAYER     │    │    DATA LAYER        │    │    EXPORT LAYER          │
│                 │    │                     │    │                          │
│ Claude 3.5      │    │ Supabase Postgres   │    │ Jinja2 / Handlebars      │
│ Sonnet (default)│    │ resume AST +        │    │ → .tex template          │
│                 │    │ version history     │    │                          │
│ GPT-4o          │    │                     │    │ tectonic (LaTeX)         │
│                 │    │ Supabase Storage    │    │ → PDF bytes              │
│ Gemini 1.5 Pro  │    │ uploaded files      │    │                          │
│                 │    │                     │    │ No TeX Live needed       │
│ Ollama (local)  │    │ Redis (Upstash)     │    │                          │
│ no data leaves  │    │ rate limiting +     │    │                          │
│ the machine     │    │ session metadata    │    │                          │
└─────────────────┘    └─────────────────────┘    └──────────────────────────┘
```

---

## Two Branches, One Contract

The frontend is **identical** across both branches. Only the backend differs.

| | `main` | `dev/muhammad` |
|---|---|---|
| **Language** | TypeScript (Node.js 20) | Python 3.12 |
| **Agent framework** | LangGraph.js | LangGraph Python |
| **API layer** | Express.js | FastAPI + Uvicorn |
| **SSE streaming** | Vercel AI SDK | sse-starlette |
| **Validation** | Zod | Pydantic v2 |
| **LaTeX export** | Handlebars + tectonic | Jinja2 + tectonic |
| **Deploy target** | Vercel / Railway | Railway / Render / Fly.io |

Switch backend by changing one env var:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001   # main  — Node.js
NEXT_PUBLIC_API_URL=http://localhost:8000   # dev/muhammad — Python
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
│   │   │   ├── settings/             # AIModels, Account panels
│   │   │   ├── shared/               # Navbar, Footer
│   │   │   └── ui/                   # Button, Badge, Input primitives
│   │   └── store/
│   │       └── useResumeStore.ts     # Zustand — global state
│   ├── .env.example
│   └── package.json
│
├── backend/                          # main branch — Node.js + LangGraph.js
│   ├── src/
│   │   ├── index.ts                  # Express entry (port 3001)
│   │   ├── agent/
│   │   │   ├── state.ts              # AgentState, EditPatch (Zod)
│   │   │   ├── nodes.ts              # parseJd, analyzeGaps, generateEdits, applyApproved
│   │   │   └── graph.ts              # StateGraph + MemorySaver + interruptBefore
│   │   └── routes/
│   │       ├── parse.ts              # POST /parse
│   │       ├── agent.ts              # POST /agent + POST /agent/resume
│   │       ├── export.ts             # POST /export
│   │       ├── versions.ts           # GET|POST /versions
│   │       └── models.ts             # POST /models/test
│   ├── IMPLEMENTATION.md             # 12-block build guide
│   ├── .env.example
│   └── package.json
│
└── backend-py/                       # dev/muhammad branch only
    ├── main.py                       # FastAPI entry (port 8000)
    ├── routes/
    │   ├── parse.py                  # POST /parse
    │   ├── agent.py                  # POST /agent + POST /agent/resume (SSE)
    │   ├── export.py                 # POST /export
    │   ├── versions.py               # GET|POST /versions
    │   └── models.py                 # POST /models/test
    ├── IMPLEMENTATION.md             # 12-block build guide
    ├── requirements.txt
    ├── Dockerfile
    └── .env.example
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+ *(dev/muhammad branch only)*
- An [Anthropic API key](https://console.anthropic.com) *(or OpenAI / Ollama — no key needed)*

### 1. Clone

```bash
git clone https://github.com/myekini/openresume-ai.git
cd openresume-ai

# Python backend variant
# git checkout dev/muhammad
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL
npm install
npm run dev                    # → http://localhost:3000
```

### 3a. Node.js Backend (`main`)

```bash
cd backend
cp .env.example .env           # add ANTHROPIC_API_KEY
npm install
npm run dev                    # → http://localhost:3001

# Verify
curl http://localhost:3001/health
# {"status":"ok","backend":"node"}
```

### 3b. Python Backend (`dev/muhammad`)

```bash
cd backend-py
python -m venv .venv
source .venv/bin/activate      # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # add ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000

# Verify
curl http://localhost:8000/health
# {"status":"ok","backend":"python"}
```

---

## API Reference

Both backends expose **identical** endpoints.

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| `POST` | `/parse` | `multipart/form-data` — `.pdf` or `.docx` | `ResumeAST` JSON |
| `POST` | `/agent` | `AgentRequest` | SSE stream |
| `POST` | `/agent/resume` | `{ session_id, approved_patches }` | SSE stream |
| `POST` | `/export` | `{ ast, template_id }` | `application/pdf` bytes |
| `POST` | `/versions` | `VersionRecord` | `{ id: string }` |
| `GET` | `/versions/:user_id` | — | `VersionSummary[]` |
| `POST` | `/models/test` | `{ provider, api_key?, base_url? }` | `{ ok, model_list? }` |
| `GET` | `/health` | — | `{ status, backend }` |

### SSE Event Stream

```
event: token          data: { "text": "Analyzing experience section..." }
event: edits_ready    data: EditPatch[]
event: checkpoint     data: {}
event: ast_updated    data: ResumeAST
event: error          data: { "message": "..." }
event: done           data: {}
```

### Core Data Model

```typescript
interface ResumeAST {
  meta: {
    name: string; email: string; phone?: string;
    location?: string; linkedin?: string; github?: string;
  };
  sections: {
    id: string;
    type: 'experience' | 'education' | 'skills' | 'projects' | 'custom';
    title: string;
    locked: boolean;           // AI skips entire section if true
    items: {
      id: string;
      role?: string;           // immutable
      org?: string;            // immutable
      date?: string;           // immutable
      locked: boolean;         // AI skips this item if true
      bullets: string[];       // ← only field AI may modify
    }[];
  }[];
}

interface EditPatch {
  item_id: string;
  section_title: string;
  original: string;            // exact text being replaced
  proposed: string;            // AI's suggestion
  reason: string;              // always shown to user
  note?: string;               // shown if AI added a placeholder (e.g. X%)
  status: 'pending' | 'accepted' | 'reverted';
}
```

---

## Tech Stack

### Frontend

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | RSC, streaming, file-based routing |
| Language | TypeScript 5 | Shared types with Node.js backend |
| Styling | Tailwind CSS v4 | `@theme inline` design tokens |
| State | Zustand | Minimal, no boilerplate |
| Icons | Lucide React | Consistent, tree-shakeable |

### Backend — `main` (Node.js)

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Node.js 20 | Best LangGraph.js support |
| API | Express.js | Lightweight, SSE-friendly |
| Agent | LangGraph.js | Stateful graph, interrupt/resume |
| LLM | `@langchain/anthropic` | Claude 3.5 Sonnet |
| Streaming | Vercel AI SDK | `streamText` + `useChat` |
| Validation | Zod | Typed, mirrors Pydantic contract |

### Backend — `dev/muhammad` (Python)

| Layer | Choice | Why |
|-------|--------|-----|
| Runtime | Python 3.12 | Native LangGraph, better ML ecosystem |
| API | FastAPI + Uvicorn | Async, Pydantic native, auto `/docs` |
| Agent | LangGraph Python | Identical graph API to JS version |
| LLM | Anthropic Python SDK | Claude 3.5 Sonnet |
| Streaming | sse-starlette | Native SSE in FastAPI |
| Validation | Pydantic v2 | Fast, typed, JSON Schema compatible |
| Export | Jinja2 + tectonic | Safe LaTeX templating |

### Infrastructure

| Layer | Choice |
|-------|--------|
| Auth | Clerk |
| Database | Supabase (Postgres) |
| File Storage | Supabase Storage |
| Rate Limiting | Redis — Upstash |
| Frontend Deploy | Vercel |
| Backend Deploy | Railway / Render / Fly.io |

---

## Environment Variables

### `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001    # Node.js backend (main)
# NEXT_PUBLIC_API_URL=http://localhost:8000  # Python backend (dev/muhammad)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### `backend/.env` — main

```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://...
```

### `backend-py/.env` — dev/muhammad

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://...
```

---

## Roadmap

- [x] Frontend — landing, onboarding, canvas, settings, version history
- [x] Node.js backend scaffold — Express, LangGraph.js, all routes
- [x] Python backend scaffold — FastAPI, routes, `POST /models/test`
- [x] `POST /models/test` — key validation + model listing (all providers)
- [ ] `POST /parse` — DOCX + PDF → ResumeAST via LLM extraction
- [ ] `POST /agent` — single-turn edit suggestions
- [ ] SSE streaming on `/agent`
- [ ] LangGraph multi-node agent with `interruptBefore` + resume
- [ ] `POST /export` — LaTeX → PDF via tectonic
- [ ] Supabase persistence — AST + version history
- [ ] Clerk authentication + JWT middleware
- [ ] Ollama local model support
- [ ] Docker Compose — full-stack local dev
- [ ] Public deployment (Vercel + Railway)

---

## Implementing the Backend

Both backends ship with a **12-block implementation guide** that walks through the full build in testable increments:

- `backend/IMPLEMENTATION.md` — Node.js + LangGraph.js
- `backend-py/IMPLEMENTATION.md` — Python + LangGraph

Each block ends with a `curl` verification command. Start at Block 1, never skip ahead.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

```bash
# Fork → clone
git clone https://github.com/YOUR_USERNAME/openresume-ai.git

# Branch off the right base
git checkout -b feat/your-feature main          # frontend or Node.js changes
git checkout -b feat/your-feature dev/muhammad  # Python backend changes
```

**Branch targets:**

| Change type | Base branch |
|-------------|-------------|
| `frontend/` | `main` |
| `backend/` (Node.js) | `main` |
| `backend-py/` (Python) | `dev/muhammad` |

---

## License

MIT © [Muhammad Yekini](https://github.com/myekini)

---

<div align="center">
<sub>An open-source alternative to Teal, Rezi, and Kickresume — without the black-box rewrites.</sub>
</div>
