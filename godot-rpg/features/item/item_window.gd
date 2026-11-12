class_name ItemWindow
extends Control
## 가방 창(전투 화면 오른쪽 '가방' 버튼, 또는 I 키): 게임이 멈추고 가진 아이템을 줄마다 보여 준다.
## 귀환서·물약은 '사용' 버튼으로 바로 쓰고, 스킬 책은 개수만(쓰는 곳은 로비 스킬 창).

signal closed

const ROW_H := 76.0

var _toast := ""
var _toast_t := 0.0


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	z_index = 80
	get_tree().paused = true
	Game.sfx(&"pickup", -8.0, 0.0)


func _process(delta: float) -> void:
	_toast_t -= delta
	queue_redraw()


## 줄 목록: [종류("item"/"book"), id]
func _rows() -> Array:
	var out: Array = []
	for id: StringName in Items.DATA:
		out.append(["item", id])
	for b: String in Items.BOOKS:
		out.append(["book", b])
	return out


func _panel() -> Rect2:
	var w := minf(size.x - 30.0, 480.0)
	var h := 150.0 + _rows().size() * ROW_H
	return Rect2(Vector2((size.x - w) / 2.0, (size.y - h) / 2.0), Vector2(w, h))


func _row(i: int) -> Rect2:
	var p := _panel()
	return Rect2(p.position + Vector2(18, 76 + i * ROW_H), Vector2(p.size.x - 36, ROW_H - 8))


func _use_btn(i: int) -> Rect2:
	var r := _row(i)
	return Rect2(Vector2(r.end.x - 96, r.position.y + 12), Vector2(84, r.size.y - 24))


func _close_btn() -> Rect2:
	var p := _panel()
	return Rect2(Vector2(p.get_center().x - 90, p.end.y - 66), Vector2(180, 52))


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if not (mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT):
		return
	if _close_btn().has_point(mb.position) or not _panel().has_point(mb.position):
		close()
		return
	var rows := _rows()
	for i in rows.size():
		if rows[i][0] == "item" and rows[i][1] in Items.USABLE and _use_btn(i).has_point(mb.position):
			_use(rows[i][1])
			return


func _use(id: StringName) -> void:
	if Save.item_count(id) <= 0:
		_say("가진 %s이(가) 없어요" % Items.name_of(id))
		return
	if id == &"potion":
		var p := get_tree().get_first_node_in_group(&"player") as Player
		if p and p.hp >= p.max_hp:
			_say("체력이 이미 가득해요")
			return
	get_tree().paused = false
	if Items.use(id, get_tree()):
		Save.save_game()
		if id == &"return_scroll":
			closed.emit()
			queue_free()
			return
		_say("%s 사용!" % Items.name_of(id))
	get_tree().paused = true


func _say(t: String) -> void:
	_toast = t
	_toast_t = 1.4


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"ui_cancel") or (e is InputEventKey and (e as InputEventKey).pressed and (e as InputEventKey).keycode == KEY_I):
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
	Gt.header(self, p.position + Vector2(20, 46), "가방", "ITEMS", 22)
	var rows := _rows()
	for i in rows.size():
		var r := _row(i)
		var is_item: bool = rows[i][0] == "item"
		var info: Array = Items.DATA[rows[i][1]] if is_item else Items.BOOKS[rows[i][1]]
		var n: int = Save.item_count(rows[i][1]) if is_item else int(Save.books.get(rows[i][1], 0))
		Gt.pbox(self, r, Gt.CREAM if n > 0 else Color("ece6da"), Gt.INK, 2, true, true)
		# 아이콘 칸 + 개수
		var ic := Rect2(r.position + Vector2(10, 9), Vector2(r.size.y - 18, r.size.y - 18))
		Gt.pbox(self, ic, Color("fff4d6"), Gt.INK, 1, false, false)
		var tint := Items.tint_of(rows[i][1]) if is_item else Color.WHITE
		Gt.icon(self, info[2], ic.get_center(), ic.size.x * 0.8, tint if n > 0 else Color(tint, 0.4))
		Gt.text(self, Vector2(ic.end.x - 3, ic.end.y - 4), "%d" % n, 14, Color.WHITE, 2, true, 4, Gt.INK)
		# 이름 · 설명
		var tx := ic.end.x + 12
		Gt.text(self, Vector2(tx, r.position.y + 28), info[0], 17, Gt.NAVY if n > 0 else Gt.GRAY)
		var desc: String = info[1]
		var usable: bool = is_item and rows[i][1] in Items.USABLE
		var right := r.end.x - (104 if usable else 12)
		Gt.text(self, Vector2(tx, r.position.y + 50), desc if Gt.width(desc, 11, false) < right - tx else desc.split(" · ")[0], 11, Gt.NAVY_SOFT, 0, false)
		if usable:
			var b := _use_btn(i)
			Gt.button(self, b, Gt.Kind.YELLOW if n > 0 else Gt.Kind.GRAY)
			Gt.title(self, Vector2(b.get_center().x, b.position.y + 30), "사용", 17, Color.WHITE, 1)
	var cb := _close_btn()
	Gt.button(self, cb, Gt.Kind.BLUE)
	Gt.title(self, Vector2(cb.get_center().x, cb.position.y + 34), "닫기", 19, Color.WHITE, 1)
	if _toast_t > 0.0:
		var w := Gt.width(_toast, 17) + 40
		var tr := Rect2(Vector2((size.x - w) / 2.0, p.position.y - 56), Vector2(w, 44))
		Gt.pbox(self, tr, Color(Gt.NAVY, 0.95))
		Gt.title(self, Vector2(tr.get_center().x, tr.position.y + 29), _toast, 17, Color.WHITE, 1)
	Gt.text(self, Vector2(p.get_center().x, p.end.y + 26), "몬스터가 가끔 떨어뜨려요 · I 키로도 열고 닫아요", 12, Color.WHITE, 1, true, 3, Gt.INK)
