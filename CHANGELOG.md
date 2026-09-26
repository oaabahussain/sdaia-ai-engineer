# Changelog

## Unreleased

### Programme A — repository and runtime contract stabilisation

Implemented on the Programme A branch; this entry does **not** claim that the work has been merged to `main` or deployed.

- Frozen the pre-Programme-A learner-visible compatibility baseline.
- Added canonical TrackManifestV1 and ExamProfileV1.
- Added stable question/family IDs and legacy generated-ID mapping.
- Added StateV2 and neutral browser storage/anonymous-ID namespaces.
- Unified browser/API public RuntimeBundleV2.
- Drove exam behaviour from the canonical exam profile.
- Repaired service-worker/offline behaviour and removed unusable inline fallback.
- Repaired public feedback submission paths.
- Quarantined the legacy 121-item static bank and removed competing active legacy paths.
- Made CI/Pages validation manifest-driven and excluded `data/legacy/` from the public artifact.
- Added architecture, migration, testing, deployment, data-model, security, handoff and ADR documentation.

### Known gaps

- 14,000+ content expansion has not started.
- Current SDAIA weights/exam rules remain `project-reference-unverified`.
- Protected content delivery and production authentication are not implemented.
- The planned rollback tag `pre-programme-a-2026-09-23` has not been verified on the GitHub remote; the baseline SHA remains authoritative.
