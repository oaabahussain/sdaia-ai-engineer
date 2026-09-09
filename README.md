# SDAIA AI Engineer Practice

A bilingual, community-oriented practice site for AI Engineer exam preparation.

> **Unofficial project:** This repository and website are independent study resources and are not affiliated with, endorsed by, or certified by SDAIA. Exam questions and explanations are training content.

## Live site

**https://oaabahussain.github.io/sdaia-ai-engineer/**

## What the site includes

- Arabic and English interface with RTL/LTR support.
- 1,120 bilingual practice-question instances across seven AI engineering domains.
- A 200-question weighted full exam.
- Standalone domain exams with 25, 50, 100, or all available questions.
- Randomized question order and randomized answer-option order on every attempt.
- Balanced displayed correct-answer positions in the 200-question exam.
- Optional confidence selection; it never blocks answering, navigation, or submission.
- Resume support, question flags, direct question navigation, results by domain, and answer review.
- Light and dark themes.
- Local progress storage in the browser.

## Community

The project welcomes useful feedback and contributions.

- **Suggestions, contributions, and ratings:** https://oaabahussain.github.io/sdaia-ai-engineer/feedback.html
- **Question problem:** use the report action available from the project issue templates.
- **Code or content contribution:** see [CONTRIBUTING.md](CONTRIBUTING.md).

GitHub submissions are public. Do not include personal, confidential, or sensitive information.

## Project structure

```text
.
├── index.html                 # Main practice interface
├── feedback.html              # Suggestions, contributions, and rating page
├── src/                       # Application, exam logic, and storage adapters
├── data/                      # Domain concepts, study data, and schemas
├── tests/                     # Automated application tests
├── scripts/                   # Validation and browser smoke tests
├── server/                    # Optional/test API implementation
├── api/                       # API contract
└── .github/                   # CI, Pages deployment, and community templates
```

The public GitHub Pages site currently uses browser storage. The optional API code is not required to use the website.

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

Run validation and tests:

```bash
npm ci --ignore-scripts
node scripts/validate.js
node --test tests/*.test.js
python3 scripts/browser_smoke.py
```

## Content quality

Changes to questions, concepts, translations, answer choices, domain weights, or scoring logic should include evidence where appropriate and must pass the automated validation suite before merge.

## License

See [LICENSE](LICENSE).
