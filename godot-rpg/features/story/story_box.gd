class_name StoryBox
extends Control
## 이야기 장면 창(화면 아래 대화 상자): 누를 때마다 다음 줄, 다 보면 닫힌다. 보는 동안 게임이 멈춘다.
## StoryBox.play(장소 노드, "enter_village") — 처음 한 번만 보여 준다(본 장면은 Save.quest["story"]).

signal finished

var lines: Array = []
var i := 0
var shown := 0.0  # 글자가 하나씩 나타난다
var t := 0.0


## 아직 안 본 장면이면 띄운다. host 아래 HUD(CanvasLayer)에 붙인다.
static func play(host: Node, key: String) -> bool:
	if not Save.persist:
		return false  # 테스트·확인용 실행에선 안 띄운다
	if not StoryData.SCENES.has(key) or host == null or not host.is_inside_tree():
		return false
	var seen: Array = Save.quest.get("story", [])
	if key in seen:
		return false
	if host.get_tree().paused:
		return false
	seen.append(key)
	Save.quest["story"] = seen
	Save.save_game()
	var box := StoryBox.new()
	box.lines = StoryData.SCENES[key]
	var hud := host.get_tree().get_first_node_in_group(&"hud")
	(hud if hud else host.get_tree().current_scene).add_child(box)
	return true


## 대사 묶음을 바로 띄운다(본 적 있어도). 마을 사람에게 말 걸 때 쓴다. lines: [[이름, 말], …]
static func show_lines(host: Node, talk: Array) -> bool:
	if talk.is_empty() or host == null or not host.is_inside_tree() or host.get_tree().paused:
		return false
	var box := StoryBox.new()
	box.lines = talk
	var hud := host.get_tree().get_first_node_in_group(&"hud")
	(hud if hud else host.get_tree().current_scene).add_child(box)
	return true


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_index = 70
	get_tree().paused = true


func _process(delta: float) -> void:
	t += delta
	shown += delta * 40.0
	queue_redraw()


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		_next()


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"attack") or e.is_action_pressed(&"ui_accept"):
		get_viewport().set_input_as_handled()
		_next()


func _next() -> void:
	var text: String = lines[i][1]
	if shown < text.length():
		shown = text.length()  # 먼저 누르면 줄을 다 보여 준다
		return
	i += 1
	shown = 0.0
	if i >= lines.size():
		get_tree().paused = false
		finished.emit()
		queue_free()


func _speaker(s: String) -> String:
	return Save.character(Save.selected).display_name if s == "나" else s


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.35))
	if i >= lines.size():
		return
	var who := _speaker(lines[i][0])
	var text: String = lines[i][1]
	var r := Rect2(Vector2(16, size.y - 250), Vector2(size.x - 32, 150))
	Gt.panel(self, r)
	if who != "":
		var tw := Gt.width(who, 18) + 30
		var tag := Rect2(r.position + Vector2(16, -18), Vector2(tw, 34))
		Gt.tag(self, tag, Gt.PINK if lines[i][0] == "나" else Gt.NAVY)
		Gt.text(self, Vector2(tag.get_center().x, tag.position.y + 24), who, 18, Color.WHITE, 1)
	# 줄 바꿈: 상자 너비에 맞춰 글자 단위로 자른다
	var visible_text := text.substr(0, int(shown))
	var y := r.position.y + 50
	var line := ""
	for ch in visible_text:
		if Gt.width(line + ch, 18) > r.size.x - 50:
			Gt.text(self, Vector2(r.position.x + 24, y), line, 18, Gt.NAVY, 0, false)
			y += 28
			line = ""
		line += ch
	Gt.text(self, Vector2(r.position.x + 24, y), line, 18, Gt.NAVY, 0, false)
	if shown >= text.length():
		var bob := sin(t * 6.0) * 3.0
		Gt.text(self, Vector2(r.end.x - 20, r.end.y - 14 + bob), "▼", 14, Gt.PINK, 2)
	Gt.text(self, Vector2(r.get_center().x, r.end.y + 26), "화면을 누르면 다음으로", 12, Color.WHITE, 1, true, 3, Gt.INK)
