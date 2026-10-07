# K3 Task 35 clean-wave preparation ruling

**Date:** 2026-10-07
**Status:** APPROVED PREPARATION / PRODUCT NOT STARTED

## Packet scope

The clean baseline already contains:
- `tests/release-contract.test.js`;
- `tests/service-worker-contract.test.js`.

Task 35 compiler/packet preparation reclassifies those exact paths from allowed create to allowed modify. `tests/k3-release-boundary.test.js` remains a new allowed-create path.

## Release-artifact validation

Task 35 introduces a focused exported helper:
`validateK3ReleaseArtifacts(rootDir) -> true | throw`

It must validate at least:
- LearnerEvidenceEventV2 schema can compile;
- EventDefinitionV2 schema can compile;
- every governed K3 learner-evidence definition conforms and references an existing payload schema;
- governed xAPI mapping is exactly `xapi-k3.v1` / xAPI 2.0;
- governed Caliper mapping is exactly `caliper-k3.v1` / Caliper 1.2;
- mapping artifacts contain required adapter/version metadata.

The normal `npm run validate` path invokes this helper against the repository root.

## CI boundary

Both PR quality and Pages release workflows must exercise:
- Node validation/tests;
- Python server tests;
- browser smoke.

The separate server-adapter workflow remains useful; Task 35 intentionally makes the release path independently prove the Python/server contract as required by the approved plan.

## Public/private boundary

Public Pages includes browser-required K3 runtime context/definitions/payload schemas.

It excludes:
- `data/evidence/mappings` (server/governed interoperability mapping artifacts);
- `data/factory`;
- `data/legacy`;
- `server`;
- `src/platform-kernel`;
- any EvidenceStore contents, credentials or admin state.

No Product implementation exists in this preparation commit.
