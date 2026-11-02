/* ---------- active skills + pet companion (runtime + art) ---------- */
const SKILLS={
 glacier:{n:'빙하 낙하',d:'하늘에서 얼음 기둥이 떨어져 앞쪽 적들을 내리찍어요',cd:8,mul:4,col:'#9fe8ff',unlock:0},
 tornado:{n:'눈보라 회오리',d:'회오리가 앞으로 나아가며 여러 번 피해를 줘요',cd:12,mul:1.3,col:'#e8f6ff',unlock:10},
 beam:{n:'오로라 빔',d:'오로라 광선이 앞쪽의 모든 적을 꿰뚫어요',cd:20,mul:12,col:'#7affd8',unlock:20},
};
const skLv=k=>S.skl[k]||1, skDmg=k=>ATK()*SKILLS[k].mul*(1+.25*(skLv(k)-1)), skCost=k=>Math.floor(400*Math.pow(1.6,skLv(k))), skOpen=k=>S.best>=SKILLS[k].unlock;
const skCd={glacier:2,tornado:5,beam:9},skFx=[];
function castSkill(k){if(!skOpen(k)||skCd[k]>0||bear.dead)return false;skCd[k]=SKILLS[k].cd;const live=mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x);sfx('crit');
 if(k==='glacier'){const tg=live.slice(0,4);if(!tg.length)tg.push({x:BX+150*K});tg.forEach((m,i)=>skFx.push({k,x:m.x,t:-i*.12,hit:false}));}
 if(k==='tornado')skFx.push({k,x:BX+30*K,t:0,tick:0});
 if(k==='beam'){skFx.push({k,t:0,tick:0});shake=Math.max(shake,6);}
 return true;}
function skHitAt(x,r,dmg,col){for(const m of mobs)if(!m.dead&&Math.abs(m.x-x)<r){const crit=Math.random()*100<stat('crit');hitMob(m,dmg*(crit?stat('critd')/100:1),crit);sparks(m.x,m.y-40*K*m.size,8,col,300);}}
function stepSkills(dt){
 for(const k in skCd){skCd[k]=Math.max(0,skCd[k]-dt);if(S.sauto&&skCd[k]===0&&skOpen(k)&&mobs.some(m=>!m.dead&&m.x<W))castSkill(k);}
 for(let i=skFx.length-1;i>=0;i--){const f=skFx[i];f.t+=dt;
  if(f.k==='glacier'){if(!f.hit&&f.t>=.35){f.hit=true;skHitAt(f.x,45*K,skDmg('glacier'),'#bff4ff');ring(f.x,GY,'#bff4ff',50*K);debris(f.x,GY-10*K,10,'#cfefff',K);shake=Math.max(shake,5);}if(f.t>.9)skFx.splice(i,1);}
  else if(f.k==='tornado'){f.x+=150*K*dt;f.tick-=dt;if(f.tick<=0){f.tick=.25;skHitAt(f.x,40*K,skDmg('tornado'),'#ffffff');}if(f.t>2.4||f.x>W+60)skFx.splice(i,1);}
  else if(f.k==='beam'){f.tick-=dt;if(f.t>.15&&f.t<.95&&f.tick<=0){f.tick=.16;skHitAt((BX+W)/2,W,skDmg('beam')/5,'#7affd8');}if(f.t>1.2)skFx.splice(i,1);}}
}
function drawSkills(c,t){c.save();
 for(const f of skFx){
  if(f.k==='glacier'&&f.t>0){const k=Math.min(1,f.t/.35),y=lerp(-30*K,GY,k*k),a=f.t>.35?1-(f.t-.35)/.55:1;c.globalAlpha=a;c.save();c.translate(f.x,y);
   c.globalCompositeOperation='lighter';const g=c.createRadialGradient(0,-20*K,2,0,-20*K,40*K);g.addColorStop(0,'rgba(190,240,255,.55)');g.addColorStop(1,'rgba(190,240,255,0)');c.fillStyle=g;c.fillRect(-40*K,-60*K,80*K,80*K);c.globalCompositeOperation='source-over';
   c.beginPath();c.moveTo(0,4*K);c.lineTo(-11*K,-30*K);c.lineTo(-4*K,-64*K);c.lineTo(5*K,-58*K);c.lineTo(11*K,-28*K);c.closePath();const ig=c.createLinearGradient(-11*K,0,11*K,0);ig.addColorStop(0,'#5ab0e8');ig.addColorStop(.45,'#f4fcff');ig.addColorStop(1,'#7ac8f0');
   c.fillStyle=ig;c.fill();c.lineWidth=1.5;c.strokeStyle='rgba(30,70,110,.8)';c.stroke();c.beginPath();c.moveTo(-4*K,-60*K);c.lineTo(0,2*K);c.strokeStyle='rgba(255,255,255,.7)';c.stroke();c.restore();}
  else if(f.k==='tornado'){const a=Math.min(1,f.t*4)*(f.t>2?1-(f.t-2)/.4:1);c.globalAlpha=a;
   for(let i=0;i<14;i++){const h=i/14,r=(8+h*30)*K,y=GY-h*110*K,ang=t*12+i*.9;c.beginPath();c.ellipse(f.x+Math.sin(ang)*r*.3,y,r,r*.28,0,0,TAU);c.strokeStyle=`rgba(235,248,255,${.25+.35*(1-h)})`;c.lineWidth=(3-h*1.5)*K;c.stroke();}
   c.globalCompositeOperation='lighter';for(let i=0;i<10;i++){const ang=t*10+i*1.7,h=((t*.8+i/10)%1);ell(c,f.x+Math.cos(ang)*(10+h*30)*K,GY-h*110*K,2*K,2*K);c.fillStyle='rgba(255,255,255,.8)';c.fill();}c.globalCompositeOperation='source-over';}
  else if(f.k==='beam'){const a=f.t<.15?f.t/.15:f.t>.95?Math.max(0,1-(f.t-.95)/.25):1,y=GY-62*K,hw=(22+6*Math.sin(t*30))*K*a;
   c.globalCompositeOperation='lighter';for(const[w2,al]of[[1.8,.25],[1,.6],[.45,1]]){const g=c.createLinearGradient(0,y-hw*w2,0,y+hw*w2);
    g.addColorStop(0,'rgba(122,255,216,0)');g.addColorStop(.3,`rgba(122,255,216,${al*.7})`);g.addColorStop(.5,`rgba(${w2<.5?'255,255,255':'170,140,255'},${al})`);g.addColorStop(.7,`rgba(90,200,255,${al*.7})`);g.addColorStop(1,'rgba(90,200,255,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(BX+18*K,y-hw*w2*.4);for(let x=BX+18*K;x<=W+20;x+=12){c.lineTo(x,y-hw*w2+Math.sin(x*.05-t*20)*3*K);}for(let x=W+20;x>=BX+18*K;x-=12){c.lineTo(x,y+hw*w2+Math.sin(x*.05-t*20+2)*3*K);}c.closePath();c.fill();}
   ell(c,BX+20*K,y,hw*1.2,hw*1.2);c.fillStyle='rgba(255,255,255,.7)';c.fill();c.globalCompositeOperation='source-over';}
 }
 c.restore();}
/* ---------- pet ---------- */
const pet={x:0,y:0,cd:1,mode:'idle',t:0,tx:0,ph:0,hit:false};
function stepPet(dt){if(!S.pet)return;const P=PETS[S.pet],home=BX-52*K;pet.ph+=dt*9*bear.walk;
 if(!pet.x)pet.x=home;pet.cd-=dt;const tg=front();
 if(pet.mode==='idle'){pet.x=lerp(pet.x,home,dt*4);pet.y=P.kind==='dive'?GY-(95+Math.sin(performance.now()/500)*6)*K:GY;
  if(pet.cd<=0&&tg&&tg.x<W*.95&&!bear.dead){pet.cd=P.cd;pet.t=0;pet.hit=false;
   if(P.kind==='shot'){shots.push({x:pet.x+10*K,y:GY-30*K,vx:420*K,col:'#ffffff',dmg:0,pet:1,ball:1});}else{pet.mode='go';pet.tx=tg.x;}}}
 else{pet.t+=dt;const k=pet.mode==='go'?Math.min(1,pet.t/.35):1-Math.min(1,pet.t/.4);
  pet.x=lerp(home,pet.tx-24*K,k);pet.y=P.kind==='dive'?lerp(GY-95*K,GY-30*K,k):GY-Math.sin(k*Math.PI)*14*K*(pet.mode==='go'?1:0);
  if(pet.mode==='go'&&k>=1){if(!pet.hit){pet.hit=true;skHitAt(pet.tx,30*K,ATK()*petMul(S.pet),'#ffffff');}pet.mode='back';pet.t=0;}
  else if(pet.mode==='back'&&k<=0)pet.mode='idle';}}
// player-side projectiles from the pet travel right; reuse the shots list with vx > 0
function petShotHit(s){const tg=mobs.find(m=>!m.dead&&Math.abs(m.x-s.x)<20*K);if(tg){skHitAt(tg.x,8*K,ATK()*petMul(S.pet),'#ffffff');return true;}return s.x>W+20;}
function drawPet(c,t){if(!S.pet)return;c.fillStyle='rgba(10,20,40,.25)';c.beginPath();c.ellipse(pet.x,GY+2*K,16*K,3.5*K,0,0,TAU);c.fill();
 c.save();c.translate(pet.x,pet.y);c.scale(K*.95,K*.95);PET_ART[S.pet](c,{t,ph:pet.ph,act:pet.mode!=='idle'});c.restore();}
/* pet art: realistic-ish, facing right, feet at y=0 (single outline, gradient shading) */
function outlined(c,paths){c.lineJoin='round';for(const[p]of paths){p();c.lineWidth=2;c.strokeStyle=FUR.line;c.stroke();}for(const[p,f]of paths){p();c.fillStyle=f();c.fill();}}
const PET_ART={
 penguin:(c,m)=>{const t=m.t,w=Math.sin(m.ph)*.15,fl=Math.sin(t*3)*.15;c.rotate(w*.3);
  outlined(c,[[()=>{ell(c,-4,-2,5,2.5);ell(c,6,-2,5,2.5);},()=>'#ff9a3a'],
   [()=>{c.beginPath();c.moveTo(-10,-4);c.bezierCurveTo(-16,-24,-12,-40,-2,-44);c.bezierCurveTo(10,-46,14,-30,12,-4);c.quadraticCurveTo(0,0,-10,-4);c.closePath();},()=>lgrad(c,-46,0,'#2a2e3a')],
   [()=>{c.beginPath();c.moveTo(-6,-6);c.bezierCurveTo(-8,-22,0,-34,8,-30);c.bezierCurveTo(12,-22,11,-10,8,-5);c.closePath();},()=>lgrad(c,-34,-5,'#f4f6fa')],
   [()=>{c.save();c.translate(-8,-30);c.rotate(.3+fl+(m.act?-.6:0));ell(c,-2,8,3.5,10);c.restore();},()=>'#1e222c'],
   [()=>{c.beginPath();c.moveTo(10,-40);c.lineTo(17,-38);c.lineTo(10,-36);c.closePath();},()=>'#ff8a2a']]);
  ell(c,6,-41,2.6,2.6);c.fillStyle='#fff';c.fill();ell(c,6.4,-41,1.2,1.2);c.fillStyle='#111';c.fill();},
 fox:(c,m)=>{const t=m.t,s=Math.sin(m.ph)*.4,run=m.act?1:0,tail=Math.sin(t*3)*.15;
  const leg=(x,a)=>()=>{c.save();c.translate(x,-14);c.rotate(a);rr(c,-2.6,0,5.2,14,2.5);c.restore();};
  outlined(c,[[leg(-14,-s*.6-run*.4),()=>'#d8d2c4'],[leg(10,s*.6+run*.4),()=>'#d8d2c4'],
   [()=>{c.beginPath();c.moveTo(-20,-22);c.bezierCurveTo(-36,-30-tail*20,-46,-22,-42,-10);c.bezierCurveTo(-34,-14,-26,-14,-18,-14);c.closePath();},()=>lgrad(c,-34,-10,'#fbf8f2')],
   [()=>{ell(c,-2,-20,20,9.5);},()=>lgrad(c,-30,-10,'#fbf8f2')],
   [leg(-8,s*.6),()=>lgrad(c,-14,0,'#f4f0e8')],[leg(15,-s*.6),()=>lgrad(c,-14,0,'#f4f0e8')],
   [()=>{c.beginPath();c.moveTo(12,-24);c.bezierCurveTo(14,-34,24,-36,28,-31);c.lineTo(36,-25);c.quadraticCurveTo(30,-20,22,-19);c.closePath();c.moveTo(16,-31);c.lineTo(17,-40);c.lineTo(22,-33);c.moveTo(21,-33);c.lineTo(24,-41);c.lineTo(26,-32);},()=>lgrad(c,-40,-19,'#fbf8f2')]]);
  ell(c,35.5,-25,1.6,1.3);c.fillStyle='#1a1410';c.fill();ell(c,25,-29,1.3,1);c.fillStyle='#1a1410';c.fill();},
 owl:(c,m)=>{const t=m.t,fl=Math.sin(t*(m.act?14:5))*.5;
  outlined(c,[[()=>{c.save();c.translate(-4,-26);c.rotate(-.9-fl);ell(c,-10,0,16,7);c.restore();},()=>lgrad(c,-34,-18,'#f0ece4')],
   [()=>{ell(c,0,-18,13,15);},()=>lgrad(c,-33,-3,'#fbfaf6')],[()=>{ell(c,5,-34,10.5,9.5);},()=>lgrad(c,-44,-24,'#fbfaf6')],
   [()=>{c.save();c.translate(-2,-24);c.rotate(-.5+fl);ell(c,-8,0,14,6);c.restore();},()=>lgrad(c,-30,-18,'#f4f0e8')]]);
  c.fillStyle='rgba(40,35,30,.55)';for(let i=0;i<10;i++){ell(c,-8+(i%5)*4,-20+Math.floor(i/5)*7+(i%2)*2,1.4,.9);c.fill();}
  for(const x of[5,11]){ell(c,x,-35,2.6,2.6);c.fillStyle='#ffd23a';c.fill();ell(c,x+.3,-35,1.2,1.2);c.fillStyle='#111';c.fill();}
  c.beginPath();c.moveTo(13,-32);c.lineTo(15.5,-30);c.lineTo(12.5,-29);c.closePath();c.fillStyle='#3a3430';c.fill();},
};
