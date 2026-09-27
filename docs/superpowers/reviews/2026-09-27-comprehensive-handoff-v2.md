# COMPREHENSIVE HANDOFF V2 — Learning Platform vNext through K1

**Date:** 2026-09-27
**Repository:** `oaabahussain/sdaia-ai-engineer`
**K1 product merge:** `d6576a8d2f4f98d2310174f633622c0b96017eb3`
**Latest verified documentation main before this V2 handoff:** `65f3ec62e54da90dabf09f3c3d94698e11df253f`
**Current programme:** K2 — Coverage Expansion & Controlled Release
**Current gate:** K2 DESIGN
**K2 product code:** NOT STARTED

This file is the durable full recovery artifact. A new chat/agent/developer should use repository state rather than reconstructing history from conversation memory.

## 1. Fresh K1 verification

Two independent fresh verification points exist after K1 merge:

### K1 audit PR verification
- Pull request quality gate #345: SUCCESS.
- Server/adapter #942: SUCCESS.
- Node: 206/206 PASS.
- Python/server: 20/20 PASS.
- generated runtime bank: 1,120.
- governed lineage: 1,120 QuestionFamily + 1,120 ItemVersion.
- provisional migration-derived objectives: 140.
- weighted 200 allocation preserved: 36/35/33/29/28/25/14.
- legacy payload digest preserved:
  `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.
- validator, import verifier, SW, Pages artifact/local live verifier, browser smoke, SQLite, browser/API adapters: PASS.

### Post-audit main verification
On `main@65f3ec62e54da90dabf09f3c3d94698e11df253f`:
- Server and adapter contract tests #953: SUCCESS.
- Validate and deploy GitHub Pages #25: SUCCESS.
- Pages workflow validation, Node tests, browser smoke, artifact build/upload/deploy and live-release verification: SUCCESS.

K1 therefore remains verified on the current post-K1 product state.

## 2. What is complete

```text
Programme A — runtime/contract stabilization
B0 — governance + research synchronization
B1 — Track Presentation Contract
B2 — Track Registry
B3 — Content Model v2 / stable IDs
K1 — Content Factory & Governance Core
```

K1 is merged and post-merge verified.

Current learner-visible runtime remains:
- 1,120 generated questions;
- seven stable domains;
- 200-question full exam;
- Arabic/English + RTL/LTR;
- browser/API parity;
- offline/service worker;
- GitHub Pages;
- StateV2;
- RuntimeBundleV3.

K1 adds governed parallel lineage:
- LearningObjectiveV1;
- EvidenceSourceV1;
- QuestionFamilyV2;
- ItemVersionV1;
- QualityReportV1;
- ProvenanceRecordV1;
- ReviewDecisionV1;
- SourcePolicyV1;
- QualityPolicyV1;
- ReviewPolicyV1;
- FactoryRunV1;
- ProviderResultV1;
- ProviderEvaluationV1;
- CoverageGapV1;
- ContentReleaseManifestV1;
- AssessmentFormSnapshotV1;
- LearnerEventV1;
- provider/persistence/orchestration/interoperability ports;
- LocalRunner;
- file/JSONL/SQLite adapters;
- governed quality pipeline;
- Coverage Engine;
- CANARY/rollback boundary;
- append-only learner evidence.

## 3. Constitution and authority

Primary constitution:
`docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`

Research amendment:
`docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

Authority order:

```text
Constitution
→ dated research amendments
→ active approved design/spec
→ approved implementation plan
→ execution ledger + rulings
→ current checkpoint
→ tests/CI/commit evidence
→ HANDOFF/tracker navigation
```

Core principles:
- Preserve → Canonicalise → Migrate → Extend → Measure → Improve.
- The track is data; the learning platform is code.
- no quantity theatre;
- learning ≠ assessment;
- no silent breaking changes;
- no unnecessary framework churn;
- Arabic and English are first-class;
- every architectural change must reduce ambiguity;
- stable IDs + explicit migrations;
- no psychometric claims before calibration evidence;
- no confidential/leaked exam material;
- public browser-shipped content is public.

### When the constitution changes

The constitution is deliberately difficult to change.

Amend it only when:
- a durable platform-wide principle becomes wrong;
- new evidence changes a non-negotiable rule;
- a new invariant must govern multiple future programmes;
- accepted high-level rules conflict;
- the platform has evolved enough that the old rule would misdirect future work.

Do not amend it for:
- one implementation task;
- one provider/model/library preference;
- one temporary environment limitation;
- an isolated bug;
- a programme-local detail.

Required flow:

`evidence/problem → contradiction audit → dated amendment → explicit approval → merge → tracker/HANDOFF update → future specs/plans consume it`.

Prefer dated amendments over rewriting historical constitution text.

Every amendment records:
- affected clause;
- evidence/reason;
- what remains unchanged;
- migration/compatibility impact;
- affected programmes/contracts;
- reconsideration/rollback condition where meaningful.

## 4. Research that changed the design

Durable evidence:
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`
- `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`
- `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

Evidence families included:
- SDAIA/NOSF public materials;
- Microsoft/AWS/MeasureUp certification-prep patterns;
- Khan Academy mastery/tutoring patterns;
- WCAG 2.2;
- OWASP API security;
- 1EdTech QTI/Caliper/CASE direction;
- spaced/distributed practice literature;
- retrieval/feedback research;
- AI item-generation research;
- GenAI hallucination/evaluation literature;
- adaptive-learning research;
- FSRS/Anki operational lessons;
- user/community complaints from Quizlet/Khan/Udemy/Duolingo.

Design conclusions retained:
- reliability/offline/accessibility are release concerns;
- spacing is useful but belongs after learner evidence exists;
- retrieval is not universally superior;
- corrective/explanatory feedback matters but timing is mode-specific;
- AI-generated content may be useful, but one-shot generation is never authority;
- providers need evaluation separate from generation;
- tutor should be pedagogical/scaffolded, not generic chat;
- analytics must answer where am I / what next / why;
- adaptivity waits for durable evidence;
- silent AI mutation of user/source content is unacceptable;
- UI simplicity matters; advanced controls should be progressively disclosed;
- gamification is optional and subordinate to learning outcomes.

Counter-evidence retained:
- retrieval is not always best;
- gamification is not inherently bad;
- AI-generated items are not inherently poor;
- analytics sophistication does not prove learning impact.

## 5. Programme history

### Programme A
Stabilized contracts/runtime before scaling:
- manifest/profile;
- stable IDs;
- StateV2;
- RuntimeBundle parity;
- profile-driven exam behavior;
- safe PWA/offline;
- legacy-path quarantine;
- manifest-driven CI/Pages;
- governance/docs baseline.

### B0
Aligned research with governance:
- research amendment;
- contradiction/scope audits;
- evidence ledger;
- failure taxonomy;
- sequencing rules.

### B1
Moved track presentation into track data:
- bilingual/domain labels;
- presentation schema;
- generalized feedback/presentation paths.

### B2
Added TrackRegistryV1:
- track discovery/selection;
- current single production track preserved without registry hard-coding.

### B3
Introduced stable content identity:
- DomainCatalogV2;
- ExamProfileV2;
- RuntimeBundleV3;
- stable domain IDs;
- legacy mapping;
- payload compatibility preserved.

Stable domain IDs:
- mlops-llmops
- data-ml
- core-ai
- responsible-ai-security-governance
- ai-software-engineering
- architecture-infrastructure
- business-professional-practice

### K1
Expanded the narrow Question Factory idea into a governed content lifecycle kernel.

Stages:
- A0/A1 baseline + contracts;
- B lifecycle/policies/immutability;
- C provenance/providers/evaluation/no-AI;
- D persistence/orchestration/resume/retry/batch/CLI/SQLite;
- E governed quality pipeline;
- F Coverage Engine;
- G releases/CANARY/rollback/snapshots;
- H learner evidence/interoperability;
- I migration of current 1,120;
- J acceptance/review/integration.

Governed pipeline:

`Generate → Critique → Validate → Deduplicate → Evidence → Distractor Quality → Bilingual → Accessibility/Fairness → Review → Activation`.

## 6. K1 safety rules

- AI/provider output is candidate data, not authority.
- `GENERATED → ACTIVE` is invalid.
- SourcePolicy supports STRICT/GROUNDED/EXPANSIVE; default is GROUNDED.
- No aggregate quality score can hide a failed critical dimension.
- released ItemVersion is immutable;
- edits create new versions;
- CANARY precedes ACTIVE;
- rollback selects prior compatible release rather than rewriting history;
- AssessmentFormSnapshot freezes delivered versions/order/options/scoring;
- LearnerEventV1 stores raw evidence only;
- mastery/readiness/calibrated difficulty remain future derived projections.

## 7. K1 review findings fixed

1. Direct ACTIVE release construction could bypass CANARY.
   - Fixed with RED→GREEN regression.

2. Learner-event persistence could bypass validation/UTC normalization.
   - Fixed at persistence boundaries; derived/unknown fields rejected.

3. Real CLI run/resume/retry lacked a wired persistent LocalRunner.
   - Fixed via spawned-process regression test.

Deferred Minor:
- migrated historical families use provisional `cognitive_level=understand`; future correction must version, not rewrite history.

## 8. Work decomposition method

Authoritative working method:
`docs/superpowers/OPERATING_PLAYBOOK.md`

Hierarchy:

```text
Programme
→ Checkpoint/Stage
→ Task
→ Microstep
→ Verification evidence
```

Prefer many small tasks over a few broad tasks.

K1 example:
- 11 checkpoint groups;
- 87 tasks;
- 425 checkable microsteps.

Why:
- better fault isolation;
- better review precision;
- clear test ownership;
- easier recovery after interruption;
- better visibility/control;
- less idea loss between tasks.

A good task owns one behavior/contract, names exact files/interface, has a RED test, smallest GREEN implementation, regression check, commit and ledger entry.

A good microstep is concrete:
- write failing test;
- prove intended RED;
- add smallest implementation;
- rerun targeted test;
- run affected suite;
- record result;
- commit;
- update ledger.

## 9. Skill sequence

Architecture/research:
- superpowers:brainstorming
- evidence-engineering-research when external/current evidence matters.

Planning:
- superpowers:writing-plans

Execution:
- superpowers:executing-plans
- superpowers:test-driven-development

Failure:
- superpowers:systematic-debugging

Parallel work:
- superpowers:dispatching-parallel-agents only for truly independent work and when supported.

Review:
- superpowers:requesting-code-review
- superpowers:receiving-code-review
- if no reviewer/subagent exists, explicitly record:
  `Final review: self-review (no subagent tool)`.

Completion/integration:
- superpowers:verification-before-completion
- superpowers:finishing-a-development-branch

Workspace:
- superpowers:using-git-worktrees when reliable;
- otherwise isolated GitHub branch + CI, with an explicit Ruling.

## 10. TDD and debugging

Every implementation/fix:

`RED → prove intended failure → smallest implementation → GREEN → affected regression suite → commit → ledger`.

A RED failure counts only if test setup is valid and the failure is the intended missing behavior.

Unexpected failure protocol:
1. exact failing step/log;
2. first incorrect assumption;
3. distinguish product bug vs test/setup bug;
4. prove root cause;
5. smallest correction;
6. rerun original failure;
7. rerun affected suite;
8. record Ruling if plan/spec interpretation changed.

Lessons:
- missing `import pytest` was a test bug, not SQLite bug;
- stale v1 server/live-verifier expectations must be updated with contract migrations;
- never alter product behavior merely to satisfy a broken test.

## 11. Durable files and exact update cadence

### Baseline
Create once at programme execution start:
`docs/superpowers/reviews/<date>-<programme>-baseline.md`

Record base SHA, current behavior/counts/digests/contracts/debt/CI and compatibility boundaries.

### Execution ledger
`docs/superpowers/reviews/<date>-<programme>-execution-ledger.md`

Update **after every completed task or meaningful execution decision**.

Append:
- task;
- RED evidence;
- GREEN evidence;
- commit SHA;
- interfaces/files changed;
- failure/root cause;
- every Ruling;
- next exact task.

Ruling format:
`Ruling: <decision> — <why> — <cost if wrong>`.

Ledger is chronological; do not rewrite history to hide mistakes.

### Checkpoint
`docs/superpowers/reviews/<date>-<programme>-checkpoint.md`

Update:
- after every checkpoint/stage;
- before expected session boundary/interruption.

Contains:
- branch + HEAD;
- base;
- completed checkpoints/tasks;
- latest exact tests;
- failures;
- rulings;
- files/areas changed;
- next exact task;
- resume safety;
- merge state.

### HANDOFF.md
Top-level recovery/navigation document.

Do **not** update after every microstep.

Update when:
- design/spec/plan gate changes;
- major checkpoint finishes and session may transfer;
- before long interruption;
- recovery instructions change;
- before/after integration when appropriate;
- immediately after post-merge verification;
- active programme changes.

HANDOFF points to current tracker/spec/plan/ledger/checkpoint instead of duplicating every log.

### Programme tracker
Update only when programme/gate status changes:
DESIGN → SPEC REVIEW → PLAN REVIEW → EXECUTING → REVIEW → MERGED → POST-MERGE VERIFIED → NEXT PROGRAMME.

### Final review
Before merge create:
`docs/superpowers/reviews/<date>-<programme>-final-review.md`

Review requirements, branch diff, major failure modes, backward compatibility, leakage/security and deferred minors.

Critical/Important findings require TDD fixes before integration.

### Post-merge verification
After merge create:
`docs/superpowers/reviews/<date>-<programme>-post-merge-verification.md`

Record exact pre-merge head, merge SHA, exact-head CI, post-merge main CI, deployment/live checks and next programme boundary.

## 12. Recovery after interruption/new chat

Always recover from repository state, not memory:

1. HANDOFF.md
2. live main SHA
3. comprehensive handoff V2
4. OPERATING_PLAYBOOK.md
5. programme tracker
6. current programme baseline/post-merge
7. active spec
8. approved plan
9. ledger
10. checkpoint
11. branch vs main diff

Resume the **first incomplete gate/task proven by evidence**.

Never restart a completed task because a chat summary is stale.

## 13. Long-programme acceptance pattern

A broad final acceptance test may intentionally fail early.

Pattern:
1. create it;
2. prove RED;
3. gate it during intermediate CI only if necessary;
4. keep checkpoint tests active;
5. re-enable it unconditionally before integration;
6. never merge while final acceptance is skipped/gated.

K1 used this deliberately and recorded the ruling.

## 14. Exact-head integration rule

Before merge:
1. resolve exact PR head;
2. verify required workflows on that exact SHA;
3. final review/checkpoint;
4. if docs/review commits move HEAD, verify CI again;
5. finishing-a-development-branch;
6. merge expected exact head only;
7. verify main;
8. verify deployment/live release;
9. update tracker/HANDOFF/post-merge;
10. only then mark programme complete.

## 15. Two-programme preference

Where practical:

```text
Programme N
Design → Spec → Plan → Execute → Review → Merge → Post-merge verify
↓
real new main baseline
↓
Programme N+1
Design → Spec → Plan → Execute → Review → Merge → Post-merge verify
```

Never implement Programme N+1 against an imagined future baseline.

## 16. Current K2 boundary

K2 — Coverage Expansion & Controlled Release.

No K2 product implementation has started.

Canonical flow:
`Coverage Gap → Candidate Families → Factory Quality Pipeline → Risk-based Review → CANARY → Promote → Observe`.

Capacity references:
`1,120 → ~3,000 → ~6,000 → ~10,000 → 14,000+`.

Counts are not acceptance metrics.

Promotion is governed by:
- coverage;
- correctness/evidence;
- distractor quality;
- Arabic/English equivalence;
- accessibility/fairness;
- duplication;
- provenance;
- review;
- release/CANARY;
- runtime compatibility.

K2 design must resolve:
1. expansion unit;
2. batch sizing;
3. provider routing/evaluation;
4. evidence/source policy;
5. human review scaling;
6. semantic dedup strategy;
7. intended vs observed difficulty;
8. CANARY→ACTIVE evidence;
9. release cadence;
10. rollback/quarantine;
11. bilingual authoring strategy;
12. quality sampling/critic/human boundaries.

## 17. Future roadmap

`K2 → K3 Learner Evidence Engine → K4 Next-Best-Action/Spaced Practice → K5 Mastery/Readiness → K6 Psychometrics → K7 Grounded Tutor → K8 CAT → K9 Multimodal/Integrations`.

Do not reorder K2 and K3.

Do not implement psychometrics before learner evidence exists.

## 18. Exact next action

Start K2 architectural design from the real verified post-K1 baseline.

Sequence:
1. superpowers:brainstorming;
2. read K1 interfaces/constraints;
3. resolve K2 design questions;
4. bounded evidence refresh if needed;
5. present K2 design;
6. after conceptual approval write K2 spec;
7. explicit spec approval;
8. superpowers:writing-plans;
9. create many stages/tasks/microsteps;
10. explicit plan approval;
11. execute continuously with TDD/ledger/checkpoints;
12. review/verify/merge/post-merge;
13. only then design K3 from actual new main.

## 19. Durable file map

Governance:
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
- `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

Evidence:
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`
- `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`

K1:
- `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`
- `docs/superpowers/plans/2026-09-27-k1-content-factory-governance-core.md`
- `docs/superpowers/reviews/2026-09-27-k1-execution-ledger.md`
- `docs/superpowers/reviews/2026-09-27-k1-checkpoint.md`
- `docs/superpowers/reviews/2026-09-27-k1-final-review.md`
- `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`
- `docs/superpowers/reviews/2026-09-27-k1-reverification.md`

Navigation:
- `HANDOFF.md`
- `docs/superpowers/OPERATING_PLAYBOOK.md`
- `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
- `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md`

## 20. Recovery statement

The platform has moved from a bilingual question site toward a governed learning platform with stable runtime/state/release contracts, multi-track-ready presentation/registry/content identity, governed content lineage, versioned policies, provider-independent generation/review seams, provenance, resumable orchestration, quality gates, coverage gaps, immutable releases/snapshots, append-only learner evidence foundations and interoperability seams.

The next goal is not to manufacture 14,000 questions quickly.

The next goal is to use K1 to produce measurably broader, non-duplicative, evidence-grounded, bilingual, reviewed content releases without sacrificing compatibility or governance.
