<script>
/* ================= pets: data, sprites, combat, UI ================= */
R('seal',['#4f5a6a','#7f8a9a','#b4bfcc','#e2e9f1']);R('peng',['#0c111c','#1c2538','#2e3a54','#4a5878']);R('belly',['#aab4c0','#d6dee6','#f6f9fb']);
R('ora',['#7a300c','#c25a18','#ef9634','#ffd08a']);R('grn',['#1a4a22','#2a7a36','#4eaa46','#92d870']);R('brn',['#36200f','#603a1e','#8e5c30','#c08a52']);
R('tan',['#5e4024','#946a40','#c69a66','#e8c898']);R('narw',['#24364e','#3e5a80','#6a8eb8','#a4c4e6']);R('wolf',['#353a44','#5e6572','#8f97a6','#c8ced8']);
R('aur',['#0a5a5e','#1c9e94','#52e4c0','#ccfff0']);R('wool',['#3e2214','#6a3e22','#9a6634','#cc9256']);R('tusk',['#9a9078','#d6ceb4','#f6f2e4']);R('clam',['#a85a6a','#e08a96','#ffc4cc']);
const PBL=BLACK,PWH=WHITE;
function eye(P,x,y,r,z){P.push(E(x,y,r,r*1.15,null,z,{col:PBL}));P.push(E(x+r*.35,y-r*.4,r*.38,r*.38,null,z+.01,{col:PWH}))}
const PETDRAW={
 seal(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Pg([[6,40+b],[2,35+b],[3,44+b]],'seal',1));P.push(E(21,39+b,15,7.5,'seal',2));P.push(E(23,42+b,10,3.5,'belly',2.1,{g:2}));
  P.push(E(34,32+b,8.5,7.5,'seal',3));P.push(E(39,35+b,4,3,'belly',3.1,{g:3}));eye(P,36,30+b,1.7,3.2);P.push(E(42.5,33.5+b,1.3,1,null,3.3,{col:PBL}));P.push(Pg([[26,42+b],[31,46],[22,45]],'seal',2.5));return P},
 gull(t){const fy=Math.round(Math.sin(t)*2),fl=Math.sin(t*2)*6,P=[];P.push(Pg([[23,24+fy],[15,10+fy+fl],[8,20+fy+fl*.5],[15,26+fy]],'seal',1));P.push(E(21,28+fy,10,6.5,'belly',2));
  P.push(Pg([[13,26+fy],[5,24+fy],[6,31+fy],[13,31+fy]],'seal',1.9));P.push(E(31,24+fy,5.4,5,'belly',2.5));P.push(Pg([[36,23+fy],[43,26+fy],[36,27.5+fy]],'gold',2.6));eye(P,32.5,22.5+fy,1,2.7);
  P.push(Pg([[24,23+fy],[18,9+fy+fl],[13,22+fy]],'seal',3));P.push(Cp({x:20,y:34+fy},{x:20,y:38+fy},.6,.6,null,1.5,{col:hex('#f0a020')}));return P},
 peng(t){const P=[],b=Math.round(Math.sin(t)*1),w=Math.sin(t*2)*.3;P.push(E(23,33+b,9,11,'peng',2));P.push(E(26,35+b,6,8.5,'belly',2.2,{g:2}));P.push(E(25,20+b,7,6.5,'peng',3));
  P.push(E(28,21+b,4,3.6,'belly',3.1,{g:3}));eye(P,29,20+b,1.3,3.2);P.push(Pg([[31,22+b],[37,23.5+b],[31,25+b]],'ora',3.3));
  P.push(Cp({x:17,y:28+b},{x:13,y:38+b+w*6},2.2,1.4,'peng',1.8));P.push(E(21,45,3.4,1.5,'ora',1));P.push(E(28,45,3.4,1.5,'ora',1));return P},
 fox(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(E(9,30+b,7,5,'fur',1,{a:-.5}));P.push(E(22,35+b,11,7,'fur',2));
  [[16,40],[28,40]].forEach(([x,y],i)=>P.push(Cp({x,y:y+b},{x:x+(i?1:-1),y:45},2,1.8,'furD',1.5)));P.push(E(34,27+b,7.5,6.5,'fur',3));
  P.push(Pg([[29,22+b],[30,14+b],[34,21+b]],'fur',2.9));P.push(Pg([[34,21+b],[37,14+b],[39,22+b]],'fur',2.9));P.push(Pg([[39,26+b],[45,29+b],[39,31+b]],'fur',3.1));
  P.push(E(44.5,29+b,1.1,1,null,3.2,{col:PBL}));eye(P,36,25+b,1.3,3.2);return P},
 horse(t){const fy=Math.round(Math.sin(t)*2),P=[];P.push(E(26,15+fy,5.5,4.5,'ora',3));P.push(Cp({x:30,y:16+fy},{x:38,y:17+fy},1.8,1.4,'ora',3.1));
  P.push(Cp({x:24,y:18+fy},{x:22,y:28+fy},4.5,5,'ora',2));P.push(Cp({x:22,y:28+fy},{x:25,y:36+fy},5,3.5,'ora',2.1));P.push(Cp({x:25,y:36+fy},{x:20,y:41+fy},3.5,2,'ora',2.2));P.push(Cp({x:20,y:41+fy},{x:18,y:37+fy},2,1.4,'ora',2.3));
  P.push(Pg([[19,20+fy],[13,24+fy],[19,28+fy]],'gold',1.5));P.push(Pg([[24,11+fy],[26,7+fy],[28,11+fy]],'gold',2.9));eye(P,27,14+fy,1.2,3.2);return P},
 turtle(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(E(37,34+b,5,4.2,'grn',1.5));eye(P,38.5,32.5+b,1.1,1.6);
  [[14,42],[30,42]].forEach(([x,y])=>P.push(E(x,y,3.2,2.6,'grn',1)));P.push(E(22,34+b,13,9,'brn',2));
  [[17,31],[24,29],[28,35],[18,37]].forEach(([x,y],i)=>P.push(E(x,y+b,3,2.4,'plank',2.1+i*.01,{g:5})));P.push(Pg([[9,39+b],[35,39+b],[35,41+b],[9,41+b]],'tan',2.2));
  P.push(Cp({x:22,y:24+b},{x:29,y:22+b},1.6,1.6,'gunb',2.5));return P},
 otter(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:12,y:38+b},{x:4,y:42},2.6,1.6,'brn',1));P.push(E(21,34+b,10,8,'brn',2));P.push(E(23,37+b,6,5,'tan',2.1,{g:2}));
  P.push(E(32,24+b,7,6.5,'brn',3));P.push(E(35,27+b,4.2,3.2,'tan',3.1,{g:3}));eye(P,34,22+b,1.2,3.2);P.push(E(38.5,25.5+b,1.2,1,null,3.3,{col:PBL}));P.push(E(27,19+b,1.8,1.6,'brn',2.9));
  P.push(E(32,35+b,4,3.2,'clam',3.4));P.push(Cp({x:29,y:35+b},{x:35,y:35+b},.4,.4,null,3.5,{col:hex('#a85a6a')}));P.push(E(18,44,3,1.6,'brn',1.5));P.push(E(26,44,3,1.6,'brn',1.5));return P},
 puffer(t){const fy=Math.round(Math.sin(t)*2),P=[];for(let i=0;i<10;i++){const a=i/10*Math.PI*2,x=24+Math.cos(a)*12,y=26+fy+Math.sin(a)*11;P.push(Pg([[x-1.3,y],[x+Math.cos(a)*3.5,y+Math.sin(a)*3.5],[x+1.3,y]],'tan',1))}
  P.push(E(24,26+fy,11,10,'gold',2));P.push(E(25,30+fy,7,5,'belly',2.1,{g:2}));P.push(Pg([[13,25+fy],[7,20+fy],[7,31+fy]],'ora',1.5));eye(P,29,23+fy,1.8,2.3);P.push(E(34.5,27+fy,1.4,1.2,null,2.3,{col:hex('#a04a1a')}));return P},
 narw(t){const fy=Math.round(Math.sin(t)*2),P=[];P.push(Pg([[9,26+fy],[2,20+fy],[4,26+fy],[2,32+fy]],'narw',1));P.push(E(22,27+fy,14,8,'narw',2));P.push(E(24,31+fy,10,3.5,'belly',2.1,{g:2}));
  [[14,24],[20,22],[26,24],[18,27]].forEach(([x,y],i)=>P.push(E(x,y+fy,1.2,1,null,2.2,{col:hex('#3e5a80')})));eye(P,31,25+fy,1.2,2.3);P.push(Cp({x:35,y:24+fy},{x:47,y:18+fy},1.4,.5,'tusk',2.5));
  P.push(Pg([[20,33+fy],[26,33+fy],[22,38+fy]],'narw',1.5));return P},
 sealion(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Pg([[8,44],[3,40],[4,46]],'brn',1));P.push(E(19,38+b,11,7,'brn',2));P.push(Cp({x:24,y:34+b},{x:29,y:22+b},6,5,'brn',2.5));
  P.push(E(31,19+b,6,5.5,'brn',3));P.push(E(36,21+b,3.6,2.8,'tan',3.1,{g:3}));eye(P,32,17+b,1.2,3.2);P.push(E(39,20+b,1.1,1,null,3.3,{col:PBL}));
  P.push(Pg([[26,36+b],[33,44],[24,44]],'brn',2.6));return P},
 deer(t){const P=[],b=Math.round(Math.sin(t*2)*.6);[[14,36],[18,36],[27,36],[31,36]].forEach(([x,y],i)=>P.push(Cp({x,y:y+b},{x:x+(i%2?1:-1)*Math.sin(t*2),y:46},1.5,1.2,'brn',1)));
  P.push(E(22,32+b,11,6.5,'tan',2));P.push(E(10,29+b,2.6,2,'belly',1.9));P.push(Cp({x:31,y:29+b},{x:35,y:21+b},3.4,3,'tan',2.4));P.push(E(37,19+b,5,4.2,'tan',3));
  P.push(Cp({x:35,y:16+b},{x:32,y:7+b},.8,.6,'horn',2.8));P.push(Cp({x:33,y:11+b},{x:28,y:8+b},.7,.5,'horn',2.8));P.push(Cp({x:37,y:15+b},{x:39,y:6+b},.8,.6,'horn',2.8));P.push(Cp({x:38.5,y:10+b},{x:43,y:7+b},.7,.5,'horn',2.8));
  eye(P,37,18+b,1.1,3.2);P.push(E(42,20+b,1.6,1.5,null,3.3,{col:hex('#ff3a3a')}));return P},
 orca(t){const fy=Math.round(Math.sin(t)*2),P=[];P.push(Pg([[8,26+fy],[1,19+fy],[3,26+fy],[1,33+fy]],'peng',1));P.push(E(23,27+fy,15,8.5,'peng',2));P.push(E(26,32+fy,11,3.6,'belly',2.1,{g:2}));
  P.push(Pg([[19,20+fy],[22,8+fy],[26,20+fy]],'peng',1.5));P.push(E(31,23+fy,3.2,1.7,'belly',2.2,{g:3}));P.push(E(33.5,25.5+fy,.9,.9,null,2.3,{col:PBL}));P.push(Pg([[24,32+fy],[30,32+fy],[26,38+fy]],'peng',1.6));return P},
 wolf(t){const P=[],b=Math.round(Math.sin(t*2)*.6);P.push(Cp({x:12,y:30+b},{x:4,y:36+b},3,2,'wolf',1));[[15,36],[19,36],[27,36],[31,36]].forEach(([x,y],i)=>P.push(Cp({x,y:y+b},{x:x+(i%2?1:-1)*Math.sin(t*2),y:46},1.8,1.5,'wolf',1.2)));
  P.push(E(22,32+b,11.5,7,'wolf',2));P.push(E(23,36+b,7,3,'belly',2.1,{g:2}));P.push(E(36,25+b,6.5,5.5,'wolf',3));P.push(Pg([[40,24+b],[47,27+b],[40,30+b]],'wolf',3.1));
  P.push(Pg([[31,21+b],[32,13+b],[36,20+b]],'wolf',2.9));P.push(Pg([[35,20+b],[38,13+b],[40,21+b]],'wolf',2.9));P.push(E(46.5,27+b,1.1,1,null,3.2,{col:PBL}));P.push(E(38.5,23+b,1.2,.9,null,3.2,{col:hex('#5ac8ff')}));return P},
 owl(t){const fy=Math.round(Math.sin(t)*2),fl=Math.sin(t*3)*3,P=[];P.push(E(24,28+fy,10,11,'belly',2));P.push(E(24,16+fy,9,7.5,'belly',3));
  P.push(Pg([[15,22+fy],[9,30+fy+fl],[16,34+fy]],'belly',2.5));P.push(Pg([[33,22+fy],[39,30+fy+fl],[32,34+fy]],'belly',2.5));
  [[20,26],[27,30],[22,33],[29,24]].forEach(([x,y],i)=>P.push(E(x,y+fy,1,.8,null,2.2+i*.01,{col:hex('#5e6572')})));
  [[20.5,16],[27.5,16]].forEach(([x,y])=>{P.push(E(x,y+fy,3,3,'gold',3.1));P.push(E(x+.3,y+fy,1.4,1.6,null,3.2,{col:PBL}))});P.push(Pg([[23,19+fy],[25,19+fy],[24,22+fy]],'tan',3.3));return P},
 aurora(t){const fy=Math.sin(t)*2.5,P=[];const w=k=>Math.sin(t*2+k)*3;P.push(Pg([[15,28+fy],[33,28+fy],[30+w(1),38+fy],[25+w(2),44+fy],[19+w(3),40+fy]],'aur',1));
  P.push(E(24,24+fy,10,10,'aur',2));P.push(E(24,27+fy,6,4,'belly',2.1,{g:2}));eye(P,21,22+fy,1.5,2.3);eye(P,28,22+fy,1.5,2.3);
  [[16,10],[24,6],[32,10]].forEach(([x,y],i)=>P.push(Pg([[x-1.5,y+5+fy],[x,y+fy-Math.abs(w(i))*.5],[x+1.5,y+5+fy]],'aur',2.5)));return P},
 mammoth(t){const P=[],b=Math.round(Math.sin(t*2)*.6);[[12,34],[17,34],[28,34],[33,34]].forEach(([x,y],i)=>P.push(Cp({x,y:y+b},{x:x+(i%2?1:-1)*Math.sin(t*2)*.8,y:46},3,3,'wool',1)));
  P.push(E(22,28+b,15,11,'wool',2));P.push(E(36,24+b,8,8,'wool',3));P.push(E(32,25+b,4,5,'brn',3.05));P.push(Cp({x:42,y:26+b},{x:44,y:38+b},2.6,1.6,'wool',3.1));P.push(Cp({x:44,y:38+b},{x:47,y:40+b},1.6,1.2,'wool',3.2));
  P.push(Cp({x:39,y:31+b},{x:46,y:33+b},1.5,1.1,'tusk',3.3));P.push(Cp({x:46,y:33+b},{x:47,y:27+b},1.1,.6,'tusk',3.3));eye(P,39,21+b,1.2,3.4);
  [[16,20],[24,19],[30,22]].forEach(([x,y],i)=>P.push(E(x,y+b,2.5,1.2,null,2.2+i*.01,{col:hex('#e6f2ff'),noline:1})));return P}
};
const PET_FLY={gull:1,horse:1,puffer:1,narw:1,orca:1,owl:1,aurora:1};
// id: [name, grade, animal, sprite, attack text, bonus key, bonus value, atk kind, color]
const PETS={
 mongsil:{n:'몽실',g:0,an:'아기 물범',sp:'seal',at:'몸통 박치기',bk:'hp',bv:3,kind:'dash',col:'#e2e9f1'},
 kkiruk:{n:'끼룩',g:0,an:'갈매기',sp:'gull',at:'부리로 쪼기',bk:'gold',bv:3,kind:'proj',col:'#f6f9fb'},
 dwittung:{n:'뒤뚱',g:1,an:'아기 펭귄',sp:'peng',at:'배 미끄럼 돌진 (관통)',bk:'atk',bv:5,kind:'pierce',col:'#bfe4ff'},
 somsom:{n:'솜솜',g:1,an:'아기 북극여우',sp:'fox',at:'할퀴기 연타',bk:'crit',bv:2,kind:'multi',col:'#fff4d8'},
 ttoreu:{n:'또르',g:1,an:'해마',sp:'horse',at:'물방울 힘링',bk:'regen',bv:10,kind:'proj',col:'#8fd0ff'},
 turtank:{n:'거북탱',g:2,an:'바다거북',sp:'turtle',at:'물방울 대포',bk:'def',bv:8,kind:'proj',col:'#5ac8ff',big:1},
 jogae:{n:'조개',g:2,an:'해달',sp:'otter',at:'조개로 내리치기',bk:'gold',bv:10,kind:'proj',col:'#ffc4cc'},
 ppojjak:{n:'뽀짝',g:2,an:'복어',sp:'puffer',at:'가시 발사',bk:'thorn',bv:5,kind:'multi',col:'#ffd23a'},
 uni:{n:'유니',g:3,an:'일각고래',sp:'narw',at:'뿔 관통 찌르기',bk:'atk',bv:15,kind:'pierce',col:'#a4c4e6'},
 beoreok:{n:'버럭',g:3,an:'바다사자',sp:'sealion',at:'짖어서 모두 기절',bk:'def',bv:10,kind:'stun',col:'#ffe066'},
 rudol:{n:'루돌',g:3,an:'순록',sp:'deer',at:'돌진해서 밀어내기',bk:'hp',bv:15,kind:'dash',col:'#c69a66'},
 orca:{n:'오르카',g:4,an:'범고래',sp:'orca',at:'파도 박치기 (광역)',bk:'critd',bv:40,kind:'aoe',col:'#5ab4f0'},
 howl:{n:'하울',g:4,an:'북극 늑대',sp:'wolf',at:'울부짖고 연속 물기',bk:'aspd',bv:15,kind:'multi',col:'#c8ced8'},
 bueong:{n:'부엉',g:4,an:'흰올빼미',sp:'owl',at:'얼음 깃털 세 개',bk:'crit',bv:5,kind:'multi',col:'#d6f2ff'},
 oro:{n:'오로',g:5,an:'오로라 정령',sp:'aurora',at:'오로라 빔 (광역)',bk:'all',bv:20,kind:'aoe',col:'#52e4c0'},
 manmo:{n:'만모',g:5,an:'빙하 매머드',sp:'mammoth',at:'발구르기 지진 (광역·기절)',bk:'boss',bv:50,kind:'quake',col:'#cc9256'}
};
const BKTXT={hp:'체력',gold:'골드 획득',atk:'공격력',crit:'치명타 확률',regen:'체력 회복',def:'받는 피해 감소',thorn:'반사 피해(적 최대체력)',critd:'치명타 피해',aspd:'공격 속도',all:'모든 능력치',boss:'보스 피해'};
const PMUL=[.25,.4,.65,1,1.6,2.6],PCD=[2.6,2.4,2.2,2,1.8,1.6];
const PSPR={};function petFrames(id){if(PSPR[id])return PSPR[id];const p=PETS[id],s=p.sp==='mammoth'?.62:.5;const w=Math.ceil(52*s),h=Math.ceil(50*s);
  const fr=[0,1,2,3].map(i=>raster(xf(PETDRAW[p.sp](i/4*Math.PI*2),s,1,1),w,h));return PSPR[id]={fr,w,h}}
function petIcon(cv,id){cv.width=cv.height=96;cv.classList.remove('pix');const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,96,96);
  const big=raster(PETDRAW[PETS[id].sp](0),48,48);x.drawImage(big,0,0,96,96)}
const isPet=id=>!!PETS[id];
function GI(id){return PETS[id]?{...PETS[id],n:PETS[id].n}:ITEMS[id]}
function anyIcon(cv,id){if(PETS[id])petIcon(cv,id);else itemIcon(cv,id)}
if(!S.pets)S.pets={};if(!S.peq)S.peq=[null,null];for(const k in S.pets)if(!PETS[k])delete S.pets[k];S.peq=S.peq.map(k=>k&&PETS[k]&&S.pets[k]?k:null);
const PENH=id=>(S.penh&&S.penh[id])||0,PEM=id=>1+.1*PENH(id);
function PB(k){let v=0;for(const id of S.peq){if(!id)continue;const p=PETS[id];if(p.bk===k)v+=p.bv*PEM(id)}return v}
const PETW=[55,30,10.5,3.6,.8,.1];
function rollPet(){let r=Math.random()*100,g=0;for(;g<5;g++){if(r<PETW[g])break;r-=PETW[g]}const pool=Object.keys(PETS).filter(k=>PETS[k].g===g);return pick(pool)}
function rollPull(type,n){const ids=[],dups=[];for(let i=0;i<n;i++){if(type==='pet'){const id=rollPet();S.pets[id]=(S.pets[id]||0)+1;ids.push(id);dups.push(0)}
  else{const id=rollItem(0,true);S.inv[id]=(S.inv[id]||0)+1;ids.push(id);dups.push(0)}}return{ids,dups}}

/* short names + fit text for slots */
const SHORTN={holy:'백곰왕 판자',spine1:'척수 변형',sande:'산데비스탄',spine2:'강화 척수',swim:'오리 튜브',os:'전투 OS',explorer:'탐험대 파카',king:'백곰왕 왕관'};
const SN=id=>SHORTN[id]||(GI(id)||{}).n||'';
function fitNames(root){requestAnimationFrame(()=>root.querySelectorAll('.snm').forEach(el=>{let f=13;el.style.fontSize=f+'px';while(el.scrollWidth>el.clientWidth+1&&f>8){f-=.5;el.style.fontSize=f+'px'}}))}

Object.assign(MOBCOL,{urchin:['#ee7a90','#5ac8ff','#ffd23a'],jellyking:['#dde8f5','#b4c6df','#ff4d5e'],cactus:['#48a03c','#8ad870','#ee7a90'],tumble:['#80532a','#d8b070','#a8743e'],skink:['#d8a040','#f6d070','#9a6a20'],
 vulture:['#6e5a48','#f2ece0','#ee7a90'],dust:['#e2b060','#fbe2a8','#b8803a'],pumpbot:['#9aa2b2','#3a9ae8','#f0b020'],sandworm:['#d8a040','#ee7a90','#fbe2a8'],scorpking:['#c04a1a','#f08a40','#f0b020'],
 barrel:['#2a86c0','#ffd23a','#9aa2b2'],eel:['#44445e','#c88aff','#70709a'],drone:['#2a86c0','#9aa2b2','#f0b020'],tarcrab:['#262034','#8a6ac8','#40385a'],drillbot:['#2a86c0','#ffd23a','#f0b020'],
 oilshark:['#44445e','#ffffff','#c88aff'],octoking:['#33264a','#6c5590','#ffe066'],smog:['#868690','#b6b6c0','#5c5c66'],rat:['#746c74','#9fe0ff','#ee7a90'],cone:['#ff8a1a','#ffffff','#d0500a'],
 vending:['#e03a4a','#5ac8ff','#ffd23a'],cctv:['#8c8c92','#ff3040','#262034'],excav:['#f0cc20','#1a1a1a','#9aa2b2'],boiler:['#c05a38','#ffb03a','#9aa2b2'],chimney:['#c05a38','#868690','#ff8a1a']});
Object.assign(MOBCOL,{coal:['#2e2e3a','#ff8a1a','#1a1a22'],cart:['#965024','#2e2e3a','#9aa2b2'],cbat:['#462466','#746c74','#ff3040'],helmgob:['#5a9634','#f0cc20','#de782a'],canary:['#f0cc20','#78a826','#ffffff'],coalgolem:['#2e2e3a','#ff8a1a','#ffd060'],bucket:['#f0cc20','#965024','#9aa2b2'],kolo:['#2e2e3a','#f0b020','#ff8a1a'],
 flame:['#ff8a1a','#ffe066','#d0400a'],cable:['#262034','#d8782a','#fff05a'],insul:['#e6dccc','#9aa2b2','#d8782a'],charstump:['#2e2e3a','#ff8a1a','#1a1a22'],zapbird:['#2a86c0','#fff05a','#f0cc20'],transformer:['#8c8c92','#fff05a','#e6dccc'],pylon:['#9aa2b2','#fff05a','#5f6676'],volta:['#2a86c0','#fff05a','#5ff4ff'],
 acidcloud:['#78a826','#bce858','#9aff3a'],wither:['#e2b060','#80532a','#78a826'],slug:['#78a826','#bce858','#ffffff'],acidfrog:['#7a3aa0','#9aff3a','#b06ad8'],moth:['#e2b060','#7a3aa0','#6e5a48'],toxictree:['#80532a','#7a3aa0','#9aff3a'],puddle:['#78a826','#bce858','#d8ff8a'],sandra:['#7a3aa0','#78a826','#9aff3a'],
 sludge:['#525628','#828642','#a4aa58'],mutfish:['#5ea878','#9adcac','#ffe066'],pipesnake:['#965024','#9aa2b2','#525628'],gator:['#64a066','#a0d49a','#965024'],mosquito:['#262034','#d8f0ff','#ff5a7a'],drainbot:['#965024','#9aa2b2','#9aff3a'],leech:['#ee7a90','#c04a62','#ffc0cc'],ord:['#9aa2b2','#965024','#9aff3a'],
 bulb:['#fff6b0','#462466','#ffe066'],battery:['#262034','#d8782a','#fff05a'],turbine:['#462466','#9aa2b2','#c88aff'],plug:['#462466','#8c8c92','#f0b020'],fuse:['#a8dcf8','#f0b020','#fff05a'],generator:['#462466','#9aa2b2','#c88aff'],royalguard:['#462466','#f0b020','#c88aff'],
 mega1:['#462466','#c88aff','#ff3040'],mega2:['#9aa2b2','#c88aff','#462466'],mega3:['#c08aff','#f4e8ff','#7a2ac8']});
for(const k in MOBS)if(!MOBCOL[k])MOBCOL[k]=['#9aa2b2','#ffffff','#ffd23a'];
/* pets in battle */
let petSt=[{},{}],pShots=[];
function petsChanged(){petSt=[{},{}];save()}
const _sim=sim;sim=function(dt){_sim(dt);petSim(dt);auraSim(dt);megaSim()};
function megaSim(){const m=mobs.find(q=>!q.dead&&(q.type==='mega1'||q.type==='mega2'));if(!m)return;const r=m.hp/m.max;const nt=m.type==='mega1'&&r<=.66?'mega2':m.type==='mega2'&&r<=.33?'mega3':null;if(!nt)return;
  m.type=nt;m.fr=mobFrames(nt,m.s);m.fl=.3;flash=.7;flashC='#c88aff';shake=14;stop=Math.max(stop,.25);banner(nt==='mega2'?'2형태 · 마왕 각성!':'최종 형태 · 진 마왕 강림!','#c88aff');sfx('boss');bossT+=15;m.atk*=1.25;
  for(let k=0;k<30;k++)px.push({x:m.x+rnd(-20,20),y:GY-rnd(10,60),vx:rnd(-120,120),vy:rnd(-160,40),g:120,life:.8,t:0,c:k%2?'#c88aff':'#fff',s:2})}
let auraT=0,auraAcc=0;const AURC=['#5ae8c8','#9cffe0','#7ab8ff','#c89cff','#ffffff'];
function auraSim(dt){if(S.eq.c!=='aurora'||bear.dead)return;auraT+=dt;auraAcc+=dt;while(auraAcc>.05){auraAcc-=.05;
  px.push({x:bear.x+rnd(-16,8),y:GY-rnd(6,42),vx:rnd(-6,6),vy:-rnd(6,22),g:-4,life:rnd(.6,1.2),t:0,c:pick(AURC),s:Math.random()<.2?2:1,dust:1})}}
function petPos(i){return{x:bear.x-20-i*11,y:GY-(i?3:0)}}
function petSim(dt){const live=mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x),f=live[0];
  S.peq.forEach((id,i)=>{if(!id)return;const st=petSt[i];if(st.cd==null)st.cd=1+i*.7;st.t=(st.t||0)+dt*(curWS>0?2.2:1);st.lg=Math.max(0,(st.lg||0)-dt);
    if(bear.dead)return;st.cd-=dt;if(st.cd>0||!f||f.x-bear.x>150)return;const p=PETS[id];st.cd=PCD[p.g]*(1-PB('aspd')/200);st.lg=.18;
    const pp=petPos(i),fly=PET_FLY[p.sp],sy=pp.y-(fly?20:8),mult=PMUL[p.g]*PEM(id);
    const cr=()=>Math.random()*100<stat('crit');
    if(p.kind==='aoe'||p.kind==='quake'||p.kind==='stun'){live.filter(m=>m.x-bear.x<170).forEach(m=>{hitTarget(m,mult*(p.kind==='stun'?.5:.7),cr(),'cleave');if(p.kind!=='aoe')m.frz=Math.max(m.frz,p.kind==='quake'?.8:.5)});
      fx.push({k:'ring',x:(p.kind==='aoe'?f.x:bear.x+30)*K,y:(GY-10)*K,t:0,life:.4,r:p.kind==='quake'?220:150,col:p.col});shake=Math.max(shake,p.kind==='quake'?7:3);sfx(p.kind==='stun'?'boom':'whoosh');
      if(p.kind==='quake')for(let k=0;k<10;k++)px.push({x:f.x+rnd(-40,40),y:GY,vx:rnd(-30,30),vy:rnd(-120,-50),g:300,life:.6,t:0,c:'#cc9256',s:2});
      if(p.sp==='aurora')pShots.push({beam:1,x:f.x,t:0,col:p.col});return}
    const n=p.kind==='multi'?3:1;for(let k=0;k<n;k++)pShots.push({x:pp.x+6,y:sy-(k-1)*2,tg:f,v:p.kind==='dash'||p.kind==='pierce'?260:200,mult:mult*(p.kind==='multi'?.45:1),col:p.col,pierce:p.kind==='pierce',delay:k*.09,big:p.big||p.kind==='dash'});
    sfx('throw')});
  pShots=pShots.filter(s=>{if(s.beam){s.t+=dt;return s.t<.35}if(s.delay>0){s.delay-=dt;return true}if(!s.tg||s.tg.dead){const n2=mobs.filter(m=>!m.dead).sort((a,b)=>a.x-b.x)[0];if(!n2)return false;s.tg=n2}
    const tx=s.tg.x-2,ty=hitY(s.tg),dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);
    if(d<5){const cr=Math.random()*100<stat('crit');if(s.pierce)mobs.filter(m=>!m.dead&&m.x-s.tg.x<60&&m.x>=s.tg.x-4).forEach(m=>hitTarget(m,s.mult,cr,'cleave'));else hitTarget(s.tg,s.mult,cr,'cleave');
      for(let k=0;k<5;k++)px.push({x:s.x,y:s.y,vx:rnd(-60,60),vy:rnd(-80,20),g:200,life:.3,t:0,c:s.col,s:1});return false}
    const sp=s.v*dt;s.x+=dx/d*sp-curWS*dt;s.y+=dy/d*sp;if(Math.random()<.5)px.push({x:s.x,y:s.y,vx:-10,vy:rnd(-5,5),g:0,life:.2,t:0,c:s.col,s:1});return true})}
function bearHpBar(L2){if(bear.dead)return;const r=clamp(bear.hp/MAXHP(),0,1),x=Math.round(bear.x-6),y=GY-46,w=12;
  L2.fillStyle='#140c0a';L2.fillRect(x-1,y-1,w+2,3);L2.fillStyle='#3a2030';L2.fillRect(x,y,w,1);
  const c=r>.5?'#5ee05a':r>.25?'#ffc43d':'#ff4d5e';L2.fillStyle=c;L2.fillRect(x,y,Math.round(w*r),1);
  if(r<.25&&Math.sin(T*12)>0){L2.fillStyle='rgba(255,77,94,.35)';L2.fillRect(x-1,y-1,w+2,3)}}
function drawFront(L2){bearHpBar(L2);if(S.eq.c==='aurora'&&!bear.dead){const t=auraT;for(let r=0;r<3;r++){L2.fillStyle=['rgba(90,232,200,.32)','rgba(122,184,255,.26)','rgba(200,156,255,.22)'][r];
    for(let x=0;x<26;x++){const xx=bear.x-34+x,y=GY-30-r*5+Math.sin(x*.35+t*4+r*1.7)*3,h=6+Math.sin(x*.5-t*3+r)*2.5;L2.fillRect(Math.round(xx),Math.round(y),1,Math.round(h))}}
    if(Math.sin(t*2.3)>.92){L2.fillStyle='#fff';const sx=bear.x+Math.round(Math.sin(t*7)*10),sy=GY-46;L2.fillRect(sx,sy-2,1,5);L2.fillRect(sx-2,sy,5,1)}}S.peq.forEach((id,i)=>{if(!id)return;const st=petSt[i]||{},F=petFrames(id),pp=petPos(i),fly=PET_FLY[PETS[id].sp];
    const f=Math.floor((st.t||0)*6)%4,hop=!fly&&curWS>0?Math.round(Math.abs(Math.sin((st.t||0)*6))*-3):0,lg=st.lg>0?3:0;
    L2.globalAlpha=bear.dead?.5:1;L2.drawImage(F.fr[f],Math.round(pp.x-F.w/2+lg),Math.round(pp.y-F.h+1-(fly?14:0)+hop));L2.globalAlpha=1;
    if(!fly){L2.fillStyle='rgba(0,0,0,.18)';L2.fillRect(Math.round(pp.x-F.w*.3),GY,Math.round(F.w*.6),1)}});
  eShots.forEach(e=>{const x=Math.round(e.x),y=Math.round(e.y);L2.globalAlpha=.45;L2.fillStyle=e.col;L2.fillRect(x+2,y,4,1);L2.globalAlpha=1;L2.fillStyle='#140c0a';L2.fillRect(x-2,y-2,5,5);L2.fillStyle=e.col;L2.fillRect(x-1,y-1,3,3);L2.fillStyle='#fff';L2.fillRect(x-1,y-1,1,1)});
  pShots.forEach(s=>{if(s.delay>0)return;if(s.beam){const a=1-s.t/.35;L2.globalAlpha=a;L2.fillStyle=s.col;L2.fillRect(Math.round(s.x)-5,0,10,GY);L2.fillStyle='#fff';L2.fillRect(Math.round(s.x)-2,0,4,GY);L2.globalAlpha=1;return}
    const r=s.big?2:1;L2.fillStyle='#140c0a';L2.fillRect(Math.round(s.x)-r-1,Math.round(s.y)-r-1,r*2+2,r*2+2);L2.fillStyle=s.col;L2.fillRect(Math.round(s.x)-r,Math.round(s.y)-r,r*2,r*2)})}

/* pet tab */
function petEff(id){const p=PETS[id],m=PEM(id);return`${p.at} · 장착: ${BKTXT[p.bk]} +${+(p.bv*m).toFixed(1)}${p.bk==='crit'?'%p':'%'}`}
function renderPetTab(Lst,H){H.insertAdjacentHTML('beforeend',`<span class="lbl">장착 펫 ${S.peq.filter(Boolean).length}/2 · 보유 ${Object.keys(S.pets).length}/${Object.keys(PETS).length}</span>`);
  const eq=document.createElement('div');eq.className='eqline pets';
  [0,1].forEach(i=>{const id=S.peq[i],d=document.createElement('button');d.className='slot'+(id?'':' empty');const ic=document.createElement('div');ic.className='sic';const c=document.createElement('canvas');c.width=c.height=96;ic.append(c);
    if(id){petIcon(c,id);ic.insertAdjacentHTML('beforeend',badge(PETS[id].g)+(PENH(id)?`<u>+${PENH(id)}</u>`:''))}d.append(ic);d.insertAdjacentHTML('beforeend',`<b class="snm">${id?PETS[id].n:'펫 '+(i+1)}</b>`);
    if(id)d.addEventListener('click',()=>{S.peq[i]=null;sfx('ui');petsChanged();renderPanel()});eq.append(d)});
  Lst.append(eq);fitNames(eq);
  const ids=Object.keys(S.pets).filter(k=>S.pets[k]>0).sort((a,b)=>PETS[b].g-PETS[a].g);
  if(!ids.length)Lst.insertAdjacentHTML('beforeend','<p class="note empty">아직 펫이 없어요. 상점에서 펫을 소환해 보세요!</p>');
  ids.forEach(id=>{const p=PETS[id],on=S.peq.includes(id);const row=rowBase(c=>petIcon(c,id),`${badge(p.g)}${p.n}<small>${p.an}</small>${PENH(id)?`<em class="enh">+${PENH(id)}</em>`:''}`,petEff(id));
    const b=document.createElement('button');b.className='buy';b.dataset.keep=1;b.textContent=on?'해제':'장착';if(on)b.classList.add('on');
    b.addEventListener('click',()=>{if(on)S.peq[S.peq.indexOf(id)]=null;else{const e=S.peq.indexOf(null);if(e>=0)S.peq[e]=id;else{S.peq[1]=id;toast('펫 칸이 가득 차서 두 번째 펫을 바꿨어요')}}sfx('buy');petsChanged();renderPanel()});row.append(b);Lst.append(row)});
  Lst.insertAdjacentHTML('beforeend','<p class="note">펫은 두 마리까지 데려갈 수 있어요. 따라다니며 알아서 싸우고, 장착 효과도 줘요. 같은 등급 펫 3마리를 합성하면 다음 등급 펫이 나와요.</p>')}
function petShopRows(Lst){[[1,100],[10,900]].forEach(([n,cost])=>{const r=rowBase(c=>petIcon(c,'turtank'),`펫 소환 ${n}회`,`보석 ${cost}개 · C~SSS 펫`);const b=document.createElement('button');b.className='buy gemb';b.innerHTML=`소환<small><b></b>${cost}</small>`;b.dataset.gem=cost;
    b.addEventListener('click',()=>{if(S.gem<cost)return;S.gem-=cost;S.cnt.psummon=(S.cnt.psummon||0)+n;sfx('drop',2);const P=rollPull('pet',n);showGacha(P.ids,n,cost,'pet',P.dups);save();refreshPanel()});
    r.append(b);Lst.append(r)})}
const _rp=renderPanel;renderPanel=function(){_rp();requestAnimationFrame(()=>document.querySelectorAll('#list .row .inf>b').forEach(el=>{let f=16;el.style.fontSize=f+'px';while(el.scrollWidth>el.clientWidth+1&&f>11){f-=.5;el.style.fontSize=f+'px'}}))};
if(!S.petGift){S.petGift=1;S.pets.mongsil=(S.pets.mongsil||0)+1;if(!S.peq[0])S.peq[0]='mongsil';save()}
</script>
<script>
/* ================= premium shop icons ================= */
function shopIcon(cv,kind,n){cv.width=cv.height=96;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,96,96);x.lineJoin='round';x.lineCap='round';const OL='#140c0a';
  const glow=(cx,cy,r,c1)=>{const g=x.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,c1);g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill()};
  const rays=(cx,cy,r,col,k)=>{x.save();x.translate(cx,cy);x.fillStyle=col;for(let i=0;i<k;i++){x.rotate(Math.PI*2/k);x.beginPath();x.moveTo(0,0);x.lineTo(r,-r*.12);x.lineTo(r,r*.12);x.closePath();x.fill()}x.restore()};
  const shape=(path,fill,lw)=>{path();x.lineWidth=lw||5;x.strokeStyle=OL;x.stroke();x.fillStyle=fill;x.fill()};
  const lg=(y0,y1,a,b)=>{const g=x.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g};
  const rr=(X,Y,W,H,R)=>()=>{x.beginPath();x.roundRect(X,Y,W,H,R)};
  const spark=(sx,sy,s)=>{x.fillStyle='#fff';x.beginPath();x.moveTo(sx,sy-s);x.quadraticCurveTo(sx,sy,sx+s,sy);x.quadraticCurveTo(sx,sy,sx,sy+s);x.quadraticCurveTo(sx,sy,sx-s,sy);x.quadraticCurveTo(sx,sy,sx,sy-s);x.fill()};
  const tag=t=>{x.save();x.translate(70,80);x.rotate(-.12);shape(rr(-20,-11,40,22,7),lg(-11,11,'#ff7a6a','#d8303c'),4);x.font='17px "Jal","Fredoka",sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=5;x.strokeStyle=OL;x.strokeText(t,0,1);x.fillStyle='#fff';x.fillText(t,0,1);x.restore()};
  if(kind==='chest'){const open=n>1;glow(48,46,46,open?'rgba(255,214,90,.95)':'rgba(255,214,90,.6)');rays(48,46,48,'rgba(255,236,150,.35)',12);
    shape(rr(16,46,64,34,6),lg(46,80,'#c47b38','#7a4318'));x.strokeStyle='rgba(60,30,10,.45)';x.lineWidth=2;[56,66].forEach(y=>{x.beginPath();x.moveTo(20,y);x.lineTo(76,y);x.stroke()});
    [[22,46],[66,46]].forEach(([bx])=>shape(rr(bx,46,8,34,2),lg(46,80,'#ffe27a','#d08a10'),3));
    if(open){x.save();x.translate(48,44);x.rotate(-.42);shape(rr(-34,-20,64,20,8),lg(-20,0,'#d68a44','#8f5321'));shape(rr(-34,-6,64,6,3),lg(-6,0,'#ffe27a','#d08a10'),3);x.restore();
      const b=x.createLinearGradient(0,10,0,48);b.addColorStop(0,'rgba(255,255,220,0)');b.addColorStop(1,'rgba(255,240,160,.95)');x.fillStyle=b;x.beginPath();x.moveTo(20,46);x.lineTo(76,46);x.lineTo(90,6);x.lineTo(6,6);x.closePath();x.fill();
      [[34,42,'#ffd23a'],[48,40,'#5cc8ff'],[60,43,'#ffd23a'],[42,38,'#ff6a8a']].forEach(([cx,cy,c])=>{x.beginPath();x.arc(cx,cy,5,0,7);x.lineWidth=3;x.strokeStyle=OL;x.stroke();x.fillStyle=c;x.fill()})}
    else{shape(()=>{x.beginPath();x.moveTo(16,48);x.lineTo(16,36);x.quadraticCurveTo(48,16,80,36);x.lineTo(80,48);x.closePath()},lg(22,48,'#d68a44','#8f5321'));
      [[22],[66]].forEach(([bx])=>shape(()=>{x.beginPath();x.moveTo(bx,47);x.lineTo(bx,31);x.lineTo(bx+8,29);x.lineTo(bx+8,47);x.closePath()},lg(28,47,'#ffe27a','#d08a10'),3));
      shape(rr(14,44,68,6,3),lg(44,50,'#ffe27a','#d08a10'),3)}
    shape(rr(40,48,16,16,4),lg(48,64,'#fff0a0','#e0a020'),4);x.fillStyle=OL;x.beginPath();x.arc(48,54,2.4,0,7);x.fill();x.fillRect(47,55,2,5);
    spark(18,20,6);spark(82,26,5);spark(76,10,3.5);if(open)tag('x'+n)}
  if(kind==='egg'){const egg=(cx,cy,s,c1,c2,sp)=>{shape(()=>{x.beginPath();x.moveTo(cx,cy-26*s);x.bezierCurveTo(cx+19*s,cy-26*s,cx+21*s,cy+20*s,cx,cy+20*s);x.bezierCurveTo(cx-21*s,cy+20*s,cx-19*s,cy-26*s,cx,cy-26*s);x.closePath()},lg(cy-26*s,cy+20*s,c1,c2),4.5);
      x.save();x.clip();x.fillStyle=sp;[[-7,-8,5],[8,-2,4],[-3,10,6],[10,12,3.5],[-12,6,3]].forEach(([dx,dy,r])=>{x.beginPath();x.ellipse(cx+dx*s,cy+dy*s,r*s,r*.8*s,0,0,7);x.fill()});x.restore();
      x.fillStyle='rgba(255,255,255,.75)';x.beginPath();x.ellipse(cx-8*s,cy-12*s,4*s,7*s,-.4,0,7);x.fill()};
    glow(48,50,46,n>1?'rgba(150,255,220,.95)':'rgba(150,240,255,.7)');rays(48,50,48,'rgba(200,255,240,.35)',12);
    if(n>1){shape(()=>{x.beginPath();x.ellipse(48,74,38,12,0,0,7)},lg(62,86,'#d6a868','#8a5a2a'),4);x.strokeStyle='rgba(90,50,20,.6)';x.lineWidth=2;for(let i=0;i<7;i++){x.beginPath();x.moveTo(14+i*11,70+(i%2)*4);x.lineTo(22+i*11,78-(i%2)*4);x.stroke()}
      egg(30,58,.62,'#fff6d8','#ffb86a','rgba(255,120,60,.55)');egg(66,58,.62,'#e8f4ff','#7ab8ff','rgba(60,110,220,.5)');egg(48,52,.8,'#eafff4','#5ae8c8','rgba(20,150,130,.5)');tag('x'+n)}
    else egg(48,56,1.25,'#eafff4','#5ae8c8','rgba(20,150,130,.5)');spark(16,22,6);spark(80,18,5);spark(84,44,3.5)}
  if(kind==='coin'){glow(48,48,46,'rgba(255,214,90,.8)');rays(48,48,48,'rgba(255,236,150,.35)',12);
    [[30,68],[48,72],[66,66],[40,54],[58,52],[48,38]].forEach(([cx,cy])=>{shape(()=>{x.beginPath();x.ellipse(cx,cy,14,9,0,0,7)},lg(cy-9,cy+9,'#fff0a0','#d08a10'),4);x.strokeStyle='#b07000';x.lineWidth=2;x.beginPath();x.ellipse(cx,cy,8,5,0,0,7);x.stroke()});
    spark(18,22,6);spark(80,24,5);tag('x2')}}
const _rp2=renderPanel;renderPanel=function(){_rp2();if(tab!=='shop')return;document.querySelectorAll('#list .row').forEach(r=>{const t=r.querySelector('.inf b').textContent,c=r.querySelector('canvas');if(!c)return;
  const bg=k=>{c.classList.add('shopic');c.style.setProperty('--sb',k)};if(t.startsWith('장비 소환')){shopIcon(c,'chest',t.includes('10')?10:1);bg('#5a3aa8')}else if(t.startsWith('펫 소환')){shopIcon(c,'egg',t.includes('10')?10:1);bg('#14707a')}else if(t.startsWith('골드 2배')){shopIcon(c,'coin');bg('#a8501a')}})};
</script>
<script>
/* ================= HQ upgrade icons ================= */
function upIcon(cv,k){cv.width=cv.height=96;cv.classList.remove('pix');const x=cv.getContext('2d');x.clearRect(0,0,96,96);x.lineJoin='round';x.lineCap='round';const OL='#140c0a';
  const lg=(y0,y1,...c)=>{const g=x.createLinearGradient(0,y0,0,y1);c.forEach((cc,i)=>g.addColorStop(i/(c.length-1),cc));return g};
  const sh=(p,f,lw)=>{x.beginPath();p();x.lineWidth=lw||6;x.strokeStyle=OL;x.stroke();x.fillStyle=f;x.fill()};
  const gloss=(cx,cy,rx,ry,a)=>{x.save();x.fillStyle='rgba(255,255,255,'+(a||.55)+')';x.beginPath();x.ellipse(cx,cy,rx,ry,-.5,0,7);x.fill();x.restore()};
  const spark=(sx,sy,s)=>{x.fillStyle='#fff';x.beginPath();x.moveTo(sx,sy-s);x.quadraticCurveTo(sx,sy,sx+s,sy);x.quadraticCurveTo(sx,sy,sx,sy+s);x.quadraticCurveTo(sx,sy,sx-s,sy);x.quadraticCurveTo(sx,sy,sx,sy-s);x.fill()};
  const star=(cx,cy,r,f)=>sh(()=>{for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.47:r;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath()},f);
  const heart=(cx,cy,s,f)=>sh(()=>{x.moveTo(cx,cy+26*s);x.bezierCurveTo(cx-34*s,cy+2*s,cx-26*s,cy-26*s,cx,cy-12*s);x.bezierCurveTo(cx+26*s,cy-26*s,cx+34*s,cy+2*s,cx,cy+26*s);x.closePath()},f);
  if(k==='atk'){x.save();x.translate(48,50);x.rotate(-Math.PI/4);
    sh(()=>{x.moveTo(-4,-40);x.lineTo(4,-40);x.lineTo(7,14);x.lineTo(0,22);x.lineTo(-7,14);x.closePath()},lg(-40,22,'#ffffff','#c8d4e6','#8a9ab8'));
    x.strokeStyle='rgba(120,140,170,.7)';x.lineWidth=2;x.beginPath();x.moveTo(0,-34);x.lineTo(0,12);x.stroke();
    sh(()=>{x.roundRect(-18,14,36,9,4)},lg(14,23,'#ffe27a','#d08a10'));sh(()=>{x.roundRect(-5,22,10,18,3)},lg(22,40,'#a8743c','#6a4420'));sh(()=>{x.arc(0,43,6,0,7)},lg(37,49,'#ffe27a','#d08a10'));x.restore();
    spark(76,20,7);spark(20,72,5)}
  if(k==='hp'){heart(48,50,1.25,lg(18,82,'#ff9aa6','#ff3a4e','#b81c30'));gloss(36,36,9,6);spark(78,22,6)}
  if(k==='regen'){heart(42,46,1.05,lg(18,74,'#ff9aa6','#ff3a4e','#b81c30'));gloss(32,34,7,5);
    sh(()=>{x.roundRect(60,48,14,36,4);x.roundRect(49,59,36,14,4)},lg(48,84,'#b8f58a','#3eb83a'),5);x.fillStyle='rgba(255,255,255,.5)';x.fillRect(63,51,4,10)}
  if(k==='crit'){star(48,52,36,lg(16,88,'#fff6a0','#ffd23a','#f08a10'));gloss(38,38,8,5);spark(80,18,7);spark(14,22,5)}
  if(k==='critd'){star(58,58,28,lg(30,86,'#fff6a0','#ffd23a','#f08a10'));star(32,34,22,lg(12,56,'#ffd0f0','#ff5ad0','#b02a90'));gloss(28,26,5,3.5);gloss(52,48,6,4);spark(80,16,6)}
  if(k==='aspd'){sh(()=>{x.moveTo(58,6);x.lineTo(22,52);x.lineTo(44,52);x.lineTo(34,90);x.lineTo(76,38);x.lineTo(52,38);x.lineTo(66,6);x.closePath()},lg(6,90,'#fff6a0','#ffd23a','#f0a010'));
    x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=4;[[10,30,22],[6,62,18],[14,78,14]].forEach(([x0,y,l])=>{x.beginPath();x.moveTo(x0,y);x.lineTo(x0+l,y);x.stroke()});gloss(52,24,5,3.5)}}
const UPBG={atk:'#7a5ad8',hp:'#d84a6a',regen:'#3aa860',crit:'#e8a020',critd:'#c04aa8',aspd:'#2a86d8'};
const _rp3=renderPanel;renderPanel=function(){_rp3();if(tab!=='grow')return;const rows=document.querySelectorAll('#list .row');rows.forEach((r,i)=>{const u=UPS[i];if(!u)return;const c=r.querySelector('canvas');upIcon(c,u.ic);c.classList.add('upic');c.style.setProperty('--sb',UPBG[u.ic]||'#7a5ad8')})};
</script>
<script>
/* ================= item icon polish: grade-tinted backdrops ================= */
function gradeTint(c,g){c.classList.add('upic','gi');c.style.setProperty('--sb',GCOL[g]);if(g>=3)c.classList.add('gshine')}
const _rp4=renderPanel;renderPanel=function(){_rp4();if(tab!=='gear'&&tab!=='pet')return;
  document.querySelectorAll('#list .row').forEach(r=>{const b=r.querySelector('.gb');const c=r.querySelector('canvas');if(!b||!c)return;const g=GRADES.indexOf(b.textContent.trim());if(g>=0)gradeTint(c,g)});
  document.querySelectorAll('#list .slot .sic').forEach(s=>{const b=s.querySelector('.gb'),c=s.querySelector('canvas');if(b&&c){const g=GRADES.indexOf(b.textContent.trim());if(g>=0)gradeTint(c,g)}})};
</script>
