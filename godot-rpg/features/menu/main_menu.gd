extends Control
## 로비: 위쪽 바 + 페이지(아바타 / 상점) + 하단 탭 바.
## 아바타 페이지: 캐릭터 큰 일러스트(뒤에 햇살, 발밑 풀밭), 장비 칸, 캐릭터 카드 목록, 레벨·공격력·체력·레벨 업, 별 효과.
## 상점 페이지는 features/gacha/shop_page.gd.
## 가디언 테일즈풍(하늘·도트 테두리·크림 패널). 그림은 Gt(gt.gd)로 직접 그린다.

const WORLD_SCENE := "res://features/world/village.tscn"  # 모험은 마을에서 시작
const ShopPage := preload("res://features/gacha/shop_page.gd")
const QuestPage := preload("res://features/menu/quest_page.gd")
## 장비 칸: 왼쪽 무기·옷·신발, 오른쪽 펫·목걸이·반지
const GEAR_SLOTS: Array[String] = ["무기", "옷", "신발", "펫", "목걸이", "반지"]
## 칸 번호 → 장비 부위(무기 0·펫 3은 따로)
const GEAR_KEYS := {1: "armor", 2: "boots", 4: "neck", 5: "ring"}
const PET_SLOT := 3
const GEAR_MARGIN := 12.0
const GEAR_GAP := 10
const PLATE_HEIGHT := 150.0  # 아래 이름표(별·이름·속성)가 차지하는 높이
## 하단 탭: [한글, 영문]
const TABS: Array = [["상점", "SHOP"], ["아바타", "AVATAR"], ["모험", "ADVENTURE"], ["퀘스트", "QUEST"], ["도감", "DEX"]]

var viewing: StringName
var expression := 0
var t := 0.0
var sky_top := Color("74cbff")  # 지금 보는 캐릭터 속성 색으로 부드럽게 바뀐다
var sky_bottom := Color("d9f3ff")

var bg_box: DrawBox
var top_bar: DrawBox
var backdrop: DrawBox
var portrait: TextureRect
var plate: DrawBox
var action_button: GameButton
var gear_slots: Array[Control] = []
var cards: Dictionary[StringName, DrawBox] = {}
var roster_strip: DrawBox
var stats_bar: DrawBox
var skill_box: DrawBox
var aura_rect: TextureRect
var skin_dot: DrawBox
## 별 등급 → 아우라 색: 별 색과 같다(Gt.STAR_BY_RARITY). 아우라는 5성부터(5성 보라 · 6성 파랑 · 7성 빨강)
const AURA_COLORS := Gt.STAR_BY_RARITY
const AURA_FROM := 5
var promote_box: DrawBox
var bg_fx: DrawBox
var _frame := 0
var _drawn_top := Color.BLACK
var _drawn_bottom := Color.BLACK
var promote_button: GameButton
var skill_button: GameButton
var level_button: GameButton
var passive_header: DrawBox
var passive_box: VBoxContainer
var toast: DrawBox
var _toast_text := ""
var avatar_page: VBoxContainer
var shop_page: Control
var quest_page: Control
var tab_bar: DrawBox
var current_tab := "아바타"


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_build()
	Save.gold_changed.connect(_on_gold_changed)
	Save.gems_changed.connect(func(_g: int) -> void: top_bar.queue_redraw())
	Save.equip_changed.connect(_refresh_all)
	viewing = Save.selected
	var sky: Array = Gt.ELEMENT_SKY[Save.character(viewing).element]
	sky_top = sky[0]
	sky_bottom = sky[1]
	_refresh_all()
	_update_aura()  # 첫 화면부터 별 색 아우라(잠깐 다른 색이 비치지 않게)
	IdleReward.try_show.call_deferred(self)  # 꺼 둔 사이 쌓인 방치 보상
	if Save.persist and not Save.settings.has("nick"):
		_open_intro.call_deferred(not Save.fresh)  # 처음: 이름 → 동료 고르기(예전 세이브는 이름만)


func _process(delta: float) -> void:
	t += delta
	var sky: Array = Gt.ELEMENT_SKY[Save.character(viewing).element]
	var k := minf(1.0, delta * 6.0)
	sky_top = sky_top.lerp(sky[0], k)
	sky_bottom = sky_bottom.lerp(sky[1], k)
	# 휴대폰에서 버벅이지 않게: 무늬 배경은 색이 바뀔 때만, 카드는 4프레임에 한 번만 다시 그린다
	_frame += 1
	if not sky_top.is_equal_approx(_drawn_top) or not sky_bottom.is_equal_approx(_drawn_bottom):
		_drawn_top = sky_top
		_drawn_bottom = sky_bottom
		bg_box.queue_redraw()
	bg_fx.queue_redraw()  # 떠다니는 빛(가벼움)
	if avatar_page.visible:
		backdrop.queue_redraw()  # 햇살이 천천히 돈다
		_update_aura()
		if _frame % 4 == 0:
			for c: Control in cards.values():
				c.queue_redraw()  # 4·5성 카드 빛이 숨 쉬듯


# ── 화면 만들기 ──

func _build() -> void:
	bg_box = _box(func(ci: Control) -> void: Gt.background(ci, Rect2(Vector2.ZERO, ci.size), t, sky_top, sky_bottom), 0)
	bg_box.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg_box)
	bg_fx = _box(func(ci: Control) -> void: Gt.background_fx(ci, Rect2(Vector2.ZERO, ci.size), t), 0)
	bg_fx.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg_fx.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(bg_fx)
	var col := VBoxContainer.new()
	col.set_anchors_preset(Control.PRESET_FULL_RECT)
	col.add_theme_constant_override(&"separation", 0)
	add_child(col)

	var pages := Control.new()
	pages.size_flags_vertical = Control.SIZE_EXPAND_FILL
	avatar_page = VBoxContainer.new()
	avatar_page.set_anchors_preset(Control.PRESET_FULL_RECT)
	avatar_page.add_theme_constant_override(&"separation", 0)
	pages.add_child(avatar_page)
	avatar_page.add_child(_build_portrait_area())
	avatar_page.add_child(_build_roster())
	stats_bar = _box(_paint_stats, 96)
	_build_level_button()
	avatar_page.add_child(_pad(stats_bar, 10, 8, 10, 2))
	skill_box = _box(_paint_skill, 62)
	skill_box.mouse_filter = Control.MOUSE_FILTER_STOP
	skill_box.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			if not Save.is_owned(viewing):
				_show_toast("미보유 캐릭터예요")
				return
			_bounce(skill_box, 1.03)
			_open_skills())
	# 승급은 레벨 칸 오른쪽 버튼(레벨은 몬스터 경험치로 오르니 레벨 업 버튼 자리를 쓴다)
	promote_box = _box(_paint_promote, 0)  # 예전 승급 줄(화면엔 안 넣음)
	promote_button = GameButton.new()
	promote_button.label = "승급"
	promote_button.kind = Gt.Kind.YELLOW
	promote_button.font_size = 20
	promote_button.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	promote_button.offset_left = -150
	promote_button.offset_top = 10
	promote_button.offset_right = -14
	promote_button.offset_bottom = -50
	promote_button.font_size = 15
	promote_button.pressed.connect(_on_promote_pressed)
	stats_bar.add_child(promote_button)
	skill_button = GameButton.new()  # 스킬 트리(승급 버튼 바로 아래)
	skill_button.label = "스킬 트리"
	skill_button.kind = Gt.Kind.BLUE
	skill_button.font_size = 15
	skill_button.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	skill_button.offset_left = -150
	skill_button.offset_top = 48
	skill_button.offset_right = -14
	skill_button.offset_bottom = -8
	skill_button.pressed.connect(_open_skills)
	stats_bar.add_child(skill_button)
	level_button.visible = false
	var passives_pad := _pad(_build_passives(), 10, 4, 10, 6)
	passives_pad.size_flags_vertical = Control.SIZE_EXPAND_FILL
	avatar_page.add_child(passives_pad)
	shop_page = ShopPage.new()
	shop_page.set_anchors_preset(Control.PRESET_FULL_RECT)
	shop_page.visible = false
	shop_page.toast_requested.connect(_show_toast)
	shop_page.pulled.connect(_refresh_all)
	pages.add_child(shop_page)
	quest_page = QuestPage.new()
	quest_page.set_anchors_preset(Control.PRESET_FULL_RECT)
	quest_page.visible = false
	quest_page.toast_requested.connect(_show_toast)
	pages.add_child(quest_page)
	Quests.changed.connect(func() -> void:
		if is_instance_valid(tab_bar):
			tab_bar.queue_redraw())

	top_bar = _box(_paint_top_bar, 64)
	top_bar.mouse_filter = Control.MOUSE_FILTER_PASS
	top_bar.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT and mb.position.x < 220.0:
			_open_intro(true))  # 왼쪽 위 이름표를 누르면 이름 바꾸기
	col.add_child(top_bar)
	col.add_child(pages)
	col.add_child(_build_tab_bar())
	top_bar.z_index = 1  # 아래로 번지는 그림자가 페이지 위에 보이게

	toast = _box(_paint_toast, 0)
	toast.set_anchors_preset(Control.PRESET_FULL_RECT)
	toast.mouse_filter = Control.MOUSE_FILTER_IGNORE
	toast.modulate.a = 0.0
	toast.z_index = 10
	add_child(toast)


func _build_portrait_area() -> Control:
	backdrop = _box(_paint_backdrop, 300)
	backdrop.size_flags_vertical = Control.SIZE_EXPAND_FILL
	backdrop.clip_contents = true
	portrait = TextureRect.new()
	portrait.set_anchors_preset(Control.PRESET_FULL_RECT)
	portrait.offset_top = 6
	portrait.offset_bottom = 10
	portrait.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	portrait.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	portrait.gui_input.connect(_on_portrait_input)
	portrait.resized.connect(func() -> void: portrait.pivot_offset = portrait.size / 2.0)
	var skin_mat := ShaderMaterial.new()
	skin_mat.shader = preload("res://shared/skin_flash.gdshader")
	portrait.material = skin_mat  # 7성 스킨 색
	# 별 등급 아우라: 일러스트 윤곽을 따라 번지는 빛(별 색과 같다, 5성부터: 5성 보라 · 6성 파랑 · 7성 빨강)
	aura_rect = TextureRect.new()
	aura_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	aura_rect.offset_top = 6
	aura_rect.offset_bottom = 10
	aura_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	aura_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	aura_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mat := ShaderMaterial.new()
	mat.shader = preload("res://features/menu/aura_glow.gdshader")
	aura_rect.material = mat
	backdrop.add_child(aura_rect)
	backdrop.add_child(portrait)
	plate = _box(_paint_plate, 0)
	plate.set_anchors_preset(Control.PRESET_FULL_RECT)
	plate.mouse_filter = Control.MOUSE_FILTER_IGNORE
	backdrop.add_child(plate)
	action_button = GameButton.new()
	action_button.label = "출전하기"
	action_button.kind = Gt.Kind.YELLOW
	action_button.font_size = 21
	action_button.set_anchors_preset(Control.PRESET_BOTTOM_RIGHT)
	action_button.offset_left = -172
	action_button.offset_top = -68
	action_button.offset_right = -12
	action_button.offset_bottom = -12
	action_button.pressed.connect(_on_select_pressed)
	backdrop.add_child(action_button)
	_build_gear_slots()
	# 스킨 켜기·끄기: 공격 방식 꼬리표 옆 작은 동그라미(미즈하·스칼렛만, 7성이면 열림)
	skin_dot = _box(_paint_skin_dot, 0)
	skin_dot.size = Vector2(34, 34)
	skin_dot.mouse_filter = Control.MOUSE_FILTER_STOP
	skin_dot.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_on_skin_pressed())
	backdrop.add_child(skin_dot)
	backdrop.resized.connect(func() -> void: skin_dot.position = _skin_dot_pos())
	return backdrop


## 장비 칸 4개: 왼쪽 위 무기·옷, 오른쪽 위 장신구·신발. 장비 시스템이 생기면 등급 색·레벨을 채운다.
func _build_gear_slots() -> void:
	for i in GEAR_SLOTS.size():
		var slot := _box(_paint_gear_slot.bind(i), 0)
		gear_slots.append(slot)
		slot.mouse_filter = Control.MOUSE_FILTER_STOP
		slot.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
				_bounce(slot, 1.08)
				if i == 0:
					_open_weapon_picker()
				elif i == PET_SLOT:
					var pp := PetPicker.new()
					pp.closed.connect(_refresh_all)
					add_child(pp)
				else:
					_open_gear_picker(GEAR_KEYS[i]))
		slot.resized.connect(func() -> void: slot.pivot_offset = slot.size / 2.0)
		if i == PET_SLOT:
			slot.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST  # 펫 도트가 뭉개지지 않게
		backdrop.add_child(slot)
	backdrop.resized.connect(_layout_gear)


## 장비 칸 6개를 ┌ ┐ 모양으로: 왼쪽 위 [무기][신발], 그 아래 [옷] / 오른쪽 위 [반지][펫], 그 아래 [목걸이].
## 두 줄만 쓰니 아래 이름표(별·이름·전투력)를 가리지 않는다. 칸 크기는 화면 높이에 맞춘다.
func _layout_gear() -> void:
	var avail := backdrop.size.y - GEAR_MARGIN - PLATE_HEIGHT
	var s := clampf((avail - GEAR_GAP) / 2.0, 52.0, 74.0)
	var w := backdrop.size.x
	var m := GEAR_MARGIN
	var step := s + GEAR_GAP
	# 칸 번호: 0 무기 · 1 옷 · 2 신발 · 3 펫 · 4 목걸이 · 5 반지
	var spots := {
		0: Vector2(m, m), 2: Vector2(m + step, m), 1: Vector2(m, m + step),
		3: Vector2(w - m - s, m), 5: Vector2(w - m - s - step, m), 4: Vector2(w - m - s, m + step),
	}
	for i in gear_slots.size():
		var slot := gear_slots[i]
		slot.custom_minimum_size = Vector2(s, s)
		slot.size = Vector2(s, s)
		slot.position = spots[i]


func _build_roster() -> Control:
	roster_strip = _box(_paint_roster_strip, 164)
	var scroll := ScrollContainer.new()
	scroll.set_anchors_preset(Control.PRESET_FULL_RECT)
	scroll.offset_top = 34
	scroll.offset_left = 11
	scroll.offset_right = -11
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	var row := HBoxContainer.new()
	row.add_theme_constant_override(&"separation", 6)
	row.add_child(_spacer(8))
	for id in Save.ROSTER:
		var card := _box(_paint_card.bind(id), 0)
		card.custom_minimum_size = Vector2(98, 128)
		card.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		card.mouse_filter = Control.MOUSE_FILTER_PASS
		var press := [Vector2.ZERO]
		card.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.button_index == MOUSE_BUTTON_LEFT:
				if mb.pressed:
					press[0] = mb.position
				elif mb.position.distance_to(press[0]) < 12.0:
					_preview(id))
		cards[id] = card
		row.add_child(card)
	row.add_child(_spacer(8))
	scroll.add_child(row)
	roster_strip.add_child(scroll)
	return roster_strip


func _build_level_button() -> void:
	level_button = GameButton.new()
	level_button.kind = Gt.Kind.YELLOW
	level_button.font_size = 20
	level_button.sub_icon = GameButton.SubIcon.COIN
	level_button.set_anchors_preset(Control.PRESET_RIGHT_WIDE)
	level_button.offset_left = -150
	level_button.offset_top = 14
	level_button.offset_right = -14
	level_button.offset_bottom = -10
	level_button.pressed.connect(_on_level_up_pressed)
	stats_bar.add_child(level_button)


func _open_skills() -> void:
	if not Save.is_owned(viewing):
		_show_toast("미보유 캐릭터예요")
		return
	var sw := SkillWindow.new()
	sw.char_id = viewing
	sw.closed.connect(_refresh_all)
	add_child(sw)


func _build_passives() -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override(&"separation", 4)
	v.size_flags_vertical = Control.SIZE_EXPAND_FILL
	passive_header = _box(_paint_passive_header, 32)
	v.add_child(passive_header)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size.y = 160
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	passive_box = VBoxContainer.new()
	passive_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	passive_box.add_theme_constant_override(&"separation", 4)
	scroll.add_child(passive_box)
	v.add_child(scroll)
	return v


func _build_tab_bar() -> Control:
	tab_bar = _box(_paint_tab_bar, 84)
	tab_bar.mouse_filter = Control.MOUSE_FILTER_STOP
	tab_bar.gui_input.connect(func(e: InputEvent) -> void:
		var mb := e as InputEventMouseButton
		if mb and not mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
			_on_tab_pressed(clampi(int(mb.position.x / (tab_bar.size.x / TABS.size())), 0, TABS.size() - 1)))
	return tab_bar


func _on_tab_pressed(i: int) -> void:
	match i:
		0:
			_switch_tab("상점")
		1:
			_switch_tab("아바타")
		2:
			_on_adventure_pressed()
		3:
			_switch_tab("퀘스트")
		_:
			_open_dex()


## 시작 화면(이름 정하기 · 동료 고르기). rename이면 이름만
func _open_intro(rename := false) -> void:
	var intro := IntroScreen.new()
	intro.rename_only = rename
	intro.finished.connect(func() -> void:
		viewing = Save.selected
		_refresh_all())
	add_child(intro)


# ── 그리기: 위쪽 바·탭 바 ──

func _paint_top_bar(ci: Control) -> void:
	var w := ci.size.x
	Gt.grad(ci, Rect2(0, 0, w, ci.size.y), Color(Gt.INK, 0.28), Color(Gt.INK, 0.0))
	# 왼쪽: 지금 탭(파란 도트 칸 + 아이콘 + 이름)
	var tab_i := _tab_index(current_tab)
	var icon_box := Rect2(10, 10, 46, 46)
	Gt.pbox(ci, icon_box, Gt.BLUE)
	_tab_icon(ci, tab_i, icon_box.get_center(), 30)
	# 용사 이름(누르면 바꾼다) + 지금 탭
	Gt.title(ci, Vector2(64, 36), Save.nickname(), 22)
	Gt.text(ci, Vector2(66, 52), "%s · %s" % [TABS[tab_i][0], TABS[tab_i][1]], 11, Color.WHITE, 0, true, 4, Gt.INK, true)
	# 오른쪽: 보석·골드
	_currency(ci, Rect2(w - 254, 16, 116, 32), Save.gems, true)
	_currency(ci, Rect2(w - 128, 16, 116, 32), Save.gold, false)


func _currency(ci: Control, r: Rect2, amount: int, is_gem: bool) -> void:
	Gt.pill(ci, r)
	if is_gem:
		Gt.gem(ci, Vector2(r.position.x + 4, r.get_center().y), 13)
	else:
		Gt.coin(ci, Vector2(r.position.x + 4, r.get_center().y), 12)
	Gt.title(ci, Vector2(r.end.x - 30, r.position.y + 23), _comma(amount), 16, Color.WHITE, 2)
	var plus := Rect2(r.end.x - 26, r.position.y + 5, 21, 22)
	Gt.tag(ci, plus, Gt.GREEN)
	ci.draw_rect(Rect2(plus.get_center() - Vector2(5, 1.5), Vector2(10, 3)), Color.WHITE)
	ci.draw_rect(Rect2(plus.get_center() - Vector2(1.5, 5), Vector2(3, 10)), Color.WHITE)


func _paint_tab_bar(ci: Control) -> void:
	var w := ci.size.x
	var h := ci.size.y
	var top := 14.0
	# 자주색 바탕 + 위쪽 금테 띠 + 은은한 다마스크
	Gt.grad(ci, Rect2(0, top, w, h - top), Color("4b2c5c"), Color("2a1836"))
	for i in 6:
		Gt.damask(ci, Vector2(i * 96.0 + 48.0, top + (h - top) / 2.0), 22.0, Color(1, 1, 1, 0.05))
	Gt.gold_frame(ci, Rect2(-6, top - 2, w + 12, 9), 3, 3.0)
	var cw := w / TABS.size()
	for i in TABS.size():
		var cell := Rect2(i * cw, top + 4, cw, h - top - 4)
		var active: bool = TABS[i][0] == current_tab
		var body := Rect2(cell.position + Vector2(7, 6), cell.size - Vector2(14, 10))
		if active:
			body = Rect2(body.position - Vector2(0, top + 4), body.size + Vector2(0, top + 4))  # 위로 솟은 선택 탭
			Gt.button(ci, body, Gt.Kind.PINK)
		elif i == 2:  # 모험은 늘 눈에 띄는 금빛 버튼
			Gt.button(ci, body, Gt.Kind.YELLOW)
		else:
			Gt.pbox(ci, body, Gt.PLUM.lightened(0.08), Gt.INK, 3, false, true)
		var c := Vector2(cell.get_center().x, body.position.y + body.size.y * 0.4)
		_tab_icon(ci, i, c, 34.0 if active else 30.0)
		Gt.title(ci, Vector2(cell.get_center().x, body.end.y - 13), TABS[i][0], 14, Color.WHITE if active or i == 2 else Color("e6d9f0"), 1)
		if i == 3 and (Quests.has_reward() or Achievements.claimable() > 0 or Mail.unread() > 0):
			# 받을 보상이 있으면 빨간 점
			var dot := Vector2(body.end.x - 10, body.position.y + 10)
			ci.draw_circle(dot, 9.0, Gt.INK)
			ci.draw_circle(dot, 7.0, Color("ff3b4d"))
			Gt.text(ci, dot + Vector2(0, 5), "!", 12, Color.WHITE, 1)


## 도감은 페이지 대신 창으로 연다(지금 보던 탭은 그대로)
func _open_dex() -> void:
	var w := DexWindow.new()
	w.closed.connect(_refresh_all)
	add_child(w)


func _tab_index(name: String) -> int:
	for i in TABS.size():
		if TABS[i][0] == name:
			return i
	return 1


## 탭 아이콘(닌자 어드벤처 도트 아이콘, 아바타는 출전 캐릭터 얼굴)
func _tab_icon(ci: CanvasItem, i: int, c: Vector2, s: float) -> void:
	match i:
		0:
			Gt.icon(ci, &"moneybag", c, s)
		1:
			var data := Save.current()
			var box := Rect2(c - Vector2(s, s) * 0.5, Vector2(s, s))
			Gt.pbox(ci, box.grow(3), Color.WHITE, Gt.INK, 1, false, false)
			var cc := data.card_crop
			ci.draw_texture_rect_region(data.portraits[0], box, Rect2(cc.position + Vector2(cc.size.x * 0.12, 0), Vector2(cc.size.x * 0.76, cc.size.x * 0.76)))
		2:
			Gt.icon(ci, &"sword", c, s * 1.05)
		3:
			Gt.icon(ci, &"scroll", c, s)
		4:
			Gt.icon(ci, &"book", c, s)


# ── 그리기: 아바타 페이지 ──

func _paint_backdrop(ci: Control) -> void:
	var w := ci.size.x
	var h := ci.size.y
	var data := Save.character(viewing)
	var rank := Save.rank_of(viewing) if Save.is_owned(viewing) else 3
	# 캐릭터 뒤 햇살(속성 색이 살짝 섞인 흰빛, 별이 높으면 아우라 색)
	var col := Color.WHITE.lerp(Gt.element_color(data.element), 0.25)
	if rank >= AURA_FROM:
		col = col.lerp(_aura_color(rank, 0.0), 0.45)
	Gt.burst(ci, Vector2(w * 0.5, h * 0.42), h * (0.75 + 0.05 * maxi(rank - 4, 0)), col, t * (1.0 + 0.4 * maxi(rank - 4, 0)))
	# 발밑 풀밭 섬 + 별 등급 빛 고리
	Gt.island(ci, Vector2(w * 0.5, h - 30), 360, 56)
	if rank >= AURA_FROM:
		_paint_aura_ground(ci, Vector2(w * 0.5, h - 44), rank)


## 별 등급 → 아우라 색(7성 빨강은 불꽃처럼 살짝 일렁인다)
func _aura_color(rank: int, phase: float) -> Color:
	var c: Color = Gt.rank_color(mini(rank, 7), viewing)
	if rank >= 7:
		c = c.lerp(Color.WHITE, 0.1 + 0.12 * sin(t * 3.0 + phase * TAU))
	return c


## 발밑 빛 고리 + 위로 떠오르는 빛 알갱이(별이 높을수록 많고 빠르다)
func _paint_aura_ground(ci: Control, c: Vector2, rank: int) -> void:
	var lvl := rank - 4
	var pulse := 0.5 + 0.5 * sin(t * 2.4)
	for i in 3:
		var rr := 110.0 + i * 16.0 + pulse * 8.0
		ci.draw_set_transform(c, 0.0, Vector2(1.0, 0.28))
		ci.draw_arc(Vector2.ZERO, rr, 0, TAU, 48, Color(_aura_color(rank, i * 0.2), 0.35 - i * 0.09), 4.0, true)
	ci.draw_set_transform(Vector2.ZERO)
	var n := 8 + lvl * 8
	var h := ci.size.y
	for i in n:
		var seed := float(i) * 12.9898
		var speed := 30.0 + fmod(seed * 7.0, 30.0) + lvl * 6.0
		var life := h * 0.75
		var y := c.y - fmod(t * speed + seed * 41.0, life)
		var x := c.x + sin(seed) * 120.0 + sin(t * 1.3 + seed) * 8.0
		var k := 1.0 - (c.y - y) / life
		var col := _aura_color(rank, float(i) / n)
		var sz := 2.0 + fmod(seed, 2.5) + (1.0 if rank >= 6 else 0.0)
		ci.draw_circle(Vector2(x, y), sz * 2.6, Color(col, 0.28 * k))
		ci.draw_circle(Vector2(x, y), sz * 1.2, Color(col.lightened(0.4), 0.95 * k))
		if rank >= 6 and i % 3 == 0:
			Gt.sparkle(ci, Vector2(x, y), 4.0 + sz, Color(1, 1, 1, 0.8 * k))


## 일러스트 윤곽 아우라(셰이더 값): 숨 쉬듯 밝아졌다 어두워진다
func _update_aura() -> void:
	var rank := Save.rank_of(viewing) if Save.is_owned(viewing) else 3
	aura_rect.visible = rank >= AURA_FROM
	if not aura_rect.visible:
		return
	aura_rect.position = portrait.position
	aura_rect.scale = portrait.scale
	aura_rect.pivot_offset = portrait.pivot_offset
	var mat := aura_rect.material as ShaderMaterial
	var col := _aura_color(rank, 0.0)
	mat.set_shader_parameter(&"glow_color", Color(col, 0.8 + 0.06 * (rank - 5)))
	mat.set_shader_parameter(&"radius", 18.0 + 5.0 * (rank - 5))
	mat.set_shader_parameter(&"strength", 0.85 + 0.25 * sin(t * 2.2))
	mat.set_shader_parameter(&"rainbow", 0.0)
	mat.set_shader_parameter(&"time", t)


func _paint_plate(ci: Control) -> void:
	var data := Save.character(viewing)
	var owned := Save.is_owned(viewing)
	var w := ci.size.x
	var h := ci.size.y
	var top := h - PLATE_HEIGHT
	var x := 14.0
	# 별 + 레벨 꼬리표
	var rank := Save.rank_of(viewing)
	var sw := Gt.rank_stars(ci, Vector2(x, top + 20), rank, 10, true, viewing)
	var lv_tag := Rect2(x + sw + 10, top + 8, 68, 24)
	Gt.tag(ci, lv_tag, Gt.NAVY if owned else Color("8e88a0"))
	Gt.text(ci, Vector2(lv_tag.get_center().x, lv_tag.position.y + 17), "Lv.%d" % Save.level_of(viewing) if owned else "미보유", 14, Color.WHITE, 1)
	# 이름 + 영문 이름 + 별명
	Gt.title(ci, Vector2(x, top + 72), data.display_name, 42)
	Gt.text(ci, Vector2(x + Gt.width(data.display_name, 42) + 8, top + 70), Gt.roman(viewing), 14, Color("ffe36b"), 0, true, 5, Gt.INK, true)
	Gt.title(ci, Vector2(x + 2, top + 96), "스킨 「%s」 · %s" % [Skins.name_of(viewing), Skins.bonus_text(viewing)] if Skins.has_skin(viewing) else data.title, 15)
	# 속성 꼬리표 + 공격 방식 꼬리표
	var el_name := CharacterData.ELEMENT_NAMES[data.element] + " 속성"
	var chip := Rect2(x, top + 108, Gt.width(el_name, 14) + 44, 28)
	Gt.tag(ci, chip, Gt.CREAM)
	Gt.element_badge(ci, chip.position + Vector2(16, 14), 8, data.element)
	Gt.text(ci, chip.position + Vector2(31, 19), el_name, 14, Gt.NAVY)
	var kind := CharacterData.ATTACK_NAMES[data.attack_kind]
	var chip2 := Rect2(chip.end.x + 6, top + 108, Gt.width(kind, 14) + 26, 28)
	Gt.tag(ci, chip2, Gt.NAVY)
	Gt.text(ci, Vector2(chip2.get_center().x, chip2.position.y + 19), kind, 14, Color.WHITE, 1)
	# 오른쪽: 전투력
	var power: int = Save.power_of(viewing) if owned else data.atk_at(1) * 10 + data.hp_at(1)
	Gt.title(ci, Vector2(w - 14, top + 50), "전투력", 13, Color("ffe36b"), 2)
	Gt.title(ci, Vector2(w - 14, top + 78), _comma(power), 26, Color.WHITE, 2)
	# 오른쪽 아래 상태(출전 버튼이 없을 때)
	if not action_button.visible:
		var label := "출전 중" if viewing == Save.selected else "미보유"
		var r := Rect2(w - 172, h - 66, 160, 54)
		Gt.button(ci, r, Gt.Kind.GREEN if owned else Gt.Kind.GRAY)
		Gt.title(ci, Vector2(r.get_center().x, r.get_center().y + 5), label, 20, Color.WHITE, 1)


const GEAR_ICONS: Array[StringName] = [&"slot_guard", &"slot_armor", &"slot_boot", &"slot_ring", &"slot_amulet", &"slot_ring"]


func _paint_gear_slot(ci: Control, index: int) -> void:
	var r := Rect2(Vector2(2, 2), ci.size - Vector2(4, 6))
	var w := Save.equipped(viewing) if index == 0 else &""
	if w != &"":
		# 장착한 무기: 무기 카드 + 이름표
		Weapons.draw_card(ci, w, r, false, Save.refine_of(w), t)
		var wtag := Rect2(r.position + Vector2(-2, -4), Vector2(Gt.width(GEAR_SLOTS[index], 11) + 16, 20))
		Gt.tag(ci, wtag, Gt.NAVY)
		Gt.text(ci, Vector2(wtag.get_center().x, wtag.position.y + 14), GEAR_SLOTS[index], 11, Color.WHITE, 1)
		return
	if GEAR_KEYS.has(index) and Save.gear_on(viewing, GEAR_KEYS[index]) != &"":
		# 낀 장비: 등급색 카드 + 이름표
		var g := Save.gear_on(viewing, GEAR_KEYS[index])
		Gear.draw_card(ci, g, r, false, Save.gear_refine(g))
		var gtag := Rect2(r.position + Vector2(-2, -4), Vector2(Gt.width(GEAR_SLOTS[index], 11) + 16, 20))
		Gt.tag(ci, gtag, Gt.NAVY)
		Gt.text(ci, Vector2(gtag.get_center().x, gtag.position.y + 14), GEAR_SLOTS[index], 11, Color.WHITE, 1)
		return
	if index == PET_SLOT and Save.pet != "":
		# 데리고 다니는 펫
		Gt.pbox(ci, r, Color("fff4d6"))
		# 도트 펫은 작게, 또렷하게(정수 배율)
		var cell := 16.0
		var k := floorf(minf(r.size.x, r.size.y) * 0.55 / cell)
		var sz := Vector2(cell, cell) * maxf(k, 1.0)
		Pets.draw_icon(ci, StringName(Save.pet), Rect2(r.get_center() - sz / 2.0 + Vector2(0, 4), sz))
		var ptag := Rect2(r.position + Vector2(-2, -4), Vector2(Gt.width(GEAR_SLOTS[index], 11) + 16, 20))
		Gt.tag(ci, ptag, Gt.NAVY)
		Gt.text(ci, Vector2(ptag.get_center().x, ptag.position.y + 14), GEAR_SLOTS[index], 11, Color.WHITE, 1)
		return
	Gt.pbox(ci, r, Gt.CREAM)
	var inner := r.grow(-Gt.PX * 3.0)
	Gt.pbox(ci, inner, Color("e8dcc2"), Color("cbb791"), 1, false, false)
	Gt.icon(ci, GEAR_ICONS[index], inner.get_center() + Vector2(0, 3), minf(inner.size.x, inner.size.y) * 0.8, Color(1, 1, 1, 0.42))  # 빈 칸은 흐리게
	# 왼쪽 위 이름표
	var tag := Rect2(r.position + Vector2(-2, -4), Vector2(Gt.width(GEAR_SLOTS[index], 11) + 16, 20))
	Gt.tag(ci, tag, Gt.NAVY)
	Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 14), GEAR_SLOTS[index], 11, Color.WHITE, 1)
	# 오른쪽 아래 + 칸
	var plus := Rect2(r.end - Vector2(24, 24), Vector2(22, 22))
	Gt.tag(ci, plus, Gt.GREEN)
	ci.draw_rect(Rect2(plus.get_center() - Vector2(5, 1.5), Vector2(10, 3)), Color.WHITE)
	ci.draw_rect(Rect2(plus.get_center() - Vector2(1.5, 5), Vector2(3, 10)), Color.WHITE)


## 옷·신발·목걸이·반지 칸을 누르면 장비 선택 창
func _open_gear_picker(slot: String) -> void:
	if not Save.is_owned(viewing):
		_show_toast("미보유 캐릭터예요")
		return
	var picker := GearPicker.new()
	picker.char_id = viewing
	picker.slot = slot
	picker.closed.connect(_refresh_all)
	add_child(picker)


## 무기 칸을 누르면 무기 선택 창
func _open_weapon_picker() -> void:
	if not Save.is_owned(viewing):
		_show_toast("미보유 캐릭터예요")
		return
	var picker := WeaponPicker.new()
	picker.char_id = viewing
	picker.closed.connect(_refresh_all)
	add_child(picker)


func _paint_roster_strip(ci: Control) -> void:
	var r := Rect2(Vector2(8, 2), ci.size - Vector2(16, 6))
	Gt.pbox(ci, r, Gt.CREAM)
	Gt.header(ci, r.position + Vector2(10, 26), "캐릭터", "CHARACTER", 16)
	var owned := Save.ROSTER.filter(func(id: StringName) -> bool: return Save.is_owned(id)).size()
	Gt.text(ci, Vector2(r.end.x - 12, r.position.y + 25), "보유 %d / %d" % [owned, Save.ROSTER.size()], 13, Gt.NAVY_SOFT, 2)


func _paint_card(ci: Control, id: StringName) -> void:
	var data := Save.character(id)
	var owned := Save.is_owned(id)
	var r := Rect2(Vector2(5, 7), ci.size - Vector2(10, 12))
	if id == viewing:
		Gt.pbox(ci, r.grow(4), Gt.YELLOW, Gt.INK, 2, false, false)
	Gt.char_card(ci, data, r, owned)
	if id == Save.selected:
		var tag := Rect2(r.position + Vector2(-4, -6), Vector2(40, 20))
		Gt.tag(ci, tag, Gt.PINK)
		Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 14), "출전", 12, Color.WHITE, 1)
	elif owned:
		Gt.title(ci, r.position + Vector2(7, 20), "Lv.%d" % Save.level_of(id), 12)


func _paint_stats(ci: Control) -> void:
	var lv := Save.level_of(viewing)
	var r := Rect2(Vector2(0, 2), ci.size - Vector2(0, 6))
	Gt.panel(ci, r)
	var maxed := lv >= Save.MAX_LEVEL
	# 레벨
	var lv_tag := Rect2(r.position + Vector2(12, 12), Vector2(34, 20))
	Gt.tag(ci, lv_tag, Gt.NAVY)
	Gt.text(ci, Vector2(lv_tag.get_center().x, lv_tag.position.y + 15), "LV", 12, Color.WHITE, 1)
	Gt.text(ci, r.position + Vector2(52, 31), "%d" % lv, 22, Gt.NAVY)
	Gt.text(ci, r.position + Vector2(56 + Gt.width(str(lv), 22), 31), "/%d" % Save.MAX_LEVEL, 12, Gt.GRAY)
	var xr := 1.0 if maxed else Save.exp_of(viewing) / float(Save.exp_need(lv))
	Gt.bar(ci, Rect2(r.position + Vector2(12, 44), Vector2(92, 12)), xr, Gt.GREEN)
	Gt.text(ci, r.position + Vector2(13, 74), "최대 레벨" if maxed else "EXP %.1f%%" % (xr * 100.0), 11, Gt.NAVY_SOFT, 0, false)
	# 점선 칸막이
	var y := r.position.y + 12.0
	while y < r.end.y - 12.0:
		ci.draw_rect(Rect2(r.position.x + 114, y, 3, 3), Gt.LINE)
		y += 7.0
	# 공격력 · 체력
	_stat(ci, Vector2(r.position.x + 124, r.position.y), r.size.y, "공격력", Save.atk_of(viewing), -1 if maxed else Save.atk_of(viewing, lv + 1) - Save.atk_of(viewing), &"sword")
	_stat(ci, Vector2(r.position.x + 236, r.position.y), r.size.y, "체력", Save.hp_of(viewing), -1 if maxed else Save.hp_of(viewing, lv + 1) - Save.hp_of(viewing), &"heart")


func _stat(ci: Control, pos: Vector2, h: float, label: String, value: int, plus: int, icon_name: StringName) -> void:
	var c := pos + Vector2(14, h / 2.0)
	Gt.icon(ci, icon_name, c, 34)
	Gt.text(ci, pos + Vector2(34, h / 2.0 - 6), label, 12, Gt.NAVY_SOFT)
	Gt.text(ci, pos + Vector2(34, h / 2.0 + 17), _comma(value), 21, Gt.NAVY)
	if plus >= 0:
		Gt.text(ci, pos + Vector2(37 + Gt.width(_comma(value), 21), h / 2.0 + 16), "+%d" % plus, 12, Gt.GREEN)


## 스킬 칸: 속성 색 아이콘 + 스킬 이름 + 재사용 시간 + 설명
func _paint_skill(ci: Control) -> void:
	var data := Save.character(viewing)
	var r := Rect2(Vector2(0, 2), ci.size - Vector2(0, 6))
	Gt.panel(ci, r)
	var icon := Rect2(r.position + Vector2(10, 9), Vector2(r.size.y - 18, r.size.y - 18))
	Gt.pbox(ci, icon, Gt.element_color(data.element), Gt.INK, 2, false, true)
	Gt.element_glyph(ci, icon.get_center(), icon.size.x * 1.1, data.element, Color.WHITE, Gt.element_color(data.element))
	var x := icon.end.x + 12
	var tag := Rect2(Vector2(x, r.position.y + 9), Vector2(40, 18))
	Gt.tag(ci, tag, Gt.PINK)
	Gt.text(ci, Vector2(tag.get_center().x, tag.position.y + 13), "스킬", 11, Color.WHITE, 1)
	Gt.text(ci, Vector2(tag.end.x + 8, r.position.y + 24), data.skill_name, 16, Gt.NAVY)
	# 오른쪽: 스킬 트리 열기(남은 포인트가 있으면 빨간 점)
	var open := Rect2(Vector2(r.end.x - 96, r.position.y + 10), Vector2(86, r.size.y - 20))
	Gt.pbox(ci, open, Gt.YELLOW, Gt.INK, 2, false, true)
	Gt.title(ci, Vector2(open.get_center().x, open.get_center().y + 6), "스킬 트리", 14, Color.WHITE, 1)
	if Save.is_owned(viewing) and Save.skill_points(viewing) > 0:
		ci.draw_circle(open.position + Vector2(open.size.x - 4, 4), 7.0, Gt.INK)
		ci.draw_circle(open.position + Vector2(open.size.x - 4, 4), 5.5, Color("ff3b4d"))
	Gt.text(ci, Vector2(x, r.position.y + 45), data.skill_desc, 12, Gt.NAVY_SOFT, 0, false)


func _paint_passive_header(ci: Control) -> void:
	var stars := Save.stars_of(viewing)
	var m := Save.max_stars(viewing)
	var w := ci.size.x
	Gt.header(ci, Vector2(2, 23), "성장 효과", "STAR BONUS", 16)
	# 승급 칸: 올린 별은 채워지고, 다 채우면 7성(큰 빨간 별)
	for i in m:
		Gt.star(ci, Vector2(w - 12 - (m - 1 - i) * 20, 15), 7.5, Gt.STAR if i < stars else Color("c9c3d6"))
	Gt.text(ci, Vector2(w - 20 - m * 20, 21), "승급하면 효과가 열려요 · 별마다 공격·체력 +8%", 11, Gt.NAVY_SOFT, 2)


## 별 조각: 지금 별 → 다음 별, 모은 조각 / 필요한 조각 막대
func _paint_promote(ci: Control) -> void:
	var r := Rect2(Vector2(0, 1), ci.size - Vector2(0, 4))
	Gt.panel(ci, r)
	var owned := Save.is_owned(viewing)
	var rank := Save.rank_of(viewing)
	var x := r.position.x + 12
	if rank >= Save.MAX_RANK:
		Gt.red_star(ci, Vector2(x + 12, r.get_center().y), 12)
		Gt.text(ci, Vector2(x + 34, r.get_center().y + 6), "7성 달성! 이제 중복은 골드로 바뀌어요", 14, Gt.NAVY)
		return
	var cur := Gt.rank_stars(ci, Vector2(x, r.position.y + 16), rank, 6.0, true)
	Gt.text(ci, Vector2(x + cur + 8, r.position.y + 21), "→", 13, Gt.NAVY_SOFT)
	Gt.rank_stars(ci, Vector2(x + cur + 26, r.position.y + 16), rank + 1, 6.0, true)
	var have := Save.shards_of(viewing) if owned else 0
	var need := Save.promote_cost(viewing)
	var bar := Rect2(Vector2(x, r.position.y + 30), Vector2(r.size.x - 150, 14))
	Gt.bar(ci, bar, minf(1.0, have / float(maxi(need, 1))), Color("ff9a2e"))
	Gt.text(ci, Vector2(bar.end.x, r.position.y + 21), "별 조각 %d / %d" % [have, need], 12, Gt.NAVY, 2)
	if not owned:
		Gt.text(ci, Vector2(bar.position.x, r.position.y + 21), "", 11, Gt.GRAY)


## 스킨 동그라미 자리: 이름표의 속성·공격 방식 꼬리표 바로 오른쪽(_paint_plate와 같은 계산)
func _skin_dot_pos() -> Vector2:
	if viewing == &"":
		return Vector2.ZERO  # 로비를 만드는 중(아직 캐릭터를 안 골랐을 때)
	var data := Save.character(viewing)
	var top := backdrop.size.y - PLATE_HEIGHT
	var el_name := CharacterData.ELEMENT_NAMES[data.element] + " 속성"
	var chip2_x := 14.0 + Gt.width(el_name, 14) + 44 + 6
	var end := chip2_x + Gt.width(CharacterData.ATTACK_NAMES[data.attack_kind], 14) + 26
	return Vector2(end + 6, top + 105)


## 동그라미: 켜짐 분홍(옷걸이 + ON) · 꺼짐 회색(OFF) · 7성 전엔 자물쇠
func _paint_skin_dot(ci: Control) -> void:
	var c := ci.size / 2.0
	var on := Skins.has_skin(viewing)
	var open := Skins.unlocked(viewing)
	ci.draw_circle(c + Vector2(0, 2), 15.0, Gt.INK)
	ci.draw_circle(c, 15.0, Gt.INK)
	ci.draw_circle(c, 13.0, Color("ff6b9a") if on else (Color("b8b0c8") if open else Color("8e88a0")))
	ci.draw_circle(c + Vector2(0, -4), 8.0, Color(1, 1, 1, 0.25))
	if not open:
		Gt.lock(ci, c, 14, Color("efe9f6"))
		return
	# 옷걸이
	ci.draw_arc(c + Vector2(0, -7), 2.2, PI, TAU * 1.0, 6, Color.WHITE, 1.6)
	ci.draw_polyline(PackedVector2Array([c + Vector2(0, -5), c + Vector2(-8, 1), c + Vector2(8, 1), c + Vector2(0, -5)]), Color.WHITE, 1.8)
	Gt.text(ci, c + Vector2(0, 11), "ON" if on else "OFF", 8, Color.WHITE, 1, true, 2, Gt.INK)


## 스킨 켜기·끄기(켜면 색이 바뀌고 능력치가 오른다)
func _on_skin_pressed() -> void:
	if not Skins.unlocked(viewing):
		_show_toast("7성이 되면 「%s」 스킨이 열려요 (%s)" % [Skins.name_of(viewing), Skins.bonus_text(viewing)])
		return
	Skins.toggle(viewing)
	Game.sfx(&"powerup" if Skins.has_skin(viewing) else &"pickup", -4.0, 0.0)
	_refresh_all()
	_show_toast("「%s」 %s" % [Skins.name_of(viewing), ("착용! " + Skins.bonus_text(viewing)) if Skins.has_skin(viewing) else "벗음"])


func _on_promote_pressed() -> void:
	if not Save.is_owned(viewing):
		_show_toast("미보유 캐릭터예요")
		return
	if Save.promote(viewing):
		Game.sfx(&"levelup", -2.0, 0.0)
		Game.flash(Color(1, 0.95, 0.6, 0.25), 0.25)
		_bounce(portrait, 1.08)
		_refresh_all()
		_show_toast("%d성 승급!" % Save.rank_of(viewing))
	else:
		_show_toast("별 조각이 모자라요 (같은 캐릭터를 뽑으면 %d개)" % Save.shards_per_dup(viewing))


func _paint_passive_row(ci: Control, index: int, text: String, unlocked: bool) -> void:
	var r := Rect2(Vector2(0, 1), ci.size - Vector2(0, 5))
	Gt.pbox(ci, r, Color("fff1c2") if unlocked else Color("e9e4da"), Gt.INK, 2, unlocked, unlocked)
	if unlocked:
		ci.draw_rect(Rect2(r.position + Vector2(2, 2), Vector2(5, r.size.y - 4)), Gt.GREEN)
	var tag := Rect2(r.position + Vector2(8, 7), Vector2(78, r.size.y - 14))
	Gt.tag(ci, tag, Gt.BLUE if unlocked else Color("b9b3c6"))
	# 이 줄이 열리는 별 등급(2성 ~ 7성): "N성" 글자 + 그 등급 색 별
	var need := index + 2
	var col: Color = Gt.STAR_BY_RARITY.get(mini(need, 7), Gt.STAR) if unlocked else Color("e2dfe8")
	Gt.star(ci, Vector2(tag.position.x + 16, tag.get_center().y), 7.0, col)
	Gt.text(ci, Vector2(tag.position.x + 46, tag.get_center().y + 6), "%d성" % need, 14, Color.WHITE, 1, true, 3, Gt.INK)
	Gt.text(ci, Vector2(tag.end.x + 12, r.get_center().y + 6), text, 16, Gt.NAVY if unlocked else Gt.GRAY)
	if unlocked:
		Gt.text(ci, Vector2(r.end.x - 14, r.get_center().y + 6), "✔ 적용 중", 13, Gt.GREEN, 2)
	else:
		Gt.lock(ci, Vector2(r.end.x - 22, r.get_center().y), 16, Color("c9c3d6"))


## 5성 고유 능력 줄: 금빛 테두리 + "고유" 꼬리표 + 이름·설명
func _paint_unique_row(ci: Control, data: CharacterData) -> void:
	var r := Rect2(Vector2(0, 1), ci.size - Vector2(0, 5))
	Gt.pbox(ci, r.grow(1), Gt.GOLD, Gt.INK, 2, true, true)
	Gt.pbox(ci, r.grow(-3), Color("fff6dc"), Color(Gt.GOLD_D, 0.6), 1, false, false)
	var tag := Rect2(r.position + Vector2(8, 8), Vector2(78, r.size.y - 16))
	Gt.tag(ci, tag, Color("e8a21e"))
	Gt.star(ci, Vector2(tag.position.x + 16, tag.get_center().y), 7.0, Gt.STAR_BY_RARITY[5])
	Gt.text(ci, Vector2(tag.position.x + 46, tag.get_center().y + 6), "고유", 14, Color.WHITE, 1, true, 3, Gt.INK)
	Gt.text(ci, Vector2(tag.end.x + 12, r.position.y + 21), data.unique_name, 15, Color("b5550f"))
	Gt.text(ci, Vector2(tag.end.x + 12, r.position.y + 40), data.unique_desc, 11, Gt.NAVY_SOFT, 0, false)


func _paint_toast(ci: Control) -> void:
	if _toast_text == "":
		return
	var w := Gt.width(_toast_text, 20) + 60
	var r := Rect2(Vector2((ci.size.x - w) / 2.0, ci.size.y * 0.42), Vector2(w, 52))
	Gt.pbox(ci, r, Color(Gt.NAVY, 0.96))
	Gt.title(ci, Vector2(r.get_center().x, r.position.y + 34), _toast_text, 20, Color.WHITE, 1)


# ── 갱신 ──

func _refresh_all() -> void:
	var data := Save.character(viewing)
	var owned := Save.is_owned(viewing)
	portrait.texture = data.portraits[expression % data.portraits.size()]
	aura_rect.texture = portrait.texture
	Skins.apply(portrait.material as ShaderMaterial, viewing, Skins.has_skin(viewing))
	_update_aura()
	portrait.modulate = Color.WHITE if owned else Color(0.55, 0.62, 0.75)
	action_button.visible = owned and viewing != Save.selected
	_refresh_level_button()
	_refresh_passives()
	promote_button.disabled = not Save.can_promote(viewing)
	if Save.rank_of(viewing) >= Save.MAX_RANK:
		promote_button.label = "7성 달성"
		promote_button.sublabel = ""
		promote_button.disabled = true
	else:
		promote_button.label = "%d성 승급 %d/%d" % [Save.rank_of(viewing) + 1, Save.shards_of(viewing) if owned else 0, Save.promote_cost(viewing)]
		promote_button.sublabel = ""  # 버튼이 낮아서 한 줄로(글자가 넘치지 않게)
	skin_dot.visible = Skins.exists(viewing)
	skin_dot.position = _skin_dot_pos()
	skin_dot.queue_redraw()
	promote_button.queue_redraw()
	skill_button.label = "스킬 트리 (%d)" % Save.skill_points(viewing) if Save.is_owned(viewing) and Save.skill_points(viewing) > 0 else "스킬 트리"
	skill_button.queue_redraw()
	for c: Control in [top_bar, backdrop, plate, stats_bar, skill_box, promote_box, passive_header, roster_strip, tab_bar]:
		c.queue_redraw()
	for id in cards:
		cards[id].queue_redraw()
	for slot in gear_slots:
		slot.queue_redraw()


func _refresh_level_button() -> void:
	var lv := Save.level_of(viewing)
	level_button.sublabel = ""
	if not Save.is_owned(viewing):
		level_button.label = "미보유"
		level_button.disabled = true
	elif lv >= Save.MAX_LEVEL:
		level_button.label = "최대 레벨"
		level_button.disabled = true
	else:
		# 레벨은 몬스터를 잡아 오른다: 버튼은 남은 경험치를 보여 주고, 누르면 안내
		level_button.label = "경험치"
		level_button.sub_icon = GameButton.SubIcon.NONE
		level_button.sublabel = "%s / %s" % [_comma(Save.exp_of(viewing)), _comma(Save.exp_need(lv))]
		level_button.sublabel_color = Color.TRANSPARENT
		level_button.disabled = false
	level_button.queue_redraw()


func _refresh_passives() -> void:
	var data := Save.character(viewing)
	var stars := Save.passives_unlocked(viewing)
	for child in passive_box.get_children():
		child.queue_free()
	if data.unique_name != "":
		passive_box.add_child(_box(_paint_unique_row.bind(data), 54))
	for i in data.star_passives.size():
		var row := _box(_paint_passive_row.bind(i, data.star_passives[i], i < stars), 50)
		passive_box.add_child(row)


# ── 입력 ──

func _preview(id: StringName) -> void:
	if id == viewing:
		return
	viewing = id
	expression = 0
	_refresh_all()
	portrait.modulate.a = 0.0
	var base_x := portrait.position.x
	portrait.position.x = base_x + 30.0
	var tw := create_tween().set_parallel()
	tw.tween_property(portrait, ^"modulate:a", 1.0, 0.2)
	tw.tween_property(portrait, ^"position:x", base_x, 0.25).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)


func _on_portrait_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		expression += 1  # 일러스트를 누르면 표정이 바뀐다
		var data := Save.character(viewing)
		portrait.texture = data.portraits[expression % data.portraits.size()]
		aura_rect.texture = portrait.texture
		_bounce(portrait, 1.04)


## 출전 캐릭터 바꾸기: 지금 출전 캐릭터가 장비를 끼고 있으면 옮길지 먼저 묻는다
func _on_select_pressed() -> void:
	var prev := Save.selected
	var next := viewing
	var lv_up: bool = Save.is_owned(next) and Save.level_of(prev) > Save.level_of(next)
	if prev != next and Save.is_owned(next) and (Save.has_equipment(prev) or lv_up):
		var box := ConfirmBox.new()
		box.title = "레벨·장비를 옮길까요?"
		var parts: Array[String] = []
		if lv_up:
			parts.append("레벨 %d → %d" % [Save.level_of(next), Save.level_of(prev)])
		if Save.has_equipment(prev):
			parts.append("무기·장비(서로 맞바꿈)")
		box.sub = "%s → %s : %s" % [Save.character(prev).display_name, Save.character(next).display_name, " · ".join(parts)]
		box.yes_label = "옮기기"
		box.no_label = "그대로 두기"
		box.answered.connect(func(yes: bool) -> void:
			if yes:
				Save.move_level(prev, next)
				if Save.has_equipment(prev):
					Save.swap_equipment(prev, next)
			_select(next))
		add_child(box)
		return
	_select(next)


func _select(id: StringName) -> void:
	Save.select(id)
	_refresh_all()
	_show_toast("%s 출전!" % Save.character(id).display_name)


func _on_level_up_pressed() -> void:
	_show_toast("몬스터를 잡으면 출전 캐릭터의 경험치가 올라요")


## 모험: 로비에 오기 전 있던 맵·자리에서 다시 시작(처음이거나 쓰러졌으면 마을)
func _on_adventure_pressed() -> void:
	Save.save_game()
	var path := String(Save.place.get("map", ""))
	if path != "" and ResourceLoader.exists(path):
		Game.resume_pos = Vector2(float(Save.place.get("x", 0.0)), float(Save.place.get("y", 0.0)))
		get_tree().change_scene_to_file(path)
	else:
		get_tree().change_scene_to_file(WORLD_SCENE)


func _switch_tab(name: String) -> void:
	current_tab = name
	avatar_page.visible = name == "아바타"
	shop_page.visible = name == "상점"
	quest_page.visible = name == "퀘스트"
	if quest_page.visible:
		quest_page.refresh()
	_refresh_all()


func _coming_soon() -> void:
	_show_toast("준비 중이에요")


func _on_gold_changed(_gold: int) -> void:
	top_bar.queue_redraw()
	_refresh_level_button()


# ── 작은 도구들 ──

func _show_toast(text: String) -> void:
	_toast_text = text
	toast.queue_redraw()
	toast.modulate.a = 1.0
	var tw := create_tween()
	tw.tween_interval(0.9)
	tw.tween_property(toast, ^"modulate:a", 0.0, 0.4)


func _bounce(node: Control, amount: float) -> void:
	var tw := create_tween()
	tw.tween_property(node, ^"scale", Vector2.ONE * amount, 0.06)
	tw.tween_property(node, ^"scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


func _box(painter: Callable, min_height: float) -> DrawBox:
	var b := DrawBox.new()
	b.painter = painter
	b.custom_minimum_size.y = min_height
	b.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return b


func _pad(child: Control, l: int, t_: int, r: int, b: int) -> MarginContainer:
	var m := MarginContainer.new()
	m.add_theme_constant_override(&"margin_left", l)
	m.add_theme_constant_override(&"margin_top", t_)
	m.add_theme_constant_override(&"margin_right", r)
	m.add_theme_constant_override(&"margin_bottom", b)
	m.add_child(child)
	return m


func _spacer(w: float) -> Control:
	var c := Control.new()
	c.custom_minimum_size.x = w
	return c


func _comma(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "," + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return ("-" if n < 0 else "") + s + out
