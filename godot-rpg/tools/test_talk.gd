extends Node
## 마을 사람 앞에서 공격(검) 버튼을 누르면 대화창이 뜨는지 확인(헤드리스). 말풍선이 뜨는 거리에서도 돼야 한다.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.quest = {"main": 0, "progress": 0}
	Quests._ensure()
	var world := (load("res://features/world/village.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	for e in get_tree().get_nodes_in_group(&"enemies"):
		e.queue_free()
	var player := get_tree().get_first_node_in_group(&"player") as Player
	var npc: Npc = null
	for n in get_tree().get_nodes_in_group(&"npcs"):
		if (n as Npc).display_name != "촌장":
			npc = n
			break
	_check("마을 사람이 있다", npc != null)
	player.global_position = npc.global_position + Vector2(0, 34)  # 말풍선은 뜨지만 몸은 안 닿는 거리
	await get_tree().physics_frame
	await get_tree().process_frame
	_check("말풍선 거리 안 (%.0f)" % player.global_position.distance_to(npc.global_position), player.global_position.distance_to(npc.global_position) < Npc.TALK_RANGE)
	Input.action_press(&"attack")
	await get_tree().physics_frame
	await get_tree().physics_frame
	Input.action_release(&"attack")
	var box := false
	for n in get_tree().get_nodes_in_group(&"hud"):
		for c in n.get_children():
			if c is StoryBox:
				box = true
	_check("검 버튼 → 대화창", box)
	get_tree().paused = false
	print("결과: " + ("통과" if fails == 0 else "실패 %d개" % fails))
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
