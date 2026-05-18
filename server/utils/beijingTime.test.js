import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getBeijingDateString,
  normalizeToBeijingISOString,
  toBeijingISOString
} from './beijingTime.js';

test('formats instants as explicit Beijing ISO timestamps', () => {
  const utcInstant = new Date('2026-05-18T01:51:28.930Z');

  assert.equal(toBeijingISOString(utcInstant), '2026-05-18T09:51:28.930');
});

test('uses Beijing calendar date even when UTC date is previous day', () => {
  const utcInstant = new Date('2026-05-17T16:30:00.000Z');

  assert.equal(getBeijingDateString(utcInstant), '2026-05-18');
});

test('normalizes stored UTC timestamps to Beijing timestamps preserving the instant', () => {
  assert.equal(
    normalizeToBeijingISOString('2026-05-18T03:00:14.134Z'),
    '2026-05-18T11:00:14.134'
  );
});
