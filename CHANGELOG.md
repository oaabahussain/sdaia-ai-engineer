# Changelog

## Unreleased

### Programme A — repository and runtime contract stabilisation

Programme A was merged to `main` and post-merge verified. The bullets below remain the historical implementation record for that programme.

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

### K2 — Coverage Expansion & Controlled Release implementation

K2 was merged through PR #20 and post-merge verified on `main` at product baseline `dced183980199ca8b7e359b48ddc7fd61f29488f`. Its governed expansion, release, observability, persistence, CLI, validation, and privacy infrastructure is now merged while the learner-visible runtime remains 1,120 questions. No K2-generated expansion content is claimed as newly promoted or live.

### Known gaps

- 14,000+ remains a capacity milestone, not a released-content claim; new learner-visible expansion content has not yet been promoted.
- Current SDAIA weights/exam rules remain `project-reference-unverified`.
- Protected content delivery and production authentication are not implemented.
- The planned rollback tag `pre-programme-a-2026-09-23` has not been verified on the GitHub remote; the baseline SHA remains authoritative.
