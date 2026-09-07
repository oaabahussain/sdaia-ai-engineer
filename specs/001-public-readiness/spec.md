# Feature Specification: Public-Readiness Foundation

Feature branch: pre-implementation
Feature directory: specs/001-public-readiness
Date: 2026-09-07
Status: Ready for planning; implementation prohibited in this phase

## Purpose

Prepare the existing SDAIA AI Engineer Study Space for a future implementation phase that can make it reliable for public learners without losing its current backend-free deployment model or blocking future identity, feedback, ratings, comments, and synchronized progress.

This specification reconciles the owner-supplied Server-Ready Foundation specification and Public-Readiness / Real Tests / Content Quality specification. Neither supplied specification exists as a repository file at the inspected baseline, so they are treated as owner-approved conversation specifications and reconciled here.

## Product context

The current product is an unofficial community study tool. The only exam facts treated as official by the existing project are the seven domains and their weights. Question count, diagnostics, readiness, sessions, and study recommendations are preparation constructs, not official SDAIA exam claims.

The current product is a static GitHub Pages application with separated storage and logic layers, JSON study data, a service worker, and a test-only future FastAPI/API design. No production backend is part of this feature.

## User scenarios

### Scenario 1 — New learner opens the public site

A learner opens the site on a mobile browser and can immediately understand what the product is, start onboarding, and proceed without seeing developer history or owner-private material.

Acceptance outcome:
- the page boots without page errors;
- the public interface is Arabic-first;
- internal version/changelog/developer text is absent;
- mobile layout does not overflow horizontally;
- the learner can enter onboarding.

### Scenario 2 — Learner completes onboarding and diagnostic

A learner enters an optional exam date, selects a session length and start mode, completes the diagnostic, and sees a preparation-readiness result and domain mastery values.

Acceptance outcome:
- state persists locally under the versioned browser state key;
- anonymous identity is UUID v4;
- the diagnostic draws exactly three questions per official domain;
- the final readiness value equals the shared readiness logic for the resulting state;
- no server account is required.

### Scenario 3 — Returning learner resumes study

A learner reloads the site later and retains progress, bookmarks, notes, review schedule, theme, and focus preferences.

Acceptance outcome:
- saved state migrates safely from known older local formats;
- exported state validates against the canonical state schema;
- bookmarks and notes persist;
- import/export round-trips without changing readiness/mastery.

### Scenario 4 — Learner studies with adaptive review

A learner answers questions, gets the two-attempt behavior, receives explanations, accumulates spaced review, and gets a daily mission chosen from the shared logic layer.

Acceptance outcome:
- mastery/readiness/review/mission calculations use the pure logic modules;
- wrong/high-confidence errors rank ahead of lower-priority review items;
- review intervals follow the configured 1/3/7/14-day behavior;
- adaptive and mixed sessions populate at runtime and are verified in browser tests.

### Scenario 5 — Learner uses the product offline

After a successful online load, a learner loses connectivity and reloads the installed or cached application.

Acceptance outcome:
- service worker registration is proven in a browser;
- the expected cache version exists;
- required application modules and public JSON data are available offline;
- the same saved state remains usable.

### Scenario 6 — Learner reports a questionable item

A learner can open a public reporting flow from a question without the application collecting PII.

Acceptance outcome:
- report action identifies the question;
- public UI label is Arabic;
- current implementation routes to a GitHub issue mechanism rather than silently pretending a server feedback service exists;
- future backend feedback remains behind the storage/service contract.

### Scenario 7 — Future account capability is added

At a later date, the owner introduces login, synchronized progress, ratings, and comments.

Acceptance outcome:
- UI/study logic does not need to be rewritten around a provider-specific auth SDK;
- identity is accessed through a narrow provider boundary;
- anonymous local state can be linked to an authenticated account under an explicit migration/linking flow;
- passkeys/WebAuthn-capable managed identity is preferred over a bespoke password system.

## Functional requirements

FR-001. The public product MUST remain usable without a production backend until a separate server-deployment feature is approved.

FR-002. The public UI MUST remain Arabic-first. Technical English terminology may appear when educationally relevant.

FR-003. UI chrome and About copy MUST NOT expose developer-agent/provider names, internal version history, task IDs, owner-only language, changelog language, debugging text, TODO/FIXME content, or model/provider references used only during development.

FR-004. Educational content MAY mention AI vendors, models, standards, APIs, and products when technically relevant to the learning objective.

FR-005. Runtime state MUST have one canonical persisted representation and a versioned migration path from known pre-v6 shapes.

FR-006. The anonymous UUID MUST remain the only user identifier in the public application before authentication is separately implemented.

FR-007. The public application MUST NOT collect names, emails, phone numbers, device fingerprints, passwords, or secret credentials.

FR-008. Future authentication MUST be introduced through an identity-provider boundary. The current phase defines the boundary only; it does not implement login.

FR-009. Future authentication SHOULD use a managed, standards-based, passkey/WebAuthn-capable provider rather than a bespoke password database.

FR-010. Future ratings and comments MUST be introduced through service contracts with moderation and abuse-control requirements defined before activation.

FR-011. Mastery, readiness, review scheduling, and adaptive mission ranking MUST remain in pure shared logic modules and MUST be testable independently of DOM code.

FR-012. Browser behavior MUST be tested by executing the built site in real browser engines before deployment. Chromium and WebKit are mandatory. Chromium desktop and mobile-size coverage are required.

FR-013. Core E2E flows MUST fail on pageerror or unexpected console.error.

FR-014. Browser tests SHOULD prefer role/accessibility-name locators. Stable data-testid values MUST be added where generated or ambiguous interactions cannot be reliably selected semantically.

FR-015. The core E2E scope MUST include boot, onboarding, complete diagnostic, two-attempt behavior, session progress, adaptive session 14, mixed session 15, error bank, spaced review, bookmark/note persistence, search, cases, settings, export/import, state migration, report flow, offline behavior, accessibility smoke, public-copy audit, and answer-position runtime audit.

FR-016. Service-worker behavior MUST be verified in browser execution, including registration, expected cache version, offline reload, and cache-asset availability.

FR-017. Playwright WebKit evidence MUST NOT be represented as physical iPhone/Safari evidence.

FR-018. Post-deploy live verification MUST execute at least boot/onboarding/offline smoke against the live URL once a safe release mechanism is defined.

FR-019. Automatic rollback MUST NOT be claimed until a deterministic rollback mechanism has itself been verified. Until then, a post-deploy failure must mark release red, identify the last known-good release, and provide a tested rollback procedure.

FR-020. Content-quality gates MUST be applied before any bulk rewrite is accepted.

FR-021. The following content gates are PROVISIONAL through 2026-10-07 and may change only with measured data recorded alongside the change: four options per question; answer-index maximum 35%; correct-is-longest maximum 40%; no option shorter than 12 characters; at most 15 definition-style items; difficulty 1–3 on every item; explanation covers the correct answer and every wrong option.

FR-022. The content gate MUST require unique options and a valid answer index.

FR-023. Each question topic MUST map to a defined learn topic, and topic coverage MUST be measured before final minimum-per-topic thresholds are enforced.

FR-024. Uncertain technical claims MUST be marked needs_review and MUST NOT be guessed into correctness.

FR-025. Content rewrite MUST be a separate level after runtime, architecture, browser tests, and quality gates are stable.

FR-026. The existing official domain weights MUST remain unchanged unless the owner supplies newer official material.

FR-027. The public-release readiness report MUST distinguish VERIFIED, PARTIAL, and MISSING and include evidence appropriate to each claim.

FR-028. Accessibility MUST be validated on core screens with automated tooling plus a documented manual-review requirement. The root document MUST remain Arabic/RTL and interactive controls MUST have accessible names.

FR-029. Performance thresholds MUST be derived from a measured baseline before becoming hard release gates. Lighthouse measurements are required, but an arbitrary all-categories >=90 threshold is not adopted until the baseline and failure modes are recorded.

FR-030. No code, CI, data, or runtime implementation is part of the current pre-implementation feature. This feature stops after Spec Kit analyze.

## Public copy requirements

The public interface must remove or avoid:
- V2, V3, V4, V5, or PWA V* as public product labels;
- developer changelog headings;
- owner-specific references such as “the image you have”;
- English “Report a question” chrome;
- legacy-version export filenames;
- Claude, ChatGPT, GPT, or OpenAI when they are development residue rather than educational content;
- Markdown artifacts, TODO/FIXME, placeholder prose, and debug logs.

The About area may expose a single public product version string if the owner keeps that policy; the current requested value for the next public-ready implementation is “6.0”. Vendor/model names remain forbidden in About copy unless the product truly depends on them as a user-facing service and that dependency is separately approved.

## Content-quality requirements

The current content-quality thresholds are intentionally provisional. Research reviewed during pre-implementation shows strong support for plausible distractors, structured item-review rubrics, scenario/context-rich items, blueprint coverage, and empirical item analysis; it does not establish that exactly four options, a 35% answer-position cap, a 40% longest-answer cap, or a 12-character minimum are universally optimal psychometric constants. Those values are therefore engineering anti-pattern gates for the first rewrite, not claims of psychometric optimality.

After real learner-response data exists, review must consider item difficulty, discrimination, distractor functioning, response-time anomalies, and option-selection distribution before threshold changes.

## Non-goals

- No production FastAPI/PostgreSQL/n8n deployment.
- No accounts or login implementation.
- No email collection.
- No user comments or ratings implementation.
- No current-question rewrite during runtime recovery.
- No claim that the training bank reproduces the official SDAIA exam.
- No claim that WebKit automation equals physical Safari on iPhone.

## Success criteria

SC-001. Pre-implementation artifacts pass a consistency analysis with no unresolved constitution violations.

SC-002. The implementation plan has explicit levels 0–8 and each level has entry/exit gates.

SC-003. Every implementation task has files touched, acceptance criterion, and evidence required.

SC-004. The three foundation-shaping decisions have a current multi-source research record and explicit confidence.

SC-005. All conflicts between the two owner-supplied specifications are recorded and resolved.

SC-006. The package stops before implementation and ends with “READY FOR REVIEW — implementation not started”.

## Clarifications

### Session 2026-09-07

Q1. Does “10-source research standard” mean every small decision needs ten sources?
A1. No. Per owner amendment, it applies to identity/passkeys, PWA/Safari/iOS, and content-quality gates. Other decisions may rely on repository evidence or owner specs with a one-line rationale.

Q2. Are the numeric content gates psychometric best-practice claims?
A2. No. They are provisional engineering gates with review date 2026-10-07. Changing them requires measured data.

Q3. Should test selectors be data-testid only?
A3. No. Semantic role/accessibility-name selectors are preferred; data-testid is required for unstable/generated interactions. This resolves the conflict between the public-readiness spec’s testid-only rule and the project constitution’s accessibility-first direction.

Q4. Must live E2E automatically roll back production after a post-deploy failure?
A4. Not in the first implementation unless rollback is separately proven deterministic. The initial gate must fail red and provide a tested rollback path. This avoids introducing an unverified destructive release mechanism.

Q5. Is physical iPhone Safari required to declare all implementation tasks green?
A5. No for automated CI readiness; yes for a claim specifically labeled “physical iPhone Safari verified”. Without owner/device evidence that item remains MISSING.

Q6. Should the next implementation immediately rewrite all questions?
A6. No. Runtime recovery, foundation, copy cleanup, browser E2E, offline reliability, and content gates precede bulk rewrite.

Q7. Should future login be built now?
A7. No. Only the identity boundary and future data/linking model are planned now.

Q8. Should the project build passwords itself later?
A8. No. Prefer a managed standards-based identity service with WebAuthn/passkey support.

Q9. Are community comments and ratings current scope?
A9. No. Contracts and future data model only; activation requires backend persistence, moderation, abuse controls, privacy policy, and identity decisions.

Q10. Is a production server part of this feature?
A10. No. Existing server code remains test-only. No server deployment is planned here.
