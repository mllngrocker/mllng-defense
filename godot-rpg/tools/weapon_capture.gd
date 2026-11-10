extends Node
## 무기 뽑기 확인용 녹화: 상점 무기 모드 → 10회 소환 연출 → 아바타 무기 칸 → 무기 선택 창(진짜 저장은 안 건드림).
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 260 res://tools/weapon_capture.tscn

var menu: Node
var frame := 0


func _ready() -> void:
	Save.persist = false
	Save.gems = 1200
	Save.pity_w = Gacha.PITY_5 - 6
	menu = (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)


func _process(_delta: float) -> void:
	frame += 1
	match frame:
		5:
			menu._switch_tab("상점")
			menu.shop_page.set_mode("weapon")
		40:
			menu.shop_page._on_pull(10, Gacha.COST_TEN)
		200:
			for n in menu.get_children():
				if n is GachaResult:
					n.queue_free()
			# 뽑은 ★5 무기를 출전 캐릭터에게 끼운다
			for w in Weapons.pool(5):
				if Save.has_weapon(w):
					Save.equip_weapon(Save.selected, w)
					break
			menu._switch_tab("아바타")
		215:
			menu._open_weapon_picker()
