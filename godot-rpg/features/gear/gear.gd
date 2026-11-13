class_name Gear
extends RefCounted
## 장비(옷·신발·목걸이·반지) 16종: 부위마다 4등급 — ★1 일반(초록) · ★2 희귀(파랑) · ★3 영웅(주황) · ★4 전설(빨강).
## 몬스터가 가끔 떨어뜨리고(ItemPickup), 보스는 잡을 때마다 희귀 이상을 하나 준다.
## 같은 장비를 또 얻으면 재련 +1(최대 +5, 효과 +10%씩), 다 차면 골드로. 캐릭터마다 부위별로 하나씩 낀다(Save.gear_equip).
## 효과: hp·atk·speed·gold는 비율(0.1 = +10%), crit은 확률을 그대로 더한다.

const SLOTS: Array[String] = ["armor", "boots", "neck", "ring"]
const SLOT_NAMES := {"armor": "옷", "boots": "신발", "neck": "목걸이", "ring": "반지"}
const SLOT_ICONS := {"armor": &"slot_armor", "boots": &"slot_boot", "neck": &"slot_amulet", "ring": &"slot_ring"}
const GRADE_NAMES: Array[String] = ["", "일반", "희귀", "영웅", "전설", "신화"]
const GRADE_COLORS: Array[Color] = [Color.WHITE, Color("5fc46a"), Color("4a9cf0"), Color("ff9a2e"), Color("f0464a"), Color("ff2d55")]
const STAT_NAMES := {"hp": "체력", "atk": "공격력", "crit": "치명타", "speed": "이동 속도", "gold": "골드 획득"}
const MAX_REFINE := 5
const MAXED_GOLD: Array[int] = [0, 300, 1500, 8000, 40000, 150000]  # 재련이 다 찬 장비를 또 얻으면 주는 골드
## 분해: 등급별 강화석(재련 1마다 한 개 더 분해한 셈) · 강화: 강화석으로 재련 +1(다음 재련 수만큼 비싸진다)
const STONES_FROM: Array[int] = [0, 2, 6, 20, 60, 200]
const UPGRADE_COST: Array[int] = [0, 5, 12, 30, 80, 200]
## 합성: 같은 등급 장비 3개(재련 +1도 한 개로 센다) → 한 등급 위 장비 하나
const SYNTH_NEED := 3
## 몬스터가 떨어뜨릴 확률, 등급 가중치(일반 몬스터 / 보스)
const DROP_CHANCE := 0.02
const MOB_WEIGHTS: Array[float] = [0.0, 60.0, 28.0, 10.0, 2.0, 0.0]  # 신화는 소환에서만
const BOSS_WEIGHTS: Array[float] = [0.0, 0.0, 50.0, 38.0, 12.0, 0.0]
## 장비 레벨: Lv.1·10·20 … 150(id 뒤에 "_l50"). 레벨이 높을수록 세고, 그 레벨이 돼야 낀다. 몬스터는 용사 레벨에 맞는 장비를 떨어뜨린다.
## (예전 정예 "_t2" = Lv.40, 고대 "_t3" = Lv.90으로 읽는다)
const LEVELS: Array[int] = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]
const LEVEL_MULT := 0.04  # 장비 레벨 1마다 효과 +4%(Lv.150 ≈ 7배)
## 골드 강화: +1마다 효과 +3%, 최대 +100. 분해하면 강화 수치가 같은 부위 다음 새 장비로 이어진다
const MAX_ENH := 100
const ENH_BONUS := 0.03

## id → [이름, 부위, 등급, {효과}, 설명]
const DATA: Dictionary[StringName, Array] = {
	&"armor1": ["가죽 조끼", "armor", 1, {"hp": 0.08}, "사냥꾼이 처음 입는 질긴 조끼"],
	&"armor2": ["사슬 갑옷", "armor", 2, {"hp": 0.16}, "촘촘한 고리가 몸을 지켜 준다"],
	&"armor3": ["기사 갑옷", "armor", 3, {"hp": 0.28, "atk": 0.04}, "왕국 기사단의 단단한 갑옷"],
	&"armor4": ["용비늘 갑옷", "armor", 4, {"hp": 0.45, "atk": 0.08}, "화염룡의 비늘을 엮어 만든 갑옷"],
	&"boots1": ["낡은 장화", "boots", 1, {"speed": 0.05}, "많이 걸어 길이 든 장화"],
	&"boots2": ["여행자 장화", "boots", 2, {"speed": 0.09}, "먼 길에도 발이 편하다"],
	&"boots3": ["바람 장화", "boots", 3, {"speed": 0.14, "hp": 0.06}, "발걸음에 바람이 실린다"],
	&"boots4": ["유성 장화", "boots", 4, {"speed": 0.20, "hp": 0.12}, "별똥별처럼 달린다"],
	&"neck1": ["나무 목걸이", "neck", 1, {"atk": 0.05}, "레몬나무를 깎아 만든 부적"],
	&"neck2": ["은 목걸이", "neck", 2, {"atk": 0.10}, "은은한 빛이 힘을 준다"],
	&"neck3": ["황금 방울 목걸이", "neck", 3, {"atk": 0.18, "crit": 0.02}, "방울 소리가 용기를 깨운다"],
	&"neck4": ["별빛 목걸이", "neck", 4, {"atk": 0.30, "crit": 0.04}, "떨어진 별 조각이 박혀 있다"],
	&"ring1": ["구리 반지", "ring", 1, {"crit": 0.02}, "손에 익은 평범한 반지"],
	&"ring2": ["사파이어 반지", "ring", 2, {"crit": 0.04}, "푸른 보석이 급소를 비춘다"],
	&"ring3": ["루비 반지", "ring", 3, {"crit": 0.07, "gold": 0.10}, "붉은 보석이 행운을 부른다"],
	&"ring4": ["용의 반지", "ring", 4, {"crit": 0.11, "gold": 0.20}, "용의 눈동자를 닮은 반지"],
	# 등급마다 두 번째 장비(모양·효과가 조금 다르다)
	&"armor1b": ["천 튜닉", "armor", 1, {"hp": 0.06, "speed": 0.02}, "가볍고 움직이기 편한 푸른 옷"],
	&"armor2b": ["숲지기 옷", "armor", 2, {"hp": 0.12, "crit": 0.01}, "숲을 지키는 이들이 입는 초록 옷"],
	&"armor3b": ["판금 갑옷", "armor", 3, {"hp": 0.34}, "두꺼운 쇠판을 겹쳐 만든 갑옷"],
	&"armor4b": ["대마법사 로브", "armor", 4, {"hp": 0.30, "atk": 0.12}, "별빛 마법이 짜여 들어간 보랏빛 로브"],
	&"boots1b": ["가죽 장화", "boots", 1, {"speed": 0.04, "hp": 0.02}, "튼튼한 소가죽 장화"],
	&"boots2b": ["철 장화", "boots", 2, {"speed": 0.06, "hp": 0.05}, "발등을 쇠로 덧댄 장화"],
	&"boots3b": ["강철 장화", "boots", 3, {"speed": 0.12, "hp": 0.09}, "푸른 강철로 만든 무거운 장화"],
	&"boots4b": ["용 발톱 장화", "boots", 4, {"speed": 0.17, "atk": 0.06}, "화염룡의 발톱으로 만든 장화"],
	&"neck1b": ["이빨 목걸이", "neck", 1, {"crit": 0.01, "atk": 0.03}, "사냥한 짐승의 이빨을 꿴 목걸이"],
	&"neck2b": ["진주 목걸이", "neck", 2, {"atk": 0.08, "hp": 0.04}, "물방울 마을의 하얀 진주"],
	&"neck3b": ["루비 펜던트", "neck", 3, {"atk": 0.20}, "타오르는 붉은 보석 펜던트"],
	&"neck4b": ["용의 눈 목걸이", "neck", 4, {"atk": 0.27, "crit": 0.05}, "잠든 용의 눈을 담은 목걸이"],
	&"ring1b": ["철 반지", "ring", 1, {"crit": 0.015, "hp": 0.03}, "대장장이가 두드려 만든 반지"],
	&"ring2b": ["에메랄드 반지", "ring", 2, {"crit": 0.03, "gold": 0.05}, "초록 보석이 행운을 부른다"],
	&"ring3b": ["금 반지", "ring", 3, {"crit": 0.06, "gold": 0.14}, "묵직한 순금 반지"],
	&"ring4b": ["별의 반지", "ring", 4, {"crit": 0.13, "gold": 0.12}, "떨어진 별 조각을 박은 반지"],
	# 신화(장비 소환에서만, 아주 드물게): 옷 3 · 반지 3
	&"armor5": ["혼돈의 갑주", "armor", 5, {"hp": 0.70, "atk": 0.12}, "검붉은 별빛이 흐르는 갑주"],
	&"armor5b": ["심연의 로브", "armor", 5, {"hp": 0.55, "atk": 0.20}, "심연의 어둠을 엮어 만든 로브"],
	&"armor5c": ["불멸의 갑옷", "armor", 5, {"hp": 0.85, "speed": 0.04}, "어떤 불꽃에도 녹지 않는 갑옷"],
	&"ring5": ["핏빛 군주의 반지", "ring", 5, {"crit": 0.18, "gold": 0.25}, "옛 군주가 피로 맹세한 반지"],
	&"ring5b": ["일식의 반지", "ring", 5, {"crit": 0.22, "atk": 0.06}, "해가 가려진 순간을 가둔 반지"],
	&"ring5c": ["불사조의 반지", "ring", 5, {"crit": 0.15, "hp": 0.12}, "꺼지지 않는 불사조의 불씨"],
}


## 장비마다 고유 그림: 아이콘 시트(8칸 × 4줄, 32px)의 칸 번호
const ICON_PATH := "res://assets/vendor/gear_icons/gear.png"
const ICON_INDEX := {&"armor1": 0, &"armor1b": 1, &"armor2": 2, &"armor2b": 3, &"armor3": 4, &"armor3b": 5, &"armor4": 6, &"armor4b": 7, &"boots1": 8, &"boots1b": 9, &"boots2": 10, &"boots2b": 11, &"boots3": 12, &"boots3b": 13, &"boots4": 14, &"boots4b": 15, &"neck1": 16, &"neck1b": 17, &"neck2": 18, &"neck2b": 19, &"neck3": 20, &"neck3b": 21, &"neck4": 22, &"neck4b": 23, &"ring1": 24, &"ring1b": 25, &"ring2": 26, &"ring2b": 27, &"ring3": 28, &"ring3b": 29, &"ring4": 30, &"ring4b": 31, &"armor5": 32, &"armor5b": 33, &"armor5c": 34, &"ring5": 35, &"ring5b": 36, &"ring5c": 37}
static var _icons: Texture2D


## 장비 그림(없으면 부위 기호)
static func draw_icon(ci: CanvasItem, id: StringName, c: Vector2, size: float, tint := Color.WHITE) -> void:
	if _icons == null and ResourceLoader.exists(ICON_PATH):
		_icons = load(ICON_PATH)
	var k: int = ICON_INDEX.get(base_of(id), -1)
	if _icons == null or k < 0:
		Gt.icon(ci, SLOT_ICONS[slot_of(id)], c, size, tint)
		return
	ci.draw_texture_rect_region(_icons, Rect2(c - Vector2(size, size) / 2.0, Vector2(size, size)), Rect2((k % 8) * 32, (k / 8) * 32, 32, 32), tint)


static func ids() -> Array[StringName]:
	var out: Array[StringName] = []
	for lv in LEVELS:
		for id: StringName in DATA:
			out.append(with_level(id, lv))
	return out


## 장비 레벨(이 레벨이 돼야 낀다)
static func level_of(id: StringName) -> int:
	var s := String(id)
	if s.contains("_l"):
		return int(s.get_slice("_l", 1))
	if s.contains("_t"):
		return {"2": 40, "3": 90}.get(s.get_slice("_t", 1), 1)
	return 1


## (예전 이름) 단계 = 레벨 칸 번호
static func tier_of(id: StringName) -> int:
	return maxi(0, LEVELS.find(level_of(id)))


static func base_of(id: StringName) -> StringName:
	return StringName(String(id).get_slice("_l", 0).get_slice("_t", 0))


static func with_level(id: StringName, lv: int) -> StringName:
	return base_of(id) if lv <= 1 else StringName("%s_l%d" % [base_of(id), lv])


static func has_id(id: StringName) -> bool:
	return DATA.has(base_of(id)) and (level_of(id) in LEVELS)


static func name_of(id: StringName) -> String:
	return DATA[base_of(id)][0]


static func slot_of(id: StringName) -> String:
	return DATA[base_of(id)][1]


static func grade_of(id: StringName) -> int:
	return DATA[base_of(id)][2]


static func color_of(id: StringName) -> Color:
	return GRADE_COLORS[grade_of(id)]


static func desc_of(id: StringName) -> String:
	return DATA[base_of(id)][4]


## 재련을 반영한 효과 {stat: 값}
static func stats_of(id: StringName, refine := 0, enh := 0) -> Dictionary:
	var out := {}
	var base: Dictionary = DATA[base_of(id)][3]
	var mult: float = 1.0 + (level_of(id) - 1) * LEVEL_MULT
	for k: String in base:
		out[k] = float(base[k]) * mult * (1.0 + 0.1 * refine) * (1.0 + ENH_BONUS * enh)
	return out


## 세트: 같은 등급·같은 계열(기본 / b) 옷·신발·목걸이·반지. 2개 · 4개를 끼면 효과(4개면 2개 효과도 함께)
const SETS := {
	"1": ["초보 모험가", {2: {"hp": 0.03}, 4: {"atk": 0.04}}],
	"1b": ["견습 대장장이", {2: {"speed": 0.03}, 4: {"crit": 0.02}}],
	"2": ["떠돌이 여행자", {2: {"hp": 0.05}, 4: {"gold": 0.10}}],
	"2b": ["숲지기", {2: {"crit": 0.02}, 4: {"atk": 0.06}}],
	"3": ["왕국 기사단", {2: {"hp": 0.08}, 4: {"atk": 0.10}}],
	"3b": ["강철 수호자", {2: {"hp": 0.10}, 4: {"crit": 0.04, "hp": 0.06}}],
	"4": ["별의 용사", {2: {"atk": 0.10}, 4: {"crit": 0.08, "speed": 0.05}}],
	"4b": ["용 사냥꾼", {2: {"atk": 0.12}, 4: {"hp": 0.20, "atk": 0.05}}],
}


## 장비가 속한 세트 키("3", "4b" …), 없으면 ""
static func set_of(id: StringName) -> String:
	var b := String(base_of(id))
	for slot in SLOTS:
		if b.begins_with(slot):
			var key := b.trim_prefix(slot)
			return key if SETS.has(key) else ""
	return ""


static func set_name(key: String) -> String:
	return SETS[key][0] if SETS.has(key) else ""


## 낀 장비 목록 → 세트마다 낀 개수
static func set_counts(worn: Array) -> Dictionary:
	var out := {}
	for g in worn:
		var k := set_of(StringName(str(g)))
		if k != "":
			out[k] = int(out.get(k, 0)) + 1
	return out


## 낀 장비들의 세트 효과 합
static func set_bonus(worn: Array, stat: String) -> float:
	var total := 0.0
	var counts := set_counts(worn)
	for k: String in counts:
		for need: int in SETS[k][1]:
			if counts[k] >= need:
				total += float(SETS[k][1][need].get(stat, 0.0))
	return total


## "2세트: 체력 +5% / 4세트: 골드 획득 +10%"
static func set_text(key: String, need: int) -> String:
	var parts: Array[String] = []
	var st: Dictionary = SETS[key][1][need]
	for k: String in st:
		parts.append("%s +%s%%" % [STAT_NAMES[k], String.num(float(st[k]) * 100.0, 1).trim_suffix(".0")])
	return " · ".join(parts)


## 보이는 별 수: 등급과 같고, 신화만 ★6(무기 ★6과 같은 빨간 별)
static func stars_of(id: StringName) -> int:
	var g := grade_of(id)
	return 6 if g >= 5 else g


static func stats_text(id: StringName, refine := 0, enh := 0) -> String:
	var parts: Array[String] = []
	var st := stats_of(id, refine, enh)
	for k: String in st:
		parts.append("%s +%s%%" % [STAT_NAMES[k], String.num(float(st[k]) * 100.0, 1).trim_suffix(".0")])
	return " · ".join(parts)


## 떨어뜨릴 장비 하나를 고른다(등급 가중치 → 그 등급 중 아무거나)
static func roll(boss := false, level := -1) -> StringName:
	var w := BOSS_WEIGHTS if boss else MOB_WEIGHTS
	var total := 0.0
	for x in w:
		total += x
	var r := randf() * total
	var grade := 1
	for g in range(1, w.size()):
		r -= w[g]
		if r <= 0.0:
			grade = g
			break
	var pool: Array[StringName] = []
	for id: StringName in DATA:
		if grade_of(id) == grade:
			pool.append(id)
	return with_level(pool[randi() % pool.size()], level_for(level))


## 용사 레벨에 맞는 장비 레벨(10 단위로 내림, 가끔 한 단계 아래)
static func level_for(level: int) -> int:
	if level < 10:
		return 1
	var l := mini(int(level / 10) * 10, 150)
	if randf() < 0.3:
		l -= 10
	return maxi(l, 1)


## 골드 강화 비용(다음 +1): 등급·장비 레벨·지금 강화가 높을수록 비싸다
static func enh_cost(id: StringName, enh: int) -> int:
	return roundi(200.0 * grade_of(id) * pow(enh + 1, 1.7) * (1.0 + level_of(id) / 50.0))


## 장비 카드: 무기 카드와 같은 모양(등급색 상자 + 어두운 바탕 + 큰 그림 + 금별 + 이름 + 강화 +N) + 등급 테두리
static func draw_card(ci: CanvasItem, id: StringName, r: Rect2, show_name := true, refine := -1, dim := false) -> void:
	var gc := color_of(id)
	Gt.pbox(ci, r, gc if not dim else gc.darkened(0.5), Gt.INK, 2, true, true)
	var inner := r.grow(-Gt.PX * 2.0)
	Gt.grad(ci, inner, Color("2e2648"), gc.darkened(0.35))
	var c := inner.get_center() + Vector2(0, -inner.size.y * 0.1)
	ci.draw_circle(c, inner.size.x * 0.36, Color(gc.lightened(0.3), 0.3))
	draw_icon(ci, id, c, minf(inner.size.x, inner.size.y) * 0.78, Color(1, 1, 1, 0.45) if dim else Color.WHITE)
	var fade_h := inner.size.y * 0.3
	Gt.grad(ci, Rect2(inner.position.x, inner.end.y - fade_h, inner.size.x, fade_h), Color(Gt.INK, 0.0), Color(Gt.INK, 0.8))
	var n := stars_of(id)
	var sr := clampf(inner.size.x / 15.0, 4.0, 8.0)
	for i in n:
		Gt.star(ci, Vector2(inner.get_center().x + (i - (n - 1) / 2.0) * sr * 2.15, inner.end.y - sr - 4), sr, Gt.item_star(n))  # 별 색 = 별 개수(모든 아이템 같게)
	if show_name:
		Gt.title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), name_of(id), int(clampf(inner.size.x / 7.0, 10, 18)), Color.WHITE, 1)
	if refine > 0:
		var tag := Rect2(inner.position + Vector2(2, 2), Vector2(Gt.width("+%d" % refine, 12) + 14, 18))
		Gt.tag(ci, tag, Gt.BLUE)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 13), "+%d" % refine, 12, Color.WHITE, 1)
	if level_of(id) > 1:  # 장비 레벨
		Gt.text(ci, Vector2(inner.end.x - 4, inner.position.y + 14), "Lv.%d" % level_of(id), 11, Color("ffe9a8"), 2, true, 3, Gt.INK)
	Gt.tier_frame(ci, r, grade_of(id) - 1, id.hash() % 7)
