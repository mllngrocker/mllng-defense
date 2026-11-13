extends Node
## 장비 화면 캡처용: 장비 몇 개를 주고 로비를 띄운다. -- --picker=neck 이면 그 부위 선택 창도 연다.

func _ready() -> void:
	Save.persist = false
	Save.away_seconds = 0  # 방치 보상 창이 가리지 않게
	Save.gear = {"armor4": 1, "armor1b": 0, "armor2": 3, "armor3b": 0, "armor4b": 0, "boots2": 0, "neck3": 2, "neck1": 0, "neck2": 0, "ring1": 0}
	Save.gear_equip = {String(Save.selected): {"armor": "armor4", "boots": "boots2", "neck": "neck3"}}
	for a in OS.get_cmdline_user_args():
		if a == "--seven":
			Save.owned[String(Save.selected)]["stars"] = 4  # 7성(무지개 별)
			Save.owned["kemo2"]["stars"] = 2
			Save.owned["kemo3"]["stars"] = 3
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--picker="):
			menu.call_deferred(&"_open_gear_picker", a.substr(9))
		elif a == "--weapons":
			menu.call_deferred(&"_open_weapon_picker")
		elif a == "--pets":
			menu.call_deferred(&"add_child", PetPicker.new())
		elif a == "--swap":
			menu.call_deferred(&"_preview", &"kemo3")
			menu.call_deferred(&"_on_select_pressed")
