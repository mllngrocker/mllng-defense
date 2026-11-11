class_name Pet
extends Node2D
## 데리고 다니는 펫: 용사 뒤를 졸졸 따라오다가, 가까이 몬스터가 있으면 달려가 물고 돌아온다.

const FOLLOW := Vector2(-18, 6)
const RANGE := 110.0
const COOLDOWN := 1.3

var pet_id: StringName
var sprite: Sprite2D
var player: Node2D
var cd := 0.8
var busy := false
var _t := 0.0


func _ready() -> void:
	sprite = Sprite2D.new()
	sprite.texture = Pets.texture(pet_id)
	var f := Pets.frames_of(pet_id)
	sprite.hframes = f.x
	sprite.vframes = f.y
	sprite.offset = Vector2(0, -7)
	sprite.scale = Vector2.ONE * 0.8  # 몬스터보다 조금 작게
	add_child(sprite)
	var shadow := Sprite2D.new()
	shadow.texture = load("res://assets/ninja/actor/shadow.png")
	shadow.show_behind_parent = true
	add_child(shadow)
	move_child(shadow, 0)


func _physics_process(delta: float) -> void:
	_t += delta
	if player == null or not is_instance_valid(player):
		player = get_tree().get_first_node_in_group(&"player") as Node2D
		return
	var before := global_position
	if not busy:
		var target := player.global_position + FOLLOW
		if global_position.distance_to(target) > 200.0:
			global_position = target  # 너무 멀어지면(맵 이동 등) 바로 옆으로
		global_position = global_position.lerp(target, 1.0 - exp(-6.0 * delta))
		cd -= delta
		if cd <= 0.0:
			_try_attack()
	_animate(global_position - before, delta)


func _animate(moved: Vector2, _delta: float) -> void:
	var f := Pets.frames_of(pet_id)
	var walking := moved.length() > 0.15
	var step := int(_t * (8.0 if walking else 3.0)) % (2 if f.y == 1 else 4)
	if f.y == 1:
		sprite.frame = step
		if absf(moved.x) > 0.05:
			sprite.flip_h = moved.x < 0.0
	else:
		var dir := 0
		if absf(moved.x) > absf(moved.y):
			dir = 3 if moved.x > 0.0 else 2
		elif moved.length() > 0.05:
			dir = 0 if moved.y > 0.0 else 1
		sprite.frame = (step if walking else 0) * 4 + dir


func _try_attack() -> void:
	var best: Node2D = null
	var best_d := RANGE
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		var d := e.global_position.distance_to(player.global_position)
		if d < best_d:
			best_d = d
			best = e
	if best == null:
		cd = 0.3
		return
	busy = true
	cd = COOLDOWN
	var start := global_position
	var hit := best.global_position + (start - best.global_position).normalized() * 8.0
	var tw := create_tween()
	tw.tween_property(self, ^"global_position", hit, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tw.tween_callback(func() -> void:
		if is_instance_valid(best) and best.has_method(&"take_hit"):
			var atk: int = player.get(&"atk") if player.get(&"atk") != null else 10
			best.call(&"take_hit", maxi(1, roundi(atk * Pets.power_of(pet_id))), global_position))
	tw.tween_property(self, ^"global_position", start, 0.2).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.tween_callback(func() -> void: busy = false)
