import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const file=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('unchanged public baseline: 1120 questions, 7 domains, 200 full form and locked digest',()=>{
  const counts=JSON.parse(file('tests/fixtures/runtime/current-bank-counts.expected.json'));
  const evidence=JSON.parse(file('data/evidence/sdaia-ai-engineer.runtime-v1.json'));
  const catalog=JSON.parse(file('data/recommendations/k4-public-catalog-v1.json'));
  const profile=JSON.parse(file('tracks/sdaia-ai-engineer/exam-profiles/project-reference-v1.json'));
  assert.equal(counts.rendered_questions,1120);
  assert.equal(catalog.items.length,1120);
  assert.equal(catalog.content_release_id,evidence.content_release_id);
  assert.equal(catalog.question_payload_sha256,evidence.question_payload_sha256);
  assert.equal(evidence.question_payload_sha256,'5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9');
  assert.equal(Object.keys(profile.weights).length,7);
  assert.equal(profile.question_count,200);
});
test('real browser smoke exercises K4 public action in AR and EN, durable response and offline',()=>{
  const smoke=file('scripts/browser_smoke.py');
  for(const marker of ['K4_BROWSER_ACCEPTANCE','k4HomeCard','k4Practice',
    'K4_OFFLINE_ACCEPTANCE','Response saved locally','keyboard','rtl'])
    assert.ok(smoke.includes(marker),'Missing browser acceptance: '+marker);
});
test('release quality checkpoint records all 18 spec acceptance cases separately',()=>{
  const path='docs/superpowers/reviews/k4-quality-checkpoint.md';
  assert.equal(existsSync(path),true,'K4 acceptance report missing');
  const report=file(path);
  for(let n=1;n<=18;n++){
    assert.ok(report.includes('AC-'+String(n).padStart(2,'0')),'missing acceptance case '+n);
  }
  assert.match(report,/NOT_MERGED|MERGE_BLOCKED/);
});
test('public Pages boundary preserves protected and private source exclusion',()=>{
  const build=file('scripts/build_pages_artifact.js');
  const sw=file('sw.js');
  for(const x of ['data/factory','src/platform-kernel'])assert.ok(build.includes(x));
  assert.equal(sw.includes("'./data/factory"),false);
  assert.equal(sw.includes("'./src/platform-kernel"),false);
  assert.equal(sw.includes("'./data/concepts/"),false);
});
