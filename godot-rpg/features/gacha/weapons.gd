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
}

static var _tex: Dictionary[StringName, Texture2D] = {}


static func ids() -> Array[StringName]:
	var out: Array[StringName] = []
	out.assign(DATA.keys())
	return out


static func pool(rarity: int) -> Array[StringName]:
	var out: Array[StringName] = []
	for id: StringName in DATA:
		if int(DATA[id][1]) == rarity:
			out.append(id)
	return out


static func name_of(id: StringName) -> String:
	return DATA[id][0]


static func rarity_of(id: StringName) -> int:
	return DATA[id][1]


static func desc_of(id: StringName) -> String:
	return DATA[id][4]


static func crit_of(id: StringName) -> float:
	return DATA[id][3]


## 재련을 반영한 공격력
static func atk_of(id: StringName, refine: int) -> int:
	return roundi(int(DATA[id][2]) * (1.0 + REFINE_BONUS * refine))


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
