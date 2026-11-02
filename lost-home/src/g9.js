<script>
/* ================= painted item icons (hand-shaded, 96px) ================= */
const PI_OL='#1a0f16';
const ICO_CACHE={};
function paintItem(id){if(ICO_CACHE[id])return ICO_CACHE[id];const it=ITEMS[id];const c=document.createElement('canvas');c.width=c.height=96;const x=c.getContext('2d');x.lineJoin='round';x.lineCap='round';
  if(it.c==='c')paintCostume(x,it.cos);else if(it.c==='a')paintAcc(x,id,it);else paintWeapon(x,id,it);
  return ICO_CACHE[id]=c}
/* ---------- helpers ---------- */
function rgbMix(a,b,t){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const r=Math.round(((A>>16)&255)*(1-t)+((B>>16)&255)*t),g=Math.round(((A>>8)&255)*(1-t)+((B>>8)&255)*t),bb=Math.round((A&255)*(1-t)+(B&255)*t);return'#'+((1<<24)|(r<<16)|(g<<8)|bb).toString(16).slice(1)}
function cylGrad(x,ax,ay,bx,by,w,cols){const nx=-(by-ay),ny=bx-ax,l=Math.hypot(nx,ny)||1;const ux=nx/l*w/2,uy=ny/l*w/2;const g=x.createLinearGradient(ax-ux,ay-uy,ax+ux,ay+uy);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));return g}
function bar(x,ax,ay,bx,by,w,cols,r){const ang=Math.atan2(by-ay,bx-ax),len=Math.hypot(bx-ax,by-ay);x.save();x.translate(ax,ay);x.rotate(ang);
  x.beginPath();x.roundRect(-2,-w/2,len+4,w,r==null?w/2.6:r);x.lineWidth=5;x.strokeStyle=PI_OL;x.stroke();const g=x.createLinearGradient(0,-w/2,0,w/2);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));x.fillStyle=g;x.fill();
  x.globalAlpha=.55;x.strokeStyle='#ffffff';x.lineWidth=Math.max(1.5,w*.12);x.beginPath();x.moveTo(w*.4,-w*.22);x.lineTo(len-w*.4,-w*.22);x.stroke();x.globalAlpha=1;x.restore()}
function blob(x,path,fill,lw){x.beginPath();path();x.closePath();x.lineWidth=lw||5;x.strokeStyle=PI_OL;x.stroke();x.fillStyle=fill;x.fill()}
function lg(x,x0,y0,x1,y1,cols){const g=x.createLinearGradient(x0,y0,x1,y1);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));return g}
function rg(x,cx,cy,r,cols){const g=x.createRadialGradient(cx-r*.35,cy-r*.4,r*.1,cx,cy,r);cols.forEach((c,i)=>g.addColorStop(i/(cols.length-1),c));return g}
function shine(x,cx,cy,s){x.save();x.fillStyle='#fff';x.globalAlpha=.95;x.beginPath();x.moveTo(cx,cy-s);x.quadraticCurveTo(cx+s*.12,cy-s*.12,cx+s,cy);x.quadraticCurveTo(cx+s*.12,cy+s*.12,cx,cy+s);x.quadraticCurveTo(cx-s*.12,cy+s*.12,cx-s,cy);x.quadraticCurveTo(cx-s*.12,cy-s*.12,cx,cy-s);x.fill();x.restore()}
function glowAt(x,cx,cy,r,col){const g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()}
const MAT={
 plank:['#e6a75f','#c47b38','#8f5321','#5e3213'],plank1:['#c9894a','#9c5c26','#6b3d18','#3e220e'],plank2:['#d0f6ff','#46bde0','#1f7fa3','#0f4a63'],plank3:['#eef2f8','#a8b0c2','#6a7286','#2d3240'],
 plank4:['#fff6b8','#f6c43a','#c88a10','#7a4a00'],umb:['#6a6a90','#383850','#20202e','#0c0c14'],rust:['#d89a5a','#a85a26','#6e3414','#2e1408'],bat:['#f6dca8','#dcae6c','#a8743c','#6a4420'],
 can:['#ff8a8a','#d8303c','#9c1c28','#5e0c16'],neon:['#e8ffff','#ff8ae0','#c02aa0','#4a0a5a'],rainbow:['#fff','#ffb43a','#ff3a8a','#6a22c8'],lava:['#fff2a0','#ff8a1a','#c42a00','#3a0a00'],
 ice:['#ffffff','#bfe8ff','#5aa8e8','#22609e'],holy:['#ffffff','#fff3b0','#e8c060','#8a6a20'],fishr:['#f2f8ff','#a8c8e0','#5a8ab0','#2a4a6a'],gunm:['#9a9ab8','#54546e','#2c2c3a','#121218'],
 gunb:['#d8f0ff','#6ab6ff','#2a78d6','#0e468a'],gold:['#fff8c0','#f6c43a','#c88a10','#6a3a00'],metal:['#ffffff','#c8d0dc','#8a92a4','#4a5060']};
const M=k=>MAT[k]||MAT.plank;
function woodGrain(x,ax,ay,bx,by,w,col){const ang=Math.atan2(by-ay,bx-ax),len=Math.hypot(bx-ax,by-ay);x.save();x.translate(ax,ay);x.rotate(ang);x.strokeStyle=col;x.lineWidth=1.4;x.globalAlpha=.55;
  for(let i=0;i<3;i++){const yy=-w*.25+i*w*.22;x.beginPath();x.moveTo(6+i*5,yy);x.bezierCurveTo(len*.3,yy+2,len*.6,yy-2,len-6,yy+1);x.stroke()}
  x.beginPath();x.ellipse(len*.55,w*.1,4,1.6,0,0,7);x.stroke();x.restore()}
/* ---------- weapons ---------- */
const A0=[18,80],A1=[78,18];
function paintWeapon(x,id,it){const w=it.w,k=w.kind;
  if(k==='gun')return paintGun(x,id,w);if(k==='star')return paintStar(x,id,w);if(k==='book')return paintBook(x,id,w);
  const m=M(w.ramp),hd=w.head;
  if(hd==='fish'){paintFish(x);return}
  if(hd==='pan'){bar(x,16,82,44,54,9,['#5a5a70','#2c2c3a','#121218']);blob(x,()=>x.ellipse(60,38,26,24,-.6,0,7),rg(x,60,38,26,['#8a8aa6','#3a3a4c','#16161e']),5);
    blob(x,()=>x.ellipse(61,37,19,17,-.6,0,7),rg(x,58,32,20,['#5a5a70','#22222c','#0c0c12']),3);x.globalAlpha=.6;x.strokeStyle='#fff';x.lineWidth=3;x.beginPath();x.arc(60,38,21,3.6,4.5);x.stroke();x.globalAlpha=1;shine(x,46,24,6);return}
  if(hd==='shovel'){bar(x,14,84,52,46,8,M('plank'));woodGrain(x,14,84,52,46,8,'#5e3213');blob(x,()=>{x.moveTo(50,40);x.lineTo(72,14);x.quadraticCurveTo(86,12,84,28);x.lineTo(60,52);x.quadraticCurveTo(52,52,50,40)},lg(x,50,14,84,52,['#f2f6fa','#a8b0c2','#5a6274']));
    x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=2.5;x.beginPath();x.moveTo(62,32);x.lineTo(76,18);x.stroke();blob(x,()=>x.roundRect(8,80,14,10,3),lg(x,8,80,22,90,['#ffd23a','#c88a10']),4);return}
  if(hd==='mop'){bar(x,20,80,58,34,7,M('plank'));for(let i=0;i<9;i++){const a=-1.4+i*.28;x.strokeStyle=PI_OL;x.lineWidth=7;x.beginPath();x.moveTo(62,30);x.quadraticCurveTo(62+Math.cos(a)*14,30+Math.sin(a)*14-4,62+Math.cos(a)*24,30+Math.sin(a)*24);x.stroke()}
    for(let i=0;i<9;i++){const a=-1.4+i*.28;x.strokeStyle=i%2?'#e8e0d0':'#c8bca8';x.lineWidth=4;x.beginPath();x.moveTo(62,30);x.quadraticCurveTo(62+Math.cos(a)*14,30+Math.sin(a)*14-4,62+Math.cos(a)*24,30+Math.sin(a)*24);x.stroke()}
    blob(x,()=>x.roundRect(54,24,14,12,3),lg(x,54,24,54,36,['#7ab6ff','#2a78d6']),4);return}
  if(hd==='toy'){bar(x,18,82,52,48,8,['#fff6a0','#ffd23a','#e08a10']);x.save();x.translate(62,34);x.rotate(-Math.PI/4);blob(x,()=>x.roundRect(-20,-14,40,28,12),lg(x,0,-14,0,14,['#ffb0c0','#ff4a6a','#b81c40']));
    blob(x,()=>x.roundRect(-24,-15,8,30,4),lg(x,0,-15,0,15,['#fff6a0','#ffd23a']),4);blob(x,()=>x.roundRect(16,-15,8,30,4),lg(x,0,-15,0,15,['#fff6a0','#ffd23a']),4);x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(-4,-7,9,3,0,0,7);x.fill();x.restore();return}
  if(hd==='axe'){bar(x,16,84,66,22,8,M('can'));blob(x,()=>{x.moveTo(56,28);x.quadraticCurveTo(54,6,80,8);x.quadraticCurveTo(92,26,74,44);x.quadraticCurveTo(66,30,56,28)},lg(x,56,8,90,44,['#ffffff','#c8d0dc','#6a7286']));
    x.strokeStyle='rgba(255,255,255,.9)';x.lineWidth=2.5;x.beginPath();x.moveTo(80,12);x.quadraticCurveTo(88,24,78,38);x.stroke();blob(x,()=>{x.moveTo(60,32);x.lineTo(48,22);x.lineTo(54,40)},'#3a3a48',4);return}
  if(hd==='hammer'){bar(x,16,84,60,30,8,M('plank'));woodGrain(x,16,84,60,30,8,'#5e3213');x.save();x.translate(66,26);x.rotate(-Math.PI/4);blob(x,()=>x.roundRect(-22,-12,44,24,4),lg(x,0,-12,0,12,['#d8dee8','#7a8296','#3a4050']));
    x.fillStyle='rgba(255,255,255,.5)';x.fillRect(-18,-9,36,3);blob(x,()=>x.roundRect(-26,-13,8,26,2),'#4a5060',4);x.restore();return}
  if(hd==='hook'){bar(x,20,82,64,26,7,['#ff8a8a','#d8303c','#7a0c16']);x.strokeStyle=PI_OL;x.lineWidth=12;x.beginPath();x.moveTo(64,26);x.quadraticCurveTo(72,10,84,18);x.stroke();x.strokeStyle='#d8303c';x.lineWidth=7;x.beginPath();x.moveTo(64,26);x.quadraticCurveTo(72,10,84,18);x.stroke();
    x.strokeStyle=PI_OL;x.lineWidth=10;x.beginPath();x.moveTo(20,82);x.lineTo(14,90);x.stroke();x.strokeStyle='#d8303c';x.lineWidth=5;x.beginPath();x.moveTo(20,82);x.lineTo(14,90);x.stroke();return}
  if(hd==='blade'){bar(x,24,80,64,24,6,['#7a7aa0','#383850','#14141e']);blob(x,()=>{x.moveTo(60,26);x.lineTo(70,14);x.quadraticCurveTo(90,20,86,34);x.lineTo(64,32)},lg(x,60,14,90,34,['#ffffff','#5ac8ff','#1a6ab8']));blob(x,()=>x.roundRect(16,76,14,10,3),'#ffd23a',4);return}
  // straight weapons: boards, bats, swords, pipes
  const sword=id==='katana'||id==='lava'||id==='glacier';const wd=sword?11:Math.max(9,Math.min(17,w.r*4.4));
  if(sword){bar(x,12,86,26,72,8,['#5a3a20','#3a2410','#1a0f08']);blob(x,()=>x.roundRect(20,64,18,8,3),lg(x,20,64,38,72,['#ffe27a','#c88a10']),4);
    x.save();x.translate(30,68);x.rotate(-Math.PI/4);blob(x,()=>{x.moveTo(4,-wd/2);x.lineTo(78,-wd/2);x.lineTo(90,0);x.lineTo(78,wd/2);x.lineTo(4,wd/2)},lg(x,0,-wd/2,0,wd/2,[m[0],m[1],m[2],m[3]]));
    x.globalAlpha=.85;x.strokeStyle='#fff';x.lineWidth=2;x.beginPath();x.moveTo(10,-wd*.2);x.lineTo(80,-wd*.2);x.stroke();x.globalAlpha=1;
    if(id==='lava'){x.strokeStyle='#ffe066';x.lineWidth=1.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(16+i*16,-3);x.lineTo(22+i*16,2);x.lineTo(26+i*16,-1);x.stroke()}}
    if(id==='katana'){x.shadowColor='#ff5ad0';x.shadowBlur=10;x.strokeStyle='#a0ffff';x.lineWidth=1.5;x.beginPath();x.moveTo(8,wd*.25);x.lineTo(80,wd*.25);x.stroke();x.shadowBlur=0}
    x.restore();if(id==='glacier'){shine(x,70,24,7);shine(x,50,42,4)}return}
  if(id==='holy'){glowAt(x,48,48,46,'rgba(255,240,170,.75)')}if(id==='rainbow'){glowAt(x,48,48,42,'rgba(255,200,255,.5)')}
  const cols=id==='rainbow'?null:m;
  if(id==='rainbow'){x.save();x.translate(18,80);x.rotate(-Math.PI/4);const len=86;x.beginPath();x.roundRect(-2,-wd/2,len,wd,4);x.lineWidth=5;x.strokeStyle=PI_OL;x.stroke();x.clip();['#ff4a6a','#ff9a3a','#ffe066','#7bdc4f','#4aa8ff','#a06aff'].forEach((c,i)=>{x.fillStyle=c;x.fillRect(-2,-wd/2+i*wd/6,len,wd/6+.5)});x.fillStyle='rgba(255,255,255,.4)';x.fillRect(-2,-wd/2,len,wd*.18);x.restore()}
  else bar(x,A0[0],A0[1],A1[0],A1[1],wd,cols,id==='bat'?wd/2:3);
  if(/plank|nailed|goldp|holy|surf/.test(id)||w.ramp&&w.ramp.startsWith('plank')&&!/rebar/.test(id))woodGrain(x,A0[0],A0[1],A1[0],A1[1],wd,m[3]);
  if(id==='nailed')[[44,52],[56,40],[66,30]].forEach(([nx,ny])=>{x.strokeStyle=PI_OL;x.lineWidth=5;x.beginPath();x.moveTo(nx,ny);x.lineTo(nx+8,ny-8);x.stroke();x.strokeStyle='#c8d0dc';x.lineWidth=2.5;x.beginPath();x.moveTo(nx,ny);x.lineTo(nx+8,ny-8);x.stroke()});
  if(id==='pipe')[[40,58],[58,40]].forEach(([px,py])=>{x.fillStyle='rgba(120,50,10,.7)';x.beginPath();x.ellipse(px,py,4,3,-.8,0,7);x.fill()});
  if(id==='umbrella'){blob(x,()=>{x.moveTo(62,34);x.lineTo(86,6);x.lineTo(90,26);x.closePath()},lg(x,62,6,90,34,['#5a5a80','#20202e']),4)}
  if(id==='bat'){blob(x,()=>x.ellipse(20,78,7,7,0,0,7),'#a8743c',4)}
  if(id==='holy'){shine(x,72,22,9);shine(x,30,66,5);x.strokeStyle='#ffe066';x.lineWidth=3;x.beginPath();x.ellipse(74,16,10,4,-.4,0,7);x.stroke()}
  if(id==='goldp'){shine(x,66,30,7);shine(x,36,60,4)}
  if(id==='surf'){x.save();x.translate(48,48);x.rotate(-Math.PI/4);x.strokeStyle='#ff4a6a';x.lineWidth=3;x.beginPath();x.moveTo(-36,0);x.lineTo(36,0);x.stroke();x.restore()}}
function paintFish(x){blob(x,()=>{x.moveTo(14,82);x.lineTo(22,64);x.lineTo(32,74)},lg(x,14,64,32,82,['#a8c8e0','#5a8ab0']),4);
  blob(x,()=>{x.moveTo(26,70);x.quadraticCurveTo(40,30,82,16);x.quadraticCurveTo(76,52,30,74)},lg(x,26,16,82,74,['#f2f8ff','#a8c8e0','#5a8ab0','#2a4a6a']));
  x.fillStyle='#ff8a6a';x.globalAlpha=.6;x.beginPath();x.moveTo(36,60);x.quadraticCurveTo(52,40,74,24);x.lineTo(70,32);x.quadraticCurveTo(54,46,40,64);x.fill();x.globalAlpha=1;
  x.fillStyle=PI_OL;x.beginPath();x.arc(72,24,3,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(73,23,1,0,7);x.fill();x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(52,34,10,2.5,-.7,0,7);x.fill();shine(x,80,40,5)}
function paintGun(x,id,w){const m=M(w.ramp),big=w.big;
  if(w.rail){glowAt(x,60,40,40,'rgba(120,220,255,.6)')}
  x.save();x.translate(48,50);x.rotate(-.3);
  blob(x,()=>x.roundRect(-30,-11,big?68:56,18,5),lg(x,0,-11,0,7,[m[0],m[1],m[2],m[3]]));
  blob(x,()=>x.roundRect(big?30:20,-8,16,9,3),lg(x,0,-8,0,1,['#c8d0dc','#5a6274']),4);
  blob(x,()=>{x.moveTo(-26,5);x.lineTo(-14,5);x.lineTo(-18,30);x.lineTo(-32,28)},lg(x,0,5,0,30,id==='watergun'?['#ffd23a','#e08a10']:['#8a5a30','#4a2a10']),5);
  blob(x,()=>{x.moveTo(-10,5);x.quadraticCurveTo(-4,16,-12,16)},'#2c2c3a',3);
  if(id==='watergun')blob(x,()=>x.ellipse(-6,-16,10,8,0,0,7),rg(x,-6,-16,10,['#e8f8ff','#5ac8ff','#1a6ab8']),4);
  if(id==='mg'){for(let i=0;i<5;i++)blob(x,()=>x.roundRect(-4+i*6,8,5,10,2),'#f0b020',3);}
  if(id==='revolver')blob(x,()=>x.ellipse(-10,-2,10,9,0,0,7),rg(x,-10,-2,10,['#c8c8e0','#54546e','#1a1a24']),4);
  if(w.rail){x.shadowColor='#5af0ff';x.shadowBlur=12;x.strokeStyle='#a0ffff';x.lineWidth=3;x.beginPath();x.moveTo(-24,-4);x.lineTo(44,-4);x.stroke();x.shadowBlur=0}
  x.fillStyle='rgba(255,255,255,.55)';x.fillRect(-26,-9,big?60:48,3);x.restore();shine(x,74,26,5)}
function paintStar(x,id,w){
  if(w.pebble){blob(x,()=>x.ellipse(48,52,26,20,-.2,0,7),rg(x,48,52,26,['#e8e8f0','#9aa2b2','#4a5060']));x.fillStyle='rgba(255,255,255,.6)';x.beginPath();x.ellipse(38,42,9,5,-.4,0,7);x.fill();return}
  if(w.balloon){blob(x,()=>x.ellipse(48,48,26,28,0,0,7),rg(x,48,48,28,['#e0f6ff','#5ac8ff','#1a6ab8']));blob(x,()=>{x.moveTo(44,74);x.lineTo(52,74);x.lineTo(48,82)},'#1a6ab8',4);x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(38,36,7,10,-.4,0,7);x.fill();shine(x,66,26,5);return}
  const n=id==='rstar'?4:4,col=id==='rstar'?['#d89a5a','#965024','#4a2410']:id==='hstar'?['#ffe0ff','#c88aff','#5a2a9a']:['#ffffff','#c8d0dc','#5a6274'];
  const draw=(cx,cy,R,rot)=>{x.save();x.translate(cx,cy);x.rotate(rot);blob(x,()=>{for(let i=0;i<n*2;i++){const a=i*Math.PI/n,r=i%2?R*.28:R;x.lineTo(Math.cos(a)*r,Math.sin(a)*r)}},rg(x,0,0,R,col));x.fillStyle=PI_OL;x.beginPath();x.arc(0,0,R*.14,0,7);x.fill();x.restore()};
  if(w.big&&id==='kunai'){[[30,60,.4],[48,44,0],[66,30,-.4]].forEach(([a,b,r])=>{x.save();x.translate(a,b);x.rotate(-Math.PI/4+r);blob(x,()=>{x.moveTo(-4,14);x.lineTo(4,14);x.lineTo(4,-6);x.lineTo(0,-22);x.lineTo(-4,-6)},lg(x,-4,0,4,0,['#ffffff','#8a92a4']),4);blob(x,()=>x.arc(0,20,4,0,7),'#ff4a6a',3);x.restore()});return}
  draw(48,48,id==='hstar'?40:32,.3);if(id==='hstar')glowAt(x,48,48,20,'rgba(200,140,255,.4)');shine(x,64,26,6)}
function paintBook(x,id,w){const m=M(w.ramp==='bookB'?'gunb':w.ramp==='bookR'?'rust':w.ramp==='bookG'?'gold':w.ramp==='lava'?'lava':'gunb');
  const fx={orb:'#c88aff',ice:'#bfe8ff',fire:'#ff8a1a',bolt:'#ffe066'}[w.fx]||'#c88aff';glowAt(x,52,44,40,fx+'88');
  blob(x,()=>x.roundRect(20,18,54,64,6),lg(x,20,18,74,82,[m[1],m[2],m[3]]));blob(x,()=>x.roundRect(68,22,10,58,3),lg(x,68,0,78,0,['#fff8e8','#d8c8a8']),4);
  x.strokeStyle='rgba(0,0,0,.35)';x.lineWidth=3;x.beginPath();x.moveTo(28,18);x.lineTo(28,82);x.stroke();
  blob(x,()=>x.roundRect(20,18,12,12,3),lg(x,20,18,32,30,['#ffe27a','#c88a10']),3);blob(x,()=>x.roundRect(20,70,12,12,3),lg(x,20,70,32,82,['#ffe27a','#c88a10']),3);
  blob(x,()=>x.arc(50,50,12,0,7),rg(x,50,50,12,['#ffffff',fx,rgbMix(fx,'#000000',.4)]),4);
  if(w.fx==='bolt'){x.fillStyle='#fff';x.beginPath();x.moveTo(52,40);x.lineTo(44,52);x.lineTo(50,52);x.lineTo(46,60);x.lineTo(56,47);x.lineTo(50,47);x.closePath();x.fill()}else shine(x,50,50,6);
  x.fillStyle='rgba(255,255,255,.35)';x.fillRect(34,22,30,4)}
/* ---------- accessories ---------- */
function paintAcc(x,id,it){
  if(it.scarfItem){blob(x,()=>{x.moveTo(14,30);x.quadraticCurveTo(48,18,82,30);x.lineTo(82,46);x.quadraticCurveTo(48,34,14,46)},lg(x,0,18,0,46,['#7fb8ff','#3d85ea','#173a80']));
    blob(x,()=>{x.moveTo(24,42);x.lineTo(40,42);x.lineTo(36,84);x.lineTo(20,82)},lg(x,20,42,40,84,['#5a9af0','#2459bd']));blob(x,()=>{x.moveTo(38,42);x.lineTo(52,42);x.lineTo(56,80);x.lineTo(42,80)},lg(x,38,42,56,80,['#5a9af0','#2459bd']));
    x.strokeStyle='#fff';x.lineWidth=3;[[22,78,36,80],[40,76,54,76]].forEach(([a,b,c,d])=>{x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()});x.globalAlpha=.4;x.strokeStyle='#fff';x.lineWidth=2.5;for(let i=0;i<4;i++){x.beginPath();x.moveTo(24+i*14,26+(i%2));x.lineTo(24+i*14,38);x.stroke()}x.globalAlpha=1;return}
  if(it.up){const c=it.g>=4?'#5ff4ff':it.g>=3?'#ff6a8a':'#9fe08a';glowAt(x,48,48,40,c+'55');x.strokeStyle=PI_OL;x.lineWidth=9;x.beginPath();x.moveTo(48,10);x.lineTo(48,88);x.stroke();x.strokeStyle='#8a92a4';x.lineWidth=4;x.beginPath();x.moveTo(48,10);x.lineTo(48,88);x.stroke();
    for(let i=0;i<5;i++){const y=16+i*16;blob(x,()=>x.roundRect(30,y-6,36,12,6),lg(x,0,y-6,0,y+6,['#eef2f8','#9aa2b2','#4a5060']),4);blob(x,()=>x.arc(48,y,3.6,0,7),c,2.5);
      x.strokeStyle=PI_OL;x.lineWidth=4;x.beginPath();x.moveTo(30,y);x.lineTo(22,y+3);x.moveTo(66,y);x.lineTo(74,y+3);x.stroke()}shine(x,70,14,5);return}
  // chips / implants
  const core={chip:'#7bdc4f',accel:'#5ac8ff',os:'#ff4a6a',sande:'#5fffc0'}[id]||'#7bdc4f';glowAt(x,48,48,44,core+'66');
  for(let i=0;i<4;i++){[[22+i*14,10,22+i*14,22],[22+i*14,74,22+i*14,86],[10,24+i*14,22,24+i*14],[74,24+i*14,86,24+i*14]].forEach(([a,b,c,d])=>{x.strokeStyle=PI_OL;x.lineWidth=6;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke();x.strokeStyle='#e8c060';x.lineWidth=3;x.beginPath();x.moveTo(a,b);x.lineTo(c,d);x.stroke()})}
  blob(x,()=>x.roundRect(18,18,60,60,8),lg(x,18,18,78,78,['#5a6274','#2a2e3a','#12141c']));x.strokeStyle='rgba(255,255,255,.18)';x.lineWidth=1.5;for(let i=0;i<3;i++){x.beginPath();x.moveTo(24,30+i*14);x.lineTo(40,30+i*14);x.lineTo(46,36+i*14);x.stroke()}
  blob(x,()=>x.roundRect(34,34,28,28,6),rg(x,48,48,18,['#ffffff',core,rgbMix(core,'#000000',.5)]),4);if(id==='sande'){x.shadowColor=core;x.shadowBlur=14;x.strokeStyle=core;x.lineWidth=2;x.strokeRect(22,22,52,52);x.shadowBlur=0}shine(x,40,40,5)}
/* ---------- costumes: the bear wearing it ---------- */
const COSB={};
function cosBust(cos){if(COSB[cos])return COSB[cos];const g0=GEAR;GEAR={...GEAR,w:{kind:'blunt',ramp:'plank',len:0,r:.1},cos,sp:-1,nr:-1,sande:false,scarf:false};
  const f={...BEAR_ANIM.idle.frames[0]};const cv=raster(bearPrims(f),BW,BH);GEAR=g0;return COSB[cos]=cv}
function paintCostume(x,cos){const cv=cosBust(cos);x.imageSmoothingEnabled=false;
  // find opaque bbox of the head/torso area and fit it
  const ctx=cv.getContext('2d'),d=ctx.getImageData(0,0,BW,BH).data;let x0=BW,y0=BH,x1=0,y1=0;for(let yy=0;yy<BH;yy++)for(let xx=0;xx<BW;xx++)if(d[(yy*BW+xx)*4+3]>0){x0=Math.min(x0,xx);x1=Math.max(x1,xx);y0=Math.min(y0,yy);y1=Math.max(y1,yy)}
  const h=Math.min(y1-y0+1,Math.round((x1-x0)*1.05)),sx=x0,sy=y0,sw=x1-x0+1,sh=h,s=Math.min(90/sw,90/sh);const dw=Math.round(sw*s),dh=Math.round(sh*s);
  x.save();x.shadowColor='rgba(20,10,30,.35)';x.shadowOffsetY=3;x.drawImage(cv,sx,sy,sw,sh,(96-dw)/2,(96-dh)/2+2,dw,dh);x.restore()}
/* hook into the game */
function itemIcon(cv,id){cv.width=cv.height=96;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,96,96);x.drawImage(paintItem(id),0,0)}
</script>
<script>
/* ================= pro pixel shading for monsters & pets: selout, rim light, ambient occlusion ================= */
function proShade(cv){const w=cv.width,h=cv.height,x=cv.getContext('2d'),im=x.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d);
  const A=(i,j)=>i>=0&&j>=0&&i<w&&j<h&&d[(j*w+i)*4+3]>0;const isOL=(i,j)=>{const k=(j*w+i)*4;return d[k+3]>0&&d[k]===OUTC[0]&&d[k+1]===OUTC[1]&&d[k+2]===OUTC[2]};
  const inner=(i,j)=>A(i,j)&&!isOL(i,j);
  const mix=(k,r,g,b,t)=>{o[k]=o[k]*(1-t)+r*t;o[k+1]=o[k+1]*(1-t)+g*t;o[k+2]=o[k+2]*(1-t)+b*t};
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;if(!d[k+3])continue;
    if(isOL(i,j)){// selout: outline on lit side (top/left) takes a darkened tint of the body it wraps
      let src=-1;if(inner(i,j+1))src=((j+1)*w+i)*4;else if(inner(i+1,j))src=(j*w+i+1)*4;
      if(src>=0&&!inner(i,j-1)&&!inner(i-1,j)){o[k]=d[src]*.42;o[k+1]=d[src+1]*.42;o[k+2]=d[src+2]*.48}continue}
    // rim light: body pixel touching outline/air above or left
    const up=!inner(i,j-1),lf=!inner(i-1,j),dn=!inner(i,j+1),rt=!inner(i+1,j);
    if(up&&(lf||!inner(i-1,j-1)))mix(k,255,252,240,.38);else if(up)mix(k,255,250,235,.22);
    // ambient occlusion: bottom / right inner edge, 2px deep
    else if(dn||!inner(i,j+2))mix(k,30,14,40,dn?.32:.16);else if(rt)mix(k,30,14,40,.18)}
  im.data.set(o);x.putImageData(im,0,0);return cv}
const _mobFrames=mobFrames;mobFrames=function(t,s){const r=_mobFrames(t,s);if(!r.pro){r.fr.forEach(proShade);r.pro=1;for(const k in WHITE_CACHE_KEYS)delete WHITE_CACHE_KEYS[k]}return r};
var WHITE_CACHE_KEYS={};
const _petFrames=petFrames;petFrames=function(id){const r=_petFrames(id);if(!r.pro){r.fr.forEach(proShade);r.pro=1}return r};
</script>
<script>
/* ================= HD monsters: 2x pixel density drawn on the hi-res layer ================= */
function thickOutline(cv){const w=cv.width,h=cv.height,x=cv.getContext('2d'),im=x.getImageData(0,0,w,h),d=im.data,o=new Uint8ClampedArray(d);
  for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=(j*w+i)*4;if(d[k+3])continue;let hit=false;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=w||jj>=h)continue;const q=(jj*w+ii)*4;if(d[q+3]){hit=true;break}}
    if(hit){o[k]=OUTC[0];o[k+1]=OUTC[1];o[k+2]=OUTC[2];o[k+3]=255}}im.data.set(o);x.putImageData(im,0,0);return cv}
const SPR2={};
function mobHD(type,s){const key=type+'|'+s;if(SPR2[key])return SPR2[key];const r=_mobFrames(type,s*2);const fr=r.fr.map(c=>{const n=document.createElement('canvas');n.width=c.width+2;n.height=c.height+2;n.getContext('2d').drawImage(c,1,1);proShade(n);return thickOutline(n)});
  return SPR2[key]={fr,ax:r.ax+1,ay:r.ay+1}}
function hdMobs(ox,oy){X.save();X.imageSmoothingEnabled=false;
  HDQ.forEach(q=>{const m=q.m;if(m.dead)return;const F=mobHD(m.type,m.s),im=F.fr[Math.floor(m.ph)%4];
    X.setTransform(1,0,0,1,ox,oy);X.translate(Math.round((m.x+q.dx)*K),Math.round((GY-m.air)*K));X.rotate(q.rot);X.scale(q.sx*K/2/(F.res||1),q.sy*K/2/(F.res||1));X.drawImage(im,-F.ax,-F.ay);if(m.fl>0){X.globalAlpha=VBOSS[m.type]?.25:.35;X.drawImage(whiteOf(im),-F.ax,-F.ay);X.globalAlpha=1}});
  if(!bear.dead||Math.sin(T*20)>0){const bi=bear.a.cv[bear.f];X.setTransform(1,0,0,1,ox,oy);X.globalAlpha=bear.dead?.6:1;X.drawImage(bear.fl>0?whiteOf(bi):bi,Math.round(bear.x-BAX)*K,(GY-BG)*K,bi.width*K,bi.height*K);X.globalAlpha=1}
  X.restore();HDQ=[]}
</script>
