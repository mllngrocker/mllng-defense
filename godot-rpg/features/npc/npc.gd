class_name Npc
extends StaticBody2D
## 마을 사람: 제자리에 서 있다가 용사가 가까이 오면 그쪽을 보고 말풍선으로 이야기한다(몇 초마다 다음 말).
## 멀리 있을 땐 머리 위에 작은 "…" 말풍선만 보인다.

const TALK_RANGE := 40.0
const LINE_TIME := 3.2

@export var display_name := ""
@export var sheet: Texture2D
@export var lines: PackedStringArray = []

var sprite: Sprite2D
var near := false
var line_i := 0
var talk_t := 0.0
var _t := 0.0


func _ready() -> void:
	collision_layer = 1
	collision_mask = 0
	sprite = Sprite2D.new()
	sprite.texture = sheet
	# 시트마다 줄 수가 다르다(16px 칸, 가로 4방향)
	sprite.hframes = 4
	sprite.vframes = maxi(1, sheet.get_height() / 16) if sheet else 1
	sprite.offset = Vector2(0, -8)
	add_child(sprite)
	var cs := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 5.0
	cs.shape = shape
	cs.position = Vector2(0, -3)
	add_child(cs)
	_t = randf() * 3.0


func _process(delta: float) -> void:
	_t += delta
	var p := get_tree().get_first_node_in_group(&"player") as Node2D
	var was := near
	near = p != null and p.global_position.distance_to(global_position) < TALK_RANGE
	if near and not was:
		# 이 사람에게 말 거는 메인 퀘스트면 그 퀘스트의 이야기 장면을 먼저 보여 준다
		var q := Quests.current()
		if not q.is_empty() and q["type"] == "talk" and q["target"] == display_name:
			StoryBox.play(self, "quest_" + String(q["title"]))
		Quests.track("talk", display_name)
	if near:
		var v := p.global_position - global_position
		var col := (3 if v.x > 0.0 else 2) if absf(v.x) > absf(v.y) else (0 if v.y > 0.0 else 1)
		sprite.frame = col
		talk_t += delta
		if talk_t > LINE_TIME and lines.size() > 1:
			talk_t = 0.0
			line_i = (line_i + 1) % lines.size()
	else:
		sprite.frame = 0
		# 가만히 있을 때 숨 쉬듯 살짝 움직인다
		sprite.frame = 4 if fmod(_t, 2.4) > 2.1 and sprite.vframes > 1 else 0
		if was:
			talk_t = 0.0
	queue_redraw()


func _draw() -> void:
	draw_set_transform(Vector2(0, -26), 0.0, Vector2.ONE * 0.5)
	var q := Quests.current()
	var wanted: bool = not q.is_empty() and q["type"] == "talk" and q["target"] == display_name and not Quests.main_done()
	if near and not lines.is_empty():
		_bubble(lines[line_i])
	elif wanted:
		# 퀘스트 대상: 통통 튀는 노란 "!"
		var bob := sin(_t * 5.0) * 4.0
		var r := Rect2(-16, -40 + bob, 32, 38)
		Gt.pbox(self, r, Gt.YELLOW, Gt.INK, 2, false, true)
		Gt.title(self, Vector2(0, -10 + bob), "!", 30, Color.WHITE, 1)
	else:
		# 작은 "…" 말풍선
		var bob := sin(_t * 2.0) * 2.0
		var r := Rect2(-18, -24 + bob, 36, 24)
		Gt.pbox(self, r, Color.WHITE, Gt.INK, 1, false, false)
		for i in 3:
			draw_rect(Rect2(-9 + i * 7, -14 + bob, 4, 4), Gt.NAVY)
	draw_set_transform(Vector2.ZERO)


func _bubble(text: String) -> void:
	var fs := 20
	var w := Gt.width(text, fs) + 30
	var r := Rect2(-w / 2.0, -46, w, 44)
	Gt.pbox(self, r, Gt.CREAM)
	# 꼬리
	draw_colored_polygon(PackedVector2Array([Vector2(-8, -4), Vector2(8, -4), Vector2(0, 8)]), Gt.INK)
	draw_colored_polygon(PackedVector2Array([Vector2(-5, -6), Vector2(5, -6), Vector2(0, 3)]), Gt.CREAM)
	Gt.text(self, Vector2(0, -17), text, fs, Gt.NAVY, 1)
	# 이름표
	if display_name != "":
		var nw := Gt.width(display_name, 16) + 18
		var tag := Rect2(r.position + Vector2(10, -16), Vector2(nw, 24))
		Gt.tag(self, tag, Gt.BLUE)
		Gt.text(self, Vector2(tag.get_center().x, tag.position.y + 17), display_name, 16, Color.WHITE, 1)
