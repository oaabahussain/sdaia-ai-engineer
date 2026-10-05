"""Bounded loopback-only integration checks using synthetic evidence."""
import functools
import http.server
import importlib.util
import json
import os
from pathlib import Path
import socket
import subprocess
import tempfile
import threading
import time

import httpx
import uvicorn
from app.main import create_app
from app.evidence_auth import StaticLearnerAuthorization

ROOT = Path(os.environ['AUDIT_ROOT'])
REPO = Path(os.environ['AUDIT_REPO'])
spec = importlib.util.spec_from_file_location('probe_helpers', ROOT/'probes/test_remaining_server.py')
helpers = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helpers)

with tempfile.TemporaryDirectory(prefix='k3-http-audit-') as tmp:
    db_url = 'sqlite:///' + str(Path(tmp)/'http.db')
    app = create_app(db_url, learner_auth=StaticLearnerAuthorization('learner:a'))
    sock = socket.socket()
    sock.bind(('127.0.0.1', 0))
    port = sock.getsockname()[1]
    server = uvicorn.Server(uvicorn.Config(app, log_level='error', lifespan='on'))
    thread = threading.Thread(target=lambda: server.run(sockets=[sock]), daemon=True)
    thread.start()
    deadline = time.monotonic()+10
    while not server.started and thread.is_alive() and time.monotonic()<deadline:
        time.sleep(0.02)
    try:
        assert server.started, 'local ASGI server failed to start'
        with httpx.Client(base_url=f'http://127.0.0.1:{port}', timeout=5) as client:
            good = helpers.event(1)
            first = client.post('/v1/learner-evidence/batch', json={'events':[good]})
            retry = client.post('/v1/learner-evidence/batch', json={'events':[good]})
            foreign = client.post('/v1/learner-evidence/batch', json={'events':[helpers.event(2,'learner:b')]})
            cursor = client.get('/v1/learner-evidence?after_store_seq=9007199254740992')
            assert first.json()['receipts'][0]['disposition']=='ACCEPTED'
            assert retry.json()['receipts'][0]['disposition']=='DUPLICATE'
            assert foreign.status_code==403
            assert cursor.status_code==400
            correction = helpers.event(3)
            correction.update(definition_id='learner.evidence.correction.recorded@1',
                              authority_ref='unverified:test-authority',
                              payload={'action':'VOID','target_event_id':helpers.uid(1),'reason_code':'TEST_ONLY'})
            admin = client.post('/v1/learner-evidence/batch', json={'events':[correction]})
            sensitive = helpers.event(4)
            sensitive.update(definition_id='learner.response.recorded@1',
                             item_interaction_id=helpers.uid(80),item_version_id='item:test',
                             payload={'response_version':1,'response_kind':'OPTION',
                                      'response':{'option_index':0,'access_token':'SYNTHETIC-NOT-A-REAL-CREDENTIAL'}})
            nested = client.post('/v1/learner-evidence/batch', json={'events':[sensitive]})
            pulled = client.get('/v1/learner-evidence')
            rows = pulled.json()['events']
            observations = {
                'transport':'real loopback TCP HTTP, synthetic principal and data',
                'controls':{'first_accept':first.json()['receipts'][0]['disposition'],
                            'exact_retry':retry.json()['receipts'][0]['disposition'],
                            'foreign_learner_status':foreign.status_code,
                            'out_of_range_cursor_status':cursor.status_code},
                'unfixed_findings':{
                    'R08_ordinary_learner_correction':{'http':admin.status_code,'receipt':admin.json()['receipts'][0]['disposition'],
                        'persisted':any(e['event_id']==correction['event_id'] for e in rows)},
                    'R10_nested_sensitive_field':{'http':nested.status_code,'receipt':nested.json()['receipts'][0]['disposition'],
                        'persisted':any(e['event_id']==sensitive['event_id'] and 'access_token' in e['payload']['response'] for e in rows)},
                    'R01b_pull_has_store_identity':'store_id' in pulled.json()
                }
            }
            print(json.dumps(observations, indent=2))
            (ROOT/'TCP-OBSERVATIONS.json').write_text(json.dumps(observations, indent=2)+'\n')
    finally:
        server.should_exit = True
        thread.join(timeout=10)
        sock.close()
        assert not thread.is_alive(), 'loopback server failed to stop'

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

handler=functools.partial(QuietHandler, directory=str(ROOT/'site'))
with http.server.ThreadingHTTPServer(('127.0.0.1',0),handler) as httpd:
    thread=threading.Thread(target=httpd.serve_forever,daemon=True)
    thread.start()
    try:
        result=subprocess.run(['node','scripts/verify_live_release.js',f'http://127.0.0.1:{httpd.server_port}/'],
                              cwd=REPO,text=True,capture_output=True,timeout=20)
        print(result.stdout, end='')
        print(result.stderr,end='')
        assert result.returncode==0, f'local Pages verification exit {result.returncode}'
    finally:
        httpd.shutdown()
        thread.join(timeout=5)
