<script>
/* ================= HQ icon kit v2 (2x, hand-drawn vector) ================= */
const HO='#1a1020';
const hg=(x,x0,y0,x1,y1,st)=>{const g=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
const hr=(x,cx,cy,r,st)=>{const g=x.createRadialGradient(cx-r*.3,cy-r*.35,r*.05,cx,cy,r);st.forEach((c,i)=>g.addColorStop(i/(st.length-1),c));return g};
const hsh=(x,path,fill,lw)=>{x.beginPath();path();if(lw!==0){x.lineWidth=lw||5;x.strokeStyle=HO;x.stroke()}x.fillStyle=fill;x.fill()};
const hclip=(x,path,fn)=>{x.save();x.beginPath();path();x.clip();fn();x.restore()};
const hglint=(x,cx,cy,s,a)=>{x.save();x.globalAlpha=a==null?1:a;x.fillStyle='#fff';x.beginPath();x.moveTo(cx,cy-s);x.quadraticCurveTo(cx+s*.12,cy-s*.12,cx+s,cy);x.quadraticCurveTo(cx+s*.12,cy+s*.12,cx,cy+s);x.quadraticCurveTo(cx-s*.12,cy+s*.12,cx-s,cy);x.quadraticCurveTo(cx-s*.12,cy-s*.12,cx,cy-s);x.fill();x.restore()};
const hglow=(x,cx,cy,r,col,a)=>{x.save();x.globalAlpha=a==null?1:a;const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.restore()};
const hline=(x,pts,col,w,a)=>{x.save();x.globalAlpha=a==null?1:a;x.strokeStyle=col;x.lineWidth=w;x.beginPath();pts.forEach(([a1,b1],i)=>i?x.lineTo(a1,b1):x.moveTo(a1,b1));x.stroke();x.restore()};
const diag=(x,fn,ox,oy)=>{x.save();x.translate(ox||15,oy||83);x.rotate(-Math.PI/4);fn();x.restore()};
/* render helper: draws at 2x then composites with soft drop shadow */
function hqPaint(draw){const off=document.createElement('canvas');off.width=off.height=192;const o=off.getContext('2d');o.scale(2,2);o.lineJoin='round';o.lineCap='round';draw(o);
  const c=document.createElement('canvas');c.width=c.height=192;const x=c.getContext('2d');x.shadowColor='rgba(12,6,24,.42)';x.shadowOffsetY=5;x.shadowBlur=6;x.drawImage(off,0,0);return c}
function hqInto(cv,draw){const im=typeof draw==='function'?hqPaint(draw):draw;cv.width=cv.height=192;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,192,192);x.drawImage(im,0,0);return cv}

/* ---------- reusable weapon parts (local frame: +x along weapon, -y = lit side) ---------- */
function wrapGrip(x,x0,x1,w,base,wrap){hsh(x,()=>x.roundRect(x0,-w/2,x1-x0,w,w*.35),hg(x,0,-w/2,0,w/2,base),4);
  hclip(x,()=>x.roundRect(x0,-w/2,x1-x0,w,w*.35),()=>{x.strokeStyle=wrap;x.lineWidth=2.2;for(let i=x0-w;i<x1+w;i+=4.5){x.beginPath();x.moveTo(i,-w/2);x.lineTo(i+w,w/2);x.stroke()}x.globalAlpha=.35;x.strokeStyle=HO;for(let i=x0-w+2;i<x1+w;i+=4.5){x.beginPath();x.moveTo(i,-w/2);x.lineTo(i+w,w/2);x.stroke()}})}
function gem(x,cx,cy,r,cols){hsh(x,()=>{x.moveTo(cx,cy-r);x.lineTo(cx+r,cy);x.lineTo(cx,cy+r);x.lineTo(cx-r,cy);x.closePath()},hg(x,cx-r,cy-r,cx+r,cy+r,cols),3);hsh(x,()=>{x.moveTo(cx,cy-r);x.lineTo(cx+r*.45,cy);x.lineTo(cx,cy+r*.1);x.lineTo(cx-r*.45,cy);x.closePath()},'rgba(255,255,255,.55)',0)}
function bevel(x,path,w){hclip(x,path,()=>{x.fillStyle='rgba(255,255,255,.38)';x.fillRect(-20,-w/2-2,200,w*.3);x.fillStyle='rgba(20,10,30,.28)';x.fillRect(-20,w*.22,200,w)})}
function straightBlade(x,b0,L,w,cols,o){o=o||{};const P=()=>{x.moveTo(b0,-w/2);x.lineTo(L-w*.95,-w/2);x.lineTo(L,0);x.lineTo(L-w*.95,w/2);x.lineTo(b0,w/2);x.closePath()};
  if(o.glow){x.save();x.shadowColor=o.glow;x.shadowBlur=16;x.beginPath();P();x.fillStyle=o.glow;x.fill();x.restore()}
  hsh(x,P,hg(x,0,-w/2,0,w/2,cols),5);
  hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.moveTo(b0,-w/2);x.lineTo(L-w*.95,-w/2);x.lineTo(L,0);x.lineTo(b0,0);x.fill();
    if(o.fuller!==false){x.fillStyle='rgba(20,10,40,.35)';x.fillRect(b0+3,-1.6,(L-b0)*.62,3.2);x.fillStyle='rgba(255,255,255,.7)';x.fillRect(b0+3,1.6,(L-b0)*.62,1)}
    if(o.extra)o.extra()});
  hline(x,[[b0+2,-w/2+1.2],[L-w*.95,-w/2+1.2],[L-1.5,0]],'#fff',1.6,.9)}

/* ---------- swords ---------- */
const HQW={};
HQW.katana=x=>{hglow(x,52,46,46,'rgba(255,90,220,.35)');diag(x,()=>{const b0=26,L=96,w=12;
  const P=()=>{x.moveTo(b0,-w/2);x.quadraticCurveTo(64,-w/2-4,L,-9);x.quadraticCurveTo(66,w/2-2,b0,w/2);x.closePath()};
  x.save();x.shadowColor='#ff4adf';x.shadowBlur=18;x.beginPath();P();x.fillStyle='#ff4adf';x.fill();x.restore();
  hsh(x,P,hg(x,0,-w/2,0,w/2,['#ffffff','#e6e0ff','#8a7ab8']),4.5);
  hclip(x,P,()=>{x.fillStyle='#ffffff';x.beginPath();x.moveTo(b0,1);for(let i=0;i<=12;i++){const xx=b0+i*(L-b0)/12;x.lineTo(xx,1.2+Math.sin(i*1.7)*1.2-(xx-b0)*.06)}x.lineTo(L,10);x.lineTo(b0,10);x.fill();
    x.strokeStyle='#5ff4ff';x.lineWidth=1.6;x.shadowColor='#5ff4ff';x.shadowBlur=6;x.beginPath();x.moveTo(b0,w/2-1.4);x.quadraticCurveTo(66,w/2-3.4,L-2,-8);x.stroke()});
  hsh(x,()=>x.ellipse(b0-2,0,4,11,0,0,7),hg(x,0,-11,0,11,['#ff8ae0','#a02a90','#3a0a40']),4);x.fillStyle='#ffd23a';x.beginPath();x.arc(b0-2,-6,1.4,0,7);x.arc(b0-2,6,1.4,0,7);x.fill();
  wrapGrip(x,-4,b0-6,7,['#2a1a3a','#120a1a'],'#f0e8ff');hsh(x,()=>x.roundRect(-8,-4.5,6,9,2),hg(x,0,-4,0,4,['#ff8ae0','#a02a90']),3)});hglint(x,74,20,6);hglint(x,58,40,3.5)};
HQW.lava=x=>{hglow(x,56,40,44,'rgba(255,110,20,.45)');diag(x,()=>{const b0=24,L=96,w=17;
  const P=()=>{x.moveTo(b0,-w/2);[[38,-w/2-2],[52,-w/2+1],[66,-w/2-2],[80,-w/2+1]].forEach(([a,b])=>x.lineTo(a,b));x.lineTo(L,0);[[80,w/2],[66,w/2-1],[52,w/2+2],[38,w/2]].forEach(([a,b])=>x.lineTo(a,b));x.lineTo(b0,w/2);x.closePath()};
  x.save();x.shadowColor='#ff5a00';x.shadowBlur=14;x.beginPath();P();x.fillStyle='#ff5a00';x.fill();x.restore();
  hsh(x,P,hg(x,0,-w/2,0,w/2,['#7a4a3a','#3a1a14','#140806']),5);
  hclip(x,P,()=>{x.save();x.shadowColor='#ffb020';x.shadowBlur=8;x.strokeStyle='#ffd040';x.lineWidth=2.2;[[[b0+2,0],[40,-3],[50,2],[62,-2],[74,3],[88,0]],[[44,-1],[48,-7]],[[62,-2],[66,6]],[[78,2],[80,-5]]].forEach(p=>{x.beginPath();p.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.stroke()});x.restore();
    x.fillStyle='rgba(255,255,255,.18)';x.fillRect(b0,-w/2,L,w*.35)});
  hsh(x,()=>{x.moveTo(b0-4,-14);x.lineTo(b0+3,-8);x.lineTo(b0+3,8);x.lineTo(b0-4,14);x.lineTo(b0-8,6);x.lineTo(b0-8,-6);x.closePath()},hg(x,0,-14,0,14,['#5a3a30','#1a0a08']),4);gem(x,b0-3,0,4,['#fff2a0','#ff6a1a','#a01a00']);
  wrapGrip(x,-6,b0-8,7,['#4a2a20','#1a0a06'],'#c84a10')});for(let i=0;i<5;i++){x.fillStyle=i%2?'#ffd040':'#ff7a1a';x.beginPath();x.arc(20+i*15,30-i*3+(i%2)*8,1.8+(i%3),0,7);x.fill()}};
HQW.glacier=x=>{hglow(x,56,40,46,'rgba(150,220,255,.5)');diag(x,()=>{const b0=24,L=97,w=18;
  const P=()=>{x.moveTo(b0,-w/2);x.lineTo(70,-w/2-3);x.lineTo(L,0);x.lineTo(70,w/2+3);x.lineTo(b0,w/2);x.closePath()};
  x.save();x.shadowColor='#8fe4ff';x.shadowBlur=14;x.beginPath();P();x.fillStyle='#bff4ff';x.fill();x.restore();
  hsh(x,P,hg(x,0,-w/2,0,w/2,['#ffffff','#bfe8ff','#5aa8e8','#22609e']),5);
  hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(b0,-w/2);x.lineTo(70,-w/2-3);x.lineTo(L,0);x.lineTo(b0,-1);x.fill();
    x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.3;[[b0+6,-w/2,44,0],[44,0,60,-w/2],[60,-w/2,78,0],[44,0,56,w/2],[66,w/2,78,0],[30,w/2,44,0]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()});x.fillStyle='rgba(20,60,140,.25)';x.fillRect(b0,3,L,10)});
  [[b0-2,-1,-1],[b0-2,1,1]].forEach(([gx,s,d])=>hsh(x,()=>{x.moveTo(gx,0);x.lineTo(gx+6,d*16);x.lineTo(gx+2,d*7);x.lineTo(gx-4,d*13);x.closePath()},hg(x,0,-16,0,16,['#ffffff','#8fd0ff','#3a7ac8']),3.5));
  hsh(x,()=>x.roundRect(b0-6,-6,8,12,3),hg(x,0,-6,0,6,['#d8f2ff','#4f9ee0']),3.5);wrapGrip(x,-6,b0-6,7,['#3a5a8a','#1a2a4a'],'#bfe8ff');gem(x,-9,0,4.5,['#ffffff','#5ff4ff','#1a6ab8'])});
  hglint(x,72,22,8);hglint(x,44,50,4);hglint(x,86,40,3)};
/* ---------- boards & blunt ---------- */
function board(x,o){diag(x,()=>{const L=96,w=o.w||16,hl=24;const P=()=>x.roundRect(-4,-w/2,L+2,w,o.r||3.5);
  if(o.glow){x.save();x.shadowColor=o.glow;x.shadowBlur=16;x.beginPath();P();x.fillStyle=o.glow;x.fill();x.restore()}
  hsh(x,P,hg(x,0,-w/2,0,w/2,o.cols),5);
  hclip(x,P,()=>{if(o.fill)o.fill();
    if(o.grain){x.strokeStyle=o.grain;x.lineWidth=1.3;x.globalAlpha=.55;for(let i=0;i<4;i++){const yy=-w*.32+i*w*.2;x.beginPath();x.moveTo(hl+i*4,yy);x.bezierCurveTo(L*.45,yy+2.4,L*.7,yy-2.4,L,yy+1);x.stroke()}x.beginPath();x.ellipse(L*.62,w*.12,5,1.8,0,0,7);x.stroke();x.globalAlpha=1}
    x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-6,-w/2,L+10,w*.22);x.fillStyle='rgba(20,10,30,.26)';x.fillRect(-6,w*.24,L+10,w);x.fillStyle='rgba(20,10,30,.18)';x.fillRect(L-5,-w,8,w*2)});
  hsh(x,()=>x.roundRect(-5,-w/2-1,hl,w+2,3),hg(x,0,-w/2,0,w/2,o.tape||['#f2ece0','#c8bca8','#8a7e6a']),4);
  hclip(x,()=>x.roundRect(-5,-w/2-1,hl,w+2,3),()=>{x.strokeStyle='rgba(60,40,30,.45)';x.lineWidth=1.6;for(let i=-4;i<hl+w;i+=5){x.beginPath();x.moveTo(i,-w/2-1);x.lineTo(i-w*.6,w/2+1);x.stroke()}});
  if(o.after)o.after(L,w)})}
HQW.plank=x=>board(x,{cols:['#f2bc78','#c47b38','#7a4318'],grain:'#5e3213'});
HQW.nailed=x=>board(x,{cols:['#d6955a','#9c5c26','#5a3214'],grain:'#3e220e',after:(L,w)=>{[[44,-2],[62,3],[80,-3]].forEach(([nx,ny])=>{hsh(x,()=>x.roundRect(nx-1.6,-w/2-9,3.2,12,1),hg(x,nx-2,0,nx+2,0,['#ffffff','#9aa2b4','#4a5060']),3);hsh(x,()=>x.ellipse(nx,ny,3.2,3.2,0,0,7),hr(x,nx,ny,3.4,['#ffffff','#9aa2b4','#4a5060']),2.5)})}});
HQW.surf=x=>{diag(x,()=>{const L=96,w=24;const P=()=>{x.moveTo(-2,0);x.bezierCurveTo(4,-w/2-2,L-20,-w/2,L,0);x.bezierCurveTo(L-20,w/2,4,w/2+2,-2,0);x.closePath()};hsh(x,P,hg(x,0,-w/2,0,w/2,['#e8fbff','#46bde0','#1f7fa3']),5);
  hclip(x,P,()=>{x.fillStyle='#ff5a7a';x.fillRect(-4,-2.5,L+6,5);x.fillStyle='#ffffff';x.fillRect(-4,-4,L+6,1.6);x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.ellipse(L*.45,-w*.25,L*.35,3,0,0,7);x.fill();x.fillStyle='#ffd23a';x.beginPath();x.arc(30,6,3,0,7);x.arc(64,6,3,0,7);x.fill()})});hglint(x,60,28,5)};
HQW.goldp=x=>{hglow(x,50,46,46,'rgba(255,214,90,.5)');board(x,{cols:['#fff8c0','#f6c43a','#c88a10','#6a3a00'],glow:'#ffd23a',tape:['#c83a3a','#8a1a1a','#4a0a0a'],
  fill:()=>{x.strokeStyle='rgba(120,70,0,.6)';x.lineWidth=1.4;x.strokeRect(26,-5,64,10)},after:(L,w)=>{gem(x,58,0,4.5,['#ffd0f0','#ff3a8a','#8a0a4a']);gem(x,80,0,3.5,['#d0f6ff','#3ab8ff','#0a4a8a']);gem(x,36,0,3.5,['#e0ffd0','#3ad86a','#0a6a2a'])}});hglint(x,74,22,8);hglint(x,34,62,4.5)};
HQW.rainbow=x=>{hglow(x,50,46,46,'rgba(255,170,255,.45)');board(x,{cols:['#fff','#fff','#ccc'],glow:'#ff8ad8',tape:['#ffffff','#d8d0f0','#9a8ac8'],w:18,fill:()=>{['#ff4a6a','#ff9a3a','#ffe066','#7bdc4f','#4aa8ff','#a06aff'].forEach((c,i)=>{x.fillStyle=c;x.fillRect(-6,-9+i*3,110,3.2)})}});
  [[24,24],[80,14],[86,46]].forEach(([a,b],i)=>hglint(x,a,b,6-i))};
HQW.holy=x=>{hglow(x,52,44,48,'rgba(255,240,160,.8)');board(x,{cols:['#ffffff','#fff3c8','#e8c070','#a07a28'],glow:'#fff2a0',tape:['#fff6d0','#e0c070','#9a7020'],w:18,
  fill:()=>{x.fillStyle='rgba(200,150,40,.75)';x.fillRect(30,-1.2,60,2.4);x.fillRect(56,-7,2.4,14);x.fillStyle='#ffe066';x.fillRect(26,-9,3,18);x.fillRect(88,-9,3,18)},
  after:(L,w)=>{x.save();x.translate(28,0);[-1,1].forEach(d=>hsh(x,()=>{x.moveTo(0,0);x.quadraticCurveTo(-6,d*16,4,d*22);x.quadraticCurveTo(2,d*14,8,d*10);x.quadraticCurveTo(4,d*6,0,0)},hg(x,0,d*22,0,0,['#ffffff','#fff2c0']),3));x.restore()}});
  x.save();x.strokeStyle=HO;x.lineWidth=6;x.beginPath();x.ellipse(80,14,13,5,-.5,0,7);x.stroke();x.strokeStyle='#ffe066';x.lineWidth=3.4;x.stroke();x.restore();hglint(x,30,30,7);hglint(x,86,58,5)};
HQW.bat=x=>{diag(x,()=>{const L=96;const P=()=>{x.moveTo(-2,-3.5);x.lineTo(30,-4.5);x.bezierCurveTo(50,-8,70,-9,L-6,-8.6);x.quadraticCurveTo(L+2,-8,L+2,0);x.quadraticCurveTo(L+2,8,L-6,8.6);x.bezierCurveTo(70,9,50,8,30,4.5);x.lineTo(-2,3.5);x.closePath()};
  hsh(x,P,hg(x,0,-9,0,9,['#fff2cc','#e6b878','#a8743c','#6a4420']),5);hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.5)';x.beginPath();x.ellipse(64,-4.5,28,2,0,0,7);x.fill();x.fillStyle='#c8303c';x.font='bold 7px sans-serif';x.save();x.translate(56,2.5);x.fillText('BEAR',0,0);x.restore()});
  hsh(x,()=>x.ellipse(-4,0,4,7,0,0,7),hg(x,0,-7,0,7,['#e6b878','#6a4420']),4);hsh(x,()=>x.roundRect(0,-4.5,20,9,2),hg(x,0,-4,0,4,['#3a3a50','#14141e']),3.5);hclip(x,()=>x.roundRect(0,-4.5,20,9,2),()=>{x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=1.4;for(let i=-4;i<26;i+=4){x.beginPath();x.moveTo(i,-5);x.lineTo(i-5,5);x.stroke()}})})};
HQW.rebar=x=>{diag(x,()=>{const L=90,w=8;hsh(x,()=>x.roundRect(-4,-w/2,L,w,3),hg(x,0,-w/2,0,w/2,['#f2f6fa','#a8b0c2','#5a6274','#2d3240']),5);
  hclip(x,()=>x.roundRect(-4,-w/2,L,w,3),()=>{x.strokeStyle='rgba(30,30,50,.55)';x.lineWidth=1.6;for(let i=20;i<L;i+=5){x.beginPath();x.moveTo(i,-w/2);x.lineTo(i+3,w/2);x.stroke()}x.fillStyle='rgba(180,80,20,.5)';[[34,1],[56,-1],[70,2]].forEach(([a,b])=>{x.beginPath();x.ellipse(a,b,3,1.6,0,0,7);x.fill()})});
  hsh(x,()=>{x.moveTo(L-14,-12);x.lineTo(L-2,-14);x.lineTo(L+8,-6);x.lineTo(L+7,8);x.lineTo(L-6,12);x.lineTo(L-16,6);x.closePath()},hg(x,0,-14,0,12,['#e6e2d8','#a8a294','#5a564a']),4.5);
  x.fillStyle='rgba(60,50,40,.5)';[[L-8,-4],[L,4],[L-10,6]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,1.4,0,7);x.fill()});
  hsh(x,()=>x.roundRect(-6,-w/2-1.5,22,w+3,3),hg(x,0,-5,0,5,['#ffd23a','#c88a10']),3.5);hclip(x,()=>x.roundRect(-6,-w/2-1.5,22,w+3,3),()=>{x.fillStyle='#1a1020';for(let i=-6;i<20;i+=6){x.beginPath();x.moveTo(i,-6);x.lineTo(i+3,-6);x.lineTo(i-2,6);x.lineTo(i-5,6);x.fill()}})});
  x.save();x.strokeStyle='#fff36a';x.lineWidth=2.5;x.shadowColor='#fff36a';x.shadowBlur=8;x.beginPath();x.moveTo(76,6);x.lineTo(70,14);x.lineTo(76,16);x.lineTo(70,24);x.stroke();x.restore()};
HQW.fireaxe=x=>{diag(x,()=>{const L=94;hsh(x,()=>x.roundRect(-4,-4,L-2,8,3),hg(x,0,-4,0,4,['#ff9a9a','#d8303c','#7a0c16']),5);bevel(x,()=>x.roundRect(-4,-4,L-2,8,3),8);
  const hx=L-20;hsh(x,()=>{x.moveTo(hx-6,-5);x.lineTo(hx-12,-14);x.quadraticCurveTo(hx-16,-30,hx-2,-36);x.quadraticCurveTo(hx+20,-32,hx+20,-12);x.lineTo(hx+12,-5);x.closePath()},hg(x,hx-16,-36,hx+20,-5,['#ffffff','#d8dee8','#7a8296','#3a4050']),5);
  x.strokeStyle='rgba(255,255,255,.95)';x.lineWidth=2.4;x.beginPath();x.moveTo(hx-12,-30);x.quadraticCurveTo(hx+4,-38,hx+18,-14);x.stroke();
  hsh(x,()=>{x.moveTo(hx-4,5);x.lineTo(hx+2,18);x.lineTo(hx+10,5);x.closePath()},hg(x,0,5,0,18,['#a8b0c2','#3a4050']),4);hsh(x,()=>x.roundRect(hx-8,-7,22,14,3),hg(x,0,-7,0,7,['#ff7a7a','#c8202c','#6a0a14']),4);x.fillStyle='#ffd23a';x.fillRect(hx-3,-2,12,4);
  hsh(x,()=>x.roundRect(-6,-5,16,10,3),hg(x,0,-5,0,5,['#3a3a50','#14141e']),3.5)});hglint(x,62,14,5)};
HQW.sledge=x=>{diag(x,()=>{const L=74;hsh(x,()=>x.roundRect(-4,-3.6,L,7.2,3),hg(x,0,-4,0,4,['#f2bc78','#a8743c','#5e3213']),5);bevel(x,()=>x.roundRect(-4,-3.6,L,7.2,3),7);
  x.save();x.translate(L+2,0);hsh(x,()=>x.roundRect(-11,-21,22,42,4),hg(x,-11,0,11,0,['#f2f6fa','#a8b0c2','#5a6274','#2d3240']),5);hsh(x,()=>x.roundRect(-13,-23,26,7,2),hg(x,0,-23,0,-16,['#d8dee8','#5a6274']),4);hsh(x,()=>x.roundRect(-13,16,26,7,2),hg(x,0,16,0,23,['#d8dee8','#5a6274']),4);
  x.fillStyle='rgba(255,255,255,.55)';x.fillRect(-8,-15,4,30);x.fillStyle='#c8303c';x.fillRect(-11,-3,22,6);x.restore();hsh(x,()=>x.roundRect(-6,-5,20,10,3),hg(x,0,-5,0,5,['#3a3a50','#14141e']),3.5)});hglint(x,78,14,5)};
/* ---------- guns ---------- */
function gunFrame(x,ang,fn){x.save();x.translate(48,50);x.rotate(ang);x.translate(-48,-50);fn();x.restore()}
HQW.revolver=x=>gunFrame(x,-.32,()=>{hsh(x,()=>x.roundRect(40,36,48,9,3),hg(x,0,36,0,45,['#d8dce8','#6a6e86','#2a2c3a']),5);hsh(x,()=>x.roundRect(84,32,5,6,1),'#3a3c4a',3);
  hsh(x,()=>x.roundRect(22,34,26,22,5),hg(x,0,34,0,56,['#8a8ea6','#3a3c4e','#16161e']),5);hsh(x,()=>x.roundRect(36,33,22,18,6),hg(x,0,33,0,51,['#c8ccd8','#5a5e72','#1e1e28']),5);
  x.fillStyle='rgba(10,10,20,.6)';[39,45,51].forEach(a=>x.fillRect(a,35,2.6,14));hsh(x,()=>{x.moveTo(24,35);x.lineTo(16,28);x.lineTo(22,26);x.lineTo(30,34)},'#3a3c4e',3.5);
  hsh(x,()=>{x.moveTo(24,52);x.quadraticCurveTo(16,70,22,84);x.lineTo(36,82);x.quadraticCurveTo(34,66,40,54);x.closePath()},hg(x,16,52,40,84,['#e6a75f','#a05a26','#5e3213']),5);
  x.strokeStyle='rgba(60,30,10,.5)';x.lineWidth=1.4;[[24,62,33,60],[23,70,33,68],[24,77,34,75]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()});
  x.strokeStyle=HO;x.lineWidth=4.5;x.beginPath();x.arc(40,58,8,0.2,Math.PI*.95);x.stroke();x.strokeStyle='#ffd23a';x.lineWidth=2;x.stroke();hsh(x,()=>x.roundRect(22,44,6,3,1),'#ffd23a',2);
  x.fillStyle='rgba(255,255,255,.6)';x.fillRect(44,37.5,40,2);hglint(x,70,30,4)});
HQW.shotgun=x=>gunFrame(x,-.3,()=>{[0,7].forEach(d=>hsh(x,()=>x.roundRect(36,36+d,56,7,3),hg(x,0,36+d,0,43+d,['#d8dce8','#5a5e72','#1e1e28']),4.5));
  hsh(x,()=>x.roundRect(44,50,24,9,3),hg(x,0,50,0,59,['#e6a75f','#a05a26','#5e3213']),4.5);x.strokeStyle='rgba(60,30,10,.6)';x.lineWidth=1.4;for(let i=47;i<66;i+=4){x.beginPath();x.moveTo(i,51);x.lineTo(i,58);x.stroke()}
  hsh(x,()=>x.roundRect(24,36,18,18,4),hg(x,0,36,0,54,['#9a9eb6','#3a3c4e','#16161e']),5);
  hsh(x,()=>{x.moveTo(26,40);x.lineTo(2,48);x.lineTo(4,62);x.lineTo(14,60);x.lineTo(30,52);x.closePath()},hg(x,0,40,0,62,['#e6a75f','#a05a26','#5e3213']),5);
  x.strokeStyle=HO;x.lineWidth=4;x.beginPath();x.arc(32,58,6,0.1,Math.PI*.9);x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.fillRect(40,37.2,48,1.6);x.fillRect(40,44.2,48,1.4);
  x.save();x.globalCompositeOperation='lighter';hglow(x,96,42,14,'rgba(255,200,80,.8)');x.restore()});
HQW.mg=x=>{x.save();x.translate(48,50);x.scale(.86,.86);x.translate(-50,-46);gunFrame(x,-.26,()=>{hsh(x,()=>x.roundRect(52,38,40,7,3),hg(x,0,38,0,45,['#d8dce8','#5a5e72','#1e1e28']),4.5);hsh(x,()=>x.roundRect(50,35,26,13,4),hg(x,0,35,0,48,['#7a7e96','#2c2e3c','#101016']),4.5);x.fillStyle='#0a0a12';for(let i=0;i<4;i++){x.beginPath();x.arc(54+i*6,41.5,1.8,0,7);x.fill()}
  hsh(x,()=>x.roundRect(18,32,36,20,4),hg(x,0,32,0,52,['#8a8ea6','#3a3c4e','#16161e']),5);hsh(x,()=>x.roundRect(28,26,18,7,2),hg(x,0,26,0,33,['#5a5e72','#1e1e28']),3.5);
  hsh(x,()=>{x.moveTo(20,36);x.lineTo(2,40);x.lineTo(2,54);x.lineTo(20,50);x.closePath()},hg(x,0,36,0,54,['#5a5e72','#1e1e28']),4.5);hsh(x,()=>x.roundRect(30,50,12,16,3),hg(x,0,50,0,66,['#6a8a4a','#2a3a1a']),4);
  for(let i=0;i<6;i++){const bx=40-i*4,by=56+i*5;hsh(x,()=>x.roundRect(bx,by,9,4,1.5),hg(x,0,by,0,by+4,['#fff2a0','#e0a020','#8a5a00']),2.4)}
  x.strokeStyle=HO;x.lineWidth=3.5;x.beginPath();x.moveTo(78,46);x.lineTo(72,64);x.moveTo(78,46);x.lineTo(86,64);x.stroke();x.fillStyle='rgba(255,255,255,.55)';x.fillRect(22,34,28,2);x.fillRect(54,39.3,36,1.4)});
  x.restore();x.save();x.globalCompositeOperation='lighter';hglow(x,86,30,14,'rgba(255,220,100,.9)');x.restore();hglint(x,86,30,5)};
HQW.railgun=x=>{hglow(x,52,46,46,'rgba(90,240,255,.45)');gunFrame(x,-.3,()=>{[0,12].forEach(d=>hsh(x,()=>x.roundRect(46,34+d,48,5,2),hg(x,0,34+d,0,39+d,['#ffffff','#a8b8cc','#4a5a70']),4));
  x.save();x.shadowColor='#5ff4ff';x.shadowBlur=10;x.fillStyle='#bff8ff';x.fillRect(48,40,44,5);x.restore();for(let i=0;i<5;i++)hsh(x,()=>x.roundRect(52+i*8,31,4,20,2),hg(x,0,31,0,51,['#5ff4ff','#1a8ab8']),2.5);
  hsh(x,()=>x.roundRect(16,32,36,22,6),hg(x,0,32,0,54,['#ffffff','#c8d4e6','#6a7a96']),5);hsh(x,()=>x.roundRect(22,36,14,8,3),hg(x,0,36,0,44,['#bff8ff','#2ab0e8']),3);
  hsh(x,()=>{x.moveTo(20,50);x.lineTo(16,72);x.lineTo(28,72);x.lineTo(32,52);x.closePath()},hg(x,16,50,32,72,['#3a4a60','#141a24']),4.5);hsh(x,()=>{x.moveTo(18,36);x.lineTo(2,42);x.lineTo(4,52);x.lineTo(18,48);x.closePath()},hg(x,0,36,0,52,['#c8d4e6','#4a5a70']),4);
  x.fillStyle='rgba(255,255,255,.7)';x.fillRect(20,34,28,2)});hglint(x,90,22,7);hglint(x,40,30,4)};
HQW.watergun=x=>gunFrame(x,-.2,()=>{hsh(x,()=>x.roundRect(56,40,30,8,4),hg(x,0,40,0,48,['#fff6a0','#ffb020','#c86a00']),4.5);hsh(x,()=>x.roundRect(20,36,42,20,9),hg(x,0,36,0,56,['#b0e8ff','#3a9ae8','#1a5aa8']),5);
  hsh(x,()=>x.ellipse(40,30,12,10,0,0,7),hr(x,40,30,12,['#ffffff','#a8e8ff','#3ab0f0']),4.5);x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(36,26,4,3,-.4,0,7);x.fill();
  hsh(x,()=>{x.moveTo(24,52);x.lineTo(18,76);x.lineTo(32,76);x.lineTo(36,54);x.closePath()},hg(x,0,52,0,76,['#ff8aa8','#e83a6a','#9a1a40']),5);x.fillStyle='#bff0ff';[[90,42],[96,38],[94,48]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,2.4,0,7);x.fill()})});
/* ---------- throwing ---------- */
function starN(x,cx,cy,n,R,r,rot,fill,curve){hsh(x,()=>{for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,rr=i%2?r:R;if(curve&&i%2===0){const a2=a-Math.PI/n*.6;x.quadraticCurveTo(cx+Math.cos(a2)*R*.75,cy+Math.sin(a2)*R*.75,cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}else x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath()},fill,5)}
function starDetail(x,cx,cy,n,R,rot){x.save();x.globalAlpha=.55;x.strokeStyle='#fff';x.lineWidth=1.6;for(let i=0;i<n;i++){const a=rot+i*Math.PI*2/n;x.beginPath();x.moveTo(cx+Math.cos(a)*6,cy+Math.sin(a)*6);x.lineTo(cx+Math.cos(a)*R*.85,cy+Math.sin(a)*R*.85);x.stroke()}x.restore();
  hsh(x,()=>x.arc(cx,cy,7,0,7),hr(x,cx,cy,7,['#ffffff','#a8b0c2','#4a5060']),4);hsh(x,()=>x.arc(cx,cy,3,0,7),'#1a1020',0)}
HQW.shuriken=x=>{starN(x,48,48,4,40,10,-Math.PI/4,hg(x,10,10,86,86,['#ffffff','#c8d0dc','#6a7286','#2d3240']));starDetail(x,48,48,4,40,-Math.PI/4);hglint(x,24,24,6)};
HQW.rstar=x=>{starN(x,48,48,4,38,10,0,hg(x,10,10,86,86,['#e8c8a8','#a8784a','#6a4020','#2e1408']));x.fillStyle='rgba(200,90,20,.6)';[[30,40],[62,30],[56,66],[40,58]].forEach(([a,b])=>{x.beginPath();x.ellipse(a,b,4,2.6,.5,0,7);x.fill()});starDetail(x,48,48,4,38,0)};
HQW.ninja=x=>{starN(x,48,48,4,42,9,-Math.PI/4,hg(x,10,10,86,86,['#8a8ea6','#3a3c4e','#16161e','#08080c']),true);
  x.save();x.globalAlpha=.8;x.strokeStyle='#e8ecf4';x.lineWidth=2;for(let i=0;i<4;i++){const a=-Math.PI/4+i*Math.PI/2;x.beginPath();x.moveTo(48+Math.cos(a)*10,48+Math.sin(a)*10);x.lineTo(48+Math.cos(a)*38,48+Math.sin(a)*38);x.stroke()}x.restore();
  hsh(x,()=>x.arc(48,48,10,0,7),hg(x,0,38,0,58,['#ff7a7a','#c8202c','#6a0a14']),4);hsh(x,()=>x.arc(48,48,3.6,0,7),'#1a1020',0);hglint(x,22,22,5)};
HQW.kunai=x=>{[[-1,0],[0,1],[1,2]].forEach(([a,i])=>{x.save();x.translate(48,62);x.rotate(-Math.PI/2+a*.5);
  hsh(x,()=>{x.moveTo(8,0);x.lineTo(20,-6);x.lineTo(46,0);x.lineTo(20,6);x.closePath()},hg(x,0,-6,0,6,['#ffffff','#c8d0dc','#5a6274']),4);x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.moveTo(12,-.5);x.lineTo(20,-4.5);x.lineTo(42,-.5);x.fill();
  hsh(x,()=>x.roundRect(-14,-3,24,6,2),hg(x,0,-3,0,3,['#3a3a50','#14141e']),3.5);x.strokeStyle='#c8303c';x.lineWidth=1.6;for(let k=-12;k<10;k+=4){x.beginPath();x.moveTo(k,-3);x.lineTo(k+3,3);x.stroke()}
  hsh(x,()=>x.arc(-19,0,5,0,7),'rgba(0,0,0,0)',4);x.strokeStyle='#c8d0dc';x.lineWidth=2;x.beginPath();x.arc(-19,0,5,0,7);x.stroke();x.restore()});
  hsh(x,()=>{x.moveTo(36,60);x.quadraticCurveTo(48,52,60,60);x.lineTo(58,68);x.quadraticCurveTo(48,62,38,68);x.closePath()},hg(x,0,52,0,68,['#ff7a7a','#c8202c']),3.5);
  hsh(x,()=>{x.moveTo(46,64);x.lineTo(38,86);x.lineTo(46,82);x.lineTo(50,64)},hg(x,0,64,0,86,['#ff7a7a','#a01a24']),3);hsh(x,()=>{x.moveTo(50,64);x.lineTo(60,86);x.lineTo(54,80);x.lineTo(47,64)},hg(x,0,64,0,86,['#ff7a7a','#a01a24']),3)};
HQW.hstar=x=>{hglow(x,48,48,48,'rgba(120,255,200,.45)');x.save();x.translate(48,48);x.rotate(.3);for(let i=0;i<4;i++){x.save();x.rotate(i*Math.PI/2);
  hsh(x,()=>{x.moveTo(6,-6);x.quadraticCurveTo(20,-30,42,-26);x.quadraticCurveTo(30,-16,28,0);x.quadraticCurveTo(18,-2,6,6);x.closePath()},hg(x,6,-30,40,6,['#ffffff','#c8f0e0','#4aa888','#1a4a3a']),4.5);
  x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=1.8;x.beginPath();x.moveTo(10,-8);x.quadraticCurveTo(22,-26,40,-25);x.stroke();x.restore()}x.restore();
  hsh(x,()=>x.arc(48,48,11,0,7),hr(x,48,48,11,['#ffffff','#9affd0','#1a8a6a']),4.5);hsh(x,()=>x.arc(48,48,4,0,7),'#1a1020',0);hglint(x,20,24,6);hglint(x,80,76,4)};
HQW.pebble=x=>{hsh(x,()=>x.ellipse(48,52,30,24,-.2,0,7),hr(x,48,52,30,['#f2f2f6','#a8acb8','#5a5e6a']),5);x.fillStyle='rgba(60,60,80,.25)';[[58,60,5],[38,58,3],[52,44,2.4]].forEach(([a,b,r])=>{x.beginPath();x.arc(a,b,r,0,7);x.fill()});hglint(x,36,38,6)};
HQW.balloon=x=>{hsh(x,()=>{x.moveTo(48,16);x.bezierCurveTo(76,16,80,52,48,74);x.bezierCurveTo(16,52,20,16,48,16)},hr(x,48,42,32,['#e0f6ff','#5ab8ff','#1a6ad6']),5);hsh(x,()=>{x.moveTo(44,74);x.lineTo(52,74);x.lineTo(54,80);x.lineTo(42,80);x.closePath()},'#3a8ae8',3.5);
  x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(38,32,6,10,-.5,0,7);x.fill();hglint(x,62,28,4)};
/* ---------- books ---------- */
function tome(x,o){if(o.glow)hglow(x,48,48,48,o.glow);
  hsh(x,()=>x.roundRect(26,22,52,62,4),hg(x,0,22,0,84,['#fffaf0','#e8dcc0','#b8a888']),4.5);x.strokeStyle='rgba(120,100,70,.5)';x.lineWidth=1;for(let i=0;i<6;i++){x.beginPath();x.moveTo(30,80-i*1.6+3);x.lineTo(76,80-i*1.6+3);x.stroke()}
  hsh(x,()=>x.roundRect(16,14,56,66,6),hg(x,16,14,72,80,o.cols),5);hsh(x,()=>x.roundRect(16,14,11,66,5),hg(x,16,0,27,0,o.spine),4);
  [[20,30],[20,64]].forEach(([a,b])=>{hsh(x,()=>x.roundRect(a-2,b-3,10,6,2),hg(x,0,b-3,0,b+3,['#fff2a0','#c88a10']),2.5)});
  [[72,14,-1,1],[72,80,-1,-1]].forEach(([cx,cy,dx,dy])=>hsh(x,()=>{x.moveTo(cx,cy);x.lineTo(cx+dx*12,cy);x.lineTo(cx,cy+dy*12);x.closePath()},hg(x,0,cy-12,0,cy+12,['#fff2a0','#d09a20','#7a4a00']),3.5));
  hsh(x,()=>x.roundRect(66,40,14,12,3),hg(x,0,40,0,52,['#fff2a0','#c88a10']),3.5);x.fillStyle=HO;x.beginPath();x.arc(73,46,1.8,0,7);x.fill();
  x.fillStyle='rgba(255,255,255,.22)';x.beginPath();x.roundRect(30,17,38,8,4);x.fill();
  if(o.emblem)o.emblem(46,48)}
HQW.primer=x=>tome(x,{cols:['#7ab6ff','#2a6ad6','#0e3a8a'],spine:['#1a4aa8','#0a2a6a'],emblem:(cx,cy)=>{hsh(x,()=>x.arc(cx,cy,13,0,7),hr(x,cx,cy,13,['#ffffff','#a8d8ff','#3a8ae8']),4);hglint(x,cx,cy,9)}});
HQW.oldbook=x=>tome(x,{cols:['#d86a5a','#9a2a24','#4a0e0c'],spine:['#6a1a14','#2a0806'],emblem:(cx,cy)=>{x.save();x.strokeStyle='#ffd23a';x.lineWidth=2.4;x.shadowColor='#ffb020';x.shadowBlur=6;x.beginPath();x.arc(cx,cy,14,0,7);x.stroke();x.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*Math.PI*4/5;x.lineTo(cx+Math.cos(a)*13,cy+Math.sin(a)*13)}x.stroke();x.restore()}});
HQW.icebook=x=>{tome(x,{cols:['#e0f6ff','#5ab8f0','#1a5aa8'],spine:['#2a7ac8','#0e3a7a'],glow:'rgba(150,230,255,.5)',emblem:(cx,cy)=>{x.save();x.strokeStyle=HO;x.lineWidth=6;const fl=()=>{x.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3;x.moveTo(cx,cy);x.lineTo(cx+Math.cos(a)*14,cy+Math.sin(a)*14);x.moveTo(cx+Math.cos(a)*8+Math.cos(a+1)*4,cy+Math.sin(a)*8+Math.sin(a+1)*4);x.lineTo(cx+Math.cos(a)*8,cy+Math.sin(a)*8);x.lineTo(cx+Math.cos(a)*8+Math.cos(a-1)*4,cy+Math.sin(a)*8+Math.sin(a-1)*4)}x.stroke()};fl();x.strokeStyle='#ffffff';x.lineWidth=2.6;x.shadowColor='#8fe4ff';x.shadowBlur=8;fl();x.restore()}});
  [[18,16],[70,18]].forEach(([a,b])=>hsh(x,()=>{x.moveTo(a,b);x.lineTo(a+4,b+10);x.lineTo(a+8,b);x.closePath()},'#e6f8ff',2.5));hglint(x,82,20,6)};
HQW.firebook=x=>{tome(x,{cols:['#ffb060','#e0401a','#6a0e04'],spine:['#a0200a','#3a0802'],glow:'rgba(255,120,40,.55)',emblem:(cx,cy)=>{const fl=(s,c)=>hsh(x,()=>{x.moveTo(cx,cy-16*s);x.quadraticCurveTo(cx+14*s,cy-2*s,cx+8*s,cy+12*s);x.quadraticCurveTo(cx,cy+16*s,cx-8*s,cy+12*s);x.quadraticCurveTo(cx-14*s,cy-2*s,cx,cy-16*s)},c,s>.8?4:0);
    x.save();x.shadowColor='#ffb020';x.shadowBlur=10;fl(1,hg(x,0,cy-16,0,cy+14,['#fff2a0','#ff8a1a','#c42a00']));fl(.5,'#fff6c0');x.restore()}});
  [[84,20,2.4],[12,30,1.8],[86,64,2]].forEach(([a,b,r],i)=>{x.fillStyle=i%2?'#ffd040':'#ff7a1a';x.beginPath();x.arc(a,b,r,0,7);x.fill()})};
HQW.grimoire=x=>{tome(x,{cols:['#4a6a4a','#1a2a1e','#08100a'],spine:['#1a2a1e','#040806'],glow:'rgba(170,110,255,.55)',emblem:(cx,cy)=>{hsh(x,()=>{x.moveTo(cx-16,cy);x.quadraticCurveTo(cx,cy-13,cx+16,cy);x.quadraticCurveTo(cx,cy+13,cx-16,cy)},hg(x,0,cy-10,0,cy+10,['#f6f0e0','#c8b890']),3.5);
    x.save();x.shadowColor='#b06cff';x.shadowBlur=10;hsh(x,()=>x.arc(cx,cy,6.5,0,7),hr(x,cx,cy,6.5,['#ffd0ff','#b06cff','#4a0a8a']),0);x.restore();x.fillStyle=HO;x.beginPath();x.ellipse(cx,cy,1.6,5,0,0,7);x.fill();
    x.strokeStyle='#9aff3a';x.lineWidth=1.4;for(let i=0;i<8;i++){const a=i*Math.PI/4;x.beginPath();x.moveTo(cx+Math.cos(a)*19,cy+Math.sin(a)*19);x.lineTo(cx+Math.cos(a)*23,cy+Math.sin(a)*23);x.stroke()}}});
  x.save();x.strokeStyle='#5a5e72';x.lineWidth=3.2;for(let i=0;i<6;i++){x.beginPath();x.ellipse(12+i*13,66-i*8,4.5,3,-.6,0,7);x.stroke()}x.restore()};
{const _pw=paintWeapon;paintWeapon=function(x,id,it){if(HQW[id]){HQW[id](x);return}_pw(x,id,it)}}

/* ---------- UI icons ---------- */
const UIK={
 coin:x=>{hsh(x,()=>x.ellipse(48,50,38,38,0,0,7),hg(x,0,12,0,88,['#fff6b0','#ffd23a','#e09a10','#9a5a00']),6);hsh(x,()=>x.ellipse(48,50,28,28,0,0,7),hg(x,0,22,0,78,['#e09a10','#ffd23a','#fff2a0']),0);
   x.strokeStyle='rgba(150,90,0,.65)';x.lineWidth=2.5;x.beginPath();x.arc(48,50,28,0,7);x.stroke();
   hsh(x,()=>{for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7.5:17;x.lineTo(48+Math.cos(a)*r,51+Math.sin(a)*r)}x.closePath()},hg(x,0,34,0,68,['#fff8d0','#f6c43a']),3);
   x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.ellipse(34,28,10,5,-.6,0,7);x.fill();hglint(x,74,20,7)},
 gem:x=>{const P=()=>{x.moveTo(26,24);x.lineTo(70,24);x.lineTo(86,42);x.lineTo(48,86);x.lineTo(10,42);x.closePath()};hsh(x,P,hg(x,10,24,86,86,['#d8f6ff','#5ac8ff','#1a6ad6','#0a3a8a']),6);
   hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.55)';x.beginPath();x.moveTo(26,24);x.lineTo(48,24);x.lineTo(36,42);x.lineTo(10,42);x.fill();x.fillStyle='rgba(255,255,255,.3)';x.beginPath();x.moveTo(48,24);x.lineTo(70,24);x.lineTo(60,42);x.lineTo(36,42);x.fill();
     x.fillStyle='rgba(10,30,90,.3)';x.beginPath();x.moveTo(60,42);x.lineTo(86,42);x.lineTo(48,86);x.fill();x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=1.6;x.beginPath();x.moveTo(10,42);x.lineTo(86,42);x.moveTo(36,42);x.lineTo(48,86);x.lineTo(60,42);x.stroke()});hglint(x,30,30,7);hglint(x,74,64,4)},
 grow:x=>{hglow(x,48,50,44,'rgba(140,255,120,.45)');const P=()=>{x.moveTo(48,8);x.lineTo(84,46);x.lineTo(62,46);x.lineTo(62,86);x.lineTo(34,86);x.lineTo(34,46);x.lineTo(12,46);x.closePath()};hsh(x,P,hg(x,0,8,0,86,['#e6ffb0','#7bdc4f','#2a9a2a','#0e5a14']),6);
   hclip(x,P,()=>{x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.moveTo(48,8);x.lineTo(12,46);x.lineTo(34,46);x.lineTo(34,86);x.lineTo(46,86);x.lineTo(46,14);x.fill()});hglint(x,74,18,7);hglint(x,20,72,4.5)},
 gear:x=>{diag(x,()=>{straightBlade(x,22,92,13,['#ffffff','#c8d4e6','#6a7a96']);hsh(x,()=>x.roundRect(16,-13,7,26,3),hg(x,0,-13,0,13,['#fff2a0','#c88a10']),4);wrapGrip(x,-2,16,7,['#a05a26','#4a2410'],'#e6a75f');hsh(x,()=>x.arc(-4,0,5,0,7),hr(x,-4,0,5,['#fff2a0','#c88a10']),3.5)},10,86);
   hsh(x,()=>{x.moveTo(52,44);x.lineTo(88,44);x.quadraticCurveTo(90,74,70,90);x.quadraticCurveTo(50,74,52,44)},hg(x,52,44,88,90,['#7ab6ff','#2a6ad6','#0e3a8a']),5.5);
   hsh(x,()=>{x.moveTo(60,51);x.lineTo(80,51);x.quadraticCurveTo(81,70,70,81);x.quadraticCurveTo(59,70,60,51)},hg(x,0,51,0,81,['#fff2a0','#e0a020']),3);x.fillStyle='#c8303c';x.fillRect(68,54,4,22);x.fillRect(62,60,16,4);hglint(x,58,50,4)},
 pet:x=>{hsh(x,()=>x.ellipse(48,54,38,32,0,0,7),hr(x,48,54,38,['#ffffff','#e8ecf4','#a8b0c2']),6);hsh(x,()=>x.ellipse(48,64,16,11,0,0,7),hg(x,0,54,0,76,['#ffffff','#e0e4ee']),0);
   [[34,48],[62,48]].forEach(([a,b])=>{hsh(x,()=>x.ellipse(a,b,6.5,8,0,0,7),'#1a1020',0);x.fillStyle='#fff';x.beginPath();x.arc(a-2,b-3,2.6,0,7);x.arc(a+2,b+2,1.2,0,7);x.fill()});
   hsh(x,()=>x.ellipse(48,58,5,3.6,0,0,7),'#1a1020',0);x.strokeStyle='#1a1020';x.lineWidth=2.4;x.beginPath();x.moveTo(48,61);x.quadraticCurveTo(44,67,40,64);x.moveTo(48,61);x.quadraticCurveTo(52,67,56,64);x.stroke();
   x.fillStyle='rgba(255,120,150,.55)';x.beginPath();x.ellipse(24,60,7,4,0,0,7);x.ellipse(72,60,7,4,0,0,7);x.fill();x.strokeStyle='rgba(120,120,140,.7)';x.lineWidth=1.4;[[-1,0],[1,0]].forEach(([d])=>{for(let i=0;i<3;i++){x.beginPath();x.moveTo(48+d*12,62+i*2.6);x.lineTo(48+d*26,58+i*5);x.stroke()}});
   x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.ellipse(34,30,10,5,-.4,0,7);x.fill()},
 dungeon:x=>{hsh(x,()=>{x.moveTo(10,90);x.lineTo(10,40);x.quadraticCurveTo(10,8,48,8);x.quadraticCurveTo(86,8,86,40);x.lineTo(86,90);x.closePath()},hg(x,0,8,0,90,['#c8c0d8','#7a7090','#3a3450']),6);
   hclip(x,()=>{x.moveTo(10,90);x.lineTo(10,40);x.quadraticCurveTo(10,8,48,8);x.quadraticCurveTo(86,8,86,40);x.lineTo(86,90);x.closePath()},()=>{x.strokeStyle='rgba(30,20,50,.5)';x.lineWidth=2;[[10,30,30,30],[66,30,86,30],[10,56,24,56],[72,56,86,56],[10,76,30,76],[66,76,86,76]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()});x.fillStyle='rgba(255,255,255,.3)';x.fillRect(10,8,80,10)});
   const D=()=>{x.moveTo(26,90);x.lineTo(26,48);x.quadraticCurveTo(26,26,48,26);x.quadraticCurveTo(70,26,70,48);x.lineTo(70,90);x.closePath()};hsh(x,D,hr(x,48,60,34,['#ffd0ff','#b06cff','#4a1a8a','#14062a']),5);
   hclip(x,D,()=>{x.strokeStyle='rgba(255,220,255,.75)';x.lineWidth=2.4;for(let i=0;i<3;i++){x.beginPath();x.arc(48,62,6+i*7,i,i+3.6);x.stroke()}});
   [[18,40],[78,40]].forEach(([a,b])=>{hglow(x,a,b-6,14,'rgba(255,170,60,.9)');hsh(x,()=>x.roundRect(a-2.5,b,5,10,1.5),'#5a3a20',2.5);hsh(x,()=>{x.moveTo(a,b-10);x.quadraticCurveTo(a+5,b-3,a,b);x.quadraticCurveTo(a-5,b-3,a,b-10)},'#ffd040',0)})},
 shop:x=>{hsh(x,()=>{x.moveTo(14,40);x.lineTo(82,40);x.lineTo(76,88);x.lineTo(20,88);x.closePath()},hg(x,0,40,0,88,['#ffb0c0','#ff4a7a','#a81a40']),6);
   x.strokeStyle=HO;x.lineWidth=6;x.beginPath();x.arc(48,40,15,Math.PI,0);x.stroke();x.strokeStyle='#ffd23a';x.lineWidth=3;x.stroke();
   hclip(x,()=>{x.moveTo(14,40);x.lineTo(82,40);x.lineTo(76,88);x.lineTo(20,88);x.closePath()},()=>{x.fillStyle='rgba(255,255,255,.35)';x.fillRect(14,40,70,8);x.fillStyle='rgba(255,255,255,.18)';x.fillRect(14,40,22,50)});
   x.save();x.translate(48,66);x.scale(.36,.36);x.translate(-48,-50);UIK.gem(x);x.restore();hglint(x,80,22,6);hglint(x,16,24,4)},
 lock:x=>{x.strokeStyle=HO;x.lineWidth=12;x.beginPath();x.moveTo(30,46);x.lineTo(30,32);x.arc(48,32,18,Math.PI,0);x.lineTo(66,46);x.stroke();x.strokeStyle=hg(x,0,14,0,46,['#ffffff','#a8b0c2','#5a6274']);x.lineWidth=6;x.stroke();
   hsh(x,()=>x.roundRect(18,42,60,44,9),hg(x,0,42,0,86,['#fff6b0','#ffd23a','#c88a10','#7a4a00']),6);x.fillStyle='rgba(255,255,255,.45)';x.beginPath();x.roundRect(23,46,50,7,4);x.fill();
   hsh(x,()=>{x.arc(48,60,6,0,7)},'#2a1a10',0);hsh(x,()=>{x.moveTo(45,62);x.lineTo(51,62);x.lineTo(52,74);x.lineTo(44,74);x.closePath()},'#2a1a10',0)},
 bear:x=>{[[22,24],[74,24]].forEach(([a,b])=>{hsh(x,()=>x.arc(a,b,12,0,7),hr(x,a,b,12,['#ffffff','#f0ece0','#c8c0aa']),5);hsh(x,()=>x.arc(a,b,6,0,7),'#f0b8b8',0)});
   hsh(x,()=>x.ellipse(48,54,38,34,0,0,7),hr(x,48,50,40,['#ffffff','#f6f2e6','#d0c8b2']),6);hsh(x,()=>x.ellipse(48,66,17,13,0,0,7),hg(x,0,53,0,79,['#ffffff','#ece6d6']),3);
   [[33,50],[63,50]].forEach(([a,b])=>{hsh(x,()=>x.ellipse(a,b,4.6,6,0,0,7),'#1a1020',0);x.fillStyle='#fff';x.beginPath();x.arc(a-1.4,b-2,1.8,0,7);x.fill()});
   hsh(x,()=>x.ellipse(48,60,7,5,0,0,7),'#1a1020',0);x.fillStyle='rgba(255,255,255,.7)';x.beginPath();x.ellipse(46,58.5,2.4,1.4,0,0,7);x.fill();
   x.strokeStyle='#1a1020';x.lineWidth=2.4;x.beginPath();x.moveTo(48,65);x.lineTo(48,69);x.quadraticCurveTo(44,73,40,70);x.moveTo(48,69);x.quadraticCurveTo(52,73,56,70);x.stroke();
   x.fillStyle='rgba(255,130,150,.5)';x.beginPath();x.ellipse(24,64,6.5,4,0,0,7);x.ellipse(72,64,6.5,4,0,0,7);x.fill();x.fillStyle='rgba(255,255,255,.85)';x.beginPath();x.ellipse(32,30,10,5,-.5,0,7);x.fill()},
 slot_w:x=>{x.globalAlpha=.5;diag(x,()=>{straightBlade(x,22,92,12,['#e6f4ff','#9ac8f0','#5a8ac8'],{fuller:false});hsh(x,()=>x.roundRect(16,-12,6,24,3),'#9ac8f0',3.5);hsh(x,()=>x.roundRect(-2,-3.5,18,7,3),'#7aa8e0',3.5)});x.globalAlpha=1},
 slot_c:x=>{x.globalAlpha=.5;hsh(x,()=>{x.moveTo(30,14);x.quadraticCurveTo(48,24,66,14);x.lineTo(88,30);x.lineTo(78,46);x.lineTo(70,40);x.lineTo(70,86);x.lineTo(26,86);x.lineTo(26,40);x.lineTo(18,46);x.lineTo(8,30);x.closePath()},hg(x,0,14,0,86,['#e6f4ff','#9ac8f0','#5a8ac8']),5);x.globalAlpha=1},
 slot_a:x=>{x.globalAlpha=.5;x.strokeStyle=HO;x.lineWidth=16;x.beginPath();x.arc(48,58,24,0,7);x.stroke();x.strokeStyle='#9ac8f0';x.lineWidth=9;x.stroke();gem(x,48,30,11,['#ffffff','#9ac8f0','#5a8ac8']);x.globalAlpha=1}
};
const UIC={};const uiImg=k=>UIC[k]||(UIC[k]=hqPaint(UIK[k]));
function uiInto(cv,k){hqInto(cv,uiImg(k))}
/* currency CSS vars */
try{document.documentElement.style.setProperty('--ic-coin',`url(${uiImg('coin').toDataURL()})`);document.documentElement.style.setProperty('--ic-gem',`url(${uiImg('gem').toDataURL()})`)}catch(e){}
/* nav */
function hqNav(){const map={grow:'grow',gear:'gear',pet:'pet',dungeon:'dungeon',shop:'shop'};document.querySelectorAll('#nav button').forEach(b=>{const k=map[b.dataset.t];const c=b.querySelector('canvas');if(k&&c)uiInto(c,k)})}
hqNav();
/* avatar */
function hqAva(){const a=$('#ava');if(a){uiInto(a,'bear');a.classList.remove('pix')}}hqAva();
/* panel hooks: slots, dungeon locks */
{const _rp5=renderPanel;renderPanel=function(){_rp5();
  if(tab==='gear')document.querySelectorAll('#list .slot.empty canvas').forEach((c,i)=>{const sl=c.closest('.slot');const all=[...document.querySelectorAll('#list .eqline .slot')];const k=['w','c','a','a'][all.indexOf(sl)]||'a';uiInto(c,'slot_'+k)});
  if(tab==='dungeon')document.querySelectorAll('#list .row canvas').forEach(c=>uiInto(c,'lock'))}}
/* sharper legacy icons: itemIcon + upIcon/shopIcon at 2x */
{const _ii=itemIcon;itemIcon=function(cv,id){cv.width=cv.height=192;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,192,192);x.drawImage(hqItem(id),0,0)}}
const HQI={};function hqItem(id){if(HQI[id])return HQI[id];const it=ITEMS[id];return HQI[id]=hqPaint(x=>{x.lineJoin='round';x.lineCap='round';if(it.c==='c')paintCostume(x,it.cos);else if(it.c==='a')paintAcc(x,id,it);else paintWeapon(x,id,it)})}
for(const fn of ['upIcon','shopIcon']){const orig=window[fn];if(typeof orig!=='function')continue;window[fn]=function(cv,...a){const tmp=document.createElement('canvas');const proxy={width:0,height:0,classList:{remove(){},add(){}},getContext:()=>{const x=tmp.getContext('2d');return x}};
  tmp.width=tmp.height=192;const x=tmp.getContext('2d');const sw=Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype,'width');
  // draw original at 2x by scaling its context
  const realGet=tmp.getContext.bind(tmp);proxy.getContext=()=>{const c=realGet('2d');c.setTransform(2,0,0,2,0,0);return c};Object.defineProperty(proxy,'width',{set(){},get(){return 96}});Object.defineProperty(proxy,'height',{set(){},get(){return 96}});
  orig(proxy,...a);hqInto(cv,tmp)}}
</script>
