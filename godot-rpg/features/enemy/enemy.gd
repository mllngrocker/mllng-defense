class_name Enemy
extends CharacterBody2D
## 몬스터 공용 스크립트. 종류(kind)에 따라 움직임이 달라진다.
## WALKER 걸어서 쫓기, HOPPER 통통 뛰어 덮치기(슬라임), FLYER 지그재그 비행(박쥐), GHOST 벽을 지나 떠다님(유령)

enum Kind { WALKER, HOPPER, FLYER, GHOST }

const TOUCH_RANGE := 11.0
const BAR_SHOW_TIME := 3.0
const BAR_WIDTH := 16.0
const SMOKE := preload("res://assets/ninja/fx/smoke.png")
const SPARK := preload("res://assets/ninja/fx/spark.png")
const HEART_PICKUP := preload("res://features/pickup/heart_pickup.tscn")

@export var kind: Kind = Kind.WALKER
@export var max_hp: int = 3
@export var speed: float = 32.0
@export var damage: int = 2
@export var chase_range: float = 96.0
@export var anim_fps: float = 6.0
@export_range(0.0, 1.0) var drop_chance: float = 0.25
@export var gold_reward: int = 5
@export_range(0.0, 1.0) var gem_chance: float = 0.15
@export var gem_reward: int = 5

var hp: int
var home: Vector2
var target: Player
var chasing := false
var dir_col := 0  # 그림 시트 열: 아래·위·왼쪽·오른쪽
var anim_t := 0.0
var life_t := 0.0
var think_t := 0.0
var wander := Vector2.ZERO
var hop_t := 0.0
var hop_vec := Vector2.ZERO
var stun_t := 0.0
var knockback := Vector2.ZERO
var bar_t := 0.0  # 맞은 뒤 잠깐 체력바를 보여 준다
## 보스면 true(Boss가 바꾼다): 체력바는 HUD 위쪽에 크게, 다시 나타나는 데 오래 걸린다
var is_boss := false

@onready var sprite: Sprite2D = $Sprite
@onready var flash_mat: ShaderMaterial = sprite.material
@onready var base_offset: Vector2 = sprite.offset
@onready var base_scale: Vector2 = sprite.scale  # 보스는 크게 그린다


func _ready() -> void:
	hp = max_hp
	home = global_position
	target = get_tree().get_first_node_in_group(&"player") as Player
	think_t = randf() * 2.0
	hop_t = randf()
	life_t = randf() * TAU
	if kind == Kind.FLYER or kind == Kind.GHOST:
		collision_mask = 0  # 물·나무 위로 날아다닌다
	if kind == Kind.GHOST:
		sprite.modulate.a = 0.85


func _physics_process(delta: float) -> void:
	if hp <= 0:
		return
	life_t += delta
	stun_t -= delta
	if bar_t > 0.0:
		bar_t -= delta
		if bar_t <= 0.0:
			queue_redraw()
	var to_player := Vector2.ZERO
	if target and target.hp > 0:
		to_player = target.global_position - global_position
		var dist := to_player.length()
		chasing = dist < (chase_range * 1.5 if chasing else chase_range)
		if dist < TOUCH_RANGE:
			target.take_hit(damage, global_position)
	else:
		chasing = false

	var move := Vector2.ZERO
	if stun_t <= 0.0:
		match kind:
			Kind.HOPPER:
				move = _hop(delta, to_player)
			Kind.FLYER:
				move = _fly(delta, to_player)
			_:
				move = to_player.normalized() * speed if chasing else _wander(delta)
	velocity = move + knockback
	knockback = knockback.move_toward(Vector2.ZERO, 600.0 * delta)
	move_and_slide()
	_animate(delta, move)


func take_hit(amount: int, from: Vector2, knock := 210.0, crit := false) -> void:
	if hp <= 0:
		return
	hp -= amount
	stun_t = 0.3
	hop_vec = Vector2.ZERO
	knockback = from.direction_to(global_position) * knock
	bar_t = BAR_SHOW_TIME
	queue_redraw()
	_flash()
	DamageNumber.spawn(_effects_parent(), global_position + Vector2(0, -10), amount, crit)
	# 타격감: 맞은 자리에 불꽃, 치명타는 묵직한 소리 + 화면 번쩍 + 더 긴 멈춤
	var spark := Fx.spawn(_effects_parent(), SPARK, 10, global_position + Vector2(randf_range(-4, 4), -9), 28.0)
	if spark:
		spark.scale = Vector2.ONE * (1.4 if crit else 0.9)
	if crit:
		Game.sfx(&"crit", -1.0)
		Game.flash(Color(1, 1, 0.9, 0.18), 0.1)
	else:
		Game.sfx(&"hit", -4.0)
	if is_boss:
		Game.sfx(&"hit_heavy", -8.0)
	Game.add_shake(4.0 if crit else 1.5)
	Game.hitstop(0.09 if crit else 0.04)
	if hp <= 0:
		_die()


## 몬스터 종류 이름(장면 파일 이름: slime, mushroom, king_slime …)
func kind_id() -> String:
	return scene_file_path.get_file().get_basename()


func _die() -> void:
	var kind := kind_id()
	Events.enemy_died.emit(kind)
	Quests.track("kill", kind)
	Save.record_kill(kind)
	if is_boss:
		if not Quests.boss_defeated(kind):
			Save.boss_reward(kind)
			var world := get_tree().get_first_node_in_group(&"world")
			get_tree().create_timer(2.5, false).timeout.connect(func() -> void: StoryBox.play(world, "boss_" + kind))
		Quests.mark_boss(kind)
		Game.sfx(&"success", -2.0, 0.0)  # 보스 처치 팡파르
		Quests.track("boss", kind)
	# 같은 자리에 잠시 뒤 다시 나타난다(맵이 맡는다)
	if scene_file_path != "":
		get_tree().call_group(&"world", &"schedule_respawn", scene_file_path, home, 90.0 if is_boss else randf_range(10.0, 16.0))
	Save.add_gold(gold_reward)
	Game.sfx(&"kill", -2.0)
	Game.add_shake(3.0)
	var world := _effects_parent()
	Fx.spawn(world, SMOKE, 6, global_position + Vector2(0, -6), 16.0)
	DamageNumber.spawn(world, global_position + Vector2(0, -2), gold_reward, false, "+%dG", Color("ffd54f"))
	if randf() < gem_chance:
		Save.add_gems(gem_reward)
		DamageNumber.spawn(world, global_position + Vector2(0, 6), gem_reward, false, "+%d보석", Color("ff8ad8"))
	if is_boss:
		ItemPickup.spawn_gear.call_deferred(world, Gear.roll(true), global_position + Vector2(0, 10))  # 보스는 희귀 이상 장비 하나
	elif randf() < Gear.DROP_CHANCE:
		ItemPickup.spawn_gear.call_deferred(world, Gear.roll(false), global_position + Vector2(randf_range(-8, 8), 4))
	if not is_boss:
		for k: StringName in Items.DROP:
			if randf() < float(Items.DROP[k]):
				ItemPickup.spawn.call_deferred(world, k, global_position + Vector2(randf_range(-8, 8), 2))
				break
	if randf() < drop_chance:
		var heart := HEART_PICKUP.instantiate() as Node2D
		heart.position = global_position
		world.add_child.call_deferred(heart)
	queue_free()


func _draw() -> void:
	if bar_t <= 0.0 or hp <= 0:
		return
	var top := Vector2(-BAR_WIDTH / 2.0, sprite.offset.y - 12.0)
	draw_rect(Rect2(top - Vector2.ONE, Vector2(BAR_WIDTH + 2, 4)), Color("181425"))
	draw_rect(Rect2(top, Vector2(BAR_WIDTH * hp / float(max_hp), 2)), Color("e43b44"))


func _wander(delta: float) -> Vector2:
	think_t -= delta
	if think_t <= 0.0:
		think_t = randf_range(1.2, 3.0)
		wander = Vector2.ZERO if randf() < 0.35 else Vector2.from_angle(randf() * TAU)
	if global_position.distance_to(home) > 56.0:
		wander = global_position.direction_to(home)
	return wander * speed * 0.5


## 슬라임: 잠깐 웅크렸다가 튀어 오르며 덮친다.
func _hop(delta: float, to_player: Vector2) -> Vector2:
	hop_t -= delta
	if hop_t <= 0.0:
		hop_t = randf_range(0.7, 1.1)
		var d: Vector2
		if chasing:
			d = to_player.normalized()
		elif global_position.distance_to(home) > 48.0:
			d = global_position.direction_to(home)
		else:
			d = Vector2.from_angle(randf() * TAU) * 0.6
		hop_vec = d * speed * 3.2
		var tw := create_tween()
		tw.tween_property(sprite, ^"scale", base_scale * Vector2(1.3, 0.7), 0.08)
		tw.tween_property(sprite, ^"scale", base_scale * Vector2(0.8, 1.25), 0.1)
		tw.tween_property(sprite, ^"scale", base_scale, 0.16)
	hop_vec = hop_vec.move_toward(Vector2.ZERO, speed * 6.0 * delta)
	return hop_vec


## 박쥐: 쫓아가면서 옆으로 출렁인다.
func _fly(delta: float, to_player: Vector2) -> Vector2:
	var base := to_player.normalized() * speed if chasing else _wander(delta) * 1.6
	var side := base.orthogonal().normalized() * sin(life_t * 6.0) * speed * 0.9
	return base + side


func _animate(delta: float, move: Vector2) -> void:
	if move.length() > 1.0:
		if absf(move.x) > absf(move.y):
			dir_col = 3 if move.x > 0.0 else 2
		else:
			dir_col = 0 if move.y > 0.0 else 1
	anim_t += delta
	sprite.frame = (int(anim_t * anim_fps) % 4) * 4 + dir_col
	if kind == Kind.FLYER or kind == Kind.GHOST:
		sprite.offset = base_offset + Vector2(0, sin(life_t * 5.0) * 2.0)


func _flash() -> void:
	flash_mat.set_shader_parameter(&"flash", 1.0)
	create_tween().tween_method(func(v: float) -> void: flash_mat.set_shader_parameter(&"flash", v), 1.0, 0.0, 0.16)


func _effects_parent() -> Node:
	var scene := get_tree().current_scene
	var entities := scene.get_node_or_null(^"Entities") if scene else null
	return entities if entities else get_parent()
