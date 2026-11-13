extends Control
## 상점 탭: 위쪽 "캐릭터 / 무기" 전환, 뽑기 배너(★5 셋), 등급 확률, 천장까지 남은 횟수, 1회·10회 소환 버튼.
## 보석을 내고 Gacha.pull(또는 pull_weapons) 결과를 GachaResult 연출로 보여 준다.

signal toast_requested(text: String)
signal pulled  # 뽑기 연출이 끝나면(로비가 카드·보석을 새로 그리도록)

const FEATURED: Array[StringName] = [&"scarlet", &"devil2", &"elf4"]  # ★5 셋(돌아가며 가운데에 선다)
const ROTATE := 4.0  # 가운데가 바뀌는 간격(초)
## 가운데 캐릭터별 배너 색: [위, 아래, 빛]
const HERO_TINT := {
	&"scarlet": [Color("1e0509"), Color("5e1220"), Color("ff8a8a")],
	&"devil2": [Color("12061c"), Color("44104e"), Color("e08aff")],
	&"elf4": [Color("04140e"), Color("17442c"), Color("9affc4")],
}
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
		var t := "중복 캐릭터는 별 조각으로 · 조각을 모아 아바타에서 승급(최대 7성) · 7성이면 골드로" if mode == "char" else "중복 무기는 재련 +1 (최대 +5, 공격력 +25%씩) · 다 차면 골드로"
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

## 캐릭터 배너: 밤하늘 남색~보라 + 비스듬한 빛줄기 + 별가루. 가운데 주인공은 뒤에서 빛을 받고, 양옆은 어둑한 실루엣.
## 아래는 검은 그라데이션 위에 큰 제목과 가는 금선(시네마 포스터 느낌)
func _paint_banner(ci: Control) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 8))
	var w := r.size.x
	var h := r.size.y
	var t := Time.get_ticks_msec() / 1000.0
	# ★5 셋이 돌아가며 가운데에 선다(ROTATE초마다, 바뀔 때 0.6초 동안 서로 겹쳐 사라지고 나타남). 배경색도 그 캐릭터 색으로
	var turn := int(t / ROTATE)
	var fade := clampf((fmod(t, ROTATE) - (ROTATE - 0.6)) / 0.6, 0.0, 1.0)
	var ta: Array = HERO_TINT.get(FEATURED[turn % 3], [Color("0b1026"), Color("2c1650"), Color("b9a8ff")])
	var tb: Array = HERO_TINT.get(FEATURED[(turn + 1) % 3], ta)
	var top := (ta[0] as Color).lerp(tb[0], fade)
	var bottom := (ta[1] as Color).lerp(tb[1], fade)
	var glow := (ta[2] as Color).lerp(tb[2], fade)
	Gt.round_grad(ci, r, 14, top, bottom)
	_light_shafts(ci, r, t, glow)
	_star_dust(ci, r, t, glow.lerp(Color.WHITE, 0.5))
	var hero_c := r.position + Vector2(w * 0.55, h * 0.42)
	for i in 5:  # 주인공 뒤 둥근 역광(캐릭터 색)
		ci.draw_circle(hero_c, h * (0.42 - i * 0.06), Color(glow, 0.05 + i * 0.03))
	var art_h := h * 0.92
	for slot in [0, 2]:  # 양옆: 어둑한 실루엣
		var sid: StringName = FEATURED[(turn + (1 if slot == 0 else 2)) % 3]
		_banner_art(ci, r, sid, slot, art_h * 0.8, Color(bottom.lightened(0.25), 0.95))
	var hero: StringName = FEATURED[turn % 3]
	var next: StringName = FEATURED[(turn + 1) % 3]
	_banner_art(ci, r, hero, 1, art_h, Color(1, 1, 1, 1.0 - fade), true)
	if fade > 0.0:
		_banner_art(ci, r, next, 1, art_h, Color(1, 1, 1, fade), true)
	_cinema_plate(ci, r, "별빛 소환", "STARLIGHT SUMMON", "★5  %s 확률 UP" % " · ".join(FEATURED.map(func(id: StringName) -> String: return Save.character(id).display_name)), Save.pity, Color("b9a8ff"))
	_pickup_tag(ci, r, Color("e8456b"))
	_slim_frame(ci, r)


## 무기 배너: 검은 무기고 + 진홍빛 바닥 + 떠오르는 불씨. 가운데 무기가 떠서 빛나고, 양옆 무기는 어둠 속 실루엣.
func _paint_weapon_banner(ci: Control) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 8))
	var w := r.size.x
	var h := r.size.y
	var t := Time.get_ticks_msec() / 1000.0
	Gt.round_grad(ci, r, 14, Color("07070c"), Color("3a0d18"))
	var c := r.position + Vector2(w * 0.5, h * 0.4 + sin(t * 1.6) * 4.0)
	for ring in 3:  # 뒤에서 천천히 도는 룬 고리
		var rad := h * (0.2 + ring * 0.08)
		var a0 := t * (0.3 - ring * 0.15)
		ci.draw_arc(c, rad, a0, a0 + TAU * 0.85, 64, Color(1, 0.55, 0.35, 0.18 - ring * 0.04), 2.0)
	for i in 12:
		var a := i * TAU / 12.0 + t * 0.3
		ci.draw_circle(c + Vector2.from_angle(a) * h * 0.28, 2.0, Color(1, 0.7, 0.4, 0.4))
	for k in 2:  # 교차 빛줄기
		var d := Vector2.from_angle(PI / 4.0 + k * PI / 2.0)
		var ln := h * (0.55 + 0.05 * sin(t * 3.0 + k))
		ci.draw_colored_polygon(PackedVector2Array([c - d * ln, c + d.orthogonal() * 3.0, c + d * ln, c - d.orthogonal() * 3.0]), Color(1, 0.85, 0.6, 0.35))
	for i in 5:
		ci.draw_circle(c, h * (0.22 - i * 0.035), Color(1, 0.6, 0.3, 0.05 + i * 0.03))
	_embers(ci, r, t)
	for k in 2:  # 양옆 무기: 어둠 속 실루엣
		var sc := r.position + Vector2(w * (0.17 if k == 0 else 0.83), h * 0.46 + sin(t * 1.3 + k * 2.0) * 3.0)
		ci.draw_set_transform(sc, (-0.5 if k == 0 else 0.5), Vector2.ONE)
		Weapons.draw_icon(ci, FEATURED_WEAPONS[0 if k == 0 else 2], Vector2.ZERO, w * 0.2, Color(0.35, 0.18, 0.22, 0.9))
		ci.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	Weapons.draw_icon(ci, FEATURED_WEAPONS[1], c, w * 0.46)  # 가운데: 크게
	_cinema_plate(ci, r, "전설의 무기고", "LEGEND ARMORY", "★5  별빛 성검 · 홍염의 송곳니 · 요정의 지팡이", Save.pity_w, Color("ff9a5a"))
	_pickup_tag(ci, r, Color("ffb648"))
	_slim_frame(ci, r)


## 배너 캐릭터 그림 하나: slot 0 왼쪽 · 1 가운데 · 2 오른쪽. hero면 뒤에 테두리 빛
func _banner_art(ci: Control, r: Rect2, id: StringName, slot: int, height: float, tint: Color, hero := false) -> void:
	var tex := Save.character(id).portraits[0]
	var art := tex.get_size() * (height / tex.get_height())
	var cx: float = r.position.x + r.size.x * ([0.17, 0.55, 0.9][slot] as float)
	var dst := Rect2(Vector2(cx - art.x / 2.0, r.end.y - art.y - (0.0 if slot == 1 else 10.0)), art)
	if hero:
		ci.draw_texture_rect(tex, Rect2(dst.position + Vector2(-3, -2), dst.size + Vector2(6, 4)), false, Color(0.8, 0.75, 1.0, 0.35 * tint.a))
	ci.draw_texture_rect(tex, dst, false, tint)


## 비스듬히 내려오는 빛줄기(천천히 흔들림)
func _light_shafts(ci: Control, r: Rect2, t: float, color: Color) -> void:
	for i in 5:
		var x := r.position.x + r.size.x * (0.1 + i * 0.2) + sin(t * 0.4 + i) * 10.0
		var wtop := 10.0 + (i % 2) * 14.0
		ci.draw_colored_polygon(PackedVector2Array([Vector2(x, r.position.y), Vector2(x + wtop, r.position.y),
			Vector2(x + wtop + r.size.y * 0.45, r.end.y), Vector2(x + r.size.y * 0.35, r.end.y)]), Color(color, 0.05 + 0.03 * sin(t + i)))


## 반짝이는 별가루
func _star_dust(ci: Control, r: Rect2, t: float, color: Color) -> void:
	for i in 40:
		var p := r.position + Vector2(fmod(i * 73.7, r.size.x), fmod(i * 41.3 + t * (4.0 + i % 5), r.size.y * 0.75))
		var tw := 0.5 + 0.5 * sin(t * 2.5 + i * 1.7)
		ci.draw_rect(Rect2(p, Vector2(2, 2) if i % 6 == 0 else Vector2(1, 1)), Color(color, 0.25 + 0.6 * tw))


## 아래에서 떠오르는 불씨
func _embers(ci: Control, r: Rect2, t: float) -> void:
	for i in 34:
		var sp := 18.0 + fmod(i * 7.3, 26.0)
		var y := r.end.y - fmod(t * sp + i * 37.0, r.size.y)
		var x := r.position.x + fmod(i * 59.0, r.size.x) + sin(t * 1.5 + i) * 8.0
		var life := (r.end.y - y) / r.size.y
		ci.draw_circle(Vector2(x, y), 1.6 if i % 3 else 2.4, Color(1, 0.55 + 0.3 * (1.0 - life), 0.25, 0.85 * (1.0 - life)))


## 아래 정보판(시네마 포스터식): 검은 그라데이션 + 영문 부제 + 큰 제목 + 가는 금선 + 천장 막대
func _cinema_plate(ci: Control, r: Rect2, title: String, en: String, sub: String, pity: int, accent: Color) -> void:
	var fade := Rect2(r.position.x, r.end.y - 150, r.size.x, 150)
	Gt.round_grad(ci, fade, 12, Color(0, 0, 0, 0.0), Color(0, 0, 0, 0.88))
	var x := r.position.x + 22
	var y := r.end.y - 112
	Gt.text(ci, Vector2(x, y), en, 12, Color(accent, 0.9), 0, true, 0, Gt.INK, true)
	Gt.title(ci, Vector2(x, y + 36), title, 32, Color("fff6e0"))
	ci.draw_line(Vector2(x, y + 46), Vector2(r.end.x - 22, y + 46), Color(Gt.GOLD, 0.7), 1.0)
	ci.draw_line(Vector2(x, y + 46), Vector2(x + 90, y + 46), accent, 3.0)
	Gt.text(ci, Vector2(x, y + 66), sub, 13, Color("ffd88a"), 0, true, 3, Color(0, 0, 0, 0.8))
	Gt.text(ci, Vector2(x, y + 92), "★5 확정까지 %d회" % (Gacha.PITY_5 - pity), 12, Color(1, 1, 1, 0.85), 0, true, 3, Color(0, 0, 0, 0.8))
	var bar := Rect2(Vector2(x + 128, y + 82), Vector2(r.end.x - 22 - (x + 128), 8))
	ci.draw_rect(bar, Color(1, 1, 1, 0.12))
	ci.draw_rect(Rect2(bar.position, Vector2(bar.size.x * clampf(pity / float(Gacha.PITY_5), 0.0, 1.0), bar.size.y)), accent)


## 가는 금테(모서리 점만 살짝 강조)
func _slim_frame(ci: Control, r: Rect2) -> void:
	Gt.round_line(ci, r, 15, Gt.INK, 2.0)
	Gt.round_line(ci, r.grow(-3), 12, Color(Gt.GOLD, 0.85), 1.5)
	for p: Vector2 in [r.position + Vector2(10, 10), Vector2(r.end.x - 10, r.position.y + 10), Vector2(r.position.x + 10, r.end.y - 10), r.end - Vector2(10, 10)]:
		ci.draw_circle(p, 2.5, Gt.GOLD_L)


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
	var tag := Rect2(r.position + Vector2(16, 16), Vector2(96, 24))
	ci.draw_rect(tag, Color(0, 0, 0, 0.65))
	ci.draw_rect(Rect2(tag.position, Vector2(4, tag.size.y)), color)
	ci.draw_rect(tag, Color(color, 0.8), false, 1.0)
	Gt.text(ci, Vector2(tag.position.x + 52, tag.position.y + 17), "PICK UP", 13, Color.WHITE, 1, true, 0, Gt.INK, true)


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
	var chips := [[5, "1%"], [4, "9%"], [3, "90%"]]
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
