class_name SkillWindow
extends Control
## 스킬 창(로비 아바타의 스킬 칸을 누르면): 캐릭터별 스킬 트리.
## 위: 액티브 줄(고유기 → 두 번째 → 오의), 그 아래 상위 기술 줄(4·5·6번), 아래: 패시브(공격 → 스킬 숙련, 체력, 급소). 화살표는 앞선 스킬.
## 액티브는 6개 중 3개를 아래 네모 칸 3개에 끼운다: 스킬을 끌어다 칸에 놓거나, 스킬을 고른 뒤 칸을 누른다(전투의 스킬 버튼 3개).
## 노드를 누르면 아래에 설명, "올리기"로 스킬 포인트 1점 사용, "한번에 찍기"로 남은 포인트를 정해진 순서로 한꺼번에.

signal closed

const NODE := 62.0

var char_id: StringName
var chosen := "a1"
var tree: DrawBox
var detail: DrawBox
var up_button: GameButton
var all_button: GameButton
var slot_bar: DrawBox
var drag_layer: DrawBox
var _drag := ""  # 끌고 있는 스킬
var _drag_pos := Vector2.ZERO  # 끄는 손가락 자리(창 기준)
var _press_pos := Vector2.ZERO
var t := 0.0
var _toast := ""
var _toast_t := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 40
	var panel := DrawBox.new()
	panel.painter = _paint_panel
	panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	panel.offset_left = 12
	panel.offset_right = -12
	panel.offset_top = 40
	panel.offset_bottom = -30
	panel.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(panel)
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 14
	col.offset_right = -14
	col.offset_top = 62
	col.offset_bottom = -14
	col.add_theme_constant_override(&"separation", 8)
	panel.add_child(col)

	tree = DrawBox.new()
	tree.painter = _paint_tree
	tree.size_flags_vertical = Control.SIZE_EXPAND_FILL
	tree.mouse_filter = Control.MOUSE_FILTER_STOP
	tree.gui_input.connect(_on_tree_input)
	col.add_child(tree)

	detail = DrawBox.new()
	detail.painter = _paint_detail
	detail.custom_minimum_size.y = 128
	col.add_child(detail)

	slot_bar = DrawBox.new()  # 전투에 끼운 스킬 네모 칸 3개
	slot_bar.painter = _paint_slots
	slot_bar.custom_minimum_size.y = 92
	slot_bar.mouse_filter = Control.MOUSE_FILTER_STOP
	slot_bar.gui_input.connect(_on_slot_input)
	col.add_child(slot_bar)
	var row1 := _row(col)
	up_button = _button(row1, "올리기", Gt.Kind.YELLOW, _on_up)
	all_button = _button(row1, "한번에 찍기", Gt.Kind.GREEN, _on_all)
	var row2 := _row(col)
	_button(row2, "닫기", Gt.Kind.WHITE, _close)
	drag_layer = DrawBox.new()  # 끌고 있는 스킬 그림(맨 위)
	drag_layer.painter = _paint_drag
	drag_layer.set_anchors_preset(Control.PRESET_FULL_RECT)
	drag_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(drag_layer)
	_refresh()


func _row(parent: Control) -> HBoxContainer:
	var r := HBoxContainer.new()
	r.custom_minimum_size.y = 56
	r.add_theme_constant_override(&"separation", 8)
	parent.add_child(r)
	return r


func _button(parent: Control, text: String, kind: int, cb: Callable) -> GameButton:
	var b := GameButton.new()
	b.label = text
	b.kind = kind
	b.font_size = 16
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.pressed.connect(cb)
	parent.add_child(b)
	return b


func _process(delta: float) -> void:
	t += delta
	_toast_t = maxf(_toast_t - delta, 0.0)
	tree.queue_redraw()
	queue_redraw()


func _refresh() -> void:
	var block := Save.skill_block(char_id, chosen)
	up_button.disabled = block != ""
	up_button.label = "올리기 (1포인트)"
	all_button.disabled = Save.skill_points(char_id) <= 0
	all_button.sublabel = "남은 %d포인트" % Save.skill_points(char_id)
	slot_bar.queue_redraw()
	for b: GameButton in [up_button, all_button]:
		b.queue_redraw()
	detail.queue_redraw()


func _say(s: String) -> void:
	_toast = s
	_toast_t = 1.8


func _on_up() -> void:
	if Save.learn_skill(char_id, chosen):
		Game.sfx(&"charged", -4.0, 0.0)
		_say("%s Lv.%d!" % [SkillTree.info(char_id, chosen)["name"], Save.skill_level(char_id, chosen)])
	else:
		_say(Save.skill_block(char_id, chosen))
	_refresh()


## 한번에 찍기: 고유기 → 패시브 → 2번째 → 패시브 → 오의 → 남은 건 패시브 고르게
func _on_all() -> void:
	var n := Save.auto_skill(char_id)
	if n > 0:
		Game.sfx(&"charged", -4.0, 0.0)
		_say("%d포인트를 한번에 찍었어요" % n)
	else:
		_say("더 찍을 수 있는 스킬이 없어요")
	_refresh()


func _close() -> void:
	closed.emit()
	queue_free()


# ── 트리 ──

func _node_rect(cell: Vector2i) -> Rect2:
	var w := tree.size.x
	var gap := (w - 3 * NODE) / 4.0
	var y0 := 34.0 + cell.y * (NODE + 38.0) + (20.0 if cell.y >= 2 else 0.0)
	return Rect2(Vector2(gap + cell.x * (NODE + gap), y0), Vector2(NODE, NODE))


func _on_tree_input(e: InputEvent) -> void:
	var mm := e as InputEventMouseMotion
	if mm and _drag != "":
		_drag_pos = tree.global_position - global_position + mm.position
		drag_layer.queue_redraw()
		slot_bar.queue_redraw()
		return
	var mb := e as InputEventMouseButton
	if not (mb and mb.button_index == MOUSE_BUTTON_LEFT):
		return
	if not mb.pressed:
		if _drag != "":  # 놓은 자리가 칸이면 끼운다
			var k := _slot_at(tree.global_position + mb.position - slot_bar.global_position)
			if k >= 0:
				_equip(k, _drag)
			_drag = ""
			drag_layer.queue_redraw()
			slot_bar.queue_redraw()
		return
	for row: Array in SkillTree.LAYOUT:
		if _node_rect(row[1]).grow(6).has_point(mb.position):
			chosen = row[0]
			Game.sfx(&"pickup", -12.0)
			# 배운 액티브는 끌어서 칸에 끼울 수 있다
			if chosen.begins_with("a") and Save.skill_level(char_id, chosen) > 0:
				_drag = chosen
				_drag_pos = tree.global_position - global_position + mb.position
			_refresh()
			return


# ── 끼운 칸 ──

func _slot_rect(k: int) -> Rect2:
	var sz := 64.0
	var gap := 26.0
	var x0 := (slot_bar.size.x - (sz * 3 + gap * 2)) / 2.0
	return Rect2(Vector2(x0 + k * (sz + gap), 6), Vector2(sz, sz))


func _slot_at(p: Vector2) -> int:
	for k in 3:
		if _slot_rect(k).grow(10).has_point(p):
			return k
	return -1


func _equip(k: int, node: String) -> void:
	Save.set_slot(char_id, k, node)
	Game.sfx(&"charged", -6.0, 0.0)
	_say("%s → %d번 칸" % [SkillTree.info(char_id, node)["name"], k + 1])
	_refresh()


## 칸을 누르면: 고른 액티브(배운 것)를 그 칸에 끼운다
func _on_slot_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if not (mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT):
		return
	var k := _slot_at(mb.position)
	if k < 0:
		return
	if not chosen.begins_with("a"):
		_say("위에서 액티브 스킬을 골라 끌어다 놓아요")
	elif Save.skill_level(char_id, chosen) <= 0:
		_say("아직 배우지 않은 스킬이에요")
	else:
		_equip(k, chosen)


func _paint_slots(ci: Control) -> void:
	var sl := Save.slots_of(char_id)
	var hover := _slot_at(_drag_pos - (slot_bar.global_position - global_position)) if _drag != "" else -1
	Gt.text(ci, Vector2(10, 18), "전투 스킬", 12, Color("9fd4ff"))
	for k in 3:
		var r := _slot_rect(k)
		var glow := k == hover
		Gt.pbox(ci, r.grow(4), Color("ffd54f") if glow else Color("e8c06a"), Gt.INK, 2, false, true)
		ci.draw_rect(r, Color("1f2f4a"))
		var node: String = sl[k]
		if Save.skill_level(char_id, node) > 0:
			SkillTree.draw_icon(ci, char_id, node, r.grow(-3))
		else:
			Gt.lock(ci, r.get_center(), 24, Color(1, 1, 1, 0.4))
		var bc := r.position + Vector2(2, 2)
		ci.draw_circle(bc, 11.0, Gt.INK)
		ci.draw_circle(bc, 9.0, Color("ff5d8f"))
		Gt.text(ci, bc + Vector2(0, 5), str(k + 1), 13, Color.WHITE, 1)
		Gt.text(ci, Vector2(r.get_center().x, r.end.y + 16), SkillTree.info(char_id, node)["name"], 11, Color("fff3c4"), 1, true, 3, Gt.INK)
		if glow:
			ci.draw_rect(r.grow(2), Color(1, 0.9, 0.4, 0.35))


func _paint_drag(ci: Control) -> void:
	if _drag == "":
		return
	var r := Rect2(_drag_pos - Vector2(30, 30), Vector2(60, 60))
	ci.draw_rect(r.grow(3), Color(Gt.INK, 0.7))
	SkillTree.draw_icon(ci, char_id, _drag, r)


func _paint_panel(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Color("1f2f4a"))
	var head := Rect2(r.position + Vector2(10, 10), Vector2(r.size.x - 20, 42))
	Gt.pbox(ci, head, Gt.NAVY, Gt.INK, 2, false, true)
	Gt.icon(ci, &"book", head.position + Vector2(24, 21), 26)
	var d := Save.character(char_id)
	Gt.title(ci, head.position + Vector2(44, 29), "스킬 · " + d.display_name, 19)
	Gt.text(ci, Vector2(head.end.x - 12, head.position.y + 28), "스킬 포인트  %d" % Save.skill_points(char_id), 16, Color("ffe36b"), 2)


func _paint_tree(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Color("2c4466"), Color("6fa8d8"), 2, false, false)
	# 줄 이름
	Gt.text(ci, Vector2(12, 24), "액티브 스킬", 13, Color("9fd4ff"))
	Gt.text(ci, Vector2(12, _node_rect(Vector2i(0, 2)).position.y - 10), "패시브 스킬", 13, Color("9fd4ff"))
	# 연결선(밝은 하늘색, 앞선 스킬을 충분히 올렸으면 빛난다)
	for row: Array in SkillTree.LAYOUT:
		if row[2] == "":
			continue
		var from := _node_rect(_cell_of(row[2]))
		var to := _node_rect(row[1])
		var ok := Save.skill_level(char_id, row[2]) >= int(row[3])
		var col := Color("5ff0ff") if ok else Color("5f7894")
		if is_equal_approx(from.position.x, to.position.x):  # 위 → 아래(상위 기술)
			var a := Vector2(from.get_center().x + 22, from.end.y + 4)
			var b := Vector2(to.get_center().x + 22, to.position.y - 4)
			ci.draw_line(a, b, col, 4.0)
			ci.draw_colored_polygon(PackedVector2Array([b, b + Vector2(-6, -9), b + Vector2(6, -9)]), col)
			continue
		var a := Vector2(from.end.x + 2, from.get_center().y)
		var b := Vector2(to.position.x - 2, to.get_center().y)
		ci.draw_line(a, b, col, 4.0)
		ci.draw_colored_polygon(PackedVector2Array([b, b + Vector2(-9, -6), b + Vector2(-9, 6)]), col)
	for row: Array in SkillTree.LAYOUT:
		_draw_node(ci, row[0], _node_rect(row[1]))
	if _toast_t > 0.0:
		var w := Gt.width(_toast, 14) + 30
		var tr := Rect2(Vector2((r.size.x - w) / 2.0, r.end.y - 40), Vector2(w, 30))
		Gt.pbox(ci, tr, Color(Gt.INK, 0.85), Gt.INK, 2, false, false)
		Gt.text(ci, Vector2(tr.get_center().x, tr.position.y + 21), _toast, 14, Color.WHITE, 1)


func _cell_of(node: String) -> Vector2i:
	for row: Array in SkillTree.LAYOUT:
		if row[0] == node:
			return row[1]
	return Vector2i.ZERO


func _draw_node(ci: Control, node: String, r: Rect2) -> void:
	var lv := Save.skill_level(char_id, node)
	var cap := Save.skill_cap(char_id, node)
	var req := SkillTree.requires(node)
	var locked: bool = lv == 0 and SkillTree.gate(char_id, node) != ""
	if node == chosen:
		Gt.round_grad(ci, r.grow(6), 8, Color(1, 0.9, 0.4, 0.5 + 0.2 * sin(t * 5.0)), Color(1, 0.7, 0.2, 0.3))
	Gt.pbox(ci, r.grow(3), Color("e8c06a") if lv > 0 else Color("6a7a90"), Gt.INK, 2, false, false)
	SkillTree.draw_icon(ci, char_id, node, r.grow(-2), lv <= 0)
	if locked:
		ci.draw_rect(r.grow(-2), Color(Gt.INK, 0.5))
		Gt.lock(ci, r.get_center(), 28, Color("ffd54f"))
	# 레벨 x/상한
	var lt := "%d/%d" % [lv, cap]
	Gt.text(ci, Vector2(r.get_center().x, r.end.y + 18), lt, 14, Color("fff3c4") if lv > 0 else Color("a9b8cc"), 1, true, 3, Gt.INK)
	if node == "a3":
		Gt.text(ci, Vector2(r.get_center().x, r.position.y - 6), "오의", 12, Color("ff9ec8"), 1, true, 3, Gt.INK)
	var k := Save.slots_of(char_id).find(node)
	if k >= 0:  # 전투에 끼운 칸 번호
		var bc := r.position + Vector2(2, 2)
		ci.draw_circle(bc, 11.0, Gt.INK)
		ci.draw_circle(bc, 9.0, Color("ff5d8f"))
		Gt.text(ci, bc + Vector2(0, 5), str(k + 1), 13, Color.WHITE, 1)


func _paint_detail(ci: Control) -> void:
	var r := Rect2(Vector2.ZERO, ci.size)
	Gt.pbox(ci, r, Gt.CREAM, Gt.INK, 2, false, true)
	var info := SkillTree.info(char_id, chosen)
	var lv := Save.skill_level(char_id, chosen)
	var icon := Rect2(r.position + Vector2(12, 14), Vector2(64, 64))
	SkillTree.draw_icon(ci, char_id, chosen, icon, lv <= 0)
	var x := icon.end.x + 14
	Gt.text(ci, Vector2(x, r.position.y + 32), "%s  Lv.%d" % [info["name"], lv], 19, Gt.NAVY)
	Gt.text(ci, Vector2(x, r.position.y + 56), info["desc"], 13, Gt.NAVY_SOFT, 0, false)
	var effect := ""
	if info["active"]:
		effect = "피해 ×%.2f · 재사용 %.1f초 · 마나 %d" % [SkillTree.power(char_id, chosen), SkillTree.cooldown(char_id, chosen), SkillCaster.mp_cost(chosen, Save.character(char_id).attack_kind)]
	else:
		effect = "지금 +%d%% → 다음 +%d%%" % [int(info["per"]) * lv, int(info["per"]) * (lv + 1)]
	Gt.text(ci, Vector2(x, r.position.y + 80), effect, 13, Color("c0392b"))
	var block := Save.skill_block(char_id, chosen)
	if block != "":
		Gt.text(ci, Vector2(x, r.position.y + 104), "· " + block, 12, Gt.NAVY_SOFT, 0, false)
	Gt.text(ci, Vector2(r.end.x - 12, r.end.y - 10), "R·F 키 / 오른쪽 아래 작은 버튼으로 2·3번 스킬", 11, Gt.NAVY_SOFT, 2, false)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))
