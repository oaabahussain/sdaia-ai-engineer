import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskDefinitionPacket } from '../scripts/process/validate_task_packet.js';

const H40 = 'a'.repeat(40);
const H64 = 'b'.repeat(64);

function validPacket() {
  return {
    schema_version: 1,
    packet_version: 1,
    programme: 'K3',
    task_id: 5,
    task_title: 'Schema-derived browser validators and event constructor',
    authority: {
      spec_path: 'docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md',
      spec_blob_sha: H40,
      plan_path: 'docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md',
      plan_blob_sha: H40,
      task_source_digest: H64,
      process_failure_rules_revision: 'h0-r2-v1',
      process_failure_rules_digest: H64
    },
    purpose: 'Implement the exact approved task behavior.',
    phase: 'A',
    dependencies: [4],
    scope: {
      allowed_create: ['scripts/example.js'],
      allowed_modify: ['package.json'],
      allowed_delete: [],
      forbidden_paths: ['src/evidence/contract.js'],
      product_scope: 'K3_TASK_5'
    },
    interfaces: { consumes: ['schema'], produces: ['validator'] },
    red: {
      command: 'node --test tests/example.test.js',
      expected_failure_class: 'ASSERTION_FAILURE',
      expected_failure_description: 'Fails because behavior is absent.',
      invalid_failure_classes: ['SETUP_FAILURE']
    },
    implementation: {
      intent: 'Implement only the approved behavior.',
      prohibited_inventions: ['new architecture']
    },
    green: {
      command: 'node --test tests/example.test.js',
      expected_result: 'PASS with zero failures'
    },
    regression: {
      command: 'npm test',
      expected_result: 'PASS with zero failures'
    },
    commit: { message: 'feat: example' },
    stop_conditions: ['PLAN_DECISION_REQUIRED', 'SCOPE_EXPANSION_BLOCKED'],
    required_skills: ['test-driven-development'],
    runtime_requirements: ['NODE_22'],
    merge_authority: false,
    source_contract_digest: H64
  };
}

test('valid TaskDefinitionPacketV1 passes', () => {
  const result = validateTaskDefinitionPacket(validPacket());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.code, 'TASK_PACKET_VALID');
});

test('packet rejects live execution fields and merge authority', () => {
  const packet = validPacket();
  packet.state_revision = 2;
  packet.base_main_sha = H40;
  packet.merge_authority = true;
  const result = validateTaskDefinitionPacket(packet);
  assert.equal(result.ok, false);
  assert.equal(result.code, 'TASK_PACKET_SCHEMA_INVALID');
  assert.ok(result.errors.some((error) => error.includes('additionalProperties') || error.includes('merge_authority')));
});

test('packet rejects empty commands, placeholders, and missing scope', () => {
  const packet = validPacket();
  packet.red.command = '';
  packet.purpose = 'TODO <decide later>';
  delete packet.scope;
  const result = validateTaskDefinitionPacket(packet);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes('scope')));
  assert.ok(result.errors.some((error) => error.includes('placeholder')));
});
