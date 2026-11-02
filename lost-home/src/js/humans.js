/* ---------- human bosses: 마왕군 간부 (바르카스 · 릴리스 · 제노스) + 마왕 녹스 ----------
 Authored facing right, ART.human mirrors them to face the bear. Feet at y=0, ~175 units tall (8 heads).
 Like the bear: one outline under every part, then fills; depth from gradients, no inner seams.
 Limbs have two segments (knee / elbow) so poses read as real people. */
const HUM={
 barkas:{skin:'#c9b2a6',armor:'#7a808e',cloth:'#2a2a30',hair:null,weapon:'axe',bulk:1.22,cape:'#4a2a1a',helm:1,wl:74},
 lilith:{skin:'#f2ddd6',armor:'#2a0a18',cloth:'#5c0a28',hair:'#a8102a',weapon:'whip',bulk:.84,dress:1,cape:null,wl:20,hairL:96},
 xenos:{skin:'#e4d6d2',armor:'#262030',cloth:'#141018',hair:'#ececf4',weapon:'sword',bulk:1,cape:'#120e18',wl:76,hairL:30},
 king:{skin:'#dccdc6',armor:'#1c161e',cloth:'#0e080e',hair:'#120a10',weapon:'great',bulk:1.12,cape:'#5a0a16',crown:1,wl:96,hairL:64},
};
const H_LINE='rgba(18,12,20,.9)';
const HKEY={rest:{a:.45,w:.95},wind:{a:Math.PI-.4,w:Math.PI+.7},hit:{a:1.3,w:1.65}};
const dirv=A=>[Math.sin(A),Math.cos(A)];
function humanPose(m){const t=m.t||0,k=HKEY;let a,w,lean=0;
 if(m.atk>=0){const p=m.atk;
  if(p<.35){const e=ease(p/.35);a=lerp(k.rest.a,k.wind.a,e);w=lerp(k.rest.w,k.wind.w,e);lean=-.06*e;}
  else if(p<.55){const e=ease((p-.35)/.2);a=lerp(k.wind.a,k.hit.a,e);w=lerp(k.wind.w,k.hit.w,e);lean=lerp(-.06,.12,e);}
  else{const e=ease((p-.55)/.45);a=lerp(k.hit.a,k.rest.a,e);w=lerp(k.hit.w,k.rest.w,e);lean=.12*(1-e);}}
 else{a=k.rest.a+Math.sin(t*1.6)*.05;w=k.rest.w+Math.sin(t*1.6)*.05;}
 return{a,w,lean};}
const H_SH=[3,-135];
function handPos(a){const[u0,u1]=dirv(a),[f0,f1]=dirv(a+.3);return[H_SH[0]+u0*31+f0*29,H_SH[1]+u1*31+f1*29];}
// two-segment limb: root (x,y), upper angle A1/len L1, lower angle A2/len L2, widths at root/joint/end; end: 'foot' | 'hand'
function limb2(c,x,y,A1,L1,A2,L2,w0,w1,w2,end){
 const[d1x,d1y]=dirv(A1),[d2x,d2y]=dirv(A2),jx=x+d1x*L1,jy=y+d1y*L1,ex=jx+d2x*L2,ey=jy+d2y*L2;
 const n1=[d1y,-d1x],n2=[d2y,-d2x],nj=[(n1[0]+n2[0])/2,(n1[1]+n2[1])/2];
 c.beginPath();c.moveTo(x+n1[0]*w0,y+n1[1]*w0);
 c.quadraticCurveTo(x+d1x*L1*.5+n1[0]*w0*1.08,y+d1y*L1*.5+n1[1]*w0*1.08,jx+nj[0]*w1,jy+nj[1]*w1);
 c.quadraticCurveTo(jx+d2x*L2*.45+n2[0]*w1*1.05,jy+d2y*L2*.45+n2[1]*w1*1.05,ex+n2[0]*w2,ey+n2[1]*w2);
 if(end==='foot'){c.lineTo(ex+n2[0]*w2,ey+1);c.quadraticCurveTo(ex+n2[0]*w2+14,ey-1,ex+n2[0]*w2+17,ey+4);c.lineTo(ex+n2[0]*w2+17,ey+6);c.lineTo(ex-n2[0]*w2-2,ey+6);}
 else c.arc(ex,ey,w2*1.25,Math.atan2(n2[1],n2[0]),Math.atan2(-n2[1],-n2[0]),false);
 c.lineTo(ex-n2[0]*w2,ey-n2[1]*w2);
 c.quadraticCurveTo(jx+d2x*L2*.45-n2[0]*w1*1.05,jy+d2y*L2*.45-n2[1]*w1*1.05,jx-nj[0]*w1,jy-nj[1]*w1);
 c.quadraticCurveTo(x+d1x*L1*.5-n1[0]*w0*1.08,y+d1y*L1*.5-n1[1]*w0*1.08,x-n1[0]*w0,y-n1[1]*w0);
 c.arc(x,y,w0,Math.atan2(-n1[1],-n1[0]),Math.atan2(n1[1],n1[0]),false);c.closePath();
 return[jx,jy,ex,ey];}
function metal(c,y0,y1,base){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(base,.35));g.addColorStop(.35,base);g.addColorStop(.55,shade(base,-.35));g.addColorStop(.7,shade(base,.1));g.addColorStop(1,shade(base,-.45));return g;}
function metalX(c,x0,x1,base){const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,shade(base,-.4));g.addColorStop(.45,shade(base,.3));g.addColorStop(.6,base);g.addColorStop(1,shade(base,-.35));return g;}
function cloth(c,y0,y1,base){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(base,.2));g.addColorStop(1,shade(base,-.4));return g;}
function hWeapon(c,H,m,acc){ // grip at origin, weapon points to -y
 const t=m.t||0;
 if(H.weapon==='axe'){rr(c,-2.2,-76,4.4,86,2);fs(c,metalX(c,-2,2,'#4a3428'),1.3);c.beginPath();c.moveTo(0,-76);c.quadraticCurveTo(24,-84,27,-58);c.quadraticCurveTo(17,-62,0,-51);c.quadraticCurveTo(-17,-62,-27,-58);c.quadraticCurveTo(-24,-84,0,-76);c.closePath();
  c.fillStyle=metal(c,-84,-51,'#a4aab4');c.fill();c.lineWidth=1.5;c.strokeStyle=H_LINE;c.stroke();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1;c.beginPath();c.moveTo(-25,-60);c.quadraticCurveTo(-21,-78,-4,-75);c.moveTo(25,-60);c.quadraticCurveTo(21,-78,4,-75);c.stroke();
  ell(c,0,-64,4,4);c.fillStyle=acc;c.shadowColor=acc;c.shadowBlur=10;c.fill();c.shadowBlur=0;return;}
 if(H.weapon==='sword'||H.weapon==='great'){const L=H.weapon==='great'?96:78,wd=H.weapon==='great'?5.5:3,cv=H.weapon==='sword'?4:0;
  c.beginPath();c.moveTo(-wd,-6);c.quadraticCurveTo(-wd+cv,-L*.6,0,-L);c.quadraticCurveTo(wd+cv,-L*.6,wd,-6);c.closePath();const g=c.createLinearGradient(-wd,0,wd,0);g.addColorStop(0,'#4a4a56');g.addColorStop(.5,'#f0f2fa');g.addColorStop(1,'#2a2a36');c.fillStyle=g;c.fill();c.lineWidth=1.2;c.strokeStyle=H_LINE;c.stroke();
  c.save();c.globalCompositeOperation='lighter';c.shadowColor=acc;c.shadowBlur=16;c.strokeStyle=acc;c.globalAlpha=.5+.3*Math.sin(t*6);c.lineWidth=H.weapon==='great'?2:1.4;c.beginPath();c.moveTo(0,-10);c.quadraticCurveTo(cv*.5,-L*.6,0,-L+6);c.stroke();
  if(H.weapon==='great')for(let i=0;i<5;i++){c.fillStyle=acc;c.fillRect(-1.3,-24-i*13,2.6,6);}
  if(H.weapon==='sword')for(let i=0;i<4;i++){const k=(t*1.5+i/4)%1;ell(c,Math.sin(i*5+t*3)*4,-20-k*60,3*(1-k),6*(1-k));c.fillStyle=acc;c.globalAlpha=(1-k)*.6;c.fill();}c.restore();
  rr(c,-(wd+9),-8,(wd+9)*2,4.5,2);fs(c,metal(c,-8,-3,H.weapon==='great'?'#b08a3a':'#5a5a6a'),1.2);rr(c,-2.2,-3,4.4,13,1.5);fs(c,'#24161a',1.1);ell(c,0,11,3,3);fs(c,metal(c,8,14,'#b08a3a'),1);return;}
 // thorn whip
 rr(c,-2.4,-14,4.8,20,2);fs(c,'#3a0a14',1.2);const lag=m.atk>=0?Math.sin(Math.min(1,m.atk)*Math.PI)*-34:Math.sin(t*2)*6;
 const pts=[];for(let i=0;i<=14;i++){const k=i/14;pts.push([Math.sin(k*3+t*3)*4+lag*k*k,-14-k*86]);}
 c.lineCap='round';for(const[lw,col]of[[4.4,H_LINE],[2.6,'#3a6a2a']]){c.lineWidth=lw;c.strokeStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);c.stroke();}
 for(let i=2;i<14;i+=2){const q=pts[i],s=i%4?1:-1;c.beginPath();c.moveTo(q[0],q[1]);c.lineTo(q[0]+5*s,q[1]-2);c.lineTo(q[0],q[1]-4);c.fillStyle='#e0e8c8';c.fill();}
 const tip=pts[14];c.save();c.translate(tip[0],tip[1]);for(let i=0;i<6;i++){c.rotate(TAU/6);ell(c,0,-4,3.6,5);c.fillStyle=i%2?acc:shade(acc,-.35);c.fill();}ell(c,0,0,2.4,2.4);c.fillStyle='#ffd0dc';c.fill();c.restore();}
function drawHuman(c,m,H,acc){
 const t=m.t||0,ph=m.ph||0,walk=m.walk==null?.6:m.walk,b=H.bulk,{a,w,lean}=humanPose(m),br=Math.sin(t*1.6)*.7;
 const st=Math.sin(ph)*.32*walk,kn=k=>.12+Math.max(0,Math.sin(ph+k))*.5*walk;
 const HP=[0,-90],HD=[4,-160+br*.3],hand=handPos(a),flow=Math.sin(t*2.2)*6+walk*4;
 c.save();c.rotate(lean);
 if(H===HUM.king||H===HUM.xenos){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const k=(t*.45+i/12)%1;ell(c,-24+Math.sin(i*7)*30,-6-k*160,5+i%3*3,9+i%3*4);c.fillStyle=acc;c.globalAlpha=(1-k)*.13;c.fill();}c.restore();}
 const parts=[],armorG=()=>metalX(c,-20*b,22*b,H.armor);
 if(H.cape)parts.push({p:()=>{c.beginPath();c.moveTo(-12*b,-142);c.bezierCurveTo(-30*b-flow,-104,-38*b-flow*1.4,-52,-44*b-flow*2,-3);
   for(let i=0;i<7;i++)c.lineTo(-44*b-flow*2+i*7*b,(i%2?-12:-2)+Math.sin(t*4+i)*2);c.bezierCurveTo(-8*b,-46,-4*b,-96,10*b,-140);c.closePath();},f:()=>cloth(c,-145,0,H.cape)});
 if(H.hairL)parts.push({p:()=>{const L=H.hairL;c.beginPath();c.moveTo(HD[0]-9,HD[1]-11);
   c.bezierCurveTo(HD[0]-20-flow*.3,HD[1]+L*.25,HD[0]-24-flow*.8,HD[1]+L*.7,HD[0]-18-flow*1.2,HD[1]+L);c.bezierCurveTo(HD[0]-8,HD[1]+L*.6,HD[0]-3,HD[1]+L*.25,HD[0]+2,HD[1]-2);c.closePath();},f:()=>cloth(c,HD[1]-12,HD[1]+H.hairL,H.hair),hair:1});
 if(!H.dress)parts.push({p:()=>limb2(c,-3*b,-90,-st,44,-st-kn(Math.PI),44,7.5*b,5.6*b,4.4*b,'foot'),f:()=>metalX(c,-12,10,shade(H.armor,-.18)),leg:1});
 parts.push({p:()=>limb2(c,-3,-139,.12-st*.6+(m.atk>=0?a*.12:0),30,.42-st*.6,28,5.2*b,4*b,3.4*b,'hand'),f:()=>metalX(c,-12,8,shade(H.armor,-.18))});
 if(H.dress)parts.push({p:()=>{c.beginPath();c.moveTo(-9,-96);c.bezierCurveTo(-16,-66,-28-flow*.4,-22,-36-flow*.6,0);c.quadraticCurveTo(0,4,32-flow*.3,0);c.bezierCurveTo(24,-26,15,-66,9,-96);c.closePath();},f:()=>cloth(c,-96,0,H.cloth),dress:1});
 parts.push({p:()=>{c.beginPath();c.moveTo(-10*b,-88);c.bezierCurveTo(-12*b,-104,-17*b,-124,-18*b,-140);c.bezierCurveTo(-10*b,-148,12*b,-148,19*b,-140);c.bezierCurveTo(19*b,-124,13*b,-106,11*b,-88);
   c.bezierCurveTo(4,-84,-4,-84,-10*b,-88);c.closePath();c.rect(-3.5,-155,8,14);},f:()=>H.dress?cloth(c,-148,-88,H.armor):armorG(),torso:1});
 if(!H.dress)parts.push({p:()=>limb2(c,4*b,-90,st,44,st-kn(0),44,8*b,6*b,4.6*b,'foot'),f:()=>metalX(c,-8,16,H.armor),leg:1});
 parts.push({p:()=>{c.beginPath();c.moveTo(HD[0]-3,HD[1]+12);c.lineTo(HD[0]-5,HD[1]+5);c.bezierCurveTo(HD[0]-12,HD[1]+2,HD[0]-13,HD[1]-14,HD[0]-3,HD[1]-16.5);
   c.bezierCurveTo(HD[0]+6,HD[1]-18,HD[0]+11,HD[1]-12,HD[0]+11,HD[1]-6);c.lineTo(HD[0]+12,HD[1]-4);c.quadraticCurveTo(HD[0]+14.5,HD[1]+.5,HD[0]+11.5,HD[1]+1);
   c.lineTo(HD[0]+11.8,HD[1]+3.5);c.lineTo(HD[0]+11,HD[1]+5);c.quadraticCurveTo(HD[0]+11,HD[1]+9.5,HD[0]+5,HD[1]+10);c.lineTo(HD[0]+1.5,HD[1]+12.5);c.closePath();},
   f:()=>{const g=c.createLinearGradient(HD[0]-12,0,HD[0]+14,0);g.addColorStop(0,shade(H.skin,-.3));g.addColorStop(.55,H.skin);g.addColorStop(1,shade(H.skin,-.06));return g;},head:1});
 parts.push({p:()=>limb2(c,H_SH[0],H_SH[1],a,31,a+.3,29,5.8*b,4.5*b,3.8*b,'hand'),f:()=>metalX(c,-8,14,H.armor),arm:1});
 c.lineJoin='round';for(const q of parts){q.p();c.lineWidth=2.2;c.strokeStyle=H_LINE;c.stroke();}
 for(const q of parts){
  if(q.arm){c.save();c.translate(hand[0],hand[1]);c.rotate(-(w-Math.PI));hWeapon(c,H,m,acc);c.restore();}
  q.p();c.fillStyle=q.f();c.fill();
  if(q.hair){c.save();q.p();c.clip();c.strokeStyle=shade(H.hair,.35);c.globalAlpha=.45;c.lineWidth=.8;for(let i=0;i<9;i++){c.beginPath();c.moveTo(HD[0]-6+i,HD[1]-10);c.bezierCurveTo(HD[0]-14-flow*.3+i,HD[1]+H.hairL*.3,HD[0]-18-flow*.8+i,HD[1]+H.hairL*.7,HD[0]-14-flow*1.2+i*.6,HD[1]+H.hairL);c.stroke();}c.restore();}
  if(q.torso)hTorso(c,H,b,acc);
  if(q.dress){c.save();q.p();c.clip();c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-4+i*3,-92);c.quadraticCurveTo(-14+i*9-flow*.3,-40,-28+i*13-flow*.5,0);c.stroke();}c.restore();}
  if(q.head)hHead(c,H,HD,acc,m,flow);
  if(q.arm){ell(c,hand[0],hand[1],4.6*b,4.2*b);c.fillStyle=metal(c,hand[1]-5,hand[1]+5,shade(H.armor,.08));c.fill();c.lineWidth=1.1;c.strokeStyle=H_LINE;c.stroke();
   if(!H.dress){c.save();c.translate(H_SH[0],H_SH[1]);for(let i=0;i<2;i++){c.beginPath();c.ellipse(-2,5+i*5,11*b-i*2,7*b,-.15,Math.PI*.95,Math.PI*2.05);c.closePath();c.fillStyle=metal(c,-6+i*6,10+i*6,H===HUM.king&&i===0?'#b08a3a':H.armor);c.fill();c.lineWidth=1.4;c.strokeStyle=H_LINE;c.stroke();}
    if(H===HUM.king||H===HUM.barkas){c.beginPath();c.moveTo(-7*b,-4);c.quadraticCurveTo(-2,-19*b,8*b,-13*b);c.lineTo(5*b,-4);c.closePath();c.fillStyle=metal(c,-19,0,H===HUM.king?'#b08a3a':'#c8ccd4');c.fill();c.stroke();}c.restore();}}
 }
 c.restore();return{a,w,lean};
}
function hTorso(c,H,b,acc){
 if(H.dress){c.strokeStyle='rgba(255,120,150,.35)';c.lineWidth=1;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-6+i*3,-138);c.lineTo(-7+i*3.5,-92);c.stroke();}
  c.beginPath();c.moveTo(-14*b,-140);c.quadraticCurveTo(0,-132,15*b,-140);c.lineWidth=1.4;c.strokeStyle='#ff4a7a';c.stroke();
  c.save();c.translate(-3,-136);for(let i=0;i<6;i++){c.rotate(TAU/6);ell(c,0,-3,2.6,3.8);c.fillStyle=i%2?'#ff3a6a':'#c8103a';c.fill();}c.restore();return;}
 c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1.2;c.beginPath();c.moveTo(-13*b,-134);c.quadraticCurveTo(0,-124,13*b,-134);c.moveTo(-11*b,-116);c.quadraticCurveTo(0,-108,11*b,-116);c.moveTo(0,-140);c.lineTo(0,-100);c.stroke();
 c.strokeStyle='rgba(0,0,0,.3)';c.beginPath();c.moveTo(-10*b,-104);c.quadraticCurveTo(0,-98,10*b,-104);c.stroke();
 rr(c,-12*b,-94,24*b,6.5,2);c.fillStyle=H===HUM.king?'#b08a3a':'#3a2a20';c.fill();c.lineWidth=1.1;c.strokeStyle=H_LINE;c.stroke();
 ell(c,0,-90.8,3.2,3);c.fillStyle=acc;c.shadowColor=acc;c.shadowBlur=10;c.fill();c.shadowBlur=0;
 // tassets over the hips
 for(const s of[-1,1]){c.beginPath();c.moveTo(s*2,-88);c.lineTo(s*12*b,-88);c.lineTo(s*13*b,-74);c.quadraticCurveTo(s*7*b,-71,s*2,-74);c.closePath();c.fillStyle=metal(c,-88,-71,shade(H.armor,s>0?0:-.15));c.fill();c.lineWidth=1.2;c.strokeStyle=H_LINE;c.stroke();}
 if(H===HUM.king){c.strokeStyle='#c8a04a';c.lineWidth=1.2;c.beginPath();c.moveTo(-9*b,-130);c.quadraticCurveTo(0,-122,9*b,-130);c.stroke();}
}
function hHead(c,H,HD,acc,m,flow){const x=HD[0],y=HD[1];
 if(H.helm){c.beginPath();c.moveTo(x-13,y+7);c.bezierCurveTo(x-15,y-13,x-6,y-21,x+4,y-19);c.bezierCurveTo(x+13,y-16,x+16,y-6,x+14,y+9);c.lineTo(x-13,y+9);c.closePath();
  c.fillStyle=metal(c,y-21,y+9,H.armor);c.fill();c.lineWidth=1.7;c.strokeStyle=H_LINE;c.stroke();
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;c.beginPath();c.moveTo(x-2,y-18);c.quadraticCurveTo(x+10,y-14,x+12,y);c.stroke();
  rr(c,x+2,y-5,12,3.2,1.5);c.fillStyle='#120a08';c.fill();c.save();c.globalCompositeOperation='lighter';c.shadowColor=acc;c.shadowBlur=12;c.fillStyle=acc;c.fillRect(x+6,y-4.6,6.5,2);c.restore();
  for(let i=0;i<3;i++){ell(c,x+10-i*3,y+4,.9,.9);c.fillStyle='#120a08';c.fill();}
  c.beginPath();c.moveTo(x-6,y-17);c.bezierCurveTo(x-16,y-29,x-26,y-33,x-35,y-29);c.bezierCurveTo(x-25,y-27,x-15,y-21,x-9,y-11);c.closePath();c.fillStyle=metal(c,y-33,y-11,'#ddd0b8');c.fill();c.lineWidth=1.4;c.strokeStyle=H_LINE;c.stroke();return;}
 // face shading: cheekbone, ear, eye socket
 const sk=H.skin;ell(c,x+6,y+3,4,5.5);c.fillStyle='rgba(120,60,70,.12)';c.fill();
 ell(c,x-4,y-1,2,3.2);c.fillStyle=shade(sk,-.15);c.fill();c.lineWidth=.9;c.strokeStyle='rgba(60,30,30,.5)';c.stroke();
 c.save();c.beginPath();c.moveTo(x+3.5,y-8.5);c.quadraticCurveTo(x+8,y-10.5,x+11.5,y-8.2);c.lineWidth=1.3;c.strokeStyle='rgba(30,15,20,.8)';c.stroke();
 ell(c,x+8.3,y-5.6,2.2,1);c.fillStyle='#f4ecea';c.fill();c.globalCompositeOperation='lighter';c.shadowColor=acc;c.shadowBlur=8;ell(c,x+9.1,y-5.6,1.1,.95);c.fillStyle=acc;c.fill();c.restore();
 c.beginPath();c.moveTo(x+11.2,y-4);c.quadraticCurveTo(x+12.8,y-.5,x+11,y+.8);c.lineWidth=.8;c.strokeStyle='rgba(80,40,40,.45)';c.stroke();
 c.beginPath();c.moveTo(x+10.6,y+5.3);c.lineTo(x+7.6,y+5.7);c.lineWidth=1;c.strokeStyle=H===HUM.lilith?'#a8102a':'rgba(70,30,30,.75)';c.stroke();
 if(H===HUM.lilith){ell(c,x+9.8,y+5.5,2,1);c.fillStyle='#b0102a';c.fill();}
 // hair cap
 c.beginPath();c.moveTo(x-13,y-1);c.bezierCurveTo(x-15,y-17,x-2,y-23,x+9,y-15);
 if(H===HUM.xenos){for(let i=0;i<5;i++)c.lineTo(x+4-i*6-flow*.3,y-21-((i%2)*5));c.lineTo(x-21-flow*.5,y-8);}
 else if(H===HUM.lilith){c.quadraticCurveTo(x+11,y-6,x+9,y-2);c.quadraticCurveTo(x+4,y-12,x-2,y-10);c.lineTo(x-10,y+4);}
 else{c.quadraticCurveTo(x+4,y-15,x-2,y-11);c.lineTo(x-10,y+4);}
 c.closePath();c.fillStyle=cloth(c,y-23,y+4,H.hair);c.fill();c.lineWidth=1.3;c.strokeStyle=H_LINE;c.stroke();
 c.strokeStyle=shade(H.hair,.4);c.globalAlpha=.4;c.lineWidth=.7;for(let i=0;i<5;i++){c.beginPath();c.moveTo(x-10+i*3,y-15+i*.4);c.quadraticCurveTo(x-4+i*2,y-19,x+5+i,y-14+i);c.stroke();}c.globalAlpha=1;
 if(H.crown){c.save();c.translate(x-1,y-16);for(const[dx,h,lean2]of[[-9,10,-.5],[-2,14,-.15],[5,11,.2]]){c.beginPath();c.moveTo(dx-2.6,0);c.quadraticCurveTo(dx+lean2*10,-h*.6,dx+lean2*16,-h);c.lineTo(dx+2.6,0);c.closePath();c.fillStyle=metal(c,-h,0,'#c8a04a');c.fill();c.lineWidth=1.1;c.strokeStyle=H_LINE;c.stroke();}
  c.beginPath();c.moveTo(-11,4);c.bezierCurveTo(-25,-2,-33,-14,-29,-29);c.bezierCurveTo(-25,-16,-17,-8,-7,-2);c.closePath();c.fillStyle=metal(c,-29,4,'#2e2430');c.fill();c.stroke();
  rr(c,-12,-1,22,4,1.5);c.fillStyle=metal(c,-1,3,'#c8a04a');c.fill();c.stroke();ell(c,-1,1,2,2);c.fillStyle=acc;c.shadowColor=acc;c.shadowBlur=8;c.fill();c.shadowBlur=0;c.restore();}
}
function humanSwing(c,m,H,acc){if(!(m.atk>=.37&&m.atk<.8))return;
 const L=H.wl+(H.weapon==='whip'?86:0),p1=Math.min(m.atk,.55),p0=Math.max(.35,p1-.2),fade=m.atk<.55?1:1-(m.atk-.55)/.25;if(p1-p0<.01)return;
 const pt=p=>{const ps=humanPose({atk:p,t:m.t}),cr=Math.cos(ps.lean),sr=Math.sin(ps.lean),[hx,hy]=handPos(ps.a),[dx,dy]=dirv(ps.w);
  const r=(x,y)=>[x*cr-y*sr,x*sr+y*cr];return[r(hx+dx*L,hy+dy*L),r(hx+dx*L*.62,hy+dy*L*.62)];};
 const N=14,out=[],inn=[];for(let i=0;i<=N;i++){const k=i/N,[o,n]=pt(p0+(p1-p0)*k);out.push(o);inn.push([lerp(o[0],n[0],Math.pow(k,.7)),lerp(o[1],n[1],Math.pow(k,.7))]);}
 const poly=(A,B)=>{c.beginPath();c.moveTo(A[0][0],A[0][1]);for(const q of A)c.lineTo(q[0],q[1]);for(let i=B.length-1;i>=0;i--)c.lineTo(B[i][0],B[i][1]);c.closePath();};
 const[r,g,bl]=hexRGB(acc).map(v=>Math.round(v*255));
 c.save();c.globalCompositeOperation='lighter';poly(out,inn);c.shadowColor=acc;c.shadowBlur=18;c.fillStyle=`rgba(${r},${g},${bl},${.5*fade})`;c.fill();c.shadowBlur=0;
 poly(out,out.map((o,i)=>[lerp(o[0],inn[i][0],.25),lerp(o[1],inn[i][1],.25)]));c.fillStyle=`rgba(255,255,255,${.8*fade})`;c.fill();c.restore();}
ART.human=(c,m)=>{const H=HUM[m.sub];c.save();c.scale(-1,1);drawHuman(c,m,H,m.a);humanSwing(c,m,H,m.a);c.restore();};
ART_W.human=26;ART_H.human=176;
