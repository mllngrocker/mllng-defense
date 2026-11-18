class_name NewbieGift
extends Control
## 첫 7일 접속 선물: 처음 시작한 뒤 하루 한 번(출석 달력과 따로), 7일째는 ★5 캐릭터 선택권.
## 진행은 Save.settings["newbie"] = {"day": 받은 날 수(0~7), "last": "YYYY-MM-DD"}. 7일을 다 받으면 다시 안 뜬다.

signal closed

## [종류, 수량] — gems · gold · stone · potion · pick5(★5 캐릭터 선택권)
const REWARDS: Array = [
	["gems", 300], ["gold", 50000], ["stone", 30], ["gems", 500], ["potion", 15], ["gems", 1000], ["pick5", 1],
]

static var shown := false

var day := 0
var claimed := false
var picking := false  # 7일째: ★5 고르는 중
var _t := 0.0
var _btn: GameButton
var _cards: Array = []  # [id, Rect2]
var _picked := StringName()


static func state() -> Dictionary:
	return Save.settings.get("newbie", {"day": 0, "last": ""})


static func active() -> bool:
	return int(state().get("day", 0)) < REWARDS.size()


static func can_claim() -> bool:
	return active() and str(state().get("last", "")) != Attendance.today()


## 로비가 열릴 때: 오늘 받을 게 있으면 띄우고, 닫으면 출석 달력으로 이어진다
static func try_show(host: Control) -> bool:
	if shown or not can_claim() or not Save.persist:
		return false
	shown = true
	var g := NewbieGift.new()
	g.closed.connect(func() -> void: Attendance.try_show(host))
	host.add_child(g)
	return true


static func five_stars() -> Array[StringName]:
	var out: Array[StringName] = []
	for id in Save.ROSTER:
		if Save.character(id).rarity == 5:
			out.append(id)
	return out


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 66
	day = int(state().get("day", 0))
	_btn = GameButton.new()
	_btn.label = "선물 받기"
	_btn.kind = Gt.Kind.YELLOW
	_btn.font_size = 21
	_btn.set_anchors_preset(Control.PRESET_CENTER)
	_btn.offset_left = -130
	_btn.offset_right = 130
	_btn.offset_top = 150
	_btn.offset_bottom = 214
	_btn.pressed.connect(_on_btn)
	add_child(_btn)
	Game.sfx(&"success", -6.0, 0.0)


func _on_btn() -> void:
	if picking:
		if _picked == StringName():
			return
		var res := Save.grant_character(_picked)
		Save.settings["newbie"] = {"day": day + 1, "last": Attendance.today()}
		Save.save_game()
		Save.equip_changed.emit()
		Game.sfx(&"success", -2.0, 0.0)
		Game.flash(Color(1, 0.9, 0.6, 0.4), 0.3)
		picking = false
		claimed = true
		_btn.label = "닫기"
		_btn.kind = Gt.Kind.WHITE
		_btn.queue_redraw()
		_picked_msg = "%s %s!" % [Save.character(_picked).display_name, "합류" if res == "new" else "별 조각 획득"]
		return
	if not claimed:
		var r: Array = REWARDS[day]
		if String(r[0]) == "pick5":
			picking = true
			_btn.label = "이 동료로 할게요"
			_btn.queue_redraw()
			return
		match String(r[0]):
			"gems":
				Save.add_gems(int(r[1]))
			"gold":
				Save.add_gold(int(r[1]))
			_:
				Save.give_item(StringName(r[0]), int(r[1]))
		Save.settings["newbie"] = {"day": day + 1, "last": Attendance.today()}
		Save.save_game()
		claimed = true
		Game.sfx(&"coin", -2.0, 0.0)
		_btn.label = "닫기"
		_btn.kind = Gt.Kind.WHITE
		_btn.queue_redraw()
		return
	closed.emit()
	queue_free()


var _picked_msg := ""


func _gui_input(event: InputEvent) -> void:
	var mb := event as InputEventMouseButton
	if picking and mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		for e: Array in _cards:
			if (e[1] as Rect2).has_point(mb.position):
				_picked = e[0]
				Game.sfx(&"pickup", -8.0)


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


static func reward_name(r: Array) -> String:
	if String(r[0]) == "pick5":
		return "★5 캐릭터 선택권"
	return Attendance.reward_name(r)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.7))
	var w := minf(size.x - 24.0, 500.0)
	var cw0 := (w - 28.0 - 18.0) / 4.0
	var p := Rect2(Vector2((size.x - w) / 2.0, size.y * 0.5 - 290.0), Vector2(w, minf(430.0, 100.0 + cw0 * 2.4 + 6.0 + 56.0)))
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(20, 46), "첫 7일 선물", "WELCOME", 22)
	Gt.text(self, Vector2(p.end.x - 20, p.position.y + 44), "%d / 7일" % (day + (1 if claimed else 0)), 15, Gt.PINK, 2)
	if picking or (claimed and _picked != StringName()):
		_draw_pick(p)
		return
	Gt.text(self, Vector2(p.get_center().x, p.position.y + 76), "처음 일주일, 하루 한 번 접속하면 받아요 · 7일째 ★5 동료!", 13, Gt.NAVY_SOFT, 1, false)
	var gap := 6.0
	var cw := (p.size.x - 28.0 - gap * 3) / 4.0
	for i in REWARDS.size():
		var r: Array = REWARDS[i]
		var big := i == 6
		var c: Rect2
		if big:  # 7일째: 아래 줄 오른쪽 두 칸을 합친 큰 칸
			c = Rect2(p.position + Vector2(14 + 2 * (cw + gap), 100 + (cw * 1.2 + gap)), Vector2(cw * 2 + gap, cw * 1.2))
		else:
			c = Rect2(p.position + Vector2(14 + (i % 4) * (cw + gap), 100 + (i / 4) * (cw * 1.2 + gap)), Vector2(cw, cw * 1.2))
		var done := i < day or (claimed and i == day)
		var now := i == day and not claimed
		Gt.pbox(self, c, Color("ffe3ef") if now else (Color("fff1c9") if big else (Color("e8e4ee") if done else Color.WHITE)), Gt.INK, 2, false, true)
		if big:
			Gt.tier_frame(self, c, 3, 7)
		if now:
			Gt.round_line(self, c.grow(3.0), 7, Color(Gt.PINK, 0.6 + 0.4 * sin(_t * 5.0)), 4.0)
		Gt.text(self, c.position + Vector2(6, 16), "%d일" % (i + 1), 12, Gt.PINK if big else Gt.NAVY_SOFT)
		var ic := c.get_center() + Vector2(0, -6)
		match String(r[0]):
			"gems":
				Gt.gem(self, ic, 22.0)
			"gold":
				Gt.coin(self, ic, 19.0)
			"pick5":
				for k in 3:  # 보라 별 셋 + 반짝
					Gt.star(self, ic + Vector2((k - 1) * 26, -4 - (6 if k == 1 else 0)), 11.0, Gt.STAR_BY_RARITY.get(5, Gt.STAR))
				Gt.sparkle(self, ic + Vector2(40, -18), 8.0 + 3.0 * sin(_t * 4.0), Color.WHITE)
			_:
				Gt.icon(self, Items.icon_of(StringName(r[0])), ic, 56)
		var label := "★5 선택권" if big else (Attendance._short(int(r[1])) if String(r[0]) == "gold" else str(int(r[1])))
		Gt.text(self, Vector2(c.get_center().x, c.end.y - 8), label, 13 if big else 12, Gt.NAVY, 1)
		if done:
			draw_circle(c.get_center(), c.size.y * 0.3, Color(0.9, 0.2, 0.3, 0.25))
			draw_arc(c.get_center(), c.size.y * 0.3, 0, TAU, 24, Color(0.85, 0.15, 0.25, 0.85), 2.5)
			Gt.text(self, c.get_center() + Vector2(0, 5), "받음", 12, Color(0.8, 0.1, 0.2), 1)
	var msg := ("받았어요! " if claimed else "오늘의 선물: ") + reward_name(REWARDS[mini(day, 6)])
	Gt.text(self, Vector2(p.get_center().x, p.end.y - 24), msg, 16, Gt.NAVY, 1)


## 7일째: ★5 동료 하나 고르기
func _draw_pick(p: Rect2) -> void:
	Gt.text(self, Vector2(p.get_center().x, p.position.y + 76), _picked_msg if claimed else "함께할 ★5 동료를 하나 골라 주세요", 15, Gt.NAVY, 1)
	var ids := five_stars()
	var n := ids.size()
	var gap := 8.0
	var cw := minf(110.0, (p.size.x - 28.0 - gap * (n - 1)) / maxf(1.0, n))
	var x0 := p.get_center().x - (cw * n + gap * (n - 1)) / 2.0
	_cards.clear()
	for i in n:
		var id: StringName = ids[i]
		var r := Rect2(Vector2(x0 + i * (cw + gap), p.position.y + 110), Vector2(cw, cw * 1.35))
		if id == _picked:  # 고른 동료: 노란 빛 테두리 + "선택" 꼬리표
			Gt.pbox(self, r.grow(6), Gt.YELLOW, Gt.INK, 2, false, false)
			Gt.round_line(self, r.grow(10.0), 10, Color(Gt.YELLOW, 0.5 + 0.5 * sin(_t * 6.0)), 4.0)
		Gt.char_card(self, Save.character(id), r, true)
		if id == _picked:
			var tg := Rect2(Vector2(r.get_center().x - 22, r.position.y - 12), Vector2(44, 20))
			Gt.tag(self, tg, Gt.PINK)
			Gt.text(self, Vector2(tg.get_center().x, tg.position.y + 14), "선택", 12, Color.WHITE, 1)
		if Save.is_owned(id):
			Gt.text(self, Vector2(r.get_center().x, r.end.y + 18), "보유 · 별 조각", 11, Gt.NAVY_SOFT, 1)
		_cards.append([id, r])
