class_name Pet
extends Node2D
## 데리고 다니는 펫: 용사 뒤를 졸졸 따라오다가, 가까이 몬스터가 있으면 달려가 물고 돌아온다.

const FOLLOW := Vector2(-18, 6)
const RANGE := 110.0
const COOLDOWN := 1.3

var pet_id: StringName
var sprite: Sprite2D
var glow: Sprite2D  # 급 3부터: 뒤에서 빛나는 테두리(같은 그림을 크게, 더하기 빛)
var tier := 1
var col := Color.WHITE
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
	tier = Pets.tier(pet_id)
	col = Pets.tier_color(pet_id)
	sprite.offset = Vector2(0, -7)
	sprite.scale = Vector2.ONE * [0.8, 0.95, 1.12, 1.35][tier - 1]  # 강한 펫일수록 크게
	if tier >= 3:
		glow = Sprite2D.new()
		glow.texture = sprite.texture
		glow.hframes = f.x
		glow.vframes = f.y
		glow.offset = sprite.offset
		glow.scale = sprite.scale * 1.18
		glow.modulate = Color(col, 0.55)
		var m := CanvasItemMaterial.new()
		m.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		glow.material = m
		add_child(glow)
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
	if tier >= 2:
		queue_redraw()


## 발밑 오라: 급 2 은은한 빛 · 급 3 도는 별빛 · 급 4 타오르는 불꽃 알갱이 + 두 겹 고리
func _draw() -> void:
	if tier < 2:
		return
	var pulse := 0.5 + 0.5 * sin(_t * 4.0)
	var r := 9.0 + tier * 2.5
	draw_set_transform(Vector2(0, 1), 0.0, Vector2(1.0, 0.45))
	draw_circle(Vector2.ZERO, r * 1.2, Color(col, 0.12 + 0.08 * pulse))
	draw_arc(Vector2.ZERO, r, 0, TAU, 28, Color(col.lightened(0.2), 0.45 + 0.3 * pulse), 1.5, true)
	if tier >= 4:
		draw_arc(Vector2.ZERO, r * 1.35, 0, TAU, 32, Color(col, 0.35 + 0.25 * pulse), 1.0, true)
	draw_set_transform(Vector2.ZERO)
	if tier >= 3:
		for i in 3:
			var a := _t * 2.6 + i * TAU / 3.0
			var q := Vector2(cos(a) * r * 1.1, sin(a) * r * 0.45 - 8.0)
			draw_circle(q, 1.6, Color(1, 1, 1, 0.9))
			draw_circle(q, 3.0, Color(col, 0.35))
	if tier >= 4:
		for i in 6:
			var ph := fmod(_t * 0.9 + i / 6.0, 1.0)
			var x := sin(i * 2.1 + _t * 1.5) * r * 0.8
			draw_circle(Vector2(x, -ph * 26.0), 2.2 * (1.0 - ph) + 0.4, Color(col.lightened(0.3 * (1.0 - ph)), 1.0 - ph))


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
	if glow:
		glow.frame = sprite.frame
		glow.flip_h = sprite.flip_h
		glow.modulate.a = 0.4 + 0.25 * sin(_t * 5.0)


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
	cd = COOLDOWN * [1.0, 0.88, 0.72, 0.58][tier - 1]
	var start := global_position
	var hit := best.global_position + (start - best.global_position).normalized() * 8.0
	var tw := create_tween()
	tw.tween_property(self, ^"global_position", hit, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
	tw.tween_callback(func() -> void:
		if is_instance_valid(best) and best.has_method(&"take_hit"):
			var atk: int = player.get(&"atk") if player.get(&"atk") != null else 10
			var dmg := maxi(1, roundi(atk * Pets.power_of(pet_id)))
			best.call(&"take_hit", dmg, global_position)
			if tier >= 3:
				var fx := Fx.spawn(get_parent(), preload("res://assets/ninja/fx/explosion.png"), 9, best.global_position + Vector2(0, -8), 22.0)
				fx.modulate = col.lightened(0.2)
				fx.scale = Vector2.ONE * (0.7 if tier == 3 else 1.1)
			if tier >= 4:  # 전설 펫: 주변 몬스터까지 휩쓴다
				Game.add_shake(2.0)
				for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
					if e != best and is_instance_valid(e) and e.global_position.distance_to(best.global_position) < 52.0 and e.has_method(&"take_hit"):
						e.call(&"take_hit", maxi(1, roundi(dmg * 0.6)), best.global_position))
	tw.tween_property(self, ^"global_position", start, 0.2).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	tw.tween_callback(func() -> void: busy = false)
