#!/usr/bin/env python3
"""AC-13: bounded, real Chromium-on-small-RAM-disk quota integration test.

This is NOT a CDP synthetic quota override. Mount and browser profile are
disposable. Never execute against an existing user profile or a real disk.
"""
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

from browser_smoke import ROOT, BASE, DRIVER, req, execute, wait_driver, wait_http

RAM_DISK_BYTES = 256 * 1024 * 1024
MAX_FILL_MIB = 250


def command(args):
    return subprocess.run(args, check=True, text=True, capture_output=True)


def main():
    if not shutil.which('chromedriver'):
        raise RuntimeError('Chromium quota probe requires chromedriver')
    mount = pathlib.Path(tempfile.mkdtemp(prefix='k4-quota-', dir='/tmp'))
    server = driver = None
    session = None
    mounted = False
    try:
        command(['sudo', 'mount', '-t', 'tmpfs', '-o', 'size=256m,nosuid,nodev', 'tmpfs', str(mount)])
        mounted = True
        command(['sudo', 'chown', f'{os.getuid()}:{os.getgid()}', str(mount)])
        space = os.statvfs(mount)
        actual = space.f_blocks * space.f_frsize
        assert RAM_DISK_BYTES * 0.9 <= actual <= RAM_DISK_BYTES * 1.1, actual
        profile = mount / 'chromium-profile'
        profile.mkdir()
        server = subprocess.Popen([sys.executable, '-m', 'http.server', '4173', '--bind', '127.0.0.1'],
                                  cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        driver = subprocess.Popen([shutil.which('chromedriver'), '--port=9515', '--allowed-ips='],
                                  stdout=subprocess.DEVNULL, stderr=subprocess.STDOUT)
        wait_http(BASE + '/feedback.html')
        wait_driver()
        options = ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage',
                   '--disable-gpu', '--no-first-run', '--no-default-browser-check',
                   '--disable-background-networking', '--disk-cache-size=1048576',
                   '--user-data-dir=' + str(profile)]
        value = req('POST', '/session',
                    {'capabilities': {'alwaysMatch': {'browserName': 'chrome',
                                                     'goog:chromeOptions': {'args': options}}}},
                    timeout=60)
        session = value['sessionId']
        req('POST', f'/session/{session}/timeouts', {'script': 240000})
        req('POST', f'/session/{session}/url', {'url': BASE + '/feedback.html?quota=real'})
        outcome = req('POST', f'/session/{session}/execute/sync', {'script': """
          return (async()=>{
            const learner='learner:physical-quota-probe';
            const {createSchedulingPreferencesStore}=await import('./src/recommendations/preferencesStore.js');
            const store=createSchedulingPreferencesStore({indexedDB,dbName:'k4-ac13-preferences'});
            const initial=await store.read(learner);
            if(initial.persisted)throw Error('fresh profile already has saved learner state');
            const before=await navigator.storage.estimate();
            // Chromium may report a minimum origin quota larger than the
            // 256 MiB RAM disk. The kernel-backed mount, not estimate(),
            // enforces the real physical limit for this experiment.
            const database=await new Promise((resolve,reject)=>{
              const op=indexedDB.open('k4-ac13-fill',1);
              op.onupgradeneeded=()=>op.result.createObjectStore('blobs');
              op.onerror=()=>reject(op.error);
              op.onsuccess=()=>resolve(op.result);
            });
            const fill=async(size,key)=>{
              const bytes=new Uint8Array(size);
              for(let i=0;i<size;i+=65536)
                crypto.getRandomValues(bytes.subarray(i,Math.min(i+65536,size)));
              return new Promise((resolve,reject)=>{
                let tx;
                try{
                  tx=database.transaction('blobs','readwrite');
                  tx.objectStore('blobs').put(bytes,key);
                  tx.oncomplete=resolve;
                  tx.onabort=()=>reject(tx.error||new DOMException('Quota rejected','AbortError'));
                  tx.onerror=()=>{};
                }catch(error){reject(error)}
              });
            };
            let storedMiB=0,quotaFailure=false,quotaError=null;
            for(let i=0;i<arguments[0];i++){
              try{await fill(1024*1024,'mib-'+i);storedMiB++;}
              catch(error){quotaFailure=true;quotaError=error.name;break;}
            }
            if(!quotaFailure)throw Error('real RAM-disk profile quota not reached within bounded writes');
            // Probe the exact K4 preferences transaction with a new,
            // incompressible value larger than the remaining 1 MiB block.
            const random=new Uint8Array(2*1024*1024);
            for(let i=0;i<random.length;i+=65536)
              crypto.getRandomValues(random.subarray(i,i+65536));
            let text='';
            for(let i=0;i<random.length;i+=8192)
              text+=String.fromCharCode(...random.subarray(i,i+8192));
            const next={...initial.preferences,preferred_domain_id:btoa(text)};
            let persistedReceipt=false,k4Failure=null;
            try{
              const receipt=await store.save({learnerId:learner,expectedRevision:0,next});
              persistedReceipt=receipt.persisted;
            }catch(error){k4Failure=error.name}
            const after=await store.read(learner);
            database.close();
            const usedWhileFull=(await navigator.storage.estimate()).usage;
            if(persistedReceipt||after.persisted||after.preferences.revision!==0)
              throw Error('K4 FALSE PERSISTENCE UNDER REAL QUOTA');
            if(!k4Failure)throw Error('K4 write did not encounter actual storage pressure');
            // Free only this throwaway filler database; test that legitimate
            // preferences can be saved again after storage is available.
            await new Promise((resolve,reject)=>{
              const del=indexedDB.deleteDatabase('k4-ac13-fill');
              del.onsuccess=resolve;
              del.onerror=()=>reject(del.error);
              del.onblocked=()=>reject(Error('quota probe database still open'));
            });
            const recovered=await store.save({
              learnerId:learner,expectedRevision:0,next:initial.preferences
            });
            const verified=await store.read(learner);
            if(!recovered.persisted||!verified.persisted||verified.preferences.revision!==1)
              throw Error('K4 preferences did not recover after actual quota clearance');
            return {quotaFailure,quotaError,storedMiB,beforeQuota:before.quota,
              usedWhileFull,persistedReceipt,k4Failure,
              afterPersisted:after.persisted,afterRevision:after.preferences.revision,
              recovered:recovered.persisted,verifiedRevision:verified.preferences.revision};
          })();
        """, 'args': [MAX_FILL_MIB]}, timeout=250)
        assert outcome['quotaFailure'] and not outcome['persistedReceipt']
        assert outcome['afterPersisted'] is False and outcome['afterRevision'] == 0
        assert outcome['k4Failure'], outcome
        assert outcome['recovered'] and outcome['verifiedRevision'] == 1, outcome
        print('K4_REAL_PHYSICAL_QUOTA: PASS ' + str(outcome))
    finally:
        if session:
            try: req('DELETE', f'/session/{session}', timeout=20)
            except Exception: pass
        for process in (driver, server):
            if process and process.poll() is None:
                process.terminate()
                try: process.wait(timeout=5)
                except subprocess.TimeoutExpired: process.kill()
        if mounted:
            try: command(['sudo', 'umount', str(mount)])
            except Exception as e: print('WARNING: temporary RAM disk unmount: '+str(e), file=sys.stderr)
        shutil.rmtree(mount, ignore_errors=True)


if __name__ == '__main__':
    main()
