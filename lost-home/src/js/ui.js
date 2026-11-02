/* ---------- HUD, panels, lobby, modals ---------- */
const ICON={
 gold:'<svg viewBox="0 0 24 24"><defs><radialGradient id="gc" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c0"/><stop offset=".5" stop-color="#ffcf3d"/><stop offset="1" stop-color="#d48a10"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="url(#gc)" stroke="#8a5a00" stroke-width="1.5"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#b47a10" stroke-width="1.2"/></svg>',
 gem:'<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#7fe3ff" stroke="#1a6a9a" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 9h20M8 3l4 18M16 3l-4 18" stroke="#c8f4ff" stroke-width="1" opacity=".8"/></svg>',
 atk:'<svg viewBox="0 0 32 32"><path d="M24 3l5 0 0 5-13 13-5-5z" fill="#e8eef8" stroke="#3a4a6a" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 17l7 7M5 27l6-6" stroke="#8a5a30" stroke-width="3.4" stroke-linecap="round"/><path d="M6 15l11 11" stroke="#ffcf3d" stroke-width="3" stroke-linecap="round"/></svg>',
 hp:'<svg viewBox="0 0 32 32"><path d="M16 28S3 20 3 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 13 3.5C29 20 16 28 16 28z" fill="#ff5b6e" stroke="#9c1d33" stroke-width="1.6"/><ellipse cx="10" cy="11" rx="3" ry="2" fill="#fff" opacity=".6"/></svg>',
 regen:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#8ae86a" stroke="#2a7a2a" stroke-width="1.6"/><path d="M16 9v14M9 16h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
 crit:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#fff" stroke="#c8303a" stroke-width="2"/><circle cx="16" cy="16" r="7.5" fill="none" stroke="#ff5b6e" stroke-width="2.4"/><circle cx="16" cy="16" r="3" fill="#c8303a"/></svg>',
 critd:'<svg viewBox="0 0 32 32"><path d="M16 2l3.5 8.5L28 8l-4.5 8L30 21l-9 .5L16 30l-3-8.5L4 24l4.5-8L2 11l9 .5z" fill="#ffcf3d" stroke="#c86a10" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.5" fill="#fff6c0"/></svg>',
 aspd:'<svg viewBox="0 0 32 32"><path d="M19 2L6 18h9l-3 12 14-17h-9z" fill="#7fe3ff" stroke="#1a6a9a" stroke-width="1.6" stroke-linejoin="round"/></svg>',
};
document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=ICON[e.dataset.ic]);
let GOLDX=60,GOLDY=20;
function measureHud(){const s=$('#stage').getBoundingClientRect(),g=$('#goldtxt').getBoundingClientRect();if(s.width)[GOLDX,GOLDY]=[g.left-s.left-10,g.top-s.top+g.height/2];}
function pulseGold(){const e=$('#goldtxt').parentElement;e.animate([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:160});}
let banT;function banner(txt,col){const b=$('#banner');b.textContent=txt;b.style.color=col||'#fff';b.classList.remove('show');void b.offsetWidth;b.classList.add('show');clearTimeout(banT);banT=setTimeout(()=>b.classList.remove('show'),1900);}
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);}
function updateHud(){
 $('#lvtxt').textContent=`Lv.${S.lv}`;$('#expbar b').style.width=(S.exp/needExp(S.lv)*100).toFixed(1)+'%';
 $('#goldtxt').textContent=fmt(S.gold);$('#gemtxt').textContent=fmt(S.gem);
 const bossStage=S.g%10===9;$('#stname').textContent=`${stageName(S.g)} ${theme().name}`;
 $('#killbar').hidden=!!boss;$('#bosstimer').hidden=!boss;
 $('#killbar b').style.width=(S.farm?100:S.kills/KILLS*100)+'%';if(boss)$('#bosstimer b').style.width=(bossT/30*100)+'%';
 $('#stsub').textContent=boss?'보스를 쓰러뜨리세요!':S.farm?'사냥 중 · 강해지면 다시 도전':bossStage?`보스까지 ${KILLS-S.kills}마리`:`${S.kills} / ${KILLS}`;
 $('#bossbtn').hidden=!(S.farm&&bossStage&&!boss);
 refreshPanel();}
$('#bossbtn').onclick=()=>{S.farm=false;S.kills=KILLS;for(const m of mobs)m.dead=true,m.dt=.01;updateHud();};
/* upgrade panel */
let tab='up';
function costN(u,n){let c=0,l=S.up[u.k];for(let i=0;i<n&&l<u.max;i++,l++)c+=u.cost(l);return c;}
function buyCount(u){if(S.mult)return Math.min(S.mult,u.max-S.up[u.k]);let n=0,c=0,l=S.up[u.k];while(l<u.max&&n<500){const nc=u.cost(l);if(c+nc>S.gold)break;c+=nc;l++;n++;}return Math.max(1,n);}
function renderPanel(){const L=$('#plist');$('#ptools').style.display=tab==='up'?'':'none';
 if(tab==='up'){L.innerHTML=UPS.map(u=>`<div class="row" data-k="${u.k}"><div class="ric">${ICON[u.k]}</div><div class="rinfo"><div class="rname">${u.n}<small>Lv.<span class="lv"></span></small></div><div class="rval"></div></div><button class="buy"><span class="bt"></span><small class="bc"></small></button></div>`).join('');
  L.querySelectorAll('.row').forEach(r=>holdBuy(r.querySelector('.buy'),UPS.find(u=>u.k===r.dataset.k)));}
 else{const h=Math.floor(S.stats.play/3600),mi=Math.floor(S.stats.play/60)%60;
  L.innerHTML=`<div class="info"><h3>백곰의 기록</h3><div class="grid2"><span>최고 스테이지 <b>${stageName(S.best)}</b></span><span>레벨 <b>${S.lv}</b></span><span>처치한 몬스터 <b>${fmt(S.stats.kills)}</b></span><span>쓰러뜨린 보스 <b>${fmt(S.stats.bosses)}</b></span><span>모은 골드 <b>${fmt(S.stats.gold)}</b></span><span>플레이 시간 <b>${h}시간 ${mi}분</b></span></div></div>
  <div class="info"><h3>현재 능력치</h3><div class="grid2"><span>공격력 <b>${fmt(ATK())}</b></span><span>체력 <b>${fmt(MAXHP())}</b></span><span>초당 회복 <b>${fmt(REGEN())}</b></span><span>치명타 <b>${stat('crit').toFixed(1)}%</b></span><span>치명타 피해 <b>${fmt(stat('critd'))}%</b></span><span>공격 속도 <b>x${stat('aspd').toFixed(2)}</b></span></div></div>
  <div class="info"><h3>여정</h3>북극의 빙하가 녹아 고향을 잃은 백곰. 오염된 땅을 지나 마계의 마왕을 쓰러뜨리고 고향을 되찾아야 해요. 12·15·18챕터에는 마왕군 간부, 20챕터에는 마왕이 기다려요.</div>`;}
 refreshPanel();}
function refreshPanel(){if(tab!=='up')return;
 for(const r of document.querySelectorAll('#plist .row')){const u=UPS.find(x=>x.k===r.dataset.k),l=S.up[u.k],max=l>=u.max,n=buyCount(u),c=costN(u,n);
  r.querySelector('.lv').textContent=l;r.querySelector('.rval').innerHTML=max?`${u.show(u.val(l))} · 최대`:`${u.show(u.val(l))} <i class="ar">→</i> <b>${u.show(u.val(l+n))}</b>`;
  const b=r.querySelector('.buy');b.classList.toggle('max',max);b.classList.toggle('no',!max&&S.gold<c);
  r.querySelector('.bt').textContent=max?'MAX':`+${n} 강화`;r.querySelector('.bc').textContent=max?'':fmt(c)+' 골드';}}
function buy(u){const n=buyCount(u),c=costN(u,n);if(S.up[u.k]>=u.max||S.gold<c)return false;S.gold-=c;const hpK=bear.hp/MAXHP();S.up[u.k]+=n;if(u.k==='hp')bear.hp=hpK*MAXHP();sfx('buy');updateHud();return true;}
function holdBuy(btn,u){let tm=null,rep=0;const go=()=>{if(!buy(u)){stop();return;}rep++;tm=setTimeout(go,Math.max(45,220-rep*25));};const stop=()=>{clearTimeout(tm);tm=null;rep=0;save();};
 btn.addEventListener('pointerdown',e=>{e.preventDefault();if(!buy(u))return;tm=setTimeout(go,380);});['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>tm&&stop()));}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{tab=t.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));renderPanel();});
document.querySelectorAll('#mult button').forEach(b=>{b.classList.toggle('on',+b.dataset.m===S.mult);b.onclick=()=>{S.mult=+b.dataset.m;document.querySelectorAll('#mult button').forEach(x=>x.classList.toggle('on',x===b));refreshPanel();save();};});
/* modal */
function modal(title,text,btns){$('#mtitle').textContent=title;$('#mtext').innerHTML=text;const B=$('#mbtns');B.innerHTML='';
 for(const[label,fn,ok]of btns){const b=document.createElement('button');b.textContent=label;if(ok)b.className='ok';b.onclick=()=>{$('#modal').hidden=true;fn&&fn();};B.appendChild(b);}$('#modal').hidden=false;}
$('#setbtn').onclick=()=>modal('설정',`소리: <b>${S.snd?'켜짐':'꺼짐'}</b>`,[[S.snd?'소리 끄기':'소리 켜기',()=>{S.snd=!S.snd;save();}],['처음부터',()=>modal('정말 처음부터?','모든 진행 상황이 지워져요.',[['취소'],['지우기',resetSave,1]])],['닫기',null,1]]);
/* lobby */
const bgLobby=new BG($('#lbg')),lfg=$('#lfg'),lc=lfg.getContext('2d');let screen='lobby';
bgLobby.theme(LOBBY_THEME);bgLobby.ground=.16;bgLobby.horizon=.36;
function lobbyText(){$('#lsub').textContent=S.started?`이어하기 · ${stageName(S.g)} ${theme().name}`:'처음 시작하는 모험';$('#startbtn').textContent=S.started?'이어하기':'모험 시작';}
function drawLobby(t){const r=$('#lobby').getBoundingClientRect();if(!r.width)return;const w=r.width,h=r.height,q=Math.min(DPR,1.5);
 if(lfg.width!==Math.round(w*DPR)||lfg.height!==Math.round(h*DPR)){lfg.width=w*DPR;lfg.height=h*DPR;bgLobby.resize(Math.round(w*q),Math.round(h*q));}
 bgLobby.draw(t,t*.01);lc.setTransform(DPR,0,0,DPR,0,0);lc.clearRect(0,0,w,h);
 const s=Math.min(w/380,h/700)*1.25,gy=Math.min(h*(1-bgLobby.ground)-h*.02,$('#lsub').getBoundingClientRect().top-r.top-30*s),bx=w*.5,bob=Math.sin(t*1.2)*3;
 lc.save();lc.translate(bx,gy+bob);lc.beginPath();lc.ellipse(0,6*s,90*s,16*s,0,0,TAU);const ig=lc.createLinearGradient(0,-10*s,0,22*s);ig.addColorStop(0,'#ffffff');ig.addColorStop(1,'#9cc8ea');lc.fillStyle=ig;lc.fill();
 lc.strokeStyle='rgba(255,255,255,.6)';lc.lineWidth=2;lc.stroke();lc.scale(s,s);drawBear(lc,{t,ph:0,walk:0,atk:-1});lc.restore();
 lc.strokeStyle='rgba(255,255,255,.35)';lc.lineWidth=1.5;for(let i=0;i<3;i++){const k=(t*.4+i/3)%1;lc.globalAlpha=1-k;lc.beginPath();lc.ellipse(bx,gy+bob+8*s,(90+k*60)*s,(16+k*10)*s,0,0,TAU);lc.stroke();}lc.globalAlpha=1;}
$('#startbtn').onclick=()=>{audioInit();$('#lobby').hidden=true;screen='game';if(!S.started){S.started=true;banner(theme().name,'#9fdcff');toast('백곰이 잃어버린 고향을 찾아 떠나요!');save();}resizeStage();measureHud();updateHud();};
$('#backarc').onclick=()=>{save();location.href='../';};
function offlineReward(){if(!S.started||!S.t)return;const sec=Math.min(8*3600,(Date.now()-S.t)/1000);if(sec<60)return;
 const gold=Math.floor(mobGold(S.g)*.5*sec*.6),exp=mobExp(S.g)*.5*sec*.3;S.gold+=gold;gainExp(exp);save();
 const h=Math.floor(sec/3600),m=Math.floor(sec/60)%60;modal('자리 비운 사이',`${h?h+'시간 ':''}${m}분 동안 백곰이 사냥했어요.<br><b style="color:#d48a10">+${fmt(gold)} 골드</b>`,[['받기',null,1]]);}
