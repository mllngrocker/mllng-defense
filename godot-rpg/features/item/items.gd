class_name Items
extends RefCounted
## 가방 아이템: 마을 귀환서(마지막으로 들른 마을로), 회복 물약(체력 50%).
## 몬스터가 가끔 떨어뜨리고(ItemPickup), 보스는 꼭 몇 개 준다. 가진 수는 Save.items, 가방 창은 ItemWindow.
## 스킬 책(트레이닝·마스터)도 가방에 보이지만 쓰는 곳은 로비 아바타의 스킬 창이다.

## id → [이름, 설명, 아이콘(Gt.icon 이름)]
const DATA: Dictionary[StringName, Array] = {
	&"return_scroll": ["마을 귀환서", "마지막으로 들른 마을로 순식간에 돌아간다", &"scroll"],
	&"stone": ["강화석", "장비 강화에 쓴다 · 장비를 분해하면 나온다(사용은 로비 장비 창에서)", &"gem_yellow"],
	&"potion": ["회복 물약", "체력을 50% 회복한다 · 자동 사냥 중엔 체력이 적으면 알아서 마신다", &"potion"],
}
const BOOKS: Dictionary[String, Array] = {
	"training": ["트레이닝 북", "스킬 포인트 +1 · 로비 아바타의 스킬 창에서 쓴다", &"book"],
	"master": ["마스터 북", "오의를 열고 스킬 상한을 10으로 · 로비 스킬 창에서 쓴다", &"book"],
}
## 가방 창에서 바로 쓸 수 있는 것(강화석은 장비 창에서 쓴다)
const USABLE: Array[StringName] = [&"return_scroll", &"potion"]
## 마을 맵(귀환서로 돌아갈 수 있는 곳)
const TOWNS: Array[String] = ["village", "desert_town", "snow_town", "temple_town", "lava_town", "sky_town", "root_town", "mist_town"]
## 몬스터가 떨어뜨릴 확률(보스는 아래 BOSS_DROP)
const DROP := {&"potion": 0.05, &"return_scroll": 0.025}
const BOSS_DROP := {&"potion": 3, &"return_scroll": 2}
const POTION_HEAL := 0.5


static func name_of(id: StringName) -> String:
	return DATA[id][0]


static func icon_of(id: StringName) -> StringName:
	return DATA[id][2]


## 아이템 쓰기. 쓰면 true(가진 수는 Save.use_item이 줄인다)
static func use(id: StringName, tree: SceneTree) -> bool:
	var player := tree.get_first_node_in_group(&"player") as Player
	match id:
		&"potion":
			if player == null or player.hp <= 0 or player.hp >= player.max_hp:
				return false
			if not Save.use_item(id):
				return false
			player.heal(ceili(player.max_hp * POTION_HEAL))
			Game.sfx(&"heal", -2.0, 0.0)
			return true
		&"return_scroll":
			if player == null or player.hp <= 0:
				return false
			var town := Save.last_town if Save.last_town != "" else "village"
			if not Save.use_item(id):
				return false
			Save.place = {}
			Game.sfx(&"charged", -4.0, 0.0)
			player.flash(0.8)
			Events.notice.emit("마을 귀환서", "%s(으)로 돌아갑니다" % town_title(town))
			Game.go_to("res://features/world/%s.tscn" % town, "")
			return true
	return false


static func town_title(id: String) -> String:
	return {"village": "레몬 마을", "desert_town": "오아시스 마을", "snow_town": "눈꽃 마을", "temple_town": "물방울 마을",
		"lava_town": "불꽃 대장간 마을", "sky_town": "구름 마을", "root_town": "새싹 마을", "mist_town": "안개 항구"}.get(id, "마을")
