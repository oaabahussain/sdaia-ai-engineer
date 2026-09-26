# ADR 0001 — Canonical Track Runtime Contract

**Status:** Accepted  
**Date:** 2026-09-23

## Context

The repository previously exposed competing browser/API content sources and duplicated exam assumptions.

## Decision

Use a versioned `TrackManifestV1` plus `ExamProfileV1` as canonical track/exam configuration. Browser and API adapters expose the same `RuntimeBundleV2`. Exam question counts, section sizes and weights come from the profile rather than core code.

## Consequences

- Track-specific rules become data rather than core constants.
- Release verification follows manifest references.
- New tracks should be packages/contracts, not application forks.
- Current profile evidence remains explicitly `project-reference-unverified`.
