extends Node2D
## 넝쿨 숲 분위기: 나무 사이로 늘어진 덩굴 커튼(살랑살랑), 떠다니는 초록 빛 알갱이, 북쪽 넝쿨 문의 봉인(숨 쉬듯 빛나는 고리).
## build_world가 넝쿨 숲 맵에 붙인다. 맵 크기(px)와 문 자리를 받는다.

@export var area := Vector2(640, 480)
@export var gate := Vector2(320, 40)
@export var seed_value := 7

var _vines: Array[Array] = []  # [위치, 길이, 굵기, 흔들림 위상]
var _motes: Array[Array] = []  # [기준 위치, 속도, 위상, 크기]
var _t := 0.0


func _ready() -> void:
	z_index = 20
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	# 덩굴: 맵 위쪽 가장자리와 문 둘레에 빽빽하게, 나머지는 띄엄띄엄
	for i in 110:
		var p := Vector2(rng.randf_range(0, area.x), rng.randf_range(0, 56))
		if absf(p.x - gate.x) < 40.0:
			continue  # 문 앞 길은 비워 둔다
		_vines.append([p, rng.randf_range(24, 70), rng.randf_range(1.5, 3.0), rng.randf() * TAU])
	for i in 16:
		var p := gate + Vector2(rng.randf_range(-44, 44), rng.randf_range(-12, 0))
		_vines.append([p, rng.randf_range(30, 80), rng.randf_range(2.0, 3.5), rng.randf() * TAU])
	for i in 90:  # 아래쪽 가장자리에도 빽빽하게(남쪽 문 앞은 비움)
		var p := Vector2(rng.randf_range(0, area.x), rng.randf_range(area.y - 120, area.y - 40))
		if absf(p.x - area.x / 2.0) < 34.0:
			continue
		_vines.append([p, rng.randf_range(24, 60), rng.randf_range(1.5, 3.0), rng.randf() * TAU])
	for i in 40:
		var p := Vector2(rng.randf_range(0, area.x), rng.randf_range(60, area.y - 60))
		_vines.append([p, rng.randf_range(16, 40), rng.randf_range(1.2, 2.2), rng.randf() * TAU])
	for i in 60:
		_motes.append([Vector2(rng.randf_range(0, area.x), rng.randf_range(0, area.y)), rng.randf_range(4, 12), rng.randf() * TAU, rng.randf_range(1.0, 2.2)])


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


func _draw() -> void:
	# 북쪽 넝쿨 문: 바닥에 빛나는 봉인 고리
	var open := Quests.boss_defeated("demon_lord")
	var pulse := 0.5 + 0.5 * sin(_t * 1.6)
	var gc := Color(0.55, 1.0, 0.6) if not open else Color(1.0, 0.95, 0.6)
	var c := gate + Vector2(0, 40)
	if not open:  # 아치 입구를 꽁꽁 막은 넝쿨 매듭
		for k in 9:
			var y0 := gate.y + 2.0 + k * 4.0
			var sw := sin(_t * 0.7 + k) * 1.5
			draw_line(gate + Vector2(-20, y0 - gate.y + sw), gate + Vector2(20, y0 - gate.y + 14.0 - sw), Color(0.1, 0.28, 0.12), 3.5)
			draw_line(gate + Vector2(20, y0 - gate.y - sw), gate + Vector2(-20, y0 - gate.y + 14.0 + sw), Color(0.3, 0.6, 0.26), 2.5)
		for k in 8:
			draw_circle(gate + Vector2(-16 + k * 4.5, 8 + (k % 3) * 9), 2.4, Color(0.4, 0.75, 0.35))
	draw_circle(c, 34.0 + pulse * 4.0, Color(gc, 0.08 + 0.06 * pulse))
	draw_arc(c, 26.0, 0, TAU, 48, Color(gc, 0.35 + 0.3 * pulse), 1.5)
	draw_arc(c, 18.0, _t * 0.4, _t * 0.4 + TAU * 0.8, 40, Color(gc, 0.25 + 0.25 * pulse), 1.0)
	for k in 6:
		var a := _t * -0.3 + k * TAU / 6.0
		draw_circle(c + Vector2.from_angle(a) * 22.0, 1.6, Color(gc, 0.6 + 0.4 * pulse))
	# 늘어진 덩굴(잎이 달린 구불구불한 줄)
	for v in _vines:
		var p: Vector2 = v[0]
		var length: float = v[1]
		var w: float = v[2]
		var ph: float = v[3]
		var pts := PackedVector2Array()
		var n := int(length / 4.0)
		for i in n + 1:
			var k := float(i) / n
			pts.append(p + Vector2(sin(_t * 0.9 + ph + k * 3.0) * 3.0 * k, k * length))
		draw_polyline(pts, Color(0.12, 0.32, 0.14, 0.95), w + 1.0)
		draw_polyline(pts, Color(0.27, 0.55, 0.24, 0.95), w)
		for i in range(2, pts.size(), 3):
			var side := 1.0 if i % 2 == 0 else -1.0
			var leaf := pts[i] + Vector2(side * 3.0, 1.0)
			draw_circle(leaf, 2.2, Color(0.2, 0.5, 0.2))
			draw_circle(leaf + Vector2(-0.5, -0.5), 1.3, Color(0.45, 0.78, 0.38))
	# 떠다니는 빛 알갱이(반딧불처럼 깜빡)
	for m in _motes:
		var base: Vector2 = m[0]
		var sp: float = m[1]
		var ph2: float = m[2]
		var r: float = m[3]
		var pos := base + Vector2(sin(_t * 0.4 + ph2) * 18.0, fposmod(-_t * sp, 60.0) - 30.0)
		var a2 := 0.35 + 0.35 * sin(_t * 2.2 + ph2 * 3.0)
		draw_circle(pos, r * 3.0, Color(0.6, 1.0, 0.55, a2 * 0.18))
		draw_circle(pos, r, Color(0.85, 1.0, 0.7, a2))
