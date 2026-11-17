extends Node
## 확인용: 맵 하나를 열어 용사 자리에서 평소 화면 그대로 찍는다(HUD·안개 포함). -- --map=mist3
func _ready() -> void:
	Save.persist = false
	var id := "mist3"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--map="):
			id = a.substr(6)
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--pet="):  # 데리고 다닐 펫(예: --pet=lich_skull)
			Save.pet = a.substr(6)
			if not Save.pets.has(Save.pet):
				Save.pets[Save.pet] = 1
	var w := (load("res://features/world/%s.tscn" % id) as PackedScene).instantiate()
	add_child(w)
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--at="):  # 용사를 그 칸으로(예: --at=10,30)
			var xy := a.substr(5).split(",")
			var pl := w.get_node_or_null(^"%Player") as Node2D
			if pl:
				pl.global_position = Vector2(int(xy[0]), int(xy[1])) * 16.0
