# lost-home/src 에서 실행: page.html + js/*.js + 폰트(서브셋) → ../index.html
import base64, os, subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))
JS = ['data', 'bg', 'art', 'art2', 'gross', 'bear', 'humans', 'gear', 'costume', 'weapons', 'skills', 'beasts', 'pets', 'ult', 'bossfx', 'dungeon', 'quest', 'story', 'meta', 'fx', 'game', 'ui', 'main']  # 순서 중요
page = open('page.html', encoding='utf8').read()
code = ''.join(open(f'js/{n}.js', encoding='utf8').read() + '\n' for n in JS)
# keep only the glyphs the game uses (plus all common Hangul) so the fonts stay small
chars = set(page + code) | {chr(c) for c in range(32, 127)} | {chr(c) for c in range(0xAC00, 0xD7A4) if len(chr(c).encode('euc-kr', 'ignore')) == 2}
os.makedirs('.build', exist_ok=True)
open('.build/chars.txt', 'w', encoding='utf8').write(''.join(sorted(c for c in chars if ord(c) >= 32)))
faces = ''
for name, src in [('Jal', 'fonts/mapleBold.woff'), ('Ssr', 'fonts/mapleLight.woff')]:  # 메이플스토리체 Bold(제목·숫자) / Light(본문), 이름은 기존 CSS 그대로
    out = f'.build/{name}.woff2'
    subprocess.run(['pyftsubset', src, '--text-file=.build/chars.txt', '--flavor=woff2', '--output-file=' + out, '--layout-features=*'], check=True, stderr=subprocess.DEVNULL)
    faces += '@font-face{font-family:"%s";src:url(data:font/woff2;base64,%s) format("woff2");font-display:block}' % (name, base64.b64encode(open(out, 'rb').read()).decode())
head = ('<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#0b1630">\n'
        f'<style>{faces}</style>\n')
assert '<!--SCRIPTS-->' in page
html = head + page.replace('<!--SCRIPTS-->', '<script>\n' + code + '</script>')
open('../index.html', 'w', encoding='utf8').write(html)
print(f'built ../index.html ({len(html) // 1024} KB)')
