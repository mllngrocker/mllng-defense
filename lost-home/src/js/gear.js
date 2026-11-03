/* ---------- equipment, gacha, pets (data + rules) ----------
 Owned gear is stored per item AND grade: S.inv['bat#2'] = {n, lv}. Merging 3 copies of the same item+grade
 gives 1 copy of the same item one grade higher. S.eq.w / S.eq.a hold such keys. */
const GRADES=['C','B','A','S','SS','SSS','H'];
const GCOL=['#b8c2d0','#5ab0ff','#6ae07a','#ffcf3d','#ff7ad8','#ff5a5a','#fff2a0'];
const GMUL=[1,2.5,6,15,40,100,300];
const GACHAW=[60,30,7,2.2,.6,.15,.05];
const MERGE_N=3;
// kinds: damage share per hit, attack interval factor, reach (units)
const KIND={melee:{n:'근접 타격',mul:1,spd:1,range:0},gun:{n:'사격',mul:.55,spd:.55,range:260},throw:{n:'투척',mul:.8,spd:.8,range:230},magic:{n:'마법',mul:1.35,spd:1.3,range:280}};
const W_=(n,g,k,shape,col,ult)=>({n,s:'w',g,k,shape,col,ult});
const ITEMS={
 // 근접 타격 20
 plank:W_('나무판자',0,'melee','plank','#c99060'), umbrella:W_('부러진 우산',0,'melee','umbrella','#3a5ad8'), mop:W_('대걸레',0,'melee','mop','#8ab0d0'), squeak:W_('뿅망치',0,'melee','squeak','#ff5a6a'),
 nailplank:W_('못 박은 판자',1,'melee','nailplank','#b07848'), bat:W_('야구 배트',1,'melee','bat','#d8b080'), pipe:W_('녹슨 쇠파이프',1,'melee','pipe','#8a8f9e'), salmon:W_('냉동 연어',1,'melee','fish','#ff9a7a'), shovel:W_('삽',1,'melee','shovel','#7a8a6a'),
 pan:W_('무쇠 프라이팬',2,'melee','pan','#4a4a52'), surf:W_('서핑보드',2,'melee','surf','#5ad0e8'), crowbar:W_('빠루',2,'melee','crowbar','#d83a3a'), hockey:W_('하키 스틱',2,'melee','hockey','#2a2a3a'),
 axe:W_('소방 도끼',2,'melee','axe','#e04848'), sledge:W_('오함마',2,'melee','sledge','#6a6a72'), icesword:W_('빙하 대검',2,'melee','great','#9fe8ff'),
 rebar:W_('송전탑 철근',3,'melee','rebar','#8a5a3a','bolt'), katana:W_('네온 카타나',4,'melee','katana','#ff3ad8','neon'), rainbow:W_('무지개 판자',5,'melee','plank','#ff7ad8','rainbow'), holy:W_('백곰왕의 성스러운 판자',6,'melee','plank','#fff2a0','holy'),
 // 사격 10
 water:W_('물총',0,'gun','water','#5ab0ff'), sling:W_('고무줄 새총',0,'gun','sling','#8a5a3a'), popgun:W_('콩알탄 총',1,'gun','pistol','#ffcf3d'), nailgun:W_('네일건',1,'gun','nail','#ffb02e'), rusty:W_('녹슨 소총',1,'gun','rifle','#7a5a3a'),
 shotgun:W_('산탄총',2,'gun','shotgun','#5a4a3a'), harpoon:W_('작살총',2,'gun','harpoon','#3a6a8a'), minigun:W_('기관총',2,'gun','mini','#4a4a52'),
 revolver:W_('리볼버',3,'gun','revolver','#c8a04a','deadeye'), railgun:W_('레일건',5,'gun','rail','#5af0ff','rail'),
 // 투척 7
 pebble:W_('조약돌',0,'throw','stone','#9a9690'), balloon:W_('물풍선',0,'throw','balloon','#ff7ab0'), rstar:W_('녹슨 표창',1,'throw','star','#8a6a4a'), icechunk:W_('얼음 덩어리',1,'throw','ice','#bff0ff'),
 shuriken:W_('수리검',2,'throw','star','#c8ccd6'), ninjastar:W_('닌자 표창',3,'throw','star4','#3a3a48','shadow'), kunai:W_('쿠나이 다발',4,'throw','kunai','#5a5a6a','kunai'),
 // 마법 7
 primer:W_('마법 입문서',0,'magic','book','#5a8ad8'), oldbook:W_('낡은 마법서',1,'magic','book','#8a6a4a'), starbook:W_('별자리 책',1,'magic','book','#3a3a8a'),
 firebook:W_('불꽃 마법서',2,'magic','book','#e04a2a'), thunderbook:W_('번개 마법서',2,'magic','book','#e0c02a'), icebook:W_('얼음 마법서',3,'magic','book','#5ac8f0','zero'), tome:W_('고대 마도서',5,'magic','book','#5a1a6a','curse'),
 // 장신구 7
 shell:{n:'조개 목걸이',s:'a',g:0,col:'#ffd8c8'}, tooth:{n:'물범 이빨 부적',s:'a',g:1,col:'#f4eedc'}, kelp:{n:'다시마 팔찌',s:'a',g:2,col:'#5ab04a'},
 aurora:{n:'오로라 구슬',s:'a',g:3,col:'#7affd8'}, heart:{n:'빙하의 심장',s:'a',g:4,col:'#7fc8ff'}, crown:{n:'북극성 왕관',s:'a',g:5,col:'#ffe27a'}, star:{n:'고향의 별',s:'a',g:6,col:'#fffbe0'},
};
const gkey=(id,g)=>id+'#'+g, gsplit=k=>{const i=k.lastIndexOf('#');return[k.slice(0,i),+k.slice(i+1)];};
// older saves stored plain ids
for(const k of Object.keys(S.inv))if(!k.includes('#')){const v=S.inv[k];delete S.inv[k];if(ITEMS[k])S.inv[gkey(k,ITEMS[k].g)]=v;}
for(const s of['w','a'])if(S.eq[s]&&!S.eq[s].includes('#'))S.eq[s]=ITEMS[S.eq[s]]?gkey(S.eq[s],ITEMS[S.eq[s]].g):null;
// accessories moved to two slots a1/a2
if(S.eq.a!==undefined){S.eq.a1=S.eq.a1||S.eq.a;delete S.eq.a;}
const SLOTS={w:['w'],a:['a1','a2'],c:['c']};
if(!S.eq.w||!S.inv[S.eq.w]){S.inv[gkey('plank',0)]=S.inv[gkey('plank',0)]||{n:1,lv:0};S.eq.w=gkey('plank',0);}
const enhMul=lv=>1+.15*lv, enhCost=(g,lv)=>Math.floor(200*Math.pow(2.2,g)*Math.pow(1.35,lv));
const slotMul=k=>{if(!k||!S.inv[k])return 0;const[,g]=gsplit(k);return GMUL[g]*enhMul(S.inv[k].lv||0);};
// w: attack multiplier. a: HP multiplier from both accessories and the costume
function gearMul(slot){if(slot==='w')return S.eq.w?slotMul(S.eq.w):1;return(1+.5*(slotMul(S.eq.a1)+slotMul(S.eq.a2)))*(1+.25*slotMul(S.eq.c));}
function curWeapon(){const[id,g]=gsplit(S.eq.w||'plank#0');return Object.assign({id,kind:KIND[ITEMS[id].k]},ITEMS[id],{g});}
function rollGrade(){let r=Math.random()*GACHAW.reduce((a,b)=>a+b,0);for(let g=0;g<GACHAW.length;g++){r-=GACHAW[g];if(r<=0)return g;}return 0;}
function equipItem(k){const s=ITEMS[gsplit(k)[0]].s,sl=SLOTS[s];if(sl.some(x=>S.eq[x]===k))return;const free=sl.find(x=>!S.eq[x]);S.eq[free||sl.reduce((a,b)=>slotMul(S.eq[a])<=slotMul(S.eq[b])?a:b)]=k;}
function addItem(id,g){const k=gkey(id,g),own=S.inv[k];S.inv[k]={n:(own?.n||0)+1,lv:own?.lv||0};const sl=SLOTS[ITEMS[id].s];if(sl.some(x=>!S.eq[x])||sl.some(x=>gsplit(S.eq[x])[1]<g&&S.eq[x]!==k))equipItem(k);return!own;}
function gacha(n){const cost=n>=10?900:100;if(S.gem<cost)return null;S.gem-=cost;const out=[];
 for(let i=0;i<n;i++){const g=rollGrade();
  if(Math.random()<.12){const pg=Math.min(g,4),pool=Object.keys(PETS).filter(k=>PETS[k].g===pg);const id=pick(pool.length?pool:Object.keys(PETS).filter(k=>PETS[k].g===0));out.push({pet:1,id,g:PETS[id].g,isNew:addPet(id,PETS[id].g)});continue;}
  const id=pick(Object.keys(ITEMS).filter(k=>ITEMS[k].g===g));out.push({id,g,isNew:addItem(id,g)});}
 save();return out;}
// merge: 3 of the same item+grade -> 1 of the same item, next grade
function canMerge(k){const[,g]=gsplit(k),o=S.inv[k];return o&&g<6&&o.n>=MERGE_N;}
function merge(k){if(!canMerge(k))return false;const[id,g]=gsplit(k);S.inv[k].n-=MERGE_N;if(S.inv[k].n<=0){delete S.inv[k];for(const s of['w','a1','a2','c'])if(S.eq[s]===k)S.eq[s]=null;}
 addItem(id,g+1);if(!S.eq.w)S.eq.w=gkey(id,g+1);return gkey(id,g+1);}
function mergeAll(){let n=0;for(let pass=0;pass<7;pass++)for(const k of Object.keys(S.inv))while(canMerge(k)){merge(k);n++;}save();return n;}
