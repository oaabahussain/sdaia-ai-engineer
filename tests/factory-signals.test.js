import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/observability/factorySignals.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

test('factory signals module exists', () => {
  assert.equal(moduleExists(), true);
});

test('factory signal exports only governed aggregate identifiers counts and rates', async () => {
  if (!moduleExists()) return;
  const { createFactoryMetricEvent } = await import(moduleUrl);

  const event = createFactoryMetricEvent({
    tranche_id: 'tranche:1',
    request_count: 4,
    completed: [
      {
        run_id: 'r1',
        prompt: 'private prompt',
        source_text: 'private source',
        reviewer_text: 'private reviewer note',
        quality_signals: {
          duplicate: false,
          evidence_status: 'PASS',
          bilingual_status: 'PASS',
          review_status: 'AUTO_ELIGIBLE'
        }
      },
      {
        run_id: 'r2',
        prompt: 'also private',
        source_text: 'also private',
        reviewer_text: 'also private',
        quality_signals: {
          duplicate: true,
          evidence_status: 'FAIL',
          bilingual_status: 'REVIEW_REQUIRED',
          review_status: 'HUMAN_REQUIRED'
        }
      }
    ],
    failed: [
      { run_id: 'r3', stage: 'generate', error: 'provider raw error text', retryable: true },
      { run_id: 'r4', stage: 'evidence', error: 'private evidence detail', retryable: true }
    ]
  }, {
    occurredAt: '2026-09-28T00:00:00Z',
    trackId: 'sdaia-ai-engineer',
    reviewBacklog: 3
  });

  assert.equal(event.event_name, 'factory.tranche.metrics');
  assert.deepEqual(Object.keys(event.properties).sort(), [
    'bilingual_failure_rate',
    'duplicate_rate',
    'evidence_failure_rate',
    'failure_rate',
    'request_count',
    'review_backlog',
    'review_escalation_rate',
    'track_id',
    'tranche_id',
    'yield_rate'
  ].sort());

  const serialized = JSON.stringify(event);
  assert.doesNotMatch(serialized, /private prompt|private source|private reviewer|provider raw error|private evidence detail/);
});
