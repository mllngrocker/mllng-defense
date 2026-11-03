/* ---------- daily dungeons: gold / gem / stone. Each can be cleared once per day ----------
 Entering swaps the background theme, weather, HUD colours and the whole bottom panel (body[data-dun]). */
const DUNS={
 gold:{n:'황금 보물 동굴',sub:'골드 던전',d:'45초 동안 몰려오는 보물 도깨비를 잡아 골드를 왕창 모아요',limit:45,col:'#ffcf3d',reward:'골드',
  th:{name:'황금 보물 동굴',sky:['#1a1006','#3a2408','#8a5a10'],sun:['#ffd060',.5,.18,.06],far:'#3a2a10',near:'#c8901a',gnd:['#6a4a14','#3a280a'],sea:null,sil:13,wx:12,fog:'#c8901a',rays:.8}},
 gem:{n:'수정 광맥',sub:'보석 던전',d:'30초 안에 거대 수정 골렘을 최대한 때려 보석을 캐요',limit:30,col:'#b98aff',reward:'보석',
  th:{name:'수정 광맥',sky:['#06061a','#14143a','#2a2a6a'],sun:['#a8f0ff',.5,.2,.05],far:'#141030',near:'#3a2a7a',gnd:['#2a2450','#140f2a'],sea:null,sil:14,wx:9,fog:'#6a4aff',rays:.9}},
 stone:{n:'대장간 용광로',sub:'강화석 던전',d:'40초 동안 버티며 몬스터를 쓰러뜨려 강화석을 모아요',limit:40,col:'#ff7a2a',reward:'강화석',
  th:{name:'대장간 용광로',sky:['#120604','#3a1206','#a03a0a'],sun:['#ffb050',.5,.35,.08],far:'#2a0e06',near:'#1a0a06',gnd:['#3a2016','#1e100a'],sea:'#ff5a10',sil:15,wx:6,fog:'#ff6a2a',rays:.5}},
};
Object.assign(MOBS,{goldgob:['보물 도깨비','walker','goblin','#e8b830','#fff2a0',''],crystgiant:['거대 수정 골렘','golem','crystal','#3a2a6a','#9af0ff','']});
const today=()=>{const d=new Date();return`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;};
const dunDone=k=>S.dun[k]===today();
let dun=null; // {k,t,earn,dmg}
function enterDungeon(k){if(dunDone(k)||dun)return;const D=DUNS[k];$('#modal').hidden=true;
 const w=$('#wipe');w.querySelector('b').textContent=D.n;w.querySelector('small').textContent=D.sub;w.style.setProperty('--dc',D.col);w.hidden=false;w.classList.remove('go');void w.offsetWidth;w.classList.add('go');
 setTimeout(()=>{dun={k,t:D.limit,earn:0,dmg:0,spawn:0};document.body.dataset.dun=k;for(const m of mobs)m.dead=true,m.dt=.3;mobs.length=0;boss=null;shots.length=0;pshots.length=0;
  bear.dead=false;bear.hp=MAXHP();curTheme=-1;bgStage.theme(D.th);if(k==='gem'){const g=mkMob('crystgiant',BX+170*K,2);g.hp=g.max=1e300;g.dmg=mobAtk(S.best)*.6;mobs.push(g);}
  renderDunPanel();sfx('boss');},450);
 setTimeout(()=>{w.hidden=true;},1400);}
function stepDungeon(dt){const D=DUNS[dun.k];dun.t-=dt;
 if(dun.k!=='gem'){dun.spawn-=dt;const live=mobs.filter(m=>!m.dead).length;
  if(dun.spawn<=0&&live<(dun.k==='gold'?7:5)){dun.spawn=dun.k==='gold'?.45:.9;const id=dun.k==='gold'?'goldgob':pick(['flame','boiler','charstump','lslime','transformer']);
   const m=mkMob(id,W+30*K+rnd(0,60)*K,dun.k==='stone'&&Math.random()<.15?1:0);const g=Math.max(0,S.best-2);m.hp=m.max=mobHp(g)*(dun.k==='gold'?.6:1.4);m.dmg=mobAtk(g)*(dun.k==='gold'?.3:1);if(dun.k==='gold')m.spd*=1.4;mobs.push(m);}}
 if(dun.t<=0)endDungeon(true);
 renderDunHud();}
// called from killMob/hitMob/hurtBear while a dungeon is running
function dunKill(m){const g=Math.max(0,S.best-2);track('kill');
 if(dun.k==='gold'){const v=mobGold(g)*6*(1+PBX('gold')/100);dun.earn+=v;track('gold',v);num(m.x,m.y-60*K,'+'+fmt(v),'gold');for(let i=0;i<6;i++)part({x:m.x,y:m.y-30*K,vx:rnd(-160,160),vy:rnd(-420,-200),g:1100,life:1,ml:1,size:5.5*K,type:'coin',rot:rnd(0,6),vr:9,tx:GOLDX,ty:GOLDY,drag:.99});}
 if(dun.k==='stone'){const b=Math.floor(dun.earn);dun.earn+=m.tier?1:1/3;if(Math.floor(dun.earn)>b)num(m.x,m.y-60*K,'+1 강화석','gold');}}
function dunHit(m,d){if(dun&&dun.k==='gem'){dun.dmg+=d;dun.earn=Math.min(400,Math.floor(dun.dmg/(mobHp(Math.max(0,S.best-2))*3)));}}
function endDungeon(ok){const D=DUNS[dun.k],k=dun.k,earn=Math.floor(dun.earn);S.dun[k]=today();if(ok)track('dun');
 if(k==='gold')S.gold+=earn;else if(k==='gem')S.gem+=earn;else S.stone=(S.stone||0)+earn+(ok?5:0);
 dun=null;delete document.body.dataset.dun;for(const m of mobs)m.dead=true,m.dt=.3;curTheme=-1;applyTheme();bear.hp=MAXHP();save();
 tab='up';document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x.dataset.tab==='up'));renderPanel();updateHud();
 modal(ok?`${D.sub} 클리어!`:`${D.sub} 종료`,`<b style="font-size:20px;color:${shade(D.col,-.3)}">+${fmt(k==='stone'&&ok?earn+5:earn)} ${D.reward}</b><br><br>내일 다시 도전할 수 있어요.`,[['확인',null,1]]);sfx('clear');}
function renderDunHud(){const e=$('#dunhud');if(!e||!dun)return;const D=DUNS[dun.k];e.querySelector('.dt').textContent=Math.ceil(dun.t);e.querySelector('.dbar b').style.width=(dun.t/D.limit*100)+'%';
 e.querySelector('.de').textContent=`${fmt(Math.floor(dun.earn))} ${D.reward}`;}
function renderDunPanel(){const D=DUNS[dun.k];$('#dunpanel').innerHTML=`<div id="dunhud"><div class="dname">${D.n}</div><div class="dsub">${D.sub} · ${D.d}</div>
  <div class="dtime"><span class="dt">${D.limit}</span><small>초</small></div><div class="bar dbar"><b></b></div><div class="dearn">획득 <span class="de">0</span></div>
  <button class="ghost" id="dunquit">포기하고 나가기</button></div>`;$('#dunquit').onclick=()=>modal('던전을 나갈까요?','지금까지 모은 보상을 받고 나가요. 오늘은 다시 들어올 수 없어요.',[['계속하기'],['나가기',()=>endDungeon(false),1]]);}
function dungeonMenu(){const t=today();
 modal('던전',`<div class="dunlist">${Object.keys(DUNS).map(k=>{const D=DUNS[k],done=S.dun[k]===t;return`<button class="dcard${done?' done':''}" data-dun="${k}" style="--dc:${D.col}"><b>${D.n}</b><small>${D.sub} · 보상: ${D.reward}</small><span>${done?'오늘 완료':'입장하기'}</span></button>`;}).join('')}</div>
  <p style="font-size:11px;margin-top:8px">던전마다 하루에 한 번씩 들어갈 수 있어요. 강화석 ${fmt(S.stone||0)}개 보유</p>`,[],1);
 document.querySelectorAll('.dcard').forEach(b=>b.onclick=()=>{if(b.classList.contains('done')){toast('내일 다시 열려요');return;}enterDungeon(b.dataset.dun);});}
