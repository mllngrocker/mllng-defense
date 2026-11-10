extends Control
## 휴대폰 터치 조작: 왼쪽 아래를 누른 채 끌면 조이스틱, 오른쪽 아래 큰 버튼은 공격(꾹 누르기 지원), 작은 버튼은 구르기.
## 터치를 입력 동작(move_*, attack, dash)으로 바꿔 준다. PC에서는 마우스 클릭도 터치로 받는다.

const JOY_RADIUS := 64.0
const DEAD_ZONE := 0.2
const ATTACK_R := 58.0
const DASH_R := 40.0
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
	return size - Vector2(96, 150)


func dash_center() -> Vector2:
	return size - Vector2(196, 86)


func skill_center() -> Vector2:
	return size - Vector2(206, 200)


func joy_home() -> Vector2:
	return Vector2(110, size.y - 150)


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
			joy_pos = drag.position
			_apply_joystick()
			queue_redraw()


func _on_touch_down(index: int, pos: Vector2) -> void:
	if pos.distance_to(attack_center()) < ATTACK_R * 1.25:
		_press_button(index, &"attack")
	elif pos.distance_to(dash_center()) < DASH_R * 1.3:
		_press_button(index, &"dash")
	elif pos.distance_to(skill_center()) < SKILL_R * 1.3:
		_press_button(index, &"skill")
	elif joy_index == -1 and pos.x < size.x * 0.6 and pos.y > size.y * 0.4:
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
	if v.length() > 1.0:
		v = v.normalized()
	if v.length() < DEAD_ZONE:
		v = Vector2.ZERO
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
	draw_circle(knob + Vector2(0, 4), 29.0, Color(Gt.INK, alpha))
	draw_circle(knob, 29.0, Color(Gt.INK, alpha))
	draw_circle(knob, 26.0, Color(Gt.CREAM, alpha))
	draw_circle(knob + Vector2(0, -4), 18.0, Color(1, 1, 1, alpha * 0.6))
	# 공격 버튼(칼 그림)
	var attack_down := &"attack" in button_touches.values()
	_draw_button(attack_center(), ATTACK_R, attack_down, Gt.Kind.PINK)
	var lift := Vector2(0, 3) if attack_down else Vector2(0, -2)
	Gt.icon(self, &"sword", attack_center() + lift, ATTACK_R * 1.35)
	# 구르기 버튼
	var dash_down := &"dash" in button_touches.values()
	_draw_button(dash_center(), DASH_R, dash_down, Gt.Kind.BLUE)
	Gt.title(self, dash_center() + Vector2(0, 6 + (4 if dash_down else 0)), "구르기", 15, Color.WHITE, 1)
	_draw_skill_button()


## 스킬 버튼: 속성 기호 + 스킬 이름. 재사용 대기 중이면 어둡게 덮고 남은 초를 보여 준다.
func _draw_skill_button() -> void:
	var p := _player()
	if p == null or p.skills == null:
		return
	var c := skill_center()
	var down := &"skill" in button_touches.values()
	var ratio := p.skills.ready_ratio()
	var ready := ratio >= 1.0
	_draw_button(c, SKILL_R, down, Gt.Kind.YELLOW if ready else Gt.Kind.GRAY)
	var top := c + Vector2(0, 5.0 if down else 0.0)
	Gt.element_glyph(self, top + Vector2(0, -6), SKILL_R * 1.3, p.data.element, Color.WHITE, Gt.kind_colors(Gt.Kind.YELLOW)[0])
	if not ready:
		# 남은 시간만큼 시계 방향으로 어둡게
		var pts := PackedVector2Array([top])
		var steps := 32
		for i in steps + 1:
			var a := -PI / 2.0 + TAU * ratio + (TAU * (1.0 - ratio)) * i / steps
			pts.append(top + Vector2.from_angle(a) * SKILL_R)
		draw_colored_polygon(pts, Color(Gt.INK, 0.55))
		Gt.title(self, top + Vector2(0, 9), "%d" % ceili(p.skills.cooldown), 24, Color.WHITE, 1)
	Gt.title(self, c + Vector2(0, SKILL_R + 20), p.data.skill_name, 13, Color("ffe36b") if ready else Color("d8d2ea"), 1)


func _player() -> Player:
	return get_tree().get_first_node_in_group(&"player") as Player


func _process(_delta: float) -> void:
	var p := _player()
	if p and p.skills and p.skills.cooldown > 0.0:
		queue_redraw()
	elif _was_cooling:
		queue_redraw()
	_was_cooling = p != null and p.skills != null and p.skills.cooldown > 0.0


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
