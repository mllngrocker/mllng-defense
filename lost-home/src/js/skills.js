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
