# Testing

## Install

```bash
npm ci --ignore-scripts
pip install -r server/requirements.txt
```

## Core validation

```bash
npm run validate
npm test
node --check src/app.js
npm run verify:sw
```

## Browser and offline smoke

```bash
python3 scripts/browser_smoke.py
```

The smoke test covers bilingual/theme behaviour, full/section exams, resume/state persistence, option order, results/review, service-worker controlled reload, true cached reload after the local HTTP server stops, and public feedback URLs.

## Server/database

```bash
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
```

## Adapter contracts

Browser:

```bash
node scripts/contract_test.js browser
```

API, matching CI:

```bash
PYTHONPATH=server DB_URL=sqlite:///./contract-ci.db \
  python -m uvicorn app.main:app --app-dir server --host 127.0.0.1 --port 8000

SDAIA_API_BASE=http://127.0.0.1:8000/v1 node scripts/contract_test.js api
```

Run the server in one terminal and the contract command in another, or background it as the CI workflow does.

## Public Pages artifact gate

The pull-request quality gate also:

1. builds the Pages artifact boundary;
2. asserts `_site/data/legacy` does not exist;
3. verifies service-worker assets inside `_site`;
4. serves `_site` over local HTTP;
5. runs `scripts/verify_live_release.js` against that local artifact.

This catches missing manifest/profile/content files before merge.

## Evidence-before-completion rule

A passing previous run is historical evidence only. Completion claims require fresh output for the tree being claimed.
