<script>
/* ================= 펫 합성 (같은 등급 3마리 → 다음 등급 1마리) ================= */
if(!S.penh)S.penh={};
const pSpare=id=>Math.max(0,(S.pets[id]||0)-(S.peq.includes(id)?1:0));
const pGrade=g=>Object.keys(PETS).filter(k=>PETS[k].g===g);
const pAvail=g=>pGrade(g).reduce((a,k)=>a+pSpare(k),0);
const PMAXG=Math.max(...Object.values(PETS).map(p=>p.g));
function pMergeOnce(g){if(g>=PMAXG||pAvail(g)<3)return null;let need=3;for(const k of pGrade(g).filter(k=>pSpare(k)>0).sort((a,b)=>pSpare(b)-pSpare(a))){while(need>0&&pSpare(k)>0){S.pets[k]--;need--}if(!need)break}
  for(const k in S.pets)if(S.pets[k]<=0&&!S.peq.includes(k))delete S.pets[k];const id=pick(pGrade(g+1));S.pets[id]=(S.pets[id]||0)+1;S.cnt.pmerge=(S.cnt.pmerge||0)+1;return id}
function pMergeAll(){const got=[];for(let g=0;g<PMAXG;g++){let id;while((id=pMergeOnce(g)))got.push(id)}return got}
function pMergeResult(before){const net=[];for(const k in S.pets){const d=(S.pets[k]||0)-(before[k]||0);for(let i=0;i<d;i++)net.push(k)}if(!net.length)return;
  const best=net.reduce((a,b)=>PETS[b].g>PETS[a].g?b:a,net[0]);sfx('drop',PETS[best].g);banner(net.length>1?`펫 합성 ${net.length}회!`:`${GRADES[PETS[best].g]} ${PETS[best].n}!`,GCOL[PETS[best].g]);
  const cnt={};net.forEach(i=>cnt[i]=(cnt[i]||0)+1);modalHTML('펫 합성 결과',`<div class="mres">${Object.keys(cnt).sort((a,b)=>PETS[b].g-PETS[a].g).map(i=>`<div class="mr"><canvas data-pid="${i}"></canvas>${badge(PETS[i].g)}<b>${PETS[i].n}</b>${cnt[i]>1?`<i>x${cnt[i]}</i>`:''}</div>`).join('')}</div>`);
  document.querySelectorAll('#mP canvas[data-pid]').forEach(c=>petIcon(c,c.dataset.pid));save()}
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='pet')return;const Lst=$('#list');const eq=Lst&&Lst.querySelector('.eqline');if(!eq)return;
  const box=document.createElement('div');box.className='mergebox';box.innerHTML=`<div class="mhead"><b>펫 합성</b><span>같은 등급 3마리 → 다음 등급 1마리</span></div>`;
  const row=document.createElement('div');row.className='mgrades';row.style.gridTemplateColumns=`repeat(${PMAXG},1fr)`;
  for(let g=0;g<PMAXG;g++){const n=pAvail(g);const b=document.createElement('button');b.className='mg'+(n>=3?' can':'');b.disabled=n<3;b.innerHTML=`${badge(g)}<span class="arr">→</span>${badge(g+1)}<small>${n}/3</small>`;
    b.onclick=()=>{const bf={...S.pets};if(pMergeOnce(g)){pMergeResult(bf);petsChanged();renderPanel()}};row.appendChild(b)}
  box.appendChild(row);const all=document.createElement('button');all.className='buy mall';all.textContent='모두 합성';all.disabled=![...Array(PMAXG).keys()].some(g=>pAvail(g)>=3);
  all.onclick=()=>{const bf={...S.pets};if(pMergeAll().length){pMergeResult(bf);petsChanged();renderPanel()}};box.querySelector('.mhead').appendChild(all);eq.after(box);
  Lst.querySelectorAll('.row').forEach(r=>{const b=r.querySelector('.inf b');if(!b)return;const id=Object.keys(PETS).find(k=>b.textContent.includes(PETS[k].n));if(id&&S.pets[id]>1&&!b.querySelector('.cnt'))b.insertAdjacentHTML('beforeend',`<small class="cnt">x${S.pets[id]}</small>`)})}}

/* ================= 장비 세트 효과 ================= */
const SETS=[
 {id:'ninja',n:'그림자 닌자',parts:[['c',['seaweed']],['w',['shuriken','ninja','kunai','hstar','rstar']]],bk:'aspd',bv:25,txt:'공격 속도 +25%'},
 {id:'pirate',n:'대해적',parts:[['c',['pirate','bandana']],['w',['revolver','shotgun','watergun']]],bk:'gold',bv:40,txt:'골드 획득 +40%'},
 {id:'polar',n:'북극 탐험대',parts:[['c',['explorer','padding']],['a',['scarf']],['w',['glacier','icebook','surf']]],bk:'atk',bv:60,txt:'공격력 +60%'},
 {id:'cyber',n:'사이버 전사',parts:[['c',['mecha','astro']],['a',['sande','os','accel','chip','spine1','spine2','spine3']],['w',['katana','railgun','mg']]],bk:'critd',bv:150,txt:'치명타 피해 +150%'},
 {id:'mage',n:'대마법사',parts:[['c',['wizard']],['w',['primer','oldbook','icebook','firebook','grimoire']]],bk:'atk',bv:45,txt:'공격력 +45%'},
 {id:'knight',n:'성기사',parts:[['c',['knight']],['w',['lava','glacier','holy','sledge','fireaxe']]],bk:'hp',bv:60,txt:'체력 +60%'},
 {id:'sea',n:'바다의 수호자',parts:[['c',['swim','diver','lifeguard','shark']],['w',['surf','watergun','salmon']]],bk:'regen',bv:80,txt:'체력 회복 +80%'},
 {id:'king',n:'백곰왕',parts:[['c',['king','aurora']],['w',['holy','goldp']]],bk:'all',bv:40,txt:'모든 능력치 +40%'}];
function setOn(s){return s.parts.every(([sl,ids])=>sl==='a'?ids.includes(S.eq.a1)||ids.includes(S.eq.a2):ids.includes(S.eq[sl]))}
function setCount(s){return s.parts.filter(([sl,ids])=>sl==='a'?ids.includes(S.eq.a1)||ids.includes(S.eq.a2):ids.includes(S.eq[sl])).length}
{const _pb=PB;PB=function(k){let v=_pb(k);SETS.forEach(s=>{if(s.bk===k&&setOn(s))v+=s.bv});if(typeof titleBonus==='function')v+=titleBonus(k);return v}}
const SLOTN={w:'무기',c:'옷',a:'악세사리'};
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='gear')return;const Lst=$('#list');const eq=Lst&&Lst.querySelector('.eqline');if(!eq)return;
  const act=SETS.filter(setOn),near=SETS.filter(s=>!setOn(s)&&setCount(s)>0);const box=document.createElement('div');box.className='setbox';
  box.innerHTML=`<div class="mhead"><b>세트 효과</b><span>${act.length?act.map(s=>`<em class="son">${s.n} · ${s.txt}</em>`).join(' '):'적용 중인 세트 없음'}</span><button class="buy mall sets">세트 목록</button></div>`+
   (near.length?`<div class="snear">${near.slice(0,2).map(s=>`<span>${s.n} ${setCount(s)}/${s.parts.length} · ${s.parts.filter(([sl,ids])=>!(sl==='a'?ids.includes(S.eq.a1)||ids.includes(S.eq.a2):ids.includes(S.eq[sl]))).map(([sl,ids])=>`${SLOTN[sl]} ${ITEMS[ids[0]].n}${ids.length>1?' 등':''}`).join(', ')} 필요</span>`).join('')}</div>`:'');
  box.querySelector('.sets').onclick=()=>{modalHTML('세트 효과 목록',`<div class="setlist">${SETS.map(s=>`<div class="${setOn(s)?'on':''}"><b>${s.n}</b><i>${s.txt}</i><small>${s.parts.map(([sl,ids])=>`${SLOTN[sl]}: ${ids.map(i=>ITEMS[i].n).join('/')}`).join('<br>')}</small></div>`).join('')}</div>`)};
  eq.after(box)}}

/* ================= 칭호 ================= */
const TITLES=[
 {id:'rookie',n:'초보 사냥꾼',c:'#a8d8a0',need:()=>(S.cnt.kill||0)>=100,how:'몹 100마리 처치',bk:'atk',bv:2},
 {id:'hunter',n:'숙련 사냥꾼',c:'#7bdc4f',need:()=>(S.cnt.kill||0)>=3000,how:'몹 3,000마리 처치',bk:'atk',bv:5},
 {id:'slayer',n:'학살자',c:'#ff5a5a',need:()=>(S.cnt.kill||0)>=20000,how:'몹 20,000마리 처치',bk:'atk',bv:10},
 {id:'beach',n:'해변의 수호자',c:'#5ac8ff',need:()=>S.best>=10,how:'1챕터 클리어',bk:'hp',bv:3},
 {id:'traveler',n:'대륙 여행자',c:'#ffd23a',need:()=>S.best>=50,how:'5챕터 클리어',bk:'gold',bv:10},
 {id:'demon',n:'마계 원정대',c:'#c88aff',need:()=>S.best>=100,how:'10챕터 클리어',bk:'all',bv:5},
 {id:'lordslayer',n:'마왕 사냥꾼',c:'#ff2a5a',need:()=>S.best>=200,how:'20챕터 클리어',bk:'all',bv:15},
 {id:'smith',n:'연금술사',c:'#ffb02a',need:()=>(S.cnt.merge||0)>=30,how:'장비 합성 30회',bk:'critd',bv:20},
 {id:'collector',n:'수집가',c:'#62d6ff',need:()=>Object.keys(S.dexC||{}).length>=40,how:'도감 40칸 등록',bk:'gold',bv:15},
 {id:'tamer',n:'펫 조련사',c:'#ff8ad8',need:()=>Object.keys(S.pets).length>=10,how:'펫 10종 보유',bk:'hp',bv:8},
 {id:'loyal',n:'개근상',c:'#ffe066',need:()=>(S.att&&S.att.total||0)>=7,how:'출석 7일',bk:'gold',bv:8},
 {id:'daily',n:'성실한 곰',c:'#9aff3a',need:()=>(S.cnt.dqall||0)>=5,how:'일일 퀘스트 5일 완료',bk:'atk',bv:6}];
if(!S.titles)S.titles={};
function titleBonus(k){const t=TITLES.find(t=>t.id===S.title);return t&&t.bk===k?t.bv:0}
const BKN={atk:'공격력',hp:'체력',gold:'골드',all:'모든 능력치',critd:'치명타 피해'};
function checkTitles(){TITLES.forEach(t=>{if(!S.titles[t.id]&&t.need()){S.titles[t.id]=1;toast(`<b style="color:${t.c}">칭호 획득</b> · ${t.n}`);sfx('level');save()}})}
setInterval(checkTitles,3000);
{let last='';const _h=hud;hud=function(){_h();const t=TITLES.find(t=>t.id===S.title);const v=(t?t.id:'')+'|'+H$.lv.textContent;if(v!==last||!H$.lv.querySelector('.ptitle')===!!t){last=v;const old=H$.lv.querySelector('.ptitle');if(old)old.remove();if(t)H$.lv.insertAdjacentHTML('beforeend',`<span class="ptitle" style="color:${t.c}">「${t.n}」</span>`)}}}

/* ================= 출석 7일 ================= */
const ATT=[{t:'보석',v:100,ic:'gem'},{t:'강화석',v:20,ic:'stone'},{t:'보석',v:150,ic:'gem'},{t:'골드',v:'gold',ic:'coin'},{t:'강화석',v:40,ic:'stone'},{t:'보석',v:200,ic:'gem'},{t:'S급 장비',v:'item',ic:'gear'}];
if(!S.att)S.att={n:0,last:'',total:0};
const attCan=()=>S.att.last!==today();
function attClaim(){if(!attCan())return;const i=S.att.n%7,r=ATT[i];let msg='';
  if(r.ic==='gem'){S.gem+=r.v;msg=`보석 +${r.v}`}if(r.ic==='stone'){S.stone+=r.v;msg=`강화석 +${r.v}`}
  if(r.v==='gold'){const g=mobGold(effG())*400;S.gold+=g;msg=`골드 +${fmt(g)}`}
  if(r.v==='item'){const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].g===3);const id=pick(pool);S.inv[id]=(S.inv[id]||0)+1;S.everI[id]=1;msg=`S급 ${ITEMS[id].n}`}
  S.att.n++;S.att.total=(S.att.total||0)+1;S.att.last=today();sfx('clear');banner(`${i+1}일차 출석!`,'#ffd23a');logAdd(`<span style="color:#ffd23a">${msg}</span> · 출석`);save();if(typeof popRender==='function')popRender();renderPanel()}
function attRender(L){const box=document.createElement('div');box.className='attgrid';const cur=S.att.n%7,can=attCan();
  ATT.forEach((r,i)=>{const got=i<cur||(i===cur&&!can&&false),d=document.createElement('button');const isNow=i===cur&&can;d.className='attd'+(i<cur?' got':'')+(isNow?' now':'')+(i===6?' big':'');
    d.innerHTML=`<small>${i+1}일차</small><canvas></canvas><b>${r.v==='gold'?'골드 대량':r.v==='item'?'S급 장비':r.t+' '+r.v}</b>${i<cur?'<i>✓</i>':''}`;uiInto(d.querySelector('canvas'),r.ic);if(isNow)d.onclick=attClaim;box.appendChild(d)});
  L.appendChild(box);L.insertAdjacentHTML('beforeend',`<p class="attnote">${can?'오늘 보상을 눌러 받아요!':'오늘은 이미 받았어요. 내일 또 와요!'} · 누적 출석 ${S.att.total||0}일</p>`)}

/* ================= 일일 퀘스트 ================= */
const DQ=[{t:'몹 300마리 처치',k:'kill',n:300},{t:'능력치 30회 강화',k:'up',n:30},{t:'장비 소환 3회',k:'summon',n:3},{t:'정예·중간 보스 3마리 처치',k:'elite',n:3},{t:'던전 1회 클리어',k:'dunc',n:1}];
function dqState(){if(!S.dq||S.dq.day!==today()){S.dq={day:today(),base:Object.fromEntries(DQ.map(q=>[q.k,QV[q.k]()])),got:[],all:0}}return S.dq}
const dqProg=q=>Math.min(q.n,Math.max(0,QV[q.k]()-dqState().base[q.k]));
const dqAny=()=>{const s=dqState();return DQ.some((q,i)=>!s.got.includes(i)&&dqProg(q)>=q.n)||(!s.all&&s.got.length===DQ.length)};
function dqRender(L){const s=dqState();
  DQ.forEach((q,i)=>{const p=dqProg(q),done=p>=q.n,got=s.got.includes(i);const r=rowBase(c=>uiInto(c,'gem'),q.t,`<span class="dqbar"><i style="width:${p/q.n*100}%"></i></span> ${p}/${q.n} · 보석 30`);
    const b=document.createElement('button');b.className='buy'+(got?' on':'');b.textContent=got?'완료':'받기';b.disabled=!done||got;b.onclick=()=>{s.got.push(i);S.gem+=30;sfx('clear');logAdd('<span style="color:#62d6ff">+30 보석</span> · 일일 퀘스트');save();popRender();renderPanel()};r.appendChild(b);L.appendChild(r)});
  const allDone=s.got.length===DQ.length;const r=rowBase(c=>uiInto(c,'gear'),'일일 퀘스트 모두 완료',`보석 100 + 강화석 15 · ${s.got.length}/${DQ.length}`);const b=document.createElement('button');b.className='buy'+(s.all?' on':'');b.textContent=s.all?'완료':'받기';b.disabled=!allDone||s.all;
  b.onclick=()=>{s.all=1;S.gem+=100;S.stone+=15;S.cnt.dqall=(S.cnt.dqall||0)+1;sfx('clear');banner('일일 퀘스트 완료!','#62d6ff');save();popRender();renderPanel()};r.appendChild(b);L.appendChild(r);
  L.insertAdjacentHTML('beforeend','<p class="attnote">매일 자정에 새로 바뀌어요</p>')}

/* ================= 칭호 팝업 ================= */
function titleRender(L){checkTitles();const cur=TITLES.find(t=>t.id===S.title);L.insertAdjacentHTML('beforeend',`<div class="dexsum"><b>장착 칭호</b><span>${cur?`<span style="color:${cur.c}">${cur.n}</span> · ${BKN[cur.bk]} +${cur.bv}%`:'없음'}</span></div>`);
  TITLES.forEach(t=>{const has=!!S.titles[t.id],on=S.title===t.id;const r=document.createElement('div');r.className='row ttl'+(has?'':' lock');r.innerHTML=`<div class="tbadge" style="--tc:${t.c}">${has?t.n:'???'}</div><div class="inf"><b>${has?t.n:'잠김'}</b><span>${t.how} · 장착 시 ${BKN[t.bk]} +${t.bv}%</span></div>`;
    const b=document.createElement('button');b.className='buy'+(on?' on':'');b.textContent=on?'해제':'장착';b.disabled=!has;b.onclick=()=>{S.title=on?null:t.id;sfx('buy');save();popRender();hud()};r.appendChild(b);L.appendChild(r)})}

/* ================= 모험 탭: 카드 6개 + 팝업 ================= */
const POPS={dun:{t:'던전',r:L=>dunList(L)},dex:{t:'도감',r:L=>renderDex(L)},att:{t:'7일 출석',r:attRender},daily:{t:'일일 퀘스트',r:dqRender},title:{t:'칭호',r:titleRender}};
popRender=function(){const pop=$('#dexPop');if(!pop||pop.hidden)return;const body=pop.querySelector('.dpbody'),st=body.scrollTop;body.innerHTML='';pop.querySelector('.dphead b').textContent=(POPS[popK]||POPS.dex).t;(POPS[popK]||POPS.dex).r(body);body.scrollTop=st};
dexPopRender=popRender;
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='dungeon')return;const Lst=$('#list');Lst.innerHTML='';const g=document.createElement('div');g.className='advbig six';
  const dq=dqState();
  [['dun','던전',`입장권 ${Object.keys(DUNS).reduce((a,k)=>a+dunState(k).tix,0)}장`,'dungeon',Object.keys(DUNS).some(k=>dunState(k).tix>0)],
   ['daily','일일퀘',`${dq.got.length}/${DQ.length} 완료`,'gem',dqAny()],
   ['att','7일 출석',`${(S.att.n%7)+(attCan()?1:0)}일차`,'coin',attCan()],
   ['dex','도감',`${dexMobDone()+dexItemDone()+dexPetDone()}칸`,'book',dexAnyClaim()],
   ['title','칭호',`${Object.keys(S.titles).length}/${TITLES.length}`,'stone',false]].forEach(([k,n,sub,ic,dot])=>{
    const b=document.createElement('button');b.className='advb';b.innerHTML=`<canvas></canvas><b>${n}</b><small>${sub}</small>${dot?'<i class="ndot"></i>':''}`;uiInto(b.querySelector('canvas'),ic);b.onclick=()=>{sfx('ui');openPop(k)};g.appendChild(b)});
  Lst.appendChild(g);if(dexOpen)popRender()}}
/* 모험 탭에 빨간 점 */
{const _nd=navDots;navDots=function(){_nd();const d=document.querySelector('#nav button[data-t="dungeon"] .dot');if(d&&(attCan()||dqAny()))d.classList.add('on')}}
{const nb=document.querySelector('#nav button[data-t="dungeon"] span');if(nb)nb.textContent='모험'}
</script>
