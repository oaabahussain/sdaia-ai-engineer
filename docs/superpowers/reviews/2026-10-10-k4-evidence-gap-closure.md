# K4 — Evidence Gap Closure Record (2026-10-10)

**Scope:** Evidence-only continuation on Product PR #65; no K3 mutations, no SYSTEM-grade fabrication, no product-scope waiver, no main merge, no K5 work.

## Pre-change authoritative state
- GitHub Product PR #65 head `0e1e2b876a4991d78b9d31bc5d57f840654488e1` and main remained separate, K4 CURRENT-STATE revision 14 / Task14 REVIEW. Previous Codex independent review had no major issues on `a5777bdde3348f9c49f37a2a9b29666d19dd0af5`. Any new test/documentation commits require exact-HEAD CI and repeat independent review.
- Current public runtime: 1,120 question IDs, 200-question full-exam profile, public payload SHA256 `5e48b1e47450f1150c9c8f21386f3a4e31070a3d444f968d10f45ccb9ff418a9`; 63 service worker assets. These are **public shipped** facts, not a private holdout census.

## AC-13: stronger quota-path coverage, not physical exhaustion
- Prior acceptance covered `fake-indexeddb` denial at `open()` and actual Chromium injection of `QuotaExceededError` during opening the K4 preferences database, with no false UI persistence.
- New regression in `tests/k4-preferences.test.js` now exercises a different failure location: an injected `QuotaExceededError` on the **actual IndexedDB objectStore.put()** call after a successful database open, and requires that the transaction reject, no `persisted:true` receipt be returned, and subsequent persisted revision remain 0.
- First [Quality 38032562815](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38032562815) **expected RED**: 937/938 Node tests passed; the test wrongly assumed the surfaced error would retain `QuotaExceededError`; the IndexedDB stack surfaces `AbortError` on the aborted transaction. Test repaired to accept `QuotaExceededError` **or** `AbortError` while demanding transaction rejection and post-failure no-persist invariants. No runtime implementation change required.
- Updated exact-code SHA `0e1e2b876a4991d78b9d31bc5d57f840654488e1`: [Quality 38032613016](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38032613016) **SUCCESS**: 938/938 Node, 76/76 Python, real Chromium bilingual/mobile/offline, strict 200-question exam, Pages preview, 63 SW assets, 1,120 public bank; [Server 38032613053](https://github.com/oaabahussain/sdaia-ai-engineer/actions/runs/38032613053) **SUCCESS**.
- **Honest boundary:** This is deterministic **quota-error injection at the write point**, NOT independently measured actual disk/browser quota exhaustion. Physical capacity exhaustion remains **UNVERIFIED**; do not change AC-13 to unconditional PASS.

## AC-09: public release separation evidence and missing external inventory
- `src/recommendations/publicCatalog.js` requires `visibility='PUBLIC'`, `lifecycle='ACTIVE'`, exact shipped version/family/objective/domain, 1,120 IDs and the pinned public release digest; `tests/k4-public-catalog.test.js` proves synthetic public v1 + HOLDOUT v2 and no holdout fallback.
- `scripts/build_pages_artifact.js` copies only a prescribed public source/runtime set, deliberately deletes `src/platform-kernel`, and rejects `data/legacy`/`data/factory` in the assembled public bundle. `scripts/verify_sw_assets.js` validates the public K4 catalog, bans concept chunk precache and confirms 63 public shell assets. `scripts/verify_live_release.js` checks public catalog/policy identity on served preview and deployed site.
- These automated controls passed on the recorded Quality run. They do **not** demonstrate a provenance-backed inventory and digest of an actual protected/private question corpus; repository-public allowlist cannot attest to private assets absent from the accessible source. AC-09 remains **SYNTHETIC/PUBLIC_ARTIFACT_VERIFIED; PRIVATE_HOLDOUT_INVENTORY_BLOCKED**. To close fully, provide authorized access to canonical private inventory, verify its version/family IDs against public/shipped artifact file list and hashed contents, and publish **only redacted aggregate proofs** into PR, never protected content.

## AC-02: trusted grading remains a genuine authority boundary
- K4 runtime remains `EXPOSURE_ONLY`; `tests/k4-clock.test.js` checks **mathematical** due dates for a mock `TRUSTED_GRADED` input, not an independently authenticated `SYSTEM` event produced by a recognized grader.
- Need an approved, independent grading producer with issuer identity, source attestation, exact event/provenance schema, integrity validation, trusted correct/incorrect fixture, and a negative forged-producer fixture; producer output must be verified through the existing K3 evidence boundary, not minted by K4/browser, and K3 closure must not be silently changed. **AC-02 BLOCKED** until real independent authority can be demonstrated.

## Other acceptance and release evidence
- AC-11: existing unit tests cover UTC-offset equivalence, invalid timestamps and future-skew quarantine. This is not proof of all real device timezone-change behaviors.
- AC-17: any edits after the previous independently reviewed SHA invalidate exact-head approval; need final review on the new documentation SHA plus full CI.
- AC-18: owner must separately authorize precise full final PR HEAD as required by the high-reasoning merge gate. Only afterward can actual merged `main` CI, live Pages asset checksums, live service worker/asset HTTP availability and K4 state COMPLETE be verified. No permission should be inferred from general execution requests.
- Release decision: **NOT FULLY CLOSED**. Never claim 100% or start K5 while AC-02/09/13 provenance and AC-18 main/live release are unproven.

## Reusable verification lessons
Reproduce at the true failure point, preserve distinct expected RED and GREEN workflow IDs, assert persisted postconditions rather than brittle browser/database exception labels, keep provenance class of evidence explicit, and independently review exact final SHA. Document missing evidence as a blocker rather than quietly lowering acceptance requirements.
