class_name ItemGrid
extends VBoxContainer
## 고르기 창(무기·장비·펫) 공통 카드 격자: "보유 N" 칸들(별 높은 순) → "미보유 N" 칸들.
## ScrollContainer 안에 넣어 위아래로 넘긴다. 카드를 톡 누르면 on_pick(id), 끌면 스크롤.

var cols := 4
var card_h := 128.0
var cards: Dictionary = {}  # id → DrawBox


## painter: func(ci: Control, id) · on_pick: func(id)
func setup(owned: Array, unowned: Array, painter: Callable, on_pick: Callable) -> void:
	size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_theme_constant_override(&"separation", 8)
	_section("보유", owned.size())
	_grid(owned, painter, on_pick)
	if not unowned.is_empty():
		_section("미보유", unowned.size())
		_grid(unowned, painter, on_pick)


func redraw_all() -> void:
	for id in cards:
		(cards[id] as Control).queue_redraw()


func _section(title: String, n: int) -> void:
	var head := DrawBox.new()
	head.custom_minimum_size.y = 30
	head.painter = func(ci: Control) -> void:
		var y := ci.size.y - 9.0
		Gt.title(ci, Vector2(4, y), title, 16, Gt.NAVY if title == "보유" else Gt.GRAY)
		var tx := 4.0 + Gt.width(title, 16) + 8.0
		Gt.text(ci, Vector2(tx, y), "%d" % n, 13, Gt.NAVY_SOFT, 0, false)
		ci.draw_line(Vector2(tx + 30, y - 5), Vector2(ci.size.x - 4, y - 5), Color(Gt.NAVY, 0.25), 2.0)
	add_child(head)


func _grid(ids: Array, painter: Callable, on_pick: Callable) -> void:
	var grid := GridContainer.new()
	grid.columns = cols
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override(&"h_separation", 8)
	grid.add_theme_constant_override(&"v_separation", 10)
	add_child(grid)
	for id in ids:
		var card := DrawBox.new()
		card.painter = painter.bind(id)
		card.custom_minimum_size = Vector2(0, card_h)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card.mouse_filter = Control.MOUSE_FILTER_PASS
		var press := [Vector2.ZERO]
		card.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.button_index == MOUSE_BUTTON_LEFT:
				if mb.pressed:
					press[0] = mb.position
				elif mb.position.distance_to(press[0]) < 12.0:
					on_pick.call(id))
		grid.add_child(card)
		cards[id] = card
