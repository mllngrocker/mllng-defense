/* ---------- grotesque monster layer ----------
 While G is on (only during monster drawing), the shared art helpers switch to a polluted-mutant look:
 sickly palette, thin grimy outline, bloodshot eyes, rotten teeth with drool. The body is drawn on its own
 canvas so rot patches, veins and a scar can be painted only on the body (source-atop); boils, drips and flies go on top. */
let G=0;
const _sick={};
function sick(h){if(h[0]!=='#')return h;if(_sick[h])return _sick[h];const[r,g,b]=hexRGB(h),l=(r+g+b)/3,k=.48;const m=(v,t)=>Math.round(clamp(lerp(lerp(v,l,.5),t,k),0,1)*255).toString(16).padStart(2,'0');return _sick[h]='#'+m(r,.38)+m(g,.34)+m(b,.16);}
function grossEye(c,x,y,r,look){r*=1.3;
 ell(c,x,y+r*.12,r*1.35,r*1.3);c.fillStyle='rgba(60,10,14,.55)';c.fill();
 ell(c,x,y,r,r*1.05);const g=c.createRadialGradient(x-r*.3,y-r*.35,1,x,y,r);g.addColorStop(0,'#fff2c8');g.addColorStop(.6,'#e8cf80');g.addColorStop(1,'#c0703a');c.fillStyle=g;c.fill();
 c.strokeStyle='rgba(200,20,20,.85)';c.lineWidth=Math.max(.7,r*.08);for(let i=0;i<7;i++){const a=i*.9+.3;c.beginPath();c.moveTo(x+Math.cos(a)*r*.97,y+Math.sin(a)*r);c.lineTo(x+Math.cos(a+.25)*r*.68,y+Math.sin(a+.3)*r*.64);c.lineTo(x+Math.cos(a-.1)*r*.46,y+Math.sin(a-.1)*r*.42);c.stroke();}
 const px=x+look*r*.3;ell(c,px,y+r*.1,r*.3,r*.34);c.fillStyle='#7a3010';c.fill();ell(c,px,y+r*.1,r*.08,r*.28);c.fillStyle='#050302';c.fill();
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
const grossDraw=k=>(c,m)=>{
 const sd=(m.seed||1)*7.13,R=i=>{const v=Math.sin(sd+i*12.9898)*43758.5453;return v-Math.floor(v);};
 const T=c.getTransform(),N=Math.ceil((ART_H[k]+90)*Math.hypot(T.a,T.b)*1.25);
 if(!_gc){_gc=document.createElement('canvas');_gx=_gc.getContext('2d');}
 if(_gc.width<N){_gc.width=_gc.height=N;}const ox=_gc.width/2,oy=_gc.width*.8;G=1;
 try{_gx.setTransform(1,0,0,1,0,0);_gx.clearRect(0,0,_gc.width,_gc.width);_gx.setTransform(T.a,T.b,T.c,T.d,ox,oy);ART[k](_gx,m);grossSkin(_gx,k,R);grossFlesh(_gx,k,R,m.t);
  c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(_gc,T.e-ox,T.f-oy);c.restore();grossOverlay(c,m,k,R);}finally{G=0;}};
