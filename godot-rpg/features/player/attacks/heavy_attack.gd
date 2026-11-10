extends AttackStyle
## 근거리 묵직(카라): 잠깐 힘을 모았다가 넓게 내려친다. 느리지만 세고, 적을 멀리 날리며 불꽃이 튄다.

const SLASH := preload("res://assets/ninja/fx/slash_curved.png")
const CIRCLE := preload("res://assets/ninja/fx/circle.png")
const FLAME := preload("res://assets/ninja/fx/flame.png")
const WINDUP := 0.16
const SWING := 0.12
const RECOVER := 0.24
const COOLDOWN := 0.15
const AIM_RANGE := 60.0
const RADIUS := 22.0
const REACH := 16.0

enum Phase { IDLE, WINDUP, SWING, RECOVER }

var phase: Phase = Phase.IDLE
var t := 0.0
var cooldown := 0.0
var aim := Vector2.DOWN


func wants_press() -> bool:
	return cooldown <= 0.0 and phase == Phase.IDLE


func press() -> void:
	phase = Phase.WINDUP
	t = 0.0
	busy = true
	aim = player.aim(AIM_RANGE)
	player.point_sword(RADIUS, REACH)
	player.squash(Vector2(0.86, 1.14), 0.14)  # 힘을 모으며 몸을 세운다


func physics(delta: float) -> void:
	cooldown -= delta
	t += delta
	match phase:
		Phase.WINDUP:
			lunge = -aim * 18.0
			if t >= WINDUP:
				phase = Phase.SWING
				t = 0.0
				_swing()
		Phase.SWING:
			lunge = aim * 120.0 * maxf(0.0, 1.0 - t / SWING)
			if t >= SWING:
				phase = Phase.RECOVER
				t = 0.0
		Phase.RECOVER:
			lunge = Vector2.ZERO
			if t >= RECOVER:
				cancel()
				cooldown = COOLDOWN


func cancel() -> void:
	super.cancel()
	phase = Phase.IDLE


func _swing() -> void:
	var center := player.body_center() + aim * REACH
	spawn_fx(SLASH, 4, center, aim.angle(), 20.0, 1.9, data.trail_color)
	var wave := spawn_fx(CIRCLE, 4, center, 0.0, 16.0, 1.4, Color(1.0, 0.7, 0.4, 0.8))
	wave.scale = Vector2(1.6, 0.8)
	Game.sfx(&"heavy", -2.0)
	player.squash(Vector2(1.2, 0.85))
	var hits := player.strike(2.3, 340.0)
	if hits > 0:
		Game.add_shake(6.0)
		Game.sfx(&"boom", -6.0)
		for i in 3:
			spawn_fx(FLAME, 8, center + Vector2(randf_range(-14, 14), randf_range(-8, 8)), 0.0, 16.0, 0.7)
	else:
		Game.add_shake(2.5)
