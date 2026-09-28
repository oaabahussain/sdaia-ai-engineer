import fs from 'node:fs/promises';
import path from 'node:path';
import { contentHash } from '../../../src/platform-kernel/release/releases.js';

const KINDS=new Set(['expansion','tranche','activation','improvement']);

function assertKind(kind){if(!KINDS.has(kind))throw new Error('Unsupported K2 governance artifact kind')}
function fileFor(root,kind,id){
 assertKind(kind);
 if(typeof id!=='string'||!id)throw new Error('Governance artifact id is required');
 const dir=path.resolve(root,kind);
 return {dir,file:path.join(dir,encodeURIComponent(id)+'.json')};
}
async function read(file){try{return JSON.parse(await fs.readFile(file,'utf8'))}catch(e){if(e.code==='ENOENT')return null;throw e}}

export function createK2GovernanceFileStore(root){
 return{
  async put(kind,id,record){
   const {dir,file}=fileFor(root,kind,id);
   const existing=await read(file);
   if(existing){
    if(contentHash(existing)!==contentHash(record))throw new Error('Immutable K2 governance artifact ID has different body');
    return id;
   }
   await fs.mkdir(dir,{recursive:true});
   const tmp=file+'.tmp';
   await fs.writeFile(tmp,JSON.stringify(record,null,2)+'\n');
   await fs.rename(tmp,file);
   return id;
  },
  async get(kind,id){
   const {file}=fileFor(root,kind,id);
   return read(file);
  },
  async list(kind){
   assertKind(kind);
   const dir=path.resolve(root,kind);
   let entries=[];
   try{entries=await fs.readdir(dir,{withFileTypes:true})}catch(e){if(e.code==='ENOENT')return[];throw e}
   return entries.filter(x=>x.isFile()&&x.name.endsWith('.json')).map(x=>decodeURIComponent(x.name.slice(0,-5))).sort();
  }
 };
}
