class_name Player
extends CharacterBody2D
## 필드에 나가는 캐릭터. 고른 캐릭터(CharacterData)대로 그림·능력치·공격 방식이 바뀐다.
## 이동, 공격(방식별 AttackStyle에 맡김), 구르기(무적), 맞으면 넉백·번쩍임·깜빡임.

enum Dir { DOWN, UP, LEFT, RIGHT }

const DASH_SPEED := 210.0
const DASH_TIME := 0.15
const DASH_COOLDOWN := 0.5
const HURT_TIME := 1.0
const ATTACK_BUFFER := 0.15
const CRIT_CHANCE := 0.12
const CRIT_MULT := 1.6
const DIR_VEC: Array[Vector2] = [Vector2.DOWN, Vector2.UP, Vector2.LEFT, Vector2.RIGHT]
## 칼 판정 영역은 아래(+y)가 앞이라 방향마다 돌린다
const SWORD_ROT: Array[float] = [0.0, PI, PI / 2.0, -PI / 2.0]
## 걷기 그림(쯔꾸르 규격 3열×4줄): 줄은 아래·왼쪽·오른쪽·위
const DIR_ROW: Array[int] = [0, 3, 1, 2]
const WALK_COLS: Array[int] = [1, 0, 1, 2]
const IDLE_COL := 1
const STYLES: Dictionary[int, Script] = {
	CharacterData.AttackKind.COMBO: preload("res://features/player/attacks/combo_attack.gd"),
	CharacterData.AttackKind.MAGIC: preload("res://features/player/attacks/magic_attack.gd"),
	CharacterData.AttackKind.HEAVY: preload("res://features/player/attacks/heavy_attack.gd"),
}

## 비워 두면 저장된 "고른 캐릭터"로 나간다
@export var character_override: CharacterData

var data: CharacterData
var level := 1
var max_hp := 100
var hp := 100
var atk := 10
var dir: Dir = Dir.DOWN
var style: AttackStyle
var anim_t := 0.0
var attack_buffer := 0.0
var dash_t := 0.0
var dash_cd := 0.0
var dash_vec := Vector2.ZERO
var ghost_t := 0.0
var hurt_t := 0.0
var knockback := Vector2.ZERO
var skills: SkillCaster
var skill_lock_t := 0.0  # 스킬 쓰는 동안 직접 못 움직인다
var skill_move := Vector2.ZERO
var skill_guard := false  # 스킬 쓰는 동안 무적인지
## 자동 사냥: 켜면 가까운 몬스터를 찾아가 공격하고, 스킬이 차면 바로 쓴다. 조이스틱을 움직이면 그동안은 손으로 조종.
var auto := false
var _auto_target: Node2D
var _auto_check := 0.0
var _auto_best := INF
var _auto_skip: Dictionary = {}  # 길이 막혀 못 가는 몬스터 → 무시할 남은 시간

@onready var sprite: Sprite2D = $Sprite
@onready var sword: Area2D = $Sword
@onready var sword_cs: CollisionShape2D = $Sword/Shape
@onready var flash_mat: ShaderMaterial = sprite.material
@onready var base_scale: Vector2 = sprite.scale


func _ready() -> void:
	data = character_override if character_override else Save.current()
	level = Save.level_of(data.id)
	max_hp = Save.hp_of(data.id) if Save.is_owned(data.id) else data.hp_at(level)
	hp = max_hp
	atk = Save.atk_of(data.id) if Save.is_owned(data.id) else data.atk_at(level)
	sprite.texture = data.walk_sheet
	sword_cs.shape = sword_cs.shape.duplicate()
	style = STYLES[data.attack_kind].new() as AttackStyle
	style.name = "Attack"
	add_child(style)
	style.setup(self, data)
	skills = SkillCaster.new()
	skills.name = "Skill"
	add_child(skills)
	skills.setup(self, data)
	auto = bool(Save.settings.get("auto", false))
	Events.character_changed.emit.call_deferred(data, level)
	Events.player_hp_changed.emit.call_deferred(hp, max_hp)


func _physics_process(delta: float) -> void:
	if hp <= 0:
		return
	hurt_t = maxf(hurt_t - delta, 0.0)
	dash_cd -= delta
	attack_buffer -= delta
	if Input.is_action_just_pressed(&"attack"):
		attack_buffer = ATTACK_BUFFER

	# 조이스틱 세기를 그대로 쓴다(기본 데드존 0.5면 살짝 밀 때 안 움직여서 뻑뻑하다)
	var input := Input.get_vector(&"move_left", &"move_right", &"move_up", &"move_down", 0.05)
	if auto and input == Vector2.ZERO and dash_t <= 0.0:
		input = _auto_drive(delta)
	style.physics(delta)
	var move := input * data.move_speed * style.move_scale
	if dash_t <= 0.0 and skill_lock_t <= 0.0:
		if Input.is_action_just_pressed(&"skill"):
			skills.try_cast("a1")
		elif Input.is_action_just_pressed(&"skill2"):
			skills.try_cast("a2")
		elif Input.is_action_just_pressed(&"skill3"):
			skills.try_cast("a3")
	if skill_lock_t > 0.0:
		skill_lock_t -= delta
		move = skill_move
		ghost_t -= delta
		if ghost_t <= 0.0 and skill_move != Vector2.ZERO:
			ghost_t = 0.03
			_spawn_afterimage()
	elif dash_t > 0.0:
		dash_t -= delta
		move = dash_vec * DASH_SPEED
		ghost_t -= delta
		if ghost_t <= 0.0:
			ghost_t = 0.03
			_spawn_afterimage()
	else:
		if attack_buffer > 0.0 and style.wants_press():
			attack_buffer = 0.0
			style.press()
		if style.busy:
			move = style.lunge
		else:
			if input != Vector2.ZERO:
				dir = _dir_from(input)
			if Input.is_action_just_pressed(&"dash") and dash_cd <= 0.0:
				_start_dash(input)
	if Input.is_action_just_released(&"attack"):
		style.release()

	velocity = move + knockback
	knockback = knockback.move_toward(Vector2.ZERO, 700.0 * delta)
	move_and_slide()
	_animate(delta, input != Vector2.ZERO and not style.busy)


# ── 자동 사냥 ──

## 가까운 몬스터 쪽으로 갈 방향(0~1 세기)을 돌려준다. 닿으면 멈춰서 공격·스킬.
func _auto_drive(delta: float) -> Vector2:
	for k in _auto_skip.keys():
		_auto_skip[k] -= delta
		if _auto_skip[k] <= 0.0:
			_auto_skip.erase(k)
	if _auto_target == null or not is_instance_valid(_auto_target) or _auto_target.get(&"hp") <= 0:
		_auto_target = _auto_pick()
		_auto_check = 0.0
		_auto_best = INF
	if _auto_target == null:
		return Vector2.ZERO
	var v := _auto_target.global_position - global_position
	var d := v.length()
	var reach := 75.0 if data.attack_kind == 1 else 16.0  # 마법은 떨어져서 쏜다
	# 길이 막혀 1.5초 동안 가까워지지 않으면 다른 몬스터로
	_auto_check += delta
	if d < _auto_best - 2.0:
		_auto_best = d
		_auto_check = 0.0
	elif _auto_check > 1.5 and d > reach + 8.0:
		_auto_skip[_auto_target.get_instance_id()] = 4.0
		_auto_target = null
		return Vector2.ZERO
	if d <= reach + 10.0:
		dir = _dir_from(v)
		if skill_lock_t <= 0.0:
			for node in ["a3", "a2", "a1"]:
				if skills.has_skill(node) and skills.try_cast(node):
					break
		if not style.busy and style.wants_press():
			attack_buffer = ATTACK_BUFFER
		_auto_best = minf(_auto_best, d)
		_auto_check = 0.0
		return Vector2.ZERO if d <= reach else v.normalized() * 0.6
	return v.normalized()


func _auto_pick() -> Node2D:
	var best: Node2D = null
	var best_d := INF
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if e.get(&"hp") <= 0 or _auto_skip.has(e.get_instance_id()):
			continue
		var d := e.global_position.distance_to(global_position)
		if d < best_d:
			best_d = d
			best = e
	return best


# ── 공격 방식(AttackStyle)이 쓰는 도구 ──

## 가까운 적이 있으면 그쪽으로 몸을 돌리고 그 방향을 돌려준다(모바일 자동 조준).
func aim(max_range: float) -> Vector2:
	var best: Node2D = null
	var best_d := max_range
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		var d := e.global_position.distance_to(global_position)
		if d < best_d and e.get(&"hp") > 0:
			best = e
			best_d = d
	if best:
		var v := best.global_position - global_position
		dir = _dir_from(v)
		return v.normalized()
	return DIR_VEC[dir]


## 칼 판정 영역을 지금 방향 앞쪽에 둔다(크기·거리는 공격마다).
func point_sword(radius: float, reach: float) -> void:
	sword.rotation = SWORD_ROT[dir]
	(sword_cs.shape as CircleShape2D).radius = radius
	sword_cs.position = Vector2(0, reach)


## 칼 판정 안에 있는 모든 대상에게 피해. 맞힌 수를 돌려준다.
func strike(mult: float, knock: float) -> int:
	var hits := 0
	for body in sword.get_overlapping_bodies():
		if body.has_method(&"take_hit"):
			hit(body, mult, knock, global_position)
			hits += 1
	return hits


## 대상 하나에게 공격력 × 배율 피해(치명타 판정 포함).
func hit(body: Node2D, mult: float, knock: float, from: Vector2) -> void:
	var amount := float(atk) * mult * randf_range(0.9, 1.1)
	var crit := randf() < (Save.crit_of(data.id) if Save.is_owned(data.id) else CRIT_CHANCE)
	if crit:
		amount *= CRIT_MULT
	body.take_hit(maxi(1, roundi(amount)), from, knock, crit)


func body_center() -> Vector2:
	return global_position + Vector2(0, -10)


func fx_parent() -> Node:
	return get_parent()


func squash(amount: Vector2, duration := 0.2) -> void:
	var tw := create_tween()
	tw.tween_property(sprite, ^"scale", base_scale * amount, duration * 0.25)
	tw.tween_property(sprite, ^"scale", base_scale, duration * 0.75)


func flash(strength := 1.0) -> void:
	flash_mat.set_shader_parameter(&"flash", strength)
	create_tween().tween_method(func(v: float) -> void: flash_mat.set_shader_parameter(&"flash", v), strength, 0.0, 0.18)


## 스킬이 잠깐 몸을 붙잡는다: time초 동안 move 속도로만 움직이고, guard면 무적.
func lock_for_skill(time: float, move: Vector2, guard: bool) -> void:
	skill_lock_t = time
	skill_move = move
	skill_guard = guard


# ── 맞기·회복 ──

func take_hit(amount: int, from: Vector2, knock := 190.0, _crit := false) -> void:
	if hurt_t > 0.0 or dash_t > 0.0 or hp <= 0 or (skill_lock_t > 0.0 and skill_guard):
		return
	hp = maxi(hp - amount, 0)
	hurt_t = HURT_TIME
	knockback = from.direction_to(global_position) * knock
	Game.sfx(&"hurt")
	Game.add_shake(4.0)
	Game.hitstop(0.08)
	flash()
	DamageNumber.spawn(fx_parent(), global_position + Vector2(0, -8), amount, false)
	Events.player_hp_changed.emit(hp, max_hp)
	if hp == 0:
		style.cancel()
		sprite.visible = true
		sprite.rotation = PI / 2.0
		sprite.modulate = Color(1.0, 0.55, 0.55)
		Events.player_died.emit()


func heal(amount: int) -> void:
	hp = mini(hp + amount, max_hp)
	Events.player_hp_changed.emit(hp, max_hp)


# ── 내부 ──

func _start_dash(input: Vector2) -> void:
	style.cancel()
	dash_vec = input.normalized() if input != Vector2.ZERO else DIR_VEC[dir]
	dash_t = DASH_TIME
	dash_cd = DASH_COOLDOWN
	Game.sfx(&"dash", -6.0)


func _dir_from(v: Vector2) -> Dir:
	if absf(v.x) > absf(v.y):
		return Dir.RIGHT if v.x > 0.0 else Dir.LEFT
	return Dir.DOWN if v.y > 0.0 else Dir.UP


func _animate(delta: float, moving: bool) -> void:
	var row := DIR_ROW[dir] * 3
	if style.busy or skill_lock_t > 0.0:
		sprite.frame = row + 2
	elif dash_t > 0.0:
		sprite.frame = row
	else:
		anim_t = anim_t + delta if moving else 0.0
		sprite.frame = row + (WALK_COLS[int(anim_t * 7.0) % 4] if moving else IDLE_COL)
	sprite.visible = hurt_t <= 0.0 or int(hurt_t * 16.0) % 2 == 0


func _spawn_afterimage() -> void:
	var g := Sprite2D.new()
	g.texture = sprite.texture
	g.hframes = sprite.hframes
	g.vframes = sprite.vframes
	g.frame = sprite.frame
	g.offset = sprite.offset
	g.scale = sprite.scale
	g.texture_filter = sprite.texture_filter
	g.modulate = Color(data.trail_color, 0.55)
	fx_parent().add_child(g)
	g.global_position = global_position
	var tw := g.create_tween()
	tw.tween_property(g, ^"modulate:a", 0.0, 0.22)
	tw.tween_callback(g.queue_free)
