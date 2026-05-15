import { Router } from 'express';
import { readDayFile, readFragments } from '../utils/data.js';

const router = Router();

/**
 * 遍历日期范围内的每一天（含首尾），返回日期字符串数组
 */
function getDateRange(start, end) {
  const dates = [];
  const current = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  while (current <= last) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * 格式化时间为 YYYY-MM-DD HH:mm
 */
function formatTime(isoString) {
  const d = new Date(isoString);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

/**
 * CSV 字段转义：包含逗号时用双引号包裹
 */
function escapeCSV(value) {
  if (value && value.includes(',')) {
    return `"${value}"`;
  }
  return value || '';
}

// GET /api/export?start=YYYY-MM-DD&end=YYYY-MM-DD
router.get('/', (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res.status(400).json({ error: '缺少必填参数 start 和 end' });
  }

  const dates = getDateRange(start, end);
  const rows = [];

  for (const date of dates) {
    const punches = readDayFile(date);
    const fragments = readFragments(date);
    // 按时间排序
    punches.sort((a, b) => new Date(a.time) - new Date(b.time));

    // 相邻打卡配对为时间段
    for (let i = 0; i < punches.length - 1; i++) {
      const startPunch = punches[i];
      const endPunch = punches[i + 1];
      const startTime = formatTime(startPunch.time);
      const endTime = formatTime(endPunch.time);
      const durationMs = new Date(endPunch.time) - new Date(startPunch.time);
      const totalDurationMin = Math.round(durationMs / 60000);
      const description = escapeCSV(endPunch.description);

      // 找出属于该时间段的碎片（endTime 在 (startPunch.time, endPunch.time] 范围内）
      const belongingFragments = fragments.filter(f => {
        const fEnd = new Date(f.endTime).getTime();
        const segStart = new Date(startPunch.time).getTime();
        const segEnd = new Date(endPunch.time).getTime();
        return fEnd > segStart && fEnd <= segEnd;
      });

      // 计算碎片总时长
      const fragmentsTotalMin = belongingFragments.reduce((sum, f) => sum + f.duration, 0);
      // 净时长 = 总时长 - 碎片时长
      const netDurationMin = totalDurationMin - fragmentsTotalMin;

      rows.push(`${startTime},${endTime},${netDurationMin},${description}`);

      // 碎片行紧跟在其所属主时间段之后
      for (const frag of belongingFragments) {
        const fragStartTime = new Date(new Date(frag.endTime).getTime() - frag.duration * 60000).toISOString();
        const fragStartFormatted = formatTime(fragStartTime);
        const fragEndFormatted = formatTime(frag.endTime);
        const fragDesc = escapeCSV(`[碎片] ${frag.description}`);
        rows.push(`${fragStartFormatted},${fragEndFormatted},${frag.duration},${fragDesc}`);
      }
    }
  }

  const header = '开始时间,结束时间,时长(分钟),描述';
  const csvContent = '\uFEFF' + header + '\n' + rows.join('\n') + '\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="time-records-${start}-to-${end}.csv"`
  );
  res.send(csvContent);
});

export default router;
