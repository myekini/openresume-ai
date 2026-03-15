import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import parseRouter from './routes/parse';
import agentRouter from './routes/agent';
import exportRouter from './routes/export';
import versionsRouter from './routes/versions';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/parse', parseRouter);
app.use('/agent', agentRouter);
app.use('/export', exportRouter);
app.use('/versions', versionsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', backend: 'node' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
