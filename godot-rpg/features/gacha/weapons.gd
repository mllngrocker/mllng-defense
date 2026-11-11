class_name Weapons
extends RefCounted
## 무기 20종(Ravenmore 손그림 아이콘, assets/vendor/ravenmore — 재배포 금지라 git 제외): 이름·등급·공격력·치명타 확률.
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
	# 보스를 처음 잡으면 받는 무기(뽑기에서는 안 나온다): [.., true]
	&"slime_scepter": ["슬라임 왕의 홀", 5, 20, 0.04, "말랑하지만 묵직한 왕의 홀", true],
	&"crystal_fang": ["수정 송곳니", 5, 26, 0.15, "거미 여왕의 수정 송곳니로 만든 단검", true],
	&"cyclops_maul": ["거인의 가시 몽둥이", 5, 34, 0.04, "외눈 거인 왕이 휘두르던 몽둥이", true],
	&"glacier_blade": ["빙하의 대검", 5, 52, 0.06, "녹지 않는 얼음으로 벼린 대검", true],
	&"sea_trident": ["해신의 삼지창", 5, 78, 0.08, "깊은 바다의 힘이 깃든 삼지창", true],
	&"ignis_spear": ["이그니스의 화염창", 5, 112, 0.10, "화염룡의 숨결이 타오르는 창", true],
	&"demon_sword": ["마왕의 검", 5, 160, 0.15, "마왕 아자젤을 쓰러뜨린 자의 증표", true],
	&"giant_heart": ["거인의 심장창", 5, 230, 0.18, "고대 거인이 남긴 빛나는 창", true],
}
const MAX_ENHANCE := 20
const ENHANCE_BONUS := 0.08  # 강화 1마다 공격력 +8%

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


static func desc_of(id: StringName) -> String:
	return DATA[id][4]


static func crit_of(id: StringName) -> float:
	return DATA[id][3]


## 재련을 반영한 공격력
static func atk_of(id: StringName, refine: int, enhance := 0) -> int:
	return roundi(int(DATA[id][2]) * (1.0 + REFINE_BONUS * refine) * (1.0 + ENHANCE_BONUS * enhance))


static func texture(id: StringName) -> Texture2D:
	if not _tex.has(id):
		_tex[id] = load(TEX_DIR % id)
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
		Gt.star(ci, Vector2(inner.get_center().x + (i - (rarity - 1) / 2.0) * sr * 2.15, inner.end.y - sr - 4), sr)
	if show_name:
		Gt.title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), name_of(id), int(clampf(inner.size.x / 6.5, 10, 20)), Color.WHITE, 1)
	if refine > 0:
		var tag := Rect2(inner.position + Vector2(2, 2), Vector2(30, 18))
		Gt.tag(ci, tag, Gt.BLUE)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 13), "+%d" % refine, 12, Color.WHITE, 1)
