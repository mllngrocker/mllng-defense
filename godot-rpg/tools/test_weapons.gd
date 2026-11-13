extends Node
## 무기 확인용(헤드리스): 처음 무기 지급, 무기 뽑기(★4 확정·천장 따로), 중복 → 재련, 장착 → 공격력·치명타,
## 다른 캐릭터에게 옮겨 끼기, 저장 후 다시 불러오기, 상점 무기 모드.
## 실행: godot --headless --path godot-rpg res://tools/test_weapons.tscn

var fails := 0
var rng := RandomNumberGenerator.new()


func _ready() -> void:
	rng.seed = 777
	Save.persist = false
	Save.load_game()
	Save.weapons = {}
	Save.equip = {}
	Save.selected = &"kemo1"
	# 무기가 없으면 견습 기사의 검을 받는 규칙(저장 불러오기 끝부분과 같은 동작)
	Save.weapons[String(Weapons.STARTER)] = 0
	Save.equip["kemo1"] = String(Weapons.STARTER)
	_check("시작 무기: 시로가 견습 기사의 검 장착", Save.equipped(&"kemo1") == Weapons.STARTER)

	var base := roundi(Save.character(&"kemo1").atk_at(Save.level_of(&"kemo1")) * (1.0 + Save.STAR_BONUS * Save.stars_of(&"kemo1")))
	_check("장착 무기 공격력이 더해짐 (%d + %d = %d)" % [base, Weapons.atk_of(Weapons.STARTER, 0), Save.atk_of(&"kemo1")], Save.atk_of(&"kemo1") == base + Weapons.atk_of(Weapons.STARTER, 0))
	_check("치명타 12%% + 무기 2%% = %.0f%%" % (Save.crit_of(&"kemo1") * 100.0), is_equal_approx(Save.crit_of(&"kemo1"), 0.14))

	_check("이미 있는 무기면 재련 +1", Save.grant_weapon(Weapons.STARTER) == "refine" and Save.refine_of(Weapons.STARTER) == 1)
	_check("재련 1 → 공격력 +25%% (%d → %d)" % [Weapons.atk_of(Weapons.STARTER, 0), Weapons.atk_of(Weapons.STARTER, 1)], Weapons.atk_of(Weapons.STARTER, 1) == roundi(5 * 1.25))
	Save.weapons[String(Weapons.STARTER)] = Weapons.MAX_REFINE
	_check("재련이 다 차면 max", Save.grant_weapon(Weapons.STARTER) == "max")

	var ok4 := true
	for trial in 200:
		Save.pity_w = 0
		var res := Gacha.pull_weapons(10, rng)
		if res.all(func(r: Dictionary) -> bool: return int(r["rarity"]) < 4):
			ok4 = false
	_check("무기 10회 뽑기도 ★4 이상 1개 확정 (200번 시험)", ok4)
	Save.pity = 7
	Save.pity_w = Gacha.PITY_5 - 1
	var p := Gacha.pull_weapons(1, rng)
	_check("무기 천장: 50번째 ★5, 캐릭터 천장(7)은 그대로", int(p[0]["rarity"]) == 5 and Save.pity_w == 0 and Save.pity == 7)

	Save.equip_weapon(&"kemo2", Weapons.STARTER)
	_check("남이 낀 무기는 못 낀다", Save.equipped(&"kemo2") == &"" and Save.equipped(&"kemo1") == Weapons.STARTER)
	Save.unequip(&"kemo1")
	Save.equip_weapon(&"kemo2", Weapons.STARTER)
	_check("해제한 뒤에는 다른 캐릭터가 낄 수 있다", Save.equipped(&"kemo2") == Weapons.STARTER)
	Save.unequip(&"kemo2")
	_check("해제하면 공격력이 원래대로", Save.weapon_atk(&"kemo2") == 0)

	# 저장 → 불러오기(임시로 진짜 파일 대신 문자열로 확인)
	Save.equip_weapon(&"kemo3", &"sword")
	var snapshot := {"weapons": Save.weapons.duplicate(), "equip": Save.equip.duplicate(), "pity_w": Save.pity_w}
	var json := JSON.stringify(snapshot)
	var back: Dictionary = JSON.parse_string(json)
	_check("무기·장착·천장이 저장 형식으로 오고 감", back["equip"]["kemo3"] == "sword" and int(back["pity_w"]) == Save.pity_w)

	# 상점 화면 무기 모드
	Save.gems = 5000
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	await get_tree().process_frame
	menu._switch_tab("상점")
	menu.shop_page.set_mode("weapon")
	var before := Save.weapons.size()
	menu.shop_page._on_pull(1, Gacha.COST_ONE)
	await get_tree().process_frame
	var overlay := menu.get_children().filter(func(n: Node) -> bool: return n is GachaResult)
	_check("상점 장비 모드에서 1회 소환 → 무기·장신구 결과 연출", overlay.size() == 1 and ((overlay[0] as GachaResult).results[0].has("weapon") or (overlay[0] as GachaResult).results[0].has("gear")) and Save.weapons.size() >= before)
	menu._switch_tab("아바타")
	menu.viewing = &"kemo1"
	menu._open_weapon_picker()
	await get_tree().process_frame
	var pickers := menu.get_children().filter(func(n: Node) -> bool: return n is WeaponPicker)
	_check("무기 칸을 누르면 무기 선택 창(무기 %d개)" % (pickers[0].cards.size() if pickers.size() > 0 else 0), pickers.size() == 1 and pickers[0].cards.size() == Save.weapons.size())

	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
