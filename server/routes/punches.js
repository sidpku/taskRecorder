import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readDayFile, writeDayFile } from '../utils/data.js';
import { getBeijingDateString, normalizeToBeijingISOString, parseBeijingTime } from '../utils/beijingTime.js';

const router = Router();

/**
 * 从 ISO 时间字符串中提取日期部分 YYYY-MM-DD
 */
function extractDate(timeStr) {
  return timeStr.slice(0, 10);
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getTodayDate() {
  return getBeijingDateString();
}

/**
 * 按时间升序排序记录
 */
function sortByTime(records) {
  return records.sort((a, b) => parseBeijingTime(a.time) - parseBeijingTime(b.time));
}

// GET /api/punches?date=YYYY-MM-DD
router.get('/', (req, res) => {
  const date = req.query.date || getTodayDate();
  const records = readDayFile(date);
  res.json(records);
});

// POST /api/punches
router.post('/', (req, res) => {
  const { time, description } = req.body;

  if (!time) {
    return res.status(400).json({ error: 'time is required' });
  }

  const normalizedTime = normalizeToBeijingISOString(time);
  const date = extractDate(normalizedTime);
  const record = {
    id: uuidv4(),
    time: normalizedTime,
    description: description || ''
  };

  const records = readDayFile(date);
  records.push(record);
  sortByTime(records);
  writeDayFile(date, records);

  res.status(201).json(record);
});

// PUT /api/punches/:id?date=YYYY-MM-DD
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const date = req.query.date;

  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required' });
  }

  const records = readDayFile(date);
  const index = records.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const { time, description, notes } = req.body;

  if (time !== undefined) {
    records[index].time = normalizeToBeijingISOString(time);
  }
  if (description !== undefined) {
    records[index].description = description;
  }
  if (notes !== undefined) {
    records[index].notes = notes;
  }

  sortByTime(records);
  writeDayFile(date, records);

  const updated = records.find(r => r.id === id);
  res.json(updated);
});

// DELETE /api/punches/:id?date=YYYY-MM-DD
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const date = req.query.date;

  if (!date) {
    return res.status(400).json({ error: 'date query parameter is required' });
  }

  const records = readDayFile(date);
  const index = records.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  records.splice(index, 1);
  writeDayFile(date, records);

  res.status(204).send();
});

export default router;
