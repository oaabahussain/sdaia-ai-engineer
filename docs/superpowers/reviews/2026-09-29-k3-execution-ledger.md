# K3 Durable Execution Ledger

**Programme:** K3 — Learner Evidence Engine  
**Created:** 2026-09-29  
**Original implementation PR:** #21  
**Corrective audit PR:** #22  
**Original merge:** `6340dbb958d66885fc6a71e4d853b5fc1def441b`  
**Corrective/current pre-H0 main:** `9607271c86c084df396a39947e915d6560dbbac3`

## Historical process limitation

Tasks 1-4 predate this ledger. They did **not** use the official Superpowers SDD `task-start/task-done` ledger/worktree procedure. The records below are therefore **RETROSPECTIVE VERIFIED** and only repeat durable GitHub evidence.

Task 1 — RETROSPECTIVE VERIFIED — EventDefinitionV2 governance — RED `7940c67ad3f60195fc916892f260dc119cad5e20` / run `36530476337`; GREEN `659ea0138e6669e13066e7ed3780bce5ca17a98c` / run `36533216212`; later covered by corrective audit PR #22.

Task 2 — RETROSPECTIVE VERIFIED — LearnerEvidenceEventV2 and support schemas — RED `a44204e7addf1fc33fda69769dab776cb7c1a4ff` / run `36533334741`; implementation later reached the green Tasks 1-4 branch gates; later covered by corrective audit PR #22.

Task 3 — RETROSPECTIVE VERIFIED — governed event vocabulary — RED `4b9fc0aaa6cb9aab46e20cacd4f6b45da9a6dba2` / run `36534682507`; implementation later reached the green Tasks 1-4 branch gates; later covered by corrective audit PR #22.

Task 4 — RETROSPECTIVE VERIFIED — scoring policy and RuntimeBundleV4 evidence context — RED `6be8d2e662a71d2337429af65685f70ebbabe918` / run `36534811670`; implementation later reached the green Tasks 1-4 branch gates; later covered by corrective audit PR #22.

## Original Tasks 1-4 integration evidence

- Product head `fa6b3622c54b47524aeecfb668cf43f35617482c`: quality `36568516198` PASS; server/adapter `36568516212` PASS.
- Checkpoint head `60e48cc4c6387e72105e2cda3656a613c60b8817`: quality `36568686013` PASS; server/adapter `36568685984` PASS.
- PR #21 merged as `6340dbb958d66885fc6a71e4d853b5fc1def441b`.
- Post-merge: server/adapter `36568799839` PASS; Pages/live release `36568799660` PASS.

## Corrective audit evidence

- Initial audit RED: `88892209aee57e0276cc072c0be93244f59e9be1`.
- Additional falsification REDs: `675538442fbb60795c5dc8ac72b0a4f6f649cb1d`, `d5fa7073df8fc30850a9a8bbdb95ee2fd3b1878d`.
- Final corrective product/test head recorded by audit: `44f6bdd89f1ca91f03577a56314db19a59f96b4f`.
- Quality `36580268666` PASS, Node 377/377 plus validator/SW/Pages/browser.
- Server/adapter `36580268901` PASS.
- Final audit branch head: `03dc76ba28c69b635403197f5a794da70354a176`.
- PR #22 merged into current pre-H0 main `9607271c86c084df396a39947e915d6560dbbac3`.

## Evidence sources

- `docs/superpowers/reviews/2026-09-29-k3-tasks-1-4-verification.md`
- `docs/superpowers/reviews/2026-09-29-k3-tasks-1-4-independent-audit.md`

## Native low-model execution

Task 5: complete (range 07cd50b..99ba56b; RED head cf87711, behavioral failures 8/8 as expected; browser-safety RED ff8ef06; GREEN product head 86f74d81; quality run 37043480615 SUCCESS; server run 37043480593 SUCCESS; final planned commit 99ba56b).

Task 5: Ruling: Ajv standalone emitted CommonJS runtime helpers despite ESM output — inline only the two deterministic helpers (Unicode code-point length and date-time format predicate) after Ajv standalone generation, and fail generation if any other CommonJS helper remains — preserves schema-derived Ajv validation while satisfying the browser-safe interface; cost if wrong: a future Ajv upgrade can introduce a new helper and generation will fail closed.

## Native low-model execution (continued)

Task 6: complete (range a5a76f0..5527aa3; RED head 605b4b3; GREEN implementation head d9642ee; quality run 37054735055 SUCCESS; server run 37054735166 SUCCESS; planned commit 5527aa3).

Task 6: Ruling: the connected runtime cannot run the plan's combined focused shell command directly against a live local clone because the local GitHub clone path is unavailable; the same Task 6 Node test ran inside `npm test` and the Python Task 6 test ran inside `pytest -q server/tests` on the identical implementation SHA, with both workflow gates green — cost if wrong: an ordering-only interaction between the isolated focused invocation and full-suite invocation could be missed, so the shared-vector parity is additionally asserted in both language-specific tests.

## Next task

Task 7 — EvidenceStore port/conformance harness.
