class_name DungeonDirector
extends Node
## 일일 던전(시련의 투기장): 60초 동안 몬스터가 파도처럼 몰려온다. 많이 잡을수록 보상이 커진다.
## 골드 던전(처치 골드 3배) · 장비 던전(처치마다 20% 장비) · 스킬 북 던전(15마리마다 트레이닝 북, 60마리면 마스터 북).
## 몬스터 강함은 지금까지 잡은 보스 수로 정한다. 끝나면(시간 끝·쓰러짐) 결과 창 → 로비로.

const SCENE := "res://features/world/dungeon.tscn"
const TIME := 60.0
const MAX_ALIVE := 26  # 한꺼번에 살아 있는 몬스터 최대 수
const KINDS := {
	"gold": ["골드 던전", "처치 골드 3배", &"coin"],
	"gear": ["장비 던전", "처치마다 20% 장비", &"slot_armor"],
	"book": ["스킬 북 던전", "15마리마다 트레이닝 북", &"book"],
}
## 잡은 보스 수 → 나오는 몬스터 두 종
const TIER_MOBS: Array = [["slime", "mushroom"], ["mushroom", "snake"], ["snake", "lizard"], ["kappa", "spider"], ["panda", "snow_bat"],
	["blue_axolot", "jump_fish"], ["flam", "trex"], ["lantern_red", "demon_eye"], ["bamboo", "sky_spirit"], ["root_larva", "root_beast"],
	["garden_owl", "garden_beast"], ["mist_octo", "mist_snake"]]

var kind := "gold"
var time_left := TIME
var kills := 0
var gold := 0
var gear_got: Array[StringName] = []
var done := false
var _spawn_t := 0.5
var _alive: Array = []
var _label: Label
var _world: Node2D


## 던전 들어가기(로비 퀘스트 탭에서). 오늘 남은 입장이 없으면 false
static func enter(tree: SceneTree, k: String) -> bool:
	if not Quests.use_dungeon():
		return false
	Game.dungeon = k
	Save.save_game()
	tree.change_scene_to_file(SCENE)
	return true


func _ready() -> void:
	kind = Game.dungeon
	_world = get_parent() as Node2D
	Events.enemy_died.connect(_on_enemy_died)
	var layer := CanvasLayer.new()
	layer.layer = 5
	add_child(layer)
	_label = Label.new()
	_label.add_theme_font_override(&"font", Gt.BOLD)
	_label.add_theme_font_size_override(&"font_size", 20)
	_label.add_theme_color_override(&"font_outline_color", Gt.INK)
	_label.add_theme_constant_override(&"outline_size", 6)
	_label.set_anchors_preset(Control.PRESET_CENTER_TOP)
	_label.offset_left = -200
	_label.offset_right = 200
	_label.offset_top = 170
	_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	layer.add_child(_label)
	Game.sfx(&"alert", -2.0, 0.0)


func _physics_process(delta: float) -> void:
	if done:
		return
	time_left -= delta
	_label.text = "%s  %d초 · 처치 %d" % [KINDS[kind][0], ceili(maxf(time_left, 0.0)), kills]
	if time_left <= 0.0:
		finish(true)
		return
	_spawn_t -= delta
	if _spawn_t <= 0.0:
		_spawn_t = 1.2
		_wave()


## 용사 둘레 빈 칸에 몬스터 5마리(1.2초마다)
func _wave() -> void:
	var still: Array = []
	for e in _alive:
		if is_instance_valid(e):
			still.append(e)
	_alive = still
	var player := get_tree().get_first_node_in_group(&"player") as Node2D
	if player == null:
		return
	var tier := clampi((Save.quest.get("bosses", {}) as Dictionary).size(), 0, TIER_MOBS.size() - 1)
	var ents := _world.get_node(^"Entities")
	for i in mini(5, MAX_ALIVE - _alive.size()):
		var pos := _free_spot(player.global_position)
		if pos == Vector2.INF:
			continue
		var mob: String = TIER_MOBS[tier][randi() % 2]
		var e := (load("res://features/enemy/%s.tscn" % mob) as PackedScene).instantiate() as Enemy
		e.max_hp = maxi(1, roundi(e.max_hp * 0.55))  # 많이, 빨리 잡히게
		e.chase_range = 400.0
		e.drop_chance = 0.0
		if kind == "gold":
			e.gold_reward *= 3
		e.position = pos
		ents.add_child(e)
		e.tree_exiting.connect(_on_mob_gone.bind(e))
		_alive.append(e)
		Fx.spawn(ents, preload("res://assets/ninja/fx/smoke.png"), 6, pos + Vector2(0, -6), 14.0)


func _free_spot(around: Vector2) -> Vector2:
	var nav: AStarGrid2D = _world.get(&"_nav")
	if nav == null:
		_world.call(&"nav_path", around, around)  # 길찾기 격자를 만든다
		nav = _world.get(&"_nav")
	for _try in 20:
		var p := around + Vector2.from_angle(randf() * TAU) * randf_range(70.0, 130.0)
		var c := Vector2i(floori(p.x / 16.0), floori(p.y / 16.0))
		if nav.region.has_point(c) and not nav.is_point_solid(c):
			return Vector2(c) * 16.0 + Vector2(8, 8)
	return Vector2.INF


func _on_enemy_died(_k: String) -> void:
	if done:
		return
	kills += 1


## 장비 던전: 쓰러진 자리에 20% 장비
func _on_mob_gone(e: Enemy) -> void:
	if done or not is_instance_valid(e) or e.hp > 0:
		return
	gold += roundi(e.gold_reward * Enemy.BOSS_GOLD_MULT) if e.is_boss else maxi(1, roundi(e.gold_reward * Enemy.GOLD_MULT))  # 실제로 받은 만큼
	if kind == "gear" and randf() < 0.2:
		var g := Gear.roll(false)
		gear_got.append(g)
		ItemPickup.spawn_gear.call_deferred(_world.get_node(^"Entities"), g, e.global_position)


## 끝: 보상 정리 → 결과 창
func finish(cleared: bool) -> void:
	if done:
		return
	done = true
	var books := 0
	var master := 0
	if kind == "book":
		books = kills / 15
		master = 1 if kills >= 60 else 0
		Save.give_books(books, master)
	# 아직 안 주운 장비도 챙겨 준다
	for p in get_tree().get_nodes_in_group(&"pickups"):
		if p.get(&"gear_id") != &"":
			Save.give_gear(p.get(&"gear_id"))
			p.queue_free()
	Save.add_stat("dungeon")
	Save.save_game()
	Game.sfx(&"success" if cleared else &"hurt", -2.0, 0.0)
	var box := DungeonResult.new()
	box.info = {"kind": kind, "kills": kills, "gold": gold, "gear": gear_got, "books": books, "master": master, "cleared": cleared}
	var hud := get_tree().get_first_node_in_group(&"hud")
	(hud if hud else _world).add_child(box)
