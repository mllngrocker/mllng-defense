class_name Pets
extends RefCounted
## 펫 13종: 데리고 다니면 옆에서 따라다니며 가까운 몬스터를 물고(용사 공격력 × power), 능력치를 올려 준다.
## 얻는 법: 메인 퀘스트 보상(치즈냥·꼬꼬·바둑이), 보스를 처음 잡을 때(보스마다 하나). 한 번에 한 마리 데리고 다닌다(Save.pet).

## id → [이름, 그림, 공격 배율, {보너스}, 얻는 곳]
const DATA: Dictionary[StringName, Array] = {
	&"cat": ["치즈냥", "res://assets/ninja/actor/npc/cat.png", 0.25, {"gold": 0.10}, "메인 퀘스트 '촌장에게 인사하기'"],
	&"chicken": ["꼬꼬", "res://assets/ninja/actor/npc/chicken.png", 0.25, {"hp": 0.08}, "메인 퀘스트 '무기 장착하기'"],
	&"dog": ["바둑이", "res://assets/ninja/actor/npc/dog.png", 0.35, {"atk": 0.05}, "메인 퀘스트 '성장하기'"],
	&"slime": ["말랑이", "res://assets/ninja/actor/slime.png", 0.4, {"atk": 0.08}, "킹 슬라임 첫 처치"],
	&"eye": ["외눈이", "res://assets/ninja/actor/eye.png", 0.5, {"crit": 0.06}, "외눈 거인 왕 첫 처치"],
	&"spider": ["수정 거미", "res://assets/ninja/actor/spider.png", 0.55, {"atk": 0.10}, "수정 거미 여왕 첫 처치"],
	&"panda": ["아기 판다", "res://assets/ninja/actor/panda.png", 0.6, {"hp": 0.15, "atk": 0.05}, "설원의 대왕곰 첫 처치"],
	&"octopus": ["꼬마 문어", "res://assets/ninja/actor/octopus.png", 0.7, {"atk": 0.15}, "심해의 크라켄 첫 처치"],
	&"flam": ["불꽃 정령", "res://assets/ninja/actor/flam.png", 0.8, {"atk": 0.20}, "화염룡 이그니스 첫 처치"],
	&"dragon": ["아기 용", "res://assets/ninja/actor/dragon.png", 1.0, {"atk": 0.25, "crit": 0.05}, "마왕 아자젤 첫 처치"],
	&"gold_racoon": ["황금 너구리", "res://assets/ninja/actor/gold_racoon.png", 1.2, {"atk": 0.30, "gold": 0.30}, "고대 거인의 혼 첫 처치"],
	&"root_larva": ["아기 애벌레", "res://assets/ninja/actor/root_larva.png", 1.35, {"atk": 0.35, "hp": 0.20}, "뿌리 먹는 벌레왕 첫 처치"],
	&"garden_owl": ["밤 부엉이", "res://assets/ninja/actor/garden_owl.png", 1.6, {"atk": 0.45, "crit": 0.08}, "검은 정원사 첫 처치"],
	&"mist_wisp": ["도깨비불", "res://assets/ninja/actor/mist_wisp.png", 1.8, {"atk": 0.55, "gold": 0.20}, "안개의 사도 첫 처치"],
}
## 보스를 처음 잡으면 주는 것: 보스 id → [펫, 보스 무기]
const BOSS_REWARDS := {
	"king_slime": [&"slime", &"slime_scepter"],
	"cyclope_king": [&"eye", &"cyclops_maul"],
	"spider_queen": [&"spider", &"crystal_fang"],
	"yeti_king": [&"panda", &"glacier_blade"],
	"kraken": [&"octopus", &"sea_trident"],
	"flame_dragon": [&"flam", &"ignis_spear"],
	"demon_lord": [&"dragon", &"demon_sword"],
	"giant_soul": [&"gold_racoon", &"giant_heart"],
	"root_worm": [&"root_larva", &"root_lance"],
	"black_gardener": [&"garden_owl", &"gardener_scythe"],
	"mist_apostle": [&"mist_wisp", &"mist_blade"],
}
const BONUS_NAMES := {"atk": "공격력", "hp": "체력", "crit": "치명타", "gold": "골드 획득"}

static var _tex: Dictionary[StringName, Texture2D] = {}


static func ids() -> Array[StringName]:
	var out: Array[StringName] = []
	out.assign(DATA.keys())
	return out


static func name_of(id: StringName) -> String:
	return DATA[id][0]


static func power_of(id: StringName) -> float:
	return DATA[id][2]


static func bonus_of(id: StringName) -> Dictionary:
	return DATA[id][3]


static func source_of(id: StringName) -> String:
	return DATA[id][4]


static func bonus_text(id: StringName) -> String:
	var parts: Array[String] = []
	var b := bonus_of(id)
	for k: String in b:
		parts.append("%s +%d%%" % [BONUS_NAMES[k], roundi(float(b[k]) * 100.0)])
	return " · ".join(parts)


static func texture(id: StringName) -> Texture2D:
	if not _tex.has(id):
		_tex[id] = load(DATA[id][1])
	return _tex[id]


## 시트 모양: 동물(32x16)은 가로 2칸, 몬스터(64x64)는 4방향 x 4걸음
static func frames_of(id: StringName) -> Vector2i:
	var t := texture(id)
	return Vector2i(2, 1) if t.get_height() <= 16 else Vector2i(4, 4)


## 칸 안에 펫 얼굴(첫 그림)을 그린다
static func draw_icon(ci: CanvasItem, id: StringName, r: Rect2) -> void:
	var t := texture(id)
	var f := frames_of(id)
	var cell := Vector2(t.get_width() / f.x, t.get_height() / f.y)
	var k := minf(r.size.x / cell.x, r.size.y / cell.y)
	var sz := cell * k
	ci.draw_texture_rect_region(t, Rect2(r.get_center() - sz / 2.0, sz), Rect2(Vector2.ZERO, cell))
