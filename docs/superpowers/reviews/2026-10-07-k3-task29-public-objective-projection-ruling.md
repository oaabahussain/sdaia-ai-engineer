# K3 Task 29 public objective projection ruling

**Date:** 2026-10-07  
**Status:** APPROVED / SUPERSEDES DIRECT FACTORY PUBLICATION

## Finding

The first Pages repair attempted to publish `data/factory/knowledge/objectives.json` directly. Existing H0 governance correctly rejects any `data/factory` content in the public Pages artifact.

The browser evidence path still requires the governed objective mapping offline.

## Ruling

Keep `data/factory` private from Pages.

Task 29 may create the runtime projection:

`data/evidence/sdaia-ai-engineer.objectives-v1.json`

The projection is an exact semantic copy of the canonical governed registry at:

`data/factory/knowledge/objectives.json`

Task 29 tests must compare the public projection with the canonical registry and fail on drift.

The browser, service worker, and Pages builder consume/publish only the `data/evidence` projection. The factory path remains forbidden in the public artifact.

This is a release-boundary projection only. It creates no new objective identities, changes no objective semantics, changes no learner-visible content, and does not make factory governance artifacts public.

The earlier direct-factory-publication repair is superseded by this ruling.
