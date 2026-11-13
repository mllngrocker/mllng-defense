extends Node
## 맵 확인용(헤드리스): 모든 맵이 열리고, 이동문이 있는 맵(또는 아직 없는 다음 장)으로 이어지고,
## 넘어오면 도착 자리에 서는지. 마을엔 몬스터가 없고 사람이 있는지, 사냥터엔 몬스터가 있는지, 보스 맵엔 보스가 있는지.
## 실행: godot --headless --path godot-rpg res://tools/test_maps.tscn

const MAPS := ["village", "world", "hill", "forest", "desert", "desert2", "desert3", "shore", "snowgate",
	"swamp", "ruinvillage", "crystalcave", "waterfall", "beach",
	"snow1", "snow2", "snow3", "snow4", "snow5", "snow6",
	"temple1", "temple2", "temple3", "temple4", "temple5", "temple6",
	"lava1", "lava2", "lava3", "lava4", "lava5", "lava6", "hell1", "hell2", "hell3", "hell4", "hell5", "hell6",
	"sky1", "sky2", "sky3", "sky4", "sky5", "sky6",
	"root1", "root2", "root3", "root4", "root5", "root6", "garden1", "garden2", "garden3", "garden4", "garden5", "garden6",
	"mist1", "mist2", "mist3", "mist4", "mist5", "mist6",
	"desert_town", "snow_town", "temple_town", "lava_town", "sky_town", "root_town", "mist_town"]
const BOSS_MAPS := {"forest": "KingSlime", "desert3": "CyclopeKing", "crystalcave": "SpiderQueen", "snow6": "YetiKing",
	"temple6": "Kraken", "lava6": "FlameDragon", "hell6": "DemonLord", "sky6": "StormKing", "root4": "RootWorm", "root6": "GiantSoul", "garden6": "BlackGardener", "mist6": "MistApostle"}
const PEACEFUL := ["village", "shore", "snowgate", "desert_town", "snow_town", "temple_town", "lava_town", "sky_town", "root_town", "mist_town"]

var fails := 0


func _ready() -> void:
	Save.persist = false
	for key: String in MAPS:
		await _check_map(key)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check_map(key: String) -> void:
	var path := "res://features/world/%s.tscn" % key
	if not ResourceLoader.exists(path):
		_check("%s: 맵 파일 있음" % key, false)
		return
	# 각 도착 자리로 들어와 보기
	var spawns: Array[String] = [""]
	var probe := (load(path) as PackedScene).instantiate()
	for m in probe.get_node(^"Spawns").get_children():
		spawns.append(String(m.name))
	probe.free()
	for spawn in spawns:
		Game.next_spawn = spawn
		var world := (load(path) as PackedScene).instantiate()
		add_child(world)
		await get_tree().physics_frame
		var player := world.get_node(^"%Player") as Player
		if spawn != "":
			var mark := world.get_node(NodePath("Spawns/" + spawn)) as Node2D
			if player.global_position.distance_to(mark.global_position) >= 1.0:
				_check("%s: %s 쪽 도착 자리" % [key, spawn], false)
		else:
			var portals := world.find_children("Portal_*", "", true, false)
			var ok := not portals.is_empty()
			for p in portals:
				var target: String = p.get(&"target_scene")
				var future: bool = p.get(&"requires_boss") != "" and not ResourceLoader.exists(target)
				ok = ok and (future or ResourceLoader.exists(target))
			var enemies := get_tree().get_nodes_in_group(&"enemies").size()
			var npcs := world.find_children("*", "Npc", true, false).size()
			var line := "%s: 이동문 %d개, 몬스터 %d, 사람 %d" % [key, portals.size(), enemies, npcs]
			if key in PEACEFUL:
				ok = ok and enemies == 0 and npcs >= 1
			else:
				ok = ok and enemies >= 6
			if key == "village":
				ok = ok and npcs >= 10 and portals.size() == 4
			if BOSS_MAPS.has(key):
				ok = ok and world.find_children(BOSS_MAPS[key], "", true, false).size() == 1
				line += ", 보스 " + BOSS_MAPS[key]
			_check(line, ok)
		world.queue_free()
		await get_tree().process_frame


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
