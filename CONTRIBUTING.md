# Contributing

Contributions that improve accuracy, clarity, accessibility, translations, usability, architecture, or tests are welcome.

## Content quality

For learning-content changes:

1. Test one clear objective or decision.
2. Use one defensible best answer and plausible distractors.
3. Keep Arabic and English equivalent in meaning.
4. Add concise teaching explanations.
5. Supply reliable sources when a claim depends on a standard, product, policy, exam rule, or changing fact.
6. Record/update the relevant **evidence status**; do not upgrade a claim from project-reference/unverified to official without primary evidence.
7. Do not copy confidential, leaked, copyrighted real-exam material.

## Contract rules

- **Stable IDs are immutable once active.** Do not recycle or renumber an active question/family identity.
- **Exam rules live in exam profiles, not code.** Question counts, section sizes, weights, and evidence status belong in `ExamProfileV1`.
- Do not add new **hard-coded track constants** to core runtime/release logic when the manifest/profile can supply them.
- Do not create an active **legacy path without an explicit disposition** and migration/retirement plan.
- The canonical track manifest owns track content references; do not create a second competing question-bank source.
- State/storage changes must preserve migration behaviour for unfinished learner state.

## Code workflow

Make the smallest coherent change, then run:

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

See [TESTING.md](TESTING.md) for the API adapter contract.

## Pull request checklist

- User-visible behaviour is intentional and covered.
- Canonical manifest/profile/state contracts remain valid.
- Arabic/English and RTL/LTR remain usable.
- Mobile/light/dark behaviour is not regressed.
- Service-worker/offline behaviour is covered when relevant.
- Public Pages artifact does not accidentally include `data/legacy/`.
- Evidence status is updated for factual/exam-rule changes.
- No active legacy source was added silently.

## Repository governance target

- **CI is required before merge.**
- Risky migrations should receive review before integration.
- Production baselines should be identified by immutable commit SHA and, when available, annotated tags.
- Enable **branch protection when the owner's workflow is confirmed**; do not lock the owner out before confirming the intended merge/recovery path.
- Add **CODEOWNERS when multiple maintainers exist** and ownership boundaries are agreed.
- Programme A does not itself change repository branch-protection settings.

## Privacy and safety

Do not submit personal information, API keys, credentials, secrets, private exam material, confidential documents, or proprietary content in public issues or pull requests.
