# OpenResume AI — Python Backend Implementation Guide

> Build the full FastAPI + LangGraph backend in self-contained blocks.
> Each block is a working, testable increment. Never skip ahead.

---

## System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REQUEST LIFECYCLE                            │
│                                                                     │
│  Browser          FastAPI            LangGraph           LLM        │
│  ───────          ───────            ─────────           ───        │
│                                                                     │
│  POST /parse ────► mulitpart ───────► mammoth/pdfplumber            │
│                    file upload        raw text                      │
│                                          │                          │
│                                       Anthropic SDK                 │
│                                       structured JSON               │
│                                          │                          │
│  ◄──────────────── ResumeAST ◄──────────┘                          │
│                                                                     │
│  POST /agent ────► AgentRequest ──► StateGraph                      │
│  (SSE stream)      {ast, jd,         parse_jd                       │
│                     session_id}       analyze_gaps                  │
│                                       generate_edits                │
│                                       ──── INTERRUPT ────           │
│  ◄── event:edits_ready ◄──────────────────────────────             │
│                                                                     │
│  [user accepts/reverts in UI]                                       │
│                                                                     │
│  POST /agent/resume ─► approved_patches ─► apply_approved          │
│  (SSE stream)                              updated AST              │
│  ◄── event:ast_updated ◄──────────────────────────────             │
│                                                                     │
│  POST /export ───► ResumeAST ──► Jinja2 ──► .tex ──► tectonic      │
│  ◄──────────────── PDF bytes ◄─────────────────────────            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Shared Data Contract

Every block reads and writes this schema. Memorise it.

```python
# The only things AI is allowed to modify: bullets[]
# Everything else is locked: dates, org names, roles, structure

ResumeAST
  └── meta: ResumeMeta          # name, email, phone, linkedin, github
  └── sections: ResumeSection[]
        └── type                # experience | education | skills | projects | custom
        └── title               # section heading — never modified
        └── locked: bool        # if true, AI skips entire section
        └── items: ResumeItem[]
              └── role          # never modified
              └── org           # never modified
              └── date          # never modified
              └── locked: bool  # if true, AI skips this item
              └── bullets: []   # ← THE ONLY WRITABLE FIELD

EditPatch
  └── item_id                   # which ResumeItem
  └── original                  # exact bullet being replaced
  └── proposed                  # AI's version
  └── reason                    # always shown to user
  └── note?                     # shown when AI inserts a placeholder (e.g. X%)
  └── status                    # pending | accepted | reverted
```

---

## Tool Stack

| Layer | Tool | Why |
|-------|------|-----|
| API framework | FastAPI | async, Pydantic native, auto docs at `/docs` |
| Server | Uvicorn | ASGI, production-grade, used by FastAPI |
| Agent | LangGraph Python | stateful graph, built-in interrupt/resume, checkpoint |
| LLM (primary) | Anthropic SDK | Claude 3.5 Sonnet — best instruction following |
| LLM (secondary) | LangChain OpenAI | GPT-4o fallback |
| Local LLM | Ollama Python | privacy mode, no data leaves machine |
| DOCX parsing | mammoth | clean text extraction, preserves structure |
| PDF parsing | pdfplumber | layout-aware, better than PyPDF2 for resumes |
| Validation | Pydantic v2 | typed, fast, matches TypeScript Zod contract |
| LaTeX compile | tectonic (subprocess) | self-contained, no TeX Live needed |
| Templates | Jinja2 | safe LaTeX variable injection |
| Database | Supabase Python | Postgres for AST + versions, Storage for files |
| Auth | Clerk JWT (PyJWT) | validate frontend tokens in FastAPI middleware |
| Rate limiting | Redis (Upstash) | per-user request throttling |
| SSE streaming | sse-starlette | native SSE from FastAPI endpoints |

---

## Environment Setup (do once)

```bash
cd backend-py

# Create virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .\.venv\Scripts\activate

# Install all dependencies
pip install -r requirements.txt

# Copy env file and fill in keys
cp .env.example .env
```

```bash
# backend-py/.env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...              # optional
OLLAMA_BASE_URL=http://localhost:11434   # optional
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://...
PORT=8000
FRONTEND_URL=http://localhost:3000
```

---

## Block 1 — FastAPI Skeleton + Health Check

**What you build:** A running FastAPI server with CORS, router mounts, and a `/health` endpoint.
**Test:** `curl http://localhost:8000/health` returns `{"status":"ok","backend":"python"}`.

### Files

`main.py` — already scaffolded. Run it:

```bash
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` — you get a free interactive API explorer. Use it for every block.

### Verify

```bash
curl http://localhost:8000/health
# {"status":"ok","backend":"python"}
```

---

## Block 2 — Resume Parser: DOCX + PDF → ResumeAST

**What you build:** `POST /parse` — accepts a multipart file upload, extracts raw text, sends to Claude, returns a typed `ResumeAST`.

**Prerequisites:** Block 1 running. `ANTHROPIC_API_KEY` set.

### How it works

```
.docx file  →  mammoth.extract_raw_text()  →  raw text string
.pdf file   →  pdfplumber.open()           →  raw text string
                      │
                      ▼
              Anthropic Claude 3.5 Sonnet
              prompt: "extract this into our JSON schema"
                      │
                      ▼
              JSON.parse  →  ResumeAST(**data)  →  return
```

### Key implementation details

**The extraction prompt matters.** Three rules that prevent hallucination:

```python
"""
Rules:
- Preserve exact dates, org names, role titles — never fabricate
- Split multi-sentence bullets into individual array items
- Return ONLY valid JSON. No explanation, no markdown fences.
"""
```

**mammoth vs pdfplumber — when to use which:**
- mammoth: `.docx` only. Extracts semantic text, respects bold/italic structure.
- pdfplumber: `.pdf` only. Preserves column layout which matters for two-column resumes.

**Error handling:**

```python
try:
    if filename.endswith(".docx"):
        return extract_docx(content)
    elif filename.endswith(".pdf"):
        return extract_pdf(content)
    else:
        raise HTTPException(400, "Only DOCX and PDF supported.")
except json.JSONDecodeError:
    raise HTTPException(422, "LLM returned invalid JSON. Retry.")
except ValidationError as e:
    raise HTTPException(422, f"Schema mismatch: {e}")
```

### Verify

```bash
# Upload a real resume
curl -X POST http://localhost:8000/parse \
  -F "file=@your_resume.pdf" | python -m json.tool

# Expect: {"meta": {...}, "sections": [...]}
```

---

## Block 3 — LaTeX Export: ResumeAST → PDF

**What you build:** `POST /export` — takes a `ResumeAST`, renders a LaTeX template via Jinja2, compiles with tectonic, returns PDF bytes.

**Prerequisites:** Block 2 complete. `tectonic` installed on the system.

### Install tectonic

```bash
# macOS
brew install tectonic

# Linux
curl --proto '=https' --tlsv1.2 -fsSL https://drop.wtf/tectonic.sh | sh

# Windows — download binary from https://tectonic-typesetting.github.io
```

### How it works

```
ResumeAST  →  Jinja2 template render  →  resume.tex (string)
                      │
                      ▼
              write to tmp directory
                      │
                      ▼
              subprocess.run(["tectonic", "resume.tex"])
                      │
                      ▼
              read resume.pdf bytes  →  return as Response
```

### Jinja2 + LaTeX gotcha

LaTeX uses `{` `}` and `%` which conflict with Jinja2 defaults. Use custom delimiters:

```python
env = Environment(
    block_start_string="((*",    block_end_string="*))",
    variable_start_string="(((",  variable_end_string=")))",
    comment_start_string="((#",   comment_end_string="#))",
)
```

### Verify

```bash
curl -X POST http://localhost:8000/export \
  -H "Content-Type: application/json" \
  -d '{"ast": <paste ResumeAST from Block 2>, "template_id": "clean"}' \
  --output resume.pdf

open resume.pdf
```

---

## Block 4 — Single-Turn Agent (No Streaming, No LangGraph)

**What you build:** A basic `/agent` endpoint — takes `{ast, jd_text, message}`, calls Claude once, returns edit patches as JSON. No streaming yet.

**Purpose:** Validate the prompt engineering before adding graph complexity.

**Prerequisites:** Block 2 complete.

### The single-turn flow

```python
@router.post("/simple")  # temporary test endpoint
async def simple_agent(req: AgentRequest):
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=4096,
        messages=[
            {"role": "user", "content": build_prompt(req.resume_ast, req.jd_text)}
        ]
    )
    patches = json.loads(response.content[0].text)
    return [EditPatch(**p) for p in patches]
```

### The edit generation prompt

This is the most important prompt in the system. Iterate on it here before wiring to LangGraph:

```python
SYSTEM = """You are a precision resume editor.

Rules (non-negotiable):
- ONLY modify bullets[]. Never touch role, org, date, location, structure.
- Surgical edits only — improve, don't rewrite from scratch.
- Preserve the candidate's voice, tense, and style.
- Never keyword-stuff. Integrate terms naturally.
- If you must insert a placeholder metric (e.g. X%), set note field to remind user.
- Max 8 patches per run. Quality over quantity.

Return ONLY a JSON array. No explanation, no markdown:
[{
  "item_id": "...",
  "section_title": "...",
  "original": "exact original bullet text",
  "proposed": "improved version",
  "reason": "one sentence — specific, references the JD",
  "note": "optional — only if user needs to fill in data"
}]"""
```

### Evaluate output quality here

Before moving to Block 5, run this 10 times with different resumes and JDs. Check:
- Does it hallucinate org names or dates? (It shouldn't — fix the prompt if it does)
- Is `original` always an exact match to a real bullet? (Must be — apply_approved depends on this)
- Are reasons specific or generic? (Generic = bad prompt, fix it)
- Does it stay under 8 patches?

---

## Block 5 — SSE Streaming

**What you build:** Convert the `/agent` endpoint to stream tokens via SSE as they generate, instead of waiting for the full response.

**Prerequisites:** Block 4 validated. `sse-starlette` installed.

### SSE event format

```
event: token
data: {"text": "Analyzing your experience section..."}

event: edits_ready
data: [{"item_id": "...", "proposed": "...", ...}]

event: done
data: {}
```

### Streaming implementation

```python
from sse_starlette.sse import EventSourceResponse

@router.post("")
async def run_agent(req: AgentRequest):
    async def event_stream():
        # Stream tokens as they generate
        with client.messages.stream(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4096,
            system=SYSTEM,
            messages=[{"role": "user", "content": build_prompt(req)}]
        ) as stream:
            full_text = ""
            for text in stream.text_stream:
                full_text += text
                yield {"event": "token", "data": json.dumps({"text": text})}

        # Parse the complete response
        patches = json.loads(full_text)
        yield {"event": "edits_ready", "data": json.dumps(patches)}
        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
```

### Test SSE in the browser (quick check)

```javascript
// Paste in browser console while frontend is running
const es = new EventSource('http://localhost:8000/agent');
es.addEventListener('token', e => console.log(JSON.parse(e.data).text));
es.addEventListener('edits_ready', e => console.log('edits:', JSON.parse(e.data)));
```

---

## Block 6 — LangGraph Multi-Node Agent

**What you build:** Replace the single-turn agent with a proper LangGraph `StateGraph` — three nodes, stateful, with proper message history.

**Prerequisites:** Block 5 working. Understand the node → edge model.

### Graph structure

```
START
  │
  ▼
parse_jd          # extract requirements from JD → structured dict
  │
  ▼
analyze_gaps      # compare resume to JD requirements → gap analysis message
  │
  ▼
generate_edits    # produce EditPatch[] based on gaps
  │
  ▼
human_review      # ← INTERRUPT POINT (next block)
  │
  ▼
apply_approved    # apply accepted patches to AST
  │
  ▼
should_continue?
  ├── "generate_edits"  → loop (another round)
  └── END
```

### State definition

```python
class AgentState(MessagesState):
    session_id: str
    resume_ast: ResumeAST
    jd_text: str
    jd_parsed: dict | None = None
    pending_edits: list[EditPatch] = []
    approved_edits: list[EditPatch] = []
    iteration_count: int = 0
```

`MessagesState` gives you `messages: list[BaseMessage]` for free — the full conversation history persists across nodes and across the interrupt/resume cycle.

### Node responsibilities

| Node | Input | Output | LLM call? |
|------|-------|--------|-----------|
| `parse_jd` | `jd_text` | `jd_parsed` | Yes |
| `analyze_gaps` | `resume_ast`, `jd_parsed` | message added to history | Yes |
| `generate_edits` | messages, `resume_ast` | `pending_edits` | Yes |
| `human_review` | `pending_edits` | nothing (fires interrupt) | No |
| `apply_approved` | `pending_edits` (with statuses) | updated `resume_ast` | No |

### Streaming with LangGraph

```python
async for event in graph.astream_events(input, config=config, version="v2"):
    kind = event["event"]
    name = event.get("name", "")

    if kind == "on_chat_model_stream":
        chunk = event["data"]["chunk"].content
        if chunk:
            yield {"event": "token", "data": json.dumps({"text": chunk})}

    elif kind == "on_chain_end" and name == "generate_edits":
        edits = event["data"]["output"].get("pending_edits", [])
        yield {"event": "edits_ready", "data": json.dumps([e.model_dump() for e in edits])}
```

---

## Block 7 — Human-in-the-Loop (interrupt / resume)

**What you build:** The graph pauses after `generate_edits`. Frontend shows edit cards. User accepts/reverts. Frontend calls `POST /agent/resume`. Graph continues.

**Prerequisites:** Block 6 complete. This is the most important block — it's what makes the product trustworthy.

### How LangGraph interrupt works

```python
# Inside human_review node:
def human_review(state: AgentState) -> dict:
    interrupt({
        "type": "checkpoint",
        "pending_edits": [p.model_dump() for p in state["pending_edits"]]
    })
    # ← execution stops here, state is saved to checkpointer
    # ← nothing below runs until graph.astream_events() is called again
    return {}
```

The checkpointer (MemorySaver in dev, Redis in prod) serialises the entire `AgentState` — including message history, the AST, everything — and stores it keyed to `thread_id` (your `session_id`).

### Resume endpoint

```python
@router.post("/resume")
async def resume_after_approval(req: ResumeRequest):
    config = {"configurable": {"thread_id": req.session_id}}

    async def event_stream():
        # Pass the user's decisions back into the graph
        # LangGraph loads the saved state and continues from after interrupt()
        async for event in graph.astream_events(
            {"pending_edits": req.approved_patches},
            config=config,
            version="v2"
        ):
            if event["event"] == "on_chain_end" and event["name"] == "apply_approved":
                ast = event["data"]["output"].get("resume_ast")
                yield {"event": "ast_updated", "data": json.dumps(ast.model_dump())}

        yield {"event": "done", "data": "{}"}

    return EventSourceResponse(event_stream())
```

### The mental model (map to what you know)

| Concept | LangGraph equivalent |
|---------|---------------------|
| Airflow DAG pause on sensor | `interrupt()` inside a node |
| Kafka consumer offset commit | `MemorySaver` checkpointing state |
| Celery task resume | `graph.astream_events()` with same `thread_id` |

### Test the full loop

```bash
# 1. Start agent session
curl -X POST http://localhost:8000/agent \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-123","message":"optimize","resume_ast":{...},"jd_text":"..."}'
# ← watch SSE events stream
# ← stops at event: checkpoint

# 2. Resume with decisions
curl -X POST http://localhost:8000/agent/resume \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "approved_patches": [
      {"item_id":"abc","status":"accepted",...},
      {"item_id":"def","status":"reverted",...}
    ]
  }'
# ← watch event: ast_updated with new AST
```

---

## Block 8 — Frontend Integration

**What you build:** Wire the Next.js frontend to your Python backend. Point env var. Smoke-test the full flow end-to-end.

**Prerequisites:** Blocks 1–7 complete. Frontend running on port 3000.

### Step 1: Update `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 2: Add real state to Zustand store

The frontend `useResumeStore` currently has no data model — only UI state. Add:

```typescript
// frontend/src/store/useResumeStore.ts

import type { ResumeAST, EditPatch } from '@/types/resume';

interface ResumeStore {
  // — existing UI state —
  // ...

  // — data model (add these) —
  sessionId: string | null;
  resumeAst: ResumeAST | null;
  jdText: string;
  messages: ChatMessage[];
  editPatches: EditPatch[];

  setResumeAst: (ast: ResumeAST) => void;
  setJdText: (jd: string) => void;
  addMessage: (msg: ChatMessage) => void;
  setEditPatches: (patches: EditPatch[]) => void;
  updatePatchStatus: (itemId: string, status: 'accepted' | 'reverted') => void;
}
```

### Step 3: Add shared TypeScript types

```typescript
// frontend/src/types/resume.ts
// Mirror of backend-py/agent/state.py

export interface ResumeMeta {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
}

export interface ResumeItem {
  id: string;
  role?: string;
  org?: string;
  date?: string;
  location?: string;
  bullets: string[];
  locked: boolean;
}

export interface ResumeSection {
  id: string;
  type: 'experience' | 'education' | 'skills' | 'projects' | 'custom';
  title: string;
  items: ResumeItem[];
  locked: boolean;
}

export interface ResumeAST {
  meta: ResumeMeta;
  sections: ResumeSection[];
}

export interface EditPatch {
  item_id: string;
  section_title: string;
  original: string;
  proposed: string;
  reason: string;
  note?: string;
  status: 'pending' | 'accepted' | 'reverted';
}
```

### Step 4: Build the `<ResumeDocument />` renderer

This is the most important frontend piece. Replace the static Alex Rivera JSX:

```typescript
// frontend/src/components/canvas/ResumeDocument.tsx
// Takes real ResumeAST and renders it

export function ResumeDocument({ ast }: { ast: ResumeAST }) {
  return (
    <div className="bg-white text-black p-14">
      <ResumeHeader meta={ast.meta} />
      {ast.sections
        .filter(s => !s.locked)
        .map(section => (
          <ResumeSection key={section.id} section={section} />
        ))
      }
    </div>
  );
}
```

### Step 5: SSE client hook

```typescript
// frontend/src/hooks/useAgentStream.ts

export function useAgentStream() {
  const { setEditPatches, addMessage } = useResumeStore();

  const startSession = async (req: AgentRequest) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = JSON.parse(line.slice(5));
          // handle by event type
        }
        if (line.startsWith('event: edits_ready')) {
          // next data line has the patches
        }
      }
    }
  };

  return { startSession };
}
```

### Smoke test checklist

```
□ Upload a PDF → see parsed AST logged in console
□ Paste JD → click "Open Canvas" → agent starts, tokens stream into chat
□ Edit cards appear in canvas after edits_ready event
□ Press Y → edit accepted, canvas updates
□ Press N → edit reverted
□ Click "Export PDF" → PDF downloads
□ Refresh page → nothing crashes (guard on /canvas)
```

---

## Block 9 — Supabase: Persistence + Version History

**What you build:** Store `ResumeAST` snapshots and version history in Supabase Postgres. Replace in-memory `_versions` dict in `routes/versions.py`.

**Prerequisites:** Block 8 smoke-tested. Supabase project created.

### Database schema

```sql
-- Run in Supabase SQL editor

create table resume_versions (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  label       text not null,
  ast         jsonb not null,
  jd_text     text,
  created_at  timestamptz default now()
);

create index on resume_versions (user_id, created_at desc);

-- Enable Row Level Security
alter table resume_versions enable row level security;

-- Policy: users can only see their own versions
create policy "own versions only"
  on resume_versions for all
  using (user_id = current_setting('app.user_id'));
```

### Supabase client setup

```python
# backend-py/db/client.py
from supabase import create_client
import os

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"]
)
```

### File storage for uploaded resumes

```python
# Store original uploaded files in Supabase Storage
bucket = "resumes"

async def store_file(user_id: str, filename: str, content: bytes) -> str:
    path = f"{user_id}/{uuid4().hex}/{filename}"
    supabase.storage.from_(bucket).upload(path, content)
    return path
```

### LangGraph checkpointer — swap MemorySaver for Redis

```python
# In production, replace MemorySaver with a persistent checkpointer
# so graph state survives server restarts

from langgraph.checkpoint.redis import RedisSaver

checkpointer = RedisSaver.from_conn_string(os.environ["REDIS_URL"])
graph = workflow.compile(checkpointer=checkpointer, interrupt_before=["human_review"])
```

---

## Block 10 — Auth: Clerk JWT Validation

**What you build:** Validate Clerk JWT tokens on protected endpoints. Extract `user_id` from token. Gate `/versions` and `/export` behind auth.

**Prerequisites:** Block 9 complete. Clerk project created. Frontend has Clerk installed.

### Install

```bash
pip install PyJWT cryptography httpx
```

### JWT middleware

```python
# backend-py/middleware/auth.py
import jwt
import httpx
from fastapi import HTTPException, Header
from functools import lru_cache

CLERK_JWKS_URL = "https://api.clerk.com/v1/jwks"

@lru_cache(maxsize=1)
def get_jwks():
    return httpx.get(CLERK_JWKS_URL).json()

def verify_clerk_token(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing token")

    token = authorization.split(" ")[1]
    jwks = get_jwks()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        return payload["sub"]  # Clerk user ID
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except Exception:
        raise HTTPException(401, "Invalid token")
```

### Protect endpoints

```python
# Only add auth to endpoints that need it
@router.get("/{user_id}")
async def list_versions(user_id: str, current_user: str = Depends(verify_clerk_token)):
    if current_user != user_id:
        raise HTTPException(403, "Forbidden")
    # fetch from Supabase...
```

---

## Block 11 — Ollama: Local Model Support

**What you build:** Allow users to run the full pipeline locally with Ollama. No API key. No data leaves the machine.

**Prerequisites:** Block 10 complete. Ollama installed locally.

### Install Ollama

```bash
# macOS / Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a capable model
ollama pull llama3:8b-instruct-q4_K_M
ollama pull mistral:latest
```

### Model abstraction

```python
# backend-py/llm/client.py

from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ChatOllama

def get_llm(provider: str, model: str, api_key: str | None = None):
    if provider == "anthropic":
        return ChatAnthropic(
            model=model or "claude-3-5-sonnet-20241022",
            api_key=api_key or os.environ["ANTHROPIC_API_KEY"],
            temperature=0.3
        )
    elif provider == "openai":
        return ChatOpenAI(
            model=model or "gpt-4o",
            api_key=api_key or os.environ["OPENAI_API_KEY"],
            temperature=0.3
        )
    elif provider == "ollama":
        return ChatOllama(
            model=model or "llama3:8b-instruct-q4_K_M",
            base_url=os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434"),
            temperature=0.3
        )
    else:
        raise ValueError(f"Unknown provider: {provider}")
```

### Add to AgentRequest

```python
class AgentRequest(BaseModel):
    session_id: str
    message: str
    resume_ast: ResumeAST
    jd_text: str
    provider: str = "anthropic"       # anthropic | openai | ollama
    model: str | None = None          # override default
    api_key: str | None = None        # user's own key (BYOK)
```

### Ollama limitations to communicate to users

- Smaller models (8B) produce lower quality patches — 3–5 patches max
- Structured JSON output is less reliable — add retry logic
- No streaming for some Ollama models — fallback to non-streaming
- Cold start is slow (~3–5s) — show a loading state

### POST /models/test — validate key + fetch model list

The settings page calls this before saving credentials. Already scaffolded at `backend-py/routes/models.py` and mounted at `/models`.

```python
# backend-py/routes/models.py  (already scaffolded)
# POST /models/test
# Body: { provider, api_key?, base_url? }
# Response: { ok: bool, model_list?: list[str], error?: str }
```

```python
# Anthropic — uses client.models.list()
client = anthropic.Anthropic(api_key=body.api_key or os.environ["ANTHROPIC_API_KEY"])
response = client.models.list(limit=20)
return {"ok": True, "model_list": [m.id for m in response.data]}

# OpenAI — filter to GPT models
client = OpenAI(api_key=body.api_key or os.environ.get("OPENAI_API_KEY"))
response = client.models.list()
return {"ok": True, "model_list": sorted([m.id for m in response.data if m.id.startswith("gpt")])}

# Ollama — hit local /api/tags
async with httpx.AsyncClient() as client:
    r = await client.get(f"{base_url}/api/tags", timeout=5)
    data = r.json()
return {"ok": True, "model_list": [m["name"] for m in data.get("models", [])]}
```

### Verify

```bash
# Test Anthropic key
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","api_key":"sk-ant-..."}'
# {"ok":true,"model_list":["claude-3-5-sonnet-20241022",...]}

# Test with invalid key
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","api_key":"invalid"}'
# {"ok":false,"error":"401 Incorrect API key"}

# Test Ollama
curl -X POST http://localhost:8000/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"ollama"}'
# {"ok":true,"model_list":["llama3:8b","mistral:7b",...]}
```

---

## Block 12 — Docker + Railway Deployment

**What you build:** Containerise the backend. Deploy to Railway. Frontend on Vercel points to it.

**Prerequisites:** All blocks complete. Docker installed.

### Dockerfile

```dockerfile
# backend-py/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install tectonic (LaTeX compiler)
RUN apt-get update && apt-get install -y curl && \
    curl --proto '=https' --tlsv1.2 -fsSL \
    https://github.com/tectonic-typesetting/tectonic/releases/latest/download/tectonic-$(uname -m)-unknown-linux-musl.tar.gz \
    | tar xz -C /usr/local/bin && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build and test locally

```bash
docker build -t openresume-api .
docker run -p 8000:8000 --env-file .env openresume-api
curl http://localhost:8000/health
```

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Set environment variables
railway variables set ANTHROPIC_API_KEY=sk-ant-...
railway variables set SUPABASE_URL=https://...
# ... all other env vars

# Get your public URL
railway domain
```

### Update frontend env on Vercel

```bash
# In Vercel project settings → Environment Variables
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
```

### Production CORS update

```python
# main.py — update for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://openresume-ai.vercel.app",   # your Vercel URL
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Build Order Summary

| Block | Endpoint | Test signal |
|-------|----------|-------------|
| 1 | `GET /health` | `{"status":"ok"}` |
| 2 | `POST /parse` | Valid `ResumeAST` JSON from real resume |
| 3 | `POST /export` | Downloaded PDF opens correctly |
| 4 | `POST /agent/simple` | Valid `EditPatch[]` for test resume + JD |
| 5 | `POST /agent` (SSE) | Tokens stream in terminal |
| 6 | `POST /agent` (LangGraph) | Multi-node events stream correctly |
| 7 | `POST /agent/resume` | `ast_updated` event with modified bullets |
| 8 | Frontend wired | Full browser flow works end-to-end |
| 9 | `GET /versions/:id` | Versions persist across server restarts |
| 10 | Auth header | 401 without token, 200 with valid Clerk JWT |
| 11 | `POST /models/test` | `{"ok":true,"model_list":[...]}` for all 3 providers |
| 12 | Railway URL | Production health check passes |

---

## Performance Targets

| Operation | Target | How to hit it |
|-----------|--------|---------------|
| `/parse` — DOCX/PDF | < 2s | mammoth is fast; LLM call is the bottleneck — use claude-haiku for parsing if needed |
| First SSE token | < 2s | streaming starts as soon as LLM begins, not after it finishes |
| Full edit run | < 15s | 3 LLM calls in series — acceptable with streaming |
| `/export` PDF | < 3s | tectonic is fast; tmp directory I/O is the bottleneck |
| Canvas re-render | < 100ms | pure frontend — Zustand state update + React render |

---

## Common Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| LLM returns non-JSON | Model got confused by long resume | Add retry with `json_object` response format |
| `original` doesn't match any bullet | LLM paraphrased instead of copying | Stricter prompt: "copy the original bullet character for character" |
| Graph state lost between requests | MemorySaver is in-memory only | Swap to RedisSaver (Block 9) |
| CORS error from browser | Frontend URL not in allow_origins | Add exact origin including protocol |
| tectonic fails | Missing LaTeX package | tectonic auto-downloads packages — needs internet on first run |
| Ollama JSON output malformed | Small model can't follow schema | Reduce schema complexity or switch to `llama3:70b` |
