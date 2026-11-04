/* ---------- 용사의 마왕 토벌기: idle RPG. Auto-hunt by default, manual control any time.
 Each region has a goal (beat N monsters, then its boss); once cleared the hero is carried to the next region automatically. */
(async()=>{
const SAVE_KEY='hero-rpg-v1';// separate from lost-home's save
const load=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src='assets/'+s;});
const[CHAR,LOG,NPC]=await Promise.all(['character.png','log.png','NPC_test.png'].map(load));
const MAPS=await buildMaps();
const LOGS={};for(const m of MAPS)LOGS[m.tone]=recolor(LOG,m.tone);const KING=recolor(NPC,'demon');
const GOAL=[8,10,10,12,0];// monsters to beat before the boss shows up, per region
// ---------- save ----------
const S=Object.assign({map:0,lv:1,exp:0,gold:0,talked:0,kills:0,bossDown:0,done:0},(()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');}catch(e){return{};}})());
const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}};
const need=l=>20+l*15,maxHp=()=>120+(S.lv-1)*14,atk=()=>Math.round(12*Math.pow(1.13,S.lv-1));
const P={x:0,y:0,hp:maxHp(),dir:2,t:0,atk:0,hitDone:false,inv:0,stuck:0,last:[0,0],path:null};
let respawn=[],mobs=[],fx=[],nums=[],shake=0,stop=0,auto=true,manualT=0,dialog=null,banner=null,bannerT=0,travel=0,fade=0;
const M=()=>MAPS[S.map];
// ---------- screen ----------
const root=document.getElementById('game'),cv=document.getElementById('cv'),g=cv.getContext('2d'),SC=Math.min(devicePixelRatio||1,2);
const btnAtk=document.getElementById('atk'),btnAuto=document.getElementById('auto');
// ---------- input ----------
const keys={};let joy=null,wantAtk=0;
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(dialog&&(e.key===' '||e.key==='Enter')){nextLine();return;}if(e.key===' ')wantAtk=1;});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);
btnAtk.onpointerdown=e=>{e.stopPropagation();wantAtk=1;manualT=3;};
btnAuto.onclick=e=>{e.stopPropagation();auto=!auto;btnAuto.classList.toggle('off',!auto);};
cv.addEventListener('pointerdown',e=>{if(dialog){nextLine();return;}if(e.clientX<innerWidth*.6)joy={x0:e.clientX,y0:e.clientY,dx:0,dy:0,id:e.pointerId};});
cv.addEventListener('pointermove',e=>{if(joy&&e.pointerId===joy.id){joy.dx=e.clientX-joy.x0;joy.dy=e.clientY-joy.y0;}});
addEventListener('pointerup',e=>{if(joy&&e.pointerId===joy.id)joy=null;});
function inputVec(){let x=(keys.arrowright||keys.d?1:0)-(keys.arrowleft||keys.a?1:0),y=(keys.arrowdown||keys.s?1:0)-(keys.arrowup||keys.w?1:0);if(joy&&Math.hypot(joy.dx,joy.dy)>8){x=joy.dx;y=joy.dy;}const l=Math.hypot(x,y);return l?[x/l,y/l]:null;}
// ---------- dialog / story ----------
function say(lines,then){dialog={lines,i:0,ch:0,then};}
function nextLine(){if(!dialog)return;const L=dialog.lines[dialog.i];if(dialog.ch<L[1].length){dialog.ch=L[1].length;return;}dialog.i++;dialog.ch=0;if(dialog.i>=dialog.lines.length){const t=dialog.then;dialog=null;t&&t();}}
const showBanner=t=>{banner=t;bannerT=2.6;};
function talk(){if(!S.talked)say([['촌장','오오, 젊은이! 마왕이 깨어난 뒤로 온 세상의 그루터기들이 날뛰고 있다네.'],['촌장','마을 근처 그루터기부터 정리해 주게. 그다음엔 북쪽 설원, 사막, 지옥을 지나 마왕성이지.'],['촌장','자네라면 할 수 있어. 부탁하네!']],()=>{S.talked=1;save();showBanner(`목표: ${M().enemy} ${GOAL[0]}마리`);});
 else say([['촌장',S.done?'마왕을 쓰러뜨린 영웅이여! 세상이 평화로워졌다네.':'마왕성은 멀고도 험하다네. 조심하게!']]);}
// ---------- monsters ----------
// grid path-finding for the auto pilot (8px cells; a cell is open if the hero's body fits)
const CS=8,GW=MW/CS|0,GH=MH/CS|0;
function bfs(tx,ty){const ok=(cx,cy)=>cx>=0&&cy>=0&&cx<GW&&cy<GH&&free(cx*CS+4,cy*CS+4)&&free(cx*CS+1,cy*CS+4)&&free(cx*CS+7,cy*CS+4);
 const sx=P.x/CS|0,sy=P.y/CS|0;let gx=Math.max(0,Math.min(GW-1,tx/CS|0)),gy=Math.max(0,Math.min(GH-1,ty/CS|0));
 const good=(cx,cy)=>ok(cx,cy)&&(!REACH||REACH[cy*GW+cx]);if(!good(gx,gy)){let b=null,bd=1e9;for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++)if(good(gx+dx,gy+dy)&&dx*dx+dy*dy<bd){bd=dx*dx+dy*dy;b=[gx+dx,gy+dy];}if(!b)return null;[gx,gy]=b;}
 const prev=new Int32Array(GW*GH).fill(-1),q=[sy*GW+sx];prev[sy*GW+sx]=sy*GW+sx;
 for(let h=0;h<q.length;h++){const c=q[h],cx=c%GW,cy=c/GW|0;if(cx===gx&&cy===gy){const path=[];let k=c;while(k!==prev[k]){path.unshift([(k%GW)*CS+4,(k/GW|0)*CS+4]);k=prev[k];}return path;}
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,n=ny*GW+nx;if(ok(nx,ny)&&prev[n]<0){prev[n]=c;q.push(n);}}}return null;}
// cells reachable on foot from the region's entrance; monsters only spawn and wander there
let REACH=null;function flood(){const ok=(cx,cy)=>cx>=0&&cy>=0&&cx<GW&&cy<GH&&free(cx*CS+4,cy*CS+4)&&free(cx*CS+1,cy*CS+4)&&free(cx*CS+7,cy*CS+4);
 const r=new Uint8Array(GW*GH),[sx,sy]=M().start,s0=(sy/CS|0)*GW+(sx/CS|0),q=[s0];r[s0]=1;for(let h=0;h<q.length;h++){const c=q[h],cx=c%GW,cy=c/GW|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=cx+dx,ny=cy+dy,n=ny*GW+nx;if(ok(nx,ny)&&!r[n]){r[n]=1;q.push(n);}}}
 REACH=r;}
const reachable=(x,y)=>REACH&&REACH[(y/CS|0)*GW+(x/CS|0)];

const tier=()=>S.map,mobHp=()=>Math.round(30*Math.pow(2.1,tier())),mobAtk=()=>Math.round(4*Math.pow(1.75,tier()));
const free=(x,y)=>!M().solid(x,y);
function spawn(boss){for(let i=0;i<200;i++){const x=20+Math.random()*280,y=40+Math.random()*420;if(reachable(x,y)&&free(x,y-8)&&Math.hypot(x-P.x,y-P.y)>(boss?120:80)){
 const hp=boss?mobHp()*(S.map===4?30:15):mobHp();mobs.push({x,y,boss,hp,max:hp,atk:boss?mobAtk()*2.5:mobAtk(),t:Math.random()*9,dir:0,hit:0,kb:[0,0],cd:1,wx:x,wy:y,dead:0,sz:boss?2:1});return;}}}
function enter(i,fresh){S.map=i;save();const m=M();[P.x,P.y]=m.start;P.path=null;mobs=[];respawn=[];fx=[];nums=[];flood();
 if(fresh){S.kills=0;S.bossDown=0;}
 if(i<4)for(let k=0;k<6;k++)spawn();
 if(i===4||S.kills>=GOAL[i]&&!S.bossDown)spawn(true);
 showBanner(m.name);}
enter(S.map,false);
const DIR=(dx,dy)=>Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2);
function moveBy(o,vx,vy,sp,dt){const nx=o.x+vx*sp*dt,ny=o.y+vy*sp*dt;if(free(nx,ny)){o.x=nx;o.y=ny;}else if(free(nx,o.y))o.x=nx;else if(free(o.x,ny))o.y=ny;else return false;o.dir=DIR(vx,vy);return true;}
function seek(o,tx,ty,sp,dt){const dx=tx-o.x,dy=ty-o.y,d=Math.hypot(dx,dy);if(d<1)return 0;if(!moveBy(o,dx/d,dy/d,sp,dt))moveBy(o,-dy/d,dx/d,sp,dt);return d;}
function navTo(tx,ty,sp,dt){P.navT=(P.navT||0)-dt;if(!P.path||P.navT<=0||Math.hypot((P.goal||[0,0])[0]-tx,(P.goal||[0,0])[1]-ty)>12){P.path=bfs(tx,ty)||[];P.navT=.6;P.goal=[tx,ty];}
 if(!P.path.length&&!reachable(P.x,P.y)){seek(P,M().rx(P.y),P.y,sp,dt);return;}let w=P.path[0];while(w&&Math.hypot(w[0]-P.x,w[1]-P.y)<3){P.path.shift();w=P.path[0];}if(!w)w=[tx,ty];seek(P,w[0],w[1],sp,dt);}
// ---------- combat ----------
const num=(x,y,t,c,big)=>nums.push({x,y,t,c,big,a:0});
function sparks(x,y,c,n=8){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=40+Math.random()*90;fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,t:0,life:.35,c});}}
function gainExp(e){S.exp+=e;while(S.exp>=need(S.lv)){S.exp-=need(S.lv);S.lv++;P.hp=maxHp();num(P.x,P.y-44,'LEVEL UP!','#7affd8',1);sparks(P.x,P.y-16,'#7affd8',20);}}
function swing(){if(P.atk>0)return;P.atk=.32;P.hitDone=false;}
function resolveHit(){P.hitDone=true;const fx0=[0,1,0,-1][P.dir],fy0=[1,0,-1,0][P.dir];
 for(const m of mobs){if(m.dead)continue;const dx=m.x-P.x,dy=m.y-P.y,d=Math.hypot(dx,dy);if(d>24*m.sz+4)continue;if(d>8&&(dx*fx0+dy*fy0)/d<.1)continue;
  const crit=Math.random()<.2,dmg=Math.round(atk()*(crit?2:1)*(.9+Math.random()*.2));m.hp-=dmg;m.hit=.15;const k=m.boss?30:90;m.kb=[dx/(d||1)*k,dy/(d||1)*k];
  num(m.x,m.y-28*m.sz,(crit?'CRIT ':'')+dmg,crit?'#ffd23a':'#fff',crit);sparks(m.x,m.y-10*m.sz,crit?'#ffd23a':'#fff',crit?14:8);stop=crit?.09:.05;shake=crit?6:3;
  if(m.hp<=0)kill(m);}}
function kill(m){m.dead=1;const gold=Math.round((m.boss?25:5+Math.random()*5)*Math.pow(2,S.map));S.gold+=gold;num(m.x,m.y-38*m.sz,'+'+gold+'G','#ffd23a');sparks(m.x,m.y-10,'#c89a5a',m.boss?40:16);gainExp(Math.round((m.boss?15:1)*8*Math.pow(1.7,S.map)));
 if(m.boss){S.bossDown=1;shake=12;if(S.map===4){S.done=1;save();say([['용사','마왕을… 쓰러뜨렸다!'],['용사','이제 마을로 돌아가자. 모두가 기다리고 있을 거야.']],()=>{showBanner('THE END · 마왕 토벌 완료!');travel=3;});}else{showBanner(`${M().boss} 처치! 다음 지역으로…`);travel=3;}}
 else{S.kills++;if(S.kills===GOAL[S.map]&&!S.bossDown){showBanner(`${M().boss} 등장!`);spawn(true);}else if(S.kills<GOAL[S.map])showBanner(`${M().enemy} ${S.kills}/${GOAL[S.map]}`),bannerT=1;respawn.push(1.5);}
 save();}
// ---------- auto pilot ----------
function autoGoal(){const m=M();if(m.npc&&!S.talked)return{x:m.npc.x,y:m.npc.y+18};
 let best=null,bd=1e9;for(const o of mobs){if(o.dead||!reachable(o.x,o.y))continue;const d=Math.hypot(o.x-P.x,o.y-P.y)-(o.boss?60:0);if(d<bd){bd=d;best=o;}}return best?{m:best}:null;}
function step(dt){
 if(dialog){dialog.ch=Math.min(dialog.lines[dialog.i][1].length,dialog.ch+dt*30);return;}
 // region cleared: fade out and carry the hero to the next region
 if(travel>0){travel-=dt;fade=Math.min(1,fade+dt*.8);if(travel<=0){travel=0;const next=S.map<4?S.map+1:0;S.kills=0;S.bossDown=0;enter(next,true);}}else fade=Math.max(0,fade-dt*1.5);
 if(stop>0){stop-=dt;return;}shake=Math.max(0,shake-dt*30);P.inv=Math.max(0,P.inv-dt);bannerT-=dt;manualT=Math.max(0,manualT-dt);
 const v=inputVec();if(v||wantAtk)manualT=3;
 if(P.atk>0){P.atk-=dt;if(!P.hitDone&&P.atk<.18)resolveHit();}else if(v){moveBy(P,v[0],v[1],70,dt);P.t+=dt;}
 if(wantAtk){swing();wantAtk=0;}
 if(auto&&manualT<=0&&P.atk<=0&&!travel){const goal=autoGoal();
  if(goal&&goal.m){const m=goal.m,d=Math.hypot(m.x-P.x,m.y-P.y);if(d>16+(m.sz-1)*14){navTo(m.x,m.y,62,dt);P.t+=dt;}else{P.dir=DIR(m.x-P.x,m.y-P.y);swing();}}
  else if(goal){navTo(goal.x,goal.y,66,dt);P.t+=dt;}
  if(Math.hypot(P.x-P.last[0],P.y-P.last[1])<.2)P.stuck+=dt;else P.stuck=0;P.last=[P.x,P.y];if(P.stuck>.8){P.path=null;P.stuck=0;}}
 const m=M();if(m.npc&&Math.hypot(P.x-m.npc.x,P.y-(m.npc.y+12))<18&&!P.talkedNow){P.talkedNow=1;talk();}if(m.npc&&Math.hypot(P.x-m.npc.x,P.y-(m.npc.y+12))>34)P.talkedNow=0;
 for(const o of mobs){if(o.dead){o.dead+=dt;continue;}o.t+=dt;o.hit=Math.max(0,o.hit-dt);if(!reachable(o.x,o.y)){o.lost=(o.lost||0)+dt;if(o.lost>2){o.dead=.5;o.boss?spawn(true):respawn.push(.1);continue;}}else o.lost=0;
  if(Math.hypot(o.kb[0],o.kb[1])>1){const nx=o.x+o.kb[0]*dt,ny=o.y+o.kb[1]*dt;if(free(nx,ny)){o.x=nx;o.y=ny;}o.kb=[o.kb[0]*.85,o.kb[1]*.85];continue;}
  const dh=Math.hypot(P.x-o.x,P.y-o.y);o.cd-=dt;
  if(dh<(o.boss?150:70)&&!travel){if(dh>14*o.sz)seek(o,P.x,P.y,o.boss?22:26,dt);else if(o.cd<=0&&P.inv<=0){o.cd=o.boss?1.6:1.2;P.hp=Math.max(0,P.hp-o.atk);P.inv=.4;num(P.x,P.y-34,'-'+o.atk,'#ff5a5a');shake=Math.max(shake,o.boss?7:2);}}
  else{if(Math.hypot(o.wx-o.x,o.wy-o.y)<3){const wx=o.x+(Math.random()-.5)*60,wy=o.y+(Math.random()-.5)*60;if(reachable(wx,wy)){o.wx=wx;o.wy=wy;}}seek(o,o.wx,o.wy,14,dt);}}
 mobs=mobs.filter(o=>!(o.dead>.5));
 for(let i=respawn.length-1;i>=0;i--){respawn[i]-=dt;if(respawn[i]<=0){respawn.splice(i,1);if(!travel&&mobs.filter(o=>!o.dead&&!o.boss).length<6)spawn();}}
 if(P.hp<=0){P.hp=maxHp();showBanner('쓰러졌다… 다시 일어났다');[P.x,P.y]=M().start;P.path=null;}
 P.hp=Math.min(maxHp(),P.hp+dt*(2+S.lv*.3));
 for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.vy+=200*dt;if(f.t>f.life)fx.splice(i,1);}
 for(let i=nums.length-1;i>=0;i--){nums[i].a+=dt;if(nums[i].a>.9)nums.splice(i,1);}}
// ---------- drawing ----------
function panel(x,y,w,h){g.fillStyle='#1c1420';g.fillRect(x-1,y-1,w+2,h+2);g.fillStyle='#e8dcc8';g.fillRect(x,y,w,h);g.fillStyle='#fff6e6';g.fillRect(x+1,y+1,w-2,2);g.fillStyle='#b8a888';g.fillRect(x+1,y+h-3,w-2,2);}
function draw(){const W=cv.clientWidth,H=cv.clientHeight;if(cv.width!==Math.round(W*SC)||cv.height!==Math.round(H*SC)){cv.width=Math.round(W*SC);cv.height=Math.round(H*SC);}
 g.imageSmoothingEnabled=false;const z=Math.max(2,Math.floor(Math.min(cv.width/MW*1.6,cv.height/MH*1.6)));
 const vw=cv.width/z,vh=cv.height/z,cx=Math.max(0,Math.min(MW-vw,P.x-vw/2)),cy=Math.max(0,Math.min(MH-vh,P.y-vh/2));
 const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;g.setTransform(z,0,0,z,(-cx+sx)*z|0,(-cy+sy)*z|0);
 g.fillStyle='#000';g.fillRect(cx-10,cy-10,vw+20,vh+20);g.drawImage(M().bg,0,0);
 const tone=M().tone,ents=[];
 for(const o of mobs)ents.push({y:o.y,d:()=>{const fr=((o.t*8)|0)%4,s=o.sz,a=o.dead?Math.max(0,1-o.dead*2):1;g.globalAlpha=a;g.fillStyle='rgba(10,6,20,.3)';g.fillRect(o.x-8*s|0,o.y-2|0,16*s,3*s);
   if(o.boss&&S.map===4){g.drawImage(KING,0,0,16,32,o.x-16|0,o.y-62|0,32,64);}else{const L=LOGS[tone];g.drawImage(L,fr*32,0,32,32,o.x-16*s|0,o.y-28*s|0,32*s,32*s);
    if(o.boss){g.globalCompositeOperation='lighter';g.globalAlpha=.25+.1*Math.sin(o.t*4);g.drawImage(L,fr*32,0,32,32,o.x-16*s|0,o.y-28*s|0,32*s,32*s);g.globalCompositeOperation='source-over';g.globalAlpha=a;}
    if(o.hit>0){g.globalCompositeOperation='lighter';g.globalAlpha=o.hit/.15*.8;g.drawImage(L,fr*32,0,32,32,o.x-16*s|0,o.y-28*s|0,32*s,32*s);g.globalCompositeOperation='source-over';}}g.globalAlpha=1;
   if(!o.dead&&(o.hp<o.max||o.boss)){const w=o.boss?40:18;g.fillStyle='#1c1420';g.fillRect(o.x-w/2-1|0,o.y-31*s|0,w+2,4);g.fillStyle=o.boss?'#b03aff':'#e8483a';g.fillRect(o.x-w/2|0,o.y-30*s|0,w*o.hp/o.max|0,2);}}});
 const npc=M().npc;if(npc)ents.push({y:npc.y+30,d:()=>{g.fillStyle='rgba(10,6,20,.3)';g.fillRect(npc.x-6,npc.y+29,12,3);g.drawImage(NPC,0,0,16,32,npc.x-8,npc.y,16,32);
   if(!S.talked){const b=Math.sin(performance.now()/200)*1.5;g.font='bold 10px sans-serif';g.textAlign='center';g.lineWidth=3;g.strokeStyle='#1c1420';g.strokeText('!',npc.x,npc.y-4+b);g.fillStyle='#ffd23a';g.fillText('!',npc.x,npc.y-4+b);}}});
 ents.push({y:P.y,d:()=>{g.fillStyle='rgba(10,6,20,.3)';g.fillRect(P.x-6|0,P.y-1|0,12,3);if(P.inv>0&&((P.inv*20)|0)%2)return;
   if(P.atk>0){const fr=Math.min(3,((.32-P.atk)/.32*4)|0),row=[0,2,1,3][P.dir];g.drawImage(CHAR,fr*32,128+row*32,32,32,P.x-16|0,P.y-28|0,32,32);}
   else{const moving=(auto&&manualT<=0&&!travel)||inputVec(),fr=moving?((P.t*8)|0)%4:0;g.drawImage(CHAR,fr*16,P.dir*32,16,32,P.x-8|0,P.y-30|0,16,32);}}});
 ents.sort((a,b)=>a.y-b.y);for(const e of ents)e.d();
 for(const f of fx){g.globalAlpha=1-f.t/f.life;g.fillStyle=f.c;g.fillRect(f.x|0,f.y|0,2,2);}g.globalAlpha=1;
 g.textAlign='center';for(const n of nums){g.font=`bold ${n.big?11:9}px sans-serif`;const y=n.y-n.a*22,al=n.a<.7?1:1-(n.a-.7)/.2;g.globalAlpha=al;g.lineWidth=3;g.strokeStyle='#1c1420';g.strokeText(n.t,n.x,y);g.fillStyle=n.c;g.fillText(n.t,n.x,y);}g.globalAlpha=1;
 // HUD
 g.setTransform(SC,0,0,SC,0,0);
 panel(8,8,170,34);g.textAlign='left';g.fillStyle='#1c1420';g.font='bold 12px sans-serif';g.fillText(`Lv.${S.lv}  용사`,14,22);g.textAlign='right';g.font='11px sans-serif';g.fillText(`${S.gold.toLocaleString()} G`,172,22);
 g.fillStyle='#1c1420';g.fillRect(14,27,158,6);g.fillStyle='#e8483a';g.fillRect(15,28,156*P.hp/maxHp(),4);g.fillStyle='#3a8ad8';g.fillRect(14,35,158*S.exp/need(S.lv),2);
 const goal=S.map===0&&!S.talked?'촌장에게 말을 걸자':S.bossDown?'다음 지역으로 이동 중…':S.kills<GOAL[S.map]?`${M().enemy} ${S.kills}/${GOAL[S.map]}`:`${M().boss} 처치`;
 panel(8,48,170,20);g.textAlign='left';g.fillStyle='#5a2a00';g.font='bold 10px sans-serif';g.fillText(`${S.map+1}. ${M().name} · ${goal}`,13,61);
 if(bannerT>0&&banner){g.globalAlpha=Math.min(1,bannerT*2);g.textAlign='center';g.font='bold 16px sans-serif';g.lineWidth=4;g.strokeStyle='#1c1420';g.strokeText(banner,W/2,H*.3);g.fillStyle='#fff';g.fillText(banner,W/2,H*.3);g.globalAlpha=1;}
 if(joy){g.globalAlpha=.4;g.fillStyle='#fff';g.beginPath();g.arc(joy.x0,joy.y0,34,0,6.28);g.fill();g.globalAlpha=.7;const l=Math.min(28,Math.hypot(joy.dx,joy.dy)),a=Math.atan2(joy.dy,joy.dx);g.beginPath();g.arc(joy.x0+Math.cos(a)*l,joy.y0+Math.sin(a)*l,14,0,6.28);g.fill();g.globalAlpha=1;}
 if(dialog){const L=dialog.lines[dialog.i],bx=10,by=H-150,bw=W-20,bh=86;panel(bx,by,bw,bh);g.drawImage(L[0]==='용사'?CHAR:NPC,0,0,16,32,bx+8,by+10,32,64);g.textAlign='left';g.fillStyle='#8a2a00';g.font='bold 13px sans-serif';g.fillText(L[0],bx+48,by+22);
  g.fillStyle='#1c1420';g.font='12px sans-serif';const txt=L[1].slice(0,dialog.ch|0);let line='',yy=by+42;for(const ch of txt){if(g.measureText(line+ch).width>bw-60){g.fillText(line,bx+48,yy);line='';yy+=17;}line+=ch;}g.fillText(line,bx+48,yy);
  if(dialog.ch>=L[1].length){g.fillStyle='#8a2a00';g.fillText('▼',bx+bw-18,by+bh-10);}}
 if(fade>0){g.fillStyle=`rgba(0,0,0,${fade})`;g.fillRect(0,0,W,H);}
 btnAtk.style.display=dialog?'none':'';}
let last=performance.now(),saveT=5;
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;step(dt);draw();saveT-=dt;if(saveT<0){saveT=5;save();}requestAnimationFrame(loop);}requestAnimationFrame(loop);
addEventListener('visibilitychange',()=>{if(document.hidden)save();});
document.getElementById('reset').onclick=()=>{if(confirm('처음부터 다시 시작할까요? 진행이 모두 지워져요.')){localStorage.removeItem(SAVE_KEY);location.reload();}};
window.RPG={S,P,step,get mobs(){return mobs},get dialog(){return dialog},nextLine};
})();
