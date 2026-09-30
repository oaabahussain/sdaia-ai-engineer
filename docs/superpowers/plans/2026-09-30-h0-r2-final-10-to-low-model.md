# H0-R2 Final 10 — Installation Readiness to Low-Model Launch

**Date:** 2026-09-30  
**Planning branch:** `plan/h0-r2-final-10-to-low-model`  
**Execution branch under verification:** `impl/k3-low-model-execution-h0-r2`  
**Verified execution HEAD at planning time:** `4ab9a4b50e3afa1617cab21ea7dbf08b6c517c91`  
**PR:** #25  
**Status:** PREPARED — DO NOT EXECUTE UNTIL USER STARTS THE LOW-MODEL READINESS RUN  
**Purpose:** Finish H0-R2 integration/readiness and hand off a deterministic Task 5 bundle to a lower-reasoning model without asking it to make architecture or integration decisions.

## Current verified position

- Tasks 1-21: complete.
- Task 22 fix pass: implementation/tests GREEN.
- Latest exact-head checks on `4ab9a4b...`:
  - Pull request quality gate: SUCCESS.
  - Server and adapter contract tests: SUCCESS.
- PR #25: Draft, mergeable.
- Current state still correctly reports:
  - `low_model_ready=false`;
  - `ISOLATED_WORKSPACE_READY=FAIL`;
  - `ACTIVE_REF_RESOLUTION_VALID=FAIL`;
  - `PROJECT_BOOTSTRAP_CURRENT=FAIL`;
  - `TASK5_DRY_RUN_PASS=PENDING`.
- Superpowers plugin/worktree capability is not currently exposed in the active runtime; no readiness claim may bypass this.

## Operating rule

These 10 tasks are sequential readiness gates.

A lower-reasoning model MUST NOT execute Tasks 1-9. They are high-reasoning/integration/runtime-certification work.

Only Task 10 is the handoff/start gate for the lower-reasoning model, and it may start only after Task 9 proves `low_model_ready=true`.

No task below may implement K3 Task 5 product code.

---

## Final Task 1 — Close Task 22 review record

**Class:** VERIFICATION / DOC-CLOSURE  
**Authority:** existing H0-R2 whole-branch review + green fix commits.

**Inputs**
- `docs/superpowers/reviews/2026-09-30-h0-r2-whole-branch-review.md`
- fix commits:
  - `53a07ff174c6bd557db016f706549de3d3a32de6`
  - `580e4cb89065df0997d1d39167d24fa8766042a2`
  - `4ab9a4b50e3afa1617cab21ea7dbf08b6c517c91`
- exact-head CI evidence on `4ab9a4b...`

**Actions**
1. Re-read the three Important findings I-01/I-02/I-03.
2. Verify each corresponding regression now passes.
3. Append closure evidence to the review document:
   - I-01 CLOSED;
   - I-02 CLOSED;
   - I-03 CLOSED.
4. Record:
   - Critical open = 0;
   - Important open = 0;
   - review mode = SELF_REVIEW unless a true independent reviewer capability is actually available.
5. Do not change process implementation.

**Verification**
- review record explicitly contains final severity summary with 0 open Critical/Important;
- current exact-head quality/server checks remain green after the docs-only closure commit or are freshly rerun on the resulting head.

**STOP**
- any finding cannot be demonstrated closed;
- a new Critical/Important issue appears;
- review mode cannot be truthfully stated.

---

## Final Task 2 — Finalize PR #25 exact-head integration candidate

**Class:** INTEGRATION PRE-GATE  
**Authority:** H0-R2 Task 23.

**Preconditions**
- Final Task 1 PASS.
- PR #25 remains mergeable.
- implementation branch is 0 behind live `main`.
- no K3 Task 5 product implementation files are present.

**Actions**
1. Resolve exact PR head.
2. Require on that exact head:
   - `quality-gate` SUCCESS;
   - `server-adapter-gate` SUCCESS.
3. Compare branch against main and explicitly confirm no Task 5 product files:
   - `scripts/generate_k3_validators.js`
   - `src/evidence/generatedValidators.js`
   - `src/evidence/ids.js`
   - `src/evidence/contract.js`
   - `tests/k3-generated-validators.test.js`
   - `tests/k3-evidence-contract-runtime.test.js`
4. Move PR #25 from Draft to Ready for Review only if every gate passes.
5. Put exact-head run IDs in PR metadata/body only; do not create an evidence-only commit.

**Expected**
- exact reviewed head frozen;
- PR ready;
- no open Critical/Important;
- no product-scope leak.

**STOP**
- head drift;
- main drift;
- non-success mandatory check;
- unexpected changed file;
- mergeability becomes false for semantic reasons.

---

## Final Task 3 — Merge H0-R2 exact head and verify post-merge main

**Class:** HIGH-REASONING INTEGRATION  
**Authority:** H0-R2 Task 24.

**Actions**
1. Merge only the exact head approved in Final Task 2, using expected-head protection.
2. Resolve resulting live `main` SHA.
3. Verify post-merge checks on that exact SHA:
   - Pages/release validation;
   - server/adapter contract suite.
4. Re-read `CURRENT-STATE.json` from merged main.
5. Confirm:
   - `low_model_ready=false`;
   - no Task 5 product implementation exists.

**Expected**
- H0-R2 integrated into main;
- post-merge checks SUCCESS;
- readiness remains intentionally false.

**STOP**
- merge conflict alters reviewed semantics;
- exact head changed;
- post-merge check fails.

---

## Final Task 4 — Restore and prove authoritative Superpowers workspace

**Class:** RUNTIME CAPABILITY GATE  
**Authority:** original Task 3B + H0-R2 Task 25.

**Required before execution**
- Superpowers skills must actually appear in the active Skills catalog.
- `using-git-worktrees`, `executing-plans`, TDD/debugging/verification workflow must be available as required by the authoritative runtime.

**Actions**
1. Read the current available Skills catalog.
2. Prove Superpowers availability; do not guess URIs.
3. Create/verify isolated K3 worktree from exact R2-integrated main.
4. Create `impl/k3-learner-evidence-engine` from that exact main SHA.
5. Initialize official SDD workspace for the K3 product plan.
6. Run authoritative `task-start` for K3 Task 5 only.
7. Capture:
   - exact task brief bytes;
   - task BASE SHA;
   - real runtime capability profile.
8. Verify Task 5 packet `task_source_digest` equals the actual Superpowers task brief digest.
9. Bind Task 5 execution envelope.
10. Do not edit Task 5 product files.

**Expected gates**
- `ISOLATED_WORKSPACE_READY=PASS`
- `ACTIVE_REF_RESOLUTION_VALID=PASS`
- execution envelope valid.

**STOP**
- Superpowers absent;
- worktree cannot be proven;
- SDD initialization fails;
- task brief digest mismatch;
- execution branch is not based on exact merged main.

---

## Final Task 5 — Produce static Project bootstrap revision k3-h0-r2-v1

**Class:** TDD / BOOTSTRAP  
**Authority:** H0-R2 Task 26.

**Files**
- canonical files under `docs/superpowers/bootstrap/`
- `tests/h0-r2-project-bootstrap.test.js`

**RED**
`node --test tests/h0-r2-project-bootstrap.test.js`

**Expected RED**
- fails because revision `k3-h0-r2-v1` and H0-R2 recovery/preflight instructions are absent.

**Implementation constraints**
Bootstrap must:
- remain static;
- contain no current task number;
- contain no live main/branch SHA;
- contain no workflow run ID;
- point to live `CURRENT-STATE`;
- explain task packet + envelope + preflight path;
- explain merge-authority prohibition;
- explain recovery from `IMPLEMENTED_NOT_CHECKPOINTED`.

**GREEN**
`node --test tests/h0-r2-project-bootstrap.test.js`

**Regression**
`npm test`

**Expected**
- revision `k3-h0-r2-v1` generated and verified.

**STOP**
- bootstrap requires mutable live status;
- duplicate source-of-truth information is introduced.

---

## Final Task 6 — Refresh active ChatGPT Project bootstrap and verify

**Class:** EXTERNAL/PROJECT GATE  
**Authority:** H0-R2 Task 27.

**Actions**
1. Replace stale Project bootstrap files with the canonical `k3-h0-r2-v1` set.
2. Re-list Project files from the active Project.
3. Read revision marker from Project storage.
4. Confirm stale K2/H0 startup files are no longer authoritative.
5. Do not copy mutable current state into Project bootstrap.
6. Set `PROJECT_BOOTSTRAP_CURRENT=PASS` only from observed Project evidence.

**Expected**
- active Project revision = `k3-h0-r2-v1`.

**STOP**
- Project file mutation is unavailable;
- revision cannot be read back;
- stale bootstrap remains authoritative.

---

## Final Task 7 — Task 5 no-write lower-model dry run

**Class:** LOW-MODEL SIMULATION / NO PRODUCT WRITES  
**Authority:** H0-R2 Task 28.

**Inputs only**
1. active static Project bootstrap;
2. validated `CURRENT-STATE`;
3. real Superpowers Task 5 brief;
4. `docs/superpowers/task-packets/k3/task-005.json`;
5. current Task 5 execution envelope;
6. relevant K3 spec slice;
7. allowed Task 5 source/test files.

**Dry-run output must identify exactly**
- purpose;
- allowed create/modify/delete paths;
- exact RED command;
- expected behavioral RED;
- invalid RED classes;
- minimal implementation intent;
- prohibited inventions;
- exact GREEN command;
- exact regression command;
- stop conditions;
- merge_authority=false.

**Mutation policy**
- product filesystem writes disabled or disposable fixture workspace only.

**Expected**
- `TASK5_DRY_RUN_PASS=PASS`;
- zero Task 5 product file changes;
- no invented decision.

**STOP**
- missing instruction;
- guessed architecture;
- unexpected file proposal;
- merge attempt;
- product mutation.

---

## Final Task 8 — Live adversarial readiness on real K3 runtime

**Class:** VERIFICATION  
**Authority:** H0-R2 Task 29.

**Run against real**
- execution branch;
- current state;
- Project bootstrap revision;
- runtime profile;
- Task 5 packet/envelope.

**Required pressure cases**
1. synthetic main drift;
2. stale plan hash;
3. stale spec hash;
4. task ID mismatch;
5. missing allowed file;
6. proposed unexpected file;
7. invalid RED class;
8. accepted-RED test mutation;
9. unavailable required runtime capability;
10. stale Project revision;
11. open Important finding;
12. ambiguous packet;
13. non-deterministic packet;
14. false reviewer-independence claim;
15. merge attempt.

**Expected**
- 15/15 blocked with fixed codes;
- no product mutation.

**STOP**
- any case reaches accepted execution;
- any case silently improvises;
- any product file changes.

---

## Final Task 9 — Certify low-model readiness

**Class:** FINAL HIGH-REASONING CERTIFICATION  
**Authority:** H0-R2 Task 30.

**Fresh requirements**
- all H0/H0-R2 gates PASS;
- `next_task=5`;
- `ISOLATED_WORKSPACE_READY=PASS`;
- `ACTIVE_REF_RESOLUTION_VALID=PASS`;
- `PROJECT_BOOTSTRAP_CURRENT=PASS`;
- `TASK5_DRY_RUN_PASS=PASS`;
- `ADVERSARIAL_READINESS_PASS=PASS`;
- no Critical/Important findings;
- packet 005 == real Task 5 brief digest;
- execution envelope current;
- live main == execution branch base;
- merge guard truthful.

**Final validation**
`npm run validate:state -- --live-main-sha "$LIVE_MAIN_SHA" --json`

**Expected**
- `ok=true`;
- `next_task=5`;
- `low_model_ready=true`;
- all required gates PASS.

**Regression**
- `npm run process:verify`
- `npm test`

**STOP**
- any non-PASS readiness gate;
- drift;
- packet/brief mismatch;
- Project bootstrap stale;
- Superpowers/worktree proof missing.

---

## Final Task 10 — Launch lower-reasoning Task 5 executor

**Class:** HANDOFF / START GATE  
**Execution model:** lower-reasoning/no-thinking model only AFTER Final Task 9 PASS.

**Do not perform architecture review in this task.**

### Allowed context
- static Project bootstrap `k3-h0-r2-v1`;
- validated live `CURRENT-STATE`;
- real Superpowers Task 5 brief;
- `task-005.json`;
- Task 5 execution envelope;
- relevant K3 spec slice;
- explicitly allowed Task 5 source/test files.

### Mandatory order
```
task-start
-> verify brief digest == packet task_source_digest
-> verify execution envelope
-> preflight PASS
-> run exact RED
-> confirm intended behavioral RED
-> freeze AcceptedRedEvidenceV1
-> minimal implementation only
-> exact GREEN
-> affected regression
-> scope validation from task_base_sha
-> result validator
-> task-done
-> durable ledger/state checkpoint
-> STOP
```

### First-run batching
For Tasks 5-7:
- exactly one product task per run.

Only after 3 consecutive accepted tasks:
- max batch size 2.

Only after 2 consecutive clean 2-task batches:
- max batch size 3.

Any process finding/reset event:
- return batch size to 1.

### Absolute prohibitions
The lower-reasoning executor may not:
- alter spec;
- alter plan semantics;
- choose architecture;
- broaden file scope;
- weaken tests;
- invent fallback dependencies;
- merge to main;
- change `merge_guard_mode`;
- bypass a non-PASS gate.

### Success output
After Task 5:
- one accepted Task 5 commit;
- GREEN/regression evidence;
- scope/result validation PASS;
- durable state advances to `next_task=6`;
- no merge performed.

---

# Final readiness definition

The system is **ready to start the no-thinking model** only when Final Tasks 1-9 are PASS.

Until then:

```
low_model_ready = false
NO PRODUCT EXECUTION BY LOW MODEL
```

After Final Task 9:

```
low_model_ready = true
next_task = 5
LOW-MODEL TASK 5 LAUNCH AUTHORIZED
```
