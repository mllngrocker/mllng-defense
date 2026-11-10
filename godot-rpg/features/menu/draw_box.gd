class_name DrawBox
extends Control
## _draw를 바깥 함수에 맡기는 작은 칸. painter: func(ci: Control)

var painter: Callable


func _draw() -> void:
	if painter.is_valid():
		painter.call(self)
