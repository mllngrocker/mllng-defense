extends Node
## 별 등급 스킬 연출 캡처용: -- --char=scarlet --rank=7 이면 그 캐릭터를 그 별로 두고 초원에서 몬스터 앞에 서서 스킬을 쓴다.

var frame := 0
var cast_node := "a1"
var player: Player


func _ready() -> void:
	Save.persist = false
	var cid := &"scarlet"
	var rank := 7
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			cid = StringName(a.substr(7))
		elif a.begins_with("--rank="):
			rank = int(a.substr(7))
	Save.owned[String(cid)] = {"level": 30, "stars": rank - Save.character(cid).rarity, "shards": 0}
	Save.selected = cid
	for a2 in OS.get_cmdline_user_args():
		if a2.begins_with("--node="):  # 상위 기술 확인: -- --node=a4
			cast_node = a2.substr(7)
			Save.owned[String(cid)]["level"] = 150
			Save.skill_lv.erase(String(cid))
			Save.auto_skill(cid)
	add_child((load("res://features/world/world.tscn") as PackedScene).instantiate())
	player = get_tree().get_first_node_in_group(&"player") as Player


func _physics_process(_d: float) -> void:
	frame += 1
	if frame == 6:
		var n := 0
		for e in get_tree().get_nodes_in_group(&"enemies"):
			n += 1
			e.global_position = player.global_position + Vector2.from_angle(n * 1.3) * 34.0
			e.set_physics_process(false)
			if n >= 5:
				break
	if frame == 10:
		player.mp = 9999
		player.skills.try_cast(cast_node)
