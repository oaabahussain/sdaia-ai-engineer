import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateFailureRules, failureRulesDigest } from '../scripts/process/validate_failure_rules.js';

const RULES_PATH = new URL('../docs/superpowers/process/process-failure-rules-v1.json', import.meta.url);

function loadRules() {
  return JSON.parse(readFileSync(RULES_PATH, 'utf8'));
}

test('F001-F014 registry validates with unique complete process-only rules', () => {
  const doc = loadRules();
  const result = validateFailureRules(doc);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(doc.rules.map((rule) => rule.rule_id), Array.from({ length: 14 }, (_, i) => `F${String(i + 1).padStart(3, '0')}`));
  assert.match(failureRulesDigest(doc), /^[0-9a-f]{64}$/);
  assert.equal(failureRulesDigest(doc), failureRulesDigest(JSON.parse(JSON.stringify(doc))));
});

test('duplicate rule IDs and incomplete evidence are rejected', () => {
  const doc = loadRules();
  doc.rules[1].rule_id = doc.rules[0].rule_id;
  delete doc.rules[2].root_cause;
  const result = validateFailureRules(doc);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('duplicate rule_id')));
  assert.ok(result.errors.some((error) => error.includes('root_cause')));
});

test('failure rules cannot redefine product semantics', () => {
  const doc = loadRules();
  doc.rules[0].applies_to = ['product_semantics'];
  const result = validateFailureRules(doc);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('product semantics')));
});
