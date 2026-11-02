<script>
/* ================= 자리 비운 사이: 대자로 뻗어 자는 북실이 ================= */
const SLW=100,SLH=58;
function slDraw(c,t){const x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,SLW,SLH);x.imageSmoothingEnabled=false;
  const br=Math.sin(t*1.6);
  /* 눈 매트 */x.fillStyle='#1a1020';x.beginPath();x.ellipse(50,48,42,7,0,0,7);x.fill();x.fillStyle='#bfe8ff';x.beginPath();x.ellipse(50,47,40,5.6,0,0,7);x.fill();x.fillStyle='#e8f8ff';x.beginPath();x.ellipse(44,46,24,2.6,0,0,7);x.fill();
  /* 실제 캐릭터 스프라이트를 눕힘: 머리 왼쪽, 주둥이·배 위쪽 */
  const bi=sleepSet().idle.cv[0];x.save();x.translate(-52,83);x.scale(1.35,1.35*(1+br*.03));x.rotate(-Math.PI/2);
  /* 스프라이트 좌표계: 발바닥 y≈98이 바닥(왼쪽 → 회전 후 오른쪽) */
  x.drawImage(bi,0,0);
  /* 감은 눈 */const ex=SLEYE.x,ey=SLEYE.y;x.fillStyle=SLEYE.fur;x.fillRect(ex-1,ey-1,4,4);x.fillStyle='#1a1020';x.fillRect(ex-1,ey+1,1,1);x.fillRect(ex,ey+2,2,1);x.fillRect(ex+2,ey+1,1,1);
  /* 콧물방울 (코끝에서 부풀었다 터짐) */const cyc=(t%3.4)/3.4,nx=SLEYE.nx,ny=SLEYE.ny;
  if(cyc<.85){const r=.8+cyc/.85*5;x.strokeStyle='#9ad8ff';x.lineWidth=1;x.beginPath();x.arc(nx+r+.5,ny-1,r,0,7);x.stroke();x.fillStyle='rgba(190,235,255,.35)';x.fill();x.fillStyle='#fff';x.fillRect(Math.round(nx+r*.6),Math.round(ny-1-r*.5),1,1)}
  else{const u=(cyc-.85)/.15;x.fillStyle='#bfe8ff';for(let i=0;i<6;i++){const a=i/6*Math.PI*2;x.fillRect(Math.round(nx+4+Math.cos(a)*(4+u*5)),Math.round(ny-1+Math.sin(a)*(4+u*5)),1,1)}}
  x.restore();
  /* 옆에 내려놓은 무기 */try{const wi=hqItem(S.eq.w);x.save();x.imageSmoothingEnabled=true;x.translate(78,44);x.rotate(Math.PI/4);x.drawImage(wi,-17,-17,34,34);x.restore()}catch(e){}}
/* 스프라이트에서 눈·코 위치 자동 찾기 */
let SLEYE={x:38,y:62,nx:49,ny:66,fur:'#f2ede0'};
function slFindEye(){try{const bi=sleepSet().idle.cv[0],w=bi.width,h=bi.height,d=bi.getContext('2d').getImageData(0,0,w,h).data;const px=(x,y)=>{const i=(y*w+x)*4;return[d[i],d[i+1],d[i+2],d[i+3]]};
  let y0=-1;for(let y=0;y<h&&y0<0;y++)for(let x=0;x<w;x++)if(px(x,y)[3]>100){y0=y;break}
  /* 머리 영역에서 가장 오른쪽 어두운 픽셀 = 코, 머리 중앙의 어두운 점 = 눈 */let nose=null,eye=null;
  for(let y=y0;y<y0+22;y++)for(let x=w-1;x>=0;x--){const p=px(x,y);if(p[3]>100){const dark=p[0]+p[1]+p[2]<180;const nb=x+1<w?px(x+1,y)[3]:0;if(dark&&nb<100&&(!nose||x>nose.x)){nose={x,y}}break}}
  if(nose){outer:for(let y=y0+2;y<y0+20;y++)for(let x=nose.x-14;x<nose.x-3;x++){const p=px(x,y),l=px(x-1,y),r=px(x+1,y);if(p[3]>100&&p[0]+p[1]+p[2]<260&&l[3]>100&&r[3]>100&&l[0]+l[1]+l[2]>500){eye={x,y};break outer}}}
  if(eye){const f=px(eye.x-2,eye.y);SLEYE={x:eye.x,y:eye.y,nx:nose.x+1,ny:nose.y,fur:`rgb(${f[0]},${f[1]},${f[2]})`}}else if(nose)SLEYE.nx=nose.x+1,SLEYE.ny=nose.y}catch(e){}}
/* 무기 없는 맨몸 북실이 (자는 모습용) */
let NOWPN=0;{const _wd=wpnDraw;wpnDraw=function(P,paw,...a){if(NOWPN)return paw;return _wd(P,paw,...a)}}
const SLEEPC={};function sleepSet(){bearSet();const key=[GEAR.sp,GEAR.nr,GEAR.sande,GEAR.cos,GEAR.scarf].join('|');if(SLEEPC[key])return SLEEPC[key];NOWPN=1;let b;try{b=bake(animDefs('blunt'),bearSmall,BW,BH)}finally{NOWPN=0}bearSet();return SLEEPC[key]=b}
let slRAF=0;
function slLoop(){const c=$('#aBear');if(!c||$('#away').hidden){cancelAnimationFrame(slRAF);return}slDraw(c,performance.now()/1000);slRAF=requestAnimationFrame(slLoop)}
{const _sa=showAway;showAway=function(sec,gold){_sa(sec,gold);const c=$('#aBear');c.width=SLW;c.height=SLH;slFindEye();
  /* 고화질 보상 아이콘 */const tiles=[...document.querySelectorAll('#aTiles .rw')];if(tiles[0])uiInto(tiles[0].querySelector('canvas'),'coin');if(tiles[2])uiInto(tiles[2].querySelector('canvas'),'gem');
  cancelAnimationFrame(slRAF);slLoop()}}
</script>
<script>
/* ================= 캐릭터 이름 ================= */
const NM=()=>(S.name||'북실이');
const hasB=w=>{const c=w.charCodeAt(w.length-1);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28>0};
const PJ={가:['이','가'],는:['은','는'],를:['을','를'],와:['과','와']};
const NMJ=j=>NM()+(PJ[j]?PJ[j][hasB(NM())?0:1]:j);
const nmFix=s=>typeof s==='string'?s.replace(/북실이(가|는|를|와)?/g,(m,j)=>j?NMJ(j):NM()):s;
{const f=toast;toast=function(m,...a){return f(nmFix(m),...a)}}
{const f=modal;modal=function(t,p,...a){return f(nmFix(t),nmFix(p),...a)}}
{const f=banner;banner=function(s,...a){return f(nmFix(s),...a)}}
{const f=logAdd;logAdd=function(h){return f(nmFix(h))}}
{let last='';const _h=hud;hud=function(){_h();const v=`Lv.${S.lv}|${NM()}`;if(v!==last||!H$.lv.querySelector('.pname')){last=v;H$.lv.innerHTML=`Lv.${S.lv} <span class="pname">${NM().replace(/[<>&"]/g,'')}</span>`}}}
{const _sa=showAway;showAway=function(sec,gold){_sa(sec,gold);const p=document.querySelector('#away .asub');if(p)p.lastChild.textContent=` 동안 ${NMJ('가')} 혼자 싸웠어요`}}
function nameLen(s){return [...s].length}
function showNameBox(first){let box=$('#nameBox');if(!box){box=document.createElement('div');box.id='nameBox';box.innerHTML=`<div class="nbw"><div class="ribbon ab"><span>이름 짓기</span></div><p class="nbs">고향을 찾아 떠날 백곰의 이름을 지어 주세요</p>
  <div class="nbin"><input id="nbInput" maxlength="12" autocomplete="off" spellcheck="false" placeholder="북실이"><b id="nbCnt">0/6</b></div><p class="nbh" id="nbHint">최대 6글자까지 쓸 수 있어요</p><button class="ybtn" id="nbOk">이 이름으로 할래요</button></div>`;document.body.appendChild(box);
  const inp=$('#nbInput');const upd=()=>{let v=inp.value.replace(/\s+/g,' ');if(nameLen(v)>6){v=[...v].slice(0,6).join('')}if(v!==inp.value)inp.value=v;$('#nbCnt').textContent=`${nameLen(v.trim())}/6`;$('#nbOk').disabled=!v.trim()};inp.addEventListener('input',upd);inp.addEventListener('compositionend',upd);
  inp.addEventListener('keydown',e=>{if(e.key==='Enter')$('#nbOk').click()});
  $('#nbOk').addEventListener('click',()=>{const v=[...inp.value.trim()].slice(0,6).join('');if(!v)return;S.name=v;S.named=1;save();box.hidden=true;sfx('level');banner(`${v}, 출발!`,'#62d6ff');lobbyInfo&&lobbyInfo()})}
  const inp=$('#nbInput');inp.value=S.name||(first?'':'북실이');inp.dispatchEvent(new Event('input'));box.hidden=false;setTimeout(()=>inp.focus(),200)}
{const _gg=goGame;goGame=function(...a){const r=_gg(...a);if(!S.named)setTimeout(()=>showNameBox(!S.name),400);return r}}
/* 레벨 칸 누르면 이름 바꾸기 */
document.querySelector('.me')&&document.querySelector('.me').addEventListener('click',()=>{if(screen==='game')showNameBox(false)});
</script>
