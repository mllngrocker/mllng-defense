extends Node
## 뽑기 결과 연출 캡처용: 10회 결과(조각·새 캐릭터·★5 하나)를 띄운다.

func _ready() -> void:
	Save.persist = false
	for id in [&"kemo1", &"kemo2", &"kemo3", &"fairy3", &"maid2"]:
		Save.owned[String(id)] = {"level": 1, "stars": 0, "shards": 10}
	var res: Array[Dictionary] = []
	var list := [[&"kemo1", 3, "max"], [&"fairy3", 3, "shard"], [&"maid2", 4, "shard"], [&"scarlet", 5, "new"], [&"kemo2", 3, "shard"],
		[&"kemo3", 3, "shard"], [&"fairy1", 4, "new"], [&"kemo2", 3, "shard"], [&"kemo1", 3, "shard"], [&"maid2", 4, "shard"]]
	for e in list:
		res.append({"id": e[0], "rarity": Save.character(e[0]).rarity, "result": e[2], "stars": 0, "shards": 10, "gold": 0})  # 실제 등급
	if "--mythic" in OS.get_cmdline_user_args():  # 무기 소환: 신화 섞어서
		res.clear()
		for e in [[&"chaos_sword", 6], [&"sword", 3], [&"knight_sword", 4], [&"armor5", 6], [&"bow", 3], [&"holy_sword", 5], [&"ring5b", 6], [&"tome", 4], [&"abyss_staff", 6], [&"neck3", 4]]:
			var key := "gear" if Gear.has_id(e[0]) else "weapon"
			res.append({key: e[0], "rarity": e[1], "result": "new", "refine": 0, "gold": 0})
	var g := GachaResult.new()
	g.results = res
	add_child(g)

	# ★5 등장 화면은 누를 때까지 멈춰 있으니, 잠깐 뒤 전부 넘긴다(카드 전체를 찍으려고)
	await get_tree().create_timer(4.0).timeout
	g._skip_all()
