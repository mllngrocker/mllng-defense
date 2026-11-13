extends Node
## 장비(옷·신발·목걸이·반지) 확인(헤드리스): 얻기·재련·장착 효과·빼 오기·떨어뜨리는 등급·로비 칸.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.gear = {}
	Save.gear_equip = {}
	var id := &"kemo1"
	var atk0 := Save.atk_of(id)
	var hp0 := Save.hp_of(id)
	var crit0 := Save.crit_of(id)
	_check("처음 얻으면 new, 또 얻으면 재련 +1", Save.give_gear(&"neck3") == "new" and Save.give_gear(&"neck3") == "up" and Save.gear_refine(&"neck3") == 1)
	Save.equip_gear(id, &"neck3")
	_check("목걸이 → 공격력·치명타 오름 (%d → %d)" % [atk0, Save.atk_of(id)], Save.atk_of(id) > atk0 and Save.crit_of(id) > crit0)
	Save.give_gear(&"armor4")
	Save.equip_gear(id, &"armor4")
	_check("옷 → 체력 오름 (%d → %d)" % [hp0, Save.hp_of(id)], Save.hp_of(id) > hp0)
	Save.give_gear(&"boots2")
	Save.equip_gear(id, &"boots2")
	_check("신발 → 이동 속도 +9%%", is_equal_approx(Save.gear_bonus(id, "speed"), 0.09))
	Save.equip_gear(&"kemo2", &"neck3")
	_check("남이 낀 장비는 못 낀다", Save.gear_on(id, "neck") == &"neck3" and Save.gear_on(&"kemo2", "neck") == &"")
	Save.swap_equipment(id, &"kemo2")
	_check("장비 옮기기: 통째로 맞바꾼다", Save.gear_on(&"kemo2", "neck") == &"neck3" and Save.gear_on(&"kemo2", "armor") == &"armor4" and not Save.has_equipment(id))
	Save.swap_equipment(id, &"kemo2")
	Save.unequip_gear(id, "armor")
	_check("해제하면 체력이 줄어든다", Save.gear_on(id, "armor") == &"")
	for i in Gear.MAX_REFINE + 2:
		Save.give_gear(&"ring1")
	var g := Save.gold
	_check("재련이 다 차면 골드로", Save.gear_refine(&"ring1") == Gear.MAX_REFINE and Save.give_gear(&"ring1") == "max" and Save.gold > g)
	# 분해·강화·합성
	Save.gear = {"ring2": 1, "neck2": 0, "boots2": 0}
	Save.gear_equip = {"kemo1": {"boots": "boots2"}}
	Save.items["stone"] = 0
	_check("남이 낀 장비는 분해 못 함", Save.dismantle_gear(&"boots2") == 0 and Save.has_gear(&"boots2"))
	_check("합성 재료: 안 낀 희귀 장비 3개(재련 +1 포함)", Save.synth_material(2) == 3)
	var got := Save.synth_gear(&"ring2")
	_check("희귀 3개 → 영웅 장비 (%s)" % got, got != &"" and Gear.grade_of(got) == 3 and not Save.has_gear(&"ring2") and not Save.has_gear(&"neck2") and Save.has_gear(&"boots2"))
	_check("분해 → 강화석 (영웅 %d개)" % Gear.STONES_FROM[3], Save.dismantle_gear(got) == Gear.STONES_FROM[3] and Save.item_count(&"stone") == Gear.STONES_FROM[3])
	Save.gear["armor1"] = 0
	_check("강화석으로 강화 → 재련 +1", Save.upgrade_gear(&"armor1") and Save.gear_refine(&"armor1") == 1 and Save.item_count(&"stone") == Gear.STONES_FROM[3] - Gear.UPGRADE_COST[1])
	# 분해한 재련은 같은 부위 새 장비로 이어진다
	Save.gear["ring3"] = 4
	Save.dismantle_gear(&"ring3")
	_check("분해한 재련 +4가 새 반지로 이어진다", Save.give_gear(&"ring1_l40") == "new" and Save.gear_refine(&"ring1_l40") == 4 and not Save.gear_carry.has("ring"))
	# 장비 레벨제
	_check("Lv.50 장비는 효과가 커진다", float(Gear.stats_of(&"armor2_l50")["hp"]) > float(Gear.stats_of(&"armor2")["hp"]) * 2.5)
	var lv120 := 0
	for i in 200:
		if Gear.level_of(Gear.roll(false, 125)) == 120:
			lv120 += 1
	_check("Lv.125면 Lv.120 장비가 주로 나온다 (%d/200)" % lv120, lv120 > 110 and Gear.level_of(Gear.roll(false, 5)) == 1)
	_check("장비 목록 38종 × 16레벨, 예전 정예 = Lv.40", Gear.ids().size() == 608 and Gear.level_of(&"neck4_t2") == 40 and Gear.has_id(&"neck4_l150") and not Gear.has_id(&"neck4_l155"))
	# 골드 강화 + 분해하면 강화가 이어진다
	Save.gear["boots3_l20"] = 0
	Save.gold = 100000000
	for i in 50:
		Save.enhance_gear(&"boots3_l20")
	_check("골드로 강화 +50", Save.gear_enh_of(&"boots3_l20") == 50 and Save.gold < 100000000)
	Save.gear_equip = {}
	Save.dismantle_gear(&"boots3_l20")
	_check("+50 신발을 분해하면 새 신발이 +50으로", Save.give_gear(&"boots1_l60") == "new" and Save.gear_enh_of(&"boots1_l60") == 50)
	Save.owned[String(id)]["level"] = 10
	Save.equip_gear(id, &"boots1_l60")
	_check("레벨이 모자라면 못 낀다", Save.gear_on(id, "boots") != &"boots1_l60")
	# 무기 드롭: 3~5성, 새 무기는 가장 높은 강화를 이어받는다
	var ok_rar := true
	for i in 200:
		var r := Weapons.rarity_of(Weapons.roll_drop())
		ok_rar = ok_rar and r >= 3 and r <= 5
	_check("떨어지는 무기는 3~5성", ok_rar)
	Save.wlevel[String(Weapons.STARTER)] = 7
	var nw := Weapons.pool(4)[0]
	Save.weapons.erase(String(nw))
	_check("새 무기는 강화 +7을 이어받는다", Save.grant_weapon(nw) == "new" and Save.enhance_of(nw) == 7)
	var low := 0
	var boss_low := 0
	for i in 400:
		if Gear.grade_of(Gear.roll(false)) == 1:
			low += 1
		if Gear.grade_of(Gear.roll(true)) == 1:
			boss_low += 1
	_check("일반 몬스터는 초록이 가장 흔하고(%d/400) 보스는 파랑 이상만" % low, low > 180 and boss_low == 0)
	# 줍기
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var player := get_tree().get_first_node_in_group(&"player") as Player
	ItemPickup.spawn_gear(player.get_parent(), &"boots4", player.global_position)
	for i in 10:
		await get_tree().physics_frame
	_check("떨어진 장비 줍기", Save.has_gear(&"boots4"))
	world.queue_free()
	await get_tree().process_frame
	# 로비 칸·선택 창
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
	await get_tree().process_frame
	_check("로비 장비 칸 6개", (menu.get(&"gear_slots") as Array).size() == 6)
	menu.call(&"_open_gear_picker", "boots")
	await get_tree().process_frame
	var picker := menu.get_child(menu.get_child_count() - 1) as GearPicker
	_check("신발 선택 창: 기본 4장 + 가진 레벨 장비", picker != null and picker.cards.size() >= 4)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
