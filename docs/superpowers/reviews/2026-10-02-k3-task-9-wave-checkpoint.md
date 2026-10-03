# K3 Task 9 Wave Checkpoint

**Date:** 2026-10-02  
**Wave:** Tasks 5-9  
**Task:** 9 — SQLite EvidenceStoreV2  
**Execution branch:** `impl/k3-learner-evidence-engine`

## TDD evidence

- Task BASE: `b3b9744fb9254a0a9fad8470b1adaeb34372ded5`
- RED head: `056b4b5ff1bf5f970052e7943c4e882800d4833f`
  - server run `37059601900` — expected behavioral RED
  - 3 failures: missing K3 tables/indexes and missing store API
  - 24 other server tests passed
- GREEN head: `a50064a757eb18475468174f6987fef42f5c3714`
  - quality run `37059777675` — SUCCESS
  - server/adapter run `37059777647` — SUCCESS
  - commit message: `feat: add SQLite K3 evidence store`

## Verified behavior

- additive K3 schema; legacy `learner_events` definition preserved
- idempotent schema initialization
- stable per-database K3 store identity
- RFC 8785 + SHA-256 trusted fingerprint computed by store
- exact retry -> DUPLICATE preserving original fingerprint/time/sequence
- same event ID/different body -> EVENT_ID_CONFLICT
- origin ID/sequence reuse -> ORIGIN_SEQ_CONFLICT
- monotonically increasing positive `store_seq`
- batch acceptance returns one receipt per input
- direct lookup
- ordered learner reads with cursor
- filtering by activity, assessment attempt, item, release, and definition/type
- learner isolation in read contract
- required K3 query indexes present

## Regression

On GREEN SHA:
- full Node quality gate passed
- full Python server suite passed
- SQLite schema smoke passed
- browser/API adapter contracts passed
- process/state verification, Pages verification, and browser smoke passed

## Rulings

1. The Task 9 packet listed `server/tests/test_k3_evidence_store.py` as create, but Task 6 had already created it. Existing Task 6 tests were preserved and Task 9 tests appended.
2. Exact focused pytest invocation could not be reproduced locally because the local shell lacks `rfc8785`; the same file passed inside the full server suite on the exact GREEN SHA.

## Wave status

Tasks 5, 6, 7, 8, and 9 are complete.  
Next task: 10 — IndexedDB EvidenceStoreV2.  
Low-model executor still has no merge authority.
