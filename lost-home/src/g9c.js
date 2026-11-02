<script>
/* ================= S급 이상 무기 고유 궁극기 ================= */
const ULT={
 rebar:{n:'고압 낙뢰 꽂기',col:'#fff36a'},fireaxe:{n:'화염 회전 도끼',col:'#ff7a1a'},sledge:{n:'지각 붕괴',col:'#ffb05a'},shotgun:{n:'탄막 난사',col:'#ffd23f'},ninja:{n:'그림자 분신술',col:'#b48aff'},oldbook:{n:'금단의 저주진',col:'#c06aff'},
 goldp:{n:'황금 대폭발',col:'#ffd23a'},katana:{n:'네온 일섬',col:'#ff4adf'},revolver:{n:'데드아이',col:'#ff3a3a'},kunai:{n:'쿠나이 폭우',col:'#cfe0ff'},icebook:{n:'절대영도',col:'#8fe4ff'},
 rainbow:{n:'무지개 대폭발',col:'#ff8ad8'},lava:{n:'화산 분화',col:'#ff5a1a'},railgun:{n:'궤도 포격',col:'#5ff4ff'},hstar:{n:'풍마 대수리검',col:'#9affd0'},firebook:{n:'메테오',col:'#ff6a2a'},
 mg:{n:'무한 난사',col:'#ffe066'},grimoire:{n:'천벌',col:'#b06cff'},glacier:{n:'빙하기',col:'#bff4ff'},holy:{n:'백곰왕의 심판',col:'#fff2a0'}};
const ULT_GF={3:10,4:16,5:24,6:36},ULT_CD={3:12,4:11,5:10,6:9};
let ultCd=4,ult=null,ufx=[],ultCut=null,ultLock=0;
const uLive=()=>mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x);
const uHit=(m,mul,src)=>{if(!m||m.dead)return;const it=W();hitTarget(m,mul*ULT_GF[it.g]*KIND_MUL[it.w.kind],Math.random()*100<stat('crit'),src||'beam')};
const uAll=(mul,src,f)=>uLive().filter(f||(()=>true)).forEach(m=>uHit(m,mul,src));
const uBoom=(x,col,r)=>{fx.push({k:'ring',x:x*K,y:GY*K,t:0,life:.5,r:r||200,col});fx.push({k:'star',x:x*K,y:(GY-14)*K,t:0,life:.3,big:1,col})};
const uAnim=()=>{const k=W().w.kind;return k==='blunt'?'rage':k==='gun'?'shoot':k==='star'?'throw':'cast'};
const uPose=n=>{if(bear.dead)return;play(bear,n||uAnim(),()=>play(bear,'idle'))};
function ultMake(id){const u={id,t:0,ev:[],dur:2};const at=(t,fn)=>u.ev.push([t,fn]);const L0=()=>uLive(),F=()=>uLive()[0],fx0=()=>(F()?F().x:bear.x+60);
 const shake_=(s,fl,c)=>{shake=Math.max(shake,s);if(fl){flash=Math.max(flash,fl);flashC=c||'#fff'}};
 switch(id){
 case 'rebar':u.dur=1.6;at(0,()=>uPose());for(let i=0;i<6;i++)at(.15+i*.12,()=>{const ms=L0();const m=ms[i%Math.max(1,ms.length)];const x=m?m.x:bear.x+40+i*22;ufx.push({k:'bolt',x,col:'#fff36a',life:.3,w:1.4});uBoom(x,'#fff36a',120);sfx('bolt');shake_(8,.25,'#fff8c0');if(m)uAll(.25,'beam',q=>Math.abs(q.x-x)<26)});at(.95,()=>{ufx.push({k:'pillar',x:fx0(),col:'#fff36a',life:.5,w:60});uAll(.4,'cleave');shake_(16,.5,'#fff6c0');sfx('boom')});break;
 case 'fireaxe':u.dur=1.5;for(let i=0;i<3;i++)at(i*.32,()=>{uPose('rage');ufx.push({k:'firering',x:bear.x+20,life:.55,r:70+i*25});sfx('whoosh');uAll(.3,'cleave',m=>m.x-bear.x<110+i*30);shake_(7)});at(1.05,()=>{for(let i=0;i<8;i++)ufx.push({k:'flame',x:bear.x+30+i*16,life:.7+i*.04,d:i*.05});uAll(.1,'beam');shake_(12,.3,'#ffb070');sfx('boom')});break;
 case 'sledge':u.dur=1.7;at(0,()=>{uPose('rage');ufx.push({k:'jump',life:.4})});at(.4,()=>{shake_(22,.45,'#ffe0b0');sfx('boom');uBoom(bear.x+36,'#ffb05a',260);dust(bear.x+36,20);ufx.push({k:'crack',x0:bear.x+36,life:1.1})});
   for(let i=0;i<7;i++)at(.45+i*.08,()=>{const x=bear.x+46+i*20;ufx.push({k:'spike',x,col:['#6a4a2a','#a8784a','#e0b07a'],life:.7,h:26+i*3});debris(x,GY-4,6,['#8a6a4a','#c8a070','#4a3420'],110);uAll(.18,'cleave',m=>Math.abs(m.x-x)<14)});break;
 case 'shotgun':u.dur=1.4;for(let i=0;i<5;i++)at(i*.2,()=>{uPose('shoot');const tip=bear.x+30;ufx.push({k:'cone',x:tip,life:.18});sfx('shot');shake_(9,.12,'#fff2c0');for(let j=0;j<7;j++)ufx.push({k:'tracer',x:tip,y:GY-27,vx:520,vy:(j-3)*70,life:.35,col:'#ffe27a'});uAll(.18,'cleave',m=>m.x-bear.x<130)});break;
 case 'ninja':u.dur=1.8;at(0,()=>{[-28,-14,14].forEach((dx,i)=>ufx.push({k:'clone',dx,dy:i===2?-22:-8,life:1.6}));sfx('whoosh')});for(let i=0;i<10;i++)at(.25+i*.1,()=>{uPose('throw');[-28,-14,0,14].forEach((dx,j)=>ufx.push({k:'proj',x:bear.x+20+dx,y:GY-30-j*4,vx:330,vy:rnd(-30,30),sp:'star',life:.6,col:'#d6dbe4'}));sfx('throw');uAll(.09,'beam',m=>m.x-bear.x<150)});break;
 case 'oldbook':u.dur=2;at(0,()=>{uPose('cast');ufx.push({k:'circle',x:fx0()+20,col:'#c06aff',life:1.8,r:70});sfx('magic')});at(.5,()=>{L0().forEach(m=>ufx.push({k:'chain',m,life:1.1}));L0().forEach(m=>m.frz=1.2);sfx('magic')});for(let i=0;i<5;i++)at(.6+i*.18,()=>{ufx.push({k:'skull',x:fx0()+rnd(-20,50),life:.9,col:'#c06aff'});uAll(.14,'beam')});at(1.5,()=>{uBoom(fx0()+20,'#c06aff',240);shake_(14,.4,'#e0b0ff');sfx('boom');uAll(.3,'cleave')});break;
 case 'goldp':u.dur=1.6;at(0,()=>uPose('rage'));at(.25,()=>{shake_(18,.6,'#fff2a0');sfx('boom');uBoom(fx0(),'#ffd23a',300);ufx.push({k:'pillar',x:fx0(),col:'#ffd23a',life:.7,w:90});uAll(.55,'cleave');
   for(let i=0;i<24;i++)coins.push({x:fx0()*K,y:(GY-10)*K,vx:rnd(-300,400),vy:rnd(-900,-400),t:0,v:0,fly:0})});for(let i=0;i<4;i++)at(.5+i*.15,()=>{ufx.push({k:'sparkle',x:fx0()+rnd(-30,30),y:GY-rnd(10,60),life:.5,col:'#fff2a0'});uAll(.11,'beam')});break;
 case 'katana':u.dur=1.9;at(0,()=>{ufx.push({k:'tint',col:'#120018',a:.6,life:1.3});ufx.push({k:'dash',life:.25});sfx('whoosh');uPose('rage')});
   for(let i=0;i<6;i++)at(.3+i*.06,()=>ufx.push({k:'slash',x:bear.x+60+i*16,y:GY-20,a:rnd(-.9,.9),len:90,col:'#ff4adf',life:.9}));
   at(1.0,()=>{ufx.push({k:'slash',x:bear.x+100,y:GY-22,a:-.15,len:260,col:'#ffffff',life:.5,w:3});shake_(24,.7,'#ffd0f6');sfx('crit');slowT=.4;uAll(.9,'cleave');L0().forEach(m=>debris(m.x,GY-14,14,['#ff4adf','#ffffff','#5ff4ff'],160))});break;
 case 'revolver':u.dur=2;at(0,()=>{ufx.push({k:'tint',col:'#2a0006',a:.45,life:1.6});slowT=1.2;sfx('magic');L0().slice(0,6).forEach((m,i)=>ufx.push({k:'cross',m,life:1.2,d:i*.08}))});
   for(let i=0;i<6;i++)at(.9+i*.09,()=>{uPose('shoot');const ms=L0();const m=ms[i%Math.max(1,ms.length)];ufx.push({k:'cone',x:bear.x+30,life:.12});sfx('shot');shake_(10,.18,'#ffd0d0');if(m){ufx.push({k:'line',x0:bear.x+30,y0:GY-27,x1:m.x,y1:hitY(m),col:'#ffd23f',life:.15});uHit(m,.17,'cleave')}});break;
 case 'kunai':u.dur=1.8;at(0,()=>{uPose('throw');sfx('whoosh')});for(let i=0;i<28;i++)at(.2+i*.035,()=>{const x=fx0()+rnd(-30,70);ufx.push({k:'proj',x:x-30,y:-10,vx:110,vy:420,sp:'kunai',gy:1,life:.7,col:'#cfe0ff'});if(i%4===3){sfx('throw');uAll(.13,'beam',m=>Math.abs(m.x-x)<40)}});at(1.4,()=>{shake_(10,.2);uAll(.1,'cleave')});break;
 case 'icebook':u.dur=1.9;at(0,()=>{uPose('cast');ufx.push({k:'tint',col:'#bfe8ff',a:.35,life:1.6});ufx.push({k:'circle',x:fx0()+20,col:'#8fe4ff',life:1.6,r:80});sfx('magic')});
   at(.45,()=>{L0().forEach((m,i)=>{m.frz=2;for(let j=0;j<3;j++)ufx.push({k:'spike',x:m.x-8+j*8,col:['#3a7ac8','#8fd0ff','#ffffff'],life:1.1,h:30+j*6,d:i*.04})});sfx('boom');shake_(12,.4,'#e6f8ff');uAll(.45,'beam')});
   at(1.3,()=>{L0().forEach(m=>debris(m.x,GY-16,16,['#ffffff','#a8e0ff','#4f9ee0'],170));sfx('crit');shake_(16,.5,'#ffffff');uAll(.55,'cleave')});break;
 case 'rainbow':u.dur=1.8;at(0,()=>uPose('rage'));at(.3,()=>{ufx.push({k:'rainbow',x:bear.x+20,life:1.2});sfx('beam');shake_(10)});for(let i=0;i<6;i++)at(.4+i*.12,()=>{const x=fx0()+rnd(-20,60);ufx.push({k:'sparkle',x,y:GY-rnd(10,60),life:.6,col:['#ff5a5a','#ffb03a','#ffe066','#5ad86a','#4aa8ff','#b06cff'][i]});uAll(.12,'beam')});at(1.2,()=>{uBoom(fx0()+20,'#ff8ad8',300);shake_(18,.55,'#fff0fa');sfx('boom');uAll(.45,'cleave')});break;
 case 'lava':u.dur=2.1;at(0,()=>uPose('rage'));at(.3,()=>{shake_(16,.3,'#ffb070');sfx('boom');ufx.push({k:'volcano',x:fx0()+20,life:1.6})});
   for(let i=0;i<12;i++)at(.45+i*.08,()=>{const x=fx0()+rnd(-40,70);ufx.push({k:'proj',x:fx0()+20,y:GY-20,vx:(x-fx0()-20)*1.6,vy:-300,g:900,sp:'rock',life:1,col:'#ff6a1a'});if(i%3===2){uAll(.14,'beam');sfx('hit')}});at(1.5,()=>{shake_(20,.5,'#ff9a50');uBoom(fx0()+20,'#ff5a1a',300);uAll(.5,'cleave');sfx('boom')});break;
 case 'railgun':u.dur=2;at(0,()=>{uPose('shoot');ufx.push({k:'charge',life:.8});sfx('magic')});at(.75,()=>{ufx.push({k:'tint',col:'#001428',a:.5,life:.9});ufx.push({k:'orbital',x:fx0()+20,life:.9,w:80});sfx('beam');shake_(26,.8,'#d0ffff');uAll(.35,'beam')});for(let i=0;i<4;i++)at(.9+i*.12,()=>uAll(.16,'beam',m=>Math.abs(m.x-fx0()-20)<70));at(1.5,()=>{uBoom(fx0()+20,'#5ff4ff',360);uAll(.3,'cleave');sfx('boom')});break;
 case 'hstar':u.dur=2.1;at(0,()=>{uPose('throw');ufx.push({k:'bigstar',x0:bear.x+20,life:1.8});sfx('whoosh')});for(let i=0;i<10;i++)at(.15+i*.16,()=>{uAll(.1,'beam');if(i%2)sfx('whoosh');shake_(6)});break;
 case 'firebook':u.dur=2.1;at(0,()=>{uPose('cast');ufx.push({k:'tint',col:'#2a0800',a:.4,life:1.8});sfx('magic')});at(.2,()=>ufx.push({k:'meteor',x:fx0()+24,life:.9}));
   at(1.1,()=>{shake_(28,.85,'#ffd0a0');sfx('boom');uBoom(fx0()+24,'#ff6a1a',380);for(let i=0;i<10;i++)ufx.push({k:'flame',x:fx0()-30+i*12,life:.9,d:i*.03});debris(fx0()+24,GY-10,30,['#ff6a1a','#ffd23f','#3a1a10'],220);uAll(.85,'cleave')});break;
 case 'mg':u.dur=2.6;at(0,()=>{uPose('shoot');sfx('shot')});for(let i=0;i<34;i++)at(.1+i*.065,()=>{if(i%6===0)uPose('shoot');ufx.push({k:'tracer',x:bear.x+30,y:GY-27+rnd(-3,3),vx:900,vy:rnd(-60,60),life:.25,col:'#ffe066'});ufx.push({k:'cone',x:bear.x+30,life:.06});ufx.push({k:'proj',x:bear.x+20,y:GY-28,vx:rnd(-80,-20),vy:-120,g:700,sp:'shell',life:.6,col:'#e0b040'});if(i%2)sfx('shot');shake=Math.max(shake,4);uAll(.03,'beam',m=>m.x-bear.x<170)});break;
 case 'grimoire':u.dur=2.4;at(0,()=>{uPose('cast');ufx.push({k:'tint',col:'#0a0018',a:.6,life:2.1});ufx.push({k:'skycircle',x:fx0()+20,life:2.1});sfx('magic')});
   for(let i=0;i<14;i++)at(.5+i*.08,()=>{const ms=L0();const m=ms[i%Math.max(1,ms.length)];const x=m?m.x+rnd(-8,8):fx0()+rnd(-40,60);ufx.push({k:'bolt',x,col:'#c88aff',life:.25,w:1.2});if(i%2)sfx('bolt');shake_(7,.15,'#e8d0ff');uAll(.07,'beam',q=>Math.abs(q.x-x)<24)});
   at(1.8,()=>{ufx.push({k:'pillar',x:fx0()+20,col:'#b06cff',life:.6,w:140});shake_(26,.8,'#f0e0ff');sfx('boom');uAll(.6,'cleave')});break;
 case 'glacier':u.dur=2.4;at(0,()=>{uPose('rage');ufx.push({k:'tint',col:'#e8f8ff',a:.45,life:2});ufx.push({k:'snow',life:2.2});sfx('whoosh')});at(.2,()=>{L0().forEach(m=>m.frz=2.2)});at(.35,()=>ufx.push({k:'gsword',x:fx0()+24,life:1.6}));
   at(.85,()=>{shake_(30,.9,'#ffffff');sfx('boom');uBoom(fx0()+24,'#bff4ff',400);for(let i=0;i<9;i++)ufx.push({k:'spike',x:fx0()-40+i*14,col:['#3a7ac8','#8fd0ff','#ffffff'],life:1.2,h:24+(i%3)*10,d:i*.03});uAll(.6,'cleave')});
   at(1.6,()=>{L0().forEach(m=>debris(m.x,GY-16,20,['#ffffff','#bff4ff','#4f9ee0'],200));sfx('crit');uAll(.4,'cleave')});break;
 case 'holy':u.dur=2.5;at(0,()=>{play(bear,'win',()=>play(bear,'idle'));ufx.push({k:'wings',life:2.3});ufx.push({k:'rays',life:2.2});sfx('magic')});
   at(.7,()=>{for(let i=0;i<5;i++)ufx.push({k:'pillar',x:fx0()-20+i*22,col:'#fff2a0',life:.8,w:36,d:i*.06});uAll(.4,'beam');shake_(12,.4,'#fffbe0');sfx('beam')});
   at(1.5,()=>{uPose('rage');ufx.push({k:'cross',holy:1,x:fx0()+20,life:.8});uBoom(fx0()+20,'#fff2a0',420);shake_(30,1,'#ffffff');sfx('boom');slowT=.4;uAll(.6,'cleave')});break;
 }
 u.ev.sort((a,b)=>a[0]-b[0]);return u}
function castUlt(){const it=W();if(!ULT[S.eq.w]||it.g<3||bear.dead||screen!=='game'||ult)return false;const f=uLive()[0];if(!f||f.x-bear.x>140)return false;
  ultCd=ULT_CD[it.g];ult=ultMake(S.eq.w);ultLock=ult.dur;ultCut={t:0,id:S.eq.w,g:it.g};stop=Math.max(stop,.7);sfx('crit');S.cnt.ult=(S.cnt.ult||0)+1;return true}
let uAcc=[],uFlT=0;
{const _num=num;num=function(x,y,v,kind,tg){if(ult&&tg&&tg!==bear&&kind!=='hurt'){let a=uAcc.find(q=>q.tg===tg);if(!a)uAcc.push(a={tg,v:0,x,y});a.v+=v;a.x=x;a.y=y;return}return _num(x,y,v,kind,tg)};
 window.uFlush=()=>{const L2=uAcc;uAcc=[];L2.forEach(a=>_num(a.x,a.y-6,a.v,'crit',a.tg))}}
function ultSim(dt){if(ult){uFlT+=dt;if(uFlT>.4){uFlT=0;uFlush()}}ultCd-=dt;ultLock=Math.max(0,ultLock-dt);
  if(!ult&&ultCd<=0&&W().g>=3&&ULT[S.eq.w])castUlt();
  if(ult){ult.t+=dt;while(ult.ev.length&&ult.ev[0][0]<=ult.t)ult.ev.shift()[1]();if(ult.t>=ult.dur&&!ult.ev.length){ult=null;uFlush();if(!bear.dead&&['rage','win','shoot','throw','cast'].includes(bear.name)&&bear.onEnd==null)play(bear,'idle')}}
  ufx=ufx.filter(f=>{f.t=(f.t||0)+dt;if(f.d&&f.t<f.d)return true;const tt=f.t-(f.d||0);
    if(f.k==='proj'){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.g)f.vy+=f.g*dt;if(f.y>GY-2&&(f.gy||f.g)){f.y=GY-2;if(!f.landed){f.landed=1;debris(f.x,GY-3,4,[f.col,'#ffffff'],70);if(f.sp==='rock')fx.push({k:'ring',x:f.x*K,y:GY*K,t:0,life:.3,r:60,col:f.col})}}}
    if(f.k==='tracer'){f.x+=f.vx*dt;f.y+=f.vy*dt}
    return tt<f.life})}
{const _ss=skillSim;skillSim=function(dt,ws){_ss(dt,ws);ultSim(dt);if(ultLock>0)skillLock=Math.max(skillLock,.05)}}
/* ---------- render ---------- */
function uJag(x0,y0,x1,y1,seg,amp){const pts=[[x0,y0]];for(let i=1;i<seg;i++){const u=i/seg;pts.push([x0+(x1-x0)*u+rnd(-amp,amp),y0+(y1-y0)*u+rnd(-amp*.3,amp*.3)])}pts.push([x1,y1]);return pts}
function uStroke(pts,col,w){X.strokeStyle=col;X.lineWidth=w;X.lineJoin='round';X.lineCap='round';X.beginPath();pts.forEach(([a,b],i)=>i?X.lineTo(a,b):X.moveTo(a,b));X.stroke()}
function uGlow(x,y,r,col,a){const g=X.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');X.globalAlpha=a==null?1:a;X.fillStyle=g;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.globalAlpha=1}
function ultRender(){const W2=cv.width,gy=GY*K;
  ufx.forEach(f=>{if(f.d&&f.t<f.d)return;const tt=f.t-(f.d||0),u=Math.min(1,tt/f.life),fa=u>.7?1-(u-.7)/.3:1;X.save();try{
   switch(f.k){
   case 'tint':break;
   case 'bolt':{X.globalCompositeOperation='lighter';const x=f.x*K,p=uJag(x+rnd(-30,30),0,x,gy-10,9,28);uStroke(p,f.col,16*f.w*(1-u)+3);uStroke(p,'#ffffff',6*f.w*(1-u)+1);uGlow(x,gy-10,90,f.col,fa);break}
   case 'pillar':{X.globalCompositeOperation='lighter';const x=f.x*K,w=f.w*(u<.2?u/.2:1)*(1-u*.4);const g=X.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,f.col);g.addColorStop(1,'rgba(0,0,0,0)');X.globalAlpha=fa;X.fillStyle=g;X.fillRect(x-w,0,w*2,gy+10);X.fillStyle='#fff';X.fillRect(x-w*.15,0,w*.3,gy+10);uGlow(x,gy,w*2.4,f.col,fa);break}
   case 'firering':{X.globalCompositeOperation='lighter';const r=f.r*K*(.3+u*.9);X.globalAlpha=fa;X.lineWidth=26*(1-u)+4;X.strokeStyle='#ff7a1a';X.beginPath();X.ellipse(f.x*K,(GY-18)*K,r,r*.45,0,0,7);X.stroke();X.lineWidth=8*(1-u)+2;X.strokeStyle='#ffe0a0';X.stroke();break}
   case 'flame':{X.globalCompositeOperation='lighter';const x=f.x*K,h=(60+Math.sin(tt*30+f.x)*12)*(u<.3?u/.3:1-((u-.3)/.7)*.8);X.globalAlpha=fa;[[1,'#ff4a0a'],[.65,'#ffa020'],[.32,'#fff2a0']].forEach(([s,c])=>{X.fillStyle=c;X.beginPath();X.moveTo(x-18*s,gy);X.quadraticCurveTo(x-22*s,gy-h*s*.6,x+Math.sin(tt*20+f.x)*8,gy-h*s*1.6);X.quadraticCurveTo(x+22*s,gy-h*s*.6,x+18*s,gy);X.fill()});break}
   case 'jump':break;
   case 'crack':{const x0=f.x0*K,len=Math.min(1,u*3)*(W2-x0);X.globalAlpha=fa;uStroke([[x0,gy+2],[x0+len*.25,gy-4],[x0+len*.5,gy+3],[x0+len*.75,gy-3],[x0+len,gy+1]],'#140c0a',10);X.globalCompositeOperation='lighter';uStroke([[x0,gy+2],[x0+len*.25,gy-4],[x0+len*.5,gy+3],[x0+len*.75,gy-3],[x0+len,gy+1]],'#ff9a3a',4);break}
   case 'spike':{const x=f.x*K,h=f.h*K*(u<.15?u/.15:1)*(u>.75?1-(u-.75)/.25:1),w=9*K*.6;X.fillStyle='#140c0a';X.beginPath();X.moveTo(x-w-3,gy+2);X.lineTo(x,gy-h-4);X.lineTo(x+w+3,gy+2);X.fill();X.fillStyle=f.col[0];X.beginPath();X.moveTo(x-w,gy);X.lineTo(x,gy-h);X.lineTo(x+w,gy);X.fill();X.fillStyle=f.col[1];X.beginPath();X.moveTo(x-w*.6,gy);X.lineTo(x,gy-h);X.lineTo(x+w*.1,gy);X.fill();X.fillStyle=f.col[2];X.fillRect(x-3,gy-h*.8,4,h*.35);break}
   case 'cone':{X.globalCompositeOperation='lighter';const x=f.x*K,y=(GY-27)*K;X.globalAlpha=1-u;const g=X.createLinearGradient(x,0,x+170,0);g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#ffd23f');g.addColorStop(1,'rgba(255,90,0,0)');X.fillStyle=g;X.beginPath();X.moveTo(x,y);X.lineTo(x+170,y-55);X.lineTo(x+170,y+55);X.fill();uGlow(x+10,y,50,'#fff2a0',1-u);break}
   case 'tracer':{X.globalCompositeOperation='lighter';const x=f.x*K,y=f.y*K;X.globalAlpha=fa;uStroke([[x-30,y-f.vy*.05],[x,y]],f.col,5);break}
   case 'line':{X.globalCompositeOperation='lighter';X.globalAlpha=1-u;uStroke([[f.x0*K,f.y0*K],[f.x1*K,f.y1*K]],f.col,8);uStroke([[f.x0*K,f.y0*K],[f.x1*K,f.y1*K]],'#fff',3);break}
   case 'clone':{const bi=bear.a.cv[bear.f];X.globalAlpha=.55*fa*(u<.1?u/.1:1);X.imageSmoothingEnabled=false;X.drawImage(ghostOf(bi),(bear.x-BAX+f.dx)*K,(GY-BG+f.dy)*K,bi.width*K,bi.height*K);break}
   case 'proj':{const x=f.x*K,y=f.y*K;X.translate(x,y);X.globalAlpha=f.landed?fa*.6:1;
     if(f.sp==='star'){X.rotate(tt*30);X.fillStyle='#140c0a';X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?5:15;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.fill();X.fillStyle=f.col;X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?3:12;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.fill()}
     else if(f.sp==='kunai'){X.rotate(Math.atan2(f.vy,f.vx));X.fillStyle='#140c0a';X.fillRect(-22,-4,40,8);X.fillStyle=f.col;X.beginPath();X.moveTo(20,0);X.lineTo(6,-5);X.lineTo(6,5);X.fill();X.fillStyle='#6a7690';X.fillRect(-18,-2,24,4);X.fillStyle='#c83a3a';X.fillRect(-24,-3,6,6)}
     else if(f.sp==='rock'){X.rotate(tt*8);X.fillStyle='#140c0a';X.fillRect(-13,-13,26,26);X.fillStyle='#4a2010';X.fillRect(-10,-10,20,20);X.fillStyle=f.col;X.fillRect(-6,-6,10,10);X.globalCompositeOperation='lighter';uGlow(0,0,30,'#ff6a1a',.6)}
     else if(f.sp==='shell'){X.rotate(tt*20);X.fillStyle=f.col;X.fillRect(-5,-2,10,4)}break}
   case 'circle':{const x=f.x*K,r=f.r*K*(u<.15?u/.15:1);X.globalCompositeOperation='lighter';X.globalAlpha=fa;X.strokeStyle=f.col;X.lineWidth=5;X.translate(x,gy);X.scale(1,.32);X.rotate(tt*2);
     [1,.78].forEach(s=>{X.beginPath();X.arc(0,0,r*s,0,7);X.stroke()});X.beginPath();for(let i=0;i<=6;i++){const a=i/6*Math.PI*2*2;X.lineTo(Math.cos(a)*r*.78,Math.sin(a)*r*.78)}X.stroke();for(let i=0;i<12;i++){const a=i/12*Math.PI*2;X.fillStyle=f.col;X.fillRect(Math.cos(a)*r*.89-4,Math.sin(a)*r*.89-4,8,8)}
     X.setTransform(1,0,0,1,0,OYK);break}
   case 'chain':{const m=f.m;if(m.dead)break;const x=m.x*K,y=hitY(m)*K;X.globalAlpha=fa;for(let s=-1;s<=1;s+=2){for(let i=0;i<7;i++){const cx=x+s*(70-i*10),cy=gy-i*(gy-y)/7;X.strokeStyle='#140c0a';X.lineWidth=5;X.beginPath();X.ellipse(cx,cy,7,4,s*.6,0,7);X.stroke();X.strokeStyle='#c06aff';X.lineWidth=2.5;X.stroke()}}break}
   case 'skull':{const x=f.x*K,y=gy-30-u*120;X.globalAlpha=fa*.9;X.globalCompositeOperation='lighter';uGlow(x,y,40,f.col,fa);X.globalCompositeOperation='source-over';X.fillStyle='#f0e8ff';X.beginPath();X.arc(x,y,14,0,7);X.fill();X.fillRect(x-9,y+6,18,9);X.fillStyle='#2a0a3a';X.beginPath();X.arc(x-5,y-1,4,0,7);X.arc(x+5,y-1,4,0,7);X.fill();break}
   case 'sparkle':{X.globalCompositeOperation='lighter';const x=f.x*K,y=f.y*K,r=36*(1-u);X.globalAlpha=fa;X.fillStyle='#fff';X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4+tt*3,rr=i%2?r*.2:r;X.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}X.fill();uGlow(x,y,r*1.4,f.col,fa);break}
   case 'dash':{X.globalCompositeOperation='lighter';X.globalAlpha=1-u;const y=(GY-22)*K;for(let i=0;i<5;i++)uStroke([[bear.x*K,y-20+i*10],[W2,y-20+i*10]],i===2?'#ffffff':'#ff4adf',i===2?6:3);break}
   case 'slash':{X.globalCompositeOperation='lighter';const x=f.x*K,y=f.y*K,L2=f.len*(f.w||1)*(u<.08?u/.08:1);X.globalAlpha=fa;X.translate(x,y);X.rotate(f.a);X.fillStyle=f.col;X.beginPath();X.moveTo(-L2,0);X.quadraticCurveTo(0,-14*(1-u),L2,0);X.quadraticCurveTo(0,4,-L2,0);X.fill();X.fillStyle='#fff';X.fillRect(-L2*.8,-2,L2*1.6,3);break}
   case 'cross':{if(f.holy){X.globalCompositeOperation='lighter';const x=f.x*K,y=(GY-40)*K,s=1+u*2.5;X.globalAlpha=fa;X.fillStyle='#fff2a0';X.fillRect(x-14*s,y-110*s*.6,28*s,200*s*.6);X.fillRect(x-70*s*.6,y-50*s*.6,140*s*.6,26*s*.6);uGlow(x,y,160*s*.5,'#fff2a0',fa);break}
     const m=f.m;if(m.dead)break;const x=m.x*K,y=hitY(m)*K,r=34-u*12;X.globalAlpha=Math.min(1,u*4);X.strokeStyle='#ff3a3a';X.lineWidth=4;X.beginPath();X.arc(x,y,r,0,7);X.stroke();X.beginPath();X.moveTo(x-r-10,y);X.lineTo(x-r+8,y);X.moveTo(x+r-8,y);X.lineTo(x+r+10,y);X.moveTo(x,y-r-10);X.lineTo(x,y-r+8);X.moveTo(x,y+r-8);X.lineTo(x,y+r+10);X.stroke();break}
   case 'rainbow':{X.globalCompositeOperation='lighter';const x=f.x*K,R=Math.min(1,u*2.5)*(W2-x)*.55;X.globalAlpha=fa;['#ff5a5a','#ffb03a','#ffe066','#5ad86a','#4aa8ff','#b06cff'].forEach((c,i)=>{X.strokeStyle=c;X.lineWidth=14;X.beginPath();X.arc(x+R,gy,Math.max(1,R-i*13),Math.PI,Math.PI*2);X.stroke()});break}
   case 'volcano':{const x=f.x*K,h=Math.min(1,u*4)*80*K*.5;X.globalAlpha=fa;X.fillStyle='#140c0a';X.beginPath();X.moveTo(x-90,gy+4);X.lineTo(x-24,gy-h-4);X.lineTo(x+24,gy-h-4);X.lineTo(x+90,gy+4);X.fill();X.fillStyle='#4a2418';X.beginPath();X.moveTo(x-84,gy);X.lineTo(x-20,gy-h);X.lineTo(x+20,gy-h);X.lineTo(x+84,gy);X.fill();
     X.globalCompositeOperation='lighter';X.fillStyle='#ff5a1a';X.fillRect(x-16,gy-h-4,32,10);uGlow(x,gy-h,120,'#ff6a1a',fa);for(let i=0;i<3;i++)uStroke([[x-14+i*14,gy-h],[x-30+i*28,gy-h*.3]],'#ff8a2a',5);break}
   case 'charge':{X.globalCompositeOperation='lighter';const x=(bear.x+30)*K,y=(GY-27)*K;X.globalAlpha=1;uGlow(x,y,20+u*70,'#5ff4ff',1);for(let i=0;i<8;i++){const a=i/8*Math.PI*2+tt*6,r=120*(1-u);uStroke([[x+Math.cos(a)*r,y+Math.sin(a)*r],[x+Math.cos(a)*(r+30),y+Math.sin(a)*(r+30)]],'#bff8ff',3)}break}
   case 'orbital':{X.globalCompositeOperation='lighter';const x=f.x*K,w=f.w*(u<.1?u/.1:1)*(1-u*.5);X.globalAlpha=fa;const g=X.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'#5ff4ff');g.addColorStop(1,'rgba(0,0,0,0)');X.fillStyle=g;X.fillRect(x-w,0,w*2,gy+10);X.fillStyle='#ffffff';X.fillRect(x-w*.25,0,w*.5,gy+10);uGlow(x,gy,w*3,'#5ff4ff',fa);for(let i=0;i<6;i++)uStroke(uJag(x+rnd(-w,w),0,x+rnd(-w,w),gy,6,20),'#e0ffff',2);break}
   case 'bigstar':{const p=u<.5?u/.5:1-(u-.5)/.5,x=(f.x0+(W2/K-f.x0-10)*Math.sin(p*Math.PI/2))*K,y=(GY-30-Math.sin(u*Math.PI)*16)*K;X.translate(x,y);X.rotate(tt*24);X.fillStyle='#140c0a';X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?20:70;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.fill();X.fillStyle='#d6dbe4';X.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?15:62;X.lineTo(Math.cos(a)*r,Math.sin(a)*r)}X.fill();X.fillStyle='#140c0a';X.beginPath();X.arc(0,0,10,0,7);X.fill();
     X.setTransform(1,0,0,1,0,OYK);X.globalCompositeOperation='lighter';uGlow(x,y,110,'#9affd0',.5);for(let i=0;i<3;i++){X.globalAlpha=.3;X.strokeStyle='#9affd0';X.lineWidth=4;X.beginPath();X.arc(x,y,80+i*14,tt*20+i,tt*20+i+1.4);X.stroke()}break}
   case 'meteor':{const sx=f.x*K+260,sy=-120,ex=f.x*K,ey=gy-20,x=sx+(ex-sx)*u*u,y=sy+(ey-sy)*u*u;X.globalCompositeOperation='lighter';for(let i=0;i<8;i++){const b=i/8;uGlow(x+(sx-ex)*.08*i*u,y+(sy-ey)*.08*i*u,(70-i*6),i<2?'#fff2a0':'#ff5a1a',.8-b*.6)}X.globalCompositeOperation='source-over';X.fillStyle='#140c0a';X.beginPath();X.arc(x,y,46,0,7);X.fill();X.fillStyle='#5a2a18';X.beginPath();X.arc(x,y,40,0,7);X.fill();X.fillStyle='#ff8a2a';X.beginPath();X.arc(x-10,y+10,24,0,7);X.fill();break}
   case 'skycircle':{const x=f.x*K,y=40,r=200*(u<.2?u/.2:1);X.globalCompositeOperation='lighter';X.globalAlpha=fa;X.strokeStyle='#c88aff';X.lineWidth=5;X.translate(x,y);X.scale(1,.3);X.rotate(tt);[1,.8,.55].forEach(s=>{X.beginPath();X.arc(0,0,r*s,0,7);X.stroke()});X.beginPath();for(let i=0;i<=5;i++){const a=i/5*Math.PI*4;X.lineTo(Math.cos(a)*r*.8,Math.sin(a)*r*.8)}X.stroke();X.setTransform(1,0,0,1,0,OYK);uGlow(x,y,220,'#8a3aff',fa*.6);break}
   case 'snow':{X.globalAlpha=fa;X.fillStyle='#ffffff';for(let i=0;i<70;i++){const x=((i*97+tt*120*(1+i%3))%W2),y=((i*53+tt*200*(1+i%2))%(gy));X.fillRect(x,y,4,4)}break}
   case 'gsword':{const x=f.x*K,fall=Math.min(1,u/.3),y=-200+(gy-60+200)*fall*fall;X.globalAlpha=fa;X.translate(x,y);X.rotate(.08);X.fillStyle='#140c0a';X.beginPath();X.moveTo(-40,-330);X.lineTo(40,-330);X.lineTo(44,40);X.lineTo(0,110);X.lineTo(-44,40);X.fill();X.fillStyle='#8fd0ff';X.beginPath();X.moveTo(-34,-324);X.lineTo(34,-324);X.lineTo(38,36);X.lineTo(0,100);X.lineTo(-38,36);X.fill();X.fillStyle='#e8f8ff';X.beginPath();X.moveTo(-34,-324);X.lineTo(-4,-324);X.lineTo(-6,90);X.lineTo(-38,36);X.fill();
     X.fillStyle='#140c0a';X.fillRect(-90,-360,180,40);X.fillStyle='#4f9ee0';X.fillRect(-84,-354,168,28);X.fillStyle='#bff4ff';X.fillRect(-84,-354,168,8);X.setTransform(1,0,0,1,0,OYK);X.globalCompositeOperation='lighter';uGlow(x,y,140,'#bff4ff',fa*.7);break}
   case 'wings':{const x=(bear.x-6)*K,y=(GY-34)*K,s=Math.min(1,u*5),fl=Math.sin(tt*6)*.12;X.globalCompositeOperation='lighter';uGlow(x,y,160,'#fff2a0',fa*.7);X.globalCompositeOperation='source-over';X.globalAlpha=fa;
     [-1,1].forEach(d=>{X.save();X.translate(x,y);X.scale(d*s,s);X.rotate(-fl);
       const wing=(k,c)=>{X.fillStyle=c;X.beginPath();X.moveTo(-10*k,0);X.quadraticCurveTo(-60*k,-120*k,-170*k,-110*k);X.quadraticCurveTo(-150*k,-80*k,-150*k,-70*k);for(let i=0;i<5;i++){const x0=-150+i*28,y0=-70+i*16;X.quadraticCurveTo((x0+6)*k,(y0+34)*k,(x0+28)*k,(y0+16)*k)}X.quadraticCurveTo(-20*k,10*k,-10*k,0);X.fill()};
       wing(1.06,'#140c0a');wing(1,'#fff6d8');wing(.78,'#ffffff');X.strokeStyle='rgba(200,170,90,.7)';X.lineWidth=2;for(let i=0;i<5;i++){X.beginPath();X.moveTo(-14,-4);X.lineTo(-140+i*28,-62+i*16);X.stroke()}X.restore()});
     X.fillStyle='#ffe066';X.strokeStyle='#140c0a';X.lineWidth=3;X.beginPath();X.ellipse(x+16,y-76,26,7,0,0,7);X.stroke();X.strokeStyle='#ffe066';X.lineWidth=4;X.stroke();break}
   case 'rays':{X.globalCompositeOperation='lighter';X.globalAlpha=fa*.35;X.fillStyle='#fff2a0';for(let i=0;i<7;i++){const x=(bear.x+40+i*22)*K;X.beginPath();X.moveTo(x-20+tt*30,0);X.lineTo(x+20+tt*30,0);X.lineTo(x+60,gy);X.lineTo(x-10,gy);X.fill()}break}
   }}catch(e){}
   X.restore()})}
{const _sr=skillRender;skillRender=function(){_sr();ultRender()}}
/* ---------- tint (behind hd) + cut-in overlay ---------- */
function ultOverlay(rdt){const W2=cv.width,H2=cv.height;
  ufx.forEach(f=>{if(f.k!=='tint')return;const u=Math.min(1,f.t/f.life),a=f.a*(u<.1?u/.1:u>.75?1-(u-.75)/.25:1);X.save();X.globalAlpha=a*.6;X.fillStyle=f.col;X.fillRect(0,0,W2,H2);X.restore()});
  if(!ultCut)return;const c=ultCut;c.t+=rdt;const D=.75;if(c.t>D){ultCut=null;return}
  const u=c.t/D,inn=Math.min(1,c.t/.12),out=u>.8?1-(u-.8)/.2:1,col=ULT[c.id].col,gc=GCOL[c.g];X.save();
  X.globalAlpha=.55*out;X.fillStyle='#000';X.fillRect(0,0,W2,H2);X.globalAlpha=out;
  const cy=H2*.46,bh=H2*.3,sl=(1-inn)*W2*1.2;X.translate(-sl,0);
  X.fillStyle='#140c0a';X.beginPath();X.moveTo(0,cy-bh/2-10);X.lineTo(W2,cy-bh/2-40);X.lineTo(W2,cy+bh/2-20);X.lineTo(0,cy+bh/2+10);X.fill();
  const g=X.createLinearGradient(0,0,W2,0);g.addColorStop(0,gc);g.addColorStop(1,'#1a1030');X.fillStyle=g;X.beginPath();X.moveTo(0,cy-bh/2);X.lineTo(W2,cy-bh/2-30);X.lineTo(W2,cy+bh/2-30);X.lineTo(0,cy+bh/2);X.fill();
  X.globalCompositeOperation='lighter';X.globalAlpha=.25*out;X.fillStyle='#fff';for(let i=0;i<14;i++){const yy=cy-bh/2+((i*37)%bh),xx=((i*173+c.t*2600)%(W2+300))-150;X.fillRect(xx,yy,120+i*8,3)}X.globalCompositeOperation='source-over';X.globalAlpha=out;
  X.save();X.beginPath();X.moveTo(0,cy-bh/2);X.lineTo(W2,cy-bh/2-30);X.lineTo(W2,cy+bh/2-30);X.lineTo(0,cy+bh/2);X.clip();
  const bi=bear.set.idle.cv[0],dh=bh*1.25,dw=dh*64/46;X.imageSmoothingEnabled=false;X.drawImage(bi,8,40,64,46,W2*.03+(1-inn)*-80+c.t*30,cy-bh/2-12,dw,dh);X.restore();
  const tx=W2*.62,ty=cy+6,zs=1+Math.max(0,.15-c.t)*3;X.translate(tx,ty);X.scale(zs,zs);X.textAlign='center';X.textBaseline='middle';X.lineJoin='round';
  X.font='22px "Jal","Jua",sans-serif';const gl=GRADES[c.g]+'급 궁극기';X.lineWidth=8;X.strokeStyle='#140c0a';X.strokeText(gl,0,-44);X.fillStyle=gc;X.fillText(gl,0,-44);
  X.font='46px "Jal","Jua",sans-serif';const nm=ULT[c.id].n;X.lineWidth=14;X.strokeText(nm,0,8);const g2=X.createLinearGradient(0,-20,0,30);g2.addColorStop(0,'#ffffff');g2.addColorStop(1,col);X.fillStyle=g2;X.fillText(nm,0,6);
  X.restore()}
{const _rn=render;render=function(rdt){_rn(rdt);if(screen==='game')ultOverlay(rdt)}}
</script>
