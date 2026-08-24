import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isFresh, formatNewsDate, NEWS_SHELF_LIFE_MONTHS } from './news.ts';

const NOW = new Date('2026-08-21T00:00:00Z');

test('shelf life is four months', () => {
  assert.equal(NEWS_SHELF_LIFE_MONTHS, 4);
});

test('an item from this month is fresh', () => {
  assert.equal(isFresh(new Date('2026-08-01'), NOW), true);
});

test('an item just inside the shelf life is fresh', () => {
  assert.equal(isFresh(new Date('2026-04-22'), NOW), true);
});

test('an item just outside the shelf life is stale', () => {
  assert.equal(isFresh(new Date('2026-04-20'), NOW), false);
});

test('the expired semester-2 announcement is stale', () => {
  assert.equal(isFresh(new Date('2026-01-01'), NOW), false);
});

test('a future-dated item is fresh', () => {
  assert.equal(isFresh(new Date('2026-09-28'), NOW), true);
});

test('shelf life is overridable', () => {
  assert.equal(isFresh(new Date('2026-01-01'), NOW, 12), true);
});

test('dates format as month and year', () => {
  assert.equal(formatNewsDate(new Date('2025-10-01T00:00:00Z')), 'October 2025');
});
