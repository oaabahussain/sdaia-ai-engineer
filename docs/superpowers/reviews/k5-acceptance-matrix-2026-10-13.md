# K5 — Independent-release readiness and AC evidence matrix (2026-10-13)

**Status:** SECURITY_REMEDIATIONS_TESTED / RELEASE_NOT_AUTHORIZED.
**Product PR:** #69, branch `feat/k5-tdd-evidence-20261012`.
**Verified code head before this documentation:** `6d8f79b95933803029b54d12c06d64ae3ebee79b`.
**RED:** `0da59cbf8a49b050ce9c1614c4d016e9660fb119`; quality run [38378621537](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38378621537), 1061/1063 Node tests passed, two intentional trust-boundary regressions failed with missing expected exception/rejection.
**GREEN:** `6d8f79b95933803029b54d12c06d64ae3ebee79b`; [quality run 38379023765](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38379023765) and [server run 38379024518](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38379024518) SUCCESS; 1064/1064 Node and 76/76 Python. Browser smoke, offline checks, factory import, SW/Pages assembly, K5 GitHub read-only audit and AC-13 real Chromium quota probe completed successfully.

## Latest mixed-objective and Unicode privacy P2 review remediation (2026-10-13)

The independent Codex review of `4026a31533cde74a2c9075a4e000d62a0137b115` raised two further P2 findings. These were addressed with observed RED/GREEN and individually evidence-replied and resolved. The **doc commit after this section** changes HEAD and must receive its own current-head CI and independent review. K5 remains DRAFT / UNMERGED / RELEASE_NOT_AUTHORIZED.

- **P2 `src/mastery/projection.js`:** when quarantined family F1 and safe observed family F3 share objective O1, the previous quarantined row replacement discarded F3 counts. The minimal fix preserves the valid `OBSERVED_ONLY` counts and merges sorted correction reason codes into the mixed objective while preserving overall `CONFLICTED` and `QUARANTINED` state. A purely quarantined objective retains zero counts. New full `deriveK5EvidenceSufficiency` test builds two public siblings with identical O1, quarantines only F1 and checks that F3 stays counted. Thread `PRRT_kwDOUQgV2c6r-jVR`, review comment `4261772901`, response `4261844913`.
- **P2 `src/mastery/source.js` and `src/mastery/schema.js`:** input controls `U+200B`, `U+202E`, `U+202C`, `U+2066`, `U+2069` allowed direct IP/contact identifiers to bypass previous ASCII whitespace checks. Both privacy boundaries now reject Unicode category Cc/Cf anywhere in a learner identifier; tests include invisible-wrapped IPv4/phone, bidi IPv6 and invisible-character opaque identifier. Thread `PRRT_kwDOUQgV2c6r-jVW`, review comment `4261772909`, response `4261846298`.
- **RED:** `37673affa57c9b1822b5b21aaaf97471fe2c29eb`; [QG 38437889136](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38437889136), 1085/1088 Node passed, exactly 3 expected failures across these risk classes.
- **GREEN source commit:** `e534695f2bc288a4f1e723eb9f8f8e61c84edc4e`; [QG 38438160388](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38438160388) SUCCESS with 1088/1088 Node, 76/76 Python, Chromium bilingual/offline, bank 1120, exam 200, Pages assembly; [Server 38438160354](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38438160354) SUCCESS.
- **Scope and release boundaries:** 25/25 historical inline review threads resolved as of check. No clean independent current-doc-head review yet; AC-01 formal spec/plan blob approval remains unproven, AC-23 new final-head independent review blocked, AC-24 full-40-char PR #69 landing consent and postmerge main/Pages not executed; numerical readiness/mastery estimator remains INACTIVE with 5 null JSON fields.

## Latest exact-head review remediation — preserved scope and privacy (2026-10-13)

**Scope:** K5 PR #69 (still DRAFT, UNMERGED, release NOT authorized). Independent Codex review of `74d145010abefbb627f030eeb438d08a72f3fd8e` opened two P2 findings, now fixed with individual reply and thread resolution. This documentation changes the PR HEAD again, requiring a NEW current-head CI and independent review.

- **P2 `src/mastery/corrections.js`, thread `PRRT_kwDOUQgV2c6r9_zq`:** a missing replacement for an existing supersession target formerly set `SOURCE_INVALID` globally; now quarantine the already-known target family A while retaining unrelated safe family B, preserving `CORRECTION_UNRESOLVED`, unauthenticated-correction evidence, and `CONFLICTED` conservative status. A missing TARGET (no family scope) still invalidates source. Tests: `tests/k5-corrections.test.js`.
- **P2 `src/mastery/source.js` and `src/mastery/schema.js`, thread `PRRT_kwDOUQgV2c6r9_z0`:** raw IPv6 had previously been blocked, but whitespace-wrapped addresses escaped the validation. Both boundaries now reject leading or trailing whitespace in learner pseudonyms; no silently trimmed identity is stored. Negative tests include padded IPv6 (bare and bracketed), IPv4, phone, email in both reading and projecting. Tests: `tests/k5-privacy-boundary.test.js`.
- **Observed RED:** `4aa75f78cceb274d3e3da6179615b8c7bb6e1fb7` [QG 38435853892](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38435853892), 1084/1087 Node passed, precisely three expected failures across these two P2 defects; control unknown-target test PASSED.
- **Observed GREEN (code-only SHA):** `7200266825b0e6614d6fbb8d8c83c93921eb62c0`, [QG 38436062665](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38436062665) SUCCESS 1087/1087 Node, 76/76 Python, Chromium offline/bilingual, bank 1120, exam 200, Pages assembly; [Server 38436062963](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38436062963) SUCCESS.
- **Review:** reply IDs `4261691513`, `4261693186`; two P2 threads resolved with exact-head evidence; total prior 23/23 threads resolved as checked. A resolved historical thread is NOT a fresh independent review of the later SHA.
- **Formal release gates:** AC-01 remains BLOCKED (spec `dee75a0b1e5161d09bce0a840ab987c7a6aa2278`, plan `955fb95abcdd28f615a7104d5868c5d9f0fbf8d2` not formally approved on immutable canonical evidence); AC-23 final SHA independent review missing; AC-24 PR #69 exact full-SHA landing approval and postmerge `main`/Pages verification absent. K5 Lane 2 numerical mastery/readiness estimation remains **INACTIVE** with five JSON null fields.
- **Ruling:** the already-known correction target bounds quarantine to its family; preserving unaffected families does NOT mean the overall readiness state is approved or numerically estimable.

## Latest K5 release-auditor security verification (2026-10-13)

**Verified source-code SHA:** `ca8ca7e79a194882f4293732f7d5726cc998bf79` (after restoring correct trust semantics). The earlier security checks above remain immutable historical evidence. This document itself and state/ledger updates advance the branch, so final-head checks must be re-run and independently reviewed before any release claim.

- **P1 / review thread `PRRT_kwDOUQgV2c6r1Sxe` / comment `4257964005`:** exact-head `DISMISSED` Codex reviews carrying P0/P1/P2 were omitted from security finding detection; a separate clean review could produce a false readiness decision. Root-cause patch in `scripts/process/verify_k5_release.js`: collect evidence from verified exact-head `COMMENTED` + `DISMISSED`, but count only `COMMENTED` as clean review. This patch does not change the owner/merge approval gate.
- **RED:** `d61cde62ed34bace875cdea87794dbeb599809a7` on [GitHub QG 38410902141](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38410902141): 1076/1079 Node tests passed, precisely 3 purposefully failing P0/P1/P2 bypass tests, all benign/old-head/non-Codex controls passed.
- **GREEN:** `ca8ca7e79a194882f4293732f7d5726cc998bf79`, [QG 38411130134](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38411130134) SUCCESS: 1079/1079 Node, 76/76 Python, Chromium, Pages, Offline and K5 read-only audit. [Server/adapter 38411129540](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38411129540) SUCCESS.
- **Reviewer triage:** replied to issue with evidence (reply `4259739333`) and resolved that single thread. Resolution is NOT independent head review.
- **Autopilot pilot:** archived `skill.zip` loaded locally; 36/36 deterministic Skill tests PASS; Model Router `VALID_DESIGN_ONLY` (no enabled provider, no paid fallback, zero remote model calls); `flowctl.py` selected RC01 and release audit conservatively returned BLOCKED when observation completeness was intentionally not certified. Neither an installed GitHub agent nor model routing/deployment is claimed.
- **AC-01:** still PARTIAL, due to original spec explicitly marked NOT_APPROVED and draft design/plan PRs #67/#68.
- **AC-22:** PARTIAL until independent late-arrival and lineage challenge review of final head.
- **AC-23:** BLOCKED pending independent clean code review on final SHA after all docs and code are frozen.
- **AC-24:** BLOCKED pending owner PR #69 full 40-character SHA-specific landing consent via PR Completion guarded helper and actual merged-main/Pages postlanding proof.
- **Numerical lane:** `INACTIVE`; five estimate fields remain JSON null. Question-bank invariants to be reconfirmed after landing: 1120 public questions / 7 domains / 200-question mock.

## Root-cause-backed corrections

1. **Review #4256618135:** `validateK5Projection` only checked shape and aggregate self-consistency, allowing caller-created exposure counts. `deriveK5EvidenceSufficiency` now privately brands its deeply frozen results; snapshot and view require the exact opaque result. See `tests/k5-trust-boundaries.test.js`, `tests/k5-snapshot-trust.test.js`, `tests/k5-view.test.js`.
2. **Review #4256618149:** browser bootstrap authenticated the frozen objective map, but the exported projection accepted arbitrary mapping inputs. `validateK5ObjectiveMap` now clones, digests and deeply freezes the canonical provisional mapping, returns a privately branded capability, and projection requires it before aggregation. Synthetic tests were updated to exercise genuine approved mappings. See `tests/k5-trust-boundaries.test.js`, `tests/k5-mapping-invalidation.test.js`, `tests/k5-objective-governance.test.js`.

Both reviewer threads were replied to with RED/GREEN evidence and marked resolved after successful GREEN. This is **not** a substitute for an independent new-head code review.

## Normative AC-01 through AC-25 reconciliation

Status here is an evidence index, **not an approval to merge**. `PASS` means scoped automated checks passed on the verified code head, not that the public release is closed. `PARTIAL` means a specific governance or proof limitation remains; `BLOCKED` is an explicit release gate.

| AC | Status | Evidence / outstanding requirement |
|---|---|---|
| 01 | PARTIAL | `tests/k5-state.test.js`, K5 state/ledger and pinned spec/plan blobs; spec and plan PR #67/#68 are still draft and the text of the original spec still says proposed; reconcile final formal owner-reviewed approval provenance before release. |
| 02 | PASS | `tests/k5-source-contract.test.js`, `tests/k5-projection-contract.test.js`; legitimate zero-watermark replay skipped, five estimators null. |
| 03 | PASS | `tests/k5-source*.test.js`, `tests/k5-indexeddb-source.test.js`; scoped replay, watermark and wrong-source rejection. |
| 04 | PASS | `tests/k5-corrections.test.js` and `tests/k5-projection-contract.test.js`; unauthenticated corrections quarantined. |
| 05 | PASS | `tests/k5-presentations*.test.js`; interaction ID/family deduplication. |
| 06 | PASS | `tests/k5-presentations-contract.test.js`; no transfer/readiness inference from absent approved lineage. |
| 07 | PASS | `tests/k5-objective-governance.test.js`; 140 migration-derived provisional objectives cannot imply mastery. |
| 08 | PASS | `tests/k5-estimator-disabled.test.js`, `tests/k5-projection-contract.test.js`; responses/evaluations do not activate estimator. |
| 09 | PASS | Forged SYSTEM producer and authority-ref tests in `tests/k5-projection-contract.test.js`. |
| 10 | N/A (DORMANT) | No authenticated statistical scoring producer was introduced; synthetic fixtures are not deployed evidence. |
| 11 | PASS | Public-family selection in `src/mastery/presentations.js`, `tests/k5-presentations-contract.test.js`; shared public mocks are not holdout. |
| 12 | PASS | `src/recommendations/publicCatalog.js`, K5 presentation checks and privacy tests; protected records excluded. |
| 13 | PASS | Multi-release/source handling tests and separate AC-13 Chromium quota CI step (different scenarios). |
| 14 | PASS | Deterministic `tests/k5-projection-contract.test.js`; permutation and strict reason-order tests. |
| 15 | PASS | `tests/k5-browser-controller.test.js`, `tests/k5-view.test.js`; incomplete/invalid data do not show fabricated optimistic counts. |
| 16 | PASS | `tests/k5-schema*.test.js`, estimator-disabled and browser UI; five fields stay JSON null. |
| 17 | PASS | `tests/k5-estimator-disabled.test.js`; no configuration flag activates numerical scoring. |
| 18 | PASS | `scripts/browser_smoke.py` Chromium keyboard/mobile/RTL/LTR and accessibility path in full QG. |
| 19 | PASS | `tests/k5-browser-controller.test.js`, offline browser smoke, real Chromium quota CI; erase/denial failures fail closed. |
| 20 | PASS | Full QG `npm run validate`, `verify:factory-import`, SW and Pages checks; K3/K4/exam regression tests passed. Baseline 1120/7/200 must be rechecked on merged main. |
| 21 | PASS | `tests/k5-privacy-boundary.test.js`, source binding and browser erasure tests; no cross-learner evidence claim. |
| 22 | PARTIAL | K5 canonical provenance/mapping invalidation tests and Node/Chromium parity passed; a final independent assessment of all late-arrival/cross-release scenarios is still part of AC-23. |
| 23 | BLOCKED | Fresh independent code review on the **final PR head** required; original reviewer quota issue may persist. Resolve any new P1/P0 and re-run exact-head CI. |
| 24 | BLOCKED | No per-PR and exact-full-SHA owner landing consent, no merge commit, no merged-main Node/Python/Chromium/Pages proof. |
| 25 | PASS (initial Lane 1 only) | `numeric_lane=INACTIVE`, null estimation, no K6 authorization from observational K5. |

## Explicit remaining gates

- Check the final documentation commit head and both full GitHub workflows. All prior green evidence belongs to `6d8f79b...` only until a new exact head is re-tested.
- Request a **new independent** Codex review with reviewed-head attestation; reject previous-head substitutions and reviewer quota claims as approval.
- Resolve any new material findings, preserving RED/GREEN evidence and privacy/immutability boundaries.
- Align formal exact-spec/plan owner approval evidence (AC-01) without rewriting history.
- PR #69 remains DRAFT; do not merge via an alternate GitHub API or silently convert to ready. PR Completion landing requires fresh checks, separate explicit per-PR/full-SHA owner approval, and its guarded helper.
- After authorized integration, verify the actual merged-main commit and deployed Pages, including unchanged 1120/7/200 content invariants. Lane 2 remains disabled.

**Scope restraint:** This file certifies the tests and findings named above; it does not assert all 25 criteria are release-closed, nor does it grant merge authority.

## Unicode-phone P2 remediation checkpoint — 2026-10-14

- RED `05ebd69ec88e5fae9cd663628f5ae66aa690e31e`: Quality Gate [38564016817](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38564016817) **FAILURE** from new two-boundary regressions; Server 38564016821 SUCCESS.
- GREEN `0874428063e339f4facfb78d0faa04fc68e0c7c3`: Quality Gate [38564160025](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38564160025) and Server [38564160053](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38564160053) **SUCCESS**. Unicode Pd/U+2212/U+2043 dash normalization is comparison-only; source/export phone tests each exercise 10 negative PII cases; 4 opaque IDs accepted.
- Codex thread `PRRT_kwDOUQgV2c6sAWVT` P2 comment `4262524189`: evidence reply `4270766446`; resolved **after** GREEN. Historic resolution does not certify a new independent final-head review.
- **AC-21 privacy:** regression proof strengthened at both source and projection boundaries. **AC-01 remains PARTIAL; AC-22 PARTIAL; AC-23 BLOCKED pending a new independent review on this document commit; AC-24 BLOCKED** (formal exact-blob owner approvals and PR #69/full-40-character-head landing authorization absent; no main/Pages postmerge verification). PR #69 remains DRAFT/UNMERGED. K5 numeric estimation remains INACTIVE and all five fields JSON null.
