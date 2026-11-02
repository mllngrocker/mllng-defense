<script>
/* ================= Maple-style damage numbers ================= */
const DSTY={
  norm:{size:30,fill:['#fffbd6','#ffe45a','#ffa61c'],st:'#3a1600',sw:7},
  crit:{size:44,fill:['#ffffff','#ffe2a8','#ff8a2a','#e8201c'],st:'#2e0000',sw:9},
  hurt:{size:24,fill:['#ffe4e4','#ff6a78','#c41834'],st:'#2a0010',sw:6}};
let GLY={};
function glyph(ch,sty){const key=sty+ch;if(GLY[key])return GLY[key];const d=DSTY[sty];const c=document.createElement('canvas'),x=c.getContext('2d');
  const font=`${d.size}px "Jal","Black Han Sans","Jua",sans-serif`;x.font=font;const w=Math.ceil(x.measureText(ch).width)+d.sw*2+6,h=Math.ceil(d.size*1.3)+d.sw*2;c.width=w;c.height=h;
  x.font=font;x.textBaseline='middle';x.textAlign='center';x.lineJoin='round';const cx=w/2,cy=h/2+1;
  x.lineWidth=d.sw+3;x.strokeStyle='rgba(0,0,0,.5)';x.strokeText(ch,cx,cy+3);
  x.lineWidth=d.sw;x.strokeStyle=d.st;x.strokeText(ch,cx,cy);
  x.lineWidth=2;x.strokeStyle='rgba(255,255,255,.25)';x.strokeText(ch,cx,cy);
  const g=x.createLinearGradient(0,cy-d.size*.5,0,cy+d.size*.5);d.fill.forEach((c2,i)=>g.addColorStop(i/(d.fill.length-1),c2));x.fillStyle=g;x.fillText(ch,cx,cy);
  x.save();x.beginPath();x.rect(0,0,w,cy-d.size*.12);x.clip();x.fillStyle='rgba(255,255,255,.32)';x.fillText(ch,cx,cy);x.restore();
  return GLY[key]={c,w,h,ov:d.sw*2+4}}
if(document.fonts)document.fonts.addEventListener&&document.fonts.addEventListener('loadingdone',()=>{GLY={}});
const EMB=(()=>{const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.translate(48,48);
  const spike=(r1,r2,n,col)=>{x.beginPath();for(let i=0;i<n*2;i++){const a=i*Math.PI/n+.2,r=i%2?r2:r1;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}x.closePath();x.fillStyle=col;x.fill()};
  spike(46,24,10,'#2e0000');spike(41,21,10,'#e8201c');spike(30,16,10,'#ff9a2a');spike(18,10,10,'#fff3c0');return c})();
let DMG=[];const STK=new Map();
function num(x,y,v,kind,tg){const now=performance.now()/1000;let stack=0;
  if(tg){const s=STK.get(tg);if(s&&now-s.t<.55)stack=Math.min(s.c+1,5);STK.set(tg,{t:now,c:stack})}
  DMG.push({x:x*K,y:y*K,str:(kind==='hurt'?'-':'')+fmt(v),kind,t:0,stack,jit:rnd(-6,6)});if(DMG.length>70)DMG.shift()}
function dmgRender(dt){DMG=DMG.filter(n=>(n.t+=dt)<1.15);
  DMG.forEach(n=>{const d=DSTY[n.kind],gl=[...n.str].map(ch=>glyph(ch,n.kind));const total=gl.reduce((a,g)=>a+g.w-g.ov,0)+gl[0].ov;
    const base=n.y-n.stack*d.size*.9-(n.t>.6?(n.t-.6)/.55*34:0),a=n.t>.78?Math.max(0,1-(n.t-.78)/.37):1;
    X.save();X.globalAlpha=a;let gx=n.x+n.jit-total/2;
    if(n.kind==='crit'){const u=n.t,s=u<.1?.4+u*9:1.3-Math.min(.3,(u-.1)*.6);X.save();X.translate(gx+gl[0].w*.45,base);X.rotate(u*2);X.scale(s*.62,s*.62);X.drawImage(EMB,-48,-48);X.restore()}
    if(n.t<.07){X.globalCompositeOperation='lighter';const g=X.createRadialGradient(n.x,base,0,n.x,base,d.size*1.4);g.addColorStop(0,'rgba(255,255,220,.9)');g.addColorStop(1,'rgba(255,200,80,0)');X.fillStyle=g;X.beginPath();X.arc(n.x,base,d.size*1.4,0,7);X.fill();X.globalCompositeOperation='source-over'}
    gl.forEach((g,i)=>{const u=n.t-i*.035;if(u<0){gx+=g.w-g.ov;return}const sc=u<.07?2.1-u/.07*1.3:u<.13?.8+(u-.07)/.06*.2:1,jy=u<.07?-(1-u/.07)*10:0;
      X.save();X.translate(gx+g.w/2,base+jy);X.scale(sc,sc);X.drawImage(g.c,-g.w/2,-g.h/2);X.restore();gx+=g.w-g.ov});
    X.restore()})}

/* ================= mob death: fly + spin + blink, then poof ================= */
function deathStart(m){m.dvx=m.boss?14:55+rnd(0,45)+(m.kb||0)*.3;m.dvy=m.boss?-30:-150;m.dy=0;m.rot=0;m.spin=m.boss?1.2:rnd(9,15)*(Math.random()<.5?-1:1);m.poof=false;m.life=m.boss?1.3:.42}
function poof(m){const F=m.fr,cy=GY-F.ay*.5+m.dy-m.air,n=m.boss?26:11;
  for(let i=0;i<n;i++){const a=rnd(0,Math.PI*2),v=rnd(10,m.boss?70:40);px.push({x:m.x+Math.cos(a)*4,y:cy+Math.sin(a)*4,vx:Math.cos(a)*v,vy:Math.sin(a)*v-10,g:-8,life:rnd(.35,.6),t:0,c:'#efeaf6',s:1,smoke:1,r0:rnd(1.5,m.boss?4.5:3)})}
  debris(m.x,cy,m.boss?30:14,MOBCOL[m.type],m.boss?180:110);
  fx.push({k:'star',x:m.x*K,y:cy*K,t:0,life:.2,big:m.boss,col:'#ffffff'});fx.push({k:'ring',x:m.x*K,y:cy*K,t:0,life:.28,r:m.boss?160:70,col:'#ffffff'});
  sfx('pop');if(m.boss){shake=18;flash=.5;flashC='#fff';sfx('boom')}}
function deathSim(m,dt,ws){m.dt+=dt;if(m.poof)return;m.x+=m.dvx*dt-ws*dt;m.dvy+=520*dt;m.dy+=m.dvy*dt;if(m.dy>0){m.dy=0;m.dvy*=-.35}m.rot+=m.spin*dt;
  if(m.boss&&Math.random()<dt*14){impact(m.x+rnd(-20,20)*m.s,GY-rnd(8,40)*m.s,'#ff9a3a',Math.random()<.3);shake=Math.max(shake,7);sfx('hit')}
  if(m.dt>=m.life){m.poof=true;poof(m)}}
function deathRender(m){if(m.poof)return;const F=m.fr,img=Math.floor(m.dt/.05)%2?whiteOf(F.fr[0]):F.fr[0];
  L.save();L.globalAlpha=m.dt>m.life-.12?Math.max(0,(m.life-m.dt)/.12):1;L.translate(Math.round(m.x),Math.round(GY-F.ay*.5+m.dy-m.air));L.rotate(m.rot);L.drawImage(img,-F.ax,-Math.round(F.ay*.5));L.restore()}

/* ================= pixel UI frames (9-slice) ================= */
function frameURL(base,hi,lo,out){const c=document.createElement('canvas');c.width=c.height=12;const x=c.getContext('2d');
  const p=(col,x0,y0,w,h)=>{x.fillStyle=col;x.fillRect(x0,y0,w,h)};
  p(out,1,0,10,1);p(out,1,11,10,1);p(out,0,1,1,10);p(out,11,1,1,10);p(base,1,1,10,10);
  p(hi,2,1,8,1);p(hi,1,2,1,8);p(lo,2,10,8,1);p(lo,10,2,1,8);p(hi,2,2,1,1);p(lo,9,9,1,1);return c.toDataURL()}
function iconURL(prims,n){const r=raster(prims,24,24);return r.toDataURL()}
(function(){const R0=document.documentElement.style,F=(n,b,h,l,o)=>R0.setProperty('--f-'+n,`url(${frameURL(b,h,l,o||'#0d0816')})`);
  F('navy','#1c1630','#3a3060','#110c1e');F('deep','#141026','#2a2248','#0a0716');F('cream','#fff6e4','#ffffff','#e2cfaa','#2a1e18');
  F('green','#6cd04a','#b4f28a','#3e8e2a');F('gold','#ffc43d','#fff0a0','#c78a10');F('red','#e8404e','#ff9aa2','#9a1426');
  F('blue','#4aa8ff','#b8e2ff','#2266c0');F('grey','#cdc4b6','#ece6dc','#9a907e','#3a3028');F('sel','#fff6e4','#ffffff','#e2cfaa','#ffc43d');
  R0.setProperty('--ic-coin',`url(${iconURL([E(12,12,8,8,'gold',1),E(12,12,3.5,5,null,2,{col:hex('#b07000')}),E(9.5,9,1.6,2,null,2.1,{col:hex('#fff6c0')})])})`);
  R0.setProperty('--ic-gem',`url(${iconURL([Pg([[12,3],[21,10],[12,21],[3,10]],'scarf',1),Pg([[12,3],[16,10],[12,21],[8,10]],'ice',1.1,{noline:1})])})`);
})();

/* backgrounds: original layers kept (richer version reverted) */
function drawFront(){}
function bgOverlay(){}
</script>
