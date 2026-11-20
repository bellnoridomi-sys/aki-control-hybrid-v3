import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
export async function ensureDir(dir){await fs.mkdir(dir,{recursive:true});}
export async function readJson(file,fallback){try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw e;}}
export async function writeJsonAtomic(file,value){await ensureDir(path.dirname(file));const tmp=file+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(tmp,JSON.stringify(value,null,2)+'\n',{flag:'wx',mode:0o600});await fs.rename(tmp,file);}
export function sha256(value){return crypto.createHash('sha256').update(value).digest('hex');}
