extends Node
## 스킬 트리 확인용(헤드리스): 포인트·선행 조건·마스터 북·책·초기화·전투에서 2·3번 스킬.
## 실행: godot --headless --path godot-rpg res://tools/test_skilltree.tscn

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.load_game()
	var id := &"kemo1"
	Save.selected = id
	Save.owned[String(id)] = {"level": 10, "stars": 0}
	Save.skill_lv = {}
	Save.skill_bonus = {}
	Save.master = {}
	Save.books = {"training": 0, "master": 0}
	Save.gold = 100000
	Save.gems = 5000
	_check("레벨 10 → 스킬 포인트 9(고유기 Lv.1 포함 합 10)", Save.skill_points(id) == 9)
	_check("두 번째 스킬은 캐릭터 Lv.30 전엔 못 배움", Save.skill_block(id, "a2").contains("Lv.30"))
	var atk := Save.atk_of(id)
	Save.learn_skill(id, "p1")
	_check("공격 수련 → 공격력 상승 (%d → %d)" % [atk, Save.atk_of(id)], Save.atk_of(id) >= atk)
	Save.owned[String(id)]["level"] = 31
	_check("Lv.30이어도 고유기 Lv.10 전엔 못 배움", Save.skill_block(id, "a2").contains("Lv.10"))
	for i in 9:
		Save.learn_skill(id, "a1")
	_check("고유기 Lv.10이어도 패시브 합 20 전엔 못 배움", Save.skill_block(id, "a2").contains("패시브"))
	for p in ["p1", "p2"]:
		while Save.skill_level(id, p) < 10:
			Save.learn_skill(id, p)
	_check("Lv.30 + 고유기 10 + 패시브 20 → 두 번째 스킬", Save.learn_skill(id, "a2") and Save.skill_level(id, "a2") == 1)
	Save.owned[String(id)]["level"] = 90
	_check("오의는 두 번째 Lv.10 전엔 잠김", Save.skill_block(id, "a3").contains("Lv.10"))
	while Save.skill_level(id, "a2") < 10:
		Save.learn_skill(id, "a2")
	while Save.skill_level(id, "p3") < 10:
		Save.learn_skill(id, "p3")
	_check("Lv.70 + 두 번째 10 + 패시브 30 → 오의", Save.learn_skill(id, "a3"))
	_check("상한: 모두 15", Save.skill_cap(id, "a1") == 15 and Save.skill_cap(id, "p1") == 15)
	var pts := Save.skill_points(id)
	Save.skill_bonus[String(id)] = 5
	_check("포인트 = 레벨(옛 트레이닝 북 보너스는 안 셈)", Save.skill_points(id) == pts)
	_check("스킬 피해 배율: 레벨이 오르면 커진다", SkillTree.power(id, "a1") > 1.0)
	# 전투: 세 슬롯 모두 쓸 수 있다
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var player := world.get_node(^"%Player") as Player
	_check("전투: 오의까지 세 스킬 사용", player.skills.try_cast("a1") and player.skills.try_cast("a2") and player.skills.try_cast("a3"))
	_check("재사용 대기 중엔 다시 못 씀", not player.skills.try_cast("a2"))
	world.queue_free()
	await get_tree().process_frame
	# 한번에 찍기: 고유기 → 패시브 합 20 → 2번째 → 패시브 합 30 → 오의 → 나머지 패시브
	Save.skill_lv = {}
	Save.owned[String(id)]["level"] = 20
	Save.auto_skill(id)
	_check("Lv.20 한번에: 고유기 10 → 패시브 (%d·%d)" % [Save.skill_level(id, "a1"), SkillTree.passive_sum(id)], Save.skill_level(id, "a1") == 10 and SkillTree.passive_sum(id) == 10 and Save.skill_points(id) == 0)
	Save.owned[String(id)]["level"] = 80
	Save.auto_skill(id)
	_check("Lv.80 한번에: 2번째·오의도 찍힘 (a2 %d · a3 %d · 패시브 %d)" % [Save.skill_level(id, "a2"), Save.skill_level(id, "a3"), SkillTree.passive_sum(id)], Save.skill_level(id, "a2") >= 10 and Save.skill_level(id, "a3") >= 1 and Save.skill_points(id) == 0)
	Save.owned[String(id)]["level"] = 150
	Save.auto_skill(id)
	var total := 0
	for n: String in ["a1", "a2", "a3", "a4", "a5", "a6", "p1", "p2", "p3", "p4"]:
		total += Save.skill_level(id, n)
	_check("Lv.150 한번에: 모든 스킬 꽉, 합 150 (%d)" % total, total == 150 and Save.skill_points(id) == 0)
	Save.owned[String(id)]["level"] = 80
	Save.skill_lv = {}
	Save.auto_skill(id)
	# 상위 기술·칸 끼우기
	Save.owned[String(id)]["level"] = 150
	Save.auto_skill(id)
	_check("Lv.150: 상위 기술 4·5·6번도 15", Save.skill_level(id, "a4") == 15 and Save.skill_level(id, "a6") == 15)
	_check("상위 기술 피해는 바탕 기술의 1.6배", is_equal_approx(SkillTree.power(id, "a4"), SkillTree.power(id, "a1") * SkillTree.UP_POWER))
	Save.set_slot(id, 0, "a4")
	_check("1칸에 상위 기술 끼우기", Save.slots_of(id) == ["a4", "a2", "a3"])
	Save.set_slot(id, 2, "a4")
	_check("다른 칸으로 옮기면 서로 바꿈", Save.slots_of(id) == ["a3", "a2", "a4"])
	Save.skill_slots = {}
	Save.owned[String(id)]["level"] = 80
	Save.skill_lv = {}
	Save.auto_skill(id)
	Save.owned[String(id)]["exp"] = 0
	Save.add_exp(id, Save.exp_need(80) + 1)
	_check("레벨업만으로는 안 찍힘(버튼을 눌러야)", Save.skill_points(id) == 1)
	# 모든 캐릭터: 상위 기술 4·5·6번 이름과 색 바꾼 그림
	var miss: Array[String] = []
	for cid: StringName in Save.ROSTER:
		for n: String in ["a4", "a5", "a6"]:
			var inf := SkillTree.info(cid, n)
			if str(inf["name"]).begins_with("진 ") or not ResourceLoader.exists(SkillTree.ICON_DIR % inf["icon"]):
				miss.append("%s %s" % [cid, n])
	_check("모든 캐릭터(%d명) 상위 기술 이름·그림 %s" % [Save.ROSTER.size(), miss], miss.is_empty())
	# 스킬 창
	var sw := SkillWindow.new()
	sw.char_id = id
	add_child(sw)
	await get_tree().process_frame
	_check("스킬 창 열림", sw.tree != null)
	# 끌어서 칸에 끼우기: 2번째 스킬 상위(a5)를 눌러 3번 칸 위에서 놓는다
	Save.owned[String(id)]["level"] = 150
	Save.auto_skill(id)
	Save.skill_slots = {}
	await get_tree().process_frame
	var down := InputEventMouseButton.new()
	down.button_index = MOUSE_BUTTON_LEFT
	down.pressed = true
	down.position = sw._node_rect(Vector2i(1, 1)).get_center()
	sw._on_tree_input(down)
	var up := InputEventMouseButton.new()
	up.button_index = MOUSE_BUTTON_LEFT
	up.pressed = false
	up.position = sw.slot_bar.global_position + sw._slot_rect(2).get_center() - sw.tree.global_position
	sw._on_tree_input(up)
	_check("끌어다 3번 칸에 놓기 → %s" % [Save.slots_of(id)], Save.slots_of(id)[2] == "a5")
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
