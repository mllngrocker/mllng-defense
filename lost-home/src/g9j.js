<script>
/* ================= 장비 분해 → 강화석 ================= */
const DV=[1,2,4,8,16,32,64];
if(S.dkeep==null)S.dkeep=true;
/* 확인창 (취소/확인 두 버튼) */
function confirmBox(title,html,okTxt,onOk){$('#mT').textContent=title;$('#mP').innerHTML=html;$('#mB').hidden=true;const ok=$('#mOk');ok.textContent=okTxt;
  let cb=document.getElementById('mNo');if(!cb){const w=document.createElement('div');w.className='mbtns';ok.before(w);cb=document.createElement('button');cb.id='mNo';cb.textContent='취소';w.append(cb,ok)}cb.hidden=false;
  const close=()=>{$('#modal').hidden=true;cb.hidden=true;$('#mP').textContent=''};cb.onclick=()=>{sfx('ui');close()};ok.onclick=()=>{close();onOk()};$('#modal').hidden=false}
{const _m=modal;modal=function(...a){const cb=document.getElementById('mNo');if(cb)cb.hidden=true;return _m(...a)}}
{const _mh=modalHTML;modalHTML=function(...a){const cb=document.getElementById('mNo');if(cb)cb.hidden=true;return _mh(...a)}}
/* 분해 가능 개수: 장착 중 1개는 보호, '1개씩 남기기'면 종류마다 1개 남김 */
const dAvail=k=>S.dkeep?Math.max(0,(S.inv[k]||0)-1):spare(k);
const dGradeIds=(c,g)=>gradeIds(c,g).filter(k=>dAvail(k)>0);
const dCount=(c,g)=>dGradeIds(c,g).reduce((a,k)=>a+dAvail(k),0);
function doDismantle(list,single){let st=0,n=0;list.forEach(([k,q])=>{q=Math.min(q,single?spare(k):dAvail(k));if(q<=0)return;S.inv[k]-=q;st+=DV[ITEMS[k].g]*q;n+=q});
  if(!n)return;S.stone+=st;S.cnt.dis=(S.cnt.dis||0)+n;sfx('buy');banner(`분해 ${n}개 · 강화석 +${st}`,'#c88aff');logAdd(`<span style="color:#c88aff">강화석 +${st}</span> · 분해 ${n}개`);save();renderPanel()}
function askDismantle(list,single){const items=list.filter(([k,q])=>q>0);if(!items.length)return;const st=items.reduce((a,[k,q])=>a+DV[ITEMS[k].g]*q,0),n=items.reduce((a,[,q])=>a+q,0),top=Math.max(...items.map(([k])=>ITEMS[k].g));
  if(top<3){doDismantle(items,single);return}
  const html=`<div class="dwarn">S급 이상 장비가 포함돼 있어요. 분해하면 되돌릴 수 없어요!</div><div class="mres">${items.sort((a,b)=>ITEMS[b[0]].g-ITEMS[a[0]].g).map(([k,q])=>`<div class="mr"><canvas data-id="${k}"></canvas>${badge(ITEMS[k].g)}<b>${ITEMS[k].n}</b>${q>1?`<i>x${q}</i>`:''}</div>`).join('')}</div><div class="dget">강화석 <b>+${st}</b></div>`;
  confirmBox(`${n}개 분해할까요?`,html,'분해하기',()=>doDismantle(items,single));document.querySelectorAll('#mP canvas[data-id]').forEach(c=>itemIcon(c,c.dataset.id))}
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='gear')return;const GC=S.gcat||'w';const Lst=$('#list');const mb=Lst&&Lst.querySelector('.mergebox');if(!mb)return;
  const box=document.createElement('div');box.className='mergebox dbox';
  box.innerHTML=`<div class="mhead"><b>장비 분해</b><span>남는 장비 → 강화석</span></div>`;
  const keep=document.createElement('button');keep.className='dkeep'+(S.dkeep?' on':'');keep.innerHTML=`<i></i>1개씩 남기기`;keep.onclick=()=>{S.dkeep=!S.dkeep;sfx('ui');save();renderPanel()};box.querySelector('.mhead').appendChild(keep);
  const row=document.createElement('div');row.className='mgrades';
  GRADES.forEach((gn,g)=>{const n=dCount(GC,g);const b=document.createElement('button');b.className='mg dg'+(n?' can2':'');b.disabled=!n;
    b.innerHTML=`${badge(g)}<small>${n}개</small><em>+${n*DV[g]}</em>`;b.onclick=()=>askDismantle(dGradeIds(GC,g).map(k=>[k,dAvail(k)]));row.appendChild(b)});
  box.appendChild(row);const low=document.createElement('button');low.className='buy dlow';const lowList=[0,1,2].flatMap(g=>dGradeIds(GC,g).map(k=>[k,dAvail(k)]));const lowSt=lowList.reduce((a,[k,q])=>a+DV[ITEMS[k].g]*q,0);
  low.innerHTML=`C~A 한 번에 분해 <small>강화석 +${lowSt}</small>`;low.disabled=!lowList.length;low.onclick=()=>askDismantle(lowList);box.appendChild(low);mb.after(box);
  /* 각 장비 줄에 분해 버튼 */
  Lst.querySelectorAll('.row[data-id]').forEach(r=>{const k=r.dataset.id;if(!ITEMS[k])return;const q=spare(k);const b=document.createElement('button');b.className='dbtn';b.title='분해';b.innerHTML=`분해<small>+${DV[ITEMS[k].g]}</small>`;b.disabled=q<=0;
    b.onclick=e=>{e.stopPropagation();askDismantle([[k,1]],true)};const buy=r.querySelector('.buy');if(buy)buy.before(b);else r.appendChild(b)})}}
</script>
<script>
/* x1/x10/x100/MAX 제거 (꾹 누르면 연속 강화) */
S.mult=1;{const _rp=renderPanel;renderPanel=function(){_rp();if(tab==='grow'){S.mult=1;const H=$('#phead');if(H)H.innerHTML=''}}}
</script>
<script>
/* 강화 배수 버튼 제거 (꾹 누르면 연속 강화) */
S.mult=1;
{const _rp=renderPanel;renderPanel=function(){S.mult=1;_rp();if(tab==='grow'){const H=$('#phead');if(H)H.innerHTML=''}}}
</script>
