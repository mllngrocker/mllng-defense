/* ---------- battle ---------- */
const bgStage=new BG($('#bg')),fg=$('#fg'),fc=fg.getContext('2d');
let W=400,H=420,K=1,GY=336,BX=100,scroll=0,shake=0,hitstop=0,curTheme=-1,boss=null,bossT=0;
const bear={hp:1,atk:-1,cd:0,hit:0,dead:false,deadT:0,ph:0,walk:0,regT:0};
const mobs=[],shots=[];
function resizeStage(){const r=$('#stage').getBoundingClientRect();if(!(r.width>0&&r.height>0))return;W=r.width;H=r.height;DPR=Math.min(window.devicePixelRatio||1,2);
 fg.width=W*DPR;fg.height=H*DPR;const q=Math.min(DPR,1.5);bgStage.resize(Math.round(W*q),Math.round(H*q));
 K=H/430;GY=H*(1-bgStage.ground);BX=W*.24;}
function mobDef(id){const d=MOBS[id];return{id,name:d[0],arch:d[1],sub:d[2],b:d[3],a:d[4],fly:d[5].includes('f'),ranged:d[5].includes('r')};}
function mkMob(id,x,tier){const d=mobDef(id),g=S.g+loopMul()*0;const hpM=tier===2?20:tier===1?5:1,atM=tier===2?3:tier===1?1.8:1;
 const size=d.arch==='human'?(id==='king'?1.15:1):(tier===2?(d.arch==='golem'?1.15:1.75):tier===1?1.3:1)*(d.arch==='golem'&&tier!==2?.62:1);
 return Object.assign(d,{x,y:d.fly?GY-rnd(55,85)*K:GY,hp:mobHp(g)*hpM,max:mobHp(g)*hpM,dmg:mobAtk(g)*atM,cd:rnd(.3,1.2),atk:-1,ph:rnd(0,6),seed:rnd(0,9),tier,size,hit:0,kb:0,dead:false,dt:0,spd:rnd(55,75)*(d.fly?1.15:1)});}
function spawnWave(){const th=theme(),n=3+Math.floor(Math.random()*3);
 for(let i=0;i<n;i++){const mid=Math.random()<.12&&i===n-1;mobs.push(mkMob(mid?pick(th.mids):pick(th.mobs),W+40*K+i*rnd(55,80)*K,mid?1:0));}}
function startBoss(){const th=theme();boss=mkMob(th.boss,W+80*K,2);mobs.push(boss);bossT=30;S.farm=false;banner('BOSS!','#ff5a6a');sfx('boss');shake=10;updateHud();}
function bossFail(){if(!boss)return;boss=null;for(const m of mobs)m.dead=true,m.dt=.01;S.farm=true;S.kills=0;toast('보스를 물리치지 못했어요. 더 강해져서 다시 도전해요!');save();updateHud();}
function stageClear(){S.g++;S.kills=0;S.best=Math.max(S.best,S.g);S.gem+=3;save();sfx('clear');
 if(S.g%200===0)modal('마왕 녹스를 쓰러뜨렸어요!','오염의 근원이 사라지고, 북극의 빙하가 다시 얼기 시작했어요.<br>백곰은 마침내 고향으로 돌아갑니다.<br><br><b>더 강해진 세계에서 여정이 다시 시작돼요.</b>',[['계속하기',null,1]]);
 const th=theme();banner(S.g%10===0?th.name:`STAGE ${stageName(S.g)}`,S.g%10===0?'#9fdcff':'#ffe27a');if(S.g%10===9)toast('다음은 챕터 보스 스테이지예요!');applyTheme();updateHud();}
function applyTheme(){const i=Math.floor(S.g/10)%THEMES.length;if(i!==curTheme){curTheme=i;bgStage.theme(THEMES[i]);}}
function gainExp(v){S.exp+=v;let up=false;while(S.exp>=needExp(S.lv)){S.exp-=needExp(S.lv);S.lv++;S.gem+=10;up=true;}
 if(up){banner('LEVEL UP!','#8ae86a');sfx('level');bear.hp=MAXHP();ring(BX,GY,'#8ae86a',60*K,.6);sparks(BX,GY-60*K,20,'#b8ff8a',300);}}
function killMob(m){m.dead=true;m.dt=0;const g=S.g,gold=mobGold(g)*(m.tier===2?25:m.tier===1?4:1);S.gold+=gold;S.stats.gold+=gold;S.stats.kills++;gainExp(mobExp(g)*(m.tier===2?20:m.tier===1?3:1));
 const cx=m.x,cy=m.y-ART_H[m.arch]*.4*K*m.size;debris(cx,cy,m.tier?16:9,m.b,K);sparks(cx,cy,12,m.a,320);ring(cx,m.fly?cy:GY,'rgba(255,255,255,.8)',40*K*m.size);sfx('kill');
 for(let i=0,n=m.tier?8:3;i<n;i++)part({x:cx,y:cy,vx:rnd(-140,140),vy:rnd(-380,-180),g:1100,life:1,ml:1,size:5.5*K,type:'coin',rot:rnd(0,6),vr:9,tx:GOLDX,ty:GOLDY,drag:.99});
 num(cx,cy-20*K,'+'+fmt(gold),'gold');
 if(m===boss){boss=null;S.stats.bosses++;S.gem+=30;hitstop=.25;shake=14;banner('BOSS CLEAR!','#ffd23a');stageClear();return;}
 if(!S.farm&&S.g%10!==9){S.kills++;if(S.kills>=KILLS)stageClear();}
 else if(!S.farm&&S.g%10===9){S.kills=Math.min(KILLS,S.kills+1);}
 updateHud();}
function hitMob(m,dmg,crit){m.hp-=dmg;m.hit=1;m.kb+=(m.tier===2?3:14)*K*(crit?1.6:1);const cy=m.y-ART_H[m.arch]*.45*K*m.size;
 num(m.x,cy-ART_H[m.arch]*.3*K*m.size,dmg,crit?'crit':'');sparks(m.x-ART_W[m.arch]*K*m.size*.5,cy,crit?14:7,crit?'#ffe27a':'#ffffff',crit?380:260);
 if(crit){shake=Math.max(shake,6);hitstop=Math.max(hitstop,.05);sfx('crit');}else sfx('hit');if(m.hp<=0)killMob(m);}
function front(){let best=null;for(const m of mobs)if(!m.dead&&(!best||m.x<best.x))best=m;return best;}
function reachX(m){return BX+(40+ART_W[m.arch]*m.size)*K;}
function hurtBear(d){if(bear.dead)return;bear.hp-=d;bear.hit=1;num(BX,GY-110*K,d,'hurt');sfx('hurt');shake=Math.max(shake,3);
 if(bear.hp<=0){bear.dead=true;bear.deadT=1.6;bear.hp=0;dust(BX,GY,10,K);if(boss)bossFail();}}
function step(dt){
 S.stats.play+=dt;applyTheme();
 // bear
 bear.hit=Math.max(0,bear.hit-dt*5);
 if(bear.dead){bear.deadT-=dt;if(bear.deadT<=0){bear.dead=false;bear.hp=MAXHP();for(const m of mobs)m.x+=120*K;ring(BX,GY,'#9fdcff',50*K);}}
 else bear.hp=Math.min(MAXHP(),bear.hp+REGEN()*dt);
 const f=front(),engaged=f&&f.x<=reachX(f)+10*K;
 bear.walk=lerp(bear.walk,(!engaged&&!bear.dead)?1:0,dt*6);const spd=120*K*bear.walk;
 scroll+=spd*dt/H;bear.ph+=dt*9*bear.walk;
 if(bear.atk>=0){bear.atk+=dt/bear.ad;
  if(!bear.done&&bear.atk>=.5){bear.done=true;const t=front();if(t&&t.x<=reachX(t)+14*K){const crit=Math.random()*100<stat('crit');const dmg=ATK()*(crit?stat('critd')/100:1)*rnd(.92,1.08);
   slash(t.x-ART_W[t.arch]*t.size*K*.4,t.y-ART_H[t.arch]*t.size*K*.4,K*(t.tier===2?1.6:1),crit);hitMob(t,dmg,crit);
   for(const o of mobs)if(o!==t&&!o.dead&&o.x<t.x+50*K)hitMob(o,dmg*.4,false);}}
  if(bear.atk>=1)bear.atk=-1;}
 bear.cd-=dt;const interval=1/(1.6*stat('aspd'));
 if(!bear.dead&&bear.atk<0&&bear.cd<=0&&f&&f.x<=reachX(f)+10*K){bear.atk=0;bear.done=false;bear.ad=Math.min(.38,interval*.9);bear.cd=interval;}
 // mobs
 if(!boss&&S.g%10===9&&!S.farm&&S.kills>=KILLS&&!mobs.some(m=>!m.dead))startBoss();
 if(!mobs.some(m=>!m.dead)&&!(S.g%10===9&&!S.farm&&S.kills>=KILLS))spawnWave();
 if(boss){bossT-=dt;if(bossT<=0)bossFail();}
 for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];m.hit=Math.max(0,m.hit-dt*6);
  if(m.dead){m.dt+=dt;if(m.dt>.35)mobs.splice(i,1);continue;}
  m.x+=m.kb*dt*8;m.kb*=Math.pow(.02,dt);
  const stop=m.ranged?BX+170*K:reachX(m),ahead=mobs.find(o=>o!==m&&!o.dead&&o.x<m.x&&m.x-o.x<(ART_W[o.arch]*o.size+ART_W[m.arch]*m.size)*K*.9&&!o.fly&&!m.fly);
  const moving=m.x>stop&&!ahead;if(moving){m.x-=(m.spd*K+spd)*dt;m.ph+=dt*8;}else if(bear.walk>.1)m.x-=spd*dt;
  m.y=m.fly?GY-(70+Math.sin(performance.now()/600+m.seed)*10)*K:GY;
  if(m.atk>=0){m.atk+=dt/.45;if(!m.done&&m.atk>=.5){m.done=true;if(m.ranged){shots.push({x:m.x-20*K,y:m.y-ART_H[m.arch]*.45*K*m.size,vx:-300*K,col:m.a,dmg:m.dmg});sfx('shot');}else if(!bear.dead)hurtBear(m.dmg);}if(m.atk>=1)m.atk=-1;}
  m.cd-=dt;if(!moving&&m.x<=stop+6*K&&m.cd<=0&&m.atk<0&&!bear.dead){m.atk=0;m.done=false;m.cd=m.tier===2?1.6:1.4;}}
 for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.x+=s.vx*dt;if(s.x<BX+18*K){if(!bear.dead)hurtBear(s.dmg);sparks(s.x,s.y,6,s.col,200);shots.splice(i,1);}}
 stepFx(dt);
}
/* ---------- render ---------- */
const bearWithSwing=(c,m)=>{drawBear(c,m);drawSwing(c,m);};
function shadow(x,w){fc.fillStyle='rgba(10,20,40,.28)';fc.beginPath();fc.ellipse(x,GY+2*K,w,w*.22,0,0,TAU);fc.fill();}
const stageEl=$('#stage');
function render(t){
 if(stageEl.clientWidth!==Math.round(W)||stageEl.clientHeight!==Math.round(H)){const oG=GY;resizeStage();for(const m of mobs)m.y+=GY-oG;}
 const sx=shake?rnd(-shake,shake):0,sy=shake?rnd(-shake,shake):0;
 $('#bg').style.transform=fg.style.transform=shake?`translate(${sx}px,${sy}px)`:'';
 bgStage.draw(t,scroll);
 fc.setTransform(DPR,0,0,DPR,0,0);fc.clearRect(0,0,W,H);
 for(const m of mobs)if(!m.dead)shadow(m.x,ART_W[m.arch]*K*m.size*(m.fly?.6:1));if(!bear.dead)shadow(BX,30*K);
 const sorted=mobs.slice().sort((a,b)=>b.x-a.x);
 for(const m of sorted){const dd=m.dead?m.dt/.35:0;const s=K*m.size*(1+dd*.3);
  drawEnt(fc,ART[m.arch],{t,ph:m.ph,atk:m.atk,a:m.a,b:m.b,sub:m.sub,seed:m.seed,id:m.id},m.x,m.y,s,m.dead?1:m.hit,1-dd);
  if(!m.dead&&m.tier!==2&&m.hp<m.max){const w=44*K*m.size,y=m.y-(ART_H[m.arch]+14)*K*m.size;fc.fillStyle='rgba(10,15,30,.6)';rr(fc,m.x-w/2-1,y-1,w+2,7,3.5);fc.fill();fc.fillStyle=m.tier?'#ffb03a':'#ff5b6e';rr(fc,m.x-w/2,y,w*clamp(m.hp/m.max,0,1),5,2.5);fc.fill();}}
 if(!bear.dead||Math.floor(t*10)%2)drawEnt(fc,bearWithSwing,{t,ph:bear.ph,walk:bear.walk,atk:bear.atk},BX,GY,K*.95,bear.hit*.7,bear.dead?.5:1);
 fc.globalCompositeOperation='lighter';for(const s of shots){const g=fc.createRadialGradient(s.x,s.y,0,s.x,s.y,12*K);g.addColorStop(0,'#fff');g.addColorStop(.4,s.col);g.addColorStop(1,'rgba(0,0,0,0)');fc.fillStyle=g;fc.beginPath();fc.arc(s.x,s.y,12*K,0,TAU);fc.fill();}
 fc.globalCompositeOperation='source-over';
 drawFx(fc,K);
 // bear hp bar
 const bw=60*K,by=GY+12*K;fc.fillStyle='rgba(10,15,30,.55)';rr(fc,BX-bw/2-1,by-1,bw+2,8,4);fc.fill();const hpk=clamp(bear.hp/MAXHP(),0,1);
 const hg=fc.createLinearGradient(BX-bw/2,0,BX+bw/2,0);hg.addColorStop(0,'#5fd35a');hg.addColorStop(1,'#c3ff79');fc.fillStyle=hpk<.3?'#ff5b6e':hg;rr(fc,BX-bw/2,by,bw*hpk,6,3);fc.fill();
 // boss bar
 if(boss&&!boss.dead){const w=W*.7,x=(W-w)/2,y=H-34*K;fc.font=`${15*K}px Jal, sans-serif`;fc.textAlign='center';fc.lineWidth=4;fc.strokeStyle='#1a1028';fc.strokeText(boss.name,W/2,y-8);fc.fillStyle='#ffd0d6';fc.fillText(boss.name,W/2,y-8);
  fc.fillStyle='rgba(10,10,25,.7)';rr(fc,x-2,y-2,w+4,14,7);fc.fill();const bg2=fc.createLinearGradient(x,0,x+w,0);bg2.addColorStop(0,'#ff3d5a');bg2.addColorStop(1,'#ff9a6a');fc.fillStyle=bg2;rr(fc,x,y,w*clamp(boss.hp/boss.max,0,1),10,5);fc.fill();}
}
