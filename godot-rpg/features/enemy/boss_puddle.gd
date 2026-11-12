class_name BossPuddle
extends Area2D
## 보스가 남기는 장판(독·불·잉크): 처음 0.8초는 테두리로 예고만 하고, 그 뒤 4초 동안 위에 선 용사에게 0.5초마다 피해.

const WARN := 0.8
const LIFE := 4.8

var radius := 24.0
var damage := 10
var color := Color("9b59ff")
var _t := 0.0
var _tick := 0.0


static func drop(parent: Node, pos: Vector2, r: float, dmg: int, col: Color) -> void:
	var p := BossPuddle.new()
	p.position = pos
	p.radius = r
	p.damage = dmg
	p.color = col
	parent.add_child(p)


func _ready() -> void:
	collision_layer = 0
	collision_mask = 2
	monitorable = false
	var cs := CollisionShape2D.new()
	var c := CircleShape2D.new()
	c.radius = radius * 0.8
	cs.shape = c
	add_child(cs)
	z_index = -1


func _physics_process(delta: float) -> void:
	_t += delta
	if _t > LIFE:
		queue_free()
		return
	if _t > WARN:
		_tick -= delta
		if _tick <= 0.0:
			_tick = 0.5
			for b in get_overlapping_bodies():
				if b is Player and b.hp > 0:
					b.take_hit(damage, global_position, 40.0)
	queue_redraw()


func _draw() -> void:
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.6))
	if _t < WARN:
		draw_arc(Vector2.ZERO, radius, 0, TAU, 32, Color(color, 0.9), 2.0, true)
		draw_circle(Vector2.ZERO, radius * (_t / WARN), Color(color, 0.25))
	else:
		var fade := clampf((LIFE - _t) / 0.6, 0.0, 1.0)
		draw_circle(Vector2.ZERO, radius, Color(color.darkened(0.2), 0.5 * fade))
		draw_circle(Vector2.ZERO, radius * (0.6 + 0.1 * sin(_t * 6.0)), Color(color.lightened(0.2), 0.35 * fade))
	draw_set_transform(Vector2.ZERO)
