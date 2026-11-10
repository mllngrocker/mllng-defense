extends Node
## 스킬 확인용(헤드리스): 캐릭터 10명마다 필드에 허수아비 몬스터 3마리를 세우고 스킬을 써서
## 피해가 들어가는지, 재사용 대기가 걸리는지 본다.
## 실행: godot --headless --path godot-rpg res://tools/test_skills.tscn

var fails := 0


func _ready() -> void:
	Save.persist = false
	Game.hitstop_enabled = false
	for id in Save.ROSTER:
		await _try(id)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _try(id: StringName) -> void:
	Save.selected = id
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var player := get_tree().get_first_node_in_group(&"player") as Player
	var enemies := get_tree().get_nodes_in_group(&"enemies")
	var dummies: Array[Enemy] = []
	for i in enemies.size():
		var e := enemies[i] as Enemy
		if i < 3:
			e.global_position = player.global_position + Vector2(-16 + i * 16, 24)
			e.max_hp = 9999
			e.hp = 9999
			e.set_physics_process(false)
			dummies.append(e)
		else:
			e.queue_free()
	player.dir = Player.Dir.DOWN
	await get_tree().physics_frame
	var cast := player.skills.try_cast()
	var again := player.skills.try_cast()
	for i in 200:  # 스킬이 다 끝날 때까지(약 3.3초)
		await get_tree().physics_frame
	var lost := 0
	for e in dummies:
		if is_instance_valid(e):
			lost += e.max_hp - e.hp
	_check("%s %s: 피해 %d, 재사용 대기 %.0f초" % [id, player.data.skill_name, lost, player.data.skill_cooldown], cast and not again and lost > 0 and player.skills.cooldown > 0.0)
	world.queue_free()
	await get_tree().process_frame


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
