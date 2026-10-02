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

## Native low-model execution (continued)

Task 7: complete (range 0357fc6..a3be5b7; RED head 90ddef0; exact focused GREEN 5/5 locally; quality run 37055721650 SUCCESS; server run 37055721436 SUCCESS; planned commit a3be5b7).

## Native low-model execution (continued)

Task 8: complete (range fbea661..ee88c03; RED head 462b71b; GREEN head ee88c03; quality run 37059190149 SUCCESS; server run 37059190169 SUCCESS).

Task 8: Ruling: exact focused command was observed as the same test file passing inside the repository-wide Node suite on the identical GREEN SHA; no separate local clone was available in this harness — cost if wrong: invocation-order-only behavior could be missed, while the full-suite run exercises a stricter environment.

## Native low-model execution (continued)

Task 9: complete (range b3b9744..a50064a; RED head 056b4b5; GREEN head a50064a; quality run 37059777675 SUCCESS; server run 37059777647 SUCCESS).

Task 9: Ruling: `server/tests/test_k3_evidence_store.py` already existed from Task 6 although the Task 9 packet listed it under allowed_create; preserve the Task 6 RFC 8785 parity tests and extend the same file with Task 9 SQLite tests — follows the shared-file reality without deleting earlier coverage — cost if wrong: the test file carries two task concerns instead of one.

Task 9: Ruling: the harness could not run the packet's exact focused Python command locally because `rfc8785` is not installed in the isolated local shell; the identical test file passed inside `pytest -q server/tests` on the GREEN SHA in the server workflow — cost if wrong: a focused-only invocation-order difference could be missed, while the full server suite is stricter and includes the same tests.

## Native low-model execution (continued)

Task 10: complete (range 8963f12..38139fa; control-plane RED e750c87; compiler GREEN 8d68c2d; dependency setup 2ed2d20; behavioral RED c74b79d; GREEN head 38139fa; quality run 37061764750 SUCCESS; server run 37061765049 SUCCESS).

Task 10: Ruling: packet compiler omitted package files for the approved plan's explicit `fake-indexeddb@6.2.5` dependency clause; corrected compiler deterministically and regenerated packet 010 before Product edits — follows the approved plan and fail-closed scope guard — cost if wrong: compiler now assumes npm manifests for any add/install dependency clause.

## Native low-model execution (continued)

Task 11: complete (range 1857e9c..dd26196; RED head 98c3f78; GREEN head dd26196; quality run 37062520059 SUCCESS; server run 37062520217 SUCCESS).

Task 11: Ruling: the approved scope cannot create one crash-atomic transaction spanning localStorage identity/sequence state and IndexedDB evidence bytes; implement serialized call-atomic sequence allocation that commits the sequence only after ACCEPTED/DUPLICATE local persistence, does not enqueue on failure, and surfaces durability failures — cost if wrong: a process crash in the narrow cross-store commit window can still require recovery/reconciliation rather than being impossible by construction.

## Next task

Task 12 — EvidenceOutboxRecordV1 state machine.
