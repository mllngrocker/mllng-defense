class_name ChunkyButton
extends BaseButton
## 굵은 검은 외곽선 + 아래로 두꺼운 입체 버튼. 누르면 쑥 들어간다.
## 위쪽에 아이콘(그리기 함수나 그림), 아래쪽에 글씨. 글씨만 있어도 된다.

var label := ""
var sublabel := ""
var color := Color("ffb300")
var font_size := 20
var radius := 14.0
var depth := 6.0
## 아이콘을 그리는 함수: func(ci: CanvasItem, rect: Rect2)
var icon_painter: Callable
var icon_texture: Texture2D
var icon_pixel := false  # 도트 그림이면 true(선명하게)


func _ready() -> void:
	focus_mode = Control.FOCUS_NONE
	mouse_filter = Control.MOUSE_FILTER_STOP
	for s: Signal in [button_down, button_up, mouse_entered, mouse_exited]:
		s.connect(queue_redraw)


func _draw() -> void:
	var down := get_draw_mode() == BaseButton.DRAW_PRESSED or get_draw_mode() == BaseButton.DRAW_HOVER_PRESSED
	var body := Rect2(Vector2(3, 3), size - Vector2(6, 6 + depth))
	var c := Color("9a95ad") if disabled else color
	UiKit.chunky(self, body, c, radius, 3.0, depth, down)
	if down:
		body.position.y += depth * 0.6
	var has_icon := icon_painter.is_valid() or icon_texture != null
	var text_y := body.position.y + body.size.y / 2.0 + font_size * 0.36
	if sublabel != "":
		text_y -= font_size * 0.45
	if has_icon:
		var icon_rect := Rect2(body.position + Vector2(body.size.x * 0.2, 4), Vector2(body.size.x * 0.6, body.size.y * 0.58))
		if label == "":
			icon_rect = body.grow(-6)
		if icon_painter.is_valid():
			icon_painter.call(self, icon_rect)
		else:
			if icon_pixel:
				texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
			var s := minf(icon_rect.size.x, icon_rect.size.y)
			draw_texture_rect(icon_texture, Rect2(icon_rect.get_center() - Vector2(s, s) / 2.0, Vector2(s, s)), false)
		text_y = body.end.y - 8.0
	if label != "":
		UiKit.text(self, Vector2(body.get_center().x, text_y), label, font_size, Color.WHITE if not disabled else Color(1, 1, 1, 0.7), 6, 1)
	if sublabel != "":
		UiKit.text(self, Vector2(body.get_center().x, text_y + font_size * 0.95), sublabel, int(font_size * 0.75), Color("fff3c4"), 5, 1)
