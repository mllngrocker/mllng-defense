class_name SkillTree
extends RefCounted
## 캐릭터별 스킬 트리: 액티브 6개(a1 고유기 → a2 → a3 오의, 그 상위 기술 a4·a5·a6) + 패시브 4개(p1 공격 → p4 스킬 숙련, p2 체력, p3 급소).
## 전투엔 액티브 중 3개를 골라 칸에 끼운다(Save.skill_slots). 상위 기술은 Lv.90·110·130 + 아래 기술 Lv.15에 열린다.
## 스킬 레벨 합 = 캐릭터 레벨(고유기 Lv.1은 처음부터). 상한은 모두 15라서 Lv.150이면 15×10 = 150으로 딱 꽉 찬다.
## 스킬 창의 "한번에 찍기"로 한꺼번에 배분.
## 메이플처럼 단계가 있다: 2번째 액티브는 캐릭터 Lv.30 + 고유기 Lv.10 + 패시브 합 20,
## 오의(3번째)는 Lv.70 + 2번째 Lv.10 + 패시브 합 30이어야 배운다(GATE).
## 액티브 동작은 SkillCaster의 10가지 중에서 고른다(behavior). 그림은 assets/vendor/skill_icons/<icon>.png(없으면 속성 기호).

const MAX_LV := 15  # 패시브 상한
const ACTIVE_MAX := 15  # 액티브 상한
const MASTER_LV := 15
const TRAINING_GEMS := 150  # 트레이닝 북 1권 값(보석)
const MASTER_GEMS := 800  # 마스터 북 1권 값(보석)
const ICON_DIR := "res://assets/vendor/skill_icons/%s.png"

## 노드 순서(그리는 자리): [id, 칸(열, 줄), 앞선 노드, 앞선 노드에 필요한 레벨]
const LAYOUT := [
	["a1", Vector2i(0, 0), "", 0],
	["a2", Vector2i(1, 0), "a1", 10],
	["a3", Vector2i(2, 0), "a2", 10],
	["a4", Vector2i(0, 1), "a1", 15],
	["a5", Vector2i(1, 1), "a2", 15],
	["a6", Vector2i(2, 1), "a3", 15],
	["p1", Vector2i(0, 2), "", 0],
	["p4", Vector2i(1, 2), "p1", 5],
	["p2", Vector2i(0, 3), "", 0],
	["p3", Vector2i(1, 3), "", 0],
]

## 액티브 단계 조건: 노드 → [캐릭터 레벨, 패시브 레벨 합]
const GATE := {"a2": [30, 20], "a3": [70, 30], "a4": [90, 0], "a5": [110, 0], "a6": [130, 0]}
## 상위 기술 → 바탕 기술
const UPGRADE_OF := {"a4": "a1", "a5": "a2", "a6": "a3"}
const UP_POWER := 1.6  # 상위 기술 피해 배율(잔향이 한 번 더 몰아친다)
const UP_CD := 1.15  # 상위 기술 재사용 배율

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
	&"elf1": [["잎새 칼날", "잎사귀 칼날 5개를 앞으로 두 번 날려 꿰뚫는다", &"leaf_blades", 9.0, "a_wind"], ["숲의 회오리", "큰 회오리가 앞으로 천천히 나아가며 닿는 적을 계속 벤다", &"forest_cyclone", 16.0, "a_petal"]],
	&"elf2": [["빛의 깃털", "빛나는 깃털 10개가 사방으로 퍼져 꿰뚫는다", &"light_feathers", 9.0, "a_light"], ["별빛 낙하", "큰 별빛 기둥이 세 번 떨어지고 체력을 10% 회복한다", &"star_fall", 16.0, "a_star"]],
	&"devil4": [["표창 부채", "쿠나이 7개를 부채꼴로 던져 꿰뚫는다", &"kunai_fan", 9.0, "a_wind"], ["그림자 연쇄", "적 6명에게 차례로 순간이동하며 벤다", &"shadow_chain", 16.0, "a_thunder"]],
	&"devil1": [["얼음 길", "앞으로 얼음이 줄지어 솟고, 맞은 적은 1초 언다", &"ice_line", 9.0, "a_ice"], ["눈보라 망토", "3초 동안 몸 주위로 눈보라가 돌며 적을 베고 느리게 한다", &"blizzard_cloak", 16.0, "a_blizzard"]],
	&"elf3": [["화살비", "적들 위로 화살이 다섯 번 쏟아진다", &"arrow_rain", 9.0, "a_petal"], ["꿰뚫는 일제 사격", "꿰뚫는 큰 화살 5발을 세 번 쏜다", &"piercing_volley", 16.0, "a_quake"]],
	&"elf4": [["바람 가르기", "거대한 바람 칼날이 앞으로 날아가 꿰뚫는다", &"wind_wave", 9.0, "a_wind"], ["폭풍 낙인", "뛰어올라 내려찍으며 넓은 충격파와 번개 고리를 일으킨다", &"storm_brand", 16.0, "a_thunder"]],
	&"devil2": [["그림자 가속", "4초 동안 이동·공격 속도 +50%, 잔상을 남기며 달린다", &"haste", 11.0, "a_shadow"], ["천 개의 칼날", "적 8명 사이를 붉은 잔상으로 누빈 뒤 한가운데서 터진다", &"thousand_cuts", 16.0, "a_dark"]],
	&"devil3": [["용꼬리 휩쓸기", "꼬리로 두 바퀴 크게 휩쓸어 날려 보낸다", &"tail_sweep", 9.0, "a_fire"], ["해일", "넓은 물기둥 띠가 앞으로 밀려가며 휩쓴다", &"tidal_wave", 16.0, "a_blizzard"]],
	&"scarlet": [["매의 눈", "앞으로 돌진하며 한 번에 베어 낸다", &"kemo1", 9.0, "a_dash"], ["홍련 낙인", "하늘에서 불꽃 번개를 떨어뜨려 넓게 강타한다", &"maid1", 16.0, "a_fire"]],
	&"fairy1": [["꽃바람 회오리", "꽃바람을 몸에 두르고 돈다", &"fairy3", 9.0, "a_wind"], ["꽃샘 분수", "꽃향기 물기둥을 솟구치게 한다", &"fairy2", 16.0, "a_water"]],
}

## 상위 기술 이름: 캐릭터 → [a4(고유기 상위), a5(2번째 상위), a6(오의 상위)]
const UP_NAMES := {
	&"kemo1": ["뇌광 질풍참", "폭풍 회오리", "만뢰 낙인"],
	&"kemo2": ["빙하 폭우", "빙하 성채", "백야 눈보라"],
	&"kemo3": ["홍련 대폭발", "작열 연격", "화산 대균열"],
	&"fairy3": ["푸른 숲 회오리", "만개 꽃잎 폭풍", "생명의 대분수"],
	&"fairy2": ["해신의 물기둥", "폭우", "대해일 낙뢰"],
	&"maid2": ["업화 난무", "태양 폭염", "불사조 돌진"],
	&"maid3": ["대지 붕괴", "운석 폭발", "대지진 강습"],
	&"maid1": ["신벌의 빛", "천사의 깃털", "유성우"],
	&"maid4": ["심연 습격", "칠흑 일섬", "심연 균열"],
	&"elf1": ["폭풍 난무", "세계수 칼날", "대삼림 회오리"],
	&"elf2": ["성광의 폭우", "대천사의 깃털", "은하 낙하"],
	&"devil4": ["검은 깃털 폭풍", "천본 표창", "그림자 천연쇄"],
	&"devil1": ["절대 영도 균열", "빙하 대로", "극한 눈보라 망토"],
	&"elf3": ["가시 숲 솟음", "화살 폭우", "관통 천궁"],
	&"elf4": ["폭풍 돌격", "하늘 가르기", "천공 폭풍 낙인"],
	&"devil2": ["칠흑의 대날개", "신속", "만 개의 칼날"],
	&"devil3": ["심연의 폭우", "용왕 꼬리", "대해일"],
	&"scarlet": ["진홍 방울 난무", "매의 일격", "홍련 대낙인"],
	&"fairy1": ["꽃잎 대폭풍", "꽃바람 태풍", "꽃샘 대분수"],
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
		"a4", "a5", "a6":
			var base := info(char_id, UPGRADE_OF[node])
			var nm: Array = UP_NAMES.get(char_id, ["진 " + str(base["name"]), "", ""])
			var name: String = nm[["a4", "a5", "a6"].find(node)]
			if name == "":
				name = "진 " + str(base["name"])
			return {"name": name, "desc": "「%s」의 상위 기술 · 피해 ×%.1f, 잔향이 한 번 더 몰아친다" % [base["name"], UP_POWER], "behavior": base["behavior"], "cd": float(base["cd"]) * UP_CD, "icon": str(base["icon"]) + "_up", "active": true, "upgrade": true}  # 그림은 바탕 그림의 색을 바꾼 것(_up)
		_:
			var p: Array = PASSIVES[node]
			return {"name": p[0], "desc": p[1] % (int(p[2])), "per": p[2], "icon": p[3], "active": false}


## 패시브 4개 레벨 합
static func passive_sum(char_id: StringName) -> int:
	var n := 0
	for p: String in PASSIVES:
		n += Save.skill_level(char_id, p)
	return n


## 이 노드를 아직 못 배우는 이유(배울 수 있으면 ""): 캐릭터 레벨 → 앞선 스킬 레벨 → 패시브 합
static func gate(char_id: StringName, node: String) -> String:
	if GATE.has(node):
		var g: Array = GATE[node]
		if Save.level_of(char_id) < int(g[0]):
			return "캐릭터 Lv.%d부터 배울 수 있어요" % g[0]
	var req := requires(node)
	if req[0] != "" and Save.skill_level(char_id, req[0]) < int(req[1]):
		return "%s Lv.%d 필요" % [info(char_id, req[0])["name"], req[1]]
	if GATE.has(node) and passive_sum(char_id) < int(GATE[node][1]):
		return "패시브 합 %d 필요 (지금 %d)" % [GATE[node][1], passive_sum(char_id)]
	return ""


static func requires(node: String) -> Array:
	for row: Array in LAYOUT:
		if row[0] == node:
			return [row[2], row[3]]
	return ["", 0]


## 노드별 상한
static func cap(node: String) -> int:
	return ACTIVE_MAX if node.begins_with("a") else MAX_LV


## 스킬 피해 배율: 레벨마다 +12%, 스킬 숙련 +4%씩, 오의는 1.6배, 상위 기술은 ×1.6
static func power(char_id: StringName, node: String) -> float:
	var lv := maxi(1, Save.skill_level(char_id, node))
	var p := (1.0 + 0.12 * (lv - 1)) * (1.0 + 0.04 * Save.skill_level(char_id, "p4"))
	return p * (1.6 if node in ["a3", "a6"] else 1.0) * (UP_POWER if UPGRADE_OF.has(node) else 1.0)


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
	if UPGRADE_OF.has(node):  # 상위 기술 표시: 금빛 테두리 + 별
		ci.draw_rect(r.grow(-1), Color(1, 0.82, 0.3, 0.9 if not dim else 0.4), false, 3.0)
		Gt.star(ci, r.position + Vector2(r.size.x - 9, 9), 8.0, Color("ffd54f"))
