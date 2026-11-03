/* ---------- costumes (20): change how the bear looks + HP bonus ----------
 Each costume has up to three layers drawn by drawBear: back (behind the body), body (over the torso), head (in head space). */
const C_=(n,g,col)=>({n,s:'c',g,col});
Object.assign(ITEMS,{
 scarf:C_('파란 목도리',0,'#3d6ad8'),straw:C_('밀짚모자',0,'#e8c870'),redhood:C_('빨간 두건',0,'#d83a3a'),
 kelp:C_('미역 닌자',1,'#3a7a3a'),duck:C_('오리 튜브 수영복',1,'#ffd23a'),raincoat:C_('노란 우비',1,'#ffcf2a'),chef:C_('요리사 모자',1,'#f4f4f4'),
 pirate:C_('해적 선장',2,'#2a2a30'),ghillie:C_('길리슈트',2,'#5a7a3a'),shark:C_('상어 후드',2,'#7a8a9a'),lifeguard:C_('해양 구조대',2,'#e83a3a'),padding:C_('롱패딩',2,'#22242c'),
 santa:C_('산타 옷',3,'#d8283a'),diver:C_('심해 잠수복',3,'#1a3a5a'),explorer:C_('북극 탐험대 파카',3,'#ff7a2a'),
 knight:C_('기사 갑옷',4,'#b8bcc8'),mage:C_('대마법사 로브',4,'#5a2a9a'),astro:C_('우주복',5,'#f0f2f6'),
 kingcrown:C_('백곰왕의 왕관',6,'#ffd23a'),aurorawing:C_('오로라 날개옷',6,'#7affd8'),
});
const OLC='rgba(40,30,30,.85)';
function cfill(c,fill,lw=1.6){c.fillStyle=fill;c.fill();c.lineWidth=lw;c.strokeStyle=OLC;c.stroke();}
function vgrad(c,y0,y1,col){return lgrad(c,y0,y1,col);}
// body-layer helpers (bear world coords: torso x -40..30, y -116..-22)
const coat=(c,col,trim)=>{c.beginPath();c.moveTo(-30,-96);c.bezierCurveTo(-40,-70,-38,-40,-26,-24);c.bezierCurveTo(-8,-18,14,-20,26,-28);c.bezierCurveTo(31,-50,30,-86,20,-106);c.bezierCurveTo(4,-112,-18,-110,-30,-96);c.closePath();cfill(c,vgrad(c,-110,-20,col));
 if(trim){c.beginPath();c.moveTo(-26,-24);c.bezierCurveTo(-8,-17,14,-19,26,-28);c.lineWidth=5;c.strokeStyle=trim;c.stroke();}};
const COS={
 scarf:{body(c,m){const fl=Math.sin(m.t*5)*3+(m.walk||0)*5;c.beginPath();c.moveTo(-14,-104);c.bezierCurveTo(-26,-100,-36+fl*.3,-92,-46+fl,-86+fl*.4);c.lineTo(-44+fl,-78);c.bezierCurveTo(-34,-86,-24,-92,-12,-96);c.closePath();cfill(c,'#2a4472',1.2);
  c.beginPath();c.moveTo(-16,-108);c.bezierCurveTo(-4,-100,10,-100,22,-106);c.lineTo(23,-97);c.bezierCurveTo(10,-91,-4,-91,-16,-99);c.closePath();cfill(c,vgrad(c,-108,-91,'#3d6ad8'),1.2);}},
 straw:{head(c){ell(c,4,-20,24,5,-.1);cfill(c,vgrad(c,-25,-15,'#e8c870'));c.beginPath();c.ellipse(3,-24,12,9,-.1,Math.PI,0);cfill(c,vgrad(c,-33,-22,'#f0d488'));c.beginPath();c.ellipse(3,-23,12,2.5,-.1,0,TAU);c.fillStyle='#c83a3a';c.fill();}},
 redhood:{head(c){c.beginPath();c.moveTo(-14,-10);c.bezierCurveTo(-14,-24,4,-28,14,-18);c.lineTo(10,-12);c.bezierCurveTo(2,-18,-8,-16,-12,-6);c.closePath();cfill(c,vgrad(c,-26,-6,'#d83a3a'));c.fillStyle='#fff';for(let i=0;i<5;i++){ell(c,-8+i*4,-17+Math.abs(i-2),1,1);c.fill();}
  c.beginPath();c.moveTo(-14,-8);c.lineTo(-24,-4);c.lineTo(-20,2);c.closePath();cfill(c,'#c8283a',1);}},
 kelp:{head(c,m){rr(c,-15,-17,30,5,2);cfill(c,'#3a7a3a',1.2);const f=Math.sin(m.t*6)*2;for(const d of[0,4]){c.beginPath();c.moveTo(-14,-15);c.quadraticCurveTo(-24,-12+d+f,-30,-6+d+f);c.lineWidth=3;c.strokeStyle='#3a7a3a';c.stroke();}}},
 duck:{body(c){c.beginPath();c.ellipse(-4,-40,36,10,0,0,TAU);c.lineWidth=12;c.strokeStyle=OLC;c.stroke();c.lineWidth=9;c.strokeStyle='#ffd23a';c.stroke();
  c.save();c.translate(26,-46);ell(c,0,0,8,7);cfill(c,'#ffd23a');c.beginPath();c.moveTo(6,0);c.lineTo(13,1);c.lineTo(6,3);c.closePath();cfill(c,'#ff8a2a',1);ell(c,2,-2,1.2,1.2);c.fillStyle='#111';c.fill();c.restore();}},
 raincoat:{body(c){coat(c,'#ffcf2a');for(const y of[-90,-70,-50]){ell(c,2,y,2,2);c.fillStyle='#8a6a10';c.fill();}},head(c){c.beginPath();c.ellipse(2,-20,20,5,-.15,0,TAU);cfill(c,'#ffcf2a');c.beginPath();c.ellipse(1,-23,12,9,-.1,Math.PI,0);cfill(c,vgrad(c,-32,-20,'#ffd84a'));}},
 chef:{body(c){c.beginPath();c.moveTo(-6,-96);c.lineTo(22,-100);c.lineTo(26,-30);c.quadraticCurveTo(10,-24,-6,-30);c.closePath();cfill(c,'#f8f8f8');},head(c){rr(c,-10,-30,22,10,3);cfill(c,'#f4f4f4');for(const[x,r]of[[-6,7],[1,8],[8,7]]){ell(c,x,-35,r,r);cfill(c,'#ffffff',1.2);}}},
 pirate:{head(c){c.beginPath();c.moveTo(-18,-16);c.quadraticCurveTo(0,-40,20,-16);c.quadraticCurveTo(0,-24,-18,-16);c.closePath();cfill(c,vgrad(c,-36,-16,'#2a2a30'));ell(c,1,-24,3,3);c.fillStyle='#f4eedc';c.fill();
  c.beginPath();c.moveTo(-6,-14);c.lineTo(22,-10);c.lineWidth=1.4;c.strokeStyle='#111';c.stroke();ell(c,14,-12,3,2.6);c.fillStyle='#111';c.fill();}},
 ghillie:{body(c,m){for(let i=0;i<26;i++){const x=-34+(i*13)%62,y=-110+((i*29)%86),a=Math.sin(m.t*2+i)*.2;c.save();c.translate(x,y);c.rotate(.6+a);ell(c,0,6,3,8);c.fillStyle=i%3?'#5a7a3a':'#7a9a4a';c.fill();c.restore();}},head(c){for(let i=0;i<6;i++){c.save();c.translate(-10+i*4,-20);c.rotate(-.6+i*.25);ell(c,0,-5,2.4,7);c.fillStyle='#5a7a3a';c.fill();c.restore();}}},
 shark:{head(c){c.beginPath();c.moveTo(-17,0);c.bezierCurveTo(-19,-22,2,-30,16,-16);c.lineTo(18,-8);c.bezierCurveTo(6,-18,-6,-16,-10,4);c.closePath();cfill(c,vgrad(c,-28,4,'#7a8a9a'));
  c.beginPath();c.moveTo(-6,-24);c.lineTo(-2,-38);c.lineTo(4,-25);c.closePath();cfill(c,'#6a7a8a');for(let i=0;i<4;i++){c.beginPath();c.moveTo(4+i*3,-14+i*.8);c.lineTo(5.5+i*3,-10+i*.8);c.lineTo(7+i*3,-14+i*.8);c.fillStyle='#fff';c.fill();}}},
 lifeguard:{body(c){c.beginPath();c.moveTo(-24,-100);c.lineTo(22,-104);c.lineTo(26,-56);c.lineTo(-28,-54);c.closePath();cfill(c,vgrad(c,-104,-54,'#e83a3a'));c.fillStyle='#fff';c.fillRect(-4,-92,8,24);c.fillRect(-12,-84,24,8);}},
 padding:{body(c){coat(c,'#22242c');c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=1.2;for(let y=-100;y<-24;y+=11){c.beginPath();c.moveTo(-36,y);c.quadraticCurveTo(-4,y+4,28,y);c.stroke();}}},
 santa:{body(c){coat(c,'#d8283a','#ffffff');rr(c,-36,-56,66,7,2);cfill(c,'#2a1a14',1.2);rr(c,-4,-57,9,9,1.5);cfill(c,'#ffd23a',1);},head(c,m){c.beginPath();c.moveTo(-14,-18);c.quadraticCurveTo(-4,-46,-26-Math.sin(m.t*2)*3,-30);c.lineTo(14,-18);c.closePath();cfill(c,vgrad(c,-46,-18,'#d8283a'));rr(c,-16,-22,32,7,3.5);cfill(c,'#ffffff',1.2);ell(c,-26-Math.sin(m.t*2)*3,-30,4,4);cfill(c,'#fff',1);}},
 diver:{body(c){coat(c,'#1a3a5a');c.strokeStyle='#ffd23a';c.lineWidth=2;c.beginPath();c.moveTo(-30,-80);c.lineTo(26,-84);c.stroke();},head(c){rr(c,4,-17,20,9,4);cfill(c,'rgba(120,200,255,.55)',1.6);c.beginPath();c.moveTo(-14,-12);c.lineTo(4,-13);c.lineWidth=2.2;c.strokeStyle='#1a1a24';c.stroke();}},
 explorer:{body(c){coat(c,'#ff7a2a','#f4eedc');rr(c,-6,-104,4,80,1);c.fillStyle='rgba(0,0,0,.25)';c.fill();},head(c){c.beginPath();c.moveTo(-18,4);c.bezierCurveTo(-22,-24,4,-34,18,-14);c.lineTo(14,-8);c.bezierCurveTo(6,-22,-10,-20,-12,6);c.closePath();cfill(c,vgrad(c,-30,6,'#ff7a2a'));
  c.beginPath();c.moveTo(14,-8);c.bezierCurveTo(6,-22,-10,-20,-12,6);c.lineWidth=5;c.strokeStyle='#f4eedc';c.stroke();}},
 knight:{body(c){c.beginPath();c.moveTo(-30,-100);c.bezierCurveTo(-36,-72,-30,-48,-22,-40);c.lineTo(24,-42);c.bezierCurveTo(30,-60,30,-86,22,-104);c.closePath();cfill(c,metal(c,-104,-40,'#b8bcc8'));
  c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1.2;c.beginPath();c.moveTo(-2,-102);c.lineTo(-2,-44);c.stroke();},head(c){c.beginPath();c.moveTo(-16,2);c.bezierCurveTo(-18,-20,-2,-28,10,-22);c.bezierCurveTo(16,-18,18,-12,16,-8);c.lineTo(4,-8);c.lineTo(2,4);c.closePath();cfill(c,metal(c,-26,4,'#b8bcc8'));
  c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(-10,-40,-22,-36);c.lineWidth=3;c.strokeStyle='#d83a3a';c.stroke();}},
 mage:{body(c,m){coat(c,'#5a2a9a','#ffd23a');c.fillStyle='#ffd23a';for(let i=0;i<6;i++){const x=-28+((i*17)%50),y=-96+((i*23)%66);c.save();c.translate(x,y);c.beginPath();for(let k=0;k<10;k++){const r=k%2?1.2:3;c.lineTo(Math.cos(k*Math.PI/5)*r,Math.sin(k*Math.PI/5)*r);}c.fill();c.restore();}},
  head(c,m){c.beginPath();c.moveTo(-18,-16);c.quadraticCurveTo(-6,-30,-8-Math.sin(m.t)*2,-60);c.quadraticCurveTo(4,-34,18,-16);c.closePath();cfill(c,vgrad(c,-60,-16,'#5a2a9a'));c.beginPath();c.ellipse(0,-17,22,4.5,-.1,0,TAU);cfill(c,'#4a1a8a');}},
 astro:{body(c){coat(c,'#f0f2f6');rr(c,-12,-90,22,16,3);cfill(c,'#c8ccd6',1.2);for(let i=0;i<3;i++){ell(c,-6+i*6,-82,2,2);c.fillStyle=['#ff4a4a','#ffd23a','#4ac0ff'][i];c.fill();}},
  head(c){c.beginPath();c.arc(6,-6,30,0,TAU);c.fillStyle='rgba(180,220,255,.28)';c.fill();c.lineWidth=2.4;c.strokeStyle='rgba(220,235,255,.95)';c.stroke();ell(c,-8,-20,8,4,-.6);c.fillStyle='rgba(255,255,255,.55)';c.fill();}},
 kingcrown:{back(c,m){const fl=Math.sin(m.t*2)*4+(m.walk||0)*6;c.beginPath();c.moveTo(-22,-106);c.bezierCurveTo(-44-fl,-80,-50-fl,-40,-56-fl*1.4,-4);c.lineTo(-10,-4);c.bezierCurveTo(-16,-40,-12,-80,10,-108);c.closePath();cfill(c,vgrad(c,-108,-4,'#b8102a'));
   c.beginPath();c.moveTo(-22,-106);c.bezierCurveTo(-8,-112,4,-112,10,-108);c.lineWidth=6;c.strokeStyle='#f4eedc';c.stroke();},
  head(c){c.save();c.translate(-1,-21);c.beginPath();c.moveTo(-12,4);c.lineTo(-13,-8);c.lineTo(-7,-2);c.lineTo(-2,-12);c.lineTo(3,-2);c.lineTo(9,-8);c.lineTo(9,4);c.closePath();cfill(c,metal(c,-12,4,'#ffd23a'));ell(c,-2,-1,2,2);c.fillStyle='#d8102a';c.fill();c.restore();}},
 aurorawing:{back(c,m){const f=Math.sin(m.t*3)*.12;c.save();c.globalCompositeOperation='lighter';for(const s of[1,.8]){c.save();c.translate(-14,-96);c.rotate(-.4-f);c.scale(s,s);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-30,-50,-80,-50,-90,-20);c.bezierCurveTo(-70,-10,-60,10,-40,20);c.bezierCurveTo(-24,14,-10,8,0,0);
   const g=c.createLinearGradient(-90,0,0,0);g.addColorStop(0,'rgba(170,120,255,.15)');g.addColorStop(.5,`hsla(${160+Math.sin(m.t)*30},90%,70%,.55)`);g.addColorStop(1,'rgba(122,255,216,.8)');c.fillStyle=g;c.fill();c.restore();}c.restore();},
  body(c,m){c.beginPath();c.moveTo(-28,-96);c.quadraticCurveTo(0,-70,26,-40);c.lineWidth=5;c.strokeStyle=`hsla(${(m.t*60)%360},90%,70%,.7)`;c.stroke();}},
};
// costume HP bonus and helpers
function cosId(){const k=S.eq.c;return k&&S.inv[k]?gsplit(k)[0]:null;}
function costume(layer,c,m){const id=m&&m.cos||cosId();if(!id||!COS[id]||!COS[id][layer])return;c.save();COS[id][layer](c,m);c.restore();}
