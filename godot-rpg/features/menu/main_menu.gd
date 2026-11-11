extends Control
## 로비: 위쪽 바 + 페이지(아바타 / 상점) + 하단 탭 바.
## 아바타 페이지: 캐릭터 큰 일러스트(뒤에 햇살, 발밑 풀밭), 장비 칸, 캐릭터 카드 목록, 레벨·공격력·체력·레벨 업, 별 효과.
## 상점 페이지는 features/gacha/shop_page.gd.
## 가디언 테일즈풍(하늘·도트 테두리·크림 패널). 그림은 Gt(gt.gd)로 직접 그린다.

const WORLD_SCENE := "res://features/world/village.tscn"  # 모험은 마을에서 시작
const ShopPage := preload("res://features/gacha/shop_page.gd")
const QuestPage := preload("res://features/menu/quest_page.gd")
const GEAR_SLOTS: Array[String] = ["무기", "옷", "펫", "신발"]
const GEAR_MARGIN := 12.0
const GEAR_GAP := 10
const PLATE_HEIGHT := 150.0  # 아래 이름표(별·이름·속성)가 차지하는 높이
## 하단 탭: [한글, 영문]
const TABS: Array = [["상점", "SHOP"], ["아바타", "AVATAR"], ["모험", "ADVENTURE"], ["퀘스트", "QUEST"]]

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
var gear_cols: Array[VBoxContainer] = []
var cards: Dictionary[StringName, DrawBox] = {}
var roster_strip: DrawBox
var stats_bar: DrawBox
var skill_box: DrawBox
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


func _process(delta: float) -> void:
	t += delta
	var sky: Array = Gt.ELEMENT_SKY[Save.character(viewing).element]
	var k := minf(1.0, delta * 6.0)
	sky_top = sky_top.lerp(sky[0], k)
	sky_bottom = sky_bottom.lerp(sky[1], k)
	bg_box.queue_redraw()  # 떠다니는 장식
	if avatar_page.visible:
		backdrop.queue_redraw()  # 햇살이 천천히 돈다
		for c: Control in cards.values():
			c.queue_redraw()  # 4·5성 카드 빛이 숨 쉬듯


# ── 화면 만들기 ──

func _build() -> void:
	bg_box = _box(func(ci: Control) -> void: Gt.background(ci, Rect2(Vector2.ZERO, ci.size), t, sky_top, sky_bottom), 0)
	bg_box.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(bg_box)
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
	avatar_page.add_child(_pad(skill_box, 10, 2, 10, 2))
	avatar_page.add_child(_pad(_build_passives(), 10, 4, 10, 6))
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
	return backdrop


## 장비 칸 4개: 왼쪽 위 무기·옷, 오른쪽 위 장신구·신발. 장비 시스템이 생기면 등급 색·레벨을 채운다.
func _build_gear_slots() -> void:
	var left := _gear_column(Control.PRESET_TOP_LEFT)
	var right := _gear_column(Control.PRESET_TOP_RIGHT)
	for i in GEAR_SLOTS.size():
		var col := left if i < 2 else right
		var slot := _box(_paint_gear_slot.bind(i), 0)
		gear_slots.append(slot)
		slot.mouse_filter = Control.MOUSE_FILTER_STOP
		slot.gui_input.connect(func(e: InputEvent) -> void:
			var mb := e as InputEventMouseButton
			if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
				_bounce(slot, 1.08)
				if i == 0:
					_open_weapon_picker()
				elif i == 2:
					var pp := PetPicker.new()
					pp.closed.connect(_refresh_all)
					add_child(pp)
				else:
					_show_toast("%s 장비는 준비 중이에요" % GEAR_SLOTS[i]))
		slot.resized.connect(func() -> void: slot.pivot_offset = slot.size / 2.0)
		col.add_child(slot)
	backdrop.resized.connect(_layout_gear)


func _gear_column(preset: Control.LayoutPreset) -> VBoxContainer:
	var col := VBoxContainer.new()
	col.set_anchors_preset(preset)
	col.offset_top = GEAR_MARGIN
	col.add_theme_constant_override(&"separation", GEAR_GAP)
	backdrop.add_child(col)
	gear_cols.append(col)
	return col


## 칸 크기를 화면 높이에 맞춘다: 위 여백부터 이름표(별) 바로 위까지 2칸이 꽉 차게.
func _layout_gear() -> void:
	var avail := backdrop.size.y - GEAR_MARGIN - PLATE_HEIGHT
	var s := clampf((avail - GEAR_GAP) / 2.0, 64.0, 100.0)
	for slot in gear_slots:
		slot.custom_minimum_size = Vector2(s, s)
	gear_cols[0].offset_left = GEAR_MARGIN
	gear_cols[0].offset_right = GEAR_MARGIN + s
	gear_cols[1].offset_left = -GEAR_MARGIN - s
	gear_cols[1].offset_right = -GEAR_MARGIN


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


func _build_passives() -> Control:
	var v := VBoxContainer.new()
	v.add_theme_constant_override(&"separation", 4)
	passive_header = _box(_paint_passive_header, 32)
	v.add_child(passive_header)
	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size.y = 100
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
		_:
			_switch_tab("퀘스트")


# ── 그리기: 위쪽 바·탭 바 ──

func _paint_top_bar(ci: Control) -> void:
	var w := ci.size.x
	Gt.grad(ci, Rect2(0, 0, w, ci.size.y), Color(Gt.INK, 0.28), Color(Gt.INK, 0.0))
	# 왼쪽: 지금 탭(파란 도트 칸 + 아이콘 + 이름)
	var tab_i := _tab_index(current_tab)
	var icon_box := Rect2(10, 10, 46, 46)
	Gt.pbox(ci, icon_box, Gt.BLUE)
	_tab_icon(ci, tab_i, icon_box.get_center(), 30)
	Gt.title(ci, Vector2(64, 36), TABS[tab_i][0], 22)
	Gt.text(ci, Vector2(66, 52), TABS[tab_i][1], 11, Color.WHITE, 0, true, 4, Gt.INK, true)
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
		if i == 3 and Quests.has_reward():
			# 받을 보상이 있으면 빨간 점
			var dot := Vector2(body.end.x - 10, body.position.y + 10)
			ci.draw_circle(dot, 9.0, Gt.INK)
			ci.draw_circle(dot, 7.0, Color("ff3b4d"))
			Gt.text(ci, dot + Vector2(0, 5), "!", 12, Color.WHITE, 1)


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


# ── 그리기: 아바타 페이지 ──

func _paint_backdrop(ci: Control) -> void:
	var w := ci.size.x
	var h := ci.size.y
	var data := Save.character(viewing)
	# 캐릭터 뒤 햇살(속성 색이 살짝 섞인 흰빛)
	var col := Color.WHITE.lerp(Gt.element_color(data.element), 0.25)
	Gt.burst(ci, Vector2(w * 0.5, h * 0.42), h * 0.75, col, t)
	# 발밑 풀밭 섬
	Gt.island(ci, Vector2(w * 0.5, h - 30), 360, 56)


func _paint_plate(ci: Control) -> void:
	var data := Save.character(viewing)
	var owned := Save.is_owned(viewing)
	var w := ci.size.x
	var h := ci.size.y
	var top := h - PLATE_HEIGHT
	var x := 14.0
	# 별 + 레벨 꼬리표
	for i in data.rarity:
		Gt.star(ci, Vector2(x + 11 + i * 25, top + 20), 10)
	var lv_tag := Rect2(x + data.rarity * 25 + 6, top + 8, 68, 24)
	Gt.tag(ci, lv_tag, Gt.NAVY if owned else Color("8e88a0"))
	Gt.text(ci, Vector2(lv_tag.get_center().x, lv_tag.position.y + 17), "Lv.%d" % Save.level_of(viewing) if owned else "미보유", 14, Color.WHITE, 1)
	# 이름 + 영문 이름 + 별명
	Gt.title(ci, Vector2(x, top + 72), data.display_name, 42)
	Gt.text(ci, Vector2(x + Gt.width(data.display_name, 42) + 8, top + 70), Gt.roman(viewing), 14, Color("ffe36b"), 0, true, 5, Gt.INK, true)
	Gt.title(ci, Vector2(x + 2, top + 96), data.title, 15)
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
	var power: int = Save.atk_of(viewing) * 10 + Save.hp_of(viewing) if owned else data.atk_at(1) * 10 + data.hp_at(1)
	Gt.title(ci, Vector2(w - 14, top + 50), "전투력", 13, Color("ffe36b"), 2)
	Gt.title(ci, Vector2(w - 14, top + 78), _comma(power), 26, Color.WHITE, 2)
	# 오른쪽 아래 상태(출전 버튼이 없을 때)
	if not action_button.visible:
		var label := "출전 중" if viewing == Save.selected else "미보유"
		var r := Rect2(w - 172, h - 66, 160, 54)
		Gt.button(ci, r, Gt.Kind.GREEN if owned else Gt.Kind.GRAY)
		Gt.title(ci, Vector2(r.get_center().x, r.get_center().y + 5), label, 20, Color.WHITE, 1)


const GEAR_ICONS: Array[StringName] = [&"slot_guard", &"slot_armor", &"slot_ring", &"slot_boot"]


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
	if index == 2 and Save.pet != "":
		# 데리고 다니는 펫
		Gt.pbox(ci, r, Color("fff4d6"))
		Pets.draw_icon(ci, StringName(Save.pet), r.grow(-10))
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
	Gt.bar(ci, Rect2(r.position + Vector2(12, 44), Vector2(92, 12)), lv / float(Save.MAX_LEVEL), Gt.GREEN)
	Gt.text(ci, r.position + Vector2(13, 74), "최대 Lv.%d" % Save.MAX_LEVEL, 11, Gt.NAVY_SOFT, 0, false)
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
	Gt.text(ci, Vector2(r.end.x - 12, r.position.y + 23), "재사용 %d초" % int(data.skill_cooldown), 12, Gt.NAVY_SOFT, 2)
	Gt.text(ci, Vector2(x, r.position.y + 45), data.skill_desc, 12, Gt.NAVY_SOFT, 0, false)


func _paint_passive_header(ci: Control) -> void:
	var stars := Save.stars_of(viewing)
	var w := ci.size.x
	Gt.header(ci, Vector2(2, 23), "성장 효과", "STAR BONUS", 16)
	for i in Save.MAX_STARS:
		Gt.star(ci, Vector2(w - 12 - (Save.MAX_STARS - 1 - i) * 20, 15), 7.5, Gt.STAR if i < stars else Color("c9c3d6"))
	Gt.text(ci, Vector2(w - 132, 21), "별마다 공격력·체력 +4%", 11, Gt.NAVY_SOFT, 2)


func _paint_passive_row(ci: Control, index: int, text: String, unlocked: bool) -> void:
	var r := Rect2(Vector2(0, 1), ci.size - Vector2(0, 5))
	Gt.pbox(ci, r, Gt.CREAM if unlocked else Color("e9e4da"), Gt.INK, 2, unlocked, unlocked)
	var tag := Rect2(r.position + Vector2(8, 7), Vector2(78, r.size.y - 14))
	Gt.tag(ci, tag, Gt.BLUE if unlocked else Color("b9b3c6"))
	var n := index + 1
	for i in n:
		Gt.star(ci, Vector2(tag.get_center().x + (i - (n - 1) / 2.0) * 10.5, tag.get_center().y), 4.5, Gt.STAR if unlocked else Color("e2dfe8"))
	Gt.text(ci, Vector2(tag.end.x + 12, r.get_center().y + 5), text, 14, Gt.NAVY if unlocked else Gt.GRAY)
	if unlocked:
		Gt.text(ci, Vector2(r.end.x - 14, r.get_center().y + 5), "적용 중", 12, Gt.GREEN, 2)
	else:
		Gt.lock(ci, Vector2(r.end.x - 22, r.get_center().y), 16, Color("c9c3d6"))


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
	portrait.modulate = Color.WHITE if owned else Color(0.55, 0.62, 0.75)
	action_button.visible = owned and viewing != Save.selected
	_refresh_level_button()
	_refresh_passives()
	for c: Control in [top_bar, backdrop, plate, stats_bar, skill_box, passive_header, roster_strip, tab_bar]:
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
		var cost := Save.level_up_cost(lv)
		level_button.label = "레벨 업"
		level_button.sublabel = _comma(cost)
		level_button.sublabel_color = Color.TRANSPARENT if Save.gold >= cost else Color("ff8080")
		level_button.disabled = false
	level_button.queue_redraw()


func _refresh_passives() -> void:
	var data := Save.character(viewing)
	var stars := Save.stars_of(viewing)
	for child in passive_box.get_children():
		child.queue_free()
	for i in data.star_passives.size():
		var row := _box(_paint_passive_row.bind(i, data.star_passives[i], i < stars), 44)
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
		_bounce(portrait, 1.04)


func _on_select_pressed() -> void:
	Save.select(viewing)
	_refresh_all()
	_show_toast("%s 출전!" % Save.character(viewing).display_name)


func _on_level_up_pressed() -> void:
	var lv := Save.level_of(viewing)
	if Save.gold < Save.level_up_cost(lv):
		_show_toast("골드가 부족해요")
		return
	if Save.try_level_up(viewing):
		_refresh_all()
		_bounce(portrait, 1.06)
		_show_toast("레벨 업!  Lv.%d" % (lv + 1))


func _on_adventure_pressed() -> void:
	Save.save_game()
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
