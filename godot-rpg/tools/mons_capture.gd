extends Node
## 확인용: 맵 하나를 열고 용사 둘레에 새 몬스터 16종을 줄 세운다.
## godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 20 res://tools/mons_capture.tscn

const NEW := ["goblin", "poison_shroom", "wing_eye", "ogre", "blue_beast", "crest_lizard", "dragon_man", "spike_fiend",
	"skel_knight", "red_armor", "pink_witch", "war_rooster", "bird_man", "horn_beast", "grass_zombie", "shade"]


func _ready() -> void:
	var world := (load("res://features/world/sky1.tscn") as PackedScene).instantiate()
	add_child(world)
	await get_tree().process_frame
	var p := get_tree().get_first_node_in_group(&"player") as Node2D
	p.set_physics_process(false)
	for i in NEW.size():
		var e := (load("res://features/enemy/%s.tscn" % NEW[i]) as PackedScene).instantiate() as Node2D
		e.position = p.position + Vector2(-105 + (i % 8) * 30, -40 + (i / 8) * 45)
		world.add_child(e)
		e.set_physics_process(false)
		e.chasing = false
