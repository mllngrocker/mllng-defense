/* ---------- pets: 4 legendary beasts + 4 common animals, one equipped. Stored per pet AND grade (S.pets['tiger#0']); 3 same → same pet next grade.
 They evolve with grade: beasts C~A baby, S~SSS youth, H titan; commons C~A baby, S~SSS adult and stop at SSS (max). Art in beasts.js. kind = how it attacks, bk/bv = passive bonus. S급 이상은 5번째 공격마다 펫 스킬(3배). */
const PETS={
 tiger:{n:'백호',an:['아기 백호','젊은 백호','신수 백호'],kind:'multi',mul:.5,cd:1.6,at:'할퀴기 연타',bk:'atk',bv:5,col:'#bfe8ff'},
 phoenix:{n:'주작',an:['아기 주작','젊은 주작','신수 주작'],kind:'heal',mul:.45,cd:1.6,at:'불꽃 치유',bk:'regen',bv:10,col:'#ff8a3a',fly:1},
 qilin:{n:'기린',an:['아기 기린','젊은 기린','신수 기린'],kind:'proj',mul:.6,cd:1.4,at:'황금 뿔 일격',bk:'gold',bv:8,col:'#ffd34a'},
 dragon:{n:'청룡',an:['아기 청룡','젊은 청룡','신수 청룡'],kind:'aoe',mul:.9,cd:2.6,at:'청룡 파도',bk:'critd',bv:30,col:'#3ae0b8',fly:1},
 seal:{n:'물개',an:['아기 물개','물개'],kind:'stun',mul:.35,cd:3,at:'꽥! 울어서 기절',bk:'def',bv:4,col:'#c8d4e4',common:1},
 penguin:{n:'펭귄',an:['아기 펭귄','펭귄'],kind:'pierce',mul:.45,cd:2.2,at:'배 미끄럼 관통',bk:'hp',bv:4,col:'#bfe4ff',common:1},
 fox:{n:'북극여우',an:['아기 여우','북극여우'],kind:'multi',mul:.3,cd:1.8,at:'할퀴기 연타',bk:'crit',bv:1.5,col:'#fff4d8',common:1},
 gull:{n:'갈매기',an:['아기 갈매기','갈매기'],kind:'proj',mul:.35,cd:1.2,at:'부리로 쪼기',bk:'gold',bv:4,col:'#f6f9fb',fly:1,common:1},
};
for(const k in PETS){PETS[k].g=0;PETS[k].max=PETS[k].common?5:6;}
const petStage=(id,g)=>PETS[id].common?(g>=3?1:0):(g>=6?2:g>=3?1:0);
// how big each stage is drawn (the art itself grows a lot between stages)
const PET_SC=[1.1,.66,.52],PET_SC_COMMON=[1.05,.8];
function drawBeast(c,id,g,m){const st=petStage(id,g),k=(PETS[id].common?PET_SC_COMMON:PET_SC)[st];c.save();c.scale(k,k);BEAST[id][st](c,m);c.restore();}
// old 12-pet saves → the 4 beasts by fighting style, keeping count and best enhance level
const OLD_PET={mongsil:'seal',dwittung:'penguin',somsom:'fox',kkiruk:'gull',uni:'tiger',beoreok:'tiger',rudol:'tiger',ttoreu:'phoenix',jogae:'qilin',ppojjak:'qilin',turtank:'dragon',orca:'dragon'};
for(const k of Object.keys(S.pets)){const[id,g0]=gsplit(k);const to=OLD_PET[id];if(!to)continue;const g=Math.min(g0,PETS[to].max),nk=gkey(to,g),o=S.pets[k],cur=S.pets[nk];S.pets[nk]={n:(cur?.n||0)+o.n,lv:Math.max(cur?.lv||0,o.lv||0)};delete S.pets[k];if(S.pet===k)S.pet=nk;}
const PB_N={hp:'체력',gold:'골드 획득',atk:'공격력',crit:'치명타 확률',regen:'체력 회복',def:'받는 피해 감소',thorn:'피해 반사',critd:'치명타 피해',aspd:'공격 속도'};
for(const k of Object.keys(S.pets))if(!k.includes('#'))delete S.pets[k];
if(S.pet&&!S.pets[S.pet])S.pet=null;
function addPet(id,g){const k=gkey(id,g),own=S.pets[k];S.pets[k]={n:(own?.n||0)+1,lv:own?.lv||0};if(!S.pet||gsplit(S.pet)[1]<g)S.pet=k;return!own;}
const canMergePet=k=>{const[id,g]=gsplit(k),o=S.pets[k];return o&&g<PETS[id].max&&o.n>=MERGE_N;};
function mergePet(k){if(!canMergePet(k))return null;const[id,g]=gsplit(k);S.pets[k].n-=MERGE_N;if(S.pets[k].n<=0){delete S.pets[k];if(S.pet===k)S.pet=null;}addPet(id,g+1);save();return gkey(id,g+1);}
function petMul(k){const[id,g]=gsplit(k);return PETS[id].mul*GMUL[g]*.6*enhMul(S.pets[k]?.lv||0);}
function petBonusOf(k){const[id,g]=gsplit(k),P=PETS[id];return P.bv*(1+.5*(g-P.g))*enhMul(S.pets[k]?.lv||0);}
// passive bonus of the equipped pet (percent, or +points for crit)
function PB(stat){if(!S.pet||!S.pets[S.pet])return 0;const[id]=gsplit(S.pet);return PETS[id].bk===stat?petBonusOf(S.pet):0;}
/* ---------- runtime ---------- */
const pet={x:0,y:0,cd:1,mode:'idle',t:0,tx:0,ph:0,hits:null,n:0,fx:[]};
function petHit(m,mul,col){const crit=Math.random()*100<stat('crit');const d=ATK()*petMul(S.pet)*mul*(crit?stat('critd')/100:1);hitMob(m,d,crit);sparks(m.x,m.y-35*K*m.size,8,col,280);return d;}
function stepPet(dt){if(!S.pet||!S.pets[S.pet])return;const[id,g]=gsplit(S.pet),P=PETS[id],home=Math.max(BX-56*K,40*K),tg=front();pet.ph+=dt*9*Math.max(bear.walk,.2);
 if(!pet.x)pet.x=home;pet.cd-=dt;const fly=P.fly&&petStage(id,g)>0,air=fly?GY-(150+Math.sin(performance.now()/500)*6)*K:GY;
 for(let i=pet.fx.length-1;i>=0;i--){const f=pet.fx[i];f.t+=dt;if(f.kind==='wave'){f.x+=380*K*dt;for(const m of mobs)if(!m.dead&&!f.hit.has(m)&&Math.abs(m.x-f.x)<20*K){f.hit.add(m);petHit(m,f.mul,P.col);}if(f.x>W+40)pet.fx.splice(i,1);}else if(f.t>.6)pet.fx.splice(i,1);}
 {pet.x=lerp(pet.x,home,dt*4);pet.y=air;
  if(pet.cd<=0&&tg&&tg.x<W*.95&&!bear.dead){pet.cd=P.cd;pet.t=0;pet.n++;const sk=g>=3&&pet.n%5===0,mul=sk?3:1;pet.sk=sk;if(sk)num(pet.x,pet.y-60*K,'★'+P.at,'gold');
   if(P.kind==='proj'||P.kind==='heal')shots.push({x:pet.x+12*K,y:pet.y-24*K,vx:440*K,col:P.col,dmg:0,pet:1,mul,heal:P.kind==='heal'});
   else if(P.kind==='spines')for(let i=-1;i<=1;i++)shots.push({x:pet.x+12*K,y:pet.y-20*K+i*10*K,vx:460*K,col:P.col,dmg:0,pet:1,mul});
   else if(P.kind==='stun'){pet.fx.push({kind:'ring',t:0});for(const m of mobs)if(!m.dead&&m.x<W){m.frozen=Math.max(m.frozen||0,sk?2:.9);petHit(m,mul,P.col);}sfx('hurt');}
   else if(P.kind==='aoe')pet.fx.push({kind:'wave',t:0,x:pet.x,hit:new Set(),mul});
   // melee pets stay home: a short lunge in place, the hit lands on the target as claw marks / a piercing streak
   else if(P.kind==='pierce'){pet.lunge=.25;pet.fx.push({kind:'line',t:0,y:(fly?air+10*K:GY-18*K)});for(const m of mobs)if(!m.dead&&m.x>pet.x&&m.x<W+20)petHit(m,mul,P.col);}
   else{pet.lunge=.25;const hits=P.kind==='multi'?3:1;for(let i=0;i<hits;i++)petHit(tg,mul,P.col);pet.fx.push({kind:'claw',t:0,x:tg.x,y:tg.y-ART_H[tg.arch]*.45*K*tg.size,s:tg.size});
    if(P.push)for(const o of mobs)if(!o.dead&&o.x<tg.x+60*K)o.kb+=40*K;}}}
 pet.lunge=Math.max(0,(pet.lunge||0)-dt);}
// pet projectiles travel right on the shared shots list
function petShotHit(s){const tg=mobs.find(m=>!m.dead&&Math.abs(m.x-s.x)<20*K);if(tg){const d=petHit(tg,s.mul||1,s.col);if(s.heal){const h=MAXHP()*.03*(s.mul||1);bear.hp=Math.min(MAXHP(),bear.hp+h);num(BX,GY-120*K,'+'+fmt(h),'heal');}return true;}return s.x>W+20;}
function drawPet(c,t){if(!S.pet||!S.pets[S.pet])return;const[id]=gsplit(S.pet),P=PETS[id];
 for(const f of pet.fx){if(f.kind==='ring'){const k=f.t/.6;c.save();c.strokeStyle=`rgba(255,220,150,${1-k})`;c.lineWidth=4*K*(1-k)+1;c.beginPath();c.arc(pet.x,pet.y-25*K,k*W*.8,-.6,.6);c.stroke();c.restore();}
  else if(f.kind==='claw'){const k=f.t/.6,a=1-k,r=22*K*f.s;c.save();c.globalCompositeOperation='lighter';c.translate(f.x,f.y);c.rotate(-.6);
   for(let i=-1;i<=1;i++){const len=r*Math.min(1,f.t*8);c.lineCap='round';c.strokeStyle=`rgba(${hexRGB(P.col).map(v=>Math.round(v*255)).join(',')},${a*.8})`;c.lineWidth=6*K*a;c.beginPath();c.moveTo(i*8*K,-len);c.lineTo(i*8*K,len);c.stroke();c.strokeStyle=`rgba(255,255,255,${a})`;c.lineWidth=2*K*a;c.stroke();}c.restore();}
  else if(f.kind==='line'){const k=f.t/.6,a=1-k;c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(pet.x,0,W,0);g.addColorStop(0,`rgba(255,255,255,${a})`);g.addColorStop(1,'rgba(160,220,255,0)');c.fillStyle=g;c.fillRect(pet.x,f.y-5*K*a,W*Math.min(1,f.t*5),10*K*a);c.restore();}
  else{c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(f.x-50*K,0,f.x+10*K,0);g.addColorStop(0,'rgba(90,180,240,0)');g.addColorStop(1,'rgba(150,220,255,.8)');c.fillStyle=g;c.beginPath();c.moveTo(f.x-60*K,GY);c.quadraticCurveTo(f.x-10*K,GY-70*K,f.x+12*K,GY-40*K);c.quadraticCurveTo(f.x,GY-10*K,f.x+10*K,GY);c.closePath();c.fill();c.restore();}}
 const g0=gsplit(S.pet)[1];if(!(P.fly&&petStage(id,g0)>0)){c.fillStyle='rgba(10,20,40,.25)';c.beginPath();c.ellipse(pet.x,GY+2*K,16*K,3.5*K,0,0,TAU);c.fill();}
 const g=gsplit(S.pet)[1],sc=K*Math.min(1.2,.95+.04*g);const lg=Math.sin(Math.min(1,(.25-(pet.lunge||0))/.25)*Math.PI)*(pet.lunge>0?8*K:0);c.save();c.translate(pet.x+lg,pet.y);c.scale(sc,sc);petAura(c,g,t,'back');drawBeast(c,id,g,{t,ph:pet.ph,act:pet.lunge>0});petAura(c,g,t,'front');c.restore();}
/* grade aura: the stronger the pet, the more mystical it looks. layer 'back' = behind the art, 'front' = over it */
function petAura(c,g,t,layer,h=44){if(g<2)return;const col=GCOL[g],[r,gg,b]=hexRGB(col).map(v=>Math.round(v*255));c.save();c.globalCompositeOperation='lighter';
 if(layer==='back'){
  const hue=g>=5?`hsla(${(t*90)%360},95%,65%,`:`rgba(${r},${gg},${b},`;const R=h*(.85+.1*Math.sin(t*2));
  const gr=c.createRadialGradient(0,-h*.5,2,0,-h*.5,R);gr.addColorStop(0,hue+(.18+.06*g)+')');gr.addColorStop(1,hue+'0)');c.fillStyle=gr;c.fillRect(-R,-h*.5-R,R*2,R*2);
  if(g>=4){c.save();c.scale(1,.3);c.rotate(t*1.2);c.strokeStyle=hue+'.75)';c.lineWidth=2;c.beginPath();c.arc(0,0,h*.7,0,TAU);c.stroke();c.beginPath();c.arc(0,0,h*.52,0,TAU);c.stroke();
   for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(Math.cos(a)*h*.52,Math.sin(a)*h*.52);c.lineTo(Math.cos(a+.4)*h*.7,Math.sin(a+.4)*h*.7);c.stroke();}c.restore();}
  if(g>=6)for(const s of[-1,1]){c.save();c.translate(-4,-h*.6);c.scale(s,1);c.rotate(-.5+Math.sin(t*3)*.12);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-h*.5,-h*.8,-h*1.1,-h*.5);c.quadraticCurveTo(-h*.7,-h*.2,-h*.9,h*.05);c.quadraticCurveTo(-h*.4,0,0,0);
   const wg=c.createLinearGradient(-h,0,0,0);wg.addColorStop(0,'rgba(255,240,170,0)');wg.addColorStop(1,'rgba(255,250,220,.65)');c.fillStyle=wg;c.fill();c.restore();}}
 else{
  if(g>=3)for(let i=0;i<g+1;i++){const a=t*1.6+i*TAU/(g+1),x=Math.cos(a)*h*.75,y=-h*.5+Math.sin(a)*h*.3,s=(1.6+Math.sin(t*6+i))*1.2;
   c.fillStyle=g>=5?`hsl(${(t*120+i*50)%360},95%,75%)`:col;c.beginPath();c.moveTo(x,y-s*2);c.lineTo(x+s*.5,y-s*.5);c.lineTo(x+s*2,y);c.lineTo(x+s*.5,y+s*.5);c.lineTo(x,y+s*2);c.lineTo(x-s*.5,y+s*.5);c.lineTo(x-s*2,y);c.lineTo(x-s*.5,y-s*.5);c.closePath();c.fill();}
  if(g>=6){c.strokeStyle='rgba(255,240,170,.9)';c.lineWidth=2.4;c.shadowColor='#fff2a0';c.shadowBlur=10;c.beginPath();c.ellipse(2,-h-8,h*.32,h*.09,0,0,TAU);c.stroke();}}
 c.restore();}

