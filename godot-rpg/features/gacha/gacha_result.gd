class_name GachaResult
extends Control
## 뽑기 연출(화면 전체를 덮는다).
## 1) 빛 구슬이 모이며 색이 등급에 따라 파랑 → 보라 → 금색으로 바뀐다.
## 2) 1회: 일러스트가 크게 뒤집혀 나온다. 10회: 카드 10장이 한 장씩 뒤집힌다(★5는 금빛 폭발).
## 화면을 누르면 건너뛰고, 다 나오면 "확인"으로 닫는다.

signal closed

const RARITY_COLORS: Dictionary[int, Color] = {3: Color("4da6ff"), 4: Color("b26bff"), 5: Color("ffc21a")}
const ORB_TIME := 1.4
const CARD_GAP := 0.2
const FLIP_TIME := 0.28

var results: Array[Dictionary] = []
var stage := 0  # 0 구슬, 1 공개
var t := 0.0
var reveal_t := 0.0
var shown := 0  # 공개된 카드 수(소리·폭발 한 번씩)
var best := 3
var flash := 0.0
var sparks: Array[Dictionary] = []
var ok_button: GameButton


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 50
	for r in results:
		best = maxi(best, int(r["rarity"]))
	ok_button = GameButton.new()
	ok_button.label = "확인"
	ok_button.kind = Gt.Kind.YELLOW
	ok_button.font_size = 24
	ok_button.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	ok_button.offset_left = -100
	ok_button.offset_right = 100
	ok_button.offset_top = -120
	ok_button.offset_bottom = -50
	ok_button.visible = false
	ok_button.pressed.connect(func() -> void:
		closed.emit()
		queue_free())
	add_child(ok_button)
	Game.sfx(&"charge", -4.0, 0.0)


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		if stage == 0:
			_start_reveal()
		else:
			reveal_t = 99.0  # 남은 카드 한 번에 공개


func _process(delta: float) -> void:
	t += delta
	flash = maxf(0.0, flash - delta * 2.5)
	if stage == 0:
		# 구슬 색이 바뀌는 순간 번쩍
		if (best >= 4 and _crossed(0.55, delta)) or (best == 5 and _crossed(1.0, delta)):
			flash = 0.7
			Game.sfx(&"charged", -6.0, 0.0)
		if t >= ORB_TIME:
			_start_reveal()
	else:
		reveal_t += delta
		var now := _revealed_count()
		while shown < now:
			_on_card_revealed(shown)
			shown += 1
		if shown == results.size() and reveal_t > _reveal_at(results.size() - 1) + FLIP_TIME:
			ok_button.visible = true
	for s in sparks:
		s["p"] += s["v"] * delta
		s["v"].y += 300.0 * delta
		s["life"] -= delta
	sparks = sparks.filter(func(s: Dictionary) -> bool: return s["life"] > 0.0)
	queue_redraw()


func _crossed(at: float, delta: float) -> bool:
	return t >= at and t - delta < at


func _start_reveal() -> void:
	if stage == 1:
		return
	stage = 1
	reveal_t = 0.0
	flash = 1.0
	Game.sfx(&"boom" if best == 5 else &"pickup", -4.0, 0.0)


func _reveal_at(i: int) -> float:
	return 0.15 + i * CARD_GAP


func _revealed_count() -> int:
	var n := 0
	for i in results.size():
		if reveal_t >= _reveal_at(i) + FLIP_TIME * 0.5:
			n += 1
	return n


func _on_card_revealed(i: int) -> void:
	var rarity := int(results[i]["rarity"])
	if rarity == 5:
		Game.sfx(&"boom", -3.0, 0.0)
		Game.sfx(&"charged", -6.0, 0.0)
		_burst(_card_rect(i).get_center(), RARITY_COLORS[5], 36)
		flash = maxf(flash, 0.5)
	elif rarity == 4:
		Game.sfx(&"pickup", -4.0)
		_burst(_card_rect(i).get_center(), RARITY_COLORS[4], 16)
	else:
		Game.sfx(&"slash", -12.0)


func _burst(center: Vector2, color: Color, count: int) -> void:
	for k in count:
		var v := Vector2.from_angle(randf() * TAU) * randf_range(120.0, 380.0)
		sparks.append({"p": center, "v": v + Vector2(0, -120), "life": randf_range(0.5, 1.1), "c": color.lightened(randf() * 0.5), "r": randf_range(3.0, 7.0)})


# ── 그리기 ──

func _draw() -> void:
	var w := size.x
	var h := size.y
	# 밤하늘 같은 자주색 바탕 + 은은한 다마스크 무늬
	Gt.grad(self, Rect2(Vector2.ZERO, size), Color(0.13, 0.06, 0.2, 0.97), Color(0.3, 0.12, 0.38, 0.97))
	var gy := -37.0
	var row := 0
	while gy < h + 74.0:
		var gx := -37.0 + (37.0 if row % 2 else 0.0)
		while gx < w + 74.0:
			Gt.damask(self, Vector2(gx, gy), 22.0, Color(1, 0.85, 1, 0.05))
			gx += 74.0
		gy += 37.0
		row += 1
	if stage == 0:
		_draw_orb(Vector2(w / 2.0, h * 0.45))
	elif results.size() == 1:
		_draw_single()
	else:
		_draw_ten()
	for s in sparks:
		Gt.star(self, s["p"], s["r"], Color(s["c"], clampf(s["life"] * 2.0, 0.0, 1.0)))
	if flash > 0.0:
		draw_rect(Rect2(Vector2.ZERO, size), Color(1, 1, 1, flash * 0.8))


func _orb_color() -> Color:
	if best == 5 and t >= 1.0:
		return RARITY_COLORS[5]
	if best >= 4 and t >= 0.55:
		return RARITY_COLORS[4]
	return RARITY_COLORS[3]


func _draw_orb(c: Vector2) -> void:
	var col := _orb_color()
	_draw_rays(c, col, 0.35, size.y)
	var k := clampf(t / ORB_TIME, 0.0, 1.0)
	var pulse := 1.0 + sin(t * 18.0) * 0.06
	for i in 5:
		draw_circle(c, (40.0 + i * 26.0) * (0.4 + k) * pulse, Color(col, 0.12))
	draw_circle(c, 44.0 * (0.5 + k * 0.7) * pulse, col.lightened(0.4))
	draw_circle(c, 26.0 * (0.5 + k * 0.7) * pulse, Color.WHITE)
	# 빨려 들어가는 빛 알갱이
	for i in 18:
		var a := i * TAU / 18.0 + t * 1.5
		var d := fmod(220.0 - t * 260.0 + i * 37.0, 220.0) + 40.0
		draw_circle(c + Vector2.from_angle(a) * d, 3.0, Color(col.lightened(0.5), 0.8))
	Gt.burst(self, c, 220.0, col.lightened(0.3), t * 3.0)
	Gt.text(self, Vector2(c.x, size.y * 0.78), "화면을 눌러 건너뛰기", 15, Color(1, 1, 1, 0.6), 1, false)


func _draw_rays(c: Vector2, col: Color, alpha: float, length: float) -> void:
	for i in 14:
		var a := i * TAU / 14.0 + t * 0.4
		draw_colored_polygon(PackedVector2Array([c, c + Vector2.from_angle(a - 0.09) * length, c + Vector2.from_angle(a + 0.09) * length]), Color(col, alpha * 0.5))


func _draw_single() -> void:
	var r := results[0]
	if r.has("weapon"):
		_draw_single_weapon(r)
		return
	var data := Save.character(r["id"])
	var rarity := int(r["rarity"])
	var col := RARITY_COLORS[rarity]
	var c := Vector2(size.x / 2.0, size.y * 0.42)
	_draw_rays(c, col, 0.5, size.y)
	var p := clampf((reveal_t - _reveal_at(0)) / FLIP_TIME, 0.0, 1.0)
	var flip := absf(cos(p * PI))  # 1 → 0 → 1
	var tex := data.portraits[0]
	var art_h := size.y * 0.62
	var art_size := tex.get_size() * (art_h / tex.get_height())
	if p < 0.5:
		_draw_card_back(Rect2(c - Vector2(110 * flip, 150), Vector2(220 * flip, 300)), flip, col)
		return
	var dst := Rect2(c - Vector2(art_size.x * flip / 2.0, art_size.y / 2.0), Vector2(art_size.x * flip, art_size.y))
	draw_texture_rect(tex, dst, false)
	_draw_result_info(r, data.display_name, Gt.roman(data.id), Vector2(size.x / 2.0, size.y * 0.42 + art_h / 2.0 + 10), 1.0)


## 무기 1회 뽑기: 빛 속에 무기가 크게 떠오른다
func _draw_single_weapon(r: Dictionary) -> void:
	var w: StringName = r["weapon"]
	var rarity := int(r["rarity"])
	var col := RARITY_COLORS[rarity]
	var c := Vector2(size.x / 2.0, size.y * 0.38)
	_draw_rays(c, col, 0.5, size.y)
	var p := clampf((reveal_t - _reveal_at(0)) / FLIP_TIME, 0.0, 1.0)
	var flip := absf(cos(p * PI))
	if p < 0.5:
		_draw_card_back(Rect2(c - Vector2(110 * flip, 150), Vector2(220 * flip, 300)), flip, col)
		return
	Gt.burst(self, c, 260.0, col.lightened(0.4), t)
	draw_circle(c, 120.0, Color(col, 0.25))
	draw_set_transform(Vector2.ZERO)
	var bob := sin(t * 2.5) * 8.0
	Weapons.draw_icon(self, w, c + Vector2(0, bob), 380.0 * flip)
	_draw_result_info(r, Weapons.name_of(w), "WEAPON  ·  공격력 +%d" % Weapons.atk_of(w, int(r["refine"])), Vector2(size.x / 2.0, size.y * 0.66), 1.0)


func _draw_result_info(r: Dictionary, title: String, sub: String, top: Vector2, s: float) -> void:
	var rarity := int(r["rarity"])
	if r.has("id") and Save.ROSTER.has(StringName(str(r["id"]))):
		Gt.rank_stars(self, top, Save.rank_of(StringName(str(r["id"]))), 13 * s)  # 캐릭터는 지금 별 등급(7성은 큰 빨간 별)
	else:
		for i in rarity:
			Gt.star(self, top + Vector2((i - (rarity - 1) / 2.0) * 30.0 * s, 0), 13 * s)
	Gt.text(self, top + Vector2(0, 50 * s), title, int(40 * s), Color.WHITE, 1, true, 8, Gt.INK)
	Gt.text(self, top + Vector2(0, 68 * s), sub, int(14 * s), Color("ffe36b"), 1, true, 4, Gt.INK, true)
	_draw_tag(r, top + Vector2(0, 80 * s), s)


func _tag_info(r: Dictionary) -> Array:
	match String(r["result"]):
		"new":
			return ["NEW!", Color("ff4f8b")]
		"shard":
			return ["별 조각 +%d" % int(r["shards"]), Color("ffb31a")]
		"refine":
			return ["재련 +%d" % int(r["refine"]), Color("4fb4ff")]
		_:
			return ["+%d G" % int(r["gold"]), Color("37c96e")]


func _draw_tag(r: Dictionary, center: Vector2, s: float) -> void:
	var info := _tag_info(r)
	var text: String = info[0]
	var fs := int(18 * s)
	var w := Gt.width(text, fs) + 28 * s
	var box := Rect2(center - Vector2(w / 2.0, 0), Vector2(w, 26 * s))
	Gt.tag(self, box, info[1])
	Gt.text(self, Vector2(center.x, box.position.y + 19 * s), text, fs, Color.WHITE, 1)


func _card_rect(i: int) -> Rect2:
	var cols := 5
	var margin := 18.0
	var gap := 10.0
	var cw := (size.x - margin * 2.0 - gap * (cols - 1)) / cols
	var ch := cw * 1.36
	var total_h := ch * 2.0 + 40.0
	var top := size.y * 0.42 - total_h / 2.0
	@warning_ignore("integer_division")
	var row := i / cols
	return Rect2(Vector2(margin + (i % cols) * (cw + gap), top + row * (ch + 40.0)), Vector2(cw, ch))


## 뒤집히기 전 카드 뒷면: 남색 바탕 + 사선 줄 + 가운데 헤일로·별
func _draw_card_back(r: Rect2, flip: float, glow: Color) -> void:
	if r.size.x < 8.0:
		return
	Gt.pbox(self, r, Color("3d3556"), Gt.INK, 2, false, true)
	var inner := r.grow(-Gt.PX * 3.0)
	Gt.pbox(self, inner, Color("4a4166"), Color("6b6290"), 1, false, false)
	if flip > 0.3:
		Gt.star(self, r.get_center(), minf(r.size.y, r.size.x / maxf(flip, 0.01)) * 0.13 * flip, glow.lightened(0.3))


func _draw_ten() -> void:
	if best == 5:
		_draw_rays(Vector2(size.x / 2.0, size.y * 0.42), RARITY_COLORS[5], 0.25, size.y)
	for i in results.size():
		var r := results[i]
		var rect := _card_rect(i)
		var p := clampf((reveal_t - _reveal_at(i)) / FLIP_TIME, 0.0, 1.0)
		var flip := absf(cos(p * PI))
		var shown_rect := Rect2(rect.position + Vector2(rect.size.x * (1.0 - flip) / 2.0, 0), Vector2(rect.size.x * flip, rect.size.y))
		if p < 0.5:
			_draw_card_back(shown_rect, flip, Color("6cb8ff"))
			continue
		var rarity := int(r["rarity"])
		var col := RARITY_COLORS[rarity]
		if rarity >= 4:
			var glow := 5.0 + sin(t * 6.0) * 3.0
			Gt.rrect(self, shown_rect.grow(glow), 10, Color(col, 0.45 if rarity == 5 else 0.3))
		if shown_rect.size.x > 8.0:
			if r.has("weapon"):
				_weapon_card(r["weapon"], rarity, shown_rect, flip)
			else:
				Gt.char_card(self, Save.character(r["id"]), shown_rect, true, flip > 0.8)
		if flip > 0.8:
			_draw_tag(r, Vector2(rect.get_center().x, rect.end.y + 6), 0.7)


## 무기 카드: 등급색 테두리 + 어두운 바탕 + 무기 그림 + 별 + 이름
func _weapon_card(w: StringName, rarity: int, r: Rect2, flip: float) -> void:
	Weapons.draw_card(self, w, r, flip > 0.8, -1, t)
