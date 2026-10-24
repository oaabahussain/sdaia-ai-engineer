#!/usr/bin/env python3
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.error

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE='http://127.0.0.1:4173'
DRIVER='http://127.0.0.1:9515'
with open(os.path.join(ROOT,'tracks','registry.json'),encoding='utf-8') as f: REGISTRY=json.load(f)
TRACK_ID=REGISTRY['default_track_id']
with open(os.path.join(ROOT,'tracks',TRACK_ID,'manifest.json'),encoding='utf-8') as f: MANIFEST=json.load(f)
with open(os.path.join(ROOT,'tracks',TRACK_ID,'presentation.json'),encoding='utf-8') as f: PRESENTATION=json.load(f)
PROFILES=[]
for profile_path in MANIFEST['exam_profiles']:
    with open(os.path.join(ROOT,profile_path),encoding='utf-8') as f: PROFILES.append(json.load(f))
PROFILE=next((p for p in PROFILES if p['id']==MANIFEST['default_exam_profile']),None)
if PROFILE is None: raise RuntimeError(f"Missing default exam profile {MANIFEST['default_exam_profile']}")
with open(os.path.join(ROOT,'tests','fixtures','runtime','current-bank-counts.expected.json'),encoding='utf-8') as f: BANK_FIXTURE=json.load(f)
EXPECTED_FULL=PROFILE['question_count']
EXPECTED_BANK=BANK_FIXTURE['rendered_questions']

def req(method,path,payload=None,timeout=30):
    data=None if payload is None else json.dumps(payload).encode()
    r=urllib.request.Request(DRIVER+path,data=data,method=method,headers={'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(r,timeout=timeout) as x:
            body=json.loads(x.read().decode() or '{}')
        return body.get('value')
    except urllib.error.HTTPError as e:
        detail=e.read().decode(errors='replace')
        raise RuntimeError(f'WebDriver {method} {path} failed HTTP {e.code}: {detail}') from e

def wait_http(url,timeout=15):
    end=time.time()+timeout
    while time.time()<end:
        try:
            with urllib.request.urlopen(url,timeout=1) as r:
                if r.status==200:return
        except Exception: pass
        time.sleep(.2)
    raise RuntimeError(f'timeout waiting for {url}')

def wait_driver(timeout=15):
    end=time.time()+timeout
    while time.time()<end:
        try:
            with urllib.request.urlopen(DRIVER+'/status',timeout=1) as r:
                if r.status==200:return
        except Exception: pass
        time.sleep(.2)
    raise RuntimeError('chromedriver did not start')

def find(session,css):
    return req('POST',f'/session/{session}/element',{'using':'css selector','value':css})['element-6066-11e4-a52e-4f735466cecf']

def finds(session,css):
    return [x['element-6066-11e4-a52e-4f735466cecf'] for x in req('POST',f'/session/{session}/elements',{'using':'css selector','value':css})]

def text(session,eid): return req('GET',f'/session/{session}/element/{eid}/text')
def click(session,eid): req('POST',f'/session/{session}/element/{eid}/click',{})
def execute(session,script,args=None): return req('POST',f'/session/{session}/execute/sync',{'script':script,'args':args or []})

def wait_until(fn,timeout=15,label='condition'):
    end=time.time()+timeout; last=None
    while time.time()<end:
        try:
            v=fn()
            if v:return v
        except Exception as e:last=e
        time.sleep(.2)
    raise RuntimeError(f'timeout waiting for {label}: {last}')

def durable_evidence_definitions(session):
    required={
        'learner.activity.started@1',
        'learner.item.presented@1',
        'learner.response.recorded@1',
        'learner.confidence.recorded@1'
    }
    state=execute(session,"return window.__k3EvidenceSmoke||null")
    if state and state.get('done'):
        definitions=state.get('definitions') or []
        if required.issubset(set(definitions)):
            return definitions
    execute(session,"""
      window.__k3EvidenceSmoke={done:false,definitions:[],error:null};
      const openRequest=indexedDB.open('learning-platform.evidence.v1.'+arguments[0],2);
      openRequest.onerror=()=>{window.__k3EvidenceSmoke={done:true,definitions:[],error:String(openRequest.error||'open failed')};};
      openRequest.onsuccess=()=>{
        const db=openRequest.result;
        try{
          const tx=db.transaction('events','readonly');
          const all=tx.objectStore('events').getAll();
          all.onerror=()=>{window.__k3EvidenceSmoke={done:true,definitions:[],error:String(all.error||'getAll failed')};db.close();};
          all.onsuccess=()=>{
            window.__k3EvidenceSmoke={
              done:true,
              definitions:(all.result||[]).map(row=>row.definition_id),
              error:null
            };
            db.close();
          };
        }catch(error){
          window.__k3EvidenceSmoke={done:true,definitions:[],error:String(error)};
          db.close();
        }
      };
      return true;
    """,[TRACK_ID])
    return None

def start_server():
    return subprocess.Popen([sys.executable,'-m','http.server','4173','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)

def main():
    chromedriver=shutil.which('chromedriver')
    if not chromedriver:
        raise RuntimeError('chromedriver not found on runner')
    server=start_server()
    driver=subprocess.Popen([chromedriver,'--port=9515','--allowed-ips='],stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
    session=None
    try:
        wait_http(BASE+'/index.html'); wait_http(BASE+'/feedback.html'); wait_driver()
        value=req('POST','/session',{'capabilities':{'alwaysMatch':{'browserName':'chrome','goog:chromeOptions':{'args':['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--window-size=1400,1000']}}}},timeout=60)
        session=value['sessionId'] if isinstance(value,dict) and 'sessionId' in value else None
        if not session: raise RuntimeError(f'no webdriver session id: {value}')
        # Install the new service worker from feedback.html so app/evidence modules are not warmed by page execution.
        # Then prove the first new-version navigation can boot fully offline from the install-time cache.
        req('POST',f'/session/{session}/url',{'url':BASE+'/feedback.html?sw-install=1'})
        wait_until(lambda:len(finds(session,'.feedback-card'))==3,label='feedback-only service-worker install page')
        wait_until(lambda:execute(session,"return !!navigator.serviceWorker && !!navigator.serviceWorker.controller"),timeout=20,label='service worker controller before first app navigation')
        # Simulate the already-used current content cache without warming any new K3 app/evidence module.
        runtime_content=[*MANIFEST['content']['concept_files'],MANIFEST['content']['learn'],MANIFEST['content']['cases']]
        warmed=execute(session,"return Promise.all(arguments[0].map(path=>fetch('./'+path,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(path+':'+r.status);return r.status;})))",[runtime_content])
        assert len(warmed)==len(runtime_content), warmed
        server.terminate()
        server.wait(timeout=5)
        req('POST',f'/session/{session}/url',{'url':BASE+'/index.html?first-new-version-navigation-offline=1'})
        wait_until(lambda:execute(session,"return document.getElementById('bankCount')?.textContent")==str(EXPECTED_BANK),timeout=20,label='first new-version navigation offline')
        assert execute(session,"return document.getElementById('errorBox').classList.contains('show')") is False
        # K5 first-entry offline must resolve verified activity before any online visit.
        # A newly imported module missing from the precache must fail this assertion.
        wait_until(lambda:execute(session,
          "return document.getElementById('k5HomeCard').getAttribute('data-k5-status')==='NO_OBSERVATIONS'"),
          timeout=20,label='K5 first feedback-installed service worker offline boot')
        assert execute(session,"return document.getElementById('k5HomeCard').getAttribute('data-k5-status')")!='SOURCE_INVALID', 'new privacy module must be cached during service-worker install'
        server=start_server()
        wait_http(BASE+'/index.html')
        req('POST',f'/session/{session}/url',{'url':BASE+'/index.html?smoke=1'})
        execute(session,"localStorage.setItem('learning-platform.track-id.v1','stale-fixture-track')")
        req('POST',f'/session/{session}/refresh',{})
        wait_until(lambda:text(session,find(session,'#bankCount'))==str(EXPECTED_BANK),label='profile bank count')
        assert 'سؤال' in text(session,find(session,'body'))
        first_domain=next(iter(PROFILE['weights']))
        ar=PRESENTATION['locales']['ar']
        assert text(session,find(session,'#brandText'))==ar['brand']
        assert text(session,find(session,'#heroTitle'))==ar['hero']['title']
        assert text(session,find(session,'.domainCard h3'))==ar['domain_labels'][first_domain]
        assert execute(session,"return document.documentElement.dir")=='rtl'
        click(session,find(session,'#langBtn'))
        en=PRESENTATION['locales']['en']
        wait_until(lambda:text(session,find(session,'#heroTitle'))==en['hero']['title'],label='English presentation')
        assert text(session,find(session,'#brandText'))==en['brand']
        assert text(session,find(session,'.domainCard h3'))==en['domain_labels'][first_domain]
        assert execute(session,"return document.documentElement.dir")=='ltr'
        before=execute(session,"return document.documentElement.dataset.theme")
        click(session,find(session,'#themeBtn'))
        after=execute(session,"return document.documentElement.dataset.theme")
        assert before!=after, (before,after)
        # K5_CROSS_RUNTIME: compare real Chromium DOM to an independently executed Node projection.
        node_k5=json.loads(subprocess.check_output(
            ['node','scripts/k5_empty_projection_fixture.js'],cwd=ROOT,text=True))
        assert node_k5['status']=='NO_OBSERVATIONS'
        assert node_k5['count']==0
        # K5_BROWSER_ACCEPTANCE: verify the real descriptive-only learner home, not HTML source text.
        wait_until(lambda:len(finds(session,'#k5HomeCard h2'))==1,label='K5 recorded activity card')
        assert text(session,find(session,'#k5HomeCard h2'))=='Recorded activity'
        assert text(session,find(session,'#k5HomeCard h2'))==node_k5['heading']
        assert node_k5['body'] in text(session,find(session,'#k5HomeCard'))
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('data-k5-status')")==node_k5['status']
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('data-k5-status')")=='NO_OBSERVATIONS', 'K5 source must be verified on fresh browser'
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('aria-live')")=='polite'
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('role')")=='region'
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('dir')")=='ltr'
        assert 'readiness estimates are not available' in text(session,find(session,'#k5HomeCard')).lower()
        assert '%' not in text(session,find(session,'#k5HomeCard'))
        click(session,find(session,'#langBtn'))
        wait_until(lambda:text(session,find(session,'#k5HomeCard h2'))=='النشاط المسجل',label='K5 Arabic locale')
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('dir')")=='rtl'
        click(session,find(session,'#langBtn'))
        wait_until(lambda:text(session,find(session,'#k5HomeCard h2'))=='Recorded activity',label='K5 English locale restored')
        # K4_BROWSER_ACCEPTANCE: test the real single-question screen, not a stub.
        wait_until(lambda:len(finds(session,'#k4HomeCard button'))>=4,label='K4 public card')
        assert 'Practice one question' in text(session,find(session,'#k4HomeCard'))
        assert execute(session,"return document.documentElement.dir")=='ltr'
        assert execute(session,"const b=document.querySelector('#k4HomeCard button');b.focus();return document.activeElement===b"), 'K4 keyboard focus must work'
        click(session,find(session,'#k4HomeCard button'))
        wait_until(lambda:execute(session,"return document.getElementById('k4Practice').classList.contains('active')"),label='K4 practice screen')
        assert len(finds(session,'#k4Practice .option'))==4
        assert 'Practice one question' in text(session,find(session,'#k4Practice'))
        assert 'readiness' not in text(session,find(session,'#k4Practice')).lower()
        click(session,find(session,'#k4Practice .option'))
        wait_until(lambda:'Response saved locally' in text(session,find(session,'#k4Practice')),label='K4 durable response receipt')
        click(session,find(session,'#k4Practice button:last-child'))
        wait_until(lambda:execute(session,"return document.getElementById('home').classList.contains('active')"),label='K4 return to public home')
        # K4 Close must repaint K5 from the newly durable K3 presentation, not wait for a locale/Home click.
        wait_until(lambda:execute(session,
          "return document.getElementById('k5HomeCard').getAttribute('data-k5-status')==='OBSERVATIONS_PRESENT'"),
          timeout=20,label='K5 recorded activity refreshed on K4 Close')
        assert '%' not in text(session,find(session,'#k5HomeCard')), 'K5 readout must remain nonnumeric'
        previous_family=wait_until(
            lambda: execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')"),
            label='K4 refreshed action after first practice close'
        )
        wait_until(lambda:len(finds(session,'#k4HomeCard button'))>=4,label='K4 refreshed alternative controls')
        click(session,find(session,'#k4HomeCard button:nth-of-type(3)'))
        alternate_family=wait_until(
            lambda: execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')"),
            label='K4 alternate family ID assigned'
        )
        wait_until(
            lambda: execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')")!=previous_family,
            label='K4 alternate public family selection completed'
        )
        alternate_family=execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')")
        assert alternate_family and alternate_family!=previous_family, 'K4 another must choose a different public family'
        assert execute(session,"const b=document.querySelector('#k4HomeCard button'); if(!b)return false;b.click();return true"), 'K4 alternate start button missing'
        wait_until(lambda:len(finds(session,'#k4Practice .option'))==4,label='K4 alternate practice')
        click(session,find(session,'#langBtn'))
        wait_until(lambda:execute(session,"return document.documentElement.dir")=='rtl',label='K4 Arabic rtl')
        assert 'تدريب سؤال واحد' in text(session,find(session,'#k4Practice'))
        assert len(finds(session,'#k4Practice .option'))==4
        click(session,find(session,'#langBtn'))
        wait_until(lambda:execute(session,"return document.documentElement.dir")=='ltr',label='K4 English ltr')
        click(session,find(session,'#k4Practice button:last-child'))
        # AC-13: K4 canonical preferences now share the K3 evidence database.
        # Deny that actual transactional port in Chromium (not the legacy DB).
        # A failed K4 snooze must still show an error without a false receipt.
        # Close now replays evidence asynchronously; wait for the new actionable card.
        active_family=wait_until(
            lambda: execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')"),
            label='K4 new action after closing alternative'
        )
        wait_until(lambda:len(finds(session,'#k4HomeCard button'))>=4,label='K4 refreshed action controls')
        assert execute(session,"""
          window.__k4OriginalOpen=indexedDB.open;
          indexedDB.open=function(name,...args){
            if(String(name).includes('.evidence.v1.'))throw new DOMException('K4 canonical preference storage denied','QuotaExceededError');
            return window.__k4OriginalOpen.call(this,name,...args);
          };
          return true;
        """)
        click(session,find(session,'#k4HomeCard button:nth-of-type(4)'))
        wait_until(lambda:'Local preference storage failed' in text(session,find(session,'#k4HomeCard')),label='K4 browser denied IndexedDB without false save')
        assert execute(session,"return document.getElementById('k4HomeCard').getAttribute('data-k4-family-id')")==active_family
        assert execute(session,"indexedDB.open=window.__k4OriginalOpen;delete window.__k4OriginalOpen;return true")
        req('POST',f'/session/{session}/window/rect',{'width':390,'height':844})
        assert execute(session,"return window.innerWidth<=450"), 'K4 mobile viewport'
        assert execute(session,"return document.getElementById('k4HomeCard').getBoundingClientRect().width<=document.documentElement.clientWidth+1"), 'K4 responsive card'
        assert execute(session,"return document.getElementById('k5HomeCard').getBoundingClientRect().width<=document.documentElement.clientWidth+1"), 'K5 responsive activity region'
        req('POST',f'/session/{session}/window/rect',{'width':1400,'height':1000})
        started=execute(session,"const b=document.getElementById('startFullBtn'); if(!b) return false; b.click(); return true;")
        assert started is True
        wait_until(lambda:f'1 of {EXPECTED_FULL}' in text(session,find(session,'#questionCounter')),label='profile-sized full exam')
        opts=finds(session,'#options .option'); assert len(opts)==4
        first_option_text=text(session,opts[0]); click(session,opts[0])
        click(session,find(session,'.confBtn[data-confidence="high"]'))
        # Acceptance gate: prove fine-grained durable learner evidence reached the governed IndexedDB store.
        evidence_defs=wait_until(lambda:durable_evidence_definitions(session),timeout=20,label='durable learner evidence')
        for definition in [
            'learner.activity.started@1',
            'learner.item.presented@1',
            'learner.response.recorded@1',
            'learner.confidence.recorded@1'
        ]:
            assert definition in evidence_defs, (definition,evidence_defs)
        next_ok=execute(session,"const b=document.getElementById('nextBtn'); if(!b||b.disabled) return false; b.click(); return true;")
        assert next_ok is True
        click(session,find(session,'#flagBtn'))
        q2_order=[text(session,e) for e in finds(session,'#options .option')]
        wait_until(lambda:f'2 of {EXPECTED_FULL}' in text(session,find(session,'#questionCounter')),label='next without confidence')
        assert len(finds(session,'#palette .qjump'))==EXPECTED_FULL
        req('POST',f'/session/{session}/refresh',{})
        wait_until(lambda:execute(session,"return document.getElementById('resumeBox').classList.contains('show')"),label='resume card after reload')
        click(session,find(session,'#resumeBtn'))
        wait_until(lambda:f'2 of {EXPECTED_FULL}' in text(session,find(session,'#questionCounter')),label='resume current index')
        assert [text(session,e) for e in finds(session,'#options .option')]==q2_order
        assert 'Remove flag' in text(session,find(session,'#flagBtn'))
        click(session,find(session,'#prevBtn'))
        wait_until(lambda:f'1 of {EXPECTED_FULL}' in text(session,find(session,'#questionCounter')),label='previous answered question')
        assert len(finds(session,'#options .option.selected'))==1
        assert text(session,find(session,'#options .option.selected')).endswith(first_option_text.split('\n',1)[-1])
        assert execute(session,"return document.querySelector('.confBtn[data-confidence=\"high\"]').classList.contains('on')")
        click(session,find(session,'#homeBtn'))
        wait_until(lambda:len(finds(session,'.startSection'))>0,label='section actions')
        execute(session,"const s=document.querySelector('.sectionCount'); const preferred=[...s.options].find(o=>o.value!=='all'); s.value=preferred.value; document.querySelector('.startSection').click();")
        wait_until(lambda:execute(session,"return document.getElementById('examModeLabel').textContent")== 'Domain exam',label='section exam started')
        click(session,find(session,'#submitBtn'))
        req('POST',f'/session/{session}/alert/accept',{})
        wait_until(lambda:len(finds(session,'#reviewList .reviewItem'))>0,label='results review rendered')
        click(session,find(session,'#newExamBtn'))
        wait_until(lambda:len(finds(session,'.startSection'))>0 and len(finds(session,'#startFullBtn'))==1,label='exam modes available after results')
        wait_until(lambda:execute(session,"return !!navigator.serviceWorker && !!navigator.serviceWorker.controller"),timeout=20,label='service worker controller')
        req('POST',f'/session/{session}/refresh',{})
        wait_until(lambda:execute(session,"return document.getElementById('bankCount').textContent")==str(EXPECTED_BANK),label='controlled online reload')
        assert text(session,find(session,'#brandText'))==PRESENTATION['locales']['en']['brand']
        server.terminate()
        server.wait(timeout=5)
        req('POST',f'/session/{session}/refresh',{})
        wait_until(lambda:execute(session,"return document.getElementById('bankCount').textContent")==str(EXPECTED_BANK),timeout=20,label='offline cached home reload')
        assert text(session,find(session,'#brandText'))==PRESENTATION['locales']['en']['brand']
        assert text(session,find(session,'.domainCard h3'))==PRESENTATION['locales']['en']['domain_labels'][first_domain]
        # K5_OFFLINE_ACCEPTANCE: actual new modules and verified read-only summary boot without network.
        wait_until(lambda:text(session,find(session,'#k5HomeCard h2'))=='Recorded activity',label='K5 offline activity summary')
        assert execute(session,"return document.getElementById('k5HomeCard').getAttribute('data-k5-status')")!='SOURCE_INVALID', 'K5 offline source must remain verified'
        assert '%' not in text(session,find(session,'#k5HomeCard')), 'K5 offline page cannot display readiness percent'
        # K4_OFFLINE_ACCEPTANCE: new public policy and modules work from the installed cache.
        wait_until(lambda:len(finds(session,'#k4HomeCard button'))>=4,label='K4 offline public card')
        click(session,find(session,'#k4HomeCard button'))
        wait_until(lambda:len(finds(session,'#k4Practice .option'))==4,label='K4 offline practice view')
        click(session,find(session,'#k4Practice button:last-child'))

        req('POST',f'/session/{session}/url',{'url':BASE+'/feedback.html'})
        wait_until(lambda:len(finds(session,'.feedback-card'))==3,label='three feedback cards')
        wait_until(lambda:text(session,find(session,'#feedbackBrand'))==PRESENTATION['locales']['en']['brand'],label='feedback presentation brand')
        assert execute(session,"return document.title")==PRESENTATION['locales']['en']['display_name']+' · Community'
        assert text(session,find(session,'[data-i18n="suggestionTitle"]'))=='Suggest an improvement'
        assert find(session,'#suggestionForm')
        assert find(session,'#contributionForm')
        assert find(session,'#ratingForm')
        assert len(finds(session,'#stars .star'))==5
        execute(session,"window.__opened=[]; window.open=(url,target,features)=>{window.__opened.push({url,target,features}); return null;};")
        execute(session,"document.getElementById('suggestionTitleInput').value='Offline feedback title';document.getElementById('suggestionDetails').value='Suggestion body keeps typed text';document.getElementById('suggestionForm').requestSubmit();")
        suggestion_url=execute(session,"return window.__opened.at(-1)?.url||''")
        assert suggestion_url.startswith('https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?')
        assert 'template=public-feedback.md' in suggestion_url
        assert 'Offline+feedback+title' in suggestion_url
        assert 'Suggestion+body+keeps+typed+text' in suggestion_url
        execute(session,"document.getElementById('contributionDetails').value='Contribution body survives';document.getElementById('contributionSource').value='https://example.com/reference';document.getElementById('contributionForm').requestSubmit();")
        contribution_url=execute(session,"return window.__opened.at(-1)?.url||''")
        assert contribution_url.startswith('https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?')
        assert 'template=public-feedback.md' in contribution_url
        assert 'Contribution+body+survives' in contribution_url
        assert 'https%3A%2F%2Fexample.com%2Freference' in contribution_url
        execute(session,"document.querySelector('.star[data-rating=\"5\"]').click();document.getElementById('ratingComment').value='Rating comment survives';document.getElementById('ratingForm').requestSubmit();")
        rating_url=execute(session,"return window.__opened.at(-1)?.url||''")
        assert rating_url.startswith('https://github.com/oaabahussain/sdaia-ai-engineer/issues/new?')
        assert 'template=public-feedback.md' in rating_url
        assert 'Rating+comment+survives' in rating_url
        # K5 independent fallback: K4 bootstrap errors must not leave an
        # indefinitely 'verifying' K5 card. Isolate failure to K4 policy fetch.
        server=start_server()
        wait_http(BASE+'/index.html')
        req('POST',f'/session/{session}/goog/cdp/execute',{
            'cmd':'Page.addScriptToEvaluateOnNewDocument',
            'params':{'source':"""
              const priorFetch=window.fetch.bind(window);
              window.fetch=function(resource,options){
                if(String(resource).includes('k4-rule-policy-v1.json'))
                  return Promise.reject(new Error('synthetic K4-only bootstrap failure'));
                return priorFetch(resource,options);
              };
            """}
        })
        req('POST',f'/session/{session}/url',{'url':BASE+'/index.html?k5-fallback-on-k4-failure=1'})
        wait_until(lambda:text(session,find(session,'#bankCount'))==str(EXPECTED_BANK),
                   label='public bank loads when K4 policy fetch fails')
        wait_until(lambda:len(text(session,find(session,'#k4HomeCard')))>10,
                   label='K4 displays its offline failure fallback')
        wait_until(lambda:execute(session,
          "return document.getElementById('k5HomeCard').getAttribute('data-k5-status')==='SOURCE_INVALID'"),
          label='K5 must explicitly fail closed on K4 startup failure')
        assert 'verifying' not in text(session,find(session,'#k5HomeCard')).lower()
        assert '%' not in text(session,find(session,'#k5HomeCard'))
        # P2: the K5 fail-closed fallback must update with app locale
        # even when the K5 controller never initialized.
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('lang')")=='en'
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('aria-label')")=='Recorded activity', 'English fallback region must have English accessible name'
        click(session,find(session,'#langBtn'))
        wait_until(lambda:execute(session,"return document.documentElement.lang")=='ar',
                   label='Arabic locale after failed K4 bootstrap')
        wait_until(lambda:execute(session,
            "return document.querySelector('#k5HomeCard').getAttribute('lang')==='ar'"),
            label='K5 fallback reflects Arabic language switch')
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('dir')")=='rtl'
        assert 'لا يمكن التحقق' in text(session,find(session,'#k5HomeCard'))
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('aria-label')")=='النشاط المسجل', 'Arabic fallback region must have Arabic accessible name'
        click(session,find(session,'#langBtn'))
        wait_until(lambda:execute(session,
            "return document.querySelector('#k5HomeCard').getAttribute('lang')==='en'"),
            label='K5 fallback reflects English language switch')
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('dir')")=='ltr'
        assert 'Recorded activity cannot be verified' in text(session,find(session,'#k5HomeCard'))
        assert execute(session,"return document.querySelector('#k5HomeCard').getAttribute('aria-label')")=='Recorded activity', 'Restored English fallback must update accessible name'

        print(f'BROWSER_SMOKE: PASS bank={EXPECTED_BANK} bilingual=PASS theme=PASS full_exam={EXPECTED_FULL} confidence_optional=PASS durable_learner_evidence=PASS offline_cached_reload=PASS feedback_urls=PASS presentation=PASS')
    finally:
        if session:
            try:req('DELETE',f'/session/{session}')
            except Exception:pass
        driver.terminate()
        if server.poll() is None: server.terminate()
        try:driver.wait(timeout=3)
        except Exception:driver.kill()
        try:server.wait(timeout=3)
        except Exception:server.kill()

if __name__=='__main__': main()
