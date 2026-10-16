# K5 Evidence Sufficiency and Dormant Mastery/Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship truthful bilingual learner public activity summaries from verified K3 evidence while keeping every numeric mastery/readiness estimate null until separately approved authenticated independent scoring and calibration.

**Architecture:** Validate source and immutable K2 public mappings; replay full learner history before current-release selection; fail closed on unauthenticated corrections; deduplicate public presentations; produce a canonical versioned pure projection and a browser-only localized readout. The statistical inference port remains dormant. Implement in an isolated feature branch; keep PR #67 as a separate documentation review.

**Tech Stack:** Node 22 ESM; native `node:test` + `node:assert/strict`, AJV v8; IndexedDB + `fake-indexeddb`; browser AR/EN JS/HTML/CSS; Python 3.12 browser/contract suite; GitHub Actions and GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-11-k5-mastery-readiness-projections-design.md` at Git blob `dee75a0b1e5161d09bce0a840ab987c7a6aa2278`, source commit `1e9770f957ba00a92fb46f359d83cddb07168b83`; Codex review of this exact spec head completed 2026-10-12T10:54:13Z and CI passed. Verify all later changes independently. The owner requested continued implementation on 2026-10-12, subject to PR safety/review policy.

## Global Constraints

- K5.EVIDENCE.v1 and EvidenceSufficiencyProjectionV1 schema v1; `estimation_status=DISABLED_UNVALIDATED`; five numeric/model fields JSON null, never omitted.
- Existing PUBLIC content stays 1,120 foundation questions, seven domains, 200-question full exam, payload digest `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`. No protected IDs or answer keys in K5 output.
- Only learner.item.presented@1 in learn/practice is descriptive eligibility; local responses, check/section/mock, fabricated SYSTEM proof, exposure reuse, and scoring fixtures cannot establish mastery or readiness.
- Accept K3 full verified multi-release learner history; do not call replayEvidence at zero; source identity/watermark/fingerprints are mandatory. Correctors require independent authority (nonempty authority_ref does not suffice); quarantine affected families or fail source closed.
- Status/reason precedence follows §6.1.1 including mapping-only row 3a: INCOMPLETE / INSUFFICIENT_EVIDENCE; correction/lineage ambiguity: QUARANTINED. Every LOCAL_UNAUTHENTICATED output includes IDENTITY_UNVERIFIED.
- Canonical SHA-256 digests of full catalog/objective/optional lineage mapping are separate from question_payload_sha256; versions+digests are included in reproducibility and invalidation. No client-controlled digest accepted unchecked.
- No K3/K4 persisted evidence mutation, new analytics or learner-account authority, implicit scoring backend, K6 IRT, or change to strict assessment protections.
- Each code task follows actual RED → GREEN → full `npm test` regression → recorded SHA commit. For doc-only operations use review/CI evidence instead of pretending RED/GREEN. Add no K5 runtime feature directly to main.
- Before release run `npm ci --ignore-scripts && npm run validate && npm test && node --check src/app.js && python3 scripts/browser_smoke.py && PYTHONPATH=server pytest -q server/tests && python3 scripts/db_smoke.py && node scripts/contract_test.js browser && npm run verify:sw`. Include accessible AR/EN Chromium mobile/keyboard smoke. Do not assert green without run logs.
- PR Completion: draft product PR until checks, fresh independent Codex review and exact-head CI are green; landing requires explicit per-PR confirmation bound to exact latest SHA and tool's safe landing procedure. After merge independently verify main + live Pages digest and keep K5 numerical lane INACTIVE.

## Review Focus

1. Forged correction string that resolves K3 structurally but is unauthenticated: Task 05 must quarantine, not suppress events as COMPLETE.
2. Mixed historical releases with cross-release VOID/SUPERSEDE: Tasks 04–05 preserve complete graph before release filter.
3. Mapping-only missing objective versus correction-induced unknown mapping: Task 07 pins exact status/reasons for both mutually exclusive cases.
4. Source watermark=0 and IndexedDB denial: Tasks 04 and 10 never fabricate history, persist success or call K3 replay(toSeq=0).
5. Catalog/objective mapping changed with constant question bank hash: Tasks 03 and 11 reject stale provenance/cache identity.

## Ownership, execution ledger and coverage

Each numbered task must write its own RED and GREEN log evidence (exit code, observed failure and subsequent PASS), full regression results and commit SHA to a durable K5 execution ledger. Never claim a TDD cycle without both outputs. Test paths are NEW proposed paths; verify presence before creation. Acceptance coverage: T01→AC-01, AC-23, AC-24; T02→AC-02, AC-07, AC-16, AC-17; T03→AC-06, AC-07, AC-12, AC-22; T04→AC-02, AC-03, AC-13, AC-21; T05→AC-04, AC-14, AC-15; T06→AC-05, AC-06, AC-08, AC-09, AC-11, AC-12; T07→AC-02, AC-07, AC-09, AC-14, AC-16, AC-22; T08→AC-08, AC-09, AC-10, AC-16, AC-17, AC-25; T09→AC-15, AC-16, AC-18, AC-19, AC-21; T10→AC-18, AC-19, AC-20, AC-21; T11→AC-14, AC-20, AC-22, AC-23; T12→AC-01, AC-18, AC-20, AC-23, AC-24, AC-25.

### Task 01: Governance and immutable execution ledger

**Files:** Test: `tests/k5-state.test.js`; Create/modify: `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson`, `scripts/process/validate_k5_state.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `validateK5State({state,sourceHead,specBlobSha,planBlobSha})->{ok,code}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-01, AC-23, AC-24.

- [ ] **Step 1 — RED test:** In `tests/k5-state.test.js`, define a `node:test` case named `k5 task 01 governance and immutable execution ledger`; assert: unapproved or mismatched spec/plan/head returns ok=false; current approved immutable source returns ok=true. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-state.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `validateK5State({state,sourceHead,specBlobSha,planBlobSha})->{ok,code}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-state.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): governance and immutable execution ledger`.

### Task 02: Schema and strict pure output contract

**Files:** Test: `tests/k5-schema.test.js`; Create/modify: `data/schema/evidence-sufficiency-projection-v1.schema.json`, `src/mastery/schema.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `validateK5Projection(projection)->boolean`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-02, AC-07, AC-16, AC-17.

- [ ] **Step 1 — RED test:** In `tests/k5-schema.test.js`, define a `node:test` case named `k5 task 02 schema and strict pure output contract`; assert: all five estimate slots strictly null; missing/unknown property fails; sorted finite reason codes and typed nonnegative counters required. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-schema.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `validateK5Projection(projection)->boolean` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-schema.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): schema and strict pure output contract`.

### Task 03: Canonical mapping provenance

**Files:** Test: `tests/k5-mapping.test.js`; Create/modify: `src/mastery/provenance.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `canonicalMappingHash(mapping)->Promise<string>; validateK5Mappings({catalog,objectives,lineage,releaseId})->{catalogHash,objectiveHash,lineageHash,lineageVersion}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-06, AC-07, AC-12, AC-22.

- [ ] **Step 1 — RED test:** In `tests/k5-mapping.test.js`, define a `node:test` case named `k5 task 03 canonical mapping provenance`; assert: changing family/objective linkage changes hash even when question payload digest is unchanged; protected entry and mismatched release rejected; fixed SHA-256 canonical JSON serialization vectors for nested arrays/catalog/objectives/lineage with reordered object-property insertion order MUST match across adapters. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-mapping.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `canonicalMappingHash(mapping)->Promise<string>; validateK5Mappings({catalog,objectives,lineage,releaseId})->{catalogHash,objectiveHash,lineageHash,lineageVersion}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-mapping.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): canonical mapping provenance`.

### Task 04: Pinned source reader and release-safe replay

**Files:** Test: `tests/k5-source.test.js`; Create/modify: `src/mastery/source.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq})->Promise<{learner_id,track_id,release_id,source_store_id,through_store_seq,events,source_fingerprint}>`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-02, AC-03, AC-13, AC-21.

- [ ] **Step 1 — RED test:** In `tests/k5-source.test.js`, define a `node:test` case named `k5 task 04 pinned source reader and release-safe replay`; assert: empty store bypasses replay; multi-release history preserved; exact learner_id/track_id/release_id/through_store_seq/independent source_fingerprint returned from pinned validated scope; duplicates, forged store/head, wrong learner/track/release, watermark drift, wrong source fingerprint, missing provenance or invalid cross-release history fail closed with named errors. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-source.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `readK5Source({store,learnerId,trackId,releaseId,throughStoreSeq})->Promise<{source_store_id,through_store_seq,events}>` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-source.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): pinned source reader and release safe replay`.

### Task 05: Correction authentication and quarantine

**Files:** Test: `tests/k5-corrections.test.js`; Create/modify: `src/mastery/corrections.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `classifyK5Corrections({events,verifyAuthority})->{safeEvents,quarantinedFamilies,sourceInvalid,reasons}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-04, AC-14, AC-15.

- [ ] **Step 1 — RED test:** In `tests/k5-corrections.test.js`, define a `node:test` case named `k5 task 05 correction authentication and quarantine`; assert: forged authority_ref alone => CONFLICTED/QUARANTINED with CORRECTION_AUTHORITY_UNVERIFIED; bounded competing/cyclic => CONFLICTED/QUARANTINED with CORRECTION_CONFLICT; overlapping forged plus competing => CONFLICTED/QUARANTINED with sorted BOTH reason codes; bounded missing target => INCOMPLETE/QUARANTINED with CORRECTION_UNRESOLVED; missing target plus unresolved lineage => INCOMPLETE/QUARANTINED with sorted CORRECTION_UNRESOLVED and UNKNOWN_FAMILY_MAPPING; ONLY unbounded corruption => SOURCE_INVALID/QUARANTINED; cross-release verified correction never dropped before release selection. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-corrections.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `classifyK5Corrections({events,verifyAuthority})->{safeEvents,quarantinedFamilies,sourceInvalid,reasons}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-corrections.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): correction authentication and quarantine`.

### Task 06: Eligible public presentation and deduplication

**Files:** Test: `tests/k5-presentations.test.js`; Create/modify: `src/mastery/presentations.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `collectK5Presentations({events,catalog,policy,quarantinedFamilies})->{observations,unknownMapping,repeatedFamilies}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-05, AC-06, AC-08, AC-09, AC-11, AC-12.

- [ ] **Step 1 — RED test:** In `tests/k5-presentations.test.js`, define a `node:test` case named `k5 task 06 eligible public presentation and deduplication`; assert: only accepted learner.item.presented@1 in learn/practice; one interaction ID once; family sibling versions count once; approved cross-release family lineage maps siblings to one exposed family, absent approved lineage abstains on transfer/unseen; response/check/mock/protected ignored. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-presentations.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `collectK5Presentations({events,catalog,policy,quarantinedFamilies})->{observations,unknownMapping,repeatedFamilies}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-presentations.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): eligible public presentation and deduplication`.

### Task 07: Deterministic status matrix and aggregation

**Files:** Test: `tests/k5-projection.test.js`; Create/modify: `src/mastery/projection.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `deriveK5EvidenceSufficiency({source,events,acceptedPublicCatalog,policy,identityResolutionVersion,clock})->EvidenceSufficiencyProjectionV1`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-02, AC-07, AC-09, AC-14, AC-16, AC-22.

- [ ] **Step 1 — RED test:** In `tests/k5-projection.test.js`, define a `node:test` case named `k5 task 07 deterministic status matrix and aggregation`; assert: all precedence rows including 3a produce exact tuple and sorted reasons; deterministic objective/domain counters; shuffled order identical; five nulls universal. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-projection.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `deriveK5EvidenceSufficiency({source,events,acceptedPublicCatalog,policy,identityResolutionVersion,clock})->EvidenceSufficiencyProjectionV1` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-projection.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): deterministic status matrix and aggregation`.

### Task 08: Trusted scoring port stays dormant

**Files:** Test: `tests/k5-estimator-disabled.test.js`; Create/modify: `src/mastery/estimator.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `requestK5Estimator({policyId,evidence,enableFlag})->{status,mastery_estimate,readiness_estimate,readiness_probability,confidence_interval,model_validation_ref}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-08, AC-09, AC-10, AC-16, AC-17, AC-25.

- [ ] **Step 1 — RED test:** In `tests/k5-estimator-disabled.test.js`, define a `node:test` case named `k5 task 08 trusted scoring port stays dormant`; assert: SYSTEM-shaped synthetic fixture, true enableFlag, arbitrary authority_ref and high practice count still DISABLED_UNVALIDATED/all null. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-estimator-disabled.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `requestK5Estimator({policyId,evidence,enableFlag})->{status,mastery_estimate,readiness_estimate,readiness_probability,confidence_interval,model_validation_ref}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-estimator-disabled.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): trusted scoring port stays dormant`.

### Task 09: Localized presentation and safe browser controller

**Files:** Test: `tests/k5-ui.test.js`; Create/modify: `src/mastery/view.js`, `src/mastery/browserController.js`, `index.html`, `src/styles.css`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `renderK5Summary({projection,locale})->{heading,body,status}; mountK5Summary({root,store,catalog,locale,learnerId,trackId,releaseId,throughStoreSeq,sourceFingerprint,policy})->Promise<void>`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-15, AC-16, AC-18, AC-19, AC-21.

- [ ] **Step 1 — RED test:** In `tests/k5-ui.test.js`, define a `node:test` case named `k5 task 09 localized presentation and safe browser controller`; assert: Arabic/English recorded-activity count only; injection escaped; browser mount receives validated learner/track/release/watermark/source fingerprint from trusted context, never defaults to anonymous store; missing store shows safe navigation; no percentage, diagnosis or mastery colour; Chromium AR/EN keyboard-only Tab/Shift-Tab focus order, aria-live polite updates, screen-reader name and direction RTL/LTR assertions required. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-ui.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `renderK5Summary({projection,locale})->{heading,body,status}; mountK5Summary({root,store,catalog,locale})->Promise<void>` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-ui.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): localized presentation and safe browser controller`.

### Task 10: Offline, cache, and privacy integration

**Files:** Test: `tests/k5-browser.test.js`; Create/modify: `src/mastery/snapshot.js`, `scripts/browser_smoke.py`, `scripts/verify_sw_assets.js`, `tests/k5-browser.test.js`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `loadK5Snapshot({store,context})->Promise<EvidenceSufficiencyProjectionV1>`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-18, AC-19, AC-20, AC-21.

- [ ] **Step 1 — RED test:** In `tests/k5-browser.test.js`, define a `node:test` case named `k5 task 10 offline, cache, and privacy integration`; assert: offline/denied/quota/erasure invalidates display; stable hashes across reload; no new protected bundle or user-event network request. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-browser.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `loadK5Snapshot({store,context})->Promise<EvidenceSufficiencyProjectionV1>` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-browser.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): offline cache and privacy integration`.

### Task 11: Independent contract/adapters and full regression

**Files:** Test: `tests/k5-contract.test.js`; Create/modify: `tests/k5-contract.test.js`, `docs/superpowers/state/K5-CURRENT-STATE.json`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `validateK5CrossRuntime({browserSnapshot,nodeSnapshot})->{ok,differences}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-14, AC-20, AC-22, AC-23.

- [ ] **Step 1 — RED test:** In `tests/k5-contract.test.js`, define a `node:test` case named `k5 task 11 independent contract/adapters and full regression`; assert: Node/browser JSON parity; changing approved catalog/objective/lineage mapping with identical question payload SHA invalidates cached K5 projection and forces recompute; wrong source hash fails; released question/exam/K4 invariants unchanged. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-contract.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `validateK5CrossRuntime({browserSnapshot,nodeSnapshot})->{ok,differences}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-contract.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): independent contract adapters and full regression`.

### Task 12: Release gates and post-merge verification

**Files:** Test: `tests/k5-release.test.js`; Create/modify: `scripts/process/verify_k5_release.js`, `docs/superpowers/state/K5-CURRENT-STATE.json`.

**Ledger:** Update `docs/superpowers/state/K5-EXECUTION-LEDGER.ndjson` (created in Task 01) with observed RED exit+assertion, GREEN exit, full-regression exit, commit SHA and any ruling. A task cannot be marked done without this file and verifiable CI logs.

**Interfaces:** Produces `verifyK5Release({prNumber,prHead,approval:{prNumber,headSha,approvedBy,approvedAt},checks,review,mainHead,policy})->{ready,blockers}`. Consumes previously defined validated sources, mappings and policy; no private event payload leaves this component.

**Coverage:** AC-01, AC-18, AC-20, AC-23, AC-24, AC-25.

- [ ] **Step 1 — RED test:** In `tests/k5-release.test.js`, define a `node:test` case named `k5 task 12 release gates and post-merge verification`; assert: open P1, missing browser smoke, unapproved policy, absent approval or approval with different PR number or different exact full head SHA, changed PR HEAD or untested merged main prevents release closure. Name a one-line inverse code change that must cause test failure before accepting the test.
- [ ] **Step 2 — Observe RED:** Run `node --test tests/k5-release.test.js`. Expected: nonzero exit with contract-specific assertion or missing implementation export; syntax/setup errors do not count. Record full failure.
- [ ] **Step 3 — Minimal GREEN:** Implement exactly `verifyK5Release({prHead,checks,review,mainHead,policy})->{ready,blockers}` and required supporting behavior in the owned paths. Do not add unrelated capabilities or derived ability estimates.
- [ ] **Step 4 — Verify GREEN:** Run `node --test tests/k5-release.test.js` (exit 0), then `npm test` (exit 0). If either fails, correct behavior and rerun rather than weakening assertions. For Task 09 and 10 also run `python3 scripts/browser_smoke.py`.
- [ ] **Step 5 — Review and commit:** Confirm exact spec predicates, no protected/PII leakage, and no public-bank mutation; record RED/GREEN/full regression output and commit only owned paths with message `feat(k5): release gates and post merge verification`.

## Final independent review and landing guard

- [ ] Exhaustively compare all AC-01…AC-25 to real unit, adapter, browser, security and release evidence. Any missing case remains OPEN.
- [ ] Execute full release-equivalent commands in Global Constraints and test the FINAL feature PR SHA in CI. Run Codex fresh-context review, classify every Critical/Important against current source, repair with focused RED/GREEN and re-review.
- [ ] Request a PR Completion readiness assessment; verify open review threads=0, main/base freshness and protections. Obtain explicit separate authorization naming the CURRENT product PR and exact full HEAD; never treat general implementation approval as merge authority.
- [ ] After authorized safe merge, fetch current main SHA, run Node/Python/Chromium/Pages smoke on merged main and compare immutable public bank and new K5 output fingerprints before recording K5 initial descriptive release closure.
- [ ] Record Lane 2 as NOT_VALIDATED / INACTIVE; K6 has no release permission based on K5 exposure activity.

**Plan review invariants:** Task 04 result includes validated learner/track/release/watermark/source fingerprint and explicit wrong-scope rejection. Task 09 receives this context through mount (never infers anonymous defaults) and tests Chromium accessibility. Task 11 checks mapping-only cache invalidation at unchanged payload digest. Task 12 rejects approval for a different PR or SHA.  Every Task 01 execution-state fixture MUST pin spec blob `dee75a0b1e5161d09bce0a840ab987c7a6aa2278` (never any previous blob), and the final reviewed plan blob. Task 03 includes explicit approved-vs-absent lineage fixture with fixed SHA vectors. Task 05 correction fixture outputs must match ordered §6.1.1 rows exactly; generic `QUARANTINED or SOURCE_INVALID` is prohibited. Task 10 owns `src/mastery/snapshot.js`. The ledger is owned across all 12 tasks, with commit proof.

**Plan status:** WRITTEN_FOR_IMPLEMENTATION; awaiting independent exact-head specification re-review and practical local test workspace; not evidence of implemented behavior. No claim that CI or tests have run for this plan.
