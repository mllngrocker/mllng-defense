extends Node
## 스킬 창 확인용 녹화(저장 안 건드림): 로비 위에 시로의 스킬 창을 띄운다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 30 res://tools/skillwin_capture.tscn

func _ready() -> void:
	Save.persist = false
	Save.owned["kemo1"] = {"level": 20, "stars": 0}
	Save.skill_lv = {"kemo1": {"a1": 4, "a2": 3, "p1": 5, "p4": 2, "p2": 1}}
	Save.master = {"kemo1": true}
	Save.books = {"training": 2, "master": 1}
	Save.pets = {"chicken": true}
	Save.pet = "chicken"
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	Save.pets = {"chicken": true}
	Save.pet = "chicken"
	if "--nowin" in OS.get_cmdline_user_args():
		return
	var sw := SkillWindow.new()
	sw.char_id = &"kemo1"
	sw.chosen = "a2"
	menu.add_child(sw)
