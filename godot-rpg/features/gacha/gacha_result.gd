class_name GachaResult
extends Control
## 뽑기 연출(화면 전체를 덮는다).
## 1) 밤하늘에 별똥별이 떨어진다. 색이 등급을 알려 준다: 파랑 → (★4 이상) 보라 → (★5) 닿기 직전 금빛으로 뒤집힘.
##    (원신·젠레스 존 제로처럼 "색으로 먼저 알리고, 마지막에 한 번 뒤집어" 기대감을 늘린다)
## 2) 1회: 일러스트가 크게 뒤집혀 나온다. 10회: 카드 10장이 한 장씩 뒤집힌다(★5는 금빛 폭발).
## ★5는 뒤집히기 전에 1초 동안 금빛으로 떨리며 기를 모은다(CHARGE). 이미 있는 캐릭터는 "OO 조각 +10" 조각 카드로 보인다.
## 카드 뒷면 테두리도 등급색으로 미리 빛난다(명일방주처럼). ★5가 나오면 화면이 멈추고 검은 실루엣 → 색이 차오르며
## 이름이 들어오는 전용 등장 화면. 화면을 누르면 다음, 오른쪽 위 "건너뛰기"는 끝까지 넘긴다. 다 나오면 "확인"으로 닫는다.

signal closed

const RARITY_COLORS: Dictionary[int, Color] = {3: Color("4da6ff"), 4: Color("b26bff"), 5: Color("ffc21a")}
const ORB_TIME := 1.6  # 별똥별이 떨어지는 시간(★5는 더 길게)
const CARD_GAP := 0.2
const FLIP_TIME := 0.28
const CHARGE := 1.0  # ★5 카드가 뒤집히기 전 금빛으로 기 모으는 시간

var results: Array[Dictionary] = []
var stage := 0  # 0 구슬, 1 공개
var t := 0.0
var reveal_t := 0.0
var shown := 0  # 공개된 카드 수(소리·폭발 한 번씩)
var best := 3
var flash := 0.0
var sparks: Array[Dictionary] = []
var ok_button: GameButton
var starts: Array[float] = []  # 카드마다 뒤집히기 시작하는 때(★5 앞에는 CHARGE만큼 기다림)
var _charged: Dictionary = {}
var fall_time := ORB_TIME
var splash_i := -1  # ★5 등장 화면을 보여 주는 카드 번호(-1이면 없음)
var splash_t := 0.0
var _splashed: Dictionary = {}
var skip_button: GameButton


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 50
	var tc := 0.15
	for r in results:
		best = maxi(best, int(r["rarity"]))
		if int(r["rarity"]) >= 5:
			tc += CHARGE
		starts.append(tc)
		tc += CARD_GAP
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
	fall_time = ORB_TIME + (0.7 if best == 5 else 0.0)
	skip_button = GameButton.new()
	skip_button.label = "건너뛰기 ▶▶"
	skip_button.kind = Gt.Kind.WHITE
	skip_button.font_size = 15
	skip_button.set_anchors_preset(Control.PRESET_TOP_RIGHT)
	skip_button.offset_left = -150
	skip_button.offset_right = -14
	skip_button.offset_top = 14
	skip_button.offset_bottom = 56
	skip_button.pressed.connect(_skip_all)
	add_child(skip_button)
	Game.sfx(&"charge", -4.0, 0.0)


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT:
		if stage == 0:
			_start_reveal()
		elif splash_i >= 0:
			if splash_t > 0.8:
				splash_i = -1  # ★5 등장 화면 → 다음 카드
		else:
			reveal_t = 99.0  # 남은 카드 한 번에 공개(★5 등장 화면은 그래도 나온다)


## 끝까지 건너뛰기(★5 등장 화면도 생략)
func _skip_all() -> void:
	_start_reveal()
	for i in results.size():
		_splashed[i] = true
	splash_i = -1
	reveal_t = 99.0


func _process(delta: float) -> void:
	t += delta
	flash = maxf(0.0, flash - delta * 2.5)
	if stage == 0:
		# 별똥별 색이 바뀌는 순간 번쩍(★5는 닿기 직전 금빛으로 뒤집힘)
		if best >= 4 and _crossed(fall_time * 0.45, delta):
			flash = 0.35
			Game.sfx(&"charged", -8.0, 0.0)
		if best == 5 and _crossed(fall_time * 0.86, delta):
			flash = 0.8
			Game.sfx(&"alert", -2.0, 0.0)
			Game.sfx(&"charged", -2.0, 0.0)
		if t >= fall_time:
			_start_reveal()
	elif splash_i >= 0:
		splash_t += delta  # ★5 등장 화면 동안은 다음 카드가 멈춘다
	else:
		reveal_t += delta
		for i in results.size():
			if _charge_of(i) >= 0.0 and not _charged.has(i):
				_charged[i] = true
				Game.sfx(&"charge", -2.0, 0.0)  # ★5 기 모으기 시작
				Game.sfx(&"alert", -6.0, 0.0)
		var now := _revealed_count()
		while shown < now:
			_on_card_revealed(shown)
			shown += 1
		if shown == results.size() and reveal_t > _reveal_at(results.size() - 1) + FLIP_TIME and splash_i < 0:
			ok_button.visible = true
			skip_button.visible = false
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
	return starts[i]


## ★5 카드 기 모으기 정도(0~1, 그 밖이면 -1)
func _charge_of(i: int) -> float:
	if int(results[i]["rarity"]) < 5:
		return -1.0
	var k := (reveal_t - (starts[i] - CHARGE)) / CHARGE
	return k if k >= 0.0 and k < 1.0 else -1.0


func _revealed_count() -> int:
	var n := 0
	for i in results.size():
		if reveal_t >= _reveal_at(i) + FLIP_TIME * 0.5:
			n += 1
	return n


func _on_card_revealed(i: int) -> void:
	var rarity := int(results[i]["rarity"])
	if rarity == 5 and results.size() > 1 and not _splashed.has(i):
		_splashed[i] = true
		splash_i = i  # ★5 전용 등장 화면
		splash_t = 0.0
		Game.sfx(&"success", -2.0, 0.0)
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
		_draw_meteor()
	elif results.size() == 1:
		_draw_single()
	else:
		_draw_ten()
		if splash_i >= 0:
			_draw_splash(results[splash_i])
	for s in sparks:
		Gt.star(self, s["p"], s["r"], Color(s["c"], clampf(s["life"] * 2.0, 0.0, 1.0)))
	if flash > 0.0:
		draw_rect(Rect2(Vector2.ZERO, size), Color(1, 1, 1, flash * 0.8))


func _orb_color() -> Color:
	if best == 5 and t >= fall_time * 0.86:
		return RARITY_COLORS[5]
	if best >= 4 and t >= fall_time * 0.45:
		return RARITY_COLORS[4]
	return RARITY_COLORS[3]


## 별똥별: 오른쪽 위에서 가운데로 떨어진다. 꼬리는 지나온 자리, 바탕엔 반짝이는 작은 별들
func _draw_meteor() -> void:
	var w := size.x
	var h := size.y
	for i in 40:
		var p := Vector2(fmod(i * 137.0, w), fmod(i * 89.0 + 31.0, h * 0.8))
		var tw := 0.5 + 0.5 * sin(t * 3.0 + i)
		draw_circle(p, 1.0 + tw * 1.2, Color(1, 1, 1, 0.25 + 0.5 * tw))
	var col := _orb_color()
	var a := Vector2(w * 1.05, -60.0)
	var b := Vector2(w * 0.5, h * 0.42)
	var k := clampf(t / fall_time, 0.0, 1.0)
	var e := 1.0 - pow(1.0 - k, 2.2)  # 끝에서 느려진다
	var head := a.lerp(b, e)
	for j in range(18, 0, -1):
		var kj := clampf(k - j * 0.018, 0.0, 1.0)
		var pj := a.lerp(b, 1.0 - pow(1.0 - kj, 2.2))
		var f := 1.0 - j / 18.0
		draw_circle(pj, 3.0 + 9.0 * f, Color(col.lightened(0.3), 0.08 + 0.35 * f))
	_soft_glow(head, 90.0 + k * 60.0, col, 0.9)
	draw_circle(head, 12.0, col.lightened(0.5))
	draw_circle(head, 7.0, Color.WHITE)
	# 떨어질 자리에 모이는 빛
	_soft_glow(b, 60.0 + k * 140.0, col, k * 0.6)
	Gt.text(self, Vector2(w / 2.0, h * 0.78), "화면을 눌러 건너뛰기", 15, Color(1, 1, 1, 0.6), 1, false)


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


## 빛줄기: 가운데는 밝고 바깥으로 갈수록 사라지는 가는 줄 여러 개(넓은 단색 띠 대신)
func _draw_rays(c: Vector2, col: Color, alpha: float, length: float) -> void:
	for i in 24:
		var a := i * TAU / 24.0 + t * 0.25
		var w := 0.035 if i % 2 == 0 else 0.018
		var l := length * (0.7 if i % 3 == 0 else 1.0)
		var inner := Color(col.lightened(0.3), alpha * 0.55)
		var outer := Color(col, 0.0)
		draw_polygon(PackedVector2Array([c, c + Vector2.from_angle(a - w) * l, c + Vector2.from_angle(a + w) * l]), PackedColorArray([inner, outer, outer]))


## 부드러운 둥근 빛(여러 겹 원, 바깥일수록 옅게)
func _soft_glow(c: Vector2, r: float, col: Color, alpha: float) -> void:
	for i in 8:
		var k := 1.0 - i / 8.0
		draw_circle(c, r * (0.35 + 0.65 * (1.0 - k)), Color(col, alpha * 0.16 * k))


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
		_draw_card_back(Rect2(c - Vector2(110 * flip, 150), Vector2(220 * flip, 300)), flip, col, _charge_of(0))
		return
	if r["result"] == "shard":
		_shard_card(data, Rect2(c - Vector2(110 * flip, 150), Vector2(220 * flip, 300)), rarity, true)
		_draw_tag(r, Vector2(size.x / 2.0, c.y + 170), 1.0)
		return
	var dst := Rect2(c - Vector2(art_size.x * flip / 2.0, art_size.y / 2.0), Vector2(art_size.x * flip, art_size.y))
	var fill := 1.0
	if rarity == 5:
		fill = clampf((reveal_t - _reveal_at(0) - FLIP_TIME) / 0.5, 0.0, 1.0)  # 검은 실루엣 → 색
		_soft_glow(c, art_h * 0.6, col, 0.8)
	draw_texture_rect(tex, dst, false, Color.BLACK.lerp(Color.WHITE, fill))
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
		_draw_card_back(Rect2(c - Vector2(110 * flip, 150), Vector2(220 * flip, 300)), flip, col, _charge_of(0))
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
		Gt.rank_stars(self, top, Save.rank_of(StringName(str(r["id"]))), 13 * s, false, StringName(str(r["id"])))  # 캐릭터는 지금 별 등급(7성은 큰 빨간 별)
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
			return ["+%d" % int(r["shards"]), Color("ffb31a")]
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


## 뒤집히기 전 카드 뒷면: 남색 바탕 + 사선 줄 + 가운데 헤일로·별. charge(0~1)면 금빛으로 떨리며 빛줄기가 커진다(★5 예고)
func _draw_card_back(r: Rect2, flip: float, glow: Color, charge := -1.0) -> void:
	if r.size.x < 8.0:
		return
	var sweep := -1.0
	if charge >= 0.0:
		var gold := RARITY_COLORS[5]
		var c := r.get_center()
		# 둥근 금빛 + 가는 빛줄기가 점점 세진다
		_soft_glow(c, r.size.y * (0.9 + charge * 0.6), gold, 0.4 + 0.6 * charge)
		_draw_rays(c, gold, charge * 0.8, r.size.y * (0.8 + charge))
		# 금빛 알갱이가 카드로 빨려 든다
		for k in 14:
			var a := k * TAU / 14.0 + t * 2.0
			var d := fmod(1.0 - charge * 1.6 + k * 0.137, 1.0) * r.size.y * 0.9 + r.size.x * 0.4
			draw_circle(c + Vector2.from_angle(a) * d, 2.2, Color(gold.lightened(0.5), 0.9 * charge))
		# 막 뒤집히기 직전에만 살짝 떨린다
		if charge > 0.7:
			r = Rect2(r.position + Vector2(randf_range(-1, 1), randf_range(-1, 1)) * (charge - 0.7) * 12.0, r.size)
		glow = gold
		sweep = fmod(charge * 2.2, 1.0)
	Gt.pbox(self, r, Color("3d3556"), Gt.INK, 2, false, true)
	var inner := r.grow(-Gt.PX * 3.0)
	Gt.pbox(self, inner, Color("4a4166"), Color("6b6290"), 1, false, false)
	if flip > 0.3:
		Gt.star(self, r.get_center(), minf(r.size.y, r.size.x / maxf(flip, 0.01)) * 0.13 * flip, glow.lightened(0.3))
	if sweep >= 0.0:
		# 카드 뒷면을 비스듬히 훑고 지나가는 빛 띠
		var bx := inner.position.x + (inner.size.x + 30.0) * sweep - 15.0
		var x0 := clampf(bx - 10.0, inner.position.x, inner.end.x)
		var x1 := clampf(bx + 10.0, inner.position.x, inner.end.x)
		if x1 > x0:
			draw_rect(Rect2(x0, inner.position.y, x1 - x0, inner.size.y), Color(1, 0.95, 0.75, 0.35))
		Gt.round_line(self, r, 6, Color(RARITY_COLORS[5].lightened(0.3), 0.9), 2.0)


func _draw_ten() -> void:
	if best == 5:
		_draw_rays(Vector2(size.x / 2.0, size.y * 0.42), RARITY_COLORS[5], 0.3, size.y * 0.8)
	for i in results.size():
		var r := results[i]
		var rect := _card_rect(i)
		var p := clampf((reveal_t - _reveal_at(i)) / FLIP_TIME, 0.0, 1.0)
		var flip := absf(cos(p * PI))
		var shown_rect := Rect2(rect.position + Vector2(rect.size.x * (1.0 - flip) / 2.0, 0), Vector2(rect.size.x * flip, rect.size.y))
		if p < 0.5:
			_draw_card_back(shown_rect, flip, Color("6cb8ff"), _charge_of(i))
			# 뒷면 테두리가 등급색으로 미리 빛난다(★4·★5는 숨 쉬듯)
			var rim := RARITY_COLORS[int(r["rarity"])]
			var pulse := 0.6 + 0.4 * sin(t * 5.0 + i) if int(r["rarity"]) >= 4 else 0.5
			Gt.round_line(self, shown_rect.grow(2.0), 6, Color(rim, pulse), 3.0)
			continue
		var rarity := int(r["rarity"])
		var col := RARITY_COLORS[rarity]
		if rarity >= 4:
			_soft_glow(shown_rect.get_center(), shown_rect.size.y * (0.75 + 0.05 * sin(t * 4.0)), col, 0.9 if rarity == 5 else 0.55)
		if shown_rect.size.x > 8.0:
			if r.has("weapon"):
				_weapon_card(r["weapon"], rarity, shown_rect, flip)
			elif r["result"] == "shard":
				_shard_card(Save.character(r["id"]), shown_rect, rarity, flip > 0.8)
			else:
				Gt.char_card(self, Save.character(r["id"]), shown_rect, true, flip > 0.8)
		if flip > 0.8:
			_draw_tag(r, Vector2(rect.get_center().x, rect.end.y + 6), 0.7)


## 무기 카드: 등급색 테두리 + 어두운 바탕 + 무기 그림 + 별 + 이름
func _weapon_card(w: StringName, rarity: int, r: Rect2, flip: float) -> void:
	Weapons.draw_card(self, w, r, flip > 0.8, -1, t)


## 조각 카드(이미 있는 캐릭터): 어두운 보석 바탕 + 등급색 결정 + 가운데 얼굴 + "OO 조각"
func _shard_card(data: CharacterData, r: Rect2, rarity: int, show_name: bool) -> void:
	if r.size.x < 8.0:
		return
	var col := RARITY_COLORS[rarity]
	Gt.pbox(self, r, col.darkened(0.25), Gt.INK, 2, true, true)
	var inner := r.grow(-Gt.PX * 2.0)
	Gt.grad(self, inner, Color("2a1f45"), col.darkened(0.55))
	var c := inner.get_center() + Vector2(0, -inner.size.y * 0.08)
	var rad := minf(inner.size.x, inner.size.y) * 0.4
	var hexa := PackedVector2Array()
	for k in 6:
		hexa.append(c + Vector2.from_angle(-PI / 2.0 + k * TAU / 6.0) * Vector2(rad * 0.86, rad * 1.08))
	draw_colored_polygon(hexa, Color(col.lightened(0.25), 0.9))
	hexa.append(hexa[0])
	draw_polyline(hexa, Color.WHITE, 2.0)
	Gt.circle_tex(self, data.face, c, rad * 0.68)
	draw_arc(c, rad * 0.68, 0, TAU, 32, Color(1, 1, 1, 0.8), 2.0)
	for k in 4:
		var sp := c + Vector2.from_angle(t * 1.2 + k * TAU / 4.0) * rad * 1.05
		Gt.sparkle(self, sp, 3.5 + sin(t * 5.0 + k) * 1.5, Color(1, 1, 1, 0.85))
	if show_name:
		var fs := int(clampf(inner.size.x / 6.5, 10, 22))
		Gt.title(self, Vector2(inner.get_center().x, inner.end.y - fs * 0.6), data.display_name + " 조각", fs, Color.WHITE, 1)


## ★5 전용 등장 화면(10회 중): 어둡게 → 금빛 + 검은 실루엣 → 색이 차오르고 이름이 미끄러져 들어온다
func _draw_splash(r: Dictionary) -> void:
	var w := size.x
	var h := size.y
	var k := splash_t
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.05, 0.02, 0.08, minf(0.88, k * 3.0)))
	var gold := RARITY_COLORS[5]
	var c := Vector2(w / 2.0, h * 0.42)
	_draw_rays(c, gold, minf(1.0, k * 2.0) * 0.7, h * 0.7)
	_soft_glow(c, h * 0.35, gold, minf(1.0, k * 2.0))
	var fill := clampf((k - 0.35) / 0.5, 0.0, 1.0)
	var title := ""
	if r.has("weapon"):
		var wid: StringName = r["weapon"]
		Weapons.draw_icon(self, wid, c, 320.0, Color.BLACK.lerp(Color.WHITE, fill))
		title = Weapons.name_of(wid)
	else:
		var data := Save.character(r["id"])
		var tex := data.portraits[0]
		var art_h := h * 0.6
		var sz := tex.get_size() * (art_h / tex.get_height())
		draw_texture_rect(tex, Rect2(c - sz / 2.0, sz), false, Color.BLACK.lerp(Color.WHITE, fill))
		title = data.display_name
	# 이름: 왼쪽에서 미끄러져 들어온다
	var slide := clampf((k - 0.6) / 0.35, 0.0, 1.0)
	var tx := lerpf(-200.0, w / 2.0, 1.0 - pow(1.0 - slide, 3.0))
	if slide > 0.0:
		var y := h * 0.72
		Gt.rank_stars(self, Vector2(tx, y - 20), 5, 14)
		Gt.text(self, Vector2(tx, y + 30), title, 40, Color.WHITE, 1, true, 8, Gt.INK)
		_draw_tag(r, Vector2(tx, y + 44), 1.0)
	if k > 1.0:
		Gt.text(self, Vector2(w / 2.0, h * 0.94), "화면을 눌러 계속", 15, Color(1, 1, 1, 0.5 + 0.3 * sin(k * 4.0)), 1, false)
