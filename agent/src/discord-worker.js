import {Client,Events,GatewayIntentBits,PermissionFlagsBits,ChannelType,ActionRowBuilder,ButtonBuilder,ButtonStyle,EmbedBuilder,AuditLogEvent} from 'discord.js';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';
import {ensureDir,readJson,writeJsonAtomic,sha256} from './store.js';
const TEMPLATE=[
 {name:'INFORMATION',channels:['welcome','rules','announcements','server-info']},
 {name:'COMMUNITY',channels:['general','media','memes','suggestions']},
 {name:'SUPPORT CENTER',channels:['support','report','feedback']},
 {name:'STAFF',channels:['staff-chat','staff-logs']},
 {name:'SECURITY',channels:['antinuke-logs','security-alerts','backup-logs']}
];
const defaults=()=>({enabled:false,mode:'monitor',thresholds:{channelDelete:3,roleDelete:3,ban:5,windowSeconds:10},whitelist:[]});
const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Math.round(Number(v)))):fallback;
const slug=s=>String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'').slice(0,90);
export class DiscordWorker{
 constructor({token,prefix='!',backupDir,dataDir,agentId,sendEvent}){this.token=token;this.prefix=prefix;this.backupDir=path.resolve(backupDir);this.dataDir=path.resolve(dataDir);this.agentId=agentId;this.sendEvent=sendEvent;this.client=null;this.windows=new Map();this.startedAt=Date.now();this.configFile=path.join(this.dataDir,'config.json');this.ticketFile=path.join(this.dataDir,'tickets.json');}
 async start(){
  await ensureDir(this.backupDir);await ensureDir(this.dataDir);
  this.config=await readJson(this.configFile,{prefix:this.prefix,security:{}});
  this.tickets=await readJson(this.ticketFile,[]);
  this.client=new Client({intents:[GatewayIntentBits.Guilds,GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildModeration,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});
  this.client.once(Events.ClientReady,c=>console.log('[agent] Discord Gateway ready as '+c.user.tag));
  this.client.on(Events.MessageCreate,m=>this.onMessage(m).catch(e=>console.error('[agent] command:',e.message)));
  this.client.on(Events.InteractionCreate,i=>this.onInteraction(i).catch(e=>console.error('[agent] ticket:',e.message)));
  this.client.on(Events.ChannelDelete,c=>this.observe(c.guild,'channelDelete',c.id).catch(e=>console.warn(e.message)));
  this.client.on(Events.GuildRoleDelete,r=>this.observe(r.guild,'roleDelete',r.id).catch(e=>console.warn(e.message)));
  this.client.on(Events.GuildBanAdd,b=>this.observe(b.guild,'ban',b.user.id).catch(e=>console.warn(e.message)));
  this.client.on(Events.Error,e=>console.error('[discord-gateway]',e.message));
  await this.client.login(this.token);
 }
 getStatus(){return{ready:Boolean(this.client?.isReady()),tag:this.client?.user?.tag||null,userId:this.client?.user?.id||null,guildCount:this.client?.guilds.cache.size||0,startedAt:new Date(this.startedAt).toISOString()};}
 listGuilds(){return this.client?.guilds.cache.map(g=>({id:g.id,name:g.name,memberCount:g.memberCount||0}))||[];}
 async getGuild(id){if(!id)throw new Error('Guild ID is required');const g=await this.client.guilds.fetch(id);await g.fetch();return g;}
 async execute(cmd){
  if(cmd.type==='agent.ping')return{message:'Local Agent và Discord Gateway đang phản hồi.',agentId:this.agentId,bot:this.getStatus(),host:os.hostname()};
  const g=await this.getGuild(cmd.guildId);
  switch(cmd.type){
   case 'guild.scan':{const [roles,channels]=await Promise.all([g.roles.fetch(),g.channels.fetch()]);return{message:'Quét server thành công.',guild:{id:g.id,name:g.name,memberCount:g.memberCount},roles:roles.size,channels:channels.size,categories:channels.filter(c=>c?.type===ChannelType.GuildCategory).size};}
   case 'backup.create':return this.createBackup(g,cmd.actorId);
   case 'backup.list':return{message:'Backup lưu cục bộ trên PC.',backups:await this.listBackups(g.id)};
   case 'security.configure':return this.setSecurity(g.id,cmd.payload||{});
   case 'security.status':return{message:'Cấu hình Anti-Nuke trên PC.',security:this.config.security[g.id]||defaults()};
   case 'server.setup.preview':return{message:'Preview cấu trúc server.',template:TEMPLATE};
   case 'server.setup.apply':return this.applyTemplate(g);
   case 'ticket.panel.create':return this.createTicketPanel(g,cmd.payload||{});
   default:throw new Error('Unsupported command: '+cmd.type);
  }
 }
 async createBackup(g,actorId){
  const [roles,channels]=await Promise.all([g.roles.fetch(),g.channels.fetch()]);
  const id=new Date().toISOString().replace(/[:.]/g,'-')+'-'+Math.random().toString(16).slice(2,8);
  const snapshot={schemaVersion:1,backupId:id,guildId:g.id,guildName:g.name,createdAt:new Date().toISOString(),createdBy:actorId||null,note:'Snapshot cấu trúc; không gồm lịch sử tin nhắn hoặc tài khoản thành viên.',roles:roles.map(r=>({id:r.id,name:r.name,color:r.hexColor,hoist:r.hoist,position:r.position,permissions:r.permissions.bitfield.toString(),managed:r.managed,mentionable:r.mentionable})),channels:channels.filter(Boolean).map(c=>({id:c.id,name:c.name,type:c.type,parentId:c.parentId,position:c.position,topic:c.topic||null,nsfw:Boolean(c.nsfw),rateLimitPerUser:c.rateLimitPerUser||0,permissionOverwrites:c.permissionOverwrites?.cache.map(o=>({id:o.id,type:o.type,allow:o.allow.bitfield.toString(),deny:o.deny.bitfield.toString()}))||[]}))};
  const dir=path.join(this.backupDir,g.id);await ensureDir(dir);const raw=JSON.stringify(snapshot,null,2)+'\n';const file=path.join(dir,id+'.json');
  await fs.writeFile(file+'.tmp',raw,{flag:'wx',mode:0o600});await fs.rename(file+'.tmp',file);
  const manifest={backupId:id,fileName:path.basename(file),guildId:g.id,createdAt:snapshot.createdAt,roles:snapshot.roles.length,channels:snapshot.channels.length,sha256:sha256(raw)};
  await fs.writeFile(path.join(dir,id+'.manifest.json'),JSON.stringify(manifest,null,2)+'\n',{mode:0o600});
  await this.sendEvent('success','Local backup created',{guildId:g.id,backupId:id,roles:snapshot.roles.length,channels:snapshot.channels.length});
  return{message:'Backup đã lưu trên PC: '+id,...manifest};
 }
 async listBackups(guildId){
  const dir=path.join(this.backupDir,guildId);await ensureDir(dir);const names=await fs.readdir(dir);const rows=[];
  for(const name of names.filter(n=>n.endsWith('.manifest.json'))){try{rows.push(JSON.parse(await fs.readFile(path.join(dir,name),'utf8')));}catch{}}
  return rows.sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))).slice(0,100);
 }
 async setSecurity(guildId,input){
  const security={enabled:Boolean(input.enabled),mode:input.mode==='alert'?'alert':'monitor',thresholds:{channelDelete:clamp(input.thresholds?.channelDelete,1,20,3),roleDelete:clamp(input.thresholds?.roleDelete,1,20,3),ban:clamp(input.thresholds?.ban,1,50,5),windowSeconds:clamp(input.thresholds?.windowSeconds,3,120,10)},whitelist:Array.isArray(input.whitelist)?input.whitelist.map(String).filter(x=>/^\d{17,20}$/.test(x)).slice(0,100):[]};
  this.config.security[guildId]=security;await writeJsonAtomic(this.configFile,this.config);return{message:'Đã lưu Anti-Nuke monitor trên PC.',security};
 }
 async applyTemplate(g){
  await g.channels.fetch();const created=[];
  for(const group of TEMPLATE){
   let cat=g.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name.toLowerCase()===group.name.toLowerCase());
   if(!cat){cat=await g.channels.create({name:group.name,type:ChannelType.GuildCategory,reason:'Aki additive server setup'});created.push('category:'+group.name);}
   for(const name of group.channels){const exists=g.channels.cache.find(c=>c?.name.toLowerCase()===name.toLowerCase()&&c.parentId===cat.id);if(!exists){await g.channels.create({name,type:ChannelType.GuildText,parent:cat.id,reason:'Aki additive server setup'});created.push('channel:'+name);}}
  }
  return{message:'Đã tạo '+created.length+' mục còn thiếu. Không xóa channel/role hiện có.',created};
 }
 async createTicketPanel(g,payload){
  await g.channels.fetch();const categoryName=slug(payload.categoryName||'support-tickets').toUpperCase();const channelName=slug(payload.channelName||'ticket-panel');
  let category=g.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name.toLowerCase()===categoryName.toLowerCase());
  if(!category)category=await g.channels.create({name:categoryName,type:ChannelType.GuildCategory,reason:'Aki Ticket Panel'});
  let channel=g.channels.cache.find(c=>c.name===channelName&&c.parentId===category.id);
  if(!channel)channel=await g.channels.create({name:channelName,type:ChannelType.GuildText,parent:category.id,reason:'Aki Ticket Panel'});
  const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('aki:ticket:open').setLabel('Mở ticket hỗ trợ').setStyle(ButtonStyle.Primary));
  const embed=new EmbedBuilder().setColor(0x59cbe8).setTitle('Aki Support Center').setDescription('Nhấn nút bên dưới để tạo ticket riêng tư.');
  await channel.send({embeds:[embed],components:[row]});return{message:'Ticket panel đã được tạo tại #'+channel.name,categoryId:category.id,channelId:channel.id};
 }
 async onInteraction(i){
  if(!i.isButton()||!i.customId.startsWith('aki:ticket:'))return;
  if(i.customId==='aki:ticket:open'){
   const g=i.guild;if(!g)return;await i.deferReply({ephemeral:true});
   const existing=g.channels.cache.find(c=>c.topic==='aki-ticket:'+i.user.id&&c.type===ChannelType.GuildText);
   if(existing)return i.editReply('Bạn đã có ticket: '+existing);
   const category=g.channels.cache.find(c=>c.type===ChannelType.GuildCategory&&c.name.toLowerCase()==='support-tickets');
   const staffRoleId=process.env.STAFF_ROLE_ID;
   const overwrites=[{id:g.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},{id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]},{id:this.client.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.ManageChannels]}];
   if(staffRoleId&&g.roles.cache.has(staffRoleId))overwrites.push({id:staffRoleId,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory]});
   const channel=await g.channels.create({name:'ticket-'+slug(i.user.username).slice(0,70),type:ChannelType.GuildText,parent:category?.id,topic:'aki-ticket:'+i.user.id,permissionOverwrites:overwrites,reason:'Ticket opened by member'});
   this.tickets.push({guildId:g.id,channelId:channel.id,userId:i.user.id,createdAt:new Date().toISOString(),status:'open'});await writeJsonAtomic(this.ticketFile,this.tickets);
   const row=new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('aki:ticket:close').setLabel('Đóng ticket').setStyle(ButtonStyle.Danger));
   await channel.send({content:'Xin chào '+i.user+'. Đội ngũ hỗ trợ sẽ phản hồi tại đây.',components:[row]});return i.editReply('Ticket đã tạo: '+channel);
  }
  if(i.customId==='aki:ticket:close'){
   const t=this.tickets.find(x=>x.channelId===i.channelId&&x.status==='open');if(!t)return i.reply({content:'Ticket đã đóng hoặc không tồn tại.',ephemeral:true});
   if(t.userId!==i.user.id&&!i.memberPermissions?.has(PermissionFlagsBits.ManageChannels))return i.reply({content:'Bạn không có quyền đóng ticket.',ephemeral:true});
   t.status='closed';t.closedAt=new Date().toISOString();await writeJsonAtomic(this.ticketFile,this.tickets);await i.channel.permissionOverwrites.edit(t.userId,{SendMessages:false});await i.channel.setName(('closed-'+i.channel.name).slice(0,95));return i.reply({content:'Ticket đã đóng.',ephemeral:false});
  }
 }
 async onMessage(m){
  if(!m.guild||m.author.bot||!m.content.startsWith(this.config.prefix||this.prefix))return;
  const [raw,...args]=m.content.slice((this.config.prefix||this.prefix).length).trim().split(/\s+/);const cmd=(raw||'').toLowerCase();
  if(cmd==='help')return m.reply('Aki: !help, !ping, !serverinfo, !backup, !ban, !kick, !timeout.');
  if(cmd==='ping')return m.reply('Pong! '+this.client.ws.ping+'ms');
  if(cmd==='serverinfo')return m.reply('**'+m.guild.name+'** · '+m.guild.memberCount+' thành viên · '+m.guild.channels.cache.size+' kênh · '+m.guild.roles.cache.size+' role');
  if(cmd==='backup'){if(!m.member.permissions.has(PermissionFlagsBits.ManageGuild))return m.reply('Bạn cần quyền Manage Server.');const b=await this.createBackup(m.guild,m.author.id);return m.reply('Backup cục bộ: '+b.backupId+' · '+b.roles+' roles · '+b.channels+' channels.');}
  if(!['ban','kick','timeout'].includes(cmd))return;
  const perm=cmd==='ban'?PermissionFlagsBits.BanMembers:cmd==='kick'?PermissionFlagsBits.KickMembers:PermissionFlagsBits.ModerateMembers;
  if(!m.member.permissions.has(perm)&&!m.member.permissions.has(PermissionFlagsBits.Administrator))return m.reply('Bạn không có quyền thực hiện lệnh này.');
  if(!m.guild.members.me?.permissions.has(perm)&&!m.guild.members.me?.permissions.has(PermissionFlagsBits.Administrator))return m.reply('Bot chưa có quyền cần thiết.');
  const target=m.mentions.members.first();if(!target)return m.reply('Hãy mention thành viên cần xử lý.');
  if(target.id===m.guild.ownerId||target.roles.highest.position>=m.member.roles.highest.position||target.roles.highest.position>=m.guild.members.me.roles.highest.position)return m.reply('Không thể xử lý thành viên có quyền cao hơn.');
  let reason='By '+m.author.tag;
  if(cmd==='timeout'){const match=args[1]?.match(/^(\d+)(s|m|h|d)$/i);if(!match)return m.reply('Ví dụ: !timeout @user 10m spam');const ms=Number(match[1])*({s:1000,m:60000,h:3600000,d:86400000}[match[2].toLowerCase()]);if(ms>28*86400000)return m.reply('Timeout tối đa 28 ngày.');reason=args.slice(2).join(' ').slice(0,400)||reason;await target.timeout(ms,reason);}
  else{reason=args.slice(1).join(' ').slice(0,400)||reason;if(cmd==='ban')await target.ban({reason});else await target.kick(reason);}
  await this.sendEvent('warn','Moderation command '+cmd,{guildId:m.guild.id,actorId:m.author.id,targetId:target.id,reason});return m.reply('Đã thực hiện '+cmd+' với '+target.user.tag+'.');
 }
 async observe(g,type,targetId){
  if(!g)return;const cfg=this.config.security?.[g.id]||defaults();if(!cfg.enabled)return;
  const seconds=cfg.thresholds.windowSeconds||10,threshold=cfg.thresholds[type]||3,key=g.id+':'+type,now=Date.now();
  const list=(this.windows.get(key)||[]).filter(x=>now-x.at<seconds*1000);list.push({at:now,targetId});this.windows.set(key,list);if(list.length<threshold)return;
  let actorId=null;try{const map={channelDelete:AuditLogEvent.ChannelDelete,roleDelete:AuditLogEvent.RoleDelete,ban:AuditLogEvent.MemberBanAdd};const logs=await g.fetchAuditLogs({type:map[type],limit:5});const entry=logs.entries.find(e=>e.target?.id===targetId&&Date.now()-e.createdTimestamp<15000);actorId=entry?.executor?.id||null;}catch{}
  if(actorId&&(cfg.whitelist||[]).includes(actorId)){this.windows.set(key,[]);return;}
  await this.sendEvent('warn','Anti-Nuke: '+type+' threshold reached',{guildId:g.id,type,count:list.length,threshold,actorId,targetId,mode:cfg.mode||'monitor'});this.windows.set(key,[]);
 }
 async stop(){this.client?.destroy();this.client=null;}
}
