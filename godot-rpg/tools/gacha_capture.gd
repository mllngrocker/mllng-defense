extends Node
## 뽑기 결과 연출 캡처용: 10회 결과(조각·새 캐릭터·★5 하나)를 띄운다.

func _ready() -> void:
	Save.persist = false
	for id in [&"kemo1", &"kemo2", &"kemo3", &"fairy3", &"maid2"]:
		Save.owned[String(id)] = {"level": 1, "stars": 0, "shards": 10}
	var res: Array[Dictionary] = []
	var list := [[&"kemo1", 3, "shard"], [&"fairy3", 3, "shard"], [&"maid2", 4, "shard"], [&"fairy1", 5, "new"], [&"kemo2", 3, "shard"],
		[&"kemo3", 3, "shard"], [&"maid3", 4, "new"], [&"kemo2", 3, "shard"], [&"kemo1", 3, "shard"], [&"maid2", 4, "shard"]]
	for e in list:
		res.append({"id": e[0], "rarity": e[1], "result": e[2], "stars": 0, "shards": 10, "gold": 0})
	var g := GachaResult.new()
	g.results = res
	add_child(g)

