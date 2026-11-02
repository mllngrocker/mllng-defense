/* ---------- WebGL background: sky, sun, clouds, silhouettes, sea, ground, light rays, weather ---------- */
const BG_FRAG=`precision highp float;
uniform vec2 uRes; uniform float uT,uScroll,uGround,uHorizon,uSil,uWx,uRays,uAur,uSeaOn;
uniform vec3 uSkyT,uSkyM,uSkyH,uSunC,uSun,uFar,uNear,uGndT,uGndB,uSea,uFog;
float h1(float n){return fract(sin(n*127.1)*43758.5453);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),f);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*vn(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
float fbm1(float x){return vn1(x)*.55+vn1(x*2.1+3.)*.3+vn1(x*4.3+7.)*.15;}
bool is(float a){return abs(uSil-a)<.5;}
float farH(float x){
 if(is(0.))return .035*smoothstep(.45,.75,vn1(x*1.3))*(.6+.4*vn1(x*5.));
 if(is(1.))return .07+.05*fbm1(x*3.)+.03*abs(sin(x*40.))*vn1(x*8.);
 if(is(2.))return .05+.035*sin(x*2.+1.)+.02*sin(x*5.3);
 if(is(3.))return .012*vn1(x*3.);
 if(is(4.)){float c=floor(x*14.);return .05+.17*h1(c)*h1(c+7.);}
 if(is(5.))return .28+.1*fbm1(x*2.);
 if(is(6.))return .08+.08*fbm1(x*1.5)+.04*abs(sin(x*3.));
 if(is(7.))return .03+.12*smoothstep(.45,.55,vn1(x*2.5));
 if(is(8.))return .06+.05*fbm1(x*2.5);
 if(is(9.)){float c=floor(x*8.),f=fract(x*8.);return .06+.1*h1(c)+((f<.18&&h1(c+3.)>.55)?.13:0.);}
 if(is(11.)){float c=floor(x*6.),f=fract(x*6.);float hh=.07+.17*h1(c);return h1(c+2.)>.35?hh+max(0.,.1*(1.-abs(f-.5)*5.)):.05+.03*fbm1(x*4.);}
 if(is(12.))return .1+.12*fbm1(x*1.2)+.05*max(0.,1.-abs(fract(x*3.)-.5)*6.)*step(.5,h1(floor(x*3.)));
 return .02+.13*pow(max(0.,sin(x*1.3)*.5+.5),3.)*(.6+.4*vn1(x*6.))+.03*vn1(x*9.);
}
// near layer: returns alpha, writes a shade value (0..1) to s, glow to g
float nearMask(vec2 q,out float s,out float g){
 s=0.;g=0.;float x=q.x,y=q.y;
 if(is(0.)){float h=.035*pow(vn1(x*2.2),2.)+.012*vn1(x*14.);s=vn1(x*30.);return step(y,h);}
 if(is(1.)){float c=floor(x*3.),f=fract(x*3.)-.5;float hh=.04+.05*h1(c+1.);float st=step(h1(c),.75)*step(abs(f),.05+.01*h1(c+2.))*step(y,hh);
  float gr=step(y,.012+.01*vn1(x*40.));s=step(hh-.008,y)*st;return max(st,gr);}
 if(is(2.)){float d=step(y,.03+.025*sin(x*1.7+1.));float c=floor(x*2.),f=fract(x*2.)-.5;float on=step(.5,h1(c));
  float tr=step(abs(f),.018)*step(y,.13);float a1=step(-.06,f)*step(f,-.018)*step(.06,y)*step(y,.074);float a2=step(abs(f+.05),.012)*step(.06,y)*step(y,.105);
  float a3=step(.018,f)*step(f,.055)*step(.08,y)*step(y,.094);float a4=step(abs(f-.043),.012)*step(.08,y)*step(y,.12);return max(d,on*max(max(tr,a1),max(max(a2,a3),a4)));}
 if(is(3.)){float c=floor(x*.9),f=fract(x*.9)-.5;if(h1(c)<.35)return 0.;
  float legs=step(abs(abs(f)-.05),.006)*step(y,.12);float pl=step(abs(f),.085)*step(.11,y)*step(y,.14);
  float dr=step(.14,y)*step(y,.27)*step(abs(f),.03*(1.-(y-.14)/.13))*step(.4,fract((y-abs(f))*60.));
  g=exp(-length(vec2(f-.06,y-.17))*40.)*(.7+.3*sin(uT*9.+c));return max(max(legs,pl),dr);}
 if(is(4.)){float c=floor(x*8.),f=fract(x*8.);float hh=.08+.22*h1(c);float b=step(f,.88)*step(y,hh);
  vec2 w=vec2(f*8.,y*70.);float win=step(.35,fract(w.x))*step(.4,fract(w.y))*step(.62,h2(floor(w)+c));g=b*win*step(y,hh-.01);s=f;return b;}
 if(is(5.)){float c=floor(x*1.2),f=fract(x*1.2)-.5;float bm=step(abs(abs(f)-.13),.012)*step(y,.3);float cb=step(abs(f),.15)*step(.28,y)*step(y,.31);
  g=exp(-length(vec2(f,y-.25))*22.)*(.85+.15*sin(uT*7.+c*3.));return max(bm,cb);}
 if(is(6.)){float c=floor(x*2.2),f=fract(x*2.2)-.5;float hh=.18+.14*h1(c);float tr=step(abs(f),.012*(1.-y/hh)+.002)*step(y,hh);
  float br=step(abs(f-(y-hh*.55)*.6*sign(h1(c+4.)-.5)),.006)*step(hh*.55,y)*step(y,hh*.8);g=exp(-length(vec2(f,y-.01))*30.)*h1(c+9.)*(.6+.4*sin(uT*11.+c));return max(tr,br);}
 if(is(7.)){s=vn1(x*20.);return step(y,.02+.035*vn1(x*4.)+.01*vn1(x*17.));}
 if(is(8.)){float c=floor(x*1.6),f=fract(x*1.6)-.5;float hh=.16+.1*h1(c);float tr=step(abs(f),.01+.008*(1.-y/hh))*step(y,hh);
  float br=step(abs(abs(f)-(y-hh*.6)*.8),.005)*step(hh*.6,y)*step(y,hh);float moss=step(abs(f+.04),.004)*step(hh*.45,y)*step(y,hh*.8);return max(max(tr,br),moss);}
 if(is(9.)){float c=floor(x*1.1),f=fract(x*1.1)-.5;float hh=.32;float w=.045*(1.-y/hh);float tw=step(abs(f),w)*step(y,hh);
  float lat=step(abs(f),w)*(step(abs(abs(f)-w+.003),.003)+step(abs(fract(y*30.+abs(f)*30.)-.5),.08));
  float wire=step(abs(y-(hh*.9-.06*(1.-pow(abs(f*2.),2.)))),.0025);g=exp(-length(vec2(f,y-hh))*50.)*(.5+.5*sin(uT*5.+c));return max(tw*min(lat,1.),wire);}
 if(is(11.)){float c=floor(x*2.5),f=fract(x*2.5)-.5;float hh=.08+.1*h1(c);float sp=step(abs(f),.035*(1.-y/hh))*step(y,hh)*step(.3,h1(c+5.));
  float rk=step(y,.02+.02*vn1(x*9.));g=exp(-length(vec2(f,y-hh))*45.)*sp*.6;return max(sp,rk);}
 if(is(12.)){float c=floor(x*1.3),f=fract(x*1.3)-.5;float rib=step(abs(length(vec2(f*2.4,y*4.2))-1.),.07)*step(0.,y)*step(.4,h1(c));
  float sk=step(length(vec2(f-.3,y-.03)*vec2(1.,1.3)),.035)*step(.6,h1(c+3.));return max(max(rib,sk),step(y,.015+.015*vn1(x*12.)));}
 return 0.;
}
vec3 weather(vec2 p,vec3 col){
 if(uWx<.5)return col;
 for(int L=0;L<3;L++){
  float fl=float(L),sc=16.-fl*4.;vec2 vel=vec2(0.);float sz=.06;vec3 pc=vec3(1.);float sh=0.,ga=.8,add=0.;
  if(abs(uWx-1.)<.5){vel=vec2(-.06,-.05);sz=.09;pc=mix(vec3(.95,.6,.2),vec3(.5,.75,.3),h1(fl));sh=2.;}
  else if(abs(uWx-11.)<.5){vel=vec2(-.08,-.06);sz=.08;pc=mix(vec3(1.,.2,.35),vec3(1.,.6,.7),h1(fl+2.));sh=2.;}
  else if(abs(uWx-2.)<.5){vel=vec2(-.5,-.02);sz=.04;pc=vec3(1.,.88,.65);sh=1.;ga=.5;}
  else if(abs(uWx-3.)<.5){vel=vec2(-.02,.03);sz=.05;pc=vec3(.9,.6,1.);ga=.35;add=1.;}
  else if(abs(uWx-4.)<.5){vel=vec2(-.04,.005);sz=.32;pc=vec3(.75,.72,.62);sh=3.;ga=.18;}
  else if(abs(uWx-5.)<.5){vel=vec2(-.03,-.015);sz=.05;pc=vec3(.35,.3,.25);ga=.6;}
  else if(abs(uWx-6.)<.5){vel=vec2(-.03,.12);sz=.05;pc=vec3(1.,.55,.15);ga=1.;add=1.;}
  else if(abs(uWx-7.)<.5){vel=vec2(-.12,-.9);sz=.03;pc=vec3(.75,1.,.4);sh=1.;ga=.45;}
  else if(abs(uWx-8.)<.5){vel=vec2(.01,.05);sz=.06;pc=vec3(.85,1.,.6);ga=.7;add=1.;}
  else if(abs(uWx-9.)<.5){vel=vec2(-.02,.18);sz=.035;pc=vec3(.6,.9,1.);ga=1.;add=1.;}
  else {vel=vec2(-.03,-.1);sz=.07;pc=vec3(1.);ga=.85;}
  vec2 q=p*sc-vel*uT*sc*(1.+fl*.35)+vec2(fl*7.3,fl*3.1);vec2 c=floor(q),f=fract(q)-.5;
  float hh=h2(c+fl*17.);if(hh>.55)continue;
  vec2 o=(vec2(h2(c+3.),h2(c+9.))-.5)*.5+vec2(sin(uT*1.3+hh*20.)*.15,0.);vec2 d=f-o;float m;
  if(sh>2.5)m=exp(-dot(d,d)/(sz*sz));
  else if(sh>1.5){d=mat2(cos(hh*9.+uT),-sin(hh*9.+uT),sin(hh*9.+uT),cos(hh*9.+uT))*d;m=smoothstep(sz,sz*.5,length(d*vec2(1.,2.2)));}
  else if(sh>.5){vec2 dir=normalize(vel);float a=dot(d,dir),b=dot(d,vec2(-dir.y,dir.x));m=smoothstep(sz*.35,0.,abs(b))*smoothstep(sz*4.,0.,abs(a));}
  else m=smoothstep(sz,sz*.3,length(d));
  if(add>.5){col+=pc*m*ga*(.7+.3*sin(uT*6.+hh*30.));}else col=mix(col,pc,m*ga*(1.-fl*.2));
 }
 return col;
}
void main(){
 vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;vec2 p=vec2(uv.x*asp,uv.y);
 float gy=uGround,hz=uHorizon;
 // sky
 float sy=clamp((uv.y-hz)/(1.-hz),0.,1.);
 vec3 col=mix(uSkyH,uSkyM,smoothstep(0.,.45,sy));col=mix(col,uSkyT,smoothstep(.4,1.,sy));
 float lum=dot(uSkyT,vec3(.3,.5,.2));
 if(lum<.2){vec2 sc=floor(p*90.);float st=step(.992,h2(sc))*(.5+.5*sin(uT*2.+h2(sc+1.)*30.));col+=vec3(st)*smoothstep(hz,hz+.25,uv.y)*.9;}
 if(uAur>.5){float ax=p.x*1.4+uT*.03;float band=fbm(vec2(ax*2.,uT*.05));float yy=uv.y-(.68+.12*sin(ax*2.5+band*3.));
  float cur=exp(-yy*yy*90.)*(.5+.5*sin(ax*30.+band*10.))+exp(-max(yy,0.)*6.)*step(0.,yy)*.25*exp(-yy*yy*20.);
  col+=mix(vec3(.2,1.,.6),vec3(.6,.3,1.),smoothstep(.55,.85,uv.y))*cur*.55*smoothstep(hz,hz+.2,uv.y);}
 vec2 sp=vec2(uSun.x*asp,uSun.y*(1.-hz)+hz);float sd=length(p-sp);
 col+=uSunC*(exp(-sd*7.)*.45+exp(-sd*2.2)*.18);col=mix(col,uSunC*1.1,smoothstep(uSun.z,uSun.z*.92,sd));
 float cl=fbm(vec2(p.x*1.6+uScroll*.02+uT*.01,p.y*5.));float cm=smoothstep(.55,.8,cl)*smoothstep(hz+.05,hz+.35,uv.y)*(1.-smoothstep(.85,1.,uv.y));
 col=mix(col,mix(uFog,vec3(1.),.6)+uSunC*.15*exp(-sd*3.),cm*.55);
 // far silhouettes
 float fx=p.x+uScroll*.08;float fh=farH(fx);
 if(uv.y<hz+fh&&uv.y>hz-.01){float d=(hz+fh-uv.y);vec3 fc=mix(uFar,uFog,.35);fc*=.9+.1*vn1(fx*25.);
  if(is(4.)){vec2 w=vec2(fx*80.,uv.y*120.);fc+=vec3(1.,.85,.5)*step(.85,h2(floor(w)))*.25;}
  if(is(10.))fc=mix(fc,vec3(.9,.97,1.),smoothstep(0.,.03,d)*.5);
  col=mix(col,fc,smoothstep(0.,.004,d));}
 if(is(5.)){float c=floor(p.x*6.+uScroll*.3),f=fract(p.x*6.+uScroll*.3)-.5;float top=1.-(.06+.14*pow(h2(vec2(c,1.)),2.)*(1.-abs(f)*2.));col=mix(col,uNear*.8,step(top,uv.y));}
 col=mix(col,uFog,exp(-abs(uv.y-hz)*14.)*.35);
 // sea
 if(uSeaOn>.5&&uv.y<hz&&uv.y>=gy-.02){float k=(hz-uv.y)/(hz-gy+.001);float persp=1./(k+.08);
  vec3 sc=mix(mix(uSea,uFog,.45),uSea*.8,smoothstep(0.,1.,k));
  float w=sin(p.x*18.*persp*.15+uT*1.5+sin(p.x*3.+uT)*1.)*sin(uv.y*240.*persp*.08-uT*2.);sc+=vec3(.08)*w*(1.-k*.5);
  float gl=exp(-pow((p.x-sp.x)/(.05+k*.25),2.))*step(.6,vn(vec2(p.x*60.*persp*.1,uv.y*900.-uT*3.)));sc+=uSunC*gl*.9;
  if(is(3.)){sc+=.12*vec3(sin(p.x*20.+uT),sin(p.x*20.+2.+uT),sin(p.x*20.+4.+uT))*vn(p*vec2(6.,40.));}
  if(is(10.)){float fl=step(.72,vn(vec2(p.x*6.+uScroll*.2,uv.y*30.)));sc=mix(sc,vec3(.85,.94,1.),fl*.85*k);}
  col=sc;}
 // near layer
 if(!(uSeaOn>.5&&!is(3.)&&!is(8.))||is(3.)||is(8.)){float base=(is(3.)||is(8.))?hz-.015:gy;float s,g;float m=nearMask(vec2(p.x+uScroll*.35,uv.y-base),s,g);
  if(m>.5&&uv.y>=base-.02){vec3 nc=uNear*(.85+.25*s);col=mix(col,nc,.95);}col+=uSunC*g*.8+vec3(1.,.7,.3)*g*.4*step(.5,m);}
 // ground
 if(uv.y<gy){float k=(gy-uv.y)/gy;vec2 gp=vec2((p.x+uScroll)*1.,uv.y);
  vec3 gc=mix(uGndT,uGndB,smoothstep(0.,1.,k));gc*=.9+.15*fbm(gp*vec2(6.,30.));gc*=1.-.12*step(.75,vn(gp*vec2(18.,60.)));
  float peb=step(.86,vn(gp*vec2(14.,45.)));gc=mix(gc,gc*1.25,peb*.6);
  gc=mix(gc,gc*1.18,exp(-(gy-uv.y)*90.));gc*=1.-.25*exp(-(gy-uv.y)*25.)*step(.001,gy-uv.y)*0.;
  if(is(0.)){float wet=smoothstep(.04,0.,gy-uv.y);gc=mix(gc,gc*.78,wet);float fo=smoothstep(.006,0.,abs(gy-.006*sin(p.x*9.+uT*1.5)-uv.y));gc=mix(gc,vec3(1.),fo*.8);}
  if(is(8.)){float pud=smoothstep(.55,.6,vn(gp*vec2(3.,14.)));gc=mix(gc,mix(uSea,uSunC,.1)*.9+.05*sin(p.x*40.+uT*2.),pud*.8);}
  if(is(10.)){gc=mix(gc,vec3(.75,.88,1.),.2*vn(gp*vec2(4.,20.)));gc+=vec3(.5,.7,1.)*step(.95,vn(gp*vec2(40.,120.)))*.4;}
  gc*=1.-.3*k;col=gc;}
 // god rays
 if(uRays>0.){vec2 dv=p-sp;float a=atan(dv.y,dv.x);float r=fbm(vec2(a*6.,uT*.08))*fbm(vec2(a*13.+3.,uT*.05));col+=uSunC*r*uRays*.35*exp(-length(dv)*1.2)*step(gy,uv.y);}
 col=weather(p,col);
 vec2 vc=uv-.5;col*=1.-dot(vc,vc)*.55;
 gl_FragColor=vec4(col,1.);
}`;
class BG{
 constructor(cv){
  this.cv=cv;const gl=this.gl=cv.getContext('webgl',{antialias:false,alpha:false,premultipliedAlpha:false})||cv.getContext('experimental-webgl');
  if(!gl){this.fail=true;return;}
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(o));return o;};
  const pr=this.pr=gl.createProgram();gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,BG_FRAG));gl.linkProgram(pr);gl.useProgram(pr);
  const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  this.u={};for(const n of ['uRes','uT','uScroll','uGround','uHorizon','uSil','uWx','uRays','uAur','uSeaOn','uSkyT','uSkyM','uSkyH','uSunC','uSun','uFar','uNear','uGndT','uGndB','uSea','uFog'])this.u[n]=gl.getUniformLocation(pr,n);
  this.ground=.2;this.horizon=.42;this.scale=1;
 }
 theme(th){if(this.fail)return;const gl=this.gl,u=this.u,v3=(n,h)=>gl.uniform3fv(u[n],hexRGB(h));this.th=th;
  v3('uSkyT',th.sky[0]);v3('uSkyM',th.sky[1]);v3('uSkyH',th.sky[2]);v3('uSunC',th.sun[0]);gl.uniform3f(u.uSun,th.sun[1],1-th.sun[2],th.sun[3]);
  v3('uFar',th.far);v3('uNear',th.near);v3('uGndT',th.gnd[0]);v3('uGndB',th.gnd[1]);v3('uSea',th.sea||'#000000');v3('uFog',th.fog);
  gl.uniform1f(u.uSeaOn,th.sea?1:0);gl.uniform1f(u.uSil,th.sil);gl.uniform1f(u.uWx,th.wx);gl.uniform1f(u.uRays,th.rays);gl.uniform1f(u.uAur,th.aurora?1:0);}
 resize(w,h){if(this.fail)return;this.cv.width=w;this.cv.height=h;this.gl.viewport(0,0,w,h);}
 draw(t,scroll){if(this.fail)return;const gl=this.gl,u=this.u;
  gl.uniform2f(u.uRes,this.cv.width,this.cv.height);gl.uniform1f(u.uT,t);gl.uniform1f(u.uScroll,scroll);gl.uniform1f(u.uGround,this.ground);gl.uniform1f(u.uHorizon,this.horizon);
  gl.drawArrays(gl.TRIANGLES,0,3);}
}
