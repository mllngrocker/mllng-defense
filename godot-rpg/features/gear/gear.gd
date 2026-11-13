class_name Gear
extends RefCounted
## 장비(옷·신발·목걸이·반지) 16종: 부위마다 4등급 — ★1 일반(초록) · ★2 희귀(파랑) · ★3 영웅(주황) · ★4 전설(빨강).
## 몬스터가 가끔 떨어뜨리고(ItemPickup), 보스는 잡을 때마다 희귀 이상을 하나 준다.
## 같은 장비를 또 얻으면 재련 +1(최대 +5, 효과 +10%씩), 다 차면 골드로. 캐릭터마다 부위별로 하나씩 낀다(Save.gear_equip).
## 효과: hp·atk·speed·gold는 비율(0.1 = +10%), crit은 확률을 그대로 더한다.

const SLOTS: Array[String] = ["armor", "boots", "neck", "ring"]
const SLOT_NAMES := {"armor": "옷", "boots": "신발", "neck": "목걸이", "ring": "반지"}
const SLOT_ICONS := {"armor": &"slot_armor", "boots": &"slot_boot", "neck": &"slot_amulet", "ring": &"slot_ring"}
const GRADE_NAMES: Array[String] = ["", "일반", "희귀", "영웅", "전설"]
const GRADE_COLORS: Array[Color] = [Color.WHITE, Color("5fc46a"), Color("4a9cf0"), Color("ff9a2e"), Color("f0464a")]
const STAT_NAMES := {"hp": "체력", "atk": "공격력", "crit": "치명타", "speed": "이동 속도", "gold": "골드 획득"}
const MAX_REFINE := 5
const MAXED_GOLD: Array[int] = [0, 300, 1500, 8000, 40000]  # 재련이 다 찬 장비를 또 얻으면 주는 골드
## 분해: 등급별 강화석(재련 1마다 한 개 더 분해한 셈) · 강화: 강화석으로 재련 +1(다음 재련 수만큼 비싸진다)
const STONES_FROM: Array[int] = [0, 2, 6, 20, 60]
const UPGRADE_COST: Array[int] = [0, 5, 12, 30, 80]
## 합성: 같은 등급 장비 3개(재련 +1도 한 개로 센다) → 한 등급 위 장비 하나
const SYNTH_NEED := 3
## 몬스터가 떨어뜨릴 확률, 등급 가중치(일반 몬스터 / 보스)
const DROP_CHANCE := 0.02
const MOB_WEIGHTS: Array[float] = [0.0, 60.0, 28.0, 10.0, 2.0]
const BOSS_WEIGHTS: Array[float] = [0.0, 0.0, 50.0, 38.0, 12.0]
## 레벨 단계: 같은 장비의 더 센 판(id 뒤에 "_t2"·"_t3"). 용사 레벨이 되면 그 단계가 떨어진다
## [이름 앞말, 필요 레벨, 효과 배율]
const TIERS: Array[Array] = [["", 1, 1.0], ["정예 ", 40, 2.0], ["고대 ", 90, 3.5]]

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
}


static func ids() -> Array[StringName]:
	var out: Array[StringName] = []
	for t in TIERS.size():
		for id: StringName in DATA:
			out.append(with_tier(id, t))
	return out


## 단계(0 기본 · 1 정예 · 2 고대)
static func tier_of(id: StringName) -> int:
	var s := String(id)
	return int(s.substr(s.length() - 1)) - 1 if s.contains("_t") else 0


static func base_of(id: StringName) -> StringName:
	return StringName(String(id).get_slice("_t", 0))


static func with_tier(id: StringName, t: int) -> StringName:
	return base_of(id) if t <= 0 else StringName("%s_t%d" % [base_of(id), t + 1])


static func has_id(id: StringName) -> bool:
	return DATA.has(base_of(id)) and tier_of(id) < TIERS.size()


static func name_of(id: StringName) -> String:
	return TIERS[tier_of(id)][0] + DATA[base_of(id)][0]


static func slot_of(id: StringName) -> String:
	return DATA[base_of(id)][1]


static func grade_of(id: StringName) -> int:
	return DATA[base_of(id)][2]


static func color_of(id: StringName) -> Color:
	return GRADE_COLORS[grade_of(id)]


static func desc_of(id: StringName) -> String:
	return DATA[base_of(id)][4]


## 재련을 반영한 효과 {stat: 값}
static func stats_of(id: StringName, refine := 0) -> Dictionary:
	var out := {}
	var base: Dictionary = DATA[base_of(id)][3]
	var mult: float = TIERS[tier_of(id)][2]
	for k: String in base:
		out[k] = float(base[k]) * mult * (1.0 + 0.1 * refine)
	return out


static func stats_text(id: StringName, refine := 0) -> String:
	var parts: Array[String] = []
	var st := stats_of(id, refine)
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
	return with_tier(pool[randi() % pool.size()], tier_for(level))


## 용사 레벨에 맞는 단계(가끔 한 단계 아래가 나온다)
static func tier_for(level: int) -> int:
	if level < 0:
		return 0
	var t := 0
	for i in TIERS.size():
		if level >= int(TIERS[i][1]):
			t = i
	if t > 0 and randf() < 0.3:
		t -= 1
	return t


## 장비 카드: 등급색 테두리 + 어두운 바탕 + 부위 그림 + 별 + (이름) + (재련 +N)
static func draw_card(ci: CanvasItem, id: StringName, r: Rect2, show_name := true, refine := -1, dim := false) -> void:
	var gc := color_of(id)
	Gt.pbox(ci, r, gc if not dim else gc.darkened(0.5), Gt.INK, 2, true, true)
	var inner := r.grow(-Gt.PX * 2.0)
	Gt.grad(ci, inner, Color("2e2648"), gc.darkened(0.4))
	var c := inner.get_center() + Vector2(0, -inner.size.y * 0.1)
	ci.draw_circle(c, inner.size.x * 0.34, Color(gc.lightened(0.3), 0.3))
	Gt.icon(ci, SLOT_ICONS[slot_of(id)], c, minf(inner.size.x, inner.size.y) * 0.7, Color(1, 1, 1, 0.45) if dim else Color.WHITE)
	var n := grade_of(id)
	var sr := clampf(inner.size.x / 15.0, 4.0, 8.0)
	for i in n:
		Gt.star(ci, Vector2(inner.get_center().x + (i - (n - 1) / 2.0) * sr * 2.15, inner.end.y - sr - 4), sr, gc.lightened(0.35))
	if show_name:
		Gt.title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), name_of(id), int(clampf(inner.size.x / 7.0, 10, 18)), Color.WHITE, 1)
	if refine > 0:
		Gt.title(ci, inner.position + Vector2(6, 18), "+%d" % refine, 13, Color("ffe36b"))
	if tier_of(id) > 0:  # 단계 표시(Ⅱ·Ⅲ)
		Gt.title(ci, Vector2(inner.end.x - 12, inner.position.y + 18), ["", "Ⅱ", "Ⅲ"][tier_of(id)], 13, Color("ffd0ff"))
