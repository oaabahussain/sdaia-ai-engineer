# B3 Content Model v2 — Whole-Branch Review

**Date:** 2026-09-27
**Base:** `main@0f0fe756181a6409de7ab0424e6da4e38603628b`
**Branch:** `impl/b3-content-model-v2`
**PR:** #11

Final review: self-review (no subagent tool)

## Review scope
Domain identity/versioning, seven-domain mapping, deterministic question payload, RuntimeBundleV3, legacy V2 normalization, StateV2 preservation, browser/API/server parity, offline/Pages/live behavior and legacy structural-key leakage.

## Review focus
1. Deterministic generation drift: protected by historical seed alias and bank digest compatibility test; current 1,120 payload test green.
2. Unknown/ambiguous legacy aliases: normalization throws; dedicated tests green.
3. Partial migration: canonical validator + schema + acceptance/leakage tests cover profile/concepts/presentation/catalog.
4. State/history loss: StateV2 contract and question IDs unchanged; existing migration/state suite remains green.
5. Mixed V2/V3 runtime semantics: content-model-v2 capability gates contract 3; server/browser/API contracts agree.

## Findings
### Critical
None identified.

### Important
None remaining after implementation/debugging fixes.

### Minor
- The B3 plan proposed a dedicated exact generated-payload fixture file containing a computed digest. Existing repository `current-bank-counts.expected.json` already contains the authoritative `legacy_payload_sha256` and the B3 bank test projects stable IDs back to legacy display identity before hashing. The additional B3 digest fixture is metadata-only and redundant. Deferred rather than duplicating the same authority.

## Compatibility
- TrackRegistryV1 unchanged.
- TrackManifestV1 schema unchanged; capability extended.
- TrackPresentationV1 unchanged; domain-label keys are now stable IDs.
- StateV2 unchanged.
- Question IDs/family IDs/concept IDs preserved.
- Generated count 1,120 preserved.
- Weighted 200 allocation preserved: 36/35/33/29/28/25/14.
- Concept chunks remain outside shell precache.

## Evidence before final integration
Quality run 210: Node 129/129 PASS; validator, app parse, SW verifier, Pages artifact/live verifier, browser smoke PASS.
Server/adapter run 607: SUCCESS including Python server, SQLite, browser adapter and API adapter.

Merge is gated on fresh exact-head CI after this review document/checkpoint is committed.
