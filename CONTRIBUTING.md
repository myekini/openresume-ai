# Contributing to OpenResume AI

Thanks for your interest. Here's how to contribute cleanly.

## Branch Targets

| What you're changing | Base branch |
|----------------------|-------------|
| `frontend/` | `main` |
| `backend/` (Node.js) | `main` |
| `backend-py/` (Python) | `dev/muhammad` |

## Workflow

```bash
# 1. Fork the repo, then clone your fork
git clone https://github.com/YOUR_USERNAME/openresume-ai.git

# 2. Branch off the correct base
git checkout -b feat/your-feature main          # frontend or Node backend
git checkout -b feat/your-feature dev/muhammad  # Python backend

# 3. Make your changes, commit with a clear message
git commit -m "feat: short description of what and why"

# 4. Push and open a PR against the correct base branch
git push origin feat/your-feature
```

## Commit Style

```
feat:     new feature
fix:      bug fix
chore:    build, deps, config — no production code change
docs:     documentation only
refactor: code change that neither fixes a bug nor adds a feature
```

## Before Opening a PR

- Frontend: `cd frontend && npm run build` passes with no errors
- Node backend: `cd backend && npm run typecheck` passes
- Python backend: files are importable (`python -c "from main import app"`)
- No `.env` files committed
- No `node_modules/` or `.venv/` committed

## Opening Issues

Please open an issue before submitting a large PR so we can align on approach first.
