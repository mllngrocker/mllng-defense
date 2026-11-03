/* ---------- grotesque monster layer ----------
 While G is on (only during monster drawing), the shared art helpers switch to a polluted-mutant look:
 sickly palette, thin grimy outline, bloodshot eyes, rotten teeth with drool. The body is drawn on its own
 canvas so rot patches, veins and a scar can be painted only on the body (source-atop); boils, drips and flies go on top. */
let G=0;
const _sick={};
function sick(h){if(h[0]!=='#')return h;const key=GV.id+h;if(_sick[key])return _sick[key];const[r,g,b]=hexRGB(h),l=(r+g+b)/3,[tr,tg,tb,k]=GV.tint;const m=(v,t)=>Math.round(clamp(lerp(lerp(v,l,.5),t,k),0,1)*255).toString(16).padStart(2,'0');return _sick[key]='#'+m(r,tr)+m(g,tg)+m(b,tb);}
function grossEye(c,x,y,r,look){r*=1.3;
 ell(c,x,y+r*.12,r*1.35,r*1.3);c.fillStyle='rgba(60,10,14,.55)';c.fill();
 ell(c,x,y,r,r*1.05);const g=c.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);g.addColorStop(0,'#fff2c8');g.addColorStop(.6,'#e8cf80');g.addColorStop(1,'#c0703a');c.fillStyle=g;c.fill();
 c.strokeStyle='rgba(200,20,20,.85)';c.lineWidth=Math.max(.7,r*.08);for(let i=0;i<7;i++){const a=i*.9+.3;c.beginPath();c.moveTo(x+Math.cos(a)*r*.97,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a+.25)*r*.68,y+Math.sin(a+.3)*r*.64);c.lineTo(x+Math.cos(a-.1)*r*.46,y+Math.sin(a-.1)*r*.42);c.stroke();}
 const px=x+look*r*.3;ell(c,px,y+r*.1,r*.3,r*.34);c.fillStyle=GV.eye||'#7a3010';c.fill();ell(c,px,y+r*.1,r*.08,r*.28);c.fillStyle='#050302';c.fill();
 ell(c,px-r*.12,y-r*.08,r*.09,r*.09);c.fillStyle='rgba(255,255,255,.95)';c.fill();
 c.beginPath();c.ellipse(x,y-r*.05,r*1.1,r*.75,0,Math.PI*1.05,Math.PI*1.95);c.lineWidth=r*.5;c.lineCap='round';c.strokeStyle='rgba(30,18,12,.95)';c.stroke();
 c.lineWidth=1;c.strokeStyle='rgba(20,10,8,.9)';ell(c,x,y,r,r*1.05);c.stroke();}
function grossMouth(c,x,y,w,open,t){w*=1.9;const o=Math.max(.75,open),d=w*.62*o;
 c.beginPath();c.moveTo(x-w*.6,y);c.quadraticCurveTo(x-w*.1,y-w*.12,x+w*.6,y-w*.04);c.quadraticCurveTo(x+w*.45,y+d,x,y+d*1.05);c.quadraticCurveTo(x-w*.5,y+d,x-w*.6,y);c.closePath();
 c.fillStyle='#8a2a30';c.fill();c.lineWidth=1.4;c.strokeStyle='rgba(20,10,8,.95)';c.stroke();
 ell(c,x,y+d*.6,w*.4,d*.38);c.fillStyle='#1a0406';c.fill();
 for(let i=0;i<6;i++){const tx=x-w*.5+i*w*.2,h=w*(.14+((i*5)%3)*.07),tilt=((i*3)%3-1)*w*.03;c.beginPath();c.moveTo(tx-w*.07,y-w*.03);c.lineTo(tx+tilt,y+h);c.lineTo(tx+w*.07,y-w*.03);c.closePath();c.fillStyle=['#e0cf8a','#c8a858','#b89040'][i%3];c.fill();c.lineWidth=.7;c.strokeStyle='rgba(60,40,10,.8)';c.stroke();}
 for(let i=0;i<4;i++){const tx=x-w*.36+i*w*.24,h=w*(.1+(i%2)*.06);c.beginPath();c.moveTo(tx-w*.06,y+d);c.lineTo(tx,y+d-h);c.lineTo(tx+w*.06,y+d);c.closePath();c.fillStyle='#c8b070';c.fill();}
 for(const[k,ph]of[[-.25,0],[.3,1.7]]){const dl=w*(.35+.3*Math.abs(Math.sin(t*1.6+ph+x))),sx=x+w*k,sy=y+d*.9;
  c.beginPath();c.moveTo(sx-1.4,sy);c.quadraticCurveTo(sx-1.2,sy+dl*.7,sx,sy+dl);c.quadraticCurveTo(sx+1.2,sy+dl*.7,sx+1.4,sy);c.fillStyle='rgba(200,225,160,.75)';c.fill();
  ell(c,sx,sy+dl+1.5,2.2,2.8);c.fill();}}
let _gc,_gx;
function grossOverlay(c,m,arch,R){const w=ART_W[arch],h=ART_H[arch],t=m.t,big=arch==='golem'?1.6:1;
 // boils / pustules
 const nb=arch==='golem'?10:arch==='bird'||arch==='spirit'?3:6;
 for(let i=0;i<nb;i++){const bx=(R(i)-.5)*w*.95,by=-h*(.28+R(i+9)*.42)+(arch==='bird'?-h*.15:0),r=(2.4+R(i+3)*2.4)*big;
  ell(c,bx,by+r*.15,r*1.45,r*1.3);c.fillStyle='rgba(150,40,50,.75)';c.fill();
  ell(c,bx,by,r,r*.95);const g=c.createRadialGradient(bx-r*.3,by-r*.4,.3,bx,by,r);g.addColorStop(0,'#fff8c0');g.addColorStop(.45,'#e8d060');g.addColorStop(1,'#a07a28');c.fillStyle=g;c.fill();
  ell(c,bx-r*.3,by-r*.35,r*.25,r*.18);c.fillStyle='rgba(255,255,255,.8)';c.fill();}
 // oozing drips under the body
 if(arch!=='bird'&&arch!=='spirit'){const col=sick(m.b);for(let i=0;i<4;i++){const dx=(R(i+20)-.5)*w*1.1,cyc=(t*.45+R(i+30))%1,len=5+cyc*14,y0=-h*.1-R(i+40)*h*.08;
  c.globalAlpha=.9;c.beginPath();c.moveTo(dx-2.6,y0);c.quadraticCurveTo(dx-2.2,y0+len*.7,dx,y0+len);c.quadraticCurveTo(dx+2.2,y0+len*.7,dx+2.6,y0);c.fillStyle=col;c.fill();
  ell(c,dx,y0+len+1.5*cyc,2.4*cyc+1.2,2.8*cyc+1.2);c.fill();c.globalAlpha=1;}}
 // flies circling
 for(let i=0;i<6;i++){const a=t*(3+i*.7)+i*1.7,fx=Math.cos(a)*(w*.85+8)+Math.sin(t*11+i)*3,fy=-h*.75+Math.sin(a*1.4)*h*.3;
  ell(c,fx,fy,2.2,1.6);c.fillStyle='#120e0a';c.fill();const fl=Math.abs(Math.sin(t*55+i));ell(c,fx-1.2,fy-2,2*fl+.4,1.2);ell(c,fx+1.2,fy-2,2*fl+.4,1.2);c.fillStyle='rgba(220,230,240,.6)';c.fill();}}
function grossSkin(c,arch,R){const w=ART_W[arch],h=ART_H[arch];c.globalCompositeOperation='source-atop';
 // rot patches
 for(let i=0;i<8;i++){const x=(R(i+50)-.5)*w*1.2,y=-h*(.15+R(i+60)*.75),r=(6+R(i+70)*10)*(arch==='golem'?2:1);const g=c.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,i%2?'rgba(50,60,10,.7)':'rgba(90,20,40,.65)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 // veins
 c.lineCap='round';for(let i=0;i<3;i++){let x=(R(i+80)-.5)*w,y=-h*(.2+R(i+90)*.5);c.beginPath();c.moveTo(x,y);for(let j=0;j<4;j++){x+=(R(i*7+j)-.5)*12;y-=4+R(i+j*3)*5;c.lineTo(x,y);}
  c.lineWidth=1.6;c.strokeStyle='rgba(110,20,60,.55)';c.stroke();c.lineWidth=.7;c.strokeStyle='rgba(170,60,120,.5)';c.stroke();}
 // stitched scar
 const sx=(R(99)-.5)*w*.6,sy=-h*(.35+R(98)*.25),sl=w*.45;c.beginPath();c.moveTo(sx-sl/2,sy);c.lineTo(sx+sl/2,sy+sl*.25);c.lineWidth=2.2;c.strokeStyle='rgba(70,10,15,.85)';c.stroke();
 for(let k=0;k<5;k++){const px=sx-sl/2+sl*(k+.5)/5,py=sy+sl*.25*(k+.5)/5;c.beginPath();c.moveTo(px-1,py-3.5);c.lineTo(px+1,py+3.5);c.lineWidth=1;c.strokeStyle='rgba(20,15,10,.9)';c.stroke();}
 c.globalCompositeOperation='source-over';}
// growths drawn on the body canvas: tumour lumps, an open wound with crawling maggots, extra eyes, slime sheen
function grossFlesh(c,arch,R,t){const w=ART_W[arch],h=ART_H[arch],sz=arch==='golem'?1.8:1,fly=arch==='bird'||arch==='spirit';
 c.globalCompositeOperation='source-atop';
 // wet slime sheen streaks
 for(let i=0;i<3;i++){const x=(R(i+110)-.5)*w*.9,y=-h*(.3+R(i+111)*.5);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+4,y+8,x+1,y+16*sz);c.lineWidth=2.2*sz;c.lineCap='round';c.strokeStyle='rgba(225,245,190,.45)';c.stroke();}
 // open wound with maggots
 const wx=(R(120)-.5)*w*.5,wy=-h*(.3+R(121)*.2),wr=(6+R(122)*3)*sz;
 ell(c,wx,wy,wr*1.25,wr*.95);c.fillStyle='rgba(120,20,30,.9)';c.fill();
 ell(c,wx,wy,wr,wr*.72);const g=c.createRadialGradient(wx,wy,0,wx,wy,wr);g.addColorStop(0,'#2a0408');g.addColorStop(.6,'#6a0c18');g.addColorStop(1,'#b8384a');c.fillStyle=g;c.fill();
 ell(c,wx+wr*.3,wy-wr*.1,wr*.28,wr*.16,.4);c.fillStyle='#e8dcc0';c.fill();
 for(let i=0;i<4;i++){const a=t*(1.2+i*.3)+i*1.6,mx=wx+Math.cos(a)*wr*.55,my=wy+Math.sin(a*1.3)*wr*.4,wig=Math.sin(t*9+i)*.5;
  c.beginPath();c.moveTo(mx-2.4*sz,my);c.quadraticCurveTo(mx,my+wig*2*sz,mx+2.4*sz,my);c.lineWidth=1.8*sz;c.lineCap='round';c.strokeStyle='#f2ead2';c.stroke();
  c.lineWidth=.5;c.strokeStyle='rgba(140,120,90,.7)';c.stroke();}
 c.globalCompositeOperation='source-over';
 // tumour lumps bulging past the silhouette
 if(!fly)for(let i=0;i<2;i++){const s=i?1:-1,tx=s*w*(.42+R(i+130)*.1),ty=-h*(.45+R(i+131)*.3),r=(5+R(i+132)*4)*sz;
  ell(c,tx,ty,r,r*.9);const gg=c.createRadialGradient(tx-r*.3,ty-r*.4,.5,tx,ty,r);gg.addColorStop(0,'#d8a090');gg.addColorStop(.6,'#a05a58');gg.addColorStop(1,'#5a2430');c.fillStyle=gg;c.fill();c.lineWidth=1;c.strokeStyle='rgba(28,14,10,.9)';c.stroke();
  c.beginPath();c.moveTo(tx-r*.5,ty);c.quadraticCurveTo(tx,ty-r*.3,tx+r*.4,ty+r*.2);c.lineWidth=.9;c.strokeStyle='rgba(120,20,60,.7)';c.stroke();}
 // extra eyes scattered on the body, each blinking on its own
 const ne=arch==='golem'?5:fly?1:3;
 for(let i=0;i<ne;i++){const ex=(R(i+140)-.5)*w*.85,ey=-h*(.18+R(i+141)*.55),er=(2.4+R(i+142)*2.6)*sz,bl=Math.sin(t*1.3+i*2.7)>.93;
  if(bl){c.beginPath();c.moveTo(ex-er,ey);c.quadraticCurveTo(ex,ey+er*.5,ex+er,ey);c.lineWidth=1.2;c.strokeStyle='rgba(28,14,10,.95)';c.stroke();continue;}
  grossEye(c,ex,ey,er/1.3,Math.sin(t*.8+i*2)>0?-1:1);}}
// monster draw wrapper used by the battle renderer: body on its own canvas, so skin rot stays on the body
const _mart={},MART=new Proxy(_mart,{get:(o,k)=>o[k]||(o[k]=k==='human'||!ART[k]?ART[k]:grossDraw(k))});
/* ---------- variants: each chapter mutates its monsters differently ----------
 tint = [r,g,b,amount] the palette drifts toward; skin = painted only on the body (source-atop); over = drawn on top; rot = also use the rot/flesh/boils set */
const gl=(c,x,y,r,col,a)=>{c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();};
const spike=(c,x,y,h,w,a,fill)=>{c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(-w,0);c.lineTo(0,-h);c.lineTo(w,0);c.closePath();c.fillStyle=fill;c.fill();c.lineWidth=1.1;c.strokeStyle='rgba(20,14,24,.9)';c.stroke();c.restore();};
const VARS={
 toxic:{tint:[.38,.34,.16,.48],rot:1},
 mutant:{tint:[.52,.3,.32,.45],rot:1,eye:'#3a7a10'},
 fungus:{tint:[.32,.36,.2,.4],eye:'#5a3a10',
  skin(c,w,h,R){for(let i=0;i<6;i++){const x=(R(i)-.5)*w*1.2,y=-h*(.2+R(i+7)*.7),r=5+R(i+3)*8;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(70,110,40,.75)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}},
  over(c,w,h,R,t){for(let i=0;i<4;i++){const x=(R(i+20)-.5)*w*.9,y=-h*(.55+R(i+21)*.4),s=3+R(i+22)*3;c.beginPath();c.moveTo(x-s*.25,y);c.lineTo(x-s*.2,y-s*1.2);c.lineTo(x+s*.2,y-s*1.2);c.lineTo(x+s*.25,y);c.fillStyle='#efe4cc';c.fill();c.lineWidth=.8;c.strokeStyle='#2a1a10';c.stroke();
   c.beginPath();c.ellipse(x,y-s*1.2,s,s*.62,0,Math.PI,0);c.fillStyle=i%2?'#c83a2a':'#a8723a';c.fill();c.stroke();for(const d of[-.4,.3]){ell(c,x+d*s,y-s*1.5,s*.16,s*.12);c.fillStyle='#fff4e0';c.fill();}}
   for(let i=0;i<5;i++){const k=(t*.3+R(i+30))%1;ell(c,(R(i+31)-.5)*w*1.4,-h*(.5+k*.8),1.2,1.2);c.fillStyle=`rgba(220,230,150,${.8*(1-k)})`;c.fill();}}},
 mummy:{tint:[.6,.5,.32,.5],eye:'#c89a2a',
  skin(c,w,h,R){c.lineWidth=2.6;c.strokeStyle='rgba(230,214,170,.85)';for(let i=0;i<5;i++){const y=-h*(.2+i*.16)+R(i)*4;c.beginPath();c.moveTo(-w*1.2,y);c.lineTo(w*1.2,y-6+R(i+5)*12);c.stroke();}
   c.lineWidth=.8;c.strokeStyle='rgba(60,40,20,.7)';for(let i=0;i<4;i++){let x=(R(i+9)-.5)*w,y=-h*(.3+R(i+10)*.5);c.beginPath();c.moveTo(x,y);for(let j=0;j<3;j++){x+=(R(i*3+j)-.5)*8;y+=3+R(j+i)*3;c.lineTo(x,y);}c.stroke();}},
  over(c,w,h,R,t){c.beginPath();c.moveTo(w*.4,-h*.45);c.quadraticCurveTo(w*.9,-h*.45+Math.sin(t*4)*4,w*1.3,-h*.4+Math.sin(t*4+1)*6);c.lineWidth=2.4;c.strokeStyle='#e6d6aa';c.lineCap='round';c.stroke();
   for(let i=0;i<4;i++){const k=(t*.4+R(i+40))%1;ell(c,(R(i+41)-.5)*w*2,-2-k*12,3+k*5,1.5+k*2);c.fillStyle=`rgba(210,180,120,${.45*(1-k)})`;c.fill();}}},
 oil:{tint:[.12,.12,.14,.62],eye:'#d8b020',
  skin(c,w,h,R,t){for(let i=0;i<3;i++){const y=-h*(.3+i*.2),g=c.createLinearGradient(-w,y,w,y);for(let k=0;k<=6;k++)g.addColorStop(k/6,`hsla(${(k*55+t*40)%360},90%,60%,.22)`);c.fillStyle=g;c.fillRect(-w*1.5,y-3,w*3,5);}
   ell(c,-w*.3,-h*.7,w*.3,h*.06,-.4);c.fillStyle='rgba(255,255,255,.35)';c.fill();},
  over(c,w,h,R,t){ell(c,0,1,w*1.1,3.4);c.fillStyle='rgba(10,10,14,.75)';c.fill();for(let i=0;i<4;i++){const dx=(R(i+20)-.5)*w*1.2,cyc=(t*.5+R(i+30))%1,len=6+cyc*14,y0=-h*.15;c.beginPath();c.moveTo(dx-2.6,y0);c.quadraticCurveTo(dx-2,y0+len*.7,dx,y0+len);c.quadraticCurveTo(dx+2,y0+len*.7,dx+2.6,y0);c.fillStyle='#16161c';c.fill();}}},
 rust:{tint:[.5,.34,.22,.45],eye:'#ff2a1a',
  skin(c,w,h,R){for(let i=0;i<4;i++){const x=(R(i)-.5)*w,y=-h*(.25+R(i+4)*.5),pw=8+R(i+2)*8,ph=6+R(i+3)*6;c.fillStyle='rgba(120,130,140,.75)';c.fillRect(x-pw/2,y-ph/2,pw,ph);c.strokeStyle='rgba(30,30,36,.8)';c.lineWidth=.9;c.strokeRect(x-pw/2,y-ph/2,pw,ph);
   for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){ell(c,x+a*(pw/2-1.6),y+b*(ph/2-1.6),.8,.8);c.fillStyle='#2a2a30';c.fill();}const g=c.createRadialGradient(x,y+ph/2,0,x,y+ph/2,pw);g.addColorStop(0,'rgba(160,70,20,.6)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-pw,y,pw*2,ph*2);}},
  over(c,w,h,R,t){const x=w*.3,y=-h*.85;ell(c,x,y,2,2);c.fillStyle='#ff3a2a';c.fill();gl(c,x,y,7,'#ff4030',.7+.3*Math.sin(t*8));for(let i=0;i<3;i++){const k=(t*.6+i/3)%1;ell(c,-w*.4+k*4,-h-k*16,3+k*5,2.4+k*4);c.fillStyle=`rgba(200,200,210,${.45*(1-k)})`;c.fill();}}},
 coal:{tint:[.16,.15,.15,.6],eye:'#ff7a1a',
  skin(c,w,h,R,t){c.lineWidth=1.6;for(let i=0;i<5;i++){let x=(R(i)-.5)*w,y=-h*(.15+R(i+5)*.7);c.beginPath();c.moveTo(x,y);for(let j=0;j<4;j++){x+=(R(i*4+j)-.5)*10;y-=3+R(j+i)*4;c.lineTo(x,y);}c.strokeStyle=`rgba(255,${Math.round(140+Math.sin(t*3+i)*40)},40,.95)`;c.stroke();}},
  over(c,w,h,R,t){for(let i=0;i<5;i++){const k=(t*.5+R(i+50))%1;ell(c,(R(i+51)-.5)*w*1.4,-h*(.3+k*.9),1.3,1.3);c.fillStyle=`rgba(255,170,60,${1-k})`;c.fill();}}},
 fire:{tint:[.7,.32,.16,.42],eye:'#ffd23a',
  skin(c,w,h){const g=c.createLinearGradient(0,-h,0,0);g.addColorStop(0,'rgba(255,200,80,.35)');g.addColorStop(1,'rgba(200,40,10,.25)');c.fillStyle=g;c.fillRect(-w*2,-h*1.2,w*4,h*1.3);},
  over(c,w,h,R,t){for(let i=0;i<5;i++){const x=(i/4-.5)*w*1.2,L=8+R(i)*8+Math.sin(t*9+i)*2;c.save();c.translate(x,-h*(.82+Math.sin(i)*.06));for(let j=0;j<3;j++){const k=1-j*.3;c.beginPath();c.moveTo(-3*k,0);c.quadraticCurveTo(-3*k,-L*k*.6,0,-L*k);c.quadraticCurveTo(3*k,-L*k*.6,3*k,0);c.closePath();c.fillStyle=['#e8341a','#ff8a2a','#ffe27a'][j];c.fill();}c.restore();}
   gl(c,0,-h*.6,w*1.4,'#ff7a20',.35);}},
 acid:{tint:[.42,.6,.14,.45],eye:'#c8ff3a',
  skin(c,w,h,R){for(let i=0;i<5;i++){const x=(R(i)-.5)*w,y=-h*(.2+R(i+6)*.6),r=2.4+R(i+3)*3;ell(c,x,y,r*1.4,r*1.2);c.fillStyle='rgba(150,255,60,.6)';c.fill();ell(c,x,y,r,r*.85);c.fillStyle='#1a2008';c.fill();}},
  over(c,w,h,R,t){for(let i=0;i<4;i++){const dx=(R(i+20)-.5)*w*1.1,cyc=(t*.6+R(i+30))%1,len=4+cyc*12;c.beginPath();c.moveTo(dx-2,-h*.1);c.quadraticCurveTo(dx-1.6,-h*.1+len*.7,dx,-h*.1+len);c.quadraticCurveTo(dx+1.6,-h*.1+len*.7,dx+2,-h*.1);c.fillStyle='rgba(160,255,60,.9)';c.fill();}
   for(let i=0;i<4;i++){const k=(t*.8+R(i+60))%1;c.beginPath();c.arc((R(i+61)-.5)*w*1.2,-h*(.4+k*.6),1+k*2,0,TAU);c.strokeStyle=`rgba(190,255,90,${1-k})`;c.lineWidth=.9;c.stroke();}}},
 demon:{tint:[.3,.16,.36,.5],eye:'#c03aff',
  skin(c,w,h,R,t){c.lineWidth=1.3;c.strokeStyle=`rgba(210,90,255,${.6+.3*Math.sin(t*3)})`;for(let i=0;i<3;i++){const x=(R(i)-.5)*w*.8,y=-h*(.3+R(i+3)*.45),r=3+R(i+5)*3;c.beginPath();c.arc(x,y,r,0,TAU);c.moveTo(x-r,y);c.lineTo(x+r,y);c.moveTo(x,y-r);c.lineTo(x,y+r);c.stroke();}},
  over(c,w,h,R,t){for(const d of[-1,1])spike(c,d*w*.32,-h*.88,9+R(d+3)*4,2.6,d*.35,'#2a1a24');gl(c,0,-h*.5,w*1.6,'#9a3aff',.3+.1*Math.sin(t*2));}},
 bone:{tint:[.72,.7,.62,.42],eye:'#e8f4ff',
  skin(c,w,h){c.lineWidth=2;c.strokeStyle='rgba(40,30,30,.55)';for(let i=0;i<4;i++){const y=-h*(.3+i*.12);c.beginPath();c.moveTo(-w*.5,y);c.quadraticCurveTo(0,y+4,w*.5,y);c.stroke();}c.beginPath();c.moveTo(0,-h*.75);c.lineTo(0,-h*.2);c.stroke();},
  over(c,w,h,R,t){for(let i=0;i<3;i++){const k=(t*.35+i/3)%1,x=(R(i+70)-.5)*w*1.4;c.beginPath();c.moveTo(x,-h*.3-k*30);c.quadraticCurveTo(x+6,-h*.5-k*30,x-2,-h*.7-k*36);c.lineWidth=3*(1-k)+.5;c.strokeStyle=`rgba(200,230,255,${.55*(1-k)})`;c.lineCap='round';c.stroke();}
   for(let i=0;i<3;i++)spike(c,(i-1)*w*.28,-h*(.92-Math.abs(i-1)*.06),6,1.8,(i-1)*.3,'#efe8d8');}},
 crystal:{tint:[.24,.2,.4,.48],eye:'#7ad8ff',
  skin(c,w,h,R){for(let i=0;i<4;i++){const x=(R(i)-.5)*w,y=-h*(.3+R(i+2)*.5);c.beginPath();c.moveTo(x,y-6);c.lineTo(x+4,y);c.lineTo(x,y+6);c.lineTo(x-4,y);c.closePath();c.fillStyle='rgba(180,140,255,.35)';c.fill();}},
  over(c,w,h,R,t){for(let i=0;i<4;i++){const x=(R(i+80)-.5)*w*1.1,y=-h*(.55+R(i+81)*.35),hh=8+R(i+82)*10;spike(c,x,y,hh,3,(R(i+83)-.5)*.8,'#8a6aff');c.save();c.globalCompositeOperation='lighter';spike(c,x+.6,y,hh*.7,1.2,(R(i+83)-.5)*.8,'rgba(220,210,255,.6)');c.restore();}
   gl(c,0,-h*.6,w*1.2,'#8a6aff',.25+.1*Math.sin(t*3));}}
};
for(const k in VARS)VARS[k].id=k;
// one look per chapter (index = chapter - 1)
const CH_VAR=['toxic','fungus','mummy','oil','rust','coal','fire','acid','mutant','demon','demon','rust','bone','fire','fungus','bone','crystal','demon','crystal','demon'];
let GV=VARS.toxic;
const grossDraw=k=>(c,m)=>{GV=VARS[m.vari||CH_VAR[Math.floor(S.g/10)%CH_VAR.length]];
 const sd=(m.seed||1)*7.13,R=i=>{const v=Math.sin(sd+i*12.9898)*43758.5453;return v-Math.floor(v);};
 const T=c.getTransform(),N=Math.ceil((ART_H[k]+90)*Math.hypot(T.a,T.b)*1.25);
 if(!_gc){_gc=document.createElement('canvas');_gx=_gc.getContext('2d');}
 if(_gc.width<N){_gc.width=_gc.height=N;}const ox=_gc.width/2,oy=_gc.width*.8;G=1;
 try{_gx.setTransform(1,0,0,1,0,0);_gx.clearRect(0,0,_gc.width,_gc.width);_gx.setTransform(T.a,T.b,T.c,T.d,ox,oy);oneSil(_gx,()=>ART[k](_gx,m));const w=ART_W[k],h=ART_H[k];if(GV.rot){grossSkin(_gx,k,R);grossFlesh(_gx,k,R,m.t);}if(GV.skin){_gx.globalCompositeOperation='source-atop';GV.skin(_gx,w,h,R,m.t);_gx.globalCompositeOperation='source-over';}
  c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(_gc,T.e-ox,T.f-oy);c.restore();if(GV.rot)grossOverlay(c,m,k,R);if(GV.over)GV.over(c,w,h,R,m.t);}finally{G=0;}};
