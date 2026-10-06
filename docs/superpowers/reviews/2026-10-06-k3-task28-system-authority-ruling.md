# K3 Task 28 — SYSTEM Evaluation Producer Authority Ruling

**Date:** 2026-10-06  
**Type:** High-reasoning execution ruling  
**Status:** APPROVED RULING / PRODUCT RED NOT STARTED  
**Execution base:** `da56d3918cf9a2c024d05f85efa4fc5113653acc`

## Finding

The approved K3 definition `learner.response.evaluated@1` is SYSTEM evidence and requires `authority_ref`.

The existing browser ordinary-capture path is intentionally learner-only:

- `src/evidence/localCapture.js` calls `assertOrdinaryEvidenceProducer`;
- `src/evidence/indexedDbStore.js` repeats the same producer guard inside the atomic `captureLocal` boundary;
- `assertOrdinaryEvidenceProducer` rejects definitions whose `actor_kind` is not `LEARNER`.

The repository already has an explicit trusted admission path for non-learner producer authority at `POST /v1/learner-evidence/batch`. The server resolves the requester through `LearnerAuthorizationPort`; for any non-LEARNER definition it requires an exact configured producer grant matching `(definition_id, authority_ref)`. The grant comes from the server authorization resolver and is not inferred from an event claim or from `X-Anon-Id`.

There is no configured browser capability on this execution base that grants the local web client SYSTEM-producer authority.

## Ruling

1. Task 28 MUST keep ordinary local capture learner-only. Do not weaken or bypass `assertOrdinaryEvidenceProducer`.
2. `createEvidenceRecorder(...).recordEvaluation` MUST exist, but the current browser runtime MUST fail closed when no explicit trusted SYSTEM-producer capability is available.
3. A caller-supplied `authority_ref`, scoring-policy reference, learner identity, or `X-Anon-Id` is not by itself producer authority.
4. Task 28 MUST NOT fabricate SYSTEM `origin_id` / `origin_seq`, reuse the learner capture origin sequence for SYSTEM evidence, route SYSTEM events through `captureLocalEvidence`, or relabel evaluation as LEARNER evidence.
5. The existing server producer-grant contract is the authority boundary to reuse. A future/configured trusted assessment/scoring producer may emit `learner.response.evaluated@1` only when its exact `(definition_id, authority_ref)` grant is established by the server authorization layer.
6. Task 29 therefore records learner activity/presentation/response/confidence/submission evidence in the browser. Evaluation evidence follows this ruling: without an explicit trusted SYSTEM producer it remains absent/fail-closed rather than being fabricated locally.
7. Task 30 EvidenceSync authorization does not turn `X-Anon-Id` or the browser into a SYSTEM producer. Sync and producer authority remain separate gates.

## Authority resolution

This ruling follows the approved K3 specification's trusted-producer requirement and reuses the already-implemented server producer-grant contract. It does not change the approved K3 specification or implementation-plan blobs, does not create a second persistence/synchronization protocol, and does not expand Task 28 Product file scope.

The Task 28 RED must explicitly prove fail-closed behavior for SYSTEM evaluation without trusted authority before implementation begins.

## Boundary

Task 28 Product RED and Product implementation are still NOT STARTED at this ruling boundary. Task 29 and Task 30 remain dependency-blocked. Task 31 remains NOT STARTED.
