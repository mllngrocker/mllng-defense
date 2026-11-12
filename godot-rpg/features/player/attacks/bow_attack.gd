extends AttackStyle
## 원거리 활(엘린): 누르면 화살을 빠르게 쏜다. 꾹 누르고 있으면 활시위를 당겨, 떼는 순간 꿰뚫는 화살 3발을 부채꼴로.
## 마법보다 한 발이 약하지만 빠르고 멀리 간다(마나는 근접 캐릭터처럼 적게 쓴다).

const ARROW := preload("res://assets/ninja/fx/arrow.png")
const HIT := preload("res://assets/ninja/fx/spark.png")
const CIRCLE := preload("res://assets/ninja/fx/circle.png")
const SHOT_COOLDOWN := 0.24
const CAST_LOCK := 0.06
const CHARGE_TIME := 0.6
const AIM_RANGE := 170.0

var cooldown := 0.0
var lock_t := 0.0
var holding := false
var hold_t := 0.0
var charged := false
var aura: Sprite2D


func wants_press() -> bool:
	return cooldown <= 0.0 and not holding


func press() -> void:
	_shoot(false)
	holding = true
	hold_t = 0.0
	charged = false


func release() -> void:
	if not holding:
		return
	holding = false
	move_scale = 1.0
	if charged:
		_shoot(true)
	_clear_aura()


func physics(delta: float) -> void:
	cooldown -= delta
	lock_t -= delta
	busy = lock_t > 0.0
	lunge = Vector2.ZERO
	if not holding:
		return
	if not Input.is_action_pressed(&"attack"):
		release()
		return
	hold_t += delta
	if hold_t > 0.15:
		move_scale = 0.55
		_show_aura(clampf((hold_t - 0.15) / (CHARGE_TIME - 0.15), 0.0, 1.0))
	if not charged and hold_t >= CHARGE_TIME:
		charged = true
		Game.sfx(&"charged", -6.0, 0.0)
		player.flash(0.5)


func cancel() -> void:
	super.cancel()
	holding = false
	_clear_aura()


func _shoot(big: bool) -> void:
	var dir := player.aim(AIM_RANGE)
	cooldown = SHOT_COOLDOWN
	lock_t = CAST_LOCK
	var from := player.body_center() + dir * 8.0
	var shots := [0.0] if not big else [-0.16, 0.0, 0.16]
	for a: float in shots:
		var pr := Projectile.spawn(player, from, dir.rotated(a), {
			"speed": 330.0 if big else 290.0, "tex": ARROW, "frames": 1, "angle_offset": 0.0, "radius": 4.0,
			"mult": 1.5 if big else 0.85, "knock": 160.0 if big else 70.0, "pierce": 4 if big else 0,
			"range": 210.0 if big else 185.0, "scale": 1.6 if big else 1.3,
			"hit_tex": HIT, "hit_frames": 10,
		})
		pr.sprite.modulate = data.trail_color.lightened(0.3) if big else Color.WHITE
	Game.sfx(&"slash", -6.0 if big else -12.0, 0.15)
	if big:
		Game.add_shake(2.0)
		player.squash(Vector2(1.12, 0.9))
	else:
		player.squash(Vector2(0.96, 1.04), 0.08)


func _show_aura(k: float) -> void:
	if aura == null:
		aura = Sprite2D.new()
		aura.texture = CIRCLE
		aura.hframes = 4
		aura.z_index = -1
		player.add_child(aura)
	aura.position = Vector2(0, -2)
	aura.frame = 1 + int(Time.get_ticks_msec() / 90.0) % 3
	aura.scale = Vector2(1.0, 0.45) * lerpf(0.5, 1.0, k)
	aura.modulate = Color(data.trail_color, 0.4 + 0.5 * k) if k < 1.0 else Color(1.0, 1.0, 0.8, 0.9)


func _clear_aura() -> void:
	if aura:
		aura.queue_free()
		aura = null
