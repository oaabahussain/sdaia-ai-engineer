# Contract: Browser and Release Evidence

Status: Design contract only; no CI change is authorized in this phase.

## Purpose

Define what evidence a future implementation must produce before public-readiness claims are accepted.

## Browser matrix

Required automated engines/profiles:
- Chromium, mobile viewport 390x844
- Chromium, desktop viewport 1280x800
- Playwright WebKit, mobile viewport 390x844

Physical-device evidence class:
- Real iPhone Safari, separately recorded when available

Playwright WebKit MUST NOT be relabeled as physical iPhone Safari.

## Per-test error contract

Every E2E test must collect:
- pageerror events
- console.error messages

Expected result for core flows:
- pageerror count = 0
- unexpected console.error count = 0

An explicitly induced/recovery-path console error may only be allowed when the test identifies and asserts it intentionally.

## Core E2E inventory

E2E-01 Boot and mobile overflow
E2E-02 Onboarding and state persistence
E2E-03 Full 21-question diagnostic and readiness equivalence
E2E-04 Two-attempt behavior
E2E-05 Session progress and mastery movement
E2E-06 Runtime population of sessions 14 and 15
E2E-07 Error-bank classification and priority
E2E-08 Spaced review progression/reset
E2E-09 Bookmark and note persistence
E2E-10 Search
E2E-11 Case-study rendering
E2E-12 Theme/focus/timer settings
E2E-13 Export/import equivalence and state-schema validation
E2E-14 Legacy-state migration
E2E-15 Question report URL semantics
E2E-16 Service-worker registration/offline reload/cache version
E2E-17 WebKit repeat of boot/onboarding/diagnostic
E2E-18 Accessibility smoke
E2E-19 Rendered-DOM public-copy audit
E2E-20 Runtime answer-position audit

## Selector policy

Preferred:
1. semantic role + accessible name;
2. stable label;
3. data-testid for generated/ambiguous interactions.

Critical generated controls must have stable test identifiers when semantic selection alone would be ambiguous, including option index, confidence controls, bookmark, note, report, next, dynamic session entries, readiness/mastery values, error-bank items, and heatmap cells.

## Built-artifact gate

Before deployment:
- validate schemas/content;
- run Node unit tests;
- run adapter/contract tests;
- build _site;
- verify every service-worker asset exists in _site;
- serve _site over local HTTP;
- run required browser E2E against _site;
- run copy audit and accessibility checks.

## Live gate

After deployment, minimum live smoke:
- boot
- onboarding/state write
- service-worker/offline behavior when the runner/browser environment supports deterministic testing
- live index/source integrity hash
- live src/app.js HTTP 200
- live questions JSON parses and expected question count matches release manifest
- expected service-worker cache version

## Rollback rule

The first implementation must not claim automatic rollback unless rollback has itself been tested end-to-end.

If live smoke fails and deterministic automatic rollback is not yet proven:
- mark the run red;
- record the previous known-good commit/artifact;
- output an exact tested rollback procedure;
- do not advance the readiness status to GO.

## Screenshot and report evidence

A future readiness report should commit screenshots for representative test/screen/engine combinations where screenshots materially support the claim. It need not generate redundant images for invisible backend-only assertions.

## Verification vocabulary

VERIFIED:
- reproducible command/output, CI/browser evidence, committed screenshot, deterministic hash, or physical-device evidence appropriate to claim.

PARTIAL:
- implemented/planned but not fully proven in the required environment.

MISSING:
- not implemented or not tested.
