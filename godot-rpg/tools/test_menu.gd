extends Node
## 로비(아바타 탭) 확인용(헤드리스): 캐릭터 목록, 레벨 업(골드 부족·충분), 출전 변경, 미보유 캐릭터.
## 실행: godot --headless --path godot-rpg res://tools/test_menu.tscn

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.load_game()
	Save.gold = 0
	Save.selected = &"kemo1"
	for id in Save.STARTERS:
		Save.owned[String(id)] = {"level": 1, "stars": 0}
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	await get_tree().process_frame

	_check("캐릭터 카드 %d장" % Save.ROSTER.size(), menu.cards.size() == Save.ROSTER.size())
	_check("시작 보유 3명", Save.STARTERS.all(func(id: StringName) -> bool: return Save.is_owned(id)))
	_check("★4 플로라는 미보유", not Save.is_owned(&"fairy1"))

	Save.add_gold(1000)
	menu._on_level_up_pressed()
	_check("골드로는 레벨이 안 오름", Save.level_of(&"kemo1") == 1 and Save.gold == 1000)
	Save.add_exp(&"kemo1", Save.exp_need(1) - 1)
	_check("경험치가 모자라면 그대로", Save.level_of(&"kemo1") == 1)
	Save.add_exp(&"kemo1", 1 + Save.exp_need(2))
	_check("경험치가 넘치면 여러 레벨 (Lv.3)", Save.level_of(&"kemo1") == 3 and Save.exp_of(&"kemo1") == 0)

	menu._preview(&"kemo3")
	_check("다른 캐릭터를 보면 출전 버튼이 보임", menu.action_button.visible)
	menu._on_select_pressed()
	# 출전 캐릭터가 장비를 끼고 있으면 "장비를 옮길까요?" 창이 먼저 뜬다 → 그대로 두기
	var box := menu.get_child(menu.get_child_count() - 1) as ConfirmBox
	_check("장비가 있으면 옮길지 묻는다", (box != null) == Save.has_equipment(&"kemo1"))
	if box:
		box._answer(false)
	_check("출전 캐릭터가 카라로 바뀜", Save.selected == &"kemo3" and Save.current().display_name == "카라")

	menu._preview(&"fairy1")
	_check("미보유 캐릭터는 출전 버튼 없음", not menu.action_button.visible and menu.level_button.disabled)

	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
