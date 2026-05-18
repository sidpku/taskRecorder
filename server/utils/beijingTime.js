const BEIJING_OFFSET_MINUTES = 8 * 60;
const BEIJING_OFFSET_MS = BEIJING_OFFSET_MINUTES * 60 * 1000;

function pad(value, length = 2) {
  return String(value).padStart(length, '0');
}

export function toBeijingISOString(date = new Date()) {
  const beijing = new Date(date.getTime() + BEIJING_OFFSET_MS);
  const year = beijing.getUTCFullYear();
  const month = pad(beijing.getUTCMonth() + 1);
  const day = pad(beijing.getUTCDate());
  const hour = pad(beijing.getUTCHours());
  const minute = pad(beijing.getUTCMinutes());
  const second = pad(beijing.getUTCSeconds());
  const ms = pad(beijing.getUTCMilliseconds(), 3);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}`;
}

export function getBeijingDateString(date = new Date()) {
  return toBeijingISOString(date).slice(0, 10);
}

export function normalizeToBeijingISOString(timeString) {
  const date = parseBeijingTime(timeString);
  if (Number.isNaN(date.getTime())) {
    return timeString;
  }
  return toBeijingISOString(date);
}

export function parseBeijingTime(timeString) {
  if (typeof timeString !== 'string') {
    return new Date(timeString);
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/.test(timeString)) {
    return new Date(`${timeString}+08:00`);
  }
  return new Date(timeString);
}
