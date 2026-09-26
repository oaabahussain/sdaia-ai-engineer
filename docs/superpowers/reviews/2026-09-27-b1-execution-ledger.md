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
