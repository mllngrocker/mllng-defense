/* ---------- monster archetypes (part 2) ---------- */
function legs2(c,ph,col,y=-12,gap=10,len=12){for(const[i,x]of[[0,-gap],[1,gap]]){const sw=Math.sin(ph+i*Math.PI)*6;rr(c,x-5+sw,y,10,len,4);fs(c,col,2.2);}}
ART.walker=(c,m)=>{const t=m.t,ph=m.ph,b=m.b,a=m.a,sub=m.sub,bob=Math.abs(Math.sin(ph))*3,atk=m.atk>=0?Math.sin(m.atk*Math.PI):0;
 legs2(c,ph,shade(b,-.25),-14,9,14);c.save();c.translate(-atk*8,-bob);
 const arm=(x,y,ang)=>{c.save();c.translate(x,y);c.rotate(ang);rr(c,-4,0,8,18,4);fs(c,shade(b,-.1),2);c.restore();};
 let fy=-44;
 if(sub==='bottle'){arm(12,-46,.3);c.beginPath();c.moveTo(-16,-14);c.lineTo(-16,-50);c.quadraticCurveTo(-16,-62,-7,-66);c.lineTo(-7,-74);c.lineTo(7,-74);c.lineTo(7,-66);c.quadraticCurveTo(16,-62,16,-50);c.lineTo(16,-14);c.closePath();
  c.globalAlpha=.8;fs(c,rgrad(c,-2,-40,22,b));c.globalAlpha=1;rr(c,-9,-82,18,9,3);fs(c,a,2);rr(c,-16,-40,32,12,0);c.fillStyle=a;c.globalAlpha=.75;c.fill();c.globalAlpha=1;gloss(c,-9,-52,3,10,.6);fy=-52;}
 else if(sub==='stump'){arm(14,-40,.4);c.beginPath();c.moveTo(-22,-12);c.lineTo(-20,-56);c.lineTo(20,-56);c.lineTo(22,-12);c.closePath();fs(c,lgrad(c,-56,-12,b));
  c.strokeStyle=shade(b,-.35);c.lineWidth=1.6;for(const x of[-12,-2,10]){c.beginPath();c.moveTo(x,-52);c.lineTo(x+2,-16);c.stroke();}
  ell(c,0,-56,20,7);fs(c,shade(b,.3),2);c.beginPath();for(let r=3;r<18;r+=5)c.ellipse(0,-56,r,r*.33,0,0,TAU);c.strokeStyle=shade(b,-.1);c.lineWidth=1.2;c.stroke();
  c.save();c.translate(10,-60);c.rotate(Math.sin(t*3)*.2);ell(c,4,-8,6,10,.5);fs(c,a,2);c.restore();fy=-38;}
 else if(sub==='cactus'){c.save();c.translate(16,-46);c.rotate(.2+atk*.6);rr(c,0,-20,12,24,6);fs(c,rgrad(c,6,-8,12,b));c.restore();
  rr(c,-17,-74,34,62,16);fs(c,rgrad(c,0,-44,30,b));c.strokeStyle=shade(b,-.3);c.lineWidth=1.4;for(const x of[-8,0,8]){c.beginPath();c.moveTo(x,-70);c.lineTo(x,-16);c.stroke();}
  c.strokeStyle='#fff6d0';c.lineWidth=1.2;for(let i=0;i<10;i++){const x=-15+(i%3)*15,y=-66+i*5;c.beginPath();c.moveTo(x,y);c.lineTo(x-3,y-2);c.stroke();}
  ell(c,0,-76,7,5);fs(c,a,2);fy=-50;}
 else if(sub==='cone'){c.beginPath();c.moveTo(-24,-12);c.lineTo(-6,-76);c.lineTo(6,-76);c.lineTo(24,-12);c.closePath();fs(c,lgrad(c,-76,-12,b));
  for(const y of[-58,-36]){const hw=6+(y+80)/64*18;rr(c,-hw,y,hw*2,8,2);c.fillStyle='#fff';c.fill();}
  rr(c,-28,-16,56,8,3);fs(c,shade(b,-.2),2);fy=-46;}
 else if(sub==='box'){arm(22,-44,.3);rr(c,-22,-74,44,62,7);fs(c,lgrad(c,-74,-12,b));rr(c,-16,-68,22,30,4);c.fillStyle=shade(a,-.1);c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
  for(let i=0;i<3;i++){rr(c,-13+i*7,-62,5,7,1);c.fillStyle=['#ff6a6a','#ffd23a','#6ad0ff'][i];c.fill();}rr(c,10,-62,7,20,2);c.fillStyle=shade(b,-.3);c.fill();gloss(c,-12,-64,4,8,.4);fy=-30;}
 else if(sub==='shroom'){rr(c,-12,-46,24,34,9);fs(c,rgrad(c,0,-28,18,'#fff4ea'));c.beginPath();c.moveTo(-34,-44);c.bezierCurveTo(-34,-80,34,-80,34,-44);c.quadraticCurveTo(0,-36,-34,-44);fs(c,rgrad(c,0,-58,34,b));
  for(const[x,y,r]of[[-16,-58,5],[2,-66,6],[18,-54,4.5],[-4,-50,3.5]]){ell(c,x,y,r,r*.8);c.fillStyle=a;c.fill();}fy=-30;}
 else if(sub==='goblin'){arm(16,-38,.5+atk);ell(c,0,-30,16,18);fs(c,rgrad(c,0,-30,18,shade(a,-.3)));ell(c,0,-58,20,18);fs(c,rgrad(c,0,-58,20,b));
  for(const s of[-1,1]){c.beginPath();c.moveTo(s*16,-62);c.lineTo(s*30,-70);c.lineTo(s*18,-54);fs(c,b,2);}
  c.beginPath();c.arc(0,-66,19,Math.PI,0);c.closePath();fs(c,a,2);rr(c,-21,-68,42,5,2);fs(c,shade(a,-.2),2);fang(c,-8,-48,.9);fy=-58;}
 else if(sub==='skel'){arm(13,-48,.4+atk*1.2);c.save();c.translate(13,-48);c.rotate(.4+atk*1.2);c.translate(0,18);rr(c,-2,0,4,30,1);fs(c,'#8a8f9e',1.6);rr(c,-6,-2,12,4,1);fs(c,'#6a5a4a',1.4);c.restore();
  c.lineCap='round';for(const[w,col]of[[6,OL],[3.5,b]]){c.lineWidth=w;c.strokeStyle=col;c.beginPath();c.moveTo(0,-16);c.lineTo(0,-54);c.stroke();
   for(let i=0;i<4;i++){c.beginPath();c.ellipse(0,-50+i*7,12-i*1.6,3.6,0,.15,Math.PI-.15);c.stroke();}}
  ell(c,0,-16,10,5);fs(c,rgrad(c,0,-16,10,b),2);ell(c,0,-66,13,12);fs(c,rgrad(c,0,-66,13,b));rr(c,-9,-58,14,7,2);fs(c,shade(b,-.1),2);
  for(let i=0;i<4;i++){c.beginPath();c.moveTo(-6+i*3.5,-58);c.lineTo(-6+i*3.5,-52);c.lineWidth=1;c.strokeStyle=OL;c.stroke();}
  c.shadowColor=a;c.shadowBlur=10;for(const x of[-6,4]){ell(c,x,-67,3.6,4.2);c.fillStyle='#1a0e0e';c.fill();ell(c,x,-67,1.5,1.5);c.fillStyle=a;c.fill();}c.shadowBlur=0;
  c.restore();return;}
 else{ // robot
  arm(22,-46,.3+atk*.8);rr(c,-20,-52,40,40,8);fs(c,lgrad(c,-52,-12,b));rr(c,-12,-44,24,14,4);c.fillStyle=shade(b,-.3);c.fill();
  for(let i=0;i<3;i++){ell(c,-6+i*6,-37,2,2);c.fillStyle=i===1?a:'#9aa';c.fill();}
  rr(c,-18,-84,36,30,9);fs(c,lgrad(c,-84,-54,shade(b,.1)));rr(c,-15,-76,30,11,5);c.fillStyle='#14182a';c.fill();
  const g=c.createLinearGradient(-15,0,15,0);g.addColorStop(0,a);g.addColorStop(1,shade(a,.5));rr(c,-13,-74,14,7,3);c.fillStyle=g;c.fill();
  c.beginPath();c.moveTo(0,-84);c.lineTo(0,-94);c.lineWidth=2.4;c.strokeStyle=OL;c.stroke();ell(c,0,-96,3.5,3.5);c.fillStyle=a;c.fill();c.restore();return;}
 eye(c,-9,fy,5,-1,1);eye(c,6,fy,5,-1,1);mouth(c,-2,fy+11,8,atk>.2?.8:0);
 c.restore();};
ART.beast=(c,m)=>{const t=m.t,ph=m.ph,b=m.b,a=m.a,sub=m.sub,long=sub==='lizard'||sub==='gator',bob=Math.abs(Math.sin(ph))*2.5,atk=m.atk>=0?Math.sin(m.atk*Math.PI):0;
 const L=long?34:24;for(const[i,x]of[[0,-L*.6],[1,L*.5],[2,-L*.3],[3,L*.8]]){const sw=Math.sin(ph+i*1.7)*5;rr(c,x-4+sw,-16,9,16,4);fs(c,shade(b,i>1?-.1:-.3),2.2);}
 c.save();c.translate(-atk*10,-bob);
 // tail
 c.beginPath();if(sub==='rat'){c.moveTo(L,-24);c.bezierCurveTo(L+20,-24,L+26,-44+Math.sin(t*4)*6,L+14,-50);c.lineWidth=3;c.strokeStyle=a;c.stroke();}
 else if(sub==='beaver'){ell(c,L+12,-18,14,6,.3);fs(c,'#5a3a2a',2.2);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;for(let i=-2;i<3;i++){c.beginPath();c.moveTo(L+4+i*4,-22);c.lineTo(L+8+i*4,-14);c.stroke();}}
 else if(long){c.moveTo(L-4,-30);c.quadraticCurveTo(L+26,-26+Math.sin(t*3)*5,L+40,-14);c.quadraticCurveTo(L+20,-18,L-4,-20);c.closePath();fs(c,lgrad(c,-30,-14,b),2.4);}
 // body
 ell(c,4,-30,L+8,long?13:18);fs(c,rgrad(c,4,-30,L+8,b));
 if(long){c.fillStyle=shade(a,.1);for(let i=0;i<4;i++){ell(c,-10+i*12,-38,4,2.5);c.fill();}}
 if(sub==='boar'&&m.id==='excav'){rr(c,-46,-36,10,30,3);fs(c,a,2);} // bulldozer blade
 if(sub==='mole'){ell(c,-30,-46,12,6);fs(c,'#ffd23a',2);ell(c,-36,-46,4,4);c.fillStyle='#fff8c0';c.fill();}
 // head
 const hx=-L-(long?6:2),hy=long?-30:-38;
 if(long){c.beginPath();c.moveTo(hx+14,hy-12);c.quadraticCurveTo(hx-8,hy-12,hx-26,hy-3-atk*6);c.lineTo(hx-26,hy+2);c.quadraticCurveTo(hx-6,hy+10,hx+14,hy+10);c.closePath();fs(c,rgrad(c,hx,hy,22,b));
  if(sub==='gator')for(let i=0;i<4;i++)fang(c,hx-22+i*6,hy-1,.8);
  if(a==='#2a2a3a'){rr(c,hx-8,hy-13,16,7,3);fs(c,'#1a1a24',1.6);gloss(c,hx-4,hy-11,3,1.5,.6);}else eye(c,hx+2,hy-12,5,-1,1);}
 else{ell(c,hx,hy,17,15);fs(c,rgrad(c,hx,hy,17,b));
  if(sub==='rat'||sub==='beaver'||sub==='mole'){ell(c,hx+4,hy-16,6,6);fs(c,shade(a,.2),2);}
  else{c.beginPath();c.moveTo(hx+2,hy-12);c.lineTo(hx+10,hy-26);c.lineTo(hx+12,hy-10);fs(c,b,2);}
  ell(c,hx-14,hy+3,8,6.5);fs(c,shade(b,.15),2);ell(c,hx-18,hy+2,2,2);c.fillStyle=OL;c.fill();
  if(sub==='boar'){c.beginPath();c.moveTo(hx-10,hy+8);c.quadraticCurveTo(hx-18,hy+4,hx-16,hy-4);c.lineWidth=3;c.strokeStyle='#fff8e0';c.stroke();}
  if(sub==='beaver'){rr(c,hx-14,hy+8,7,7,1);fs(c,'#fff',1.5);}
  if(sub==='mole'){for(let i=0;i<3;i++){c.beginPath();c.moveTo(hx-6+i*3,-6);c.lineTo(hx-10+i*3,0);c.lineWidth=2;c.strokeStyle='#f0e0c0';c.stroke();}}
  eye(c,hx-4,hy-5,5,-1,1);}
 c.restore();};
ART.golem=(c,m)=>{const t=m.t,ph=m.ph,b=m.b,a=m.a,sub=m.sub,br=Math.sin(t*2)*2,atk=m.atk>=0?m.atk:-1;
 const sm=atk<0?0:(atk<.4?-ease(atk/.4)*1.4:lerp(-1.4,.9,ease((atk-.4)/.6)));
 const tex=(x,y,w,h)=>{c.save();c.clip();
  if(sub==='brick'){c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.5;for(let yy=y;yy<y+h;yy+=9){c.beginPath();c.moveTo(x,yy);c.lineTo(x+w,yy);c.stroke();for(let xx=x+((yy/9)%2?0:9);xx<x+w;xx+=18){c.beginPath();c.moveTo(xx,yy);c.lineTo(xx,yy+9);c.stroke();}}}
  else if(sub==='crystal'){for(let i=0;i<5;i++){const cx=x+10+((i*29)%(w-20)),cy=y+8+((i*19)%(h-24));c.beginPath();c.moveTo(cx,cy-12);c.lineTo(cx+7,cy);c.lineTo(cx,cy+10);c.lineTo(cx-7,cy);c.closePath();
   c.fillStyle=a;c.globalAlpha=.75;c.shadowColor=a;c.shadowBlur=10;c.fill();c.shadowBlur=0;c.globalAlpha=1;c.lineWidth=1.4;c.strokeStyle='rgba(255,255,255,.6)';c.stroke();}}
  else if(sub==='rock'||sub==='demon'||sub==='bone'){c.strokeStyle=a;c.lineWidth=2;c.shadowColor=a;c.shadowBlur=8;c.beginPath();c.moveTo(x+w*.3,y);c.lineTo(x+w*.45,y+h*.4);c.lineTo(x+w*.3,y+h*.7);c.moveTo(x+w*.45,y+h*.4);c.lineTo(x+w*.75,y+h*.55);c.stroke();c.shadowBlur=0;}
  else if(sub==='metal'){c.fillStyle='rgba(255,255,255,.18)';for(let i=0;i<6;i++){ell(c,x+6+(i%3)*(w-12)/2,y+6+Math.floor(i/3)*(h-12),2,2);c.fill();}c.strokeStyle=a;c.globalAlpha=.6+.4*Math.sin(t*12);c.lineWidth=1.5;c.beginPath();c.moveTo(x+w*.2,y+h*.5);for(let i=1;i<6;i++)c.lineTo(x+w*.2+i*w*.12,y+h*.5+(i%2?-6:6));c.stroke();c.globalAlpha=1;}
  else if(sub==='wood'){c.strokeStyle='rgba(40,25,10,.35)';c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(x+i*w/5+4,y);c.bezierCurveTo(x+i*w/5,y+h*.4,x+i*w/5+8,y+h*.6,x+i*w/5+3,y+h);c.stroke();}}
  else{const cols=['#e04848','#4ac0ff','#ffd23a','#9be37a','#f4f6fb'];for(let i=0;i<9;i++){c.save();c.translate(x+((i*37)%w),y+((i*23)%h));c.rotate(i);rr(c,-6,-4,12,8,2);c.fillStyle=cols[i%5];c.globalAlpha=.85;c.fill();c.restore();}c.globalAlpha=1;}
  c.restore();};
 // legs
 for(const[i,x]of[[0,-22],[1,22]]){const sw=Math.sin(ph+i*Math.PI)*5;rr(c,x-15+sw,-34,30,34,9);fs(c,lgrad(c,-34,0,shade(b,-.15)),3);}
 c.save();c.translate(0,br);
 // back arm
 c.save();c.translate(30,-108);c.rotate(.25-sm*.3);rr(c,-13,0,26,58,12);fs(c,lgrad(c,0,58,shade(b,-.2)),3);c.restore();
 // body
 rr(c,-48,-128,96,98,26);fs(c,rgrad(c,-6,-82,64,b),3.2);rr(c,-48,-128,96,98,26);tex(-48,-128,96,98);
 if(sub==='wood'){for(const[x,y]of[[-30,-128],[10,-134],[34,-120]]){ell(c,x,y,14,9);fs(c,a,2.4);}}
 if(sub==='brick'){rr(c,18,-170,22,46,4);fs(c,shade(b,-.1),2.6);for(let i=0;i<3;i++){ell(c,30+Math.sin(t+i)*6,-180-i*14-((t*20)%14),9+i*3,7+i*2);c.fillStyle=`rgba(80,80,90,${.4-i*.1})`;c.fill();}}
 if(sub==='demon'){for(const s of[-1,1]){c.beginPath();c.moveTo(s*24,-150);c.quadraticCurveTo(s*48,-176,s*40,-196);c.quadraticCurveTo(s*34,-170,s*10,-150);fs(c,'#e8dcc8',2.6);}}
 // head
 rr(c,-34,-160,64,46,18);fs(c,rgrad(c,-4,-140,40,shade(b,.08)),3.2);
 const glow=.75+.25*Math.sin(t*4);c.shadowColor=a;c.shadowBlur=16;for(const x of[-18,0]){ell(c,x,-140,6.5,5);c.fillStyle=a;c.globalAlpha=glow;c.fill();}c.globalAlpha=1;c.shadowBlur=0;
 c.beginPath();c.moveTo(-28,-150);c.lineTo(-10,-146);c.moveTo(-4,-146);c.lineTo(8,-150);c.lineWidth=3.4;c.lineCap='round';c.strokeStyle=OL;c.stroke();
 rr(c,-22,-128,26,7,3);c.fillStyle='#2a1420';c.fill();fang(c,-16,-128,1);fang(c,-4,-128,1);
 // front arm (smash)
 c.save();c.translate(-34,-110);c.rotate(-.2+sm);rr(c,-14,0,28,62,13);fs(c,lgrad(c,0,62,b),3);ell(c,0,66,19,15);fs(c,rgrad(c,0,66,19,shade(b,-.1)),3);c.restore();
 c.restore();};
ART.squid=(c,m)=>{const t=m.t,b=m.b,a=m.a,bob=Math.sin(t*2+m.seed)*3,atk=m.atk>=0?Math.sin(m.atk*Math.PI):0;c.save();c.translate(0,bob);
 for(let i=0;i<6;i++){const x=-24+i*10;c.beginPath();c.moveTo(x,-36);let px=x,py=-36;for(let k=1;k<=8;k++){px=x+Math.sin(t*3+k*.7+i*1.3)*(3+k)-(i<2?atk*k*3:0);py=-36+k*4.6;c.lineTo(px,py);}
  c.lineWidth=10-0;c.lineCap='round';c.lineJoin='round';c.strokeStyle=OL;c.stroke();c.lineWidth=7;c.strokeStyle=shade(b,-.1);c.stroke();
  ell(c,px+1,py-6,1.6,1.6);c.fillStyle=a;c.fill();}
 c.beginPath();c.moveTo(-34,-36);c.bezierCurveTo(-40,-86,-14,-104,4,-102);c.bezierCurveTo(26,-100,38,-82,32,-36);c.quadraticCurveTo(0,-26,-34,-36);fs(c,rgrad(c,-2,-64,40,b),3);
 for(const[x,y,r]of[[-12,-88,4],[12,-80,5],[-20,-66,3]]){ell(c,x,y,r,r);c.fillStyle=shade(a,-.1);c.globalAlpha=.7;c.fill();c.globalAlpha=1;}
 gloss(c,-14,-86,8,4,.4);eye(c,-16,-56,7.5,-1,1);eye(c,6,-56,7.5,-1,1);mouth(c,-6,-42,9,atk>.2?.9:0);c.restore();};
ART.spirit=(c,m)=>{const t=m.t,b=m.b,a=m.a,sub=m.sub,bob=Math.sin(t*3+m.seed)*5;c.save();c.translate(0,-56+bob);
 if(sub==='ghost'){c.globalAlpha=.9;c.beginPath();c.moveTo(-20,10);c.bezierCurveTo(-24,-14,-20,-40,0,-44);c.bezierCurveTo(20,-40,24,-14,20,10);
  for(let i=0;i<5;i++){const x=20-i*10;c.lineTo(x-5,26+Math.sin(t*6+i)*4);c.lineTo(x-10,12);}c.closePath();fs(c,rgrad(c,0,-14,30,b));c.globalAlpha=1;
  ell(c,-4,-22,12,13);c.fillStyle='#0c0818';c.fill();c.shadowColor=a;c.shadowBlur=12;for(const x of[-9,0]){ell(c,x,-23,2.6,1.8,.2);c.fillStyle=a;c.fill();}c.shadowBlur=0;
  c.restore();return;}
 if(sub==='cloud'){c.globalCompositeOperation='source-over';const pts=[[-18,0,16],[0,-8,19],[18,0,15],[-6,8,15],[10,9,13]];
  for(const[x,y,r]of pts){ell(c,x,y,r+2.5,r+2.5);c.fillStyle=OL;c.fill();}for(const[x,y,r]of pts){ell(c,x,y,r,r);c.fillStyle=rgrad(c,x,y,r,b);c.fill();}
  if(Math.sin(t*7+m.seed)>.6){c.beginPath();c.moveTo(-4,18);c.lineTo(-10,30);c.lineTo(-2,30);c.lineTo(-8,44);c.lineWidth=3;c.strokeStyle=a;c.shadowColor=a;c.shadowBlur=10;c.stroke();c.shadowBlur=0;}
  eye(c,-9,-2,5,-1,1);eye(c,7,-2,5,-1,1);mouth(c,-1,10,8,.6);c.restore();return;}
 const fl=(k)=>Math.sin(t*10+k)*3;c.shadowColor=b;c.shadowBlur=22;
 c.beginPath();c.moveTo(-20,10);c.bezierCurveTo(-28,-10,-14,-20,-12,-34+fl(1));c.bezierCurveTo(-6,-24,-4,-30,2,-46+fl(2));c.bezierCurveTo(6,-30,12,-28,16,-36+fl(3));c.bezierCurveTo(26,-14,24,6,18,12);c.quadraticCurveTo(0,22,-20,10);
 const g=c.createRadialGradient(0,2,2,0,-8,34);g.addColorStop(0,'#fffbe0');g.addColorStop(.35,a);g.addColorStop(1,b);c.fillStyle=g;c.fill();c.shadowBlur=0;c.lineWidth=2.2;c.strokeStyle='rgba(120,30,0,.6)';c.stroke();
 if(sub==='spark'){c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.moveTo(-26,-20);c.lineTo(-16,-14);c.lineTo(-22,-6);c.stroke();}
 eye(c,-8,-2,4.5,-1,1);eye(c,6,-2,4.5,-1,1);mouth(c,-1,8,7,m.atk>=0?.7:0);c.restore();};
// footprint widths for collision / shadows, per archetype
const ART_W={slime:34,jelly:26,crab:34,bird:24,walker:22,beast:34,golem:56,squid:34,spirit:22};
const ART_H={slime:52,jelly:90,crab:56,bird:90,walker:84,beast:56,golem:180,squid:104,spirit:100};
