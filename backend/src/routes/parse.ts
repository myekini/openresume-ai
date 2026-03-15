import { Router } from 'express';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // TODO: implement mammoth or pdf-parse to extract text, and LLM to get AST
    res.json({ message: 'File uploaded completely' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse file' });
  }
});

export default router;
