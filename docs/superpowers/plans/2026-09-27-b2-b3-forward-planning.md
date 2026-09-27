# B2/B3 Forward Planning Brief

**Date:** 2026-09-27
**Base:** `main@f25c8b9b64c367130e36a2251b2e2b727c1dc0e4`
**Status:** Planning brief only — no B2/B3 implementation authorized by this document

## Intent

Prepare the next two architectural programmes after B1 while preserving the governing rule: **the track is data; the learning platform is code.** B2 makes track discovery/selection generic. B3 then replaces human-readable domain strings as structural identifiers with stable content identifiers. The order is deliberate: registry first, content-model migration second.

## B2 — Track Registry

### Goal
Remove the single-track bootstrap assumption without adding a second production track yet. The platform must discover a validated set of packaged tracks, resolve an active track deterministically, and preserve existing SDAIA URLs/state/behavior.

### Proposed contract
Introduce a declarative registry (working name `tracks/registry.json`) whose entries reference track IDs and expose only discovery/selection metadata needed before a track manifest/presentation is loaded. Keep TrackManifestV1 and TrackPresentationV1 authoritative for track details; do not duplicate exam/content truth in the registry.

### Core boundaries
- Replace direct runtime dependence on `ACTIVE_TRACK_ID='sdaia-ai-engineer'` with a registry/selection resolver.
- Preserve `sdaia-ai-engineer` as the default/only packaged track during B2 acceptance.
- Add deterministic selection precedence and safe fallback for invalid/stale saved track IDs.
- Namespace future track-specific learner state without invalidating current StateV2 data; if StateV2 cannot represent multi-track state safely, design the migration explicitly rather than silently changing it.
- Make service-worker, Pages artifact, live verifier and browser smoke derive packaged tracks from the registry instead of hard-coded SDAIA paths.
- Do not add a visible track selector until at least two validated tracks exist unless the B2 design explicitly justifies a disabled/single-item control.

### Suggested stages
1. B2-A — freeze post-B1 baseline and inventory every `ACTIVE_TRACK_ID`/hard-coded active-track path.
2. B2-B — design `TrackRegistryV1`, selection semantics and compatibility/state migration boundary.
3. B2-C — TDD tooling validator/loader for registry entries and cross-document identity.
4. B2-D — TDD browser registry loader + active-track resolver with single-track compatibility.
5. B2-E — remove hard-coded release/offline artifact paths and derive them from registry.
6. B2-F — browser acceptance: default selection, stale selection fallback, offline reload, feedback identity, unchanged SDAIA exam behavior.
7. B2-G — leakage scan, whole-branch review, integration and post-merge verification.

### Explicit non-goals
No second content track, no Content Model v2, no stable domain-ID migration, no question expansion, no adaptive learning, no AI tutor, no CMS/auth/backend redesign.

### Exit gate
B2 is complete only when adding a second *fixture* registry entry in tests proves the platform/tooling can discover and isolate multiple tracks without changing production SDAIA behavior, while the production package may still contain only SDAIA.

## B3 — Content Model v2 / Stable Domain IDs

### Goal
Stop using human-readable domain labels such as `MLOps / LLMOps` as structural keys. Introduce stable domain/content identifiers so labels can change, translate and evolve without breaking weights, progress, analytics, question ownership or future track portability.

### Proposed contract direction
Define stable domain IDs (for example opaque/sluggified identifiers chosen by the B3 design, not by this brief) and a versioned content model that separates identity from localized presentation. Presentation continues to own localized labels; exam profiles and content references use stable IDs.

### Migration principles
- Never rewrite learner progress destructively.
- Provide an explicit old-domain-key → stable-ID migration map and test it against current StateV2/history data.
- Preserve question IDs unless a separate evidence-backed reason requires changing them.
- Keep weights/scoring behavior numerically identical across migration.
- Validate referential integrity across manifest/profile/concepts/questions/presentation.
- Support round-trip fixtures proving old B1/B2 data resolves to the same seven logical domains after migration.
- Decide contract versioning deliberately: if TrackManifestV1/RuntimeBundleV2/StateV2 cannot express the new identity model, introduce the smallest justified next versions with compatibility adapters and fixtures.

### Suggested stages
1. B3-A — freeze B2 baseline; inventory every domain string used as identity across data, runtime, state, tests and analytics.
2. B3-B — design stable Domain/Content Model v2 contracts and migration/versioning policy.
3. B3-C — RED compatibility fixtures for all seven current domains, weights, question ownership and learner state.
4. B3-D — implement schema/tooling migration layer and strict referential-integrity validation.
5. B3-E — migrate canonical SDAIA track data while preserving labels in TrackPresentationV1 (or a deliberately revised presentation contract if required).
6. B3-F — runtime compatibility adapter + state/history migration; verify no learner progress loss.
7. B3-G — offline/API/SQLite/release/browser acceptance and old-fixture compatibility.
8. B3-H — whole-branch review, integration and post-merge verification.

### Explicit non-goals
No 14,000-question generation, no Question Factory v2 implementation, no adaptive scheduling/mastery, no AI tutor, no psychometric calibration. B3 creates stable content identity that those later systems can safely depend on.

### Exit gate
All seven current domains have stable IDs; labels remain presentation data; current weights/scoring/question counts and learner progress are equivalent before/after migration; old compatibility fixtures remain readable; new validators reject dangling/duplicate domain references.

## Dependency rule

`B1 Presentation Contract → B2 Track Registry → B3 Content Model v2 → Question Factory v2 → large-scale content expansion`

Do not reverse this order. In particular, do not generate the large question expansion before stable content identity and the Question Factory quality pipeline exist.

## Planning gates

These are forward planning briefs, not approved implementation specs. Before B2 implementation, Superpowers brainstorming must produce and receive approval for the B2 written design, then `writing-plans` must produce the detailed TDD implementation plan. B3 receives the same design/plan cycle only after B2 is merged and verified, so its plan is based on the real B2 baseline rather than assumptions.
