class_name Fx
extends Sprite2D
## 한 번 재생하고 사라지는 그림 효과(연기 등)와 잎사귀 흩날림.

var fps := 14.0
var _t := 0.0


static func spawn(parent: Node, tex: Texture2D, frames: int, pos: Vector2, play_fps := 14.0) -> Fx:
	var fx := Fx.new()
	fx.texture = tex
	fx.hframes = frames
	fx.fps = play_fps
	fx.z_index = 5
	parent.add_child(fx)
	fx.global_position = pos
	return fx


## 덤불을 베었을 때 잎사귀가 사방으로 튄다.
static func leaves(parent: Node, tex: Texture2D, pos: Vector2, count := 7) -> void:
	for i in count:
		var s := Sprite2D.new()
		s.texture = tex
		s.hframes = 6
		s.frame = randi() % 6
		s.z_index = 5
		parent.add_child(s)
		s.global_position = pos + Vector2(randf_range(-4, 4), randf_range(-8, 0))
		var to := s.position + Vector2(randf_range(-20, 20), randf_range(-16, 6))
		var tw := s.create_tween().set_parallel()
		tw.tween_property(s, ^"position", to, 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
		tw.tween_property(s, ^"rotation", randf_range(-3.0, 3.0), 0.45)
		tw.tween_property(s, ^"modulate:a", 0.0, 0.3).set_delay(0.15)
		tw.chain().tween_callback(s.queue_free)


func _process(delta: float) -> void:
	_t += delta * fps
	if int(_t) >= hframes:
		queue_free()
		return
	frame = int(_t)
