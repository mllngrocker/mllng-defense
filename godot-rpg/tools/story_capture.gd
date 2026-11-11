extends Node
## 이야기 창 확인용 녹화(저장 안 건드림): 마을에서 첫 장면을 띄운다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 60 res://tools/story_capture.tscn

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	Save.persist = false
	var world := (load("res://features/world/village.tscn") as PackedScene).instantiate()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	var box := StoryBox.new()
	box.lines = StoryData.SCENES["enter_village"]
	get_tree().get_first_node_in_group(&"hud").add_child(box)
