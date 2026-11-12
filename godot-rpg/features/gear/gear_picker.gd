class_name GearPicker
extends Control
## 장비 선택 창(로비 아바타의 옷·신발·목걸이·반지 칸): 그 부위의 장비 4등급을 카드로 보여 준다.
## 가진 것은 등급색으로 밝게, 아직 없는 것은 어둡게. 카드를 누르면 아래에 효과·설명 → "장착"/"해제".
## 강화(강화석으로 재련 +1) · 분해(강화석으로) · 합성(같은 등급 3개 → 한 등급 위). 누가 끼고 있는 장비는 분해·합성 불가.
## 다른 캐릭터가 끼고 있는 장비는 장착할 수 없다(그 캐릭터에서 먼저 해제하거나, 출전을 바꿀 때 옮긴다).

signal closed

var char_id: StringName
var slot := "armor"
var chosen: StringName
var detail: DrawBox
var equip_button: GameButton
var upgrade_button: GameButton
var dismantle_button: GameButton
var synth_button: GameButton
var _toast := ""
var _toast_t := 0.0
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
	panel.offset_top = -300
	panel.offset_bottom = 300
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
	var tools := HBoxContainer.new()
	tools.custom_minimum_size.y = 58
	tools.add_theme_constant_override(&"separation", 8)
	col.add_child(tools)
	upgrade_button = _button("강화", Gt.Kind.GREEN)
	upgrade_button.font_size = 17
	upgrade_button.pressed.connect(_on_upgrade)
	tools.add_child(upgrade_button)
	dismantle_button = _button("분해", Gt.Kind.PINK)
	dismantle_button.font_size = 17
	dismantle_button.pressed.connect(_on_dismantle)
	tools.add_child(dismantle_button)
	synth_button = _button("합성", Gt.Kind.BLUE)
	synth_button.font_size = 17
	synth_button.pressed.connect(_on_synth)
	tools.add_child(synth_button)
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
	# 강화·분해·합성: 누가 끼고 있으면 분해·합성은 잠금
	var anyone := Save.gear_holder(chosen) != &""
	var maxed := Save.gear_refine(chosen) >= Gear.MAX_REFINE
	upgrade_button.disabled = not have or maxed
	upgrade_button.label = "강화 최대" if maxed else "강화 (강화석 %d)" % Save.upgrade_cost(chosen)
	dismantle_button.disabled = not have or anyone
	dismantle_button.label = "착용 중" if have and anyone else "분해 (+%d)" % (Gear.STONES_FROM[Gear.grade_of(chosen)] * (1 + Save.gear_refine(chosen)))
	var grade := Gear.grade_of(chosen)
	synth_button.disabled = not have or anyone or grade >= 4 or Save.synth_material(grade) < Gear.SYNTH_NEED
	synth_button.label = "합성 최대" if grade >= 4 else ("착용 중" if have and anyone else "합성 %d/%d" % [mini(Save.synth_material(grade), Gear.SYNTH_NEED), Gear.SYNTH_NEED])
	for b: GameButton in [upgrade_button, dismantle_button, synth_button]:
		b.queue_redraw()
	detail.queue_redraw()
	for g in cards:
		cards[g].queue_redraw()
	for c in get_children():
		if c is DrawBox:
			c.queue_redraw()  # 위쪽 강화석 수


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


func _on_upgrade() -> void:
	if Save.upgrade_gear(chosen):
		Game.sfx(&"powerup", -4.0, 0.0)
		_say("강화 성공! +%d" % Save.gear_refine(chosen))
	else:
		Game.sfx(&"hurt", -10.0)
		_say("강화석이 모자라요 (장비를 분해하면 나와요)")
	Save.save_game()
	_refresh()


func _on_dismantle() -> void:
	var n := Save.dismantle_gear(chosen)
	if n > 0:
		Game.sfx(&"hit_heavy", -4.0)
		_say("분해! 강화석 +%d" % n)
	Save.save_game()
	_refresh()


func _on_synth() -> void:
	var got := Save.synth_gear(chosen)
	if got != &"":
		Game.sfx(&"success", -4.0, 0.0)
		_say("합성 성공! [%s] %s" % [Gear.GRADE_NAMES[Gear.grade_of(got)], Gear.name_of(got)])
	Save.save_game()
	_refresh()


func _say(t: String) -> void:
	_toast = t
	_toast_t = 1.6


func _process(delta: float) -> void:
	if _toast_t > 0.0:
		_toast_t -= delta
		queue_redraw()


func _close() -> void:
	closed.emit()
	queue_free()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))
	if _toast_t > 0.0:
		var w := Gt.width(_toast, 17) + 40
		var tr := Rect2(Vector2((size.x - w) / 2.0, size.y / 2.0 - 360), Vector2(w, 44))
		Gt.pbox(self, tr, Color(Gt.NAVY, 0.95))
		Gt.title(self, Vector2(tr.get_center().x, tr.position.y + 29), _toast, 17, Color.WHITE, 1)


func _paint_panel(ci: Control) -> void:
	Gt.panel(ci, Rect2(Vector2.ZERO, ci.size))
	Gt.header(ci, Vector2(20, 46), Gear.SLOT_NAMES[slot], "%s · %s" % [Gt.roman(char_id), slot.to_upper()], 22)
	Gt.icon(ci, &"gem_yellow", Vector2(ci.size.x - 118, 38), 22)
	Gt.text(ci, Vector2(ci.size.x - 20, 44), "강화석 %d개" % Save.item_count(&"stone"), 14, Gt.NAVY, 2)


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
