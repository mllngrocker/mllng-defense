class_name IntroScreen
extends Control
## 처음 시작: 1) 용사 이름 정하기 → 2) 시로·미즈하·카라 중 함께 떠날 동료 고르기.
## 고를 때 일러스트·속성·공격 방식·스킬·능력치 막대와 걷는 모습(예시)을 보여 준다.
## rename_only면 이름만 바꾼다(로비 왼쪽 위 이름표를 눌렀을 때, 예전 세이브).

signal finished

const NAME_MIN := 2
const NAME_MAX := 8

var rename_only := false
var step := 0  # 0 이름 · 1 동료
var pick: StringName = Save.STARTERS[0]
var t := 0.0
var _error := ""
var _edit: LineEdit
var _ok: GameButton
var _cards: Array[DrawBox] = []
var _preview: DrawBox
var _stage_box: SubViewportContainer
var _stage_vp: SubViewport
var _stage: DemoStage
var _stage_for: StringName = &""


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 70
	_edit = LineEdit.new()
	_edit.max_length = NAME_MAX
	_edit.placeholder_text = "이름 (2~8자)"
	_edit.alignment = HORIZONTAL_ALIGNMENT_CENTER
	_edit.text = str(Save.settings.get("nick", ""))
	_edit.add_theme_font_size_override(&"font_size", 26)
	_edit.add_theme_color_override(&"font_color", Gt.NAVY)
	_edit.add_theme_color_override(&"font_placeholder_color", Gt.GRAY)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color("fffaf0")
	sb.border_color = Gt.INK
	sb.set_border_width_all(3)
	sb.set_corner_radius_all(10)
	sb.content_margin_left = 12
	sb.content_margin_right = 12
	_edit.add_theme_stylebox_override(&"normal", sb)
	_edit.add_theme_stylebox_override(&"focus", sb)
	_edit.text_changed.connect(func(_s: String) -> void:
		_error = ""
		queue_redraw())
	_edit.text_submitted.connect(func(_s: String) -> void: _next())
	add_child(_edit)
	_ok = GameButton.new()
	_ok.kind = Gt.Kind.YELLOW
	_ok.font_size = 21
	_ok.pressed.connect(_next)
	add_child(_ok)
	for id in Save.STARTERS:
		var c := DrawBox.new()
		c.painter = _paint_card.bind(id)
		c.mouse_filter = Control.MOUSE_FILTER_STOP
		c.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
				pick = id
				Game.sfx(&"pickup", -10.0)
				_refresh())
		add_child(c)
		_cards.append(c)
	_preview = DrawBox.new()
	_preview.painter = _paint_preview
	_preview.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_preview)
	# 예시 무대(푸른 초원에서 공격·스킬): 진짜 전투를 작게 돌린다
	_stage_box = SubViewportContainer.new()
	_stage_box.stretch = true
	_stage_box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_stage_box.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	add_child(_stage_box)
	_stage_vp = SubViewport.new()
	_stage_vp.canvas_item_default_texture_filter = Viewport.DEFAULT_CANVAS_ITEM_TEXTURE_FILTER_NEAREST
	_stage_box.add_child(_stage_vp)
	resized.connect(_layout)
	_layout()
	_refresh()


func _process(delta: float) -> void:
	t += delta
	if step == 1 and _stage_for != pick:
		_stage_for = pick
		if _stage:
			_stage.queue_free()
		_stage = DemoStage.new()
		_stage.character = Save.character(pick)
		_stage_vp.add_child(_stage)


func _layout() -> void:
	var w := size.x
	var h := size.y
	_edit.size = Vector2(minf(360.0, w - 80.0), 56)
	_edit.position = Vector2((w - _edit.size.x) / 2.0, h * 0.42)
	var cw := minf(150.0, (w - 60.0) / 3.0)
	for i in _cards.size():
		_cards[i].size = Vector2(cw, cw * 1.3)
		_cards[i].position = Vector2(w / 2.0 + (i - 1) * (cw + 12.0) - cw / 2.0, 92.0)
	var top := 92.0 + cw * 1.3 + 20.0
	_preview.position = Vector2(20, top)
	_preview.size = Vector2(w - 40.0, maxf(200.0, h - top - 110.0))
	_stage_box.position = _preview.position + Vector2(14, 14)
	_stage_box.size = Vector2(_preview.size.x - 28.0, _preview.size.y * 0.6)
	_ok.size = Vector2(minf(320.0, w - 80.0), 64)
	_ok.position = Vector2((w - _ok.size.x) / 2.0, h * 0.55 if step == 0 else h - 92.0)


func _refresh() -> void:
	_edit.visible = step == 0
	_preview.visible = step == 1
	_stage_box.visible = step == 1
	for c in _cards:
		c.visible = step == 1
		c.queue_redraw()
	if step == 0:
		_ok.label = "이 이름으로 할게요" if rename_only else "정했어요"
	else:
		_ok.label = "%s와 함께 떠나기" % Save.character(pick).display_name
	_ok.queue_redraw()
	_layout()
	queue_redraw()


func _next() -> void:
	if step == 0:
		var nick := _edit.text.strip_edges()
		if nick.length() < NAME_MIN:
			_error = "이름은 %d자 이상이어야 해요" % NAME_MIN
			Game.sfx(&"hurt", -12.0)
			queue_redraw()
			return
		Save.settings["nick"] = nick
		if rename_only:
			Save.save_game()
			Game.sfx(&"success", -8.0)
			finished.emit()
			queue_free()
			return
		step = 1
		_edit.release_focus()
		DisplayServer.virtual_keyboard_hide()
		Game.sfx(&"pickup", -8.0)
		_refresh()
		return
	Save.start_with(pick)
	Game.sfx(&"success", -6.0)
	finished.emit()
	queue_free()


func _draw() -> void:
	# 밤하늘 남색 + 별
	Gt.grad(self, Rect2(Vector2.ZERO, size), Color("0b1426"), Color("1d2c4d"))
	for i in 46:
		var p := Vector2(fmod(i * 137.0, size.x), fmod(i * 89.0 + 31.0, size.y * 0.9))
		draw_circle(p, 1.0 + 0.8 * fmod(i * 0.37, 1.0), Color(1, 1, 1, 0.25 + 0.35 * fmod(i * 0.53, 1.0)))
	var cx := size.x / 2.0
	if step == 0:
		var r := Rect2(Vector2(cx - minf(220.0, size.x / 2.0 - 20.0), size.y * 0.26), Vector2(minf(440.0, size.x - 40.0), size.y * 0.42))
		Gt.panel(self, r)
		Gt.text(self, Vector2(cx, r.position.y + 58), "이름을 바꿀까요?" if rename_only else "용사님의 이름은?", 26, Gt.NAVY, 1)
		Gt.text(self, Vector2(cx, r.position.y + 90), "모험 내내 이 이름으로 불려요 (2~8자)", 14, Gt.NAVY_SOFT, 1, false)
		if _error != "":
			Gt.text(self, Vector2(cx, size.y * 0.42 + 84), _error, 14, Color("e5484d"), 1)
	else:
		Gt.text(self, Vector2(cx, 44), "%s님, 함께 떠날 동료를 골라 주세요" % str(Save.settings.get("nick", "")), 20, Color.WHITE, 1, true, 5, Gt.INK)
		Gt.text(self, Vector2(cx, 72), "나머지 동료도 모험하며 소환으로 만날 수 있어요", 13, Color("cfd8ec"), 1, false)


func _paint_card(ci: Control, id: StringName) -> void:
	var r := Rect2(Vector2(6, 6), ci.size - Vector2(12, 12))
	var data := Save.character(id)
	var on := id == pick
	if on:
		Gt.round_line(ci, r.grow(5.0), 10, Gt.YELLOW, 4.0)
	Gt.char_card(ci, data, r, true, true)
	if not on:
		Gt.pbox(ci, r, Color(0, 0, 0, 0.35), Color(0, 0, 0, 0), 2, false, false)


## 예시: 위쪽은 초원 무대(자식 SubViewport), 아래에 속성·공격 방식·스킬·능력치 막대
func _paint_preview(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	var data := Save.character(pick)
	Gt.panel(ci, r)
	var stage := Rect2(Vector2(14, 14), Vector2(r.size.x - 28.0, r.size.y * 0.6))
	Gt.round_line(ci, stage.grow(2.0), 8, Gt.INK, 3.0)
	var x0 := 18.0
	var y := stage.end.y + 34.0
	Gt.text(ci, Vector2(x0, y), data.display_name, 24, Gt.NAVY)
	Gt.text(ci, Vector2(x0 + Gt.width(data.display_name, 24) + 8, y), data.title, 13, Gt.NAVY_SOFT, 0, false)
	Gt.element_badge(ci, Vector2(r.end.x - 170, y - 6), 8.0, data.element)
	Gt.text(ci, Vector2(r.end.x - 156, y), "%s · %s" % [CharacterData.ELEMENT_NAMES[data.element], CharacterData.ATTACK_NAMES[data.attack_kind]], 13, Gt.NAVY)
	y += 32.0
	SkillTree.draw_icon(ci, data.id, "a1", Rect2(Vector2(x0, y - 22), Vector2(30, 30)))
	Gt.text(ci, Vector2(x0 + 38, y - 6), data.skill_name, 15, Color("c0392b"))
	for line in _wrap(data.skill_desc, r.size.x - x0 - 60.0, 12):
		y += 16.0
		Gt.text(ci, Vector2(x0 + 38, y - 4), line, 12, Gt.NAVY_SOFT, 0, false)
	y += 20.0
	# 능력치 막대(세 동료 중 가장 높은 값 기준)
	var stats := [["공격", "base_atk"], ["체력", "base_hp"], ["속도", "move_speed"]]
	for s: Array in stats:
		var top := 0.0
		for id in Save.STARTERS:
			top = maxf(top, float(Save.character(id).get(s[1])))
		var v := float(data.get(s[1]))
		Gt.text(ci, Vector2(x0, y + 12), s[0], 13, Gt.NAVY)
		Gt.bar(ci, Rect2(x0 + 40, y, r.size.x - x0 - 58, 14), v / maxf(top, 1.0), Color("e5484d") if s[0] == "공격" else (Color("37c96e") if s[0] == "체력" else Gt.BLUE))
		y += 22.0


func _wrap(s: String, width: float, fs: int) -> PackedStringArray:
	var out := PackedStringArray()
	var line := ""
	for word in s.split(" "):
		var trial := word if line == "" else line + " " + word
		if Gt.width(trial, fs, false) > width and line != "":
			out.append(line)
			line = word
		else:
			line = trial
	if line != "":
		out.append(line)
	return out
