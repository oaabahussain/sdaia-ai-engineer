#!/usr/bin/env python3
"""Exercise the real portable runner. Not included in its own recursive suites."""
import argparse
import json
from pathlib import Path
import subprocess


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--repo', type=Path, required=True)
    parser.add_argument('--python', required=True)
    parser.add_argument('--logs', type=Path, required=True)
    args = parser.parse_args()
    args.logs.mkdir(parents=True, exist_ok=False)
    runner = args.repo / 'audits/k3/2026-10-03-residual-remediation/run-verification.py'
    with (args.logs / 'runner.log').open('w') as output:
        result = subprocess.run([args.python, str(runner), '--repo', str(args.repo),
                                 '--python', args.python, '--logs', str(args.logs / 'checks')],
                                stdout=output, stderr=subprocess.STDOUT, timeout=75)
    checks = json.loads((args.logs / 'checks/commands.json').read_text())
    names = {row['name'] for row in checks}
    assert {'full-node', 'full-python', 'native-browser', 'whitespace', 'real-tcp-evidence'} <= names
    nonpassing = [row['name'] for row in checks if row['status'] != 'PASS']
    expected = 2 if nonpassing else 0
    summary = {'runner_exit_code': result.returncode, 'expected_exit_code': expected,
               'nonpassing_checks': nonpassing, 'result_count': len(checks)}
    (args.logs / 'exit-result.json').write_text(json.dumps(summary, indent=2) + '\n')
    assert result.returncode == expected, (f'Recorded non-PASS checks {nonpassing} require '
                                          f'exit {expected}, observed {result.returncode}')
    print('VERIFICATION_EXIT_REGRESSION: PASS ' + json.dumps(summary))


if __name__ == '__main__':
    main()
