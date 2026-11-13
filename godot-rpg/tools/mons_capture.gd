extends Node
## 확인용: 맵 하나를 열고 용사 둘레에 새 몬스터 16종을 줄 세운다.
## godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 20 res://tools/mons_capture.tscn

const NEW := ["goblin", "poison_shroom", "wing_eye", "ogre", "blue_beast", "crest_lizard", "dragon_man", "spike_fiend",
	"skel_knight", "red_armor", "pink_witch", "war_rooster", "bird_man", "horn_beast", "grass_zombie", "shade"]


const BOSSES := ["demon_lord", "storm_king", "root_worm", "giant_soul"]


func _ready() -> void:
	var world := (load("res://features/world/sky1.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().process_frame
	var p := get_tree().get_first_node_in_group(&"player") as Node2D
	p.set_physics_process(false)
	var list: Array = BOSSES if "--bosses" in OS.get_cmdline_user_args() else NEW
	for i in list.size():
		var e := (load("res://features/enemy/%s.tscn" % list[i]) as PackedScene).instantiate() as Node2D
		e.position = p.position + (Vector2(-100 + (i % 3) * 100, -50 + (i / 3) * 95) if list == BOSSES else Vector2(-105 + (i % 8) * 30, -40 + (i / 8) * 45))
		world.add_child(e)
		if "--attack" in OS.get_cmdline_user_args():
			e.position = p.position + Vector2.from_angle(i * TAU / NEW.size()) * 26.0  # 붙어서 공격 동작 보기
			e.max_hp = 999999
			e.hp = 999999
		else:
			e.set_physics_process(false)
			e.chasing = false
	if "--attack" in OS.get_cmdline_user_args():
		(p as Player).hp = 999999
		(p as Player).max_hp = 999999
