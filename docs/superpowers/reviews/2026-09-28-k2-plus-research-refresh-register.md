# K2+ Research Refresh Register — Reuse Before Build

**Date:** 2026-09-28  
**Status:** Active research register for K2 design and later programmes  
**Base:** `main@6eb108338857dec9471f441a37d1819b98045cbb`  
**Rule:** Research and compare before building. Commodity capabilities should be adopted through ports/adapters when suitable; the platform should build only education-specific semantics, policies, contracts and differentiated behavior.

## 1. Purpose

This register prevents the platform from rebuilding mature external capabilities from scratch and prevents old research from being forgotten.

For every material design point:
1. recover previous project research and rulings;
2. inspect the current repository and constraints;
3. refresh current primary/vendor/standards evidence;
4. inspect independent implementations and failure history;
5. inspect user complaints and demand signals where useful;
6. identify counter-evidence and lock-in/operational risks;
7. decide **reuse / adapt / build / defer**;
8. record the decision, evidence limitations and reconsideration trigger;
9. only then allow the point into an approved spec/plan.

Community evidence is used for discovery and failure signals, not prevalence claims.

## 2. Decision states

- **RECOVERED** — previous project decision/research is durable and still in scope.
- **REFRESH_REQUIRED** — prior decision exists but current market/version evidence must be refreshed.
- **RESEARCHING** — active current evidence pass.
- **DECISION_READY** — applicable evidence gate passed for design use.
- **PARTIAL** — useful direction exists but a material uncertainty remains.
- **DEFERRED** — deliberately belongs to a later programme.
- **SUPERSEDED** — older idea replaced by a newer durable decision.

## 3. K2 design research register

| # | Decision point | Prior project state | Current systems/standards to compare | Initial reuse direction | Status |
|---:|---|---|---|---|---|
| 1 | Expansion unit / coverage planning | QuestionFamilyV2 + CoverageGapV1; raw-count requests invalid | assessment blueprints, competency/coverage systems, CASE alignment patterns | preserve internal coverage engine; borrow standards/alignment semantics, not vendor data model | REFRESH_REQUIRED |
| 2 | Batch/tranche sizing | resumable partial batches exist | modern content/data batch orchestration and adaptive quality-yield policies | build thin policy above K1 runner; do not build a new workflow engine without need | REFRESH_REQUIRED |
| 3 | Provider routing/evaluation | provider ports + frozen-set evaluation foundation | OpenAI evals/datasets, Anthropic agent evals, Braintrust, Langfuse, Phoenix | reuse evaluation/trace tooling where useful; keep canonical provider policy internal | RESEARCHING |
| 4 | Evidence/source policy | STRICT/GROUNDED/EXPANSIVE; GROUNDED default | NIST AI RMF, retrieval/evidence systems, source-governance patterns | keep policy internal; reuse retrieval/eval infrastructure only | REFRESH_REQUIRED |
| 5 | Human review scaling | AI/high-risk/quarantined require human; deterministic may sample | Label Studio/Argilla-style review, AI review queues, active sampling | adapt mature review tooling if needed; keep risk policy internal | REFRESH_REQUIRED |
| 6 | Semantic/cross-lingual dedup | exact + optional embedding cosine; uncertainty -> REVIEW_REQUIRED | pgvector, Qdrant hybrid search, multilingual embeddings, clustering/dedup systems | no dedicated vector DB by default; benchmark Postgres/adapter first; hybrid lexical+semantic | RESEARCHING |
| 7 | Intended vs observed difficulty | strict separation already constitutional | psychometrics/IRT research and standards | K2 keeps intended only; observed/calibrated remains later | DECISION_READY |
| 8 | CANARY -> ACTIVE evidence | CANARY boundary exists; activation evidence currently minimal | progressive delivery, feature flags, experiments, release health systems | define education-specific ActivationEvidence; reuse release/experiment tooling | RESEARCHING |
| 9 | Release cadence | immutable releases/rollback exist | PostHog/Statsig/GrowthBook progressive rollout patterns | controlled tranches + flags/experiments where learner-facing exposure changes | RESEARCHING |
| 10 | Rollback/quarantine | release rollback + family/item lifecycle available | feature flags, release rollback, content moderation/quarantine workflows | reuse kill-switch/flag mechanism; keep immutable release semantics internal | REFRESH_REQUIRED |
| 11 | Bilingual authoring/equivalence | Arabic/English first-class; semantic equivalence gate | multilingual evaluation, translation-QA, cross-lingual embeddings | use external model/eval providers behind ports; canonical reasoning/evidence remains internal | REFRESH_REQUIRED |
| 12 | Quality sampling / critics / humans | multidimensional QualityReport + conservative review | model graders, agent evals, human calibration, active sampling | combine deterministic gates + calibrated model graders + human gold subset | RESEARCHING |
| 13 | Measurement, observability & improvement loop | LearnerEventV1 + actionable-analytics constitution; no full closed loop yet | PostHog, Statsig, Amplitude, Snowplow Event Studio, OpenTelemetry, Grafana Faro, Sentry, Langfuse/Phoenix | do not build commodity analytics/replay/experimentation/tracing; build education event semantics + improvement policy | RESEARCHING |

## 4. Point 13 — current 2026 evidence snapshot

### Reuse candidates

**Product analytics / replay / experiments**
- PostHog currently exposes product analytics, session replay, feature flags, experiments, surveys, error tracking, logs, AI observability/evaluations, workflows, Replay Vision and self-driving capabilities.
- Statsig combines experimentation, feature flags, product analytics and session replay with experiment/flag context.
- Amplitude remains a mature option for funnels, retention, paths/journeys, feature engagement and experiments.

**Tracking contracts / data quality**
- Snowplow Event Studio supports versioned schemas, tracking plans, event specifications, ownership, validation and data-quality monitoring. In 2026 it added event-specification validation and per-version/application visibility.
- This directly supports our rule that analytics events must be versioned contracts, not ad-hoc strings.

**Technical observability**
- OpenTelemetry JS: traces and metrics are stable; logs are still development; browser client instrumentation remains experimental.
- Grafana Faro is a mature browser RUM option for performance/errors/logs/traces when deeper technical frontend observability is needed.
- Sentry remains a strong error/replay option where debugging depth is the primary need.

**AI/agent observability/evals**
- Anthropic's 2026 agent-eval guidance emphasizes end-to-end evals and production failure-derived eval sets.
- OpenAI provides datasets, graders and eval-driven development workflows, but platform product/deprecation boundaries must be checked before binding core architecture.
- Langfuse/Phoenix/Braintrust remain candidates for provider-neutral traces/evals when K7+ agent complexity justifies another subsystem.

### K2 architectural direction for Point 13

Canonical internal layer:
- versioned event taxonomy;
- education-specific event semantics;
- privacy/data-minimization policy;
- event ownership and schema validation;
- linkage among content release, item/family/objective, session/form and learner event;
- factory/release/system metrics;
- hypothesis/experiment/decision records;
- improvement finding contract;
- agent-consumption read interface.

Commodity capabilities should remain adapters:
- product analytics;
- funnels/retention/paths;
- replay;
- feature flags;
- A/B experimentation;
- generic anomaly detection;
- traces/metrics/logs backends;
- generic AI trace viewers.

### Improvement-agent guardrail

Future agents/scouts may:
- detect anomalies;
- correlate evidence;
- rank investigation candidates;
- generate hypotheses;
- recommend experiments.

They must not silently:
- change production behavior;
- promote content;
- rewrite source truth;
- declare causality from correlation;
- treat engagement as learning outcome.

The control loop is:

`Observe -> Evidence -> Hypothesis -> Review -> Experiment -> Measure -> Decision -> Rollout/Rollback -> Observe`.

## 5. Cross-programme research queue

### K3 — Learner Evidence Engine
Research before design:
- event stores and append-only/event-sourcing patterns;
- xAPI vs Caliper vs custom canonical internal events;
- identity resolution and anonymous/local-first analytics;
- privacy/consent/retention;
- data warehouse/lakehouse need triggers;
- event schema governance and migration;
- offline event queues/idempotency/conflict reconciliation;
- learner-event query/index patterns.

### K4 — Next-Best-Action / Spaced Practice
Research before design:
- FSRS and current spaced-repetition algorithms;
- contextual bandits/recommenders where appropriate;
- prerequisite/knowledge graph sequencing;
- explainable recommendation patterns;
- cold-start and sparse-data behavior;
- user-control and scheduler-complexity UX.

### K5 — Mastery & Readiness
Research before design:
- Bayesian Knowledge Tracing / Deep Knowledge Tracing / alternatives;
- uncertainty-aware mastery models;
- calibration and drift;
- evidence aggregation without double-counting exposure;
- readiness validity and explainability;
- model versioning/recomputation.

### K6 — Psychometric Calibration
Research before design:
- classical test theory;
- IRT/Rasch families;
- distractor analysis;
- response-time models;
- DIF/fairness;
- minimum sample/evidence requirements;
- item exposure and drift;
- current assessment standards and reproducible psychometric tooling.

### K7 — Grounded Pedagogical AI Tutor
Research before design:
- RAG/grounding architectures;
- tutor pedagogy/scaffolding/Socratic behavior;
- tool-using agents;
- model routing;
- agent tracing/evals;
- prompt-injection/content-safety boundaries;
- hallucination/abstention;
- production failure-derived evaluation sets;
- privacy and learner-data boundaries;
- deterministic/manual fallback.

### K8 — Adaptive Assessment / CAT
Research before design:
- QTI CAT and current CAT standards;
- item selection algorithms;
- stopping rules;
- exposure control;
- content balancing;
- calibration prerequisites;
- security and fairness;
- simulation before production.

### K9 — Multimodal & Ecosystem
Research before design:
- QTI 3;
- CASE 1.1;
- Caliper/xAPI;
- LTI;
- accessibility for multimodal content;
- speech/voice/video agent interfaces;
- import/export provenance;
- LMS integration and auth boundaries.

## 6. Cross-cutting platform research queue

These decisions span several programmes and receive their own evidence passes before implementation:
- event governance / tracking plans;
- feature flags and experimentation;
- privacy/consent/data minimization;
- observability and alerting;
- identity/auth/RBAC;
- offline/local-first synchronization;
- backup/restore/disaster recovery;
- dependency/SBOM/supply-chain security;
- accessibility/WCAG updates;
- localization/RTL/bilingual QA;
- data stores: SQLite/Postgres/vector/search/object storage and scale triggers;
- queues/workers/schedulers and when not to add them;
- agent protocols/MCP/tool permissions;
- secret management;
- CI/CD/progressive delivery;
- cost/latency/resource observability;
- repository/commercial due-diligence readiness.

## 7. Current standards/reuse signals

- 1EdTech **QTI 3**: assessment/test/item exchange and results interoperability.
- 1EdTech **CASE 1.1**: competency/learning-standard exchange and stable alignment identifiers.
- 1EdTech **Caliper Analytics**: learning-activity vocabulary and cross-system analytics.
- **OpenTelemetry**: vendor-neutral traces/metrics/logs semantics; browser instrumentation maturity must be checked before depending on it.
- **Snowplow Event Studio**: tracking plans, event schemas, versioning, validation and tracking-data observability.
- **OpenFeature** should be evaluated before inventing a feature-flag API.
- **WCAG 2.2** remains the current W3C Recommendation baseline at this date.
- **NIST AI RMF / GAI Profile** remains a useful AI risk/evaluation governance reference, while noting the AI RMF itself is under revision in 2026.

## 8. Anti-rebuild rule

Before adding any new infrastructure dependency or subsystem, the active plan must answer:
1. Is this a differentiated education capability or commodity infrastructure?
2. What mature standards/products/open-source implementations already solve it?
3. Can we use an adapter/port instead of owning the subsystem?
4. What are the lock-in, privacy, cost, reliability and export risks?
5. What fails in real deployments?
6. What does the user-facing evidence say?
7. What would cause us to reconsider the choice?

If these answers are missing, the design point remains open.

## 9. Research execution order

1. Complete the 13 K2 points before K2 written-spec approval.
2. Within each point, prioritize decisions that constrain interfaces or irreversible data shape.
3. Run a counter-evidence/failure pass before declaring DECISION_READY.
4. Preserve evidence in dated research artifacts rather than chat only.
5. Do not research K3-K9 deeply enough to delay K2, but keep the queue explicit so future programmes never start from zero.
