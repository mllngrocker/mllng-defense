class_name DexWindow
extends Control
## 도감 창(로비 위쪽 '도감' 버튼): 몬스터 · 장비 · 펫 탭. 아직 못 만난 것은 실루엣과 "???".
## 맨 위에 모은 수와 도감 보너스(공격력·체력)를 보여 준다.

signal closed

const TABS: Array[String] = ["몬스터", "장비", "펫"]
const CELL := Vector2(92, 104)
const COLS := 5

var tab := 0
var scroll := 0.0
var _drag := false
var _press_y := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	z_index = 40


func _panel() -> Rect2:
	return Rect2(Vector2(12, 50), size - Vector2(24, 90))


func _grid_rect() -> Rect2:
	var p := _panel()
	return Rect2(p.position + Vector2(14, 150), p.size - Vector2(28, 230))


func _tab_rect(i: int) -> Rect2:
	var p := _panel()
	var w := (p.size.x - 28) / TABS.size()
	return Rect2(Vector2(p.position.x + 14 + i * w, p.position.y + 94), Vector2(w - 6, 44))


func _close_rect() -> Rect2:
	var p := _panel()
	return Rect2(Vector2(p.get_center().x - 90, p.end.y - 66), Vector2(180, 52))


func _count() -> int:
	match tab:
		0:
			return Dex.MOBS.size()
		1:
			return Gear.DATA.size()
	return Pets.DATA.size()


func _max_scroll() -> float:
	var rows := ceili(_count() / float(COLS))
	return maxf(0.0, rows * CELL.y - _grid_rect().size.y + 8.0)


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	var mm := e as InputEventMouseMotion
	if mb and mb.button_index == MOUSE_BUTTON_LEFT:
		if mb.pressed:
			_press_y = mb.position.y
			_drag = _grid_rect().has_point(mb.position)
			for i in TABS.size():
				if _tab_rect(i).has_point(mb.position):
					tab = i
					scroll = 0.0
					Game.sfx(&"pickup", -12.0)
			if _close_rect().has_point(mb.position):
				closed.emit()
				queue_free()
		else:
			_drag = false
	elif mb and mb.pressed and mb.button_index in [MOUSE_BUTTON_WHEEL_DOWN, MOUSE_BUTTON_WHEEL_UP]:
		scroll = clampf(scroll + (40.0 if mb.button_index == MOUSE_BUTTON_WHEEL_DOWN else -40.0), 0.0, _max_scroll())
	elif mm and _drag:
		scroll = clampf(scroll - mm.relative.y, 0.0, _max_scroll())
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.65))
	var p := _panel()
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(20, 46), "도감", "COLLECTION", 22)
	var mobs := Dex.found_count()
	Gt.text(self, Vector2(p.end.x - 20, p.position.y + 34), "몬스터 %d/%d · 장비 %d/%d · 펫 %d/%d" % [mobs, Dex.MOBS.size(), Save.gear.size(), Gear.DATA.size(), Save.pets.size(), Pets.DATA.size()], 12, Gt.NAVY_SOFT, 2, false)
	Gt.text(self, Vector2(p.end.x - 20, p.position.y + 56), "도감 보너스  공격력 +%.1f%% · 체력 +%.1f%%" % [Save.dex_bonus("atk") * 100.0, Save.dex_bonus("hp") * 100.0], 14, Gt.PINK, 2)
	for i in TABS.size():
		var tr := _tab_rect(i)
		if i == tab:
			Gt.button(self, tr, Gt.Kind.PINK)
			Gt.title(self, Vector2(tr.get_center().x, tr.position.y + 28), TABS[i], 17, Color.WHITE, 1)
		else:
			Gt.pbox(self, tr, Color("e9e4da"), Gt.INK, 2, false, true)
			Gt.text(self, Vector2(tr.get_center().x, tr.position.y + 28), TABS[i], 17, Gt.NAVY_SOFT, 1)
	# 칸들(잘라서 그리기 대신 보이는 줄만)
	var g := _grid_rect()
	var cw := g.size.x / COLS
	for i in _count():
		var c := Vector2(g.position.x + (i % COLS) * cw, g.position.y + (i / COLS) * CELL.y - scroll)
		if c.y < g.position.y - 2 or c.y + CELL.y > g.end.y + 2:
			continue  # 칸 전체가 보이는 줄만
		_draw_cell(i, Rect2(c + Vector2(3, 3), Vector2(cw - 6, CELL.y - 8)))
	if _max_scroll() > 0.0:
		var k := scroll / _max_scroll()
		draw_rect(Rect2(Vector2(g.end.x + 4, g.position.y + k * (g.size.y - 40)), Vector2(4, 40)), Color(Gt.NAVY, 0.4))  # 스크롤 위치
		Gt.text(self, Vector2(g.get_center().x, g.end.y + 22), "위아래로 끌어서 더 보기", 11, Gt.GRAY, 1, false)
	var cr := _close_rect()
	Gt.button(self, cr, Gt.Kind.BLUE)
	Gt.title(self, Vector2(cr.get_center().x, cr.position.y + 34), "닫기", 19, Color.WHITE, 1)


func _draw_cell(i: int, r: Rect2) -> void:
	var icon := Rect2(r.position + Vector2((r.size.x - 52) / 2.0, 6), Vector2(52, 52))
	match tab:
		0:
			var m: Array = Dex.MOBS[i]
			var n := int(Save.dex.get(m[0], 0))
			Gt.pbox(self, r, (Color("ffe1e1") if m[2] else Gt.CREAM) if n > 0 else Color("d9d4e2"), Gt.INK, 2, false, true)
			var a := Dex.art(m[0])
			var tint: Color = a[2] if n > 0 else Color(0.15, 0.12, 0.2, 0.75)
			draw_texture_rect_region(a[0], icon, a[1], tint)
			Gt.text(self, Vector2(r.get_center().x, r.end.y - 22), m[1] if n > 0 else "???", 11, Gt.NAVY if n > 0 else Gt.GRAY, 1)
			if n > 0:
				Gt.text(self, Vector2(r.get_center().x, r.end.y - 7), "%d마리" % n, 10, Gt.NAVY_SOFT, 1, false)
		1:
			var id: StringName = Gear.ids()[i]
			var have := Save.has_gear(id)
			Gear.draw_card(self, id, r, false, -1, not have)
			Gt.text(self, Vector2(r.get_center().x, r.end.y - 22), Gear.name_of(id) if have else "???", 10, Color.WHITE, 1, true, 3, Gt.INK)
		2:
			var id: StringName = Pets.ids()[i]
			var have := Save.has_pet(id)
			Gt.pbox(self, r, Gt.CREAM if have else Color("d9d4e2"), Gt.INK, 2, false, true)
			if have:
				Pets.draw_icon(self, id, Rect2(icon.position + Vector2(10, 10), Vector2(32, 32)))
			else:
				Gt.lock(self, icon.get_center(), 22, Color("a69fb6"))
			Gt.text(self, Vector2(r.get_center().x, r.end.y - 22), Pets.name_of(id) if have else "???", 11, Gt.NAVY if have else Gt.GRAY, 1)
			Gt.text(self, Vector2(r.get_center().x, r.end.y - 7), Pets.source_of(id) if not have else Pets.bonus_text(id), 8, Gt.NAVY_SOFT, 1, false)
