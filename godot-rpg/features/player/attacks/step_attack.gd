class_name StepAttack
extends AttackStyle
## 근거리 연속 공격의 공통 틀: STEPS(타마다 배율·넉백·판정 크기·거리·내딛기)를 차례로 휘두른다.
## 창·채찍·쌍검이 이걸 물려받아 _effect(i, 위치)만 다르게 그린다.

var steps: Array[Dictionary] = []
var step_time := 0.12
var hit_at := 0.04
var combo_reset := 0.45
var finish_cooldown := 0.3
var aim_range := 48.0

var step := -1
var t := 0.0
var hit_done := false
var queued := false
var cooldown := 0.0
var since_end := 99.0
var aim := Vector2.DOWN
var _start_frame := 0  # 휘두른 물리 프레임(판정 영역이 자리 잡을 때까지 2프레임 기다린다)


func wants_press() -> bool:
	return cooldown <= 0.0


func press() -> void:
	if busy:
		queued = true
	elif step >= 0 and step < steps.size() - 1 and since_end < combo_reset:
		_start(step + 1)
	else:
		_start(0)


func physics(delta: float) -> void:
	cooldown -= delta
	if not busy:
		since_end += delta
		return
	t += delta
	var s := steps[step]
	lunge = aim * float(s["lunge"]) * maxf(0.0, 1.0 - t / step_time)
	if not hit_done and t >= hit_at and Engine.get_physics_frames() - _start_frame >= 2:
		hit_done = true
		player.strike(float(s["mult"]), float(s["knock"]))
		_on_hit(step)
	if t >= step_time:
		busy = false
		lunge = Vector2.ZERO
		since_end = 0.0
		if step == steps.size() - 1:
			cooldown = finish_cooldown
			step = -1
			queued = false
		elif queued:
			queued = false
			_start(step + 1)


func cancel() -> void:
	super.cancel()
	step = -1
	queued = false


func _start(i: int) -> void:
	step = i
	t = 0.0
	hit_done = false
	_start_frame = Engine.get_physics_frames()
	busy = true
	var s := steps[i]
	aim = player.aim(aim_range)
	player.point_sword(float(s["radius"]), float(s["reach"]))
	_on_swing(i)


## 휘두를 때(그림·소리) — 물려받아 바꾼다
func _on_swing(_i: int) -> void:
	pass


## 판정 순간 — 물려받아 바꾼다
func _on_hit(_i: int) -> void:
	pass


func is_finisher(i: int) -> bool:
	return i == steps.size() - 1
