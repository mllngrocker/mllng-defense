extends Node
## 퀘스트 자동 이동 확인(헤드리스): 맵 사이 길 찾기, 막힌 길, 그리고 실제로 레몬 마을 → 초원 → 꽃바람 언덕까지 걸어간다.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.quest = {"main": 0, "progress": 0}
	Quests._ensure()
	# 길 찾기
	var r := Travel.route("village", "hill")
	_check("레몬 마을 → 꽃바람 언덕: %s" % " → ".join(r), r == ["village", "field", "hill"])
	_check("숲의 주인을 안 잡으면 사막 길은 막힘", Travel.route("forest", "desert").is_empty())
	Quests.mark_boss("king_slime")
	_check("잡으면 열림", Travel.route("village", "desert").size() > 3)
	# 퀘스트 → 목적지
	var q := {}
	for m in Quests.MAIN:
		if m["title"] == "오아시스 마을":
			q = m
	var p := Travel.plan(q, "village")
	_check("'족장에게 말 걸기' → 오아시스 마을로 (%s)" % p.get("goal", p.get("error")), p.get("goal") == "desert_town")
	_check("로비에서 하는 퀘스트는 이동 안 함", Travel.plan({"type": "pull", "target": "", "desc": "소환"}, "village").has("error"))
	# 실제로 걸어가기(맵이 바뀌어도 시험 노드는 남게 맵을 루트에 붙인다)
	for k in Quests.MAIN.size():
		if Quests.MAIN[k]["title"] == "꽃바람 언덕으로":
			Save.quest["main"] = k
	var world := (load("res://features/world/village.tscn") as PackedScene).instantiate()
	get_tree().root.add_child.call_deferred(world)
	await get_tree().process_frame
	await get_tree().process_frame
	get_tree().current_scene = world
	for e in get_tree().get_nodes_in_group(&"enemies"):
		e.queue_free()
	var player := get_tree().get_first_node_in_group(&"player") as Player
	player.max_hp = 999999
	player.hp = 999999
	_check("자동 이동 시작", Travel.start(get_tree()) == "" and Game.travel["goal"] == "hill")
	var seen: Array[String] = []
	for i in 60 * 120:
		await get_tree().physics_frame
		var w := get_tree().get_first_node_in_group(&"world")
		if w and is_instance_valid(w) and w.is_inside_tree():
			var id: String = w.call(&"map_id")
			if seen.is_empty() or seen[-1] != id:
				seen.append(id)
				var pl := get_tree().get_first_node_in_group(&"player") as Player
				if pl:
					pl.max_hp = 999999
					pl.hp = 999999
		if not Travel.active():
			break
	_check("지나온 맵: %s" % " → ".join(seen), seen.size() >= 3 and seen[-1] == "hill")
	_check("도착하면 자동 이동이 끝나고 퀘스트 완료", not Travel.active() and Quests.main_done())
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
