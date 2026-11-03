/* ---------- pet art: 4 legendary beasts x 3 evolution stages ([0] C~A baby, [1] S~SSS youth, [2] H titan) + 4 common pets x 2 stages, facing right, feet at y=0 ---------- */
const BEAST={};
// 주작 · 기린 · 청룡: baby and youth stages, plus helpers shared with the titan forms
(()=>{
const INK='#15131c';
const glow=(c,x,y,r,col,a=.6)=>{c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();};
const ink=(c,fill,lw=1.8)=>{c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=INK;c.lineJoin='round';c.lineCap='round';c.stroke();};
const lg=(c,y0,y1,cols)=>{const g=c.createLinearGradient(0,y0,0,y1);cols.forEach((k,i)=>g.addColorStop(i/(cols.length-1),k));return g;};
function shape(c,pts){c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const[x,y,k,n=3,a=2]=pts[i],[px,py]=pts[i-1];
 if(k==='j'){const dx=x-px,dy=y-py,L=Math.hypot(dx,dy),nx=dy/L,ny=-dx/L;for(let j=1;j<=n;j++){const u=(j-.5)/n;c.lineTo(px+dx*u+nx*a,py+dy*u+ny*a);c.lineTo(px+dx*j/n,py+dy*j/n);}}
 else if(k==='q')c.quadraticCurveTo(pts[i][3],pts[i][4],x,y);else c.lineTo(x,y);}c.closePath();}
// eye facing right. mood 0 cute round, 1 sharp, 2 glowing with a light trail
function beye(c,x,y,r,mood,t,iris,gcol){c.save();c.translate(x,y);
 if(mood===0){ell(c,0,0,r,r*1.12);c.fillStyle=INK;c.fill();const g=c.createRadialGradient(0,r*.2,0,0,0,r);g.addColorStop(0,shade(iris,.5));g.addColorStop(.6,iris);g.addColorStop(1,shade(iris,-.5));ell(c,r*.05,r*.1,r*.8,r*.9);c.fillStyle=g;c.fill();
  ell(c,r*.1,r*.15,r*.4,r*.5);c.fillStyle=INK;c.fill();ell(c,-r*.32,-r*.35,r*.36,r*.36);c.fillStyle='#fff';c.fill();ell(c,r*.42,r*.5,r*.15,r*.15);c.fill();c.restore();return;}
 c.beginPath();c.moveTo(-r,r*.35);c.lineTo(r*1.15,-r*.45);c.quadraticCurveTo(r*.4,r*.75,-r,r*.35);c.closePath();c.fillStyle=mood===2?'#fff4c0':'#fff8ea';c.fill();
 c.save();c.clip();const g=c.createRadialGradient(r*.2,0,0,r*.2,0,r*.75);g.addColorStop(0,mood===2?'#fffbe0':shade(iris,.5));g.addColorStop(.5,iris);g.addColorStop(1,shade(iris,-.5));ell(c,r*.2,0,r*.75,r*.75);c.fillStyle=g;c.fill();
 ell(c,r*.22,0,r*.12,r*.45);c.fillStyle=INK;c.fill();if(mood<2){ell(c,0,-r*.18,r*.14,r*.14);c.fillStyle='#fff';c.fill();}c.restore();
 c.beginPath();c.moveTo(-r,r*.35);c.lineTo(r*1.15,-r*.45);c.lineWidth=r*.36;c.strokeStyle=INK;c.lineCap='round';c.stroke();
 c.beginPath();c.moveTo(-r*1.2,-r*.4);c.lineTo(r*1.3,-r*1.35);c.lineTo(r*1.45,-r*.95);c.lineTo(-r*1.05,0);c.closePath();c.fillStyle=INK;c.fill();c.restore();
 if(mood===2){c.save();c.globalCompositeOperation='lighter';const ex=x+r*1.2,ey=y-r*.5,L=r*8+Math.sin(t*6)*r,g2=c.createLinearGradient(ex,ey,ex+L,ey-L*.15);g2.addColorStop(0,gcol);g2.addColorStop(1,'rgba(0,0,0,0)');
  c.beginPath();c.moveTo(ex,ey-r*.35);c.lineTo(ex+L,ey-L*.15);c.lineTo(ex,ey+r*.35);c.closePath();c.fillStyle=g2;c.fill();glow(c,x,y,r*3,gcol,.6);c.restore();}}
// cute frontal baby head: big round skull, small muzzle, two big eyes
function babyHead(c,x,y,s,base,muz,iris,extra){c.save();c.translate(x,y);c.scale(s,s);if(extra)extra('back');
 ell(c,0,0,11,10);ink(c,lg(c,-10,10,base),1.8);if(extra)extra('mid');
 ell(c,0,5,6.6,4.4);ink(c,muz,1.3);ell(c,-2,4,.9,.7);ell(c,2,4,.9,.7);c.fillStyle=INK;c.fill();
 c.beginPath();c.moveTo(-2.2,6.8);c.quadraticCurveTo(-1.1,8,0,6.8);c.quadraticCurveTo(1.1,8,2.2,6.8);c.lineWidth=.9;c.strokeStyle=INK;c.stroke();
 beye(c,-4.6,-1.8,2.8,0,0,iris);beye(c,4.6,-1.8,2.8,0,0,iris);for(const d of[-1,1]){ell(c,d*7.4,2.6,2,1.2);c.fillStyle='rgba(255,120,130,.45)';c.fill();}
 if(extra)extra('front');c.restore();}
// leaf / feather blade along +x
function blade(c,x,y,len,ang,w,fill,lw=1.4,rib){c.save();c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(len*.45,-w,len,0);c.quadraticCurveTo(len*.45,w,0,0);c.closePath();ink(c,fill,lw);
 if(rib){c.beginPath();c.moveTo(len*.1,0);c.lineTo(len*.85,0);c.lineWidth=.7;c.strokeStyle='rgba(21,19,28,.45)';c.stroke();}c.restore();}
function flameTuft(c,x,y,len,ang,w,t,cols,ph=0){c.save();c.translate(x,y);c.rotate(ang+Math.sin(t*6+ph)*.12);for(let i=0;i<cols.length;i++){const k=1-i*.28;c.beginPath();c.moveTo(-w*k,0);c.bezierCurveTo(-w*k,-len*k*.5,w*.4*k,-len*k*.6,0,-len*k);c.bezierCurveTo(w*k*.9,-len*k*.55,w*k,-len*k*.2,w*k,0);c.closePath();c.fillStyle=cols[i];c.fill();if(!i){c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();}}c.restore();}
const FIRE=['#e8341a','#ff8a2a','#ffe27a'],GOLD='#ffd34a';
const scales=(c,x0,y0,cols,rows,s,col)=>{c.strokeStyle=col;c.lineWidth=.8;for(let r=0;r<rows;r++)for(let i=0;i<cols;i++){c.beginPath();c.arc(x0+i*s+(r%2)*s/2,y0+r*s*.7,s*.5,.15*Math.PI,.85*Math.PI);c.stroke();}};
const cloud=(c,x,y,s)=>{for(const p of[0,1])for(const[dx,dy,r]of[[-9,0,5],[0,-3,7],[9,0,5],[-3,2,5],[4,2,5]]){ell(c,x+dx*s,y+dy*s,(r+(p?0:1.2))*s,(r+(p?0:1.2))*s*.75);c.fillStyle=p?'#f2f6ff':INK;c.fill();}
 for(const dx of[-9,9]){c.beginPath();c.arc(x+dx*s,y,2.4*s,Math.PI*.1,Math.PI*1.3,true);c.strokeStyle='rgba(120,150,210,.7)';c.lineWidth=.9;c.stroke();}};

/* ---------------- 주작 phoenix ---------------- */
const PH=['#ffe08a','#ff8a2a','#d8341a'];
const phoenix=[
// chick: round fluffball, big eyes, tiny crest
(c,m)=>{const t=m.t,b=Math.abs(Math.sin(m.ph*.6))*1.2;c.translate(0,-b);
 blade(c,-11,-10,10,2.7,3.4,lg(c,-14,-6,PH));blade(c,-11,-12,9,2.4,3,lg(c,-16,-8,PH));
 for(const x of[-3,5]){c.beginPath();c.moveTo(x,-3);c.lineTo(x,0);c.moveTo(x-2,1);c.lineTo(x,0);c.lineTo(x+2,1);c.lineWidth=1.4;c.strokeStyle='#c87a10';c.stroke();}
 shape(c,[[0,-31],[12,-26,'j',3,1.4],[14,-12,'j',3,1.4],[2,-2,'j',3,1.4],[-12,-8,'j',3,1.4],[-12,-24,'j',3,1.4],[0,-31,'j',3,1.4]]);ink(c,lg(c,-31,-2,PH),1.8);
 ell(c,3,-11,7.5,7);c.fillStyle='#fff2c8';c.fill();
 blade(c,-7,-18,10,1.9,4,lg(c,-20,-8,['#ffb050','#e85a2a']),1.4);
 for(const[x,a]of[[-1,-1.9],[2,-1.57],[5,-1.25]])flameTuft(c,x,-30,8,a+1.57,2.2,t,FIRE,x);
 beye(c,-.5,-19,2.8,0,t,'#ff8a2a');beye(c,7.5,-19,2.8,0,t,'#ff8a2a');
 c.beginPath();c.moveTo(1.4,-15.5);c.lineTo(5.6,-15.5);c.lineTo(3.5,-11.6);c.closePath();ink(c,GOLD,1);
 for(const x of[-3.5,11]){ell(c,x,-14,2.2,1.3);c.fillStyle='rgba(255,90,90,.45)';c.fill();}},
// youth: standing, sleek, hooked beak, flame crest, long tail plumes
(c,m)=>{const t=m.t,sw=Math.sin(t*2)*.05;
 for(let i=0;i<3;i++){c.save();c.translate(-8,-26);c.rotate(2.45+i*.18+sw);c.beginPath();c.moveTo(0,-2);c.bezierCurveTo(14,-6,26,2,38,-2+i*2);c.bezierCurveTo(26,6,12,4,0,2);c.closePath();ink(c,lg(c,-4,6,PH),1.3);ell(c,34,-1+i*2,2.6,2.2);ink(c,GOLD,.8);ell(c,34,-1+i*2,1.1,1.1);c.fillStyle=INK;c.fill();c.restore();}
 for(const x of[-2,5]){c.beginPath();c.moveTo(x,-22);c.lineTo(x-1,0);c.lineWidth=2.4;c.strokeStyle=INK;c.stroke();c.lineWidth=1.3;c.strokeStyle=GOLD;c.stroke();c.beginPath();c.moveTo(x-4,1);c.lineTo(x-1,0);c.lineTo(x+3,1);c.moveTo(x-1,0);c.lineTo(x-2,2);c.lineWidth=1.3;c.strokeStyle=INK;c.stroke();}
 shape(c,[[-14,-28],[-4,-42,'q',-14,-40],[12,-40,'q',4,-46],[14,-26,'q',18,-32],[-2,-20,'q',8,-18],[-14,-28,'q',-12,-20]]);ink(c,lg(c,-46,-18,PH),2);
 ell(c,4,-28,6,7);c.fillStyle='rgba(255,240,200,.75)';c.fill();
 for(let i=0;i<4;i++)blade(c,-2,-36+i*2,16-i*2,2.75+i*.08,3.6,lg(c,-40,-28,['#ff9a3a','#d8341a']),1.2,1);
 shape(c,[[6,-40],[8,-52,'q',4,-48],[18,-56,'q',12,-58],[20,-48,'q',22,-52],[12,-38,'q',16,-40]]);ink(c,lg(c,-58,-38,PH),1.8);
 for(let i=0;i<4;i++)flameTuft(c,9-i*1.5,-55+i*1.5,11-i,-1.2-i*.25,2.4,t,FIRE,i);
 c.beginPath();c.moveTo(19,-54);c.quadraticCurveTo(27,-53,26,-47);c.quadraticCurveTo(24,-49,19.5,-49);c.closePath();ink(c,GOLD,1.2);
 beye(c,15,-52,2.4,1,t,'#ff9a20');},
// divine: wings of fire spread wide, crying out, flowing tail plumes, glowing eye trail
(c,m)=>{const t=m.t,fl=Math.sin(t*2.4);glow(c,0,-56,64,'#ff9a40',.25);
 const wing=(dir,a0)=>{for(let i=0;i<7;i++){const a=a0+dir*i*.16+fl*.05*dir,L=34+i*3;blade(c,dir*4,-58,L,a,6,lg(c,-10,10,['#ffe27a','#ff7a2a','#c8201a']),1.4,1);flameTuft(c,dir*4+Math.cos(a)*L,-58+Math.sin(a)*L,8,a+1.57,2.6,t,FIRE,i);}};
 wing(-1,-2.2);
 for(let i=0;i<4;i++){c.save();c.translate(-6,-34);c.rotate(2.2+i*.16+Math.sin(t*1.5+i)*.05);c.beginPath();c.moveTo(0,-2.6);c.bezierCurveTo(18,-8,34,4,52,-2+i*3);c.bezierCurveTo(34,8,16,5,0,2.6);c.closePath();ink(c,lg(c,-6,6,PH),1.3);
  flameTuft(c,52,-2+i*3,9,1.57+.3,2.6,t,FIRE,i);ell(c,40,1+i*2,3,2.6);ink(c,GOLD,.8);ell(c,40,1+i*2,1.3,1.3);c.fillStyle=INK;c.fill();c.restore();}
 for(const x of[-3,6]){c.beginPath();c.moveTo(x,-26);c.lineTo(x-1,0);c.lineWidth=3;c.strokeStyle=INK;c.stroke();c.lineWidth=1.6;c.strokeStyle=GOLD;c.stroke();c.beginPath();c.moveTo(x-5,1);c.lineTo(x-1,0);c.lineTo(x+4,1);c.lineWidth=1.5;c.strokeStyle=INK;c.stroke();}
 shape(c,[[-12,-36],[-2,-56,'q',-12,-54],[12,-56,'q',6,-62],[16,-32,'q',20,-44],[0,-24,'q',10,-22],[-12,-36,'q',-12,-26]]);ink(c,lg(c,-62,-22,PH),2.2);
 ell(c,5,-38,6,9);c.fillStyle='rgba(255,240,200,.75)';c.fill();
 wing(1,-1.0);
 // head raised, beak open crying
 shape(c,[[6,-54],[8,-68,'q',4,-62],[19,-74,'q',12,-76],[22,-64,'q',24,-70],[14,-52,'q',18,-54]]);ink(c,lg(c,-76,-52,PH),2);
 for(let i=0;i<6;i++)flameTuft(c,11-i*1.6,-73+i*1.5,15-i*1.2,-1.0-i*.24,3,t,FIRE,i);
 c.beginPath();c.moveTo(21,-72);c.quadraticCurveTo(31,-74,32,-67);c.quadraticCurveTo(28,-69,22,-67.5);c.closePath();ink(c,GOLD,1.2);
 c.beginPath();c.moveTo(22,-66.5);c.quadraticCurveTo(28,-64,29,-60);c.quadraticCurveTo(25,-62,21.5,-63.5);c.closePath();ink(c,GOLD,1.2);
 c.beginPath();c.moveTo(22,-67.2);c.lineTo(28,-66.4);c.lineTo(22,-64.6);c.fillStyle='#7a1010';c.fill();
 beye(c,16,-68,2.8,2,t,'#ffb020','rgba(255,190,60,.95)');
 for(let i=0;i<6;i++){const k=(t*.5+i/6)%1;glow(c,-20+i*8+Math.sin(t+i)*4,-10-k*70,3.5*(1-k)+1,'#ffb040',1-k);}}
];

/* ---------------- 기린 qilin ---------------- */
const QI=['#fff0b0','#ffcf5a','#d08a20'];
// profile head facing right; mood 0 cute, 1 sharp, 2 divine
function qhead(c,x,y,s,mood,t){c.save();c.translate(x,y);c.scale(s,s);
 const ant=mood===0?0:mood===1?1:2;
 if(ant){for(const[dx,k]of[[-2,.85],[2,1]]){c.save();c.translate(dx,-8);const L=(ant===1?10:18)*k;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-3,-L*.5,-6,-L);c.moveTo(-1.5,-L*.4);c.lineTo(3,-L*.6);c.moveTo(-3.4,-L*.7);c.lineTo(-8,-L*.75);if(ant===2){c.moveTo(-4.8,-L*.88);c.lineTo(-2,-L*1.1);c.moveTo(1.6,-L*.55);c.lineTo(4,-L*.85);}
  c.lineCap='round';c.lineWidth=ant===2?3.4:2.6;c.strokeStyle=INK;c.stroke();c.lineWidth=ant===2?1.8:1.3;c.strokeStyle=ant===2?'#fff2a0':'#e8b860';c.stroke();if(ant===2)glow(c,-6,-L,6,'#fff2a0',.7);c.restore();}}
 else{for(const dx of[-2,2]){c.beginPath();c.moveTo(dx-1.4,-7.5);c.lineTo(dx,-11.5);c.lineTo(dx+1.4,-7.5);c.closePath();ink(c,GOLD,1);}}
 blade(c,-5,-5,9,-2.5,3,lg(c,-10,0,QI),1.3);
 shape(c,[[-7,2],[-6,-7,'q',-8,-4],[4,-9,'q',-2,-11],[13,-4,'q',9,-8],[15,1,'q',17,-2],[10,5,'q',14,5],[-7,2,'q',0,7]]);ink(c,lg(c,-10,6,QI),1.8);
 ell(c,14,-1.6,1.1,.8);c.fillStyle=INK;c.fill();
 if(mood===2){c.beginPath();c.moveTo(6,4);c.lineTo(14,1.6);c.lineTo(11,7);c.closePath();ink(c,'#5a0e14',1);c.beginPath();c.moveTo(10,2.8);c.lineTo(11,5.4);c.lineTo(12,2.4);c.fillStyle='#fff';c.fill();}
 else{c.beginPath();c.moveTo(7,3.6);c.quadraticCurveTo(10.5,mood?3.2:4.6,13.6,2.6);c.lineWidth=1;c.strokeStyle=INK;c.stroke();}
 scales(c,-4,-6,3,2,3,'rgba(170,100,20,.55)');
 if(mood>=1)for(let i=0;i<(mood===2?4:2);i++)flameTuft(c,3+i*2,5,6+i*2,Math.PI+.4-i*.1,1.8,t,FIRE,i);
 beye(c,4,-3.4,mood===0?2.6:2.1,mood,t,mood===2?'#ffb020':'#e8701a','rgba(255,190,60,.95)');
 if(mood===0){ell(c,6,1.4,2,1.2);c.fillStyle='rgba(255,120,120,.4)';c.fill();}
 c.restore();}
function qleg(c,x,y0,len,o,big){c.save();c.translate(x,y0);c.rotate(o);const w=big?3.4:2.6;c.beginPath();c.moveTo(-w,0);c.quadraticCurveTo(-w-1,len*.4,-w*.55,len-3);c.lineTo(w*.6,len-3);c.quadraticCurveTo(w+.8,len*.4,w,0);c.closePath();ink(c,lg(c,0,len,QI),1.4);
 if(big){c.beginPath();rr(c,-w-.4,len*.45,w*2+.8,2.2,1);ink(c,GOLD,.8);flameTuft(c,-w,len-5,6,-1.9,1.6,0,FIRE);}
 c.beginPath();c.moveTo(-w*.8,len-3.4);c.lineTo(w*.9,len-3.4);c.lineTo(w*1.2,len);c.lineTo(-w,len);c.closePath();ink(c,'#3a2418',1.2);c.restore();}
const qilin=[
// fawn: lying down, big head, nub horns, cute
(c,m)=>{const t=m.t;
 flameTuft(c,-17,-8,8,-2.0,2.4,t,FIRE);
 shape(c,[[-18,-6],[-14,-16,'q',-20,-16],[6,-17,'q',-4,-20],[10,-6],[-18,-1,'q',-4,0]]);ink(c,lg(c,-20,0,QI),1.8);
 scales(c,-14,-14,5,2,4,'rgba(170,100,20,.55)');for(const[x,y]of[[-8,-11],[-2,-13],[-13,-9]]){ell(c,x,y,1.4,1);c.fillStyle='rgba(255,255,255,.7)';c.fill();}
 for(const x of[-12,4]){ell(c,x,-1.5,5,2.4);ink(c,lg(c,-4,1,QI),1.3);ell(c,x+4,-.6,1.6,1.4);c.fillStyle='#3a2418';c.fill();}
 babyHead(c,8,-22,1.05,QI,'#fff4d0','#e8701a',L=>{if(L==='back')for(const d of[-1,1])blade(c,d*8,-5,10,d>0?-.5:-2.64,3.4,lg(c,-10,0,QI),1.4);
  if(L==='front'){for(const d of[-1,1]){c.beginPath();c.moveTo(d*3-1.6,-8.6);c.lineTo(d*3.4,-13);c.lineTo(d*3+1.6,-8.6);c.closePath();ink(c,GOLD,1);}flameTuft(c,0,-9.4,6,0,2,t,FIRE);scales(c,-5,-7.5,4,1,3,'rgba(170,100,20,.5)');}});},
// youth: standing, small antlers, flame along the neck, sharp eye
(c,m)=>{const t=m.t,s=Math.sin(m.ph)*.18;
 for(let i=0;i<3;i++)flameTuft(c,-20,-30,12-i*2,-2.1+i*.3,3,t,FIRE,i);
 qleg(c,-15,-26,26,s,0);qleg(c,6,-26,26,-s,0);
 shape(c,[[-22,-30],[-14,-38,'q',-22,-38],[8,-38,'q',-2,-40],[16,-30,'q',16,-36],[8,-22,'q',14,-22],[-20,-22,'q',-6,-20],[-22,-30,'q',-24,-24]]);ink(c,lg(c,-40,-20,QI),2);
 c.save();c.clip();scales(c,-20,-36,10,3,4.4,'rgba(170,100,20,.55)');c.restore();
 shape(c,[[8,-36],[14,-50,'q',10,-44],[20,-48],[16,-28,'q',20,-34]]);ink(c,lg(c,-50,-28,QI),1.8);
 for(let i=0;i<5;i++)flameTuft(c,11-i*.4,-36-i*3,9,-1.3-i*.06,2.6,t,FIRE,i);
 qleg(c,-11,-26,26,-s,0);qleg(c,10,-26,26,s,0);
 qhead(c,19,-52,1.15,1,t);},
// divine: tall on clouds, glowing branched antlers, long flame mane and beard, gold armour plates, glowing eyes
(c,m)=>{const t=m.t,s=Math.sin(m.ph)*.12;glow(c,4,-48,60,'#ffe08a',.25);cloud(c,-14,1,1);cloud(c,12,2,.95);
 for(let i=0;i<4;i++)flameTuft(c,-26,-38,18-i*2,-2.2+i*.3,4,t,FIRE,i);
 qleg(c,-19,-34,32,s,1);qleg(c,7,-34,32,-s,1);
 shape(c,[[-28,-38],[-18,-50,'q',-28,-50],[10,-50,'q',-2,-53],[20,-38,'q',21,-46],[10,-28,'q',18,-28],[-24,-28,'q',-8,-26],[-28,-38,'q',-30,-30]]);ink(c,lg(c,-53,-26,QI),2.2);
 c.save();c.clip();scales(c,-26,-48,12,4,5,'rgba(150,80,10,.6)');c.beginPath();c.moveTo(-26,-32);c.quadraticCurveTo(-4,-24,18,-32);c.lineWidth=2.6;c.strokeStyle='#d8341a';c.stroke();c.restore();
 c.beginPath();rr(c,-6,-50,16,6,2);ink(c,GOLD,1.2);
 shape(c,[[8,-48],[16,-66,'q',11,-58],[24,-63],[20,-36,'q',25,-46]]);ink(c,lg(c,-66,-36,QI),1.9);
 for(let i=0;i<7;i++)flameTuft(c,12-i*.7,-46-i*3.2,13,-1.35-i*.08,3.2,t,FIRE,i);
 qleg(c,-14,-34,32,-s,1);qleg(c,12,-34,32,s,1);
 qhead(c,23,-70,1.35,2,t);}
];

/* ---------------- 청룡 azure dragon ---------------- */
const DR=['#7af0d0','#1aa890','#0a5a54'];
function tube(c,pts,r0,r1,t,spikes){const N=pts.length;
 for(let i=N-1;i>=0;i--){const[x,y]=pts[i],r=r0+(r1-r0)*i/(N-1);ell(c,x,y,r+1.5,r+1.5);c.fillStyle=INK;c.fill();}
 for(let i=N-1;i>=0;i--){const[x,y]=pts[i],r=r0+(r1-r0)*i/(N-1);ell(c,x,y,r,r);c.fillStyle=rgrad(c,x,y,r,DR[1]);c.fill();
  ell(c,x,y+r*.55,r*.7,r*.36);c.fillStyle='#f6e8a8';c.fill();c.beginPath();c.arc(x,y,r*.72,.2*Math.PI,.8*Math.PI);c.strokeStyle='rgba(160,255,230,.4)';c.lineWidth=.8;c.stroke();
  if(spikes&&i%2&&i<N-1){c.beginPath();c.moveTo(x-2.2,y-r+.6);c.lineTo(x+1,y-r-spikes);c.lineTo(x+2.8,y-r+.6);c.closePath();ink(c,'#ff9a3a',.8);}}}
// profile dragon head facing right
function dhead(c,x,y,s,mood,t){c.save();c.translate(x,y);c.scale(s,s);
 if(mood>=1){for(let i=0;i<(mood===2?7:4);i++){c.beginPath();c.moveTo(-6,-5+i*2.2);c.quadraticCurveTo(-13,-9+i*3,-19-i*(mood===2?2:1),-5+i*3.6+Math.sin(t*4+i)*2);c.lineWidth=mood===2?3:2.2;c.lineCap='round';c.strokeStyle=INK;c.stroke();c.lineWidth=mood===2?1.8:1.2;c.strokeStyle=i%2?'#e8fff8':'#9af0d8';c.stroke();}}
 const L=mood===0?0:mood===1?9:16;
 if(L){for(const[dx,k]of[[-4,1],[0,.85]]){c.beginPath();c.moveTo(dx,-6);c.quadraticCurveTo(dx-4,-L*.7*k,dx-11*k,-L*k);c.moveTo(dx-3,-L*.5*k);c.lineTo(dx+1,-L*.8*k);if(mood===2){c.moveTo(dx-7*k,-L*.85*k);c.lineTo(dx-6*k,-L*1.15*k);}c.lineWidth=mood===2?3.2:2.4;c.strokeStyle=INK;c.stroke();c.lineWidth=mood===2?1.6:1.2;c.strokeStyle=GOLD;c.stroke();}}
 else{for(const dx of[-3,2]){c.beginPath();c.moveTo(dx-1.4,-6.5);c.lineTo(dx-.6,-10.5);c.lineTo(dx+1.4,-6.5);c.closePath();ink(c,GOLD,1);}}
 const open=mood===2?3+Math.sin(t*2)*1:mood===1?1:0;
 c.beginPath();c.moveTo(-8,2);c.bezierCurveTo(-8,-9,4,-10,10,-5);c.lineTo(mood===0?16:20,-3.5);c.quadraticCurveTo(mood===0?18:23,-.5,mood===0?15:19,1.2);c.lineTo(8,2.4);c.closePath();ink(c,lg(c,-10,3,DR),1.8);
 c.beginPath();c.moveTo(-6,2.4);c.lineTo(8,2.4);c.lineTo(mood===0?14:18,2.4+open);c.quadraticCurveTo(10,6.5+open,-4,5.6);c.closePath();ink(c,lg(c,0,8,DR),1.5);
 if(open>.5){c.beginPath();c.moveTo(8,2.6);c.lineTo(18,2.6+open*.9);c.lineTo(8,3.6+open*.4);c.closePath();c.fillStyle='#5a0a1a';c.fill();for(const x of[10.5,14,17]){c.beginPath();c.moveTo(x-.9,2.2);c.lineTo(x,5);c.lineTo(x+.9,2.2);c.fillStyle='#fff';c.fill();}}
 ell(c,mood===0?14.5:18.4,-3,1,.8);c.fillStyle=INK;c.fill();
 if(mood>=1){c.beginPath();c.moveTo(18,-1);c.quadraticCurveTo(26,1,30,-5+Math.sin(t*3)*3);c.moveTo(17,1);c.quadraticCurveTo(24,8,29,7+Math.sin(t*3+1)*3);c.lineWidth=1.1;c.strokeStyle=GOLD;c.stroke();}
 else{c.beginPath();c.moveTo(15,-1);c.quadraticCurveTo(19,1,20,-2);c.lineWidth=.9;c.strokeStyle=GOLD;c.stroke();ell(c,6,0,2.2,1.3);c.fillStyle='rgba(255,130,140,.4)';c.fill();}
 beye(c,3,-4.2,mood===0?3:2.4,mood,t,mood===2?'#ffd020':'#ffb020','rgba(255,220,80,.95)');c.restore();}
const dragon=[
// hatchling: sitting chubby, big head, tail curled in front, cute
(c,m)=>{const t=m.t,b=Math.sin(t*2)*.6;
 c.beginPath();c.moveTo(-8,-2);c.bezierCurveTo(-22,-2,-20,8,-4,4);c.bezierCurveTo(6,2,14,4,16,0);c.lineWidth=7.4;c.lineCap='round';c.strokeStyle=INK;c.stroke();c.lineWidth=5;c.strokeStyle=DR[1];c.stroke();
 shape(c,[[-9,-4],[-10,-18,'q',-14,-10],[6,-24,'q',-4,-26],[10,-6,'q',12,-16],[-9,-4,'q',0,0]]);ink(c,lg(c,-26,0,DR),1.8);
 for(let i=0;i<4;i++){c.beginPath();rr(c,-2.5+i*.4,-20+i*4,9-i*.6,3.2,1.4);ink(c,'#f6e8a8',.9);}
 for(let i=0;i<3;i++){c.beginPath();c.moveTo(-10,-10-i*4);c.lineTo(-14,-12-i*4);c.lineTo(-10.5,-14-i*4);c.closePath();ink(c,'#ff9a3a',.9);}
 for(const x of[1,9]){ell(c,x,-12,2.6,2.2);ink(c,lg(c,-14,-10,DR),1.2);}
 babyHead(c,1,-30+b,1.2,DR,'#c8f8e4','#ffb020',L=>{if(L==='back')for(const d of[-1,1]){c.save();c.translate(d*10,-2);c.rotate(d*.5);c.beginPath();c.moveTo(0,-3);c.lineTo(d*7,-6);c.lineTo(d*5,-1);c.lineTo(d*8,1);c.lineTo(0,3);c.closePath();ink(c,'#ff9a3a',1.2);c.restore();}
  if(L==='front'){for(const d of[-1,1]){c.beginPath();c.moveTo(d*4-1.8,-8.6);c.quadraticCurveTo(d*6,-13,d*7,-14.5);c.quadraticCurveTo(d*6,-10,d*4+1.6,-8.2);c.closePath();ink(c,GOLD,1);
   c.beginPath();c.moveTo(d*6,5);c.quadraticCurveTo(d*11,6,d*13,3+Math.sin(t*3+d)*1.5);c.lineWidth=.9;c.strokeStyle=GOLD;c.stroke();}}});},
// youth: serpentine S-curve with two clawed legs, snarling head, small antlers
(c,m)=>{const t=m.t,N=16,pts=[];for(let i=0;i<N;i++){const k=i/(N-1);pts.push([10-k*46,-26+Math.sin(t*2.4-k*6)*6-Math.sin(k*Math.PI)*-8+k*14]);}
 tube(c,pts,6.2,2.4,t,4);
 flameTuft(c,pts[N-1][0],pts[N-1][1],9,-2.2,2.6,t,['#0a8a78','#3ae0b8','#d8fff0']);
 for(const i of[3,10]){const[x,y]=pts[i];c.save();c.translate(x,y+4);c.beginPath();c.moveTo(0,0);c.lineTo(-1,7);c.lineWidth=3.6;c.strokeStyle=INK;c.lineCap='round';c.stroke();c.lineWidth=2.2;c.strokeStyle=DR[1];c.stroke();
  for(const a of[-.8,0,.8]){c.beginPath();c.moveTo(-1,7);c.lineTo(-1+Math.sin(a)*3.6,7+Math.cos(a)*3.6);c.lineWidth=1.3;c.strokeStyle=GOLD;c.stroke();}c.restore();}
 dhead(c,pts[0][0]+4,pts[0][1]-4,1.15,1,t);},
// divine: big coiling dragon over clouds, roaring, glowing antlers and eye trail, clutching a pearl
(c,m)=>{const t=m.t,N=26,pts=[];glow(c,0,-46,62,'#5affd8',.2);
 for(let i=0;i<N;i++){const k=i/(N-1),a=k*Math.PI*1.7+.4;pts.push([Math.cos(a)*(26-k*10)-4+Math.sin(t*2-k*5)*1.5,-40+Math.sin(a)*(18-k*6)+k*18]);}
 cloud(c,-20,0,1.05);cloud(c,14,2,.9);
 tube(c,pts.slice().reverse(),2.6,8,t,6);
 flameTuft(c,pts[N-1][0],pts[N-1][1],12,-2.6,3.4,t,['#0a8a78','#3ae0b8','#d8fff0']);
 for(const i of[4,13]){const[x,y]=pts[i];c.save();c.translate(x,y+5);c.rotate(.2);c.beginPath();c.moveTo(0,0);c.lineTo(-1,9);c.lineWidth=4.4;c.strokeStyle=INK;c.lineCap='round';c.stroke();c.lineWidth=2.8;c.strokeStyle=DR[1];c.stroke();
  for(const a of[-.9,-.2,.5,1.1]){c.beginPath();c.moveTo(-1,9);c.lineTo(-1+Math.sin(a)*4.6,9+Math.cos(a)*4.6);c.lineWidth=1.5;c.strokeStyle=GOLD;c.stroke();}c.restore();}
 const[px,py]=pts[4];glow(c,px-2,py+20,12,'#c8fff4',.9);ell(c,px-2,py+20,4.4,4.4);ink(c,rgrad(c,px-2,py+20,4.4,'#e0fbff'),1.2);
 dhead(c,pts[0][0]+8,pts[0][1]-10,1.55,2,t);}
];
BEAST._={beye,blade,flameTuft,qhead,dhead,tube,scales,cloud,lg,FIRE,GOLD,QI,DR,PH,shape,ink,glow,babyHead};BEAST.phoenix=phoenix;BEAST.qilin=qilin;BEAST.dragon=dragon;
})();

// H-grade titan forms of 주작 · 기린 · 청룡: about twice the youth's size, a different silhouette
(()=>{
const{beye,blade,flameTuft,qhead,dhead,tube,scales,cloud,lg,FIRE,GOLD,QI,DR,PH,shape,ink,glow}=BEAST._;
const INK='#15131c';
const claws=(c,x,y,s,n=3)=>{for(let i=0;i<n;i++){const cx=x+(i-(n-1)/2)*3.2*s;c.beginPath();c.moveTo(cx-1.3*s,y-1*s);c.quadraticCurveTo(cx+2.4*s,y-.6*s,cx+2.2*s,y+2.6*s);c.quadraticCurveTo(cx+.8*s,y+.6*s,cx-1.3*s,y+.6*s);c.closePath();ink(c,'#fffaf0',.9);}};
const crack=(c,x,y,s)=>{c.beginPath();c.moveTo(x-18*s,1);c.lineTo(x-8*s,-.5);c.lineTo(x-3*s,1.5);c.lineTo(x+6*s,0);c.lineTo(x+16*s,1.5);c.moveTo(x-3*s,1.5);c.lineTo(x-1*s,4);c.lineWidth=1.4;c.strokeStyle='rgba(0,0,0,.45)';c.stroke();};
// thick beast leg with armour band and big claws
function bleg(c,x,y0,len,w,o,fill,band){c.save();c.translate(x,y0);c.rotate(o);
 shape(c,[[-w*.7,0],[-w*.62,len-3,'q',-w*1.05,len*.45],[w*.85,len-3],[w*.7,0,'q',w*1.1,len*.4]]);ink(c,fill,2);
 if(band){c.beginPath();rr(c,-w*.75,len*.5,w*1.6,3.6,1.4);ink(c,GOLD,1.2);c.beginPath();c.moveTo(-w*.4,len*.5+1.8);c.lineTo(w*.6,len*.5+1.8);c.lineWidth=.8;c.strokeStyle='#a87010';c.stroke();}
 shape(c,[[-w*.85,len-3.5],[-w*.9,len+.6,'q',-w*1.15,len-1],[w*1.05,len+.6],[w,len-3.5,'q',w*1.25,len-1.2]]);ink(c,fill,1.6);claws(c,w*.25,len-.4,1.25);c.restore();}

/* 주작 · 괴수: towering fire titan, burning arch of wings, crowned head screaming, molten core */
const phoenixT=(c,m)=>{const t=m.t,fl=Math.sin(t*2.4);glow(c,0,-70,90,'#ff7a30',.3);crack(c,0,0,1.6);
 const wing=(dir,a0,n,L0)=>{for(let i=0;i<n;i++){const a=a0+dir*i*.13+fl*.05*dir,L=L0+i*4;blade(c,dir*6,-74,L,a,9,lg(c,-12,12,['#fff2a0','#ff6a1a','#a8100a']),1.6,1);flameTuft(c,dir*6+Math.cos(a)*L,-74+Math.sin(a)*L,12,a+1.57,3.6,t,FIRE,i);}};
 wing(-1,-1.75,9,46);
 // trailing tails of fire
 for(let i=0;i<5;i++){c.save();c.translate(-6,-36);c.rotate(2.05+i*.14+Math.sin(t*1.5+i)*.05);c.beginPath();c.moveTo(0,-3.4);c.bezierCurveTo(22,-10,42,5,66,-3+i*3);c.bezierCurveTo(42,10,20,6,0,3.4);c.closePath();ink(c,lg(c,-8,8,PH),1.4);flameTuft(c,66,-3+i*3,12,1.9,3.4,t,FIRE,i);c.restore();}
 // talons
 for(const x of[-8,10]){c.beginPath();c.moveTo(x,-30);c.lineTo(x-2,-4);c.lineWidth=6;c.strokeStyle=INK;c.stroke();c.lineWidth=3.6;c.strokeStyle=GOLD;c.stroke();
  for(const a of[-1.1,-.3,.4,2.6]){c.beginPath();c.moveTo(x-2,-4);c.quadraticCurveTo(x-2+Math.cos(a)*6,-4+Math.sin(a+1.6)*3,x-2+Math.cos(a)*8,0);c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();}}
 // armoured body with a glowing molten core
 shape(c,[[-20,-40],[-6,-74,'q',-22,-70],[16,-76,'q',8,-82],[24,-40,'q',30,-58],[0,-26,'q',18,-24],[-20,-40,'q',-20,-28]]);ink(c,lg(c,-82,-24,['#ff9a3a','#d8341a','#5a0c08']),2.6);
 c.save();c.clip();for(let i=0;i<5;i++){c.beginPath();rr(c,-10+i*1.5,-70+i*8,24-i*2.4,6,3);ink(c,lg(c,-70+i*8,-64+i*8,['#ffe27a','#d89a20']),1.1);}c.restore();
 glow(c,4,-52,22,'#ffd060',.8);
 wing(1,-1.35,8,44);
 // long neck + crowned screaming head
 c.beginPath();c.moveTo(4,-72);c.bezierCurveTo(4,-92,20,-96,22,-110);c.lineWidth=16;c.strokeStyle=INK;c.lineCap='round';c.stroke();c.lineWidth=12.4;c.strokeStyle='#ff6a1a';c.stroke();
 c.save();c.translate(22,-112);c.scale(1.7,1.7);
 for(let i=0;i<5;i++){c.beginPath();c.moveTo(-3+i*1.4,-5);c.lineTo(-10+i*3.4,-16-(i===2?5:0));c.lineTo(-1+i*1.4,-4);c.closePath();ink(c,GOLD,1);}
 shape(c,[[-8,4],[-6,-6,'q',-9,-2],[6,-8,'q',0,-10],[10,2,'q',12,-4],[-8,4,'q',0,8]]);ink(c,lg(c,-10,6,PH),1.6);
 c.beginPath();c.moveTo(8,-4);c.quadraticCurveTo(18,-6,19,1);c.quadraticCurveTo(15,-1,9,0);c.closePath();ink(c,GOLD,1.1);
 c.beginPath();c.moveTo(9,1.4);c.quadraticCurveTo(15,4,16,9);c.quadraticCurveTo(12,6,8.4,4);c.closePath();ink(c,GOLD,1.1);c.beginPath();c.moveTo(9,.4);c.lineTo(15,2.6);c.lineTo(9,3.6);c.fillStyle='#5a0808';c.fill();
 beye(c,3,-2,2.4,2,t,'#fff0a0','rgba(255,220,120,.95)');c.restore();
 for(let i=0;i<10;i++){const k=(t*.45+i/10)%1;glow(c,-40+i*9+Math.sin(t+i)*5,-6-k*110,4*(1-k)+1.2,'#ffb040',1-k);}};

/* 기린 · 괴수: bull-sized armoured titan, crown of glowing antlers, roaring dragon head, huge flame mane */
const qilinT=(c,m)=>{const t=m.t,s=Math.sin(m.ph)*.06;glow(c,4,-60,84,'#ffe08a',.24);cloud(c,-26,0,1.4);cloud(c,18,1,1.3);
 for(let i=0;i<5;i++)flameTuft(c,-44,-50,26-i*3,-2.2+i*.28,6,t,FIRE,i);
 const leg=(x,y0,len,o)=>{bleg(c,x,y0,len,10,o,lg(c,0,len,QI),1);flameTuft(c,x-9,y0+len-12,10,-1.9,3,t,FIRE,x);};
 leg(-34,-44,42,s);leg(4,-46,44,-s);
 shape(c,[[-46,-48],[-30,-68,'q',-46,-66],[12,-80,'j',5,2],[36,-56],[30,-34],[-42,-32,'q',-8,-24]]);ink(c,lg(c,-80,-26,QI),2.6);
 c.save();c.clip();scales(c,-44,-76,16,7,6.4,'rgba(150,80,10,.55)');c.beginPath();c.moveTo(-44,-38);c.quadraticCurveTo(-6,-26,32,-38);c.lineWidth=3.4;c.strokeStyle='#c8281a';c.stroke();c.restore();
 // armour saddle plates
 for(let i=0;i<3;i++){c.beginPath();rr(c,-28+i*13,-74+i*1.5,14,9,3);ink(c,lg(c,-74,-64,['#fff2a0','#e8a820','#a86a10']),1.4);ell(c,-21+i*13,-69.5+i*1.5,2,2);ink(c,'#ff3a4a',.8);}
 // thick neck with a towering flame mane
 shape(c,[[18,-76],[32,-104,'q',22,-94],[46,-98],[40,-50,'q',48,-70]]);ink(c,lg(c,-104,-50,QI),2.2);
 for(let i=0;i<9;i++)flameTuft(c,24-i*.8,-72-i*4.4,22-(i%2)*4,-1.5-i*.07,5,t,FIRE,i);
 leg(-24,-44,42,-s);leg(16,-46,44,s);
 qhead(c,46,-110,2.1,2,t);};

/* 청룡 · 괴수: colossal dragon, thick coils looping behind, huge roaring head, four-clawed arms with the pearl */
const dragonT=(c,m)=>{const t=m.t,N=34,pts=[];glow(c,0,-60,92,'#5affd8',.22);
 for(let i=0;i<N;i++){const k=i/(N-1),a=k*Math.PI*2.3+.2;pts.push([Math.cos(a)*(40-k*16)-6+Math.sin(t*1.6-k*5)*2,-56+Math.sin(a)*(26-k*8)+k*36]);}
 cloud(c,-34,0,1.4);cloud(c,10,2,1.3);cloud(c,40,-2,1);
 tube(c,pts.slice().reverse(),3.4,14,t,10);
 flameTuft(c,pts[N-1][0],pts[N-1][1],18,-2.6,5,t,['#0a8a78','#3ae0b8','#d8fff0']);
 for(const i of[3,15]){const[x,y]=pts[i];c.save();c.translate(x,y+8);c.rotate(.15);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-4,8,-1,14);c.lineWidth=7.4;c.strokeStyle=INK;c.lineCap='round';c.stroke();c.lineWidth=5;c.strokeStyle=DR[1];c.stroke();
  for(const a of[-1,-.3,.4,1.1]){c.beginPath();c.moveTo(-1,14);c.quadraticCurveTo(-1+Math.sin(a)*5,14+Math.cos(a)*4,-1+Math.sin(a)*8,14+Math.cos(a)*7);c.lineWidth=2.4;c.strokeStyle=INK;c.stroke();c.lineWidth=1.3;c.strokeStyle='#fffaf0';c.stroke();}c.restore();}
 const[px,py]=pts[3];glow(c,px-2,py+30,18,'#c8fff4',.9);ell(c,px-2,py+30,6.4,6.4);ink(c,rgrad(c,px-2,py+30,6.4,'#e0fbff'),1.4);
 dhead(c,pts[0][0]+16,pts[0][1]-18,2.6,2,t);};

BEAST.phoenix[2]=phoenixT;BEAST.qilin[2]=qilinT;BEAST.dragon[2]=dragonT;
})();

// 백호 baby: minimal line-art chibi, frontal
(()=>{
const K='#141418',W='#f4f4f6',L='#d4d5db',G='#a9aab4',MOUTH='#7a1520';
const poly=(c,pts,fill,lw=1.6)=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(lw){c.lineWidth=lw;c.strokeStyle=K;c.lineJoin='round';c.stroke();}};
const blade=(c,x,y,len,ang,w)=>{c.save();c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(0,-w/2);c.lineTo(len*.6,-w*.3);c.lineTo(len,0);c.lineTo(len*.55,w*.35);c.lineTo(0,w/2);c.closePath();c.fillStyle=K;c.fill();c.restore();};
const rot=(p,o,a)=>{const dx=p[0]-o[0],dy=p[1]-o[1],cs=Math.cos(a),sn=Math.sin(a);return[o[0]+dx*cs-dy*sn,o[1]+dx*sn+dy*cs];};
const glow=(c,x,y,r,col,a=.6)=>{c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();};

/* ---------- baby: like the line-art reference ---------- */
function baby(c,m){const t=m.t,sq=1+Math.sin(t*3)*.02;c.save();c.scale(1/sq,sq);c.lineJoin='round';c.lineCap='round';
 const ol=(lw=1.3)=>{c.lineWidth=lw;c.strokeStyle=K;c.stroke();};
 // tail with black rings, off to the right
 c.save();c.translate(10,-3);c.rotate(-.15+Math.sin(t*2)*.08);c.beginPath();c.moveTo(0,-1.6);c.lineTo(9,-1.8);c.arc(9,0,1.8,-Math.PI/2,Math.PI/2);c.lineTo(0,1.6);c.fillStyle='#fff';c.fill();ol();
 for(const x of[4.5,7.2,9.6]){c.beginPath();rr(c,x-.8,-1.8,1.6,3.6,.6);c.fillStyle=K;c.fill();}c.restore();
 // body + legs (one outline, notch between the feet)
 c.beginPath();c.moveTo(-8.6,-21);c.quadraticCurveTo(-11.4,-12,-10.6,-1.4);c.quadraticCurveTo(-10.4,0,-8.6,0);c.lineTo(-2.4,0);c.quadraticCurveTo(0,-2.4,2.4,0);c.lineTo(8.6,0);c.quadraticCurveTo(10.4,0,10.6,-1.4);c.quadraticCurveTo(11.4,-12,8.6,-21);c.fillStyle='#fff';c.fill();ol();
 // arms resting at the sides
 for(const d of[-1,1]){c.beginPath();c.moveTo(d*7.2,-17);c.quadraticCurveTo(d*6,-10,d*6.8,-5.6);c.quadraticCurveTo(d*7.8,-4.4,d*9.6,-5.4);ol(1.1);
  c.beginPath();c.moveTo(d*10.8,-11);c.lineTo(d*8.6,-10.2);c.lineTo(d*10.6,-9.4);c.closePath();c.fillStyle=K;c.fill();
  c.beginPath();c.moveTo(d*10.6,-6.4);c.lineTo(d*8.8,-6);c.lineTo(d*10.4,-5.2);c.closePath();c.fill();}
 // ears behind the head
 for(const d of[-1,1]){c.beginPath();c.arc(d*11.4,-46.5,4.6,0,TAU);c.fillStyle='#fff';c.fill();ol();}
 // big head
 c.beginPath();c.moveTo(-15.6,-34);c.bezierCurveTo(-16.4,-52,16.4,-52,15.6,-34);c.bezierCurveTo(15.4,-25,9,-21.2,0,-21);c.bezierCurveTo(-9,-21.2,-15.4,-25,-15.6,-34);c.closePath();c.fillStyle='#fff';c.fill();ol();
 // forehead mark
 c.lineWidth=2;c.beginPath();c.moveTo(0,-47);c.lineTo(0,-40.6);c.moveTo(-3.6,-45.6);c.lineTo(3.6,-45.6);c.moveTo(-3,-43);c.lineTo(3,-43);c.stroke();
 // cheek stripes
 for(const d of[-1,1])for(const[y,l]of[[-34,4.4],[-31.4,4],[-28.8,3.4]]){c.beginPath();c.moveTo(d*15.6,y-.9);c.lineTo(d*(15.6-l),y);c.lineTo(d*15.4,y+.9);c.closePath();c.fillStyle=K;c.fill();}
 // eyes (blink now and then)
 const bl=(t%3.4)<.12;for(const d of[-1,1]){if(bl){c.beginPath();c.moveTo(d*5.4-1.2,-35);c.lineTo(d*5.4+1.2,-35);ol(1);}else{ell(c,d*5.4,-35,1.25,1.35);c.fillStyle=K;c.fill();}}
 // muzzle + nose
 c.beginPath();c.moveTo(-1,-32.2);c.quadraticCurveTo(-4.8,-32.6,-4.4,-29.6);c.quadraticCurveTo(-4,-27.6,-1.4,-28.2);c.quadraticCurveTo(0,-29,1.4,-28.2);c.quadraticCurveTo(4,-27.6,4.4,-29.6);c.quadraticCurveTo(4.8,-32.6,1,-32.2);c.fillStyle='#fff';c.fill();ol(1.1);
 ell(c,0,-32.2,1.6,1.1);c.fillStyle=K;c.fill();
 c.restore();}

BEAST.tiger=[baby];
})();

// 백호 youth and adult: real tiger anatomy, flat white/grey with blade stripes; the adult adds a raised claw, mane and ice effects
(()=>{
const K='#141418',W='#f6f6f8',L='#d2d4dc',G='#9a9caa';
const glow=(c,x,y,r,col,a=.6)=>{c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore();};
const out=(c,lw=1.6)=>{c.lineWidth=lw;c.strokeStyle=K;c.lineJoin='round';c.lineCap='round';c.stroke();};
const rot=(p,o,a)=>{const dx=p[0]-o[0],dy=p[1]-o[1],cs=Math.cos(a),sn=Math.sin(a);return[o[0]+dx*cs-dy*sn,o[1]+dx*sn+dy*cs];};
// tapered stripe stroke from (x,y) toward angle, drawn as a filled sliver
function stripe(c,x,y,len,ang,w,bend=.25,col=K){c.save();c.translate(x,y);c.rotate(ang);c.beginPath();c.moveTo(0,-w/2);c.quadraticCurveTo(len*.5,-w*.5+len*bend*.3,len,len*bend*.25);c.quadraticCurveTo(len*.5,w*.5+len*bend*.3,0,w/2);c.closePath();c.fillStyle=col;c.fill();c.restore();}
// shapes
const hindLeg=(c,ox,oy=0)=>{c.beginPath();c.moveTo(-36+ox,-48);c.bezierCurveTo(-53+ox,-46,-53+ox,-28,-45+ox,-20);c.quadraticCurveTo(-41+ox,-14,-42+ox,-5+oy);c.quadraticCurveTo(-42+ox,0+oy,-38+ox,0+oy);c.lineTo(-28+ox,0+oy);c.quadraticCurveTo(-26+ox,-3+oy,-30+ox,-4.5+oy);c.quadraticCurveTo(-32.5+ox,-12,-30+ox,-20);c.quadraticCurveTo(-23+ox,-28,-24+ox,-38);c.closePath();};
const frontLeg=(c,ox,oy=0)=>{c.beginPath();c.moveTo(12+ox,-50);c.bezierCurveTo(7+ox,-36,12+ox,-24,13+ox,-8+oy);c.quadraticCurveTo(13+ox,-1+oy,16+ox,0+oy);c.lineTo(29+ox,0+oy);c.quadraticCurveTo(31+ox,-3+oy,27+ox,-5+oy);c.quadraticCurveTo(25.5+ox,-20,30+ox,-34);c.quadraticCurveTo(32+ox,-45,24+ox,-52);c.closePath();};
const torso=c=>{c.beginPath();c.moveTo(-44,-44);c.bezierCurveTo(-42,-56,-20,-55,-6,-52);c.bezierCurveTo(8,-50,16,-60,28,-58);c.bezierCurveTo(39,-56,41,-40,35,-32);c.bezierCurveTo(30,-24,16,-24,8,-26);c.bezierCurveTo(-8,-24,-24,-30,-34,-30);c.bezierCurveTo(-47,-32,-48,-38,-44,-44);c.closePath();};
function paws(c,ox,oy=0){c.beginPath();for(const x of[-34,-31])c.moveTo(x+ox,-1.6+oy),c.lineTo(x+ox,0+oy);for(const x of[20,23.5])c.moveTo(x+ox,-1.6+oy),c.lineTo(x+ox,0+oy);c.lineWidth=.8;c.strokeStyle=K;c.stroke();}
function tail(c,t,w){const p=[[-44,-46],[-60,-44],[-66,-24],[-58,-12+Math.sin(t*2)*2]],path=()=>{c.beginPath();c.moveTo(...p[0]);c.bezierCurveTo(...p[1],...p[2],...p[3]);};
 c.lineCap='round';path();c.lineWidth=w+3;c.strokeStyle=K;c.stroke();path();c.lineWidth=w;c.strokeStyle=W;c.stroke();c.save();path();c.lineCap='butt';c.setLineDash([3,4]);c.lineWidth=w;c.strokeStyle=K;c.stroke();c.restore();}
// fill a path, add a lower shade band and stripes clipped inside it, then outline
let GLOWS=0;
function fillShaded(c,pathFn,shadeY,stripes,fill=W){pathFn();c.fillStyle=fill;c.fill();c.save();pathFn();c.clip();c.fillStyle=L;c.fillRect(-90,shadeY,200,80);for(const s of stripes){stripe(c,...s);if(GLOWS){const[x,y,l,a,w]=s;stripe(c,x+Math.cos(a)*1,y+Math.sin(a)*1,l*.75,a,w*.38,.25,'#6ae4ff');}}c.restore();pathFn();out(c,1.7);}
// head, side view facing right; open 0 closed snarl .. 1 roar
function head(c,x,y,s,open,t,glowEye){c.save();c.translate(x,y);c.scale(s,s);
 // ear
 c.beginPath();c.moveTo(-8,-9);c.quadraticCurveTo(-9.5,-19,-3,-17.5);c.quadraticCurveTo(0,-14,-.6,-10);c.closePath();c.fillStyle=W;c.fill();out(c,1.3);
 c.beginPath();c.moveTo(-6.4,-10.6);c.quadraticCurveTo(-7,-16,-3.6,-15.4);c.lineTo(-2.4,-11);c.closePath();c.fillStyle=G;c.fill();
 const H=[4,6.4],a=open*.5,J=[[6,5],[16.4,5],[18,7],[16,9.6],[9,11],[3.6,9]].map(p=>rot(p,H,a));
 // mouth interior + lower jaw
 c.beginPath();c.moveTo(6,4.4);c.lineTo(17.4,1.4);c.lineTo(...J[1]);c.lineTo(...J[2]);c.lineTo(...J[3]);c.lineTo(...J[4]);c.closePath();c.fillStyle='#6e1420';c.fill();
 if(open>.3){c.beginPath();c.ellipse(...rot([11,8],H,a*.7),4.4,1.6,a*.5,0,TAU);c.fillStyle='#c84a5a';c.fill();}
 const lf=rot([14.6,5.6],H,a),lt=rot([14.2,1.8],H,a),lf2=rot([13.2,5.8],H,a);c.beginPath();c.moveTo(...lf2);c.lineTo(...lt);c.lineTo(...lf);c.closePath();c.fillStyle='#fff';c.fill();out(c,.6);
 c.beginPath();c.moveTo(...J[0]);for(const p of J.slice(1))c.lineTo(...p);c.closePath();c.fillStyle=L;c.fill();out(c,1.4);
 // skull
 const sk=()=>{c.beginPath();c.moveTo(-14,3);c.bezierCurveTo(-15,-10,-6,-14,2,-13);c.bezierCurveTo(8,-12.4,12,-9,16,-6.4);c.quadraticCurveTo(20.4,-5.2,20.4,-2);c.quadraticCurveTo(20.2,1,17.4,1.4);c.quadraticCurveTo(12,2,7,4.2);c.lineTo(4,7);
  c.lineTo(1.4,11);c.lineTo(-1.6,8.8);c.lineTo(-4.4,13);c.lineTo(-6.8,9.2);c.lineTo(-10.6,11.4);c.lineTo(-10.4,6.4);c.lineTo(-14.6,6);c.closePath();};
 sk();c.fillStyle=W;c.fill();c.save();sk();c.clip();
 c.beginPath();c.moveTo(-15,2);c.quadraticCurveTo(-4,0,4,-2);c.quadraticCurveTo(10,1,7,6);c.lineTo(-15,14);c.closePath();c.fillStyle=L;c.fill();
 for(const[x,y,l,an,w]of[[1.6,-13.4,6.4,1.95,2],[-1.6,-13,6.6,2.05,2.1],[-5,-11.6,6,2.2,2],[5,-12.6,4.6,1.8,1.6],[-14.6,-2,7,-.15,2],[-14.4,2.4,6,-.05,1.8],[-8,-5,5,.3,1.4]])stripe(c,x,y,l,an,w,.15);
 c.restore();sk();out(c,1.7);
 // upper fang over the lip
 c.beginPath();c.moveTo(14.4,1.8);c.lineTo(15,6.4-(1-open)*1.4);c.lineTo(16.2,1.6);c.closePath();c.fillStyle='#fff';c.fill();out(c,.6);
 // lip snarl wrinkle when closed
 if(open<.3){c.beginPath();c.moveTo(13,-3.4);c.quadraticCurveTo(15,-2.2,16.6,-3.2);c.moveTo(12.4,-1.6);c.quadraticCurveTo(14.4,-.6,16,-1.4);c.lineWidth=.7;c.strokeStyle=K;c.stroke();}
 // nose
 c.beginPath();c.moveTo(17.2,-5);c.quadraticCurveTo(21,-5.2,20.8,-2.2);c.quadraticCurveTo(19,-1.2,17.4,-2.4);c.closePath();c.fillStyle=K;c.fill();
 // eye with a heavy brow
 c.beginPath();c.moveTo(3,-5.6);c.quadraticCurveTo(6,-8.4,9.4,-7.4);c.quadraticCurveTo(7,-4.8,3,-5.6);c.closePath();c.fillStyle=glowEye?'#c8f6ff':'#ffd27a';c.fill();out(c,.9);
 ell(c,6.6,-6.6,.8,1.2);c.fillStyle=K;c.fill();
 c.beginPath();c.moveTo(1.6,-7.6);c.lineTo(10.4,-10);c.lineTo(10,-8.4);c.lineTo(2.6,-6.6);c.closePath();c.fillStyle=K;c.fill();
 if(glowEye){glow(c,6.4,-6.6,5,'#5ad8ff',.8);c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(9,-7.6,24,-10);g.addColorStop(0,'rgba(120,230,255,.9)');g.addColorStop(1,'rgba(0,0,0,0)');c.beginPath();c.moveTo(9,-8.4);c.lineTo(24,-10.6+Math.sin(t*6)*.6);c.lineTo(9,-6.8);c.closePath();c.fillStyle=g;c.fill();c.restore();}
 // whiskers
 c.lineWidth=.5;c.strokeStyle='rgba(20,20,24,.6)';for(let i=0;i<2;i++){c.beginPath();c.moveTo(14,-.4+i);c.quadraticCurveTo(18,1+i,22,.6+i*1.6);c.stroke();}
 c.restore();}
const bodyStripes=[[-38,-58,14,1.75,3.4],[-30,-58,15,1.68,3.6],[-22,-58,15,1.62,3.6],[-14,-58,14,1.57,3.4],[-6,-58,13,1.5,3.2],[2,-60,12,1.42,3],[10,-62,12,1.36,2.8]];
function tiger(c,t,ph,adult){GLOWS=adult;
 if(adult){// aura + rune circle
  glow(c,4,-40,90,'#3ab8ff',.28);glow(c,4,-30,50,'#bff4ff',.18);
  c.save();c.translate(0,1);c.scale(1,.28);const R=58;c.lineWidth=2.6;c.strokeStyle='rgba(120,220,255,.85)';c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.lineWidth=1.4;c.beginPath();c.arc(0,0,R*.8,0,TAU);c.stroke();
   for(let i=0;i<12;i++){const a=i/12*TAU+t*.6;c.save();c.rotate(a);c.beginPath();c.moveTo(R*.8,0);c.lineTo(R,0);c.moveTo(R*.9,-4);c.lineTo(R*.9,4);c.stroke();c.restore();}
   for(let i=0;i<6;i++){const a=i/6*TAU-t*.4;c.beginPath();c.moveTo(Math.cos(a)*R*.8,Math.sin(a)*R*.8);c.lineTo(Math.cos(a+TAU/3)*R*.8,Math.sin(a+TAU/3)*R*.8);c.stroke();}c.restore();
 }
 if(adult){// ground cracks + frost wind
  c.beginPath();c.moveTo(-40,1);c.lineTo(-22,-.5);c.lineTo(-12,2);c.lineTo(6,0);c.lineTo(26,2);c.lineTo(40,.5);c.moveTo(-12,2);c.lineTo(-9,5.4);c.moveTo(6,0);c.lineTo(9,4);c.lineWidth=1.2;c.strokeStyle='rgba(0,0,0,.4)';c.stroke();
  for(let i=0;i<4;i++){const k=(t*.7+i*.25)%1,y=-74+i*15;c.beginPath();c.moveTo(-70+k*40,y);c.quadraticCurveTo(-50+k*40,y-5,-30+k*40,y);c.lineWidth=1.6;c.strokeStyle=`rgba(190,235,255,${.55*(1-k)})`;c.stroke();}
  for(let i=0;i<8;i++){const k=(t*.4+i/8)%1;glow(c,-50+i*14+Math.sin(t+i)*4,-6-k*70,2.6*(1-k)+.8,'#bff4ff',1-k);}}
 tail(c,t,adult?6:5);
 if(adult){const tx=-58,ty=-12+Math.sin(t*2)*2;for(let i=0;i<3;i++){const k=1-i*.3;c.save();c.translate(tx,ty);c.rotate(2.6+Math.sin(t*7+i)*.15);c.beginPath();c.moveTo(-3.4*k,0);c.quadraticCurveTo(-3.4*k,-9*k,0,-14*k);c.quadraticCurveTo(3.4*k,-9*k,3.4*k,0);c.closePath();c.fillStyle=['#2a8ae0','#6ae4ff','#eafcff'][i];c.fill();c.restore();}glow(c,tx,ty,9,'#6ae4ff',.6);}
 c.save();c.translate(6,0);fillShaded(c,()=>hindLeg(c,0),-14,[],L);paws(c,0);fillShaded(c,()=>frontLeg(c,0),-10,[],L);c.restore();
 fillShaded(c,()=>torso(c),-32,bodyStripes);
 if(adult){// flowing neck mane: white locks sweeping back over the shoulders
  for(let i=0;i<7;i++){const a=-3.45+i*.12+Math.sin(t*2+i)*.03,Lm=28+(i%3)*6,Wd=6-(i%2);c.save();c.translate(30,-60);c.rotate(a);
   c.beginPath();c.moveTo(0,-Wd);c.bezierCurveTo(Lm*.45,-Wd*1.3,Lm*.8,-Wd*.2,Lm,-Wd*.6-4);c.bezierCurveTo(Lm*.8,Wd*.3,Lm*.5,Wd*1.1,0,Wd);c.closePath();c.fillStyle=W;c.fill();out(c,1.4);
   c.beginPath();c.moveTo(Lm*.45,-Wd*.3);c.quadraticCurveTo(Lm*.7,-Wd*.6,Lm*.92,-Wd*.6-3.4);c.lineWidth=1.6;c.strokeStyle=K;c.lineCap='round';c.stroke();c.restore();}}
 // chest ruff
 c.beginPath();c.moveTo(30,-50);c.lineTo(37,-46);c.lineTo(33,-43);c.lineTo(38,-39);c.lineTo(32,-36);c.lineTo(36,-31);c.lineTo(29,-30);c.closePath();c.fillStyle=W;c.fill();out(c,1.3);
 fillShaded(c,()=>hindLeg(c,0),-14,[[-50,-40,10,.35,3],[-50,-32,9,.2,2.8],[-46,-22,6,.1,2.2]]);
 const fl=[[30,-34,7,Math.PI-.1,2.4],[28,-24,6,Math.PI,2.2],[28,-15,5,Math.PI,2]];
 if(adult){// near front leg raised forward, claws out
  const sw=Math.sin(t*3)*.06;c.save();c.translate(22,-48);c.rotate(-.55+sw);c.translate(-22,48);fillShaded(c,()=>frontLeg(c,0),-10,fl);paws(c,0);
  for(let i=0;i<4;i++){const x=27+i*1.7;c.beginPath();c.moveTo(x,-1.4);c.quadraticCurveTo(x+3.6,-1.2,x+3.2,2.6);c.quadraticCurveTo(x+1.4,.2,x,-.2);c.closePath();c.fillStyle='#fff';c.fill();out(c,.6);}c.restore();
  // the other front leg now carries the weight
  c.save();c.translate(-2,0);fillShaded(c,()=>frontLeg(c,0),-10,fl);paws(c,0);c.restore();}
 else{fillShaded(c,()=>frontLeg(c,0),-10,fl);paws(c,0);}
 head(c,adult?40:38,adult?-60:-58,adult?1.28:1.08,adult?.85+Math.sin(t*3)*.08:.05,t,adult);
 if(adult){
  // roar shockwave rings from the mouth
  for(let i=0;i<3;i++){const k=(t*1.2+i/3)%1;c.save();c.translate(64,-56);c.beginPath();c.ellipse(0,0,6+k*34,4+k*22,0,-1.1,1.1);c.lineWidth=3*(1-k)+.5;c.strokeStyle=`rgba(190,240,255,${.8*(1-k)})`;c.stroke();c.restore();}
  // orbiting ice shards
  for(let i=0;i<6;i++){const a=t*1.1+i/6*TAU,x=Math.cos(a)*62,y=-40+Math.sin(a)*14,front=Math.sin(a)>0,sz=front?4.4:3;if(!front)continue;
   c.save();c.translate(x,y);c.rotate(a*2);c.beginPath();c.moveTo(0,-sz*1.6);c.lineTo(sz*.7,0);c.lineTo(0,sz*1.6);c.lineTo(-sz*.7,0);c.closePath();const g=c.createLinearGradient(0,-sz*1.6,0,sz*1.6);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#5ac8ff');c.fillStyle=g;c.fill();c.lineWidth=.9;c.strokeStyle='#1a5a9a';c.stroke();c.restore();glow(c,x,y,9,'#7ae0ff',.5);}
  // frost lightning around the paws
  for(const[x0,y0]of[[-30,-2],[14,-2],[42,-10]]){if(Math.sin(t*9+x0)<.2)continue;c.beginPath();c.moveTo(x0,y0);let x=x0,y=y0;for(let k=0;k<4;k++){x+=(Math.sin(t*37+k*3+x0)*.5+.2)*7;y-=3+Math.abs(Math.sin(t*23+k))*4;c.lineTo(x,y);}c.lineWidth=1.4;c.strokeStyle='rgba(200,245,255,.9)';c.stroke();glow(c,x,y,6,'#9aeaff',.6);}
  // rising snow sparkles
  for(let i=0;i<10;i++){const k=(t*.35+i/10)%1,x=-56+i*12+Math.sin(t*1.3+i)*5,y=-4-k*90;c.save();c.translate(x,y);c.rotate(t+i);c.globalAlpha=1-k;c.strokeStyle='#eafcff';c.lineWidth=.9;for(let j=0;j<3;j++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(-2.4,0);c.lineTo(2.4,0);c.stroke();}c.restore();}
 }
 GLOWS=0;}
BEAST.tiger[1]=(c,m)=>{c.save();c.scale(.78,.78);tiger(c,m.t,m.ph,0);c.restore();};
BEAST.tiger[2]=(c,m)=>{glow(c,0,-44,84,'#9ad8ff',.2);c.save();c.scale(1.18,1.18);tiger(c,m.t,m.ph,1);c.restore();};
})();

// 물개 · 펭귄 · 북극여우 · 갈매기: common pets with 2 stages, [0] baby (C~A), [1] adult (S~SSS)
(()=>{
const{beye,blade,lg,shape,ink,glow,babyHead}=BEAST._;const INK='#15131c';
const flip=(c,x,y,rx,ry,rot,fill,lw=1.6)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);ink(c,fill,lw);};
const whisk=(c,x,y,d=1)=>{c.lineWidth=.6;c.strokeStyle='rgba(20,20,30,.6)';for(let i=0;i<3;i++){c.beginPath();c.moveTo(x,y+i*1.2);c.quadraticCurveTo(x+d*4,y-1+i*1.4,x+d*8,y-1.6+i*2.2);c.stroke();}};
const SEAL=['#ffffff','#f2f4f8','#cdd4e2'],GREY=['#c8d0dc','#9aa6b8','#6a768a'],PEN=['#3a4258','#262c3c','#141824'],FOX=['#ffffff','#f6f2ea','#d6d2ca'],GULL=['#ffffff','#f2f4f6','#c8ccd4'],CHICK=['#d8dce4','#b8bec8','#8a92a0'];
Object.assign(BEAST,{
 seal:[
  // pup: fluffy white, lying, big glossy eyes
  (c,m)=>{const t=m.t,b=Math.sin(t*2)*.5;
   shape(c,[[-20,-2],[-18,-12,'q',-24,-10],[2,-16,'q',-8,-18],[10,-3],[-20,-2,'q',-4,1]]);ink(c,lg(c,-18,0,SEAL),1.8);
   flip(c,-20,-4,5,2.6,-.5,lg(c,-7,0,SEAL),1.4);flip(c,-21,-1,5,2.4,.4,lg(c,-3,1,SEAL),1.4);flip(c,2,-1.6,5,2.4,-.2,lg(c,-4,1,SEAL),1.4);
   babyHead(c,6,-18+b,1.15,SEAL,'#ffffff','#2a2a3a',L=>{if(L==='front'){whisk(c,6,5,1);whisk(c,-6,5,-1);}});},
  // adult: sleek grey seal sitting up on its flippers, spotted, cocky look
  (c,m)=>{const t=m.t,sw=Math.sin(t*2)*.08;
   flip(c,-20,-3,9,3.4,.25,lg(c,-6,1,GREY),1.6);flip(c,-24,-6,8,3,-.5,lg(c,-9,-3,GREY),1.6);
   shape(c,[[-18,-4],[-8,-26,'q',-18,-20],[8,-42,'q',0,-40],[16,-30,'q',18,-38],[10,-4,'q',16,-14],[-18,-4,'q',-4,2]]);ink(c,lg(c,-44,0,GREY),2);
   c.save();c.clip?0:0;c.restore();for(const[x,y,r]of[[-8,-14,1.6],[-2,-20,1.2],[2,-12,1.4],[-12,-8,1.2],[4,-26,1]]){ell(c,x,y,r,r*.8);c.fillStyle='rgba(60,70,90,.55)';c.fill();}
   ell(c,4,-16,6,9);c.fillStyle='rgba(235,240,248,.6)';c.fill();
   c.save();c.translate(10,-22);c.rotate(.5+sw);flip(c,4,0,8,3,0,lg(c,-3,3,GREY),1.5);c.restore();
   // head
   shape(c,[[2,-36],[6,-48,'q',2,-46],[18,-48,'q',13,-52],[24,-42,'q',24,-46],[16,-36,'q',22,-36]]);ink(c,lg(c,-52,-34,GREY),1.8);
   ell(c,22,-42.4,1.4,1);c.fillStyle=INK;c.fill();whisk(c,21,-40.4,1);
   c.beginPath();c.moveTo(18,-39);c.quadraticCurveTo(20.4,-37.6,22.6,-39.2);c.lineWidth=1;c.strokeStyle=INK;c.stroke();
   beye(c,14,-44,2.2,1,t,'#3a3040');}],
 penguin:[
  // chick: fluffy grey down, white face mask
  (c,m)=>{const t=m.t,b=Math.abs(Math.sin(m.ph*.6))*1.2;c.translate(0,-b);
   for(const x of[-4,4]){shape(c,[[x-3,0],[x,-3],[x+3,0]]);ink(c,'#ff9a3a',1);}
   shape(c,[[-11,-4],[-12,-18,'q',-14,-10],[0,-22,'q',-8,-24],[12,-18,'q',8,-24],[11,-4,'q',14,-10],[-11,-4,'q',0,2]]);ink(c,lg(c,-24,0,CHICK),1.8);
   for(const d of[-1,1])flip(c,d*12,-12,2.6,6,d*.4,lg(c,-18,-6,CHICK),1.4);
   babyHead(c,0,-26,1.1,['#2e3446','#262c3c','#141824'],'#ffffff','#5a6a8a',L=>{if(L==='mid'){ell(c,0,1.6,8.6,7.4);c.fillStyle='#ffffff';c.fill();}
    if(L==='front'){c.beginPath();c.moveTo(-1.6,3.2);c.lineTo(1.6,3.2);c.lineTo(0,5.6);c.closePath();ink(c,'#ffb03a',.9);}});},
  // adult: emperor-style penguin standing tall, golden neck patch, flippers out
  (c,m)=>{const t=m.t,fl=Math.sin(t*3)*.1;
   for(const x of[-5,5]){shape(c,[[x-4,0],[x,-3],[x+4,0]]);ink(c,'#ff9a3a',1.1);}
   shape(c,[[-12,-4],[-14,-30,'q',-16,-16],[0,-50,'q',-12,-48],[12,-36,'q',10,-48],[12,-4,'q',16,-18],[-12,-4,'q',0,2]]);ink(c,lg(c,-50,0,PEN),2);
   shape(c,[[-6,-4],[-8,-28,'q',-9,-14],[4,-38,'q',-4,-38],[8,-4,'q',10,-20]]);c.fillStyle=lg(c,-38,-4,['#ffffff','#f4f6fa','#d8dce6']);c.fill();
   ell(c,5,-36,4,3.6);c.fillStyle=lg(c,-40,-32,['#ffe27a','#ffb02a']);c.fill();
   for(const[d,x]of[[-1,-12.5],[1,11.5]]){c.save();c.translate(x,-32);c.rotate(-d*(.35+fl));flip(c,0,8,3,10,0,lg(c,-2,18,PEN),1.5);c.restore();}
   c.beginPath();c.moveTo(9,-44);c.lineTo(20,-41);c.lineTo(9,-39.4);c.closePath();ink(c,lg(c,-44,-39,['#ffb84a','#ff6a2a']),1.1);
   beye(c,5,-44,2,1,t,'#3a3040');}],
 fox:[
  // kit: big ears, fluffy tail, cute
  (c,m)=>{const t=m.t,tw=Math.sin(t*2.4)*.15;
   c.save();c.translate(-10,-6);c.rotate(-.6+tw);shape(c,[[0,-3],[-14,-10,'q',-8,-12],[-18,-2,'q',-20,-8],[0,3,'q',-10,4]]);ink(c,lg(c,-12,4,FOX),1.6);c.restore();
   shape(c,[[-12,-3],[-11,-16,'q',-15,-10],[2,-18,'q',-6,-20],[10,-4,'q',12,-14],[-12,-3,'q',0,1]]);ink(c,lg(c,-20,0,FOX),1.8);
   for(const x of[-6,5]){ell(c,x,-1.5,4,2.6);ink(c,lg(c,-4,1,FOX),1.3);}
   babyHead(c,2,-24,1.15,FOX,'#ffffff','#6a8ac8',L=>{if(L==='back')for(const d of[-1,1]){c.save();c.translate(d*7,-7);c.rotate(d*.35);shape(c,[[-4.4,3],[0,-10],[4.4,3]]);ink(c,lg(c,-10,3,FOX),1.5);shape(c,[[-2.2,2],[0,-6],[2.2,2]]);c.fillStyle='#f4c0c8';c.fill();c.restore();}});},
  // adult: elegant fox standing, huge fluffy tail, pointed snout, sly eye
  (c,m)=>{const t=m.t,tw=Math.sin(t*2)*.12,s=Math.sin(m.ph)*.15;
   c.save();c.translate(-16,-22);c.rotate(-.2+tw);shape(c,[[0,-4],[-12,-18,'q',-4,-16],[-30,-14,'q',-24,-22],[-26,0,'q',-34,-4],[0,4,'q',-12,6]]);ink(c,lg(c,-22,6,FOX),1.8);c.restore();
   const leg=(x,o)=>{c.save();c.translate(x,-18);c.rotate(o);shape(c,[[-3.4,0],[-2.4,18],[2.6,18],[3.6,0]]);ink(c,lg(c,0,18,FOX),1.5);ell(c,.4,18,3.6,1.8);ink(c,'#ffffff',1.2);c.restore();};
   leg(-12,s);leg(6,-s);
   shape(c,[[-18,-24],[-12,-32,'q',-18,-32],[8,-34,'q',-2,-36],[14,-24,'q',14,-30],[6,-17,'q',12,-17],[-16,-17,'q',-4,-15]]);ink(c,lg(c,-36,-15,FOX),2);
   leg(-8,-s);leg(10,s);
   c.save();c.translate(16,-40);for(const dx of[-4,2]){c.save();c.translate(dx,-4);c.rotate(dx*.06);shape(c,[[-3.6,3],[0,-9],[3.6,3]]);ink(c,lg(c,-9,3,FOX),1.4);c.restore();}
   shape(c,[[-8,4],[-6,-5,'q',-9,-2],[4,-6,'q',-2,-8],[16,1,'q',10,-3],[4,6,'q',12,6],[-8,4,'q',-2,8]]);ink(c,lg(c,-8,7,FOX),1.8);
   ell(c,16,1,1.2,1);c.fillStyle=INK;c.fill();c.beginPath();c.moveTo(8,3.6);c.quadraticCurveTo(11,4.6,14,2.6);c.lineWidth=.9;c.strokeStyle=INK;c.stroke();
   beye(c,4,-1.4,2,1,t,'#e8a020');c.restore();}],
 gull:[
  // chick: speckled grey fluff, little beak
  (c,m)=>{const t=m.t,b=Math.abs(Math.sin(m.ph*.6))*1.2;c.translate(0,-b);
   for(const x of[-3,4]){c.beginPath();c.moveTo(x,-3);c.lineTo(x,0);c.moveTo(x-2,1);c.lineTo(x,0);c.lineTo(x+2,1);c.lineWidth=1.3;c.strokeStyle='#d88a3a';c.stroke();}
   shape(c,[[-11,-4],[-12,-16,'q',-14,-10],[0,-20,'q',-8,-22],[11,-16,'q',8,-22],[10,-4,'q',13,-10],[-11,-4,'q',0,2]]);ink(c,lg(c,-22,0,CHICK),1.8);
   for(const[x,y]of[[-6,-12],[-2,-8],[4,-11],[6,-6],[-8,-6]]){ell(c,x,y,1,.8);c.fillStyle='rgba(60,60,80,.5)';c.fill();}
   flip(c,-11,-11,2.4,5,.4,lg(c,-16,-6,CHICK),1.3);
   babyHead(c,0,-24,1.05,CHICK,'#ffffff','#3a3a4a',L=>{if(L==='front'){c.beginPath();c.moveTo(-1.8,3);c.lineTo(1.8,3);c.lineTo(0,6);c.closePath();ink(c,'#3a3a46',.9);}});},
  // adult: gull hovering with spread wings, yellow beak with a red spot
  (c,m)=>{const t=m.t,fl=Math.sin(t*8)*.35;c.translate(0,-30);
   const wing=(d,a)=>{c.save();c.translate(-2,-2);c.rotate(a);shape(c,[[0,0],[-16,-10,'q',-6,-10],[-30,-6,'q',-24,-12],[-28,-2],[-14,1,'q',-20,2],[0,3]]);ink(c,lg(c,-12,3,['#e8ecf2','#b8c0cc']),1.6);
    c.beginPath();c.moveTo(-28,-2.4);c.lineTo(-22,-6.6);c.lineTo(-20,-1);c.closePath();c.fillStyle=INK;c.fill();c.restore();};
   wing(-1,.75+fl);
   blade(c,-10,0,10,2.9,4,lg(c,-3,3,GULL),1.4);
   shape(c,[[-12,0],[-6,-7,'q',-12,-6],[8,-8,'q',2,-10],[14,-2,'q',14,-6],[4,4,'q',12,4],[-12,0,'q',-6,4]]);ink(c,lg(c,-10,4,GULL),1.8);
   shape(c,[[8,-8],[10,-15,'q',7,-13],[17,-15,'q',14,-17],[18,-8,'q',20,-12],[12,-5]]);ink(c,lg(c,-17,-5,GULL),1.7);
   c.beginPath();c.moveTo(17,-12);c.lineTo(26,-10.4);c.quadraticCurveTo(25,-8.6,22,-8.8);c.lineTo(17,-9.6);c.closePath();ink(c,'#ffd23a',1.1);ell(c,23.4,-9.4,.8,.6);c.fillStyle='#e83a2a';c.fill();
   beye(c,14,-12,1.8,1,t,'#e8c040');
   wing(1,.35+fl*.8);}]
});
})();
