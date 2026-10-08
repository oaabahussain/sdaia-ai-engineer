# K4 Native TDD Execution Ledger

**Source of truth:** `docs/superpowers/state/K4-CURRENT-STATE.json`, approved K4 spec/plan blobs, current GitHub refs and this ledger. K3's closed `CURRENT-STATE.json` must remain unchanged.

**Approvals:** written spec `d732ac22161d4b007a8f869cbc928ec6737a40a8` approved for planning by "موافق"; explicit plan `edda6ef11fb353d7403098d79400fc783e2f21f1` and Native continuous execution approved by "كمل" in direct reply to the exact-plan/method question.

**Baseline:** `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1`, K3 COMPLETE revision 76. `impl/k4-native-tdd-2026-10-09`, [PR #65](https://github.com/oaabahussain/sdaia-ai-engineer/pull/65) OPEN DRAFT. PR #64 remains design-only.

**Environment:** No locally authenticated repository: local `git ls-remote` failed to resolve github.com; no `gh` installed. Process ruling: use GitHub branch isolation and actual GitHub Actions results as an execution fallback; do not claim local worktree or local tests ran. Ref hashes and individual task tests must be inspected from Actions logs. Each PR update triggers full existing CI; remote tests consume more time. This permission does not allow lowering test standards.

## Task 01 — K4 independent state + preflight

- Before RED: approved spec/plan blobs verified, branch equal to expected docs commit, baseline docs CI passed [Quality 37856210118](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37856210118), [Server 37856210067](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37856210067). Baseline checks prove current K3, not K4.
- RED SHA `2ca62b1124272133a9373cfbb29f5e29609795b7`: new `tests/k4-state.test.js`. [Quality #37856903368](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37856903368) **FAIL** Node tests: 844 PASS, 1 FAIL. Observed exact cause: `ERR_MODULE_NOT_FOUND` for `scripts/process/validate_k4_state.js` imported from new K4 test; legitimate absent-interface RED. [Server #37856903378](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37856903378) PASS.
- GREEN candidate additions `docs/superpowers/state/k4-current-state.schema.json`, `scripts/process/validate_k4_state.js`, `docs/superpowers/state/K4-CURRENT-STATE.json`; completion supported by task-code exact-head CI; final checkpoint/CLI CI is rechecking. State remains `completed_through_task=0, next_task=1` until verified. No downstream K4 task is complete yet.
- Ruling: K4 process bootstraps itself as Task 01; old K3 state schema hard-codes `programme=K3` and its historic packets do not authorize K4. Use K4's own validator; audit and validate live ref/spec/plan before subsequent implementation tasks. Failure to honor source SHA can cause wrong-base implementation.
- Ruling: The `BASELINE_CI_GREEN` state gate refers to previously verified docs-only baseline prior to intentional TDD RED; a RED commit is explicitly not implementation-quality PASS. The Task 01 completion depends on future full GREEN check.
- Ruling: The merge/post-merge gate must not be inferred from PR #65 being mergeable. **No exact-head user merge permission exists.**

## Remaining

Tasks 02–13 pending. Task 14 is the real external review/merge/postmerge gate; it is not a fake RED/GREEN coding task. Future checkpoint records exact SHA, target test results, full suite exit code, corrections/reviews, and branch state.

## Task 01 — verified GREEN and checkpoint

- GREEN code + state candidate commit `6ef7a2f0af7c690de93657459d613e10e338e0d0`: [Quality #37857177088](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857177088) **SUCCESS**, [Server & Adapter #37857177200](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857177200) **SUCCESS**. Both runs targeted the exact code commit; all existing Node/Python/browser/SW/Pages preview checks included by the Quality workflow completed successfully.
- Task 01 complete (RED `2ca62b1` to GREEN `6ef7a2f`); checked actual K4 state revision advanced to **2**, `completed_through_task=1`, `next_task=2` on follow-up commit `b5ab43ca6e432f36269034627807c1715e01fbd5`.
- Additional CLI-proof test `tests/k4-state.test.js` updated commit `e1b38d371fb0fa5b57ea5e242787127f829edf5f`, checks actual K4 manifest via `node scripts/process/validate_k4_state.js` with Git HEAD spec/plan blobs. **Final checkpoint exact-head CI must be checked separately** before Task 02 is started.
- No K3 `CURRENT-STATE.json` or Product question-bank changes.

## Task 01 — final checkpoint verification

- Final checkpoint/head `cff483db959d3ff57d6f778ddcf74ea61d977f7a` CI [Quality #37857351502](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857351502): SUCCESS; [Server & Adapter #37857351496](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857351496): SUCCESS.
- The actual K4 manifest CLI preflight test added in `tests/k4-state.test.js` ran as part of Node tests at that commit. K4 Task 01 is **COMPLETE** and current state points to Task 02; K3 state preserved. Never equate this with K4 whole feature complete.

## Task 02 — RulePolicyV1 strict baseline — complete

- Preflight: live main `9e55881e9480b4a02d8ef5d92a0b21a9313492f1`, K4 state revision 2 `next_task=2`, approvals intact.
- RED `1e96f29c4e6ef81877d84a5bed91a82026c102a9`: [Quality #37857548633](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857548633), **851 PASS / 1 FAIL**; exact `ERR_MODULE_NOT_FOUND` for `src/recommendations/policy.js`, expected missing versioned contract. No unrelated test failures.
- GREEN `d82646d5bf6d80dbff35976b5f00c90f84642051`: [Quality #37857672200](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857672200) **SUCCESS** and [Server #37857672048](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/37857672048) **SUCCESS**. New `tests/k4-policy.test.js` asserts exact 48/24/96/720 baseline, fail-closed immutable safety, mode exclusions, no FSRS, deep-frozen return and unknown settings denied.
- Task 02 complete on code GREEN evidence; K4 state revision 3, `completed_through_task=2`, `next_task=3` at checkpoint `d5cf71c58398eb56bcbfff7e4b6381713646464d`. Existing strict exam and content preserved.
- Ruling: keep browser runtime validator dependency-free; a fixed v1 schema and matching pure-JS invariant checker are needed because Node/Ajv modules are not bundled into GitHub Pages. Future policy changes require new version and schema/contract review.

## Task 03 — completed

- RED commit: ffdb56a06e0f500c5f1af8779adb466a6ffbcc1d. Quality run 37857903384: 856 passed, 1 expected missing-module failure for publicCatalog.js.
- GREEN commit: b2cbb561e4247ed2c1ce208ab196078a1277e544. Quality 37858034328 SUCCESS; Server 37858034329 SUCCESS.
- K2 post-merge documentation verifies 1,120 public learner-visible bootstrap questions; checked migration blob 6e1626cb53038aa5fa48c4de7537f640b1e36e7f, objectives blob 2bfa076d2c133a92bb3cd0baecc8223adc57fc49, runtime version and matching SHA256. Every current public version resolved uniquely to an objective.
- Output: an explicit catalog of 1,120 public current family/item IDs, with release/digest checks, no answer content in candidate outputs, and rejection of protected or unavailable identities.
- State revision 4, completed_through_task 3, next_task 4.
- Ruling: derive initial allowlist exclusively from verified published bootstrap metadata. Newly generated private items are not enrolled. An incorrect classification could expose restricted study content; strict release checks are mandatory.
