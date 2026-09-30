# K3 Process Hardening H0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden K3 execution/recovery so a lower-reasoning model can execute approved task batches from a small durable working set without reconstructing project history or gaining integration authority.

**Architecture:** GitHub remains the execution source of truth. H0 adds a validated branch-aware `CURRENT-STATE.json`, a durable K3 execution ledger, static Project bootstrap documents, a single-source Pages artifact builder, and CI/merge controls. H0 ends only after the integrated main is verified, the real K3 execution branch is created from that exact main, the ChatGPT Project bootstrap is refreshed, and the branch state verifies `low_model_ready=true`.

**Tech Stack:** Node.js 22 ESM, JSON Schema/Ajv already present in devDependencies, Git, GitHub Actions, Python 3.12/pytest for existing regressions, static Markdown/JSON control artifacts.

**Spec:** `docs/superpowers/specs/2026-09-29-k3-process-hardening-h0-design.md`

## Global Constraints

- H0 changes process/control-plane behavior only; do not change learner-visible product behavior or implement K3 Task 5.
- Use `superpowers:using-git-worktrees` at execution time and work on an isolated branch/worktree.
- Use TDD RED -> GREEN for every behavior-changing H0 task.
- Invoke `systematic-debugging` on every unexpected failure.
- Preserve the already merged/corrected K3 Tasks 1-4 behavior.
- Normalize stale K3 spec/plan metadata once, then freeze semantic spec/plan content. Later task progress lives in SDD + durable ledger + current state.
- Never put the containing commit SHA inside `CURRENT-STATE.json`.
- The approved K3 execution branch name is exactly `impl/k3-learner-evidence-engine`.
- A low-reasoning executor may work only on that execution branch and must never merge or push directly to `main`.
- If live `main` differs from branch `base_main_sha`, stop with `MAIN_DRIFT`.
- If spec/plan hashes differ from the frozen approved blobs without an approved amendment, stop with `PLAN_SPEC_HASH_MISMATCH`.
- Do not silently mark unavailable GitHub branch protection as configured; use `merge_guard_mode=HIGH_REASONING_MERGE_GATE` when ruleset mutation is unavailable.
- Do not claim ChatGPT Project token savings numerically. Optimize the explicit working set only.
- `low_model_ready=true` is forbidden until `PROJECT_BOOTSTRAP_CURRENT=PASS`.
- Full command output belongs in the SDD workspace/log files; durable ledger entries remain compact.
- Do not use Gmail, Calendar, Microsoft Graph, or any unrelated live provider.

## Review Focus

1. **Stale state conflict:** main/branch/bootstrap disagree; executor must fail closed instead of choosing from memory.
2. **Main advances mid-batch:** branch `base_main_sha` no longer equals live main; executor must return `MAIN_DRIFT`.
3. **Plan/spec drift:** semantic contract changes after freeze; validator must return `PLAN_SPEC_HASH_MISMATCH`.
4. **False low-model readiness:** one gate, Critical/Important finding, or Project bootstrap is stale; `low_model_ready` must remain false.
5. **Pages boundary drift:** PR CI and deployment must invoke the same artifact builder and preserve private exclusions.

## File Structure Map

State/control:
- create `docs/superpowers/state/current-state.schema.json`
- create `docs/superpowers/state/CURRENT-STATE.json`
- create `scripts/validate_current_state.js`
- create `tests/h0-current-state.test.js`
- modify `package.json`

Durable execution/recovery:
- create `docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md`
- create `docs/superpowers/reviews/2026-09-29-k3-h0-checkpoint.md`
- create `docs/superpowers/reviews/2026-09-29-k3-h0-process-guard.md`
- create `PROJECT-INDEX.md`
- create `RECOVERY-PROTOCOL.md`
- replace repository `DURABLE-FILE-MAP.md` if present, otherwise create it
- modify `HANDOFF.md`
- modify `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
- create `tests/h0-bootstrap-contract.test.js`

Frozen K3 contracts:
- modify metadata/progress-control text only in `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`
- modify metadata/progress-control text only in `docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`
- create `tests/h0-contract-freeze.test.js`
- create `tests/h0-k3-task-briefs.test.js`

Pages/CI:
- create `scripts/build_pages_artifact.js`
- create `tests/h0-pages-artifact.test.js`
- modify `.github/workflows/ci.yml`
- modify `.github/workflows/pages.yml`
- modify `.github/workflows/server-tests.yml`
- create `tests/h0-workflow-contract.test.js`

Project bootstrap deliverable:
- create `docs/superpowers/bootstrap/PROJECT-INDEX.md`
- create `docs/superpowers/bootstrap/RECOVERY-PROTOCOL.md`
- create `docs/superpowers/bootstrap/DURABLE-FILE-MAP.md`
- create `docs/superpowers/bootstrap/PROJECT-BOOTSTRAP-REVISION.txt`
- create `docs/superpowers/bootstrap/README.md`

---

# Phase H0-A — Freeze contracts and establish machine-valid state

### Task 1: Normalize K3 metadata, make Tasks 5-41 self-contained, then freeze

**Files:**
- Modify: `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`
- Modify: `docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`
- Create: `tests/h0-contract-freeze.test.js`
- Create: `tests/h0-k3-task-briefs.test.js`

**Interfaces:**
- Produces: frozen active K3 spec/plan whose product semantics are unchanged.
- Produces: explicit marker `Execution progress source: SDD + durable ledger + CURRENT-STATE`.
- Produces: explicit marker that Tasks 1-4 are historical completed checkboxes and Task 5 is next; future progress does not mutate plan checkboxes.
- Produces: every Task 5-41 section is independently executable after `task-start` extracts only that task section.

- [ ] **Step 1: Write failing contract-freeze and task-brief tests**

`h0-contract-freeze.test.js` reads both files and asserts:
- K3 spec no longer says `DRAFT FOR EXPLICIT WRITTEN-SPEC APPROVAL`;
- spec says Tasks 1-4 merged/corrected and Task 5 next;
- plan contains the exact progress-source marker;
- plan says semantic content is frozen for execution except approved amendment;
- Task 5 remains unchecked.

`h0-k3-task-briefs.test.js` parses every Task 5-41 section and asserts each section contains:
- exact RED command text, not bare `Run RED`;
- `Expected RED:` describing an intended assertion/behavior failure and rejecting setup/import/path-only failures unless file/module absence is itself the intended assertion;
- exact GREEN command text, not bare `Run GREEN`;
- `Expected GREEN:` requiring zero failures for the listed task tests;
- an affected-regression command or explicit `Affected regression: none beyond task GREEN`;
- `**Stop conditions:**` covering spec/plan conflict -> Ruling, unexpected failure -> systematic-debugging, and no main integration/merge for a low-reasoning executor.

The test also rejects any Task 5-41 section containing shorthand-only `Run RED.` or `Run GREEN.`.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-contract-freeze.test.js tests/h0-k3-task-briefs.test.js`

Expected: FAIL because freeze/progress markers are stale and the existing K3 plan has shorthand RED/GREEN steps with no per-task Expected/stop contract.

- [ ] **Step 3: Normalize metadata and mechanically harden Task 5-41 execution text**

Update header/status/progress-control prose. Then edit every Task 5-41 section so its extracted brief is self-contained:
- expand each RED shorthand into the exact command already determined by that task's listed test files and the existing Node/Python command convention;
- add `Expected RED:` immediately after the RED command;
- expand each GREEN shorthand into the exact command for that task;
- add `Expected GREEN:` immediately after the GREEN command;
- state the affected-regression command explicitly;
- append the same concise `**Stop conditions:**` contract to the task section.

Do not alter K3 event contracts, schemas, interfaces, dependencies, task order, or acceptance semantics. These edits are execution annotations only.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/h0-contract-freeze.test.js tests/h0-k3-task-briefs.test.js`

Expected: PASS for all Tasks 5-41.

- [ ] **Step 5: Verify no accidental product-semantic diff**

Run: `git diff --word-diff=porcelain <BASE> -- docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`

Expected: only metadata/progress-control wording plus execution annotations changed; no product interface, dependency, task-order, or acceptance-semantic change.

- [ ] **Step 6: Commit**

Commit: `docs: freeze active K3 execution contracts`

Record the resulting blob SHAs for both frozen files in the SDD ledger. They become the values later written to `CURRENT-STATE.json`.

### Task 2: Add current-state schema and deterministic validator

**Files:**
- Create: `docs/superpowers/state/current-state.schema.json`
- Create: `scripts/validate_current_state.js`
- Create: `tests/h0-current-state.test.js`
- Modify: `package.json`

**Interfaces:**
- Produces: `validateCurrentState(state, context) -> { ok, code, details }`.
- Context fields: `liveMainSha`, `sourceRef`, `repoRoot`, `specBlobSha`, `planBlobSha`, `ledgerText`.
- CLI: `node scripts/validate_current_state.js --live-main-sha <40hex> [--json]`.
- Package command: `npm run validate:state -- --live-main-sha <40hex> --json`.
- Failure codes include: `STATE_SCHEMA_INVALID`, `PLAN_SPEC_HASH_MISMATCH`, `LEDGER_INCOMPLETE`, `MAIN_DRIFT`, `LOW_MODEL_GATE_INVALID`.

- [ ] **Step 1: Write failing tests**

Tests must cover:
- valid revision-1 main state with `base_main_sha=null`, `low_model_ready=false`;
- valid revision-2 execution-branch state with matching live main;
- reject malformed/non-monotonic task numbers;
- reject branch `base_main_sha` mismatch as `MAIN_DRIFT`;
- reject plan/spec hash mismatch;
- reject missing ledger completion for a claimed completed task;
- reject `low_model_ready=true` when any gate is not PASS;
- reject `low_model_ready=true` with open Critical/Important findings;
- reject `low_model_ready=true` when `PROJECT_BOOTSTRAP_CURRENT` is not PASS;
- reject an execution branch name other than `impl/k3-learner-evidence-engine`.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-current-state.test.js`

Expected: FAIL because schema/validator do not exist.

- [ ] **Step 3: Implement minimal schema and pure validator**

Use existing Ajv dev dependency. Keep Git/network lookup outside the pure validator; CLI gathers local Git blob SHAs with `git rev-parse HEAD:<path>` and passes them into the pure function.

- [ ] **Step 4: Add package command**

Add `"validate:state": "node scripts/validate_current_state.js"`.

- [ ] **Step 5: Run GREEN**

Run: `node --test tests/h0-current-state.test.js`

Expected: PASS.

- [ ] **Step 6: Run affected regression**

Run: `npm run validate`

Expected: PASS.

- [ ] **Step 7: Commit**

Commit: `feat: add fail-closed execution state validation`

### Task 3: Create retrospective K3 ledger and revision-1 main state

**Files:**
- Create: `docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md`
- Create: `docs/superpowers/state/CURRENT-STATE.json`
- Modify: `tests/h0-current-state.test.js`

**Interfaces:**
- Ledger Tasks 1-4 are labeled `RETROSPECTIVE VERIFIED`.
- Ledger explicitly states original Tasks 1-4 did not use official SDD task-start/task-done.
- Revision-1 state: Task 4 completed, Task 5 next, `base_main_sha=null`, `low_model_ready=false`, `merge_guard_mode=HIGH_REASONING_MERGE_GATE`.
- Frozen spec/plan blob SHAs equal Task 1 outputs.

- [ ] **Step 1: Add failing integration assertions**

Assert real repository state parses, blob SHAs match, ledger has Tasks 1-4, but `low_model_ready` is false.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-current-state.test.js`

Expected: FAIL because manifest/ledger are missing.

- [ ] **Step 3: Build retrospective ledger from existing durable evidence only**

For each Tasks 1-4 record:
- task title;
- known implementation/corrective commits when available;
- RED/GREEN evidence only where durable evidence supports it;
- corrective audit/PR #22 evidence;
- status `RETROSPECTIVE VERIFIED`;
- explicit historical SDD limitation.

Do not invent missing exact RED commands or historical outputs.

- [ ] **Step 4: Write revision-1 current state**

Use Task 1 frozen blob SHAs. Set all gates according to actual H0 progress; unfinished H0 gates remain FAIL. Set `low_model_ready=false`.

- [ ] **Step 5: Run GREEN**

Run: `node --test tests/h0-current-state.test.js && npm run validate:state -- --live-main-sha $(git rev-parse main) --json`

Expected: tests PASS; validator returns ok for revision-1 state and confirms `low_model_ready=false`.

- [ ] **Step 6: Commit**

Commit: `docs: establish durable K3 execution state`

---

# Phase H0-B — Make recovery static and low-context

### Task 4: Replace dynamic handoff truth with static bootstrap pointers

**Files:**
- Create: `PROJECT-INDEX.md`
- Create: `RECOVERY-PROTOCOL.md`
- Create/replace: `DURABLE-FILE-MAP.md`
- Modify: `HANDOFF.md`
- Modify: `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
- Create: `tests/h0-bootstrap-contract.test.js`

**Interfaces:**
- Bootstrap docs contain no live main SHA, current task count, temporary branch SHA, or CI run number.
- All live-state navigation points to `docs/superpowers/state/CURRENT-STATE.json`.
- Recovery algorithm explicitly resolves live main, checks execution branch, validates state, then reads only the current task brief/relevant files.
- Old programme tracker is historical/index only, never current-state authority.

- [ ] **Step 1: Write failing bootstrap contract tests**

Assert:
- required bootstrap files exist;
- dynamic SHA/task-status patterns are absent from their current-state sections;
- `HANDOFF.md` top section points to current state rather than claiming K3 design/not started;
- tracker contains a non-authoritative/historical marker and current-state pointer;
- recovery protocol contains `MAIN_DRIFT`, `PLAN_SPEC_HASH_MISMATCH`, and low-model stop rule.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-bootstrap-contract.test.js`

Expected: FAIL on stale/missing bootstrap behavior.

- [ ] **Step 3: Implement static bootstrap documents**

Keep historical detail only below an explicit historical boundary. No current SHA/task duplication.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/h0-bootstrap-contract.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `docs: make recovery bootstrap static and state-driven`

---

# Phase H0-C — Single-source Pages artifact and harden CI

### Task 5: Extract one deterministic Pages artifact builder

**Files:**
- Create: `scripts/build_pages_artifact.js`
- Create: `tests/h0-pages-artifact.test.js`
- Modify later in Task 6: workflows only.

**Interfaces:**
- CLI: `node scripts/build_pages_artifact.js [outputDir]`; default output is `_site`.
- Builder copies exactly the currently approved public Pages files.
- Builder excludes `data/legacy`, `data/factory`, and `src/platform-kernel`.
- Builder includes K3 runtime evidence JSON and payload schemas already published by the corrected Tasks 1-4 boundary.
- Repeated builds from the same tree produce the same relative file list and byte contents.

- [ ] **Step 1: Write failing builder test**

Test in a temporary output directory:
- required root files exist;
- `src` and `tracks` public content exists;
- required data/evidence files exist;
- forbidden private paths do not exist;
- two consecutive builds produce identical sorted file manifest + SHA-256 digest list.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-pages-artifact.test.js`

Expected: FAIL because builder is missing.

- [ ] **Step 3: Implement minimal builder**

Port the union of the current `ci.yml`/`pages.yml` assembly behavior into the script. Do not change the public boundary.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/h0-pages-artifact.test.js`

Expected: PASS.

- [ ] **Step 5: Run release artifact verification**

Run:
`rm -rf _site && node scripts/build_pages_artifact.js _site && node --check _site/src/app.js && node scripts/verify_html.js _site/index.html && node scripts/verify_sw_assets.js _site`

Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `refactor: single-source Pages artifact assembly`

### Task 6: Harden required CI identity, caching, concurrency, and Action pinning

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/pages.yml`
- Modify: `.github/workflows/server-tests.yml`
- Create: `tests/h0-workflow-contract.test.js`

**Interfaces:**
- PR quality job ID/name: `quality-gate`.
- Server/adapter job ID/name: `server-adapter-gate`.
- PR workflows use concurrency that cancels superseded runs.
- setup-node enables npm cache.
- setup-python enables pip cache using `server/requirements.txt`.
- CI and Pages both call `node scripts/build_pages_artifact.js _site`; no duplicated inline artifact assembly remains.
- Keep current major versions but pin to the verified immutable SHAs:
  - `actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803` (current v6 target)
  - `actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444` (current v5 target)
  - `actions/setup-python@ece7cb06caefa5fff74198d8649806c4678c61a1` (current v6 target)
  - `actions/configure-pages@983d7736d9b0ae728b81ab479565c72886d7745b` (current v5 target)
  - `actions/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b` (current v4 target)
  - `actions/deploy-pages@d6db90164ac5ed86f2b6aed7e0febac5b3c0c03e` (current v4 target)

- [ ] **Step 1: Write failing workflow contract tests**

Read workflow YAML as text and assert exact invariants above. Also assert no `paths-ignore` is introduced for required workflows.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-workflow-contract.test.js`

Expected: FAIL on duplicate `test` job IDs, mutable tags, missing caches/concurrency, and inline artifact assembly.

- [ ] **Step 3: Apply minimal workflow hardening**

Do not upgrade major Action versions. Preserve existing test/deploy behavior.

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/h0-workflow-contract.test.js tests/h0-pages-artifact.test.js`

Expected: PASS.

- [ ] **Step 5: Run workflow-adjacent regressions locally**

Run the existing local HTTP-server path explicitly:

```bash
set -euo pipefail
npm ci --ignore-scripts
npm run validate
npm run verify:factory-import
npm run verify:sw
rm -rf _site
node scripts/build_pages_artifact.js _site
python3 -m http.server 4174 --bind 127.0.0.1 --directory _site > /tmp/h0-pages-preview.log 2>&1 &
pid=$!
trap 'kill "$pid"' EXIT
for attempt in $(seq 1 20); do
  if curl --fail --silent http://127.0.0.1:4174/index.html >/dev/null; then break; fi
  if [ "$attempt" -eq 20 ]; then cat /tmp/h0-pages-preview.log; exit 1; fi
  sleep 1
done
node scripts/verify_live_release.js http://127.0.0.1:4174
kill "$pid"
trap - EXIT
```

Expected: every command exits 0; live-release verifier PASS.

- [ ] **Step 6: Commit**

Commit: `ci: harden K3 execution and Pages gates`

---

# Phase H0-D — Merge guard, full verification, and integration

### Task 7: Record the real merge guard mode and H0 process gate

**Files:**
- Create: `docs/superpowers/reviews/2026-09-29-k3-h0-process-guard.md`
- Modify: `docs/superpowers/state/CURRENT-STATE.json`
- Modify: `tests/h0-current-state.test.js`

**Interfaces:**
- Preferred mode: `RULESET` only if repository administration mutation is actually available and configured.
- Current known runtime fallback: `HIGH_REASONING_MERGE_GATE`.
- Fallback explicitly forbids low-model merge/direct-main push.
- `PROCESS_GUARDS_READY=PASS` is allowed under fallback only when this limitation/control is documented.

- [ ] **Step 1: Write failing state assertion**

Assert the real manifest/process record agree on `merge_guard_mode` and that low-model permissions exclude integration.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-current-state.test.js`

Expected: FAIL until process guard record/state agree.

- [ ] **Step 3: Re-probe repository protection capability**

Read current main protection/rulesets. If mutation capability remains unavailable, record the limitation exactly and use fallback. Do not pretend protection exists.

- [ ] **Step 4: Update process guard/state**

Leave `low_model_ready=false` because H0 is not yet integrated and Project bootstrap is not refreshed.

- [ ] **Step 5: Run GREEN**

Run: `node --test tests/h0-current-state.test.js && npm run validate:state -- --live-main-sha $(git rev-parse main) --json`

Expected: PASS; low-model readiness remains false.

- [ ] **Step 6: Commit**

Commit: `docs: record K3 high-reasoning merge gate`

### Task 8: Run full H0 pre-integration verification and write checkpoint

**Files:**
- Create: `docs/superpowers/reviews/2026-09-29-k3-h0-checkpoint.md`
- Modify: `docs/superpowers/state/CURRENT-STATE.json`

**Interfaces:**
- Checkpoint records exact HEAD, commands, pass/fail counts, current state revision, unresolved findings, and H0 gates.
- No gate becomes PASS from an old test run.

- [ ] **Step 1: Run focused H0 suite**

Run:
`node --test tests/h0-contract-freeze.test.js tests/h0-k3-task-briefs.test.js tests/h0-current-state.test.js tests/h0-bootstrap-contract.test.js tests/h0-pages-artifact.test.js tests/h0-workflow-contract.test.js`

Expected: PASS.

- [ ] **Step 2: Run complete Node regression**

Run: `npm test`

Expected: zero failures.

- [ ] **Step 3: Run server regression**

Run: `PYTHONPATH=server python3 -m pytest server/tests -q`

Expected: zero failures.

- [ ] **Step 4: Run storage/adapter/browser verification**

Run:
- `python3 scripts/db_smoke.py`
- `node scripts/contract_test.js browser`
- start the API exactly as `.github/workflows/server-tests.yml` does, then run `SDAIA_API_BASE=http://127.0.0.1:8000/v1 node scripts/contract_test.js api`
- `python3 scripts/browser_smoke.py`

Expected: PASS.

- [ ] **Step 5: Run Pages local verification**

Build `_site`, serve on localhost using the same procedure as CI, then run `node scripts/verify_live_release.js http://127.0.0.1:<port>`.

Expected: PASS.

- [ ] **Step 6: Write checkpoint from fresh outputs**

Do not claim all H0 gates PASS yet: integration and Project bootstrap remain pending. Update state accordingly.

- [ ] **Step 7: Commit**

Commit: `test: checkpoint K3 H0 pre-integration state`

### Task 9: Whole-branch review and one fix pass

**Files:**
- SDD workspace review package
- durable ledger/checkpoint updates as required by findings

**Interfaces:**
- Review range: merge-base with live main -> exact H0 HEAD.
- If no true fresh reviewer/subagent exists, record `Final review: self-review (no subagent tool)`.
- Critical/Important findings receive one RED -> GREEN fix pass.
- Minor findings are ledgered/deferred.

- [ ] **Step 1: Run `review-package` for the exact branch range**
- [ ] **Step 2: Perform/dispatch whole-branch review using the H0 spec, plan, Review Focus, and ledger rulings only**
- [ ] **Step 3: Re-grade findings**
- [ ] **Step 4: Fix all Critical/Important findings with a failing regression test first**
- [ ] **Step 5: Re-run the entire verification set from Task 8**
- [ ] **Step 6: Commit the fix pass and checkpoint update**

Stop if any Critical/Important finding remains open.

### Task 10: Open H0 PR and verify exact head in GitHub Actions

**Files:** no product files unless CI exposes a real defect.

**Interfaces:**
- PR targets `main`.
- Exact PR head must have:
  - Pull request quality gate / `quality-gate`: SUCCESS
  - Server and adapter contract tests / `server-adapter-gate`: SUCCESS
- Any CI-only failure triggers `systematic-debugging`, a focused regression test where applicable, and a new exact-head verification.

- [ ] **Step 1: Push exact reviewed H0 branch**
- [ ] **Step 2: Open PR to `main`**
- [ ] **Step 3: Verify required exact-head Actions**
- [ ] **Step 4: Verify PR diff contains no K3 Task 5 implementation**
- [ ] **Step 5: Stop before merge if the executor is not the high-reasoning integration session**

### Task 11: High-reasoning merge and post-merge verification

**Files:**
- post-merge verification record as needed
- no new product behavior

**Interfaces:**
- Merge only the exact reviewed/green H0 head.
- Resolve the new live H0-integrated `main` SHA after merge.
- Verify post-merge server/adapter + Pages runs on that SHA.

- [ ] **Step 1: Merge exact green H0 PR**
- [ ] **Step 2: Resolve live `main` and record merge SHA**
- [ ] **Step 3: Verify post-merge GitHub Actions on that exact SHA**
- [ ] **Step 4: Re-read `CURRENT-STATE.json` from merged main and confirm revision-1 semantics: `base_main_sha=null`, `low_model_ready=false`**
- [ ] **Step 5: Record H0 integration evidence**

Do not report low-model readiness yet.

---

# Phase H0-E — Initialize real K3 execution branch and refresh ChatGPT Project

### Task 12: Create the real K3 execution branch from exact integrated main

**Files:**
- Modify on `impl/k3-learner-evidence-engine`: `docs/superpowers/state/CURRENT-STATE.json`
- Modify on same branch: `docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md`

**Interfaces:**
- Branch is created from exact H0-integrated live `main`.
- State advances to revision 2.
- `base_main_sha` equals exact live main.
- `next_task=5`.
- `PROJECT_BOOTSTRAP_CURRENT` remains FAIL.
- `low_model_ready=false`.

- [ ] **Step 1: Use `superpowers:using-git-worktrees` to create/verify the isolated K3 execution worktree/branch**
- [ ] **Step 2: Initialize the official SDD workspace for the existing K3 plan**
- [ ] **Step 3: Write revision-2 branch state with exact `base_main_sha`**
- [ ] **Step 4: Run state validator against live main**

Run: `npm run validate:state -- --live-main-sha <H0_MERGE_SHA> --json`

Expected: PASS with `low_model_ready=false` only because Project bootstrap gate remains pending.

- [ ] **Step 5: Commit branch initialization**

Commit: `chore: initialize durable K3 execution branch`

### Task 13: Produce one static Project bootstrap upload pack

**Files:**
- Create: `docs/superpowers/bootstrap/PROJECT-INDEX.md`
- Create: `docs/superpowers/bootstrap/RECOVERY-PROTOCOL.md`
- Create: `docs/superpowers/bootstrap/DURABLE-FILE-MAP.md`
- Create: `docs/superpowers/bootstrap/PROJECT-BOOTSTRAP-REVISION.txt`
- Create: `docs/superpowers/bootstrap/README.md`
- Modify: `tests/h0-bootstrap-contract.test.js`

**Interfaces:**
- Pack contains no mutable SHA/current-task duplication.
- `PROJECT-BOOTSTRAP-REVISION.txt` is a stable revision identifier such as `k3-h0-v1`.
- README tells the user which stale Project files to remove/replace:
  - `MASTER_HANDOFF.md`
  - `RECOVERY_CHECKLIST.md`
  - `K2_START_PROMPT.md`
  - old `DURABLE_FILE_MAP.md`
- Replacement Project startup files are exactly the three static bootstrap docs plus revision marker/README if desired.
- GitHub remains the live execution source of truth.

- [ ] **Step 1: Extend bootstrap tests for the upload pack**

Add assertions for all five pack files, revision `k3-h0-v1`, absence of mutable SHA/task status, and README replacement instructions for the four stale Project files.

- [ ] **Step 2: Run RED**

Run: `node --test tests/h0-bootstrap-contract.test.js`

Expected: FAIL because the versioned upload-pack files/revision are missing.

- [ ] **Step 3: Create the pack from canonical repository bootstrap content**

- [ ] **Step 4: Run GREEN**

Run: `node --test tests/h0-bootstrap-contract.test.js`

Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `docs: add versioned ChatGPT Project bootstrap pack`

### Task 14: Refresh active ChatGPT Project and certify low-model readiness

**Files:**
- Modify on execution branch: `docs/superpowers/state/CURRENT-STATE.json`
- Append: `docs/superpowers/reviews/2026-09-29-k3-execution-ledger.md`

**Interfaces:**
- This task has one unavoidable user-side action because current tools cannot replace Project file membership/content.
- High-reasoning session verifies the Project file list after replacement.
- State advances to revision 3 only after Project bootstrap revision matches.

- [ ] **Step 1: Provide the bootstrap pack to the user for one-time Project replacement**
- [ ] **Step 2: User replaces/removes the four stale K2 Project startup files and adds the new static bootstrap files**
- [ ] **Step 3: Re-list active Project files and verify expected bootstrap revision**
- [ ] **Step 4: Update branch state**
Set:
  - `PROJECT_BOOTSTRAP_CURRENT=PASS`
  - all other execution-readiness gates PASS
  - `project_bootstrap_revision=k3-h0-v1`
  - `low_model_ready=true`
  - state revision 3

- [ ] **Step 5: Run final state validation**

Run: `npm run validate:state -- --live-main-sha <H0_MERGE_SHA> --json`

Expected compact result includes:
- `ok=true`
- `next_task=5`
- `low_model_ready=true`
- `merge_guard_mode=HIGH_REASONING_MERGE_GATE` unless native ruleset was configured
- no open Critical/Important findings

- [ ] **Step 6: Commit readiness certification**

Commit: `chore: certify K3 low-model execution readiness`

- [ ] **Step 7: Push execution branch only**

Do not merge it. Task 5 begins from this branch in the lower-reasoning session.

---

# Final H0 Readiness Contract

Do **not** tell the user to switch to the lower-reasoning model until all of these are simultaneously true:

1. live main is the verified H0-integrated SHA;
2. `K3_TASK_BRIEFS_SELF_CONTAINED=PASS` for every Task 5-41;
3. `impl/k3-learner-evidence-engine` exists from that exact main;
4. revision-3 state validates;
5. `low_model_ready=true`;
6. `next_task=5`;
7. all H0 execution-readiness gates PASS;
8. no open Critical/Important findings;
9. Project bootstrap revision is current;
10. official K3 SDD workspace initializes successfully;
11. lower-model merge authority is explicitly absent under `HIGH_REASONING_MERGE_GATE` fallback.

At that point the lower-reasoning model receives only:

- static Project bootstrap;
- live main;
- validated execution-branch state;
- current task brief;
- relevant K3 spec section;
- touched files;
- focused test commands.

It does not need K1/K2 history, old handoffs, or the full conversation.
