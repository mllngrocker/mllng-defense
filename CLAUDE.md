# 말랑 오락실 (mllng-defense)

GitHub Pages로 배포되는 미니게임 모음. 사용자와는 항상 **한국어**로 대화한다.

- `index.html` : 오락실 첫 화면 (게임 목록은 파일 안 `GAMES` 배열)
- `mallang-defense/` : 말랑말랑 수비대
- `lost-home/` : 잃어버린 고향을 찾아서 (백곰 방치형 RPG)

## 잃어버린 고향을 찾아서 — 작업 방법

`lost-home/index.html`은 **빌드 결과물**이라 직접 고치지 않는다. 원본은 `lost-home/src/`.

```
cd lost-home/src
pip install fonttools brotli   # 처음 한 번
./build.sh                     # → lost-home/index.html 생성 (page.html + js/*.js + 폰트 서브셋)
```

확인은 저장소 루트에서 `python -m http.server` 후 브라우저로 `/lost-home/`을 연다 (콘솔 오류 없어야 함).

### 파일 구조 (src/)
`build.py`의 `JS` 목록 순서대로 이어 붙인다. 새 파일을 만들면 이 목록에 추가한다.

| 파일 | 내용 |
|---|---|
| page.html | 화면 마크업 + 전체 CSS (`<!--SCRIPTS-->` 자리에 JS가 들어감) |
| js/data.js | 유틸, 세이브(`S`), 강화 공식, 몬스터(`MOBS`), 20챕터 테마(`THEMES`) |
| js/bg.js | WebGL 배경 셰이더 (하늘·해·실루엣·바다·땅·빛줄기·날씨) |
| js/art.js, art2.js | 몬스터 벡터 그림 (아키타입: slime, jelly, crab, bird, walker, beast, golem, squid, spirit) |
| js/bear.js | 사실풍 백곰 (두 발 서기, 하나의 실루엣) + 공격 빛 궤적 |
| js/humans.js | 인간형 보스: 간부 바르카스(12)·릴리스(15)·제노스(18), 마왕 녹스(20) |
| js/gear.js | 장비(무기·장신구, C~H 등급), 뽑기, 펫 데이터, 무기 그림·아이콘 |
| js/skills.js | 스킬 3종(빙하 낙하·눈보라 회오리·오로라 빔), 펫 동작과 그림 |

플레이어 캐릭터는 bear.js 맨 아래 `HEROES`에 등록한다 (`draw`, `swing`). 새 등장인물은 그림 함수를 만들어 여기에 추가하고 `S.hero`로 고른다.
| js/fx.js | 파티클, 데미지 숫자(단위별 색), 피격 번쩍임, 효과음(합성) |
| js/game.js | 전투, 스테이지·보스 흐름, 렌더링 |
| js/ui.js | HUD, 강화/기록 패널, 설정, 로비, 자리 비운 사이 보상 |
| js/main.js | 시작 + 메인 루프 |

세이브는 브라우저 localStorage(`lost-home-v3`)의 전역 객체 `S`.

### 배포
main 브랜치에 push하면 GitHub Pages(https://mllngrocker.github.io/mllng-defense/lost-home/)에 반영된다. 반드시 `./build.sh`로 index.html을 다시 만든 뒤 커밋한다.
