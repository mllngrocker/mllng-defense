extends Node
## 진행 상황 저장: 골드·보석, 뽑기 천장(캐릭터·무기), 고른 캐릭터, 가진 캐릭터의 레벨·별, 가진 무기의 재련, 장착. 휴대폰에서도 user:// 아래에 저장된다.

const PATH := "user://save.json"
const VERSION := 1
const STARTERS: Array[StringName] = [&"kemo1", &"kemo2", &"kemo3"]
## 아바타 화면에 보이는 순서(전체 캐릭터, ★3 → ★5)
const ROSTER: Array[StringName] = [&"kemo1", &"kemo2", &"kemo3", &"fairy3", &"fairy2", &"maid2", &"maid3", &"maid1", &"maid4", &"fairy1"]
const MAX_LEVEL := 60
const MAX_STARS := 6
const STAR_BONUS := 0.04  # 별 1개마다 공격력·체력 +4%
const WELCOME_GEMS := 500  # 처음 시작할 때 주는 보석

signal gold_changed(gold: int)
signal gems_changed(gems: int)
signal equip_changed

var gold := 0
var gems := WELCOME_GEMS
## ★5가 나온 뒤 지금까지 뽑은 횟수(천장 계산)
var pity := 0
## 무기 뽑기 천장
var pity_w := 0
## 테스트에서는 false로 두어 진짜 저장 파일을 건드리지 않는다
var persist := true

var selected: StringName = STARTERS[0]
## 캐릭터 id(문자열) → {"level": int, "stars": int}
var owned: Dictionary = {}
## 무기 id(문자열) → 재련 단계(0~5)
var weapons: Dictionary = {}
## 캐릭터 id(문자열) → 장착한 무기 id(문자열)
var equip: Dictionary = {}
## 퀘스트 진행 상태(Quests가 관리)
var quest: Dictionary = {}
var _cache: Dictionary[StringName, CharacterData] = {}


func _ready() -> void:
	load_game()
	# 시험용: 실행할 때 "-- --char=kemo2"를 붙이면 그 캐릭터로 시작
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--char="):
			selected = StringName(a.trim_prefix("--char="))


## 앱이 백그라운드로 가거나 닫힐 때도 저장(휴대폰은 언제든 꺼질 수 있다)
func _notification(what: int) -> void:
	if what == NOTIFICATION_APPLICATION_PAUSED or what == NOTIFICATION_WM_CLOSE_REQUEST:
		save_game()


func character(id: StringName) -> CharacterData:
	if not _cache.has(id):
		_cache[id] = load("res://data/characters/%s.tres" % id) as CharacterData
	return _cache[id]


func current() -> CharacterData:
	return character(selected)


func is_owned(id: StringName) -> bool:
	return owned.has(String(id))


func level_of(id: StringName) -> int:
	var entry: Dictionary = owned.get(String(id), {})
	return int(entry.get("level", 1))


func stars_of(id: StringName) -> int:
	var entry: Dictionary = owned.get(String(id), {})
	return int(entry.get("stars", 0))


## 레벨·별·장착 무기를 반영한 공격력
func atk_of(id: StringName, level := -1) -> int:
	var lv := level_of(id) if level < 0 else level
	return roundi(character(id).atk_at(lv) * (1.0 + STAR_BONUS * stars_of(id))) + weapon_atk(id)


## 장착 무기의 공격력(없으면 0)
func weapon_atk(id: StringName) -> int:
	var w := equipped(id)
	return 0 if w == &"" else Weapons.atk_of(w, refine_of(w))


## 기본 치명타 확률 + 장착 무기 보너스
func crit_of(id: StringName) -> float:
	var w := equipped(id)
	return 0.12 + (0.0 if w == &"" else Weapons.crit_of(w))


# ── 무기 ──

func has_weapon(w: StringName) -> bool:
	return weapons.has(String(w))


func refine_of(w: StringName) -> int:
	return int(weapons.get(String(w), 0))


func equipped(id: StringName) -> StringName:
	return StringName(str(equip.get(String(id), "")))


## 이 무기를 낀 캐릭터(없으면 빈 값)
func holder_of(w: StringName) -> StringName:
	for key: String in equip:
		if equip[key] == String(w):
			return StringName(key)
	return &""


## 무기를 장착한다. 다른 캐릭터가 끼고 있었으면 그 캐릭터에서 빼 온다.
func equip_weapon(id: StringName, w: StringName) -> void:
	if not has_weapon(w):
		return
	var other := holder_of(w)
	if other != &"":
		equip.erase(String(other))
	equip[String(id)] = String(w)
	equip_changed.emit()
	Quests.track("equip")
	save_game()


func unequip(id: StringName) -> void:
	equip.erase(String(id))
	equip_changed.emit()
	save_game()


## 뽑기로 얻은 무기: 처음이면 보유, 이미 있으면 재련 +1, 재련이 다 찼으면 "max".
func grant_weapon(w: StringName) -> String:
	var key := String(w)
	if not weapons.has(key):
		weapons[key] = 0
		return "new"
	if int(weapons[key]) < Weapons.MAX_REFINE:
		weapons[key] = int(weapons[key]) + 1
		return "refine"
	return "max"


func hp_of(id: StringName, level := -1) -> int:
	var lv := level_of(id) if level < 0 else level
	return roundi(character(id).hp_at(lv) * (1.0 + STAR_BONUS * stars_of(id)))


func level_up_cost(level: int) -> int:
	return 40 + level * 20


## 골드를 내고 레벨을 1 올린다. 성공하면 true.
func try_level_up(id: StringName) -> bool:
	var lv := level_of(id)
	var cost := level_up_cost(lv)
	if not is_owned(id) or lv >= MAX_LEVEL or gold < cost:
		return false
	gold -= cost
	owned[String(id)]["level"] = lv + 1
	gold_changed.emit(gold)
	Quests.track("levelup")
	Quests.track("level")
	save_game()
	return true


func add_gold(amount: int) -> void:
	gold += amount
	gold_changed.emit(gold)
	if amount > 0:
		Quests.track("gold", "", amount)


func add_gems(amount: int) -> void:
	gems += amount
	gems_changed.emit(gems)


## 보석을 낸다. 모자라면 false.
func spend_gems(amount: int) -> bool:
	if gems < amount:
		return false
	gems -= amount
	gems_changed.emit(gems)
	return true


## 뽑기로 얻은 캐릭터: 처음이면 보유, 이미 있으면 별 +1, 별이 다 찼으면 false.
func grant_character(id: StringName) -> String:
	var key := String(id)
	if not owned.has(key):
		owned[key] = {"level": 1, "stars": 0}
		return "new"
	if int(owned[key]["stars"]) < MAX_STARS:
		owned[key]["stars"] = int(owned[key]["stars"]) + 1
		return "star"
	return "max"


func select(id: StringName) -> void:
	if is_owned(id):
		selected = id
		save_game()


func load_game() -> void:
	owned = {}
	gold = 0
	gems = WELCOME_GEMS
	pity = 0
	pity_w = 0
	weapons = {}
	equip = {}
	quest = {}
	for id in STARTERS:
		owned[String(id)] = {"level": 1, "stars": 0}
	if FileAccess.file_exists(PATH):
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(PATH))
		if parsed is Dictionary:
			selected = StringName(str(parsed.get("selected", String(selected))))
			gold = int(parsed.get("gold", 0))
			gems = int(parsed.get("gems", WELCOME_GEMS))
			pity = int(parsed.get("pity", 0))
			pity_w = int(parsed.get("pity_w", 0))
			var ws: Variant = parsed.get("weapons", {})
			if ws is Dictionary:
				for key: String in ws:
					if Weapons.DATA.has(StringName(key)):
						weapons[key] = clampi(int(ws[key]), 0, Weapons.MAX_REFINE)
			var qs: Variant = parsed.get("quest", {})
			if qs is Dictionary:
				quest = qs
				for key in ["main", "progress"]:
					if quest.has(key):
						quest[key] = int(quest[key])
			var eq: Variant = parsed.get("equip", {})
			if eq is Dictionary:
				for key: String in eq:
					if weapons.has(str(eq[key])):
						equip[key] = str(eq[key])
			var saved: Variant = parsed.get("owned", {})
			if saved is Dictionary:
				for key: String in saved:
					var e: Variant = saved[key]
					if e is Dictionary:
						owned[key] = {"level": int(e.get("level", 1)), "stars": int(e.get("stars", 0))}
	if not owned.has(String(selected)):
		selected = STARTERS[0]
	# 무기가 하나도 없으면(새로 시작·예전 저장) 견습 기사의 검을 주고 첫 캐릭터에게 끼워 준다
	if weapons.is_empty():
		weapons[String(Weapons.STARTER)] = 0
		equip[String(selected)] = String(Weapons.STARTER)


func save_game() -> void:
	if not persist:
		return
	var f := FileAccess.open(PATH, FileAccess.WRITE)
	if f == null:
		push_error("저장 실패: %s" % error_string(FileAccess.get_open_error()))
		return
	f.store_string(JSON.stringify({"version": VERSION, "gold": gold, "gems": gems, "pity": pity, "pity_w": pity_w, "selected": String(selected), "owned": owned, "weapons": weapons, "equip": equip, "quest": quest}))
