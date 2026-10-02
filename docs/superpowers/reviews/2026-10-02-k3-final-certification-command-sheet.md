# K3 Final Certification Command Sheet

**Status:** PREPARED / NOT AUTHORIZED YET

Run only after active Project revision is verified, Task 5 envelope is current, no-write dry-run passes, and live adversarial readiness passes.

## Fresh checks

- resolve live `main`;
- verify execution branch recorded base equals live `main`;
- verify `next_task=5`;
- verify open Critical = 0 and Important = 0;
- verify Project revision = `k3-h0-r2-v1`;
- verify packet 005 digest equals real Task 5 brief digest;
- verify Task 5 execution envelope is current;
- verify worktree/SDD capability in the active runtime;
- verify `TASK5_DRY_RUN_PASS=PASS`;
- verify `ADVERSARIAL_READINESS_PASS=PASS`.

## Final commands

```bash
LIVE_MAIN_SHA="$(git rev-parse main)"
npm run validate:state -- --live-main-sha "$LIVE_MAIN_SHA" --json
npm run process:verify
npm test
```

## Authorization output

The low/no-thinking model is authorized only if the fresh machine evidence proves all three:

```text
ok=true
low_model_ready=true
next_task=5
```

Any non-PASS readiness gate, drift, stale Project bootstrap, packet/brief mismatch, invalid envelope, open Critical/Important, or missing runtime proof keeps low-model execution blocked.

No K3 Task 5 product implementation occurs during certification.
