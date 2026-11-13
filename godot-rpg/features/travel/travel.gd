class_name Travel
extends RefCounted
## 퀘스트 자동 이동: HUD 퀘스트 카드를 누르면 그 퀘스트를 하러 갈 맵까지 이동문을 따라 걸어간다.
## 도착하면 할 일까지 한다 — 도착(reach)은 끝, 말 걸기(talk)는 그 사람 앞까지, 보스(boss)는 보스 앞까지 가서 자동 사냥,
## 처치(kill)는 그 몬스터가 사는 맵에서 자동 사냥. 맵 사이 길은 MapGraph.DATA(이동문 연결)로 찾는다.
## 진행 상태는 Game.travel {goal, kind, target}. 조이스틱을 움직이면 멈춘다. 실제 걷기는 Player._travel_drive.


## 이 퀘스트를 하러 갈 곳. 갈 수 없으면 {"error": 이유}
static func plan(q: Dictionary, from: String) -> Dictionary:
	if q.is_empty():
		return {"error": "모든 이야기를 마쳤어요"}
	var type := String(q["type"])
	var target := String(q["target"])
	var goals: Array[String] = []
	match type:
		"reach":
			goals = [target]
		"talk":
			goals = _maps_where(func(m: Dictionary) -> bool: return target in (m["npcs"] as Array))
		"boss":
			goals = _maps_where(func(m: Dictionary) -> bool: return target in (m["mobs"] as Array))
		"kill":
			var kinds: Array = Quests.REGION_KINDS.get(target, [target]) if target != "" else []
			goals = _maps_where(func(m: Dictionary) -> bool:
				if kinds.is_empty():
					return not (m["mobs"] as Array).is_empty()
				for k in kinds:
					if k in (m["mobs"] as Array):
						return true
				return false)
		_:
			return {"error": "이 퀘스트는 로비에서 해요 (%s)" % q["desc"]}
	if goals.is_empty():
		return {"error": "갈 곳을 찾지 못했어요"}
	# 가장 가까운(지나는 맵이 적은) 곳
	var best := ""
	var best_len := 9999
	for g in goals:
		var r := route(from, g)
		if not r.is_empty() and r.size() < best_len:
			best_len = r.size()
			best = g
	if best == "":
		return {"error": "길이 아직 막혀 있어요 · 앞 장 보스를 먼저 물리쳐요"}
	return {"goal": best, "kind": type, "target": target}


static func _maps_where(test: Callable) -> Array[String]:
	var out: Array[String] = []
	for id: String in MapGraph.DATA:
		if test.call(MapGraph.DATA[id]):
			out.append(id)
	return out


## from → to 로 가는 맵 순서(이어진 열린 문만). 못 가면 빈 배열
static func route(from: String, to: String) -> Array[String]:
	if not MapGraph.DATA.has(from) or not MapGraph.DATA.has(to):
		return []
	var prev := {from: ""}
	var queue: Array[String] = [from]
	while not queue.is_empty():
		var cur: String = queue.pop_front()
		if cur == to:
			break
		for d: Dictionary in MapGraph.DATA[cur]["doors"]:
			var nxt := String(d["to"])
			if prev.has(nxt) or not MapGraph.DATA.has(nxt) or not Quests.boss_defeated(String(d["boss"])):
				continue
			prev[nxt] = cur
			queue.append(nxt)
	if not prev.has(to):
		return []
	var path: Array[String] = []
	var c := to
	while c != "":
		path.push_front(c)
		c = String(prev[c])
	return path


## 지금 퀘스트로 출발(성공하면 "", 못 가면 이유)
static func start(tree: SceneTree) -> String:
	var world := tree.get_first_node_in_group(&"world")
	if world == null:
		return "모험 중에만 쓸 수 있어요"
	var p := plan(Quests.current(), world.call(&"map_id"))
	if p.has("error"):
		return p["error"]
	Game.travel = p
	return ""


## 월드 지도에서 고른 맵으로 출발(성공하면 "", 못 가면 이유)
static func go_to(tree: SceneTree, map_id: String) -> String:
	var world := tree.get_first_node_in_group(&"world")
	if world == null:
		return "모험 중에만 쓸 수 있어요"
	var here := String(world.call(&"map_id"))
	if here == map_id:
		return "여기가 그곳이에요"
	if route(here, map_id).is_empty():
		return "길이 아직 막혀 있어요 · 앞 장 보스를 먼저 물리쳐요"
	Game.travel = {"goal": map_id, "kind": "reach", "target": map_id}
	return ""


static func stop(note := "") -> void:
	Game.travel = {}
	if note != "":
		Events.notice.emit(note, "")


static func active() -> bool:
	return not Game.travel.is_empty()
