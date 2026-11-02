<script>
/* ================= 스탯 상한 확장 ================= */
{const C=UPS.find(u=>u.k==='crit');C.max=184;/* 8%+0.5%*184 = 100% */
 const A=UPS.find(u=>u.k==='aspd');A.max=250;/* x6.00 */}
/* ================= 다양한 퀘스트 ================= */
{const _bw=bossWin;bossWin=function(...a){S.cnt.bwin=(S.cnt.bwin||0)+1;return _bw(...a)}}
{const _de=dunEnd;dunEnd=function(...a){if(mode==='dun')S.cnt.dunc=(S.cnt.dunc||0)+1;return _de(...a)}}
{const _km=killMob;killMob=function(m){if(m&&m.boss&&!m.dead)S.cnt.elite=(S.cnt.elite||0)+1;return _km(m)}}
const QV={
 kill:()=>S.cnt.kill||0, up:()=>S.cnt.up_any||0, summon:()=>S.cnt.summon||0, psummon:()=>S.cnt.psummon||0,
 merge:()=>S.cnt.merge||0, dis:()=>S.cnt.dis||0, ult:()=>S.cnt.ult||0, dunc:()=>S.cnt.dunc||0,
 elite:()=>S.cnt.elite||0, bwin:()=>S.cnt.bwin||0, dex:()=>Object.keys(S.dexC||{}).length,
 enh:()=>Object.values(S.enh||{}).reduce((a,b)=>a+b,0), stage:()=>S.g, lv:()=>S.lv};
function genQuest(k){/* k = 미션 번호(고정 목록 이후 0부터) */const t=Math.floor(k/12),r=k%12,c=ch()+1,L=S.lv;
 const Q=[
  ()=>({t:`몹 ${100+t*50}마리 처치`,c:'kill',n:100+t*50,r:80}),
  ()=>({t:`능력치 ${20+t*10}회 강화`,c:'up',n:20+t*10,r:80}),
  ()=>({t:`장비 소환 ${3+t*2}회`,c:'summon',n:3+t*2,r:100}),
  ()=>({t:`정예·중간 보스 ${2+t}마리 처치`,c:'elite',n:2+t,r:100}),
  ()=>({t:`장비 합성 ${2+t}회`,c:'merge',n:2+t,r:100}),
  ()=>({t:`던전 ${1+Math.floor(t/2)}회 클리어`,c:'dunc',n:1+Math.floor(t/2),r:120}),
  ()=>({t:`궁극기 ${5+t*3}회 사용`,c:'ult',n:5+t*3,r:90,need:()=>W().g>=3}),
  ()=>({t:`레벨 ${L+3} 달성`,s:'lv',n:L+3,r:100}),
  ()=>({t:`펫 소환 ${1+t}회`,c:'psummon',n:1+t,r:120}),
  ()=>({t:`장비 분해 ${5+t*3}개`,c:'dis',n:5+t*3,r:80}),
  ()=>({t:`도감 ${2+t}칸 등록`,c:'dex',n:2+t,r:100}),
  ()=>({t:`${c}-10 챕터 보스 처치`,c:'bwin',n:1,r:200})];
 let q=Q[r]();if(q.need&&!q.need())q=Q[0]();return q}
curMission=function(){const i=S.mi||0;if(i<MISSIONS.length)return MISSIONS[i];const k=i-MISSIONS.length;if(!S.qc||S.qc.i!==i){S.qc={i,q:genQuest(k)}}return S.qc.q};
const _mp0=mProg;mProg=function(){const m=curMission();if(m.s&&QV[m.s])return[Math.min(QV[m.s](),m.n),m.n];if(m.c&&QV[m.c]&&!(m.c in {kill:1})||m.c==='kill'&&(S.mi||0)>=MISSIONS.length){const v=QV[m.c]()-(S.mBase||0);return[Math.max(0,Math.min(v,m.n)),m.n]}return _mp0()};
const _sm0=startMission;startMission=function(){const m=curMission();if(m.c&&QV[m.c]&&(S.mi||0)>=MISSIONS.length){S.mBase=QV[m.c]();return}_sm0()};
/* 기존 진행 중 미션이 새 방식이면 기준값 다시 잡기 */
if((S.mi||0)>=MISSIONS.length&&!S.qc){startMission()}
</script>
