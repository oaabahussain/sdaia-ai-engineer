# K3 Task 29 Pages objective-registry scope ruling

**Date:** 2026-10-07
**Status:** APPROVED NARROW RELEASE-BOUNDARY REPAIR

## Observed failure

The Task 29 source service worker correctly precaches the canonical governed objective registry at:

`data/factory/knowledge/objectives.json`

Source-tree service-worker verification passes. The Pages artifact gate fails because `scripts/build_pages_artifact.js` does not copy that file into `_site`.

This makes the install-time offline dependency graph incomplete even though the source repository is correct.

## Ruling

Task 29 may additionally modify `scripts/build_pages_artifact.js` solely to publish the existing canonical objective registry required by the Task 29 browser evidence path.

The builder must copy only the specific canonical objective file needed at runtime. It must not publish the rest of the factory workspace or `src/platform-kernel`.

The Task 29 packet compiler is augmented deterministically with this one additional allowed path.

No event contract, learner-visible content, objective identity, scoring behavior, or Task 30 synchronization behavior changes under this ruling.
