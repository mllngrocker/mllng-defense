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
			player.reset_physics_interpolation()
		Game.next_spawn = ""
	elif Game.resume_pos != Vector2.INF:
		player.global_position = Game.resume_pos  # 로비에 가기 전 서 있던 자리
		player.reset_physics_interpolation()
	Game.resume_pos = Vector2.INF
	if map_id() in Items.TOWNS:
		Save.last_town = map_id()  # 귀환서가 데려갈 마을
	Save.place = {"map": scene_file_path, "x": player.global_position.x, "y": player.global_position.y}
	if Save.pet != "" and Pets.DATA.has(StringName(Save.pet)):
		var pet := Pet.new()
		pet.name = "Pet"
		pet.pet_id = StringName(Save.pet)
		player.get_parent().add_child(pet)
		pet.global_position = player.global_position + Pet.FOLLOW
	var rect := ground.get_used_rect()
	var size := ground.tile_set.tile_size
	var cam: Camera2D = player.get_node(^"Camera")
	cam.limit_left = rect.position.x * size.x
	cam.limit_top = rect.position.y * size.y
	cam.limit_right = rect.end.x * size.x
	cam.limit_bottom = rect.end.y * size.y
	cam.reset_smoothing.call_deferred()
	music.bus = &"Music"
	(music.stream as AudioStreamOggVorbis).loop = true
	music.play()
	if map_title != "":
		Events.map_entered.emit.call_deferred(map_title)
	Quests.track.call_deferred("reach", map_id())
	# 처음 온 맵이면 이야기 장면(맵 이름 띠가 보인 뒤)
	get_tree().create_timer(1.0, false).timeout.connect(func() -> void: StoryBox.play(self, "enter_" + map_id()))


# ── 길찾기(자동 사냥용) ──
## 맵을 16px 칸으로 나눠 나무·바위·물·벽(1층)이 있는 칸을 막힌 칸으로 표시한 격자. 처음 쓸 때 한 번 만든다.
var _nav: AStarGrid2D


func _build_nav() -> void:
	_nav = AStarGrid2D.new()
	_nav.region = ground.get_used_rect()
	_nav.cell_size = Vector2(16, 16)
	_nav.offset = Vector2(8, 8)
	_nav.diagonal_mode = AStarGrid2D.DIAGONAL_MODE_ONLY_IF_NO_OBSTACLES
	_nav.update()
	var space := get_world_2d().direct_space_state
	var shape := RectangleShape2D.new()
	shape.size = Vector2(11, 9)  # 용사 몸 크기쯤
	var q := PhysicsShapeQueryParameters2D.new()
	q.shape = shape
	q.collision_mask = 1
	var r := _nav.region
	for y in range(r.position.y, r.end.y):
		for x in range(r.position.x, r.end.x):
			q.transform = Transform2D(0.0, Vector2(x * 16 + 8, y * 16 + 8))
			if not space.intersect_shape(q, 1).is_empty():
				_nav.set_point_solid(Vector2i(x, y), true)


func _nav_cell(p: Vector2) -> Vector2i:
	var r := _nav.region
	var c := Vector2i(floori(p.x / 16.0), floori(p.y / 16.0))
	c = Vector2i(clampi(c.x, r.position.x, r.end.x - 1), clampi(c.y, r.position.y, r.end.y - 1))
	if not _nav.is_point_solid(c):
		return c
	# 막힌 칸이면 가장 가까운 빈 칸(2칸 안)
	var best := c
	var best_d := INF
	for dy in range(-2, 3):
		for dx in range(-2, 3):
			var n := c + Vector2i(dx, dy)
			if r.has_point(n) and not _nav.is_point_solid(n):
				var d := (Vector2(n) * 16.0 + Vector2(8, 8)).distance_to(p)
				if d < best_d:
					best_d = d
					best = n
	return best


## a에서 b까지 장애물을 돌아가는 길(칸 가운데 점들). 길이 없으면 빈 배열. 물리 프레임 안에서 부른다.
func nav_path(a: Vector2, b: Vector2) -> PackedVector2Array:
	if _nav == null:
		_build_nav()
	var ca := _nav_cell(a)
	var cb := _nav_cell(b)
	if _nav.is_point_solid(ca) or _nav.is_point_solid(cb):
		return PackedVector2Array()
	return _nav.get_point_path(ca, cb)


## 지금 맵·자리를 기억한다(로비에 갔다 와도 여기서 다시 시작)
func remember_place() -> void:
	if is_instance_valid(player) and player.hp > 0:
		Save.place = {"map": scene_file_path, "x": player.global_position.x, "y": player.global_position.y}
	Save.save_game()


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
	Save.place = {}  # 쓰러지면 마을에서 다시
	Save.save_game()
	await get_tree().create_timer(2.0).timeout
	Game.go_to(VILLAGE_SCENE, "")
