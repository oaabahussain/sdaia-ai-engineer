import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('browser core derives active track state from loaded/configured contracts', () => {
  const config = read('../src/config.js');
  const app = read('../src/app.js');
  const runtime = read('../src/content/runtimeBundle.js');
  const browser = read('../src/storage/browser.js');
  assert.match(config, /ACTIVE_TRACK_ID/);
  assert.doesNotMatch(app, /const TRACK_ID\s*=\s*['"]sdaia-ai-engineer['"]/);
  assert.match(app, /state\.tracks\[BANK\.track\.id\]/);
  assert.doesNotMatch(app, /QUESTIONS\.length\s*<\s*1000/);
  assert.match(app, /QUESTIONS\.length\s*<\s*PROFILE\.question_count/);
  assert.match(runtime, /loadRuntimeBundle\(fetchJson,trackId\)/);
  assert.doesNotMatch(runtime, /trackId\s*=\s*['"]sdaia-ai-engineer['"]/);
  assert.match(browser, /ACTIVE_TRACK_ID/);
  assert.match(browser, /loadRuntimeBundle\(loadJson,ACTIVE_TRACK_ID\)/);
  const questionBank = read('../src/logic/questionBank.js');
  assert.doesNotMatch(questionBank, /trackId\s*=\s*['"]/);
  assert.match(questionBank, /trackId is required/);
});

test('server default track is configuration rather than a function default', () => {
  const server = read('../server/app/main.py');
  assert.match(server, /os\.getenv\(['"]TRACK_ID['"]/);
  assert.match(server, /def load_runtime_bundle\(track_id=None\)/);
  assert.doesNotMatch(server, /def load_runtime_bundle\(track_id=['"]sdaia-ai-engineer['"]\)/);
});

test('release and adapter checks source current compatibility values from manifests or fixtures', () => {
  const contract = read('../scripts/contract_test.js');
  const smoke = read('../scripts/browser_smoke.py');
  assert.match(contract, /current-bank-counts\.expected\.json/);
  assert.doesNotMatch(contract, /\b11(?:20)\b/);
  assert.match(smoke, /default_exam_profile/);
  assert.doesNotMatch(smoke, /project-reference-v1\.json/);
});

test('compatibility tests consume versioned fixtures instead of repeating current totals', () => {
  const bank = read('./bank.test.js');
  const exam = read('./exam.test.js');
  const track = read('./track-contract.test.js');
  assert.doesNotMatch(bank, /\b11(?:20)\b/);
  assert.match(bank, /expected\.rendered_questions/);
  assert.doesNotMatch(exam, /200-question/);
  assert.doesNotMatch(exam, /assert\.equal\(total,\s*200\)/);
  assert.match(exam, /current-profile\.expected\.json/);
  assert.doesNotMatch(track, /question_count,\s*200/);
  assert.match(track, /current-profile\.expected\.json/);
  assert.match(track, /current-bank-counts\.expected\.json/);
});

test('feedback reads legacy preferences only as fallback and never writes the legacy state key', () => {
  const page = read('../feedback.html');
  assert.match(page, /sdaia\.state\.v1/);
  assert.doesNotMatch(page, /const key=.*sdaia\.state\.v1/);
  assert.doesNotMatch(page, /Full 200-question exam/);
});
