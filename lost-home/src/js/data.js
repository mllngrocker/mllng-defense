'use strict';
/* ---------- utils ---------- */
const $=s=>document.querySelector(s);
const rnd=(a,b)=>a+Math.random()*(b-a), clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, pick=a=>a[Math.floor(Math.random()*a.length)];
const TAU=Math.PI*2;
const hexRGB=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
function fmt(n){n=Math.floor(n);if(n<1e4)return n.toLocaleString('en-US');
 for(const[v,s]of[[1e20,'해'],[1e16,'경'],[1e12,'조'],[1e8,'억'],[1e4,'만']])if(n>=v){const x=n/v;let t=x>=100?String(Math.floor(x)):x.toFixed(x>=10?1:2);if(t.includes('.'))t=t.replace(/\.?0+$/,'');return t+s;}}

/* ---------- save ---------- */
const KEY='lost-home-v3';
const S0={gold:0,gem:300,lv:1,exp:0,g:0,kills:0,best:0,up:{atk:0,hp:0,regen:0,crit:0,critd:0,aspd:0},farm:false,snd:true,mult:1,started:false,t:0,stats:{kills:0,bosses:0,gold:0,play:0},
 inv:{plank:{n:1,lv:0}},eq:{w:'plank',a1:null,a2:null,c:null},skl:{glacier:1,tornado:1,beam:1},sauto:true,pets:{},pet:null,hero:'bear',dun:{},stone:0};
let S=JSON.parse(JSON.stringify(S0));
try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s)S=Object.assign(S,s,{up:Object.assign(S.up,s.up||{}),stats:Object.assign(S.stats,s.stats||{})});}catch(e){}
function save(){S.t=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function resetSave(){try{localStorage.removeItem(KEY);}catch(e){}location.reload();}

/* ---------- growth (balance kept from the old game) ---------- */
const UPS=[
 {k:'atk',n:'공격력',d:'백곰의 기본 공격력',max:9999,cost:l=>10*Math.pow(1.1,l),val:l=>12*Math.pow(1.085,l)+6*l,show:v=>fmt(v)},
 {k:'hp',n:'체력',d:'최대 체력',max:9999,cost:l=>10*Math.pow(1.1,l),val:l=>160*Math.pow(1.085,l)+30*l,show:v=>fmt(v)},
 {k:'regen',n:'체력 회복',d:'초당 회복량',max:9999,cost:l=>15*Math.pow(1.11,l),val:l=>3+3*l*Math.pow(1.06,l),show:v=>fmt(v)+'/초'},
 {k:'crit',n:'치명타 확률',d:'치명타가 터질 확률',max:184,cost:l=>40*Math.pow(1.13,l),val:l=>8+.5*l,show:v=>v.toFixed(1)+'%'},
 {k:'critd',n:'치명타 피해',d:'치명타 배율',max:9999,cost:l=>40*Math.pow(1.11,l),val:l=>180+10*l,show:v=>fmt(v)+'%'},
 {k:'aspd',n:'공격 속도',d:'초당 공격 배율',max:250,cost:l=>30*Math.pow(1.13,l),val:l=>1+.02*l,show:v=>'x'+v.toFixed(2)},
];
// pet passive bonus (PB) is added here so every caller sees it
const stat=k=>{const v=UPS.find(u=>u.k===k).val(S.up[k]);return k==='crit'||k==='critd'?v+PB(k):k==='aspd'?v*(1+PB('aspd')/100):v;};
const lvMul=()=>1+.03*(S.lv-1);
const ATK=()=>stat('atk')*lvMul()*gearMul('w')*(1+PB('atk')/100), MAXHP=()=>stat('hp')*lvMul()*gearMul('a')*(1+PB('hp')/100), REGEN=()=>stat('regen')*lvMul()*(1+PB('regen')/100);
const KILLS=20;
const mobHp=g=>36*Math.pow(1.36,g), mobAtk=g=>9*Math.pow(1.245,g), mobGold=g=>6*Math.pow(1.145,g), mobExp=g=>3*Math.pow(1.14,g), needExp=l=>12*Math.pow(1.22,l);

/* ---------- monsters: id:[name, archetype, sub, main, accent, flags(f=fly r=ranged)] ---------- */
const MOBS={
 jelly:['비닐 해파리','jelly','','#eaf6ff','#ff9ec4','f'], crab:['캔 게','crab','can','#e04848','#d8dde6',''], oil:['기름 슬라임','slime','','#2a2440','#8a6cff',''],
 bottle:['페트병 병정','walker','bottle','#9fe0ff','#3a7bd5','r'], gull:['비닐 갈매기','bird','gull','#f4f6fb','#ffb02e','fr'],
 octo:['기름 문어','squid','','#3b2f5a','#ff6aa8',''], hermit:['고철 소라게','crab','shell','#8a8f9e','#e0884a',''], golem:['쓰레기산 골렘','golem','trash','#7d8a6a','#ffcf3d',''],
 stump:['성난 그루터기','walker','stump','#9a6a3e','#6fbf4a',''], saw:['톱날 고블린','walker','goblin','#6fae4a','#c8ccd6',''], shroom:['독버섯','walker','shroom','#d84a8a','#fff0f6',''],
 mole:['굴착 두더지','beast','mole','#6a4a3a','#ffd23a',''], ember:['불씨 정령','spirit','flame','#ff8a1a','#ffe26a','fr'],
 boar:['불도저 멧돼지','beast','boar','#8a5a3a','#ffcf3d',''], beaver:['톱니 비버','beast','beaver','#a0683a','#c8ccd6',''], ogre:['전기톱 벌목왕','golem','wood','#6a7a3a','#ff7a2a',''],
 cactus:['성난 선인장','walker','cactus','#5aa84a','#ffd0e0',''], tumble:['회전초','slime','tumble','#c8a060','#8a6a3a',''], skink:['선글라스 도마뱀','beast','lizard','#e0b040','#2a2a3a',''],
 vulture:['대머리 독수리','bird','gull','#6a4a3a','#ffd8b0','fr'], dust:['모래먼지 슬라임','slime','','#e0c080','#a07a40',''],
 pumpbot:['양수 로봇','walker','robot','#d8a040','#4ac0ff',''], sandworm:['모래 벌레','beast','gator','#c89a5a','#ff6a5a',''], scorp:['사막 전갈왕','crab','scorp','#b04a2a','#ffcf3d',''],
 barrel:['드럼통 괴물','walker','box','#3a5aa0','#ffcf3d',''], eel:['전기 장어','beast','lizard','#6a4aa0','#c88aff','r'], drone:['감시 드론','bird','bug','#c8ccd6','#ffd23a','fr'],
 tarcrab:['타르 게','crab','tar','#2a2430','#ff7a3a',''], drillbot:['시추 로봇','walker','robot','#ffa030','#3a3a4a',''], oilshark:['기름 상어','beast','gator','#4a4a60','#ff5a5a',''], octoking:['기름 문어왕','squid','','#2a2040','#ff4a8a',''],
 smog:['스모그 구름','spirit','cloud','#8a8a96','#ffd23a','fr'], rat:['하수구 쥐','beast','rat','#7a6a7a','#ff9aaa',''], cone:['성난 고깔','walker','cone','#ff7a2a','#ffffff',''],
 vending:['자판기 미믹','walker','box','#d84a4a','#9fe0ff',''], cctv:['CCTV 눈알','bird','bug','#3a3a46','#ff3040','fr'],
 excav:['굴착기 멧돼지','beast','boar','#ffc22e','#3a3a46',''], boiler:['보일러 로봇','walker','robot','#a05a3a','#ff8a3a',''], chimney:['굴뚝 거인','golem','brick','#5a4a4a','#ff6a3a',''],
 coal:['석탄 덩어리','slime','','#2a2a30','#ff8a3a',''], cart:['폭주 광차','walker','box','#6a5a4a','#c8a060',''], cbat:['동굴 박쥐','bird','bat','#4a3a5a','#ff5a8a','f'],
 helmgob:['안전모 고블린','walker','goblin','#8ab05a','#ffd23a',''], canary:['독가스 카나리아','bird','gull','#ffe04a','#9aff5a','fr'],
 coalgolem:['석탄 골렘','golem','rock','#3a3a40','#ff8a3a',''], bucket:['버킷휠 로봇','walker','robot','#ffb02e','#3a3a46',''], kolo:['석탄왕 콜로','golem','rock','#2e282c','#ff5a2a',''],
 flame:['불꽃 정령','spirit','flame','#ff5a1a','#ffe06a','fr'], cable:['성난 전선','slime','','#3a3a3a','#ffd23a',''], insul:['애자 병정','walker','bottle','#e8eef6','#7a8aa0',''],
 charstump:['숯 그루터기','walker','stump','#3a2a26','#ff6a2a',''], zapbird:['번개새','bird','gull','#fff05a','#5ac8ff','fr'],
 transformer:['변압기 로봇','walker','robot','#7a8a9a','#ffd23a',''], pylon:['송전탑 거인','golem','metal','#8a9aa8','#5ac8ff',''], volta:['번개 거인 볼타','golem','metal','#34405e','#5af0ff',''],
 acidcloud:['산성 구름','spirit','cloud','#9ad85a','#5a8a2a','fr'], wither:['시든 덩굴','walker','stump','#7a8a4a','#c8d85a',''], slug:['산성 민달팽이','slime','','#b0e04a','#5a7a2a',''],
 acidfrog:['독개구리','beast','lizard','#a05ad8','#c8ff5a','r'], moth:['독나방','bird','bug','#e0d0a0','#a05ad8','fr'],
 toxictree:['독나무 정령','golem','wood','#4a6a3a','#c8ff5a',''], puddle:['산성 웅덩이','slime','','#7ad84a','#3a6a2a',''], sandra:['독안개 마녀 산드라','squid','','#5a3a6a','#c8ff5a',''],
 sludge:['오수 슬라임','slime','','#5a6a3a','#c8b04a',''], mutfish:['돌연변이 물고기','beast','lizard','#6a9aa0','#ff8aa0',''], pipesnake:['파이프 뱀','beast','lizard','#7a8a8a','#c8a04a',''],
 gator:['폐수 악어','beast','gator','#4a6a3a','#e8e0a0',''], mosquito:['거대 모기','bird','bug','#3a3a46','#ff5a7a','fr'],
 drainbot:['배수 로봇','walker','robot','#5a7a8a','#9aff5a',''], leech:['왕거머리','slime','','#3a2a2a','#ff5a5a',''], ord:['늪의 군주 오르드','squid','','#3a4a2a','#c8ff3a',''],
 imp:['임프','walker','goblin','#b03a4a','#ffd23a',''], hound:['지옥견','beast','boar','#3a2a3a','#ff4a2a',''], bonebat:['뼈 박쥐','bird','bat','#e8e0d0','#ff3a5a','f'],
 dsoldier:['마왕군 병사','walker','robot','#3a3a5a','#ff3a5a',''], lslime:['용암 슬라임','slime','','#ff5a2a','#ffd23a',''],
 generator:['발전기 골렘','golem','metal','#4a4a6a','#5af0ff',''], royalguard:['마왕 근위대','walker','robot','#5a3a7a','#ffcf3d',''], megawatt:['발전소의 주인 메가와트','golem','metal','#3a3a52','#ffd23a',''],
 // demon realm (chapters 11-20)
 skel:['해골 병사','walker','skel','#e8e0cc','#ff4a3a',''], larmor:['살아있는 갑옷','walker','robot','#4a4a5a','#a04aff',''], garg:['가고일','bird','bat','#7a7a80','#ff6a3a','f'],
 wraith:['망령','spirit','ghost','#6a5a9a','#c8b0ff','fr'], deye:['악마의 눈','bird','bug','#5a1a2a','#ffd23a','fr'], cgolem:['흑수정 골렘','golem','crystal','#3a2a5a','#c88aff',''],
 vine:['가시 덩굴','walker','stump','#5a2a3a','#ff4a6a',''], demongolem:['강철 마신','golem','demon','#2a1a3a','#ff3a5a',''],
 cerb:['지옥견 우두머리 케르베','beast','boar','#2a1418','#ff3a1a',''], skelk:['해골 장군','golem','bone','#d8d0bc','#ff4a3a',''], lavak:['용암 군주','golem','rock','#3a1a14','#ffb03a',''],
 wraithk:['망령 군주','spirit','ghost','#3a2a6a','#9affea','f'], crystk:['흑수정 거인','golem','crystal','#2a1a4a','#d0a0ff',''], knightk:['저주받은 근위대장','walker','robot','#2a2a3a','#ff3a5a',''],
 barkas:['마왕군 간부 · 강철의 바르카스','human','barkas','#5a6070','#ff8a3a',''], lilith:['마왕군 간부 · 혈장미의 릴리스','human','lilith','#3a0e22','#ff4a7a',''],
 xenos:['마왕의 오른팔 · 흑염의 제노스','human','xenos','#1a1420','#b05aff',''], king:['마왕 녹스','human','king','#120a14','#ff2a3a',''],
};

/* ---------- chapters: background params + monsters ----------
 sky:[top,mid,horizon], sun:[color,x,y,size], far/near: silhouette colors, gnd:[top,bottom], sea:color|null,
 sil: 0 beach 1 stumps 2 dunes 3 rigs 4 city 5 cave 6 burnt 7 mesa 8 swamp 9 factory 10 ice 11 demon castle 12 bones
 wx: 0 none 1 leaves 2 sand 3 oil drip 4 smog 5 coal dust 6 embers 7 acid rain 8 bubbles 9 sparks 10 snow 11 rose petals */
const THEMES=[
 {name:'쓰레기 해변',sky:['#2f86e0','#6cc0f4','#d4f1ff'],sun:['#fff6c8',.78,.2,.07],far:'#7fb0d8',near:'#c6a77a',gnd:['#f1d9a6','#d2b07a'],sea:'#2a9ad8',sil:0,wx:0,fog:'#d8f0ff',rays:.6,
  mobs:['jelly','crab','oil','bottle','gull'],mids:['octo','hermit'],boss:'golem'},
 {name:'베어진 숲',sky:['#3c7fa0','#86c2b4','#e2f0c8'],sun:['#fff2b0',.25,.18,.06],far:'#5f8f78',near:'#3d6248',gnd:['#7a9a4a','#55703a'],sea:null,sil:1,wx:1,fog:'#cfe8c0',rays:.8,
  mobs:['stump','saw','shroom','mole','ember'],mids:['boar','beaver'],boss:'ogre'},
 {name:'메마른 사막',sky:['#e07a3a','#f6b56a','#ffe2a8'],sun:['#fff0c0',.7,.26,.09],far:'#d9925a',near:'#c97a44',gnd:['#f0c27a','#d39a52'],sea:null,sil:2,wx:2,fog:'#ffdca8',rays:.4,
  mobs:['cactus','tumble','skink','vulture','dust'],mids:['pumpbot','sandworm'],boss:'scorp'},
 {name:'기름 바다',sky:['#2a2050','#7a4a8a','#f08a6a'],sun:['#ffb08a',.3,.36,.08],far:'#4a3a6a',near:'#2a2438',gnd:['#3a3440','#24202a'],sea:'#1a1a2e',sil:3,wx:3,fog:'#c87a8a',rays:.3,
  mobs:['oil','barrel','eel','drone','tarcrab'],mids:['drillbot','oilshark'],boss:'octoking'},
 {name:'스모그 도시',sky:['#6a6a72','#a8a08a','#d8c89a'],sun:['#fff0b0',.62,.3,.06],far:'#8a8a90',near:'#4e4e58',gnd:['#7a7a80','#56565e'],sea:null,sil:4,wx:4,fog:'#c8bf9e',rays:.2,
  mobs:['smog','rat','cone','vending','cctv'],mids:['excav','boiler'],boss:'chimney'},
 {name:'석탄 광산',sky:['#0e0c12','#1c1820','#2e2620'],sun:['#ffb050',.5,.18,.05],far:'#2a2428',near:'#1a1618',gnd:['#3a3236','#221c20'],sea:null,sil:5,wx:5,fog:'#4a3a2a',rays:.7,
  mobs:['coal','cart','cbat','helmgob','canary'],mids:['coalgolem','bucket'],boss:'kolo'},
 {name:'산불 계곡',sky:['#3a0e12','#b0301a','#ff9a3a'],sun:['#ffd080',.55,.42,.11],far:'#6a2018',near:'#2a1210',gnd:['#4a2a22','#2a1814'],sea:null,sil:6,wx:6,fog:'#ff7a3a',rays:.5,
  mobs:['flame','cable','insul','charstump','zapbird'],mids:['transformer','pylon'],boss:'volta'},
 {name:'산성비 고원',sky:['#3a4a2a','#7a9a4a','#c8e08a'],sun:['#e8ffb0',.3,.22,.05],far:'#5a6a3a',near:'#3a4628',gnd:['#6a7a3a','#4a5628'],sea:null,sil:7,wx:7,fog:'#b8d080',rays:.3,
  mobs:['acidcloud','wither','slug','acidfrog','moth'],mids:['toxictree','puddle'],boss:'sandra'},
 {name:'폐수 늪',sky:['#1e2a22','#3e5a42','#8a9a6a'],sun:['#d8e8a0',.7,.25,.05],far:'#3a4a36',near:'#1e2a1e',gnd:['#3e4a2e','#28321e'],sea:'#2a3a26',sil:8,wx:8,fog:'#7a8a5a',rays:.4,
  mobs:['sludge','mutfish','pipesnake','gator','mosquito'],mids:['drainbot','leech'],boss:'ord'},
 {name:'마왕의 대발전소',sky:['#0e0820','#3a1650','#a02a5a'],sun:['#ff5a8a',.5,.3,.1],far:'#2a1440',near:'#140a20',gnd:['#2a2032','#16101e'],sea:null,sil:9,wx:9,fog:'#7a2a6a',rays:.6,
  mobs:['imp','hound','bonebat','dsoldier','lslime'],mids:['generator','royalguard'],boss:'megawatt'},
 // ---- 마계 원정 (11~20). 12·15·18 = 마왕군 간부, 20 = 마왕 ----
 {name:'마계의 문',sky:['#120818','#4a1030','#ff4a3a'],sun:['#ff6a4a',.5,.35,.12],far:'#2a0e1e',near:'#14060e',gnd:['#3a1e22','#1e0c10'],sea:null,sil:11,wx:6,fog:'#a03040',rays:.5,
  mobs:['imp','hound','bonebat','dsoldier','lslime'],mids:['generator','demongolem'],boss:'cerb'},
 {name:'흑철 요새',sky:['#0e0e16','#2a2a3a','#6a5a6a'],sun:['#ffb06a',.7,.3,.05],far:'#24242e',near:'#121218',gnd:['#3a3a40','#202026'],sea:null,sil:11,wx:5,fog:'#5a4a5a',rays:.3,
  mobs:['dsoldier','larmor','garg','hound','imp'],mids:['royalguard','demongolem'],boss:'barkas'},
 {name:'해골 협곡',sky:['#1a1410','#4a3a2a','#c8a06a'],sun:['#ffe0a0',.3,.28,.07],far:'#5a4a3a',near:'#2a2018',gnd:['#8a7a60','#5a4a38'],sea:null,sil:12,wx:2,fog:'#b09070',rays:.5,
  mobs:['skel','bonebat','hound','wraith','imp'],mids:['royalguard','coalgolem'],boss:'skelk'},
 {name:'용암 강',sky:['#1a0606','#5a1408','#ff6a1a'],sun:['#ffd060',.6,.4,.1],far:'#3a1008',near:'#1a0604',gnd:['#2a1410','#140806'],sea:'#ff5a10',sil:6,wx:6,fog:'#ff5a2a',rays:.4,
  mobs:['lslime','imp','hound','garg','dsoldier'],mids:['generator','kolo'],boss:'lavak'},
 {name:'혈장미 정원',sky:['#1a0614','#5a1440','#d84a7a'],sun:['#ffd0e0',.25,.25,.06],far:'#3a0e2a',near:'#1e0616',gnd:['#3a1a2a','#200c18'],sea:null,sil:8,wx:11,fog:'#c04a7a',rays:.5,
  mobs:['vine','imp','bonebat','deye','wraith'],mids:['sandra','volta'],boss:'lilith'},
 {name:'망자의 묘지',sky:['#0a0e18','#1e2a3e','#5a7a8a'],sun:['#e0f0ff',.75,.18,.05],far:'#1a2230',near:'#0e121a',gnd:['#2a3038','#161a20'],sea:null,sil:12,wx:4,fog:'#5a7a8a',rays:.2,
  mobs:['skel','wraith','bonebat','larmor','deye'],mids:['ord','royalguard'],boss:'wraithk'},
 {name:'흑수정 동굴',sky:['#08060e','#160e26','#2a1a40'],sun:['#c08aff',.5,.2,.05],far:'#1a1028',near:'#0e0816',gnd:['#2a2038','#140e1e'],sea:null,sil:5,wx:9,fog:'#6a3aa0',rays:.6,
  mobs:['cgolem','deye','bonebat','garg','lslime'],mids:['generator','demongolem'],boss:'crystk'},
 {name:'피의 성벽',sky:['#140608','#4a0e14','#b02a2a'],sun:['#ff8a6a',.65,.3,.09],far:'#2a0a0e',near:'#140406',gnd:['#3a1e1e','#1e0e0e'],sea:null,sil:11,wx:6,fog:'#a02a2a',rays:.5,
  mobs:['garg','dsoldier','bonebat','larmor','deye'],mids:['royalguard','knightk'],boss:'xenos'},
 {name:'마왕성 회랑',sky:['#0a0614','#1e1030','#4a2a5a'],sun:['#ff4a8a',.5,.25,.06],far:'#1a1028',near:'#0c0816',gnd:['#2a2232','#16101c'],sea:null,sil:11,wx:9,fog:'#5a2a6a',rays:.6,
  mobs:['larmor','dsoldier','wraith','deye','cgolem'],mids:['royalguard','demongolem'],boss:'knightk'},
 {name:'마왕의 왕좌',sky:['#050208','#1a0418','#6a0a2a'],sun:['#ff2a4a',.5,.32,.14],far:'#14040e',near:'#080206',gnd:['#1e1218','#0c060a'],sea:null,sil:11,wx:6,fog:'#6a0a2a',rays:.8,
  mobs:['larmor','dsoldier','wraith','garg','deye'],mids:['demongolem','royalguard'],boss:'king'},
];
const LOBBY_THEME={name:'북극',sky:['#071a3a','#16407a','#4a8ac8'],sun:['#eaf6ff',.72,.16,.035],far:'#2a5a8a',near:'#9fd0f0',gnd:['#e8f4ff','#b8d8f0'],sea:'#0e3a6a',sil:10,wx:10,fog:'#5a9ad8',rays:0,aurora:1};
const theme=()=>THEMES[Math.floor(S.g/10)%THEMES.length];
const loopMul=()=>Math.floor(S.g/100); // after chapter 10 the world loops, harder
const stageName=g=>`${Math.floor(g/10)+1}-${g%10+1}`;
