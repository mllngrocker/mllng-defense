extends StepAttack
## 근거리 창(리프): 앞으로 길게 세 번 찌르고, 마지막은 멀리 내지르며 꿰뚫는 돌진 찌르기. 닿는 거리는 길고 폭은 좁다.

const SPARK := preload("res://assets/ninja/fx/spark.png")
const CUT := preload("res://assets/ninja/fx/cut.png")


func _init() -> void:
	steps = [
		{"mult": 0.6, "knock": 70.0, "radius": 9.0, "reach": 24.0, "lunge": 50.0},
		{"mult": 0.6, "knock": 70.0, "radius": 9.0, "reach": 24.0, "lunge": 50.0},
		{"mult": 0.75, "knock": 90.0, "radius": 10.0, "reach": 26.0, "lunge": 60.0},
		{"mult": 1.6, "knock": 260.0, "radius": 12.0, "reach": 30.0, "lunge": 300.0},
	]
	step_time = 0.14
	aim_range = 64.0


func _on_swing(i: int) -> void:
	Game.sfx(&"slash", -9.0 + i, 0.2)
	player.squash(Vector2(1.1, 0.92), 0.06)


func _on_hit(i: int) -> void:
	var tip := player.body_center() + aim * (26.0 if not is_finisher(i) else 34.0)
	spawn_fx(CUT, 4, player.body_center() + aim * 14.0, aim.angle(), 30.0, 1.4 if not is_finisher(i) else 1.8, data.trail_color)
	spawn_fx(SPARK, 10, tip, aim.angle(), 30.0, 0.7 if not is_finisher(i) else 1.1, Color(1, 1, 0.85))
	if is_finisher(i):
		Game.add_shake(2.5)
