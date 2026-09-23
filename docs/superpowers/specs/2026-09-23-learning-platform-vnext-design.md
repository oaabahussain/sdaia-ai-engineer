# Learning Platform vNext — Architecture and Repository Constitution

**Date:** 2026-09-23  
**Status:** Proposed design for owner review  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Scope:** Architecture, learning model, content model, repository cleanup, migration, scalability, security, transferability, and future multi-track expansion.

---

## 1. Intent

This repository is being evolved from a bilingual SDAIA AI Engineer practice site into a reusable learning and assessment platform.

The platform must:

1. Prepare learners for the current SDAIA AI Engineer track with a target bank of **14,000+ high-quality training items**.
2. Teach, diagnose, remediate, review, retain, and assess — not merely serve a question bank.
3. Support human learners and agent/tutor clients through the same learning core.
4. Support additional SDAIA examinations, other certifications, and unrelated future subjects without copying the application or hard-coding subject-specific logic into the core.
5. Preserve useful existing work while removing conflicting, obsolete, duplicated, or misleading legacy paths.
6. Avoid unnecessary framework rewrites or version upgrades that create compatibility problems for users.
7. Remain understandable, testable, transferable, and commercially due-diligence-ready if the repository is handed to another developer, licensed, or sold.

The design principle is:

> **Preserve → Canonicalise → Migrate → Extend → Measure → Improve**

A second governing principle is:

> **The track is data; the learning platform is code.**

---

## 2. Non-negotiable product rules

### 2.1 No quantity theatre

The goal is not to manufacture 14,000 superficial paraphrases. A rendered item counts as meaningful only when it tests a learning objective through a materially different decision, scenario, variable set, constraint, misconception, or reasoning path.

### 2.2 Learning is not the same as assessment

The platform must separate teaching, practice, validation, and mock assessment. A learner must not receive an inflated readiness estimate merely because they memorised exposed questions.

### 2.3 No silent breaking changes

Existing learner state, question identifiers, offline behaviour, public URLs, and API contracts must either remain compatible or pass through an explicit, tested migration.

### 2.4 No unnecessary software churn

Do not replace the current application stack merely because a newer framework exists. New dependencies, runtime upgrades, and framework changes require a demonstrated need, compatibility analysis, migration plan, tests, and rollback path.

### 2.5 Arabic and English are first-class

Arabic is not a translation afterthought. The content model and UI must support Arabic, English, RTL/LTR, mixed technical terminology, numbers, code, tables, and equivalent meaning across languages.

### 2.6 Every architectural change must reduce ambiguity

A feature is not complete if it leaves duplicate sources of truth, stale scripts, incompatible schemas, dead paths, or undocumented behaviour behind.

---

## 3. Current repository baseline

At the start of this design, `main` is based on commit:

`362d35c697411d4eddcc4536c843df17161d3374`

The current public application includes:

- Vanilla HTML/CSS/JavaScript.
- GitHub Pages deployment.
- Service worker/PWA behaviour.
- Browser storage as the default storage adapter.
- An optional API adapter.
- A FastAPI + SQLite server skeleton.
- Node-based logic tests and browser smoke tests.
- Arabic/English UI with RTL/LTR.
- A concept-driven generator producing 1,120 rendered questions from 140 concepts.
- A legacy `data/questions.json` containing 121 questions.
- Legacy learning/session/readiness/mastery/review structures.
- A 200-question weighted exam flow.
- Feedback/community flows through GitHub.

Useful existing infrastructure should be preserved when it remains correct.

---

## 4. Known conflicts and legacy hazards

These are migration inputs, not optional cleanup.

| Area | Current conflict | Required disposition |
|---|---|---|
| Question source | Browser path uses `data/concepts/*` → generated 1,120 items; API path returns `data/questions.json` → 121 items | Replace with one canonical content contract |
| Legacy sessions | `data/sessions.json` references `q1..q121` | Migrate to stable objective/family references or retire after content mapping |
| Question schema | Existing schema only models the legacy 121-question object and rejects richer item metadata | Introduce versioned content schema |
| State schema | Existing schema disallows application fields such as `examV2` | Introduce versioned learner-state schema and migration |
| API bank | `/v1/bank` returns the legacy bank | Replace with manifest/chunk or session-oriented contracts |
| Browser/API identity | Previous PR review identified first-run anonymous-ID mismatch risk in API-backed mode | Resolve in the state/API migration before enabling API mode |
| Offline fallback | Inline fallback contains no usable concept bank while current startup expects >=1000 generated items | Replace with a real minimal offline strategy |
| Service worker registration | Previous review identified a registration race caused by listener timing after async startup | Fix during shell/offline migration |
| Service worker precache | Static asset list does not scale to 14,000+ items | Cache shell + on-demand content chunks |
| Release verification | `scripts/verify_release.py` still encodes the old 121-inline-question release assumptions | Replace or remove after equivalent current checks exist |
| Adaptive logic | `mastery.js`, `readiness.js`, `review.js`, and `mission.js` are disconnected from the current Exam V2 flow | Fold into the new learning engine or retire |
| Hard-coded exam size | 200 appears in UI/application/test assumptions | Move into exam profiles |
| Feedback path | Generic `issues/new` conflicts with disabled blank issues | Repair or replace feedback submission path |
| IDs | Sequential `q1`, `q2` identifiers are unstable for long-lived multi-track content | Introduce stable namespaced IDs and legacy mapping |
| Protected content | Public repository/static site exposes any content shipped to the browser | Use server-side delivery for protected assessment pools |
| Weights provenance | Current `weights.json` values must not be labelled official unless backed by a current primary source | Store source/evidence metadata with exam profile |

No large-scale question expansion starts until the canonical content/state/API contracts above are defined and migration safety exists.

---

## 5. Target architecture

```text
                         Learning Platform
                                │
                 ┌──────────────┴──────────────┐
                 │                             │
              Human UI                    Agent API
                 │                             │
                 └──────────────┬──────────────┘
                                │
                         Learning Engine
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
   Content Engine        Learner Model        Assessment Engine
          │                     │                     │
          └─────────────────────┼─────────────────────┘
                                │
                         Track Registry
                                │
          ┌─────────────────────┼─────────────────────┐
          │                     │                     │
   SDAIA AI Engineer     Other SDAIA Track      Future Subject
```

The core must not contain SDAIA-specific function names, domain counts, weights, question counts, or topic names.

---

## 6. Multi-track content contract

A track is a versioned package, not a code fork.

Recommended logical structure:

```text
tracks/
  sdaia-ai-engineer/
    manifest.json
    competencies/
    objectives/
    concepts/
    misconceptions/
    lessons/
    question-families/
    scenarios/
    cases/
    evidence/
    exam-profiles/
    translations/
```

A future track may use the same structure without changing the learning engine.

### 6.1 Track manifest

Each track must define at least:

- stable track ID
- display names per language
- track version
- lifecycle status
- supported locales
- competency registry
- content package versions
- exam profile references
- evidence registry reference
- public/protected content policy
- compatibility metadata

### 6.2 Versioning

A learner result must always be attributable to the track/content version used at the time.

Example:

`sdaia-ai-engineer@2`

Updating a curriculum must not silently reinterpret historical results generated under version 1.

---

## 7. Curriculum hierarchy

The canonical hierarchy is:

```text
Evidence
  ↓
Competency
  ↓
Learning Objective
  ↓
Concept
  ↓
Misconception
  ↓
Question Family
  ↓
Scenario / Variables / Constraints
  ↓
Rendered Item
```

For SDAIA, official competency/occupational material should sit above locally invented topic groupings whenever reliable primary evidence exists.

The project may also use strong non-official evidence, but provenance must remain visible and must never be relabelled as official.

---

## 8. The 14,000+ item strategy

The current SDAIA AI Engineer track targets at least **14,000 meaningful rendered items**.

### 8.1 Canonical question families

The primary authored unit is the **Question Family**, not the final rendered sentence.

A family contains:

- stable family ID
- track/domain/objective references
- target concept(s)
- misconception targets
- cognitive level
- intended difficulty
- item type
- scenario model
- variable constraints
- correct reasoning
- distractor reasoning
- evidence references
- language requirements
- pool eligibility
- lifecycle/version metadata

### 8.2 Variants

A variant is valid only when the learner must process a materially different decision context, such as a change in:

- data distribution
- base rate
- business objective
- FP/FN cost
- latency/cost/privacy constraint
- threshold
- architecture
- failure mode
- stakeholder requirement
- operational trade-off
- supplied evidence/data/table/code

Simple wording changes do not create independent educational value.

### 8.3 Distractor model

Every serious distractor should map to a known or hypothesised misconception.

The system should be able to learn:

> The learner confuses Recall and Precision when false-negative cost dominates.

rather than only:

> The learner answered incorrectly.

---

## 9. Cognitive levels

The platform uses a content-agnostic cognitive ladder:

1. **Foundation** — recognise/recall a concept.
2. **Understanding** — distinguish it from close alternatives.
3. **Applied** — use it in a direct problem.
4. **Scenario** — reason over multiple conditions or constraints.
5. **Exam-like** — realistic decision with strong distractors and incomplete-looking information.
6. **Advanced** — optimise trade-offs when no option is universally perfect.

Difficulty and cognitive level are separate properties.

---

## 10. Learning lifecycle

The default learning loop is:

```text
Learn
  ↓
Practice
  ↓
Check
  ↓
Diagnose
  ↓
Remediate
  ↓
Review
  ↓
Retain
  ↓
Mock
  ↓
Readiness
```

### 10.1 Feedback timing

- **Learn:** immediate explanation.
- **Practice:** immediate by default, configurable.
- **Check:** immediate or block-delayed according to activity configuration.
- **Mock:** explanations hidden until submission.
- **Retention review:** configured by the review objective.

The platform must not enforce one universal feedback timing policy across all modes.

---

## 11. Exposure control and anti-memorisation

Content is separated into at least three logical pools:

### Learning Pool
Visible during teaching and deliberate practice.

### Check Pool
Unseen or low-exposure families used to verify transfer of understanding.

### Mock/Holdout Pool
Protected from normal teaching exposure so readiness is not mainly a memory score.

Learner state tracks at least:

- item exposure
- family exposure
- scenario exposure
- exposure count
- last exposure time
- whether the item was used in a learning, check, or mock context

Repeated exposure must reduce the weight of an item as independent evidence of readiness.

---

## 12. Learner model

The learner model is per user, per track/version, with optional shared competency evidence across tracks.

It may represent:

- knowledge
- application
- scenario reasoning
- retention
- consistency
- confidence calibration
- time management
- misconception state
- topic mastery
- domain mastery
- exposure history
- review scheduling
- assessment history

Internal learner levels:

1. Foundation
2. Developing
3. Applied
4. Scenario Ready
5. Exam Ready
6. Advanced

These are platform labels and must not be presented as official SDAIA levels unless a source explicitly establishes that.

---

## 13. Readiness

Readiness is not a single raw percentage of previously seen questions.

A future readiness model should combine evidence such as:

- domain-weighted performance
- unseen-family performance
- scenario performance
- retention
- consistency across attempts
- confidence calibration
- time management
- exposure penalty
- recency
- mock performance

The exact formula is versioned.

Do not call a general composite learning score “F1 Score”. F1 remains the classification metric derived from Precision and Recall.

---

## 14. Adaptive learning

### Phase 1 — deterministic/rule-based

Use observable learner evidence:

- correctness
- misconception
- confidence
- response time
- recency
- exposure
- objective mastery
- retention

The next activity is selected from explicit rules that can be tested and explained.

### Phase 2 — empirical item analytics

After sufficient real usage data:

- item difficulty
- distractor efficiency
- item discrimination
- response-time distribution
- reliability
- retention outcome

### Phase 3 — psychometric/adaptive testing

IRT/CAT or equivalent techniques may be introduced only after adequate calibration evidence exists. The architecture must not pretend that generated items are psychometrically calibrated before they have real response data.

---

## 15. Learner experience and tutor modes

The product experience should answer two learner questions immediately:

1. **Where am I now?**
2. **What should I do next?**

The learner-facing home/progress experience should therefore surface, without overwhelming the learner:

- current track/version
- current learner level
- readiness
- strongest and weakest domains/objectives
- active misconceptions
- retention/review status
- recent mock performance
- the next best learning action

The tutor experience must support at least these modes:

- **Teach me** — explain a concept with examples.
- **Test me** — ask questions without revealing hints prematurely.
- **Explain after answer** — preserve assessment integrity until the learner commits.
- **Strict exam mode** — no hints, coaching, or answer-revealing feedback until the configured review point.
- **Weak-area focus** — target diagnosed objectives and misconceptions.
- **Retention review** — revisit due material.
- **Scenario practice** — prioritise applied/exam-like reasoning.

The tutor contract is modality-independent. Text is required; voice/live interaction may be added as a client capability without changing the learning core. The learning engine owns state, selection, and assessment rules; the voice/text client owns presentation.

The platform should never use hints or coaching in strict/mock modes simply because an AI tutor is available.

---

## 16. “Why this question?”

Adaptive recommendations should be explainable.

Example:

> This question was selected because you confused Precision and Recall in two recent sessions and this family has not been reviewed for six days.

The rule engine must be able to produce an explanation for its selection decision.

---

## 17. Human and agent clients

The same learning core serves both.

### Human client
Uses the browser UI.

### Agent/tutor client
Uses narrow capabilities such as:

- start session
- request next item
- submit response
- request hint
- request explanation
- request progress summary
- request weak objectives
- start mock
- finish mock

There must not be a bulk “download all protected questions” capability.

Agent permissions follow least privilege.

---

## 18. Public and protected content

### Public learning content

May be distributed through the static site, repository, or downloadable study packs.

### Protected assessment content

Must not be treated as secret if shipped in full to the browser.

For protected banks:

```text
Browser / Agent
      ↓
Assessment API
      ↓
Selection / policy
      ↓
Permitted item payload
```

The client receives only the data required for the current permitted step. Hidden rationales, answers, unused holdout items, and administrative metadata remain server-side.

The existing FastAPI skeleton may be evolved for this purpose instead of introducing a new backend framework without need.

---

## 19. Storage strategy

### Browser preferences and tiny resume metadata

Small state may remain in browser key/value storage.

### Growing structured learner data

Use an asynchronous structured browser store such as IndexedDB for:

- attempts
- exposure history
- review queue
- mastery evidence
- offline content packs
- event queue

### Server sync

When server-backed identity/sync is enabled, client state synchronises through a versioned API contract.

The application must remain useful when server sync is temporarily unavailable.

---

## 20. Content loading and scalability

Do not load 14,000+ complete items at startup.

Use:

```text
manifest
  ↓
track
  ↓
domain/objective
  ↓
content chunk
```

The service worker should cache the application shell and requested study packs/chunks on demand.

A protected assessment pool is not precached.

---

## 21. Exam profiles

Exam rules are data, not application constants.

An exam profile includes:

- stable ID/version
- track reference
- name
- effective date
- question count
- duration
- domains
- weights
- item type rules
- difficulty/cognitive distribution
- scoring rules
- feedback/review policy
- source/evidence references
- evidence status

No exam count or weight should remain hard-coded in UI or core selection logic.

A weight must not be labelled official until current primary evidence supports that label.

---

## 22. Evidence registry

Sources are stored once and referenced by content.

Each source record should capture:

- source ID
- title
- publisher/owner
- URL or internal reference
- evidence class
- publication/effective date
- last verified date
- official/non-official status
- content version applicability
- notes/limitations

Content changes caused by a source update should be traceable to affected competencies, objectives, families, and rendered items.

---

## 23. Exam Intelligence subsystem

Changing exam facts must not be scattered through UI text or treated as permanent truth.

Each track may include an **Exam Intelligence** subsystem that records and distinguishes:

- official exam/credential name and current status
- official domains/competencies
- official weights when verified
- registration mechanism
- cohorts/dates when publicly announced
- official preparation material
- official contacts/support routes
- public changes to the exam format
- independent test-taker observations
- observed question style/scenario patterns
- badge/certificate-holder evidence when relevant and lawfully public
- source
- verification date
- evidence strength
- contradiction status

Evidence levels should distinguish, at minimum:

- **A — Official / primary**
- **B — Strong observational evidence from multiple independent sources**
- **C — Single-source observation**
- **D — Hypothesis / unverified lead**

A C/D observation must never be promoted to an official fact.

Test-taker experiences are used to identify likely styles, difficulty patterns, and failure modes. They must not be used to copy confidential, leaked, recalled, or copyrighted real exam questions.

Exam Intelligence updates follow:

`Discover → Stage → Verify → Approve → Publish`

This subsystem should allow exam facts to change without forcing a product-code release when the underlying application behaviour is unchanged.

---

## 24. Content lifecycle

Every durable content object uses a lifecycle such as:

`draft → review → approved → active → deprecated → retired`

Retirement preserves historical result interpretation.

Deletion is reserved for invalid/non-production material that has no historical dependency.

---

## 25. Repository constitution

### 23.1 Main represents current truth

`main` must not contain active-looking legacy files that contradict the current runtime contract.

### 23.2 Every legacy artifact receives an explicit decision

- KEEP
- MIGRATE
- REPLACE
- ARCHIVE
- DELETE

### 23.3 Git history is the default archive

Do not create an `archive/` junk drawer merely to avoid deleting obsolete files. Once migration is verified, remove obsolete files from the active tree unless they have an operational reason to remain.

### 23.4 Stable documentation

The repository should ultimately maintain:

- `README.md`
- `ARCHITECTURE.md`
- `CONTENT-MODEL.md`
- `DATA-MODEL.md`
- `LEARNING-ENGINE.md`
- `SECURITY.md`
- `TESTING.md`
- `DEPLOYMENT.md`
- `MIGRATIONS.md`
- `CONTRIBUTING.md`
- `HANDOFF.md`
- `CHANGELOG.md`
- architectural decision records under `docs/decisions/`

Documentation changes ship with the code/data contract they describe.

### 23.5 Zero-tribal-knowledge target

A qualified developer should be able to clone the repository, understand the architecture, run the supported test suite, build/deploy the public application, add a new track through the documented content contract, and understand the migration/security boundaries without needing a private oral explanation.

---

## 26. Repository cleanup rules

Cleanup must be evidence-driven.

Before deleting a file:

1. identify references
2. classify it
3. migrate any unique useful content
4. add/adjust tests
5. verify no supported flow depends on it
6. remove it
7. update docs

Examples that require explicit migration review include:

- the 121-question legacy bank
- concept-generator inputs
- sessions referencing old IDs
- legacy readiness/mastery/review/mission modules
- obsolete release verification logic
- old branches/workflows that no longer describe release reality

Historical branches may remain on GitHub until the active repository has a stable release/tag and cleanup decisions are complete; branch deletion is a separate maintenance step, not part of content migration itself.

---

## 27. Identifier policy

Sequential IDs such as `q1` are not canonical for future content.

Use stable namespaced identifiers, for example:

`sdaia-ai-engineer.data.metrics.recall.fn-cost.v1`

Rendered items may have their own stable IDs while referencing a family ID.

A legacy-ID map preserves historical data during migration.

---

## 28. Compatibility and migrations

Every persisted contract is versioned.

Examples:

- learner state
- track manifests
- question family schema
- exam profile
- API
- event schema

A migration must be:

- deterministic
- idempotent where practical
- tested from real/representative old fixtures
- non-destructive
- observable on failure
- reversible or recoverable through backup/versioned source state

Never erase learner progress silently because a schema changed.

---

## 29. CI and quality gates

The CI target should grow beyond syntax checks.

Required gate categories:

### Application
- unit tests
- browser smoke
- mobile-critical flows
- Arabic/English switching
- RTL/LTR
- offline shell behaviour

### Contracts
- schema validation
- API/browser adapter equivalence where applicable
- migration fixtures
- stable-ID uniqueness
- broken references
- track manifest validation

### Content
- duplicate families/items
- missing objective/competency references
- missing provenance when required
- invalid answer keys
- bilingual semantic-review status
- distractor metadata
- retired/deprecated references
- pool/exposure policy violations

### Repository hygiene
- stale generated artifacts
- orphan files
- conflicting canonical sources
- secret scanning
- dependency/license inventory
- documentation contract checks

### Accessibility
- keyboard-critical navigation
- focus visibility
- touch target and basic semantic checks
- RTL layout regressions

---

## 30. Definition of Done

A change that affects runtime, data, content contracts, or learner behaviour is complete only when applicable items are satisfied:

- behaviour works
- tests pass
- legacy data is compatible or migrated
- schemas agree
- API/client contracts agree
- offline behaviour remains valid
- Arabic checked
- English checked
- mobile checked
- accessibility checked
- security boundary reviewed
- documentation updated
- no obsolete competing path remains
- rollback/recovery is understood

---

## 31. Transferability and commercial due diligence

The repository must be maintainable as an asset independent of its current owner.

Maintain clear records for:

- code ownership
- contributor provenance
- third-party dependencies
- third-party licenses
- content licenses/permissions
- image/media provenance
- externally sourced question/content provenance
- protected vs public content
- secrets/credentials
- deployment ownership
- domain/service dependencies

The repository is currently MIT-licensed and public. Published open-source history must be treated as already disclosed/licensed according to its applicable terms. Future proprietary value should therefore be isolated in appropriately owned content/services rather than assuming previously public code can become secret retroactively.

No confidential exam questions or unauthorised copyrighted exam material may be added.

---

## 32. Content authoring, import, export, and portability

The platform must not require hand-editing application code to add ordinary content.

A documented content-authoring workflow should support:

- create/edit track metadata
- create competencies/objectives/concepts
- register evidence
- author question families and misconceptions
- generate or author variants
- bilingual review
- technical review
- duplicate detection
- quality checks
- approval/activation
- deprecation/retirement

AI may propose content, variants, translations, tags, and duplicate candidates, but AI-generated content is never auto-published to an active assessment pool without passing the configured quality gates.

The canonical internal model should support future import/export adapters. The initial implementation does not need a full authoring CMS, but content must be serialisable, versioned, and portable enough that:

- a track can be moved between environments
- a buyer/team can inspect and migrate content without reverse-engineering UI code
- future QTI-compatible import/export can be added through adapters
- protected content can be exported only through explicitly authorised administrative workflows

Bulk export of protected assessment content is an administrative capability, not a learner or general agent capability.

---

## 33. Standards compatibility without premature dependency

Internal schemas should be designed so future adapters can map to education standards such as QTI and learning-event standards such as Caliper without requiring those standards as runtime dependencies today.

The goal is compatibility-friendly internal modelling, not premature standards implementation.

---

## 34. Accessibility and internationalisation

Accessibility is a release quality concern, not a later polish stage.

The platform should align with current WCAG 2.2 practices where applicable to the product.

Track/content schemas must not assume left-to-right text.

Arabic and English content review must verify equivalent meaning, not word-for-word translation.

---

## 35. Implementation decomposition

This architecture is intentionally decomposed into independently reviewable programmes of work.

### Programme A — Repository and contract stabilisation
Canonical sources, conflict cleanup, schemas, stable IDs, state migration, release checks.

### Programme B — Track/content engine
Track manifests, competency/objective/concept/misconception/family/evidence model, chunked loading.

### Programme C — Learning engine
Learning modes, remediation, review, retention, learner model, explainable selection.

### Programme D — Assessment engine
Check/holdout separation, exam profiles, mock behaviour, readiness model.

### Programme E — Storage and sync
IndexedDB-backed structured state, migrations, optional API sync.

### Programme F — Protected assessment service
Server-side bank/session delivery, least-privilege agent interface, protected content policy.

### Programme G — Content production
Migration of useful legacy content followed by controlled expansion toward 14,000+ SDAIA AI Engineer items.

### Programme H — Transferability
Documentation, ADRs, licensing/provenance inventory, handoff/runbooks, repository hygiene.

These programmes share contracts but should not be implemented as one big-bang rewrite.

This document is the umbrella architecture constitution. **Programme A is the only implementation scope unlocked by approval of this document.** Programmes B–H require their own bounded design/spec review before their implementation plans begin, so the platform can evolve without turning this constitution into an unreviewable mega-plan.

---

## 36. First implementation boundary

Before destructive cleanup begins, create a recoverable baseline reference (release/tag or equivalent immutable commit reference) for the current production state. Repository cleanup must be performed on a dedicated branch and reviewed before merge; `main` is not used as a scratch workspace.

The first implementation plan, after this design is approved, must focus on **Programme A: Repository and contract stabilisation**.

It should not yet mass-generate the 14,000-item bank.

The first milestone is complete when:

1. there is one canonical runtime content contract
2. legacy 121/1120 sources have explicit migration dispositions
3. state/schema conflicts are resolved through versioned migration
4. exam configuration is data-driven
5. release/test scripts represent current reality
6. service-worker/offline startup hazards are fixed
7. feedback path inconsistency is fixed
8. stable identifier policy exists in executable schemas/tests
9. no supported existing learner flow regresses
10. documentation accurately describes the resulting baseline

Only then should large-scale content production begin.

---

## 37. Research principles incorporated into this design

This design adopts the following evidence-backed patterns:

- separate practice/learning from exam simulation
- use explanations and remediation during learning
- use unseen/low-exposure content to check transfer rather than memorisation
- use retrieval and spaced review for retention
- model distractors around misconceptions
- delay psychometric claims until calibration data exists
- treat accessibility, provenance, and versioning as core architecture
- avoid sending protected answer banks wholesale to the browser
- keep subject configuration out of core code

Representative source families reviewed during design include:

- SDAIA National Occupational Standard Framework for Data & AI
- Microsoft Learn practice assessment and exam-preparation guidance
- AWS certification preparation guidance
- MeasureUp practice/certification mode documentation
- AMBOSS study/exam workflows
- Khan Academy mastery/review model
- Brilliant guided practice/scaffolding model
- Cambridge Assessment multiple-choice item-writing guidance
- NBME item-writing guidance
- OWASP API Security guidance
- W3C WCAG 2.2
- 1EdTech QTI and Caliper standards
- research on retrieval practice, spacing, feedback timing, item exposure, and adaptive testing
- direct inspection of this repository's current code, schemas, tests, workflows, PR history, and review findings

---

## 38. Acceptance of this constitution

After owner approval, this document becomes the architectural baseline for vNext planning.

Implementation plans may refine mechanics but may not silently violate the principles above. A material deviation requires an explicit architectural decision record explaining why.
