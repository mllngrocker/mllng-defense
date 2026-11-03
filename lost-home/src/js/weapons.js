/* ---------- weapon art: grip at origin, weapon points to -y. Used in the paw, icons and projectiles ---------- */
const WL=58;
function woodG(c,col){const g=c.createLinearGradient(-5,0,5,0);g.addColorStop(0,shade(col,-.35));g.addColorStop(.45,shade(col,.15));g.addColorStop(1,shade(col,-.45));return g;}
function grip(c,y=-7,col='#3e4a5e'){rr(c,-6,y,12,13,2);c.fillStyle=col;c.fill();c.lineWidth=1.2;c.strokeStyle=FUR.line;c.stroke();}
function glowLine(c,col,t,x0,y0,x1,y1,w=2){c.save();c.globalCompositeOperation='lighter';c.shadowColor=col;c.shadowBlur=12;c.strokeStyle=col;c.globalAlpha=.6+.3*Math.sin(t*5);c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore();}
const WSHAPE={
 plank(c,it,t){rr(c,-5,-WL,10,WL+6,2.5);c.fillStyle=woodG(c,it.col);c.fill();c.lineWidth=1.6;c.strokeStyle=FUR.line;c.stroke();
  c.strokeStyle='rgba(70,40,15,.4)';c.lineWidth=.9;for(const x of[-2,1.5]){c.beginPath();c.moveTo(x,-WL+3);c.bezierCurveTo(x+1.5,-WL*.6,x-1.5,-WL*.3,x,4);c.stroke();}
  for(const y of[-WL+7,-WL*.5]){ell(c,0,y,1.4,1.4);c.fillStyle='#9aa0a8';c.fill();}
  if(it.ult==='rainbow'||it.ult==='holy'){c.save();c.globalCompositeOperation='lighter';c.shadowColor=it.col;c.shadowBlur=16;c.strokeStyle=it.ult==='holy'?'rgba(255,240,170,.8)':`hsla(${(t*120)%360},90%,70%,.8)`;c.lineWidth=2.2;c.strokeRect(-5,-WL,10,WL+6);c.restore();}
  grip(c);},
 nailplank(c,it,t){WSHAPE.plank(c,it,t);for(let i=0;i<5;i++){const y=-WL+6+i*7,s=i%2?1:-1;c.beginPath();c.moveTo(s*5,y);c.lineTo(s*11,y-2);c.lineWidth=1.6;c.strokeStyle='#9aa0a8';c.stroke();}},
 umbrella(c,it){rr(c,-1.5,-WL,3,WL+4,1);fs(c,'#3a3a46',1);c.beginPath();c.moveTo(0,-WL+2);c.lineTo(-11,-WL+30);c.quadraticCurveTo(-3,-WL+26,0,-WL+32);c.quadraticCurveTo(4,-WL+22,9,-WL+26);c.closePath();fs(c,lgrad(c,-WL,-WL+30,it.col),1.4);
  c.beginPath();c.arc(-4,2,4,0,Math.PI);c.lineWidth=2.4;c.strokeStyle='#3a2a20';c.stroke();},
 mop(c,it){rr(c,-2,-WL+8,4,WL,1.5);fs(c,'#c8a070',1.2);for(let i=0;i<9;i++){c.beginPath();c.moveTo(-6+i*1.5,-WL+10);c.quadraticCurveTo(-10+i*2.5,-WL,-8+i*2,-WL-8);c.lineWidth=2.2;c.strokeStyle=i%2?'#e8eef6':it.col;c.stroke();}rr(c,-7,-WL+8,14,5,2);fs(c,'#5a6a8a',1.2);},
 squeak(c,it){rr(c,-2,-WL+18,4,WL-12,1.5);fs(c,'#ffd23a',1.2);rr(c,-12,-WL,24,20,8);fs(c,lgrad(c,-WL,-WL+20,it.col),1.6);rr(c,-14,-WL+4,4,12,2);fs(c,'#ffd23a',1.2);rr(c,10,-WL+4,4,12,2);fs(c,'#ffd23a',1.2);gloss(c,-4,-WL+5,5,2.5,.5);},
 bat(c,it){c.beginPath();c.moveTo(-2.5,6);c.lineTo(-5.5,-WL);c.quadraticCurveTo(0,-WL-5,5.5,-WL);c.lineTo(2.5,6);c.closePath();fs(c,woodG(c,it.col),1.5);rr(c,-3,-2,6,9,2);fs(c,'#2a2a3a',1.2);},
 pipe(c,it){rr(c,-3.5,-WL,7,WL+6,2);fs(c,metalX(c,-4,4,it.col),1.5);for(const[y,r]of[[-WL*.7,3],[-WL*.35,2.2]]){ell(c,1,y,r,r*1.4);c.fillStyle='rgba(150,80,35,.6)';c.fill();}rr(c,-4.5,-WL,9,6,1.5);fs(c,metalX(c,-5,5,it.col),1.2);},
 fish(c,it){c.beginPath();c.moveTo(0,6);c.bezierCurveTo(-9,-10,-9,-WL+8,0,-WL-2);c.bezierCurveTo(9,-WL+8,9,-10,0,6);c.closePath();const g=c.createLinearGradient(-8,0,8,0);g.addColorStop(0,'#5a7a9a');g.addColorStop(.5,'#c8d8e8');g.addColorStop(1,it.col);c.fillStyle=g;c.fill();c.lineWidth=1.5;c.strokeStyle=FUR.line;c.stroke();
  c.beginPath();c.moveTo(0,4);c.lineTo(-7,12);c.lineTo(7,12);c.closePath();fs(c,'#7a9ab8',1.3);ell(c,-2,-WL+6,1.6,1.6);c.fillStyle='#111';c.fill();c.fillStyle='rgba(220,240,255,.6)';for(let i=0;i<5;i++){ell(c,(i%2?3:-3),-WL+16+i*8,1.6,1);c.fill();}},
 shovel(c,it){rr(c,-2,-WL+18,4,WL-12,1.5);fs(c,'#a07850',1.2);c.beginPath();c.moveTo(-9,-WL+20);c.lineTo(-9,-WL+4);c.quadraticCurveTo(0,-WL-6,9,-WL+4);c.lineTo(9,-WL+20);c.closePath();fs(c,metal(c,-WL-4,-WL+20,it.col),1.5);rr(c,-6,2,12,5,2);fs(c,'#3a3a46',1.2);},
 pan(c,it){rr(c,-2.4,-28,4.8,34,2);fs(c,'#2a1a14',1.3);ell(c,0,-42,15,15);fs(c,metal(c,-57,-27,it.col),1.6);ell(c,0,-42,11,11);c.fillStyle=shade(it.col,-.3);c.fill();ell(c,-4,-47,4,2.5,-.5);c.fillStyle='rgba(255,255,255,.35)';c.fill();},
 surf(c,it){c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-10,-6,-10,-WL+4,0,-WL-8);c.bezierCurveTo(10,-WL+4,10,-6,0,8);c.closePath();fs(c,lgrad(c,-WL,8,it.col),1.6);c.beginPath();c.moveTo(0,4);c.lineTo(0,-WL-4);c.lineWidth=2;c.strokeStyle='#ffffff';c.stroke();c.beginPath();c.moveTo(-6,-20);c.lineTo(6,-24);c.strokeStyle='#ff6a3a';c.stroke();},
 crowbar(c,it){c.beginPath();c.moveTo(-2.5,6);c.lineTo(-2.5,-WL+4);c.quadraticCurveTo(-2.5,-WL-6,8,-WL-4);c.lineTo(8,-WL+1);c.quadraticCurveTo(2.5,-WL,2.5,-WL+6);c.lineTo(2.5,6);c.closePath();fs(c,metalX(c,-3,3,it.col),1.5);},
 hockey(c,it){rr(c,-2.2,-WL+4,4.4,WL+2,1.5);fs(c,'#e8d8b8',1.2);c.beginPath();c.moveTo(-2.2,-WL+6);c.lineTo(-2.2,-WL-2);c.lineTo(14,-WL-4);c.lineTo(14,-WL+4);c.closePath();fs(c,it.col,1.4);rr(c,-3,-12,6,12,1.5);fs(c,'#1a1a24',1.1);},
 axe(c,it){rr(c,-2.4,-WL,4.8,WL+6,2);fs(c,'#6a4428',1.3);c.beginPath();c.moveTo(1,-WL+2);c.quadraticCurveTo(20,-WL-2,22,-WL+20);c.quadraticCurveTo(12,-WL+16,1,-WL+18);c.closePath();fs(c,metal(c,-WL-2,-WL+20,it.col),1.4);c.beginPath();c.moveTo(18,-WL+2);c.quadraticCurveTo(23,-WL+10,21,-WL+19);c.lineWidth=2;c.strokeStyle='#e8eef6';c.stroke();},
 sledge(c,it){rr(c,-2.4,-WL+10,4.8,WL-4,2);fs(c,'#8a6040',1.3);rr(c,-14,-WL-4,28,16,3);fs(c,metal(c,-WL-4,-WL+12,it.col),1.6);c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;c.beginPath();c.moveTo(-12,-WL-1);c.lineTo(12,-WL-1);c.stroke();},
 great(c,it,t){c.beginPath();c.moveTo(-5,-7);c.lineTo(-5,-WL-6);c.lineTo(0,-WL-14);c.lineTo(5,-WL-6);c.lineTo(5,-7);c.closePath();const gr=c.createLinearGradient(-5,0,5,0);gr.addColorStop(0,shade(it.col,-.4));gr.addColorStop(.5,'#ffffff');gr.addColorStop(1,shade(it.col,-.2));c.fillStyle=gr;c.fill();c.lineWidth=1.4;c.strokeStyle=FUR.line;c.stroke();
  glowLine(c,it.col,t,0,-10,0,-WL-8);rr(c,-12,-9,24,5,2);fs(c,metal(c,-9,-4,'#c8a04a'),1.2);rr(c,-2.5,-4,5,12,1.5);fs(c,'#2a1a14',1.1);},
 rebar(c,it,t){c.beginPath();c.moveTo(-2.5,6);c.lineTo(-2.5,-WL*.55);c.lineTo(2,-WL*.62);c.lineTo(-1,-WL-6);c.lineTo(3.5,-WL-6);c.lineTo(6.5,-WL*.62);c.lineTo(2.5,-WL*.55);c.lineTo(2.5,6);c.closePath();fs(c,metalX(c,-3,6,it.col),1.4);
  c.strokeStyle='rgba(0,0,0,.35)';c.lineWidth=.8;for(let y=-WL;y<0;y+=4){c.beginPath();c.moveTo(-2,y);c.lineTo(2,y+2);c.stroke();}glowLine(c,'#fff36a',t,1,-WL-6,1+Math.sin(t*30)*3,-WL-14,1.6);grip(c);},
 katana(c,it,t){c.beginPath();c.moveTo(-2.4,-6);c.quadraticCurveTo(-1,-WL*.7,4,-WL-10);c.quadraticCurveTo(3,-WL*.7,2.6,-6);c.closePath();const g=c.createLinearGradient(-3,0,3,0);g.addColorStop(0,'#3a3a4a');g.addColorStop(.5,'#f8f0ff');g.addColorStop(1,'#5a4a6a');c.fillStyle=g;c.fill();c.lineWidth=1.2;c.strokeStyle=FUR.line;c.stroke();
  glowLine(c,it.col,t,0,-8,3,-WL-6,2.4);ell(c,0,-6,6,2.4);fs(c,'#1a1a24',1.1);rr(c,-2.4,-5,4.8,14,1.5);fs(c,'#2a1a3a',1.1);},
 // guns: barrel toward -y
 water(c,it){rr(c,-6,-30,12,26,5);fs(c,lgrad(c,-30,-4,it.col),1.5);rr(c,-2.5,-46,5,18,2);fs(c,'#ffd23a',1.3);ell(c,0,-24,5,5);c.fillStyle='rgba(200,240,255,.8)';c.fill();rr(c,-4,-6,8,12,3);fs(c,'#ff7a3a',1.3);},
 sling(c,it){c.beginPath();c.moveTo(0,8);c.lineTo(0,-16);c.lineTo(-9,-34);c.moveTo(0,-16);c.lineTo(9,-34);c.lineCap='round';c.lineWidth=6;c.strokeStyle=FUR.line;c.stroke();c.lineWidth=3.6;c.strokeStyle=it.col;c.stroke();c.beginPath();c.moveTo(-9,-34);c.quadraticCurveTo(0,-24,9,-34);c.lineWidth=1.4;c.strokeStyle='#d84a3a';c.stroke();},
 pistol(c,it){rr(c,-4,-10,8,16,2);fs(c,'#3a3a46',1.3);rr(c,-4,-36,8,28,2);fs(c,metalX(c,-4,4,it.col),1.4);ell(c,0,-36,2,1.2);c.fillStyle='#111';c.fill();},
 revolver(c,it,t){rr(c,-4,-8,8,16,3);fs(c,'#6a3a2a',1.3);rr(c,-3,-44,6,34,1.5);fs(c,metalX(c,-3,3,'#b8bcc8'),1.3);ell(c,0,-14,7,6);fs(c,metal(c,-20,-8,it.col),1.4);for(let i=0;i<3;i++){ell(c,-3+i*3,-14,1,1);c.fillStyle='#222';c.fill();}glowLine(c,'#ffd23a',t,0,-44,0,-46,1);},
 nail(c,it){rr(c,-5,-8,10,14,3);fs(c,'#3a3a46',1.3);rr(c,-7,-36,14,28,4);fs(c,lgrad(c,-36,-8,it.col),1.5);rr(c,-2,-44,4,10,1);fs(c,'#8a8f9e',1.2);},
 rifle(c,it){rr(c,-4,-6,8,14,2);fs(c,'#6a4428',1.3);rr(c,-3.5,-WL,7,WL-4,1.5);fs(c,metalX(c,-4,4,'#5a5a64'),1.3);rr(c,-5,-28,10,22,2);fs(c,woodG(c,it.col),1.3);},
 shotgun(c,it){rr(c,-5,-6,10,14,2);fs(c,woodG(c,'#8a5a30'),1.3);for(const x of[-2.5,2.5]){rr(c,x-2.4,-WL,4.8,WL-6,1.5);fs(c,metalX(c,x-3,x+3,'#4a4a54'),1.2);}rr(c,-5.5,-30,11,12,2);fs(c,woodG(c,'#a06a3a'),1.2);},
 harpoon(c,it){rr(c,-4,-6,8,14,2);fs(c,'#3a3a46',1.3);rr(c,-4,-40,8,36,2);fs(c,metalX(c,-4,4,it.col),1.3);c.beginPath();c.moveTo(0,-40);c.lineTo(0,-WL-6);c.lineWidth=2;c.strokeStyle='#c8ccd6';c.stroke();c.beginPath();c.moveTo(-4,-WL+2);c.lineTo(0,-WL-8);c.lineTo(4,-WL+2);c.fillStyle='#e8eef6';c.fill();},
 mini(c,it,t){rr(c,-7,-8,14,16,3);fs(c,'#3a3a46',1.3);for(let i=0;i<3;i++){rr(c,-6+i*4,-WL,3.4,WL-6,1);fs(c,metalX(c,-6,6,'#6a6a74'),1);}rr(c,-8,-WL+2,16,4,1.5);fs(c,'#2a2a34',1.1);rr(c,-8,-24,16,6,2);fs(c,'#ffd23a',1.1);},
 rail(c,it,t){rr(c,-6,-6,12,14,3);fs(c,'#2a2e3a',1.3);rr(c,-5,-WL,10,WL-4,2);fs(c,metalX(c,-5,5,'#3a4050'),1.4);for(let i=0;i<5;i++){rr(c,-6,-WL+6+i*9,12,3,1);c.fillStyle=it.col;c.globalAlpha=.5+.5*Math.sin(t*8-i);c.fill();c.globalAlpha=1;}glowLine(c,it.col,t,0,-WL,0,-WL-6,3);},
 // throwables (shown in the paw; projectiles reuse PROJ below)
 stone(c,it){ell(c,0,-6,6,5);fs(c,rgrad(c,0,-6,6,it.col),1.4);},
 balloon(c,it){ell(c,0,-10,7,8);fs(c,rgrad(c,0,-10,8,it.col),1.4);gloss(c,-2.5,-13,2,1.4,.7);c.beginPath();c.moveTo(0,-2);c.lineTo(0,3);c.lineWidth=1.4;c.strokeStyle=FUR.line;c.stroke();},
 ice(c,it){c.beginPath();c.moveTo(0,-16);c.lineTo(7,-8);c.lineTo(5,0);c.lineTo(-5,0);c.lineTo(-7,-8);c.closePath();fs(c,lgrad(c,-16,0,it.col),1.4);gloss(c,-2,-9,2,4,.6);},
 star(c,it,t){c.save();c.translate(0,-8);c.rotate(t*0);c.beginPath();for(let i=0;i<8;i++){const r=i%2?3:9,a=i*Math.PI/4;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();fs(c,metal(c,-9,9,it.col),1.3);ell(c,0,0,2,2);c.fillStyle='#222';c.fill();c.restore();},
 star4(c,it){c.save();c.translate(0,-8);c.beginPath();for(let i=0;i<8;i++){const r=i%2?2.6:11,a=i*Math.PI/4+.4;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();fs(c,metal(c,-11,11,it.col),1.3);ell(c,0,0,2.2,2.2);c.fillStyle='#a04aff';c.fill();c.restore();},
 kunai(c,it){for(const dx of[-4,0,4]){c.save();c.translate(dx,0);c.rotate(dx*.04);c.beginPath();c.moveTo(0,-26);c.lineTo(3,-12);c.lineTo(-3,-12);c.closePath();fs(c,metalX(c,-3,3,'#c8ccd6'),1.1);rr(c,-1.2,-12,2.4,12,1);fs(c,'#2a1a2a',1);ell(c,0,1,2,2);c.lineWidth=1.2;c.strokeStyle=FUR.line;c.stroke();c.restore();}},
 book(c,it,t){c.save();c.translate(0,-12);c.rotate(-.1);rr(c,-11,-14,22,28,2.5);fs(c,lgrad(c,-14,14,it.col),1.6);rr(c,-8,-14,16,28,1);c.fillStyle='rgba(255,250,235,.25)';c.fill();
  c.strokeStyle='#e8c870';c.lineWidth=1.2;c.strokeRect(-8,-11,16,22);c.beginPath();c.arc(0,0,5,0,TAU);c.stroke();glowLine(c,shade(it.col,.5),t,-3,0,3,0,1.4);c.restore();},
};
function drawWeapon(c,it,t=0){(WSHAPE[it.shape]||WSHAPE.plank)(c,it,t);}
// projectile art (bear-side): bullets, thrown items, magic orbs
function drawProj(c,p,t){c.save();c.translate(p.x,p.y);
 if(p.kind==='gun'){c.globalCompositeOperation='lighter';const g=c.createLinearGradient(-26*K,0,4*K,0);g.addColorStop(0,'rgba(255,220,120,0)');g.addColorStop(1,p.col==='#5af0ff'?'rgba(150,250,255,1)':'rgba(255,240,180,1)');c.fillStyle=g;c.fillRect(-26*K,-1.6*K,30*K,3.2*K);}
 else if(p.kind==='magic'){c.globalCompositeOperation='lighter';const r=8*K;for(let i=0;i<4;i++){ell(c,-i*7*K,Math.sin(t*20+i)*2*K,r*(1-i*.2),r*(1-i*.2));c.fillStyle=p.col;c.globalAlpha=.35-i*.07;c.fill();}c.globalAlpha=1;
  const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'#fff');g.addColorStop(.4,shade(p.col,.4));g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,r*1.3,0,TAU);c.fill();}
 else{c.rotate(p.spin);c.scale(K*1.1,K*1.1);c.translate(0,8);drawWeapon(c,p.it,t);}
 c.restore();}
/* icons (cached data URLs) for the UI */
const _icon={};
function itemIcon(id,pet,g=0){const k=(pet?'p'+g+':':'')+id;if(_icon[k])return _icon[k];const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d');
 if(pet){c.translate(48,80);c.scale(1.05,1.05);petAura(c,g,1.3,'back');PET_ART[id](c,{t:1,ph:0});petAura(c,g,1.3,'front');}
 else{const it=ITEMS[id];if(it.s==='c'){c.translate(40,150);c.scale(.82,.82);drawBear(c,{t:1,cos:id,atk:-1,kind:'magic'});}
  else if(it.s==='w'){const small=it.k==='throw'||it.k==='magic';if(small){c.translate(48,62);c.scale(2.4,2.4);}else if(it.k==='gun'){c.translate(30,74);c.rotate(.9);c.scale(1.35,1.35);}else{c.translate(28,76);c.rotate(.75);c.scale(1.25,1.25);}drawWeapon(c,it,1);}
  else{c.translate(48,48);const g=c.createRadialGradient(-6,-8,2,0,0,22);g.addColorStop(0,'#fff');g.addColorStop(.45,it.col);g.addColorStop(1,shade(it.col,-.45));
   c.beginPath();c.arc(0,4,20,0,TAU);c.fillStyle=g;c.fill();c.lineWidth=2.5;c.strokeStyle=FUR.line;c.stroke();c.beginPath();c.arc(0,-6,24,Math.PI*1.15,Math.PI*1.85);c.lineWidth=2;c.strokeStyle='#8a7a6a';c.stroke();
   c.shadowColor=it.col;c.shadowBlur=14;ell(c,-6,-3,6,4,-.5);c.fillStyle='rgba(255,255,255,.75)';c.fill();}}
 return _icon[k]=cv.toDataURL();}
