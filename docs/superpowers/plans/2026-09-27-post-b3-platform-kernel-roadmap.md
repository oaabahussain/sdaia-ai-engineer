# Platform Kernel Roadmap — Post-K1

**Date:** 2026-09-27  
**Status:** Authoritative forward roadmap; not an implementation plan  
**Verified baseline:** `main@d6576a8d2f4f98d2310174f633622c0b96017eb3`

## Governing documents

1. `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
2. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
3. `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`
4. `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`
5. future approved K2 written spec and implementation plan.

## Completed foundation

- Programme A — merged + verified.
- B0 — merged + verified.
- B1 — merged + verified.
- B2 — merged + verified.
- B3 — merged + verified.
- **K1 — Content Factory & Governance Core — merged + post-merge verified.**

K1 merge SHA:

`d6576a8d2f4f98d2310174f633622c0b96017eb3`

K1 established the governed kernel needed by later content growth: versioned family/item lineage, source/quality/review policies, provider independence, provenance, resumable orchestration, quality stages, Coverage Engine, content releases/CANARY/rollback, raw learner evidence and interoperability seams.

## Current programme — K2 Coverage Expansion & Controlled Release

**Status:** DESIGN NEXT

Purpose:

Expand content by closing measured coverage gaps through the governed K1 lifecycle rather than optimizing for raw question count.

Canonical flow:

`Coverage Inventory → Coverage Gap → Candidate Families → Factory Quality Pipeline → Review → CANARY Release → Promote/Quarantine → Observe`

### K2 target outcomes

K2 should establish a repeatable expansion mechanism capable of growing beyond the current 1,120 questions while preserving quality and lineage.

Potential controlled capacity milestones:

- approximately 3,000 validated items;
- approximately 6,000;
- approximately 10,000;
- approximately 14,000+.

These are capacity checkpoints, not acceptance criteria.

### K2 acceptance dimensions

A content batch cannot be promoted based on count alone. K2 design must define measurable gates for at least:

- domain/objective/concept/misconception coverage;
- cognitive-process distribution;
- intended-difficulty distribution;
- scenario and item-type diversity;
- correctness/evidence grounding;
- distractor quality;
- Arabic/English equivalence;
- accessibility/fairness;
- exact/semantic duplication;
- source/provenance completeness;
- review completion;
- release/canary eligibility;
- public-runtime compatibility.

### K2 architecture constraints

K2 must:
- consume the existing Coverage Engine and factory state machine;
- use QuestionFamilyV2 + ItemVersion lineage;
- produce new versions instead of rewriting historical items;
- keep providers interchangeable;
- preserve deterministic/no-AI workflows;
- keep approved sources explicit;
- never mark generated candidates ACTIVE directly;
- keep `data/factory/` private;
- keep current 1,120 runtime behavior intact until a governed release is intentionally promoted;
- retain immutable assessment snapshots;
- avoid mastery/IRT/calibrated-difficulty claims before sufficient learner response evidence.

### K2 design questions to resolve

The K2 architectural design must explicitly decide:

1. **Expansion unit:** objective/misconception coverage gaps vs broader scenario bundles.
2. **Batch sizing:** fixed-size waves vs adaptive waves based on quality yield.
3. **Provider strategy:** deterministic + AI-assisted candidates, with model evaluation/routing policy.
4. **Evidence policy:** which source classes are approved for STRICT/GROUNDED production expansion.
5. **Review scaling:** human review percentage by risk/yield/provider maturity.
6. **Semantic dedup:** embedding adapter and thresholds without forcing a dedicated vector DB.
7. **Difficulty:** intended authoring difficulty only in K2; observed/calibrated difficulty deferred.
8. **Canary evidence:** what must be observed before a release moves from CANARY to ACTIVE.
9. **Release cadence:** how 3k/6k/10k/14k+ capacity checkpoints map to immutable release manifests.
10. **Rollback/quarantine:** batch and family-level recovery rules.
11. **Bilingual authoring:** generate together vs source-first translation/equivalence workflow.
12. **Quality sampling:** deterministic full checks + model critics + human sampling boundaries.
13. **Measurement, observability & improvement loop:** versioned event semantics, system/factory/product/learning signals, funnels/friction, experiment evidence, anomaly/alert policy, privacy boundaries and a future human-reviewed improvement-agent interface. Commodity analytics/replay/experimentation/tracing should be evaluated for reuse rather than rebuilt.

Each K2 design point must pass the dated research-refresh process in `docs/superpowers/reviews/2026-09-28-k2-plus-research-refresh-register.md` before it is treated as decision-ready.

No K2 product implementation begins until those decisions are approved in a written K2 design/spec and implementation plan.

## K3 — Learner Evidence Engine

Starts only after K2 is merged and post-merge verified.

Purpose:
operationalize append-only learner evidence, durable retention and versioned derived-projection infrastructure without turning mastery/readiness into raw truth.

## K4 — Next-Best-Action / Spaced Practice

Use raw evidence and versioned projections to select the smallest useful next learning action. Scheduler complexity remains hidden from ordinary learners.

## K5 — Mastery & Readiness Projections

Versioned, uncertainty-aware derived models. Derived projections remain recomputable.

## K6 — Psychometric Calibration

Item statistics, distractor behavior, response-time/retention analysis and IRT-style models only after predefined evidence thresholds exist.

## K7 — Grounded Pedagogical AI Tutor

Canonical-source-grounded, policy-controlled tutoring with scaffolding, hints, abstention and a deterministic/manual path.

## K8 — Advanced Adaptive Assessment / CAT

Adaptive testing only after calibrated item evidence exists.

## K9 — Multimodal & Ecosystem Integrations

Potential scope:
- QTI adapters;
- CASE adapters;
- learning-event interoperability;
- LTI where justified;
- multimodal content;
- external LMS/authoring integrations.

## Dependency rule

`A/B0/B1/B2/B3 → K1 → K2 → K3 → K4 → K5 → K6 → K7/K8 → K9`

K2 must complete before K3 product implementation starts.

## New-chat anti-reconstruction rule

Read, in order:

1. `HANDOFF.md`
2. current `main` SHA
3. `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
4. `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`
5. active K2 spec/plan/checkpoint only when those artifacts exist.

Do not reconstruct K1 from conversation memory.

## Two-programme execution preference

The user prefers two consecutive programmes when practical, but every architectural programme retains its own gates:

`Design → Written Spec Approval → Written Plan Approval → TDD → Verification → Review → Merge → Post-merge Verification`

K2 starts now at the Design gate.
