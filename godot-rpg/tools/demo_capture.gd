extends Node
## 화면 확인용 연출: 용사가 가장 가까운 몬스터에게 걸어가서 벤다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 60 --quit-after 240 res://tools/demo_capture.tscn

var player: Player
var t := 0.0


func _ready() -> void:
	Game.hitstop_enabled = false
	Save.persist = false
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			Save.selected = StringName(a.trim_prefix("--char="))
	add_child((load("res://features/world/world.tscn") as PackedScene).instantiate())
	player = get_tree().get_first_node_in_group(&"player") as Player
	if "--showcase" in OS.get_cmdline_user_args():
		_setup_showcase()


## 공격 확인용: 교차로 광장에 용사를 두고 앞에 허수아비 몬스터 3마리를 세운다.
func _setup_showcase() -> void:
	var enemies := get_tree().get_nodes_in_group(&"enemies")
	player.global_position = Vector2(32 * 16 + 8, 21 * 16)
	for i in enemies.size():
		var e := enemies[i] as Enemy
		if i < 3:
			e.global_position = player.global_position + Vector2(-14 + i * 14, 26 + (i % 2) * 6)
			e.max_hp = 9999
			e.hp = 9999
			e.home = e.global_position
			e.set_physics_process(false)
		else:
			e.queue_free()


func _physics_process(delta: float) -> void:
	t += delta
	for a: StringName in [&"move_left", &"move_right", &"move_up", &"move_down", &"attack"]:
		Input.action_release(a)
	var target := _nearest_enemy()
	if target == null or player.hp <= 0:
		return
	var to := target.global_position - player.global_position
	if to.length() > (90.0 if Save.current().attack_kind in [CharacterData.AttackKind.MAGIC, CharacterData.AttackKind.BOW] else 22.0):
		if to.x < -4.0:
			Input.action_press(&"move_left")
		elif to.x > 4.0:
			Input.action_press(&"move_right")
		if to.y < -4.0:
			Input.action_press(&"move_up")
		elif to.y > 4.0:
			Input.action_press(&"move_down")
	elif fmod(t, 2.5) < 1.5:
		if int(t * 6.0) % 2 == 0:
			Input.action_press(&"attack")  # 연타
	else:
		Input.action_press(&"attack")  # 꾹 누르기(모아 쏘기)


func _nearest_enemy() -> Node2D:
	var best: Node2D = null
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if best == null or e.global_position.distance_to(player.global_position) < best.global_position.distance_to(player.global_position):
			best = e
	return best
