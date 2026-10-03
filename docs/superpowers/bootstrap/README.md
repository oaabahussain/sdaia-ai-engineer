# K3 H0-R2 Project Bootstrap

Bootstrap revision: `k3-h0-r2-v1`

The bootstrap exists only to tell a new session where authoritative live information lives and how to fail closed. It is not a second state store.

Required execution path:

`CURRENT-STATE` -> Superpowers `task-start` brief -> matching task packet -> current execution envelope -> preflight -> RED -> accepted RED freeze -> minimal implementation -> GREEN -> affected regression -> scope/result validation -> `task-done` -> durable checkpoint.

If any validator blocks, stop at the fixed failure code. Do not infer missing architecture or bypass the guard.

Low-reasoning execution has no merge authority; final review and integration remain high-reasoning work.
