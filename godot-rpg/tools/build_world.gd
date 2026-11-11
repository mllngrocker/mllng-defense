extends SceneTree
## Ninja Adventure 소재로 맵 5장(마을 → 초록 초원 → 꽃바람 언덕 → 어스름 숲 → 사막)과 타일셋을 새로 만든다.
## 필드는 구불구불한 오솔길이 이동문에서 가운데 공터로, 공터에서 작은 공터들로 이어진다(맵마다 모양이 다르다).
## 마을 왼쪽(해저 신전)·위쪽(설산) 문은 1장을 깨야 열리는 다음 지역 자리다.
## 실행: godot --headless --path godot-rpg --script res://tools/build_world.gd
## 사막도 3장(타오르는 사막 → 모래바람 협곡 → 저주받은 폐허)이고, 깊이 갈수록 화면 색(tint)이 어둡고 음산해진다.
## 주의: 다시 실행하면 village·world(초록 초원)·hill·forest·desert·desert2·desert3.tscn과 tileset.tres를 덮어쓴다.

const T := 16
const BORDER := 3  # 가장자리 숲 두께(칸)
const FLOOR := 0
const WATER := 1
const RELIEF := 2  # 바위 단·절벽(TilesetRelief)
const HELLF := 4  # 지옥 바닥(floor.png를 검붉게 칠한 것)
const CAVEF := 5  # 동굴 바닥(floor.png를 푸른 회색으로 칠한 것)
const LAVA := 6  # 용암(water.png를 주황으로 칠한 것)
const WATERC := 7  # 물가의 풀·진흙을 지운 물(땅 위에 겹쳐 그려 어느 땅과도 이어지게)
const SNOWB := 3  # 풀 위에 덮는 눈 자국(TilesetFloorB, 흙길 표와 같은 배치로 7줄 위)

const VILLAGE := "res://features/world/village.tscn"
const FIELD := "res://features/world/world.tscn"
const DESERT := "res://features/world/desert.tscn"
const DESERT2 := "res://features/world/desert2.tscn"
const DESERT3 := "res://features/world/desert3.tscn"
const HILL := "res://features/world/hill.tscn"
const FOREST_MAP := "res://features/world/forest.tscn"
## 마을 서쪽·북쪽으로 나가면 보이는 다음 지역 입구(들어갈 수는 없고 그림으로 보여 준다)
const SHORE := "res://features/world/shore.tscn"
const SNOWGATE := "res://features/world/snowgate.tscn"
## 다음 장 첫 맵(입구 맵에서 막힌 문이 열리면 간다)
const TEMPLE := "res://features/world/temple1.tscn"
const SNOW := "res://features/world/snow1.tscn"
const SWAMP := "res://features/world/swamp.tscn"
## 지역 마을(몬스터 없음, 쉬어 가며 이야기를 듣는 곳)
const DESERT_TOWN := "res://features/world/desert_town.tscn"
const SNOW_TOWN := "res://features/world/snow_town.tscn"
const TEMPLE_TOWN := "res://features/world/temple_town.tscn"
const LAVA_TOWN := "res://features/world/lava_town.tscn"
const SKY_TOWN := "res://features/world/sky_town.tscn"
const LAVA1 := "res://features/world/lava1.tscn"

## 땅 종류: 바탕 칸, 무늬 칸, 길 타일 줄 이동(흙길은 floor.png 7~10줄, 모래길은 같은 배치로 0~3줄)
const GRASS_GROUND := {"base": Vector2i(0, 12), "detail": [Vector2i(1, 12), Vector2i(2, 12), Vector2i(3, 12), Vector2i(4, 12), Vector2i(2, 11), Vector2i(3, 11)], "shift": Vector2i(0, 0), "water": Vector2i(0, -1)}
const SAND_GROUND := {"base": Vector2i(0, 5), "detail": [Vector2i(1, 5), Vector2i(2, 5), Vector2i(3, 5), Vector2i(4, 5)], "shift": Vector2i(0, -7), "water": Vector2i(0, -7)}
## 숲: 짙은 풀 + 짙은 흙길(floor.png 오른쪽 블록, 같은 배치로 11칸 옆)
const FOREST_GROUND := {"base": Vector2i(11, 12), "detail": [Vector2i(12, 12), Vector2i(13, 12), Vector2i(14, 12), Vector2i(15, 12)], "shift": Vector2i(11, 0), "water": Vector2i(0, -1)}
## 눈밭: 눈 바탕 + 다져진 눈길(floor.png 14~17줄, 흙길과 같은 배치로 7줄 아래)
const SNOW_GROUND := {"base": Vector2i(0, 19), "detail": [Vector2i(1, 19), Vector2i(2, 19), Vector2i(3, 19), Vector2i(4, 19)], "shift": Vector2i(0, 7), "water": Vector2i(0, -1)}
## 늪: 짙은 풀 + 보라 늪물(water.png 오른쪽 블록), 설원: 눈 바닥 + 얼음물, 동굴·지옥: 다시 칠한 바닥(+용암)
const SWAMP_GROUND := {"base": Vector2i(11, 12), "detail": [Vector2i(12, 12), Vector2i(13, 12), Vector2i(14, 12), Vector2i(15, 12)], "shift": Vector2i(11, 0), "water": Vector2i(13, -1)}
const SNOWF_GROUND := {"base": Vector2i(0, 19), "detail": [Vector2i(1, 19), Vector2i(2, 19), Vector2i(3, 19), Vector2i(4, 19)], "shift": Vector2i(0, 7), "water": Vector2i(13, -7)}
const CAVE_GROUND := {"base": Vector2i(0, 5), "detail": [Vector2i(1, 5), Vector2i(2, 5), Vector2i(3, 5), Vector2i(4, 5)], "shift": Vector2i(0, -7), "water": Vector2i(0, -7), "src": CAVEF}
const HELL_GROUND := {"base": Vector2i(0, 5), "detail": [Vector2i(1, 5), Vector2i(2, 5), Vector2i(3, 5), Vector2i(4, 5)], "shift": Vector2i(0, -7), "water": Vector2i(0, -7), "src": HELLF, "water_src": LAVA}
## 흙길 자동 타일: 상하좌우 이웃 비트(N=1 E=2 S=4 W=8) → floor.png 칸
const DIRT_BY_MASK: Dictionary[int, Vector2i] = {
	0: Vector2i(3, 10), 2: Vector2i(0, 10), 8: Vector2i(2, 10), 10: Vector2i(1, 10),
	4: Vector2i(3, 7), 1: Vector2i(3, 9), 5: Vector2i(3, 8),
	6: Vector2i(0, 7), 12: Vector2i(2, 7), 3: Vector2i(0, 9), 9: Vector2i(2, 9),
	14: Vector2i(1, 7), 11: Vector2i(1, 9), 7: Vector2i(0, 8), 13: Vector2i(2, 8), 15: Vector2i(1, 8),
}
## 사방이 흙인데 대각선 한 칸만 풀이면 안쪽 모서리 타일
const DIRT_INNER: Dictionary[Vector2i, Vector2i] = {
	Vector2i(1, 1): Vector2i(5, 8), Vector2i(-1, 1): Vector2i(6, 8),
	Vector2i(1, -1): Vector2i(5, 9), Vector2i(-1, -1): Vector2i(6, 9),
}
const POND := Rect2i(0, 6, 3, 3)  # water.png의 3x3 연못
const POND_SMALL := Rect2i(0, 9, 3, 1)  # 가로로 긴 작은 연못

## nature.png 안의 칸 좌표·크기
const TREES: Array[Rect2i] = [Rect2i(0, 0, 2, 2), Rect2i(2, 0, 2, 2), Rect2i(16, 0, 2, 2), Rect2i(18, 0, 2, 2), Rect2i(6, 8, 2, 2)]
const BIG_TREES: Array[Rect2i] = [Rect2i(3, 18, 3, 3), Rect2i(0, 18, 3, 3)]
const BLOSSOM_TREES: Array[Rect2i] = [Rect2i(0, 18, 3, 3), Rect2i(9, 18, 3, 3)]  # 벚꽃·단풍
const ROCKS: Array[Rect2i] = [Rect2i(13, 8, 2, 2), Rect2i(16, 8, 2, 2)]
const BUSHES: Array[Vector2i] = [Vector2i(0, 10), Vector2i(1, 10), Vector2i(6, 10)]
const FLOWERS: Array[Vector2i] = [Vector2i(0, 11), Vector2i(1, 11), Vector2i(6, 11), Vector2i(2, 11), Vector2i(4, 10), Vector2i(5, 10), Vector2i(7, 10), Vector2i(9, 10)]
const FOREST: Array[Rect2i] = [Rect2i(2, 0, 2, 2), Rect2i(0, 0, 2, 2)]
const DEAD_TREES: Array[Rect2i] = [Rect2i(4, 0, 2, 2)]  # 마른 나무
## 버려진 마을 폐허(abandoned.png: 허물어진 돌집·나무집·석상·기둥·우물)
const RUINS: Array[Rect2i] = [Rect2i(0, 0, 4, 3), Rect2i(4, 0, 2, 3), Rect2i(11, 0, 3, 3), Rect2i(11, 3, 3, 3), Rect2i(0, 3, 2, 3), Rect2i(2, 3, 1, 3), Rect2i(8, 1, 3, 2)]
## 수정(nature.png 14줄 작은 보석 바위, TilesetDungeon 수정)
const CRYSTALS: Array[Vector2i] = [Vector2i(0, 14), Vector2i(1, 14), Vector2i(2, 14), Vector2i(3, 14)]
## 눈 덮인 나무·바위·작은 눈 장식
## 설산 입구는 무료 겨울 팩(assets/vendor/winter/Winter-tiles.png, Gherwit) 칸을 쓴다
const WINTER_TEX := "res://assets/vendor/winter/Winter-tiles.png"
const TEMPLE_TEX := "res://assets/vendor/watertemple/Tileset_Water_Temple.png"
const SNOW_TREES: Array[Rect2i] = [Rect2i(6, 6, 3, 3), Rect2i(9, 6, 3, 3)]  # 눈 덮인 전나무(파랑·초록)
const SNOW_BIG: Array[Rect2i] = [Rect2i(0, 6, 3, 4), Rect2i(3, 6, 3, 4)]  # 전나무 무리
const SNOW_ROCK := Rect2i(0, 0, 1, 1)
const SNOW_SMALL: Array[Vector2i] = [Vector2i(0, 0), Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1), Vector2i(5, 0), Vector2i(5, 1)]
## desert.png 안의 칸(야자수·뼈·항아리·마른 덤불·우물)
const PALMS: Array[Rect2i] = [Rect2i(10, 10, 2, 2), Rect2i(12, 10, 2, 2)]
const BONES: Array[Vector2i] = [Vector2i(16, 10), Vector2i(17, 11), Vector2i(18, 11), Vector2i(19, 11), Vector2i(16, 11)]
const POTS: Array[Vector2i] = [Vector2i(14, 10), Vector2i(14, 11)]
const DRY_BUSH: Array[Vector2i] = [Vector2i(8, 9), Vector2i(9, 9)]
const WELL := Rect2i(0, 3, 2, 2)
## house.png 안의 집(4x3칸, 문은 왼쪽에서 두 번째 칸 맨 아래)과 신사 문(3x2)
const HOUSES: Array[Rect2i] = [Rect2i(0, 0, 4, 3), Rect2i(4, 0, 4, 3), Rect2i(8, 0, 4, 3), Rect2i(12, 0, 4, 3)]
const TORII := Rect2i(0, 5, 3, 2)

## 맵마다 다른 것들. gaps의 at: 이동문이 붙는 줄(서·동) 또는 칸(북). 몬스터 [장면, 수, 공터에서 최소·최대 거리]
const MAPS: Array[Dictionary] = [
	{
		"path": VILLAGE, "title": "레몬 마을", "w": 40, "h": 30, "seed": 21, "wobble": 0.0,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/village.ogg", "border": "forest",
		"roads": {"h": [0, 40], "v": [0, 30], "plaza": 3.6},
		"gaps": [
			{"side": "east", "to": FIELD, "spawn": "west", "label": "초원 ▶"},
			{"side": "west", "to": SHORE, "spawn": "east", "label": "◀ 나루터"},
			{"side": "north", "to": SNOWGATE, "spawn": "south", "label": "설산 입구"},
			{"side": "south", "to": SWAMP, "spawn": "north", "label": "독안개 늪"},
		],
		"ponds": 1, "trees": 12, "big_trees": 2, "rocks": 2, "bushes": 8, "flowers": 60,
		"village": true, "spawns": [],
	},
	{
		"path": FIELD, "title": "초록 초원", "w": 56, "h": 40, "seed": 11,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/field.ogg", "border": "forest",
		"gaps": [
			{"side": "west", "at": 20, "to": VILLAGE, "spawn": "east", "label": "◀ 마을"},
			{"side": "east", "at": 16, "to": HILL, "spawn": "west", "label": "언덕 ▶"},
		],
		"clearings": 3, "ponds": 4, "rivers": 1, "river_width": 1.6, "trees": 34, "big_trees": 4, "rocks": 8, "bushes": 30, "flowers": 60,
		"spawns": [["slime", 9, 5, 40], ["mushroom", 4, 12, 40], ["bat", 2, 16, 40]],
	},
	{
		"path": HILL, "title": "꽃바람 언덕", "w": 56, "h": 42, "seed": 41,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/field.ogg", "border": "forest", "big_tree_set": "blossom",
		"gaps": [
			{"side": "west", "at": 22, "to": FIELD, "spawn": "east", "label": "◀ 초원"},
			{"side": "east", "at": 12, "to": FOREST_MAP, "spawn": "west", "label": "숲 ▶"},
		],
		"clearings": 3, "ponds": 3, "rivers": 1, "river_width": 2.8, "trees": 16, "big_trees": 12, "rocks": 10, "bushes": 20, "flowers": 150,
		"spawns": [["mushroom", 6, 5, 40], ["bat", 5, 8, 40], ["slime", 4, 5, 40], ["spirit", 2, 14, 40]],
	},
	{
		"path": FOREST_MAP, "title": "어스름 숲", "w": 60, "h": 44, "seed": 51,
		"ground": FOREST_GROUND, "music": "res://assets/ninja/music/forest.ogg", "border": "forest",
		"gaps": [
			{"side": "west", "at": 24, "to": HILL, "spawn": "east", "label": "◀ 언덕"},
			{"side": "east", "at": 32, "to": DESERT, "spawn": "west", "label": "사막 ▶", "lock": "king_slime", "lock_title": "숲의 주인 킹 슬라임"},
		],
		"clearings": 2, "ponds": 0, "rivers": 0, "trees": 90, "big_trees": 8, "rocks": 12, "bushes": 40, "flowers": 16,
		"spawns": [["spirit", 5, 6, 40], ["skull", 5, 8, 40], ["bat", 4, 6, 40], ["mushroom", 3, 5, 40]],
		"bosses": [["king_slime", Vector2i(47, 9)]],
	},
	{
		"path": DESERT, "title": "타오르는 사막", "w": 60, "h": 40, "seed": 31,
		"ground": SAND_GROUND, "music": "res://assets/ninja/music/desert.ogg", "border": "desert",
		"gaps": [
			{"side": "west", "at": 20, "to": FOREST_MAP, "spawn": "east", "label": "◀ 숲"},
			{"side": "east", "at": 14, "to": DESERT_TOWN, "spawn": "west", "label": "오아시스 마을 ▶"},
		],
		"clearings": 3, "ponds": 3, "rivers": 1, "river_width": 2.2, "trees": 0, "big_trees": 0, "rocks": 14, "bushes": 0, "flowers": 0, "desert": true,
		"palms": 30, "bones": 14,
		"spawns": [["snake", 10, 6, 40], ["lizard", 6, 8, 40], ["mole", 3, 10, 40]],
	},
	{
		"path": DESERT2, "title": "모래바람 협곡", "w": 58, "h": 42, "seed": 61,
		"ground": SAND_GROUND, "music": "res://assets/ninja/music/desert2.ogg", "border": "desert",
		"tint": Color(0.94, 0.84, 0.78),
		"gaps": [
			{"side": "west", "at": 26, "to": DESERT_TOWN, "spawn": "east", "label": "◀ 오아시스 마을"},
			{"side": "east", "at": 10, "to": DESERT3, "spawn": "west", "label": "폐허 ▶"},
		],
		"clearings": 3, "ponds": 1, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 34, "bushes": 0, "flowers": 0, "desert": true,
		"palms": 8, "bones": 40, "border_palms": 0.25,
		"spawns": [["lizard", 6, 6, 40], ["mole", 6, 8, 40], ["eye", 6, 10, 40], ["cyclope", 2, 16, 40]],
	},
	{
		"path": DESERT3, "title": "저주받은 폐허", "w": 60, "h": 44, "seed": 71,
		"ground": SAND_GROUND, "music": "res://assets/ninja/music/desert3.ogg", "border": "desert",
		"tint": Color(0.70, 0.60, 0.80),
		"gaps": [
			{"side": "west", "at": 22, "to": DESERT2, "spawn": "east", "label": "◀ 협곡"},
			{"side": "east", "at": 22, "to": LAVA1, "spawn": "west", "label": "용암 지대 ▶", "lock": "kraken", "lock_title": "3장 보스 심해의 크라켄"},
		],
		"clearings": 3, "ponds": 0, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 24, "bushes": 0, "flowers": 0, "desert": true,
		"palms": 0, "bones": 70, "border_palms": 0.0,
		"spawns": [["eye", 6, 6, 40], ["cyclope", 4, 10, 40], ["skull", 5, 6, 40], ["spirit", 4, 8, 40]],
		"bosses": [["cyclope_king", Vector2i(48, 32)]],
	},
]

## 입구 맵: 몬스터 없이 다음 지역을 그림으로 보여 주고(scenery), 들어가려 하면 막는다(barriers).
## npcs: [이름, 그림, 칸, 대사]
const GATE_MAPS: Array[Dictionary] = [
	{
		"path": SHORE, "title": "잊혀진 나루터", "w": 40, "h": 28, "seed": 81,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/shore.ogg", "border": "forest",
		"tint": Color(0.9, 0.95, 1.0),
		"gaps": [{"side": "east", "at": 13, "to": VILLAGE, "spawn": "west", "label": "마을 ▶"}],
		# 물 위 바위섬(윗면 칸)과 섬까지의 나무 다리
		"hub": Vector2i(29, 14), "sea_west": 21, "island": Rect2i(3, 5, 10, 10), "pier": Rect2i(13, 11, 8, 2), "scenery": "temple",
		"clearings": 0, "ponds": 0, "rivers": 0, "trees": 12, "big_trees": 2, "rocks": 5, "bushes": 14, "flowers": 40,
		"spawns": [],
		"npcs": [["뱃사공", "oldman", Vector2i(23, 10), ["다리 끝 섬이 해저 신전으로 가는 문이라네.", "푸른 봉인이 걸려 있어 아무도 못 들어가지.", "설산 꼭대기의 대왕곰을 쓰러뜨리면 봉인이 풀린다더군."]]],
		"barriers": [{"cell": Vector2i(7, 7), "size": Vector2i(2, 1), "side": 0, "to": TEMPLE, "lock": "yeti_king",
			"title": "신전 문이 봉인되어 있어요", "sub": "해저 신전은 설산 정상의 대왕곰을 물리친 뒤 열려요"}],
	},
	{
		"path": SNOWGATE, "title": "설산 입구", "w": 34, "h": 30, "seed": 91,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/snowgate.ogg", "border": "snow",
		"tint": Color(0.93, 0.96, 1.0),
		"gaps": [{"side": "south", "at": 16, "to": VILLAGE, "spawn": "north", "label": "마을"}],
		# 위쪽은 두 층 바위 절벽(top_rows 칸까지 못 올라감), 가운데 동굴, 아래로 갈수록 눈이 듬성듬성
		"hub": Vector2i(17, 19), "path_to": Vector2i(16, 8), "scenery": "mountain", "top_rows": 7, "straight_path": true,
		"clearings": 1, "ponds": 0, "rivers": 0, "trees": 14, "big_trees": 0, "rocks": 0, "bushes": 0, "flowers": 0,
		"spawns": [],
		"npcs": [["설산 파수꾼", "knight", Vector2i(20, 9), ["눈사태로 동굴 입구가 막혔다.", "얼음을 녹일 힘이 있어야 지나갈 수 있지.", "수정 동굴의 여왕을 쓰러뜨린 자라면 길을 열어 주겠다."]]],
		"barriers": [{"cell": Vector2i(15, 7), "size": Vector2i(4, 1), "side": 0, "to": SNOW, "lock": "spider_queen",
			"title": "눈사태로 입구가 막혔어요", "sub": "남쪽 수정 동굴의 거미 여왕을 물리치면 얼음이 녹아요"}],
	},
]

## 2~5장과 1장 남쪽 맵(tools/gen 결과를 붙여 넣음)
const MORE_MAPS: Array[Dictionary] = [
	{"path": "res://features/world/swamp.tscn", "title": "독안개 늪", "w": 56, "h": 42, "seed": 101, "ground": SWAMP_GROUND, "music": "res://assets/ninja/music/swamp.ogg", "border": "dead", "gaps": [
			{"side": "north", "to": "res://features/world/village.tscn", "spawn": "south", "label": "마을", "at": 19},
			{"side": "east", "to": "res://features/world/ruinvillage.tscn", "spawn": "west", "label": "폐허 마을 ▶", "at": 20},
			{"side": "west", "to": "res://features/world/waterfall.tscn", "spawn": "east", "label": "◀ 폭포", "at": 24},
			{"side": "south", "to": "res://features/world/beach.tscn", "spawn": "north", "label": "해변", "at": 30},
		], "clearings": 3, "ponds": 7, "rivers": 0, "trees": 24, "big_trees": 6, "rocks": 8, "bushes": 16, "flowers": 6, "spawns": [["kappa", 8, 6, 40], ["slime", 5, 5, 40], ["lantern", 3, 12, 40]], "big_tree_set": "dead", "tint": Color(0.82, 0.9, 0.8)},
	{"path": "res://features/world/ruinvillage.tscn", "title": "버려진 마을", "w": 54, "h": 40, "seed": 102, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/ruinvillage.ogg", "border": "forest", "gaps": [
			{"side": "west", "to": "res://features/world/swamp.tscn", "spawn": "east", "label": "◀ 늪", "at": 20},
			{"side": "south", "to": "res://features/world/crystalcave.tscn", "spawn": "north", "label": "수정 동굴", "at": 27},
		], "clearings": 3, "ponds": 1, "rivers": 0, "trees": 14, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 10, "spawns": [["lantern", 6, 6, 40], ["rat", 7, 5, 40], ["skull", 4, 10, 40], ["spirit", 3, 12, 40]], "ruins": 9, "tint": Color(0.85, 0.85, 0.9)},
	{"path": "res://features/world/crystalcave.tscn", "title": "수정 동굴", "w": 50, "h": 38, "seed": 103, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "north", "to": "res://features/world/ruinvillage.tscn", "spawn": "south", "label": "폐허 마을", "at": 25},
		], "clearings": 3, "ponds": 0, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 34, "bushes": 0, "flowers": 0, "spawns": [["spider", 7, 6, 40], ["bluebat", 7, 6, 40], ["mole", 4, 8, 40]], "crystals": 26, "tint": Color(0.7, 0.75, 0.95), "bosses": [["spider_queen", Vector2i(38, 28)]]},
	{"path": "res://features/world/waterfall.tscn", "title": "폭포 계곡", "w": 50, "h": 40, "seed": 104, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/waterfall.ogg", "border": "forest", "gaps": [
			{"side": "east", "to": "res://features/world/swamp.tscn", "spawn": "west", "label": "늪 ▶", "at": 24},
		], "clearings": 3, "ponds": 2, "rivers": 1, "trees": 26, "big_trees": 5, "rocks": 8, "bushes": 20, "flowers": 60, "spawns": [["axolot", 7, 6, 40], ["butterfly", 6, 5, 40], ["racoon", 4, 8, 40]], "waterfall": true, "top_rows": 5, "river_width": 2.2},
	{"path": "res://features/world/beach.tscn", "title": "푸른 해변", "w": 56, "h": 36, "seed": 105, "ground": SAND_GROUND, "music": "res://assets/ninja/music/beach.ogg", "border": "desert", "gaps": [
			{"side": "north", "to": "res://features/world/swamp.tscn", "spawn": "south", "label": "늪", "at": 24},
			{"side": "east", "to": "res://features/world/mist1.tscn", "spawn": "west", "label": "안개 군도행 배 ▶", "at": 12, "lock": "black_gardener", "lock_title": "검은 정원사"},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 8, "bushes": 0, "flowers": 0, "spawns": [["octopus", 8, 6, 40], ["racoon", 5, 6, 40], ["kappa", 3, 10, 40]], "sea_south": 26, "desert": true, "palms": 34, "bones": 6, "border_palms": 0.8},
	{"path": "res://features/world/snow1.tscn", "title": "눈꽃 평원", "w": 50, "h": 40, "seed": 201, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/snow.ogg", "border": "snow", "gaps": [
			{"side": "south", "to": "res://features/world/snowgate.tscn", "spawn": "north", "label": "설산 입구", "at": 24},
			{"side": "north", "to": "res://features/world/snow_town.tscn", "spawn": "south", "label": "눈꽃 마을", "at": 30},
		], "clearings": 3, "ponds": 3, "rivers": 0, "trees": 30, "big_trees": 3, "rocks": 0, "bushes": 0, "flowers": 0, "spawns": [["snow_mouse", 8, 6, 40], ["panda", 5, 8, 40], ["snow_bat", 4, 10, 40]], "tint": Color(0.95, 0.97, 1.0)},
	{"path": "res://features/world/snow2.tscn", "title": "얼어붙은 호수", "w": 56, "h": 46, "seed": 202, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/snow.ogg", "border": "snow", "gaps": [
			{"side": "south", "to": "res://features/world/snow_town.tscn", "spawn": "north", "label": "눈꽃 마을", "at": 28},
			{"side": "east", "to": "res://features/world/snow3.tscn", "spawn": "west", "label": "눈보라 협곡 ▶", "at": 22},
		], "clearings": 3, "ponds": 0, "rivers": 0, "trees": 24, "big_trees": 2, "rocks": 0, "bushes": 0, "flowers": 0, "spawns": [["snow_mouse", 6, 8, 40], ["ice_skull", 6, 8, 40], ["snow_bat", 5, 8, 40]], "lake": 13.0, "hub": Vector2i(28, 23), "tint": Color(0.92, 0.96, 1.0)},
	{"path": "res://features/world/snow3.tscn", "title": "눈보라 협곡", "w": 74, "h": 22, "seed": 203, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/snow.ogg", "border": "snow", "gaps": [
			{"side": "west", "to": "res://features/world/snow2.tscn", "spawn": "east", "label": "◀ 호수", "at": 11},
			{"side": "east", "to": "res://features/world/snow4.tscn", "spawn": "west", "label": "서리 숲 ▶", "at": 10},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 26, "big_trees": 2, "rocks": 0, "bushes": 0, "flowers": 0, "spawns": [["bear", 5, 8, 60], ["frost_spirit", 6, 8, 60], ["ice_skull", 5, 8, 60]], "tint": Color(0.85, 0.9, 1.0)},
	{"path": "res://features/world/snow4.tscn", "title": "서리 전나무 숲", "w": 56, "h": 44, "seed": 204, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/snow.ogg", "border": "snow", "gaps": [
			{"side": "west", "to": "res://features/world/snow3.tscn", "spawn": "east", "label": "◀ 협곡", "at": 22},
			{"side": "north", "to": "res://features/world/snow5.tscn", "spawn": "south", "label": "빙하 동굴", "at": 28},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 110, "big_trees": 6, "rocks": 0, "bushes": 0, "flowers": 0, "spawns": [["bear", 6, 6, 40], ["panda", 5, 6, 40], ["frost_spirit", 5, 10, 40]], "tint": Color(0.88, 0.93, 1.0)},
	{"path": "res://features/world/snow5.tscn", "title": "빙하 동굴", "w": 50, "h": 38, "seed": 205, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "south", "to": "res://features/world/snow4.tscn", "spawn": "north", "label": "서리 숲", "at": 25},
			{"side": "east", "to": "res://features/world/snow6.tscn", "spawn": "west", "label": "설산 정상 ▶", "at": 18},
		], "clearings": 3, "ponds": 4, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 30, "bushes": 0, "flowers": 0, "spawns": [["ice_skull", 7, 6, 40], ["frost_spirit", 7, 6, 40], ["snow_bat", 6, 6, 40]], "crystals": 24, "tint": Color(0.65, 0.78, 1.0)},
	{"path": "res://features/world/snow6.tscn", "title": "설산 정상", "w": 36, "h": 30, "seed": 206, "ground": SNOWF_GROUND, "music": "res://assets/ninja/music/snow_peak.ogg", "border": "snow", "gaps": [
			{"side": "west", "to": "res://features/world/snow5.tscn", "spawn": "east", "label": "◀ 빙하 동굴", "at": 15},
		], "clearings": 1, "ponds": 0, "rivers": 0, "trees": 8, "big_trees": 0, "rocks": 0, "bushes": 0, "flowers": 0, "spawns": [["bear", 3, 8, 40], ["panda", 3, 8, 40]], "tint": Color(0.96, 0.98, 1.0), "bosses": [["yeti_king", Vector2i(26, 9)]]},
	{"path": "res://features/world/temple1.tscn", "title": "신전 입구 홀", "w": 48, "h": 30, "seed": 301, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/shore.tscn", "spawn": "east", "label": "◀ 나루터", "at": 14},
			{"side": "east", "to": "res://features/world/temple2.tscn", "spawn": "west", "label": "물길 회랑 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["blue_axolot", 6, 6, 60], ["jump_fish", 5, 6, 60]], "temple": true, "rooms": 4, "tint": Color(0.8, 0.88, 1.0)},
	{"path": "res://features/world/temple2.tscn", "title": "물길 회랑", "w": 48, "h": 30, "seed": 302, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/temple1.tscn", "spawn": "east", "label": "◀ 신전 입구 홀", "at": 14},
			{"side": "east", "to": "res://features/world/temple_town.tscn", "spawn": "west", "label": "물방울 마을 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["green_octopus", 6, 6, 60], ["blue_axolot", 6, 6, 60]], "temple": true, "rooms": 3, "tint": Color(0.8, 0.88, 1.0)},
	{"path": "res://features/world/temple3.tscn", "title": "수몰된 서고", "w": 48, "h": 30, "seed": 303, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/temple_town.tscn", "spawn": "east", "label": "◀ 물방울 마을", "at": 14},
			{"side": "east", "to": "res://features/world/temple4.tscn", "spawn": "west", "label": "거울 연못 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["kappa_red", 6, 6, 60], ["green_octopus", 6, 6, 60]], "temple": true, "rooms": 4, "tint": Color(0.8, 0.88, 1.0)},
	{"path": "res://features/world/temple4.tscn", "title": "거울 연못", "w": 48, "h": 30, "seed": 304, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/temple3.tscn", "spawn": "east", "label": "◀ 수몰된 서고", "at": 14},
			{"side": "east", "to": "res://features/world/temple5.tscn", "spawn": "west", "label": "심연 계단 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["red_octopus", 6, 6, 60], ["jump_fish", 6, 6, 60]], "temple": true, "rooms": 3, "tint": Color(0.8, 0.88, 1.0)},
	{"path": "res://features/world/temple5.tscn", "title": "심연 계단", "w": 48, "h": 30, "seed": 305, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/temple4.tscn", "spawn": "east", "label": "◀ 거울 연못", "at": 14},
			{"side": "east", "to": "res://features/world/temple6.tscn", "spawn": "west", "label": "해신의 제단 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["deep_octopus", 7, 6, 60], ["kappa_red", 6, 6, 60]], "temple": true, "rooms": 4, "tint": Color(0.8, 0.88, 1.0)},
	{"path": "res://features/world/temple6.tscn", "title": "해신의 제단", "w": 48, "h": 30, "seed": 306, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/temple.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/temple5.tscn", "spawn": "east", "label": "◀ 심연 계단", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["deep_octopus", 4, 6, 60], ["red_octopus", 4, 6, 60]], "temple": true, "rooms": 3, "tint": Color(0.8, 0.88, 1.0), "bosses": [["kraken", Vector2i(36, 14)]]},
	{"path": "res://features/world/lava1.tscn", "title": "잿빛 황무지", "w": 58, "h": 42, "seed": 401, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/desert3.tscn", "spawn": "east", "label": "◀ 저주받은 폐허", "at": 20},
			{"side": "east", "to": "res://features/world/lava2.tscn", "spawn": "west", "label": "용암 강 ▶", "at": 20},
		], "clearings": 3, "ponds": 4, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["flam", 7, 6, 60], ["heart_red", 5, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true},
	{"path": "res://features/world/lava2.tscn", "title": "용암 강", "w": 58, "h": 42, "seed": 402, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava1.tscn", "spawn": "east", "label": "◀ 잿빛 황무지", "at": 20},
			{"side": "east", "to": "res://features/world/lava3.tscn", "spawn": "west", "label": "불꽃 협곡 ▶", "at": 20},
		], "clearings": 3, "ponds": 2, "rivers": 2, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["flam", 6, 6, 60], ["flam2", 5, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true, "river_width": 2.6},
	{"path": "res://features/world/lava3.tscn", "title": "불꽃 협곡", "w": 76, "h": 22, "seed": 403, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava2.tscn", "spawn": "east", "label": "◀ 용암 강", "at": 10},
			{"side": "east", "to": "res://features/world/lava_town.tscn", "spawn": "west", "label": "불꽃 대장간 마을 ▶", "at": 10},
		], "clearings": 4, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["dragon_y", 5, 6, 60], ["flam2", 6, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true},
	{"path": "res://features/world/lava4.tscn", "title": "마그마 호수", "w": 56, "h": 44, "seed": 404, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava_town.tscn", "spawn": "east", "label": "◀ 불꽃 대장간 마을", "at": 21},
			{"side": "east", "to": "res://features/world/lava5.tscn", "spawn": "west", "label": "화산 기슭 ▶", "at": 21},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["trex", 5, 6, 60], ["flam", 6, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true, "lake": 12.0, "hub": Vector2i(28, 22)},
	{"path": "res://features/world/lava5.tscn", "title": "화산 기슭", "w": 58, "h": 42, "seed": 405, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava4.tscn", "spawn": "east", "label": "◀ 마그마 호수", "at": 20},
			{"side": "east", "to": "res://features/world/lava6.tscn", "spawn": "west", "label": "화염룡의 둥지 ▶", "at": 20},
		], "clearings": 3, "ponds": 3, "rivers": 1, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["grey_trex", 5, 6, 60], ["dragon_y", 5, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true, "river_width": 2.0},
	{"path": "res://features/world/lava6.tscn", "title": "화염룡의 둥지", "w": 38, "h": 30, "seed": 406, "ground": HELL_GROUND, "music": "res://assets/ninja/music/lava.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava5.tscn", "spawn": "east", "label": "◀ 화산 기슭", "at": 14},
			{"side": "east", "to": "res://features/world/hell1.tscn", "spawn": "west", "label": "지옥문 ▶", "lock": "flame_dragon", "lock_title": "화염룡 이그니스", "at": 14},
		], "clearings": 1, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["dragon", 4, 6, 60], ["flam2", 4, 6, 60]], "desert": true, "palms": 0, "bones": 24, "border_palms": 0.0, "tint": Color(1.0, 0.82, 0.7), "lava": true, "bosses": [["flame_dragon", Vector2i(28, 15)]]},
	{"path": "res://features/world/hell1.tscn", "title": "지옥문", "w": 58, "h": 42, "seed": 407, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/lava6.tscn", "spawn": "east", "label": "◀ 화염룡의 둥지", "at": 20},
			{"side": "east", "to": "res://features/world/hell2.tscn", "spawn": "west", "label": "비명의 회랑 ▶", "at": 20},
		], "clearings": 3, "ponds": 3, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["lantern_red", 7, 6, 60], ["demon_eye", 4, 6, 60]], "desert": true, "palms": 0, "bones": 40, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true},
	{"path": "res://features/world/hell2.tscn", "title": "비명의 회랑", "w": 76, "h": 22, "seed": 408, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/hell1.tscn", "spawn": "east", "label": "◀ 지옥문", "at": 10},
			{"side": "east", "to": "res://features/world/hell3.tscn", "spawn": "west", "label": "뼈의 들판 ▶", "at": 10},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["lantern_red", 6, 6, 60], ["demon_eye", 4, 6, 60]], "desert": true, "palms": 0, "bones": 40, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true},
	{"path": "res://features/world/hell3.tscn", "title": "뼈의 들판", "w": 58, "h": 42, "seed": 409, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/hell2.tscn", "spawn": "east", "label": "◀ 비명의 회랑", "at": 20},
			{"side": "east", "to": "res://features/world/hell4.tscn", "spawn": "west", "label": "핏빛 호수 ▶", "at": 20},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["grey_trex", 5, 6, 60], ["lantern_red", 7, 6, 60]], "desert": true, "palms": 0, "bones": 90, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true},
	{"path": "res://features/world/hell4.tscn", "title": "핏빛 호수", "w": 56, "h": 44, "seed": 410, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell_deep.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/hell3.tscn", "spawn": "east", "label": "◀ 뼈의 들판", "at": 21},
			{"side": "east", "to": "res://features/world/hell5.tscn", "spawn": "west", "label": "타락한 성채 ▶", "at": 21},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["demon_eye", 5, 6, 60], ["dragon", 5, 6, 60]], "desert": true, "palms": 0, "bones": 40, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true, "lake": 12.0, "hub": Vector2i(28, 22)},
	{"path": "res://features/world/hell5.tscn", "title": "타락한 성채", "w": 58, "h": 42, "seed": 411, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell_deep.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/hell4.tscn", "spawn": "east", "label": "◀ 핏빛 호수", "at": 20},
			{"side": "east", "to": "res://features/world/hell6.tscn", "spawn": "west", "label": "마왕의 옥좌 ▶", "at": 20},
		], "clearings": 3, "ponds": 2, "rivers": 1, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["demon_eye", 6, 6, 60], ["lantern_red", 6, 6, 60]], "desert": true, "palms": 0, "bones": 40, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true, "river_width": 2.4},
	{"path": "res://features/world/hell6.tscn", "title": "마왕의 옥좌", "w": 38, "h": 30, "seed": 412, "ground": HELL_GROUND, "music": "res://assets/ninja/music/hell_deep.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/hell5.tscn", "spawn": "east", "label": "◀ 타락한 성채", "at": 14},
			{"side": "east", "to": "res://features/world/sky1.tscn", "spawn": "west", "label": "빛의 계단 ▶", "at": 14, "lock": "demon_lord", "lock_title": "마왕 아자젤"},
		], "clearings": 1, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 20, "bushes": 0, "flowers": 0, "spawns": [["demon_eye", 4, 6, 60], ["dragon", 4, 6, 60]], "desert": true, "palms": 0, "bones": 40, "border_palms": 0.0, "tint": Color(0.78, 0.6, 0.72), "lava": true, "bosses": [["demon_lord", Vector2i(28, 15)]]},
	{"path": "res://features/world/sky1.tscn", "title": "버섯 구름섬", "w": 50, "h": 40, "seed": 501, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/field.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/hell6.tscn", "spawn": "east", "label": "◀ 마왕의 옥좌", "at": 19},
			{"side": "east", "to": "res://features/world/sky2.tscn", "spawn": "west", "label": "꽃구름 섬 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 4, "bushes": 14, "flowers": 80, "spawns": [["bamboo", 7, 6, 40], ["heart_green", 6, 6, 40], ["sky_bat", 5, 8, 40]], "isle": true, "tint": Color(1.0, 0.94, 1.0)},
	{"path": "res://features/world/sky2.tscn", "title": "꽃구름 섬", "w": 50, "h": 40, "seed": 502, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/field.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/sky1.tscn", "spawn": "east", "label": "◀ 버섯 구름섬", "at": 19},
			{"side": "east", "to": "res://features/world/sky_town.tscn", "spawn": "west", "label": "구름 마을 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 14, "big_trees": 10, "rocks": 4, "bushes": 10, "flowers": 140, "spawns": [["bamboo_y", 7, 6, 40], ["gold_racoon", 6, 6, 40], ["sky_bat", 5, 8, 40]], "isle": true, "big_tree_set": "blossom", "tint": Color(1.0, 0.95, 0.98)},
	{"path": "res://features/world/sky3.tscn", "title": "천공의 탑 1층", "w": 48, "h": 30, "seed": 503, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/sky_town.tscn", "spawn": "east", "label": "◀ 구름 마을", "at": 14},
			{"side": "east", "to": "res://features/world/sky4.tscn", "spawn": "west", "label": "천공의 탑 2층 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["sky_spirit", 6, 6, 60], ["gold_racoon", 6, 6, 60]], "temple": true, "rooms": 4, "tint": Color(1.0, 0.93, 0.78)},
	{"path": "res://features/world/sky4.tscn", "title": "천공의 탑 2층", "w": 48, "h": 30, "seed": 504, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/sky3.tscn", "spawn": "east", "label": "◀ 천공의 탑 1층", "at": 14},
			{"side": "east", "to": "res://features/world/sky5.tscn", "spawn": "west", "label": "천공의 탑 3층 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["sky_spirit", 6, 6, 60], ["bamboo_y", 6, 6, 60]], "temple": true, "rooms": 3, "tint": Color(1.0, 0.93, 0.78)},
	{"path": "res://features/world/sky5.tscn", "title": "천공의 탑 3층", "w": 48, "h": 30, "seed": 505, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/sky4.tscn", "spawn": "east", "label": "◀ 천공의 탑 2층", "at": 14},
			{"side": "east", "to": "res://features/world/sky6.tscn", "spawn": "west", "label": "천공의 탑 꼭대기 ▶", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["gold_racoon", 7, 6, 60], ["heart_green", 6, 6, 60]], "temple": true, "rooms": 4, "tint": Color(1.0, 0.93, 0.78)},
	{"path": "res://features/world/sky6.tscn", "title": "천공의 탑 꼭대기", "w": 48, "h": 30, "seed": 506, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/sky5.tscn", "spawn": "east", "label": "◀ 천공의 탑 3층", "at": 14},
			{"side": "east", "to": "res://features/world/root1.tscn", "spawn": "west", "label": "뿌리로 내려가기 ▶", "at": 14, "lock": "giant_soul", "lock_title": "고대 거인의 혼"},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["sky_spirit", 4, 6, 60], ["gold_racoon", 3, 6, 60]], "temple": true, "rooms": 3, "tint": Color(1.0, 0.93, 0.78), "bosses": [["giant_soul", Vector2i(36, 14)]]},
	# ── 2부 6장: 큰 나무의 뿌리 ──
	{"path": "res://features/world/root1.tscn", "title": "뿌리 내리막길", "w": 50, "h": 38, "seed": 601, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/sky6.tscn", "spawn": "east", "label": "◀ 천공의 탑 꼭대기", "at": 18},
			{"side": "east", "to": "res://features/world/root2.tscn", "spawn": "west", "label": "빛나는 뿌리 동굴 ▶", "at": 18},
		], "clearings": 3, "ponds": 0, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 30, "bushes": 0, "flowers": 0, "spawns": [["root_larva", 7, 6, 60], ["root_mole", 5, 6, 60]], "crystals": 10, "tint": Color(0.72, 0.88, 0.74)},
	{"path": "res://features/world/root2.tscn", "title": "빛나는 뿌리 동굴", "w": 52, "h": 40, "seed": 602, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/root1.tscn", "spawn": "east", "label": "◀ 뿌리 내리막길", "at": 19},
			{"side": "east", "to": "res://features/world/root_town.tscn", "spawn": "west", "label": "새싹 마을 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 26, "bushes": 0, "flowers": 0, "spawns": [["root_larva_b", 7, 6, 60], ["root_shroom", 6, 6, 60]], "crystals": 30, "tint": Color(0.72, 0.88, 0.74)},
	{"path": "res://features/world/root3.tscn", "title": "썩은 물길", "w": 56, "h": 40, "seed": 603, "ground": SWAMP_GROUND, "music": "res://assets/ninja/music/swamp.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/root_town.tscn", "spawn": "east", "label": "◀ 새싹 마을", "at": 19},
			{"side": "east", "to": "res://features/world/root4.tscn", "spawn": "west", "label": "벌레 굴 ▶", "at": 19},
		], "clearings": 3, "ponds": 6, "rivers": 1, "trees": 16, "big_trees": 6, "big_tree_set": "dead", "rocks": 10, "bushes": 12, "flowers": 4, "spawns": [["root_mollusc", 7, 6, 60], ["root_shroom", 5, 6, 60]], "river_width": 2.2, "tint": Color(0.72, 0.88, 0.74)},
	{"path": "res://features/world/root4.tscn", "title": "벌레 굴", "w": 72, "h": 24, "seed": 604, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/root3.tscn", "spawn": "east", "label": "◀ 썩은 물길", "at": 11},
			{"side": "east", "to": "res://features/world/root5.tscn", "spawn": "west", "label": "뿌리 심장 앞 ▶", "at": 11},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 30, "bushes": 0, "flowers": 0, "spawns": [["root_larva", 6, 6, 60], ["root_larva_b", 6, 6, 60], ["root_beast", 3, 8, 60]], "crystals": 8, "tint": Color(0.72, 0.88, 0.74)},
	{"path": "res://features/world/root5.tscn", "title": "뿌리 심장 앞", "w": 54, "h": 40, "seed": 605, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/root4.tscn", "spawn": "east", "label": "◀ 벌레 굴", "at": 19},
			{"side": "east", "to": "res://features/world/root6.tscn", "spawn": "west", "label": "검은 씨앗의 방 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 1, "trees": 0, "big_trees": 0, "rocks": 30, "bushes": 0, "flowers": 0, "spawns": [["root_beast", 5, 6, 60], ["root_mollusc", 6, 6, 60]], "crystals": 20, "river_width": 2.0, "tint": Color(0.72, 0.88, 0.74)},
	{"path": "res://features/world/root6.tscn", "title": "검은 씨앗의 방", "w": 40, "h": 30, "seed": 606, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/root5.tscn", "spawn": "east", "label": "◀ 뿌리 심장 앞", "at": 14},
			{"side": "east", "to": "res://features/world/garden1.tscn", "spawn": "west", "label": "검은 정원 ▶", "at": 14, "lock": "root_worm", "lock_title": "뿌리 먹는 벌레왕"},
		], "clearings": 1, "ponds": 1, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 24, "bushes": 0, "flowers": 0, "spawns": [["root_beast", 4, 6, 60], ["root_larva_b", 4, 6, 60]], "crystals": 14, "tint": Color(0.66, 0.74, 0.7), "bosses": [["root_worm", Vector2i(28, 15)]]},
	# ── 2부 7장: 검은 정원 ──
	{"path": "res://features/world/garden1.tscn", "title": "시든 꽃길", "w": 52, "h": 40, "seed": 701, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/ruinvillage.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/root6.tscn", "spawn": "east", "label": "◀ 검은 씨앗의 방", "at": 19},
			{"side": "east", "to": "res://features/world/garden2.tscn", "spawn": "west", "label": "가시덤불 미로 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 18, "big_trees": 6, "big_tree_set": "dead", "rocks": 8, "bushes": 14, "flowers": 120, "spawns": [["garden_moth", 7, 6, 60], ["garden_lizard", 6, 6, 60]], "tint": Color(0.74, 0.62, 0.86)},
	{"path": "res://features/world/garden2.tscn", "title": "가시덤불 미로", "w": 56, "h": 42, "seed": 702, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/ruinvillage.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/garden1.tscn", "spawn": "east", "label": "◀ 시든 꽃길", "at": 20},
			{"side": "east", "to": "res://features/world/garden3.tscn", "spawn": "west", "label": "검은 연못 ▶", "at": 20},
		], "clearings": 5, "ponds": 1, "rivers": 0, "trees": 44, "big_trees": 8, "big_tree_set": "dead", "rocks": 6, "bushes": 40, "flowers": 30, "spawns": [["garden_snake", 7, 6, 60], ["garden_spider", 6, 6, 60]], "tint": Color(0.74, 0.62, 0.86)},
	{"path": "res://features/world/garden3.tscn", "title": "검은 연못", "w": 56, "h": 44, "seed": 703, "ground": SWAMP_GROUND, "music": "res://assets/ninja/music/swamp.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/garden2.tscn", "spawn": "east", "label": "◀ 가시덤불 미로", "at": 21},
			{"side": "east", "to": "res://features/world/garden4.tscn", "spawn": "west", "label": "거꾸로 자란 숲 ▶", "at": 21},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 14, "big_trees": 6, "big_tree_set": "dead", "rocks": 6, "bushes": 10, "flowers": 20, "spawns": [["garden_owl", 6, 6, 60], ["garden_lizard2", 6, 6, 60]], "lake": 11.0, "hub": Vector2i(28, 22), "tint": Color(0.74, 0.62, 0.86)},
	{"path": "res://features/world/garden4.tscn", "title": "거꾸로 자란 숲", "w": 52, "h": 40, "seed": 704, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/forest.ogg", "border": "forest", "gaps": [
			{"side": "west", "to": "res://features/world/garden3.tscn", "spawn": "east", "label": "◀ 검은 연못", "at": 19},
			{"side": "east", "to": "res://features/world/garden5.tscn", "spawn": "west", "label": "정원사의 길 ▶", "at": 19},
		], "clearings": 3, "ponds": 1, "rivers": 1, "trees": 40, "big_trees": 10, "big_tree_set": "dead", "rocks": 6, "bushes": 20, "flowers": 40, "spawns": [["garden_owl2", 6, 6, 60], ["garden_beast", 4, 8, 60], ["garden_moth", 4, 6, 60]], "river_width": 2.0, "tint": Color(0.74, 0.62, 0.86)},
	{"path": "res://features/world/garden5.tscn", "title": "정원사의 길", "w": 74, "h": 22, "seed": 705, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/forest.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/garden4.tscn", "spawn": "east", "label": "◀ 거꾸로 자란 숲", "at": 10},
			{"side": "east", "to": "res://features/world/garden6.tscn", "spawn": "west", "label": "검은 나무 아래 ▶", "at": 10},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 20, "big_trees": 6, "big_tree_set": "dead", "rocks": 8, "bushes": 16, "flowers": 80, "spawns": [["garden_beast", 5, 6, 60], ["garden_spider", 5, 6, 60], ["garden_owl", 4, 6, 60]], "ruins": 6, "tint": Color(0.74, 0.62, 0.86)},
	{"path": "res://features/world/garden6.tscn", "title": "검은 나무 아래", "w": 42, "h": 32, "seed": 706, "ground": FOREST_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "dead", "gaps": [
			{"side": "west", "to": "res://features/world/garden5.tscn", "spawn": "east", "label": "◀ 정원사의 길", "at": 15},
		], "clearings": 1, "ponds": 2, "rivers": 0, "trees": 8, "big_trees": 8, "big_tree_set": "dead", "rocks": 6, "bushes": 8, "flowers": 60, "spawns": [["garden_owl2", 4, 6, 60], ["garden_snake", 4, 6, 60]], "tint": Color(0.62, 0.52, 0.76), "bosses": [["black_gardener", Vector2i(30, 15)]]},
	# ── 3부 8장: 안개 군도 ──
	{"path": "res://features/world/mist1.tscn", "title": "안개 해안", "w": 56, "h": 36, "seed": 801, "ground": SAND_GROUND, "music": "res://assets/ninja/music/beach.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/beach.tscn", "spawn": "east", "label": "◀ 푸른 해변", "at": 12},
			{"side": "east", "to": "res://features/world/mist_town.tscn", "spawn": "west", "label": "안개 항구 ▶", "at": 12},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 10, "bushes": 0, "flowers": 0, "spawns": [["mist_octo", 7, 6, 60], ["mist_fish", 6, 6, 60]], "sea_south": 26, "desert": true, "palms": 18, "bones": 10, "border_palms": 0.5, "tint": Color(0.78, 0.86, 0.95)},
	{"path": "res://features/world/mist2.tscn", "title": "난파선 무덤", "w": 58, "h": 40, "seed": 802, "ground": SAND_GROUND, "music": "res://assets/ninja/music/desert3.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/mist_town.tscn", "spawn": "east", "label": "◀ 안개 항구", "at": 19},
			{"side": "east", "to": "res://features/world/mist3.tscn", "spawn": "west", "label": "산호 숲 ▶", "at": 19},
		], "clearings": 3, "ponds": 3, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 14, "bushes": 0, "flowers": 0, "spawns": [["mist_skull", 7, 6, 60], ["mist_octo", 5, 6, 60]], "ruins": 8, "desert": true, "palms": 8, "bones": 60, "border_palms": 0.3, "tint": Color(0.78, 0.86, 0.95)},
	{"path": "res://features/world/mist3.tscn", "title": "산호 숲", "w": 56, "h": 44, "seed": 803, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/waterfall.ogg", "border": "forest", "gaps": [
			{"side": "west", "to": "res://features/world/mist2.tscn", "spawn": "east", "label": "◀ 난파선 무덤", "at": 21},
			{"side": "east", "to": "res://features/world/mist4.tscn", "spawn": "west", "label": "유령 등대 길 ▶", "at": 21},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 22, "big_trees": 8, "big_tree_set": "blossom", "rocks": 6, "bushes": 14, "flowers": 90, "spawns": [["mist_slime", 7, 6, 60], ["mist_fish", 6, 6, 60]], "lake": 11.0, "hub": Vector2i(28, 22), "tint": Color(0.82, 0.9, 1.0)},
	{"path": "res://features/world/mist4.tscn", "title": "유령 등대 길", "w": 76, "h": 22, "seed": 804, "ground": SAND_GROUND, "music": "res://assets/ninja/music/ruinvillage.ogg", "border": "desert", "gaps": [
			{"side": "west", "to": "res://features/world/mist3.tscn", "spawn": "east", "label": "◀ 산호 숲", "at": 10},
			{"side": "east", "to": "res://features/world/mist5.tscn", "spawn": "west", "label": "별무리 절벽 ▶", "at": 10},
		], "clearings": 4, "ponds": 1, "rivers": 0, "trees": 0, "big_trees": 0, "rocks": 16, "bushes": 0, "flowers": 0, "spawns": [["mist_lantern", 7, 6, 60], ["mist_wisp", 6, 6, 60]], "desert": true, "palms": 6, "bones": 30, "border_palms": 0.2, "tint": Color(0.7, 0.78, 0.92)},
	{"path": "res://features/world/mist5.tscn", "title": "별무리 절벽", "w": 54, "h": 40, "seed": 805, "ground": CAVE_GROUND, "music": "res://assets/ninja/music/cave.ogg", "border": "rock", "gaps": [
			{"side": "west", "to": "res://features/world/mist4.tscn", "spawn": "east", "label": "◀ 유령 등대 길", "at": 19},
			{"side": "east", "to": "res://features/world/mist6.tscn", "spawn": "west", "label": "별을 삼킨 탑 ▶", "at": 19},
		], "clearings": 3, "ponds": 2, "rivers": 1, "trees": 0, "big_trees": 0, "rocks": 30, "bushes": 0, "flowers": 0, "spawns": [["mist_snake", 6, 6, 60], ["mist_wisp", 6, 6, 60], ["mist_skull", 4, 6, 60]], "crystals": 34, "river_width": 2.0, "tint": Color(0.72, 0.8, 1.0)},
	{"path": "res://features/world/mist6.tscn", "title": "별을 삼킨 탑", "w": 48, "h": 30, "seed": 806, "ground": GRASS_GROUND, "music": "res://assets/ninja/music/tower.ogg", "border": "none", "gaps": [
			{"side": "west", "to": "res://features/world/mist5.tscn", "spawn": "east", "label": "◀ 별무리 절벽", "at": 14},
		], "clearings": 3, "ponds": 2, "rivers": 0, "trees": 20, "big_trees": 4, "rocks": 8, "bushes": 10, "flowers": 20, "spawns": [["mist_lantern", 4, 6, 60], ["mist_snake", 3, 6, 60]], "temple": true, "rooms": 3, "tint": Color(0.7, 0.76, 1.0), "bosses": [["mist_apostle", Vector2i(36, 14)]]},
]

## 지역 마을: 레몬 마을과 같은 집·광장 짜임에 땅·사람·말이 다르다. villagers 칸은 광장 기준
const TOWN_MAPS: Array[Dictionary] = [
	{
		"path": DESERT_TOWN, "title": "오아시스 마을", "w": 40, "h": 30, "seed": 61, "wobble": 0.0,
		"ground": SAND_GROUND, "music": "res://assets/ninja/music/village.ogg", "border": "desert", "border_palms": 0.8,
		"roads": {"h": [0, 40], "v": [0, 0], "plaza": 3.6}, "torii": false, "desert": true, "palms": 14, "bones": 0,
		"gaps": [
			{"side": "west", "to": DESERT, "spawn": "east", "label": "◀ 사막"},
			{"side": "east", "to": DESERT2, "spawn": "west", "label": "모래바람 협곡 ▶"},
		],
		"ponds": 1, "trees": 0, "big_trees": 0, "rocks": 4, "bushes": 0, "flowers": 0,
		"village": true, "spawns": [],
		"villagers": [
			["족장", "sultan", Vector2i(-3, -3), ["모래 폭풍보다 무서운 게 몬스터 떼라네.", "협곡 너머 폐허에서 몬스터가 끝도 없이 기어 나와."]],
			["물장수", "villager4", Vector2i(8, 3), ["오아시스 물이 점점 줄고 있어요.", "몬스터가 늘어난 뒤로 사막도 메말라 가요."]],
			["대상", "inspector", Vector2i(-12, 4), ["동쪽 저주받은 폐허엔 외눈 거인 왕이 산다지.", "그 녀석이 날뛰기 시작한 건 최근 일이야."]],
			["무희", "princess", Vector2i(12, -4), ["레몬 마을에서 왔어요? 먼 길 왔네요.", "하늘을 보면 큰 나무 그림자가 보일 때가 있대요."]],
		],
		"critters": [["dog", Vector2i(3, 6)], ["chicken", Vector2i(-8, 8)]],
	},
	{
		"path": SNOW_TOWN, "title": "눈꽃 마을", "w": 36, "h": 32, "seed": 62, "wobble": 0.0,
		"ground": SNOWF_GROUND, "music": "res://assets/ninja/music/town2.ogg", "border": "snow",
		"roads": {"h": [0, 0], "v": [0, 32], "plaza": 3.6}, "torii": false, "tint": Color(0.95, 0.97, 1.0),
		"gaps": [
			{"side": "south", "to": "res://features/world/snow1.tscn", "spawn": "north", "label": "눈꽃 평원"},
			{"side": "north", "to": "res://features/world/snow2.tscn", "spawn": "south", "label": "얼어붙은 호수"},
		],
		"ponds": 1, "trees": 10, "big_trees": 0, "rocks": 0, "bushes": 0, "flowers": 0,
		"village": true, "spawns": [],
		"villagers": [
			["눈꽃 촌장", "eskimo", Vector2i(-3, -3), ["이 추위에 레몬 마을에서 왔다고? 대단하구먼.", "설산 정상의 대왕곰이 미쳐 날뛰는 바람에 몬스터가 내려오고 있지."]],
			["얼음 낚시꾼", "ninjaeskimo", Vector2i(6, 4), ["호수가 얼어서 물고기 대신 얼음 해골만 낚여…", "정상에 오르려면 협곡과 서리 숲을 지나야 해."]],
			["약초꾼", "oldman2", Vector2i(-8, 6), ["몬스터들이 다 하늘 쪽을 보며 울부짖더군.", "높은 곳에 뭔가 있는 게 틀림없어."]],
		],
		"critters": [["dog", Vector2i(4, 7)]],
	},
	{
		"path": TEMPLE_TOWN, "title": "물방울 마을", "w": 44, "h": 30, "seed": 63,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/town2.ogg", "border": "none", "temple": true, "rooms": 3,
		"tint": Color(0.82, 0.92, 1.0),
		"gaps": [
			{"side": "west", "at": 14, "to": "res://features/world/temple2.tscn", "spawn": "east", "label": "◀ 물길 회랑"},
			{"side": "east", "at": 14, "to": "res://features/world/temple3.tscn", "spawn": "west", "label": "수몰된 서고 ▶"},
		],
		"spawns": [],
		"room_npcs": [
			["신전지기", "monk2", ["물속에도 사람이 산다니 놀랐지? 우린 신전을 지키는 물방울 일족이야.", "크라켄님이 갑자기 사나워지셨어. 하늘에서 검은 물이 스며든 뒤로…"]],
			["물방울 상인", "villager5", ["해저 신전 깊은 곳엔 해신의 제단이 있어요.", "몬스터는 제단 쪽에서 계속 몰려와요."]],
			["늙은 학자", "oldman3", ["서고의 옛 기록에 따르면 대륙의 모든 생명은 하늘의 큰 나무에서 왔다네.", "몬스터도 마찬가지일지 모르지…"]],
		],
	},
	{
		"path": LAVA_TOWN, "title": "불꽃 대장간 마을", "w": 40, "h": 30, "seed": 64, "wobble": 0.0,
		"ground": HELL_GROUND, "music": "res://assets/ninja/music/village.ogg", "border": "rock",
		"roads": {"h": [0, 40], "v": [0, 0], "plaza": 3.6}, "torii": false, "tint": Color(1.0, 0.88, 0.78), "desert": true, "palms": 0, "bones": 6,
		"gaps": [
			{"side": "west", "to": "res://features/world/lava3.tscn", "spawn": "east", "label": "◀ 불꽃 협곡"},
			{"side": "east", "to": "res://features/world/lava4.tscn", "spawn": "west", "label": "마그마 호수 ▶"},
		],
		"ponds": 0, "trees": 0, "big_trees": 0, "rocks": 6, "bushes": 0, "flowers": 0,
		"village": true, "spawns": [],
		"villagers": [
			["대장장이", "master", Vector2i(-3, -3), ["용암 열기로 벼린 무기는 단단하지! 강화는 아끼지 말라고.", "화염룡이 날뛰는 통에 광산이 다 막혔어."]],
			["광부", "villager3", Vector2i(9, 4), ["땅 밑에서도 몬스터가 솟아나. 끝이 없어.", "지옥문 너머에 마왕이 있다지만… 그게 다일까?"]],
			["견습생", "boy", Vector2i(-10, 5), ["레몬 마을 사냥꾼의 아들(딸)이라고요? 소문 들었어요!"]],
		],
		"critters": [],
	},
	{
		"path": SKY_TOWN, "title": "구름 마을", "w": 40, "h": 32, "seed": 65, "wobble": 0.0,
		"ground": GRASS_GROUND, "music": "res://assets/ninja/music/town2.ogg", "border": "none", "isle": true,
		"roads": {"h": [0, 40], "v": [0, 0], "plaza": 3.6}, "torii": false, "tint": Color(1.0, 0.96, 1.0),
		"gaps": [
			{"side": "west", "to": "res://features/world/sky2.tscn", "spawn": "east", "label": "◀ 꽃구름 섬"},
			{"side": "east", "to": "res://features/world/sky3.tscn", "spawn": "west", "label": "천공의 탑 ▶"},
		],
		"ponds": 0, "trees": 6, "big_trees": 3, "big_tree_set": "blossom", "rocks": 0, "bushes": 6, "flowers": 60,
		"village": true, "spawns": [],
		"villagers": [
			["구름 장로", "oldman3", Vector2i(-3, -3), ["땅에서 여기까지 올라온 이는 처음이로구나.", "탑 꼭대기의 큰 나무가 시들고 있다. 그 뿌리에서 검은 열매가 맺혀…", "그 열매가 땅으로 떨어질 때마다 몬스터가 태어나지."]],
			["바람 소녀", "princess", Vector2i(10, 4), ["탑을 오르면 큰 나무에 닿을 수 있어요.", "나무가 아파하는 소리, 들리지 않아요?"]],
			["하늘 파수꾼", "knight", Vector2i(-11, 5), ["탑 안은 몬스터 소굴이다. 단단히 준비해라."]],
		],
		"critters": [["cat", Vector2i(4, 7)]],
	},
	{
		"path": "res://features/world/root_town.tscn", "title": "새싹 마을", "w": 40, "h": 30, "seed": 66, "wobble": 0.0,
		"ground": FOREST_GROUND, "music": "res://assets/ninja/music/town2.ogg", "border": "forest",
		"roads": {"h": [0, 40], "v": [0, 0], "plaza": 3.6}, "torii": false, "tint": Color(0.8, 0.95, 0.82),
		"gaps": [
			{"side": "west", "to": "res://features/world/root2.tscn", "spawn": "east", "label": "◀ 빛나는 뿌리 동굴"},
			{"side": "east", "to": "res://features/world/root3.tscn", "spawn": "west", "label": "썩은 물길 ▶"},
		],
		"ponds": 1, "trees": 10, "big_trees": 4, "rocks": 2, "bushes": 10, "flowers": 70,
		"village": true, "spawns": [],
		"villagers": [
			["새싹 장로", "monk", Vector2i(-3, -3), ["큰 나무의 뿌리 속에도 사람이 산다네. 우린 뿌리를 돌보는 새싹 일족이지.", "십 년 전, 검은 옷을 입은 사내가 뿌리 심장으로 내려갔어.", "그 뒤를 쫓아 사냥꾼 부부가 내려갔지… 돌아온 건 사내뿐이었다네."]],
			["약초꾼", "woman", Vector2i(10, 4), ["뿌리 물이 썩어서 약초가 다 시들었어요.", "벌레들이 뿌리를 갉아 먹고 점점 커지고 있어요."]],
			["로웰", "hunter", Vector2i(6, -4), ["…뿌리에 물을 주고 있다. 내가 망친 것을 내 손으로 되돌려야지.", "네 부모에게 못다 한 사과를, 나무에게라도 하고 있는 셈이다."]],
			["새싹 아이", "child", Vector2i(-11, 5), ["형아도 사냥꾼이야? 할아버지가 그러는데, 옛날에도 멋진 사냥꾼이 왔었대!"]],
		],
		"critters": [["chicken", Vector2i(4, 7)]],
	},
	{
		"path": "res://features/world/mist_town.tscn", "title": "안개 항구", "w": 40, "h": 30, "seed": 67, "wobble": 0.0,
		"ground": SAND_GROUND, "music": "res://assets/ninja/music/village.ogg", "border": "desert", "border_palms": 0.8,
		"roads": {"h": [0, 40], "v": [0, 0], "plaza": 3.6}, "torii": false, "desert": true, "palms": 12, "bones": 0, "tint": Color(0.86, 0.92, 1.0),
		"gaps": [
			{"side": "west", "to": "res://features/world/mist1.tscn", "spawn": "east", "label": "◀ 안개 해안"},
			{"side": "east", "to": "res://features/world/mist2.tscn", "spawn": "west", "label": "난파선 무덤 ▶"},
		],
		"ponds": 1, "trees": 0, "big_trees": 0, "rocks": 4, "bushes": 0, "flowers": 0,
		"village": true, "spawns": [],
		"villagers": [
			["항구 촌장", "oldman2", Vector2i(-3, -3), ["이 안개는 십 년 전, 탑이 별을 삼킨 날부터 걷히지 않는다네.", "가면 쓴 자들이 탑에서 내려와 씨앗을 배에 실어 보냈지.", "그 배가 닿은 곳마다 몬스터가 들끓었다고 들었네."]],
			["등대지기", "inspector", Vector2i(10, 4), ["등대 불이 꺼진 뒤로 유령 등불만 길을 떠돈다오.", "절벽 너머 탑에는 아무도 가까이 못 가지."]],
			["어부", "villager2", Vector2i(-11, 5), ["고기는 안 잡히고 붉은 눈 물고기만 올라와요.", "난파선 무덤엔 해골들이 걸어 다닌대요."]],
		],
		"critters": [["cat", Vector2i(4, 7)], ["dog", Vector2i(-6, 7)]],
	},
]

## 마을 사람: [이름, 그림, 위치(광장 중심 기준 칸), 대사]
const VILLAGERS := [
	["촌장", "oldman", Vector2i(-3, -3), ["요즘 밤마다 몬스터 울음소리에 잠을 못 이룬다네…", "어제는 마을 울타리까지 슬라임이 내려왔어.", "이대로 가다간 레몬 마을도 위험하네."]],
	["경비병", "knight", Vector2i(14, -3), ["동쪽 초원에서 몬스터가 계속 넘어온다!", "혼자 다 막기엔 역부족이야…", "숲 쪽이 특히 수상해."]],
	["상인", "noble", Vector2i(9, 3), ["몬스터 때문에 짐마차가 못 다녀서 큰일이에요.", "좋은 무기는 로비 상점에서 구해 봐요!"]],
	["농부", "villager", Vector2i(-14, 6), ["밭에 갓파 발자국이 찍혀 있었어…", "남쪽 늪에서 올라오는 게 분명해."]],
	["아가씨", "woman", Vector2i(13, 7), ["너희 부모님, 이 근방 최고의 사냥꾼이셨지.", "그 솜씨를 물려받았다면 분명 해낼 거야."]],
	["소년", "boy", Vector2i(-5, 9), ["형(언니)도 사냥 나가? 나도 데려가!", "폭포 계곡엔 도롱뇽이 산대!"]],
	["수도승", "monk", Vector2i(7, -9), ["하늘의 큰 나무가 앓고 있다는 옛 노래가 있지.", "몬스터가 끝없이 나오는 데엔 까닭이 있을 걸세."]],
	["사냥꾼", "hunter", Vector2i(-17, -6), ["네 아버지께 활 쏘는 법을 배웠었지.", "설산엔 거대한 곰이 산다더군."]],
	["할머니", "oldwoman", Vector2i(-9, 3), ["골드가 모이면 로비에서 레벨을 올리렴.", "보석을 모으면 새 동료를 부를 수 있단다."]],
	["꼬마", "child", Vector2i(4, 4), ["E 키나 스킬 버튼을 눌러 봐!", "스킬은 캐릭터마다 다 달라!"]],
	["스승", "master", Vector2i(3, -7), ["수련을 게을리하지 마라.", "구르는 동안엔 공격을 받지 않는다.", "공격 버튼을 꾹 누르면 힘을 모으는 아이도 있지."]],
]

var rng := RandomNumberGenerator.new()
var noise := FastNoiseLite.new()
var nature: Texture2D
var house_tex: Texture2D
var desert_tex: Texture2D
var tileset: TileSet
var cfg: Dictionary
var W := 64
var H := 40
var ground_set: Dictionary
var dirt: Dictionary[Vector2i, bool] = {}
var blocked: Dictionary[Vector2i, bool] = {}
var shapes: Dictionary[Vector2, RectangleShape2D] = {}
var world: Node2D
var counter := 0
var hub := Vector2i(-1, -1)  # 필드 가운데 공터(시작 자리)
var prop_tex: Texture2D  # 나무·바위 그림을 꺼내는 시트(보통 nature, 설산은 겨울 팩)
var gate_ts: TileSet  # 입구 맵 장식 층용 타일셋(맵마다 새로)
var water: Dictionary[Vector2i, bool] = {}
var dry: Dictionary[Vector2i, bool] = {}
var bridge: Dictionary[Vector2i, bool] = {}  # 강이 길을 지나는 칸(물처럼 칠하고 나무 다리를 얹는다, 걸을 수 있음)  # 물 한가운데지만 걸을 수 있는 칸(돌 단·다리). 타일은 물로 칠한다


func _initialize() -> void:
	nature = load("res://assets/ninja/tiles/nature.png")
	house_tex = load("res://assets/ninja/tiles/house.png")
	desert_tex = load("res://assets/ninja/tiles/desert.png")
	tileset = _make_tileset()
	ResourceSaver.save(tileset, "res://features/world/tileset.tres", ResourceSaver.FLAG_CHANGE_PATH)
	for m in MAPS + GATE_MAPS + MORE_MAPS + TOWN_MAPS:
		_build_map(m)
	quit()


func _build_map(m: Dictionary) -> void:
	cfg = m
	W = m["w"]
	H = m["h"]
	ground_set = m["ground"]
	rng.seed = m["seed"]
	noise.seed = m["seed"]
	noise.frequency = 0.05
	dirt.clear()
	blocked.clear()
	water.clear()
	dry.clear()
	bridge.clear()
	counter = 0
	prop_tex = load(WINTER_TEX) if m["border"] == "snow" else nature
	hub = Vector2i(-1, -1)

	world = Node2D.new()
	world.name = "World"
	world.set_script(load("res://features/world/world.gd"))
	world.set(&"map_title", m["title"])

	_add(world, (load("res://features/ui/hud.tscn") as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE))

	var ground := TileMapLayer.new()
	ground.name = "Ground"
	ground.tile_set = tileset
	_add(world, ground)

	var entities := Node2D.new()
	entities.name = "Entities"
	entities.y_sort_enabled = true
	_add(world, entities)

	var spawns := Node2D.new()
	spawns.name = "Spawns"
	_add(world, spawns)

	if m.get("temple", false):
		_build_temple(ground, entities, spawns)
		return
	# 길 → (마을 건물) → 땅 칠하기 → 연못 → 가장자리 → 이동문 → 자연물 → 몬스터 → 용사
	_make_roads()
	var start := _plaza_center()
	if m.get("village", false):
		_make_village(entities, start)
	if m.has("top_rows"):
		_block(Vector2i(0, 0), Vector2i(W, int(m["top_rows"]) + 1))
	_make_water(start)
	_paint_ground(ground)
	_water_bodies(entities)
	_make_bridges(ground)
	_make_scenery(ground)
	if m.get("waterfall", false):
		_make_waterfall(ground, entities)
	_make_border(entities)
	_make_portals(spawns)
	_make_barriers()
	_make_npcs(entities, cfg.get("npcs", []), Vector2i.ZERO)
	_scatter_props(entities, start)
	_spawn_bosses(entities)
	_spawn_enemies(entities, start)

	var player := (load("res://features/player/player.tscn") as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE) as Node2D
	player.position = Vector2(start * T) + Vector2(T, T / 2.0 + 2 * T)
	_add(entities, player)
	player.unique_name_in_owner = true

	_finish_map(m)


## 화면 색·음악을 붙이고 장면 파일로 저장
func _finish_map(m: Dictionary) -> void:
	if m.has("tint"):
		var mod := CanvasModulate.new()
		mod.name = "Gloom"
		mod.color = m["tint"]
		_add(world, mod)

	var music := AudioStreamPlayer.new()
	music.name = "Music"
	music.stream = load(m["music"])
	music.volume_db = -10.0
	_add(world, music)

	var packed := PackedScene.new()
	packed.pack(world)
	var err := ResourceSaver.save(packed, m["path"])
	print("%s 저장: %s / 물체 %d개" % [m["path"], error_string(err), counter])
	world.free()


func _make_tileset() -> TileSet:
	var ts := TileSet.new()
	ts.tile_size = Vector2i(T, T)
	var floor_src := TileSetAtlasSource.new()
	floor_src.texture = load("res://assets/ninja/tiles/floor.png")
	floor_src.texture_region_size = Vector2i(T, T)
	for g: Dictionary in [GRASS_GROUND, SAND_GROUND, FOREST_GROUND, SNOW_GROUND]:
		var shift: Vector2i = g["shift"]
		var tiles: Array[Vector2i] = [g["base"]]
		for d: Vector2i in g["detail"]:
			tiles.append(d)
		for v: Vector2i in DIRT_BY_MASK.values():
			tiles.append(v + shift)
		for v: Vector2i in DIRT_INNER.values():
			tiles.append(v + shift)
		for c in tiles:
			if not floor_src.has_tile(c):
				floor_src.create_tile(c)
	ts.add_source(floor_src, FLOOR)
	var water_src := TileSetAtlasSource.new()
	water_src.texture = load("res://assets/ninja/tiles/water.png")
	water_src.texture_region_size = Vector2i(T, T)
	for wshift: Vector2i in [Vector2i(0, -1), Vector2i(0, -7), Vector2i(13, -1), Vector2i(13, -7)]:
		for v: Vector2i in DIRT_BY_MASK.values():
			if not water_src.has_tile(v + wshift):
				water_src.create_tile(v + wshift)
		for v: Vector2i in DIRT_INNER.values():
			if not water_src.has_tile(v + wshift):
				water_src.create_tile(v + wshift)
	for v: Vector2i in [Vector2i(0, 12), Vector2i(1, 12), Vector2i(2, 12), Vector2i(0, 14), Vector2i(1, 14), Vector2i(2, 14), Vector2i(1, 13)]:
		water_src.create_tile(v)  # 나무 다리
	ts.add_source(water_src, WATER)
	var relief := TileSetAtlasSource.new()
	relief.texture = load("res://assets/ninja/tiles/TilesetRelief.png")
	relief.texture_region_size = Vector2i(T, T)
	for y in 3:
		for x in range(1, 7):
			relief.create_tile(Vector2i(x, y))
	ts.add_source(relief, RELIEF)
	var snowb := TileSetAtlasSource.new()
	snowb.texture = load("res://assets/ninja/tiles/TilesetFloorB.png")
	snowb.texture_region_size = Vector2i(T, T)
	for v: Vector2i in DIRT_BY_MASK.values() + DIRT_INNER.values():
		if not snowb.has_tile(v + Vector2i(0, -7)):
			snowb.create_tile(v + Vector2i(0, -7))
	ts.add_source(snowb, SNOWB)
	# 다시 칠한 바닥(지옥·동굴)과 용암: 모래 칸과 같은 자리
	for pair: Array in [[HELLF, "res://assets/ninja/tiles/floor_hell.png"], [CAVEF, "res://assets/ninja/tiles/floor_cave.png"]]:
		var fs := TileSetAtlasSource.new()
		fs.texture = load(pair[1])
		fs.texture_region_size = Vector2i(T, T)
		var tiles: Array[Vector2i] = [SAND_GROUND["base"]]
		for d: Vector2i in SAND_GROUND["detail"]:
			tiles.append(d)
		for v: Vector2i in DIRT_BY_MASK.values() + DIRT_INNER.values():
			tiles.append(v + Vector2i(0, -7))
		for c in tiles:
			if not fs.has_tile(c):
				fs.create_tile(c)
		ts.add_source(fs, pair[0])
	var lava := TileSetAtlasSource.new()
	lava.texture = load("res://assets/ninja/tiles/water_lava.png")
	lava.texture_region_size = Vector2i(T, T)
	for v: Vector2i in DIRT_BY_MASK.values() + DIRT_INNER.values():
		if not lava.has_tile(v + Vector2i(0, -7)):
			lava.create_tile(v + Vector2i(0, -7))
	ts.add_source(lava, LAVA)
	var wc := TileSetAtlasSource.new()
	wc.texture = load("res://assets/ninja/tiles/water_clear.png")
	wc.texture_region_size = Vector2i(T, T)
	for wshift: Vector2i in [Vector2i(0, -1), Vector2i(13, -1)]:
		for v: Vector2i in DIRT_BY_MASK.values() + DIRT_INNER.values():
			if not wc.has_tile(v + wshift):
				wc.create_tile(v + wshift)
	ts.add_source(wc, WATERC)
	return ts


# ── 길 ──

## 마을: 두 칸 폭 큰길(가로·세로)과 광장. 필드: 구불구불한 오솔길과 공터(_make_paths).
func _make_roads() -> void:
	if not cfg.has("roads"):
		_make_paths()
		return
	var roads: Dictionary = cfg["roads"]
	var hx: Array = roads["h"]
	for x in range(maxi(hx[0], 0), mini(hx[1], W)):
		var y := _road_y(x)
		dirt[Vector2i(x, y)] = true
		dirt[Vector2i(x, y + 1)] = true
	var vy: Array = roads["v"]
	for y in range(vy[0], mini(vy[1], H)):
		var x := _road_x(y)
		dirt[Vector2i(x, y)] = true
		dirt[Vector2i(x + 1, y)] = true
	var center := Vector2(_plaza_center()) + Vector2.ONE * 0.5
	var pr: float = roads["plaza"]
	for y in range(-5, 6):
		for x in range(-5, 6):
			if Vector2(x, y).length() < pr:
				dirt[Vector2i(center) + Vector2i(x, y)] = true


## 필드: 가운데 공터를 정하고, 이동문마다 공터까지 구불구불한 길을 낸다. 작은 공터 몇 개를 더 이어 붙인다.
func _make_paths() -> void:
	hub = Vector2i(W / 2 + rng.randi_range(-5, 5), H / 2 + rng.randi_range(-4, 4))
	hub = cfg.get("hub", hub)
	if cfg.get("straight_path", false):
		var goal: Vector2i = cfg["path_to"]
		for y in range(goal.y, H):
			for x in range(goal.x - 1, goal.x + 3):  # 가장자리 칸은 눈이 반쯤 덮어 실제 길은 두 칸쯤
				dirt[Vector2i(x, y)] = true
		for y in range(goal.y - 1, goal.y + 3):
			for x in range(goal.x - 3, goal.x + 5):
				dirt[Vector2i(x, y)] = true
		return
	_blob(Vector2(hub), 3.6)
	if cfg.has("pier"):
		var pr: Rect2i = cfg["pier"]
		_carve(Vector2(hub), Vector2(pr.end.x, pr.position.y), 1.2)
		for y in pr.size.y:
			for x in pr.size.x:
				dirt[pr.position + Vector2i(x, y)] = true
	if cfg.has("path_to"):
		var goal: Vector2i = cfg["path_to"]
		_carve(Vector2(hub), Vector2(goal), 1.5)
		_blob(Vector2(goal) + Vector2(0.5, 1), 3.0)
	for g: Dictionary in cfg["gaps"]:
		var a := _entry(g)
		var inward := _inward(g["side"])
		_carve(a, a + inward * 5.0, 0.0)  # 문 앞은 곧게
		_carve(a + inward * 5.0, Vector2(hub), 2.4)
	var nodes: Array[Vector2] = [Vector2(hub)]
	for i in int(cfg.get("clearings", 2)):
		var p := Vector2.ZERO
		for tries in 80:
			p = Vector2(rng.randi_range(BORDER + 6, W - BORDER - 7), rng.randi_range(BORDER + 5, H - BORDER - 6))
			if nodes.all(func(n: Vector2) -> bool: return n.distance_to(p) > 13.0):
				break
		_blob(p, rng.randf_range(2.2, 3.2))
		var near := nodes[0]
		for n in nodes:
			if n.distance_to(p) < near.distance_to(p):
				near = n
		_carve(p, near, 2.0)
		nodes.append(p)


## 이동문이 붙은 가장자리 칸
func _entry(g: Dictionary) -> Vector2:
	var at := float(_gap_at(g))
	match String(g["side"]):
		"west":
			return Vector2(0, at)
		"east":
			return Vector2(W - 2, at)
		"south":
			return Vector2(at, H - 2)
		_:
			return Vector2(at, 0)


func _inward(side: String) -> Vector2:
	match side:
		"west":
			return Vector2.RIGHT
		"east":
			return Vector2.LEFT
		"south":
			return Vector2.UP
		_:
			return Vector2.DOWN


## a에서 b까지 두 칸 폭 흙길을 판다. wobble이 크면 더 구불구불하다.
func _carve(a: Vector2, b: Vector2, wobble: float) -> void:
	var p := a
	var t := rng.randf() * 500.0
	for guard in 3000:
		if p.distance_to(b) <= 0.8:
			break
		var d := (b - p).normalized()
		var w := noise.get_noise_1d(t) * wobble * minf(1.0, p.distance_to(b) / 6.0)
		t += 1.4
		p += (d + d.orthogonal() * w).normalized() * 0.5
		p = p.clamp(Vector2.ZERO, Vector2(W - 2, H - 2))
		var c := Vector2i(p.round())
		for o: Vector2i in [Vector2i(0, 0), Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)]:
			dirt[c + o] = true


## 둥근 공터
func _blob(c: Vector2, r: float) -> void:
	for y in range(-5, 6):
		for x in range(-5, 6):
			var q := Vector2(x, y)
			if q.length() < r + noise.get_noise_2d(c.x + x, c.y + y) * 0.8:
				var cell := Vector2i(c) + Vector2i(x, y)
				if cell.x >= 1 and cell.y >= 1 and cell.x < W - 1 and cell.y < H - 1:
					dirt[cell] = true


func _plaza_center() -> Vector2i:
	if hub.x >= 0:
		return hub
	var cy := _road_y(W / 2)
	return Vector2i(_road_x(cy), cy)


func _road_y(x: int) -> int:
	return H / 2 - 1 + int(round(noise.get_noise_1d(x * 0.7) * float(cfg["wobble"])))


func _road_x(y: int) -> int:
	return W / 2 - 1 + int(round(noise.get_noise_1d(y * 0.7 + 300.0) * float(cfg["wobble"])))


func _paint_ground(ground: TileMapLayer) -> void:
	var details: Array = ground_set["detail"]
	# 풀·늪 물은 물가 땅을 지운 타일을 땅 위 층에 겹친다(물가 둘레가 땅 색과 똑같이 이어진다)
	var wshift: Vector2i = ground_set["water"]
	var overlay: TileMapLayer = null
	if wshift.y == -1 and ground_set.get("water_src", WATER) == WATER:
		overlay = TileMapLayer.new()
		overlay.name = "WaterLayer"
		overlay.tile_set = tileset
		_add(world, overlay)
		world.move_child(overlay, ground.get_index() + 1)
	var wet: Dictionary = water.duplicate()
	for c: Vector2i in dry:
		if c.x < int(cfg.get("sea_west", 0)):
			wet[c] = true
	for c: Vector2i in bridge:
		wet[c] = true
	for y in H:
		for x in W:
			var c := Vector2i(x, y)
			var fsrc: int = ground_set.get("src", FLOOR)
			if wet.has(c) and overlay:
				ground.set_cell(c, fsrc, ground_set["base"])
				overlay.set_cell(c, WATERC, _auto_tile(c, wet, wshift))
			elif wet.has(c):
				ground.set_cell(c, ground_set.get("water_src", WATER), _auto_tile(c, wet, ground_set["water"]))
			elif dirt.has(c):
				ground.set_cell(c, fsrc, _dirt_tile(c))
			elif rng.randf() < 0.14:
				ground.set_cell(c, fsrc, details[rng.randi() % details.size()])
			else:
				ground.set_cell(c, fsrc, ground_set["base"])


func _dirt_tile(c: Vector2i) -> Vector2i:
	return _auto_tile(c, dirt, ground_set["shift"])


## 자동 타일: 상하좌우 이웃이 같은 종류인지(맵 밖은 같은 것으로) 보고 칸을 고른다. 흙길·물가 공용.
func _auto_tile(c: Vector2i, cells: Dictionary, shift: Vector2i) -> Vector2i:
	var mask := 0
	if cells.has(c + Vector2i.UP) or c.y == 0:
		mask |= 1
	if cells.has(c + Vector2i.RIGHT) or c.x == W - 1:
		mask |= 2
	if cells.has(c + Vector2i.DOWN) or c.y == H - 1:
		mask |= 4
	if cells.has(c + Vector2i.LEFT) or c.x == 0:
		mask |= 8
	if mask == 15:
		for d: Vector2i in DIRT_INNER:
			var n := c + d
			if not cells.has(n) and n.x >= 0 and n.y >= 0 and n.x < W and n.y < H:
				return DIRT_INNER[d] + shift
	return DIRT_BY_MASK[mask] + shift


# ── 마을 ──

## 광장 위쪽에 집 4채(문에서 길까지 오솔길), 위쪽 끝 신사 문, 광장 옆 우물, 마을 사람, 동물.
func _make_village(parent: Node, center: Vector2i) -> void:
	var road_y := center.y
	var lots := [Vector2i(center.x - 14, road_y - 8), Vector2i(center.x - 8, road_y - 8), Vector2i(center.x + 5, road_y - 8), Vector2i(center.x + 11, road_y - 8),
		Vector2i(center.x - 13, road_y + 5), Vector2i(center.x + 9, road_y + 5)]
	for i in lots.size():
		var c: Vector2i = lots[i]
		var region := HOUSES[i % HOUSES.size()]
		var base := Vector2(c * T) + Vector2(region.size.x * T / 2.0, region.size.y * T - 2.0)
		_sprite_prop(parent, house_tex, region, base, Vector2(region.size.x * T - 6, 2 * T - 4), "House")
		_block(c - Vector2i(1, 1), region.size + Vector2i(2, 2))
		# 위쪽 집은 문 앞에서 큰길까지 오솔길
		if c.y < road_y:
			for y in range(c.y + region.size.y, road_y):
				dirt[Vector2i(c.x + 1, y)] = true
	# 신사 문(세로 길 위쪽 끝)
	if cfg.get("torii", true):
		var tx := _road_x(5)
		_sprite_prop(parent, house_tex, TORII, Vector2((tx + 1) * T, 6 * T + T - 2.0), Vector2.ZERO, "Torii")
		_block(Vector2i(tx - 1, 4), Vector2i(4, 3))
	# 우물
	var well_c := center + Vector2i(4, -4)
	_sprite_prop(parent, desert_tex, WELL, Vector2(well_c * T) + Vector2(T, 2 * T - 2.0), Vector2(26, 12), "Well")
	_block(well_c - Vector2i.ONE, Vector2i(4, 4))
	# 마을 사람
	_make_npcs(parent, cfg.get("villagers", VILLAGERS), center)
	# 동물
	var critter_script := load("res://features/npc/critter.gd") as Script
	var critters: Array = cfg.get("critters", [["cat", Vector2i(-6, 3)], ["cat", Vector2i(8, -3)], ["chicken", Vector2i(-11, 9)], ["chicken", Vector2i(-10, 10)], ["chicken", Vector2i(12, 9)],
		["dog", Vector2i(2, 6)], ["cow", Vector2i(-15, 9)], ["pig", Vector2i(-12, 11)], ["horse", Vector2i(15, -6)]])
	for k: Array in critters:
		var cr := Node2D.new()
		cr.set_script(critter_script)
		cr.name = "Critter%d" % counter
		counter += 1
		var cell: Vector2i = center + k[1]
		cr.position = Vector2(cell * T) + Vector2(T / 2.0, T - 2.0)
		cr.set(&"sheet", load("res://assets/ninja/actor/npc/%s.png" % k[0]))
		cr.set(&"speed", 16.0 if k[0] == "chicken" else 10.0)
		_add(parent, cr)


## 사람: [이름, 그림, 칸(origin 기준), 대사]
func _make_npcs(parent: Node, list: Array, origin: Vector2i) -> void:
	var npc_script := load("res://features/npc/npc.gd") as Script
	for v: Array in list:
		var npc := StaticBody2D.new()
		npc.set_script(npc_script)
		npc.name = "Npc%s" % String(v[1]).capitalize()
		var cell: Vector2i = origin + v[2]
		npc.position = Vector2(cell * T) + Vector2(T / 2.0, T - 2.0)
		npc.set(&"display_name", v[0])
		npc.set(&"sheet", load("res://assets/ninja/actor/npc/%s.png" % v[1]))
		npc.set(&"lines", PackedStringArray(v[3]))
		_add(parent, npc)
		_block(cell - Vector2i.ONE, Vector2i(3, 3))


## 입구 맵 배경 그림(땅 바로 위, 사람·나무보다 아래)과 눈
func _make_scenery(ground: Node) -> void:
	var kind: String = cfg.get("scenery", "")
	if kind == "":
		return
	gate_ts = TileSet.new()
	gate_ts.tile_size = Vector2i(T, T)
	for path in [WINTER_TEX, TEMPLE_TEX, "res://assets/ninja/tiles/water.png"]:
		var src := TileSetAtlasSource.new()
		src.texture = load(path)
		src.texture_region_size = Vector2i(T, T)
		gate_ts.add_source(src)
	# 땅 위 장식 층
	var deco := TileMapLayer.new()
	deco.name = "Deco"
	deco.tile_set = gate_ts
	_add(world, deco)
	world.move_child(deco, _above_ground(ground))
	var ent := world.get_node(^"Entities")
	var fx := Node2D.new()
	fx.name = "Scenery"
	if kind == "temple":
		_make_temple(deco, ent, fx)
	else:
		_make_snow_mountain(deco, ent, fx)
	_add(world, fx)


## 강이 길을 지나는 곳에 나무 다리(Ninja 널빤지). 길 방향(가로·세로)에 맞춰 난간 쪽을 고른다
func _make_bridges(ground: Node) -> void:
	if bridge.is_empty():
		return
	var layer := TileMapLayer.new()
	layer.name = "Bridges"
	layer.tile_set = tileset
	_add(world, layer)
	world.move_child(layer, _above_ground(ground))
	for c: Vector2i in bridge:
		var horiz := bridge.has(c + Vector2i.LEFT) or bridge.has(c + Vector2i.RIGHT)
		var row := 13
		if horiz:
			row = 12 if not bridge.has(c + Vector2i.UP) else (14 if not bridge.has(c + Vector2i.DOWN) else 13)
		layer.set_cell(c, WATER, Vector2i(1, row))


## 땅(과 물 겹침 층) 바로 위 자리: 장식 층이 물에 덮이지 않게
func _above_ground(ground: Node) -> int:
	var wl := world.get_node_or_null(^"WaterLayer")
	return (wl.get_index() if wl else ground.get_index()) + 1


## 장식 층에 칸 찍기(타일이 없으면 만든다). src: 0 겨울 팩, 1 물의 신전 팩, 2 Ninja 물
func _gset(deco: TileMapLayer, c: Vector2i, src: int, atlas: Vector2i) -> void:
	var s := gate_ts.get_source(src) as TileSetAtlasSource
	if not s.has_tile(atlas):
		s.create_tile(atlas)
	deco.set_cell(c, src, atlas)


## 잊혀진 나루터: 물 위 신전 섬(무료 팩 Myth of Pixel - Water Temple). 무늬 바닥·뒤쪽 신전 벽과 봉인된 문·
## 기둥·항아리를 든 뱀 석상(물 쏟는 애니메이션)·항아리, 섬까지 나무 다리.
func _make_temple(deco: TileMapLayer, ent: Node, fx: Node2D) -> void:
	var temple_tex := load(TEMPLE_TEX) as Texture2D
	var isl: Rect2i = cfg["island"]
	# 바닥: 무늬 단 하나를 섬 크기로 늘린다(바깥 짙은 테 → 밝은 무늬 테 → 가운데 돌바닥)
	var ring := func(i: int, n: int) -> int:
		return 0 if i == 0 else (1 if i == 1 else (3 if i == n - 2 else (4 if i == n - 1 else 2)))
	for y in isl.size.y:
		for x in isl.size.x:
			_gset(deco, isl.position + Vector2i(x, y), 1, Vector2i(ring.call(x, isl.size.x), 1 + ring.call(y, isl.size.y)))
	# 뒤쪽 신전 벽(2줄) + 가운데 봉인된 문
	var door_x := isl.position.x + isl.size.x / 2 - 1
	for x in isl.size.x:
		for y in 2:
			_gset(deco, isl.position + Vector2i(x, y), 1, Vector2i(12 + x % 2, 1 + y))
	var wall := StaticBody2D.new()
	wall.name = "TempleWall"
	wall.collision_mask = 0
	var cs := CollisionShape2D.new()
	cs.shape = _rect_shape(Vector2(isl.size.x * T, 2 * T - 4))
	cs.position = Vector2(isl.position * T) + Vector2(isl.size.x * T / 2.0, T - 2)
	wall.add_child(cs)
	_add(world, wall)
	var door := Sprite2D.new()
	door.name = "SealedDoor"
	door.texture = load("res://assets/vendor/watertemple/anim/Door_with_key.png")
	door.region_enabled = true
	door.region_rect = Rect2(0, 0, 32, 32)
	door.centered = false
	door.position = Vector2(door_x * T, isl.position.y * T)
	_add(world, door)
	world.move_child(door, deco.get_index() + 1)
	# 기둥(1x3)·항아리
	for cx in [isl.position.x + 1, isl.end.x - 2]:
		_sprite_prop(ent, temple_tex, Rect2i(2, 19, 1, 3), Vector2((cx + 0.5) * T, (isl.position.y + 5) * T), Vector2(12, 8), "Pillar")
	for c: Vector2i in [Vector2i(isl.position.x + 1, isl.end.y - 1), Vector2i(isl.end.x - 2, isl.end.y - 1)]:
		_sprite_prop(ent, temple_tex, Rect2i(c.x % 2, 20, 1, 1), Vector2((c.x + 0.5) * T, (c.y + 1) * T), Vector2.ZERO, "Urn")
	# 물 쏟는 뱀 석상 둘(왼쪽은 뒤집어 문을 보게)
	var frames := SpriteFrames.new()
	frames.set_animation_speed(&"default", 8.0)
	var sheet := load("res://assets/vendor/watertemple/anim/statue_with_jar_and_waterfall_loop_.png") as Texture2D
	for i in 11:
		var at := AtlasTexture.new()
		at.atlas = sheet
		at.region = Rect2(i * 64, 144, 64, 48)
		frames.add_frame(&"default", at)
	for side in [-1, 1]:
		var st := AnimatedSprite2D.new()
		st.name = "Statue%s" % ("L" if side < 0 else "R")
		st.sprite_frames = frames
		st.autoplay = "default"
		st.flip_h = side > 0
		st.position = Vector2((door_x + 1) * T + side * 46, (isl.position.y + 3.5) * T)
		_add(ent, st)
	# 나무 다리(Ninja 널빤지)
	var pr: Rect2i = cfg["pier"]
	for x in pr.size.x:
		var col := 0 if x == 0 else (2 if x == pr.size.x - 1 else 1)
		_gset(deco, pr.position + Vector2i(x, 0), 2, Vector2i(col, 12))
		_gset(deco, pr.position + Vector2i(x, 1), 2, Vector2i(col, 14))
	# 물 위 연잎·바위
	var water_tex := load("res://assets/ninja/tiles/water.png") as Texture2D
	for c: Vector2i in [Vector2i(17, 4), Vector2i(15, 17), Vector2i(5, 19), Vector2i(18, 22), Vector2i(1, 3)]:
		_sprite_prop(ent, water_tex, Rect2i(11, 3, 1, 1), Vector2((c.x + 0.5) * T, (c.y + 1) * T), Vector2.ZERO, "Lily")
	for c: Vector2i in [Vector2i(1, 9), Vector2i(16, 7), Vector2i(2, 21), Vector2i(17, 19)]:
		_sprite_prop(ent, water_tex, Rect2i(12, 0, 1, 1), Vector2((c.x + 0.5) * T, (c.y + 1) * T), Vector2.ZERO, "WaterRock")
	fx.set_script(load("res://features/world/scenery_temple.gd"))
	fx.set(&"arch", Vector2((door_x + 1) * T, (isl.position.y + 1.2) * T))


## 설산 입구(무료 겨울 팩): 눈밭 + 흙길, 위쪽은 세 층 눈 절벽(가운데로 갈수록 높게), 절벽 아래 동굴(Ninja 동굴을 겨울색으로 칠함)
func _make_snow_mountain(deco: TileMapLayer, ent: Node, fx: Node2D) -> void:
	var winter := load(WINTER_TEX) as Texture2D
	var top := int(cfg["top_rows"])
	# 눈밭 + 흙길(흙길은 3x3 흙 자국 칸을 이웃에 따라 고른다)
	for y in H:
		for x in W:
			var c := Vector2i(x, y)
			if dirt.has(c) and y >= top:
				var col := 6 if not dirt.has(c + Vector2i.LEFT) else (8 if not dirt.has(c + Vector2i.RIGHT) else 7)
				var row := 0 if not dirt.has(c + Vector2i.UP) else (2 if not dirt.has(c + Vector2i.DOWN) else 1)
				_gset(deco, c, 0, Vector2i(col, row))
			else:
				_gset(deco, c, 0, Vector2i(12, 1))
	# 눈 절벽 세 층: [윗면 칸 범위, 마지막 줄 = 절벽 면, 그 아래 그림자]
	for t: Rect2i in [Rect2i(0, 0, W, top - 1), Rect2i(6, 0, W - 12, 4), Rect2i(12, 0, W - 24, 2)]:
		for y in t.size.y + 1:
			for x in t.size.x:
				var ax := 12
				if x == 0 and t.position.x > 0:
					ax = 11
				elif x == t.size.x - 1 and t.end.x < W:
					ax = 13
				var row := 1 if y < t.size.y - 1 else (2 if y == t.size.y - 1 else 3)
				_gset(deco, t.position + Vector2i(x, y), 0, Vector2i(ax, row))
	# 동굴(가운데 아래) + 표지판 글씨는 fx가 쓴다
	var goal: Vector2i = cfg["path_to"]
	var cave_x := (goal.x + 1) * T
	_sprite_prop(ent, load("res://assets/vendor/winter/cave_snow.png"), Rect2i(0, 0, 3, 3), Vector2(cave_x, top * T + 4), Vector2.ZERO, "Cave")
	# 절벽 위 전나무, 동굴 옆 눈사람·표지판, 얼음 못
	for c: Vector2i in [Vector2i(2, 4), Vector2i(29, 4), Vector2i(8, 2), Vector2i(23, 2), Vector2i(14, 0), Vector2i(4, 1), Vector2i(27, 1)]:
		_sprite_prop(ent, winter, SNOW_TREES[(c.x / 3) % 2], Vector2((c.x + 1.5) * T, (c.y + 3) * T - 2), Vector2.ZERO, "Pine")
	_sprite_prop(ent, winter, Rect2i(2, 0, 1, 2), Vector2((goal.x - 3 + 0.5) * T, (top + 3) * T), Vector2.ZERO, "Snowman")
	_sprite_prop(ent, winter, Rect2i(0, 2, 1, 1), Vector2((goal.x + 4 + 0.5) * T, (top + 3) * T), Vector2.ZERO, "Sign")
	var pcols := [6, 7, 7, 7, 8]
	for y in 3:
		for x in pcols.size():
			_gset(deco, Vector2i(4 + x, 20 + y), 0, Vector2i(pcols[x], 3 + y))
	_block(Vector2i(3, 19), Vector2i(7, 5))
	var pond := StaticBody2D.new()
	pond.name = "IcePond"
	pond.collision_mask = 0
	var cs := CollisionShape2D.new()
	cs.shape = _rect_shape(Vector2(4 * T, 2 * T))
	cs.position = Vector2(6.5 * T, 21.5 * T)
	pond.add_child(cs)
	_add(world, pond)
	fx.set_script(load("res://features/world/scenery_mountain.gd"))
	fx.set(&"cave", Vector2(cave_x, top * T - 12))
	var snow := Node2D.new()
	snow.name = "Snowfall"
	snow.set_script(load("res://features/world/snowfall.gd"))
	snow.set(&"area", Rect2(0, 0, W * T, H * T))
	_add(world, snow)


## 폭포 계곡: 위쪽 바위벽(TilesetRelief 벽면) + 가운데 세 줄기 폭포(Ninja 움직이는 폭포) + 아래 물웅덩이
func _make_waterfall(ground: Node, ent: Node) -> void:
	var top := int(cfg["top_rows"])
	var cliff := TileMapLayer.new()
	cliff.name = "Cliff"
	cliff.tile_set = tileset
	_add(world, cliff)
	world.move_child(cliff, _above_ground(ground))
	for y in top:
		for x in W:
			cliff.set_cell(Vector2i(x, y), RELIEF, Vector2i(5, 2 if y == top - 1 else 1))
	var cx := W / 2 - 1
	var parts := {"Top": [0, 5], "Middle": [1, 5], "Bottom": [top - 1, 3]}
	for x in range(cx - 1, cx + 2):
		for y in top:
			var key := "Top" if y == 0 else ("Bottom" if y == top - 1 else "Middle")
			var frames := SpriteFrames.new()
			frames.set_animation_speed(&"default", 8.0)
			var sheet := load("res://assets/ninja/anim/waterfall_%s.png" % key.to_lower()) as Texture2D
			for f in int(parts[key][1]):
				var at := AtlasTexture.new()
				at.atlas = sheet
				at.region = Rect2(f * 16, 0, 16, 16)
				frames.add_frame(&"default", at)
			var a := AnimatedSprite2D.new()
			a.name = "Fall%d_%d" % [x, y]
			a.sprite_frames = frames
			a.autoplay = "default"
			a.centered = false
			a.position = Vector2(x * T, y * T)
			_add(world, a)
			world.move_child(a, cliff.get_index() + 1)
	_block(Vector2i(0, 0), Vector2i(W, top + 1))
	var wall := StaticBody2D.new()
	wall.name = "CliffWall"
	wall.collision_mask = 0
	var cs := CollisionShape2D.new()
	cs.shape = _rect_shape(Vector2(W * T, top * T - 6))
	cs.position = Vector2(W * T / 2.0, (top * T - 6) / 2.0)
	wall.add_child(cs)
	_add(world, wall)


## 해저 신전 맵(무료 팩 Myth of Pixel - Water Temple): 방 여러 개를 회랑으로 잇는다.
## 방 바닥은 무늬 단(테두리 → 무늬 → 돌바닥), 둘레는 신전 벽, 나머지는 깊은 물(못 감). 방마다 기둥·항아리·물 쏟는 석상.
func _build_temple(ground: TileMapLayer, ent: Node, spawns: Node) -> void:
	gate_ts = TileSet.new()
	gate_ts.tile_size = Vector2i(T, T)
	for path in [WINTER_TEX, TEMPLE_TEX, "res://assets/ninja/tiles/water.png"]:
		var src := TileSetAtlasSource.new()
		src.texture = load(path)
		src.texture_region_size = Vector2i(T, T)
		gate_ts.add_source(src)
	var deco := TileMapLayer.new()
	deco.name = "Deco"
	deco.tile_set = gate_ts
	_add(world, deco)
	world.move_child(deco, ground.get_index() + 1)
	var temple_tex := load(TEMPLE_TEX) as Texture2D
	for y in H:  # 땅 층도 채워 둔다(카메라 범위·지도 그림이 땅 층 크기를 쓴다)
		for x in W:
			ground.set_cell(Vector2i(x, y), FLOOR, GRASS_GROUND["base"])
	var gy := int(cfg["gaps"][0]["at"])
	# 방 자리: 왼쪽에서 오른쪽으로, 높이는 들쭉날쭉
	var n := int(cfg.get("rooms", 3))
	var rooms: Array[Rect2i] = []
	var span := (W - 8) / n
	for i in n:
		var rw := rng.randi_range(span - 6, span - 3)
		var rh := rng.randi_range(9, 14)
		var rx := 4 + i * span + rng.randi_range(0, span - rw - 2)
		var ry := clampi(gy - rh / 2 + rng.randi_range(-4, 4), 3, H - rh - 3)
		rooms.append(Rect2i(rx, ry, rw, rh))
	var floor_cells: Dictionary[Vector2i, bool] = {}
	var ring := func(i: int, nn: int) -> int:
		return 0 if i == 0 else (1 if i == 1 else (3 if i == nn - 2 else (4 if i == nn - 1 else 2)))
	for r in rooms:
		for y in r.size.y:
			for x in r.size.x:
				var c := r.position + Vector2i(x, y)
				floor_cells[c] = true
				_gset(deco, c, 1, Vector2i(ring.call(x, r.size.x), 1 + ring.call(y, r.size.y)))
	# 회랑(세 칸 폭): 서쪽 문 → 첫 방, 방끼리, 마지막 방 → 동쪽 문
	var links: Array = []
	links.append([Vector2i(0, gy), rooms[0].get_center()])
	for i in n - 1:
		links.append([rooms[i].get_center(), rooms[i + 1].get_center()])
	if cfg["gaps"].size() > 1:
		links.append([rooms[n - 1].get_center(), Vector2i(W - 1, gy)])
	for l: Array in links:
		var a: Vector2i = l[0]
		var b: Vector2i = l[1]
		var mid := (a.x + b.x) / 2
		for seg: Array in [[a, Vector2i(mid, a.y)], [Vector2i(mid, a.y), Vector2i(mid, b.y)], [Vector2i(mid, b.y), b]]:
			var p0: Vector2i = seg[0]
			var p1: Vector2i = seg[1]
			for x in range(mini(p0.x, p1.x) - 1, maxi(p0.x, p1.x) + 2):
				for y in range(mini(p0.y, p1.y) - 1, maxi(p0.y, p1.y) + 2):
					var c := Vector2i(clampi(x, 0, W - 1), clampi(y, 0, H - 1))
					if not floor_cells.has(c):
						floor_cells[c] = true
						_gset(deco, c, 1, Vector2i(2, 3))
	# 벽(바닥 둘레 두 칸)과 깊은 물(나머지)
	var solid: Dictionary[Vector2i, bool] = {}
	for y in H:
		for x in W:
			var c := Vector2i(x, y)
			if floor_cells.has(c):
				continue
			solid[c] = true
			blocked[c] = true
			var near := false
			for d in [Vector2i(0, 1), Vector2i(0, 2), Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, -1), Vector2i(1, 1), Vector2i(-1, 1)]:
				if floor_cells.has(c + d):
					near = true
			if near:
				_gset(deco, c, 1, Vector2i(12 + x % 2, 1 + y % 2))
			else:
				_gset(deco, c, 1, Vector2i(30, 4))
	_solid_body(solid, "TempleWalls")
	# 방 꾸미기
	var frames := SpriteFrames.new()
	frames.set_animation_speed(&"default", 8.0)
	var sheet := load("res://assets/vendor/watertemple/anim/statue_with_jar_and_waterfall_loop_.png") as Texture2D
	for i in 11:
		var at := AtlasTexture.new()
		at.atlas = sheet
		at.region = Rect2(i * 64, 144, 64, 48)
		frames.add_frame(&"default", at)
	for r in rooms:
		for cx in [r.position.x + 2, r.end.x - 3]:
			for cy in [r.position.y + 2, r.end.y - 2]:
				if not blocked.has(Vector2i(cx, cy)):
					_sprite_prop(ent, temple_tex, Rect2i(2, 19, 1, 3), Vector2((cx + 0.5) * T, (cy + 1) * T), Vector2(12, 8), "Pillar")
					_block(Vector2i(cx - 1, cy - 2), Vector2i(3, 4))
		if rng.randf() < 0.7:
			var st := AnimatedSprite2D.new()
			st.name = "Statue%d" % counter
			counter += 1
			st.sprite_frames = frames
			st.autoplay = "default"
			st.flip_h = rng.randf() < 0.5
			st.position = Vector2(r.get_center().x * T, (r.position.y + 1.6) * T)
			_add(ent, st)
		for k in 2:
			var c := Vector2i(rng.randi_range(r.position.x + 1, r.end.x - 2), rng.randi_range(r.position.y + 1, r.end.y - 2))
			if not blocked.has(c):
				_sprite_prop(ent, temple_tex, Rect2i(k % 2, 20, 1, 1), Vector2((c.x + 0.5) * T, (c.y + 1) * T), Vector2.ZERO, "Urn")
				_block(c, Vector2i.ONE)
	var rn: Array = cfg.get("room_npcs", [])
	for k in rn.size():
		var v: Array = rn[k]
		var c := rooms[k % n].get_center() + Vector2i(0, 2 + k / n * 2)
		_make_npcs(ent, [[v[0], v[1], c, v[2]]], Vector2i.ZERO)
	hub = rooms[0].get_center()
	_make_portals(spawns)
	_make_npcs(ent, cfg.get("npcs", []), Vector2i.ZERO)
	_spawn_bosses(ent)
	_spawn_enemies(ent, hub)
	var player := (load("res://features/player/player.tscn") as PackedScene).instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE) as Node2D
	player.position = Vector2(hub * T) + Vector2(T / 2.0, T)
	_add(ent, player)
	player.unique_name_in_owner = true
	_finish_map(cfg)


## 줄마다 이어진 막힌 칸을 막대 하나로 묶어 부딪히게 한다
func _solid_body(cells: Dictionary, body_name: String) -> void:
	var body := StaticBody2D.new()
	body.name = body_name
	body.collision_mask = 0
	for y in H:
		var x := 0
		while x < W:
			if cells.has(Vector2i(x, y)):
				var x0 := x
				while x < W and cells.has(Vector2i(x, y)):
					x += 1
				var cs := CollisionShape2D.new()
				cs.shape = _rect_shape(Vector2((x - x0) * T, T))
				cs.position = Vector2((x0 + x) * T / 2.0, (y + 0.5) * T)
				body.add_child(cs)
			else:
				x += 1
	_add(world, body)


## 들어갈 수 없는 입구: 그림 없는 이동문(잠김)이 밀어내고 알림을 띄운다
func _make_barriers() -> void:
	var portal_script := load("res://features/world/portal.gd") as Script
	for b: Dictionary in cfg.get("barriers", []):
		var portal := Area2D.new()
		portal.set_script(portal_script)
		portal.name = "Portal_gate"
		var cell: Vector2i = b["cell"]
		var size: Vector2i = b["size"]
		portal.position = Vector2(cell * T) + Vector2(size * T) / 2.0
		portal.set(&"target_scene", b["to"])
		portal.set(&"side", b["side"])
		portal.set(&"requires_boss", b["lock"])
		portal.set(&"invisible", true)
		portal.set(&"locked_title", b["title"])
		portal.set(&"locked_sub", b["sub"])
		var cs := CollisionShape2D.new()
		cs.shape = _rect_shape(Vector2(size * T))
		portal.add_child(cs)
		_add(world, portal)


# ── 물·가장자리·이동문 ──

## 물: 크기·모양이 제각각인 연못(울퉁불퉁한 둥근 덩어리)과 맵을 가로지르는 구불구불한 강.
## 길(흙)·공터·이동문 앞은 비워 둬서, 강이 길과 만나는 곳은 건널 수 있는 여울이 된다.
func _make_water(start: Vector2i) -> void:
	var keep_clear := func(c: Vector2i) -> bool:
		if dirt.has(c) or Vector2(c).distance_to(Vector2(start)) < 6.0:
			return true
		for g: Dictionary in cfg["gaps"]:
			if Vector2(c).distance_to(_entry(g)) < 6.0:
				return true
		return false
	# 하늘섬: 둥근 섬 바깥은 모두 물(구름 바다)
	if cfg.get("isle", false):
		var c0 := Vector2(W / 2.0, H / 2.0)
		for y in H:
			for x in W:
				var c := Vector2i(x, y)
				var q := (Vector2(c) - c0) / Vector2(W / 2.0 - 2.5, H / 2.0 - 2.5)
				if q.length() + noise.get_noise_2d(x * 2.5, y * 2.5) * 0.12 > 1.0 and not keep_clear.call(c):
					water[c] = true
	# 큰 호수(가운데 섬에서 시작, 길은 둑길로 남는다)
	if cfg.has("lake"):
		var lr: float = cfg["lake"]
		var lc := Vector2(W / 2.0, H / 2.0)
		for y in H:
			for x in W:
				var c := Vector2i(x, y)
				var d := Vector2(c).distance_to(lc) + noise.get_noise_2d(x * 3.0, y * 3.0) * 3.0
				if d < lr and d > 4.5 and not dirt.has(c) and x > BORDER + 1 and y > BORDER + 1 and x < W - BORDER - 2 and y < H - BORDER - 2:
					water[c] = true
	# 남쪽이 통째로 바다(해변)
	if cfg.has("sea_south"):
		for x in W:
			var sy := int(cfg["sea_south"]) + int(round(noise.get_noise_1d(x * 4.0 + 80.0) * 2.5))
			for y in range(sy, H):
				if not dirt.has(Vector2i(x, y)):
					water[Vector2i(x, y)] = true
	# 서쪽이 통째로 물(나루터): 물가 선이 구불구불
	if cfg.has("sea_west"):
		for r: Rect2i in [cfg.get("island", Rect2i()), cfg.get("pier", Rect2i())]:
			for y in r.size.y:
				for x in r.size.x:
					dry[r.position + Vector2i(x, y)] = true
					blocked[r.position + Vector2i(x, y)] = true  # 돌 단·다리 위엔 풀·나무를 두지 않는다
		for y in H:
			var sx := int(cfg["sea_west"]) + int(round(noise.get_noise_1d(y * 4.0 + 50.0) * 3.0))
			for x in sx:
				if not dirt.has(Vector2i(x, y)) and not dry.has(Vector2i(x, y)):
					water[Vector2i(x, y)] = true
	# 강: 시작 자리·이동문 앞을 비켜 가는 물길을 고르고(여러 번 시도), 길과 만나는 곳엔 나무 다리
	var avoid: Array[Vector2] = [Vector2(start)]
	for g: Dictionary in cfg["gaps"]:
		avoid.append(_entry(g))
	for i in int(cfg.get("rivers", 0)):
		var width: float = cfg.get("river_width", 2.0)
		var cells: Dictionary = {}
		for attempt in 12:
			cells.clear()
			var vertical := rng.randf() < 0.5
			var a := Vector2(rng.randi_range(BORDER + 8, W - BORDER - 8), -2) if vertical else Vector2(-2, rng.randi_range(BORDER + 6, H - BORDER - 6))
			var b := Vector2(rng.randi_range(BORDER + 8, W - BORDER - 8), H + 1) if vertical else Vector2(W + 1, rng.randi_range(BORDER + 6, H - BORDER - 6))
			var p := a
			var t := rng.randf() * 500.0
			var clash := false
			for guard in 4000:
				if p.distance_to(b) < 1.0:
					break
				var d := (b - p).normalized()
				p += (d + d.orthogonal() * noise.get_noise_1d(t) * 2.2).normalized() * 0.5
				t += 1.2
				for q in avoid:
					if p.distance_to(q) < 7.5 + width:
						clash = true
				var wnow := width * (0.8 + 0.4 * (noise.get_noise_1d(t * 0.5 + 99.0) + 1.0) / 2.0)
				for y in range(-4, 5):
					for x in range(-4, 5):
						var c := Vector2i(p.round()) + Vector2i(x, y)
						if Vector2(x, y).length() <= wnow and c.x >= 0 and c.y >= 0 and c.x < W and c.y < H:
							cells[c] = true
			if not clash:
				break
		for c: Vector2i in cells:
			if dirt.has(c):
				bridge[c] = true
			elif not keep_clear.call(c):
				water[c] = true
	# 연못(큰 것·작은 것 섞어서)
	var made := 0
	for tries in 300:
		if made >= int(cfg["ponds"]):
			break
		var r := rng.randf_range(1.4, 4.2) if not cfg.get("village", false) else 1.5
		var c := Vector2i(rng.randi_range(BORDER + 4, W - BORDER - 5), rng.randi_range(BORDER + 4, H - BORDER - 5))
		if Vector2(c).distance_to(Vector2(start)) < 8.0 or not _area_free(c - Vector2i(5, 5), Vector2i(11, 11), true):
			continue
		var stretch := Vector2(rng.randf_range(0.8, 1.5), rng.randf_range(0.7, 1.2))
		for y in range(-6, 7):
			for x in range(-6, 7):
				var q := Vector2(x / stretch.x, y / stretch.y)
				var cell := c + Vector2i(x, y)
				if q.length() < r + noise.get_noise_2d(cell.x * 3.0, cell.y * 3.0) * 0.9 and not keep_clear.call(cell):
					water[cell] = true
		made += 1
	_tidy_water()
	for c: Vector2i in water:
		_block(c - Vector2i.ONE, Vector2i(3, 3))


## 한 칸짜리 튀어나온 물·구멍을 정리해 물가 타일이 깔끔하게 이어지게 한다
func _tidy_water() -> void:
	for pass_i in 2:
		var remove: Array[Vector2i] = []
		for c: Vector2i in water:
			var n := 0
			for d: Vector2i in [Vector2i.UP, Vector2i.DOWN, Vector2i.LEFT, Vector2i.RIGHT]:
				if water.has(c + d) or (c + d).x < 0 or (c + d).y < 0 or (c + d).x >= W or (c + d).y >= H:
					n += 1
			if n <= 1:
				remove.append(c)
		for c in remove:
			water.erase(c)


## 물 위로는 못 걷게 줄마다 이어진 물 칸을 막대 하나로 묶어 막는다(가장자리는 살짝 안쪽)
func _water_bodies(parent: Node) -> void:
	if water.is_empty():
		return
	var body := StaticBody2D.new()
	body.name = "Water"
	body.collision_mask = 0
	for y in H:
		var x := 0
		while x < W:
			if water.has(Vector2i(x, y)):
				var x0 := x
				while x < W and water.has(Vector2i(x, y)):
					x += 1
				var r := Rect2(Vector2(x0 * T + 4, y * T + 3), Vector2((x - x0) * T - 8, T - 6))
				var cs := CollisionShape2D.new()
				cs.shape = _rect_shape(r.size)
				cs.position = r.get_center()
				body.add_child(cs)
			else:
				x += 1
	_add(parent, body)


## 이동문 자리: 서·동은 줄, 북·남은 칸. 정해 두지 않았으면(마을) 큰길이 끝나는 자리.
func _gap_at(g: Dictionary) -> int:
	if g.has("at"):
		return int(g["at"])
	match String(g["side"]):
		"west":
			return _road_y(0)
		"east":
			return _road_y(W - 1)
		_:
			return _road_x(0)


func _gap_of(side: String) -> Dictionary:
	for g: Dictionary in cfg["gaps"]:
		if g["side"] == side:
			return g
	return {}


func _in_gap(p: Vector2) -> bool:
	for g: Dictionary in cfg["gaps"]:
		var at := (_gap_at(g) + 1) * T
		match String(g["side"]):
			"west":
				if p.x < BORDER * T + 8 and absf(p.y - at) < 2.6 * T:
					return true
			"east":
				if p.x > (W - BORDER) * T - 8 and absf(p.y - at) < 2.6 * T:
					return true
			"north":
				if p.y < BORDER * T + 8 and absf(p.x - at) < 2.6 * T:
					return true
			"south":
				if p.y > (H - BORDER) * T - 8 and absf(p.x - at) < 2.6 * T:
					return true
	return false


## 가장자리를 빽빽한 숲(사막은 야자수·바위)으로 두르고, 보이지 않는 벽으로 막는다. 이동문 자리는 비운다.
func _make_border(parent: Node) -> void:
	var edge: Array[Vector2] = []
	for x in range(-8, W * T + 8, 18):
		for row in [0.9, 2.4]:
			edge.append(Vector2(x, row * T))
			edge.append(Vector2(x, H * T - (BORDER - row) * T + T))
	for y in range(int(2.0 * T), H * T - 2 * T, 18):
		for col in [0.9, 2.4]:
			edge.append(Vector2(col * T, y))
			edge.append(Vector2(W * T - col * T, y))
	var desert: bool = cfg["border"] in ["desert", "rock"]
	var no_props: bool = cfg["border"] == "none"
	var top := float(cfg.get("top_rows", 0)) * T
	for p in edge:
		if no_props or _in_gap(p) or water.has(Vector2i(p / T)) or p.y < top:
			continue
		var jitter := Vector2(rng.randf_range(-4, 4), rng.randf_range(-3, 3))
		if desert:
			if rng.randf() < float(cfg.get("border_palms", 0.6 if cfg["border"] == "desert" else 0.0)):
				_sprite_prop(parent, desert_tex, PALMS[rng.randi() % PALMS.size()], p + jitter, Vector2.ZERO, "Palm")
			else:
				_prop(parent, ROCKS[0], p + jitter, Vector2.ZERO, "Rock")
		elif cfg["border"] == "dead":
			_prop(parent, (DEAD_TREES if rng.randf() < 0.35 else FOREST)[0], p + jitter, Vector2.ZERO, "Forest")
		elif cfg["border"] == "snow":
			_prop(parent, SNOW_TREES[rng.randi() % SNOW_TREES.size()], p + jitter, Vector2.ZERO, "Forest")
		else:
			_prop(parent, FOREST[rng.randi() % FOREST.size()], p + jitter, Vector2.ZERO, "Forest")
	var wall := StaticBody2D.new()
	wall.name = "Border"
	wall.collision_mask = 0
	var thick := BORDER * T - 6.0
	var rects: Array[Rect2] = []
	var south := _gap_of("south")
	if south.is_empty():
		rects.append(Rect2(0, H * T - thick, W * T, thick))
	else:
		var sx := (_gap_at(south) + 1) * T
		rects.append(Rect2(0, H * T - thick, sx - 2.0 * T, thick))
		rects.append(Rect2(sx + 2.0 * T, H * T - thick, W * T - sx - 2.0 * T, thick))
		rects.append(Rect2(sx - 2.0 * T, H * T - 4.0, 4.0 * T, 4.0))
	if cfg.has("top_rows"):
		thick = float(cfg["top_rows"]) * T
	# 위쪽(북쪽 문이 있으면 그 자리만 비운다)
	var north := _gap_of("north")
	if north.is_empty():
		rects.append(Rect2(0, 0, W * T, thick))
	else:
		var gx := (_gap_at(north) + 1) * T
		rects.append(Rect2(0, 0, gx - 2.0 * T, thick))
		rects.append(Rect2(gx + 2.0 * T, 0, W * T - gx - 2.0 * T, thick))
		rects.append(Rect2(gx - 2.0 * T, 0, 4.0 * T, 4.0))
	thick = BORDER * T - 6.0
	for side in ["west", "east"]:
		var x := 0.0 if side == "west" else W * T - thick
		var g := _gap_of(side)
		if g.is_empty():
			rects.append(Rect2(x, 0, thick, H * T))
		else:
			var gap_y := (_gap_at(g) + 1) * T
			rects.append(Rect2(x, 0, thick, gap_y - 2.0 * T))
			rects.append(Rect2(x, gap_y + 2.0 * T, thick, H * T - gap_y - 2.0 * T))
			# 이동문 바깥으로는 못 나가게 맨 끝에 얇은 벽
			rects.append(Rect2(0.0 if side == "west" else W * T - 4.0, gap_y - 2.0 * T, 4.0, 4.0 * T))
	for r in rects:
		var cs := CollisionShape2D.new()
		cs.shape = _rect_shape(r.size)
		cs.position = r.get_center()
		wall.add_child(cs)
	_add(world, wall)


## 이동문(Portal)과, 다른 맵에서 넘어왔을 때 설 자리(Spawns/west·east·north)
func _make_portals(spawns: Node) -> void:
	var portal_script := load("res://features/world/portal.gd") as Script
	for g: Dictionary in cfg["gaps"]:
		var side: String = g["side"]
		var at := (_gap_at(g) + 1) * T
		var portal := Area2D.new()
		portal.set_script(portal_script)
		portal.name = "Portal_" + side
		match side:
			"west":
				portal.position = Vector2(1.5 * T, at)
			"east":
				portal.position = Vector2((W - 1.5) * T, at)
			"south":
				portal.position = Vector2(at, (H - 1.0) * T)
			_:
				portal.position = Vector2(at, 1.5 * T)
		portal.set(&"target_scene", g["to"])
		portal.set(&"target_spawn", g["spawn"])
		portal.set(&"label", g["label"])
		portal.set(&"side", {"west": -1, "east": 1, "south": 2}.get(side, 0))
		portal.set(&"requires_boss", g.get("lock", ""))
		portal.set(&"boss_title", g.get("lock_title", ""))
		var cs := CollisionShape2D.new()
		cs.shape = _rect_shape(Vector2(3 * T, T) if side in ["north", "south"] else Vector2(T, 3 * T))
		portal.add_child(cs)
		_add(world, portal)
		match side:
			"west":
				_block(Vector2i(0, at / T - 3), Vector2i(BORDER + 3, 6))
			"east":
				_block(Vector2i(W - BORDER - 3, at / T - 3), Vector2i(BORDER + 3, 6))
			"south":
				_block(Vector2i(at / T - 3, H - BORDER - 3), Vector2i(6, BORDER + 3))
			_:
				_block(Vector2i(at / T - 3, 0), Vector2i(6, BORDER + 3))
	# 도착 자리: 서·동은 늘 만든다(문이 없으면 가운데 줄), 북쪽은 문이 있을 때만
	for side in ["west", "east", "north", "south"]:
		var g := _gap_of(side)
		if side in ["north", "south"] and g.is_empty():
			continue
		var at := _gap_at(g) if not g.is_empty() else H / 2
		var m := Marker2D.new()
		m.name = side
		match side:
			"west":
				m.position = Vector2((BORDER + 3) * T, (at + 1) * T)
			"east":
				m.position = Vector2((W - BORDER - 3) * T, (at + 1) * T)
			"south":
				m.position = Vector2((at + 1) * T, (H - BORDER - 3) * T)
			_:
				m.position = Vector2((at + 1) * T, (BORDER + 3) * T)
		_add(spawns, m)


# ── 자연물 ──

func _scatter_props(parent: Node, start: Vector2i) -> void:
	var bush_script := load("res://features/props/bush.gd") as Script
	var snowy: bool = cfg["border"] == "snow"
	var bigs := BLOSSOM_TREES if cfg.get("big_tree_set", "") == "blossom" else (SNOW_BIG if snowy else BIG_TREES)
	if cfg.get("big_tree_set", "") == "dead":
		bigs = DEAD_TREES
	var ab := load("res://assets/ninja/tiles/abandoned.png") as Texture2D
	_scatter(start, int(cfg.get("ruins", 0)), 2000, func(c: Vector2i) -> bool:
		var r: Rect2i = RUINS[rng.randi() % RUINS.size()]
		if not _area_free(c - Vector2i.ONE, r.size + Vector2i(2, 2), true):
			return false
		_sprite_prop(parent, ab, r, Vector2(c * T) + Vector2(r.size.x * T / 2.0, r.size.y * T - 2.0), Vector2(r.size.x * T - 8, 12), "Ruin")
		_block(c, r.size)
		return true)
	_scatter(start, int(cfg.get("crystals", 0)), 3000, func(c: Vector2i) -> bool:
		return _place_small(parent, nature, c, CRYSTALS[rng.randi() % CRYSTALS.size()], "Crystal"))
	var smalls: Array[Rect2i] = SNOW_TREES.duplicate() if snowy else TREES.duplicate()
	if cfg["ground"] == FOREST_GROUND:
		smalls.append_array(FOREST)  # 숲은 짙은 나무를 섞는다
	_scatter(start, int(cfg["big_trees"]), 1500, func(c: Vector2i) -> bool:
		return _place_prop(parent, c, bigs[rng.randi() % bigs.size()], Vector2(18, 8), "BigTree"))
	_scatter(start, int(cfg["trees"]), 4000, func(c: Vector2i) -> bool:
		return _place_prop(parent, c, smalls[rng.randi() % smalls.size()], Vector2(12, 7), "Tree"))
	_scatter(start, int(cfg["rocks"]), 1500, func(c: Vector2i) -> bool:
		return _place_prop(parent, c, SNOW_ROCK if snowy else (ROCKS[0] if cfg.get("desert", false) else ROCKS[rng.randi() % ROCKS.size()]), Vector2(24, 12), "Rock"))
	if snowy:
		_scatter(start, 30, 3000, func(c: Vector2i) -> bool:
			return _place_small(parent, prop_tex, c, SNOW_SMALL[rng.randi() % SNOW_SMALL.size()], "SnowBit"))
	_scatter(start, int(cfg["bushes"]), 3000, func(c: Vector2i) -> bool:
		if not _area_free(c, Vector2i.ONE, false):
			return false
		var b := _prop(parent, Rect2i(BUSHES[rng.randi() % BUSHES.size()], Vector2i.ONE), Vector2(c * T) + Vector2(T / 2.0, T - 2.0), Vector2(12, 8), "Bush", 8)
		b.set_script(bush_script)
		_block(c, Vector2i.ONE)
		return true)
	_scatter(start, int(cfg["flowers"]), 3000, func(c: Vector2i) -> bool:
		return _place_small(parent, nature, c, FLOWERS[rng.randi() % FLOWERS.size()], "Flower"))
	if cfg.get("desert", false):
		_scatter(start, int(cfg.get("palms", 26)), 3000, func(c: Vector2i) -> bool:
			if not _area_free(c - Vector2i.ONE, Vector2i(4, 4), true):
				return false
			_sprite_prop(parent, desert_tex, PALMS[rng.randi() % PALMS.size()], Vector2(c * T) + Vector2(T, 2 * T - 2.0), Vector2(8, 6), "Palm")
			_block(c, Vector2i(2, 2))
			return true)
		_scatter(start, int(cfg.get("bones", 34)), 3000, func(c: Vector2i) -> bool:
			return _place_small(parent, desert_tex, c, BONES[rng.randi() % BONES.size()], "Bone"))
		_scatter(start, 24, 3000, func(c: Vector2i) -> bool:
			return _place_small(parent, desert_tex, c, DRY_BUSH[rng.randi() % DRY_BUSH.size()], "DryBush"))
		_scatter(start, 10, 2000, func(c: Vector2i) -> bool:
			if not _area_free(c, Vector2i.ONE, false):
				return false
			_sprite_prop(parent, desert_tex, Rect2i(POTS[rng.randi() % POTS.size()], Vector2i.ONE), Vector2(c * T) + Vector2(T / 2.0, T - 2.0), Vector2.ZERO, "Pot")
			_block(c, Vector2i.ONE)
			return true)


## 한 칸짜리 장식(꽃·뼈 등, 부딪힘 없음)
func _place_small(parent: Node, tex: Texture2D, c: Vector2i, tile: Vector2i, kind: String) -> bool:
	if not _area_free(c, Vector2i.ONE, false):
		return false
	var base := Vector2(c * T) + Vector2(T / 2.0 + rng.randf_range(-3, 3), T - 2.0)
	_sprite_prop(parent, tex, Rect2i(tile, Vector2i.ONE), base, Vector2.ZERO, kind)
	_block(c, Vector2i.ONE)
	return true


func _scatter(start: Vector2i, count: int, tries: int, place: Callable) -> void:
	var made := 0
	for i in tries:
		if made >= count:
			return
		var c := Vector2i(rng.randi_range(BORDER, W - BORDER - 3), rng.randi_range(BORDER, H - BORDER - 3))
		if Vector2(c).distance_to(Vector2(start)) < 5.0:
			continue
		if place.call(c):
			made += 1


## 나무·바위처럼 여러 칸짜리 자연물. 길에서 한 칸 떨어진 곳에만 놓는다.
func _place_prop(parent: Node, c: Vector2i, region: Rect2i, solid: Vector2, kind: String) -> bool:
	if not _area_free(c - Vector2i.ONE, region.size + Vector2i(2, 2), true):
		return false
	var base := Vector2(c * T) + Vector2(region.size.x * T / 2.0, region.size.y * T - 2.0)
	_prop(parent, region, base, solid, kind)
	_block(c, region.size)
	return true


func _prop(parent: Node, region: Rect2i, base: Vector2, solid: Vector2, kind: String, layer := 1) -> Node2D:
	return _sprite_prop(parent, prop_tex, region, base, solid, kind, layer)


## 그림 한 장 + (부딪힘 상자: 나무·바위·건물·기둥만. 덤불은 8층이라 몸은 지나가고 칼로만 벤다). base는 그림 아래쪽 가운데(y 정렬 기준).
func _sprite_prop(parent: Node, tex: Texture2D, region: Rect2i, base: Vector2, solid: Vector2, kind: String, layer := 1) -> Node2D:
	var node: Node2D
	if solid != Vector2.ZERO:
		var body := StaticBody2D.new()
		body.collision_layer = layer
		body.collision_mask = 0
		node = body
	else:
		node = Node2D.new()
	counter += 1
	node.name = "%s%d" % [kind, counter]
	node.position = base.round()
	var s := Sprite2D.new()
	s.name = "Sprite"
	s.texture = tex
	s.region_enabled = true
	s.region_rect = Rect2(region.position * T, region.size * T)
	s.centered = false
	s.offset = Vector2(-region.size.x * T / 2.0, -region.size.y * T + 2.0)
	node.add_child(s)
	if solid != Vector2.ZERO:
		var cs := CollisionShape2D.new()
		cs.name = "Shape"
		cs.shape = _rect_shape(solid)
		cs.position = Vector2(0, -solid.y / 2.0)
		node.add_child(cs)
	_add(parent, node)
	return node


## 보스: 정한 자리 근처 빈 칸에 한 마리씩(주변은 비워 둔다)
func _spawn_bosses(parent: Node) -> void:
	for entry: Array in cfg.get("bosses", []):
		var scene := load("res://features/enemy/%s.tscn" % entry[0]) as PackedScene
		var c: Vector2i = entry[1]
		for tries in 40:
			if not blocked.has(c) and not dirt.has(c):
				break
			c += Vector2i(rng.randi_range(-1, 1), rng.randi_range(-1, 1))
		var e := scene.instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE) as Node2D
		e.name = String(entry[0]).to_pascal_case()
		e.position = Vector2(c * T) + Vector2(T / 2.0, T - 2.0)
		_add(parent, e)
		_block(c - Vector2i(3, 3), Vector2i(7, 7))
		counter += 1


func _spawn_enemies(parent: Node, start: Vector2i) -> void:
	for entry: Array in cfg["spawns"]:
		var scene := load("res://features/enemy/%s.tscn" % entry[0]) as PackedScene
		var made := 0
		var tries := 0
		while made < entry[1] and tries < 2000:
			tries += 1
			var c := Vector2i(rng.randi_range(BORDER + 1, W - BORDER - 2), rng.randi_range(BORDER + 1, H - BORDER - 2))
			var d := Vector2(c).distance_to(Vector2(start))
			if d < entry[2] or d > entry[3] or blocked.has(c):
				continue
			var e := scene.instantiate(PackedScene.GEN_EDIT_STATE_INSTANCE) as Node2D
			counter += 1
			e.name = "%s%d" % [String(entry[0]).capitalize(), counter]
			e.position = Vector2(c * T) + Vector2(T / 2.0, T - 2.0)
			_add(parent, e)
			blocked[c] = true
			made += 1


func _area_free(c: Vector2i, size: Vector2i, avoid_dirt: bool) -> bool:
	for y in size.y:
		for x in size.x:
			var p := c + Vector2i(x, y)
			if blocked.has(p) or (avoid_dirt and dirt.has(p)):
				return false
			if p.x < BORDER or p.y < BORDER or p.x >= W - BORDER or p.y >= H - BORDER:
				return false
	if not avoid_dirt and dirt.has(c):
		return false
	return true


func _block(c: Vector2i, size: Vector2i) -> void:
	for y in size.y:
		for x in size.x:
			blocked[c + Vector2i(x, y)] = true


func _rect_shape(size: Vector2) -> RectangleShape2D:
	if not shapes.has(size):
		var s := RectangleShape2D.new()
		s.size = size
		shapes[size] = s
	return shapes[size]


func _add(parent: Node, child: Node) -> void:
	parent.add_child(child)
	_own(child)


func _own(node: Node) -> void:
	node.owner = world
	if node.scene_file_path.is_empty():
		for child in node.get_children():
			_own(child)
