# Post-B3 Platform Kernel Roadmap

**Date:** 2026-09-27  
**Status:** Authoritative forward roadmap; not an implementation plan  
**Base:** `main@0b2547a48fe0300a7a3c3348229e7119a5a8ce20`

## Governing documents

Implementation must follow, in order:

1. `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
2. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
3. `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`
4. The future approved implementation plan for the active programme.

Historical B1/B2/B3 forward plans remain historical evidence only.

## Completed foundation

- Programme A — repository/runtime contract stabilization.
- B0 — governance/research synchronization.
- B1 — Track Presentation Contract.
- B2 — Track Registry.
- B3 — Content Model v2 / stable domain IDs.

Current production contracts:
TrackRegistryV1, TrackManifestV1, TrackPresentationV1, DomainCatalogV2, ExamProfileV2, RenderedQuestionV2, RuntimeBundleV3, StateV2.

## Programme K1 — Content Factory & Governance Core

Purpose: build the reusable headless production kernel that governs question/content creation, versioning, provenance, quality, review, release, rollback, coverage and raw learner-event foundations.

High-level milestones:

- K1-F0 — baseline + current-content migration freeze.
- K1-F1 — core authoring/version/provenance contracts.
- K1-F2 — state machine + SourcePolicy/QualityPolicy/ReviewPolicy.
- K1-F3 — provider/persistence/orchestration ports + local adapters.
- K1-F4 — quality pipeline.
- K1-F5 — coverage engine.
- K1-F6 — content release/canary/rollback + assessment snapshots.
- K1-F7 — LearnerEventV1 foundation.
- K1-F8 — migrate the current 1,120 items into governed lineage.
- K1-F9 — whole-suite acceptance/review/merge/post-merge verification.

Exit gate:
K1 is not complete until current learner behavior remains green, no invalid lifecycle shortcut exists, current content can migrate without payload/ID drift, release rollback works, provenance is auditable, and exact-head + post-merge verification pass.

## Programme K2 — Coverage Expansion & Controlled Release

Starts only after K1 is merged and post-merge verified.

Purpose: expand the bank through measured coverage gaps and factory quality gates rather than raw-count generation.

Canonical flow:

`Coverage Gap → Candidate Families → Factory Quality Pipeline → Risk-based Review → Canary → Promote → Observe`

Expected controlled milestones may include roughly 3k → 6k → 10k → 14k+, but promotion is controlled by coverage and quality, not count alone.

K2 must:
- use K1 contracts and state machine;
- preserve stable family/item identities;
- avoid superficial paraphrase multiplication;
- maintain Arabic/English equivalence;
- preserve evidence/provenance;
- use release manifests;
- measure duplicate/coverage/quality gaps;
- leave psychometric claims uncalibrated until real learner evidence is sufficient.

## Programme K3 — Learner Evidence Engine

Purpose: operationalize append-only learner evidence, event validation, retention and derived-projection infrastructure.

Does not make mastery/readiness claims automatically.

## Programme K4 — Next-Best-Action / Spaced Practice

Purpose: use raw evidence and versioned projection inputs to choose the smallest useful next learning action while hiding scheduler complexity from ordinary learners.

## Programme K5 — Mastery & Readiness Projections

Purpose: versioned, uncertainty-aware derived models answering where the learner is, what comes next and why.

## Programme K6 — Psychometric Calibration

Purpose: item statistics, distractor behavior, response-time/retention analysis and IRT-style models only after predefined evidence thresholds are met.

## Programme K7 — Grounded Pedagogical AI Tutor

Purpose: canonical-source-grounded, policy-controlled tutoring with hints/scaffolding/abstention and a deterministic non-AI path.

## Programme K8 — Advanced Adaptive Assessment / CAT

Purpose: adaptive test assembly only after calibrated item evidence exists.

## Programme K9 — Multimodal & Ecosystem Integrations

Potential scope:
- QTI adapters;
- CASE adapters;
- event interoperability;
- LTI where justified;
- multimodal content;
- external LMS/authoring integration.

## Dependency rule

`A/B0/B1/B2/B3 → K1 → K2 → K3 → K4 → K5 → K6 → K7/K8 → K9`

Some later programmes may overlap only after explicit new design approval. Do not silently reorder the first three dependencies:

`K1 → K2 → K3`

## Anti-reconstruction rule

A future chat must not reconstruct completed programmes from conversation memory.

Read:
1. `HANDOFF.md`
2. `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
3. the active programme spec
4. the active implementation plan/checkpoint once one exists.

## Two-programme execution preference

The user prefers completing two consecutive programmes where practical, but each programme still keeps its own Superpowers gates:

`Design → Written Spec Approval → Written Plan Approval → TDD → Verification → Review → Merge → Post-merge Verification`

Only after the first programme is merged and verified may the second programme use its real baseline.
