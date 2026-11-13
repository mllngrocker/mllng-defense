extends StepAttack
## 근거리 채찍(베리): 앞쪽 반원을 넓게 훑어 여러 적을 한 번에 때리고, 마지막은 한 바퀴 휘돌려 둘레를 모두 친다.

const SLASH := preload("res://assets/ninja/fx/slash_double.png")
const CIRCULAR := preload("res://assets/ninja/fx/circular_slash.png")


func _init() -> void:
	steps = [
		{"mult": 0.55, "knock": 80.0, "radius": 22.0, "reach": 14.0, "lunge": 30.0},
		{"mult": 0.55, "knock": 80.0, "radius": 22.0, "reach": 14.0, "lunge": 30.0},
		{"mult": 0.7, "knock": 110.0, "radius": 24.0, "reach": 15.0, "lunge": 30.0},
		{"mult": 1.3, "knock": 240.0, "radius": 36.0, "reach": 0.0, "lunge": 0.0},
	]
	step_time = 0.16
	aim_range = 60.0


func _on_swing(i: int) -> void:
	Game.sfx(&"slash", -8.0 + i, 0.25)
	player.squash(Vector2(1.12, 0.9) if not is_finisher(i) else Vector2(0.9, 1.1), 0.06)


func _on_hit(i: int) -> void:
	if is_finisher(i):
		spawn_fx(CIRCULAR, 4, player.body_center(), 0.0, 22.0, 2.2, data.trail_color)
		Game.add_shake(2.0)
		return
	var f := spawn_fx(SLASH, 4, player.body_center() + aim * 16.0, aim.angle() + (0.4 if i % 2 else -0.4), 28.0, 1.7, data.trail_color)
	f.flip_v = i % 2 == 1
