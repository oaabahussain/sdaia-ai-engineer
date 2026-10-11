# K4 Post-Merge Verification — Actual Release Evidence

**STATUS: VERIFIED_POST_MERGE / DOCUMENTATION_CLOSURE_PENDING_REVIEW**
**Product PR:** https://github.com/oaabahussain/sdaia-ai-engineer/pull/65
**Approved source head (full):** `bcddca06604c5e107deb98f924d829337044405c`
**Actual merge commit on main:** `6067cac99af669bce16147edc028c71702cf4112`
**Product:** first public `EXPOSURE_ONLY` K4 release; no trusted SYSTEM grading, official readiness, protected holdout exam, or K5.
**Public URL:** https://oaabahussain.github.io/sdaia-ai-engineer/

## Provenance and authority

- Original approved K4 specification SHA (git blob) `d732ac22161d4b007a8f869cbc928ec6737a40a8` and plan SHA `edda6ef11fb353d7403098d79400fc783e2f21f1` remain unchanged.
- Owner expressly approved the *written* `docs/superpowers/specs/2026-10-11-k4-public-exposure-only-release-scope-amendment.md` and authorized PR #65 only at `bcddca06604c5e107deb98f924d829337044405c` on 2026-10-11.
- Codex independent [exact-head assessment](https://github.com/oaabahussain/sdaia-ai-engineer/pull/65#issuecomment-6102769912) reviewed `bcddca0660` with no major findings; 20 prior PR review threads were resolved, 0 unresolved.
- Pre-merge exact-head [Quality run 38089675706](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38089675706) and [Server run 38089675725](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38089675725) both completed SUCCESS.
- GitHub subsequently reports product PR #65 `merged: true`, main SHA exactly `6067cac99af669bce16147edc028c71702cf4112`. [Original audit comment](https://github.com/oaabahussain/sdaia-ai-engineer/pull/65#issuecomment-6105374579).

## Real merged-main CI — exact merge SHA

1. [Validate and deploy GitHub Pages #38111076155](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38111076155) — `push` event on `main`, completed SUCCESS, job `validate-tests-deploy` successful. Logs report **953 / 953 Node tests**, **117 / 117 Python tests**, bilingual browser smoke with the real public 1120-item bank, full 200-item exam, offline cached reload, and public Pages artifact validation.
2. [Server and adapter contract tests #38111076172](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38111076172) — same exact merge SHA, completed SUCCESS; `server-adapter-gate` passed, server **117 / 117** and Node **3 / 3**.
3. The Pages deploy action reported deployment **SUCCESS** for the actual merge commit `6067cac99af669bce16147edc028c71702cf4112`. Runner tested the actual remote URL, verified `index.html` SHA256 `7c80cf1ab96eff0e6e6a41b12d2f53592e304193a499dc211857ed2548ec4017` matching `_site/index.html`, `src/app.js` HTTP 200, `feedback.html` HTTP 200 and expected `feedbackGrid` marker.
4. The live `scripts/verify_live_release.js` reported PASS for learner evidence context, content model (7 domains), track registry and service worker contract. This is real remote HTTP evidence from the successful deployment runner, not an extrapolation from branch-only CI.

## Scope dispositions and safeguards

- **AC-02:** trusted authenticated SYSTEM grading integration **NOT IMPLEMENTED / DEFERRED BY APPROVED INITIAL EXPOSURE-ONLY SCOPE**. Do not mark original AC-02 PASS or call local browser responses trusted correctness. No score/mastery/readiness claims.
- **AC-09:** public 1120-ID equality, Pages exclusion tests and synthetic protected-sibling negatives verified. **Real off-repo protected holdout inventory NOT PRESENT / NOT APPLICABLE TO THIS PUBLIC RELEASE** by approved scope. Synthetic negatives are not proof of an actual private corpus.
- **AC-17:** exact-head independent review and both pre-merge checks verified; **AC-18:** owner SHA-specific authorization and actual integration verified. Original K3 COMPLETE state must remain unchanged.
- **Release caveat:** cross-version concurrent writes from an old browser build to deprecated preference storage are not established as serializable; current K4 writes use canonical single transaction domain.
- **Warning, not test failure:** actions using deprecated Node.js 20 are being forced onto Node.js 24 by GitHub runners.

## Closure control

This record and the K4 state update are submitted as **documentation-only** PR for independent CI/review; they do not modify the already deployed K4 runtime. A green product deployment cannot replace verification of the exact closure-record commit. Keep K5 blocked until this closing PR is reviewed and integrated and the updated main state has been re-read.
