class_name Npc
extends StaticBody2D
## 마을 사람: 제자리에 서 있다가 용사가 가까이 오면 그쪽을 보고 말풍선으로 이야기한다(몇 초마다 다음 말).
## 멀리 있을 땐 머리 위에 작은 "…" 말풍선만 보인다.

const TALK_RANGE := 56.0
const LINE_TIME := 3.2

@export var display_name := ""
@export var sheet: Texture2D
@export var lines: PackedStringArray = []

var sprite: Sprite2D
var near := false
var big := false  # 사람 모양 큰 그림(말풍선을 더 위에)
var line_i := 0
var talk_t := 0.0
var _t := 0.0


func _ready() -> void:
	add_to_group(&"npcs")
	collision_layer = 1
	collision_mask = 0
	sprite = Sprite2D.new()
	sprite.texture = sheet
	# 시트마다 줄 수가 다르다(16px 칸, 가로 4방향)
	sprite.hframes = 4
	sprite.vframes = maxi(1, sheet.get_height() / 16) if sheet else 1
	sprite.offset = Vector2(0, -8)
	if sheet and sheet.get_width() > 64:
		# 사람 모양 주민(칸 32×44, 2줄: 서 있기·걸음): 발끝이 자리에 오게
		big = true
		sprite.vframes = 2
		sprite.offset = Vector2(0, -sheet.get_height() / 4.0 + 3.0)
		sprite.scale = Vector2.ONE * 0.72  # 주인공 캐릭터와 비슷한 키로
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
		# 이 사람에게 말 거는 메인 퀘스트면 바로 대화창을 연다(이야기 장면이 있으면 그것, 없으면 이 사람의 대사)
		var q := Quests.current()
		if not q.is_empty() and q["type"] == "talk" and q["target"] == display_name:
			talk()
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
	# 휴대폰 렉 줄이기: 화면 밖(멀리)이면 다시 그리지 않고, 가까워도 3프레임에 한 번
	if near != was:
		queue_redraw()
	elif p != null and p.global_position.distance_squared_to(global_position) < 420.0 * 420.0 \
			and (Engine.get_process_frames() + get_instance_id()) % 3 == 0:
		queue_redraw()


## 대화창으로 이야기한다(공격 버튼을 가까이서 누르거나, 말 거는 퀘스트의 대상일 때)
func talk() -> void:
	var q := Quests.current()
	if not q.is_empty() and q["type"] == "talk" and q["target"] == display_name:
		if StoryBox.play(self, "quest_" + String(q["title"])):
			return
	var talk_lines: Array = []
	for l in lines:
		talk_lines.append([display_name, l])
	StoryBox.show_lines(self, talk_lines)
	Quests.track("talk", display_name)


func _draw() -> void:
	draw_set_transform(Vector2(0, -36 if big else -26), 0.0, Vector2.ONE * 0.5)
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
