# K3 Integration Candidate and Residual Audit - 2026-10-03

## Decision

**INTEGRATION HOLD.** The user authorized merging, but the exact repaired merge candidate has nine Important open groups and one Minor group. No remote merge, deployment, product publication retry, or Task26 execution was performed. No production implementation was changed in this audit.

A real local `git merge --no-ff --no-commit` was performed on an isolated branch from live main. It merged without Git conflicts. The resulting index tree is exactly the repaired source tree. The merge remains uncommitted: successful textual integration is not release approval.

## Pinned identities

| Object | Exact SHA |
|---|---|
| Live main / candidate first parent | `dbf718f65396388efa234e459155e0e4d3fc8b6d` |
| Live implementation branch | `680035b83c489013cbd09ca554229ecae8404518` |
| Preserved repaired source / candidate second parent | `465aafd2b0ba81d628fabd970fd62b3288ce204c` |
| Candidate index/source tree | `32a5c6334e5f6d26f03504c6ec086631e7521b5f` |
| Approved specification blob | `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d` |
| Approved canonical plan blob | `ac158561be17aa8424a71b53d5447ae4a2d375c7` |

The supplied repaired ZIP SHA-256 was `116c2ce2f31f459203205ff51b05b8c587d8c971cbad50682b2313a1cd11941f`; all 145 manifest members verified. Dependency recovery ZIP SHA-256 was `c8c496a73274b64e6e4a8287989e574abd2ad2955b005c0c74f86ac4a04b0255`; all 35 manifest members verified. Git bundle graph/fsck and source ancestry verified. Source restoration used actual preserved Git history, not synthetic commits reconstructed from chat.

The old PR28 contains process fixes only. Merging it would not publish Task25 or the repaired source. The prior product-tree publication safeguard was not retried, bypassed, or replaced by another upload method.

## Fresh verification

| Suite or check | Result |
|---|---|
| Restored repaired source Node | 682 passed; zero failed/skipped |
| Restored repaired source Python | 100 passed; one inherited deprecation warning |
| Actual staged integration candidate Node | 682 passed; zero failed/skipped |
| Actual staged integration candidate Python | 100 passed; one inherited deprecation warning |
| Process checks | 73 passed, included in Node; 37 deterministic task packets |
| Predefined unsafe execution scenarios | 15/15 blocked |
| Prior audit, compatible Node interface | 12/12 passed |
| Prior audit, original Python probes | 11/11 passed, including concurrency iterations |
| NEW residual probes, twice | 25 cases: 20 failed, 5 passed; zero skipped |
| NEW Node probes | 16 cases: 14 failed, 2 passed |
| NEW Python probes | 9 cases: 6 failed, 3 passed |
| Known-boundary controls | 3/3 passed |
| Public Pages artifact and JS/HTML parsing | PASS |
| Service-worker shell | PASS, 34 assets |
| Built release served over local HTTP | PASS |
| Real TCP API positive and denial controls | ordinary ACCEPTED, exact retry DUPLICATE, foreign principal 403, oversized cursor 400 |
| Real TCP negative observations | R08 ordinary correction ACCEPTED/persisted; R10 synthetic sensitive nested field ACCEPTED/persisted; pull lacks source identity |

The old audit's original Node A15 remains a retired-interface case: the preserved repair package contains original 11/12 and one-argument compatible 12/12 results. This audit reran the compatible corpus and does not claim the unmodified original Node corpus all passed. The NEW residual corpus is separate and is intentionally RED; it is not included in the 682/100 totals.

Node22.16.0/npm10.9.2 and Python3.13.5 were observed. Python was installed into a fresh venv from verified wheels. Online npm installation could not complete, and an explicit registry ping failed DNS resolution. Archived dependencies were restored, and all 252 applicable package versions matched package-lock.json. This is not a fresh online dependency audit. Native UI browser smoke failed at setup: chromedriver absent. IndexedDB tests use the production adapter with fake-indexeddb, not a native browser.

## Open findings and exact repair acceptance

### R01 - Store identity and cursor provenance (IMPORTANT)

**Observed:** Reopening the same IndexedDB database with a different storeId produced receipts under different store identities. HTTP pull returned only events and next_store_seq, without a source identity bound to the cursor.

**Files:** `src/evidence/indexedDbStore.js`, `server/app/main.py:get_learner_evidence`, `src/evidence/sync.js`.

**Authority:** unchanged K3 specification sections 15, 19, 30; associated canonical task contracts.

**Acceptance for the repair:** Persist and validate stable store identity. Bind resumable remote cursors to the authoritative store or a demonstrably equivalent source-generation contract. Test reopen mismatch and source replacement without comparing unrelated sequences.

**Limits:** Changing database configuration/source is required for the first scenario. The pull shape is observed; an equivalent explicit source-binding design is acceptable, not necessarily one hard-coded field.

### R02 - Outgoing same-origin revision order (IMPORTANT)

**Observed:** Native outbox iteration followed UUID key order. Two committed origin sequences 1,2 were pushed as 2,1. Composing the real revision resolver with that push produced STALE,APPLIED instead of APPLIED,APPLIED.

**Files:** `src/evidence/indexedDbOutbox.js:listPending`, `src/evidence/sync.js`.

**Authority:** unchanged K3 specification sections 16, 19; associated canonical task contracts.

**Acceptance for the repair:** Preserve per-origin ordering and strict revision chains through pending selection, batching and retries. Do not sort across devices by client time. Test UUIDs in reverse sequence order and partial/restarted batches.

**Limits:** The transport was a synthetic recording adapter, and IndexedDB used fake-indexeddb. This is not a live browser incident. Native outbox integration added by the atomic-capture repair exposed this composition gap.

### R03 - Failed send attempt accounting (MINOR)

**Observed:** A push that threw a simulated network error left attempt_count=0 and no last_attempt_at because markInFlight is called after push returns receipts.

**Files:** `src/evidence/sync.js`.

**Authority:** unchanged K3 specification sections 18, 39; associated canonical task contracts.

**Acceptance for the repair:** Record attempt metadata before invoking the network operation and preserve retryable IN_FLIGHT recovery without falsely acknowledging failures.

**Limits:** The event remains pending/retryable. No evidence loss was demonstrated. This is not a merge blocker on its own.

### R04 - Incomplete and unsafe acknowledgement receipts (IMPORTANT)

**Observed:** Receipts with ACCEPTED or DUPLICATE but no store_seq acknowledged an outbox event. A store_seq outside the safe integer range was also accepted.

**Files:** `src/evidence/storePort.js`, `src/evidence/indexedDbOutbox.js`, `data/schema/evidence-storage-receipt-v1.schema.json`.

**Authority:** unchanged K3 specification sections 14, 15; associated canonical task contracts.

**Acceptance for the repair:** Require valid representable sequence metadata whenever the receipt asserts that the event exists, and keep an event pending on malformed receipt. Preserve legitimate REJECTED/CONFLICT semantics.

**Limits:** The receiver is being given malformed synthetic receipts. The test demonstrates false acknowledgement, not actual remote event loss.

### R05 - Replay integration with durable adapters (IMPORTANT)

**Observed:** replayEvidence requires readRange, but the actual IndexedDB and JSONL adapters do not provide it. Calling replay after a real stored event raises store.readRange is required for replay.

**Files:** `src/evidence/replay.js`, `src/evidence/indexedDbStore.js`, `scripts/platform-kernel/adapters/jsonlEvidenceStore.js`.

**Authority:** unchanged K3 specification sections 27, 30; associated canonical task contracts.

**Acceptance for the repair:** Define and implement the store/replay boundary with raw events separated from receipt/sequence metadata. Exercise actual durable adapters, replay gaps, deletions and source-bound watermarks rather than a stand-in store.

**Limits:** Missing-method errors were caught and asserted as an integration outcome. This is a real interface gap in Task22 integration, not an unrelated missing module/import failure.

### R06 - Identity-link retargeting without explicit lineage (IMPORTANT)

**Observed:** Two LINK records with the same link_id and source but different targets were resolved to the later timestamp target, without a predecessor/UNLINK requirement or conflict signal. Different-link-ID conflict control passes.

**Files:** `src/platform-kernel/evidence/identityLinks.js`.

**Authority:** unchanged K3 specification sections 22; associated canonical task contracts.

**Acceptance for the repair:** Make legitimate relinking and conflicting history distinguishable by an approved transition/lineage contract; reject or surface ungoverned competing targets without choosing by timestamp alone.

**Limits:** Observed behavior is reproduced. Exact authorized relinking semantics require a documented contract decision; this finding does not assert that all legitimate relinking must be forbidden. Also compare approved Task23 conflict expectations.

### R07 - SQLite identity-link duplicate race (IMPORTANT)

**Observed:** Two real SQLite connections reading an absent record before insert produced one ACCEPTED and one UNIQUE-constraint IntegrityError for an exact retry; serial exact retry passes.

**Files:** `server/app/evidence_store.py:append_identity_link_record`.

**Authority:** unchanged K3 specification sections 22; associated canonical task contracts.

**Acceptance for the repair:** Serialize or reselect conflicting inserts so exact concurrent retries produce one ACCEPTED and remaining DUPLICATE, while a changed record body remains CONFLICT.

**Limits:** A barrier pauses after actual SELECT results to reproduce the race; no database outcome is mocked. This is the identity-link path, distinct from the repaired event acceptance race.

### R08 - Authority-sensitive producer authorization (IMPORTANT)

**Observed:** An ordinary StaticLearnerAuthorization principal submitted ADMINISTRATIVE correction and SYSTEM evaluation/resolution event definitions with unverified authority_ref strings. The API accepted and stored all three. Real TCP independently confirmed correction acceptance. A separate mixed-principal reducer probe also changed another principal without validated scope.

**Files:** `server/app/main.py:post_learner_evidence_batch`, `server/app/evidence_validation.py`, `src/evidence/corrections.js`.

**Authority:** unchanged K3 specification sections 21, 27, 38; associated canonical task contracts.

**Acceptance for the repair:** Derive producer privileges from trusted authorization context; ordinary learner clients must not grant themselves evaluation/correction authority by payload strings. Validate correction target scope/lineage with explicit administrative policy. Add ordinary-deny and genuinely authorized positive controls.

**Limits:** All data and principals are synthetic in a locally configured test server. Default-deny with no authorization and foreign-learner body rejection pass. No deployed breach or real credential misuse is claimed. The mixed-principal reducer probe needs explicit privileged-scope policy; the three ordinary-producer API failures independently establish the blocker.

### R09 - Strict proposed revision precondition (IMPORTANT)

**Observed:** With current/base revision 0, both missing proposed_attempt_revision and proposed_attempt_revision=7 were marked APPLIED and advanced to 1.

**Files:** `src/evidence/assessmentRevision.js`.

**Authority:** unchanged K3 specification sections 16; associated canonical task contracts.

**Acceptance for the repair:** Enforce proposed=base+1 and valid revision ranges for strict candidate mutation before APPLIED; preserve valid same-origin chains and stale-branch decisions.

**Limits:** This is the real deterministic resolver with synthetic candidates; no live assessment result was changed.

### R10 - Nested response privacy contract (IMPORTANT)

**Observed:** An OPTION response containing an undeclared access_token key was accepted by native capture and the HTTP API. Real loopback TCP confirmed the synthetic field remained in stored evidence.

**Files:** `src/evidence/acceptance.js`, `server/app/evidence_validation.py`, `data/evidence/payload-schemas/response-recorded-v1.schema.json`.

**Authority:** unchanged K3 specification sections 23, 27, 38; associated canonical task contracts.

**Acceptance for the repair:** Apply response-kind/item-specific nested property and privacy validation before persistence, without blanket deletion of legitimate required text. Test both stores and HTTP, and preserve explicit schema/privacy failures.

**Limits:** The value is explicitly SYNTHETIC-NOT-A-REAL-CREDENTIAL. No actual token was used. This reopens the broader privacy claim of F06, not the previously fixed unsupported-schema assertion.

## Interpretation of prior completion and regression attribution

The nine earlier F01-F09 repairs have their previous bounded evidence; this is not evidence that every one regressed. Broader producer authorization and nested privacy requirements remain unfulfilled, so the broad F06 closure language is reopened by R08/R10. The new native outbox composes incorrectly with same-origin strict revision processing (R02). Several other modules are unchanged from main: sync, receipt port, replay, identity resolver, correction resolver, and strict revision resolver. Do not attribute all residual findings to Task25.

Tests alone did not prove full specification acceptance. Earlier `zero open` statements were bounded to the previous corpus and are superseded by this explicit integration review. This is not proof that these ten groups are every possible remaining defect.

## State, limits and next repair order

The audit checkpoint increments LOCAL state to revision42, preserves historical completion through Task25 / next26, and records 9 open Important findings, 0 Critical, and low_model_ready=false. Its live execution branch field remains the canonical branch name; the audit branch is not a newly authorized product execution branch. State-schema validity is not preflight/merge permission. The uncommitted integration candidate keeps the original source state for exact-tree testing; audit state is stored separately on the audit branch and in the package.

Remote main remains the merged Task1-24 baseline, and remote implementation has only the process fixes. The project remains K3 Phase E. Task26 and Phases F-H (16 canonical tasks 26-41) remain pending. K4 design is not unlocked.

Repair order: (1) producer privilege and nested privacy boundaries R08/R10; (2) strict origin/revision ordering, receipt validation and source identity R02/R09/R04/R01; (3) actual replay adapters and identity-link lineage/concurrency R05/R06/R07; (4) failed-send accounting R03. Implement each against the unchanged specification using failing behavior tests, then full regressions and exact-candidate hosted/native browser verification. Do not silently introduce retention durations, batch thresholds, or a production identity provider.

Existing retained limits: historical dependency inventory has22 affected development packages (11high/10moderate/1low) and production-only npm0; not a new advisory check. Package-lock is unchanged. JSONL interrupted sidecar publication is fail-closed and needs operator recovery (K01 reproduced this); no crash-atomic or automatic recovery claim. Large-log performance is unmeasured, not assigned an invented threshold. Production authorization/deployment policies, backup erasure, real external deletion, native browser testing and independent reviewer approval remain outside this audit's proven scope. Payload/batch limits remain a configurable-security requirement needing a separately governed configuration/test; no arbitrary limit was invented or stress-tested here.

## Rulings and deferred minor

Ruling: stop before finalizing/publishing the merge despite textual success, because new Important assertions fail. Cost: integration remains deferred, preserving the source without knowingly releasing an unqualified candidate.

Ruling: use separate diagnostic RED files, not edits/filters to existing suites. Cost: the repair phase must promote those regressions into normal CI rather than assuming the existing green suite covers them.

Ruling: R06 records a reproduced ambiguity and requires explicit relinking lineage policy before closure; it does not ban legitimate authorized relinking. Cost: a narrowly specified transition decision may replace the suggested rejection expectation.

Deferred minor: R03 attempt accounting does not itself lose pending evidence, but retry diagnostics are inaccurate. It remains recorded for correction, not silently ignored.

Final review: self-review (no subagent tool), not independent approval. All data were synthetic and all HTTP tests were loopback-only. No real learner, mailbox, real token, external deletion endpoint or live user data was used.

## Evidence map

- `FINDINGS.json`:10 groups, authority slices, observations, limits and acceptance checks.
- `run-probes.sh`:portable runner; returns nonzero while any diagnostic test fails.
- `remaining.test.mjs`, `test_remaining_server.py`:frozen new diagnostic tests.
- `known-boundaries.test.mjs`:positive controls including interrupted JSONL behavior.
- `TCP-OBSERVATIONS.json`, `tcp_and_pages.py`:actual TCP observations and local served-release checks.
- `DEPENDENCY-INVENTORY.json`:historical dependency detail, explicitly not refreshed.
- Package logs:premerge, actual merge candidate, diagnostic first/repeat, HTTP, build, environment and recovery.
- Package `candidate.patch` and pinned merge identities:recreate the uncommitted candidate without a remote write.

Checkpoint correction: an initial audit-only updated_at value used +00:00 instead of the existing schema-required Z suffix, causing three state-dependent Node regressions. The logs were retained; the timestamp was normalized without changing validators, tests, or production logic, then the complete suite was rerun. This bookkeeping error is not an additional product finding.
