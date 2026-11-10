class_name MapView
extends Control
## 지도 창(화면 전체, 여는 동안 게임이 멈춘다): 위쪽 탭으로 "지역 지도"와 "월드 지도"를 오간다.
## 지역 지도: 지금 맵의 땅 타일 색을 그대로 줄여 그린 그림 + 내 위치·이동문·보스·마을 사람·몬스터 표시.
## 월드 지도: 대륙 그림 위에 마을 → 초원 → 언덕 → 숲 → 사막 3장, 서쪽 해저 신전·북쪽 설산(잠김).

signal closed

const CELL := 6  # 타일 1칸을 지도에서 몇 픽셀로
## pos: 월드 지도 그림(assets/ui/world_map_art.png) 안의 위치(0~1)
const REGIONS: Array[Dictionary] = [
	{"id": "village", "name": "평화로운 마을", "pos": Vector2(0.38, 0.60), "up": true, "color": Color("e8c98a"), "info": "모험의 시작 · 몬스터 없음", "mobs": "촌장 · 상인 · 농부 · 수도승 · 사냥꾼", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "field", "name": "초록 초원", "pos": Vector2(0.47, 0.65), "up": false, "color": Color("7ccf5a"), "info": "추천 레벨 1~5", "mobs": "슬라임 · 버섯 · 박쥐", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "hill", "name": "꽃바람 언덕", "pos": Vector2(0.50, 0.55), "up": true, "color": Color("ff9ec8"), "info": "추천 레벨 4~8", "mobs": "버섯 · 박쥐 · 슬라임 · 유령", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "forest", "name": "어스름 숲", "pos": Vector2(0.60, 0.57), "up": false, "color": Color("3f8a45"), "info": "추천 레벨 7~10", "mobs": "유령 · 해골 · 박쥐 · 버섯", "boss": "king_slime", "boss_name": "킹 슬라임", "lock": "", "lock_name": ""},
	{"id": "desert", "name": "타오르는 사막", "pos": Vector2(0.76, 0.59), "up": true, "color": Color("f2b05e"), "info": "추천 레벨 10~13", "mobs": "뱀 · 도마뱀 · 두더지", "boss": "", "boss_name": "", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "desert2", "name": "모래바람 협곡", "pos": Vector2(0.76, 0.70), "up": false, "color": Color("d98a4e"), "info": "추천 레벨 13~16", "mobs": "도마뱀 · 두더지 · 눈알 · 외눈 거인", "boss": "", "boss_name": "", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "desert3", "name": "저주받은 폐허", "pos": Vector2(0.70, 0.76), "up": false, "color": Color("9a6a9e"), "info": "추천 레벨 16~20 · 1장 끝", "mobs": "눈알 · 외눈 거인 · 해골 · 유령", "boss": "cyclope_king", "boss_name": "외눈 거인 왕", "lock": "king_slime", "lock_name": "킹 슬라임"},
	{"id": "swamp", "name": "독안개 늪", "pos": Vector2(0.41, 0.71), "up": false, "color": Color("6a8a5a"), "info": "남쪽 지역 · 추천 레벨 8~12", "mobs": "갓파 · 슬라임 · 도깨비불", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "waterfall", "name": "폭포 계곡", "pos": Vector2(0.29, 0.64), "up": true, "color": Color("5fb4ea"), "info": "남쪽 지역 · 추천 레벨 8~12", "mobs": "도롱뇽 · 나비 · 너구리", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "beach", "name": "푸른 해변", "pos": Vector2(0.31, 0.78), "up": false, "color": Color("f4e3a6"), "info": "남쪽 지역 · 추천 레벨 10~14", "mobs": "문어 · 너구리 · 갓파", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "ruinvillage", "name": "버려진 마을", "pos": Vector2(0.49, 0.74), "up": true, "color": Color("7c9a5a"), "info": "남쪽 지역 · 추천 레벨 10~14", "mobs": "도깨비불 · 쥐 · 해골 · 유령", "boss": "", "boss_name": "", "lock": "", "lock_name": ""},
	{"id": "crystalcave", "name": "수정 동굴", "pos": Vector2(0.54, 0.81), "up": false, "color": Color("7a7f9e"), "info": "남쪽 지역 · 추천 레벨 12~16", "mobs": "거미 · 파란 박쥐 · 두더지", "boss": "spider_queen", "boss_name": "수정 거미 여왕", "lock": "", "lock_name": ""},
	{"id": "snow", "name": "설산 지대 (6곳)", "pos": Vector2(0.47, 0.43), "up": true, "color": Color("bcd6f5"), "info": "2장 · 눈꽃 평원 → 호수 → 협곡 → 서리 숲 → 빙하 동굴 → 정상", "mobs": "판다 · 곰 · 얼음 해골 · 서리 정령 · 눈 박쥐", "boss": "yeti_king", "boss_name": "설원의 대왕곰", "lock": "cyclope_king", "lock_name": "1장 보스 외눈 거인 왕"},
	{"id": "temple", "name": "해저 신전 (6곳)", "pos": Vector2(0.11, 0.50), "up": false, "color": Color("4a7fd0"), "info": "3장 · 마을 서쪽 나루터의 신전 문", "mobs": "도롱뇽 · 문어 · 갓파 · 물고기", "boss": "kraken", "boss_name": "심해의 크라켄", "lock": "yeti_king", "lock_name": "2장 보스 설원의 대왕곰"},
	{"id": "lava", "name": "용암 지대 (6곳)", "pos": Vector2(0.78, 0.81), "up": false, "color": Color("ff8a2a"), "info": "4장 · 저주받은 폐허 동쪽", "mobs": "불꽃 · 용 · 티라노", "boss": "flame_dragon", "boss_name": "화염룡 이그니스", "lock": "kraken", "lock_name": "3장 보스 심해의 크라켄"},
	{"id": "hell", "name": "지옥 (6곳)", "pos": Vector2(0.66, 0.88), "up": false, "color": Color("c02a3a"), "info": "4장 마지막 · 지옥문 너머", "mobs": "붉은 등불 · 마안 · 해골 · 용", "boss": "demon_lord", "boss_name": "마왕 아자젤", "lock": "flame_dragon", "lock_name": "화염룡 이그니스"},
]
## 지도 위 길(이어진 지역 id 쌍)
const ROUTES := [["village", "field"], ["field", "hill"], ["hill", "forest"], ["forest", "desert"], ["desert", "desert2"], ["desert2", "desert3"], ["village", "temple"], ["village", "snow"], ["village", "swamp"], ["swamp", "waterfall"], ["swamp", "beach"], ["swamp", "ruinvillage"], ["ruinvillage", "crystalcave"], ["desert3", "lava"], ["lava", "hell"]]
const WORLD_MAP := preload("res://assets/ui/world_map_art.png")  # 사용자가 준 월드 지도 그림

var world: Node2D
var tab := 0  # 0 지역, 1 월드
var map_tex: ImageTexture
var map_cells := Vector2i.ZERO
var t := 0.0
var _tile_colors: Dictionary = {}
var sel := ""  # 월드 지도에서 고른 지역(처음엔 지금 있는 곳)


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	process_mode = Node.PROCESS_MODE_ALWAYS
	texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	z_index = 60
	world = get_tree().get_first_node_in_group(&"world") as Node2D
	if world:
		_build_texture()
	get_tree().paused = true
	Game.sfx(&"pickup", -6.0, 0.0)


func _process(delta: float) -> void:
	t += delta
	queue_redraw()


func close() -> void:
	get_tree().paused = false
	closed.emit()
	queue_free()


func _unhandled_input(e: InputEvent) -> void:
	if e.is_action_pressed(&"map") or e.is_action_pressed(&"ui_cancel"):
		get_viewport().set_input_as_handled()
		close()


func _gui_input(e: InputEvent) -> void:
	var mb := e as InputEventMouseButton
	if not (mb and mb.pressed and mb.button_index == MOUSE_BUTTON_LEFT):
		return
	var p := mb.position
	if _close_rect().has_point(p):
		close()
	elif _tab_rect(0).has_point(p):
		tab = 0
	elif _tab_rect(1).has_point(p):
		tab = 1
	elif tab == 1:
		var dst := _world_dst(_body_rect())
		for reg: Dictionary in REGIONS:
			if p.distance_to(dst.position + reg["pos"] * dst.size) < 18.0:
				sel = reg["id"]
				Game.sfx(&"pickup", -10.0, 0.0)


# ── 지도 그림 만들기 ──

## 땅 타일마다 그 타일 그림 가운데 색을 칸 하나로 칠하고, 나무·바위·집을 점으로 얹는다
func _build_texture() -> void:
	var ground := world.get_node(^"Ground") as TileMapLayer
	var used := ground.get_used_rect()
	map_cells = used.size
	var img := Image.create(used.size.x * CELL, used.size.y * CELL, false, Image.FORMAT_RGBA8)
	for y in used.size.y:
		for x in used.size.x:
			var c := used.position + Vector2i(x, y)
			var src := ground.get_cell_source_id(c)
			if src < 0:
				continue
			var col := _tile_color(ground.tile_set, src, ground.get_cell_atlas_coords(c))
			img.fill_rect(Rect2i(x * CELL, y * CELL, CELL, CELL), col)
	for n in world.get_node(^"Entities").get_children():
		var kind := String(n.name).rstrip("0123456789")
		var cell := Vector2i((n as Node2D).position / 16.0) - used.position
		var col := Color.TRANSPARENT
		var size := 1
		match kind:
			"Forest", "Tree", "BigTree":
				col = Color("2f7a3a")
				size = 2 if kind == "BigTree" else 1
			"Palm":
				col = Color("3f9a3e")
			"Rock":
				col = Color("8a7a6a")
			"House", "Torii", "Well":
				col = Color("b0573a")
				size = 2
		if col.a > 0.0:
			var px := cell * CELL
			img.fill_rect(Rect2i(px.x - size * 2, px.y - size * 3, CELL + size * 3, CELL + size * 2), col.darkened(0.25))
			img.fill_rect(Rect2i(px.x - size * 2 + 1, px.y - size * 3 + 1, CELL + size * 3 - 2, CELL + size * 2 - 2), col)
	map_tex = ImageTexture.create_from_image(img)


func _tile_color(ts: TileSet, src: int, atlas: Vector2i) -> Color:
	var key := "%d:%d:%d" % [src, atlas.x, atlas.y]
	if not _tile_colors.has(key):
		var source := ts.get_source(src) as TileSetAtlasSource
		var img := source.texture.get_image()
		var base := atlas * source.texture_region_size
		var sum := Color(0, 0, 0, 0)
		for p in [Vector2i(4, 4), Vector2i(8, 8), Vector2i(12, 12), Vector2i(4, 12), Vector2i(12, 4)]:
			sum += img.get_pixelv(base + p)
		_tile_colors[key] = Color(sum.r / 5.0, sum.g / 5.0, sum.b / 5.0, 1.0)
	return _tile_colors[key]


# ── 배치 ──

func _panel_rect() -> Rect2:
	return Rect2(Vector2(16, 70), size - Vector2(32, 150))


func _tab_rect(i: int) -> Rect2:
	var p := _panel_rect()
	var w := (p.size.x - 40) / 2.0
	return Rect2(p.position + Vector2(14 + i * (w + 12), 58), Vector2(w, 46))


func _body_rect() -> Rect2:
	var p := _panel_rect()
	return Rect2(p.position + Vector2(14, 118), p.size - Vector2(28, 132))


## 월드 지도 그림이 들어갈 자리(아래 정보 카드 자리를 빼고 비율 맞춰서)
func _world_dst(body: Rect2) -> Rect2:
	var avail := Rect2(body.position, Vector2(body.size.x, body.size.y - 128))
	var ts := Vector2(WORLD_MAP.get_size())
	var k := minf(avail.size.x / ts.x, avail.size.y / ts.y)
	return Rect2(avail.position + Vector2((avail.size.x - ts.x * k) / 2.0, 0), ts * k)


func _close_rect() -> Rect2:
	var p := _panel_rect()
	return Rect2(Vector2(p.get_center().x - 90, p.end.y + 12), Vector2(180, 56))


# ── 그리기 ──

func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.72))
	var p := _panel_rect()
	Gt.panel(self, p)
	Gt.header(self, p.position + Vector2(16, 40), "지도", "MAP", 20)
	for i in 2:
		var r := _tab_rect(i)
		if i == tab:
			Gt.button(self, r, Gt.Kind.PINK)
			Gt.title(self, Vector2(r.get_center().x, r.position.y + 28), ["지역 지도", "월드 지도"][i], 17, Color.WHITE, 1)
		else:
			Gt.pbox(self, r, Color("e9e4da"), Gt.INK, 3, false, true)
			Gt.text(self, Vector2(r.get_center().x, r.position.y + 29), ["지역 지도", "월드 지도"][i], 17, Gt.NAVY_SOFT, 1)
	var body := _body_rect()
	if tab == 0:
		_draw_region(body)
	else:
		_draw_world(body)
	var cb := _close_rect()
	Gt.button(self, cb, Gt.Kind.YELLOW)
	Gt.title(self, Vector2(cb.get_center().x, cb.position.y + 34), "닫기", 20, Color.WHITE, 1)


## 지역 지도: 맵 그림 + 표시들 + 아래 범례
func _draw_region(body: Rect2) -> void:
	if map_tex == null:
		Gt.text(self, body.get_center(), "지도를 볼 수 없는 곳이에요", 16, Gt.NAVY, 1)
		return
	var title: String = world.get(&"map_title")
	Gt.text(self, body.position + Vector2(4, 22), title, 20, Gt.NAVY)
	var ts := map_tex.get_size()
	var avail := Rect2(body.position + Vector2(0, 34), Vector2(body.size.x, body.size.y - 110))
	var k := minf(avail.size.x / ts.x, avail.size.y / ts.y)
	var dst := Rect2(avail.position + (avail.size - ts * k) / 2.0, ts * k)
	Gt.pbox(self, dst.grow(5), Color("3a2546"), Gt.INK, 2, true, false)
	draw_texture_rect(map_tex, dst, false)
	var scale := k * CELL / 16.0  # 월드 1픽셀 → 지도 픽셀
	var to_map := func(wp: Vector2) -> Vector2: return dst.position + wp * scale
	# 몬스터(작은 빨간 점), 마을 사람(파란 점)
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if e.get(&"is_boss"):
			continue
		draw_circle(to_map.call(e.global_position), 2.5, Color("ff4d5e"))
	for n in world.find_children("Npc*", "", true, false):
		var q := to_map.call((n as Node2D).global_position) as Vector2
		draw_circle(q, 4.5, Gt.INK)
		draw_circle(q, 3.2, Color("5db8ff"))
	# 이동문(행선지·잠금)
	for portal in world.find_children("Portal_*", "", true, false):
		var q := to_map.call((portal as Node2D).global_position) as Vector2
		var open: bool = portal.call(&"is_open")
		var label: String = String(portal.get(&"label")).trim_suffix(" ▶").trim_prefix("◀ ")
		Gt.orb(self, q, 6.0, Color("ffd23a") if open else Color("ff4d5e"))
		var text := label if open else label + " 🔒"
		var tw := Gt.width(text, 13)
		var tx := clampf(q.x, dst.position.x + tw / 2.0 + 6.0, dst.end.x - tw / 2.0 - 6.0)
		Gt.text(self, Vector2(tx, q.y - 12), label if open else label + " (잠김)", 13, Color.WHITE, 1, true, 4, Gt.INK)
	# 보스
	for b: Node2D in get_tree().get_nodes_in_group(&"bosses"):
		var q := to_map.call(b.global_position) as Vector2
		Gt.star(self, q, 9.0, Color("ff7a3d"))
		Gt.text(self, q + Vector2(0, 22), String(b.get(&"boss_name")), 13, Color("ffd0d0"), 1, true, 4, Gt.INK)
	# 나(깜빡이는 분홍 원 + 바라보는 방향)
	var player := world.get(&"player") as Node2D
	if player:
		var q := to_map.call(player.global_position) as Vector2
		var pulse := 1.0 + 0.35 * sin(t * 6.0)
		draw_circle(q, 9.0 * pulse, Color(1, 0.4, 0.7, 0.35))
		draw_circle(q, 6.5, Gt.INK)
		draw_circle(q, 5.0, Color("ff6fa8"))
		Gt.text(self, q + Vector2(0, -12), "나", 13, Color.WHITE, 1, true, 4, Gt.INK)
	# 범례
	var ly := body.end.y - 54
	var items := [["나", Color("ff6fa8")], ["이동문", Color("ffd23a")], ["몬스터", Color("ff4d5e")], ["마을 사람", Color("5db8ff")], ["보스", Color("ff7a3d")]]
	var x := body.position.x + 6
	for it: Array in items:
		draw_circle(Vector2(x + 7, ly), 6.0, Gt.INK)
		draw_circle(Vector2(x + 7, ly), 4.5, it[1])
		Gt.text(self, Vector2(x + 18, ly + 5), it[0], 13, Gt.NAVY)
		x += 30 + Gt.width(it[0], 13)
	Gt.text(self, Vector2(body.position.x + 6, ly + 34), "M 키나 닫기 버튼으로 지도를 닫아요", 12, Gt.NAVY_SOFT, 0, false)


## 월드 지도: 대륙 그림 위에 지역 표시·길·잠금, 아래에 고른 지역 정보
func _draw_world(body: Rect2) -> void:
	var here := ""
	if world and world.has_method(&"map_id"):
		here = world.call(&"map_id")
	# 입구 맵·여러 장짜리 지역은 그 지역 표시에
	if here == "shore" or here.begins_with("temple"):
		here = "temple"
	elif here == "snowgate" or here.begins_with("snow"):
		here = "snow"
	elif here.begins_with("lava"):
		here = "lava"
	elif here.begins_with("hell"):
		here = "hell"
	if sel == "":
		sel = here if here != "" else "village"
	var dst := _world_dst(body)
	Gt.pbox(self, dst.grow(5), Color("3a2546"), Gt.INK, 2, true, false)
	draw_texture_rect(WORLD_MAP, dst, false)
	var by_id := {}
	for reg: Dictionary in REGIONS:
		by_id[reg["id"]] = reg
	var at := func(id: String) -> Vector2: return dst.position + (by_id[id]["pos"] as Vector2) * dst.size
	# 길(점선): 잠긴 곳으로 가는 길은 빨갛게
	for r: Array in ROUTES:
		var a: Vector2 = at.call(r[0])
		var b: Vector2 = at.call(r[1])
		var open := Quests.boss_defeated(by_id[r[1]]["lock"])
		var n := int(a.distance_to(b) / 9.0)
		for i in range(1, n):
			var q := a.lerp(b, float(i) / n)
			draw_circle(q, 3.2, Gt.INK)
			draw_circle(q, 2.0, Color("fff3c4") if open else Color("ff6b6b"))
	# 지역 표시
	for reg: Dictionary in REGIONS:
		var q: Vector2 = at.call(reg["id"])
		var locked := not Quests.boss_defeated(reg["lock"])
		var col: Color = reg["color"]
		if reg["id"] == sel:
			draw_circle(q, 17.0 + 2.0 * sin(t * 5.0), Color(1, 1, 1, 0.45))
		Gt.orb(self, q, 9.0, Color("8a8296") if locked else col)
		if locked:
			Gt.lock(self, q + Vector2(0, 1), 12, Color("ffd54f"))
		elif reg["boss"] != "":
			Gt.star(self, q, 5.0, Color("9be27a") if Quests.boss_defeated(reg["boss"]) else Color("ff7a3d"))
		Gt.text(self, q + Vector2(0, -14 if reg["up"] else 24), reg["name"], 11, Color.WHITE, 1, true, 4, Gt.INK)
		if reg["id"] == here:
			# 지금 있는 곳: 옆에 통통 튀는 "나" 깃발
			var bob := sin(t * 4.0) * 2.0
			var f := q + Vector2(10, -6 + bob)
			draw_line(f, f + Vector2(0, -16), Gt.INK, 2.0)
			draw_colored_polygon(PackedVector2Array([f + Vector2(1, -16), f + Vector2(15, -12), f + Vector2(1, -8)]), Gt.INK)
			draw_colored_polygon(PackedVector2Array([f + Vector2(2, -15), f + Vector2(12, -12), f + Vector2(2, -9)]), Color("ff6fa8"))
			draw_arc(q, 12.5, 0, TAU, 24, Color("ff6fa8"), 2.0)
	# 고른 지역 정보 카드
	var reg: Dictionary = by_id.get(sel, REGIONS[0])
	var r := Rect2(Vector2(body.position.x, dst.end.y + 12), Vector2(body.size.x, body.end.y - dst.end.y - 12))
	var locked := not Quests.boss_defeated(reg["lock"])
	var col: Color = reg["color"]
	Gt.pbox(self, r, col.lerp(Color.WHITE, 0.6) if not locked else Color("d8d2de"), Gt.INK, 3, true, true)
	Gt.round_grad(self, Rect2(r.position + Vector2(5, 5), Vector2(12, r.size.y - 10)), 4, col.lightened(0.2), col.darkened(0.2))
	Gt.text(self, r.position + Vector2(28, 30), reg["name"], 19, Gt.NAVY)
	Gt.text(self, r.position + Vector2(32 + Gt.width(reg["name"], 19), 29), reg["info"], 12, Gt.NAVY_SOFT, 0, false)
	Gt.text(self, r.position + Vector2(28, 56), ("만나는 사람: " if reg["id"] == "village" else "몬스터: ") + String(reg["mobs"]), 13, Gt.NAVY, 0, false)
	if locked:
		Gt.text(self, r.position + Vector2(28, 80), "🔒 %s 처치 후 열림" % reg["lock_name"], 13, Color("c0392b"))
	elif reg["boss"] != "":
		var dead := Quests.boss_defeated(reg["boss"])
		Gt.star(self, r.position + Vector2(36, 75), 7, Color("ff7a3d") if not dead else Color("9be27a"))
		Gt.text(self, r.position + Vector2(50, 80), "보스: %s  %s" % [reg["boss_name"], "· 처치 완료!" if dead else ""], 13, Gt.NAVY)
	if reg["id"] == here:
		var tag := Rect2(Vector2(r.end.x - 104, r.position.y + 10), Vector2(92, 24))
		Gt.tag(self, tag, Gt.PINK)
		Gt.text(self, Vector2(tag.get_center().x, tag.position.y + 17), "현재 위치", 12, Color.WHITE, 1)
	Gt.text(self, Vector2(r.get_center().x, r.end.y - 8), "지도의 지역을 눌러 정보를 볼 수 있어요", 11, Gt.NAVY_SOFT, 1, false)
