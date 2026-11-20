import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';
import {DiscordWorker} from './src/discord-worker.js';

const here=path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path:path.join(here,'.env')});
const controlUrl=String(process.env.AKI_CONTROL_URL||'').replace(/\/$/,'');
const agentToken=process.env.AKI_AGENT_TOKEN||'';
const botToken=process.env.DISCORD_TOKEN||'';
const agentId=process.env.AGENT_ID||os.hostname();
const pollMs=Math.max(3000,Math.min(Number(process.env.POLL_INTERVAL_MS||5000),60000));
const backupDir=path.resolve(here,process.env.BACKUP_DIR||'./data/backups');
const dataDir=path.resolve(here,'./data');
if(!controlUrl||!/^https:\/\//i.test(controlUrl))throw new Error('AKI_CONTROL_URL must be an https URL');
if(agentToken.length<32)throw new Error('AKI_AGENT_TOKEN must have at least 32 characters');
if(!botToken)throw new Error('DISCORD_TOKEN is missing in agent/.env');
async function request(pathname,options={}){
 const response=await fetch(controlUrl+pathname,{...options,headers:{authorization:'Bearer '+agentToken,'content-type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(15000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||data.message||('Control server HTTP '+response.status));
 return data;
}
let botError=null;
const worker=new DiscordWorker({token:botToken,prefix:process.env.PREFIX||'!',backupDir,dataDir,agentId,sendEvent:async(level,message,details)=>{
 try{await request('/agent/event',{method:'POST',body:JSON.stringify({level,message,details})});}catch(e){console.warn('[agent] Could not report event:',e.message);}
}});
try{await worker.start();}catch(e){botError=e.message;console.error('[agent] Discord bot failed:',e.message);}
async function tick(){
 try{
  await request('/agent/heartbeat',{method:'POST',body:JSON.stringify({agentId,version:'3.1.0',host:os.hostname(),bot:{...worker.getStatus(),error:botError},guilds:worker.listGuilds()})});
  const {command}=await request('/agent/commands/next');
  if(!command)return;
  try{const result=await worker.execute(command);await request('/agent/commands/'+encodeURIComponent(command.id)+'/result',{method:'POST',body:JSON.stringify({status:'completed',result})});}
  catch(e){await request('/agent/commands/'+encodeURIComponent(command.id)+'/result',{method:'POST',body:JSON.stringify({status:'failed',error:e.message})}).catch(()=>{});}
 }catch(e){console.warn('[agent] Control connection unavailable:',e.message);}
}
console.log('[agent] Aki Local Agent started on '+os.hostname()+' ('+agentId+')');
console.log('[agent] Control: '+controlUrl);
console.log('[agent] Backups: '+backupDir);
console.log('[agent] Bot token remains local and is never sent to the dashboard.');
await tick();
const timer=setInterval(tick,pollMs);
let stopping=false;
async function shutdown(signal){if(stopping)return;stopping=true;console.log('[agent] Shutdown: '+signal);clearInterval(timer);await worker.stop();process.exit(0);}
process.on('SIGINT',()=>shutdown('SIGINT'));process.on('SIGTERM',()=>shutdown('SIGTERM'));
