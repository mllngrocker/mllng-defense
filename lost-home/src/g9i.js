<script>
/* ================= 마왕군 간부 · 마왕 고유 스킬 ================= */
const BSK={
 barkas:[{n:'대지 분쇄',col:'#ff3a4a'},{n:'강철 돌진',col:'#a8b4cc'}],
 lilith:[{n:'혈장미 폭풍',col:'#ff3a7a'},{n:'매혹의 대낫',col:'#ff8ab8'}],
 xenos:[{n:'흑염참',col:'#b060ff'},{n:'흑염 기둥',col:'#7a2ad8'}],
 mega1:[{n:'마검 낙뢰',col:'#c88aff'}],mega2:[{n:'마왕의 포효',col:'#ff2a5a'}],mega3:[{n:'종말의 운석',col:'#ff5a1a'}]};
let bskCd=4,bsk=null,bskCut=null,bfx=[],bskIdx=0;
function bossNow(){return mobs.find(m=>!m.dead&&BSK[m.type])}
function bHurt(m,mul){if(!m||m.dead||bear.dead)return;hurtBear(m.atk*mul,null)}
function bossSkill(m){const list=BSK[m.type];const sk=list[bskIdx++%list.length];const ev=[];const at=(t,fn)=>ev.push([t,fn]);const bx=bear.x+6;const shake_=(s,f,c)=>{shake=Math.max(shake,s);if(f){flash=Math.max(flash,f);flashC=c||'#fff'}};
  switch(sk.n){
  case '대지 분쇄':at(0,()=>{m.lunge=.4;ufx.push({k:'tint',col:'#2a0006',a:.4,life:1.4})});for(let i=0;i<7;i++)at(.25+i*.07,()=>{const x=m.x-14-i*((m.x-14-bx)/6);ufx.push({k:'spike',x,col:['#3a2a2a','#7a5a4a','#c8a080'],life:.7,h:20+i*2});debris(x,GY-3,5,['#6a4a3a','#a87a5a'],90);shake_(6)});at(.75,()=>{bHurt(m,2.2);shake_(16,.4,'#ffb0b0');sfx('boom');fx.push({k:'ring',x:bx*K,y:GY*K,t:0,life:.4,r:160,col:'#ff3a4a'})});break;
  case '강철 돌진':at(0,()=>{bfx.push({k:'dashL',x0:m.x,life:.35});m.lunge=.4;sfx('whoosh')});for(let i=0;i<3;i++)at(.2+i*.12,()=>{ufx.push({k:'slash',x:bx+4,y:GY-20,a:rnd(-.8,.8),len:60,col:'#d8e0f0',life:.4});bHurt(m,.9);shake_(10,.2,'#ffffff');sfx('crit')});break;
  case '혈장미 폭풍':at(0,()=>{ufx.push({k:'tint',col:'#2a0010',a:.45,life:1.6});for(let i=0;i<26;i++)bfx.push({k:'petal',x:m.x+rnd(-10,20),y:GY-rnd(20,60),vx:rnd(-160,-90),vy:rnd(-30,30),life:1.4,d:i*.03})});
    for(let i=0;i<4;i++)at(.6+i*.15,()=>{ufx.push({k:'spike',x:bx-10+i*7,col:['#0e2a14','#2e7a3a','#d8183e'],life:.7,h:22+i*3});bHurt(m,.55);shake_(5,.12,'#ffb0c8')});break;
  case '매혹의 대낫':at(0,()=>{m.lunge=.3;sfx('whoosh')});[0,.25].forEach((d,i)=>at(.15+d,()=>bfx.push({k:'cres',x:m.x-10,y:GY-24-i*6,tx:bx,col:'#ff5a9a',life:.5,hit:()=>{bHurt(m,1.1);shake_(10,.25,'#ffc0d8');sfx('crit')}})));break;
  case '흑염참':at(0,()=>{ufx.push({k:'tint',col:'#0a0018',a:.5,life:1.5});m.lunge=.3});[0,.22,.44].forEach((d,i)=>at(.2+d,()=>bfx.push({k:'cres',x:m.x-10,y:GY-18-i*7,tx:bx,col:'#b060ff',dark:1,life:.45,hit:()=>{bHurt(m,.8);shake_(9,.2,'#e0c0ff');sfx('crit')}})));break;
  case '흑염 기둥':at(0,()=>{for(let i=0;i<3;i++)bfx.push({k:'mark',x:bx-12+i*12,life:.6})});at(.6,()=>{for(let i=0;i<3;i++)ufx.push({k:'pillar',x:bx-12+i*12,col:'#7a2ad8',life:.6,w:26});bHurt(m,2);shake_(18,.5,'#d0a0ff');sfx('boom')});break;
  case '마검 낙뢰':at(0,()=>ufx.push({k:'tint',col:'#0a0018',a:.55,life:1.6}));for(let i=0;i<6;i++)at(.3+i*.14,()=>{const x=bx-16+rnd(0,32);ufx.push({k:'bolt',x,col:'#c88aff',life:.25,w:1.3});if(Math.abs(x-bx)<14)bHurt(m,.5);shake_(8,.2,'#e8d0ff');sfx('bolt')});break;
  case '마왕의 포효':at(0,()=>{ufx.push({k:'tint',col:'#2a0006',a:.6,life:1.6});sfx('boss')});at(.4,()=>{fx.push({k:'ring',x:(m.x-10)*K,y:(GY-30)*K,t:0,life:.8,r:520,col:'#ff2a5a'});shake_(22,.6,'#ffb0c0');bHurt(m,1.6);sfx('boom')});for(let i=0;i<4;i++)at(.7+i*.12,()=>{ufx.push({k:'bolt',x:bx+rnd(-10,10),col:'#ff4a6a',life:.25,w:1.2});bHurt(m,.35)});break;
  case '종말의 운석':at(0,()=>ufx.push({k:'tint',col:'#2a0800',a:.55,life:2}));at(.2,()=>ufx.push({k:'meteor',x:bx,life:.9}));at(1.1,()=>{shake_(28,.85,'#ffd0a0');sfx('boom');fx.push({k:'ring',x:bx*K,y:GY*K,t:0,life:.6,r:300,col:'#ff6a1a'});for(let i=0;i<8;i++)ufx.push({k:'flame',x:bx-30+i*10,life:.9,d:i*.03});bHurt(m,3)});break;
  }
  ev.sort((a,b)=>a[0]-b[0]);bsk={m,ev,t:0};bskCut={t:0,type:m.type,s:m.s,n:sk.n,col:sk.col};stop=Math.max(stop,.65);sfx('boss')}
function bskSim(dt){const m=bossNow();if(!m){bsk=null;bskCd=4;return}
  if(!bsk){if(m.x-bear.x<120&&!bear.dead)bskCd-=dt;if(bskCd<=0&&!ult){bskCd=m.type.startsWith('mega')?7:8;bossSkill(m)}}
  else{bsk.t+=dt;while(bsk.ev.length&&bsk.ev[0][0]<=bsk.t)bsk.ev.shift()[1]();if(!bsk.ev.length&&bsk.t>1.2)bsk=null}
  bfx=bfx.filter(f=>{f.t=(f.t||0)+dt;if(f.d&&f.t<f.d)return true;const tt=f.t-(f.d||0);
    if(f.k==='petal'){f.x+=f.vx*dt;f.y+=f.vy*dt+Math.sin(tt*8)*.3}
    if(f.k==='cres'&&!f.done&&tt/f.life>=.95){f.done=1;f.hit&&f.hit()}
    return tt<f.life})}
{const _ss=skillSim;skillSim=function(dt,ws){_ss(dt,ws);if(mode==='boss')bskSim(dt);else{bsk=null;bfx=[]}}}
function bfxRender(){bfx.forEach(f=>{if(f.d&&f.t<f.d)return;const tt=f.t-(f.d||0),u=Math.min(1,tt/f.life),fa=u>.7?1-(u-.7)/.3:1;X.save();
  if(f.k==='petal'){X.translate(f.x*K,f.y*K);X.rotate(tt*9);X.globalAlpha=fa;X.fillStyle='#d8183e';X.beginPath();X.ellipse(0,0,7,4,0,0,7);X.fill();X.fillStyle='#ff7a9a';X.beginPath();X.ellipse(-1,-1,3,1.6,0,0,7);X.fill()}
  if(f.k==='cres'){const x=(f.x+(f.tx-f.x)*u)*K,y=f.y*K;X.translate(x,y);X.globalCompositeOperation=f.dark?'source-over':'lighter';X.globalAlpha=.95;
    X.shadowColor=f.col;X.shadowBlur=18;X.fillStyle=f.dark?'#14041e':f.col;X.beginPath();X.arc(0,0,46,-1.25,1.25);X.arc(-16,0,40,1.15,-1.15,true);X.fill();X.strokeStyle=f.col;X.lineWidth=4;X.beginPath();X.arc(0,0,46,-1.25,1.25);X.stroke();X.strokeStyle='#fff';X.lineWidth=1.5;X.stroke()}
  if(f.k==='dashL'){X.globalCompositeOperation='lighter';X.globalAlpha=1-u;const y=(GY-24)*K;for(let i=0;i<5;i++){X.strokeStyle=i===2?'#fff':'#a8b4cc';X.lineWidth=i===2?6:3;X.beginPath();X.moveTo(f.x0*K,y-20+i*10);X.lineTo(bear.x*K,y-20+i*10);X.stroke()}}
  if(f.k==='mark'){const x=f.x*K,y=GY*K;X.globalAlpha=.5+.5*Math.sin(tt*30);X.strokeStyle='#b060ff';X.lineWidth=4;X.beginPath();X.ellipse(x,y,40,10,0,0,7);X.stroke();X.fillStyle='rgba(120,40,220,.25)';X.fill()}
  X.restore()})}
{const _sr=skillRender;skillRender=function(){_sr();bfxRender()}}
/* 보스 컷인 (오른쪽에서, 붉은 띠) */
function bskOverlay(rdt){if(!bskCut)return;const c=bskCut;c.t+=rdt;const D=.7;if(c.t>D){bskCut=null;return}
  const W2=cv.width,H2=cv.height,u=c.t/D,inn=Math.min(1,c.t/.12),out=u>.8?1-(u-.8)/.2:1;X.save();X.globalAlpha=.55*out;X.fillStyle='#000';X.fillRect(0,0,W2,H2);X.globalAlpha=out;
  const cy=H2*.46,bh=H2*.32,sl=(1-inn)*W2*1.2;X.translate(sl,0);
  X.fillStyle='#140208';X.beginPath();X.moveTo(0,cy-bh/2-40);X.lineTo(W2,cy-bh/2-10);X.lineTo(W2,cy+bh/2+10);X.lineTo(0,cy+bh/2-20);X.fill();
  const g=X.createLinearGradient(W2,0,0,0);g.addColorStop(0,'#8a0a1e');g.addColorStop(1,'#14020a');X.fillStyle=g;X.beginPath();X.moveTo(0,cy-bh/2-30);X.lineTo(W2,cy-bh/2);X.lineTo(W2,cy+bh/2);X.lineTo(0,cy+bh/2-30);X.fill();
  X.globalCompositeOperation='lighter';X.globalAlpha=.22*out;X.fillStyle=c.col;for(let i=0;i<14;i++){const yy=cy-bh/2+((i*37)%bh),xx=W2-(((i*173+c.t*2600)%(W2+300))-150);X.fillRect(xx-120,yy,120+i*8,3)}X.globalCompositeOperation='source-over';X.globalAlpha=out;
  X.save();X.beginPath();X.moveTo(0,cy-bh/2-30);X.lineTo(W2,cy-bh/2);X.lineTo(W2,cy+bh/2);X.lineTo(0,cy+bh/2-30);X.clip();
  const F=mobHD(c.type,c.s),im=F.fr[0];const sw=im.width*.62,sh=im.height*.4,sx=im.width*.19,sy=im.height*.02;const dh=bh*1.25,dw=dh*sw/sh;X.imageSmoothingEnabled=true;X.drawImage(im,sx,sy,sw,sh,W2-dw-W2*.02-c.t*30,cy-bh/2-14,dw,dh);X.restore();
  const tx=W2*.36,ty=cy+4,zs=1+Math.max(0,.15-c.t)*3;X.translate(tx,ty);X.scale(zs,zs);X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';
  X.font='20px "Jal","Jua",sans-serif';const nm2=MOBNAME[c.type]||'';X.lineWidth=7;X.strokeStyle='#140c0a';X.strokeText(nm2,0,-42);X.fillStyle='#ffb0b8';X.fillText(nm2,0,-42);
  X.font='44px "Jal","Jua",sans-serif';X.lineWidth=13;X.strokeText(c.n,0,8);const g2=X.createLinearGradient(0,-20,0,30);g2.addColorStop(0,'#ffffff');g2.addColorStop(1,c.col);X.fillStyle=g2;X.fillText(c.n,0,6);X.restore()}
{const _rn=render;render=function(rdt){_rn(rdt);if(screen==='game')bskOverlay(rdt)}}
</script>
