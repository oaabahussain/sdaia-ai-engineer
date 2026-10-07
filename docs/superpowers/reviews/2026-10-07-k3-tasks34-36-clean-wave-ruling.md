# K3 Tasks 34–36 Clean Wave Execution Ruling

**Date:** 2026-10-07
**Status:** APPROVED OPERATIONAL RULING / PRODUCT NOT STARTED
**Clean base:** `main@c963fc6991bde180d05a0d818742d3736c781b09`

## Purpose

Prepare Tasks 34, 35, and 36 together from one clean post-finding baseline, then execute them sequentially without intermediate merge/install to `main`.

Execution:
1. Task 34 from clean wave base + Task 34 prep.
2. Task 35 from exact accepted Task 34 head + Task 35 prep.
3. Task 36 from exact accepted Task 35 head + Task 36 prep.
4. One combined review/verification on final Task 36 head.
5. Integrate only after the complete wave is accepted.
6. Task 37 remains NOT STARTED in this wave.

## Task 34 boundary

The Product Analytics bridge reuses the existing EventRegistry and privacy policy.

Learner evidence never goes directly to AnalyticsSink or TelemetrySink.

The bridge contract remains:
`toAnalyticsEvent(evidenceEvent, definition, mapping) -> validated analytics event | null`

Rules:
- read the governed learner-evidence EventDefinition;
- apply learner-evidence property export policy before analytics mapping;
- REJECT -> return null;
- REDACT -> redacted learner fields cannot reach analytics;
- ALLOW -> only explicitly mapped governed values may become analytics properties;
- output must be validated by the existing analytics EventRegistry path;
- the analytics event must receive an identity separate from the learner evidence `event_id`;
- no learner evidence payload or full event object is emitted to TelemetrySink;
- Product Analytics, Learner Evidence, and System Telemetry remain separate planes.

## Task 35 packet-scope correction

The clean baseline already contains:
- `tests/release-contract.test.js`;
- `tests/service-worker-contract.test.js`.

The generated Task 35 packet incorrectly classifies all plan `test` paths as create-only.

Deterministic correction:
- existing `tests/release-contract.test.js` -> allowed modify;
- existing `tests/service-worker-contract.test.js` -> allowed modify;
- new `tests/k3-release-boundary.test.js` -> allowed create.

No Product behavior is changed by this compiler/packet correction.

## Task 35 release boundary

Public Pages may include only browser-required K3 runtime/context assets. It must exclude:
- authoritative/private EvidenceStore contents;
- server databases;
- credentials/auth configuration;
- factory/admin governance data not required by learner runtime;
- export-ledger/private operational data.

CI must validate K3 schemas, definitions and mappings and must exercise Node, Python/server adapter contracts, and browser smoke before release.

## Task 36 acceptance boundary

Task 36 creates an executable one-for-one matrix for spec §47.

It may prove implementation criteria that are already materially testable by Task 36.

It must **not** falsely declare criteria 22–25 finally satisfied:
- whole-plan review is owned by Task 38;
- exact-head verification is owned by Task 39;
- reviewed merge is owned by Task 40;
- post-merge runtime/deployment verification is owned by Task 41.

Task 36 must encode these as explicit pending future gates, while failing on any implementation criterion 1–21 that lacks executable evidence.

Task 36 does not mark K3 COMPLETE and does not begin K4.

## Review focus

- no raw learner payload enters Product Analytics/Telemetry;
- analytics output is separately identified and registry-validated;
- Pages public/private boundary remains minimal and explicit;
- Python/server tests become part of release-gate contract;
- §47 implementation criteria are covered one-for-one without pretending future finalization gates have already occurred.
