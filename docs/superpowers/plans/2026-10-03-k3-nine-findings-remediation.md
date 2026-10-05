# K3 Nine-Finding Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans task by task.

**Goal:** Close F01-F09 with reproducible RED/GREEN evidence without advancing canonical Task26 or publishing blocked work.

**Architecture:** Harden existing evidence stores, not replace the product. Keep the approved event/receipt contracts, add native transactional capture to IndexedDB, use conflict-safe SQLite insertion and additive migration, and verify JSONL/export histories before trusting them.

**Tech Stack:** Existing Node 22, JavaScript modules, IndexedDB, SQLite, Python 3.13, FastAPI, Ajv; no new dependency.

**Spec:** docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md

## Global Constraints

- Spec sections 8, 17, 27, 28, 36, 39 and 47 remain authoritative.
- No canonical plan/spec/packet modification, question-bank change, real learner operation, external deletion or main merge.
- Keep low_model_ready=false; normal task execution is held until repair and publication review.
- Preserve exact retries, immutable events and explicit producer/privacy policy boundaries.
- No forced dependency updates, increased test timeouts or test-result filtering.

## Review Focus

- Storage becomes read-only after initial success: do not reuse sequence or change source identity (Task1/9).
- A second adapter/process accesses the same file while the first writes: serialize or fail closed (Task3).
- A caller mutates an input while hashing/persisting: fingerprint and bytes remain matched (Task5/9).
- Old databases contain malformed JSON or interrupted migration: atomic rollback and honest error (Task7).
- Persisted ledger has orphan/cycle/duplicate/fork or identity discontinuity: reject before external effects (Task8).

### Task 1: F02 - Stable origin fallback

**Files:** Modify/create only `src/evidence/origin.js`; test `tests/k3-repair-origin.test.js`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Keep one origin per storage/session; monotonic sequence survives null, read-only and later-blocked storage. Rejected operations do not advance sequence. Reject unsafe sequence overflow.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-origin.test.js`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-origin.test.js`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F02 stable origin fallback`, append task-done result, and checkpoint the finding.

### Task 2: F04 - Verify JSONL sidecar integrity

**Files:** Modify/create only `scripts/platform-kernel/adapters/jsonlEvidenceStore.js`; test `tests/k3-repair-jsonl-integrity.test.js`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Before read/getById/accept verify event identity, origin, learner, fingerprint, strictly increasing sequence and next counter. Corruption rejects without changing immutable bytes.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-jsonl-integrity.test.js`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-jsonl-integrity.test.js`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F04 verify jsonl sidecar integrity`, append task-done result, and checkpoint the finding.

### Task 3: F03 - Serialize reference JSONL storage

**Files:** Modify/create only `scripts/platform-kernel/adapters/jsonlEvidenceStore.js`; test `tests/k3-repair-jsonl-concurrency.test.js`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Serialize operations for the same resolved storage across adapter instances; enforce a filesystem single-owner lock across processes. Concurrent same-process callers all succeed. Busy foreign/stale locks fail clearly without being stolen. Cleanup only owned transient files.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-jsonl-concurrency.test.js`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-jsonl-concurrency.test.js`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F03 serialize reference jsonl storage`, append task-done result, and checkpoint the finding.

### Task 4: F05 - Conflict-safe SQLite exact retries

**Files:** Modify/create only `server/app/evidence_store.py`; test `server/tests/test_k3_repair_sqlite_race.py`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Use uniqueness-preserving insertion and conflict reselect, never overwrite evidence. One ACCEPTED plus DUPLICATE for identical callers, deterministic different-body CONFLICT, cold store identity creation race safe. Close every connection.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_sqlite_race.py`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_sqlite_race.py`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F05 conflict-safe sqlite exact retries`, append task-done result, and checkpoint the finding.

### Task 5: F06 - Direct store contract validation

**Files:** Modify/create only `src/evidence/acceptance.js; src/evidence/generatedValidators.js; scripts/generate_k3_validators.js; src/evidence/indexedDbStore.js; scripts/platform-kernel/adapters/jsonlEvidenceStore.js; server/app/evidence_validation.py; server/app/evidence_store.py; server/app/main.py`; test `tests/k3-repair-store-validation.test.js; server/tests/test_k3_repair_validation.py`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Use approved generated schemas and definitions before every persistence path. Reject unknown schema/definition, invalid required context/payload/identifiers and direct-PII principals. Do not mutate input. Preserve immutable conflicts and retry receipts. Reuse validation in HTTP; authorization remains distinct.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-store-validation.test.js && PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_validation.py`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-store-validation.test.js && PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_validation.py`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F06 direct store contract validation`, append task-done result, and checkpoint the finding.

### Task 6: F07 - Bound pull cursors

**Files:** Modify/create only `server/app/main.py; server/app/evidence_store.py`; test `server/tests/test_k3_repair_cursor.py`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Reject negative or out-of-range after_store_seq before SQLite. Use the interoperable nonnegative safe-integer bound 9007199254740991. Preserve explicit client error and default-deny access.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_cursor.py`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_cursor.py`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F07 bound pull cursors`, append task-done result, and checkpoint the finding.

### Task 7: F08 - Migrate SQLite query columns

**Files:** Modify/create only `db/schema.sql; server/app/evidence_store.py; server/app/main.py`; test `server/tests/test_k3_repair_migration.py`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Add the nine approved query columns. Migrate old schema transactionally and idempotently from immutable JSON without changing IDs/fingerprints/sequences/bytes. Missing optional values remain NULL. Reject corrupt migration input and roll back; preserve required indexes.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_migration.py`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_migration.py`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F08 migrate sqlite query columns`, append task-done result, and checkpoint the finding.

### Task 8: F09 - Verify complete export-ledger ancestry

**Files:** Modify/create only `src/platform-kernel/evidence/exportLedger.js; server/app/evidence_store.py`; test `tests/k3-repair-export-history.test.js; server/tests/test_k3_repair_export_history.py`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** On persisted reads validate unique IDs, root EXPORTED, existing predecessor, matching identity, legal transitions and at most one child. Never report orphan DELETED success. Normal idempotent append and resumable deletion stay valid.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-export-history.test.js && PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_export_history.py`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-export-history.test.js && PYTHONPATH=server python3 -m pytest -q server/tests/test_k3_repair_export_history.py`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F09 verify complete export-ledger ancestry`, append task-done result, and checkpoint the finding.

### Task 9: F01 - Atomic IndexedDB local capture and durable outbox

**Files:** Modify/create only `src/evidence/localCapture.js; src/evidence/origin.js; src/evidence/indexedDbStore.js; src/evidence/indexedDbOutbox.js`; test `tests/k3-repair-atomic-capture.test.js; tests/k3-local-capture.test.js`. Shared checkpoint/ledger/findings updates are allowed.

**Interfaces:** Consume existing canonical event and receipt objects. Preserve existing signatures except the explicit additive native capture/outbox contract in Task9. Produces the acceptance behavior below.

**Acceptance:** Commit origin sequence, event, receipt and enabled-sync outbox record in the same IndexedDB transaction. Use optimistic revalidation around asynchronous hashing, not unrelated async work inside transactions. Fault injection must roll back all records; restart and multi-instance calls preserve sequence and retries. Arbitrary separately persisted enqueue callbacks cannot satisfy atomicity and must be rejected before persistence; replace only affected fake-store tests with stronger real-adapter tests, retaining all behavior assertions and original probe files as historical evidence.

- [x] Step 1: Add the named regression file(s), reusing original audit fixture semantics and adding the Review Focus cases. Assert the exact failed behavior, not mock call counts.
- [x] Step 2: Run `node --test tests/k3-repair-atomic-capture.test.js tests/k3-local-capture.test.js`. Expected: relevant behavioral assertion fails on the unpatched baseline. Record/freeze file and log digests.
- [x] Step 3: Implement only the scoped fix; no test weakening or unrelated refactoring.
- [x] Step 4: Run `node --test tests/k3-repair-atomic-capture.test.js tests/k3-local-capture.test.js`, then `npm test` and `PYTHONPATH=server python3 -m pytest -q server/tests`. Expected: zero failures; record all warnings.
- [x] Step 5: Review the task diff, commit with `fix: close K3 F01 atomic indexeddb local capture and durable outbox`, append task-done result, and checkpoint the finding.
