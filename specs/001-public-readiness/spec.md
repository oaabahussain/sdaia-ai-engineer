# Feature Specification: Public-Readiness Foundation

Feature branch: pre-implementation
Feature directory: specs/001-public-readiness
Date: 2026-09-07
Status: Pre-implementation complete pending completion-commit confirmation; implementation prohibited until that confirmation

## Purpose

Prepare the existing SDAIA AI Engineer Study Space for a future implementation phase that can make it reliable for public learners without losing its current backend-free deployment model or blocking future identity, feedback, ratings, comments, and synchronized progress.

This specification reconciles the owner-supplied Server-Ready Foundation specification and Public-Readiness / Real Tests / Content Quality specification plus the owner amendments dated 2026-09-07.

## Product context

The current product is an unofficial community study tool. The only exam facts treated as official by the existing project are the seven domains and their weights. Question count, diagnostics, readiness, sessions, and study recommendations are preparation constructs, not official SDAIA exam claims.

The current product is a static GitHub Pages application with separated storage and logic layers, JSON study data, a service worker, and a test-only future FastAPI/API design. No production backend is part of this feature.

## User scenarios

### Scenario 1 — New learner opens the public site
A learner opens the site on a mobile browser and can understand what the product is, start onboarding, and proceed without seeing developer history or owner-private material.
Acceptance: page boots without page errors; UI is Arabic-first; internal version/changelog/developer text is absent; no horizontal overflow; entry works.

### Scenario 2 — Learner completes onboarding and diagnostic
A learner sets optional exam date/session length/start mode, completes diagnostic, and sees preparation-readiness and mastery.
Acceptance: state persists under versioned browser key; anon_id is UUID v4; diagnostic draws exactly three questions per official domain; readiness equals shared logic; no account required.

### Scenario 3 — Returning learner resumes study
A learner reloads and retains progress, bookmarks, notes, review schedule, theme, and focus preferences.
Acceptance: known older local shapes migrate safely; exported state validates; persistence survives reload; import/export preserves readiness/mastery.

### Scenario 4 — Learner studies with adaptive review
A learner answers with the two-attempt behavior, receives explanations, accumulates spaced review, and receives a daily mission.
Acceptance: mastery/readiness/review/mission use shared pure logic; error priority is deterministic; review intervals follow current model; adaptive sessions populate at runtime.

### Scenario 5 — Learner uses the product offline
After one successful online load, learner loses connectivity and reloads.
Acceptance: service-worker registration proven; expected cache exists; required modules/data available offline; saved state remains usable.

### Scenario 6 — Learner reports a questionable item
A learner opens a public reporting flow without app-side PII collection.
Acceptance: action identifies question; public label Arabic; current mechanism is honest about using GitHub rather than a nonexistent feedback server.

### Scenario 7 — Future account capability
At a later date the owner may introduce login, sync, ratings and comments.
Acceptance: current UI/study logic does not need provider-specific rewrite; identity is behind a boundary; anonymous state linking has an explicit future policy; managed passkey/WebAuthn-capable identity preferred.

## Functional requirements

FR-001. Public product MUST remain usable without a production backend until separately approved.
FR-002. Public UI MUST remain Arabic-first. Technical English terminology may appear when educationally relevant.
FR-003. UI chrome/About MUST NOT expose developer-agent/provider names, internal version history, task IDs, owner-only language, changelog language, debugging text, TODO/FIXME, or development-model/provider references.
FR-004. Educational content MAY mention AI vendors, models, standards, APIs, and products when relevant to learning.
FR-005. Runtime state MUST have one canonical persisted representation and a versioned migration path from known pre-v6 shapes.
FR-006. Anonymous UUID MUST remain the only public user identifier before auth implementation.
FR-007. Public app MUST NOT collect names, emails, phones, device fingerprints, passwords, or secret credentials.
FR-008. Future authentication MUST be introduced through an identity-provider boundary; current feature defines the boundary only.
FR-009. Future authentication SHOULD use a managed standards-based passkey/WebAuthn-capable provider rather than a bespoke password database.
FR-010. Future ratings/comments MUST have service contracts plus moderation/abuse/privacy policy before activation.
FR-011. Mastery/readiness/review/mission calculations MUST remain pure shared logic and independently testable.
FR-012. Browser behavior MUST be tested by executing built site before deployment. Chromium and WebKit mandatory; Chromium desktop/mobile-size mandatory.
FR-013. Core E2E MUST fail on pageerror or unexpected console.error.
FR-014. Tests SHOULD prefer semantic role/accessibility-name selectors. Stable data-testid MUST be added for generated/ambiguous interactions.
FR-015. Core E2E scope MUST cover boot, onboarding, diagnostic, two-attempt rule, session progress, sessions 14/15, error bank, spaced review, bookmark/note persistence, search, cases, settings, export/import, migration, report flow, offline/SW, accessibility, rendered copy audit, and seeded answer-position runtime audit.
FR-016. Service-worker behavior MUST be verified in browser execution including registration, expected cache version, offline reload, and cache-asset availability.
FR-017. Playwright WebKit MUST NOT be represented as physical iPhone Safari evidence.
FR-018. Physical iPhone Safari evidence, when supplied, MUST come from owner screenshots plus exact reproduction steps and be recorded as a separate evidence class.
FR-019. Post-deploy live verification MUST execute boot/state/assets and offline/SW smoke when deterministic.
FR-020. Automatic rollback MUST NOT be claimed in the first release. Post-deploy failure marks release red, identifies last known good, and exposes a tested manual rollback procedure.
FR-021. Content-quality gates MUST exist before bulk rewrite.
FR-022. Through 2026-10-07 the following gates are PROVISIONAL and may change only with measured data: exactly 4 options; answer-index max 35%; correct-is-longest max 40%; no option <12 chars; at most 15 definition-style items; difficulty 1–3 on every item; explanation covers correct and every wrong option.
FR-023. Content gate MUST require unique options and valid answer index.
FR-024. Each question topic MUST map to a defined learn topic; topic counts are measured before enforcing a minimum-per-topic threshold.
FR-025. Uncertain technical claims MUST be marked needs_review and MUST NOT be guessed into correctness.
FR-026. Owner Othman is the required independent technical reviewer for every needs_review item in Level 6. Agent MUST prepare one review sheet per item with exact claim, source, why uncertain, proposed resolution, and affected question ID.
FR-027. Content rewrite MUST be separate after runtime, architecture, browser tests, PWA reliability and quality gates are stable.
FR-028. Existing official domain weights MUST remain unchanged unless newer official material is supplied.
FR-029. Readiness reporting MUST distinguish VERIFIED/PARTIAL/MISSING and provide appropriate evidence.
FR-030. Accessibility MUST be validated on core screens with automated tooling plus documented manual-review requirement; html remains lang=ar dir=rtl and interactive controls have accessible names.
FR-031. Performance thresholds MUST be derived from measured baseline before becoming hard release gates. Lighthouse measurement required; arbitrary >=90 across all categories is not adopted as a universal rule before baseline review.
FR-032. No production FastAPI/PostgreSQL/n8n deployment is part of this feature.
FR-033. Existing .github/workflows/daily-review.yml and .github/agent/* MUST remain untouched and operationally disabled until Level 7 review. They currently require repository LLM configuration and are not part of learner-facing stabilization. Rationale: changing/activating internal review automation earlier would mix agent-governance work with runtime/public-readiness work.
FR-034. This pre-implementation feature stops after Spec Kit analyze. No application code, CI, data, or runtime implementation is part of the completion commit.

## Public copy requirements

Public UI must remove/avoid V2/V3/V4/V5/PWA V* labels, developer changelog headings, owner-specific references, English “Report a question” chrome, legacy-version export filenames, developer AI/agent names, Markdown artifacts, TODO/FIXME, placeholder prose and debug logs.

Approved exception: About footer may show exactly “الإصدار 6.0”, and this is the only UI version string.

Educational content may contain AI/vendor/model terminology when technically relevant.

## Content-quality requirements

The numeric thresholds are owner-approved PROVISIONAL engineering gates, not claims of universal psychometric optimality. Research supports plausible distractors, structured review rubrics, scenario/context-rich items, blueprint coverage and empirical item analysis. Exact option-count and length/distribution thresholds must be revisited with measured learner-response data on 2026-10-07 or later.

After response data exists, threshold review should consider item difficulty, discrimination, distractor functioning, response-time anomalies, option-selection distribution, and high-confidence-wrong behavior.

## Non-goals

- No production server deployment.
- No login/accounts in this feature.
- No email collection.
- No comments/ratings in this feature.
- No activation or redesign of .github/workflows/daily-review.yml or .github/agent/* before Level 7.
- No bulk question rewrite during Levels 0–5.
- No claim that training bank reproduces official SDAIA exam format.
- No claim that WebKit automation equals physical Safari/iPhone.
- No automatic rollback claim in first release.

## Owner decisions resolved 2026-09-07

1. Start Level 0 after completion review: YES.
2. About footer “الإصدار 6.0” only version in UI: YES.
3. Semantic selectors first, data-testid where needed: YES.
4. Four options provisional through 2026-10-07: YES.
5. Automatic rollback first release: NO.
6. Comments/ratings in this feature: NO.
7. Login in this feature: NO.
8. Runtime/browser/PWA/gates before bulk rewrite: YES.

## Success criteria

SC-001. Pre-implementation artifacts pass consistency analysis with no unresolved constitution violations.
SC-002. Plan has Levels 0–8 with clear goals and gates.
SC-003. Every T0001–T0805 task states files touched, acceptance criterion, and evidence required.
SC-004. Three foundation-shaping decisions have multi-source research records with URL/DOI and confidence; unresolved sources explicitly PARTIAL.
SC-005. Conflicts between owner specs are recorded/resolved.
SC-006. daily-review internal automation is explicitly scoped to remain disabled/untouched until Level 7.
SC-007. needs_review owner-review dependency is explicit.
SC-008. Package stops before implementation and ends with “READY FOR REVIEW — implementation not started”.

## Clarifications

Q1. Does ten-source standard apply to every small decision? A1. No; only identity/passkeys, PWA/Safari/iOS, content-quality gates.
Q2. Are numeric content gates psychometric truths? A2. No; provisional through 2026-10-07.
Q3. data-testid only? A3. No; semantics first, testid where needed.
Q4. automatic rollback first release? A4. No; tested manual rollback first.
Q5. physical Safari required for automated CI green? A5. No; required only for a physical-Safari VERIFIED claim and supplied by owner.
Q6. bulk rewrite immediately? A6. No; Levels 0–5 first.
Q7. future login now? A7. No.
Q8. build password system later? A8. No; prefer managed standards-based identity.
Q9. comments/ratings current scope? A9. No.
Q10. production server current scope? A10. No.
Q11. daily-review current scope? A11. No; remain disabled/untouched until Level 7.
Q12. who clears needs_review? A12. Owner Othman after agent-prepared per-item review sheet.
