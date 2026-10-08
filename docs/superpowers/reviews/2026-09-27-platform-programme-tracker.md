# Live programme navigation — K3 current implementation status

**Dated checkpoint:** 2026-10-08 (not a live state store). The approved K3 specification and plan exist; Tasks 1–36 are merged and post-merge verified on `main@5b7453407def933037c4c254cd0fca5e5f3f1591`. Task 37 was pending at the launch baseline; Task 38 / Task 39 / Task 40 / Task 41 remain PENDING until their durable proof exists. The sole live authority is `docs/superpowers/state/CURRENT-STATE.json` plus Git and the ledger; check this first on every resume.

- Task 37: documentation-contract tests, current Data Model / Architecture / API / Handoff / tracker, and durable implementation checkpoint.
- Task 38: fresh whole-plan code review and zero open Critical/Important findings.
- Task 39: exact-head full Node/Python/browser/Pages release checks and protected question payload SHA-256 `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.
- Tasks 40–41: reviewed combined merge, then merged-main runtime/Pages/offline/evidence checks; **K4 not started**.

Latest completed evidence: `docs/superpowers/reviews/2026-10-07-k3-tasks34-36-post-merge-verification.md`; approved source spec/plan as located by CURRENT-STATE. The statements about `K3 DESIGN NOT STARTED` below were true at the historical 2026-09-27 checkpoint but are no longer current.

---

## Historical snapshot — original 2026-09-27 programme tracker (not execution authority)

# Learning Platform — Historical Programme Tracker / Index

**Date:** 2026-09-28  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Live execution state:** `docs/superpowers/state/CURRENT-STATE.json` — use this manifest for current programme/task/ref state.  
**Current verified product baseline:** `main@dced183980199ca8b7e359b48ddc7fd61f29488f`  
**Tracker status:** historical/index-only; not authoritative for live execution state

> This document preserves historical programme context. It must not override `CURRENT-STATE.json`, the approved active spec/plan, or the durable execution ledger.

## Completed programmes

| Programme | Status | Durable evidence |
|---|---|---|
| Programme A | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-23-programme-a-final-review.md` |
| B0 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-26-b0-final-review.md` |
| B1 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b1-post-merge-verification.md` |
| B2 | MERGED + VERIFIED | B2 final review/checkpoint + verified later main |
| B3 | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-b3-post-merge-verification.md` |
| K1 — Content Factory & Governance Core | MERGED + VERIFIED | `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md` |
| **K2 — Coverage Expansion & Controlled Release** | **MERGED + POST-MERGE VERIFIED** | `docs/superpowers/reviews/2026-09-28-k2-post-merge-verification.md` |

## Current learner-visible baseline

K2 deliberately preserved the existing runtime until a future governed content release is intentionally promoted:

- learner-visible questions: **1,120**;
- domains: **7 × 160**;
- full exam: **200**;
- weighted allocation: **36 / 35 / 33 / 29 / 28 / 25 / 14**;
- Arabic/English + RTL/LTR: verified;
- browser/API parity: verified;
- offline/service worker: verified;
- payload digest:
  `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`;
- bootstrap release: `sdaia-ai-engineer.bootstrap.v1`;
- governed QuestionFamily records: 1,120;
- governed ItemVersion records: 1,120;
- provisional migration-derived LearningObjective records: 140.

K2 scale references (~3k / ~6k / ~10k / 14k+) remain capacity checkpoints, not claims that those items are live.

## K2 completion facts

PR #20 merged the exact reviewed implementation head:

- reviewed head: `919ed987c9d78d61fc1811d70fd00566735b0354`;
- merge / product baseline: `dced183980199ca8b7e359b48ddc7fd61f29488f`.

Pre-merge exact-head:
- Pull request quality gate #536 — SUCCESS;
- Server and adapter contract tests #1374 — SUCCESS.

Post-merge:
- Server and adapter contract tests #1375 — SUCCESS;
- GitHub Pages #27 — SUCCESS including deploy + live release verification;
- Node: 351/351 PASS;
- Python: 22 PASS;
- SQLite/browser/API contracts: PASS;
- browser smoke: PASS;
- live content model/registry/service worker: PASS.

Whole-plan review:
- 1 Critical + 7 Important findings/refinements were found and fixed;
- 0 open Critical/Important findings remained at merge;
- review record: `docs/superpowers/reviews/2026-09-28-k2-final-review.md`.

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

K1/K2 governance/kernel now includes:
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
- ProviderEvaluationV1 + K2 evaluation profile
- CoverageGapV1
- ExpansionPlanV1
- TranchePlanV1
- CalibrationPolicy metadata
- ProviderRoutingPolicyV1
- ReviewCalibrationPolicyV1
- DedupCalibrationPolicyV1
- BilingualEquivalenceReportV1
- CanaryPolicyV1
- ActivationEvidenceV1
- EventDefinitionV1
- ImprovementFindingV1
- ExperimentRecordV1
- ContentReleaseManifestV1
- AssessmentFormSnapshotV1
- LearnerEventV1
- vendor-neutral provider/persistence/orchestration/analytics/telemetry/feature-flag ports
- source-readiness fail-closed coverage scheduling
- adaptive tranche execution/resume/retry/PARTIAL semantics
- automation-first risk/drift review
- immutable CANARY/activation/rollback/quarantine
- event privacy/data-minimization trust boundary
- file + SQLite K2 governance persistence parity
- private/public Pages artifact boundary

## Active programme

**K3 — Learner Evidence Engine**

Current stage:

`DESIGN`

Status:
- K3 architectural design: NOT STARTED;
- K3 written spec: NOT CREATED;
- K3 implementation plan: NOT CREATED;
- K3 implementation: NOT STARTED;
- K3 implementation branch: NONE.

K3 may now enter design because K2 is merged and post-merge verified.

Do **not** begin K3 product implementation until:
1. architectural design is approved;
2. written design/spec is created and explicitly approved;
3. implementation plan is created and explicitly approved;
4. execution method is approved.

## K2 deferred calibration

The following remain evidence-driven inputs rather than hidden constants:
- tranche numeric sizes;
- review sampling percentages;
- duplicate similarity thresholds;
- bilingual supporting thresholds;
- CANARY exposure/duration/minimum observation values;
- alert/anomaly thresholds;
- analytics retention periods;
- final analytics/observability vendor;
- future source-class approvals.

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

Do not silently reorder these programmes.

## Durable recovery references

Read in this order:
1. `HANDOFF.md`;
2. resolve live `main`;
3. this tracker;
4. `docs/superpowers/reviews/2026-09-28-k2-post-merge-verification.md`;
5. `docs/superpowers/reviews/2026-09-28-k2-final-review.md`;
6. K2 spec/plan/ledger only when historical detail is needed;
7. architecture constitution + Research Amendment before K3 design.

## Historical document rule

Programme A/B0/B1/B2/B3/K1/K2 plans/checkpoints/ledgers remain durable evidence and must not be deleted. Completed-programme records do not override this tracker or the current top section of `HANDOFF.md`.

## Conflict precedence for K3 design

1. architecture constitution;
2. Research Amendment;
3. merged K1/K2 public and governance contracts;
4. K2 post-merge verification;
5. future approved K3 written spec;
6. future approved K3 implementation plan;
7. active K3 design rulings;
8. historical plans/reviews.

Any conflict must be recorded as a Ruling.

## User execution preference

- more stages;
- more tasks;
- smaller tasks/microsteps;
- RED → GREEN TDD;
- durable checkpoints;
- continuous execution after approvals;
- merge only after exact-head tests pass;
- post-merge verification before advancing;
- preserve repository cleanliness and zero-tribal-knowledge handoffs.
