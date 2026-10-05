# K3 Residual Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans, task by task with TDD and durable records.

**Goal:** Repair the ten reproduced residual groups, then verify and locally integrate the exact source without bypassing publication safeguards.
**Architecture:** Harden existing evidence stores, producer authorization and transport/projection contracts. Preserve canonical raw history and the frozen 41-task product plan; this is a separate repair plan.
**Tech Stack:** Node 22, IndexedDB, Python 3.13, FastAPI, SQLite, JSONL.
**Spec:** docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md (sections 7, 11, 14-16, 19, 21-23, 27, 30, 38)

## Global Constraints
- Original product spec and canonical plan blobs remain unchanged.
- No real learners, real credentials, external deletion, remote policy bypass or forced push.
- User authorized the repairs and reviewed merge; low_model_ready remains false.
- Diagnostics under audits/k3/2026-10-03-integration-residual remain byte-identical. New permanent regressions belong in tests and server/tests.
- Full-suite failures, fixture migrations and unavailable verification must be reported, not hidden.
- Producer grants are identity-resolver data, never accepted from event fields. No inventing production auth provider, retention duration or new infrastructure.

## Review Focus
1. Mixed ordinary/privileged batches: fail closed before persistence, with no prior sibling written on authorization failure (Task 1).
2. Receipt validation: malformed/reordered/foreign-source ACK must not advance transport state (Task 3/4).
3. Restart/open mismatch: durable identity/cursor rejects store replacement, including empty databases (Task 4).
4. Real adapter replay: source identity and sequence use receipt metadata, not client payload or mutation (Task 4).
5. Identity histories: arrival order/timestamps never decide competing roots, predecessors or endpoint changes (Task 5).

## Pre-flight interfaces
- Task 1's structural validator is shared by direct storage and HTTP; authenticated producer grants stay at the trust boundary.
- Task 3 validates receipt semantics consumed by Task 4's source binding; preserved old synthetic fixtures may need missing metadata added with assertions unchanged.
- Task 2 revision candidate now requires proposed revision; old fixtures omitting it will be corrected only to reflect the frozen spec.
- Task 5 uses the same constraint-safe reselect pattern already verified in event acceptance; no new write-lock timing assumptions.

### Task 1: Producer authorization and response privacy (R08/R10)

**Files:** server/app/evidence_auth.py; server/app/main.py; server/app/evidence_validation.py; src/evidence/contract.js; src/evidence/acceptance.js; src/evidence/corrections.js; src/evidence/localCapture.js; src/evidence/responsePrivacy.js; server/app/response_privacy.py
**Test:** tests/k3-residual-security.test.js; server/tests/test_k3_residual_security.py
**Interfaces:** Exact producer grants from the injected identity resolver, never from request JSON. Default-deny sensitive definitions. Same-principal corrections only. Closed OPTION/MULTI_OPTION/BOOLEAN/NUMBER representation; text/structured responses require explicit item-policy capability rather than accepting arbitrary objects.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `node --test tests/k3-residual-security.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_security.py`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `node --test tests/k3-residual-security.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_security.py` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 2: Strict revision preconditions (R09)

**Files:** src/evidence/assessmentRevision.js
**Test:** tests/k3-residual-revision.test.js
**Interfaces:** REJECTED for missing/unsafe/nonsequential proposed revision, with no fabricated revision; APPLIED only for safe base/current match and proposed=base+1. Preserve immutable candidates.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `node --test tests/k3-residual-revision.test.js`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `node --test tests/k3-residual-revision.test.js` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 3: Delivery order, attempt accounting and receipt validation (R02/R03/R04)

**Files:** src/evidence/sync.js; src/evidence/storePort.js; src/evidence/outbox.js; src/evidence/indexedDbOutbox.js; data/schema/evidence-storage-receipt-v1.schema.json
**Test:** tests/k3-residual-delivery.test.js
**Interfaces:** Sort same-origin evidence by origin_seq before batch truncation. Mark all selected attempts before network I/O. Validate all receipt identities, safe sequences and fingerprints before acknowledging any. Recover IN_FLIGHT after interruption.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `node --test tests/k3-residual-delivery.test.js`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `node --test tests/k3-residual-delivery.test.js` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 4: Stable store identities, source-bound cursors and actual replay (R01/R05)

**Files:** src/evidence/indexedDbStore.js; scripts/platform-kernel/adapters/jsonlEvidenceStore.js; src/evidence/sync.js; src/evidence/apiTransport.js; src/evidence/replay.js; server/app/main.py
**Test:** tests/k3-residual-store-replay.test.js; server/tests/test_k3_residual_cursor.py
**Interfaces:** Persist and validate IndexedDB store identity atomically. Expose readRange with immutable raw bodies copied and receipt metadata only on read rows. Cursor pair=(store_id,seq); reject a source change before local acceptance/cursor advance. Compatibility zero bootstrap stays explicit.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `node --test tests/k3-residual-store-replay.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_cursor.py`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `node --test tests/k3-residual-store-replay.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_cursor.py` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 5: Identity link graph and concurrent exact retry (R06/R07)

**Files:** src/platform-kernel/evidence/identityLinks.js; server/app/evidence_store.py
**Test:** tests/k3-residual-identity.test.js; server/tests/test_k3_residual_identity.py
**Interfaces:** A link id has one immutable endpoint pair; UNLINK must name its LINK predecessor. Re-link with a new link id, never a timestamp winner. Reject orphan/branch/conflicting identities in the resolver. SQLite constraint-safe insert and reselect preserves exact retry.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `node --test tests/k3-residual-identity.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_identity.py`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `node --test tests/k3-residual-identity.test.js && PYTHONPATH=server python -m pytest -q server/tests/test_k3_residual_identity.py` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 6: Dependency and recovery limitations assessment

**Files:** package.json; package-lock.json; docs/superpowers/reviews/2026-10-03-k3-residual-remediation.md
**Test:** tests/k3-residual-dependency.test.js
**Interfaces:** Inspect actual usage and current registry audit; remove only unused affected tooling with a regression or upgrade only using retrievable reviewed packages. Do not label blocked registry/native browser/remote publication as solved. Test documented JSONL fail-closed recovery boundary; never fabricate lost accepted_at metadata.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `npm test && PYTHONPATH=server python -m pytest -q server/tests`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `npm test && PYTHONPATH=server python -m pytest -q server/tests` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.

### Task 7: Whole-source review, full tests, local merge and post-merge tests

**Files:** docs/superpowers/state/CURRENT-STATE.json; docs/superpowers/reviews/2026-10-03-k3-residual-remediation.md; docs/superpowers/reviews/2026-10-03-k3-residual-findings.json
**Test:** all existing tests; all preserved diagnostic probes; tests/k3-residual-*.test.js; server/tests/test_k3_residual_*.py
**Interfaces:** Final self-review, no independent subagent capability. One TDD fix pass on additional Important findings. Merge locally only if all implementation blockers closed. Preserve remote publication hold; never route around blocked product-tree write. Verify exact merge source and full suites again; bundle+checksums and fresh restore.

- [ ] Step 1: Preserve/reproduce the named audit failures, and add permanent tests for the interfaces above before changing production.
- [ ] Step 2: Run `npm test && PYTHONPATH=server python -m pytest -q server/tests`; confirm behavioral RED where a fix is required and retain the output.
- [ ] Step 3: Implement only the declared contract and record any necessary scope/fixture ruling.
- [ ] Step 4: Run `npm test && PYTHONPATH=server python -m pytest -q server/tests` and the full Node/Python suites; expected no failures.
- [ ] Step 5: Commit exact changed files and ledger the observed result; never claim external publication.
