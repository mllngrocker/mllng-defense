class_name SkillTree
extends RefCounted
## 캐릭터별 스킬 트리: 액티브 3개(a1 고유기 → a2 → a3 오의) + 패시브 4개(p1 공격 → p4 스킬 숙련, p2 체력, p3 급소).
## 스킬 포인트: 레벨 1마다 1점 + 트레이닝 북 1권마다 1점. 레벨 상한은 5, 마스터 북으로 봉인을 풀면 10이고 오의(a3)가 열린다.
## 액티브 동작은 SkillCaster의 10가지 중에서 고른다(behavior). 그림은 assets/vendor/skill_icons/<icon>.png(없으면 속성 기호).

const MAX_LV := 5
const MASTER_LV := 10
const TRAINING_GEMS := 150  # 트레이닝 북 1권 값(보석)
const MASTER_GEMS := 800  # 마스터 북 1권 값(보석)
const ICON_DIR := "res://assets/vendor/skill_icons/%s.png"

## 노드 순서(그리는 자리): [id, 칸(열, 줄), 앞선 노드, 앞선 노드에 필요한 레벨]
const LAYOUT := [
	["a1", Vector2i(0, 0), "", 0],
	["a2", Vector2i(1, 0), "a1", 3],
	["a3", Vector2i(2, 0), "a2", 3],
	["p1", Vector2i(0, 1), "", 0],
	["p4", Vector2i(1, 1), "p1", 5],
	["p2", Vector2i(0, 2), "", 0],
	["p3", Vector2i(1, 2), "", 0],
]

## 패시브는 모두 같다: id → [이름, 설명(%d = 레벨당 수치), 레벨당 값, 그림]
const PASSIVES := {
	"p1": ["공격 수련", "공격력 +%d%%", 2, "p_atk"],
	"p2": ["체력 단련", "체력 +%d%%", 3, "p_hp"],
	"p3": ["급소 노리기", "치명타 확률 +%d%%", 1, "p_crit"],
	"p4": ["스킬 숙련", "스킬 피해 +%d%%", 4, "p_skill"],
}

## 캐릭터 → a2, a3: [이름, 설명, 동작, 재사용(초), 그림]
const ACTIVES := {
	&"kemo1": [["회오리 베기", "몸 주위로 바람 칼날을 돌려 가까운 적을 계속 벤다", &"fairy3", 9.0, "a_wind"], ["천둥 낙인", "하늘에서 번개를 떨어뜨려 넓은 범위를 강타한다", &"maid1", 16.0, "a_thunder"]],
	&"kemo2": [["얼음 기둥", "적 발밑에서 얼음 기둥을 솟구치게 한다", &"fairy2", 9.0, "a_ice"], ["눈보라 습격", "눈보라처럼 적 사이를 누비며 연속으로 벤다", &"maid4", 16.0, "a_blizzard"]],
	&"kemo3": [["화염 연격", "불꽃을 두른 주먹으로 연속 공격한다", &"maid2", 9.0, "a_fire"], ["용암 균열", "땅을 갈라 용암을 뿜어낸다", &"maid3", 16.0, "a_lava"]],
	&"fairy3": [["꽃잎 폭풍", "꽃잎 폭풍으로 주위 적을 휩쓴다", &"fairy1", 9.0, "a_petal"], ["생명의 샘", "땅에서 물기둥을 솟구쳐 적을 띄운다", &"fairy2", 16.0, "a_water"]],
	&"fairy2": [["물방울 비", "물방울을 비처럼 떨어뜨린다", &"kemo2", 9.0, "a_rain"], ["해일 낙뢰", "해일과 함께 번개를 내리친다", &"maid1", 16.0, "a_thunder"]],
	&"maid2": [["폭염", "주위를 불길로 터뜨린다", &"kemo3", 9.0, "a_fire"], ["불꽃 돌진", "불꽃이 되어 앞으로 돌진한다", &"kemo1", 16.0, "a_dash"]],
	&"maid3": [["바위 폭발", "주위의 바위를 터뜨린다", &"kemo3", 9.0, "a_rock"], ["지진 강습", "땅을 울리며 적 사이를 강습한다", &"maid4", 16.0, "a_quake"]],
	&"maid1": [["빛의 깃털", "빛나는 깃털을 흩날려 적을 벤다", &"fairy1", 9.0, "a_light"], ["별빛 낙하", "별빛을 비처럼 쏟아붓는다", &"kemo2", 16.0, "a_star"]],
	&"maid4": [["그림자 일섬", "그림자처럼 앞으로 베고 지나간다", &"kemo1", 9.0, "a_shadow"], ["어둠 균열", "땅을 갈라 어둠을 뿜어낸다", &"maid3", 16.0, "a_dark"]],
	&"scarlet": [["매의 눈", "앞으로 돌진하며 한 번에 베어 낸다", &"kemo1", 9.0, "a_dash"], ["홍련 낙인", "하늘에서 불꽃 번개를 떨어뜨려 넓게 강타한다", &"maid1", 16.0, "a_fire"]],
	&"fairy1": [["꽃바람 회오리", "꽃바람을 몸에 두르고 돈다", &"fairy3", 9.0, "a_wind"], ["꽃샘 분수", "꽃향기 물기둥을 솟구치게 한다", &"fairy2", 16.0, "a_water"]],
}

static var _icons: Dictionary = {}


static func info(char_id: StringName, node: String) -> Dictionary:
	var d := Save.character(char_id)
	match node:
		"a1":
			return {"name": d.skill_name, "desc": d.skill_desc, "behavior": char_id, "cd": d.skill_cooldown, "icon": "a1_" + String(char_id), "active": true}
		"a2", "a3":
			var a: Array = ACTIVES.get(char_id, ACTIVES[&"kemo1"])[0 if node == "a2" else 1]
			return {"name": a[0], "desc": a[1], "behavior": a[2], "cd": a[3], "icon": a[4], "active": true}
		_:
			var p: Array = PASSIVES[node]
			return {"name": p[0], "desc": p[1] % (int(p[2])), "per": p[2], "icon": p[3], "active": false}


static func requires(node: String) -> Array:
	for row: Array in LAYOUT:
		if row[0] == node:
			return [row[2], row[3]]
	return ["", 0]


## 스킬 피해 배율: 레벨마다 +12%, 스킬 숙련 +4%씩, 오의는 1.6배
static func power(char_id: StringName, node: String) -> float:
	var lv := maxi(1, Save.skill_level(char_id, node))
	var p := (1.0 + 0.12 * (lv - 1)) * (1.0 + 0.04 * Save.skill_level(char_id, "p4"))
	return p * (1.6 if node == "a3" else 1.0)


## 재사용 대기: 레벨마다 3% 짧아진다
static func cooldown(char_id: StringName, node: String) -> float:
	var lv := maxi(1, Save.skill_level(char_id, node))
	return float(info(char_id, node)["cd"]) * (1.0 - 0.03 * (lv - 1))


static func icon(name: String) -> Texture2D:
	if not _icons.has(name):
		var path := ICON_DIR % name
		_icons[name] = load(path) if ResourceLoader.exists(path) else null
	return _icons[name]


## 칸 안에 스킬 그림(없으면 속성 기호)
static func draw_icon(ci: CanvasItem, char_id: StringName, node: String, r: Rect2, dim := false) -> void:
	var tex := icon(info(char_id, node)["icon"])
	if tex:
		ci.draw_texture_rect(tex, r, false, Color(0.45, 0.45, 0.5) if dim else Color.WHITE)
	else:
		var d := Save.character(char_id)
		ci.draw_rect(r, Gt.element_color(d.element).darkened(0.3 if not dim else 0.6))
		Gt.element_glyph(ci, r.get_center(), r.size.x * 0.8, d.element, Color.WHITE, Gt.INK)
