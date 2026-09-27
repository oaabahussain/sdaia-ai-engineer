# B3 execution ledger — plan: docs/superpowers/plans/2026-09-27-b3-content-model-v2.md

Execution mode: Native / Superpowers executing-plans.
Workspace ruling: this harness has no reliable local GitHub worktree; isolated branch `impl/b3-content-model-v2` is the authoritative workspace. main remains untouched until finishing gate.
Base product SHA: `0f0fe756181a6409de7ab0424e6da4e38603628b`.
Plan/spec commits are inherited from the approved design branch.

Pre-flight shared interfaces:
- Tasks 5–8: DomainCatalogV2 schema/catalog → normalization helpers: aligned.
- Tasks 9–13: V2/V3 schemas → compatibility normalizer: aligned.
- Tasks 14–20: legacy seed compatibility → canonical migration/runtime V3: aligned.
- Tasks 21–25: stable domain_id runtime → StateV2/adapters/server: aligned.
- Tasks 26–31: canonical contracts → validation/offline/release/leakage: aligned.
No interface conflict found against the approved spec.

Next exact task: Task 1 baseline freeze.

Checkpoint A1-D1 implementation summary:
- B3 acceptance RED proven in quality run 177: five intended B3 boundary failures.
- DomainCatalogV2 schema/catalog and seven stable IDs added.
- Explicit seven-entry legacy→stable migration map added.
- Content-model normalization helpers and V2/V3 schemas added.
- Seven canonical concept docs migrated to domain_id.
- Canonical exam profile migrated to schema_version 2 and stable weight IDs.
- TrackPresentationV1 retained; domain_labels now stable-ID keyed.
- Manifest capability content-model-v2 added.
- Runtime loader/tooling upgraded to capability-gated RuntimeBundleV3.
- Question generator emits domain_id and uses legacy seed alias to preserve deterministic educational payload.
- Exam/app consumers migrated to domain_id.
- Server API returns RuntimeBundleV3; browser/API adapter contract expects v3.
- SW caches contentModelV2 module + domains.json; verifier enforces domain catalog without concept-bank precache.
- Live verifier validates content-model capable tracks and emits live content model PASS.
- Compatibility tests updated without changing frozen B2 fixtures.
Debugging rulings:
- Run 192 validator failure root cause: canonical profile moved to schema v2 while validator still compiled v1; validator now capability-selects v2 and passes catalog into generation.
- Run 196 failures were stale B1/B2 compatibility assertions and one deterministic comparison that needed display-label projection; product payload remained pinned via legacy seed alias.
- Run 202 Pages artifact failure root cause: live verifier still required doc.domain; changed verifier to capability-select doc.domain_id.
- Run 591 server failure root cause: server runtime loader still assumed doc.domain and contract v2; upgraded server and contract test to v3.
Fresh evidence at HEAD 1e7728d: quality run 210 reached 129/129 Node PASS, generated 1120 PASS, weighted 200 PASS, SW PASS, live content model PASS, browser smoke PASS. Server/adapter run 607 SUCCESS.
Next exact task: whole-branch review against main@0f0fe756; fix Critical/Important via TDD; then exact-head CI and finishing-a-development-branch.
