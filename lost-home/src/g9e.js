<script>
/* ================= 던전 · 도감 · 펫 스킬 (1차 틀) ================= */
/* ---------- 던전 ---------- */
const DUNS={
 gold:{n:'골드 던전',d:'45초 동안 몰려오는 보물 도깨비를 잡아 골드를 왕창 모아요',ic:'coin',t:45,col:'#ffd23a'},
 gem:{n:'보석 던전',d:'30초 안에 수정 골렘을 최대한 때려 보석을 캐요',ic:'gem',t:30,col:'#5ac8ff'},
 stone:{n:'강화석 던전',d:'40초 동안 버티며 강화석을 모아요 · 장비를 +1 강화',ic:'stone',t:40,col:'#c88aff'}};
const DUN_TIX=2;
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
if(!S.dun)S.dun={};if(S.stone==null)S.stone=0;
function dunState(k){let s=S.dun[k];if(!s)s=S.dun[k]={tix:DUN_TIX,day:today(),best:0,clears:0};if(s.day!==today()){s.day=today();s.tix=DUN_TIX}return s}
let dunK=null,dunT=0,dunGain=0,dunHit=0,dunBoss=null,dunSpawnT=0;
function dunEnter(k){const s=dunState(k);if(s.tix<=0){toast('오늘 입장권을 다 썼어요 · 내일 다시 충전돼요');return}if(mode!=='farm'||bear.dead){toast('지금은 입장할 수 없어요');return}
  s.tix--;dunK=k;dunT=DUNS[k].t;dunGain=0;dunHit=0;dunBoss=null;dunSpawnT=0;mode='dun';eShots=[];mobs.forEach(m=>{if(!m.dead){m.dead=1;m.dt=0;m.noLoot=1}});$('#bossBtn').hidden=true;bear.hp=MAXHP();
  banner(DUNS[k].n+'!',DUNS[k].col);sfx('boss');setBgm('boss');save();if(bear.name!==runName()){UP()?play(bear,'walk2'):play(bear,'drop',()=>play(bear,'run'))}runT=0;tab='grow';
  document.querySelectorAll('#nav button').forEach(x2=>x2.classList.toggle('on',x2.dataset.t==='grow'));renderPanel()}
function dunMob(type,hpMul,s){const m=mkMob(type,s||1,hpMul,false);m.dunMob=1;return m}
{const _sw=spawnWave;spawnWave=function(){if(mode!=='dun')return _sw();const th=theme();
  if(dunK==='gem'){if(!dunBoss||dunBoss.dead){const m=mkMob(th.fin,2,1e6,true,'dun');m.atk*=.4;m.x=200;m.dunMob=1;dunBoss=m;mobs.push(m)}return}
  const n=dunK==='gold'?8:6;for(let i=0;i<n;i++){const m=dunMob(pick(th.mobs),dunK==='gold'?.45:.8);m.x=190+i*16;if(dunK==='gold')m.gold=1;mobs.push(m)}}}
function dunSim(dt){dunT-=dt;
  if(dunK==='gem'&&dunBoss&&!dunBoss.dead){const lost=dunBoss.max-dunBoss.hp;dunHit=lost/(mobHp(effG())*6)}
  if(dunT<=0)dunEnd(true)}
{const _km=killMob;killMob=function(m){if(m.dunMob&&mode==='dun'){if(dunK==='gold'){const g=mobGold(effG())*6*(1+PBf('gold')/100);dunGain+=g;S.gold+=g;for(let i=0;i<4;i++)coins.push({x:m.x*K,y:(GY-10)*K,vx:rnd(-120,240),vy:rnd(-650,-380),t:0,v:0,fly:0})}
  if(dunK==='stone'){dunGain+=1;num(m.x,GY-30,1,'norm',m)}m.noLoot=1}
  dexKill(m.type);return _km(m)}}
function dunEnd(win){if(mode!=='dun')return;const k=dunK,s=dunState(k);let rew='';
  if(k==='gold'){rew=`골드 +${fmt(dunGain)}`;s.best=Math.max(s.best,dunGain)}
  if(k==='gem'){const g=Math.min(120,Math.max(5,Math.floor(10+Math.log10(1+dunHit)*25)));S.gem+=g;rew=`보석 +${g}`;s.best=Math.max(s.best,g)}
  if(k==='stone'){const st=Math.max(1,Math.floor(dunGain*(1+ch()*.25)));S.stone+=st;rew=`강화석 +${st}`;s.best=Math.max(s.best,st)}
  s.clears++;mode='farm';dunK=null;dunBoss=null;eShots=[];mobs.forEach(m=>{if(!m.dead){m.dead=1;m.dt=0;m.noLoot=1}});setBgm(chBgm());runT=0;if(!win)bear.dead=0,bear.hp=MAXHP();
  sfx('clear');save();modal(DUNS[k].n+(win?' 완료!':' 종료'),win?'시간 종료! 모은 보상이에요.':'북실이가 쓰러졌지만 모은 보상은 챙겼어요.',rew,'확인')}
{const _hud=hud;hud=function(){_hud();if(mode!=='dun')return;H$.sb.classList.add('boss');H$.sn.textContent=DUNS[dunK].n;H$.sp.textContent=Math.ceil(Math.max(0,dunT))+'초';
  H$.sf.style.width=(dunT/DUNS[dunK].t*100)+'%';if(dunK==='gem')H$.sp.textContent=`${Math.ceil(Math.max(0,dunT))}초 · 보석 ${Math.min(120,Math.max(5,Math.floor(10+Math.log10(1+dunHit)*25)))}`;if(dunK==='stone')H$.sp.textContent=`${Math.ceil(Math.max(0,dunT))}초 · 강화석 ${dunGain}`}}
/* 강화석 아이콘 */
UIK.stone=x=>{hglow(x,48,50,44,'rgba(200,140,255,.5)');const P=()=>{x.moveTo(48,8);x.lineTo(80,30);x.lineTo(74,74);x.lineTo(48,90);x.lineTo(22,74);x.lineTo(16,30);x.closePath()};hsh(x,P,hg(x,16,8,80,90,['#f4e0ff','#c88aff','#7a3ad8','#3a0e7a']),6);
  hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.moveTo(48,8);x.lineTo(16,30);x.lineTo(32,40);x.lineTo(48,30);x.fill();x.fillStyle='rgba(30,0,60,.3)';x.beginPath();x.moveTo(48,52);x.lineTo(74,74);x.lineTo(48,90);x.fill();
   x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.6;x.beginPath();x.moveTo(32,40);x.lineTo(48,52);x.lineTo(64,40);x.moveTo(48,52);x.lineTo(48,90);x.stroke()});
  x.save();x.translate(48,50);x.strokeStyle=HO;x.lineWidth=7;x.beginPath();x.moveTo(0,-10);x.lineTo(0,10);x.moveTo(-10,0);x.lineTo(10,0);x.stroke();x.strokeStyle='#fff6a0';x.lineWidth=3.5;x.stroke();x.restore();hglint(x,30,26,6)};
UIK.book=x=>{tome(x,{cols:['#ffe9a8','#e0a040','#8a5418'],spine:['#a0601a','#4a2808'],emblem:(cx,cy)=>{hsh(x,()=>x.arc(cx,cy,12,0,7),hr(x,cx,cy,12,['#ffffff','#f0f0ff','#a8b0c8']),3.5);[[cx-4,cy-2],[cx+4,cy-2]].forEach(([a,b])=>{x.fillStyle=HO;x.beginPath();x.arc(a,b,1.8,0,7);x.fill()});x.fillStyle=HO;x.beginPath();x.ellipse(cx,cy+3,2.4,1.6,0,0,7);x.fill()}})};
/* ---------- 도감 ---------- */
if(!S.dex)S.dex={};if(!S.dexC)S.dexC={};if(!S.everI)S.everI={};
for(const k in S.inv)if(S.inv[k]>0)S.everI[k]=1;
function dexKill(t){S.dex[t]=(S.dex[t]||0)+1}
const DEX_NEED=10;
const allMobs=()=>{const out=[];THEMES.forEach(th=>[...th.mobs,...th.mids,th.fin].forEach(t=>{if(!out.includes(t))out.push(t)}));if(!out.includes('mega2'))out.push('mega2','mega3');return out};
const dexMobDone=()=>allMobs().filter(t=>(S.dex[t]||0)>=DEX_NEED).length;
const dexItemDone=()=>Object.keys(ITEMS).filter(k=>S.everI[k]||S.inv[k]>0).length;
const dexPetDone=()=>Object.keys(PETS).filter(k=>S.pets[k]>0).length;
const DEXB=()=>({atk:dexMobDone()*1,hp:dexItemDone()*1,gold:dexPetDone()*2});
{const _pb=PB;PB=function(k){let v=_pb(k);const b=DEXB();if(k==='atk')v+=b.atk;if(k==='hp')v+=b.hp;if(k==='gold')v+=b.gold;return v}}
{const _gi=typeof gainItem==='function'?gainItem:null;if(_gi)gainItem=function(id,...a){S.everI[id]=1;return _gi(id,...a)}}
function dexClaimable(kind,id){const key=kind+':'+id;if(S.dexC[key])return false;if(kind==='m')return(S.dex[id]||0)>=DEX_NEED;if(kind==='i')return!!(S.everI[id]||S.inv[id]>0);return S.pets[id]>0}
const dexReward=(kind,id)=>kind==='m'?(id.startsWith('mega')||THEMES.some(t=>t.fin===id)?50:THEMES.some(t=>t.mids.includes(id))?20:5):kind==='i'?[2,3,5,10,20,40,80][ITEMS[id].g]:[5,10,20,40,80,150][PETS[id].g];
let dexTab='m';
function mobThumb(c,t,seen){const F=mobFrames(t,1);c.width=c.height=96;c.classList.remove('pix');const x=c.getContext('2d');x.imageSmoothingEnabled=false;const s=Math.min(84/F.w,84/F.h);x.drawImage(F.fr[0],48-F.w*s/2,92-F.h*s,F.w*s,F.h*s);
  if(!seen){x.globalCompositeOperation='source-atop';x.fillStyle='#2a2440';x.fillRect(0,0,96,96)}}
function renderDex(Lst){const b=DEXB(),mobsA=allMobs();
  const sum=document.createElement('div');sum.className='dexsum';sum.innerHTML=`<b>도감 보너스</b><span>공격력 +${b.atk}%</span><span>체력 +${b.hp}%</span><span>골드 +${b.gold}%</span>`;Lst.appendChild(sum);
  const ch2=document.createElement('div');ch2.className='dexchips';[['m',`몬스터 ${dexMobDone()}/${mobsA.length}`],['i',`장비 ${dexItemDone()}/${Object.keys(ITEMS).length}`],['p',`펫 ${dexPetDone()}/${Object.keys(PETS).length}`]].forEach(([k,n])=>{const c=document.createElement('button');c.className='chip'+(dexTab===k?' on':'');c.textContent=n;c.onclick=()=>{dexTab=k;sfx('ui');renderPanel()};ch2.appendChild(c)});Lst.appendChild(ch2);
  const g=document.createElement('div');g.className='dexgrid';
  const ids=dexTab==='m'?mobsA:dexTab==='i'?Object.keys(ITEMS).sort((a,b2)=>ITEMS[a].g-ITEMS[b2].g):Object.keys(PETS).sort((a,b2)=>PETS[a].g-PETS[b2].g);
  ids.forEach(id=>{const seen=dexTab==='m'?(S.dex[id]||0)>0:dexTab==='i'?!!(S.everI[id]||S.inv[id]>0):S.pets[id]>0;const can=dexClaimable(dexTab,id),got=S.dexC[dexTab+':'+id];
    const d=document.createElement('button');d.className='dexc'+(seen?'':' unseen')+(can?' can':'')+(got?' got':'');const c=document.createElement('canvas');
    if(dexTab==='m')mobThumb(c,id,seen);else if(dexTab==='i'){itemIcon(c,id);if(!seen){const x=c.getContext('2d');x.globalCompositeOperation='source-atop';x.fillStyle='#2a2440';x.fillRect(0,0,c.width,c.height)}}else{petIcon(c,id);if(!seen){const x=c.getContext('2d');x.globalCompositeOperation='source-atop';x.fillStyle='#2a2440';x.fillRect(0,0,c.width,c.height)}}
    d.appendChild(c);const nm=seen?(dexTab==='m'?MOBNAME[id]:dexTab==='i'?ITEMS[id].n:PETS[id].n):'???';
    const sub=dexTab==='m'?`${Math.min(DEX_NEED,S.dex[id]||0)}/${DEX_NEED}`:'';d.insertAdjacentHTML('beforeend',`<b>${nm}</b>${sub?`<small>${sub}</small>`:''}${can?`<i>+${dexReward(dexTab,id)}</i>`:''}`);
    if(can)d.onclick=()=>{const r=dexReward(dexTab,id);S.gem+=r;S.dexC[dexTab+':'+id]=1;sfx('clear');logAdd(`<span style="color:#62d6ff">+${r} 보석</span> · 도감 등록`);save();renderPanel()};g.appendChild(d)});
  Lst.appendChild(g)}
/* ---------- 던전 탭 (던전 | 도감) ---------- */
let advTab='dun';
{const _rp=renderPanel;renderPanel=function(){if(tab!=='dungeon')return _rp();_rp();const Lst=$('#list'),H=$('#phead');if(!Lst)return;Lst.innerHTML='';if(H){H.innerHTML='';
   [['dun','던전'],['dex','도감']].forEach(([k,n])=>{const c=document.createElement('button');c.className='chip'+(advTab===k?' on':'');c.innerHTML=n+(k==='dex'&&dexAnyClaim()?' <i class="ndot"></i>':'');c.onclick=()=>{advTab=k;sfx('ui');renderPanel()};H.appendChild(c)})}
  if(advTab==='dex'){renderDex(Lst);return}
  const st=document.createElement('div');st.className='dexsum';st.innerHTML=`<b>보유 강화석</b><span>${fmt(S.stone)}개</span><span style="opacity:.8">장비 탭에서 장착 장비를 +1 강화할 수 있어요</span>`;Lst.appendChild(st);
  Object.entries(DUNS).forEach(([k,D])=>{const s=dunState(k);const r=rowBase(c=>uiInto(c,D.ic),`${D.n}<small> 최고 ${k==='gold'?fmt(s.best):s.best}</small>`,D.d);
    const b=document.createElement('button');b.className='buy';b.innerHTML=`입장<small>${s.tix}/${DUN_TIX}</small>`;b.disabled=s.tix<=0||mode!=='farm';b.onclick=()=>dunEnter(k);r.appendChild(b);Lst.appendChild(r)})}}
function dexAnyClaim(){return allMobs().some(t=>dexClaimable('m',t))||Object.keys(ITEMS).some(k=>dexClaimable('i',k))||Object.keys(PETS).some(k=>dexClaimable('p',k))}
/* 강화석으로 장착 장비 +1 */
const stoneCost=id=>Math.ceil(3*Math.pow(1.5,ENH(id))*(1+ITEMS[id].g*.5));
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='gear')return;const GC=S.gcat||'w';const ids=GC==='a'?[S.eq.a1,S.eq.a2].filter(Boolean):[S.eq[GC]].filter(Boolean);
  const Lst=$('#list');const eq=Lst&&Lst.querySelector('.eqline');if(!eq||!ids.length)return;
  const box=document.createElement('div');box.className='stonebar';box.innerHTML=`<div class="sbh"><b>장비 강화</b><span class="sbc"><canvas class="sic2"></canvas>${fmt(S.stone)}</span></div>`;uiInto(box.querySelector('canvas'),'stone');
  ids.forEach(id=>{const c=stoneCost(id),e=ENH(id);const r=document.createElement('div');r.className='sbr';const ic=document.createElement('canvas');ic.className='sbi';itemIcon(ic,id);r.appendChild(ic);
    r.insertAdjacentHTML('beforeend',`<div class="sbt"><b>${typeof SN==='function'?SN(id):ITEMS[id].n}</b><span><em>+${e}</em> → <em class="nx">+${e+1}</em> · 능력치 +10%</span></div>`);
    const b=document.createElement('button');b.className='buy sbb';b.innerHTML=`강화<small><canvas class="sic3"></canvas>${c}</small>`;uiInto(b.querySelector('canvas'),'stone');b.disabled=S.stone<c;
    b.onclick=()=>{if(S.stone<c)return;S.stone-=c;S.enh[id]=(S.enh[id]||0)+1;sfx('buy');banner(`${ITEMS[id].n} +${ENH(id)}!`,'#c88aff');save();renderPanel()};r.appendChild(b);box.appendChild(r)});
  eq.after(box)}}
/* ---------- 펫 스킬 (S급 이상) ---------- */
const PSK={
 uni:{n:'뿔 대돌격',cd:14},beoreok:{n:'대포효',cd:14},rudol:{n:'썰매 돌진',cd:14},
 orca:{n:'해일',cd:13},howl:{n:'늑대 무리',cd:13},bueong:{n:'깃털 폭풍',cd:13},
 oro:{n:'오로라 커튼',cd:12},manmo:{n:'빙하 대지진',cd:12}};
const pskCd=[7,10];
function petHit(id,mul){const p=PETS[id];const f=PMUL[p.g]*PEM(id)*mul;return m=>hitTarget(m,f,Math.random()*100<stat('crit'),'cleave')}
function castPetSkill(i,id){const p=PETS[id],sk=PSK[id];const L0=uLive();if(!L0.length||L0[0].x-bear.x>150)return false;const H=petHit(id,1),fx0=L0[0].x;
  banner(`${p.n} · ${sk.n}!`,p.col);sfx('magic');
  const later=(t,fn)=>setTimeout(()=>{if(screen==='game')fn()},t*1000);
  if(id==='uni'){ufx.push({k:'slash',x:bear.x+80,y:GY-18,a:0,len:220,col:'#a4c4e6',life:.5,w:1});L0.forEach(m=>{petHit(id,4)(m);m.kb=40});shake=Math.max(shake,10)}
  if(id==='beoreok'){fx.push({k:'ring',x:(bear.x+20)*K,y:(GY-20)*K,t:0,life:.6,r:420,col:'#ffe066'});L0.forEach(m=>{petHit(id,2.5)(m);m.frz=2.2});shake=Math.max(shake,14);sfx('boom')}
  if(id==='rudol'){ufx.push({k:'dash',life:.3});L0.forEach(m=>{petHit(id,3.5)(m);if(!m.boss){m.kb=160;m.vy=-120;m.air=1}});shake=Math.max(shake,10)}
  if(id==='orca'){for(let i2=0;i2<6;i2++)later(i2*.08,()=>{const x=bear.x+30+i2*24;ufx.push({k:'pillar',x,col:'#5ab4f0',life:.45,w:30});uLive().filter(m=>Math.abs(m.x-x)<20).forEach(petHit(id,1.2))});shake=Math.max(shake,8)}
  if(id==='howl'){[-20,-6,10].forEach((dx,j)=>ufx.push({k:'clone',dx,dy:-4,life:1.1}));for(let j=0;j<6;j++)later(.15+j*.12,()=>{const L1=uLive();if(L1[0]){petHit(id,.8)(L1[0]);ufx.push({k:'slash',x:L1[0].x,y:GY-18,a:rnd(-1,1),len:40,col:'#c8ced8',life:.3})}})}
  if(id==='bueong'){for(let j=0;j<16;j++)later(j*.05,()=>{const x=fx0+rnd(-20,60);ufx.push({k:'proj',x:x-30,y:-10,vx:110,vy:420,sp:'kunai',gy:1,life:.6,col:'#e6f6ff'});uLive().filter(m=>Math.abs(m.x-x)<30).forEach(petHit(id,.35))})}
  if(id==='oro'){['#52e4c0','#5ab4ff','#b06cff','#ff8ad8'].forEach((c,j)=>later(j*.1,()=>{ufx.push({k:'pillar',x:fx0-10+j*22,col:c,life:.7,w:34})}));later(.4,()=>{uLive().forEach(petHit(id,3));flash=Math.max(flash,.3);flashC='#d0fff0'})}
  if(id==='manmo'){shake=Math.max(shake,22);sfx('boom');for(let j=0;j<8;j++)ufx.push({k:'spike',x:bear.x+40+j*16,col:['#8a6a4a','#c8a070','#f0e0c0'],life:.9,h:22+j*2,d:j*.05});later(.3,()=>uLive().forEach(m=>{petHit(id,3.5)(m);m.frz=1.4}))}
  return true}
{const _ps=petSim;petSim=function(dt){_ps(dt);if(bear.dead||screen!=='game')return;S.peq.forEach((id,i)=>{if(!id||!PSK[id])return;pskCd[i]-=dt;if(pskCd[i]<=0&&castPetSkill(i,id))pskCd[i]=PSK[id].cd})}}
{const _pe=petEff;petEff=function(id){return _pe(id)+(PSK[id]?` · <em class="ult">펫 스킬 ${PSK[id].n}</em>`:'')}}
</script>
