extends StepAttack
## 근거리 쌍검(시로·벨라): 왼칼·오른칼을 번갈아 아주 빠르게 여섯 번, 마지막은 두 칼로 X자 베기.
## 벨라(암살자)는 마지막 X자 베기가 더 세고, 체력 30% 이하 적은 한 번 더 벤다(처형).

const CUT := preload("res://assets/ninja/fx/cut.png")
const CUT_X := preload("res://assets/ninja/fx/cut_x.png")
const ASSASSINS: Array[StringName] = [&"devil2"]


func _init() -> void:
	steps = []
	for k in 6:
		steps.append({"mult": 0.4, "knock": 40.0, "radius": 11.0, "reach": 11.0, "lunge": 70.0})
	steps.append({"mult": 1.5, "knock": 220.0, "radius": 15.0, "reach": 10.0, "lunge": 40.0})
	step_time = 0.085
	hit_at = 0.035
	combo_reset = 0.4
	finish_cooldown = 0.28


func _on_swing(i: int) -> void:
	if not is_finisher(i):
		var f := spawn_fx(CUT, 4, player.body_center() + aim * 11.0 + aim.orthogonal() * (5.0 if i % 2 else -5.0), aim.angle() + (0.6 if i % 2 else -0.6), 34.0, 0.75, data.trail_color)
		f.flip_v = i % 2 == 1
		Game.sfx(&"slash", -11.0 + i * 0.5, 0.2)
	player.squash(Vector2(1.05, 0.96), 0.04)


func _on_hit(i: int) -> void:
	if not is_finisher(i):
		return
	var assassin := ASSASSINS.has(data.id)
	var c := player.body_center() + aim * 8.0
	var tint := Color(0.8, 0.15, 0.3) if assassin else data.trail_color
	spawn_fx(CUT_X, 4, c, aim.angle(), 24.0, 1.3 if assassin else 1.15, tint)
	Game.sfx(&"slash", 0.0)
	Game.add_shake(2.5)
	if assassin:  # 처형: 체력 30%(7성 40%) 이하 적은 한 번 더
		var line := 0.4 if Save.is_owned(data.id) and Save.rank_of(data.id) >= 7 else 0.3
		for e: Node2D in player.get_tree().get_nodes_in_group(&"enemies"):
			var hp := int(e.get(&"hp"))
			if hp > 0 and e.global_position.distance_to(c) < 26.0 and hp <= int(e.get(&"max_hp")) * line:
				player.hit(e, 1.5, 220.0, player.global_position)
