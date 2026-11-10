extends Node2D
## 맵 전체에 천천히 내리는 눈송이(그림만, 부딪힘 없음)

@export var area := Rect2(0, 0, 544, 480)
@export var count := 120

var t := 0.0


func _ready() -> void:
	z_index = 30


func _process(delta: float) -> void:
	t += delta
	queue_redraw()


func _draw() -> void:
	for i in count:
		var s := float(i) * 7.913
		var speed := 14.0 + fmod(s * 3.1, 16.0)
		var y := fmod(fmod(s * 61.0, area.size.y) + t * speed, area.size.y)
		var x := fmod(s * 97.0, area.size.x) + sin(t * 0.8 + s) * 8.0
		var big := i % 4 == 0
		draw_rect(Rect2(area.position + Vector2(x, y), Vector2(2, 2) if big else Vector2(1, 1)), Color(1, 1, 1, 0.85 if big else 0.6))
