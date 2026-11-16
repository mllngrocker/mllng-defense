class_name PauseMenu
extends Control
## 일시정지·설정 창(전투 화면 오른쪽 위 톱니 버튼, 또는 Esc·P): 게임이 멈추고
## 배경음·효과음 크기, 화면 흔들림을 바꾸고 계속하기·로비로 갈 수 있다. 설정은 Save.settings에 저장.

signal closed

const MENU_SCENE := "res://features/menu/main_menu.tscn"

var _drag := ""  # 끌고 있는 슬라이더("bgm"·"sfx")
var t := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_index = 80
	get_tree().paused = true
	Game.sfx(&"pickup", -8.0, 0.0)


func _process(delta: float) -> void:
	t += delta
	_toast_t = maxf(0.0, _toast_t - delta)
	queue_redraw()


func _panel() -> Rect2:
	var w := minf(size.x - 40.0, 440.0)
	return Rect2(Vector2((size.x - w) / 2.0, size.y * 0.5 - 280.0), Vector2(w, 560))


func _slider(i: int) -> Rect2:
	var p := _panel()
	return Rect2(p.position + Vector2(40, 150 + i * 92), Vector2(p.size.x - 80, 18))


func _toggle() -> Rect2:
	var p := _panel()
	return Rect2(Vector2(p.end.x - 120, p.position.y + 318), Vector2(84, 36))


## 백업 코드 복사(0) · 코드로 불러오기(1)
func _backup_btn(i: int) -> Rect2:
	var p := _panel()
	var w := (p.size.x - 92) / 2.0
	return Rect2(p.position + Vector2(40 + i * (w + 12), 372), Vector2(w, 40))


## 처음부터 하기(맨 아래 큰 버튼 위)
func _reset_btn() -> Rect2:
	var p := _panel()
	return Rect2(p.position + Vector2(40, 424), Vector2(p.size.x - 80, 34))


func _btn(i: int) -> Rect2:
	var p := _panel()
	var w := (p.size.x - 70) / 2.0
	return Rect2(p.position + Vector2(25 + i * (w + 20), p.size.y - 92), Vector2(w, 62))


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	var mm := e as InputEventMouseMotion
	if mb and mb.button_index == MOUSE_BUTTON_LEFT:
		if mb.pressed:
			for i in 2:
				if _slider(i).grow(16).has_point(mb.position):
					_drag = ["bgm", "sfx"][i]
					_set_from(mb.position.x)
					return
			if _toggle().has_point(mb.position):
				Save.settings["shake"] = not bool(Save.settings.get("shake", true))
				Game.sfx(&"pickup", -8.0, 0.0)
			elif _reset_btn().has_point(mb.position):
				_ask_reset()
			elif _backup_btn(0).has_point(mb.position):
				_copy_code()
			elif _backup_btn(1).has_point(mb.position):
				_paste_code()
			elif _btn(0).has_point(mb.position):
				close()
			elif _btn(1).has_point(mb.position):
				get_tree().call_group(&"world", &"remember_place")
				get_tree().paused = false
				get_tree().change_scene_to_file(MENU_SCENE)
		else:
			if _drag == "sfx":
				Game.sfx(&"pickup", -4.0, 0.0)  # 효과음 크기 미리 듣기
			_drag = ""
	elif mm and _drag != "":
		_set_from(mm.position.x)


## 처음부터 하기: 정말 지울지 한 번 더 묻고, 예면 저장을 지우고 로비(첫 화면)로
func _ask_reset() -> void:
	Game.sfx(&"pickup", -8.0, 0.0)
	var box := ConfirmBox.new()
	box.title = "정말로 삭제할 건가요?"
	box.sub = "캐릭터·장비·골드·보석·진행이 모두 지워지고 처음부터 시작해요. 되돌릴 수 없어요."
	box.yes_label = "삭제하기"
	box.no_label = "취소"
	box.process_mode = Node.PROCESS_MODE_ALWAYS
	box.answered.connect(func(yes: bool) -> void:
		if not yes:
			return
		Save.wipe()
		get_tree().paused = false
		get_tree().change_scene_to_file(MENU_SCENE))
	add_child(box)


## 백업 코드 복사: 클립보드에 넣고, 휴대폰 웹이면 코드가 담긴 입력창도 띄워 직접 복사할 수 있게
func _copy_code() -> void:
	var code := Save.export_code()
	if code == "":
		return
	DisplayServer.clipboard_set(code)
	Game.sfx(&"success", -6.0, 0.0)
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.prompt('백업 코드예요. 길게 눌러 전부 복사해 메모장 등에 보관하세요', %s)" % JSON.stringify(code), true)
	_say("백업 코드를 복사했어요! 메모장에 붙여 보관하세요")


## 코드로 불러오기: 휴대폰 웹은 입력창, PC는 클립보드에서 읽고 → 한 번 더 묻고 덮어쓴다
func _paste_code() -> void:
	var code := ""
	if OS.has_feature("web"):
		code = str(JavaScriptBridge.eval("(window.prompt('백업 코드를 붙여넣어 주세요', '') || '')", true))
	else:
		code = DisplayServer.clipboard_get()
	if not code.strip_edges().begins_with(Save.CODE_HEAD):
		Game.sfx(&"hurt", -8.0, 0.0)
		_say("올바른 백업 코드가 아니에요")
		return
	var box := ConfirmBox.new()
	box.title = "이 코드로 불러올까요?"
	box.sub = "지금 저장이 코드 속 저장으로 바뀌어요. 되돌릴 수 없어요."
	box.yes_label = "불러오기"
	box.no_label = "취소"
	box.process_mode = Node.PROCESS_MODE_ALWAYS
	box.answered.connect(func(yes: bool) -> void:
		if not yes:
			return
		if Save.import_code(code):
			get_tree().paused = false
			get_tree().change_scene_to_file(MENU_SCENE)
		else:
			_say("코드를 읽지 못했어요(잘린 곳이 없는지 확인해 주세요)"))
	add_child(box)


var _toast := ""
var _toast_t := 0.0


func _say(text: String) -> void:
	_toast = text
	_toast_t = 2.2


func _set_from(x: float) -> void:
	var r := _slider(0 if _drag == "bgm" else 1)
	Save.settings[_drag] = clampf((x - r.position.x) / r.size.x, 0.0, 1.0)
	Game.apply_volume()


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"ui_cancel") or (e is InputEventKey and (e as InputEventKey).pressed and (e as InputEventKey).keycode == KEY_P):
		get_viewport().set_input_as_handled()
		close()


func close() -> void:
	Save.save_game()
	get_tree().paused = false
	closed.emit()
	queue_free()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.6))
	var p := _panel()
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(20, 46), "일시정지", "PAUSE", 22)
	Gt.text(self, Vector2(p.get_center().x, p.position.y + 90), "게임이 멈춰 있어요", 14, Gt.NAVY_SOFT, 1, false)
	var names := ["배경음", "효과음"]
	var keys := ["bgm", "sfx"]
	for i in 2:
		var r := _slider(i)
		var v := float(Save.settings.get(keys[i], 0.8))
		Gt.text(self, r.position + Vector2(0, -16), names[i], 18, Gt.NAVY)
		Gt.text(self, Vector2(r.end.x, r.position.y - 16), "%d%%" % roundi(v * 100.0) if v > 0.01 else "끔", 16, Gt.PINK, 2)
		Gt.pbox(self, r, Color("3d3556"), Gt.INK, 2, true, false)
		var fill := Rect2(r.position + Vector2(3, 3), Vector2((r.size.x - 6) * v, r.size.y - 6))
		if fill.size.x > 1.0:
			Gt.round_grad(self, fill, 4, Color("ff9ec8"), Color("ff4d8f"))
		var knob := Vector2(r.position.x + r.size.x * v, r.get_center().y)
		draw_circle(knob + Vector2(0, 2), 15.0, Gt.INK)
		draw_circle(knob, 15.0, Gt.INK)
		draw_circle(knob, 12.0, Color.WHITE)
		draw_circle(knob + Vector2(-3, -3), 4.0, Color("ffe3f0"))
	# 화면 흔들림 켜기·끄기
	var on := bool(Save.settings.get("shake", true))
	var tr := _toggle()
	Gt.text(self, Vector2(_panel().position.x + 40, tr.position.y + 26), "화면 흔들림", 18, Gt.NAVY)
	Gt.pbox(self, tr, Color("7ccf5a") if on else Color("b8b0c8"), Gt.INK, 2, true, true)
	var kx := tr.end.x - 20 if on else tr.position.x + 20
	draw_circle(Vector2(kx, tr.get_center().y), 14.0, Gt.INK)
	draw_circle(Vector2(kx, tr.get_center().y), 11.0, Color.WHITE)
	Gt.text(self, Vector2(tr.get_center().x + (-12 if on else 12), tr.position.y + 24), "켬" if on else "끔", 13, Color.WHITE, 1, true, 3, Gt.INK)
	# 백업 코드(복사 · 불러오기)
	Gt.text(self, Vector2(_panel().position.x + 40, _backup_btn(0).position.y - 8), "백업 코드 (기기를 바꾸거나 캐시를 지워도 되살려요)", 12, Gt.NAVY_SOFT, 0, false)
	for i in 2:
		var bb := _backup_btn(i)
		Gt.pbox(self, bb, Color("e3efff") if i == 0 else Color("e9f8e4"), Gt.INK, 2, false, true)
		Gt.text(self, Vector2(bb.get_center().x, bb.position.y + 26), ["백업 코드 복사", "코드로 불러오기"][i], 15, Gt.NAVY, 1)
	# 처음부터 하기(빨간 테두리 작은 버튼)
	var rb := _reset_btn()
	Gt.pbox(self, rb, Color("ffe1e1"), Color("c0392b"), 2, false, true)
	Gt.text(self, Vector2(rb.get_center().x, rb.position.y + 23), "처음부터 하기 (저장 삭제)", 15, Color("c0392b"), 1)
	# 버튼
	var labels := ["계속하기", "로비로"]
	var kinds := [Gt.Kind.YELLOW, Gt.Kind.BLUE]
	for i in 2:
		var b := _btn(i)
		Gt.button(self, b, kinds[i])
		Gt.title(self, Vector2(b.get_center().x, b.position.y + 38), labels[i], 20, Color.WHITE, 1)
	Gt.text(self, Vector2(p.get_center().x, p.end.y + 26), "Esc · P 키로도 열고 닫아요", 12, Color.WHITE, 1, true, 3, Gt.INK)
	if _toast_t > 0.0:
		var w := Gt.width(_toast, 15) + 36
		var tr2 := Rect2(Vector2((size.x - w) / 2.0, p.position.y - 54), Vector2(w, 40))
		Gt.pbox(self, tr2, Color(Gt.NAVY, 0.95))
		Gt.text(self, Vector2(tr2.get_center().x, tr2.position.y + 26), _toast, 15, Color.WHITE, 1)
