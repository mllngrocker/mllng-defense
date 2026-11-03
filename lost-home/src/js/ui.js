/* ---------- HUD, panels, lobby, modals ---------- */
const ICON={
 gold:'<svg viewBox="0 0 24 24"><defs><radialGradient id="gc" cx=".35" cy=".3"><stop offset="0" stop-color="#fff6c0"/><stop offset=".5" stop-color="#ffcf3d"/><stop offset="1" stop-color="#d48a10"/></radialGradient></defs><circle cx="12" cy="12" r="10" fill="url(#gc)" stroke="#8a5a00" stroke-width="1.5"/><circle cx="12" cy="12" r="6.5" fill="none" stroke="#b47a10" stroke-width="1.2"/></svg>',
 gem:'<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#7fe3ff" stroke="#1a6a9a" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 9h20M8 3l4 18M16 3l-4 18" stroke="#c8f4ff" stroke-width="1" opacity=".8"/></svg>',
 stone:'<svg viewBox="0 0 24 24"><path d="M4 15l3-8 7-3 6 6-2 9-9 1z" fill="#ff8a3a" stroke="#7a3008" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 7l5 5 8-2M12 12l-3 8" stroke="#ffd0a0" stroke-width="1" opacity=".8" fill="none"/></svg>',
 atk:'<svg viewBox="0 0 32 32"><path d="M24 3l5 0 0 5-13 13-5-5z" fill="#e8eef8" stroke="#3a4a6a" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 17l7 7M5 27l6-6" stroke="#8a5a30" stroke-width="3.4" stroke-linecap="round"/><path d="M6 15l11 11" stroke="#ffcf3d" stroke-width="3" stroke-linecap="round"/></svg>',
 hp:'<svg viewBox="0 0 32 32"><path d="M16 28S3 20 3 11.5A6.5 6.5 0 0 1 16 8a6.5 6.5 0 0 1 13 3.5C29 20 16 28 16 28z" fill="#ff5b6e" stroke="#9c1d33" stroke-width="1.6"/><ellipse cx="10" cy="11" rx="3" ry="2" fill="#fff" opacity=".6"/></svg>',
 regen:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#8ae86a" stroke="#2a7a2a" stroke-width="1.6"/><path d="M16 9v14M9 16h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>',
 crit:'<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#fff" stroke="#c8303a" stroke-width="2"/><circle cx="16" cy="16" r="7.5" fill="none" stroke="#ff5b6e" stroke-width="2.4"/><circle cx="16" cy="16" r="3" fill="#c8303a"/></svg>',
 critd:'<svg viewBox="0 0 32 32"><path d="M16 2l3.5 8.5L28 8l-4.5 8L30 21l-9 .5L16 30l-3-8.5L4 24l4.5-8L2 11l9 .5z" fill="#ffcf3d" stroke="#c86a10" stroke-width="1.5" stroke-linejoin="round"/><circle cx="16" cy="16" r="4.5" fill="#fff6c0"/></svg>',
 cp:'<svg viewBox="0 0 24 24"><path d="M4 3l9 9-2 2-9-9V3zM20 3h0v2l-9 9-2-2 9-9z" fill="#e8eef8" stroke="#3a4a6a" stroke-width="1.2" stroke-linejoin="round"/><path d="M6 15l3 3M15 18l3-3M4 20l4-4M20 20l-4-4" stroke="#ffcf3d" stroke-width="2.4" stroke-linecap="round"/></svg>',
 aspd:'<svg viewBox="0 0 32 32"><path d="M19 2L6 18h9l-3 12 14-17h-9z" fill="#7fe3ff" stroke="#1a6a9a" stroke-width="1.6" stroke-linejoin="round"/></svg>',
};
document.querySelectorAll('[data-ic]').forEach(e=>e.innerHTML=ICON[e.dataset.ic]);
let GOLDX=60,GOLDY=20;
function measureHud(){const s=$('#stage').getBoundingClientRect(),g=$('#goldtxt').getBoundingClientRect();if(s.width)[GOLDX,GOLDY]=[g.left-s.left-10,g.top-s.top+g.height/2];}
function pulseGold(){const e=$('#goldtxt').parentElement;e.animate([{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:160});}
let banT;function banner(txt,col){const b=$('#banner');b.textContent=txt;b.style.color=col||'#fff';b.classList.remove('show');void b.offsetWidth;b.classList.add('show');clearTimeout(banT);banT=setTimeout(()=>b.classList.remove('show'),1900);}
let toastT;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2400);}
function updateHud(){
 {const t=TITLES.find(x=>x.id===S.title);$('#lvtxt').innerHTML=`Lv.${S.lv} ${S.name||''}${t?` <small style="font:10px var(--f-body);opacity:.8">${t.n}</small>`:''}`;}$('#expbar b').style.width=(S.exp/needExp(S.lv)*100).toFixed(1)+'%';
 $('#goldtxt').textContent=fmt(S.gold);$('#stonetxt').textContent=fmt(S.stone||0);{const cp=CP(),up=$('#cpup');$('#cptxt').textContent=fmt(cp);if(window._cp&&cp>_cp*1.0005){up.textContent='+'+fmt(cp-_cp);up.classList.remove('go');void up.offsetWidth;up.classList.add('go');}window._cp=cp;}$('#gemtxt').textContent=fmt(S.gem);
 const bossStage=S.g%10===9;$('#stname').textContent=`${stageName(S.g)} ${theme().name}`;
 $('#killbar').hidden=!!boss;$('#bosstimer').hidden=!boss;
 $('#killbar b').style.width=(S.farm?100:S.kills/KILLS*100)+'%';if(boss)$('#bosstimer b').style.width=(bossT/30*100)+'%';
 $('#stsub').textContent=boss?'보스를 쓰러뜨리세요!':S.farm?'사냥 중 · 강해지면 다시 도전':bossStage?`보스까지 ${KILLS-S.kills}마리`:`${S.kills} / ${KILLS}`;
 $('#bossbtn').hidden=!(S.farm&&bossStage&&!boss);
 updateSkillbar();refreshPanel();}
$('#dunbtn').onclick=()=>dungeonMenu();
$('#qbtn').onclick=()=>questMenu();
$('#bossbtn').onclick=()=>{S.farm=false;S.kills=KILLS;for(const m of mobs)m.dead=true,m.dt=.01;updateHud();};
/* upgrade panel */
let tab='up';
function costN(u,n){let c=0,l=S.up[u.k];for(let i=0;i<n&&l<u.max;i++,l++)c+=u.cost(l);return c;}
function buyCount(u){if(S.mult)return Math.min(S.mult,u.max-S.up[u.k]);let n=0,c=0,l=S.up[u.k];while(l<u.max&&n<500){const nc=u.cost(l);if(c+nc>S.gold)break;c+=nc;l++;n++;}return Math.max(1,n);}
function renderPanel(){const L=$('#plist');$('#ptools').style.display=tab==='up'?'':'none';
 if(tab==='up'){L.innerHTML=UPS.map(u=>`<div class="row" data-k="${u.k}"><div class="ric">${ICON[u.k]}</div><div class="rinfo"><div class="rname">${u.n}<small>Lv.<span class="lv"></span></small></div><div class="rval"></div></div><button class="buy"><span class="bt"></span><small class="bc"></small></button></div>`).join('');
  L.querySelectorAll('.row').forEach(r=>holdBuy(r.querySelector('.buy'),UPS.find(u=>u.k===r.dataset.k)));}
 else if(tab==='info')metaPanel(L);
 else if(tab!=='info')PANEL[tab](L);
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
function buy(u){const n=buyCount(u),c=costN(u,n);if(S.up[u.k]>=u.max||S.gold<c)return false;S.gold-=c;const hpK=bear.hp/MAXHP();S.up[u.k]+=n;track('up',n);if(u.k==='hp')bear.hp=hpK*MAXHP();sfx('buy');updateHud();return true;}
function holdBuy(btn,u){let tm=null,rep=0;const go=()=>{if(!buy(u)){stop();return;}rep++;tm=setTimeout(go,Math.max(45,220-rep*25));};const stop=()=>{clearTimeout(tm);tm=null;rep=0;save();};
 btn.addEventListener('pointerdown',e=>{e.preventDefault();if(!buy(u))return;tm=setTimeout(go,380);});['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>tm&&stop()));}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{tab=t.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===t));renderPanel();});
document.querySelectorAll('#mult button').forEach(b=>{b.classList.toggle('on',+b.dataset.m===S.mult);b.onclick=()=>{S.mult=+b.dataset.m;document.querySelectorAll('#mult button').forEach(x=>x.classList.toggle('on',x===b));refreshPanel();save();};});
/* modal */
function modal(title,text,btns,wide,noX){$('#mbox').classList.toggle('wide',!!wide);$('#mx').hidden=!!noX;$('#mx').onclick=()=>$('#modal').hidden=true;$('#mtitle').textContent=title;$('#mtext').innerHTML=text;const B=$('#mbtns');B.innerHTML='';
 for(const[label,fn,ok]of btns){const b=document.createElement('button');if(Array.isArray(label)){b.textContent=label[0];const s=document.createElement('small');s.textContent=label[1];b.appendChild(s);}else b.textContent=label;if(ok)b.className='ok';b.onclick=()=>{$('#modal').hidden=true;fn&&fn();};B.appendChild(b);}$('#modal').hidden=false;}
$('#setbtn').onclick=()=>settingsMenu();
/* lobby */
const bgLobby=new BG($('#lbg')),lfg=$('#lfg'),lc=lfg.getContext('2d');let screen='lobby';
bgLobby.theme(LOBBY_THEME);bgLobby.ground=.16;bgLobby.horizon=.36;
function lobbyText(){$('#lsub').textContent=S.started?`이어하기 · ${stageName(S.g)} ${theme().name}`:'처음 시작하는 모험';$('#startbtn').textContent=S.started?'이어하기':'모험 시작';}
function drawLobby(t){const r=$('#lobby').getBoundingClientRect();if(!r.width)return;const w=r.width,h=r.height,q=Math.min(DPR,1.5);
 if(lfg.width!==Math.round(w*DPR)||lfg.height!==Math.round(h*DPR)){lfg.width=w*DPR;lfg.height=h*DPR;bgLobby.resize(Math.round(w*q),Math.round(h*q));}
 bgLobby.draw(t,t*.01);lc.setTransform(DPR,0,0,DPR,0,0);lc.clearRect(0,0,w,h);
 const s=Math.min(w/380,h/700)*1.25,gy=Math.min(h*(1-bgLobby.ground)-h*.02,$('#lsub').getBoundingClientRect().top-r.top-30*s),bx=w*.5,bob=Math.sin(t*1.2)*3;
 lc.save();lc.translate(bx,gy+bob);lc.beginPath();lc.ellipse(0,6*s,90*s,16*s,0,0,TAU);const ig=lc.createLinearGradient(0,-10*s,0,22*s);ig.addColorStop(0,'#ffffff');ig.addColorStop(1,'#9cc8ea');lc.fillStyle=ig;lc.fill();
 lc.strokeStyle='rgba(255,255,255,.6)';lc.lineWidth=2;lc.stroke();lc.scale(s,s);HERO().draw(lc,{t,ph:0,walk:0,atk:-1,kind:curWeapon().k});lc.restore();
 lc.strokeStyle='rgba(255,255,255,.35)';lc.lineWidth=1.5;for(let i=0;i<3;i++){const k=(t*.4+i/3)%1;lc.globalAlpha=1-k;lc.beginPath();lc.ellipse(bx,gy+bob+8*s,(90+k*60)*s,(16+k*10)*s,0,0,TAU);lc.stroke();}lc.globalAlpha=1;}
function beginGame(){renderSkillbar();screen='game';if(!S.started){S.started=true;banner(theme().name,'#9fdcff');toast(`${S.name}(이)가 잃어버린 고향을 찾아 떠나요!`);save();}resizeStage();measureHud();updateHud();}
$('#startbtn').onclick=()=>{audioInit();$('#lobby').hidden=true;if(S.started){beginGame();return;}screen='pro';startPrologue(()=>askName(beginGame));};
function offlineReward(){if(!S.started||!S.t)return;const sec=Math.min(8*3600,(Date.now()-S.t)/1000);if(sec<60)return;
 const gold=Math.floor(mobGold(S.g)*.5*sec*.6),exp=mobExp(S.g)*.5*sec*.3;S.gold+=gold;gainExp(exp);save();
 const h=Math.floor(sec/3600),m=Math.floor(sec/60)%60;modal('자리 비운 사이',`${h?h+'시간 ':''}${m}분 동안 ${S.name||'백곰'}(이)가 사냥하다 잠들었어요.<br><b style="color:#d48a10">+${fmt(gold)} 골드</b>`,[['받기',null,1]]);$('#mtext').prepend(sleepCanvas());}

/* ---------- gear / skills / pets / gacha panels ---------- */
const SKICON={glacier:'<svg viewBox="0 0 32 32"><path d="M16 2v28M4 9l24 14M4 23L28 9" stroke="#bff4ff" stroke-width="3" stroke-linecap="round"/><circle cx="16" cy="16" r="4" fill="#fff"/></svg>',
 tornado:'<svg viewBox="0 0 32 32" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M4 6h24M7 12h18M10 18h12M13 24h6M15 29h2"/></svg>',
 beam:'<svg viewBox="0 0 32 32"><defs><linearGradient id="bm" x1="0" x2="1"><stop offset="0" stop-color="#7affd8"/><stop offset="1" stop-color="#a88aff"/></linearGradient></defs><path d="M3 12h26v8H3z" fill="url(#bm)"/><path d="M3 15h26v2H3z" fill="#fff"/><circle cx="5" cy="16" r="5" fill="#fff"/></svg>'};
const gbox=(img,g,extra='',attr='',st='')=>`<div class="ibox" ${attr} style="--gc:${GCOL[g]};${st}"><img src="${img}" alt=""><span class="gb">${GRADES[g]}</span>${extra}</div>`;
function renderSkillbar(){$('#skillbar').innerHTML=Object.keys(SKILLS).map(k=>`<button class="sk" data-k="${k}" aria-label="${SKILLS[k].n}">${SKICON[k]}<i></i><b></b></button>`).join('');
 document.querySelectorAll('.sk').forEach(b=>b.onclick=()=>{if(!castSkill(b.dataset.k)&&!skOpen(b.dataset.k))toast(`${stageName(SKILLS[b.dataset.k].unlock)} 도달 시 열려요`);});
 $('#sauto').onclick=()=>{S.sauto=!S.sauto;save();updateSkillbar();};$('#sspd').onclick=()=>{S.spd=S.spd===2?1:2;save();updateSkillbar();};updateSkillbar();}
function updateSkillbar(){for(const b of document.querySelectorAll('.sk')){const k=b.dataset.k,open=skOpen(k);b.classList.toggle('lock',!open);
  b.querySelector('i').style.setProperty('--p',(open?skCd[k]/SKILLS[k].cd*100:100)+'%');b.querySelector('b').textContent=open&&skCd[k]>0?Math.ceil(skCd[k]):'';}
 const a=$('#sauto');if(a)a.classList.toggle('on',!!S.sauto);const sp=$('#sspd');if(sp){sp.textContent='x'+(S.spd||1);sp.classList.toggle('on',S.spd===2);}}
function eqCard(k,s){if(!k)return`<div class="info" style="padding:10px 14px">빈 칸 · 뽑기에서 얻을 수 있어요</div>`;const[id,g]=gsplit(k),it=ITEMS[id],m=slotMul(k);
 const eff=s==='w'?`${KIND[it.k].n} · 공격력 x${m<100?m.toFixed(1):fmt(m)}`:s==='a'?`체력 +${fmt(m*50)}%`:`체력 +${fmt(m*25)}% · 외형 변경`;
 return`<div class="eqcard" data-item="${k}">${gbox(itemIcon(id),g)}<div class="rinfo"><div class="rname">${it.n}<small>+${S.inv[k].lv}</small></div><div class="rval">${eff}</div>${it.ult?`<div class="rval" style="color:#9a3ad8">필살기 · ${ULTS[it.ult].n}</div>`:''}</div><button class="btn2" data-item="${k}">관리</button></div>`;}
function eqSection(s,title){const sl=SLOTS[s],eq=sl.map(x=>S.eq[x]),own=Object.keys(S.inv).filter(x=>ITEMS[gsplit(x)[0]].s===s).sort((x,y)=>gsplit(y)[1]-gsplit(x)[1]||ITEMS[gsplit(x)[0]].n.localeCompare(ITEMS[gsplit(y)[0]].n));
 return `<div class="sec">${title}</div>${eq.map(k=>eqCard(k,s)).join('')}<div class="igrid">${own.map(x=>{const[id,g]=gsplit(x);return gbox(itemIcon(id),g,`<span class="cnt">x${S.inv[x].n}</span>${canMerge(x)?'<span class="new" style="background:#2fb84a">합성</span>':''}`,`data-item="${x}"`).replace('class="ibox"',eq.includes(x)?'class="ibox on"':'class="ibox"');}).join('')}</div>`;}
function itemPopup(k){const[id,g]=gsplit(k),it=ITEMS[id],o=S.inv[k];if(!o)return;const c=enhCost(g,o.lv),eq=SLOTS[it.s].some(x=>S.eq[x]===k);
 const info=`<div style="display:flex;gap:12px;align-items:center;text-align:left">${gbox(itemIcon(id),g)}<div><b style="color:${shade(GCOL[g],-.35)}">${GRADES[g]}등급</b> · 보유 ${o.n}개 · +${o.lv}<br>${it.s==='w'?KIND[it.k].n+' 무기':it.s==='a'?'장신구 (체력)':'코스튬 (체력 · 외형)'}${it.ult?`<br><span style="color:#9a3ad8">필살기 · ${ULTS[it.ult].n}</span>`:''}</div></div>
  <p style="margin-top:10px;font-size:12px">같은 장비 ${MERGE_N}개를 합성하면 <b>${it.n} ${GRADES[Math.min(6,g+1)]}등급</b> 1개가 돼요.</p><p style="margin-top:8px;font-size:12px;line-height:1.5"><b>강화</b>: 한 번에 장비 효과 +15% (지금 +${o.lv}). 골드 ${fmt(c)} 또는 <b>강화석</b> 1개가 들어요.<br><small>강화석은 던전에서 얻는 재료예요 · 보유 ${fmt(S.stone||0)}개</small></p>`;
 const btns=[];if(!eq)btns.push(['장착',()=>{const hp=bear.hp/MAXHP();equipItem(k);bear.hp=hp*MAXHP();save();renderPanel();},1]);
 else if(it.s!=='w')btns.push(['해제',()=>{for(const x of SLOTS[it.s])if(S.eq[x]===k)S.eq[x]=null;bear.hp=Math.min(bear.hp,MAXHP());save();renderPanel();}]);
 btns.push([['골드로 강화',`${fmt(c)} 골드`],()=>{if(S.gold<c){toast('골드가 부족해요');return;}S.gold-=c;o.lv++;track('enh');sfx('level');save();updateHud();renderPanel();itemPopup(k);}]);
 if(S.stone>0)btns.push([['강화석으로 강화',`1개 사용 · 보유 ${S.stone}`],()=>{S.stone--;o.lv++;track('enh');sfx('level');save();renderPanel();itemPopup(k);}]);
 if(canMerge(k))btns.push(['합성',()=>{const nk=merge(k);track('merge');sfx('clear');banner(`${GRADES[g+1]}등급 ${it.n}!`,GCOL[g+1]);save();updateHud();renderPanel();itemPopup(nk);},1]);
 modal(it.n,info,btns);}
const PANEL={
 gear(L){const mc=Object.keys(S.inv).filter(canMerge).length;L.innerHTML=(mc?`<button class="btn2" id="mergeall" style="width:100%">모두 합성 (${mc}종)</button>`:'')+eqSection('w','무기')+eqSection('a','장신구 (2칸)')+eqSection('c','코스튬');
  L.querySelectorAll('[data-item]').forEach(e=>e.onclick=()=>itemPopup(e.dataset.item));
  const ma=$('#mergeall');if(ma)ma.onclick=()=>{const n=mergeAll();track('merge',n);sfx('clear');toast(`${n}번 합성했어요!`);updateHud();renderPanel();};},
 skill(L){L.innerHTML=Object.keys(SKILLS).map(k=>{const sk=SKILLS[k],open=skOpen(k),c=skCost(k);return `<div class="row"><div class="ric" style="background:linear-gradient(145deg,#2a3a5e,#141e36)">${SKICON[k]}</div>
  <div class="rinfo"><div class="rname">${sk.n}<small>${open?'Lv.'+skLv(k):'잠김'}</small></div><div class="rval">${open?`피해 ${fmt(skDmg(k))} · 재사용 ${sk.cd}초`:`${stageName(sk.unlock)} 도달 시 열려요`}</div><div class="rval">${sk.d}</div></div>
  ${open?`<button class="buy${S.gold<c?' no':''}" data-sk="${k}"><span>레벨업</span><small>${fmt(c)} 골드</small></button>`:''}</div>`;}).join('');
  L.querySelectorAll('[data-sk]').forEach(b=>b.onclick=()=>{const k=b.dataset.sk,c=skCost(k);if(S.gold<c){toast('골드가 부족해요');return;}S.gold-=c;S.skl[k]=skLv(k)+1;sfx('level');save();updateHud();renderPanel();});},
 pet(L){const own=Object.keys(S.pets).sort((x,y)=>gsplit(y)[1]-gsplit(x)[1]);if(!own.length){L.innerHTML='<div class="info"><h3>아직 펫이 없어요</h3>뽑기에서 펫 8종을 만날 수 있어요. 물개·펭귄·북극여우·갈매기는 S등급에 어른이 되고 SSS가 최고예요. 드물게 나오는 신수 백호·주작·기린·청룡은 H등급에서 신수로 진화해요.</div>';return;}
  const mc=own.filter(canMergePet).length;
  L.innerHTML=(mc?`<button class="btn2" id="pmergeall" style="width:100%">모두 합성 (${mc}종)</button>`:'')+own.map(k=>{const[id,g]=gsplit(k),P=PETS[id],o=S.pets[k];return `<div class="row" data-pk="${k}" style="cursor:pointer">${gbox(itemIcon(id,1,g),g,`<span class="cnt">x${o.n}</span>${canMergePet(k)?'<span class="new" style="background:#2fb84a">합성</span>':''}`)}
  <div class="rinfo"><div class="rname">${P.n}<small>${P.an[petStage(id,g)]} · +${o.lv}</small></div><div class="rval">${P.at} · 공격력의 <b>${Math.round(petMul(k)*100)}%</b></div><div class="rval">${PB_N[P.bk]} +${Math.round(petBonusOf(k)*10)/10}${P.bk==='crit'?'%p':'%'}${g>=3?' · <b style="color:#b07a00">펫 스킬</b>':''}</div></div>
  ${S.pet===k?'<span class="btn2" style="height:30px;line-height:30px;font-size:11px;background:#8a96b8;box-shadow:none">함께</span>':''}</div>`;}).join('');
  L.querySelectorAll('[data-pk]').forEach(e=>e.onclick=()=>petPopup(e.dataset.pk));
  const ma=$('#pmergeall');if(ma)ma.onclick=()=>{let n=0;for(let p=0;p<7;p++)for(const k of Object.keys(S.pets))while(canMergePet(k)){mergePet(k);n++;}sfx('clear');toast(`${n}번 합성했어요!`);renderPanel();};},
 gacha(L){const tot=GACHAW.reduce((a,b)=>a+b,0);L.innerHTML=`<div class="gacha"><h3>북극 보물 뽑기</h3><p>무기 · 장신구 · 코스튬 · 펫이 나와요. 더 좋은 장비는 자동으로 장착돼요.</p>
  <div class="row2"><button data-n="1">1회<br><small>보석 100</small></button><button data-n="10">10회<br><small>보석 450</small></button></div>
  <div class="odds">${GRADES.map((g,i)=>`<span style="color:${GCOL[i]}"><b>${g}</b> ${(GACHAW[i]/tot*100).toFixed(GACHAW[i]/tot<.01?2:1)}%</span>`).join('')}</div></div>
  <div class="info">보석은 스테이지 클리어(+3), 레벨 업(+10), 보스 처치(+30)로 모을 수 있어요.</div>`;
  L.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const r=gacha(+b.dataset.n);if(!r){toast('보석이 부족해요');return;}track('gacha',r.length);sfx('clear');updateHud();
   modal(`뽑기 결과`,`<div class="res">${r.map((x,i)=>{const g=x.g;return gbox(itemIcon(x.id,x.pet,x.g),g,x.isNew?'<span class="new">NEW</span>':'','',`animation-delay:${i*.08}s`);}).join('')}</div>`,[['확인',()=>renderPanel(),1]],1);});},
};

function petPopup(k){const[id,g]=gsplit(k),P=PETS[id],o=S.pets[k];if(!o)return;const c=enhCost(g,o.lv);
 const info=`<div style="display:flex;gap:12px;align-items:center;text-align:left">${gbox(itemIcon(id,1,g),g)}<div><b style="color:${shade(GCOL[g],-.35)}">${GRADES[g]}등급 ${P.an[petStage(id,g)]}</b><br>보유 ${o.n}마리 · +${o.lv}<br>${P.at} (${P.cd}초마다)</div></div>
  <p style="margin-top:10px;font-size:12px">${g>=P.max?`${GRADES[g]}등급이 이 펫의 최고 등급이에요.`:`같은 펫 ${MERGE_N}마리를 합성하면 <b>${P.n} ${GRADES[g+1]}등급</b>이 돼요.`}${g<3?` S등급이 되면 ${P.common?'어른으로':'젊은 모습으로'} 진화하고 5번째 공격마다 펫 스킬이 나가요.`:!P.common&&g<6?' H등급이 되면 신수로 진화해요.':''}</p><p style="margin-top:8px;font-size:12px;line-height:1.5"><b>강화</b>: 한 번에 펫 효과 +15% (지금 +${o.lv}). 골드 ${fmt(c)} 또는 <b>강화석</b> 1개가 들어요.<br><small>강화석은 던전에서 얻는 재료예요 · 보유 ${fmt(S.stone||0)}개</small></p>`;
 const btns=[];if(S.pet!==k)btns.push(['함께하기',()=>{const hp=bear.hp/MAXHP();S.pet=k;pet.x=0;bear.hp=hp*MAXHP();save();renderPanel();},1]);
 btns.push([['골드로 강화',`${fmt(c)} 골드`],()=>{if(S.gold<c){toast('골드가 부족해요');return;}S.gold-=c;o.lv++;track('enh');sfx('level');save();updateHud();renderPanel();petPopup(k);}]);
 if(S.stone>0)btns.push([['강화석으로 강화',`1개 사용 · 보유 ${S.stone}`],()=>{S.stone--;o.lv++;track('enh');sfx('level');save();renderPanel();petPopup(k);}]);
 if(canMergePet(k))btns.push(['합성',()=>{const nk=mergePet(k);track('merge');sfx('clear');banner(`${GRADES[g+1]}등급 ${P.n}!`,GCOL[g+1]);renderPanel();petPopup(nk);},1]);
 modal(`${P.n}`,info,btns);}

/* chapter / stage select: tap the stage name. Only stages already reached can be picked */
function stageMenu(){if(dun||boss){toast(boss?'보스전 중에는 이동할 수 없어요':'던전 중에는 이동할 수 없어요');return;}const base=Math.floor(S.best/200)*200;
 modal('챕터 이동',`<div class="chlist">${THEMES.map((th,i)=>{const g0=base+i*10,open=g0<=S.best,here=Math.floor(S.g/10)*10===g0;
  return`<div class="chcard${open?'':' lock'}${here?' here':''}" style="background:linear-gradient(135deg,${th.sky[0]},${th.sky[1]} 60%,${th.sky[2]})"><b>${i+1}. ${th.name}</b>
  <div class="stg">${Array.from({length:10},(_,j)=>{const g=g0+j;return`<button data-g="${g}"${g>S.best?' disabled':''} class="${j===9?'boss':''}${g===S.g?' cur':''}">${j+1}</button>`;}).join('')}</div></div>`;}).join('')}</div>`,[],1);
 document.querySelectorAll('.stg button[data-g]').forEach(b=>b.onclick=()=>{const g=+b.dataset.g;$('#modal').hidden=true;if(g===S.g)return;
  S.g=g;S.kills=0;S.farm=false;for(const m of mobs)m.dead=true,m.dt=.3;shots.length=0;pshots.length=0;applyTheme();save();updateHud();banner(`${stageName(g)} ${theme().name}`,'#9fdcff');});
 const here=document.querySelector('.chcard.here');if(here)here.scrollIntoView({block:'center'});}
$('#stagebox').onclick=stageMenu;
