extends CanvasLayer
## 필드 화면 위 정보(세로 모바일, 가디언 테일즈풍 — 로비와 같은 Gt 도구로 그린다):
## 왼쪽 위 얼굴 액자·이름·레벨·체력바, 오른쪽 위 처치 수·골드·보석과 "로비" 버튼, 아래쪽 안내 문구.
## 신호만 듣고 게임 상태는 건드리지 않는다.

const MENU_SCENE := "res://features/menu/main_menu.tscn"
const FACE := Rect2(12, 10, 64, 64)
const BAR := Rect2(92, 48, 186, 24)
const HP_RED := Color("ff4d5e")
const CUTIN_TIME := 1.1
const TITLE_TIME := 2.6
const NOTE_TIME := 2.0
const TRACKER := Rect2(10, 100, 270, 66)

var auto_button: IconButton
var data: CharacterData
var level := 1
var hp := 0
var max_hp := 0
var mp := 0
var max_mp := 0
var kills := 0
var _shown_hp := 0.0  # 체력이 줄 때 하얀 잔상이 늦게 따라온다
var _cutin: CharacterData  # 스킬 컷인(일러스트 + 스킬 이름 띠)
var _cutin_t := 99.0
var _title := ""  # 맵 이름 띠
var _title_t := 99.0
var _boss_name := ""  # 깨어난 보스(위쪽 큰 체력바)
var _boss_hp := 0
var _boss_max := 1
var _boss_gone_t := 0.0
var _boss_lag := 0.0  # 하얀 잔상 칸: 맞은 뒤 잠깐 남았다가 빨간 칸을 따라 줄어든다
var _boss_hold := 0.0
## 보스 체력바 모양(비교용): 0 가운데 크게 · 1 위쪽 얇게 · 2 아래쪽 얇게
static var boss_bar_style := 1  # 사용자가 고름: 위쪽 얇게(맵을 덜 가린다)
var _boss_hit_t := 0.0  # 맞은 순간 체력바가 살짝 번쩍·흔들
var _note := ""  # 가운데 알림 띠(퀘스트 완료·보상)
var _note_sub := ""
var _note_t := 99.0
var tracker: DrawBox
var _was_travel := false

@onready var canvas: Control = $Canvas
@onready var message: Label = $Message


func _ready() -> void:
	add_to_group(&"hud")
	canvas.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	canvas.draw.connect(_draw_hud)
	Events.character_changed.connect(_on_character_changed)
	Events.player_hp_changed.connect(_on_hp_changed)
	Events.player_mp_changed.connect(func(m: int, mm: int) -> void:
		mp = m
		max_mp = mm
		canvas.queue_redraw())
	Events.enemy_died.connect(func(_k: String) -> void: canvas.queue_redraw.call_deferred())  # 경험치 줄
	Events.enemy_died.connect(_on_enemy_died)
	Events.player_died.connect(_on_player_died)
	Events.map_entered.connect(func(title: String) -> void:
		_title = title
		_title_t = 0.0)
	Events.skill_cast.connect(func(d: CharacterData) -> void:
		_cutin = d
		_cutin_t = 0.0)
	Save.gold_changed.connect(func(_g: int) -> void: canvas.queue_redraw())
	Save.gems_changed.connect(func(_g: int) -> void: canvas.queue_redraw())
	_add_map_button()
	_add_tracker()
	Events.boss_hp.connect(_on_boss_hp)
	Events.notice.connect(_show_note)
	Quests.completed.connect(func(title: String) -> void: _show_note("퀘스트 완료!", title))
	Quests.changed.connect(_fit_tracker)
	var ls := message.label_settings.duplicate() as LabelSettings
	ls.font = Gt.BOLD
	ls.outline_color = Gt.INK
	ls.outline_size = 7
	message.label_settings = ls
	message.text = "왼쪽 아래를 끌어서 이동 · 오른쪽 버튼으로 공격·구르기"
	var tw := create_tween()
	tw.tween_interval(4.0)
	tw.tween_property(message, ^"modulate:a", 0.0, 0.8)


func _process(delta: float) -> void:
	if _note_t < NOTE_TIME:
		_note_t += delta
		canvas.queue_redraw()
	if _boss_name != "" and (_boss_lag > _boss_hp or _boss_hit_t > 0.0):
		_boss_hit_t = maxf(0.0, _boss_hit_t - delta)
		_boss_hold -= delta
		if _boss_hold <= 0.0:
			_boss_lag = move_toward(_boss_lag, float(_boss_hp), _boss_max * 0.9 * delta)
		canvas.queue_redraw()
	if _boss_name != "" and _boss_hp <= 0:
		_boss_gone_t += delta
		if _boss_gone_t > 2.0:
			_boss_name = ""
		canvas.queue_redraw()
	if Quests.main_done() or Travel.active() != _was_travel:
		_was_travel = Travel.active()
		tracker.queue_redraw()  # 완료된 퀘스트는 반짝인다 · 자동 이동 표시
	if _cutin_t < CUTIN_TIME:
		_cutin_t += delta
		canvas.queue_redraw()
	if _title_t < TITLE_TIME:
		_title_t += delta
		canvas.queue_redraw()
	if absf(_shown_hp - hp) > 0.5:
		_shown_hp = move_toward(_shown_hp, hp, maxf(1.0, max_hp) * 0.6 * delta)
		canvas.queue_redraw()
	elif hp > 0 and hp <= max_hp * 0.3:
		canvas.queue_redraw()  # 체력이 적으면 체력바가 깜빡인다


func _on_character_changed(d: CharacterData, lv: int) -> void:
	data = d
	level = lv
	canvas.queue_redraw()


func _on_hp_changed(new_hp: int, new_max: int) -> void:
	if max_hp == 0:
		_shown_hp = new_hp
	_shown_hp = maxf(_shown_hp, new_hp)
	hp = new_hp
	max_hp = new_max
	canvas.queue_redraw()


func _on_enemy_died(_kind: String) -> void:
	kills += 1
	canvas.queue_redraw()


func _on_player_died() -> void:
	message.text = "쓰러졌다... 마을에서 다시 일어난다"
	message.modulate.a = 1.0


func _draw_hud() -> void:
	var ci := canvas
	# 위쪽을 살짝 어둡게(밝은 풀밭 위에서도 글씨가 보이게)
	Gt.grad(ci, Rect2(0, 0, ci.size.x, 120), Color(Gt.INK, 0.35), Color(Gt.INK, 0.0))
	_draw_profile(ci)
	_draw_counters(ci)
	if _title_t < TITLE_TIME:
		_draw_title(ci)
	if _boss_name != "":
		_draw_boss_bar(ci)
	if _note_t < NOTE_TIME:
		_draw_note(ci)
	if _cutin and _cutin_t < CUTIN_TIME:
		_draw_cutin(ci)


## 맵에 들어오면 위쪽 가운데에 맵 이름 띠가 내려왔다가 사라진다
func _draw_title(ci: Control) -> void:
	var a := clampf(_title_t / 0.25, 0.0, 1.0) * clampf((TITLE_TIME - _title_t) / 0.4, 0.0, 1.0)
	var w := Gt.width(_title, 24) + 80
	var y := 236.0 - (1.0 - clampf(_title_t / 0.25, 0.0, 1.0)) * 20.0
	var r := Rect2(Vector2((ci.size.x - w) / 2.0, y), Vector2(w, 50))
	ci.draw_set_transform(Vector2.ZERO)
	Gt.pbox(ci, r, Color(Gt.NAVY, 0.92 * a), Color(Gt.INK, a))
	Gt.star(ci, Vector2(r.position.x + 22, r.get_center().y), 8, Color(Gt.STAR, a))
	Gt.star(ci, Vector2(r.end.x - 22, r.get_center().y), 8, Color(Gt.STAR, a))
	Gt.text(ci, Vector2(r.get_center().x, r.position.y + 33), _title, 24, Color(1, 1, 1, a), 1, true, 6, Color(Gt.INK, a))


## 스킬 컷인: 화면 가운데 위로 사선 띠가 미끄러져 들어오고, 일러스트와 스킬 이름이 뜬다
func _draw_cutin(ci: Control) -> void:
	var t := _cutin_t
	var slide := clampf(t / 0.14, 0.0, 1.0)
	var fade := clampf((CUTIN_TIME - t) / 0.25, 0.0, 1.0)
	var w := ci.size.x
	var y := ci.size.y * 0.3
	var h := 96.0
	var off := (1.0 - slide) * -w
	ci.draw_set_transform(Vector2(off, 0))
	var col := Gt.element_color(_cutin.element)
	var band := PackedVector2Array([Vector2(0, y + 10), Vector2(w, y - 14), Vector2(w, y + h - 14), Vector2(0, y + h + 10)])
	ci.draw_colored_polygon(band, Color(Gt.INK, 0.85 * fade))
	var inner := PackedVector2Array([Vector2(0, y + 14), Vector2(w, y - 10), Vector2(w, y + h - 18), Vector2(0, y + h + 6)])
	ci.draw_colored_polygon(inner, Color(col.darkened(0.35), 0.9 * fade))
	# 흘러가는 빗금
	for i in 8:
		var x := fposmod(i * 90.0 + t * 600.0, w + 120.0) - 60.0
		ci.draw_line(Vector2(x, y + h + 6), Vector2(x + 40, y - 10), Color(1, 1, 1, 0.12 * fade), 10.0)
	# 일러스트(상반신)
	var art := Rect2(Vector2(24, y - 30), Vector2(130, 140))
	UiKit.card_art(ci, _cutin, art, Color(1, 1, 1, fade))
	Gt.text(ci, Vector2(170, y + 36), Gt.roman(_cutin.id) + " SKILL", 13, Color(col.lightened(0.5), fade), 0, true, 4, Gt.INK, true)
	var sk_name := _cutin.skill_name
	var pl := get_tree().get_first_node_in_group(&"player") as Player
	if pl and pl.skills and pl.skills.last_name != "":
		sk_name = pl.skills.last_name
	Gt.text(ci, Vector2(168, y + 72), sk_name, 32, Color(1, 1, 1, fade), 0, true, 8, Gt.INK)
	ci.draw_set_transform(Vector2.ZERO)


## 왼쪽 위: 얼굴 액자(등급색 테두리) + Lv + 속성 + 이름 + 체력바
func _draw_profile(ci: Control) -> void:
	var rc: Color = Gt.ELEMENT_CARD[data.element] if data else Gt.BLUE
	var c := FACE.get_center()
	var r := FACE.size.x / 2.0
	# 이름판(비스듬, 남색 → 투명)
	Gt.skew_box(ci, Rect2(c.x + 18, 12, 200, 30), 10, Color(Gt.NAVY, 0.95), Color(Gt.NAVY, 0.55), Color(Gt.INK, 0.9), 2.0)
	Gt.skew_box(ci, Rect2(c.x + 22, 14, 196, 4), 2, Color(1, 1, 1, 0.25), Color(1, 1, 1, 0.0), Color.TRANSPARENT, 0.0)
	# 초상: 그림자·금테·속성색 구슬·얼굴
	ci.draw_circle(c + Vector2(0, 3), r + 4, Color(Gt.INK, 0.5))
	ci.draw_circle(c, r + 4, Gt.INK)
	ci.draw_circle(c, r + 2.5, Gt.GOLD_D)
	ci.draw_circle(c + Vector2(0, -1), r + 1, Gt.GOLD_L)
	ci.draw_circle(c, r - 1.5, Gt.INK)
	ci.draw_circle(c, r - 2.5, rc.lightened(0.35))
	ci.draw_circle(c + Vector2(0, 6), r - 6, rc)
	if data and data.face:
		Gt.circle_tex(ci, data.face, c, r - 3.0)
	if data:
		Gt.element_badge(ci, c + Vector2(r - 4, -r + 6), 9, data.element)
		# 레벨 배지(왼쪽 아래 동그라미)
		var lc := c + Vector2(-r + 6, r - 4)
		ci.draw_circle(lc, 15, Gt.INK)
		ci.draw_circle(lc, 13, Gt.GOLD)
		ci.draw_circle(lc, 11, Gt.NAVY)
		Gt.text(ci, lc + Vector2(0, 5), str(level), 14, Color.WHITE, 1)
		Gt.title(ci, Vector2(c.x + r + 14, 35), data.display_name, 18)
		var nw := Gt.width(data.display_name, 18)
		Gt.text(ci, Vector2(c.x + r + nw + 22, 34), Gt.roman(data.id), 11, Color("ffe36b"), 0, true, 4, Gt.INK, true)
	# 체력바(비스듬): 어두운 홈 · 하얀 잔상 · 빨강→분홍 · 눈금 · 윗줄 반짝
	var bar := Rect2(c.x + r + 4, 46, 196, 20)
	Gt.skew_box(ci, bar.grow(2), 9, Gt.INK, Gt.INK, Gt.INK, 0.0)
	Gt.skew_box(ci, bar, 8, Color("2a2238"), Color("3d3556"), Color.TRANSPARENT, 0.0)
	if max_hp > 0:
		var lag := bar.size.x * clampf(_shown_hp / max_hp, 0.0, 1.0)
		var cur := bar.size.x * clampf(float(hp) / max_hp, 0.0, 1.0)
		if lag > 2.0:
			Gt.skew_box(ci, Rect2(bar.position, Vector2(lag, bar.size.y)), 8, Color("fff3e0"), Color("ffd9c0"), Color.TRANSPARENT, 0.0)
		if cur > 2.0:
			var low := hp <= max_hp * 0.3
			var blink := 0.25 * (sin(Time.get_ticks_msec() / 90.0) + 1.0) if low else 0.0
			Gt.skew_box(ci, Rect2(bar.position, Vector2(cur, bar.size.y)), 8, Color("ff7a9a").lerp(Color.WHITE, blink), Color("e8203d"), Color.TRANSPARENT, 0.0)
			Gt.skew_box(ci, Rect2(bar.position + Vector2(4, 2), Vector2(maxf(cur - 8, 0), 4)), 2, Color(1, 1, 1, 0.45), Color(1, 1, 1, 0.1), Color.TRANSPARENT, 0.0)
		for i in range(1, 10):
			var x := bar.position.x + bar.size.x * i / 10.0
			ci.draw_line(Vector2(x + 6, bar.position.y + 2), Vector2(x - 2, bar.end.y - 2), Color(Gt.INK, 0.35), 1.0)
		Gt.text(ci, Vector2(bar.position.x + 14, bar.position.y + 15), "HP", 11, Color("ffe36b"), 0, true, 3, Gt.INK, true)
		Gt.title(ci, Vector2(bar.end.x - 14, bar.position.y + 15), "%d / %d" % [hp, max_hp], 12, Color.WHITE, 2)
	# 마나바(체력바 아래, 조금 얇게)
	var mb := Rect2(bar.position.x - 3, bar.end.y + 5, bar.size.x - 14, 13)
	Gt.skew_box(ci, mb.grow(2), 6, Gt.INK, Gt.INK, Gt.INK, 0.0)
	Gt.skew_box(ci, mb, 5, Color("1f2440"), Color("2c3358"), Color.TRANSPARENT, 0.0)
	if max_mp > 0:
		var mc := mb.size.x * clampf(float(mp) / max_mp, 0.0, 1.0)
		if mc > 2.0:
			Gt.skew_box(ci, Rect2(mb.position, Vector2(mc, mb.size.y)), 5, Color("7fc8ff"), Color("2f6cf0"), Color.TRANSPARENT, 0.0)
			Gt.skew_box(ci, Rect2(mb.position + Vector2(3, 2), Vector2(maxf(mc - 6, 0), 2)), 1, Color(1, 1, 1, 0.45), Color(1, 1, 1, 0.1), Color.TRANSPARENT, 0.0)
		Gt.text(ci, Vector2(mb.position.x + 12, mb.position.y + 11), "MP", 10, Color("bfe4ff"), 0, true, 3, Gt.INK, true)
		Gt.text(ci, Vector2(mb.end.x - 12, mb.position.y + 11), "%d / %d" % [mp, max_mp], 10, Color.WHITE, 2, true, 3, Gt.INK)
	# 경험치(가는 노란 줄): 다음 레벨까지
	if data and Save.is_owned(data.id):
		var lv := Save.level_of(data.id)
		var xr := 1.0 if lv >= Save.MAX_LEVEL else Save.exp_of(data.id) / float(Save.exp_need(lv))
		var xb := Rect2(c.x - r + 4, mb.end.y + 6, bar.end.x - (c.x - r + 4), 5)
		ci.draw_rect(xb.grow(1), Gt.INK)
		ci.draw_rect(xb, Color("3a3046"))
		ci.draw_rect(Rect2(xb.position, Vector2(xb.size.x * clampf(xr, 0.0, 1.0), xb.size.y)), Color("ffd84a"))
		Gt.text(ci, Vector2(xb.end.x + 4, xb.end.y + 3), "EXP %.1f%%" % (xr * 100.0), 9, Color("ffe9a0"), 0, true, 3, Gt.INK)


## 오른쪽 위(로비 버튼 왼쪽): 처치 수 · 골드 · 보석 칸
func _draw_counters(ci: Control) -> void:
	var x := ci.size.x - 70.0 - 124.0
	var rows: Array = [[&"skull", kills, Color.WHITE], [&"coin", Save.gold, Color("ffe36b")], [&"gem", Save.gems, Color("ffb8ea")]]
	for i in rows.size():
		var r := Rect2(x + 10, 12 + i * 34, 118, 26)
		Gt.skew_box(ci, r, 8, Color(Gt.PLUM, 0.95), Color("2a1838", 0.95), Gt.INK, 2.0)
		Gt.skew_box(ci, Rect2(r.position + Vector2(6, 2), Vector2(r.size.x - 12, 3)), 1, Color(1, 1, 1, 0.22), Color(1, 1, 1, 0.0), Color.TRANSPARENT, 0.0)
		var ic := Vector2(r.position.x + 2, r.get_center().y)
		ci.draw_circle(ic, 15, Gt.INK)
		ci.draw_circle(ic, 13, Gt.GOLD)
		ci.draw_circle(ic, 11, Color("3a2546"))
		Gt.icon(ci, rows[i][0], ic, 20 if i == 0 else 26)
		Gt.title(ci, Vector2(r.end.x - 12, r.position.y + 19), _comma(rows[i][1]), 14, rows[i][2], 2)


## 왼쪽 위 퀘스트 추적창: 지금 메인 퀘스트와 진행도. 다 채우면 반짝이고, 누르면 보상을 받는다.
func _add_tracker() -> void:
	tracker = DrawBox.new()
	tracker.painter = _paint_tracker
	tracker.position = TRACKER.position
	tracker.size = TRACKER.size
	tracker.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	tracker.mouse_filter = Control.MOUSE_FILTER_STOP
	tracker.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_on_tracker_pressed())
	add_child(tracker)
	_fit_tracker()


## 퀘스트 카드 높이를 설명 줄 수에 맞춘다(설명이 잘리지 않게)
func _fit_tracker() -> void:
	if not is_instance_valid(tracker):
		return
	tracker.size.y = _tracker_height()
	tracker.queue_redraw()


func _tracker_lines() -> Array[String]:
	var q := Quests.current()
	if q.is_empty() or Quests.main_done():
		return []
	return _wrap(String(q["desc"]), 11, TRACKER.size.x - 28.0)


func _tracker_height() -> float:
	var q := Quests.current()
	var h := 38.0 + _tracker_lines().size() * 15.0
	if not q.is_empty() and not Quests.main_done() and int(q["count"]) > 1:
		h += 20.0  # 진행 막대
	if q.is_empty() or Quests.main_done():
		h = 66.0
	return maxf(h + 6.0, 66.0)


## 글을 폭에 맞춰 여러 줄로 나눈다(띄어쓰기 기준, 너무 긴 낱말은 글자 단위)
func _wrap(text: String, font_size: int, width: float) -> Array[String]:
	var lines: Array[String] = []
	var line := ""
	for word in text.split(" "):
		var next := word if line == "" else line + " " + word
		if Gt.width(next, font_size, false) <= width:
			line = next
			continue
		if line != "":
			lines.append(line)
		line = ""
		for ch in word:
			if Gt.width(line + ch, font_size, false) > width and line != "":
				lines.append(line)
				line = ""
			line += ch
	if line != "":
		lines.append(line)
	return lines


## 퀘스트 카드 누르기: 완료면 보상, 아니면 그 퀘스트 하러 자동 이동(한 번 더 누르면 멈춤)
func _on_tracker_pressed() -> void:
	var q := Quests.current()
	if Quests.main_done():
		Quests.claim_main()
		_show_note("보상 획득!", Quests.reward_text(q))
	elif Travel.active():
		Travel.stop()
		_show_note("자동 이동 멈춤", "")
	elif not q.is_empty():
		var err := Travel.start(get_tree())
		if err == "":
			_show_note("자동 이동!", "%s · 조이스틱을 움직이면 멈춰요" % q["title"])
			Game.sfx(&"pickup", -6.0, 0.0)
		else:
			_show_note(q["title"], err)
	tracker.queue_redraw()


func _paint_tracker(ci: Control) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 4))
	var q := Quests.current()
	var done := Quests.main_done()
	var pulse := 0.5 + 0.5 * sin(Time.get_ticks_msec() / 160.0)
	# 반투명 카드 + 왼쪽 색 띠 + 위쪽 금줄
	if done:
		Gt.round_grad(ci, r, 6, Color("c9952a").lerp(Color("ffd36b"), pulse), Color("8a6a18"))
	else:
		Gt.round_grad(ci, r, 6, Color("3a2650", 0.92), Color("1f1530", 0.88))
	Gt.round_line(ci, r, 6, Gt.INK, 2.0)
	ci.draw_rect(Rect2(r.position + Vector2(8, 1.5), Vector2(r.size.x - 16, 1.5)), Color(Gt.GOLD_L, 0.6))
	ci.draw_rect(Rect2(r.position + Vector2(3, 6), Vector2(4, r.size.y - 12)), Color("7ccf5a") if done else Color("ff6fa8"))
	var tag := Rect2(r.position + Vector2(12, 8), Vector2(48, 20))
	Gt.skew_box(ci, tag, 6, Color("8cdf6a") if done else Color("ff8fb8"), Color("4fa83a") if done else Color("e04a86"), Gt.INK, 2.0)
	Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 15), "완료!" if done else ("이동 중" if Travel.active() else "메인"), 11 if not Travel.active() or done else 10, Color.WHITE, 1)
	if not done and not Travel.active() and not q.is_empty():
		Gt.text(ci, Vector2(r.end.x - 10, r.position.y + 22), "눌러서 이동 ▶", 10, Color("ffd36b"), 2)
	if q.is_empty():
		Gt.title(ci, Vector2(tag.end.x + 8, r.position.y + 24), "모든 이야기를 마쳤어요!", 14)
		Gt.text(ci, r.position + Vector2(12, 50), "일일 퀘스트는 로비 퀘스트 탭에서", 11, Color("e6d9f0"), 0, false)
		return
	Gt.title(ci, Vector2(tag.end.x + 8, r.position.y + 24), q["title"], 15)
	if done:
		Gt.text(ci, r.position + Vector2(12, 50), "눌러서 보상 받기 ▶ " + Quests.reward_text(q), 12, Color("fff3a0"), 0, true, 3, Gt.INK)
		return
	# 설명(줄바꿈해서 전부) → 여러 번 하는 퀘스트는 아래에 진행 막대
	var y := r.position.y + 46.0
	for line in _tracker_lines():
		Gt.text(ci, Vector2(r.position.x + 12, y), line, 11, Color("e6d9f0"), 0, false)
		y += 15.0
	if int(q["count"]) > 1:
		var n := Quests.main_progress()
		Gt.bar(ci, Rect2(Vector2(r.position.x + 12, y - 6), Vector2(r.size.x - 84, 12)), n / float(q["count"]), Gt.YELLOW)
		Gt.text(ci, Vector2(r.end.x - 12, y + 5), "%d / %d" % [n, int(q["count"])], 12, Color.WHITE, 2, true, 3, Gt.INK)


func _on_boss_hp(name: String, bhp: int, bmax: int) -> void:
	if _boss_name != name:
		_show_note("보스 등장!", name)
		_boss_lag = float(bhp)
	elif bhp < _boss_hp:
		_boss_hold = 0.45  # 잔상은 잠깐 버텼다가 줄어든다
		_boss_hit_t = 0.18
	_boss_name = name
	_boss_hp = bhp
	_boss_max = maxi(bmax, 1)
	_boss_gone_t = 0.0
	canvas.queue_redraw()


## 위쪽 가운데 큰 보스 체력바: 이름표 + 금테 + 빨간 칸(지금 체력) 뒤로 하얀 잔상 칸(방금 깎인 만큼) + 10칸 눈금
func _draw_boss_bar(ci: Control) -> void:
	var w := minf(ci.size.x - 150.0, 420.0)  # 왼쪽 퀘스트 카드·오른쪽 버튼을 가리지 않게
	var shake := Vector2(randf_range(-2, 2), randf_range(-1, 1)) * (_boss_hit_t / 0.18) if _boss_hit_t > 0.0 else Vector2.ZERO
	var slim := boss_bar_style != 0
	var y := 318.0 if boss_bar_style == 0 else (190.0 if boss_bar_style == 1 else ci.size.y - 372.0)
	var r := Rect2(Vector2((ci.size.x - w) / 2.0, y) + shake, Vector2(w, 14.0 if slim else 26.0))
	var a := clampf(1.0 - (_boss_gone_t - 1.0), 0.0, 1.0) if _boss_hp <= 0 else 1.0
	if slim:
		# 얇은 바: 이름은 바 바로 위 왼쪽에 작게, 남은 %는 오른쪽에
		Gt.text(ci, r.position + Vector2(0, -7), "BOSS", 10, Color(1, 0.75, 0.3, a), 0, true, 3, Gt.INK, true)
		Gt.text(ci, r.position + Vector2(36, -6), _boss_name, 14, Color(1, 0.92, 0.92, a), 0, true, 3, Gt.INK)
	else:
		# 이름표(가운데 위)
		var tw := Gt.width(_boss_name, 18) + 64.0
		var tag := Rect2(Vector2(ci.size.x / 2.0 - tw / 2.0, r.position.y - 30) + shake, Vector2(tw, 28))
		Gt.pbox(ci, tag, Color("3a0d16", a), Gt.INK, 2, false, true)
		Gt.text(ci, tag.position + Vector2(12, 19), "BOSS", 11, Color(1, 0.75, 0.3, a), 0, true, 3, Gt.INK, true)
		Gt.title(ci, Vector2(tag.get_center().x + 14, tag.position.y + 21), _boss_name, 18, Color(1, 0.9, 0.9, a), 1)
	# 틀
	Gt.pbox(ci, r.grow(4.0), Color(Gt.INK, a), Gt.INK, 2, true, false)
	Gt.round_line(ci, r.grow(4.0), 8, Color(Gt.FRAME_GOLD, a), 2.0)
	var inner := r
	ci.draw_rect(inner, Color(0.12, 0.04, 0.07, a))
	var k_hp := clampf(_boss_hp / float(_boss_max), 0.0, 1.0)
	var k_lag := clampf(_boss_lag / float(_boss_max), k_hp, 1.0)
	# 하얀 잔상 칸
	if k_lag > k_hp:
		ci.draw_rect(Rect2(inner.position + Vector2(inner.size.x * k_hp, 0), Vector2(inner.size.x * (k_lag - k_hp), inner.size.y)), Color(1, 1, 1, 0.9 * a))
	# 빨간 칸(위는 밝게, 아래는 어둡게)
	if k_hp > 0.0:
		var hr := Rect2(inner.position, Vector2(inner.size.x * k_hp, inner.size.y))
		Gt.grad(ci, hr, Color(1.0, 0.36, 0.42, a), Color(0.72, 0.06, 0.16, a))
		ci.draw_rect(Rect2(hr.position, Vector2(hr.size.x, 3)), Color(1, 0.8, 0.8, 0.6 * a))
		if _boss_hit_t > 0.0:
			ci.draw_rect(hr, Color(1, 1, 1, 0.35 * _boss_hit_t / 0.18 * a))  # 맞은 순간 번쩍
	# 10칸 눈금
	for i in range(1, 10):
		var x := inner.position.x + inner.size.x * i / 10.0
		ci.draw_line(Vector2(x, inner.position.y + 2), Vector2(x, inner.end.y - 2), Color(0, 0, 0, 0.35 * a), 1.5)
	if slim:
		Gt.text(ci, Vector2(r.end.x, r.position.y - 6), "%d%%" % ceili(k_hp * 100.0), 13, Color(1, 0.88, 0.88, a), 2, true, 3, Gt.INK)
	else:
		Gt.text(ci, Vector2(ci.size.x / 2.0, r.position.y + 19) + shake, "%d / %d" % [maxi(_boss_hp, 0), _boss_max], 13, Color(1, 1, 1, a), 1, true, 3, Gt.INK)
		Gt.text(ci, Vector2(r.end.x, r.end.y + 16), "%d%%" % ceili(k_hp * 100.0), 12, Color(1, 0.85, 0.85, a), 2, true, 3, Gt.INK)


func _show_note(title: String, sub: String) -> void:
	_note = title
	_note_sub = sub
	_note_t = 0.0
	canvas.queue_redraw()


## 가운데 알림 띠(퀘스트 완료·보상 획득·보스 등장)
func _draw_note(ci: Control) -> void:
	var k := clampf(_note_t / 0.18, 0.0, 1.0)
	var a := k * clampf((NOTE_TIME - _note_t) / 0.4, 0.0, 1.0)
	var w := maxf(Gt.width(_note, 26), Gt.width(_note_sub, 15)) + 80.0
	var r := Rect2(Vector2((ci.size.x - w) / 2.0, ci.size.y * 0.4), Vector2(w, 78))
	r = Rect2(r.get_center() - r.size * (0.4 + 0.6 * k) / 2.0, r.size * (0.4 + 0.6 * k))
	Gt.pbox(ci, r, Color(Gt.PLUM, 0.94 * a), Gt.INK, 3, true, true)
	Gt.star(ci, Vector2(r.position.x + 22, r.position.y + 30), 9, Color(Gt.STAR, a))
	Gt.star(ci, Vector2(r.end.x - 22, r.position.y + 30), 9, Color(Gt.STAR, a))
	Gt.text(ci, Vector2(r.get_center().x, r.position.y + 38), _note, 26, Color(1, 0.95, 0.6, a), 1, true, 6, Color(Gt.INK, a))
	Gt.text(ci, Vector2(r.get_center().x, r.position.y + 62), _note_sub, 15, Color(1, 1, 1, a), 1, true, 4, Color(Gt.INK, a))


## 로비 버튼 아래 "지도" 버튼(M 키도 같음)
func _add_map_button() -> void:
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	col.offset_left = -64
	col.offset_top = 6
	col.offset_right = -6
	col.add_theme_constant_override(&"separation", 0)
	add_child(col)
	for spec: Array in [["gear", "설정", Color("8a7ae0"), open_pause], ["map", "지도", Color("4fb86b"), open_map], ["home", "로비", Color("4f8fe6"), _go_lobby]]:
		var b := IconButton.new()
		b.glyph = spec[0]
		b.label = spec[1]
		b.color = spec[2]
		b.pressed.connect(spec[3])
		col.add_child(b)
	# 가방(귀환서·물약·스킬 책)
	var bag := IconButton.new()
	bag.glyph = "bag"
	bag.label = "가방"
	bag.color = Color("c9853a")
	bag.pressed.connect(open_bag)
	col.add_child(bag)
	# 자동 사냥 켜기·끄기(켜면 주황, 끄면 회색)
	auto_button = IconButton.new()
	auto_button.glyph = "auto"
	auto_button.pressed.connect(_toggle_auto)
	col.add_child(auto_button)
	_refresh_auto()


func _toggle_auto() -> void:
	var on := not bool(Save.settings.get("auto", false))
	Save.settings["auto"] = on
	var p := get_tree().get_first_node_in_group(&"player")
	if p:
		p.set(&"auto", on)
	Game.sfx(&"pickup", -6.0, 0.0)
	_refresh_auto()


func _refresh_auto() -> void:
	var on := bool(Save.settings.get("auto", false))
	auto_button.color = Color("ff9a2e") if on else Color("8a8f9c")
	auto_button.label = "자동 켬" if on else "자동"
	auto_button.dot = on
	auto_button.queue_redraw()


func _go_lobby() -> void:
	get_tree().call_group(&"world", &"remember_place")
	get_tree().change_scene_to_file(MENU_SCENE)


## 일시정지·설정 창
func open_pause() -> void:
	if get_tree().paused:
		return
	add_child(PauseMenu.new())


func open_bag() -> void:
	if get_tree().paused:
		return
	add_child(ItemWindow.new())


func open_map() -> void:
	if get_tree().paused or find_children("*", "MapView", false, false).size() > 0:
		return
	add_child(MapView.new())


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"map"):
		open_map()
	elif e.is_action_pressed(&"ui_cancel") or (e is InputEventKey and (e as InputEventKey).pressed and not (e as InputEventKey).echo and (e as InputEventKey).keycode == KEY_P):
		open_pause()
	elif e is InputEventKey and (e as InputEventKey).pressed and not (e as InputEventKey).echo and (e as InputEventKey).keycode == KEY_I:
		open_bag()


func _comma(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "," + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return ("-" if n < 0 else "") + s + out
