/* ---------- maps: 5 regions built from the tileset (assets/), recolored per region with region-specific shapes ----------
 Every prop is placed through place(), which refuses spots on the road, in water/lava or overlapping another prop,
 and records the prop's footprint so collisions always match what is drawn. */
const MW=320,MH=512;
const hash=(x,y,s=0)=>{const v=Math.sin(x*127.1+y*311.7+s*74.7)*43758.5453;return v-Math.floor(v);};
const sm=t=>t*t*(3-2*t);
function vn(x,y,s=0){const ix=Math.floor(x),iy=Math.floor(y),fx=sm(x-ix),fy=sm(y-iy);const a=hash(ix,iy,s),b=hash(ix+1,iy,s),c=hash(ix,iy+1,s),d=hash(ix+1,iy+1,s);return a+(b-a)*fx+(c-a)*fy+(a-b-c+d)*fx*fy;}
const cl=v=>Math.max(0,Math.min(255,v|0)),hx=n=>[n>>16&255,n>>8&255,n&255],OL='#1c1420';
const loadImg=s=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src='assets/'+s;});
// ---------- recolors ----------
const TONES={
 none:null,
 snow:(r,g,b)=>{const L=(r+g+b)/3;if(g>r+12&&g>b)return[cl(L*.55+150),cl(L*.5+165),cl(L*.4+190)];if(b>r+20&&b>g)return[cl(L*.6+120),cl(L*.4+190),240];if(r>b+12)return[cl(r*.75+30),cl(g*.78+32),cl(b*.85+45)];return[cl(r*.9+20),cl(g*.9+24),cl(b*.9+34)];},
 desert:(r,g,b)=>{const L=(r+g+b)/3;if(g>r+12&&g>b)return[cl(L*.85+110),cl(L*.7+92),cl(L*.45+50)];if(r>b+12)return[cl(r*1.05+18),cl(g*.95+16),cl(b*.8+6)];return[cl(r*.95+22),cl(g*.9+16),cl(b*.8+4)];},
 hell:(r,g,b)=>{const L=(r+g+b)/3;if(g>r+12&&g>b)return[cl(L*.7+40),cl(L*.22+12),cl(L*.2+12)];if(b>r+20&&b>g)return[255,cl(60+L*.85),cl(10+L*.25)];if(r>b+12)return[cl(L*.55+22),cl(L*.32+14),cl(L*.34+18)];return[cl(L*.55+26),cl(L*.38+18),cl(L*.45+26)];},
 demon:(r,g,b)=>{const L=(r+g+b)/3,sat=Math.max(r,g,b)-Math.min(r,g,b);if(sat<30)return[cl(L*.5+10),cl(L*.4+8),cl(L*.62+24)];if(g>r+12&&g>b)return[cl(L*.45+30),cl(L*.3+20),cl(L*.5+40)];if(b>r+20&&b>g)return[cl(L*.6+80),cl(L*.2+20),cl(L*.7+110)];if(r>b+12)return[cl(L*.6+40),cl(L*.25+14),cl(L*.35+30)];return[r,g,b];},
};
function recolor(img,tone){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);if(!TONES[tone])return c;
 const d=g.getImageData(0,0,c.width,c.height),p=d.data;for(let i=0;i<p.length;i+=4){if(!p[i+3])continue;const[r,gg,b]=TONES[tone](p[i],p[i+1],p[i+2]);p[i]=r;p[i+1]=gg;p[i+2]=b;}g.putImageData(d,0,0);return c;}
// ---------- terrain sampling ----------
const TILE={grass:[0,3],grass2:[1,9],dirt:[1,30],water:[3,3],brick:[13,15],cobble:[14,12],floor:[22,0],wall:[23,3]};
function sampler(sheet){const d=sheet.getContext('2d').getImageData(0,0,sheet.width,sheet.height).data,sw=sheet.width;return(n,x,y)=>{const[tx,ty]=TILE[n],i=((ty*16+(y&15))*sw+(tx*16+(x&15)))*4;return[d[i],d[i+1],d[i+2]];};}
function paint(fn){const c=document.createElement('canvas');c.width=MW;c.height=MH;const g=c.getContext('2d');g.imageSmoothingEnabled=false;const im=g.createImageData(MW,MH),d=im.data;
 for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const v=fn(x,y),i=(y*MW+x)*4;d[i]=v[0];d[i+1]=v[1];d[i+2]=v[2];d[i+3]=255;}g.putImageData(im,0,0);return[c,g];}
// ---------- shape changes applied to a stamped object ----------
const PAD=8,A=(d,w,x,y)=>d.data[(y*w+x)*4+3],setp=(d,w,x,y,[r,g,b])=>{const i=(y*w+x)*4;d.data[i]=r;d.data[i+1]=g;d.data[i+2]=b;d.data[i+3]=255;};
const SNOWCAP=(d,w,h,s)=>{for(let x=0;x<w;x++)for(let y=1;y<h;y++)if(A(d,w,x,y)>20&&A(d,w,x,y-1)<20){const th=2+((hash(x,y,s)*2)|0);for(let k=0;k<th;k++)if(y+k<h&&A(d,w,x,y+k)>20)setp(d,w,x,y+k,k===th-1?[200,222,244]:[250,252,255]);setp(d,w,x,y-1,[236,244,255]);}
 for(let x=0;x<w;x++)for(let y=PAD;y<h-4;y++)if(A(d,w,x,y)>20&&A(d,w,x,y+1)<20&&hash(x,y,s+3)<.18){const L=1+((hash(x,y,s+4)*4)|0);for(let k=1;k<=L;k++)setp(d,w,x,y+k,k===L?[150,200,240]:[200,236,255]);}};
const CRACKS=(d,w,h,s)=>{for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(A(d,w,x,y)>20&&Math.abs(vn(x*.18+s,y*.18,7)-.5)<.03)setp(d,w,x,y,hash(x,y,s)>.5?[255,150,40]:[255,90,20]);};
const SPIKES=(d,w,h,s)=>{for(let x=2;x<w-2;x+=5+((hash(x,s,1)*3)|0)){let y=0;while(y<h&&A(d,w,x,y)<20)y++;if(y>=h-2||y<5)continue;const L=3+((hash(x,y,s)*3)|0);for(let k=1;k<=L;k++){const hf=Math.max(0,Math.round((L-k)*.4));for(let i=-hf;i<=hf;i++)if(x+i>=0&&x+i<w)setp(d,w,x+i,y-k,k===L?[220,200,210]:[60,40,60]);}}};
function shd(g,cx,cy,rx,a=.3){g.fillStyle=`rgba(10,6,20,${a})`;const ry=Math.max(1,rx*.36);for(let j=-ry;j<=ry;j++){const w=Math.round(rx*Math.sqrt(1-(j/ry)**2));g.fillRect((cx-w)|0,(cy+j)|0,w*2,1);}}
// hand-pixeled region props, same outlined style
function spr(g,rows,pal,x,y){const Wd=Math.max(...rows.map(r=>r.length)),rr=rows.map(r=>r.replace(/ /g,'.').padEnd(Wd,'.')),Hh=rr.length,on=(i,j)=>j>=0&&j<Hh&&i>=0&&i<Wd&&rr[j][i]!=='.';
 x|=0;y|=0;g.fillStyle=OL;for(let j=-1;j<=Hh;j++)for(let i=-1;i<=Wd;i++)if(!on(i,j)&&(on(i-1,j)||on(i+1,j)||on(i,j-1)||on(i,j+1)))g.fillRect(x+i,y+j,1,1);
 for(let j=0;j<Hh;j++)for(let i=0;i<Wd;i++){const k=rr[j][i];if(k!=='.'){g.fillStyle=pal[k];g.fillRect(x+i,y+j,1,1);}}}
const PX={
 pine:[['        W','       WWW','      WWGWW','     WGGgGGW','     GGGGGGG','    WWGGgGGWW','   WGGGGGGgGGW','   GgGGGGGGGGG','  WWWGGgGGGGWWW',' WGGGGGGGGgGGGGW',' GGgGGGGGGGGGgGG','WGGGGGGgGGGGGGGGW','GGGGgGGGGGGGgGGGG',' gggggggggggggggg','       tTt','       tTt','       ttt'],{W:'#f6faff',G:'#3a8a5a',g:'#24604a',t:'#5a3a24',T:'#8a5a34'}],
 crystal:[['   c','  cC','  cCc',' ccCC','cCcCCc','cCCCCc',' cCCc','  cc'],{c:'#e0f6ff',C:'#6ab8e8'}],
 iceblock:[[' WWWWWWW','WcccccccW','cCcccCccc','cCCcccCcc','cccCcccCc','cCcccCCcc',' ddddddd'],{W:'#ffffff',c:'#b8e4fa',C:'#e8f8ff',d:'#6aa8d0'}],
 cactus:[['    gg','    gG','  g gG','  G gG g','  GggG G','    gGgG','    gG','    gG','    gG','   ggGG'],{g:'#2a7a3a',G:'#5aba5a'}],
 palm:[['  ll    ll','lllLl  lLlll','llL LLLL Lll','l  LLLLLL  l','     tTt','      tT','      tT','     tT','     tT','    tT','    tTT','   tttT'],{l:'#2a7a3a',L:'#5aba5a',t:'#7a4a24',T:'#b07a40'}],
 dune:[['     ssss','  ssssSSsss',' ssSSSSSSSss','sssSSSSSSSsss'],{s:'#c8a050',S:'#e8c878'}],
 deadtree:[['k      k    k','kk    kk   kk',' kk  kk   kk','  kkkk   kk','   kk  kkk','   kkkkk','   kkKk','   kkK','   kkK','  kkkKk',' kk   kk'],{k:'#2a1a1a',K:'#4a2a26'}],
 lavarock:[['   kkkk','  kKKKKkk',' kKKoKKKkk','kKKKKKoKkk','kkKoKKKKkk',' kkkkkkkk'],{k:'#2a2026',K:'#4a3a44',o:'#ff7a2a'}],
 skullpole:[[' wwww','wkwkww','wwwwww',' wwww','  pp','  pp','  pp','  pp','  pp','  pp'],{w:'#ece2d0',k:'#2a1a1a',p:'#4a2a1a'}],
 spikes:[['k  k  k  k','K  K  K  K','KK KK KK KK','KKKKKKKKKKK','kkkkkkkkkkk'],{k:'#2a2026',K:'#6a5a66'}],
 brazier:[['  ff','  FfF',' fFFf','kkkkkk','kKKKKk',' kKKk','  kk',' kkkk'],{f:'#ff8a2a',F:'#ffd23a',k:'#2a2a34',K:'#5a5a66'}],
 campfire:[['   ff','  fFFf',' fFYFf','  fFf','oLLLLo','LoLLoL'],{f:'#ff7a2a',F:'#ffb03a',Y:'#fff2a0',L:'#6a4428',o:'#8a5a34'}],
};
const O={house:[96,0,80,80],house2:[176,0,80,80],hut:[208,82,32,46],log:[48,80,48,16],rock1:[112,81,16,14],rock2:[129,83,15,13],rock3:[145,83,15,12],bigrock:[69,26,25,21],boulder:[180,118,27,19],sign:[91,103,26,33],board:[136,105,32,26],tree:[80,256,32,32],fountain:[352,144,48,48],stall:[288,359,80,85],statue:[128,496,32,48],gate:[64,496,64,48],tower:[0,336,48,112],cone:[48,350,48,82],arch:[168,504,48,40],tomb1:[567,83,20,24],tomb2:[599,83,19,23],tomb3:[624,83,16,24],skull:[434,51,13,12],bones:[433,34,14,11],crate:[564,129,26,31],cave:[186,402,28,33],banner:[54,464,26,55],plat:[313,457,62,71]};
// ---------- map builder ----------
// spec: {tone, road:{a,ph,w}|null, terrain(x,y,S,isRoad)->rgb|null, water(x,y) blocked fluid, blocked(x,y) extra solids, props(ctx)}
async function buildMaps(){
 const OW=await loadImg('Overworld.png');const SH={};for(const t in TONES)SH[t]=recolor(OW,t);
 const make=spec=>{
  const road=spec.road,rx=y=>road?160+road.a*Math.sin(y*.019+road.ph)+10*Math.sin(y*.07+road.ph):160,onRoad=(x,y)=>road&&Math.abs(x-rx(y))<road.w;
  const S=sampler(SH[spec.tone]),G=sampler(SH.none);
  const[c,g]=paint((x,y)=>spec.terrain(x,y,S,G,onRoad,rx)||(vn(x*.05,y*.05,2)>.6?S('grass2',x,y):S('grass',x,y)));
  const feet=[];// collision footprints of placed props
  const hitsFeet=(x,y)=>feet.some(([a,b,w,h])=>x>=a&&x<a+w&&y>=b&&y<b+h);
  const blockedT=(x,y)=>(spec.water&&spec.water(x,y,rx))||(spec.blocked&&spec.blocked(x,y,rx));
  // a prop fits if its whole box is clear of road (with margin), fluid, other props and the map edge
  const spot=(x,y,w,h,m)=>{if(fits(x,y,w,h,m))return[x,y];for(let r=6;r<=60;r+=6)for(let a=0;a<6.28;a+=.5){const nx=Math.round(x+Math.cos(a)*r),ny=Math.round(y+Math.sin(a)*r*.7);if(fits(nx,ny,w,h,m))return[nx,ny];}return null;};
  const fits=(x,y,w,h,m=4)=>{if(x<1||y<1||x+w>MW-1||y+h>MH-1)return false;for(let yy=y-m;yy<=y+h+m;yy+=3)for(let xx=x-m;xx<=x+w+m;xx+=3){if(onRoad(xx,yy)||blockedT(xx,yy)||hitsFeet(xx,yy))return false;}return true;};
  const P={
   g,tone:spec.tone,rx,
   // real-sheet object; solid = fraction of height (from the bottom) that blocks walking; 0 = walk-through
   obj(name,x,y,{mods=[],solid=.45,force=false,shadow=true,exact=false}={}){const[sx,sy,sw,sh]=O[name];x|=0;y|=0;x=Math.max(2,Math.min(MW-sw-2,x));if(!force){const p=exact?(fits(x,y,sw,sh)?[x,y]:null):spot(x,y,sw,sh,4);if(!p)return false;[x,y]=p;}
    const t=document.createElement('canvas');t.width=sw+PAD*2;t.height=sh+PAD*2;const q=t.getContext('2d');q.imageSmoothingEnabled=false;q.drawImage(SH[spec.tone],sx,sy,sw,sh,PAD,PAD,sw,sh);
    if(mods.length){const d=q.getImageData(0,0,t.width,t.height);for(const m of mods)m(d,t.width,t.height,x*7+y);q.putImageData(d,0,0);}
    if(shadow)shd(g,x+sw/2,y+sh-1,sw*.42);g.drawImage(t,x-PAD,y-PAD);if(solid)feet.push([x+sw*.1,y+sh*(1-solid),sw*.8,sh*solid]);return true;},
   px(name,x,y,{solid=.4,force=false,shadow=true,exact=false}={}){const[rows,pal]=PX[name],w=Math.max(...rows.map(r=>r.length)),h=rows.length;x|=0;y|=0;x=Math.max(2,Math.min(MW-w-2,x));if(!force){const p=exact?(fits(x,y,w,h,2)?[x,y]:null):spot(x,y,w,h,2);if(!p)return false;[x,y]=p;}
    if(shadow)shd(g,x+w/2,y+h,w*.42);spr(g,rows,pal,x,y);if(solid)feet.push([x+w*.15,y+h*(1-solid),w*.7,h*solid]);return true;},
   // scatter `name` n times inside a box, only where it fits
   scatter(kind,name,n,box,opt={},seed=1){let k=0;for(let i=0;i<n*12&&k<n;i++){const x=box[0]+hash(i,seed,3)*box[2],y=box[1]+hash(i,seed,7)*box[3];if(this[kind](name,x,y,{...opt,exact:true}))k++;}return k;},
   // trees along both map edges
   border(kind,name,step,opt){for(let y=-8;y<MH;y+=step){this[kind](name,2+hash(y,1,2)*16,y,{...opt,exact:true});this[kind](name,MW-24-hash(y,2,2)*16,y,{...opt,exact:true});}},
   sideX(y,side,w){return side<0?rx(y)-road.w-10-w:rx(y)+road.w+10;},
  };
  spec.props(P);
  const solid=(x,y)=>x<4||x>MW-4||y<0||y>MH||blockedT(x,y)||hitsFeet(x,y);
  return{name:spec.name,tone:spec.tone,bg:c,solid,rx,npc:P.npc,enemy:spec.enemy,boss:spec.boss,start:[rx(MH-30),MH-30]};};
 return[
  make({name:'시작의 마을',tone:'none',road:{a:44,ph:0,w:14},enemy:'그루터기',boss:null,
   water:(x,y,rx)=>Math.hypot((x-(rx(400)>160?62:258))/46,(y-404)/32)<1,
   terrain:(x,y,S,G,onRoad,rx)=>{const px=rx(400)>160?62:258,e=Math.hypot((x-px)/46,(y-404)/32)-1+(vn(x*.06,y*.06,5)-.5)*.14;if(e<0)return e>-.06?hx(0x2a5a8a):S('water',x,y);if(e<.05)return[242,248,255];
    const pl=Math.hypot((x-rx(236))/58,(y-236)/34)-1,d=Math.min(Math.abs(x-rx(y))-14,pl*36);if(d<0)return d>-1.5?hx(0x5a3a20):S('dirt',x,y);return null;},
   props(P){const R=P.rx;
    // fountain in the middle of the plaza, the elder's house by the road up north, a second house across, a market by the plaza
    P.obj('fountain',R(236)-24,212,{force:true,solid:.8});
    P.obj('house',P.sideX(60,-1,80),24,{solid:.55});P.obj('house2',P.sideX(56,1,80),20,{solid:.55});
    P.obj('stall',P.sideX(300,1,80),262,{solid:.5});P.obj('crate',P.sideX(360,1,26),352);P.obj('crate',P.sideX(360,1,26)+28,354);
    P.obj('hut',P.sideX(300,-1,32),268,{solid:.6});P.obj('sign',R(470)+22,440,{solid:.3});P.obj('board',P.sideX(150,1,32),140,{solid:.4});
    P.obj('log',P.sideX(200,-1,48),190,{solid:.6});
    P.border('obj','tree',30,{solid:.4});
    P.scatter('obj','rock1',3,[20,120,280,360]);P.scatter('obj','rock2',3,[20,120,280,360],{},4);P.scatter('obj','boulder',2,[20,100,280,380],{},6);
    for(let i=0;i<40;i++){const x=(hash(i,1,4)*300)|0,y=(hash(i,2,4)*500)|0;if(Math.abs(x-R(y))<20)continue;P.g.drawImage(SH.none,[57,49,25][i%3],[177,184,193][i%3],6,7,x,y,6,7);}
    P.npc={x:P.sideX(60,-1,80)+40,y:112,name:'촌장'};}}),
  make({name:'북쪽 설원',tone:'snow',road:{a:40,ph:1.2,w:14},enemy:'얼음 그루터기',boss:'얼음 그루터기 왕',
   terrain:(x,y,S,G,onRoad,rx)=>{const lx=rx(330)>160?66:254,e=Math.hypot((x-lx)/54,(y-330)/40)-1+(vn(x*.06,y*.06,5)-.5)*.16;
    if(e<0){if(e>-.05)return hx(0x3a6a9a);if((x+y)%41<2)return[236,250,255];if(Math.abs(vn(x*.1,y*.1,8)-.5)<.02)return hx(0x6aa8d8);return S('water',x,y);}if(e<.06)return[250,252,255];
    const ply=150+7*Math.sin(x*.045);if(!onRoad(x,y)&&y>=ply&&y<ply+16&&Math.abs(x-rx(150))>24){const k=y-ply;return k<2?[255,255,255]:k>14?hx(0x2a3a5a):(x%7===0?hx(0x6a8ab0):hx(k<6?0xb8d4ee:0x8aaccc));}
    if(onRoad(x,y)){if(Math.abs(x-rx(y))>12.5)return hx(0x9aaccc);const v=S('grass',x,y);return[v[0]*.86|0,v[1]*.9|0,v[2]*.97|0];}
    if(hash(x,y,2)>.985)return[255,255,255];return null;},
   water:(x,y)=>{const lx=160+40*Math.sin(330*.019+1.2)+10*Math.sin(330*.07+1.2)>160?66:254;return Math.hypot((x-lx)/54,(y-330)/40)<1;},
   blocked:(x,y)=>{const rxx=160+40*Math.sin(150*.019+1.2)+10*Math.sin(150*.07+1.2),ply=150+7*Math.sin(x*.045);return y>=ply-2&&y<ply+16&&Math.abs(x-rxx)>24;},
   props(P){P.obj('house',P.sideX(80,-1,80),40,{mods:[SNOWCAP],solid:.55});P.obj('cone',P.sideX(70,1,48),24,{mods:[SNOWCAP],solid:.35});
    P.obj('hut',P.sideX(250,1,32),214,{mods:[SNOWCAP],solid:.6});P.px('campfire',P.sideX(260,-1,10),262,{solid:.6});P.obj('log',P.sideX(262,-1,48)-14,276,{mods:[SNOWCAP],solid:.6});
    P.border('px','pine',26,{solid:.3});P.scatter('px','pine',8,[30,180,260,320],{solid:.3},2);
    P.scatter('px','crystal',6,[20,170,280,330],{solid:.5},5);P.scatter('px','iceblock',3,[20,190,280,300],{solid:.6},6);
    P.scatter('obj','bigrock',2,[20,180,280,300],{mods:[SNOWCAP]},7);P.scatter('obj','boulder',2,[20,380,280,100],{mods:[SNOWCAP]},8);P.obj('sign',P.sideX(470,-1,26),440,{mods:[SNOWCAP],solid:.3});}}),
  make({name:'타는 사막',tone:'desert',road:{a:30,ph:2.1,w:14},enemy:'모래 그루터기',boss:'사막 그루터기 왕',
   terrain:(x,y,S,G,onRoad,rx)=>{const ox=rx(190)>160?70:250,e=Math.hypot((x-ox)/44,(y-190)/30)-1+(vn(x*.07,y*.07,3)-.5)*.14;if(e<0)return e>-.06?hx(0x2a6a9a):G('water',x,y);if(e<.24)return e<.03?hx(0x3a6a2a):G('grass',x,y);
    if(onRoad(x,y))return Math.abs(x-rx(y))>12.5?hx(0x6a4a2a):S('brick',x,y);const rip=Math.sin(x*.12+y*.45+vn(x*.03,y*.03,4)*6);if(rip>.93)return hx(0xb08a48);return S('grass',x,y);},
   water:(x,y)=>{const rr=160+30*Math.sin(190*.019+2.1)+10*Math.sin(190*.07+2.1),ox=rr>160?70:250;return Math.hypot((x-ox)/44,(y-190)/30)<1;},
   props(P){const rr=P.rx(190),ox=rr>160?70:250;
    for(let i=0;i<5;i++){const a=i/5*6.28+.4;P.px('palm',ox+Math.cos(a)*56-6,190+Math.sin(a)*40-14,{solid:.25});}
    // ruins cluster on the far side of the road
    const rs=rr>160?-1:1;P.obj('tower',P.sideX(360,rs,48),300,{solid:.35});P.obj('arch',P.sideX(400,rs,48)+(rs<0?-52:52),370,{solid:.4});P.obj('statue',P.sideX(440,rs,32),430,{solid:.4});
    P.obj('stall',P.sideX(90,-rs,80),56,{solid:.5});P.obj('crate',P.sideX(150,-rs,26),136);
    P.scatter('px','cactus',12,[10,10,300,480],{solid:.3},3);P.scatter('px','dune',4,[10,10,300,480],{solid:0},4);
    P.scatter('obj','skull',4,[10,40,300,440],{solid:0},5);P.scatter('obj','bones',3,[10,40,300,440],{solid:0},6);P.scatter('obj','bigrock',3,[10,40,300,440],{},7);}}),
  make({name:'불타는 지옥',tone:'hell',road:{a:34,ph:1.3,w:14},enemy:'불꽃 그루터기',boss:'지옥 그루터기 왕',
   terrain:(x,y,S,G,onRoad,rx)=>{const ly=262+28*Math.sin(x*.028)+8*Math.sin(x*.09),lav=Math.abs(y-ly)-13-4*(vn(x*.06,y*.06,2)-.5)*2,br=Math.abs(x-rx(y))<20&&Math.abs(y-ly)<24;
    if(br){const bx=(x-rx(y)+20)|0;return bx<2||bx>37?hx(0x14101a):S('cobble',x,y);}
    const pool=Math.hypot((x-(rx(430)>160?60:260))/28,(y-430)/20)*20-20,l=Math.min(lav,pool);if(l<0){if(l>-2.5)return hx(0x2a0a0a);if(vn(x*.2,y*.2,8)>.8)return hx(0xfff2a0);return vn(x*.08,y*.08,6)>.62?hx(0xffb03a):S('water',x,y);}
    if(l<8&&hash(x,y,9)<(1-l/8)*.7)return hx(0x8a2a14);if(onRoad(x,y))return Math.abs(x-rx(y))>12.5?hx(0x140a10):S('cobble',x,y);
    if(Math.abs(vn(x*.03,y*.03,7)-.5)<.012)return hash(x,y,3)>.5?hx(0xff5a1a):hx(0x1a0a0a);return S('grass',x,y);},
   water:(x,y)=>{const rr=y=>160+34*Math.sin(y*.019+1.3)+10*Math.sin(y*.07+1.3);const ly=262+28*Math.sin(x*.028)+8*Math.sin(x*.09);if(Math.abs(x-rr(y))<20&&Math.abs(y-ly)<24)return false;return Math.abs(y-ly)<13||Math.hypot((x-(rr(430)>160?60:260))/28,(y-430)/20)<1;},
   props(P){const R=P.rx,ly=x=>262+28*Math.sin(x*.028)+8*Math.sin(x*.09);
    // graveyard on one side, a burnt village across, skull poles lining the road, braziers at both bridge ends
    const gs=R(120)>160?-1:1;for(let i=0;i<6;i++)P.obj(['tomb1','tomb2','tomb3'][i%3],P.sideX(110,gs,20)+(gs<0?-1:1)*(i%3)*24,90+(i/3|0)*34,{solid:.5});
    P.obj('house',P.sideX(390,-gs,80),340,{mods:[CRACKS,SPIKES],solid:.55});P.obj('cone',P.sideX(470,-gs,48),400,{mods:[CRACKS,SPIKES],solid:.35});
    for(const y of[60,160,360,460]){P.px('skullpole',R(y)-26,y,{solid:.3});P.px('skullpole',R(y)+20,y,{solid:.3});}
    P.px('brazier',R(ly(R(230)))-30,ly(R(230))-44,{solid:.5,force:true});P.px('brazier',R(ly(R(290)))+24,ly(R(290))+26,{solid:.5,force:true});
    P.border('px','deadtree',40,{solid:.3});P.scatter('px','lavarock',6,[20,20,280,470],{},3);P.scatter('px','spikes',3,[20,20,280,470],{},4);P.scatter('obj','skull',4,[20,20,280,470],{solid:0},5);P.obj('cave',P.sideX(200,gs,28),180,{solid:.5});}}),
  make({name:'마왕성',tone:'demon',road:null,enemy:'마왕군',boss:'마왕',
   terrain:(x,y,S)=>{if(y<80||x<14||x>=MW-14)return S('wall',x,y);if(y<86)return hx(0x14101c);const d=Math.abs(x-160);if(d<30&&y>170){if(d>27)return hx(0xffd23a);if(d>25)return hx(0x5a0a1a);return ((y/6|0)%2&&d<20&&d>17)?hx(0xa8283a):hx(0x8a1a2a);}return S('floor',x,y);},
   blocked:(x,y)=>y<86||x<14||x>=MW-14,
   props(P){P.obj('tower',4,10,{mods:[SPIKES],force:true,solid:0});P.obj('tower',MW-52,10,{mods:[SPIKES],force:true,solid:0});P.obj('gate',128,32,{mods:[SPIKES],force:true,solid:0});
    P.obj('plat',129,96,{force:true,solid:.7});P.obj('banner',50,30,{force:true,solid:0,shadow:false});P.obj('banner',244,30,{force:true,solid:0,shadow:false});
    for(const y of[190,270,350,430]){P.obj('statue',60,y-30,{mods:[SPIKES],force:true,solid:.35});P.obj('statue',228,y-30,{mods:[SPIKES],force:true,solid:.35});P.px('brazier',114,y,{force:true,solid:.5});P.px('brazier',198,y,{force:true,solid:.5});}}}),
 ];}
