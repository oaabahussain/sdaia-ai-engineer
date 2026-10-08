# K4 — Consecutive-Execution Readiness Packet (NON-AUTHORITATIVE PREPLAN)

**Date:** 2026-10-09 (Asia/Riyadh)  
**Purpose:** Prepare one continuous *future* implementation session, with safe stage boundaries, verified source paths, proposed work decomposition, acceptance tests and recoverable checkpoints.  
**Hard status:** `PREPARATION_ONLY`; **NOT** the Superpowers `writing-plans` implementation plan; **NOT** approval of the written K4 spec; **NOT** permission for K4 Product code, TDD RED/GREEN, merges or releases.  
**Repo:** `oaabahussain/sdaia-ai-engineer`; PR [#64](https://github.com/oaabahussain/sdaia-ai-engineer/pull/64) (DRAFT).  
**Observed origin before creating this file:** `main@9e55881e9480b4a02d8ef5d92a0b21a9313492f1`, K4 branch `ccd9c9bff119fd295af87acfba624198e4f45891`, branch behind main 0.  
**Written K4 design artifact:** `docs/superpowers/specs/2026-10-08-k4-next-best-action-spaced-practice-design.md` at **Git blob** `d732ac22161d4b007a8f869cbc928ec6737a40a8` (`DRAFT_FOR_EXPLICIT_SPEC_REVIEW`).  
**K3 execution truth:** `docs/superpowers/state/CURRENT-STATE.json` revision 76, `programme=K3`, `COMPLETE`, tasks 1–41, `low_model_ready=false`, `ACTIVE_REF_RESOLUTION_VALID=PENDING`. Preserve unchanged.

## 0. Single-session operator contract

The goal is to run work back-to-back **after** both distinct architectural approvals. Do not send routine "continue?" prompts inside an approved work batch. Instead, for each bounded task:

`source identity → preflight PASS → brief/packet/digest check → test-first RED for missing behavior → minimal GREEN → affected regressions → scope/result verification → commit → ledger checkpoint → next task`.

**STOP/DO NOT AUTO-BYPASS** on any of: missing written-spec approval, missing written-plan approval or execution-method selection, main/spec/plan drift, missing trusted content catalog, unsupported workspace capability, unaccepted RED, unexpected failures, security/PII leak, open Critical/Important, review required but absent, non-green exact-head CI, external effect requiring separate authorization (merge to main, publication), or unavailable rollback. Do not increase timeouts or weaken tests to force PASS.

A model/tool session may do several sequential tasks in one reply when capabilities and gates permit; it must stop at a genuinely blocked gate, save reproducible proof, and not claim autonomous background work.

**Evidence vs assumptions:** Existing code paths and scripts below are verified on `main` by direct GitHub file inspection. Proposed K4 paths, tests and modules are **suggestions only** and must be formalized by `writing-plans` *after spec approval*, with real file/test ownership and exact signatures.

## 1. Required approvals and machine-checkable gates

| Gate | Contract | Expected durable proof | Current |
| --- | --- | --- | --- |
| G0 — design/spec | User explicitly approves the specific written K4 spec (full blob SHA), after reviewing its 12 sections and 18 acceptance conditions | User approval referring to the specific written artifact, then approval record/decision note in GitHub | **BLOCKED: approval not observed** |
| G1 — implementation plan | After G0, invoke `superpowers:writing-plans` to author `docs/superpowers/plans/YYYY-MM-DD-k4-next-best-action-spaced-practice.md` with exact tasks, files, interfaces, commands, tests and checkpoints | Explicit separate plan approval and execution-method choice (native/subagent) | NOT_STARTED |
| G2 — fresh source state | Live main/head/base + spec/plan Git blobs + CI + permitted branch + actual runtime worktree/capability | Approved K4-specific state manifest/schema/validator and process preflight, not K3 state reused | BLOCKED |
| G3 — implementation | Task-by-task deterministic TDD, immutable K3 events, safe public K2 content boundary | Accepted RED, GREEN, regression, scope and checkpoint per formal task | BLOCKED |
| G4 — final review/CI | No open Critical/Important; independent review if actually available; exact PR head Quality + Server PASS | CI run IDs, actual reviewer comments/decisions, exact SHA, bank invariants | BLOCKED |
| G5 — landing | **Separate user authorization for PR and exact current HEAD**, protections intact, no force/admin; merge approved Product PR only, not DRAFT design PR as a shortcut | Actual merged SHA, parents, source tree identity, review decision | BLOCKED |
| G6 — production verification/closure | Fresh merged-main Node/Python/browser/Pages and live checks; preserve real state | Pages run ID/deployed SHA, canonical digest, new K4 ledger/state `COMPLETE` only after actual proof | BLOCKED |

**Important distinction:** ChatGPT is asked to prepare *all* gates here, not to treat preparation as one implicit approval covering G0/G1/G5.

## 2. Inspected baseline and exact integration evidence

- `package.json`: Node.js ESM; `npm test` is `node --test tests/*.test.js`; `npm run validate`, `npm run verify:sw`, `npm run verify:factory-import`, `npm run process:verify`; the process verifier is **K3-specific**. Node 22 and Python 3.12 are pinned in CI.
- `.github/workflows/ci.yml`: installs via `npm ci --ignore-scripts` plus Python requirements, runs canonical validation, Node tests, Python server tests, K3 process control, K3 state validation, current bank import, SW, Pages preview and browser smoke.
- `.github/workflows/server-tests.yml`: Python tests, SQLite schema smoke, browser and API contract checks.
- `.github/workflows/pages.yml`: validates, builds, deploys Pages, checks exact built/live index digest and live assets on actual released SHA. Never infer a merged-bot commit automatically triggered all workflows.
- `src/app.js` and `index.html`: existing `full`/`section` entry points, home/exam/results screens; no existing one-question non-strict K4 browser route.
- `src/assessment/assessmentSnapshot.js`: strict browser assessment context supports `full`/`section` only.
- `src/evidence/recorder.js`: non-strict `practice` evidence supported, but `recordEvaluation` explicitly denies a browser producer.
- `src/evidence/replay.js`: replay requires nonempty positive watermark range; `throughStoreSeq=0` needs separate cold-start handling.
- `src/evidence/corrections.js`, `src/evidence/projections/attemptProjection.js`, `src/evidence/indexedDbStore.js`: corrections, strict response decisions, source-bound IndexedDB read and fingerprints; `accepted_at` uses device clock, not server authority.
- `src/logic/questionBank.js` generates the public 1,120 questions reused by current full/section exam modes; this does not prove any existing public release is a private holdout.
- `scripts/build_pages_artifact.js` copies `src`, `tracks`, selected public `data` and forbids `data/factory` and `src/platform-kernel`. Any new public K4 policy/catalog/schema needs an explicit safe artifact-copy contract.
- `sw.js` enumerates precached shell assets; current `scripts/verify_sw_assets.js` audits shipped cache. Cache versioning and offline reload need test-first release changes.

Existing bank invariant in K3 closure and K4 spec: 1,120 questions, 7 domains, 200 full-exam items, question payload SHA256 `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`. No new K4 content release is proposed.

## 3. Provisional task sequence: proposed preparation only; re-scope after approved written plan

**These are 16 work units for decomposition and planning; NOT authorized tasks and NOT a task count committed by G1.** A formal plan may merge/split these if it preserves full acceptance coverage. All target `tests/k4-*.test.js` names below are **proposed absent files**, not existing passing tests.

| Draft unit | Proposed owner files / responsibility | Behavioral RED/acceptance proving outcome | Dependency |
| --- | --- | --- | --- |
| P01 | `docs/superpowers/state/k4-*.schema.json`, new K4 state validator/checkpoint/ledger (names to finalize); do not change K3 `CURRENT-STATE` | Rejected stale main/spec/plan SHA, missing approved gates, bad ledger and unauthorized merge | G0 + G1 |
| P02 | `data/schema/k4-rule-policy-v1.schema.json`, `data/recommendations/k4-rule-policy-v1.json`; validation module `src/recommendations/policy.js` | Valid `K4.RULES.v1` pinned defaults; reject malformed delay, locale-specific time and enabled FSRS | P01 |
| P03 | `src/recommendations/publicCatalog.js` and reviewed release-bound public data adapter | Reject holdout/protected/retired/unavailable, unknown release/family/version; don't assume all past mock-visible public items are private | P02 |
| P04 | `src/recommendations/sourceReader.js`: thin K3 store and replay adapter | Source/learner/release mismatch, invalid watermark, fingerprints and zero-history cold start behave safely | P03 |
| P05 | `src/recommendations/projection.js`: correction-aware exposure projection | VOID/SUPERSEDE/conflicting corrections, dedupe interactions and versions, strict stale/unknown response quarantine | P04 |
| P06 | `src/recommendations/clock.js`: validated UTC due-time policy | Accepted device-time skew, bad ISO, DST/travel/time jumps, deterministic due intervals; no invented correctness | P05 |
| P07 | `src/recommendations/ranker.js`: pure eligible-first RecommendationV1 | Stable ranking/tie-break across locales; no early future review while new candidates; exact ACTION/NO_ELIGIBLE/INSUFFICIENT statuses and provenance cap | P03 + P05 + P06 |
| P08 | `src/recommendations/preferencesStore.js`: separate local-only preferences | Snooze/dismiss/skip persistence only after successful IDB write, version/revision update and denied/quota/corrupt fallback | P07 |
| P09 | `src/recommendations/session.js` or narrow `src/evidence/appBridge.js` adapter | Ordinary K3 start/present/response, one question, no call to strict assessment form constructor, no fabricated `evaluated` event | P07 |
| P10 | `index.html`, `src/app.js`, `src/presentation/coreI18n.js` and modest CSS | Home Next Action, View Why, Start/Another/Snooze; no exam route regressions; AR/EN RTL/keyboard behavior | P08 + P09 |
| P11 | `src/recommendations/recovery.js` only if needed; adapter fallback paths | Empty/no eligible/invalid storage/offline/outdated content errors do not claim a saved action or deep-link unavailable item | P10 |
| P12 | `sw.js`, `scripts/verify_sw_assets.js`, `scripts/build_pages_artifact.js` and tests | New modules/policy loaded on real Pages and offline cached reload; no private factory file shipped | P10 + P11 |
| P13 | `tests/k4-projection.test.js`, `tests/k4-ranking.test.js`, `tests/k4-clock.test.js` or equivalent contract suite | Node/browser same frozen inputs/clock, untrusted browser remains exposure-only, zero unverified FSRS ratings | P05–P07 |
| P14 | `tests/k4-app-integration.test.js` and `scripts/browser_smoke.py` extensions | Single-item practice, AR/EN accessibility, refresh/resume, snooze expiry at same source watermark and full/section exam unchanged | P10–P12 |
| P15 | process/CI or `scripts/` additions only as needed, `docs/superpowers/reviews/k4-*-review.md` | Exact bank SHA; full Node/Python/API/browser/Pages checks; independent review; no Critical/Important; exact final HEAD | P01–P14 |
| P16 | K4 postmerge verification and authoritative K4 closure records | Actual merged main + deployed Pages fresh tests, release evidence; no silent transition to K5 | G5 |

**Formal planning required before P01:** turn each Pxx into properly right-sized Superpowers tasks with exact signatures and file scope, a failed test/accepted RED proof, a GREEN command and a checkpoint contract. Number and dependency ownership are provisional; this document is *not* a substitute for `writing-plans`.

## 4. Release regression command catalog (verified names, NOT executed during preparation)

Only run in an approved isolated workspace after G1/G2. Pin the exact live base and check commands actually exist.

```bash
npm ci --ignore-scripts
python3 -m pip install -r server/requirements.txt
npm run validate
npm test
npm run verify:sw
npm run verify:factory-import
node --check src/app.js
PYTHONPATH=server python3 -m pytest server/tests -q
python3 scripts/browser_smoke.py
node scripts/build_pages_artifact.js _site
node scripts/verify_sw_assets.js _site
```

CI also validates preview URL and API/browser adapter contracts. **Do not run the K3-only `npm run validate:state` or `npm run process:verify` as proof of K4 readiness**; existing CI can still run them for K3 regression, but K4 needs separate manifest/schema/preflight. Distinguish test count reported at actual execution time from historical K3 test totals.

## 5. Required falsification matrix for approval of the eventual plan

| Risk | Prove by |
| --- | --- |
| Browser input masquerades as trusted grade | untrusted `recordEvaluation` denied; no correct/memory claims |
| Corrected/conflicting evidence boosts recommendation | conflicting family quarantined; valid replacement recomputed |
| A public family coincides with a strict exam | candidate classification depends on approved public release status, not mock history |
| Zero evidence leads to invalid replay | cold start source-bound response without `replayEvidence(toSeq=0)` |
| Time expires with unchanged store watermark | now-bound recomputation and snooze expiry changes recommendation without stale cache |
| Missing/retired release or offline asset leaks private item | no deep link, no protected answer/pool in recommendation |
| Different timezone/locale changes machine ordering | invariant stable IDs, UTC comparison, stable tie break |
| Quota/IndexedDB error confirms snooze without storage | persistence claims only after success, safe fallback |
| Code adds new assets without Pages/SW registration | verifier rejects missing public resources; private paths absent |
| UI breaks exam or bank | full/section behavior, immutable bank count/hash and scoring unchanged |

## 6. Sequential-run handoff and no-reconstruction rule

At each resumed session or after each nonterminal batch:
1. GitHub read latest `main`, PR/branch HEAD, branch base and `CURRENT-STATE`, compare them; never use dated handoff as execution authority.
2. Resolve spec/plan Git blob SHAs and actual user approval artifacts; **never infer approvals from an execution request**.
3. If G0 lacks approval, present link to exact written spec and stop before `writing-plans`.
4. After G0 approval invoke **only** `superpowers:writing-plans` for the detailed executable plan. Save the plan in its proper plans directory, review against the spec, and stop for **separate** plan approval and execution method selection.
5. After G1 approval choose true subagent-driven implementation only if runtime provides an actual independent agent dispatch; otherwise `superpowers:executing-plans` inline. Preserve worktree/branch isolation.
6. Per task follow preflight→RED→GREEN→regression→review→ledger→checkpoint; don't ask routine continuation. On unexpected failure use `systematic-debugging`; never adjust test timing without root cause.
7. Before Product landing use `verification-before-completion` and actual independent code review when available. Stop at G5 for **exact-current-SHA** user merge authorization. Do not merge a DRAFT research PR as a Product implementation.
8. Verify real merged main and deployed Pages before `K4 COMPLETE`; only after that consider K5 research/spec gating.

### Recommended exact future prompt once the spec has been explicitly approved

> The K4 written spec at Git blob `d732ac22161d4b007a8f869cbc928ec6737a40a8` is approved for the **planning stage only**. Invoke Superpowers `writing-plans` and write an exact-file, per-task TDD plan, using `docs/superpowers/reviews/2026-10-09-k4-consecutive-execution-preparation.md` as a *non-authoritative preparation map*. Verify live refs and any spec drift; preserve K3 untouched. Submit the finished plan for a **separate approval** before starting code.

### Skill routing

- Present: `superpowers:brainstorming` (spec review), Evidence Engineering Research (existing source ledger/reuse/failure map), `verification-before-completion` (only claims supported by exact GitHub evidence).
- After G0: `superpowers:writing-plans`.
- After G1: `using-git-worktrees`; either `executing-plans` or real `subagent-driven-development`; `test-driven-development`; `systematic-debugging`; `verification-before-completion`.
- Review/integration: `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`, GitHub workflow/PR/CI tools. Do not claim unobserved agents/reviews or run ZzzOps as a competing control plane.

**Bottom line:** This packet reduces future navigation and forgotten tests but changes no executable scope or permission. Approval gates remain live, externalized and separate.
