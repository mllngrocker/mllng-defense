extends Node2D
## 설산 입구: 동굴(Ninja 타일) 위 나무 표지판에 이름, 동굴 안 희미한 푸른 빛.

@export var cave := Vector2.ZERO  # 동굴 입구 가운데(월드 좌표)
@export var sign_text := "설산"

var t := 0.0


func _ready() -> void:
	z_index = 2


func _process(delta: float) -> void:
	t += delta
	if Engine.get_process_frames() % 2 == 0:
		queue_redraw()  # 휴대폰 렉 줄이기


func _draw() -> void:
	var pulse := 0.5 + 0.5 * sin(t * 1.6)
	draw_circle(cave, 7.0, Color(0.55, 0.8, 1.0, 0.12 + 0.12 * pulse))
	# 표지판 글씨(반 크기로 그려 또렷하게). 표지판은 동굴 그림 위쪽 가운데
	draw_set_transform(cave + Vector2(0, -15), 0.0, Vector2.ONE * 0.5)
	Gt.text(self, Vector2.ZERO, sign_text, 14, Color("fff3d0"), 1, true, 3, Color("5a3418"))
	draw_set_transform(Vector2.ZERO)
