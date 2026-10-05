# S01 - Coordinated dependency upgrade acceptance plan

Status: IMPLEMENTED AND LOCALLY VERIFIED. S01 dependency risk is closed locally; external browser/hosted-CI/reviewer/publication gates remain open. This is not permission to bypass a blocked publication tool.

## Preserved current stack

The active declared requirements remain FastAPI 0.116.1, Uvicorn 0.35.0, jsonschema 4.25.1, httpx 0.28.1, pytest 8.4.2 and rfc8785 0.1.4. The verified restored environment resolves Starlette 0.47.3. Keep this environment intact as the RED/control snapshot.

## Candidate and acquired evidence

- The official Starlette 1.5.0 wheel is staged separately, not active. Its SHA-256 is 9ca76b47375e56f279d7c66651e801ef11167e58557c429be7ec55702d81d4bb.
- FastAPI 0.141.1 is an investigated compatibility candidate, not an app-qualified selection. The official metadata permits Starlette >=0.46.0 and introduces annotated-doc >=0.0.2.
- Expected official FastAPI wheel SHA-256: bfb91aa2d334c61cb35ba9a116fc123b3d3df31640b801cf57a7a78ec3f603b3. Its bytes have NOT been obtained; do not claim this hash was checked against a local wheel.
- Choose exact versions for the complete resolved dependency set only after official artifact acquisition and advisory checks. No placeholder dependency version or fabricated lockfile is permitted.

## Independently checkable steps

1. Acquire the complete candidate dependency set through an available permitted official distribution route. Verify package hashes and dependency metadata, preserving both the old and candidate environments.
2. Install in a new environment using normal dependency resolution. `pip check` must succeed. Do not use `--no-deps` to force Starlette beside the incompatible old FastAPI.
3. Run the unchanged `audits/k3/2026-10-03-merge-readiness/test_framework_boundaries.py`; all six cases must pass. Repeat the route/authorization controls and retain which advisory code paths actually exist in the application.
4. Change the application dependency manifest in a dedicated test-first commit only once the candidate artifacts can be tested together. Run the full Node/server suites, unchanged residual probes, real TCP API checks, schema/migration and Pages checks on that exact candidate. Do not ignore startup warnings or dependency conflicts.
5. Run current complete Node and Python advisory scans with recorded data retrieval times. Map every remaining finding to installed version and application reachability; an unreachable advisory service is BLOCKED, not zero findings.
6. Obtain native-browser tests, exact-source hosted CI and genuine independent review when those capabilities are permitted. The existing publication safeguard and managed browser restriction are not permission to use another route around them.
7. Update the open S01 group only after the complete stack's tests pass. Keep merge readiness false while any required evidence remains missing. Do not begin canonical Task 26 as part of this dependency correction.

## Exit criterion

The isolated Starlette 6/6 result alone cannot close S01. Closure requires the full compatible application environment, dependency-resolution proof, exact-source application regression and reviewed advisory disposition.


## 2026-10-04 completion record

Selected bounded upgrade: FastAPI 0.141.1, Starlette 1.7.0, HTTPX2 2.13.1 and pytest 9.0.3. Uvicorn 0.35.0 and jsonschema 4.25.1 remain unchanged because the current exact-package advisory review did not place them inside an affected range and upgrading them was not required to close S01. FastAPI 0.142.2 was reviewed but not selected for this security correction because it introduces additional telemetry implementation surface unrelated to S01; the smaller compatible change reduces merge risk.

TDD: `server/tests/test_dependency_security_policy.py` failed against the pre-upgrade manifest, then passed after the manifest change. The unchanged framework boundary probe passes 6/6. Candidate `pip check` passes. Full regression: Node 752/752, Python 116/116, process 73/73, adversarial 15/15, content validation PASS, residual Node 16/16, residual Python 9/9, boundary controls 3/3. Real loopback TCP and Pages checks pass using the new `httpx2` client and explicitly verify the repaired authorization/privacy behavior rather than the historical vulnerable observations.

Current GitHub Advisory Database comparison is in `advisory-scan-2026-10-04.json`. S01 is no longer an open code/dependency finding. Native-browser exact-source, hosted CI on the exact repaired source, independent review, and permitted publication remain separate external merge gates.
