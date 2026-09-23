# Fresh Audit — Learning Platform vNext Architecture

**Audit date:** 2026-09-23  
**Audit branch:** `review/platform-vnext-fresh-audit`  
**Spec under review:** `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`  
**Spec commit reviewed:** `0c3b2dfe6536b043a9d962c451cbb31b15ce1924`  
**Production baseline reviewed:** `main@362d35c697411d4eddcc4536c843df17161d3374`

## 1. Audit method

This review was intentionally performed outside the design branch.

The rubric was rebuilt from four evidence families rather than reusing the previous coverage checklist:

1. owner requirements: 14,000+ meaningful items, adaptive learning, multi-SDAIA/multi-subject expansion, human + agent use, security, scalability, clean transfer/sale-ready repository, and no unnecessary stack churn;
2. fresh inspection of the current `main` tree and critical runtime/contracts;
3. fresh inspection of prior PR review findings (#3, #4, #5);
4. current external design/security/accessibility evidence used by the architecture.

This is a fresh self-audit in an isolated branch, **not an independent second-agent review**. No reviewer/subagent capability was available in this environment, so no claim of independent-agent confirmation is made.

## 2. Overall result

**Status before corrections: NOT YET DECISION-READY.**

The architecture direction is sound and most major product requirements are covered, but the audit found several material omissions that should be added before owner approval.

### Strongly covered

- 14,000+ meaningful-item target without paraphrase inflation
- competency → objective → concept → misconception → family → variant hierarchy
- Learning / Check / Holdout separation
- adaptive learner model and staged psychometrics
- tutor modes and voice-ready client boundary
- human + agent clients with restricted protected-bank access
- multi-track, multi-subject, multi-version direction
- public vs protected content
- chunked loading and IndexedDB direction
- evidence registry and Exam Intelligence
- content lifecycle and import/export direction
- bilingual Arabic/English and accessibility
- legacy cleanup discipline, migrations, stable IDs, and zero-tribal-knowledge
- transferability/commercial due diligence
- QTI/Caliper-friendly, standards-not-dependent approach
- Programme A isolated as the only first implementation scope

## 3. Material gaps found

### A1 — Security/identity threat model is incomplete — **Critical**

The spec restricts protected content but does not explicitly state that the current anonymous UUID is **not authentication**.

Current evidence:
- `api/openapi.yaml` models `X-Anon-Id` as an API key.
- `src/storage/api.js` stores a client-generated anonymous UUID.
- the current server rate limiter is process-local.
- protected-bank goals require stronger authorization than possession of a client-generated identifier.

Required addition:
- distinguish anonymous identity, authenticated identity, authorization, and administrative roles;
- define a threat model for protected assessment delivery;
- include BOLA/function-level authorization, resource abuse, answer-key leakage, session scraping, replay, and administrative export risk;
- state the residual truth: server-side delivery can reduce exposure but cannot guarantee that a determined learner cannot capture items they are legitimately shown.

### A2 — Multi-track namespace/branding migration is not explicit — **Important**

The product architecture is content-agnostic, but the current technical namespace is still SDAIA-specific:

- repository/site branding
- package name: `sdaia-ai-engineer-study-space`
- storage keys such as `sdaia.state.v1` and `sdaia.anon_id.v1`
- API title and service naming
- hard-coded SDAIA domain labels in the client

Required addition:
- define a neutral platform namespace for future core contracts;
- preserve/migrate old SDAIA storage keys rather than breaking learner progress;
- keep SDAIA as a track/brand surface, not a core namespace;
- preserve an explicit independent/unofficial/no-endorsement presentation requirement for SDAIA content.

### A3 — Release/version integrity needs stronger guarantees — **Important**

The spec versions tracks and schemas, but does not require an active learning/mock attempt to be pinned to the exact content/exam profile versions it started with.

Required addition:
- pin each attempt to track version, content release, exam profile, selected family/item versions, and rendered option order;
- published content releases should be immutable or content-addressed for historical interpretation;
- use manifest/content hashes or equivalent integrity metadata;
- define cache invalidation and atomic shell/content release behaviour so a learner cannot run a new shell against an incompatible old chunk set.

### A4 — Current CI/release hard-codes are broader than the conflict list — **Important**

Fresh inspection found more hard-coded v2 assumptions than the spec names directly:

- `scripts/browser_smoke.py`: 1120 and 200
- `scripts/contract_test.js`: browser 1120 vs API >=121, explicitly preserving contract divergence
- `.github/workflows/pages.yml`: seven concept filenames, exactly 20 concepts each, generated-total arithmetic, service-worker cache `v8`
- README product facts: 1120 and 200

Required addition:
- add these exact locations to Programme A's legacy/conflict inventory;
- future release checks must read the canonical track/exam manifest rather than duplicate product constants.

### A5 — Privacy/data-governance contract is missing — **Important**

The architecture introduces richer learner analytics, optional sync, agent clients, and potential accounts but does not define:

- data classification
- minimum data collection
- telemetry/analytics consent policy
- retention
- learner export
- deletion
- account/identity separation
- sensitive-data prohibition
- privacy documentation ownership

Required addition:
- privacy-by-default and data-minimization rules;
- anonymous/local-first mode remains supported where practical;
- if authenticated sync is introduced, export/deletion/retention behaviour must be explicit before collection begins.

### A6 — The 14,000+ bank needs a coverage matrix, not only a count — **Important**

Question-family quality is defined well, but the spec lacks a bank-composition control.

Required addition:
- coverage targets by competency/objective;
- cognitive level;
- difficulty;
- scenario type;
- Learning/Check/Holdout pool;
- misconception;
- language/review status.

The 14,000 target must be considered healthy only when required coverage cells are satisfied, not merely when the rendered-item count reaches 14,000.

### A7 — Production backend scalability boundary is underspecified — **Important**

The spec says the FastAPI skeleton may evolve, but the current backend uses SQLite and a process-local rate limiter. Those are valid for development/test but are not a horizontally scalable protected assessment service.

Required addition:
- explicitly classify the current server/SQLite/rate-limit setup as development/test scaffolding unless deployment evidence proves otherwise;
- define scale triggers for moving to a shared production datastore and distributed/session-aware rate limiting;
- keep the API/storage interfaces portable so the database can change without rewriting the learning core.

### A8 — Repository governance target is missing — **Important**

Fresh repository inspection shows `main` is currently unprotected.

Required addition:
- target required CI before merge;
- branch protection or an explicitly documented solo-maintainer exception;
- review ownership/CODEOWNERS when additional maintainers exist;
- release/tag policy;
- security/dependency update ownership.

Do not enable restrictive rules blindly during Programme A; document and stage them so owner workflows are not accidentally blocked.

### A9 — Evidence traceability inside the spec is incomplete — **Important**

The spec lists source families but provides no source URLs/IDs or small evidence ledger. This weakens future handoff and makes it harder to re-verify claims.

Required addition:
- an evidence appendix or linked evidence document;
- primary URLs/identifiers;
- claim/evidence mapping;
- verification date;
- unresolved evidence gaps, especially the current SDAIA weight provenance.

### A10 — Operational resilience is only partially covered — **Moderate**

Migration recovery is mentioned, but ongoing operations for future synced/protected services need:

- backup/restore policy
- restore testing
- observability/alerts
- incident-response ownership
- integrity/reconciliation for queued offline events

This can be implemented later, but the architectural requirement should exist now.

### A11 — Content publication governance should record actor and reason — **Moderate**

Content lifecycle is present, but sale/transfer-quality governance benefits from an auditable publication trail:

- author/reviewer/approver identity or role
- change reason
- evidence review status
- publication/retirement timestamp

AI may propose content but cannot be the sole publication authority.

### A12 — Dependency/license evidence should become machine-auditable — **Moderate**

The due-diligence section lists dependency/license ownership, but a future handoff should have a reproducible dependency/license inventory or SBOM-equivalent artifact generated from the actual release.

No new dependency is required merely to satisfy this design; the plan can choose the simplest reliable mechanism later.

## 4. Fresh verification of previously known repository defects

Fresh inspection reconfirmed these defects/hazards:

- browser question path and API question path use incompatible bank shapes;
- `question.schema.json` models only legacy `qN` objects and rejects generated bilingual fields;
- `state.schema.json` is version 1 and disallows current Exam V2 state;
- `sessions.json` remains coupled to `q1..q121`;
- the inline bank contains no usable concept bank while startup expects a large generated bank;
- PR #4 identified the service-worker registration timing race;
- `verify_release.py` still requires >50 KB HTML and exactly 121 inline questions;
- PR #3 identified first-run API anonymous-ID mismatch;
- PR #5 identified the feedback generic-issue path conflict with disabled blank issues;
- current Pages/smoke/contract checks hard-code current v2 structure;
- `main` is currently not branch-protected.

## 5. External evidence sanity check

Fresh current sources still support the architecture's major direction:

- Microsoft separates preparation/practice assessment from exam-sandbox simulation and states practice questions are not the real exam or necessarily representative of full exam length/complexity.
- WCAG 2.2 includes focus-visibility requirements relevant to sticky/fixed UI.
- OWASP API Security Top 10 includes broken authorization, unrestricted resource consumption, broken function-level authorization, and sensitive business-flow abuse; these are directly relevant to a future protected assessment API.

These sources support the direction but do **not** validate SDAIA-specific weights or exact exam format.

## 6. Decision gate

The umbrella architecture can become decision-ready after A1–A9 are incorporated or explicitly deferred with a documented owner decision.

A10–A12 may be staged later, but their architectural obligations should be recorded now.

**Highest-value next step:** amend the design spec from this audit, then run a second mechanical coverage check against the fresh audit before asking for owner approval.
