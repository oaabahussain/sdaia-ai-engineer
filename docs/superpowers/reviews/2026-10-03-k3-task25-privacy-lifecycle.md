# K3 Task 25 Privacy Lifecycle Checkpoint

## Verified boundary

Task 25: complete. Task 26 is next; not implemented in this checkpoint. No main merge, public deployment, live learner erasure or real destination deletion occurred.

- Canonical task BASE: `680035b83c489013cbd09ca554229ecae8404518`.
- Resolved main: `dbf718f65396388efa234e459155e0e4d3fc8b6d`.
- Local final code commit: `2719740b199ce5224da5502dc2fc9a0eb89085e3`; local audit history is retained in the recovery bundle.
- Specification blob: `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d`.
- Plan blob: `ac158561be17aa8424a71b53d5447ae4a2d375c7`.
- Official Task 25 brief digest: `d38d0c469c636d727bd2040bd43b01671c6b9db6915aaf0c88ca1214f3859f7c`.

## Delivered interfaces

`createPrivacyLifecycle({authorize, load, commit})` provides a privileged K3 snapshot operation, separate from ordinary EvidenceStore. `create_privacy_lifecycle(db_url, authorize=...)` provides the corresponding SQLite transaction. The authorizer must validate subject, operation and the referenced deployment policy; a caller authority_ref does not grant permission. Callback inputs are copied so authorization cannot retarget a request.

DELETE removes the selected learner's raw K3 rows and their linked receipt/fingerprint metadata. DELINK preserves raw evidence only under explicit documented retention policy. Both remove affected identity links, invalidate all projection caches under the explicit INVALIDATE_ALL policy, and persist an incomplete-replay signal. Other learners' raw evidence is preserved. Export-record erasure/retention is explicit; retained local exports require a durable erasure-owner index. Prior retention policy references remain recorded without learner identifiers. There are no hard-coded retention durations.

`createExportLedger({load, append, destinationPolicy})` provides schema-validated append-only export history and destination deletion propagation. `append_export_record` / `read_export_records` provide SQLite persistence and owner indexing. Exact retry is DUPLICATE; a changed body under the same ID conflicts. Predecessor identity and lifecycle transitions are checked. Unknown destination support blocks export; unsupported destinations require a limitation reference. Deletion requests and outcomes append new records, with DELETED / DELETION_UNSUPPORTED / DELETION_FAILED kept distinct. Interrupted requests resume; confirmed deletion is not re-sent.

## TDD and review evidence

Initial RED: 12 missing-behavior assertions failed among 13 Node tests; 8 Python tests failed (one API-shape assertion), without import/collection errors. The exact chained RED command was run; Python also ran separately because shell AND stops after Node failure. Initial GREEN: 13 Node and 8 Python; full regression 615 Node and 58 Python.

Separate final self-review found three Important categories: export deletion recovery/idempotency, retention-policy provenance being overwritten, and retention without a durable erasure owner. Five additional regressions reproduced these: 4 Node assertions failed while 13 original tests passed; 1 Python assertion failed while 8 original tests passed. All original assertions were preserved. The accepted RED replacement is explicit and linked to the original digest; no silent test weakening.

- Final focused tests: 17 Node and 9 Python, zero failures.
- Final full regression: 619 Node and 59 Python, zero failures/skips.
- Process tests: 72/72, included in the Node total.
- Deterministic packet generation: 37/37 current; lint PASS.
- Predefined adversarial cases: 15/15 blocked; not a security certification.
- Canonical content/factory import: 1,120 questions, 7 domains, 140 objectives, unchanged.
- SQLite schema/query smoke, browser storage contract, real local API contract: PASS.
- Pages artifact assembly, JS/HTML parsing, 34 service-worker assets, HTTP release verification: PASS.
- Accepted RED freeze and six-file product scope: PASS.
- Task result validator: TASK_RESULT_ACCEPTED with no failures.
- One inherited Starlette/AnyIO Python deprecation warning remains.

The first result-validation harness had an incorrect fixed checkpoint field count (8 rather than 9). The production guard correctly rejected it. The harness now checks the nine explicitly named fields; no production validator changed. Original rejection and corrected result are preserved.

Final review: self-review (no subagent tool), not independent approval. No additional Critical/Important finding remained in this bounded review. Optional skill support templates were unavailable in the installed package; the installed task-script logic and exact task-brief hash checks were used.

## Limits that remain explicit

These are internal APIs, not a production privacy deployment. The snapshot adapter must supply exclusive/atomic persistence; multiple coordinators require storage-level serialization. Remote deletion callbacks must be idempotent because a lost result can require retry. Local deletion returns external_deletion=NOT_PERFORMED; required propagation must be coordinated before erasing its ledger. Physical disk sanitization, backups, all legacy StateV2 stores, and production identity-provider configuration are not claimed. Consumers must honor the persisted replay limit; this task does not fabricate historical completeness or add generic ordinary-store deletion.

No new browser UI was added. Local Chromium execution remains environment-blocked; it is not claimed green. The reconciled process commit's hosted quality/browser and server workflows passed; Task 25 hosted results must be associated with its actual published commit separately.

Inherited earlier same-day npm audit: 22 development-tool findings (11 high, 10 moderate, 1 low), production-only npm 0. No fresh registry audit or forced update occurred. JSONL sidecar reconstruction remains unavailable. Deferred minors: existing compressed preflight formatting and per-call Python export-schema compilation; neither was broadened into this task.

## Rulings retained

Ruling: use test-only no-op fallbacks solely while the new APIs are absent, so RED proves missing erasure/export behavior rather than import failure. Final tests invoke real APIs when present. Cost if wrong: full behavior assertions still fail rather than allowing a missing implementation to pass.
Ruling: provide a privileged local snapshot adapter (load/atomic commit) and a separate authorization-injected SQLite lifecycle, not generic ordinary-store deletion methods. Require explicit policy references and ERASE/RETAIN decisions; no retention durations. Broad cache invalidation requires explicit INVALIDATE_ALL policy because dependency indexing is not yet specified. External deletion uses an injected export adapter and honest append-only outcomes; local deletion never claims remote erasure. Cost if wrong: an unsupported storage/deployment policy is rejected or needs a future adapter instead of silently asserting deletion.
Ruling: append five review regression cases without removing or weakening any initial assertion; replace accepted RED hashes under high-reasoning review while retaining the original evidence and replacement chain. Cost if wrong: acceptance remains blocked by frozen test hashes.
Ruling: result validation reads task BASE from the actual completion checkpoint into validation context only; it does not add an undeclared field to CURRENT-STATE. Durable metadata promotion follows product-scope acceptance as a separately checked metadata change. Cost if wrong: a checkpoint/base mismatch blocks acceptance or requires recovery reconciliation.

## Evidence manifest

Full logs and local Git history are in the recovery package; these digests bind the observed runs.

- `task25-remote-preflight.log`: `d0edf0b619e3530e4eb4a1d1a2cfd83a687a4987ccaff151f0b05c1d22ba9a20`
- `task25-node-red.log`: `f75a270c070ca2f7fab292f9a863d43bd96b9fa0ba2f51cfb97a417bcf849b34`
- `task25-python-red.log`: `9918f02ebc0523614bca08170163a6eca634dbba728fbd0bea295f8339839bd3`
- `task25-review-node-red.log`: `d1bca8a32ac790bae5e654366aa154ba1bd06bf3a68926e2c8bf93b4734625e0`
- `task25-review-python-red.log`: `e2fc8dba469a558badf9563c466788d34aec6dbf93a11024f97cd2094f5656c2`
- `task25-reviewed-node.log`: `07492ef09fb9dff77d78e6aba83427ac3458d9cb2ac1e93b882c43851e698f4a`
- `task25-reviewed-python.log`: `1ded1c2e8522abe549405a100188d0fc07ee327b7425ddc2e76b016fca1c16de`
- `task25-reviewed-process.log`: `cee85f5262ae1cc3c102dc73b0a536cf492519f83f93d941d0b004ce9fca0814`
- `task25-smokes.log`: `88c1e42d12b4f3951e759a786294a0f78ffbafc02a9b159d2c8dda74519888a6`
- `task25-result-validation.json`: `bbb2c4258892f1e0c65b8c9c028a8db7333665fb271256bbdf22abe2c1b4401b`
- `task25-result-validation-initial-rejection.json`: `fa6168be5c98273256db36ce857749e71d816610461ddcb2c6f7ff06d449736c`

- Final accepted RED digest: `33cc95d3c776d1b592da3e5332207a53dd468f82e645154b4f9f54021f684076`.
- Initial accepted RED digest: `8f7459819dab577a1e31eb0e59ea55ad8f531f68b5e60d1b23f0ff8e7909b28f`.

## Next task

Task 26: StateV2 transition compatibility. Preserve existing active attempts and exam history without inventing K3 item-presentation or response timestamps. Obtain a fresh official brief, packet match and actual-HEAD/runtime preflight after publication. low_model_ready stays false; no saved envelope is portable.
