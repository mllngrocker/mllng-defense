extends Node
## 새 화면 캡처용: -- --idle(방치 보상) · --quest(퀘스트 탭 던전) · --gear(장비 창 강화·분해·합성)

func _ready() -> void:
	Save.persist = false
	Save.gear = {"neck2": 1, "ring2": 0, "boots2": 0, "neck3": 0}
	Save.items["stone"] = 18
	Save.quest["bosses"] = {"king_slime": true, "cyclope_king": true, "spider_queen": true}
	var args := OS.get_cmdline_user_args()
	for a in args:
		if a.begins_with("--char="):
			var cid := StringName(a.substr(7))
			if not Save.owned.has(String(cid)):
				Save.owned[String(cid)] = {"level": 1, "stars": 0, "shards": 0}
			Save.selected = cid
	Save.owned[String(Save.selected)]["shards"] = 14  # 승급 가능한 상태
	for a in args:
		if a.begins_with("--rank="):
			Save.owned[String(Save.selected)]["stars"] = int(a.substr(7)) - Save.character(Save.selected).rarity
	if "--idle" in args:
		Save.away_seconds = 3 * 3600 + 25 * 60
		IdleReward.shown = false
	else:
		IdleReward.shown = true
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
	if "--quest" in args:
		menu.call_deferred(&"_switch_tab", "퀘스트")
	if "--achieve" in args or "--mail" in args:
		Save.dex = {"slime": 400, "bat": 300, "mushroom": 400}
		Save.stats = {"pulls": 12}
		var w := ListWindow.new()
		w.mode = "mail" if "--mail" in args else "achieve"
		menu.add_child.call_deferred(w)
	if "--gear" in args:
		menu.call_deferred(&"_open_gear_picker", "neck")
