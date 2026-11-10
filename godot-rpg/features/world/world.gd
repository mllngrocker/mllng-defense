extends Node2D
## 맵 한 장(마을·초원·사막 공용): 배경 음악, 카메라가 맵 밖을 비추지 않게 막기,
## 이동문으로 들어왔으면 도착 지점에 세우기, 맵 이름 띄우기, 쓰러지면 로비(아바타 탭)로 돌아가기.

const MENU_SCENE := "res://features/menu/main_menu.tscn"
const VILLAGE_SCENE := "res://features/world/village.tscn"
const RESPAWN_CLEAR := 110.0  # 용사가 이 거리 안에 있으면 몬스터가 다시 나타나지 않고 기다린다

@export var map_title := ""

@onready var ground: TileMapLayer = $Ground
@onready var player: Player = %Player
@onready var music: AudioStreamPlayer = $Music


func _ready() -> void:
	add_to_group(&"world")
	Events.player_died.connect(_on_player_died)
	if Game.next_spawn != "":
		var spot := get_node_or_null(NodePath("Spawns/" + Game.next_spawn)) as Node2D
		if spot:
			player.global_position = spot.global_position
		Game.next_spawn = ""
	var rect := ground.get_used_rect()
	var size := ground.tile_set.tile_size
	var cam: Camera2D = player.get_node(^"Camera")
	cam.limit_left = rect.position.x * size.x
	cam.limit_top = rect.position.y * size.y
	cam.limit_right = rect.end.x * size.x
	cam.limit_bottom = rect.end.y * size.y
	cam.reset_smoothing.call_deferred()
	(music.stream as AudioStreamOggVorbis).loop = true
	music.play()
	if map_title != "":
		Events.map_entered.emit.call_deferred(map_title)
	Quests.track.call_deferred("reach", map_id())


## 맵 이름(village / field / desert)
func map_id() -> String:
	var f := scene_file_path.get_file().get_basename()
	return "field" if f == "world" else f


## 쓰러진 몬스터를 delay초 뒤 같은 자리에 다시 놓는다(용사가 너무 가까우면 떨어질 때까지 기다림)
func schedule_respawn(path: String, pos: Vector2, delay: float) -> void:
	await get_tree().create_timer(delay, false).timeout
	while is_inside_tree() and is_instance_valid(player) and player.global_position.distance_to(pos) < RESPAWN_CLEAR:
		await get_tree().create_timer(2.0, false).timeout
	if not is_inside_tree():
		return
	var e := (load(path) as PackedScene).instantiate() as Node2D
	e.position = pos
	$Entities.add_child(e)
	Fx.spawn($Entities, preload("res://assets/ninja/fx/smoke.png"), 6, pos + Vector2(0, -6), 14.0)


## 쓰러지면 잠시 뒤 마을 광장에서 다시 일어난다(체력 가득)
func _on_player_died() -> void:
	music.stop()
	Save.save_game()
	await get_tree().create_timer(2.0).timeout
	Game.go_to(VILLAGE_SCENE, "")
