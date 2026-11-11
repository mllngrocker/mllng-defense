extends Area2D
## 바닥에 떨어진 하트. 용사가 닿으면 체력을 채워 주고 사라진다. 오래 두면 깜빡이다 없어진다.

const LIFETIME := 12.0
const HEAL_RATIO := 0.25  # 최대 체력의 25% 회복

var _t := 0.0

@onready var sprite: Sprite2D = $Sprite


func _ready() -> void:
	add_to_group(&"pickups")
	add_to_group(&"hearts")
	body_entered.connect(_on_body_entered)
	# 튀어나오는 느낌
	sprite.position.y = -14.0
	create_tween().tween_property(sprite, ^"position:y", -6.0, 0.35).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


func _process(delta: float) -> void:
	_t += delta
	if _t > LIFETIME:
		queue_free()
	elif _t > LIFETIME - 3.0:
		sprite.visible = int(_t * 10.0) % 2 == 0


func _on_body_entered(body: Node2D) -> void:
	if body is Player and body.hp > 0:
		body.heal(ceili(body.max_hp * HEAL_RATIO))
		Game.sfx(&"pickup", -3.0, 0.0)
		queue_free()
