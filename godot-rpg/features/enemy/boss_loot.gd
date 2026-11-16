class_name BossLoot
extends Node2D
## 보스를 쓰러뜨리면 금화·보석이 확 터져 나와 바닥에 통통 튀었다가 용사에게 빨려 든다(보여 주기용 — 실제 보상은 Enemy._die가 준다).

const COINS := 22
const GEMS := 8

var _bits: Array[Dictionary] = []
var _t := 0.0
var _target: Node2D


func _ready() -> void:
	z_index = 30
	_target = get_tree().get_first_node_in_group(&"player") as Node2D
	for i in COINS + GEMS:
		var a := randf_range(-PI * 0.95, -PI * 0.05)  # 위쪽 반원으로
		var sp := randf_range(90.0, 230.0)
		_bits.append({"p": Vector2.ZERO, "v": Vector2.from_angle(a) * sp, "floor": randf_range(10.0, 40.0), "gem": i >= COINS, "spin": randf() * TAU})


func _process(delta: float) -> void:
	_t += delta
	for b in _bits:
		if _t < 1.1:
			b["v"].y += 520.0 * delta  # 떨어지며
			b["p"] += b["v"] * delta
			if b["p"].y > b["floor"] and b["v"].y > 0.0:
				b["p"].y = b["floor"]
				b["v"] = Vector2(b["v"].x * 0.5, -b["v"].y * 0.45)  # 통통
		elif is_instance_valid(_target):
			var to: Vector2 = _target.global_position + Vector2(0, -10) - global_position
			b["p"] = (b["p"] as Vector2).lerp(to, minf(1.0, delta * 7.0))  # 용사에게 빨려 든다
		b["spin"] += delta * 8.0
	if _t > 1.9:
		queue_free()
	queue_redraw()


func _draw() -> void:
	var fade := clampf((1.9 - _t) / 0.4, 0.0, 1.0)
	modulate.a = fade
	if _t < 0.25:  # 터지는 순간 빛
		draw_circle(Vector2.ZERO, 30.0 + _t * 200.0, Color(1, 0.95, 0.6, (0.25 - _t) * 2.0))
	for b in _bits:
		var p: Vector2 = b["p"]
		if b["gem"]:
			Gt.gem(self, p, 5.0)
		else:
			var w := absf(cos(b["spin"]))  # 빙글빙글 도는 동전
			draw_set_transform(p, 0.0, Vector2(maxf(w, 0.25), 1.0))
			Gt.coin(self, Vector2.ZERO, 4.5)
			draw_set_transform(Vector2.ZERO)
