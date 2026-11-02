<script>
/* ================= 화면 맞춤: 전투 화면은 가로 꽉, 아래 강화 목록은 딱 2칸 ================= */
function fitField(){const G=$('#game'),F=$('#field'),P=$('#panel');if(!G||G.hidden||!F||!P)return;const isG=tab==='grow';if(!isG&&F.style.height)return;const Ls=$('#list');if(Ls)Ls.scrollTop=0;G.scrollTop=0;if(document.scrollingElement)document.scrollingElement.scrollTop=0;
  const kids=[...G.children].filter(e=>e!==F&&e!==P&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).position!=='absolute'&&getComputedStyle(e).position!=='fixed');
  const gs=getComputedStyle(G),gap=parseFloat(gs.rowGap||gs.gap)||4;
  const other=kids.reduce((a,e)=>a+e.getBoundingClientRect().height,0)+gap*(kids.length+1)+parseFloat(gs.paddingTop||0)+parseFloat(gs.paddingBottom||0);
  const row=isG&&document.querySelector('#list .row');const rh=row?row.getBoundingClientRect().height:62;const ph=$('#phead');const phH=isG&&ph&&ph.offsetHeight?ph.offsetHeight+4:0;
  const panelH=Math.ceil(rh*2+4+14+phH);
  const W=F.clientWidth||G.clientWidth;let H=Math.floor(G.clientHeight-other-panelH-6);
  let oy=Math.round(H/W*VW-VH);oy=Math.max(0,Math.min(110,oy));const fh=Math.round(W*(VH+oy)/VW);
  if(oy!==OY){OY=oy;OYK=OY*K;lo.height=VH+OY;cv.height=(VH+OY)*K;L.imageSmoothingEnabled=false}
  F.style.height=fh+'px';P.style.flex='1 1 auto';P.style.minHeight='0';
  /* 2차 보정: 목록이 2칸보다 많이 보이면 그만큼 전투 화면을 키움 */
  if(isG&&!fitField._r){const rows=[...document.querySelectorAll('#list .row')],Lb=$('#list').getBoundingClientRect().bottom;if(rows[1]){const extra=Lb-rows[1].getBoundingClientRect().bottom-8;if(Math.abs(extra)>3&&Math.abs(extra)<rh*1.5){fitField._r=1;const W2=F.clientWidth;let oy2=Math.round((fh+extra)/W2*VW-VH);oy2=Math.max(0,Math.min(130,oy2));if(oy2!==OY){OY=oy2;OYK=OY*K;lo.height=VH+OY;cv.height=(VH+OY)*K}F.style.height=Math.round(W2*(VH+OY)/VW)+'px';fitField._r=0}}}}
addEventListener('resize',()=>setTimeout(fitField,60));
{const _gg=goGame;goGame=function(...a){const r=_gg(...a);setTimeout(fitField,30);setTimeout(fitField,400);return r}}
{let t=0;const _rp=renderPanel;renderPanel=function(){_rp();clearTimeout(t);t=setTimeout(fitField,20)}}
</script>
<script>
/* 골드 2배: 오른쪽 아래 작은 아이콘 + 남은 시간 */
{const _h=hud;hud=function(){_h();const bf=$('#buff');if(!bf||bf.hidden)return;const r=Math.ceil((S.buff-Date.now())/1000);const t=`${Math.floor(r/60)}:${String(r%60).padStart(2,'0')}`;
  if(!bf.querySelector('i')){bf.innerHTML='<i></i><b>x2</b><span></span>'}bf.querySelector('span').textContent=t}}
</script>
<script>
/* 도감: 팝업으로 크게 */
let dexOpen=false;
function dexPopRender(){const pop=$('#dexPop');if(!pop)return;const body=pop.querySelector('.dpbody');const st=body.scrollTop;body.innerHTML='';renderDex(body);body.scrollTop=st}
function openDex(){let pop=$('#dexPop');if(!pop){pop=document.createElement('div');pop.id='dexPop';pop.innerHTML='<div class="dpw"><div class="dphead"><b>도감</b><button class="dpx" aria-label="닫기">✕</button></div><div class="dpbody"></div></div>';document.body.appendChild(pop);
  pop.querySelector('.dpx').onclick=()=>{dexOpen=false;pop.hidden=true;sfx('ui');renderPanel()};pop.addEventListener('click',e=>{if(e.target===pop)pop.querySelector('.dpx').click()})}
  dexOpen=true;pop.hidden=false;dexPopRender()}
{const _rp=renderPanel;renderPanel=function(){if(tab==='dungeon'&&advTab==='dex'){advTab='dun';_rp();openDex();return}_rp();if(dexOpen)dexPopRender()}}
</script>
<script>
/* 던전도 팝업: 던전 탭은 큰 버튼 2개(던전/도감)만 */
let popK=null;
function dunList(Lst){const st=document.createElement('div');st.className='dexsum';st.innerHTML=`<b>보유 강화석</b><span>${fmt(S.stone)}개</span><span style="opacity:.8">장비 탭에서 장착 장비를 +1 강화할 수 있어요</span>`;Lst.appendChild(st);
  Object.entries(DUNS).forEach(([k,D])=>{const s=dunState(k);const r=rowBase(c=>uiInto(c,D.ic),`${D.n}<small> 최고 ${k==='gold'?fmt(s.best):s.best}</small>`,D.d);
    const b=document.createElement('button');b.className='buy';b.innerHTML=`입장<small>${s.tix}/${DUN_TIX}</small>`;b.disabled=s.tix<=0||mode!=='farm';b.onclick=()=>{closePop();dunEnter(k)};r.appendChild(b);Lst.appendChild(r)})}
function popRender(){const pop=$('#dexPop');if(!pop||pop.hidden)return;const body=pop.querySelector('.dpbody'),st=body.scrollTop;body.innerHTML='';pop.querySelector('.dphead b').textContent=popK==='dun'?'던전':'도감';if(popK==='dun')dunList(body);else renderDex(body);body.scrollTop=st}
function closePop(){const pop=$('#dexPop');if(pop)pop.hidden=true;dexOpen=false;popK=null}
function openPop(k){openDex();popK=k;dexOpen=true;popRender()}
dexPopRender=popRender;
{const _rp=renderPanel;renderPanel=function(){if(tab!=='dungeon'){_rp();return}
  _rp();const Lst=$('#list'),H=$('#phead');if(H)H.innerHTML='';Lst.innerHTML='';const g=document.createElement('div');g.className='advbig';
  const any=Object.keys(DUNS).some(k=>dunState(k).tix>0);
  [['dun','던전',`오늘 입장권 ${Object.keys(DUNS).reduce((a,k)=>a+dunState(k).tix,0)}장`,'dungeon',any],['dex','도감',`몬스터 ${dexMobDone()} · 장비 ${dexItemDone()} · 펫 ${dexPetDone()}`,'book',dexAnyClaim()]].forEach(([k,n,sub,ic,dot])=>{
    const b=document.createElement('button');b.className='advb';b.innerHTML=`<canvas></canvas><b>${n}</b><small>${sub}</small>${dot?'<i class="ndot"></i>':''}`;uiInto(b.querySelector('canvas'),ic);b.onclick=()=>{sfx('ui');openPop(k)};g.appendChild(b)});
  Lst.appendChild(g);if(dexOpen)popRender()}}
{const pop=()=>$('#dexPop');document.addEventListener('click',e=>{const p=pop();if(p&&e.target&&e.target.classList&&e.target.classList.contains('dpx'))closePop()},true)}
</script>
<script>
/* 큰 데미지 색: 억 = 붉은 주황, 조 = 보라, 경 = 에메랄드, 해 = 네온 핑크 */
Object.assign(DSTY,{
 normE:{size:31,fill:['#fff2c0','#ff8a3a','#ff3a1a'],st:'#2a0800',sw:7},critE:{size:42,fill:['#ffffff','#ffb02a','#ff3a1a','#c00a0a'],st:'#2a0400',sw:8},
 normJ:{size:32,fill:['#ffffff','#e0a8ff','#a040ff'],st:'#1e0636',sw:7},critJ:{size:44,fill:['#ffe8ff','#ff6aff','#9a2aff','#4a0aa8'],st:'#14022a',sw:8},
 normK:{size:33,fill:['#ffffff','#b8ffd0','#2ae08a'],st:'#022414',sw:7},critK:{size:46,fill:['#ffffff','#b8ffd0','#2ae08a','#0a8a4a'],st:'#022414',sw:9},
 normH:{size:34,fill:['#ffffff','#ffc0e8','#ff3aa8'],st:'#24021a',sw:8},critH:{size:48,fill:['#ffffff','#ffc0e8','#ff3aa8','#a00a5a'],st:'#24021a',sw:10}});
{const _n=num;num=function(x,y,v,kind,...a){if((kind==='norm'||kind==='crit')&&v>=1e8){kind=kind+(v>=1e20?'H':v>=1e16?'K':v>=1e12?'J':'E')}return _n(x,y,v,kind,...a)}}
</script>
