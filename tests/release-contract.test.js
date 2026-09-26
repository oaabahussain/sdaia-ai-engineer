import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const pkg = JSON.parse(read('../package.json'));
const ci = read('../.github/workflows/ci.yml');
const pages = read('../.github/workflows/pages.yml');
const swVerifier = read('../scripts/verify_sw_assets.js');

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
  assert.match(pages, /cp -R src tracks _site\//);
  assert.match(pages, /mkdir -p _site\/data/);
  assert.match(pages, /cp -R data\/concepts data\/migrations _site\/data\//);
  assert.match(pages, /cp data\/learn\.json data\/cases\.json _site\/data\//);
  assert.match(pages, /test ! -e _site\/data\/legacy/);
  assert.doesNotMatch(pages, /cp -R src data tracks _site\//);
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
  assert.match(live, /tracks\/sdaia-ai-engineer\/manifest\.json/);
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
  assert.match(ci, /cp -R src tracks _site\//);
  assert.match(ci, /cp -R data\/concepts data\/migrations _site\/data\//);
  assert.match(ci, /test ! -e _site\/data\/legacy/);
  assert.match(ci, /node scripts\/verify_sw_assets\.js _site/);
});
