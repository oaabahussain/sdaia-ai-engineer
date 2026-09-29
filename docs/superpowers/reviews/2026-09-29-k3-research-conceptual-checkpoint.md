# K3 Learner Evidence Engine — Research / Conceptual Design Checkpoint

Date: 2026-09-29

## Repository state

- Repository: `oaabahussain/sdaia-ai-engineer`
- Live `main`: `3c296632a54f68f0ecc7ad122298d9661706cb2b`
- Research branch: `research/k3-learner-evidence-landscape`
- Research branch HEAD before this checkpoint: `a13aab5846d5007be65e8e1d0b9baa94baf4c0c0`
- Branch is ahead of main by documentation/research only.
- Production K3 implementation: **NOT STARTED**.
- K3 implementation branch: **NONE**.

## Gate

- K3 landscape/reverse-engineering/failure-mining research: **DECISION-READY FOR CONCEPTUAL ARCHITECTURE**.
- K3 conceptual architecture: **PROPOSED; EXPLICIT APPROVAL PENDING**.
- K3 normative written spec: **NOT CREATED**.
- K3 implementation plan: **NOT CREATED**.
- K3 production code: **NOT STARTED**.

## Durable artifacts

1. `docs/superpowers/research/2026-09-29-k3-learner-evidence-landscape.md`
2. `docs/superpowers/research/2026-09-29-k3-research-state.json`
3. `docs/superpowers/research/2026-09-29-k3-conceptual-architecture-proposal.md`

## Research conclusion

Recommended topology:
- bounded fine-grained immutable learner-evidence event stream;
- rebuildable/versioned attempt/activity projections;
- local-first IndexedDB capture + separate outbox;
- at-least-once synchronization with per-event idempotent dispositions;
- source event separated from trusted storage receipt/cursor;
- per-origin ordering + trusted store cursor rather than global client timestamp ordering;
- explicit response/evaluation separation;
- explicit correction/supersession;
- pseudonymous learner identity + random origin identity + separate account/identity mapping;
- exact content release / form / family / item version linkage;
- learner evidence / product analytics / system telemetry as three separate planes;
- xAPI/Caliper/LRS through adapters, not canonical internal storage;
- no Kafka/KurrentDB/CRDT/general sync dependency for K3 v1.

## Critical repository gap confirmed

Current `LearnerEventV1` has validator parity drift:
- JSON Schema requires `answer` and `confidence`;
- JS runtime does not require either;
- Python/SQLite validator requires `answer` but not `confidence`.

This is an inherited contract-governance gap to fix under the approved K3 successor/migration, not justification to reopen K2.

## Remaining design choices that do not change topology

- strict frozen-assessment concurrency token mechanism;
- whether explicit activity pause/resume events are included in v1;
- exact envelope field names;
- correction-event subtype shape;
- identity-link schema;
- retention policy identifiers/durations;
- xAPI/Caliper mapping tables;
- initial query indexes after workload analysis.

## Resume instruction

Do not start implementation.

Next exact action:
1. obtain explicit user approval or requested changes to the conceptual architecture proposal;
2. after conceptual approval only, write the normative K3 spec;
3. self-review the spec against the research matrix;
4. obtain explicit written-spec approval;
5. only then invoke planning skills.

No production code, TDD execution, or implementation plan before those gates.
