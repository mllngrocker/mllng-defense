extends AttackStyle
## 원거리 마법(미즈하): 누르면 얼음 가시를 쏜다. 버튼을 꾹 누르고 있으면 기를 모아, 떼는 순간 큰 얼음 구슬(관통)을 쏜다.

const ICE_SPIKE := preload("res://assets/ninja/fx/ice_spike.png")
const BIG_BALL := preload("res://assets/ninja/fx/big_energy.png")
const ICE_HIT := preload("res://assets/ninja/fx/ice_hit.png")
const CIRCLE := preload("res://assets/ninja/fx/circle.png")
const SHOT_COOLDOWN := 0.3
const CAST_LOCK := 0.08
const CHARGE_TIME := 0.7
const AIM_RANGE := 150.0

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
	if hold_t > 0.2:
		move_scale = 0.45
		_show_aura(clampf((hold_t - 0.2) / (CHARGE_TIME - 0.2), 0.0, 1.0))
	if not charged and hold_t >= CHARGE_TIME:
		charged = true
		Game.sfx(&"charged", -6.0, 0.0)
		player.flash(0.6)


func cancel() -> void:
	super.cancel()
	holding = false
	_clear_aura()


func _shoot(big: bool) -> void:
	var dir := player.aim(AIM_RANGE)
	cooldown = SHOT_COOLDOWN
	lock_t = CAST_LOCK
	var from := player.body_center() + dir * 8.0
	if big:
		Projectile.spawn(player, from, dir, {
			"speed": 170.0, "tex": BIG_BALL, "frames": 4, "angle_offset": PI / 2.0, "radius": 9.0,
			"mult": 2.6, "knock": 240.0, "pierce": 99, "range": 200.0, "scale": 1.2,
			"hit_tex": ICE_HIT, "hit_frames": 10,
		})
		Game.sfx(&"ice_shot", 0.0, 0.0)
		Game.add_shake(2.0)
		player.squash(Vector2(0.85, 1.15))
	else:
		Projectile.spawn(player, from, dir, {
			"speed": 230.0, "tex": ICE_SPIKE, "frames": 8, "angle_offset": 0.0, "radius": 4.0,
			"mult": 1.0, "knock": 90.0, "pierce": 0, "range": 160.0, "scale": 1.0,
			"hit_tex": ICE_HIT, "hit_frames": 10,
		})
		Game.sfx(&"ice_shot", -8.0)
		player.squash(Vector2(0.94, 1.06))


func _show_aura(k: float) -> void:
	if aura == null:
		aura = Sprite2D.new()
		aura.texture = CIRCLE
		aura.hframes = 4
		aura.z_index = -1
		player.add_child(aura)
		Game.sfx(&"charge", -10.0, 0.0)
	aura.position = Vector2(0, -2)
	aura.frame = 1 + int(Time.get_ticks_msec() / 90.0) % 3
	aura.scale = Vector2(1.0, 0.45) * lerpf(0.5, 1.1, k)
	aura.modulate = Color(0.6, 0.9, 1.0, 0.4 + 0.5 * k) if k < 1.0 else Color(1.0, 1.0, 1.0, 0.9)


func _clear_aura() -> void:
	if aura:
		aura.queue_free()
		aura = null
