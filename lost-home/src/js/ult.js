/* ---------- S급 이상 무기 필살기 (10종) ----------
 Every hit fills the gauge; when full the weapon's ult fires automatically. Each tick hits every monster on screen. */
const ULTS={
 bolt:{n:'고압 낙뢰 꽂기',col:'#fff36a',dur:1.4,ticks:[.3,.6,.9],dmg:5},
 neon:{n:'네온 일섬',col:'#ff3ad8',dur:1.2,ticks:[.55],dmg:15},
 rainbow:{n:'무지개 대폭발',col:'#ff7ad8',dur:1.6,ticks:[.45,.75,1.05],dmg:6},
 holy:{n:'성스러운 심판',col:'#fff2a0',dur:1.8,ticks:[.6,.9,1.2,1.5],dmg:7},
 deadeye:{n:'데드아이',col:'#ff4a4a',dur:1.7,ticks:[.7,.82,.94,1.06,1.18,1.3],dmg:3},
 rail:{n:'전자기 관통포',col:'#5af0ff',dur:1.4,ticks:[.45,.6,.75,.9],dmg:5},
 shadow:{n:'그림자 분신술',col:'#a04aff',dur:1.6,ticks:[.45,.65,.85,1.05,1.25],dmg:3.5},
 kunai:{n:'쿠나이 폭우',col:'#e0e4ee',dur:1.6,ticks:[.4,.55,.7,.85,1,1.15],dmg:3},
 zero:{n:'절대영도',col:'#9fe8ff',dur:2,ticks:[1.45],dmg:18},
 curse:{n:'금단의 저주진',col:'#b04aff',dur:1.8,ticks:[.75,.95,1.15,1.35],dmg:6},
};
const ULT_HITS=12;let ultG=0,ultFx=null;
function ultCharge(){const w=curWeapon();if(!w.ult||ultFx)return;ultG=Math.min(1,ultG+1/ULT_HITS);}
function stepUlt(dt){const w=curWeapon();
 if(!ultFx&&w.ult&&ultG>=1&&!bear.dead&&mobs.some(m=>!m.dead&&m.x<W)){const U=ULTS[w.ult];ultG=0;ultFx={k:w.ult,t:0,i:0,g:w.g};banner(U.n,U.col);sfx('boss');hitstop=.12;shake=8;
  if(w.ult==='zero')for(const m of mobs)if(!m.dead)m.frozen=1.5;}
 if(!ultFx)return;const U=ULTS[ultFx.k];ultFx.t+=dt;
 while(ultFx.i<U.ticks.length&&ultFx.t>=U.ticks[ultFx.i]){ultFx.i++;const dmg=ATK()*U.dmg*(1+.3*(ultFx.g-3));
  for(const m of mobs)if(!m.dead&&m.x<W+20){const crit=Math.random()*100<stat('crit');hitMob(m,dmg*(crit?stat('critd')/100:1),crit);sparks(m.x,m.y-50*K*m.size,10,U.col,360);}shake=Math.max(shake,ultFx.k==='neon'||ultFx.k==='zero'?14:6);}
 if(ultFx.t>=U.dur)ultFx=null;}
function liveMobs(){return mobs.filter(m=>!m.dead&&m.x<W+20);}
function drawUlt(c,t){if(!ultFx)return;const f=ultFx,U=ULTS[f.k],p=f.t/U.dur,col=U.col,M=liveMobs(),fade=p>.85?1-(p-.85)/.15:1;c.save();
 const flash=(a)=>{c.globalCompositeOperation='source-over';c.fillStyle=`rgba(255,255,255,${a})`;c.fillRect(0,0,W,H);};
 const near=k=>U.ticks.reduce((m,x)=>Math.min(m,Math.abs(f.t-x)),9)<k;
 if(f.k==='bolt'){c.fillStyle=`rgba(10,10,40,${.35*fade})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';
  if(near(.08))for(const m of M){c.beginPath();let x=m.x+rnd(-20,20),y=0;c.moveTo(x,y);while(y<m.y-20*K){y+=rnd(14,26)*K;x+=rnd(-14,14)*K;c.lineTo(x,y);}c.lineTo(m.x,m.y-30*K);c.strokeStyle=col;c.lineWidth=4*K;c.shadowColor=col;c.shadowBlur=20;c.stroke();c.strokeStyle='#fff';c.lineWidth=1.5*K;c.stroke();}
  if(near(.04))flash(.25);}
 else if(f.k==='neon'){c.fillStyle=`rgba(20,0,30,${.6*fade})`;c.fillRect(0,0,W,H);const y=GY-55*K;c.globalCompositeOperation='lighter';
  if(f.t<.55){const k=f.t/.55;c.strokeStyle=col;c.lineWidth=2;c.shadowColor=col;c.shadowBlur=14;c.beginPath();c.moveTo(BX,y);c.lineTo(BX+(W-BX)*k,y);c.stroke();}
  else{const k=Math.max(0,1-(f.t-.55)/.5);for(const[w2,a]of[[22,.35],[9,.7],[3,1]]){c.fillStyle=w2===3?`rgba(255,255,255,${a*k})`:`rgba(255,58,216,${a*k})`;c.fillRect(0,y-w2*K*k,W,w2*2*K*k);}if(f.t<.65)flash(.5);}}
 else if(f.k==='rainbow'){c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const k=(f.t-U.ticks[i]+.3);if(k<0||k>.9)continue;const r=k*W*1.1;for(let j=0;j<6;j++){c.beginPath();c.arc(BX,GY-50*K,r-j*7*K,0,TAU);c.strokeStyle=`hsla(${j*55+t*200},95%,65%,${(1-k/.9)*.8})`;c.lineWidth=6*K;c.stroke();}}}
 else if(f.k==='holy'){c.fillStyle=`rgba(255,240,180,${.15*fade})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';for(const m of M){const k=Math.min(1,f.t/.6),w2=(18+Math.sin(t*20)*3)*K;
  const g=c.createLinearGradient(m.x-w2,0,m.x+w2,0);g.addColorStop(0,'rgba(255,240,170,0)');g.addColorStop(.5,`rgba(255,250,220,${.9*fade})`);g.addColorStop(1,'rgba(255,240,170,0)');c.fillStyle=g;c.fillRect(m.x-w2,0,w2*2,GY*k);
  c.beginPath();c.ellipse(m.x,GY,w2*1.6,w2*.4,0,0,TAU);c.strokeStyle=`rgba(255,240,170,${fade})`;c.lineWidth=2;c.stroke();}}
 else if(f.k==='deadeye'){c.fillStyle=`rgba(60,0,0,${.45*fade})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';M.forEach((m,i)=>{const k=Math.min(1,f.t/(.5+i*.04)),r=(40-26*k)*K,y=m.y-ART_H[m.arch]*.5*K*m.size;
  c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.arc(m.x,y,r,0,TAU);c.moveTo(m.x-r-6,y);c.lineTo(m.x+r+6,y);c.moveTo(m.x,y-r-6);c.lineTo(m.x,y+r+6);c.stroke();});if(near(.03))flash(.3);}
 else if(f.k==='rail'){const y=GY-62*K,k=f.t<.4?f.t/.4:fade,hw=(f.t<.4?3:30+8*Math.sin(t*40))*K*k;c.globalCompositeOperation='lighter';
  for(const[m2,a]of[[2,.3],[1,.7],[.35,1]]){c.fillStyle=m2<.5?`rgba(255,255,255,${a*k})`:`rgba(90,240,255,${a*k})`;c.fillRect(BX+20*K,y-hw*m2,W,hw*m2*2);}
  if(f.t<.4){c.beginPath();c.arc(BX+30*K,y,16*K*k,0,TAU);c.fillStyle=`rgba(90,240,255,${.8*k})`;c.fill();}}
 else if(f.k==='shadow'){c.globalCompositeOperation='source-over';for(const[dx,dy]of[[-40,-60],[60,-110],[120,-40]]){c.save();c.globalAlpha=.55*Math.min(1,f.t*4)*fade;c.translate(BX+dx*K,GY+dy*K*.3);c.scale(K*.8,K*.8);c.filter='brightness(0.15) sepia(1) hue-rotate(220deg) saturate(4)';
   HERO().draw(c,{t,atk:(f.t*3)%1,kind:'throw'});c.restore();}
  c.globalCompositeOperation='lighter';for(const m of M)for(let i=0;i<3;i++){const k=((f.t*2+i/3)%1);ell(c,lerp(BX,m.x,k),lerp(GY-80*K,m.y-40*K,k),4*K,4*K);c.fillStyle=col;c.fill();}}
 else if(f.k==='kunai'){c.globalCompositeOperation='source-over';for(let i=0;i<26;i++){const k=((f.t*1.6+i*.137)%1),x=W*(.3+((i*37)%70)/100)+k*40*K,y=-20+k*(GY+20);
   c.save();c.translate(x,y);c.rotate(.45);c.scale(K,K);drawWeapon(c,{shape:'kunai',col:'#c8ccd6'},t);c.restore();}}
 else if(f.k==='zero'){c.fillStyle=`rgba(160,230,255,${.3*fade})`;c.fillRect(0,0,W,H);for(const m of M){const y=m.y-ART_H[m.arch]*.5*K*m.size,r=ART_H[m.arch]*.55*K*m.size;
   c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;c.lineTo(m.x+Math.cos(a)*r*.7,y+Math.sin(a)*r);}c.closePath();c.fillStyle=`rgba(200,245,255,${.45*fade})`;c.fill();c.lineWidth=2;c.strokeStyle=`rgba(255,255,255,${.8*fade})`;c.stroke();}
  if(near(.05))flash(.6);}
 else if(f.k==='curse'){c.fillStyle=`rgba(20,0,30,${.4*fade})`;c.fillRect(0,0,W,H);c.globalCompositeOperation='lighter';for(const m of M){const k=Math.min(1,f.t/.6),r=34*K*k;
   c.save();c.translate(m.x,GY);c.scale(1,.32);c.rotate(t*1.5);c.strokeStyle=col;c.lineWidth=2.5;c.beginPath();c.arc(0,0,r,0,TAU);c.arc(0,0,r*.72,0,TAU);c.stroke();for(let i=0;i<5;i++){const a=i*TAU/5;c.beginPath();c.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72);c.lineTo(Math.cos(a+2.5)*r*.72,Math.sin(a+2.5)*r*.72);c.stroke();}c.restore();
   if(f.t>.7){const h=Math.min(1,(f.t-.7)/.2)*120*K;const g=c.createLinearGradient(0,GY,0,GY-h);g.addColorStop(0,`rgba(176,74,255,${.8*fade})`);g.addColorStop(1,'rgba(176,74,255,0)');c.fillStyle=g;c.fillRect(m.x-14*K,GY-h,28*K,h);}}}
 c.restore();}
