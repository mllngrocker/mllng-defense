class_name ConfirmBox
extends Control
## 예·아니오를 묻는 작은 창(화면을 어둡게 덮는다). 버튼을 누르면 answered(true/false)를 내고 닫힌다.

signal answered(yes: bool)

var title := ""
var sub := ""
var yes_label := "예"
var no_label := "아니오"


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 60
	var row := HBoxContainer.new()
	row.set_anchors_preset(Control.PRESET_CENTER)
	row.offset_left = -216
	row.offset_right = 216
	row.offset_top = 26
	row.offset_bottom = 90
	row.add_theme_constant_override(&"separation", 12)
	add_child(row)
	for spec: Array in [[no_label, Gt.Kind.WHITE, false], [yes_label, Gt.Kind.YELLOW, true]]:
		var b := GameButton.new()
		b.label = spec[0]
		b.kind = spec[1]
		b.font_size = 19
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(_answer.bind(spec[2]))
		row.add_child(b)


func _answer(yes: bool) -> void:
	answered.emit(yes)
	queue_free()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))
	var r := Rect2(size / 2.0 - Vector2(240, 120), Vector2(480, 230))
	Gt.panel(self, r)
	Gt.text(self, Vector2(size.x / 2.0, r.position.y + 62), title, 22, Gt.NAVY, 1)
	Gt.text(self, Vector2(size.x / 2.0, r.position.y + 96), sub, 13, Gt.NAVY_SOFT, 1, false)
