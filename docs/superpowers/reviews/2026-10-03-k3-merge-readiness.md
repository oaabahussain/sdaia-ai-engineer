# K3 Merge Readiness Checkpoint

## Decision

NOT_READY_FOR_REMOTE_MERGE. The verified local repair series is preserved. The original local merge remains f5bbf1977ef4b54cfada610a1c4c9a516f94a929. No remote code publication or new merge was attempted in this checkpoint. This report supersedes a broad interpretation of the earlier zero-open-findings state, not the earlier bounded F/R repair results.

## Fresh evidence

The supplied archive and every member checksum were verified. A new clone, full Git fsck and an isolated linked worktree were used. Node752 and Python115 passed again; Python reports one existing deprecation warning. The original residual25 cases and3 boundary controls pass. The process73 tests are a subset of Node. The15 predefined unsafe execution cases fail closed. SQLite/storage, real TCP API, Pages/HTTP and service-worker checks passed. The new wrapper regression is separately counted; it does not increase Node/Python suite counts.

## Completed process correction

The portable diagnostic runner previously finished with exit0 after recording native-browser BLOCKED. A new real-process test reproduced that ambiguity without mocked results; it failed on expected2 versus actual0. A terminal non-PASS guard now preserves the complete logs but exits2. The unchanged wrapper test passes. A passing wrapper means correct failure reporting, not merge readiness. The full runner still does not perform an advisory audit, remote CI attestation or independent review, and does not claim to.

## Newly open group S01: current Python framework dependency

Installed FastAPI0.116.1 requires Starlette>=0.40.0,<0.48.0 and the restored environment has Starlette0.47.3. Six primary maintainer advisories have affected-version ranges containing0.47.3; see dependency-advisories.json for exact ranges and dates. Three categories were exercised by six tiny synthetic checks: five assertions fail on the old framework; the normal control passes. This is not a report of six application exploits.

The official Starlette1.5.0 distribution was acquired from the maintainer's already-published GitHub Actions artifact, matched to its release commit and archive SHA256, then tested in a separate environment. The identical six checks pass there. No project code was sent to that upstream workflow, and no remote workflow was created or rerun. The application environment was not changed: forcing this wheel beside the old FastAPI would violate its declared dependency range.

FastAPI0.141.1's official metadata declares a compatible Starlette range, but its complete wheel and new dependencies were not acquired or installed. The official PyPI download failed and the official Publish workflow retains no downloadable distributions. The candidate version is not claimed to be application-qualified. S01 remains OPEN until the complete stack resolves, pip check passes, the six probes pass, and the original application suites and real HTTP checks pass together. Do not fabricate wheel metadata, relabel a package version, or blindly loosen constraints.

## Counter-evidence and limitations

The inspected application has no StaticFiles mount, HTTPEndpoint subclass or request.form call. Five bounded application controls passed, including default-deny evidence authorization with normal and malformed synthetic host values. These reduce the demonstrated attack surface; they do not turn component version findings into absence of risk. No real credentials, live learner data, destructive operations or load attack was used. Framework-only tests are not a whole-program exploit proof.

System Chromium144 starts, but navigation to the same local server that returnsHTTP200 to a plain HTTP client is denied with ERR_BLOCKED_BY_ADMINISTRATOR. No policy, alternate host or other browser was used to route around that denial. The original Selenium smoke also lacks chromedriver. Therefore native browser qualification remains BLOCKED, not an application pass.

A fresh npm audit request was attempted with bounded network settings and failed with EAI_AGAIN. The previous Node22 advisory remediation remains historical; no new clean scanner result is claimed. Full Python advisory enumeration is incomplete; the six maintainer records are targeted coverage, not an exhaustive scan.

## Scope and next boundary

Local CURRENT-STATE revision44 remains K3 Phase E, completed25/next26, low_model_ready=false, with one important dependency group open. Remote main and implementation refs were separately observed and remain older than this local work. The current PR28 must not be mistaken for the repaired source. No Task26 or new product architecture was introduced.

Highest-value next action: complete the coordinated Python dependency acquisition/test on the exact candidate, then obtain permitted repaired-source publication, native/hosted checks and a genuine independent review. The prior publication hold is not authorization for an alternate-tool workaround.

## Review and rulings

Final review: self-review (no subagent tool). The runner change is limited to exit reporting and keeps existing checks/timeouts. All test sources and before/after evidence are preserved. Review focus includes blocked status, current versus patched dependency identity, historical CI mismatch and unused vulnerable surfaces. No independent approval or production security certification is claimed.

Ruling1: Keep verification separate from canonical Task26; cost is an additional checkpoint, not premature execution.
Ruling2: Respect the observed publication and native-browser restrictions; cost is blocked external qualification.
Ruling3: Do not force an unsupported FastAPI/Starlette pair; cost is an explicitly open S01 until a real coordinated upgrade can be tested.

Known reference-adapter limits remain: JSONL interrupted publication/stale locks require operator recovery when original receipt metadata is unavailable; no automatic reconstruction or fabricated receipts. Full production identity, retention and external erasure policy remain the specification's deployment inputs, not silently invented defaults.

## Evidence locations

Repository: audits/k3/2026-10-03-merge-readiness/ contains probe sources, advisory ranges, route controls, upstream provenance, source registry, evidence ledger, structural research state and MERGE-GATES.json. The attached recovery package includes original and fresh complete logs, the unchanged application dependencies, the upstream wheel under staged-upgrade-only (not active), the complete Git bundle and exact delivery SHA/tree recorded separately in DELIVERY.json.
