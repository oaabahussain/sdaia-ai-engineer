# Content Factory & Governance Core — Platform Kernel Design

**Date:** 2026-09-27  
**Status:** Written architectural spec — awaiting user review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Base:** `main@0b2547a48fe0300a7a3c3348229e7119a5a8ce20`  
**Programme:** Post-B3 / Question Factory v2 successor design

## 1. Authority and precedence

This spec extends, and does not silently replace, the accepted platform governance.

Authority order for future implementation:

1. `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
2. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
3. This spec: `2026-09-27-content-factory-governance-core-design.md`
4. The future implementation plan generated only after this written spec is approved.

If a later plan conflicts with the constitution, research amendment, or this spec, the design/spec wins until an explicit approved amendment changes it.

Historical B1/B2/B3 plans and ledgers remain evidence of completed work. They are not the source of truth for the next programme.

## 2. Current verified baseline

The platform has completed and merged:

- Programme A — repository/runtime contract stabilization.
- B0 — governance/research synchronization.
- B1 — Track Presentation Contract.
- B2 — Track Registry.
- B3 — Content Model v2 / stable domain IDs.

Current production baseline:

`main@0b2547a48fe0300a7a3c3348229e7119a5a8ce20`

Current active contracts:

- TrackRegistryV1.
- TrackManifestV1.
- TrackPresentationV1.
- DomainCatalogV2.
- ExamProfileV2.
- RenderedQuestionV2.
- RuntimeBundleV3.
- StateV2.

Current verified learner/runtime facts:

- 1,120 generated questions.
- 200-question full exam.
- weighted allocation 36 / 35 / 33 / 29 / 28 / 25 / 14.
- Arabic/English and RTL/LTR.
- Browser/API parity.
- SQLite smoke.
- service-worker/offline reload.
- GitHub Pages live deployment.
- question/family/concept IDs preserved through B3.

This programme must preserve those guarantees unless an explicit versioned migration is designed and approved.

## 3. Why Question Factory v2 is being widened

The original “Question Factory v2” idea was directionally correct but too narrow if implemented only as a generator plus validators.

The durable platform needs a production-grade **content lifecycle kernel**, not a one-off question generator.

The approved direction is therefore:

> **Build a headless Content Factory & Governance Core as the first subsystem of a broader Platform Kernel.**

Question generation remains a major capability, but it sits inside a governed lifecycle with stable content identity, evidence, versioning, quality gates, release management, provenance, audit, learner-evidence hooks and C-ready orchestration boundaries.

The design must avoid both extremes:

- do not build a simplistic B that must be rewritten when C arrives;
- do not prematurely build a distributed CMS/microservices platform before usage justifies it.

Selected strategy:

> **Modular monolith + strict ports/adapters + resumable state machine + immutable content/version records.**

## 4. Platform Kernel model

The long-term platform is organized into five logical planes.

### 4.1 Knowledge & Content Plane

Owns durable academic/content identity:

- tracks;
- domains;
- competencies;
- objectives;
- concepts;
- misconceptions;
- evidence/source references;
- scenarios;
- question families;
- item versions;
- content releases;
- exam profiles.

### 4.2 Factory & Quality Plane

Owns authoring/production lifecycle:

- gap requests;
- generation;
- critique;
- deterministic validation;
- semantic deduplication;
- evidence/correctness checks;
- distractor quality;
- bilingual equivalence;
- accessibility/fairness checks;
- review decisions;
- release eligibility;
- canary/active/retired lifecycle.

### 4.3 Delivery & Assessment Plane

Owns what learners actually receive:

- learn;
- practice;
- check;
- section assessment;
- mock exams;
- immutable assessment form snapshots;
- content release pinning;
- feedback timing and scoring policy.

### 4.4 Learner Evidence & Intelligence Plane

Stage 1 introduces only durable raw evidence contracts and storage ports, not full adaptive intelligence.

Future consumers include:

- mastery projections;
- readiness projections;
- memory/retention state;
- item statistics;
- psychometric models;
- next-best-action;
- adaptive practice.

The rule is:

> **Raw evidence is durable; derived intelligence is recomputable and versioned.**

### 4.5 Control & Operations Plane

Stage 1 defines the control boundaries and implements only the local/single-process versions:

- runs;
- jobs;
- resume/retry;
- audit;
- provider configuration;
- review decisions;
- batch execution;
- local orchestration;
- file/SQLite persistence.

Future C-style expansion may add:

- API;
- queues;
- distributed workers;
- reviewer dashboard/CMS;
- RBAC;
- auth;
- scheduling;
- webhooks;
- monitoring;
- remote object storage;
- Postgres.

The core must not require those future systems.

## 5. Modular-monolith rule

The selected architecture is **not microservices**.

The implementation should use focused modules with explicit interfaces, conceptually:

```text
src/platform-kernel/
  knowledge/
  factory/
  quality/
  release/
  evidence/
  orchestration/
  persistence/
  interoperability/
```

The exact paths may be adjusted in the implementation plan to match repository conventions, but the boundaries must remain testable and separable.

A module must be understandable through its public contract without requiring consumers to know its internals.

No module may directly bind the reusable core to a specific AI provider, database, queue or CMS.

## 6. Stable learning graph

The platform’s canonical learning/content lineage becomes:

```text
Track
  ↓
Domain
  ↓
Competency
  ↓
Objective
  ↓
Concept
  ↓
Misconception
  ↓
Scenario / Decision
  ↓
QuestionFamily
  ↓
ItemVersion
```

B3 stable domain IDs remain authoritative.

The factory must not regress to using presentation labels as identity.

Future competency/objective identifiers must be stable, track-scoped and versionable.

External standards may be mapped through adapters; they do not become the internal canonical representation.

## 7. QuestionFamilyV2

The central authoring unit is a **Question Family**, not a rendered question.

A family describes the pedagogical decision being tested and the valid space of item variants.

Minimum logical fields:

- family_id;
- track_id;
- domain_id;
- competency_id where available;
- objective_id;
- concept_ids;
- misconception_ids;
- learning_goal;
- decision_being_tested;
- cognitive_level;
- intended_difficulty;
- scenario_model;
- variable_model;
- correct_reasoning;
- common_wrong_reasoning;
- evidence_refs;
- language_requirements;
- accessibility_requirements;
- generation_policy;
- quality_policy;
- release_policy;
- lifecycle metadata;
- version metadata.

The implementation plan may split these into nested records, but the semantics must remain explicit.

## 8. ItemVersion contract

A released question is immutable.

Editing an item creates a new `ItemVersion`; it does not mutate the released version in place.

Every version must retain:

- stable family_id;
- item_version_id;
- version number;
- content payload;
- source/evidence links;
- generator metadata;
- reviewer metadata;
- validation results;
- quality results;
- release state;
- timestamps;
- predecessor/supersession link where applicable.

This solves a major long-term failure mode: content changes must not silently alter already-started assessments or historical learner evidence.

## 9. AssessmentFormSnapshot

When an assessment begins, the delivered form is frozen.

Logical fields include:

- form_id;
- learner/session reference;
- content_release_id;
- exam_profile_version;
- scoring_policy_version;
- ordered item_version_ids;
- option order per item;
- delivery locale;
- started_at;
- compatibility metadata.

If the bank changes while the learner is in the exam, the form does not change.

Scoring and denominator use the items actually delivered by that snapshot.

## 10. Content release model

Content is released through explicit immutable manifests, similar to software releases.

Lifecycle:

```text
DRAFT
  ↓
DEV
  ↓
REVIEW
  ↓
CANARY
  ↓
ACTIVE
  ↓
DEPRECATED
  ↓
RETIRED
```

Additional exception state:

`QUARANTINED`

A `ContentReleaseManifest` binds the exact compatible versions of:

- domain/knowledge identities;
- objective/competency references;
- question families;
- item versions;
- translations;
- evidence references;
- exam profiles;
- policies needed for delivery.

Rollback means selecting an earlier compatible release, not rewriting content in place.

## 11. Factory state machine

A content candidate moves through an enforced state machine.

Canonical pipeline:

```text
Coverage Gap / Authoring Request
        ↓
Generate / Author
        ↓
Critique
        ↓
Deterministic Validate
        ↓
Semantic Deduplicate
        ↓
Evidence / Correctness
        ↓
Distractor Quality
        ↓
Bilingual Equivalence
        ↓
Accessibility / Fairness
        ↓
Review
        ↓
APPROVED
        ↓
CANARY
        ↓
ACTIVE
        ↓
Observe
        ↓
Recalibrate / Revise / Retire
```

No provider, CLI, future API or future CMS may bypass the state machine.

In particular:

`GENERATED → ACTIVE`

is invalid.

## 12. QualityReport: no single opaque score

Quality is multidimensional.

The canonical logical report must support at least:

- correctness;
- evidence_grounding;
- ambiguity;
- distractor_quality;
- bilingual_equivalence;
- accessibility;
- fairness;
- duplication;
- cognitive_alignment;
- difficulty_intent;
- coverage_value;
- exam_representativeness.

A composite score may be derived for dashboards, but activation cannot depend only on one aggregate number.

Critical dimensions use explicit PASS/FAIL/ABSTAIN/REVIEW_REQUIRED semantics.

## 13. Quality policy

Release eligibility is policy-driven.

A policy may require, for example:

- correctness = PASS;
- evidence = PASS;
- ambiguity = PASS;
- bilingual equivalence = PASS;
- accessibility = PASS;
- duplicate similarity below threshold;
- required reviewer decision satisfied.

The policy itself is versioned and referenced by the content/run record.

This allows future tracks to apply stricter or different gates without forking the factory.

## 14. Human-review scaling

Human review must not become a permanent all-items bottleneck, but high-risk content cannot silently become fully automatic.

Policy examples:

- high-risk/new-domain/new-provider items → 100% human review;
- new generator/model → elevated sampling;
- established low-risk deterministic variants → automated gates + sampled human review;
- poor production signals → automatically increase review rate;
- quarantined families → mandatory review before reactivation.

The implementation may begin conservatively with stronger review requirements and loosen them only through evidence-backed policy changes.

## 15. AI provider boundary

The core must not depend on OpenAI, Anthropic, Google, Z.ai or any specific local model.

Provider ports include conceptually:

- GeneratorProvider;
- CriticProvider;
- EvidenceProvider;
- EmbeddingProvider;
- TranslationProvider;
- TutorProvider later.

Every provider output records:

- provider;
- model;
- model/version identifier where available;
- prompt/policy version;
- run_id;
- timestamp;
- input/output hash or equivalent provenance;
- cost/latency metadata when available;
- failure/retry metadata.

A deterministic/no-AI provider path must remain available.

## 16. Provider evaluation gate

A new model/provider is not promoted because it is newer.

Provider evaluation uses a frozen evaluation set and measures at least:

- correctness;
- hallucination/source fidelity;
- Arabic quality;
- English quality;
- distractor quality;
- schema/format compliance;
- latency;
- cost.

A provider cannot become production-default until it passes the configured provider evaluation policy.

## 17. SourcePolicy

The platform supports three explicit content-source policies.

### STRICT

- Only approved source material.
- No external generated facts.
- No silent enrichment.

### GROUNDED

- AI may transform or expand only when the added content is supported by approved evidence.

### EXPANSIVE

- General-model knowledge may be used where the track policy permits it.
- Added material must be clearly labelled/provenanced.
- It cannot be silently represented as canonical source truth.

The track or factory request declares the policy.

Source material and user-authored content are immutable inputs; generated derivatives are separate versions.

## 18. Provenance and audit

Provenance is first-class structured data, not free-text logging.

The system must support records equivalent to:

- GenerationRecord;
- CritiqueRecord;
- ValidationRecord;
- EvidenceRecord;
- DeduplicationRecord;
- Translation/BilingualRecord;
- ReviewDecision;
- ActivationRecord;
- CalibrationRecord later;
- RetirementRecord.

Audit records include run/stage/item/version/provider/policy relationships sufficient to explain how an active item reached production.

## 19. Resumable runs

Every pipeline run is resumable by stage.

Minimum execution metadata:

- run_id;
- item/family target;
- stage;
- status;
- attempt;
- input_hash;
- output reference;
- provider;
- policy version;
- started_at;
- completed_at;
- error classification;
- retry eligibility.

A process interruption after Evidence must allow resume at the next valid stage rather than regenerating the entire item.

## 20. Runner abstraction

The factory exposes orchestration semantics such as:

- runFamily;
- runCandidate;
- runBatch;
- resumeRun;
- retryStage;
- cancelRun.

Stage 1 implements a `LocalRunner` or equivalent.

Future implementations may add:

- QueueRunner;
- WorkerRunner;
- DistributedRunner.

No stage may depend on the concrete runner.

## 21. Persistence ports

The core communicates through explicit persistence interfaces.

Stage 1 may use:

- filesystem for canonical artifacts;
- SQLite for runs/audit/local operational state.

Future adapters may add:

- Postgres;
- object storage;
- remote event store.

The domain/core layer must not embed SQL or filesystem paths directly in content logic.

## 22. Coverage Engine

The platform does not accept “generate 14,000 questions” as a sufficient production instruction.

Coverage is multidimensional.

The model must be able to represent:

- track;
- domain;
- competency;
- objective;
- concept;
- misconception;
- cognitive process;
- scenario;
- item type;
- interaction type;
- intended difficulty;
- language;
- evidence class;
- source;
- accessibility requirements;
- exam representativeness;
- learning value;
- exposure;
- review status;
- release status;
- psychometric status later.

The Coverage Engine identifies gaps and emits `CoverageGap` requests.

The factory fills gaps rather than maximizing raw count.

## 23. Large-scale expansion boundary

The second programme after this core is:

**Coverage Expansion & Controlled Release**

It consumes the completed factory and follows:

```text
Measure coverage gaps
  ↓
Generate/author candidate families
  ↓
Factory quality pipeline
  ↓
Risk-based human review
  ↓
Canary
  ↓
Promote
  ↓
Observe
```

The 14,000+ target is a capacity/coverage target, not a quality metric.

Expansion occurs in controlled releases, not one giant generation batch.

The architecture should support milestones such as 3k → 6k → 10k → 14k+, but promotion is gated by quality/coverage rather than the number itself.

## 24. LearnerEventV1 foundation

Stage 1 defines the raw learner-evidence contract needed by future analytics without implementing mastery/readiness claims yet.

Logical fields include:

- learner/anonymous ID;
- track_id;
- content_release_id;
- form/session ID;
- question_family_id;
- item_version_id;
- objective_id;
- domain_id;
- mode;
- locale;
- shown_at;
- answered_at;
- answer;
- correct;
- confidence;
- latency;
- hint_used;
- explanation_opened;
- attempt_number;
- device/context metadata where appropriate and privacy-safe.

Raw evidence is append-oriented and must not be overwritten by derived mastery/readiness outputs.

## 25. Future intelligence boundary

The following are **not** implemented in this programme:

- mastery engine;
- readiness engine;
- FSRS/spaced scheduler;
- next-best-action engine;
- psychometric calibration/IRT;
- CAT;
- adaptive recommendation engine.

They consume LearnerEventV1 and later versioned derived projections.

The future conceptual flow is:

```text
Raw Learner Evidence
    ↓
Projection Engines
    ├─ mastery-vN
    ├─ readiness-vN
    ├─ retention-vN
    └─ item-statistics-vN
```

No derived projection becomes the durable source of truth.

## 26. Tutor boundary

A future AI tutor is a pedagogical policy consumer, not a generic chat window.

Future tutor actions may include:

- hint;
- Socratic question;
- worked example;
- error diagnosis;
- ask learner to explain;
- scaffold;
- direct answer;
- abstain/escalate.

This programme does not implement the tutor.

It preserves the deterministic/manual path required by the Research Amendment.

## 27. Interoperability boundary

Internal JSON contracts remain canonical.

External standards are adapters.

Future ports include:

- assessment exchange — QTI;
- competency/objective exchange — CASE;
- learning-event exchange — Caliper or another approved event adapter;
- LMS/tool launch/integration — LTI where justified.

Do not make QTI XML or any external vendor schema the internal source of truth.

Stage 1 should create the seam/port and enough fixture testing that future import/export does not require redesigning internal contracts.

## 28. Accessibility and fairness

Accessibility/fairness are factory gates, not post-release polish.

The content contract must be able to capture:

- language direction/mixed-language requirements;
- alternative text/media metadata where relevant;
- interaction accessibility constraints;
- known bias/fairness review status;
- accessibility test result.

WCAG 2.2 remains the web baseline from the Research Amendment.

The factory must support abstain/review-required when an automated checker cannot make a reliable decision.

## 29. User-experience protections

Architecture-level protections based on observed recurring failure patterns:

### 29.1 No silent AI enrichment

SourcePolicy controls what generated content may add.

### 29.2 No silent user-content rewrite

Original material remains immutable; transformations create derived artifacts.

### 29.3 Explain why an activity exists

Future delivery/intelligence layers should be able to answer “Why this now?” from coverage/evidence/recommendation records.

### 29.4 Hide internal algorithm complexity

Normal learners receive sensible defaults and progressive disclosure; internal scheduler/model knobs are not required learner decisions.

### 29.5 Content update safety

Learners can be pinned to a compatible ContentRelease.

A new release may define migration/catch-up deltas; it must not mark unseen content as learned merely because the curriculum changed.

## 30. C-ready seams without C complexity

The following interfaces are required now:

- RunnerPort;
- JobStorePort;
- ContentStorePort;
- EventStorePort;
- ReviewPort;
- ProviderPort.

Stage 1 implements lightweight local adapters.

It explicitly does **not** implement:

- distributed queue;
- worker fleet;
- CMS;
- admin/reviewer UI;
- RBAC/auth;
- multi-tenant SaaS;
- Kubernetes;
- mandatory vector database;
- remote workflow scheduler.

Those become incremental Control Plane programmes after usage proves the need.

## 31. Reliability requirements

The factory must be deterministic where deterministic behavior is expected.

Every run should be:

- resumable;
- inspectable;
- idempotent where possible;
- bounded on failure;
- auditable;
- version-aware.

Batch failure must not corrupt previously approved content.

Partial batch success must be explicit rather than silently treated as complete success.

## 32. Release rollback

An active content release must be rollback-capable.

Rollback means:

- select a previous compatible ContentReleaseManifest;
- preserve newer audit/evidence records;
- do not delete learner history;
- do not mutate old item versions;
- record the rollback event and reason.

## 33. Compatibility with current 1,120 questions

The existing 1,120-question bank is not discarded.

The future implementation must define an explicit migration/import path from current RenderedQuestionV2/families into the new governed factory contracts.

Initial factory acceptance must prove that importing current content:

- preserves question IDs;
- preserves family IDs;
- preserves answers/options/text;
- preserves domain IDs;
- does not change current 200-question exam behavior;
- does not auto-activate altered content.

Existing content may be marked as migrated/grandfathered with explicit provenance rather than pretending it passed checks that did not historically exist.

## 34. Security/trust boundary

Factory inputs are untrusted data until validated.

AI/provider outputs are untrusted candidates until quality gates pass.

No provider output is executable code by default.

Future protected assessment pools must remain server-delivered; public browser packages are not treated as confidential.

Secrets/provider credentials must remain outside content artifacts.

## 35. Testing strategy

Implementation must use RED → GREEN TDD.

Required test families include:

- contract/schema tests;
- state-machine transition tests;
- invalid-transition tests;
- source-policy tests;
- version immutability tests;
- assessment snapshot tests;
- coverage gap tests;
- dedup tests;
- provenance/audit tests;
- provider-port tests;
- provider-evaluation fixtures;
- resume/retry tests;
- partial-batch failure tests;
- content-release activation/rollback tests;
- current-1,120 migration compatibility tests;
- StateV2/exam regression tests;
- Arabic/English equivalence gates;
- accessibility/fairness gate semantics;
- QTI/CASE adapter-boundary fixture tests;
- LearnerEventV1 validation;
- browser/API/offline/release regression suite.

## 36. Implementation decomposition

This spec is intentionally one architectural programme, but implementation should be staged into bounded milestones.

Recommended high-level stages:

### F0 — Baseline and migration freeze
Freeze current B3 content and compatibility evidence.

### F1 — Core contracts
QuestionFamilyV2, ItemVersion, provenance, quality, release, run records.

### F2 — State machine and policies
Lifecycle transitions, SourcePolicy, QualityPolicy, ReviewPolicy.

### F3 — Provider and persistence ports
Deterministic provider + local runner + file/SQLite adapters.

### F4 — Quality pipeline
Validate, dedup, evidence, bilingual, accessibility/fairness, review.

### F5 — Coverage Engine
Coverage matrix and gap request contracts.

### F6 — Versioned release
ContentReleaseManifest, canary/active/rollback, AssessmentFormSnapshot.

### F7 — Evidence foundation
LearnerEventV1 + append-only event port.

### F8 — Current content migration
Import existing 1,120 items into governed lineage without changing learner behavior.

### F9 — Acceptance/integration
Whole-suite verification, whole-branch review, merge, post-merge verification.

The future implementation plan may split these further into many smaller tasks.

## 37. Immediate next programme after merge

After this core is merged and post-merge verified, the next programme is:

**Coverage Expansion & Controlled Release**

It must use the new factory rather than bypassing it.

It will not automatically begin adaptive learning, mastery, psychometrics or AI tutoring.

## 38. Longer-term roadmap

After the two approved consecutive programmes:

```text
Content Factory & Governance Core
  ↓
Coverage Expansion & Controlled Release
  ↓
Learner Evidence Engine
  ↓
Next-Best-Action / Spaced Practice
  ↓
Mastery & Readiness Projections
  ↓
Psychometric Calibration
  ↓
Grounded Pedagogical AI Tutor
  ↓
Advanced Adaptive Assessment / CAT
  ↓
Multimodal and ecosystem integrations
```

Each remains a separate design/spec/plan/implementation cycle unless explicitly re-scoped later.

## 39. Non-goals for this programme

Do not implement during this programme:

- 14,000-question mass expansion;
- full CMS;
- distributed workers;
- microservices/Kubernetes;
- production auth/RBAC;
- mandatory vector DB;
- mastery/readiness;
- spaced scheduler;
- psychometric/IRT calibration;
- CAT;
- general AI tutor;
- social/leaderboard systems;
- multi-tenant billing;
- second production track unless separately justified.

## 40. Acceptance definition

This programme is complete only when:

- core factory contracts are versioned and validated;
- state machine prevents invalid lifecycle shortcuts;
- current content can migrate without learner-visible behavior drift;
- item versions and assessment snapshots are immutable;
- provenance/audit can explain activation lineage;
- provider-independent execution works with deterministic/local baseline;
- runs resume/retry safely;
- SourcePolicy and quality/review policies are enforceable;
- Coverage Engine emits structured gaps;
- release/canary/rollback contracts work;
- raw LearnerEventV1 is valid and append-oriented;
- browser/API/offline/current exam regressions remain green;
- whole-branch review has no open Critical/Important findings;
- exact-head CI passes;
- merge and post-merge Pages/server verification pass;
- implementation stops before Coverage Expansion begins.

## 41. Governance ruling

This spec formally supersedes the narrower interpretation:

> “Question Factory v2 = generator + checks”

with:

> **“Question Factory v2 becomes Content Factory & Governance Core inside the Platform Kernel.”**

It does **not** supersede the platform constitution or the 2026-09-26 Research Amendment.

The next implementation plan must use this spec as its direct architectural authority.
