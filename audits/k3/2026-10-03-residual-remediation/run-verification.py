#!/usr/bin/env python3
"""Local exact-source verification; never publishes or changes a remote ref."""
from pathlib import Path
import argparse, json, os, shutil, socket, subprocess, tempfile, time, urllib.request, urllib.error

parser=argparse.ArgumentParser()
parser.add_argument('--repo', type=Path, required=True)
parser.add_argument('--python', required=True)
parser.add_argument('--logs', type=Path, required=True)
args=parser.parse_args();root=args.repo.resolve();logs=args.logs.resolve();logs.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,PYTHONPATH=str(root/'server'))
results=[]

def run(name,command,custom=None,allowed=False):
    with (logs/(name+'.log')).open('w') as out:
        p=subprocess.run(command,cwd=root,env=custom or env,stdout=out,stderr=subprocess.STDOUT,timeout=40)
    results.append({'name':name,'command':command,'exit_code':p.returncode,'status':'PASS' if p.returncode==0 else 'BLOCKED' if allowed else 'FAIL'})
    (logs/'commands.json').write_text(json.dumps(results,indent=2)+'\n')
    print(name,p.returncode,flush=True)
    if p.returncode and not allowed:raise RuntimeError(f'{name} failed; inspect {logs/name}')

def port():
    with socket.socket() as s:s.bind(('127.0.0.1',0));return s.getsockname()[1]

def wait(url,process):
    for _ in range(50):
        if process.poll() is not None:raise RuntimeError('Local test server exited')
        try:
            with urllib.request.urlopen(url,timeout=0.2) as r:
                if r.status==200:return
        except Exception:pass
        time.sleep(0.1)
    raise RuntimeError('Local test server did not become ready')

state=json.loads((root/'docs/superpowers/state/CURRENT-STATE.json').read_text())
run('full-node',['npm','test'])
run('full-python',[args.python,'-m','pytest','-q','server/tests'])
run('process',['npm','run','process:verify'])
run('state',['node','scripts/validate_current_state.js','--live-main-sha',state['base_main_sha'],'--json'])
run('content',['npm','run','validate'])
run('factory-import',['npm','run','verify:factory-import'])
run('browser-storage',['node','scripts/contract_test.js','browser'])
run('database',[args.python,'scripts/db_smoke.py'])
run('parse',['node','--check','src/app.js'])
run('pages',['node','scripts/build_pages_artifact.js','_site'])
run('html',['node','scripts/verify_html.js','_site/index.html'])
run('sw',['node','scripts/verify_sw_assets.js','_site'])
run('residual-probes',['bash','audits/k3/2026-10-03-integration-residual/run-probes.sh',str(root),args.python],custom=dict(env,AUDIT_LOG_DIR=str(logs/'original-probes')))
with tempfile.TemporaryDirectory(prefix='k3-exact-http-') as tmp:
    apiport,pageport=port(),port();dburl='sqlite:///'+tmp+'/api.db'
    api_env=dict(env,DB_URL=dburl)
    with (logs/'api-server.log').open('w') as a,(logs/'page-server.log').open('w') as b:
        api=subprocess.Popen([args.python,'-m','uvicorn','app.main:app','--app-dir','server','--host','127.0.0.1','--port',str(apiport)],cwd=root,env=api_env,stdout=a,stderr=subprocess.STDOUT)
        page=subprocess.Popen([args.python,'-m','http.server',str(pageport),'--bind','127.0.0.1','--directory','_site'],cwd=root,env=env,stdout=b,stderr=subprocess.STDOUT)
        try:
            wait(f'http://127.0.0.1:{apiport}/v1/health',api);wait(f'http://127.0.0.1:{pageport}/index.html',page)
            run('real-tcp-api',['node','scripts/contract_test.js','api'],custom=dict(api_env,SDAIA_API_BASE=f'http://127.0.0.1:{apiport}/v1'))
            run('http-pages',['node','scripts/verify_live_release.js',f'http://127.0.0.1:{pageport}'])
        finally:
            for process in (api,page):
                process.terminate()
                try:process.wait(timeout=3)
                except subprocess.TimeoutExpired:process.kill();process.wait()
# Exercise the changed evidence boundary over a real TCP connection too.
with tempfile.TemporaryDirectory(prefix='k3-authorized-http-') as tmp:
    authport=port();auth_env=dict(env,K3_TEST_DB='sqlite:///'+tmp+'/authorized.db',K3_TEST_PORT=str(authport))
    launch="from app.main import create_app; from app.evidence_auth import StaticLearnerAuthorization; import uvicorn,os; uvicorn.run(create_app(os.environ['K3_TEST_DB'],learner_auth=StaticLearnerAuthorization('learner:a')),host='127.0.0.1',port=int(os.environ['K3_TEST_PORT']))"
    with (logs/'authorized-server.log').open('w') as out:
        process=subprocess.Popen([args.python,'-c',launch],cwd=root,env=auth_env,stdout=out,stderr=subprocess.STDOUT)
        observations=[]
        try:
            base=f'http://127.0.0.1:{authport}';wait(base+'/v1/health',process)
            def request(path,body=None):
                data=None if body is None else json.dumps(body).encode()
                req=urllib.request.Request(base+path,data=data,headers={'Content-Type':'application/json'})
                try:
                    with urllib.request.urlopen(req,timeout=3) as response:status=response.status;result=json.loads(response.read())
                except urllib.error.HTTPError as error:status=error.code;result=json.loads(error.read())
                observations.append({'path':path,'status':status,'response':result});return status,result
            event={'schema_version':2,'event_id':'20000000-0000-4000-8000-000000000001','definition_id':'learner.activity.started@1','learner_id':'learner:a','origin_id':'20000000-0000-4000-8000-000000000002','origin_seq':1,'activity_id':'20000000-0000-4000-8000-000000000003','track_id':'sdaia-ai-engineer','content_release_id':'release:test','mode':'practice','locale':'en','occurred_at':'2026-10-03T18:00:00Z','payload':{}}
            status,body=request('/v1/learner-evidence/batch',{'events':[event]});assert status==200
            first=body['receipts'][0];assert first['disposition']=='ACCEPTED'
            status,body=request('/v1/learner-evidence/batch',{'events':[event]});second=body['receipts'][0]
            assert second['disposition']=='DUPLICATE'
            for key in ('store_id','store_seq','event_fingerprint','accepted_at'):assert first[key]==second[key]
            privileged={**event,'event_id':'20000000-0000-4000-8000-000000000004','origin_seq':2,'definition_id':'learner.evidence.correction.recorded@1','authority_ref':'SYNTHETIC-UNVERIFIED','payload':{'action':'VOID','target_event_id':event['event_id'],'reason_code':'TEST'}}
            assert request('/v1/learner-evidence/batch',{'events':[privileged]})[0]==403
            malformed={**event,'event_id':'20000000-0000-4000-8000-000000000005','origin_seq':3,'definition_id':'learner.response.recorded@1','item_interaction_id':'20000000-0000-4000-8000-000000000006','item_version_id':'item:test','payload':{'response_version':1,'response_kind':'OPTION','response':{'option_index':0,'access_token':'SYNTHETIC-NOT-A-CREDENTIAL'}}}
            status,body=request('/v1/learner-evidence/batch',{'events':[malformed]});assert status==200 and body['receipts'][0]['disposition']=='REJECTED'
            status,body=request('/v1/learner-evidence');assert status==200 and body['events']==[event] and body['store_id']==first['store_id']
            assert request('/v1/learner-evidence?after_store_seq=1')[0]==400
            assert request('/v1/learner-evidence?after_store_seq=1&source_store_id=wrong')[0]==409
            assert request('/v1/learner-evidence?after_store_seq=9007199254740992')[0]==400
            status,body=request('/v1/learner-evidence?after_store_seq=1&source_store_id='+first['store_id']);assert status==200 and body['events']==[]
            (logs/'real-tcp-evidence.json').write_text(json.dumps({'status':'PASS','synthetic_only':True,'observations':observations},indent=2)+'\n')
            results.append({'name':'real-tcp-evidence','status':'PASS','http_cases':len(observations)});(logs/'commands.json').write_text(json.dumps(results,indent=2)+'\n');print('real-tcp-evidence PASS',flush=True)
        finally:
            process.terminate()
            try:process.wait(timeout=3)
            except subprocess.TimeoutExpired:process.kill();process.wait()
run('native-browser',[args.python,'scripts/browser_smoke.py'],allowed=shutil.which('chromedriver') is None)
run('whitespace',['git','diff','--check'])
if (root/'_site').exists():shutil.move(str(root/'_site'),str(logs/'pages-artifact'))
# A completed diagnostic run is not successful if any required check was blocked.
# Keep the result manifest and all logs, but do not return a misleading shell success.
nonpassing = [item['name'] for item in results if item.get('status') != 'PASS']
if nonpassing:
    print('VERIFICATION_INCOMPLETE: ' + ', '.join(nonpassing), flush=True)
    raise SystemExit(2)
print('VERIFICATION_COMPLETE: all recorded checks passed; external merge gates still apply', flush=True)
