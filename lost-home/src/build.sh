#!/bin/bash
# 사용법: lost-home/src 폴더에서 ./build.sh  → ../index.html 생성
# 필요: python3, fonttools (pip install fonttools brotli)
set -e
cd "$(dirname "$0")"
python3 - <<'P'
import glob,base64,subprocess,os
parts=['g2.js','g3.js','g4.js','g5.js','g6.js','g7.js','g8.js','g9.js']+['g9%s.js'%c for c in 'bcdefghijklmnop']
parts=[p for p in parts if os.path.exists(p)]
t=''.join(open(f,encoding='utf8').read() for f in ['g1.html','core.js']+parts)
chars=set(t)|set(chr(c) for c in range(32,127))|set(chr(c) for c in range(0xAC00,0xD7A4) if len(chr(c).encode('euc-kr','ignore'))==2)|set('…→·×%!?~♪★☆♥')
os.makedirs('.build',exist_ok=True)
open('.build/chars.txt','w',encoding='utf8').write(''.join(sorted(c for c in chars if ord(c)>=32)))
ff=''
for n,src in [('Jal','fonts/jalnan.woff'),('Ssr','fonts/ssurround.woff')]:
  out='.build/%s.woff2'%n
  subprocess.run(['pyftsubset',src,'--text-file=.build/chars.txt','--flavor=woff2','--output-file='+out,'--layout-features=*'],check=True,stderr=subprocess.DEVNULL)
  ff+='@font-face{font-family:"%s";src:url(data:font/woff2;base64,%s) format("woff2");font-display:block}'%(n,base64.b64encode(open(out,'rb').read()).decode())
h=open('g1.html',encoding='utf8').read();i=h.index('<style>');h=h[:i]+'<style>'+ff+'</style>\n'+h[i:]
core=open('core.js',encoding='utf8').read().split('\n')
body=h+'<script>\n'+'\n'.join(core[1:-2] if core[-1]=='' else core[1:-1])+'\n</script>\n'+''.join(open(f,encoding='utf8').read() for f in parts)
head='<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#2a76e8">\n'
open('../index.html','w',encoding='utf8').write(head+body)
print('built ../index.html')
P
