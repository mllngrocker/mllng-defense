<script>
/* ---------- monsters (pixel, facing left), bosses = scaled monsters with a crown ---------- */
R('bag',['#7f95b8','#b4c6df','#dde8f5','#ffffff']);
R('can',['#5e0c16','#9c1c28','#d8303c','#ff6a70']);
R('metal',['#5f6676','#9aa2b2','#d6dbe4']);
R('oil',['#0e0916','#1f1630','#33264a','#4d3a6c','#6c5590']);
R('bark',['#331e0e','#563419','#80532a','#a8743e']);
R('ring',['#b8864c','#d9a96a','#f0cf98']);
R('leaf',['#1f5a2a','#3a8a3f','#6cc25a']);
R('gold',['#6a3a00','#b07000','#f0b020','#fff0a0']);
R('rust',['#2e1408','#5e2e14','#965024','#c88446']);
R('vest',['#5e240a','#a8481a','#de782a','#ffae5e']);
R('gob',['#1a3610','#36661e','#5a9634','#88c658']);
R('fire',['#7a1a00','#d0400a','#ff8a1a','#ffe066']);
R('fishr',['#2a4a6a','#5a8ab0','#a8c8e0','#e8f4ff']);
R('bat',['#6a4420','#a8743c','#d8a868','#f0d098']);
R('neon',['#4a0a5a','#c02aa0','#ff5ad0','#a0ffff']);
R('lava',['#3a0a00','#a82a00','#ff6a1a','#ffd23f']);
R('holy',['#8a6a20','#e0c060','#fff3b0','#ffffff']);
R('glass',['#2a6a9a','#5aa8d8','#a8dcf8']);
const YEL=hex('#ffe066'),RED2=hex('#ff4d5e'),DK=hex('#2a1a24');
function eyesL(P,x,y,z,col){const EW=hex('#fff3c8'),IR=hex('#e8202a'),DKB=hex('#1a0a10');
  [[x,y,-1],[x+6,y,1]].forEach(([a,b,s])=>{P.push(E(a,b,2.5,2.4,null,z,{col:col||EW}));P.push(E(a-.5,b+.5,1.25,1.45,null,z+.01,{col:IR}));P.push(Cp({x:a-.5,y:b-.5},{x:a-.5,y:b+1.6},.38,.38,null,z+.015,{col:DKB}));P.push(E(a-.1,b-.4,.35,.35,null,z+.016,{col:WHITE}))});
  P.push(Pg([[x-3.6,y-3.4],[x+2.8,y-.6],[x+2.8,y-2],[x-3.2,y-4.8]],null,z+.02,{col:DKB}));P.push(Pg([[x+9.6,y-3.4],[x+3.2,y-.6],[x+3.2,y-2],[x+9.2,y-4.8]],null,z+.02,{col:DKB}))}
const MOBS={
  jelly(t){const P=[],fy=Math.round(Math.sin(t)*2)-9;
    P.push(E(19,12+fy,2.6,3.2,'bag',1));P.push(E(28,12+fy,2.6,3.2,'bag',1));
    for(let i=0;i<4;i++){const x=16+i*5;P.push(Cp({x,y:28+fy},{x:x+Math.sin(t+i)*2.2,y:39+fy},1.7,1.1,'bag',1.5))}
    P.push(Pg([[11,29+fy],[12,18+fy],[18,12+fy],[30,12+fy],[36,18+fy],[37,29+fy],[33,31+fy],[29,29+fy],[24,31+fy],[19,29+fy],[15,31+fy]],'bag',2));
    P.push(Pg([[26,22+fy],[33,22+fy],[33,25+fy],[26,25+fy]],null,2.5,{col:RED2}));
    eyesL(P,17,21+fy,3);return P},
  crab(t){const P=[],w=Math.round(Math.sin(t)*2);
    for(let i=0;i<3;i++){[[18+i*5,1],[18+i*5,-1]].forEach(([x,s],k)=>{P.push(Cp({x,y:36},{x:x+(k?w:-w)+s*2,y:43},1.3,1.1,k?'can':'can',k?0.5:3.5))})}
    P.push(Cp({x:16,y:34},{x:33,y:34},6.4,6.4,'can',2));P.push(Cp({x:16,y:33},{x:33,y:33},1.3,1.3,null,2.1,{col:WHITE}));
    P.push(E(34,34,2,6.2,'metal',2.2));
    P.push(Cp({x:15,y:31},{x:10,y:27},1.6,1.4,'can',2.3));P.push(E(8,26+w*.5,4.4,3.4,'can',2.4));P.push(Pg([[4,25],[1,23],[4,27]],null,2.5,{col:WHITE}));
    P.push(Cp({x:20,y:28},{x:19,y:21},.8,.8,null,2,{col:DK}));P.push(Cp({x:26,y:28},{x:26,y:21},.8,.8,null,2,{col:DK}));
    eyesL(P,19,20,2.6);return P},
  oil(t){const P=[],q=Math.sin(t);const rx=12*(1+q*.08),ry=10*(1-q*.08),cy=42-ry;
    P.push(E(24,cy,rx,ry,'oil',1));P.push(Pg([[14,40],[12,44],[17,42]],'oil',1.1));P.push(Pg([[30,41],[33,44],[34,40]],'oil',1.1));
    P.push(Pg([[26,cy-ry+1],[32,cy-ry+1],[32,cy-ry-3],[26,cy-ry-3]],'can',1.5));
    eyesL(P,18,cy-1,2,YEL);P.push(Cp({x:18,y:cy+5},{x:25,y:cy+5},.6,.6,null,2.1,{col:BLACK}));return P},

  bottle(t){const P=[],b=Math.round(Math.sin(t)*1);
    P.push(Cp({x:21,y:38},{x:20+Math.sin(t)*1.5,y:44},1.7,1.5,'metal',1));P.push(Cp({x:27,y:38},{x:28-Math.sin(t)*1.5,y:44},1.7,1.5,'metal',1));
    P.push(Cp({x:24,y:23+b},{x:24,y:37},6.4,6.6,'glass',2));P.push(Pg([[17.6,28+b],[30.4,28+b],[30.4,32+b],[17.6,32+b]],'can',2.2));
    P.push(Cp({x:24,y:16+b},{x:24,y:20+b},3,3.6,'glass',2.1));P.push(E(24,14.5+b,3.4,2,'can',2.3));
    P.push(Cp({x:14,y:38},{x:8,y:10+b},.9,.9,null,1.5,{col:hex('#ffd23f')}));P.push(Cp({x:19,y:30+b},{x:12,y:27+b},1.4,1.2,'glass',2.4));
    eyesL(P,19,23+b,3);return P},
  gull(t){const P=[],fy=-7+Math.round(Math.sin(t)*2),fl=Math.sin(t*2)*7;
    P.push(Pg([[25,22+fy],[33,8+fy+fl],[40,18+fy+fl*.5],[33,24+fy]],'furD',1));
    P.push(E(27,26+fy,10,6.5,'fur',2));P.push(Pg([[35,24+fy],[42,22+fy],[41,29+fy],[35,29+fy]],'furD',1.9));
    P.push(E(17,22+fy,5.4,5,'fur',2.5));P.push(Pg([[12,21+fy],[5,24+fy],[12,25.5+fy]],'gold',2.6));
    P.push(E(16,20.5+fy,1,1.2,null,2.7,{col:BLACK}));P.push(Cp({x:13.5,y:18+fy},{x:18.5,y:19.2+fy},.5,.5,null,2.71,{col:BLACK}));
    P.push(Pg([[24,21+fy],[30,7+fy+fl],[35,20+fy]],'fur',3));
    P.push(E(22,27+fy,3.4,1.2,null,2.9,{col:hex('#c9e8f4'),noline:1}));return P},
  saw(t){const P=[],w=Math.sin(t)*.4,b=Math.round(Math.sin(t)*1);
    P.push(Cp({x:22,y:36},{x:21+w*4,y:44},1.8,1.5,'gob',1));P.push(Cp({x:28,y:36},{x:29-w*4,y:44},1.8,1.5,'gob',1));
    P.push(E(25,31+b,6.5,7,'vest',2));P.push(E(23,19+b,7.5,7,'gob',3));
    P.push(Pg([[16,17+b],[9,12+b],[17,21+b]],'gob',2.9));P.push(Pg([[30,16+b],[36,11+b],[30,21+b]],'gob',2.9));
    P.push(Pg([[15.5,15+b],[17,10+b],[29,10+b],[30.5,15+b]],'gold',3.2));
    eyesL(P,19,19+b,3.3,YEL);P.push(Cp({x:18,y:25+b},{x:24,y:24.5+b},.5,.5,null,3.4,{col:BLACK}));
    P.push(Cp({x:20,y:30+b},{x:13,y:30+b},1.6,1.4,'gob',3.5));
    const c={x:10,y:30+b};P.push(E(c.x,c.y,5.4,5.4,'metal',3.6));for(let i=0;i<8;i++){const a=i/8*Math.PI*2+t*2;P.push(Pg([[c.x+Math.cos(a)*5,c.y+Math.sin(a)*5],[c.x+Math.cos(a+.2)*7.4,c.y+Math.sin(a+.2)*7.4],[c.x+Math.cos(a+.45)*5,c.y+Math.sin(a+.45)*5]],'metal',3.55))}
    P.push(E(c.x,c.y,1.4,1.4,null,3.7,{col:DK}));return P},
  shroom(t){const P=[],q=Math.sin(t);
    P.push(E(20,43,3,1.6,'ring',1));P.push(E(28,43,3,1.6,'ring',1));
    P.push(Cp({x:24,y:27},{x:24,y:40},6.2,6.8,'ring',2));
    P.push(E(24,21-q*.6,13.5*(1+q*.03),9,'can',3,{bias:.2}));
    [[17,17],[25,14],[31,19],[21,23]].forEach(([x,y])=>P.push(E(x,y-q*.6,1.9,1.5,null,3.1,{col:WHITE,noline:1})));
    eyesL(P,19,32,3,YEL);P.push(Cp({x:19,y:37},{x:25,y:37.5},.5,.5,null,3.2,{col:BLACK}));return P},
  mole(t){const P=[],b=Math.round(Math.sin(t));
    P.push(E(28,33+b,11,9.5,'bark',2));P.push(E(26,37+b,6,4,'ring',2.1,{bias:.4}));
    P.push(Cp({x:22,y:40},{x:20,y:44},2,1.6,'bark',1.5));P.push(Cp({x:33,y:40},{x:35,y:44},2,1.6,'bark',1.5));
    P.push(E(17,31+b,7,6.5,'bark',3));
    const sp=t*3;P.push(Pg([[12,27+b],[12,35+b],[2,31+b]],'metal',3.2));P.push(Cp({x:9,y:28.5+b+Math.sin(sp)},{x:7,y:33.5+b-Math.sin(sp)},.5,.5,null,3.3,{col:DK}));
    P.push(Pg([[11,25+b],[14,19+b],[25,19+b],[27,25+b]],'gold',3.4));P.push(E(16,28+b,2.4,2.4,null,3.45,{col:hex('#9fe0ff')}));P.push(E(15.5,28.2+b,.9,1,null,3.5,{col:BLACK}));
    P.push(Cp({x:14,y:37+b},{x:10,y:40+b},1.4,1,'ring',3.6));return P},
  ember(t){const P=[],fy=-10+Math.round(Math.sin(t)*2),f=Math.sin(t*2)*2;
    P.push(Pg([[14,34+fy],[16,24+fy],[22,17+fy],[26+f,6+fy],[29,16+fy],[34,24+fy],[34,34+fy],[24,40+fy]],'fire',2,{bias:.3}));
    P.push(E(24,31+fy,6,6,'fire',2.1,{bias:1.2,noline:1}));
    eyesL(P,19,29+fy,2.5,WHITE);P.push(E(10,22+fy+f,1.2,1.2,null,2.6,{col:hex('#ffe066')}));P.push(E(38,18+fy-f,1,1,null,2.6,{col:hex('#ffb03a')}));return P},
  octo(t){const P=[],b=Math.round(Math.sin(t));
    for(let i=0;i<6;i++){const x=13+i*4.4,c=Math.sin(t+i)*3;const m={x:x-2+c*.4,y:36},e={x:x-6+c,y:42-(i%2)*2};P.push(Cp({x,y:28+b},m,3,2.3,'oil',1+(i%2)*1.5));P.push(Cp(m,e,2.3,1.2,'oil',1+(i%2)*1.5))}
    P.push(E(25,18+b,13,12.5,'oil',2.5));P.push(E(22,13+b,4,3,'oil',2.6,{bias:1.5,noline:1}));
    eyesL(P,16,21+b,3,YEL);P.push(E(19,28+b,2.2,1.6,null,3.1,{col:DK}));return P},
  hermit(t){const P=[],w=Math.round(Math.sin(t)*2);
    for(let i=0;i<3;i++){P.push(Cp({x:16+i*4,y:36},{x:14+i*4+(i%2?w:-w),y:44},1.4,1.1,'can',1))}
    P.push(Cp({x:29,y:20},{x:29,y:37},10.5,10.5,'rust',2));
    [24,30].forEach(y=>P.push(Cp({x:18.6,y},{x:39.4,y},.8,.8,'metal',2.2)));P.push(E(33,15,3,2,'metal',2.3));
    P.push(E(17,35,7,5,'can',3));P.push(Cp({x:14,y:31},{x:10,y:27},1.8,1.6,'can',3.1));P.push(E(7,25+w*.5,5.8,4.4,'can',3.2));P.push(Pg([[2,24],[-1,21],[3,27]],null,3.3,{col:WHITE}));
    P.push(Cp({x:16,y:31},{x:15,y:22},.8,.8,null,3,{col:DK}));P.push(Cp({x:21,y:31},{x:21,y:22},.8,.8,null,3,{col:DK}));
    eyesL(P,15,21,3.4);return P},
  golem(t){const P=[],b=Math.round(Math.sin(t)*1);
    P.push(Cp({x:38,y:16+b},{x:42,y:30},4,3.6,'rust',1));P.push(E(42,32,4.4,4.4,'metal',1.1));
    P.push(Cp({x:18,y:34},{x:17,y:44},4.6,4.4,'oil',1.5));P.push(Cp({x:30,y:34},{x:31,y:44},4.6,4.4,'oil',1.5));
    P.push(Pg([[11,14+b],[36,11+b],[40,34],[9,36]],'rust',2));
    P.push(E(18,22+b,4.6,4.6,'oil',2.2));P.push(E(18,22+b,1.8,1.8,null,2.3,{col:DK}));
    P.push(Pg([[28,16+b],[34,16+b],[34,23+b],[28,23+b]],'can',2.2));P.push(Cp({x:24,y:29},{x:33,y:27},2,2,'glass',2.25));
    P.push(Pg([[17,5+b],[31,4+b],[32,13+b],[16,14+b]],'metal',2.5));
    P.push(Pg([[19,8+b],[23,9+b],[23,10.5+b],[19,10+b]],null,2.6,{col:hex('#ff3040')}));P.push(Pg([[25,9+b],[29,8+b],[29,10+b],[25,10.5+b]],null,2.6,{col:hex('#ff3040')}));
    P.push(Cp({x:11,y:17+b},{x:5,y:30},4.6,4.2,'rust',3));P.push(E(5,33,5.2,5.2,'metal',3.1));return P},
  boar(t){const P=[],w=Math.sin(t)*.3,b=Math.round(Math.sin(t));
    [[20,1],[34,1],[24,2.5],[38,2.5]].forEach(([x,z],i)=>P.push(Cp({x,y:34},{x:x+(i%2?w:-w)*6,y:44},2.2,1.8,'bark',z)));
    P.push(E(29,28+b,14,10,'bark',2));P.push(Pg([[30,18+b],[34,15+b],[38,19+b]],'bark',1.9));
    P.push(E(15,29+b,8.5,7.5,'bark',2.5));P.push(E(9,31+b,3.4,3,'ring',2.6));
    P.push(Pg([[10,34+b],[6,30+b],[11,32+b]],null,2.7,{col:WHITE}));P.push(E(13,25+b,1.4,1.2,null,2.7,{col:RED2}));P.push(Cp({x:10,y:22+b},{x:15,y:23.5+b},.5,.5,null,2.71,{col:BLACK}));
    P.push(Cp({x:6,y:26},{x:12,y:33},1,1,'metal',3));P.push(Pg([[0,20],[5,20],[5,42],[0,42]],'gold',3.2));
    [26,31,36].forEach(y=>P.push(Cp({x:.6,y},{x:4.4,y},.4,.4,null,3.3,{col:hex('#6a3a00')})));return P},
  beaver(t){const P=[],b=Math.round(Math.sin(t));
    const c={x:40,y:36};P.push(E(c.x,c.y,7.6,7.6,'metal',1));for(let i=0;i<10;i++){const a=i/10*Math.PI*2+t*3;P.push(Pg([[c.x+Math.cos(a)*7,c.y+Math.sin(a)*7],[c.x+Math.cos(a+.18)*10,c.y+Math.sin(a+.18)*10],[c.x+Math.cos(a+.36)*7,c.y+Math.sin(a+.36)*7]],'metal',.9))}
    P.push(E(c.x,c.y,2,2,null,1.1,{col:DK}));
    P.push(Cp({x:22,y:38},{x:21,y:44},2.2,1.8,'bark',1.5));P.push(Cp({x:31,y:38},{x:32,y:44},2.2,1.8,'bark',1.5));
    P.push(E(27,29+b,10.5,12,'bark',2));P.push(E(25,32+b,6,7,'ring',2.1,{bias:.4}));
    P.push(E(18,18+b,7.5,7,'bark',3));P.push(Pg([[13,22+b],[17,22+b],[17,27+b],[13,27+b]],null,3.2,{col:WHITE}));P.push(Cp({x:15,y:22+b},{x:15,y:27+b},.35,.35,null,3.3,{col:DK}));
    P.push(Pg([[11,14+b],[13,9+b],[24,9+b],[26,14+b]],'gold',3.3));eyesL(P,14,17+b,3.4);return P},
  ogre(t){const P=[],b=Math.round(Math.sin(t)*1);
    P.push(Cp({x:19,y:36},{x:18,y:44},4.2,4,'oil',1));P.push(Cp({x:31,y:36},{x:32,y:44},4.2,4,'oil',1));
    P.push(Cp({x:36,y:18+b},{x:40,y:30},3.6,3.4,'gob',1.5));
    P.push(E(26,27+b,13,12,'can',2));[20,26,32].forEach(x=>P.push(Cp({x,y:16+b},{x,y:38},.6,.6,null,2.1,{col:hex('#5e0c16'),noline:1})));
    [22,29].forEach(y=>P.push(Cp({x:14,y:y+b},{x:38,y:y+b},.6,.6,null,2.1,{col:hex('#5e0c16'),noline:1})));
    P.push(E(24,10+b,7.5,7,'gob',3));P.push(E(22,15+b,5.5,3.6,'bark',3.1));P.push(Pg([[16,6+b],[18,1+b],[30,1+b],[32,6+b]],'gold',3.2));
    eyesL(P,19,9+b,3.3,YEL);
    P.push(Cp({x:15,y:21+b},{x:10,y:28},3.6,3.2,'gob',3.5));
    P.push(Pg([[6,25],[15,25],[15,32],[6,32]],'vest',3.6));P.push(Pg([[-2,26.5],[7,26.5],[7,30.5],[-2,30.5]],'metal',3.55));
    for(let i=0;i<4;i++)P.push(Pg([[-2+i*2.2,26.5],[-1+i*2.2,24.6],[0+i*2.2,26.5]],null,3.56,{col:DK}));return P},
  stump(t){const P=[],b=Math.round(Math.sin(t)*1);
    P.push(Cp({x:16,y:40},{x:12,y:44},1.6,1.2,'bark',1));P.push(Cp({x:32,y:40},{x:36,y:44},1.6,1.2,'bark',1));
    P.push(Cp({x:24,y:22+b},{x:24,y:39},9.5,10,'bark',2));
    P.push(E(24,15+b,9.4,3.6,'ring',2.5));P.push(E(24,15+b,4.5,1.6,null,2.6,{col:hex('#b8864c')}));
    P.push(Cp({x:15,y:27+b},{x:8,y:20+b+Math.sin(t)*1.5},1.7,1.2,'bark',3));P.push(E(7,19+b,3,2.4,'leaf',3.1));
    eyesL(P,17,25+b,3,YEL);P.push(Pg([[17,32+b],[20,30+b],[23,32+b],[26,30+b],[27,33+b],[17,34+b]],null,3.1,{col:BLACK}));return P},
};
function xf(P,s,dx,dy){P.forEach(p=>{if(p.k==='e'){p.x=p.x*s+dx;p.y=p.y*s+dy;p.rx*=s;p.ry*=s}else if(p.k==='c'){p.x1=p.x1*s+dx;p.y1=p.y1*s+dy;p.x2=p.x2*s+dx;p.y2=p.y2*s+dy;p.r1*=s;p.r2*=s}else p.pts=p.pts.map(([x,y])=>[x*s+dx,y*s+dy])});return P}
function crown(P,x,y,s){P.push(Pg([[x-7*s,y],[x-8*s,y-7*s],[x-4*s,y-3*s],[x,y-9*s],[x+4*s,y-3*s],[x+8*s,y-7*s],[x+7*s,y]],'gold',9));P.push(E(x,y-3*s,1.4*s,1.4*s,null,9.1,{col:RED2}))}
const MOBNAME={jelly:'비닐 해파리',crab:'캔 게',oil:'기름 슬라임',bottle:'페트병 병정',gull:'비닐 갈매기',octo:'기름 문어',hermit:'고철 소라게',golem:'쓰레기산 골렘',
  stump:'성난 그루터기',saw:'톱날 고블린',shroom:'독버섯',mole:'굴착 두더지',ember:'불씨 정령',boar:'불도저 멧돼지',beaver:'톱니 비버',ogre:'전기톱 벌목왕'};
const FLY={jelly:12,gull:16,ember:12};
const SPR={};
function mobFrames(type,s){
  const key=type+s;if(SPR[key])return SPR[key];
  const w=Math.ceil(60*s),h=Math.ceil(64*s),dx=(w-48*s)/2,dy=h-48*s;
  const fr=[0,1,2,3].map(i=>raster(xf(MOBS[type](i/4*Math.PI*2),s,dx,dy),w,h));
  return SPR[key]={fr,w,h,ax:Math.round(w/2),ay:Math.round(44*s+dy),s};
}
/* ---------- backgrounds: pre-painted pixel layers that scroll ---------- */
const VW=180,VH=150,GYv=128;
const B4=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
function pcan(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');const img=x.createImageData(w,h);
  const put=(px,py,col,a)=>{if(px<0||py<0||px>=w||py>=h)return;const k=(py*w+px)*4;img.data[k]=col[0];img.data[k+1]=col[1];img.data[k+2]=col[2];img.data[k+3]=a==null?255:a};
  fn(put,w,h);x.putImageData(img,0,0);return c}
function grad(put,w,y0,y1,cols){const C=cols.map(hex);for(let y=y0;y<y1;y++)for(let x=0;x<w;x++){const f=Math.min(C.length-1.001,(y-y0)/(y1-y0)*(C.length-1));const i=Math.floor(f);put(x,y,C[(f-i)*16>B4[y%4][x%4]?i+1:i])}}
function disc(put,cx,cy,r,col){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r)put(cx+x,cy+y,col)}
function cloudP(put,x,y,c1,c2){[[0,0,6],[6,-3,6],[12,0,5],[5,2,6]].forEach(([a,b,r])=>disc(put,x+a,y+b,r,c1));for(let i=-4;i<18;i++)put(x+i,y+6,c2)}
const THEMES=[
 {name:'쓰레기 해변',mobs:['jelly','crab','oil','bottle','gull'],mids:['octo','hermit'],fin:'golem',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#3e9ee6','#5cb8f0','#8fd0f6','#c6ebff']);disc(put,140,28,10,hex('#fff7c2'));
    for(let a=0;a<40;a++){const ang=a/40*Math.PI*2;put(140+Math.round(Math.cos(ang)*14),28+Math.round(Math.sin(ang)*14),hex('#fff2b0'))}}),
  far:()=>pcan(360,VH,(put)=>{const W2=hex('#ffffff'),S2=hex('#d6ecfb');[[20,30],[110,18],[200,36],[290,22]].forEach(([x,y])=>cloudP(put,x,y,W2,S2));
    const isl=hex('#5f9cc2');for(let x=0;x<360;x++){const h=Math.round(92-Math.max(0,Math.sin(x*.03)*10+Math.sin(x*.011)*6));for(let y=h;y<96;y++)put(x,y,isl)}}),
  mid:()=>pcan(VW,VH,(put)=>{grad(put,VW,96,112,['#2f8fd0','#1f74b4']);const fo=hex('#e8f6ff');for(let x=0;x<VW;x++)for(let y=112;y<116;y++)put(x,y,hex('#f2d58f'));
    for(let x=0;x<VW;x++)if((x*7)%11<5)put(x,111,fo)}),
  ground:()=>pcan(VW,VH,(put)=>{grad(put,VW,114,VH,['#f6d995','#ecc576','#d8a95a']);const d=hex('#c99a52'),l=hex('#fff0c4');
    for(let i=0;i<30;i++){const x=(i*37)%VW,y=GYv+4+(i*13)%18;put(x,y,d);put(x+1,y,d);put(x,y-1,l)}}),
  props:()=>pcan(360,VH,(put)=>{for(let i=0;i<6;i++){const x=20+i*60+(i*17)%25,y=118;const k=i%3;
    if(k===0){for(let yy=0;yy<8;yy++)for(let xx=0;xx<3;xx++)put(x+xx+Math.floor(yy/3),y-yy,hex(yy<2?'#ff5c7f':'#9fd6e6'))}
    else if(k===1){for(let a=0;a<24;a++){const an=a/24*Math.PI*2;put(x+Math.round(Math.cos(an)*5),y-3+Math.round(Math.sin(an)*2.5),hex('#3a3440'))}}
    else{for(let yy=0;yy<5;yy++)for(let xx=0;xx<4;xx++)put(x+xx,y-yy,hex(yy===2?'#ffffff':'#e8343f'))}}})},
 {name:'베어진 숲',mobs:['stump','saw','shroom','mole','ember'],mids:['boar','beaver'],fin:'ogre',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#8fc0b0','#a9d2c0','#cfe4cf','#e9f0d8']);disc(put,40,30,9,hex('#f6f2d8'))}),
  far:()=>pcan(360,VH,(put)=>{const c1=hex('#7aa88e'),c2=hex('#5e8f72');for(let i=0;i<30;i++){const x=i*12,h=24+(i*7)%16;for(let y=0;y<h;y++){const hw=Math.floor(y/3);for(let xx=-hw;xx<=hw;xx++)put(x+xx,100-h+y,c1)}}
    for(let i=0;i<24;i++){const x=6+i*15,h=30+(i*11)%14;for(let y=0;y<h;y++){const hw=Math.floor(y/2.6);for(let xx=-hw;xx<=hw;xx++)put(x+xx,108-h+y,c2)}}}),
  mid:()=>pcan(VW,VH,(put)=>{grad(put,VW,104,116,['#4f8461','#41704f'])}),
  ground:()=>pcan(VW,VH,(put)=>{grad(put,VW,114,VH,['#78bf5a','#5ea548','#4c8a3a']);const p=hex('#a37b4c'),p2=hex('#8a6438');
    for(let y=GYv-3;y<GYv+5;y++)for(let x=0;x<VW;x++)put(x,y,(x+y)%9===0?p2:p);const g=hex('#9ad874');for(let i=0;i<40;i++){const x=(i*29)%VW,y=GYv+8+(i*7)%14;put(x,y,g);put(x,y-1,g)}}),
  props:()=>pcan(360,VH,(put)=>{for(let i=0;i<5;i++){const x=24+i*72+(i*13)%20,y=118;const b=hex('#80532a'),t=hex('#e8c48a'),o=hex('#2a1a10');
    for(let yy=0;yy<6;yy++)for(let xx=-5;xx<=5;xx++)put(x+xx,y-yy,Math.abs(xx)===5?o:b);for(let xx=-5;xx<=5;xx++)put(x+xx,y-6,t);put(x,y-6,hex('#b8864c'))}})},
];
const BGC={};
function bgOf(i){const th=THEMES[i%THEMES.length];if(!BGC[i%THEMES.length]){const o={};['sky','far','mid','ground','props'].forEach(k=>{if(th[k])o[k]=th[k]()});BGC[i%THEMES.length]=o}return BGC[i%THEMES.length]}
function drawBG(L,i,scroll,t){const b=bgOf(i);L.drawImage(b.sky,0,0);
  const fo=Math.floor(scroll*.15)%360;L.drawImage(b.far,-fo,0);L.drawImage(b.far,360-fo,0);
  L.drawImage(b.mid,0,0);
  if(THEMES[i%THEMES.length].anim)THEMES[i%THEMES.length].anim(L,scroll,t);
  if(i%THEMES.length===0){L.fillStyle='rgba(255,255,255,.55)';const wo=Math.floor(scroll*.3+t*8)%30;for(let k=-1;k<8;k++){L.fillRect(k*30-wo+((k*7)%10),100+(k%3)*4,5,1)}}
  const go=Math.floor(scroll)%VW;L.drawImage(b.ground,-go,0);L.drawImage(b.ground,VW-go,0);
  const po=Math.floor(scroll*.8)%360;L.drawImage(b.props,-po,0);L.drawImage(b.props,360-po,0);
}

/* ---------- pixel icons for the panel ---------- */
function iconPrims(k,arg){const P=[];
  if(k==='atk'||k==='wpn'){const save=WRAMP;WRAMP=arg!=null?['plank','plank1','plank2','plank3','plank4'][arg]:'plank';P.push(Cp({x:4,y:20},{x:20,y:4},2.6,2.8,WRAMP,1));WRAMP=save}
  else if(k==='hp'||k==='regen'){P.push(E(9,10,4.6,4.6,'can',1,{g:1}));P.push(E(15,10,4.6,4.6,'can',1,{g:1}));P.push(Pg([[4.8,12],[19.2,12],[12,20]],'can',1,{g:1}));
    if(k==='regen'){P.push(Cp({x:18,y:14},{x:18,y:22},1.4,1.4,'leaf',2));P.push(Cp({x:14,y:18},{x:22,y:18},1.4,1.4,'leaf',2))}}
  else if(k==='crit'||k==='critd'){const st=(cx,cy,r,z)=>{const pts=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,rr=i%2?r*.45:r;pts.push([cx+Math.cos(a)*rr,cy+Math.sin(a)*rr])}P.push(Pg(pts,'gold',z))};
    if(k==='crit')st(12,13,10,1);else{st(9,15,7,1);st(16,8,6,2)}}
  else if(k==='aspd')P.push(Pg([[14,2],[5,13],[11,13],[8,22],[19,9],[13,9]],'gold',1));
  else if(k==='turtle'){P.push(E(10,15,7,5.5,'leaf',1));P.push(E(18,13,3.4,3.4,'leaf',1.2,{bias:.5}));P.push(E(19,12,.7,.8,null,1.3,{col:BLACK}))}
  else if(k==='lock'){P.push(Pg([[6,11],[18,11],[18,21],[6,21]],'metal',1));P.push(Cp({x:8,y:11},{x:8,y:6},1.2,1.2,'metal',.5));P.push(Cp({x:16,y:11},{x:16,y:6},1.2,1.2,'metal',.5));P.push(Cp({x:8,y:5},{x:16,y:5},1.2,1.2,'metal',.5))}
  else if(k==='gem')P.push(Pg([[12,3],[20,11],[12,21],[4,11]],'scarf',1));
  return P}
function icon(cv,k,arg){const c=raster(iconPrims(k,arg),24,24);const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);x.drawImage(c,0,0,cv.width,cv.height)}
</script>
<script>
/* ---------- items: grades C..H, weapons change the attack motion ---------- */
const GRADES=['C','B','A','S','SS','SSS','H'];
const GCOL=['#9aa0a6','#5ccf6a','#ffd23a','#ff4d5e','#b06cff','#ff5ad8','#7cf0ff'];
const GMUL=[1,2.5,6,15,40,100,300];
const ITEMS={
 plank:{c:'w',g:0,n:'나무판자',w:{kind:'blunt',ramp:'plank',len:25,r:2.6}},
 umbrella:{c:'w',g:0,n:'부러진 우산',w:{kind:'blunt',ramp:'umb',len:22,r:2.2}},
 mop:{c:'w',g:0,n:'대걸레',w:{kind:'blunt',ramp:'plank',len:24,r:1.6,head:'mop'}},
 pipe:{c:'w',g:0,n:'녹슨 파이프',w:{kind:'blunt',ramp:'rust',len:24,r:2}},
 toyham:{c:'w',g:0,n:'뿅망치',w:{kind:'blunt',ramp:'gold',len:18,r:1.6,head:'toy'}},
 pebble:{c:'w',g:0,n:'조약돌',w:{kind:'star',pebble:1}},
 nailed:{c:'w',g:1,n:'못 박은 판자',w:{kind:'blunt',ramp:'plank1',len:25,r:2.8}},
 bat:{c:'w',g:1,n:'야구 배트',w:{kind:'blunt',ramp:'bat',len:26,r:2.2,taper:1}},
 salmon:{c:'w',g:1,n:'냉동 연어',w:{kind:'blunt',ramp:'fishr',len:12,r:1.4,head:'fish'}},
 pan:{c:'w',g:1,n:'프라이팬',w:{kind:'blunt',ramp:'gunm',len:14,r:1.4,head:'pan'}},
 shovel:{c:'w',g:1,n:'삽',w:{kind:'blunt',ramp:'plank',len:22,r:1.5,head:'shovel'}},
 rstar:{c:'w',g:1,n:'녹슨 표창',w:{kind:'star'}},
 balloon:{c:'w',g:1,n:'물풍선',w:{kind:'star',balloon:1}},
 surf:{c:'w',g:2,n:'서핑보드',w:{kind:'blunt',ramp:'plank2',len:27,r:3.4}},
 crowbar:{c:'w',g:2,n:'빠루',w:{kind:'blunt',ramp:'can',len:24,r:1.6,head:'hook'}},
 hockey:{c:'w',g:2,n:'하키 스틱',w:{kind:'blunt',ramp:'umb',len:24,r:1.5,head:'blade'}},
 watergun:{c:'w',g:2,n:'물총',w:{kind:'gun',ramp:'gunb'}},
 shuriken:{c:'w',g:2,n:'수리검',w:{kind:'star'}},
 primer:{c:'w',g:2,n:'마법 입문서',w:{kind:'book',ramp:'bookB',fx:'orb'}},
 rebar:{c:'w',g:3,n:'송전탑 철근',w:{kind:'blunt',ramp:'plank3',len:28,r:2.2}},
 fireaxe:{c:'w',g:3,n:'소방 도끼',w:{kind:'blunt',ramp:'can',len:22,r:1.6,head:'axe'}},
 sledge:{c:'w',g:3,n:'오함마',w:{kind:'blunt',ramp:'plank',len:24,r:1.6,head:'hammer'}},
 shotgun:{c:'w',g:3,n:'산탄총',w:{kind:'gun',ramp:'bat',spread:3}},
 ninja:{c:'w',g:3,n:'닌자 표창',w:{kind:'star'}},
 oldbook:{c:'w',g:3,n:'낡은 마법서',w:{kind:'book',ramp:'bookR',fx:'orb'}},
 goldp:{c:'w',g:4,n:'황금 판자',w:{kind:'blunt',ramp:'plank4',len:26,r:2.8}},
 katana:{c:'w',g:4,n:'네온 카타나',w:{kind:'blunt',ramp:'neon',len:30,r:1.3}},
 revolver:{c:'w',g:4,n:'리볼버',w:{kind:'gun',ramp:'gunm'}},
 kunai:{c:'w',g:4,n:'쿠나이 다발',w:{kind:'star',big:1}},
 icebook:{c:'w',g:4,n:'얼음 마법서',w:{kind:'book',ramp:'bookB',fx:'ice'}},
 rainbow:{c:'w',g:5,n:'무지개 판자',w:{kind:'blunt',ramp:'rainbow',len:27,r:3}},
 lava:{c:'w',g:5,n:'용암 대검',w:{kind:'blunt',ramp:'lava',len:31,r:3.4}},
 railgun:{c:'w',g:5,n:'레일건',w:{kind:'gun',ramp:'gunb',big:1,rail:1}},
 hstar:{c:'w',g:5,n:'풍마 수리검',w:{kind:'star',big:1}},
 firebook:{c:'w',g:5,n:'불꽃 마법서',w:{kind:'book',ramp:'lava',fx:'fire'}},
 mg:{c:'w',g:6,n:'기관총',w:{kind:'gun',ramp:'gunm',big:1}},
 grimoire:{c:'w',g:6,n:'고대 마도서',w:{kind:'book',ramp:'bookG',fx:'bolt'}},
 glacier:{c:'w',g:6,n:'빙하 대검',w:{kind:'blunt',ramp:'ice',len:32,r:3.6}},
 holy:{c:'w',g:6,n:'백곰왕의 성스러운 판자',w:{kind:'blunt',ramp:'holy',len:30,r:3.2}},
 spine1:{c:'a',up:1,g:3,n:'임플란트(척수 변형)',hp:0},spine2:{c:'a',up:1,g:4,n:'강화 척수 변형',hp:.2},spine3:{c:'a',up:1,g:5,n:'티타늄 척수',hp:.4},
 chip:{c:'a',g:0,n:'반사 신경 칩',spd:.05},accel:{c:'a',g:2,n:'신경 가속기',spd:.18},os:{c:'a',g:4,n:'전투 OS',spd:.45},sande:{c:'a',g:6,n:'임플란트(산데비스탄)',spd:1},
 scarf:{c:'a',g:1,n:'파란 목도리',hp:.05,scarfItem:1},
 seaweed:{c:'c',g:1,n:'미역 닌자',cos:'seaweed'},swim:{c:'c',g:2,n:'오리 튜브 수영복',cos:'swim'},pirate:{c:'c',g:3,n:'해적 선장',cos:'pirate'},ghillie:{c:'c',g:4,n:'길리슈트',cos:'ghillie'},
};
COS_HP={seaweed:.1,swim:.2,pirate:.35,ghillie:.5};
function itemPrims(id){const it=ITEMS[id],P=[];
  if(it.c==='w'){const w=it.w;
    if(w.kind==='blunt'){const L=w.head==='fish'?4:w.head?9:16;const tip={x:4+L,y:20-L};P.push(Cp({x:4,y:20},tip,Math.min(3,w.r),Math.min(3.2,w.r+(w.taper?.9:.2)),w.ramp,1));if(w.head)headPrims(P,tip,{x:.707,y:-.707},w.head,2,w.ramp)}
    else if(w.kind==='gun'){P.push(Cp({x:3,y:10},{x:w.big?21:17,y:10},w.big?3:2.4,w.big?3:2.4,w.ramp,2));P.push(Cp({x:7,y:11},{x:5,y:19},1.8,1.6,'gunm',1));if(w.big)P.push(E(12,14,3.4,3.4,'gunm',1.5))}
    else if(w.kind==='star'&&(w.pebble||w.balloon)){P.push(E(12,12,w.balloon?7:5,w.balloon?7.5:4.4,w.balloon?'gunb':'metal',1));if(w.balloon)P.push(E(12,4.5,1.6,1.2,'gunb',1.1))}
    else if(w.kind==='star'){const pts=[];for(let i=0;i<8;i++){const a=i*Math.PI/4+.3,r=i%2?2.6:(w.big?10:8.5);pts.push([12+Math.cos(a)*r,12+Math.sin(a)*r])}P.push(Pg(pts,'metal',1));P.push(E(12,12,1.4,1.4,null,2,{col:DK}))}
    else{P.push(Pg([[4,5],[20,5],[20,19],[4,19]],w.ramp,1));P.push(Cp({x:12,y:6},{x:12,y:18},.6,.6,null,2,{col:hex('#2a1a10')}));P.push(Cp({x:6,y:9},{x:10,y:9},.6,.6,null,2,{col:hex('#fff4d8')}));P.push(Cp({x:14,y:9},{x:18,y:9},.6,.6,null,2,{col:hex('#fff4d8')}))}}
  else if(it.c==='a'&&it.scarfItem){P.push(Cp({x:3,y:9},{x:21,y:9},3.4,3.4,'scarf',2));P.push(Cp({x:6,y:10},{x:4,y:21},2.6,2,'scarf',1));P.push(Cp({x:9,y:10},{x:10,y:20},2.4,1.8,'scarf',1))}
  else if(it.c==='a'&&it.up){[5,10,15,20].forEach(y=>{P.push(E(12,y,5,2.4,'cyber',1));P.push(E(12,y,1.4,1,null,2,{col:hex(it.g>=4?'#5ff4ff':'#9fe08a')}))})}
  else if(it.c==='a'){P.push(Pg([[5,6],[19,6],[19,18],[5,18]],'cyber',1));[8,12,16].forEach(x=>{P.push(Cp({x,y:3},{x,y:6},.6,.6,null,.5,{col:hex('#8b93a8')}));P.push(Cp({x,y:18},{x,y:21},.6,.6,null,.5,{col:hex('#8b93a8')}))});
    P.push(E(12,12,3.2,3.2,null,2,{col:hex(it.g>=6?'#5fffc0':it.g>=3?'#ff3040':'#9fe08a')}))}
  else{const k=it.cos;
    if(typeof COSICON!=='undefined'&&COSICON[k])COSICON[k](P);
    if(k==='swim'){P.push(E(12,14,10,5,'gold',1));P.push(E(12,14,5.5,2,null,1.1,{col:hex('#5a8ab0')}));P.push(E(19,8,3.6,3.4,'gold',2));P.push(Pg([[21.5,7.5],[24,8.5],[21.5,9.5]],null,2.1,{col:hex('#ff8a1a')}));P.push(E(19.5,7,.7,.7,null,2.2,{col:BLACK}))}
    if(k==='seaweed'){P.push(Cp({x:3,y:8},{x:21,y:8},2.6,2.6,'weed',2));P.push(E(5,9,2.6,2.6,'weed',2.1));P.push(Cp({x:5,y:10},{x:3,y:22},1.8,1,'weed',1));P.push(Cp({x:6,y:10},{x:10,y:21},1.6,.9,'weed',1));P.push(Pg([[12,12],[22,13],[19,22],[14,20]],'weed',.5))}
    if(k==='ghillie')for(let i=0;i<9;i++)P.push(E(5+(i%3)*7,6+Math.floor(i/3)*6,3.2,2.2,'ghil',1,{a:i}));
    if(k==='pirate'){P.push(Pg([[2,16],[6,6],[18,5],[22,15],[12,13]],'pir',1));P.push(E(12,10,1.8,1.6,null,2,{col:WHITE}))}}
  return P}
function itemIcon(cv,id){const c=raster(itemPrims(id),24,24);const x=cv.getContext('2d');x.imageSmoothingEnabled=false;x.clearRect(0,0,cv.width,cv.height);x.drawImage(c,0,0,cv.width,cv.height)}
/* ================= costumes v2 (20 total) ================= */
R('straw',['#7a5418','#b8862e','#e2b85a','#fbe2a0']);R('red',['#6a0c14','#b01c28','#e8444a','#ff9a9a']);R('rainc',['#8a6200','#d8a600','#ffd23a','#fff2a0']);
R('shark',['#2e3c4e','#566a84','#8aa0bc','#c4d4e6']);R('cloth',['#9aa4b2','#cfd6de','#eef2f6','#ffffff']);R('pad',['#0e0f16','#1e2130','#353a50','#5a6080']);
R('parka',['#7a2a08','#c8501a','#f2843a','#ffc08a']);R('canvas',['#4a3a24','#7a6440','#a89060','#d6c08e']);R('aurw',['#0a5a6e','#1aa0a8','#5ae8c8','#d8fff2']);
R('lgreen',['#24482a','#3e7044','#64a066','#a0d49a']);
const C_RED=hex('#e8444a'),C_YEL=hex('#ffd23a'),C_GOLD=hex('#f0b020');R('pirc',['#0c1226','#1a2650','#2e4280','#5a72b8']);
function torso(c,r,z,o){const A=Math.atan2(c.d.y,c.d.x),q=c.at(12+(o&&o.k||0),(o&&o.m)||0);c.P.push(E(q.x,q.y,14.4*(r||1),11.9*(r||1),o&&o.ramp||'cloth',z||5.3,{a:A,g:40}))}
function sleeve(c,ramp,k,lk){c.P.push(Cp(c.S,{x:c.S.x+(c.paw.x-c.S.x)*(k||.6),y:c.S.y+(c.paw.y-c.S.y)*(k||.6)},5.5,4.6,ramp,9.1,{g:41,jx:c.S.x,jy:c.S.y,jr:7}));
  const L=lk||.45;c.P.push(Cp(c.lf0,{x:c.lf0.x+(c.lfe.x-c.lf0.x)*L,y:c.lf0.y+(c.lfe.y-c.lf0.y)*L},5.9,5.1,ramp,8.05,{g:42,jx:c.lf0.x,jy:c.lf0.y,jr:7.5}))}
function skirt(c,ramp,hang,flare,z,trim){const A=Math.atan2(c.d.y,c.d.x),ce=c.at(10,0),pts=[];for(let i=0;i<32;i++){const a=i/32*Math.PI*2,x=Math.cos(a)*14.6,y=Math.sin(a)*12.1;pts.push({x:ce.x+x*Math.cos(A)-y*Math.sin(A),y:ce.y+x*Math.sin(A)+y*Math.cos(A)})}
  if(c.p.ba>=45)return;const low=pts.filter(q=>q.y>=ce.y-1);const xs=low.map(q=>q.x),x0=Math.min(...xs),x1=Math.max(...xs),ly=Math.max(...pts.map(q=>q.y));const up=c.p.ba<45;
  const hem=up?Math.max(ly+2,Math.min(c.lfe.y-2.5,ly+hang)):ly+Math.min(hang,5);const fl=c.p.fl||0,f=flare||4;
  const poly=[[x1,ce.y],[x1+f+fl*.3,hem],[(x0+x1)/2,hem+1.5],[x0-f-fl*.3,hem],[x0,ce.y]];c.P.push(Pg(poly,ramp,z||8.4,{g:45}));
  if(trim)c.P.push(Cp({x:x0-f+.6,y:hem-.6},{x:x1+f-.6,y:hem-.6},.9,.9,null,(z||8.4)+.01,{col:trim,noline:1}))}
function hood(c,ramp,r,z){c.Ph(E(c.hc.x-1,c.hc.y-2,(r||12.6),(r||12.6)*.97,ramp,z||7.4,{g:43}))}
const H=(c,x,y)=>c.hr(x,y),HP=(c,pts)=>pts.map(([x,y])=>{const q=c.hr(x,y);return[q.x,q.y]});
const COSDRAW={
 straw(c){c.Ph(E(H(c,0,-9.5).x,H(c,0,-9.5).y,13.5,2.6,'straw',8.1,{a:c.ha,g:50}));const t=H(c,-1,-13);c.Ph(E(t.x,t.y,7,4.2,'straw',8.15,{a:c.ha,g:50}));c.Ph(Cp(H(c,-7.5,-10.6),H(c,5.5,-11.2),1.1,1.1,null,8.2,{col:C_RED}))},
 bandana(c){c.Ph(Pg(HP(c,[[-10.5,-2],[-8,-9],[-2,-11.6],[5,-10.6],[9.5,-6],[6.5,-5],[0,-6.5],[-6,-3.5]]),'red',8.05,{g:51}));
  const k=H(c,-11,-2.5);c.Ph(E(k.x,k.y,2,1.8,'red',8.06,{g:51}));const fl=c.p.fl||0;c.Ph(Cp(k,{x:k.x-6,y:k.y+3+fl},1.4,.9,'red',4.6,{g:51}));c.Ph(Cp(k,{x:k.x-4,y:k.y+6-fl},1.3,.8,'red',4.6,{g:51}));
  [[-4,-8],[2,-9],[-7,-5],[5,-7.5]].forEach(([x,y])=>{const q=H(c,x,y);c.Ph(E(q.x,q.y,.7,.7,null,8.07,{col:WHITE,noline:1}))})},
 raincoat(c){torso(c,1.02,5.3,{ramp:'rainc'});hood(c,'rainc');sleeve(c,'rainc');[6,11,16].forEach(k=>{const q=c.at(k,7);c.P.push(E(q.x,q.y,.9,.9,null,5.4,{col:hex('#8a6200')}))})},
 shark(c){torso(c,1.02,5.3,{ramp:'shark'});hood(c,'shark',12.8);sleeve(c,'shark');c.Ph(Pg(HP(c,[[-6,-11.5],[-5,-20],[2,-12]]),'shark',8.2,{g:44}));
  [[-2,-10.4],[4,-9.6]].forEach(([x,y])=>{const q=H(c,x,y);c.Ph(E(q.x,q.y,1,1.1,null,8.21,{col:BLACK}))});
  for(let i=0;i<5;i++){const q=H(c,7+i*.8,-8+i*3);c.Ph(Pg([[q.x-1,q.y],[q.x+1.6,q.y+.6],[q.x-.6,q.y+1.6]],null,7.45,{col:WHITE}))}
  const tl=c.at(1,-6);c.P.push(Pg([[tl.x,tl.y],[tl.x-8,tl.y-5],[tl.x-6,tl.y+3]],'shark',4.2))},
 chef(c){const b=H(c,0,-11.5);c.Ph(E(b.x,b.y,7,2.4,'cloth',8.1,{a:c.ha,g:52}));const t=H(c,-.5,-17);c.Ph(E(t.x,t.y,8,6.2,'cloth',8.12,{g:52}));
  const A=Math.atan2(c.d.y,c.d.x),q=c.at(9,6);c.P.push(E(q.x,q.y,9.5,6,'cloth',5.4,{a:A,g:53}));const nk=c.at(23,4);c.P.push(Cp(nk,q,.6,.6,null,5.45,{col:hex('#cfd6de')}));
  const r1=H(c,1,8),r2=H(c,6,9);c.Ph(Pg([[r1.x,r1.y],[r2.x,r2.y],[(r1.x+r2.x)/2,r1.y+4]],null,7.9,{col:C_RED}))},
 padding(c){torso(c,1.06,5.3,{ramp:'pad',k:-1});sleeve(c,'pad',.7);c.P.push(Cp(c.ab0||c.S,c.S,4.8,4.8,'pad',2.1));
  [4,10,16].forEach(k=>c.P.push(Cp(c.at(k,-12.3),c.at(k,12.3),.5,.5,null,5.35,{col:hex('#4a5070'),noline:1})));
  const n1=c.at(24,-9),n2=c.at(24,8);c.P.push(Cp(n1,n2,3.2,3.2,'pad',6.3))},
 lifeguard(c){torso(c,.92,5.3,{ramp:'red',k:1});const ch=c.at(15,4);c.P.push(Cp({x:ch.x-2.5,y:ch.y},{x:ch.x+2.5,y:ch.y},.9,.9,null,5.4,{col:WHITE,noline:1}));c.P.push(Cp({x:ch.x,y:ch.y-2.5},{x:ch.x,y:ch.y+2.5},.9,.9,null,5.4,{col:WHITE,noline:1}));
  const b=H(c,-1,-8.5);c.Ph(E(b.x,b.y,10,4.4,'red',8.1,{a:c.ha,g:54}));c.Ph(Cp(H(c,5,-8.2),H(c,13,-7),1.3,.9,'red',8.15,{g:54}));
  const w=c.at(22,7);c.P.push(E(w.x,w.y,1.5,1.1,'gold',6.4))},
 santa(c){torso(c,1.02,5.3,{ramp:'red'});sleeve(c,'red');const A=c.at(7,-12.5),B=c.at(7,12.5);c.P.push(Cp(A,B,1.6,1.6,null,5.4,{col:hex('#2a1a10')}));
  const bk=c.at(7,7);c.P.push(E(bk.x,bk.y,1.8,1.5,'gold',5.45));c.Ph(Pg(HP(c,[[-9.5,-8],[9,-9.5],[-4,-19],[-10,-21]]),'red',8.1,{g:55}));
  c.Ph(Cp(H(c,-9.5,-8.6),H(c,9,-9.8),2.3,2.3,'cloth',8.2,{g:56}));const pp=H(c,-11,-21);c.Ph(E(pp.x,pp.y,2.5,2.5,'cloth',8.21,{g:56}))},
 diver(c){torso(c,1.02,5.3,{ramp:'canvas'});sleeve(c,'canvas');c.Ph(E(c.hc.x+1,c.hc.y-1.5,13.8,13.4,'gold',7.4,{g:57}));
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,q={x:c.hc.x+1+Math.cos(a)*12.6*1.05,y:c.hc.y-1.5+Math.sin(a)*12.2*1.05};c.P.push(E(q.x,q.y,.8,.8,null,7.42,{col:hex('#6a3a00')}))}
  const col=c.at(23,0);c.P.push(Cp(c.at(23,-10),c.at(23,9),3.4,3.4,'gold',6.35));const hz=c.at(20,-12);c.P.push(Cp(hz,c.at(6,-15),1.2,1.2,'pad',4.5))},
 knight(c){torso(c,.98,5.3,{ramp:'metal'});sleeve(c,'metal',.55,.95);c.P.push(Cp(c.lb0,c.lbe,5.2,4.3,'metal',2.05,{jx:c.lb0.x,jy:c.lb0.y,jr:6.5}));[c.lfe,c.lbe].forEach((q,i)=>{const kn={x:(i?c.lb0:c.lf0).x*.45+q.x*.55,y:(i?c.lb0:c.lf0).y*.45+q.y*.55};c.P.push(E(kn.x+1,kn.y,2.4,2,'metal',i?2.06:8.1))});c.Ph(E(H(c,-1,-5).x,H(c,-1,-5).y,11.6,8.8,'metal',8.1,{a:c.ha,g:58}));c.Ph(Cp(H(c,2,-2.6),H(c,11,-2.2),.75,.75,null,8.2,{col:BLACK}));
  c.Ph(Cp(H(c,-1,-13),H(c,-8,-17),1.8,1.4,'red',8.05));c.Ph(Cp(H(c,-8,-17),H(c,-14,-14),1.4,1,'red',8.05));c.P.push(E(c.S.x,c.S.y,5.6,4.6,'metal',9.2));
  [5,12,18].forEach(k=>{const q=c.at(k,9);c.P.push(E(q.x,q.y,.8,.8,null,5.4,{col:hex('#5f6676')}))})},
 pirate(c){torso(c,1.03,5.3,{ramp:'pirc'});sleeve(c,'pirc',.8,.5);skirt(c,'pirc',12,3,8.35,C_GOLD);const A=c.at(9,-12.6),B=c.at(9,12.6);c.P.push(Cp(A,B,1.5,1.5,null,5.4,{col:hex('#c0202c')}));[[13,7],[17,7],[21,7]].forEach(([k,m])=>{const q=c.at(k,m);c.P.push(E(q.x,q.y,.9,.9,null,5.45,{col:C_GOLD}))});const ep=c.S;c.P.push(E(ep.x,ep.y-2,4.6,2,'gold',9.25))},
 explorer(c){torso(c,1.04,5.3,{ramp:'parka'});sleeve(c,'parka');c.Ph(E(c.hc.x,c.hc.y-1.5,11.6,11.2,'cloth',7.45,{g:59}));hood(c,'parka',13.4,7.4);
  c.Ph(Cp(H(c,-6,-7.5),H(c,8,-7.4),1,1,null,8.15,{col:BLACK}));const l=H(c,5,-7.6);c.Ph(E(l.x,l.y,2.6,2,'ice',8.2));
  c.P.push(Cp(c.at(1,-6),c.at(1,6),2.4,2.4,'cloth',5.4));const z=c.at(5,7),z2=c.at(21,7);c.P.push(Cp(z,z2,.5,.5,null,5.42,{col:hex('#7a2a08'),noline:1}))},
 astro(c){torso(c,1.04,5.3,{ramp:'cloth'});sleeve(c,'cloth');c.Ph(E(c.hc.x+1,c.hc.y-1.5,14.2,13.8,null,7.3,{col:hex('#a6dcff'),g:60}));
  c.P.push(Cp(c.at(23,-10),c.at(23,9),3.2,3.2,'metal',6.35));const g1=H(c,9,-10),g2=H(c,12,-6);c.Ph(Cp(g1,g2,.9,.9,null,8.3,{col:WHITE,noline:1}));
  const pn=c.at(14,5);c.P.push(Pg([[pn.x-2.5,pn.y-2],[pn.x+2.5,pn.y-2],[pn.x+2.5,pn.y+2],[pn.x-2.5,pn.y+2]],'cyber',5.4));c.P.push(E(pn.x-1,pn.y,.7,.7,null,5.41,{col:C_RED}));c.P.push(E(pn.x+1.2,pn.y,.7,.7,null,5.41,{col:hex('#5fffc0')}))},
 wizard(c){torso(c,1.02,5.3,{ramp:'bookP'});sleeve(c,'bookP',.85,.9);skirt(c,'bookP',30,5,8.4,C_YEL);c.Ph(E(H(c,0,-9.5).x,H(c,0,-9.5).y,13,2.6,'bookP',8.15,{a:c.ha,g:61}));
  c.Ph(Pg(HP(c,[[-8,-10],[7,-11],[-4,-22],[-11,-26]]),'bookP',8.1,{g:61}));[[-3,-15],[2,-12.5],[-6,-20]].forEach(([x,y])=>{const q=H(c,x,y);c.Ph(E(q.x,q.y,.9,.9,null,8.2,{col:C_YEL,noline:1}))});
  [[6,4],[13,-6],[17,6],[9,-3]].forEach(([k,m])=>{const q=c.at(k,m);c.P.push(E(q.x,q.y,.8,.8,null,5.4,{col:C_YEL,noline:1}))})},
 king(c){const fl=c.p.fl||0;c.P.push(Pg([c.at(24,-4),c.at(24,-12),c.at(-3,-19+fl),c.at(-6,-9),c.at(2,-4)].map(q=>[q.x,q.y]),'red',4.4,{g:62}));
  c.P.push(Cp(c.at(23,-11),c.at(23,7),3.4,3.4,'cloth',6.3));[-8,-3,2].forEach(m=>{const q=c.at(23,m);c.P.push(E(q.x,q.y,.6,.8,null,6.35,{col:BLACK,noline:1}))});
  c.Ph(Pg(HP(c,[[-6.5,-9.5],[-7,-15],[-3.5,-12],[0,-17],[3.5,-12],[7,-15],[6.5,-9.5]]),'gold',8.1,{g:63}));const j=H(c,0,-11);c.Ph(E(j.x,j.y,1.2,1.2,null,8.2,{col:C_RED}))},
 mecha(c){torso(c,.96,5.3,{ramp:'cyber'});const core=c.at(14,4);c.P.push(E(core.x,core.y,2.2,2.2,null,5.4,{col:hex('#5ff4ff')}));c.P.push(E(c.S.x,c.S.y,5.8,4.8,'cyber',9.2));
  c.Ph(Cp(H(c,1,-3),H(c,11,-2.4),1.7,1.5,null,8.2,{col:hex('#ff2a4a')}));c.Ph(Cp(H(c,-4,-10),H(c,-7,-17),.6,.6,'metal',8.05));const tp=H(c,-7,-17);c.Ph(E(tp.x,tp.y,1.1,1.1,null,8.06,{col:C_RED}));
  [6,18].forEach(k=>c.P.push(Cp(c.at(k,-12),c.at(k,12),.5,.5,null,5.35,{col:hex('#5ff4ff'),noline:1})))},
 aurora(c){const fl=(c.p.fl||0)+Math.sin((c.p.hoy||0)*4)*3,b=c.at(20,-9);[[0,1,0],[1,.85,5]].forEach(([i,s,o])=>{const X=b.x+o,Y=b.y-o*.6;c.P.push(Pg([[X,Y],[X-2*s,Y-30*s-fl],[X-12*s,Y-32*s-fl*.5],[X-19*s,Y-22*s],[X-21*s,Y-10*s+fl],[X-15*s,Y+2*s],[X-5,Y+3]],'aurw',4.3-i*.05,{g:64+i}));[[-6,-26],[-14,-20],[-17,-8]].forEach(([fx,fy])=>c.P.push(Cp({x:X-3,y:Y},{x:X+fx*s,y:Y+fy*s},.45,.45,null,4.31-i*.05,{col:hex('#d8fff2'),noline:1})))});
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2,a2=(i+1)/10*Math.PI*2,q=H(c,-1+Math.cos(a)*6.5,-18+Math.sin(a)*1.8),q2=H(c,-1+Math.cos(a2)*6.5,-18+Math.sin(a2)*1.8);c.Ph(Cp(q,q2,.75,.75,null,8.3,{col:C_YEL,g:66}))}
  [[4,-6],[12,7],[18,-3]].forEach(([k,m])=>{const q=c.at(k,m);c.P.push(E(q.x,q.y,.7,.7,null,5.4,{col:hex('#d8fff2'),noline:1}))})}
};
const COSICON={
 straw:P=>{P.push(E(12,15,11,3.2,'straw',1));P.push(E(12,11,6.5,5,'straw',2));P.push(Cp({x:6,y:13},{x:18,y:13},1,1,null,2.1,{col:C_RED}))},
 bandana:P=>{P.push(Pg([[3,15],[6,6],[12,4],[18,6],[21,15],[12,12]],'red',1));[[9,8],[14,7],[12,10]].forEach(([x,y])=>P.push(E(x,y,.9,.9,null,1.1,{col:WHITE,noline:1})));P.push(Cp({x:4,y:15},{x:2,y:21},1.4,.8,'red',.9))},
 raincoat:P=>{P.push(E(12,15,8,7,'rainc',1));P.push(E(12,7,6,5,'rainc',2));P.push(E(12,8,3.5,3,null,2.1,{col:hex('#2a2018')}));[13,17].forEach(y=>P.push(E(12,y,.8,.8,null,1.1,{col:hex('#8a6200')})))},
 shark:P=>{P.push(E(12,14,9,7.5,'shark',1));P.push(Pg([[9,8],[11,1],[15,8]],'shark',1.1));[8,16].forEach(x=>P.push(E(x,12,1.1,1.2,null,1.2,{col:BLACK})));for(let i=0;i<5;i++)P.push(Pg([[6+i*3,17],[7.5+i*3,17],[6.8+i*3,19]],null,1.3,{col:WHITE}))},
 chef:P=>{P.push(E(12,16,7,2.4,'cloth',1));P.push(E(12,9,8,6.5,'cloth',2))},
 padding:P=>{P.push(Pg([[6,4],[18,4],[20,22],[4,22]],'pad',1));[9,14,19].forEach(y=>P.push(Cp({x:5,y},{x:19,y},.5,.5,null,1.1,{col:hex('#4a5070'),noline:1})));P.push(Cp({x:7,y:4},{x:17,y:4},2,2,'pad',1.2))},
 lifeguard:P=>{P.push(Pg([[6,5],[18,5],[19,21],[5,21]],'red',1));P.push(Cp({x:9,y:12},{x:15,y:12},1.2,1.2,null,1.1,{col:WHITE,noline:1}));P.push(Cp({x:12,y:9},{x:12,y:15},1.2,1.2,null,1.1,{col:WHITE,noline:1}))},
 santa:P=>{P.push(Pg([[3,17],[20,17],[10,4],[4,3]],'red',1));P.push(Cp({x:3,y:17},{x:20,y:17},2.4,2.4,'cloth',1.1));P.push(E(4,3,2.6,2.6,'cloth',1.2))},
 diver:P=>{P.push(E(12,12,9.5,9.5,'gold',1));P.push(E(13,12,5,5,null,1.1,{col:hex('#a6dcff')}));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.push(E(12+Math.cos(a)*8,12+Math.sin(a)*8,.8,.8,null,1.2,{col:hex('#6a3a00')}))}},
 knight:P=>{P.push(E(12,13,9,8.5,'metal',1));P.push(Cp({x:8,y:13},{x:17,y:13},.8,.8,null,1.1,{col:BLACK}));P.push(Cp({x:12,y:5},{x:5,y:2},1.6,1,'red',.9))},
 explorer:P=>{P.push(E(12,12,10,9.5,'parka',1));P.push(E(12,12,7,6.6,'cloth',1.1));P.push(E(12,12.5,4.5,4.2,null,1.2,{col:hex('#2a2018')}))},
 astro:P=>{P.push(E(12,12,10,10,null,1,{col:hex('#a6dcff')}));P.push(Cp({x:15,y:6},{x:18,y:9},1,1,null,1.1,{col:WHITE,noline:1}));P.push(Cp({x:4,y:19},{x:20,y:19},2.6,2.6,'metal',1.2))},
 wizard:P=>{P.push(Pg([[4,18],[19,18],[9,3],[3,1]],'bookP',1));P.push(E(12,18,10,2.6,'bookP',1.1));[[9,10],[12,14]].forEach(([x,y])=>P.push(E(x,y,1,1,null,1.2,{col:C_YEL,noline:1})))},
 king:P=>{P.push(Pg([[4,17],[3,7],[8,11],[12,4],[16,11],[21,7],[20,17]],'gold',1));P.push(E(12,13,1.6,1.6,null,1.1,{col:C_RED}));P.push(E(6,14,1,1,null,1.1,{col:hex('#5ac8ff')}));P.push(E(18,14,1,1,null,1.1,{col:hex('#5fffc0')}))},
 mecha:P=>{P.push(E(12,12,9,9,'cyber',1));P.push(Cp({x:7,y:11},{x:18,y:11},1.8,1.6,null,1.1,{col:hex('#ff2a4a')}));P.push(Cp({x:7,y:4},{x:5,y:0.5},.6,.6,'metal',.9))},
 aurora:P=>{P.push(Pg([[12,14],[4,2],[1,12],[6,20]],'aurw',1));P.push(Pg([[12,14],[20,2],[23,12],[18,20]],'aurw',1));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.push(E(12+Math.cos(a)*5,5+Math.sin(a)*1.4,.9,.9,null,1.2,{col:C_YEL,noline:1}))}}
};
Object.assign(ITEMS,{
 straw:{c:'c',g:0,n:'밀짚모자',cos:'straw'},bandana:{c:'c',g:0,n:'빨간 두건',cos:'bandana'},
 raincoat:{c:'c',g:1,n:'노란 우비',cos:'raincoat'},shark:{c:'c',g:1,n:'상어 후드',cos:'shark'},chef:{c:'c',g:1,n:'요리사 모자',cos:'chef'},
 padding:{c:'c',g:2,n:'롱패딩',cos:'padding'},lifeguard:{c:'c',g:2,n:'해양 구조대',cos:'lifeguard'},santa:{c:'c',g:2,n:'산타 옷',cos:'santa'},
 diver:{c:'c',g:3,n:'심해 잠수복',cos:'diver'},knight:{c:'c',g:3,n:'기사 갑옷',cos:'knight'},
 explorer:{c:'c',g:4,n:'북극 탐험대 파카',cos:'explorer'},astro:{c:'c',g:4,n:'우주복',cos:'astro'},wizard:{c:'c',g:4,n:'대마법사 로브',cos:'wizard'},
 king:{c:'c',g:5,n:'백곰왕의 왕관',cos:'king'},mecha:{c:'c',g:5,n:'메카 슈트',cos:'mecha'},
 aurora:{c:'c',g:6,n:'오로라 날개옷',cos:'aurora'}});
Object.assign(COS_HP,{straw:.05,bandana:.06,raincoat:.1,shark:.12,chef:.11,padding:.2,lifeguard:.18,santa:.22,diver:.32,knight:.36,explorer:.5,astro:.48,wizard:.45,king:.8,mecha:.75,aurora:1.2});
/* ================= chapters 1~5 monsters v2 ================= */
R('pinkm',['#7a2a3a','#c04a62','#ee7a90','#ffc0cc']);R('sand',['#7a4a18','#b8803a','#e2b060','#fbe2a8']);R('cact',['#163e1a','#2a6a2a','#48a03c','#8ad870']);
R('liz',['#5a3a10','#9a6a20','#d8a040','#f6d070']);R('vult',['#24180f','#45352a','#6e5a48','#9a846e']);R('scorp',['#3a1408','#7a2a10','#c04a1a','#f08a40']);
R('tar',['#06050a','#14101c','#262034','#40385a']);R('drum',['#0c3a5a','#1a5a8a','#2a86c0','#6ac0f0']);R('eel',['#16161e','#2a2a3a','#44445e','#70709a']);
R('smog',['#3a3a42','#5c5c66','#868690','#b6b6c0']);R('cone',['#7a2a00','#d0500a','#ff8a1a','#ffc080']);R('ratf',['#2a262a','#4a444a','#746c74','#a49ca4']);
R('vend',['#5a0a14','#a01a2a','#e03a4a','#ff8a96']);R('brick',['#4a1a10','#8a3420','#c05a38','#e08a60']);R('yel',['#6a4c00','#c09400','#f0cc20','#fff08a']);R('conc',['#2e2e34','#58585e','#8c8c92','#c0c0c6']);
const M_ORG=hex('#ff8a1a'),M_RED=hex('#ff3040'),M_CY=hex('#5ff4ff'),M_W=WHITE;
const tri=(P,a,b,c,ramp,z,o)=>P.push(Pg([a,b,c],ramp,z,o));
Object.assign(MOBS,{
 /* ch1 */
 urchin(t){const P=[],r=t*.5,cols=['#ff5a8a','#5ac8ff','#ffd23a','#7bdc4f','#c88aff'];
   for(let i=0;i<10;i++){const a=r+i/10*Math.PI*2;P.push(Cp({x:24+Math.cos(a)*6,y:33+Math.sin(a)*6},{x:24+Math.cos(a)*15,y:33+Math.sin(a)*14},1,1,null,1,{col:hex(cols[i%5])}))}
   P.push(E(24,33,9.5,9,'pinkm',2));P.push(E(21,29,3,2,null,2.1,{col:hex('#ffd8e0'),noline:1}));eyesL(P,17,32,2.5);P.push(Cp({x:18,y:38},{x:23,y:38.5},.5,.5,null,2.6,{col:BLACK}));return P},
 jellyking(t){const P=[],fy=Math.round(Math.sin(t)*2)-6;
   for(let i=0;i<6;i++){const x=12+i*4.8;P.push(Cp({x,y:30+fy},{x:x+Math.sin(t+i)*2.6,y:40+fy+(i%2)*3},2,1.1,'bag',1.2));P.push(Cp({x:x+Math.sin(t+i)*2.6,y:40+fy+(i%2)*3},{x:x+Math.sin(t*1.3+i)*3.5,y:46},1.1,.6,'bag',1.1))}
   P.push(Cp({x:15,y:14+fy},{x:13,y:5+fy},1.4,1.4,'bag',1.5));P.push(Cp({x:33,y:14+fy},{x:35,y:5+fy},1.4,1.4,'bag',1.5));P.push(Cp({x:13,y:5+fy},{x:35,y:5+fy},1.4,1.4,'bag',1.4));
   P.push(Pg([[7,31+fy],[8,18+fy],[15,10+fy],[33,10+fy],[40,18+fy],[41,31+fy],[36,33+fy],[31,31+fy],[24,34+fy],[17,31+fy],[12,33+fy]],'bag',2));
   P.push(Pg([[26,21+fy],[36,21+fy],[36,26+fy],[26,26+fy]],null,2.5,{col:RED2}));P.push(Cp({x:28,y:23.5+fy},{x:34,y:23.5+fy},.45,.45,null,2.6,{col:WHITE,noline:1}));
   eyesL(P,15,20+fy,3,YEL);P.push(Pg([[14,27+fy],[22,27+fy],[18,30+fy]],null,3.1,{col:DK}));crown(P,24,9+fy,1);return P},
 /* ch3 desert */
 cactus(t){const P=[],b=Math.round(Math.sin(t)*1.5);P.push(Cp({x:30,y:28+b},{x:37,y:28+b},2.6,2.6,'cact',1));P.push(Cp({x:37,y:28+b},{x:37,y:19+b},2.6,2.2,'cact',1));
   P.push(Cp({x:24,y:14+b},{x:24,y:41},7,7.6,'cact',2));[[20,18],[28,22],[21,30],[29,34],[24,26]].forEach(([x,y])=>P.push(E(x,y+b,.6,.6,null,2.1,{col:hex('#f6f2d0'),noline:1})));
   P.push(Cp({x:18,y:27+b},{x:11,y:27+b},2.6,2.6,'cact',3));P.push(Cp({x:11,y:27+b},{x:11,y:20+b+Math.sin(t)*1.5},2.6,2.2,'cact',3));
   P.push(E(24,8+b,3,2.2,'pinkm',2.5));P.push(E(24,8+b,1,1,null,2.6,{col:YEL}));eyesL(P,18,20+b,3,YEL);P.push(Pg([[18,27+b],[24,25+b],[25,28+b]],null,3.1,{col:DK}));
   P.push(Cp({x:20,y:41},{x:19,y:45},1.6,1.4,'sand',1.5));P.push(Cp({x:28,y:41},{x:29,y:45},1.6,1.4,'sand',1.5));return P},
 tumble(t){const P=[],a0=-t*1.4,b=Math.round(Math.abs(Math.sin(t))*-4);P.push(E(24,31+b,14,13.5,'bark',1));
   for(let i=0;i<14;i++){const a=a0+i*.9,rr=3+(i%4)*3;P.push(Cp({x:24+Math.cos(a)*rr,y:31+b+Math.sin(a)*rr},{x:24+Math.cos(a+1.8)*(rr+4),y:31+b+Math.sin(a+1.8)*(rr+4)},.7,.7,null,1.2,{col:hex(i%2?'#e8c48a':'#5e3a1a'),noline:1}))}
   for(let i=0;i<6;i++){const a=a0*1.2+i;P.push(Cp({x:24+Math.cos(a)*12,y:31+b+Math.sin(a)*12},{x:24+Math.cos(a)*17,y:31+b+Math.sin(a)*16},.6,.5,'bark',.9))}
   eyesL(P,17,28+b,2,YEL);P.push(Pg([[18,35+b],[25,34+b],[23,37+b]],null,2.3,{col:DK}));return P},
 skink(t){const P=[],w=Math.sin(t*2)*2;P.push(Cp({x:34,y:38},{x:41,y:33},3.4,2.2,'liz',1));P.push(Cp({x:41,y:33},{x:46,y:26+w*.5},2.2,1,'liz',1));
   [[18,1],[32,1],[22,3],[34,3]].forEach(([x,z],i)=>P.push(Cp({x,y:39},{x:x+(i%2?w:-w),y:45},1.6,1.2,'liz',z)));
   P.push(E(26,37,11,5.5,'liz',2));[[22,34],[27,33],[32,35]].forEach(([x,y])=>P.push(E(x,y,1.6,1,null,2.1,{col:hex('#9a6a20'),noline:1})));
   P.push(E(13,33,7,5,'liz',3));P.push(Pg([[7,30],[17,29],[17,32],[8,33]],null,3.2,{col:hex('#140f1a')}));P.push(Cp({x:8,y:31},{x:16,y:30.5},.4,.4,null,3.3,{col:hex('#6ac8ff'),noline:1}));
   P.push(Cp({x:7,y:36},{x:1,y:35+Math.sin(t*4)},.5,.4,null,3.1,{col:RED2}));return P},
 vulture(t){const P=[],fy=-8+Math.round(Math.sin(t)*2),fl=Math.sin(t*2)*8;P.push(Pg([[28,22+fy],[40,8+fy+fl],[46,16+fy+fl*.6],[34,28+fy]],'vult',1));
   P.push(E(27,28+fy,10,8,'vult',2));P.push(Pg([[35,30+fy],[44,32+fy],[37,35+fy]],'vult',1.9));P.push(E(19,23+fy,5,4,null,2.3,{col:hex('#f2ece0')}));
   P.push(E(14,19+fy,4.5,4,'pinkm',2.5));P.push(Pg([[10,18+fy],[4,21+fy],[8,24+fy],[11,22+fy]],'gold',2.6));eyesL(P,11,17+fy,2.7,YEL);
   P.push(Pg([[26,24+fy],[34,8+fy+fl],[38,20+fy]],'vult',3));P.push(Cp({x:24,y:35+fy},{x:23,y:40+fy},.7,.7,null,1.5,{col:hex('#f0b020')}));return P},
 dust(t){const P=[],q=Math.sin(t);const rx=12*(1+q*.1),ry=9*(1-q*.1),cy=43-ry;
   P.push(E(24,cy,rx,ry,'sand',1));[[17,cy-3],[29,cy+2],[23,cy+5]].forEach(([x,y])=>P.push(E(x,y,1.6,1.2,'bark',1.1)));
   for(let i=0;i<4;i++){const a=t*2+i*1.6;P.push(E(24+Math.cos(a)*15,cy-6+Math.sin(a)*4,1.5,1.2,'sand',.5))}
   eyesL(P,17,cy-2,2,YEL);P.push(Pg([[18,cy+4],[24,cy+3],[22,cy+6]],null,2.1,{col:DK}));return P},
 pumpbot(t){const P=[],b=Math.round(Math.sin(t*2)*.8),wl=Math.sin(t*2)*1.5;
   P.push(Cp({x:12,y:42},{x:38,y:42},4,4,'tar',1));[14,22,30,37].forEach(x=>P.push(E(x,42,1.6,1.6,'metal',1.1)));
   P.push(Pg([[28,12+b],[42,12+b],[42,36+b],[28,36+b]],'glass',1.5));P.push(Pg([[29,22+wl+b],[41,22-wl+b],[41,35+b],[29,35+b]],null,1.6,{col:hex('#3a9ae8')}));P.push(Cp({x:30,y:21+wl+b},{x:40,y:21-wl+b},.5,.5,null,1.7,{col:WHITE,noline:1}));
   P.push(Pg([[9,14+b],[30,14+b],[30,38],[9,38]],'metal',2));P.push(Pg([[11,30+b],[28,30+b],[28,33+b],[11,33+b]],null,2.1,{col:hex('#f0b020')}));
   P.push(E(18,22+b,5,5,'tar',2.2));P.push(E(18,22+b,3,3,null,2.3,{col:M_RED}));P.push(E(17,21+b,1,1,null,2.4,{col:WHITE}));
   P.push(Cp({x:10,y:26+b},{x:2,y:20+Math.sin(t)*3},2,1.6,'tar',2.5));P.push(E(2,19+Math.sin(t)*3,2.6,2,'metal',2.6));P.push(Cp({x:20,y:14+b},{x:20,y:7+b},.8,.8,'metal',1.8));P.push(E(20,6+b,1.4,1.4,null,1.9,{col:M_RED}));return P},
 sandworm(t){const P=[],w=Math.sin(t)*2;const pts=[];for(let i=0;i<8;i++){const u=i/7;pts.push({x:38-u*22+Math.sin(u*3+t)*2,y:46-Math.sin(u*Math.PI*.62)*32-u*4})}
   for(let i=0;i<7;i++)P.push(Cp(pts[i],pts[i+1],8-i*.3,7.6-i*.3,i%2?'pinkm':'liz',1+i*.1));
   const h=pts[7];P.push(E(h.x,h.y,8.5,8,'liz',2));P.push(E(h.x-3,h.y+1,5,5.5,null,2.1,{col:hex('#3a0a10')}));
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;P.push(Pg([[h.x-3+Math.cos(a)*5,h.y+1+Math.sin(a)*5.5],[h.x-3+Math.cos(a+.2)*2.8,h.y+1+Math.sin(a+.2)*3],[h.x-3+Math.cos(a+.4)*5,h.y+1+Math.sin(a+.4)*5.5]],null,2.2,{col:WHITE}))}
   eyesL(P,h.x-2,h.y-7,2.5,YEL);P.push(E(40,46,12,3,'sand',.5));return P},
 scorpking(t){const P=[],b=Math.round(Math.sin(t)),w=Math.sin(t*2)*1.5;
   for(let i=0;i<3;i++){[[20+i*6,1],[22+i*6,3.4]].forEach(([x,z],k)=>{P.push(Cp({x,y:34},{x:x+(k?4:-4)+w*(k?1:-1),y:40},1.4,1.2,'scorp',z));P.push(Cp({x:x+(k?4:-4)+w*(k?1:-1),y:40},{x:x+(k?6:-6),y:46},1.2,.9,'scorp',z))})}
   const tl=[{x:36,y:32},{x:42,y:24},{x:42,y:14},{x:36,y:7+w},{x:28,y:8+w}];for(let i=0;i<4;i++)P.push(Cp(tl[i],tl[i+1],4-i*.5,3.6-i*.5,'scorp',1.5));
   P.push(Pg([[28,8+w],[23,5+w],[26,11+w]],'gold',1.6));
   P.push(E(28,33+b,12,7,'scorp',2));[24,29,34].forEach(x=>P.push(Cp({x,y:27+b},{x:x+1,y:39+b},.4,.4,null,2.1,{col:hex('#7a2a10'),noline:1})));
   P.push(E(15,31+b,6.5,5.5,'scorp',3));eyesL(P,11,29+b,3.1,YEL);
   P.push(Cp({x:12,y:35+b},{x:6,y:37},2.2,1.8,'scorp',3.2));P.push(E(4,36,4,3,'scorp',3.3));P.push(Pg([[1,35],[-3,32],[2,33.5]],'scorp',3.25));
   P.push(Cp({x:16,y:27+b},{x:10,y:22},2,1.6,'scorp',2.9));P.push(E(8,20,4,3,'scorp',2.95));P.push(Pg([[5,19],[1,16],[6,17.5]],'scorp',2.9));crown(P,16,25+b,.8);return P},
 /* ch4 oil sea */
 barrel(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:20,y:40},{x:19+Math.sin(t)*1.5,y:45},1.6,1.4,'tar',1));P.push(Cp({x:28,y:40},{x:29-Math.sin(t)*1.5,y:45},1.6,1.4,'tar',1));
   P.push(Cp({x:24,y:17+b},{x:24,y:39},9,9,'drum',2));[21,28,35].forEach(y=>P.push(Cp({x:15.4,y:y+b},{x:32.6,y:y+b},.8,.8,'metal',2.1)));P.push(E(24,16+b,8.6,2.4,'drum',2.2,{bias:1}));
   P.push(Pg([[18,26+b],[30,26+b],[30,31+b],[18,31+b]],null,2.3,{col:hex('#ffd23a')}));P.push(Pg([[22,30+b],[24,27+b],[26,30+b]],null,2.4,{col:BLACK}));
   P.push(Cp({x:28,y:15+b},{x:29,y:20+b+Math.abs(Math.sin(t))*3},1.2,.9,'tar',2.5));eyesL(P,17,21+b,2.6);return P},
 eel(t){const P=[],fy=-6;const seg=[];for(let i=0;i<7;i++)seg.push({x:12+i*5,y:28+fy+Math.sin(t*2-i*.9)*3});
   for(let i=6;i>0;i--)P.push(Cp(seg[i],seg[i-1],3.4-i*.3,3.6-i*.3,'eel',1+(6-i)*.1));P.push(Pg([[seg[6].x,seg[6].y],[seg[6].x+7,seg[6].y-4],[seg[6].x+6,seg[6].y+4]],'eel',.9));
   P.push(E(seg[0].x,seg[0].y,5.5,4.2,'eel',2));P.push(Cp({x:seg[2].x,y:seg[2].y-3},{x:seg[5].x,y:seg[5].y-3},.9,.6,null,1.9,{col:hex('#c88aff'),noline:1}));
   eyesL(P,seg[0].x-6,seg[0].y-2,2.2,YEL);P.push(Cp({x:seg[0].x-6,y:seg[0].y+2},{x:seg[0].x-1,y:seg[0].y+2.5},.5,.5,null,2.3,{col:RED2}));return P},
 drone(t){const P=[],fy=-12+Math.round(Math.sin(t)*2),sp=Math.abs(Math.sin(t*6));
   [[13,1],[35,1]].forEach(([x])=>{P.push(Cp({x,y:16+fy},{x,y:21+fy},.7,.7,'metal',1.5));P.push(Cp({x:x-7*sp-1,y:15+fy},{x:x+7*sp+1,y:15+fy},.8,.8,null,1.6,{col:hex('#c0c8d8')}))});
   P.push(Cp({x:13,y:21+fy},{x:35,y:21+fy},1.2,1.2,'metal',1.7));P.push(E(24,26+fy,9,6.5,'drum',2));P.push(E(17,26+fy,3,3,'tar',2.1));P.push(E(17,26+fy,1.6,1.6,null,2.2,{col:M_RED}));
   P.push(Pg([[19,31+fy],[29,31+fy],[24,42+fy]],'gold',1.8));for(let i=0;i<3;i++)P.push(Cp({x:20.5+i*1.2,y:33+i*3+fy},{x:27.5-i*1.2,y:34+i*3+fy},.4,.4,null,1.85,{col:hex('#6a3a00'),noline:1}));return P},
 tarcrab(t){const P=[],w=Math.round(Math.sin(t)*2);
   for(let i=0;i<3;i++)[[19+i*5,1],[19+i*5,-1]].forEach(([x,s],k)=>P.push(Cp({x,y:36},{x:x+(k?w:-w)+s*2,y:44},1.4,1.1,'tar',k?.5:3.5)));
   P.push(E(26,33,11,8,'tar',2));[[22,29],[30,31],[25,35]].forEach(([x,y])=>P.push(E(x,y,1.6,1,null,2.1,{col:hex('#8a6ac8'),noline:1})));
   P.push(Cp({x:16,y:30},{x:10,y:25},1.8,1.6,'tar',2.3));P.push(E(7,23+w*.5,5.6,4.4,'tar',2.4));P.push(Pg([[3,22],[-1,19],[4,24.5]],null,2.5,{col:hex('#c8b8ff')}));
   P.push(Cp({x:20,y:27},{x:19,y:20},.8,.8,null,2,{col:DK}));P.push(Cp({x:26,y:27},{x:26,y:20},.8,.8,null,2,{col:DK}));eyesL(P,19,19,2.6,YEL);
   P.push(Cp({x:29,y:25},{x:31,y:29+Math.abs(Math.sin(t))*3},1,.7,'tar',2.6));return P},
 drillbot(t){const P=[],b=Math.round(Math.sin(t*2)*.8),dr=t*4;
   P.push(Cp({x:16,y:36},{x:15,y:45},3.6,3.4,'tar',1));P.push(Cp({x:30,y:36},{x:31,y:45},3.6,3.4,'tar',1));
   P.push(Pg([[30,2+b],[36,2+b],[36,20+b],[30,20+b]],'drum',1.4));P.push(E(33,1+b+Math.sin(t)*1,3.4,2.4,'smog',1.3));P.push(E(36,-3+b,2.4,1.8,'smog',1.2));
   P.push(Pg([[10,12+b],[36,12+b],[38,38],[8,38]],'drum',2));P.push(Pg([[12,16+b],[28,16+b],[28,22+b],[12,22+b]],null,2.1,{col:hex('#ffd23a')}));
   P.push(E(17,19+b,2,1.6,null,2.2,{col:BLACK}));P.push(E(24,19+b,2,1.6,null,2.2,{col:BLACK}));[[10,30],[14,30],[18,30]].forEach(([x,y])=>P.push(E(x+9,y+b,1.2,1.2,'metal',2.2)));
   P.push(Cp({x:10,y:24+b},{x:4,y:28},2.4,2,'metal',3));P.push(Pg([[6,26],[6,34],[-4,30]],'gold',3.1));for(let i=0;i<3;i++){const x=4-i*3+(dr%1)*3;P.push(Cp({x,y:27+i*.7},{x:x-1,y:33-i*.7},.4,.4,null,3.2,{col:hex('#6a3a00'),noline:1}))}return P},
 oilshark(t){const P=[],fy=-4+Math.round(Math.sin(t)*2),w=Math.sin(t*2)*3;P.push(Pg([[38,28+fy],[47,20+fy+w],[46,34+fy-w*.4]],'eel',1));
   P.push(Pg([[6,30+fy],[14,22+fy],[30,21+fy],[40,27+fy],[30,35+fy],[14,35+fy]],'eel',2));P.push(Pg([[24,22+fy],[29,10+fy],[32,23+fy]],'eel',1.9));P.push(Pg([[22,34+fy],[26,40+fy],[28,34+fy]],'eel',1.8));
   P.push(Pg([[8,31+fy],[20,31+fy],[20,34+fy],[10,34+fy]],null,2.1,{col:hex('#2a0a10')}));for(let i=0;i<4;i++)P.push(Pg([[9+i*3,31+fy],[10.5+i*3,33+fy],[12+i*3,31+fy]],null,2.2,{col:WHITE}));
   P.push(Cp({x:16,y:22+fy},{x:15,y:18+fy},1,1,null,2.3,{col:hex('#c88aff'),noline:1}));eyesL(P,12,26+fy,2.4,YEL);
   for(let i=0;i<2;i++)P.push(E(18+i*10,37+fy+((t+i)%2),1.2,1.8,'tar',2.4));return P},
 octoking(t){const P=[],b=Math.round(Math.sin(t));
   for(let i=0;i<7;i++){const x=10+i*4.8,c=Math.sin(t+i)*3;const m={x:x-2+c*.4,y:35},e={x:x-6+c,y:44-(i%2)*2};P.push(Cp({x,y:27+b},m,3.4,2.6,'oil',1+(i%2)*1.5));P.push(Cp(m,e,2.6,1.2,'oil',1+(i%2)*1.5))}
   P.push(E(25,17+b,15,13.5,'oil',2.5));P.push(E(21,11+b,4.5,3.4,'oil',2.6,{bias:1.5,noline:1}));[[30,9],[34,15],[33,22]].forEach(([x,y])=>P.push(E(x,y+b,2,1.4,null,2.7,{col:hex('#8a6ac8'),noline:1})));
   eyesL(P,14,19+b,3,YEL);P.push(E(18,27+b,3,2,null,3.1,{col:DK}));
   P.push(Cp({x:6,y:30},{x:0,y:18},2.2,2.2,'rust',3.2));P.push(E(0,16,2.6,2,'rust',3.25));P.push(E(0,12+Math.sin(t*2)*1,1.8,2.6,'tar',3.3));crown(P,25,5+b,1);return P},
 /* ch5 smog city */
 smog(t){const P=[],fy=-8+Math.round(Math.sin(t)*2.5);[[16,28],[24,24],[32,28],[20,32],[29,33],[38,31]].forEach(([x,y],i)=>P.push(E(x,y+fy+Math.sin(t+i)*1,7,6,'smog',1+i*.01,{g:5})));
   for(let i=0;i<4;i++)P.push(E(16+i*7,39+fy+Math.sin(t*2+i)*2,3,3.2,'smog',.9,{g:5}));eyesL(P,16,26+fy,2,YEL);P.push(E(19,33+fy,2.2,1.8,null,2.2,{col:DK}));
   P.push(E(10,32+fy-((t*3)%3),1.6,1.6,'smog',2.3));return P},
 rat(t){const P=[],b=Math.round(Math.sin(t*2)*.8);P.push(Cp({x:34,y:38},{x:46,y:34+Math.sin(t*2)*3},1,.5,'pinkm',1));
   P.push(Cp({x:20,y:40},{x:19,y:45},1.5,1.2,'ratf',1.2));P.push(Cp({x:29,y:40},{x:30,y:45},1.5,1.2,'ratf',1.2));P.push(E(27,34+b,10,7.5,'ratf',2));
   P.push(E(14,29+b,7,6,'ratf',3));P.push(E(17,22+b,3,3,'pinkm',2.8));P.push(E(15,30+b,5,4.2,null,3.1,{col:hex('#1a1a20')}));P.push(E(9,33+b,3.4,3,'conc',3.2));P.push(E(9,33+b,1.6,1.4,null,3.3,{col:DK}));
   [[12,27],[17,27]].forEach(([x,y])=>{P.push(E(x,y+b,2,2,null,3.2,{col:hex('#9fe0ff')}));P.push(E(x,y+b,.8,.8,null,3.3,{col:BLACK}))});return P},
 cone(t){const P=[],b=Math.round(Math.abs(Math.sin(t))*-2);P.push(Cp({x:20,y:40},{x:19,y:45},1.4,1.2,'tar',1));P.push(Cp({x:28,y:40},{x:29,y:45},1.4,1.2,'tar',1));
   P.push(Pg([[12,41+b],[36,41+b],[36,44+b],[12,44+b]],'cone',2));P.push(Pg([[15,41+b],[24,8+b],[33,41+b]],'cone',2.1));
   [[19,27,29],[21,18,27]].forEach(([y0,y1])=>{const k0=(y0-8)/33*9,k1=(y1-8)/33*9;});P.push(Pg([[18.4,31+b],[29.6,31+b],[28.3,26+b],[19.7,26+b]],null,2.2,{col:WHITE}));P.push(Pg([[21,20+b],[27,20+b],[26,16.5+b],[22,16.5+b]],null,2.2,{col:WHITE}));
   eyesL(P,19,22+b,2.5);P.push(Cp({x:15,y:33+b},{x:9,y:30+b+Math.sin(t*2)*2},1.2,1,'cone',2.4));P.push(Cp({x:33,y:33+b},{x:39,y:30+b-Math.sin(t*2)*2},1.2,1,'cone',1.9));return P},
 vending(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:15,y:41},{x:14+Math.sin(t)*2,y:45},1.8,1.6,'tar',1));P.push(Cp({x:33,y:41},{x:34-Math.sin(t)*2,y:45},1.8,1.6,'tar',1));
   P.push(Pg([[10,6+b],[38,6+b],[38,42],[10,42]],'vend',2));P.push(Pg([[13,15+b],[30,15+b],[30,34+b],[13,34+b]],'glass',2.1));
   for(let r=0;r<3;r++)for(let c=0;c<3;c++)P.push(Pg([[14.5+c*5.3,17+r*6+b],[18.5+c*5.3,17+r*6+b],[18.5+c*5.3,21.5+r*6+b],[14.5+c*5.3,21.5+r*6+b]],null,2.2,{col:hex(['#ff5a5a','#5ac8ff','#ffd23a','#7bdc4f'][(r+c)%4])}));
   P.push(Pg([[32,18+b],[36,18+b],[36,26+b],[32,26+b]],'metal',2.2));P.push(Pg([[14,37+b],[30,37+b],[30,40+b],[14,40+b]],null,2.2,{col:DK}));
   eyesL(P,17,10+b,2.4,YEL);P.push(Cp({x:10,y:24+b},{x:3,y:20+Math.sin(t*2)*2},1.8,1.5,'vend',2.5));return P},
 cctv(t){const P=[],fy=-10+Math.round(Math.sin(t)*2),fl=Math.sin(t*3)*5;P.push(Pg([[26,22+fy],[36,12+fy+fl],[42,18+fy+fl],[34,26+fy]],'tar',1));
   P.push(Pg([[12,20+fy],[34,18+fy],[36,30+fy],[12,32+fy]],'conc',2));P.push(E(12,26+fy,6,6,'tar',2.1));P.push(E(11,26+fy,4,4,null,2.2,{col:hex('#2a3e66')}));P.push(E(10,26+fy,2,2,null,2.3,{col:(Math.sin(t*4)>0?M_RED:hex('#8a1020'))}));
   P.push(E(10,24.5+fy,.8,.8,null,2.4,{col:WHITE}));P.push(Pg([[24,22+fy],[30,8+fy-fl],[38,20+fy]],'tar',3));P.push(Cp({x:26,y:32+fy},{x:26,y:38+fy},1,1,'metal',1.5));return P},
 excav(t){const P=[],b=Math.round(Math.sin(t*2)*.6),arm=Math.sin(t)*.25;
   P.push(Cp({x:16,y:41},{x:42,y:41},4.6,4.6,'tar',1));[18,26,34,40].forEach(x=>P.push(E(x,41,1.8,1.8,'metal',1.1)));
   P.push(Pg([[14,22+b],[42,22+b],[42,36+b],[14,36+b]],'yel',2));P.push(Pg([[22,8+b],[38,8+b],[40,22+b],[20,22+b]],'yel',2.1));P.push(Pg([[24,11+b],[34,11+b],[35,20+b],[23,20+b]],'glass',2.2));
   eyesL(P,25,15+b,2.3,YEL);P.push(Pg([[14,28+b],[42,28+b],[42,30+b],[14,30+b]],null,2.15,{col:hex('#1a1a1a')}));
   const sh={x:18,y:24+b},el={x:8,y:10+Math.sin(t)*3},tip={x:2+Math.cos(arm)*2,y:24+Math.sin(t)*4};P.push(Cp(sh,el,2.8,2.4,'yel',3));P.push(Cp(el,tip,2.4,2,'yel',3.1));
   P.push(Pg([[tip.x-5,tip.y-2],[tip.x+4,tip.y-3],[tip.x+3,tip.y+5],[tip.x-4,tip.y+6]],'metal',3.2));for(let i=0;i<3;i++)P.push(Pg([[tip.x-4+i*3,tip.y+6],[tip.x-3+i*3,tip.y+8],[tip.x-2+i*3,tip.y+6]],'metal',3.25));return P},
 boiler(t){const P=[],b=Math.round(Math.sin(t)*1),fl=.5+.5*Math.sin(t*5);P.push(Cp({x:18,y:38},{x:17,y:45},4,3.8,'conc',1));P.push(Cp({x:30,y:38},{x:31,y:45},4,3.8,'conc',1));
   P.push(Cp({x:36,y:16+b},{x:42,y:30},3.2,3,'metal',1.4));P.push(Cp({x:30,y:10+b},{x:30,y:0+b},2.4,2.4,'metal',1.3));P.push(E(29,-2+b-((t*4)%4),3,2.4,'smog',1.2));
   P.push(Cp({x:24,y:14+b},{x:24,y:36},12,12.5,'brick',2));[18,24,30].forEach(y=>P.push(Cp({x:12.5,y:y+b},{x:35.5,y:y+b},.4,.4,null,2.1,{col:hex('#4a1a10'),noline:1})));
   P.push(Pg([[15,24+b],[27,24+b],[27,32+b],[15,32+b]],'metal',2.2));P.push(Pg([[17,26+b],[25,26+b],[25,31+b],[17,31+b]],null,2.3,{col:fl>.5?hex('#ffb03a'):hex('#ff6a1a')}));
   eyesL(P,16,15+b,3,YEL);P.push(Cp({x:12,y:20+b},{x:5,y:30},3.2,3,'metal',3));P.push(E(5,33,4.4,4.4,'brick',3.1));return P},
 chimney(t){const P=[],b=Math.round(Math.sin(t)*1),sm=(t*2)%(Math.PI*2);
   for(let i=0;i<3;i++){const u=((t/(Math.PI*2)+i/3)%1);P.push(E(30+u*10,-3-u*16+b,2.6+u*3.4,2.2+u*2.8,'smog',.5+i*.01,{g:90+i}))}
   P.push(Cp({x:19,y:38},{x:18,y:46},4.6,4.4,'conc',1));P.push(Cp({x:33,y:38},{x:34,y:46},4.6,4.4,'conc',1));
   P.push(Cp({x:38,y:16+b},{x:44,y:32},3.6,3.4,'brick',1.4));P.push(E(44,34,4,4,'conc',1.5));
   P.push(Pg([[14,2+b],[38,2+b],[40,40],[12,40]],'brick',2));for(let r=0;r<6;r++){const y=8+r*5.5+b;P.push(Cp({x:13,y},{x:39,y},.35,.35,null,2.1,{col:hex('#4a1a10'),noline:1}));
     for(let c=0;c<3;c++){const x=17+c*8+(r%2)*4;P.push(Cp({x,y},{x,y:y+5.5},.35,.35,null,2.1,{col:hex('#4a1a10'),noline:1}))}}
   P.push(Pg([[12,0+b],[40,0+b],[40,5+b],[12,5+b]],'conc',2.3));P.push(E(26,0+b,12,2.2,null,2.4,{col:hex('#1a1416')}));
   P.push(Pg([[15,13+b],[36,13+b],[36,22+b],[15,22+b]],null,2.5,{col:hex('#1a1416')}));[[20,17],[30,17]].forEach(([x,y])=>{P.push(E(x,y+b,3,2.6,null,2.6,{col:hex('#ff8a1a')}));P.push(E(x,y+b,1.4,1.2,null,2.7,{col:hex('#fff0a0')}))});
   P.push(Pg([[18,28+b],[34,28+b],[32,33+b],[20,33+b]],null,2.5,{col:hex('#1a1416')}));for(let i=0;i<4;i++)P.push(Pg([[20+i*3.5,28+b],[21.7+i*3.5,30.5+b],[23.4+i*3.5,28+b]],null,2.6,{col:hex('#ffd23a')}));
   P.push(Cp({x:14,y:18+b},{x:6,y:30},3.8,3.4,'brick',3));P.push(E(5,33,5,5,'conc',3.1));crown(P,26,-1+b,1);return P}
});
Object.assign(MOBNAME,{urchin:'빨대 성게',jellyking:'비닐 해파리 왕',ogre:'톱니 벌목왕',cactus:'성난 선인장',tumble:'회전초',skink:'선글라스 도마뱀',vulture:'대머리 독수리',dust:'모래먼지 슬라임',
 pumpbot:'물 도둑 펌프봇',sandworm:'모래 지렁이',scorpking:'모래폭풍 전갈왕',barrel:'드럼통 병정',eel:'기름 장어',drone:'시추 드론',tarcrab:'타르 게',drillbot:'시추 로봇',oilshark:'기름 상어',octoking:'기름 문어',
 smog:'스모그 유령',rat:'방독면 쥐',cone:'라바콘 병정',vending:'폭주 자판기',cctv:'감시 카메라',excav:'굴착기 포크레인',boiler:'보일러 골렘',chimney:'굴뚝 거인'});
Object.assign(FLY,{vulture:14,eel:8,drone:14,oilshark:6,smog:12,cctv:14,jellyking:4});
/* ================= chapter 3~5 backgrounds ================= */
function rectP(put,x,y,w,h,c){const C=typeof c==='string'?hex(c):c;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)put(xx,yy,C)}
function lineP(put,x0,y0,x1,y1,c){const C=hex(c),n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let i=0;i<=n;i++)put(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),C)}
const CHIM5=[[30,52],[118,40],[232,46],[318,58]];
THEMES[0].mobs=['jelly','crab','bottle','gull','urchin'];THEMES[0].mids=['hermit','golem'];THEMES[0].fin='jellyking';
THEMES[0].story='발전소 공사 폐기물이 바닷가에 밀려와 괴물이 됐어요.';THEMES[1].story='발전소 연료로 나무를 베는 전기톱 고블린을 막아요.';
THEMES.push(
 {name:'메마른 사막',mobs:['cactus','tumble','skink','vulture','dust'],mids:['pumpbot','sandworm'],fin:'scorpking',story:'발전소가 물을 다 끌어가 사막이 됐어요. 오아시스를 되찾아요!',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#e07a44','#ee9a52','#f6bc6c','#fbd894','#fdeab8']);disc(put,44,36,13,hex('#fff6d0'));disc(put,44,36,9,hex('#fffbe8'));
    for(let a=0;a<48;a++){const an=a/48*Math.PI*2;put(44+Math.round(Math.cos(an)*17),36+Math.round(Math.sin(an)*17),hex('#ffe8b0'))}}),
  far:()=>pcan(360,VH,put=>{const d1=hex('#eab26c'),d2=hex('#d89650'),tw=hex('#9a6a48'),tw2=hex('#7a5038');
    for(let x=0;x<360;x++){const h=Math.round(86-Math.max(0,Math.sin(x*.025)*9+Math.sin(x*.07+1)*3));for(let y=h;y<100;y++)put(x,y,d1)}
    rectP(put,236,52,10,36,tw);rectP(put,238,46,6,6,tw2);rectP(put,250,60,7,28,tw);for(let x=200;x<330;x++){put(x,70,tw);put(x,71,tw2)}for(let i=0;i<6;i++)rectP(put,205+i*22,71,2,18,tw2);
    for(let y=0;y<16;y++)put(80,78+y,tw2);[[-6,-3],[6,-2],[-4,2],[5,3]].forEach(([dx,dy])=>lineP(put,80,78,80+dx,78+dy-2,'#7a5038'));
    for(let x=0;x<360;x++){const h=Math.round(96-Math.max(0,Math.sin(x*.04+2)*6+Math.sin(x*.013)*4));for(let y=h;y<104;y++)put(x,y,d2)}}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,102,116,['#d8964e','#c8843f'])}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,114,VH,['#f4cc84','#e8b86c','#d8a056']);const c=hex('#b8843f'),l=hex('#fbe2a8');
    for(let i=0;i<14;i++){let x=(i*53)%VW,y=GYv+2+(i*17)%18;for(let k=0;k<6;k++){const nx=x+((i+k)%3)-1+3,ny=y+((k*7+i)%3)-1;lineP(put,x,y,nx,ny,'#b8843f');x=nx;y=ny}}
    for(let i=0;i<24;i++){const x=(i*41)%VW,y=GYv+4+(i*11)%20;put(x,y,l)}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*19)%22,y=118,k=i%3;
    if(k===0){rectP(put,x,y-12,4,12,'#3e8a34');rectP(put,x-4,y-9,3,2,'#3e8a34');rectP(put,x-4,y-12,2,4,'#3e8a34');rectP(put,x+5,y-7,3,2,'#3e8a34');rectP(put,x+6,y-10,2,4,'#3e8a34');for(let yy=0;yy<12;yy+=3)put(x+1,y-12+yy,hex('#8ad870'))}
    else if(k===1){rectP(put,x,y-3,9,2,'#f2ece0');rectP(put,x-1,y-4,2,4,'#f2ece0');rectP(put,x+8,y-4,2,4,'#f2ece0');rectP(put,x+14,y-5,6,5,'#f2ece0');put(x+16,y-3,hex('#3a2a20'));put(x+18,y-3,hex('#3a2a20'))}
    else{for(let a=0;a<8;a++){const an=a/8*Math.PI;lineP(put,x+4,y,x+4+Math.round(Math.cos(an)*6),y-Math.round(Math.sin(an)*6)-2,'#8a6a40')}}}}),
  anim:(L,s,t)=>{L.fillStyle='rgba(255,240,200,.18)';for(let k=0;k<4;k++){const y=104+k*3,o=Math.sin(t*3+k)*3;L.fillRect(0,y+o,VW,1)}}},
 {name:'기름 바다',mobs:['oil','barrel','eel','drone','tarcrab'],mids:['drillbot','oilshark'],fin:'octoking',story:'시추선에서 새어 나온 기름에 묻은 펭귄들을 구해요.',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#22182e','#3e2440','#6a3446','#a0504a','#d07a48']);disc(put,128,70,11,hex('#ff9a5a'));disc(put,128,70,7,hex('#ffc890'))}),
  far:()=>pcan(360,VH,put=>{const k=hex('#1e1420'),k2=hex('#2e1e2c');
    [[40,40],[150,30],[270,44]].forEach(([x,top])=>{rectP(put,x,top,3,94-top,k);rectP(put,x+14,top,3,94-top,k);for(let y=top;y<94;y+=8){lineP(put,x+1,y,x+15,y+8,'#1e1420');lineP(put,x+15,y,x+1,y+8,'#1e1420')}
      rectP(put,x-6,top+20,30,5,k2);rectP(put,x+6,top-12,3,12,k);disc(put,x+7,top-15,3,hex('#ff8a1a'));put(x+7,top-19,hex('#ffe066'));put(x+8,top-18,hex('#ffd23a'))});
    rectP(put,200,84,56,8,k);rectP(put,204,92,48,2,hex('#8a1a20'));rectP(put,236,74,12,10,k2)}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,94,114,['#2a2034','#1c1626','#141018']);const sh=['#6a4aa8','#2a8a8a','#a8803a','#a84a7a'];
    for(let i=0;i<40;i++){const x=(i*37)%VW,y=97+(i*13)%15,w=3+(i%4);for(let xx=0;xx<w;xx++)put(x+xx,y,hex(sh[(i+xx)%4]))}}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#9a6838','#865a30','#6e4826']);const sm=hex('#5a3a1c'),hi=hex('#b8824a');
    for(let x=0;x<VW;x+=15)for(let y=113;y<VH;y++)put(x,y,sm);for(let y=118;y<VH;y+=9)for(let x=0;x<VW;x++)if(x%15)put(x,y,sm);for(let x=0;x<VW;x++)put(x,113,hi);
    [[30,126],[96,138],[150,124]].forEach(([x,y])=>{for(let yy=-2;yy<=2;yy++)for(let xx=-7;xx<=7;xx++)if(xx*xx/49+yy*yy/4<=1)put(x+xx,y+yy,hex('#1a1018'))})}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*17)%20,y=118,k=i%3;
    if(k===0){rectP(put,x,y-11,8,11,'#1a5a8a');rectP(put,x,y-8,8,1,'#9aa2b2');rectP(put,x,y-4,8,1,'#9aa2b2');rectP(put,x+2,y-12,4,1,'#2a86c0');rectP(put,x+5,y-11,1,3,'#140f1a')}
    else if(k===1){for(let yy=-9;yy<=0;yy++)for(let xx=-4;xx<=4;xx++)if(xx*xx/16+(yy+5)*(yy+5)/25<=1)put(x+xx,y+yy,hex('#1a1622'));for(let yy=-6;yy<=-1;yy++)for(let xx=-2;xx<=2;xx++)if(xx*xx/4+(yy+3.5)*(yy+3.5)/7<=1)put(x+xx,y+yy,hex('#b8b0a8'));
      put(x-2,y-7,hex('#ffffff'));put(x+1,y-7,hex('#ffffff'));put(x-1,y-7,BLACK);put(x+2,y-7,BLACK);rectP(put,x+3,y-6,2,1,'#f0a020');put(x+3,y-2,hex('#4a3a58'));put(x-3,y-4,hex('#4a3a58'))}
    else{for(let a=0;a<28;a++){const an=a/28*Math.PI*2;put(x+Math.round(Math.cos(an)*5),y-5+Math.round(Math.sin(an)*5),hex(a%7<3?'#ff4d5e':'#ffffff'))}}}}),
  anim:(L,s,t)=>{const cs=['rgba(150,110,220,.45)','rgba(60,190,190,.4)','rgba(220,170,80,.4)'];for(let k=0;k<9;k++){const o=Math.floor(s*.3+t*6+k*41)%220-20;L.fillStyle=cs[k%3];L.fillRect(o,97+(k*5)%15,6+(k%3)*2,1)}}},
 {name:'스모그 도시',mobs:['smog','rat','cone','vending','cctv'],mids:['excav','boiler'],fin:'chimney',story:'화력발전소 굴뚝에 갇힌 도시. 사천왕의 존재를 알게 돼요.',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#5e5a50','#7c7664','#9c947c','#b8b094','#ccc4a6']);disc(put,140,30,9,hex('#e8dcb0'))}),
  far:()=>pcan(360,VH,put=>{const b1=hex('#6a665e'),w=hex('#b8a870');for(let i=0;i<24;i++){const x=i*15,h=22+(i*13)%30;rectP(put,x,96-h,13,h,b1);for(let yy=96-h+3;yy<94;yy+=4)for(let xx=x+2;xx<x+12;xx+=3)if((xx*7+yy*3)%5===0)put(xx,yy,w)}
    CHIM5.forEach(([x,top])=>{rectP(put,x,top,7,96-top,'#6a4038');for(let y=top+4;y<96;y+=10)rectP(put,x,y,7,2,'#c84a3a');rectP(put,x-1,top,9,2,'#4a2a28')})}),
  mid:()=>pcan(VW,VH,put=>{const b=hex('#3c3a40'),w=hex('#e0c060');for(let i=0;i<12;i++){const x=i*16-4,h=8+(i*7)%10;rectP(put,x,108-h,14,h+6,b);for(let xx=x+2;xx<x+12;xx+=4)if((xx+i)%3)put(xx,110-h,w)}}),
  ground:()=>pcan(VW,VH,put=>{rectP(put,0,113,VW,8,'#a4a29c');for(let x=0;x<VW;x+=12)for(let y=113;y<121;y++)put(x,y,hex('#7e7c78'));rectP(put,0,120,VW,2,'#6a6862');
    grad(put,VW,122,VH,['#4e4e54','#46464c','#3e3e44']);for(let x=0;x<VW;x+=24)rectP(put,x,137,12,2,'#e8c040');for(let i=0;i<30;i++)put((i*47)%VW,124+(i*11)%24,hex('#5e5e66'))}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=22+i*60+(i*13)%20,y=118,k=i%3;
    if(k===0){rectP(put,x,y-30,2,30,'#3a3a40');rectP(put,x,y-31,8,2,'#3a3a40');rectP(put,x+6,y-30,3,2,'#ffe8a0')}
    else if(k===1){for(let yy=0;yy<8;yy++){const hw=Math.floor(yy/2);for(let xx=-hw;xx<=hw;xx++)put(x+xx,y-8+yy,hex(yy===3||yy===4?'#ffffff':'#ff8a1a'))}rectP(put,x-5,y,11,1,'#d0500a')}
    else{rectP(put,x,y-6,7,6,'#1e1e24');rectP(put,x+5,y-7,6,7,'#2a2a32');put(x+2,y-7,hex('#5e5e66'));rectP(put,x+14,y-6,4,6,'#d8303c');rectP(put,x+13,y-4,6,1,'#d8303c')}}}),
  anim:(L,s,t)=>{const fo=Math.floor(s*.15)%360;CHIM5.forEach(([x,top])=>{for(let k=0;k<4;k++){const u=((t*.25+k*.25)%1),xx=x+3-fo+u*14+((x+3-fo)<-20?360:0),yy=top-2-u*26,r=2+u*5;L.fillStyle=`rgba(90,86,80,${(.55*(1-u)).toFixed(2)})`;L.beginPath();L.arc(xx,yy,r,0,7);L.fill()}})}}
);
/* ================= chapters 6~10 monsters ================= */
R('coalr',['#08080c','#1a1a22','#2e2e3a','#4c4c5e']);R('acid',['#24360c','#466a16','#78a826','#bce858']);R('toxp',['#2a103a','#4a1e66','#7a3aa0','#b06ad8']);
R('sludge',['#16160a','#30301a','#525628','#828642']);R('mut',['#24443a','#3a7458','#5ea878','#9adcac']);R('royal',['#12081c','#28143e','#462466','#76449e']);
R('energy',['#3a0a6a','#7a2ac8','#c08aff','#f4e8ff']);R('ceram',['#7a6a5a','#b8aa98','#e6dccc','#ffffff']);R('copper',['#5a2a0a','#9a4a14','#d8782a','#ffb870']);
const M6_EMB=hex('#ff8a1a'),M6_EMB2=hex('#ffd060'),M6_GRN=hex('#9aff3a'),M6_VIO=hex('#c88aff'),M6_ZAP=hex('#fff05a');
const bolt=(P,x,y,s,z,col)=>P.push(Pg([[x,y],[x+3*s,y+4*s],[x+1*s,y+4.5*s],[x+4*s,y+9*s],[x-1*s,y+4*s],[x+1*s,y+3.5*s]],null,z,{col:col||M6_ZAP}));
Object.assign(MOBS,{
 /* ch6 coal mine */
 coal(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Pg([[10,42],[8,30+b],[14,20+b],[26,16+b],[36,22+b],[40,34+b],[37,43]],'coalr',2));
   [[16,26,22,33],[28,22,31,30],[20,36,27,38]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.6,.6,null,2.1,{col:M6_EMB,noline:1})));eyesL(P,16,28+b,2.6,M6_EMB2);
   P.push(Cp({x:16,y:42},{x:15,y:46},2,1.6,'coalr',1));P.push(Cp({x:32,y:42},{x:33,y:46},2,1.6,'coalr',1));return P},
 cart(t){const P=[],sp=t*3;[[14,1],[34,1]].forEach(([x])=>{P.push(E(x,41,5,5,'metal',1.5));for(let k=0;k<3;k++){const a=sp+k*2.1;P.push(Cp({x,y:41},{x:x+Math.cos(a)*4,y:41+Math.sin(a)*4},.5,.5,null,1.6,{col:hex('#5f6676')}))}});
   P.push(Pg([[6,22],[42,22],[38,38],[10,38]],'rust',2));[[12,18],[20,15],[29,16],[36,19]].forEach(([x,y])=>P.push(E(x,y,5,4,'coalr',1.8)));P.push(Cp({x:6,y:22},{x:42,y:22},1.2,1.2,'metal',2.1));
   eyesL(P,13,28,2.6,YEL);P.push(Pg([[14,34],[24,33],[20,36]],null,2.3,{col:DK}));P.push(E(4,26,2.6,2.6,null,2.4,{col:M6_EMB2}));return P},
 cbat(t){const P=[],fy=-10+Math.round(Math.sin(t*2)*2),fl=Math.sin(t*3)*7;
   P.push(Pg([[22,24+fy],[8,12+fy+fl],[4,22+fy+fl*.5],[10,24+fy],[14,30+fy]],'ratf',1));P.push(Pg([[26,24+fy],[40,12+fy+fl],[44,22+fy+fl*.5],[38,24+fy],[34,30+fy]],'ratf',1));
   P.push(E(24,27+fy,7,7,'royal',2));P.push(Pg([[18,20+fy],[19,13+fy],[22,20+fy]],'royal',2.1));P.push(Pg([[26,20+fy],[29,13+fy],[30,20+fy]],'royal',2.1));
   [[21,25],[27,25]].forEach(([x,y])=>P.push(E(x,y+fy,1.8,1.8,null,2.2,{col:hex('#ff3040')})));[[21,31],[26,31]].forEach(([x,y])=>P.push(Pg([[x,y+fy],[x+1.2,y+3+fy],[x+2.4,y+fy]],null,2.3,{col:WHITE})));return P},
 helmgob(t){const P=[],b=Math.round(Math.sin(t*2)*.8),sw=Math.sin(t)*.5;P.push(Cp({x:20,y:38},{x:19,y:45},2,1.8,'tar',1));P.push(Cp({x:28,y:38},{x:29,y:45},2,1.8,'tar',1));
   P.push(E(24,32+b,8,8,'vest',2));P.push(Cp({x:17,y:27+b},{x:31,y:37+b},.8,.8,null,2.1,{col:hex('#e8e8e8'),noline:1}));P.push(E(22,19+b,7.5,6.5,'gob',3));
   P.push(Pg([[14,16+b],[16,10+b],[28,9+b],[31,16+b]],'yel',3.2));P.push(Cp({x:12,y:16+b},{x:32,y:16+b},1,1,'yel',3.25));P.push(E(15,12+b,2,2,null,3.3,{col:hex('#fff8c0')}));
   eyesL(P,16,19+b,3.3,YEL);P.push(Cp({x:16,y:28+b},{x:6+sw*4,y:16},1.1,1.1,'bark',3.5));P.push(Pg([[1+sw*4,14],[11+sw*4,12],[7+sw*4,19]],'metal',3.6));return P},
 canary(t){const P=[],fy=-9+Math.round(Math.sin(t)*2),fl=Math.sin(t*3)*5;for(let i=0;i<3;i++){const u=(t*.3+i/3)%1;P.push(E(8-u*6,30+fy-u*8,2+u*3,2+u*3,'acid',.4,{g:70+i}))}
   P.push(Pg([[26,24+fy],[34,14+fy+fl],[38,22+fy]],'yel',1));P.push(E(26,27+fy,8,6.5,'yel',2));P.push(E(17,22+fy,5.5,5,'yel',2.5));
   P.push(E(15,24+fy,3.2,2.6,null,2.6,{col:hex('#2a2a32')}));P.push(E(12,25+fy,1.6,1.6,'acid',2.7));eyesL(P,14,20+fy,2.8);P.push(Pg([[24,24+fy],[30,12+fy-fl],[34,22+fy]],'yel',3));return P},
 coalgolem(t){const P=[],b=Math.round(Math.sin(t)*1),gl=.5+.5*Math.sin(t*3);P.push(Cp({x:18,y:36},{x:17,y:45},4.6,4.4,'coalr',1));P.push(Cp({x:31,y:36},{x:32,y:45},4.6,4.4,'coalr',1));
   P.push(Cp({x:36,y:16+b},{x:42,y:30},4,3.6,'coalr',1.4));P.push(Pg([[10,12+b],[38,10+b],[40,38],[8,38]],'coalr',2));
   [[14,18,22,26],[26,14,34,22],[18,30,30,34],[12,26,16,32]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.7,.7,null,2.1,{col:M6_EMB,noline:1})));
   P.push(E(24,26+b,4,4,null,2.2,{col:gl>.5?M6_EMB2:M6_EMB}));P.push(Pg([[14,2+b],[32,2+b],[33,12+b],[13,12+b]],'coalr',2.5));[[18,7],[27,7]].forEach(([x,y])=>P.push(E(x,y+b,2,1.6,null,2.6,{col:M6_EMB2})));
   P.push(Cp({x:10,y:16+b},{x:4,y:30},4.4,4,'coalr',3));P.push(E(4,33,5,5,'coalr',3.1));return P},
 bucket(t){const P=[],a0=-t*1.2,c={x:16,y:22};P.push(Cp({x:22,y:42},{x:44,y:42},4,4,'tar',1));[24,31,38,43].forEach(x=>P.push(E(x,42,1.6,1.6,'metal',1.1)));
   P.push(Pg([[24,24],[44,24],[44,38],[24,38]],'yel',2));P.push(Pg([[28,16],[40,16],[42,24],[26,24]],'yel',2.1));P.push(Pg([[30,18],[38,18],[39,23],[29,23]],'glass',2.2));eyesL(P,30,20,2.2,YEL);
   P.push(Cp({x:26,y:28},c,2.4,2.2,'rust',2.5));P.push(E(c.x,c.y,10,10,'rust',2.6));P.push(E(c.x,c.y,6,6,'coalr',2.7));
   for(let i=0;i<6;i++){const a=a0+i/6*Math.PI*2,q={x:c.x+Math.cos(a)*11,y:c.y+Math.sin(a)*11};P.push(Pg([[q.x-3,q.y-3],[q.x+3,q.y-3],[q.x+2,q.y+3],[q.x-2,q.y+3]],'metal',2.8))}return P},
 kolo(t){const P=[],b=Math.round(Math.sin(t)*1),sw=Math.sin(t)*.4;P.push(Cp({x:17,y:37},{x:16,y:45},5,4.6,'coalr',1));P.push(Cp({x:31,y:37},{x:32,y:45},5,4.6,'coalr',1));
   P.push(Cp({x:36,y:18+b},{x:41,y:31},4.2,4,'coalr',1.4));P.push(E(24,28+b,14,12,'coalr',2));[[18,24],[30,22],[24,34]].forEach(([x,y])=>P.push(Cp({x,y:y+b},{x:x+4,y:y+4+b},.7,.7,null,2.1,{col:M6_EMB,noline:1})));
   P.push(Cp({x:12,y:22+b},{x:36,y:22+b},2.4,2.4,'gold',2.2));P.push(E(24,22+b,3,3,null,2.3,{col:hex('#ff3040')}));
   P.push(E(22,11+b,8,7.5,'snout',3));P.push(Pg([[13,9+b],[15,2+b],[30,1+b],[32,9+b]],'yel',3.2));P.push(Cp({x:11,y:9+b},{x:33,y:9+b},1,1,'yel',3.25));P.push(E(14,5+b,2.4,2.4,null,3.3,{col:hex('#fff8c0')}));
   eyesL(P,16,11+b,3.3,M6_EMB2);P.push(Pg([[12,15+b],[22,14+b],[30,16+b],[24,20+b],[16,19+b]],'coalr',3.4));
   P.push(Cp({x:12,y:24+b},{x:4,y:30},3.6,3.2,'coalr',3.5));P.push(Cp({x:4,y:32},{x:2+sw*6,y:4},1.4,1.4,'bark',3.6));P.push(Pg([[-6+sw*6,6],[12+sw*6,2],[6+sw*6,10]],'metal',3.7));return P},
 /* ch7 fire valley */
 flame(t){const P=[],fy=-4+Math.round(Math.sin(t*2)*2),f=Math.sin(t*4)*2;P.push(Pg([[12,40+fy],[10,26+fy],[16,14+fy+f],[20,22+fy],[24,6+fy-f],[30,20+fy],[34,12+fy+f],[38,28+fy],[36,40+fy]],'fire',2));
   P.push(Pg([[16,40+fy],[16,30+fy],[22,22+fy],[26,30+fy],[30,24+fy],[32,40+fy]],'lava',2.1));eyesL(P,17,29+fy,2.6,hex('#fff0a0'));P.push(Pg([[19,35+fy],[25,34+fy],[23,37+fy]],null,2.7,{col:DK}));return P},
 cable(t){const P=[],seg=[];for(let i=0;i<7;i++)seg.push({x:12+i*5,y:40-Math.max(0,Math.sin(t*2-i*.8))*4-(i===0?6:0)});
   for(let i=6;i>0;i--)P.push(Cp(seg[i],seg[i-1],2.6,2.8,'tar',1+(6-i)*.1));P.push(Pg([[seg[0].x-6,seg[0].y-5],[seg[0].x+4,seg[0].y-5],[seg[0].x+4,seg[0].y+3],[seg[0].x-6,seg[0].y+3]],'copper',2));
   P.push(Cp({x:seg[0].x-6,y:seg[0].y-3},{x:seg[0].x-10,y:seg[0].y-3},.7,.7,'copper',1.9));P.push(Cp({x:seg[0].x-6,y:seg[0].y+1},{x:seg[0].x-10,y:seg[0].y+1},.7,.7,'copper',1.9));
   eyesL(P,seg[0].x-4,seg[0].y-2,2.2,YEL);if(Math.sin(t*5)>0)bolt(P,seg[0].x-14,seg[0].y-6,1,2.4);return P},
 insul(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:20,y:40},{x:19,y:45},1.6,1.4,'metal',1));P.push(Cp({x:28,y:40},{x:29,y:45},1.6,1.4,'metal',1));
   for(let i=0;i<4;i++)P.push(E(24,38-i*7+b,9-i*.6,3.4,'ceram',2+i*.1));P.push(Cp({x:24,y:12+b},{x:24,y:5+b},1.2,1.2,'metal',2.5));P.push(E(24,5+b,2,2,'copper',2.6));
   eyesL(P,18,25+b,2.8);P.push(Cp({x:15,y:31+b},{x:8,y:26+b+Math.sin(t*2)*2},1.2,1,'ceram',2.9));if(Math.sin(t*3)>.3)bolt(P,22,-2+b,.8,2.7);return P},
 charstump(t){const P=[],b=Math.round(Math.sin(t)*1),gl=Math.sin(t*4)>0;P.push(Cp({x:16,y:40},{x:12,y:45},1.6,1.2,'coalr',1));P.push(Cp({x:32,y:40},{x:36,y:45},1.6,1.2,'coalr',1));
   P.push(Cp({x:24,y:22+b},{x:24,y:39},9.5,10,'coalr',2));P.push(E(24,15+b,9.4,3.6,'tar',2.5));P.push(E(24,15+b,5,1.8,null,2.6,{col:gl?M6_EMB2:M6_EMB}));
   [[18,26,22,33],[28,24,30,34]].forEach(([a,c,d,e])=>P.push(Cp({x:a,y:c+b},{x:d,y:e+b},.6,.6,null,2.1,{col:M6_EMB,noline:1})));eyesL(P,17,25+b,3,M6_EMB2);
   P.push(E(26,8+b-((t*3)%3),2,1.6,'smog',2.2));return P},
 zapbird(t){const P=[],fy=-9+Math.round(Math.sin(t)*2),fl=Math.sin(t*3)*5;P.push(Pg([[26,24+fy],[34,14+fy+fl],[38,22+fy]],'drum',1));P.push(E(26,27+fy,7.5,6,'drum',2));P.push(E(26,30+fy,5,3,'yel',2.05,{g:2}));
   P.push(E(17,22+fy,5,4.6,'drum',2.5));P.push(Pg([[12,22+fy],[7,24+fy],[12,25+fy]],'gold',2.6));eyesL(P,14,20+fy,2.6,M6_ZAP);bolt(P,18,13+fy,.7,2.7);P.push(Pg([[24,24+fy],[30,12+fy-fl],[34,22+fy]],'drum',3));return P},
 transformer(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:16,y:38},{x:15,y:45},3.8,3.6,'conc',1));P.push(Cp({x:32,y:38},{x:33,y:45},3.8,3.6,'conc',1));
   P.push(Pg([[8,12+b],[40,12+b],[40,39],[8,39]],'conc',2));for(let i=0;i<5;i++)P.push(Cp({x:11+i*7,y:14+b},{x:11+i*7,y:37},.5,.5,null,2.05,{col:hex('#3a3a40'),noline:1}));
   [14,24,34].forEach(x=>{P.push(Cp({x,y:12+b},{x,y:4+b},1.6,1.6,'ceram',1.8));P.push(E(x,3+b,2,2,'copper',1.9))});P.push(Pg([[19,24+b],[29,24+b],[24,33+b]],null,2.2,{col:YEL}));P.push(Pg([[23,26+b],[25,26+b],[24.5,30+b]],null,2.3,{col:BLACK}));
   eyesL(P,15,17+b,2.8,M6_ZAP);if(Math.sin(t*4)>0){bolt(P,6,0+b,1,2.6);bolt(P,38,2+b,1,2.6)}return P},
 pylon(t){const P=[],b=Math.round(Math.sin(t*2)*.7),w=Math.sin(t*2)*2;[[12,0],[36,0]].forEach(([x],i)=>{P.push(Cp({x,y:30+b},{x:x+(i?w:-w),y:46},1.4,1.4,'metal',1));P.push(Cp({x:24,y:30+b},{x:x+(i?w:-w),y:46},.7,.7,'metal',1))});
   P.push(Pg([[16,30+b],[32,30+b],[28,8+b],[20,8+b]],'metal',2,{g:9}));for(let i=0;i<3;i++){const y=12+i*6+b;P.push(Cp({x:19-i,y},{x:29+i,y:y+5},.5,.5,null,2.1,{col:hex('#5f6676')}));P.push(Cp({x:29+i,y},{x:19-i,y:y+5},.5,.5,null,2.1,{col:hex('#5f6676')}))}
   P.push(Cp({x:6,y:12+b},{x:42,y:12+b},1.4,1.4,'metal',2.2));[8,40].forEach(x=>P.push(Cp({x,y:13+b},{x,y:17+b},1,1,'ceram',2.3)));P.push(Pg([[20,2+b],[28,2+b],[24,8+b]],'metal',2.2));
   P.push(Pg([[19,16+b],[29,16+b],[29,22+b],[19,22+b]],'tar',2.4));eyesL(P,20,19+b,2.5,M6_ZAP);if(Math.sin(t*3)>.2)bolt(P,38,16+b,1,2.6);return P},
 volta(t){const P=[],b=Math.round(Math.sin(t)*1),z=Math.sin(t*4);P.push(Pg([[12,44],[16,26+b],[32,26+b],[36,44]],'drum',1.5));for(let i=0;i<3;i++)P.push(Cp({x:14+i,y:32+i*4+b},{x:34-i,y:32+i*4+b},.5,.5,null,1.55,{col:M6_ZAP,noline:1}));
   P.push(E(24,22+b,8,6,'drum',2));P.push(E(24,10+b,7,6.5,'ceram',3));P.push(Pg([[17,6+b],[31,6+b],[31,3+b],[17,3+b]],'copper',3.1));
   [[24,-6],[24,-12]].forEach(([x,y],i)=>P.push(E(x,y+b+6,6-i*1.5,1.6,'copper',3.2-i*.05)));P.push(E(24,-10+b,2.4,2.4,null,3.3,{col:M6_ZAP}));
   eyesL(P,18,10+b,3.4,hex('#5ff4ff'));P.push(Cp({x:18,y:15+b},{x:23,y:15.5+b},.5,.5,null,3.5,{col:hex('#ff3a7a')}));
   P.push(Cp({x:17,y:21+b},{x:6,y:14+z*2},1.6,1.4,'drum',3.4));P.push(Cp({x:31,y:21+b},{x:40,y:12-z*2},1.6,1.4,'drum',1.4));bolt(P,2,4+z*2,1.3,3.5);bolt(P,38,0-z*2,1.1,1.5);crown(P,24,4+b,.8);return P},
 /* ch8 acid plateau */
 acidcloud(t){const P=[],fy=-10+Math.round(Math.sin(t)*2);[[16,24],[24,20],[32,24],[20,28],[29,29]].forEach(([x,y],i)=>P.push(E(x,y+fy,7,6,'acid',1+i*.01,{g:5})));
   for(let i=0;i<3;i++){const u=(t*.4+i/3)%1;P.push(E(16+i*8,34+fy+u*10,1,1.6,null,.9,{col:M6_GRN}))}eyesL(P,16,23+fy,2,YEL);P.push(Pg([[18,29+fy],[24,28+fy],[22,31+fy]],null,2.2,{col:DK}));return P},
 wither(t){const P=[],sw=Math.sin(t)*2;P.push(Cp({x:26,y:44},{x:24,y:24},1.6,1.4,'bark',1));P.push(Pg([[25,34],[34,30],[28,36]],'acid',1.1));
   const c={x:18+sw,y:20};for(let i=0;i<9;i++){const a=i/9*Math.PI*2;P.push(E(c.x+Math.cos(a)*8,c.y+Math.sin(a)*8+2,3,4.5,'sand',1.5,{a:a+Math.PI/2}))}
   P.push(E(c.x,c.y,7,7,'bark',2));eyesL(P,c.x-6,c.y-1,2.2,YEL);P.push(Pg([[c.x-4,c.y+4],[c.x+2,c.y+3],[c.x,c.y+6]],null,2.3,{col:DK}));P.push(Cp({x:22,y:44},{x:30,y:44},2.6,2.6,'bark',.9));return P},
 slug(t){const P=[],q=Math.sin(t*2);P.push(Cp({x:12,y:40},{x:42,y:42},5+q*.5,3,'acid',1.5));P.push(E(16,36,7,6,'acid',2));
   P.push(Cp({x:13,y:31},{x:10,y:22+q},.8,.7,'acid',2.1));P.push(Cp({x:19,y:31},{x:20,y:21-q},.8,.7,'acid',2.1));P.push(E(10,21+q,1.8,1.8,null,2.2,{col:WHITE}));P.push(E(20,20-q,1.8,1.8,null,2.2,{col:WHITE}));
   P.push(E(10,21+q,.8,.8,null,2.3,{col:BLACK}));P.push(E(20,20-q,.8,.8,null,2.3,{col:BLACK}));P.push(Cp({x:30,y:46},{x:46,y:46},.6,.6,null,1,{col:M6_GRN,noline:1}));P.push(Cp({x:12,y:39},{x:17,y:39},.5,.5,null,2.3,{col:DK}));return P},
 acidfrog(t){const P=[],b=Math.round(Math.abs(Math.sin(t))*-3);P.push(E(30,42,7,3,'toxp',1));P.push(E(26,34+b,11,8,'toxp',2));[[22,30],[30,32],[27,37]].forEach(([x,y])=>P.push(E(x,y+b,1.8,1.4,null,2.1,{col:M6_GRN,noline:1})));
   P.push(E(14,30+b,7,6,'toxp',2.5));P.push(E(11,24+b,3,3,'toxp',2.6));P.push(E(18,24+b,3,3,'toxp',2.6));P.push(E(11,24+b,1.8,1.8,null,2.7,{col:YEL}));P.push(E(18,24+b,1.8,1.8,null,2.7,{col:YEL}));
   P.push(E(11,24+b,.7,1.2,null,2.8,{col:BLACK}));P.push(E(18,24+b,.7,1.2,null,2.8,{col:BLACK}));P.push(Cp({x:8,y:33+b},{x:17,y:33.5+b},.5,.5,null,2.7,{col:DK}));P.push(E(16,43,4,2,'toxp',2.9));return P},
 moth(t){const P=[],fy=-10+Math.round(Math.sin(t)*2),fl=Math.sin(t*4)*4;P.push(Pg([[24,24+fy],[10,10+fy+fl],[6,24+fy],[14,30+fy]],'sand',1));P.push(Pg([[24,24+fy],[38,10+fy+fl],[42,24+fy],[34,30+fy]],'sand',1));
   [[12,18],[36,18]].forEach(([x,y])=>{P.push(E(x,y+fy+fl*.5,3,3,'toxp',1.1));P.push(E(x,y+fy+fl*.5,1.2,1.2,null,1.2,{col:YEL}))});P.push(Cp({x:24,y:20+fy},{x:24,y:34+fy},3,2,'vult',2));
   P.push(E(24,18+fy,3.4,3,'vult',2.5));eyesL(P,20,18+fy,1.6,YEL);for(let i=0;i<3;i++){const u=(t*.5+i/3)%1;P.push(E(22+i*2,36+fy+u*8,.8,.8,null,.8,{col:hex('#e0d0a0')}))}return P},
 toxictree(t){const P=[],sw=Math.sin(t)*1.5;P.push(Cp({x:26,y:44},{x:24,y:14},5,4,'bark',1.5));P.push(Cp({x:24,y:18},{x:12+sw,y:8},2,1.2,'bark',1.4));P.push(Cp({x:25,y:22},{x:38-sw,y:10},2,1.2,'bark',1.4));
   P.push(Cp({x:18,y:44},{x:34,y:44},3,3,'bark',1.3));[[12,8],[38,10],[24,4],[18,14],[32,16]].forEach(([x,y],i)=>P.push(E(x+sw*(i%2?-1:1),y,3,3.4,'toxp',2+i*.01)));
   eyesL(P,19,26,3,M6_GRN);P.push(Pg([[19,33],[22,31],[25,33],[28,31],[29,34],[19,35]],null,2.6,{col:DK}));return P},
 puddle(t){const P=[],q=Math.sin(t*2);P.push(E(26,42,18,4,'acid',1));P.push(Pg([[12,42],[14,26+q],[22,18],[32,20],[38,30-q],[40,42]],'acid',2));
   for(let i=0;i<3;i++){const u=(t*.6+i/3)%1;P.push(E(18+i*7,36-u*14,1.4,1.4,null,2.1,{col:hex('#d8ff8a'),noline:1}))}eyesL(P,18,27,3,YEL);P.push(E(22,34,3,2,null,2.6,{col:DK}));
   P.push(Cp({x:14,y:34},{x:6,y:30+q*3},2.2,1.6,'acid',2.5));P.push(Cp({x:38,y:34},{x:46,y:30-q*3},2.2,1.6,'acid',1.5));return P},
 sandra(t){const P=[],b=Math.round(Math.sin(t)*1),dr=(t*.8)%1;P.push(Pg([[10,45],[16,24+b],[32,24+b],[38,45]],'toxp',1.5));P.push(Cp({x:12,y:44},{x:36,y:44},1.2,1.2,'acid',1.6));
   P.push(E(24,16+b,7,6.5,'acid',2.5));P.push(Pg([[14,14+b],[34,14+b],[26,-2+b],[18,-6+b]],'toxp',2.6));P.push(Cp({x:12,y:14+b},{x:36,y:14+b},1.4,1.4,'toxp',2.65));
   P.push(Pg([[17,16+b],[11,19+b],[17,19+b]],'acid',2.7));eyesL(P,18,14+b,2.8,M6_GRN);P.push(Cp({x:19,y:21+b},{x:24,y:20+b},.5,.5,null,2.9,{col:DK}));
   P.push(Cp({x:30,y:26+b},{x:40,y:4},.9,.9,'bark',3));P.push(Pg([[28,6],[52,6],[46,-2],[34,-2]],'acid',3.1));for(let i=0;i<4;i++)P.push(E(30+i*6,8+dr*10+(i%2)*3,.9,1.4,null,3.2,{col:M6_GRN}));
   P.push(Cp({x:16,y:28+b},{x:6,y:34},1.6,1.4,'toxp',3.3));P.push(E(4,36,3,2.6,null,3.4,{col:M6_GRN}));crown(P,24,-2+b,.7);return P},
 /* ch9 sewage swamp */
 sludge(t){const P=[],q=Math.sin(t);const rx=13*(1+q*.08),ry=10*(1-q*.08),cy=43-ry;P.push(E(24,cy,rx,ry,'sludge',1));
   for(let i=0;i<3;i++){const u=(t*.5+i/3)%1;P.push(E(16+i*8,cy-ry*.5-u*6,1.5+u,1.5+u,null,1.2,{col:hex('#a4aa58'),noline:1}))}
   P.push(Cp({x:28,y:cy+2},{x:36,y:cy+3},.6,.6,null,1.3,{col:WHITE}));[30,33].forEach(x=>P.push(Cp({x,y:cy},{x,y:cy+5},.4,.4,null,1.3,{col:WHITE})));eyesL(P,15,cy-2,2,YEL);return P},
 mutfish(t){const P=[],w=Math.sin(t*2)*2;P.push(Cp({x:18,y:38},{x:16-w,y:45},1.4,1.2,'mut',1));P.push(Cp({x:28,y:38},{x:30+w,y:45},1.4,1.2,'mut',1));
   P.push(Pg([[34,28],[44,20+w],[43,36-w]],'mut',1.5));P.push(E(24,29,12,8.5,'mut',2));[[22,26],[28,30],[25,34]].forEach(([x,y])=>P.push(E(x,y,1.6,1.2,null,2.1,{col:hex('#3a7458'),noline:1})));
   [[12,24],[17,22],[14,30]].forEach(([x,y])=>{P.push(E(x,y,2.2,2.2,null,2.2,{col:YEL}));P.push(E(x-.5,y,1,1,null,2.3,{col:BLACK}))});P.push(Cp({x:10,y:34},{x:16,y:35},.6,.6,null,2.3,{col:DK}));return P},
 pipesnake(t){const P=[],seg=[];for(let i=0;i<6;i++)seg.push({x:12+i*6,y:38-Math.max(0,Math.sin(t*2-i*.8))*5-(i===0?8:0)});
   for(let i=5;i>0;i--){P.push(Cp(seg[i],seg[i-1],4,4.2,'rust',1+(5-i)*.1));P.push(E(seg[i].x,seg[i].y,4.6,4.6,'metal',1.05+(5-i)*.1))}
   P.push(E(seg[0].x,seg[0].y,6,5.5,'rust',2));P.push(E(seg[0].x-4,seg[0].y+1,3,3,null,2.1,{col:hex('#1a1a0a')}));P.push(E(seg[0].x-4,seg[0].y+3+((t*4)%3),1.4,1.8,'sludge',2.2));eyesL(P,seg[0].x-3,seg[0].y-5,2.2,YEL);return P},
 gator(t){const P=[],j=Math.max(0,Math.sin(t*2))*4;[[20,1],[34,1],[24,2.5],[38,2.5]].forEach(([x,z],i)=>P.push(Cp({x,y:38},{x:x+(i%2?1:-1),y:45},2,1.8,'lgreen',z)));
   P.push(Cp({x:36,y:36},{x:47,y:32},4,1.6,'lgreen',1.5));P.push(E(29,35,11,6,'lgreen',2));[[24,30],[30,30],[36,32]].forEach(([x,y])=>P.push(Pg([[x-2,y],[x,y-3],[x+2,y]],'lgreen',1.9)));
   P.push(Pg([[19,32],[2,33],[2,36],[19,37]],'lgreen',2.5));P.push(Pg([[19,37],[3,37+j],[3,39+j],[19,40]],'lgreen',2.4));for(let i=0;i<4;i++)P.push(Pg([[4+i*3.5,36],[5.5+i*3.5,38],[7+i*3.5,36]],null,2.6,{col:WHITE}));
   P.push(E(16,30,2.6,2.2,'lgreen',2.6));P.push(E(16,30,1.2,1.2,null,2.7,{col:YEL}));[[28,34],[22,36]].forEach(([x,y])=>P.push(E(x,y,1.8,1.2,null,2.2,{col:hex('#965024'),noline:1})));return P},
 mosquito(t){const P=[],fy=-11+Math.round(Math.sin(t*3)*2),fl=Math.sin(t*8)*3;P.push(E(30,22+fy+fl,7,3,null,1,{col:hex('#d8f0ff')}));P.push(E(34,24+fy-fl,6,2.6,null,.9,{col:hex('#c0e0f0')}));
   P.push(Cp({x:24,y:28+fy},{x:36,y:32+fy},3,2,'tar',2));P.push(E(20,26+fy,4,3.6,'tar',2.5));P.push(Cp({x:16,y:27+fy},{x:6,y:30+fy},.5,.4,null,2.6,{col:hex('#ff5a7a')}));
   [[24,30],[28,31],[32,32]].forEach(([x,y])=>P.push(Cp({x,y:y+fy},{x:x-3,y:y+8+fy},.4,.4,null,1.5,{col:hex('#2a2a32')})));P.push(E(18,24+fy,1.8,1.8,null,2.7,{col:hex('#ff3040')}));return P},
 drainbot(t){const P=[],b=Math.round(Math.sin(t*2)*.6),q=Math.sin(t*3);P.push(Cp({x:14,y:42},{x:36,y:42},4,4,'tar',1));[16,24,32].forEach(x=>P.push(E(x,42,1.6,1.6,'metal',1.1)));
   P.push(E(26,26+b,13,12,'rust',2));P.push(Cp({x:14,y:26+b},{x:38,y:26+b},1,1,'metal',2.1));P.push(E(20,22+b,5,5,'glass',2.2));P.push(E(20,22+b,2.4,2.4,null,2.3,{col:hex('#9aff3a')}));
   P.push(Cp({x:14,y:30+b},{x:6,y:34+q*2},2.6,2.4,'tar',2.5));P.push(E(4,35+q*2,3,3,'metal',2.6));P.push(E(1,37+q*2+((t*5)%2),1.4,2,'sludge',2.7));
   P.push(Cp({x:32,y:14+b},{x:34,y:4+b},1.2,1.2,'metal',1.8));P.push(E(34,3+b,2,2,null,1.9,{col:hex('#ff3040')}));return P},
 leech(t){const P=[],q=Math.sin(t*2);for(let i=0;i<6;i++){P.push(E(40-i*5,36-Math.sin(i*.6+t*2)*2-(i>3?(i-3)*3:0),7-i*.3,6-i*.2,'pinkm',1+i*.1,{g:7}))}
   [[38,32],[30,30],[22,28]].forEach(([x,y])=>P.push(Cp({x,y:y-2},{x,y:y+6},.4,.4,null,1.7,{col:hex('#7a2a3a'),noline:1})));const h={x:13,y:24-q};
   P.push(E(h.x,h.y,6.5,6,'pinkm',2));P.push(E(h.x-2,h.y+1,4,4,null,2.1,{col:hex('#3a0a10')}));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;P.push(Pg([[h.x-2+Math.cos(a)*4,h.y+1+Math.sin(a)*4],[h.x-2+Math.cos(a+.25)*2,h.y+1+Math.sin(a+.25)*2],[h.x-2+Math.cos(a+.5)*4,h.y+1+Math.sin(a+.5)*4]],null,2.2,{col:WHITE}))}
   eyesL(P,h.x-1,h.y-6,2,YEL);return P},
 ord(t){const P=[],b=Math.round(Math.sin(t)*1),dr=(t*.6)%1;P.push(Cp({x:18,y:36},{x:17,y:45},4,3.8,'rust',1));P.push(Cp({x:30,y:36},{x:31,y:45},4,3.8,'rust',1));
   P.push(Cp({x:38,y:44},{x:40,y:-2},1.2,1.2,'rust',1.2));[[34,-2],[40,-6],[46,-2]].forEach(([x,y])=>P.push(Pg([[x-1.2,y+8],[x,y],[x+1.2,y+8]],'metal',1.25)));
   P.push(E(24,27+b,12,11,'metal',2));P.push(Cp({x:13,y:24+b},{x:35,y:24+b},1.6,1.6,'rust',2.1));[[18,30],[28,32]].forEach(([x,y])=>P.push(E(x,y+b,2.6,1.6,'sludge',2.15)));
   P.push(E(24,11+b,8,8,'metal',3));P.push(Pg([[16,9+b],[32,9+b],[32,13+b],[16,13+b]],null,3.1,{col:hex('#1a1a0a')}));P.push(Cp({x:17,y:11+b},{x:23,y:11+b},.9,.9,null,3.2,{col:M6_GRN}));
   P.push(Cp({x:24,y:3+b},{x:30,y:-3+b},1.6,1,'sludge',2.9));P.push(E(29,19+b+dr*12,1.2,1.8,'sludge',3.3));
   P.push(Pg([[2,20],[14,18],[14,40],[8,44],[2,40]],'rust',3.5));P.push(E(8,30,3.4,3.4,'sludge',3.6));P.push(Cp({x:4,y:24},{x:12,y:22},.6,.6,null,3.6,{col:hex('#c88446'),noline:1}));crown(P,24,3+b,.7);return P},
 /* ch10 grand power plant */
 bulb(t){const P=[],b=Math.round(Math.sin(t*2)*.8),gl=.5+.5*Math.sin(t*5);P.push(Cp({x:20,y:39},{x:19,y:45},1.6,1.4,'royal',1));P.push(Cp({x:28,y:39},{x:29,y:45},1.6,1.4,'royal',1));
   P.push(E(24,34+b,7,7,'royal',2));P.push(Pg([[19,24+b],[29,24+b],[28,28+b],[20,28+b]],'metal',2.2));P.push(E(24,16+b,8,9,null,2.5,{col:gl>.5?hex('#fff6b0'):hex('#ffe066')}));
   P.push(Cp({x:22,y:20+b},{x:24,y:13+b},.5,.5,null,2.6,{col:hex('#d89a00'),noline:1}));P.push(Cp({x:26,y:20+b},{x:24,y:13+b},.5,.5,null,2.6,{col:hex('#d89a00'),noline:1}));eyesL(P,18,15+b,2.7);
   P.push(Cp({x:17,y:33+b},{x:9,y:28+b},1.4,1.2,'royal',2.8));P.push(Cp({x:9,y:34},{x:9,y:20},.6,.6,'metal',2.9));P.push(Pg([[7,20],[11,20],[9,15]],'metal',2.95));return P},
 battery(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:20,y:40},{x:19,y:45},1.6,1.4,'tar',1));P.push(Cp({x:28,y:40},{x:29,y:45},1.6,1.4,'tar',1));
   P.push(Cp({x:24,y:14+b},{x:24,y:38},8.5,8.5,'tar',2));P.push(Pg([[15.5,14+b],[32.5,14+b],[32.5,22+b],[15.5,22+b]],'copper',2.1));
   P.push(Pg([[21,4+b],[27,4+b],[27,7+b],[21,7+b]],'metal',2.2));P.push(Pg([[19,30+b],[21,27+b],[23,30+b]],null,2.3,{col:M6_ZAP}));P.push(Cp({x:20,y:34+b},{x:28,y:34+b},.7,.7,null,2.3,{col:WHITE}));P.push(Cp({x:24,y:30+b},{x:24,y:38+b},.7,.7,null,2.3,{col:WHITE}));
   eyesL(P,17,17+b,2.6,M6_ZAP);return P},
 turbine(t){const P=[],fy=-12+Math.round(Math.sin(t)*2),a0=t*5;P.push(E(24,24+fy,7,7,'royal',1));for(let i=0;i<6;i++){const a=a0+i/6*Math.PI*2;P.push(Pg([[24+Math.cos(a)*5,24+fy+Math.sin(a)*5],[24+Math.cos(a+.25)*14,24+fy+Math.sin(a+.25)*14],[24+Math.cos(a+.6)*13,24+fy+Math.sin(a+.6)*13]],'metal',.8))}
   P.push(E(24,24+fy,3.4,3.4,null,2,{col:M6_VIO}));P.push(E(24,24+fy,1.4,1.4,null,2.1,{col:WHITE}));P.push(Pg([[14,33+fy],[34,33+fy],[30,37+fy],[18,37+fy]],'royal',1.2));return P},
 plug(t){const P=[],seg=[];for(let i=0;i<7;i++)seg.push({x:14+i*5,y:40-Math.max(0,Math.sin(t*2-i*.8))*4-(i===0?6:0)});
   for(let i=6;i>0;i--)P.push(Cp(seg[i],seg[i-1],2.4,2.6,'royal',1+(6-i)*.1));const h=seg[0];P.push(Pg([[h.x-5,h.y-6],[h.x+5,h.y-6],[h.x+5,h.y+5],[h.x-5,h.y+5]],'conc',2));
   P.push(Cp({x:h.x-5,y:h.y-3},{x:h.x-11,y:h.y-3},.9,.9,'gold',1.9));P.push(Cp({x:h.x-5,y:h.y+2},{x:h.x-11,y:h.y+2},.9,.9,'gold',1.9));eyesL(P,h.x-3,h.y-2,2,M6_VIO);return P},
 fuse(t){const P=[],b=Math.round(Math.sin(t*2)*1);P.push(Cp({x:20,y:40},{x:19,y:45},1.4,1.2,'metal',1));P.push(Cp({x:28,y:40},{x:29,y:45},1.4,1.2,'metal',1));
   P.push(Cp({x:24,y:12+b},{x:24,y:38},7,7,'glass',2));P.push(Pg([[16.5,8+b],[31.5,8+b],[31.5,14+b],[16.5,14+b]],'gold',2.1));P.push(Pg([[16.5,36],[31.5,36],[31.5,41],[16.5,41]],'gold',2.1));
   P.push(Cp({x:24,y:15+b},{x:24,y:35},.6,.6,null,2.15,{col:Math.sin(t*6)>0?M6_ZAP:M6_EMB}));eyesL(P,18,22+b,2.6,M6_ZAP);if(Math.sin(t*4)>0)bolt(P,30,2+b,.9,2.5);return P},
 generator(t){const P=[],b=Math.round(Math.sin(t)*1),a0=t*4;P.push(Cp({x:16,y:38},{x:15,y:45},4,3.8,'royal',1));P.push(Cp({x:32,y:38},{x:33,y:45},4,3.8,'royal',1));
   P.push(Pg([[8,12+b],[40,12+b],[40,39],[8,39]],'royal',2));P.push(E(28,26+b,8,8,'metal',2.1));for(let i=0;i<5;i++){const a=a0+i/5*Math.PI*2;P.push(Cp({x:28,y:26+b},{x:28+Math.cos(a)*7,y:26+b+Math.sin(a)*7},1,1,null,2.2,{col:hex('#5f6676')}))}
   P.push(E(28,26+b,2,2,null,2.3,{col:M6_VIO}));eyesL(P,12,17+b,2.6,M6_VIO);[12,20].forEach(x=>P.push(Pg([[x,32+b],[x+5,32+b],[x+5,36+b],[x,36+b]],null,2.2,{col:Math.sin(t*3+x)>0?M6_ZAP:hex('#5a2a0a')})));
   P.push(Cp({x:10,y:18+b},{x:4,y:30},3.6,3.2,'royal',3));P.push(E(4,33,4.4,4.4,'metal',3.1));if(Math.sin(t*3)>.4)bolt(P,38,2+b,1.2,2.4,M6_VIO);return P},
 royalguard(t){const P=[],b=Math.round(Math.sin(t)*1);P.push(Cp({x:19,y:37},{x:18,y:45},3.4,3.2,'royal',1));P.push(Cp({x:29,y:37},{x:30,y:45},3.4,3.2,'royal',1));
   P.push(Pg([[28,22+b],[44,26+b],[40,44],[28,42]],'royal',1.2));P.push(E(24,28+b,10,10,'royal',2));P.push(Cp({x:15,y:24+b},{x:33,y:24+b},1.4,1.4,'gold',2.1));
   P.push(E(23,12+b,7.5,7.5,'royal',3));P.push(Pg([[16,10+b],[30,10+b],[30,14+b],[16,14+b]],null,3.1,{col:BLACK}));P.push(Cp({x:17,y:12+b},{x:22,y:12+b},.8,.8,null,3.2,{col:M6_VIO}));
   P.push(Pg([[17,6+b],[19,-2+b],[21,6+b]],'gold',3.05));P.push(Pg([[25,6+b],[27,-2+b],[29,6+b]],'gold',3.05));
   P.push(Cp({x:10,y:46},{x:10,y:-2},1,1,'metal',3.3));P.push(Pg([[10,-4],[2,4],[10,6],[16,2]],'metal',3.35));P.push(Cp({x:14,y:26+b},{x:10,y:24},2,1.8,'royal',3.4));return P},
 mega1(t){const P=[],b=Math.round(Math.sin(t)*1),fl=Math.sin(t*2)*3;P.push(Pg([[30,16+b],[46,4+b+fl],[44,22+b],[36,26+b]],'royal',1));P.push(Pg([[18,16+b],[2,4+b+fl],[4,22+b],[12,26+b]],'royal',1));
   P.push(Pg([[12,45],[16,22+b],[32,22+b],[36,45]],'royal',1.5));P.push(Cp({x:20,y:22+b},{x:24,y:40},.6,.6,null,1.6,{col:hex('#c8a040'),noline:1}));
   P.push(E(24,20+b,8,7,'royal',2));P.push(Pg([[21,16+b],[27,16+b],[24,24+b]],null,2.1,{col:WHITE}));P.push(Pg([[23,17+b],[25,17+b],[24,22+b]],null,2.2,{col:hex('#c8303c')}));
   P.push(E(24,9+b,7,6.5,'energy',3));P.push(Pg([[18,6+b],[12,-4+b],[20,3+b]],'tar',3.1));P.push(Pg([[30,6+b],[36,-4+b],[28,3+b]],'tar',3.1));
   eyesL(P,18,9+b,3.2,hex('#ff3040'));P.push(Pg([[19,13+b],[29,13+b],[27,15+b],[21,15+b]],null,3.3,{col:DK}));P.push(Cp({x:16,y:24+b},{x:8,y:30+Math.sin(t*2)*2},1.6,1.4,'royal',3.4));P.push(E(7,31+Math.sin(t*2)*2,2.8,2.8,null,3.5,{col:M6_VIO}));crown(P,24,4+b,.8);return P},
 mega2(t){const P=[],b=Math.round(Math.sin(t)*1),gl=.5+.5*Math.sin(t*5);P.push(Cp({x:16,y:36},{x:15,y:45},5,4.6,'royal',1));P.push(Cp({x:32,y:36},{x:33,y:45},5,4.6,'royal',1));
   P.push(Cp({x:38,y:16+b},{x:44,y:32},4.6,4.2,'metal',1.4));P.push(E(44,35,5,5,'royal',1.5));P.push(E(24,26+b,15,13,'metal',2));P.push(E(24,26+b,7,7,'royal',2.1));P.push(E(24,26+b,4.6,4.6,null,2.2,{col:gl>.5?hex('#f4e8ff'):M6_VIO}));
   [[12,16],[36,16]].forEach(([x,y])=>P.push(E(x,y+b,6,4,'royal',2.3)));P.push(E(24,9+b,7,6.5,'energy',3));P.push(Pg([[18,6+b],[10,-6+b],[20,3+b]],'tar',3.1));P.push(Pg([[30,6+b],[38,-6+b],[28,3+b]],'tar',3.1));
   P.push(Pg([[16,7+b],[32,7+b],[32,11+b],[16,11+b]],'metal',3.15));eyesL(P,18,9+b,3.2,hex('#ff3040'));P.push(Cp({x:12,y:20+b},{x:4,y:30},4.4,4,'metal',3.4));P.push(E(4,33,5.4,5.4,'royal',3.5));
   bolt(P,30,-2+b,1,3.6,M6_VIO);crown(P,24,1+b,.8);return P},
 mega3(t){const P=[],b=Math.round(Math.sin(t*1.5)*2),fl=Math.sin(t*3)*4;for(let i=0;i<6;i++){const a=i/6*Math.PI*2+t;P.push(Cp({x:24,y:24+b},{x:24+Math.cos(a)*22,y:24+b+Math.sin(a)*20},1.6,.5,null,.5,{col:i%2?M6_VIO:hex('#f4e8ff')}))}
   P.push(Pg([[30,18+b],[48,2+b+fl],[46,26+b]],'energy',1));P.push(Pg([[18,18+b],[0,2+b+fl],[2,26+b]],'energy',1));P.push(E(24,28+b,14,15,'energy',2));
   for(let i=0;i<4;i++)P.push(Cp({x:14+i*7,y:38+b},{x:12+i*7+Math.sin(t*2+i)*3,y:47},2.4,1,'energy',1.8));P.push(E(24,24+b,6,6,null,2.1,{col:WHITE}));
   P.push(Pg([[16,10+b],[6,-8+b],[20,6+b]],'royal',2.5));P.push(Pg([[32,10+b],[42,-8+b],[28,6+b]],'royal',2.5));[[17,18],[31,18]].forEach(([x,y])=>{P.push(E(x,y+b,3.4,2.4,null,2.6,{col:hex('#ff3040')}));P.push(E(x,y+b,1.4,1,null,2.7,{col:WHITE}))});
   P.push(Pg([[16,30+b],[32,30+b],[29,34+b],[19,34+b]],null,2.6,{col:hex('#2a0a4a')}));for(let i=0;i<5;i++)P.push(Pg([[17+i*3,30+b],[18.5+i*3,32.5+b],[20+i*3,30+b]],null,2.7,{col:WHITE}));crown(P,24,6+b,1);return P}
});
Object.assign(MOBNAME,{coal:'석탄 덩어리',cart:'폭주 광차',cbat:'동굴 박쥐',helmgob:'안전모 고블린',canary:'독가스 카나리아',coalgolem:'석탄 골렘',bucket:'버킷휠 굴착기',kolo:'석탄 대장 콜로',
 flame:'불꽃 도깨비',cable:'스파크 전선뱀',insul:'애자 병정',charstump:'숯 그루터기',zapbird:'전기 참새',transformer:'변압기 골렘',pylon:'송전탑 로봇',volta:'고압의 볼타',
 acidcloud:'산성 구름',wither:'시든 해바라기',slug:'산성 민달팽이',acidfrog:'독침 개구리',moth:'독가루 나방',toxictree:'독 나무',puddle:'산성 웅덩이',sandra:'산성비 마녀 산드라',
 sludge:'폐수 슬라임',mutfish:'세눈박이 물고기',pipesnake:'하수관 뱀',gator:'녹슨 악어',mosquito:'독 모기',drainbot:'배수 로봇',leech:'거대 거머리',ord:'폐수 기사 오르드',
 bulb:'와트 졸병',battery:'배터리 병정',turbine:'터빈 드론',plug:'플러그 뱀',fuse:'퓨즈 도깨비',generator:'발전기 골렘',royalguard:'마왕 근위대',mega1:'마왕 메가와트',mega2:'메가와트 · 발전 갑옷',mega3:'메가와트 · 폭주 에너지체'});
Object.assign(FLY,{cbat:12,canary:12,flame:4,zapbird:12,acidcloud:12,moth:12,mosquito:14,turbine:14,mega3:6});
/* ================= chapter 6~10 backgrounds ================= */
const LANT6=[[40,58],[130,52],[220,60],[310,54]],FLM7=[[20,70],[70,76],[125,66],[180,74],[240,68],[300,72],[345,66]],TOW10=[[60,40],[200,32],[310,44]];
THEMES.push(
 {name:'석탄 광산',mobs:['coal','cart','cbat','helmgob','canary'],mids:['coalgolem','bucket'],fin:'kolo',story:'발전소 연료를 캐던 거대한 광산. 마왕군 간부 흑철 장군 콜로가 지키고 있어요.',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,104,['#0c0a0e','#16121a','#221a22','#2e2228','#3a2c2c']);for(let i=0;i<14;i++){const x=(i*29)%VW,l=6+(i*7)%14;for(let y=0;y<l;y++){const hw=Math.max(0,Math.floor((l-y)/4));for(let xx=-hw;xx<=hw;xx++)put(x+xx,y,hex('#1a141c'))}}}),
  far:()=>pcan(360,VH,put=>{const w=hex('#5a3a22'),w2=hex('#3e2816');for(let i=0;i<9;i++){const x=i*40+6;rectP(put,x,40,4,62,w);rectP(put,x+28,40,4,62,w);rectP(put,x-2,38,36,4,w2);lineP(put,x+4,44,x+12,40,'#3e2816');lineP(put,x+28,44,x+20,40,'#3e2816')}
    LANT6.forEach(([x,y])=>{rectP(put,x,y-6,1,6,'#2a1a10');rectP(put,x-2,y,5,5,'#2a1a10');rectP(put,x-1,y+1,3,3,'#ffc860')})}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,100,114,['#2a2024','#1e181c'])}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#3e3430','#322a26','#26201e']);for(let x=0;x<VW;x+=8)rectP(put,x,124,4,2,'#5a3a22');rectP(put,0,122,VW,1,'#8a8a96');rectP(put,0,127,VW,1,'#8a8a96');
    for(let i=0;i<40;i++){const x=(i*31)%VW,y=GYv+6+(i*7)%16;put(x,y,hex('#0e0c10'));put(x+1,y,hex('#0e0c10'));if(i%5===0)put(x,y-1,hex('#ff8a1a'))}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*13)%20,y=118,k=i%3;
    if(k===0){rectP(put,x,y-8,12,7,'#7a4a22');rectP(put,x+1,y-11,10,3,'#16121a');put(x+2,y,hex('#5f6676'));put(x+9,y,hex('#5f6676'))}
    else if(k===1){rectP(put,x,y-7,8,7,'#8a5a2a');lineP(put,x,y-7,x+7,y,'#5a3a1a');lineP(put,x+7,y-7,x,y,'#5a3a1a')}
    else{lineP(put,x,y,x+6,y-10,'#80532a');lineP(put,x+2,y-11,x+10,y-8,'#9aa2b2')}}}),
  anim:(L,s,t)=>{const fo=Math.floor(s*.15)%360;LANT6.forEach(([x,y],i)=>{let xx=x-fo;if(xx<-20)xx+=360;const a=.18+.08*Math.sin(t*6+i*2);L.fillStyle=`rgba(255,200,96,${a.toFixed(2)})`;L.beginPath();L.arc(xx,y+2,10,0,7);L.fill()})}},
 {name:'산불 계곡',mobs:['flame','cable','insul','charstump','zapbird'],mids:['transformer','pylon'],fin:'volta',story:'과열된 송전탑 불꽃에 숲이 타요. 동물들을 대피시켜요!',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#2a0e10','#5a1a14','#9a3218','#d8601e','#f6a040'])}),
  far:()=>pcan(360,VH,put=>{const k=hex('#1e0c0c');for(let i=0;i<30;i++){const x=i*12+3,h=18+(i*7)%16;rectP(put,x,96-h,2,h,k);for(let y=0;y<h-4;y+=3){const hw=Math.max(1,Math.floor((h-y)/5));rectP(put,x-hw+1,96-h+y+2,hw*2,1,k)}}
    [[90,30],[270,26]].forEach(([x,top])=>{lineP(put,x,96,x+8,top,'#2a1414');lineP(put,x+16,96,x+8,top,'#2a1414');for(let y=top+8;y<96;y+=10)lineP(put,x+2+(y-top)/12,y,x+14-(y-top)/12,y,'#2a1414');rectP(put,x-6,top+6,28,2,'#2a1414')});}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,100,114,['#3a1410','#2a0e0c'])}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#3a2a24','#2e221e','#241a18']);for(let i=0;i<40;i++){const x=(i*37)%VW,y=GYv+4+(i*11)%18;put(x,y,hex(i%3?'#5a4a42':'#ff6a1a'))}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*11)%20,y=118,k=i%2;
    if(k===0){rectP(put,x,y-8,8,8,'#1a1210');rectP(put,x+1,y-9,6,1,'#3a2a24');put(x+3,y-9,hex('#ff8a1a'))}else{lineP(put,x,y,x+3,y-14,'#1a1210');lineP(put,x+2,y-8,x+7,y-12,'#1a1210')}}}),
  anim:(L,s,t)=>{const fo=Math.floor(s*.15)%360;FLM7.forEach(([x,y],i)=>{let xx=x-fo;if(xx<-20)xx+=360;const h=8+Math.sin(t*8+i*1.7)*3;L.fillStyle='rgba(255,120,30,.75)';L.fillRect(xx-3,y+18-h,6,h);L.fillStyle='rgba(255,220,90,.85)';L.fillRect(xx-1,y+20-h*.6,3,h*.6)})}},
 {name:'산성비 고원',mobs:['acidcloud','wither','slug','acidfrog','moth'],mids:['toxictree','puddle'],fin:'sandra',story:'발전소 연기가 산성비가 되어 꽃이 시들어요. 꿀벌 요정 비비의 고향이에요.',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#4a5236','#68704a','#8a9060','#aab07c','#c4c898']);for(let i=0;i<5;i++)cloudP(put,(i*41)%VW,12+(i*9)%20,hex('#7a8056'),hex('#626848'))}),
  far:()=>pcan(360,VH,put=>{const m=hex('#6a6070'),m2=hex('#564e5c');[[0,60,70],[90,50,60],[170,66,80],[270,54,70]].forEach(([x,top,w])=>{rectP(put,x+6,top,w-12,96-top,m);for(let y=top;y<top+6;y++)rectP(put,x+6-(y-top),y,w-12+(y-top)*2,1,m2)});
    for(let x=0;x<360;x+=3){const h=4+(x*7)%5;rectP(put,x,96-h,1,h,'#5a6a2a');put(x,95-h,hex(x%9?'#8a7a2a':'#c8a838'))}}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,100,114,['#6a7a3a','#5a6a30'])}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#8a9a4a','#768a3e','#627632']);[[30,128],[110,140],[160,124]].forEach(([x,y])=>{for(let yy=-2;yy<=2;yy++)for(let xx=-8;xx<=8;xx++)if(xx*xx/64+yy*yy/4<=1)put(x+xx,y+yy,hex(yy<0?'#b8f05a':'#7aa826'))});
    for(let i=0;i<30;i++){const x=(i*29)%VW,y=GYv+8+(i*7)%14;put(x,y,hex('#a8b860'))}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*17)%20,y=118,k=i%3;
    if(k===0){rectP(put,x,y-10,1,10,'#5a4a20');lineP(put,x,y-10,x-3,y-7,'#5a4a20');rectP(put,x-5,y-8,4,3,'#a07a20')}
    else if(k===1){rectP(put,x,y-14,1,14,'#5e5e66');rectP(put,x-6,y-17,13,3,'#c84a3a');put(x,y-18,hex('#5e5e66'))}
    else{rectP(put,x,y-6,9,6,'#8a8a8a');rectP(put,x+1,y-5,7,1,'#ffd23a');put(x+4,y-4,BLACK)}}}),
  anim:(L,s,t)=>{}},
 {name:'폐수 늪',mobs:['sludge','mutfish','pipesnake','gator','mosquito'],mids:['drainbot','leech'],fin:'ord',story:'발전소 냉각수가 흘러들어 검게 변한 늪. 목 없는 기사 오르드를 쓰러뜨려요.',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#0e1a1a','#16282a','#20383a','#2e4a4a','#3e5a56'])}),
  far:()=>pcan(360,VH,put=>{const f=hex('#1a2424');[[30,40],[200,34]].forEach(([x,top])=>{rectP(put,x,top,60,96-top,f);[[x+8,top-16],[x+40,top-22]].forEach(([cx,ct])=>rectP(put,cx,ct,6,top-ct,f))});
    [[80,70],[250,64]].forEach(([x,y])=>{rectP(put,x,y,14,6,'#4a4a50');rectP(put,x+12,y+1,3,4,'#2a2a30')});for(let i=0;i<16;i++){const x=i*23,h=10+(i*5)%10;rectP(put,x,96-h,1,h,'#2a3a2a');put(x,95-h,hex('#4a3a20'))}}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,96,114,['#1e2a1e','#141e14','#0e160e']);for(let i=0;i<30;i++){const x=(i*41)%VW,y=98+(i*13)%14;put(x,y,hex('#3a4a2a'))}}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#4a4a2a','#3e3e24','#32321e']);for(let i=0;i<20;i++){const x=(i*43)%VW,y=GYv+4+(i*9)%18;for(let k=0;k<4;k++)put(x+k,y,hex('#26261a'))}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*13)%20,y=118,k=i%3;
    if(k===0){for(let a=0;a<24;a++){const an=a/24*Math.PI*2;put(x+Math.round(Math.cos(an)*5),y-4+Math.round(Math.sin(an)*3),hex('#1a1a1a'))}}
    else if(k===1){rectP(put,x,y-9,7,9,'#5a5a3a');rectP(put,x,y-6,7,1,'#c8a020');rectP(put,x+2,y-10,3,1,'#3a3a2a')}
    else{for(let j=0;j<4;j++)lineP(put,x+j*2,y,x+j*2+(j%2?2:-2),y-12+j,'#4a5a2a')}}}),
  anim:(L,s,t)=>{for(let k=0;k<5;k++){const u=((t*.4+k*.2)%1),x=(k*41+20)%VW;L.fillStyle=`rgba(140,160,90,${(.6*(1-u)).toFixed(2)})`;L.fillRect(x,104-u*4,2,2)}}},
 {name:'마왕의 대발전소',mobs:['bulb','battery','turbine','plug','fuse'],mids:['generator','royalguard'],fin:'mega1',story:'모든 일의 발원지, 마왕 메가와트의 대발전소. 최종 결전이에요!',
  sky:()=>pcan(VW,VH,put=>{grad(put,VW,0,100,['#0a0614','#160c28','#24123e','#341a50','#48245e'])}),
  far:()=>pcan(360,VH,put=>{const k=hex('#120a1e'),k2=hex('#1c1230');TOW10.forEach(([x,top])=>{for(let y=top;y<96;y++){const w=Math.round(18-((y-top)/(96-top))*6+Math.pow((y-top)/(96-top)-.5,2)*16);rectP(put,x-w,y,w*2,1,k)}rectP(put,x-12,top,24,2,k2)});
    rectP(put,110,50,60,46,k2);for(let yy=56;yy<92;yy+=8)for(let xx=114;xx<166;xx+=8)put(xx,yy,hex('#c88aff'));rectP(put,120,30,6,20,k);rectP(put,150,26,6,24,k)}),
  mid:()=>pcan(VW,VH,put=>{grad(put,VW,98,114,['#22183a','#1a1230']);for(let x=0;x<VW;x+=10)rectP(put,x,100,1,14,'#3a2a5a')}),
  ground:()=>pcan(VW,VH,put=>{grad(put,VW,113,VH,['#3a3a4a','#2e2e3c','#24242e']);for(let x=0;x<VW;x+=6)for(let y=114;y<VH;y+=6){put(x,y,hex('#1a1a22'));put(x+3,y+3,hex('#4a4a5a'))}
    for(let x=0;x<VW;x+=16){rectP(put,x,113,8,2,'#ffd23a');rectP(put,x+8,113,8,2,'#1a1a1a')}}),
  props:()=>pcan(360,VH,put=>{for(let i=0;i<6;i++){const x=24+i*60+(i*11)%20,y=118,k=i%2;
    if(k===0){rectP(put,x,y-12,6,12,'#2a2a3a');for(let yy=0;yy<10;yy+=2)rectP(put,x-1,y-11+yy,8,1,'#c88a40')}else{for(let yy=0;yy<7;yy++){const hw=Math.floor(yy*.6);for(let xx=-hw;xx<=hw;xx++)put(x+xx,y-7+yy,hex('#ffd23a'))}put(x,y-4,BLACK);put(x,y-2,BLACK)}}}),
  anim:(L,s,t)=>{const fo=Math.floor(s*.15)%360;TOW10.forEach(([x,top],i)=>{let xx=x-fo;if(xx<-30)xx+=360;const a=.25+.15*Math.sin(t*3+i);L.fillStyle=`rgba(200,138,255,${a.toFixed(2)})`;L.fillRect(xx-10,top-2,20,3)});
    if((t%4)<.12){L.fillStyle='rgba(230,200,255,.85)';let x=40+((t*97)%100),y=0;while(y<70){const nx=x+((y*13)%9)-4;L.fillRect(Math.min(x,nx),y,Math.abs(nx-x)+1,8);x=nx;y+=8}}}}
);
</script>
