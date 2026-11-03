/* ---------- prologue cutscene, bear naming, boss victory screen, sleeping bear (AFK) ---------- */
const PRO=[
 {txt:'북극의 빙하가 모두 녹아내렸다.',th:{...LOBBY_THEME,sky:['#3a2a5a','#c86a5a','#ffb07a'],sun:['#ffd0a0',.7,.38,.07],aurora:0},floe:1,fx:.5,fy:.62},
 {txt:'집도, 가족도, 얼음 위의 길도 모두 사라졌다.',th:{...LOBBY_THEME,sky:['#0a1428','#1a2a48','#3a5070'],wx:7},floe:.55,alone:1,fx:.5,fy:.62},
 {txt:'떠다니는 쓰레기 사이로, 낯선 땅이 보였다.',th:THEMES[0],gr:.005,hz:.44,trash:1,land:1,fx:.55,fy:.68},
 {txt:'고향을 되찾기 위해, 백곰은 판자 하나를 쥐었다.',th:{...THEMES[0],sky:['#34405e','#7a7486','#e0a888'],sun:['#ffd0a0',.8,.3,.05],rays:.3,sea:'#2a6a98',fog:'#c8a8a0'},gr:.005,hz:.44,trash:1,pick:1,fx:.55,fy:.72},
];
let proI=0,proT=0,proBG=null,proOn=false,proShots=[],proNext=null;
function proScene(){const P=PRO[proI];proBG.theme(P.th);proBG.ground=P.gr||.16;proBG.horizon=P.hz||.4;}
function startPrologue(done){const el=$('#prologue');el.hidden=false;proOn=true;proI=0;proT=0;proShots=[];if(!proBG)proBG=new BG($('#pbg'));proScene();
 const next=()=>{if(proT<.4||$('#prologue').getBoundingClientRect().width<10)return;proShots[proI]=panelShot();proI++;proT=0;if(proI>=PRO.length){end();return;}proScene();sfx('buy');};
 proNext=next;const end=()=>{proOn=false;el.hidden=true;el.onclick=null;done();};
 el.onclick=e=>{if(e.target.id==='pskip'){end();return;}next();};}
/* floating trash: PET bottle, can, plastic bag, tyre, styrofoam — bobbing on the water with a ripple */
function drawJunk(c,type,x,y,s,t,i,rot=0){const b=Math.sin(t*1.6+i*1.7)*2*s,r=rot+Math.sin(t*1.1+i)*.15;c.save();c.translate(x,y+b);
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(0,3*s,16*s,3*s,0,0,TAU);c.fill();c.rotate(r);c.lineJoin='round';const ol=w=>{c.lineWidth=w*s;c.strokeStyle='rgba(30,35,50,.85)';c.stroke();};
 if(type===0){c.rotate(1.3);rr(c,-4*s,-14*s,8*s,18*s,3*s);c.fillStyle='rgba(170,220,255,.8)';c.fill();ol(1.2);rr(c,-2.6*s,-18*s,5.2*s,4*s,1*s);c.fillStyle='#3a7bd5';c.fill();ol(1);c.fillStyle='rgba(60,120,210,.6)';c.fillRect(-4*s,-8*s,8*s,4*s);}
 else if(type===1){rr(c,-9*s,-6*s,18*s,9*s,4*s);c.fillStyle=lgrad(c,-6*s,3*s,'#d83a3a');c.fill();ol(1.2);c.fillStyle='#e8eef6';c.fillRect(-2*s,-6*s,4*s,9*s);}
 else if(type===2){c.beginPath();c.moveTo(-12*s,2*s);c.quadraticCurveTo(-14*s,-10*s,-4*s,-9*s);c.quadraticCurveTo(0,-14*s,5*s,-9*s);c.quadraticCurveTo(14*s,-9*s,12*s,2*s);c.closePath();c.fillStyle='rgba(245,248,255,.75)';c.fill();ol(1);
  c.beginPath();c.moveTo(-5*s,-9*s);c.quadraticCurveTo(-7*s,-16*s,-2*s,-12*s);c.lineWidth=1.4*s;c.strokeStyle='rgba(200,210,230,.9)';c.stroke();}
 else if(type===3){c.beginPath();c.ellipse(0,-2*s,12*s,5*s,0,0,TAU);c.lineWidth=5*s;c.strokeStyle='#1e2028';c.stroke();c.beginPath();c.ellipse(0,-3*s,12*s,5*s,0,Math.PI,TAU);c.lineWidth=1.2*s;c.strokeStyle='rgba(255,255,255,.25)';c.stroke();}
 else{rr(c,-10*s,-7*s,20*s,9*s,1.5*s);c.fillStyle=lgrad(c,-7*s,2*s,'#f4f4f0');c.fill();ol(1);c.fillStyle='rgba(180,170,150,.5)';c.fillRect(-6*s,-5*s,3*s,2*s);c.fillRect(3*s,-3*s,2*s,2*s);}
 c.restore();}
// the "strange land" on the horizon: hazy hills, a factory chimney and a trash heap
function drawLand(c,w,hy,t){c.save();const x0=w*.42,x1=w*1.05;c.beginPath();c.moveTo(x0,hy+2);
 for(let x=x0;x<=x1;x+=6){const k=(x-x0)/(x1-x0);c.lineTo(x,hy-(Math.sin(k*3.2)*14+Math.sin(k*9+1)*5+10)*Math.min(1,k*4));}c.lineTo(x1,hy+2);c.closePath();
 const g=c.createLinearGradient(0,hy-40,0,hy);g.addColorStop(0,'rgba(90,110,140,.9)');g.addColorStop(1,'rgba(150,170,195,.9)');c.fillStyle=g;c.fill();
 const cx=w*.8;c.fillStyle='rgba(80,95,120,.95)';c.fillRect(cx,hy-46,7,32);c.fillRect(cx-16,hy-26,30,14);
 for(let i=0;i<4;i++){const k=(t*.15+i/4)%1;c.fillStyle=`rgba(120,120,130,${.45*(1-k)})`;c.beginPath();c.arc(cx+4+k*20,hy-50-k*36,5+k*12,0,TAU);c.fill();}
 c.fillStyle='rgba(110,100,90,.9)';c.beginPath();c.moveTo(w*.55,hy-6);c.quadraticCurveTo(w*.6,hy-22,w*.66,hy-6);c.closePath();c.fill();c.restore();}
function drawScene(t){const cv=$('#pfg'),r=$('#prologue').getBoundingClientRect(),w=r.width,h=r.height,q=Math.min(DPR,1.5);
 if(cv.width!==Math.round(w*DPR)||cv.height!==Math.round(h*DPR)){cv.width=w*DPR;cv.height=h*DPR;proBG.resize(Math.round(w*q),Math.round(h*q));}
 const P=PRO[proI];proBG.draw(t,t*.02);const c=cv.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);c.clearRect(0,0,w,h);
 const gy=h*(1-proBG.ground)-h*.03,s=Math.min(w/380,h/700)*1.2,bx=w*.5,bob=Math.sin(t*1.2)*3;
 if(P.floe){const fw=90*P.floe;c.save();c.translate(bx,gy+bob);c.beginPath();c.ellipse(0,6*s,fw*s,14*s,0,0,TAU);c.fillStyle='#eaf6ff';c.fill();
  if(P.alone){c.strokeStyle='rgba(90,140,190,.8)';c.lineWidth=2;c.beginPath();c.moveTo(-fw*.3*s,2*s);c.lineTo(-fw*.1*s,10*s);c.lineTo(fw*.15*s,4*s);c.stroke();}c.scale(s,s);HERO().draw(c,{t,ph:0,walk:0,atk:-1,noWeapon:1});c.restore();return;}
 // sea scenes: junk scattered in depth, the bear drifting on a small floe among it
 const hy=h*(1-proBG.horizon),fy=h*.84+bob,fx=P.pick?bx:w*.42+Math.sin(t*.3)*8,junk=[];
 if(P.land)drawLand(c,w,hy,t);
 // seeded random scatter: lone pieces plus a few drifting clumps, each with its own size, tilt and drift
 const R=(i,j)=>{const v=Math.sin(i*127.1+j*311.7)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<46;i++){let x,k;const clump=i%3===0?Math.floor(R(i,9)*4):-1;
  if(clump>=0){x=R(clump,1)*w+(R(i,2)-.5)*70;k=Math.min(1,Math.max(0,R(clump,3)*.9+(R(i,4)-.5)*.12));}else{x=R(i,1)*w;k=R(i,3);}
  k=Math.pow(k,.85);const drift=(P.pick?2:5+R(i,6)*10)*(.4+k);
  junk.push([Math.floor(R(i,5)*5),((x+t*drift)%(w+60)+w+60)%(w+60)-30,lerp(hy+6,h*.99,k),s*(.45+1.15*k)*(.75+R(i,7)*.5),i,(R(i,8)-.5)*2.4]);}
 junk.sort((a,b)=>a[2]-b[2]);for(const j of junk)if(j[2]<fy)drawJunk(c,j[0],j[1],j[2],j[3],t,j[4],j[5]);
 const got=P.pick&&proT>1.5;
 if(P.pick&&!got){const px=fx+62*s,py=fy+4*s+Math.sin(t*2)*2*s;c.save();c.translate(px,py);c.rotate(1.45+Math.sin(t*1.5)*.06);c.scale(s,s);drawWeapon(c,ITEMS.plank,t);c.restore();}
 c.save();c.translate(fx,fy);c.beginPath();c.ellipse(0,6*s,58*s,12*s,0,0,TAU);c.fillStyle='#eaf6ff';c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.ellipse(0,14*s,70*s,6*s,0,0,TAU);c.fill();
 c.scale(s*1.1,s*1.1);HERO().draw(c,P.pick?{t,atk:-1,kind:got?'melee':'gun',noWeapon:!got}:{t,atk:-1,noWeapon:1});c.restore();
 if(got&&proT<2.6){const k=(proT-1.5)/1.1;c.save();c.globalCompositeOperation='lighter';c.translate(fx+18*s,fy-150*s);for(let i=0;i<8;i++){c.rotate(TAU/8);c.fillStyle=`rgba(255,240,170,${.7*(1-k)})`;c.beginPath();c.moveTo(0,0);c.lineTo(46*s*(.5+k),-4*s);c.lineTo(46*s*(.5+k),4*s);c.fill();}c.restore();}
 for(const j of junk)if(j[2]>=fy)drawJunk(c,j[0],j[1],j[2],j[3],t,j[4],j[5]);
 }
/* comic page: the 4 scenes are panels on one page; finished panels stay as frozen shots, the newest one is live */
function proPanels(w,h){const m=10,top=54,bot=h-64,gap=8,H=bot-top-gap*2,cw=(w-m*2-gap)/2;
 return[[m,top,w-m*2,H*.28],[m,top+H*.28+gap,cw,H*.38],[m+cw+gap,top+H*.28+gap,cw,H*.38],[m,top+H*.66+gap*2,w-m*2,H*.34]];}
// cover-crop the full-screen scene around its focus point into rect r
function panelBlit(c,P,r,w,h){const sc=Math.max(r[2]/w,r[3]/h)*1.12,sw=r[2]/sc,sh=r[3]/sc,sx=clamp(P.fx*w-sw/2,0,w-sw),sy=clamp(P.fy*h-sh/2,0,h-sh);
 for(const cv of[$('#pbg'),$('#pfg')]){const kx=cv.width/w,ky=cv.height/h;c.drawImage(cv,sx*kx,sy*ky,sw*kx,sh*ky,r[0],r[1],r[2],r[3]);}}
function caption(c,txt,r,n){c.save();c.font=`${Math.round(clamp(r[2]/17,12,16))}px ${getComputedStyle(document.body).getPropertyValue('--f-title')}`;
 const lines=[];let cur='';for(const ch of txt.slice(0,n)){if(c.measureText(cur+ch).width>r[2]*.86){lines.push(cur);cur='';}cur+=ch;}lines.push(cur);
 const lh=parseInt(c.font)*1.35,bw=Math.min(r[2]-12,Math.max(...lines.map(l=>c.measureText(l).width))+16),bh=lines.length*lh+10;
 if(n>0){c.fillStyle='#fff8e0';c.strokeStyle='#14182a';c.lineWidth=2;c.fillRect(r[0]+6,r[1]+6,bw,bh);c.strokeRect(r[0]+6,r[1]+6,bw,bh);
  c.fillStyle='#14182a';c.textBaseline='top';lines.forEach((l,i)=>c.fillText(l,r[0]+14,r[1]+11+i*lh));}c.restore();}
function panelShot(){const r=$('#prologue').getBoundingClientRect(),R=proPanels(r.width,r.height)[proI],cv=document.createElement('canvas');cv.width=R[2]*DPR;cv.height=R[3]*DPR;
 const c=cv.getContext('2d');c.scale(DPR,DPR);const P=PRO[proI],r0=[0,0,R[2],R[3]];panelBlit(c,P,r0,r.width,r.height);caption(c,P.txt,r0,P.txt.length);return cv;}
function drawPrologue(t,dt){if(!proOn)return;const rc=$('#prologue').getBoundingClientRect();if(rc.width<10||rc.height<10)return;proT+=dt;drawScene(t);
 const cm=$('#pcm'),r=$('#prologue').getBoundingClientRect(),w=r.width,h=r.height;if(cm.width!==Math.round(w*DPR)||cm.height!==Math.round(h*DPR)){cm.width=w*DPR;cm.height=h*DPR;}
 const c=cm.getContext('2d');c.setTransform(DPR,0,0,DPR,0,0);
 // paper with halftone dots
 c.fillStyle='#f3ead6';c.fillRect(0,0,w,h);c.fillStyle='rgba(120,100,70,.12)';for(let y=0;y<h;y+=9)for(let x=(y/9%2)*4.5;x<w;x+=9){c.beginPath();c.arc(x,y,1.3,0,TAU);c.fill();}
 const R=proPanels(w,h),P=PRO[proI],frame=r=>{c.lineWidth=3.5;c.strokeStyle='#14182a';c.strokeRect(r[0],r[1],r[2],r[3]);};
 for(let i=0;i<proI;i++){c.drawImage(proShots[i],R[i][0],R[i][1],R[i][2],R[i][3]);frame(R[i]);}
 // newest panel falls from above the screen into its slot with a small bounce, then the page shakes once
 const r0=R[proI],D=.55,k=Math.min(1,proT/D),e=k<1?1+2.2*Math.pow(k-1,3)+1.2*Math.pow(k-1,2):1,rl=[0,0,r0[2],r0[3]];
 const dy=-(r0[1]+r0[3]+30)*(1-e),rot=(proI%2?.05:-.05)*(1-k),jolt=proT>D&&proT<D+.15?Math.sin((proT-D)*80)*3*(1-(proT-D)/.15):0;
 if(jolt)c.translate(0,jolt);
 c.save();c.translate(r0[0]+r0[2]/2,r0[1]+r0[3]/2+dy);c.rotate(rot);c.translate(-r0[2]/2,-r0[3]/2);
 c.fillStyle='rgba(0,0,0,.25)';c.fillRect(5,6,r0[2],r0[3]);c.save();c.beginPath();c.rect(0,0,r0[2],r0[3]);c.clip();panelBlit(c,P,rl,w,h);
 c.restore();
 caption(c,P.txt,rl,Math.floor(Math.max(0,proT-D)*14));frame(rl);c.restore();if(jolt)c.translate(0,-jolt);
 // the next cut comes down on its own once the caption has been up for a moment; a tap skips ahead
 if(proI<PRO.length-1&&proT>D+P.txt.length/14+1.3)proNext();
 $('#pphint').textContent=proI<PRO.length-1?'화면을 누르면 다음 컷':'화면을 누르면 모험 시작';}
/* naming */
const cleanName=v=>(v||'').replace(/<[^>]*>/g,'').replace(/[<>&"'`]/g,'').trim().slice(0,8);
function askName(cb){modal('백곰의 이름을 지어 주세요',`<input id="nameinp" maxlength="8" value="${S.name||'북실이'}" style="width:100%;height:46px;border-radius:12px;border:2px solid #b8c8e8;padding:0 12px;font:18px var(--f-title);text-align:center;margin-top:6px"><br><small>최대 8글자</small>`,[['결정',()=>{S.name=cleanName($('#nameinp').value)||'북실이';save();updateHud();cb&&cb();},1]],0,1);
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
