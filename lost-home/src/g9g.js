<script>
/* ================= 고퀄 벡터 보스 (마왕군 간부 · 마왕) ================= */
const VO='#120a14';
function vpath(x,pts){x.beginPath();pts.forEach((p,i)=>{if(i===0||p.m)x.moveTo(p[0],p[1]);else if(p.length===2)x.lineTo(p[0],p[1]);else if(p.length===4)x.quadraticCurveTo(p[0],p[1],p[2],p[3]);else x.bezierCurveTo(p[0],p[1],p[2],p[3],p[4],p[5])});x.closePath()}
function vp(x,pts,fill,lw){vpath(x,pts);if(fill){x.fillStyle=fill;x.fill()}if(lw!==0){x.lineWidth=lw||1.3;x.strokeStyle=VO;x.stroke()}}
function vs(x,pts,col){vpath(x,pts);x.fillStyle=col;x.fill()}
function vl(x,pts,col,w,a){x.save();if(a!=null)x.globalAlpha=a;x.beginPath();pts.forEach((p,i)=>{if(i===0)x.moveTo(p[0],p[1]);else if(p.length===2)x.lineTo(p[0],p[1]);else if(p.length===4)x.quadraticCurveTo(p[0],p[1],p[2],p[3]);else x.bezierCurveTo(...p)});x.strokeStyle=col;x.lineWidth=w;x.stroke();x.restore()}
const vlg=(x,x0,y0,x1,y1,c)=>{const g=x.createLinearGradient(x0,y0,x1,y1);c.forEach((cc,i)=>g.addColorStop(i/(c.length-1),cc));return g};
const vrg=(x,cx,cy,r,c)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,r);c.forEach((cc,i)=>g.addColorStop(i/(c.length-1),cc));return g};
function vglow(x,cx,cy,r,col,a){x.save();x.globalCompositeOperation='lighter';x.globalAlpha=a==null?1:a;x.fillStyle=vrg(x,cx,cy,r,[col,'rgba(0,0,0,0)']);x.beginPath();x.arc(cx,cy,r,0,7);x.fill();x.restore()}
function vell(x,cx,cy,rx,ry,rot,fill,lw){x.beginPath();x.ellipse(cx,cy,rx,ry,rot||0,0,7);if(fill){x.fillStyle=fill;x.fill()}if(lw!==0){x.lineWidth=lw||1.3;x.strokeStyle=VO;x.stroke()}}
const STEEL=(x,y0,y1)=>vlg(x,0,y0,0,y1,['#8a94ae','#4a5268','#262a38','#14161e']);
const DSTEEL=(x,y0,y1)=>vlg(x,0,y0,0,y1,['#5a6078','#2c3040','#16181f','#0a0b10']);
function spike(x,bx,by,tx,ty,w,fill){const a=Math.atan2(ty-by,tx-bx)+Math.PI/2;vp(x,[[bx+Math.cos(a)*w,by+Math.sin(a)*w],[tx,ty],[bx-Math.cos(a)*w,by-Math.sin(a)*w]],fill||'#c8c0b0',1)}
function horn(x,pts,w,col){/* pts: base->tip spine */const L=[],R=[];for(let i=0;i<pts.length;i++){const p=pts[i],q=pts[Math.min(i+1,pts.length-1)],o=pts[Math.max(i-1,0)];const a=Math.atan2(q[1]-o[1],q[0]-o[0])+Math.PI/2;const ww=w*(1-i/(pts.length-1))+.2;L.push([p[0]+Math.cos(a)*ww,p[1]+Math.sin(a)*ww]);R.unshift([p[0]-Math.cos(a)*ww,p[1]-Math.sin(a)*ww])}
  vp(x,[...L,...R],col||vlg(x,pts[0][0],pts[0][1],pts[pts.length-1][0],pts[pts.length-1][1],['#2a1c24','#4a3a40','#c8b8a8']),1.2);
  for(let i=1;i<pts.length-1;i++){const p=pts[i],q=pts[i+1],o=pts[i-1];const a=Math.atan2(q[1]-o[1],q[0]-o[0])+Math.PI/2;const ww=w*(1-i/(pts.length-1));vl(x,[[p[0]+Math.cos(a)*ww*.8,p[1]+Math.sin(a)*ww*.8],[p[0]-Math.cos(a)*ww*.8,p[1]-Math.sin(a)*ww*.8]],'rgba(10,6,10,.45)',.6)}}

/* ---------- 강철의 바르카스 (10챕터, 갑옷 간부) ---------- */
function drawBarkas(x,t){const b=Math.sin(t)*.7,sw=Math.sin(t)*2.2,eg=.65+.35*Math.sin(t*2);
  vglow(x,50,97,40,'rgba(170,20,40,.45)');
  /* cape */
  vp(x,[[37,30+b],[65,30+b],[72,58],[86+sw,95],[79,91],[74,99],[66,93],[58,99],[50,93],[42,99],[34,92],[24+sw*.4,96],[30,58]],vlg(x,0,30,0,99,['#6a1222','#36081a','#16040c']));
  vs(x,[[44,34],[60,34],[68,88],[56,93],[44,90],[36,88]],'rgba(0,0,0,.28)');vl(x,[[56,40],[62,92]],'rgba(255,90,110,.18)',1.2);
  /* back leg */
  vp(x,[[54,62],[67,62],[68,78],[56,79]],STEEL(x,62,79));vp(x,[[56,82],[68,82],[70,95],[56,95]],STEEL(x,82,95));vell(x,62,80.5,4.6,3.6,0,STEEL(x,77,84));spike(x,64,80,72,79,1.4);
  vp(x,[[53,95],[72,94],[76,100],[51,100]],DSTEEL(x,94,100));
  /* front leg */
  vp(x,[[33,62],[47,62],[46,78],[32,78]],STEEL(x,62,78));vp(x,[[31,82],[46,82],[46,95],[32,95]],STEEL(x,82,95));vell(x,39,80,5,3.8,0,STEEL(x,76,84));spike(x,36,80,27,78,1.5);
  vp(x,[[22,100],[30,95],[48,94],[49,100]],DSTEEL(x,94,100));vl(x,[[33,85],[33,93]],'rgba(200,210,235,.5)',1);
  /* faulds */
  [[60,72,'#3a4058'],[63,69,'#4a5268']].forEach(([y0,y1,c],i)=>vp(x,[[33-i,y0-6+b],[69+i,y0-6+b],[72-i,y1+b],[30+i,y1+b]],vlg(x,0,y0-6,0,y1,[c,'#1a1d28'])));
  vl(x,[[30,71+b],[72,71+b]],'#a01828',1.4);
  /* torso */
  vp(x,[[31,31+b],[71,31+b],[67,49+b],[63,62+b],[39,62+b],[35,49+b]],STEEL(x,31,62));
  vs(x,[[51,31+b],[71,31+b],[67,49+b],[63,62+b],[51,62+b]],'rgba(0,0,0,.3)');
  vl(x,[[51,33+b],[51,61+b]],'rgba(170,185,215,.55)',1);[[49,53],[55,56]].forEach(([y,y2])=>vl(x,[[39,y+b],[51,y2+b-3],[63,y+b]],'rgba(10,10,20,.6)',1.1));
  vl(x,[[35,33+b],[42,31.5+b]],'rgba(220,230,255,.6)',1.6);
  /* chest core */
  vell(x,51,42+b,6.2,6.2,0,DSTEEL(x,36,48));vell(x,51,42+b,4,4,0,vrg(x,51,42+b,4,['#ffe0e0','#ff2a3a','#5a0010']),.8);vglow(x,51,42+b,12,'rgba(255,40,60,.8)',eg);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*.5;vl(x,[[51+Math.cos(a)*5.2,42+b+Math.sin(a)*5.2],[51+Math.cos(a)*6.2,42+b+Math.sin(a)*6.2]],'#ff4050',.9,eg)}
  /* back arm + pauldron */
  vp(x,[[66,35+b],[77,37+b],[79,50+b],[70,50+b]],STEEL(x,35,50));vp(x,[[69,50+b],[80,50+b],[83,62+b],[72,63+b]],DSTEEL(x,50,63));
  [0,1,2].forEach(i=>spike(x,73+i*3,62+b,72+i*3.5,67+b,1,'#d8d0c0'));
  vell(x,73,31+b,13,9,.25,STEEL(x,22,40));vell(x,74,34+b,10,6,.25,DSTEEL(x,29,40));vl(x,[[63,27+b],[74,23+b]],'rgba(220,230,255,.55)',1.4);
  [[66,24],[72,21],[78,22]].forEach(([sx,sy],i)=>spike(x,sx,sy+b,sx+2+i*2,sy-9+b,1.6,'#ddd4c4'));
  /* helm + horns */
  horn(x,[[44,13+b],[38,9+b],[32,4+b],[27,-1+b],[25,-7+b]],3.2);horn(x,[[57,13+b],[63,8+b],[69,4+b],[74,-1+b],[78,-6+b]],3.2);
  vp(x,[[41,11+b],[46,6+b],[55,6+b],[60,11+b],[61,22+b],[57,30+b],[44,30+b],[40,22+b]],STEEL(x,6,30));
  vs(x,[[51,6+b],[55,6+b],[60,11+b],[61,22+b],[57,30+b],[51,30+b]],'rgba(0,0,0,.3)');vp(x,[[49,4+b],[52,4+b],[53,12+b],[48,12+b]],'#8a1a28',1);
  vp(x,[[42,18+b],[59,18+b],[59,21+b],[52,21+b],[52,28+b],[49,28+b],[49,21+b],[42,21+b]],'#06040a',.8);
  [[45.5,19.5],[55,19.5]].forEach(([ex,ey])=>{vglow(x,ex,ey+b,6,'rgba(255,40,50,1)',eg);x.fillStyle='#ffd0d0';x.fillRect(ex-1.8,ey-.7+b,3.6,1.4)});
  vl(x,[[43,10+b],[47,7+b]],'rgba(230,240,255,.7)',1.2);
  vp(x,[[40,28+b],[61,28+b],[64,33+b],[37,33+b]],DSTEEL(x,28,33));
  /* front arm + cleaver */
  vp(x,[[12,58],[27,58],[25,97],[15,99],[6,93],[9,80],[5,74],[10,68]],vlg(x,5,0,27,0,['#14161e','#3a4056','#6a7490','#b8c4dc']));
  vs(x,[[6,93],[9,80],[5,74],[10,68],[12,58],[17,58],[16,98]],'rgba(0,0,0,.35)');vl(x,[[26,60],[24.5,96]],'#e8f0ff',1.2);
  [64,72,80,88].forEach((y,i)=>{x.save();x.shadowColor='#ff2a3a';x.shadowBlur=4;vl(x,[[15,y],[18,y+2],[16,y+4]],'#ff4a5a',1,eg);x.restore()});
  vp(x,[[17,44],[21,44],[21,58],[17,58]],vlg(x,17,0,21,0,['#3a2a20','#1a120c']));for(let y=45;y<58;y+=2.4)vl(x,[[17,y],[21,y+1.4]],'#8a1a28',.8);
  vp(x,[[6,57],[32,57],[33,61],[5,61]],vlg(x,0,57,0,61,['#c8962a','#7a5210']));vell(x,19,59,4,3.5,0,'#e8e0d0',1);x.fillStyle=VO;x.fillRect(17.5,58.2,1.2,1.2);x.fillRect(19.8,58.2,1.2,1.2);
  vp(x,[[17.5,44],[19,39],[20.5,44]],'#c8962a',1);
  vp(x,[[26,35+b],[36,36+b],[33,49+b],[23,48+b]],STEEL(x,35,49));vp(x,[[14,48+b*.5],[25,47+b*.5],[24,56],[15,57]],DSTEEL(x,47,57));vl(x,[[16,51],[23,50.5]],'rgba(200,210,235,.4)',1);
  vell(x,30,31+b,12,8.5,-.25,STEEL(x,22,40));vell(x,29,34+b,9,6,-.25,DSTEEL(x,29,40));vl(x,[[21,28+b],[30,24+b]],'rgba(230,240,255,.6)',1.4);
  [[22,25],[28,22],[34,22]].forEach(([sx,sy],i)=>spike(x,sx,sy+b,sx-3+i*1.5,sy-10+b,1.6,'#ddd4c4'));
  for(let i=0;i<5;i++){const u=((t/(Math.PI*2))+i/5)%1;x.fillStyle=`rgba(255,${60+i*20},70,${(1-u)*.8})`;x.beginPath();x.arc(20+i*14+Math.sin(u*6+i)*3,98-u*30,1.2*(1-u)+.4,0,7);x.fill()}}

/* ---------- 혈장미의 릴리스 (13챕터, 여간부) ---------- */
function drawLilith(x,t){const b=Math.sin(t)*.8,hs=Math.sin(t+1)*1.8,wf=Math.sin(t)*2.5,eg=.7+.3*Math.sin(t*2);
  vglow(x,50,96,38,'rgba(200,30,80,.4)');
  /* wings */
  const wing=(dir,o)=>{const ox=dir>0?60:42,f=wf*o;const P=[[ox,30+b],[ox+dir*14,14+b-f],[ox+dir*30,4-f],[ox+dir*40,0-f],[ox+dir*36,14-f*.6],[ox+dir*42,24-f*.4],[ox+dir*32,26],[ox+dir*36,38],[ox+dir*24,36],[ox+dir*24,48],[ox+dir*12,40]];
    vp(x,P,vlg(x,ox,0,ox+dir*40,40,['#5a1a5a','#2a0c30','#140616']),1.2);
    [[ox+dir*30,4-f],[ox+dir*36,14-f*.6],[ox+dir*42,24-f*.4],[ox+dir*36,38],[ox+dir*24,48]].forEach(q=>vl(x,[[ox+dir*12,22+b-f*.5],q],'rgba(10,0,14,.8)',1.1));
    vl(x,[[ox,30+b],[ox+dir*14,14+b-f],[ox+dir*30,4-f],[ox+dir*40,0-f]],'#3a1040',2)};
  wing(1,1);wing(-1,.7);
  /* scythe (behind) */
  vl(x,[[80,98],[44,0]],VO,3.6);vl(x,[[80,98],[44,0]],vlg(x,80,98,44,0,['#1a0e14','#4a2a30','#1a0e14']),2);
  vp(x,[[45,3],[30,-2,14,4],[2,18],[14,12,30,10],[44,9]],vlg(x,2,0,45,10,['#ffffff','#b8b0c8','#4a3a58']),1.2);
  x.save();x.shadowColor='#ff2a5a';x.shadowBlur=5;vl(x,[[44,3.6],[30,-1.4,14,4.6],[3,17.4]],'#ff5a8a',1,eg);x.restore();
  vell(x,45,6,3,3,0,'#c8102e',1);vl(x,[[43.6,5],[46.4,7]],'#ff8aa8',.8);
  /* hair back */
  vp(x,[[46,10+b],[58,6+b],[66,16+b],[68+hs,34],[64,48],[70+hs,62],[60,72],[54,56],[52,34]],vlg(x,50,6,66,72,['#f6f2ff','#c8c0e0','#8a7cb0']),1.2);
  vl(x,[[60,14+b],[64+hs*.5,40],[64,62]],'rgba(120,100,170,.6)',.9);vl(x,[[56,20+b],[60,46],[58,64]],'rgba(255,255,255,.6)',.8);
  /* back leg */
  vp(x,[[52,64],[60,64],[60,94],[57,98],[53,98]],vlg(x,52,0,60,0,['#2a1a2e','#0e0812']));vp(x,[[52,95],[61,94],[63,99],[50,99]],'#120a14',1);
  /* skirt */
  vp(x,[[40,52+b],[60,52+b],[66,64],[80+hs,96],[66,94],[58,98],[50,92],[46,72],[36,96],[24,94],[34,66]],vlg(x,40,52,70,96,['#2a1426','#160a16','#0a040a']));
  vs(x,[[46,72],[50,92],[58,98],[54,74]],'#7a0e24');vs(x,[[34,66],[36,96],[24,94]],'rgba(0,0,0,.35)');
  vl(x,[[24,94],[36,96],[46,72]],'#c8962a',1.2);vl(x,[[58,98],[66,94],[80+hs,96]],'#c8962a',1.2);
  /* front leg (slit) */
  vp(x,[[42,64],[50,66],[46,84],[44,94],[41,99],[36,99],[38,92],[40,80]],vlg(x,40,0,50,0,['#3a2240','#140a18']));
  vp(x,[[45,74],[49,70],[50,73],[46,77]],'#f4e4ee',.8);vl(x,[[44,80],[42,92]],'rgba(200,180,230,.45)',1);vp(x,[[35,97],[42,96],[42,99.5],[33,99.5]],'#0a060c',1);vl(x,[[40.5,96],[39.5,100]],'#0a060c',1.4);
  /* corset */
  vp(x,[[40,32+b],[60,32+b],[58,44+b],[56,53+b],[44,53+b],[42,44+b]],vlg(x,0,32,0,53,['#3a1830','#1a0a18']));
  vp(x,[[46,36+b],[54,36+b],[53,52+b],[47,52+b]],vlg(x,0,36,0,52,['#b81838','#6a0a1e']),.9);for(let y=38;y<51;y+=3)vl(x,[[47.5,y+b],[52.5,y+1.6+b]],'#e8c060',.7);
  vl(x,[[41,32+b],[59,32+b]],'#c8962a',1.2);vl(x,[[44,53+b],[56,53+b]],'#c8962a',1.2);
  vp(x,[[42,30+b],[46,28+b],[54,28+b],[58,30+b],[56,34+b],[44,34+b]],'#f4e4ee',.9);
  /* collar fan behind head */
  vp(x,[[40,30+b],[34,14+b],[42,20+b],[46,10+b],[50,20+b],[56,10+b],[58,22+b],[66,16+b],[60,30+b]],vlg(x,0,10,0,30,['#c8102e','#5a0616','#1a0208']),1);
  /* back arm holding scythe */
  vp(x,[[58,32+b],[64,34+b],[68,24],[66,20],[62,26],[57,30]],vlg(x,57,20,68,34,['#2a1a2e','#0e0812']));vell(x,66,20,2.6,2.6,0,'#1a0e1a',1);
  /* front arm on hip */
  vp(x,[[41,32+b],[36,34+b],[32,44+b],[38,52+b],[44,52+b],[40,46+b],[37,42+b],[42,36+b]],vlg(x,32,32,44,52,['#2a1a2e','#0e0812']));vell(x,42,51.5+b,2.6,2.2,0,'#1a0e1a',1);
  vell(x,40,31.5+b,4,3,-.3,vlg(x,0,28,0,35,['#c8962a','#6a4a10']),1);
  /* rose on chest */
  vell(x,50,34+b,2.6,2.4,0,'#c8102e',.9);vl(x,[[49,33.6+b],[50.6,34.6+b],[49.6,35.2+b]],'#ff7a9a',.6);
  /* head */
  vp(x,[[44,22+b],[45,26+b],[48,26+b],[51,24+b],[52,20+b]],'#f4e4ee',.9);
  vp(x,[[42,12+b],[50,8+b],[56,12+b],[56,19+b],[52,25+b],[46,27+b],[42,25+b],[40,20+b],[40,15+b]],vlg(x,0,8,0,27,['#fff6fa','#f4e4ee','#dcc0d4']),1.1);
  vs(x,[[52,12+b],[56,12+b],[56,19+b],[52,25+b],[49,26+b],[52,18+b]],'rgba(170,120,170,.35)');
  /* eyes */
  [[44.2,18.4,3.2],[49.6,18.2,3.4]].forEach(([ex,ey,w])=>{vp(x,[[ex-w/2,ey+b],[ex,ey-1.6+b],[ex+w/2,ey-.4+b],[ex,ey+1.4+b]],'#fff',.6);vell(x,ex+.2,ey-.1+b,1,1.3,0,vrg(x,ex,ey+b,1.4,['#ffb0c0','#e8102e','#4a0010']),0);
    vglow(x,ex,ey+b,3.5,'rgba(255,40,80,1)',eg*.6);x.fillStyle='#fff';x.fillRect(ex-.2,ey-.9+b,.7,.7);vl(x,[[ex-w/2-.4,ey-.2+b],[ex,ey-1.9+b],[ex+w/2+.3,ey-.9+b]],VO,.9)});
  vl(x,[[42.4,14.6+b],[45.6,15.4+b]],VO,.8);vl(x,[[48,15.2+b],[51.6,14.4+b]],VO,.8);
  vl(x,[[44.6,23.6+b],[45.8,24+b],[47,23.4+b]],'#8a0a2a',.9);
  /* bangs */
  vp(x,[[40,16+b],[41,8+b],[48,4+b],[57,8+b],[58,16+b],[55,11+b],[53,15+b],[50,10+b],[47,15+b],[45,10+b],[42,17+b]],vlg(x,40,4,58,16,['#ffffff','#e0dcf0','#a89cc8']),1);
  vp(x,[[40,15+b],[38,24+b],[39+hs*.3,34+b],[36,40+b],[41,32+b],[42,22+b]],vlg(x,0,15,0,40,['#f6f2ff','#a89cc8']),.9);
  /* horns */
  horn(x,[[45,7+b],[42,1+b],[44,-4+b],[50,-7+b],[54,-6+b]],1.8,vlg(x,40,-8,54,8,['#e0d0e0','#3a2a40','#0a060c']));horn(x,[[53,7+b],[56,1+b],[61,-2+b],[66,-1+b]],1.8,vlg(x,52,-2,66,8,['#e0d0e0','#3a2a40','#0a060c']));
  vell(x,56,10+b,2.4,2.2,0,'#c8102e',.8);vell(x,58,12.5+b,1.6,1.5,0,'#8a0a20',.6);
  /* petals */
  for(let i=0;i<6;i++){const u=((t/(Math.PI*2))+i/6)%1,px=10+i*16+Math.sin(u*7+i)*5,py=10+u*86;x.save();x.translate(px,py);x.rotate(u*8+i);x.globalAlpha=1-u*.7;vell(x,0,0,1.6,.9,0,'#d8183e',.5);x.restore()}}

/* ---------- 흑염의 제노스 (17챕터, 마왕의 오른팔) ---------- */
function drawXenos(x,t){const b=Math.sin(t)*.6,cs=Math.sin(t)*2.6,fl=t*1.5,eg=.7+.3*Math.sin(t*2);
  /* black flame aura */
  x.save();x.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const px=20+i*9.5,h=30+((i*37)%18)+Math.sin(fl*2+i)*6,sw2=Math.sin(fl*1.7+i)*4;
    vs(x,[[px-8,99],[px-9,99-h*.4,px+sw2-3,99-h*.7],[px+sw2,99-h],[px+sw2+2,99-h*.6,px+8,99-h*.35],[px+8,99]],vlg(x,0,99-h,0,99,['rgba(200,120,255,0)','rgba(150,60,255,.55)','rgba(60,10,120,.35)']))}x.restore();
  for(let i=0;i<6;i++){const px=24+i*11,h=20+((i*29)%12)+Math.sin(fl*2.4+i)*4;vs(x,[[px-5,99],[px-6,99-h*.5,px-1,99-h*.8],[px+Math.sin(fl+i)*2,99-h],[px+3,99-h*.5,px+5,99]],'rgba(20,4,36,.75)')}
  vglow(x,52,60,46,'rgba(130,40,220,.35)');
  /* coat tails (behind) */
  vp(x,[[44,46+b],[62,46+b],[70,64],[84+cs,96],[72,92],[66,99],[58,90],[52,70]],vlg(x,44,46,84,98,['#1a1424','#0c0812','#040306']));
  vs(x,[[56,52],[66,62],[80+cs,94],[72,90]],'#6a0a1e');
  /* hair back */
  vp(x,[[46,8+b],[60,6+b],[68,18+b],[76+cs*.6,40],[66,36],[70+cs*.4,54],[58,42],[54,24]],vlg(x,46,6,76,54,['#ffffff','#d8d8e8','#8a8aa8']),1.2);
  vl(x,[[58,12+b],[68,30],[70,50]],'rgba(110,110,150,.6)',.9);
  /* back leg */
  vp(x,[[50,62],[59,62],[61,94],[52,94]],vlg(x,50,0,61,0,['#24202e','#0c0a12']));vp(x,[[50,93],[62,92],[66,99],[49,99]],DSTEEL(x,92,99));
  /* front leg */
  vp(x,[[38,62],[49,62],[46,80],[42,94],[34,94],[37,80]],vlg(x,36,0,49,0,['#2c2838','#0e0c14']));vp(x,[[29,99],[34,93],[44,92],[45,99]],DSTEEL(x,92,99));vell(x,42,79,3.6,3,0,DSTEEL(x,76,82),1);
  /* coat body */
  vp(x,[[38,26+b],[62,26+b],[64,46+b],[60,64],[48,64],[44,72],[36,64],[36,46+b]],vlg(x,0,26,0,72,['#2a2238','#14101e','#08060c']));
  vs(x,[[51,26+b],[62,26+b],[64,46+b],[60,64],[51,64]],'rgba(0,0,0,.3)');
  vl(x,[[46,30+b],[44,64],[44,72]],'#c8962a',1.1);vl(x,[[38,26+b],[36,46+b],[36,64]],'#c8962a',1);
  vp(x,[[44,30+b],[52,30+b],[50,46+b],[46,46+b]],vlg(x,0,30,0,46,['#e8e4f0','#a8a4b8']),.9);vl(x,[[48,31+b],[48,45+b]],'#6a0a1e',1.2);
  vp(x,[[36,52],[62,52],[62,56],[36,56]],'#1a1020',1);vell(x,48,54,2.6,2.2,0,'#c8962a',.8);
  /* high collar */
  vp(x,[[38,28+b],[34,14+b],[42,18+b],[44,26+b]],vlg(x,0,14,0,28,['#2a2238','#0c0812']));vp(x,[[60,28+b],[64,12+b],[57,18+b],[55,26+b]],vlg(x,0,12,0,28,['#2a2238','#0c0812']));vs(x,[[60,27+b],[63,15+b],[58,19+b]],'#8a0a22');
  /* pauldron (front) */
  vell(x,38,28+b,8,5.4,-.3,DSTEEL(x,22,34));vl(x,[[32,25+b],[38,23+b]],'rgba(220,220,255,.5)',1);spike(x,34,25+b,27,19+b,1.4,'#c8c0d0');spike(x,38,23.5+b,34,15+b,1.3,'#c8c0d0');
  /* back arm raised with black flame orb */
  vp(x,[[60,28+b],[66,32+b],[70,22],[68,18],[63,24]],vlg(x,60,18,70,32,['#2a2238','#0c0812']));vell(x,69,18,2.4,2.2,0,'#e8e4f0',.9);
  vglow(x,70,12,10,'rgba(170,80,255,1)',eg);x.save();x.globalAlpha=.9;for(let i=0;i<4;i++){const a=fl*2+i*1.57;vs(x,[[66,14],[70+Math.cos(a)*2,6+Math.sin(a)],[74,14],[70,16]],i%2?'#2a0640':'#7a2ad8')}x.restore();vell(x,70,13,2.4,2.4,0,'#f0d8ff',0);
  /* front arm + sword */
  vp(x,[[38,30+b],[32,36+b],[28,50],[24,62],[29,63],[33,51],[38,40+b]],vlg(x,24,30,38,63,['#2a2238','#0c0812']));vell(x,27,64,3,2.6,0,DSTEEL(x,61,67),1);
  x.save();x.shadowColor='#a040ff';x.shadowBlur=8;vp(x,[[25,64],[28,67],[11,97],[8,99],[9,95]],vlg(x,8,99,28,64,['#4a1a7a','#0a0610','#2a2a3a','#e8e0ff']),1);x.restore();
  vl(x,[[27,65.6],[10.4,96]],'#d8c8ff',.7);for(let i=0;i<5;i++){const u=((t/(Math.PI*2))*1.5+i/5)%1,px=26-u*18+Math.sin(u*9+i)*2,py=66+u*30;vs(x,[[px-1.6,py],[px+Math.sin(fl*2+i)*1.5,py-4-(1-u)*2],[px+1.6,py]],i%2?'#b060ff':'#4a0a8a')}
  vp(x,[[24,61],[31,64],[30,66],[23,63]],'#c8962a',.9);vp(x,[[28,58],[31,59],[29,64],[26,63]],'#1a1020',.8);
  /* head */
  vp(x,[[45,20+b],[46,27+b],[51,27+b],[52,21+b]],'#e8d8dc',.9);
  vp(x,[[43,11+b],[51,7+b],[57,11+b],[57,18+b],[53,24+b],[47,25+b],[43,22+b],[42,16+b]],vlg(x,0,7,0,25,['#fbf2f2','#ecdcde','#c8b0b8']),1.1);
  vs(x,[[53,11+b],[57,11+b],[57,18+b],[53,24+b],[50,25+b],[53,17+b]],'rgba(100,80,120,.35)');
  [[45.4,17],[50.6,16.8]].forEach(([ex,ey])=>{vp(x,[[ex-1.8,ey+b],[ex,ey-1+b],[ex+1.8,ey-.2+b],[ex,ey+.8+b]],'#ffe8e8',.5);vell(x,ex+.2,ey+b,.75,.9,0,'#e8102e',0);x.fillStyle=VO;x.fillRect(ex,ey-.7+b,.4,1.4);vglow(x,ex,ey+b,3,'rgba(255,30,60,1)',eg*.7)});
  vl(x,[[43.4,14.6+b],[47,15.6+b]],VO,1);vl(x,[[49,15.4+b],[52.6,14.4+b]],VO,1);vl(x,[[46,21.6+b],[48.4,22.2+b],[50,21.4+b]],'#6a1a2a',.8);vs(x,[[49.4,21.8+b],[49.8,23+b],[50.2,21.8+b]],'#fff');
  /* bangs */
  vp(x,[[41,15+b],[42,7+b],[50,3+b],[58,7+b],[59,15+b],[56,10+b],[55,15+b],[52,9+b],[49,16+b],[47,9+b],[44,14+b]],vlg(x,41,3,59,16,['#ffffff','#e8e8f4','#a8a8c4']),1);
  vp(x,[[42,14+b],[40,24+b],[41,30+b],[44,22+b]],vlg(x,0,14,0,30,['#ffffff','#a8a8c4']),.9);
  /* horns */
  horn(x,[[47,6+b],[48,0+b],[54,-4+b],[62,-6+b],[70,-5+b]],1.8,vlg(x,46,-6,70,6,['#1a1020','#4a3a50','#d82a3a']));horn(x,[[54,6+b],[58,1+b],[66,-1+b],[74,1+b]],1.6,vlg(x,52,-1,74,6,['#1a1020','#4a3a50','#d82a3a']))}

/* ---------- 마왕 메가와트 (20챕터, 3형태) ---------- */
function drawLord(x,t,ph){const b=Math.sin(t)*(ph>2?1.2:.7),wf=Math.sin(t)*(ph>1?3.5:2),eg=.7+.3*Math.sin(t*2),SK=ph>2?['#c84050','#7a1a2a','#3a0810']:['#7a5a7a','#4a3050','#241828'],EY=ph>1?'#ff2a3a':'#c88aff',AU=ph>1?'rgba(255,40,70,':'rgba(170,90,255,';
  vglow(x,50,60,58,AU+'.4)');
  if(ph>1)for(let i=0;i<5;i++){const a=t*.7+i*1.26;vl(x,[[50,46],[50+Math.cos(a)*30,46+Math.sin(a)*22],[50+Math.cos(a+.2)*44,46+Math.sin(a+.2)*34]],ph>2?'#ff6a8a':'#d8a8ff',1,.5+.4*Math.sin(t*5+i))}
  /* wings */
  const wing=(dir,s,yo,col)=>{const ox=dir>0?62:38,f=wf*s;const P=[[ox,30+yo+b],[ox+dir*12*s,10+yo-f],[ox+dir*30*s,-2+yo-f],[ox+dir*48*s,0+yo-f],[ox+dir*42*s,14+yo-f*.6],[ox+dir*50*s,28+yo-f*.3],[ox+dir*38*s,30+yo],[ox+dir*44*s,46+yo],[ox+dir*28*s,42+yo],[ox+dir*26*s,56+yo],[ox+dir*12*s,46+yo]];
    vp(x,P,col,1.3);[[ox+dir*30*s,-2+yo-f],[ox+dir*48*s,0+yo-f],[ox+dir*50*s,28+yo-f*.3],[ox+dir*44*s,46+yo],[ox+dir*26*s,56+yo]].forEach(q=>vl(x,[[ox+dir*12*s,24+yo-f*.5],q],'rgba(10,0,10,.85)',1.3));
    vl(x,[[ox,30+yo+b],[ox+dir*12*s,10+yo-f],[ox+dir*30*s,-2+yo-f],[ox+dir*48*s,0+yo-f]],ph>2?'#5a1020':'#2a1a30',2.4)};
  const WC=x2=>vlg(x,0,0,0,56,ph>2?['#6a1022','#3a0612','#140206']:['#3a2a4a','#1c1226','#0a0610']);
  if(ph>2){wing(1,.85,18,WC());wing(-1,.75,18,WC())}
  wing(1,ph>1?1.05:.85,0,WC());wing(-1,ph>1?.95:.75,0,WC());
  /* cape */
  if(ph<3)vp(x,[[34,30+b],[66,30+b],[74,60],[84,98],[64,94],[50,99],[36,94],[16,98],[26,60]],vlg(x,0,30,0,99,['#5a0a1e','#2a0410','#0c0206']));
  /* tail (p3) */
  if(ph>2){vl(x,[[60,74],[80,82,92,72],[96,58]],VO,5);vl(x,[[60,74],[80,82,92,72],[96,58]],'#8a2030',3);vp(x,[[94,62],[99,50],[100,62]],'#e8d8c8',1)}
  /* legs */
  const LG=ph>2?vlg(x,0,60,0,100,SK):DSTEEL(x,60,100);
  vp(x,[[51,62],[70,62],[73,74,70,82],[68,96],[57,96],[55,82,53,72]],LG);vp(x,[[30,62],[49,62],[47,72,45,82],[43,96],[29,96],[27,82,27,74]],LG);
  if(ph<3){vell(x,39,79,5.5,4.4,0,STEEL(x,74,84));vell(x,62,79,5.2,4.2,0,STEEL(x,74,84));spike(x,35,78,26,75,1.6);spike(x,66,78,74,74,1.4)}
  vp(x,[[22,100],[28,94],[44,94],[46,100]],ph>2?'#1a0608':DSTEEL(x,94,100));vp(x,[[54,100],[56,94],[70,94],[76,100]],ph>2?'#1a0608':DSTEEL(x,94,100));
  if(ph>2)[[24,99],[28,99],[32,99],[72,99],[76,99]].forEach(([cx,cy])=>vp(x,[[cx,cy],[cx-3,cy+1],[cx+1,cy-2]],'#e8d8c8',.6));
  /* torso */
  vp(x,[[28,28+b],[72,28+b],[70,48+b],[64,64],[36,64],[30,48+b]],vlg(x,0,28,0,64,SK));
  [[40,34,48,40],[52,40,60,34],[38,46,62,46],[42,54,58,54]].forEach(([a,c,d,e])=>vl(x,[[a,c+b],[(a+d)/2,c+4+b],[d,e+b]],'rgba(10,0,10,.55)',1));vl(x,[[50,34+b],[50,62]],'rgba(10,0,10,.45)',1);
  vl(x,[[33,30+b],[42,31+b]],'rgba(255,255,255,.3)',1.4);
  if(ph===1){/* armor plate over chest */vp(x,[[30,28+b],[70,28+b],[67,44+b],[50,50+b],[33,44+b]],STEEL(x,28,50));vs(x,[[50,28+b],[70,28+b],[67,44+b],[50,50+b]],'rgba(0,0,0,.3)');vl(x,[[34,31+b],[44,30+b]],'rgba(230,240,255,.55)',1.4);}
  if(ph===2){vp(x,[[30,28+b],[44,28+b],[40,38+b],[34,44+b]],STEEL(x,28,44));vp(x,[[56,28+b],[70,28+b],[66,44+b],[62,36+b]],STEEL(x,28,44));
    x.save();x.shadowColor='#c88aff';x.shadowBlur=5;[[44,34,50,44],[56,34,52,46],[40,48,46,58],[60,48,54,58]].forEach(([a,c,d,e])=>vl(x,[[a,c+b],[(a+d)/2+1,(c+e)/2+b],[d,e+b]],'#e0b0ff',1.1,eg));x.restore()}
  /* core */
  vglow(x,50,41+b,ph>2?18:12,AU+'1)',eg);vell(x,50,41+b,ph>2?5:3.6,ph>2?5:3.6,0,vrg(x,50,41+b,5,['#ffffff',EY,'#2a0030']),.9);
  vp(x,[[30,62],[70,62],[72,68],[28,68]],ph>2?'#2a0608':DSTEEL(x,62,68));vell(x,50,65,4,3,0,vlg(x,0,62,0,68,['#ffd23a','#8a5a00']),.9);
  /* arms */
  const AR=ph>2?vlg(x,0,30,0,64,SK):DSTEEL(x,30,64);
  vp(x,[[70,32+b],[82,36+b],[86,52],[78,54],[72,44]],AR);vp(x,[[77,52],[88,52],[90,64],[80,66]],ph>2?vlg(x,0,52,0,66,SK):DSTEEL(x,52,66));
  for(let i=0;i<4;i++)vp(x,[[80+i*2.6,65],[79.5+i*2.8,71],[82+i*2.6,66]],'#e8d8c8',.6);
  vp(x,[[30,32+b],[18,36+b],[12,50],[20,54],[28,44]],AR);vp(x,[[10,50],[22,52],[22,64],[10,64]],ph>2?vlg(x,0,50,0,64,SK):DSTEEL(x,50,64));
  for(let i=0;i<4;i++)vp(x,[[11+i*2.8,63],[10+i*3,70],[13+i*2.8,64]],'#e8d8c8',.6);
  if(ph<3){vglow(x,16,62,12,AU+'1)',eg);vell(x,16,66,5,5,0,vrg(x,16,66,5,['#fff',EY,'#2a0030']),.8)}
  else{x.save();x.shadowColor='#ff4a6a';x.shadowBlur=6;for(let i=0;i<3;i++)vl(x,[[12+i*4,70],[10+i*4+Math.sin(t*8+i)*2,78],[14+i*4,86]],'#ff8aa0',1,eg);x.restore()}
  /* pauldrons */
  if(ph<3){[[28,28,-.3,-1],[72,28,.3,1]].forEach(([cx,cy,r,d])=>{vell(x,cx,cy+b,13,9,r,STEEL(x,19,37));vell(x,cx+d*1,cy+3+b,10,6,r,DSTEEL(x,25,37));for(let i=0;i<3;i++)spike(x,cx-6*d+i*5*d,cy-6+b,cx-8*d+i*6*d,cy-17+b-(i===1?3:0),1.8,'#e0d4c4');
    vell(x,cx,cy+1+b,3,3,0,'#e8e0d0',.8);x.fillStyle=VO;x.fillRect(cx-1.6,cy+.2+b,1.2,1.2);x.fillRect(cx+.4,cy+.2+b,1.2,1.2)})}
  else [[30,28],[70,28]].forEach(([cx,cy])=>{for(let i=0;i<4;i++)spike(x,cx-6+i*4,cy-2+b,cx-8+i*5,cy-12+b-(i%2)*3,1.4,'#e8d8c8')});
  /* neck/head */
  vp(x,[[42,20+b],[58,20+b],[60,30+b],[40,30+b]],vlg(x,0,20,0,30,SK));
  vp(x,[[40,10+b],[50,4+b],[60,10+b],[61,20+b],[56,27+b],[44,27+b],[39,20+b]],vlg(x,0,4,0,27,SK),1.2);
  vs(x,[[50,4+b],[60,10+b],[61,20+b],[56,27+b],[50,27+b]],'rgba(0,0,0,.3)');
  /* hair (p1,p2) */
  if(ph<3)vp(x,[[38,14+b],[40,4+b],[50,0+b],[60,4+b],[62,14+b],[66,26+b],[60,20+b],[58,10+b],[52,8+b],[44,9+b],[41,16+b],[36,26+b]],vlg(x,0,0,0,26,['#3a2a4a','#120a18']),1);
  /* face */
  [[45,15],[55,15]].forEach(([ex,ey])=>{vp(x,[[ex-3,ey+b],[ex,ey-1.8+b],[ex+3,ey-.4+b],[ex,ey+1.4+b]],'#1a0208',.6);vglow(x,ex,ey+b,5,AU+'1)',eg);vell(x,ex,ey-.2+b,1.2,1.2,0,EY,0);x.fillStyle='#fff';x.fillRect(ex-.4,ey-.9+b,.8,.8)});
  vl(x,[[41,11.5+b],[47,13.6+b]],VO,1.6);vl(x,[[59,11.5+b],[53,13.6+b]],VO,1.6);
  if(ph>2){vell(x,50,9+b,1.6,2.4,0,vrg(x,50,9+b,2.4,['#fff','#ff2a3a','#2a0008']),.7);vglow(x,50,9+b,5,'rgba(255,40,60,1)',eg)}
  vp(x,[[44,21+b],[56,21+b],[54,24.5+b],[46,24.5+b]],'#1a0208',.8);for(let i=0;i<(ph>2?6:4);i++){const fx=44.6+i*(ph>2?1.9:2.8);vs(x,[[fx,21+b],[fx+.7,23+b],[fx+1.4,21+b]],'#fff')}
  /* horns */
  const HC=vlg(x,30,-10,70,14,['#e8d8c8','#5a4a50','#1a0e14']);
  horn(x,[[41,9+b],[34,5+b],[29,-2+b],[30,-8+b],[35,-12+b]],ph>1?3.4:3,HC);horn(x,[[59,9+b],[66,5+b],[71,-2+b],[70,-8+b],[65,-12+b]],ph>1?3.4:3,HC);
  if(ph>1){horn(x,[[43,5+b],[40,-2+b],[41,-8+b]],1.8,HC);horn(x,[[57,5+b],[60,-2+b],[59,-8+b]],1.8,HC)}
  /* crown (floating) */
  if(ph<3){const cy=-6+b+Math.sin(t*2)*.8;vglow(x,50,cy,10,'rgba(255,210,80,1)',.5);vp(x,[[42,cy+3],[43,cy-3],[46,cy],[50,cy-5],[54,cy],[57,cy-3],[58,cy+3]],vlg(x,0,cy-5,0,cy+3,['#fff2a0','#d09a20','#7a4a00']),1);vell(x,50,cy-.2,1.3,1.3,0,'#c8102e',.6)}
  /* greatsword over shoulder (p1) */
  if(ph===1){x.save();x.translate(84,40+b);x.rotate(.35);vp(x,[[-4,-46],[4,-46],[5,6],[0,12],[-5,6]],vlg(x,-5,0,5,0,['#1a1020','#4a3a5a','#9a8ab8']),1.1);x.save();x.shadowColor='#c88aff';x.shadowBlur=5;vl(x,[[0,-40],[0,2]],'#e0b0ff',.9,eg);x.restore();vp(x,[[-10,6],[10,6],[10,9],[-10,9]],vlg(x,0,6,0,9,['#ffd23a','#7a4a00']),1);vp(x,[[-2,9],[2,9],[2,20],[-2,20]],'#2a1a20',1);x.restore()}
  /* embers */
  for(let i=0;i<7;i++){const u=((t/(Math.PI*2))+i/7)%1;x.fillStyle=(ph>1?`rgba(255,${80+i*15},90,`:`rgba(200,140,255,`)+(1-u)*.85+')';x.beginPath();x.arc(10+i*13+Math.sin(u*6+i)*4,98-u*60,1.1*(1-u)+.3,0,7);x.fill()}}

const VBOSS={barkas:{d:drawBarkas},lilith:{d:drawLilith},xenos:{d:drawXenos},mega1:{d:(x,t)=>drawLord(x,t,1)},mega2:{d:(x,t)=>drawLord(x,t,2)},mega3:{d:(x,t)=>drawLord(x,t,3)}};
/* 100단위 박스 → 디자인 단위: 박스 높이 100 = 52 디자인 */
const VB_U=.42,VB_PAD=10;
function vbFrames(type,s,res){const D=VBOSS[type];const pxu=VB_U*s*res;const W=Math.ceil((100+VB_PAD*2)*pxu),Hh=Math.ceil((100+VB_PAD*2)*pxu);
  const fr=[0,1,2,3].map(i=>{const c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';x.scale(pxu,pxu);x.translate(VB_PAD,VB_PAD);D.d(x,i/4*Math.PI*2);return c});
  return{fr,w:W,h:Hh,ax:Math.round((50+VB_PAD)*pxu),ay:Math.round((100+VB_PAD)*pxu),s}}
{const _mf=mobFrames;mobFrames=function(t,s){if(VBOSS[t]){const key='VB'+t+s;if(SPR[key])return SPR[key];return SPR[key]=vbFrames(t,s,1)}return _mf(t,s)}}
{const _mh=mobHD;mobHD=function(t,s){if(VBOSS[t]){const key='VB'+t+'|'+s;if(SPR2[key])return SPR2[key];const R=2;const f=vbFrames(t,s,2*R);f.res=R;return SPR2[key]=f}return _mh(t,s)}}
</script>
