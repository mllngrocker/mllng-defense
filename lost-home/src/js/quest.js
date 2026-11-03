/* ---------- quests (12 cycling), daily quests (5/day), attendance (7-day cycle) ----------
 Progress comes from event counters: track('kill'), track('up', n) … stored in S.cnt (all time) and S.daily.c (today). */
const QUESTS=[
 {ev:'kill',n:50,d:'몬스터 {n}마리 처치'},{ev:'up',n:20,d:'능력치 {n}번 강화'},{ev:'stage',n:5,d:'스테이지 {n}개 돌파'},{ev:'gacha',n:10,d:'뽑기 {n}번'},
 {ev:'boss',n:1,d:'챕터 보스 {n}번 처치'},{ev:'skill',n:15,d:'스킬 {n}번 사용'},{ev:'enh',n:3,d:'장비·펫 {n}번 강화'},{ev:'kill',n:150,d:'몬스터 {n}마리 처치'},
 {ev:'merge',n:1,d:'장비·펫 {n}번 합성'},{ev:'dun',n:1,d:'던전 {n}번 클리어'},{ev:'gold',n:0,d:'골드 {n} 모으기',goldK:1},{ev:'up',n:60,d:'능력치 {n}번 강화'},
];
const DAILY=[{ev:'kill',n:300,d:'몬스터 300마리 처치'},{ev:'gacha',n:5,d:'뽑기 5번'},{ev:'dun',n:1,d:'던전 1번 클리어'},{ev:'up',n:30,d:'능력치 30번 강화'},{ev:'skill',n:20,d:'스킬 20번 사용'}];
const ATTEND=[{gem:50},{gem:80},{gem:100,stone:2},{gem:120},{gem:150,stone:3},{gem:200},{gem:500,stone:10}];
if(!S.cnt)S.cnt={};if(!S.q)S.q={i:0,base:0};if(!S.daily)S.daily={day:'',c:{},got:[],all:false};if(!S.att)S.att={n:0,last:''};
function dailyReset(){if(S.daily.day!==today())S.daily={day:today(),c:{},got:[],all:false};}
function track(ev,n=1){S.cnt[ev]=(S.cnt[ev]||0)+n;dailyReset();S.daily.c[ev]=(S.daily.c[ev]||0)+n;questDot();}
// main quest: target scales each full cycle so it never runs out
function curQuest(){const q=QUESTS[S.q.i%QUESTS.length],cyc=Math.floor(S.q.i/QUESTS.length),n=q.goldK?Math.floor(mobGold(Math.max(S.best,1))*200*(1+cyc)):Math.ceil(q.n*(1+cyc*.5));
 return{...q,n,have:Math.min(n,(S.cnt[q.ev]||0)-S.q.base),reward:30+cyc*10,text:q.d.replace('{n}',fmt(n))};}
function claimQuest(){const q=curQuest();if(q.have<q.n)return;S.gem+=q.reward;S.q.i++;S.q.base=S.cnt[QUESTS[S.q.i%QUESTS.length].ev]||0;sfx('clear');save();}
function canAttend(){return S.att.last!==today();}
function attend(){if(!canAttend())return null;const day=S.att.n%7,r=ATTEND[day];S.gem+=r.gem;S.stone=(S.stone||0)+(r.stone||0);S.att.n++;S.att.last=today();sfx('clear');save();return r;}
function dailyDone(i){dailyReset();return(S.daily.c[DAILY[i].ev]||0)>=DAILY[i].n;}
function claimDaily(i){if(!dailyDone(i)||S.daily.got.includes(i))return;S.daily.got.push(i);S.gem+=30;if(S.daily.got.length===DAILY.length&&!S.daily.all){S.daily.all=true;S.gem+=100;S.stone=(S.stone||0)+3;toast('일일 퀘스트 모두 완료! 보석 +100, 강화석 +3');}sfx('clear');save();}
function questReady(){dailyReset();const q=curQuest();return canAttend()||q.have>=q.n||DAILY.some((_,i)=>dailyDone(i)&&!S.daily.got.includes(i));}
function questDot(){const b=$('#qbtn');if(b)b.classList.toggle('dot',questReady());}
function questMenu(){dailyReset();const q=curQuest(),day=S.att.n%7;
 const att=ATTEND.map((r,i)=>{const isToday=i===day&&canAttend();return`<div class="att${i<day?' got':''}${isToday?' now':''}"><small>${i+1}일</small><b>${r.gem}</b>${r.stone?`<i>+강화석 ${r.stone}</i>`:''}</div>`;}).join('');
 const dl=DAILY.map((d,i)=>{const have=Math.min(d.n,S.daily.c[d.ev]||0),got=S.daily.got.includes(i);return`<div class="qrow"><span>${d.d}</span><div class="bar"><b style="width:${have/d.n*100}%"></b></div><button class="qbtn2${got?' got':have>=d.n?' ok':''}" data-di="${i}">${got?'완료':have>=d.n?'받기':`${fmt(have)}/${fmt(d.n)}`}</button></div>`;}).join('');
 modal('퀘스트',`<div class="qsec">출석 보상 <small>${canAttend()?'오늘 받을 수 있어요':'내일 다시 와요'}</small></div><div class="attrow">${att}</div>${canAttend()?'<button class="btn2" id="attbtn" style="width:100%;margin-top:6px">출석하기</button>':''}
  <div class="qsec">퀘스트 <small>보석 ${q.reward}</small></div><div class="qrow"><span>${q.text}</span><div class="bar"><b style="width:${q.have/q.n*100}%"></b></div><button class="qbtn2${q.have>=q.n?' ok':''}" id="mqbtn">${q.have>=q.n?'받기':`${fmt(q.have)}/${fmt(q.n)}`}</button></div>
  <div class="qsec">일일 퀘스트 <small>각 보석 30 · 모두 완료 시 보석 100 + 강화석 3</small></div>${dl}`,[],1);
 const ab=$('#attbtn');if(ab)ab.onclick=()=>{const r=attend();if(r)toast(`출석 ${S.att.n%7||7}일차! 보석 +${r.gem}${r.stone?`, 강화석 +${r.stone}`:''}`);updateHud();questMenu();};
 $('#mqbtn').onclick=()=>{claimQuest();updateHud();questMenu();};
 document.querySelectorAll('[data-di]').forEach(b=>b.onclick=()=>{claimDaily(+b.dataset.di);updateHud();questMenu();});questDot();}
