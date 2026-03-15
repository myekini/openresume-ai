import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  // Create new version snapshot (Supabase/DB layer)
  res.json({ success: true });
});

router.get('/:userId', async (req, res) => {
  res.json({ versions: [] });
});

router.get('/detail/:id', async (req, res) => {
  res.json({ version: null });
});

export default router;
