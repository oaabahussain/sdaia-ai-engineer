# K3 Task 14 / Batch 12-14 Checkpoint

**Date:** 2026-10-02  
**Task:** 14 — Fail-closed learner authorization port  
**Batch:** Tasks 12-14

## TDD evidence

- Task BASE: `e89b46ae8c1099e8e7416896f2aae35b0e5a9664`
- RED: `5c81e1772ffe3a147cc3af1f67ae3ab1c3db0ef2`
  - server run `37071155261`
  - 4 expected behavioral failures; 30 existing server tests passed
- GREEN: `26c8044c1551cdb258683d10d624fbf08d0cfd59`
  - quality run `37071342991` — SUCCESS
  - server run `37071343095` — SUCCESS

## Verified authorization boundary

- `AuthorizedLearner` is an explicit pseudonymous principal result
- default resolver always denies server evidence authorization
- `learner_id` query claims do not grant authority
- existing `X-Anon-Id` does not grant K3 evidence authority
- deterministic `StaticLearnerAuthorization` is injectable for tests
- `create_app(db_url=None, learner_auth=None)` installs deny-by-default resolver
- no K3 push/pull endpoint was introduced before Tasks 15-16

## Batch 12-14

- Task 12: outbox state machine complete
- Task 13: JSONL/IndexedDB/SQLite conformance parity complete
- Task 14: fail-closed learner authorization complete

## Next

Task 15 — Authorized batch-push API. Low-model executor still has no merge authority.
