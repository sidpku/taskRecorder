import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readTags, writeTags } from '../utils/data.js';

const router = Router();

/**
 * 根据已有标签数量生成鲜明可区分的颜色
 */
function generateColor(existingTags) {
  const hueStep = 137.5; // 黄金角，确保颜色分散
  const hue = (existingTags.length * hueStep) % 360;
  return `hsl(${Math.round(hue)}, 65%, 55%)`;
}

// GET /api/tags - 返回所有标签
router.get('/', (req, res) => {
  const tags = readTags();
  res.json(tags);
});

// POST /api/tags - 创建标签
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: '标签名称不能为空' });
  }

  const tags = readTags();
  const newTag = {
    id: uuidv4(),
    name: name.trim(),
    color: generateColor(tags),
  };

  tags.push(newTag);
  writeTags(tags);
  res.status(201).json(newTag);
});

// PUT /api/tags/:id - 更新标签（部分更新）
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const tags = readTags();
  const index = tags.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '标签不存在' });
  }

  const { name, color } = req.body;
  if (name !== undefined) tags[index].name = name;
  if (color !== undefined) tags[index].color = color;

  writeTags(tags);
  res.json(tags[index]);
});

// DELETE /api/tags/:id - 删除标签
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const tags = readTags();
  const index = tags.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '标签不存在' });
  }

  const deleted = tags.splice(index, 1)[0];
  writeTags(tags);
  res.json(deleted);
});

export default router;
