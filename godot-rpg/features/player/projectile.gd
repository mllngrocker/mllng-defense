class_name Projectile
extends Area2D
## 날아가는 공격(마법 구슬, 화살 등). 적에 맞으면 피해를 주고, 관통 횟수가 남으면 계속 날아간다.
## 벽·나무에 닿거나 사거리를 넘으면 사라진다.

var shooter: Player
var velocity := Vector2.ZERO
var opts: Dictionary
var travelled := 0.0
var pierce := 0
var hit_bodies: Array[Node2D] = []
var sprite: Sprite2D
var _anim_t := 0.0


## opts: speed, tex, frames, angle_offset, radius, mult, knock, pierce, range, scale, hit_tex, hit_frames
static func spawn(p: Player, from: Vector2, dir: Vector2, o: Dictionary) -> Projectile:
	var pr := Projectile.new()
	pr.shooter = p
	pr.opts = o
	pr.velocity = dir * float(o["speed"])
	pr.pierce = int(o["pierce"])
	o["range"] = float(o["range"]) * Weapons.mod(p.weapon, "range")
	pr.collision_layer = 0
	pr.collision_mask = 1 | 4 | 8
	pr.monitorable = false
	pr.z_index = 4
	var shape := CircleShape2D.new()
	shape.radius = float(o["radius"])
	var cs := CollisionShape2D.new()
	cs.shape = shape
	pr.add_child(cs)
	pr.sprite = Sprite2D.new()
	pr.sprite.texture = o["tex"]
	pr.sprite.hframes = int(o["frames"])
	pr.sprite.rotation = dir.angle() + float(o["angle_offset"])
	pr.sprite.scale = Vector2.ONE * float(o["scale"])
	pr.add_child(pr.sprite)
	p.fx_parent().add_child(pr)
	pr.global_position = from
	pr.body_entered.connect(pr._on_body_entered)
	return pr


func _physics_process(delta: float) -> void:
	var step := velocity * delta
	position += step
	travelled += step.length()
	_anim_t += delta * 14.0
	sprite.frame = int(_anim_t) % sprite.hframes
	if travelled > float(opts["range"]):
		_pop()


func _on_body_entered(body: Node2D) -> void:
	if body is Player or body in hit_bodies:
		return
	if body.has_method(&"take_hit"):
		hit_bodies.append(body)
		shooter.hit(body, float(opts["mult"]), float(opts["knock"]), global_position - velocity.normalized() * 8.0)
		_impact_fx()
		pierce -= 1
		if pierce < 0:
			queue_free()
	else:
		_pop()


func _pop() -> void:
	_impact_fx()
	queue_free()


func _impact_fx() -> void:
	var fx := Fx.spawn(get_parent(), opts["hit_tex"], int(opts["hit_frames"]), global_position, 24.0)
	fx.scale = Vector2.ONE * 0.8 * float(opts["scale"])
