/* ---------- pets: 12 kinds, one equipped. Stored per pet AND grade (S.pets['seal#0']); 3 same → same pet next grade ----------
 kind = how it attacks. bk/bv = passive bonus while equipped. S급 이상은 5번째 공격마다 펫 스킬(3배). */
const PETS={
 mongsil:{n:'몽실',an:'아기 물범',g:0,kind:'dash',mul:.45,cd:1.6,at:'몸통 박치기',bk:'hp',bv:3,col:'#e2e9f1'},
 kkiruk:{n:'끼룩',an:'갈매기',g:0,kind:'proj',mul:.35,cd:1.2,at:'부리로 쪼기',bk:'gold',bv:3,col:'#f6f9fb',fly:1},
 dwittung:{n:'뒤뚱',an:'아기 펭귄',g:1,kind:'pierce',mul:.5,cd:2.2,at:'배 미끄럼 돌진',bk:'atk',bv:5,col:'#bfe4ff'},
 somsom:{n:'솜솜',an:'북극여우',g:1,kind:'multi',mul:.3,cd:1.8,at:'할퀴기 연타',bk:'crit',bv:2,col:'#fff4d8'},
 ttoreu:{n:'또르',an:'해마',g:1,kind:'heal',mul:.4,cd:1.8,at:'물방울 힐링',bk:'regen',bv:10,col:'#8fd0ff',fly:1},
 turtank:{n:'거북탱',an:'바다거북',g:2,kind:'proj',mul:.8,cd:2,at:'물방울 대포',bk:'def',bv:8,col:'#5ac8ff'},
 jogae:{n:'조개',an:'해달',g:2,kind:'proj',mul:.7,cd:1.6,at:'조개 던지기',bk:'gold',bv:10,col:'#ffc4cc'},
 ppojjak:{n:'뽀짝',an:'복어',g:2,kind:'spines',mul:.35,cd:1.8,at:'가시 발사',bk:'thorn',bv:5,col:'#ffd23a',fly:1},
 uni:{n:'유니',an:'일각고래',g:3,kind:'pierce',mul:1,cd:2.2,at:'뿔 관통 찌르기',bk:'atk',bv:15,col:'#a4c4e6',fly:1},
 beoreok:{n:'버럭',an:'바다사자',g:3,kind:'stun',mul:.6,cd:3,at:'짖어서 모두 기절',bk:'def',bv:10,col:'#c89a6a'},
 rudol:{n:'루돌',an:'순록',g:3,kind:'dash',mul:1.1,cd:2,at:'돌진해서 밀어내기',bk:'hp',bv:15,col:'#c69a66',push:1},
 orca:{n:'오르카',an:'범고래',g:4,kind:'aoe',mul:1.2,cd:3,at:'파도 박치기',bk:'critd',bv:40,col:'#5ab4f0',fly:1},
};
const PB_N={hp:'체력',gold:'골드 획득',atk:'공격력',crit:'치명타 확률',regen:'체력 회복',def:'받는 피해 감소',thorn:'피해 반사',critd:'치명타 피해',aspd:'공격 속도'};
for(const k of Object.keys(S.pets))if(!k.includes('#'))delete S.pets[k];
if(S.pet&&!S.pets[S.pet])S.pet=null;
function addPet(id,g){const k=gkey(id,g),own=S.pets[k];S.pets[k]={n:(own?.n||0)+1,lv:own?.lv||0};if(!S.pet||gsplit(S.pet)[1]<g)S.pet=k;return!own;}
const canMergePet=k=>{const[,g]=gsplit(k),o=S.pets[k];return o&&g<6&&o.n>=MERGE_N;};
function mergePet(k){if(!canMergePet(k))return null;const[id,g]=gsplit(k);S.pets[k].n-=MERGE_N;if(S.pets[k].n<=0){delete S.pets[k];if(S.pet===k)S.pet=null;}addPet(id,g+1);save();return gkey(id,g+1);}
function petMul(k){const[id,g]=gsplit(k);return PETS[id].mul*GMUL[g]*.6*enhMul(S.pets[k]?.lv||0);}
function petBonusOf(k){const[id,g]=gsplit(k),P=PETS[id];return P.bv*(1+.5*(g-P.g))*enhMul(S.pets[k]?.lv||0);}
// passive bonus of the equipped pet (percent, or +points for crit)
function PB(stat){if(!S.pet||!S.pets[S.pet])return 0;const[id]=gsplit(S.pet);return PETS[id].bk===stat?petBonusOf(S.pet):0;}
/* ---------- runtime ---------- */
const pet={x:0,y:0,cd:1,mode:'idle',t:0,tx:0,ph:0,hits:null,n:0,fx:[]};
function petHit(m,mul,col){const crit=Math.random()*100<stat('crit');const d=ATK()*petMul(S.pet)*mul*(crit?stat('critd')/100:1);hitMob(m,d,crit);sparks(m.x,m.y-35*K*m.size,8,col,280);return d;}
function stepPet(dt){if(!S.pet||!S.pets[S.pet])return;const[id,g]=gsplit(S.pet),P=PETS[id],home=Math.max(BX-56*K,40*K),tg=front();pet.ph+=dt*9*Math.max(bear.walk,.2);
 if(!pet.x)pet.x=home;pet.cd-=dt;const air=P.fly?GY-(150+Math.sin(performance.now()/500)*6)*K:GY;
 for(let i=pet.fx.length-1;i>=0;i--){const f=pet.fx[i];f.t+=dt;if(f.kind==='wave'){f.x+=380*K*dt;for(const m of mobs)if(!m.dead&&!f.hit.has(m)&&Math.abs(m.x-f.x)<20*K){f.hit.add(m);petHit(m,f.mul,P.col);}if(f.x>W+40)pet.fx.splice(i,1);}else if(f.t>.6)pet.fx.splice(i,1);}
 if(pet.mode==='idle'){pet.x=lerp(pet.x,home,dt*4);pet.y=air;
  if(pet.cd<=0&&tg&&tg.x<W*.95&&!bear.dead){pet.cd=P.cd;pet.t=0;pet.n++;const sk=g>=3&&pet.n%5===0,mul=sk?3:1;pet.sk=sk;if(sk)num(pet.x,pet.y-60*K,'★'+P.at,'gold');
   if(P.kind==='proj'||P.kind==='heal')shots.push({x:pet.x+12*K,y:pet.y-24*K,vx:440*K,col:P.col,dmg:0,pet:1,mul,heal:P.kind==='heal'});
   else if(P.kind==='spines')for(let i=-1;i<=1;i++)shots.push({x:pet.x+12*K,y:pet.y-20*K+i*10*K,vx:460*K,col:P.col,dmg:0,pet:1,mul});
   else if(P.kind==='stun'){pet.fx.push({kind:'ring',t:0});for(const m of mobs)if(!m.dead&&m.x<W){m.frozen=Math.max(m.frozen||0,sk?2:.9);petHit(m,mul,P.col);}sfx('hurt');}
   else if(P.kind==='aoe')pet.fx.push({kind:'wave',t:0,x:pet.x,hit:new Set(),mul});
   else if(P.kind==='pierce'){pet.mode='slide';pet.hits=new Set();pet.mul=mul;}
   else{pet.mode='go';pet.tx=tg.x;pet.hitDone=false;pet.mul=mul;}}}
 else if(pet.mode==='slide'){pet.t+=dt;pet.x+=520*K*dt;pet.y=P.fly?air:GY;for(const m of mobs)if(!m.dead&&!pet.hits.has(m)&&Math.abs(m.x-pet.x)<22*K){pet.hits.add(m);petHit(m,pet.mul,P.col);}
  if(pet.x>W+40){pet.mode='idle';pet.x=-30*K;}}
 else{pet.t+=dt;const k=pet.mode==='go'?Math.min(1,pet.t/.35):1-Math.min(1,pet.t/.4);
  pet.x=lerp(home,pet.tx-24*K,k);pet.y=P.fly?lerp(air,GY-30*K,k):GY-Math.sin(k*Math.PI)*14*K*(pet.mode==='go'?1:0);
  if(pet.mode==='go'&&k>=1){if(!pet.hitDone){pet.hitDone=true;const m=mobs.find(o=>!o.dead&&Math.abs(o.x-pet.tx)<40*K)||front();
    if(m){const hits=P.kind==='multi'?3:1;for(let i=0;i<hits;i++)petHit(m,pet.mul,P.col);if(P.push)for(const o of mobs)if(!o.dead&&o.x<pet.tx+60*K)o.kb+=40*K;}}pet.mode='back';pet.t=0;}
  else if(pet.mode==='back'&&k<=0)pet.mode='idle';}}
// pet projectiles travel right on the shared shots list
function petShotHit(s){const tg=mobs.find(m=>!m.dead&&Math.abs(m.x-s.x)<20*K);if(tg){const d=petHit(tg,s.mul||1,s.col);if(s.heal){const h=MAXHP()*.03*(s.mul||1);bear.hp=Math.min(MAXHP(),bear.hp+h);num(BX,GY-120*K,'+'+fmt(h),'heal');}return true;}return s.x>W+20;}
function drawPet(c,t){if(!S.pet||!S.pets[S.pet])return;const[id]=gsplit(S.pet),P=PETS[id];
 for(const f of pet.fx){if(f.kind==='ring'){const k=f.t/.6;c.save();c.strokeStyle=`rgba(255,220,150,${1-k})`;c.lineWidth=4*K*(1-k)+1;c.beginPath();c.arc(pet.x,pet.y-25*K,k*W*.8,-.6,.6);c.stroke();c.restore();}
  else{c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(f.x-50*K,0,f.x+10*K,0);g.addColorStop(0,'rgba(90,180,240,0)');g.addColorStop(1,'rgba(150,220,255,.8)');c.fillStyle=g;c.beginPath();c.moveTo(f.x-60*K,GY);c.quadraticCurveTo(f.x-10*K,GY-70*K,f.x+12*K,GY-40*K);c.quadraticCurveTo(f.x,GY-10*K,f.x+10*K,GY);c.closePath();c.fill();c.restore();}}
 if(!P.fly){c.fillStyle='rgba(10,20,40,.25)';c.beginPath();c.ellipse(pet.x,GY+2*K,16*K,3.5*K,0,0,TAU);c.fill();}
 const g=gsplit(S.pet)[1],sc=K*Math.min(1.2,.95+.04*g);c.save();c.translate(pet.x,pet.y);c.scale(sc,sc);petAura(c,g,t,'back');PET_ART[id](c,{t,ph:pet.ph,act:pet.mode!=='idle'});petAura(c,g,t,'front');c.restore();}
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
/* ---------- pet art: realistic-ish, facing right, feet at y=0 (one outline, gradient shading) ---------- */
function outlined(c,paths){c.lineJoin='round';for(const[p]of paths){p();c.lineWidth=2;c.strokeStyle=FUR.line;c.stroke();}for(const[p,f]of paths){p();c.fillStyle=f();c.fill();}}
const eyeDot=(c,x,y,r=1.8)=>{ell(c,x,y,r,r);c.fillStyle='#14100e';c.fill();ell(c,x-r*.35,y-r*.35,r*.35,r*.35);c.fillStyle='#fff';c.fill();};
const PET_ART={
 mongsil:(c,m)=>{const b=Math.abs(Math.sin(m.ph*.6))*4;c.translate(0,-b);
  outlined(c,[[()=>{c.beginPath();c.moveTo(-22,-2);c.bezierCurveTo(-26,-20,-6,-30,10,-26);c.bezierCurveTo(24,-22,26,-6,18,-1);c.quadraticCurveTo(0,4,-22,-2);c.closePath();},()=>lgrad(c,-30,0,'#f2f6fa')],
   [()=>{ell(c,-24,-4,7,3,.5);},()=>'#d0d8e2'],[()=>{ell(c,6,-3,6,2.5,-.3);},()=>'#d0d8e2']]);
  eyeDot(c,14,-17,2.6);eyeDot(c,7,-18,2.4);ell(c,20,-12,2,1.5);c.fillStyle='#2a2420';c.fill();c.strokeStyle='rgba(60,60,70,.45)';c.lineWidth=.7;for(const dy of[-1,1]){c.beginPath();c.moveTo(19,-11+dy);c.lineTo(27,-12+dy*2);c.stroke();}},
 kkiruk:(c,m)=>{const fl=Math.sin(m.t*10)*.6;
  outlined(c,[[()=>{c.save();c.translate(-2,-6);c.rotate(-.5-fl);ell(c,-10,0,15,5);c.restore();},()=>lgrad(c,-14,0,'#b8c0cc')],[()=>{ell(c,0,0,14,8);},()=>lgrad(c,-8,8,'#f6f9fb')],
   [()=>{ell(c,12,-6,6.5,6);},()=>lgrad(c,-12,0,'#ffffff')],[()=>{c.beginPath();c.moveTo(17,-6);c.lineTo(26,-4);c.lineTo(17,-3);c.closePath();},()=>'#ffc23a'],[()=>{c.save();c.translate(-2,-4);c.rotate(-.2+fl);ell(c,-10,0,16,4.5);c.restore();},()=>lgrad(c,-8,0,'#c8d0da')]]);
  eyeDot(c,14,-8,1.4);},
 dwittung:(c,m)=>{const w=Math.sin(m.ph)*.15,fl=Math.sin(m.t*3)*.15;c.rotate(w*.3);
  outlined(c,[[()=>{ell(c,-4,-2,5,2.5);ell(c,6,-2,5,2.5);},()=>'#ff9a3a'],
   [()=>{c.beginPath();c.moveTo(-10,-4);c.bezierCurveTo(-16,-24,-12,-40,-2,-44);c.bezierCurveTo(10,-46,14,-30,12,-4);c.quadraticCurveTo(0,0,-10,-4);c.closePath();},()=>lgrad(c,-46,0,'#2a2e3a')],
   [()=>{c.beginPath();c.moveTo(-6,-6);c.bezierCurveTo(-8,-22,0,-34,8,-30);c.bezierCurveTo(12,-22,11,-10,8,-5);c.closePath();},()=>lgrad(c,-34,-5,'#f4f6fa')],
   [()=>{c.save();c.translate(-8,-30);c.rotate(.3+fl+(m.act?-.6:0));ell(c,-2,8,3.5,10);c.restore();},()=>'#1e222c'],
   [()=>{c.beginPath();c.moveTo(10,-40);c.lineTo(17,-38);c.lineTo(10,-36);c.closePath();},()=>'#ff8a2a']]);
  ell(c,6,-41,2.6,2.6);c.fillStyle='#fff';c.fill();ell(c,6.4,-41,1.2,1.2);c.fillStyle='#111';c.fill();},
 somsom:(c,m)=>{const s=Math.sin(m.ph)*.4,run=m.act?1:0,tail=Math.sin(m.t*3)*.15;
  const leg=(x,a)=>()=>{c.save();c.translate(x,-14);c.rotate(a);rr(c,-2.6,0,5.2,14,2.5);c.restore();};
  outlined(c,[[leg(-14,-s*.6-run*.4),()=>'#d8d2c4'],[leg(10,s*.6+run*.4),()=>'#d8d2c4'],
   [()=>{c.beginPath();c.moveTo(-20,-22);c.bezierCurveTo(-36,-30-tail*20,-46,-22,-42,-10);c.bezierCurveTo(-34,-14,-26,-14,-18,-14);c.closePath();},()=>lgrad(c,-34,-10,'#fbf8f2')],
   [()=>{ell(c,-2,-20,20,9.5);},()=>lgrad(c,-30,-10,'#fbf8f2')],[leg(-8,s*.6),()=>lgrad(c,-14,0,'#f4f0e8')],[leg(15,-s*.6),()=>lgrad(c,-14,0,'#f4f0e8')],
   [()=>{c.beginPath();c.moveTo(12,-24);c.bezierCurveTo(14,-34,24,-36,28,-31);c.lineTo(36,-25);c.quadraticCurveTo(30,-20,22,-19);c.closePath();c.moveTo(16,-31);c.lineTo(17,-40);c.lineTo(22,-33);c.moveTo(21,-33);c.lineTo(24,-41);c.lineTo(26,-32);},()=>lgrad(c,-40,-19,'#fbf8f2')]]);
  ell(c,35.5,-25,1.6,1.3);c.fillStyle='#1a1410';c.fill();ell(c,25,-29,1.3,1);c.fillStyle='#1a1410';c.fill();},
 ttoreu:(c,m)=>{const b=Math.sin(m.t*2)*3;c.translate(0,b);
  outlined(c,[[()=>{c.beginPath();c.moveTo(0,-34);c.bezierCurveTo(10,-34,12,-22,6,-14);c.bezierCurveTo(12,-4,6,6,-2,4);c.bezierCurveTo(-8,2,-6,-4,-2,-4);c.bezierCurveTo(2,-4,2,0,-1,0);c.bezierCurveTo(-4,-8,-4,-18,-6,-24);c.bezierCurveTo(-8,-30,-4,-34,0,-34);c.closePath();},()=>lgrad(c,-34,4,'#8fd0ff')],
   [()=>{c.beginPath();c.moveTo(4,-32);c.lineTo(16,-30);c.lineTo(15,-27);c.lineTo(4,-27);c.closePath();},()=>lgrad(c,-32,-27,'#7ac0f0')],[()=>{c.beginPath();c.moveTo(-6,-22);c.quadraticCurveTo(-14,-18,-8,-12);c.closePath();},()=>'#c8ecff']]);
  eyeDot(c,3,-29,1.6);c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=.8;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-4,-22+i*4);c.lineTo(5,-21+i*4);c.stroke();}},
 turtank:(c,m)=>{const s=Math.sin(m.ph)*.3;
  outlined(c,[[()=>{c.save();c.translate(-14,-6);c.rotate(-s);ell(c,-4,2,8,3.5);c.restore();c.save();c.translate(12,-6);c.rotate(s);ell(c,4,2,8,3.5);c.restore();},()=>'#8ab06a'],
   [()=>{c.beginPath();c.moveTo(16,-10);c.bezierCurveTo(22,-16,32,-16,32,-10);c.bezierCurveTo(32,-6,24,-4,16,-6);c.closePath();},()=>lgrad(c,-16,-4,'#9ac07a')],
   [()=>{c.beginPath();c.moveTo(-22,-6);c.bezierCurveTo(-22,-26,20,-26,20,-6);c.closePath();},()=>lgrad(c,-26,-6,'#5a8a4a')]]);
  c.strokeStyle='rgba(30,50,20,.6)';c.lineWidth=1.2;for(const[x,y]of[[-10,-12],[0,-17],[10,-12],[0,-9]]){c.beginPath();for(let i=0;i<6;i++){const a=i*TAU/6;c.lineTo(x+Math.cos(a)*5,y+Math.sin(a)*4);}c.closePath();c.stroke();}eyeDot(c,27,-12,1.4);},
 jogae:(c,m)=>{const b=Math.sin(m.t*3)*.1;
  outlined(c,[[()=>{c.beginPath();c.moveTo(-12,-2);c.bezierCurveTo(-18,-14,-14,-30,-2,-32);c.bezierCurveTo(10,-32,14,-20,12,-2);c.quadraticCurveTo(0,2,-12,-2);c.closePath();},()=>lgrad(c,-32,0,'#8a6448')],
   [()=>{ell(c,0,-38,10,9);},()=>lgrad(c,-46,-29,'#9a7458')],[()=>{ell(c,4,-35,6,4.5);},()=>'#d8c0a8'],
   [()=>{c.save();c.translate(4,-20);c.rotate(b);ell(c,0,0,7,5.5);c.restore();},()=>lgrad(c,-25,-15,'#ffc4cc')]]);
  eyeDot(c,-1,-41,1.5);eyeDot(c,6,-41,1.5);ell(c,6,-36,1.6,1.2);c.fillStyle='#2a2020';c.fill();},
 ppojjak:(c,m)=>{const pf=1+Math.sin(m.t*3)*.06+(m.act?.15:0);c.translate(0,-16);c.scale(pf,pf);
  outlined(c,[[()=>{ell(c,0,0,15,13);},()=>rgrad(c,0,0,15,'#ffd23a')],[()=>{c.beginPath();c.moveTo(-14,0);c.lineTo(-24,-7);c.lineTo(-24,7);c.closePath();},()=>'#ffb02e']]);
  c.strokeStyle=FUR.line;c.lineWidth=1.2;for(let i=0;i<12;i++){const a=i*TAU/12;c.beginPath();c.moveTo(Math.cos(a)*14,Math.sin(a)*12);c.lineTo(Math.cos(a)*19,Math.sin(a)*17);c.stroke();}
  c.fillStyle='rgba(150,100,20,.45)';for(let i=0;i<6;i++){ell(c,-6+i*2.4,-6+(i%2)*4,1.4,1.4);c.fill();}eyeDot(c,7,-4,2.4);ell(c,13,2,2,1.3);c.fillStyle='#c86a2a';c.fill();},
 uni:(c,m)=>{const b=Math.sin(m.t*2)*2;c.translate(0,b);
  outlined(c,[[()=>{c.beginPath();c.moveTo(-34,-14);c.lineTo(-44,-22);c.lineTo(-42,-10);c.lineTo(-44,-2);c.closePath();},()=>'#8aa4c6'],
   [()=>{c.beginPath();c.moveTo(-34,-12);c.bezierCurveTo(-20,-28,10,-30,22,-18);c.bezierCurveTo(26,-12,22,-4,12,-4);c.bezierCurveTo(-10,-2,-24,-4,-34,-12);c.closePath();},()=>lgrad(c,-28,-4,'#a4c4e6')],
   [()=>{c.beginPath();c.moveTo(21,-16);c.lineTo(52,-24);c.lineTo(22,-13);c.closePath();},()=>'#f4eedc']]);
  c.fillStyle='rgba(60,80,110,.35)';for(let i=0;i<8;i++){ell(c,-20+i*5,-18+(i%3)*3,1.6,1.2);c.fill();}eyeDot(c,14,-14,1.5);},
 beoreok:(c,m)=>{const bark=m.act?.2:0;
  outlined(c,[[()=>{ell(c,-16,-3,10,3.5,.3);},()=>'#8a6a48'],[()=>{c.beginPath();c.moveTo(-26,-2);c.bezierCurveTo(-24,-18,-4,-24,6,-36);c.bezierCurveTo(10,-46,22,-44,22,-36);c.bezierCurveTo(22,-26,14,-14,10,-2);c.quadraticCurveTo(-8,2,-26,-2);c.closePath();},()=>lgrad(c,-46,0,'#c89a6a')],
   [()=>{c.save();c.translate(16,-38);c.rotate(-bark);ell(c,6,0,8,4.5);c.restore();},()=>lgrad(c,-42,-34,'#b88a5a')],[()=>{ell(c,8,-4,7,3,-.3);},()=>'#8a6a48']]);
  eyeDot(c,15,-41,1.8);ell(c,27,-38,1.6,1.3);c.fillStyle='#2a2020';c.fill();c.strokeStyle='rgba(40,30,20,.5)';c.lineWidth=.7;for(const dy of[-1,1]){c.beginPath();c.moveTo(25,-36+dy);c.lineTo(32,-35+dy*2);c.stroke();}},
 rudol:(c,m)=>{const s=Math.sin(m.ph)*.45,run=m.act?1:0;
  const leg=(x,a,col)=>[()=>{c.save();c.translate(x,-22);c.rotate(a);rr(c,-2.4,0,4.8,22,2);c.restore();},()=>col];
  outlined(c,[leg(-14,-s-run*.3,'#8a6a48'),leg(12,s+run*.3,'#8a6a48'),[()=>{ell(c,-2,-28,20,10);},()=>lgrad(c,-38,-18,'#c69a66')],leg(-8,s,'#a07a50'),leg(16,-s,'#a07a50'),
   [()=>{c.beginPath();c.moveTo(12,-32);c.lineTo(18,-46);c.quadraticCurveTo(26,-50,32,-44);c.lineTo(34,-40);c.quadraticCurveTo(26,-38,22,-30);c.closePath();},()=>lgrad(c,-50,-30,'#c69a66')],
   [()=>{ell(c,-20,-32,4,3);},()=>'#f4eee0']]);
  c.strokeStyle='#6a4a30';c.lineWidth=2.2;c.lineCap='round';for(const s2 of[0,4]){c.beginPath();c.moveTo(22+s2,-48);c.lineTo(18+s2,-60);c.moveTo(20+s2,-54);c.lineTo(26+s2,-60);c.moveTo(19+s2,-58);c.lineTo(14+s2,-64);c.stroke();}
  eyeDot(c,25,-44,1.4);ell(c,34,-42,1.8,1.6);c.fillStyle='#d83a3a';c.fill();},
 orca:(c,m)=>{const b=Math.sin(m.t*2)*2,tl=Math.sin(m.t*4)*.2;c.translate(0,b);
  outlined(c,[[()=>{c.save();c.translate(-36,-14);c.rotate(tl);c.beginPath();c.moveTo(0,0);c.lineTo(-12,-8);c.lineTo(-8,0);c.lineTo(-12,8);c.closePath();c.restore();},()=>'#1a1e28'],
   [()=>{c.beginPath();c.moveTo(-36,-14);c.bezierCurveTo(-20,-32,14,-34,28,-18);c.bezierCurveTo(32,-12,26,-4,14,-4);c.bezierCurveTo(-10,-2,-26,-6,-36,-14);c.closePath();},()=>lgrad(c,-32,-4,'#22283a')],
   [()=>{c.beginPath();c.moveTo(-4,-28);c.lineTo(0,-46);c.lineTo(8,-28);c.closePath();},()=>'#1a1e28']]);
  c.beginPath();c.moveTo(-10,-8);c.bezierCurveTo(4,-4,20,-6,26,-12);c.bezierCurveTo(14,-10,0,-12,-10,-8);c.fillStyle='#f4f6fa';c.fill();ell(c,16,-20,4.5,2.4,-.2);c.fill();
  ell(c,-12,-22,6,2,-.2);c.fillStyle='rgba(220,226,236,.85)';c.fill();eyeDot(c,18,-18,1.2);},
};
