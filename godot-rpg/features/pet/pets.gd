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
	&"gold_racoon": ["황금 너구리", "res://assets/ninja/actor/gold_racoon.png", 1.2, {"atk": 0.30, "gold": 0.30}, "폭풍새 왕 첫 처치"],
	&"root_larva": ["아기 애벌레", "res://assets/ninja/actor/root_larva.png", 1.35, {"atk": 0.35, "hp": 0.20}, "뿌리 먹는 벌레왕 첫 처치"],
	&"garden_owl": ["밤 부엉이", "res://assets/ninja/actor/garden_owl.png", 1.6, {"atk": 0.45, "crit": 0.08}, "검은 정원사 첫 처치"],
	&"gold_dragon": ["황금 아기 용", "res://assets/ninja/actor/dragon_y.png", 2.0, {"atk": 0.60, "hp": 0.30}, "고대 거인의 혼 첫 처치"],
	&"axolot": ["우파", "res://assets/ninja/actor/axolot.png", 0.5, {"hp": 0.06}, "펫 소환 ★3"],
	&"butterfly": ["나풀이", "res://assets/ninja/actor/butterfly.png", 0.45, {"gold": 0.08}, "펫 소환 ★3"],
	&"rat": ["찍찍이", "res://assets/ninja/actor/rat.png", 0.45, {"crit": 0.03}, "펫 소환 ★3"],
	&"snow_mouse": ["눈쥐", "res://assets/ninja/actor/snow_mouse.png", 0.45, {"atk": 0.05}, "펫 소환 ★3"],
	&"mole": ["두더지", "res://assets/ninja/actor/mole.png", 0.5, {"hp": 0.07}, "펫 소환 ★3"],
	&"jump_fish": ["통통 물고기", "res://assets/ninja/actor/jump_fish.png", 0.5, {"gold": 0.1}, "펫 소환 ★3"],
	&"mushroom": ["버섯돌이", "res://assets/ninja/actor/mushroom.png", 0.5, {"atk": 0.06}, "펫 소환 ★3"],
	&"bat": ["꼬마 박쥐", "res://assets/ninja/actor/bat.png", 0.5, {"crit": 0.04}, "펫 소환 ★3"],
	&"blue_axolot": ["푸른 우파", "res://assets/ninja/actor/blue_axolot.png", 0.7, {"hp": 0.18, "atk": 0.06}, "펫 소환 ★4"],
	&"frost_spirit": ["서리 정령", "res://assets/ninja/actor/frost_spirit.png", 0.75, {"atk": 0.18}, "펫 소환 ★4"],
	&"lantern": ["등불 요정", "res://assets/ninja/actor/lantern.png", 0.7, {"gold": 0.25, "crit": 0.03}, "펫 소환 ★4"],
	&"kappa": ["꼬마 갓파", "res://assets/ninja/actor/kappa.png", 0.7, {"hp": 0.2}, "펫 소환 ★4"],
	&"sky_spirit": ["하늘 정령", "res://assets/ninja/actor/sky_spirit.png", 0.8, {"atk": 0.15, "crit": 0.05}, "펫 소환 ★4"],
	&"lizard": ["도마뱀 기사", "res://assets/ninja/actor/lizard.png", 0.75, {"atk": 0.2}, "펫 소환 ★4"],
	&"guardian": ["수호령", "res://assets/ninja/actor/spirit.png", 1.5, {"atk": 0.45, "crit": 0.08}, "펫 소환 ★5"],
	&"deep_octo": ["심해 문어", "res://assets/ninja/actor/deep_octopus.png", 1.5, {"atk": 0.4, "hp": 0.3}, "펫 소환 ★5"],
	&"love_heart": ["사랑의 하트", "res://assets/ninja/actor/heart_red.png", 1.4, {"hp": 0.5, "gold": 0.25}, "펫 소환 ★5"],
	&"mist_wisp": ["도깨비불", "res://assets/ninja/actor/mist_wisp.png", 1.8, {"atk": 0.55, "gold": 0.20}, "안개의 사도 첫 처치"],
}
## 보스를 처음 잡으면 주는 것: 보스 id → [펫, 보스 무기]
## 펫 소환에서 나오는 펫과 등급(★3 · ★4 · ★5)
const GACHA_PETS := {
	&"axolot": 3,
	&"butterfly": 3,
	&"rat": 3,
	&"snow_mouse": 3,
	&"mole": 3,
	&"jump_fish": 3,
	&"mushroom": 3,
	&"bat": 3,
	&"blue_axolot": 4,
	&"frost_spirit": 4,
	&"lantern": 4,
	&"kappa": 4,
	&"sky_spirit": 4,
	&"lizard": 4,
	&"guardian": 5,
	&"deep_octo": 5,
	&"love_heart": 5,
}
const MAX_PET_LV := 5  # 중복이면 펫 강화 +1(보너스 +20%씩)

const BOSS_REWARDS := {
	"king_slime": [&"slime", &"slime_scepter"],
	"cyclope_king": [&"eye", &"cyclops_maul"],
	"spider_queen": [&"spider", &"crystal_fang"],
	"yeti_king": [&"panda", &"glacier_blade"],
	"kraken": [&"octopus", &"sea_trident"],
	"flame_dragon": [&"flam", &"ignis_spear"],
	"demon_lord": [&"dragon", &"demon_sword"],
	"storm_king": [&"gold_racoon", &"storm_bow"],
	"giant_soul": [&"gold_dragon", &"giant_heart"],
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
static func gacha_pool(rarity: int) -> Array[StringName]:
	var out: Array[StringName] = []
	for id: StringName in GACHA_PETS:
		if int(GACHA_PETS[id]) == rarity:
			out.append(id)
	return out


## 펫 등급: 소환 펫은 표의 등급, 보스 펫은 ★5
static func rarity_of(id: StringName) -> int:
	return int(GACHA_PETS.get(id, 5))


## 펫 카드: 무기·장비 카드와 같은 모양 + 등급 테두리
static func draw_card(ci: CanvasItem, id: StringName, r: Rect2, show_name := true, dim := false, bob := 0.0) -> void:
	var rarity := rarity_of(id)
	var rc: Color = Gt.RARITY[rarity]
	Gt.pbox(ci, r, rc if not dim else rc.darkened(0.5), Gt.INK, 2, true, true)
	var inner := r.grow(-Gt.PX * 2.0)
	Gt.grad(ci, inner, Color("2e2648"), rc.darkened(0.35))
	var c := inner.get_center() + Vector2(0, -inner.size.y * 0.1)
	ci.draw_circle(c, inner.size.x * 0.36, Color(rc.lightened(0.3), 0.3))
	var s := minf(inner.size.x, inner.size.y) * 0.7
	draw_icon(ci, id, Rect2(c - Vector2(s, s) / 2.0 + Vector2(0, bob), Vector2(s, s)))
	if dim:
		ci.draw_rect(inner, Color(Gt.INK, 0.5))
	var fade_h := inner.size.y * 0.3
	Gt.grad(ci, Rect2(inner.position.x, inner.end.y - fade_h, inner.size.x, fade_h), Color(Gt.INK, 0.0), Color(Gt.INK, 0.8))
	var sr := clampf(inner.size.x / 15.0, 4.0, 8.0)
	for i in rarity:
		Gt.star(ci, Vector2(inner.get_center().x + (i - (rarity - 1) / 2.0) * sr * 2.15, inner.end.y - sr - 4), sr, Gt.item_star(rarity))
	if show_name:
		Gt.title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), name_of(id) if not dim else "???", int(clampf(inner.size.x / 6.5, 10, 18)), Color.WHITE, 1)
	Gt.tier_frame(ci, r, rarity - 2, id.hash() % 7)


static func draw_icon(ci: CanvasItem, id: StringName, r: Rect2) -> void:
	var t := texture(id)
	var f := frames_of(id)
	var cell := Vector2(t.get_width() / f.x, t.get_height() / f.y)
	var k := minf(r.size.x / cell.x, r.size.y / cell.y)
	var sz := cell * k
	ci.draw_texture_rect_region(t, Rect2(r.get_center() - sz / 2.0, sz), Rect2(Vector2.ZERO, cell))
