# K3 Task 27 — Browser Assessment Context Checkpoint

## Boundary

Task 27 Product implementation is complete on the isolated execution branch candidate. This checkpoint records durable evidence before CURRENT-STATE promotion and does not authorize merge.

- Task BASE: `fe0db5349a82119f4bc3a1b2b60b1fd5042cddda`
- Behavioral RED: `3fc631f74dd6f8d7b929cbd8210191222ce44d52`
- GREEN Product commit: `55e901b427926be3daf5a1672d49774029503263`
- Current Product head after syntax-only correction: `fbd3ca15496166b4934643868f6c650d06f9d5ef`
- Base main: `41a9b91e176877277837bfa18d3a459aa641cd3e`
- Execution branch: `impl/k3-task27-browser-assessment-context`
- Task packet: `docs/superpowers/task-packets/k3/task-027.json`
- Spec blob: `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`
- Plan blob: `ac158561be17aa8424a71b53d5447ae4a2d375c7`

## Delivered behavior

Task 27 exposes the existing frozen assessment snapshot contract to the browser runtime without changing learner-visible assessment behavior.

- Shared snapshot logic now lives in `src/assessment/assessmentSnapshot.js`.
- `src/platform-kernel/release/assessmentSnapshot.js` re-exports `createAssessmentFormSnapshot`, preserving the established platform-kernel import contract.
- Newly created K3 browser strict assessments bind an immutable assessment snapshot to the exact:
  - content release;
  - selected item-version IDs;
  - delivered option order;
  - exam profile ID/version;
  - scoring-policy stable reference;
  - resolved locale;
  - form identity and start time.
- The current learner-facing mode remains `full`; only K3 evidence context maps `full` to `mock`.
- Section assessments retain `section` as both UI and evidence mode.
- Existing scoring, answer selection, confidence behavior, navigation, rendering labels, and StateV2 user flow are unchanged.
- Snapshot attachment is conditional on the runtime having an evidence context, preserving compatibility for runtimes without `BANK.evidence`.

Ruling: current UI mode `full` remains learner-visible and maps only to K3 evidence mode `mock`; the existing runtime `scoring_policy_ref` is frozen into AssessmentFormSnapshotV1's established `scoring_policy_version` stable-reference field. Cost if wrong: later evidence instrumentation may require an explicit policy-ID/version split, but this task must not change learner-visible mode labels or scoring semantics.

## TDD evidence

Exact task command:

`node --test tests/assessment-snapshot.test.js tests/k3-runtime-assessment-context.test.js`

RED commit `3fc631f74dd6f8d7b929cbd8210191222ce44d52` produced 5 tests total: 2 PASS / 3 intended behavioral FAIL.

The failures were assertion failures for the missing Task 27 behavior:

- browser assessment context function missing;
- section browser assessment context behavior missing;
- shared assessment snapshot export missing.

No unrelated import, setup, or environment failure was accepted as RED.

Hosted RED evidence on the same commit:

- quality #865 — FAILED at Node tests as intended;
- server/adapter #1990 — SUCCESS.

Accepted RED raw SHA-256 test hashes:

- `tests/assessment-snapshot.test.js`: `da79632629132939c9f2545dbdd9f20d8b2bccbe38cb9a240190b5793ac87d44`
- `tests/k3-runtime-assessment-context.test.js`: `66d4a7e414c383344ceb9fc3845cf9ace4d1a246bbca958f45f83b9ef0eab307`
- fixture hashes: none
- Accepted RED evidence digest: `2d34bf67f1ff6b9ee769912ab519378f761907b98921a32396f6b8150e8cbdc9`

The RED tests remained unchanged through the Product and syntax-correction commits.

## GREEN implementation and systematic-debugging correction

The required Product implementation commit is:

`55e901b427926be3daf5a1672d49774029503263` — `refactor: expose frozen assessment context to browser`

That commit introduced only the Task 27 behavior defined by the packet.

During verification, hosted quality #866 showed:

- Node tests — SUCCESS;
- process/state/current-bank checks — SUCCESS;
- application module parse — FAILED;
- server/adapter #1991 — SUCCESS.

Systematic-debugging traced the failure to a source-generation escaping error: the new import line in `src/app.js` contained literal backslash+n characters rather than a newline. This was a syntax/serialization defect, not a failed Task 27 behavior.

Minimal correction:

`fbd3ca15496166b4934643868f6c650d06f9d5ef` — `fix: correct browser assessment import newline`

The correction changes only that malformed import separator. It does not alter tests, snapshot behavior, UI behavior, or the accepted RED evidence.

## GREEN and regression evidence on current Product head

On exact head `fbd3ca15496166b4934643868f6c650d06f9d5ef`:

- pull request quality gate #867 — SUCCESS;
- Node project suite — 762/762 PASS;
- deterministic/process tests — 73/73 PASS;
- process failure rules — PASS;
- task packet compiler — PASS, 37 packets;
- execution contract lint — PASS;
- K3 state validation — PASS, state revision 54, completed through Task 26, Task 27 next;
- governed current-bank migration / factory import — PASS, 1120 items / 140 objectives / release `sdaia-ai-engineer.bootstrap.v1`;
- application module parse — PASS;
- service-worker contract — PASS;
- Pages artifact assembly — PASS;
- browser smoke — PASS, including current 200-question full exam behavior;
- server/adapter #1992 — SUCCESS.

Ruling: the connected harness cannot directly invoke the packet's focused GREEN command from a native dependency-complete live clone. Both exact test files named by that command execute and pass inside the full Node suite on the identical current head, while the exact focused command produced the intended RED before implementation. Cost if wrong: a focused-invocation-only ordering difference could be missed; the repository-wide suite is broader and executes both files on the actual branch head.

## Scope and result validation

Task scope from BASE `fe0db5349a82119f4bc3a1b2b60b1fd5042cddda` to current Product head is exactly:

- added: `src/assessment/assessmentSnapshot.js`
- added: `tests/k3-runtime-assessment-context.test.js`
- modified: `src/platform-kernel/release/assessmentSnapshot.js`
- modified: `src/app.js`

All four paths are declared by Task 27's packet. `tests/assessment-snapshot.test.js` remains unchanged.

The repository's actual `validateTaskResult` logic was evaluated against:

- frozen state revision 54;
- Task BASE;
- exact packet/source authority;
- current live main;
- the accepted RED evidence;
- exact changed paths;
- GREEN/regression success;
- the packet-required Product commit message.

Before this checkpoint and ledger entry existed, the only result was:

`IMPLEMENTED_NOT_CHECKPOINTED [DURABLE_EVIDENCE_MISSING]`

No scope, RED mutation, main drift, state drift, execution-branch drift, packet/source drift, task-base checkpoint, finding, or Product commit-message failure was present.

After this checkpoint and matching ledger entry exist, Task result validation must be rerun before CURRENT-STATE promotion.

## Remaining before integration

- append the matching durable ledger entry;
- rerun Task result validation and require `TASK_RESULT_ACCEPTED`;
- promote CURRENT-STATE to completed through Task 27 / Task 28 next;
- run current-head exact-SHA CI;
- request current-head Codex review;
- resolve valid in-scope findings;
- perform exact-head merge-readiness check.

Task 28 is NOT STARTED. This checkpoint does not authorize merge.


## Durable result acceptance

After the checkpoint and ledger evidence existed, the repository's actual Task result validation logic was rerun against the frozen Task 27 execution state and evidence.

Result:

`TASK_RESULT_ACCEPTED`

Failures: `0`

Validated Accepted RED digest:

`2d34bf67f1ff6b9ee769912ab519378f761907b98921a32396f6b8150e8cbdc9`

The validation found no RED mutation, scope expansion, main drift, state drift, execution-branch drift, packet/source drift, task-base checkpoint drift, open finding, GREEN/regression failure, or Product commit-message mismatch.

Task 27 is therefore eligible for CURRENT-STATE promotion. This acceptance does not authorize merge and does not start Task 28.


## Current-head review corrections — evidence and runtime invariants

Codex current-head review on `055e8e1cdb167d970a45c74528ccf7230dee28a7` found three valid in-scope issues:

1. P1: the new static browser module was not guaranteed available for the first offline reload after a fresh service-worker installation;
2. P2: JSON persistence removed the snapshot's runtime freeze before a resumed assessment was assigned to `activeExam`;
3. P1: the originally recorded Task 27 RED SHA-256 values were not raw committed-file hashes.

CURRENT-STATE revision 56 explicitly revoked the prior Task 27 acceptance while these findings were open: completed through Task 26, Task 27 next, status REVIEW, three open important findings.

### Corrected initial RED evidence

Independent recomputation from the raw GitHub base64 blobs at initial RED commit `3fc631f74dd6f8d7b929cbd8210191222ce44d52` gives:

- `tests/assessment-snapshot.test.js`: `be721da1bd425999bf50efbca4e890cd63d097a073bc8ea8aceb3ba718544196`
- `tests/k3-runtime-assessment-context.test.js`: `9b3e4d7f9c0ded125f292bb14cd5c48b768aece94c746d9e1faabe1a27ae7af1`

The corrected initial Accepted RED digest is:

`3085d4b720b44341c3a2bd0a9188a91e5b3046b447085c83c37985df6456c4e7`

This supersedes the earlier incorrect Task 27 hashes/digest recorded above. The original RED commit, command, failure class, and behavioral failures are unchanged.

### Review regression RED

Review RED commit:

`ad2830452ce01d95294c85a07155a7e5b540d624`

It added only in-scope regression assertions for:

- re-freezing a JSON-persisted assessment snapshot on resume;
- seeding the shared assessment module into browser CacheStorage after service-worker readiness;
- wiring both protections in the browser app without changing the learner-facing mode.

Hosted quality #873 produced:

- 765 tests total;
- 762 PASS;
- 3 intended behavioral FAIL;
- failures only for missing snapshot rehydration, missing offline cache behavior, and missing app wiring;
- no unrelated import/setup/environment failure.

Raw review-RED SHA-256 values:

- `tests/assessment-snapshot.test.js`: `be721da1bd425999bf50efbca4e890cd63d097a073bc8ea8aceb3ba718544196`
- `tests/k3-runtime-assessment-context.test.js`: `ad896a689c62957fe4c6a9c283db59538f39aa7c5c93f122479dfbea9a64a30b`

Ruling: replace the corrected initial Task 27 RED only to add current-head review regressions for first-offline-reload caching and persisted snapshot re-freezing; preserve every original Task 27 assertion and command.

Replacement Accepted RED:

- replaces: `3085d4b720b44341c3a2bd0a9188a91e5b3046b447085c83c37985df6456c4e7`
- replacement digest: `08e124a9d409c3953f26941746a5da3b4e1ee97cf7c5acb4e1e849c17a7f163d`

### Review fixes

Review fix commit:

`ff706e34eee7647e21afba1452b41beef49d6095` — `fix: preserve Task 27 offline and resume invariants`

Offline invariant:

- the Task 27 packet does not authorize `sw.js` modification;
- the shared assessment module now exposes an offline-seeding helper;
- the browser app invokes it after `navigator.serviceWorker.ready`;
- the helper stores the exact module URL in `learning-platform-runtime-v1`;
- the existing service worker resolves offline requests with `caches.match(event.request)`, which searches CacheStorage across named caches.

Ruling: satisfy the first-offline-reload invariant inside Task 27's declared app/shared-module scope instead of expanding the task into `sw.js`; cache the already-loaded assessment module after service-worker activation in a dedicated runtime cache that the existing cross-cache `caches.match` can resolve. Cost if wrong: a future service-worker cache strategy that stops using cross-cache matching must explicitly add this module to its own shell manifest or replace this adapter.

Resume invariant:

- JSON persistence still remains unchanged;
- when an evidence-backed active assessment is resumed, its persisted `assessment_snapshot` is rehydrated through `createAssessmentFormSnapshot`;
- this restores deep immutability and revalidates required snapshot identity without fabricating any data.

### Review-fix verification

On exact review-fix head `ff706e34eee7647e21afba1452b41beef49d6095`:

- quality #874 — SUCCESS;
- Node project suite — 765/765 PASS;
- deterministic/process tests — 73/73 PASS;
- state validation — PASS at review state revision 56;
- application parse — PASS;
- service-worker asset verification — PASS;
- Pages artifact — PASS;
- browser smoke — PASS, including offline cached reload;
- server/adapter #1999 — SUCCESS.

The review regression tests remain unchanged after `ad283045...`, so the replacement RED hashes remain frozen.

Task result acceptance must be rerun using the corrected/replacement Accepted RED and only after all three review findings are closed. Any earlier Task 27 acceptance recorded above is superseded by this review correction.
