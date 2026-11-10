extends Node2D
## 마을을 어슬렁거리는 동물(고양이·닭). 2프레임 그림을 넘기며 집 근처를 천천히 돌아다닌다. 부딪힘 없음.

@export var sheet: Texture2D
@export var roam := 40.0
@export var speed := 14.0

var sprite: Sprite2D
var home: Vector2
var goal: Vector2
var wait_t := 0.0
var anim_t := 0.0


func _ready() -> void:
	home = position
	goal = position
	sprite = Sprite2D.new()
	sprite.texture = sheet
	sprite.hframes = 2
	sprite.offset = Vector2(0, -7)
	add_child(sprite)
	wait_t = randf() * 2.0


func _process(delta: float) -> void:
	anim_t += delta
	if wait_t > 0.0:
		wait_t -= delta
		sprite.frame = int(anim_t * 2.0) % 2
		return
	var v := goal - position
	if v.length() < 2.0:
		wait_t = randf_range(1.0, 3.5)
		goal = home + Vector2.from_angle(randf() * TAU) * randf() * roam
		return
	position += v.normalized() * speed * delta
	sprite.flip_h = v.x < 0.0
	sprite.frame = int(anim_t * 6.0) % 2
