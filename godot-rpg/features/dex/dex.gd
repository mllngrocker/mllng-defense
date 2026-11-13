class_name Dex
extends RefCounted
## 도감 데이터: 몬스터 이름(지역 순서), 그림(적 장면의 Sprite 첫 칸)을 꺼내는 도구.
## 잡은 수는 Save.dex, 보너스는 Save.dex_bonus(발견한 몬스터 1종마다 공격력 +0.3%, 모은 장비 1종마다 체력 +0.5%).

## [kind, 이름, 보스인지] — 지역 순서대로
const MOBS: Array = [
	["slime", "슬라임", false], ["rabbit", "갈색 토끼", false], ["horn_rabbit", "뿔토끼", false], ["mushroom", "버섯돌이", false], ["bat", "박쥐", false], ["skull", "해골", false], ["spirit", "유령", false], ["forest_bat", "숲 박쥐", false],
	["king_slime", "킹 슬라임", true],
	["snake", "모래뱀", false], ["lizard", "사막 도마뱀", false], ["mole", "두더지", false], ["eye", "외눈 괴물", false], ["sand_spider", "모래 거미", false], ["cyclope", "외눈 거인", false], ["curse_eye", "저주의 눈", false], ["ruin_ghost", "폐허 유령", false], ["sand_skull", "모래 해골", false],
	["cyclope_king", "외눈 거인 왕", true],
	["kappa", "갓파", false], ["swamp_slime", "늪 슬라임", false], ["poison_shroom", "독버섯 전사", false], ["lantern", "도깨비 등불", false], ["rat", "늪쥐", false], ["goblin", "고블린", false], ["spider", "수정 거미", false], ["bluebat", "푸른 박쥐", false], ["wing_eye", "날개 눈알", false],
	["axolot", "우파루파", false], ["butterfly", "나비", false], ["octopus", "꼬마 문어", false], ["beach_slime", "소라 슬라임", false], ["racoon", "너구리", false], ["ogre", "숲 오우거", false],
	["spider_queen", "수정 거미 여왕", true],
	["panda", "설원 판다", false], ["bear", "눈곰", false], ["white_bear", "하얀 곰", false], ["snow_ogre", "설산 오우거", false], ["frost_goblin", "서리 고블린", false], ["frost_shroom", "서리 버섯", false], ["blue_beast", "푸른 수인", false], ["ice_skull", "얼음 해골", false], ["lake_mouse", "호수 눈쥐", false], ["ice_octopus", "얼음 문어", false], ["frost_spirit", "서리 정령", false], ["ice_eye", "얼음 눈알", false], ["glacier_spider", "빙하 거미", false],
	["snow_bat", "눈박쥐", false], ["snow_mouse", "눈쥐", false],
	["yeti_king", "설원의 대왕곰", true],
	["blue_axolot", "푸른 우파루파", false], ["deep_octopus", "심해 문어", false], ["altar_knight", "제단 해골 기사", false], ["altar_kappa", "제단 수호 갓파", false], ["abyss_eye", "심연의 눈", false], ["green_octopus", "초록 문어", false], ["drop_slime", "물방울 슬라임", false],
	["red_octopus", "붉은 문어", false], ["mirror_fish", "거울 물고기", false], ["jump_fish", "뛰는 물고기", false], ["kappa_red", "붉은 갓파", false], ["library_ghost", "서고 유령", false],
	["kraken", "심해의 크라켄", true],
	["mist_octo", "푸른 문어", false], ["mist_fish", "붉은 눈 물고기", false], ["mist_skull", "푸른 해골", false], ["wreck_knight", "난파선 해골 검사", false],
	["mist_wisp", "도깨비불", false], ["shade", "그림자 망령", false], ["mist_lantern", "유령 등불", false], ["star_wisp", "별 도깨비불", false], ["tower_guard", "탑의 가면병", false], ["mist_slime", "푸른 슬라임", false], ["coral_octo", "산호 문어", false],
	["mist_snake", "붉은 뱀", false],
	["mist_apostle", "안개의 사도", true],
	["garden_moth", "푸른 나방", false], ["garden_owl", "부엉이", false], ["garden_owl2", "붉은 부엉이", false], ["dark_zombie", "검은 덩굴 좀비", false], ["thorn_fiend", "검은 가시 마귀", false],
	["garden_lizard", "초록 도마뱀", false], ["grass_zombie", "들풀 좀비", false], ["garden_lizard2", "푸른 도마뱀", false], ["garden_snake", "검은 뱀", false],
	["garden_spider", "독거미", false], ["garden_beast", "붉은 야수", false], ["rose_witch", "장미 마녀", false],
	["black_gardener", "검은 정원사", true],
	["flam", "불꽃 정령", false], ["lava_slime", "용암 슬라임", false], ["crest_lizard", "붉은 볏 도마뱀", false], ["flam2", "큰 불꽃 정령", false], ["dragon", "새끼 용", false], ["fire_bat", "불꽃 박쥐", false], ["dragon_y", "노란 용", false],
	["trex", "티라노", false], ["magma_octo", "마그마 문어", false], ["grey_trex", "잿빛 티라노", false], ["skel_knight", "해골 검사", false], ["bone_ogre", "뼈 오우거", false], ["dragon_man", "용인 전사", false], ["heart_red", "붉은 하트", false],
	["flame_dragon", "화염룡 이그니스", true],
	["lantern_red", "붉은 등불", false], ["spike_fiend", "가시 마귀", false], ["demon_eye", "악마의 눈", false], ["scream_ghost", "비명 유령", false], ["pink_witch", "분홍 뿔 마녀", false], ["throne_eye", "옥좌의 감시자", false], ["demon_drake", "마계 용", false], ["gargoyle", "성채 가고일", false], ["red_armor", "붉은 갑옷 마족", false], ["blood_octo", "핏빛 문어", false],
	["demon_lord", "마왕 아자젤", true],
	["bamboo", "대나무 정령", false], ["war_rooster", "싸움닭", false], ["bamboo_y", "노란 대나무", false], ["gold_racoon", "황금 너구리", false], ["bird_man", "주황 새인간", false],
	["heart_green", "초록 하트", false], ["sky_spirit", "하늘 정령", false], ["sky_fiend", "폭풍 마귀", false], ["star_gargoyle", "별 가고일", false], ["sky_drake", "구름 용인", false], ["storm_birdman", "번개 새인간", false], ["sky_knight", "천공의 기사", false], ["sky_skeleton", "천공 해골 검사", false], ["sky_bat", "노란 박쥐", false],
	["storm_king", "폭풍새 왕", true],
	["root_larva", "애벌레", false], ["root_larva_b", "푸른 애벌레", false], ["root_mollusc", "초록 달팽이", false],
	["root_mole", "흙두더지", false], ["root_shroom", "푸른 버섯", false], ["root_beast", "잿빛 야수", false], ["seed_guard", "씨앗 수호자", false], ["seed_fiend", "씨앗 마귀", false], ["root_zombie", "썩은 뿌리 좀비", false], ["root_ogre", "뿌리 오우거", false], ["horn_beast", "뿔 짐승", false], ["burrow_spider", "벌레굴 거미", false],
	["root_worm", "뿌리 먹는 벌레왕", true],
	["giant_soul", "고대 거인의 혼", true],
]

## 챕터 보상: [이 보스까지가 한 챕터, 이름, 보석]. 그 챕터 몬스터(보스 포함)를 모두 한 번씩 잡으면 받는다
const CHAPTERS: Array = [
	["king_slime", "초원·숲", 100], ["cyclope_king", "언덕·사막", 150], ["spider_queen", "늪·동굴·해변", 200],
	["yeti_king", "설산", 250], ["kraken", "해저 신전", 300], ["mist_apostle", "안개 군도", 350],
	["black_gardener", "검은 정원", 400], ["flame_dragon", "용암 지대", 450], ["demon_lord", "지옥", 500],
	["storm_king", "천공의 탑", 600], ["giant_soul", "큰 나무 뿌리", 800],
]
## 한 몬스터를 이만큼 잡으면 보석(자동으로 받음)
const MASTERY_KILLS := 100
const MASTERY_GEMS := 10

static var _art: Dictionary = {}  # kind → [텍스처, 첫 칸 영역, 색]


## 몬스터 그림(장면의 Sprite 첫 칸). 처음 한 번만 장면을 열어 본다.
static func art(kind: String) -> Array:
	if not _art.has(kind):
		var node := (load("res://features/enemy/%s.tscn" % kind) as PackedScene).instantiate()
		var sp := node.get_node(^"Sprite") as Sprite2D
		var tex := sp.texture
		var cell := Vector2(tex.get_width() / float(sp.hframes), tex.get_height() / float(sp.vframes))
		_art[kind] = [tex, Rect2(Vector2.ZERO, cell), sp.modulate]
		node.free()
	return _art[kind]


## 챕터 i의 몬스터 kind 목록(앞 챕터 보스 다음부터 이 챕터 보스까지)
static func chapter_mobs(i: int) -> Array[String]:
	var out: Array[String] = []
	var start := 0
	if i > 0:
		start = _index_of(CHAPTERS[i - 1][0]) + 1
	for k in range(start, _index_of(CHAPTERS[i][0]) + 1):
		out.append(MOBS[k][0])
	return out


static func _index_of(kind: String) -> int:
	for k in MOBS.size():
		if MOBS[k][0] == kind:
			return k
	return -1


## [잡아 본 종류, 전체]
static func chapter_progress(i: int) -> Vector2i:
	var list := chapter_mobs(i)
	var n := 0
	for kind in list:
		if int(Save.dex.get(kind, 0)) > 0:
			n += 1
	return Vector2i(n, list.size())


static func chapter_claimed(i: int) -> bool:
	return (Save.settings.get("dex_ch", []) as Array).has(i)


static func can_claim(i: int) -> bool:
	var p := chapter_progress(i)
	return p.x >= p.y and not chapter_claimed(i)


## 받을 수 있는 챕터 보상 수(도감 버튼 빨간 점)
static func claimable() -> int:
	var n := 0
	for i in CHAPTERS.size():
		if can_claim(i):
			n += 1
	return n


static func claim(i: int) -> bool:
	if not can_claim(i):
		return false
	var list: Array = Save.settings.get("dex_ch", [])
	list.append(i)
	Save.settings["dex_ch"] = list
	Save.add_gems(int(CHAPTERS[i][2]))
	Save.save_game()
	return true


static func found_count() -> int:
	var n := 0
	for m: Array in MOBS:
		if Save.dex.has(m[0]):
			n += 1
	return n
