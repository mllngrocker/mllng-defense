extends AttackStyle
## 근거리 연타(시로): 짧고 빠른 3연타. 연타 중 버튼을 누르면 다음 타로 이어지고, 3타는 X자로 크게 벤다.

const CUT := preload("res://assets/ninja/fx/cut.png")
const CUT_DOUBLE := preload("res://assets/ninja/fx/cut_double.png")
const CUT_X := preload("res://assets/ninja/fx/cut_x.png")
const STEP_TIME := 0.2
const HIT_AT := 0.05
const COMBO_RESET := 0.45  # 이 시간 안에 다시 누르면 다음 타
const FINISH_COOLDOWN := 0.3
const AIM_RANGE := 52.0
## 타마다: 그림, 프레임 수, 공격력 배율, 넉백, 판정 반지름, 판정 거리, 내딛기
const STEPS: Array[Dictionary] = [
	{"tex": CUT, "frames": 4, "mult": 0.8, "knock": 110.0, "radius": 13.0, "reach": 13.0, "lunge": 70.0},
	{"tex": CUT_DOUBLE, "frames": 5, "mult": 0.9, "knock": 130.0, "radius": 14.0, "reach": 13.0, "lunge": 70.0},
	{"tex": CUT_X, "frames": 4, "mult": 1.7, "knock": 260.0, "radius": 17.0, "reach": 14.0, "lunge": 110.0},
]

var step := -1
var t := 0.0
var hit_done := false
var queued := false
var cooldown := 0.0
var since_end := 99.0
var aim := Vector2.DOWN


func wants_press() -> bool:
	return cooldown <= 0.0


func press() -> void:
	if busy:
		queued = true
	elif step >= 0 and step < STEPS.size() - 1 and since_end < COMBO_RESET:
		_start(step + 1)
	else:
		_start(0)


func physics(delta: float) -> void:
	cooldown -= delta
	if not busy:
		since_end += delta
		return
	t += delta
	var s := STEPS[step]
	lunge = aim * float(s["lunge"]) * maxf(0.0, 1.0 - t / STEP_TIME)
	if not hit_done and t >= HIT_AT:
		hit_done = true
		var hits := player.strike(float(s["mult"]), float(s["knock"]))
		if step == STEPS.size() - 1:
			Game.add_shake(3.0 if hits > 0 else 1.5)
	if t >= STEP_TIME:
		busy = false
		lunge = Vector2.ZERO
		since_end = 0.0
		if step == STEPS.size() - 1:
			cooldown = FINISH_COOLDOWN
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
	busy = true
	var s := STEPS[i]
	aim = player.aim(AIM_RANGE)
	player.point_sword(float(s["radius"]), float(s["reach"]))
	var fx := spawn_fx(s["tex"], int(s["frames"]), player.body_center() + aim * 13.0, aim.angle(), 22.0, 1.0 + i * 0.15, data.trail_color)
	fx.flip_v = i == 1
	Game.sfx(&"slash", -4.0 + i, 0.05)
	player.squash(Vector2(1.1, 0.92))
