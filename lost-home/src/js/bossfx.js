/* ---------- boss skills, enrage, demon king phases ----------
 Every few seconds a boss telegraphs a skill (red warning under the bear for 0.8s), then it lands.
 Non-human bosses enrage below 50% HP. 마왕 녹스 transforms at 66% and 33% HP. */
const BSK={
 barkas:[{n:'대지 분쇄',col:'#ff7a3a',kind:'slam',mul:4},{n:'강철 돌진',col:'#c8ccd6',kind:'charge',mul:3}],
 lilith:[{n:'가시 장미 폭풍',col:'#ff4a7a',kind:'rain',mul:3.5},{n:'흡혈 장미',col:'#c8103a',kind:'drain',mul:2.5}],
 xenos:[{n:'흑염 일섬',col:'#b05aff',kind:'slash',mul:4.5},{n:'흑염 기둥',col:'#8a3aff',kind:'pillar',mul:4}],
 king:[{n:'어둠의 대검',col:'#ff2a3a',kind:'slash',mul:5},{n:'마왕의 낙인',col:'#ff3a6a',kind:'pillar',mul:5},{n:'멸망의 별',col:'#ff6a2a',kind:'rain',mul:4,ph:3}],
 _:[{n:'분노의 일격',col:'#ff5a3a',kind:'slam',mul:3}],
};
const TELE=.8,CAST=1.5;
function stepBoss(m,dt){if(!m||m.dead)return;if(m.skT==null){m.skT=4;m.phase=1;}
 if(m.id==='king'){const ph=m.hp<m.max*.33?3:m.hp<m.max*.66?2:1;if(ph>m.phase){m.phase=ph;m.size*=1.1;m.skT=1.2;hitstop=.4;shake=16;banner(ph===2?'마왕 각성!':'진정한 마왕 녹스!','#ff2a3a');sfx('boss');sparks(m.x,m.y-90*K,40,'#ff2a3a',500);}}
 else if(!m.enraged&&m.hp<m.max*.5){m.enraged=true;banner('분노!','#ff5a3a');sfx('boss');}
 if(m.frozen>0)return;
 if(!m.cast){m.skT-=dt;if(m.skT<=0&&!bear.dead&&m.x<W){const list=(BSK[m.id]||BSK._).filter(s=>!s.ph||s.ph<=m.phase);m.cast={s:pick(list),t:0,done:false,x0:m.x};num(m.x,m.y-ART_H[m.arch]*K*m.size-24*K,m.cast.s.n,'hurt');}return;}
 const c=m.cast,s=c.s;c.t+=dt;
 if(s.kind==='charge'){const k=c.t<TELE?0:c.t<TELE+.25?(c.t-TELE)/.25:Math.max(0,1-(c.t-TELE-.25)/.4);m.x=lerp(c.x0,BX+40*K,k);}
 if(!c.done&&c.t>=TELE){c.done=true;const d=m.dmg*s.mul;
  if(!bear.dead)hurtBear(d);shake=Math.max(shake,12);hitstop=Math.max(hitstop,.08);sfx('crit');
  if(s.kind==='drain'){const h=m.max*.04;m.hp=Math.min(m.max,m.hp+h);num(m.x,m.y-120*K,'+'+fmt(h),'heal');}
  if(s.kind==='slam'){ring(BX,GY,s.col,70*K,.6);debris(BX,GY-5*K,14,'#8a7a6a',K);}
  if(s.kind==='rain')for(let i=0;i<24;i++)part({x:BX+rnd(-60,60)*K,y:-10,vx:rnd(-40,40),vy:rnd(500,800),g:400,life:.6,ml:.6,size:rnd(3,6),col:s.col,type:'spark'});
  if(s.kind==='pillar'||s.kind==='slash')sparks(BX,GY-60*K,30,s.col,420);}
 if(c.t>=CAST){m.cast=null;m.skT=rnd(6,8)/(m.enraged||m.phase>1?1.5:1);}}
function drawBossFx(c,t){const m=boss;if(!m||m.dead)return;c.save();
 if(m.enraged||m.phase>1){c.globalCompositeOperation='lighter';const cy=m.y-ART_H[m.arch]*.5*K*m.size,r=ART_H[m.arch]*.7*K*m.size;const g=c.createRadialGradient(m.x,cy,r*.2,m.x,cy,r);g.addColorStop(0,`rgba(255,40,60,${.18+.08*Math.sin(t*6)})`);g.addColorStop(1,'rgba(255,40,60,0)');c.fillStyle=g;c.fillRect(m.x-r,cy-r,r*2,r*2);c.globalCompositeOperation='source-over';}
 const cs=m.cast;if(cs){const s=cs.s;
  if(cs.t<TELE){const k=cs.t/TELE;c.fillStyle=`rgba(255,40,60,${.15+.25*k})`;c.beginPath();c.ellipse(BX,GY,(50+30*k)*K,(10+5*k)*K,0,0,TAU);c.fill();c.strokeStyle=`rgba(255,80,90,${.6+.4*Math.sin(t*30)})`;c.lineWidth=2;c.stroke();
   c.font=`${26*K}px Jal, sans-serif`;c.textAlign='center';c.fillStyle='#ff3a4a';c.strokeStyle='#200';c.lineWidth=4;c.strokeText('!',BX,GY-140*K);c.fillText('!',BX,GY-140*K);}
  else{const k=(cs.t-TELE)/(CAST-TELE),a=1-k;c.globalCompositeOperation='lighter';
   if(s.kind==='slash'){c.save();c.translate(BX+10*K,GY-60*K);c.rotate(-.5);const r=90*K;c.beginPath();c.arc(-r*.4,0,r,-1.1,1.1);c.arc(-r*.4-r*.3,0,r*.9,1,-1,true);c.closePath();c.fillStyle=s.col;c.globalAlpha=a;c.shadowColor=s.col;c.shadowBlur=24;c.fill();c.restore();}
   else if(s.kind==='pillar'){const g=c.createLinearGradient(0,GY,0,0);g.addColorStop(0,s.col);g.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=a;c.fillStyle=g;c.fillRect(BX-26*K,0,52*K,GY);c.fillStyle='rgba(255,255,255,.6)';c.fillRect(BX-6*K,0,12*K,GY);}
   else if(s.kind==='slam'){for(let i=0;i<3;i++){c.beginPath();c.ellipse(BX,GY,(40+k*120+i*20)*K,(8+k*20)*K,0,0,TAU);c.strokeStyle=s.col;c.globalAlpha=a*(1-i*.25);c.lineWidth=4;c.stroke();}}
   else if(s.kind==='drain'){c.globalAlpha=a;for(let i=0;i<5;i++){const q=(k*2+i/5)%1;ell(c,lerp(BX,m.x,q),lerp(GY-60*K,m.y-80*K,q)+Math.sin(q*9+i)*10*K,4*K,4*K);c.fillStyle=s.col;c.fill();}}
   else if(s.kind==='charge'){c.globalAlpha=a*.7;c.strokeStyle='#fff';c.lineWidth=2;for(let i=0;i<6;i++){const y=m.y-(20+i*18)*K;c.beginPath();c.moveTo(m.x+20*K,y);c.lineTo(m.x+(70+i*8)*K,y);c.stroke();}}}}
 c.restore();}
// demon king wings (phase 3), drawn behind the body in humans.js
function kingWings(c,t){const f=Math.sin(t*3)*.15;for(const s of[1,.85]){c.save();c.translate(-6,-130);c.rotate(-.3-f);c.scale(s,s);c.beginPath();c.moveTo(0,0);c.lineTo(-30,-40);c.lineTo(-80,-46);c.quadraticCurveTo(-70,-20,-86,-8);c.quadraticCurveTo(-64,-6,-70,14);c.quadraticCurveTo(-46,4,-44,26);c.quadraticCurveTo(-26,10,0,10);c.closePath();
 const g=c.createLinearGradient(-86,0,0,0);g.addColorStop(0,'#3a0612');g.addColorStop(1,'#140408');c.fillStyle=g;c.fill();c.lineWidth=2;c.strokeStyle='rgba(18,12,20,.9)';c.stroke();
 c.strokeStyle='rgba(255,60,80,.5)';c.lineWidth=1.2;c.beginPath();c.moveTo(0,0);c.lineTo(-80,-46);c.moveTo(-30,-40);c.lineTo(-86,-8);c.moveTo(-30,-40);c.lineTo(-70,14);c.stroke();c.restore();}}
