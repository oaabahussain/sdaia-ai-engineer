# ADR 0004 — Legacy Static Bank Disposition

**Status:** Accepted  
**Date:** 2026-09-26

## Context

The former 121-question static bank contains unique authored material but conflicts with the canonical generated RuntimeBundleV2 when kept as an active-looking source.

## Decision

Retain it under `data/legacy/static-bank-v1/` with status `MIGRATE_PENDING` and runtime `NOT ACTIVE`. Do not count it in the 1,120 current runtime or publish it in the Pages artifact.

## Consequences

- No unique authored material is silently destroyed.
- Runtime has one canonical content source.
- A future content programme must semantically review, deduplicate, migrate or retire each useful legacy item.
