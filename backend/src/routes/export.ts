import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  // convert ResumeAST -> Jinja2 -> TeX -> Tectonic -> PDF
  
  res.json({ success: true });
});

export default router;
