class_name DungeonResult
extends Control
## 일일 던전 결과 창: 처치 수와 받은 보상 → "로비로".

var info: Dictionary = {}


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_index = 90
	get_tree().paused = true
	var b := GameButton.new()
	b.label = "로비로"
	b.kind = Gt.Kind.YELLOW
	b.font_size = 22
	b.process_mode = Node.PROCESS_MODE_ALWAYS
	b.set_anchors_preset(Control.PRESET_CENTER)
	b.offset_left = -110
	b.offset_right = 110
	b.offset_top = 140
	b.offset_bottom = 204
	b.pressed.connect(func() -> void:
		get_tree().paused = false
		Game.dungeon = ""
		get_tree().change_scene_to_file("res://features/menu/main_menu.tscn"))
	add_child(b)


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.65))
	var r := Rect2(size / 2.0 - Vector2(230, 220), Vector2(460, 440))
	Gt.panel(self, r)
	var k: Array = DungeonDirector.KINDS[info["kind"]]
	Gt.header(self, r.position + Vector2(20, 46), k[0], "RESULT", 22)
	Gt.text(self, Vector2(r.get_center().x, r.position.y + 104), "시간 종료!" if info["cleared"] else "쓰러졌어요…", 20, Gt.NAVY, 1)
	Gt.text(self, Vector2(r.get_center().x, r.position.y + 140), "처치 %d마리" % int(info["kills"]), 26, Gt.PINK, 1)
	var y := r.position.y + 176.0
	var rows: Array = [[&"coin", "골드", "+%d" % int(info["gold"])]]
	if info["kind"] == "gear":
		rows.append([&"slot_armor", "장비", "%d개" % (info["gear"] as Array).size()])
	if info["kind"] == "book":
		rows.append([&"book", "트레이닝 북", "+%d" % int(info["books"])])
		rows.append([&"book", "마스터 북", "+%d" % int(info["master"])])
	for row: Array in rows:
		var rr := Rect2(Vector2(r.position.x + 30, y), Vector2(r.size.x - 60, 40))
		Gt.pbox(self, rr, Gt.CREAM, Gt.INK, 2, false, true)
		Gt.icon(self, row[0], rr.position + Vector2(24, 20), 26)
		Gt.text(self, rr.position + Vector2(48, 27), row[1], 16, Gt.NAVY)
		Gt.text(self, Vector2(rr.end.x - 14, rr.position.y + 27), row[2], 18, Gt.NAVY, 2)
		y += 46.0
