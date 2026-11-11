extends Node
## 장비 화면 캡처용: 장비 몇 개를 주고 로비를 띄운다. -- --picker=neck 이면 그 부위 선택 창도 연다.

func _ready() -> void:
	Save.persist = false
	Save.gear = {"armor4": 1, "boots2": 0, "neck3": 2, "neck1": 0, "neck2": 0, "ring1": 0}
	Save.gear_equip = {String(Save.selected): {"armor": "armor4", "boots": "boots2", "neck": "neck3"}}
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--picker="):
			menu.call_deferred(&"_open_gear_picker", a.substr(9))
