class_name PetPicker
extends Control
## 펫 고르기 창: 펫 10종 칸(없는 펫은 어둡게 + 얻는 곳) → 누르면 아래에 능력 → "데리고 가기"/"두고 가기".

signal closed

const COLS := 5

var chosen: StringName
var detail: DrawBox
var go_button: GameButton
var cards: Dictionary[StringName, DrawBox] = {}
var t := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 40
	chosen = StringName(Save.pet) if Save.pet != "" else Pets.ids()[0]

	var panel := DrawBox.new()
	panel.painter = _paint_panel
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.offset_left = 14
	panel.offset_right = -14
	panel.offset_top = 120
	panel.offset_bottom = -90
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(panel)

	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 16
	col.offset_right = -16
	col.offset_top = 64
	col.offset_bottom = -16
	col.add_theme_constant_override(&"separation", 10)
	panel.add_child(col)
	var grid := GridContainer.new()
	grid.columns = COLS
	grid.size_flags_vertical = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override(&"h_separation", 8)
	grid.add_theme_constant_override(&"v_separation", 10)
	col.add_child(grid)
	for p: StringName in Pets.ids():
		var card := DrawBox.new()
		card.painter = _paint_card.bind(p)
		card.custom_minimum_size = Vector2(0, 92)
		card.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card.mouse_filter = Control.MOUSE_FILTER_STOP
		card.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
				chosen = p
				Game.sfx(&"pickup", -12.0)
				_refresh())
		grid.add_child(card)
		cards[p] = card

	detail = DrawBox.new()
	detail.painter = _paint_detail
	detail.custom_minimum_size.y = 120
	detail.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	col.add_child(detail)
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = 64
	row.add_theme_constant_override(&"separation", 10)
	col.add_child(row)
	var close := GameButton.new()
	close.label = "닫기"
	close.kind = Gt.Kind.WHITE
	close.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	close.pressed.connect(_close)
	row.add_child(close)
	go_button = GameButton.new()
	go_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	go_button.pressed.connect(_on_go)
	row.add_child(go_button)
	_refresh()


func _process(delta: float) -> void:
	t += delta
	for p in cards:
		cards[p].queue_redraw()


func _refresh() -> void:
	var owned := Save.has_pet(chosen)
	var on := Save.pet == String(chosen)
	go_button.label = "두고 가기" if on else "데리고 가기"
	go_button.kind = Gt.Kind.GRAY if on else Gt.Kind.YELLOW
	go_button.disabled = not owned
	go_button.queue_redraw()
	detail.queue_redraw()


func _on_go() -> void:
	if not Save.has_pet(chosen):
		return
	Save.choose_pet(chosen)
	Game.sfx(&"charged", -6.0, 0.0)
	_refresh()


func _close() -> void:
	closed.emit()
	queue_free()


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		_close()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))


func _paint_panel(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Gt.CREAM)
	var head := Rect2(r.position + Vector2(10, 10), Vector2(r.size.x - 20, 42))
	Gt.pbox(ci, head, Gt.NAVY, Gt.INK, 2, false, true)
	Gt.title(ci, head.position + Vector2(16, 29), "펫", 19)
	Gt.text(ci, Vector2(head.end.x - 12, head.position.y + 28), "보유 %d / %d" % [Save.pets.size(), Pets.DATA.size()], 13, Color("ffe36b"), 2)


func _paint_card(ci: Control, p: StringName) -> void:
	var r := Rect2(Vector2(3, 3), ci.size - Vector2(6, 6))
	var owned := Save.has_pet(p)
	if p == chosen:
		Gt.pbox(ci, r.grow(3), Gt.YELLOW, Gt.INK, 2, false, false)
	Gt.pbox(ci, r, Color("fff4d6") if owned else Color("cfc8d6"), Gt.INK, 2, false, true)
	var bob := sin(t * 4.0 + float(p.hash() % 7)) * 2.0 if owned else 0.0
	var icon := Rect2(r.get_center() + Vector2(-24, -30 + bob), Vector2(48, 48))
	Pets.draw_icon(ci, p, icon)
	if not owned:
		ci.draw_rect(icon, Color(Gt.INK, 0.55))
		Gt.text(ci, icon.get_center() + Vector2(0, 8), "?", 22, Color.WHITE, 1)
	Gt.text(ci, Vector2(r.get_center().x, r.end.y - 6), Pets.name_of(p) if owned else "???", 11, Gt.NAVY, 1)
	if Save.pet == String(p):
		var tag := Rect2(Vector2(r.position.x - 2, r.position.y - 2), Vector2(34, 18))
		Gt.tag(ci, tag, Gt.PINK)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 13), "동행", 10, Color.WHITE, 1)


func _paint_detail(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Color.WHITE, Gt.INK, 2, false, true)
	var p := chosen
	var icon := Rect2(r.position + Vector2(10, 10), Vector2(r.size.y - 20, r.size.y - 20))
	Gt.pbox(ci, icon, Color("fff4d6"), Gt.INK, 2, false, false)
	Pets.draw_icon(ci, p, icon.grow(-8))
	var x := icon.end.x + 14
	var owned := Save.has_pet(p)
	Gt.text(ci, Vector2(x, r.position.y + 32), Pets.name_of(p) if owned else "아직 만나지 못한 펫", 20, Gt.NAVY)
	Gt.text(ci, Vector2(x, r.position.y + 58), "능력: " + Pets.bonus_text(p), 14, Color("e5484d"))
	Gt.text(ci, Vector2(x, r.position.y + 80), "공격: 용사 공격력의 %d%%로 가까운 적을 문다" % roundi(Pets.power_of(p) * 100.0), 12, Gt.NAVY_SOFT, 0, false)
	Gt.text(ci, Vector2(x, r.position.y + 102), "얻는 곳: " + Pets.source_of(p), 12, Gt.NAVY_SOFT, 0, false)
