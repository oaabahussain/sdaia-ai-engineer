import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { compileAllTaskPackets, gitBlobSha } from '../scripts/process/compile_k3_task_packets.js';
import { stableJson, sha256Text } from '../scripts/process/stable_json.js';
import { validateTaskDefinitionPacket } from '../scripts/process/validate_task_packet.js';

const PLAN = readFileSync(
  new URL('../docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md', import.meta.url),
  'utf8'
);
const SPEC = readFileSync(
  new URL('../docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md', import.meta.url),
  'utf8'
);
const RULES = JSON.parse(readFileSync(
  new URL('../docs/superpowers/process/process-failure-rules-v1.json', import.meta.url),
  'utf8'
));

function compile() {
  return compileAllTaskPackets({
    planText: PLAN,
    specBlobSha: gitBlobSha(SPEC),
    planBlobSha: gitBlobSha(PLAN),
    rulesRevision: RULES.revision,
    rulesDigest: sha256Text(stableJson(RULES)),
    firstTask: 5,
    lastTask: 41
  });
}

test('Tasks 5-41 compile into exactly 37 valid packets', () => {
  const packets = compile();
  assert.equal(packets.length, 37);
  assert.deepEqual(packets.map((packet) => packet.task_id), Array.from({ length: 37 }, (_, i) => i + 5));
  for (const packet of packets) {
    const result = validateTaskDefinitionPacket(packet);
    assert.equal(result.ok, true, `Task ${packet.task_id}: ${JSON.stringify(result.errors)}`);
  }
});

test('checked-in packets match clean regeneration byte-for-byte', () => {
  const packets = compile();
  for (const packet of packets) {
    const path = new URL(
      `../docs/superpowers/task-packets/k3/task-${String(packet.task_id).padStart(3, '0')}.json`,
      import.meta.url
    );
    assert.equal(existsSync(path), true, `missing generated packet for Task ${packet.task_id}`);
    assert.equal(readFileSync(path, 'utf8'), stableJson(packet), `stale packet for Task ${packet.task_id}`);
  }
});

test('compiled packets contain no live execution state fields', () => {
  for (const packet of compile()) {
    const text = stableJson(packet);
    assert.equal('state_revision' in packet, false);
    assert.equal('base_main_sha' in packet, false);
    assert.equal('execution_branch' in packet, false);
    assert.doesNotMatch(text, /"run_id"|"project_bootstrap_revision"/);
  }
});
