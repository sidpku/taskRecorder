import express from 'express';
import cors from 'cors';
import punchesRouter from './routes/punches.js';
import exportRouter from './routes/export.js';
import tagsRouter from './routes/tags.js';
import fragmentsRouter from './routes/fragments.js';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 确保 data/ 目录存在
mkdirSync(join(__dirname, 'data'), { recursive: true });

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 打卡路由
app.use('/api/punches', punchesRouter);

// 标签路由
app.use('/api/tags', tagsRouter);

// 碎片时间路由
app.use('/api/fragments', fragmentsRouter);

// 导出路由
app.use('/api/export', exportRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
