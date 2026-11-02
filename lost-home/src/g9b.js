<script>
/* ================= demon lord & demon army generals ================= */
R('dskin',['#2e1c34','#5a3c5e','#8a6890','#bc9ac0']);R('dskin2',['#3a0e1a','#6a1a2a','#a03040','#d86a70']);R('darm',['#08060c','#16121e','#2a2436','#4a4260']);
R('dhair',['#0a0610','#1a1022','#2e1e3c','#4a3460']);R('dwing',['#06040a','#140e1c','#261c34','#3e2e54']);R('dcape',['#2a0410','#4a0a1c','#7a1428','#a82a3a']);
R('bone',['#6a6250','#a8a088','#d8d2bc','#f6f2e2']);R('steel',['#1e2230','#3c4458','#6a7690','#a8b4cc']);R('ghostf',['#0a5a4a','#1aa080','#5af0c0','#d8fff0']);
R('robeV',['#0e0a24','#1e1648','#34287a','#5a48b0']);R('pskin',['#5a3a6a','#9a74ac','#d0b4dc','#f4e6fa']);R('robeA',['#1a0a1e','#36143e','#5a2266','#8a3a96']);
const D_GLV=hex('#c88aff'),D_GLR=hex('#ff2a3a'),D_GLY=hex('#ffe066'),D_GLC=hex('#5ff4ff'),D_GLG=hex('#9aff3a'),D_GLGh=hex('#7affd8'),D_BLK=hex('#0a0610');
const hornL=(P,bx,by,s,z,dir)=>{const pts=[[0,0],[-2*dir,-4],[-1*dir,-9],[3*dir,-13],[7*dir,-14]];for(let i=0;i<4;i++)P.push(Cp({x:bx+pts[i][0]*s,y:by+pts[i][1]*s},{x:bx+pts[i+1][0]*s,y:by+pts[i+1][1]*s},(2.4-i*.5)*s,(1.9-i*.5)*s,'bone',z))};
const fangs=(P,x,y,z)=>{P.push(Pg([[x,y],[x+.8,y+2.2],[x+1.6,y]],null,z,{col:WHITE}));P.push(Pg([[x+3,y],[x+3.8,y+2.2],[x+4.6,y]],null,z,{col:WHITE}))};
const glowEyes=(P,x,y,z,col,big)=>{const r=big?1.5:1.1;[[x,y],[x+4.2,y]].forEach(([a,b])=>{P.push(Pg([[a-r*1.4,b+.3],[a+r*1.2,b-r*.8],[a+r*1.4,b+.5],[a-r*1.2,b+r*.6]],null,z,{col}));P.push(E(a,b,r*.35,r*.35,null,z+.01,{col:WHITE}))});
  P.push(Pg([[x-2.6,y-2.6],[x+2.4,y-.8],[x+2.4,y-1.8],[x-2.2,y-3.6]],null,z+.02,{col:D_BLK}));P.push(Pg([[x+6.8,y-2.6],[x+1.8,y-.8],[x+1.8,y-1.8],[x+6.4,y-3.6]],null,z+.02,{col:D_BLK}))};
function wingPair(P,cx,cy,t,s,ramp,z){const f=Math.sin(t)*3*s;
  [[-1,0],[1,.6]].forEach(([d,k])=>{const tip={x:cx+d*24*s,y:cy-20*s-f};const pts=[[cx,cy],[cx+d*8*s,cy-14*s-f*.5],[tip.x,tip.y],[cx+d*22*s,cy-10*s-f*.6],[cx+d*26*s,cy-2*s-f*.3],[cx+d*20*s,cy+2*s],[cx+d*24*s,cy+8*s],[cx+d*14*s,cy+6*s],[cx+d*16*s,cy+14*s],[cx+d*6*s,cy+8*s]];
    P.push(Pg(pts,ramp,z-k*.05,{g:70+k}));const j={x:cx+d*8*s,y:cy-14*s-f*.5},bc=hex('#6a5a86');P.push(Cp({x:cx,y:cy},j,1.1*s,.8*s,null,z+.01-k*.05,{col:bc,noline:1}));
    [tip,{x:cx+d*26*s,y:cy-2*s-f*.3},{x:cx+d*24*s,y:cy+8*s},{x:cx+d*16*s,y:cy+14*s}].forEach(q=>P.push(Cp(j,q,.6*s,.3*s,null,z+.01-k*.05,{col:bc,noline:1})))})}
Object.assign(MOBS,{
 /* ===== 마왕 1형태: 마족 군주 ===== */
 mega1(t){const P=[],b=Math.round(Math.sin(t)*1);
   wingPair(P,27,12+b,t,1,'dwing',.5);
   P.push(Pg([[30,8+b],[40,10+b],[44,44],[26,44]],'dcape',.8,{g:60}));
   P.push(Cp({x:21,y:30+b},{x:18,y:44},4.2,3.4,'darm',1.2,{jx:21,jy:30+b,jr:5}));P.push(Cp({x:29,y:30+b},{x:31,y:44},4.2,3.4,'darm',1.1,{jx:29,jy:30+b,jr:5}));
   P.push(Pg([[14,44],[22,44],[22,41],[15,40]],'steel',1.3));P.push(Pg([[28,44],[36,44],[35,40],[28,41]],'steel',1.25));
   P.push(Cp({x:33,y:14+b},{x:37,y:23+b},3.4,3,'dskin',1.6));P.push(Cp({x:37,y:23+b},{x:35,y:31+b},3,2.6,'dskin',1.6));P.push(E(35,32+b,2.6,2.4,'dskin',1.65));
   P.push(Pg([[15,11+b],[35,11+b],[33,30+b],[17,30+b]],'dskin',2,{g:61}));
   [[19,16,24,17],[26,17,31,16],[20,22,30,22],[21,26,29,26]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.4,.4,null,2.05,{col:hex('#2a1a2e'),noline:1})));P.push(Cp({x:25,y:17+b},{x:25,y:29+b},.35,.35,null,2.05,{col:hex('#2a1a2e'),noline:1}));
   [[20,20],[30,21],[23,27]].forEach(([x,y])=>P.push(Cp({x,y:y+b},{x:x+2,y:y+3+b},.35,.35,null,2.06,{col:D_GLV,noline:1})));
   P.push(Pg([[16,29+b],[34,29+b],[33,33+b],[17,33+b]],'darm',2.1));P.push(E(25,31+b,2.2,1.8,'gold',2.15));P.push(E(25,31+b,1,.9,null,2.16,{col:D_GLR}));
   P.push(Pg([[19,33+b],[31,33+b],[29,42],[21,42]],'dcape',2.05));
   [[14,10,1],[36,10,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,5,4,'darm',2.4));for(let i=0;i<3;i++)P.push(Pg([[x-3+i*3,y-2+b],[x-3+i*3+d*-1,y-8+b-i],[x-1+i*3,y-2+b]],'darm',2.41))});
   P.push(Pg([[19,0+b],[31,0+b],[34,22+b],[30,14+b],[20,14+b],[16,22+b]],'dhair',2.3,{g:62}));
   P.push(E(24,5+b,5,5.6,'dskin',3));P.push(Pg([[19,7+b],[23,12+b],[27,12+b],[29,7+b]],'dskin',3.01));
   P.push(Pg([[18,1+b],[31,0+b],[30,5+b],[25,3+b],[19,6+b]],'dhair',3.1));
   hornL(P,20,2+b,1,3.2,-1);hornL(P,28,2+b,1,2.9,1);
   glowEyes(P,20.5,6+b,3.3,D_GLV);P.push(Cp({x:21,y:10+b},{x:26,y:10.3+b},.45,.45,null,3.3,{col:D_BLK}));fangs(P,21.4,10+b,3.31);
   P.push(Cp({x:17,y:14+b},{x:11,y:22+b},3.4,3,'dskin',3.4));P.push(Cp({x:11,y:22+b},{x:8,y:15+b+Math.sin(t*2)},3,2.6,'dskin',3.4));
   for(let i=0;i<4;i++)P.push(Pg([[6+i*1.4,13+b],[5+i*1.6,9+b-i%2],[7.4+i*1.4,12.6+b]],'bone',3.45));
   P.push(E(6,9+b+Math.sin(t*2),3.2,3.2,null,3.5,{col:D_GLV}));P.push(E(6,9+b+Math.sin(t*2),1.6,1.6,null,3.51,{col:WHITE}));
   crown(P,24,-3+b,.55);return P},
 /* ===== 2형태: 각성 (갑옷 파괴, 근육 팽창, 날개 확장) ===== */
 mega2(t){const P=[],b=Math.round(Math.sin(t)*1.5);
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t*.6;P.push(Cp({x:25,y:20+b},{x:25+Math.cos(a)*24,y:20+b+Math.sin(a)*20},.8,.2,null,.3,{col:D_GLV,noline:1}))}
   wingPair(P,26,10+b,t*1.4,1.25,'dwing',.5);
   P.push(Cp({x:20,y:30+b},{x:16,y:45},5.2,4.2,'dskin',1.2,{jx:20,jy:30+b,jr:6}));P.push(Cp({x:30,y:30+b},{x:33,y:45},5.2,4.2,'dskin',1.1,{jx:30,jy:30+b,jr:6}));
   P.push(Pg([[11,45],[21,45],[20,40],[12,40]],'darm',1.3));P.push(Pg([[28,45],[38,45],[37,40],[29,40]],'darm',1.25));
   P.push(Cp({x:35,y:12+b},{x:41,y:22+b},4.4,3.8,'dskin',1.6));P.push(Cp({x:41,y:22+b},{x:39,y:32+b},3.8,3.2,'dskin',1.6));P.push(E(39,34+b,3.4,3,'dskin',1.65));
   P.push(Pg([[12,9+b],[38,9+b],[35,31+b],[15,31+b]],'dskin',2,{g:61}));
   [[17,15,24,17],[26,17,33,15],[18,22,32,22],[19,27,31,27]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.5,.5,null,2.05,{col:hex('#1a0e1e'),noline:1})));P.push(Cp({x:25,y:17+b},{x:25,y:30+b},.45,.45,null,2.05,{col:hex('#1a0e1e'),noline:1}));
   [[16,12,22,20],[34,12,28,22],[20,24,25,30],[30,24,27,29],[24,18,26,24]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.45,.3,null,2.07,{col:D_GLV,noline:1})));
   P.push(Pg([[15,30+b],[35,30+b],[33,35+b],[17,35+b]],'darm',2.1));P.push(E(25,32+b,2.4,2,null,2.15,{col:D_GLR}));
   [[11,8,1],[39,8,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,6,4.6,'darm',2.4));for(let i=0;i<4;i++)P.push(Pg([[x-4+i*3,y-2+b],[x-4+i*3+d*-1.5,y-10+b-i%2*2],[x-2+i*3,y-2+b]],'bone',2.41))});
   P.push(Pg([[18,-2+b],[32,-2+b],[38,24+b],[32,14+b],[18,14+b],[12,24+b]],'dhair',2.3,{g:62}));
   P.push(E(24,4+b,5.4,6,'dskin',3));P.push(Pg([[18,6+b],[22,12+b],[28,12+b],[30,6+b]],'dskin',3.01));P.push(Pg([[17,-1+b],[31,-2+b],[30,3+b],[24,1+b],[18,5+b]],'dhair',3.1));
   hornL(P,19,0+b,1.35,3.2,-1);hornL(P,29,0+b,1.35,2.9,1);
   glowEyes(P,20,5+b,3.3,D_GLR,true);P.push(Pg([[20,9.5+b],[28,9.5+b],[27,11.5+b],[21,11.5+b]],null,3.3,{col:D_BLK}));fangs(P,20.6,9.5+b,3.31);fangs(P,23.4,9.5+b,3.31);
   P.push(Cp({x:15,y:12+b},{x:7,y:20+b},4.4,3.8,'dskin',3.4));P.push(Cp({x:7,y:20+b},{x:4,y:30},3.8,3.2,'dskin',3.4));
   for(let i=0;i<4;i++)P.push(Pg([[1+i*1.6,30],[0+i*1.8,35],[2.6+i*1.6,31]],'bone',3.45));
   P.push(E(3,31,5,5,null,.4,{col:hex('#6a2aa8'),noline:1}));
   crown(P,24,-6+b,.6);return P},
 /* ===== 최종 형태: 진 마왕 (거대 마족) ===== */
 mega3(t){const P=[],b=Math.round(Math.sin(t*1.5)*2),fl=Math.sin(t*3);
   for(let i=0;i<10;i++){const a=i/10*Math.PI*2+t;P.push(Pg([[24+Math.cos(a)*6,26+b+Math.sin(a)*6],[24+Math.cos(a+.12)*27,26+b+Math.sin(a+.12)*25],[24+Math.cos(a+.3)*8,26+b+Math.sin(a+.3)*8]],null,.2,{col:i%2?hex('#5a1a8a'):hex('#a01a3a'),noline:1}))}
   wingPair(P,25,8+b,t*1.8,1.45,'dwing',.5);wingPair(P,25,16+b,t*1.8+1,1.05,'dskin2',.55);
   P.push(Cp({x:30,y:34+b},{x:46,y:30+fl*3},3,1.2,'dskin2',.9));P.push(Pg([[46,30+fl*3],[50,26+fl*3],[49,33+fl*3]],'bone',.95));
   P.push(Cp({x:19,y:30+b},{x:14,y:38},5.6,4.6,'dskin2',1.2));P.push(Cp({x:14,y:38},{x:17,y:46},4.4,3.6,'dskin2',1.21));P.push(Cp({x:31,y:30+b},{x:35,y:38},5.6,4.6,'dskin2',1.1));P.push(Cp({x:35,y:38},{x:33,y:46},4.4,3.6,'dskin2',1.11));
   [[13,46],[31,46]].forEach(([x,y])=>{for(let i=0;i<3;i++)P.push(Pg([[x+i*2.4,y-1],[x+i*2.4-1.6,y+1],[x+i*2.4+1,y]],'bone',1.3))});
   P.push(Cp({x:36,y:10+b},{x:43,y:22+b},5,4.4,'dskin2',1.6));P.push(Cp({x:43,y:22+b},{x:41,y:33+b},4.4,3.6,'dskin2',1.6));
   P.push(Pg([[10,6+b],[40,6+b],[36,32+b],[14,32+b]],'dskin2',2,{g:61}));
   [[16,12,24,15],[26,15,34,12],[17,20,33,20],[18,26,32,26]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.6,.6,null,2.05,{col:hex('#2a0610'),noline:1})));
   P.push(E(25,17+b,4,4,null,2.1,{col:D_GLV}));P.push(E(25,17+b,2.2,2.2,null,2.11,{col:WHITE}));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.push(Cp({x:25+Math.cos(a)*4,y:17+b+Math.sin(a)*4},{x:25+Math.cos(a)*11,y:17+b+Math.sin(a)*9},.5,.2,null,2.08,{col:D_GLV,noline:1}))}
   [[10,5,1],[40,5,-1]].forEach(([x,y,d])=>{for(let i=0;i<4;i++)P.push(Pg([[x-4+i*3,y+b],[x-4+i*3+d*-2,y-11+b-i%2*3],[x-2+i*3,y+b]],'bone',2.4))});
   P.push(E(24,1+b,6.4,6.4,'dskin2',3));P.push(Pg([[17,3+b],[21,11+b],[29,11+b],[31,3+b]],'dskin2',3.01));
   hornL(P,18,-3+b,1.7,3.2,-1);hornL(P,30,-3+b,1.7,2.9,1);hornL(P,20,-5+b,1.05,3.15,-1);hornL(P,28,-5+b,1.05,2.85,1);
   glowEyes(P,19.4,2+b,3.3,D_GLR,true);P.push(E(23.6,-2+b,1.2,1.6,null,3.32,{col:D_GLV}));
   P.push(Pg([[18,7+b],[30,7+b],[28,11+b],[20,11+b]],null,3.3,{col:hex('#1a0208')}));for(let i=0;i<5;i++)P.push(Pg([[18.4+i*2.3,7+b],[19.4+i*2.3,9.6+b],[20.4+i*2.3,7+b]],null,3.31,{col:WHITE}));
   P.push(Cp({x:14,y:10+b},{x:6,y:20+b},5,4.4,'dskin2',3.4));P.push(Cp({x:6,y:20+b},{x:3,y:31},4.4,3.6,'dskin2',3.4));for(let i=0;i<5;i++)P.push(Pg([[0+i*1.6,31],[-1+i*1.8,37],[1.6+i*1.6,32]],'bone',3.45));
   crown(P,24,-10+b,.7);return P},
 /* ===== 6챕터 간부: 흑철의 오우거 장군 콜로 ===== */
 kolo(t){const P=[],b=Math.round(Math.sin(t)*1),sw=Math.sin(t)*.35,gl=Math.sin(t*3)>0;
   P.push(Pg([[30,8+b],[42,12+b],[44,44],[28,44]],'dcape',.8));
   P.push(Cp({x:18,y:32+b},{x:16,y:45},5.4,5,'darm',1.2));P.push(Cp({x:31,y:32+b},{x:33,y:45},5.4,5,'darm',1.1));
   [[16,40],[33,40]].forEach(([x,y])=>P.push(E(x,y,4,2.4,'steel',1.3)));
   P.push(Cp({x:37,y:14+b},{x:42,y:26+b},5,4.6,'coalr',1.6));P.push(E(42,29+b,4.6,4.2,'darm',1.65));
   P.push(E(24,22+b,15,13,'darm',2,{g:61}));P.push(Pg([[14,14+b],[34,14+b],[32,30+b],[16,30+b]],'steel',2.05));
   [[18,18,22,26],[28,17,26,28],[22,20,30,22]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.5,.5,null,2.1,{col:gl?hex('#ffb03a'):hex('#ff6a1a'),noline:1})));
   P.push(E(24,22+b,3.4,3.4,'bone',2.12));P.push(E(22.6,21.4+b,.8,.9,null,2.13,{col:D_BLK}));P.push(E(25.4,21.4+b,.8,.9,null,2.13,{col:D_BLK}));
   [[12,12,1],[36,12,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,6.4,5,'darm',2.4));for(let i=0;i<3;i++)P.push(Pg([[x-4+i*4,y-2+b],[x-4+i*4+d*-1,y-9+b-i],[x-1+i*4,y-2+b]],'bone',2.41))});
   P.push(E(23,8+b,7,6.6,'dskin',3));P.push(Pg([[15,4+b],[31,4+b],[31,10+b],[15,10+b]],'darm',3.1));P.push(Pg([[16,7+b],[30,7+b],[30,8.6+b],[16,8.6+b]],null,3.15,{col:hex('#1a0204')}));
   P.push(E(19,7.8+b,1.6,.8,null,3.16,{col:D_GLR}));P.push(E(25,7.8+b,1.6,.8,null,3.16,{col:D_GLR}));hornL(P,16,4+b,1.1,3.2,-1);hornL(P,30,4+b,1.1,3,1);
   P.push(Pg([[17,11+b],[29,11+b],[27,14+b],[19,14+b]],'dskin',3.05));fangs(P,19.5,12.4+b,3.06);
   P.push(Cp({x:13,y:16+b},{x:6,y:26},4.6,4.2,'coalr',3.4));P.push(E(5,28,4.4,4,'darm',3.45));
   P.push(Cp({x:5,y:42},{x:5+sw*10,y:-2},1.4,1.4,'bark',3.5));P.push(Pg([[-4+sw*10,-6],[14+sw*10,-6],[16+sw*10,4],[-6+sw*10,4]],'darm',3.55));[[0,-4],[8,-4]].forEach(([x,y])=>P.push(Cp({x:x+sw*10,y},{x:x+sw*10+2,y:y+6},.5,.5,null,3.56,{col:hex('#ff8a1a'),noline:1})));
   return P},
 /* ===== 7챕터 간부: 뇌전의 리치 볼타 ===== */
 volta(t){const P=[],b=Math.round(Math.sin(t)*2)-4,z=Math.sin(t*4);
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2+t*2;P.push(E(24+Math.cos(a)*16,22+b+Math.sin(a)*6,1.4,1.4,null,.4,{col:D_GLY,noline:1}))}
   P.push(Pg([[12,14+b],[36,14+b],[42,46],[30,42],[24,46],[18,42],[6,46]],'robeV',1.5,{g:61}));
   for(let i=0;i<4;i++)P.push(Cp({x:14+i*7,y:24+b},{x:12+i*7+z,y:44},.5,.3,null,1.55,{col:D_GLY,noline:1}));
   P.push(Pg([[14,14+b],[34,14+b],[30,24+b],[18,24+b]],'robeV',1.6));P.push(Cp({x:15,y:16+b},{x:24,y:23+b},.8,.8,'gold',1.65));P.push(Cp({x:33,y:16+b},{x:24,y:23+b},.8,.8,'gold',1.65));
   P.push(E(24,24+b,2.4,2.4,null,1.7,{col:D_GLY}));
   [[11,13,1],[37,13,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,5.6,4.2,'steel',2.4));P.push(Pg([[x-3,y-2+b],[x-3+d*-2,y-10+b],[x+1,y-2+b]],'steel',2.41))});
   P.push(Pg([[15,12+b],[24,-6+b],[33,12+b],[29,16+b],[19,16+b]],'robeV',3,{g:63}));P.push(Pg([[18,1+b],[13,-10+b],[20,-2+b]],'steel',2.95));P.push(Pg([[30,1+b],[35,-10+b],[28,-2+b]],'steel',2.95));
   P.push(E(23,8+b,5,5.4,null,3.05,{col:hex('#0a0814')}));P.push(E(22,8+b,4,4.4,'bone',3.06));P.push(Pg([[19,10+b],[25,10+b],[24,13+b],[20,13+b]],'bone',3.07));
   P.push(E(20,7+b,1.5,1.6,null,3.08,{col:D_BLK}));P.push(E(24.4,7+b,1.5,1.6,null,3.08,{col:D_BLK}));P.push(E(20,7+b,.8,.8,null,3.09,{col:D_GLC}));P.push(E(24.4,7+b,.8,.8,null,3.09,{col:D_GLC}));
   for(let i=0;i<3;i++)P.push(Cp({x:20.5+i*1.5,y:11+b},{x:20.5+i*1.5,y:12.6+b},.25,.25,null,3.09,{col:D_BLK,noline:1}));
   P.push(Cp({x:14,y:16+b},{x:6,y:12+b},2.2,1.6,'bone',3.4));for(let i=0;i<3;i++)P.push(Cp({x:6,y:12+b},{x:3+i*1.5,y:8+b-i},.5,.3,'bone',3.41));
   P.push(Cp({x:34,y:16+b},{x:40,y:8+b},2,1.6,'bone',1.4));P.push(Cp({x:40,y:46},{x:42,y:-8+b},1,1,'darm',1.45));P.push(E(42,-10+b,3,3,null,1.5,{col:D_GLY}));P.push(E(42,-10+b,1.4,1.4,null,1.51,{col:WHITE}));
   bolt(P,-2,0+b+z*2,1.4,3.5);bolt(P,44,-18+b-z*2,1,1.6);crown(P,24,-7+b,.55);return P},
 /* ===== 8챕터 간부: 마왕군 여간부 산드라 ===== */
 sandra(t){const P=[],b=Math.round(Math.sin(t)*1),hs=Math.sin(t*1.5)*1.5;
   P.push(Pg([[26,6+b],[44+hs,30],[40,44],[24,40]],'dhair',.6,{g:60}));wingPair(P,27,14+b,t,.7,'robeA',.5);
   P.push(Pg([[14,18+b],[34,18+b],[40,46],[8,46]],'robeA',1.5,{g:61}));P.push(Pg([[20,24+b],[28,24+b],[30,46],[18,46]],'toxp',1.55));
   for(let i=0;i<5;i++)P.push(Pg([[8+i*6.4,46],[11+i*6.4,43],[14.4+i*6.4,46]],'robeA',1.56));
   P.push(Pg([[16,12+b],[32,12+b],[30,22+b],[18,22+b]],'robeA',2));P.push(Pg([[19,13+b],[29,13+b],[27,20+b],[21,20+b]],'darm',2.05));P.push(E(24,16+b,1.8,1.8,null,2.1,{col:D_GLG}));
   P.push(Pg([[12,8+b],[17,12+b],[14,18+b],[9,12+b]],'darm',2.2));P.push(Pg([[36,8+b],[31,12+b],[34,18+b],[39,12+b]],'darm',2.15));
   P.push(Pg([[19,-2+b],[30,-2+b],[34,18+b],[27,10+b],[20,10+b],[16,16+b]],'dhair',2.3,{g:62}));
   P.push(E(23,4+b,4.4,5,'pskin',3));P.push(Pg([[19,6+b],[22,10+b],[26,10+b],[27.5,6+b]],'pskin',3.01));
   P.push(Pg([[18,0+b],[29,-2+b],[29,3+b],[22,1+b],[19,4+b]],'dhair',3.1));
   hornL(P,19,0+b,.8,3.2,-1);hornL(P,27,0+b,.8,2.95,1);
   [[20,4.4],[23.6,4.4]].forEach(([x,y])=>{P.push(Pg([[x-1.4,y+b],[x+1.2,y-.6+b],[x+1.4,y+.6+b],[x-1.2,y+.8+b]],null,3.3,{col:D_GLG}));P.push(Cp({x:x-1.8,y:y-1.2+b},{x:x+1.4,y:y-1.6+b},.3,.3,null,3.31,{col:D_BLK}))});
   P.push(Cp({x:21,y:8+b},{x:24,y:8+b},.4,.4,null,3.3,{col:hex('#7a1a5a')}));
   P.push(Cp({x:16,y:14+b},{x:9,y:22+b},2,1.6,'robeA',3.4));P.push(E(8,23+b,1.6,1.6,'pskin',3.41));
   P.push(Cp({x:6,y:44},{x:8,y:-4+b},.9,.9,'darm',3.5));P.push(Pg([[8,-4+b],[4,-9+b],[8,-14+b],[12,-9+b]],'bone',3.55));P.push(E(8,-9+b,2.4,2.4,null,3.6,{col:D_GLG}));P.push(E(8,-9+b,1.1,1.1,null,3.61,{col:WHITE}));
   for(let i=0;i<3;i++){const u=(t/(Math.PI*2)+i/3)%1;P.push(E(4+i*4,-6+b+u*14,.7,1,null,3.62,{col:D_GLG,noline:1}))}
   crown(P,23,-4+b,.5);return P},
 /* ===== 9챕터 간부: 목 없는 기사 오르드 ===== */
 ord(t){const P=[],b=Math.round(Math.sin(t)*1),fl=Math.sin(t*5);
   P.push(Pg([[28,8+b],[42,12+b],[46,44],[38,40],[34,44],[28,40]],'dcape',.8,{g:60}));
   P.push(Cp({x:19,y:31+b},{x:17,y:45},4.4,4,'steel',1.2));P.push(Cp({x:29,y:31+b},{x:31,y:45},4.4,4,'steel',1.1));[[17,38],[31,38]].forEach(([x,y])=>P.push(E(x,y,3.2,2.4,'darm',1.3)));
   P.push(Cp({x:34,y:14+b},{x:38,y:24+b},3.6,3.2,'steel',1.6));P.push(E(38,26+b,3.2,3,'darm',1.65));
   P.push(Pg([[14,10+b],[34,10+b],[32,32+b],[16,32+b]],'steel',2,{g:61}));P.push(Pg([[16,10+b],[32,10+b],[30,22+b],[18,22+b]],'darm',2.05));P.push(Cp({x:24,y:11+b},{x:24,y:30+b},.6,.6,null,2.08,{col:hex('#6a7690'),noline:1}));
   P.push(Pg([[15,28+b],[33,28+b],[32,32+b],[16,32+b]],'darm',2.1));P.push(E(24,30+b,1.8,1.6,'ghostf',2.15));
   [[12,10,1],[36,10,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,6,4.6,'steel',2.4));P.push(Pg([[x-3,y-2+b],[x-3+d*-2,y-9+b],[x+1,y-2+b]],'darm',2.41));P.push(Pg([[x+1,y-2+b],[x+1+d*-2,y-8+b],[x+4,y-2+b]],'darm',2.41))});
   P.push(E(24,9+b,6,2.6,'darm',2.5));for(let i=0;i<5;i++){const x=19+i*2.5,h=6+((i*7+Math.floor(t*6))%4)+fl*1.2;P.push(Pg([[x-1.6,9+b],[x,9+b-h],[x+1.6,9+b]],'ghostf',2.55-i*.001,{g:65}))}
   P.push(Cp({x:14,y:14+b},{x:10,y:22+b},3.4,3,'steel',3.4));P.push(Cp({x:10,y:22+b},{x:15,y:27+b},3,2.6,'steel',3.41));
   P.push(E(13,24+b,5.6,5.2,'steel',3.5));P.push(Pg([[8,22+b],[18,22+b],[18,24+b],[8,24+b]],null,3.55,{col:hex('#0a0610')}));P.push(E(10.6,23+b,1.2,.7,null,3.56,{col:D_GLGh}));P.push(E(14.4,23+b,1.2,.7,null,3.56,{col:D_GLGh}));
   P.push(Pg([[11,19+b],[13,14+b],[15,19+b]],'dcape',3.52));
   P.push(Cp({x:42,y:46},{x:40,y:-10+b},1.1,1.1,'darm',1.45));P.push(Pg([[40,-10+b],[34,-4+b],[40,4+b],[46,-4+b]],'steel',1.5));P.push(Pg([[40,-10+b],[38,-18+b],[42,-12+b]],'steel',1.5));
   return P},
 /* ===== 10챕터 중간 보스: 마왕 근위대장 / 처형인 ===== */
 royalguard(t){const P=[],b=Math.round(Math.sin(t)*1);
   P.push(Pg([[28,10+b],[42,14+b],[44,44],[28,42]],'dcape',.8));
   P.push(Cp({x:19,y:32+b},{x:17,y:45},4,3.6,'darm',1.2));P.push(Cp({x:29,y:32+b},{x:31,y:45},4,3.6,'darm',1.1));
   P.push(Pg([[14,10+b],[34,10+b],[32,33+b],[16,33+b]],'darm',2,{g:61}));P.push(Cp({x:15,y:16+b},{x:33,y:16+b},.7,.7,'gold',2.05));P.push(Cp({x:24,y:12+b},{x:24,y:32+b},.6,.6,'gold',2.05));
   [[12,10,1],[36,10,-1]].forEach(([x,y,d])=>{P.push(E(x,y+b,5.6,4.4,'darm',2.4));for(let i=0;i<2;i++)P.push(Pg([[x-2+i*4,y-2+b],[x-2+i*4+d*-1,y-9+b],[x+i*4,y-2+b]],'gold',2.41))});
   P.push(E(24,4+b,6,6.4,'darm',3));P.push(Pg([[18,4+b],[30,4+b],[30,6+b],[18,6+b]],null,3.1,{col:hex('#0a0610')}));P.push(E(21,5+b,1.4,.7,null,3.11,{col:D_GLV}));P.push(E(27,5+b,1.4,.7,null,3.11,{col:D_GLV}));
   hornL(P,19,0+b,1,3.2,-1);hornL(P,29,0+b,1,3,1);P.push(Cp({x:24,y:-2+b},{x:30,y:-10+b},1.2,.6,'dcape',2.9));
   P.push(Pg([[2,12+b],[14,10+b],[16,40],[8,44],[0,38]],'darm',3.4));P.push(Pg([[4,16+b],[12,15+b],[13,36],[8,39],[2,35]],'robeV',3.41));P.push(E(8,26+b,2.6,2.6,'gold',3.42));P.push(E(8,26+b,1.2,1.2,null,3.43,{col:D_GLV}));
   P.push(Cp({x:38,y:46},{x:36,y:-12+b},1,1,'steel',1.45));P.push(Pg([[36,-12+b],[32,-6+b],[36,-20+b],[40,-6+b]],'steel',1.5));return P},
 generator(t){const P=[],b=Math.round(Math.sin(t)*1),sw=Math.sin(t)*.3;
   P.push(Cp({x:18,y:32+b},{x:16,y:45},5,4.6,'dskin',1.2));P.push(Cp({x:31,y:32+b},{x:33,y:45},5,4.6,'dskin',1.1));
   P.push(Cp({x:37,y:14+b},{x:42,y:26+b},4.6,4.2,'dskin',1.6));
   P.push(E(24,22+b,14,12,'dskin',2,{g:61}));P.push(Pg([[14,24+b],[34,24+b],[33,34+b],[15,34+b]],'darm',2.05));P.push(Cp({x:12,y:12+b},{x:34,y:30+b},1,1,'bark',2.08));
   [[18,18,22,20],[27,17,31,19]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.5,.5,null,2.06,{col:hex('#2a1a2e'),noline:1})));
   P.push(Pg([[15,0+b],[31,0+b],[32,14+b],[14,14+b]],'robeV',3));P.push(Pg([[19,-8+b],[24,-14+b],[29,-8+b],[31,2+b],[17,2+b]],'robeV',3.01));
   P.push(Pg([[17,4+b],[31,4+b],[31,10+b],[17,10+b]],'darm',3.05));P.push(E(21,7+b,1.5,1,null,3.1,{col:D_GLR}));P.push(E(27,7+b,1.5,1,null,3.1,{col:D_GLR}));
   P.push(Cp({x:13,y:16+b},{x:6,y:26},4.4,4,'dskin',3.4));P.push(E(5,28,3.6,3.4,'dskin',3.45));
   P.push(Cp({x:5,y:44},{x:5+sw*10,y:-4},1.3,1.3,'bark',3.5));P.push(Pg([[5+sw*10,-6],[-8+sw*10,-14],[-12+sw*10,0],[5+sw*10,4]],'steel',3.55));P.push(Cp({x:-11+sw*10,y:-12},{x:-11+sw*10,y:-1},.6,.6,null,3.56,{col:WHITE,noline:1}));return P}
});
Object.assign(MOBNAME,{mega1:'마왕 메가와트',mega2:'메가와트 · 각성',mega3:'진 마왕 메가와트',kolo:'흑철 장군 콜로',volta:'뇌전의 리치 볼타',sandra:'마왕군 여간부 산드라',ord:'목 없는 기사 오르드',royalguard:'마왕 근위대장',generator:'마왕군 처형인'});
Object.assign(MOBCOL,{mega1:['#4e3450','#c88aff','#0a0610'],mega2:['#4e3450','#ff2a3a','#c88aff'],mega3:['#a03040','#c88aff','#f6f2e2'],kolo:['#16121e','#ff8a1a','#6a7690'],volta:['#1e1648','#ffe066','#d8d2bc'],
 sandra:['#36143e','#9aff3a','#2e1e3c'],ord:['#3c4458','#5af0c0','#4a0a1c'],royalguard:['#16121e','#f0b020','#c88aff'],generator:['#4e3450','#a8b4cc','#1e1648']});
for(const k of ['mega1','mega2','mega3','kolo','volta','sandra','ord','royalguard','generator']){for(const key in SPR)if(key.startsWith(k))delete SPR[key];for(const key in SPR2)if(key.startsWith(k+'|'))delete SPR2[key]}
FLY.volta=8;delete FLY.mega3;
</script>
