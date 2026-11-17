extends Node2D
## 굶주린 별의 습격: 별 맵에서 갑자기 운석이 떨어진다(빨간 원으로 먼저 알려 줌). 뒤로 갈수록(menace) 자주·여러 개·세게.
## 한자리에 오래 서 있으면 별이 그 자리를 노려 큰 운석을 떨어뜨린다 — 가만히 있으면 치명상. 구르기(대시)로 피할 수 있다.
## build_world가 별 맵(마을·신전 빼고)에 붙인다.

const STILL_TIME := 2.6  # 이만큼 거의 안 움직이면 노림 운석
const STILL_DIST := 26.0

@export var menace := 0.0  # 0 잔잔 ~ 1 별의 심장 근처
@export var heaven := false  # 천계: "심판의 빛"(금빛)

var _next := 5.0
var _strikes: Array[Dictionary] = []  # {pos, r, t, warn, dmg, big, done}
var _still_t := 0.0
var _still_at := Vector2.ZERO
var _t := 0.0
var _warned := false  # "별이 노린다" 알림은 맵마다 한 번


func _ready() -> void:
	z_index = 40
	_next = randf_range(4.0, 7.0)


func _player() -> Player:
	return get_tree().get_first_node_in_group(&"player") as Player


func _physics_process(delta: float) -> void:
	_t += delta
	var p := _player()
	if p and p.hp > 0:
		# 한자리에 서 있기 감시
		if p.global_position.distance_to(_still_at) > STILL_DIST:
			_still_at = p.global_position
			_still_t = 0.0
		else:
			_still_t += delta
			if _still_t > lerpf(STILL_TIME + 1.0, STILL_TIME - 0.6, menace):
				_still_t = 0.0
				_add(p.global_position, 64.0 + 26.0 * menace, true)
				if not _warned:
					_warned = true
					Events.notice.emit("심판의 빛!" if heaven else "별이 노린다!", "한자리에 서 있으면 위험해요 · 움직이거나 구르세요")
		# 무작위 습격(뒤로 갈수록 자주·여러 개)
		_next -= delta
		if _next <= 0.0:
			_next = lerpf(8.5, 3.0, menace) * randf_range(0.75, 1.25)
			var lead: Vector2 = p.velocity * 0.45
			_add(p.global_position + lead, 46.0 + 14.0 * menace, false)
			for i in int(menace * 3.2):
				var off := Vector2.from_angle(randf() * TAU) * randf_range(50.0, 150.0)
				_add(p.global_position + off, randf_range(34.0, 52.0), false, randf_range(0.1, 0.5))
	_update(delta, p)
	queue_redraw()


func _add(at: Vector2, r: float, big: bool, delay := 0.0) -> void:
	var warn := lerpf(1.35, 0.95, menace) + (0.25 if big else 0.0)
	if heaven:  # 천계: 하늘에서 거대한 빛기둥이 내려앉는다(BossMark 빛기둥, 한 노드가 한꺼번에 그림)
		var p := _player()
		var frac := lerpf(0.3, 0.7, menace) * (1.5 if big else 1.0)
		var dmg := roundi((p.max_hp if p else 100) * frac)
		BossMark.drop(get_parent(), at, r * (1.15 if big else 1.0), warn + delay, maxi(1, dmg), Color(1.0, 0.78, 0.3) if not big else Color(1.0, 0.6, 0.2), true, 0.0)
		Game.sfx(&"skill_light", -10.0 if not big else -4.0, 0.05)
		return
	_strikes.append({"pos": at, "r": r, "t": -delay, "warn": warn, "big": big, "done": false})
	Game.sfx(&"alert", -8.0 if not big else -2.0, 0.05)


func _update(delta: float, p: Player) -> void:
	for s: Dictionary in _strikes:
		s["t"] += delta
		if not s["done"] and s["t"] >= s["warn"]:
			s["done"] = true
			Game.sfx(&"boom", -3.0 if s["big"] else -6.0, 0.1)
			Game.add_shake(7.0 if s["big"] else 4.0)
			if s["big"]:
				Game.flash(Color(1.0, 0.3, 0.4, 0.35), 0.15)
			if p and p.hp > 0 and p.global_position.distance_to(s["pos"]) < s["r"] * 0.9:
				var frac := lerpf(0.3, 0.7, menace) * (1.5 if s["big"] else 1.0)  # 큰 노림 운석은 거의 즉사
				p.take_hit(maxi(1, roundi(p.max_hp * frac)), s["pos"], 260.0)
	_strikes = _strikes.filter(func(s: Dictionary) -> bool: return s["t"] < s["warn"] + 0.45)


func _draw() -> void:
	for s: Dictionary in _strikes:
		var t: float = s["t"]
		if t < 0.0:
			continue
		var pos: Vector2 = s["pos"]
		var r: float = s["r"]
		var warn: float = s["warn"]
		var col := Color(1.0, 0.25, 0.4) if not s["big"] else Color(1.0, 0.15, 0.6)
		if heaven:
			col = Color(1.0, 0.78, 0.25) if not s["big"] else Color(1.0, 0.55, 0.15)
		draw_set_transform(pos, 0.0, Vector2(1.0, 0.6))
		if t < warn:
			var k := t / warn
			var blink := 0.6 + 0.4 * sin(_t * (14.0 + 20.0 * k))
			draw_circle(Vector2.ZERO, r, Color(col, 0.12 + 0.1 * k))
			draw_circle(Vector2.ZERO, r * k, Color(col, 0.28))
			draw_arc(Vector2.ZERO, r, 0, TAU, 40, Color(col, 0.9 * blink), 2.5, true)
			if s["big"]:
				draw_arc(Vector2.ZERO, r * 0.55, 0, TAU, 28, Color(1, 1, 1, 0.5 * blink), 1.5, true)
		else:
			var e := (t - warn) / 0.45
			draw_circle(Vector2.ZERO, r * (0.6 + 0.6 * e), Color(1.0, 0.85, 0.6, 0.7 * (1.0 - e)))
			draw_arc(Vector2.ZERO, r * (0.8 + 0.9 * e), 0, TAU, 40, Color(col.lightened(0.3), 1.0 - e), 4.0 * (1.0 - e) + 1.0, true)
		draw_set_transform(Vector2.ZERO)
		# 떨어지는 운석(예고 마지막 0.45초): 오른쪽 위에서 비스듬히
		var fall := 0.45
		if t > warn - fall and t < warn:
			var f := (t - (warn - fall)) / fall
			var from := pos + Vector2(170, -320)
			var head := from.lerp(pos, f * f)
			var size := (9.0 if not s["big"] else 15.0)
			draw_line(head, head + (from - pos).normalized() * 60.0, Color(1.0, 0.55, 0.85, 0.55), size * 0.9)
			draw_line(head, head + (from - pos).normalized() * 30.0, Color(1.0, 0.9, 1.0, 0.8), size * 0.5)
			draw_circle(head, size, Color(0.35, 0.12, 0.4))
			draw_circle(head, size * 0.7, Color(1.0, 0.45, 0.8))
			draw_circle(head - Vector2(size * 0.2, size * 0.2), size * 0.3, Color(1, 1, 1, 0.9))
