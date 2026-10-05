# K3 Nine-Finding Remediation Ledger

Scope: explicitly authorized local repairs F01-F09 on 2026-10-03; no Task 26 work, no merge, no publication attempt.

Ruling: repair on preserved Task25 descendant in an isolated linked worktree; retain main/remote/local identities separately. Existing Task25 publication safety hold is not bypassed. Cost: hosted validation remains pending.

Ruling: use a scoped high-reasoning remediation plan, not a canonical Task26 packet. Canonical readiness remains blocked while findings are open; do not zero finding counters to run a product task. Cost: one additional repair checkpoint must travel with canonical state.

Pre-flight interfaces: F02 origin state -> F01 atomic local capture; F04 verified JSONL load -> F03 exclusive writer/read scope; F05 SQLite insert -> F06 validation -> F08 additive query metadata. All consume the existing event/receipt contracts.

Baseline: exact c290df22dd6f62f658cfd6154a0ece642044c478, 619 Node, 59 Python; source graph and archive checksums valid.

Setup correction: state schema rejected the UTC +00:00 suffix; normalized to required Z before any production edit. Initial doc commit retained; validator rerun required.

Ruling: isolate the positive preflight test fixture from live finding counters and add explicit negative counter cases. The full suite found NO_OPEN_IMPORTANT after correctly recording the audit. No production guard changes. Cost: test fixture has explicit clean-state fields rather than inheriting live state. Added test-file scope: tests/h0-r2-preflight-cli.test.js.

Remediation Task 1 (F02): complete; fix 555102e62e0b038fe7212812e555bd3962df5269; full Node/Python regression PASS; evidence in F02-*.log. Review: bounded self-review, no independent reviewer.

Test support: tests/helpers/k3-repair-fixtures.js centralizes the unchanged audit event and temporary JSONL fixture for F03/F04/F06; production scope is unchanged.

Remediation Task 2 (F04): complete; fix 515c2f23dcd106129e531429b73844410b6f24f0; full Node/Python regression PASS; evidence in F04-*.log. Review: bounded self-review, no independent reviewer.

Remediation Task 3 (F03): complete; fix 18fe10601fd1c6f96ca830dec7957de441380788; full Node/Python regression PASS; evidence in F03-*.log. Review: bounded self-review, no independent reviewer.

Remediation Task 4 (F05): complete; fix 38d7f4180c198178f26f52b9390cb82002527a13; full Node/Python regression PASS; evidence in F05-*.log. Review: bounded self-review, no independent reviewer.

Ruling: strict direct-store validation exposed malformed historical test inputs, not valid production events. Add missing authority_ref to evaluated-event fixtures and a complete V2 envelope to the privacy fixture. Preserve all existing expected-behavior assertions; archive original fixture files. Extra test-only scope: tests/k3-indexeddb-evidence-store.test.js, tests/fixtures/k3/store-conformance.json, server/tests/test_k3_evidence_store.py, server/tests/test_k3_privacy.py. Cost: old fixture bytes change, so their original invalid form remains in the evidence archive for comparison.

Remediation Task 5 (F06): complete; fix 24c07fd40d8d9bb46d03ee393c0e828e3a7f403f; full Node/Python regression PASS; evidence in F06-*.log. Review: bounded self-review, no independent reviewer.

Remediation Task 6 (F07): complete; fix b017c79fde3d413c001c06388dc4257013ab16a1; full Node/Python regression PASS; evidence in F07-*.log. Review: bounded self-review, no independent reviewer.

Remediation Task 7 (F08): complete; fix e9362c4be6d062e53fc305df0a80f5d8cc7c948b; full Node/Python regression PASS; evidence in F08-*.log. Review: bounded self-review, no independent reviewer.

Remediation Task 8 (F09): complete; fix 203070785a4fd5ee65ec94bdba2054d3b5ae7232; full Node/Python regression PASS; evidence in F09-*.log. Review: bounded self-review, no independent reviewer.

Ruling: F01 adds a native IndexedDB capture and store-bound outbox instead of accepting separately committed enqueue callbacks. Such callbacks cannot join an IndexedDB transaction. Replaced only three fake-store tests with real-adapter durability/failure tests; archived the originals. Added test support path tests/helpers/k3AtomicCapture.js. The original audit A15 success callback must migrate to store.outbox; A14's no-orphan requirement stays intact and native failure/restart tests are stricter. Cost: internal callers must opt into the native atomic interface; no generic callback compatibility is claimed.

Remediation Task 9 (F01): complete; fix a6fcdd1a9049d7f5e116c2c705560ceedf437c3a; full Node/Python regression PASS; evidence in F01-*.log. Review: bounded self-review, no independent reviewer.

Final review: self-review (no subagent tool). Three Important findings enter one RED/GREEN fix pass: independent databases reused a legacy origin seed; newly strict batch validation lost per-event outcomes; the HTTP path retained an unprotected cold-store initializer. Scope stays F01/F05/F06 and their API callers. Add tests/k3-repair-final-review.test.js and server/tests/test_k3_repair_final_review.py. No other canonical task begins.

Ruling: preserve per-event REJECTED receipts for identifiable canonical JSON events, but reject an unrepresentable identity/numeric batch before any sibling write. A UUID/fingerprint cannot be honestly invented for malformed input. Independent fresh databases receive distinct durable origins; adopt a legacy origin only when preserved events anchor it. Cost: malformed whole batches receive a 400/input exception rather than partial fabricated receipts, and independent databases no longer share a localStorage origin seed.

Final: fixed independent-database origin collision, lost batch dispositions/unrepresentable receipt fabrication, and cold HTTP store-id race. Final-review regressions: 5 Node assertions and 4 Python assertions RED then GREEN. Whole suite 682 Node / 100 Python; one inherited deprecation warning.

Original audit rerun: Node 11/12 and Python 11/11 (including all 3 natural-concurrency iterations). The single historical A15 failure is the explicitly retired separate enqueue callback. A source-preserved compatibility copy changes only that successful callback argument to store.outbox; all assertions are unchanged, and all 12 Node probes then pass. Native transactional failure injection adds coverage beyond that historical callback. Original failure output and exact one-line diff are retained; no filtered suite is presented as full.

Final: minor (deferred): legacy compressed formatting and redundant validation/hash work in prepared batches remain performance/readability debt; no behavior is weakened to optimize them.
