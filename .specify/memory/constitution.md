# SDAIA AI Engineer Study Space Constitution

Version: 1.0.0
Ratified: 2026-09-07
Status: Binding for this project

## I. Specification before implementation

No application code, tests, CI configuration, data, content, deployment configuration, or runtime behavior may be changed until the active feature has completed the Spec Kit sequence through analyze. The required order is constitution -> specify -> clarify -> plan -> tasks -> analyze -> implementation. Implementation is explicitly outside the current phase.

A missing requirement discovered during later work must be written back into the specification or tasks before it is implemented. The team must not discover the plan while coding.

## II. Evidence before claims

A claim is VERIFIED only when supported by reproducible evidence appropriate to the claim: command output, CI output, browser execution, live-site verification, deterministic comparison, committed artifact, or physical-device evidence. Syntax checks and unit tests do not prove that the browser application boots.

PARTIAL means implemented or reasoned about but not fully proven. MISSING means absent or untested. Gates must not be weakened to obtain a green result.

## III. Research freshness and diversity

Foundation-shaping decisions require current, diverse evidence. For the following decisions, research must use a minimum of ten credible source families across the decision set, with priority given to material published or materially updated after 2026-05-01:

1. Identity boundary and future passkey/WebAuthn authentication.
2. PWA, service-worker, offline behavior, and Safari/iOS compatibility.
3. Content-quality and assessment-item gates.

Older material may be used only when it remains normative and newer material depends on it. Every research record must state source, date, recommendation, relevance, conflicts, final decision, and confidence.

Other decisions may cite the current codebase or owner-approved specifications with a one-line rationale.

## IV. Public/private separation

The public interface exists for learners. It must not expose owner-only or developer-only material: internal version history, implementation commentary, reviewer names, agent names, task IDs, debugging text, private-source assumptions, roadmap notes, or development-provider references.

AI and vendor terms are allowed inside educational content when technically relevant. They are forbidden as development residue in UI chrome and About copy.

All public UI copy is Arabic-first unless a technical term is intentionally retained in English for learning accuracy.

## V. Runtime behavior is a release gate

Every public release must execute the built application in real browser engines before deployment. Chromium and WebKit coverage is required; mobile-size coverage is required. Each browser flow must treat page errors and unexpected console errors as failures.

The supported public runtime is HTTPS/GitHub Pages. Playwright WebKit is useful evidence but is not equivalent to a physical iPhone running Safari. Physical iPhone/Safari must be reported separately as VERIFIED, PARTIAL, or MISSING.

## VI. Privacy and identity boundary

Today the application uses only an anonymous UUID. No name, email, phone number, password, device fingerprint, or secret credential is collected by the public application.

Future login must be introduced behind an identity-provider boundary, not embedded throughout application logic. The preferred future direction is a managed standards-based passkey/WebAuthn-capable identity solution. The project must not build a bespoke password database.

Authentication, account linking, comments, ratings, centralized progress, and moderation are future capabilities, not current requirements.

## VII. Layered architecture and reversible growth

UI wiring, study logic, storage, identity, content, and future server interfaces must remain separable. The current browser-only product must continue to function without a backend. A later backend should be selectable through a narrow adapter/configuration boundary rather than requiring a frontend rewrite.

Future community features must have explicit contracts before implementation. No server is deployed as part of the current public-readiness work unless separately specified and approved.

## VIII. Content integrity

Question content is a measurement product, not decorative copy. Content rewrite must not be mixed with runtime recovery.

The following content gates are PROVISIONAL until measured learner-response data supports changing them:

- exactly 4 options per question;
- no answer-position index used by more than 35% of questions;
- correct option is the longest option in no more than 40% of questions;
- no option shorter than 12 characters;
- no more than 15 questions explicitly marked as definition style;
- difficulty is 1, 2, or 3 on every question;
- explanation covers the correct answer and every wrong option.

Provisional-gate review date: 2026-10-07. A threshold may change only when the measured data and resulting rationale are recorded. If data is insufficient, the threshold remains unchanged.

Uncertain technical content must be marked needs_review; it must not be guessed into correctness.

## IX. Release discipline

The intended release flow is validate -> unit tests -> adapter/contract tests -> browser E2E against built artifact -> deploy -> live browser/smoke verification -> artifact integrity verification.

Automatic rollback may be used only after a deterministic rollback mechanism has itself been validated. Until then, post-deploy failure must turn the run red, identify the last known-good artifact/commit, and expose a tested rollback procedure rather than pretending rollback is automatic.

## X. Accessibility, performance, and offline behavior

Accessibility, mobile layout, offline behavior, and performance are product requirements. Automated accessibility tools supplement rather than replace human review. Service-worker registration, cache contents, offline reload, and cache upgrade behavior require browser evidence.

## XI. Governance

This constitution outranks feature plans and task lists. A conflict discovered by analyze is CRITICAL if it violates a MUST in this constitution. The conflict must be resolved by changing downstream artifacts or by an explicit constitution amendment; it may not be silently reinterpreted.

Constitution changes require a recorded rationale and version update.

## XII. Timebox

This pre-implementation package is timeboxed to three working days. If the complete package cannot close within the timebox, the delivered artifacts must state exactly what is incomplete and why. Time pressure does not authorize implementation before the analyze gate.
