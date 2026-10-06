# K3 Tasks 28–30 Browser Evidence Integration Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete K3 Tasks 28–30 sequentially: browser EvidenceRuntime recording, current assessment instrumentation, and optional authorized synchronization, without learner-visible behavior changes.

**Architecture:** Task 28 adds a thin recorder over the already-tested K3 local evidence/store/outbox primitives. Task 29 adds pure DOM-independent bridge functions and calls them from the current assessment flow. Task 30 adds an optional, fail-closed authorization-aware sync capability while leaving local evidence and the existing progress API unchanged.

**Tech Stack:** JavaScript ES modules, Node test runner, browser IndexedDB/CacheStorage/service worker runtime, existing K3 EvidenceStore/Outbox/Sync primitives, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md`

## Authority and purpose

This file is an execution-wave aid. The approved K3 product specification and approved K3 implementation plan remain unchanged. A high-reasoning scope ruling at `docs/superpowers/reviews/2026-10-06-k3-task29-offline-scope-ruling.md` narrowly augments Task 29's generated packet scope to preserve the approved offline/service-worker compatibility baseline.

Authority remains:

1. approved K3 spec;
2. approved K3 implementation plan;
3. applicable durable high-reasoning scope ruling;
4. matching Task 28/29/30 packet;
5. durable checkpoints/ledger;
6. this operational wave plan.

Preparation source baseline: `main@7b30975a377e2b41b2841cde324410b38671791b`.

Execution MUST resolve then-live `main` again before binding Task 28. Do not hard-code the preparation source baseline as an execution base after this preparation package lands.

## Global Constraints

- Preserve the learner-visible 1,120-question bank, 7-domain structure, 200-question full exam profile, AR/EN and RTL/LTR behavior.
- Preserve current scoring, answer selection, rendering, keyboard controls, StateV2 compatibility, and offline/service-worker behavior unless the approved K3 spec explicitly requires otherwise.
- Raw learner evidence is canonical observation; do not add mastery/readiness/psychometric interpretation.
- Local evidence capture must not depend on network availability.
- Event retries preserve the original immutable event body and identity.
- Product Analytics Plane, Learner Evidence Plane, and System Telemetry Plane remain distinct.
- `learner_id` is pseudonymous evidence identity, not authentication.
- `X-Anon-Id` must never become proof of cross-device learner authorization.
- Strict section/mock evidence remains bound to exact release/form/item/order/profile/scoring-policy context from Task 27.
- No low-reasoning executor has merge authority. Every integration stops at the high-reasoning exact-head merge gate.
- Tasks execute strictly 28 → 29 → 30. Do not start a task until its dependency is merged and post-merge verified.
- Do not start Task 31 in this wave.

## Review Focus

1. **SYSTEM evaluation authority:** `learner.response.evaluated` is SYSTEM evidence while current ordinary local capture deliberately rejects non-LEARNER definitions. Task 28/29 must not weaken this guard or fabricate an authority origin/sequence. Test fail-closed behavior and resolve the trusted-producer path explicitly.
2. **Offline-first durability:** Task 28 recorder must durably capture locally with network absent; a sync outage must never block or erase local evidence.
3. **Presentation/event duplication:** Task 29 must emit `item.presented` once per interaction episode, not per DOM rerender, and must emit a new response event only for a committed response/change.
4. **Learner-visible regression:** Tasks 28–30 must preserve K1 bank digest, scoring, UI mode labels, AR/EN/RTL/LTR, keyboard navigation, StateV2 resume, and browser offline reload. Task 29 must additionally prove service-worker update → first new-version navigation offline without prior online module warmup.
5. **Authorization fail-closed:** Task 30 with no explicit EvidenceSync authorization provider/config remains local-only; no fallback to `X-Anon-Id` or a portable learner identifier is permitted.

---

### Task 28: Browser EvidenceRuntime manager

**Files:**
- Create: `src/evidence/recorder.js`
- Create: `tests/k3-evidence-recorder.test.js`
- Modify only if required by RED: `src/storage/interface.js`
- Modify only if required by RED: `src/storage/browser.js`

**Interfaces:**
- Consumes: existing `captureLocalEvidence({store,outbox,eventInput,definition,runtimeContext})`, existing browser EvidenceStore/outbox primitives, Task 27 frozen assessment context, runtime EventDefinitionV2 documents.
- Produces: `createEvidenceRecorder({store,outbox,runtimeContext,clock,crypto})` with methods `startActivity`, `presentItem`, `recordResponse`, `recordConfidence`, `requestHint`, `openExplanation`, `submitAssessment`, `recordEvaluation`.
- Every method accepts one explicit input object. It must use stable IDs/context passed by the caller or generated opaque UUIDv4 runtime identities. It must not scrape the DOM, localized answer text, or infer missing historical facts.

- [ ] **Step 1: Bind a fresh Task 28 execution branch to then-live main**

Use `impl/k3-task28-evidence-recorder` or an equivalently explicit isolated branch. Update execution state/envelope only after resolving live main. Require packet/spec/plan hash identity and preflight PASS before Product edits.

- [ ] **Step 2: Resolve the evaluation-authority gate before RED**

Current `captureLocalEvidence` and the IndexedDB `captureLocal` path call `assertOrdinaryEvidenceProducer`, which rejects non-LEARNER definitions. `learner.response.evaluated@1` is SYSTEM evidence and requires `authority_ref`.

Ruling requirement: do **not** weaken `assertOrdinaryEvidenceProducer`, do not reuse learner origin sequence with fabricated values, and do not silently downgrade `response.evaluated` to a learner event. If no already-authorized system-producer capture primitive exists at execution time, stop Product implementation, record `Ruling:`, and amend scope/authority through the high-reasoning lane before proceeding.

- [ ] **Step 3: Write behavioral RED tests**

Test ordered durable learner-event capture for:
- activity start;
- first item presentation;
- response record/change with canonical option index;
- confidence record;
- explicit hint/explanation methods;
- assessment submission with exact snapshot/profile/scoring-policy references;
- UUIDv4 runtime identities;
- local capture while network/sync is absent;
- local persistence failure surfaces rather than falsely reporting success;
- evaluation method is fail-closed without explicit trusted authority and never routes SYSTEM evidence through ordinary learner capture.

- [ ] **Step 4: Run the exact RED command**

Run: `node --test tests/k3-evidence-recorder.test.js`

Expected: intended Task-28 behavioral assertion failure only. Import/path/setup/environment failure is invalid RED.

- [ ] **Step 5: Implement minimal recorder over existing primitives**

Resolve exact EventDefinitionV2 by name/version from runtime context. Reuse `captureLocalEvidence` for ordinary learner events. Reuse the existing EvidenceStore/outbox rather than creating parallel persistence. Browser adapter changes, if needed, only expose the existing store/outbox capability to later Task 29 code.

- [ ] **Step 6: Run exact GREEN**

Run: `node --test tests/k3-evidence-recorder.test.js`

Expected: PASS with zero failures.

- [ ] **Step 7: Run regression and browser/process gates**

Run: `npm test`. Require full repository suite, current-bank checks, application parse, service-worker asset checks, browser smoke, and server/adapter contract workflows green on exact head.

- [ ] **Step 8: Commit Product change**

Required Product commit message: `feat: add K3 browser evidence recorder`.

- [ ] **Step 9: Freeze RED/result evidence, review, integrate, post-merge verify**

Require `TASK_RESULT_ACCEPTED`, current-head Codex review, zero blocking threads, unchanged live main, exact-head CI, merge commit with expected head SHA, then post-merge Server/Adapter + Pages/live verification and a durable state-only checkpoint. Only then may Task 29 start.

---

### Task 29: Instrument current full/section assessment interactions

**Files:**
- Create: `src/evidence/appBridge.js`
- Create: `tests/k3-app-evidence-integration.test.js`
- Modify: `src/app.js`
- Modify under governed offline scope ruling: `sw.js`
- Modify under governed offline scope ruling: `scripts/browser_smoke.py`
- Read/run-only regression: `tests/k1-current-runtime-regression.test.js` — do not modify it in Task 29; add new assertions to `tests/k3-app-evidence-integration.test.js`.

**Interfaces:**
- Consumes: Task 28 recorder, Task 27 frozen assessment snapshot/context, current `createExam/selectAnswer/setConfidence/move/jump/submitExam` flow.
- Produces pure bridge functions:
  - `beginExamEvidence(recorder,exam,context)`
  - `presentExamItemEvidence(recorder,exam,question,context)`
  - `recordExamAnswerEvidence(recorder,exam,question,answer,context)`
  - `recordExamConfidenceEvidence(recorder,exam,question,confidence,context)`
  - `submitExamEvidence(recorder,exam,result,questions,context)`

- [ ] **Step 1: Start only from Task 28 merged/post-merge-verified main**

Create a fresh `impl/k3-task29-assessment-evidence` branch. Bind exact then-live main and pass packet/envelope/preflight.

- [ ] **Step 2: Write behavioral RED sequence tests**

Pin:
- new strict assessment emits `learner.activity.started`;
- UI `full` continues to display as full but evidence mode remains `mock`;
- first visible item interaction emits `learner.item.presented`;
- answer/confidence rerenders do not emit duplicate presentation;
- each committed initial response/change emits `learner.response.recorded`;
- selecting the same canonical answer without a change does not invent another change event;
- confidence emits only on explicit committed confidence evidence supported by the event contract;
- move/jump creates presentation evidence according to interaction-episode semantics, not DOM rerender count;
- submit emits `learner.assessment.submitted` with exact form/release/profile/scoring-policy context;
- evaluation evidence follows the Task 28 trusted-authority ruling and carries `response_event_id`, scoring-policy stable reference, evaluation status, and `authority_ref`;
- resume preserves the K3 activity/attempt context needed to avoid fabricating a second activity start;
- current scoring/result values remain byte/semantically unchanged;
- service-worker update followed by first new-version navigation offline succeeds without first warming the new evidence modules online.

- [ ] **Step 3: Run exact RED**

Run: `node --test tests/k3-app-evidence-integration.test.js tests/k1-current-runtime-regression.test.js`

Expected: intended instrumentation behavior missing; K1 regression remains green. Harness/import failures do not qualify.

- [ ] **Step 4: Implement pure app bridge**

Keep evidence orchestration in `src/evidence/appBridge.js`. Keep `src/app.js` a thin caller. Use canonical question option indexes, exact Task-27 snapshot IDs, state pseudonymous `anon_id` only as local learner identity, and persisted K3 runtime IDs for resume. Do not treat `anon_id` as sync authorization.

- [ ] **Step 5: Instrument current handlers without behavior changes**

Wire the bridge around the current exam lifecycle. Update the install-time offline boundary so every new same-origin module required by the Task 29 browser import graph is available before the first offline navigation after a service-worker update. Extend browser smoke to exercise update-before-offline without prior new-module warmup. Do not alter scoring, question selection, rendering, labels, keyboard controls, StateV2 history shape required by existing tests, or ordinary online startup.

- [ ] **Step 6: Run exact GREEN and regressions**

Run exact GREEN command, then `npm test`, the update-before-offline browser smoke scenario, and exact-head CI. Preserve the current 1,120-question digest and 200-question allocation. `tests/k1-current-runtime-regression.test.js` is read/run-only.

- [ ] **Step 7: Commit**

Required Product commit message: `feat: record assessment learner evidence`.

- [ ] **Step 8: Result validation/review/merge/post-merge checkpoint**

Same exact-head high-reasoning gate as Task 28. Only after merged and post-merge verified may Task 30 start.

---

### Task 30: Optional authorized sync integration

**Files:**
- Modify: `src/storage/api.js`
- Modify: `src/storage/interface.js`
- Modify: `src/config.js`
- Create: `tests/k3-storage-sync-capability.test.js`
- Read/run-only regression: `tests/storage.api.test.js` — do not modify it in Task 30; add new assertions to `tests/k3-storage-sync-capability.test.js`.

**Interfaces:**
- Consumes: existing `createEvidenceApiTransport`, `syncEvidence`, EvidenceStore/outbox, Task 28 recorder-produced local evidence.
- Produces: a storage-layer sync capability that exists only when explicit EvidenceSync authorization configuration/provider is present. Existing progress/bank/feedback API behavior and X-Anon-Id headers remain unchanged for their current endpoints.

- [ ] **Step 1: Start only from Task 29 merged/post-merge-verified main**

Create a fresh `impl/k3-task30-authorized-evidence-sync` branch, bind live main, and pass preflight.

- [ ] **Step 2: Write fail-closed RED tests**

Pin:
- default configuration exposes no cross-device learner evidence sync;
- local Task-28/29 evidence capture still works with sync absent;
- `X-Anon-Id` alone never enables or authorizes learner evidence push/pull;
- an explicitly injected authorized EvidenceSync provider/config enables the sync capability;
- authorization provider failure/absence keeps evidence pending/local and does not fall back;
- existing progress API calls retain their current X-Anon-Id behavior;
- bank request remains unauthenticated in the existing sense and retains encoded track ID behavior;
- no new credential/token is persisted into learner evidence payloads or StateV2.

- [ ] **Step 3: Run exact RED**

Run: `node --test tests/k3-storage-sync-capability.test.js tests/storage.api.test.js`

Expected: Task-30 capability missing/fail-closed assertions fail; existing storage API regression remains green.

- [ ] **Step 4: Implement explicit optional sync capability**

Default must remain local-only. The implementation may only activate learner evidence sync from explicit EvidenceSync authorization config/provider. Do not infer authorization from pseudonymous learner ID or progress API identity.

- [ ] **Step 5: Run exact GREEN and full regression**

Run exact GREEN command, then `npm test`, server/adapter gate, Pages/browser smoke and live release verification on exact head.

- [ ] **Step 6: Commit**

Required Product commit message: `feat: wire optional K3 evidence sync`.

- [ ] **Step 7: Result validation/review/merge/post-merge checkpoint**

Require accepted RED, valid scope, `TASK_RESULT_ACCEPTED`, current-head review, zero findings, merge commit with expected head, and post-merge verification.

- [ ] **Step 8: Phase F checkpoint**

After Task 30 post-merge closure, explicitly verify:
- learner-visible question bank digest unchanged;
- scoring results/profile allocation unchanged;
- AR/EN and RTL/LTR unchanged;
- offline shell/browser reload unchanged;
- local evidence works without network;
- no X-Anon-Id authorization fallback;
- Task 31 remains NOT STARTED until Phase F checkpoint is durable.

## Self-Review

- Spec coverage: Tasks 28–30 preserve local-first durability, exact content linkage, event vocabulary, strict assessment context, and fail-closed authorization.
- Step scan: each task has independent RED/GREEN/regression/review/integration boundaries.
- Type/interface consistency: Task 29 consumes only Task 28 recorder; Task 30 consumes existing sync primitives and does not redefine recorder/event contracts.
- Review Focus: all five high-risk input/failure classes have explicit tests assigned above.
- Proportion: this operational plan adds sequencing and known-risk rulings without replacing the approved K3 plan.
