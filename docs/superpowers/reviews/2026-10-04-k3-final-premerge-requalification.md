# K3 Final Pre-Merge Requalification Checkpoint

## Authority and scope

This checkpoint continues K3 Phase E after the S01 dependency-security closure. Tasks 1-25 remain complete. Task 26 is NOT STARTED. This checkpoint records a fresh final local pre-merge requalification and does not authorize Task 26 before the remaining external integration gates are closed.

The approved K3 specification and implementation plan are unchanged.

## Exact source under review

Pre-checkpoint product source:

- commit: `14e1240798ee300de1cda1cf4f36b44a13b2aefb`
- tree: `44b51c120af0f4ed0983ca51ee183755c2336271`
- live remote main observed: `dbf718f65396388efa234e459155e0e4d3fc8b6d`
- live remote execution branch observed: `680035b83c489013cbd09ca554229ecae8404518`

The checkpoint commit itself is documentation/control-plane only; no Product, schema, dependency, test, workflow, or approved-specification source is changed by this checkpoint.

## Fresh local verification

Fresh verification was rerun from the authenticated recovery package in an isolated linked worktree.

- recovery package SHA-256 and internal checksums: PASS
- Git bundle verification and `git fsck --full`: PASS
- current-state validation against live main: PASS
- process tests: 73/73 PASS
- adversarial fail-closed readiness: 15/15 PASS
- Node project tests: 752/752 PASS, zero failure/skip
- Python server tests: 116/116 PASS, zero failure/skip
- framework security boundary probes: 6/6 PASS
- residual Node probes: 16/16 PASS
- residual Python probes: 9/9 PASS
- known boundary/recovery probes: 3/3 PASS
- content validation: 1,120 questions / 7 domains / 140 objectives PASS
- factory/current import: PASS
- SQLite/storage smoke: PASS
- browser adapter contract: PASS
- real loopback TCP/API contract: PASS
- Pages build + local live-release contract: PASS
- changed Python compile / JavaScript syntax / Bash syntax / JSON parse: PASS
- conflict-marker and common secret-signature scans over changed source: PASS
- `git diff --check`: PASS

A first invocation of the S01 TCP verifier omitted its required `AUDIT_ROOT`; systematic debugging identified the environment-contract error and the unchanged verifier passed after the required audit root was supplied. This was not a Product failure.

## Whole-branch review

Final whole-branch review: self-review only; no independent subagent/reviewer capability was available.

Review focus covered the high-risk changed boundaries: evidence acceptance/idempotency, origin sequencing, store identity/cursors, learner/producer authorization, response privacy, SQLite migration/races, IndexedDB/JSONL persistence, outbox delivery, replay, identity links, privacy lifecycle, export deletion history, and exact content/release linkage.

Result:

- new Critical findings: 0
- new Important findings: 0
- carried deferred Minor: JSONL immutable event bytes are written before atomic sidecar-index replacement; interruption in that narrow window fails closed and requires explicit recovery. This is already recorded in the K3 execution ledger and is not claimed crash-atomic.

No Critical/Important finding was waived or downgraded to permit merge.

## Current dependency/security review

The selected dependency set remains intentionally security-qualified rather than broadly upgraded to the largest version number. Current upstream release/advisory evidence was refreshed for the material direct/transitive families including FastAPI, Starlette, Uvicorn, HTTPX2/HTTPCore2, AnyIO, idna, pytest, Ajv, ajv-formats, fast-uri, jsonschema, rfc8785, truststore and fake-indexeddb.

No selected reviewed version was found inside the material affected ranges used by the current security decision. In particular, the selected `fast-uri 3.1.8`, `pytest 9.0.3`, `AnyIO 4.15.1`, `HTTPX2 2.13.1`, `Starlette 1.7.0`, `idna 3.20`, `Ajv 8.20.0`, and `Uvicorn 0.35.0` are at or above the reviewed security fix boundaries applicable to their release lines.

Limitations remain explicit:

- current registry-native `npm audit` could not run because the environment cannot resolve `registry.npmjs.org`; this is not reported as a zero-finding npm audit;
- the reconstructed local Python test environment lacks installed `truststore 0.10.4` distribution metadata, so a new source-exact local `pip check` is not claimed. The authenticated S01 closure checkpoint recorded `pip check: PASS` in its qualified environment, and the current 116/116 tests passed using the qualified direct stack. Hosted CI after publication remains the final dependency-install/runtime gate.
- native GitHub Dependabot/code-scanning/secret-scanning alert endpoints were not accessible through the available connector and are not claimed checked.

## Git integration proof

For the observed live main `dbf718f...` and reviewed local source `14e1240...`:

- merge base equals live main;
- local source is ahead and not behind;
- `git merge-tree --write-tree` produces the reviewed product tree with no conflict;
- tracked working tree is clean after generated test/build artifacts are excluded/cleaned.

Therefore there is no reproduced Git content conflict against the observed main. This proof expires if `main` moves.

## Live GitHub state

At this checkpoint:

- remote `main` remains `dbf718f65396388efa234e459155e0e4d3fc8b6d`;
- remote `impl/k3-learner-evidence-engine` remains `680035b83c489013cbd09ca554229ecae8404518`;
- PR #28 remains open + draft and describes the older pre-Task-25 tree;
- PR #28 has no submitted reviews or review threads;
- the exact latest local source commit is not present on GitHub;
- repository rulesets returned no rulesets, while branch-protection detail could not be read through the installed GitHub integration and remains unverified rather than assumed absent.

PR #28 MUST NOT be merged in its current stale state.

## Remaining external merge gates

Local code/security requalification is GREEN, but remote merge remains NOT READY until all applicable external gates close:

1. **Permitted exact-history publication — BLOCKED/NOT PERFORMED.** Publish the complete latest Git history through a permitted native Git route. Do not reconstruct equivalent files as a different history and do not force-push/overwrite newer remote work.
2. **Hosted CI on exact published SHA — NOT RUN.** Required after publication, including the repository's Node 22 quality/browser gate and Python 3.12 server/adapter gate.
3. **Native browser exact-source validation — ENVIRONMENT_BLOCKED locally.** Chromium is present but `chromedriver` is absent; the browser smoke script fails explicitly for that missing runner dependency. Hosted CI previously proved the browser gate on the older remote SHA, not on the latest local SHA.
4. **Independent code review — NOT RUN.** The final review in this checkpoint is explicitly a self-review. Do not represent it as independent approval.
5. **GitHub branch-protection/native alert state — PARTIALLY UNVERIFIED.** Rulesets were readable, but protected-branch and native security-alert endpoints were not accessible through the installed integration.

Only after the exact latest source is published, CI/browser checks pass on that exact SHA, required independent review is satisfied when available, and live main is re-resolved without drift may the final merge gate be considered.

`low_model_ready` remains false. Task 26 remains paused.
