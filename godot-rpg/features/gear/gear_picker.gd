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
var enh_button: GameButton
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
	var list := Gear.ids().filter(func(g: StringName) -> bool: return Gear.slot_of(g) == slot and (Gear.level_of(g) == 1 or Save.has_gear(g)))  # Lv.10 이상은 가진 것만
	list.sort_custom(func(a: StringName, b: StringName) -> bool:  # 가진 것 → 높은 레벨 → 높은 등급
		if Save.has_gear(a) != Save.has_gear(b):
			return Save.has_gear(a)
		if Gear.level_of(a) != Gear.level_of(b):
			return Gear.level_of(a) > Gear.level_of(b)
		return Gear.grade_of(a) > Gear.grade_of(b))
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
	var scroll := ScrollContainer.new()  # 카드가 많으면 옆으로 넘겨 본다
	scroll.custom_minimum_size.y = 166
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	col.add_child(scroll)
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = 160
	row.add_theme_constant_override(&"separation", 8)
	scroll.add_child(row)
	for g: StringName in list:
		var card := DrawBox.new()
		card.painter = _paint_card.bind(g)
		card.custom_minimum_size.x = 124
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
	tools.add_theme_constant_override(&"separation", 10)
	col.add_child(tools)
	enh_button = _button("강화", Gt.Kind.YELLOW)  # 골드 강화
	enh_button.font_size = 17
	enh_button.pressed.connect(_on_enhance)
	tools.add_child(enh_button)
	upgrade_button = _button("재련", Gt.Kind.GREEN)
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
	upgrade_button.label = "재련 최대" if maxed else "재련"
	var e := Save.gear_enh_of(chosen)
	enh_button.disabled = not have or e >= Gear.MAX_ENH
	enh_button.label = "강화 최대" if e >= Gear.MAX_ENH else "강화 +%d" % (e + 1)
	enh_button.sublabel = "" if e >= Gear.MAX_ENH else "골드 %s" % _comma(Gear.enh_cost(chosen, e))
	enh_button.queue_redraw()
	upgrade_button.sublabel = "" if maxed else "강화석 %d" % Save.upgrade_cost(chosen)
	dismantle_button.disabled = not have or anyone
	dismantle_button.label = "착용 중" if have and anyone else "분해"
	dismantle_button.sublabel = "" if have and anyone else ("강화석 +%d" % Gear.STONES_FROM[Gear.grade_of(chosen)]) + (" · +%d 이어짐" % Save.gear_enh_of(chosen) if Save.gear_enh_of(chosen) > 0 else "")
	var grade := Gear.grade_of(chosen)
	synth_button.disabled = not have or anyone or grade >= 4 or Save.synth_material(grade) < Gear.SYNTH_NEED
	synth_button.label = "합성 최대" if grade >= 4 else ("착용 중" if have and anyone else "합성")
	synth_button.sublabel = "" if grade >= 4 or (have and anyone) else "재료 %d/%d" % [mini(Save.synth_material(grade), Gear.SYNTH_NEED), Gear.SYNTH_NEED]
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
	elif Gear.level_of(chosen) > Save.level_of(char_id):
		_say("Lv.%d부터 낄 수 있어요" % Gear.level_of(chosen))
		return
	else:
		Save.equip_gear(char_id, chosen)
		Game.sfx(&"charged", -6.0, 0.0)
	Save.save_game()
	_refresh()


func _on_enhance() -> void:
	if Save.enhance_gear(chosen):
		Game.sfx(&"powerup", -4.0, 0.0)
		_say("강화 성공! +%d" % Save.gear_enh_of(chosen))
	else:
		Game.sfx(&"hurt", -10.0)
		_say("골드가 모자라요")
	Save.save_game()
	_refresh()


static func _comma(n: int) -> String:
	var s := str(n)
	var out := ""
	while s.length() > 3:
		out = "," + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return s + out


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
		var sl := Gear.slot_of(chosen)
		_say("분해! 강화석 +%d · 강화 +%d는 다음 %s에 이어져요" % [n, int(Save.gear_carry_e.get(sl, 0)), Gear.SLOT_NAMES[sl]] if int(Save.gear_carry_e.get(sl, 0)) > 0 else "분해! 강화석 +%d" % n)
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
	if cards.has(chosen):
		cards[chosen].queue_redraw()  # 고른 카드 빛이 숨 쉬듯


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
	var r := Rect2(Vector2(6, 10), ci.size - Vector2(12, 24))
	var have := Save.has_gear(g)
	var sel := g == chosen
	if sel:
		r.position.y -= 6  # 고른 카드는 살짝 떠오른다
	Gear.draw_card(ci, g, r, true, Save.gear_enh_of(g) if have else -1, not have)
	if not have:
		Gt.lock(ci, r.get_center() + Vector2(0, -r.size.y * 0.1), 22, Color("d8d2e2"))
	if sel:
		Gt.selected_frame(ci, r, Time.get_ticks_msec() / 1000.0)
	else:
		Gt.dim_other(ci, r)
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
	var ns := Gear.stars_of(chosen)
	for i in ns:
		Gt.star(ci, Vector2(tag.end.x + 16 + i * 18, tag.get_center().y), 7, Gt.item_star(ns))
	var refine := Save.gear_refine(chosen)
	var enh := Save.gear_enh_of(chosen)
	var lvtxt := "Lv.%d  " % Gear.level_of(chosen)
	Gt.text(ci, r.position + Vector2(14, 66), lvtxt + Gear.name_of(chosen) + (" +%d" % enh if enh > 0 else "") + (" (재련 %d)" % refine if refine > 0 else ""), 20, Gt.NAVY if Gear.level_of(chosen) <= Save.level_of(char_id) else Color("c0392b"))
	Gt.text(ci, r.position + Vector2(14, 92), Gear.stats_text(chosen, refine, enh), 15, gc.darkened(0.25))
	Gt.text(ci, r.position + Vector2(14, 114), Gear.desc_of(chosen), 12, Gt.NAVY_SOFT, 0, false)
	# 세트 효과: 이 장비를 낀다고 치고 같은 세트 몇 개인지
	var sk := Gear.set_of(chosen)
	if sk != "":
		var worn := Save.gear_worn(char_id).filter(func(g: StringName) -> bool: return Gear.slot_of(g) != slot)
		worn.append(chosen)
		var n := int(Gear.set_counts(worn).get(sk, 0))
		var sy := r.position.y + 140.0
		Gt.text(ci, Vector2(r.position.x + 14, sy), "세트  %s (%d/4)" % [Gear.set_name(sk), n], 14, Color("8a4fd0"))
		for need: int in [2, 4]:
			sy += 20.0
			var on := n >= need
			Gt.text(ci, Vector2(r.position.x + 24, sy), "%d개: %s" % [need, Gear.set_text(sk, need)], 12, Color("37a35e") if on else Gt.GRAY, 0, on)
	var holder := Save.gear_holder(chosen)
	var note := "같은 장비를 또 얻으면 재련 +1 (최대 +%d, 효과 +10%%씩)" % Gear.MAX_REFINE
	if not Save.has_gear(chosen):
		note = "아직 얻지 못했어요 · 높은 등급일수록 드물게 나와요"
	elif holder != &"" and holder != char_id:
		note = "%s이(가) 끼고 있어서 장착할 수 없어요 · 먼저 해제해 주세요" % Save.character(holder).display_name
	Gt.text(ci, Vector2(r.position.x + 14, r.end.y - 12), note, 11, Gt.GRAY, 0, false)
