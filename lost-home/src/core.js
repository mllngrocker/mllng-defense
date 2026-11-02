<script>
"use strict";
/* ---------- pixel rasterizer: shapes -> lit, outlined pixel sprite ---------- */
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const RAMP={};const R=(n,a)=>RAMP[n]=a.map(hex);
R('fur',['#77705f','#aaa28b','#d6ceb5','#f4efdf']);
R('furD',['#655e4f','#90886f','#b8af97','#d2cab2']);
R('snout',['#bdb59c','#ddd5bf','#efe9d8']);
R('scarf',['#173a80','#2459bd','#3d85ea','#7fb8ff']);
R('plank',['#5e3213','#8f5321','#c47b38','#e6a75f']);
R('plank1',['#3e220e','#6b3d18','#9c5c26','#c9894a']);
R('plank2',['#0f4a63','#1f7fa3','#46bde0','#a6ecff']);
R('plank3',['#2d3240','#535a6e','#8b93a8','#d0d6e2']);
R('plank4',['#6a3a00','#b07000','#f0b020','#fff0a0']);
let WRAMP='plank';
R('skin',['#140d1c','#251836','#3a2752','#56396f','#74508f']);
R('skinD',['#0f0a16','#1c1229','#2c1d40','#3f2a57']);
R('wing',['#16060c','#2e0b18','#4d1426','#6e2035','#8d2d45']);
R('horn',['#2e241a','#5b4a36','#93805f','#cbb894','#ece0c2']);
R('staff',['#120d10','#2b2125','#4a3a3c','#6b5856']);
R('orb',['#3a0d66','#7a2fc4','#b77bff','#e7d2ff']);
R('slime',['#2b1550','#4c2a86','#7449b8','#a07be0','#c9b0ff']);
R('ground',['#1a1220','#2a1d33','#3b2a45','#4f3a58']);
const OUTC=hex('#150f1e');
const LV=(()=>{const v=[-.52,-.68,.52],l=Math.hypot(...v);return v.map(x=>x/l)})();

function prim_bbox(p){
  if(p.k==='e'){const r=Math.max(p.rx,p.ry);return[p.x-r,p.y-r,p.x+r,p.y+r]}
  if(p.k==='c'){const r=Math.max(p.r1,p.r2);return[Math.min(p.x1,p.x2)-r,Math.min(p.y1,p.y2)-r,Math.max(p.x1,p.x2)+r,Math.max(p.y1,p.y2)+r]}
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;p.pts.forEach(([x,y])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)});p.bb=[x0,y0,x1,y1];return p.bb;
}
function inPoly(pts,x,y){let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const[xi,yi]=pts[i],[xj,yj]=pts[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c}
function lit(nx,ny,nz){return nx*LV[0]+ny*LV[1]+nz*LV[2]}
function shade(p,x,y){
  if(p.k==='e'){const dx=x-p.x,dy=y-p.y,c=Math.cos(p.a||0),s=Math.sin(p.a||0);const u=(dx*c+dy*s)/p.rx,v=(-dx*s+dy*c)/p.ry;const d2=u*u+v*v;if(d2>1)return null;
    const nz=Math.sqrt(1-d2);return lit(u*c-v*s,u*s+v*c,nz)}
  if(p.k==='c'){const ax=p.x2-p.x1,ay=p.y2-p.y1,L2=ax*ax+ay*ay||1;let t=((x-p.x1)*ax+(y-p.y1)*ay)/L2;t=t<0?0:t>1?1:t;
    const qx=p.x1+ax*t,qy=p.y1+ay*t,r=p.r1+(p.r2-p.r1)*t;const dx=x-qx,dy=y-qy,d=Math.hypot(dx,dy);if(d>r)return null;
    const nx=dx/r,ny=dy/r;return lit(nx,ny,Math.sqrt(Math.max(0,1-nx*nx-ny*ny)))}
  if(!inPoly(p.pts,x,y))return null;const[x0,y0,x1,y1]=p.bb;
  return -(((x-(x0+x1)/2)/((x1-x0)/2||1))*.35+((y-(y0+y1)/2)/((y1-y0)/2||1))*.55)*.9+.25;
}
const RFAM={fur:'f',furD:'f',snout:'f'};
function raster(prims,w,h){
  const N=w*h,C=new Uint8ClampedArray(N*4),Z=new Float32Array(N).fill(-1e9),G=new Int32Array(N).fill(-1),P=new Int32Array(N).fill(-1);
  prims.forEach((p,i)=>{p.i=i;if(p.g==null)p.g=1000+i});
  const ord=prims.slice().sort((a,b)=>a.z-b.z||a.i-b.i);
  for(const p of ord){
    const[bx0,by0,bx1,by1]=prim_bbox(p);const ramp=p.ramp?RAMP[p.ramp]:null;
    for(let y=Math.max(0,Math.floor(by0));y<=Math.min(h-1,Math.ceil(by1));y++)for(let x=Math.max(0,Math.floor(bx0));x<=Math.min(w-1,Math.ceil(bx1));x++){
      const s=shade(p,x+.5,y+.5);if(s==null)continue;const k=y*w+x;let col;
      if(p.col)col=p.col;else{const n=ramp.length;let f=(s*.5+.5)*n+(p.bias||0);col=ramp[Math.max(0,Math.min(n-1,Math.floor(f)))]}
      C[k*4]=col[0];C[k*4+1]=col[1];C[k*4+2]=col[2];C[k*4+3]=255;Z[k]=p.z;G[k]=p.g;P[k]=p.i;
    }
  }
  const O=new Uint8ClampedArray(C);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=y*w+x;
    const nb=[x>0?k-1:-1,x<w-1?k+1:-1,y>0?k-w:-1,y<h-1?k+w:-1];
    if(C[k*4+3]===0){if(nb.some(q=>q>=0&&C[q*4+3]&&!prims[P[q]].noout)){O[k*4]=OUTC[0];O[k*4+1]=OUTC[1];O[k*4+2]=OUTC[2];O[k*4+3]=255}continue}
    const me=prims[P[k]];if(me.noline||me.col)continue;if(me.jr&&Math.hypot(x+.5-me.jx,y+.5-me.jy)<me.jr)continue;
    let hit=-1;for(const q of nb){if(q>=0&&C[q*4+3]&&G[q]!==G[k]&&Z[q]<Z[k]-.01&&!prims[P[q]].col){hit=q;break}}
    if(hit>=0){const rq=prims[P[hit]].ramp,same=rq===me.ramp||(RFAM[rq]&&RFAM[rq]===RFAM[me.ramp]);const rr=RAMP[me.ramp];const d=same?rr[Math.min(1,rr.length-1)]:rr[0];O[k*4]=d[0];O[k*4+1]=d[1];O[k*4+2]=d[2]}
  }
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.getContext('2d').putImageData(new ImageData(O,w,h),0,0);return cv;
}
const E=(x,y,rx,ry,ramp,z,o)=>Object.assign({k:'e',x,y,rx,ry,a:0,ramp,z},o||{});
const Cp=(a,b,r1,r2,ramp,z,o)=>Object.assign({k:'c',x1:a.x,y1:a.y,x2:b.x,y2:b.y,r1,r2,ramp,z},o||{});
const Pg=(pts,ramp,z,o)=>Object.assign({k:'p',pts,ramp,z},o||{});
const DEG=Math.PI/180;
const dirp=(deg,len,o)=>({x:o.x+Math.sin(deg*DEG)*len,y:o.y+Math.cos(deg*DEG)*len});

/* ---------- 북실이 model (side view, facing right) ---------- */
const BW=84,BH=104,BG=98,BAX=34;
const BLACK=hex('#140f1a'),WHITE=hex('#ffffff'),PINK=hex('#e59bb2');
R('cyber',['#232836','#465066','#7f8aa3','#c9d1e2']);
R('umb',['#0c0c14','#20202e','#383850','#565676']);
R('ice',['#22609e','#4f9ee0','#a2dcff','#ffffff']);
R('rainbow',['#6a22c8','#ff3a8a','#ffb43a','#8af06a']);
R('gunm',['#121218','#262632','#44445a','#74748e']);
R('gunb',['#0e468a','#2a78d6','#6ab6ff','#c6eaff']);
R('bookP',['#260c36','#461864','#7438a4','#a46ad6']);
R('bookB',['#0e2848','#1a4878','#3a78b6','#7ab6e6']);
R('bookG',['#241600','#523600','#a07418','#ecce5c']);
R('bookR',['#26140a','#462a12','#784822','#a46e40']);
R('swim',['#86103e','#ce2a68','#ff5a98','#ffb0d0']);
R('weed',['#0c3618','#185628','#2c8638','#58c058']);
R('ghil',['#26360f','#465a1c','#6a822c','#96ae48']);
R('pir',['#08080e','#181824','#2c2c3e','#48485e']);
let GEAR={w:{kind:'blunt',ramp:'plank',len:25,r:2.6},sp:-1,nr:-1,sande:false,cos:'none'};
function headPrims(P,T,u,head,z,ramp){const v={x:-u.y,y:u.x},pt=(a,b)=>[T.x+u.x*a+v.x*b,T.y+u.y*a+v.y*b],A=Math.atan2(u.y,u.x);
  if(head==='pan'){const c=pt(5,0);P.push(E(c[0],c[1],5.6,5.2,'gunm',z+.1))}
  else if(head==='axe')P.push(Pg([pt(-3,0),pt(3,0),pt(5,7),pt(-5,7)],'metal',z+.1));
  else if(head==='hammer')P.push(Pg([pt(-3,-6),pt(3,-6),pt(3,6),pt(-3,6)],'gunm',z+.1));
  else if(head==='toy'){P.push(Pg([pt(-3,-5),pt(3,-5),pt(3,5),pt(-3,5)],'can',z+.1));P.push(Pg([pt(-3,-1),pt(3,-1),pt(3,1),pt(-3,1)],'gold',z+.11))}
  else if(head==='shovel')P.push(Pg([pt(0,0),pt(3,4),pt(10,0),pt(3,-4)],'metal',z+.1));
  else if(head==='mop'){const c=pt(3,0);P.push(E(c[0],c[1],3.5,6,'furD',z+.1,{a:A}))}
  else if(head==='hook')P.push(Pg([pt(-1,-1),pt(4,-1),pt(5,4),pt(3,5),pt(2,1),pt(-1,1)],'can',z+.1));
  else if(head==='blade')P.push(Pg([pt(-2,-1),pt(2,-1),pt(4,6),pt(-2,6)],'umb',z+.1));
  else if(head==='fish'){const c=pt(9,0);P.push(E(c[0],c[1],10,4,'fishr',z+.1,{a:A}));P.push(Pg([pt(19,0),pt(23,-4),pt(23,4)],'fishr',z+.09));const e=pt(15,-1.5);P.push(E(e[0],e[1],.9,.9,null,z+.12,{col:hex('#140f1a')}))}
}
function wpnDraw(P,paw,ang,z,back,at){
  const w=GEAR.w,k=w.kind;
  if(back){if(k==='blunt'){const a=at(-3,-9),b=at(25,-14);P.push(Cp(a,b,w.r,w.r+.2,w.ramp,6.2))}
    else if(k==='gun'){P.push(Cp(at(4,-10),at(w.big?22:16,-12),w.big?2.8:2.2,w.big?2.8:2.2,w.ramp,6.2))}
    else if(k==='book'){const c=at(12,-12);P.push(Pg([[c.x-4,c.y-3],[c.x+4,c.y-3],[c.x+4,c.y+3],[c.x-4,c.y+3]],w.ramp,6.2))}
    return null}
  if(k==='blunt'){const a=dirp(ang+180,3,paw),b=dirp(ang,w.len,paw);P.push(Cp(a,b,w.r,w.r+(w.taper?.9:.2),w.ramp,z));if(w.head){const u={x:Math.sin(ang*DEG),y:Math.cos(ang*DEG)};headPrims(P,b,u,w.head,z,w.ramp);return dirp(ang,w.len+8,paw)}return b}
  if(k==='gun'){const L=w.big?17:10,r=w.big?2.8:2.2;const a=dirp(ang,-3,paw),b=dirp(ang,L,paw);P.push(Cp(a,b,r,r,w.ramp,9.5));
    const g0=dirp(ang,1,paw);P.push(Cp(g0,dirp(ang-90,4.5,g0),1.5,1.3,'gunm',9.4));
    if(w.big){const dm=dirp(ang-90,3.5,dirp(ang,6,paw));P.push(E(dm.x,dm.y,3.4,3.4,'gunm',9.45));const e=dirp(ang,L+7,paw);P.push(Cp(b,e,1.2,1.2,'gunm',9.5));return e}
    return b}
  if(k==='star'&&(w.pebble||w.balloon)){const c=dirp(ang,3,paw);P.push(E(c.x,c.y,w.balloon?3.6:2.6,w.balloon?3.8:2.2,w.balloon?'gunb':'metal',9.6));return c}
  if(k==='star'){const c=dirp(ang,3,paw),pts=[];for(let i=0;i<8;i++){const a2=i*Math.PI/4+.3,rr=i%2?1.2:3.6;pts.push([c.x+Math.cos(a2)*rr,c.y+Math.sin(a2)*rr])}P.push(Pg(pts,'metal',9.6));return c}
  if(k==='book'){const c=dirp(ang,4,paw);P.push(Pg([[c.x-5,c.y-4],[c.x+5,c.y-4],[c.x+5,c.y+4],[c.x-5,c.y+4]],w.ramp,9.6));P.push(Cp({x:c.x-3.5,y:c.y-1},{x:c.x+3.5,y:c.y-1},.6,.6,null,9.7,{col:hex('#fff4d8')}));P.push(Cp({x:c.x,y:c.y-3.5},{x:c.x,y:c.y+3.5},.5,.5,null,9.7,{col:hex('#2a1a10')}));return c}
}
function bearPrims(p){
  const P=[],HS=1.05,Ph=q=>{if(q.k==='e'){q.rx*=HS;q.ry*=HS}else if(q.k==='c'){q.r1*=HS;q.r2*=HS}P.push(q)};const ba=p.ba*DEG;const d={x:Math.sin(ba),y:-Math.cos(ba)},n={x:Math.cos(ba),y:Math.sin(ba)};
  const at=(k,m)=>({x:p.hx+d.x*k+n.x*m,y:p.hy+d.y*k+n.y*m});
  const SP=GEAR.sp,NR=GEAR.nr,SV=GEAR.sande,COS=GEAR.cos;
  const C=at(12,0);
  P.push(E(C.x,C.y,14,11.5,'fur',5,{a:Math.atan2(d.y,d.x),g:1}));
  const bel=at(11,5);P.push(E(bel.x,bel.y,8,5,'fur',5.1,{a:Math.atan2(d.y,d.x),g:1,bias:.4,noline:1}));
  const lb0=at(4,1);lb0.x-=2;lb0.y-=1;const lf0=at(4,2.5);
  P.push(Cp(lb0,dirp(p.lb,11,lb0),5,3.9,'furD',2,{jx:lb0.x,jy:lb0.y,jr:6.5}));
  const lfe=dirp(p.lf,11,lf0);P.push(Cp(lf0,lfe,5.4,4.1,SP>=4?'cyber':'fur',8,{jx:lf0.x,jy:lf0.y,jr:7}));
  {const pd=dirp(p.lf,13.5,lf0);P.push(E(pd.x+1,pd.y,2.4,1.1,null,8.3,{col:hex('#2a2620')}))}
  [[3,-9,7,-10.5],[10,-10.5,14,-11.5],[2,7,6,9.5],[16,8.5,19,7.5]].forEach(([a1,b1,a2,b2])=>P.push(Cp(at(a1,b1),at(a2,b2),.5,.5,null,5.2,{col:hex('#b3aa92'),noline:1})));
  if(SP>=0)[5,11,17].forEach(k=>{const c=at(k,-11.6);P.push(E(c.x,c.y,1.9,1.5,SV?null:'cyber',6.25,SV?{col:hex('#5fffc0')}:{}))});
  if(SP>=3){const kn=dirp(p.lf,5.5,lf0);P.push(E(kn.x,kn.y,2.6,2.2,'cyber',8.2))}
  const up=p.ba<45;const S=up?at(16,4.5):at(20,3),ab0={x:S.x-2.5,y:S.y-1};const AL=up?10:12;
  P.push(Cp(ab0,dirp(p.ab,AL,ab0),4.6,3.6,'furD',2,{jx:ab0.x,jy:ab0.y,jr:6}));
  const paw=dirp(p.af,AL,S);if(!up){const pd=dirp(p.af,AL+3.5,S);P.push(E(pd.x+1,pd.y,2.3,1.1,null,9.2,{col:hex('#2a2620')}))}P.push(Cp(S,paw,5,3.9,SV||NR>=4?'cyber':'fur',9,{jx:S.x,jy:S.y,jr:6.5}));
  if(SV||NR>=4){const j=dirp(p.af,AL*.5,S);P.push(E(j.x,j.y,1.6,1.6,null,9.05,{col:hex(SV?'#5fffc0':'#ff3040')}))}
  const tl=at(-1,-3);P.push(E(tl.x,tl.y,3.2,3.2,'fur',4));
  if(SV){P.push(Cp(at(3,-7),at(21,-8),.6,.6,null,5.3,{col:hex('#5fffc0'),noline:1}));P.push(Cp(at(8,-8),at(8,2),.6,.6,null,5.3,{col:hex('#5fffc0'),noline:1}));P.push(Cp(at(15,-8),at(15,3),.6,.6,null,5.3,{col:hex('#5fffc0'),noline:1}))}
  const N=at(25,0);const q=Math.max(0,Math.min(1,p.ba/90));const hc={x:N.x+d.x*(6+q*1)+2+q*1+(p.hox||0),y:N.y+d.y*(6+q*1)-3-q*4+(p.hoy||0)};
  const ha=(p.ha||0)*DEG,ca=Math.cos(ha),sa=Math.sin(ha);const hr=(x,y)=>({x:hc.x+(x*ca-y*sa)*HS,y:hc.y+(x*sa+y*ca)*HS});
  const e1=hr(-5,-8),e2=hr(2.5,-9.2);
  Ph(E(e2.x,e2.y,3.1,3.1,'furD',6.5,{g:7}));Ph(E(e1.x,e1.y,3.1,3.1,'fur',7.6,{g:7}));
  Ph(E(e1.x+.3,e1.y+.6,1.1,1.1,null,7.65,{col:hex('#4a4438'),noline:1}));
  if(NR>=2)Ph(Cp(e2,{x:e2.x+1,y:e2.y-7},.7,.5,null,6.4,{col:hex('#8b93a8')}));
  Ph(E(hc.x,hc.y-1.5,10.5,10,'fur',7.5,{g:7}));
  const sn=hr(9,3.4);Ph(E(sn.x,sn.y,6.6,4.3,'snout',7.7,{a:ha}));
  const no=hr(14.4,1.6);Ph(E(no.x,no.y,1.6,1.3,null,7.8,{col:BLACK,a:ha}));
  const ey=hr(5.2,-2.2);
  if(SV||NR>=4){Ph(E(ey.x,ey.y,1.7,1.2,null,7.8,{col:hex(SV?'#3fffb0':'#ff2438'),a:ha}));Ph(E(ey.x+.3,ey.y-.2,.6,.5,null,7.81,{col:hex('#ffe0e0')}))}
  else Ph(E(ey.x,ey.y,1.25,.85,null,7.8,{col:BLACK,a:ha}));
  const b1=hr(3.2,-3.9),b2=hr(7.6,-3.6);Ph(Cp(b1,b2,.55,.55,null,7.79,{col:hex('#9fb0c9')}));
  const m1=hr(9.5,7.2),m2=hr(12.5,7);Ph(Cp(m1,m2,.5,.5,null,7.8,{col:hex('#5b6a84')}));
  if(GEAR.scarf&&COS!=='ghillie'){const s1=at(22.5,-8),s2=at(22.5,8.5);P.push(Cp(s1,s2,2.9,2.9,'scarf',6,{g:6}));
    const fl=p.fl||0,t0=at(22,-7);P.push(Cp(t0,{x:t0.x-10,y:t0.y+3+fl},2.2,1.8,'scarf',4.5,{g:6}));P.push(Cp(t0,{x:t0.x-8,y:t0.y+7-fl},2,1.6,'scarf',4.4,{g:6}))}
  if(COS==='swim'){const A=Math.atan2(n.y,n.x),c=at(5,0);P.push(E(c.x,c.y,14,4.6,'gold',5.7,{a:A,g:30}));P.push(E(c.x,c.y,9.5,1.8,null,5.71,{a:A,col:hex('#f0b020'),noline:1}));
    const dh=at(5,15.5);P.push(E(dh.x,dh.y,3.4,3.2,'gold',5.75,{g:30}));P.push(Pg([[dh.x+2.5,dh.y-.5],[dh.x+6,dh.y],[dh.x+2.5,dh.y+1.5]],null,5.76,{col:hex('#ff8a1a')}));P.push(E(dh.x+.8,dh.y-1,.6,.6,null,5.77,{col:BLACK}));
    Ph(Cp(hr(-9,-4.5),hr(4,-6.5),.9,.9,null,7.9,{col:hex('#2a6fd8')}));const gl=hr(4.5,-6.2);Ph(E(gl.x,gl.y,2.3,1.9,null,7.92,{col:hex('#8fe0ff')}));Ph(E(gl.x-.6,gl.y-.6,.6,.5,null,7.93,{col:WHITE}))}
  if(COS==='seaweed'){const fl=p.fl||0;Ph(Cp(hr(-10.5,-3),hr(8,-5.6),1.25,1.25,'weed',7.95,{g:31}));const kn=hr(-10.5,-3);Ph(E(kn.x,kn.y,1.8,1.6,'weed',7.96,{g:31}));
    [[0,1.3],[1,1]].forEach(([w,r])=>{let a=kn;for(let q=0;q<4;q++){const b={x:a.x-5.5,y:a.y+1.2+w*2+Math.sin(fl+q*1.3+w)*1.6};P.push(Cp(a,b,r*(1-q*.18),r*(1-(q+1)*.18),'weed',4.6-q*.01,{g:31}));a=b}});
    const cp=[at(23,-6.5),at(23,-12),at(12,-15.5+fl*.3),at(2,-15+fl*.5),at(-3,-12),at(1,-10),at(-2,-8),at(4,-9),at(12,-9)];P.push(Pg(cp.map(q=>[q.x,q.y]),'weed',4.8,{g:33}));
    P.push(Cp(at(20,-11),at(6,-14),.45,.45,null,4.85,{col:hex('#8ad870'),noline:1}));P.push(Cp(at(16,-10.5),at(2,-13),.45,.45,null,4.85,{col:hex('#2c8638'),noline:1}))}
  if(COS==='ghillie'){let k=0;for(let i=0;i<6;i++)for(let j=0;j<4;j++){const u=-1+i*.42+(j%2)*.2,v=-.85+j*.55;if(u*u+v*v>1.15)continue;const c=at(12+u*13,v*10.5);P.push(E(c.x,c.y,3.8,2.6,'ghil',6.8+k*.001,{a:i*1.7+j,g:32}));k++}
    for(let i=0;i<9;i++){const ang=-Math.PI*.98+i/8*Math.PI*.85,rr=8+(i%2)*2.5,c=hr(Math.cos(ang)*rr-3,Math.sin(ang)*rr*.95);Ph(E(c.x,c.y,3.3,2.3,'ghil',7.95,{a:ang+i,g:32}))}}
  if(COS==='pirate'){Ph(Pg([[hr(-12,-5).x,hr(-12,-5).y],[hr(-7,-15).x,hr(-7,-15).y],[hr(4,-16).x,hr(4,-16).y],[hr(12,-7).x,hr(12,-7).y],[hr(1,-9).x,hr(1,-9).y]],'pir',8.1));
    const sk=hr(1,-12.5);Ph(E(sk.x,sk.y,1.4,1.2,null,8.2,{col:WHITE}));Ph(E(ey.x,ey.y,2.2,1.9,null,7.85,{col:BLACK,a:ha}));Ph(Cp(hr(1,-6),hr(10,-1),.45,.45,null,7.84,{col:BLACK}))}
  if(typeof COSDRAW!=='undefined'&&COSDRAW[COS])COSDRAW[COS]({P,Ph,at,hr,hc,d,n,p,ha,S,paw,lf0,lfe,ab0,lb0,lbe:dirp(p.lb,11,lb0)});
  const ang=p.af+(p.pa||0);p.tip=wpnDraw(P,paw,ang,p.pz!=null?p.pz:8.5,p.pl==='back',at);
  return P;
}

/* ---------- 마왕 model (front view) ---------- */
const LW=168,LH=140,LG=136,LAX=96;
function lordPrims(p){
  const P=[];const o=(x,y)=>({x:x+32+(p.dx||0),y:y+4+(p.dy||0)});
  const br=p.br||0,w=p.wing||0;
  [-1,1].forEach(s=>{const X=x=>64+s*(x-64);
    const sh=o(X(48),40-br),el=o(X(24),12-w*10),tip=o(X(4),28-w*14),f1=o(X(8),62-w*6),f2=o(X(20),70-w*4),f3=o(X(34),64-w*2),root=o(X(50),62);
    P.push(Pg([[sh.x,sh.y],[el.x,el.y],[tip.x,tip.y],[f1.x,f1.y],[(f1.x+f2.x)/2,(f1.y+f2.y)/2-6],[f2.x,f2.y],[(f2.x+f3.x)/2,(f2.y+f3.y)/2-5],[f3.x,f3.y],[root.x,root.y]],'wing',0,{g:50+s}));
    P.push(Cp(sh,el,2.6,2.2,'skinD',.5,{g:50+s}));P.push(Cp(el,tip,2.2,1.2,'skinD',.5,{g:50+s}));
    [f1,f2,f3].forEach(f=>P.push(Cp(el,f,1.4,.9,'skinD',.4,{g:50+s})));
    const cl=o(X(26),8-w*10);P.push(Pg([[el.x,el.y],[cl.x+s*0,cl.y-4],[el.x+s*3,el.y+1]],'horn',.6));
  });
  P.push(Pg([[o(48,74).x,o(48,74).y],[o(80,74).x,o(80,74).y],[o(86,110).x,o(86,110).y],[o(78,104).x,o(78,104).y],[o(72,114).x,o(72,114).y],[o(64,106).x,o(64,106).y],[o(56,115).x,o(56,115).y],[o(50,104).x,o(50,104).y],[o(42,110).x,o(42,110).y]].map(([x,y])=>[x,y]),'wing',3.5));
  [[54,50,92,48,122],[74,78,92,80,122]].forEach(([hx,kx,ky,fx,fy],i)=>{const s=i?1:-1;
    const hip=o(hx,78),kn=o(kx,ky),an=o(hx+s*-2,110),ft=o(fx,fy+(p.dy?0:0));
    P.push(Cp(hip,kn,7.5,6.2,'skin',3,{g:60+i}));P.push(Cp(kn,an,5.6,4.4,'skin',3.2,{g:60+i}));P.push(Cp(an,ft,4.6,3.6,'skin',3.4,{g:60+i}));
    [-3,0,3].forEach(c=>{const a=o(fx+c,fy+1),b=o(fx+c+s*1+(c)*.4,fy+5);P.push(Cp(a,b,1.3,.5,'horn',3.6))});
  });
  P.push(E(o(64,72).x,o(64,72).y,12.5,9.5,'skin',4,{g:70}));
  [[58,79],[64,82],[70,79]].forEach(([x,y])=>P.push(E(o(x,y).x,o(x,y).y,3,1.5,'skinD',4.2,{noline:1})));
  P.push(E(o(64,54).x,o(64,54-br).y,22,15.5,'skin',5,{g:70}));
  P.push(E(o(57,51).x,o(57,51-br).y,9,6.5,'skin',5.2,{g:70,bias:.3}));P.push(E(o(71,51).x,o(71,51-br).y,9,6.5,'skin',5.2,{g:70,bias:.3}));
  [[60,62],[68,62],[60,67],[68,67]].forEach(([x,y])=>P.push(E(o(x,y).x,o(x,y).y,3,2,'skin',5.3,{g:70,bias:.5,noline:1})));
  [-1,1].forEach(s=>{const c=o(64+s*22,45-br);P.push(E(c.x,c.y,9.5,9,'skin',6,{g:80+s}));
    P.push(Pg([[c.x-s*4,c.y-6],[c.x+s*3,c.y-19],[c.x+s*5,c.y-5]],'horn',6.2));P.push(Pg([[c.x+s*3,c.y-3],[c.x+s*14,c.y-12],[c.x+s*8,c.y+1]],'horn',6.2))});
  const hand=o(p.hx!=null?p.hx:34,p.hy!=null?p.hy:80);const shL=o(42,47-br);
  const elb={x:Math.min(shL.x,hand.x)-5,y:(shL.y+hand.y)/2+2};
  P.push(Cp(shL,elb,6.2,5.2,'skin',7,{g:90}));P.push(Cp(elb,hand,5.2,4.4,'skin',7.1,{g:90}));
  const sa=(p.sa||0)*DEG,sv={x:Math.sin(sa),y:-Math.cos(sa)};
  const top={x:hand.x+sv.x*64,y:hand.y+sv.y*64},bot={x:hand.x-sv.x*40,y:hand.y-sv.y*40};p.orbAt={x:top.x+sv.x*9,y:top.y+sv.y*9};
  P.push(Cp(bot,top,1.9,1.6,'staff',6.8));
  P.push(E(top.x,top.y,5.2,4.8,'horn',6.9));
  P.push(E(top.x-2,top.y,1.2,1.4,null,6.95,{col:BLACK}));P.push(E(top.x+2,top.y,1.2,1.4,null,6.95,{col:BLACK}));
  const g=p.glow||1,orb={x:top.x+sv.x*9,y:top.y+sv.y*9};P.push(E(orb.x,orb.y,3.6*g,3.6*g,'orb',7,{bias:.5}));
  P.push(E(hand.x,hand.y,5,5,'skin',7.3,{g:90}));
  const shR=o(86,47-br),hR=o(p.rx!=null?p.rx:96,p.ry!=null?p.ry:82),eR={x:Math.max(shR.x,hR.x)+5,y:(shR.y+hR.y)/2+2};
  P.push(Cp(shR,eR,6.2,5.2,'skin',7,{g:91}));P.push(Cp(eR,hR,5.2,4.4,'skin',7.1,{g:91}));P.push(E(hR.x,hR.y,5,5,'skin',7.3,{g:91}));
  [-3,0,3].forEach(c=>{const a={x:hR.x+c,y:hR.y+3},b={x:hR.x+c*1.4,y:hR.y+9};P.push(Cp(a,b,1.4,.5,'horn',7.4))});
  const nk=o(64,40-br);P.push(E(nk.x,nk.y,7,5,'skin',7.5,{g:95}));
  const hc=o(64+(p.hdx||0),29-br+(p.hdy||0));
  [-1,1].forEach(s=>{const a={x:hc.x+s*7,y:hc.y-7},b={x:hc.x+s*17,y:hc.y-12},c={x:hc.x+s*21,y:hc.y-23},d={x:hc.x+s*17,y:hc.y-32};
    P.push(Cp(a,b,3.8,3.2,'horn',7.9,{g:96+s}));P.push(Cp(b,c,3.2,2.3,'horn',7.95,{g:96+s}));P.push(Cp(c,d,2.3,.9,'horn',8,{g:96+s}))});
  P.push(E(hc.x,hc.y,10,11,'skin',8.2,{g:99}));
  P.push(E(hc.x,hc.y+8,8,5,'skin',8.3,{g:99}));
  [-1,1].forEach(s=>{P.push(Pg([[hc.x+s*1,hc.y-3],[hc.x+s*8,hc.y-5],[hc.x+s*7,hc.y-1.5]],null,8.5,{col:BLACK}));
    P.push(E(hc.x+s*4.5,hc.y-.5,2.2,1.1,null,8.6,{col:hex('#ff2438')}));P.push(E(hc.x+s*4.5,hc.y-.6,.7,.6,null,8.7,{col:hex('#ffe2e2')}))});
  P.push(Cp({x:hc.x-5,y:hc.y+8},{x:hc.x+5,y:hc.y+8},.9,.9,null,8.6,{col:BLACK}));
  [-1,1].forEach(s=>P.push(Pg([[hc.x+s*3.6,hc.y+7.5],[hc.x+s*4.8,hc.y+7.5],[hc.x+s*4.2,hc.y+10.5]],null,8.7,{col:WHITE})));
  return P;
}

/* ---------- 졸개 슬라임 ---------- */
function slimePrims(sq){
  const P=[];const rx=12*(1+sq*.18),ry=10*(1-sq*.2),cy=28-ry;
  P.push(E(16,cy,rx,ry,'slime',1));
  P.push(Pg([[9,cy-ry+3],[7,cy-ry-5],[12,cy-ry+1]],'horn',1.5));P.push(Pg([[20,cy-ry+1],[25,cy-ry-5],[23,cy-ry+3]],'horn',1.5));
  P.push(E(12,cy-1,2.2,2.4,null,2,{col:hex('#ffe066')}));P.push(E(20,cy-1,2.2,2.4,null,2,{col:hex('#ffe066')}));
  P.push(E(11.6,cy-.6,.9,1.1,null,2.1,{col:BLACK}));P.push(E(19.6,cy-.6,.9,1.1,null,2.1,{col:BLACK}));
  P.push(Cp({x:9,y:cy-4.5},{x:13,y:cy-3},.55,.55,null,2.1,{col:BLACK}));P.push(Cp({x:23,y:cy-4.5},{x:19,y:cy-3},.55,.55,null,2.1,{col:BLACK}));
  return P;
}

/* ---------- animation: keyposes tweened into stepped frames ---------- */
function tween(keys,total){
  const out=[];for(let f=0;f<total;f++){let i=0;while(i<keys.length-1&&keys[i+1][0]<=f)i++;const[f0,a]=keys[i];const nx=keys[i+1];
    if(!nx||f===f0){out.push({...a});continue}const[f1,b]=nx;const u=(f-f0)/(f1-f0);const o={...a};
    for(const k in b){if(typeof b[k]==='number'&&typeof a[k]==='number')o[k]=a[k]+(b[k]-a[k])*u;else if(u>=.5||a[k]==null)o[k]=b[k]}out.push(o)}
  return out;
}
const Q={hx:BAX-14,hy:BG-19,ba:90,lb:0,lf:0,ab:0,af:0,pl:'back',ha:0};
const U={hx:BAX,hy:BG-11,ba:0,lb:0,lf:0,ab:-12,af:34,pa:104,pl:'hand',ha:0,pz:8.5};
const RUN=[[-30,-40,30,40,0,92,-2],[-10,-18,12,20,-2,89,0],[10,16,-10,-16,-3,86,2],[18,22,-16,-22,-1,88,2],[8,12,0,5,0,92,0],[-18,-25,20,28,-1,93,-1]]
  .map(([lb,lf,ab,af,dy,ba,ha],i)=>({...Q,lb,lf,ab,af,hy:Q.hy+dy,ba,ha,fl:i%2?2:-1}));
const W1={...U,ba:-14,af:204,pa:0,ab:-38,hy:U.hy+1,pz:4,ha:-8,lf:-10},S1={...U,ba:4,af:128,pa:0,ab:10,pz:8.5,ha:2},I1={...U,ba:20,af:76,pa:0,ab:46,lf:22,lb:-16,ha:9,fl:3};
const BEAR_ANIM={
  run:{fps:14,loop:1,frames:RUN},
  stand:{fps:28,frames:tween([[0,Q],[2,{...Q,ba:58,hx:BAX-8,hy:BG-17,af:50,ab:40,lf:-30,lb:-30,ha:-6}],[4,{...Q,ba:22,hx:BAX-3,hy:BG-14,af:195,ab:40,lf:-10,lb:-10,ha:-4,pl:'back'}],[5,{...U,af:160,pa:20,ha:-3}],[7,U]],8)},
  idle:{fps:6,loop:1,frames:[U,{...U,hoy:.6,af:36,pa:102},{...U,hoy:1,af:38,pa:100,ab:-10},{...U,hoy:.4,af:36,pa:102}]},
  smash:{fps:20,ev:{4:'hit'},frames:tween([[0,U],[2,W1],[3,S1],[4,I1],[6,{...I1,ba:19,af:78}],[9,U]],10)},
  smash2:{fps:20,ev:{4:'hit'},frames:tween([[0,U],[2,{...U,ba:-18,af:262,pa:0,ab:-50,pz:4,ha:-10,lf:-12}],[3,{...U,ba:-2,af:175,pa:0,pz:8.5,ab:0}],[4,{...U,ba:16,af:96,pa:0,ab:40,pz:8.5,ha:6,lf:18,lb:-12,fl:3}],[6,{...U,ba:15,af:100,pa:0,ab:38,pz:8.5,ha:5}],[9,U]],10)},
  upper:{fps:20,ev:{4:'up'},frames:tween([[0,U],[2,{...U,ba:12,af:-50,pa:0,ab:30,hy:U.hy+2,pz:8.5,ha:6,lf:15,lb:-10}],[3,{...U,ba:4,af:50,pa:0,pz:8.5,ab:0}],[4,{...U,ba:-14,af:150,pa:0,ab:-40,hy:U.hy-4,pz:8.5,ha:-10,lf:-20,lb:10,fl:3}],[6,{...U,ba:-13,af:156,pa:0,ab:-38,hy:U.hy-4,pz:8.5,ha:-9,lf:-18,lb:10}],[9,U]],10)},
  kick:{fps:18,ev:{3:'kick'},frames:tween([[0,U],[2,{...U,ba:-10,lf:50,hx:BAX+3,hy:U.hy-2,ha:-4,af:30}],[3,{...U,ba:-26,lf:105,hx:BAX+10,hy:U.hy-3,ha:-8,ab:-30,af:30,pz:4,fl:3}],[6,{...U,ba:-25,lf:102,hx:BAX+10,hy:U.hy-3,ha:-7,ab:-28,af:30,pz:4}],[9,U]],10)},
  rage:{fps:22,ev:{2:'jump',5:'hit',7:'hit',9:'hit',12:'crit'},frames:tween([[0,U],[2,{...U,hy:U.hy+3,ba:-6,af:198,pa:0,pz:4,lf:25,lb:-22,ab:-30}],[4,{...W1,hy:U.hy-24,ba:-20,af:214,lf:-35,lb:25}],[5,{...I1,hy:U.hy+1}],[6,W1],[7,I1],[8,W1],[9,I1],[10,{...W1,hy:U.hy-6,ba:-22,af:222}],[11,{...S1,hy:U.hy-3}],[12,{...I1,ba:27,af:80,ab:52,ha:11}],[16,{...I1,ba:26,af:82}],[19,U]],20)},
  hurt:{fps:12,frames:tween([[0,{...U,ba:-16,hx:BAX-4,ha:-14,af:40,ab:-40}],[2,{...U,ba:-10,hx:BAX-3,ha:-8}],[4,U]],5)},
  win:{fps:10,loop:1,frames:tween([[0,{...U,af:180,pa:0,ab:165,pz:4}],[2,{...U,af:176,pa:0,ab:160,hy:U.hy-6,pz:4}],[4,{...U,af:180,pa:0,ab:165,pz:4}]],4)},
};
const LI={wing:0,br:0,glow:1};
const LORD_ANIM={
  idle:{fps:8,loop:1,frames:[0,1,2,3,4,5,6,7].map(i=>({...LI,wing:Math.sin(i/8*Math.PI*2),br:Math.round((Math.sin(i/8*Math.PI*2)*.5+.5)*1.4),glow:1+Math.sin(i/8*Math.PI*2)*.12}))},
  cast:{fps:10,ev:{8:'fire'},frames:tween([[0,LI],[3,{...LI,hx:40,hy:46,sa:-12,glow:1.4,wing:.9,br:1,hdy:-1}],[6,{...LI,hx:41,hy:44,sa:-14,glow:1.8,wing:1,br:1,hdy:-1}],[8,{...LI,hx:24,hy:66,sa:-58,glow:2,wing:-.6,dx:-2,hdx:-2}],[11,{...LI,hx:26,hy:68,sa:-54,glow:1.2,wing:-.4,dx:-2}],[14,LI]],15)},
  hurt:{fps:12,frames:[{...LI,dx:3,hdx:2,hdy:1},{...LI,dx:2,hdx:1},LI]},
};
const WALK2=[0,1,2,3,4,5].map(i=>{const ph=i/6*Math.PI*2;return{...U,lf:Math.sin(ph)*42,lb:-Math.sin(ph)*42,ab:-Math.sin(ph)*38,af:34+Math.sin(ph)*6,ba:9,hy:U.hy-Math.abs(Math.cos(ph))*2.5,ha:2,fl:i%2?2:-1}});
const AIM={...U,af:90,pa:0,ab:70,ba:2,pz:9.5},REC={...AIM,af:97,ba:-4,hx:BAX-1,ha:-3};
const SIDLE={...U,af:40,pa:0},BIDLE={...U,af:58,pa:0,ab:-10};
function animDefs(kind){
  const A={run:BEAR_ANIM.run,stand:BEAR_ANIM.stand,hurt:BEAR_ANIM.hurt,win:BEAR_ANIM.win};
  const wk=base=>WALK2.map(f=>({...f,af:base.af+(f.af-34),pa:base.pa}));
  if(kind==='blunt'){Object.assign(A,{idle:BEAR_ANIM.idle,smash:BEAR_ANIM.smash,smash2:BEAR_ANIM.smash2,upper:BEAR_ANIM.upper,kick:BEAR_ANIM.kick,rage:BEAR_ANIM.rage});A.walk2={fps:14,loop:1,frames:WALK2}}
  if(kind==='gun'){A.idle={fps:6,loop:1,frames:[AIM,{...AIM,hoy:.6},{...AIM,hoy:1},{...AIM,hoy:.4}]};A.shoot={fps:14,ev:{1:'shot',3:'shot'},frames:[AIM,REC,AIM,REC]};A.walk2={fps:14,loop:1,frames:wk({af:55,pa:0})}}
  if(kind==='star'){A.idle={fps:6,loop:1,frames:[SIDLE,{...SIDLE,hoy:.6},{...SIDLE,hoy:1},{...SIDLE,hoy:.4}]};
    A.throw={fps:18,ev:{4:'throw'},frames:tween([[0,SIDLE],[2,{...U,af:205,pa:0,ba:-10,ab:-30,ha:-6}],[3,{...U,af:130,pa:0,ba:2}],[4,{...U,af:72,pa:0,ba:12,ab:40,ha:6,fl:3}],[7,SIDLE]],8)};A.walk2={fps:14,loop:1,frames:wk({af:40,pa:0})}}
  if(kind==='book'){A.idle={fps:6,loop:1,frames:[BIDLE,{...BIDLE,hoy:.6},{...BIDLE,hoy:1},{...BIDLE,hoy:.4}]};
    A.cast={fps:12,ev:{5:'magic'},frames:tween([[0,BIDLE],[3,{...U,af:150,pa:0,ab:-60,ba:-8,ha:-10,hy:U.hy-1}],[5,{...U,af:118,pa:0,ab:-40,ba:5,ha:-3}],[8,BIDLE]],9)};A.walk2={fps:14,loop:1,frames:wk({af:58,pa:0})}}
  return A;
}
const BSC=.72;
function xfAbout(P,k,ox,oy){P.forEach(p=>{if(p.jr){p.jx=ox+(p.jx-ox)*k;p.jy=oy+(p.jy-oy)*k;p.jr*=k}if(p.k==='e'){p.x=ox+(p.x-ox)*k;p.y=oy+(p.y-oy)*k;p.rx*=k;p.ry*=k}else if(p.k==='c'){p.x1=ox+(p.x1-ox)*k;p.y1=oy+(p.y1-oy)*k;p.x2=ox+(p.x2-ox)*k;p.y2=oy+(p.y2-oy)*k;p.r1*=k;p.r2*=k}else p.pts=p.pts.map(([x,y])=>[ox+(x-ox)*k,oy+(y-oy)*k])});return P}
function bearSmall(f){const P=xfAbout(bearPrims(f),BSC,BAX,BG);if(f.tip)f.tip={x:BAX+(f.tip.x-BAX)*BSC,y:BG+(f.tip.y-BG)*BSC};return P}
function bake(set,primFn,w,h){const out={};for(const k in set){const fr=set[k].frames.map(f=>({...f}));out[k]={...set[k],frames:fr,cv:fr.map(f=>raster(primFn(f),w,h))}}return out}
function whiteOf(cv){if(cv._w)return cv._w;const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const x=c.getContext('2d');x.drawImage(cv,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);return cv._w=c}
</script>
