# Deployment

## Public deployment model

The public site is deployed by `.github/workflows/pages.yml` from `main`. Programme A does not change branch protection automatically.

The Pages artifact contains:

- shell HTML/PWA/icon files;
- `src/`;
- `tracks/`;
- `data/concepts/`;
- `data/migrations/`;
- `data/learn.json`;
- `data/cases.json`.

`data/legacy/` is **not part of the Pages artifact** and the workflow explicitly asserts that `_site/data/legacy` does not exist.

## Validation before deployment

Before upload/deploy the workflow runs canonical validation, Node tests, browser smoke, HTML/application checks, and service-worker asset checks. PR CI builds the same public artifact boundary and runs the manifest-driven live verifier against a local HTTP preview.

After deployment, `scripts/verify_live_release.js` loads the live track manifest, resolves its default profile by ID, verifies manifest-declared content, and verifies the live service-worker contract.

## Service-worker/cache recovery

The service worker uses a versioned shell cache, removes old cache keys on activation, claims clients, caches successful same-origin GET responses on demand, and only uses cached `index.html` for failed navigation requests.

If a release has a cache issue:

1. verify the live `sw.js` and manifest/profile through the release verifier;
2. publish a corrected service-worker/cache version;
3. allow activation to remove superseded cache keys;
4. verify a controlled online load before testing offline recovery.

Do not restore the retired `sdaia-ai-pages-v8` contract.

## Rollback baseline

Programme A baseline commit:

`362d35c697411d4eddcc4536c843df17161d3374`

Planned tag name:

`pre-programme-a-2026-09-23`

As of 2026-09-26 the remote tag could not be verified through the available GitHub connection. Use the immutable SHA as the confirmed rollback reference until the tag is explicitly created/confirmed.

A rollback should be performed through normal Git/release controls with a fresh validation/deploy run; do not manually mutate the deployed artifact.

## Optional development API

The FastAPI/SQLite service is local/test scaffolding, not the production Pages backend.

```bash
pip install -r server/requirements.txt
PYTHONPATH=server DB_URL=sqlite:///./dev.db \
  python -m uvicorn app.main:app --app-dir server --host 127.0.0.1 --port 8000
```
