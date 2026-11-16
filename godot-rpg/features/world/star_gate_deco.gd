extends Node2D
## 부서진 별의 신전: 북쪽 돌 아치 안에 떠 있는 별빛 고리(전이문), 하늘에서 내려오는 빛기둥, 천천히 떨어지는 별 가루.
## build_world가 전이 신전 맵에 붙인다. 고대 거인의 혼을 잡기 전에는 고리가 꺼져 있다(이 맵은 그 뒤에야 오지만 혹시 몰라).

@export var area := Vector2(640, 480)
@export var gate := Vector2(320, 40)
@export var seed_value := 11

var _dust: Array[Array] = []  # [기준 위치, 속도, 위상, 크기]
var _t := 0.0


func _ready() -> void:
	z_index = 20
	var rng := RandomNumberGenerator.new()
	rng.seed = seed_value
	for i in 40:
		_dust.append([Vector2(rng.randf_range(0, area.x), rng.randf_range(0, area.y)), rng.randf_range(6, 16), rng.randf() * TAU, rng.randf_range(0.8, 1.8)])


func _process(delta: float) -> void:
	_t += delta
	if Engine.get_process_frames() % 2 == 0:
		queue_redraw()  # 휴대폰 렉 줄이기


func _draw() -> void:
	var open := Quests.boss_defeated("giant_soul")
	var c := gate + Vector2(0, 26)
	var pulse := 0.5 + 0.5 * sin(_t * 1.8)
	var col := Color(0.78, 0.55, 1.0) if open else Color(0.45, 0.45, 0.55)
	# 하늘에서 내려오는 빛기둥
	if open:
		var w := 26.0 + pulse * 6.0
		draw_colored_polygon(PackedVector2Array([c + Vector2(-w, -60), c + Vector2(w, -60), c + Vector2(w * 0.6, 30), c + Vector2(-w * 0.6, 30)]), Color(0.85, 0.7, 1.0, 0.12 + 0.06 * pulse))
	# 별빛 고리: 두 겹, 반대로 도는 별 6개
	draw_circle(c, 30.0 + pulse * 3.0, Color(col, 0.10 + 0.08 * pulse))
	draw_arc(c, 22.0, 0, TAU, 48, Color(col, 0.55 + 0.35 * pulse), 2.5)
	draw_arc(c, 15.0, _t * 0.8, _t * 0.8 + TAU * 0.75, 40, Color(col.lightened(0.3), 0.6), 1.5)
	for k in 6:
		var a := _t * (0.6 if open else 0.1) + k * TAU / 6.0
		var p := c + Vector2.from_angle(a) * 22.0
		draw_circle(p, 2.0, Color(1, 0.95, 1.0, 0.7 + 0.3 * pulse))
	if open:
		draw_circle(c, 6.0 + pulse * 2.0, Color(1, 0.9, 1.0, 0.75))
	# 천천히 떨어지는 별 가루(반짝)
	for d in _dust:
		var base: Vector2 = d[0]
		var pos := base + Vector2(sin(_t * 0.5 + d[2]) * 10.0, fposmod(_t * float(d[1]), 80.0) - 40.0)
		var a2 := 0.3 + 0.4 * sin(_t * 2.5 + float(d[2]) * 3.0)
		draw_circle(pos, float(d[3]) * 2.6, Color(0.8, 0.65, 1.0, a2 * 0.15))
		draw_circle(pos, float(d[3]), Color(1, 0.95, 1.0, a2))
