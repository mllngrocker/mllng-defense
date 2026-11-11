extends Node
## 자동 사냥 확인(헤드리스): 초원에서 자동을 켜고 손대지 않으면 스스로 몬스터를 찾아가 잡는다.
## 실행: godot --headless --path godot-rpg res://tools/test_auto.tscn -- --char=kemo2

var frame := 0
var player: Player
var kills := 0
var fails := 0
var start_pos := Vector2.ZERO


func _ready() -> void:
	Save.persist = false
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			Save.selected = StringName(a.trim_prefix("--char="))
	print("캐릭터: ", Save.selected)
	add_child((load("res://features/world/world.tscn") as PackedScene).instantiate())
	player = get_tree().get_first_node_in_group(&"player") as Player
	Events.enemy_died.connect(func(_k: String) -> void: kills += 1)


func _physics_process(_delta: float) -> void:
	frame += 1
	if frame == 5:
		player.max_hp = 99999  # 시험 중 쓰러지지 않게
		player.hp = 99999
		start_pos = player.global_position
		player.auto = true
	if frame == 60 * 25:
		_check("자동으로 움직였다 (%.0f칸)" % (player.global_position.distance_to(start_pos) / 16.0), player.global_position.distance_to(start_pos) > 32.0)
		_check("자동으로 몬스터를 잡았다 (%d마리)" % kills, kills >= 2)
		player.auto = false
		var before := player.global_position
		for i in 30:
			await get_tree().physics_frame
		_check("자동을 끄면 멈춘다", player.global_position.distance_to(before) < 4.0)
		print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
		get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
