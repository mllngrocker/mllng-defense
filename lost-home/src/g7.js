<script>
/* ================= chamfered 9-slice frames (benchmark skin) ================= */
(function(){const R0=document.documentElement.style;
  function frame(top,bot,band,hi,alpha){const c=document.createElement('canvas');c.width=c.height=48;const x=c.getContext('2d');const k=12;
    const poly=(i)=>{x.beginPath();x.moveTo(k+i,i);x.lineTo(48-k-i,i);x.lineTo(48-i,k+i);x.lineTo(48-i,48-k-i);x.lineTo(48-k-i,48-i);x.lineTo(k+i,48-i);x.lineTo(i,48-k-i);x.lineTo(i,k+i);x.closePath()};
    x.globalAlpha=alpha||1;poly(0);x.fillStyle='#140c0a';x.fill();
    poly(4);x.save();x.clip();x.fillStyle=band;x.fillRect(0,0,48,48);const g=x.createLinearGradient(0,4,0,36);g.addColorStop(0,top);g.addColorStop(1,bot);x.fillStyle=g;x.fillRect(0,0,48,37);
    x.fillStyle=hi;x.fillRect(0,4,48,4);x.restore();return`url(${c.toDataURL()})`}
  const F={yel:['#ffe866','#ffbe22','#e48a0c','rgba(255,255,240,.75)'],dark:['#4a86f0','#2f62d0','#1d44a0','rgba(255,255,255,.35)'],red:['#ff7c6a','#ec4048','#b2222e','rgba(255,220,210,.6)'],
    grey:['#c4c0d2','#9a96ae','#74708a','rgba(255,255,255,.5)'],green:['#9cf06a','#52c83c','#2c9426','rgba(240,255,220,.6)'],blue:['#78d2ff','#3a92f2','#2462c4','rgba(220,245,255,.6)'],
    panel:['#e4f5ff','#c2e6ff','#94cdf6','rgba(255,255,255,.9)'],card:['#fffaf0','#f6e8cc','#dcc69c','rgba(255,255,255,.9)']};
  Object.entries(F).forEach(([n,a])=>R0.setProperty('--cf-'+n,frame(...a)))})();

/* ================= lobby splash: full-screen pixel scene ================= */
let LBW=180;const LBH=320;
let LBfy=236;function lobbyFit(){const r0=$('#lrec').getBoundingClientRect();if(r0.top>0)LBfy=Math.max(170,Math.min(272,Math.round(r0.top/Math.max(1,innerHeight)*LBH)-34));const r=innerWidth/Math.max(1,innerHeight);LBW=Math.max(150,Math.min(620,Math.round(LBH*r)));const cv=$('#lcv');if(cv.width!==LBW){cv.width=LBW;cv.height=LBH;LC.imageSmoothingEnabled=false;LBsky=null}}
addEventListener('resize',lobbyFit);
let LBsky=null;
function mkLobbySky(){return pcan(LBW,LBH,put=>{grad(put,LBW,0,200,['#0a0820','#141038','#22195a','#3a2676','#5e3a88','#8a4a8a']);
  for(let i=0;i<Math.round(LBW*.6);i++)put((i*67+13)%LBW,(i*29+7)%170,hex(i%5?'#bfb0e8':'#ffffff'));
  const mx=Math.round(LBW*.78);disc(put,mx,30,11,hex('#fff4d6'));disc(put,mx-4,27,3,hex('#efe0c0'));disc(put,mx+4,34,2,hex('#efe0c0'));
  for(let x=0;x<LBW;x++){const h=Math.round(196-Math.max(0,Math.sin(x*.07)*8+Math.sin(x*.023+1)*10));for(let y=h;y<200;y++)put(x,y,hex(y<h+2?'#c8dcf4':'#7e9ac8'))}
  grad(put,LBW,200,LBH,['#2a4c86','#1e3c72','#16305e','#10244a','#0c1a38'])})}
const LBfloe=pcan(40,10,put=>{const top=hex('#f4fbff'),mid=hex('#bcd8f2'),low=hex('#7fa4cc'),ol=hex('#2a3e66');
  for(let y=0;y<10;y++)for(let x=0;x<40;x++){const inset=y<3?Math.max(0,4-y*2):Math.floor((y-3)*1.3);if(x<inset+1||x>38-inset)continue;
    const edge=x===inset+1||x===38-inset||y===9;put(x,y,edge?ol:y<2?top:y<5?mid:low)}
  for(let x=6;x<36;x+=7)put(x,1,hex('#ffffff'))});
const LBbits=[0,1,2,3,4,5].map(i=>({x:i*60+10,y:214+(i*13)%60,w:5+(i*3)%7,sp:3+i%3,ph:i*1.3}));
const LBsnow=Array.from({length:70},(_,i)=>({x:(i*53)%620,y:(i*31)%LBH,v:8+(i%5)*3,ph:i}));
function lobbyDraw(dt){lobbyT+=dt;const t=lobbyT,L2=LC;if(!LBsky){lobbyFit();LBsky=mkLobbySky()}if((lobbyT|0)!==((lobbyT-dt)|0))lobbyFit();L2.imageSmoothingEnabled=false;L2.drawImage(LBsky,0,0);const W2=LBW,cx=W2/2;
  for(let x=0;x<W2;x++){const y=34+Math.sin(x*.035+t*.6)*10+Math.sin(x*.11-t*.4)*4,a=.13+.1*Math.sin(x*.06+t*1.2);
    L2.fillStyle=`rgba(90,255,190,${a.toFixed(3)})`;L2.fillRect(x,Math.round(y),1,16);L2.fillStyle=`rgba(120,200,255,${(a*.7).toFixed(3)})`;L2.fillRect(x,Math.round(y)+16,1,10)}
  L2.fillStyle='#ffffff';for(let i=0;i<12;i++){if((Math.floor(t*2)+i*3)%5===0)L2.fillRect((i*71+20)%W2,(i*23+5)%160,1,1)}
  const ss=(t%8);if(ss<.7){const sx=W2*.15+ss*W2*.8,sy=20+ss*40;L2.fillStyle='#fff';L2.fillRect(Math.round(sx),Math.round(sy),2,1);L2.fillStyle='rgba(255,255,255,.4)';L2.fillRect(Math.round(sx)-6,Math.round(sy)-1,6,1)}
  const mx=Math.round(W2*.78);for(let r=0;r<16;r++){const y=202+r*4,w=3+((r*7+Math.floor(t*6))%6);L2.fillStyle=`rgba(255,240,200,${(.5-r*.028).toFixed(2)})`;L2.fillRect(mx-Math.round(w/2)+Math.round(Math.sin(t*3+r)*2),y,w,1)}
  L2.fillStyle='rgba(140,190,255,.5)';for(let r=0;r<12;r++){const y=204+r*9,off=(t*(6+r*2)+r*31)%44;for(let x=-44;x<W2;x+=44)L2.fillRect(Math.round(x+off),y,6+r%3*3,1)}
  LBbits.forEach(b=>{b.x-=b.sp*dt;if(b.x<-12)b.x=W2+10;const by=b.y+Math.round(Math.sin(t*1.6+b.ph));L2.fillStyle='#2a3e66';L2.fillRect(Math.round(b.x)-1,by,b.w+2,3);L2.fillStyle='#d6ecff';L2.fillRect(Math.round(b.x),by,b.w,2);L2.fillStyle='#fff';L2.fillRect(Math.round(b.x),by,Math.ceil(b.w/2),1)});
  if(!window.LBbergs){const mk=(w,h,pk)=>{const c=document.createElement('canvas');c.width=w+4;c.height=h+8;const x=c.getContext('2d');const top=[[0,h],[w*.18,h*.45],[w*pk,0],[w*.72,h*.35],[w,h]];
      x.translate(2,2);x.fillStyle='#1a2a4a';x.beginPath();top.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill();
      x.fillStyle='#e8f6ff';x.beginPath();top.forEach(([a,b],i)=>i?x.lineTo(a+(a<w*pk?1:-1)*.9,b+1):x.moveTo(a+1,b));x.closePath();x.fill();
      x.fillStyle='#9ad0f4';x.beginPath();x.moveTo(w*pk,1);x.lineTo(w*.72-1,h*.35+1);x.lineTo(w-1,h);x.lineTo(w*pk,h);x.closePath();x.fill();
      x.fillStyle='#ffffff';x.fillRect(Math.round(w*pk)-1,1,2,2);x.fillRect(Math.round(w*.25),Math.round(h*.5),2,1);
      x.fillStyle='rgba(120,190,240,.35)';x.beginPath();x.moveTo(1,h);x.lineTo(w-1,h);x.lineTo(w*.7,h+5);x.lineTo(w*.3,h+5);x.closePath();x.fill();return c};
    window.LBbergs=[{c:mk(22,14,.42),x:LBW*.12,y:226,sp:2.2,ph:0},{c:mk(14,9,.55),x:LBW*.86,y:248,sp:3.4,ph:2}]}
  LBbergs.forEach(g=>{g.x-=g.sp*dt;if(g.x<-30)g.x=LBW+20;const by=g.y+Math.sin(t*1.1+g.ph)*1.6,r=Math.sin(t*.8+g.ph)*.05;L2.save();L2.translate(Math.round(g.x),Math.round(by));L2.rotate(r);L2.drawImage(g.c,-g.c.width/2,-g.c.height+6);L2.restore();
    L2.fillStyle='rgba(220,240,255,.35)';L2.fillRect(Math.round(g.x-g.c.width*.4),Math.round(by)+1,Math.round(g.c.width*.8),1)});
  const fx2=cx+Math.sin(t*.23)*16+Math.sin(t*.61)*4,fy=LBfy+18+Math.sin(t*1.3)*2.4+Math.sin(t*2.1)*.8,rot=Math.sin(t*.9)*.07+Math.sin(t*1.7)*.02;
  const rr=(t*.7)%1;L2.strokeStyle=`rgba(200,230,255,${(.55*(1-rr)).toFixed(2)})`;L2.lineWidth=1;L2.beginPath();L2.ellipse(Math.round(fx2),Math.round(LBfy+24),22+rr*20,3+rr*3,0,0,7);L2.stroke();
  L2.save();L2.translate(Math.round(fx2),Math.round(fy));L2.rotate(rot);
  const bs=bearSet().idle;const bf=Math.floor(t*6)%bs.cv.length;L2.drawImage(bs.cv[bf],-BAX,-BG+2);L2.drawImage(LBfloe,-20,0);L2.restore();
  L2.fillStyle='rgba(30,60,110,.45)';L2.fillRect(Math.round(fx2)-18,Math.round(LBfy+25),36,1);
  L2.fillStyle='#ffffff';LBsnow.forEach(s=>{s.y+=s.v*dt;s.x+=Math.sin(t+s.ph)*4*dt-3*dt;if(s.y>LBH){s.y=-2;s.x=(s.x+77)%W2}if(s.x<0)s.x+=W2;if(s.x<W2)L2.fillRect(Math.round(s.x),Math.round(s.y),s.ph%4?1:2,s.ph%4?1:2)})}

/* logo variants (canvas, redrawn when fonts arrive) */
let LOGO_V='mallang';try{const sv=localStorage.getItem('logoV2');if(sv)LOGO_V=sv}catch(e){}try{const q=new URLSearchParams(location.search).get('logo');if(q)LOGO_V=q}catch(e){}
const LHF='"Jal","Black Han Sans","Jua",sans-serif';
function pxMask(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');draw(x);const d=x.getImageData(0,0,w,h).data;const m=new Uint8Array(w*h);for(let i=0;i<w*h;i++)m[i]=d[i*4+3]>90?1:0;return m}
function pxPaint(w,h,m,o){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const img=x.createImageData(w,h),D=img.data;
  const put=(X,Y,col)=>{if(X<0||Y<0||X>=w||Y>=h)return;const i=(Y*w+X)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=255};const M=(X,Y)=>X>=0&&Y>=0&&X<w&&Y<h&&m[Y*w+X];
  const OL=hex(o.ol||'#140c0a'),SH=hex(o.sh||'#140c0a');
  if(o.drop)for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++)if(M(X,Y-2)||M(X-1,Y-2))put(X,Y,SH);
  for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++)if(!M(X,Y)&&(M(X+1,Y)||M(X-1,Y)||M(X,Y+1)||M(X,Y-1)||M(X+1,Y+1)||M(X-1,Y-1)||M(X+1,Y-1)||M(X-1,Y+1)))put(X,Y,OL);
  for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++)if(M(X,Y)){const top=!M(X,Y-1),bot=!M(X,Y+1);put(X,Y,hex(o.fill(Y,top,bot,X)))}
  if(o.snow){for(let X=0;X<w;X++)for(let Y=1;Y<h;Y++)if(Y>(o.snowY||0)&&M(X,Y)&&!M(X,Y-1)){const k=(X*7+Y*3)%5;put(X,Y-1,hex('#ffffff'));if(k<3)put(X,Y-2,hex('#ffffff'));if(k===0)put(X,Y-3,hex('#eaf6ff'));put(X,Y,hex('#dff0ff'))}
    for(let X=1;X<w-1;X+=1)for(let Y=(o.snowY||0);Y<h-1;Y++)if(M(X,Y)&&!M(X,Y+1)&&((X*13+Y)%9===0)){put(X,Y+1,hex('#bfe4ff'));put(X,Y+2,hex('#bfe4ff'));put(X,Y+3,hex('#eaf8ff'))}}
  x.putImageData(img,0,0);return c}
function textMask(w,h,lines){return pxMask(w,h,x=>{x.textAlign='center';x.textBaseline='middle';x.fillStyle='#000';lines.forEach(l=>{x.font=`${l.size}px ${LHF}`;x.save();x.translate(l.x,l.y);x.rotate(l.r||0);x.fillText(l.s,0,0);x.restore()})})}
function blit(x,c,k){x.imageSmoothingEnabled=false;x.drawImage(c,0,0,c.width*k,c.height*k)}
const LOGOS={
 mallang(x){const OL='#1a2140';x.lineJoin='round';x.textAlign='center';x.textBaseline='middle';
  const t=(s,cx,cy,size,fill,ow)=>{x.save();x.translate(cx,cy);x.font=`${size}px ${LHF}`;
    x.lineWidth=ow+10;x.strokeStyle='rgba(10,16,40,.35)';x.strokeText(s,0,8);
    x.lineWidth=ow;x.strokeStyle=OL;x.strokeText(s,0,0);x.fillStyle=OL;x.fillText(s,0,6);
    x.fillStyle=fill(size);x.fillText(s,0,0);
    x.save();x.globalCompositeOperation='source-atop';x.restore();x.restore()};
  t('잃어버린 고향을',352,92,74,()=>'#ffffff',22);
  t('찾아서',352,212,150,sz=>{const g=x.createLinearGradient(0,-sz*.42,0,sz*.42);g.addColorStop(0,'#f2fbff');g.addColorStop(.38,'#9ad8ff');g.addColorStop(.62,'#4aa8ff');g.addColorStop(1,'#2a6ae0');return g},30);
  // gloss on 찾아서
  x.save();x.font=`150px ${LHF}`;x.textAlign='center';x.textBaseline='middle';const m=document.createElement('canvas');m.width=704;m.height=400;const q=m.getContext('2d');q.font=x.font;q.textAlign='center';q.textBaseline='middle';q.fillText('찾아서',352,212);q.globalCompositeOperation='source-in';q.fillStyle='rgba(255,255,255,.55)';q.beginPath();q.ellipse(352,170,250,22,0,0,7);q.fill();x.drawImage(m,0,0);x.restore();
  // pill badge
  const bw=330,bh=46,bx=352-bw/2,by=302;const rr=(X,Y,W,H,R)=>{x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath()};
  rr(bx-6,by-6,bw+12,bh+16,30);x.fillStyle=OL;x.fill();rr(bx,by,bw,bh,25);const g=x.createLinearGradient(0,by,0,by+bh);g.addColorStop(0,'#ffe680');g.addColorStop(1,'#ffbf2a');x.fillStyle=g;x.fill();
  x.font=`22px ${LHF}`;x.fillStyle=OL;x.textAlign='center';x.textBaseline='middle';x.fillText("A POLAR BEAR'S JOURNEY",352,by+bh/2+2);
  [[118,72,14],[600,150,11],[96,236,9]].forEach(([a,b,r])=>{x.fillStyle='#fff8d0';x.beginPath();for(let i=0;i<8;i++){const an=i/8*Math.PI*2,rr2=i%2?r*.32:r;x.lineTo(a+Math.cos(an)*rr2,b+Math.sin(an)*rr2)}x.closePath();x.fill()})},
 old(x){const HF=LHF;x.save();x.translate(320,206);x.rotate(-.05);
  x.beginPath();const N=18;for(let i=0;i<N*2;i++){const a=i/(N*2)*Math.PI*2,r=i%2?150:182,rx=r*1.62;x.lineTo(Math.cos(a)*rx,Math.sin(a)*r*.82)}x.closePath();
  x.fillStyle='#140c0a';x.fill();x.save();x.scale(.94,.92);const bg=x.createRadialGradient(0,-30,10,0,0,260);bg.addColorStop(0,'#bfeaff');bg.addColorStop(.6,'#5ab4f0');bg.addColorStop(1,'#2c6ad0');x.fillStyle=bg;x.fill();x.restore();x.restore();
  const txt=(s,cx,cy,size,rot,fill,ow)=>{x.save();x.translate(cx,cy);x.rotate(rot);x.font=`${size}px ${HF}`;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=ow;x.strokeStyle='#140c0a';x.strokeText(s,0,0);x.fillStyle=fill(x,size);x.fillText(s,0,0);x.restore()};
  txt('잃어버린 고향을',320,122,70,-.06,()=>'#ffffff',18);txt('찾아서..',326,240,150,-.05,(x,s)=>{const g=x.createLinearGradient(0,-s*.45,0,s*.45);g.addColorStop(0,'#fff6a0');g.addColorStop(1,'#ff7a12');return g},26)},
 pixel(x){const w=176,h=100,m=textMask(w,h,[{s:'잃어버린 고향을',size:23,x:88,y:27},{s:'찾아서..',size:44,x:90,y:63}]);
  blit(x,pxPaint(w,h,m,{drop:1,fill:(Y,top,bot)=>top?'#fff8d8':bot?'#e08a20':Y<44?'#ffffff':Y<60?'#ffe066':'#ffb52a'}),4);
  const s=pxPaint(w,h,textMask(w,h,[{s:"A POLAR BEAR'S JOURNEY",size:8,x:88,y:91}]),{fill:()=>'#9fd8ff'});blit(x,s,4)},
 snow(x){const w=176,h=100,m=textMask(w,h,[{s:'잃어버린 고향을',size:23,x:88,y:27},{s:'찾아서..',size:44,x:90,y:65}]);
  blit(x,pxPaint(w,h,m,{drop:1,ol:'#16264a',sh:'#0a1430',snow:1,snowY:42,fill:(Y,top,bot,X)=>bot?'#5a8ad0':Y<44?((X+Y)%9===0?'#eaf6ff':'#ffffff'):Y<58?'#d6ecff':Y<70?'#a8d0f4':'#7eb2e8'}),4);
  const s=pxPaint(w,h,textMask(w,h,[{s:"A POLAR BEAR'S JOURNEY",size:8,x:88,y:94}]),{ol:'#16264a',fill:()=>'#ffd66a'});blit(x,s,4)},
 sign(x){const w=176,h=100,c=document.createElement('canvas');c.width=w;c.height=h;const p=c.getContext('2d');
  const wood=(y0,y1,x0,x1,sk)=>{p.fillStyle='#140c0a';p.fillRect(x0-1,y0-1,x1-x0+2,y1-y0+2);for(let y=y0;y<y1;y++){p.fillStyle=y===y0?'#e2a86a':y===y1-1?'#7a4a26':((y-y0)%5===2)?'#a8703e':'#c08850';p.fillRect(x0,y,x1-x0,1)}
    p.fillStyle='#8a5630';for(let i=0;i<6;i++){const gx=x0+8+((i*37+sk)%(x1-x0-16));p.fillRect(gx,y0+3+(i%3)*4,6,1)}};
  p.save();p.translate(8,0);p.translate(80,52);p.rotate(-.04);p.translate(-80,-52);
  p.fillStyle='#4a2e1a';p.fillRect(28,10,2,14);p.fillRect(130,10,2,14);
  wood(18,46,6,154,3);wood(48,88,8,152,11);
  [[18,22],[142,22],[12,52],[148,52],[12,82],[148,82]].forEach(([nx,ny])=>{p.fillStyle='#3a3a44';p.fillRect(nx,ny,2,2);p.fillStyle='#c8c8d0';p.fillRect(nx,ny,1,1)});
  p.fillStyle='#ffffff';for(let X=14;X<146;X++){const k=(X*7)%5;p.fillRect(X,17-(k<2?1:0),1,1+(k<2?1:0))}for(let X=8;X<152;X+=1){if((X*11)%7<4)p.fillRect(X,47,1,1)}
  p.restore();
  const m=textMask(w,h,[{s:'잃어버린 고향을',size:21,x:88,y:32,r:-.04},{s:'찾아서',size:34,x:88,y:69,r:-.04}]);
  const t=pxPaint(w,h,m,{ol:'#3a2010',fill:(Y,top)=>top?'#fff2c8':Y<46?'#fff8e8':'#ffe08a'});p.drawImage(t,0,0);
  blit(x,c,4)},
 mini(x){x.textAlign='center';x.textBaseline='middle';
  x.font=`30px ${LHF}`;x.fillStyle='rgba(10,8,30,.5)';x.fillText('잃 어 버 린   고 향 을',320,128);x.fillStyle='#cfe6ff';x.fillText('잃 어 버 린   고 향 을',320,124);
  x.font=`128px ${LHF}`;x.fillStyle='rgba(10,8,30,.55)';x.fillText('찾아서',320,232);x.lineJoin='round';x.lineWidth=10;x.strokeStyle='#1c2a5a';x.strokeText('찾아서',320,222);x.fillStyle='#ffffff';x.fillText('찾아서',320,222);
  x.fillStyle='#ffd66a';[[480,170],[498,170]].forEach(([a,b])=>{x.beginPath();x.arc(a+20,b+92,7,0,7);x.fill()});
  x.font=`18px ${LHF}`;x.fillStyle='#9fc4f0';x.fillText("A  POLAR  BEAR'S  JOURNEY",320,316);x.fillStyle='#9fc4f0';x.fillRect(150,315,40,2);x.fillRect(450,315,40,2)}
};
function drawLogo(){const c=$('#logo'),x=c.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,704,400);if(LOGO_V==='mallang'){LOGOS.mallang(x);return}if(LOGO_V==='old'||LOGO_V==='mini')x.translate(32,0);(LOGOS[LOGO_V]||LOGOS.snow)(x)}
const LOGO_ORDER=['mallang','snow','pixel','sign','mini','old'],LOGO_NAME={mallang:'0. 말랑 스타일',snow:'1. 눈 쌓인 픽셀',pixel:'2. 노란 픽셀',sign:'3. 나무 판자 간판',mini:'4. 미니멀',old:'5. 기존'};
$('#logo').addEventListener('click',()=>{LOGO_V=LOGO_ORDER[(LOGO_ORDER.indexOf(LOGO_V)+1)%LOGO_ORDER.length];try{localStorage.setItem('logoV2',LOGO_V)}catch(e){}drawLogo();sfx('ui');
  const t=$('#lver');if(t){t.textContent='제목 시안 '+LOGO_NAME[LOGO_V]+' (제목을 눌러 바꾸기)';clearTimeout(t._t);t._t=setTimeout(()=>t.textContent='VER 0.5 · DEMO',2500)}});
drawLogo();if(document.fonts){document.fonts.ready.then(drawLogo);document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',drawLogo)}

/* ================= prologue: vertical webtoon, one panel at a time ================= */
const PW=[...document.querySelectorAll('#toon .pw')],PX=PW.map(p=>{const x=p.querySelector('.pan canvas').getContext('2d');x.imageSmoothingEnabled=false;return x});
const INX=PW[2].querySelector('.inset canvas').getContext('2d');INX.imageSmoothingEnabled=false;
let introT=0,introI=0,introFrom=false,introAuto=0;
const T1sky=pcan(180,100,put=>{grad(put,180,0,64,['#ff9a5a','#ffb86a','#ffd88a','#fff0c0']);grad(put,180,64,100,['#4aa8e0','#2a86c8','#1c68a8'])});
const T2sky=pcan(180,110,put=>{grad(put,180,0,110,['#0a0e1a','#141c30','#1e2842','#283452','#1a2842'])});
const T3bg=pcan(180,120,put=>{grad(put,180,0,30,['#8ad0f4','#a8def6','#c8ecfa']);
  for(let x=0;x<180;x++){const sh=Math.round(30+x*.12);for(let y=30;y<sh+2;y++)put(x,y,hex(y<32?'#3a9ad8':'#2a86c8'))}
  for(let y=30;y<120;y++)for(let x=0;x<180;x++){const sh=Math.round(30+x*.12)+Math.round(Math.sin(y*.05)*2);if(y>=sh+2){const n=((x*7+y*13)%17===0);put(x,y,hex(n?'#d8b878':y-sh<8?'#c8a868':'#ecd29a'))}}
  for(let i=0;i<20;i++){const px=(i*47)%180,py=60+(i*29)%60;put(px,py,hex('#c09858'));put(px+1,py,hex('#c09858'))}});
const T4bg=pcan(180,110,put=>{grad(put,180,0,58,['#3a1c4a','#7a2c5a','#d0584a','#f0a050','#ffd890']);disc(put,138,52,12,hex('#fff0c0'));
  grad(put,180,58,70,['#d06a5a','#a05068','#704060']);for(let x=0;x<180;x++)for(let y=58;y<70;y++)if((x+y*3)%23===0)put(x,y,hex('#ffc890'));
  grad(put,180,70,110,['#c8926a','#b07a5a','#8a5a4a','#6a4238'])});
function wave(L2,y0,amp,len,ph,col,top,h){L2.fillStyle=col;L2.beginPath();L2.moveTo(0,y0+h);for(let x=0;x<=180;x+=2)L2.lineTo(x,y0+Math.sin(x/len+ph)*amp);L2.lineTo(180,y0+h);L2.closePath();L2.fill();
  if(top){L2.fillStyle=top;for(let x=0;x<=180;x+=2){const y=y0+Math.sin(x/len+ph)*amp;if(Math.cos(x/len+ph)>.4)L2.fillRect(x,Math.round(y)-1,2,2)}}}
function iceberg(L2,cx,base,w,h){L2.fillStyle='#2a3e66';L2.beginPath();L2.moveTo(cx-w/2-1,base);L2.lineTo(cx-w/2+6,base-h*.7);L2.lineTo(cx-4,base-h-1);L2.lineTo(cx+8,base-h*.8);L2.lineTo(cx+w/2+1,base);L2.closePath();L2.fill();
  L2.fillStyle='#d6ecff';L2.beginPath();L2.moveTo(cx-w/2,base);L2.lineTo(cx-w/2+6,base-h*.7+1);L2.lineTo(cx-4,base-h);L2.lineTo(cx+8,base-h*.8+1);L2.lineTo(cx+w/2,base);L2.closePath();L2.fill();
  L2.fillStyle='#fff';L2.fillRect(Math.round(cx-6),Math.round(base-h+2),5,2);L2.fillStyle='#9cc4ea';L2.fillRect(Math.round(cx+2),Math.round(base-h*.5),Math.round(w*.3),Math.round(h*.4))}
function bearLying(L2,x,y,t){const B=bearSet(),fr=B.idle.cv[0];L2.save();L2.translate(x,y);L2.rotate(Math.PI/2*.92+Math.sin(t*1.3)*.02);L2.drawImage(fr,-BAX,-BG+14);L2.restore()}
function toonDraw(i,t){const L2=PX[i];L2.setTransform(1,0,0,1,0,0);L2.imageSmoothingEnabled=false;const B=bearSet();
  if(i===0){L2.drawImage(T1sky,0,0);const sr=12+Math.sin(t*3)*1.5;L2.fillStyle='rgba(255,250,200,.5)';L2.beginPath();L2.arc(150,22,sr+7,0,7);L2.fill();L2.fillStyle='#fff6c0';L2.beginPath();L2.arc(150,22,sr,0,7);L2.fill();
    L2.strokeStyle='rgba(255,220,140,.7)';for(let k=0;k<10;k++){const a=k/10*Math.PI*2+t*.4;L2.beginPath();L2.moveTo(150+Math.cos(a)*(sr+5),22+Math.sin(a)*(sr+5));L2.lineTo(150+Math.cos(a)*(sr+14),22+Math.sin(a)*(sr+14));L2.stroke()}
    iceberg(L2,28,72,30,12);const shrink=(t%8)/8,h=20-shrink*6,w=74-shrink*16;iceberg(L2,104,78,w,h);
    L2.fillStyle='#bfe4ff';for(let k=0;k<8;k++){const dx=104-w/2+6+k*(w-12)/7,u=((t*1.2+k*.31)%1);L2.fillRect(Math.round(dx),Math.round(78-h*.35+u*14),1,2)}
    L2.drawImage(B.idle.cv[Math.floor(t*6)%B.idle.cv.length],100-BAX,Math.round(78-h+2)-BG);wave(L2,79,1.5,9,t*2,'#2a86c8','#bfe4ff',30);L2.fillStyle='rgba(255,255,255,.6)';for(let k=0;k<6;k++){const x=(k*37+t*10)%180;L2.fillRect(Math.round(x),84+k*3,7,1)}}
  if(i===1){L2.drawImage(T2sky,0,0);const fl=(t%3)<.12;if(fl){L2.fillStyle='rgba(220,230,255,.8)';L2.fillRect(0,0,180,110);L2.fillStyle='#fff';let x=140,y=0;while(y<60){const nx=x+rnd(-9,9);L2.fillRect(Math.round(Math.min(x,nx)),Math.round(y),Math.abs(nx-x)+2,10);x=nx;y+=10}}
    L2.fillStyle='rgba(150,180,220,.5)';for(let k=0;k<50;k++){const x=(k*29+t*90)%200-10,y=(k*17+t*170)%110;L2.fillRect(Math.round(x),Math.round(y),1,5)}
    wave(L2,50,8,14,t*1.6,'#1a3a66','#9cc8f0',70);
    const by=64+Math.sin(t*2.2)*5,rot=Math.sin(t*1.7)*.22;L2.save();L2.translate(96,Math.round(by));L2.rotate(rot);
    L2.drawImage(B.idle.cv[0],-BAX,-BG+1);L2.fillStyle='#2a3e66';L2.fillRect(-15,0,30,5);L2.fillStyle='#d6ecff';L2.fillRect(-14,0,28,3);L2.fillStyle='#fff';L2.fillRect(-14,0,14,1);L2.restore();
    wave(L2,70,7,11,-t*2.1+1,'#24508a','#cfe6ff',50);wave(L2,88,6,9,t*2.6+2,'#122a4e','#9cc8f0',30);
    L2.fillStyle='#e8f4ff';for(let k=0;k<8;k++){const u=((t*1.5+k*.13)%1);L2.fillRect(Math.round(20+k*20+Math.sin(k)*6),Math.round(70-u*20),2,2)}}
  if(i===2){L2.drawImage(T3bg,0,0);const sw=Math.pow((Math.sin(t*1.3)+1)/2,1.6),reach=8+sw*58,edge=x=>30+x*.12+reach+Math.sin(x*.12+t*2)*3;
    L2.fillStyle='#d8bc84';L2.beginPath();L2.moveTo(0,30);for(let x=0;x<=180;x+=3)L2.lineTo(x,edge(x)+4);L2.lineTo(180,30);L2.closePath();L2.fill();
    L2.fillStyle='#5a3a24';L2.fillRect(120,86,34,5);L2.fillStyle='#8a5a34';L2.fillRect(121,86,32,3);L2.fillStyle='#a87444';L2.fillRect(121,86,32,1);
    bearLying(L2,70,92,t);L2.fillStyle='#2a7a3a';[[50,77],[54,76],[58,78]].forEach(([x,y])=>{L2.fillRect(x,y,2,6+Math.round(Math.sin(t*2+x)))});
    L2.fillStyle='rgba(58,150,214,.62)';L2.beginPath();L2.moveTo(0,30);for(let x=0;x<=180;x+=3)L2.lineTo(x,edge(x)-4);L2.lineTo(180,30);L2.closePath();L2.fill();
    L2.fillStyle='rgba(42,134,200,.85)';L2.beginPath();L2.moveTo(0,30);for(let x=0;x<=180;x+=3)L2.lineTo(x,Math.min(edge(x)-14,30+x*.12+30));L2.lineTo(180,30);L2.closePath();L2.fill();
    L2.fillStyle='#ffffff';for(let x=0;x<=180;x+=3){const y=edge(x)-4;L2.fillRect(x,Math.round(y)-1,3,2);if((x+Math.floor(t*8))%9<3)L2.fillRect(x+1,Math.round(y)-3,2,2);if(sw>.6&&(x*7)%5===0)L2.fillRect(x,Math.round(y)-6-((t*20+x)%6|0),1,1)}
    L2.fillStyle='rgba(255,255,255,.5)';for(let x=0;x<180;x+=12)L2.fillRect(x+Math.round(Math.sin(t+x)*3),30+Math.round(x*.12)+6,6,1);
    L2.fillStyle='rgba(180,230,255,.9)';for(let k=0;k<5;k++){const u=((t*1.1+k*.2)%1);L2.fillRect(46+k*10,Math.round(68+u*16),1,2)}
    const cx2=146+Math.round(Math.sin(t*1.5)*6);L2.fillStyle='#140c0a';L2.fillRect(cx2-1,104,10,6);L2.fillStyle='#e84a3a';L2.fillRect(cx2,105,8,4);L2.fillStyle='#fff';L2.fillRect(cx2+1,103,1,1);L2.fillRect(cx2+6,103,1,1)
    const ix=INX;ix.imageSmoothingEnabled=false;ix.fillStyle='#ffe066';ix.fillRect(0,0,44,36);ix.fillStyle='#ffc23a';for(let k=0;k<12;k++){ix.save();ix.translate(22,18);ix.rotate(k/12*Math.PI*2+t*.3);ix.fillRect(0,-1,30,3);ix.restore()}
    const fr=B.idle.cv[0];ix.drawImage(fr,28,54,22,18,0,0,44,36);
    ix.fillStyle='#8ad0ff';const d=((t*.9)%1);ix.fillRect(36,Math.round(4+d*20),2,3);ix.fillRect(6,Math.round(8+((d+.5)%1)*20),2,3)}
  if(i===3){L2.drawImage(T4bg,0,0);L2.fillStyle='rgba(255,220,160,.6)';for(let k=0;k<4;k++){const y=62+k*2;L2.fillRect(126+Math.round(Math.sin(t*2+k)*2),y,24-k*5,1)}
    const sw=(Math.sin(t*1.2)+1)/2;L2.fillStyle='rgba(255,240,220,.7)';for(let x=0;x<180;x+=3)L2.fillRect(x,Math.round(70+sw*4+Math.sin(x*.1+t)*1),3,1);
    const u=(t%10)/10,x=-20+u*230,y=96;L2.fillStyle='rgba(90,50,40,.45)';for(let fx=x-14;fx>-20;fx-=9)L2.fillRect(Math.round(fx),y+3+((Math.round(fx/9))%2?1:-1),3,2);
    L2.fillStyle='rgba(40,20,30,.35)';L2.beginPath();L2.ellipse(x-18,y+4,22,3,0,0,7);L2.fill();
    const run=B.run;L2.save();L2.translate(Math.round(x),y);L2.drawImage(run.cv[Math.floor(t*7)%run.cv.length],-BAX,-BG);L2.restore();
    const g=mobFrames('gull',1);[[0,22],[1,34]].forEach(([k,gy])=>{const gx=200-((t*20+k*90)%240);L2.save();L2.translate(Math.round(gx),gy);L2.scale(-.7,.7);L2.drawImage(g.fr[Math.floor(t*6+k)%4],-g.ax,-g.ay+20);L2.restore()})}
}
function introDraw(dt){introT+=dt;for(let i=0;i<=Math.min(introI,3);i++)toonDraw(i,introT+i*.7);if(introI<3){introAuto+=dt;if(introAuto>3.6)nextCut()}}
function revealCut(){PW.forEach((p,i)=>p.classList.toggle('on',i<=introI));$('#iGo').hidden=introI<3;$('#iHint').hidden=introI>=3;sfx('ui');introAuto=0;
  const tn=$('#toon');requestAnimationFrame(()=>{const p=PW[introI];tn.scrollTop=p.offsetTop-tn.offsetTop-8})}
function nextCut(){if(introI<3){introI++;revealCut()}}
function showIntro(fromLobby){introFrom=fromLobby;introI=0;introT=0;screen='intro';$('#lobby').hidden=true;$('#game').hidden=true;$('#intro').hidden=false;$('#toon').scrollTop=0;revealCut();setBgm(null)}
function endIntro(){$('#intro').hidden=true;if(introFrom){screen='lobby';$('#lobby').hidden=false;lobbyInfo()}else goGame()}
$('#intro').addEventListener('click',e=>{if(e.target.closest('button'))return;nextCut()});
$('#iGo').addEventListener('click',endIntro);$('#iSkip').addEventListener('click',endIntro);
$('#lDex').addEventListener('click',()=>showIntro(true));

/* ================= victory (chapter boss) ================= */
let vRAF=0;
function rTile(type,drawFn,amount,name,delay,grade){const w=document.createElement('div');w.className='rw t-'+type+(grade>=2?' rare':'');w.style.animationDelay=delay+'s';
  if(type==='item'){const c1=GCOL[grade];w.style.setProperty('--r0','#ffffff');w.style.setProperty('--r1',c1);w.style.setProperty('--r2',dark(c1,.45))}
  const t=document.createElement('div');t.className='rt';const c=document.createElement('canvas');drawFn(c);t.append(c);
  if(grade!=null)t.insertAdjacentHTML('beforeend',badge(grade));if(amount!=null){const b=document.createElement('b');b.className='ra';b.textContent=amount;t.append(b)}
  const sh=document.createElement('i');sh.className='sh';sh.style.animationDelay=(delay+.25)+'s';t.append(sh);
  w.append(t);const n=document.createElement('small');n.className='rn';n.textContent=name;w.append(n);
  setTimeout(()=>sfx('coin'),delay*1000+100);return w}
function countUp(el,to,ms){const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/ms),e=1-Math.pow(1-k,3);el.textContent=fmt(Math.round(to*e));if(k<1)requestAnimationFrame(f)})(t0)}
let vLast=0;function showVictory(c0){vLast=c0;const gold=Math.floor(mobGold(S.g)*200),gem=100,exp=Math.floor(needExp(S.lv)*.6),item=rollItem(2);
  S.gold+=gold;S.gem+=gem;gainExp(exp);S.inv[item]=(S.inv[item]||0)+1;
  $('#vCh').textContent=c0+1;$('#vNum').textContent=10;const kills=S.chKill||0;S.chKill=0;$('#vKill').textContent='0';setTimeout(()=>countUp($('#vKill'),kills,700),300);
  const T=$('#vTiles');T.innerHTML='';const g=ITEMS[item].g;
  T.append(rTile('gold',c=>vecInto(c,[E(12,12,8.5,8.5,'gold',1),E(12,12,4,5.5,null,2,{col:hex('#c88a10')})]),fmt(gold),'골드',.55),
    rTile('gem',c=>vecInto(c,[Pg([[12,2.5],[21.5,10],[12,21.5],[2.5,10]],'scarf',1),Pg([[12,2.5],[16,10],[12,21.5],[8,10]],'ice',1.1)]),fmt(gem),'보석',.72),
    rTile('exp',c=>{c.width=c.height=96;const x=c.getContext('2d');x.font='38px "Jal","Fredoka",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=10;x.strokeStyle='#140c0a';x.strokeText('EXP',48,48);x.fillStyle='#ffffff';x.fillText('EXP',48,48)},fmt(exp),'경험치',.89),
    rTile('item',c=>itemIcon(c,item),null,ITEMS[item].n,1.06,g));
  logAdd(`${badge(ITEMS[item].g)}<span style="color:${GCOL[ITEMS[item].g]}">${ITEMS[item].n}</span> · 챕터 보상`);
  $('#victory').hidden=false;sfx('level');setTimeout(()=>sfx('drop',ITEMS[item].g),800);save();
  const vc=$('#vIcon').getContext('2d');vc.imageSmoothingEnabled=false;const B=bearSet(),A=B.win||B.idle;let t0=performance.now();
  cancelAnimationFrame(vRAF);(function loop(now){if($('#victory').hidden)return;const f=Math.max(0,Math.floor((now-t0)/100))%A.cv.length;vc.clearRect(0,0,64,72);vc.drawImage(A.cv[f],10,30,64,72,0,0,64,72);vRAF=requestAnimationFrame(loop)})(t0)}
$('#vOk').addEventListener('click',()=>{if(vLast%200===99)setTimeout(()=>modal('마계 원정 시작!','사천왕 바르카스가 쓰러지자 대발전소의 불이 꺼졌어요. 하지만 마왕 메가와트는 이미 마계로 달아난 뒤였어요. 북실이는 마계의 문으로 향해요…','11챕터 · 마계의 문','출발!'),700);if(vLast%200===199)setTimeout(()=>modal('엔딩 · 고향의 빙하가 다시 얼어요','마왕 메가와트가 멈추자 대발전소의 불이 꺼지고, 대륙에 다시 나무가 자라기 시작했어요. 북극의 빙하도 조금씩 다시 얼어요. 그런데… 비비가 날아와 외쳐요. "다른 대륙에 또 새 마왕이 나타났대!"','','다음 회차로!'),700);$('#victory').hidden=true;cancelAnimationFrame(vRAF);sfx('ui');banner(theme().name,'#7bdc4f');if(theme().story)setTimeout(()=>toast(theme().story),600);setBgm(chBgm());renderPanel()});
/* ================= gacha reveal: cards, rare (A+) motion ================= */
let gTok=0,gSkip=false,gLast=null;
const gSleep=ms=>new Promise(r=>setTimeout(r,gSkip?0:ms));
function dark(hx,k){const n=parseInt(hx.slice(1),16);const f=c=>Math.round(c*k);return`rgb(${f(n>>16)},${f(n>>8&255)},${f(n&255)})`}
function gSpark(card,col,n){for(let i=0;i<n;i++){const s=document.createElement('i');s.className='spark';const a=Math.random()*Math.PI*2,d=40+Math.random()*50;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');s.style.animationDelay=(Math.random()*.1)+'s';card.appendChild(s);setTimeout(()=>s.remove(),900)}}
async function showGacha(got,n,cost,type,dups){type=type||'item';dups=dups||[];const tok=++gTok;gSkip=false;gLast={n,cost,type};const G=$('#gGrid');G.innerHTML='';G.classList.toggle('one',got.length===1);
  $('#gacha').hidden=false;$('.gbtns').hidden=true;$('#gHint').hidden=false;$('#gTitle').textContent=`${type==='pet'?'펫':'장비'} 소환 ${n}회`;
  const best=Math.max(...got.map(id=>GI(id).g));
  const cards=got.map((id,i)=>{const it=GI(id),c=document.createElement('div');c.className='gc';c.style.animationDelay=(i*.05)+'s';
    c.style.setProperty('--gc1',GCOL[it.g]);c.style.setProperty('--gc2',dark(GCOL[it.g],.45));
    c.innerHTML=`<i class="glow"></i><div class="bk"></div><div class="fr"><canvas></canvas>${badge(it.g)}<em>${it.n}</em>${dups[i]?`<u class="gup">+${dups[i]}</u>`:''}</div>`;anyIcon(c.querySelector('canvas'),id);
    G.appendChild(c);return c});
  sfx('ui');await gSleep(450+got.length*50);
  for(let i=0;i<cards.length;i++){if(tok!==gTok)return;const c=cards[i],gr=GI(got[i]).g;
    if(gr>=2){if(!gSkip){const hi=gr>=3,G2=$('#gGrid');G2.classList.add('focus');if(hi)$('#gacha').classList.add('dim');
        c.style.setProperty('--cd',hi?'1.6s':'1.15s');c.style.setProperty('--spin',hi?'1440deg':'1080deg');{const rc=c.getBoundingClientRect(),rg=G2.getBoundingClientRect();c.style.setProperty('--tx',Math.round((rg.left+rg.width/2-(rc.left+rc.width/2))*.45)+'px')}c.classList.add('charge');sfx('whoosh');
        await gSleep(hi?1600:1150);c.classList.add('tremble');sfx('magic');await gSleep(hi?520:300);
        const F=$('#gFlash');F.style.setProperty('--fc',GCOL[gr]);F.classList.add('c');F.classList.remove('on');void F.offsetWidth;F.classList.add('on');
        if(hi){$('#gacha').classList.remove('shake');void $('#gacha').offsetWidth;$('#gacha').classList.add('shake')}
        c.classList.remove('charge','tremble');G2.classList.remove('focus');$('#gacha').classList.remove('dim')}
      c.classList.add('open','lit','pop');gSpark(c,GCOL[gr],gr>=3?18:10);sfx('level');
      if(!gSkip)await gShowcase(c,got[i],gr);
      await gSleep(200)}
    else{c.classList.add('open');sfx('drop',gr);await gSleep(110)}}
  if(tok!==gTok)return;$('#gHint').hidden=true;$('.gbtns').hidden=false;$('#gAgain').disabled=S.gem<cost;$('#gAgain').innerHTML=`다시 ${n}회 <small style="font-size:.7em">💎${cost}</small>`;
}
$('#gacha').addEventListener('click',e=>{if(e.target.closest('button'))return;if($('.gbtns').hidden)gSkip=true});
$('#gOk').addEventListener('click',()=>{gTok++;$('#gacha').hidden=true;sfx('ui');if(tab==='shop'||tab==='gear'||tab==='pet')renderPanel();if(typeof petsChanged==='function')petsChanged()});
$('#gAgain').addEventListener('click',()=>{const{n,cost,type}=gLast;if(S.gem<cost)return;S.gem-=cost;S.cnt.summon=(S.cnt.summon||0)+n;const P=rollPull(type,n);save();showGacha(P.ids,n,cost,type,P.dups)});
function gShowcase(card,id,gr){return new Promise(res=>{const it=GI(id),r=card.getBoundingClientRect();
  const w=document.createElement('div');w.className='gshow'+(gr>=3?' hi':'');w.style.setProperty('--gc1',GCOL[gr]);w.style.setProperty('--gc2',dark(GCOL[gr],.4));
  w.innerHTML=`<i class="srays"></i><i class="srays b"></i><div class="scard"><canvas></canvas><i class="shine"></i></div>`;
  const cv=w.querySelector('canvas');anyIcon(cv,id);const sc=w.querySelector('.scard');
  const cx=r.left+r.width/2-innerWidth/2,cy=r.top+r.height/2-innerHeight/2;sc.style.setProperty('--fx',cx+'px');sc.style.setProperty('--fy',cy+'px');
  $('#gacha').appendChild(w);for(let k=0;k<(gr>=3?26:14);k++){const s=document.createElement('i');s.className='spark';const a=Math.random()*Math.PI*2,d=110+Math.random()*120;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');s.style.animationDelay=(.15+Math.random()*.25)+'s';s.style.width=s.style.height=(6+Math.random()*8)+'px';w.appendChild(s)}
  let done=false;const end=()=>{if(done)return;done=true;w.classList.add('out');setTimeout(()=>{w.remove();res()},320)};
  w.addEventListener('click',e=>{e.stopPropagation();end()});setTimeout(end,gr>=3?1900:1300)})}
</script>
<script>
if(document.fonts&&document.fonts.load)Promise.all([document.fonts.load('20px "Jal"'),document.fonts.load('20px "Ssr"')]).then(()=>{GLY={};OKC=null;drawLogo()}).catch(()=>{});
/* ================= away (offline) rewards ================= */
function showAway(sec,gold){const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);const kills=Math.floor(sec/3.2),exp=Math.floor(Math.pow(1.12,effG())*kills*.35);
  $('#aTime').textContent=(h?h+'시간 ':'')+m+'분';$('#aKill').textContent='0';setTimeout(()=>countUp($('#aKill'),kills,800),300);
  const T=$('#aTiles');T.innerHTML='';
  T.append(rTile('gold',c=>vecInto(c,[E(12,12,8.5,8.5,'gold',1),E(12,12,4,5.5,null,2,{col:hex('#c88a10')})]),fmt(gold),'골드',.45),
    rTile('exp',c=>{c.width=c.height=96;const x=c.getContext('2d');x.font='38px "Jal","Fredoka",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=10;x.strokeStyle='#140c0a';x.strokeText('EXP',48,48);x.fillStyle='#fff';x.fillText('EXP',48,48)},fmt(exp),'경험치',.62),
    rTile('gem',c=>vecInto(c,[Pg([[12,2.5],[21.5,10],[12,21.5],[2.5,10]],'scarf',1),Pg([[12,2.5],[16,10],[12,21.5],[8,10]],'ice',1.1)]),String(Math.min(60,Math.floor(sec/600))),'보석',.79));
  const ac=$('#aBear').getContext('2d');ac.imageSmoothingEnabled=false;ac.clearRect(0,0,64,48);const fr=bearSet().run.cv[0];ac.drawImage(fr,8,50,64,48,0,0,64,48);
  $('#aOk').onclick=()=>{S.gold+=gold;gainExp(exp);S.gem+=Math.min(60,Math.floor(sec/600));S.cnt.kill=(S.cnt.kill||0)+kills;save();$('#away').hidden=true;sfx('coin');for(let i=0;i<14;i++)coins.push({x:rnd(60,120)*K,y:rnd(40,90)*K,vx:rnd(-200,200),vy:rnd(-500,-200),t:0,v:0,fly:0})};
  $('#away').hidden=false;sfx('level')}
</script>
