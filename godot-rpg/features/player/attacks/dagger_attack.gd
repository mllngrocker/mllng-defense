extends AttackStyle
## 근거리 단검(레비 도적·벨라 암살자): 아주 빠른 4연타. 4타째는 가까운 적 등 뒤로 순간이동해 크게 벤다(그동안 무적).
## 도적은 치명타 확률 +10%(Player.hit). 암살자(ASSASSINS)는 마무리 일격이 더 세고, 체력 30% 이하 적은 처형(피해 2배).

const CUT := preload("res://assets/ninja/fx/cut.png")
const CLAW := preload("res://assets/ninja/fx/claw_double.png")
const CUT_X := preload("res://assets/ninja/fx/cut_x.png")
const SMOKE := preload("res://assets/ninja/fx/smoke.png")
const STEP_TIME := 0.13
const HIT_AT := 0.05  # 칼 판정 영역이 자리 잡을 시간(한 물리 프레임 넘게)
const COMBO_RESET := 0.4
const FINISH_COOLDOWN := 0.25
const AIM_RANGE := 48.0
const BLINK_RANGE := 70.0
const ASSASSINS: Array[StringName] = [&"devil2"]
## 타마다: 공격력 배율, 넉백, 판정 반지름, 판정 거리, 내딛기
const STEPS: Array[Dictionary] = [
	{"mult": 0.55, "knock": 50.0, "radius": 11.0, "reach": 11.0, "lunge": 90.0},
	{"mult": 0.55, "knock": 50.0, "radius": 11.0, "reach": 11.0, "lunge": 90.0},
	{"mult": 0.7, "knock": 70.0, "radius": 12.0, "reach": 12.0, "lunge": 100.0},
	{"mult": 1.6, "knock": 220.0, "radius": 16.0, "reach": 6.0, "lunge": 0.0},
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
		var mult := float(s["mult"]) * (1.4 if _assassin() and step == STEPS.size() - 1 else 1.0)
		if step == STEPS.size() - 1:
			_finisher(mult, float(s["knock"]))
		else:
			player.strike(mult, float(s["knock"]))
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


func _assassin() -> bool:
	return ASSASSINS.has(data.id)


func _start(i: int) -> void:
	step = i
	t = 0.0
	hit_done = false
	busy = true
	var s := STEPS[i]
	aim = player.aim(AIM_RANGE)
	player.point_sword(float(s["radius"]), float(s["reach"]))
	if i < STEPS.size() - 1:
		var fx := spawn_fx(CUT, 4, player.body_center() + aim * 11.0, aim.angle() + (0.5 if i % 2 else -0.5), 30.0, 0.8, data.trail_color)
		fx.flip_v = i % 2 == 1
		Game.sfx(&"slash", -9.0 + i, 0.15)
		player.squash(Vector2(1.06, 0.95), 0.06)


## 4타: 가까운 적 등 뒤로 순간이동해 X자로 벤다. 암살자는 체력 30% 이하 적을 처형한다.
func _finisher(mult: float, knock: float) -> void:
	var target: Node2D = null
	var best := BLINK_RANGE
	for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
		var d := e.global_position.distance_to(player.global_position)
		if e.get(&"hp") > 0 and d < best:
			best = d
			target = e
	player.lock_for_skill(0.12, Vector2.ZERO, true)
	var tint := Color(0.75, 0.15, 0.3) if _assassin() else data.trail_color
	spawn_fx(SMOKE, 6, player.body_center(), 0.0, 20.0, 0.9, Color(tint, 0.8))
	if target:
		var through := player.global_position.direction_to(target.global_position)
		player.global_position = target.global_position + through * 14.0
		aim = -through
	var c := player.body_center() + aim * 6.0
	spawn_fx(CUT_X, 4, c, aim.angle(), 24.0, 1.3 if _assassin() else 1.1, tint)
	if _assassin():
		spawn_fx(CLAW, 4, c, aim.angle() + 0.8, 22.0, 1.2, tint)
		for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
			var hp := int(e.get(&"hp"))
			if hp > 0 and e.global_position.distance_to(c) < 24.0 and hp <= int(e.get(&"max_hp")) * 0.3:
				player.hit(e, mult, knock, player.global_position)  # 처형: 한 번 더(피해 2배)
	# 방금 순간이동해서 칼 판정 영역이 아직 안 바뀌었으니 거리로 직접 맞힌다
	for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
		if int(e.get(&"hp")) > 0 and e.global_position.distance_to(c) < 26.0:
			player.hit(e, mult * Weapons.mod(player.weapon, "dmg"), knock, player.global_position)
	Game.sfx(&"slash", 0.0)
	Game.add_shake(3.5 if _assassin() else 2.5)
	player.squash(Vector2(1.15, 0.88))
