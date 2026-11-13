extends Node
## 스킬 창 확인용 녹화(저장 안 건드림): 로비 위에 시로의 스킬 창을 띄운다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 30 res://tools/skillwin_capture.tscn

func _ready() -> void:
	Save.persist = false
	Save.away_seconds = 0  # 방치 보상 창이 가리지 않게
	Save.owned["kemo1"] = {"level": 138, "stars": 0}
	Save.skill_lv = {"kemo1": {"a1": 1}}
	if "--all" in OS.get_cmdline_user_args():
		Save.auto_skill(&"kemo1")  # "한번에 찍기"를 누른 뒤 모습
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
	sw.chosen = "a1"
	menu.add_child(sw)
