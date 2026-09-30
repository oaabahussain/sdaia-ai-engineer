import test from 'node:test';
import assert from 'node:assert/strict';
import { lintExecutionContracts } from '../scripts/process/lint_execution_contracts.js';

test('rejects known ambiguous or stale execution-contract patterns', () => {
  const cases = [
    ['plan.md', '- Run RED\n- Run GREEN\n', 'BARE_EXECUTION_SHORTHAND'],
    ['bootstrap.md', 'current_task: 12\n', 'MUTABLE_BOOTSTRAP_STATE'],
    ['bootstrap.md', 'main_sha: 0123456789abcdef0123456789abcdef01234567\n', 'DYNAMIC_SHA_PIN'],
    ['ci.yml', 'name: quality-gate\nname: quality-gate\n', 'DUPLICATE_REQUIRED_CHECK_IDENTITY'],
    ['state.json', '{"digest":"digest"}', 'SELF_REFERENTIAL_DIGEST']
  ];
  for (const [path, content, code] of cases) {
    const result = lintExecutionContracts([{ path, content }]);
    assert.equal(result.ok, false, code);
    assert.ok(result.findings.some((finding) => finding.code === code), JSON.stringify(result.findings));
  }
});

test('allows historical evidence, immutable action SHAs, and approved blob fields', () => {
  const result = lintExecutionContracts([
    { path: 'review.md', content: 'historical_run_id: 36750135883\nhistorical_sha: 0123456789abcdef0123456789abcdef01234567\n' },
    { path: 'ci.yml', content: 'uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803\nname: quality-gate\n' },
    { path: 'state.json', content: '{"spec_blob_sha":"0123456789abcdef0123456789abcdef01234567","plan_blob_sha":"abcdef0123456789abcdef0123456789abcdef01"}' }
  ]);
  assert.equal(result.ok, true, JSON.stringify(result.findings));
});
