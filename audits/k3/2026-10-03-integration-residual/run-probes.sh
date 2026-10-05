#!/usr/bin/env bash
set -u
ROOT=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
REPO=${1:?usage: run-probes.sh REPO_PATH [PYTHON_EXECUTABLE]}
PYTHON=${2:-python3}
LOGS=${AUDIT_LOG_DIR:-"$ROOT/run-logs"}
mkdir -p "$LOGS"
node_rc=0
AUDIT_REPO="$REPO" node --test "$ROOT/remaining.test.mjs" > "$LOGS/node.log" 2>&1 || node_rc=$?
python_rc=0
(cd "$REPO" && PYTHONPATH=server "$PYTHON" -m pytest -q "$ROOT/test_remaining_server.py" --junitxml="$LOGS/python.xml") > "$LOGS/python.log" 2>&1 || python_rc=$?
control_rc=0
AUDIT_REPO="$REPO" node --test "$ROOT/known-boundaries.test.mjs" > "$LOGS/boundaries.log" 2>&1 || control_rc=$?
tail -n 9 "$LOGS/node.log"
tail -n 2 "$LOGS/python.log"
tail -n 9 "$LOGS/boundaries.log"
printf 'Node exit=%s Python exit=%s boundary controls exit=%s\n' "$node_rc" "$python_rc" "$control_rc"
# Current checkpoint intentionally returns nonzero: unresolved behavioral failures are not success.
if [ "$node_rc" -ne 0 ] || [ "$python_rc" -ne 0 ] || [ "$control_rc" -ne 0 ]; then exit 1; fi
