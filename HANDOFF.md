# Programme A — Durable Handoff

**Date:** 2026-09-26  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Implementation branch:** `impl/programme-a-contract-stabilisation`  
**Base:** `main@362d35c697411d4eddcc4536c843df17161d3374`  
**Draft PR:** #7 — open, Draft, not merged  
**Architecture constitution:** `design/platform-vnext-spec` — accepted/authoritative status recorded at `533c89c13d403164d7f8a68a0cd00f59d4f91f88`

> This file is an early durable continuity record requested during Programme A execution. It does **not** mean Task 11 (the complete documentation/governance baseline) is complete.

## Authoritative continuation point

Tasks 1–9 are complete and persisted on GitHub.

Latest product-code checkpoint after Task 8:

`53f1ba9b42d4536c232448a63f55ba4734316fa7`

Any later commit on the implementation branch before Task 9 may be documentation-only (including this handoff). A new session should always resolve the current branch HEAD from GitHub, then verify that the Task 8 code checkpoint is an ancestor.

**Exact next task: Task 10 — Make CI and Pages Validation Manifest-Driven.**

Do not reconstruct Tasks 1–9.  
Do not merge PR #7 before the Programme A acceptance gate.  
Do not begin Task 10 before Task 9 is green.  
Do not use the old corrupted Base64/XZ transfer mechanism.

## Governing documents

1. Architecture constitution:
   `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
   on `design/platform-vnext-spec`.
2. Programme A execution plan:
   `docs/superpowers/plans/2026-09-23-programme-a-repository-contract-stabilisation.md`
   on `design/platform-vnext-spec`.
3. This `HANDOFF.md` is the durable execution checkpoint on the implementation branch.

If plan text conflicts with the constitution, the constitution wins. Deviations must be recorded as explicit rulings.

## Completed tasks

### Task 1 — Freeze baseline/regression fixtures
Completion commit:
`26d83eaa13239d7f23a77ddda77a74b555fe7ea2`

Result:
- production baseline captured;
- 1,120 generated questions;
- 7 domains;
- 200-question reference profile;
- compatibility digest frozen.

### Task 2 — Canonical TrackManifestV1 + ExamProfileV1
Completion commit:
`fbcc41e90ee0db7a38c1455f3dd8fab75b99dd2e`

Result:
- canonical track manifest;
- canonical exam profile;
- schemas/loader/tests;
- project-reference-unverified evidence status;
- weights total 100.0%.

### Task 3 — Stable content/question IDs
Completion commit:
`29c115944beb0005869eef7dfc587fb699f9520c`

Result:
- 1,120 stable unique question IDs;
- 1,120 unique family IDs;
- 1,120 legacy qN mappings;
- stable-ID migration map;
- compatibility digest unchanged.

### Task 4 — StateV2 + neutral anonymous identity
Completion commit:
`824d961ae5f6d3f94f8c1f76a62a44fc5d272747`

Result:
- `learning-platform.state.v2`;
- `learning-platform.anon-id.v1`;
- legacy keys migration-only;
- Browser/API identity aligned;
- unfinished-state migration preserves progress;
- repeated DB initialization regression covered.

### Task 5 — RuntimeBundleV2 shared Browser/API contract
Completion commit:
`53355b2e47855e9841b60121f9e51e1c25c9b922`

Result:
- Browser/API expose the same logical RuntimeBundleV2;
- public `/v1/bank` does not require anonymous-ID header;
- OpenAPI makes identifier/auth boundary explicit;
- old 121-item API runtime bank is no longer the active contract.

### Task 6 — Drive exam behaviour from ExamProfileV1
Final Task 6 checkpoint:
`ac5f6ba9ad36fa8679de2c85e76e761e0dda9588`

Result:
- full exam count comes from `exam_profile.question_count`;
- weights come from `exam_profile.weights`;
- section sizes come from `exam_profile.section_sizes`;
- hidden `total = 200` fallback removed;
- UI exam counts/text are profile-driven;
- browser smoke expectations use profile/fixtures.

Testing lesson captured:
- after dynamic screen transitions, prefer stable DOM state / direct `textContent` checks over WebDriver element-text reads when stale-read behaviour is possible;
- diagnose DOM state before modifying product code.

### Task 7 — Safe Service Worker / offline migration
Final Task 7 checkpoint:
`c8f31ca6c58949dcc58ef92ea1f2c3a85d423ba0`

Result:
- synchronous registration helper at module evaluation;
- shell-only precache;
- no concept-bank chunk precache;
- on-demand same-origin GET caching;
- navigation-only `index.html` fallback;
- non-navigation cache misses return `Response.error()`;
- unusable inline bank removed;
- `file:` protocol fails clearly;
- Pages artifact includes canonical `tracks/` config;
- SW asset verification is in PR quality gate;
- browser smoke proves cached reload after the local HTTP server is stopped.

Ruling:
- Task 7 plan did not list `.github/workflows/pages.yml`, but Task 7 changed shell dependencies and retired the old cache contract. Minimal release-workflow changes were required to avoid a contradictory/broken Pages artifact. Broader manifest-driven CI remains Task 10.

### Task 8 — Preserve public feedback submissions
Latest product-code checkpoint:
`53f1ba9b42d4536c232448a63f55ba4734316fa7`

RED:
- `739dc6bf710b81277955ada6d6533857523dc532`
- failed because the public Markdown template did not exist and the feedback page did not pass `template=public-feedback.md`.

GREEN result:
- `.github/ISSUE_TEMPLATE/public-feedback.md` added;
- `blank_issues_enabled: false` remains unchanged;
- feedback helper uses:
  `template=public-feedback.md`, `title`, and `body`;
- public warning remains explicit: GitHub submissions are public and must not contain personal/confidential/sensitive information;
- suggestion, contribution, and rating browser-smoke paths each prove typed content is URL-encoded into the GitHub issue URL before `window.open`.

Fresh Task 8 verification:
- Node tests: **53/53 PASS**
- canonical validator: **PASS**
- `node --check src/app.js`: **PASS**
- service-worker assets: **PASS (22 shell-only)**
- browser smoke: **PASS**
  - exam/profile flow
  - resume/state
  - offline cached reload
  - feedback suggestion URL
  - feedback contribution URL
  - feedback rating URL
- Python server tests: **16/16 PASS**
- SQLite schema smoke: **PASS**
- Browser adapter contract: **PASS**
- API adapter contract: **PASS**
- generated questions: **1120**
- weights: **100.0%**
- learner-visible educational payload compatibility test: **PASS**

### Task 9 — Quarantine legacy content and remove active dead paths
Final Task 9 checkpoint:
`5c361efbf10f960075d8363f21ea2fcdb9aa6b0d`

RED:
- `2a6a710132f8850ad7410eac4f33688b29311340`
- contract scan failed on the still-active `scripts/verify_release.py → weights.json` dependency.

GREEN result:
- former `data/questions.json` moved byte-for-byte to `data/legacy/static-bank-v1/questions.json`;
- former `data/sessions.json` moved byte-for-byte to `data/legacy/static-bank-v1/sessions.json`;
- legacy disposition README marks the 121-item bank as `MIGRATE_PENDING` and `NOT ACTIVE`;
- active `data/weights.json` removed after manifest/profile consumers were already canonical;
- obsolete question/session/bank schemas removed;
- unreferenced State V1 schema removed by explicit ruling because StateV2 is canonical and migration code does not consume the old schema;
- stale `scripts/verify_release.py` removed;
- hard-coded concept-file helper and loader removed; baseline regression now uses the canonical track loader;
- disconnected mastery/readiness/review/mission modules and their legacy/equivalence tests removed;
- validator rejects reappearance of retired active paths and requires the preserved legacy migration inputs;
- CI/server workflow includes an explicit no-active-legacy contract check.

Debugging note:
- the first GREEN attempt exposed a false-positive in the contract test: `scripts/validate.js` mentioned retired paths only as negative guards. The test was corrected to distinguish a guard from an active consumer before product code was touched.

Ruling:
- `data/schema/state.schema.json` (State V1) was not explicitly listed in the Task 9 file list, but it was an unreferenced active-looking schema competing with `state-v2.schema.json`. It was removed to satisfy the constitution's no-ambiguity rule. Cost if wrong: an undocumented external consumer of that repository path would need Git history; no in-repo consumer exists.

Fresh Task 9 verification:
- Node tests: **36/36 PASS**
- canonical validator: **PASS**
- browser smoke: **PASS**
- service-worker shell assets: **PASS (22)**
- Python server tests: **16/16 PASS**
- SQLite schema smoke: **PASS**
- Browser adapter contract: **PASS**
- API adapter contract: **PASS**
- active legacy reference contract: **PASS**
- educational payload compatibility test: **PASS**
- generated questions: **1120**
- weights: **100.0%**

## Compatibility invariant

Learner-visible compatibility digest remains:

`5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`

No Task 8 question/content/scoring changes were made.

## Remaining Programme A work

### Task 10 — NEXT
**Make CI and Pages Validation Manifest-Driven**

Key intent:
- add named package scripts without new dependencies;
- use canonical manifest/profile in CI/release verification;
- publish only required current data, explicitly excluding `data/legacy/`;
- remove duplicated 1,120/200/seven-domain assumptions from release checks;
- create manifest-driven live-release verification.

Note: `npm run validate` intentionally does **not** exist yet at the Task 8 checkpoint. Current canonical validator remains:
`node scripts/validate.js`.
Adding the named script belongs to Task 10.

### Task 11
**Document the New Baseline and Governance**

Still not complete.

Planned outputs include:
- README current-truth cleanup;
- ARCHITECTURE.md;
- MIGRATIONS.md;
- TESTING.md;
- DEPLOYMENT.md;
- DATA-MODEL.md;
- SECURITY.md;
- finalised HANDOFF.md;
- CHANGELOG.md;
- ADRs;
- CONTRIBUTING/governance updates.

This early HANDOFF.md must be reconciled/expanded during Task 11, not treated as a substitute for the Task 11 documentation baseline.

### Task 12
**Whole-Branch Verification and Programme A Acceptance Gate**

Must include:
- complete fresh local/CI-equivalent verification;
- stale legacy-contract scans;
- hard-coded profile-constant audit;
- schema/manifest integrity;
- full baseline diff review;
- Superpowers code review;
- final re-run after accepted fixes;
- final verification record.

Do not claim Programme A complete before Task 12 is green.

## Current known evidence/security boundaries

- SDAIA exam weights remain `project-reference-unverified` unless new primary evidence is obtained.
- The project remains independent/unofficial.
- Browser-shipped question content is public.
- Anonymous UUID is an identifier, not authentication.
- Protected/high-stakes content delivery is future work.
- No confidential/leaked real exam questions should be added.
- The 14,000+ content expansion has not started in Programme A.

## Startup instructions for a new session

1. Invoke Superpowers first.
2. Read this file.
3. Read the accepted constitution and Programme A plan from `design/platform-vnext-spec`.
4. Fetch `impl/programme-a-contract-stabilisation` and verify its current HEAD.
5. Verify the Task 9 checkpoint `5c361ef...` is an ancestor of current HEAD.
6. Run a brief baseline verification.
7. Start **Task 10 only** with TDD.
8. Use `systematic-debugging` on any failure.
9. Use `verification-before-completion` before declaring Task 10 green.
10. Keep PR #7 Draft and unmerged until Programme A acceptance is complete.
