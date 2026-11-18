extends Node
## 로비 화면 확인용 녹화: 시작 화면 → 카라(불) 미리보기 → ★5 플로라 미리보기.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 90 res://tools/menu_capture.tscn

var menu: Node
var frame := 0


func _ready() -> void:
	Save.persist = false
	Save.gold = 1240
	Save.away_seconds = 0  # 방치 보상 창이 가리지 않게
	if "--tiers" in OS.get_cmdline_user_args():  # 카드 테두리 확인: 앞 캐릭터 둘을 6성·7성으로
		for k in 2:
			var id := String(Save.ROSTER[k])
			var e: Dictionary = Save.owned.get(id, {})
			e["stars"] = 6 + k - Save.character(StringName(id)).rarity
			Save.owned[id] = e
	menu = (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)


func _process(_delta: float) -> void:
	frame += 1
	if "--shop" in OS.get_cmdline_user_args() or "--shopw" in OS.get_cmdline_user_args() or "--shopp" in OS.get_cmdline_user_args():  # 상점(픽업·무기 소환)
		if frame == 3:
			menu._on_tab_pressed(0)
		if frame == 6 and "--shopp" in OS.get_cmdline_user_args():
			for n in menu.find_children("*", "", true, false):
				if n.has_method("set_mode"):
					n.set_mode("pet")
		if frame == 6 and "--shopw" in OS.get_cmdline_user_args():
			for n in menu.find_children("*", "", true, false):
				if n.has_method("set_mode"):
					n.set_mode("weapon")
		return
	for a in OS.get_cmdline_user_args():  # --newbie=6 : 첫 7일 선물 창(받은 날 수), 6이면 프레임 30에 ★5 고르기
		if a.begins_with("--newbie="):
			if frame == 3:
				Save.settings["newbie"] = {"day": int(a.substr(9)), "last": ""}
				var g := NewbieGift.new()
				g.name = "Newbie"
				menu.add_child(g)
			elif frame == 30 and int(a.substr(9)) == 6:
				var g: NewbieGift = menu.get_node(^"Newbie")
				g._on_btn()
				g._picked = NewbieGift.five_stars()[0]
			return
	if "--guide" in OS.get_cmdline_user_args():  # 첫 소환 안내: 선물 → 상점 탭 → 1회 소환
		if frame == 3:
			var g := PullGuide.new()
			g.menu = menu
			g.name = "Guide"
			menu.add_child(g)
		elif frame == 25:
			menu.get_node(^"Guide").step = 1
		elif frame == 45:
			menu._on_tab_pressed(0)
			menu.get_node(^"Guide").step = 2
		return
	for a in OS.get_cmdline_user_args():  # --view=1 : ROSTER 1번 캐릭터를 보여 준다(--tiers와 함께 6·7성 확인)
		if a.begins_with("--view="):
			if frame == 3:
				menu._preview(Save.ROSTER[int(a.substr(7))])
			return
	if "--quest" in OS.get_cmdline_user_args():
		if frame == 3:
			menu._on_tab_pressed(3)
		return
	if frame == 30:
		menu._preview(&"kemo3")
		print("30: ", menu.viewing)
	elif frame == 60:
		menu._preview(&"fairy1")
		print("60: ", menu.viewing)
