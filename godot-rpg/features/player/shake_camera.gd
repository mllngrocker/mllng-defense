extends Camera2D
## 용사를 따라가며, Game.shake 세기만큼 화면을 흔든다.


func _process(delta: float) -> void:
	if Game.shake > 0.05:
		offset = Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0)) * Game.shake
		Game.shake = move_toward(Game.shake, 0.0, 40.0 * delta)
	else:
		Game.shake = 0.0
		offset = Vector2.ZERO
