class_name PullGuide
extends Control
## 처음 시작 안내: 환영 선물(보석 300개) → 상점 탭을 눌러 → 1회 소환을 눌러(★4 이상 확정).
## 화면을 어둡게 덮고 눌러야 할 곳만 구멍을 뚫어 손가락으로 가리킨다. 다른 곳은 못 누른다.
## main_menu가 처음 시작(동료 고르기 끝)일 때 붙인다. 끝나면 Save.settings["tut_pull"] = true.

const GIFT := 300

var menu: Node  # main_menu
var step := 0  # 0 선물 받기 · 1 상점 탭 · 2 1회 소환
var _t := 0.0
var _gift_rect := Rect2()


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 20


func _process(delta: float) -> void:
	_t += delta
	var host := get_parent() as Control
	if host and size != host.size:
		position = Vector2.ZERO
		size = host.size  # 로비 화면 전체를 덮는다
	queue_redraw()


## 지금 눌러야 할 곳(화면 좌표)
func _hole() -> Rect2:
	match step:
		1:
			var bar: Control = menu.tab_bar
			var r := bar.get_global_rect()
			var w: float = r.size.x / float(menu.TABS.size())
			return Rect2(r.position, Vector2(w, r.size.y)).grow(-4)
		2:
			var b: Control = menu.shop_page.one_button
			return b.get_global_rect().grow(6)
	return _gift_rect


func _gui_input(event: InputEvent) -> void:
	var mb := event as InputEventMouseButton
	if mb == null or not mb.pressed or mb.button_index != MOUSE_BUTTON_LEFT:
		return
	accept_event()
	var at := get_global_transform() * mb.position
	if not _hole().has_point(at):
		return
	match step:
		0:
			Save.add_gems(GIFT)
			Game.sfx(&"success", -6.0)
			step = 1
		1:
			menu._on_tab_pressed(0)
			if menu.shop_page.mode != "char" and menu.shop_page.has_method("set_mode"):
				menu.shop_page.set_mode("char")
			Game.sfx(&"pickup", -8.0)
			step = 2
		2:
			Save.settings["tut_pull"] = true
			Gacha.force_4_once = true  # 첫 소환은 ★4 이상 확정
			menu.shop_page._on_pull(1, Gacha.COST_ONE)
			Save.save_game()
			queue_free()


func _draw() -> void:
	var dim := Color(0.03, 0.04, 0.1, 0.72)
	var full := Rect2(Vector2.ZERO, size)
	var inv := get_global_transform().affine_inverse()
	if step == 0:
		draw_rect(full, dim)
		_draw_gift()
		return
	var h := inv * _hole()
	# 구멍 둘레만 남기고 어둡게
	draw_rect(Rect2(0, 0, size.x, h.position.y), dim)
	draw_rect(Rect2(0, h.end.y, size.x, size.y - h.end.y), dim)
	draw_rect(Rect2(0, h.position.y, h.position.x, h.size.y), dim)
	draw_rect(Rect2(h.end.x, h.position.y, size.x - h.end.x, h.size.y), dim)
	var pulse := 0.5 + 0.5 * sin(_t * 5.0)
	Gt.round_line(self, h.grow(3.0 + pulse * 3.0), 10, Color(Gt.YELLOW, 0.6 + 0.4 * pulse), 4.0)
	# 통통 튀는 손가락(화살표)
	var up := h.position.y > size.y * 0.5  # 아래쪽 버튼이면 위에서 가리킨다
	var tip := Vector2(h.get_center().x, h.position.y - 6.0 if up else h.end.y + 6.0)
	var bob := sin(_t * 6.0) * 6.0
	var d := 1.0 if up else -1.0
	tip.y -= bob * d
	var arrow := PackedVector2Array([tip, tip + Vector2(-16, -22 * d), tip + Vector2(-6, -22 * d), tip + Vector2(-6, -44 * d), tip + Vector2(6, -44 * d), tip + Vector2(6, -22 * d), tip + Vector2(16, -22 * d)])
	draw_colored_polygon(arrow, Gt.YELLOW)
	draw_polyline(arrow + PackedVector2Array([tip]), Gt.INK, 3.0)
	# 안내 말풍선
	var msg := "상점에서 새 동료를 불러 봐요!" if step == 1 else "1회 소환을 눌러요! 첫 소환은 ★4 이상 확정"
	var w := Gt.width(msg, 17) + 40.0
	var by := tip.y - 44.0 * d - (64.0 if up else -20.0)
	var box := Rect2(clampf(h.get_center().x - w / 2.0, 12.0, size.x - w - 12.0), by, w, 44)
	Gt.pbox(self, box, Gt.CREAM)
	Gt.text(self, Vector2(box.get_center().x, box.position.y + 29), msg, 17, Gt.NAVY, 1)


## 환영 선물 창: 보석 그림 + "×300" + 받기 버튼
func _draw_gift() -> void:
	var c := size / 2.0
	var panel := Rect2(c.x - minf(170.0, size.x / 2.0 - 16.0), c.y - 150, minf(340.0, size.x - 32.0), 290)
	Gt.panel(self, panel)
	Gt.title(self, Vector2(c.x, panel.position.y + 46), "환영 선물", 26, Gt.YELLOW, 1)
	Gt.text(self, Vector2(c.x, panel.position.y + 76), "모험을 시작한 용사님께 드려요", 14, Gt.NAVY_SOFT, 1, false)
	var gc := Vector2(c.x, panel.position.y + 140)
	var pulse := 0.5 + 0.5 * sin(_t * 3.0)
	draw_circle(gc, 46.0 + pulse * 6.0, Color(1, 0.6, 0.9, 0.18))
	Gt.icon(self, &"gem", gc, 70)
	Gt.sparkle(self, gc + Vector2(30, -26), 10.0 + pulse * 4.0, Color.WHITE)
	Gt.title(self, Vector2(c.x, panel.position.y + 205), "보석 ×%d" % GIFT, 24, Color("ff8ad8"), 1)
	_gift_rect = get_global_transform() * Rect2(c.x - 80, panel.end.y - 64, 160, 46)
	var b := Rect2(c.x - 80, panel.end.y - 64, 160, 46)
	Gt.pbox(self, b, Gt.YELLOW, Gt.INK, 2, true, true)
	Gt.title(self, Vector2(c.x, b.position.y + 31), "받기", 20, Color.WHITE, 1)
