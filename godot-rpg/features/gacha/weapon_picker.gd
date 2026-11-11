class_name WeaponPicker
extends Control
## 무기 선택 창(화면 전체를 덮는다): 가진 무기 카드 목록 → 누르면 아래에 능력치·설명 → "장착"/"해제".
## 다른 캐릭터가 끼고 있는 무기를 장착하면 그 캐릭터에서 빼 온다.

signal closed

const COLS := 4

var char_id: StringName
var chosen: StringName
var grid: GridContainer
var detail: DrawBox
var equip_button: GameButton
var enhance_button: GameButton
var cards: Dictionary[StringName, DrawBox] = {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 40
	chosen = Save.equipped(char_id)
	var owned := Weapons.ids().filter(func(w: StringName) -> bool: return Save.has_weapon(w))
	owned.sort_custom(func(a: StringName, b: StringName) -> bool:
		return Weapons.rarity_of(a) > Weapons.rarity_of(b) or (Weapons.rarity_of(a) == Weapons.rarity_of(b) and Weapons.atk_of(a, Save.refine_of(a)) > Weapons.atk_of(b, Save.refine_of(b))))
	if chosen == &"" and not owned.is_empty():
		chosen = owned[0]

	var panel := DrawBox.new()
	panel.painter = _paint_panel
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.offset_left = 14
	panel.offset_right = -14
	panel.offset_top = 70
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
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	col.add_child(scroll)
	grid = GridContainer.new()
	grid.columns = COLS
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	grid.add_theme_constant_override(&"h_separation", 8)
	grid.add_theme_constant_override(&"v_separation", 10)
	scroll.add_child(grid)
	for w: StringName in owned:
		var card := DrawBox.new()
		card.painter = _paint_card.bind(w)
		card.custom_minimum_size = Vector2(0, 128)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card.mouse_filter = Control.MOUSE_FILTER_PASS
		var press := [Vector2.ZERO]
		card.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.button_index == MOUSE_BUTTON_LEFT:
				if mb.pressed:
					press[0] = mb.position
				elif mb.position.distance_to(press[0]) < 12.0:
					_choose(w))
		grid.add_child(card)
		cards[w] = card

	detail = DrawBox.new()
	detail.painter = _paint_detail
	detail.custom_minimum_size.y = 118
	col.add_child(detail)
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = 64
	row.add_theme_constant_override(&"separation", 10)
	col.add_child(row)
	var close := _button("닫기", Gt.Kind.WHITE)
	close.pressed.connect(_close)
	row.add_child(close)
	enhance_button = _button("강화", Gt.Kind.GREEN)
	enhance_button.sub_icon = GameButton.SubIcon.COIN
	enhance_button.pressed.connect(_on_enhance)
	row.add_child(enhance_button)
	equip_button = _button("장착", Gt.Kind.YELLOW)
	equip_button.pressed.connect(_on_equip)
	row.add_child(equip_button)
	_refresh()


func _button(text: String, kind: int) -> GameButton:
	var b := GameButton.new()
	b.label = text
	b.kind = kind
	b.font_size = 20
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return b


func _choose(w: StringName) -> void:
	chosen = w
	Game.sfx(&"pickup", -12.0)
	_refresh()


func _refresh() -> void:
	var on := chosen != &"" and Save.equipped(char_id) == chosen
	equip_button.label = "해제" if on else "장착"
	equip_button.kind = Gt.Kind.GRAY if on else Gt.Kind.YELLOW
	equip_button.disabled = chosen == &""
	equip_button.queue_redraw()
	var lv := Save.enhance_of(chosen) if chosen != &"" else 0
	enhance_button.disabled = chosen == &"" or lv >= Weapons.MAX_ENHANCE
	enhance_button.label = "강화 최대" if lv >= Weapons.MAX_ENHANCE else "강화 +%d" % (lv + 1)
	enhance_button.sublabel = "" if lv >= Weapons.MAX_ENHANCE else str(Weapons.enhance_cost(lv))
	enhance_button.queue_redraw()
	detail.queue_redraw()
	for w in cards:
		cards[w].queue_redraw()
	queue_redraw()


func _on_equip() -> void:
	if chosen == &"":
		return
	if Save.equipped(char_id) == chosen:
		Save.unequip(char_id)
		Game.sfx(&"bush", -6.0)
	else:
		Save.equip_weapon(char_id, chosen)
		Game.sfx(&"charged", -6.0, 0.0)
	_refresh()


## 골드로 강화(+8% 공격력씩, 최대 +20)
func _on_enhance() -> void:
	if chosen == &"":
		return
	if Save.try_enhance(chosen):
		Game.sfx(&"charged", -4.0, 0.0)
	else:
		Game.sfx(&"hurt", -10.0)
	_refresh()


func _close() -> void:
	closed.emit()
	queue_free()


func _gui_input(e: InputEvent) -> void:
	# 바깥(어두운 곳)을 누르면 닫는다
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		_close()


# ── 그리기 ──

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))


func _paint_panel(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Gt.CREAM)
	# 제목 띠
	var head := Rect2(r.position + Vector2(10, 10), Vector2(r.size.x - 20, 42))
	Gt.pbox(ci, head, Gt.NAVY, Gt.INK, 2, false, true)
	var data := Save.character(char_id)
	Weapons.draw_icon(ci, &"holy_sword", head.position + Vector2(24, 21), 26)
	Gt.title(ci, head.position + Vector2(44, 29), "무기 장착", 19)
	Gt.text(ci, Vector2(head.end.x - 12, head.position.y + 28), data.display_name + "에게 끼울 무기", 13, Color("ffe36b"), 2)


func _paint_card(ci: Control, w: StringName) -> void:
	var r := Rect2(Vector2(3, 5), ci.size - Vector2(6, 8))
	if w == chosen:
		Gt.pbox(ci, r.grow(3), Gt.YELLOW, Gt.INK, 2, false, false)
	Weapons.draw_card(ci, w, r, true, Save.refine_of(w))
	var holder := Save.holder_of(w)
	if holder != &"":
		# 끼고 있는 캐릭터 얼굴(오른쪽 위)
		var face := Rect2(Vector2(r.end.x - 26, r.position.y - 2), Vector2(26, 26))
		Gt.pbox(ci, face, Color.WHITE, Gt.INK, 1, false, false)
		var hd := Save.character(holder)
		var cc := hd.card_crop
		ci.draw_texture_rect_region(hd.portraits[0], face.grow(-3), Rect2(cc.position + Vector2(cc.size.x * 0.12, 0), Vector2(cc.size.x * 0.76, cc.size.x * 0.76)))
		if holder == char_id:
			var tag := Rect2(Vector2(r.position.x - 2, r.position.y + 24), Vector2(46, 20))
			Gt.tag(ci, tag, Gt.PINK)
			Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 14), "장착 중", 11, Color.WHITE, 1)


func _paint_detail(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Color.WHITE, Gt.INK, 2, false, true)
	if chosen == &"":
		Gt.text(ci, r.get_center() + Vector2(0, 6), "가진 무기가 없어요. 상점에서 무기를 뽑아 보세요!", 14, Gt.NAVY_SOFT, 1)
		return
	var w := chosen
	var refine := Save.refine_of(w)
	var icon := Rect2(r.position + Vector2(10, 10), Vector2(r.size.y - 20, r.size.y - 20))
	Weapons.draw_card(ci, w, icon, false, refine)
	var x := icon.end.x + 14
	for i in Weapons.rarity_of(w):
		Gt.star(ci, Vector2(x + 8 + i * 18, r.position.y + 20), 7)
	var enh := Save.enhance_of(w)
	Gt.text(ci, Vector2(x, r.position.y + 50), Weapons.name_of(w) + ("  +%d강" % enh if enh > 0 else "") + ("  (재련 %d)" % refine if refine > 0 else ""), 20, Gt.NAVY)
	Gt.text(ci, Vector2(x, r.position.y + 72), Weapons.desc_of(w), 12, Gt.NAVY_SOFT, 0, false)
	var y := r.position.y + 98
	Gt.icon(ci, &"sword", Vector2(x + 8, y - 5), 18)
	Gt.text(ci, Vector2(x + 20, y), "공격력 +%d" % Weapons.atk_of(w, refine, Save.enhance_of(w)), 14, Gt.NAVY)
	Gt.text(ci, Vector2(x + 130, y), "치명타 +%d%%" % roundi(Weapons.crit_of(w) * 100.0), 14, Color("e5484d"))
	var holder := Save.holder_of(w)
	if holder != &"" and holder != char_id:
		Gt.text(ci, Vector2(r.end.x - 12, r.position.y + 22), Save.character(holder).display_name + " 장착 중", 12, Gt.PINK, 2)
