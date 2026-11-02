<script>
/* ---------- data + save ---------- */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,pick=a=>a[Math.floor(Math.random()*a.length)];
function fmt(n){n=Math.floor(n);if(n<1e4)return n.toLocaleString('en-US');const U=[[1e20,'해'],[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']];
  for(const[v,s]of U)if(n>=v){const x=n/v;let t=x>=100?String(Math.floor(x)):x.toFixed(x>=10?1:2);if(t.includes('.'))t=t.replace(/0+$/,'').replace(/\.$/,'');return t+s}}
const UPS=[
  {k:'atk',n:'공격력',ic:'atk',max:9999,cost:l=>10*Math.pow(1.1,l),val:l=>12*Math.pow(1.085,l)+6*l,show:v=>fmt(v)},
  {k:'hp',n:'체력',ic:'hp',max:9999,cost:l=>10*Math.pow(1.1,l),val:l=>160*Math.pow(1.085,l)+30*l,show:v=>fmt(v)},
  {k:'regen',n:'체력 회복',ic:'regen',max:9999,cost:l=>15*Math.pow(1.11,l),val:l=>3+3*l*Math.pow(1.06,l),show:v=>fmt(v)+'/초'},
  {k:'crit',n:'치명타 확률',ic:'crit',max:150,cost:l=>40*Math.pow(1.13,l),val:l=>8+.5*l,show:v=>v.toFixed(1)+'%'},
  {k:'critd',n:'치명타 피해',ic:'critd',max:9999,cost:l=>40*Math.pow(1.11,l),val:l=>180+10*l,show:v=>fmt(v)+'%'},
  {k:'aspd',n:'공격 속도',ic:'aspd',max:100,cost:l=>30*Math.pow(1.13,l),val:l=>1+.02*l,show:v=>'x'+v.toFixed(2)},
];
const KEY='baekgom-pixel-v2';
const S0={gold:0,gem:500,lv:1,exp:0,g:0,kills:0,best:0,up:{atk:0,hp:0,regen:0,crit:0,critd:0,aspd:0},inv:{plank:1},eq:{w:'plank',c:null,a1:null,a2:null},cnt:{},mi:0,mBase:0,skl:{glacier:1,tornado:1,beam:1},auto:true,snd:true,mult:1,buff:0,seenInv:1,autoBoss:true,t:Date.now(),started:false};
let S=JSON.parse(JSON.stringify(S0));
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)S=Object.assign(S,s,{cnt:Object.assign({},s.cnt||{}),skl:Object.assign(S.skl,s.skl||{}),up:Object.assign(S.up,s.up||{}),inv:Object.assign({},s.inv||S.inv),eq:Object.assign(S.eq,s.eq||{})})}catch(e){}
for(const k in S.inv)if(!ITEMS[k])delete S.inv[k];if(S.eq.s){S.eq.a1=S.eq.a1||S.eq.s}if(S.eq.n){S.eq.a2=S.eq.a2||S.eq.n}delete S.eq.s;delete S.eq.n;delete S.eq.i;for(const k of ['w','c','a1','a2'])if(S.eq[k]&&!ITEMS[S.eq[k]])S.eq[k]=null;if(!S.eq.w)S.eq.w='plank';
if(S.started&&!S.ver3){const oh=30*Math.pow(1.17,S.g),ng=Math.max(0,Math.floor(Math.log(Math.max(1,oh/110))/Math.log(1.305)));if(ng<S.g){S.g=ng;S.kills=0;S.migrated=1}S.best=Math.min(S.best,Math.max(S.g,0));S.autoBoss=true}S.ver3=1;
function save(){S.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
const PBf=k=>typeof PB==='function'?PB(k):0;
const stat=k=>{let v=UPS.find(u=>u.k===k).val(S.up[k]);if(k==='crit'||k==='critd')v+=PBf(k);if(k==='regen')v*=1+PBf('regen')/100;return v};
const ENH=id=>(S.enh&&S.enh[id])||0,EM=id=>1+.1*ENH(id);
const lvMul=()=>1+.03*(S.lv-1);
const ACCI=()=>[S.eq.a1,S.eq.a2].filter(Boolean);const ACC=()=>ACCI().map(k=>ITEMS[k]);const W=()=>ITEMS[S.eq.w],SPG=()=>Math.max(-1,...ACC().filter(i=>i.up).map(i=>i.g)),NRG=()=>Math.max(-1,...ACC().filter(i=>i.spd).map(i=>i.g)),SANDE=()=>S.eq.a1==='sande'||S.eq.a2==='sande',UP=()=>SPG()>=0,COSV=()=>S.eq.c?ITEMS[S.eq.c].cos:'none';
const ATK=()=>stat('atk')*GMUL[W().g]*EM(S.eq.w)*lvMul()*(1+(PBf('atk')+PBf('all'))/100),MAXHP=()=>stat('hp')*lvMul()*(1+(COS_HP[COSV()]||0)*(S.eq.c?EM(S.eq.c):1)+ACCI().reduce((a,k)=>a+(ITEMS[k].hp||0)*EM(k),0))*(1+(PBf('hp')+PBf('all'))/100);
const ASPD=()=>stat('aspd')*(1+ACCI().reduce((a,k)=>a+(ITEMS[k].spd||0)*EM(k),0))*(1+(PBf('aspd')+PBf('all'))/100);
const KIND_MUL={blunt:1,gun:.45,star:.8,book:1.4},RANGE={blunt:0,gun:118,star:104,book:124},KIND_TXT={blunt:'근접 타격',gun:'사격',star:'투척',book:'마법'};
const KILLS=20;const QUOTA=g=>Math.min(100,40+Math.floor(g/10)*6);let eShots=[];
const RANGED={bottle:'#5ac8ff',gull:'#ffffff',ember:'#ff8a1a',vulture:'#d8b070',cactus:'#8ad870',drone:'#ffd23a',eel:'#c88aff',cctv:'#ff3040',smog:'#9a9aa4',canary:'#d8ff5a',flame:'#ff8a1a',zapbird:'#fff05a',acidcloud:'#9aff3a',acidfrog:'#b06ad8',mosquito:'#ff5a7a',fuse:'#ffe066',moth:'#e0d0a0'};
const mobHp=g=>120*Math.pow(1.36,g),mobAtk=g=>18*Math.pow(1.245,g),mobGold=g=>6*Math.pow(1.145,g),needExp=l=>12*Math.pow(1.22,l);
const ch=()=>Math.floor(S.g/10),theme=()=>THEMES[ch()%THEMES.length],stageName=g=>`${Math.floor(g/10)+1}-${g%10+1}`;
const chBgm=()=>['beach','forest','desert','oil','city','mine','fire','acid','swamp','final','fire','desert','forest','fire','swamp','mine','city','acid','final','final'][ch()%20];
const stageBoss=g=>{const s=g%10;return s===4?'mid0':s===8?'mid1':s===9?'fin':(s===2||s===6)?'elite':'none'};const effG=()=>S.g%10===9&&mode!=='boss'?S.g-1:S.g;

/* ---------- sprites ---------- */
const BEARS={};
function bearSet(){const SCARF=S.eq.a1==='scarf'||S.eq.a2==='scarf';const key=[S.eq.w,SPG(),NRG(),SANDE(),COSV(),SCARF].join('|');if(BEARS[key])return BEARS[key];
  GEAR={w:W().w,sp:SPG(),nr:NRG(),sande:SANDE(),cos:COSV(),scarf:SCARF};const b=bake(animDefs(W().w.kind),bearSmall,BW,BH);
  b.drop={fps:30,frames:b.stand.frames.slice().reverse(),cv:b.stand.cv.slice().reverse()};return BEARS[key]=b}
function ghostOf(cv){if(cv._g)return cv._g;const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');x.drawImage(cv,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='rgba(60,255,190,.8)';x.fillRect(0,0,c.width,c.height);return cv._g=c}
const ICONC={};function iconCanvas(id){return ICONC[id]||(ICONC[id]=raster(itemPrims(id),24,24))}

/* ---------- runtime ---------- */
const K=3,cv=$('#cv'),X=cv.getContext('2d');const lo=document.createElement('canvas');lo.width=VW;lo.height=VH+20;const L=lo.getContext('2d');L.imageSmoothingEnabled=false;
const GY=GYv,BX=44;let OY=20,OYK=OY*K;cv.height=(VH+OY)*K;
function play(e,name,onEnd,onEv){e.a=e.set[name];e.name=name;e.f=0;e.t=0;e.onEnd=onEnd||null;e.onEv=onEv||null;ev0(e)}
function ev0(e){const v=e.a.ev&&e.a.ev[e.f];if(v&&e.onEv)e.onEv(v)}
function step(e,dt){if(!e.a)return;e.t+=dt;const fd=1/e.a.fps;while(e.t>=fd){e.t-=fd;e.f++;if(e.f>=e.a.cv.length){if(e.a.loop)e.f=0;else{e.f=e.a.cv.length-1;const cb=e.onEnd;e.onEnd=null;if(cb)cb();return}}ev0(e)}}
const bear={x:BX,set:null,fl:0,hp:0,dead:0};
let curWS=0,bossCount=-1,ghosts=[],ghostT=0,mobs=[],fx=[],px=[],nums=[],coins=[],banners=[],shots=[],drops=[];
let mode='farm',bossT=0,bossMax=30,scroll=0,runT=0,stop=0,shake=0,flash=0,flashC='#fff',slowT=0,combo=0,overkill=0,rage=false,bearCd=0,T=0;
const runName=()=>UP()?'walk2':'run';
function toast(m,col){const t=$('#toast');t.innerHTML=m;t.style.borderColor=col||'#000';t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),1900)}
function banner(s,col){banners.push({s,col,t:0})}

function mkMob(type,s,hpMul,boss,tier){const fr=mobFrames(type,s);const G=effG(),hp=mobHp(G)*hpMul;
  return{type,boss,tier,s,fr,x:200,hp,max:hp,atk:mobAtk(G)*(boss?(tier==='elite'?2:tier==='fin'?5:3):1),cd:1,ph:Math.random()*4,fl:0,kb:0,air:0,vy:0,dead:0,dt:0,lunge:0,frz:0}}
function spawnWave(){const th=theme();
  if(mode==='boss'){const m=mkMob(th.fin,2.2,32,true,'fin');m.x=210;mobs.push(m);return}
  const t=stageBoss(S.g),q=QUOTA(S.g),bs=S.g%10===9;
  if(!bs&&t!=='none'&&S.kills>=q){const m=t==='elite'?mkMob(pick(th.mobs),1.5,7,true,'elite'):mkMob(th.mids[t==='mid0'?0:1],1.8,22,true,'mid');m.guard=1;m.x=214;mobs.push(m);
    for(let i=0;i<2;i++){const e=mkMob(pick(th.mobs),1,.9,false);e.x=196+i*18;mobs.push(e)}banner(t==='elite'?'정예 출현!':'중간 보스 출현!','#ff8a3a');sfx('boss');return}
  const n=S.kills>=q-3&&!bs?5:7;for(let i=0;i<n;i++){const m=mkMob(pick(th.mobs),1,.85,false);m.x=192+i*19;mobs.push(m)}}
function bossName(m){return(m.tier==='elite'?'정예 ':'')+MOBNAME[m.type]}
function enterBoss(){mode='boss';sfx('boss');setBgm(ch()%10===9?'final':'boss');bossMax=bossT=60;eShots=[];mobs.forEach(m=>{if(!m.dead){m.dead=1;m.dt=0;m.noLoot=1}});$('#bossBtn').hidden=true;
  banner('챕터 보스!','#ff4d5e');shake=8;if(bear.name!==runName()){UP()?play(bear,'walk2'):play(bear,'drop',()=>play(bear,'run'))}runT=0}
function bossFail(){mode='farm';S.autoBoss=false;eShots=[];mobs.forEach(m=>{if(!m.dead){m.dead=1;m.dt=0;m.noLoot=1}});toast(`${ch()+1}-9 구간에서 사냥하며 키운 뒤 '보스 도전'을 눌러요!`);setBgm(chBgm());runT=0;bear.hp=MAXHP()}
function advanceStage(){S.g++;S.kills=0;S.best=Math.max(S.best,S.g);S.gem+=3;S.autoBoss=true;save();if(S.g%10===9){banner(`${ch()+1}-10 챕터 보스`,'#ff4d5e');toast('챕터 보스가 기다리고 있어요!')}}
function bossWin(){const c0=ch();sfx('clear');setTimeout(()=>setBgm(chBgm()),400);S.g++;S.kills=0;S.best=Math.max(S.best,S.g);S.gem+=50;mode='farm';S.autoBoss=true;eShots=[];
  setTimeout(()=>showVictory(c0),900);bear.hp=MAXHP();save();renderPanel()}
function gainExp(v){S.exp+=v;let up=false;while(S.exp>=needExp(S.lv)){S.exp-=needExp(S.lv);S.lv++;S.gem+=10;up=true}if(up){banner('LEVEL UP!','#7bdc4f');sfx('level');logAdd('<span style="color:#7bdc4f">레벨 업!</span> +10 보석');bear.hp=MAXHP()}}

/* drops */
const DROPW=[72,26.4,1.3,.25,.04,.008,.002],GACHAW=[62,33,4,.8,.15,.04,.01];
function rollGrade(bonus,gacha){const w=gacha?GACHAW:DROPW;let r=Math.random()*100,g=0;for(;g<6;g++){if(r<w[g])break;r-=w[g]}if(g===6&&r>=w[6])g=0;
  if(bonus&&Math.random()<bonus)g=Math.min(6,g+1);return g}
function rollItem(bonus,gacha){const g=rollGrade(bonus,gacha);const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].g===g);return pick(pool)}
function gainItem(id,x,y){S.inv[id]=(S.inv[id]||0)+1;const it=ITEMS[id];sfx('drop',it.g);const up=S.inv[id]-1;logAdd(`${badge(it.g)}<span style="color:${GCOL[it.g]}">${it.n}</span>${up?` <b style="color:#7bdc4f">x${S.inv[id]}</b>`:''}`);
  if(x!=null)drops.push({id,x:x*K,y:y*K,vx:rnd(-60,120),vy:-520,t:0,fly:0});
  if(it.g>=2||(!up&&it.g>=1))toast(up?`<b style="color:${GCOL[it.g]}">[${GRADES[it.g]}]</b> ${it.n} <b style="color:#7bdc4f">x${S.inv[id]} · 합성 재료</b>`:`<b style="color:${GCOL[it.g]}">[${GRADES[it.g]}]</b> ${it.n} 획득!`,GCOL[it.g]);
  if(it.g>=2){banner(it.g>=3?`와 드디어!! ${GRADES[it.g]}`:`${GRADES[it.g]} 등급 획득!`,GCOL[it.g]);flash=it.g>=3?.7:.35;flashC=GCOL[it.g];if(it.g>=3){slowT=.6;shake=14}}
  if(tab==='gear')renderPanel()}

/* effects */
function debris(x,y,n,cols,sp){for(let i=0;i<n;i++){const a=rnd(-Math.PI,0),v=rnd(sp*.3,sp);px.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:260,life:rnd(.35,.7),t:0,c:cols[i%cols.length],s:Math.random()<.3?2:1})}}
function dust(x,n){for(let i=0;i<n;i++){const d=i%2?1:-1;px.push({x:x+rnd(-4,4),y:GY-1,vx:d*rnd(15,55),vy:rnd(-14,-4),g:10,life:rnd(.4,.7),t:0,c:['#d8c39a','#b8a27a','#efe0bd'][i%3],s:2,dust:1})}}
function impact(x,y,col,big){fx.push({k:'star',x:x*K,y:y*K,t:0,life:big?.2:.12,big,col});fx.push({k:'ring',x:x*K,y:y*K,t:0,life:big?.3:.2,r:big?110:56,col});
  for(let i=0;i<(big?16:8);i++){const a=rnd(0,Math.PI*2),v=rnd(280,big?850:560);fx.push({k:'spark',x:x*K,y:y*K,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rnd(.15,.3),col})}}
function arc(a0,a1,col){fx.push({k:'arc',x:(bear.x+4)*K,y:(GY-24)*K,r:22*K,a0,a1,t:0,life:.15,col})}
function num(x,y,v,kind){nums.push({x:x*K,y:y*K,v,kind,t:0})}
const MOBCOL={jelly:['#dde8f5','#b4c6df','#ff4d5e'],crab:['#d8303c','#ff6a70','#d6dbe4'],oil:['#33264a','#6c5590','#ffe066'],bottle:['#a8dcf8','#5aa8d8','#d8303c'],gull:['#ffffff','#d7e1ee','#f0b020'],
  octo:['#33264a','#4d3a6c','#ffe066'],hermit:['#965024','#c88446','#d8303c'],golem:['#965024','#9aa2b2','#ff3040'],stump:['#80532a','#a8743e','#6cc25a'],saw:['#5a9634','#de782a','#d6dbe4'],
  shroom:['#d8303c','#ffffff','#f0cf98'],mole:['#80532a','#f0b020','#9aa2b2'],ember:['#ff8a1a','#ffe066','#d0400a'],boar:['#80532a','#f0b020','#ffffff'],beaver:['#80532a','#9aa2b2','#f0cf98'],ogre:['#d8303c','#5a9634','#9aa2b2']};
const hitY=m=>GY-(18+(FLY[m.type]||0))*m.s-m.air;
const reach=m=>13+15*m.s;

function front(){return mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x)[0]}
function inRange(f){const k=W().w.kind;return f&&f.x-bear.x<=(k==='blunt'?reach(f)+18:RANGE[k])}
function hitTarget(tg,mult,crit,src){
  if(!tg||tg.dead)return;const d=ATK()*mult*(crit?stat('critd')/100:1)*rnd(.92,1.08)*(tg.boss?1+PBf('boss')/100:1);const hx=tg.x-4,hy=hitY(tg);
  if(src==='cleave'||src==='tornado'||src==='beam'){tg.hp-=d;tg.fl=.06;num(hx+rnd(-8,8),hy-10,d,crit?'crit':'norm',tg);if(src!=='beam')tg.kb=Math.max(tg.kb,tg.boss?2:10);debris(hx,hy,3,MOBCOL[tg.type],60);sfx(crit?'crit':'hit');if(tg.hp<=0)killMob(tg);return}
  sfx(crit?'crit':src==='kick'?'kick':'hit');
  impact(hx,hy,crit?'#ffb21a':src==='ice'||src==='balloon'?'#a8e0ff':src==='fire'?'#ff8a1a':src==='bolt'?'#fff3a0':'#fff3c4',crit||src==='bolt');debris(hx,hy,crit?12:5,MOBCOL[tg.type],crit?110:60);
  if(crit&&T-(window._lstop||-9)>.4){window._lstop=T;stop=Math.max(stop,.035)}shake=Math.max(shake,crit?7:src==='shot'?1:2.5);
  num(hx,hy-12,d,crit?'crit':'norm',tg);
  tg.hp-=d;tg.fl=.07;if(src==='ice')tg.frz=1.2;
  tg.kb=Math.max(tg.kb,tg.boss?(crit?10:3):src==='kick'?110:crit?36:src==='shot'?4:14);
  if(src==='up'&&!tg.boss){tg.vy=-170;tg.air=Math.max(tg.air,1)}
  if(tg.hp<=0)killMob(tg)}
function bearEv(ev){
  const kind=W().w.kind;
  if(ev==='jump'){dust(bear.x+4,6);return}
  const tg=front();
  if(ev==='shot'||ev==='throw'||ev==='magic'){const fr=bear.a.frames[bear.f],tip=fr&&fr.tip?{x:bear.x-BAX+fr.tip.x,y:GY-BG+fr.tip.y}:{x:bear.x+30,y:GY-30};
    if(!tg)return;const w=W().w;
    if(ev==='shot'){sfx(w.rail?'bolt':'shot');fx.push({k:'muzzle',x:tip.x*K,y:tip.y*K,t:0,life:.06});
      if(w.rail){fx.push({k:'beam',x:tip.x*K,y:tip.y*K,t:0,life:.16});mobs.filter(m=>!m.dead).forEach(m=>hitTarget(m,KIND_MUL.gun*2.2,Math.random()*100<stat('crit'),'bolt'));shake=Math.max(shake,6)}
      else if(w.spread){[-7,0,7].forEach(dy=>shots.push({x:tip.x,y:tip.y,tg,k:'bullet',v:400,mult:KIND_MUL.gun*.55,dy}))}
      else shots.push({x:tip.x,y:tip.y,tg,k:'bullet',v:430,mult:KIND_MUL.gun*(w.big?.8:1)})}
    if(ev==='throw'){sfx('throw');const n=w.big?3:1,kk=w.pebble?'pebble':w.balloon?'balloon':'star';for(let i=0;i<n;i++)shots.push({x:tip.x,y:tip.y-i*3,tg,k:kk,v:230+i*20,mult:KIND_MUL.star*(w.pebble?.8:1),t:0,dy:n>1?(i-1)*10:0})}
    if(ev==='magic'){sfx(w.fx==='bolt'?'bolt':'magic');fx.push({k:'circle',x:tip.x*K,y:tip.y*K,t:0,life:.35,col:w.fx==='ice'?'#a8e0ff':w.fx==='bolt'?'#ffe066':'#c08aff'});
      if(w.fx==='bolt'){const ts=mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x).slice(0,3);ts.forEach((m,i)=>setTimeout(()=>{fx.push({k:'bolt',x:(m.x-2)*K,y:hitY(m)*K,t:0,life:.18});hitTarget(m,KIND_MUL.book*(i?0.6:1),Math.random()*100<stat('crit'),'bolt');flash=Math.max(flash,.18);flashC='#fff6c0'},i*70))}
      else shots.push({x:tip.x,y:tip.y,tg,k:w.fx==='ice'?'ice':w.fx==='fire'?'fire':'orb',v:w.fx==='ice'?240:170,mult:KIND_MUL.book})}
    return}
  if(!tg||tg.x-bear.x>reach(tg)+24){sfx('whiff');dust(bear.x+40,8);debris(bear.x+40,GY-2,6,['#b8a27a','#8a7962'],60);shake=Math.max(shake,3);if(ev!=='kick')arc(-2.1,.5,'#fff6d8');return}
  const isCrit=rage||ev==='crit';
  if(ev==='kick')shake=Math.max(shake,8);else if(ev==='up')arc(-.6,1.9,'#fff6d8');else arc(-2.1,.5,isCrit?'#ffb21a':'#fff6d8');
  if(ev!=='kick'&&ev!=='up')dust(bear.x+38,isCrit?8:3);
  if(ev==='crit'){flash=.3;flashC='#fff';if(T-(window._lslow||-9)>2){window._lslow=T;slowT=.15}}
  const mm=(ev==='crit'?1.5:ev==='kick'||ev==='up'?1.2:1);const others=mobs.filter(m=>!m.dead&&m!==tg&&m.x-tg.x<30&&m.x>tg.x-8);
  hitTarget(tg,mm,isCrit,ev==='kick'?'kick':ev==='up'?'up':'melee');others.forEach(m=>hitTarget(m,mm*.55,isCrit,'cleave'));
}
function killMob(m){m.dead=1;m.dt=0;deathStart(m);S.cnt.kill=(S.cnt.kill||0)+1;S.chKill=(S.chKill||0)+1;overkill=W().w.kind==='blunt'?1:0;debris(m.x,GY-10,14,MOBCOL[m.type],120);
  const big=m.boss?(m.tier==='fin'?20:m.tier==='mid'?12:6):1;const g=mobGold(effG())*(m.boss?(m.tier==='fin'?30:m.tier==='mid'?15:6):1)*(S.buff>Date.now()?2:1)*(1+PBf('gold')/100),n=m.boss?12:3;logAdd(`<span class="lgold">+${fmt(g)} 골드</span>`);
  for(let i=0;i<n;i++)coins.push({x:m.x*K,y:(GY-10)*K,vx:rnd(-120,240),vy:rnd(-650,-380),t:0,v:g/n,fly:0});
  gainExp(Math.pow(1.12,S.g)*big);
  const ch2=m.boss?(m.tier==='fin'?1:m.tier==='mid'?.8:.4):.035;if(Math.random()<ch2)gainItem(rollItem(m.tier==='fin'?.25:m.tier==='mid'?.1:0),m.x,GY-14);
  if(m.tier==='fin')bossWin();else if(m.guard)advanceStage();else if(mode==='farm'&&S.g%10!==9){S.kills=Math.min(QUOTA(S.g),S.kills+1);if(S.kills>=QUOTA(S.g)&&stageBoss(S.g)==='none')advanceStage()}}
function bearAttack(){const kind=W().w.kind;let a;
  if(kind==='blunt'){rage=Math.random()*100<stat('crit');a=rage?'rage':['smash','smash2','upper','kick'][combo%4]}
  else a=kind==='gun'?'shoot':kind==='star'?'throw':'cast';
  combo++;play(bear,a,()=>{rage=false;play(bear,'idle');bearCd=.03},bearEv)}
function hurtBear(d,src){if(bear.dead)return;d*=Math.max(.3,1-PBf('def')/100);if(src&&PBf('thorn')&&!src.dead){src.hp-=src.max*PBf('thorn')/100;src.fl=.05;if(src.hp<=0)killMob(src)}bear.hp-=d;bear.fl=.1;num(bear.x,GY-44,d,'hurt',bear);shake=Math.max(shake,3);
  if(bear.hp<=0){bear.hp=0;bear.dead=1.8;eShots=[];if(mode==='dun'){dunEnd(false)}else if(mode==='boss')bossFail();else{if(mobs.some(m=>!m.dead&&m.guard))S.kills=Math.max(0,QUOTA(S.g)-3);mobs.forEach(m=>{if(!m.dead){m.dead=1;m.dt=0;m.noLoot=1}});toast('북실이가 쓰러졌어요… 금방 일어나요')}}}

function sim(dt){
  T+=dt;bearCd-=dt;const kind=W().w.kind,imp=UP();
  const live=mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x),f=live[0];
  if(bear.dead){bear.dead-=dt;if(bear.dead<=0){bear.dead=0;bear.hp=MAXHP();play(bear,runName())}}
  else bear.hp=Math.min(MAXHP(),bear.hp+stat('regen')*lvMul()*dt);
  const nm=bear.name;let ws=0;
  if(!bear.dead){
    if(nm==='run'||nm==='walk2'){ws=imp?82:70;runT+=dt;if(!f&&runT>.7)spawnWave();
      if(f&&(kind==='blunt'?f.x-bear.x<reach(f)+10:inRange(f))){if(imp)play(bear,'idle');else play(bear,'stand',()=>play(bear,'idle'))}}
    else if(nm==='idle'&&bearCd<=0&&skillLock<=0){
      if(inRange(f))bearAttack();
      else if(!f&&overkill>0){overkill--;bearAttack()}
      else if(!f||kind==='blunt'){if(imp){play(bear,'walk2');runT=0}else play(bear,'drop',()=>{play(bear,'run');runT=0})}}
  }
  scroll+=ws*dt;curWS=ws;
  if(SANDE()&&!bear.dead){ghostT-=dt;if(ghostT<=0){ghostT=.045;ghosts.push({img:bear.a.cv[bear.f],x:bear.x,t:0})}}ghosts=ghosts.filter(g=>{g.t+=dt;g.x-=(ws+40)*dt;return g.t<.24});
  let jm=0;live.forEach((m,j)=>{m.x-=ws*dt;const rg=!!RANGED[m.type]&&m.tier!=='fin'&&m.tier!=='mid',mj=rg?0:jm++;const stopX=rg?bear.x+62+j*5:bear.x+reach(m)+mj*24;m.frz=Math.max(0,m.frz-dt);const spd=m.frz>0?.3:1;m.rg=rg;
    if(m.kb){m.x+=m.kb*dt*4;m.kb*=Math.pow(.01,dt);if(m.kb<1)m.kb=0}
    if(m.x>stopX){m.x-=(m.boss?24:34)*dt*spd;m.ph+=dt*8*spd}else{if(!rg)m.x=Math.max(m.x,stopX-1);m.ph+=dt*3*spd}
    if(m.vy||m.air>0){m.vy+=560*dt;m.air-=m.vy*dt;if(m.air<=0){m.air=0;if(m.vy>80){dust(m.x,4);shake=Math.max(shake,3)}m.vy=0}}
    m.lunge=Math.max(0,m.lunge-dt);
    if(rg){if(m.x<=stopX+12&&m.x-bear.x<150&&!bear.dead&&m.frz<=0){m.cd-=dt;if(m.cd<=0){m.cd=rnd(2.2,3);m.lunge=.18;eShots.push({x:m.x-8,y:hitY(m),dmg:m.atk*rnd(.8,1),col:RANGED[m.type],src:m,t:0})}}}
    else if(mj===0&&m.x<=stopX+6&&!bear.dead&&m.air<=0&&m.frz<=0){m.cd-=dt;if(m.cd<=0){m.cd=m.boss?1.3:1.25;m.lunge=.18;hurtBear(m.atk*rnd(.9,1.1),m)}}});
  eShots=eShots.filter(e=>{e.t+=dt;e.x-=(110+ws)*dt;e.y+=((GY-22)-e.y)*Math.min(1,dt*2.5);if(e.x<=bear.x+6){if(!bear.dead){hurtBear(e.dmg);for(let k=0;k<5;k++)px.push({x:bear.x+6,y:e.y,vx:rnd(-40,40),vy:rnd(-60,10),g:200,life:.3,t:0,c:e.col,s:1})}return false}return e.t<3});
  mobs.forEach(m=>{m.fl-=dt;if(m.dead){if(m.dvx===undefined){m.dt+=dt;m.poof=m.dt>.35}else deathSim(m,dt,ws)}});mobs=mobs.filter(m=>!(m.dead&&m.poof&&m.dt>(m.life||0)+.1));
  shots=shots.filter(s=>{s.t=(s.t||0)+dt;if(s.tg.dead){const n=front();if(n)s.tg=n;else return false}const tx=s.tg.x-2,ty=hitY(s.tg)+(s.dy&&s.t<.15?s.dy*(1-s.t/.15):0);const dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);
    if(d<6){const cr=Math.random()*100<stat('crit');hitTarget(s.tg,s.mult,cr,s.k==='bullet'?'shot':s.k);
      if(s.k==='fire'||s.k==='balloon'){mobs.filter(m=>!m.dead&&m!==s.tg&&Math.abs(m.x-s.tg.x)<34).forEach(m=>hitTarget(m,s.mult*.5,false,s.k));fx.push({k:'ring',x:s.x*K,y:s.y*K,t:0,life:.3,r:90,col:s.k==='fire'?'#ff8a1a':'#8fd0ff'})}return false}
    const sp=s.v*dt;s.x+=dx/d*sp-ws*dt;s.y+=dy/d*sp;if(s.k!=='bullet'&&Math.random()<.7)px.push({x:s.x,y:s.y,vx:-10,vy:rnd(-6,6),g:0,life:.25,t:0,c:s.k==='ice'||s.k==='balloon'?'#d6f2ff':s.k==='orb'?'#c08aff':s.k==='fire'?'#ffb03a':'#d6dbe4',s:1});return true});
  if(mode==='farm'){const bs=S.g%10===9;if(bs&&S.autoBoss&&!bear.dead){if(bossCount<0)bossCount=3;bossCount-=dt;if(bossCount<=0){bossCount=-1;enterBoss()}}else bossCount=-1;$('#bossBtn').hidden=!(bs&&!S.autoBoss)}
  else if(mode==='dun'){if(typeof dunSim==='function')dunSim(dt)}
  else{bossT-=dt;if(bossT<=0)bossFail()}
  px=px.filter(p=>{p.t+=dt;p.vy+=p.g*dt;p.x+=p.vx*dt-ws*dt;p.y+=p.vy*dt;if(!p.dust&&p.y>GY){p.y=GY;p.vy*=-.3;p.vx*=.6}return p.t<p.life});
  fx=fx.filter(f2=>{f2.t+=dt;if(f2.k==='spark'){f2.x+=f2.vx*dt;f2.y+=f2.vy*dt;f2.vx*=.9;f2.vy*=.9}return f2.t<f2.life});
  nums=nums.filter(n=>(n.t+=dt)<1);banners=banners.filter(b=>(b.t+=dt)<1.6);
  const r=cv.getBoundingClientRect(),pr=$('.pill').getBoundingClientRect(),sc=cv.width/(r.width||1);const tx=(pr.left+12-r.left)*sc,ty=(pr.top+12-r.top)*sc;
  const fly=(c,txx,tyy)=>{c.t+=dt;if(c.t<.55){c.vy+=1900*dt;c.x+=c.vx*dt-ws*K*dt;c.y+=c.vy*dt;const gy=(GY-3)*K;if(c.y>gy){c.y=gy;c.vy*=-.4;c.vx*=.6}return false}
    c.fly+=dt;const k2=Math.min(1,c.fly*c.fly*8);c.x+=(txx-c.x)*k2;c.y+=(tyy-c.y)*k2;return Math.hypot(txx-c.x,tyy-c.y)<20};
  coins=coins.filter(c=>{if(fly(c,tx,ty)){S.gold+=c.v;sfx('coin');return false}return true});
  drops=drops.filter(c=>{c.t2=(c.t2||0)+dt;if(c.t2<1.1){if(c.t<.55)fly(c,0,0);else c.t+=0;return true}return!fly(c,cv.width/2,cv.height+40)});
}
function mobDraw(m,F,img){const fly=!!FLY[m.type];
  if(!fly&&!m.air){L.fillStyle='rgba(20,10,20,.22)';L.beginPath();L.ellipse(Math.round(m.x),GY+1,Math.round(F.w*.3),2,0,0,7);L.fill()}
  const walk=Math.sin(m.ph*Math.PI/2),wind=!m.rg&&m.cd<.32&&m.cd>0&&m.x<=bear.x+reach(m)+8;
  let sx=1+walk*.035,sy=1-walk*.045,rot=0,dx=0;
  if(wind){const k=1-m.cd/.32;sx=1-.08*k;sy=1+.1*k;rot=.12*k;dx=3*k}
  if(m.lunge>0){const k=m.lunge/.18;sx=1.14;sy=.9;rot=-.14*k;dx=-6*k}
  if(m.kb>2){rot=.1;dx=1}
  HDQ.push({m,sx,sy,rot,dx})}
let HDQ=[];
function drawSpr(img,x,y,a){L.globalAlpha=a==null?1:a;L.drawImage(img,Math.round(x),Math.round(y));L.globalAlpha=1}
function render(rdt){
  L.setTransform(1,0,0,1,0,0);L.imageSmoothingEnabled=false;L.drawImage(bgOf(ch()).sky,VW-1,1,1,1,0,0,VW,OY+2);L.setTransform(1,0,0,1,0,OY);
  drawBG(L,ch(),scroll,T);weatherRender();
  mobs.slice().sort((a,b)=>b.x-a.x).forEach(m=>{const F=m.fr;
    if(m.dead&&m.dvx!==undefined){deathRender(m);return}
    if(m.dead){L.globalAlpha=Math.max(0,1-Math.max(0,m.dt-.4)/.4);L.drawImage(F.fr[0],Math.round(m.x-F.ax*1.3),Math.round(GY-F.h*.22),Math.round(F.w*1.3),Math.round(F.h*.22));L.globalAlpha=1;return}
    mobDraw(m,F,null);
    if(m.frz>0){L.fillStyle='rgba(160,220,255,.35)';L.fillRect(Math.round(m.x-F.ax*.6),Math.round(GY-F.ay*.9-m.air),Math.round(F.w*.6),Math.round(F.ay*.9))}});
  ghosts.forEach(g=>{L.globalAlpha=(1-g.t/.24)*.55;L.drawImage(ghostOf(g.img),Math.round(g.x-BAX),GY-BG);L.globalAlpha=1});
  bear.fl=Math.max(0,bear.fl-rdt);
  const bi=bear.a.cv[bear.f];drawSpr(bear.fl>0?whiteOf(bi):bi,bear.x-BAX,GY-BG,bear.dead?.4+.3*Math.sin(T*20):1);
  px.forEach(p=>{if(p.smoke){const u=p.t/p.life,r=p.r0*(1+u*1.6);L.globalAlpha=(1-u)*.85;L.fillStyle=p.c;L.beginPath();L.arc(Math.round(p.x),Math.round(p.y),r,0,7);L.fill();return}L.globalAlpha=Math.min(1,(1-p.t/p.life)*1.6);L.fillStyle=p.c;L.fillRect(Math.round(p.x),Math.round(p.y),p.s,p.s)});L.globalAlpha=1;
  drawFront(L,ch(),scroll);

  mobs.forEach(m=>{if(m.dead||m.boss||m.hp>=m.max)return;const y=Math.round(GY-m.fr.ay+2-m.air);L.fillStyle='#1c1424';L.fillRect(Math.round(m.x-10),y,20,3);L.fillStyle='#ff4d5e';L.fillRect(Math.round(m.x-9),y+1,Math.round(18*clamp(m.hp/m.max,0,1)),1)});
  shake*=Math.pow(.003,rdt);flash=Math.max(0,flash-rdt*2.4);const sx=Math.round(rnd(-1,1)*shake),sy=Math.round(rnd(-1,1)*shake);
  X.setTransform(1,0,0,1,0,0);X.imageSmoothingEnabled=false;X.fillStyle='#000';X.fillRect(0,0,cv.width,cv.height);X.drawImage(lo,sx,sy,VW*K,(VH+OY)*K);bgOverlay();if(typeof hdMobs==='function')hdMobs(sx,sy+OYK);
  X.setTransform(1,0,0,1,sx,sy+OYK);
  shots.forEach(s=>{const x=s.x*K,y=s.y*K;
    if(s.k==='bullet'){X.strokeStyle='#fff3a0';X.lineWidth=4;X.beginPath();X.moveTo(x-14,y);X.lineTo(x+4,y);X.stroke()}
    else if(s.k==='pebble'){X.fillStyle='#1c1424';X.beginPath();X.arc(x,y,9,0,7);X.fill();X.fillStyle='#b8bcc8';X.beginPath();X.arc(x,y,6.5,0,7);X.fill()}
    else if(s.k==='balloon'){X.fillStyle='#1c1424';X.beginPath();X.arc(x,y,13,0,7);X.fill();X.fillStyle='#4aa8ff';X.beginPath();X.arc(x,y,10,0,7);X.fill();X.fillStyle='#d6f0ff';X.beginPath();X.arc(x-3,y-4,3,0,7);X.fill()}
    else if(s.k==='star'){X.save();X.translate(x,y);X.rotate(T*30);X.fillStyle='#d6dbe4';X.strokeStyle='#1c1424';X.lineWidth=3;X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?4:13;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.closePath();X.stroke();X.fill();X.restore()}
    else{const c=s.k==='ice'?['#ffffff','#a8e0ff','rgba(80,160,255,0)']:s.k==='fire'?['#ffffff','#ff8a1a','rgba(255,60,0,0)']:['#ffffff','#c08aff','rgba(120,40,200,0)'];const g=X.createRadialGradient(x,y,0,x,y,22);g.addColorStop(0,c[0]);g.addColorStop(.35,c[1]);g.addColorStop(1,c[2]);X.fillStyle=g;X.beginPath();X.arc(x,y,22,0,7);X.fill()}});
  skillRender();
  X.globalCompositeOperation='lighter';
  fx.forEach(f=>{const u=f.t/f.life;X.globalAlpha=1-u;
    if(f.k==='star'){X.save();X.translate(f.x,f.y);X.rotate(u);const r=(f.big?80:44)*(1-u*.5);X.fillStyle='#fff';X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.18:r;X.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}X.fill();
      const g=X.createRadialGradient(0,0,0,0,0,r*.9);g.addColorStop(0,f.col);g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.beginPath();X.arc(0,0,r*.9,0,7);X.fill();X.restore()}
    else if(f.k==='ring'){X.strokeStyle=f.col;X.lineWidth=9*(1-u);X.beginPath();const r=f.r*(1-Math.pow(1-u,3));X.arc(f.x,f.y,r,0,7);X.stroke()}
    else if(f.k==='spark'){X.strokeStyle=f.col;X.lineWidth=4*(1-u);X.beginPath();X.moveTo(f.x,f.y);X.lineTo(f.x-f.vx*.035,f.y-f.vy*.035);X.stroke()}
    else if(f.k==='arc'){X.strokeStyle=f.col;X.lineCap='round';X.lineWidth=20*(1-u);X.beginPath();X.arc(f.x,f.y,f.r,f.a0,f.a1);X.stroke();X.strokeStyle='#fff';X.lineWidth=7*(1-u);X.beginPath();X.arc(f.x,f.y,f.r,f.a0+.2,f.a1-.1);X.stroke()}
    else if(f.k==='beam'){X.strokeStyle='#bff4ff';X.lineWidth=22*(1-u)+2;X.beginPath();X.moveTo(f.x,f.y);X.lineTo(cv.width,f.y);X.stroke();X.strokeStyle='#fff';X.lineWidth=8*(1-u)+1;X.beginPath();X.moveTo(f.x,f.y);X.lineTo(cv.width,f.y);X.stroke()}
    else if(f.k==='muzzle'){const g=X.createRadialGradient(f.x,f.y,0,f.x,f.y,26);g.addColorStop(0,'#fff');g.addColorStop(.4,'#ffd23f');g.addColorStop(1,'rgba(255,120,0,0)');X.fillStyle=g;X.beginPath();X.arc(f.x+8,f.y,26,0,7);X.fill()}
    else if(f.k==='circle'){X.strokeStyle=f.col;X.lineWidth=5;X.beginPath();X.ellipse(f.x,f.y,40*(.5+u),40*(.5+u),T,0,7);X.stroke();X.beginPath();X.ellipse(f.x,f.y,26*(.5+u),26*(.5+u),-T,0,7);X.stroke()}
    else if(f.k==='bolt'){X.strokeStyle='#fff6c0';X.lineWidth=8*(1-u)+2;X.beginPath();let y=0,x=f.x+rnd(-20,20);X.moveTo(x,y);while(y<f.y){y+=40;x+=rnd(-26,26);X.lineTo(Math.min(cv.width,Math.max(0,x)),Math.min(y,f.y))}X.lineTo(f.x,f.y);X.stroke()}});
  X.globalAlpha=1;X.globalCompositeOperation='source-over';
  coins.forEach(c=>{X.save();X.translate(c.x,c.y);X.scale(Math.abs(Math.cos(c.t*9))*.75+.25,1);X.fillStyle='#140c0a';X.beginPath();X.arc(0,0,10,0,7);X.fill();const g=X.createLinearGradient(0,-8,0,8);g.addColorStop(0,'#fff0a0');g.addColorStop(1,'#f0a818');X.fillStyle=g;X.beginPath();X.arc(0,0,7.5,0,7);X.fill();X.fillStyle='#c88a10';X.fillRect(-1.5,-4,3,8);X.restore()});
  drops.forEach(d=>{const it=ITEMS[d.id];X.save();X.translate(d.x,d.y);const gl=X.createRadialGradient(0,0,0,0,0,40);gl.addColorStop(0,GCOL[it.g]);gl.addColorStop(1,'rgba(0,0,0,0)');X.globalAlpha=.7+.3*Math.sin(T*12);X.fillStyle=gl;X.beginPath();X.arc(0,0,40,0,7);X.fill();X.globalAlpha=1;X.imageSmoothingEnabled=false;X.drawImage(iconCanvas(d.id),-24,-24,48,48);X.restore()});
  dmgRender(rdt);
  X.setTransform(1,0,0,1,0,0);
  banners.forEach(b=>{const u=b.t/1.6,s=b.t<.12?.4+b.t/.12*.75:b.t<.22?1.15-(b.t-.12)/.1*.15:1;X.save();X.globalAlpha=u>.75?1-(u-.75)/.25:1;X.translate(cv.width/2,cv.height*.36);X.scale(s,s);
    X.font='48px "Jal","Fredoka","Jua",sans-serif';X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';X.lineWidth=12;X.strokeStyle='#140c0a';X.strokeText(b.s,0,4);X.strokeText(b.s,0,0);
    const g=X.createLinearGradient(0,-26,0,26);g.addColorStop(0,'#fff');g.addColorStop(1,b.col);X.fillStyle=g;X.fillText(b.s,0,0);X.restore()});
  if(flash>0){X.globalAlpha=flash;X.fillStyle=flashC;X.fillRect(0,0,cv.width,cv.height);X.globalAlpha=1}
}

/* ---------- HUD + panel ---------- */
const H$={lv:$('#lvTxt'),x:$('#xfill'),g:$('#goldTxt'),j:$('#gemTxt'),sn:$('#sname'),sp:$('#sprog'),sf:$('#sfill'),sb:$('#sbar')};
function hud(){H$.lv.textContent=`Lv.${S.lv}`;H$.x.style.width=(S.exp/needExp(S.lv)*100)+'%';H$.g.textContent=fmt(S.gold);H$.j.textContent=fmt(S.gem);
  if(mode==='boss'){const b=mobs.find(m=>m.boss&&!m.dead);H$.sb.classList.add('boss');H$.sn.textContent=b?bossName(b):'보스';H$.sp.textContent=Math.ceil(Math.max(0,bossT))+'초';H$.sf.style.width=(b?clamp(b.hp/b.max,0,1)*100:100)+'%'}
  else{const gd=mobs.find(m=>m.guard&&!m.dead),bs=S.g%10===9,c1=ch()+1;
    if(gd){H$.sb.classList.add('boss');H$.sn.textContent=`${stageName(S.g)} ${bossName(gd)}`;H$.sp.textContent='처치!';H$.sf.style.width=clamp(gd.hp/gd.max,0,1)*100+'%'}
    else if(bs){H$.sb.classList.toggle('boss',S.autoBoss);H$.sn.textContent=S.autoBoss?`${c1}-10 ${MOBNAME[theme().fin]}`:`${c1}-9 반복 사냥`;H$.sp.textContent=S.autoBoss?(bossCount>=0?`${Math.ceil(bossCount)}초 후 입장`:''):'보스 대기';H$.sf.style.width='100%'}
    else{H$.sb.classList.remove('boss');const t=stageBoss(S.g),q=QUOTA(S.g);H$.sn.textContent=`${stageName(S.g)} ${theme().name}`;H$.sp.textContent=`${S.kills}/${q}`+(t==='mid0'||t==='mid1'?' · 중보':t==='elite'?' · 정예':'');H$.sf.style.width=S.kills/q*100+'%'}}
  {const bb=$('#bossBtn');if(!bb.hidden&&bb.dataset.c!==String(S.g)){bb.dataset.c=S.g;const F=mobFrames(theme().fin,1);bb.innerHTML=`<canvas width="${F.w}" height="${F.h}"></canvas><span><small>${ch()+1}-10</small>보스 도전</span>`;const x=bb.querySelector('canvas').getContext('2d');x.drawImage(F.fr[0],0,0)}}
  const cs=Math.floor(S.g/10)*10;if(hud.k!==S.g){hud.k=S.g;$('#sdots').innerHTML=Array.from({length:10},(_,i)=>`<i class="${cs+i<S.g?'done':cs+i===S.g?'cur':''} ${i===4||i===8?'mid':i===9?'fin':''}"></i>`).join('')}
  const bf=$('#buff');if(S.buff>Date.now()){const r=Math.ceil((S.buff-Date.now())/1000);bf.hidden=false;bf.textContent=`골드 2배 ${Math.floor(r/60)}:${String(r%60).padStart(2,'0')}`}else bf.hidden=true}
let tab='grow';
function holdBtn(b,fn){let iv=null,to=null;const stop=()=>{clearTimeout(to);clearInterval(iv);to=iv=null};
  b.addEventListener('pointerdown',e=>{e.preventDefault();fn();to=setTimeout(()=>{iv=setInterval(()=>{if(b.disabled||!b.isConnected)stop();else fn()},70)},380)});
  ['pointerup','pointerleave','pointercancel'].forEach(v=>b.addEventListener(v,stop));b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})}
function rowBase(drawIcon,titleHTML,line){const r=document.createElement('div');r.className='row';const c=document.createElement('canvas');c.className='pix';c.width=48;c.height=48;drawIcon(c);r.appendChild(c);
  const inf=document.createElement('div');inf.className='inf';inf.innerHTML=`<b>${titleHTML}</b><span>${line}</span>`;r.appendChild(inf);return r}
const badge=g=>`<i class="gb g${g}">${GRADES[g]}</i>`;
function buyN(u){const l=S.up[u.k];let n=S.mult==='max'?1e4:S.mult,c=0,k=0;
  for(;k<n&&l+k<u.max;k++){const cc=u.cost(l+k);if(S.mult==='max'&&c+cc>S.gold)break;c+=cc}if(S.mult==='max'&&k===0){k=1;c=u.cost(l)}return[k,c]}
function renderPanel(){const Lst=$('#list');Lst.innerHTML='';const H=$('#phead');H.innerHTML='';
  if(tab==='grow'){[1,10,100,'max'].forEach(m=>{const c=document.createElement('button');c.className='chip'+(S.mult===m?' on':'');c.textContent=m==='max'?'MAX':'x'+m;c.addEventListener('click',()=>{S.mult=m;sfx('ui');renderPanel()});H.appendChild(c)});
    UPS.forEach(u=>{const row=rowBase(c=>icon(c,u.ic),'',''),b=document.createElement('button');b.className='buy';row.appendChild(b);
    const upd=()=>{const l=S.up[u.k],mx=l>=u.max,[k,c]=buyN(u);row.querySelector('.inf').innerHTML=`<b>${u.n}<small>Lv.${l}</small></b><span>${mx?`${u.show(u.val(l))} <s>최대</s>`:`${u.show(u.val(l))} <s>→</s> ${u.show(u.val(Math.min(u.max,l+k)))}`}</span>`;
      b.dataset.cost=c;b.innerHTML=mx?'최대':`강화${k>1?' x'+k:''}<small><b></b>${fmt(c)}</small>`;if(mx)b.dataset.fixed=1};
    upd();row.upd=upd;holdBtn(b,()=>{const[k,c]=buyN(u);if(!k||S.gold<c||S.up[u.k]>=u.max)return;S.gold-=c;S.up[u.k]+=k;S.cnt['up_'+u.k]=(S.cnt['up_'+u.k]||0)+k;S.cnt.up_any=(S.cnt.up_any||0)+k;sfx('buy');
      document.querySelectorAll('#list .row').forEach(r=>r.upd&&r.upd());refreshPanel()});Lst.appendChild(row)})}
  else if(tab==='gear'){
    const GC=S.gcat||'w',CATS=[['w','무기'],['c','옷'],['a','악세사리']];
    CATS.forEach(([k,n])=>{const c=document.createElement('button');c.className='chip'+(GC===k?' on':'');const cnt=Object.keys(S.inv).filter(i=>S.inv[i]>0&&ITEMS[i].c===k).length;c.innerHTML=`${n}<small> ${cnt}</small>`;c.addEventListener('click',()=>{S.gcat=k;sfx('ui');renderPanel()});H.appendChild(c)});
    const eqLine=document.createElement('div');eqLine.className='eqline';
    [['w','무기'],['c','옷'],['a1','악세사리'],['a2','악세사리']].forEach(([k,n])=>{const id=S.eq[k];const d=document.createElement('button');d.className='slot'+((k[0]===GC)?' sel':'');d.addEventListener('click',()=>{S.gcat=k[0];sfx('ui');renderPanel()});const c=document.createElement('canvas');c.className='pix';c.width=48;c.height=48;
      const ic=document.createElement('div');ic.className='sic';if(id){itemIcon(c,id);ic.insertAdjacentHTML('beforeend',badge(ITEMS[id].g)+(ENH(id)?`<u>+${ENH(id)}</u>`:''))}ic.prepend(c);d.appendChild(ic);d.insertAdjacentHTML('beforeend',`<b class="snm">${id?SN(id):n}</b>`);if(!id)d.classList.add('empty');eqLine.appendChild(d)});
    Lst.appendChild(eqLine);fitNames(eqLine);
    const ids=Object.keys(S.inv).filter(k=>S.inv[k]>0&&ITEMS[k].c===GC).sort((a,b)=>('wca'.indexOf(ITEMS[a].c)-'wca'.indexOf(ITEMS[b].c))||ITEMS[b].g-ITEMS[a].g);
    ids.forEach(id=>{const it=ITEMS[id],slot=it.c==='a'?(S.eq.a1===id?'a1':S.eq.a2===id?'a2':null):it.c,on=slot?S.eq[slot]===id:false;
      const em=EM(id),pc=v=>Math.round(v*100*em);const eff=it.c==='w'?`공격력 x${+(GMUL[it.g]*em).toFixed(2)} · ${KIND_TXT[it.w.kind]}${typeof ULT!=="undefined"&&ULT[id]?` · <em class="ult">궁극기 ${ULT[id].n}</em>`:""}`:it.up?`두 발로 달리기${it.hp?` · 체력 +${pc(it.hp)}%`:''}`:it.scarfItem?`체력 +${pc(it.hp)}% · 목에 두르기`:it.spd?(id==='sande'?`공격 속도 +${pc(it.spd)}% · 잔상`:`공격 속도 +${pc(it.spd)}%`):`체력 +${pc(COS_HP[it.cos])}%`;
      const row=rowBase(c=>itemIcon(c,id),`${badge(it.g)}${it.n}${ENH(id)?`<em class="enh">+${ENH(id)}</em>`:''}${S.inv[id]>1?`<small class="cnt">x${S.inv[id]}</small>`:''}`,eff);row.dataset.id=id;
      const b=document.createElement('button');b.className='buy';b.dataset.fixed=1;b.textContent=on?(slot==='w'?'장착 중':'해제'):'장착';b.disabled=on&&slot==='w';if(on&&slot==='w')b.classList.add('on');
      b.addEventListener('click',()=>{if(on&&slot!=='w')S.eq[slot]=null;else if(it.c==='a'){if(!S.eq.a1)S.eq.a1=id;else if(!S.eq.a2)S.eq.a2=id;else{S.eq.a2=id;toast('악세사리 칸이 가득 차서 두 번째 칸을 바꿨어요')}}else S.eq[slot]=id;S.cnt.equip=(S.cnt.equip||0)+1;equipChanged()});b.dataset.keep=1;row.appendChild(b);Lst.appendChild(row)});
    if(!ids.length)Lst.insertAdjacentHTML('beforeend',`<p class="note empty">아직 가진 ${GC==='w'?'무기':GC==='c'?'옷':'악세사리'}가 없어요</p>`);
    Lst.insertAdjacentHTML('beforeend',`<p class="note">${GC==='w'?'총·표창·마법서를 끼면 공격 동작이 바뀌어요.':GC==='c'?'옷은 체력을 올려 주고 겉모습이 바뀌어요.':'악세사리는 두 칸까지 낄 수 있어요. 척수 변형 임플란트를 끼면 두 발로 달려요.'} 장비는 몹 드랍이나 상점 소환으로 얻어요.</p>`)}
  else if(tab==='skill'){
    {const r=rowBase(c=>icon(c,'aspd'),'스킬 자동 사용','몹이 가까이 오면 알아서 써요');const b=document.createElement('button');b.className='tog'+(S.auto?' on':'');b.dataset.keep=1;b.textContent=S.auto?'켜짐':'꺼짐';
      b.addEventListener('click',()=>{S.auto=!S.auto;$('#auto').classList.toggle('on',S.auto);renderPanel()});r.appendChild(b);Lst.appendChild(r)}
    SKILLS.forEach((sk,i)=>{const row=rowBase(c=>{const r2=raster(skPrims(sk.id),24,24);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(r2,0,0,48,48)},`${sk.n}<small>Lv.${skLv(i)}</small>`,`피해 ${Math.round(skMul(i)*100)}%${sk.ticks?' x'+sk.ticks+'회':''} · 쿨타임 ${sk.cd}초<br><span class="sub">${sk.desc}</span>`);
      const b=document.createElement('button');b.className='buy';b.dataset.cost=skCost(i);b.innerHTML=`강화<small><b></b>${fmt(skCost(i))}</small>`;
      b.addEventListener('click',()=>{const c=skCost(i);if(S.gold<c)return;S.gold-=c;S.skl[sk.id]=skLv(i)+1;S.cnt.skillup=(S.cnt.skillup||0)+1;sfx('buy');renderPanel()});row.appendChild(b);Lst.appendChild(row)})}
  else if(tab==='pet'){renderPetTab(Lst,H)}
  else if(tab==='petOLD'){[['turtle','거북탱','물방울 대포 · 1-10 클리어 후 합류 예정'],['lock','펭귄 궁수','얼음 화살 · 2챕터'],['lock','여우 마법사','여우불 · 3챕터']].forEach(([ic,n,d])=>{const r=rowBase(c=>icon(c,ic),n,d);r.classList.add('lock');Lst.appendChild(r)});
    Lst.insertAdjacentHTML('beforeend','<p class="note">동료는 다음 업데이트에서 열려요.</p>')}
  else if(tab==='dungeon'){[['골드 던전','골드를 왕창 모아요'],['보석 던전','보석을 모아요'],['강화석 던전','장비 강화 재료를 모아요']].forEach(([n,d])=>{const r=rowBase(c=>icon(c,'lock'),n,d+' · 다음 업데이트');r.classList.add('lock');Lst.appendChild(r)})}
  else if(tab==='shop'){[[1,50],[10,450]].forEach(([n,cost])=>{const r=rowBase(c=>icon(c,'gem'),`장비 소환 ${n}회`,`보석 ${cost}개 · C~H 등급`);const b=document.createElement('button');b.className='buy gemb';b.innerHTML=`소환<small><b></b>${cost}</small>`;b.dataset.gem=cost;
      b.addEventListener('click',()=>{if(S.gem<cost)return;S.gem-=cost;S.cnt.summon=(S.cnt.summon||0)+n;sfx('drop',2);const P=rollPull('item',n);
        showGacha(P.ids,n,cost,'item',P.dups);save();refreshPanel()});r.appendChild(b);Lst.appendChild(r)});
    petShopRows(Lst);
    {const on=S.buff>Date.now();const r=rowBase(c=>icon(c,'crit'),'골드 2배 30분',on?'적용 중이에요':'출시 버전에선 광고를 보고 받아요');const b=document.createElement('button');b.className='buy';b.dataset.keep=1;b.textContent=on?'적용 중':'받기';b.disabled=on;
      b.addEventListener('click',()=>{S.buff=Date.now()+30*60*1000;sfx('level');logAdd('<span style="color:#ffc43d">골드 2배 시작!</span>');renderPanel();save()});r.appendChild(b);Lst.appendChild(r)}
    {const r=rowBase(c=>icon(c,'lock'),'광고 제거 패키지','출시 때 열려요');r.classList.add('lock');Lst.appendChild(r)}
    Lst.insertAdjacentHTML('beforeend',`<p class="note">소환 확률: C 62% · B 33% · A 4% · S 0.8% · SS 0.15% · SSS 0.04% · H 0.01%<br>몹 드랍은 이보다 더 짜요.</p>`)}
  refreshPanel()}
function refreshPanel(){document.querySelectorAll('#list .buy').forEach(b=>{if(b.dataset.gem)b.disabled=S.gem<+b.dataset.gem;else if(b.dataset.keep)return;else b.disabled=b.dataset.fixed?true:S.gold<+b.dataset.cost})}
function equipChanged(){toast('장비를 바꾸는 중…');setTimeout(()=>{setBear(true);renderPanel();save()},30)}
$('#bossBtn').addEventListener('click',()=>{if(S.g%10!==9||mode==='boss'||bear.dead)return;S.autoBoss=true;bossCount=-1;enterBoss()});
function modal(t,p,big,btn,fn){$('#mT').textContent=t;$('#mP').textContent=p;$('#mB').textContent=big;$('#mB').hidden=!big;$('#mOk').textContent=btn;$('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;fn&&fn()}}
function modalHTML(t,html){$('#mT').textContent=t;$('#mP').innerHTML=html;$('#mB').hidden=true;$('#mOk').textContent='확인';$('#modal').hidden=false;$('#mOk').onclick=()=>{$('#modal').hidden=true;$('#mP').textContent='';if(tab==='gear')renderPanel()}}
function setBear(keepPose){const nm=bear.name;bear.set=bearSet();const run=runName();
  play(bear,keepPose&&nm&&bear.set[nm]&&!['run','walk2','stand','drop'].includes(nm)?'idle':run);runT=0;
  const av=$('#ava').getContext('2d');av.imageSmoothingEnabled=false;av.clearRect(0,0,24,24);av.drawImage(bear.set.idle.cv[0],20,50,30,30,0,0,24,24)}

/* ---------- lobby ---------- */
const LC=$('#lcv').getContext('2d');LC.imageSmoothingEnabled=false;
const lobbySky=pcan(180,120,put=>{grad(put,180,0,80,['#120c26','#24164a','#3c2468','#6a3a7c']);for(let i=0;i<50;i++)put((i*67)%180,(i*29)%70,hex(i%4?'#cdbbe8':'#ffffff'));disc(put,140,24,9,hex('#fff2d0'));
  grad(put,180,80,120,['#1e3a6a','#173058','#10223f']);for(let i=0;i<30;i++){const x=(i*41)%180,y=84+(i*13)%34;put(x,y,hex('#6a8fc8'));put(x+1,y,hex('#6a8fc8'))}
  const ice=hex('#e8f4ff'),ice2=hex('#a9c6e6'),ice3=hex('#6f8fb8');for(let y=0;y<10;y++)for(let x=-34+y;x<=34-y*.6;x++)put(70+x,96+y,y<2?ice:y<6?ice2:ice3)});
let lobbyT=0;
function lobbyDraw(dt){lobbyT+=dt;LC.drawImage(lobbySky,0,0);const bs=bearSet().idle;const f=Math.floor(lobbyT*6)%bs.cv.length;
  const bob=Math.round(Math.sin(lobbyT*1.6)*1.2);LC.drawImage(bs.cv[f],70-BAX,96-BG+bob);
  LC.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<4;i++){const x=Math.floor((i*47+lobbyT*14)%200)-10;LC.fillRect(x,100+i*5+bob,6,1)}}
function lobbyInfo(){$('#lrec').textContent=S.started?`최고 기록 ${stageName(Math.max(S.best,S.g))} · Lv.${S.lv}`:'처음 시작하는 모험';$('#lStart').textContent=S.started?'이어하기':'모험 시작'}
let screen='lobby',offlineDone=false;
function goGame(){screen='game';setBgm(chBgm());$('#snd').classList.toggle('off',!audioOn());$('#auto').classList.toggle('on',!!S.auto);if(S.mBase==null)startMission();$('#lobby').hidden=true;$('#game').hidden=false;setBear();if(!bear.hp)bear.hp=MAXHP();renderPanel();
  if(S.migrated){S.migrated=0;setTimeout(()=>modal('난이도가 크게 올랐어요!','몬스터가 훨씬 강해져서 지금 힘에 맞는 스테이지로 옮겨 드렸어요. 챕터 보스는 이제 각 챕터 10스테이지에만 나와요.','','확인'),400)}
  if(!S.started){S.started=true;save();modal('잃어버린 고향을 찾아서..','판자 하나 등에 메고, 고향을 녹여버린 발원지를 찾아 떠나요. 데모 선물로 보석 500개를 넣어 뒀어요.','','출발!')}
  else if(!offlineDone){const away=(Date.now()-S.t)/1000;if(away>60){const sec=Math.min(away,8*3600),g=mobGold(S.g)*.45*sec,h=Math.floor(sec/3600),mm=Math.floor(sec%3600/60);
    showAway(sec,g)}}
  offlineDone=true}
function goLobby(){save();screen='lobby';setBgm(null);$('#game').hidden=true;$('#lobby').hidden=false;lobbyInfo()}
$('#lStart').addEventListener('click',()=>{if(!S.started)showIntro(false);else goGame()});$('#home').addEventListener('click',goLobby);
$('#lReset').addEventListener('click',()=>{$('#lConfirm').hidden=false});$('#lNo').addEventListener('click',()=>{$('#lConfirm').hidden=true});
$('#lYes').addEventListener('click',()=>{try{localStorage.removeItem(KEY)}catch(e){}S=JSON.parse(JSON.stringify(S0));S.t=Date.now();mobs=[];mode='farm';bear.hp=0;$('#lConfirm').hidden=true;lobbyInfo();setBear()});
addEventListener('visibilitychange',()=>{if(document.hidden)save()});

/* ---------- loop ---------- */
let last=performance.now(),acc=0,saveT=0;
function frame(now){const rdt=Math.min(.05,(now-last)/1000);last=now;
  if(screen==='lobby')lobbyDraw(rdt);
  else if(screen==='intro')introDraw(rdt);
  else{if(stop>0)stop-=rdt;else if($('#modal').hidden&&$('#victory').hidden&&$('#gacha').hidden&&$('#away').hidden){const k=slowT>0?.35:1;slowT=Math.max(0,slowT-rdt);const dt=rdt*k;
      const atkA=['smash','smash2','upper','kick','rage','shoot','throw','cast'].includes(bear.name);const asp=atkA?ASPD()*(bear.name==='shoot'&&W().w.big?1.9:1):1;step(bear,dt*asp);sim(dt);skillSim(dt,curWS);weatherSim(dt,curWS)}
    render(rdt);hud();skillHud();acc+=rdt;if(acc>.25){acc=0;refreshPanel();cpHud();missionHud();navDots()}saveT+=rdt;if(saveT>5){saveT=0;save()}}
  requestAnimationFrame(frame)}
bear.set=bearSet();play(bear,runName());lobbyInfo();requestAnimationFrame(t=>{last=t;frame(t)});
</script>
