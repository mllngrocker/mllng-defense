class_name MapGraph
extends RefCounted
## 자동으로 만든 맵 연결 지도(tools/build_map_graph.tscn). 손으로 고치지 않는다.
## 맵 id → {scene, doors: [{to, boss, x, y}], npcs, mobs}

const DATA := {
	"beach": {
		"doors": [
			{
				"boss": "",
				"to": "swamp",
				"x": 400.0,
				"y": 24.0
			},
			{
				"boss": "black_gardener",
				"to": "mist1",
				"x": 872.0,
				"y": 208.0
			}
		],
		"mobs": [
			"octopus",
			"racoon",
			"kappa"
		],
		"npcs": [],
		"scene": "res://features/world/beach.tscn"
	},
	"crystalcave": {
		"doors": [
			{
				"boss": "",
				"to": "ruinvillage",
				"x": 416.0,
				"y": 24.0
			}
		],
		"mobs": [
			"spider_queen",
			"spider",
			"bluebat",
			"mole"
		],
		"npcs": [],
		"scene": "res://features/world/crystalcave.tscn"
	},
	"desert": {
		"doors": [
			{
				"boss": "",
				"to": "forest",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "desert_town",
				"x": 936.0,
				"y": 240.0
			}
		],
		"mobs": [
			"snake",
			"lizard",
			"mole"
		],
		"npcs": [],
		"scene": "res://features/world/desert.tscn"
	},
	"desert2": {
		"doors": [
			{
				"boss": "",
				"to": "desert_town",
				"x": 24.0,
				"y": 432.0
			},
			{
				"boss": "",
				"to": "desert3",
				"x": 904.0,
				"y": 176.0
			}
		],
		"mobs": [
			"lizard",
			"mole",
			"eye",
			"cyclope"
		],
		"npcs": [],
		"scene": "res://features/world/desert2.tscn"
	},
	"desert3": {
		"doors": [
			{
				"boss": "",
				"to": "desert2",
				"x": 24.0,
				"y": 368.0
			},
			{
				"boss": "kraken",
				"to": "lava1",
				"x": 936.0,
				"y": 368.0
			}
		],
		"mobs": [
			"cyclope_king",
			"eye",
			"cyclope",
			"skull",
			"spirit"
		],
		"npcs": [],
		"scene": "res://features/world/desert3.tscn"
	},
	"desert_town": {
		"doors": [
			{
				"boss": "",
				"to": "desert",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "desert2",
				"x": 616.0,
				"y": 240.0
			}
		],
		"mobs": [],
		"npcs": [
			"족장",
			"물장수",
			"대상",
			"무희"
		],
		"scene": "res://features/world/desert_town.tscn"
	},
	"field": {
		"doors": [
			{
				"boss": "",
				"to": "village",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "hill",
				"x": 872.0,
				"y": 272.0
			}
		],
		"mobs": [
			"slime",
			"mushroom",
			"bat"
		],
		"npcs": [],
		"scene": "res://features/world/world.tscn"
	},
	"forest": {
		"doors": [
			{
				"boss": "",
				"to": "hill",
				"x": 24.0,
				"y": 400.0
			},
			{
				"boss": "king_slime",
				"to": "desert",
				"x": 936.0,
				"y": 528.0
			}
		],
		"mobs": [
			"king_slime",
			"spirit",
			"skull",
			"bat",
			"mushroom"
		],
		"npcs": [],
		"scene": "res://features/world/forest.tscn"
	},
	"garden1": {
		"doors": [
			{
				"boss": "",
				"to": "root6",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "garden2",
				"x": 808.0,
				"y": 320.0
			}
		],
		"mobs": [
			"garden_moth",
			"garden_lizard"
		],
		"npcs": [],
		"scene": "res://features/world/garden1.tscn"
	},
	"garden2": {
		"doors": [
			{
				"boss": "",
				"to": "garden1",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "garden3",
				"x": 872.0,
				"y": 336.0
			}
		],
		"mobs": [
			"garden_snake",
			"garden_spider"
		],
		"npcs": [],
		"scene": "res://features/world/garden2.tscn"
	},
	"garden3": {
		"doors": [
			{
				"boss": "",
				"to": "garden2",
				"x": 24.0,
				"y": 352.0
			},
			{
				"boss": "",
				"to": "garden4",
				"x": 872.0,
				"y": 352.0
			}
		],
		"mobs": [
			"garden_owl",
			"garden_lizard2"
		],
		"npcs": [],
		"scene": "res://features/world/garden3.tscn"
	},
	"garden4": {
		"doors": [
			{
				"boss": "",
				"to": "garden3",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "garden5",
				"x": 808.0,
				"y": 320.0
			}
		],
		"mobs": [
			"garden_owl2",
			"garden_beast",
			"garden_moth"
		],
		"npcs": [],
		"scene": "res://features/world/garden4.tscn"
	},
	"garden5": {
		"doors": [
			{
				"boss": "",
				"to": "garden4",
				"x": 24.0,
				"y": 176.0
			},
			{
				"boss": "",
				"to": "garden6",
				"x": 1160.0,
				"y": 176.0
			}
		],
		"mobs": [
			"garden_beast",
			"garden_spider",
			"garden_owl"
		],
		"npcs": [],
		"scene": "res://features/world/garden5.tscn"
	},
	"garden6": {
		"doors": [
			{
				"boss": "",
				"to": "garden5",
				"x": 24.0,
				"y": 256.0
			}
		],
		"mobs": [
			"black_gardener",
			"garden_owl2",
			"garden_snake"
		],
		"npcs": [],
		"scene": "res://features/world/garden6.tscn"
	},
	"hell1": {
		"doors": [
			{
				"boss": "",
				"to": "lava6",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "hell2",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"lantern_red",
			"demon_eye"
		],
		"npcs": [],
		"scene": "res://features/world/hell1.tscn"
	},
	"hell2": {
		"doors": [
			{
				"boss": "",
				"to": "hell1",
				"x": 24.0,
				"y": 176.0
			},
			{
				"boss": "",
				"to": "hell3",
				"x": 1192.0,
				"y": 176.0
			}
		],
		"mobs": [
			"lantern_red",
			"demon_eye"
		],
		"npcs": [],
		"scene": "res://features/world/hell2.tscn"
	},
	"hell3": {
		"doors": [
			{
				"boss": "",
				"to": "hell2",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "hell4",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"grey_trex",
			"lantern_red"
		],
		"npcs": [],
		"scene": "res://features/world/hell3.tscn"
	},
	"hell4": {
		"doors": [
			{
				"boss": "",
				"to": "hell3",
				"x": 24.0,
				"y": 352.0
			},
			{
				"boss": "",
				"to": "hell5",
				"x": 872.0,
				"y": 352.0
			}
		],
		"mobs": [
			"demon_eye",
			"dragon"
		],
		"npcs": [],
		"scene": "res://features/world/hell4.tscn"
	},
	"hell5": {
		"doors": [
			{
				"boss": "",
				"to": "hell4",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "hell6",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"demon_eye",
			"lantern_red"
		],
		"npcs": [],
		"scene": "res://features/world/hell5.tscn"
	},
	"hell6": {
		"doors": [
			{
				"boss": "",
				"to": "hell5",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "demon_lord",
				"to": "sky1",
				"x": 584.0,
				"y": 240.0
			}
		],
		"mobs": [
			"demon_lord",
			"demon_eye",
			"dragon"
		],
		"npcs": [],
		"scene": "res://features/world/hell6.tscn"
	},
	"hill": {
		"doors": [
			{
				"boss": "",
				"to": "field",
				"x": 24.0,
				"y": 368.0
			},
			{
				"boss": "",
				"to": "forest",
				"x": 872.0,
				"y": 208.0
			}
		],
		"mobs": [
			"mushroom",
			"bat",
			"slime",
			"spirit"
		],
		"npcs": [],
		"scene": "res://features/world/hill.tscn"
	},
	"lava1": {
		"doors": [
			{
				"boss": "",
				"to": "desert3",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "lava2",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"flam",
			"heart_red"
		],
		"npcs": [],
		"scene": "res://features/world/lava1.tscn"
	},
	"lava2": {
		"doors": [
			{
				"boss": "",
				"to": "lava1",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "lava3",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"flam",
			"flam2"
		],
		"npcs": [],
		"scene": "res://features/world/lava2.tscn"
	},
	"lava3": {
		"doors": [
			{
				"boss": "",
				"to": "lava2",
				"x": 24.0,
				"y": 176.0
			},
			{
				"boss": "",
				"to": "lava_town",
				"x": 1192.0,
				"y": 176.0
			}
		],
		"mobs": [
			"dragon_y",
			"flam2"
		],
		"npcs": [],
		"scene": "res://features/world/lava3.tscn"
	},
	"lava4": {
		"doors": [
			{
				"boss": "",
				"to": "lava_town",
				"x": 24.0,
				"y": 352.0
			},
			{
				"boss": "",
				"to": "lava5",
				"x": 872.0,
				"y": 352.0
			}
		],
		"mobs": [
			"trex",
			"flam"
		],
		"npcs": [],
		"scene": "res://features/world/lava4.tscn"
	},
	"lava5": {
		"doors": [
			{
				"boss": "",
				"to": "lava4",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "lava6",
				"x": 904.0,
				"y": 336.0
			}
		],
		"mobs": [
			"grey_trex",
			"dragon_y"
		],
		"npcs": [],
		"scene": "res://features/world/lava5.tscn"
	},
	"lava6": {
		"doors": [
			{
				"boss": "",
				"to": "lava5",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "flame_dragon",
				"to": "hell1",
				"x": 584.0,
				"y": 240.0
			}
		],
		"mobs": [
			"flame_dragon",
			"dragon",
			"flam2"
		],
		"npcs": [],
		"scene": "res://features/world/lava6.tscn"
	},
	"lava_town": {
		"doors": [
			{
				"boss": "",
				"to": "lava3",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "lava4",
				"x": 616.0,
				"y": 240.0
			}
		],
		"mobs": [],
		"npcs": [
			"대장장이",
			"광부",
			"견습생"
		],
		"scene": "res://features/world/lava_town.tscn"
	},
	"mist1": {
		"doors": [
			{
				"boss": "",
				"to": "beach",
				"x": 24.0,
				"y": 208.0
			},
			{
				"boss": "",
				"to": "mist_town",
				"x": 872.0,
				"y": 208.0
			}
		],
		"mobs": [
			"mist_octo",
			"mist_fish"
		],
		"npcs": [],
		"scene": "res://features/world/mist1.tscn"
	},
	"mist2": {
		"doors": [
			{
				"boss": "",
				"to": "mist_town",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "mist3",
				"x": 904.0,
				"y": 320.0
			}
		],
		"mobs": [
			"mist_skull",
			"mist_octo"
		],
		"npcs": [],
		"scene": "res://features/world/mist2.tscn"
	},
	"mist3": {
		"doors": [
			{
				"boss": "",
				"to": "mist2",
				"x": 24.0,
				"y": 352.0
			},
			{
				"boss": "",
				"to": "mist4",
				"x": 872.0,
				"y": 352.0
			}
		],
		"mobs": [
			"mist_slime",
			"mist_fish"
		],
		"npcs": [],
		"scene": "res://features/world/mist3.tscn"
	},
	"mist4": {
		"doors": [
			{
				"boss": "",
				"to": "mist3",
				"x": 24.0,
				"y": 176.0
			},
			{
				"boss": "",
				"to": "mist5",
				"x": 1192.0,
				"y": 176.0
			}
		],
		"mobs": [
			"mist_lantern",
			"mist_wisp"
		],
		"npcs": [],
		"scene": "res://features/world/mist4.tscn"
	},
	"mist5": {
		"doors": [
			{
				"boss": "",
				"to": "mist4",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "mist6",
				"x": 840.0,
				"y": 320.0
			}
		],
		"mobs": [
			"mist_snake",
			"mist_wisp",
			"mist_skull"
		],
		"npcs": [],
		"scene": "res://features/world/mist5.tscn"
	},
	"mist6": {
		"doors": [
			{
				"boss": "",
				"to": "mist5",
				"x": 24.0,
				"y": 240.0
			}
		],
		"mobs": [
			"mist_apostle",
			"mist_lantern",
			"mist_snake"
		],
		"npcs": [],
		"scene": "res://features/world/mist6.tscn"
	},
	"mist_town": {
		"doors": [
			{
				"boss": "",
				"to": "mist1",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "mist2",
				"x": 616.0,
				"y": 240.0
			}
		],
		"mobs": [],
		"npcs": [
			"항구 촌장",
			"등대지기",
			"어부"
		],
		"scene": "res://features/world/mist_town.tscn"
	},
	"root1": {
		"doors": [
			{
				"boss": "",
				"to": "sky6",
				"x": 24.0,
				"y": 304.0
			},
			{
				"boss": "",
				"to": "root2",
				"x": 776.0,
				"y": 304.0
			}
		],
		"mobs": [
			"root_larva",
			"root_mole"
		],
		"npcs": [],
		"scene": "res://features/world/root1.tscn"
	},
	"root2": {
		"doors": [
			{
				"boss": "",
				"to": "root1",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "root_town",
				"x": 808.0,
				"y": 320.0
			}
		],
		"mobs": [
			"root_larva_b",
			"root_shroom"
		],
		"npcs": [],
		"scene": "res://features/world/root2.tscn"
	},
	"root3": {
		"doors": [
			{
				"boss": "",
				"to": "root_town",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "root4",
				"x": 872.0,
				"y": 320.0
			}
		],
		"mobs": [
			"root_mollusc",
			"root_shroom"
		],
		"npcs": [],
		"scene": "res://features/world/root3.tscn"
	},
	"root4": {
		"doors": [
			{
				"boss": "",
				"to": "root3",
				"x": 24.0,
				"y": 192.0
			},
			{
				"boss": "",
				"to": "root5",
				"x": 1128.0,
				"y": 192.0
			}
		],
		"mobs": [
			"root_larva",
			"root_larva_b",
			"root_beast"
		],
		"npcs": [],
		"scene": "res://features/world/root4.tscn"
	},
	"root5": {
		"doors": [
			{
				"boss": "",
				"to": "root4",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "root6",
				"x": 840.0,
				"y": 320.0
			}
		],
		"mobs": [
			"root_beast",
			"root_mollusc"
		],
		"npcs": [],
		"scene": "res://features/world/root5.tscn"
	},
	"root6": {
		"doors": [
			{
				"boss": "",
				"to": "root5",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "root_worm",
				"to": "garden1",
				"x": 616.0,
				"y": 240.0
			}
		],
		"mobs": [
			"root_worm",
			"root_beast",
			"root_larva_b"
		],
		"npcs": [],
		"scene": "res://features/world/root6.tscn"
	},
	"root_town": {
		"doors": [
			{
				"boss": "",
				"to": "root2",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "root3",
				"x": 616.0,
				"y": 240.0
			}
		],
		"mobs": [],
		"npcs": [
			"새싹 장로",
			"약초꾼",
			"로웰",
			"새싹 아이"
		],
		"scene": "res://features/world/root_town.tscn"
	},
	"ruinvillage": {
		"doors": [
			{
				"boss": "",
				"to": "swamp",
				"x": 24.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "crystalcave",
				"x": 448.0,
				"y": 624.0
			}
		],
		"mobs": [
			"lantern",
			"rat",
			"skull",
			"spirit"
		],
		"npcs": [],
		"scene": "res://features/world/ruinvillage.tscn"
	},
	"shore": {
		"doors": [
			{
				"boss": "",
				"to": "village",
				"x": 616.0,
				"y": 224.0
			},
			{
				"boss": "yeti_king",
				"to": "temple1",
				"x": 128.0,
				"y": 120.0
			}
		],
		"mobs": [],
		"npcs": [
			"뱃사공"
		],
		"scene": "res://features/world/shore.tscn"
	},
	"sky1": {
		"doors": [
			{
				"boss": "",
				"to": "hell6",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "sky2",
				"x": 776.0,
				"y": 320.0
			}
		],
		"mobs": [
			"bamboo",
			"heart_green",
			"sky_bat"
		],
		"npcs": [],
		"scene": "res://features/world/sky1.tscn"
	},
	"sky2": {
		"doors": [
			{
				"boss": "",
				"to": "sky1",
				"x": 24.0,
				"y": 320.0
			},
			{
				"boss": "",
				"to": "sky_town",
				"x": 776.0,
				"y": 320.0
			}
		],
		"mobs": [
			"bamboo_y",
			"gold_racoon",
			"sky_bat"
		],
		"npcs": [],
		"scene": "res://features/world/sky2.tscn"
	},
	"sky3": {
		"doors": [
			{
				"boss": "",
				"to": "sky_town",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "sky4",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"sky_spirit",
			"gold_racoon"
		],
		"npcs": [],
		"scene": "res://features/world/sky3.tscn"
	},
	"sky4": {
		"doors": [
			{
				"boss": "",
				"to": "sky3",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "sky5",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"sky_spirit",
			"bamboo_y"
		],
		"npcs": [],
		"scene": "res://features/world/sky4.tscn"
	},
	"sky5": {
		"doors": [
			{
				"boss": "",
				"to": "sky4",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "sky6",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"gold_racoon",
			"heart_green"
		],
		"npcs": [],
		"scene": "res://features/world/sky5.tscn"
	},
	"sky6": {
		"doors": [
			{
				"boss": "",
				"to": "sky5",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "giant_soul",
				"to": "root1",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"giant_soul",
			"sky_spirit",
			"gold_racoon"
		],
		"npcs": [],
		"scene": "res://features/world/sky6.tscn"
	},
	"sky_town": {
		"doors": [
			{
				"boss": "",
				"to": "sky2",
				"x": 24.0,
				"y": 256.0
			},
			{
				"boss": "",
				"to": "sky3",
				"x": 616.0,
				"y": 256.0
			}
		],
		"mobs": [],
		"npcs": [
			"구름 장로",
			"바람 소녀",
			"하늘 파수꾼"
		],
		"scene": "res://features/world/sky_town.tscn"
	},
	"snow1": {
		"doors": [
			{
				"boss": "",
				"to": "snowgate",
				"x": 400.0,
				"y": 624.0
			},
			{
				"boss": "",
				"to": "snow_town",
				"x": 496.0,
				"y": 24.0
			}
		],
		"mobs": [
			"snow_mouse",
			"panda",
			"snow_bat"
		],
		"npcs": [],
		"scene": "res://features/world/snow1.tscn"
	},
	"snow2": {
		"doors": [
			{
				"boss": "",
				"to": "snow_town",
				"x": 464.0,
				"y": 720.0
			},
			{
				"boss": "",
				"to": "snow3",
				"x": 872.0,
				"y": 368.0
			}
		],
		"mobs": [
			"snow_mouse",
			"ice_skull",
			"snow_bat"
		],
		"npcs": [],
		"scene": "res://features/world/snow2.tscn"
	},
	"snow3": {
		"doors": [
			{
				"boss": "",
				"to": "snow2",
				"x": 24.0,
				"y": 192.0
			},
			{
				"boss": "",
				"to": "snow4",
				"x": 1160.0,
				"y": 176.0
			}
		],
		"mobs": [
			"bear",
			"frost_spirit",
			"ice_skull"
		],
		"npcs": [],
		"scene": "res://features/world/snow3.tscn"
	},
	"snow4": {
		"doors": [
			{
				"boss": "",
				"to": "snow3",
				"x": 24.0,
				"y": 368.0
			},
			{
				"boss": "",
				"to": "snow5",
				"x": 464.0,
				"y": 24.0
			}
		],
		"mobs": [
			"bear",
			"panda",
			"frost_spirit"
		],
		"npcs": [],
		"scene": "res://features/world/snow4.tscn"
	},
	"snow5": {
		"doors": [
			{
				"boss": "",
				"to": "snow4",
				"x": 416.0,
				"y": 592.0
			},
			{
				"boss": "",
				"to": "snow6",
				"x": 776.0,
				"y": 304.0
			}
		],
		"mobs": [
			"ice_skull",
			"frost_spirit",
			"snow_bat"
		],
		"npcs": [],
		"scene": "res://features/world/snow5.tscn"
	},
	"snow6": {
		"doors": [
			{
				"boss": "",
				"to": "snow5",
				"x": 24.0,
				"y": 256.0
			}
		],
		"mobs": [
			"yeti_king",
			"bear",
			"panda"
		],
		"npcs": [],
		"scene": "res://features/world/snow6.tscn"
	},
	"snow_town": {
		"doors": [
			{
				"boss": "",
				"to": "snow1",
				"x": 288.0,
				"y": 496.0
			},
			{
				"boss": "",
				"to": "snow2",
				"x": 288.0,
				"y": 24.0
			}
		],
		"mobs": [],
		"npcs": [
			"눈꽃 촌장",
			"얼음 낚시꾼",
			"약초꾼"
		],
		"scene": "res://features/world/snow_town.tscn"
	},
	"snowgate": {
		"doors": [
			{
				"boss": "",
				"to": "village",
				"x": 272.0,
				"y": 464.0
			},
			{
				"boss": "spider_queen",
				"to": "snow1",
				"x": 272.0,
				"y": 120.0
			}
		],
		"mobs": [],
		"npcs": [
			"설산 파수꾼"
		],
		"scene": "res://features/world/snowgate.tscn"
	},
	"swamp": {
		"doors": [
			{
				"boss": "",
				"to": "village",
				"x": 320.0,
				"y": 24.0
			},
			{
				"boss": "",
				"to": "ruinvillage",
				"x": 872.0,
				"y": 336.0
			},
			{
				"boss": "",
				"to": "waterfall",
				"x": 24.0,
				"y": 400.0
			},
			{
				"boss": "",
				"to": "beach",
				"x": 496.0,
				"y": 656.0
			}
		],
		"mobs": [
			"kappa",
			"slime",
			"lantern"
		],
		"npcs": [],
		"scene": "res://features/world/swamp.tscn"
	},
	"temple1": {
		"doors": [
			{
				"boss": "",
				"to": "shore",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple2",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"blue_axolot",
			"jump_fish"
		],
		"npcs": [],
		"scene": "res://features/world/temple1.tscn"
	},
	"temple2": {
		"doors": [
			{
				"boss": "",
				"to": "temple1",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple_town",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"green_octopus",
			"blue_axolot"
		],
		"npcs": [],
		"scene": "res://features/world/temple2.tscn"
	},
	"temple3": {
		"doors": [
			{
				"boss": "",
				"to": "temple_town",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple4",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"kappa_red",
			"green_octopus"
		],
		"npcs": [],
		"scene": "res://features/world/temple3.tscn"
	},
	"temple4": {
		"doors": [
			{
				"boss": "",
				"to": "temple3",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple5",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"red_octopus",
			"jump_fish"
		],
		"npcs": [],
		"scene": "res://features/world/temple4.tscn"
	},
	"temple5": {
		"doors": [
			{
				"boss": "",
				"to": "temple4",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple6",
				"x": 744.0,
				"y": 240.0
			}
		],
		"mobs": [
			"deep_octopus",
			"kappa_red"
		],
		"npcs": [],
		"scene": "res://features/world/temple5.tscn"
	},
	"temple6": {
		"doors": [
			{
				"boss": "",
				"to": "temple5",
				"x": 24.0,
				"y": 240.0
			}
		],
		"mobs": [
			"kraken",
			"deep_octopus",
			"red_octopus"
		],
		"npcs": [],
		"scene": "res://features/world/temple6.tscn"
	},
	"temple_town": {
		"doors": [
			{
				"boss": "",
				"to": "temple2",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "temple3",
				"x": 680.0,
				"y": 240.0
			}
		],
		"mobs": [],
		"npcs": [
			"신전지기",
			"물방울 상인",
			"늙은 학자"
		],
		"scene": "res://features/world/temple_town.tscn"
	},
	"village": {
		"doors": [
			{
				"boss": "",
				"to": "field",
				"x": 616.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "shore",
				"x": 24.0,
				"y": 240.0
			},
			{
				"boss": "",
				"to": "snowgate",
				"x": 320.0,
				"y": 24.0
			},
			{
				"boss": "",
				"to": "swamp",
				"x": 320.0,
				"y": 464.0
			}
		],
		"mobs": [],
		"npcs": [
			"촌장",
			"경비병",
			"상인",
			"농부",
			"아가씨",
			"소년",
			"수도승",
			"사냥꾼",
			"할머니",
			"꼬마",
			"스승"
		],
		"scene": "res://features/world/village.tscn"
	},
	"waterfall": {
		"doors": [
			{
				"boss": "",
				"to": "swamp",
				"x": 776.0,
				"y": 400.0
			}
		],
		"mobs": [
			"axolot",
			"butterfly",
			"racoon"
		],
		"npcs": [],
		"scene": "res://features/world/waterfall.tscn"
	}
}
