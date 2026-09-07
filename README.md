# SDAIA AI Engineer Study Space

## What this is

This is an unofficial community study tool. It is not affiliated with, endorsed by, or certified by SDAIA. The only exam facts treated as official by the app are the seven domains and the weights supplied by the owner from the badge material. The 121 questions, sessions, diagnostics, mastery/readiness scores, and study recommendations are preparation content.

## Architecture

The public product is a static GitHub Pages application. `index.html` contains markup and an inline data fallback; `src/app.js` owns UI wiring; storage access is behind `src/storage/interface.js`; study data lives under `data/`; pure calculation helpers live under `src/logic/`. A future API contract is documented in `api/openapi.yaml`, a portable database design is in `db/schema.sql`, and the FastAPI implementation under `server/` is test-only and is never deployed by CI.

## Storage adapters

`src/config.js` selects the storage implementation:

```js
export const STORAGE = 'browser';
export const API_BASE = '';
```

Today `browser` stores progress locally and loads the public JSON bank. To use a future private API, set `STORAGE` to `api` and set `API_BASE` to the deployed `/v1` base URL. `src/app.js` does not call `localStorage` or `fetch` directly.

## Add a question

1. Add the question to `data/questions.json` without changing existing IDs.
2. Conform to `data/schema/question.schema.json`.
3. Run `npm ci --ignore-scripts` and `node scripts/validate.js`.
4. Open a PR and allow CI to validate the bank before merging.

## Feedback today

The browser adapter creates a GitHub Issue Form URL. No feedback server is deployed. Reports are public GitHub issues and users are instructed not to include personal information. The scheduled review workflow can propose a PR when an `OPENAI_API_KEY` repository secret is configured; it never merges changes automatically.

## What requires a server

A server is required for private question banks, centrally synchronized progress, anonymous event collection, server-side feedback storage, and multi-device state. None of those services is deployed in this phase.

## Run locally

Static app over HTTP:
```sh
python3 -m http.server 8080
```

Validation and Node tests:
```sh
npm ci --ignore-scripts
node scripts/validate.js
node --test tests/*.test.js
node scripts/contract_test.js browser
```

Test-only API:
```sh
cd server
pip install -r requirements.txt && uvicorn app.main:app
```

Server tests:
```sh
PYTHONPATH=server pytest -q server/tests
```

Direct `file://` opening is not a supported release path because browser ES module security policies vary. GitHub Pages is the supported public runtime; the inline bank remains as a data fallback when a browser permits local module loading.
