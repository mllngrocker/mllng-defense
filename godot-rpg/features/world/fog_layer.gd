extends CanvasLayer
## 흘러가는 안개(안개 군도는 흰 안개, 검은 정원은 검붉은 포자)(HUD 아래, 맵 위). 맵을 만들 때 build_world가 붙인다.

@export var tint := Color(0.86, 0.9, 1.0)


func _ready() -> void:
	layer = 0
	follow_viewport_enabled = false
	var r := ColorRect.new()
	r.set_anchors_preset(Control.PRESET_FULL_RECT)
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var m := ShaderMaterial.new()
	m.shader = preload("res://shared/fog.gdshader")
	m.set_shader_parameter(&"fog_color", tint)
	if tint.v < 0.5:
		m.set_shader_parameter(&"strength", 0.42)  # 어두운 포자는 조금 옅게
	r.material = m
	add_child(r)
