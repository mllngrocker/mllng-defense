extends Node
## 퀘스트·보스·다시 나타나기 확인용(헤드리스).
## 실행: godot --headless --path godot-rpg res://tools/test_quests.tscn

var fails := 0
var rng := RandomNumberGenerator.new()


func _ready() -> void:
	rng.seed = 5
	Save.persist = false
	Save.load_game()
	Save.quest = {}
	Save.gold = 0
	Save.gems = 0
	Save.weapons = {}
	Save.equip = {}
	Quests._ready()  # 새 상태로 다시 시작(출석 포함)

	_check("처음 메인: 촌장에게 인사하기", Quests.current()["title"] == "촌장에게 인사하기" and not Quests.main_done())
	_check("출석 일일 퀘스트 자동 완료", Quests.daily_done(Quests.DAILY[0]))
	Quests.track("talk", "경비병")
	_check("다른 사람과 이야기하면 그대로", not Quests.main_done())
	Quests.track("talk", "촌장")
	_check("촌장과 이야기 → 완료", Quests.main_done())
	_check("보상 받기 → 골드 100·보석 30, 다음 퀘스트", Quests.claim_main() and Save.gold == roundi(100 * Quests.REWARD_GOLD) and Save.gems == roundi(30 * Quests.REWARD_GEMS) and Quests.current()["title"] == "초원으로!")
	_check("완료 전에는 받기 안 됨", not Quests.claim_main())
	Quests.track("reach", "field")
	Quests.claim_main()
	for i in 4:
		Quests.track("kill", "slime")
	Quests.track("kill", "bat")
	_check("슬라임 4/5 (박쥐는 안 셈)", Quests.main_progress() == 4 and not Quests.main_done())
	Quests.track("kill", "slime")
	_check("슬라임 5/5 → 완료", Quests.main_done())
	Quests.claim_main()
	Save.gems = 500
	Save.spend_gems(Gacha.COST_ONE)
	Gacha.pull(1, rng)
	_check("상점 소환 → '새 동료 부르기' 완료", Quests.main_done())
	Quests.claim_main()
	Save.weapons["sword"] = 0
	Save.equip_weapon(&"kemo1", &"sword")
	_check("무기 장착 → '무기 장착하기' 완료", Quests.main_done())
	Quests.claim_main()

	# 사막 처치 수: 사막 몬스터만 센다
	Save.quest["main"] = 13
	Save.quest["progress"] = 0
	Quests.track("kill", "slime")
	Quests.track("kill", "snake")
	Quests.track("kill", "cyclope")
	_check("사막 정찰은 사막 몬스터만 (2)", Quests.main_progress() == 2)

	# 일일 퀘스트·보너스·날짜 바뀜
	Save.gems = 0
	for i in 30:
		Quests.track("kill", "slime")
	var hunt: Dictionary = Quests.DAILY[1]
	_check("몬스터 30마리 일일 완료 → 받기 보석 30", Quests.daily_done(hunt) and Quests.claim_daily("hunt") and Save.gems == roundi(30 * Quests.REWARD_GEMS))
	_check("같은 일일 보상은 한 번만", not Quests.claim_daily("hunt"))
	for d: Dictionary in Quests.DAILY:
		Save.quest["daily"][d["id"]] = int(d["count"])
		Quests.claim_daily(d["id"])
	var before := Save.gems
	_check("일일 전부 받으면 보너스 보석 %d" % Quests.DAILY_BONUS_GEMS, Quests.claim_bonus() and Save.gems == before + Quests.DAILY_BONUS_GEMS)
	Save.quest["day"] = "2000-01-01"
	Quests._check_day()
	_check("날짜가 바뀌면 일일 퀘스트 초기화", not Quests.daily_done(hunt) and not Quests.daily_claimed(hunt) and not Save.quest["bonus"])

	# 보스·다시 나타나기(초원)
	Game.hitstop_enabled = false
	Save.quest["main"] = 10
	Save.quest["progress"] = 0
	var world := (load("res://features/world/forest.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	var gate := world.find_children("Portal_east", "", true, false)[0]
	_check("킹 슬라임 전에는 사막 문이 잠김", gate.get(&"requires_boss") == "king_slime" and not gate.is_open())
	var ppl := world.get_node(^"%Player") as Player
	gate._on_body_entered(ppl)
	_check("잠긴 문에 들어가면 밀려나고 이동하지 않음", not gate._used and ppl.knockback.x < 0.0)
	var hud := world.get_node(^"HUD")
	hud.open_map()
	await get_tree().process_frame
	var mv := hud.find_children("*", "MapView", false, false)
	_check("지도 창: 게임이 멈추고 지역 지도 그림이 만들어짐", mv.size() == 1 and get_tree().paused and mv[0].map_tex != null and mv[0].map_tex.get_width() == 60 * MapView.CELL)
	mv[0].close()
	await get_tree().process_frame
	_check("지도를 닫으면 게임이 다시 움직임", not get_tree().paused)
	var boss := world.find_children("KingSlime", "", true, false)
	_check("어스름 숲에 킹 슬라임이 있음", boss.size() == 1 and (boss[0] as Enemy).is_boss)
	var player := world.get_node(^"%Player") as Player
	var boss_hp_seen := [-1]
	Events.boss_hp.connect(func(_n: String, h: int, _m: int) -> void: boss_hp_seen[0] = h)
	var kb := boss[0] as Enemy
	player.global_position = kb.global_position + Vector2(0, 60)
	for i in 10:
		await get_tree().physics_frame
	_check("가까이 가면 보스가 깨어나 체력바 신호", boss_hp_seen[0] == kb.max_hp)
	kb.take_hit(99999, player.global_position)
	await get_tree().physics_frame
	_check("킹 슬라임 처치 → '숲의 주인' 완료", Quests.main_done())
	_check("킹 슬라임을 잡으면 사막 문이 열림", gate.is_open())
	# 일반 몬스터가 쓰러지면 잠시 뒤 다시 나타난다(시간을 줄여서 확인)
	var slime := get_tree().get_nodes_in_group(&"enemies").filter(func(e: Node) -> bool: return not (e as Enemy).is_boss and (e as Enemy).hp > 0)[0] as Enemy  # 이 맵의 아무 일반 몬스터
	var count := get_tree().get_nodes_in_group(&"enemies").size()
	player.global_position = Vector2(-999, -999)
	world.schedule_respawn(slime.scene_file_path, slime.home, 0.1)
	slime.take_hit(99999, slime.global_position)
	await get_tree().create_timer(0.5).timeout
	_check("쓰러진 몬스터가 다시 나타남 (%d → %d)" % [count - 1, get_tree().get_nodes_in_group(&"enemies").size()], get_tree().get_nodes_in_group(&"enemies").size() >= count)
	world.queue_free()
	await get_tree().process_frame

	# 로비 퀘스트 탭
	var menu := (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)
	await get_tree().process_frame
	menu._on_tab_pressed(3)
	_check("로비 4번째 탭 → 퀘스트 화면", menu.quest_page.visible and not menu.avatar_page.visible)
	var gems_before := Save.gems
	menu.quest_page._on_main_claim()
	_check("퀘스트 화면에서 메인 보상 받기 (보석 +150)", Save.gems == gems_before + roundi(150 * Quests.REWARD_GEMS))

	# 먼저 가 본 맵·먼저 잡은 보스는 그 퀘스트가 나중에 와도 바로 완료(사막 도착이 안 깨지던 문제)
	Save.quest["visited"] = {}
	Quests.track("reach", "desert")
	for k in Quests.MAIN.size():
		if Quests.MAIN[k]["title"] == "뜨거운 사막":
			Save.quest["main"] = k
			Save.quest["progress"] = 0
	_check("사막에 먼저 와 있었어도 '뜨거운 사막' 완료", Quests.current()["title"] == "뜨거운 사막" and Quests.main_done())
	Quests.mark_boss("cyclope_king")
	for k in Quests.MAIN.size():
		if Quests.MAIN[k]["target"] == "cyclope_king":
			Save.quest["main"] = k
	_check("보스를 먼저 잡았어도 보스 퀘스트 완료", Quests.main_done())
	# 퀘스트 카드: 긴 설명도 잘리지 않고 여러 줄로
	var hud_w = load("res://features/ui/hud.gd").new()
	var longest := ""
	for q in Quests.MAIN:
		if String(q["desc"]).length() > longest.length():
			longest = q["desc"]
	var lines: Array = hud_w._wrap(longest, 11, 242.0)
	print("    가장 긴 설명 → ", lines.size(), "줄: ", " / ".join(lines))
	_check("긴 설명은 여러 줄로 나뉘고 글자가 빠지지 않는다", lines.size() >= 2 and "".join(lines).replace(" ", "") == longest.replace(" ", ""))
	hud_w.free()
	# 퀘스트는 제목으로도 저장: 장 순서가 바뀌어 번호가 밀려도 제목 자리로 돌아간다
	var keepq: Dictionary = Save.quest.duplicate(true)
	Save.quest = {"main": 3, "progress": 0, "main_title": String(Quests.MAIN[10]["title"])}
	Quests._ensure()
	Quests._sync_title()
	_check("제목으로 자리 찾기 (%d)" % Quests.main_index(), Quests.main_index() == 10)
	Save.quest["main"] = 12
	Quests.main_index()
	_check("번호가 바뀌면 저장 제목도 따라감", Save.quest["main_title"] == Quests.MAIN[12]["title"])
	Save.quest = {"main": 5, "progress": 0, "main_title": "없어진 퀘스트"}
	Quests._ensure()
	Quests._sync_title()
	_check("모르는 제목이면 번호 그대로", Quests.main_index() == 5)
	Save.quest = keepq
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
