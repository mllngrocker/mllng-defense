class_name Attendance
extends Control
## 출석 달력(28일): 하루 한 번 로비에 들어오면 뜬다. 7·14·21·28일째는 큰 보상, 28일을 다 채우면 1일부터 다시.
## 진행은 Save.settings["attend"] = {"day": 받은 날 수(0~28), "last": "YYYY-MM-DD"}.

signal closed

## [종류, 수량] — 종류: gems · gold · stone(강화석) · potion · mana_potion · return_scroll
const REWARDS: Array = [
	["gold", 20000], ["potion", 5], ["gems", 50], ["stone", 10], ["mana_potion", 5], ["gold", 40000], ["gems", 300],
	["gold", 30000], ["stone", 15], ["gems", 60], ["potion", 8], ["return_scroll", 3], ["gold", 60000], ["gems", 500],
	["gold", 40000], ["mana_potion", 8], ["gems", 80], ["stone", 20], ["potion", 10], ["gold", 80000], ["gems", 800],
	["gold", 50000], ["stone", 25], ["gems", 100], ["mana_potion", 10], ["return_scroll", 5], ["gold", 120000], ["gems", 1500],
]
const COLS := 7

static var shown := false

var day := 0  # 오늘 받을 칸(0부터)
var claimed := false
var _t := 0.0
var _btn: GameButton


static func state() -> Dictionary:
	return Save.settings.get("attend", {"day": 0, "last": ""})


static func today() -> String:
	return Time.get_date_string_from_system()


static func can_claim() -> bool:
	return str(state().get("last", "")) != today()


## 로비가 열릴 때: 오늘 아직 안 받았으면 달력을 띄운다(한 번만)
static func try_show(host: Control) -> void:
	if shown or not can_claim() or not Save.persist:
		return
	shown = true
	host.add_child(Attendance.new())


## 오늘 칸 보상 받기
static func claim() -> Array:
	var st := state()
	var d := int(st.get("day", 0)) % REWARDS.size()
	var r: Array = REWARDS[d]
	match String(r[0]):
		"gems":
			Save.add_gems(int(r[1]))
		"gold":
			Save.add_gold(int(r[1]))
		_:
			Save.give_item(StringName(r[0]), int(r[1]))
	Save.settings["attend"] = {"day": d + 1, "last": today()}
	Save.save_game()
	return r


static func reward_name(r: Array) -> String:
	match String(r[0]):
		"gems":
			return "보석 %d" % int(r[1])
		"gold":
			return "골드 %s" % _short(int(r[1]))
	return "%s %d" % [Items.name_of(StringName(r[0])), int(r[1])]


static func _short(n: int) -> String:
	return "%d만" % (n / 10000) if n >= 10000 and n % 10000 == 0 else str(n)


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 65
	day = int(state().get("day", 0)) % REWARDS.size()
	_btn = GameButton.new()
	_btn.label = "오늘 보상 받기"
	_btn.kind = Gt.Kind.YELLOW
	_btn.font_size = 21
	_btn.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	_btn.offset_left = -130
	_btn.offset_right = 130
	_btn.set_anchors_preset(Control.PRESET_CENTER)
	_btn.offset_top = 176
	_btn.offset_bottom = 240
	_btn.pressed.connect(_on_btn)
	add_child(_btn)
	Game.sfx(&"success", -6.0, 0.0)


func _on_btn() -> void:
	if not claimed:
		claim()
		claimed = true
		_t = 0.0
		Game.sfx(&"coin", -2.0, 0.0)
		_btn.label = "닫기"
		_btn.kind = Gt.Kind.WHITE
		_btn.queue_redraw()
		return
	closed.emit()
	queue_free()


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


func _cell(i: int, p: Rect2) -> Rect2:
	var gap := 6.0
	var w := (p.size.x - 28.0 - gap * (COLS - 1)) / COLS
	var h := w * 1.18
	return Rect2(p.position + Vector2(14 + (i % COLS) * (w + gap), 92 + (i / COLS) * (h + gap)), Vector2(w, h))


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.65))
	var w := minf(size.x - 24.0, 500.0)
	var p := Rect2(Vector2((size.x - w) / 2.0, size.y * 0.5 - 290.0), Vector2(w, 450))
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(20, 46), "출석 달력", "ATTENDANCE", 22)
	Gt.text(self, Vector2(p.end.x - 20, p.position.y + 44), "%d / %d일" % [day + (1 if claimed else 0), REWARDS.size()], 15, Gt.PINK, 2)
	Gt.text(self, Vector2(p.get_center().x, p.position.y + 74), "하루 한 번 · 7일마다 큰 보상", 13, Gt.NAVY_SOFT, 1, false)
	for i in REWARDS.size():
		var r: Array = REWARDS[i]
		var c := _cell(i, p)
		var big := (i + 1) % 7 == 0
		var done := i < day or (claimed and i == day)
		var now := i == day and not claimed
		Gt.pbox(self, c, Color("ffe3ef") if now else (Color("fff1c9") if big else (Color("e8e4ee") if done else Color.WHITE)), Gt.INK, 2, false, true)
		if now:  # 오늘 칸: 분홍 바탕 + 숨 쉬듯 빛나는 테두리 + "오늘" 꼬리표
			Gt.round_line(self, c.grow(3.0), 7, Color(Gt.PINK, 0.6 + 0.4 * sin(_t * 5.0)), 4.0)
			var tg := Rect2(Vector2(c.get_center().x - 18, c.position.y - 10), Vector2(36, 18))
			Gt.tag(self, tg, Gt.PINK)
			Gt.text(self, Vector2(tg.get_center().x, tg.position.y + 13), "오늘", 10, Color.WHITE, 1)
		Gt.text(self, c.position + Vector2(5, 13), "%d일" % (i + 1), 10, Gt.PINK if big else Gt.NAVY_SOFT)
		var ic := c.get_center() + Vector2(0, -2)
		match String(r[0]):
			"gems":
				Gt.gem(self, ic, 15.0 if big else 12.0)
			"gold":
				Gt.coin(self, ic, 12.0 if big else 10.0)
			_:
				Gt.icon(self, Items.icon_of(StringName(r[0])), ic, 30)
		var label := _short(int(r[1])) if String(r[0]) == "gold" else str(int(r[1]))
		Gt.text(self, Vector2(c.get_center().x, c.end.y - 6), label, 11, Gt.NAVY, 1)
		if done:  # 받은 칸: 빨간 도장
			draw_circle(c.get_center(), c.size.x * 0.32, Color(0.9, 0.2, 0.3, 0.25))
			draw_arc(c.get_center(), c.size.x * 0.32, 0, TAU, 24, Color(0.85, 0.15, 0.25, 0.85), 2.5)
			Gt.text(self, c.get_center() + Vector2(0, 5), "출석", 11, Color(0.8, 0.1, 0.2), 1)
	var r0: Array = REWARDS[day]
	var msg := ("받았어요! " if claimed else "오늘의 보상: ") + reward_name(r0)
	Gt.text(self, Vector2(p.get_center().x, p.end.y - 26), msg, 16, Gt.NAVY, 1)
