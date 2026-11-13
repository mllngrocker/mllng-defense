extends Control
## 휴대폰 터치 조작: 왼쪽 아래를 누른 채 끌면 조이스틱, 오른쪽 아래 큰 버튼은 공격(꾹 누르기 지원), 작은 버튼은 구르기.
## 터치를 입력 동작(move_*, attack, dash)으로 바꿔 준다. PC에서는 마우스 클릭도 터치로 받는다.

const JOY_RADIUS := 80.0  # 조이스틱(콘솔) 크게
const DEAD_ZONE := 0.12
const FULL_AT := 0.55  # 이만큼만 밀어도 최고 속도
const ATTACK_R := 66.0
const DASH_R := 46.0
const SKILL_R := 42.0

var joy_index := -1
var joy_base := Vector2.ZERO
var joy_pos := Vector2.ZERO
var button_touches: Dictionary[int, StringName] = {}
var _was_cooling := false


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	set_anchors_preset(Control.PRESET_FULL_RECT)


func attack_center() -> Vector2:
	return size - Vector2(104, 162)


func dash_center() -> Vector2:
	return attack_center() + Vector2(-94, 80)


## 스킬 동그라미 3개는 공격 버튼을 둘러 반원으로(왼쪽 → 왼쪽 위 → 위)
func skill_center() -> Vector2:
	return attack_center() + Vector2(-126, -6)


## 스킬 2·3(배운 경우만 보인다)
func skill_center_of(node: String) -> Vector2:
	match node:
		"a2":
			return attack_center() + Vector2(-92, -96)
		"a3":
			return attack_center() + Vector2(0, -132)
	return skill_center()


func _skill_r(_node: String) -> float:
	return 38.0


func _has(node: String) -> bool:
	var p := _player()
	return p != null and p.skills != null and p.skills.has_skill(node)


func joy_home() -> Vector2:
	return Vector2(138, size.y - 172)


func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var touch := event as InputEventScreenTouch
		if touch.pressed:
			_on_touch_down(touch.index, touch.position)
		else:
			_on_touch_up(touch.index)
		queue_redraw()
	elif event is InputEventScreenDrag:
		var drag := event as InputEventScreenDrag
		if drag.index == joy_index:
			joy_pos = drag.position  # 받침은 처음 누른 자리에 고정, 방향만 바뀐다
			_apply_joystick()
			queue_redraw()


func _on_touch_down(index: int, pos: Vector2) -> void:
	if pos.distance_to(attack_center()) < ATTACK_R * 1.25:
		_press_button(index, &"attack")
	elif pos.distance_to(dash_center()) < DASH_R * 1.3:
		_press_button(index, &"dash")
	elif pos.distance_to(skill_center()) < _skill_r("a1") * 1.35:
		_press_button(index, &"skill")
	elif pos.distance_to(skill_center_of("a2")) < _skill_r("a2") * 1.35:
		_press_button(index, &"skill2")
	elif pos.distance_to(skill_center_of("a3")) < _skill_r("a3") * 1.35:
		_press_button(index, &"skill3")
	elif joy_index == -1 and pos.x < size.x * 0.6 and pos.y > size.y * 0.3:
		joy_index = index
		joy_base = pos
		joy_pos = pos
		_apply_joystick()


func _on_touch_up(index: int) -> void:
	if index == joy_index:
		joy_index = -1
		for a: StringName in [&"move_left", &"move_right", &"move_up", &"move_down"]:
			Input.action_release(a)
	elif button_touches.has(index):
		Input.action_release(button_touches[index])
		button_touches.erase(index)


func _press_button(index: int, action: StringName) -> void:
	button_touches[index] = action
	Input.action_press(action)


func _apply_joystick() -> void:
	var v := (joy_pos - joy_base) / JOY_RADIUS
	var l := v.length()
	if l < DEAD_ZONE:
		v = Vector2.ZERO
	else:
		v = v / l * clampf((l - DEAD_ZONE) / (FULL_AT - DEAD_ZONE), 0.25, 1.0)
	_set_axis(&"move_left", &"move_right", v.x)
	_set_axis(&"move_up", &"move_down", v.y)


func _set_axis(neg: StringName, pos: StringName, value: float) -> void:
	if value < 0.0:
		Input.action_press(neg, -value)
		Input.action_release(pos)
	elif value > 0.0:
		Input.action_press(pos, value)
		Input.action_release(neg)
	else:
		Input.action_release(neg)
		Input.action_release(pos)


func _draw() -> void:
	# 조이스틱: 누르고 있으면 그 자리에, 아니면 기본 자리에 희미하게
	var base := joy_base if joy_index != -1 else joy_home()
	var knob := base
	if joy_index != -1:
		var off := joy_pos - joy_base
		knob = base + (off.normalized() * JOY_RADIUS if off.length() > JOY_RADIUS else off)
	var alpha := 0.85 if joy_index != -1 else 0.45
	draw_circle(base, JOY_RADIUS + 3.0, Color(Gt.INK, alpha * 0.6))
	draw_circle(base, JOY_RADIUS, Color(Gt.NAVY, alpha * 0.45))
	for i in 4:  # 방향 표시 삼각형
		var d := Vector2.from_angle(i * PI / 2.0)
		var tip := base + d * (JOY_RADIUS - 8.0)
		draw_colored_polygon(PackedVector2Array([tip, tip - d * 10.0 + d.orthogonal() * 8.0, tip - d * 10.0 - d.orthogonal() * 8.0]), Color(1, 1, 1, alpha * 0.7))
	draw_circle(knob + Vector2(0, 4), 42.0, Color(Gt.INK, alpha))
	draw_circle(knob, 42.0, Color(Gt.INK, alpha))
	draw_circle(knob, 38.0, Color(Gt.CREAM, alpha))
	draw_circle(knob + Vector2(0, -6), 26.0, Color(1, 1, 1, alpha * 0.6))
	# 공격 버튼(칼 그림)
	var attack_down := &"attack" in button_touches.values()
	var ac := attack_center() + (Vector2(0, 3) if attack_down else Vector2.ZERO)
	Gt.ring_button(self, ac, ATTACK_R - 4.0, Color("ff5d8f"), attack_down)
	Gt.icon(self, &"sword", ac + Vector2(0, -2), ATTACK_R * 1.25)
	# 구르기 버튼
	var dash_down := &"dash" in button_touches.values()
	var dc := dash_center() + (Vector2(0, 3) if dash_down else Vector2.ZERO)
	Gt.ring_button(self, dc, 28.0, Color("4f8fe6"), dash_down)
	Gt.title(self, dc + Vector2(0, 6), "구르기", 13, Color.WHITE, 1)
	_draw_skill_button()


## 스킬 버튼: 스킬 그림(없으면 속성 기호) + 이름. 재사용 대기 중이면 어둡게 덮고 남은 초를 보여 준다.
func _draw_skill_button() -> void:
	var p := _player()
	if p == null or p.skills == null:
		return
	var cols := {"a1": Color("e9a83a"), "a2": Color("4aa3e8"), "a3": Color("b45ae8")}
	for node: String in ["a1", "a2", "a3"]:
		var action: StringName = {"a1": &"skill", "a2": &"skill2", "a3": &"skill3"}[node]
		var rad := _skill_r(node)
		var down := action in button_touches.values()
		var c := skill_center_of(node) + (Vector2(0, 3) if down else Vector2.ZERO)
		if not p.skills.has_skill(node):
			# 빈 칸: 어두운 동그라미 + 자물쇠
			draw_circle(c, rad + 3.0, Color(Gt.INK, 0.8))
			draw_circle(c, rad, Color(0.2, 0.18, 0.28, 0.75))
			draw_arc(c, rad - 2.0, 0, TAU, 32, Color(1, 1, 1, 0.25), 2.0)
			Gt.lock(self, c + Vector2(0, -2), 24, Color(1, 1, 1, 0.55))
			continue
		var ratio := p.skills.ready_ratio(node)
		var ready := ratio >= 1.0
		Gt.ring_button(self, c, rad, cols[node] if ready else Color("6a6478"), down)
		var info := SkillTree.info(p.data.id, node) if Save.is_owned(p.data.id) else {}
		var tex: Texture2D = SkillTree.icon(info["icon"]) if not info.is_empty() else null
		if tex:
			# 그림 가장자리의 네모 테두리를 빼고 가운데만 동그랗게
			var ts := tex.get_size()
			Gt.circle_tex(self, tex, c, rad - 6.0, Rect2(ts * 0.17, ts * 0.66), Color.WHITE if ready else Color(0.55, 0.55, 0.6))
		else:
			Gt.element_glyph(self, c + Vector2(0, -4), rad * 1.2, p.data.element, Color.WHITE, cols[node])
		if not ready:
			var pts := PackedVector2Array([c])
			var steps := 32
			for i in steps + 1:
				var a := -PI / 2.0 + TAU * ratio + (TAU * (1.0 - ratio)) * i / steps
				pts.append(c + Vector2.from_angle(a) * (rad - 5.0))
			draw_colored_polygon(pts, Color(Gt.INK, 0.6))
			Gt.title(self, c + Vector2(0, 8), "%d" % ceili(float(p.skills.cds[node])), 20, Color.WHITE, 1)
		else:
			draw_arc(c, rad + 5.0, 0, TAU, 40, Color(cols[node].lightened(0.4), 0.35 + 0.25 * sin(Time.get_ticks_msec() / 250.0)), 2.0)
		if node == "a3":
			Gt.text(self, c + Vector2(0, -rad - 6), "오의", 11, Color("ffd0ff"), 1, true, 3, Gt.INK)


func _player() -> Player:
	return get_tree().get_first_node_in_group(&"player") as Player


func _process(_delta: float) -> void:
	var p := _player()
	var cooling := false
	if p and p.skills:
		for k: String in p.skills.cds:
			if float(p.skills.cds[k]) > 0.0:
				cooling = true
	queue_redraw()
	_was_cooling = cooling


## 동그란 도트풍 버튼: 진한 외곽선 + 아래 두께 + 본체 + 윗부분 밝게. 누르면 쑥 들어간다.
func _draw_button(center: Vector2, radius: float, down: bool, kind: int) -> void:
	var c := Gt.kind_colors(kind)
	var depth := 2.0 if down else 7.0
	var top := center + Vector2(0, 5.0 if down else 0.0)
	draw_circle(center + Vector2(0, 9), radius + 3.0, Color(0, 0, 0, 0.25))
	draw_circle(top + Vector2(0, depth), radius + 3.0, Gt.INK)
	draw_circle(top, radius + 3.0, Gt.INK)
	draw_circle(top + Vector2(0, depth), radius, c[2])
	draw_circle(top, radius, Color(c[0], 0.95))
	draw_circle(top + Vector2(0, -radius * 0.18), radius * 0.78, Color(c[0].lightened(0.15), 0.95))
	draw_arc(top, radius - 4.0, PI * 1.15, PI * 1.6, 16, Color(1, 1, 1, 0.8), 4.0, true)
