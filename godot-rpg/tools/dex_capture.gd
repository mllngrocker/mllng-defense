extends Node
## 도감 창 캡처용: 몬스터 몇 종을 잡은 것으로 두고 로비 위에 도감을 띄운다. -- --tab=1 이면 장비 탭.

func _ready() -> void:
	Save.persist = false
	Save.dex = {"slime": 120, "mushroom": 40, "bat": 12, "king_slime": 1, "snake": 30, "lizard": 4, "skull": 2}
	Save.gear = {"armor1": 0, "neck3": 1, "ring4": 0, "boots2": 0}
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
	var w := DexWindow.new()
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--tab="):
			w.tab = int(a.substr(6))
	menu.add_child.call_deferred(w)
