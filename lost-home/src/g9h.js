<script>
/* ================= 마계 원정 (11~20챕터) ================= */
R('impr',['#3a0a10','#7a1a22','#c8303a','#ff7a6a']);R('hnd',['#08060a','#1a141c','#2e2632','#4a3e4e']);R('flm',['#7a1a00','#e0520a','#ffb020','#fff2a0']);
R('stone',['#2a2a34','#4a4a58','#76768a','#a8a8bc']);R('wrth',['#1a2a3a','#2a4a6a','#4a7aa8','#9ad0ff']);R('crys',['#1a0a3a','#3a1a7a','#7a4ad8','#d0b0ff']);
R('rosev',['#0e2a14','#1a4a24','#2e7a3a','#6ac86a']);R('rosep',['#4a0010','#8a0a24','#d8183e','#ff7a9a']);R('eyew',['#a89aa8','#d8ccd8','#f4eef4','#ffffff']);
const MRED=hex('#ff2a3a'),MPUR=hex('#c88aff'),MCY=hex('#7affd8'),MYEL=hex('#ffe066'),MBK=hex('#0a0610');
const mEye=(P,x,y,z,c,r)=>{P.push(E(x,y,r||1.3,(r||1.3)*.8,null,z,{col:c}));P.push(E(x-.3,y-.3,.4,.4,null,z+.01,{col:WHITE}))};
Object.assign(MOBS,{
 imp(t){const P=[],b=Math.round(Math.sin(t*2)*1.5)-6,f=Math.sin(t*3)*3;
   [[1,0],[-1,.1]].forEach(([d,z])=>P.push(Pg([[24,22+b],[24+d*12,10+b-f],[24+d*16,16+b-f],[24+d*12,24+b],[24+d*6,22+b]],'dwing',.5+z)));
   P.push(Cp({x:30,y:30+b},{x:40,y:34+b+f*.3},1,.5,'impr',.8));P.push(Pg([[40,34+b],[43,31+b],[42,36+b]],'impr',.85));
   P.push(E(24,28+b,7,7,'impr',1.5));P.push(E(22,18+b,7.5,7,'impr',2));P.push(Pg([[17,13+b],[14,5+b],[19,11+b]],'bone',2.1));P.push(Pg([[26,12+b],[29,4+b],[28,12+b]],'bone',1.9));
   mEye(P,19,18+b,2.2,MYEL,1.5);mEye(P,24,18+b,2.2,MYEL,1.3);P.push(Cp({x:17,y:22+b},{x:23,y:22.5+b},.5,.5,null,2.2,{col:MBK}));
   P.push(Cp({x:16,y:28+b},{x:8,y:20+b},1.6,1.2,'impr',2.5));P.push(Cp({x:6,y:40+b},{x:8,y:6+b},.7,.7,'darm',2.6));P.push(Pg([[5,7+b],[8,1+b],[11,7+b],[9,5+b],[8,8+b],[7,5+b]],'steel',2.7));
   P.push(Cp({x:22,y:34+b},{x:20,y:40+b},1.6,1.2,'impr',1.4));P.push(Cp({x:27,y:34+b},{x:29,y:40+b},1.6,1.2,'impr',1.3));return P},
 hound(t){const P=[],b=Math.round(Math.sin(t*2)*1),run=Math.sin(t*2)*3;
   P.push(Cp({x:36,y:28+b},{x:44,y:20+b},2,1,'hnd',.8));for(let i=0;i<3;i++)P.push(Pg([[42+i*1.5,22+b],[46+i*2,12+b-(i%2)*3],[45+i*1.5,22+b]],'flm',.85));
   P.push(Cp({x:30,y:34},{x:32+run,y:44},2.4,1.8,'hnd',1));P.push(Cp({x:36,y:34},{x:38-run,y:44},2.4,1.8,'hnd',.9));
   P.push(E(28,30+b,13,8,'hnd',1.5));P.push(Cp({x:18,y:34},{x:16-run,y:44},2.6,1.8,'hnd',2));P.push(Cp({x:22,y:34},{x:24+run,y:44},2.6,1.8,'hnd',1.9));
   for(let i=0;i<5;i++)P.push(Pg([[18+i*4,24+b],[20+i*4,14+b-(i%2)*4+Math.sin(t*4+i)],[22+i*4,24+b]],'flm',1.6));
   P.push(E(13,26+b,7,6,'hnd',2.2));P.push(Pg([[4,26+b],[10,23+b],[12,30+b],[5,30+b]],'hnd',2.3));P.push(Pg([[5,30+b],[11,29+b],[10,32+b],[6,32+b]],null,2.35,{col:hex('#3a0008')}));
   [[6,30],[8,30],[10,30]].forEach(([x,y])=>P.push(Pg([[x,y+b],[x+.6,y+2+b],[x+1.2,y+b]],null,2.4,{col:WHITE})));P.push(Pg([[14,20+b],[15,13+b],[18,20+b]],'hnd',2.25));
   mEye(P,11,24+b,2.4,MRED,1.4);P.push(Cp({x:8,y:22+b},{x:13,y:23+b},.4,.4,null,2.45,{col:MBK}));return P},
 skel(t){const P=[],b=Math.round(Math.sin(t)*1),sw=Math.sin(t)*.3;
   P.push(Cp({x:22,y:30+b},{x:20,y:44},1.2,1,'bone',1));P.push(Cp({x:27,y:30+b},{x:29,y:44},1.2,1,'bone',.9));
   P.push(E(24,28+b,5,2.4,'bone',1.2));P.push(Cp({x:24,y:16+b},{x:24,y:28+b},1,1,'bone',1.3));for(let i=0;i<3;i++)P.push(Cp({x:19,y:18+i*3+b},{x:29,y:18+i*3+b},.7,.7,'bone',1.35));
   P.push(Pg([[28,16+b],[40,16+b],[40,30+b],[34,36+b],[28,30+b]],'rust',1.5));P.push(E(34,24+b,2,2,'gold',1.55));
   P.push(E(23,10+b,6.5,6.5,'bone',2));P.push(Pg([[19,14+b],[27,14+b],[26,18+b],[20,18+b]],'bone',2.05));
   P.push(E(20.5,10+b,1.8,2,null,2.1,{col:MBK}));P.push(E(25.5,10+b,1.8,2,null,2.1,{col:MBK}));mEye(P,20.5,10+b,2.15,MCY,.8);mEye(P,25.5,10+b,2.15,MCY,.8);
   for(let i=0;i<4;i++)P.push(Cp({x:20.5+i*1.6,y:15+b},{x:20.5+i*1.6,y:17+b},.3,.3,null,2.1,{col:MBK,noline:1}));P.push(Pg([[16,6+b],[23,1+b],[30,6+b],[28,4+b],[23,3+b],[18,4+b]],'rust',2.2));
   P.push(Cp({x:19,y:18+b},{x:12,y:24+b},1,.9,'bone',2.5));P.push(Cp({x:12,y:24+b},{x:4+sw*8,y:8+b},1,1,'steel',2.6));P.push(Cp({x:9,y:22+b},{x:15,y:26+b},.8,.8,'gold',2.65));return P},
 garg(t){const P=[],b=Math.round(Math.sin(t)*1),f=Math.sin(t*1.5)*2;
   [[1,0],[-1,.05]].forEach(([d,z])=>P.push(Pg([[26,20+b],[26+d*14,6+b-f],[26+d*20,10-f],[26+d*18,22],[26+d*10,24]],'stone',.5+z)));
   P.push(Cp({x:20,y:34},{x:16,y:44},3,2.4,'stone',1.1));P.push(Cp({x:30,y:34},{x:32,y:44},3,2.4,'stone',1));P.push(Cp({x:30,y:36},{x:42,y:40+f*.3},1.4,.6,'stone',.9));
   P.push(E(25,30+b,10,9,'stone',1.5));P.push(E(18,18+b,8,7,'stone',2));P.push(Pg([[12,14+b],[9,4+b],[15,11+b]],'stone',2.1));P.push(Pg([[21,12+b],[24,3+b],[24,12+b]],'stone',1.9));
   mEye(P,15,17+b,2.2,MYEL,1.3);mEye(P,20,17+b,2.2,MYEL,1.1);P.push(Pg([[11,21+b],[20,21+b],[18,25+b],[12,25+b]],null,2.2,{col:MBK}));[[12,21],[14.4,21],[16.8,21]].forEach(([x,y])=>P.push(Pg([[x,y+b],[x+.7,y+2+b],[x+1.4,y+b]],null,2.25,{col:WHITE})));
   P.push(Cp({x:16,y:28+b},{x:8,y:36},2.4,2,'stone',2.5));for(let i=0;i<3;i++)P.push(Pg([[6+i*2,36],[5+i*2.4,40],[8+i*2,37]],'bone',2.55));return P},
 wraith(t){const P=[],b=Math.round(Math.sin(t)*2)-6,w=Math.sin(t*2);
   P.push(Pg([[14,14+b],[34,14+b],[38,40+b],[32,36+b+w],[28,44+b],[24,38+b],[18,44+b-w],[14,36+b],[8,40+b]],'wrth',1,{g:61}));
   P.push(Pg([[14,8+b],[24,-2+b],[34,10+b],[34,22+b],[14,22+b]],'robeV',1.5));P.push(E(22,15+b,7,7,null,1.6,{col:hex('#06040c')}));
   mEye(P,19,14+b,1.7,MCY,1.4);mEye(P,25,14+b,1.7,MCY,1.2);P.push(Cp({x:14,y:22+b},{x:4,y:26+b+w*2},1.6,.8,'wrth',2));for(let i=0;i<3;i++)P.push(Cp({x:4,y:26+b+w*2},{x:0+i*1.5,y:22+b+w*2-i},.4,.3,'bone',2.1));return P},
 larmor(t){const P=[],b=Math.round(Math.sin(t)*1),sw=Math.sin(t)*.25;
   P.push(Cp({x:20,y:32+b},{x:18,y:44},2.6,2.4,'steel',1));P.push(Cp({x:29,y:32+b},{x:31,y:44},2.6,2.4,'steel',.9));
   P.push(Pg([[14,14+b],[34,14+b],[32,34+b],[16,34+b]],'darm',1.5));P.push(Pg([[16,16+b],[32,16+b],[31,24+b],[17,24+b]],'steel',1.55));P.push(E(24,26+b,2.4,2.4,null,1.6,{col:MPUR}));
   P.push(E(12,16+b,5,4,'steel',1.7));P.push(E(36,16+b,5,4,'steel',1.4));
   P.push(Pg([[17,2+b],[31,2+b],[32,12+b],[28,16+b],[20,16+b],[16,12+b]],'darm',2));P.push(Pg([[18,8+b],[30,8+b],[30,10+b],[18,10+b]],null,2.05,{col:MBK}));mEye(P,21,9+b,2.1,MPUR,1.1);mEye(P,27,9+b,2.1,MPUR,1.1);
   P.push(Pg([[22,2+b],[24,-4+b],[26,2+b]],'rosep',2.1));
   P.push(Cp({x:12,y:20+b},{x:8,y:30+b},2,1.8,'steel',2.4));P.push(Cp({x:8,y:32+b},{x:6+sw*12,y:2},1,1,'darm',2.5));P.push(Pg([[3+sw*12,6],[6+sw*12,-4],[9+sw*12,6]],'steel',2.55));P.push(Cp({x:3,y:30+b},{x:12,y:31+b},.8,.8,'gold',2.55));return P},
 lslime(t){const P=[],sq=Math.sin(t*2),w=12+sq*1.5,h=11-sq*1.2;
   P.push(E(24,44-h,w,h,'lava',1,{g:61}));P.push(E(24,44-h*.6,w*.8,h*.5,'flm',1.1));for(let i=0;i<3;i++){const u=((t/(Math.PI*2))+i/3)%1;P.push(E(18+i*6,44-h*2-u*8,1.4*(1-u)+.4,1.4*(1-u)+.4,'flm',1.2))}
   mEye(P,19,40-h,1.5,MBK,1.4);mEye(P,25,40-h,1.5,MBK,1.2);P.push(Cp({x:18,y:44-h*.6},{x:26,y:44-h*.55},.6,.6,null,1.6,{col:MBK}));return P},
 bonebat(t){const P=[],b=Math.round(Math.sin(t*2)*2)-10,f=Math.sin(t*4)*6;
   [[1,0],[-1,.05]].forEach(([d,z])=>{P.push(Pg([[24,22+b],[24+d*8,14+b-f],[24+d*16,12+b-f],[24+d*20,20+b-f*.5],[24+d*14,22+b],[24+d*10,26+b]],'dwing',.5+z));P.push(Cp({x:24,y:22+b},{x:24+d*16,y:12+b-f},.5,.4,'bone',.6+z))});
   P.push(E(24,22+b,6,5.4,'bone',1.5));P.push(E(21.6,21+b,1.6,1.8,null,1.6,{col:MBK}));P.push(E(26.4,21+b,1.6,1.8,null,1.6,{col:MBK}));mEye(P,21.6,21+b,1.65,MRED,.7);mEye(P,26.4,21+b,1.65,MRED,.7);
   [[21,26],[23,26],[25,26]].forEach(([x,y])=>P.push(Pg([[x,y+b],[x+.6,y+2+b],[x+1.2,y+b]],null,1.7,{col:WHITE})));return P},
 deye(t){const P=[],b=Math.round(Math.sin(t)*2)-8,lk=Math.sin(t*1.3)*1.5;
   for(let i=0;i<5;i++){const a=.4+i*.55;P.push(Cp({x:24+Math.cos(a)*6,y:28+b+Math.sin(a)*4},{x:24+Math.cos(a)*12+Math.sin(t*2+i)*2,y:38+b+Math.sin(a)*4},1.2,.5,'impr',.8))}
   P.push(E(24,22+b,11,11,'eyew',1.5));P.push(E(22+lk,22+b,6,6,'crys',1.6));P.push(E(22+lk,22+b,2.4,4.6,null,1.7,{col:MBK}));P.push(E(20+lk,19.6+b,1.4,1.4,null,1.75,{col:WHITE}));
   for(let i=0;i<4;i++)P.push(Cp({x:30,y:16+i*3+b},{x:34,y:15+i*3.6+b},.3,.3,null,1.65,{col:hex('#c8303a'),noline:1}));return P},
 vine(t){const P=[],sw=Math.sin(t)*2;
   P.push(E(24,42,12,4,'rosev',.8));for(let i=0;i<3;i++){const x0=16+i*8;P.push(Cp({x:x0,y:42},{x:x0+sw*(i-1)*.6,y:20-i*2},2.2-i*.3,1.4,'rosev',1+i*.1));P.push(Pg([[x0-1,30],[x0-4,28],[x0-1,32]],'rosev',1.2))}
   P.push(E(24+sw,14,9,8,'rosep',2));P.push(E(24+sw,14,6,5.4,'rosep',2.1));P.push(E(24+sw,15,4,3,null,2.2,{col:hex('#2a0008')}));
   [[21,15],[23,15],[25,15],[27,15]].forEach(([x,y])=>P.push(Pg([[x+sw,y],[x+.6+sw,y+2],[x+1.2+sw,y]],null,2.25,{col:WHITE})));mEye(P,21+sw,10,2.3,MYEL,1);mEye(P,27+sw,10,2.3,MYEL,1);return P},
 cgolem(t){const P=[],b=Math.round(Math.sin(t)*1);
   P.push(Cp({x:19,y:32+b},{x:17,y:44},3.4,3,'stone',1));P.push(Cp({x:30,y:32+b},{x:32,y:44},3.4,3,'stone',.9));
   P.push(Pg([[12,14+b],[36,12+b],[38,34+b],[12,36+b]],'stone',1.5));for(let i=0;i<4;i++)P.push(Pg([[14+i*6,14+b],[16+i*6,2+b-(i%2)*4],[19+i*6,14+b]],'crys',1.6));
   P.push(Pg([[20,20+b],[28,18+b],[30,28+b],[22,30+b]],'crys',1.7));mEye(P,22,22+b,1.8,MPUR,1.3);mEye(P,27,21.6+b,1.8,MPUR,1.2);
   P.push(Cp({x:12,y:18+b},{x:6,y:32+b},3.4,3,'stone',2));P.push(Pg([[2,32+b],[8,30+b],[10,38+b],[4,40+b]],'crys',2.1));return P},
 dsoldier(t){const P=[],b=Math.round(Math.sin(t)*1),th=Math.sin(t)*.3;
   P.push(Cp({x:21,y:32+b},{x:19,y:44},2,1.8,'darm',1));P.push(Cp({x:28,y:32+b},{x:30,y:44},2,1.8,'darm',.9));
   P.push(Pg([[16,16+b],[32,16+b],[31,34+b],[17,34+b]],'impr',1.5));P.push(Pg([[17,18+b],[31,18+b],[30,28+b],[18,28+b]],'darm',1.55));P.push(Cp({x:17,y:30+b},{x:31,y:30+b},.8,.8,'gold',1.6));
   P.push(E(24,10+b,6.4,6.4,'impr',2));P.push(Pg([[17,4+b],[31,4+b],[31,9+b],[17,9+b]],'darm',2.1));P.push(Pg([[17,4+b],[13,-4+b],[19,2+b]],'bone',2.05));P.push(Pg([[31,4+b],[35,-4+b],[29,2+b]],'bone',2.05));
   mEye(P,21,11+b,2.2,MYEL,1.2);mEye(P,26,11+b,2.2,MYEL,1.1);P.push(Cp({x:20,y:14.6+b},{x:26,y:14.6+b},.4,.4,null,2.2,{col:MBK}));
   P.push(Cp({x:16,y:20+b},{x:10,y:26+b},1.6,1.4,'impr',2.4));P.push(Cp({x:14+th*20,y:44},{x:2-th*10,y:4+b},.7,.7,'bark',2.5));P.push(Pg([[0-th*10,8+b],[2-th*10,-2+b],[5-th*10,8+b]],'steel',2.55));return P}
});
/* chapter-boss variants (bigger, crowned) */
const crowned=(base,dy)=>t=>{const P=MOBS[base](t);crown(P,base==='hound'?14:24,(dy||0)+(base==='hound'?14:2),.55);return P};
Object.assign(MOBS,{cerb:crowned('hound'),skelk:crowned('skel'),lavak:crowned('lslime',24),wraithk:crowned('wraith',-6),crystk:crowned('cgolem'),gargk:crowned('garg',6),knightk:crowned('larmor')});
Object.assign(MOBNAME,{imp:'불꽃 임프',hound:'지옥견',skel:'해골 병사',garg:'가고일',wraith:'망령',larmor:'저주받은 갑옷',lslime:'용암 슬라임',bonebat:'해골 박쥐',deye:'마안',vine:'식인 장미',cgolem:'흑수정 골렘',dsoldier:'마왕군 병사',
 cerb:'지옥견 우두머리 케르베',skelk:'해골 장군',lavak:'용암 군주',wraithk:'망령 군주',crystk:'흑수정 거인',gargk:'가고일 군주',knightk:'저주받은 근위대장',
 barkas:'사천왕 · 강철의 바르카스',lilith:'사천왕 · 혈장미의 릴리스',xenos:'마왕의 오른팔 · 흑염의 제노스',mega1:'마왕 메가와트',mega2:'마왕 메가와트 · 각성',mega3:'진 마왕 메가와트'});
Object.assign(MOBCOL,{imp:['#c8303a','#ffb020','#3a0a10'],hound:['#2e2632','#ff8a1a','#08060a'],skel:['#d8d2bc','#a85a26','#6a6250'],garg:['#76768a','#4a4a58','#ffe066'],wraith:['#4a7aa8','#7affd8','#1a2a3a'],larmor:['#2a2436','#a8b4cc','#c88aff'],
 lslime:['#ff8a1a','#ffd040','#7a1a00'],bonebat:['#d8d2bc','#261c34','#ff2a3a'],deye:['#f4eef4','#7a4ad8','#c8303a'],vine:['#2e7a3a','#d8183e','#0e2a14'],cgolem:['#4a4a58','#7a4ad8','#d0b0ff'],dsoldier:['#7a1a22','#16121e','#ffe066'],
 cerb:['#2e2632','#ff8a1a','#ffd23a'],skelk:['#d8d2bc','#a85a26','#ffd23a'],lavak:['#ff8a1a','#ffd040','#ffd23a'],wraithk:['#4a7aa8','#7affd8','#ffd23a'],crystk:['#4a4a58','#7a4ad8','#ffd23a'],gargk:['#76768a','#4a4a58','#ffd23a'],knightk:['#2a2436','#a8b4cc','#ffd23a'],
 barkas:['#4a5268','#ff2a3a','#8a1a28'],lilith:['#c8102e','#e8e4f4','#2a1426'],xenos:['#2a2238','#b060ff','#e8e4f0']});
Object.assign(FLY,{imp:6,wraith:6,bonebat:10,deye:8,wraithk:6});
Object.assign(RANGED,{imp:'#ff8a1a',deye:'#c88aff',wraith:'#7affd8'});

/* ---------- backgrounds ---------- */
function mkBG(o){return{
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,o.sky);if(o.moon){const[cx,cy,r,c]=o.moon;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)put(cx+x,cy+y,hex((x+y)%5===0&&x*x+y*y>r*r*.6?o.sky[o.sky.length-1]:c))}
    for(let i=0;i<30;i++)if(o.stars)put((i*53)%VW,(i*29)%60,hex(o.stars))}),
  far:()=>pcan(360,VH,put=>{const c=hex(o.far),c2=hex(o.far2||o.far);
    if(o.farK==='spires')for(let i=0;i<9;i++){const x=i*40+(i*17)%20,top=40+(i*23)%30;for(let y=top;y<100;y++){const w=Math.round(2+(y-top)*.22);for(let xx=-w;xx<=w;xx++)put(x+xx,y,c)}}
    if(o.farK==='mtn')for(let x=0;x<360;x++){const h=Math.round(30+18*Math.sin(x*.05)+10*Math.sin(x*.13+1));for(let y=100-h;y<100;y++)put(x,y,y<100-h+3?c2:c)}
    if(o.farK==='castle'){for(let x=0;x<360;x++){const h=40+((Math.floor(x/18))%3)*8;for(let y=100-h;y<100;y++)put(x,y,c);if(x%18<6)for(let y=100-h-5;y<100-h;y++)put(x,y,c)}for(let i=0;i<12;i++){const wx=10+i*30;rectP(put,wx,70,3,5,o.win||'#ff8a1a')}}
    if(o.farK==='throne'){for(let i=0;i<6;i++){const x=i*60+30;rectP(put,x-6,20,12,80,o.far2);rectP(put,x-8,16,16,5,o.far);for(let y=30;y<96;y+=14)put(x,y,hex(o.win||'#c88aff'))}rectP(put,150,30,60,70,o.far);for(let y=40;y<96;y++)for(let x=170;x<190;x++)if(((x-180)**2)/100+((y-60)**2)/400<1)put(x,y,hex(o.win||'#c88aff'))}
    if(o.farK==='crystal')for(let i=0;i<14;i++){const x=i*26+(i*7)%10,h=20+(i*31)%40;for(let y=100-h;y<100;y++){const w=Math.round((y-(100-h))*.28);for(let xx=-w;xx<=w;xx++)put(x+xx,y,xx<0?c2:c)}}
    if(o.farK==='graves')for(let x=0;x<360;x++){const h=Math.round(22+8*Math.sin(x*.04));for(let y=100-h;y<100;y++)put(x,y,c)}
    if(o.portal){const[px,py,r]=o.portal;for(let y=-r;y<=r;y++)for(let x=-r*.7;x<=r*.7;x++){const d=(x*x)/(r*r*.49)+(y*y)/(r*r);if(d<=1)put(Math.round(px+x),py+y,hex(d>.75?o.far2:d>.4?'#ff3a6a':'#ffd0e0'))}}}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,98,114,o.mid)}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,o.ground);for(let x=0;x<VW;x+=7)for(let y=116;y<VH;y+=6)put(x+((y/6)%2)*3,y,hex(o.gdot||'#000000'))}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<7;i++){const x=20+i*52+(i*13)%16,y=118,k=(o.props||['rock'])[i%(o.props||['rock']).length];
    if(k==='rock'){for(let yy=0;yy<6;yy++)for(let xx=-5+yy*.5;xx<=5-yy*.5;xx++)put(Math.round(x+xx),y-yy,hex(yy<2?'#2a1a1a':'#4a2e2a'))}
    if(k==='bone'){lineP(put,x-5,y,x+5,y-2,'#d8d2bc');put(x-6,y,hex('#d8d2bc'));put(x+6,y-3,hex('#d8d2bc'));for(let yy=0;yy<4;yy++)for(let xx=-2;xx<=2;xx++)put(x+8+xx,y-yy,hex('#e8e2cc'));put(x+7,y-2,MBK);put(x+9,y-2,MBK)}
    if(k==='torch'){rectP(put,x,y-14,2,14,'#3a2a20');for(let yy=0;yy<5;yy++)for(let xx=-2+Math.floor(yy/2);xx<=2-Math.floor(yy/2);xx++)put(x+1+xx,y-15-yy,hex(yy<2?'#ff8a1a':'#ffe066'))}
    if(k==='rose'){lineP(put,x,y,x+1,y-9,'#1a4a24');for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++)if(xx*xx+yy*yy<6)put(x+1+xx,y-10+yy,hex(xx+yy<0?'#ff4a6a':'#a80a24'))}
    if(k==='grave'){rectP(put,x-4,y-10,9,10,'#5a5a6a');rectP(put,x-3,y-12,7,2,'#5a5a6a');rectP(put,x,y-9,1,5,'#2a2a34');rectP(put,x-2,y-8,5,1,'#2a2a34')}
    if(k==='crys'){for(let yy=0;yy<10;yy++){const w=Math.floor(yy*.35);for(let xx=-w;xx<=w;xx++)put(x+xx,y-10+yy,hex(xx<0?'#d0b0ff':'#7a4ad8'))}}
    if(k==='lava'){for(let xx=-8;xx<=8;xx++)for(let yy=0;yy<2;yy++)put(x+xx,y+1-yy,hex(yy?'#ffb020':'#ff5a0a'))}
    if(k==='spike'){for(let yy=0;yy<12;yy++)put(x,y-yy,hex('#2a2436'));put(x-1,y-12,hex('#a8b4cc'));put(x,y-13,hex('#a8b4cc'))}
    if(k==='banner'){rectP(put,x,y-22,1,22,'#2a2020');rectP(put,x+1,y-21,7,12,'#7a0a1e');put(x+4,y-16,hex('#ffd23a'))}}}),
  anim:o.anim}}
const EMB2=(col)=>(L,s,t)=>{for(let k=0;k<7;k++){const u=((t*.25+k*.14)%1),x=(k*37+20+Math.sin(t+k)*6)%VW;L.fillStyle=col.replace('A',(.85*(1-u)).toFixed(2));L.fillRect(x,110-u*90,1,1)}};
const NEW_THEMES=[
 {name:'마계의 문',mobs:['imp','hound','bonebat','dsoldier','lslime'],mids:['kolo','generator'],fin:'cerb',story:'마왕이 달아난 마계의 입구. 붉은 하늘 아래 거대한 문이 열려 있어요.',
  ...mkBG({sky:['#1a0408','#3a0a12','#6a1a1a','#a83a20','#d86a2a'],farK:'mtn',far:'#2a0a10',far2:'#4a1418',portal:[250,52,30],mid:['#3a1010','#2a0a0a'],ground:['#4a2018','#2e140e','#1a0a08'],gdot:'#5a2a1e',props:['rock','bone','torch'],anim:EMB2('rgba(255,140,60,A)')})},
 {name:'해골 협곡',mobs:['skel','bonebat','hound','wraith','imp'],mids:['ord','royalguard'],fin:'skelk',story:'수많은 용사들이 잠든 뼈의 협곡이에요.',
  ...mkBG({sky:['#1a1420','#2e2434','#4a3a48','#6a5a5a','#8a7a6a'],farK:'spires',far:'#3a3040',far2:'#3a3040',mid:['#4a4048','#3a3038'],ground:['#6a5e52','#4a4038','#2e2822'],gdot:'#8a7e6a',props:['bone','rock','bone','grave'],stars:'#c8c0d0'})},
 {name:'혈장미 정원',mobs:['vine','imp','bonebat','deye','wraith'],mids:['sandra','volta'],fin:'lilith',story:'사천왕 릴리스의 정원. 장미는 피를 먹고 자라요.',
  ...mkBG({sky:['#14040e','#2a0a1e','#4a1030','#7a1a40','#a82a50'],moon:[140,30,14,'#ffd0d8'],farK:'castle',far:'#1a0612',far2:'#2a0a1c',win:'#ff4a7a',mid:['#2a0a18','#1a0610'],ground:['#3a1424','#260c18','#14060c'],gdot:'#5a1a30',props:['rose','rose','grave','rose'],stars:'#ffb0c8',anim:EMB2('rgba(255,60,110,A)')})},
 {name:'용암 강',mobs:['lslime','imp','hound','garg','dsoldier'],mids:['kolo','generator'],fin:'lavak',story:'끓어오르는 용암이 강처럼 흘러요.',
  ...mkBG({sky:['#1a0604','#3a0e06','#6a1e08','#a8400a','#e8701a'],farK:'mtn',far:'#2a0a06',far2:'#ff6a1a',mid:['#ff5a0a','#a82a04'],ground:['#3a1a10','#24100a','#140806'],gdot:'#ff6a1a',props:['lava','rock','lava'],anim:EMB2('rgba(255,180,60,A)')})},
 {name:'망자의 묘지',mobs:['skel','wraith','bonebat','larmor','deye'],mids:['ord','volta'],fin:'wraithk',story:'원한을 품은 망령들이 떠도는 묘지예요.',
  ...mkBG({sky:['#06101a','#0e1e2e','#1a3044','#2a4a5a','#3a6070'],moon:[40,26,12,'#e8f4ff'],farK:'graves',far:'#0e1a24',mid:['#1a2a34','#121e26'],ground:['#2a3a3a','#1e2a2a','#121a1a'],gdot:'#3a5050',props:['grave','grave','bone','torch'],stars:'#d0e8ff',anim:EMB2('rgba(120,255,220,A)')})},
 {name:'흑수정 동굴',mobs:['cgolem','deye','bonebat','garg','lslime'],mids:['generator','kolo'],fin:'crystk',story:'마력을 머금은 검은 수정이 빛나는 동굴.',
  ...mkBG({sky:['#06040e','#0e0a1e','#1a1230','#241a40','#2e2050'],farK:'crystal',far:'#3a1a7a',far2:'#7a4ad8',mid:['#1a1230','#120c22'],ground:['#241a34','#181024','#0e0a16'],gdot:'#4a3a6a',props:['crys','rock','crys'],anim:EMB2('rgba(200,150,255,A)')})},
 {name:'흑철 요새',mobs:['dsoldier','larmor','garg','hound','imp'],mids:['royalguard','ord'],fin:'xenos',story:'마왕의 오른팔 제노스가 지키는 철의 요새.',
  ...mkBG({sky:['#0a0810','#16121e','#24202e','#3a3040','#5a3a40'],farK:'castle',far:'#14121a',far2:'#1e1a26',win:'#c88aff',mid:['#2a2632','#1e1a24'],ground:['#3a3842','#2a2830','#1a181e'],gdot:'#4a4652',props:['spike','banner','torch','spike'],anim:EMB2('rgba(180,100,255,A)')})},
 {name:'피의 성벽',mobs:['garg','dsoldier','bonebat','larmor','deye'],mids:['royalguard','sandra'],fin:'gargk',story:'붉은 달이 뜬 마왕성의 외벽이에요.',
  ...mkBG({sky:['#1a0206','#3a060e','#5a0a14','#7a1018','#3a0a10'],moon:[130,34,18,'#ff3a3a'],farK:'castle',far:'#1a060a',far2:'#2a0a10',win:'#ff3a3a',mid:['#3a2a2e','#2a1e22'],ground:['#4a3a3e','#342a2c','#1e1618'],gdot:'#5a4a4e',props:['banner','spike','torch'],stars:'#ff8a8a'})},
 {name:'마왕성 회랑',mobs:['larmor','dsoldier','wraith','deye','cgolem'],mids:['royalguard','volta'],fin:'knightk',story:'옥좌로 이어지는 끝없는 회랑.',
  ...mkBG({sky:['#08060e','#120c1a','#1a1226','#22182e','#2a1e36'],farK:'throne',far:'#1a1226',far2:'#24183a',win:'#c88aff',mid:['#5a1020','#3a0a14'],ground:['#2a2232','#1e1826','#14101a'],gdot:'#c8962a',props:['torch','banner','torch'],anim:EMB2('rgba(200,140,255,A)')})},
 {name:'마왕의 옥좌',mobs:['dsoldier','larmor','garg','deye','wraith'],mids:['royalguard','generator'],fin:'mega1',story:'모든 것의 끝. 마왕 메가와트가 옥좌에서 기다려요.',
  ...mkBG({sky:['#06020a','#14061a','#2a0a2e','#4a0e3a','#6a1240'],farK:'throne',far:'#14061a',far2:'#2a0a2e',win:'#ff3a6a',mid:['#6a0a1e','#3a0610'],ground:['#2a1424','#1e0e1a','#120810'],gdot:'#c8962a',props:['torch','spike','banner','torch'],stars:'#ff8aa8',anim:EMB2('rgba(255,80,120,A)')})}
];
if(THEMES.length===10)THEMES.push(...NEW_THEMES);
/* 10챕터 보스 = 사천왕 바르카스, 마왕은 20챕터로 */
THEMES[9].fin='barkas';THEMES[9].story='마왕군 사천왕 바르카스가 대발전소를 지켜요. 마왕은 이미 마계로 달아났어요!';
for(const k in BGC)delete BGC[k];
</script>
