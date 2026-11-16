extends Node2D
## 별 섬(우주 배경 맵)의 가장자리: 섬 아래로 늘어진 바위 절벽(층층 무늬 + 아래로 갈수록 어둡게),
## 둘레의 밝은 테두리와 은은한 보라 빛. 섬이 허공에 "딱 잘려" 보이지 않게 한다.
## build_world가 땅 칸 지도(mask: 1 땅 · 0 허공)를 넘겨준다. 한 번만 그린다(매 프레임 다시 그리지 않음).

const T := 16
const CLIFF := 40.0  # 절벽 높이(px)

@export var size_cells := Vector2i(40, 30)
@export var mask := PackedByteArray()
@export var rock := Color(0.52, 0.40, 0.70)
@export var glow := Color(0.88, 0.72, 1.0)


func _ready() -> void:
	z_index = -1  # 땅 타일 바로 아래(허공 쪽으로 늘어진 절벽)


func _land(x: int, y: int) -> bool:
	if x < 0 or y < 0 or x >= size_cells.x or y >= size_cells.y:
		return false
	return mask[y * size_cells.x + x] == 1


func _draw() -> void:
	if mask.size() != size_cells.x * size_cells.y:
		return
	# 1) 바깥으로 번지는 보라 빛(허공 쪽 칸에)
	for y in size_cells.y:
		for x in size_cells.x:
			if not _land(x, y):
				continue
			for d: Vector2i in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, -1)]:
				if not _land(x + d.x, y + d.y):
					var r := Rect2(Vector2(x + d.x, y + d.y) * T, Vector2(T, T))
					draw_rect(r.grow(-2.0), Color(glow, 0.10))
	# 2) 아래가 허공인 칸: 바위 절벽(층층 띠 + 아래로 어둡게 + 고드름처럼 늘어진 끝)
	for y in size_cells.y:
		for x in size_cells.x:
			if not _land(x, y) or _land(x, y + 1):
				continue
			var top := Vector2(x * T, (y + 1) * T)
			var bands := 4
			for k in bands:
				var a := 1.0 - float(k) / bands
				var h := CLIFF / bands
				draw_rect(Rect2(top + Vector2(0, k * h), Vector2(T, h + 0.5)), Color(rock.darkened(0.12 * k), 0.95 * a + 0.05))
				draw_line(top + Vector2(0, k * h), top + Vector2(T, k * h), Color(rock.lightened(0.25), 0.35 * a), 1.0)
			# 아래 끝을 들쭉날쭉하게(칸마다 다른 뾰족한 돌)
			var seed := (x * 73856093) ^ (y * 19349663)
			var tip := 6.0 + float(seed % 9)
			var mx := 3.0 + float((seed >> 4) % 10)
			draw_colored_polygon(PackedVector2Array([top + Vector2(0, CLIFF), top + Vector2(T, CLIFF), top + Vector2(mx, CLIFF + tip)]), Color(rock.darkened(0.45), 0.7))
			# 절벽 위쪽 모서리 빛
			draw_line(top, top + Vector2(T, 0), Color(glow.lightened(0.4), 0.95), 3.0)
	# 3) 옆·위가 허공인 칸: 가는 밝은 테두리
	for y in size_cells.y:
		for x in size_cells.x:
			if not _land(x, y):
				continue
			var p := Vector2(x * T, y * T)
			if not _land(x, y - 1):
				draw_line(p, p + Vector2(T, 0), Color(glow.lightened(0.4), 0.95), 3.0)
			if not _land(x - 1, y):
				draw_line(p, p + Vector2(0, T), Color(glow.lightened(0.3), 0.85), 2.5)
				draw_rect(Rect2(p + Vector2(-6, 0), Vector2(6, T)), Color(rock.darkened(0.2), 0.9))  # 옆 절벽 두께
			if not _land(x + 1, y):
				draw_line(p + Vector2(T, 0), p + Vector2(T, T), Color(glow.lightened(0.3), 0.85), 2.5)
				draw_rect(Rect2(p + Vector2(T, 0), Vector2(6, T)), Color(rock.darkened(0.3), 0.9))
