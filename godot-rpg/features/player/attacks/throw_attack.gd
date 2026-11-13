extends AttackStyle
## 원거리 표창(레비): 표창을 던지면 멀리 날아갔다가 돌아온다. 갈 때 한 번, 돌아올 때 한 번 맞힌다(꿰뚫음).
## 세 번째마다 표창 세 개를 부채꼴로 던진다.

const KUNAI := preload("res://assets/ninja/fx/kunai.png")
const SPARK := preload("res://assets/ninja/fx/spark.png")
const COOLDOWN := 0.3
const RANGE := 140.0
const FLY_TIME := 0.32  # 가는 데 걸리는 시간(돌아오는 것도 같다)
const AIM_RANGE := 170.0

var cooldown := 0.0
var count := 0


func wants_press() -> bool:
	return cooldown <= 0.0


func press() -> void:
	cooldown = COOLDOWN
	count += 1
	var aim := player.aim(AIM_RANGE)
	var dirs: Array[Vector2] = [aim]
	if count % 3 == 0:
		dirs = [aim.rotated(-0.25), aim, aim.rotated(0.25)]
	for d in dirs:
		_throw(d)
	Game.sfx(&"slash", -7.0, 0.2)
	player.squash(Vector2(1.06, 0.95), 0.05)


func physics(delta: float) -> void:
	cooldown -= delta


func _throw(d: Vector2) -> void:
	var star := Sprite2D.new()
	star.texture = KUNAI
	star.z_index = 4
	star.modulate = data.trail_color.lerp(Color.WHITE, 0.4)
	player.fx_parent().add_child(star)
	var start := player.body_center()
	star.global_position = start
	var hit_out: Array = []
	var hit_back: Array = []
	var prev := [start]  # 지난 프레임 자리(그 사이 구간 전체로 맞힌다: 프레임이 느려도 안 빠뜨린다)
	var tw := star.create_tween()
	tw.tween_method(func(k: float) -> void:
		if not is_instance_valid(player):
			return
		# 0~1 갔다가 1~2 돌아온다(돌아올 땐 지금 용사 자리로)
		var back := k > 1.0
		var p := start.lerp(start + d * RANGE, k) if not back else (start + d * RANGE).lerp(player.body_center(), k - 1.0)
		star.global_position = p
		var from: Vector2 = prev[0]
		prev[0] = p
		star.rotation += 0.6
		var list: Array = hit_back if back else hit_out
		for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
			if int(e.get(&"hp")) > 0 and not list.has(e) and Geometry2D.get_closest_point_to_segment(e.global_position + Vector2(0, -8), from, p).distance_to(e.global_position + Vector2(0, -8)) < 16.0:
				list.append(e)
				player.hit(e, 0.65, 70.0, p)
				spawn_fx(SPARK, 10, p, d.angle(), 30.0, 0.6, Color(1, 1, 0.85)), 0.0, 2.0, FLY_TIME * 2.0)
	tw.tween_callback(star.queue_free)
