import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_DIR = join(__dirname, '..', 'data');

// 确保 data 目录存在
mkdirSync(DATA_DIR, { recursive: true });

/**
 * 读取指定日期的打卡文件
 * @param {string} date - 格式 YYYY-MM-DD
 * @returns {Array} 打卡记录数组，文件不存在返回空数组
 */
export function readDayFile(date) {
  const filePath = join(DATA_DIR, `${date}.json`);
  if (!existsSync(filePath)) {
    return [];
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入指定日期的打卡数据
 * @param {string} date - 格式 YYYY-MM-DD
 * @param {Array} records - 打卡记录数组
 */
export function writeDayFile(date, records) {
  const filePath = join(DATA_DIR, `${date}.json`);
  writeFileSync(filePath, JSON.stringify(records, null, 2), 'utf-8');
}

/**
 * 读取标签数据
 * @returns {Array} 标签数组，文件不存在返回空数组
 */
export function readTags() {
  const filePath = join(DATA_DIR, 'tags.json');
  if (!existsSync(filePath)) {
    return [];
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入标签数据
 * @param {Array} tags - 标签数组
 */
export function writeTags(tags) {
  const filePath = join(DATA_DIR, 'tags.json');
  writeFileSync(filePath, JSON.stringify(tags, null, 2), 'utf-8');
}

/**
 * 读取指定日期的碎片时间文件
 * @param {string} date - 格式 YYYY-MM-DD
 * @returns {Array} 碎片记录数组，文件不存在返回空数组
 */
export function readFragments(date) {
  const filePath = join(DATA_DIR, `fragments-${date}.json`);
  if (!existsSync(filePath)) {
    return [];
  }
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * 写入指定日期的碎片时间数据
 * @param {string} date - 格式 YYYY-MM-DD
 * @param {Array} fragments - 碎片记录数组
 */
export function writeFragments(date, fragments) {
  const filePath = join(DATA_DIR, `fragments-${date}.json`);
  writeFileSync(filePath, JSON.stringify(fragments, null, 2), 'utf-8');
}
