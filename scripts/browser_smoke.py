#!/usr/bin/env python3
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.error

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE='http://127.0.0.1:4173'
DRIVER='http://127.0.0.1:9515'
TRACK_ID='sdaia-ai-engineer'
with open(os.path.join(ROOT,'tracks',TRACK_ID,'manifest.json'),encoding='utf-8') as f: MANIFEST=json.load(f)
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

def main():
    chromedriver=shutil.which('chromedriver')
    if not chromedriver:
        raise RuntimeError('chromedriver not found on runner')
    server=subprocess.Popen([sys.executable,'-m','http.server','4173','--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
    driver=subprocess.Popen([chromedriver,'--port=9515','--allowed-ips='],stdout=subprocess.DEVNULL,stderr=subprocess.STDOUT)
    session=None
    try:
        wait_http(BASE+'/index.html'); wait_http(BASE+'/feedback.html'); wait_driver()
        value=req('POST','/session',{'capabilities':{'alwaysMatch':{'browserName':'chrome','goog:chromeOptions':{'args':['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--window-size=1400,1000']}}}},timeout=60)
        session=value['sessionId'] if isinstance(value,dict) and 'sessionId' in value else None
        if not session: raise RuntimeError(f'no webdriver session id: {value}')
        req('POST',f'/session/{session}/url',{'url':BASE+'/index.html?smoke=1'})
        wait_until(lambda:text(session,find(session,'#bankCount'))==str(EXPECTED_BANK),label='profile bank count')
        assert 'سؤال' in text(session,find(session,'body'))
        click(session,find(session,'#langBtn'))
        wait_until(lambda:'Practice like an exam' in text(session,find(session,'#home')),label='English UI')
        before=execute(session,"return document.documentElement.dataset.theme")
        click(session,find(session,'#themeBtn'))
        after=execute(session,"return document.documentElement.dataset.theme")
        assert before!=after, (before,after)
        started=execute(session,"const b=document.getElementById('startFullBtn'); if(!b) return false; b.click(); return true;")
        assert started is True
        wait_until(lambda:f'1 of {EXPECTED_FULL}' in text(session,find(session,'#questionCounter')),label='profile-sized full exam')
        opts=finds(session,'#options .option'); assert len(opts)==4
        first_option_text=text(session,opts[0]); click(session,opts[0])
        click(session,find(session,'.confBtn[data-confidence="high"]'))
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
        server.terminate()
        server.wait(timeout=5)
        req('POST',f'/session/{session}/refresh',{})
        wait_until(lambda:execute(session,"return document.getElementById('bankCount').textContent")==str(EXPECTED_BANK),timeout=20,label='offline cached home reload')
        req('POST',f'/session/{session}/url',{'url':BASE+'/feedback.html'})
        wait_until(lambda:len(finds(session,'.feedback-card'))==3,label='three feedback cards')
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
        print(f'BROWSER_SMOKE: PASS bank={EXPECTED_BANK} bilingual=PASS theme=PASS full_exam={EXPECTED_FULL} confidence_optional=PASS offline_cached_reload=PASS feedback_urls=PASS')
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
