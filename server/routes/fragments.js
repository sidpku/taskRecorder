import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readFragments, writeFragments } from '../utils/data.js';

const router = Router();

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayDate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// GET /api/fragments?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const date = req.query.date || getTodayDate();
  const fragments = readFragments(date);
  res.json(fragments);
});

// POST /api/fragments
router.post('/', (req, res) => {
  const { duration, description } = req.body;

  if (duration === undefined || duration === null) {
    return res.status(400).json({ error: 'duration is required' });
  }

  const endTime = new Date().toISOString();
  const date = endTime.slice(0, 10);

  const fragment = {
    id: uuidv4(),
    endTime,
    duration: Number(duration),
    description: description || ''
  };

  const fragments = readFragments(date);
  fragments.push(fragment);
  writeFragments(date, fragments);

  // 返回时包含计算出的 startTime
  const startTime = new Date(new Date(endTime).getTime() - fragment.duration * 60000).toISOString();
  res.status(201).json({ ...fragment, startTime });
});

// DELETE /api/fragments/:id?date=YYYY-MM-DD
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const date = req.query.date || getTodayDate();

  const fragments = readFragments(date);
  const index = fragments.findIndex(f => f.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Fragment not found' });
  }

  fragments.splice(index, 1);
  writeFragments(date, fragments);

  res.status(204).send();
});

export default router;
