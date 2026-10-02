# K3 Low-Model Wave 1 — Tasks 5–24

> **Purpose:** Prepare twenty already-approved K3 implementation tasks for deterministic execution by a low/no-thinking model. This file does **not** implement product code and does **not** authorize execution before the K3 low-model certification gate passes.

**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Preparation base:** `main@559e46a21cd1fe4006158f9ae14f96400a4568f2`  
**Canonical spec:** `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`  
**Canonical implementation plan:** `docs/superpowers/plans/2026-09-29-k3-learner-evidence-engine.md`  
**Execution branch:** `impl/k3-learner-evidence-engine`  
**Prepared range:** K3 Tasks 5 through 24 inclusive (20 tasks)  
**Merge authority for executor:** `false`

## Hard start gate

The low/no-thinking executor MUST NOT begin Task 5 until the live `docs/superpowers/state/CURRENT-STATE.json` proves all of the following simultaneously:

- `ok=true` from the final state validation command.
- `low_model_ready=true`.
- `next_task=5`.
- `open_critical_findings=0`.
- `open_important_findings=0`.
- `PROJECT_BOOTSTRAP_CURRENT=PASS`.
- `ISOLATED_WORKSPACE_READY=PASS`.
- `ACTIVE_REF_RESOLUTION_VALID=PASS`.
- Task 5 packet digest matches the real Superpowers Task 5 brief.
- The current execution envelope is valid.
- Live `main` equals the recorded execution-branch base.

If any item is false, stale, unavailable, or ambiguous: STOP. Do not invent a fallback.

## Executor protocol for every task

For each task N, in strict numeric order:

1. Run the official Superpowers `task-start` flow for Task N and capture the real task brief + BASE SHA.
2. Read only the authority set required by the H0-R2 execution contract: static Project bootstrap, current state, real task brief, `task-NNN.json`, current execution envelope, relevant spec slice, and files explicitly allowed by the packet.
3. Validate packet/brief/spec/plan digests and the execution envelope before product edits.
4. Run the packet's exact RED command.
5. Accept RED only when the intended behavioral assertion fails with `EXPECTED_TASK_BEHAVIOR_MISSING`. Import/setup/environment failure is invalid RED.
6. Implement the smallest change that satisfies the packet. Touch only `allowed_create`, `allowed_modify`, and any explicit allowed delete paths.
7. Run the exact GREEN command.
8. Run the exact regression command.
9. Record durable ledger/checkpoint evidence and exact test results.
10. Commit with the packet's exact commit message.
11. Do **not** merge, rebase into `main`, force-push, widen scope, redesign architecture, add fallback behavior, or skip a failed gate.
12. Proceed to Task N+1 only when Task N is durably checkpointed and the state machine explicitly advances `next_task`.

On any unexpected failure: invoke `systematic-debugging` before editing implementation.  
On spec/plan conflict: record `Ruling:` and follow the spec.  
On a real gate failure: STOP at root cause.

## Prepared twenty-task queue

| # | Task | Depends on | Authoritative packet | Exact verification | Commit |
|---|---|---:|---|---|---|
| 5 | Schema-derived browser validators and event constructor | 4 | `docs/superpowers/task-packets/k3/task-005.json` | `node --test tests/k3-generated-validators.test.js tests/k3-evidence-contract-runtime.test.js` then `npm test` | `feat: add schema-derived K3 browser validation` |
| 6 | RFC 8785 canonicalization and fingerprints | 5 | `task-006.json` | Node JCS test + Python evidence-store test; then Node + Python regression | `feat: add canonical K3 event fingerprints` |
| 7 | EvidenceStore port/conformance harness | 6 | `task-007.json` | store-port RED/GREEN; then `npm test` | `test: define K3 evidence store conformance contract` |
| 8 | JSONL EvidenceStoreV2 | 7 | `task-008.json` | JSONL store RED/GREEN; then `npm test` | `feat: add JSONL K3 evidence store` |
| 9 | SQLite EvidenceStoreV2 | 8 | `task-009.json` | Python evidence-store RED/GREEN; then Node + Python regression | `feat: add SQLite K3 evidence store` |
| 10 | IndexedDB EvidenceStoreV2 | 9 | `task-010.json` | IndexedDB RED/GREEN; then `npm test` | `feat: add IndexedDB K3 evidence store` |
| 11 | Origin identity, local sequence allocation, and durable capture | 10 | `task-011.json` | local-capture RED/GREEN; then `npm test` | `feat: add durable local K3 capture` |
| 12 | EvidenceOutboxRecordV1 state machine | 11 | `task-012.json` | outbox RED/GREEN; then `npm test` | `feat: add K3 evidence outbox` |
| 13 | Cross-adapter store conformance | 12 | `task-013.json` | Node + Python conformance RED/GREEN; then full Node + Python regression | `test: enforce K3 store conformance parity` |
| 14 | Fail-closed learner authorization port | 13 | `task-014.json` | Python auth RED/GREEN; then full regression | `feat: add fail-closed K3 learner authorization` |
| 15 | Authorized batch-push API | 14 | `task-015.json` | Python evidence API RED/GREEN; then full regression | `feat: add K3 evidence batch API` |
| 16 | Authorized cursor-based pull API | 15 | `task-016.json` | Python evidence API RED/GREEN; then full regression | `feat: add K3 evidence pull API` |
| 17 | EvidenceSync port and coordinator | 16 | `task-017.json` | sync RED/GREEN; then `npm test` | `feat: add K3 evidence synchronization` |
| 18 | Strict-assessment optimistic revision resolver | 17 | `task-018.json` | assessment-revision RED/GREEN; then `npm test` | `feat: add K3 strict assessment revision authority` |
| 19 | Correction/supersession graph resolver | 18 | `task-019.json` | corrections RED/GREEN; then `npm test` | `feat: add K3 correction resolution` |
| 20 | ActivityProjectionV1 | 19 | `task-020.json` | activity-projection RED/GREEN; then `npm test` | `feat: add K3 activity projection` |
| 21 | AttemptProjectionV1 | 20 | `task-021.json` | attempt-projection RED/GREEN; then `npm test` | `feat: add K3 attempt projection` |
| 22 | Replay and deterministic integrity findings | 21 | `task-022.json` | replay + integrity RED/GREEN; then `npm test` | `feat: add K3 replay and integrity kernel` |
| 23 | Append-only LearnerIdentityLinkRecordV1 | 22 | `task-023.json` | Node + Python identity-link RED/GREEN; then full regression | `feat: add K3 learner identity links` |
| 24 | Honest LearnerEventV1 compatibility reader | 23 | `task-024.json` | legacy-reader RED/GREEN; then `npm test` | `feat: add honest K3 legacy evidence reader` |

Packet paths abbreviated above always resolve under `docs/superpowers/task-packets/k3/`.

## Wave boundaries

To move faster without sacrificing the existing safety contract, execute continuously but preserve these durable checkpoints:

- **Wave A:** Task 5 only — public event contract foundation.
- **Wave B1:** Tasks 6–9 — canonical fingerprint + first durable stores.
- **Wave B2:** Tasks 10–13 — browser/local durability, outbox, cross-adapter parity.
- **Wave C:** Tasks 14–17 — authorization, push/pull API, synchronization.
- **Wave D:** Tasks 18–22 — strict assessment authority, corrections, projections, replay/integrity.
- **Wave E1:** Tasks 23–24 — identity-link lifecycle and honest V1 compatibility.

A checkpoint is not permission to merge. It is a recovery boundary only.

## Scope protection

The executor MUST NOT:

- implement Tasks 25+ during this wave;
- modify architecture or schema semantics outside the packet;
- add files not allowed by the current packet;
- infer missing requirements;
- replace a canonical library/algorithm with a home-grown alternative;
- weaken fail-closed behavior;
- reinterpret warnings as success;
- mutate accepted RED tests after RED freeze except through the H0-R2 approved process;
- claim independent review when none occurred;
- claim completion from a subset of tests;
- merge to `main`.

## Preparation status

- Twenty packets exist: `task-005.json` through `task-024.json`.
- Their dependency chain is linear from Task 5 through Task 24.
- Each packet already contains exact scope, RED/GREEN/regression commands, stop conditions, authority digests, required skills, and commit message.
- This preparation intentionally leaves all product implementation to the low/no-thinking executor.
- The preparation does **not** override Final Readiness Tasks 4–9. The low-model wave becomes executable only after Final Task 9 certifies `low_model_ready=true`.
