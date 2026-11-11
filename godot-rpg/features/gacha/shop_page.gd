extends Control
## 상점 탭: 위쪽 "캐릭터 / 무기" 전환, 뽑기 배너(★5 셋), 등급 확률, 천장까지 남은 횟수, 1회·10회 소환 버튼.
## 보석을 내고 Gacha.pull(또는 pull_weapons) 결과를 GachaResult 연출로 보여 준다.

signal toast_requested(text: String)
signal pulled  # 뽑기 연출이 끝나면(로비가 카드·보석을 새로 그리도록)

const FEATURED: Array[StringName] = [&"maid1", &"fairy1", &"maid4"]
const FEATURED_WEAPONS: Array[StringName] = [&"flame_fang", &"holy_sword", &"fairy_wand"]
const MODES: Array = [["char", "캐릭터 소환"], ["weapon", "무기 소환"]]
const RARITY_COLORS := Gt.RARITY

var rng := RandomNumberGenerator.new()
var banner: Control
var mode_bar: Control
var note: Control
var mode := "char"
var one_button: GameButton
var ten_button: GameButton


func _ready() -> void:
	rng.randomize()
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.offset_left = 12
	col.offset_right = -12
	col.offset_top = 14
	col.offset_bottom = -8
	col.add_theme_constant_override(&"separation", 10)
	add_child(col)
	mode_bar = _draw_box(_paint_modes)
	mode_bar.custom_minimum_size.y = 46
	mode_bar.mouse_filter = Control.MOUSE_FILTER_STOP
	mode_bar.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and not mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			set_mode(MODES[clampi(int(mb.position.x / (mode_bar.size.x / 2.0)), 0, 1)][0]))
	col.add_child(mode_bar)
	banner = _draw_box(func(ci: Control) -> void:
		if mode == "weapon":
			_paint_weapon_banner(ci)
		else:
			_paint_banner(ci))
	banner.size_flags_vertical = Control.SIZE_EXPAND_FILL
	banner.clip_contents = true
	col.add_child(banner)
	var rates := _draw_box(_paint_rates)
	rates.custom_minimum_size.y = 40
	col.add_child(rates)
	var guarantee := _draw_box(_paint_guarantee)
	guarantee.custom_minimum_size.y = 22
	col.add_child(guarantee)
	var row := HBoxContainer.new()
	row.custom_minimum_size.y = 84
	row.add_theme_constant_override(&"separation", 14)
	one_button = _pull_button("1회 소환", Gacha.COST_ONE, Gt.Kind.BLUE)
	one_button.pressed.connect(_on_pull.bind(1, Gacha.COST_ONE))
	row.add_child(one_button)
	ten_button = _pull_button("10회 소환", Gacha.COST_TEN, Gt.Kind.YELLOW)
	ten_button.pressed.connect(_on_pull.bind(10, Gacha.COST_TEN))
	row.add_child(ten_button)
	col.add_child(row)
	note = _draw_box(func(ci: Control) -> void:
		var t := "중복 캐릭터는 별 +1 (최대 7성 · 무지개 별) · 7성이면 골드로 바꿔 드려요" if mode == "char" else "중복 무기는 재련 +1 (최대 +5, 공격력 +25%씩) · 다 차면 골드로"
		Gt.text(ci, Vector2(ci.size.x / 2.0, 16), t, 12, Gt.NAVY, 1, false))
	note.custom_minimum_size.y = 22
	col.add_child(note)
	Save.gems_changed.connect(func(_g: int) -> void: _refresh())
	_refresh()


func _process(_delta: float) -> void:
	if is_visible_in_tree():
		banner.queue_redraw()  # 반짝이·햇살·구름 움직임


## 캐릭터 / 무기 뽑기 전환
func set_mode(m: String) -> void:
	if m == mode:
		return
	mode = m
	Game.sfx(&"pickup", -10.0)
	mode_bar.queue_redraw()
	note.queue_redraw()
	_refresh()


func _refresh() -> void:
	for pair: Array in [[one_button, Gacha.COST_ONE], [ten_button, Gacha.COST_TEN]]:
		var b: GameButton = pair[0]
		var enough: bool = Save.gems >= int(pair[1])
		b.sublabel_color = Color.TRANSPARENT if enough else Color("ff8080")
		b.queue_redraw()
	banner.queue_redraw()


func _on_pull(count: int, cost: int) -> void:
	if not Save.spend_gems(cost):
		toast_requested.emit("보석이 부족해요")
		return
	var results := Gacha.pull_weapons(count, rng) if mode == "weapon" else Gacha.pull(count, rng)
	var overlay := GachaResult.new()
	overlay.results = results
	overlay.closed.connect(func() -> void:
		_refresh()
		pulled.emit())
	# 화면 전체를 덮도록 가장 바깥 Control(로비) 위에 붙인다
	var host: Control = self
	while host.get_parent() is Control:
		host = host.get_parent()
	host.add_child(overlay)


# ── 그리기 ──

## 캐릭터 배너: 분홍~라벤더 바탕 + 뒤쪽 부드러운 빛 + ★5 세 명 + 아래 정보판 + 둥근 금테
func _paint_banner(ci: Control) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 8))
	var w := r.size.x
	var h := r.size.y
	var t := Time.get_ticks_msec() / 1000.0
	Gt.round_grad(ci, r, 14, Color("ffe1ef"), Color("d8c6ff"))
	_soft_glow(ci, r.position + Vector2(w * 0.55, h * 0.38), h * 0.42, Color.WHITE, t)
	_twinkles(ci, r, t, Color.WHITE)
	# ★5 세 명(가운데가 크게, 양옆은 살짝 뒤로)
	var art_h := h * 0.9
	for k in [0, 2, 1]:
		var data := Save.character(FEATURED[k])
		var tex := data.portraits[0]
		var sc: float = (art_h if k == 1 else art_h * 0.78) / tex.get_height()
		var art := tex.get_size() * sc
		var cx: float = r.position.x + w * ([0.2, 0.55, 0.86][k] as float)
		var dst := Rect2(Vector2(cx - art.x / 2.0, r.end.y - art.y - (0.0 if k == 1 else 6.0)), art)
		ci.draw_texture_rect(tex, dst, false, Color.WHITE if k == 1 else Color(0.92, 0.88, 0.98))
	_info_plate(ci, r, "별빛 소환", "★5  리넨 · 플로라 · 코튼  확률 UP", Save.pity)
	_pickup_tag(ci, r, Gt.PINK)
	_banner_frame(ci, r)


## 무기 배너: 짙은 보라 바탕 + 마법진 + 빛나는 ★5 무기 셋(가운데 크게, 겹치지 않게) + 아래 정보판 + 둥근 금테
func _paint_weapon_banner(ci: Control) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 8))
	var w := r.size.x
	var h := r.size.y
	var t := Time.get_ticks_msec() / 1000.0
	Gt.round_grad(ci, r, 14, Color("2b1a4d"), Color("7a48b0"))
	_soft_glow(ci, r.position + Vector2(w * 0.5, h * 0.36), h * 0.4, Color("ffd36b"), t)
	_twinkles(ci, r, t, Color(1, 0.94, 0.75))
	Gt.island(ci, r.position + Vector2(w * 0.5, h * 0.6), w * 0.62, w * 0.16)
	var spots := [[0.18, 0.45, 0.24], [0.82, 0.45, 0.24], [0.5, 0.35, 0.36]]  # [x, y, 크기(폭 비율)]
	for k in 3:
		var sp: Array = spots[k]
		var c := r.position + Vector2(w * float(sp[0]), h * float(sp[1]) + sin(t * 2.0 + k) * 5.0)
		var size := w * float(sp[2])
		ci.draw_circle(c, size * 0.42, Color(1, 0.85, 0.5, 0.12))
		ci.draw_circle(c, size * 0.3, Color(1, 0.9, 0.6, 0.12))
		var wid: StringName = FEATURED_WEAPONS[[0, 2, 1][k]]
		Weapons.draw_icon(ci, wid, c, size)
	_info_plate(ci, r, "전설의 무기고", "★5  별빛 성검 · 홍염의 송곳니 · 요정의 지팡이", Save.pity_w)
	_pickup_tag(ci, r, Gt.YELLOW)
	_banner_frame(ci, r)


## 배너 뒤 부드러운 빛(겹친 원 + 아주 옅은 빛줄기)
func _soft_glow(ci: Control, c: Vector2, radius: float, color: Color, t: float) -> void:
	for i in 10:
		var a := i * TAU / 10.0 + t * 0.12
		ci.draw_colored_polygon(PackedVector2Array([c, c + Vector2.from_angle(a - 0.07) * radius * 2.4, c + Vector2.from_angle(a + 0.07) * radius * 2.4]), Color(color, 0.07))
	for i in 4:
		ci.draw_circle(c, radius * (1.0 - i * 0.2), Color(color, 0.08 + i * 0.04))


func _twinkles(ci: Control, r: Rect2, t: float, color: Color) -> void:
	for i in 9:
		var p := r.position + Vector2(fmod(i * 97.0 + 40.0, r.size.x - 40.0) + 20.0, fmod(i * 61.0, r.size.y * 0.6) + 50.0)
		var tw := 0.5 + 0.5 * sin(t * 2.0 + i * 1.3)
		Gt.sparkle(ci, p, 2.5 + 3.5 * tw, Color(color, 0.35 + 0.55 * tw))


func _pickup_tag(ci: Control, r: Rect2, color: Color) -> void:
	var tag := Rect2(r.position + Vector2(16, 16), Vector2(104, 30))
	Gt.tag(ci, tag, color)
	Gt.title(ci, Vector2(tag.get_center().x, tag.position.y + 21), "PICK UP!", 15, Color.WHITE, 1)


## 아래쪽 정보판: 반투명 자주 판 + 제목 + 소제목 + 천장 막대
func _info_plate(ci: Control, r: Rect2, title: String, sub: String, pity: int) -> void:
	var plate := Rect2(r.position.x + 12, r.end.y - 112, r.size.x - 24, 100)
	Gt.round_grad(ci, plate, 12, Color(Gt.PLUM, 0.78), Color(Gt.INK, 0.9))
	Gt.round_line(ci, plate, 12, Color(Gt.GOLD, 0.8), 1.5)
	Gt.title(ci, plate.position + Vector2(16, 40), title, 30, Color("fff3c4"))
	Gt.text(ci, plate.position + Vector2(18, 62), sub, 13, Color("ffd23a"), 0, true, 3, Gt.INK)
	Gt.text(ci, plate.position + Vector2(18, 88), "★5 확정까지 %d회" % (Gacha.PITY_5 - pity), 13, Color.WHITE, 0, true, 3, Gt.INK)
	Gt.bar(ci, Rect2(plate.position + Vector2(150, 76), Vector2(plate.size.x - 166, 14)), pity / float(Gacha.PITY_5), Gt.YELLOW)


## 둥근 금테(가운데는 비운 고리) + 네 모서리 보석
func _banner_frame(ci: Control, r: Rect2) -> void:
	Gt.round_line(ci, r.grow(-3.5), 12, Gt.GOLD_D, 8.0)
	Gt.round_line(ci, r.grow(-3.5), 12, Gt.GOLD, 5.0)
	Gt.round_line(ci, r.grow(-2.2), 13, Gt.GOLD_L, 1.5)
	Gt.round_line(ci, r, 15, Gt.INK, 2.0)
	Gt.round_line(ci, r.grow(-7.5), 9, Gt.INK, 1.5)
	Gt.corner_gems(ci, r.grow(-3), 7.0)


func _paint_modes(ci: Control) -> void:
	var w := ci.size.x / 2.0
	for i in 2:
		var active: bool = MODES[i][0] == mode
		var r := Rect2(Vector2(i * w + (0.0 if i == 0 else 4.0), 2), Vector2(w - 4.0, ci.size.y - 4))
		if active:
			Gt.button(ci, r, Gt.Kind.PINK if i == 1 else Gt.Kind.BLUE)
		else:
			Gt.pbox(ci, r, Color("e9e4da"), Gt.INK, 2, false, true)
		var c := Vector2(r.get_center().x, r.position.y + (r.size.y - Gt.PX * 2.0) / 2.0)
		var label: String = MODES[i][1]
		var tw := Gt.width(label, 17)
		if i == 0:
			Gt.icon(ci, &"heart", c - Vector2(tw / 2.0 + 14, 0), 20)
		else:
			Weapons.draw_icon(ci, &"holy_sword", c - Vector2(tw / 2.0 + 14, 0), 22)
		if active:
			Gt.title(ci, c + Vector2(10, 6), label, 17, Color.WHITE, 1)
		else:
			Gt.text(ci, c + Vector2(10, 6), label, 17, Gt.NAVY_SOFT, 1)


func _paint_rates(ci: Control) -> void:
	var chips := [[5, "3%"], [4, "17%"], [3, "80%"]]
	var gap := 8.0
	var w := (ci.size.x - gap * 2.0) / 3.0
	for i in chips.size():
		var rarity: int = chips[i][0]
		var r := Rect2(Vector2(i * (w + gap), 2), Vector2(w, ci.size.y - 6))
		Gt.pbox(ci, r, Gt.CREAM, Gt.INK, 2, true, true)
		ci.draw_rect(Rect2(r.position + Vector2(Gt.PX, Gt.PX * 2.0), Vector2(Gt.PX * 2.0, r.size.y - Gt.PX * 4.0)), RARITY_COLORS[rarity])
		for s in rarity:
			Gt.star(ci, r.position + Vector2(20 + s * 13, r.size.y / 2.0 + 1), 5.5)
		Gt.text(ci, Vector2(r.end.x - 12, r.position.y + r.size.y / 2.0 + 7), chips[i][1], 18, Gt.NAVY, 2)


func _paint_guarantee(ci: Control) -> void:
	# 10회 버튼 위에 붙는 분홍 꼬리표
	var text := "★4 이상 1개 확정"
	var w := Gt.width(text, 12) + 26
	var cx := ci.size.x * 0.75 + 7
	var r := Rect2(Vector2(cx - w / 2.0, 0), Vector2(w, 22))
	Gt.tag(ci, r, Gt.PINK)
	Gt.text(ci, Vector2(cx, 16), text, 12, Color.WHITE, 1)


func _pull_button(text: String, cost: int, kind: int) -> GameButton:
	var b := GameButton.new()
	b.label = text
	b.kind = kind
	b.font_size = 22
	b.sublabel = str(cost)
	b.sub_icon = GameButton.SubIcon.GEM
	b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	return b


func _draw_box(painter: Callable) -> Control:
	var box := DrawBox.new()
	box.painter = painter
	box.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return box
