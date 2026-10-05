# K3 Task 26 — StateV2 Transition Compatibility Checkpoint

## Boundary

Task 26 Product implementation is complete on the reviewed execution branch candidate. This checkpoint records durable evidence before state promotion and does not itself authorize merge.

- Task BASE: `17ed821c03803f933f394e63d5a01f4466af0560`
- Behavioral RED: `cf0b6e84c1904eb8d19720ae6de4e9a0254a3cb1`
- GREEN Product head: `fb63460d9fbb416c8a1863984f35a9b0c403dced`
- Base main: `567901657301798d90c36f3264d9efa403621e32`
- Execution branch: `impl/k3-task26-statev2-transition`
- Task packet: `docs/superpowers/task-packets/k3/task-026.json`
- Spec blob: `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`
- Plan blob: `ac158561be17aa8424a71b53d5447ae4a2d375c7`

## Delivered behavior

The StateV2 transition remains deliberately coarse and does not manufacture K3 history.

- A StateV2 assessment that was already active at K3 activation remains resumable through the legacy compatibility path.
- That pre-K3 active attempt receives only the explicit compatibility marker `legacy_state_v2: true`; its recorded fields and timestamps are otherwise preserved.
- Existing StateV2 `exam_history` entries remain coarse historical summaries and are marked `legacy_summary: true`.
- The per-track activation marker is stored under `legacy.preserved.k3_transition_tracks[trackId] = true`.
- Once the track has crossed that transition, a later newly created activity is not reclassified as legacy StateV2.
- No item-presentation events, answer-change events, evidence arrays, or historical timestamps are synthesized.

This follows specification section 33: active attempts continue on the existing StateV2 path until submitted/discarded; legacy history remains attributable to StateV2; new activities after K3 activation use the new evidence path.

## TDD evidence

Accepted RED command:

`node --test tests/k3-state-transition.test.js tests/state-migration.test.js`

RED head `cf0b6e84c1904eb8d19720ae6de4e9a0254a3cb1` produced three intended behavioral assertion failures and no import/setup/environment failure:

- pre-K3 active StateV2 attempt was not explicitly retained on the legacy compatibility path;
- legacy StateV2 exam history was not explicitly classified as coarse legacy history;
- post-transition activities lacked a durable per-track cutover marker preventing legacy reclassification.

Hosted quality run #854 failed at the Node test step with 755 passing / 3 failing assertions.

Accepted RED test hashes:

- `tests/k3-state-transition.test.js`: `a9192b0f21d3e019da1ae30143f74a78558d10c43c9fd8db45a1d7f1951ce226`
- `tests/state-migration.test.js`: `45282ef855f191da0dcd8167f2f3d8fedaba7abcfa84e54cd1e1bc012e223ee2`
- Accepted RED evidence digest: `ba96e4c846962b3c0300f3131b3f3711465dfc727e2601dc49bf7241c3ced70a`

The RED-to-GREEN comparison changes only `src/state/migrate.js`; both RED test files remain unchanged.

## GREEN and regression evidence

GREEN implementation commit:

`fb63460d9fbb416c8a1863984f35a9b0c403dced` — `feat: preserve StateV2 through K3 transition`

Hosted evidence on that exact Product head:

- Pull request quality gate #855: SUCCESS.
- Node suite: 758 passed / 0 failed.
- Task 26 tests: all three new transition assertions passed.
- Existing `tests/state-migration.test.js`: all three migration regressions passed.
- Process suite: 73 passed / 0 failed.
- Server/adapter gate #1978: SUCCESS.
- Python server suite: 117 passed.
- SQLite schema smoke: PASS.
- Browser adapter contract: PASS.
- API adapter contract: PASS.
- Browser smoke / Pages artifact checks inside the quality gate: PASS.
- State validation against the exact PR base and source branch: PASS.

Ruling: the connected harness cannot directly execute the packet's exact focused Node command in a live dependency-complete local clone. The two exact test files in that command ran and passed inside the full Node suite on the identical GREEN SHA, while the same files produced the intended behavioral RED before implementation. Cost if wrong: a focused-invocation-only ordering difference could be missed; the full suite is stricter and exercises both files together with the repository regression set.

## Scope and result validation

Task scope from BASE to GREEN is exactly:

- added: `tests/k3-state-transition.test.js`
- modified: `src/state/migrate.js`

No other Product path changed. `tests/state-migration.test.js` was preserved unchanged.

The repository's real `validateTaskResult` logic was executed against the accepted RED, exact packet authority, Task BASE, current state revision 49, live main, GREEN/regression evidence, and exact changed paths. Before this checkpoint/ledger record existed, the only result was:

`IMPLEMENTED_NOT_CHECKPOINTED [DURABLE_EVIDENCE_MISSING]`

No scope, RED mutation, main drift, state drift, source drift, branch drift, finding, or commit-message failure was present.

After this checkpoint and the matching ledger entry exist, result validation must be rerun before state promotion. State promotion is a separate metadata step and does not retroactively change the Task BASE or Product scope.

## Phase E legacy classification checkpoint

Task 26 completes the Phase E legacy-compatibility implementation boundary:

- LearnerEventV1 historical records remain handled by the Task 24 read-only compatibility reader.
- Privacy lifecycle/export governance remains the Task 25 privileged append-only boundary.
- StateV2 active attempts remain resumable as legacy compatibility state.
- StateV2 historical exam summaries remain coarse legacy summaries.
- K3 fine-grained learner evidence starts only for newly started post-activation activities.
- Zero fabricated historical fine-grained evidence is permitted.

## Remaining before merge

- rerun Task result validation with this durable checkpoint and ledger entry present;
- promote CURRENT-STATE only after Product acceptance;
- run current-head CI;
- request current-head code review;
- resolve any valid in-scope findings;
- exact-head merge readiness check;
- merge using merge commit with expected head SHA;
- perform post-merge verification and durable state normalization.
