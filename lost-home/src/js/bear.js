/* ---------- realistic upright polar bear (faces right, feet at y=0, ~130 units tall) ----------
 One silhouette: every body part's outline is drawn first, then all fills on top,
 so there are no lines between limbs/torso/head. Depth comes from soft shadows only.
 m: {t, ph walk phase, walk 0..1, atk 0..1 or -1} */
function bearRand(seed){let s=seed;return()=>{s=(s*16807)%2147483647;return s/2147483647;};}
const FUR={hi:'#fffdf6',mid:'#f0e8d4',lo:'#c9bea4',line:'rgba(74,62,50,.85)'};
function furGrad(c,y0,y1,dark=0){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(FUR.hi,-dark));g.addColorStop(.5,shade(FUR.mid,-dark));g.addColorStop(1,shade(FUR.lo,-dark));return g;}
function furStrokes(c,x0,y0,x1,y1,n,seed,ang){const r=bearRand(seed);c.lineCap='round';
 for(let i=0;i<n;i++){const x=x0+r()*(x1-x0),y=y0+r()*(y1-y0),l=3+r()*5,a=ang+(r()-.5)*.7,light=r()<.55;
  c.strokeStyle=light?'rgba(255,255,255,.5)':'rgba(135,122,100,.26)';c.lineWidth=light?1.1:.9;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+1,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}}
// tapered limb pointing in direction A (0 = down, + = forward), with a paw/foot at the end
function limbPath(c,x,y,A,len,w0,w1,foot){c.save();c.translate(x,y);c.rotate(-A);c.beginPath();
 c.moveTo(-w0,0);c.quadraticCurveTo(-w0*1.1,len*.5,-w1,len);
 if(foot){c.quadraticCurveTo(-w1-1,len+w1*.9,w1*.4,len+w1*.95);c.quadraticCurveTo(w1*2.6,len+w1,w1*2.4,len+w1*.1);c.quadraticCurveTo(w1*1.8,len-w1*.6,w1,len-2);}
 else c.arc(0,len,w1*1.15,Math.PI,0,true);
 c.quadraticCurveTo(w0*1.1,len*.5,w0,0);c.arc(0,0,w0,0,Math.PI,true);c.closePath();c.restore();}
// pose keys per weapon kind: a = upper-arm angle, w = weapon angle (0 down, + forward); p = [wind-up end, strike end]
const BEAR_KEYS={melee:{rest:{a:.55,w:Math.PI+.35},wind:{a:Math.PI-.45,w:Math.PI+1.25},hit:{a:.95,w:1.35},p:[.3,.52]},
 throw:{rest:{a:.55,w:Math.PI+.35},wind:{a:Math.PI-.25,w:Math.PI+1.3},hit:{a:1.7,w:1},p:[.32,.48]},
 magic:{rest:{a:.95,w:Math.PI/2+.5},wind:{a:1.95,w:Math.PI/2+.1},hit:{a:1.45,w:Math.PI/2+.25},p:[.38,.52]},
 gun:{rest:{a:1.3,w:Math.PI/2-.05},wind:{a:1.48,w:Math.PI/2+.32},hit:{a:1.3,w:Math.PI/2-.05},p:[.06,.14]}};
function bearPose(m){const t=m.t||0,kind=m.kind||'melee',k=BEAR_KEYS[kind],[p0,p1]=k.p,ls=kind==='gun'?.25:1;let a,w,lean=0;
 if(m.atk>=0){const p=m.atk;
  if(p<p0){const e=ease(p/p0);a=lerp(k.rest.a,k.wind.a,e);w=lerp(k.rest.w,k.wind.w,e);lean=-.08*e*ls;}
  else if(p<p1){const e=ease((p-p0)/(p1-p0));a=lerp(k.wind.a,k.hit.a,e);w=lerp(k.wind.w,k.hit.w,e);lean=lerp(-.08,.16,e)*ls;}
  else{const e=ease((p-p1)/(1-p1));a=lerp(k.hit.a,k.rest.a,e);w=lerp(k.hit.w,k.rest.w,e);lean=.16*(1-e)*ls;}}
 else{a=k.rest.a+Math.sin(t*2)*.04;w=k.rest.w+Math.sin(t*2)*.03;}
 return{a,w,lean};}
function drawBear(c,m){
 const t=m.t||0,ph=m.ph||0,walk=m.walk||0,br=Math.sin(t*2)*.8,{a,w,lean}=bearPose(m);
 const bob=Math.abs(Math.cos(ph))*2.5*walk,sw=Math.sin(ph)*.5*walk;
 c.save();c.rotate(lean+.12);c.translate(0,-bob);
 const SH=[10,-90],HD=[14,-100];
 const paw=[SH[0]+Math.sin(a)*34,SH[1]+Math.cos(a)*34];
 const parts=[
  {p:()=>limbPath(c,-9,-30,-sw*.9,24,12,8.5,1),d:.14,y:[-34,0]},              // far leg
  {p:()=>limbPath(c,-2,-94,.25-sw*.3+(m.atk>=0?a*.2:0),30,9,7),d:.14,y:[-94,-60]}, // far arm
  {p:()=>{c.beginPath();c.moveTo(-24,-26);c.bezierCurveTo(-40,-44,-40,-80,-28,-98);c.bezierCurveTo(-20,-112,-2,-116,10,-112);
    c.bezierCurveTo(22,-108,30,-92,30,-74);c.bezierCurveTo(30,-50,24,-30,8,-22);c.bezierCurveTo(-6,-18,-18,-20,-24,-26);c.closePath();
    c.moveTo(4,-30);c.ellipse(-8,-32,17,20,.2,0,TAU);},d:0,y:[-116,-14],torso:1},
  {p:()=>limbPath(c,3,-30,sw*.9,24,13,9,1),d:0,y:[-34,0]},                  // near leg
  {p:()=>{c.save();c.translate(HD[0],HD[1]+br*.3);c.scale(1.15,1.15);c.beginPath();c.moveTo(-15,-2);c.bezierCurveTo(-17,-17,-2,-25,10,-21);c.bezierCurveTo(15,-18,19,-14,23,-10);
    c.bezierCurveTo(30,-6.5,33,2,28,6.5);c.bezierCurveTo(23,10,16,9.5,10,7.5);c.bezierCurveTo(0,8,-13,6,-15,-2);c.closePath();c.moveTo(1,-20);c.arc(-3,-20,4.8,0,TAU);c.restore();},d:0,y:[-131,-98],head:1},
  {p:()=>limbPath(c,SH[0],SH[1],a,34,13,8.5),d:0,y:[-100,-50],arm:1},          // near arm
 ];
 // 1) one outline under everything
 c.lineJoin='round';for(const q of parts){q.p();c.lineWidth=2.4;c.strokeStyle=FUR.line;c.stroke();}
 // 2) fills
 for(const q of parts){
  if(q.arm&&!(m.kind==='throw'&&m.atk>.45&&m.atk<.95)){c.save();c.translate(paw[0],paw[1]);c.rotate(-(w-Math.PI));drawWeapon(c,curWeapon(),t);c.restore();}
  q.p();c.save();if(q.head){c.shadowColor='rgba(90,100,125,.3)';c.shadowBlur=6;c.shadowOffsetY=2;}
  c.fillStyle=furGrad(c,q.y[0],q.y[1],q.d);c.fill();c.restore();
  c.save();q.p();c.clip();furStrokes(c,-40,q.y[0],46,q.y[1],q.torso?150:q.head?40:26,q.y[0]*13+q.d*99,q.torso?1.2:q.head?.25:1.5);
  if(q.torso){const g=c.createLinearGradient(0,-60,0,-24);g.addColorStop(0,'rgba(120,132,156,0)');g.addColorStop(1,'rgba(110,122,150,.4)');c.fillStyle=g;c.fillRect(-40,-60,80,40);
   const r=c.createLinearGradient(-36,0,-18,0);r.addColorStop(0,'rgba(255,255,255,.75)');r.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=r;c.fillRect(-40,-110,22,85);}
  if(q.head){const g=c.createRadialGradient(HD[0]+27,HD[1]+2,1,HD[0]+24,HD[1]+2,11);g.addColorStop(0,'rgba(120,100,80,.35)');g.addColorStop(1,'rgba(120,100,80,0)');c.fillStyle=g;c.fillRect(HD[0]+15,HD[1]-12,30,24);}
  c.restore();
  if(q.head){c.save();c.translate(HD[0],HD[1]+br*.3);c.scale(1.15,1.15);face(c,0,0,m);c.restore();}
 }
 // gun muzzle flash / magic circle at the paw
 if(m.kind==='gun'&&m.atk>=0&&m.atk<.16){const tx=paw[0]+Math.sin(w)*50,ty=paw[1]+Math.cos(w)*50,k=1-m.atk/.16;c.save();c.globalCompositeOperation='lighter';c.translate(tx,ty);c.rotate(Math.PI/2-w);
  for(let i=0;i<3;i++){c.beginPath();c.moveTo(0,0);c.lineTo(18*k,-5+i*5);c.lineTo(6*k,0);c.closePath();c.fillStyle=`rgba(255,${200+i*20},120,${.9*k})`;c.fill();}ell(c,0,0,7*k,7*k);c.fillStyle=`rgba(255,250,220,${k})`;c.fill();c.restore();}
 if(m.kind==='magic'&&m.atk>=.1&&m.atk<.7){const k=Math.sin((m.atk-.1)/.6*Math.PI),col=curWeapon().col,cx=paw[0]+14,cy=paw[1]-6;c.save();c.globalCompositeOperation='lighter';c.translate(cx,cy);c.rotate(t*2);
  c.strokeStyle=shade(col,.4);c.lineWidth=1.6;c.globalAlpha=k;c.beginPath();c.arc(0,0,14*k,0,TAU);c.stroke();c.beginPath();c.arc(0,0,9*k,0,TAU);c.stroke();
  for(let i=0;i<6;i++){const an=i*TAU/6;c.beginPath();c.moveTo(Math.cos(an)*9*k,Math.sin(an)*9*k);c.lineTo(Math.cos(an+2.1)*9*k,Math.sin(an+2.1)*9*k);c.stroke();}c.restore();}
 c.restore();
 return{sx:SH[0],sy:SH[1],a,w,lean};
}
function face(c,x,y,m){
 ell(c,x-3,y-20,2.4,2);c.fillStyle='rgba(95,80,70,.55)';c.fill(); // inner ear
 ell(c,x+14,y-12,1.9,1.7,-.2);c.fillStyle='#1b130d';c.fill();ell(c,x+13.5,y-12.6,.65,.55);c.fillStyle='rgba(255,255,255,.9)';c.fill();
 const open=m.atk>=0?Math.max(0,Math.sin(Math.min(1,m.atk/.6)*Math.PI))*5:0;
 if(open>.6){c.beginPath();c.moveTo(x+27,y+4.5);c.quadraticCurveTo(x+21,y+9+open,x+16,y+6.5);c.quadraticCurveTo(x+21,y+7,x+27,y+4.5);c.fillStyle='#4a1d1d';c.fill();
  for(const dx of[24,20]){c.beginPath();c.moveTo(x+dx,y+5.5);c.lineTo(x+dx-1,y+8);c.lineTo(x+dx-2,y+5.8);c.fillStyle='#f4efe2';c.fill();}}
 c.beginPath();c.moveTo(x+27.5,y+3.8);c.bezierCurveTo(x+26.5,y+7,x+22.5,y+7.8,x+19.5,y+6.4);c.quadraticCurveTo(x+18.2,y+5.8,x+18,y+4.8);c.lineWidth=1.5;c.lineCap='round';c.strokeStyle='#211a14';c.stroke();
 ell(c,x+28.3,y-.6,3.6,3.1,.2);const ng=c.createRadialGradient(x+27.3,y-1.6,.3,x+28.3,y-.6,4);ng.addColorStop(0,'#5a5450');ng.addColorStop(.4,'#141010');ng.addColorStop(1,'#050404');c.fillStyle=ng;c.fill();
}
// glowing swing trail that follows the real weapon tip over the last part of the swing; call right after drawBear
function swingPts(p,t){const ps=bearPose({atk:p,t,kind:'melee'}),r=ps.lean+.12,cr=Math.cos(r),sr=Math.sin(r);
 const ax=10+Math.sin(ps.a)*34,ay=-90+Math.cos(ps.a)*34,dx=Math.sin(ps.w),dy=Math.cos(ps.w);
 const rot=(x,y)=>[x*cr-y*sr,x*sr+y*cr];return[rot(ax+dx*64,ay+dy*64),rot(ax+dx*18,ay+dy*18)];}
function drawSwing(c,m){if((m.kind&&m.kind!=='melee')||!(m.atk>=.32&&m.atk<.8))return;
 const p1=Math.min(m.atk,.52),p0=Math.max(.3,p1-.2),fade=m.atk<.52?1:1-(m.atk-.52)/.28;if(p1-p0<.01)return;
 const N=16,out=[],inn=[];for(let i=0;i<=N;i++){const k=i/N,[o,n]=swingPts(p0+(p1-p0)*k,m.t);out.push(o);inn.push([lerp(o[0],n[0],Math.pow(k,.7)),lerp(o[1],n[1],Math.pow(k,.7))]);}
 const poly=(A,B)=>{c.beginPath();c.moveTo(A[0][0],A[0][1]);for(const q of A)c.lineTo(q[0],q[1]);for(let i=B.length-1;i>=0;i--)c.lineTo(B[i][0],B[i][1]);c.closePath();};
 // trail colour follows the weapon grade (C keeps the warm orange)
 const g=curWeapon().g,[r,gg,bb]=g?hexRGB(GCOL[g]).map(v=>Math.round(v*255)):[255,130,35];
 c.save();c.globalCompositeOperation='lighter';
 poly(out,inn);c.shadowColor=`rgb(${r},${gg},${bb})`;c.shadowBlur=18;c.fillStyle=`rgba(${r},${gg},${bb},${.55*fade})`;c.fill();c.shadowBlur=0;
 const mid=out.map((o,i)=>[lerp(o[0],inn[i][0],.45),lerp(o[1],inn[i][1],.45)]);poly(out,mid);c.fillStyle=`rgba(${Math.min(255,r+90)},${Math.min(255,gg+90)},${Math.min(255,bb+90)},${.8*fade})`;c.fill();
 const core=out.map((o,i)=>[lerp(o[0],inn[i][0],.18),lerp(o[1],inn[i][1],.18)]);poly(out,core);c.fillStyle=`rgba(255,255,255,${.95*fade})`;c.fill();
 c.restore();}

/* playable characters: add new heroes here (draw + swing trail); S.hero picks one */
const HEROES={bear:{name:'백곰',draw:drawBear,swing:drawSwing}};
const HERO=()=>HEROES[S.hero]||HEROES.bear;
