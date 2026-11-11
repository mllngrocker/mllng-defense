extends Node
## 확인용 녹화: --map=village면 마을에서 촌장 옆에 서서 말풍선을, 아니면 필드에서 몬스터 앞에 서서 스킬을 쓴다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 90 res://tools/feature_capture.tscn -- --map=field --char=maid1

var player: Player
var frame := 0
var map := "village"


func _ready() -> void:
	Game.hitstop_enabled = false
	Save.persist = false
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			Save.selected = StringName(a.trim_prefix("--char="))
		elif a.begins_with("--map="):
			map = a.trim_prefix("--map=")
		elif a.begins_with("--pet="):
			Save.pets[a.trim_prefix("--pet=")] = true
			Save.pet = a.trim_prefix("--pet=")
	var path := "res://features/world/%s.tscn" % ("world" if map == "field" else map)
	add_child((load(path) as PackedScene).instantiate())
	player = get_tree().get_first_node_in_group(&"player") as Player
	if map == "village":
		var chief := find_children("NpcOldman", "", true, false)[0] as Node2D
		player.global_position = chief.global_position + Vector2(20, 14)
	elif map in ["shore", "snowgate"]:
		# 입구 맵: 막힌 입구 앞에 서서 걸어 들어가 본다(밀려나며 알림)
		var gate := find_children("Portal_gate", "", true, false)[0] as Node2D
		player.global_position = Vector2(250, 192) if map == "shore" else gate.global_position + Vector2(0, 60)
		player.set_meta(&"walk_to", gate.global_position)
	elif "--boss" in OS.get_cmdline_user_args():
		# 보스 앞에 세운다(보스가 깨어나 내려치기 예고를 하는 장면)
		var boss := get_tree().get_first_node_in_group(&"bosses") as Node2D
		player.global_position = boss.global_position + Vector2(0, 40)
		player.max_hp = 9999
		player.hp = 9999
	else:
		var enemies := get_tree().get_nodes_in_group(&"enemies")
		for i in enemies.size():
			var e := enemies[i] as Enemy
			if i < 5:
				e.global_position = player.global_position + Vector2(-40 + i * 20, 40 + (i % 2) * 12)
				e.max_hp = 9999
				e.hp = 9999
				e.set_physics_process(false)
			else:
				e.queue_free()


func _physics_process(_delta: float) -> void:
	frame += 1
	if "--pause" in OS.get_cmdline_user_args() and frame == 10:
		get_tree().get_first_node_in_group(&"hud").call(&"open_pause")
		return
	if player.has_meta(&"walk_to"):
		var act := &"move_left" if map == "shore" else &"move_up"
		if frame == 10:
			Input.action_press(act)
		elif frame == 40:
			Input.action_release(act)
		return
	if map != "village" and frame == 20 and not "--boss" in OS.get_cmdline_user_args():
		player.dir = Player.Dir.DOWN
		player.skills.try_cast()
