class_name ListWindow
extends Control
## 업적·우편함 공용 창: 줄마다 아이콘·제목·설명·(진행 막대)·받기 버튼. 위아래로 끌어서 넘긴다.
## mode "achieve"면 Achievements, "mail"이면 Mail(맨 아래 '모두 받기').

signal closed

const ROW_H := 84.0

var mode := "achieve"
var scroll := 0.0
var _drag := false
var _moved := 0.0
var _toast := ""
var _toast_t := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 40


func _process(delta: float) -> void:
	_toast_t -= delta
	queue_redraw()


func _rows() -> Array:
	if mode == "mail":
		return Mail.LIST
	# 업적: 받을 수 있는 것 → 진행 중 → 받은 것
	var list: Array = Achievements.DATA.duplicate()
	list.sort_custom(func(a: Array, b: Array) -> bool: return _order(a) < _order(b))
	return list


func _order(a: Array) -> int:
	if Achievements.is_claimed(a):
		return 2
	return 0 if Achievements.is_done(a) else 1


func _panel() -> Rect2:
	return Rect2(Vector2(12, 50), size - Vector2(24, 90))


func _list_rect() -> Rect2:
	var p := _panel()
	return Rect2(p.position + Vector2(14, 84), p.size - Vector2(28, 170))


func _row(i: int) -> Rect2:
	var l := _list_rect()
	return Rect2(Vector2(l.position.x, l.position.y + i * ROW_H - scroll), Vector2(l.size.x, ROW_H - 8))


func _btn(i: int) -> Rect2:
	var r := _row(i)
	return Rect2(Vector2(r.end.x - 92, r.position.y + 16), Vector2(82, r.size.y - 32))


func _bottom_btn(k: int) -> Rect2:
	var p := _panel()
	if mode == "mail":
		var w := (p.size.x - 54) / 2.0
		return Rect2(Vector2(p.position.x + 18 + k * (w + 18), p.end.y - 70), Vector2(w, 54))
	return Rect2(Vector2(p.get_center().x - 90, p.end.y - 70), Vector2(180, 54))


func _max_scroll() -> float:
	return maxf(0.0, _rows().size() * ROW_H - _list_rect().size.y)


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	var mm := e as InputEventMouseMotion
	if mb and mb.button_index == MOUSE_BUTTON_LEFT:
		if mb.pressed:
			_drag = _list_rect().has_point(mb.position)
			_moved = 0.0
			if _bottom_btn(0).has_point(mb.position):
				closed.emit()
				queue_free()
			elif mode == "mail" and _bottom_btn(1).has_point(mb.position):
				var n := 0
				for m: Dictionary in Mail.LIST:
					if Mail.claim(m):
						n += 1
				_say("우편 %d통 모두 받았어요" % n if n > 0 else "받을 우편이 없어요")
				if n > 0:
					Game.sfx(&"coin", -2.0, 0.0)
		else:
			if _moved < 8.0:
				_click(mb.position)
			_drag = false
	elif mb and mb.pressed and mb.button_index in [MOUSE_BUTTON_WHEEL_DOWN, MOUSE_BUTTON_WHEEL_UP]:
		scroll = clampf(scroll + (40.0 if mb.button_index == MOUSE_BUTTON_WHEEL_DOWN else -40.0), 0.0, _max_scroll())
	elif mm and _drag:
		_moved += absf(mm.relative.y)
		scroll = clampf(scroll - mm.relative.y, 0.0, _max_scroll())


func _click(pos: Vector2) -> void:
	var rows := _rows()
	for i in rows.size():
		if not _btn(i).has_point(pos) or not _list_rect().has_point(pos):
			continue
		if mode == "mail":
			if Mail.claim(rows[i]):
				Game.sfx(&"coin", -2.0, 0.0)
				_say("받았어요! " + Mail.reward_text(rows[i]))
		elif Achievements.claim(rows[i]):
			Game.sfx(&"success", -4.0, 0.0)
			_say("업적 달성! 보석 +%d" % int(rows[i][5]))


func _say(t: String) -> void:
	_toast = t
	_toast_t = 1.6


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.65))
	var p := _panel()
	Gt.panel(self, p)
	if mode == "mail":
		Gt.header(self, p.position + Vector2(20, 46), "우편함", "MAIL", 22)
		Gt.text(self, Vector2(p.end.x - 20, p.position.y + 46), "안 받은 우편 %d통" % Mail.unread(), 14, Gt.PINK, 2)
	else:
		Gt.header(self, p.position + Vector2(20, 46), "업적", "ACHIEVEMENT", 22)
		var done := 0
		for a: Array in Achievements.DATA:
			if Achievements.is_claimed(a):
				done += 1
		Gt.text(self, Vector2(p.end.x - 20, p.position.y + 46), "달성 %d / %d" % [done, Achievements.DATA.size()], 14, Gt.PINK, 2)
	var l := _list_rect()
	var rows := _rows()
	for i in rows.size():
		var r := _row(i)
		if r.position.y < l.position.y - 2 or r.end.y > l.end.y + 2:
			continue  # 칸 전체가 보이는 줄만
		if mode == "mail":
			_draw_mail(i, rows[i], r)
		else:
			_draw_ach(i, rows[i], r)
	if _max_scroll() > 0.0:
		Gt.text(self, Vector2(l.get_center().x, l.end.y + 18), "위아래로 끌어서 더 보기", 11, Gt.GRAY, 1, false)
	var b0 := _bottom_btn(0)
	Gt.button(self, b0, Gt.Kind.BLUE)
	Gt.title(self, Vector2(b0.get_center().x, b0.position.y + 35), "닫기", 19, Color.WHITE, 1)
	if mode == "mail":
		var b1 := _bottom_btn(1)
		Gt.button(self, b1, Gt.Kind.YELLOW if Mail.unread() > 0 else Gt.Kind.GRAY)
		Gt.title(self, Vector2(b1.get_center().x, b1.position.y + 35), "모두 받기", 19, Color.WHITE, 1)
	if _toast_t > 0.0:
		var w := Gt.width(_toast, 16) + 40
		var tr := Rect2(Vector2((size.x - w) / 2.0, p.position.y - 46), Vector2(w, 42))
		Gt.pbox(self, tr, Color(Gt.NAVY, 0.95))
		Gt.title(self, Vector2(tr.get_center().x, tr.position.y + 28), _toast, 16, Color.WHITE, 1)


func _draw_ach(i: int, a: Array, r: Rect2) -> void:
	var claimed := Achievements.is_claimed(a)
	var done := Achievements.is_done(a)
	Gt.pbox(self, r, Color("fff2c4") if done and not claimed else (Color("e9e4da") if claimed else Gt.CREAM), Gt.INK, 2, false, true)
	Gt.icon(self, &"cup", r.position + Vector2(30, r.size.y / 2.0), 34, Color.WHITE if done else Color(1, 1, 1, 0.45))
	Gt.text(self, r.position + Vector2(56, 26), a[1], 16, Gt.NAVY if not claimed else Gt.GRAY)
	Gt.text(self, r.position + Vector2(56, 44), a[2], 11, Gt.NAVY_SOFT, 0, false)
	var n := mini(Achievements.progress(a[3]), int(a[4]))
	var bw := r.size.x - 220
	Gt.bar(self, Rect2(r.position + Vector2(56, 54), Vector2(bw, 10)), n / float(a[4]), Gt.GREEN if done else Gt.YELLOW)
	Gt.text(self, Vector2(r.position.x + 56 + bw, r.position.y + 44), "%s / %s" % [_comma(n), _comma(int(a[4]))], 11, Gt.NAVY, 2)
	Gt.gem(self, Vector2(r.end.x - 136, r.position.y + 24), 8)
	Gt.text(self, Vector2(r.end.x - 124, r.position.y + 29), "%d" % int(a[5]), 14, Gt.NAVY)
	var b := _btn(i)
	Gt.button(self, b, Gt.Kind.YELLOW if done and not claimed else Gt.Kind.GRAY)
	Gt.title(self, Vector2(b.get_center().x, b.position.y + 30), "완료" if claimed else ("받기" if done else "진행 중"), 15 if done or claimed else 13, Color.WHITE, 1)


func _draw_mail(i: int, m: Dictionary, r: Rect2) -> void:
	var got := Save.mail_claimed.has(m["id"])
	Gt.pbox(self, r, Gt.CREAM if not got else Color("e9e4da"), Gt.INK, 2, false, true)
	Gt.icon(self, &"letter", r.position + Vector2(30, r.size.y / 2.0), 34, Color.WHITE if not got else Color(1, 1, 1, 0.45))
	Gt.text(self, r.position + Vector2(56, 24), m["title"], 16, Gt.NAVY if not got else Gt.GRAY)
	Gt.text(self, Vector2(r.end.x - 104, r.position.y + 20), m["date"], 10, Gt.GRAY, 2, false)
	var body: String = m["body"]
	if Gt.width(body, 11, false) > r.size.x - 170:
		body = body.substr(0, 30) + "…"
	Gt.text(self, r.position + Vector2(56, 42), body, 11, Gt.NAVY_SOFT, 0, false)
	Gt.text(self, r.position + Vector2(56, 62), Mail.reward_text(m), 11, Gt.PINK, 0)
	var b := _btn(i)
	Gt.button(self, b, Gt.Kind.YELLOW if not got else Gt.Kind.GRAY)
	Gt.title(self, Vector2(b.get_center().x, b.position.y + 30), "받음" if got else "받기", 15, Color.WHITE, 1)


func _comma(n: int) -> String:
	var t := str(n)
	var out := ""
	while t.length() > 3:
		out = "," + t.substr(t.length() - 3) + out
		t = t.substr(0, t.length() - 3)
	return t + out
