# K3 Pre-Merge Governance Hardening Checkpoint

## Authority and scope

This checkpoint supersedes `2026-10-04-k3-final-premerge-requalification.md` as the latest local K3 pre-merge checkpoint. Tasks 1-25 remain complete. Task 26 is **NOT STARTED**. The approved K3 specification and implementation plan are unchanged.

This checkpoint records repository-control-plane hardening only. It does not change Product behavior, schemas, task contracts, content, dependencies, or the approved K3 architecture.

## Exact source under review

- prior checkpoint commit: `ce674522c51272ae3afe4e3f91d36c19cbec5f0a`
- prior checkpoint tree: `2d74b6f5f051ea5608f5545dbb76a4482c605968`
- governance-hardening commit: `ec94597e1e9d2c28a65eb63a6ec05eda53c9e85b`
- governance-hardening tree: `52dfee9bfded7a496049b3ce269b4371306b3629`
- observed live main: `dbf718f65396388efa234e459155e0e4d3fc8b6d`
- hardening source relative to observed main: 50 ahead / 0 behind

## Why this hardening was added

A pre-merge repository-governance review applied the relevant Maintainer Defense v1.1.1 rules to the exact local candidate and identified three bounded control-plane findings:

1. `MD-GOV-002` — `.github/CODEOWNERS` was absent.
2. `MD-GOV-005` — no machine-readable Dependabot/Renovate update policy existed.
3. `MD-WF-006` — the Pages workflow checkout retained Git credentials while the job/workflow carried write-capable Pages/OIDC authority.

No finding required Product code or architecture changes.

## Implemented hardening

Commit `ec94597...` makes only these changes:

- adds `.github/CODEOWNERS` protecting `.github/`, `SECURITY.md`, and `docs/superpowers/` under repository-owner review;
- adds `.github/dependabot.yml` for weekly `npm`, `pip` (`/server`), and `github-actions` updates;
- adds `persist-credentials: false` to the pinned `actions/checkout` step in `.github/workflows/pages.yml`.

GitHub's current checkout action contract confirms that `persist-credentials` defaults to true and controls whether the token/SSH key is stored in local Git configuration. Current GitHub documentation also supports CODEOWNERS-based review boundaries and Dependabot updates for GitHub Actions.

## RED to GREEN evidence

A one-off security contract outside the repository was used so the repository did not gain test-only security scaffolding.

Before the hardening commit, the contract failed with exactly three expected deficiencies:

- CODEOWNERS missing;
- Dependabot configuration missing;
- Pages checkout persisted credentials.

After the minimal change, the same contract passed. No test was weakened or removed.

## Fresh local verification after hardening

Verification on `ec94597...` produced:

- Git working tree before checkpoint metadata: clean;
- `git diff --check`: PASS;
- workflow/Dependabot YAML parsing: PASS;
- current-state validation against observed live main: PASS;
- content validation: 1,120 questions / 7 domains / 140 objectives PASS;
- Node project tests: 752/752 PASS;
- process tests: 73/73 PASS;
- adversarial fail-closed readiness: 15/15 PASS;
- factory/current import: PASS;
- service-worker contract: 34 PASS;
- Pages artifact/build checks: PASS;
- `.github` conflict-marker scan: no finding;
- common secret-signature scan over the intended diff: no finding;
- manual-equivalent rerun of the applicable Maintainer Defense v1.1.1 rules after the change: 0 findings.

The bundled Maintainer Defense executable was not materializable as a runnable file in this ChatGPT container. Therefore the result above is explicitly recorded as a **manual equivalent using the exact v1.1.1 rule implementation read from the installed Skill**, not as an execution of the packaged auditor binary/script.

Native browser smoke remains **ENVIRONMENT_BLOCKED** in this container because Chromium is present but `chromedriver` is absent. This is not classified as a Product regression; hosted exact-SHA browser validation remains required after publication.

## Live repository governance limits

The installed GitHub connection has repository admin/push authority, but connector capability and repository state still impose external limits:

- repository rulesets currently return no configured rulesets;
- branch-protection detail cannot be read through the installed integration (`403 Resource not accessible by integration`), so it remains unverified rather than assumed absent;
- no exposed connector action can write branch protection/rulesets;
- CODEOWNERS therefore improves ownership definition but is not represented here as independently proving an enforced required-review rule.

`HIGH_REASONING_MERGE_GATE` remains required.

## ZzzOps applicability ruling

The installed ZzzOps workflow was considered in read-only mode. K3 already has an authoritative Git/spec/plan/ledger/checkpoint/CURRENT-STATE control plane, and no initialized ZzzOps project state/backend is present in this repository/runtime. Initializing ZzzOps during the final K3 merge boundary would create a second state authority. Therefore ZzzOps is **not initialized or allowed to mutate K3 state in this checkpoint**; its value remains future workflow evaluation after K3 integration.

## Remaining external merge gates

Local repository governance is hardened, but merge remains **NOT READY** until all applicable external gates close:

1. publish the complete latest Git history through a permitted native Git route while preserving exact object history; do not reconstruct the history through GitHub REST file/commit mutations and do not force-push;
2. run hosted CI on the exact published final checkpoint SHA, including Node/browser and Python 3.12 server/adapter gates;
3. obtain an applicable independent review on that exact current head; after publication prefer the installed GitHub auto-review / PR-completion workflow and revalidate every actionable thread;
4. re-resolve live `main` immediately before landing and fail closed on drift or merge conflict;
5. use the PR-completion exact-head landing workflow. A landing request requires explicit per-PR confirmation for the then-current head.

`low_model_ready` remains false. Task 26 remains paused.

Recorded at: `2026-10-04T16:58:28Z`.
