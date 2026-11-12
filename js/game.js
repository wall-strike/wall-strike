'use strict';
let W=1536,H=864,LX=70,RX=1466,HK=1,PT=0,RW=680,UZ=1.2;const R=42,TS=1.25,VK=.75/TS,GK=.75/TS/TS,CKR=36,$=s=>document.querySelector(s),E=(t,c,h)=>{const e=document.createElement(t);if(c)e.className=c;if(h!=null)e.innerHTML=h;return e};
const C=$('#cv'),X=C.getContext('2d',{alpha:false}),tp=$('#top'),menu=$('#menu'),pn=$('#pn'),ov=$('#ov'),st=$('#st');let QL=(window.devicePixelRatio||1)>=2?.85:1,RK=1,UK=1,fe=16,fc=0;
/* landscape (PC, wide) = 1536x864 stage; portrait (phone) = 600 x ~1067-1400 stage, filled to the screen */
function layout(){const iw=innerWidth||1,ih=innerHeight||1,pt=ih>iw;PT=pt?1:0;if(pt){W=600;H=Math.max(960,Math.min(1400,Math.round(600*ih/iw)));LX=50;UZ=1}else{W=1536;H=864;LX=70;UZ=1.2}RX=W-LX;HK=(RX-LX-2*R)/484/TS;RW=Math.min(680,W-48);st.style.width=W+'px';st.style.height=H+'px';C.style.width=W+'px';C.style.height=H+'px';const r=document.documentElement;r.classList.toggle('pt',pt);r.style.setProperty('--u',UZ);r.style.setProperty('--rw',RW+'px')}
layout();
try{const sbd=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'shadowBlur');Object.defineProperty(X,'shadowBlur',{get(){return sbd.get.call(X)},set(v){sbd.set.call(X,QL<.8?0:v)},configurable:true})}catch(e){};
/* ---------- ITEM TABLE: one row per skin. New skin = one row here + one PNG in assets/. ----------
 t: a agent | k knife (expands into FIN finishes) | g gloves; r: rarity index into RAR (knife: base model rarity);
 def: in the starting inventory and never dropped from cases; eq: also equipped on a fresh save;
 img: PNG path under assets/ (without .png); col: agent colours {a,b,d} or glove colours [main,dark] */
const SKINS=[
{t:'a',id:'donk',n:'Donk',r:6,img:'agents/donk',col:{a:'#efd8d0',b:'#c9a89a',d:'#54463a'}},
{t:'a',id:'curly',n:'ZywOo',r:5,img:'agents/curly',col:{a:'#e8a888',b:'#c88868',d:'#5a2f1a'}},
{t:'a',id:'monesy',n:'Monesy',r:4,img:'agents/monesy',col:{a:'#e0bda7',b:'#c49a80',d:'#5a3a22'}},
{t:'a',id:'camo',n:'Camo',r:0,def:1,eq:1,img:'agents/camo',col:{a:'#a37a4c',b:'#7a5a36',d:'#5a4026'}},
{t:'k',id:'karambit',n:'Karambit',r:1,img:'knives/karambit'},
{t:'k',id:'bowie',n:'Bowie Knife',r:1,def:1,eq:1,img:'knives/bowie'},
{t:'k',id:'butterfly',n:'Butterfly Knife',r:2,img:'knives/butterfly'},
{t:'g',id:'vice',n:'Sport Gloves | Vice',r:3,img:'gloves/vice',col:['#ec4899','#383533']},
{t:'g',id:'basic',n:'Sport Gloves | Default',r:0,def:1,eq:1,img:'gloves/basic',col:['#9da3af','#6b7280']}];
const SID=o=>o.t=='k'?`k:${o.id}:0`:o.t+':'+o.id;
const DEF=()=>{const inv={},eq={};SKINS.forEach(o=>{if(o.def)inv[SID(o)]=1;if(o.eq)eq[o.t]=SID(o)});return{$:0,best:0,inv,eq,map:0,vol:.6,mute:false}};
function loadSave(){const d=DEF();let raw=null,r={},bad=0;try{raw=localStorage.getItem('pigstrike');r=JSON.parse(raw||'{}')}catch(e){bad=1}
const isO=x=>x&&typeof x=='object'&&!Array.isArray(x),num=(v,f)=>typeof v=='number'&&isFinite(v)&&v>=0?v:f;
if(!isO(r)){r={};bad=1}const s=Object.assign(DEF(),r);
s.$=num(r.$,d.$);s.best=num(r.best,d.best);if(('$' in r&&s.$!==r.$)||('best' in r&&s.best!==r.best))bad=1;s.map=num(r.map,0);s.vol=typeof r.vol=='number'&&r.vol>=0&&r.vol<=1?r.vol:d.vol;s.mute=!!r.mute;
if(isO(r.eq)){s.eq=Object.assign(d.eq,r.eq)}else{s.eq=d.eq;if('eq' in r)bad=1}
if(isO(r.inv)){s.inv={};for(const k in r.inv){if(typeof r.inv[k]=='number'&&isFinite(r.inv[k])&&r.inv[k]>0)s.inv[k]=r.inv[k];else bad=1}}else{s.inv=d.inv;if('inv' in r)bad=1}
if(Array.isArray(s.pend)){s.pend=s.pend.filter(x=>typeof x=='string');if(!s.pend.length)delete s.pend}else if(typeof s.pend!='string')delete s.pend;
if(bad&&raw){try{localStorage.setItem('pigstrike_bak',raw)}catch(e){}}return s}
let S=loadSave();
const save=()=>{try{localStorage.setItem('pigstrike',JSON.stringify(S))}catch(e){}};
/* ---------- DATA ---------- */
const RAR=[['Consumer Grade','#b0c3d9'],['Industrial Grade','#5e98d9'],['Mil-Spec','#4b69ff'],['Restricted','#8847ff'],['Classified','#d32ce6'],['Legendary','#eb4b4b'],['Secret','#ffd700']];
const MAPS=[
{n:'Mirage',u:0,m:1,sp:1,dec:0,sky:['#f6c27a','#e9a15b','#b9794a'],gr:'#c89a62',gd:'#8d6a3f',c:'#d9b27a'},
{n:'Inferno',u:500,m:1.3,sp:1,dec:1,sky:['#f58a4a','#c9562f','#5a2a2a'],gr:'#7a4a3a',gd:'#4a2a22',c:'#b5533a'},
{n:'Dust II',u:1200,m:1.6,sp:1.05,dec:2,sky:['#8fc7e8','#e8d9a8','#d4b36f'],gr:'#d0b070',gd:'#a2824a',c:'#c9a45c'},
{n:'Ancient',u:2500,m:2,sp:1.1,dec:3,sky:['#2f5a4a','#4f8a5d','#1f3a2f'],gr:'#4a6a45',gd:'#2d4430',c:'#6d8f6a'},
{n:'Nuke',u:4500,m:2.5,sp:1.2,dec:4,sky:['#3a4a60','#6f8097','#26303f'],gr:'#59616d',gd:'#353b45',c:'#8794a5'},
{n:'Anubis',u:7000,m:3,sp:1.1,g:.82,dec:5,sky:['#0f4f5c','#2a9a9a','#e0b860'],gr:'#c8a868',gd:'#7a5f35',c:'#d3b36a'},
{n:'Cache',u:9000,m:3.5,sp:1.15,dec:6,sky:['#8a9aa8','#c9b99a','#5a5f66'],gr:'#6f6a60',gd:'#3f3c36',c:'#8a8578'},
{n:'Overpass',u:12000,m:4,sp:1.15,dec:7,sky:['#6a8fb0','#aebfc8','#4a5a60'],gr:'#6a7a70',gd:'#3a463f',c:'#7f8f88'},
{n:'Train',u:16000,m:4.5,sp:1.2,dec:8,sky:['#6a6f78','#9a9a98','#3a3d42'],gr:'#6a5a4a',gd:'#3a2f26',c:'#7a6a58'},
{n:'Vertigo',u:21000,m:5,sp:1.25,g:.9,dec:9,sky:['#5aa0d8','#bfe0f5','#3a5a78'],gr:'#9aa0a8',gd:'#5a6068',c:'#aab4c0'}];
const MODS=['Standard','Warm alleys','Faster desert','Mossy ruins','Speed +20%','Low gravity','Warehouse crates','Bridge run','Rail yard','Skyscraper'];
const AN={pig:{a:'#ffc0cb',b:'#e8869b',d:'#c4607a'},chick:{a:'#ffe27a',b:'#f2b630',d:'#e08a1a'},frog:{a:'#9be36a',b:'#3f9a3a',d:'#2a6a2a'},panda:{a:'#fff',b:'#cfd5dc',d:'#222'},fox:{a:'#ffa05a',b:'#d9591a',d:'#5a2a12'},bear:{a:'#b07a4a',b:'#6a4128',d:'#3a2214'},ghost:{a:'#eaf8ff',b:'#8fd0f0',d:'#bfe8ff'}};
const FIN=[['Default','#d7dde6','#7d8794',-1],['Safari Mesh','#8a7a50','#4a4026',0],['Forest DDPAT','#5e7a45','#2a3a22',0],['Blue Steel','#6f8fb5','#2c4260',1],['Crimson Web','#d34040','#5a1414',2],['Fade','#ff9a3d','#d83ad0',3],['Doppler','#3d7dff','#b13dff',3],['Slaughter','#ff5a3d','#7a0f0f',3],['Gamma Lore','#7dff6a','#1a8a3a',5]].map(a=>({n:a[0],c:[a[1],a[2]],t:a[3]}));
const ITEM={},POOL=[[],[],[],[],[],[],[]];const add=o=>{ITEM[o.id]=o;if(!o.nd)POOL[o.r].push(o.id)};
SKINS.forEach(o=>{if(o.t=='a')add({id:'a:'+o.id,t:'a',k:o.id,n:o.n,r:o.r,nd:!!o.def});
else if(o.t=='k'){add({id:SID(o),t:'k',s:o.id,f:0,n:o.n+' | Default',r:o.def?0:o.r,nd:!!o.def});for(let f=1;f<9;f++)add({id:`k:${o.id}:${f}`,t:'k',s:o.id,f,n:o.n+' | '+FIN[f].n,r:Math.min(6,o.r+FIN[f].t)})}
else add({id:SID(o),t:'g',n:o.n,r:o.r,c:o.col,img:o.id,nd:!!o.def})});
{const D=DEF();for(const id in D.inv)S.inv[id]=S.inv[id]||1;['a','k'].forEach(t=>{if(!ITEM[S.eq[t]]||!S.inv[S.eq[t]])S.eq[t]=D.eq[t]});if(S.eq.g&&(!ITEM[S.eq.g]||!S.inv[S.eq.g]))S.eq.g=null}
const CS=[{n:'Agent Case',p:380,b:1.5,col:'#d32ce6',t:'a',d:'For your player<br>Unlock new agents'},{n:'Knife Case',p:260,b:1.6,col:'#eb4b4b',t:'k',d:'Unlock a new knife<br>and its skins'},{n:'Gloves Case',p:320,b:1.5,col:'#ffd700',t:'g',d:'Unlock new gloves'}];
const WT=[45,28,16,7,3,.8,.2],REF=[5,10,20,40,70,120,200];
if(S.pend){const pl=[].concat(S.pend);delete S.pend;pl.forEach(pid=>{if(ITEM[pid]){const dp=S.inv[pid];S.inv[pid]=(dp||0)+1;if(dp)S.$+=REF[ITEM[pid].r]}});save()}
function roll(ci,any){const c=CS[ci],ids=Object.values(ITEM).filter(i=>!i.nd&&(any||i.t==c.t)),w=ids.map(i=>WT[i.r]*Math.pow(c.b,i.r)),T=w.reduce((a,b)=>a+b);let q=Math.random()*T,k=0;while(k<ids.length-1&&q>w[k]){q-=w[k];k++}return ids[k].id}
/* ---------- SOUND ---------- */
let AC;const au=()=>{if(!AC)try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}if(AC&&AC.state=='suspended')AC.resume();return AC};
function tone(f,d,ty='sine',v=.2,f2){const a=au();if(!a||S.mute||S.vol<=0)return;const o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v*S.vol,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d)}
let CASEBUF=null,CASEREQ=0;const CASE_URL='assets/audio/case-open.mp3';
function loadCase(){if(CASEBUF||CASEREQ)return;const a=au();if(!a)return;CASEREQ=1;try{fetch(CASE_URL).then(r=>r.ok?r.arrayBuffer():Promise.reject()).then(u=>{const p=a.decodeAudioData(u,b=>{CASEBUF=b},()=>{CASEREQ=0});if(p&&p.catch)p.catch(()=>{CASEREQ=0})}).catch(()=>{CASEREQ=0})}catch(e){CASEREQ=0}}
function playCase(){const a=au();if(!a||S.mute||S.vol<=0)return;if(!CASEBUF){tone(200,.6,'sawtooth',.12,900);return}const s=a.createBufferSource(),g=a.createGain();s.buffer=CASEBUF;g.gain.value=S.vol;s.connect(g);g.connect(a.destination);s.start()}
const SFX={jump:()=>tone(300,.18,'square',.1,700),land:()=>tone(140,.12,'sine',.3,60),coin:()=>{tone(880,.08,'triangle',.2);setTimeout(()=>tone(1320,.12,'triangle',.2),60)},pass:()=>tone(520,.1,'sine',.15,780),tick:()=>tone(900,.03,'square',.08),click:()=>tone(660,.05,'square',.1),over:()=>tone(300,.7,'sawtooth',.2,50),open:()=>playCase(),rare:r=>{for(let i=0;i<r+3;i++)setTimeout(()=>tone(400*Math.pow(1.26,i),.25,'triangle',.25),i*90)}};
/* ---------- DRAWING: ITEMS ---------- */
const AS={},GI={},KI={},KC={},SPR={a:AS,g:GI,k:KI};
SKINS.forEach(o=>{const i=new Image();if(o.t=='a'){AN[o.id]=o.col;i.onload=()=>{try{top_()}catch(e){}}}i.src='assets/'+o.img+'.png';SPR[o.t][o.id]=i});
const CRATE='assets/ui/crate.png';const CRI=new Image();CRI.src=CRATE;
function kimg(s,f){const IM=KI[s];if(!IM||!IM.naturalWidth)return null;const ck=s+f;if(KC[ck])return KC[ck];const w=IM.naturalWidth,h=IM.naturalHeight,cv=document.createElement('canvas');cv.width=w;cv.height=h;const x=cv.getContext('2d');x.drawImage(IM,0,0);const d=x.getImageData(0,0,w,h),p=d.data,F=FIN[f],hx=q=>[1,3,5].map(i=>parseInt(q.substr(i,2),16)),A=hx(F.c[0]),B=hx(F.c[1]);
for(let i=0;!(f==0&&s!='karambit')&&i<p.length;i+=4){const r=p[i],g=p[i+1],l=p[i+2];if(p[i+3]&&Math.abs(r-g)<25&&Math.abs(g-l)<30&&r>130&&r<205){const t=((i/4)%w)/w;for(let k=0;k<3;k++)p[i+k]=A[k]+(B[k]-A[k])*t}}x.putImageData(d,0,0);return KC[ck]=cv}
function knife(c,s,f,L=70){if(KI[s]){const cv=kimg(s,f);if(cv){const sc=L*(L>74?1.35:.95)/cv.width,w=cv.width*sc,h=cv.height*sc;c.save();c.scale(-1,1);c.rotate(s=='karambit'?Math.PI/2:-Math.PI/2);c.drawImage(cv,-w*.3,-h*.55,w,h);c.restore();return}}const F=FIN[f],g=c.createLinearGradient(-10,0,10,0);g.addColorStop(0,F.c[0]);g.addColorStop(1,F.c[1]);c.save();c.lineJoin='round';
if(s=='butterfly'){[-.55,.55].forEach(a=>{c.save();c.rotate(a);c.fillStyle='#2a2f38';c.beginPath();c.roundRect(-5,2,10,34,4);c.fill();c.fillStyle=F.c[0];c.fillRect(-5,12,10,3);c.restore()})}
else{c.fillStyle='#2a2f38';c.beginPath();c.roundRect(-6,0,12,30,4);c.fill();c.fillStyle=F.c[0];c.fillRect(-6,10,12,3);if(s=='skeleton'){c.strokeStyle=F.c[0];c.lineWidth=2;for(let y=14;y<30;y+=5){c.beginPath();c.moveTo(-6,y);c.lineTo(6,y+3);c.stroke()}}c.fillStyle='#59616f';c.fillRect(-11,-2,22,5)}
if(s=='karambit'){c.strokeStyle='#8c97a6';c.lineWidth=3;c.beginPath();c.arc(0,34,6,0,7);c.stroke()}
c.fillStyle=g;c.strokeStyle='#0007';c.lineWidth=1.5;c.beginPath();
if(s=='karambit'){c.moveTo(-6,0);c.quadraticCurveTo(-40,-L*.5,10,-L);c.quadraticCurveTo(-16,-L*.5,6,0)}
else if(s=='talon'){c.moveTo(-8,0);c.quadraticCurveTo(-10,-L*.6,16,-L);c.quadraticCurveTo(10,-L*.4,8,0)}
else{const w=s=='m9'?10:s=='skeleton'||s=='butterfly'?5.5:7.5;c.moveTo(-w,0);c.lineTo(-w,-L*.72);c.lineTo(s=='flip'||s=='bayonet'?-1:0,-L);c.lineTo(w*.9,-L*.66);c.lineTo(w,0);if(s=='bayonet'){c.moveTo(0,-8)}}
c.closePath();c.fill();c.stroke();
if(s=='skeleton'){c.fillStyle='#000a';c.beginPath();c.arc(0,-14,2.5,0,7);c.fill()}
if(s!='karambit'&&s!='talon'){c.strokeStyle='#fff8';c.lineWidth=1.2;c.beginPath();c.moveTo(0,-4);c.lineTo(0,-L*.78);c.stroke()}c.restore()}
function glove(c,gl,r,A){const gi=gl&&gl.img&&GI[gl.img];if(gi&&gi.naturalWidth){const w=r*2.4,h=w*gi.naturalHeight/gi.naturalWidth;c.drawImage(gi,-w/2,-h/2,w,h);return}const g=c.createRadialGradient(-r*.3,-r*.3,1,0,0,r);g.addColorStop(0,gl?gl.c[0]:A.a);g.addColorStop(1,gl?gl.c[1]:A.b);c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);c.fill();
if(gl){c.fillStyle=gl.c[1];c.fillRect(-r*.8,r*.55,r*1.6,r*.5);c.strokeStyle='#0005';c.lineWidth=1;for(let i=-1;i<2;i++){c.beginPath();c.moveTo(i*r*.4,-r*.9);c.lineTo(i*r*.4,-r*.3);c.stroke()}}}
function animal(c,k,o={}){const A=AN[k],r=34,t=o.t||0,ph=o.ph||0;c.save();
if(k=='ghost'){c.globalAlpha=.92;c.shadowColor='#8fe0ff';c.shadowBlur=22}
const el=(x,y,a,b,col,rot=0)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,a,b,rot,0,7);c.fill()};
if(k=='pig'||k=='fox'){const big=k=='fox'?1.5:1;[-1,1].forEach(s=>{c.fillStyle=k=='fox'?A.b:A.b;c.beginPath();c.moveTo(s*8,-r+6);c.lineTo(s*30,-r-12*big);c.lineTo(s*31,-r+16);c.fill();if(k=='fox'){c.fillStyle=A.d;c.beginPath();c.moveTo(s*20,-r-4);c.lineTo(s*30,-r-12*big);c.lineTo(s*26,-r+4);c.fill()}})}
if(k=='panda'||k=='bear')[-1,1].forEach(s=>el(s*24,-26,10,10,k=='panda'?'#222':A.b));
if(k=='fox')el(-r-4,8,16,10,A.b,-.4);
const g=c.createRadialGradient(-10,-12,4,0,0,r);g.addColorStop(0,A.a);g.addColorStop(1,A.b);c.fillStyle=g;c.beginPath();c.arc(0,0,r,0,7);const sp=AS[k],dk=sp&&sp.naturalWidth;if(!dk)c.fill();c.shadowBlur=0;if(dk)c.drawImage(sp,-42,-40,84,Math.round(84*sp.naturalHeight/sp.naturalWidth));
if(k=='pig'){el(22,6,12,9,'#ff9bb0');el(19,6,2.2,3.5,'#a03a58');el(26,6,2.2,3.5,'#a03a58');el(2,10,6,4,'#ff8aa5')}
if(k=='chick'){c.fillStyle='#f2b630';[-6,0,6].forEach((x,i)=>{c.beginPath();c.moveTo(x-3,-r+3);c.lineTo(x+(i-1)*3,-r-14);c.lineTo(x+3,-r+3);c.fill()});c.fillStyle='#ff8a1a';c.beginPath();c.moveTo(28,0);c.lineTo(44,6);c.lineTo(28,12);c.fill();el(-24,6,7,12,A.b,.3)}
if(k=='panda'){el(5,-9,8,10,'#222',.3);el(24,-9,8,10,'#222',-.3);el(34,6,4,3,'#222')}
if(k=='fox'){c.fillStyle='#fff';c.beginPath();c.moveTo(10,14);c.lineTo(36,6);c.lineTo(28,26);c.fill();el(35,6,4,3.5,'#111')}
if(k=='bear'){el(24,8,12,9,'#d9b48a');el(30,5,4,3,'#111')}
if(k=='frog'){[-8,16].forEach((x,i)=>{el(x,-28-i*2,11,11,A.a);el(x,-28-i*2,9,9,'#fff');el(x+2,-28-i*2,4,4,'#111')});c.strokeStyle='#1d4a1d';c.lineWidth=2.5;c.beginPath();c.arc(14,8,16,.2,1.3);c.stroke()}
if(k!='frog'&&!AS[k]){const bl=(t%3.4)<.12;[6,22].forEach(x=>{if(bl){c.strokeStyle='#111';c.lineWidth=2;c.beginPath();c.moveTo(x-5,-10);c.lineTo(x+5,-10);c.stroke()}else{el(x,-10,5.5,6.5,'#fff');el(x+1.8,-9.5,3,3.6,'#111');el(x+2.6,-11,1,1,'#fff')}})}
if(k!='ghost')for(let i=0;i<2;i++){const l=o.air?-3:Math.max(0,Math.sin(ph+i*Math.PI))*9;el((i?1:-1)*13,r-1-l,10,7,A.d);c.strokeStyle='#0005';c.lineWidth=1.5;c.beginPath();c.ellipse((i?1:-1)*13,r-1-l,10,7,0,0,7);c.stroke()}
if(!o.nk&&k!='ghost'&&!AS[k]){c.save();c.rotate(.18);c.fillStyle='#1a1d26';c.beginPath();c.ellipse(0,-r+3,20,5,0,0,7);c.fill();c.fillRect(-12,-r-17,24,20);c.fillStyle='#c0392b';c.fillRect(-12,-r-2,24,4);c.restore()}if(!o.nk){c.save();c.translate(-26,18);c.rotate(Math.sin(t*3+1)*.12);glove(c,S.eq.g?ITEM[S.eq.g]:null,9,A);c.restore()}if(!o.nk){c.save();c.translate(26,16);c.rotate(o.ka==null?-.4:o.ka);c.save();c.translate(0,-6);knife(c,ITEM[S.eq.k].s,ITEM[S.eq.k].f,72);c.restore();glove(c,S.eq.g?ITEM[S.eq.g]:null,9,A);c.restore()}
c.restore()}
function icon(it,z){const cv=E('canvas');cv.width=cv.height=z*UK;cv.style.width=cv.style.height=z+'px';const c=cv.getContext('2d');c.scale(UK,UK);c.translate(z/2,z/2);c.scale(z/110,z/110);
if(it.t=='a')animal(c,it.k,{nk:1,t:1});else if(it.t=='k'){const kc=kimg(it.s,it.f);if(kc){const w=104,h=w*kc.height/kc.width;c.rotate(-.12);c.drawImage(kc,-w/2,-h/2,w,h)}else{c.rotate(.7);c.scale(.85,.85);c.translate(0,21);knife(c,it.s,it.f,76)}}else if(it.img){const gi=GI[it.img];if(gi&&gi.naturalWidth){const w=96,h=w*gi.naturalHeight/gi.naturalWidth;c.drawImage(gi,-w/2,-h/2,w,h)}}else if(it.c){c.scale(1.7,1.7);glove(c,it,26,AN.pig)}else{c.fillStyle='#667';c.font='bold 50px "MojeRuka","Segoe UI",Arial';c.textAlign='center';c.fillText('✕',0,16)}return cv}
/* ---------- DRAWING: WORLD ---------- */
let BY=0;const rnd=n=>{const x=Math.sin(n*127.1)*43758.5453;return x-Math.floor(x)};
function lay(sp,gap,off,f){const o=off*sp,k=Math.floor(o/gap);for(let i=-1;i<W/gap+2;i++)f(i*gap-(o-k*gap),k+i)}
function deco(m,x,i,t){const r=rnd(i),h=150+r*120,b=BY;X.fillStyle=m.c;
switch(m.dec){
case 0:X.fillRect(x,b-h,230,h);X.fillStyle=m.gd;X.beginPath();X.arc(x+115,b-62,34,Math.PI,0);X.lineTo(x+149,b);X.lineTo(x+81,b);X.fill();X.fillStyle=m.c;X.beginPath();X.arc(x+115,b-h,48,Math.PI,0);X.fill();X.fillStyle=m.gd;X.fillRect(x+20,b-h+30,24,40);X.fillRect(x+186,b-h+30,24,40);break;
case 1:X.fillRect(x,b-h,200,h);X.strokeStyle='#0003';for(let y=b-h;y<b;y+=14){X.beginPath();X.moveTo(x,y);X.lineTo(x+200,y);X.stroke()}X.fillStyle='#4a1f1a';X.beginPath();X.moveTo(x-12,b-h);X.lineTo(x+100,b-h-60);X.lineTo(x+212,b-h);X.fill();X.fillStyle='#ffd27a';X.shadowColor='#ffb04a';X.shadowBlur=18;for(let k=0;k<2;k++)for(let j=0;j<2;j++)if(rnd(i*7+k*3+j)>.3)X.fillRect(x+28+k*90,b-h+24+j*70,34,46);X.shadowBlur=0;break;
case 2:X.fillRect(x,b-100-r*60,260,100+r*60);X.fillStyle=m.gd;X.beginPath();X.arc(x+130,b-50,38,Math.PI,0);X.lineTo(x+168,b);X.lineTo(x+92,b);X.fill();if(r>.5){X.fillStyle=m.c;X.fillRect(x+210,b-h-40,30,h+40);X.beginPath();X.arc(x+225,b-h-40,22,Math.PI,0);X.fill()}break;
case 3:for(let s=0;s<5;s++){X.fillStyle=s%2?m.c:m.gd;X.fillRect(x+s*26,b-(s+1)*42-r*20,260-s*52,42+r*20)}X.fillStyle='#5dffc8';X.shadowColor='#5dffc8';X.shadowBlur=16;X.fillRect(x+124,b-230-r*20,12,10);X.shadowBlur=0;X.strokeStyle='#2f7a3a';X.lineWidth=4;for(let k=0;k<4;k++){X.beginPath();X.moveTo(x+30+k*60,b-60);X.lineTo(x+34+k*60,b-60-30-k*6);X.stroke()}break;
case 4:X.beginPath();X.moveTo(x,b);X.quadraticCurveTo(x+50,b-h*.5,x+30,b-h);X.lineTo(x+150,b-h);X.quadraticCurveTo(x+130,b-h*.5,x+180,b);X.fill();X.fillStyle='#0003';X.fillRect(x+90,b-h,60,h);X.fillStyle='#ffffff55';X.beginPath();X.arc(x+90,b-h-20,36,0,7);X.arc(x+120,b-h-40,28,0,7);X.fill();X.fillStyle=Math.sin(t*4+i)>0?'#ff3a3a':'#601010';X.fillRect(x+84,b-h-4,12,8);break;
case 5:X.beginPath();X.moveTo(x+30,b);X.lineTo(x+50,b-h-40);X.lineTo(x+70,b);X.fill();X.fillStyle='#ffd870';X.beginPath();X.moveTo(x+43,b-h-14);X.lineTo(x+50,b-h-40);X.lineTo(x+57,b-h-14);X.fill();X.fillStyle=m.c;for(let k=0;k<3;k++){X.fillRect(x+110+k*44,b-110,22,110);X.fillStyle=m.gd;X.fillRect(x+106+k*44,b-116,30,10);X.fillStyle=m.c}X.fillStyle='#3ad0d055';X.fillRect(x+100,b-12,160,12);break;
case 6:X.fillRect(x,b-h*.6,220,h*.6);X.fillStyle=m.gd;X.fillRect(x-10,b-h*.6-14,240,14);X.fillStyle='#8a6a3a';X.fillRect(x+230,b-70,60,70);X.fillRect(x+250,b-130,50,60);X.fillStyle='#0003';X.fillRect(x+230,b-38,60,4);break;
case 7:X.fillRect(x,b-30,300,30);X.fillStyle=m.gd;for(let k=0;k<4;k++)X.fillRect(x+10+k*80,b-h*.7,22,h*.7-30);X.fillStyle=m.c;X.fillRect(x-10,b-h*.7-18,320,18);X.fillStyle='#2a5a4a77';X.fillRect(x,b-12,300,12);break;
case 8:X.fillRect(x,b-90,260,70);X.fillStyle=m.gd;X.fillRect(x,b-26,260,8);X.fillStyle='#0004';for(let k=0;k<6;k++)X.fillRect(x+14+k*42,b-80,3,50);X.fillStyle='#222';X.beginPath();X.arc(x+50,b-14,12,0,7);X.arc(x+210,b-14,12,0,7);X.fill();X.fillStyle='#8a3a2a';X.fillRect(x+260,b-60,30,40);break;
case 9:X.fillRect(x,b-h-80,120,h+80);X.fillStyle=m.gd;for(let y=b-h-70;y<b;y+=26)X.fillRect(x+8,y,104,14);X.fillStyle='#ff9a3d';X.fillRect(x+120,b-h-80,5,70);X.fillStyle='#e0e6ee55';X.fillRect(x+140,b-130,18,130)}}
function shaft(m,cam,t){const tl=(f,gap,fn)=>{const b=cam*f,k=Math.floor(b/gap);for(let i=k-1;i<=k+Math.ceil(H/gap)+2;i++)fn(H-(i*gap-b),i)};
X.fillStyle=m.c;X.globalAlpha=.5;X.fillRect(LX,0,RX-LX,H);X.globalAlpha=1;
X.strokeStyle='#0002';X.lineWidth=2;tl(.6,44,(y,i)=>{X.beginPath();X.moveTo(LX,y);X.lineTo(RX,y);for(let x=LX+(i%2)*60;x<RX;x+=120){X.moveTo(x,y);X.lineTo(x,y-44)}X.stroke()});
tl(.6,320,(yb,i)=>{const r=rnd(i),cx=W/2+(r-.5)*(RX-LX)*.7;
switch(m.dec){
case 0:X.fillStyle=m.gd;X.beginPath();X.moveTo(cx-50,yb-60);X.lineTo(cx-50,yb-150);X.arc(cx,yb-150,50,Math.PI,0);X.lineTo(cx+50,yb-60);X.fill();X.fillStyle=m.sky[1];X.beginPath();X.moveTo(cx-38,yb-60);X.lineTo(cx-38,yb-150);X.arc(cx,yb-150,38,Math.PI,0);X.lineTo(cx+38,yb-60);X.fill();break;
case 1:X.fillStyle='#3a1812';X.fillRect(cx-36,yb-190,72,120);X.fillStyle='#ffd27a';X.shadowColor='#ffb04a';X.shadowBlur=26;X.fillRect(cx-28,yb-182,56,104);X.shadowBlur=0;X.fillStyle='#3a1812';X.fillRect(cx-2,yb-182,4,104);X.fillRect(cx-28,yb-132,56,4);X.strokeStyle='#222';X.lineWidth=2;X.beginPath();X.moveTo(cx+100,yb-320);X.lineTo(cx+100,yb-200);X.stroke();X.fillStyle='#ffb04a';X.shadowColor='#ffb04a';X.shadowBlur=24;X.fillRect(cx+90,yb-200,20,28);X.shadowBlur=0;break;
case 2:X.fillStyle='#6b4a2a';X.fillRect(LX,yb-130,RX-LX,16);X.fillStyle='#0005';X.fillRect(LX,yb-114,RX-LX,8);X.fillStyle='#8a6a3a';X.fillRect(cx-34,yb-182,68,52);X.fillStyle='#0004';X.fillRect(cx-34,yb-156,68,3);X.strokeStyle='#3a2a14';X.lineWidth=3;X.strokeRect(cx-34,yb-182,68,52);break;
case 3:X.strokeStyle='#5dffc8';X.shadowColor='#5dffc8';X.shadowBlur=18;X.globalAlpha=.5+.4*Math.sin(t*2+i);X.lineWidth=4;X.beginPath();X.arc(cx,yb-150,44,0,7);X.moveTo(cx-30,yb-150);X.lineTo(cx+30,yb-150);X.moveTo(cx,yb-180);X.lineTo(cx,yb-120);X.stroke();X.globalAlpha=1;X.shadowBlur=0;X.strokeStyle='#2f7a3a';X.lineWidth=5;for(let k=0;k<4;k++){const vx=LX+30+k*(RX-LX-60)/4+r*40;X.beginPath();X.moveTo(vx,yb-320);X.quadraticCurveTo(vx+20,yb-250,vx-10,yb-190-k*20);X.stroke()}break;
case 4:X.fillStyle='#4a5260';X.fillRect(cx-12,yb-320,24,320);X.fillStyle='#ffffff22';X.fillRect(cx-8,yb-320,6,320);X.fillStyle='#2a2f38';for(let y=yb-300;y<yb;y+=80)X.fillRect(cx-16,y,32,10);X.fillStyle='#f2c230';X.fillRect(LX,yb-150,RX-LX,22);X.fillStyle='#111';for(let x=LX;x<RX;x+=44){X.beginPath();X.moveTo(x,yb-150);X.lineTo(x+22,yb-150);X.lineTo(x+4,yb-128);X.lineTo(x-18,yb-128);X.fill()}X.fillStyle=Math.sin(t*4+i)>0?'#ff3a3a':'#601010';X.beginPath();X.arc(cx+60,yb-230,7,0,7);X.fill();break;
case 5:X.fillStyle=m.gd;X.fillRect(cx-60,yb-250,120,190);X.fillStyle='#ffd870';for(let a=0;a<4;a++)for(let b=0;b<3;b++)if(rnd(i*13+a*3+b)>.35)X.fillRect(cx-44+b*34,yb-236+a*44,18,26);X.fillStyle='#ffb030';X.shadowColor='#ff9a20';X.shadowBlur=30;X.beginPath();X.arc(cx+100,yb-190,10+2*Math.sin(t*9+i),0,7);X.fill();X.shadowBlur=0;break;
case 6:X.fillStyle='#8a6a3a';X.fillRect(cx-50,yb-130,100,70);X.strokeStyle='#4a3a1a';X.lineWidth=3;X.strokeRect(cx-50,yb-130,100,70);X.beginPath();X.moveTo(cx-50,yb-130);X.lineTo(cx+50,yb-60);X.moveTo(cx+50,yb-130);X.lineTo(cx-50,yb-60);X.stroke();X.fillStyle='#ffe9a0';X.shadowColor='#ffe9a0';X.shadowBlur=24;X.fillRect(cx-4,yb-300,8,12);X.shadowBlur=0;break;
case 7:X.fillStyle='#4a5a55';X.fillRect(LX,yb-170,RX-LX,18);X.fillStyle='#0004';X.fillRect(LX,yb-152,RX-LX,5);X.fillStyle='#2f7a5a';X.fillRect(cx-40,yb-250,80,60);X.fillStyle='#bfe0d0';X.fillRect(cx-32,yb-244,64,8);break;
case 8:X.fillStyle='#5a4a3a';X.fillRect(LX,yb-120,RX-LX,10);X.fillStyle='#8a3a2a';X.fillRect(cx-60,yb-230,120,100);X.fillStyle='#0004';for(let k=0;k<4;k++)X.fillRect(cx-48+k*28,yb-224,4,88);X.fillStyle='#f2c230';X.fillRect(cx-60,yb-150,120,6);break;
case 9:X.fillStyle='#8a94a2';X.fillRect(cx-8,yb-320,16,320);X.fillStyle='#f2a030';X.fillRect(LX,yb-170,RX-LX,12);X.fillStyle='#0003';for(let x=LX;x<RX;x+=40)X.fillRect(x,yb-170,18,12);X.fillStyle=Math.sin(t*4+i)>0?'#ff3a3a':'#601010';X.beginPath();X.arc(cx+50,yb-260,6,0,7);X.fill()}});
let g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fff5');g.addColorStop(1,'#fff0');X.fillStyle=g;X.beginPath();X.moveTo(LX+(RX-LX)*.1,0);X.lineTo(LX+(RX-LX)*.4,0);X.lineTo(RX-(RX-LX)*.05,H);X.lineTo(RX-(RX-LX)*.36,H);X.fill();
X.fillStyle=['#fff','#ffb060','#ffe9b0','#b8ffd0','#cfe6ff','#9ffcf0','#ffe0a0','#cfe8d8','#d8c0a0','#e8f4ff'][m.dec];for(let i=0;i<40;i++){X.globalAlpha=.25+.3*rnd(i+3);X.fillRect(LX+rnd(i)*(RX-LX),((rnd(i+50)*H+cam*(.2+rnd(i+9)*.3)+t*8)%H+H)%H,2.5,2.5)}X.globalAlpha=1}
function scene(m,cam,t){let g=X.createLinearGradient(0,0,0,H);g.addColorStop(0,m.sky[0]);g.addColorStop(.55,m.sky[1]);g.addColorStop(1,m.sky[2]);X.fillStyle=g;X.fillRect(0,0,W,H);
g=X.createRadialGradient(W/2,200,10,W/2,200,700);g.addColorStop(0,'#fff8');g.addColorStop(1,'#fff0');X.fillStyle=g;X.fillRect(0,0,W,H);
const lyr=(f,gap,fn)=>{const k=Math.floor(cam*f/gap);for(let i=k-1;i<=k+Math.ceil(H/gap)+2;i++)fn(H-(i*gap-cam*f),i)};
X.fillStyle=m.gd;X.globalAlpha=.25;lyr(.15,340,(yb,i)=>{X.fillRect(100+rnd(i+9)*(W-300),yb-600,36+rnd(i)*50,600)});X.globalAlpha=1;
shaft(m,cam,t);
[[0,-1],[RX,1]].forEach(([x0,s])=>{g=X.createLinearGradient(x0,0,x0+LX,0);g.addColorStop(s<0?0:1,m.gd);g.addColorStop(s<0?1:0,m.gr);X.fillStyle=g;X.fillRect(x0,0,LX,H);X.strokeStyle='#0004';X.lineWidth=2;for(let y=cam%56;y<H+56;y+=56){X.beginPath();X.moveTo(x0,y);X.lineTo(x0+LX,y);X.stroke()}
X.fillStyle='#fff3';X.fillRect(s<0?LX-4:RX,0,4,H);g=X.createLinearGradient(s<0?LX:RX,0,s<0?LX+36:RX-36,0);g.addColorStop(0,'#0007');g.addColorStop(1,'#0000');X.fillStyle=g;X.fillRect(s<0?LX:RX-36,0,36,H)})}
function fx(m){const g=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.45,W/2,H/2,Math.max(W,H)*.62);g.addColorStop(0,'#0000');g.addColorStop(1,'#000a');X.fillStyle=g;X.fillRect(0,0,W,H);
X.globalCompositeOperation='overlay';X.fillStyle=['#ffb04a55','#ff5a1a66','#ffe0a044','#3aff8a44','#4a7aff55','#2affe044','#a0b0c044','#5aa0ff44','#c8a06a44','#8ad0ff44'][m.dec];X.fillRect(0,0,W,H);X.globalCompositeOperation='source-over'}
/* ---------- GAME (vertical wall-jump) ---------- */
let mode='menu',G,off=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sy=y=>H-(y-G.cam),sawX=o=>W/2+Math.sin(G.t*2.2/TS+o.ph)*(RX-LX)*.36;
const CKI=new Image();CKI.src='assets/ui/chick.png';
const SPK=new Image();SPK.src='assets/ui/spike.png';
const SHD=new Image();SHD.src='assets/ui/shield.png';function shd(x,y,h){const w=h*SHD.naturalWidth/SHD.naturalHeight;X.drawImage(SHD,x-w/2,y-h/2,w,h)}
const SPP=[0.0, 0.225, 0.275, 0.3, 0.35, 0.375, 0.4, 0.475, 0.5, 0.55, 0.625, 0.675, 0.7, 0.75, 0.8, 0.85, 0.875, 0.925, 0.95, 0.975, 1.0, 1.0, 0.975, 0.95, 0.9, 0.825, 0.775, 0.75, 0.65, 0.625, 0.55, 0.5, 0.45, 0.4, 0.35, 0.375, 0.475, 0.55, 0.6, 0.65, 0.7, 0.825, 0.875, 0.925, 0.975, 1.0, 1.0, 1.0, 0.975, 0.95, 0.9, 0.825, 0.75, 0.725, 0.6, 0.55, 0.525, 0.425, 0.4, 0.325, 0.325, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.675, 0.7, 0.725, 0.8, 0.85, 0.875, 0.875, 0.875, 0.85, 0.825, 0.775, 0.7, 0.65, 0.6, 0.55, 0.5, 0.4, 0.375, 0.3, 0.25, 0.2, 0.15];
function spG(o){const n=Math.max(1,Math.round(o.h/90));return[n,o.h/n]}
function spikeHit(o){const rr=R-12,u=o.s<0?G.x-LX:RX-G.x;if(u-rr>o.d)return false;const[n,gh]=spG(o),L=SPP.length,top=o.y+o.h;
for(let k=0;k<n;k++){const yt=top-k*gh;if(G.y>yt+rr||G.y<yt-gh-rr)continue;
for(let j=0;j<L;j++){const dp=SPP[j]*o.d;if(dp<=0)continue;const dy=G.y-(yt-(j+.5)/L*gh);if(dy*dy>=rr*rr)continue;if(u-Math.sqrt(rr*rr-dy*dy)<dp)return true}}return false}
function newRun(){S.map=0;G={t:0,cam:0,x:LX+R,y:230,vx:0,vy:0,side:-1,jumps:0,maxY:230,sq:0,bonus:0,score:0,cash:0,combo:0,ct:0,obs:[],coins:[],pts:[],txt:[],ny:980,dead:false,pause:0,sh:0,inv:0,tr:[],dt:0,shake:0,sl:0,face:1,dn:0}}
function mult(){return 1+Math.min(2.5,Math.floor(G.combo/6)*.5)}
function burst(x,y,n,col,sp=300){for(let i=0;i<n;i++){const a=Math.random()*7,v=Math.random()*sp;G.pts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-80,l:.5+Math.random()*.5,c:col,s:2+Math.random()*4})}}
const DGS={"1":["assets/digits/1.png","assets/digits/1-o.png"],"2":["assets/digits/2.png","assets/digits/2-o.png"],"3":["assets/digits/3.png","assets/digits/3-o.png"],"4":["assets/digits/4.png","assets/digits/4-o.png"],"5":["assets/digits/5.png","assets/digits/5-o.png"],"6":["assets/digits/6.png","assets/digits/6-o.png"],"7":["assets/digits/7.png","assets/digits/7-o.png"],"8":["assets/digits/8.png","assets/digits/8-o.png"],"9":["assets/digits/9.png","assets/digits/9-o.png"],"0":["assets/digits/0.png","assets/digits/0-o.png"]};const DGI={};for(const k in DGS){DGI[k]=DGS[k].map(b=>{const i=new Image();i.src=b;return i})}const DGC={};
function dgl(ch,col){const k=ch+col;if(DGC[k])return DGC[k];const f=DGI[ch][0],o=DGI[ch][1];if(!f.naturalWidth||!o.naturalWidth)return null;const cv=document.createElement('canvas');cv.width=f.naturalWidth;cv.height=f.naturalHeight;const x=cv.getContext('2d');x.drawImage(o,0,0);const t=document.createElement('canvas');t.width=cv.width;t.height=cv.height;const y=t.getContext('2d');y.drawImage(f,0,0);y.globalCompositeOperation='source-in';y.fillStyle=col;y.fillRect(0,0,t.width,t.height);x.drawImage(t,0,0);return DGC[k]=cv}
function dtw(s,h){let w=0;for(const ch of String(s)){if(DGI[ch]){const i=DGI[ch][0];w+=i.naturalWidth?i.naturalWidth*h/120*.8:h*.6}else w+=X.measureText(ch).width}return w}
function dtx(s,x,y,h,al,col,fnt){s=String(s);X.save();X.font=fnt||('900 '+h+'px "MojeRuka","Segoe UI",Arial');X.textAlign='left';const w=dtw(s,h*1.12);let cx=al=='center'?x-w/2:al=='right'?x-w:x;const dh=h*1.12;for(const ch of s){if(DGI[ch]){const c=dgl(ch,col);if(c){const dw=c.width*dh/120,sc=dh/120;X.drawImage(c,cx-dw*.1,y-dh*.8,dw,dh);cx+=dw*.8}else{X.fillStyle=col;X.fillText(ch,cx,y);cx+=h*.6}}else{X.fillStyle='#000';X.fillText(ch,cx+2,y+2);X.fillStyle=col;X.fillText(ch,cx,y);cx+=X.measureText(ch).width}}X.restore()}
function ftx(x,y,s,c='#ffd700'){G.txt.push({x,y,s,c,l:1})}
function coinsArc(y){const f=Math.random()<.5,q=Math.random(),n=clamp(Math.floor((RX-LX-180)/110)+1,4,7),m=n>>1;for(let i=0;i<n;i++){const k=f?n-1-i:i;G.coins.push({x:LX+90+(RX-LX-180)*k/(n-1),y:y+45+Math.sin(Math.PI*i/(n-1))*95,g:i==m&&q<.12,sh:i==m&&q>.9})}}
function dif(){return Math.min(1.6,G.maxY/9000+S.map*.06)}
function fixCoins(){for(const c of G.coins)for(const o of G.obs){if(o.k!='block')continue;const x1=o.s<0?LX:RX-o.d,x2=x1+o.d,y2=o.y+o.h;if(c.x>x1-40&&c.x<x2+40&&c.y>o.y-40&&c.y<y2+40)c.y=Math.max(c.y,y2+40)}}
function spawn(m){const d=dif(),y=G.ny,s=Math.random()<.5?-1:1,r=Math.random();let h=150;
if(r<.28){h=100+Math.random()*75;G.obs.push({k:'spike',s,y,h,d:56})}
else if(r<.48){h=56;G.obs.push({k:'block',s,y,h,d:Math.round((RX-LX)*.22)})}
else if(r<.68){h=305;G.obs.push({k:'spike',s,y,h:95,d:56},{k:'spike',s:-s,y:y+210,h:95,d:56})}
else if(r<.84&&d>.08){h=260;G.obs.push({k:'block',s,y,h:56,d:Math.round((RX-LX)*.19)},{k:'spike',s:-s,y:y+170,h:90,d:56})}
else if(d>.15){h=45;G.obs.push({k:'saw',y,ph:Math.random()*6,h});if(d>.5&&Math.random()<.6){h=120;G.obs.push({k:'saw',y:y+80,ph:Math.random()*6,h:45})}}
else{h=90;G.obs.push({k:'spike',s,y,h,d:56})}
coinsArc(y-30);fixCoins();G.ny=y+h+240+Math.random()*110-d*100}
function jump(t){if(mode!='play'||G.dead)return;
if(G.side){const s=G.side;t=t||-s;G.vy=(t==s?820:1020)*VK;G.vx=t==s?s*140*HK:t*900*HK;G.side=0;G.jumps=1}
else if(G.jumps<2){G.vy=920*VK;G.vx=(t||Math.sign(G.vx)||1)*720*HK;G.jumps=2;burst(G.x,sy(G.y)+R,10,'#fff8',140)}else return;
SFX.jump();G.dn=0;G.sq=-.3;burst(G.x,sy(G.y)+R*.6,6,'#fff6',100)}
function slide(){if(mode!='play'||G.dead||G.dn>0)return;G.dn=.2;G.sq=.35;SFX.land();burst(G.x-G.side*R,sy(G.y)+R,8,'#fff8',160)}
function die(f){if(G.dead)return;if(G.sh&&!f){G.sh=0;G.inv=1.3;G.shake=12;burst(G.x,sy(G.y),30,'#6ff',420);ftx(G.x,sy(G.y)-70,'SHIELD BROKEN','#6ff');SFX.over();return}G.dead=true;G.dt=0;G.shake=18;const y=clamp(sy(G.y),0,H-10);burst(G.x,y,40,'#ff5a3d',500);burst(G.x,y,20,'#ffd700',400);SFX.over();try{navigator.vibrate&&navigator.vibrate(80)}catch(e){}}
function hit(x1,y1,x2,y2,pad=6){const cx=clamp(G.x,x1,x2),cy=clamp(G.y,y1,y2);return(G.x-cx)**2+(G.y-cy)**2<(R-pad)**2}
function pass(){G.combo++;G.ct=3.5;const mu=mult(),v=Math.round(10*mu);G.bonus+=v;ftx(G.x,sy(G.y)-70,'+'+v+(mu>1?' x'+mu:''),'#8fe0ff');SFX.pass()}
function pick(c){if(c.sh){G.sh=1;ftx(c.x,sy(c.y)-20,'SHIELD!','#6ff');burst(c.x,sy(c.y),14,'#6ff',220);SFX.rare(2);return}const m=MAPS[S.map],v=Math.max(1,Math.round((c.g?8:1)*mult()*m.m));G.cash+=v;G.bonus+=c.g?50:3;G.combo++;G.ct=3.5;G.sl=.4;ftx(c.x,sy(c.y)-20,'+$'+v,c.g?'#6af':'#ffd700');burst(c.x,sy(c.y),10,c.g?'#6af':'#ffd700',200);SFX.coin()}
function upd(dt){const m=MAPS[S.map];G.t+=dt;G.pts.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=700*dt;p.l-=dt});G.pts=G.pts.filter(p=>p.l>0);G.txt.forEach(t=>{t.y-=50*dt;t.l-=dt});G.txt=G.txt.filter(t=>t.l>0);G.shake*=.9;
if(G.dead){G.dt+=dt;if(G.dt>.9&&mode=='play')end();return}
G.sq*=.85;G.inv=Math.max(0,G.inv-dt);if(!G.side)G.tr.push({x:G.x,y:G.y,l:.3});G.tr.forEach(p=>p.l-=dt);G.tr=G.tr.filter(p=>p.l>0);G.sl=Math.max(0,G.sl-dt);if((G.ct-=dt)<=0)G.combo=0;
G.cam+=(80+Math.min(160,G.maxY/38))*m.sp*VK*dt;while(G.ny<G.cam+H+380)spawn(m);
if(G.dn>0){G.dn-=dt;if(G.side)G.y-=600*VK*dt;else{G.vy=Math.min(G.vy,-650*VK);if(G.dn<=0)G.vy=Math.max(G.vy,-250*VK)}}
if(G.side){G.y-=70*VK*dt;if(Math.random()<dt*20)G.pts.push({x:G.x+G.side*R,y:sy(G.y)+R*.4,vx:-G.side*(15+Math.random()*40),vy:15+Math.random()*40,l:.3+Math.random()*.3,c:'#fff8',s:2+Math.random()*3})}else{G.vy-=1800*GK*(m.g||1)*dt;G.y+=G.vy*dt;G.x+=G.vx*dt;const w=G.x<=LX+R?-1:G.x>=RX-R?1:0;
 if(w){G.x=w<0?LX+R:RX-R;G.vx=0;if(G.vy<=0){G.side=w;G.vy=0;G.jumps=0;G.sq=.5;SFX.land();burst(G.x-w*R,sy(G.y),8,'#fff6',160)}}}
if(G.y>G.cam+H*.5)G.cam=G.y-H*.5;G.maxY=Math.max(G.maxY,G.y);G.score=Math.max(0,Math.floor((G.maxY-230)/6))+G.bonus;for(let i=MAPS.length-1;i>S.map;i--)if(G.score>=MAPS[i].u){S.map=i;save();ftx(W/2,340,'NEW MAP: '+MAPS[i].n,'#8fe0ff');G.mb={n:MAPS[i].n,t0:G.t};G.txt[G.txt.length-1].l=2.5;burst(W/2,300,30,'#8fe0ff',400);SFX.rare(3);break}
if(G.y<G.cam-R){if(G.sh){G.sh=0;G.inv=1.3;G.y=G.cam+225;G.vy=540;G.side=0;G.jumps=1;burst(G.x,sy(G.y),30,'#6ff',420);ftx(G.x,sy(G.y)-70,'SAVED!','#6ff')}else die()}
for(const o of G.obs){if(o.y>G.cam+H+100||o.y+o.h<G.cam-150)continue;
 if(!o.p&&G.y>o.y+o.h+45){o.p=1;pass()}
 if(o.k=='saw'){if(G.inv<=0&&(G.x-sawX(o))**2+(G.y-o.y)**2<(R+CKR)**2)die()}
 else if(G.inv<=0&&(o.k=='spike'?spikeHit(o):(o.s<0?hit(LX,o.y,LX+o.d-6,o.y+o.h):hit(RX-o.d+6,o.y,RX,o.y+o.h))))die()}
for(const c of G.coins){if(c.d)continue;if((G.x-c.x)**2+(G.y-c.y)**2<(R+32)**2){c.d=1;pick(c)}}
G.obs=G.obs.filter(o=>o.y+o.h>G.cam-300);G.coins=G.coins.filter(c=>!c.d&&c.y>G.cam-100)}
const CN=new Image();CN.src='assets/ui/coin.png';
function coin(x,y,r,k){X.save();X.translate(x,y);X.scale(Math.max(.25,k),1);if(CN.complete&&CN.naturalWidth){const z=r*2.3;X.drawImage(CN,-z/2,-z/2,z,z)}else{X.fillStyle='#facc15';X.beginPath();X.arc(0,0,r,0,7);X.fill()}X.restore()}
function drw(m,t){X.save();if(G.shake>.5)X.translate((Math.random()-.5)*G.shake,(Math.random()-.5)*G.shake);
scene(m,G.cam,t);let g;
for(const o of G.obs){if(o.y>G.cam+H+100||o.y+o.h<G.cam-150)continue;
 if(o.k=='saw'){const x=sawX(o),y=sy(o.y),dr=Math.cos(G.t*2.2/TS+o.ph)>=0?-1:1;X.save();X.translate(x,y+Math.sin(G.t*14+o.ph)*5);X.rotate(Math.sin(G.t*9+o.ph)*.09);X.scale(dr,1);if(CKI.naturalWidth){const w=128,h=w*CKI.naturalHeight/CKI.naturalWidth;X.drawImage(CKI,-w/2,-h/2-4,w,h)}else{X.fillStyle='#f2c230';X.beginPath();X.arc(0,0,CKR,0,7);X.fill()}X.restore();continue}
 const top=sy(o.y+o.h);
 if(o.k=='spike'){const[n,gh]=spG(o);for(let k=0;k<n;k++){const ty=top+k*gh;if(o.s<0)X.drawImage(SPK,LX,ty,o.d,gh);else{X.save();X.translate(RX,ty);X.scale(-1,1);X.drawImage(SPK,0,0,o.d,gh);X.restore()}}}
 else{const x=o.s<0?LX:RX-o.d;if(CRI.naturalWidth){const n=Math.max(1,Math.round(o.d/(o.h*1.17))),tw=o.d/n;for(let i=0;i<n;i++)X.drawImage(CRI,x+i*tw,top,tw,o.h)}else{X.fillStyle='#775a3d';X.fillRect(x,top,o.d,o.h)}}}
for(const c of G.coins){const y=sy(c.y);if(y<-60||y>H+60)continue;if(c.sh){X.save();X.shadowColor='#6ff';X.shadowBlur=18;if(SHD.naturalWidth)shd(c.x,y,72+Math.sin(G.t*6)*4);else{X.strokeStyle='#6ff';X.lineWidth=4;X.beginPath();X.arc(c.x,y,18+Math.sin(G.t*6)*2,0,7);X.fillStyle='#6ff4';X.fill();X.stroke()}X.restore();continue}const w=Math.abs(Math.cos(G.t*4+c.y*.01))*13+3;if(c.g){X.shadowColor='#6af';X.shadowBlur=14}X.fillStyle=c.g?'#6af':'#ffd24a';if(c.g){X.beginPath();X.moveTo(c.x,y-27);X.lineTo(c.x+w*1.5,y);X.lineTo(c.x,y+27);X.lineTo(c.x-w*1.5,y);X.fill()}else coin(c.x,y,28,w/16);X.shadowBlur=0}
G.tr.forEach(p=>{X.globalAlpha=p.l*.9;X.fillStyle='#fff';X.beginPath();X.arc(p.x,sy(p.y),R*p.l*2.2,0,7);X.fill()});X.globalAlpha=1;if(!G.dead){const air=!G.side;if(G.side)G.face=-G.side;else if(Math.abs(G.vx)>20)G.face=Math.sign(G.vx);
 const st=air?1+Math.min(.22,Math.abs(G.vy)/4500):1-G.sq*.3,sx=air?2-st:1+G.sq*.35,ka=G.sl>0?-.4+(1-G.sl/.4)*Math.PI*2:air?-1.1+clamp(G.vy/2200,-.4,.4):-.2+Math.sin(G.t*3)*.1;
 X.save();X.translate(G.x,sy(G.y));X.scale(G.face*Math.max(.7,sx)*R/34,Math.max(.7,st)*R/34);animal(X,ITEM[S.eq.a].k,{t:G.t,ph:G.t*(air?16:2),air,ka});X.restore();if(G.sh&&SHD.naturalWidth){X.save();X.shadowColor='#6ff';X.shadowBlur=20;X.globalAlpha=.6;shd(G.x,sy(G.y),R*2+24);X.restore()}else if(G.sh||G.inv>0){X.save();X.strokeStyle='#6ff';X.shadowColor='#6ff';X.shadowBlur=20;X.lineWidth=4;X.globalAlpha=G.sh?.9:.4+.4*Math.sin(G.t*40);X.beginPath();X.arc(G.x,sy(G.y),R+10,0,7);X.stroke();X.restore()}}
G.pts.forEach(p=>{X.globalAlpha=clamp(p.l*2,0,1);X.fillStyle=p.c;X.fillRect(p.x,p.y,p.s,p.s)});X.globalAlpha=1;
X.font='800 38px "MojeRuka","Segoe UI",Arial';X.textAlign='center';G.txt.forEach(t=>{X.globalAlpha=clamp(t.l*2,0,1);dtx(t.s,t.x,t.y,38,'center',t.c,'800 38px "MojeRuka","Segoe UI",Arial')});X.globalAlpha=1;X.restore();
fx(m);X.shadowColor='#000';X.shadowBlur=8;X.textAlign='center';coin(W/2,32,19,1);dtx(G.score,W/2,118,72,'center','#ffffff');
X.textAlign='left';X.font='700 26px "MojeRuka","Segoe UI",Arial';dtx('$ '+G.cash,28,56,38,'left','#ffd700','700 38px "MojeRuka","Segoe UI",Arial');X.fillStyle='#8fe0ff';X.font='700 26px "MojeRuka","Segoe UI",Arial';X.textAlign=PT?'center':'left';X.fillText(m.n+' · x'+m.m+' · LVL '+(1+Math.floor(dif()*6)),PT?W/2:28,PT?206:92);
if(G.combo>1){X.textAlign='right';X.fillStyle='#ff9a3d';X.font='900 32px "MojeRuka","Segoe UI",Arial';{const cr=PT?W/2+125:W-120,cy=PT?262:56,bx=cr-220,by=cy+16;dtx('COMBO '+G.combo+' x'+mult(),cr,cy,40,'right','#ff9a3d');X.fillStyle='#fff3';X.fillRect(bx,by,220,9);X.fillStyle='#ff9a3d';X.fillRect(bx,by,220*clamp(G.ct/3.5,0,1),9)}}
X.textAlign='center';X.font='700 20px "MojeRuka","Segoe UI",Arial';dtx('BEST '+S.best,W/2,166,26,'center','#ffffffcc','700 26px "MojeRuka","Segoe UI",Arial');{const mb=G.mb||{n:m.n,t0:0},a=clamp(2.6-(G.t-mb.t0),0,1);if(a>0){X.save();X.globalAlpha=a;X.textAlign='center';X.shadowColor='#000';X.shadowBlur=16;X.fillStyle=m.c;X.font='900 78px "MojeRuka","Segoe UI",Arial';X.fillText(mb.n.toUpperCase(),W/2,250);X.fillStyle='#fff';X.font='700 24px "MojeRuka","Segoe UI",Arial';X.fillText(MODS[S.map].toUpperCase(),W/2,292);X.restore()}}if(!G.dead){X.fillStyle='#fffc';X.fillRect(W-82,20,13,42);X.fillRect(W-58,20,13,42)}if(G.t<7){X.textAlign='center';X.font='700 '+(PT?25:34)+'px "MojeRuka","Segoe UI",Arial';X.fillStyle='#fff';X.fillText('TAP OPPOSITE SIDE = LONG JUMP',W/2,H-96);X.fillText('TAP SAME SIDE = HOP · TAP IN AIR = 2x JUMP',W/2,H-50)}X.shadowBlur=0}
function end(){mode='over';const m=MAPS[S.map],bonus=Math.floor(G.score*.015*m.m),gain=G.cash+bonus,old=S.best;S.$+=gain;S.best=Math.max(S.best,G.score);const nu=MAPS.filter(x=>x.u>old&&x.u<=S.best);save();
ov.className='ui';ov.innerHTML=`<div class=rv><h1>GAME OVER</h1><div class=big2>${G.score}</div>${G.score>old&&old>0?'<p class=gold>NEW BEST</p>':''}<p>Best ${S.best} · Coins $${G.cash} · Score bonus $${bonus}</p><p class=gold>Total +$${gain}</p>${nu.map(x=>`<p class=gold>MAP UNLOCKED: ${x.n}</p>`).join('')}<div class=row><button class=b id=rt>RETRY</button><button class="b s" id=mn>MENU</button></div></div>`;$('#rt').onclick=play;$('#mn').onclick=toMenu}
function play(){au();SFX.click();mode='play';[menu,pn,ov,tp].forEach(e=>e.className='ui hid');newRun()}
function toMenu(){S.map=0;mode='menu';ov.className='ui hid';pn.className='ui hid';menu.className='ui';tp.className='ui';top_()}
/* ---------- UI ---------- */
function top_(){const a=ITEM[S.eq.a];tp.innerHTML=`<span>$${S.$.toLocaleString()}</span><span>BEST ${S.best}</span>`;tp.append(icon(a,60))}
function mainMenu(){menu.innerHTML='<h1 aria-label="WALL STRIKE"><img class=logo alt="WALL STRIKE" src="assets/ui/logo.png"></h1>';[['PLAY',play],['INVENTORY',inv],['CASES',cases],['MAPS',maps],['SETTINGS',sets]].forEach(([n,f],i)=>{const b=E('button','b'+(i?' s':''),n);b.onclick=()=>{au();loadCase();SFX.click();f()};menu.append(b)})}
function panel(title,fn){pn.className='ui';pn.innerHTML=`<div class=ph><h2>${title}</h2><button class="b s sm" id=bk>BACK</button></div><div class=pb></div>`;$('#bk').onclick=()=>{SFX.click();pn.className='ui hid';top_()};fn(pn.querySelector('.pb'));top_()}
let tab='a';
function inv(){panel('INVENTORY',b=>{const T={a:'Agents',k:'Knives',g:'Gloves'},cnt=k=>Object.values(ITEM).filter(i=>i.t==k&&S.inv[i.id]).length+'/'+Object.values(ITEM).filter(i=>i.t==k).length;b.append(E('div','tabs',Object.keys(T).map(k=>`<button class="tb ${k==tab?'on':''}" data-k=${k}>${T[k]} <small>${cnt(k)}</small></button>`).join('')));b.querySelectorAll('.tb').forEach(x=>x.onclick=()=>{tab=x.dataset.k;SFX.click();inv()});
const g=E('div','gr'),list=Object.values(ITEM).filter(i=>i.t==tab).sort((a,b)=>a.r-b.r);if(tab=='g')list.unshift({id:null,t:'g',n:'No gloves',r:0,none:1});
list.forEach(it=>{const own=it.none||S.inv[it.id],on=S.eq[tab]==it.id,d=E('div','cd'+(own?'':' lk')+(on?' eq':''));d.style.setProperty('--c',RAR[it.r][1]);d.append(icon(it,130),E('b','',it.none||own?it.n.replace(' | ','<br>'):'???'),E('small','',own?(on?'EQUIPPED':S.inv[it.id]>1?'×'+S.inv[it.id]:'&nbsp;'):'LOCKED'));if(own)d.onclick=()=>{S.eq[tab]=it.id;save();SFX.click();inv()};g.append(d)});b.append(g)})}
function cases(){panel('CASES',b=>{const w=E('div','big');CS.forEach((c,i)=>{const d=E('div','card',`<div class=em style="height:96px;display:flex;align-items:center;justify-content:center"><img alt="" src="${CRATE}" style="height:96px;width:auto"></div><h3>${c.n}</h3><p>${c.d}</p>`);d.style.setProperty('--c',c.col);const MAXQ=10,qr=E('div','qr'),mi=E('button','b s sm','−'),pl=E('button','b s sm','+'),qn=E('span','qn'),bt=E('button','b','');let q=1;const up=()=>{qn.textContent='×'+q;bt.textContent='OPEN $'+c.p*q;bt.disabled=S.$<c.p*q;mi.disabled=q<=1;pl.disabled=q>=MAXQ||S.$<c.p*(q+1)};mi.onclick=()=>{if(q>1){q--;SFX.click();up()}};pl.onclick=()=>{if(q<MAXQ&&S.$>=c.p*(q+1)){q++;SFX.click();up()}};bt.onclick=()=>openCase(i,q);qr.append(mi,qn,pl);up();d.append(qr,bt);w.append(d)});b.append(w,E('p','','<span style="color:#8b95a8">Earn $ by playing — no real money. Duplicates are refunded.</span>'))})}
function openCase(ci,q=1){const c=CS[ci];q=Math.max(1,Math.min(10,q|0));if(S.$<c.p*q)return;au();loadCase();S.$-=c.p*q;save();top_();const wins=[];for(let k=0;k<q;k++)wins.push(roll(ci));S.pend=q>1?wins:wins[0];save();const win=wins.reduce((a,b)=>ITEM[b].r>ITEM[a].r?b:a);const N=46,WI=38,ids=[];for(let i=0;i<N;i++)ids.push(i==WI?win:roll(ci));
ov.className='ui';ov.innerHTML=`<div><div class=rl><div class=mk></div><div class=tr></div></div><h3 style="text-align:center;letter-spacing:5px;color:#f5a524">${c.n.toUpperCase()}</h3></div>`;const tr=ov.querySelector('.tr');
ids.forEach(id=>{const it=ITEM[id],d=E('div','ri');d.style.borderBottomColor=RAR[it.r][1];d.style.setProperty('--c',RAR[it.r][1]);d.append(icon(it,96),E('small','',it.n.split(' | ').join('<br>')));tr.append(d)});
SFX.open();tr.style.transform='translateX(0)';tr.offsetWidth;tr.style.transition='transform 3.2s cubic-bezier(.12,.7,.1,1)';tr.style.transform=`translateX(${-(WI*138+65-RW/2+(Math.random()*80-40))}px)`;
let last=-1;const iv=setInterval(()=>{const m=new DOMMatrix(getComputedStyle(tr).transform),i=Math.floor((RW/2-m.m41)/138);if(i!=last){last=i;SFX.tick()}},30);setTimeout(()=>{clearInterval(iv);reveal(wins)},3500)}
function reveal(x){if(Array.isArray(x)&&x.length>1)return revealMulti(x);const id=[].concat(x)[0],it=ITEM[id],col=RAR[it.r][1],dup=S.inv[id];S.inv[id]=(dup||0)+1;const rf=dup?REF[it.r]:0;S.$+=rf;delete S.pend;save();SFX.rare(it.r);
ov.innerHTML=`<div class=rv style="--c:${col}"><div class=glow></div><h3 style="color:${col}">${RAR[it.r][0].toUpperCase()}</h3><div id=bg></div><h2>${it.n}</h2><p>${dup?'Duplicate → +$'+rf:'NEW ITEM!'}</p><div class=row><button class=b id=eqp>EQUIP</button><button class="b s" id=cl>COLLECT</button></div></div>`;$('#bg').append(icon(it,240));$('#bg').style.filter=`drop-shadow(0 0 ${10+it.r*6}px ${col})`;$('#eqp').onclick=()=>{S.eq[it.t]=id;save();SFX.click();ov.className='ui hid';cases()};$('#cl').onclick=()=>{ov.className='ui hid';SFX.click();cases()}}
function revealMulti(ids){let tot=0,nw=0;const cells=ids.map(id=>{const it=ITEM[id],dup=S.inv[id];S.inv[id]=(dup||0)+1;const rf=dup?REF[it.r]:0;S.$+=rf;tot+=rf;if(!dup)nw++;return{it,dup,rf}});delete S.pend;save();
cells.sort((x,y)=>x.it.r-y.it.r);const n=cells.length,top=cells[n-1].it.r;
ov.style.background='#000e';ov.innerHTML=`<div class=rv><h3 style="color:#f5a524">${n} CASES OPENED</h3><div class=rg></div><p id=sm class=hd></p><div class="row hd" id=rw><button class=b id=cl>COLLECT</button></div></div>`;
const g=ov.querySelector('.rg'),sm=$('#sm'),rw=$('#rw');let k=0,tm=0,done=0;
const cards=cells.map(({it,dup,rf})=>{const d=E('div','ri dn');d.append(E('img','cb'),icon(it,96),E('small','',it.n.split(' | ').join('<br>')),E('em',dup?'':'nw',dup?'+$'+rf:'NEW'));d.firstChild.src=CRATE;g.append(d);return d});
const flash=col=>{const f=E('div','fx');f.style.background=col;ov.append(f);setTimeout(()=>f.remove(),700)};
const flip=(i,q)=>{const{it}=cells[i],d=cards[i],col=RAR[it.r][1];d.firstChild.remove();d.classList.remove('dn');d.style.setProperty('--c',col);d.style.borderBottomColor=col;if(i==n-1&&it.r==top)d.classList.add('best');if(q)return;d.classList.add('pop');if(it.r>=4)SFX.rare(it.r);else tone(300+it.r*120,.12,'triangle',.18);if(it.r>=5)flash(col)};
const fin=()=>{if(done)return;done=1;sm.textContent=`${nw} new · duplicates +$${tot}`;sm.classList.remove('hd');rw.classList.remove('hd')};
const gap=i=>i==n-2&&top>=3?750:Math.max(150,Math.min(380,2400/n));
const step=()=>{if(k>=n)return fin();flip(k++);tm=setTimeout(step,k>=n?500:gap(k-1))};
g.onclick=()=>{if(done)return;clearTimeout(tm);while(k<n)flip(k++,1);SFX.rare(top);fin()};
if(matchMedia('(prefers-reduced-motion:reduce)').matches){while(k<n)flip(k++,1);fin()}else tm=setTimeout(step,500);
$('#cl').onclick=()=>{clearTimeout(tm);ov.className='ui hid';ov.style.background='';SFX.click();cases()}}
function maps(){panel('MAPS',b=>{const w=E('div','big');MAPS.forEach((m,i)=>{const un=S.best>=m.u,d=E('div','card'+(S.map==i?' sel':'')+(un?'':' off'),`<div class=mp style="background:linear-gradient(${m.sky[0]},${m.sky[1]} 60%,${m.gr})">${m.n}</div><p>${un?'Payout x'+m.m+' · '+MODS[i]:'LOCKED · Reach score '+m.u}</p>`);d.style.setProperty('--c',m.c);d.style.cursor=un?'pointer':'default';if(un)d.onclick=()=>{S.map=i;save();SFX.click();maps()};w.append(d)});b.append(w)})}
let rs=0;function sets(){panel('SETTINGS',b=>{const d=E('div','set',`<label>Volume <input type=range min=0 max=100 value=${S.vol*100}></label>`);d.querySelector('input').oninput=e=>{S.vol=e.target.value/100;save();SFX.click()};
const mu=E('button','b s sm',S.mute?'SOUND: OFF':'SOUND: ON');mu.onclick=()=>{S.mute=!S.mute;save();sets();SFX.click()};const rb=E('button','b d sm',rs?'CLICK AGAIN TO CONFIRM':'RESET PROGRESS');rb.onclick=()=>{if(rs){S=DEF();save();rs=0;toMenu();pn.className='ui hid'}else{rs=1;sets()}};
const fb=E('button','b s sm','FULLSCREEN (F)');fb.onclick=()=>{SFX.click();fsT()};d.append(mu,fb,rb,E('p','','<small style="color:#8b95a8">Tap the opposite half = long jump · tap your own wall side = hop · tap in air = 2x jump. Keys: SPACE/W jump, A/D or arrows pick a side, P pauses, ESC ends run. Shield pickup saves you once.</small>'));b.append(d)})}
/* ---------- LOOP / INPUT ---------- */
addEventListener('keydown',e=>{const c=e.code;if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(c))e.preventDefault();if(e.repeat)return;if(c=='KeyF'){fsT();return}
if(mode=='play'&&G.pause){if(c=='KeyP'||c=='Space'||c=='Enter')G.pause=0;else if(c=='Escape')die(1);return}if(mode=='play'){if(c=='KeyP'){if(!G.dead)G.pause=1;return}if(c=='Space'||c=='ArrowUp'||c=='KeyW')jump(0);else if(c=='ArrowLeft'||c=='KeyA')jump(-1);else if(c=='ArrowRight'||c=='KeyD')jump(1);else if(c=='ArrowDown'||c=='KeyS')slide();else if(c=='Escape'&&!G.dead)die(1)}
else if(mode=='over'){if(c=='Space'||c=='Enter')play();else if(c=='Escape')toMenu()}});
C.addEventListener('pointerdown',e=>{au();if(mode!='play')return;e.preventDefault();const r=C.getBoundingClientRect(),px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;if(G.pause){G.pause=0;return}if(px*W>W-130&&py*H<110&&!G.dead){G.pause=1;return}tapJump(e,px<.5?-1:1)});
const fsT=()=>{const D=document;try{D.fullscreenElement?D.exitFullscreen():D.documentElement.requestFullscreen()}catch(_){}};
const SW_PX=18,SW_MS=80;let swp=null;
function tapJump(e,t){if(e.pointerType!='touch'){jump(t);return}if(swp){clearTimeout(swp.h);jump(swp.t)}const o={id:e.pointerId,x:e.clientX,y:e.clientY,t};o.h=setTimeout(()=>{if(swp===o){swp=null;jump(t)}},SW_MS);swp=o}
C.addEventListener('pointermove',e=>{if(!swp||e.pointerId!=swp.id)return;const dx=e.clientX-swp.x,dy=e.clientY-swp.y;if(dy>SW_PX&&dy>Math.abs(dx)*1.2){clearTimeout(swp.h);swp=null;slide()}});
['pointerup','pointercancel'].forEach(v=>C.addEventListener(v,e=>{if(!swp||e.pointerId!=swp.id)return;clearTimeout(swp.h);const t=swp.t;swp=null;jump(t)}));
// Browsers may drop offscreen canvas contents after a long idle, so rebuild the cached knife/digit canvases on return
const rc=()=>{for(const k in KC)delete KC[k];for(const k in DGC)delete DGC[k]};addEventListener('focus',rc);addEventListener('pageshow',rc);
const ap=()=>{if(mode=='play'&&G&&!G.dead)G.pause=1};addEventListener('blur',ap);document.addEventListener('visibilitychange',()=>{if(document.hidden)ap();else rc()});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('gesturestart',e=>e.preventDefault());
document.addEventListener('touchmove',e=>{if(!(e.target.closest&&e.target.closest('.pb')))e.preventDefault()},{passive:false});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b)b.blur()},true);
['pointerup','touchend','keydown'].forEach(v=>addEventListener(v,()=>au(),{passive:true}));
function fit(){if((innerHeight>innerWidth?1:0)!==PT){layout();if(G&&mode=='play'){G.x=G.side>0?RX-R:G.side<0?LX+R:clamp(G.x,LX+R,RX-R);G.coins=G.coins.filter(c=>c.x>LX&&c.x<RX);G.pause=1}}const s=Math.min(innerWidth/W,innerHeight/H),d=window.devicePixelRatio||1,k=Math.round(clamp(s*d*QL,1,2)*4)/4;st.style.transform=`translate(${(innerWidth-W*s)/2}px,${(innerHeight-H*s)/2}px) scale(${s})`;UK=Math.min(3,Math.max(1,Math.ceil(s*d)));if(k!==RK||C.width!==Math.round(W*k)){RK=k;C.width=Math.round(W*k);C.height=Math.round(H*k)}}
addEventListener('contextmenu',e=>e.preventDefault());addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('visibilitychange',()=>{if(!document.hidden&&AC&&AC.state!='running')AC.resume()});let WL=null;const wake=async()=>{try{if('wakeLock' in navigator&&!WL){WL=await navigator.wakeLock.request('screen');WL.addEventListener('release',()=>WL=null)}}catch(_){}};addEventListener('pointerdown',wake,{once:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)wake()});if('serviceWorker' in navigator&&location.protocol.startsWith('http'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));addEventListener('resize',fit);addEventListener('orientationchange',()=>setTimeout(fit,250));if(window.visualViewport)visualViewport.addEventListener('resize',fit);fit();
let last=performance.now();
function loop(now){requestAnimationFrame(loop);try{loopBody(now)}catch(e){try{console.error(e)}catch(_){}}}
function loopBody(now){const raw=now-last,dt=Math.min(.05,raw/1000);last=now;X.setTransform(RK,0,0,RK,0,0);fe=fe*.95+Math.min(raw,100)*.05;if(++fc>30){fc=0;if(fe>24&&QL>.55){QL-=.15;fit()}}const m=MAPS[S.map],t=now/1000;if(bgm!==S.map){bgm=S.map;bgsync()}
if(mode=='menu'){off+=70*dt;scene(m,off,t);X.save();X.translate(PT?W/2:380,PT?H*.36:480);X.scale(PT?3.2:3.8,PT?3.2:3.8);animal(X,ITEM[S.eq.a].k,{t,ph:t*5,ka:-.35+Math.sin(t*2)*.1});X.restore();fx(m)}
else if(G){if(!G.pause)upd(dt);drw(m,t);if(G.pause){X.fillStyle='#000b';X.fillRect(0,0,W,H);X.fillStyle='#fff';X.textAlign='center';X.font='900 80px "MojeRuka","Segoe UI",Arial';X.fillText('PAUSED',W/2,H/2-10);X.font='700 '+(PT?20:26)+'px "MojeRuka","Segoe UI",Arial';X.fillText('TAP / SPACE = RESUME · ESC = END RUN',W/2,H/2+50)}}}
let bgm=-1;function bgsync(){const m=MAPS[S.map],v=`linear-gradient(#000b,#000d),radial-gradient(ellipse at 50% 35%,${m.sky[1]},transparent 75%),linear-gradient(${m.sky[0]},${m.sky[1]} 55%,${m.sky[2]})`;document.documentElement.style.background=v;document.body.style.background=v}
const dec=i=>{try{return i.decode?i.decode().catch(()=>{}):Promise.resolve()}catch(e){return Promise.resolve()}};
let booted=0;const boot=()=>{if(booted)return;booted=1;mainMenu();top_();requestAnimationFrame(loop)};
S.map=0;
Promise.race([Promise.all([[SPK,CN,CRI,CKI,...Object.values(AS),...Object.values(GI),...Object.values(KI),...Object.values(DGI).flat()].map(dec),(()=>{try{return document.fonts?document.fonts.load('800 24px MojeRuka').catch(()=>{}):0}catch(e){return 0}})()].flat()),new Promise(r=>setTimeout(r,2500))]).then(boot,boot);
