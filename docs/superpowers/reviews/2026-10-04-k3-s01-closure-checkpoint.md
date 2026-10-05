# K3 S01 Dependency Security Closure Checkpoint

## Authority and scope

This checkpoint continues K3 Phase E from state revision 44. Canonical Tasks 1-25 remain complete; Task 26 is NOT STARTED. This correction closes the locally reproduced S01 dependency-security finding only. It does not authorize remote publication, merge, production deployment, or Task 26.

## Selected dependency set

- FastAPI 0.141.1
- Starlette 1.7.0
- Uvicorn 0.35.0 (unchanged)
- jsonschema 4.25.1 (unchanged)
- HTTPX2 2.13.1 (replaces HTTPX 0.28.1)
- pytest 9.0.3
- rfc8785 0.1.4 (unchanged)

Ruling: use the smallest current security-qualified stack instead of broad dependency modernization. FastAPI 0.142.2 was reviewed but introduces additional telemetry implementation surface unrelated to S01. Uvicorn/jsonschema are retained because the current exact-package advisory review did not place the installed versions inside affected ranges. Cost if wrong: a later dependency-modernization pass may still be needed, but this merge-readiness correction avoids unrelated behavior change.

## TDD and regression evidence

`server/tests/test_dependency_security_policy.py` failed on the pre-upgrade manifest and passed after the manifest update. The historical integration-residual script is preserved; a current S01 loopback verifier lives at `audits/k3/2026-10-03-merge-readiness/tcp_and_pages_s01.py`.

Fresh candidate results:

- `pip check`: PASS.
- Framework boundary probe: 6/6 PASS.
- Node full suite: 752/752 PASS, zero fail/skip.
- Python server suite: 116/116 PASS, zero fail/skip.
- Process suite: 73/73 PASS.
- Adversarial readiness: 15/15 fail closed.
- Canonical content: 1,120 questions / 7 domains / 140 objectives PASS.
- Residual probes: Node 16/16, Python 9/9, boundary controls 3/3 PASS.
- Real loopback TCP: normal accept and duplicate controls PASS; foreign learner and out-of-range cursor rejected; learner correction rejected/not persisted; nested sensitive field rejected/not persisted; store identity present.
- Pages build and live-release verifier over local HTTP: PASS.

The initial full Node run in the fresh worktree failed because `node_modules` was absent in that worktree. The failure was `ERR_MODULE_NOT_FOUND` for Ajv, not a product regression. Restoring the verified dependency archive from the recovery package made the unchanged suite pass 752/752. This setup failure remains disclosed.

## Advisory review

`audits/k3/2026-10-03-merge-readiness/advisory-scan-2026-10-04.json` records the current GitHub Advisory Database package/version comparison. Material fixed boundaries inspected include Starlette, FastAPI, HTTPX2/HTTPCore2, AnyIO, idna, pytest, Uvicorn, Ajv and fast-uri. The selected versions are not inside the inspected known affected ranges. Registry-native npm/PyPI audit endpoints remain unavailable from the container because DNS is blocked; this limitation is not labeled as a zero-finding registry audit.

pytest 9.0.3 qualification used a source-equivalent environment: every source file changed between official 9.0.2 and 9.0.3 matched the upstream Git blob SHA, and the project suite passed. The official wheel identity/SHA is documented upstream, but its bytes could not be fetched into this container.

## Remaining remote-merge gates

S01 is CLOSED locally. Remote merge remains NOT READY because these independent gates are still unsatisfied in this runtime:

1. Native-browser exact-source verification: BLOCKED by the managed browser environment; no policy bypass attempted.
2. Hosted CI on this exact repaired source: NOT RUN because the repaired source cannot be published through the permitted path in this runtime.
3. Independent review: NOT RUN; this runtime exposes no subagent/reviewer capability, so only self-review is possible.
4. Permitted publication: BLOCKED by the previously observed publication safeguard; no alternate-tool workaround is authorized.

`low_model_ready` remains false. Task 26 remains paused.
