# Learning Platform — Authoritative Programme Tracker

**Date:** 2026-09-27  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Current verified product baseline:** `main@d6576a8d2f4f98d2310174f633622c0b96017eb3`  
**Tracker status:** authoritative current programme index

## Completed programmes

| Programme | Status | Durable evidence |
|---|---|---|
| Programme A | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md` |
| B0 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-26-b0-final-review.md` |
| B1 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b1-post-merge-verification.md` |
| B2 | MERGED + VERIFIED | B2 final review/checkpoint + verified later main |
| B3 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b3-post-merge-verification.md` |
| **K1 — Content Factory & Governance Core** | **MERGED + VERIFIED** | `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md` |

## K1 completion facts

K1 PR #15 merged at:

`d6576a8d2f4f98d2310174f633622c0b96017eb3`

Integration evidence:

- exact-head Quality #343: SUCCESS;
- exact-head Server/Adapter #931: SUCCESS;
- post-merge Server/Adapter #932: SUCCESS;
- post-merge Pages #23: SUCCESS.

Current governed content baseline:

- 1,120 learner-visible runtime questions;
- 1,120 governed QuestionFamily records;
- 1,120 governed ItemVersion records;
- 140 provisional migration-derived LearningObjective records;
- bootstrap release `sdaia-ai-engineer.bootstrap.v1` in REVIEW state;
- legacy payload digest preserved;
- 200-question exam behavior preserved;
- StateV2 and RuntimeBundleV3 preserved.

K1 whole-branch review was self-review only because no subagent capability was available. No open Critical/Important findings remained at merge.

## Current architecture

Public/runtime:
- TrackRegistryV1
- TrackManifestV1
- TrackPresentationV1
- DomainCatalogV2
- ExamProfileV2
- RenderedQuestionV2
- RuntimeBundleV3
- StateV2

K1 kernel/governance:
- LearningObjectiveV1
- EvidenceSourceV1
- QuestionFamilyV2
- ItemVersionV1
- QualityReportV1
- ProvenanceRecordV1
- ReviewDecisionV1
- SourcePolicyV1
- QualityPolicyV1
- ReviewPolicyV1
- FactoryRunV1
- ProviderResultV1
- ProviderEvaluationV1
- CoverageGapV1
- ContentReleaseManifestV1
- AssessmentFormSnapshotV1
- LearnerEventV1
- provider/persistence/orchestration/interoperability ports
- governed lifecycle/quality/release/coverage foundations

## Active programme

**K2 — Coverage Expansion & Controlled Release**

Current stage:

`EXECUTING`

Status:

- K2 implementation: NOT STARTED
- K2 written spec: APPROVED — `docs/superpowers/specs/2026-09-28-k2-coverage-expansion-controlled-release-design.md`
- K2 implementation plan: APPROVED — `docs/superpowers/plans/2026-09-28-k2-coverage-expansion-controlled-release.md`
- K2 implementation branch: `impl/k2-coverage-expansion-controlled-release`
- K2 execution checkpoint: C — coverage prioritization and adaptive tranche planning

Purpose:

Expand the question/content bank through structured coverage gaps and K1 factory quality/release gates, rather than raw-count generation.

Inherited canonical direction:

`Coverage Gap → Candidate Families → Factory Quality Pipeline → Risk-based Review → CANARY → Promote → Observe`

Possible scale milestones:

`1,120 → 3,000 → 6,000 → 10,000 → 14,000+`

Milestones are capacity references only. Quality/coverage gates decide promotion.

## K2 minimum constraints

K2 must:
- use K1 contracts and state machine;
- preserve stable family/item IDs and version lineage;
- avoid superficial paraphrase multiplication;
- maintain Arabic/English equivalence;
- preserve source/evidence/provenance;
- use release manifests and CANARY;
- measure coverage and duplicate gaps;
- keep factory governance/private artifacts out of public Pages;
- avoid psychometric/calibrated claims before sufficient learner evidence;
- preserve learner progress and current runtime behavior;
- keep deterministic/manual paths available.

## Future order

K3 — Learner Evidence Engine  
K4 — Next-Best-Action / Spaced Practice  
K5 — Mastery & Readiness Projections  
K6 — Psychometric Calibration  
K7 — Grounded Pedagogical AI Tutor  
K8 — Advanced Adaptive Assessment / CAT  
K9 — Multimodal & Ecosystem Integrations

Dependency order:

`A/B0/B1/B2/B3 → K1 → K2 → K3 → K4 → K5 → K6 → K7/K8 → K9`

Do not silently reorder K2 and K3.

## Durable recovery references

- Comprehensive history/research/current-state handoff:
  `docs/superpowers/reviews/2026-09-27-comprehensive-handoff.md`
- Working method / decomposition / TDD / checkpoint protocol:
  `docs/superpowers/OPERATING_PLAYBOOK.md`
- Fresh K1 reverification:
  `docs/superpowers/reviews/2026-09-27-k1-reverification.md`

## Authoritative recovery sequence

A future chat must:

1. read `HANDOFF.md`;
2. resolve current `main` SHA;
3. read this tracker;
4. read `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`;
5. inspect the post-K1 main state;
6. read active K2 spec/plan/checkpoint only if those artifacts later exist;
7. inspect branch/main diff before changing anything;
8. resume the first incomplete K2 gate only.

## Historical document rule

Programme A/B0/B1/B2/B3/K1 plans/checkpoints/ledgers remain durable evidence and must not be deleted, but completed programme records do not override this tracker or current HANDOFF.

The following are especially historical now:
- `docs/superpowers/plans/2026-09-27-k1-content-factory-governance-core.md`;
- `docs/superpowers/reviews/2026-09-27-k1-execution-ledger.md`;
- `docs/superpowers/reviews/2026-09-27-k1-checkpoint.md`;
- `docs/superpowers/reviews/2026-09-27-k1-final-review.md`.

## Conflict precedence

1. architecture constitution;
2. Research Amendment;
3. completed K1 contract/spec where K2 consumes its interfaces;
4. future active approved K2 written spec;
5. future active approved K2 implementation plan;
6. active K2 execution rulings/checkpoint;
7. historical plans/reviews.

Any implementation conflict must be recorded as a Ruling.

## User execution preference

- more stages;
- more tasks;
- smaller tasks/microsteps;
- RED → GREEN TDD;
- durable checkpoints;
- continuous execution after approvals;
- merge only after exact-head tests pass;
- post-merge verification before advancing;
- where practical, complete two consecutive programmes end-to-end while respecting each programme's design/spec/plan approval gates.
