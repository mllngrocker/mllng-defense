extends Node
## 지도 확인용 녹화(진짜 저장은 안 건드림): 초원 동쪽 잠긴 문 앞 → 지역 지도 → 월드 지도.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 80 res://tools/mapview_capture.tscn

var world: Node
var frame := 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS  # 지도가 게임을 멈춰도 녹화 진행
	Save.persist = false
	Save.quest.erase("bosses")
	world = (load("res://features/world/shore.tscn") as PackedScene).instantiate()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	add_child(world)
	var gate := world.find_children("Portal_*", "", true, false)[0] as Node2D
	var player := world.get_node(^"%Player") as Node2D
	player.global_position = gate.global_position + Vector2(60, 10)


func _process(_delta: float) -> void:
	frame += 1
	match frame:
		25:
			world.get_node(^"HUD").open_map()
		50:
			var mv := world.get_node(^"HUD").find_children("*", "MapView", false, false)
			if mv.size() > 0:
				mv[0].tab = 1
