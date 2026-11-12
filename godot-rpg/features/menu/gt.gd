class_name Gt
extends RefCounted
## 로비·HUD용 UI 그리기 도구(팝 판타지풍): 금색 장식 테두리 창, 광택 그라데이션 버튼(양 끝 보석),
## 리본 이름판, 보석 구슬, 라벤더 다마스크 무늬 배경. 아이콘은 Ravenmore 손그림(없으면 닌자 어드벤처 도트).
## 모두 정적 함수라 어떤 Control의 _draw()에서도 쓴다.

const BOLD := preload("res://assets/fonts/maple_bold.woff")
const LIGHT := preload("res://assets/fonts/maple_light.woff")

## 아이콘 이름 → [Ravenmore 그림(git 제외 폴더), 없을 때 쓰는 도트 그림]
const ICON_PATHS: Dictionary[StringName, Array] = {
	&"coin": ["coin", "coin"], &"gem": ["gem", "gem"], &"moneybag": ["moneybag", "moneybag"],
	&"cup": ["cup", "cup"], &"heart": ["heart", "heart"], &"sword": ["sword", "sword"],
	&"book": ["book", "book"], &"scroll": ["scroll", "scroll"], &"chest": ["", "chest"], &"skull": ["", "skull"],
	&"map": ["map", "scroll"], &"potion": ["potion", "heart"], &"letter": ["letter", "letter"],
	&"gem_red": ["gem_red", "gem"], &"gem_green": ["gem_green", "gem"], &"gem_yellow": ["gem_yellow", "gem"],
	&"helmet": ["helmet", "slot_armor"], &"shield": ["shield", "slot_guard"],
	&"slot_guard": ["slot_guard", "slot_guard"], &"slot_armor": ["slot_armor", "slot_armor"],
	&"slot_ring": ["slot_ring", "slot_ring"], &"slot_amulet": ["", "slot_amulet"], &"slot_boot": ["slot_boot", "slot_boot"],
	&"slot_guard_off": ["slot_guard", "slot_guard_off"], &"slot_armor_off": ["slot_armor", "slot_armor_off"],
	&"slot_ring_off": ["slot_ring", "slot_ring_off"], &"slot_boot_off": ["slot_boot", "slot_boot_off"],
}
static var _icons: Dictionary[StringName, Texture2D] = {}

const GOLD_D := Color("a86c1c")
const GOLD := Color("e9b949")
const GOLD_L := Color("fff0b2")
const PLUM := Color("3a2546")  # 어두운 창 바탕
const INK := Color("2b1a33")  # 외곽선(진한 자주)
const NAVY := Color("3e2a46")  # 기본 글씨
const NAVY_SOFT := Color("74607c")
const GRAY := Color("9b93ad")
const LINE := Color("e2d2b0")
const CREAM := Color("fff8ec")
const CREAM_DARK := Color("efd9ae")
const BLUE := Color("3fb0ff")
const BLUE_DEEP := Color("1d7fd8")
const SKY := Color("c4eaff")
const YELLOW := Color("ffcc33")
const PINK := Color("ff6b9a")
const GREEN := Color("46c46a")
const STAR := Color("ffd23a")
## 등급별 별 색: 3성 노랑, 4성 주황, 5성 보라
## 별 등급 색(별과 로비 아우라가 같은 색): 3성 노랑 · 4성 주황 · 5성 보라 · 6성 파랑 · 7성 빨강
const STAR_BY_RARITY := {3: Color("ffd23a"), 4: Color("ff8a2a"), 5: Color("c56bff"), 6: Color("3fa9ff"), 7: Color("ff2a3a")}
const SHADOW := Color(0.18, 0.06, 0.2, 0.28)
## 등급 색: ★3 하늘, ★4 보라, ★5 금
const RARITY: Dictionary[int, Color] = {3: Color("5db8ff"), 4: Color("b77cff"), 5: Color("ffc531")}
## 속성별 색(불·물·바람·땅·빛·어둠 순): 하늘 위·아래, 카드 테두리
const ELEMENT_SKY: Array = [
	[Color("ff9a6b"), Color("ffe3c4")], [Color("74cbff"), Color("d9f3ff")], [Color("6fdcae"), Color("dcfaea")],
	[Color("d4b46a"), Color("f6ebc6")], [Color("ffd75e"), Color("fff6d2")], [Color("9b85de"), Color("e6dcff")],
]
const ELEMENT_CARD: Array[Color] = [Color("ff7a4d"), Color("4fb4ff"), Color("4fcf8f"), Color("c99a4c"), Color("ffc533"), Color("a37ce8")]
## 도트 한 칸 크기(테두리·계단 모서리 단위)
const PX := 3.0

enum Kind { YELLOW, BLUE, WHITE, PINK, GRAY, NAVY, GREEN }

## 캐릭터 영문 이름(소제목용)
const ROMAN: Dictionary[StringName, String] = {
	&"kemo1": "SHIRO", &"kemo2": "MIZUHA", &"kemo3": "KARA", &"fairy3": "LEAF", &"fairy2": "AQUA",
	&"maid2": "BERRY", &"maid3": "LEMON", &"maid1": "LINEN", &"maid4": "COTTON", &"fairy1": "FLORA", &"scarlet": "SCARLET",
}


static func roman(id: StringName) -> String:
	return ROMAN.get(id, String(id).to_upper())


# ── 글씨 ──

## align: 0 왼쪽, 1 가운데, 2 오른쪽. italic이면 오른쪽으로 기울인다(영문 소제목용).
static func text(ci: CanvasItem, pos: Vector2, s: String, size: int, color := NAVY, align := 0, bold := true, outline := 0, outline_color := INK, italic := false) -> void:
	var f: Font = BOLD if bold else LIGHT
	var w := f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var p := pos - Vector2(w * align / 2.0, 0)
	if italic:
		ci.draw_set_transform_matrix(Transform2D(Vector2(1, 0), Vector2(-0.2, 1), p))
		p = Vector2.ZERO
	if outline > 0:
		ci.draw_string_outline(f, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, outline, outline_color)
	ci.draw_string(f, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)
	if italic:
		ci.draw_set_transform_matrix(Transform2D.IDENTITY)


## 흰 글씨 + 진한 외곽선(버튼·그림 위 글씨)
static func title(ci: CanvasItem, pos: Vector2, s: String, size: int, color := Color.WHITE, align := 0) -> void:
	text(ci, pos, s, size, color, align, true, maxi(4, int(size / 4.0)), INK)


static func width(s: String, size: int, bold := true) -> float:
	var f: Font = BOLD if bold else LIGHT
	return f.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x


# ── 상자(둥근 금테) ──

## 둥근 사각형 꼭짓점(모서리마다 seg개)
static func round_pts(r: Rect2, radius: float, seg := 6) -> PackedVector2Array:
	# 반지름이 변의 절반에 닿으면 꼭짓점이 겹쳐 도형이 깨지므로 조금 줄인다
	var rad := clampf(radius, 0.0, minf(r.size.x, r.size.y) / 2.0 - 0.75)
	if rad < 0.5:
		return PackedVector2Array([r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y)])
	var pts := PackedVector2Array()
	var centers := [Vector2(r.position.x + rad, r.position.y + rad), Vector2(r.end.x - rad, r.position.y + rad), Vector2(r.end.x - rad, r.end.y - rad), Vector2(r.position.x + rad, r.end.y - rad)]
	for k in 4:
		for i in seg + 1:
			var a := PI + k * PI / 2.0 + i * (PI / 2.0) / seg
			pts.append(centers[k] + Vector2.from_angle(a) * rad)
	return pts


## 세로 그라데이션 둥근 사각형
static func round_grad(ci: CanvasItem, r: Rect2, radius: float, top: Color, bottom: Color) -> void:
	if r.size.x < 3.0 or r.size.y < 3.0:
		return
	var pts := round_pts(r, radius)
	var cols := PackedColorArray()
	for p in pts:
		cols.append(top.lerp(bottom, clampf((p.y - r.position.y) / r.size.y, 0.0, 1.0)))
	ci.draw_polygon(pts, cols)


static func round_line(ci: CanvasItem, r: Rect2, radius: float, color: Color, w := 1.5) -> void:
	if r.size.x < 1.0 or r.size.y < 1.0:
		return
	var pts := round_pts(r, radius)
	pts.append(pts[0])
	ci.draw_polyline(pts, color, w, true)


## 금테: r 안쪽 둘레에 두께 th의 입체 금테(진한 선 + 금 그라데이션 + 안쪽 진한 선)
static func gold_frame(ci: CanvasItem, r: Rect2, radius: float, th := 4.0) -> void:
	round_grad(ci, r, radius, GOLD_L, GOLD_D)
	round_grad(ci, r.grow(-th * 0.45), maxf(radius - th * 0.45, 0.0), GOLD, GOLD_D.lightened(0.15))
	round_line(ci, r, radius, INK, 1.6)
	round_line(ci, r.grow(-th), maxf(radius - th, 0.0), Color(GOLD_D.darkened(0.45), 0.9), 1.2)


## 모서리 장식(금 마름모 + 작은 보석)
static func corner_gems(ci: CanvasItem, r: Rect2, s := 7.0, gem_color := Color("ff5d8f")) -> void:
	for c in [r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y)]:
		diamond(ci, c, s + 2.0, INK)
		diamond(ci, c, s, GOLD)
		diamond(ci, c + Vector2(0, -s * 0.1), s * 0.45, gem_color)
		ci.draw_circle(c + Vector2(-s * 0.12, -s * 0.32), s * 0.12, Color(1, 1, 1, 0.8))


## 기본 상자: (그림자) + 금테(outline이 INK일 때, 아니면 그 색 얇은 테) + 그라데이션 바탕 + (윗부분 광택)
## steps는 모서리 둥글기 정도(옛 도트 계단 수와 호환)
static func pbox(ci: CanvasItem, r: Rect2, fill: Color, outline := INK, steps := 2, shadow := true, bevel := true) -> void:
	if r.size.x < 6.0 or r.size.y < 6.0:
		return  # 아직 크기가 안 정해진 칸(폭 0 등)은 건너뛴다
	var rad := 3.0 + steps * 3.5
	if shadow:
		round_grad(ci, Rect2(r.position + Vector2(0, 3), r.size), rad, Color(SHADOW, 0.0), SHADOW)
	var inner := r
	if outline == INK and minf(r.size.x, r.size.y) >= 16.0:
		var th := 4.0 if minf(r.size.x, r.size.y) >= 40.0 else 3.0
		gold_frame(ci, r, rad, th)
		inner = r.grow(-th)
	else:
		round_grad(ci, r, rad, outline.lightened(0.1), outline.darkened(0.1))
		inner = r.grow(-1.6)
	var irad := maxf(rad - (r.size.x - inner.size.x) / 2.0, 0.0)
	round_grad(ci, inner, irad, fill.lightened(0.16), fill.darkened(0.12))
	if bevel and inner.size.y > 10.0:
		round_grad(ci, Rect2(inner.position + Vector2(2, 1.5), Vector2(inner.size.x - 4, inner.size.y * 0.45)), maxf(irad - 2.0, 0.0), Color(1, 1, 1, 0.3), Color(1, 1, 1, 0.02))


## 크림색 패널(금테 + 아래쪽 분홍 번짐 + 모서리 장식)
static func panel(ci: CanvasItem, r: Rect2, _radius := 0.0, alpha := 1.0) -> void:
	pbox(ci, r, Color(CREAM, alpha))
	var inner := r.grow(-4)
	if inner.size.x > 40 and inner.size.y > 30:
		round_grad(ci, Rect2(inner.position.x, inner.get_center().y, inner.size.x, inner.size.y / 2.0), 4, Color(1, 0.9, 0.95, 0.0), Color(1, 0.86, 0.93, 0.5))
		corner_gems(ci, r.grow(-1), 5.0)


## 작은 이름판(양 끝이 뾰족한 금테 명판)
static func tag(ci: CanvasItem, r: Rect2, color: Color) -> void:
	var h := r.size.y
	var n := minf(h * 0.32, 6.0)
	if r.size.y < 8.0 or r.size.x < n * 2.0 + 6.0:
		return
	var pts := PackedVector2Array([r.position + Vector2(n, 0), Vector2(r.end.x - n, r.position.y), Vector2(r.end.x, r.position.y + h / 2.0), Vector2(r.end.x - n, r.end.y), Vector2(r.position.x + n, r.end.y), Vector2(r.position.x, r.position.y + h / 2.0)])
	var c := r.get_center()
	var outer := PackedVector2Array()
	for p in pts:
		outer.append(c + (p - c) * Vector2((r.size.x + 4.4) / r.size.x, (h + 4.4) / h))
	ci.draw_colored_polygon(outer, INK)
	ci.draw_colored_polygon(pts, GOLD)
	var inner := PackedVector2Array()
	var cols := PackedColorArray()
	for p in pts:
		var q := c + (p - c) * Vector2((r.size.x - 4.0) / r.size.x, (h - 4.0) / h)
		inner.append(q)
		cols.append(color.lightened(0.22).lerp(color.darkened(0.12), clampf((q.y - r.position.y) / h, 0.0, 1.0)))
	ci.draw_polygon(inner, cols)
	ci.draw_line(Vector2(r.position.x + n + 1, r.position.y + 3), Vector2(r.end.x - n - 1, r.position.y + 3), Color(1, 1, 1, 0.35), 1.5)


static func rrect(ci: CanvasItem, r: Rect2, radius: float, color: Color, border := 0.0, border_color := LINE, shadow := 0, shadow_offset := Vector2(0, 3)) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(int(maxf(radius, 0.0)))
	sb.corner_detail = 8
	sb.anti_aliasing = true
	if border > 0.0:
		sb.set_border_width_all(int(ceilf(border)))
		sb.border_color = border_color
	if shadow > 0:
		sb.shadow_size = shadow
		sb.shadow_color = SHADOW
		sb.shadow_offset = shadow_offset
	ci.draw_style_box(sb, r)


static func grad(ci: CanvasItem, r: Rect2, top: Color, bottom: Color) -> void:
	ci.draw_polygon(PackedVector2Array([r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y)]),
		PackedColorArray([top, top, bottom, bottom]))


static func grad_h(ci: CanvasItem, r: Rect2, left: Color, right: Color) -> void:
	ci.draw_polygon(PackedVector2Array([r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y)]),
		PackedColorArray([left, right, right, left]))


## 진행 막대: 금테 + 어두운 홈 + 그라데이션 채움 + 광택
static func bar(ci: CanvasItem, r: Rect2, ratio: float, color := BLUE) -> void:
	if r.size.x < 8.0 or r.size.y < 6.0:
		return
	var rad := r.size.y / 2.0
	gold_frame(ci, r, rad, 2.5)
	var inner := r.grow(-2.5)
	round_grad(ci, inner, inner.size.y / 2.0, Color("241629"), Color("4a3352"))
	var w := inner.size.x * clampf(ratio, 0.0, 1.0)
	if w >= inner.size.y * 0.6:
		var fill := Rect2(inner.position, Vector2(w, inner.size.y))
		round_grad(ci, fill, inner.size.y / 2.0, color.lightened(0.35), color.darkened(0.15))
		round_grad(ci, Rect2(fill.position + Vector2(2, 1), Vector2(fill.size.x - 4, fill.size.y * 0.4)), inner.size.y / 4.0, Color(1, 1, 1, 0.5), Color(1, 1, 1, 0.05))


static func diamond(ci: CanvasItem, c: Vector2, r: float, color: Color) -> void:
	ci.draw_colored_polygon(PackedVector2Array([c + Vector2(0, -r), c + Vector2(r * 0.7, 0), c + Vector2(0, r), c + Vector2(-r * 0.7, 0)]), color)


static func star_pts(c: Vector2, r: float) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in 10:
		pts.append(c + Vector2.from_angle(-PI / 2.0 + i * PI / 5.0) * (r if i % 2 == 0 else r * 0.48))
	return pts


## 통통한 별(진한 외곽선)
static func star(ci: CanvasItem, c: Vector2, r: float, color := STAR) -> void:
	var outer := PackedVector2Array()
	for i in 10:
		outer.append(c + Vector2.from_angle(-PI / 2.0 + i * PI / 5.0) * ((r + 2.6) if i % 2 == 0 else (r * 0.48 + 2.0)))
	ci.draw_colored_polygon(outer, INK)
	ci.draw_colored_polygon(star_pts(c, r), color)
	ci.draw_circle(c + Vector2(-r * 0.2, -r * 0.18), r * 0.15, Color(1, 1, 1, 0.7))


## 반짝이(네 갈래 별빛)
## 7성 별: 빛나는 큰 빨간 별 하나
static func red_star(ci: CanvasItem, c: Vector2, r: float) -> void:
	var col: Color = STAR_BY_RARITY[7]
	ci.draw_circle(c, r * 1.25, Color(col, 0.25))
	star(ci, c, r, col)
	ci.draw_circle(c + Vector2(-r * 0.18, -r * 0.2), r * 0.16, Color(1, 1, 1, 0.75))


## (예전) 무지개 별
static func rainbow_star(ci: CanvasItem, c: Vector2, r: float) -> void:
	var pts := star_pts(c, r)
	var out := star_pts(c, r + 2.0)
	ci.draw_colored_polygon(out, INK)
	var cols := PackedColorArray()
	for i in pts.size():
		cols.append(Color.from_hsv(float(i) / pts.size(), 0.75, 1.0))
	# 가운데 흰빛에서 꼭짓점 색으로 퍼지게 삼각형 부채로 그린다
	for i in pts.size():
		var j := (i + 1) % pts.size()
		ci.draw_polygon(PackedVector2Array([c, pts[i], pts[j]]), PackedColorArray([Color.WHITE, cols[i], cols[j]]))
	ci.draw_circle(c + Vector2(-r * 0.18, -r * 0.2), r * 0.16, Color(1, 1, 1, 0.8))


## 별 등급 줄(가운데 맞춤): 3~6성은 그 수만큼 등급색 별, 7성은 큰 빨간 별 하나. 그린 폭을 돌려준다
static func rank_stars(ci: CanvasItem, c: Vector2, rank: int, r: float, left := false) -> float:
	if rank >= 7:
		var big := r * 1.45
		red_star(ci, c + Vector2(big if left else 0.0, 0), big)
		return big * 2.0
	var gap := r * 2.15
	var col: Color = STAR_BY_RARITY.get(rank, STAR)
	var x0 := c.x + (r if left else -(rank - 1) * gap / 2.0)
	for i in rank:
		star(ci, Vector2(x0 + i * gap, c.y), r, col)
	return (rank - 1) * gap + r * 2.0


static func sparkle(ci: CanvasItem, c: Vector2, s: float, color := Color.WHITE) -> void:
	var l := s * 1.6
	var w := s * 0.28
	ci.draw_colored_polygon(PackedVector2Array([c + Vector2(0, -l), c + Vector2(w, -w), c + Vector2(l, 0), c + Vector2(w, w), c + Vector2(0, l), c + Vector2(-w, w), c + Vector2(-l, 0), c + Vector2(-w, -w)]), color)
	ci.draw_circle(c, w * 1.2, Color(1, 1, 1, color.a))


# ── 버튼 ──

## [본체, 밝은 색, 두께(어두운 색), 글씨색]
static func kind_colors(kind: int) -> Array[Color]:
	match kind:
		Kind.YELLOW:
			return [Color("ffc933"), Color("fff08a"), Color("d6841c"), Color.WHITE]
		Kind.BLUE:
			return [Color("45b4ff"), Color("b0e6ff"), Color("1b6fc4"), Color.WHITE]
		Kind.PINK:
			return [Color("ff6f9e"), Color("ffc4d8"), Color("c93a6c"), Color.WHITE]
		Kind.GREEN:
			return [Color("52cc6e"), Color("bdf3ad"), Color("2a8f45"), Color.WHITE]
		Kind.NAVY:
			return [Color("4a4166"), Color("7a6f9a"), Color("2a2238"), Color.WHITE]
		Kind.GRAY:
			return [Color("c4bfd2"), Color("e8e5ef"), Color("8e88a0"), Color("f4f2f8")]
		_:
			return [CREAM, Color.WHITE, CREAM_DARK, NAVY]


## 광택 버튼: 그림자 + 금테 + 세로 그라데이션 + 윗부분 광택 + (넓으면) 양 끝 보석. 누르면 살짝 내려가고 어두워진다.
static func button(ci: CanvasItem, r: Rect2, kind: int, down := false) -> void:
	var c := kind_colors(kind)
	if r.size.x < 20.0 or r.size.y < 16.0:
		return
	var b := Rect2(r.position, r.size - Vector2(0, 4))
	var rad := minf(b.size.y * 0.32, 16.0)
	if down:
		b.position.y += 3
	else:
		round_grad(ci, Rect2(b.position + Vector2(0, 4), b.size), rad, Color(SHADOW, 0.1), SHADOW)
	gold_frame(ci, b, rad, 3.5)
	var inner := b.grow(-3.5)
	var top: Color = c[1].lerp(c[0], 0.35)
	var bottom: Color = c[2]
	if down:
		top = top.darkened(0.12)
		bottom = bottom.darkened(0.12)
	round_grad(ci, inner, maxf(rad - 3.5, 0.0), top, bottom)
	round_grad(ci, Rect2(inner.position + Vector2(3, 2), Vector2(inner.size.x - 6, inner.size.y * 0.42)), maxf(rad - 6.0, 0.0), Color(1, 1, 1, 0.45), Color(1, 1, 1, 0.06))
	if b.size.x > b.size.y * 2.6:
		var gem_c: Color = Color("ff5d8f") if kind == Kind.YELLOW else c[0].lightened(0.1)
		for x in [b.position.x + 1.0, b.end.x - 1.0]:
			orb(ci, Vector2(x, b.get_center().y), minf(b.size.y * 0.2, 9.0), gem_c)


## 보석 구슬(금테 + 반사광)
static func orb(ci: CanvasItem, c: Vector2, r: float, color: Color) -> void:
	ci.draw_circle(c, r + 2.6, INK)
	ci.draw_circle(c, r + 1.6, GOLD)
	ci.draw_circle(c, r, color.darkened(0.25))
	ci.draw_circle(c + Vector2(-r * 0.12, -r * 0.12), r * 0.78, color)
	ci.draw_circle(c + Vector2(-r * 0.3, -r * 0.35), r * 0.28, Color(1, 1, 1, 0.75))


# ── 배경 ──

## 다마스크 무늬 하나(네 꽃잎 + 가운데 마름모 + 점)
static func damask(ci: CanvasItem, c: Vector2, s: float, color: Color) -> void:
	for k in 4:
		var d := Vector2.from_angle(k * PI / 2.0 - PI / 2.0)
		var petal := PackedVector2Array()
		for i in 13:
			var tt := i / 12.0
			petal.append(c + d * s * (0.15 + tt * 0.85) + d.orthogonal() * s * 0.28 * sin(tt * PI))
		for i in 13:
			var tt := 1.0 - i / 12.0
			petal.append(c + d * s * (0.15 + tt * 0.85) - d.orthogonal() * s * 0.28 * sin(tt * PI))
		ci.draw_colored_polygon(petal, color)
	diamond(ci, c, s * 0.28, color)
	for k in 4:
		ci.draw_circle(c + Vector2.from_angle(k * PI / 2.0 + PI / 4.0) * s * 0.75, s * 0.09, color)


## 배경: 속성색이 섞인 라벤더 그라데이션 + 다마스크 무늬 + 빛망울 + 반짝이
static func background(ci: CanvasItem, r: Rect2, t: float, top := Color("74cbff"), bottom := Color("d9f3ff")) -> void:
	grad(ci, r, top.lerp(Color("efe0fb"), 0.55), bottom.lerp(Color("fff1f8"), 0.55))
	var w := r.size.x
	var h := r.size.y
	var step := 74.0
	var motif := Color(1, 1, 1, 0.32)
	var y := r.position.y - step / 2.0
	var row := 0
	while y < r.end.y + step:
		var x := r.position.x - step / 2.0 + (step / 2.0 if row % 2 else 0.0)
		while x < r.end.x + step:
			damask(ci, Vector2(x, y), step * 0.32, motif)
			ci.draw_circle(Vector2(x + step / 2.0, y), 2.2, Color(1, 1, 1, 0.4))
			x += step
		y += step / 2.0
		row += 1
	for i in 8:
		var p := r.position + Vector2(fposmod(i * 131.0 + t * 6.0 * (1 + i % 3), w + 120.0) - 60.0, fmod(i * 197.0, h))
		ci.draw_circle(p, 26.0 + (i % 3) * 14.0, Color(1, 1, 1, 0.08 + 0.03 * (i % 2)))
	for i in 12:
		var tw := 0.5 + 0.5 * sin(t * 2.2 + i * 1.7)
		var p := r.position + Vector2(fmod(i * 97.0 + 30.0, w), fmod(i * 157.0 + 50.0, h * 0.95))
		sparkle(ci, p, 2.0 + tw * 4.0, Color(1, 1, 1, 0.3 + 0.6 * tw))


## 캐릭터가 서는 마법진 받침대(금 고리 + 빛 + 도는 마름모). 예전 이름(island)을 그대로 쓴다.
static func island(ci: CanvasItem, c: Vector2, w: float, h: float) -> void:
	var t := Time.get_ticks_msec() / 1000.0
	ci.draw_set_transform(c, 0.0, Vector2(1.0, h / w))
	var big := w / 2.0
	ci.draw_circle(Vector2.ZERO, big, Color(1, 0.85, 0.95, 0.35))
	ci.draw_circle(Vector2.ZERO, big * 0.7, Color(1, 1, 1, 0.3))
	ci.draw_arc(Vector2.ZERO, big, 0, TAU, 96, Color(GOLD_D, 0.9), 7.0, true)
	ci.draw_arc(Vector2.ZERO, big, 0, TAU, 96, GOLD, 4.0, true)
	ci.draw_arc(Vector2.ZERO, big * 0.82, 0, TAU, 96, Color(GOLD, 0.8), 2.5, true)
	ci.draw_arc(Vector2.ZERO, big * 0.5, 0, TAU, 64, Color(GOLD, 0.6), 2.0, true)
	for i in 12:
		var a := i * TAU / 12.0 + t * 0.4
		diamond(ci, Vector2.from_angle(a) * big * 0.91, 7.0, Color(GOLD_L, 0.9))
	for i in 6:
		var a := -t * 0.6 + i * TAU / 6.0
		ci.draw_line(Vector2.from_angle(a) * big * 0.5, Vector2.from_angle(a + TAU / 3.0) * big * 0.5, Color(GOLD, 0.45), 2.0, true)
	ci.draw_set_transform_matrix(Transform2D.IDENTITY)


## 캐릭터 뒤 빛: 천천히 도는 햇살 + 동그란 빛
static func burst(ci: CanvasItem, c: Vector2, r: float, color: Color, t: float) -> void:
	for i in 12:
		var a := i * TAU / 12.0 + t * 0.15
		ci.draw_colored_polygon(PackedVector2Array([c, c + Vector2.from_angle(a - 0.12) * r, c + Vector2.from_angle(a + 0.12) * r]), Color(color, 0.16))
	ci.draw_circle(c, r * 0.55, Color(color, 0.18))
	ci.draw_circle(c, r * 0.35, Color(color, 0.18))


# ── 아이콘 ──

## 아이콘 그림(처음 한 번 불러 둔다): Ravenmore 그림이 있으면 그것, 없으면 도트 그림
static func icon_tex(name: StringName) -> Texture2D:
	if not _icons.has(name):
		var paths: Array = ICON_PATHS.get(name, ["", String(name)])
		var rv := "res://assets/vendor/ravenmore/icons/%s.png" % paths[0]
		var px := "res://assets/ninja/ui_hd/%s.png" % paths[1]
		_icons[name] = load(rv) if paths[0] != "" and ResourceLoader.exists(rv) else load(px)
	return _icons[name]


## 아이콘을 size 칸 안에 비율 유지해 그린다
static func icon(ci: CanvasItem, name: StringName, c: Vector2, size: float, tint := Color.WHITE) -> void:
	var tex := icon_tex(name)
	var ts := tex.get_size()
	var s := ts * (size / maxf(ts.x, ts.y))
	ci.draw_texture_rect(tex, Rect2(c - s / 2.0, s), false, tint)


static func gem(ci: CanvasItem, c: Vector2, r: float) -> void:
	icon(ci, &"gem", c, r * 3.6)


static func coin(ci: CanvasItem, c: Vector2, r: float) -> void:
	icon(ci, &"coin", c, r * 3.0)


static func element_color(element: int) -> Color:
	if element == CharacterData.Element.LIGHT:
		return Color("f2b51d")
	return CharacterData.ELEMENT_COLORS[element].darkened(0.08)


## 속성 배지: 금테 보석 구슬 + 흰 기호
static func element_badge(ci: CanvasItem, c: Vector2, r: float, element: int) -> void:
	var col := element_color(element)
	orb(ci, c, r, col)
	element_glyph(ci, c + Vector2(0, 0.5), r * 1.25, element, Color.WHITE, col)


static func element_glyph(ci: CanvasItem, c: Vector2, s: float, element: int, color: Color, bg := Color.TRANSPARENT) -> void:
	match element:
		CharacterData.Element.FIRE:
			var pts := PackedVector2Array()
			for i in 24:
				var a := i * TAU / 24.0
				var rr := s * 0.3
				var p := Vector2(sin(a) * rr, cos(a) * rr * 0.9)
				if p.y < 0.0:
					p.x *= 1.0 + p.y / (rr * 1.4)
					p.y *= 1.6
				pts.append(c + p + Vector2(0, s * 0.08))
			ci.draw_colored_polygon(pts, color)
		CharacterData.Element.WATER:
			var pts := PackedVector2Array()
			for i in 24:
				var a := i * TAU / 24.0
				var rr := s * 0.27
				var p := Vector2(sin(a) * rr, cos(a) * rr)
				if p.y < 0.0:
					p.x *= 1.0 + p.y / (rr * 1.1)
					p.y *= 1.75
				pts.append(c + p + Vector2(0, s * 0.1))
			ci.draw_colored_polygon(pts, color)
		CharacterData.Element.WIND:
			for k in 2:
				var rr := s * (0.32 - k * 0.13)
				ci.draw_arc(c + Vector2(0, k * s * 0.04), rr, -PI * 0.05 + k * 0.7, PI * 1.3 + k * 0.7, 18, color, s * 0.09, true)
		CharacterData.Element.EARTH:
			var leaf := PackedVector2Array()
			for i in 16:
				var tt := i / 15.0
				leaf.append(c + Vector2(lerpf(-0.36, 0.36, tt) * s, -sin(tt * PI) * s * 0.24).rotated(-0.7))
			for i in 16:
				var tt := 1.0 - i / 15.0
				leaf.append(c + Vector2(lerpf(-0.36, 0.36, tt) * s, sin(tt * PI) * s * 0.24).rotated(-0.7))
			ci.draw_colored_polygon(leaf, color)
		CharacterData.Element.LIGHT:
			for i in 8:
				var a := i * TAU / 8.0
				ci.draw_line(c + Vector2.from_angle(a) * s * 0.24, c + Vector2.from_angle(a) * s * 0.38, color, s * 0.08, true)
			ci.draw_circle(c, s * 0.17, color)
		CharacterData.Element.DARK:
			ci.draw_circle(c, s * 0.3, color)
			ci.draw_circle(c + Vector2(s * 0.14, -s * 0.1), s * 0.26, bg if bg.a > 0.0 else Color("2b2040"))


static func lock(ci: CanvasItem, c: Vector2, s: float, color := GRAY) -> void:
	# 고리(위) + 몸통(아래) + 열쇠 구멍
	var ring := c + Vector2(0, -s * 0.18)
	ci.draw_arc(ring, s * 0.2, PI, TAU, 12, INK, s * 0.09 + 4.0)
	ci.draw_line(ring + Vector2(-s * 0.2, 0), ring + Vector2(-s * 0.2, s * 0.12), INK, s * 0.09 + 4.0)
	ci.draw_line(ring + Vector2(s * 0.2, 0), ring + Vector2(s * 0.2, s * 0.12), INK, s * 0.09 + 4.0)
	ci.draw_arc(ring, s * 0.2, PI, TAU, 12, color, s * 0.09)
	ci.draw_line(ring + Vector2(-s * 0.2, 0), ring + Vector2(-s * 0.2, s * 0.12), color, s * 0.09)
	ci.draw_line(ring + Vector2(s * 0.2, 0), ring + Vector2(s * 0.2, s * 0.12), color, s * 0.09)
	var body := Rect2(c + Vector2(-s * 0.32, -s * 0.06), Vector2(s * 0.64, s * 0.48))
	ci.draw_rect(body.grow(2.0), INK)
	ci.draw_rect(body, color)
	ci.draw_rect(Rect2(body.get_center() - Vector2(s * 0.04, s * 0.08), Vector2(s * 0.08, s * 0.16)), INK)


## 높은 등급 카드 둘레의 빛(4성 주황, 5성 보라 + 반짝이). 시간에 따라 숨 쉬듯 밝아졌다 어두워진다
static func aura(ci: CanvasItem, r: Rect2, rarity: int, owned := true) -> void:
	var col: Color = STAR_BY_RARITY.get(rarity, STAR)
	var t := Time.get_ticks_msec() / 1000.0
	var pulse := 0.6 + 0.4 * sin(t * 2.6 + r.position.x * 0.05)
	var strength := (0.22 if rarity == 4 else 0.34) * (1.0 if owned else 0.45) * pulse
	for k in 4:
		var g := r.grow(2.0 + k * 2.5)
		round_line(ci, g, 8.0 + k * 2.0, Color(col, strength * (1.0 - k * 0.22)), 3.0)
	if rarity >= 5 and owned:
		for i in 4:
			var a := t * 1.4 + i * TAU / 4.0
			var p := r.get_center() + Vector2(cos(a) * r.size.x * 0.55, sin(a) * r.size.y * 0.55)
			star(ci, p, 3.0 + sin(t * 5.0 + i) * 1.2, Color(1, 0.95, 1, 0.9))


## 동그란 버튼: 그림자 + 진한 외곽선 + 금빛 테 + 위는 밝고 아래는 짙은 구슬 + 윗부분 반짝
static func ring_button(ci: CanvasItem, c: Vector2, r: float, color: Color, down := false) -> void:
	if not down:
		ci.draw_circle(c + Vector2(0, 3), r + 3.0, Color(INK, 0.55))
	ci.draw_circle(c, r + 3.0, INK)
	ci.draw_circle(c, r + 1.5, GOLD_D)
	ci.draw_circle(c + Vector2(0, -0.8), r, GOLD_L)
	ci.draw_circle(c, r - 3.0, INK)
	ci.draw_circle(c, r - 4.0, color.darkened(0.25))
	ci.draw_circle(c + Vector2(0, -r * 0.12), r - 5.5, color)
	ci.draw_circle(c + Vector2(0, -r * 0.3), r * 0.55, color.lightened(0.18))
	ci.draw_set_transform(c + Vector2(-r * 0.22, -r * 0.5), -0.35, Vector2(1.0, 0.45))
	ci.draw_circle(Vector2.ZERO, r * 0.38, Color(1, 1, 1, 0.45))
	ci.draw_set_transform(Vector2.ZERO)


## 그림을 동그랗게 잘라 그린다(src는 그림 안의 영역, 비우면 전체)
static func circle_tex(ci: CanvasItem, tex: Texture2D, c: Vector2, r: float, src := Rect2(), tint := Color.WHITE) -> void:
	if tex == null:
		return
	var ts := tex.get_size()
	var sr := src if src.size != Vector2.ZERO else Rect2(Vector2.ZERO, ts)
	var pts := PackedVector2Array()
	var uvs := PackedVector2Array()
	for i in 32:
		var d := Vector2.from_angle(i * TAU / 32.0)
		pts.append(c + d * r)
		var q := sr.get_center() + d * Vector2(sr.size.x, sr.size.y) * 0.5
		uvs.append(q / ts)
	ci.draw_colored_polygon(pts, tint, uvs, tex)


## 비스듬한 판(평행사변형): 위·아래 색 그라데이션 + 외곽선
static func skew_box(ci: CanvasItem, r: Rect2, skew: float, top: Color, bottom: Color, outline := INK, width := 2.0) -> void:
	var pts := PackedVector2Array([r.position + Vector2(skew, 0), Vector2(r.end.x, r.position.y), Vector2(r.end.x - skew, r.end.y), Vector2(r.position.x, r.end.y)])
	ci.draw_polygon(pts, PackedColorArray([top, top, bottom, bottom]))
	if width > 0.0:
		var closed := pts.duplicate()
		closed.append(pts[0])
		ci.draw_polyline(closed, outline, width)


## 재화 칸(어두운 자주 바탕 + 금테)
static func pill(ci: CanvasItem, r: Rect2, fill := PLUM) -> void:
	pbox(ci, r, fill, INK, 3, false, true)


## 섹션 제목: 금테 명판 + 보석 + 흰 글씨 + 금빛 영문
static func header(ci: CanvasItem, pos: Vector2, ko: String, en := "", size := 18) -> void:
	var w := width(ko, size) + (width(en, int(size * 0.62)) + 14.0 if en != "" else 0.0) + 40.0
	var r := Rect2(pos + Vector2(-2, -size * 1.05), Vector2(w, size * 1.45))
	tag(ci, r, Color("7a3f8f"))
	orb(ci, Vector2(r.position.x + 12, r.get_center().y), 5.0, Color("ff5d8f"))
	text(ci, pos + Vector2(22, 0), ko, size, Color.WHITE, 0, true, 4, INK)
	if en != "":
		text(ci, pos + Vector2(28 + width(ko, size), 0), en, int(size * 0.62), GOLD_L, 0, true, 3, INK, true)


## 캐릭터 카드: 진한 외곽선 + 속성색 테두리·바탕 + 일러스트 상반신 + 별(등급) + 속성 배지
static func char_card(ci: CanvasItem, data: CharacterData, r: Rect2, owned := true, show_name := false) -> void:
	var rc: Color = ELEMENT_CARD[data.element]
	if data.rarity >= 4:
		aura(ci, r, data.rarity, owned)
	var sky: Array = ELEMENT_SKY[data.element]
	pbox(ci, r, rc if owned else rc.darkened(0.45).lerp(Color("8e88a0"), 0.4), INK, 2, true, true)
	var inner := r.grow(-PX * 2.0)
	round_line(ci, inner.grow(1.0), 4, Color(rc.lightened(0.4), 0.9), 2.0)
	if owned:
		grad(ci, inner, (sky[1] as Color).lightened(0.3), (sky[0] as Color))
	else:
		grad(ci, inner, (sky[0] as Color).darkened(0.35).lerp(Color("9aa3b5"), 0.5), (sky[0] as Color).darkened(0.55).lerp(Color("7d8597"), 0.5))
	var tint := Color.WHITE if owned else Color(0.58, 0.6, 0.72, 1.0)
	UiKit.card_art(ci, data, inner, tint)
	var fade_h := inner.size.y * 0.32
	grad(ci, Rect2(inner.position.x, inner.end.y - fade_h, inner.size.x, fade_h), Color(INK, 0.0), Color(INK, 0.75))
	var sr := clampf(inner.size.x / 17.0, 3.6, 8.0)
	rank_stars(ci, Vector2(inner.get_center().x, inner.end.y - sr - 4), Save.rank_of(data.id) if owned else data.rarity, sr)
	if show_name:
		title(ci, Vector2(inner.get_center().x, inner.end.y - sr * 2.0 - 9), data.display_name, int(clampf(inner.size.x / 5.5, 11, 22)), Color.WHITE, 1)
	element_badge(ci, Vector2(inner.end.x - 9, inner.position.y + 10), 6.5, data.element)
	corner_gems(ci, Rect2(r.position + Vector2(1, 1), r.size - Vector2(2, 2)), 3.5, rc.lightened(0.2))
	if not owned:
		lock(ci, inner.get_center() + Vector2(0, -6), 26, Color("d8d4e2"))
