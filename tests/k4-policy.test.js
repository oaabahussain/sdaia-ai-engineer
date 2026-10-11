import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateRulePolicy } from '../src/recommendations/policy.js';

const raw = JSON.parse(readFileSync(new URL('../data/recommendations/k4-rule-policy-v1.json', import.meta.url), 'utf8'));
const copy = v => structuredClone(v);

test('K4 policy adopts only the spec-pinned deterministic baseline', () => {
  const p=validateRulePolicy(raw);
  assert.equal(p.policy_id, 'K4.RULES.v1');
  assert.equal(p.schema_version, 1);
  assert.equal(p.algorithm, 'DETERMINISTIC_RULES');
  assert.equal(p.first_review_delay_hours, 48);
  assert.equal(p.trusted_incorrect_delay_hours, 24);
  assert.equal(p.trusted_correct_delay_hours, 96);
  assert.equal(p.max_review_delay_hours, 720);
  assert.equal(p.max_action_items, 1);
  assert.equal(p.fsrs_enabled, false);
  assert.deepEqual(p.include_modes, ['learn','practice']);
  assert.deepEqual(p.exclude_modes, ['check','mock','section','full']);
});

test('safety invariants cannot be disabled or overwritten', () => {
  for (const [key,value] of Object.entries({
    fsrs_enabled:true,protected_candidates_allowed:true,
    untrusted_correctness_allowed:true,max_action_items:2,
    allow_provisional_objectives_for_prerequisites:true,
    unavailable_content_behavior:'PICK_ANY_ITEM'
  })) {
    assert.throws(()=>validateRulePolicy({...copy(raw),[key]:value}),key);
  }
});

test('rejects missing, unrecognized, negative and fractional policy settings', () => {
  assert.throws(()=>validateRulePolicy({...copy(raw),first_review_delay_hours:-1}));
  assert.throws(()=>validateRulePolicy({...copy(raw),max_review_delay_hours:0}));
  assert.throws(()=>validateRulePolicy({...copy(raw),first_review_delay_hours:1.5}));
  assert.throws(()=>validateRulePolicy({...copy(raw),unknown_field:123}));
  const missing=copy(raw);delete missing.policy_id;
  assert.throws(()=>validateRulePolicy(missing));
});

test('rejects wrong modes and invalid due-delay ordering', () => {
  assert.throws(()=>validateRulePolicy({...copy(raw),include_modes:['mock','practice']}));
  assert.throws(()=>validateRulePolicy({...copy(raw),exclude_modes:['check','section']}));
  assert.throws(()=>validateRulePolicy({...copy(raw),trusted_correct_delay_hours:721}));
  assert.throws(()=>validateRulePolicy({...copy(raw),first_review_delay_hours:721}));
});

test('validated policy is deep frozen, detached and deterministic', () => {
  const first=validateRulePolicy(raw);
  const second=validateRulePolicy(copy(raw));
  assert.deepEqual(first,second);
  assert.notEqual(first,raw);
  assert.equal(Object.isFrozen(first),true);
  assert.equal(Object.isFrozen(first.include_modes),true);
  assert.throws(()=>first.include_modes.push('mock'),TypeError);
  assert.equal(raw.include_modes.length,2);
});
