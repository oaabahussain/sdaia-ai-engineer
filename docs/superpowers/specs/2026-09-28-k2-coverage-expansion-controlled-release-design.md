# K2 — Coverage Expansion & Controlled Release — Architectural Design

**Date:** 2026-09-28  
**Status:** Written architectural spec — awaiting user review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Base:** `main@6eb108338857dec9471f441a37d1819b98045cbb`  
**Programme:** K2 — Coverage Expansion & Controlled Release  
**Research register:** `docs/superpowers/reviews/2026-09-28-k2-plus-research-refresh-register.md`

## 1. Authority and precedence

This spec extends the accepted platform architecture. It does not replace the constitution or research amendment.

Authority order for K2:

1. `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
2. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md`
3. `docs/superpowers/specs/2026-09-27-content-factory-governance-core-design.md`
4. `docs/superpowers/reviews/2026-09-28-k2-plus-research-refresh-register.md`
5. this spec
6. future approved K2 implementation plan
7. K2 execution ledger/checkpoints once implementation starts

If an implementation plan conflicts with a higher-authority document, the higher-authority document wins until an explicit approved amendment changes it.

## 2. Intent

K2 turns the governed K1 Content Factory & Governance Core into a repeatable expansion system that can grow content from the current 1,120 governed families/items toward capacity checkpoints such as approximately 3k, 6k, 10k and 14k+ without optimizing for raw count.

The governing goal is:

> **Close measured coverage gaps through controlled, evidence-grounded, bilingual, reviewable, releasable tranches while preserving lineage, compatibility and rollback.**

K2 must improve coverage and production capability without silently weakening:
- correctness;
- evidence grounding;
- bilingual equivalence;
- accessibility/fairness;
- duplicate controls;
- review authority;
- release safety;
- public-runtime compatibility.

## 3. Explicit non-goals

K2 does **not** implement:
- mastery or readiness projections;
- next-best-action scheduling;
- FSRS or another retention scheduler;
- psychometric calibration, IRT or CAT;
- calibrated/observed item difficulty claims;
- a general AI tutor;
- a new distributed workflow platform;
- a dedicated vector database by default;
- a full authoring CMS;
- a new analytics engine, session replay engine, experiment engine or tracing backend;
- an autonomous agent allowed to modify production without review.

Those capabilities belong to later programmes or require separate evidence and approval.

## 4. Existing K1 contracts K2 consumes

K2 builds on, rather than replaces:
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
- factory state machine;
- CANARY/ACTIVE/rollback lifecycle.

K2 may add versioned contracts but may not silently reinterpret K1 history.

## 5. K2 canonical control loop

```text
Coverage Inventory
        ↓
Coverage Targets
        ↓
Coverage Gaps
        ↓
Priority / Risk Classification
        ↓
Adaptive Tranche Plan
        ↓
Provider Routing / Candidate Production
        ↓
Generate / Author
        ↓
Critique
        ↓
Deterministic Validate
        ↓
Multi-layer Deduplicate
        ↓
Evidence / Correctness
        ↓
Distractor Quality
        ↓
Bilingual Equivalence
        ↓
Accessibility / Fairness
        ↓
Risk-based Review
        ↓
APPROVED
        ↓
Release REVIEW
        ↓
CANARY
        ↓
Activation Evidence
        ├─ PROMOTE → ACTIVE
        ├─ HOLD
        ├─ REVISE
        └─ QUARANTINE / ROLLBACK
        ↓
Observe
        ↓
Improvement Findings
        ↓
Policy Recalibration / New Coverage Gaps
```

No stage may bypass K1 lifecycle guarantees.

## 6. Expansion unit

The canonical expansion unit remains **QuestionFamilyV2** linked to:
- track;
- domain;
- objective;
- concepts;
- misconceptions;
- cognitive intent;
- scenario/decision structure;
- intended difficulty;
- evidence;
- bilingual requirements.

A rendered wording variation does not independently satisfy a coverage gap unless it creates materially different pedagogical value.

Coverage requests are emitted from objective/concept/misconception/scenario deficits, not a raw global count.

External competency standards such as CASE are interoperability/alignment adapters only. They do not become the internal source of truth.

## 7. Coverage planning

K2 adds an expansion-planning layer above CoverageGapV1.

The planner must consider at least:
- coverage deficit;
- objective importance;
- misconception coverage;
- cognitive-process distribution;
- intended-difficulty distribution;
- scenario/item-type diversity;
- language completeness;
- source readiness;
- duplicate pressure;
- review backlog/capacity;
- provider maturity;
- risk class;
- release compatibility.

Priority is for **what to work on next**, not a content-quality score.

A high priority cannot override a failed correctness/evidence/review gate.

## 8. Adaptive tranche model

K2 uses **adaptive tranches**, not one globally fixed batch size.

A tranche is a bounded set of coverage-driven factory requests with:
- tranche_id;
- input coverage gaps;
- target families/items;
- applicable provider policy;
- source/quality/review/calibration policy versions;
- risk distribution;
- expected review capacity;
- status;
- observed yield/failure metrics;
- release linkage.

Tranche sizing may expand, contract, pause or stop according to observed evidence.

Inputs include:
- recent candidate pass/yield rate;
- review queue capacity and latency;
- duplicate rate;
- evidence failures;
- bilingual failures;
- provider/model maturity;
- domain/risk class;
- prior CANARY results;
- cost/latency constraints.

Exact tranche counts are **Calibration Policy**, not hard-coded architecture.

## 9. Provider routing and evaluation

Provider output remains untrusted candidate data.

K2 introduces a policy-controlled routing decision over existing provider ports.

Routing may consider:
- capability required;
- provider/model evaluation status;
- language;
- task class;
- risk class;
- latency/cost budget;
- source/evidence requirements;
- deterministic/no-AI availability.

A provider/model cannot become production-default merely because it is newer.

Provider evaluation must use:
- frozen/versioned evaluation sets;
- deterministic checks;
- rubric/model graders where appropriate;
- human-labeled subsets;
- production failure cases;
- Arabic and English examples;
- adversarial/edge cases appropriate to the task.

External eval tools may be used through adapters. Provider activation policy remains internal.

## 10. Evidence and source policy

K2 keeps the K1 STRICT / GROUNDED / EXPANSIVE policy family.

Default remains GROUNDED unless a track/request explicitly chooses otherwise.

The source registry is authoritative for:
- source identity;
- source class;
- approval status;
- version/date;
- provenance locator;
- limitation/conflict metadata;
- applicable claim/content classes.

Search engines, retrieval systems and language models may locate or transform evidence. They may not silently upgrade source authority.

Missing or contradictory evidence must produce ABSTAIN / REVIEW_REQUIRED where appropriate.

The exact approved source classes for SDAIA content are track policy/research data, not generic core code.

## 11. Automation-first review scaling

K2 minimizes routine human review. The default quality path is automated and must combine independent evidence channels rather than a single model judgment.

AUTO_ELIGIBLE content may proceed without human review when:
- deterministic validation passes;
- correctness/evidence checks pass;
- deduplication is outside the review gray zone;
- bilingual critical dimensions pass where applicable;
- provider/model evaluation is approved for the applicable capability;
- risk is low or medium under the active ReviewCalibrationPolicy;
- no drift/escalation trigger is active.

Human review is an escalation path, not the default. Mandatory human review applies to at least:
- high/critical-risk content;
- ambiguous or conflicting correctness/evidence;
- unresolved bilingual disagreement;
- quarantine/recovery cases;
- new or poorly calibrated provider/model/domain combinations until evidence supports automation;
- critical source conflicts;
- explicit drift/anomaly escalation.

Routine quality assurance uses exception sampling rather than broad fixed review. Sampling remains small for mature low-risk classes and increases automatically only when observed failure, drift, complaints, source-quality degradation, or provider changes justify it.

No single AI evaluator may self-authorize production. Automated approval requires the configured independent deterministic/evidence/quality gates to agree.

Exact sampling percentages and escalation thresholds are versioned ReviewCalibrationPolicy data.

## 12. Deduplication v2

K2 upgrades duplicate control into layered evidence:

1. normalized exact fingerprint;
2. structural family/objective/reasoning comparison;
3. lexical near-match;
4. same-language semantic similarity;
5. cross-language Arabic↔English semantic similarity;
6. human review for a calibrated gray zone.

Embedding similarity is a signal, not truth.

A dedicated vector database is not required by default. K2 should first support an adapter-friendly local/Postgres/pgvector-compatible path and only add specialized infrastructure when measured scale/latency/operational evidence justifies it.

Thresholds must be calibrated on labeled duplicate / non-duplicate examples from the actual bank.

## 13. Difficulty boundary

K2 may use only:
- intended difficulty;
- intended cognitive level.

K2 must not label generated/authored content as empirically calibrated difficulty.

Observed difficulty, discrimination, distractor efficiency, response-time models and IRT-style parameters belong to later evidence/psychometric programmes.

Historical provisional migration values must not be silently rewritten.

## 14. Bilingual authoring and equivalence

A QuestionFamily has one canonical pedagogical intent, reasoning model and evidence lineage.

Arabic and English are sibling item variants, not unrelated content paths.

Bilingual review must verify at least:
- learning intent equivalence;
- correct-answer equivalence;
- reasoning equivalence;
- distractor logic equivalence;
- terminology;
- accuracy;
- locale conventions;
- audience appropriateness;
- layout/markup where relevant.

K2 may use MQM-style analytic categories and automated semantic/translation signals.

No single automatic metric can override a failed critical semantic dimension.

Human-labeled Arabic/English gold sets are required to calibrate automatic checks and monitor drift.

## 15. Quality sampling

Quality is multidimensional and cannot collapse to one opaque score.

The K2 stack uses:
- deterministic full checks where feasible;
- model/AI critics as supporting evaluators;
- evidence/correctness validation;
- human-labeled gold sets;
- risk-based human review;
- production failure feedback into future eval sets.

Critical failures cannot be averaged away by a good aggregate score.

## 16. Content release topology

K2 expansion occurs as immutable controlled releases/tranches, not one giant 14k release.

Capacity checkpoints such as 3k / 6k / 10k / 14k+ are planning markers only.

Each promoted release must bind exact compatible:
- item versions;
- policies;
- source/evidence versions;
- exam-profile compatibility;
- release metadata.

Released ItemVersions remain immutable.

## 17. ActivationEvidence

K2 defines a versioned ActivationEvidence contract for CANARY→ACTIVE decisions.

Logical fields include:
- activation_evidence_id;
- release_id;
- tranche_id;
- content hash;
- quality policy version;
- review policy version;
- calibration policy versions;
- provider evaluation references;
- coverage delta;
- duplicate findings;
- evidence/correctness summary;
- bilingual summary;
- accessibility/fairness summary;
- human-review summary;
- runtime/regression verification;
- canary exposure/observation summary;
- critical alerts/blockers;
- evidence sufficiency status;
- decision;
- actor/approver;
- created_at.

Allowed decisions:
- PROMOTE;
- HOLD;
- REVISE;
- QUARANTINE;
- ROLLBACK.

An arbitrary string such as `quality:pass` is insufficient evidence for K2 promotion.

## 18. CANARY policy

CANARY is required before ACTIVE.

CANARY exposure size/duration is not globally fixed.

Promotion requires representative evidence for the risks being tested.

The system must be able to HOLD when:
- evidence volume is insufficient;
- a required metric is not yet mature;
- critical signals conflict.

Failure may:
- quarantine the release;
- quarantine selected families/items where safe;
- select a prior compatible release;
- trigger new review/calibration work.

Feature flags may control exposure or act as an emergency kill switch, but they do not replace immutable release history.

Experiments are used only when testing a causal hypothesis, not merely as a deployment mechanism.

## 19. Rollback and quarantine

Rollback selects a prior compatible immutable release. It does not rewrite the failed release.

Quarantine may operate at:
- release;
- tranche;
- family;
- item-version

where the compatibility model safely supports it.

Every rollback/quarantine event records:
- from/to targets;
- reason;
- actor;
- timestamp;
- triggering evidence;
- follow-up requirement.

## 20. Calibration policy boundary

Operating values must be versioned policy/configuration, not hidden business-logic constants.

This includes:
- tranche min/max/requested count;
- provider promotion thresholds;
- review sampling rates;
- semantic duplicate thresholds and gray zones;
- bilingual metric thresholds;
- canary minimum evidence/exposure/duration;
- anomaly/alert thresholds;
- analytics retention periods;
- experiment guardrails.

Each calibration policy records:
- policy_id/version;
- scope;
- evidence basis;
- effective_from;
- observed calibration data references;
- owner/approver;
- reconsideration trigger;
- rollback condition where applicable.

## 21. Measurement, observability and improvement loop

K2 establishes the foundation needed to measure:
- system health;
- factory performance;
- release quality;
- product/UX usage;
- later learner outcomes.

These domains remain distinct.

### 21.1 System signals
Examples:
- API/runtime latency;
- error rates;
- offline/recovery failures;
- sync failures;
- provider latency/failures;
- job retry/failure rates.

### 21.2 Factory signals
Examples:
- candidates requested/generated;
- stage pass/fail/abstain rates;
- duplicate rate;
- evidence failure rate;
- bilingual failure rate;
- review queue time;
- approval yield;
- canary promotion/quarantine rate.

### 21.3 Product/UX signals
Examples:
- mode/feature discovery;
- funnels;
- abandonment;
- completion;
- return usage;
- session/replay-derived friction;
- feature adoption;
- feedback.

### 21.4 Learning signals
K2 preserves hooks only. Learner intelligence belongs to K3+.

Engagement metrics must not be treated as proof of learning.

## 22. Event governance

Analytics/product events must be versioned contracts rather than ad-hoc event strings.

Each event definition should identify:
- stable event name/version;
- purpose;
- owner;
- trigger semantics;
- required/optional properties;
- privacy classification;
- retention policy class;
- producer/client;
- schema;
- compatibility/migration rules.

Product analytics backends are adapters. They do not become the canonical learner model.

Caliper may be supported as an external learning-event adapter later.

## 23. Reuse-before-build

K2 must not rebuild mature commodity systems without demonstrated need.

Candidate capabilities to reuse behind adapters include:
- product analytics;
- funnels/retention/paths;
- session replay;
- feature flags;
- experimentation;
- generic anomaly detection;
- traces/metrics/logging;
- AI/agent trace viewers;
- human review UI.

Relevant standards/tools may include:
- OpenTelemetry for technical telemetry portability;
- OpenFeature for feature-flag portability;
- QTI for assessment exchange;
- CASE for competency exchange;
- Caliper for learning-event exchange;
- Snowplow-style tracking contracts/event governance;
- PostHog/Statsig/Amplitude-style product analytics;
- Langfuse/Phoenix/Braintrust/vendor eval systems for AI evaluation.

The core must remain portable if any vendor is replaced.

## 24. Improvement findings and future agent boundary

K2 defines an improvement-finding concept suitable for future human or agent consumers.

A finding should distinguish:
- observed signal;
- evidence;
- scope/cohort;
- confidence/uncertainty;
- suspected cause/hypothesis;
- counter-evidence;
- proposed investigation;
- proposed experiment;
- expected impact;
- owner/status.

Future agents/scouts may:
- detect anomalies;
- correlate evidence;
- rank investigation candidates;
- generate hypotheses;
- recommend experiments.

They may not autonomously:
- change production behavior;
- promote content;
- rewrite source truth;
- declare causality from correlation;
- convert engagement into readiness/mastery truth.

Canonical improvement loop:

`Observe → Evidence → Hypothesis → Review → Experiment → Measure → Decision → Rollout/Rollback → Observe`

## 25. Privacy and Saudi deployment boundary

Analytics and observability must follow purpose limitation and data minimization.

Where Saudi PDPL applies, deployment must support:
- transparency/privacy-policy obligations;
- appropriate consent/legal-basis handling;
- minimum necessary personal data;
- retention/destruction policy;
- processing records;
- confidentiality/integrity/availability safeguards.

Architecture requirements:
- analytics events carry purpose/privacy classification;
- optional product analytics remains distinct from core learning evidence;
- anonymous/local-first paths remain available where practical;
- replay/telemetry must be configured to avoid unnecessary personal/sensitive capture;
- retention is per data class/policy rather than indefinite global retention;
- cross-border processing/export requires separate deployment/legal review.

Exact legal text, retention periods and cross-border configuration are deployment policy, not hard-coded K2 constants.

## 26. Failure handling

A stage failure must:
- preserve already durable successful siblings;
- identify the exact failed stage;
- classify retry eligibility;
- avoid falsely reporting full success;
- retain audit/provenance context.

A failed tranche may be PARTIAL without corrupting approved historical content.

If a provider/evaluator is unavailable:
- deterministic/manual paths remain valid where supported;
- the system may abstain/hold rather than guessing.

## 27. Persistence and scalability

K2 remains a modular-monolith programme.

Do not introduce:
- microservices;
- queues;
- distributed workers;
- a remote vector database;
- a warehouse/lakehouse

unless measured need justifies them.

Existing file/JSONL/SQLite adapters remain useful local/reference implementations.

Future Postgres/object-store/queue adapters remain possible through existing ports.

## 28. Public/private boundary

Private factory artifacts must remain outside public browser deployment unless explicitly intended for public use.

Do not ship:
- hidden reviewer metadata;
- provider credentials;
- private source notes;
- administrative audit records;
- unused protected holdout inventory;
- internal calibration data

to public static artifacts.

Content intentionally delivered to a learner must still be treated as capturable; K2 must not make false secrecy claims.

## 29. Compatibility

K2 must preserve the current learner-visible baseline until a governed release is intentionally promoted.

Protected compatibility includes:
- stable IDs;
- runtime contracts;
- StateV2 behavior;
- current exam-profile semantics;
- Arabic/English behavior;
- offline/service-worker guarantees;
- browser/API parity;
- assessment snapshots already started;
- historical learner evidence.

Changes requiring migration must use explicit versioned migrations.

## 30. K2 logical new contracts

The implementation plan may refine names, but K2 is expected to introduce contracts equivalent to:
- ExpansionPlanV1;
- TranchePlanV1;
- ProviderRoutingPolicyV1;
- ReviewCalibrationPolicyV1;
- DedupCalibrationPolicyV1;
- BilingualEquivalenceReportV1;
- ActivationEvidenceV1;
- CanaryPolicyV1;
- EventDefinitionV1;
- ImprovementFindingV1;
- ExperimentRecordV1 or equivalent;
- CalibrationPolicy metadata shared shape where useful.

Do not create a contract when an existing K1 contract can be extended compatibly without ambiguity. Any extension must be versioned if it changes interpretation.

## 31. Testing requirements

K2 implementation must include tests for:
- no count-only expansion;
- expansion-plan determinism for the same inputs/policies;
- adaptive tranche policy bounds;
- provider-routing policy and fallback;
- exact/structural/semantic duplicate behavior;
- REVIEW_REQUIRED gray zones;
- bilingual critical-dimension failure;
- review calibration/risk escalation;
- ActivationEvidence completeness;
- CANARY cannot bypass evidence;
- HOLD on insufficient evidence;
- rollback/quarantine immutability;
- event-schema validation/version compatibility;
- privacy-classification requirements;
- vendor-adapter substitution/port behavior;
- partial batch/tranche failure;
- current runtime regression compatibility;
- private factory artifact exclusion from public release.

## 32. Acceptance criteria

K2 is complete only when:
- all approved K2 contracts are implemented and validated;
- coverage-driven adaptive tranche planning exists;
- provider routing/evaluation is policy-controlled;
- multi-layer dedup and bilingual-equivalence gates work;
- risk-based review and calibration policies are enforceable;
- releases require ActivationEvidence through CANARY before ACTIVE;
- rollback/quarantine remain immutable and auditable;
- measurement/event-governance contracts exist;
- generic analytics/telemetry capabilities remain adapter-based;
- current learner-visible runtime compatibility tests pass;
- no psychometric/mastery/readiness claims are introduced;
- implementation ledger/checkpoints are current;
- whole-branch review is complete;
- exact-head CI passes;
- merge is verified;
- post-merge runtime/deployment verification passes.

Raw item count alone can never satisfy K2 acceptance.

## 33. Deferred calibration questions

The following are deliberately deferred to pilot/runtime evidence:
- tranche numeric sizes;
- review sampling percentages;
- duplicate similarity thresholds;
- bilingual metric thresholds;
- canary exposure size/duration;
- alert/anomaly thresholds;
- analytics retention periods;
- final analytics vendor selection;
- source-class approvals for specific future content categories.

These are not missing architecture. They are governed calibration inputs.

## 34. Future programme boundary

K2 must stop before implementing K3 intelligence.

The dependency sequence remains:

`K2 → K3 Learner Evidence Engine → K4 Next-Best-Action/Spaced Practice → K5 Mastery/Readiness → K6 Psychometrics → K7 Grounded Tutor → K8 CAT → K9 Multimodal/Integrations`

K3 begins only after K2 is merged and post-merge verified.

## 35. Governance ruling

K2 adopts the following durable rule:

> **Reuse mature commodity infrastructure through adapters; build and own the education-specific semantics, evidence relationships, lifecycle rules, calibration policies and improvement logic that differentiate the platform.**

K2 therefore expands the platform by measured coverage and controlled releases, not by mass generation, vendor lock-in, or uncalibrated automation.
