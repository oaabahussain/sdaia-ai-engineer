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
| 1 | Expansion unit / coverage planning | QuestionFamilyV2 + CoverageGapV1; raw-count requests invalid | assessment blueprints, competency/coverage systems, CASE alignment patterns | QuestionFamily + objective/misconception CoverageGap remains canonical; CASE is an interoperability/alignment adapter, not internal truth | DECISION_READY |
| 2 | Batch/tranche sizing | resumable partial batches exist | modern content/data batch orchestration and adaptive quality-yield policies | retain K1 LocalRunner and add tranche policy first; workflow-engine adoption requires demonstrated scale/recovery need | PARTIAL |
| 3 | Provider routing/evaluation | provider ports + frozen-set evaluation foundation | OpenAI evals/datasets, Anthropic agent evals, Braintrust, Langfuse, Phoenix | frozen/versioned eval sets + production-failure cases + end-to-end evals; external eval tools are adapters, provider promotion policy stays internal | DECISION_READY |
| 4 | Evidence/source policy | STRICT/GROUNDED/EXPANSIVE; GROUNDED default | NIST AI RMF/GAI profile, retrieval/evidence systems, source-governance patterns | keep versioned source policy/provenance internal; external retrieval/eval systems cannot become authority | PARTIAL |
| 5 | Human review scaling | AI/high-risk/quarantined require human; deterministic may sample | Label Studio-style agent/human evaluation, review queues, active sampling | review UI/tooling may be reused; risk tiers, sampling and approval authority remain internal | PARTIAL |
| 6 | Semantic/cross-lingual dedup | exact + optional embedding cosine; uncertainty -> REVIEW_REQUIRED | pgvector, vector/hybrid systems, multilingual embeddings | lexical + structural + multilingual semantic layers; benchmark pgvector/exact search first; thresholds must be calibrated on labeled bank pairs | DECISION_READY (architecture) |
| 7 | Intended vs observed difficulty | strict separation already constitutional | psychometrics/IRT research and standards | K2 keeps intended only; observed/calibrated remains later | DECISION_READY |
| 8 | CANARY -> ACTIVE evidence | CANARY boundary exists; activation evidence currently minimal | progressive delivery, feature flags, experiments, release health systems | internal ActivationEvidence contract + optional standards-based feature-flag adapter; promotion requires observed evidence, not a string flag | DECISION_READY |
| 9 | Release cadence | immutable releases/rollback exist | Statsig/PostHog/GrowthBook progressive rollout patterns | controlled tranches; feature gates for exposure control and experiments only when causal comparison is needed | DECISION_READY |
| 10 | Rollback/quarantine | release rollback + family/item lifecycle available | OpenFeature/vendor flags, progressive release systems | immutable content rollback remains canonical; feature flags may provide emergency exposure kill-switch, never replace release history | DECISION_READY |
| 11 | Bilingual authoring/equivalence | Arabic/English first-class; semantic equivalence gate | QTI internationalization, multilingual embeddings/evaluation | one canonical family/reasoning/evidence lineage with AR/EN item variants; cross-lingual models assist but do not prove equivalence alone | PARTIAL |
| 12 | Quality sampling / critics / humans | multidimensional QualityReport + conservative review | Anthropic/Phoenix/Langfuse eval patterns, human evaluation tools | deterministic checks + rubric/model graders + human-labeled gold subset; production failures continuously feed eval sets | DECISION_READY |
| 13 | Measurement, observability & improvement loop | LearnerEventV1 + actionable-analytics constitution; no full closed loop yet | PostHog, Statsig, Snowplow Event Studio, OpenTelemetry, Caliper, OpenFeature, AI eval platforms | versioned internal education events + adapters for analytics/replay/experiments/telemetry; future scouts are evidence/hypothesis generators, not autonomous production authority | DECISION_READY (architecture) |

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


## 10. K2 Research Pass 1 — 2026-09-28

This pass refreshed all thirteen K2 decision areas at architecture level. It does **not** choose every vendor, numeric threshold or sampling percentage; those remain policy/configuration decisions that require project-specific calibration.

### 10.1 Coverage and interoperability

- CASE 1.1 standardizes exchange of competencies, standards and learning outcomes across systems. This supports preserving our stable internal objective/competency identities while using CASE only as an adapter/alignment format.
- QTI 3 standardizes assessment-item/test exchange and supports accessibility, bidirectional text, language variants and CAT-related interoperability. Internal JSON remains canonical.
- Caliper provides a standardized learning-activity vocabulary. K3 should map canonical LearnerEvent records to/from Caliper where useful rather than making Caliper the source of truth.

Primary references:
- https://www.1edtech.org/standards/case
- https://www.1edtech.org/standards/qti/index
- https://www.1edtech.org/standards/qti/accessibility
- https://www.1edtech.org/standards/caliper

### 10.2 Provider/model evaluation

Current agent-evaluation practice reinforces the K1 boundary:
- end-to-end agent/application evals are more useful than judging a single prompt/model response in isolation;
- real production failures should feed frozen/versioned evaluation datasets;
- deterministic checks, rubric/model graders and human judgments are complementary rather than interchangeable;
- a newer model/provider is not promoted solely because it is newer.

Candidate reusable tooling includes Langfuse, Phoenix, Braintrust and vendor eval platforms, but K2 must keep the evaluation policy and provider activation decision vendor-neutral.

Primary references:
- https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- https://langfuse.com/docs/evaluation/experiments/datasets
- https://arize.com/docs/phoenix/evaluation/llm-evals/evaluator-traces

### 10.3 Evidence and AI risk

NIST AI 600-1 remains a useful cross-sector reference for incorporating trustworthiness/risk considerations into generative-AI design, development, use and evaluation. It supports evidence, monitoring and lifecycle governance but does not define our approved SDAIA source classes; that classification remains a project-specific evidence-policy task.

Reference:
- https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence

### 10.4 Human review

Modern human-evaluation tools increasingly support agent traces, intermediate decisions and multimodal outputs, reinforcing that reviewers need context rather than a final-output-only screen. K2 can reuse review UI/tooling later, but reviewer authority, risk class, sampling policy and approval lineage remain platform contracts.

Reference:
- https://labelstud.io/blog/new-evaluation-engine/

### 10.5 Deduplication and bilingual semantics

Findings:
- pgvector supports exact nearest-neighbor search plus HNSW/IVFFlat approximate indexes. Approximate indexes trade recall/resources/speed, and 2026 changelogs show real HNSW/IVFFlat operational fixes; therefore adding ANN infrastructure is not a free win.
- multilingual embeddings can compare semantically similar text across languages, including Arabic↔English.
- embedding similarity is a signal, not a duplicate truth predicate.

K2 direction:
1. normalized exact fingerprint;
2. structural family/objective/reasoning comparison;
3. lexical near-match;
4. AR↔AR / EN↔EN semantic match;
5. AR↔EN cross-lingual match;
6. REVIEW_REQUIRED gray zone.

Do not hard-code a universal cosine threshold. Build a labeled duplicate/non-duplicate calibration set from our own bank.

References:
- https://github.com/pgvector/pgvector
- https://www.sbert.net/examples/sentence_transformer/training/multilingual/README.html
- https://docs.cohere.com/docs/semantic-search-with-cohere

### 10.6 Canary, release, experiment and rollback

Modern systems distinguish **exposure control** from **causal experimentation**:
- feature gates/flags control progressive exposure and emergency disabling;
- experiments compare variants and quantify effects;
- multi-stage rollouts need special analysis handling, especially after rollback.

OpenFeature provides a vendor-neutral flag-evaluation API and remote-evaluation protocol direction. Therefore K2 should not invent a vendor-locked feature-flag API.

K2 direction:
- immutable ContentRelease remains the source of truth;
- ActivationEvidence controls CANARY→ACTIVE;
- feature flag adapter can control who is exposed;
- experiment is used only when we are testing a hypothesis, not merely deploying;
- rollback selects prior compatible immutable release; kill-switches may stop exposure but do not rewrite release history.

References:
- https://docs.statsig.com/guides/featureflags-or-experiments
- https://docs.statsig.com/feature-flags/conditions
- https://openfeature.dev/docs/reference/intro/
- https://openfeature.dev/specification/sections/flag-evaluation/

### 10.7 Analytics/event governance and improvement loop

Current event-data systems have moved from loose event names toward versioned tracking contracts:
- Snowplow Tracking Plans/Event Specifications define event meaning, ownership, schema and triggering rules;
- validation can compare live incoming events against the exact declared specification version;
- multiple event-spec versions may coexist during rolling deployments.

This maps strongly to our stable/versioned-contract philosophy.

K2 direction:
- versioned event definitions are canonical;
- events include owner/purpose/privacy classification;
- schema validation occurs before treating analytics as trusted;
- raw event data is distinct from derived funnels/mastery/readiness;
- product analytics tooling is an adapter, not the canonical learner model.

References:
- https://docs.snowplow.io/docs/event-studio/tracking-plans/
- https://docs.snowplow.io/docs/event-studio/tracking-plans/event-specification-validation/
- https://www.1edtech.org/standards/caliper

### 10.8 Observability and product-intelligence tooling

PostHog's current stack demonstrates that product analytics, replay, feature flags, experiments, AI observability and automated scouts can already be bought/reused instead of rebuilt. Its Replay Vision experience also provides a useful guardrail: broad AI scanning can generate plausible but low-value summaries; narrow scanners tied to specific questions are more useful.

OpenTelemetry remains the preferred portability seam for backend/system telemetry, but its JavaScript documentation still marks browser client instrumentation as experimental while traces/metrics are stable and logs are development.

K2 direction:
- do not rebuild generic funnels, replay, flags, experiment engines or trace viewers;
- instrument our education-specific events/contracts and export them;
- start scouts narrow (e.g. mobile-friction, Arabic-equivalence, mock-abandonment, review-discovery);
- scouts produce evidence-backed findings/hypotheses for human review, not autonomous product changes.

References:
- https://posthog.com/docs/product-analytics
- https://posthog.com/replay-vision
- https://posthog.com/blog/a-scanner-that-watches-everything-sees-nothing
- https://opentelemetry.io/docs/languages/js/

## 11. Open decisions after Pass 1

The following are intentionally **not** treated as solved:

1. exact tranche/batch sizing rule — requires observed factory yield/review throughput;
2. approved source-class list for each SDAIA content category — requires source-by-source evidence review;
3. human-review percentages by risk tier — requires pilot error/yield evidence;
4. dedup similarity thresholds — requires labeled bank calibration;
5. bilingual equivalence rubric/judge combination — requires an Arabic/English gold set;
6. exact CANARY duration/sample/exposure thresholds — requires deployment/usage evidence;
7. initial analytics vendor commitment — PostHog is a strong current candidate, but adapter-first architecture prevents lock-in;
8. exact privacy/consent/retention rules — must be designed against deployment jurisdiction, collected fields and product account model.

These remain open because guessing them now would contradict the evidence-first rule.
