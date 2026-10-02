# K3 Task 13 / Phase B Checkpoint

**Date:** 2026-10-02  
**Task:** 13 — Cross-adapter store conformance  
**Next phase:** C — Authorized synchronization and API

## TDD evidence

- Task BASE: `376eabaeeb74f2432b73c864361bad73dfab437c`
- parity RED: `c07d5ed76bb3ea7c56068755ff72765aa8a1cde8`
  - JSONL `type` filtering failed the shared semantic fixture
  - IndexedDB passed the same Node fixture
  - SQLite passed the same Python fixture
- adapter-scope RED: `42bbcee00c2715be22b5c791cd8dfee662eae863`
- compiler scope fix: `5b57f04aa9a029cbd2f89bbce1bf2471f812715c`
- deterministic packet regeneration: `54f859ff3543b0eebd0ca20f18723c24bd96e54b`
- GREEN: `571335acaf5e86a644b9983250925bfaab433571`
  - quality run `37070809855` — SUCCESS
  - server run `37070809809` — SUCCESS

## Verified parity

JSONL, IndexedDB, and SQLite agree on:
- store acceptance order independent of `occurred_at`
- exact retry -> DUPLICATE preserving original receipt identity
- same event ID / changed body -> CONFLICT
- same origin ID + origin sequence / different event -> CONFLICT
- same sequence number across distinct origins is valid
- late/out-of-order evidence is retained
- learner reads are store-sequence ordered
- governed item/type filters return equivalent logical evidence

## Repair

Only JSONL required Product repair: `type` is now interpreted as the governed alias of `definition_id`, matching IndexedDB and SQLite.

## Phase B status

Tasks 5-13 are durably checkpointed. No merge authority is granted to the low-model executor.

## Next

Task 14.
