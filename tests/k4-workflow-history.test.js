import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

for (const workflowName of ['ci.yml', 'pages.yml']) {
  test(`${workflowName} checks out full Git ancestry for K4 manifest validation`, () => {
    const workflow = readFileSync(new URL(`../.github/workflows/${workflowName}`, import.meta.url), 'utf8');
    const lines = workflow.split(/\r?\n/);
    const start = lines.findIndex(line => /^\s*-\s+uses:\s+actions\/checkout@/.test(line));
    assert.notEqual(start, -1, `${workflowName} must check out the repository`);
    const indent = lines[start].length - lines[start].trimStart().length;
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      const trimmed = lines[i].trimStart();
      if (trimmed.startsWith('- ') && lines[i].length - trimmed.length === indent) {
        end = i;
        break;
      }
    }
    const checkout = lines.slice(start, end).join('\n');
    assert.match(checkout, /^\s+fetch-depth:\s*0\s*(?:#.*)?$/m,
      `${workflowName} must fetch release-commit ancestors for git merge-base`);
    if (workflowName === 'pages.yml') {
      assert.match(checkout, /^\s+persist-credentials:\s*false\s*$/m,
        'Pages checkout must not persist credentials');
    }
  });
}
