import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const vectors = JSON.parse(readFileSync(new URL('./fixtures/k3/jcs-vectors.json', import.meta.url), 'utf8')).vectors;

async function loadJcs() {
  try { return await import('../src/evidence/jcs.js'); }
  catch { return {}; }
}

test('Task 6 exposes RFC 8785 canonicalization and SHA-256 fingerprint APIs', async () => {
  const { canonicalizeJson, fingerprintEvent } = await loadJcs();
  assert.equal(typeof canonicalizeJson, 'function', 'canonicalizeJson behavior is missing');
  assert.equal(typeof fingerprintEvent, 'function', 'fingerprintEvent behavior is missing');
});

test('RFC 8785 vectors canonicalize exactly and fingerprint deterministically', async () => {
  const { canonicalizeJson, fingerprintEvent } = await loadJcs();
  assert.equal(typeof canonicalizeJson, 'function', 'canonicalizeJson behavior is missing');
  assert.equal(typeof fingerprintEvent, 'function', 'fingerprintEvent behavior is missing');
  for (const vector of vectors) {
    assert.equal(canonicalizeJson(vector.value), vector.canonical, vector.id + ' canonical');
    assert.equal(await fingerprintEvent(vector.value), vector.sha256, vector.id + ' sha256');
  }
});

test('vendored canonicalize attribution is checked in', () => {
  assert.equal(existsSync(new URL('../src/vendor/LICENSE-canonicalize.txt', import.meta.url)), true, 'canonicalize license must be checked in');
  assert.equal(existsSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url)), true, 'third-party notice must be checked in');
  if (existsSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url))) {
    const notice = readFileSync(new URL('../THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8');
    assert.match(notice, /canonicalize[^\n]*5\.1\.0/i);
    assert.match(notice, /Apache-2\.0/i);
    assert.match(notice, /rfc8785[^\n]*0\.1\.4/i);
  }
});
