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
  assert.doesNotMatch(changelog, /Programme A branch;.*not.*merged to `main`/i);
  assert.match(changelog, /Programme A.*merged.*verified/i);
  assert.match(changelog, /K2.*Coverage Expansion.*implementation/i);
});


test('K3 data model documents implemented learner evidence, storage, privacy, replay, and deferred derivations', () => {
  const doc = read('../DATA-MODEL.md');
  for (const term of [
    'LearnerEvidenceEventV2', 'EvidenceStorageReceiptV1', 'EvidenceBatchResultV1',
    'EvidenceOutboxRecordV1', 'RuntimeEvidenceContextV1', 'ActivityProjectionV1',
    'AttemptProjectionV1', 'LearnerIdentityLinkRecordV1', 'EvidenceExportRecordV1',
    'event_fingerprint', 'origin_seq', 'store_seq', 'StateV2', 'xAPI', 'Caliper',
    'K4', 'K5', 'K6', 'K8'
  ]) assert.ok(doc.includes(term), `Missing current K3 data model: ${term}`);
  assert.match(doc, /immutable.*evidence|evidence.*immutable/i);
  assert.match(doc, /authorization.*not.*learner_id|learner_id.*not.*authorization/i);
  assert.match(doc, /legacy.*not.*invent|not.*invent.*legacy/i);
  assert.match(doc, /privacy.*erasure|erasure.*privacy/i);
});

test('K3 architecture documents operational ports, offline capture, fail-closed sync, and Pages boundary', () => {
  const doc = read('../ARCHITECTURE.md');
  for (const term of [
    'src/evidence/recorder.js', 'src/evidence/indexedDbStore.js',
    'src/evidence/sync.js', 'src/evidence/replay.js', 'src/evidence/legacy.js',
    'server/app/evidence_auth.py', 'server/app/evidence_store.py',
    'tests/k3-learner-evidence-acceptance.test.js', 'scripts/browser_smoke.py',
    'K4', 'K5', 'K6', 'K8'
  ]) assert.ok(doc.includes(term), `Missing current K3 architecture: ${term}`);
  assert.match(doc, /default.*den(y|ied)|den(y|ied).*default/i);
  assert.match(doc, /IndexedDB.*offline|offline.*IndexedDB/i);
  assert.match(doc, /Product Analytics.*Telemetry|Telemetry.*Product Analytics/i);
});

test('current K3 handoff, tracker, API, and checkpoint are explicit and evidence-backed', () => {
  const handoff = read('../HANDOFF.md').split('## Historical snapshot')[0];
  const tracker = read('../docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md').split('## Historical snapshot')[0];
  const api = read('../api/openapi.yaml');
  const checkpointPath = '../docs/superpowers/reviews/2026-09-29-k3-implementation-checkpoint.md';
  for (const term of ['Task 37', 'Task 38', 'Task 39', 'CURRENT-STATE.json', '5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9']) {
    assert.ok(handoff.includes(term), `Current handoff missing ${term}`);
    assert.ok(tracker.includes(term), `Current tracker missing ${term}`);
  }
  assert.match(api, /learner-evidence.*authorized|authorized.*learner-evidence/i);
  assert.match(api, /DenyLearnerAuthorization/);
  assert.match(api, /X-Anon-Id.*not.*authoriz/i);
  assert.equal(exists(checkpointPath), true);
  const checkpoint = read(checkpointPath);
  for (const term of ['Task 36', 'Task 37', '836', '117', 'main', 'PENDING']) assert.ok(checkpoint.includes(term), `Checkpoint missing ${term}`);
});


test('K3 OpenAPI evidence pull documents the server cursor identity, full response, and source conflicts', () => {
  const api = read('../api/openapi.yaml');
  const pull = api.split('  /learner-evidence:\n')[1];
  assert.ok(pull, 'expected K3 evidence GET route');
  assert.match(pull, /- name: source_store_id/);
  assert.match(pull, /nonzero.*source_store_id/i);
  assert.match(pull, /required: \[store_id, events, next_store_seq\]/);
  assert.match(pull, /store_id: \{ type: string/);
  assert.match(pull, /'409': \{ \$ref: '#\/components\/responses\/Error' \}/);
});
