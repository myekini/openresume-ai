from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="OpenResume AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.parse import router as parse_router
from routes.agent import router as agent_router
from routes.export import router as export_router
from routes.versions import router as versions_router
from routes.models import router as models_router

app.include_router(parse_router, prefix="/parse")
app.include_router(agent_router, prefix="/agent")
app.include_router(export_router, prefix="/export")
app.include_router(versions_router, prefix="/versions")
app.include_router(models_router, prefix="/models")


@app.get("/health")
def health():
    return {"status": "ok", "backend": "python"}
