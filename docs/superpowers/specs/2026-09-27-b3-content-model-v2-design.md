# B3 — Content Model v2 / Stable Domain IDs — Design

**Date:** 2026-09-27  
**Status:** Proposed written design — awaiting user review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Base:** `main@0f0fe756181a6409de7ab0424e6da4e38603628b`  
**Programme:** B3 — Content Model v2 / Stable Domain IDs

## 1. Intent

B1 separated track presentation from platform code. B2 made track discovery and selection registry-driven.

B3 removes the next structural coupling: current human-readable domain labels are still used as identifiers in exam-profile weights, concept bundles, rendered questions, tests, validation and runtime lookup.

Examples today:

- `"MLOps / LLMOps"`
- `"Data / ML / Evaluation"`
- `"Responsible AI / Security / Governance"`

These strings are presentation/content labels, not durable identifiers. Renaming one currently risks breaking weighting, domain filtering, analytics and future multi-track portability.

B3 introduces stable domain IDs and an explicit versioned content model while preserving learner progress and current question identity.

Core principle:

> **Identity is stable data; labels are presentation.**

## 2. B2 baseline

B3 starts only from the merged B2 baseline:

`main@0f0fe756181a6409de7ab0424e6da4e38603628b`

Post-merge evidence:

- GitHub Pages run 18 / `36306781695`: SUCCESS.
- Server/adapter run 518 / `36306781690`: SUCCESS.
- Track registry production count: 1.
- Default track: `sdaia-ai-engineer`.

B3 must not reconstruct or modify B2 registry semantics except where required to recognize the new content-model capability.

## 3. Success criteria

B3 succeeds when:

1. All seven SDAIA domains have stable machine IDs.
2. Human-readable English/Arabic labels remain presentation data.
3. Exam weights are keyed by stable domain IDs.
4. Concept documents identify their domain by stable ID.
5. Rendered questions expose stable domain identity explicitly.
6. Question IDs and family IDs remain unchanged.
7. The generated 1,120-question educational payload remains behaviorally equivalent; existing deterministic answer/distractor ordering must not drift unintentionally.
8. The 200-question weighted profile produces numerically identical allocation by logical domain.
9. Existing StateV2 learner progress/history remains readable without loss.
10. Old B1/B2 fixtures can be migrated/read through explicit compatibility adapters.
11. Validators reject dangling, duplicate or unknown domain references.
12. Browser, API, offline, SQLite, Pages and live release remain green.
13. B3 stops before Question Factory v2 or large-scale question generation.

## 4. Current identity problem

Today one string serves multiple jobs:

```text
"MLOps / LLMOps"
  ├─ exam-profile weight key
  ├─ concept document .domain
  ├─ runtime bundle concepts key
  ├─ rendered question .domain
  ├─ domain filter key
  └─ presentation label key
```

This conflates identity and display.

The existing concept IDs already contain durable slug-like prefixes such as:

- `mlops-llmops.*`
- `data-ml.*`
- `core-ai.*`
- `responsible-ai-security-governance.*`
- `ai-software-engineering.*`
- `architecture-infrastructure.*`
- `business-professional-practice.*`

B3 adopts those existing prefixes as canonical domain IDs. This minimizes migration risk and preserves question/family IDs.

## 5. Canonical SDAIA domain IDs

The canonical B3 mapping is:

| Legacy structural key | Stable domain ID |
|---|---|
| `MLOps / LLMOps` | `mlops-llmops` |
| `Data / ML / Evaluation` | `data-ml` |
| `Core AI / Deep Learning / GenAI` | `core-ai` |
| `Responsible AI / Security / Governance` | `responsible-ai-security-governance` |
| `AI Software Engineering` | `ai-software-engineering` |
| `Architecture / Infrastructure` | `architecture-infrastructure` |
| `Business / Professional Practice` | `business-professional-practice` |

These IDs are immutable identifiers once B3 lands.

Changing a label later must not require changing the ID.

## 6. Options considered

### Option A — Keep existing contracts and silently reinterpret current keys

Rejected.

Example: keep ExamProfileV1 and RuntimeBundleV2 but replace label keys with slugs.

Why rejected:

- JSON schema would still validate while semantics change;
- external/browser/API consumers could break silently;
- version numbers would no longer describe behavior;
- migration bugs become difficult to detect.

### Option B — Add aliases while keeping legacy labels as primary identity

Rejected.

Advantages:
- smallest migration.

Problems:
- retains the original structural coupling;
- every consumer must decide whether alias or label is canonical;
- future labels still remain dangerous.

### Option C — Explicit Content Model v2 with versioned affected contracts

**Selected.**

Introduce stable domain identity and bump only contracts whose semantics actually change.

Preserve contracts whose semantics do not need to change.

## 7. Versioning decision

### Preserve unchanged

- **TrackRegistryV1**
- **TrackManifestV1**
- **TrackPresentationV1**
- **StateV2**

### Introduce

- **DomainCatalogV2**
- **ExamProfileV2**
- **RenderedQuestionV2**
- **RuntimeBundleV3**

Reasoning:

- TrackManifestV1 already references exam-profile paths generically and can advertise capability strings.
- TrackPresentationV1 already maps domain keys to labels; its keys can become stable IDs without changing its purpose.
- StateV2 is question-ID/track-ID based and does not require domain labels structurally.
- ExamProfileV1 changes semantic key identity, therefore V2 is justified.
- Rendered question domain identity should become explicit rather than silently changing the meaning of `domain`.
- RuntimeBundleV2 exposes legacy domain-keyed concepts/profile semantics, therefore V3 is justified.

## 8. DomainCatalogV2

### 8.1 Canonical file

Per track:

`tracks/<track-id>/domains.json`

For SDAIA:

`tracks/sdaia-ai-engineer/domains.json`

### 8.2 Schema

`data/schema/domain-catalog-v2.schema.json`

### 8.3 Shape

```json
{
  "schema_version": 2,
  "track_id": "sdaia-ai-engineer",
  "track_version": "2026.09",
  "domains": [
    {
      "id": "mlops-llmops",
      "order": 1,
      "legacy_keys": ["MLOps / LLMOps"]
    }
  ]
}
```

Required domain fields:

- `id`
- `order`
- `legacy_keys`

Contract objects reject arbitrary fields.

### 8.4 Ownership

DomainCatalogV2 owns:

- stable domain identity;
- canonical ordering;
- migration aliases from historical structural keys.

It does **not** own:

- localized labels;
- exam weights;
- content definitions;
- evidence status.

Localized labels remain in TrackPresentationV1.

## 9. TrackManifestV1 integration

TrackManifestV1 remains version 1.

B3 adds capability:

`content-model-v2`

The domain catalog is loaded by conventional package path:

`./tracks/<track-id>/domains.json`

This avoids adding a new field to TrackManifestV1 solely to point to a standardized same-package contract.

The validator requires `domains.json` whenever the capability `content-model-v2` is present.

## 10. ExamProfileV2

### 10.1 Schema

`data/schema/exam-profile-v2.schema.json`

### 10.2 Changes from V1

- `schema_version: 2`
- same identity/evidence/question-count/section-size fields;
- `weights` keys are stable domain IDs only.

Example:

```json
"weights": {
  "mlops-llmops": 18.0,
  "data-ml": 17.3,
  "core-ai": 16.7,
  "responsible-ai-security-governance": 14.7,
  "ai-software-engineering": 14.0,
  "architecture-infrastructure": 12.6,
  "business-professional-practice": 6.7
}
```

The numeric values must be identical to the current profile.

The profile ID may remain:

`sdaia-ai-engineer.project-reference.v1`

because the exam profile's evidence/reference identity has not changed; only its serialization contract changes. If implementation shows that reusing the ID creates ambiguous caching/version semantics, the implementation plan must use a new profile ID and provide an explicit compatibility alias. It must not silently change IDs without evidence.

## 11. Concept document v2

Each canonical concept document changes from:

```json
{ "domain": "MLOps / LLMOps", "concepts": [...] }
```

to:

```json
{ "domain_id": "mlops-llmops", "concepts": [...] }
```

Concept IDs remain unchanged.

Concept terms/definitions/orders remain unchanged.

B3 adds a strict concept-document schema if none currently exists:

`data/schema/concept-document-v2.schema.json`

The validator enforces that every concept file's `domain_id` exists exactly once in DomainCatalogV2.

## 12. TrackPresentationV1

TrackPresentationV1 remains version 1.

Its `domain_labels` keys migrate from human labels to stable domain IDs.

Example:

```json
"domain_labels": {
  "mlops-llmops": "MLOps / LLMOps"
}
```

Arabic continues to map the same ID to the Arabic display label.

Cross-document validation requires every DomainCatalogV2 ID to have a non-empty label in every supported locale, and forbids labels for unknown IDs.

## 13. RenderedQuestionV2

### 13.1 Schema

`data/schema/rendered-question-v2.schema.json`

### 13.2 Identity fields

RenderedQuestionV2 contains:

- existing `id`
- existing `family_id`
- existing `track_id`
- new explicit `domain_id`

It removes structural dependence on legacy `domain`.

All other question payload fields remain equivalent.

Question IDs and family IDs are frozen.

## 14. Deterministic generation compatibility

Current question generation seeds randomization with the legacy human-readable domain string:

`domain | concept.term | template.order | 20260909`

Changing directly to stable IDs would alter distractor order and canonical answer indexes despite keeping question IDs.

That is not acceptable as an accidental B3 side effect.

### Selected compatibility strategy

During B3, DomainCatalogV2 `legacy_keys[0]` is used as the **v1 generation compatibility seed alias** for existing migrated domains.

The generator receives both:

- canonical `domain_id` for identity/output;
- compatibility seed key for deterministic reproduction.

For current SDAIA content this must preserve:

- question IDs;
- family IDs;
- prompts;
- option arrays;
- correct answer indexes;
- answer-position distribution.

New future domains with no historical key seed from their stable ID.

The migration alias is therefore compatibility metadata, not active identity.

## 15. RuntimeBundleV3

### 15.1 Schema

`data/schema/runtime-bundle-v3.schema.json`

### 15.2 Shape

RuntimeBundleV3 contains:

- `contract_version: 3`
- `track` — TrackManifestV1
- `domains` — DomainCatalogV2
- `exam_profile` — ExamProfileV2
- `concepts` — object keyed by stable domain ID
- `learn`
- `cases`

### 15.3 Browser/API parity

Browser and API adapters must expose the same logical RuntimeBundleV3.

No adapter-specific domain-key translation is allowed after normalization.

## 16. RuntimeBundleV2 compatibility

B3 does not delete the ability to understand B2 fixtures immediately.

A focused compatibility adapter may normalize legacy RuntimeBundleV2 into RuntimeBundleV3 in memory.

Proposed module:

`src/content/contentModelV2.js`

Interfaces:

```js
export function normalizeDomainId(value, domainCatalog);
export function normalizeExamProfile(profile, domainCatalog);
export function normalizeConceptDocuments(docs, domainCatalog);
export function normalizeRuntimeBundle(bundle, domainCatalog);
```

Rules:

- already-V3 input is idempotent;
- V2 legacy labels map only through DomainCatalogV2 `legacy_keys`;
- unknown or ambiguous legacy keys throw;
- normalization never changes question IDs;
- compatibility code is isolated and removable later.

The live production bundle after B3 is V3.

## 17. StateV2 compatibility

StateV2 remains unchanged.

Current active exams/history primarily reference:

- track ID/version;
- exam-profile identity/version;
- question IDs;
- answer/confidence/flag/order maps keyed by question ID.

B3 must not rewrite question IDs.

If any historical summary contains a legacy domain label, preserve it as historical display data; do not destructively rewrite it unless a specific field is proven to be active structural identity.

State migration tests must prove:

- unfinished exams survive;
- answers/confidence/flags/option orders survive;
- history count/order survives;
- multi-track isolation from B2 survives.

## 18. Exam behavior

Exam logic consumes stable IDs after B3.

Functions such as weighted allocation and section filtering remain algorithmically unchanged.

Only keys change.

Acceptance must prove for the canonical profile:

- weight sum remains 100.0%;
- exact numeric weight per logical domain is unchanged;
- 200-question allocation remains:
  - 36
  - 35
  - 33
  - 29
  - 28
  - 25
  - 14
  mapped to the corresponding stable IDs;
- section exams contain only requested `domain_id`.

## 19. Presentation/runtime flow

Target flow:

```text
registry
  ↓
selected track manifest
  ↓
DomainCatalogV2
  ↓
ExamProfileV2 + concept docs v2
  ↓
RuntimeBundleV3
  ↓
question generation with stable domain_id
  ↓
presentation resolves domain_id → localized label
  ↓
exam UI / feedback / analytics
```

No runtime code should need a human-readable domain string to identify a domain.

## 20. Migration artifact

Add:

`data/migrations/sdaia-domain-v1-to-v2.json`

Canonical mapping contains all seven legacy keys → stable IDs.

It is used for:

- compatibility fixture normalization;
- migration assertions;
- deterministic generation compatibility verification.

It is not the primary production identity source; DomainCatalogV2 is.

## 21. Referential-integrity validation

Release/canonical validation must enforce:

1. domain IDs unique;
2. domain orders unique;
3. every legacy key maps to exactly one ID;
4. every ExamProfileV2 weight ID exists in DomainCatalogV2;
5. every domain catalog ID appears in the default exam profile unless explicitly marked non-exam in a future contract;
6. every concept document domain ID exists;
7. exactly one concept document owns each canonical SDAIA domain for current model;
8. every TrackPresentationV1 locale labels every ID;
9. presentation has no unknown domain IDs;
10. every generated RenderedQuestionV2 domain ID exists;
11. every generated question's concept prefix is compatible with its domain ID;
12. migration aliases contain all seven B2 legacy keys and no ambiguous duplicates.

## 22. API/server behavior

`GET /v1/bank?track_id=...` returns RuntimeBundleV3 after B3 for content-model-v2 tracks.

The endpoint path and track-selection behavior remain unchanged.

If backward API compatibility with RuntimeBundleV2 is required by an existing explicit external contract, support must be negotiated through versioned content negotiation or a separate compatibility endpoint. B3 must not silently return mixed V2/V3 semantics under one declared contract version.

Current repository/browser contract tests should be migrated together to V3.

## 23. Offline/service worker

No new large content precache.

Shell additions may include:

- domain catalog if required by bootstrap/runtime shell behavior;
- compatibility module.

Concept chunks remain on-demand.

Offline acceptance must prove:

- registry selection works;
- domains catalog loads/caches as required;
- browser reload works offline;
- labels resolve from stable IDs;
- section/full exam behavior remains equivalent.

## 24. Release and live verification

Live verifier becomes content-model aware.

For each registry track with capability `content-model-v2` it verifies:

- `domains.json`;
- ExamProfileV2;
- concept-domain references;
- presentation label coverage;
- RuntimeBundleV3-compatible content.

Expected concise line:

`live content model: PASS <track>@<version> domains=7 contract=v3`

## 25. Backward-compatibility fixtures

Freeze B2 artifacts as migration fixtures before canonical migration.

Required fixtures include at least:

- B2 exam profile with legacy weight keys;
- B2 concept document form with `domain` labels;
- B2 presentation domain-label keys;
- RuntimeBundleV2 sample;
- current 1,120 generated-question digest or equivalent exact payload assertions;
- StateV2 unfinished/current exam fixture.

B3 acceptance compares legacy fixture meaning against canonical V2/V3 output.

## 26. Question identity and payload boundary

B3 must preserve:

- all 1,120 question IDs;
- all family IDs;
- concept IDs;
- Arabic/English question text;
- Arabic/English options;
- canonical answer index;
- difficulty;
- current generated count.

If any payload difference occurs, it is a B3 failure unless explicitly reviewed and approved as a separate content correction.

B3 is identity migration, not content editing.

## 27. Analytics/future extensibility

Stable domain IDs become the future key for:

- mastery/readiness;
- analytics;
- psychometrics;
- Question Factory v2;
- content coverage;
- adaptive scheduling;
- cross-track reporting.

B3 itself implements none of those systems.

It only creates the durable identity they can safely depend on.

## 28. Error handling

### Unknown stable domain ID

Fail validation/release.

Runtime must not display a guessed label.

### Legacy key with no mapping

Compatibility normalization throws a bounded descriptive error.

### Ambiguous legacy key

Validation fails; no first-match behavior.

### Missing localized label

Release validation fails.

Runtime presentation accessor may still fall back to raw stable ID only as resilience, not as acceptance success.

## 29. Non-goals

B3 does not implement:

- Question Factory v2;
- 14,000-question expansion;
- second production track;
- adaptive scheduling;
- spaced repetition;
- mastery/readiness;
- psychometric/IRT calibration;
- AI tutor;
- explanations overhaul;
- CMS;
- authentication/authorization;
- protected content delivery;
- production backend redesign.

## 30. Testing strategy

Every implementation task uses RED → verify RED → smallest GREEN → verify GREEN → commit → checkpoint.

Acceptance classes:

- DomainCatalogV2 schema;
- legacy-key mapping completeness;
- ExamProfileV2;
- concept-document v2;
- TrackPresentationV1 stable-key coverage;
- RenderedQuestionV2;
- deterministic 1,120 payload equivalence;
- RuntimeBundleV3 browser/API parity;
- RuntimeBundleV2 compatibility normalization;
- StateV2 preservation;
- weighted allocation equivalence;
- section filtering by stable ID;
- registry capability integration;
- offline reload;
- Pages/live validation;
- SQLite/API/browser adapters;
- leakage scan forbidding legacy domain labels as active structural keys.

## 31. Legacy-label leakage policy

After canonical migration, legacy domain labels are permitted only in:

- presentation display values;
- B2 compatibility fixtures;
- migration alias artifact;
- human-facing documentation/tests specifically asserting migration.

They must not remain as active structural keys in:

- canonical exam profile;
- concept document `domain_id`;
- RuntimeBundleV3 concepts keys;
- rendered question identity;
- exam filtering;
- validation maps;
- application state identity.

## 32. Suggested implementation stages

### Stage A — Baseline and frozen compatibility
1. Freeze B2 post-merge baseline.
2. Inventory all active legacy domain-key consumers.
3. Freeze exact B2 domain/profile/question payload fixtures.
4. Add B3 RED acceptance contract.

### Stage B — New contracts
5. DomainCatalogV2 schema + canonical SDAIA catalog.
6. Migration alias map.
7. ExamProfileV2 schema.
8. ConceptDocumentV2 schema.
9. RenderedQuestionV2 schema.
10. RuntimeBundleV3 schema.

### Stage C — Tooling and normalization
11. Domain normalization helpers.
12. Strict cross-document referential validation.
13. RuntimeBundleV2 → V3 compatibility adapter.
14. Deterministic legacy seed compatibility.
15. Migration fixture equivalence tests.

### Stage D — Canonical SDAIA migration
16. Migrate seven concept documents to `domain_id`.
17. Migrate canonical exam profile weights to stable IDs.
18. Migrate presentation label keys to stable IDs.
19. Add manifest capability `content-model-v2`.
20. Preserve all question/family IDs and exact payload.

### Stage E — Runtime
21. RuntimeBundleV3 loader.
22. Browser adapter V3.
23. API/server V3.
24. App domain rendering/filtering via stable IDs.
25. StateV2 unfinished/history compatibility.
26. Feedback/release surfaces remain track/presentation driven.

### Stage F — Offline/release
27. SW/domain-catalog asset rules.
28. Live verifier content-model checks.
29. Pages artifact checks.
30. Browser bilingual/full/section/offline acceptance.

### Stage G — Acceptance/integration
31. Legacy structural-key leakage scan.
32. Whole-suite acceptance.
33. Whole-branch review.
34. PR/CI/merge/post-merge verification.
35. Stop before Question Factory v2.

## 33. Exit criteria

B3 is complete only when:

- all seven current domains use stable IDs canonically;
- legacy labels are no longer active structural identity;
- DomainCatalogV2 is authoritative;
- canonical exam profile uses stable IDs;
- canonical concept docs use `domain_id`;
- presentation labels use stable-ID keys;
- production runtime is RuntimeBundleV3;
- all 1,120 question/family IDs and generated educational payload are unchanged;
- weights and 200-question allocation are equivalent;
- StateV2 learner progress is preserved;
- B2 compatibility fixtures normalize correctly;
- browser/API/offline/Pages/live/SQLite tests are green;
- B3 is merged and post-merge verified;
- implementation stops before Question Factory v2.

## 34. Next boundary

After B3 is merged and verified, the next architectural programme is:

**Question Factory v2**

Only then should large-scale question generation/expansion proceed.
