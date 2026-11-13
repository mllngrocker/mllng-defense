class_name DamageNumber
extends Node2D
## 맞은 자리에 떠오르는 피해 숫자. 치명타는 크고 노랗게.

const LIFE := 0.7

var text := ""
var color := Color.WHITE
var big := false
var _t := 0.0
var _vel := Vector2.ZERO


static var alive := 0
const CAP := 50  # 피해 숫자 상한


static func spawn(parent: Node, pos: Vector2, amount: int, crit: bool, fmt := "%d", tint := Color.WHITE) -> void:
	if alive >= CAP and not crit:
		return
	var n := DamageNumber.new()
	n.text = fmt % amount
	n.big = crit
	n.color = Color("ffd54f") if crit else tint
	n.z_index = 20
	n.scale = Vector2.ONE * 0.5  # 글꼴 16을 반으로 → 카메라 2배에서 화면 1:1
	n._vel = Vector2(randf_range(-20, 20), -70.0)
	parent.add_child(n)
	n.global_position = pos + Vector2(randf_range(-4, 4), -14.0)


func _enter_tree() -> void:
	alive += 1


func _exit_tree() -> void:
	alive -= 1


func _process(delta: float) -> void:
	_t += delta
	position += _vel * delta
	_vel.y += 160.0 * delta
	modulate.a = clampf(2.0 - _t / LIFE * 2.0, 0.0, 1.0)
	if _t >= LIFE:
		queue_free()
	queue_redraw()


func _draw() -> void:
	var font := ThemeDB.fallback_font
	var size := 32 if big else 16
	# 처음엔 크게 튀어나왔다가 제자리로
	var pop := 1.0 + maxf(0.0, 0.25 - _t) * 2.0
	draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE * pop)
	var w := font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	draw_string_outline(font, Vector2(-w / 2.0, 0), text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, 6, Color("181425"))
	draw_string(font, Vector2(-w / 2.0, 0), text, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)
