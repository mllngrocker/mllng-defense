extends Node
## 보스 고유 기술 확인(헤드리스): 돌진·탄막·장판·도약·순간이동이 실제로 움직이고, 용사가 맞으면 체력이 준다.

var fails := 0


func _ready() -> void:
	Save.persist = false
	var world := (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().physics_frame
	for e in get_tree().get_nodes_in_group(&"enemies"):
		e.queue_free()
	var player := get_tree().get_first_node_in_group(&"player") as Player
	player.max_hp = 999999
	player.hp = 999999
	var boss := (load("res://features/enemy/demon_lord.tscn") as PackedScene).instantiate() as Boss
	boss.position = player.global_position + Vector2(60, 0)
	world.get_node(^"Entities").add_child(boss)
	await get_tree().physics_frame
	boss.awake = true
	boss.skill_t = 999.0
	boss.attack_t = 999.0
	_check("마왕 고유 기술: 돌진·탄막·순간이동", Boss.PATTERNS["demon_lord"][0] == ["charge", "ring", "blink"])
	# 돌진
	var p0 := boss.global_position
	boss._start_pattern("charge")
	await _frames(90)
	_check("돌진: 예고 뒤 빠르게 달려간다 (%.0f칸)" % (boss.global_position.distance_to(p0) / 16.0), boss.global_position.distance_to(p0) > 40.0 and boss.pat == "")
	# 탄막
	boss.global_position = player.global_position + Vector2(60, 0)
	boss._start_pattern("ring")
	await _frames(40)
	var shots := world.find_children("*", "BossShot", true, false).size()
	_check("탄막: 둥글게 탄을 쏜다 (%d발)" % shots, shots >= 10)
	# 장판
	boss._start_pattern("puddle")
	await _frames(25)
	var pud := world.find_children("*", "BossPuddle", true, false).size()
	_check("장판: 용사 발밑과 주변에 깔린다 (%d개)" % pud, pud >= 3)
	var hp0 := player.hp
	player.hurt_t = 0.0
	await _frames(80)
	_check("장판·탄에 맞으면 체력이 준다 (%d → %d)" % [hp0, player.hp], player.hp < hp0)
	# 도약
	boss.global_position = player.global_position + Vector2(90, 0)
	boss._start_pattern("jump")
	await _frames(65)
	_check("도약: 용사가 있던 자리로 내려찍는다", boss.global_position.distance_to(player.global_position) < 40.0)
	# 순간이동
	boss.global_position = player.global_position + Vector2(120, 0)
	boss._start_pattern("blink")
	await _frames(45)
	_check("순간이동: 용사 뒤로 나타나 내려치기 예고", boss.global_position.distance_to(player.global_position) < 70.0 and boss.sprite.modulate.a > 0.9)
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _frames(n: int) -> void:
	for i in n:
		await get_tree().physics_frame


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
