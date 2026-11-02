<script>
/* ================= cartoon (sticker) icons: thick outline + soft gradient ================= */
const OLC='#140c0a';
function rgb(c){return`rgb(${c[0]},${c[1]},${c[2]})`}
function vecDraw(c,P,s){const ps=P.slice().sort((a,b)=>a.z-b.z||0);c.lineJoin='round';c.lineCap='round';
  const path=p=>{c.beginPath();if(p.k==='e')c.ellipse(p.x*s,p.y*s,p.rx*s,p.ry*s,p.a||0,0,Math.PI*2);else{p.pts.forEach(([x,y],i)=>i?c.lineTo(x*s,y*s):c.moveTo(x*s,y*s));c.closePath()}};
  const OL=2.6*s/4;
  ps.forEach(p=>{if(p.col&&p.noline)return;c.strokeStyle=OLC;if(p.k==='c'){c.lineWidth=(p.r1+p.r2)*s+OL*2;c.beginPath();c.moveTo(p.x1*s,p.y1*s);c.lineTo(p.x2*s,p.y2*s);c.stroke()}else{path(p);c.lineWidth=OL*2;c.stroke()}});
  ps.forEach(p=>{let top,bot;if(p.col){top=bot=rgb(p.col)}else{const r=RAMP[p.ramp];top=rgb(r[r.length-1]);bot=rgb(r[Math.max(0,r.length-3)])}
    let y0,y1;if(p.k==='e'){y0=(p.y-p.ry)*s;y1=(p.y+p.ry)*s}else if(p.k==='c'){y0=(Math.min(p.y1,p.y2)-p.r1)*s;y1=(Math.max(p.y1,p.y2)+p.r2)*s}else{const ys=p.pts.map(q=>q[1]);y0=Math.min(...ys)*s;y1=Math.max(...ys)*s}
    const g=c.createLinearGradient(0,y0,0,y1+.01);g.addColorStop(0,top);g.addColorStop(1,bot);
    if(p.k==='c'){c.strokeStyle=g;c.lineWidth=(p.r1+p.r2)*s;c.beginPath();c.moveTo(p.x1*s,p.y1*s);c.lineTo(p.x2*s,p.y2*s);c.stroke()}
    else{path(p);c.fillStyle=g;c.fill()}
    if(!p.col&&p.k==='e'&&p.rx>3.5){c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.ellipse((p.x-p.rx*.35)*s,(p.y-p.ry*.45)*s,p.rx*.32*s,p.ry*.2*s,-.5,0,Math.PI*2);c.fill()}})}
function vecCanvas(P,size){const c=document.createElement('canvas');c.width=c.height=size;const x=c.getContext('2d');x.translate(size*.04,size*.04);vecDraw(x,P,size/24*.92);
  const o=document.createElement('canvas');o.width=o.height=size;const y=o.getContext('2d');y.shadowColor='rgba(20,10,30,.35)';y.shadowOffsetY=size*.03;y.drawImage(c,0,0);
  y.shadowColor='transparent';y.globalCompositeOperation='source-atop';const g=y.createLinearGradient(0,0,size,size);g.addColorStop(0,'rgba(255,255,255,.28)');g.addColorStop(.45,'rgba(255,255,255,0)');y.fillStyle=g;y.fillRect(0,0,size,size);return o}
function vecInto(cv,P){cv.width=cv.height=96;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,96,96);x.drawImage(vecCanvas(P,96),0,0)}
function icon(cv,k,arg){vecInto(cv,iconPrims(k,arg))}
function itemIcon(cv,id){vecInto(cv,itemPrims(id))}
(function(){const R0=document.documentElement.style;
  R0.setProperty('--ic-coin',`url(${vecCanvas([E(12,12,8.5,8.5,'gold',1),E(12,12,4,5.5,null,2,{col:hex('#c88a10')})],64).toDataURL()})`);
  R0.setProperty('--ic-gem',`url(${vecCanvas([Pg([[12,2.5],[21.5,10],[12,21.5],[2.5,10]],'scarf',1),Pg([[12,2.5],[16,10],[12,21.5],[8,10]],'ice',1.1)],64).toDataURL()})`);
  document.querySelectorAll('#nav button').forEach(b=>{const n=NAV.find(q=>q[0]===b.dataset.t);if(!n)return;const cv2=b.querySelector('canvas');vecInto(cv2,navIcon(n[2]))});
})();

/* ================= damage numbers: rounded bold + thick outline ================= */
Object.assign(DSTY.norm,{size:30,fill:['#ffffff','#fff4c0'],st:'#1e120c',sw:7});
Object.assign(DSTY.crit,{size:40,fill:['#fff4a8','#ffb424','#ff6a10'],st:'#3a0800',sw:8});
Object.assign(DSTY.hurt,{size:24,fill:['#ffe0e0','#ff5a6a'],st:'#2a0010',sw:6});
GLY={};
function glyph(ch,sty){const key=sty+ch;if(GLY[key])return GLY[key];const d=DSTY[sty];const c=document.createElement('canvas'),x=c.getContext('2d');
  const font=`${d.size}px "Jal","Fredoka","Jua",sans-serif`;x.font=font;const w=Math.ceil(x.measureText(ch).width)+d.sw*2+6,h=Math.ceil(d.size*1.3)+d.sw*2;c.width=w;c.height=h;
  x.font=font;x.textBaseline='middle';x.textAlign='center';x.lineJoin='round';const cx=w/2,cy=h/2;
  x.lineWidth=d.sw;x.strokeStyle='rgba(0,0,0,.45)';x.strokeText(ch,cx,cy+3);
  x.strokeStyle=d.st;x.strokeText(ch,cx,cy);
  const g=x.createLinearGradient(0,cy-d.size*.45,0,cy+d.size*.45);d.fill.forEach((c2,i)=>g.addColorStop(i/Math.max(1,d.fill.length-1),c2));x.fillStyle=g;x.fillText(ch,cx,cy);
  return GLY[key]={c,w,h,ov:d.sw*2+3}}
function num(x,y,v,kind,tg){const now=performance.now()/1000;let stack=0;
  if(tg){const s=STK.get(tg);if(s&&now-s.t<.55)stack=Math.min(s.c+1,5);STK.set(tg,{t:now,c:stack})}
  const ok=!!(tg&&tg!==bear&&tg.hp!=null&&tg.hp>0&&v>tg.hp*1.6&&kind!=='hurt');
  DMG.push({x:x*K,y:y*K,str:(kind==='hurt'?'-':'')+fmt(v),kind,t:0,stack,jit:rnd(-6,6),ok});if(DMG.length>70)DMG.shift()}
let OKC=null;
function okLabel(){if(OKC)return OKC;const c=document.createElement('canvas');const x=c.getContext('2d');const f='17px "Jal","Fredoka","Jua",sans-serif';x.font=f;const w=Math.ceil(x.measureText('OVERKILL!').width)+14;c.width=w;c.height=30;
  x.font=f;x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';x.lineWidth=6;x.strokeStyle='#0e2a06';x.strokeText('OVERKILL!',w/2,15);x.fillStyle='#8cf04a';x.fillText('OVERKILL!',w/2,15);return OKC=c}
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',()=>{GLY={};OKC=null});
function dmgRender(dt){DMG=DMG.filter(n=>(n.t+=dt)<1.1);
  DMG.forEach(n=>{const d=DSTY[n.kind],gl=[...n.str].map(ch=>glyph(ch,n.kind));const total=gl.reduce((a,g)=>a+g.w-g.ov,0)+gl[0].ov;
    const base=n.y-n.stack*d.size*.88-(n.t>.55?(n.t-.55)/.55*30:0),a=n.t>.75?Math.max(0,1-(n.t-.75)/.35):1;
    X.save();X.globalAlpha=a;let gx=n.x+n.jit-total/2;
    gl.forEach((g,i)=>{const u=n.t-i*.03;if(u<0){gx+=g.w-g.ov;return}const sc=u<.07?1.9-u/.07*1.1:u<.13?.8+(u-.07)/.06*.2:1,jy=u<.07?-(1-u/.07)*8:0;
      X.save();X.translate(gx+g.w/2,base+jy);X.scale(sc,sc);X.drawImage(g.c,-g.w/2,-g.h/2);X.restore();gx+=g.w-g.ov});
    if(n.ok){const o=okLabel(),u=n.t,sc=u<.08?1.6-u/.08*.6:1;X.save();X.translate(n.x+n.jit,base-d.size*.75);X.scale(sc,sc);X.drawImage(o,-o.width/2,-15);X.restore()}
    X.restore()})}
</script>
