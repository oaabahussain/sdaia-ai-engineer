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

## Task 04 — complete

- RED 38ecfb76a2f08e6e9783b5ad879af279a230c4e7: Quality 37858261601, 861 PASS, 1 expected missing sourceReader.js.
- GREEN a841811f906f23bbfe869d0766b46c06b61fe5bd: Quality 37858384987 SUCCESS; Server 37858384916 SUCCESS.
- Additive K3 API getSourceHead() reads the local committed source sequence, not its sync cursor; sourceReader preserves source/learner/track/release filters and K3 fingerprint checks. Cold start at zero does not invoke invalid replay(toSeq=0). Existing tests and browser passed.
- K4 state revision 5; completed_through_task 4; next_task 5. K3 append-only event acceptance logic unchanged.
- Ruling: read-only local source head uses the existing K3 store metadata transaction, not the independently governed sync cursor. Source ID is local, not server-authenticated.

## Task 05 — correction-aware exposure projection, complete

- RED commit 4533d262afaea80a5b48a13d82c133fd33d0cce2; Quality 37858674449: 866 PASS, 1 expected missing-module failure for projection.js.
- GREEN commit 26d3736018b167588b2df8eb0ef45c9e9c729de7; Quality 37858856244 SUCCESS, Server & Adapter 37858856234 SUCCESS.
- Reuses K3 resolveCurrentEvidence for VOID/SUPERSEDE/conflicts; quarantines affected public families; counts distinct accepted item interactions and bounds evidence IDs; rejects invalid source/learner/release/watermark and untrusted grade promotion. Strict exam modes do not rank public practice.
- Task 05 only projects exposures: due_at is null pending separately tested UTC due-time Task 06. This is not a completed scheduler.
- K4 revision 6, next_task 6, K3 state unchanged.
- Ruling: Browser event authority cannot independently prove a trusted SYSTEM evaluation merely from authority_ref; initial K4 projections deliberately remain EXPOSURE_ONLY. Acceptance case for verified SYSTEM fixture cannot be claimed until a separate genuine producer-verification boundary is proven.

## Task 06 — UTC due times, complete

- RED ae232b60dd402239098b058766bc33fc82567652: Quality run 37859039648 — 873 PASS, 1 expected missing clock.js failure.
- GREEN 0bf019c87287ef350eb31bc9e07a61d556b4e473: Quality run 37859210000 SUCCESS; Server run 37859209931 SUCCESS.
- Validates ISO instants, rejects invalid/calendar-only/future clock, computes +48h exposure due, supports test-only +24h wrong and +96h correct trusted-grade contract. Projection now recomputes UTC due from accepted timestamp without persisting recommended actions.
- K4 state revision 7, completed task 06, next task 07. This is uncalibrated fixed intervals; no claimed empirical SDAIA retention benefit or actual graded SYSTEM producer.

## Task 07 — deterministic public next action, complete

- RED eae1887eb512e4a858560e37424029857714377c. Quality 37859432793: 879 PASS, 1 expected missing src/recommendations/ranker.js.
- GREEN 89a624fb404c1e52da174e376681ef31f549ea11. Quality 37859545758 SUCCESS; Server 37859545834 SUCCESS.
- Emits one public PRACTICE_ONE recommendation at most, prioritizing due-now exposure over unseen family, stable codepoint ordering, source-invalid fail-closed, and explicit skip/snooze expiry re-evaluation with unchanged K3 watermark. Browser TRUSTED_GRADED evidence cannot be promoted by input text.
- K4 revision 8, completed task 07, next task 08. Policy is deterministic and uncalibrated.
- Ruling: with no due/new eligible family, use the spec's NO_ELIGIBLE_ACTION/CONTENT_UNAVAILABLE enum (no new unapproved code) despite its broad wording; do not tell the learner an unavailable asset exists. At UI integration, unavailable runtime assets must be checked before linking.

## Task 09 — durable non-strict practice adapter

- RED `2cb51babecb6eecd2e90a132703db5e9dc5f57aa`: Quality 37895973094; 890 other Node tests passed and missing `src/recommendations/practiceSession.js` failed as expected.
- GREEN `ff9f9d7762ffcb1143bd0e897950b1c9b89bf058`: Quality 37896064431 SUCCESS; Server & Adapter 37896064377 SUCCESS.
- New session adapter records K3 practice activity/presentation/one canonical answer and verifies accepted durable receipts; never submits assessment or writes SYSTEM grading. Tests include duplicate calls, failures and source/locale/option bounds.
- K4 state revision 10: Task 09 complete; next Task 10. Test scope is adapter contract, not yet a live browser route; browser Task 10 must prove integration and proper candidate binding.

## Task 10 — bilingual browser card + practice screen, complete

- RED `c1572297982bf693e43010f33c0e8bc9d94bb101`: Quality 37896256275, 895 PASS, 1 expected missing module failure for browserController.js.
- First GREEN candidate `5ccb620225375a218530d10152a34dd641bfc69e`: Quality 37896544397 FAIL browser smoke (first offline navigation timed out); Node/Python/Pages verifiers green, Server 37896544432 green. Root cause: optional K4 static imports in app.js were omitted from K3's existing offline cache graph. Not accepted as Task 10 GREEN.
- Fix `5ee68956a177ec872217b067d3e4c64da4d946c1`: K4 modules loaded dynamically and errors safely isolated from existing K3 bootstrap. Quality 37896751441 SUCCESS including offline browser smoke; Server 37896751450 SUCCESS. No increases to smoke timeout and no weakening of checks.
- Public home card and separate practice screen, AR/EN safe textContent, accessible buttons, K3 strict exam route unchanged. New K4 requires Pages caching in Task 12 to be fully offline, but offline K3 shell remains functional now.
- State revision 11; Task 10 complete; next Task 11. Ruling: optional dynamic K4 import is required as an intermediate compatibility boundary before K4 asset precache. Wrong assumption here would disable offline historical functionality.

## Task 11 — fresh next/another and persisted snooze, complete

- RED `0d654d0d8a67688d341ffb691cbae097dc623fa8`, Quality 37896963749: 901 PASS / 4 expected failures due to absent `nextAction`, `another`, `snooze` methods.
- GREEN `12da860dfbaad18c8912c7552a9dbfb5f2b0f9be`, Quality 37897119242 SUCCESS, Server & Adapter 37897119221 SUCCESS. Node, Python, browser and old exam regressions passed.
- `nextAction` recomputes with fresh clock; `another` excludes current family temporarily without raw evidence mutation; `snooze` awaits durable save receipt/revision before reporting persisted state and recomputing. Denied storage returns `persisted:false` with visible local warning.
- K4 state revision 12; completed task 11, next task 12. The UI's snooze button explicitly uses one-day choice; future optional multi-duration UX requires separate scoped design.

## Task 12 — public Pages/offline bundle, complete

- RED `a3b6e599b2d827948340e3870891af6b8c5c8c37`: Quality 37897342269 905 PASS / 3 expected failures: K4 SW precache missing, Pages catalog missing and release verifier missing K4 identity check.
- GREEN `ea7bac5e0a9bfbda4592c6cfca4504221bcdf0ee`: Quality 37897493969 SUCCESS; Server 37897493960 SUCCESS including actual first-offline-navigation browser smoke.
- Added 13 public K4 shell/replay/data assets, SW cache v2, Pages copy of public recommendation catalog and rule policy; no `data/factory`, `src/platform-kernel`, private governance schemas, or concept-bank precache. Verifiers inspect public catalog release/digest/status, policy FSRS disabled, and missing file negative case.
- K4 state revision 13: completed Task 12, next Task 13. Browser end-to-end K4-specific interactions still await explicit acceptance in Task 13. Never conflate preview with live deployment.
