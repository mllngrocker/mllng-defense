class_name GearPicker
extends Control
## 장비 선택 창(로비 아바타의 옷·신발·목걸이·반지 칸): 그 부위의 장비 4등급을 카드로 보여 준다.
## 가진 것은 등급색으로 밝게, 아직 없는 것은 어둡게. 카드를 누르면 아래에 효과·설명 → "장착"/"해제".
## 다른 캐릭터가 끼고 있는 장비는 장착할 수 없다(그 캐릭터에서 먼저 해제하거나, 출전을 바꿀 때 옮긴다).

signal closed

var char_id: StringName
var slot := "armor"
var chosen: StringName
var detail: DrawBox
var equip_button: GameButton
var cards: Dictionary[StringName, DrawBox] = {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 40
	var list := Gear.ids().filter(func(g: StringName) -> bool: return Gear.slot_of(g) == slot)
	list.sort_custom(func(a: StringName, b: StringName) -> bool: return Gear.grade_of(a) > Gear.grade_of(b))
	chosen = Save.gear_on(char_id, slot)
	if chosen == &"":
		for g: StringName in list:
			if Save.has_gear(g):
				chosen = g
				break
	if chosen == &"":
		chosen = list[0]

	var panel := DrawBox.new()
	panel.painter = _paint_panel
	panel.set_anchors_preset(Control.PRESET_CENTER)
	panel.offset_left = -256
	panel.offset_right = 256
	panel.offset_top = -250
	panel.offset_bottom = 250
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
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = 150
	row.add_theme_constant_override(&"separation", 8)
	col.add_child(row)
	for g: StringName in list:
		var card := DrawBox.new()
		card.painter = _paint_card.bind(g)
		card.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		card.mouse_filter = Control.MOUSE_FILTER_STOP
		card.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
				chosen = g
				Game.sfx(&"pickup", -12.0)
				_refresh())
		row.add_child(card)
		cards[g] = card
	detail = DrawBox.new()
	detail.painter = _paint_detail
	detail.size_flags_vertical = Control.SIZE_EXPAND_FILL
	col.add_child(detail)
	var buttons := HBoxContainer.new()
	buttons.custom_minimum_size.y = 64
	buttons.add_theme_constant_override(&"separation", 10)
	col.add_child(buttons)
	var close := _button("닫기", Gt.Kind.WHITE)
	close.pressed.connect(_close)
	buttons.add_child(close)
	equip_button = _button("장착", Gt.Kind.YELLOW)
	equip_button.pressed.connect(_on_equip)
	buttons.add_child(equip_button)
	_refresh()


func _button(text: String, kind: int) -> GameButton:
	var b := GameButton.new()
	b.label = text
	b.kind = kind
	b.font_size = 20
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return b


func _refresh() -> void:
	var on := Save.gear_on(char_id, slot) == chosen
	var have := Save.has_gear(chosen)
	var held := Save.gear_holder(chosen) != &"" and Save.gear_holder(chosen) != char_id
	equip_button.label = "해제" if on else ("착용 중" if held else ("장착" if have else "미보유"))
	equip_button.kind = Gt.Kind.GRAY if on or held or not have else Gt.Kind.YELLOW
	equip_button.disabled = not have or held
	equip_button.queue_redraw()
	detail.queue_redraw()
	for g in cards:
		cards[g].queue_redraw()


func _on_equip() -> void:
	if not Save.has_gear(chosen):
		return
	if Save.gear_on(char_id, slot) == chosen:
		Save.unequip_gear(char_id, slot)
		Game.sfx(&"bush", -6.0)
	else:
		Save.equip_gear(char_id, chosen)
		Game.sfx(&"charged", -6.0, 0.0)
	Save.save_game()
	_refresh()


func _close() -> void:
	closed.emit()
	queue_free()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))


func _paint_panel(ci: Control) -> void:
	Gt.panel(ci, Rect2(Vector2.ZERO, ci.size))
	Gt.header(ci, Vector2(20, 46), Gear.SLOT_NAMES[slot], "%s · %s" % [Gt.roman(char_id), slot.to_upper()], 22)
	Gt.text(ci, Vector2(ci.size.x - 20, 44), "몬스터·보스가 떨어뜨려요", 12, Gt.NAVY_SOFT, 2, false)


func _paint_card(ci: Control, g: StringName) -> void:
	var r := Rect2(Vector2(2, 6), ci.size - Vector2(4, 12))
	var have := Save.has_gear(g)
	if g == chosen:
		Gt.pbox(ci, r.grow(4), Gt.YELLOW, Gt.INK, 2, false, false)
	Gear.draw_card(ci, g, r, true, Save.gear_refine(g) if have else -1, not have)
	if not have:
		Gt.lock(ci, r.get_center() + Vector2(0, -r.size.y * 0.1), 22, Color("d8d2e2"))
	var holder := Save.gear_holder(g)
	if holder != &"":
		var tag := Rect2(r.position + Vector2(-2, -6), Vector2(Gt.width("착용", 11) + 16, 20))
		Gt.tag(ci, tag, Gt.PINK if holder == char_id else Gt.NAVY)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 14), "착용", 11, Color.WHITE, 1)


func _paint_detail(ci: Control) -> void:
	var r := Rect2(Vector2(0, 2), ci.size - Vector2(0, 4))
	Gt.pbox(ci, r, Gt.CREAM)
	var gc := Gear.color_of(chosen)
	var grade := Gear.grade_of(chosen)
	var tag := Rect2(r.position + Vector2(12, 12), Vector2(Gt.width(Gear.GRADE_NAMES[grade], 13) + 20, 24))
	Gt.tag(ci, tag, gc)
	Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 17), Gear.GRADE_NAMES[grade], 13, Color.WHITE, 1)
	for i in grade:
		Gt.star(ci, Vector2(tag.end.x + 16 + i * 18, tag.get_center().y), 7, gc)
	var refine := Save.gear_refine(chosen)
	Gt.text(ci, r.position + Vector2(14, 66), Gear.name_of(chosen) + (" +%d" % refine if refine > 0 else ""), 22, Gt.NAVY)
	Gt.text(ci, r.position + Vector2(14, 92), Gear.stats_text(chosen, refine), 15, gc.darkened(0.25))
	Gt.text(ci, r.position + Vector2(14, 114), Gear.desc_of(chosen), 12, Gt.NAVY_SOFT, 0, false)
	var holder := Save.gear_holder(chosen)
	var note := "같은 장비를 또 얻으면 재련 +1 (최대 +%d, 효과 +10%%씩)" % Gear.MAX_REFINE
	if not Save.has_gear(chosen):
		note = "아직 얻지 못했어요 · 높은 등급일수록 드물게 나와요"
	elif holder != &"" and holder != char_id:
		note = "%s이(가) 끼고 있어서 장착할 수 없어요 · 먼저 해제해 주세요" % Save.character(holder).display_name
	Gt.text(ci, Vector2(r.position.x + 14, r.end.y - 12), note, 11, Gt.GRAY, 0, false)
