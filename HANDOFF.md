# Programme A — Durable Handoff

**Date:** 2026-09-26  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Implementation branch:** `impl/programme-a-contract-stabilisation`  
**Base:** `main@362d35c697411d4eddcc4536c843df17161d3374`  
**Programme A status:** merged to `main`, deployed, and post-merge verified.  
**Programme A merge SHA:** `1808442442cf7e75ba59a298df93e17fd84244f0`  
**Architecture constitution:** `design/platform-vnext-spec` — accepted/authoritative status recorded at `533c89c13d403164d7f8a68a0cd00f59d4f91f88`

> Programme A Tasks 1–12 are complete. Historical Task 1–12 evidence remains below; B0 now synchronizes governance/research truth on top of the accepted implementation.

## Authoritative continuation point

Programme A Tasks 1–12 are complete, merged, deployed, and post-merge verified.

Verified Programme A implementation checkpoint:

`471491d9d851a9406ad92c2dc3072a876ce68b04`

Programme A merge commit on `main`:

`1808442442cf7e75ba59a298df93e17fd84244f0`

Any future session should resolve the current `main` SHA, read the final review, and treat later governance changes separately from the accepted implementation checkpoint.

**Current governance action:** finish B0 governance/research sync. **After B0 merge, exact next design task:** B1 — Track Presentation Contract design. Any Programme B implementation still requires its own bounded design/spec review.

Do not reconstruct Tasks 1–12. Use the final review record and this handoff as the continuation source.  
Programme A acceptance/merge is complete. Do not reconstruct Tasks 1–12.  
Do not begin Programme B runtime implementation from this B0 branch.  
Do not use the old corrupted Base64/XZ transfer mechanism.

## Governing documents

1. Architecture constitution:
   `docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md`
   available directly on the B0 branch and intended for `main`.
2. Programme A execution plan:
   `docs/superpowers/plans/2026-09-23-programme-a-repository-contract-stabilisation.md`
   remains historical Programme A planning evidence.
3. `docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md` is the dated research amendment for future programmes.
4. This `HANDOFF.md` is the durable current continuation record.

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

### Task 11 — Documentation and governance baseline
Final Task 11 checkpoint:
`c7a52c74d79a8bdfd57222429cee263419c2fa6f`

TDD:
- `59d83f69b5f74500a4cc294c20a47ea16f95c54f` — RED: eight documentation contracts failed on missing/incomplete current-truth documentation.
- `8a3693b611a366c60c2185c68f7c58919e015603` — documentation baseline implementation.
- `c7a52c74d79a8bdfd57222429cee263419c2fa6f` — corrected a negation false-positive in the changelog test; full gate GREEN.

Result:
- README now separates current 1,120/200-question project-reference facts from the future 14,000+ target;
- architecture, migration, testing, deployment, data-model and security documents describe implemented Programme A truth only;
- four ADRs record canonical runtime contract, neutral storage namespace, public/protected content boundary, and legacy-bank disposition;
- contribution rules protect stable IDs, profile-owned exam rules, evidence status, track-neutral core code and explicit legacy dispositions;
- governance target requires CI before merge and defers branch protection/CODEOWNERS until the owner/maintainer workflow is confirmed;
- changelog is explicitly Unreleased and does not claim merge/deployment;
- handoff includes start/test/deploy concepts, canonical files, legacy disposition, future/non-implemented scope and conceptual new-track steps.

Rollback evidence gap:
- the immutable baseline SHA `362d35c697411d4eddcc4536c843df17161d3374` is confirmed;
- planned tag `pre-programme-a-2026-09-23` could not be verified on the GitHub remote with the available connection, and the execution environment cannot reach GitHub directly;
- documentation therefore treats the SHA as authoritative and does not falsely claim the remote tag exists.

Fresh Task 11 verification:
- documentation contract: **8/8 PASS**
- full Node suite: **PASS**
- canonical validator: **PASS**
- Pages artifact/live-verifier gate: **PASS**
- browser smoke: **PASS**
- Python server/API gate: **PASS**

### Task 12 — Whole-branch verification and Programme A acceptance
Verified implementation head before the final review-record commit:
`471491d9d851a9406ad92c2dc3072a876ce68b04`

Final acceptance evidence:
- `npm run validate`: PASS
- Node suite: **57/57 PASS**
- `node --check src/app.js`: PASS
- service-worker shell verifier: **PASS (22 assets)**
- Pages artifact assembly and local HTTP live-release verifier: PASS
- browser smoke: PASS, including offline cached reload and feedback URLs
- Python server tests: **16/16 PASS**
- SQLite schema/apply/query smoke: PASS
- Browser adapter contract: PASS
- API adapter contract: PASS
- active legacy reference contract: PASS
- learner-visible educational payload compatibility: PASS
- baseline compare: **49 commits ahead, 0 behind** from `362d35c697411d4eddcc4536c843df17161d3374`.

Task 12 review findings fixed with RED→GREEN coverage:
1. feedback page could write preferences back into legacy `sdaia.state.v1`; it now reads legacy only as fallback and writes only an existing canonical StateV2 record;
2. app/runtime bundle/question-bank core retained implicit current-track defaults; current bootstrap selection is isolated in config and core functions now consume explicit/loaded track identity;
3. app bank-capacity validation used a hard-coded `1000` threshold; it now checks the loaded profile's required question count;
4. adapter/compatibility tests repeated current 1,120/200 totals instead of versioned fixtures;
5. browser smoke pinned the current exam-profile filename instead of resolving `manifest.default_exam_profile`;
6. server track selection is now configurable by `TRACK_ID` rather than a function-level current-track default.

Review method:
- **self-review (no subagent/reviewer dispatch capability was available in this environment)**;
- no independent approval is claimed;
- no Critical/Important findings remain open after the fix pass.

Task 12 rulings:
- The planned rollback tag `pre-programme-a-2026-09-23` is not verifiable on the GitHub remote with the available connector, and direct GitHub access from the execution container is unavailable. The immutable baseline SHA `362d35c697411d4eddcc4536c843df17161d3374` was therefore used for the whole-branch compare. Cost if wrong: rollback discovery is less convenient until the tag is explicitly created/confirmed; the immutable commit itself is confirmed.
- Current SDAIA-specific branding and Arabic domain-label presentation remain in the current single-track UI. Full extraction of track presentation/localization into track packages belongs to Programme B's track/content engine. Cost if wrong: adding a second track before Programme B would still require UI presentation work, although Programme A runtime/exam/state/release contracts are now track/config driven.

Final review record:
`docs/superpowers/reviews/2026-09-23-programme-a-final-review.md`

## Compatibility invariant

Learner-visible compatibility digest remains:

`5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`

No Task 8 question/content/scoring changes were made.

## Programme A acceptance status

Programme A is complete on the implementation branch and remains **Unreleased / unmerged**.

Before merge:
- review PR #7;
- optionally obtain an independent human/agent code review because the final in-session review was self-review only;
- explicitly create/confirm the planned rollback tag if tag-based recovery is desired.

After merge, do not begin Programme B–H implicitly. Each requires its own bounded design/spec review under the architecture constitution.

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
5. Verify the Task 11 checkpoint `c7a52c7...` is an ancestor of current HEAD.
6. Run a brief baseline verification.
7. Start **Task 12 only** using the accepted constitution, plan, and current implementation truth.
8. Use `systematic-debugging` on any failure.
9. Use `verification-before-completion` before declaring Programme A accepted.
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
