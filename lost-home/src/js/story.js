/* ---------- prologue cutscene, bear naming, boss victory screen, sleeping bear (AFK) ---------- */
const PRO=[
 {txt:'북극의 빙하가 모두 녹아내렸다.',th:{...LOBBY_THEME,sky:['#3a2a5a','#c86a5a','#ffb07a'],sun:['#ffd0a0',.7,.38,.07],aurora:0},floe:1},
 {txt:'집도, 가족도, 얼음 위의 길도 모두 사라졌다.',th:{...LOBBY_THEME,sky:['#0a1428','#1a2a48','#3a5070'],wx:7},floe:.55,alone:1},
 {txt:'떠다니는 쓰레기 사이로, 낯선 땅이 보였다.',th:THEMES[0],trash:1},
 {txt:'고향을 되찾기 위해, 백곰은 판자 하나를 쥐었다.',th:{...LOBBY_THEME,aurora:1},hero:1},
];
let proI=0,proT=0,proBG=null,proOn=false;
function startPrologue(done){const el=$('#prologue');el.hidden=false;proOn=true;proI=0;proT=0;if(!proBG){proBG=new BG($('#pbg'));proBG.ground=.16;proBG.horizon=.4;}proBG.theme(PRO[0].th);
 const next=()=>{proI++;proT=0;if(proI>=PRO.length){end();return;}proBG.theme(PRO[proI].th);sfx('buy');};
 const end=()=>{proOn=false;el.hidden=true;el.onclick=null;done();};
 el.onclick=e=>{if(e.target.id==='pskip'){end();return;}next();};}
function drawPrologue(t,dt){if(!proOn)return;proT+=dt;const cv=$('#pfg'),r=$('#prologue').getBoundingClientRect(),w=r.width,h=r.height,q=Math.min(DPR,1.5);
 if(cv.width!==Math.round(w*DPR)||cv.height!==Math.round(h*DPR)){cv.width=w*DPR;cv.height=h*DPR;proBG.resize(Math.round(w*q),Math.round(h*q));}
 const P=PRO[proI];proBG.draw(t,t*.02);const c=cv.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,w,h);
 const gy=h*(1-proBG.ground)-h*.03,s=Math.min(w/380,h/700)*1.2,bx=w*.5,bob=Math.sin(t*1.2)*3;
 if(P.floe){const fw=90*P.floe;c.save();c.translate(bx,gy+bob);c.beginPath();c.ellipse(0,6*s,fw*s,14*s,0,0,TAU);c.fillStyle='#eaf6ff';c.fill();
  if(P.alone){c.strokeStyle='rgba(90,140,190,.8)';c.lineWidth=2;c.beginPath();c.moveTo(-fw*.3*s,2*s);c.lineTo(-fw*.1*s,10*s);c.lineTo(fw*.15*s,4*s);c.stroke();}c.scale(s,s);HERO().draw(c,{t,ph:0,walk:0,atk:-1});c.restore();}
 else if(P.trash){c.save();c.translate(w*.3,h*(1-.2));c.scale(s*.8,s*.8);HERO().draw(c,{t,ph:t*6,walk:1,atk:-1});c.restore();}
 else{c.save();c.translate(bx,gy);c.scale(s*1.3,s*1.3);HERO().draw(c,{t,ph:0,walk:0,atk:Math.min(.99,(proT%2.4)/1.2)});HEROES.bear.swing(c,{t,atk:Math.min(.99,(proT%2.4)/1.2),kind:'melee'});c.restore();}
 const n=Math.min(P.txt.length,Math.floor(proT*14));$('#ptxt').textContent=P.txt.slice(0,n);
 $('#pphint').textContent=proI<PRO.length-1?'화면을 누르면 다음 장면':'화면을 누르면 모험 시작';}
/* naming */
const cleanName=v=>(v||'').replace(/<[^>]*>/g,'').replace(/[<>&"'`]/g,'').trim().slice(0,8);
function askName(cb){modal('백곰의 이름을 지어 주세요',`<input id="nameinp" maxlength="8" value="${S.name||'북실이'}" style="width:100%;height:46px;border-radius:12px;border:2px solid #b8c8e8;padding:0 12px;font:18px var(--f-title);text-align:center;margin-top:6px"><br><small>최대 8글자</small>`,[['결정',()=>{S.name=cleanName($('#nameinp').value)||'북실이';save();updateHud();cb&&cb();},1]]);
 setTimeout(()=>{const i=$('#nameinp');if(i){i.focus();i.select();}},50);}
/* boss victory */
function victory(name,gold,gem){const v=$('#victory');v.querySelector('.vn').textContent=name;v.querySelector('.vr').innerHTML=`<span>+${fmt(gold)} 골드</span><span>+${gem} 보석</span>`;v.hidden=false;v.classList.remove('go');void v.offsetWidth;v.classList.add('go');
 clearTimeout(v._t);v._t=setTimeout(()=>v.hidden=true,2600);v.onclick=()=>v.hidden=true;}
/* sleeping bear for the AFK popup: lying on its back, limbs spread, zZz */
function sleepCanvas(){const cv=document.createElement('canvas');cv.width=320;cv.height=150;cv.style.cssText='width:100%;max-width:260px;display:block;margin:4px auto 0';const c=cv.getContext('2d');let t0=performance.now();
 const draw=()=>{if(!cv.isConnected){if(!cv._on)requestAnimationFrame(draw);return;}cv._on=1;requestAnimationFrame(draw);const t=(performance.now()-t0)/1000,br=Math.sin(t*1.5)*2;c.clearRect(0,0,320,150);
  const g=c.createLinearGradient(0,90,0,150);g.addColorStop(0,'#cfe6fa');g.addColorStop(1,'#9cc8ea');c.fillStyle=g;c.beginPath();c.ellipse(160,118,140,26,0,0,TAU);c.fill();
  c.save();c.translate(160,108);const limb=(x,y,a,l,w)=>()=>limbPath(c,x,y,a,l,w,w*.75,0);
  const parts=[limb(-40,-10,-2.3,26,10),limb(40,-10,2.3,26,10),limb(-34,4,-1.2,24,11),limb(36,4,1.2,24,11),
   ()=>{c.beginPath();c.ellipse(0,-6-br*.5,50,26+br*.3,0,0,TAU);},()=>{c.beginPath();c.ellipse(-62,-16,22,19,-.4,0,TAU);c.moveTo(-70,-38);c.arc(-74,-36,6,0,TAU);}];
  c.lineJoin='round';for(const p of parts){p();c.lineWidth=2.4;c.strokeStyle=FUR.line;c.stroke();}for(const p of parts){p();c.fillStyle=furGrad(c,-40,20);c.fill();}
  ell(c,0,-14-br*.4,30,13);c.fillStyle='rgba(255,255,255,.55)';c.fill();
  c.strokeStyle='#211a14';c.lineWidth=1.6;c.beginPath();c.arc(-64,-22,3,.2,Math.PI-.2);c.stroke();ell(c,-80,-8,3.4,2.8);c.fillStyle='#141010';c.fill();
  c.beginPath();c.moveTo(-76,-3);c.quadraticCurveTo(-72,1,-68,-2);c.stroke();c.restore();
  c.fillStyle='#5a7aa8';c.font='bold 16px Jal,sans-serif';for(let i=0;i<3;i++){const k=(t*.5+i/3)%1;c.globalAlpha=1-k;c.fillText('Z',70+i*14+k*20,60-k*40-i*6);}c.globalAlpha=1;};
 draw();return cv;}
