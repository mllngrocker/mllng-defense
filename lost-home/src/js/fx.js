/* ---------- effects: particles, damage numbers, hit flash, sound ---------- */
let DPR=Math.min(window.devicePixelRatio||1,2);
const parts=[],nums=[];
function part(o){if(parts.length<600)parts.push(Object.assign({vx:0,vy:0,g:0,life:.6,ml:.6,size:4,col:'#fff',type:'spark',rot:0,vr:0,drag:.9},o));}
function sparks(x,y,n,col,spd=260){for(let i=0;i<n;i++){const a=rnd(-Math.PI,Math.PI),v=rnd(.3,1)*spd;part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:500,life:rnd(.25,.5),size:rnd(2,4.5),col,type:'spark'});}}
function debris(x,y,n,col,k){for(let i=0;i<n;i++){const a=rnd(-2.8,-.3),v=rnd(120,320);part({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:900,life:rnd(.5,.9),size:rnd(3,7)*k,col,type:'chunk',rot:rnd(0,6),vr:rnd(-12,12),drag:.98});}}
function dust(x,y,n,k){for(let i=0;i<n;i++)part({x:x+rnd(-12,12)*k,y,vx:rnd(-50,50),vy:rnd(-40,-10),life:rnd(.4,.8),size:rnd(6,12)*k,col:'rgba(255,255,255,.5)',type:'puff',drag:.94});}
function ring(x,y,col,size,life=.35){part({x,y,life,ml:life,size,col,type:'ring'});}
function slash(x,y,k,crit){part({x,y,life:.18,ml:.18,size:60*k,col:crit?'#ffe27a':'#ffffff',type:'slash',rot:rnd(-.3,.3)});}
// new numbers near the same spot stack upward instead of piling on top of each other
function num(x,y,v,kind){if(S.set&&!S.set.dmg&&(kind===''||kind==='crit'||kind==='hurt'))return;
 const near=nums.filter(n=>n.life>.55&&Math.abs(n.x-x)<46&&Math.abs(n.y0-y)<40).length;
 nums.push({x:x+rnd(-10,10),y:y-near*18,y0:y,vy:-70,life:1,txt:typeof v==='string'?v:fmt(v),v:typeof v==='number'?v:0,kind,rot:rnd(-.06,.06)});}
// damage colour by unit: [min value, light, main] — 만 yellow, 억 orange, 조 purple, 경 green, 해 pink
const DMG_TIER=[[1e20,'#ffe3ee','#ff4a7d'],[1e16,'#e4ffe0','#3fd36a'],[1e12,'#f1e2ff','#a96bff'],[1e8,'#fff1c8','#ff8a3d'],[1e4,'#fffbe8','#ffcf4a'],[0,'#ffffff','#cfdcff']];
const NAVY='#121a36';
function burst(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(performance.now()/900);c.globalAlpha=a*.85;c.beginPath();
 for(let i=0;i<16;i++){const rr=i%2?r*.42:r;c.lineTo(Math.cos(i*Math.PI/8)*rr,Math.sin(i*Math.PI/8)*rr*.62);}c.closePath();
 const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.35,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fill();c.restore();}
function drawDmg(c,x,y,txt,v,crit,size,alpha,rot=0){const[,hi,main]=DMG_TIER.find(t=>v>=t[0]);const sz=size*(crit?1.3:1);
 c.save();c.translate(x,y);c.rotate(rot);c.globalAlpha=alpha;c.font=`${sz}px Jal, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 if(crit){burst(c,0,-sz*.05,sz*1.15,main,alpha);c.font=`${sz*.36}px Jal, sans-serif`;c.lineWidth=sz*.1;c.strokeStyle=NAVY;c.strokeText('CRITICAL',0,-sz*.78);c.fillStyle=hi;c.fillText('CRITICAL',0,-sz*.78);c.font=`${sz}px Jal, sans-serif`;}
 c.shadowColor='rgba(8,12,30,.45)';c.shadowOffsetY=sz*.08;c.shadowBlur=0;c.lineWidth=sz*(crit?.2:.16);c.strokeStyle=NAVY;c.strokeText(txt,0,0);c.shadowColor='transparent';
 const g=c.createLinearGradient(0,-sz*.45,0,sz*.45);g.addColorStop(0,hi);g.addColorStop(.55,main);g.addColorStop(1,shade(main,-.18));c.fillStyle=g;c.fillText(txt,0,0);
 if(v>=1e4||crit){c.globalCompositeOperation='lighter';c.globalAlpha=alpha*.35;c.shadowColor=main;c.shadowBlur=sz*.6;c.fillText(txt,0,0);}
 c.restore();}
function stepFx(dt){
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;if(p.life<=0){parts.splice(i,1);continue;}
  if(p.type==='coin'){p.t=(p.t||0)+dt;if(p.t>.45){const k=Math.min(1,(p.t-.45)/.35);p.x=lerp(p.x,p.tx,k*.35);p.y=lerp(p.y,p.ty,k*.35);if(Math.hypot(p.x-p.tx,p.y-p.ty)<12){parts.splice(i,1);sfx('coin');pulseGold();continue;}p.life=1;continue;}}
  p.vy+=p.g*dt;const d=Math.pow(p.drag,dt*60);p.vx*=d;p.vy*=d;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
  if(p.type==='coin'&&p.y>GY-4){p.y=GY-4;p.vy*=-.45;p.vx*=.6;}}
 for(let i=nums.length-1;i>=0;i--){const n=nums[i];n.life-=dt;n.y+=n.vy*dt;n.vy*=Math.pow(.9,dt*60);if(n.life<=0)nums.splice(i,1);}
}
function drawFx(c,k){
 for(const p of parts){const a=clamp(p.life/p.ml,0,1);c.globalAlpha=a;
  if(p.type==='spark'){c.globalCompositeOperation='lighter';c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.size*a+.5,0,TAU);c.fill();c.globalCompositeOperation='source-over';}
  else if(p.type==='chunk'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.fillRect(-p.size/2,-p.size/2,p.size,p.size);c.strokeStyle=OL;c.lineWidth=1.2;c.strokeRect(-p.size/2,-p.size/2,p.size,p.size);c.restore();}
  else if(p.type==='puff'){c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.size*(1.6-a*.6),0,TAU);c.fill();}
  else if(p.type==='ring'){c.strokeStyle=p.col;c.lineWidth=3*a+1;c.beginPath();c.ellipse(p.x,p.y,p.size*(1.3-a),p.size*(1.3-a)*.35,0,0,TAU);c.stroke();}
  else if(p.type==='slash'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.globalCompositeOperation='lighter';const r=p.size*(1.15-a*.15);
   c.beginPath();c.arc(-r*.55,0,r,-1.1,1.1);c.arc(-r*.55-r*.28,0,r*.92,1.0,-1.0,true);c.closePath();c.fillStyle=p.col;c.fill();c.globalCompositeOperation='source-over';c.restore();}
  else if(p.type==='coin'){c.globalAlpha=1;c.save();c.translate(p.x,p.y);c.scale(Math.abs(Math.cos(p.rot*2))*.8+.2,1);c.beginPath();c.arc(0,0,p.size,0,TAU);
   const g=c.createRadialGradient(-2,-2,1,0,0,p.size);g.addColorStop(0,'#fff6c0');g.addColorStop(.5,'#ffcf3d');g.addColorStop(1,'#d48a10');c.fillStyle=g;c.fill();c.lineWidth=1.4;c.strokeStyle='#8a5a00';c.stroke();c.restore();}
 }
 for(const n of nums){const age=1-n.life,a=n.life<.3?n.life/.3:1,pop=age<.12?1.35-age/.12*.35:1;
  if(n.kind===''||n.kind==='crit'){drawDmg(c,n.x,n.y,n.txt,n.v,n.kind==='crit',19*k*pop,a,n.rot);continue;}
  const sz=(n.kind==='hurt'?17:14)*k*pop,col=n.kind==='hurt'?['#ffd6dc','#ff5b6e']:n.kind==='gold'?['#fff6cc','#ffc93d']:['#e2ffd8','#5fd35a'];
  c.save();c.globalAlpha=a;c.font=`${sz}px Jal, sans-serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=sz*.18;c.strokeStyle=NAVY;c.strokeText(n.txt,n.x,n.y);
  const g=c.createLinearGradient(0,n.y-sz*.45,0,n.y+sz*.45);g.addColorStop(0,col[0]);g.addColorStop(1,col[1]);c.fillStyle=g;c.fillText(n.txt,n.x,n.y);c.restore();}
 c.globalAlpha=1;
}
// draws an entity; when flashing, renders into a scratch canvas so the white tint only covers the sprite
const scratch=document.createElement('canvas');scratch.width=760;scratch.height=760;const sctx=scratch.getContext('2d');
function drawEnt(c,fn,m,x,y,s,flash=0,alpha=1){
 if(flash>.03){sctx.setTransform(1,0,0,1,0,0);sctx.clearRect(0,0,760,760);sctx.setTransform(DPR*s,0,0,DPR*s,380,680);fn(sctx,m);
  sctx.setTransform(1,0,0,1,0,0);sctx.globalCompositeOperation='source-atop';sctx.fillStyle=`rgba(255,255,255,${Math.min(1,flash)*.85})`;sctx.fillRect(0,0,760,760);sctx.globalCompositeOperation='source-over';
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=alpha;c.drawImage(scratch,x*DPR-380,y*DPR-680);c.restore();}
 else{c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;fn(c,m);c.restore();}
}
/* ---------- sound (synthesized, no files) ---------- */
let AC=null,master=null,noiseBuf=null;
function audioInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.55;master.connect(AC.destination);
 noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}catch(e){AC=null;}}
addEventListener('pointerdown',()=>{audioInit();if(AC&&AC.state==='suspended')AC.resume();},{passive:true});
const _last={};
function tone(f0,f1,dur,type='sine',vol=.2,delay=0){const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);}
function noise(dur,f,vol=.2,q=1,type='bandpass'){const t=AC.currentTime,s=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;fl.type=type;fl.frequency.value=f;fl.Q.value=q;
 g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(master);s.start(t);s.stop(t+dur);}
function sfx(n){if(!AC||!S.snd||(S.set&&!S.set.sfx))return;const now=performance.now();if(now-(_last[n]||0)<(n==='coin'?45:30))return;_last[n]=now;
 switch(n){
  case'hit':noise(.09,900,.25,.8);tone(180,60,.09,'sine',.25);break;
  case'crit':noise(.14,2200,.3,.7);tone(320,90,.14,'triangle',.25);tone(1200,1800,.08,'sine',.08);break;
  case'kill':tone(520,1040,.12,'sine',.16);noise(.12,1600,.12,1.2);break;
  case'coin':tone(1320,1320,.06,'square',.04);tone(1760,1760,.09,'square',.04,.05);break;
  case'hurt':tone(220,110,.16,'sawtooth',.08);break;
  case'level':[523,659,784,1047].forEach((f,i)=>tone(f,f,.18,'triangle',.14,i*.08));break;
  case'boss':tone(110,98,.9,'sawtooth',.12);tone(165,147,.9,'sawtooth',.08);noise(.8,300,.12,.5,'lowpass');break;
  case'clear':[784,988,1175,1568].forEach((f,i)=>tone(f,f,.22,'triangle',.13,i*.09));break;
  case'buy':tone(880,1320,.08,'sine',.1);break;
  case'shot':tone(700,300,.1,'square',.04);break;
 }}
