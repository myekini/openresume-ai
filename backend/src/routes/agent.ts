import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  // Start agent session via LangGraph
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(`data: ${JSON.stringify({ message: "Started" })}\n\n`);
  
  // TODO: implement LangGraph astreamEvents and Vercel AI useChat streaming
  
  res.end();
});

router.post('/resume', async (req, res) => {
  // Resume stopped graph
  res.json({ success: true });
});

export default router;
