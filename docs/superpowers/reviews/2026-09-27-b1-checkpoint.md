# B1 Recovery Checkpoint

**Date:** 2026-09-27
**Branch:** `design/b1-track-presentation-contract`
**Checkpoint:** B4 — Tasks 16–18 complete
**Product HEAD before checkpoint record:** `8d5c1f51d380716e62067246a33d0475bdc259c5`

## Completed parent tasks

Tasks 1–18.

## Latest micro-tasks

- Main HTML shell neutralized with `#brandText`, `#heroEyebrow`, `#heroTitle`, `#heroText`, `#statusNotice`.
- Main brand/hero/document title sourced from TrackPresentationV1.
- Generic localized `practiceLabel` added to core i18n.
- `DOMAIN_AR` removed; domain labels now resolve through `getDomainLabel` with raw-key fallback.
- Track-specific `TRACK_I18N` removed.
- Evidence/unofficial notice now derives only from manifest/profile canonical status.

## RED→GREEN evidence

- Task 16 RED: PR quality gate run 102 failed main-shell presentation assertions; generic-title RED was additionally observed in run 102.
- Task 16 GREEN: run 107 passes main brand/hero and document-title assertions.
- Task 17 RED: run 103 still failed on `DOMAIN_AR`; run 107 passes `core app no longer owns SDAIA presentation literals`.
- Task 18 RED: run 105 failed `status notice is canonical...`; run 107 passes it.

## Current known failure

PR quality gate run 107 still fails the broad HTML-shell assertion because `feedback.html` intentionally remains SDAIA-specific. That is the planned RED boundary for Tasks 19–20, not a Tasks 16–18 regression.

## Next exact task

Task 19 — write/confirm RED requiring `feedback.html` to load `./src/feedback.js` as an ES module and move feedback behavior to that module while reusing `CORE_I18N`.

## Files changed in this checkpoint

- `tests/b1-presentation-acceptance.test.js`
- `src/presentation/coreI18n.js`
- `src/app.js`
- `index.html`
- execution ledger + this checkpoint

## Resume safety

Safe to resume from Task 19. Do not redo Tasks 1–18. Nothing has been merged; `main` remains at the B0 baseline for this branch comparison.
