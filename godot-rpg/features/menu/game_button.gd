class_name GameButton
extends BaseButton
## 로비용 도트 버튼(가디언 테일즈풍). 누르면 두께만큼 쑥 들어간다.
## label(큰 글씨) 아래 sublabel(작은 글씨)을 둘 수 있고, sub_icon으로 앞에 동전·보석을 붙인다.

enum SubIcon { NONE, COIN, GEM }

var label := ""
var sublabel := ""
var sublabel_color := Color.TRANSPARENT  # 비우면 글씨색
var kind: int = Gt.Kind.YELLOW
var font_size := 20
var sub_icon: int = SubIcon.NONE


func _ready() -> void:
	focus_mode = Control.FOCUS_NONE
	mouse_filter = Control.MOUSE_FILTER_STOP
	for s: Signal in [button_down, button_up, mouse_entered, mouse_exited]:
		s.connect(queue_redraw)


func _draw() -> void:
	var down := get_draw_mode() == BaseButton.DRAW_PRESSED or get_draw_mode() == BaseButton.DRAW_HOVER_PRESSED
	var r := Rect2(Vector2(1, 1), size - Vector2(2, 2))
	var k: int = Gt.Kind.GRAY if disabled else kind
	Gt.button(self, r, k, down)
	# 글씨는 버튼 윗면(두께 제외) 가운데에
	var face := Rect2(r.position, r.size - Vector2(0, Gt.PX * 2.0))
	if down:
		face.position.y += Gt.PX * 1.4
	var tc: Color = Gt.kind_colors(k)[3]
	var white := tc == Color.WHITE
	var cx := face.get_center().x
	var cy := face.get_center().y
	if sublabel == "":
		_text(Vector2(cx, cy + font_size * 0.36), label, font_size, tc, white)
		return
	_text(Vector2(cx, cy + font_size * 0.36 - font_size * 0.45), label, font_size, tc, white)
	var fs := int(font_size * 0.72)
	var sc := sublabel_color if sublabel_color.a > 0.0 else tc
	var icon_w := fs + 4.0 if sub_icon != SubIcon.NONE else 0.0
	var tw := Gt.width(sublabel, fs)
	var left := cx - (tw + icon_w) / 2.0
	var sy := cy + font_size * 0.36 + fs * 0.62
	match sub_icon:
		SubIcon.COIN:
			Gt.coin(self, Vector2(left + fs * 0.45, sy - fs * 0.36), fs * 0.55)
		SubIcon.GEM:
			Gt.gem(self, Vector2(left + fs * 0.45, sy - fs * 0.36), fs * 0.55)
	Gt.text(self, Vector2(left + icon_w, sy), sublabel, fs, sc, 0, true, 4 if white else 0, Gt.INK)


func _text(pos: Vector2, s: String, fs: int, color: Color, outlined: bool) -> void:
	if outlined:
		Gt.title(self, pos, s, fs, color, 1)
	else:
		Gt.text(self, pos, s, fs, color, 1)
