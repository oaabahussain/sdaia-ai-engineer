# B2 Track Registry — Whole-Branch Review

**Date:** 2026-09-27
**Base:** `main@f25c8b9b64c367130e36a2251b2e2b727c1dc0e4`
**Branch:** `design/b2-b3-forward-plans`
**PR:** #10

Final review: self-review (no subagent tool)

## Scope reviewed

Registry schema/data, tooling validation, runtime resolver precedence, neutral selection persistence, StateV2 isolation, browser/API explicit track selection, server registry default, app/feedback bootstrap, service-worker/offline derivation, Pages/live release derivation, fixture exclusion, compatibility/leakage tests and CI evidence.

## Findings

### Important — runtime registry validator was less strict than TrackRegistryV1 schema

The runtime validator enforced version/non-empty/unique/default membership but initially accepted undeclared top-level or entry fields. A corrupt registry could therefore pass browser bootstrap while failing repository schema validation.

Disposition: **fixed via TDD**.

- RED commit: `909f102ff6ed52a55ac3d4370466fe5d831adfbd`
- RED evidence: quality-gate run 173, test 118 `runtime registry validator rejects undeclared fields` failed with `Missing expected exception`.
- GREEN implementation: `4ebdb386ce81ad1343058c4973e9d4c1222e1d4c` closes runtime top-level and entry keys.

### Critical

None found.

### Remaining Important

None identified after the fix above.

### Minor deferred

None recorded.

## Review focus disposition

1. Stale saved ID: resolver falls requested → saved → default; browser smoke seeds stale preference and proves default bootstrap.
2. Explicit API non-default selection: adapter encodes `track_id`; server bounds unknown IDs with `invalid_track` 404.
3. Duplicate/missing/default-absent registry: tooling/runtime validation rejects invalid registries; runtime closed-field gap fixed above.
4. Offline reload: registry + registry/selection modules are shell cached; SW verifier derives production package requirements; browser smoke proves offline cached reload.
5. Fixture publication: synthetic track exists only under `tests/fixtures`; production registry remains one entry; workflow artifact inputs do not copy tests fixtures.

## Compatibility

TrackManifestV1, TrackPresentationV1, RuntimeBundleV2 and StateV2 schema/version remain unchanged. Current SDAIA ID/version/profile/domain keys/question IDs, 1,120 rendered bank, 200-question profile, scoring/weights/history/confidence and public URL behavior remain under regression coverage.

## Gate

The review is acceptable only after fresh CI on the review-fix head is green. No merge claim is made by this document.
