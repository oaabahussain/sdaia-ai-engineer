# K3 Task 38 — Whole-plan review and bounded fix pass

**Reviewed:** 2026-10-08 (Asia/Riyadh)
**Scope:** Approved K3 spec §1–§51, execution plan Tasks 1–38, §47 acceptance criteria 1–25, durable K3 ledger, exact Git history from approved design base `3c296632a54f68f0ecc7ad122298d9661706cb2b` and current clean wave starting `main@5b7453407def933037c4c254cd0fca5e5f3f1591`.
**Review mode:** `SELF_REVIEW` — no independent subagent/reviewer dispatch available in this execution environment. This is a weaker review than a fresh external reviewer; no independent approval is claimed. External GitHub CI will verify the eventual exact Task 39 head.
**Initial Task 38 execution base (after preparation rulings):** `7e76cfa496cc83c6e8580935a4e54e51116765c5`. Official Task 38 brief digest matched packet; runtime envelope binding and preflight both passed before editing review findings.

## Review method and acceptance evidence

1. Compared the current-wave Git diff against approved K3 source and plan, plus the prior 34–36 merged checkpoint, acceptance coverage map, and durable ledger. Earlier tasks are evidenced by their accepted immutable commits, tests and post-merge CI, not reimplemented or retroactively relabeled.
2. Checked each §47 acceptance item: 1–20 have explicit executable corpus/tests and Task 36 coverage; 21 documentation is supported by Task 37's new contract tests and checkpoint; 22 whole-plan review is this task; 23 exact-head verification belongs to Task 39; 24 reviewed merge belongs to Task 40; 25 post-merge verification to Task 41. **Only items 1–22 can be claimed as completed after this report.**
3. Inspected all five review-focus classes from the approved plan and their anchored tests: storage/crash/outbox (`k3-indexeddb-evidence-store`, `k3-local-capture`); retry/event collisions (`k3-evidence-integrity`, store conformance); strict concurrent assessment revisions (`k3-assessment-revision`); erasure/exports/replay (`k3-privacy-lifecycle`, projections); legacy and standards imports (`k3-legacy-learner-event`, `k3-xapi-adapter`, `k3-caliper-adapter`). The implemented boundary preserves raw evidence, pseudonymous identity, private mapping, and strict source cursor.
4. Verified the review wave did not modify learner-visible question content, bank-selection or app runtime, and that approved payload SHA-256 remains `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9` as protected in the versioned runtime contract.

## Findings, grades, reproduction and fix

### Important I-38-01 — Task 36 sequencing assertion blocked legitimate Task 38

The prior acceptance test `state.next_task <= 37` was reasonable when Task 36 first merged but **failed after Task 37's accepted checkpoint**. Actual fresh regression produced **839 PASS, 1 FAIL** (`Task 36 repository state must not claim K3 complete before Tasks 37–41`). Root cause: a time-frozen next-task assertion incorrectly treated a later legitimate state transition as an error.

**Ruling:** Replace only this existing regression assertion (the approved Task 38 finding scope) with a sequence/ledger-aware guard. It verifies `next_task === completed_through_task + 1`, durability of every advanced Task 37–41 ledger completion record, and that K3 COMPLETE is only possible after Task 41; it does not remove acceptance coverage or permit jumping over gates. Cost if wrong: a weak sequencing guard could mislabel K3 complete. The new assertions explicitly fail early/premature/missing-ledger states.

**Fix evidence:** The stale test failed before the fix; after the bounded test change, focused evidence gate and the complete Node suite passed.

### Important I-38-02 — K3 evidence pull OpenAPI contract disagreed with live server

`server/app/main.py::get_learner_evidence` accepts optional `source_store_id`, rejects nonzero cursors without a source ID, rejects mismatching store IDs with 409, and returns a required `store_id` in each success payload. OpenAPI previously specified the response with `additionalProperties: false` and only `[events, next_store_seq]`, omitting returned `store_id` and the source parameter, which could cause generated clients to reject valid responses or omit cursor identity.

**Ruling:** Explicitly document the already-implemented exact API behavior in `api/openapi.yaml`, adding `source_store_id` query parameter, required `store_id` response field, and `409` error response; no API server behavior changes. Cost if wrong: clients may have incompatible cursor/receipt contracts. The documentation regression intentionally failed on missing parameter and passed after the spec correction; Python API contracts remained green.

**Scope discipline:** The original Task 38 packet allowed only the review file. Both Important findings were verified first, then the deterministic compiler was extended by exact file names **only**: `tests/k3-learner-evidence-acceptance.test.js`, `api/openapi.yaml`, and `tests/documentation-contract.test.js`. New compiler regression tests proved scope RED→GREEN and all 37 packet definitions compiled deterministically. The approved plan/spec blobs and task brief digest remained unchanged. Task 38 envelope was rebuilt after each process-only ruling and preflight returned `TASK_EXECUTION_READY = PASS` before the review fixes. No wildcard scope authorization.

## Result and residuals

- **Critical findings:** 0 open.
- **Important findings:** 2 discovered; **2 fixed**, 0 open, subject to exact-branch CI at Task 39.
- **Minor/deferred:** Historical archival K3 design statements remain inside explicitly labeled historical snapshots; they are deliberately preserved, not current authority. No deferred Product defect found in the reviewed wave.
- **Task 37 documentation TDD:** 8 PASS/3 intended documentation RED, then 11/11 GREEN, scope accepted. Source Task 37 9ea78daae3ab2bafdedadc08349807583e9d556b and checkpoint b3528c21d4d20279fea651286214a92cd8d0a0e3.
- **Task 38 scope TDD:** targeted RED then GREEN; deterministic packet compiler and process tests PASS.
- **Task 38 review-fix TDD:** stale Task 36 state gate 839/840 regression RED; OpenAPI focused missing-source-identity RED; after fixes focused 20/20 and Node **842/842 PASS**.
- **Validation:** `npm run validate` PASS (1,120 items, 7 domains, 200 full); `npm run process:verify` 75/75 process tests + adversarial 15/15 PASS; Python **117/117 PASS**.
- **Browser runtime/environment issue:** Local `scripts/browser_smoke.py` first failed because chromedriver was unavailable; the exact-match ChromeDriver 144 was downloaded from official Chrome for Testing via GitHub Actions; the rerun demonstrated local browser navigation to `127.0.0.1` is blocked by the execution environment's organization policy (`127.0.0.1 is blocked`). **This is an unverified local browser gate, not a PASS.** Browser smoke must be run successfully in GitHub Actions on the exact branch SHA before Task 39 and merge; no timeout extension, assertion bypass or product relaxation is permitted.

## Next boundary

After Task 38's approved verification, checkpoint exact head, then run Task 39 full validation and exact-head freeze. Before merge, require exact GitHub CI Node/Python/browser/Pages checks GREEN on the final reviewed head and no open Critical/Important findings. Task 40 review/integration and Task 41 merged-main release verification remain pending. K4 not started.
