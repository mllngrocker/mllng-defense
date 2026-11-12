extends Node
## 캐릭터 카드 확인용: 모든 캐릭터를 가진 상태로 로비를 띄운다(카드 얼굴 위치·화질 확인).

func _ready() -> void:
	Save.persist = false
	for id in Save.ROSTER:
		Save.owned[String(id)] = {"level": 1, "stars": 0, "shards": 0}
	var menu: Control = load("res://features/menu/main_menu.tscn").instantiate()
	add_child(menu)
