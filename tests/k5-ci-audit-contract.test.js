import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
test('K5 release predicate is called from a real read-only GitHub Actions audit',()=>{
 const ci=readFileSync(new URL('../.github/workflows/ci.yml',import.meta.url),'utf8');
 assert.match(ci,/name: K5 read-only GitHub release audit/);
 assert.match(ci,/node scripts\/process\/verify_k5_release\.js --audit/);
 assert.match(ci,/GITHUB_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
 assert.match(ci,/pull-requests: read/);
 assert.match(ci,/actions: read/);
});
