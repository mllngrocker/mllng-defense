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
var speed_mult := 1.0  # 신발 등 장비의 이동 속도 효과
var _auto_target: Node2D
var _auto_check := 0.0
var _auto_think := 0.0
var _auto_path := PackedVector2Array()
var _auto_i := 0
var _tr_path := PackedVector2Array()
var _tr_i := 0
var _tr_think := 0.0
var _tr_best := INF
var _tr_stuck := 0.0
var _tr_goal_pos := Vector2.INF
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
	Skins.apply(sprite.material as ShaderMaterial, data.id, Skins.has_skin(data.id))  # 7성 스킨 색
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
	speed_mult = 1.0 + (Save.gear_bonus(data.id, "speed") if Save.is_owned(data.id) else 0.0)
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
	if not Game.travel.is_empty():
		if input != Vector2.ZERO:
			Travel.stop()  # 손으로 움직이면 자동 이동은 멈춘다
		elif dash_t <= 0.0:
			input = _travel_drive(delta)
	if auto and input == Vector2.ZERO and dash_t <= 0.0 and Game.travel.is_empty():
		input = _auto_drive(delta)
	style.physics(delta)
	var move := input * data.move_speed * speed_mult * style.move_scale
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


## 레벨 업·장비·펫이 바뀌면(가방 창) 능력치를 다시 계산한다. 체력은 비율을 지킨다.
func refresh_stats() -> void:
	var ratio := float(hp) / maxf(1.0, float(max_hp))
	level = Save.level_of(data.id)
	max_hp = Save.hp_of(data.id) if Save.is_owned(data.id) else data.hp_at(level)
	atk = Save.atk_of(data.id) if Save.is_owned(data.id) else data.atk_at(level)
	hp = maxi(1, roundi(max_hp * ratio))
	Events.character_changed.emit(data, level)
	Events.player_hp_changed.emit(hp, max_hp)


# ── 자동 사냥 ──
## 0.35초마다 주변을 다시 살펴 가장 가까이 갈 수 있는 몬스터(또는 떨어진 아이템)를 고르고,
## 맵 길찾기(world.nav_path)로 나무·바위·물을 돌아간다. 닿으면 멈춰서 공격하고 스킬이 차면 바로 쓴다.

func _auto_drive(delta: float) -> Vector2:
	if hp < max_hp * 0.35 and Save.item_count(&"potion") > 0:
		Items.use(&"potion", get_tree())  # 체력이 적으면 물약
	for k in _auto_skip.keys():
		_auto_skip[k] -= delta
		if _auto_skip[k] <= 0.0:
			_auto_skip.erase(k)
	var gone: bool = _auto_target == null or not is_instance_valid(_auto_target) or (_auto_target.get(&"hp") != null and _auto_target.get(&"hp") <= 0)
	_auto_think -= delta
	if gone or _auto_think <= 0.0:
		_auto_think = 0.35
		_auto_choose()
	if _auto_target == null or not is_instance_valid(_auto_target):
		return Vector2.ZERO
	var v := _auto_target.global_position - global_position
	var d := v.length()
	var is_enemy := _auto_target.is_in_group(&"enemies")
	var reach := 4.0 if not is_enemy else (75.0 if data.attack_kind == 1 else 16.0)  # 마법은 떨어져서 쏜다
	# 1.5초 동안 가까워지지 않으면 잠깐 포기하고 다른 것으로
	_auto_check += delta
	if d < _auto_best - 2.0:
		_auto_best = d
		_auto_check = 0.0
	elif _auto_check > 1.5 and d > reach + 8.0:
		_auto_skip[_auto_target.get_instance_id()] = 4.0
		_auto_target = null
		return Vector2.ZERO
	if is_enemy and d <= reach + 10.0:
		dir = _dir_from(v)
		if skill_lock_t <= 0.0:
			for node in ["a3", "a2", "a1"]:
				if skills.has_skill(node) and skills.try_cast(node):
					break
		if not style.busy and style.wants_press():
			attack_buffer = ATTACK_BUFFER
		_auto_check = 0.0
		return Vector2.ZERO if d <= reach else v.normalized() * 0.6
	# 길 따라 걷기: 지나온 점은 넘기고 다음 점으로
	_auto_i = _skip_passed(_auto_path, _auto_i)
	if _auto_i < _auto_path.size() - 1:
		return (_auto_path[_auto_i] - global_position).normalized()
	return v.normalized()  # 마지막 칸(또는 길 없음)은 곧장


## 목표 다시 고르기: 가까운 순으로 몇 개만 길을 찾아 보고, 실제 걸어갈 거리가 가장 짧은 것을 고른다
func _auto_choose() -> void:
	var world := get_tree().get_first_node_in_group(&"world")
	var cands: Array = []
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if e.get(&"hp") > 0 and not _auto_skip.has(e.get_instance_id()):
			cands.append([e.global_position.distance_to(global_position), e])
	# 떨어진 아이템·하트: 가까이 있으면 주우러 간다(하트는 체력이 깎였을 때만)
	for p: Node2D in get_tree().get_nodes_in_group(&"pickups"):
		if _auto_skip.has(p.get_instance_id()) or (p.is_in_group(&"hearts") and hp >= max_hp):
			continue
		var pd := p.global_position.distance_to(global_position)
		if pd < 90.0:
			cands.append([pd * 0.6, p])  # 조금 더 먼저 줍게
	cands.sort_custom(func(a: Array, b: Array) -> bool: return a[0] < b[0])
	var best: Node2D = null
	var best_len := INF
	var best_path := PackedVector2Array()
	for i in mini(cands.size(), 4):
		var r := _auto_route(world, cands[i][1], cands[i][0])
		if r[0] < best_len:
			best_len = r[0]
			best = cands[i][1]
			best_path = r[1]
	# 지금 목표가 멀쩡하면, 새 목표가 25% 넘게 가까울 때만 바꾼다(왔다 갔다 하지 않게)
	var cur := _auto_target
	if cur != null and is_instance_valid(cur) and cur != best and not _auto_skip.has(cur.get_instance_id()) and (cur.get(&"hp") == null or cur.get(&"hp") > 0):
		var r := _auto_route(world, cur, cur.global_position.distance_to(global_position) * (1.0 if cur.is_in_group(&"enemies") else 0.6))
		if best == null or best_len > float(r[0]) * 0.75:
			best = cur
			best_path = r[1]
	if best != _auto_target:
		_auto_check = 0.0
		_auto_best = INF
	_auto_target = best
	_auto_path = best_path
	_auto_i = 1 if best_path.size() > 1 else 0


## 그 대상까지 걸어갈 거리와 길 [거리, 길]. 길이 없는 곳(물 건너 등)은 거리를 크게 쳐서 뒤로 미룬다
func _auto_route(world: Node, node: Node2D, straight: float) -> Array:
	var path := PackedVector2Array()
	if world and world.has_method(&"nav_path"):
		path = world.call(&"nav_path", global_position, node.global_position)
	if path.size() >= 2:
		var length := 0.0
		for k in range(1, path.size()):
			length += path[k - 1].distance_to(path[k])
		return [length * (1.0 if node.is_in_group(&"enemies") else 0.6), path]
	return [straight + (400.0 if straight > 28.0 else 0.0), path]


# ── 퀘스트 자동 이동(Travel) ──

## 이번 걸음 방향. 목적지 맵이 아니면 다음 맵으로 가는 문으로, 목적지 맵이면 할 일(사람·보스) 앞으로.
func _travel_drive(delta: float) -> Vector2:
	var world := get_tree().get_first_node_in_group(&"world")
	if world == null:
		return Vector2.ZERO
	var t: Dictionary = Game.travel
	var here: String = world.call(&"map_id")
	_tr_think -= delta
	if _tr_think <= 0.0 or _tr_goal_pos == Vector2.INF:
		_tr_think = 0.6
		var goal := _travel_goal(world, here, t)
		if goal == Vector2.INF:
			return Vector2.ZERO
		if goal.distance_to(_tr_goal_pos) > 4.0:
			_tr_best = INF
			_tr_stuck = 0.0
		_tr_goal_pos = goal
		_tr_path = world.call(&"nav_path", global_position, goal)
		_tr_i = 1 if _tr_path.size() > 1 else 0
	var d := global_position.distance_to(_tr_goal_pos)
	# 다 왔으면 할 일
	if here == String(t["goal"]):
		var near := 70.0 if t["kind"] == "boss" else (18.0 if t["kind"] == "talk" else 9999.0)
		if t["kind"] == "reach" or d < near:
			_travel_arrive(String(t["kind"]))
			return Vector2.ZERO
	# 4초 넘게 가까워지지 않으면 포기
	if d < _tr_best - 3.0:
		_tr_best = d
		_tr_stuck = 0.0
	else:
		_tr_stuck += delta
		if _tr_stuck > 4.0:
			Travel.stop("길이 막혀서 자동 이동을 멈췄어요")
			return Vector2.ZERO
	_tr_i = _skip_passed(_tr_path, _tr_i)
	if _tr_i < _tr_path.size() - 1:
		return (_tr_path[_tr_i] - global_position).normalized()
	return (_tr_goal_pos - global_position).normalized()


## 이 맵에서 향할 점: 다음 맵으로 가는 문 / 말 걸 사람 / 보스 / (처치는 아무 데나)
func _travel_goal(world: Node, here: String, t: Dictionary) -> Vector2:
	var goal := String(t["goal"])
	if here != goal:
		var r := Travel.route(here, goal)
		if r.size() < 2:
			Travel.stop("길이 막혀서 자동 이동을 멈췄어요")
			return Vector2.INF
		for n in world.find_children("*", "Portal", true, false):
			var p := n as Portal
			var to := p.target_scene.get_file().get_basename()
			if ("field" if to == "world" else to) == r[1] and p.is_open():
				return p.global_position
		Travel.stop("문을 찾지 못했어요")
		return Vector2.INF
	match String(t["kind"]):
		"talk":
			for n in world.find_children("*", "Npc", true, false):
				if (n as Npc).display_name == String(t["target"]):
					return (n as Node2D).global_position + Vector2(0, 12)
		"boss":
			for e in get_tree().get_nodes_in_group(&"enemies"):
				if (e as Enemy).kind_id() == String(t["target"]):
					return (e as Node2D).global_position
			return global_position  # 보스가 아직 안 나왔으면 제자리에서 기다리며 사냥
	return global_position


func _travel_arrive(kind: String) -> void:
	_tr_goal_pos = Vector2.INF
	match kind:
		"reach":
			Travel.stop("도착!")
		"talk":
			Travel.stop()
		"boss", "kill":
			auto = true  # 여기서부터는 자동 사냥
			Save.settings["auto"] = true
			get_tree().call_group(&"hud", &"_refresh_auto")
			Travel.stop("도착! 자동 사냥 시작")


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

## 길 따라가기: 이미 지나친 점은 건너뛴다(구르기로 앞질러도 뒤로 돌아가지 않게).
## 남은 점 중 가장 가까운 점을 찾아, 거기에 거의 닿았거나 그다음 점이 더 가까우면 그다음으로.
func _skip_passed(path: PackedVector2Array, i: int) -> int:
	if i >= path.size():
		return i
	var best := i
	var best_d := INF
	for k in range(i, path.size()):
		var d := global_position.distance_to(path[k])
		if d < best_d:
			best_d = d
			best = k
	if best_d < 8.0 or (best + 1 < path.size() and global_position.distance_to(path[best + 1]) < path[best].distance_to(path[best + 1])):
		best += 1
	return best


func _start_dash(input: Vector2) -> void:
	style.cancel()
	_tr_think = 0.0  # 구르고 나면 길을 바로 다시 찾는다
	_auto_think = 0.0
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
