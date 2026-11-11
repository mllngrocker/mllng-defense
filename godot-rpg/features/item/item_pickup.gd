class_name ItemPickup
extends Area2D
## 바닥에 떨어진 가방 아이템(귀환서·물약) 또는 장비(gear_id, 등급색으로 빛난다). 반짝이며 떠 있다가 용사가 닿으면 가방에 들어간다. 오래 두면 사라진다.

const LIFETIME := 25.0

var item_id: StringName
var gear_id: StringName  # 비어 있지 않으면 장비
var _t := 0.0
var _y := -16.0


static func spawn(parent: Node, id: StringName, pos: Vector2) -> void:
	var p := ItemPickup.new()
	p.item_id = id
	p.position = pos
	parent.add_child(p)


static func spawn_gear(parent: Node, id: StringName, pos: Vector2) -> void:
	var p := ItemPickup.new()
	p.gear_id = id
	p.position = pos
	parent.add_child(p)


func _ready() -> void:
	add_to_group(&"pickups")
	collision_layer = 0
	collision_mask = 2
	monitorable = false
	var cs := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 9.0
	cs.shape = shape
	cs.position = Vector2(0, -5)
	add_child(cs)
	body_entered.connect(_on_body_entered)
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	create_tween().tween_property(self, ^"_y", -8.0, 0.4).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


func _process(delta: float) -> void:
	_t += delta
	if _t > LIFETIME:
		queue_free()
		return
	visible = _t < LIFETIME - 3.0 or int(_t * 10.0) % 2 == 0
	queue_redraw()


func _draw() -> void:
	var c := Vector2(0, _y + sin(_t * 3.0) * 1.5)
	draw_circle(Vector2(0, -1), 5.0, Color(0, 0, 0, 0.25))
	if gear_id != &"":
		var gc := Gear.color_of(gear_id)
		draw_circle(c, 10.0 + sin(_t * 4.0) * 1.5, Color(gc, 0.45))  # 등급색 빛
		draw_circle(c, 7.0, Color(gc.darkened(0.5), 0.9))
		draw_arc(c, 7.0, 0, TAU, 16, gc.lightened(0.3), 1.0)
		Gt.icon(self, Gear.SLOT_ICONS[Gear.slot_of(gear_id)], c, 10.0)
		return
	draw_circle(c, 8.5 + sin(_t * 4.0), Color(1, 0.95, 0.6, 0.35))  # 반짝이는 빛
	Gt.icon(self, Items.icon_of(item_id), c, 13.0)


func _on_body_entered(body: Node2D) -> void:
	if body is Player and body.hp > 0 and gear_id != &"":
		var res := Save.give_gear(gear_id)
		Game.sfx(&"charged" if Gear.grade_of(gear_id) >= 3 else &"pickup", -3.0, 0.0)
		var tail := {"new": "", "up": " 재련 +%d" % Save.gear_refine(gear_id), "max": " → 골드"}
		_float_text(body, "[%s] %s%s" % [Gear.GRADE_NAMES[Gear.grade_of(gear_id)], Gear.name_of(gear_id), tail[res]], Gear.color_of(gear_id).lightened(0.35))
		if Gear.grade_of(gear_id) >= 3:
			Events.notice.emit("%s 장비 획득!" % Gear.GRADE_NAMES[Gear.grade_of(gear_id)], "%s · 로비 아바타의 장비 칸에서 장착하세요" % Gear.name_of(gear_id))
		queue_free()
	elif body is Player and body.hp > 0:
		Save.give_item(item_id, 1)
		Game.sfx(&"pickup", -3.0, 0.0)
		_float_text(body, "%s +1" % Items.name_of(item_id))
		queue_free()


## 용사 머리 위로 떠오르는 작은 글씨
func _float_text(body: Node2D, text: String, color := Color("fff3a0")) -> void:
	var l := Label.new()
	l.text = text
	l.add_theme_font_override(&"font", Gt.BOLD)
	l.add_theme_font_size_override(&"font_size", 9)
	l.add_theme_color_override(&"font_color", color)
	l.add_theme_color_override(&"font_outline_color", Gt.INK)
	l.add_theme_constant_override(&"outline_size", 3)
	l.z_index = 50
	body.get_parent().add_child(l)
	l.position = body.global_position + Vector2(-60, -34)
	l.size = Vector2(120, 12)
	l.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var tw := l.create_tween()
	tw.tween_property(l, ^"position:y", l.position.y - 14.0, 0.9)
	tw.parallel().tween_property(l, ^"modulate:a", 0.0, 0.9).set_delay(0.4)
	tw.tween_callback(l.queue_free)
