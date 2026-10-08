import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compileAllTaskPackets, compileTaskPacket } from '../scripts/process/compile_k3_task_packets.js';
import { validateTaskDefinitionPacket } from '../scripts/process/validate_task_packet.js';
import { extractTask, taskSourceDigest } from '../scripts/process/k3_task_extract.js';
import { stableJson } from '../scripts/process/stable_json.js';

const PLAN = readFileSync(
  new URL('../docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md', import.meta.url),
  'utf8'
);
const H40 = 'a'.repeat(40);
const H64 = 'b'.repeat(64);
const ARGS = {
  planText: PLAN,
  specBlobSha: H40,
  planBlobSha: H40,
  rulesRevision: 'h0-r2-v1',
  rulesDigest: H64
};

test('Task 5 compiles only approved files, interfaces, commands and commit message', () => {
  const packet = compileTaskPacket({ taskId: 5, ...ARGS });
  const validation = validateTaskDefinitionPacket(packet);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
  assert.equal(packet.task_title, 'Schema-derived browser validators and event constructor');
  assert.deepEqual(packet.scope.allowed_create, [
    'scripts/generate_k3_validators.js',
    'src/evidence/generatedValidators.js',
    'src/evidence/ids.js',
    'src/evidence/contract.js',
    'tests/k3-generated-validators.test.js',
    'tests/k3-evidence-contract-runtime.test.js'
  ]);
  assert.deepEqual(packet.scope.allowed_modify, ['package.json']);
  assert.equal(
    packet.red.command,
    'node --test tests/k3-generated-validators.test.js tests/k3-evidence-contract-runtime.test.js'
  );
  assert.equal(packet.green.command, packet.red.command);
  assert.equal(packet.regression.command, 'npm test');
  assert.equal(packet.commit.message, 'feat: add schema-derived K3 browser validation');
  assert.equal(packet.authority.task_source_digest, taskSourceDigest(extractTask(PLAN, 5)));
  assert.equal('state_revision' in packet, false);
  assert.equal('base_main_sha' in packet, false);
  assert.equal(packet.merge_authority, false);
  assert.match(packet.source_contract_digest, /^[0-9a-f]{64}$/);
});

test('Task 10 dependency clause expands deterministic npm manifest scope', () => {
  const packet = compileTaskPacket({ taskId: 10, ...ARGS });
  assert.deepEqual(packet.scope.allowed_create, [
    'src/evidence/indexedDbStore.js',
    'tests/k3-indexeddb-evidence-store.test.js'
  ]);
  assert.deepEqual(packet.scope.allowed_modify, ['package.json', 'package-lock.json']);
});


test('Task 13 expand clause permits deterministic fixture modification', () => {
  const packet = compileTaskPacket({ taskId: 13, ...ARGS });
  assert.ok(packet.scope.allowed_modify.includes('tests/fixtures/k3/store-conformance.json'));
  assert.ok(packet.scope.allowed_modify.includes('scripts/platform-kernel/adapters/jsonlEvidenceStore.js'));
});

test('Task 14 interface ruling permits create_app integration file', () => {
  const packet = compileTaskPacket({ taskId: 14, ...ARGS });
  assert.deepEqual(packet.scope.allowed_create, [
    'server/app/evidence_auth.py',
    'server/tests/test_k3_evidence_auth.py'
  ]);
  assert.ok(packet.scope.allowed_modify.includes('server/app/main.py'));
});

test('Task 41 preserves post-merge verification contract without inventing unspecified paths', () => {
  const packet = compileTaskPacket({ taskId: 41, ...ARGS });
  assert.equal(packet.task_title, 'Post-merge verification and programme closure');
  assert.deepEqual(packet.scope.allowed_create, [
    'docs/superpowers/reviews/2026-09-29-k3-post-merge-verification.md'
  ]);
  assert.deepEqual(packet.scope.allowed_modify, ['HANDOFF.md']);
  assert.equal(packet.red.command, 'test -s docs/superpowers/reviews/2026-09-29-k3-post-merge-verification.md');
  assert.equal(packet.green.command, packet.red.command);
  assert.equal(packet.regression.command, 'npm test');
  assert.match(packet.implementation.intent, /Resolve exact merged/);
  assert.doesNotMatch(stableJson(packet), /programme tracker.*allowed_modify/);
});

test('same approved inputs compile to byte-identical packet JSON', () => {
  const first = compileTaskPacket({ taskId: 23, ...ARGS });
  const second = compileTaskPacket({ taskId: 23, ...ARGS });
  assert.equal(stableJson(first), stableJson(second));
});

test('compiler fails closed when normative task fields are missing', () => {
  const broken = PLAN.replace(
    '**Files:** create `scripts/generate_k3_validators.js`,',
    '**Files missing:** create `scripts/generate_k3_validators.js`,'
  );
  assert.throws(
    () => compileTaskPacket({ taskId: 5, ...ARGS, planText: broken }),
    /TASK_PACKET_COMPILE_BLOCKED.*Files/
  );
});

test('all approved K3 Tasks 5-41 compile without interpretation gaps', () => {
  const packets = compileAllTaskPackets({ firstTask: 5, lastTask: 41, ...ARGS });
  assert.equal(packets.length, 37);
  assert.deepEqual(packets.map((packet) => packet.task_id), Array.from({ length: 37 }, (_, i) => i + 5));
});

test('Task 37 reuses existing documentation-contract test as a modification, never a creation', () => {
  const packet = compileTaskPacket({ taskId: 37, ...ARGS });
  assert.equal(packet.scope.allowed_create.includes('tests/documentation-contract.test.js'), false);
  assert.equal(packet.scope.allowed_modify.includes('tests/documentation-contract.test.js'), true);
  assert.ok(packet.scope.allowed_create.includes('docs/superpowers/reviews/2026-09-29-k3-implementation-checkpoint.md'));
  assert.equal(packet.authority.task_source_digest, taskSourceDigest(extractTask(PLAN, 37)));
});

test('Task 38 review may correct only the identified existing K3 acceptance gate regression', () => {
  const packet = compileTaskPacket({ taskId: 38, ...ARGS });
  assert.deepEqual(packet.scope.allowed_create, [
    'docs/superpowers/reviews/2026-09-29-k3-whole-plan-review.md'
  ]);
  assert.deepEqual(packet.scope.allowed_modify, [
    'tests/k3-learner-evidence-acceptance.test.js',
    'api/openapi.yaml',
    'tests/documentation-contract.test.js'
  ]);
  assert.equal(packet.merge_authority, false);
});
