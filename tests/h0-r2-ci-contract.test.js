import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const server=readFileSync(new URL('../.github/workflows/server-tests.yml',import.meta.url),'utf8');
const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
const pkg=JSON.parse(readFileSync(new URL('../package.json',import.meta.url),'utf8'));
test('server workflow runs branch pushes only on main and PRs only to main',()=>{
 assert.match(server,/push:\s*\n\s*branches:\s*\[main\]/);
 assert.match(server,/pull_request:\s*\n\s*branches:\s*\[main\]/);
 assert.doesNotMatch(server,/paths-ignore/);
});
test('quality gate runs deterministic process control verification',()=>{
 assert.match(ci,/name:\s*Verify deterministic execution control plane[\s\S]*run:\s*npm run process:verify/);
 assert.doesNotMatch(ci,/paths-ignore/);
 assert.ok(pkg.scripts['process:verify']);
});
test('quality gate validates execution state against the dynamic PR base and source branch',()=>{
 assert.match(ci,/name:\s*Validate K3 execution state against PR base[\s\S]*LIVE_MAIN_SHA:[\s\S]*github\.event\.pull_request\.base\.sha[\s\S]*SOURCE_REF:[\s\S]*github\.head_ref[\s\S]*npm run validate:state -- --live-main-sha "\$LIVE_MAIN_SHA" --source-ref "\$SOURCE_REF" --json/);
});
