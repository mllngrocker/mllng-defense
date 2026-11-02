/* ---------- equipment, gacha, pets (data + rules) ---------- */
const GRADES=['C','B','A','S','SS','SSS','H'];
const GCOL=['#b8c2d0','#5ab0ff','#6ae07a','#ffcf3d','#ff7ad8','#ff5a5a','#fff2a0'];
const GMUL=[1,2.5,6,15,40,100,300];
const GACHAW=[60,30,7,2.2,.6,.15,.05];
// slot w = weapon (attack x), a = accessory (hp x). shape = how the bear holds it, col = main colour
const ITEMS={
 plank:{n:'나무판자',s:'w',g:0,shape:'plank',col:'#c99060'}, bat:{n:'야구 배트',s:'w',g:1,shape:'bat',col:'#d8b080'}, pipe:{n:'녹슨 쇠파이프',s:'w',g:1,shape:'pipe',col:'#8a8f9e'},
 pan:{n:'무쇠 프라이팬',s:'w',g:2,shape:'pan',col:'#4a4a52'}, axe:{n:'소방 도끼',s:'w',g:2,shape:'axe',col:'#e04848'},
 icesword:{n:'빙하 대검',s:'w',g:3,shape:'great',col:'#9fe8ff'}, lavasword:{n:'용암 대검',s:'w',g:4,shape:'great',col:'#ff7a2a'},
 rainbow:{n:'무지개 판자',s:'w',g:5,shape:'plank',col:'#ff7ad8'}, holy:{n:'백곰왕의 성스러운 판자',s:'w',g:6,shape:'plank',col:'#fff2a0'},
 shell:{n:'조개 목걸이',s:'a',g:0,col:'#ffd8c8'}, tooth:{n:'물범 이빨 부적',s:'a',g:1,col:'#f4eedc'}, kelp:{n:'다시마 팔찌',s:'a',g:2,col:'#5ab04a'},
 aurora:{n:'오로라 구슬',s:'a',g:3,col:'#7affd8'}, heart:{n:'빙하의 심장',s:'a',g:4,col:'#7fc8ff'}, crown:{n:'북극성 왕관',s:'a',g:5,col:'#ffe27a'}, star:{n:'고향의 별',s:'a',g:6,col:'#fffbe0'},
};
// pets: kind decides how they attack. mul = damage as a share of the bear's attack
const PETS={
 penguin:{n:'아기 펭귄',g:1,kind:'shot',mul:.35,cd:1.4,d:'눈덩이를 던져요'},
 fox:{n:'북극여우',g:2,kind:'dash',mul:.6,cd:1.8,d:'몬스터에게 달려들어 물어요'},
 owl:{n:'흰올빼미',g:3,kind:'dive',mul:1.1,cd:2.4,d:'하늘에서 급강하해 할퀴어요'},
};
const enhMul=lv=>1+.15*lv, enhCost=(g,lv)=>Math.floor(200*Math.pow(2.2,g)*Math.pow(1.35,lv));
function gearMul(slot){const id=S.eq[slot];if(!id)return 1;const it=ITEMS[id];return GMUL[it.g]*enhMul(S.inv[id]?.lv||0)*(slot==='a'?.6:1)+(slot==='a'?.4:0);}
function curWeapon(){return ITEMS[S.eq.w]||ITEMS.plank;}
function petMul(id){const p=PETS[id];return p.mul*(1+.6*p.g)*enhMul(S.pets[id]?.lv||0);}
function rollGrade(){let r=Math.random()*GACHAW.reduce((a,b)=>a+b,0);for(let g=0;g<GACHAW.length;g++){r-=GACHAW[g];if(r<=0)return g;}return 0;}
function gacha(n){const cost=n>=10?900:100;if(S.gem<cost)return null;S.gem-=cost;const out=[];
 for(let i=0;i<n;i++){const g=rollGrade();
  if(Math.random()<.12){const pool=Object.keys(PETS).filter(k=>PETS[k].g<=Math.max(1,g));const id=pick(pool);const own=S.pets[id];out.push({pet:1,id,isNew:!own});S.pets[id]={n:(own?.n||0)+1,lv:own?.lv||0};if(!S.pet)S.pet=id;continue;}
  const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].g===g);const id=pick(pool);const own=S.inv[id];out.push({id,isNew:!own});S.inv[id]={n:(own?.n||0)+1,lv:own?.lv||0};
  const it=ITEMS[id],cur=S.eq[it.s];if(!cur||ITEMS[cur].g<it.g)S.eq[it.s]=id;}
 save();return out;}
/* weapon drawing: grip at origin, pointing to -y (used in the bear's paw and for icons) */
function drawWeapon(c,it,t=0){const L=58,col=it.col,g=it.g;
 if(it.shape==='bat'){c.beginPath();c.moveTo(-2.5,6);c.lineTo(-5.5,-L);c.quadraticCurveTo(0,-L-5,5.5,-L);c.lineTo(2.5,6);c.closePath();fs(c,metalX(c,-6,6,col),1.5);rr(c,-3,-2,6,9,2);fs(c,'#2a2a3a',1.2);}
 else if(it.shape==='pipe'){rr(c,-3.5,-L,7,L+6,2);fs(c,metalX(c,-4,4,col),1.5);for(const[y,r]of[[-L*.7,3],[-L*.35,2.2]]){ell(c,1,y,r,r*1.4);c.fillStyle='rgba(150,80,35,.6)';c.fill();}rr(c,-4.5,-L,9,6,1.5);fs(c,metalX(c,-5,5,col),1.2);}
 else if(it.shape==='pan'){rr(c,-2.4,-28,4.8,34,2);fs(c,'#2a1a14',1.3);ell(c,0,-42,15,15);fs(c,metal(c,-57,-27,col),1.6);ell(c,0,-42,11,11);c.fillStyle=shade(col,-.3);c.fill();ell(c,-4,-47,4,2.5,-.5);c.fillStyle='rgba(255,255,255,.35)';c.fill();}
 else if(it.shape==='axe'){rr(c,-2.4,-L,4.8,L+6,2);fs(c,'#6a4428',1.3);c.beginPath();c.moveTo(1,-L+2);c.quadraticCurveTo(20,-L-2,22,-L+20);c.quadraticCurveTo(12,-L+16,1,-L+18);c.closePath();fs(c,metal(c,-L-2,-L+20,col),1.4);c.beginPath();c.moveTo(18,-L+2);c.quadraticCurveTo(23,-L+10,21,-L+19);c.lineWidth=2;c.strokeStyle='#e8eef6';c.stroke();}
 else if(it.shape==='great'){c.beginPath();c.moveTo(-5,-7);c.lineTo(-5,-L-6);c.lineTo(0,-L-14);c.lineTo(5,-L-6);c.lineTo(5,-7);c.closePath();const gr=c.createLinearGradient(-5,0,5,0);gr.addColorStop(0,shade(col,-.4));gr.addColorStop(.5,'#ffffff');gr.addColorStop(1,shade(col,-.2));c.fillStyle=gr;c.fill();c.lineWidth=1.4;c.strokeStyle=FUR.line;c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.shadowColor=col;c.shadowBlur=12;c.strokeStyle=col;c.globalAlpha=.6+.3*Math.sin(t*5);c.lineWidth=2;c.beginPath();c.moveTo(0,-10);c.lineTo(0,-L-8);c.stroke();c.restore();
  rr(c,-12,-9,24,5,2);fs(c,metal(c,-9,-4,'#c8a04a'),1.2);rr(c,-2.5,-4,5,12,1.5);fs(c,'#2a1a14',1.1);}
 else{rr(c,-5,-L,10,L+6,2.5);const gr=c.createLinearGradient(-5,0,5,0);gr.addColorStop(0,shade(col,-.35));gr.addColorStop(.45,shade(col,.15));gr.addColorStop(1,shade(col,-.45));c.fillStyle=gr;c.fill();c.lineWidth=1.6;c.strokeStyle=FUR.line;c.stroke();
  c.strokeStyle='rgba(70,40,15,.4)';c.lineWidth=.9;for(const x of[-2,1.5]){c.beginPath();c.moveTo(x,-L+3);c.bezierCurveTo(x+1.5,-L*.6,x-1.5,-L*.3,x,4);c.stroke();}
  for(const y of[-L+7,-L*.5]){ell(c,0,y,1.4,1.4);c.fillStyle='#9aa0a8';c.fill();}
  if(g>=5){c.save();c.globalCompositeOperation='lighter';c.shadowColor=g===6?'#fff2a0':'#ff7ad8';c.shadowBlur=14;c.strokeStyle=g===6?'rgba(255,240,170,.7)':`hsla(${(t*120)%360},90%,70%,.7)`;c.lineWidth=2;c.strokeRect(-5,-L,10,L+6);c.restore();}
  rr(c,-6,-7,12,13,2);c.fillStyle='#3e4a5e';c.fill();}
}
/* icons (cached data URLs) for the UI */
const _icon={};
function itemIcon(id,pet){const k=(pet?'p:':'')+id;if(_icon[k])return _icon[k];const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d');
 if(pet){c.translate(48,80);c.scale(1.05,1.05);PET_ART[id](c,{t:1,ph:0});}
 else{const it=ITEMS[id];if(it.s==='w'){c.translate(28,76);c.rotate(.75);c.scale(1.25,1.25);drawWeapon(c,it,1);}
  else{c.translate(48,48);const g=c.createRadialGradient(-6,-8,2,0,0,22);g.addColorStop(0,'#fff');g.addColorStop(.45,it.col);g.addColorStop(1,shade(it.col,-.45));
   c.beginPath();c.arc(0,4,20,0,TAU);c.fillStyle=g;c.fill();c.lineWidth=2.5;c.strokeStyle=FUR.line;c.stroke();c.beginPath();c.arc(0,-6,24,Math.PI*1.15,Math.PI*1.85);c.lineWidth=2;c.strokeStyle='#8a7a6a';c.stroke();
   c.shadowColor=it.col;c.shadowBlur=14;ell(c,-6,-3,6,4,-.5);c.fillStyle='rgba(255,255,255,.75)';c.fill();}}
 return _icon[k]=cv.toDataURL();}
