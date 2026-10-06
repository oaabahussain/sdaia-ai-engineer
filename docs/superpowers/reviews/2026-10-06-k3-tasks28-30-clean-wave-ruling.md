# K3 Tasks 28-30 Clean Wave Execution Ruling

**Date:** 2026-10-06  
**Status:** APPROVED OPERATIONAL RULING / PRODUCT NOT STARTED  
**Clean base:** `main@da56d3918cf9a2c024d05f85efa4fc5113653acc`

## Purpose

Prepare Tasks 28, 29, and 30 together from one clean source baseline, then execute them sequentially without merging each task to `main` before starting the next.

This ruling changes integration timing only. It does not change the approved K3 product specification, approved K3 implementation plan, event contracts, task semantics, exact RED/GREEN commands, or required Product commit messages.

## Clean-source rule

No Product commit from the previous `impl/k3-task28-evidence-recorder` branch or PR #46 may be used as an execution base or cherry-picked into this wave.

Useful findings from that review may be translated into fresh tests or scope rulings, but old Product history is reference-only.

## Preparation layout

All preparation branches fork from the same clean wave base:

- Task 28 RED preparation branch: independent from Product history.
- Task 29 RED preparation branch: independent from Task 28 Product history.
- Task 30 RED preparation branch: independent from Task 29 Product history.

Preparation branches may contain tests, fixtures, rulings, and execution notes only. They do not contain Product implementation.

## Execution sequence

1. Execute Task 28 from the clean wave base plus the accepted Task 28 preparation commit.
2. When Task 28 is GREEN, exact-head reviewed, and has zero blocking findings, do **not** merge it to `main`.
3. Create the Task 29 execution branch from the exact accepted Task 28 head, then apply only the accepted Task 29 preparation commit.
4. When Task 29 is GREEN, exact-head reviewed, and has zero blocking findings, do **not** merge it to `main`.
5. Create the Task 30 execution branch from the exact accepted Task 29 head, then apply only the accepted Task 30 preparation commit.
6. Run the complete Task 28-30 integration suite, browser/offline gates, server/adapter gates, process verification, and fresh current-head review on the combined Task 30 head.
7. Integrate the wave to `main` only after the combined head is accepted.

A failed later task does not invalidate an earlier accepted task head; repair continues on the wave without pulling unrelated old branches into the execution chain.

## Task 28 preemptive review ruling

The strict assessment provisional revision chain must be coordinated across recorder instances that share one browser evidence store/origin, including separate tabs.

A recorder-local `Map`, module-global state, or per-instance promise tail is insufficient.

The accepted implementation must make the committed attempt revision coordination durable and atomic at the storage boundary with evidence capture, or otherwise prove equivalent cross-tab atomicity without weakening the existing local evidence integrity guarantees.

If the minimal correct implementation requires an additional Task 28 storage path outside the current generated packet, scope must be amended through the high-reasoning lane before Product modification. Do not hide the requirement behind an in-memory workaround.

## Task 29 preparation rule

Task 29 preparation may fully define pure bridge RED tests before Task 28 Product exists because the bridge is tested against a fake recorder port.

The execution branch itself is created only from the accepted Task 28 Product head.

The existing Task 29 offline ruling remains authoritative: service-worker update -> network offline -> first new-version navigation must work without prior online warming of the new evidence modules.

## Task 30 preparation rule

Task 30 remains local-only by default.

The storage-layer interface for preparation is named `createEvidenceSyncCapability(options)` and returns `null` when no explicit authorization provider/configuration is supplied. When configured, it returns an EvidenceSync-compatible capability built over the existing evidence transport primitives.

Authorization material is request-scoped and must not be persisted into StateV2 or learner evidence payloads.

`X-Anon-Id`, `learner_id`, or possession of a progress identifier must never enable the capability.

This interface naming is an implementation-detail ruling only; it does not create a new evidence event or synchronization protocol.

## Main-state boundary

`main` remains unchanged during preparation and during intermediate Task 28/29 execution.

Task 31 remains NOT STARTED until the combined Task 28-30 wave is integrated, post-merge verified, and the Phase F checkpoint is durable.
