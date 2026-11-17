class_name BossWave
extends Node2D
## 보스 검기 파동: 검을 휘두르면 초승달 모양 빛 파동이 맵 끝까지 날아간다. 파동에 닿으면 피해(구르기로 통과).
## 탄처럼 맵마다 이 노드 하나가 모든 파동을 배열로 움직이고 한 번에 그린다(렉 없게).

const LIFE := 3.2
const HALF_W := 46.0  # 초승달 반폭
const MAX_WAVES := 80

var _pos := PackedVector2Array()
var _dir := PackedVector2Array()
var _spd := PackedFloat32Array()
var _t := PackedFloat32Array()
var _dmg := PackedInt32Array()
var _hit := PackedByteArray()
var _col := Color.WHITE
var _had := false


static func _field(parent: Node) -> BossWave:
	var f := parent.get_node_or_null(^"BossWaves") as BossWave
	if f == null:
		f = BossWave.new()
		f.name = "BossWaves"
		parent.add_child(f)
	return f


static func fire(parent: Node, pos: Vector2, dir: Vector2, dmg: int, col: Color, speed := 260.0) -> void:
	var f := _field(parent)
	if f._pos.size() >= MAX_WAVES:
		return
	f._col = col
	f._pos.append(pos)
	f._dir.append(dir.normalized())
	f._spd.append(speed)
	f._t.append(0.0)
	f._dmg.append(dmg)
	f._hit.append(0)


func _ready() -> void:
	z_index = 6


func _physics_process(delta: float) -> void:
	if _pos.is_empty():
		if _had:
			_had = false
			queue_redraw()
		return
	_had = true
	var p := get_tree().get_first_node_in_group(&"player") as Player
	var i := 0
	while i < _pos.size():
		_pos[i] += _dir[i] * _spd[i] * delta
		_t[i] += delta
		if _hit[i] == 0 and p and p.hp > 0:
			var rel := p.global_position - _pos[i]
			if absf(rel.dot(_dir[i])) < 12.0 and absf(rel.cross(_dir[i])) < HALF_W:
				_hit[i] = 1
				p.take_hit(_dmg[i], _pos[i], 260.0)
		if _t[i] > LIFE:
			var last := _pos.size() - 1
			_pos[i] = _pos[last]; _dir[i] = _dir[last]; _spd[i] = _spd[last]; _t[i] = _t[last]; _dmg[i] = _dmg[last]; _hit[i] = _hit[last]
			_pos.resize(last); _dir.resize(last); _spd.resize(last); _t.resize(last); _dmg.resize(last); _hit.resize(last)
		else:
			i += 1
	queue_redraw()


func _draw() -> void:
	draw_set_transform_matrix(get_global_transform().affine_inverse())
	for i in _pos.size():
		var fade := clampf((LIFE - _t[i]) / 0.5, 0.0, 1.0) * clampf(_t[i] / 0.08, 0.0, 1.0)
		var a := _dir[i].angle()
		var c := _pos[i] - _dir[i] * 30.0  # 초승달 중심(파동 뒤쪽)
		draw_arc(c, 34.0, a - 1.0, a + 1.0, 18, Color(_col, 0.35 * fade), 16.0)
		draw_arc(c, 34.0, a - 0.95, a + 0.95, 18, Color(_col.lightened(0.4), 0.95 * fade), 6.0)
		draw_arc(c, 36.0, a - 0.8, a + 0.8, 14, Color(1, 1, 1, fade), 2.0)
