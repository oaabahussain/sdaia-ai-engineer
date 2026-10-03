# K3 Low-Model Wave 1 — Final Whole-Branch Review

**Date:** 2026-10-03  
**Review mode:** self-review (no independent subagent tool available)  
**Merge base:** `559e46a21cd1fe4006158f9ae14f96400a4568f2`  
**Pre-fix reviewed head:** `4a504876f8cbbf4edf9ac0ed9486eecf0b8b57d6`  
**Final fix head:** `b753582ce713b43e74dd05411498b6a272839b94`  
**Scope:** K3 Tasks 5-24 only. Task 25+ not executed.

## Review focus

The review deliberately re-read high-risk paths rather than trusting task completion:
- authorization and learner scoping;
- immutable store/idempotency/conflict behavior;
- outbox and at-least-once synchronization recovery;
- strict assessment revision authority;
- correction/supersession graphs;
- deterministic projections and replay/integrity;
- pseudonymous identity linking;
- legacy V1 compatibility;
- generated validator publication.

## Findings and fix pass

### Important — persisted IN_FLIGHT records could be stranded after restart

A crash after `markInFlight` but before `applyReceipt` persisted an `IN_FLIGHT` record that ordinary sync no longer selected.

RED: `010f526cd50671aac00c2057f7584e58e3b7762b`  
Fix: `b753582ce713b43e74dd05411498b6a272839b94`

Resolution:
- sync explicitly includes recoverable `IN_FLIGHT` records;
- retrying an `IN_FLIGHT` record refreshes attempt metadata;
- authoritative DUPLICATE acknowledgement safely completes the at-least-once retry.

### Important — SQLite identity-link path accepted direct PII principals

JS identity-link validation was fail-closed, but the Python/SQLite path accepted email/phone/IP-like principals.

RED: `010f526cd50671aac00c2057f7584e58e3b7762b`  
Fix: `b753582ce713b43e74dd05411498b6a272839b94`

Resolution:
- server identity-link persistence rejects direct PII and requires pseudonymous principals.

### Important — authorization adapter could construct a direct-PII learner principal

`AuthorizedLearner` only checked non-empty strings, allowing an adapter to authorize an email/phone/IP-like identifier into the K3 evidence boundary.

RED: `010f526cd50671aac00c2057f7584e58e3b7762b`  
Fix: `b753582ce713b43e74dd05411498b6a272839b94`

Resolution:
- authorization principal construction rejects direct PII before batch/pull learner scoping can use it.

## Verification after fix pass

On `b753582ce713b43e74dd05411498b6a272839b94`:
- quality run `37123311427` — SUCCESS;
- server/adapter run `37123311398` — SUCCESS;
- Node suite, process verification, dynamic state validation, Pages verification, browser smoke, server tests, SQLite smoke, browser adapter, and API adapter all passed.

## Deferred minor

JSONL writes immutable event bytes before atomically replacing its sidecar index. A process interruption in that narrow interval can leave an event/index length mismatch that currently fails closed and requires administrative reconstruction. No event bytes are silently discarded. The K3 spec requires append-only JSONL, monotonic sequence, conflict/idempotency semantics, and sidecar/index support, but does not require automatic crash reconstruction for this reference/export adapter.

## Review result

- Critical: 0
- Important open: 0
- Important fixed in one pass: 3
- Minor deferred: 1

Wave 1 Tasks 5-24 are ready for the high-reasoning integration decision. No merge authority is granted and Task 25+ remains outside this wave.
