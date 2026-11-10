extends Node
## 로비 화면 확인용 녹화: 시작 화면 → 카라(불) 미리보기 → ★5 플로라 미리보기.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 90 res://tools/menu_capture.tscn

var menu: Node
var frame := 0


func _ready() -> void:
	Save.persist = false
	Save.gold = 1240
	menu = (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)


func _process(_delta: float) -> void:
	frame += 1
	if "--quest" in OS.get_cmdline_user_args():
		if frame == 3:
			menu._on_tab_pressed(3)
		return
	if frame == 30:
		menu._preview(&"kemo3")
		print("30: ", menu.viewing)
	elif frame == 60:
		menu._preview(&"fairy1")
		print("60: ", menu.viewing)
