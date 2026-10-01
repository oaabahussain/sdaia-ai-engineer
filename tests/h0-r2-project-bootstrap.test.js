import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const bootstrap = resolve(root, 'docs/superpowers/bootstrap');
const expected = [
  'PROJECT-INDEX.md',
  'RECOVERY-PROTOCOL.md',
  'DURABLE-FILE-MAP.md',
  'BOOTSTRAP-REVISION',
  'README.md'
];

function read(name) {
  return readFileSync(resolve(bootstrap, name), 'utf8');
}

test('publishes static k3-h0-r2-v1 bootstrap pack', () => {
  for (const name of expected) assert.equal(existsSync(resolve(bootstrap, name)), true, `missing ${name}`);
  assert.equal(read('BOOTSTRAP-REVISION').trim(), 'k3-h0-r2-v1');

  const text = expected.filter((name) => name.endsWith('.md')).map(read).join('\n');
  assert.match(text, /docs\/superpowers\/state\/CURRENT-STATE\.json/);
  assert.match(text, /task packet/i);
  assert.match(text, /execution envelope/i);
  assert.match(text, /preflight/i);
  assert.match(text, /IMPLEMENTED_NOT_CHECKPOINTED/);
  assert.match(text, /must not merge|never merge|no merge authority/i);

  assert.doesNotMatch(text, /\b[0-9a-f]{40}\b/i, 'bootstrap must not pin a live SHA');
  assert.doesNotMatch(text, /\bnext_task\s*[:=]\s*\d+/i, 'bootstrap must not pin current task');
  assert.doesNotMatch(text, /\bworkflow[_ -]?run[_ -]?id\s*[:=]\s*\d+/i, 'bootstrap must not pin workflow run ids');
});
