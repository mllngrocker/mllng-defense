class_name BossMark
extends Node2D
## 보스 "운석비": 바닥에 빨간 원으로 예고 → 위에서 빛 덩이가 떨어져 터진다. 원 안에 있으면 큰 피해(구르기로 피함).

var radius := 30.0
var warn := 0.75
var damage := 10
var color := Color("ff5ad8")
var _t := 0.0
var _hit := false


static func drop(parent: Node, pos: Vector2, r: float, w: float, dmg: int, col: Color) -> void:
	var m := BossMark.new()
	m.position = pos
	m.radius = r
	m.warn = w
	m.damage = dmg
	m.color = col
	parent.add_child(m)


func _ready() -> void:
	z_index = 4


func _physics_process(delta: float) -> void:
	_t += delta
	if not _hit and _t >= warn:
		_hit = true
		Game.add_shake(3.0)
		Game.sfx(&"boom", -10.0, 0.15)
		var p := get_tree().get_first_node_in_group(&"player") as Player
		if p and p.hp > 0 and p.global_position.distance_to(global_position) < radius * 0.95:
			p.take_hit(damage, global_position, 220.0)
	if _t > warn + 0.35:
		queue_free()
	queue_redraw()


func _draw() -> void:
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.6))
	if _t < warn:
		var k := _t / warn
		draw_circle(Vector2.ZERO, radius, Color(color, 0.14))
		draw_circle(Vector2.ZERO, radius * k, Color(color, 0.3))
		draw_arc(Vector2.ZERO, radius, 0, TAU, 32, Color(color.lightened(0.2), 0.95), 2.0, true)
	else:
		var e := (_t - warn) / 0.35
		draw_circle(Vector2.ZERO, radius * (0.7 + 0.5 * e), Color(1, 0.95, 1, 0.75 * (1.0 - e)))
		draw_arc(Vector2.ZERO, radius * (0.9 + 0.8 * e), 0, TAU, 32, Color(color.lightened(0.3), 1.0 - e), 3.0, true)
	draw_set_transform(Vector2.ZERO)
	# 떨어지는 빛 덩이(예고 마지막 0.3초)
	if _t > warn - 0.3 and _t < warn:
		var f := (_t - (warn - 0.3)) / 0.3
		var head := Vector2(0, -220.0 * (1.0 - f * f))
		draw_line(head, head + Vector2(0, -50), Color(color.lightened(0.3), 0.6), 7.0)
		draw_circle(head, 7.0, color)
		draw_circle(head, 4.0, Color(1, 1, 1, 0.9))
