class_name IconButton
extends Control
## 동그란 아이콘 버튼(전투 화면 오른쪽 위): 진한 외곽선 + 금빛 테 + 색 구슬 + 그림 + 아래 이름표.
## glyph: "gear"(설정) · "map"(지도) · "home"(로비) · "auto"(자동 사냥)

signal pressed

@export var glyph := "gear"
@export var label := ""
@export var color := Color("5b8def")

var _down := false
var dot := false  # 오른쪽 위 빨간 점


func _ready() -> void:
	custom_minimum_size = Vector2(56, 70)
	size = custom_minimum_size
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.button_index == MOUSE_BUTTON_LEFT:
		if mb.pressed:
			_down = true
		elif _down:
			_down = false
			pressed.emit()
		queue_redraw()


func _draw() -> void:
	var c := Vector2(size.x / 2.0, 26.0 + (2.0 if _down else 0.0))
	Gt.ring_button(self, c, 24.0, color, _down)
	var ink := Color.WHITE
	match glyph:
		"gear":
			for i in 8:
				var a := i * TAU / 8.0
				var d := Vector2.from_angle(a)
				draw_colored_polygon(PackedVector2Array([c + d * 9.0 + d.orthogonal() * 3.5, c + d * 15.0 + d.orthogonal() * 2.5, c + d * 15.0 - d.orthogonal() * 2.5, c + d * 9.0 - d.orthogonal() * 3.5]), ink)
			draw_circle(c, 10.5, ink)
			draw_circle(c, 4.5, color.darkened(0.2))
		"map":
			var pts := PackedVector2Array([c + Vector2(-13, -10), c + Vector2(-4, -13), c + Vector2(4, -10), c + Vector2(13, -13), c + Vector2(13, 10), c + Vector2(4, 13), c + Vector2(-4, 10), c + Vector2(-13, 13)])
			draw_colored_polygon(pts, ink)
			draw_line(c + Vector2(-4, -13), c + Vector2(-4, 10), color.darkened(0.3), 1.5)
			draw_line(c + Vector2(4, -10), c + Vector2(4, 13), color.darkened(0.3), 1.5)
			draw_circle(c + Vector2(8, -2), 3.0, Color("ff4d5e"))
		"dex":
			# 펼친 책 + 별
			draw_colored_polygon(PackedVector2Array([c + Vector2(-14, -9), c + Vector2(0, -6), c + Vector2(0, 11), c + Vector2(-14, 8)]), ink)
			draw_colored_polygon(PackedVector2Array([c + Vector2(14, -9), c + Vector2(0, -6), c + Vector2(0, 11), c + Vector2(14, 8)]), ink.darkened(0.12))
			draw_line(c + Vector2(0, -6), c + Vector2(0, 11), color.darkened(0.35), 1.5)
			Gt.star(self, c + Vector2(-7, 1), 3.5, Color("ffd54f"))
		"bag":
			# 가죽 가방: 몸통 + 덮개 + 손잡이 + 금빛 잠금
			draw_arc(c + Vector2(0, -7), 6.0, PI, TAU, 10, ink, 3.0)
			draw_rect(Rect2(c + Vector2(-12, -6), Vector2(24, 18)), ink)
			draw_rect(Rect2(c + Vector2(-12, -6), Vector2(24, 7)), color.lightened(0.35))
			draw_rect(Rect2(c + Vector2(-3, -1), Vector2(6, 6)), Color("ffd54f"))
		"auto":
			# 빙글 도는 두 화살표 + 가운데 A
			for k in 2:
				var a0 := k * PI + 0.35
				draw_arc(c, 13.0, a0, a0 + PI - 0.7, 12, ink, 3.0)
				var tip := c + Vector2.from_angle(a0 + PI - 0.7) * 13.0
				var tdir := Vector2.from_angle(a0 + PI - 0.7 + PI / 2.0)
				draw_colored_polygon(PackedVector2Array([tip + tdir * 5.0, tip + tdir.orthogonal() * 4.5, tip - tdir.orthogonal() * 4.5]), ink)
			Gt.text(self, c + Vector2(0, 5), "A", 14, ink, 1, true, 3, color.darkened(0.4))
		"home":
			draw_colored_polygon(PackedVector2Array([c + Vector2(0, -14), c + Vector2(15, 0), c + Vector2(-15, 0)]), ink)
			draw_rect(Rect2(c + Vector2(-10, -1), Vector2(20, 13)), ink)
			draw_rect(Rect2(c + Vector2(-3, 4), Vector2(6, 8)), color.darkened(0.3))
	if dot:
		draw_circle(c + Vector2(18, -18), 6.5, Gt.INK)
		draw_circle(c + Vector2(18, -18), 5.0, Color("ff3b4d"))
	if label != "":
		Gt.text(self, Vector2(size.x / 2.0, 66), label, 12, Color.WHITE, 1, true, 4, Gt.INK)
