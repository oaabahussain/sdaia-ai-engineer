# Programme A — Durable Handoff

**Date:** 2026-09-26  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Implementation branch:** `impl/programme-a-contract-stabilisation`  
**Base:** `main@362d35c697411d4eddcc4536c843df17161d3374`  
**Draft PR:** #7 — open, Draft, not merged  
**Architecture constitution:** `design/platform-vnext-spec` — accepted/authoritative status recorded at `533c89c13d403164d7f8a68a0cd00f59d4f91f88`

> This file is the durable Programme A continuity record. Task 11 establishes the documentation/governance baseline; Task 12 remains the final acceptance gate until its verification record is committed.

## Authoritative continuation point

Tasks 1–10 are complete and persisted on GitHub. Task 11 documentation is being established on this branch; Task 12 is the remaining acceptance gate.

Latest product-code checkpoint after Task 10:

`6be140e9e1e80127bb9264e1a3e8a1f7386b20e1`

Any later commit may be documentation-only (including this handoff). A new session should always resolve the current branch HEAD from GitHub, then verify that the Task 10 code checkpoint is an ancestor.

**Exact next task after the Task 11 documentation commit: Task 12 — Whole-Branch Verification and Programme A Acceptance Gate.**

Do not reconstruct Tasks 1–10. Read the current documentation baseline before Task 12.  
Do not merge PR #7 before the Programme A acceptance gate.  
Do not begin Task 11 before Task 10 is green.  
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

### Task 10 — Manifest-driven CI and Pages validation
Final Task 10 product-code checkpoint:
`6be140e9e1e80127bb9264e1a3e8a1f7386b20e1`

TDD / migration sequence:
- `2b44014c4207e39c6262e3a18a7753ade675eb2b` — RED: six release-contract tests failed on unnamed scripts, full-data publishing, hard-coded live arithmetic, missing live verifier, and pinned SW profile path;
- `d01a7f6c61a141b398abcdb8e46935d1ea9e2a04` — initial implementation;
- `8b52f92a4b6a4bb194f65516dde6b648ca2b8bab` — updated the older Task 7 Pages test whose former full-`data/` copy expectation contradicted Task 10 legacy exclusion;
- `1dcb51d52a3e7fdb35b2423afcb50f5adee4ae6d` — RED requiring the PR gate to assemble the public Pages artifact;
- `24e497aa807892f5aa59397da9a5768821f7c682` — GREEN artifact assembly verification;
- `28af47ccedf88757877c07fa090fcc6d8507210c` — RED requiring the live-release verifier to execute against the assembled artifact over HTTP;
- `6be140e9e1e80127bb9264e1a3e8a1f7386b20e1` — final GREEN.

Result:
- package scripts now expose `npm test`, `npm run validate`, and `npm run verify:sw` without new dependencies;
- PR CI uses the named scripts;
- PR CI builds the same public artifact boundary and proves `_site/data/legacy` does not exist;
- Pages publishes `src/`, `tracks/`, current concepts/migrations, `learn.json`, and `cases.json` rather than copying all `data/`;
- `data/legacy/` remains in repository history/tree for migration but is excluded from the public Pages artifact;
- `scripts/verify_live_release.js` loads the live canonical manifest, resolves the default profile by ID, validates all manifest-declared concept chunks plus learn/cases, and checks the live service-worker contract;
- PR CI serves the assembled `_site` over local HTTP and executes the same live verifier before merge;
- Pages post-deploy verification delegates content checks to the manifest-driven verifier;
- `scripts/verify_sw_assets.js` derives the default profile asset from the cached manifest instead of pinning its filename;
- `scripts/validate.js` no longer uses a generated-question `>=1000` release assumption; it validates canonical contract integrity instead;
- server/API tests remain a separate gate and continue asserting RuntimeBundleV2.

Ruling:
- the plan's sample live verifier selected a path ending in `project-reference-v1.json`. That would preserve a filename-level constant contrary to Task 10's manifest-driven interface. The implementation instead loads `manifest.exam_profiles` and selects the profile whose ID equals `manifest.default_exam_profile`. Cost if wrong: the verifier performs small additional JSON fetches when multiple profiles exist; correctness is more robust to filename/profile changes.

Fresh Task 10 verification:
- Node tests: **44/44 PASS**
- `npm run validate`: **PASS**
- `npm test`: **PASS**
- `node --check src/app.js`: **PASS**
- service-worker assets: **PASS (22 shell-only; manifest-derived default profile)**
- PR Pages artifact assembly: **PASS**
- public artifact legacy exclusion: **PASS**
- local HTTP live manifest verification: **PASS**
  - `sdaia-ai-engineer@2026.09`
  - default profile `sdaia-ai-engineer.project-reference.v1`
  - manifest-declared concept chunks: 7
  - live service-worker contract
- browser smoke: **PASS**
- Python server tests: **16/16 PASS**
- SQLite schema smoke: **PASS**
- Browser adapter contract: **PASS**
- API adapter contract: **PASS**
- active legacy reference contract: **PASS**
- educational payload compatibility test: **PASS**
- generated questions: **1120**
- weights: **100.0%**

Release-surface audit:
- no duplicated literal dependency on `1120`, `200`, `1000`, seven-domain wording, or `sdaia-ai-pages-v8`;
- no pinned `project-reference-v1.json` filename in validation/release scripts;
- no full `data/` copy into Pages;
- both PR artifact verification and Pages workflow explicitly assert no published `data/legacy/`.

## Compatibility invariant

Learner-visible compatibility digest remains:

`5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`

No Task 8 question/content/scoring changes were made.

## Remaining Programme A work

### Task 11 — NEXT
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
5. Verify the Task 10 checkpoint `6be140e...` is an ancestor of current HEAD.
6. Run a brief baseline verification.
7. Start **Task 11 only** using the accepted constitution and current implementation truth.
8. Use `systematic-debugging` on any failure.
9. Use `verification-before-completion` before declaring Task 11 green.
10. Keep PR #7 Draft and unmerged until Programme A acceptance is complete.


## Maintainer quick start

Run the public site over HTTP:

```bash
python3 -m http.server 8080
```

Core gate:

```bash
npm ci --ignore-scripts
npm run validate
npm test
node --check src/app.js
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
node scripts/contract_test.js browser
```

API adapter verification is documented in `TESTING.md`.

Canonical files:
- `tracks/sdaia-ai-engineer/manifest.json`
- its manifest-declared exam profiles/content
- `data/schema/runtime-bundle.schema.json`
- `data/schema/state-v2.schema.json`
- `data/migrations/sdaia-generated-v2-question-ids.json`

Legacy:
- `data/legacy/static-bank-v1/` is migration input only and must not become an active runtime source.

Not yet implemented:
- 14,000+ expansion;
- production mastery/readiness learner engine;
- protected assessment delivery;
- authentication/authorization;
- full multi-track authoring/registry programmes.

### Conceptually adding a new track

Programme A establishes the contract pattern, not the full Programme B tooling. A future new track should:
1. receive a unique versioned track ID;
2. add a manifest under `tracks/<track-id>/manifest.json`;
3. point that manifest at versioned public content and one or more exam profiles;
4. use stable namespaced content/question identities;
5. supply evidence status for exam-rule claims;
6. pass manifest/schema/runtime/release tests without adding subject constants to core code.

### Recovery baseline

Confirmed baseline SHA:
`362d35c697411d4eddcc4536c843df17161d3374`

Planned rollback tag:
`pre-programme-a-2026-09-23`

The remote tag could not be verified through the available GitHub connection on 2026-09-26. Treat the SHA as authoritative until the tag is explicitly confirmed.

### Evidence gap

The current default profile remains `project-reference-unverified`. Do not call the current SDAIA weights/exam rules official unless current primary evidence is obtained and recorded.
