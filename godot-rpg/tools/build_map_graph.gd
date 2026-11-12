extends Node
## 맵 연결 지도 만들기: 모든 맵 장면을 열어 이동문(갈 곳·막는 보스)·마을 사람·몬스터 종류를 모아 data/map_graph.gd(MapGraph.DATA)에 적는다.
## 퀘스트 자동 이동(Travel)이 이 지도로 길을 찾는다. 맵을 다시 만들면(build_world) 이것도 다시 돌린다.
## 실행: godot --headless --path godot-rpg res://tools/build_map_graph.tscn

const DIR := "res://features/world/"


func _ready() -> void:
	var out := {}
	for f in DirAccess.get_files_at(DIR):
		if not f.ends_with(".tscn") or f == "dungeon.tscn":
			continue
		var path := DIR + f
		var scene := load(path) as PackedScene
		if scene == null:
			continue
		var root := scene.instantiate()
		if root.get_node_or_null(^"Ground") == null:
			root.free()
			continue
		var id := "field" if f == "world.tscn" else f.get_basename()
		var doors: Array = []
		var npcs: Array = []
		var mobs: Array = []
		for n in root.find_children("*", "", true, false):
			if n is Portal:
				var p := n as Portal
				if p.target_scene != "":
					var to := p.target_scene.get_file().get_basename()
					doors.append({"to": "field" if to == "world" else to, "boss": p.requires_boss, "x": p.position.x, "y": p.position.y})
			elif n is Npc and (n as Npc).display_name != "":
				npcs.append((n as Npc).display_name)
			elif n.scene_file_path.begins_with("res://features/enemy/"):
				var k := n.scene_file_path.get_file().get_basename()
				if not k in mobs:
					mobs.append(k)
		out[id] = {"scene": path, "doors": doors, "npcs": npcs, "mobs": mobs}
		root.free()
	# 스크립트 상수로 저장(웹 빌드에도 그대로 들어간다)
	var fa := FileAccess.open("res://data/map_graph.gd", FileAccess.WRITE)
	fa.store_string("class_name MapGraph\nextends RefCounted\n## 자동으로 만든 맵 연결 지도(tools/build_map_graph.tscn). 손으로 고치지 않는다.\n## 맵 id → {scene, doors: [{to, boss, x, y}], npcs, mobs}\n\nconst DATA := " + JSON.stringify(out, "\t") + "\n")
	fa.close()
	print("맵 %d장 연결 지도 저장" % out.size())
	get_tree().quit()
