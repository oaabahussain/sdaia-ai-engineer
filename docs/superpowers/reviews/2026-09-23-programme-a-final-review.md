# Programme A Final Verification

**Date:** 2026-09-26  
**Repository:** `oaabahussain/sdaia-ai-engineer`  
**Implementation branch:** `impl/programme-a-contract-stabilisation`  
**Draft PR:** #7  
**Verified implementation HEAD:** `471491d9d851a9406ad92c2dc3072a876ce68b04`  
**Baseline:** `362d35c697411d4eddcc4536c843df17161d3374`

## Acceptance result

**Programme A — Repository and contract stabilisation: ACCEPTED on the implementation branch.**

This is not a claim that PR #7 is merged or deployed. The PR remains Draft and unmerged.

## Scope checked

The verification covered the accepted architecture constitution and all Programme A tasks:

1. baseline/regression fixtures;
2. TrackManifestV1 + ExamProfileV1;
3. stable IDs/migration map;
4. StateV2 + neutral anonymous identity;
5. RuntimeBundleV2 browser/API contract;
6. profile-driven exam behaviour;
7. service-worker/offline safety;
8. public feedback submission;
9. legacy quarantine/dead-path cleanup;
10. manifest-driven CI/Pages;
11. documentation/governance baseline;
12. whole-branch acceptance.

## Fresh verification on the reviewed implementation HEAD

Workflow-equivalent commands represented by the successful current-head CI gates:

```bash
npm ci --ignore-scripts
npm run validate
npm test
node --check src/app.js
npm run verify:sw
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
node scripts/contract_test.js browser
SDAIA_API_BASE=http://127.0.0.1:8000/v1 node scripts/contract_test.js api
```

CI also assembled the public Pages artifact, asserted `_site/data/legacy` does not exist, served the artifact over local HTTP, and ran `scripts/verify_live_release.js` against it.

Results:

| Gate | Result |
|---|---|
| Canonical validator | PASS |
| Node tests | **57/57 PASS** |
| Application parse | PASS |
| Service-worker assets | **PASS (22 shell-only assets)** |
| Pages artifact assembly | PASS |
| Local HTTP live manifest/profile/content verifier | PASS |
| Browser smoke | PASS |
| Python server tests | **16/16 PASS** |
| SQLite schema/query smoke | PASS |
| Browser adapter contract | PASS |
| API adapter contract | PASS |
| Active legacy reference contract | PASS |
| Learner-visible educational payload | PASS |

Observed current compatibility values during verification:

- generated questions: **1,120**
- profile full-exam count: **200**
- manifest concept chunks/domains: **7**
- weights total: **100.0%**

These observed current values are sourced from the versioned track/profile/fixtures rather than release algorithms.

Compatibility digest:

`5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`

## Old-contract scan

Post-fix scan confirmed:

- no active runtime consumer of `data/questions.json`, `data/sessions.json`, or `data/weights.json`;
- no active `sdaia-ai-pages-v8` cache contract;
- `sdaia.state.v1` remains only as explicit migration/read fallback;
- `sdaia.anon_id.v1` remains only as anonymous-ID migration input;
- feedback no longer writes to the legacy state key;
- validator/test mentions of retired paths are negative guards, not consumers.

## Hard-coded profile/track review

The acceptance fix pass removed:

- current-track constants from app state lookup;
- implicit current-track defaults from RuntimeBundleV2 loading and question-bank expansion;
- hard-coded `1000` runtime bank threshold;
- hard-coded 1,120 adapter expectations;
- hard-coded 200 compatibility assertions outside the versioned profile fixture;
- browser-smoke dependency on `project-reference-v1.json`.

Current track bootstrap selection remains explicit configuration. Track-specific presentation/branding is discussed under deferred scope below.

## Schema and manifest integrity

`npm run validate` and the full Node suite cover:

- TrackManifestV1;
- ExamProfileV1;
- RuntimeBundleV2;
- stable question/family identity;
- StateV2 migration/idempotence;
- no active legacy-bank references;
- release/Pages contracts.

All passed on the reviewed implementation HEAD.

## Baseline diff review

Comparison:

`471491d9d851a9406ad92c2dc3072a876ce68b04` vs baseline `362d35c697411d4eddcc4536c843df17161d3374`

Result:

- **49 commits ahead**
- **0 behind**

Disposition review found no unexplained content loss:

- former 121-question `data/questions.json` moved byte-for-byte to `data/legacy/static-bank-v1/questions.json`;
- former sessions moved byte-for-byte to the same legacy package;
- competing weights/schema/release paths were removed only after canonical contracts were active;
- disconnected mastery/readiness/review/mission code was removed after reference scans and legacy behaviour/history preservation;
- learner-visible generated educational payload remains digest-compatible.

The planned rollback tag `pre-programme-a-2026-09-23` could not be verified on the remote. The baseline commit SHA above is the confirmed immutable recovery reference.

## Code review

**Final review method: self-review (no subagent tool available).**

An independent reviewer could not be dispatched in this environment. No independent approval is claimed.

Important findings found during self-review and fixed with RED→GREEN coverage:

1. legacy-state write on feedback page;
2. implicit current-track defaults in browser core/question-bank core;
3. fixed `1000` bank-capacity guard;
4. repeated current totals in adapter/compatibility tests;
5. pinned profile filename in browser smoke;
6. function-level server default track rather than configuration.

After the fix pass the full suite was rerun and passed.

## Rulings

### Baseline tag unavailable

The plan requested diffing against `pre-programme-a-2026-09-23`. The tag was not verifiable through the available GitHub connection and direct GitHub network access from the execution container failed. The confirmed immutable baseline SHA was used instead.

**Cost if wrong:** tag-based rollback discovery remains unavailable until the tag is explicitly created/confirmed; the baseline commit remains directly addressable.

### Track-specific presentation deferred

The current UI still contains SDAIA-specific branding and Arabic domain-label presentation. Programme A has made runtime/exam/state/release contracts data/config-driven, but the full track presentation/localization package belongs to **Programme B — Track/content engine**, which the constitution explicitly keeps outside Programme A.

**Cost if wrong:** introducing another track before Programme B would require presentation-layer work and could expose remaining UI coupling.

## Remaining known gaps

These are **not implemented by Programme A**:

- 14,000+ content generation/production;
- full competency/objective/misconception/question-family content engine;
- production mastery/readiness learner engine;
- protected assessment delivery;
- production authentication/authorization;
- production-grade durable backend/rate limiting/observability;
- full multi-track registry/authoring/presentation extraction.

The current SDAIA exam weights/rules remain:

`project-reference-unverified`

No new primary evidence was obtained during Programme A, so they must not be represented as official SDAIA weights.

## Governance / release status

- PR #7 remains **Open + Draft + unmerged**.
- Programme A is **Unreleased**.
- CI is required before merge per repository documentation.
- Branch protection/CODEOWNERS were not changed automatically.
- The owner may request an additional independent review before marking the PR ready.

## Final conclusion

The Programme A acceptance criteria are satisfied on the reviewed implementation head, with the explicit limitations/rulings above. Large-scale content production and Programmes B–H remain locked behind their own bounded design/spec reviews.
