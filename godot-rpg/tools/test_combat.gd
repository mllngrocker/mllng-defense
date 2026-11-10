extends Node
## 전투 확인용(헤드리스): 베기 → 몬스터 체력 감소, 닿으면 용사 체력 감소, 구르는 중엔 무적, 하트 줍기.
## 실행: godot --headless --path godot-rpg res://tools/test_combat.tscn -- --char=kemo2  (캐릭터 생략 시 kemo1)

var frame := 0
var world: Node
var player: Player
var enemy: Enemy
var fails := 0
var enemy_damage := 0


func _ready() -> void:
	Save.persist = false
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			Save.selected = StringName(a.trim_prefix("--char="))
	print("캐릭터: ", Save.selected)
	world = (load("res://features/world/world.tscn") as PackedScene).instantiate()
	add_child(world)
	player = get_tree().get_first_node_in_group(&"player") as Player
	enemy = get_tree().get_first_node_in_group(&"enemies") as Enemy


func _physics_process(_delta: float) -> void:
	frame += 1
	match frame:
		5:
			for e in get_tree().get_nodes_in_group(&"enemies"):
				if e != enemy:
					e.queue_free()  # 다른 몬스터가 끼어들지 않게
			enemy.global_position = player.global_position + Vector2(0, 18)
			enemy.set_physics_process(false)
			enemy.max_hp = 999  # 한 방에 쓰러지지 않게
			enemy.hp = 999
			player.dir = Player.Dir.DOWN
			player.style.press()
		20:
			_check("공격에 맞은 몬스터 체력 감소 (%d → %d)" % [enemy.max_hp, enemy.hp], enemy.hp < enemy.max_hp)
			player.style.release()
			enemy.set_physics_process(true)
			enemy.global_position = player.global_position + Vector2(3, 0)
		30:
			enemy_damage = enemy.damage
			_check("몬스터에 닿은 용사 체력 감소", player.hp == player.max_hp - enemy.damage)
			player.hurt_t = 0.0
			player.dash_t = 1.0
			var before := player.hp
			player.take_hit(2, enemy.global_position)
			_check("구르는 중에는 무적", player.hp == before)
			player.dash_t = 0.0
			enemy.queue_free()
			var heart := (load("res://features/pickup/heart_pickup.tscn") as PackedScene).instantiate() as Node2D
			heart.position = player.position
			player.get_parent().add_child(heart)
		45:
			_check("하트를 주우면 체력 회복", player.hp == mini(player.max_hp - enemy_damage + ceili(player.max_hp * 0.25), player.max_hp))
			print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
			get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
