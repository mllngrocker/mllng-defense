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
	_check("레벨 10 → 스킬 포인트 9", Save.skill_points(id) == 9)
	_check("두 번째 스킬은 고유기 Lv.3 전엔 못 배움", Save.skill_block(id, "a2") != "")
	Save.learn_skill(id, "a1")
	Save.learn_skill(id, "a1")
	_check("고유기 Lv.3 → 두 번째 스킬 배우기", Save.learn_skill(id, "a2") and Save.skill_level(id, "a2") == 1)
	var atk := Save.atk_of(id)
	Save.learn_skill(id, "p1")
	_check("공격 수련 → 공격력 상승 (%d → %d)" % [atk, Save.atk_of(id)], Save.atk_of(id) >= atk)
	_check("오의는 마스터 북 전엔 잠김", Save.skill_block(id, "a3").contains("마스터"))
	_check("보석으로 마스터 북 사기", Save.buy_book("master") and int(Save.books["master"]) == 1)
	_check("마스터 북 → 봉인 해제, 상한 10", Save.use_master_book(id) and Save.skill_cap(id) == 10)
	Save.learn_skill(id, "a2")
	Save.learn_skill(id, "a2")
	_check("두 번째 Lv.3 → 오의 배우기", Save.learn_skill(id, "a3"))
	var before := Save.skill_points(id)
	Save.buy_book("training")
	_check("트레이닝 북 → 포인트 +1", Save.use_training_book(id) and Save.skill_points(id) == before + 1)
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
	var spent_gold := Save.gold
	_check("초기화 → 포인트 돌려받음", Save.reset_skills(id) and Save.skill_points(id) == 9 + 1 and Save.gold < spent_gold)
	# 스킬 창
	var sw := SkillWindow.new()
	sw.char_id = id
	add_child(sw)
	await get_tree().process_frame
	_check("스킬 창 열림", sw.tree != null)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
