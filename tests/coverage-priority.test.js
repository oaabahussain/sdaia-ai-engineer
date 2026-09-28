import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const moduleUrl = new URL('../src/platform-kernel/coverage/prioritize.js', import.meta.url);
const moduleExists = () => fs.existsSync(moduleUrl);

const gap = (gap_id, requested_count) => ({
  schema_version: 1,
  gap_id,
  track_id: 'sdaia-ai-engineer',
  domain_id: 'mlops-llmops',
  objective_id: 'obj:1',
  concept_ids: ['concept:1'],
  misconception_ids: [],
  cognitive_level: 'apply',
  intended_difficulty: 'hard',
  languages: ['ar', 'en'],
  status: 'open',
  requested_count
});

test('coverage priority module exists', () => {
  assert.equal(moduleExists(), true);
});

test('coverage priority is deterministic and uses stable gap id tie breaks', async () => {
  if (!moduleExists()) return;
  const { prioritizeCoverageGaps } = await import(moduleUrl);

  const gaps = [
    gap('gap:b', 4),
    gap('gap:c', 8),
    gap('gap:a', 4)
  ];

  const context = {
    sourceReadiness: {
      'gap:a': true,
      'gap:b': true,
      'gap:c': true
    },
    riskClass: {
      'gap:a': 'medium',
      'gap:b': 'medium',
      'gap:c': 'high'
    },
    duplicatePressure: {
      'gap:a': 0.2,
      'gap:b': 0.2,
      'gap:c': 0.4
    },
    reviewCapacity: {
      'mlops-llmops': 20
    },
    bilingualComplexity: {
      'gap:a': 1,
      'gap:b': 1,
      'gap:c': 2
    },
    accessibilityComplexity: {
      'gap:a': 1,
      'gap:b': 1,
      'gap:c': 1
    }
  };

  const first = prioritizeCoverageGaps(gaps, context);
  const second = prioritizeCoverageGaps(gaps, context);

  assert.deepEqual(first, second);
  assert.deepEqual(first.map(item => item.gap_id), ['gap:c', 'gap:a', 'gap:b']);
  assert.equal(first[0].priority.coverage_deficit, 8);
  assert.equal(first[0].priority.risk_class, 'high');
  assert.ok(first[0].priority_reasons.includes('coverage_deficit'));
});

test('coverage priority sends source-unready gaps behind ready gaps', async () => {
  if (!moduleExists()) return;
  const { prioritizeCoverageGaps } = await import(moduleUrl);

  const gaps = [
    gap('gap:blocked', 20),
    gap('gap:ready', 2)
  ];

  const ranked = prioritizeCoverageGaps(gaps, {
    sourceReadiness: {
      'gap:blocked': false,
      'gap:ready': true
    }
  });

  assert.deepEqual(ranked.map(item => item.gap_id), ['gap:ready', 'gap:blocked']);
  assert.equal(ranked[1].priority.blocked, true);
  assert.ok(ranked[1].priority_reasons.includes('source_not_ready'));
});
