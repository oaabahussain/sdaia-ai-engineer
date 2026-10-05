import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const uri=require('fast-uri');
test('unused Redocly CLI and its vulnerable toolchain are not release dependencies',()=>{
 const manifest=JSON.parse(readFileSync('package.json','utf8')),lock=JSON.parse(readFileSync('package-lock.json','utf8'));
 assert.equal(manifest.devDependencies['@redocly/cli'],undefined);
 assert.ok(Object.keys(lock.packages).every(path=>!path.includes('@redocly/')));
});
test('URI dependency folds decoded host case without changing reserved escapes',()=>{
 assert.equal(uri.parse('//%41.com').host,'a.com');
 assert.equal(uri.equal('//%41.com','//a.com'),true);
 assert.equal(uri.parse('//example%2f.test').host,'example%2F.test');
});
test('URI dependency preserves port-delimiter rejection and encoded authority safety',()=>{
 assert.throws(()=>uri.serialize({scheme:'http',host:'example.test',port:'@other.test:80',path:'/'}));
 assert.notEqual(uri.normalize('http://example.test%40other.test/'),'http://example.test@other.test/');
});
