extends Node
## 가방·귀환서·이어하기 확인(헤드리스): 아이템 줍기, 물약, 로비에 갔다 와도 그 자리, 마을 귀환서.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.items = Save.START_ITEMS.duplicate()
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var player := get_tree().get_first_node_in_group(&"player") as Player
	for e in get_tree().get_nodes_in_group(&"enemies"):
		e.queue_free()
	# 줍기
	var before := Save.item_count(&"potion")
	ItemPickup.spawn(player.get_parent(), &"potion", player.global_position)
	for i in 10:
		await get_tree().physics_frame
	_check("물약 줍기 → 가방 +1 (%d → %d)" % [before, Save.item_count(&"potion")], Save.item_count(&"potion") == before + 1)
	# 물약
	player.hp = 10
	var n := Save.item_count(&"potion")
	_check("물약 마시기 → 체력 회복", Items.use(&"potion", get_tree()) and player.hp > 10 and Save.item_count(&"potion") == n - 1)
	# 가방 창
	var bag := ItemWindow.new()
	add_child(bag)
	await get_tree().process_frame
	_check("가방 창이 열리면 게임이 멈춘다", get_tree().paused)
	bag.close()
	_check("닫으면 다시 움직인다", not get_tree().paused)
	# 자리 기억 → 이어하기
	player.global_position = Vector2(300, 200)
	world.remember_place()
	_check("로비 가기 전 자리 기억 (%s)" % Save.place.get("map", ""), String(Save.place.get("map", "")).ends_with("world.tscn") and is_equal_approx(float(Save.place["x"]), 300.0))
	world.queue_free()
	await get_tree().process_frame
	Game.resume_pos = Vector2(Save.place["x"], Save.place["y"])
	var world2 := (load(Save.place["map"]) as PackedScene).instantiate()
	add_child(world2)
	await get_tree().physics_frame
	var p2 := get_tree().get_first_node_in_group(&"player") as Player
	_check("모험을 누르면 그 자리에서 다시 시작 (%s)" % p2.global_position, p2.global_position.distance_to(Vector2(300, 200)) < 2.0)
	# 귀환서
	Save.last_town = "snow_town"
	var s := Save.item_count(&"return_scroll")
	_check("귀환서 → 마지막 마을로 (남은 %d장)" % (s - 1), Items.use(&"return_scroll", get_tree()) and Save.item_count(&"return_scroll") == s - 1 and Save.place.is_empty())
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
