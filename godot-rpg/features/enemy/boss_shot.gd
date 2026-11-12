class_name BossShot
extends Area2D
## 보스가 쏘는 탄(둥근 빛 구슬): 곧게 날아가다 용사에 닿으면 피해. 4초 뒤 사라진다.

var vel := Vector2.ZERO
var damage := 10
var color := Color("ff5d5d")
var _t := 0.0


static func fire(parent: Node, pos: Vector2, v: Vector2, dmg: int, col: Color) -> void:
	var s := BossShot.new()
	s.position = pos
	s.vel = v
	s.damage = dmg
	s.color = col
	parent.add_child(s)


func _ready() -> void:
	collision_layer = 0
	collision_mask = 2  # 용사
	monitorable = false
	var cs := CollisionShape2D.new()
	var c := CircleShape2D.new()
	c.radius = 5.0
	cs.shape = c
	add_child(cs)
	body_entered.connect(func(b: Node2D) -> void:
		if b is Player and b.hp > 0:
			b.take_hit(damage, global_position - vel.normalized() * 8.0, 120.0)
			queue_free())
	z_index = 5


func _physics_process(delta: float) -> void:
	_t += delta
	position += vel * delta
	if _t > 4.0:
		queue_free()
	queue_redraw()


func _draw() -> void:
	var p := 1.0 + 0.15 * sin(_t * 18.0)
	draw_circle(Vector2.ZERO, 8.0 * p, Color(color, 0.3))
	draw_circle(Vector2.ZERO, 5.0, color)
	draw_circle(Vector2(-1.5, -1.5), 2.0, Color(1, 1, 1, 0.8))
