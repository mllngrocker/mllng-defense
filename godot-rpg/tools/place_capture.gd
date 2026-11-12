extends Node
## 확인용: 맵 하나를 열어 용사 자리에서 평소 화면 그대로 찍는다(HUD·안개 포함). -- --map=mist3
func _ready() -> void:
	Save.persist = false
	var id := "mist3"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--map="):
			id = a.substr(6)
	add_child((load("res://features/world/%s.tscn" % id) as PackedScene).instantiate())
