<script>
/* ================= 장비 합성: 같은 종류 같은 등급 3개 → 다음 등급 1개 ================= */
if(!S.enh)S.enh={};
const MERGE_N=3;
const eqIds=()=>[S.eq.w,S.eq.c,S.eq.a1,S.eq.a2].filter(Boolean);
/* 합성에 쓸 수 있는 개수 (장착 중인 장비는 1개 남김) */
const spare=id=>Math.max(0,(S.inv[id]||0)-(eqIds().includes(id)?1:0));
const gradeIds=(c,g)=>Object.keys(ITEMS).filter(k=>ITEMS[k].c===c&&ITEMS[k].g===g);
const mergeAvail=(c,g)=>gradeIds(c,g).reduce((a,k)=>a+spare(k),0);
function mergeOnce(c,g){if(g>=GRADES.length-1||mergeAvail(c,g)<MERGE_N)return null;
  let need=MERGE_N;const pool=gradeIds(c,g).filter(k=>spare(k)>0).sort((a,b)=>spare(b)-spare(a));
  for(const k of pool){while(need>0&&spare(k)>0){S.inv[k]--;need--}if(need<=0)break}
  const outs=gradeIds(c,g+1);const id=pick(outs);S.inv[id]=(S.inv[id]||0)+1;S.everI[id]=1;S.cnt.merge=(S.cnt.merge||0)+1;return id}
function mergeFx(ids){const best=ids.reduce((a,b)=>ITEMS[b].g>ITEMS[a].g?b:a,ids[0]);const it=ITEMS[best];sfx('drop',it.g);
  banner(ids.length>1?`합성 ${ids.length}회 성공!`:`${GRADES[it.g]} ${it.n}!`,GCOL[it.g]);flash=it.g>=3?.6:.3;flashC=GCOL[it.g];if(it.g>=3){shake=10;slowT=.4}}
function showMergeResult(ids){if(!ids.length)return;mergeFx(ids);
  const cnt={};ids.forEach(i=>cnt[i]=(cnt[i]||0)+1);
  const html=`<div class="mres">${Object.keys(cnt).sort((a,b)=>ITEMS[b].g-ITEMS[a].g).map(i=>`<div class="mr"><canvas data-id="${i}"></canvas>${badge(ITEMS[i].g)}<b>${ITEMS[i].n}</b>${cnt[i]>1?`<i>x${cnt[i]}</i>`:''}</div>`).join('')}</div>`;
  modalHTML('합성 결과',html);document.querySelectorAll('#mP canvas[data-id]').forEach(c=>itemIcon(c,c.dataset.id));save()}
function mergeAll(c){const got=[];for(let g=0;g<GRADES.length-1;g++){let id;while((id=mergeOnce(c,g)))got.push(id)}return got}
/* 장비 탭에 합성 바 */
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='gear')return;const GC=S.gcat||'w';const Lst=$('#list');const eq=Lst&&Lst.querySelector('.eqline');if(!eq)return;
  const box=document.createElement('div');box.className='mergebox';const any=GRADES.slice(0,-1).some((_,g)=>mergeAvail(GC,g)>=MERGE_N);
  box.innerHTML=`<div class="mhead"><b>장비 합성</b><span>같은 등급 ${MERGE_N}개 → 다음 등급 1개</span></div>`;
  const row=document.createElement('div');row.className='mgrades';
  GRADES.slice(0,-1).forEach((gn,g)=>{const n=mergeAvail(GC,g);const b=document.createElement('button');b.className='mg'+(n>=MERGE_N?' can':'');b.disabled=n<MERGE_N;
    b.innerHTML=`${badge(g)}<span class="arr">→</span>${badge(g+1)}<small>${n}/${MERGE_N}</small>`;b.onclick=()=>{const id=mergeOnce(GC,g);if(id){showMergeResult([id]);renderPanel()}};row.appendChild(b)});
  box.appendChild(row);const all=document.createElement('button');all.className='buy mall';all.innerHTML='모두 합성';all.disabled=!any;all.onclick=()=>{const before={...S.inv};const got=mergeAll(GC);if(got.length){const net=[];for(const k in S.inv){const d=(S.inv[k]||0)-(before[k]||0);for(let i=0;i<d;i++)net.push(k)}showMergeResult(net.length?net:got);renderPanel()}};box.querySelector('.mhead').appendChild(all);
  const sb=Lst.querySelector('.stonebar');(sb||eq).after(box)}}
</script>
<script>
/* 프로필 곰: 좀 더 당당한 표정 + 목도리 */
UIK.bear=x=>{const bg=x.createLinearGradient(0,0,0,96);bg.addColorStop(0,'#7ac8ff');bg.addColorStop(1,'#2a76e8');x.fillStyle=bg;x.fillRect(0,0,96,96);
  x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.arc(80,14,30,0,7);x.fill();
  [[20,22],[76,22]].forEach(([a,b])=>{hsh(x,()=>x.arc(a,b,13,0,7),hr(x,a,b,13,['#ffffff','#eee8da','#c4baa2']),5);hsh(x,()=>x.arc(a,b+1,6.5,0,7),'#d8a8a0',0)});
  hsh(x,()=>{x.moveTo(8,96);x.quadraticCurveTo(6,22,48,18);x.quadraticCurveTo(90,22,88,96);x.closePath()},hr(x,44,44,52,['#ffffff','#f4efe2','#cfc5ac']),6);
  hsh(x,()=>x.ellipse(48,66,19,14,0,0,7),hg(x,0,52,0,80,['#ffffff','#e8e0cc']),3.5);
  /* 결연한 눈썹 + 눈 */
  [[31,46,1],[65,46,-1]].forEach(([a,b,d])=>{x.fillStyle='#1a1020';x.beginPath();x.ellipse(a,b,4.8,5.6,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(a-1.4,b-2,1.9,0,7);x.fill();
    x.strokeStyle='#1a1020';x.lineWidth=4.2;x.beginPath();x.moveTo(a-8*d,b-12);x.lineTo(a+6*d,b-8);x.stroke()});
  hsh(x,()=>x.ellipse(48,59,7.5,5.2,0,0,7),'#1a1020',0);x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(45.5,57.4,2.6,1.4,0,0,7);x.fill();
  x.strokeStyle='#1a1020';x.lineWidth=2.6;x.beginPath();x.moveTo(48,64);x.lineTo(48,68);x.quadraticCurveTo(54,72,59,67);x.stroke();
  x.fillStyle='rgba(255,140,150,.38)';x.beginPath();x.ellipse(22,62,6,3.4,0,0,7);x.ellipse(74,62,6,3.4,0,0,7);x.fill();
  /* 반창고 */x.save();x.translate(70,36);x.rotate(.5);hsh(x,()=>x.roundRect(-8,-3.2,16,6.4,2.5),'#f4d0a8',2.4);x.fillStyle='rgba(150,100,60,.5)';x.fillRect(-1.6,-1.6,3.2,3.2);x.restore();
  /* 파란 목도리 */hsh(x,()=>{x.moveTo(10,84);x.quadraticCurveTo(48,96,86,84);x.lineTo(90,98);x.lineTo(6,98);x.closePath()},hg(x,0,82,0,98,['#7ac8ff','#2a6ad6','#0e3a8a']),5);
  x.strokeStyle='rgba(255,255,255,.55)';x.lineWidth=2;x.beginPath();x.moveTo(16,88);x.quadraticCurveTo(48,98,80,88);x.stroke()};
delete UIC.bear;hqAva();
</script>
<script>
/* 프로필 = 실제 캐릭터 스프라이트 얼굴 (의상 따라 바뀜) */
let avaSet=null;
function spriteAva(){const a=$('#ava');if(!a||!bear.set)return;avaSet=bear.set;const bi=bear.set.idle.cv[0];
  a.width=a.height=192;a.classList.remove('pix');const x=a.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,192,192);
  const g=x.createLinearGradient(0,0,0,192);g.addColorStop(0,'#3a4a78');g.addColorStop(1,'#141a30');x.fillStyle=g;x.fillRect(0,0,192,192);
  const r=x.createRadialGradient(96,90,10,96,90,110);r.addColorStop(0,'rgba(140,200,255,.35)');r.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=r;x.fillRect(0,0,192,192);
  x.imageSmoothingEnabled=false;const d=bi.getContext('2d').getImageData(0,0,bi.width,bi.height).data,W2=bi.width;let y0=-1;
  for(let y=0;y<bi.height&&y0<0;y++)for(let xx=0;xx<W2;xx++)if(d[(y*W2+xx)*4+3]>100){y0=y;break}
  let x0=W2,x1=0;for(let y=y0;y<y0+19;y++)for(let xx=0;xx<W2;xx++)if(d[(y*W2+xx)*4+3]>100){if(xx<x0)x0=xx;if(xx>x1)x1=xx}
  x1=Math.min(x1,x0+24);const sw=Math.max(x1-x0,19)+5,cx=(x0+x1)/2,sx=Math.round(cx-sw/2),sy=y0-3,k=192/sw;x.drawImage(bi,sx,sy,sw,sw,0,6,sw*k,sw*k)}
{const _h=hud;hud=function(){_h();if(bear.set&&bear.set!==avaSet)spriteAva()}}
spriteAva();
</script>
