# K3 Post-merge Verification and Task 25 Readiness

## Scope and authority

Verified source main: `dbf718f65396388efa234e459155e0e4d3fc8b6d`, tree `61894788dd47d0807fa01d56da71d0032ad639b5`. Tasks 1-24 remain complete. Task 25 product implementation remains NOT STARTED. This checkpoint supersedes the integration transition for execution-branch preparation only; it does not authorize a merge or production deployment.

The source bundle was retrieved from GitHub artifact 11273654683, verified against SHA-256 `5e22f06e1f06411fdb0a3c38896e0c553066cf74c5a647b86ef97219b9578cb7`, and every member checksum verified. Two subsequent Git objects were recovered from the live GitHub API and accepted only after exact source tree and commit SHA equality. Complete graph fsck passed. A real external linked worktree isolates preparation from main.

## Process correction (separate from Task 25)

The preflight CLI omitted execution lint evidence and therefore rejected valid inputs. It also self-attested packet determinism and echoed the packet's failure-rule digest. The callable gate did not bind changed runtime, task, base and source-ref fields to the envelope.

Seven regression tests exercise real approved authority files and the actual CLI. Six assertions failed before the fix; all seven passed after the fix. The repaired CLI derives lint, rule validation/digest, deterministic compilation, source blob hashes and full state validation from actual files. The envelope check now validates runtime digest, task identity, base and execution ref. No gate was removed, forced true, or weakened.

Ruling: keep this correction inside a separate high-reasoning process-preparation plan, not Task 25 product scope. Cost if wrong: readiness stops for another process repair rather than silently admitting stale execution.

## Verification observed in this session

| Check | Result |
|---|---|
| Merged source Node regression before changes | 586 passed, zero failures/skips |
| Final Node regression including new tests | 593 passed, zero failures/skips |
| Python server suite, local Python 3.13 | 50 passed; one existing deprecation warning |
| Process suite | 63 passed; deterministic 37 task packets checked |
| Adversarial readiness | 15/15 blocked fail-closed |
| Canonical content and factory validation | 1,120 questions, 7 domains, 140 objectives; PASS |
| Browser storage adapter contract | PASS |
| API adapter contract with real local uvicorn | PASS |
| SQLite schema and three smoke queries | PASS |
| Pages build, JS/HTML parse, service-worker assets | PASS; 34 assets |
| Product scope drift | No product, data, schema, dependency or question-bank files changed |

The canonical GitHub post-merge server run 37125433056 latest job 111235282373 completed successfully. GitHub Pages run 37125433080 job 111209665165 completed browser smoke, deployment and live release verification successfully. These are hosted checks of the merged source, not a claim that local browser execution succeeded.

Local browser UI verification was attempted separately. Chromedriver is absent, and the available Chromium blocked loopback navigation with ERR_BLOCKED_BY_ADMINISTRATOR. No browser policy was bypassed. Local UI execution is ENVIRONMENT_BLOCKED, not an application pass or application failure. The process-only changes do not alter the deployed product tree.

## Review and retained limitations

Final review: self-review (no subagent tool). The optional reviewer-template and good-test supporting files referenced by installed skills were not supplied by those installed packages; no independent review is claimed.

No additional Critical/Important finding was identified in the bounded repair review. This is not an exhaustive security certification. The earlier same-day lockfile audit still records 22 development-tool findings (11 high, 10 moderate, 1 low), and production-only npm audit 0; no fresh network audit or automatic dependency repair was performed here. JSONL sidecar corruption still requires separate reconstruction; automatic repair and crash-atomic publication are not claimed.

## Task 25 preparation contract

Title: Privacy lifecycle and append-only EvidenceExportRecordV1 ledger.

The official installed task-start executable body extracted the unchanged approved brief. Its SHA-256 must equal the task-025 packet: `d38d0c469c636d727bd2040bd43b01671c6b9db6915aaf0c88ca1214f3859f7c`.

Create only: `src/platform-kernel/evidence/privacyLifecycle.js`, `src/platform-kernel/evidence/exportLedger.js`, `tests/k3-privacy-lifecycle.test.js`, `server/tests/test_k3_privacy.py`. Modify only: `db/schema.sql`, `server/app/evidence_store.py`.

Required behavior comes from specification sections 23 and 36: authorized deletion/de-linking is separate from ordinary EvidenceStore and correction/VOID semantics; invalidate learner-linkable fingerprints, receipts and projection caches according to policy; preserve honest replay limits; record export lifecycle actions append-only. Allowed export actions: EXPORTED, DELETE_REQUESTED, DELETED, DELETION_UNSUPPORTED, DELETION_FAILED. Do not invent retention periods, destination deletion support or deployment policy.

RED/GREEN: `node --test tests/k3-privacy-lifecycle.test.js && PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_privacy.py`.

Regression: `npm test && PYTHONPATH=server python3 -m pytest -q server/tests`.

Import/setup failures do not count as behavioral RED. Generate a fresh envelope from the actual execution HEAD and observed runtime, compare the official brief digest, and run the repaired CLI before product edits. Runtime evidence is session-specific and belongs in the plan workspace, not static bootstrap files. State remains low_model_ready=false: preparation is high-reasoning only, not renewed low-model certification. No Task 25 implementation, destructive privacy operation, or main integration occurred here.

## Preparation completion record

Preparation Task 1: complete. Behavioral RED 6 failing assertions / 7 tests, GREEN 7/7, final full Node 593/593 and Python 50/50; scope and whitespace checks passed. Remote RED tree equals the locally tested RED tree `07e462ec9240b053120e31f35f8cd16900ca0aa7`; RED commit `fce55cb14d032b094e4c5cbc5a486c3caa3f2e36`.

Preparation Task 2: state revision 28 validated against the resolved main and durable completion ledger. Official brief digest matched. Fresh runtime/envelope binding and the repaired Task 25 CLI returned `TASK_EXECUTION_READY = PASS []`. This is observed readiness for the current preparation session; every new runtime must bind again. Task 25 remains NOT STARTED and `low_model_ready=false`.

Ruling: preserve the canonical Tasks 1-24 ledger unchanged and keep this separate preparation completion record in the current checkpoint, avoiding a false Task 25 completion entry. Cost if wrong: recovery needs this checkpoint as well as the product execution ledger.

Deferred minors: compressed legacy formatting in the preflight module was retained to avoid unrelated refactoring. The two unavailable optional skill-support files are a tooling packaging limitation, not silently substituted independent review.
