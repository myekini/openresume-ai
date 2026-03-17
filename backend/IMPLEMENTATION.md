# OpenResume AI — Node.js Backend Implementation Guide

> Build the full Express + LangGraph.js backend block by block.
> Each block is a working, testable increment. Never skip ahead.
> This is the `main` branch backend — TypeScript end-to-end.

---

## System Design

```
┌─────────────────────────────────────────────────────────────────────┐
│                        REQUEST LIFECYCLE                            │
│                                                                     │
│  Browser            Express (port 3001)    LangGraph.js    LLM     │
│  ───────            ────────────────────   ───────────     ───     │
│                                                                     │
│  POST /parse ──────► multer file upload                            │
│                       mammoth / pdf-parse                          │
│                       raw text string                              │
│                            │                                       │
│                       Anthropic SDK                                │
│                       structured JSON                              │
│                            │                                       │
│  ◄──── ResumeAST ◄─────────┘                                       │
│                                                                     │
│  POST /agent ──────► AgentRequest ──► StateGraph                   │
│  (SSE stream)         {ast, jd,        parseJd                     │
│                        sessionId}       analyzeGaps                │
│                                         generateEdits              │
│                                         ── INTERRUPT ──            │
│  ◄── event:edits_ready ◄────────────────────────────              │
│                                                                     │
│  [user accepts/reverts edit cards in UI]                           │
│                                                                     │
│  POST /agent/resume ──► approvedPatches ──► applyApproved          │
│  (SSE stream)                               updated AST            │
│  ◄── event:ast_updated ◄────────────────────────────              │
│                                                                     │
│  POST /export ─────► ResumeAST ──► Jinja2-like ──► .tex           │
│                                    tectonic compile                │
│  ◄──────────────── PDF bytes ◄──────────────────────              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Shared Data Contract

Same schema as the Python backend. Both sides of the contract must match exactly.

```typescript
// The only things AI is allowed to modify: bullets[]
// Everything else is locked: dates, org names, roles, structure

interface ResumeAST {
  meta: ResumeMeta           // name, email, phone, linkedin, github
  sections: ResumeSection[]
}

interface ResumeSection {
  id: string
  type: 'experience' | 'education' | 'skills' | 'projects' | 'custom'
  title: string              // never modified
  locked: boolean            // if true, AI skips entire section
  items: ResumeItem[]
}

interface ResumeItem {
  id: string
  role?: string              // never modified
  org?: string               // never modified
  date?: string              // never modified
  locked: boolean            // if true, AI skips this item
  bullets: string[]          // ← THE ONLY WRITABLE FIELD
}

interface EditPatch {
  item_id: string            // which ResumeItem
  section_title: string
  original: string           // exact bullet being replaced
  proposed: string           // AI's version
  reason: string             // always shown to user
  note?: string              // shown when AI inserts a placeholder
  status: 'pending' | 'accepted' | 'reverted'
}
```

---

## Tool Stack

| Layer | Tool | Why |
|-------|------|-----|
| Runtime | Node.js 20 | LTS, best LangGraph.js support |
| Language | TypeScript 5 | end-to-end type safety with frontend |
| API framework | Express 4 | lightweight, well-understood, SSE-friendly |
| Dev server | ts-node-dev | hot reload without build step |
| Agent | LangGraph.js (`@langchain/langgraph`) | stateful graph, interrupt/resume, JS-native |
| LLM (primary) | `@langchain/anthropic` | Claude 3.5 Sonnet |
| LLM (secondary) | `@langchain/openai` | GPT-4o fallback |
| Streaming | Vercel AI SDK (`ai` package) | `streamText`, `useChat` hook integration |
| DOCX parsing | `mammoth` | clean text extraction from .docx |
| PDF parsing | `pdf-parse` | raw text from PDF bytes |
| Validation | `zod` | typed schema validation, mirrors Pydantic |
| LaTeX compile | `tectonic` (child_process) | self-contained, no TeX Live needed |
| Template | string interpolation / `handlebars` | safe LaTeX variable injection |
| Database | `@supabase/supabase-js` | Postgres for AST + versions, Storage for files |
| Auth | `@clerk/express` | Clerk middleware for Express |
| Rate limiting | `ioredis` + custom middleware | per-user request throttling |
| File uploads | `multer` | multipart/form-data handling |
| Environment | `dotenv` | `.env` file loading |

---

## Environment Setup (do once)

```bash
cd backend

# Install all dependencies
npm install

# Copy env file and fill in keys
cp .env.example .env
```

```bash
# backend/.env
PORT=3001
FRONTEND_URL=http://localhost:3000
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...              # optional
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
REDIS_URL=redis://...
```

---

## Block 1 — Express Skeleton + Health Check

**What you build:** Running TypeScript Express server on port 3001 with all routers mounted.
**Test:** `curl http://localhost:3001/health` returns `{"status":"ok","backend":"node"}`.

### Already scaffolded — just run it

```bash
npm run dev
# ts-node-dev starts, watching for changes
```

Visit `http://localhost:3001/health` — server is live.

### Install missing types if needed

```bash
npm install --save-dev @types/express @types/cors @types/multer @types/node
```

### Verify

```bash
curl http://localhost:3001/health
# {"status":"ok","backend":"node"}
```

---

## Block 2 — Resume Parser: DOCX + PDF → ResumeAST

**What you build:** `POST /parse` — multipart file upload → raw text → Claude → typed `ResumeAST`.

**Prerequisites:** Block 1 running. `ANTHROPIC_API_KEY` set.

### Install dependencies

```bash
npm install mammoth pdf-parse @anthropic-ai/sdk multer
npm install --save-dev @types/multer @types/pdf-parse
```

### Define the Zod schema first

Zod is your runtime type guard — it validates what Claude returns before it hits the route handler:

```typescript
// backend/src/schemas/resume.ts
import { z } from 'zod';

export const ResumeMeta = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

export const ResumeItem = z.object({
  id: z.string(),
  role: z.string().optional(),
  org: z.string().optional(),
  date: z.string().optional(),
  location: z.string().optional(),
  bullets: z.array(z.string()),
  locked: z.boolean().default(false),
});

export const ResumeSection = z.object({
  id: z.string(),
  type: z.enum(['experience', 'education', 'skills', 'projects', 'custom']),
  title: z.string(),
  items: z.array(ResumeItem),
  locked: z.boolean().default(false),
});

export const ResumeAST = z.object({
  meta: ResumeMeta,
  sections: z.array(ResumeSection),
});

export const EditPatch = z.object({
  item_id: z.string(),
  section_title: z.string(),
  original: z.string(),
  proposed: z.string(),
  reason: z.string(),
  note: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'reverted']).default('pending'),
});

export type ResumeAST = z.infer<typeof ResumeAST>;
export type EditPatch = z.infer<typeof EditPatch>;
```

### How it works

```
.docx  →  mammoth.extractRawText()  →  text string
.pdf   →  pdf-parse(buffer)         →  text string
                  │
                  ▼
        Anthropic Claude 3.5 Sonnet
        "extract into our JSON schema"
                  │
                  ▼
        JSON.parse  →  ResumeAST.parse(data)  →  return
```

### Parse route implementation

```typescript
// backend/src/routes/parse.ts
import { Router } from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import Anthropic from '@anthropic-ai/sdk';
import { ResumeAST } from '../schemas/resume';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const anthropic = new Anthropic();

const EXTRACTION_PROMPT = (text: string) => `
Extract this resume into JSON matching the schema exactly.

Rules:
- Preserve exact dates, org names, role titles — never fabricate
- Split multi-sentence bullets into individual array items
- Generate a unique hex id for every section and item
- Return ONLY valid JSON. No explanation, no markdown fences.

Schema:
{
  "meta": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
  "sections": [{
    "id": "hex",
    "type": "experience|education|skills|projects|custom",
    "title": "",
    "locked": false,
    "items": [{
      "id": "hex",
      "role": "", "org": "", "date": "", "location": "",
      "bullets": ["bullet 1"],
      "locked": false
    }]
  }]
}

Resume:
${text}`;

async function extractText(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  if (mimetype === 'application/pdf') {
    const result = await pdfParse(buffer);
    return result.text;
  }
  throw new Error('Unsupported file type');
}

async function llmExtract(rawText: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: EXTRACTION_PROMPT(rawText) }],
  });
  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return ResumeAST.parse(JSON.parse(content.text));
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const text = await extractText(req.file.buffer, req.file.mimetype);
    const ast = await llmExtract(text);
    res.json(ast);
  } catch (err: any) {
    res.status(422).json({ error: err.message });
  }
});

export default router;
```

### Verify

```bash
curl -X POST http://localhost:3001/parse \
  -F "file=@your_resume.pdf" | npx fx
# Pretty-printed ResumeAST JSON
```

---

## Block 3 — LaTeX Export: ResumeAST → PDF

**What you build:** `POST /export` — takes a `ResumeAST`, renders a LaTeX template, compiles with tectonic, returns PDF bytes.

**Prerequisites:** Block 2 complete. `tectonic` installed.

### Install tectonic

```bash
# macOS
brew install tectonic

# Linux
curl --proto '=https' --tlsv1.2 -fsSL https://drop.wtf/tectonic.sh | sh

# Windows — download binary from https://tectonic-typesetting.github.io
# Add to PATH
```

### Install dependencies

```bash
npm install tmp
npm install --save-dev @types/tmp
```

### How it works

```
ResumeAST  →  template string interpolation  →  resume.tex
                        │
                        ▼
               write to tmp directory
                        │
                        ▼
               child_process.execFile('tectonic', ['resume.tex'])
                        │
                        ▼
               read resume.pdf  →  res.send(buffer)
```

### Export route implementation

```typescript
// backend/src/routes/export.ts
import { Router } from 'express';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ResumeAST } from '../schemas/resume';

const execFileAsync = promisify(execFile);
const router = Router();

function renderLatex(ast: ResumeAST['_type']): string {
  const { meta, sections } = ast;

  const sectionBlocks = sections
    .filter(s => !s.locked)
    .map(section => {
      const items = section.items
        .filter(i => !i.locked)
        .map(item => {
          const bullets = item.bullets
            .map(b => `    \\item ${b.replace(/[&%$#_{}~^\\]/g, '\\$&')}`)
            .join('\n');
          return `
  \\textbf{${item.role ?? ''}} \\hfill ${item.date ?? ''} \\\\
  \\textit{${item.org ?? ''}} \\hfill ${item.location ?? ''}
  \\begin{itemize}[leftmargin=*, noitemsep, topsep=2pt]
${bullets}
  \\end{itemize}`;
        }).join('\n');

      return `
\\section*{${section.title}}
\\vspace{-8pt}\\hrule\\vspace{4pt}
${items}`;
    }).join('\n');

  return `\\documentclass[10pt, letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{hyperref, enumitem}
\\pagestyle{empty}
\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{${meta.name}}} \\\\[4pt]
  ${meta.email}${meta.phone ? ` $|$ ${meta.phone}` : ''}${meta.linkedin ? ` $|$ \\href{https://linkedin.com/in/${meta.linkedin}}{LinkedIn}` : ''}
\\end{center}
\\vspace{4pt}\\hrule\\vspace{8pt}
${sectionBlocks}
\\end{document}`;
}

router.post('/', async (req, res) => {
  try {
    const { ast } = req.body;
    const validated = ResumeAST.parse(ast);
    const latex = renderLatex(validated);

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openresume-'));
    const texPath = path.join(tmpDir, 'resume.tex');
    await fs.writeFile(texPath, latex, 'utf-8');

    await execFileAsync('tectonic', [texPath], { cwd: tmpDir, timeout: 30_000 });

    const pdfPath = texPath.replace('.tex', '.pdf');
    const pdfBuffer = await fs.readFile(pdfPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="resume.pdf"');
    res.send(pdfBuffer);

    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

### Verify

```bash
curl -X POST http://localhost:3001/export \
  -H "Content-Type: application/json" \
  -d '{"ast": <paste output from Block 2 here>}' \
  --output resume.pdf && open resume.pdf
```

---

## Block 4 — Single-Turn Agent (No Streaming, No LangGraph)

**What you build:** A basic `/agent/simple` test endpoint — validate prompt quality before graph complexity.

**Prerequisites:** Block 2 validated.

### Install

```bash
npm install @anthropic-ai/sdk
```

### Implementation

```typescript
// backend/src/routes/agent.ts — add temporary test endpoint
import Anthropic from '@anthropic-ai/sdk';
import { EditPatch } from '../schemas/resume';
import { z } from 'zod';

const anthropic = new Anthropic();

const SYSTEM = `You are a precision resume editor.

Rules (non-negotiable):
- ONLY modify bullets[]. Never touch role, org, date, location, structure.
- Surgical edits only — improve, do not rewrite from scratch.
- Preserve the candidate's voice, tense, and style.
- Never keyword-stuff. Integrate terms naturally.
- If you must insert a placeholder metric (e.g. X%), set note field.
- Max 8 patches per run. Quality over quantity.

Return ONLY a JSON array. No explanation, no markdown:
[{
  "item_id": "...",
  "section_title": "...",
  "original": "exact original bullet text",
  "proposed": "improved version",
  "reason": "one sentence — specific, references the JD",
  "note": "optional — only if user needs to fill in data"
}]`;

router.post('/simple', async (req, res) => {
  const { resume_ast, jd_text } = req.body;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{
      role: 'user',
      content: `Resume:\n${JSON.stringify(resume_ast)}\n\nJob Description:\n${jd_text}`
    }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const patches = z.array(EditPatch).parse(JSON.parse(text));
  res.json(patches);
});
```

### Evaluate output quality here

Before moving to Block 5, run this 10 times with different resumes and JDs:
- Does `original` exactly match a real bullet? (Must — `applyApproved` depends on this)
- Are reasons specific or generic? (Generic = fix the prompt)
- Does it hallucinate org names or dates? (Never acceptable)
- Does it stay under 8 patches?

---

## Block 5 — SSE Streaming with Vercel AI SDK

**What you build:** Convert `/agent` to stream tokens via SSE using `streamText` from the Vercel AI SDK.

**Prerequisites:** Block 4 validated.

### Install

```bash
npm install ai @ai-sdk/anthropic
```

### Vercel AI SDK vs raw Anthropic SDK

| | Vercel AI SDK | Anthropic SDK |
|--|---|---|
| `streamText()` | Yes — returns `ReadableStream` | `client.messages.stream()` |
| `useChat()` hook | Yes — frontend hook | Not applicable |
| Token counting | Built-in | Manual |
| Tool use | Built-in | Manual |
| Best for | Full Vercel AI + useChat flow | Raw control, non-Vercel |

Use Vercel AI SDK when the frontend `useChat` hook will consume the stream. It handles the protocol automatically.

### SSE event format

```
event: token
data: {"text": "Analyzing your experience section..."}

event: edits_ready
data: [{"item_id": "...", "proposed": "...", ...}]

event: checkpoint
data: {}

event: ast_updated
data: {"meta": {...}, "sections": [...]}

event: done
data: {}
```

### Streaming implementation

```typescript
// backend/src/routes/agent.ts
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

router.post('/', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { resume_ast, jd_text, session_id } = req.body;

    // Stream tokens as they generate
    const result = await streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Resume:\n${JSON.stringify(resume_ast)}\n\nJob Description:\n${jd_text}`
      }],
      onChunk({ chunk }) {
        if (chunk.type === 'text-delta') {
          sendEvent('token', { text: chunk.textDelta });
        }
      },
    });

    const fullText = await result.text;
    const patches = z.array(EditPatch).parse(JSON.parse(fullText));
    sendEvent('edits_ready', patches);
    sendEvent('done', {});
  } catch (err: any) {
    sendEvent('error', { message: err.message });
  } finally {
    res.end();
  }
});
```

### Test in terminal

```bash
curl -N -X POST http://localhost:3001/agent \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-1","resume_ast":{...},"jd_text":"..."}'
# Watch tokens stream line by line
```

---

## Block 6 — LangGraph.js Multi-Node Agent

**What you build:** Replace the single-turn agent with a proper `StateGraph` — three nodes, stateful, message history preserved across calls.

**Prerequisites:** Block 5 working.

### Install

```bash
npm install @langchain/langgraph @langchain/anthropic @langchain/core
```

### Graph structure

```
START
  │
  ▼
parseJd          →  jd_parsed dict
  │
  ▼
analyzeGaps      →  gap analysis message added to history
  │
  ▼
generateEdits    →  EditPatch[] → pending_edits
  │
  ▼
humanReview      ← INTERRUPT (next block)
  │
  ▼
applyApproved    →  updated resumeAst
  │
  ▼
shouldContinue?
  ├── 'generateEdits'  → loop
  └── END
```

### State definition (already in state.ts)

```typescript
// backend/src/agent/state.ts — already scaffolded
// AgentStateAnnotation uses Annotation.Root()
// MessagesState gives message history reducer for free
```

### Node implementations

```typescript
// backend/src/agent/nodes.ts
import { ChatAnthropic } from '@langchain/anthropic';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { AgentStateAnnotation } from './state';

const llm = new ChatAnthropic({ model: 'claude-3-5-sonnet-20241022', temperature: 0.3 });

export const parseJd = async (state: typeof AgentStateAnnotation.State) => {
  const response = await llm.invoke([
    new SystemMessage('Extract key requirements from this JD. Return JSON with: required_skills[], nice_to_have[], tone, key_verbs[], seniority_level.'),
    new HumanMessage(state.jdText),
  ]);
  return { jdParsed: JSON.parse(response.content as string) };
};

export const analyzeGaps = async (state: typeof AgentStateAnnotation.State) => {
  const response = await llm.invoke([
    new SystemMessage('Identify specific gaps between this resume and JD. Focus on bullet content only. Be concrete and concise.'),
    new HumanMessage(`Resume:\n${JSON.stringify(state.resumeAst)}\n\nJD requirements:\n${JSON.stringify(state.jdParsed)}`),
  ]);
  return { messages: [response] };
};

export const generateEdits = async (state: typeof AgentStateAnnotation.State) => {
  const messages = [
    ...state.messages,
    new HumanMessage(`Generate targeted edit patches. Resume: ${JSON.stringify(state.resumeAst)}`),
  ];
  const response = await llm.invoke([new SystemMessage(EDIT_SYSTEM_PROMPT), ...messages]);
  const patches = JSON.parse(response.content as string);
  return {
    pendingEdits: patches,
    messages: [response],
    iterationCount: (state.iterationCount || 0) + 1,
  };
};

export const applyApproved = (state: typeof AgentStateAnnotation.State) => {
  const ast = JSON.parse(JSON.stringify(state.resumeAst)); // deep clone
  const accepted = state.pendingEdits.filter(p => p.status === 'accepted');

  for (const patch of accepted) {
    for (const section of ast.sections) {
      for (const item of section.items) {
        if (item.id === patch.item_id) {
          item.bullets = item.bullets.map((b: string) =>
            b === patch.original ? patch.proposed : b
          );
        }
      }
    }
  }

  return {
    resumeAst: ast,
    approvedEdits: [...state.approvedEdits, ...accepted],
    pendingEdits: [],
  };
};
```

### Graph wiring (already in graph.ts)

```typescript
// backend/src/agent/graph.ts — already scaffolded
// Add interrupt_before: ['humanReview'] in Block 7
```

### Streaming with astream_events

```typescript
// In the route handler, replace streamText with LangGraph streaming:
for await (const event of graph.streamEvents(input, { version: 'v2', configurable: { thread_id: sessionId } })) {
  const { event: kind, name, data } = event;

  if (kind === 'on_chat_model_stream') {
    const chunk = data.chunk.content;
    if (chunk) sendEvent('token', { text: chunk });
  }

  if (kind === 'on_chain_end' && name === 'generateEdits') {
    sendEvent('edits_ready', data.output?.pendingEdits ?? []);
  }
}
```

---

## Block 7 — Human-in-the-Loop (interrupt / resume)

**What you build:** Graph pauses after `generateEdits`. Frontend shows edit cards. User decides. Frontend calls `POST /agent/resume`. Graph continues from exact pause point.

**Prerequisites:** Block 6 working. This is the most important block.

### How LangGraph.js interrupt works

```typescript
import { interrupt } from '@langchain/langgraph';

export const humanReview = (state: typeof AgentStateAnnotation.State) => {
  // Fires the interrupt — execution stops here
  // Entire state is serialised to MemorySaver keyed by thread_id
  interrupt({
    type: 'checkpoint',
    pending_edits: state.pendingEdits,
  });
  // Nothing below runs until graph.streamEvents() is called again
  // with the same thread_id
  return {};
};
```

### Compile the graph with interrupt

```typescript
// backend/src/agent/graph.ts
import { MemorySaver } from '@langchain/langgraph';

const checkpointer = new MemorySaver(); // swap for Redis in production

export const buildGraph = () => {
  const workflow = new StateGraph(AgentStateAnnotation)
    .addNode('parseJd', parseJd)
    .addNode('analyzeGaps', analyzeGaps)
    .addNode('generateEdits', generateEdits)
    .addNode('humanReview', humanReview)
    .addNode('applyApproved', applyApproved)
    .addEdge('__start__', 'parseJd')
    .addEdge('parseJd', 'analyzeGaps')
    .addEdge('analyzeGaps', 'generateEdits')
    .addEdge('generateEdits', 'humanReview')
    .addEdge('humanReview', 'applyApproved')
    .addConditionalEdges('applyApproved', shouldContinue);

  return workflow.compile({
    checkpointer,
    interruptBefore: ['humanReview'],  // ← pause before this node
  });
};
```

### Resume endpoint

```typescript
router.post('/resume', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { session_id, approved_patches } = req.body;
  const config = { configurable: { thread_id: session_id } };

  try {
    // Pass user decisions back — LangGraph loads saved state and continues
    for await (const event of graph.streamEvents(
      { pendingEdits: approved_patches },
      { version: 'v2', ...config }
    )) {
      if (event.event === 'on_chain_end' && event.name === 'applyApproved') {
        const ast = event.data?.output?.resumeAst;
        if (ast) sendEvent('ast_updated', ast);
      }
    }
    sendEvent('done', {});
  } catch (err: any) {
    sendEvent('error', { message: err.message });
  } finally {
    res.end();
  }
});
```

### Test the full loop

```bash
# 1. Start agent — watch stream stop at checkpoint
curl -N -X POST http://localhost:3001/agent \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-1","resume_ast":{...},"jd_text":"..."}'

# 2. Resume with user decisions
curl -N -X POST http://localhost:3001/agent/resume \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-1",
    "approved_patches": [
      {"item_id":"abc","status":"accepted",...},
      {"item_id":"def","status":"reverted",...}
    ]
  }'
# Watch event: ast_updated with modified bullets
```

---

## Block 8 — Frontend Integration

**What you build:** Wire the Next.js frontend to this backend. Add real data model to Zustand. Build `<ResumeDocument />` renderer.

**Prerequisites:** Blocks 1–7 complete. Frontend on port 3000.

### Step 1: Point frontend to this backend

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Add shared TypeScript types

```typescript
// frontend/src/types/resume.ts
// Mirror of backend/src/schemas/resume.ts
// Same interfaces — copy the type definitions exactly

export interface ResumeAST { ... }
export interface EditPatch { ... }
```

### Step 3: Expand Zustand store

```typescript
// frontend/src/store/useResumeStore.ts
// Add these fields to the existing store:

sessionId: string | null
resumeAst: ResumeAST | null
jdText: string
messages: ChatMessage[]
editPatches: EditPatch[]

setResumeAst: (ast: ResumeAST) => void
setJdText: (jd: string) => void
addMessage: (msg: ChatMessage) => void
setEditPatches: (patches: EditPatch[]) => void
updatePatchStatus: (itemId: string, status: 'accepted' | 'reverted') => void
```

### Step 4: Build `<ResumeDocument />` renderer

Replace the static Alex Rivera JSX with a real AST-driven renderer:

```typescript
// frontend/src/components/canvas/ResumeDocument.tsx
export function ResumeDocument({ ast }: { ast: ResumeAST }) {
  return (
    <div className="bg-white text-black p-14 min-h-[1056px]">
      <ResumeHeader meta={ast.meta} />
      <hr className="border-black my-4" />
      {ast.sections
        .filter(s => !s.locked)
        .map(section => (
          <ResumeSection
            key={section.id}
            section={section}
          />
        ))
      }
    </div>
  );
}

function ResumeSection({ section }: { section: ResumeSection }) {
  return (
    <div className="mb-6">
      <h2 className="text-[13px] font-bold uppercase tracking-wider border-b border-black pb-0.5 mb-3">
        {section.title}
      </h2>
      {section.items.filter(i => !i.locked).map(item => (
        <ResumeItem key={item.id} item={item} sectionType={section.type} />
      ))}
    </div>
  );
}
```

### Step 5: useChat hook (Vercel AI SDK)

```typescript
// frontend/src/hooks/useAgentStream.ts
// Consume SSE from /agent using Vercel AI SDK's useChat
// or a manual EventSource reader

export function useAgentStream() {
  const store = useResumeStore();

  const startSession = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: store.sessionId,
        resume_ast: store.resumeAst,
        jd_text: store.jdText,
        message: 'Optimize my resume for this role',
      }),
    });

    // Parse SSE stream
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('event: ')) currentEvent = line.slice(7).trim();
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          if (currentEvent === 'token') store.addMessage({ role: 'ai', text: data.text });
          if (currentEvent === 'edits_ready') store.setEditPatches(data);
          if (currentEvent === 'ast_updated') store.setResumeAst(data);
        }
      }
    }
  };

  return { startSession };
}
```

### Smoke test checklist

```
□ Upload real PDF → ResumeAST appears in store (log it)
□ Paste JD → click "Open Canvas" → tokens stream into ChatPanel
□ Edit cards render from real EditPatch[] data
□ Press Y → acceptEdit() + updatePatchStatus() → POST /agent/resume
□ event: ast_updated → ResumeDocument re-renders with new bullets
□ Export PDF → real PDF with your actual resume content
□ Navigate directly to /canvas without onboarding → redirected to /onboarding
```

---

## Block 9 — Supabase: Persistence + Version History

**What you build:** Replace in-memory version store with Supabase Postgres.

**Prerequisites:** Block 8 smoke-tested. Supabase project created.

### Install

```bash
npm install @supabase/supabase-js
```

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

alter table resume_versions enable row level security;

create policy "own versions only"
  on resume_versions for all
  using (user_id = current_setting('app.user_id', true));
```

### Supabase client

```typescript
// backend/src/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

### Update versions route

```typescript
// backend/src/routes/versions.ts
import { supabase } from '../db/supabase';

router.post('/', async (req, res) => {
  const { resume_id, label, ast, jd_text, user_id } = req.body;
  const { data, error } = await supabase
    .from('resume_versions')
    .insert({ user_id, label, ast, jd_text })
    .select('id')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ id: data.id });
});

router.get('/:userId', async (req, res) => {
  const { data, error } = await supabase
    .from('resume_versions')
    .select('id, label, created_at')
    .eq('user_id', req.params.userId)
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});
```

### LangGraph.js checkpointer — swap for Redis in production

```typescript
// MemorySaver is fine for development but state is lost on restart
// Replace with a persistent store for production:

import { RedisSaver } from '@langchain/langgraph-checkpoint-redis';

const checkpointer = new RedisSaver({ url: process.env.REDIS_URL! });
// Same compile() call — just swap the checkpointer
```

---

## Block 10 — Auth: Clerk JWT Validation

**What you build:** Validate Clerk JWT tokens on protected endpoints via Clerk's Express middleware.

**Prerequisites:** Block 9 complete. Clerk project created. Frontend has `@clerk/nextjs` installed.

### Install

```bash
npm install @clerk/express
```

### Add to Express app

```typescript
// backend/src/index.ts
import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

app.use(clerkMiddleware());

// All routes below this are public
app.use('/parse', parseRouter);

// All routes below this require auth
app.use('/versions', requireAuth(), versionsRouter);
app.use('/export', requireAuth(), exportRouter);
app.use('/agent', requireAuth(), agentRouter);
```

### Extract user ID in routes

```typescript
import { getAuth } from '@clerk/express';

router.get('/:userId', async (req, res) => {
  const { userId } = getAuth(req);
  if (userId !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
  // fetch from Supabase with this userId...
});
```

### Frontend — send auth token

```typescript
// All API calls need the Clerk session token
import { useAuth } from '@clerk/nextjs';

const { getToken } = useAuth();
const token = await getToken();

fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  ...
});
```

---

## Block 11 — Model Switching (Claude / GPT-4o / Ollama)

**What you build:** Allow the user to select the LLM from the settings page. Pass it in `AgentRequest`. Backend routes to the right model.

**Prerequisites:** Block 10 complete.

### Install

```bash
npm install @ai-sdk/openai ollama
```

### Model abstraction

```typescript
// backend/src/llm/client.ts
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { createOllama } from 'ollama-ai-provider';

export type Provider = 'anthropic' | 'openai' | 'ollama';

export function getModel(provider: Provider, model?: string, baseUrl?: string) {
  switch (provider) {
    case 'anthropic':
      return anthropic(model ?? 'claude-3-5-sonnet-20241022');
    case 'openai':
      return openai(model ?? 'gpt-4o');
    case 'ollama': {
      const ollama = createOllama({ baseURL: baseUrl ?? 'http://localhost:11434/api' });
      return ollama(model ?? 'llama3:8b-instruct-q4_K_M');
    }
  }
}
```

### Add to AgentRequest

```typescript
interface AgentRequest {
  session_id: string;
  message: string;
  resume_ast: ResumeAST;
  jd_text: string;
  provider?: 'anthropic' | 'openai' | 'ollama';
  model?: string;
  api_key?: string;    // BYOK — user's own key
  base_url?: string;   // Ollama custom endpoint
}
```

### POST /models/test — validate key + fetch model list

The settings page calls this before saving credentials. Returns `{ ok, model_list? }`.

```typescript
// backend/src/routes/models.ts  (already scaffolded — mounted at /models)
// POST /models/test
// Body: { provider, api_key?, base_url? }
// Response: { ok: boolean, model_list?: string[], error?: string }
```

```typescript
// Anthropic — uses client.models.list()
const client = new Anthropic({ apiKey: api_key ?? process.env.ANTHROPIC_API_KEY });
const response = await client.models.list({ limit: 20 });
return { ok: true, model_list: response.data.map(m => m.id) };

// OpenAI — filter to GPT models only
const client = new OpenAI({ apiKey: api_key ?? process.env.OPENAI_API_KEY });
const response = await client.models.list();
return { ok: true, model_list: response.data.map(m => m.id).filter(id => id.startsWith('gpt')) };

// Ollama — hit local /api/tags
const response = await fetch(`${base_url ?? 'http://localhost:11434'}/api/tags`);
const data = await response.json();
return { ok: true, model_list: data.models.map(m => m.name) };
```

### Verify

```bash
# Test Anthropic key
curl -X POST http://localhost:3001/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"anthropic","api_key":"sk-ant-..."}'
# {"ok":true,"model_list":["claude-3-5-sonnet-20241022","claude-3-opus-20240229",...]}

# Test with invalid key
curl -X POST http://localhost:3001/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","api_key":"invalid"}'
# {"ok":false,"error":"401 Incorrect API key"}

# Test Ollama (requires local Ollama running)
curl -X POST http://localhost:3001/models/test \
  -H "Content-Type: application/json" \
  -d '{"provider":"ollama"}'
# {"ok":true,"model_list":["llama3:8b","mistral:7b",...]}
```

---

## Block 12 — Deploy: Vercel (API Routes) or Railway

**Two deployment options for `main`:**

### Option A — Vercel (Next.js API Routes)

Convert the Express routes to Next.js API Routes. Frontend and backend deploy together on Vercel.

```
frontend/
  src/
    app/
      api/
        parse/route.ts       ← POST /parse
        agent/route.ts       ← POST /agent (SSE)
        agent/resume/route.ts
        export/route.ts
        versions/route.ts
```

```typescript
// frontend/src/app/api/parse/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  // ... same logic as Express route
  return Response.json(ast);
}

// For SSE streaming:
// frontend/src/app/api/agent/route.ts
export async function POST(request: Request) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  // ... write SSE events to writer
  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream' }
  });
}
```

Deploy: `vercel --prod` — done. Frontend URL = backend URL.

### Option B — Railway (Keep Express)

Keep the Express server as-is, deploy to Railway alongside the Vercel frontend.

```bash
# Install Railway CLI
npm install -g @railway/cli

# From the backend/ directory
railway login
railway init
railway up

# Set env vars
railway variables set ANTHROPIC_API_KEY=sk-ant-...
# ... all other vars

# Get public URL
railway domain
# → https://openresume-api.up.railway.app
```

Update `frontend/.env` on Vercel:
```bash
NEXT_PUBLIC_API_URL=https://openresume-api.up.railway.app
```

**Recommendation:** Start with Option B (Railway) — zero refactoring. Move to Option A (Next.js API Routes) later if you want a single Vercel deployment.

---

## Build Order Summary

| Block | Endpoint | Test signal |
|-------|----------|-------------|
| 1 | `GET /health` | `{"status":"ok","backend":"node"}` |
| 2 | `POST /parse` | Valid `ResumeAST` from real resume |
| 3 | `POST /export` | Downloaded PDF opens correctly |
| 4 | `POST /agent/simple` | Valid `EditPatch[]` for real resume + JD |
| 5 | `POST /agent` (SSE) | Tokens stream in terminal |
| 6 | `POST /agent` (LangGraph) | Multi-node events visible in stream |
| 7 | `POST /agent/resume` | `ast_updated` with modified bullets |
| 8 | Frontend wired | Full browser flow works end-to-end |
| 9 | `GET /versions/:id` | Versions survive server restart |
| 10 | Auth header | 401 without Clerk token, 200 with it |
| 11 | `POST /models/test` | `{"ok":true,"model_list":[...]}` |
| 12 | Deployed URL | Production health check passes |

---

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| `/parse` | < 2s | LLM call is bottleneck — use `claude-haiku` for parsing if needed |
| First SSE token | < 2s | Streaming starts immediately, not after full response |
| Full edit run | < 15s | 3 LLM calls in series — streaming throughout |
| `/export` PDF | < 3s | tectonic first run downloads packages (slow once only) |
| Canvas re-render | < 100ms | Zustand + React — should be instant |

---

## Common Failure Modes

| Failure | Cause | Fix |
|---------|-------|-----|
| Zod parse error on LLM output | Model returned markdown-wrapped JSON | Strip ` ```json ... ``` ` before parsing |
| `original` doesn't match any bullet | LLM paraphrased instead of copying | Stricter prompt: "copy character for character" |
| LangGraph state lost | `MemorySaver` wiped on restart | Swap to `RedisSaver` (Block 9) |
| SSE connection drops | 30s timeout on some proxies/Vercel | Add `: keep-alive` comment events every 20s |
| tectonic fails first run | Downloading packages needs internet | Run `tectonic --chatter max resume.tex` once locally to warm cache |
| CORS error | Frontend origin not in `allow_origins` | Add exact Vercel URL including `https://` |
| `interruptBefore` not pausing | LangGraph version mismatch | Check `@langchain/langgraph` >= 0.2.0 |
