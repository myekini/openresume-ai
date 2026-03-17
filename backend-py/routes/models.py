"""
POST /models/test
Validates an API key and returns the available model list for a provider.
Body: { provider, api_key?, base_url? }
Response: { ok: bool, model_list?: list[str], error?: str }
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Literal
import os

router = APIRouter()


class TestRequest(BaseModel):
    provider: Literal["anthropic", "openai", "ollama"]
    api_key: str | None = None
    base_url: str | None = None


@router.post("/test")
async def test_model_connection(body: TestRequest):
    try:
        if body.provider == "anthropic":
            import anthropic
            client = anthropic.Anthropic(api_key=body.api_key or os.environ["ANTHROPIC_API_KEY"])
            response = client.models.list(limit=20)
            model_list = [m.id for m in response.data]
            return {"ok": True, "model_list": model_list}

        if body.provider == "openai":
            from openai import OpenAI
            client = OpenAI(api_key=body.api_key or os.environ.get("OPENAI_API_KEY"))
            response = client.models.list()
            model_list = sorted([m.id for m in response.data if m.id.startswith("gpt")])
            return {"ok": True, "model_list": model_list}

        if body.provider == "ollama":
            import httpx
            endpoint = body.base_url or "http://localhost:11434"
            async with httpx.AsyncClient() as client:
                r = await client.get(f"{endpoint}/api/tags", timeout=5)
                r.raise_for_status()
                data = r.json()
            model_list = [m["name"] for m in data.get("models", [])]
            return {"ok": True, "model_list": model_list}

    except Exception as e:
        return {"ok": False, "error": str(e)}
