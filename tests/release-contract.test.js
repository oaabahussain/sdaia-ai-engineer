import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const pkg = JSON.parse(read('../package.json'));
const ci = read('../.github/workflows/ci.yml');
const pages = read('../.github/workflows/pages.yml');
const swVerifier = read('../scripts/verify_sw_assets.js');
const pagesBuilder = read('../scripts/build_pages_artifact.js');

test('package exposes named repeatable validation scripts without replacing the test command', () => {
  assert.equal(pkg.scripts.test, 'node --test tests/*.test.js');
  assert.equal(pkg.scripts.validate, 'node scripts/validate.js');
  assert.equal(pkg.scripts['verify:sw'], 'node scripts/verify_sw_assets.js .');
});

test('PR quality gate uses named package scripts', () => {
  assert.match(ci, /run:\s*npm run validate/);
  assert.match(ci, /run:\s*npm test/);
  assert.match(ci, /run:\s*npm run verify:sw/);
});

test('Pages artifact copies only current public data and explicitly excludes legacy data', () => {
  assert.match(pages, /node scripts\/build_pages_artifact\.js _site/);
  for (const path of ['src','tracks','data/concepts','data/migrations','data/learn.json','data/cases.json']) {
    assert.ok(pagesBuilder.includes(`'${path}'`), path);
  }
  assert.match(pagesBuilder, /data\/legacy/);
  assert.match(pagesBuilder, /Forbidden Pages artifact path/);
  assert.doesNotMatch(pagesBuilder, /copyFile\(['\"]data['\"]\)/);
});

test('Pages live release verification delegates canonical manifest checks without duplicated bank arithmetic', () => {
  assert.match(pages, /node scripts\/verify_live_release\.js "\$\{PAGE_URL\}"/);
  assert.doesNotMatch(pages, /concept_files=\(/);
  assert.doesNotMatch(pages, /concept_total=/);
  assert.doesNotMatch(pages, /question_total=/);
  assert.doesNotMatch(pages, /concepts\.length\s*!==\s*20/);
  assert.doesNotMatch(pages, /data-ml\.json|core-ai\.json|mlops-llmops\.json/);
});

test('live release verifier resolves the default exam profile through the manifest', () => {
  const file = new URL('../scripts/verify_live_release.js', import.meta.url);
  assert.equal(fs.existsSync(file), true);
  const live = fs.readFileSync(file, 'utf8');
  assert.match(live, /tracks\/registry\.json/);
  assert.match(live, /registry\.tracks/);
  assert.match(live, /manifest\.exam_profiles/);
  assert.match(live, /manifest\.default_exam_profile/);
  assert.match(live, /manifest\.content\.concept_files/);
  assert.doesNotMatch(live, /project-reference-v1\.json/);
});

test('service-worker asset verifier derives the default profile path from the manifest', () => {
  assert.match(swVerifier, /default_exam_profile/);
  assert.match(swVerifier, /exam_profiles/);
  assert.doesNotMatch(swVerifier, /project-reference-v1\.json/);
});


test('PR gate assembles and verifies the same public Pages artifact boundary', () => {
  assert.match(ci, /Verify Pages artifact assembly/);
  assert.match(ci, /node scripts\/build_pages_artifact\.js _site/);
  assert.match(ci, /node scripts\/verify_sw_assets\.js _site/);
  assert.match(pages, /node scripts\/build_pages_artifact\.js _site/);
});


test('PR gate executes live-release verification against the assembled artifact over HTTP', () => {
  assert.match(ci, /python3 -m http\.server 4174/);
  assert.match(ci, /node scripts\/verify_live_release\.js http:\/\/127\.0\.0\.1:4174/);
});


test('live release verifier validates active track presentation contract', () => {
  const live = read('../scripts/verify_live_release.js');
  assert.match(live, /presentation\.json/);
  assert.match(live, /presentation\.track_id/);
  assert.match(live, /presentation\.track_version/);
  assert.match(live, /presentation\.track_version/);
  assert.match(live, /live track registry: PASS/);
});


test('Pages and PR artifact gates explicitly verify active presentation is assembled', () => {
  assert.match(pagesBuilder, /tracks\/registry\.json/);
  assert.ok(pagesBuilder.includes("'tracks'"));
  for (const workflow of [pages, ci]) {
    assert.match(workflow, /node scripts\/build_pages_artifact\.js _site/);
    assert.doesNotMatch(workflow, /cp .*presentation\.json/);
  }
});


test('synthetic track fixtures are excluded from release artifact inputs',()=>{for(const workflow of [pages,ci]){assert.doesNotMatch(workflow,/tests\/fixtures/)}const registry=JSON.parse(read('../tracks/registry.json'));assert.deepEqual(registry.tracks,[{id:'sdaia-ai-engineer'}]);});


test('factory governance artifacts stay outside public Pages assembly',()=>{for(const workflow of [pages,ci]){assert.doesNotMatch(workflow,/cp\s+-[rR]\s+data\/factory/)} });


test('Task 35 PR and Pages gates execute Python server contracts in addition to Node and browser smoke', () => {
  for (const workflow of [ci,pages]) {
    assert.match(workflow,/actions\/setup-python@/);
    assert.match(workflow,/pip install -r server\/requirements\.txt/);
    assert.match(workflow,/pytest -q server\/tests|python3? -m pytest .*server\/tests/);
    assert.match(workflow,/python3 scripts\/browser_smoke\.py/);
  }
});

test('Task 35 public Pages artifact excludes private K3 interoperability and server evidence state', () => {
  assert.equal(pagesBuilder.includes("'data/evidence/mappings'"),false);
  assert.equal(pagesBuilder.includes("'server'"),false);
  assert.match(pagesBuilder,/Forbidden Pages artifact path/);
  for (const required of [
    'data/evidence/sdaia-ai-engineer.runtime-v1.json',
    'data/evidence/event-definitions-v1.json',
    'data/evidence/payload-schemas'
  ]) assert.ok(pagesBuilder.includes(`'${required}'`),required);
});
