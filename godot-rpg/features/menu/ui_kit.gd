class_name UiKit
extends RefCounted
## 모바일 게임풍 UI 그리기 도구: 굵은 검은 외곽선, 아래로 두꺼운 입체 버튼, 별, 벡터 아이콘, 외곽선 글씨.
## 모두 정적 함수라 어떤 Control의 _draw()에서도 쓴다.

const FONT := preload("res://assets/fonts/maple_bold.woff")
const INK := Color("16131f")  # 외곽선 색


## 입체 덩어리: 검은 외곽선 + 아래 두께(어두운 색) + 본체 + 윗부분 하이라이트.
static func chunky(ci: CanvasItem, rect: Rect2, color: Color, radius := 14.0, outline := 3.0, depth := 5.0, pressed := false) -> void:
	var r := rect
	if pressed:
		r.position.y += depth * 0.6
		depth *= 0.4
	_round(ci, Rect2(r.position - Vector2.ONE * outline, r.size + Vector2(outline * 2.0, outline * 2.0 + depth)), radius + outline, INK)
	_round(ci, Rect2(r.position + Vector2(0, depth), r.size), radius, color.darkened(0.35))
	_round(ci, r, radius, color)
	_round(ci, Rect2(r.position + Vector2(4, 3), Vector2(r.size.x - 8, r.size.y * 0.42)), radius - 3.0, Color(1, 1, 1, 0.22))


## 납작한 패널: 외곽선 + 본체(+ 아래 그림자).
static func panel(ci: CanvasItem, rect: Rect2, color: Color, radius := 16.0, outline := 3.0, shadow := 4.0) -> void:
	if shadow > 0.0:
		_round(ci, Rect2(rect.position + Vector2(0, shadow) - Vector2.ONE * outline, rect.size + Vector2.ONE * outline * 2.0), radius + outline, Color(0, 0, 0, 0.25))
	_round(ci, rect.grow(outline), radius + outline, INK)
	_round(ci, rect, radius, color)


static func _round(ci: CanvasItem, rect: Rect2, radius: float, color: Color) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = color
	sb.set_corner_radius_all(int(maxf(radius, 0.0)))
	sb.anti_aliasing = true
	sb.corner_detail = 8
	ci.draw_style_box(sb, rect)


## 외곽선 글씨. align: 0 왼쪽, 1 가운데, 2 오른쪽 (pos.x 기준)
static func text(ci: CanvasItem, pos: Vector2, s: String, size: int, color := Color.WHITE, outline := 6, align := 0) -> void:
	var w := FONT.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x
	var p := pos - Vector2(w * align / 2.0, 0)
	if outline > 0:
		ci.draw_string_outline(FONT, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, outline, INK)
	ci.draw_string(FONT, p, s, HORIZONTAL_ALIGNMENT_LEFT, -1, size, color)


static func text_width(s: String, size: int) -> float:
	return FONT.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, size).x


static func star(ci: CanvasItem, center: Vector2, r: float, color: Color, outline := 2.5) -> void:
	var pts := PackedVector2Array()
	for i in 10:
		var a := -PI / 2.0 + i * PI / 5.0
		pts.append(center + Vector2.from_angle(a) * (r if i % 2 == 0 else r * 0.48))
	var outer := PackedVector2Array()
	for i in 10:
		var a := -PI / 2.0 + i * PI / 5.0
		outer.append(center + Vector2.from_angle(a) * ((r + outline * 1.6) if i % 2 == 0 else (r * 0.48 + outline)))
	ci.draw_colored_polygon(outer, INK)
	ci.draw_colored_polygon(pts, color)
	# 반짝임
	ci.draw_circle(center + Vector2(-r * 0.18, -r * 0.2), r * 0.16, Color(1, 1, 1, 0.55))


static func heart(ci: CanvasItem, center: Vector2, s: float, color := Color("ff4d6d")) -> void:
	for pass_i in 2:
		var grow := 2.5 if pass_i == 0 else 0.0
		var c := INK if pass_i == 0 else color
		var r := s * 0.3 + grow
		ci.draw_circle(center + Vector2(-s * 0.24, -s * 0.12), r, c)
		ci.draw_circle(center + Vector2(s * 0.24, -s * 0.12), r, c)
		ci.draw_colored_polygon(PackedVector2Array([
			center + Vector2(-s * 0.52 - grow, -s * 0.02),
			center + Vector2(s * 0.52 + grow, -s * 0.02),
			center + Vector2(0, s * 0.52 + grow * 1.4),
		]), c)
	ci.draw_circle(center + Vector2(-s * 0.26, -s * 0.2), s * 0.09, Color(1, 1, 1, 0.6))


static func sword(ci: CanvasItem, center: Vector2, s: float) -> void:
	var dir := Vector2(1, -1).normalized()
	var side := dir.orthogonal()
	var tip := center + dir * s * 0.55
	var base := center - dir * s * 0.12
	var blade := PackedVector2Array([tip, base + side * s * 0.11, base - side * s * 0.11])
	var guard_a := base + side * s * 0.26
	var guard_b := base - side * s * 0.26
	var hilt := center - dir * s * 0.45
	for pass_i in 2:
		var w := 3.0 if pass_i == 0 else 0.0
		var col_blade := INK if pass_i == 0 else Color("e8eef7")
		var col_gold := INK if pass_i == 0 else Color("ffc93c")
		var grown := PackedVector2Array([tip + dir * w, blade[1] + side * w, blade[2] - side * w])
		ci.draw_colored_polygon(grown if pass_i == 0 else blade, col_blade)
		ci.draw_line(base, hilt, col_gold if pass_i == 1 else INK, s * 0.14 + w * 2.0, true)
		ci.draw_line(guard_a, guard_b, col_gold, s * 0.1 + w * 2.0, true)
		ci.draw_circle(hilt, s * 0.08 + w, col_gold)


## 속성 아이콘(벡터): 불·물·바람·땅·빛·어둠
static func element_icon(ci: CanvasItem, center: Vector2, s: float, element: int) -> void:
	var color := CharacterData.ELEMENT_COLORS[element]
	match element:
		CharacterData.Element.FIRE:
			_flame(ci, center, s, color)
		CharacterData.Element.WATER:
			_drop(ci, center, s, color)
		CharacterData.Element.WIND:
			for k in 3:
				var rr := s * (0.42 - k * 0.12)
				ci.draw_arc(center, rr, -PI * 0.1 + k * 0.6, PI * 1.25 + k * 0.6, 16, INK, 5.0, true)
				ci.draw_arc(center, rr, -PI * 0.1 + k * 0.6, PI * 1.25 + k * 0.6, 16, color, 2.6, true)
		CharacterData.Element.EARTH:
			var leaf := PackedVector2Array()
			for i in 16:
				var t := i / 15.0
				leaf.append(center + Vector2(lerpf(-0.45, 0.45, t) * s, -sin(t * PI) * s * 0.32).rotated(-0.6))
			for i in 16:
				var t := 1.0 - i / 15.0
				leaf.append(center + Vector2(lerpf(-0.45, 0.45, t) * s, sin(t * PI) * s * 0.32).rotated(-0.6))
			_poly_outlined(ci, leaf, Color("9ccc65"))
		CharacterData.Element.LIGHT:
			for i in 8:
				var a := i * TAU / 8.0
				ci.draw_line(center + Vector2.from_angle(a) * s * 0.28, center + Vector2.from_angle(a) * s * 0.48, INK, 5.0, true)
				ci.draw_line(center + Vector2.from_angle(a) * s * 0.28, center + Vector2.from_angle(a) * s * 0.46, color, 2.4, true)
			ci.draw_circle(center, s * 0.26 + 2.5, INK)
			ci.draw_circle(center, s * 0.26, color)
		CharacterData.Element.DARK:
			ci.draw_circle(center, s * 0.4 + 2.5, INK)
			ci.draw_circle(center, s * 0.4, color)
			ci.draw_circle(center + Vector2(s * 0.18, -s * 0.12), s * 0.33, Color("1d1730"))


static func _flame(ci: CanvasItem, c: Vector2, s: float, color: Color) -> void:
	var pts := PackedVector2Array()
	for i in 24:
		var a := i * TAU / 24.0
		var r := s * 0.36
		var p := Vector2(sin(a) * r, cos(a) * r * 0.9)
		if p.y < 0.0:
			p.x *= 1.0 + p.y / (r * 1.4)
			p.y *= 1.55
		pts.append(c + p + Vector2(0, s * 0.08))
	_poly_outlined(ci, pts, color)
	var inner := PackedVector2Array()
	for p in pts:
		inner.append(c + (p - c) * 0.5 + Vector2(0, s * 0.12))
	ci.draw_colored_polygon(inner, Color("ffe082"))


static func _drop(ci: CanvasItem, c: Vector2, s: float, color: Color) -> void:
	var pts := PackedVector2Array()
	for i in 24:
		var a := i * TAU / 24.0
		var r := s * 0.32
		var p := Vector2(sin(a) * r, cos(a) * r)
		if p.y < 0.0:
			p.x *= 1.0 + p.y / (r * 1.1)
			p.y *= 1.7
		pts.append(c + p + Vector2(0, s * 0.1))
	_poly_outlined(ci, pts, color)
	ci.draw_circle(c + Vector2(-s * 0.1, s * 0.08), s * 0.07, Color(1, 1, 1, 0.8))


static func _poly_outlined(ci: CanvasItem, pts: PackedVector2Array, color: Color) -> void:
	var closed := pts.duplicate()
	closed.append(pts[0])
	ci.draw_polyline(closed, INK, 5.0, true)
	ci.draw_colored_polygon(pts, color)


## 보석(벡터): 분홍 다이아몬드
static func gem(ci: CanvasItem, c: Vector2, r: float) -> void:
	var outer := PackedVector2Array([c + Vector2(-r, -r * 0.35), c + Vector2(-r * 0.5, -r * 0.85), c + Vector2(r * 0.5, -r * 0.85), c + Vector2(r, -r * 0.35), c + Vector2(0, r)])
	var grown := PackedVector2Array()
	for p in outer:
		grown.append(c + (p - c) * (1.0 + 3.0 / r))
	ci.draw_colored_polygon(grown, INK)
	ci.draw_colored_polygon(outer, Color("ff5fc8"))
	ci.draw_colored_polygon(PackedVector2Array([c + Vector2(-r * 0.5, -r * 0.85), c + Vector2(r * 0.5, -r * 0.85), c + Vector2(r * 0.25, -r * 0.35), c + Vector2(-r * 0.25, -r * 0.35)]), Color("ffb3e8"))
	ci.draw_colored_polygon(PackedVector2Array([c + Vector2(-r, -r * 0.35), c + Vector2(-r * 0.25, -r * 0.35), c + Vector2(0, r)]), Color("e0329f"))


## 캐릭터 일러스트 상반신을 dst 비율에 맞춰 잘라 그린다(카드용).
static func card_art(ci: CanvasItem, data: CharacterData, dst: Rect2, tint := Color.WHITE) -> void:
	var src := data.card_crop
	var want := dst.size.x / dst.size.y
	if src.size.x / src.size.y > want:
		var nw := src.size.y * want
		src = Rect2(src.position.x + (src.size.x - nw) / 2.0, src.position.y, nw, src.size.y)
	else:
		src.size.y = src.size.x / want
	ci.draw_texture_rect_region(data.portraits[0], dst, src, tint)


## 동전(벡터)
static func coin(ci: CanvasItem, c: Vector2, r: float) -> void:
	ci.draw_circle(c, r + 2.5, INK)
	ci.draw_circle(c, r, Color("f5a623"))
	ci.draw_circle(c + Vector2(0, -1), r * 0.78, Color("ffd54f"))
	text(ci, c + Vector2(0, r * 0.42), "G", int(r * 1.2), Color("c77800"), 0, 1)
