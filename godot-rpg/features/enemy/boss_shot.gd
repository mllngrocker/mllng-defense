class_name BossShot
extends Node2D
## 보스·몬스터가 쏘는 탄(둥근 빛 구슬). 탄 하나하나를 노드로 만들지 않고, 맵마다 이 노드 하나가
## 모든 탄을 배열로 움직이고·맞았는지 보고·한 번에 그린다(탄막을 수백 발 쏴도 렉 없게).

const LIFE := 3.0
const HIT_R := 9.0
const MAX_SHOTS := 600

var _pos := PackedVector2Array()
var _vel := PackedVector2Array()
var _t := PackedFloat32Array()
var _dmg := PackedInt32Array()
var _col := PackedColorArray()
var _clock := 0.0
var _had := false  # 지난 프레임에 탄이 있었나(다 사라진 뒤 한 번 지우기)


static func _field(parent: Node) -> BossShot:
	var f := parent.get_node_or_null(^"BossShots") as BossShot
	if f == null:
		f = BossShot.new()
		f.name = "BossShots"
		parent.add_child(f)
	return f


static func fire(parent: Node, pos: Vector2, v: Vector2, dmg: int, col: Color) -> void:
	var f := _field(parent)
	if f._pos.size() >= MAX_SHOTS:
		return
	f._pos.append(pos)
	f._vel.append(v)
	f._t.append(0.0)
	f._dmg.append(dmg)
	f._col.append(col)


## 지금 날아가는 탄 수(테스트용)
static func count(root: Node) -> int:
	var n := 0
	for f in root.find_children("BossShots", "BossShot", true, false):
		n += (f as BossShot)._pos.size()
	return n


func _ready() -> void:
	z_index = 5


func _physics_process(delta: float) -> void:
	_clock += delta
	if _pos.is_empty():
		if _had:
			_had = false
			queue_redraw()
		return
	_had = true
	var p := get_tree().get_first_node_in_group(&"player") as Player
	var pp := p.global_position if p else Vector2(INF, INF)
	var alive := p != null and p.hp > 0
	var i := 0
	while i < _pos.size():
		_pos[i] += _vel[i] * delta
		_t[i] += delta
		var dead := _t[i] > LIFE
		if not dead and alive and _pos[i].distance_squared_to(pp) < HIT_R * HIT_R:
			p.take_hit(_dmg[i], _pos[i] - _vel[i].normalized() * 8.0, 120.0)
			dead = true
		if dead:
			var last := _pos.size() - 1
			_pos[i] = _pos[last]; _vel[i] = _vel[last]; _t[i] = _t[last]; _dmg[i] = _dmg[last]; _col[i] = _col[last]
			_pos.resize(last); _vel.resize(last); _t.resize(last); _dmg.resize(last); _col.resize(last)
		else:
			i += 1
	queue_redraw()


func _draw() -> void:
	draw_set_transform_matrix(get_global_transform().affine_inverse())  # 탄 자리는 맵 좌표
	var pulse := 1.0 + 0.15 * sin(_clock * 18.0)
	for i in _pos.size():
		var c := _col[i]
		var q := _pos[i]
		draw_circle(q, 8.0 * pulse, Color(c, 0.3), true, -1.0, false)
		draw_circle(q, 5.0, c, true, -1.0, false)
		draw_circle(q + Vector2(-1.5, -1.5), 2.0, Color(1, 1, 1, 0.8), true, -1.0, false)
