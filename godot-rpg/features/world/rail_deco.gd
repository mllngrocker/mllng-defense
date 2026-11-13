extends Node2D
## 하늘섬 가장자리 난간(구름 마을·하늘섬): 흰 기둥 + 금빛 손잡이. 섬 밖(하늘)으로 떨어지지 않게 막아 주는 느낌.
## build_world가 가장자리 칸 목록을 넣는다. edges = [x, y, 방향(0 위 · 1 오른쪽 · 2 아래 · 3 왼쪽), ...] (그 방향이 하늘)

const T := 16
@export var edges := PackedInt32Array()


func _ready() -> void:
	z_index = 1
	queue_redraw()


func _draw() -> void:
	var post := Color("f4efe6")
	var shade := Color("b9b0c8")
	var gold := Color("ffd46b")
	var ink := Color("3a3150")
	for i in range(0, edges.size(), 3):
		var c := Vector2(edges[i], edges[i + 1]) * T
		var d := edges[i + 2]
		var a: Vector2
		var b: Vector2
		match d:
			0:
				a = c + Vector2(0, 2)
				b = c + Vector2(T, 2)
			2:
				a = c + Vector2(0, T - 3)
				b = c + Vector2(T, T - 3)
			1:
				a = c + Vector2(T - 3, 0)
				b = c + Vector2(T - 3, T)
			_:
				a = c + Vector2(3, 0)
				b = c + Vector2(3, T)
		var up := Vector2(0, -7)
		# 아래 가로대 + 위 손잡이(테두리 먼저)
		draw_line(a + up * 0.4, b + up * 0.4, ink, 4.0)
		draw_line(a + up * 0.4, b + up * 0.4, shade, 2.0)
		draw_line(a + up, b + up, ink, 5.0)
		draw_line(a + up, b + up, gold, 3.0)
		# 기둥(칸 양끝)
		for p: Vector2 in [a, b]:
			draw_rect(Rect2(p + Vector2(-2.5, -10), Vector2(5, 11)), ink)
			draw_rect(Rect2(p + Vector2(-1.5, -9), Vector2(3, 9)), post)
			draw_circle(p + Vector2(0, -10), 2.2, gold)
