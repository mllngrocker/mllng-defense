extends CanvasLayer
## 맵 뒤 배경: 하늘섬·천공의 탑은 구름 바다(위층일수록 어둡고 별), 해저 신전은 바다. build_world가 붙인다.

@export var mode := 0  # 0 하늘, 1 바다
@export var height := 0.0
var _mat: ShaderMaterial


func _ready() -> void:
	layer = -10
	var r := ColorRect.new()
	r.set_anchors_preset(Control.PRESET_FULL_RECT)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_mat = ShaderMaterial.new()
	_mat.shader = preload("res://shared/backdrop.gdshader")
	_mat.set_shader_parameter(&"mode", mode)
	_mat.set_shader_parameter(&"height", height)
	r.material = _mat
	add_child(r)


func _process(_d: float) -> void:
	var cam := get_viewport().get_camera_2d()
	if cam:
		_mat.set_shader_parameter(&"cam", cam.get_screen_center_position())
