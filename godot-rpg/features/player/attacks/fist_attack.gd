extends AttackStyle
## 근거리 주먹(핀): 잽 · 잽 · 훅 · 어퍼컷 네 번. 칼 휘두름 대신 주먹이 닿는 자리에 충격이 터진다.
## 손이 짧은 대신 빠르고, 마지막 어퍼컷은 주위 적까지 크게 날려 보낸다.

const IMPACT := preload("res://assets/ninja/fx/circle.png")
const SPARK := preload("res://assets/ninja/fx/spark.png")
const BURST := preload("res://assets/ninja/fx/explosion.png")
const STEP_TIME := 0.12
const HIT_AT := 0.04
const COMBO_RESET := 0.45
const FINISH_COOLDOWN := 0.3
const AIM_RANGE := 44.0
## 타마다: 공격력 배율, 넉백, 판정 반지름, 판정 거리, 내딛기
const STEPS: Array[Dictionary] = [
	{"mult": 0.5, "knock": 60.0, "radius": 10.0, "reach": 9.0, "lunge": 70.0},
	{"mult": 0.5, "knock": 60.0, "radius": 10.0, "reach": 9.0, "lunge": 70.0},
	{"mult": 0.8, "knock": 110.0, "radius": 12.0, "reach": 10.0, "lunge": 90.0},
	{"mult": 1.7, "knock": 300.0, "radius": 18.0, "reach": 8.0, "lunge": 40.0},
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
		player.strike(float(s["mult"]), float(s["knock"]))
		var p := player.body_center() + aim * (14.0 if step < 3 else 10.0)
		if step < STEPS.size() - 1:
			spawn_fx(IMPACT, 4, p, 0.0, 28.0, 0.45 + step * 0.1, data.trail_color)
			spawn_fx(SPARK, 10, p, aim.angle(), 30.0, 0.6, Color(1, 1, 0.85))
		else:  # 어퍼컷: 주위까지 터진다
			spawn_fx(BURST, 9, p, 0.0, 22.0, 1.1, data.trail_color)
			spawn_fx(IMPACT, 4, player.body_center(), 0.0, 16.0, 1.4, Color(data.trail_color, 0.8))
			for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
				if int(e.get(&"hp")) > 0 and e.global_position.distance_to(p) < 30.0:
					player.hit(e, 0.6, 320.0, player.global_position)
			Game.add_shake(3.0)
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
	Game.sfx(&"hit" if i < 3 else &"hit_heavy", -8.0 + i, 0.15)
	player.squash(Vector2(1.08, 0.94) if i < 3 else Vector2(0.9, 1.15), 0.06)
