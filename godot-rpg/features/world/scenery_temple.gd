extends Node2D
## 잊혀진 나루터: 바위섬 돌 아치 문(Ninja 타일) 안쪽에 일렁이는 푸른 봉인 빛과 올라오는 거품.

@export var arch := Vector2.ZERO  # 아치 안쪽 가운데(월드 좌표)

var t := 0.0


func _ready() -> void:
	z_index = 2


func _process(delta: float) -> void:
	t += delta
	if Engine.get_process_frames() % 2 == 0:
		queue_redraw()  # 휴대폰 렉 줄이기


func _draw() -> void:
	var pulse := 0.5 + 0.5 * sin(t * 2.4)
	draw_circle(arch, 9.0 + pulse, Color(0.45, 0.95, 1.0, 0.35 + 0.15 * pulse))
	for i in 3:
		var a0 := -t * (2.2 - i * 0.5) + i * 2.1
		draw_arc(arch, 3.0 + i * 2.5, a0, a0 + 3.8, 10, Color(0.9, 1.0, 1.0, 0.8 - i * 0.2), 1.0)
	for i in 6:
		var s := float(i) * 1.7
		var life := fmod(t * 0.45 + s * 0.31, 1.0)
		var p := arch + Vector2(sin(s * 3.0) * 7.0, 8.0 - life * 22.0)
		draw_rect(Rect2(p, Vector2.ONE), Color(0.8, 1.0, 1.0, 1.0 - life))
