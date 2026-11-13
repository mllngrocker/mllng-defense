class_name Weapons
extends RefCounted
## 무기 42종(Ravenmore 손그림 아이콘 + LimeZu·Willibab 도트 아이콘, assets/vendor/ravenmore — 재배포 금지라 git 제외): 이름·등급·공격력·치명타 확률.
## 같은 무기를 또 뽑으면 재련 +1(최대 5), 재련마다 공격력 +25%. 재련이 다 차면 골드로 바꿔 준다.
## 캐릭터 한 명에 무기 하나를 장착한다(Save.equip).

const MAX_REFINE := 5
const REFINE_BONUS := 0.25
const STARTER := &"sword"
const TEX_DIR := "res://assets/vendor/ravenmore/weapons/%s.png"

## id → [이름, 등급, 공격력, 치명타 확률(+), 한 줄 설명]
const DATA: Dictionary[StringName, Array] = {
	&"holy_sword": ["별빛 성검", 5, 24, 0.08, "별의 힘이 깃든 전설의 검"],
	&"flame_fang": ["홍염의 송곳니", 5, 22, 0.12, "붉은 수정으로 벼려 낸 칼날"],
	&"fairy_wand": ["요정의 지팡이", 5, 26, 0.04, "꽃의 요정이 축복한 지팡이"],
	&"dragon_axe": ["용살자 도끼", 5, 30, 0.02, "용의 비늘도 쪼개는 쌍날 도끼"],
	&"knight_sword": ["기사단장의 대검", 4, 14, 0.04, "왕국 기사단장이 쓰던 검"],
	&"longbow": ["바람의 장궁", 4, 13, 0.05, "바람을 타고 멀리 날아간다"],
	&"thunder_spear": ["번개 창", 4, 14, 0.03, "끝에서 작은 번개가 튄다"],
	&"tome": ["고대 마도서", 4, 15, 0.02, "잊힌 주문이 적힌 책"],
	&"fire_dagger": ["불꽃 비수", 4, 11, 0.10, "베는 순간 불꽃이 튄다"],
	&"war_hammer": ["대지의 망치", 4, 16, 0.0, "땅을 울리는 무거운 망치"],
	&"sword": ["견습 기사의 검", 3, 5, 0.02, "누구나 처음 쥐는 검"],
	&"axe": ["나무꾼 도끼", 3, 7, 0.0, "장작 패기에 딱 좋다"],
	&"bow": ["사냥꾼의 활", 3, 5, 0.03, "숲속 사냥꾼의 손때 묻은 활"],
	&"spear": ["병사의 창", 3, 6, 0.01, "마을 경비병의 창"],
	&"club": ["튼튼한 몽둥이", 3, 6, 0.0, "단단한 참나무 몽둥이"],
	&"wood_sword": ["연습용 목검", 3, 4, 0.02, "수련장에서 쓰는 나무 검"],
	&"dagger": ["강철 단검", 3, 5, 0.04, "가볍고 손에 잘 맞는다"],
	&"sickle": ["농부의 낫", 3, 5, 0.02, "밭일하다 들고 나왔다"],
	&"mace": ["가시 철퇴", 3, 6, 0.01, "둔탁하지만 확실하다"],
	&"wand": ["견습 마법봉", 3, 4, 0.03, "마법 학교 입학 선물"],
	# 2차 추가(LimeZu RPG Arsenal · Willibab 도트 아이콘)
	&"bronze_sword": ["청동 검", 3, 5, 0.02, "대장간 첫 작품인 단단한 청동 검"],
	&"hand_axe": ["손도끼", 3, 7, 0.0, "한 손에 쏙 들어오는 작은 도끼"],
	&"harpoon": ["어부의 작살", 3, 6, 0.01, "푸른 해변 어부가 쓰던 작살"],
	&"slingshot": ["나무 새총", 3, 5, 0.03, "돌멩이도 아프게 날아간다"],
	&"amber_staff": ["호박 지팡이", 3, 4, 0.03, "끝에 호박 구슬이 달린 지팡이"],
	&"red_fan": ["붉은 부채", 3, 5, 0.04, "휘두르면 매운 바람이 인다"],
	&"iron_hammer": ["쇠망치", 3, 7, 0.0, "대장장이의 손때 묻은 망치"],
	&"sapphire_blade": ["사파이어 검", 4, 14, 0.05, "푸른 보석을 박은 기사의 검"],
	&"jade_blade": ["비취 검", 4, 14, 0.05, "숲의 기운이 깃든 초록 보석 검"],
	&"frost_feather": ["서리 깃 칼날", 4, 13, 0.08, "얼음새의 깃털처럼 가볍고 차갑다"],
	&"ruby_staff": ["루비 지팡이", 4, 15, 0.02, "불꽃 주문이 잘 듣는 붉은 지팡이"],
	&"gold_axes": ["황금 쌍도끼", 4, 16, 0.01, "양날 모두 황금으로 벼린 도끼"],
	&"frost_trident": ["서리 작살", 4, 14, 0.03, "찌른 자리에 서리가 낀다"],
	&"violet_fan": ["보랏빛 부채", 4, 13, 0.06, "밤바람을 부르는 마법 부채"],
	&"gold_spear": ["황금 장식창", 4, 14, 0.04, "왕궁 근위병의 화려한 창"],
	&"crystal_flail": ["수정 철퇴", 4, 15, 0.02, "수정 가시가 박힌 철퇴"],
	&"gold_cross": ["황금 십자검", 5, 24, 0.1, "성기사단의 보물로 전해지는 검"],
	&"phoenix_blade": ["불사조 깃 대검", 5, 25, 0.12, "불사조의 깃털로 벼려 꺼지지 않는 불꽃"],
	&"sun_scepter": ["태양의 홀", 5, 26, 0.05, "한낮의 햇빛을 담아 둔 홀"],
	&"platinum_axe": ["백금 전부", 5, 30, 0.03, "거인도 한 번에 쓰러뜨리는 큰 도끼"],
	&"holy_lance": ["성창", 5, 26, 0.08, "빛의 신전에 꽂혀 있던 창"],
	&"jade_glaive": ["비취 대창", 5, 27, 0.07, "용의 비늘을 닮은 초록 날 대창"],
	# ★6 신화(무기 소환에서 ★5가 나왔을 때 그중 5% — 전체 약 0.05%)
	&"chaos_sword": ["혼돈의 마검", 6, 44, 0.16, "별을 삼킨 혼돈이 깃든 검붉은 마검"],
	&"blood_fang": ["핏빛 송곳니", 6, 38, 0.24, "베인 자리에 핏빛 꽃이 피는 단검"],
	&"doom_axe": ["종말의 도끼", 6, 52, 0.08, "한 번 휘두르면 땅이 갈라진다"],
	&"crimson_lance": ["진홍의 신창", 6, 46, 0.14, "하늘을 꿰뚫었다는 붉은 신의 창"],
	&"eclipse_bow": ["일식의 활", 6, 42, 0.18, "해를 가린 어둠으로 시위를 당긴다"],
	&"abyss_staff": ["심연의 홀", 6, 46, 0.10, "심연의 별빛을 부르는 지팡이"],
	# 보스를 처음 잡으면 받는 무기(뽑기에서는 안 나온다): [.., true]
	&"slime_scepter": ["슬라임 왕의 홀", 5, 20, 0.04, "말랑하지만 묵직한 왕의 홀", true],
	&"crystal_fang": ["수정 송곳니", 5, 26, 0.15, "거미 여왕의 수정 송곳니로 만든 단검", true],
	&"cyclops_maul": ["거인의 가시 몽둥이", 5, 34, 0.04, "외눈 거인 왕이 휘두르던 몽둥이", true],
	&"glacier_blade": ["빙하의 대검", 5, 52, 0.06, "녹지 않는 얼음으로 벼린 대검", true],
	&"sea_trident": ["해신의 삼지창", 5, 78, 0.08, "깊은 바다의 힘이 깃든 삼지창", true],
	&"ignis_spear": ["이그니스의 화염창", 5, 230, 0.10, "화염룡의 숨결이 타오르는 창", true],
	&"demon_sword": ["마왕의 검", 5, 300, 0.15, "마왕 아자젤을 쓰러뜨린 자의 증표", true],
	&"giant_heart": ["거인의 심장창", 5, 520, 0.18, "고대 거인이 남긴 빛나는 창", true],
	&"storm_bow": ["폭풍새의 깃활", 5, 400, 0.20, "폭풍새 왕의 금빛 깃털로 엮은 활", true],
	&"root_lance": ["생명 뿌리창", 5, 460, 0.18, "벌레왕에게서 되찾은 큰 나무의 뿌리로 깎은 창", true],
	&"gardener_scythe": ["검은 정원사의 낫", 5, 160, 0.22, "검은 씨앗을 거두던 낫. 이제는 생명을 지킨다", true],
	&"mist_blade": ["안개를 가르는 검", 5, 112, 0.24, "사도의 가면이 깨지며 남은 푸른 검", true],
}
## 무기 종류: 공격 느낌이 달라진다. [이름, 효과 설명, {배율}]
## speed 공격 속도 · dmg 평타 피해 · area 칼 판정 크기 · range 발사체 거리 · knock 밀쳐내기 · skill 스킬 피해
const KINDS := {
	"sword": ["검", "균형 잡힌 기본 무기", {}],
	"dagger": ["단검", "공격 속도 +20% · 피해 -10%", {"speed": 1.2, "dmg": 0.9}],
	"blunt": ["둔기", "공격 속도 -15% · 피해 +20% · 밀쳐내기 +40%", {"speed": 0.85, "dmg": 1.2, "knock": 1.4}],
	"spear": ["창", "공격 범위 +25% · 발사체 거리 +15%", {"area": 1.25, "range": 1.15}],
	"bow": ["활·새총", "발사체 거리 +35% · 공격 속도 +5%", {"range": 1.35, "speed": 1.05}],
	"staff": ["지팡이", "스킬 피해 +15%", {"skill": 1.15}],
	"fan": ["부채", "공격 범위 +30% · 밀쳐내기 +20% · 피해 -5%", {"area": 1.3, "knock": 1.2, "dmg": 0.95}],
}
## 무기 → 종류(없으면 검)
const KIND_OF := {
	&"fire_dagger": "dagger", &"dagger": "dagger", &"sickle": "dagger", &"crystal_fang": "dagger", &"frost_feather": "dagger",
	&"dragon_axe": "blunt", &"war_hammer": "blunt", &"axe": "blunt", &"club": "blunt", &"mace": "blunt", &"slime_scepter": "blunt",
	&"cyclops_maul": "blunt", &"hand_axe": "blunt", &"iron_hammer": "blunt", &"gold_axes": "blunt", &"crystal_flail": "blunt", &"platinum_axe": "blunt",
	&"thunder_spear": "spear", &"spear": "spear", &"sea_trident": "spear", &"ignis_spear": "spear", &"giant_heart": "spear", &"root_lance": "spear",
	&"gardener_scythe": "spear", &"harpoon": "spear", &"frost_trident": "spear", &"gold_spear": "spear", &"holy_lance": "spear", &"jade_glaive": "spear",
	&"longbow": "bow", &"bow": "bow", &"storm_bow": "bow", &"slingshot": "bow",
	&"fairy_wand": "staff", &"tome": "staff", &"wand": "staff", &"amber_staff": "staff", &"ruby_staff": "staff", &"sun_scepter": "staff",
	&"red_fan": "fan", &"violet_fan": "fan",
	&"blood_fang": "dagger", &"doom_axe": "blunt", &"crimson_lance": "spear", &"eclipse_bow": "bow", &"abyss_staff": "staff",
}

const MAX_ENHANCE := 20
const ENHANCE_BONUS := 0.08  # 강화 1마다 공격력 +8%

## 도트 아이콘 무기는 그림 위치가 따로 있다
const TEX_PATH: Dictionary[StringName, String] = {
	&"bronze_sword": "res://assets/weapons2/bronze_sword.png",
	&"hand_axe": "res://assets/weapons2/hand_axe.png",
	&"harpoon": "res://assets/weapons2/harpoon.png",
	&"slingshot": "res://assets/weapons2/slingshot.png",
	&"amber_staff": "res://assets/weapons2/amber_staff.png",
	&"red_fan": "res://assets/weapons2/red_fan.png",
	&"iron_hammer": "res://assets/vendor/willibab/iron_hammer.png",
	&"sapphire_blade": "res://assets/weapons2/sapphire_blade.png",
	&"jade_blade": "res://assets/weapons2/jade_blade.png",
	&"frost_feather": "res://assets/weapons2/frost_feather.png",
	&"ruby_staff": "res://assets/weapons2/ruby_staff.png",
	&"gold_axes": "res://assets/weapons2/gold_axes.png",
	&"frost_trident": "res://assets/weapons2/frost_trident.png",
	&"violet_fan": "res://assets/weapons2/violet_fan.png",
	&"gold_spear": "res://assets/vendor/willibab/gold_spear.png",
	&"crystal_flail": "res://assets/vendor/willibab/crystal_flail.png",
	&"gold_cross": "res://assets/weapons2/gold_cross.png",
	&"phoenix_blade": "res://assets/weapons2/phoenix_blade.png",
	&"sun_scepter": "res://assets/weapons2/sun_scepter.png",
	&"platinum_axe": "res://assets/weapons2/platinum_axe.png",
	&"holy_lance": "res://assets/weapons2/holy_lance.png",
	&"jade_glaive": "res://assets/vendor/willibab/jade_glaive.png",
	&"storm_bow": "res://assets/vendor/ravenmore/weapons/longbow.png",
	&"chaos_sword": "res://assets/vendor/mythic/chaos_sword.png",
	&"blood_fang": "res://assets/vendor/mythic/blood_fang.png",
	&"doom_axe": "res://assets/vendor/mythic/doom_axe.png",
	&"crimson_lance": "res://assets/vendor/mythic/crimson_lance.png",
	&"eclipse_bow": "res://assets/vendor/mythic/eclipse_bow.png",
	&"abyss_staff": "res://assets/vendor/mythic/abyss_staff.png",
}

static var _tex: Dictionary[StringName, Texture2D] = {}


static func ids() -> Array[StringName]:
	var out: Array[StringName] = []
	out.assign(DATA.keys())
	return out


static func pool(rarity: int) -> Array[StringName]:
	var out: Array[StringName] = []
	for id: StringName in DATA:
		if int(DATA[id][1]) == rarity and not is_boss(id):
			out.append(id)
	return out


## 몬스터가 떨어뜨리는 무기: 3성 80 · 4성 17 · 5성 3
static func roll_drop() -> StringName:
	var r := randf() * 100.0
	var rar := 5 if r < 3.0 else (4 if r < 20.0 else 3)
	var p := pool(rar)
	if p.is_empty():
		p = pool(3)
	return p[randi() % p.size()]


## 보스 전리품 무기(뽑기에 안 나옴)
static func is_boss(id: StringName) -> bool:
	return DATA[id].size() > 5 and DATA[id][5]


## 강화 비용(골드): 갈수록 비싸진다
static func enhance_cost(level: int) -> int:
	return 200 + level * level * 150


static func name_of(id: StringName) -> String:
	return DATA[id][0]


static func rarity_of(id: StringName) -> int:
	return DATA[id][1]


static func kind_of(id: StringName) -> String:
	return KIND_OF.get(id, "sword")


## 무기 종류 배율(key: speed·dmg·area·range·knock·skill). 무기가 없으면 1
static func mod(id: StringName, key: String) -> float:
	if id == &"" or not DATA.has(id):
		return 1.0
	return float((KINDS[kind_of(id)][2] as Dictionary).get(key, 1.0))


## "둔기 · 공격 속도 -15% …"
static func kind_text(id: StringName) -> String:
	var k: Array = KINDS[kind_of(id)]
	return "%s · %s" % [k[0], k[1]]


static func desc_of(id: StringName) -> String:
	return DATA[id][4]


static func crit_of(id: StringName) -> float:
	return DATA[id][3]


## 재련을 반영한 공격력
static func atk_of(id: StringName, refine: int, enhance := 0) -> int:
	return roundi(int(DATA[id][2]) * (1.0 + REFINE_BONUS * refine) * (1.0 + ENHANCE_BONUS * enhance))


static func texture(id: StringName) -> Texture2D:
	if not _tex.has(id):
		_tex[id] = load(TEX_PATH.get(id, TEX_DIR % id))
	return _tex[id]


## 무기 그림을 칸(size) 안에 비율을 지켜 그린다(그림이 이미 비스듬히 그려져 있다)
static func draw_icon(ci: CanvasItem, id: StringName, c: Vector2, size: float, tint := Color.WHITE) -> void:
	var tex := texture(id)
	var ts := tex.get_size()
	var s := ts * (size / maxf(ts.x, ts.y))
	ci.draw_texture_rect(tex, Rect2(c - s / 2.0, s), false, tint)


## 무기 카드: 등급색 테두리 + 어두운 바탕(등급색 빛) + 무기 그림 + 별 + (이름) + (재련 +N)
static func draw_card(ci: CanvasItem, id: StringName, r: Rect2, show_name := true, refine := -1, t := 0.0, dim := false) -> void:
	var rarity := rarity_of(id)
	var rc: Color = Gt.RARITY[rarity]
	Gt.pbox(ci, r, rc if not dim else rc.darkened(0.5), Gt.INK, 2, true, true)
	var inner := r.grow(-Gt.PX * 2.0)
	Gt.grad(ci, inner, Color("2e2648"), rc.darkened(0.35))
	ci.draw_circle(inner.get_center() + Vector2(0, -inner.size.y * 0.08), inner.size.x * (0.36 + 0.03 * sin(t * 3.0)), Color(rc.lightened(0.3), 0.3))
	draw_icon(ci, id, inner.get_center() + Vector2(0, -inner.size.y * 0.08), minf(inner.size.x, inner.size.y) * 0.95, Color(1, 1, 1, 0.45) if dim else Color.WHITE)
	var fade_h := inner.size.y * 0.3
	Gt.grad(ci, Rect2(inner.position.x, inner.end.y - fade_h, inner.size.x, fade_h), Color(Gt.INK, 0.0), Color(Gt.INK, 0.8))
	var sr := clampf(inner.size.x / 15.0, 4.0, 8.0)
	for i in rarity:
		Gt.star(ci, Vector2(inner.get_center().x + (i - (rarity - 1) / 2.0) * sr * 2.15, inner.end.y - sr - 4), sr, Gt.item_star(rarity))
	if show_name:
		Gt.title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), name_of(id), int(clampf(inner.size.x / 6.5, 10, 20)), Color.WHITE, 1)
	if refine > 0:
		var tag := Rect2(inner.position + Vector2(2, 2), Vector2(30, 18))
		Gt.tag(ci, tag, Gt.BLUE)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 13), "+%d" % refine, 12, Color.WHITE, 1)
	Gt.tier_frame(ci, r, rarity - 2, id.hash() % 7)
