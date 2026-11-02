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
./build.sh                     # → lost-home/index.html 생성
cd tests && npm i playwright && node terr.js   # 오류 검사 ("no errors"면 정상)
```

### 파일 구조 (src/)
빌드 시 g1.html → core.js → g2 … g9 → g9b … g9p 순서로 이어 붙인다. 뒤 파일이 앞 함수를 감싸서(`const _x=fn; fn=function(){_x();…}`) 기능을 덧붙이는 구조라 **순서가 중요**하다. 새 기능은 새 파일(예: g9q.js)을 만들고 build.sh의 목록에 추가한다.

| 파일 | 내용 |
|---|---|
| g1.html | 화면 마크업 + 전체 CSS (맨 아래가 최신 덮어쓰기 규칙) |
| core.js | 도트 래스터라이저, 백곰 캐릭터·애니메이션 |
| g2.js | 몬스터(MOBS), 아이템(ITEMS), 1~10챕터 테마(THEMES), 배경 |
| g3.js | 게임 루프, 전투, 스테이지·보스 흐름, HUD, 패널(renderPanel) |
| g4.js | 사운드, 미션 |
| g6~g7 | 데미지 숫자, 로비·프롤로그·승리·뽑기·자리 비운 사이 화면 |
| g8.js | 펫, 아이콘 |
| g9.js | 고화질 몬스터/아이템 아이콘 |
| g9b | 마왕군 도트 보스 · g9c S급 무기 궁극기 · g9d 고화질 UI 아이콘 |
| g9e | 던전·도감·펫 스킬 · g9f 장비 합성·프로필 · g9g 벡터 보스(간부·마왕) |
| g9h | 11~20챕터 마계 원정 · g9i 보스 스킬 · g9j 분해 · g9k 이름·자는 곰 |
| g9l | 화면 맞춤·팝업·데미지 색 · g9m 스탯 상한·퀘스트 · g9n 출석·일일퀘·세트·칭호·펫 합성 |
| g9o | 11~19챕터 보스 일러스트 · g9p 설정 창·장비 팝업 |

세이브는 브라우저 localStorage의 전역 객체 `S`.

### 배포
main 브랜치에 push하면 GitHub Pages(https://mllngrocker.github.io/mllng-defense/lost-home/)에 반영된다. 반드시 `./build.sh`로 index.html을 다시 만든 뒤 커밋한다.
