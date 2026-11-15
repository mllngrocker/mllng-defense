class_name PetPicker
extends Control
## 펫 고르기 창: 펫 10종 칸(없는 펫은 어둡게 + 얻는 곳) → 누르면 아래에 능력 → "데리고 가기"/"두고 가기".

signal closed

const COLS := 4

var chosen: StringName
var detail: DrawBox
var go_button: GameButton
var cards: Dictionary = {}
var grid: ItemGrid
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
	panel.offset_top = 70  # 무기 창과 같은 크기
	panel.offset_bottom = -40
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
	# 보유(별 많은 순) · 미보유(별 많은 순) — 펫이 많아도 위아래로 넘겨 본다
	var by_star := func(a: StringName, b: StringName) -> bool: return Pets.rarity_of(a) > Pets.rarity_of(b)
	var owned := Pets.ids().filter(func(p: StringName) -> bool: return Save.has_pet(p))
	owned.sort_custom(by_star)
	var unowned := Pets.ids().filter(func(p: StringName) -> bool: return not Save.has_pet(p))
	unowned.sort_custom(by_star)
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	col.add_child(scroll)
	grid = ItemGrid.new()
	grid.cols = COLS
	grid.setup(owned, unowned, _paint_card, func(p: StringName) -> void:
		chosen = p
		Game.sfx(&"pickup", -12.0)
		_refresh())
	scroll.add_child(grid)
	cards = grid.cards
	for c: DrawBox in cards.values():
		c.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST

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
	if Engine.get_process_frames() % 2 == 0:
		for p in cards:
			cards[p].queue_redraw()  # 통통 튀는 펫(2프레임에 한 번)


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
	var r := Rect2(Vector2(6, 9), ci.size - Vector2(12, 20))  # 무기 카드와 같은 여백
	var owned := Save.has_pet(p)
	var sel := p == chosen
	if sel:
		r.position.y -= 5
	var bob := sin(t * 4.0 + float(p.hash() % 7)) * 2.0 if owned else 0.0
	Pets.draw_card(ci, p, r, true, not owned, bob)
	if not owned:
		Gt.lock(ci, r.get_center() + Vector2(0, -r.size.y * 0.12), 20, Color("d8d2e2"))
	if sel:
		Gt.selected_frame(ci, r, t)
	else:
		Gt.dim_other(ci, r)
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
