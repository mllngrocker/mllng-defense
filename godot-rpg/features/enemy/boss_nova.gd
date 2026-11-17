class_name BossNova
extends Node2D
## 보스 "충격파": 보스에게서 커지는 고리. 고리가 지나갈 때 서 있으면 맞는다 — 고리가 닿는 순간 구르기로 넘어가야 한다.

var speed := 230.0
var max_r := 360.0
var width := 12.0
var damage := 10
var color := Color("ff5ad8")
var r := 18.0
var _hit := false


static func fire(parent: Node, pos: Vector2, dmg: int, col: Color, spd := 230.0) -> void:
	var n := BossNova.new()
	n.position = pos
	n.damage = dmg
	n.color = col
	n.speed = spd
	parent.add_child(n)


func _ready() -> void:
	z_index = 4


func _physics_process(delta: float) -> void:
	r += speed * delta
	if r > max_r:
		queue_free()
		return
	if not _hit:
		var p := get_tree().get_first_node_in_group(&"player") as Player
		if p and p.hp > 0:
			var d := Vector2(p.global_position.x - global_position.x, (p.global_position.y - global_position.y) / 0.6).length()
			if absf(d - r) < width:
				_hit = true
				p.take_hit(damage, global_position, 260.0)
	queue_redraw()


func _draw() -> void:
	var a := 1.0 - r / max_r
	draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.6))
	draw_arc(Vector2.ZERO, r, 0, TAU, 64, Color(color, 0.35 * a), width * 2.0)
	draw_arc(Vector2.ZERO, r, 0, TAU, 64, Color(color.lightened(0.35), 0.95 * a), 4.0)
	draw_arc(Vector2.ZERO, r - width * 0.6, 0, TAU, 64, Color(1, 1, 1, 0.5 * a), 1.5)
	draw_set_transform(Vector2.ZERO)
