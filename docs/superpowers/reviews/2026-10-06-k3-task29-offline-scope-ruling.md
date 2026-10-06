# K3 Task 29 — Offline Update Scope Ruling

**Date:** 2026-10-06  
**Type:** High-reasoning preparation ruling  
**Status:** APPROVED SCOPE REPAIR / PRODUCT NOT STARTED

## Finding

Task 29 creates `src/evidence/appBridge.js` and consumes the Task 28 recorder/module graph from `src/app.js`.

The current service worker precaches `src/app.js` but cannot automatically know future evidence modules. If a new service worker activates before the new page has loaded online, the cached new `src/app.js` can reference uncached modules and the first new-version navigation can fail offline. The existing browser smoke primarily proves online load followed by offline reload and does not prove this update-before-warmup path.

That would violate the approved K3 specification's offline/service-worker compatibility baseline.

## Ruling

Keep the approved Task 29 semantics, approved spec hash, approved plan hash, exact RED/GREEN command, and Product commit message unchanged.

Narrowly augment the deterministic Task 29 packet scope to allow modification of:

- `sw.js`;
- `scripts/browser_smoke.py`.

Task 29 must ensure the new browser evidence import graph is available at the install-time offline boundary and must test:

**service-worker update → network offline → first new-version navigation**, without requiring prior online warming of the new evidence modules.

This is a scope/verification repair, not a learner-visible behavior change.

## Regression-file ruling

`tests/k1-current-runtime-regression.test.js` already exists, while its approved task-source clause was compiled as an allowed-create/test path. The scope guard treats modified and added paths separately.

Therefore for Task 29 this existing file is **read/run-only**. Do not modify it. Put new Task 29 assertions in `tests/k3-app-evidence-integration.test.js`.

The same applies to Task 30's existing `tests/storage.api.test.js`: it is **read/run-only**. Put new Task 30 assertions in `tests/k3-storage-sync-capability.test.js`.

## Determinism

The packet compiler carries the narrow Task-29 scope augmentation, following the repository's existing precedent for task-specific governed scope additions. The regenerated `task-029.json` must remain deterministic under `npm run process:verify`.

Task 28 and Task 30 packets remain unchanged.

## Boundary

No Task 28/29/30 Product implementation or RED execution is performed by this ruling.

Task 28 remains NEXT and NOT STARTED. Task 29 remains blocked on Task 28 post-merge closure. Task 31 remains out of scope.
