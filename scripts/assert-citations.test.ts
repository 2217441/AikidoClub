import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findViolations, parseConcept } from './assert-citations.ts';

const published = {
  file: 'a.md',
  draft: false,
  grounding: [{ type: 'quran', ref: '2:255', status: 'verified' }],
};

test('a published concept with verified citations is clean', () => {
  assert.deepEqual(findViolations([published]), []);
});

test('a published concept with a pending citation is a violation', () => {
  const bad = { ...published, grounding: [{ type: 'quran', ref: 'TBD', status: 'pending' }] };
  const violations = findViolations([bad]);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].file, 'a.md');
  assert.match(violations[0].message, /pending/);
});

test('a published concept with an unverified citation is a violation', () => {
  const bad = { ...published, grounding: [{ type: 'scholar', ref: 'x', status: 'unverified' }] };
  assert.equal(findViolations([bad]).length, 1);
});

test('a draft may cite anything', () => {
  const draft = { ...published, draft: true, grounding: [{ type: 'quran', ref: 'TBD', status: 'pending' }] };
  assert.deepEqual(findViolations([draft]), []);
});

test('a published concept with no citations at all is a violation', () => {
  const bare = { ...published, grounding: [] };
  const violations = findViolations([bare]);
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /no grounding/);
});

test('every bad citation in one file is reported', () => {
  const bad = {
    ...published,
    grounding: [
      { type: 'quran', ref: 'a', status: 'pending' },
      { type: 'hadith', ref: 'b', status: 'unverified' },
    ],
  };
  assert.equal(findViolations([bad]).length, 2);
});

test('parseConcept reads draft and grounding from frontmatter', () => {
  const source = [
    '---',
    'name_en: "X"',
    'description: "d"',
    'grounding:',
    '  - type: quran',
    '    ref: "2:255"',
    '    status: verified',
    'draft: false',
    '---',
    '',
    'body',
  ].join('\n');
  const parsed = parseConcept('x.md', source);
  assert.equal(parsed.draft, false);
  assert.equal(parsed.grounding.length, 1);
  assert.equal(parsed.grounding[0].status, 'verified');
  assert.equal(parsed.grounding[0].ref, '2:255');
});

test('parseConcept treats a missing draft field as draft', () => {
  const source = '---\nname_en: "X"\ndescription: "d"\n---\n\nbody';
  assert.equal(parseConcept('x.md', source).draft, true);
});
