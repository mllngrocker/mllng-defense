class_name Portal
extends Area2D
## 맵 가장자리의 이동문: 용사가 들어오면 다른 맵(target_scene)의 도착 지점(target_spawn)으로 옮긴다.
## 빛 기둥 + 화살표 + 행선지 표지판을 직접 그린다.

@export_file("*.tscn") var target_scene := ""
@export var target_spawn := ""
@export var label := ""
## 화살표 방향(1 오른쪽, -1 왼쪽, 0 위, 2 아래)
@export var side := 1
## 이 보스를 물리치기 전에는 막혀 있다(빈 값이면 늘 열림)
@export var requires_boss := ""
## 막혔을 때 알림에 쓰는 보스 이름
@export var boss_title := ""
## 그림 없이 길만 막는 자리(해저 신전 물살·설산 눈사태처럼 배경 그림이 이미 막힌 걸 보여 줄 때)
@export var invisible := false
## 막혔을 때 알림 문구(비우면 기본 문구)
@export var locked_title := ""
@export var locked_sub := ""

var _t := 0.0
var _used := false


func _ready() -> void:
	collision_layer = 0
	collision_mask = 2  # 용사
	monitorable = false
	z_index = 3
	body_entered.connect(_on_body_entered)


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


## 길이 열렸는지: 막는 보스를 물리쳤고, 갈 곳(다음 지역)이 이미 만들어져 있어야 한다
func is_open() -> bool:
	return Quests.boss_defeated(requires_boss) and ResourceLoader.exists(target_scene)


func _on_body_entered(body: Node2D) -> void:
	if _used or not body is Player:
		return
	if not is_open():
		# 막힌 길: 뒤로 밀어내고 알린다
		(body as Player).knockback = Vector2(-side * 320.0, 0) if absi(side) == 1 else Vector2(0, 320.0 if side == 0 else -320.0)
		Game.sfx(&"hurt", -6.0)
		Game.add_shake(3.0)
		if locked_title != "" and not Quests.boss_defeated(requires_boss):
			Events.notice.emit(locked_title, locked_sub)
		elif not Quests.boss_defeated(requires_boss):
			Events.notice.emit("길이 막혀 있어요", "%s을(를) 먼저 물리쳐야 해요" % boss_title)
		else:
			Events.notice.emit("아직 갈 수 없어요", "다음 챕터에서 열리는 지역이에요")
		return
	_used = true
	Game.go_to(target_scene, target_spawn)


func _draw() -> void:
	if invisible:
		return
	if not is_open():
		_draw_locked()
		return
	# 빛 기둥(위로 갈수록 옅게)
	var h := 64.0
	for i in 8:
		var a := (1.0 - i / 8.0) * (0.22 + 0.06 * sin(_t * 3.0))
		draw_rect(Rect2(-10, -h * (i + 1) / 8.0 + 8.0, 20, h / 8.0), Color(1.0, 0.95, 0.6, a))
	# 바닥 빛 고리
	draw_set_transform(Vector2(0, 6), 0.0, Vector2(1.0, 0.4))
	draw_arc(Vector2.ZERO, 14.0 + sin(_t * 4.0) * 2.0, 0, TAU, 24, Color(1, 0.95, 0.6, 0.8), 2.0)
	draw_set_transform(Vector2.ZERO)
	# 통통 튀는 화살표(side 0이면 위쪽)
	var bob := sin(_t * 5.0) * 3.0
	var dir := Vector2(side, 0) if absi(side) == 1 else (Vector2.UP if side == 0 else Vector2.DOWN)
	var tip := Vector2(0, -18) + dir * (12.0 + bob) if absi(side) == 1 else (Vector2(0, -34 - bob) if side == 0 else Vector2(0, -8 + bob))
	var back := tip - dir * 9.0
	var n := dir.orthogonal()
	draw_colored_polygon(PackedVector2Array([tip + dir, back + n * 7, back - n * 7]), Gt.INK)
	draw_colored_polygon(PackedVector2Array([tip, back + n * 5 + dir, back - n * 5 + dir]), Color("ffe36b"))
	# 표지판(글씨는 반 크기로 그려 카메라 2배에서 또렷하게)
	if label != "":
		draw_set_transform(Vector2(0, -44), 0.0, Vector2.ONE * 0.5)
		var w := Gt.width(label, 22) + 26
		var r := Rect2(-w / 2.0, -20, w, 34)
		Gt.pbox(self, r, Gt.NAVY)
		Gt.title(self, Vector2(0, 5), label, 22, Color.WHITE, 1)
		draw_set_transform(Vector2.ZERO)


## 막힌 문: 붉은 빛 장벽 + 자물쇠 + "잠김" 표지판
func _draw_locked() -> void:
	var a := 0.5 + 0.2 * sin(_t * 3.0)
	for i in 3:
		var x := -10.0 + i * 10.0
		draw_rect(Rect2(x - 1.5, -40, 3, 48), Color(1, 0.25, 0.3, a))
	draw_rect(Rect2(-14, -42, 28, 3), Color(1, 0.4, 0.4, a))
	draw_rect(Rect2(-14, 6, 28, 3), Color(1, 0.4, 0.4, a))
	draw_set_transform(Vector2(0, -16), 0.0, Vector2.ONE * 0.5)
	Gt.lock(self, Vector2.ZERO, 30, Color("ffd54f"))
	draw_set_transform(Vector2(0, -56), 0.0, Vector2.ONE * 0.5)
	var text := label.trim_suffix(" ▶").trim_prefix("◀ ") + " (잠김)"
	var w := Gt.width(text, 22) + 26
	Gt.pbox(self, Rect2(-w / 2.0, -20, w, 34), Color("8a2b3a"))
	Gt.title(self, Vector2(0, 5), text, 22, Color.WHITE, 1)
	draw_set_transform(Vector2.ZERO)
