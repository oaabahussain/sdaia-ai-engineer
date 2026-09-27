# SDD ledger — plan: docs/superpowers/plans/2026-09-27-b1-track-presentation-contract.md

Execution mode: Native / executing-plans.

Ruling: GitHub branch `design/b1-track-presentation-contract` is the isolated workspace because the harness cannot resolve github.com from the container and exposes no native local worktree tool — branch isolation preserves `main`; cost if wrong: no local task scripts/worktree bookkeeping, mitigated by this durable repository ledger plus PR CI.

Ruling: User instruction “خلص b1 كامل” is treated as authorization to complete B1 through PR merge and post-merge verification if all gates are green — avoids an unnecessary integration pause; cost if wrong: merge occurs without a second prompt, but only after verified branch acceptance and using expected-head SHA.

Pre-flight shared interfaces:
- Tasks 3–8 define/validate `TrackPresentationV1`, consumed by runtime, feedback, release and browser tasks: interface names are consistent with the approved spec.
- Tasks 9–18 split generic i18n from track data; `CORE_I18N[locale].app` and `.feedback` namespaces prevent key collisions.
- Tasks 10–15 share `loadTrackPresentation`, `resolvePresentationLocale`, `getPresentationLocale`, `getDomainLabel`; signatures are consistent.
- Tasks 19–21 reuse the same presentation/core-i18n modules rather than creating a second feedback-specific contract.
- Tasks 23–28 all depend on the same presentation path `tracks/sdaia-ai-engineer/presentation.json`.
- Tasks 29–30 consume all prior evidence and do not introduce new runtime interfaces.

Task 1: complete — baseline SHA, leak inventory, deferred bootstrap literal and compatibility boundary recorded.

Task 2: complete — PR #9 quality run 36274643850 observed intended RED: missing B1 contract files plus SDAIA literals in core/HTML.
Task 3: complete — TrackPresentationV1 schema tests RED on missing schema, then GREEN (2/2 targeted tests) on head 6fa2061.
Task 4: complete — canonical SDAIA presentation test RED on missing file, then GREEN with ar/en identity and seven domain labels on head 7a9fefc.
Task 5: complete — tooling loader test RED with missing presentation return, then GREEN on head 8523c9c.
Task 6: complete — identity mismatch test RED because validator export/behavior was absent, then GREEN on head 0a10bd3.
Task 7: complete — locale mismatch/default tests RED, then GREEN on head 55e0f94.
Task 8: complete — missing domain-label tests RED, then GREEN on head a2122ea.
Task 9: complete — coreI18n import test RED on missing module, then GREEN on head 668989b; broader track-leak acceptance assertions intentionally remain RED for later tasks.
Task 10: Ruling: plan Step 3 included track/version rejection before Task 11's RED tests — implement Task 10 as canonical-path fetch only and defer identity rejection to Task 11 so TDD remains valid — cost if wrong: one-task delay in runtime mismatch protection; CI/release validator already rejects mismatches.


## Recovery checkpoint — 2026-09-27 / Stage B1.4–B1.7

Recovered from GitHub commit history after session interruption; no completed task was re-run.

Task 10: complete — RED commit 14449fa defined canonical presentation loader; GREEN commit 2c9a6d6 added canonical-path fetch. Ruling above preserved identity rejection for Task 11.
Task 11: complete — RED commit e547397 required runtime identity/version rejection; GREEN commit 340786a implemented both.
Task 12: complete — RED commit 65f6adc defined locale intersection/fallback behavior; GREEN commit 31df98e implemented resolver.
Task 13: complete — RED commit 2798c01 defined locale/domain accessors; GREEN commit 404ebc8 implemented safe accessors.
Task 14: complete — RED commit 48cacdd required non-blocking presentation load; GREEN commit 91cb010 integrated presentation loading while server/adapter CI remained green.
Task 15: complete — RED commit 290e157 required resilient presentation view fallback; GREEN commit 6be1d01 implemented fallback while server/adapter CI remained green.
Task 16: in progress — RED commits b97204c + dafc8c8 require presentation-driven brand/hero and repaired the acceptance-test assertion syntax. Current quality-gate failure is expected RED until migration implementation.

Handoff checkpoint:
- authoritative branch: `design/b1-track-presentation-contract`
- recovered HEAD before this checkpoint: `dafc8c8c7a0c6eb81cf200cae04becd16dd3fb88`
- next exact action: Task 16 GREEN — remove SDAIA brand/hero literals from `src/app.js` and `index.html`, add neutral presentation DOM targets, render presentation dynamically, then verify PR quality gate.


## Checkpoint B4 — Tasks 16–18

Task 16: complete — existing RED leakage contract plus added RED generic-title assertion; GREEN migrated main brand/hero/title to presentation data and neutral shell targets. Task-scoped CI assertions `main page brand and hero are sourced from track presentation` and `document title uses generic practice copy` pass on head 8d5c1f5.
Task 17: complete — pre-existing RED `DOMAIN_AR` assertion became GREEN after importing `getDomainLabel` and sourcing domain labels from presentation; CI assertion `core app no longer owns SDAIA presentation literals` passes on head 8d5c1f5.
Task 18: complete — RED canonical-status assertion failed before implementation, then GREEN after `CORE_I18N.*.app.statusNotice` was added and app rendering was driven only by `BANK.track.official_status` + `PROFILE.evidence_status`; hard-coded status notice removed from HTML.
Checkpoint evidence: PR quality gate run 107 reaches Node tests; all Task 16–18 scoped assertions pass. Remaining Node failure is the intentionally future `feedback.html` SDAIA literal assertion for Tasks 19–20, not a B4 regression.
Next exact task: Task 19 RED — require external `src/feedback.js` module and preserve existing feedback semantics during extraction.
