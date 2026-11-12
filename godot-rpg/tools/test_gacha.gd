extends Node
## 뽑기 규칙 확인용(헤드리스): 보석 차감, 10회 ★4 확정, ★5 천장, 중복 → 별 +1, 별이 다 차면 골드, 별 보너스.
## 실행: godot --headless --path godot-rpg res://tools/test_gacha.tscn

var fails := 0
var rng := RandomNumberGenerator.new()


func _reset() -> void:
	Save.persist = false
	Save.load_game()
	Save.owned = {}
	for id in Save.STARTERS:
		Save.owned[String(id)] = {"level": 1, "stars": 0}
	Save.gems = 500
	Save.gold = 0
	Save.pity = 0
	Save.pity_w = 0
	Save.weapons = {}
	Save.equip = {}


func _ready() -> void:
	rng.seed = 12345
	_reset()
	_check("보석 50개 차감", Save.spend_gems(Gacha.COST_ONE) and Save.gems == 450)
	_check("보석이 모자라면 실패", not Save.spend_gems(9999) and Save.gems == 450)
	var one := Gacha.pull(1, rng)
	_check("1회 뽑기 결과 1개", one.size() == 1)

	var ok_guarantee := true
	for trial in 200:
		_reset()
		var res := Gacha.pull(10, rng)
		if res.all(func(r: Dictionary) -> bool: return int(r["rarity"]) < 4):
			ok_guarantee = false
	_check("10회 뽑기는 ★4 이상 1개 확정 (200번 시험)", ok_guarantee)

	_reset()
	Save.pity = Gacha.PITY_5 - 1
	var p := Gacha.pull(1, rng)
	_check("100번째는 ★5 확정, 천장 초기화", int(p[0]["rarity"]) == 5 and Save.pity == 0)

	var counts := {3: 0, 4: 0, 5: 0}
	_reset()
	for i in 4000:
		Save.pity = 0
		counts[Gacha._roll_rarity(rng, false)] += 1
	print("    확률 (4000번): ★5 %.1f%% · ★4 %.1f%% · ★3 %.1f%%" % [counts[5] / 40.0, counts[4] / 40.0, counts[3] / 40.0])
	_check("확률이 대략 1% / 9% / 90%", absf(counts[5] / 40.0 - 1.0) < 0.8 and absf(counts[4] / 40.0 - 9.0) < 2.5)

	_reset()
	_check("이미 있는 캐릭터면 별 조각 +10", Save.grant_character(&"kemo1") == "shard" and Save.shards_of(&"kemo1") == 10 and Save.stars_of(&"kemo1") == 0)
	_check("처음 나온 캐릭터는 보유", Save.grant_character(&"fairy1") == "new" and Save.is_owned(&"fairy1"))
	_check("★4도 중복 한 번에 조각 10", Save.grant_character(&"fairy1") == "shard" and Save.shards_of(&"fairy1") == 10)
	Save.owned["kemo2"]["stars"] = Save.max_stars(&"kemo2")
	_check("7성이면 골드로(max)", Save.grant_character(&"kemo2") == "max")

	_reset()
	Save.owned["kemo1"]["stars"] = 2
	var base := Save.character(&"kemo1").atk_at(1)
	_check("별 2개 → 공격력 +16%% (%d → %d)" % [base, Save.atk_of(&"kemo1")], Save.atk_of(&"kemo1") == roundi(base * (1.0 + Save.STAR_BONUS * 2)))

	# 상점 화면에서 실제로 눌러 보기
	_reset()
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	get_tree().current_scene = self
	await get_tree().process_frame
	menu._switch_tab("상점")
	_check("상점 탭으로 바뀜", menu.shop_page.visible and not menu.avatar_page.visible)
	menu.shop_page._on_pull(10, Gacha.COST_TEN)
	await get_tree().process_frame
	var overlay := menu.get_children().filter(func(n: Node) -> bool: return n is GachaResult)
	_check("10회 소환 → 보석 50 남고 연출 화면이 뜸", Save.gems == 50 and overlay.size() == 1)

	# 별 승급: 조각을 모아 직접 올린다(4성 30 · 5성 60 · 6성 100 · 7성 150)
	Save.owned["kemo3"] = {"level": 1, "stars": 0, "shards": 0}
	var atk0 := Save.atk_of(&"kemo3")
	_check("조각 0개로는 승급 못 함", not Save.promote(&"kemo3") and Save.rank_of(&"kemo3") == 3)
	for i in 3:
		Save.grant_character(&"kemo3")
	_check("중복 3번(조각 30) → 4성 승급", Save.promote(&"kemo3") and Save.rank_of(&"kemo3") == 4 and Save.shards_of(&"kemo3") == 0)
	_check("다음 승급은 60개", Save.promote_cost(&"kemo3") == 60)
	Save.owned["kemo3"]["shards"] = 310
	while Save.promote(&"kemo3"):
		pass
	_check("7성까지(남은 조각 %d) · 공격력 올랐다 (%d → %d)" % [Save.shards_of(&"kemo3"), atk0, Save.atk_of(&"kemo3")], Save.rank_of(&"kemo3") == 7 and Save.shards_of(&"kemo3") == 0 and Save.atk_of(&"kemo3") > atk0)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
