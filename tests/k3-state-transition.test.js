import test from 'node:test';
import assert from 'node:assert/strict';
import { migrateState } from '../src/state/migrate.js';

const TRACK_ID = 'sdaia-ai-engineer';
const ctx = {
  anonId: '123e4567-e89b-42d3-a456-426614174000',
  questionIdMap: { q1: 'question.v1' },
  trackId: TRACK_ID,
  trackVersion: '2026.09',
  examProfileId: 'sdaia-ai-engineer.project-reference.v1',
  examProfileVersion: '1'
};

function preK3StateV2() {
  return {
    version: 2,
    anon_id: ctx.anonId,
    created_at: '2026-09-09T00:00:00Z',
    updated_at: '2026-09-09T00:30:00Z',
    preferences: { lang: 'en', theme: 'dark' },
    tracks: {
      [TRACK_ID]: {
        track_version: '2026.09',
        active_exam: {
          id: 'pre-k3-active',
          mode: 'full',
          questionIds: ['question.v1'],
          index: 0,
          answers: { 'question.v1': 2 },
          confidence: { 'question.v1': 'medium' },
          flags: {},
          optionOrders: { 'question.v1': [0, 1, 2, 3] },
          started_at: '2026-09-09T00:20:00Z',
          submitted: false
        },
        exam_history: [
          {
            attempt: {
              id: 'pre-k3-submitted',
              started_at: '2026-09-08T10:00:00Z',
              submitted_at: '2026-09-08T10:20:00Z',
              submitted: true
            },
            result: { correct: 7, total: 10 }
          }
        ]
      }
    },
    legacy: { source_version: 2, preserved: {} }
  };
}

function temporalPaths(value, path = '$', out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => temporalPaths(item, `${path}[${index}]`, out));
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (/(?:_at|timestamp|_time)$/i.test(key)) out.push(childPath);
    temporalPaths(child, childPath, out);
  }
  return out;
}

test('first K3 transition preserves an active StateV2 attempt on the legacy compatibility path', () => {
  const raw = preK3StateV2();
  const beforeExam = structuredClone(raw.tracks[TRACK_ID].active_exam);
  const beforeTimes = temporalPaths(raw).sort();

  const migrated = migrateState(raw, ctx);
  const exam = migrated.tracks[TRACK_ID].active_exam;

  assert.equal(exam.legacy_state_v2, true);
  const comparable = structuredClone(exam);
  delete comparable.legacy_state_v2;
  assert.deepEqual(comparable, beforeExam);
  assert.deepEqual(temporalPaths(migrated).sort(), beforeTimes);
  assert.equal(migrated.legacy.preserved.k3_transition_tracks[TRACK_ID], true);
});

test('legacy StateV2 exam_history remains coarse legacy history without fabricated fine-grained evidence', () => {
  const raw = preK3StateV2();
  const beforeTimes = temporalPaths(raw.tracks[TRACK_ID].exam_history).sort();

  const migrated = migrateState(raw, ctx);
  const history = migrated.tracks[TRACK_ID].exam_history;

  assert.equal(history.length, 1);
  assert.equal(history[0].legacy_summary, true);
  assert.deepEqual(history[0].attempt, raw.tracks[TRACK_ID].exam_history[0].attempt);
  assert.deepEqual(history[0].result, raw.tracks[TRACK_ID].exam_history[0].result);
  assert.deepEqual(temporalPaths(history).sort(), beforeTimes);
  assert.equal('events' in history[0], false);
  assert.equal('evidence_events' in history[0], false);
});

test('activities created after the per-track K3 transition are not reclassified as legacy StateV2', () => {
  const activated = migrateState(preK3StateV2(), ctx);
  assert.equal(activated.legacy.preserved.k3_transition_tracks?.[TRACK_ID], true);
  const next = structuredClone(activated);
  const postK3Exam = {
    id: 'post-k3-active',
    mode: 'full',
    questionIds: ['question.v1'],
    index: 0,
    answers: {},
    confidence: {},
    flags: {},
    optionOrders: { 'question.v1': [0, 1, 2, 3] },
    started_at: '2026-10-05T13:45:00Z',
    submitted: false
  };
  next.tracks[TRACK_ID].active_exam = structuredClone(postK3Exam);

  const reloaded = migrateState(next, ctx);

  assert.deepEqual(reloaded.tracks[TRACK_ID].active_exam, postK3Exam);
  assert.equal(reloaded.tracks[TRACK_ID].active_exam.legacy_state_v2, undefined);
  assert.equal(reloaded.legacy.preserved.k3_transition_tracks?.[TRACK_ID], true);
});
