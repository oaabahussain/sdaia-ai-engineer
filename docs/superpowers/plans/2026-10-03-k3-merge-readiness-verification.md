# K3 Merge Readiness Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. This is a bounded verification/process repair, not canonical Task 26.

**Goal:** Complete the permitted exact-source checks and prevent a blocked check from producing a successful verification exit; preserve remaining barriers without falsely qualifying a merge.

**Architecture:** Reuse the current portable verification runner and repaired K3 source. Keep dependency experiments isolated from the application environment. Retain the previous local merge and remote refs unchanged.

**Tech Stack:** Node 22, Python 3.13, Git, existing K3 verification scripts.

**Spec:** docs/superpowers/specs/2026-09-29-k3-learner-evidence-engine-design.md (sections 47-48), RECOVERY-PROTOCOL.md, and the user's request for merge readiness.

## Global Constraints

- exact-head tests pass;
- merge is reviewed;
- No product Task 26, policy bypass, remote publication workaround, fabricated hosted pass, or false independent review.
- Preserve the approved K3 specification and canonical 41-task plan byte-for-byte.
- Existing F01-F09/R01-R10 repairs are retained; new dependency risk is separately recorded.
- A library-only experiment cannot qualify a coordinated FastAPI/Starlette application upgrade.

## Review Focus

- The portable runner reports BLOCKED but formerly exited 0: Task 1 proves its exit matches the completed result manifest.
- An absent browser driver and a browser policy denial are different observations: Task 2 keeps both logs.
- A patched Starlette package is incompatible with the currently declared FastAPI version range: Task 2 must not overwrite the application environment.
- Prior CI on the old remote head cannot certify the local merge: Task 3 retains separate source identities.
- An affected dependency version does not prove exploitation of an unused route: Task 2 records application reachability controls.

## Task 1: Fail closed at the portable verification command boundary

**Files:** Modify audits/k3/2026-10-03-residual-remediation/run-verification.py. Create audits/k3/2026-10-03-merge-readiness/test_verification_exit.py.

**Interfaces:** Consume the runner's existing commands.json results; preserve all diagnostic logs; emit exit 2 after completion if any recorded check is not PASS. This is a completeness signal, not a merge authorization or advisory scanner.

- [x] Run the unchanged full runner through the new real-process test. Expected RED: a recorded BLOCKED native-browser check but process exit 0 instead of 2.
- [x] Add the minimal terminal non-PASS guard after all existing checks. Do not change test timeouts, test filtering, failure classification, or browser policy.
- [x] Repeat the exact test and full suites. Expected GREEN: the regression test passes, while the verification command truthfully exits 2 for the environment block.
- [x] Commit the process fix and record test evidence.

## Task 2: Qualify the Python dependency finding and isolated upstream fix

**Files:** Create audit documentation/probes under audits/k3/2026-10-03-merge-readiness/; no dependency or application source edit until a compatible complete distribution is acquired and tested.

**Interfaces:** Input actual installed distribution metadata, published advisory ranges, retrieved official wheel/hash, unchanged six-case synthetic framework probe; output evidence matrix with current runtime versus isolated upstream runtime.

- [x] Run six bounded URL/method tests on the current Starlette and record failures.
- [x] Verify the official Starlette 1.5.0 artifact digest and run the identical file in a separate environment.
- [x] Inspect actual application routes and authorization dependencies; distinguish direct framework failure from unproven application exploitability.
- [x] Attempt the supported package acquisition routes; record the compatible FastAPI artifact gap without inventing a wheel or changing installed metadata.
- [x] Record the coordinated dependency upgrade as OPEN until complete application regression and dependency resolution pass.

## Task 3: Save exact-source verification and remaining merge gates

**Files:** Create readiness checkpoint/report; update CURRENT-STATE.json within its existing schema; retain existing progress through Task 25 and low_model_ready=false.

**Interfaces:** Existing live refs, repaired source, Task 1 test logs and Task 2 evidence -> merge readiness record plus portable recovery package.

- [x] Recheck live refs, rerun full regression and original residual probes, review the bounded changes, and retain explicit native/hosted/review/advisory limitations.
- [x] Save state/checkpoint with the newly open dependency group; do not misuse an old zero-findings state.
- [x] Make a recoverable Git bundle, verify a second clone and source tree, and rerun the same tests there.
- [x] Complete the verification package, not a GitHub merge approval. Exit decision is NOT_READY if any required gate remains blocked.
