# COMPREHENSIVE HANDOFF — Learning Platform vNext through K1

**Date:** 2026-09-27  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Current product main before this documentation PR:** `134313a49514e02209954002c9af8de0a704535b`  
**K1 implementation merge SHA:** `d6576a8d2f4f98d2310174f633622c0b96017eb3`  
**Current programme:** K2 — Coverage Expansion & Controlled Release  
**Current gate:** K2 DESIGN  
**K2 product code:** NOT STARTED

This is the durable full handoff for a new chat/agent/developer. Use the repository artifacts listed here rather than reconstructing history from conversation memory.

---

# 1. Executive state

Completed and verified:

```text
Programme A — contract/runtime stabilization
B0 — governance + research synchronization
B1 — Track Presentation Contract
B2 — Track Registry
B3 — Content Model v2 / stable domain IDs
K1 — Content Factory & Governance Core
```

K1 is merged and post-merge verified.

Current learner-visible runtime remains:

- 1,120 generated questions;
- seven stable domains, 160 rendered items per domain;
- 200-question full exam;
- weighted allocation: 36 / 35 / 33 / 29 / 28 / 25 / 14;
- Arabic/English + RTL/LTR;
- browser/API parity;
- offline/service worker;
- GitHub Pages;
- StateV2 learner state;
- RuntimeBundleV3.

K1 adds governed parallel lineage:

- 1,120 QuestionFamilyV2 records;
- 1,120 ItemVersionV1 records;
- 140 provisional migration-derived LearningObjectiveV1 records;
- structured migration provenance;
- zero invented historical QualityReport PASS records;
- bootstrap governed release `sdaia-ai-engineer.bootstrap.v1` in REVIEW state;
- preserved learner-visible payload digest:
  `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.

---

# 2. Fresh K1 reverification — 2026-09-27

A fresh documentation-only audit branch was created from current post-K1 main to force the full PR gates to run again.

Fresh CI evidence:

- Pull request quality gate **#345: SUCCESS**
- Server and adapter contract tests **#942: SUCCESS**

Fresh quality-gate evidence:

- canonical validator: PASS;
- generated questions: **1,120 PASS**;
- domains: seven × 160 PASS;
- answer-position distribution: PASS;
- weights: 100.0% PASS;
- weighted 200 allocation: PASS;
- factory governance: **1,120 items / 140 objectives / bootstrap release PASS**;
- Node tests: **206/206 PASS, 0 fail**;
- governed current-bank migration verifier: PASS;
- migration digest:
  `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`;
- service-worker shell assets: PASS;
- public Pages artifact/local live verifier: PASS;
- live content model v3: PASS;
- live track registry: PASS;
- browser smoke: PASS;
- browser smoke includes bank=1120, bilingual, theme, full_exam=200, confidence optional, offline cached reload, feedback URLs, presentation.

Fresh server/adapter evidence:

- Python/server tests: **20 passed**;
- SQLite schema apply: PASS;
- SQLite insert/select smoke: PASS;
- browser adapter contract: PASS;
- API adapter contract: PASS.

Therefore K1 remains verified on the current post-K1 product state.

---

# 3. Authoritative governance order

Use these documents in this order:

1. `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
2. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
3. completed programme specs/contract decisions consumed by the active programme
4. active approved written spec
5. active approved implementation plan
6. active execution ledger + rulings
7. current checkpoint
8. tests/CI/commit evidence
9. programme tracker + HANDOFF navigation

If lower-level text conflicts with a higher-level document, the higher-level authority wins until explicitly amended.

A plan does not silently amend the constitution.

A chat message does not silently amend repository governance.

---

# 4. Constitution — what it means in practice

The architecture constitution established two key principles:

> **Preserve → Canonicalise → Migrate → Extend → Measure → Improve**

and:

> **The track is data; the learning platform is code.**

Non-negotiable rules carried forward:

- no quantity theatre;
- learning is not the same as assessment;
- no silent breaking changes;
- no unnecessary framework churn;
- Arabic and English are first-class;
- every architectural change must reduce ambiguity;
- track branding must not imply official endorsement;
- protected/high-stakes content cannot be treated as secret if shipped to the browser;
- no IRT/CAT/psychometric claim before calibration evidence;
- no confidential/leaked exam content;
- stable IDs and explicit migrations are required for durable state/history.

Current SDAIA exam profile remains project-reference/unverified unless current primary evidence changes that status.

---

# 5. Research programme — what was studied

Research was not used as decoration. It changed architecture and sequencing.

Durable evidence files:

- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`
- `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`
- `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

## 5.1 Initial product/standards evidence families

The early architecture compared practices/standards from:

- SDAIA/NOSF public material:
  https://sdaia.gov.sa/en/Research/Pages/NOSF.aspx
- Microsoft certification practice assessment:
  https://learn.microsoft.com/en-us/credentials/certifications/practice-assessments-for-microsoft-certifications
- Microsoft exam preparation:
  https://learn.microsoft.com/en-us/credentials/certifications/prepare-exam
- AWS certification preparation:
  https://aws.amazon.com/certification/certification-prep/
- MeasureUp practice-test configuration:
  https://docs.measureup.com/how-to-configure-the-launch-of-a-practice-test
- Khan Academy mastery:
  https://support.khanacademy.org/hc/en-us/articles/360037127892-What-are-Mastery-Challenges-in-course-mastery
- WCAG:
  https://www.w3.org/TR/wcag/
- WCAG 2.2 changes:
  https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- OWASP API security:
  https://api-security.owasp.org/editions/2023/en/0x11-t10/
- 1EdTech QTI:
  https://www.1edtech.org/standards/qti/index
- 1EdTech Caliper:
  https://www.1edtech.org/standards/caliper
- Caliper 1.2:
  https://www.imsglobal.org/spec/caliper/v1p2/

Design impact:
- assessment profiles became explicit;
- offline/accessibility became release concerns;
- standards became adapter boundaries, not internal truth;
- learning evidence and interoperability were treated as first-class future seams.

## 5.2 B0 research ledger — major conclusions

### C1 — reliability/UX/offline matter materially
Cross-platform review evidence:
https://doi.org/10.1111/bjet.70066

Response:
- reliability/offline/accessibility remain release gates.

### C2 — spaced/distributed practice usually helps long-term learning
https://pmc.ncbi.nlm.nih.gov/articles/PMC12189222/
https://eric.ed.gov/?id=EJ1478558

Response:
- spacing belongs in later learner-evidence/scheduler programmes, not as a hard-coded early assumption.

### C3 — retrieval is not universally superior
https://eric.ed.gov/?id=EJ1478558
https://eric.ed.gov/?id=EJ1492680

Response:
- retrieval remains evidence-informed, not ideological/dogmatic.

### C4 — corrective/explanatory feedback supports learning/generalization
https://doi.org/10.1007/s10648-025-10103-6

Response:
- feedback timing remains mode-aware: learn/practice/check/mock are not identical.

### C5 — AI-generated assessment items can become strong when critique/revision/field psychometrics exist
https://doi.org/10.1609/aaai.v40i45.41205

Response:
- AI generation is allowed, but one-shot generation is never production authority.

### C6 — educational GenAI can hallucinate/underperform without evaluation
https://doi.org/10.1016/j.compedu.2025.105448

Response:
- provider output is untrusted;
- critique/evaluation/abstention and provenance are mandatory architecture concepts.

### C7 — production AI learning systems need dedicated evals
https://blog.brilliant.org/when-almost-right-is-catastrophically-wrong-evals-for-ai-learning-games/

Response:
- provider evaluation and quality gates exist separately from generation.

### C8 — market direction is scaffolded/interactive tutoring, not simple answer chat
https://blog.google/products-and-platforms/products/education/khan-academy-back-to-school/
https://blog.brilliant.org/a-world-class-tutor-in-every-home/

Response:
- future tutor is a pedagogical policy consumer, not a generic chatbot.

### C9 — analytics dashboards often lack intervention/causal value
https://doi.org/10.1007/s44217-025-00964-y
https://doi.org/10.1007/s10734-026-01709-y

Response:
- analytics must answer:
  1. Where am I?
  2. What should I do next?
  3. Why?

### C10 — adaptive-learning evidence is broad but implementation quality varies
https://doi.org/10.1016/j.lindif.2025.102781
https://doi.org/10.1016/j.caeai.2025.100429

Response:
- adaptivity is delayed until durable learner evidence exists;
- no single algorithm is hard-wired prematurely.

### C11 — spaced-repetition controls can overwhelm users
https://docs.ankiweb.net/deck-options

Response:
- future scheduler complexity stays behind sane defaults/progressive disclosure.

### C12 — WCAG 2.2 is the accessibility baseline
https://www.w3.org/TR/wcag/

Response:
- accessibility is a quality/release concern, not polish.

### C13 — users dislike silent AI mutation of deterministic study material
https://www.reddit.com/r/quizlet/comments/1wmje3l/please_let_us_disable_aigenerated_answers_during/

Response:
- SourcePolicy and user/source immutability;
- deterministic/no-AI path must remain available.

### C14 — redesigns can create navigation friction
https://www.reddit.com/r/Khan/comments/1ujt92u/dislike_the_new_interface/

Response:
- future UX changes should measure time/actions-to-task, not only appearance.

### C15 — technical playback/outage failures interrupt learning
https://www.reddit.com/r/Udemy/comments/1tetsff/using_udemy_in_2026_as_a_student_is_a_horrible/

Response:
- reliability/offline recovery stays a product-quality requirement.

### C16 — gamification has mixed effects
Negative:
https://www.reddit.com/r/duolingo/comments/1t5izz9/after_6_years_on_duo_im_finally_calling_it_quits/

Positive counter-signal:
https://www.reddit.com/r/duolingo/comments/1w1hbok/did_anyone_else_get_sucked_into_trash_talking/

Response:
- engagement mechanics may exist, but learning outcomes dominate.

## 5.3 Research falsifiers/counter-evidence retained

We explicitly avoided overclaiming:

- retrieval is not universally dominant;
- gamification is not inherently harmful;
- AI-generated content is not inherently low quality;
- sophisticated analytics do not prove learning impact.

This prevents the architecture from becoming a collection of fashionable absolutes.

## 5.4 Research failure taxonomy adopted

High-value recurring failure classes:

- technical instability/offline failure;
- AI hallucination/incorrect content;
- silent AI mutation of source/user material;
- engagement mechanics displacing learning;
- dashboard with no actionable intervention;
- content-scale inflation without coverage;
- premature psychometric claims;
- UI redesign increasing navigation cost;
- accessibility/mobile friction.

## 5.5 Residual research uncertainty

Still unresolved:

1. no large-scale direct evidence yet from our own learners;
2. current SDAIA profile remains unverified by current primary exam-rule evidence;
3. K1 whole-branch review was self-review because no independent subagent was available;
4. future tutor/adaptive/psychometric algorithms need their own bounded evidence reviews;
5. historical K1-migrated items lack authoritative per-item cognitive taxonomy.

---

# 6. Programme history and what each stage changed

## Programme A — contract/runtime stabilization

Purpose:
make the existing application coherent before expansion.

Key outcomes:
- canonical track manifest/profile;
- stable question/family identities;
- StateV2;
- neutral anonymous identity;
- Browser/API RuntimeBundle parity;
- profile-driven exam behavior;
- safe PWA/service-worker migration;
- browser storage default + API adapter;
- legacy 121-item paths quarantined/removed from active runtime;
- manifest-driven CI/Pages verification;
- documentation/governance baseline.

Major lesson:
do not scale content on conflicting runtime/state/API contracts.

## B0 — governance + research synchronization

Purpose:
align constitution and research before later programmes.

Key outcomes:
- research amendment;
- contradiction/scope audits;
- evidence ledger;
- failure taxonomy;
- explicit counter-evidence;
- future sequencing rules.

Major lesson:
research must change design decisions, not just be cited.

## B1 — Track Presentation Contract

Purpose:
remove track-specific presentation from platform core.

Key outcomes:
- presentation schema/data;
- core I18N separated from track presentation;
- bilingual/domain labels moved to track data;
- feedback/presentation paths generalized;
- offline/live release presentation verification.

Major lesson:
“track is data, platform is code” must include presentation, not only runtime data.

## B2 — Track Registry

Purpose:
remove single-track registry assumptions and define discovery/selection boundary.

Key outcomes:
- TrackRegistryV1;
- default/current track resolution;
- release/runtime registry validation;
- current single production track preserved without hard-coding registry logic.

Major lesson:
multi-track readiness begins with identity/discovery contracts, not adding a second track first.

## B3 — Content Model v2 / stable domain IDs

Purpose:
replace display labels as structural identity.

Key outcomes:
- DomainCatalogV2;
- seven stable domain IDs;
- ExamProfileV2 weights keyed by stable IDs;
- concept `domain_id`;
- RuntimeBundleV3;
- legacy-to-stable migration map;
- browser/server/API parity;
- deterministic payload preserved.

Stable domain IDs:
- `mlops-llmops`
- `data-ml`
- `core-ai`
- `responsible-ai-security-governance`
- `ai-software-engineering`
- `architecture-infrastructure`
- `business-professional-practice`

Major lesson:
labels can change; structural identity must not.

## K1 — Content Factory & Governance Core

Original narrow idea:
“Question Factory v2 = generator + checks.”

Research/design changed it into:
a reusable governed content lifecycle kernel.

Architecture:
- modular monolith;
- strict ports/adapters;
- C-ready seams without premature distributed complexity.

K1 stages:

### A0/A1
- baseline and RED acceptance boundary;
- versioned core schemas/contracts.

### B
- lifecycle state machine;
- SourcePolicy;
- QualityPolicy;
- ReviewPolicy;
- immutable content hashing/versioning.

### C
- provenance;
- provider ports;
- deterministic/no-AI provider;
- provider evaluation;
- provider output cannot activate content.

### D
- content/job/event/review/runner ports;
- file/JSONL stores;
- SQLite adapter;
- LocalRunner;
- resume/retry/cancel;
- partial-batch behavior;
- CLI.

### E
Governed pipeline:

```text
Generate
→ Critique
→ Validate
→ Deduplicate
→ Evidence
→ Distractor Quality
→ Bilingual
→ Accessibility/Fairness
→ Review
→ Activation
```

### F
- multidimensional Coverage Engine;
- structured CoverageGap;
- count-only expansion rejected.

### G
- immutable content releases;
- CANARY boundary;
- rollback;
- AssessmentFormSnapshot;
- safe content migration delta.

### H
- LearnerEventV1;
- raw evidence only;
- append-only JSONL/SQLite;
- UTC normalization;
- QTI/CASE/event adapter seams.

### I
- current 1,120 questions imported into governed lineage;
- 140 provisional migration-derived objectives;
- honest grandfathered provenance;
- no synthetic historical quality certification.

### J
- validator integration;
- full acceptance;
- whole-branch review;
- exact-head CI;
- merge;
- post-merge verification.

---

# 7. K1 architecture now available

## 7.1 Knowledge/content contracts
- LearningObjectiveV1
- EvidenceSourceV1
- QuestionFamilyV2
- ItemVersionV1

## 7.2 Governance/quality contracts
- QualityReportV1
- ProvenanceRecordV1
- ReviewDecisionV1
- SourcePolicyV1
- QualityPolicyV1
- ReviewPolicyV1

## 7.3 Execution contracts
- FactoryRunV1
- ProviderResultV1
- ProviderEvaluationV1
- CoverageGapV1

## 7.4 Delivery/evidence contracts
- ContentReleaseManifestV1
- AssessmentFormSnapshotV1
- LearnerEventV1

## 7.5 Core boundaries
- provider ports;
- persistence ports;
- orchestration ports;
- interoperability ports;
- deterministic/no-AI execution path;
- file/JSONL/SQLite adapters.

---

# 8. K1 safety rules that must remain true

## Content/provider trust
- AI/provider output is a candidate, not authority.
- `GENERATED → ACTIVE` is invalid.
- activation requires governed lifecycle/review/release evidence.

## Source policy
Supported modes:
- STRICT
- GROUNDED
- EXPANSIVE

Default K1 policy:
- GROUNDED.

## Quality
No aggregate score can hide a failed critical dimension.

Critical checks include:
- correctness;
- evidence grounding;
- ambiguity;
- distractor quality;
- bilingual equivalence;
- accessibility/fairness;
- duplication;
- cognitive alignment;
- intended difficulty;
- coverage value;
- exam representativeness.

## Releases
- released item versions are immutable;
- edits create new versions;
- CANARY precedes ACTIVE;
- rollback selects a previous compatible release instead of rewriting history.

## Assessments
An assessment form snapshot freezes:
- exact item versions;
- item order;
- option order;
- release/profile/scoring versions.

A bank change cannot mutate an exam already in progress.

## Learner evidence
Raw LearnerEventV1 is append-oriented.

Do not store:
- mastery;
- readiness;
- calibrated difficulty

as raw truths.

Those are future derived/versioned projections.

---

# 9. Important K1 review findings and lessons

Whole-branch review found and fixed three Important issues:

## 9.1 Direct ACTIVE release construction
Problem:
constructor could bypass CANARY.

Fix:
direct ACTIVE/CANARY construction rejected; explicit transition/evidence required.

## 9.2 Learner-event persistence bypass
Problem:
stores could persist caller data without full runtime validation/canonical UTC semantics.

Fix:
validation moved to persistence boundary; UTC normalization and derived-field rejection enforced.

## 9.3 CLI not actually wired to Runner
Problem:
programmatic tests injected runner, while real CLI process lacked persistent LocalRunner.

Fix:
spawned-process RED test; executable CLI now wires JobStore + AuditStore + LocalRunner.

Deferred Minor:
legacy families use provisional `cognitive_level=understand`; historical bank lacked authoritative cognitive taxonomy. Future corrections must version records rather than rewrite history.

---

# 10. Working method learned and standardized

The full reusable method is now codified at:

`docs/superpowers/OPERATING_PLAYBOOK.md`

Key rules:

## Decomposition

```text
Programme
→ Checkpoint/Stage
→ Task
→ Microstep
→ Verification
```

Prefer more/smaller tasks.

K1 example:
- 11 checkpoint groups;
- 87 tasks;
- 425 checkable microsteps.

## Task TDD

```text
write RED
→ prove correct RED
→ smallest implementation
→ GREEN
→ affected regression
→ commit
→ ledger
```

## Durable records

### After every task / meaningful decision
Update execution ledger.

### After every checkpoint/stage
Update checkpoint summary.

### HANDOFF
Update on:
- gate changes;
- checkpoint/session transfer boundaries;
- before major interruption;
- pre/post integration when recovery changes;
- programme change.

Do not rewrite HANDOFF after every microstep; that creates conflict/noise.

### Tracker
Update only when programme/gate status changes.

### Before merge
Create final review.

### After merge
Create post-merge verification.

---

# 11. Superpowers/skills operating sequence

For architecture/research:
- `superpowers:brainstorming`
- evidence-engineering research when current external evidence matters.

For planning:
- `superpowers:writing-plans`

For execution:
- `superpowers:executing-plans`
- `superpowers:test-driven-development`

On failures:
- `superpowers:systematic-debugging`

When independent tasks/environment permit:
- `superpowers:dispatching-parallel-agents`

For review:
- `superpowers:requesting-code-review`
- `superpowers:receiving-code-review`

Before success/completion claims:
- `superpowers:verification-before-completion`

For integration:
- `superpowers:finishing-a-development-branch`

Workspace:
- `superpowers:using-git-worktrees` when reliable local worktrees exist.
- When local GitHub access/worktree is unreliable, use an isolated GitHub branch + CI and record the ruling.

---

# 12. Failure/recovery lessons learned across programmes

## Do not reconstruct from memory
Tool failures previously caused uncertainty about how far execution had advanced.

Rule:
repo HEAD + ledger + diff are authoritative.

## Distinguish product bugs from test bugs
Examples:
- missing `import pytest` in H;
- stale regex/escape assertion;
- stale v1 expectations after B3 migration.

Do not “fix” product behavior to make a broken test pass.

## Keep browser/server/API contracts synchronized
B3 exposed stale server/live-verifier v1 assumptions after browser migration.

Rule:
contract migration is not complete until all adapters/verification paths agree.

## Never invent historical evidence
K1 migration did not mark existing items as if they had historically passed new quality gates.

Rule:
migration provenance says `migrated-grandfathered`; future changes go through new governed versions.

## Final HEAD must be tested
Review/checkpoint/docs commits can move branch HEAD after code tests passed.

Rule:
exact-head CI again before merge.

## Handoff staleness is a real defect
Earlier HANDOFF sections could still say “Current” after later programmes.

Rule:
historical sections are explicitly labelled HISTORICAL and current top section owns continuation.

---

# 13. Current K2 boundary

Current programme:

**K2 — Coverage Expansion & Controlled Release**

K2 has not implemented product changes yet.

Canonical flow:

```text
Coverage Gap
→ Candidate Families
→ Factory Quality Pipeline
→ Risk-based Review
→ CANARY
→ Promote
→ Observe
```

Capacity references:

```text
1,120 → ~3,000 → ~6,000 → ~10,000 → 14,000+
```

These are not acceptance metrics.

Promotion is governed by:
- coverage;
- correctness/evidence;
- distractor quality;
- Arabic/English equivalence;
- accessibility/fairness;
- duplication;
- provenance;
- review;
- release/canary criteria;
- runtime compatibility.

---

# 14. K2 design questions that must be resolved before implementation

1. Expansion unit: objective/misconception gaps vs scenario bundles.
2. Batch sizing: fixed waves vs adaptive waves based on yield.
3. Provider strategy: deterministic + AI-assisted candidates; model evaluation/routing.
4. Evidence policy: source classes allowed for STRICT/GROUNDED production expansion.
5. Review scaling: human review percentage by risk/provider maturity/quality yield.
6. Semantic dedup: embeddings/thresholds without forcing a dedicated vector DB.
7. Difficulty: intended authoring difficulty only; observed/calibrated difficulty deferred.
8. Canary evidence: what is sufficient for CANARY → ACTIVE.
9. Release cadence: how 3k/6k/10k/14k milestones map to immutable releases.
10. Rollback/quarantine: family/batch recovery.
11. Bilingual authoring: co-generation vs source-first + equivalence workflow.
12. Quality sampling: deterministic checks + critics + human review boundaries.

K2 design must answer these before a written implementation plan exists.

---

# 15. Future roadmap

```text
K2 — Coverage Expansion & Controlled Release
  ↓
K3 — Learner Evidence Engine
  ↓
K4 — Next-Best-Action / Spaced Practice
  ↓
K5 — Mastery & Readiness Projections
  ↓
K6 — Psychometric Calibration
  ↓
K7 — Grounded Pedagogical AI Tutor
  ↓
K8 — Advanced Adaptive Assessment / CAT
  ↓
K9 — Multimodal & Ecosystem Integrations
```

Do not reorder K2 and K3.

Do not start mastery/psychometrics before learner evidence exists.

Do not let K2 content expansion bypass K1 factory governance.

---

# 16. Two-programme execution preference

Where practical, execute two consecutive programmes, but preserve independent gates:

```text
Programme N
Design
→ written spec
→ approval
→ written plan
→ approval
→ TDD implementation
→ verification
→ whole-branch review
→ exact-head CI
→ merge
→ post-merge verification
  ↓
real new main baseline
  ↓
Programme N+1
```

Do not build Programme N+1 against a guessed future baseline.

---

# 17. New-chat recovery sequence

A fresh chat must do exactly:

1. invoke relevant Superpowers skills first;
2. read `HANDOFF.md`;
3. resolve live `main` SHA;
4. read this comprehensive handoff;
5. read `docs/superpowers/OPERATING_PLAYBOOK.md`;
6. read programme tracker;
7. read K1 post-merge verification;
8. inspect current K2 artifacts if any;
9. inspect branch/main diff before mutation;
10. resume the earliest incomplete K2 gate.

Do not redo K1.

---

# 18. Exact next action

Start **K2 architectural design** from the current verified post-K1 main.

Required sequence:

1. use `superpowers:brainstorming`;
2. re-read K2 constraints and real K1 interfaces;
3. resolve the 12 K2 design questions;
4. perform any bounded evidence refresh needed for provider/review/dedup/release decisions;
5. present K2 design for approval;
6. write K2 spec after conceptual design approval;
7. obtain written-spec approval;
8. use `superpowers:writing-plans`;
9. create many small stages/tasks/microsteps;
10. obtain plan approval;
11. execute continuously with TDD/ledger/checkpoints;
12. review/verify/merge/post-merge;
13. only then design K3 from the actual new baseline.

---

# 19. Durable file map

## Governance
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
- `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`

## Evidence
- `docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md`
- `docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md`

## K1
- `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`
- `docs/superpowers/plans/2026-09-27-k1-content-factory-governance-core.md`
- `docs/superpowers/reviews/2026-09-27-k1-execution-ledger.md`
- `docs/superpowers/reviews/2026-09-27-k1-checkpoint.md`
- `docs/superpowers/reviews/2026-09-27-k1-final-review.md`
- `docs/superpowers/reviews/2026-09-27-k1-post-merge-verification.md`
- `docs/superpowers/reviews/2026-09-27-k1-reverification.md`

## Programme navigation
- `HANDOFF.md`
- `docs/superpowers/OPERATING_PLAYBOOK.md`
- `docs/superpowers/reviews/2026-09-27-platform-programme-tracker.md`
- `docs/superpowers/plans/2026-09-27-post-b3-platform-kernel-roadmap.md`

---

# 20. Final recovery statement

The platform is no longer “a bilingual question site with plans to scale.”

It now has:

- stabilized runtime/state/release contracts;
- multi-track-ready presentation/registry/content identity;
- stable domain IDs;
- governed content lineage;
- versioned policies;
- provider-independent generation/review seams;
- durable provenance;
- resumable orchestration;
- quality gates;
- structured coverage gaps;
- immutable releases/snapshots;
- append-only learner evidence foundation;
- interoperability seams;
- controlled migration of the existing 1,120-question bank.

The next challenge is not to generate 14,000 questions as quickly as possible.

The next challenge is to use K1 to create **measurably broader, non-duplicative, evidence-grounded, bilingual, reviewed content releases** without sacrificing the compatibility and governance already established.
