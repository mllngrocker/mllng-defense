class_name MapView
extends Control
## 지도 창(화면 전체, 여는 동안 게임이 멈춘다): 위쪽 탭으로 "지역 지도"와 "월드 지도"를 오간다.
## 지역 지도: 지금 맵의 땅 타일 색을 그대로 줄여 그린 그림 + 내 위치·이동문·보스·마을 사람·몬스터 표시.
## 월드 지도: 대륙 그림 위에 마을 → 초원 → 언덕 → 숲 → 사막 3장, 서쪽 해저 신전·북쪽 설산(잠김).

signal closed

const CELL := 6  # 타일 1칸을 지도에서 몇 픽셀로
## pos: 월드 지도 그림(assets/ui/world_map_art.png) 안의 위치(0~1)
## 맵 하나 = 지도 위 동그라미 하나(누르면 이름·정보)
const REGIONS: Array[Dictionary] = [
	{"id": "village", "name": "레몬 마을", "pos": Vector2(0.38, 0.60), "color": Color("7ccf5a"), "info": "모험의 시작 · 몬스터 없음", "mobs": "촌장 · 상인 · 농부 · 수도승 · 사냥꾼", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "field", "name": "초록 초원", "pos": Vector2(0.47, 0.65), "color": Color("6fd34f"), "info": "1장 · 추천 Lv.1~5", "mobs": "슬라임 · 버섯 · 박쥐", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "hill", "name": "꽃바람 언덕", "pos": Vector2(0.50, 0.55), "color": Color("6fd34f"), "info": "1장 · 추천 Lv.4~8", "mobs": "버섯 · 박쥐 · 슬라임 · 유령", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "forest", "name": "어스름 숲", "pos": Vector2(0.60, 0.57), "color": Color("6fd34f"), "info": "1장 · 추천 Lv.7~10", "mobs": "유령 · 해골 · 박쥐 · 버섯", "boss": "king_slime", "boss_name": "킹 슬라임", "lock": "", "lock_name": ""},
	{"id": "desert", "name": "타오르는 사막", "pos": Vector2(0.76, 0.59), "color": Color("f2b05e"), "info": "1장 · 추천 Lv.10~13", "mobs": "뱀 · 도마뱀 · 두더지", "boss": "", "boss_name": "", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "desert2", "name": "모래바람 협곡", "pos": Vector2(0.76, 0.70), "color": Color("f2b05e"), "info": "1장 · 추천 Lv.13~16", "mobs": "도마뱀 · 두더지 · 눈알 · 외눈 거인", "boss": "", "boss_name": "", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "desert3", "name": "저주받은 폐허", "pos": Vector2(0.70, 0.76), "color": Color("f2b05e"), "info": "1장 끝 · 추천 Lv.16~20", "mobs": "눈알 · 외눈 거인 · 해골 · 유령", "boss": "cyclope_king", "boss_name": "외눈 거인 왕", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "swamp", "name": "독안개 늪", "pos": Vector2(0.41, 0.71), "color": Color("f06bb0"), "info": "남쪽 · 추천 Lv.18~22", "mobs": "갓파 · 슬라임 · 도깨비불", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "waterfall", "name": "폭포 계곡", "pos": Vector2(0.29, 0.64), "color": Color("f06bb0"), "info": "남쪽 · 추천 Lv.18~22", "mobs": "도롱뇽 · 나비 · 너구리", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "beach", "name": "푸른 해변", "pos": Vector2(0.31, 0.78), "color": Color("f06bb0"), "info": "남쪽 · 추천 Lv.20~24", "mobs": "문어 · 너구리 · 갓파", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "ruinvillage", "name": "버려진 마을", "pos": Vector2(0.49, 0.74), "color": Color("f06bb0"), "info": "남쪽 · 추천 Lv.20~24", "mobs": "도깨비불 · 쥐 · 해골 · 유령", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "crystalcave", "name": "수정 동굴", "pos": Vector2(0.54, 0.81), "color": Color("f06bb0"), "info": "남쪽 끝 · 추천 Lv.22~26", "mobs": "거미 · 파란 박쥐 · 두더지", "boss": "spider_queen", "boss_name": "수정 거미 여왕", "lock": "", "lock_name": ""},
	{"id": "snowgate", "name": "설산 입구", "pos": Vector2(0.40, 0.50), "color": Color("7ccf5a"), "info": "설산으로 가는 동굴", "mobs": "설산 파수꾼", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "snow1", "name": "눈꽃 평원", "pos": Vector2(0.33, 0.44), "color": Color("a8d8ff"), "info": "2장 · 추천 Lv.25~30", "mobs": "눈쥐 · 판다 · 눈 박쥐", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "snow2", "name": "얼어붙은 호수", "pos": Vector2(0.47, 0.43), "color": Color("a8d8ff"), "info": "2장 · 추천 Lv.28~33", "mobs": "눈쥐 · 얼음 해골 · 눈 박쥐", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "snow3", "name": "눈보라 협곡", "pos": Vector2(0.38, 0.36), "color": Color("a8d8ff"), "info": "2장 · 추천 Lv.31~36", "mobs": "곰 · 서리 정령 · 얼음 해골", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "snow4", "name": "서리 전나무 숲", "pos": Vector2(0.55, 0.38), "color": Color("a8d8ff"), "info": "2장 · 추천 Lv.34~39", "mobs": "곰 · 판다 · 서리 정령", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "snow5", "name": "빙하 동굴", "pos": Vector2(0.72, 0.41), "color": Color("a8d8ff"), "info": "2장 · 추천 Lv.37~42", "mobs": "얼음 해골 · 서리 정령 · 눈 박쥐", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "snow6", "name": "설산 정상", "pos": Vector2(0.55, 0.30), "color": Color("a8d8ff"), "info": "2장 끝 · 추천 Lv.40~45", "mobs": "곰 · 판다", "boss": "yeti_king", "boss_name": "설원의 대왕곰", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "shore", "name": "잊혀진 나루터", "pos": Vector2(0.25, 0.58), "color": Color("7ccf5a"), "info": "해저 신전 입구", "mobs": "뱃사공", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "temple1", "name": "신전 입구 홀", "pos": Vector2(0.11, 0.50), "color": Color("3d6fe0"), "info": "3장 · 추천 Lv.45~49", "mobs": "파란 도롱뇽 · 튀는 물고기", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "temple2", "name": "물길 회랑", "pos": Vector2(0.10, 0.41), "color": Color("3d6fe0"), "info": "3장 · 추천 Lv.48~52", "mobs": "초록 문어 · 파란 도롱뇽", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "temple3", "name": "수몰된 서고", "pos": Vector2(0.06, 0.58), "color": Color("3d6fe0"), "info": "3장 · 추천 Lv.51~55", "mobs": "붉은 갓파 · 초록 문어", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "temple4", "name": "거울 연못", "pos": Vector2(0.11, 0.69), "color": Color("3d6fe0"), "info": "3장 · 추천 Lv.54~58", "mobs": "붉은 문어 · 튀는 물고기", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "temple5", "name": "심연 계단", "pos": Vector2(0.16, 0.80), "color": Color("3d6fe0"), "info": "3장 · 추천 Lv.57~61", "mobs": "심해 문어 · 붉은 갓파", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "temple6", "name": "해신의 제단", "pos": Vector2(0.27, 0.89), "color": Color("3d6fe0"), "info": "3장 끝 · 추천 Lv.60~65", "mobs": "심해 문어 · 붉은 문어", "boss": "kraken", "boss_name": "심해의 크라켄", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "lava1", "name": "잿빛 황무지", "pos": Vector2(0.75, 0.74), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.92~95", "mobs": "불꽃 · 붉은 하트", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "lava2", "name": "용암 강", "pos": Vector2(0.82, 0.76), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.94~97", "mobs": "불꽃 · 푸른 불꽃", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "lava3", "name": "불꽃 협곡", "pos": Vector2(0.83, 0.80), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.95~98", "mobs": "노란 용 · 푸른 불꽃", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "lava4", "name": "마그마 호수", "pos": Vector2(0.79, 0.84), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.96~99", "mobs": "티라노 · 불꽃", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "lava5", "name": "화산 기슭", "pos": Vector2(0.72, 0.83), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.97~100", "mobs": "회색 티라노 · 노란 용", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "lava6", "name": "화염룡의 둥지", "pos": Vector2(0.84, 0.90), "color": Color("ff8a2a"), "info": "6장 · 추천 Lv.100", "mobs": "용 · 푸른 불꽃", "boss": "flame_dragon", "boss_name": "화염룡 이그니스", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "hell1", "name": "지옥문", "pos": Vector2(0.65, 0.86), "color": Color("e0404f"), "info": "6장 · 추천 Lv.100~105", "mobs": "붉은 등불 · 마안", "boss": "", "boss_name": "", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "hell2", "name": "비명의 회랑", "pos": Vector2(0.60, 0.88), "color": Color("e0404f"), "info": "6장 · 추천 Lv.103~107", "mobs": "붉은 등불 · 마안", "boss": "", "boss_name": "", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "hell3", "name": "뼈의 들판", "pos": Vector2(0.66, 0.91), "color": Color("e0404f"), "info": "6장 · 추천 Lv.106~110", "mobs": "회색 티라노 · 붉은 등불", "boss": "", "boss_name": "", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "hell4", "name": "핏빛 호수", "pos": Vector2(0.58, 0.93), "color": Color("e0404f"), "info": "6장 · 추천 Lv.109~113", "mobs": "마안 · 용", "boss": "", "boss_name": "", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "hell5", "name": "타락한 성채", "pos": Vector2(0.69, 0.90), "color": Color("e0404f"), "info": "6장 · 추천 Lv.112~115", "mobs": "마안 · 붉은 등불", "boss": "", "boss_name": "", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "hell6", "name": "마왕의 옥좌", "pos": Vector2(0.63, 0.96), "color": Color("e0404f"), "info": "6장 끝 · 추천 Lv.115", "mobs": "마안 · 용", "boss": "demon_lord", "boss_name": "마왕 아자젤", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
	{"id": "sky1", "name": "버섯 구름섬", "pos": Vector2(0.74, 0.23), "color": Color("ffd84a"), "info": "8장 · 추천 Lv.140~143", "mobs": "대나무 · 초록 하트 · 노란 박쥐", "boss": "", "boss_name": "", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "sky2", "name": "꽃구름 섬", "pos": Vector2(0.20, 0.23), "color": Color("ffd84a"), "info": "8장 · 추천 Lv.142~145", "mobs": "노란 대나무 · 황금 너구리 · 노란 박쥐", "boss": "", "boss_name": "", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "sky3", "name": "천공의 탑 1층", "pos": Vector2(0.46, 0.25), "color": Color("ffd84a"), "info": "8장 · 추천 Lv.144~147", "mobs": "하늘 정령 · 황금 너구리", "boss": "", "boss_name": "", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "sky4", "name": "천공의 탑 2층", "pos": Vector2(0.50, 0.21), "color": Color("ffd84a"), "info": "8장 · 추천 Lv.146~148", "mobs": "하늘 정령 · 노란 대나무", "boss": "", "boss_name": "", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "sky5", "name": "천공의 탑 3층", "pos": Vector2(0.46, 0.17), "color": Color("ffd84a"), "info": "8장 · 추천 Lv.148~150", "mobs": "황금 너구리 · 초록 하트", "boss": "", "boss_name": "", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "sky6", "name": "천공의 탑 꼭대기", "pos": Vector2(0.49, 0.13), "color": Color("ffd84a"), "info": "마지막 장 · 추천 Lv.150", "mobs": "하늘 정령 · 황금 너구리", "boss": "giant_soul", "boss_name": "고대 거인의 혼", "lock": "root_worm", "lock_name": "뿌리 먹는 벌레왕"},
	{"id": "desert_town", "name": "오아시스 마을", "pos": Vector2(0.84, 0.63), "color": Color("ffe9a8"), "info": "사막의 마을 · 몬스터 없음", "mobs": "족장 · 물장수 · 대상 · 무희", "boss": "", "boss_name": "", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "snow_town", "name": "눈꽃 마을", "pos": Vector2(0.25, 0.37), "color": Color("ffe9a8"), "info": "설산의 마을 · 몬스터 없음", "mobs": "눈꽃 촌장 · 얼음 낚시꾼 · 약초꾼", "boss": "", "boss_name": "", "lock": "spider_queen", "lock_name": "수정 거미 여왕"},
	{"id": "temple_town", "name": "물방울 마을", "pos": Vector2(0.04, 0.47), "color": Color("ffe9a8"), "info": "바다 밑 마을 · 몬스터 없음", "mobs": "신전지기 · 물방울 상인 · 늙은 학자", "boss": "", "boss_name": "", "lock": "yeti_king", "lock_name": "설원의 대왕곰"},
	{"id": "lava_town", "name": "불꽃 대장간 마을", "pos": Vector2(0.80, 0.79), "color": Color("ffe9a8"), "info": "용암 지대의 마을 · 몬스터 없음", "mobs": "대장장이 · 광부 · 견습생", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "sky_town", "name": "구름 마을", "pos": Vector2(0.86, 0.20), "color": Color("ffe9a8"), "info": "하늘섬의 마을 · 몬스터 없음", "mobs": "구름 장로 · 바람 소녀 · 하늘 파수꾼", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root1", "name": "뿌리 내리막길", "pos": Vector2(0.63, 0.47), "color": Color("b58a4a"), "info": "7장 · 추천 Lv.115~120", "mobs": "애벌레 · 흙두더지", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root2", "name": "빛나는 뿌리 동굴", "pos": Vector2(0.68, 0.50), "color": Color("b58a4a"), "info": "7장 · 추천 Lv.118~124", "mobs": "푸른 애벌레 · 푸른 버섯", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root_town", "name": "새싹 마을", "pos": Vector2(0.64, 0.53), "color": Color("d4f5c8"), "info": "뿌리 속 마을 · 몬스터 없음", "mobs": "새싹 장로 · 약초꾼 · 새싹 아이", "boss": "", "boss_name": "", "lock": "giant_soul", "lock_name": "고대 거인의 혼"},
	{"id": "root3", "name": "썩은 물길", "pos": Vector2(0.69, 0.56), "color": Color("b58a4a"), "info": "7장 · 추천 Lv.122~128", "mobs": "초록 달팽이 · 푸른 버섯", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root4", "name": "벌레 굴", "pos": Vector2(0.66, 0.62), "color": Color("b58a4a"), "info": "7장 · 추천 Lv.126~132", "mobs": "애벌레 · 잿빛 야수", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root5", "name": "뿌리 심장 앞", "pos": Vector2(0.62, 0.66), "color": Color("b58a4a"), "info": "7장 · 추천 Lv.130~138", "mobs": "잿빛 야수 · 초록 달팽이", "boss": "", "boss_name": "", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "root6", "name": "검은 씨앗의 방", "pos": Vector2(0.57, 0.63), "color": Color("b58a4a"), "info": "7장 끝 · 추천 Lv.140", "mobs": "잿빛 야수 · 푸른 애벌레", "boss": "root_worm", "boss_name": "뿌리 먹는 벌레왕", "lock": "demon_lord", "lock_name": "마왕 아자젤"},
	{"id": "garden1", "name": "시든 꽃길", "pos": Vector2(0.94, 0.58), "color": Color("9a5cff"), "info": "5장 · 추천 Lv.80~83", "mobs": "푸른 나방 · 초록 도마뱀", "boss": "", "boss_name": "", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "garden2", "name": "가시덤불 미로", "pos": Vector2(0.91, 0.52), "color": Color("9a5cff"), "info": "5장 · 추천 Lv.82~85", "mobs": "검은 뱀 · 독거미", "boss": "", "boss_name": "", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "garden3", "name": "검은 연못", "pos": Vector2(0.95, 0.46), "color": Color("9a5cff"), "info": "5장 · 추천 Lv.84~87", "mobs": "부엉이 · 푸른 도마뱀", "boss": "", "boss_name": "", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "garden4", "name": "거꾸로 자란 숲", "pos": Vector2(0.91, 0.40), "color": Color("9a5cff"), "info": "5장 · 추천 Lv.86~89", "mobs": "붉은 부엉이 · 붉은 야수 · 푸른 나방", "boss": "", "boss_name": "", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "garden5", "name": "정원사의 길", "pos": Vector2(0.95, 0.34), "color": Color("9a5cff"), "info": "5장 · 추천 Lv.88~91", "mobs": "붉은 야수 · 독거미 · 부엉이", "boss": "", "boss_name": "", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "garden6", "name": "검은 나무 아래", "pos": Vector2(0.93, 0.28), "color": Color("9a5cff"), "info": "5장 끝 · 추천 Lv.90~93", "mobs": "붉은 부엉이 · 검은 뱀", "boss": "black_gardener", "boss_name": "검은 정원사", "lock": "mist_apostle", "lock_name": "안개의 사도"},
	{"id": "mist1", "name": "안개 해안", "pos": Vector2(0.36, 0.86), "color": Color("3fe0c8"), "info": "4장 · 추천 Lv.65~68", "mobs": "푸른 문어 · 붉은 눈 물고기", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "mist_town", "name": "안개 항구", "pos": Vector2(0.41, 0.90), "color": Color("d8ecff"), "info": "안개 군도의 마을 · 몬스터 없음", "mobs": "항구 촌장 · 등대지기 · 어부", "boss": "", "boss_name": "", "lock": "black_gardener", "lock_name": "검은 정원사"},
	{"id": "mist2", "name": "난파선 무덤", "pos": Vector2(0.36, 0.94), "color": Color("3fe0c8"), "info": "4장 · 추천 Lv.67~70", "mobs": "푸른 해골 · 푸른 문어", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "mist3", "name": "산호 숲", "pos": Vector2(0.45, 0.95), "color": Color("3fe0c8"), "info": "4장 · 추천 Lv.69~72", "mobs": "푸른 슬라임 · 붉은 눈 물고기", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "mist4", "name": "유령 등대 길", "pos": Vector2(0.50, 0.89), "color": Color("3fe0c8"), "info": "4장 · 추천 Lv.71~74", "mobs": "유령 등불 · 도깨비불", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "mist5", "name": "별무리 절벽", "pos": Vector2(0.46, 0.84), "color": Color("3fe0c8"), "info": "4장 · 추천 Lv.73~76", "mobs": "붉은 뱀 · 도깨비불 · 푸른 해골", "boss": "", "boss_name": "", "lock": "kraken", "lock_name": "심해의 크라켄"},
	{"id": "mist6", "name": "별을 삼킨 탑", "pos": Vector2(0.41, 0.81), "color": Color("3fe0c8"), "info": "4장 끝 · 추천 Lv.75~80", "mobs": "유령 등불 · 붉은 뱀", "boss": "mist_apostle", "boss_name": "안개의 사도", "lock": "kraken", "lock_name": "심해의 크라켄"},
]
## 지도 위 길(이어진 맵 id 쌍)
const ROUTES := [["village", "field"], ["field", "hill"], ["hill", "forest"], ["forest", "desert"], ["desert", "desert_town"], ["desert_town", "desert2"], ["desert2", "desert3"], ["village", "swamp"], ["swamp", "waterfall"], ["swamp", "beach"], ["swamp", "ruinvillage"], ["ruinvillage", "crystalcave"], ["village", "snowgate"], ["snowgate", "snow1"], ["snow1", "snow_town"], ["snow_town", "snow2"], ["snow2", "snow3"], ["snow3", "snow4"], ["snow4", "snow5"], ["snow5", "snow6"], ["village", "shore"], ["shore", "temple1"], ["temple1", "temple2"], ["temple2", "temple_town"], ["temple_town", "temple3"], ["temple3", "temple4"], ["temple4", "temple5"], ["temple5", "temple6"], ["desert3", "lava1"], ["desert_town", "garden1"], ["forest", "root1"], ["root1", "sky1"], ["lava1", "lava2"], ["lava2", "lava3"], ["lava3", "lava_town"], ["lava_town", "lava4"], ["lava4", "lava5"], ["lava5", "lava6"], ["lava6", "hell1"], ["hell1", "hell2"], ["hell2", "hell3"], ["hell3", "hell4"], ["hell4", "hell5"], ["hell5", "hell6"], ["sky1", "sky2"], ["sky2", "sky_town"], ["sky_town", "sky3"], ["sky3", "sky4"], ["sky4", "sky5"], ["sky5", "sky6"], ["root1", "root2"], ["root2", "root_town"], ["root_town", "root3"], ["root3", "root4"], ["root4", "root5"], ["root5", "root6"], ["garden1", "garden2"], ["garden2", "garden3"], ["garden3", "garden4"], ["garden4", "garden5"], ["garden5", "garden6"], ["beach", "mist1"], ["mist1", "mist_town"], ["mist_town", "mist2"], ["mist2", "mist3"], ["mist3", "mist4"], ["mist4", "mist5"], ["mist5", "mist6"]]
const WORLD_MAP := preload("res://assets/ui/world_map_art.png")  # 사용자가 준 월드 지도 그림

var world: Node2D
var tab := 0  # 0 지역, 1 월드
var map_tex: ImageTexture
var map_cells := Vector2i.ZERO
var t := 0.0
var _tile_colors: Dictionary = {}
var sel := ""  # 월드 지도에서 고른 지역(처음엔 지금 있는 곳)


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 60
	world = get_tree().get_first_node_in_group(&"world") as Node2D
	if world:
		_build_texture()
	get_tree().paused = true
	Game.sfx(&"pickup", -6.0, 0.0)


func _process(delta: float) -> void:
	t += delta
	queue_redraw()


func close() -> void:
	get_tree().paused = false
	closed.emit()
	queue_free()


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"map") or e.is_action_pressed(&"ui_cancel"):
		get_viewport().set_input_as_handled()
		close()


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if not (mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT):
		return
	var p := mb.position
	if _close_rect().has_point(p):
		close()
	elif _tab_rect(0).has_point(p):
		tab = 0
	elif _tab_rect(1).has_point(p):
		tab = 1
	elif tab == 1:
		var dst := _world_dst(_body_rect())
		# 가장 가까운 동그라미(손가락 크기쯤 안)
		var best := ""
		var best_d := 22.0
		for reg: Dictionary in REGIONS:
			var d := p.distance_to(dst.position + reg["pos"] * dst.size)
			if d < best_d:
				best_d = d
				best = reg["id"]
		if best != "":
			sel = best
			Game.sfx(&"pickup", -10.0, 0.0)


# ── 지도 그림 만들기 ──

## 땅 타일마다 그 타일 그림 가운데 색을 칸 하나로 칠하고, 나무·바위·집을 점으로 얹는다
func _build_texture() -> void:
	var ground := world.get_node(^"Ground") as TileMapLayer
	var used := ground.get_used_rect()
	map_cells = used.size
	var img := Image.create(used.size.x * CELL, used.size.y * CELL, false, Image.FORMAT_RGBA8)
	for y in used.size.y:
		for x in used.size.x:
			var c := used.position + Vector2i(x, y)
			var src := ground.get_cell_source_id(c)
			if src < 0:
				continue
			var col := _tile_color(ground.tile_set, src, ground.get_cell_atlas_coords(c))
			var wl := world.get_node_or_null(^"WaterLayer") as TileMapLayer
			if wl and wl.get_cell_source_id(c) >= 0:
				col = _tile_color(wl.tile_set, wl.get_cell_source_id(c), wl.get_cell_atlas_coords(c)).lerp(Color("5fb4ea"), 0.5)
			img.fill_rect(Rect2i(x * CELL, y * CELL, CELL, CELL), col)
	for n in world.get_node(^"Entities").get_children():
		var kind := String(n.name).rstrip("0123456789")
		var cell := Vector2i((n as Node2D).position / 16.0) - used.position
		var col := Color.TRANSPARENT
		var size := 1
		match kind:
			"Forest", "Tree", "BigTree":
				col = Color("2f7a3a")
				size = 2 if kind == "BigTree" else 1
			"Palm":
				col = Color("3f9a3e")
			"Rock":
				col = Color("8a7a6a")
			"House", "Torii", "Well":
				col = Color("b0573a")
				size = 2
		if col.a > 0.0:
			var px := cell * CELL
			img.fill_rect(Rect2i(px.x - size * 2, px.y - size * 3, CELL + size * 3, CELL + size * 2), col.darkened(0.25))
			img.fill_rect(Rect2i(px.x - size * 2 + 1, px.y - size * 3 + 1, CELL + size * 3 - 2, CELL + size * 2 - 2), col)
	map_tex = ImageTexture.create_from_image(img)


func _tile_color(ts: TileSet, src: int, atlas: Vector2i) -> Color:
	var key := "%d:%d:%d" % [src, atlas.x, atlas.y]
	if not _tile_colors.has(key):
		var source := ts.get_source(src) as TileSetAtlasSource
		var img := source.texture.get_image()
		var base := atlas * source.texture_region_size
		var sum := Color(0, 0, 0, 0)
		for p in [Vector2i(4, 4), Vector2i(8, 8), Vector2i(12, 12), Vector2i(4, 12), Vector2i(12, 4)]:
			sum += img.get_pixelv(base + p)
		_tile_colors[key] = Color(sum.r / 5.0, sum.g / 5.0, sum.b / 5.0, 1.0)
	return _tile_colors[key]


# ── 배치 ──

func _panel_rect() -> Rect2:
	return Rect2(Vector2(16, 70), size - Vector2(32, 150))


func _tab_rect(i: int) -> Rect2:
	var p := _panel_rect()
	var w := (p.size.x - 40) / 2.0
	return Rect2(p.position + Vector2(14 + i * (w + 12), 58), Vector2(w, 46))


func _body_rect() -> Rect2:
	var p := _panel_rect()
	return Rect2(p.position + Vector2(14, 118), p.size - Vector2(28, 132))


## 월드 지도 그림이 들어갈 자리(아래 정보 카드 자리를 빼고 비율 맞춰서)
func _world_dst(body: Rect2) -> Rect2:
	var avail := Rect2(body.position, Vector2(body.size.x, body.size.y - 128))
	var ts := Vector2(WORLD_MAP.get_size())
	var k := minf(avail.size.x / ts.x, avail.size.y / ts.y)
	return Rect2(avail.position + Vector2((avail.size.x - ts.x * k) / 2.0, 0), ts * k)


func _close_rect() -> Rect2:
	var p := _panel_rect()
	return Rect2(Vector2(p.get_center().x - 90, p.end.y + 12), Vector2(180, 56))


# ── 그리기 ──

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.72))
	var p := _panel_rect()
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(16, 40), "지도", "MAP", 20)
	for i in 2:
		var r := _tab_rect(i)
		if i == tab:
			Gt.button(self, r, Gt.Kind.PINK)
			Gt.title(self, Vector2(r.get_center().x, r.position.y + 28), ["지역 지도", "월드 지도"][i], 17, Color.WHITE, 1)
		else:
			Gt.pbox(self, r, Color("e9e4da"), Gt.INK, 3, false, true)
			Gt.text(self, Vector2(r.get_center().x, r.position.y + 29), ["지역 지도", "월드 지도"][i], 17, Gt.NAVY_SOFT, 1)
	var body := _body_rect()
	if tab == 0:
		_draw_region(body)
	else:
		_draw_world(body)
	var cb := _close_rect()
	Gt.button(self, cb, Gt.Kind.YELLOW)
	Gt.title(self, Vector2(cb.get_center().x, cb.position.y + 34), "닫기", 20, Color.WHITE, 1)


## 지역 지도: 맵 그림 + 표시들 + 아래 범례
func _draw_region(body: Rect2) -> void:
	if map_tex == null:
		Gt.text(self, body.get_center(), "지도를 볼 수 없는 곳이에요", 16, Gt.NAVY, 1)
		return
	var title: String = world.get(&"map_title")
	Gt.text(self, body.position + Vector2(4, 22), title, 20, Gt.NAVY)
	var ts := map_tex.get_size()
	var avail := Rect2(body.position + Vector2(0, 34), Vector2(body.size.x, body.size.y - 110))
	var k := minf(avail.size.x / ts.x, avail.size.y / ts.y)
	var dst := Rect2(avail.position + (avail.size - ts * k) / 2.0, ts * k)
	Gt.pbox(self, dst.grow(5), Color("3a2546"), Gt.INK, 2, true, false)
	draw_texture_rect(map_tex, dst, false)
	var scale := k * CELL / 16.0  # 월드 1픽셀 → 지도 픽셀
	var to_map := func(wp: Vector2) -> Vector2: return dst.position + wp * scale
	# 몬스터(작은 빨간 점), 마을 사람(파란 점)
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if e.get(&"is_boss"):
			continue
		draw_circle(to_map.call(e.global_position), 2.5, Color("ff4d5e"))
	for n in world.find_children("Npc*", "", true, false):
		var q := to_map.call((n as Node2D).global_position) as Vector2
		draw_circle(q, 4.5, Gt.INK)
		draw_circle(q, 3.2, Color("5db8ff"))
	# 이동문(행선지·잠금)
	for portal in world.find_children("Portal_*", "", true, false):
		var q := to_map.call((portal as Node2D).global_position) as Vector2
		var open: bool = portal.call(&"is_open")
		var label: String = String(portal.get(&"label")).trim_suffix(" ▶").trim_prefix("◀ ")
		Gt.orb(self, q, 6.0, Color("ffd23a") if open else Color("ff4d5e"))
		var text := label if open else label + " 🔒"
		var tw := Gt.width(text, 13)
		var tx := clampf(q.x, dst.position.x + tw / 2.0 + 6.0, dst.end.x - tw / 2.0 - 6.0)
		Gt.text(self, Vector2(tx, q.y - 12), label if open else label + " (잠김)", 13, Color.WHITE, 1, true, 4, Gt.INK)
	# 보스
	for b: Node2D in get_tree().get_nodes_in_group(&"bosses"):
		var q := to_map.call(b.global_position) as Vector2
		Gt.star(self, q, 9.0, Color("ff7a3d"))
		Gt.text(self, q + Vector2(0, 22), String(b.get(&"boss_name")), 13, Color("ffd0d0"), 1, true, 4, Gt.INK)
	# 나(깜빡이는 분홍 원 + 바라보는 방향)
	var player := world.get(&"player") as Node2D
	if player:
		var q := to_map.call(player.global_position) as Vector2
		var pulse := 1.0 + 0.35 * sin(t * 6.0)
		draw_circle(q, 9.0 * pulse, Color(1, 0.4, 0.7, 0.35))
		draw_circle(q, 6.5, Gt.INK)
		draw_circle(q, 5.0, Color("ff6fa8"))
		Gt.text(self, q + Vector2(0, -12), "나", 13, Color.WHITE, 1, true, 4, Gt.INK)
	# 범례
	var ly := body.end.y - 54
	var items := [["나", Color("ff6fa8")], ["이동문", Color("ffd23a")], ["몬스터", Color("ff4d5e")], ["마을 사람", Color("5db8ff")], ["보스", Color("ff7a3d")]]
	var x := body.position.x + 6
	for it: Array in items:
		draw_circle(Vector2(x + 7, ly), 6.0, Gt.INK)
		draw_circle(Vector2(x + 7, ly), 4.5, it[1])
		Gt.text(self, Vector2(x + 18, ly + 5), it[0], 13, Gt.NAVY)
		x += 30 + Gt.width(it[0], 13)
	Gt.text(self, Vector2(body.position.x + 6, ly + 34), "M 키나 닫기 버튼으로 지도를 닫아요", 12, Gt.NAVY_SOFT, 0, false)


## 월드 지도: 대륙 그림 위에 지역 표시·길·잠금, 아래에 고른 지역 정보
func _draw_world(body: Rect2) -> void:
	var here := ""
	if world and world.has_method(&"map_id"):
		here = world.call(&"map_id")
	if sel == "":
		sel = here if here != "" else "village"
	var dst := _world_dst(body)
	Gt.pbox(self, dst.grow(5), Color("3a2546"), Gt.INK, 2, true, false)
	draw_texture_rect(WORLD_MAP, dst, false)
	var by_id := {}
	for reg: Dictionary in REGIONS:
		by_id[reg["id"]] = reg
	var at := func(id: String) -> Vector2: return dst.position + (by_id[id]["pos"] as Vector2) * dst.size
	# 길(점선): 열린 길은 크림색, 잠긴 길은 흐린 회색
	for r: Array in ROUTES:
		var a: Vector2 = at.call(r[0])
		var b: Vector2 = at.call(r[1])
		var open := Quests.boss_defeated(by_id[r[1]]["lock"])
		var n := maxi(1, int(a.distance_to(b) / 7.0))
		for i in range(1, n):
			var q := a.lerp(b, float(i) / n)
			if i % 2 == 0:
				continue
			draw_circle(q, 2.0, Color(Gt.INK, 0.75 if open else 0.4))
			draw_circle(q, 1.3, Color("fff3c4") if open else Color(0.85, 0.82, 0.9, 0.55))
	# 맵 동그라미(이름은 고른 것만)
	for reg: Dictionary in REGIONS:
		var q: Vector2 = at.call(reg["id"])
		var locked := not Quests.boss_defeated(reg["lock"])
		var col: Color = reg["color"]
		if reg["id"] == sel:
			draw_circle(q, 12.0 + 2.0 * sin(t * 5.0), Color(1, 1, 1, 0.5))
		# 동그라미는 늘 그 장의 색(잠긴 곳은 조금 어둡게 + 작은 자물쇠)
		var town: bool = String(reg["id"]).ends_with("_town") or reg["id"] == "village"
		var rr := 7.5 if town else 6.5
		draw_circle(q, rr + 1.6, Gt.INK)
		draw_circle(q, rr, col.darkened(0.35) if locked else col)
		draw_circle(q + Vector2(-1.6, -1.6), rr * 0.32, Color(1, 1, 1, 0.55 if not locked else 0.25))
		if locked:
			var lq := q + Vector2(rr * 0.7, rr * 0.6)
			draw_rect(Rect2(lq + Vector2(-2.5, -1), Vector2(5, 4)), Gt.INK)
			draw_rect(Rect2(lq + Vector2(-1.8, -0.4), Vector2(3.6, 2.8)), Color("ffd54f"))
			draw_arc(lq + Vector2(0, -1.5), 1.8, PI, TAU, 6, Color("ffd54f"), 1.2)
		elif reg["boss"] != "":
			Gt.star(self, q, 3.5, Color("9be27a") if Quests.boss_defeated(reg["boss"]) else Color("ff4d3d"))
		if reg["id"] == here:
			var bob := sin(t * 4.0) * 2.0
			var f := q + Vector2(6, -4 + bob)
			draw_line(f, f + Vector2(0, -14), Gt.INK, 2.0)
			draw_colored_polygon(PackedVector2Array([f + Vector2(1, -14), f + Vector2(13, -10), f + Vector2(1, -6)]), Color("ff6fa8"))
			draw_arc(q, 9.0, 0, TAU, 20, Color("ff6fa8"), 2.0)
	# 고른 맵 이름표
	var sq: Vector2 = at.call(sel) if by_id.has(sel) else dst.get_center()
	var label: String = by_id[sel]["name"] if by_id.has(sel) else ""
	if label != "":
		var w := Gt.width(label, 13) + 18
		var lr := Rect2(Vector2(clampf(sq.x - w / 2.0, dst.position.x + 2, dst.end.x - w - 2), sq.y - 38), Vector2(w, 24))
		Gt.pbox(self, lr, Color.WHITE, Gt.INK, 2, false, false)
		draw_colored_polygon(PackedVector2Array([Vector2(sq.x - 5, lr.end.y), Vector2(sq.x + 5, lr.end.y), Vector2(sq.x, lr.end.y + 6)]), Gt.INK)
		Gt.text(self, Vector2(lr.get_center().x, lr.position.y + 17), label, 13, Gt.NAVY, 1)
	# 고른 지역 정보 카드
	var reg: Dictionary = by_id.get(sel, REGIONS[0])
	var r := Rect2(Vector2(body.position.x, dst.end.y + 12), Vector2(body.size.x, body.end.y - dst.end.y - 12))
	var locked := not Quests.boss_defeated(reg["lock"])
	var col: Color = reg["color"]
	Gt.pbox(self, r, col.lerp(Color.WHITE, 0.6) if not locked else Color("d8d2de"), Gt.INK, 3, true, true)
	Gt.round_grad(self, Rect2(r.position + Vector2(5, 5), Vector2(12, r.size.y - 10)), 4, col.lightened(0.2), col.darkened(0.2))
	Gt.text(self, r.position + Vector2(28, 30), reg["name"], 19, Gt.NAVY)
	Gt.text(self, r.position + Vector2(32 + Gt.width(reg["name"], 19), 29), reg["info"], 12, Gt.NAVY_SOFT, 0, false)
	Gt.text(self, r.position + Vector2(28, 56), ("만나는 사람: " if reg["id"] in ["village", "shore", "snowgate"] or String(reg["id"]).ends_with("_town") else "몬스터: ") + String(reg["mobs"]), 13, Gt.NAVY, 0, false)
	if locked:
		Gt.text(self, r.position + Vector2(28, 80), "🔒 %s 처치 후 열림" % reg["lock_name"], 13, Color("c0392b"))
	elif reg["boss"] != "":
		var dead := Quests.boss_defeated(reg["boss"])
		Gt.star(self, r.position + Vector2(36, 75), 7, Color("ff7a3d") if not dead else Color("9be27a"))
		Gt.text(self, r.position + Vector2(50, 80), "보스: %s  %s" % [reg["boss_name"], "· 처치 완료!" if dead else ""], 13, Gt.NAVY)
	if reg["id"] == here:
		var tag := Rect2(Vector2(r.end.x - 104, r.position.y + 10), Vector2(92, 24))
		Gt.tag(self, tag, Gt.PINK)
		Gt.text(self, Vector2(tag.get_center().x, tag.position.y + 17), "현재 위치", 12, Color.WHITE, 1)
	Gt.text(self, Vector2(r.get_center().x, r.end.y - 8), "지도의 동그라미를 누르면 이름과 정보가 나와요", 11, Gt.NAVY_SOFT, 1, false)
