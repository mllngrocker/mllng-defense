extends Node
## 보스 연출 캡처용: 어스름 숲 킹 슬라임 앞에 용사를 세워 대면(포효·넉백) → 몇 대 때려 큰 체력바·하얀 잔상 칸을 본다.

var world: Node
var player: Player
var boss: Enemy
var frame := 0


func _ready() -> void:
	Save.persist = false
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--style="):
			(load("res://features/ui/hud.gd") as GDScript).set(&"boss_bar_style", int(a.trim_prefix("--style=")))
	Save.quest["bosses"] = {}
	world = (load("res://features/world/forest.tscn") as PackedScene).instantiate()
	add_child(world)
	player = world.get_node(^"%Player") as Player
	boss = world.find_children("KingSlime", "", true, false)[0] as Enemy
	player.max_hp = 99999
	player.hp = 99999
	player.global_position = boss.global_position + Vector2(0, 90)


func _physics_process(_delta: float) -> void:
	frame += 1
	if frame == 30 or frame == 50 or frame == 52 or frame == 54:
		if is_instance_valid(boss):
			boss.take_hit(roundi(boss.max_hp * 0.07), player.global_position)
