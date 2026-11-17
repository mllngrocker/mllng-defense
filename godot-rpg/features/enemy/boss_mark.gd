class_name BossMark
extends Node2D
## 보스 "운석비"·"내려앉는 빛기둥": 바닥에 원으로 예고 → 위에서 떨어져 터진다. 원 안에 있으면 큰 피해(구르기로 피함).
## 탄처럼 하나하나 노드로 만들지 않고, 맵마다 이 노드 하나가 모든 표식을 배열로 돌리고 한 번에 그린다(렉 없게).
## pillar: 천계식 — 하늘에서 거대한 빛기둥이 내려앉고 깃털이 흩날린다.

const BLAST := 0.4
const MAX_MARKS := 160

var _m: Array[Dictionary] = []  # {pos, r, warn, dmg, col, t, hit, pillar}
var _clock := 0.0
var _had := false


static func _field(parent: Node) -> BossMark:
	var f := parent.get_node_or_null(^"BossMarks") as BossMark
	if f == null:
		f = BossMark.new()
		f.name = "BossMarks"
		parent.add_child(f)
	return f


static func drop(parent: Node, pos: Vector2, r: float, w: float, dmg: int, col: Color, pillar := false, delay := 0.0) -> void:
	var f := _field(parent)
	if f._m.size() >= MAX_MARKS:
		return
	f._m.append({"pos": pos, "r": r, "warn": w, "dmg": dmg, "col": col, "t": -delay, "hit": false, "pillar": pillar})


func _ready() -> void:
	z_index = 4


func _physics_process(delta: float) -> void:
	_clock += delta
	if _m.is_empty():
		if _had:
			_had = false
			queue_redraw()
		return
	_had = true
	var p := get_tree().get_first_node_in_group(&"player") as Player
	var booms := 0
	for m: Dictionary in _m:
		m["t"] += delta
		if not m["hit"] and m["t"] >= m["warn"]:
			m["hit"] = true
			booms += 1
			if int(m["dmg"]) > 0 and p and p.hp > 0 and p.global_position.distance_to(m["pos"]) < float(m["r"]) * 0.95:
				p.take_hit(m["dmg"], m["pos"], 220.0)
	if booms > 0:  # 한 프레임에 여러 개 터져도 소리·흔들림은 한 번
		Game.add_shake(3.0 + minf(booms, 4))
		Game.sfx(&"boom", -10.0, 0.15)
	_m = _m.filter(func(m: Dictionary) -> bool: return m["t"] < m["warn"] + BLAST)
	queue_redraw()


func _draw() -> void:
	draw_set_transform_matrix(get_global_transform().affine_inverse())
	var base := get_global_transform().affine_inverse()
	for m: Dictionary in _m:
		var t: float = m["t"]
		if t < 0.0:
			continue
		var pos: Vector2 = m["pos"]
		var r: float = m["r"]
		var warn: float = m["warn"]
		var col: Color = m["col"]
		draw_set_transform_matrix(base * Transform2D(0.0, Vector2(1.0, 0.6), 0.0, pos))
		if t < warn:
			var k := t / warn
			draw_circle(Vector2.ZERO, r, Color(col, 0.14), true, -1.0, false)
			draw_circle(Vector2.ZERO, r * k, Color(col, 0.3), true, -1.0, false)
			draw_arc(Vector2.ZERO, r, 0, TAU, 28, Color(col.lightened(0.2), 0.95), 2.0)
		else:
			var e := (t - warn) / BLAST
			draw_circle(Vector2.ZERO, r * (0.7 + 0.5 * e), Color(1, 0.97, 0.9, 0.75 * (1.0 - e)), true, -1.0, false)
			draw_arc(Vector2.ZERO, r * (0.9 + 0.8 * e), 0, TAU, 28, Color(col.lightened(0.3), 1.0 - e), 3.0)
		draw_set_transform_matrix(base)
		if m["pillar"]:
			_draw_pillar(pos, r, t, warn, col)
		elif t > warn - 0.3 and t < warn:  # 떨어지는 빛 덩이
			var f := (t - (warn - 0.3)) / 0.3
			var head := pos + Vector2(0, -220.0 * (1.0 - f * f))
			draw_line(head, head + Vector2(0, -50), Color(col.lightened(0.3), 0.6), 7.0)
			draw_circle(head, 7.0, col, true, -1.0, false)
			draw_circle(head, 4.0, Color(1, 1, 1, 0.9), true, -1.0, false)


## 하늘에서 내려앉는 빛기둥(예고 마지막 0.5초에 위에서 내려와 땅에 꽂힘 → 잠깐 머물며 깃털)
func _draw_pillar(pos: Vector2, r: float, t: float, warn: float, col: Color) -> void:
	var w := r * 0.9
	if t < warn:
		var start := warn - 0.5
		if t < start:
			# 하늘에서 내려올 자리: 가는 빛줄기만
			draw_rect(Rect2(pos.x - 1.5, pos.y - 420.0, 3.0, 420.0), Color(1, 0.95, 0.75, 0.25 * (t / start)))
			return
		var f := (t - start) / 0.5
		var bottom := pos.y - 420.0 * (1.0 - f * f)
		var ww := w * (0.35 + 0.65 * f)
		draw_rect(Rect2(pos.x - ww, pos.y - 460.0, ww * 2.0, bottom - (pos.y - 460.0)), Color(col.lightened(0.5), 0.35))
		draw_rect(Rect2(pos.x - ww * 0.45, pos.y - 460.0, ww * 0.9, bottom - (pos.y - 460.0)), Color(1, 1, 0.95, 0.75))
	else:
		var e := (t - warn) / BLAST
		var ww := w * (1.0 + 0.3 * e)
		draw_rect(Rect2(pos.x - ww, pos.y - 460.0, ww * 2.0, 460.0), Color(col.lightened(0.5), 0.5 * (1.0 - e)))
		draw_rect(Rect2(pos.x - ww * 0.4, pos.y - 460.0, ww * 0.8, 460.0), Color(1, 1, 1, 0.9 * (1.0 - e)))
		# 흩날리는 깃털
		for i in 6:
			var a := i * 1.05 + pos.x * 0.01
			var q := pos + Vector2(cos(a) * r * (0.5 + e), -20.0 - e * 40.0 + sin(a * 3.0) * 10.0)
			draw_colored_polygon(PackedVector2Array([q + Vector2(0, -4), q + Vector2(2, 0), q + Vector2(0, 4), q + Vector2(-2, 0)]), Color(1, 1, 1, 1.0 - e))
