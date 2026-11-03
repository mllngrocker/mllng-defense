/* ---------- HD vector art: helpers + polar bear + monster archetypes (part 1) ----------
 Every draw fn gets (c, m): c = 2D context translated to the feet point (units: bear ≈ 110 tall), facing right for the bear
 and facing LEFT for monsters. m = {t, ph walk phase, atk 0..1 or -1, a: accent, b: main, sub}. */
const OL='rgba(24,34,62,.92)';
const _shc={};
function shade(h,a){const k=h+a;if(_shc[k])return _shc[k];const[r,g,b]=hexRGB(h);const f=v=>Math.round(clamp(a<0?v*(1+a):v+(1-v)*a,0,1)*255);return _shc[k]=`rgb(${f(r)},${f(g)},${f(b)})`;}
function rgrad(c,x,y,r,base){if(G)base=sick(base);const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.15);g.addColorStop(0,shade(base,.45));g.addColorStop(.45,base);g.addColorStop(1,shade(base,-.35));return g;}
function lgrad(c,y0,y1,base){if(G)base=sick(base);const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(base,.3));g.addColorStop(1,shade(base,-.3));return g;}
function ell(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,0,TAU);}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function fs(c,fill,lw=2.6){c.fillStyle=typeof fill==='string'&&G&&fill[0]==='#'?sick(fill):fill;c.fill();if(lw){c.lineWidth=G?lw*.65:lw;c.strokeStyle=G?'rgba(28,22,14,.92)':OL;c.lineJoin='round';c.stroke();}}
function gloss(c,x,y,rx,ry,a=.55){ell(c,x,y,rx,ry,-.5);c.fillStyle=G?`rgba(230,240,180,${a*.6})`:`rgba(255,255,255,${a})`;c.fill();}
// cute eye; look = x direction of pupil; angry adds a brow
function eye(c,x,y,r,look=-1,angry=0,blink=0){if(G){grossEye(c,x,y,r,look);return;}
 if(blink>.5){c.beginPath();c.moveTo(x-r,y);c.quadraticCurveTo(x,y+r*.5,x+r,y);c.lineWidth=2.2;c.strokeStyle=OL;c.stroke();return;}
 ell(c,x,y,r,r*1.1);fs(c,'#fff',2);ell(c,x+look*r*.3,y+r*.1,r*.62,r*.72);c.fillStyle='#1a2140';c.fill();
 ell(c,x+look*r*.3-r*.22,y-r*.18,r*.22,r*.22);c.fillStyle='#fff';c.fill();
 if(angry){c.beginPath();c.moveTo(x-r*1.1*-look,y-r*1.25);c.lineTo(x+r*1.1*-look,y-r*.75);c.lineWidth=3;c.lineCap='round';c.strokeStyle=OL;c.stroke();}
}
function mouth(c,x,y,w,open=0){if(G){grossMouth(c,x,y,w,open,performance.now()/1000);return;}c.beginPath();if(open>0){ell(c,x,y,w*.6,w*.45*open);c.fillStyle='#4a1a2a';c.fill();c.lineWidth=2;c.strokeStyle=OL;c.stroke();}
 else{c.moveTo(x-w*.5,y);c.quadraticCurveTo(x,y+w*.35,x+w*.5,y);c.lineWidth=2.2;c.lineCap='round';c.strokeStyle=OL;c.stroke();}}
function fang(c,x,y,s=1){c.beginPath();c.moveTo(x-3*s,y);c.lineTo(x,y+5*s);c.lineTo(x+3*s,y);c.fillStyle=G?'#d8c87a':'#fff';c.fill();}
const ease=t=>1-Math.pow(1-t,3);
/* one silhouette, like the bear: run `fn` twice. Pass 1 shows only the outlines of filled shapes (everything else is
 invisible); pass 2 draws everything except those outlines, so overlapping body parts share a single outer outline.
 Thin strokes (< 1.4, e.g. eyes, teeth, stitches) and stroke-only lines are kept as drawn. */
const _GA=Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype,'globalAlpha');
function oneSil(c,fn){const P=CanvasRenderingContext2D.prototype;let filled=false;
 const body=()=>filled&&c.lineWidth>=1.4;
 c.beginPath=function(){filled=false;return P.beginPath.call(this);};
 try{
  c.save();_GA.set.call(c,0);Object.defineProperty(c,'globalAlpha',{configurable:true,get(){return 1;},set(){}});
  c.fill=function(...a){filled=true;};
  c.stroke=function(...a){if(!body())return;const op=this.globalCompositeOperation;_GA.set.call(this,1);this.globalCompositeOperation='source-over';P.stroke.apply(this,a);this.globalCompositeOperation=op;_GA.set.call(this,0);};
  try{fn();}finally{delete c.globalAlpha;c.restore();}
  c.fill=function(...a){filled=true;return P.fill.apply(this,a);};
  c.stroke=function(...a){if(body())return;return P.stroke.apply(this,a);};
  fn();
 }finally{delete c.beginPath;delete c.fill;delete c.stroke;}}

/* ---------- monsters (face left) ---------- */
const ART={};
ART.slime=(c,m)=>{const t=m.t,sq=Math.sin(t*5+m.seed)*.08,b=m.b,a=m.a;
 if(m.sub==='tumble'){c.save();c.translate(0,-30);c.rotate(-t*4);ell(c,0,0,30,30);c.fillStyle='rgba(200,160,96,.25)';c.fill();c.strokeStyle=shade(b,-.2);c.lineWidth=2.4;
  for(let i=0;i<14;i++){c.beginPath();const r=10+i*1.4;c.arc(Math.sin(i*2)*4,Math.cos(i*3)*4,r,i,i+2.6);c.stroke();}c.restore();eye(c,-10,-34,5,-1,1);eye(c,6,-34,5,-1,1);return;}
 c.save();c.scale(1+sq,1-sq);c.beginPath();c.moveTo(-34,0);c.bezierCurveTo(-36,-30,-18,-52,0,-52);c.bezierCurveTo(18,-52,36,-30,34,0);c.quadraticCurveTo(0,6,-34,0);fs(c,rgrad(c,-4,-28,38,b));
 ell(c,-12,-38,10,6);c.fillStyle='rgba(255,255,255,.6)';c.fill();ell(c,-22,-28,3,3);c.fillStyle='rgba(255,255,255,.5)';c.fill();
 for(let i=0;i<3;i++){ell(c,14-i*9,-6+Math.sin(t*3+i)*2,3,3);c.fillStyle=shade(a,.1);c.globalAlpha=.6;c.fill();c.globalAlpha=1;}
 eye(c,-14,-26,6,-1,1,0);eye(c,4,-26,6,-1,1,0);mouth(c,-6,-12,10,m.atk>=0?.8:0);c.restore();};
ART.jelly=(c,m)=>{const t=m.t,b=m.b,a=m.a,bob=Math.sin(t*2.5+m.seed)*5;c.save();c.translate(0,-40+bob);
 for(let i=0;i<5;i++){c.beginPath();const x=-16+i*8;c.moveTo(x,0);for(let k=1;k<=6;k++)c.lineTo(x+Math.sin(t*4+k*.9+i)*4,k*6);c.lineWidth=3;c.strokeStyle=i%2?a:shade(b,-.15);c.lineCap='round';c.stroke();}
 c.beginPath();c.moveTo(-26,2);c.bezierCurveTo(-30,-26,-14,-38,0,-38);c.bezierCurveTo(14,-38,30,-26,26,2);c.quadraticCurveTo(0,8,-26,2);c.globalAlpha=.85;fs(c,rgrad(c,0,-16,30,b));c.globalAlpha=1;
 c.beginPath();c.moveTo(-10,-37);c.bezierCurveTo(-14,-52,-2,-54,-3,-38);c.moveTo(10,-37);c.bezierCurveTo(14,-52,2,-54,3,-38);c.lineWidth=3;c.strokeStyle=shade(b,-.25);c.stroke(); // bag handles
 gloss(c,-12,-24,7,4);c.fillStyle=a;c.globalAlpha=.5;c.font='bold 9px sans-serif';c.fillText('♻',4,-6);c.globalAlpha=1;
 eye(c,-11,-14,5,-1,1);eye(c,5,-14,5,-1,1);mouth(c,-4,-4,7,m.atk>=0?.8:0);c.restore();};
ART.crab=(c,m)=>{const t=m.t,ph=m.ph,b=m.b,a=m.a,sub=m.sub;
 for(let i=0;i<3;i++){const x=-14+i*14,lift=Math.max(0,Math.sin(ph+i*2))*5;c.beginPath();c.moveTo(x,-14);c.quadraticCurveTo(x-8,-14-lift,x-12,-lift);c.lineWidth=4;c.lineCap='round';c.strokeStyle=OL;c.stroke();c.lineWidth=2.2;c.strokeStyle=shade(b,-.1);c.stroke();}
 if(sub==='scorp'){c.save();c.translate(26,-26);const tw=Math.sin(t*3)*.1;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(22,-8,28,-40,6,-52+tw*20);c.lineWidth=12;c.strokeStyle=OL;c.stroke();c.lineWidth=8;c.strokeStyle=b;c.stroke();
  c.beginPath();c.moveTo(6,-52);c.lineTo(-8,-46);c.lineTo(2,-60);c.closePath();fs(c,a,2);c.restore();}
 if(sub==='can'){rr(c,-26,-44,52,34,9);fs(c,lgrad(c,-44,-10,b));rr(c,-26,-32,52,8,0);c.fillStyle=a;c.fill();c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.moveTo(-20,-40);c.lineTo(-20,-16);c.stroke();
  ell(c,0,-44,26,5);fs(c,shade(a,-.1),2);ell(c,6,-46,6,2.5);c.strokeStyle=OL;c.lineWidth=1.6;c.stroke();}
 else if(sub==='shell'){ell(c,0,-24,26,16);fs(c,rgrad(c,0,-24,26,shade(b,.1)));c.save();c.translate(8,-42);ell(c,0,0,22,20);fs(c,rgrad(c,0,0,22,a));
  c.beginPath();for(let k=0;k<26;k++){const r=k*.75,an=k*.55;c.lineTo(Math.cos(an)*r,Math.sin(an)*r);}c.lineWidth=2;c.strokeStyle=shade(a,-.4);c.stroke();c.restore();}
 else{ell(c,0,-26,30,19);fs(c,rgrad(c,0,-26,30,b));gloss(c,-8,-36,10,4,sub==='tar'?.75:.45);}
 // claws
 const cl=m.atk>=0?Math.sin(m.atk*Math.PI)*.5:Math.sin(t*3)*.08;
 for(const[dx,dy,s] of[[-30,-30,1],[-24,-18,.8]]){c.save();c.translate(dx,dy);c.rotate(-.3-cl);c.scale(s,s);ell(c,-10,0,11,8);fs(c,rgrad(c,-10,0,11,sub==='can'?a:b));
  c.beginPath();c.moveTo(-20,-2);c.lineTo(-10,0);c.lineTo(-20,4);c.strokeStyle=OL;c.lineWidth=2;c.stroke();c.restore();}
 for(const x of[-12,0]){c.beginPath();c.moveTo(x,-42);c.lineTo(x-2,-54);c.lineWidth=3;c.strokeStyle=OL;c.stroke();eye(c,x-2,-56,5,-1,1);}
 mouth(c,-14,-28,8,m.atk>=0?.6:0);};
ART.bird=(c,m)=>{const t=m.t,b=m.b,a=m.a,sub=m.sub,fl=Math.sin(t*(sub==='bug'?40:9)+m.seed),bob=Math.sin(t*2+m.seed)*4;c.save();c.translate(0,-62+bob);
 if(sub==='bug'){ // drone / cctv / moth / mosquito: round body, rotor or wings
  const isCam=m.id==='cctv'||m.id==='deye',isMoth=m.id==='moth'||m.id==='mosquito';
  if(isMoth){for(const s of[1,-1]){c.save();c.scale(1,s*(.4+.6*Math.abs(fl)));ell(c,6,-16,16,20,.4);c.globalAlpha=.8;fs(c,rgrad(c,6,-16,18,b),2);c.globalAlpha=1;ell(c,6,-18,5,5);c.fillStyle=a;c.fill();c.restore();}
   if(m.id==='mosquito'){c.beginPath();c.moveTo(-14,2);c.lineTo(-34,8);c.lineWidth=2.4;c.strokeStyle=OL;c.stroke();}}
  else{c.fillStyle=OL;c.fillRect(-2,-26,4,12);ell(c,0,-27,26*Math.abs(fl)+4,3);c.fillStyle='rgba(220,230,255,.7)';c.fill();}
  ell(c,0,0,18,15);fs(c,rgrad(c,0,0,18,b));
  if(isCam){ell(c,-8,0,11,11);fs(c,'#1a1a24',2);ell(c,-10,0,6,6);c.fillStyle=a;c.fill();ell(c,-10,0,10,10);c.fillStyle='rgba(255,60,80,.18)';c.fill();ell(c,-12,-3,2,2);c.fillStyle='#fff';c.fill();}
  else{eye(c,-8,-3,5,-1,1);eye(c,4,-3,4.5,-1,1);ell(c,8,8,4,4);c.fillStyle=a;c.fill();}
  c.restore();return;}
 const wing=sub==='bat'?shade(b,-.25):shade(b,-.08);
 c.save();c.translate(4,-6);c.rotate(-.4+fl*.7);c.beginPath();c.moveTo(0,0);
 if(sub==='bat'){c.lineTo(10,-26);c.lineTo(18,-14);c.lineTo(26,-22);c.lineTo(28,-4);c.closePath();}else{c.quadraticCurveTo(14,-30,34,-18);c.quadraticCurveTo(18,-10,0,4);}
 fs(c,wing);c.restore();
 ell(c,4,0,20,14);fs(c,rgrad(c,4,0,20,b));c.beginPath();c.moveTo(22,0);c.lineTo(34,-6);c.lineTo(32,6);c.closePath();fs(c,shade(b,-.1),2);
 ell(c,-12,-8,13,12);fs(c,rgrad(c,-12,-8,13,b));
 if(sub==='bat'){c.beginPath();c.moveTo(-18,-16);c.lineTo(-16,-28);c.lineTo(-10,-18);fs(c,b,2);fang(c,-20,-2,.9);}
 else{c.beginPath();c.moveTo(-22,-8);c.lineTo(-36,-4);c.lineTo(-22,-1);c.closePath();fs(c,a,2);}
 eye(c,-14,-11,5,-1,1);
 c.save();c.translate(4,-6);c.rotate(.2-fl*.7);c.beginPath();c.moveTo(0,0);
 if(sub==='bat'){c.lineTo(8,-28);c.lineTo(16,-16);c.lineTo(24,-24);c.lineTo(26,-4);c.closePath();}else{c.quadraticCurveTo(12,-32,30,-22);c.quadraticCurveTo(16,-10,0,4);}
 fs(c,rgrad(c,10,-14,18,wing));c.restore();c.restore();};
