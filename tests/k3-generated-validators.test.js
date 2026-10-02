import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const generatedUrl = new URL('../src/evidence/generatedValidators.js', import.meta.url);
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

function sha(text) {
  return createHash('sha256').update(text).digest('hex');
}

test('generator command and committed browser-safe validators exist', () => {
  assert.equal(packageJson.scripts?.['generate:k3-validators'], 'node scripts/generate_k3_validators.js');
  assert.equal(existsSync(generatedUrl), true, 'generatedValidators.js must be committed');
});

test('generator is deterministic and committed output is fresh', () => {
  if (!existsSync(generatedUrl) || !packageJson.scripts?.['generate:k3-validators']) {
    assert.fail('K3 validator generator behavior is not implemented');
  }
  execFileSync(process.execPath, ['scripts/generate_k3_validators.js'], { cwd: root, stdio: 'pipe' });
  const first = readFileSync(generatedUrl, 'utf8');
  execFileSync(process.execPath, ['scripts/generate_k3_validators.js'], { cwd: root, stdio: 'pipe' });
  const second = readFileSync(generatedUrl, 'utf8');
  assert.equal(sha(first), sha(second), 'generator output must be deterministic');
  assert.equal(first, second, 'second generation must produce zero diff');
  assert.doesNotMatch(first, /node:fs|from ['"]fs['"]|require\(['"]fs['"]\)/, 'generated module must be browser-safe');
  assert.match(first, /learner-evidence-event-v2/);
  assert.match(first, /response-recorded-v1/);
});
