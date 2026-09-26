# SDAIA AI Engineer Practice

A bilingual, independent practice site and the current first track of a reusable learning-and-assessment platform.

> **Unofficial project:** This repository and website are independent study resources and are not affiliated with, endorsed by, or certified by SDAIA. Training questions and explanations are not official exam questions.

## Live site

**https://oaabahussain.github.io/sdaia-ai-engineer/**

## Current implementation

The canonical track manifest is `tracks/sdaia-ai-engineer/manifest.json`; exam behaviour comes from its default `ExamProfileV1`.

Current implementation facts:

- Arabic and English interface with RTL/LTR support.
- **1,120** generated bilingual foundation practice items from 140 concepts across seven domains.
- A **200-question project-reference** full exam, with 25/50/100/all section modes.
- Current weights and exam rules are marked `project-reference-unverified`; they must not be described as official SDAIA rules without current primary evidence.
- Stable namespaced question IDs plus a legacy `q1..q1120` migration map.
- StateV2 with browser storage, resume, flags, confidence, option-order persistence, results, and review.
- Browser and optional API adapters expose the same public `RuntimeBundleV2`.
- Service-worker offline recovery with shell-only precache and on-demand public content caching.
- Public GitHub feedback flows that preserve typed suggestion/contribution/rating content.

The architecture constitution targets **14,000+ high-quality training items in future content programmes**. That expansion has **not** been implemented in Programme A and the current runtime remains 1,120 foundation items.

## Architecture

Core rule:

> **The track is data; the learning platform is code.**

See:

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DATA-MODEL.md](DATA-MODEL.md)
- [MIGRATIONS.md](MIGRATIONS.md)
- [SECURITY.md](SECURITY.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [TESTING.md](TESTING.md)
- [HANDOFF.md](HANDOFF.md)

## Governance & evidence

- [Architecture constitution](docs/superpowers/specs/2026-09-23-learning-platform-vnext-design.md)
- [Original vNext evidence appendix](docs/superpowers/specs/2026-09-23-learning-platform-vnext-evidence.md)
- [2026-09-26 research amendment](docs/superpowers/specs/2026-09-26-learning-platform-research-amendment.md)
- [2026-09-26 research evidence ledger](docs/superpowers/specs/2026-09-26-b0-governance-research-sync-evidence.md)

Current SDAIA exam-rule metadata remains `project-reference-unverified`. The 14,000+ target and later AI/adaptive/psychometric programmes remain future work.


## Project structure

```text
.
├── index.html
├── feedback.html
├── src/                       # Browser core, runtime, state and adapters
├── tracks/                    # Canonical track manifests and exam profiles
├── data/
│   ├── concepts/              # Current public concept sources
│   ├── migrations/            # Stable-ID migration maps
│   ├── legacy/                # Retained migration input; not active runtime
│   └── schema/                # Active contracts
├── tests/
├── scripts/
├── server/                    # Local/test FastAPI + SQLite scaffold
├── api/                       # OpenAPI contract
└── .github/                   # CI, Pages and community templates
```

The public GitHub Pages site uses browser storage. The FastAPI server is optional development/test scaffolding and is not required to use the site.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Do not open `index.html` through `file:`; canonical track content is loaded over HTTP.

## Validate and test

```bash
npm ci --ignore-scripts
npm run validate
npm test
node --check src/app.js
python3 scripts/browser_smoke.py
PYTHONPATH=server pytest -q server/tests
python3 scripts/db_smoke.py
node scripts/contract_test.js browser
```

See [TESTING.md](TESTING.md) for the API contract command and full release-equivalent gate.

## Community

- Suggestions, contributions, and ratings: https://oaabahussain.github.io/sdaia-ai-engineer/feedback.html
- Question reports: use the project issue templates.
- Code/content changes: see [CONTRIBUTING.md](CONTRIBUTING.md).

GitHub submissions are public. Do not include personal, confidential, sensitive, proprietary, or credential material.

## License

See [LICENSE](LICENSE).
