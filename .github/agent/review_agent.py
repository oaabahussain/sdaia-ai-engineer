import json
import os
import re
import subprocess
import urllib.request
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPO = os.environ['GITHUB_REPOSITORY']
API_KEY = os.environ.get('LLM_API_KEY')
PROVIDER = os.environ.get('LLM_PROVIDER', '').lower()
MODEL = os.environ.get('LLM_MODEL', '')
PROMPT = (ROOT / '.github/agent/review_prompt.md').read_text(encoding='utf-8')


def gh(path, method='GET', fields=None):
    command = ['gh', 'api', path, '-X', method]
    for key, value in (fields or {}).items():
        command += ['-f', f'{key}={value}']
    return json.loads(subprocess.check_output(command, text=True))


def call_llm(question, reports):
    if not API_KEY or not PROVIDER or not MODEL:
        raise RuntimeError('LLM_PROVIDER, LLM_MODEL, and LLM_API_KEY are required')
    if PROVIDER not in {'openai', 'anthropic'}:
        raise RuntimeError('LLM_PROVIDER must be openai or anthropic')

    user = (
        'CURRENT_QUESTION_START\n'
        + json.dumps(question, ensure_ascii=False)
        + '\nCURRENT_QUESTION_END\nREPORTS_START\n'
        + json.dumps(reports, ensure_ascii=False)
        + '\nREPORTS_END'
    )

    if PROVIDER == 'openai':
        payload = json.dumps({
            'model': MODEL,
            'instructions': PROMPT,
            'input': user,
            'store': False,
        }).encode()
        request = urllib.request.Request(
            'https://api.openai.com/v1/responses',
            data=payload,
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json',
            },
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            body = json.loads(response.read())
        texts = [
            content.get('text', '')
            for item in body.get('output', [])
            for content in item.get('content', [])
            if content.get('type') == 'output_text'
        ]
        return json.loads(''.join(texts))

    payload = json.dumps({
        'model': MODEL,
        'max_tokens': 2048,
        'system': PROMPT,
        'messages': [{'role': 'user', 'content': user}],
    }).encode()
    request = urllib.request.Request(
        'https://api.anthropic.com/v1/messages',
        data=payload,
        headers={
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        body = json.loads(response.read())
    texts = [item.get('text', '') for item in body.get('content', []) if item.get('type') == 'text']
    return json.loads(''.join(texts))


def apply_patch(question, patch):
    result = json.loads(json.dumps(question))
    for op in patch:
        if op.get('op') != 'replace':
            raise RuntimeError('Only replace patches are accepted')
        path = op.get('path', '')
        if path not in ['/question', '/options', '/answer', '/explanation', '/topic']:
            raise RuntimeError(f'Patch path not permitted: {path}')
        result[path[1:]] = op['value']
    return result


issues = gh(f'repos/{REPO}/issues?state=open&labels=question-report&per_page=100')
grouped = defaultdict(list)
for issue in issues:
    text = issue.get('title', '') + '\n' + (issue.get('body') or '')
    match = re.search(r'\bq\d+\b', text)
    if match:
        grouped[match.group(0)].append({
            'number': issue['number'],
            'title': issue['title'],
            'body': issue.get('body') or '',
        })

if not grouped:
    print('No question-report issues found.')
    raise SystemExit(0)

questions_path = ROOT / 'data/questions.json'
questions = json.loads(questions_path.read_text(encoding='utf-8'))
by_id = {question['id']: question for question in questions}
rows = []
for question_id, reports in grouped.items():
    if question_id not in by_id:
        continue
    proposal = call_llm(by_id[question_id], reports)
    updated = apply_patch(by_id[question_id], proposal['patch'])
    index = next(i for i, question in enumerate(questions) if question['id'] == question_id)
    questions[index] = updated
    rows.append((question_id, reports, proposal['rationale'], proposal['patch']))

questions_path.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
subprocess.check_call(['node', 'scripts/validate.js'], cwd=ROOT)
branch = f'agent/review-{date.today().isoformat()}'
subprocess.check_call(['git', 'checkout', '-B', branch], cwd=ROOT)
subprocess.check_call(['git', 'add', 'data/questions.json'], cwd=ROOT)
subprocess.check_call(['git', 'commit', '-m', f'Propose question review {date.today().isoformat()}'], cwd=ROOT)
subprocess.check_call(['git', 'push', '--force-with-lease', '-u', 'origin', branch], cwd=ROOT)

table = ['| Question | Reports | Proposed patch |', '|---|---:|---|']
rationales = []
for question_id, reports, rationale, patch in rows:
    links = ', '.join(f'#{item["number"]}' for item in reports)
    table.append(f'| {question_id} | {len(reports)} ({links}) | `{json.dumps(patch, ensure_ascii=False)}` |')
    rationales.append(f'### {question_id}\n{rationale}')
body = '\n'.join(table) + '\n\n' + '\n\n'.join(rationales) + '\n\nThis PR is an agent proposal and must be reviewed by a human. The agent never merges it.'
subprocess.check_call([
    'gh', 'pr', 'create', '--base', 'main', '--head', branch,
    '--title', f'Agent question review {date.today().isoformat()}',
    '--body', body, '--label', 'agent-proposal',
], cwd=ROOT)
