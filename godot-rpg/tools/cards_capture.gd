extends Control
## 캐릭터 카드 11장을 한 화면에 그린다(얼굴 위치·화질 확인용).

func _ready() -> void:
	Save.persist = false
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	for id in Save.ROSTER:
		Save.owned[String(id)] = {"level": 1, "stars": 0, "shards": 0}


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color("2b2233"))
	for i in Save.ROSTER.size():
		var r := Rect2(Vector2(10 + (i % 4) * 132, 10 + (i / 4) * 170), Vector2(122, 160))
		Gt.char_card(self, Save.character(Save.ROSTER[i]), r, true, true)
		draw_line(Vector2(r.get_center().x, r.position.y), Vector2(r.get_center().x, r.end.y), Color(1, 0, 0, 0.5), 1.0)
