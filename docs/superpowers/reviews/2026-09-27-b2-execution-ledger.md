# B2 execution ledger — plan: docs/superpowers/plans/2026-09-27-b2-track-registry.md

Execution mode: Native / Superpowers executing-plans.
Spec authority: `docs/superpowers/specs/2026-09-27-b2-track-registry-design.md`.
Isolation: GitHub branch `design/b2-b3-forward-plans`; local clone/worktree unavailable because container DNS cannot resolve github.com.

Ruling: use tracked repository ledger/checkpoint in place of the git-ignored SDD workspace — preserves recovery across harness interruption — cost if wrong: no local task-start/task-done automation; commits and CI become the authoritative execution record.

Pre-flight shared interfaces:
- Tasks 3→4→5→6→7→8: TrackRegistryV1 schema/registry/tooling validator are sequential and names align.
- Tasks 9→10→15→17: runtime registry resolver + neutral selection are shared; interfaces align.
- Tasks 12→13→15: common adapter contract becomes `loadBank(trackId)`; browser/API/app consumers align.
- Tasks 13→14: API explicit selection and server registry default both preserve RuntimeBundleV2.
- Tasks 15→16: app selection consumes existing StateV2 `tracks[trackId]`; no StateV2 version bump.
- Tasks 18→21: browser smoke consumes registry bootstrap and offline shell assets.
- Tasks 19→20: SW asset list and verifier both consume registry-derived production tracks.
- Tasks 22→23→24: live verifier becomes registry authority; workflows delegate package validation; fixtures remain excluded.
- Tasks 25→26: leakage contract feeds whole-suite acceptance.
Pre-flight: no interface conflict found against the approved B2 spec.

Task 1: complete — baseline and coupling inventory recorded. Baseline product evidence is inherited only as starting evidence, not B2 completion evidence.
Next exact task: Task 2 — add B2 acceptance contract in RED.

Task 2: complete — RED proven by PR #10 quality-gate run 130 (36298495143): four B2 acceptance tests failed for the intended missing registry/runtime boundaries; server/adapter run 413 remained green.
Task 3: partial GREEN — TrackRegistryV1 schema contract tests 106–107 pass in quality-gate run 132; schema is closed at top-level and entry level. Ruling: the broader Task 2 acceptance RED existed before the schema commit, but the strict arbitrary-field assertion was introduced with the schema rather than observed independently RED; do not count Task 3 fully TDD-complete until a regression RED is demonstrated or the task is reworked. Cost if wrong: reduced proof that the strictness test detects regression, not a known product defect.
Task 4: GREEN evidence — canonical production registry test 108 passes in quality-gate run 132; production registry remains one SDAIA entry. Task 4 is not checkpoint-complete until Task 3's TDD evidence is repaired.
Current CI expected RED: acceptance tests still fail because `src/tracks/registry.js`, removal of `ACTIVE_TRACK_ID`, explicit adapter `loadBank(trackId)`, and registry-driven release/SW work belong to later tasks.
Next exact task: repair Task 3 TDD evidence, then continue Task 5.

Task 3: complete — repaired TDD evidence with regression RED→GREEN. Run 134: test 107 failed expected false/actual true after strictness was intentionally disabled; commit 997a0fc restored closed objects; run 135 test 107 GREEN. The earlier partial-evidence ruling is superseded by this explicit regression proof.
Task 4: complete — canonical production registry test 108 is GREEN; registry is schema_version 1, default `sdaia-ai-engineer`, one production entry.
Checkpoint A2 status: Tasks 3–4 complete. Expected branch CI remains RED only on later B2 acceptance boundaries.
Next exact task: Task 5 — tooling registry loader.

Task 5: implemented — tooling loadTrackRegistry(root) added; RED observed in run 138 as missing export before implementation.
Task 6: implemented — semantic registry validation rejects empty/default-absent/duplicate IDs and canonical validator consumes registry.
Task 7: implemented — validateRegistryContract iterates registry entries and validates manifest/presentation identity.
Task 8: implemented — synthetic example-track fixture package + two-track registry fixture under tests/fixtures only.
Task 9: implemented — runtime registry loader/validator/resolver; requested → saved → default precedence.
Task 10: implemented — neutral selection key learning-platform.track-id.v1, outside StateV2.
Task 11: implemented — ACTIVE_TRACK_ID removed; Programme A acceptance updated for registry bootstrap.
Task 12: implemented — browser/interface loadBank(trackId).
Task 13: implemented — API loadBank(trackId) and /v1/bank?track_id= selection.
Task 14: implemented — server default derives from tracks/registry.json; TRACK_ID fallback removed.
Task 15: implemented — app loads registry, resolves/saves selected ID, then loads explicit bank.
Task 17: implemented — feedback shares registry + selection modules.
Task 18: implemented — browser smoke derives TRACK_ID from registry and seeds stale saved ID to prove fallback.
Task 19: implemented — SW caches registry bootstrap modules/data.
Task 20: implemented — SW verifier derives manifest requirements from production registry.
Task 22: implemented — live verifier iterates registry entries and reports registry summary.
Task 23: implemented — CI/Pages hard-coded SDAIA presentation assertion replaced by registry assertion.
Task 25: implemented — leakage regression scans runtime/release surfaces for ACTIVE_TRACK_ID and pinned manifest path.
Debugging ruling: server/adapter run 468 failed because scripts/contract_test.js still imported removed ACTIVE_TRACK_ID. Root cause was a stale test consumer, not runtime code. Fixed at source by deriving default ID through tooling loadTrackRegistry and passing it explicitly to loadBank(trackId).
Current verification: fresh quality-gate run 160 and server/adapter run 480 are in progress on c7c5ad6. Do not mark Tasks 5–25 complete until these runs finish and remaining Task 16/21/24 assertions are closed.
Next exact task: inspect run 160/480 results; systematic-debug any failure; close Tasks 16,21,24; then Task 26 full acceptance.
