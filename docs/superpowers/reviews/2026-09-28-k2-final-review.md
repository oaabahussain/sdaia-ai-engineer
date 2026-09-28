# K2 — Coverage Expansion & Controlled Release — Final Whole-Plan Review

**Date:** 2026-09-28  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Branch:** `impl/k2-coverage-expansion-controlled-release`  
**Base main:** `6eb108338857dec9471f441a37d1819b98045cbb`  
**Reviewed product head:** `80431fae4f846a6aea53040b22aad86dea5d4c00`  
**Plan:** `docs/superpowers/plans/2026-09-28-k2-coverage-expansion-controlled-release.md`  
**Spec:** `docs/superpowers/specs/2026-09-28-k2-coverage-expansion-controlled-release-design.md`

## Review conclusion

Whole-plan self-review is complete. No open Critical or Important findings remain on the reviewed product head.

The branch remains intentionally pre-merge. Tasks 51–53 are integration gates, not missing product implementation:
1. exact-head CI after this review/checkpoint commit;
2. reviewed merge into current `main`;
3. post-merge CI/Pages/runtime verification before K3 DESIGN is unlocked.

A dedicated reviewer subagent is not available in this environment, so the mandatory pre-merge review was performed as a separate self-review pass using the approved spec, implementation plan, branch/main comparison, production-source scans, exact failing tests and fresh CI logs. This limitation is recorded rather than represented as independent review.

## Fresh product-head verification

On `80431fae4f846a6aea53040b22aad86dea5d4c00`:

- Pull request quality gate **#534 — SUCCESS**.
- Server and adapter contract tests **#1369 — SUCCESS**.
- Node: **351/351 PASS**, **0 fail**.
- Python server: **22 passed**.
- SQLite schema/apply/query: PASS.
- Browser adapter: PASS.
- API adapter: PASS.
- factory import: PASS, 1,120 items / 140 objectives.
- preserved learner-visible digest:
  `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`.
- generated learner-visible bank: **1,120**.
- full exam: **200**.
- weighted allocation: **36 / 35 / 33 / 29 / 28 / 25 / 14**.
- service-worker assets: PASS.
- assembled Pages/live-content verifier: PASS.
- browser smoke: PASS including bilingual, offline cached reload, full exam and feedback paths.

## Branch/diff review

At the final product review:
- branch is ahead of current main and not behind;
- changed surface is K2 schemas/kernel/tests/docs/reference persistence/CLI plus two release workflows;
- no suspicious secret/credential/private-key filename was found;
- no K2 production dependency on PostHog, Langfuse, Amplitude, Statsig, Sentry or Grafana was found;
- no K3 mastery/readiness/psychometric/IRT implementation was found;
- no hidden semantic `0.95` dedup fallback remains;
- Pages removes `_site/src/platform-kernel` and asserts both that path and `_site/data/factory` are absent.

## Findings and fix pass

### Critical — resolved

**C1 — forged activation promotion could bypass evaluation**

Initial release activation accepted minimally shaped `ActivationEvidenceV1` metadata with `decision: PROMOTE` without proving it came from the evaluator.

Resolution:
- `evaluateActivationEvidence()` validates ActivationEvidenceV1;
- its result is bound in-memory to the exact evidence object;
- `transitionContentRelease(... activate ...)` requires the trusted evidence-bound evaluation;
- HOLD/QUARANTINE/ROLLBACK evaluation cannot be rewritten into PROMOTE by metadata;
- explicit `migrated-grandfathered` legacy boundary remains isolated.

RED evidence: quality **#508**.  
Final regression evidence: quality **#534**.

### Important — resolved

**I1 — privacy could be bypassed between registry and sink.**  
EventRegistry now applies property REDACT/REJECT before marking an event trusted.

**I2 — source-unready/unknown gaps could become runnable.**  
Source readiness now fails closed; ExpansionPlan carries blocked state; TranchePlan never allocates blocked gaps.

**I3 — semantic dedup had a hidden default threshold.**  
No calibration + no explicit legacy threshold yields REVIEW_REQUIRED rather than guessed rejection.

**I4 — failures defaulted to retryable.**  
LocalRunner and TrancheRunner now preserve explicit `retryable=false` while retaining retryable default only when no classification exists.

**I5 — provider route budgets were declared conceptually but unenforced.**  
ProviderRoutingPolicyV1 supports optional non-negative `max_latency_ms` / `max_cost`; runtime routing excludes candidates with missing/exceeding metrics when those bounds are active.

**I6 — ExpansionPlan immutable identity could collide.**  
Plan identity now hashes the canonical material plan body; it changes when body-affecting priority evidence changes and stays stable across object key ordering.

**I7 — unknown provider cost was represented as zero.**  
ProviderEvaluationV2 keeps unknown cost as `null`; route budgets therefore cannot mistake missing cost evidence for free execution.

Primary RED evidence for I1–I6: quality **#524** (8 intended failing assertions).  
RED refinement for I2/I6/I7: quality **#531** (3 intended failing assertions).  
GREEN evidence: quality **#529**, then final **#534**; server/adapter **#1358**, then final **#1369**.

## Review Focus verification

| Review Focus | Evidence |
| --- | --- |
| Insufficient CANARY evidence must HOLD | ActivationEvidence evaluator + observation-volume tests + acceptance test. |
| Low-risk review drift must escalate | ReviewCalibration runtime tests and review-stage integration tests. |
| Cross-language gray zone must REVIEW_REQUIRED | Calibrated AR↔EN dedup tests. |
| Partial tranche failure must preserve siblings/stage | Tranche runner PARTIAL/exact-stage/retry tests. |
| Untrusted/private analytics must be rejected before export | EventDefinition + EventRegistry privacy tests + guarded AnalyticsSink tests. |

All five Review Focus items are executable tests in the final Node suite.

## Approved spec mapping

| Section | Requirement | Implementation/review evidence |
| --- | --- | --- |
| 1 | Authority and precedence | Approved spec/plan + execution ledger/checkpoint; deviations recorded as Rulings. |
| 2 | Intent | Coverage-driven ExpansionPlan/TranchePlan; no raw-count promotion. |
| 3 | Explicit non-goals | No K3 mastery/readiness/IRT/CAT/tutor implementation; runtime baseline unchanged. |
| 4 | K1 contracts consumed | K1 factory/release/state/runtime contracts retained; K1 regression suite remains green. |
| 5 | Canonical control loop | Coverage → tranche → factory → review → CANARY/activation → observe contracts implemented. |
| 6 | Expansion unit | Tranche requests remain family-oriented and preserve family/item lineage. |
| 7 | Coverage planning | prioritizeCoverageGaps + buildExpansionPlan; source readiness fails closed. |
| 8 | Adaptive tranche model | Tranche metrics + policy-driven HOLD/CONTRACT/CONTINUE/EXPAND. |
| 9 | Provider routing/evaluation | Policy-controlled routing, frozen eval cases, K2 metrics, cost/latency route bounds. |
| 10 | Evidence/source policy | Source-unready/unknown gaps are blocked from tranche allocation; evidence authority is not upgraded by provider output. |
| 11 | Automation-first review | AUTO_ELIGIBLE only after governed gates; drift/high-risk/ambiguity escalate. |
| 12 | Deduplication v2 | Exact + structural + calibrated same/cross-language semantic handling; no hidden semantic threshold. |
| 13 | Difficulty boundary | Only intended difficulty used; no calibrated/psychometric difficulty claims introduced. |
| 14 | Bilingual authoring/equivalence | BilingualEquivalenceReportV1 + critical-dimension blocking/review behavior. |
| 15 | Quality sampling | Versioned ReviewCalibrationPolicy with deterministic exception sampling and escalation. |
| 16 | Release topology | Immutable release lifecycle preserves REVIEW→CANARY→ACTIVE boundary. |
| 17 | ActivationEvidence | Schema + evaluator + evidence-bound trusted decision; forged PROMOTE metadata cannot activate. |
| 18 | CANARY policy | Missing classes/low observation volume/quality conflicts HOLD or quarantine per policy. |
| 19 | Rollback/quarantine | Immutable rollback selection and release/tranche/family/item-version quarantine events. |
| 20 | Calibration boundary | Calibration metadata/policies versioned; operating thresholds are policy inputs. |
| 21 | Measurement/improvement loop | Governed EventDefinition/registry/privacy/ports/factory signals/finding/experiment contracts. |
| 21.1 | System signals | TelemetrySink vendor-neutral port retained; no observability vendor embedded in kernel. |
| 21.2 | Factory signals | Aggregate IDs/counts/rates only; private prompt/source/reviewer/raw-error text excluded. |
| 21.3 | Product/UX signals | EventDefinition foundation supports governed product events without equating usage to learning. |
| 21.4 | Learning signals | K1 raw LearnerEvent remains boundary; K2 does not derive K3 mastery/readiness. |
| 22 | Event governance | Exact-version registry validates schema/types and applies REDACT/REJECT before trust. |
| 23 | Reuse-before-build | Analytics/telemetry/feature-flag interfaces are ports; commodity backend remains replaceable. |
| 24 | Improvement findings | Validated observations remain separate from non-causal hypotheses; ExperimentRecordV1 records tests/results. |
| 25 | Privacy/Saudi deployment boundary | Data minimization enforced in kernel; retention/legal/cross-border values remain deployment policy. |
| 26 | Failure handling | PARTIAL preserves successful siblings, exact failed stage and retry eligibility. |
| 27 | Persistence/scalability | File + SQLite reference stores with immutable IDs and parity; no premature microservices/warehouse/vector DB. |
| 28 | Public/private boundary | Pages explicitly excludes data/factory and src/platform-kernel; public app has no private-kernel import. |
| 29 | Compatibility | 1,120 questions, digest, 200 profile, bilingual/offline/browser/API behavior preserved. |
| 30 | Logical contracts | All approved K2 schemas/modules present and validator-integrated. |
| 31 | Testing requirements | TDD evidence in ledger; final product head: 351/351 Node, 22 Python, Pages/browser/API/SQLite/import green. |
| 32 | Acceptance criteria | Executable K2 acceptance contract enabled; raw item count alone never used as acceptance. |
| 33 | Deferred calibration | Numeric tranche/review/dedup/bilingual/CANARY/alert/retention/vendor/source-class choices remain evidence-driven. |
| 34 | Future programme boundary | K3 stays locked until K2 merge + post-merge verification. |
| 35 | Governance ruling | Own education semantics/lifecycle/evidence; reuse commodity infrastructure through adapters. |

## Plan task audit

The chronological RED/GREEN commit/run evidence for Tasks 1–49 is authoritative in:
`docs/superpowers/reviews/2026-09-28-k2-execution-ledger.md`.

| Task | Scope | Status at this review |
| ---: | --- | --- |
| 1 | execution baseline | COMPLETE |
| 2 | acceptance shell | COMPLETE |
| 3 | ExpansionPlanV1 | COMPLETE |
| 4 | TranchePlanV1 | COMPLETE |
| 5 | CalibrationPolicy metadata | COMPLETE |
| 6 | ProviderRoutingPolicyV1 | COMPLETE |
| 7 | ReviewCalibrationPolicyV1 | COMPLETE |
| 8 | DedupCalibrationPolicyV1 | COMPLETE |
| 9 | CanaryPolicyV1 | COMPLETE |
| 10 | coverage prioritization | COMPLETE |
| 11 | ExpansionPlan builder | COMPLETE |
| 12 | adaptive tranche policy | COMPLETE |
| 13 | TranchePlan builder | COMPLETE |
| 14 | provider routing runtime | COMPLETE |
| 15 | provider evaluation v2 | COMPLETE |
| 16 | production-failure eval seam | COMPLETE |
| 17 | structural duplicate evidence | COMPLETE |
| 18 | cross-lingual dedup | COMPLETE |
| 19 | BilingualEquivalenceReportV1 | COMPLETE |
| 20 | bilingual stage v2 | COMPLETE |
| 21 | review calibration runtime | COMPLETE |
| 22 | review-stage integration | COMPLETE |
| 23 | tranche execution | COMPLETE |
| 24 | tranche resume/retry | COMPLETE |
| 25 | tranche metrics | COMPLETE |
| 26 | adaptive follow-up | COMPLETE |
| 27 | partial failure semantics | COMPLETE |
| 28 | ActivationEvidenceV1 | COMPLETE |
| 29 | activation evaluator | COMPLETE |
| 30 | release lifecycle integration | COMPLETE |
| 31 | insufficient observation HOLD | COMPLETE |
| 32 | quarantine helpers | COMPLETE |
| 33 | EventDefinitionV1 | COMPLETE |
| 34 | event registry | COMPLETE |
| 35 | privacy enforcement | COMPLETE |
| 36 | observability ports | COMPLETE |
| 37 | factory metric events | COMPLETE |
| 38 | ImprovementFindingV1 | COMPLETE |
| 39 | improvement builder | COMPLETE |
| 40 | ExperimentRecordV1 | COMPLETE |
| 41 | K2 file store | COMPLETE |
| 42 | SQLite K2 support | COMPLETE |
| 43 | file/SQLite parity | COMPLETE |
| 44 | K2 CLI | COMPLETE |
| 45 | validator integration | COMPLETE |
| 46 | public privacy guard | COMPLETE |
| 47 | runtime regression gate | COMPLETE |
| 48 | documentation repair | COMPLETE |
| 49 | full K2 acceptance | COMPLETE |
| 50 | whole-plan review | COMPLETE — this review |
| 51 | exact-head CI | PENDING — exact-head gate after review commit |
| 52 | merge | PENDING — merge after gate |
| 53 | post-merge verification | PENDING — post-merge verification |

## Failure-mode audit

Verified:
- missing source evidence fails closed at coverage scheduling;
- unavailable/unusable semantic evidence returns REVIEW_REQUIRED rather than guessed duplicate truth;
- provider route without eligible candidate uses deterministic/manual/abstain policy fallback;
- high-risk/drift review cannot silently auto-approve;
- tranche mixed success/failure is PARTIAL and durable successes remain;
- explicit permanent failures remain non-retryable;
- missing/insufficient CANARY evidence HOLDs;
- critical activation blockers cannot be bypassed by forged metadata;
- quarantine/rollback do not mutate historical artifacts;
- private/rejected analytics properties cannot cross registry trust;
- public Pages excludes private factory/kernel artifacts.

## Deferred calibration parameters — intentional, not defects

Still deferred to observed pilot/runtime evidence:
- tranche numeric sizes and scale cadence;
- review sampling percentages;
- same-language and cross-language similarity thresholds;
- bilingual supporting-metric thresholds;
- CANARY exposure size/duration and minimum observation count;
- anomaly/alert thresholds;
- analytics retention periods;
- final analytics/observability vendor selection;
- source-class approvals for specific future content classes.

K2 provides versioned policy locations and HOLD/REVIEW behavior for these values; it does not invent production numbers.

## Non-blocking notes

1. The default K2 CLI uses a local deterministic reference runner. Its `COMPLETED` status means local tranche-job orchestration completed; it is not an ACTIVE content-release claim. Activation remains a separate governed lifecycle.
2. Event trust uses in-process identity markers. Deserialized events/evaluations must be revalidated/re-evaluated at the process boundary by design.
3. K2 deliberately does not generate/promote the 3k/6k/10k/14k content milestones in this programme run. Those are capacity checkpoints; promotion remains coverage/quality/evidence driven.

## Merge gate

Product implementation/review is ready for Task 51 exact-head CI **after this review + ledger/checkpoint documentation head is committed**.

Do not merge if either required workflow is not SUCCESS on that exact final branch head.  
Do not unlock K3 until Task 53 post-merge verification is complete.
