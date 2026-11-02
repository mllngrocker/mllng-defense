<script>
/* ================= sound: synthesized sfx + chiptune bgm ================= */
let AC=null,MG=null,SFXG=null,BGMG=null,noiseBuf=null;
function audioOn(){return S.snd!==false}
function ensureAudio(){if(AC)return;try{AC=new (window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=audioOn()?1:0;MG.connect(AC.destination);
  SFXG=AC.createGain();SFXG.gain.value=.5;SFXG.connect(MG);BGMG=AC.createGain();BGMG.gain.value=.16;BGMG.connect(MG);
  noiseBuf=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}catch(e){AC=null}}
addEventListener('pointerdown',()=>{ensureAudio();if(AC&&AC.state==='suspended')AC.resume()},{capture:true});
function tone(f0,f1,dur,type,vol,delay,dest){const t=AC.currentTime+(delay||0);const o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(dest||SFXG);o.start(t);o.stop(t+dur+.02)}
function noise(dur,vol,hp,delay){const t=AC.currentTime+(delay||0);const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type='highpass';f.frequency.value=hp||800;const g=AC.createGain();
  g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(SFXG);s.start(t);s.stop(t+dur+.02)}
const lastS={};
function sfx(n,arg){if(!AC||!audioOn())return;const now=performance.now();if(lastS[n]&&now-lastS[n]<(n==='coin'?45:n==='hit'?35:20))return;lastS[n]=now;
  switch(n){
    case'hit':tone(160,60,.08,'square',.32);noise(.05,.18,1500);break;
    case'crit':tone(220,50,.16,'square',.4);noise(.14,.3,600);tone(1400,700,.12,'square',.12,.02);break;
    case'kick':tone(120,45,.12,'triangle',.5);noise(.06,.2,900);break;
    case'whiff':noise(.07,.1,2500);break;
    case'shot':noise(.05,.22,2200);tone(420,120,.05,'square',.12);break;
    case'throw':tone(900,1800,.08,'triangle',.12);break;
    case'magic':tone(300,1200,.25,'sawtooth',.1);tone(600,2400,.25,'sine',.08,.03);break;
    case'bolt':noise(.25,.35,300);tone(90,40,.3,'sawtooth',.25);break;
    case'boom':noise(.5,.5,120);tone(80,30,.5,'triangle',.6);break;
    case'whoosh':noise(.18,.15,1200);break;
    case'beam':tone(180,240,.5,'sawtooth',.12);tone(360,480,.5,'square',.05);break;
    case'coin':tone(1320,1320,.05,'square',.08);tone(1760,1760,.08,'square',.08,.05);break;
    case'level':[523,659,784,1047].forEach((f,i)=>tone(f,f,.14,'square',.16,i*.08));break;
    case'drop':{const g=arg||0;const sc=[523,659,784,988,1175,1319,1568];for(let i=0;i<=Math.min(6,2+g);i++)tone(sc[i],sc[i],.16,'square',.12+g*.02,i*.07);if(g>=3){tone(2093,2093,.5,'triangle',.15,.55);noise(.4,.12,4000,.55)}}break;
    case'boss':tone(110,110,.6,'sawtooth',.25);tone(116,116,.6,'sawtooth',.2);tone(55,55,.8,'square',.25,.1);break;
    case'clear':[784,988,1175,1568].forEach((f,i)=>tone(f,f,.18,'square',.15,i*.09));break;
    case'ui':tone(880,880,.04,'square',.08);break;
    case'buy':tone(660,990,.06,'square',.08);break;
    case'pop':noise(.12,.3,1800);tone(300,900,.1,'square',.12);break;
    case'hurt':tone(200,90,.1,'sawtooth',.15);break;
  }}
const BGM={
  beach:{bpm:132,bass:[48,48,55,55,45,45,52,52,41,41,48,48,43,43,50,50],lead:[72,0,76,79,0,76,74,0,72,0,69,72,0,74,76,0,77,0,76,74,0,72,69,0,71,0,72,74,0,71,67,0]},
  forest:{bpm:118,bass:[45,45,52,52,41,41,48,48,43,43,50,50,40,40,47,47],lead:[69,0,72,0,76,74,72,0,71,0,67,0,69,71,72,0,74,0,72,71,69,0,67,0,64,0,67,69,0,71,69,0]},
  desert:{bpm:112,bass:[40,40,47,47,41,41,40,40,38,38,45,45,41,41,40,40],lead:[64,0,65,68,0,69,68,65,64,0,0,62,64,0,65,0,68,0,69,71,0,72,71,69,68,0,65,0,64,0,0,0]},
  oil:{bpm:96,bass:[38,38,45,45,41,41,36,36,38,38,45,45,43,43,41,40],lead:[62,0,0,65,0,69,0,67,65,0,62,0,60,0,62,0,65,0,0,69,0,72,0,70,69,0,67,0,65,0,0,0]},
  city:{bpm:126,bass:[36,0,36,43,0,43,46,0,39,0,39,46,0,46,43,41],lead:[67,0,70,0,72,70,67,0,0,65,67,0,63,0,60,0,67,0,70,0,72,75,72,70,67,0,65,0,63,65,67,0]},
  mine:{bpm:104,bass:[33,33,40,40,36,36,31,31,33,33,40,40,38,38,36,35],lead:[57,0,60,0,0,64,62,60,57,0,0,55,57,0,60,0,64,0,0,67,65,64,62,0,60,0,57,0,55,0,57,0]},
  fire:{bpm:144,bass:[38,38,38,41,38,38,43,41,36,36,36,40,36,36,41,40],lead:[74,0,72,74,0,77,0,74,72,0,69,0,72,0,74,0,77,0,79,77,0,74,72,0,69,0,72,0,74,0,0,0]},
  acid:{bpm:110,bass:[40,0,47,0,43,0,47,0,38,0,45,0,42,0,45,0],lead:[64,0,0,71,0,70,0,67,0,64,0,0,63,0,64,0,71,0,0,74,0,72,0,71,0,67,0,0,66,0,67,0]},
  swamp:{bpm:92,bass:[31,31,38,38,34,34,29,29,31,31,38,38,36,36,34,33],lead:[55,0,0,58,0,0,62,0,61,0,58,0,55,0,0,0,58,0,0,62,0,65,0,63,62,0,58,0,0,55,0,0]},
  final:{bpm:160,bass:[35,35,35,38,35,35,41,40,33,33,33,36,33,33,40,38],lead:[71,0,74,0,77,76,0,74,71,0,70,0,71,0,0,0,78,0,77,0,76,74,0,71,70,0,71,74,77,0,76,0]},
  boss:{bpm:150,bass:[40,40,40,43,40,40,46,45,40,40,40,43,47,46,45,43],lead:[64,0,67,0,70,69,0,67,64,0,63,0,64,0,0,0,71,0,70,0,69,67,0,64,63,0,64,67,70,0,69,0]},
};
let bgmName=null,bgmStep=0,bgmNext=0;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function bgmTick(){if(!AC||!audioOn()||!bgmName)return;const B=BGM[bgmName],st=60/B.bpm/2;
  if(bgmNext<AC.currentTime)bgmNext=AC.currentTime+.05;
  while(bgmNext<AC.currentTime+.25){const i=bgmStep%32,t=bgmNext-AC.currentTime;
    if(i%2===0){const b=B.bass[(i/2)%16];tone(mtof(b),0,st*1.8,'triangle',.5,t,BGMG)}
    const l=B.lead[i];if(l)tone(mtof(l),0,st*.9,'square',.22,t,BGMG);
    if(i%4===0)tone(150,40,.06,'sine',.5,t,BGMG);
    bgmStep++;bgmNext+=st}}
function setBgm(n){if(bgmName!==n){bgmName=n;bgmStep=0}}
setInterval(bgmTick,90);
function sndToggle(){S.snd=!audioOn();if(MG)MG.gain.value=audioOn()?1:0;$('#snd').classList.toggle('off',!audioOn());save()}

/* ================= skills ================= */
const SKILLS=[
  {id:'glacier',n:'빙하 낙하',cd:12,mul:8,desc:'하늘에서 빙하 덩어리를 떨어뜨려 주변을 박살내요'},
  {id:'tornado',n:'판자 회오리',cd:18,mul:1.1,ticks:10,desc:'판자 회오리가 몹을 빨아들이며 갈아버려요'},
  {id:'beam',n:'북극 한파 레이저',cd:26,mul:.9,ticks:12,desc:'화면 끝까지 얼려버리는 레이저를 뿜어요'},
];
const skCd=[3,6,9];let skFx=[],skillLock=0;
const skLv=i=>(S.skl&&S.skl[SKILLS[i].id])||1;
const skMul=i=>SKILLS[i].mul*(1+.3*(skLv(i)-1));
const skCost=i=>300*Math.pow(1.6,skLv(i)-1);
function skPrims(id){const P=[];
  if(id==='glacier'){P.push(Pg([[5,4],[19,3],[21,15],[12,21],[3,15]],'ice',1));P.push(Cp({x:8,y:7},{x:11,y:13},.6,.6,null,2,{col:WHITE}))}
  if(id==='tornado'){P.push(E(12,6,9,3,'fur',1));P.push(E(12,11,7,2.6,'furD',1.2));P.push(E(12,16,5,2.2,'fur',1.4));P.push(E(12,20,3,1.8,'furD',1.6));P.push(Cp({x:3,y:12},{x:9,y:9},1.4,1.4,'plank',2))}
  if(id==='beam'){P.push(Cp({x:2,y:12},{x:22,y:12},4,4,'ice',1));P.push(Cp({x:2,y:12},{x:22,y:12},1.4,1.4,null,2,{col:WHITE}));P.push(E(5,12,4,4,'snout',3))}
  return P}
function castSkill(i,auto){if(skCd[i]>0||bear.dead||screen!=='game')return false;const live=mobs.filter(m=>!m.dead);if(!live.length)return false;
  const f=live.sort((a,b)=>a.x-b.x)[0];if(auto&&f.x-bear.x>150)return false;
  skCd[i]=SKILLS[i].cd;S.cnt.skill=(S.cnt.skill||0)+1;
  const id=SKILLS[i].id;
  if(id==='glacier'){skFx.push({k:'glacier',x:Math.min(f.x+6,VW-20),t:0,hit:false});sfx('whoosh');skillLock=.5;play(bear,'win');setTimeout(()=>{if(bear.name==='win')play(bear,'idle')},500)}
  if(id==='tornado'){skFx.push({k:'tornado',x:bear.x+46,t:0,tick:0,life:2.4});sfx('whoosh');}
  if(id==='beam'){skFx.push({k:'beam',t:0,tick:0,life:1.5});skillLock=1.5;play(bear,'win');setTimeout(()=>{if(bear.name==='win')play(bear,'idle')},1500);sfx('beam')}
  banner(SKILLS[i].n+'!','#62d6ff');return true}
const SKILLS_ON=false;
function skillSim(dt,ws){if(!SKILLS_ON){skillLock=0;return}
  for(let i=0;i<3;i++)skCd[i]=Math.max(0,skCd[i]-dt);skillLock=Math.max(0,skillLock-dt);
  if(S.auto)for(let i=0;i<3;i++)if(skCd[i]<=0&&castSkill(i,true))break;
  skFx=skFx.filter(s=>{s.t+=dt;
    if(s.k==='glacier'){s.x-=ws*dt;if(!s.hit&&s.t>=.38){s.hit=true;mobs.filter(m=>!m.dead&&Math.abs(m.x-s.x)<46).forEach(m=>{hitTarget(m,skMul(0),Math.random()*100<stat('crit'),'ice');if(!m.boss){m.vy=-140;m.air=Math.max(m.air,1)}});
        shake=18;flash=.4;flashC='#d6f2ff';stop=.08;sfx('boom');dust(s.x,14);debris(s.x,GY-6,20,['#ffffff','#a2dcff','#4f9ee0'],150);fx.push({k:'ring',x:s.x*K,y:GY*K,t:0,life:.45,r:220,col:'#a2dcff'})}
      return s.t<1.1}
    if(s.k==='tornado'){const live=mobs.filter(m=>!m.dead);const tg=live.sort((a,b)=>a.x-b.x)[0];if(tg)s.x+=(tg.x-s.x)*Math.min(1,dt*2);s.x-=ws*dt;
      live.forEach(m=>{if(Math.abs(m.x-s.x)<60&&!m.boss)m.x+=(s.x+8-m.x)*Math.min(1,dt*3)});
      s.tick-=dt;if(s.tick<=0&&s.t<s.life){s.tick=s.life/SKILLS[1].ticks;live.filter(m=>Math.abs(m.x-s.x)<34).forEach(m=>{hitTarget(m,skMul(1),Math.random()*100<stat('crit'),'tornado');if(!m.boss&&m.air<4){m.vy=-60;m.air=Math.max(m.air,1)}});sfx('whoosh')}
      return s.t<s.life+.3}
    if(s.k==='beam'){s.tick-=dt;if(s.tick<=0&&s.t<s.life){s.tick=s.life/SKILLS[2].ticks;mobs.filter(m=>!m.dead&&m.x>bear.x).forEach(m=>{hitTarget(m,skMul(2),Math.random()*100<stat('crit'),'beam');m.frz=1.5});shake=Math.max(shake,5)}return s.t<s.life+.2}
    return false});
}
function skillRender(){
  skFx.forEach(s=>{
    if(s.k==='glacier'){const y=s.t<.38?(-40+(GY-20+40)*(s.t/.38)**2):GY-20;const x=s.x*K,yy=y*K,a=s.t>.6?Math.max(0,1-(s.t-.6)/.5):1;X.save();X.globalAlpha=a;X.translate(x,yy);
      X.fillStyle='#1c1424';X.beginPath();X.moveTo(-64,-70);X.lineTo(58,-82);X.lineTo(72,30);X.lineTo(0,62);X.lineTo(-74,28);X.closePath();X.fill();
      X.fillStyle='#4f9ee0';X.beginPath();X.moveTo(-58,-64);X.lineTo(52,-75);X.lineTo(65,26);X.lineTo(0,55);X.lineTo(-67,24);X.closePath();X.fill();
      X.fillStyle='#a2dcff';X.beginPath();X.moveTo(-58,-64);X.lineTo(52,-75);X.lineTo(20,-10);X.lineTo(-30,0);X.closePath();X.fill();
      X.fillStyle='#ffffff';X.fillRect(-40,-50,12,30);X.fillRect(-20,-58,6,14);X.restore();
      if(s.t<.38){X.strokeStyle='rgba(200,240,255,.6)';X.lineWidth=6;for(let i=-2;i<=2;i++){X.beginPath();X.moveTo(x+i*24,yy-90);X.lineTo(x+i*24,yy-180);X.stroke()}}}
    if(s.k==='tornado'){const x=s.x*K,base=GY*K,a=s.t>s.life?Math.max(0,1-(s.t-s.life)/.3):Math.min(1,s.t*4);X.save();X.globalAlpha=a*.9;
      for(let i=0;i<9;i++){const yy=base-i*22,w=30+i*11,ph=T*14+i*.8;X.strokeStyle=i%2?'#dff4ff':'#9fd8ff';X.lineWidth=7;X.beginPath();X.ellipse(x+Math.sin(ph)*8,yy,w,8+i*.6,0,0,Math.PI*2);X.stroke()}
      for(let i=0;i<6;i++){const ang=T*10+i*1.05,rr=40+i*8,px2=x+Math.cos(ang)*rr,py=base-50-i*18+Math.sin(ang)*10;X.save();X.translate(px2,py);X.rotate(ang*2);X.fillStyle='#1c1424';X.fillRect(-15,-5,30,10);X.fillStyle='#c47b38';X.fillRect(-13,-3,26,6);X.restore()}
      X.restore()}
    if(s.k==='beam'){const a=s.t>s.life?Math.max(0,1-(s.t-s.life)/.2):Math.min(1,s.t*8);const x0=(bear.x+14)*K,y0=(GY-27)*K,w=1+Math.sin(T*50)*.15;X.save();X.globalAlpha=a;X.globalCompositeOperation='lighter';
      [[44,'rgba(80,170,255,.5)'],[28,'rgba(160,220,255,.8)'],[12,'#ffffff']].forEach(([h,c])=>{X.fillStyle=c;X.fillRect(x0,y0-h*w/2,cv.width-x0,h*w)});
      for(let i=0;i<8;i++){const xx=x0+((T*900+i*90)%(cv.width-x0));X.fillStyle='#fff';X.fillRect(xx,y0-24+((i*37)%48),18,3)}
      const g=X.createRadialGradient(x0,y0,0,x0,y0,60);g.addColorStop(0,'#fff');g.addColorStop(1,'rgba(120,200,255,0)');X.fillStyle=g;X.beginPath();X.arc(x0,y0,60,0,7);X.fill();X.restore()}
  })}
function skillButtons(){const box=$('#skills');SKILLS.forEach((sk,i)=>{const b=document.createElement('button');b.className='sk';b.id='sk'+i;b.setAttribute('aria-label',sk.n);
  const c=document.createElement('canvas');c.className='pix';c.width=48;c.height=48;const r=raster(skPrims(sk.id),24,24);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(r,0,0,48,48);
  b.appendChild(c);b.insertAdjacentHTML('beforeend','<i></i><em></em>');b.addEventListener('click',()=>{if(!castSkill(i))sfx('ui')});box.appendChild(b)})}
function skillHud(){SKILLS.forEach((s,i)=>{const b=$('#sk'+i);if(!b)return;b.querySelector('i').style.setProperty('--cd',(skCd[i]/s.cd*100)+'%');b.querySelector('em').textContent=skCd[i]>0?Math.ceil(skCd[i]):''})}

/* ================= combat power ================= */
function CP(){const w=W().w,k=KIND_MUL[w.kind]*(w.kind==='gun'?(w.big?3.2:2):1);const cr=Math.min(1,stat('crit')/100);
  return ATK()*k*(1+cr*(stat('critd')/100-1))*ASPD()*10+MAXHP()*2+stat('regen')*20}
let cpLast=0,cpShown=0;
function cpHud(){const v=CP();if(cpLast&&v>cpLast*1.0005){const up=$('#cpUp');up.textContent='+'+fmt(v-cpLast);up.classList.remove('go');void up.offsetWidth;up.classList.add('go')}cpLast=v;$('#cpTxt').textContent=fmt(v)}

/* ================= pickup log ================= */
function logAdd(html){const L2=$('#log');const d=document.createElement('div');d.innerHTML=html;L2.appendChild(d);while(L2.children.length>4)L2.firstChild.remove();setTimeout(()=>d.classList.add('out'),1600);setTimeout(()=>d.remove(),2100)}

/* ================= guide missions ================= */
const MISSIONS=[
  {t:'몹 10마리 처치',c:'kill',n:10,r:30},{t:'공격력 5회 강화',c:'up_atk',n:5,r:30},{t:'체력 5회 강화',c:'up_hp',n:5,r:30},
  {t:'치명타 피해 5회 강화',c:'up_critd',n:5,r:30},{t:'1-2 스테이지 도달',s:()=>S.g,n:1,r:50},{t:'장비 소환 1회',c:'summon',n:1,r:50},
  {t:'장비 장착하기',c:'equip',n:1,r:30},{t:'몹 50마리 처치',c:'kill',n:50,r:50},{t:'레벨 5 달성',s:()=>S.lv,n:5,r:50},
  {t:'1-4 중간 보스 처치',s:()=>S.g,n:4,r:80},{t:'치명타 확률 10회 강화',c:'up_crit',n:10,r:50},{t:'공격 속도 5회 강화',c:'up_aspd',n:5,r:50},
  {t:'1-7 스테이지 도달',s:()=>S.g,n:7,r:100},{t:'능력치 총 50회 강화',c:'up_any',n:50,r:80},{t:'1-10 챕터 보스 처치',s:()=>S.g,n:10,r:150},
];
function curMission(){const i=S.mi||0;if(i<MISSIONS.length)return MISSIONS[i];const k=i-MISSIONS.length;
  return k%2?{t:`${stageName(10+Math.floor(k/2)*3)} 스테이지 도달`,s:()=>S.g,n:10+Math.floor(k/2)*3,r:120}:{t:`몹 ${100*(k/2+1)}마리 처치`,c:'kill',n:100*(k/2+1),r:100}}
function upLv(c){if(c==='up_any')return Object.values(S.up).reduce((a,b)=>a+(+b||0),0);return +(S.up[c.slice(3)]||0)}
function mProg(){const m=curMission();const v=m.c&&m.c.startsWith('up_')?upLv(m.c):m.c?(S.cnt[m.c]||0)-(S.mBase||0):m.s();return[Math.min(v,m.n),m.n]}
function startMission(){const m=curMission();S.mBase=m.c?(S.cnt[m.c]||0):0}
function missionHud(){const m=curMission(),[v,n]=mProg();$('#mNum').textContent=(S.mi||0)+1;$('#mTxt').textContent=m.t+(m.c?` ${v}/${n}`:'');$('#mRew').textContent=m.r;$('#mFill').style.width=(v/n*100)+'%';$('#mission').classList.toggle('ready',v>=n)}
$('#mission').addEventListener('click',()=>{const[v,n]=mProg();if(v<n){toast(`${curMission().t} · ${v}/${n}`);return}const r=curMission().r;S.gem+=r;logAdd(`<span style="color:#62d6ff">+${r} 보석</span> · 미션 완료`);sfx('clear');S.mi=(S.mi||0)+1;startMission();save()});

/* ================= weather ================= */
let wx=[];
function weatherSim(dt,ws){const kind=ch()%THEMES.length;while(wx.length<18)wx.push({x:Math.random()*VW,y:Math.random()*GY,v:rnd(.6,1.4),p:Math.random()*6});
  wx.forEach(w=>{if(kind===0){w.x-=(ws*.3+12*w.v)*dt;w.y+=Math.sin(T*2+w.p)*.08}else if(kind===2){w.x-=(ws*.6+70*w.v)*dt;w.y+=Math.sin(T*3+w.p)*.2}else if(kind===3||kind===8){w.x-=(ws*.4+4)*dt;w.y-=(8*w.v)*dt;if(w.y<60)w.y=GY+4}
    else if(kind===6||kind===9){w.x-=(ws*.4+6*w.v)*dt;w.y-=(18*w.v)*dt;w.p+=dt*4;if(w.y<-4)w.y=GY+4}else if(kind===7){w.x-=(ws*.4+20)*dt;w.y+=(120*w.v)*dt}else if(kind===4||kind===5){w.x-=(ws*.5+6*w.v)*dt;w.y+=(6*w.v)*dt;w.p+=dt*2}
    else{w.x-=(ws*.5+10*w.v)*dt;w.y+=(14*w.v)*dt;w.p+=dt*3}if(w.x<-4)w.x+=VW+8;if(w.y>GY+10)w.y=-4})}
function weatherRender(){const kind=ch()%THEMES.length;wx.forEach((w,i)=>{const X=Math.round(w.x),Y=Math.round(w.y);
  if(kind===0){L.fillStyle=i%3?'rgba(255,255,255,.75)':'rgba(255,240,200,.9)';L.fillRect(X,Y,i%4?1:2,1)}
  else if(kind===2){L.fillStyle=i%2?'rgba(255,230,170,.55)':'rgba(220,170,100,.45)';L.fillRect(X,Y,3+(i%3)*2,1)}
  else if(kind===3||kind===8){if(w.y<96)return;L.fillStyle=kind===8?(i%3?'rgba(150,180,100,.6)':'rgba(30,30,20,.6)'):(i%3?'rgba(160,130,220,.6)':'rgba(255,255,255,.5)');L.fillRect(X,Y,1,1)}
  else if(kind===4||kind===5){L.fillStyle=kind===5?(i%4?'rgba(40,36,40,.55)':'rgba(255,140,40,.8)'):(i%3?'rgba(70,66,64,.55)':'rgba(200,190,170,.5)');const o=Math.round(Math.sin(w.p)*1.5);L.fillRect(X+o,Y,i%4?1:2,i%4?1:2)}
  else if(kind===6){L.fillStyle=i%3?'rgba(255,140,40,.85)':'rgba(255,230,120,.9)';L.fillRect(X+Math.round(Math.sin(w.p)),Y,1,i%4?1:2)}
  else if(kind===7){L.fillStyle='rgba(170,240,90,.5)';L.fillRect(X,Y,1,4)}
  else if(kind===9){L.fillStyle=i%3?'rgba(200,138,255,.8)':'rgba(255,240,120,.85)';L.fillRect(X+Math.round(Math.sin(w.p)*2),Y,1,1)}
  else{L.fillStyle=['#e88a2a','#c8642a','#8ac25a','#f0b040'][i%4];const o=Math.round(Math.sin(w.p)*1.5);L.fillRect(X+o,Y,2,1);L.fillRect(X+o+1,Y+1,1,1)}})}

/* ================= bottom nav ================= */
const NAV=[['grow','성장','up'],['gear','장비','wpn'],['pet','펫','turtle'],['dungeon','던전','gate'],['shop','상점','gem']];
function navIcon(k){const P=[];if(k==='up'){P.push(Pg([[12,3],[21,12],[16,12],[16,21],[8,21],[8,12],[3,12]],'leaf',1))}
  else if(k==='wpn')return iconPrims('atk');else if(k==='sk')return skPrims('glacier');else if(k==='turtle')return iconPrims('turtle');else if(k==='gem')return iconPrims('gem');
  else if(k==='gate'){P.push(Pg([[4,21],[4,9],[12,3],[20,9],[20,21]],'gunm',1));P.push(Pg([[8,21],[8,12],[12,9],[16,12],[16,21]],null,2,{col:hex('#140f1a')}))}return P}
function buildNav(){const N=$('#nav');NAV.forEach(([t,n,ic])=>{const b=document.createElement('button');b.dataset.t=t;if(t==='grow')b.classList.add('on');
  const c=document.createElement('canvas');c.className='pix';c.width=48;c.height=48;const r=raster(navIcon(ic),24,24);const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(r,0,0,48,48);
  b.appendChild(c);b.insertAdjacentHTML('beforeend',`<span>${n}</span><i class="dot"></i>`);b.addEventListener('click',()=>{tab=t;sfx('ui');document.querySelectorAll('#nav button').forEach(x2=>x2.classList.toggle('on',x2===b));if(t==='gear')S.seenInv=Object.keys(S.inv).length;renderPanel()});N.appendChild(b)})}
function navDots(){const set=(t,on)=>{const d=document.querySelector(`#nav button[data-t="${t}"] .dot`);if(d)d.classList.toggle('on',!!on)};
  set('grow',UPS.some(u=>S.up[u.k]<u.max&&S.gold>=u.cost(S.up[u.k])));set('gear',Object.keys(S.inv).length>(S.seenInv||1));
set('shop',S.gem>=50||!(S.buff>Date.now())&&!(S.buffCd>Date.now()))}
</script>
<script>
buildNav();if(SKILLS_ON)skillButtons();else $('#skills').hidden=true;
$('#auto').addEventListener('click',e=>{S.auto=!S.auto;e.currentTarget.classList.toggle('on',S.auto);sfx('ui')});
$('#snd').addEventListener('click',sndToggle);
</script>
