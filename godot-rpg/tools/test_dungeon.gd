extends Node
## 일일 던전·방치 보상 확인(헤드리스): 입장 횟수, 파도처럼 나오는 몬스터, 자동 사냥으로 처치, 끝나면 결과 창과 보상.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.quest = {}
	# 방치 보상: 2시간이면 몬스터 600마리 몫, 장비 2개, 물약 2개
	Save.quest["bosses"] = {"king_slime": true, "cyclope_king": true}
	var r := IdleReward.compute(7200)
	_check("방치 2시간 → 처치 %d · 골드 %d · 장비 %d · 물약 %d" % [r["kills"], r["gold"], (r["gear"] as Array).size(), r["potion"]], int(r["kills"]) == 600 and int(r["gold"]) == 600 * 30 / 10 and (r["gear"] as Array).size() == 2 and int(r["potion"]) == 2)
	_check("12시간 넘게 비워도 12시간까지만", int(IdleReward.compute(3600 * 30)["minutes"]) == 720)
	var g := Save.gold
	IdleReward.grant(r)
	_check("받기 → 골드가 들어온다", Save.gold > g)
	# 입장 횟수
	Save.quest = {}
	_check("하루 3번", Quests.dungeon_left() == 3 and Quests.use_dungeon() and Quests.dungeon_left() == 2)
	Quests.use_dungeon()
	Quests.use_dungeon()
	_check("다 쓰면 못 들어간다", not Quests.use_dungeon())
	# 던전 한 판(시간을 줄여서)
	Game.dungeon = "gear"
	var world := (load(DungeonDirector.SCENE) as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var dd := world.get_node(^"Dungeon") as DungeonDirector
	_check("투기장에 감독이 붙는다", dd != null and dd.kind == "gear")
	var player := get_tree().get_first_node_in_group(&"player") as Player
	player.max_hp = 99999
	player.hp = 99999
	player.auto = true
	dd.time_left = 14.0
	for i in 60 * 24:  # 타격 멈춤(시간 느려짐)이 있어 넉넉히
		await get_tree().physics_frame
		if dd.done:
			break
	_check("몬스터가 나오고 자동 사냥으로 잡는다 (%d마리)" % dd.kills, dd.kills >= 4)
	_check("시간이 끝나면 결과 창", dd.done and get_tree().paused)
	_check("던전에선 이어하기 자리를 안 바꾼다", not String(Save.place.get("map", "")).ends_with("dungeon.tscn"))
	get_tree().paused = false
	Game.dungeon = ""
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
