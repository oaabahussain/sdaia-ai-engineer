# B1 — Track Presentation Contract Design

**Date:** 2026-09-26  
**Status:** Draft for owner review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Base:** `main@0efae25ba71ca26030bd2471a26cb273bc574826`  
**Programme:** B1 — Track Presentation Contract  
**Scope:** Separate track-specific presentation/localization data from the learning-platform core without introducing track registry, second-track behavior, or new learning-engine features.

## 1. Intent

Programme A stabilized runtime contracts. B0 synchronized governance and added the 2026-09-26 research amendment. The next architectural boundary is presentation.

The platform still violates the governing principle:

> **The track is data; the learning platform is code.**

Runtime contracts are track-driven, but presentation is not yet track-driven.

Track-specific names, bilingual track copy, and domain translations currently live in platform files such as:

- `index.html`;
- `src/app.js`;
- `feedback.html`;
- `manifest.webmanifest`.

B1 will remove that presentation coupling while preserving current SDAIA behavior.

## 2. Current-state findings

### 2.1 Runtime contracts already use track data

Current runtime data is loaded from:

- `tracks/sdaia-ai-engineer/manifest.json`;
- exam profile files;
- concept files;
- learn/cases data.

`RuntimeBundleV2` already returns:

- `track`;
- `exam_profile`;
- `concepts`;
- `learn`;
- `cases`.

### 2.2 Presentation remains coupled to SDAIA

Current examples include:

#### `index.html`

- `<title>SDAIA AI Engineer Practice</title>`
- SDAIA-branded fallback text
- track-specific hero copy embedded in HTML

#### `src/app.js`

- `I18N.ar.brand`
- `I18N.en.brand`
- SDAIA-specific hero text
- `DOMAIN_AR` with seven SDAIA domain translations
- track-specific “unofficial/project-reference” copy mixed into generic UI translations

#### `feedback.html`

- page title and brand embed `SDAIA AI Engineer`
- presentation text is duplicated from the active track context rather than resolved from a track presentation contract

#### `manifest.webmanifest`

- PWA name and short name are SDAIA-specific
- description currently says `Adaptive mobile-first study space...`, but adaptive learning is not implemented

### 2.3 Bootstrap track selection is still intentionally fixed

`src/config.js` currently contains:

`ACTIVE_TRACK_ID = 'sdaia-ai-engineer'`

This is **not** a B1 defect. Track selection/registry belongs to B2.

B1 must not silently expand into track discovery or selection.

## 3. Decision

Use **a separate declarative presentation document per track**.

Canonical convention:

`tracks/<track-id>/presentation.json`

B1 will not:

- embed presentation into `manifest.json`;
- make presentation executable JavaScript;
- introduce `TrackManifestV2`;
- introduce `RuntimeBundleV3` solely for presentation;
- introduce a track registry.

The current `TrackManifestV1` and `RuntimeBundleV2` remain valid.

## 4. Why this design

### 4.1 Rejected approach A — put presentation in `manifest.json`

Advantages:
- one file;
- one fetch.

Rejected because it would mix:
- runtime compatibility;
- content references;
- official/evidence status;
- branding;
- localization;
- UI copy.

That would make the manifest harder to reason about and harder to extend to additional locales.

### 4.2 Selected approach B — `presentation.json`

Advantages:
- data-only;
- independently schema-validatable;
- clean separation from runtime/content contracts;
- localized copy can evolve without changing manifest semantics;
- portable to later registry/authoring workflows;
- supports strict CI and resilient runtime fallback.

### 4.3 Rejected approach C — presentation JavaScript module

Advantages:
- maximum flexibility.

Rejected because it would turn a track package into executable code, weaken validation, complicate security/portability, and make third-party track packages harder to trust.

## 5. TrackPresentationV1

### 5.1 File

`tracks/<track-id>/presentation.json`

### 5.2 Schema

New schema:

`data/schema/track-presentation.schema.json`

### 5.3 Contract shape

Illustrative shape:

```json
{
  "schema_version": 1,
  "track_id": "sdaia-ai-engineer",
  "track_version": "2026.09",
  "default_locale": "ar",
  "locales": {
    "ar": {
      "display_name": "SDAIA AI Engineer",
      "brand": "SDAIA AI Engineer · بنك الاختبارات",
      "hero": {
        "eyebrow": "بنك اختبارات ثنائي اللغة",
        "title": "تدرّب مثل الاختبار، بدون نمط محفوظ للإجابات.",
        "description": "أكثر من ألف سؤال بالعربي والإنجليزي، اختبار كامل موزون، واختبارات مستقلة لكل مجال."
      },
      "domain_labels": {
        "MLOps / LLMOps": "عمليات تعلم الآلة والنماذج اللغوية"
      }
    },
    "en": {
      "display_name": "SDAIA AI Engineer",
      "brand": "SDAIA AI Engineer · Exam Bank",
      "hero": {
        "eyebrow": "Bilingual exam bank",
        "title": "Practice like an exam, without a predictable answer pattern.",
        "description": "More than one thousand Arabic/English questions, a weighted full exam, and standalone domain exams."
      },
      "domain_labels": {
        "MLOps / LLMOps": "MLOps / LLMOps"
      }
    }
  }
}
```

This is illustrative, not permission to add more presentation fields without a B1 design ruling.

## 6. Required fields

`TrackPresentationV1` must require:

- `schema_version = 1`;
- `track_id`;
- `track_version`;
- `default_locale`;
- `locales`.

Each locale entry must require:

- `display_name`;
- `brand`;
- `hero.eyebrow`;
- `hero.title`;
- `hero.description`;
- `domain_labels`.

No arbitrary extra fields should be allowed in v1 unless explicitly added by schema revision.

## 7. Cross-document invariants

For every active track:

```text
presentation.track_id == manifest.id
presentation.track_version == manifest.version
presentation.default_locale ∈ manifest.locales
set(presentation.locales) == set(manifest.locales)
```

Every domain used by the active track/exam profile must have a label in every declared locale.

B1 uses current domain strings as compatibility keys.

Example:

`MLOps / LLMOps`

These are **not** declared to be final stable domain IDs.

Stable domain identifiers belong to B3 — Content Model v2.

## 8. Platform-vs-track translation boundary

B1 must explicitly separate two kinds of text.

### 8.1 Core UI text

Remains in platform code because it is generic across tracks.

Examples:

- Home
- Feedback
- Questions
- Domains
- Full exam
- Resume
- Start
- Weight
- Flag question
- Confidence
- Previous
- Next
- Submit
- Navigation
- Result
- Correct
- Wrong
- Unanswered
- Review answers
- keyboard hints
- generic content-loading errors

These should live in a dedicated generic translation unit such as:

`src/presentation/coreI18n.js`

The exact filename may vary in the implementation plan, but the ownership boundary may not.

### 8.2 Track-specific presentation

Moves to `presentation.json`.

Examples:

- track display name;
- track brand;
- track hero text;
- localized domain labels.

Track presentation must not own generic button labels or generic exam behavior text.

## 9. Evidence-status and truth rules are not presentation

Presentation data must not control factual status claims.

The following remain controlled by canonical runtime/governance data:

- `manifest.official_status`;
- `exam_profile.evidence_status`.

Examples:

If:

`official_status = unofficial-independent`

the UI must surface the appropriate generic localized warning.

If:

`evidence_status = project-reference-unverified`

presentation must not be able to label weights as official.

This prevents track branding data from overriding evidence truth.

## 10. Presentation loader/resolver

B1 introduces a small isolated presentation layer.

Recommended module boundary:

```text
src/presentation/
  coreI18n.js
  trackPresentation.js
```

### 10.1 `trackPresentation.js`

Responsibilities:

- load `tracks/<track-id>/presentation.json`;
- validate enough runtime identity to reject cross-track/cross-version mismatches;
- resolve effective locale;
- return track presentation fields;
- resolve localized domain labels;
- provide safe runtime fallback when loading fails.

It must not:

- select a track;
- load the question bank;
- perform exam logic;
- mutate learner state;
- implement registry behavior;
- implement theming.

### 10.2 `coreI18n.js`

Responsibilities:

- generic platform strings for supported core locales;
- generic official/evidence-status warnings;
- generic feedback-page labels where not track-specific.

It must not contain:

- `SDAIA AI Engineer`;
- SDAIA domain translations;
- SDAIA-specific hero copy.

## 11. Locale resolution

Effective locale is constrained by:

```text
core-supported locales
∩ manifest.locales
∩ presentation.locales
```

B1 does not add new locales.

Current supported locales remain:

- `ar`;
- `en`.

Fallback order:

1. current learner preference if valid;
2. track `default_locale`;
3. platform default locale.

B1 must preserve current RTL/LTR behavior.

## 12. Runtime fallback vs release strictness

B1 adopts:

> **Runtime resilient; release strict.**

### 12.1 Runtime behavior

If presentation cannot be loaded or a display field is unavailable at runtime:

- track display name may fall back to `track.id`;
- domain label may fall back to the canonical current domain key;
- generic core UI must remain usable;
- a diagnostic warning may be logged;
- exam access must not be blocked solely because presentation copy failed.

### 12.2 Release/CI behavior

For an active packaged track, release validation must fail if:

- `presentation.json` is missing;
- schema is invalid;
- track ID mismatches;
- track version mismatches;
- a manifest locale is missing;
- a presentation locale is undeclared;
- a current domain lacks a label in any supported locale.

A release must not intentionally ship a known-invalid active presentation and rely on fallback.

## 13. `index.html` migration

`index.html` becomes a neutral shell.

B1 removes track-specific literals from the platform shell.

After runtime initialization, presentation data supplies:

- document title;
- brand;
- hero eyebrow;
- hero title;
- hero description;
- domain labels.

Generic controls remain platform-owned.

Fallback HTML may use neutral platform placeholders only.

B1 does not redesign the current page.

The current SDAIA user-facing presentation should remain materially unchanged after data migration.

## 14. `src/app.js` migration

B1 removes:

- SDAIA-specific brand/hero strings from the core translation object;
- `DOMAIN_AR`.

The core application should ask the presentation resolver for:

- localized display name/brand;
- hero text;
- domain labels.

Exam logic must remain untouched except for replacing presentation lookups.

B1 must not change:
- question selection;
- weighting;
- scoring;
- state semantics;
- storage;
- exam history;
- confidence behavior;
- offline behavior.

## 15. Domain-label migration

Current domain strings remain compatibility keys for B1.

Every current domain must have both Arabic and English labels in `presentation.json`.

B1 must not rename domain identifiers in:
- concepts;
- exam profile weights;
- learner state;
- analytics data.

Domain-ID normalization is explicitly B3.

## 16. `feedback.html` migration

The feedback page must resolve:

- display name / brand from track presentation;
- generic feedback labels from core translations.

B1 must preserve current feedback behavior:
- public GitHub Issue flow;
- encoded suggestion/contribution/rating text;
- public-data warning;
- current StateV2 language/theme preference handling.

B1 must not create one feedback page per track.

## 17. PWA manifest boundary

`manifest.webmanifest` is a special case because browsers consume it before normal application initialization.

B1 must correct false current claims, including the word `Adaptive` if adaptive learning is not implemented.

B1 does **not** decide the final multi-track PWA install-identity model.

Until B2 resolves platform-vs-track installation semantics, PWA install identity may remain tied to the current active track.

This is an explicit temporary exception and must be documented.

B1 must not invent a permanent generic product name.

## 18. Track selection boundary

The following remains intentionally valid after B1:

```js
ACTIVE_TRACK_ID = 'sdaia-ai-engineer'
```

B1 leakage tests must exclude this bootstrap selection literal from presentation leakage failures.

B2 will own:
- registry;
- discovery;
- track selection;
- multiple active track packages.

## 19. Core leakage rules

B1 introduces a regression contract that prevents track presentation from leaking back into platform files.

At minimum, platform presentation/runtime files should not contain track-specific literals such as:

- `SDAIA AI Engineer`;
- current SDAIA Arabic domain labels;
- current SDAIA-specific hero copy.

Expected allowed exception:
- `src/config.js` may continue to contain `sdaia-ai-engineer` as `ACTIVE_TRACK_ID` until B2.

Historical docs/tests may contain track names where context requires them; leakage checks should target runtime/presentation source files rather than the entire repository.

## 20. Browser behavior acceptance

B1 must prove both locales.

### Arabic

- correct brand;
- correct hero copy;
- Arabic domain labels;
- RTL preserved.

### English

- correct brand;
- correct hero copy;
- English domain labels;
- LTR preserved.

### Shared

- language switching preserves active exam answer state;
- feedback page presentation follows locale;
- offline cached reload remains functional;
- release artifact contains the active track presentation file.

## 21. Release artifact requirements

Pages artifact assembly must include:

`tracks/<active-track>/presentation.json`

Live release verification must validate presentation availability/identity for the current active track.

B1 should extend the existing release verifier rather than create a parallel deployment verifier.

## 22. Testing layers

B1 testing should be layered and small.

Recommended sequence:

1. presentation schema;
2. presentation/manifest identity;
3. locale completeness;
4. domain-label coverage;
5. core literal leakage;
6. presentation loader/resolver unit tests;
7. Arabic browser behavior;
8. English browser behavior;
9. feedback presentation;
10. offline cached reload;
11. release artifact inclusion;
12. live release presentation verification;
13. whole-branch regression.

## 23. Compatibility requirements

B1 must preserve:

- current track ID;
- current manifest version;
- `TrackManifestV1`;
- `RuntimeBundleV2`;
- `StateV2`;
- current exam profile IDs;
- current question IDs;
- current domain keys;
- current public URLs;
- current learner progress;
- current offline behavior.

No migration of learner state is expected for B1.

## 24. Failure handling

### Presentation file unavailable

Runtime:
- warn;
- use neutral/fallback labels;
- keep exam usable.

CI/release:
- fail for active packaged tracks.

### Locale mismatch

Runtime:
- resolve to declared fallback locale.

CI:
- fail if manifest/presentation locale sets differ.

### Domain label missing

Runtime:
- use canonical domain key.

CI:
- fail.

### Identity/version mismatch

Runtime:
- reject presentation as incompatible and use fallback.

CI:
- fail.

## 25. B1 micro-phases

B1 should be implemented as small checkpoints:

### B1.1 — Presentation leak inventory
Freeze exact current track-specific presentation literals and files.

### B1.2 — TrackPresentationV1 contract
Add schema and canonical SDAIA presentation fixture/file.

### B1.3 — Cross-contract validation
Track/version/locale/domain coverage gates.

### B1.4 — Presentation loader/resolver
Small isolated loader with fallback behavior.

### B1.5 — Core i18n split
Move generic strings out of `app.js` without behavior change.

### B1.6 — Domain localization migration
Remove `DOMAIN_AR`; resolve labels from presentation.

### B1.7 — Index presentation migration
Neutral shell + dynamic title/brand/hero.

### B1.8 — Feedback presentation migration
Track display identity from presentation; generic form labels remain core.

### B1.9 — Evidence-status UI guardrails
Generic warning text driven only by manifest/profile status.

### B1.10 — PWA accuracy cleanup
Remove unsupported `Adaptive` claim; document temporary active-track install identity.

### B1.11 — Leakage regression tests
Prevent SDAIA presentation literals from returning to core.

### B1.12 — Browser/offline/release regressions
Arabic/English/feedback/offline/artifact/live checks.

### B1.13 — Whole-branch review
Scope, regression, contract and evidence review.

### B1.14 — Merge and post-merge verification
Only after owner integration decision.

## 26. Non-goals

B1 does not implement:

- Track Registry;
- track selector;
- second track;
- Content Model v2;
- stable domain IDs;
- adaptive learning;
- spaced scheduling;
- AI tutor;
- Question Factory;
- 14,000+ expansion;
- track-specific themes;
- CMS/authoring UI;
- authentication;
- protected content;
- production backend changes.

## 27. Acceptance criteria

B1 is accepted only when:

1. `TrackPresentationV1` exists and is schema-validated.
2. SDAIA presentation data is in `tracks/sdaia-ai-engineer/presentation.json`.
3. Track/version/locale/domain invariants are validated.
4. `DOMAIN_AR` is removed from core runtime code.
5. SDAIA brand/hero/domain presentation literals are removed from core presentation/runtime source, except the B2-deferred active track bootstrap ID.
6. Generic UI strings remain platform-owned.
7. official/evidence status cannot be overridden by presentation data.
8. Arabic and English rendering match current intended SDAIA presentation.
9. language switching still preserves exam state.
10. feedback behavior remains unchanged except presentation sourcing.
11. offline cached reload remains green.
12. Pages artifact includes presentation data.
13. live verifier proves the active presentation contract after deployment.
14. `TrackManifestV1`, `RuntimeBundleV2`, `StateV2`, question IDs, profile IDs and domain keys remain compatible.
15. no B2/B3/adaptive/AI/content-scale scope leaks occur.
16. full repository CI passes on the B1 branch and again after merge.

## 28. Next boundary after B1

After B1 is merged and post-merge verified, the next design task is:

**B2 — Track Registry**

B2 will decide:
- how tracks are discovered;
- how available tracks are listed;
- how the active track is selected;
- how PWA/platform install identity should behave in a multi-track product.

B1 must leave those decisions unimplemented.
