# Contributing

Contributions that improve the accuracy, clarity, accessibility, translations, or usability of the practice site are welcome.

## Ways to contribute

You can help by:

- Reporting an incorrect or ambiguous question.
- Suggesting a new topic or missing concept.
- Improving Arabic or English wording.
- Adding a useful question pattern or explanation.
- Improving accessibility, mobile behavior, performance, or tests.
- Fixing bugs or improving the interface.

Use the public feedback page for non-code contributions:

**https://oaabahussain.github.io/sdaia-ai-engineer/feedback.html**

## Question and content quality

For question-bank changes:

1. Keep the question focused on one clear learning objective.
2. Use one defensible best answer.
3. Make distractors plausible but clearly incorrect.
4. Avoid answer-position clues or wording patterns.
5. Keep Arabic and English versions equivalent in meaning.
6. Add a concise explanation that teaches why the answer is correct.
7. Include a reliable source when the claim depends on a standard, specification, product behavior, or changing fact.
8. Do not copy copyrighted exam questions or confidential exam material.

## Code changes

Create a branch, make the smallest coherent change, then run:

```bash
npm ci --ignore-scripts
node scripts/validate.js
node --test tests/*.test.js
python3 scripts/browser_smoke.py
```

Open a pull request against `main`. CI must pass before merge.

## Pull request checklist

- The change has a clear user benefit.
- Existing exam behavior is preserved unless the PR intentionally changes it.
- Arabic and English UI remain consistent.
- Light and dark themes remain usable.
- Mobile layout remains usable.
- New public pages are included in the Pages artifact and service-worker cache when appropriate.
- Tests cover behavior that could regress.

## Privacy and safety

Do not submit personal information, API keys, credentials, private exam material, confidential documents, or proprietary content in issues or pull requests.
