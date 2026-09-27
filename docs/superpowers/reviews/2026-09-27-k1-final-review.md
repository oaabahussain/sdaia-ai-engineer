# K1 Content Factory & Governance Core — Whole-Branch Review

**Date:** 2026-09-27
**Base:** `main@0e04ff16a89efdf99ed5da74b4d418f4ae3145db`
**Branch:** `impl/k1-content-factory-governance-core`
**PR:** #15

Final review: self-review (no subagent tool)

## Review scope

Reviewed K1 against the approved spec and plan with deliberate focus on:
- lifecycle bypass;
- immutable content/release behavior;
- provider trust boundary;
- resume/retry/partial-batch behavior;
- provenance honesty;
- learner-event raw/derived separation;
- current 1,120-item migration;
- public artifact leakage;
- C-ready ports without premature distributed infrastructure.

## Critical findings

None identified.

## Important findings fixed by RED → GREEN

### 1. Direct ACTIVE release construction bypassed CANARY

Finding:
`createContentRelease()` accepted an initial `ACTIVE` status even though transition logic required REVIEW → CANARY → ACTIVE.

Fix:
- added a failing regression test;
- constructor now permits only safe initial states and rejects CANARY/ACTIVE direct construction;
- activation remains available only through the explicit release transition with activation evidence.

Verification:
- RED: Quality #334 failed the new direct-ACTIVE regression.
- GREEN: Quality #338 passed after the fix.

### 2. Learner-event persistence boundaries accepted unvalidated/raw timestamp forms

Finding:
JSONL and SQLite stores could persist caller-provided event objects without enforcing LearnerEventV1 semantics; time filtering also relied on raw string forms.

Fix:
- added RED tests for derived `mastery` field rejection and offset timestamp normalization;
- JSONL persistence now calls the LearnerEvent runtime validator and stores canonical UTC timestamps;
- JSONL time filters compare parsed instants;
- SQLite adapter independently validates required/raw fields, rejects derived/unknown fields and normalizes timestamps to UTC.

Verification:
- RED: Quality #334 and Server/Adapter #913 failed the new persistence-boundary tests.
- GREEN: Quality #338 and Server/Adapter #921 passed.

### 3. Executable CLI exposed run/resume/retry commands without wiring a Runner

Finding:
programmatic CLI tests injected a runner, but the actual `npm run factory -- run ...` process instantiated only JobStore, causing run/resume/retry to exit 2.

Fix:
- added an end-to-end spawned-process RED test;
- executable CLI now creates a persistent local JobStore + AuditStore + LocalRunner;
- default CLI runner is explicitly a local orchestration shell and does not claim content activation or quality certification.

Verification:
- RED: Quality #339 failed the executable CLI test.
- GREEN: Quality #340 passed.

## Deferred minor

- Migrated legacy QuestionFamily records conservatively assign `cognitive_level=understand` because the pre-K1 rendered bank has no authoritative per-item cognitive taxonomy. The objective records are explicitly `provisional`/`migration-derived`, and future refinement must create new governed versions rather than rewrite historical evidence.

## Final compatibility evidence

At reviewed head `31850572b9973b404da39f53be004690462e7d27`:

- Node: **206/206 PASS**.
- Python/server: **20/20 PASS**.
- generated bank: **1,120 PASS**.
- migrated governed lineage: **1,120 items / 140 objectives PASS**.
- legacy payload SHA256 preserved: `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.
- weighted 200 allocation preserved: **36 / 35 / 33 / 29 / 28 / 25 / 14**.
- factory governance validator: PASS.
- factory import verifier: PASS.
- service worker shell: PASS.
- Pages artifact/live verifier: PASS.
- browser smoke: PASS.
- SQLite schema: PASS.
- browser adapter: PASS.
- API adapter: PASS.
- `data/factory/` remains outside the public Pages artifact.
- RuntimeBundleV3 and StateV2 learner behavior remain unchanged.

## Assessment

No open Critical or Important findings remain after the one TDD fix pass.

The branch is eligible for the exact-head integration gate. The self-review is weaker than an independent subagent review; no subagent capability was available in this environment.
