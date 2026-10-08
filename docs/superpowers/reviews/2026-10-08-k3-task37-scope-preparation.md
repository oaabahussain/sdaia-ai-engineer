# K3 Task 37 scope and execution-ref preparation

Date: 2026-10-08. Status: PROCESS PREPARATION, not Task 37 acceptance.

Verified clean start main: `5b7453407def933037c4c254cd0fca5e5f3f1591`. Approved spec and plan blob hashes remain `2ccb4c5c1d01b668c14dce6b97608d4eff04d57d` and `ac158561be17aa8424a71b53d5447ae4a2d375c7`.

Ruling: Task 37 documentation-contract test exists on main, so amend only its exact scope classification from allowed_create to allowed_modify through deterministic compiler code. A new regression test must fail against the old classification and pass after the compiler fix. Regenerate derived packet 037 and check all 37 packets deterministically, preserving the approved plan and spec.

No Task 37 behavior/product edit, Task 38/39 execution, reviewed merge, or K3 closure is authorized by this preparation alone. Official task-start + valid brief digest + runtime envelope + preflight PASS remain mandatory.
