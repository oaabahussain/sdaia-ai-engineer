import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const exists = path => fs.existsSync(new URL('../' + path, import.meta.url));

const requiredContractsAndModules = [
  'data/schema/expansion-plan-v1.schema.json',
  'data/schema/tranche-plan-v1.schema.json',
  'data/schema/provider-routing-policy-v1.schema.json',
  'data/schema/review-calibration-policy-v1.schema.json',
  'data/schema/dedup-calibration-policy-v1.schema.json',
  'data/schema/bilingual-equivalence-report-v1.schema.json',
  'data/schema/activation-evidence-v1.schema.json',
  'data/schema/canary-policy-v1.schema.json',
  'data/schema/event-definition-v1.schema.json',
  'data/schema/improvement-finding-v1.schema.json',
  'src/platform-kernel/coverage/expansionPlan.js',
  'src/platform-kernel/orchestration/tranchePolicy.js',
  'src/platform-kernel/release/activationEvidence.js',
  'src/platform-kernel/observability/eventRegistry.js'
];

test('K2 acceptance shell tracks the approved contract surface', () => {
  assert.equal(requiredContractsAndModules.length, 14);
  assert.equal(new Set(requiredContractsAndModules).size, requiredContractsAndModules.length);
});

test.todo('K2 required contracts and modules exist');

test.todo('K2 expansion plans are coverage driven rather than count only');
test.todo('K2 adaptive tranche decisions hold when evidence is insufficient');
test.todo('K2 provider routing rejects unapproved providers and preserves fallback');
test.todo('K2 deduplication exposes calibrated duplicate review gray zones');
test.todo('K2 bilingual equivalence blocks critical semantic disagreement');
test.todo('K2 risk based review escalates on high risk or observed drift');
test.todo('K2 activation evidence is required before CANARY promotion to ACTIVE');
test.todo('K2 insufficient CANARY evidence yields HOLD');
test.todo('K2 rollback and quarantine preserve immutable release history');
test.todo('K2 event definitions require versioned privacy classified contracts');
test.todo('K2 improvement findings separate observations from causal hypotheses');
test.todo('K2 current learner visible runtime remains unchanged before promotion');
