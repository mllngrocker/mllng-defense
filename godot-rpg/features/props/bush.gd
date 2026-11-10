extends StaticBody2D
## 칼로 벨 수 있는 덤불. 베면 잎사귀가 튀고 가끔 하트가 나온다.

const LEAF := preload("res://assets/ninja/fx/leaf.png")
const HEART_PICKUP := preload("res://features/pickup/heart_pickup.tscn")
const DROP_CHANCE := 0.15


func take_hit(_amount: int, _from: Vector2, _knock := 0.0, _crit := false) -> void:
	var parent := get_parent()
	Fx.leaves(parent, LEAF, global_position + Vector2(0, -6))
	Game.sfx(&"bush", -6.0)
	if randf() < DROP_CHANCE:
		var heart := HEART_PICKUP.instantiate() as Node2D
		heart.position = position
		parent.add_child.call_deferred(heart)
	queue_free()
