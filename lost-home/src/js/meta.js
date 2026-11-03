/* ---------- sets, titles, codex, settings ----------
 BONUS(stat) sums every passive source except the pet (which stays in PB): set effects, the equipped title and the codex. */
const SETS=[
 {n:'바다의 아이',need:[['surf'],['shell'],['duck']],b:{atk:20,hp:20}},
 {n:'그림자 닌자',need:[['ninjastar','kunai'],['tooth'],['kelp']],b:{aspd:15,crit:5}},
 {n:'북극 탐험대',need:[['pipe','shovel','crowbar'],['heart'],['explorer']],b:{hp:40,regen:30}},
 {n:'대마법사',need:[['primer','oldbook','starbook','firebook','thunderbook','icebook','tome'],['aurora'],['mage']],b:{atk:35,critd:30}},
 {n:'백곰왕',need:[['holy'],['star'],['kingcrown']],b:{atk:60,hp:60,critd:50}},
];
const TITLES=[
 {id:'hunter1',n:'초보 사냥꾼',d:'몬스터 100마리 처치',ok:()=>(S.cnt.kill||0)>=100,b:{atk:2}},
 {id:'hunter2',n:'베테랑 사냥꾼',d:'몬스터 5,000마리 처치',ok:()=>(S.cnt.kill||0)>=5000,b:{atk:5}},
 {id:'bosskill',n:'보스 킬러',d:'챕터 보스 10번 처치',ok:()=>(S.cnt.boss||0)>=10,b:{critd:10}},
 {id:'cleaner',n:'오염 정화자',d:'10챕터 돌파',ok:()=>S.best>=100,b:{hp:10}},
 {id:'demon',n:'마계 원정대',d:'15챕터 도달',ok:()=>S.best>=140,b:{atk:10}},
 {id:'king',n:'마왕 토벌자',d:'마왕 녹스 처치',ok:()=>S.best>=200,b:{atk:15,hp:15}},
 {id:'gacha',n:'뽑기 장인',d:'뽑기 200번',ok:()=>(S.cnt.gacha||0)>=200,b:{gold:10}},
 {id:'merge',n:'합성의 달인',d:'합성 50번',ok:()=>(S.cnt.merge||0)>=50,b:{crit:3}},
 {id:'dun',n:'던전 정복자',d:'던전 20번 클리어',ok:()=>(S.cnt.dun||0)>=20,b:{gold:15}},
 {id:'att',n:'출석왕',d:'30일 출석',ok:()=>(S.att.n||0)>=30,b:{regen:20}},
];
const B_N={...PB_N};
if(!S.codex)S.codex={};if(!S.set)S.set={sfx:1,dmg:1,shake:1};if(S.title===undefined)S.title=null;
const eqIds=()=>['w','a1','a2','c'].map(s=>S.eq[s]&&gsplit(S.eq[s])[0]).filter(Boolean);
function activeSets(){const ids=eqIds();return SETS.filter(st=>st.need.every(alt=>alt.some(id=>ids.includes(id))));}
const ALL_MOBS=Object.keys(MOBS).filter(k=>k!=='crystgiant'&&k!=='goldgob'),ALL_ITEMS=Object.keys(ITEMS);
function codexFound(){return ALL_MOBS.filter(k=>S.codex[k]).length;}
function itemsFound(){const s=new Set(Object.keys(S.inv).map(k=>gsplit(k)[0]));return s.size;}
function BONUS(stat){let v=0;for(const st of activeSets())v+=st.b[stat]||0;const t=TITLES.find(x=>x.id===S.title);if(t&&t.ok())v+=t.b[stat]||0;
 if(stat==='atk')v+=codexFound()*.3;if(stat==='hp')v+=itemsFound()*.3;return v;}
function codexKill(id){if(!S.codex[id]){S.codex[id]=0;toast(`도감 등록: ${MOBS[id][0]}`);}S.codex[id]++;}
/* mob thumbnails for the codex (cached) */
const _mobIcon={};
function mobIcon(id){if(_mobIcon[id])return _mobIcon[id];const d=MOBS[id],cv=document.createElement('canvas');cv.width=cv.height=72;const c=cv.getContext('2d'),h=ART_H[d[1]]||90,s=Math.min(.6,58/h);
 c.translate(36,66);c.scale(s,s);try{MART[d[1]](c,{t:1,ph:0,atk:-1,a:d[4],b:d[3],sub:d[2],seed:1,id});}catch(e){}return _mobIcon[id]=cv.toDataURL();}
function metaPanel(L){const sets=activeSets(),f=codexFound(),h=Math.floor(S.stats.play/3600),mi=Math.floor(S.stats.play/60)%60;
 const bon=b=>Object.entries(b).map(([k,v])=>`${B_N[k]} +${v}${k==='crit'?'%p':'%'}`).join(', ');
 L.innerHTML=`<div class="sec">칭호 <small style="font:11px var(--f-body);color:var(--ink2)">하나를 달면 보너스</small></div><div class="titles">${TITLES.map(t=>{const ok=t.ok();return`<button class="ttl${ok?'':' lock'}${S.title===t.id?' on':''}" data-t="${t.id}"><b>${t.n}</b><small>${ok?bon(t.b):t.d}</small></button>`;}).join('')}</div>
 <div class="sec">세트 효과</div>${SETS.map(st=>{const on=sets.includes(st),ids=eqIds();return`<div class="info" style="padding:10px 12px;${on?'background:#fff7d6;box-shadow:0 0 0 2px #ffcf3d inset':''}"><b style="color:var(--ink)">${st.n}</b> ${on?'<b style="color:#c88a0e">적용 중</b>':''}<br><small>${st.need.map(alt=>{const has=alt.some(x=>ids.includes(x));return`<span style="color:${has?'#2a8a3a':'#8a96b8'}">${alt.slice(0,3).map(x=>ITEMS[x].n).join('/')}${alt.length>3?' 등':''}</span>`;}).join(' + ')}<br>→ ${bon(st.b)}</small></div>`;}).join('')}
 <div class="sec">몬스터 도감 <small style="font:11px var(--f-body);color:var(--ink2)">${f}/${ALL_MOBS.length} 발견 · 공격력 +${(f*.3).toFixed(1)}% · 장비 ${itemsFound()}/${ALL_ITEMS.length}종 · 체력 +${(itemsFound()*.3).toFixed(1)}%</small></div>
 <div class="codex">${ALL_MOBS.map(id=>S.codex[id]?`<div title="${MOBS[id][0]}"><img src="${mobIcon(id)}" alt=""><small>${MOBS[id][0]}</small></div>`:'<div class="unk"><b>?</b><small>???</small></div>').join('')}</div>
 <div class="info"><h3>${S.name||'백곰'}의 기록</h3><div class="grid2"><span>최고 스테이지 <b>${stageName(S.best)}</b></span><span>레벨 <b>${S.lv}</b></span><span>처치한 몬스터 <b>${fmt(S.stats.kills)}</b></span><span>쓰러뜨린 보스 <b>${fmt(S.stats.bosses)}</b></span><span>모은 골드 <b>${fmt(S.stats.gold)}</b></span><span>플레이 시간 <b>${h}시간 ${mi}분</b></span><span>전투력 <b>${fmt(CP())}</b></span><span>공격력 <b>${fmt(ATK())}</b></span><span>체력 <b>${fmt(MAXHP())}</b></span></div></div>`;
 L.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=TITLES.find(x=>x.id===b.dataset.t);if(!t.ok()){toast(t.d+' 하면 얻어요');return;}S.title=S.title===t.id?null:t.id;save();updateHud();renderPanel();});}
function settingsMenu(){const row=(k,label)=>`<label class="setrow"><span>${label}</span><input type="checkbox" data-set="${k}" ${S.set[k]?'checked':''}></label>`;
 modal('설정',`${row('sfx','효과음')}${row('dmg','데미지 숫자')}${row('shake','화면 흔들림')}<p style="font-size:11px;margin-top:6px">배경음악은 곧 추가될 예정이에요.</p>`,[['이름 바꾸기',()=>askName()],['처음부터',()=>modal('정말 처음부터?','모든 진행 상황이 지워져요.',[['취소'],['지우기',resetSave,1]])],['닫기',null,1]]);
 document.querySelectorAll('[data-set]').forEach(i=>i.onchange=()=>{S.set[i.dataset.set]=i.checked?1:0;S.snd=!!S.set.sfx;save();});}

