extends Node
## 펫·무기 강화·보스 보상 확인용(헤드리스).
## 실행: godot --headless --path godot-rpg res://tools/test_pets.tscn

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.load_game()
	Save.pets = {}
	Save.pet = ""
	Save.wlevel = {}
	Save.gold = 100000
	var id := Save.selected
	var base := Save.atk_of(id)
	# 펫 얻기·데리고 다니기
	Save.grant_pet(&"dog")
	_check("첫 펫은 바로 동행", Save.pet == "dog" and Save.has_pet(&"dog"))
	_check("바둑이 공격력 +5%% (%d → %d)" % [base, Save.atk_of(id)], Save.atk_of(id) > base)
	Save.choose_pet(&"dog")
	_check("다시 누르면 두고 가기", Save.pet == "")
	Save.choose_pet(&"dog")
	# 무기 강화
	var w := Save.equipped(id)
	var before := Save.weapon_atk(id)
	var gold := Save.gold
	_check("강화 성공(골드 %d 사용)" % Weapons.enhance_cost(0), Save.try_enhance(w) and Save.gold == gold - Weapons.enhance_cost(0))
	_check("강화하면 무기 공격력이 오른다 (%d → %d)" % [before, Save.weapon_atk(id)], Save.weapon_atk(id) >= before)
	_check("보스 무기는 뽑기에 안 나온다", not Weapons.pool(5).has(&"demon_sword") and Weapons.pool(5).size() >= 4)
	# 보스 첫 처치 보상
	Save.boss_reward("kraken")
	await get_tree().process_frame
	_check("크라켄 보상: 꼬마 문어 + 해신의 삼지창", Save.has_pet(&"octopus") and Save.has_weapon(&"sea_trident"))
	# 맵에 펫이 따라오고 몬스터를 문다
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var pet := world.find_children("Pet", "Pet", true, false)
	_check("맵에 펫이 함께 나타남", pet.size() == 1)
	var player := world.get_node(^"%Player") as Node2D
	var enemy := get_tree().get_nodes_in_group(&"enemies")[0] as Enemy
	enemy.set_physics_process(false)
	enemy.max_hp = 99999
	enemy.hp = 99999
	enemy.global_position = player.global_position + Vector2(40, 0)
	for i in 120:
		await get_tree().physics_frame
	_check("펫이 가까운 몬스터를 물었다 (체력 %d)" % enemy.hp, enemy.hp < 99999)
	world.queue_free()
	await get_tree().process_frame
	# 로비 펫 칸 → 펫 창
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	await get_tree().process_frame
	var pp := PetPicker.new()
	menu.add_child(pp)
	await get_tree().process_frame
	_check("펫 창: 펫 수만큼 칸(%d)" % Pets.DATA.size(), pp.cards.size() == Pets.DATA.size())
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
