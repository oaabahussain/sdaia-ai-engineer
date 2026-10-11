# K5–K9 — Initial Standards/Implementations Research Survey

**Date:** 2026-10-08
**Status:** INITIAL_SOURCE_SURVEY_ONLY / NOT_DECISION_READY / NO DESIGN OR CODE APPROVAL
**Input contract:** project roadmap, K2+ refresh register, existing K3 event/evidence primitives and the source URIs below.
**Purpose:** Preserve dated research seeds before deep per-programme analysis, not prematurely choose tools or claim readiness.

## K5 — Mastery and Readiness projections

Primary implementation: University of California/Berkeley associated `pyBKT`, https://github.com/CAHLR/pyBKT — Bayesian Knowledge Tracing library and variants over student problem-solving sequence histories.

**Reuse/gap direction:** compare deterministic evidence aggregation, Bayesian Knowledge Tracing, and more complex deep variants after measuring data sparsity; avoid deep models by default. K3 event correctness, hint use, repeated exposure, family identities and holdout identities must be audited. Require versioned projection and recomputation and uncertainty/small-sample behavior. A learner score is not an official SDAIA certification probability.

**Gate:** no transition to K5 without K4's merged/verified identity, evidence and policy results; no grade/readiness accuracy claim without independent outcomes and leakage checks. Missing at this date: real sample sizes, ground truth and temporal split/evaluation.

## K6 — Psychometric calibration

Maintained reference packages:
- `mirt` (CRAN 1.47, publication date 2026-08-20), https://cran.univ-lyon1.fr/CRAN/web/packages/mirt/refman/mirt.html — unidimensional/multidimensional IRT, multiple-group DIF capabilities.
- `rasch` (CRAN publication date 2026-09-13), https://cran.nics.utk.edu/cran/web/packages/rasch/index.html — a Rasch toolkit; check maintainer version/requirements before adopting.
- ETS guidelines on international test validity/fairness, https://www.ets.org/research/policy_research_reports/publications/publication/2013/jrcs.html — relevant validity/DIF scrutiny, not an exact certification benchmark.

**Reuse/gap direction:** evaluate existing psychometric tools and independent response calibration before writing IRT math. Distinguish authored intended difficulty from observed empirical response statistics, fit, sample-power and identifiable model parameters. Need predeclared thresholds for minimum independent response samples and fairness/fit before calibrated labels. K6 must NOT manufacture calibration from K3 event count alone.

## K7 — Grounded Pedagogical Tutor

Primary risk/evaluation guidance:
- Anthropic 2026 agent evaluation design, https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents — use multi-turn end-to-end tests, deterministic code graders, model/human judges calibrated to frozen sets.
- OWASP GenAI Top 10 **2026** (current canonical guidance), https://genai.owasp.org/initiative/owasp-top-10-for-llm-and-genai/ — prompt injection, unauthorized tool use, sensitive disclosure, supply-chain and model risks.
- NIST AI 600-1 Generative AI Profile (released 2024; NIST AI RMF itself being revised in 2026), https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence .
- UNESCO Generative AI in Education guidance, https://www.unesco.org/ar/articles/guidance-generative-ai-education-and-research — human-centered/age-appropriate and data/privacy posture.

**Reuse/gap direction:** source-backed generation with source/claim provenance, protected test content isolation, untrusted input considered DATA not directives, least-privileged tools and human-requested mode only. User can disable AI; deterministic learning/test path must still work. Need rich negative evals for fabrication of official SDAIA rules, prompt-injected course content, protected answers, privacy and AR/EN equivalence. This is a research seed, not an endorsed vendor/model.

## K8 — Adaptive Assessment / CAT

Primary standards/tools:
- 1EdTech CAT v1.0 specification page, https://www.1edtech.org/standards/cat — **Public Candidate Final**, not a certified, final mandatory standard. It specifies separation/interoperability between test delivery and adaptive engine.
- 1EdTech QTI 3 formal final specification, https://www.1edtech.org/standards/qti/index — test/item interchange and CAT integration features.
- `catR` R (CRAN 3.17 documentation), https://search.r-project.org/CRAN/refmans/catR/html/00Index.html — reference simulation functions, item selection, exposure/content balancing and stopping.

**Reuse/gap direction:** simulate CAT designs against truly calibrated pools using candidate open tools, not an ad hoc algorithm. Test blueprint/domain balance, exposure/security and stopping validity before any real adaptive exam. CAT is **BLOCKED for deployment** until K6 has enough independent empirical calibration, otherwise non-adaptive exam stays available.

## K9 — Multimodal & Ecosystem interoperability

Primary standards:
- 1EdTech QTI 3, https://www.1edtech.org/standards/qti/index — assessment/test/content export.
- 1EdTech CASE 1.1 (final), https://standards.1edtech.org/case/ — competency/standards exchange and identifiers.
- 1EdTech Caliper Analytics 1.2, https://www.1edtech.org/standards/caliper — learning event exchange, not K3 canonical data model.
- IEEE 9274.1.1-2023 (active IEEE xAPI standard), https://ieeexplore.ieee.org/document/10273185 — learning experience data REST/JSON.
- 1EdTech LTI 1.3/LTI Advantage, https://www.1edtech.org/standards/lti — platform/tool integration with OAuth2/OIDC/JWT and roles.
- 1EdTech LTI implementation security, https://standards.1edtech.org/lti/guides/implementation_guide/implementation-guide — explicit credentials/JWT validation.
- W3C WCAG 2.2, https://www.w3.org/TR/WCAG22/ — inclusive UI and multimodal accessibility baseline.

**Reuse/gap direction:** versioned import/export with field/provenance loss reports, identity/access controls, reversible mapping, negative conformance fixtures and permission-safe tools. Use existing K3 xAPI/Caliper mapping seams rather than write a parallel event store. Multimodal clients should consume the core via typed narrow capabilities, not redefine learner truth.

## Open questions / negative findings

- Have not checked all licences, security advisories, package versions, runtime support, R packaging or independent algorithm benchmarks; do not select a dependency yet.
- QTI 3 is **Final**, CASE 1.1 is **Final**, CAT 1.0 is still **Public Candidate Final**. Avoid incorrectly labelling all standards equally mature.
- External research validity is domain-bound; biomedical, math, classroom and language learning effects are not directly an SDAIA certification trial.
- K8 cannot be production-valid merely because the CAT engine executes; calibration validity is a separate gate.
- Production authentication/cross-device sync was not proven by K3. K7/K9 cannot assume a secure production identity provider exists.
- Speech/video modes add privacy/consent and resource constraints; no client library/provider is chosen.

## Next check by programme

For each K5–K9: conduct a fresh, deep, independent evidence and failure-mining pass **when that programme begins**, build an actual Gap Map against its immediate preceding merged code and collect a pilot evidence set. This document is reference retrieval, not completion of those future designs. Apply project's `DECISION_READY` gate before normative spec approval, detailed TDD plan, execution and merge.

**No K4–K9 Product implementation has happened as part of this research survey.**
