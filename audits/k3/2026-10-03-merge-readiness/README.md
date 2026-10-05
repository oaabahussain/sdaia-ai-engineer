# Merge readiness evidence

Read the checkpoint in docs/superpowers/reviews/2026-10-03-k3-merge-readiness.md and MERGE-GATES.json. This is NOT a release-qualified package.

The framework probe intentionally remains RED on the unchanged application dependency set. It is outside the existing regression suite so old software behaviour tests are not confused with dependency qualification. Do not omit it from the coordinated upgrade gate or report every test as green.

Run the real verification-command regression with an empty log destination:

```bash
python audits/k3/2026-10-03-merge-readiness/test_verification_exit.py --repo "$PWD" --python /path/to/venv/bin/python --logs /path/to/new-logs
```

The wrapper passes if the inner runner truthfully returns2 for a blocked native check. That does NOT authorize merge. The inner runner does not run the external gates in MERGE-GATES.json.

For the staged upgrade, acquire the exact official FastAPI wheel named in upstream-acquisition.json, resolve all of its declared dependencies with the official Starlette wheel in an isolated environment, and run pip check, the unchanged framework probe, all server tests and the portable runner. Update active requirements only after the combined tests pass. Do not install Starlette1.5.0 alongside FastAPI0.116.1 by ignoring dependencies.
