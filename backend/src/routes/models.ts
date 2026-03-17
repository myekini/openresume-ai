import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const TestRequest = z.object({
  provider: z.enum(['anthropic', 'openai', 'ollama']),
  api_key: z.string().optional(),
  base_url: z.string().optional(),
});

/**
 * POST /models/test
 * Validates an API key and returns the available model list for that provider.
 * Body: { provider, api_key?, base_url? }
 * Response: { ok: boolean, model_list?: string[], error?: string }
 */
router.post('/test', async (req, res) => {
  const parsed = TestRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.message });
  }

  const { provider, api_key, base_url } = parsed.data;

  try {
    if (provider === 'anthropic') {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      const client = new Anthropic({ apiKey: api_key ?? process.env.ANTHROPIC_API_KEY });
      // Lightweight call — list models endpoint
      const response = await client.models.list({ limit: 20 });
      const model_list = response.data.map((m: { id: string }) => m.id);
      return res.json({ ok: true, model_list });
    }

    if (provider === 'openai') {
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: api_key ?? process.env.OPENAI_API_KEY });
      const response = await client.models.list();
      const model_list = response.data
        .map((m: { id: string }) => m.id)
        .filter((id: string) => id.startsWith('gpt'))
        .sort();
      return res.json({ ok: true, model_list });
    }

    if (provider === 'ollama') {
      const endpoint = base_url ?? 'http://localhost:11434';
      const response = await fetch(`${endpoint}/api/tags`);
      if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
      const data = await response.json() as { models: Array<{ name: string }> };
      const model_list = data.models.map((m) => m.name);
      return res.json({ ok: true, model_list });
    }
  } catch (err: any) {
    return res.json({ ok: false, error: err.message });
  }
});

export default router;
