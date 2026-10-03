# K3 Task 8 Checkpoint

**Date:** 2026-10-02  
**Task:** 8 — JSONL EvidenceStoreV2  
**Execution branch:** `impl/k3-learner-evidence-engine`

## TDD evidence

- Task BASE: `fbea661548b27738af068aeac2507a0df3f82e96`
- RED head: `462b71b713c093146c0bd5b939552b8963969ff1`
  - quality run `37059048389` — expected behavioral RED
  - 4/4 Task 8 tests failed because `createJsonlEvidenceStore` was absent
- GREEN head: `ee88c0373808699dc106b899bfcc92c04adbfc68`
  - quality run `37059190149` — SUCCESS
  - server/adapter run `37059190169` — SUCCESS
  - commit message: `feat: add JSONL K3 evidence store`

## Verified behavior

- append-only JSONL immutable event storage
- sidecar index with stable `store_id` and monotonic positive `store_seq`
- trusted RFC 8785/SHA-256 event fingerprints
- exact retry -> DUPLICATE preserving original fingerprint/time/sequence
- same event ID with different body -> EVENT_ID_CONFLICT
- origin ID/sequence reuse -> ORIGIN_SEQ_CONFLICT
- batch returns one receipt per input
- direct lookup and learner/sequence/filter reads
- malformed JSONL fails closed
- no update/delete operation was added

## Regression

On the GREEN SHA:
- full Node suite passed
- deterministic process/state checks passed
- Pages and browser smoke passed
- server, SQLite smoke, browser adapter, and API adapter gates passed

## Next

Task 9. Low-model executor still has no merge authority.
