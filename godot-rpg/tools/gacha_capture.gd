extends Node
## 상점·뽑기 연출 확인용 녹화(진짜 저장은 안 건드림). ★5 연출이 보이게 천장을 거의 채워 둔다.
## 녹화: godot --path godot-rpg --write-movie out.png --fixed-fps 30 --quit-after 220 res://tools/gacha_capture.tscn

var menu: Node
var frame := 0


func _ready() -> void:
	Save.persist = false
	Save.gems = 1200
	Save.pity = Gacha.PITY_5 - 6
	menu = (load("res://features/menu/main_menu.tscn") as PackedScene).instantiate()
	add_child(menu)


func _process(_delta: float) -> void:
	frame += 1
	if frame == 5:
		menu._switch_tab("상점")
	elif frame == 40:
		menu.shop_page._on_pull(10, Gacha.COST_TEN)
