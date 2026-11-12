extends Control
## 로비 퀘스트 탭: 위쪽 메인 이야기 카드(진행도·보상·받기 버튼), 아래 일일 퀘스트 목록(받기 버튼)과 모두 받으면 주는 보너스.

signal toast_requested(text: String)

var main_card: DrawBox
var main_button: GameButton
var rows: Dictionary[String, DrawBox] = {}
var row_buttons: Dictionary[String, GameButton] = {}
var bonus_row: DrawBox
var bonus_button: GameButton
var dungeon_box: DrawBox
var ach_dots: Array[DrawBox] = []


func _ready() -> void:
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 12
	col.offset_right = -12
	col.offset_top = 14
	col.offset_bottom = -8
	col.add_theme_constant_override(&"separation", 8)
	add_child(col)

	main_card = _box(_paint_main, 190)
	main_button = _button("보상 받기", Gt.Kind.YELLOW)
	main_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	main_button.offset_left = -170
	main_button.offset_top = -64
	main_button.offset_right = -14
	main_button.offset_bottom = -12
	main_button.pressed.connect(_on_main_claim)
	main_card.add_child(main_button)
	col.add_child(main_card)

	# 업적 · 우편함 버튼(받을 게 있으면 빨간 점)
	var arow := HBoxContainer.new()
	arow.custom_minimum_size.y = 58
	arow.add_theme_constant_override(&"separation", 8)
	for spec: Array in [["업적", "achieve", Gt.Kind.YELLOW], ["우편함", "mail", Gt.Kind.BLUE]]:
		var b := _button(spec[0], spec[2])
		b.font_size = 18
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		var m: String = spec[1]
		b.pressed.connect(func() -> void:
			var w := ListWindow.new()
			w.mode = m
			w.closed.connect(refresh)
			var host: Node = self
			while host.get_parent() is Control:
				host = host.get_parent()
			host.add_child(w))
		var dot := DrawBox.new()
		dot.set_anchors_preset(Control.PRESET_TOP_RIGHT)
		dot.offset_left = -18
		dot.offset_top = 2
		dot.painter = func(ci: Control) -> void:
			var n := Achievements.claimable() if m == "achieve" else Mail.unread()
			if n > 0:
				ci.draw_circle(Vector2(6, 6), 10.0, Gt.INK)
				ci.draw_circle(Vector2(6, 6), 8.0, Color("ff3b4d"))
				Gt.text(ci, Vector2(6, 11), str(n), 11, Color.WHITE, 1)
		b.add_child(dot)
		ach_dots.append(dot)
		arow.add_child(b)
	col.add_child(arow)

	# 일일 던전: 세 던전 중 하나 골라 들어가기(하루 3번)
	dungeon_box = _box(_paint_dungeon, 112)
	var drow := HBoxContainer.new()
	drow.set_anchors_preset(Control.PRESET_FULL_RECT)
	drow.offset_left = 10
	drow.offset_right = -10
	drow.offset_top = 40
	drow.offset_bottom = -10
	drow.add_theme_constant_override(&"separation", 8)
	dungeon_box.add_child(drow)
	for k: String in DungeonDirector.KINDS:
		var b := _button(DungeonDirector.KINDS[k][0], Gt.Kind.PINK if k == "gold" else (Gt.Kind.BLUE if k == "gear" else Gt.Kind.GREEN))
		b.font_size = 15
		b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		b.pressed.connect(func() -> void:
			if not DungeonDirector.enter(get_tree(), k):
				toast_requested.emit("오늘 던전 입장을 다 썼어요 (내일 다시 3번)"))
		drow.add_child(b)
	col.add_child(dungeon_box)

	var head := _box(func(ci: Control) -> void:
		Gt.header(ci, Vector2(6, 26), "일일 퀘스트", "DAILY", 17)
		Gt.text(ci, Vector2(ci.size.x - 6, 25), "매일 자정에 새로 시작", 12, Gt.NAVY_SOFT, 2, false), 36)
	col.add_child(head)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	col.add_child(scroll)
	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override(&"separation", 6)
	scroll.add_child(list)
	for d: Dictionary in Quests.DAILY:
		var id: String = d["id"]
		var row := _box(_paint_daily.bind(d), 58)
		var b := _button("받기", Gt.Kind.GREEN)
		b.font_size = 16
		b.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
		b.offset_left = -92
		b.offset_top = 8
		b.offset_right = -10
		b.offset_bottom = -6
		b.pressed.connect(_on_daily_claim.bind(id))
		row.add_child(b)
		rows[id] = row
		row_buttons[id] = b
		list.add_child(row)
	bonus_row = _box(_paint_bonus, 62)
	bonus_button = _button("받기", Gt.Kind.PINK)
	bonus_button.font_size = 16
	bonus_button.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	bonus_button.offset_left = -92
	bonus_button.offset_top = 8
	bonus_button.offset_right = -10
	bonus_button.offset_bottom = -6
	bonus_button.pressed.connect(_on_bonus)
	bonus_row.add_child(bonus_button)
	list.add_child(bonus_row)
	Quests.changed.connect(refresh)
	refresh()


func refresh() -> void:
	var done := Quests.main_done()
	main_button.visible = not Quests.all_main_cleared()
	main_button.disabled = not done
	main_button.label = "보상 받기" if done else "진행 중"
	main_button.queue_redraw()
	main_card.queue_redraw()
	for d: Dictionary in Quests.DAILY:
		var id: String = d["id"]
		var b := row_buttons[id]
		var claimed := Quests.daily_claimed(d)
		b.disabled = claimed or not Quests.daily_done(d)
		b.label = "완료" if claimed else "받기"
		b.queue_redraw()
		rows[id].queue_redraw()
	bonus_button.disabled = Save.quest.get("bonus", false) or not Quests.all_daily_claimed()
	bonus_button.label = "완료" if Save.quest.get("bonus", false) else "받기"
	bonus_button.queue_redraw()
	bonus_row.queue_redraw()
	if dungeon_box:
		dungeon_box.queue_redraw()
	for d in ach_dots:
		d.queue_redraw()


func _on_main_claim() -> void:
	var q := Quests.current()
	if Quests.claim_main():
		toast_requested.emit("보상 획득! " + Quests.reward_text(q))


func _on_daily_claim(id: String) -> void:
	for d: Dictionary in Quests.DAILY:
		if d["id"] == id and Quests.claim_daily(id):
			toast_requested.emit("보상 획득! " + Quests.reward_text(d))


func _on_bonus() -> void:
	if Quests.claim_bonus():
		toast_requested.emit("일일 보너스! 보석 %d" % Quests.DAILY_BONUS_GEMS)


# ── 그리기 ──

func _paint_main(ci: Control) -> void:
	var r := Rect2(Vector2(2, 4), ci.size - Vector2(4, 8))
	Gt.panel(ci, r)
	var idx := Quests.main_index()
	var total := Quests.MAIN.size()
	Gt.header(ci, r.position + Vector2(14, 34), "메인 이야기", "CHAPTER 1  %d / %d" % [mini(idx + 1, total), total], 17)
	if Quests.all_main_cleared():
		Gt.title(ci, r.position + Vector2(18, 92), "모든 이야기 완료! 고마워요", 22, Color("ffe36b"))
		Gt.text(ci, r.position + Vector2(18, 122), "다음 이야기는 준비 중이에요. 일일 퀘스트로 보석을 모아 보세요.", 13, Gt.NAVY_SOFT, 0, false)
		return
	var q := Quests.current()
	Gt.text(ci, r.position + Vector2(18, 80), q["title"], 22, Gt.NAVY)
	Gt.text(ci, r.position + Vector2(18, 104), q["desc"], 13, Gt.NAVY_SOFT, 0, false)
	var n := Quests.main_progress()
	var cnt := int(q["count"])
	Gt.bar(ci, Rect2(r.position + Vector2(18, 120), Vector2(r.size.x - 250, 16)), minf(n, cnt) / float(cnt), Gt.GREEN if Quests.main_done() else Gt.YELLOW)
	Gt.text(ci, Vector2(r.position.x + r.size.x - 226, r.position.y + 133), "%d / %d" % [mini(n, cnt), cnt], 13, Gt.NAVY)
	# 보상
	var x := r.position.x + 18
	var y := r.end.y - 30
	Gt.text(ci, Vector2(x, y + 6), "보상", 13, Gt.NAVY_SOFT)
	x += 40
	if int(q["gold"]) > 0:
		Gt.coin(ci, Vector2(x + 8, y), 9)
		Gt.text(ci, Vector2(x + 22, y + 6), str(q["gold"]), 15, Gt.NAVY)
		x += 30 + Gt.width(str(q["gold"]), 15)
	if int(q["gems"]) > 0:
		Gt.gem(ci, Vector2(x + 8, y), 9)
		Gt.text(ci, Vector2(x + 22, y + 6), str(q["gems"]), 15, Gt.NAVY)


func _paint_dungeon(ci: Control) -> void:
	var r := Rect2(Vector2(0, 2), ci.size - Vector2(0, 4))
	Gt.pbox(ci, r, Color("ffeedd"), Gt.INK, 2, true, true)
	Gt.header(ci, r.position + Vector2(12, 28), "일일 던전", "DUNGEON", 16)
	var left := Quests.dungeon_left()
	Gt.text(ci, Vector2(r.end.x - 12, r.position.y + 26), "오늘 남은 입장 %d / %d · 60초 동안 몰려오는 몬스터" % [left, Quests.DUNGEON_PER_DAY], 11, Gt.PINK if left > 0 else Gt.GRAY, 2)


func _paint_daily(ci: Control, d: Dictionary) -> void:
	var r := Rect2(Vector2(0, 1), ci.size - Vector2(0, 4))
	var claimed := Quests.daily_claimed(d)
	Gt.pbox(ci, r, Gt.CREAM if not claimed else Color("e9e4da"), Gt.INK, 2, not claimed, true)
	var n := Quests.daily_progress(d)
	var cnt := int(d["count"])
	Gt.text(ci, r.position + Vector2(14, 24), d["title"], 15, Gt.NAVY if not claimed else Gt.GRAY)
	Gt.bar(ci, Rect2(r.position + Vector2(14, 33), Vector2(r.size.x - 250, 12)), n / float(cnt), Gt.GREEN if n >= cnt else Gt.BLUE)
	Gt.text(ci, Vector2(r.end.x - 230, r.position.y + 44), "%d/%d" % [n, cnt], 11, Gt.NAVY_SOFT)
	# 보상 아이콘
	var rx := r.end.x - 152
	if int(d["gems"]) > 0:
		Gt.gem(ci, Vector2(rx + 10, r.get_center().y - 2), 10)
		Gt.text(ci, Vector2(rx + 26, r.get_center().y + 4), str(d["gems"]), 15, Gt.NAVY)
	else:
		Gt.coin(ci, Vector2(rx + 10, r.get_center().y - 2), 10)
		Gt.text(ci, Vector2(rx + 26, r.get_center().y + 4), str(d["gold"]), 15, Gt.NAVY)


func _paint_bonus(ci: Control) -> void:
	var r := Rect2(Vector2(0, 2), ci.size - Vector2(0, 6))
	Gt.pbox(ci, r, Color("ffe7f1"), Gt.INK, 2, true, true)
	Gt.icon(ci, &"chest", r.position + Vector2(30, r.size.y / 2.0), 34)
	var got := 0
	for d: Dictionary in Quests.DAILY:
		if Quests.daily_claimed(d):
			got += 1
	Gt.text(ci, r.position + Vector2(58, 25), "일일 퀘스트 모두 완료 보너스", 15, Gt.NAVY)
	Gt.text(ci, r.position + Vector2(58, 45), "%d / %d 받음 · 보석 %d" % [got, Quests.DAILY.size(), Quests.DAILY_BONUS_GEMS], 12, Gt.NAVY_SOFT, 0, false)


func _button(text: String, kind: int) -> GameButton:
	var b := GameButton.new()
	b.label = text
	b.kind = kind
	b.font_size = 19
	return b


func _box(painter: Callable, h: float) -> DrawBox:
	var b := DrawBox.new()
	b.painter = painter
	b.custom_minimum_size.y = h
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	b.mouse_filter = Control.MOUSE_FILTER_PASS
	return b
