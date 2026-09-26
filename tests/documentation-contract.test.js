import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const exists = path => fs.existsSync(new URL(path, import.meta.url));

test('Programme A documentation baseline exists', () => {
  for (const path of [
    '../ARCHITECTURE.md','../MIGRATIONS.md','../TESTING.md','../DEPLOYMENT.md',
    '../DATA-MODEL.md','../SECURITY.md','../HANDOFF.md','../CHANGELOG.md',
    '../docs/decisions/0001-canonical-track-runtime-contract.md',
    '../docs/decisions/0002-neutral-storage-namespace.md',
    '../docs/decisions/0003-public-vs-protected-content-boundary.md',
    '../docs/decisions/0004-legacy-static-bank-disposition.md'
  ]) assert.equal(exists(path), true, path);
});

test('README separates current implementation facts from future expansion', () => {
  const doc = read('../README.md');
  assert.match(doc, /1,120/);
  assert.match(doc, /200-question/);
  assert.match(doc, /project-reference/i);
  assert.match(doc, /14,000\+/);
  assert.match(doc, /future/i);
  assert.match(doc, /unofficial|independent/i);
});

test('migration documentation records namespaces, ID migration, legacy bank, and rollback baseline', () => {
  const doc = read('../MIGRATIONS.md');
  for (const value of [
    'sdaia.state.v1','learning-platform.state.v2','sdaia.anon_id.v1',
    'learning-platform.anon-id.v1','q1','q1120','static-bank-v1',
    'pre-programme-a-2026-09-23','362d35c697411d4eddcc4536c843df17161d3374'
  ]) assert.ok(doc.includes(value), value);
  assert.match(doc, /read but not deleted|read.*not.*delete/i);
});

test('architecture and data-model docs distinguish implemented contracts from future programmes', () => {
  const architecture = read('../ARCHITECTURE.md');
  for (const value of ['browser shell','TrackManifestV1','ExamProfileV1','RuntimeBundleV2','StateV2']) assert.ok(architecture.toLowerCase().includes(value.toLowerCase()), value);
  assert.match(architecture, /protected.*future|future.*protected/i);
  const model = read('../DATA-MODEL.md');
  for (const value of ['TrackManifestV1','ExamProfileV1','RuntimeBundleV2','StateV2','stable','legacy']) assert.ok(model.toLowerCase().includes(value.toLowerCase()), value);
  assert.match(model, /not yet implemented|future/i);
});

test('deployment and testing docs match the current repeatable gates', () => {
  const deployment = read('../DEPLOYMENT.md');
  assert.match(deployment, /data\/legacy\/.*not.*Pages|not.*Pages.*data\/legacy\//i);
  assert.match(deployment, /service worker/i);
  assert.match(deployment, /pre-programme-a-2026-09-23|362d35c697411d4eddcc4536c843df17161d3374/);
  const testing = read('../TESTING.md');
  for (const command of [
    'npm ci --ignore-scripts','npm run validate','npm test',
    'python3 scripts/browser_smoke.py','PYTHONPATH=server pytest -q server/tests',
    'python3 scripts/db_smoke.py','node scripts/contract_test.js browser'
  ]) assert.ok(testing.includes(command), command);
  assert.match(testing, /SDAIA_API_BASE=.*contract_test\.js api/);
});

test('security documentation states the current trust boundary truthfully', () => {
  const doc = read('../SECURITY.md');
  assert.match(doc, /UUID.*not authentication|not authentication.*UUID/i);
  assert.match(doc, /FastAPI.*SQLite.*dev\/test|dev\/test.*FastAPI.*SQLite/i);
  assert.match(doc, /browser-shipped.*public|public.*browser-shipped/i);
  assert.match(doc, /protected.*future/i);
  assert.match(doc, /confidential|leaked/i);
  assert.match(doc, /credentials|secrets/i);
});

test('contribution and governance rules protect stable contracts', () => {
  const doc = read('../CONTRIBUTING.md');
  assert.match(doc, /stable IDs.*immutable|immutable.*stable IDs/i);
  assert.match(doc, /exam rules.*exam profiles|exam profiles.*exam rules/i);
  assert.match(doc, /evidence status|sources.*evidence/i);
  assert.match(doc, /hard-coded track constants/i);
  assert.match(doc, /legacy path.*disposition|disposition.*legacy path/i);
  assert.match(doc, /CI.*required before merge/i);
  assert.match(doc, /branch protection.*workflow.*confirmed|workflow.*confirmed.*branch protection/i);
  assert.match(doc, /CODEOWNERS.*multiple maintainers|multiple maintainers.*CODEOWNERS/i);
});

test('handoff is zero-tribal-knowledge and changelog does not claim release', () => {
  const handoff = read('../HANDOFF.md');
  for (const value of ['npm run validate','canonical','legacy','new track','project-reference-unverified','362d35c697411d4eddcc4536c843df17161d3374']) assert.ok(handoff.toLowerCase().includes(value.toLowerCase()), value);
  assert.match(handoff, /not yet implemented|future/i);
  const changelog = read('../CHANGELOG.md');
  assert.match(changelog, /Unreleased/);
  assert.match(changelog, /Programme A/);
  assert.match(changelog, /Implemented on the Programme A branch;.*not.*merged to `main`/i);
});
