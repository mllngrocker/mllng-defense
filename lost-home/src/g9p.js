<script>
/* ================= 설정 팝업 ================= */
if(!S.set)S.set={bgm:1,sfx:1,dmg:1,shake:1};
function applySet(){ensureAudio&&ensureAudio();if(MG)MG.gain.value=1;S.snd=true;if(BGMG)BGMG.gain.value=S.set.bgm?.16:0;if(SFXG)SFXG.gain.value=S.set.sfx?.5:0}
{const _ea=ensureAudio;ensureAudio=function(){const had=!!AC;_ea();if(!had&&AC){S.snd=true;if(MG)MG.gain.value=1;if(BGMG)BGMG.gain.value=S.set.bgm?.16:0;if(SFXG)SFXG.gain.value=S.set.sfx?.5:0}}}
{const _n=num;num=function(x,y,v,kind,...a){if(!S.set.dmg&&kind!=='hurt')return;return _n(x,y,v,kind,...a)}}
{const _r=render;render=function(rdt){if(!S.set.shake)shake=0;return _r(rdt)}}
const SETS_UI=[['bgm','배경음','챕터 음악'],['sfx','효과음','타격음, 획득음 등'],['dmg','데미지 숫자','몬스터 위에 뜨는 숫자'],['shake','화면 흔들림','타격·폭발 시 흔들림']];
function setRender(L){SETS_UI.forEach(([k,n,d])=>{const r=document.createElement('div');r.className='row setrow';r.innerHTML=`<div class="inf"><b>${n}</b><span>${d}</span></div>`;
  const b=document.createElement('button');b.className='tgl'+(S.set[k]?' on':'');b.innerHTML='<i></i>';b.onclick=()=>{S.set[k]=S.set[k]?0:1;applySet();sfx('ui');save();popRender()};r.appendChild(b);L.appendChild(r)});
  const nm=document.createElement('div');nm.className='row setrow';nm.innerHTML=`<div class="inf"><b>이름 바꾸기</b><span>지금 이름: ${NM()}</span></div>`;const nb=document.createElement('button');nb.className='buy';nb.textContent='변경';nb.onclick=()=>{closePop();showNameBox(false)};nm.appendChild(nb);L.appendChild(nm);
  L.insertAdjacentHTML('beforeend','<p class="attnote">VER 0.6 · 기록은 이 기기 브라우저에 저장돼요</p>')}
POPS.set={t:'설정',r:setRender};
{const old=$('#snd');if(old){const nb=old.cloneNode(false);nb.textContent='설정';nb.setAttribute('aria-label','설정');nb.classList.remove('off');old.replaceWith(nb);nb.addEventListener('click',()=>{sfx('ui');openPop('set')})}}
{const ls=$('#lSet');if(ls){ls.disabled=false;ls.addEventListener('click',()=>openPop('set'))}}
setTimeout(applySet,0);

/* ================= 장비 탭 = 큰 팝업 ================= */
{const _rp=renderPanel;renderPanel=function(){_rp();const on=tab==='gear';const nav=$('#nav');
  if(on&&!document.body.classList.contains('gearpop')){const pr=$('#panel').getBoundingClientRect(),nr=nav.getBoundingClientRect();let ph=$('#gpph');if(!ph){ph=document.createElement('div');ph.id='gpph';$('#panel').before(ph)}ph.style.height=pr.height+'px';
    nav.style.cssText=`position:fixed;left:${nr.left}px;top:${nr.top}px;width:${nr.width}px;z-index:30`;$('#panel').style.bottom=(innerHeight-nr.top+6)+'px'}
  if(!on&&document.body.classList.contains('gearpop')){nav.style.cssText='';const ph=$('#gpph');if(ph)ph.remove();$('#panel').style.bottom=''}
  document.body.classList.toggle('gearpop',on);
  if(on&&!$('#gpx')){const x=document.createElement('button');x.id='gpx';x.textContent='✕';x.setAttribute('aria-label','닫기');x.onclick=()=>{sfx('ui');tab='grow';document.querySelectorAll('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.t==='grow'));renderPanel()};$('#panel').appendChild(x)}
  if(on){let t=$('#gptitle');if(!t){t=document.createElement('div');t.id='gptitle';t.textContent='장비';$('#panel').prepend(t)}}}}
</script>
<script>
/* 장비 팝업: 장착칸 아래 바로 장비 목록, 강화·합성·분해·세트는 버튼으로 따로 */
let gview='list';
{const _rp=renderPanel;renderPanel=function(){_rp();if(tab!=='gear')return;const L=$('#list');const eq=L&&L.querySelector('.eqline');if(!eq)return;
  const parts={set:L.querySelector('.setbox'),enh:L.querySelector('.stonebar'),merge:L.querySelector('.mergebox:not(.dbox)'),dis:L.querySelector('.dbox')};
  const bar=document.createElement('div');bar.className='gtools';
  [['enh','강화','stone'],['merge','합성','gear'],['dis','분해','coin'],['set','세트','book']].forEach(([k,n,ic])=>{if(!parts[k])return;const b=document.createElement('button');b.className='gtb'+(gview===k?' on':'');b.innerHTML=`<canvas></canvas><span>${n}</span>`;uiInto(b.querySelector('canvas'),ic);
    b.onclick=()=>{gview=gview===k?'list':k;sfx('ui');renderPanel();L.scrollTop=0};bar.appendChild(b)});
  eq.after(bar);
  Object.entries(parts).forEach(([k,el])=>{if(el)el.style.display=gview===k?'':'none'});
  L.querySelectorAll(':scope > .row, :scope > .note').forEach(r=>r.style.display=gview==='list'?'':'none');
  if(gview!=='list'){const back=document.createElement('button');back.className='gback';back.textContent='← 장비 목록으로';back.onclick=()=>{gview='list';sfx('ui');renderPanel()};(parts[gview]||bar).after(back)}}}
</script>
