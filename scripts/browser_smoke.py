#!/usr/bin/env python3
import json, os, shutil, subprocess, sys, time, urllib.request, urllib.error

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE='http://127.0.0.1:4173'
DRIVER='http://127.0.0.1:9515'

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
        wait_http(BASE+'/index.html'); wait_driver()
        value=req('POST','/session',{'capabilities':{'alwaysMatch':{'browserName':'chrome','goog:chromeOptions':{'args':['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--window-size=1400,1000']}}}},timeout=60)
        session=value['sessionId'] if isinstance(value,dict) and 'sessionId' in value else None
        if not session: raise RuntimeError(f'no webdriver session id: {value}')
        req('POST',f'/session/{session}/url',{'url':BASE+'/index.html?smoke=1'})
        wait_until(lambda:text(session,find(session,'#bankCount'))=='1120',label='1120 bank count')
        assert 'سؤال' in text(session,find(session,'body'))
        click(session,find(session,'#langBtn'))
        wait_until(lambda:'Practice like an exam' in text(session,find(session,'#home')),label='English UI')
        before=execute(session,"return document.documentElement.dataset.theme")
        click(session,find(session,'#themeBtn'))
        after=execute(session,"return document.documentElement.dataset.theme")
        assert before!=after, (before,after)
        # Trigger the same DOM click handler from inside the real browser. This avoids
        # headless Chrome geometry/interception quirks while still exercising app code.
        started=execute(session,"const b=document.getElementById('startFullBtn'); if(!b) return false; b.click(); return true;")
        assert started is True
        wait_until(lambda:'1 of 200' in text(session,find(session,'#questionCounter')),label='200-question exam')
        opts=finds(session,'#options .option'); assert len(opts)==4
        click(session,opts[0])
        # Confidence is deliberately left blank. Moving on must still work.
        next_ok=execute(session,"const b=document.getElementById('nextBtn'); if(!b||b.disabled) return false; b.click(); return true;")
        assert next_ok is True
        wait_until(lambda:'2 of 200' in text(session,find(session,'#questionCounter')),label='next without confidence')
        assert len(finds(session,'#palette .qjump'))==200
        print('BROWSER_SMOKE: PASS bank=1120 bilingual=PASS theme=PASS full_exam=200 confidence_optional=PASS palette=200')
    finally:
        if session:
            try:req('DELETE',f'/session/{session}')
            except Exception:pass
        driver.terminate(); server.terminate()
        try:driver.wait(timeout=3)
        except Exception:driver.kill()
        try:server.wait(timeout=3)
        except Exception:server.kill()

if __name__=='__main__': main()
