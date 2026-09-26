# ADR 0002 — Neutral Storage Namespace

**Status:** Accepted  
**Date:** 2026-09-23

## Context

Legacy browser keys were SDAIA-specific and unsuitable for a reusable platform.

## Decision

Canonical keys are:

- `learning-platform.state.v2`
- `learning-platform.anon-id.v1`

Legacy keys remain migration inputs. Existing anonymous IDs are reused and copied into the canonical key. Old keys are not deleted in Programme A.

## Consequences

- Existing learners can migrate without silent state loss.
- Core storage naming is not tied to one track.
- Future removal of legacy reads requires a separately governed migration.
