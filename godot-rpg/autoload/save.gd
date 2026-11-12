extends Node
## 진행 상황 저장: 골드·보석, 뽑기 천장(캐릭터·무기), 고른 캐릭터, 가진 캐릭터의 레벨·별, 가진 무기의 재련, 장착. 휴대폰에서도 user:// 아래에 저장된다.

const PATH := "user://save.json"
const VERSION := 1
const STARTERS: Array[StringName] = [&"kemo1", &"kemo2", &"kemo3"]
## 아바타 화면에 보이는 순서(전체 캐릭터, ★3 → ★5)
const ROSTER: Array[StringName] = [&"kemo1", &"kemo2", &"kemo3", &"fairy3", &"fairy2", &"maid2", &"maid3", &"maid1", &"maid4", &"fairy1", &"scarlet"]
const MAX_LEVEL := 150  # 2부에서 100 → 150
const MAX_STARS := 6  # 성장 효과 줄 수(별 승급으로 차례로 열린다)
## 별 등급: 타고난 등급(★3~5)에 중복으로 얻은 별을 더한다. 최대 7성(큰 빨간 별 하나로 보인다)
const MAX_RANK := 7
const STAR_BONUS := 0.08  # 승급한 별 1개마다 공격력·체력 +8%
## 별 조각: 같은 캐릭터를 또 뽑으면 조각 10개. 조각을 모아 로비에서 직접 승급
const SHARDS_PER_DUP := {3: 10, 4: 10, 5: 10}
## 그 별 등급으로 올리는 데 드는 조각(높을수록 비싸다): 4성 10 · 5성 20 · 6성 30 · 7성 50
const PROMOTE_COST := {4: 10, 5: 20, 6: 30, 7: 50}
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
## 캐릭터 id(문자열) → {"level": int, "stars": 승급한 별 수, "shards": 별 조각}
var owned: Dictionary = {}
## 무기 id(문자열) → 재련 단계(0~5)
var weapons: Dictionary = {}
## 캐릭터 id(문자열) → 장착한 무기 id(문자열)
var equip: Dictionary = {}
## 퀘스트 진행 상태(Quests가 관리)
var quest: Dictionary = {}
## 무기 강화 단계 {무기 id: 단계}
var wlevel: Dictionary = {}
## 가진 펫 {펫 id: true}, 데리고 다니는 펫
var pets: Dictionary = {}
var pet := ""
## 스킬 트리 {캐릭터: {노드: 레벨}}, 트레이닝 북으로 받은 추가 포인트 {캐릭터: 수}, 마스터 북 봉인 해제 {캐릭터: true}
var skill_lv: Dictionary = {}
var skill_bonus: Dictionary = {}
var master: Dictionary = {}
## 설정: 배경음·효과음 크기(0~1), 화면 흔들림, 데미지 숫자
var settings: Dictionary = {"bgm": 0.8, "sfx": 0.9, "shake": true}
## 가진 책 {"training": 수, "master": 수}
var books: Dictionary = {"training": 0, "master": 0}
## 가방 아이템 {id: 수}(Items.DATA). 처음엔 귀환서 3·물약 5
const START_ITEMS := {"return_scroll": 3, "potion": 5}
var items: Dictionary = START_ITEMS.duplicate()
## 가진 장비 {id: 재련 수}(Gear.DATA), 캐릭터별 낀 장비 {캐릭터: {부위: id}}
var gear: Dictionary = {}
var gear_equip: Dictionary = {}
## 로비로 나가기 전 있던 곳 {"map": 장면 경로, "x", "y"} — 모험을 누르면 여기서 다시 시작
var place: Dictionary = {}
## 마지막으로 저장한 때(유닉스 초) · 이번에 켜기 전까지 비운 시간(초, 방치 보상용)
var last_seen := 0
var away_seconds := 0
## 도감: 몬스터 종류별 처치 수 {kind: 수}
var dex: Dictionary = {}
## 업적용 기록 {dungeon, pulls, promote} · 받은 업적 {id: true} · 받은 우편 {id: true}
var stats: Dictionary = {}
var ach_claimed: Dictionary = {}
var mail_claimed: Dictionary = {}
## 마지막으로 들른 마을(귀환서가 데려가는 곳)
var last_town := "village"
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


## 중복으로 얻어 올린 별 수(0 ~ max_stars)
func stars_of(id: StringName) -> int:
	var entry: Dictionary = owned.get(String(id), {})
	return mini(int(entry.get("stars", 0)), max_stars(id))


## 이 캐릭터가 더 올릴 수 있는 별 수(★3은 4번, ★5는 2번이면 7성)
func max_stars(id: StringName) -> int:
	return MAX_RANK - character(id).rarity


## 지금 별 등급(타고난 등급 + 올린 별). 미보유면 타고난 등급
func rank_of(id: StringName) -> int:
	return character(id).rarity + (stars_of(id) if is_owned(id) else 0)


## 열린 성장 효과 수(6줄): 7성이면 모두, 그 전엔 올린 별에 비례
func passives_unlocked(id: StringName) -> int:
	var m := max_stars(id)
	var s := stars_of(id)
	return MAX_STARS if s >= m else floori(MAX_STARS * s / float(m))


## 레벨·별·장착 무기를 반영한 공격력
func atk_of(id: StringName, level := -1) -> int:
	var lv := level_of(id) if level < 0 else level
	return roundi((character(id).atk_at(lv) * (1.0 + STAR_BONUS * stars_of(id)) + weapon_atk(id)) * (1.0 + pet_bonus("atk")) * (1.0 + gear_bonus(id, "atk")) * (1.0 + dex_bonus("atk") + Skins.bonus(id, "atk")) * (1.0 + 0.02 * skill_level(id, "p1")))


## 장착 무기의 공격력(없으면 0)
func weapon_atk(id: StringName) -> int:
	var w := equipped(id)
	return 0 if w == &"" else Weapons.atk_of(w, refine_of(w), enhance_of(w))


## 기본 치명타 확률 + 장착 무기 보너스
func crit_of(id: StringName) -> float:
	var w := equipped(id)
	return 0.12 + (0.0 if w == &"" else Weapons.crit_of(w)) + pet_bonus("crit") + gear_bonus(id, "crit") + Skins.bonus(id, "crit") + 0.01 * skill_level(id, "p3")


# ── 무기 ──

func enhance_of(w: StringName) -> int:
	return int(wlevel.get(String(w), 0))


## 골드로 무기를 1단계 강화한다. 성공하면 true.
func try_enhance(w: StringName) -> bool:
	var lv := enhance_of(w)
	var cost := Weapons.enhance_cost(lv)
	if not has_weapon(w) or lv >= Weapons.MAX_ENHANCE or gold < cost:
		return false
	gold -= cost
	wlevel[String(w)] = lv + 1
	gold_changed.emit(gold)
	equip_changed.emit()
	save_game()
	return true


# ── 스킬 트리 ──

func skill_level(id: StringName, node: String) -> int:
	var d: Dictionary = skill_lv.get(String(id), {})
	return int(d.get(node, 1 if node == "a1" else 0))


func skill_cap(id: StringName) -> int:
	return SkillTree.MASTER_LV if master.has(String(id)) else SkillTree.MAX_LV


## 남은 스킬 포인트 = (레벨 - 1) + 트레이닝 북 - 쓴 포인트(고유기 첫 1레벨은 공짜)
func skill_points(id: StringName) -> int:
	var spent := 0
	var d: Dictionary = skill_lv.get(String(id), {})
	for k: String in d:
		spent += int(d[k]) - (1 if k == "a1" else 0)
	return level_of(id) - 1 + int(skill_bonus.get(String(id), 0)) - spent


## 이 노드를 올릴 수 있는지(안 되면 이유 문자열)
func skill_block(id: StringName, node: String) -> String:
	if not is_owned(id):
		return "미보유 캐릭터"
	var lv := skill_level(id, node)
	if node == "a3" and not master.has(String(id)):
		return "마스터 북으로 봉인을 풀어야 해요"
	if lv >= skill_cap(id):
		return "최대 레벨" if lv >= SkillTree.MASTER_LV else "마스터 북으로 상한을 10까지 올릴 수 있어요"
	var req := SkillTree.requires(node)
	if req[0] != "" and skill_level(id, req[0]) < int(req[1]):
		return "%s Lv.%d 필요" % [SkillTree.info(id, req[0])["name"], req[1]]
	if skill_points(id) <= 0:
		return "스킬 포인트가 없어요"
	return ""


func learn_skill(id: StringName, node: String) -> bool:
	if skill_block(id, node) != "":
		return false
	var d: Dictionary = skill_lv.get(String(id), {})
	d[node] = skill_level(id, node) + 1
	skill_lv[String(id)] = d
	equip_changed.emit()
	Quests.track("skillup")
	save_game()
	return true


func use_training_book(id: StringName) -> bool:
	if int(books.get("training", 0)) <= 0 or not is_owned(id):
		return false
	books["training"] = int(books["training"]) - 1
	skill_bonus[String(id)] = int(skill_bonus.get(String(id), 0)) + 1
	equip_changed.emit()
	save_game()
	return true


func use_master_book(id: StringName) -> bool:
	if int(books.get("master", 0)) <= 0 or master.has(String(id)) or not is_owned(id):
		return false
	books["master"] = int(books["master"]) - 1
	master[String(id)] = true
	equip_changed.emit()
	save_game()
	return true


func buy_book(kind: String) -> bool:
	var cost := SkillTree.TRAINING_GEMS if kind == "training" else SkillTree.MASTER_GEMS
	if not spend_gems(cost):
		return false
	books[kind] = int(books.get(kind, 0)) + 1
	save_game()
	return true


func give_books(training: int, master_books := 0) -> void:
	books["training"] = int(books.get("training", 0)) + training
	books["master"] = int(books.get("master", 0)) + master_books
	save_game()


## 스킬 초기화: 쓴 포인트를 모두 돌려준다(골드 1,000 × 레벨)
func reset_skills(id: StringName) -> bool:
	var cost := 1000 * level_of(id)
	if gold < cost:
		return false
	gold -= cost
	gold_changed.emit(gold)
	skill_lv.erase(String(id))
	equip_changed.emit()
	save_game()
	return true


# ── 펫 ──

func has_pet(p: StringName) -> bool:
	return pets.has(String(p))


## 데리고 다니는 펫의 보너스(atk·hp·crit·gold)
func pet_bonus(kind: String) -> float:
	if pet == "" or not Pets.DATA.has(StringName(pet)):
		return 0.0
	return float(Pets.bonus_of(StringName(pet)).get(kind, 0.0))


## 펫을 준다(처음이면 알림, 데리고 다니는 펫이 없으면 바로 데리고 다닌다)
func grant_pet(p: StringName) -> void:
	if has_pet(p):
		return
	pets[String(p)] = true
	if pet == "":
		pet = String(p)
	Events.notice.emit("새 펫: %s!" % Pets.name_of(p), Pets.bonus_text(p) + " · 로비 아바타의 펫 칸에서 바꿀 수 있어요")
	equip_changed.emit()
	save_game()


func choose_pet(p: StringName) -> void:
	pet = "" if pet == String(p) else String(p)
	equip_changed.emit()
	save_game()


## 보스를 처음 잡았을 때: 펫 + 보스 무기
func boss_reward(boss: String) -> void:
	if not Pets.BOSS_REWARDS.has(boss):
		return
	var r: Array = Pets.BOSS_REWARDS[boss]
	var w: StringName = r[1]
	if not has_weapon(w):
		weapons[String(w)] = 0
		Events.notice.emit.call_deferred("보스 무기: %s!" % Weapons.name_of(w), "공격력 +%d · 로비 아바타의 무기 칸에서 장착하세요" % Weapons.atk_of(w, 0))
	grant_pet.call_deferred(r[0])
	give_books(3, 1)
	for k: StringName in Items.BOSS_DROP:
		give_item(k, int(Items.BOSS_DROP[k]))
	Events.notice.emit.call_deferred("스킬 책 획득!", "트레이닝 북 3권 · 마스터 북 1권 — 아바타의 스킬 칸에서 쓰세요")


# ── 장비(옷·신발·목걸이·반지) ──

func has_gear(id: StringName) -> bool:
	return gear.has(String(id))


func gear_refine(id: StringName) -> int:
	return int(gear.get(String(id), 0))


## 장비 얻기: 처음이면 "new", 또 얻으면 재련 +1 "up", 다 찼으면 골드로 "max"
func give_gear(id: StringName) -> String:
	if not has_gear(id):
		gear[String(id)] = 0
		return "new"
	if gear_refine(id) < Gear.MAX_REFINE:
		gear[String(id)] = gear_refine(id) + 1
		equip_changed.emit()
		return "up"
	add_gold(Gear.MAXED_GOLD[Gear.grade_of(id)])
	return "max"


## 이 캐릭터가 그 부위에 낀 장비(없으면 빈 값)
func gear_on(char_id: StringName, slot: String) -> StringName:
	var d: Variant = gear_equip.get(String(char_id), {})
	return StringName(str((d as Dictionary).get(slot, ""))) if d is Dictionary else &""


func gear_holder(id: StringName) -> StringName:
	var slot := Gear.slot_of(id)
	for key: String in gear_equip:
		if gear_on(StringName(key), slot) == id:
			return StringName(key)
	return &""


## 장착(다른 캐릭터가 끼고 있으면 못 낀다 — 그 캐릭터에서 먼저 해제)
func equip_gear(char_id: StringName, id: StringName) -> void:
	if not has_gear(id):
		return
	var slot := Gear.slot_of(id)
	var other := gear_holder(id)
	if other != &"" and other != char_id:
		return
	if not gear_equip.has(String(char_id)):
		gear_equip[String(char_id)] = {}
	(gear_equip[String(char_id)] as Dictionary)[slot] = String(id)
	equip_changed.emit()


func unequip_gear(char_id: StringName, slot: String) -> void:
	if gear_equip.has(String(char_id)):
		(gear_equip[String(char_id)] as Dictionary).erase(slot)
		equip_changed.emit()


## 이 캐릭터가 무기나 장비를 하나라도 끼고 있는지
func has_equipment(char_id: StringName) -> bool:
	if equipped(char_id) != &"":
		return true
	for slot in Gear.SLOTS:
		if gear_on(char_id, slot) != &"":
			return true
	return false


## 두 캐릭터의 무기·장비를 통째로 맞바꾼다(출전 캐릭터를 바꿀 때 "장비 옮기기")
func swap_equipment(a: StringName, b: StringName) -> void:
	var ka := String(a)
	var kb := String(b)
	var wa: Variant = equip.get(ka)
	var wb: Variant = equip.get(kb)
	equip.erase(ka)
	equip.erase(kb)
	if wa != null:
		equip[kb] = wa
	if wb != null:
		equip[ka] = wb
	var ga: Variant = gear_equip.get(ka, {})
	var gb: Variant = gear_equip.get(kb, {})
	gear_equip[ka] = gb
	gear_equip[kb] = ga
	equip_changed.emit()
	save_game()


## 분해: 강화석을 받고 장비가 사라진다(누가 끼고 있으면 못 한다). 받은 강화석 수(실패면 0)
func dismantle_gear(id: StringName) -> int:
	if not has_gear(id) or gear_holder(id) != &"":
		return 0
	var n := Gear.STONES_FROM[Gear.grade_of(id)] * (1 + gear_refine(id))
	gear.erase(String(id))
	give_item(&"stone", n)
	return n


func upgrade_cost(id: StringName) -> int:
	return Gear.UPGRADE_COST[Gear.grade_of(id)] * (gear_refine(id) + 1)


## 강화석으로 재련 +1
func upgrade_gear(id: StringName) -> bool:
	if not has_gear(id) or gear_refine(id) >= Gear.MAX_REFINE or item_count(&"stone") < upgrade_cost(id):
		return false
	items["stone"] = item_count(&"stone") - upgrade_cost(id)
	gear[String(id)] = gear_refine(id) + 1
	equip_changed.emit()
	return true


## 합성 재료로 쓸 수 있는 같은 등급 장비 개수(아무도 안 낀 것, 재련 +1도 하나로 센다)
func synth_material(grade: int) -> int:
	var n := 0
	for k: String in gear:
		var g := StringName(k)
		if Gear.grade_of(g) == grade and gear_holder(g) == &"":
			n += 1 + gear_refine(g)
	return n


## 합성: 고른 장비부터 같은 등급 3개를 써서 한 등급 위 장비를 하나 얻는다. 얻은 장비 id(실패면 빈 값)
func synth_gear(id: StringName) -> StringName:
	var grade := Gear.grade_of(id)
	if not has_gear(id) or gear_holder(id) != &"" or grade >= 4 or synth_material(grade) < Gear.SYNTH_NEED:
		return &""
	var need := Gear.SYNTH_NEED
	var order: Array[StringName] = [id]
	for k: String in gear:
		var g := StringName(k)
		if g != id and Gear.grade_of(g) == grade and gear_holder(g) == &"":
			order.append(g)
	for g in order:
		while need > 0 and has_gear(g):
			if gear_refine(g) > 0:
				gear[String(g)] = gear_refine(g) - 1
			else:
				gear.erase(String(g))
			need -= 1
	var pool := Gear.ids().filter(func(x: StringName) -> bool: return Gear.grade_of(x) == grade + 1)
	var got: StringName = pool[randi() % pool.size()]
	give_gear(got)
	equip_changed.emit()
	return got


## 낀 장비 네 부위의 효과 합(stat: hp·atk·crit·speed·gold)
func gear_bonus(char_id: StringName, stat: String) -> float:
	var total := 0.0
	for slot in Gear.SLOTS:
		var g := gear_on(char_id, slot)
		if g != &"" and Gear.DATA.has(g):
			total += float(Gear.stats_of(g, gear_refine(g)).get(stat, 0.0))
	return total


# ── 도감 ──

func add_stat(key: String, n := 1) -> void:
	stats[key] = int(stats.get(key, 0)) + n


func record_kill(kind: String) -> void:
	dex[kind] = int(dex.get(kind, 0)) + 1


## 도감 보너스: 발견한 몬스터 1종마다 공격력 +0.3%, 모은 장비 1종마다 체력 +0.5%
func dex_bonus(stat: String) -> float:
	match stat:
		"atk":
			return 0.003 * dex.size()
		"hp":
			return 0.005 * gear.size()
	return 0.0


func item_count(id: StringName) -> int:
	return int(items.get(String(id), 0))


func give_item(id: StringName, n := 1) -> void:
	items[String(id)] = item_count(id) + n


## 하나 쓰기(없으면 false)
func use_item(id: StringName) -> bool:
	if item_count(id) <= 0:
		return false
	items[String(id)] = item_count(id) - 1
	return true


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
	if other != &"" and other != id:
		return  # 다른 캐릭터가 끼고 있으면 못 낀다(그 캐릭터에서 먼저 해제)
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
	return roundi(character(id).hp_at(lv) * (1.0 + STAR_BONUS * stars_of(id)) * (1.0 + pet_bonus("hp")) * (1.0 + gear_bonus(id, "hp")) * (1.0 + dex_bonus("hp") + Skins.bonus(id, "hp")) * (1.0 + 0.03 * skill_level(id, "p2")))


func level_up_cost(level: int) -> int:
	return 30 + level * 12 + roundi(level * level * 1.6)  # 레벨마다 몬스터 약 60~90마리(예전 100마리 남짓)


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
	if amount > 0:
		amount = roundi(amount * (1.0 + pet_bonus("gold") + gear_bonus(selected, "gold")))
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


## 뽑기로 얻은 캐릭터: 처음이면 보유("new"), 이미 있으면 별 조각("shard"), 7성이면 골드로("max").
func grant_character(id: StringName) -> String:
	var key := String(id)
	if not owned.has(key):
		owned[key] = {"level": 1, "stars": 0, "shards": 0}
		return "new"
	if rank_of(id) < MAX_RANK:
		owned[key]["shards"] = shards_of(id) + shards_per_dup(id)
		return "shard"
	return "max"


func shards_of(id: StringName) -> int:
	return int((owned.get(String(id), {}) as Dictionary).get("shards", 0))


func shards_per_dup(id: StringName) -> int:
	return int(SHARDS_PER_DUP.get(character(id).rarity, 10))


## 다음 별로 올리는 데 드는 조각(7성이면 0)
func promote_cost(id: StringName) -> int:
	var next := rank_of(id) + 1
	return int(PROMOTE_COST.get(next, 0)) if next <= MAX_RANK else 0


func can_promote(id: StringName) -> bool:
	return is_owned(id) and rank_of(id) < MAX_RANK and shards_of(id) >= promote_cost(id)


## 조각을 내고 별 +1
func promote(id: StringName) -> bool:
	if not can_promote(id):
		return false
	var e: Dictionary = owned[String(id)]
	e["shards"] = shards_of(id) - promote_cost(id)
	e["stars"] = stars_of(id) + 1
	add_stat("promote")
	equip_changed.emit()
	save_game()
	return true


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
	wlevel = {}
	pets = {}
	pet = ""
	skill_lv = {}
	skill_bonus = {}
	master = {}
	items = START_ITEMS.duplicate()
	dex = {}
	stats = {}
	ach_claimed = {}
	mail_claimed = {}
	last_seen = 0
	away_seconds = 0
	gear = {}
	gear_equip = {}
	place = {}
	last_town = "village"
	books = {"training": 0, "master": 0}
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
			var wl: Variant = parsed.get("wlevel", {})
			if wl is Dictionary:
				for key: String in wl:
					wlevel[key] = clampi(int(wl[key]), 0, Weapons.MAX_ENHANCE)
			var ps: Variant = parsed.get("pets", {})
			if ps is Dictionary:
				for key: String in ps:
					if Pets.DATA.has(StringName(key)):
						pets[key] = true
			pet = str(parsed.get("pet", ""))
			if not pets.has(pet):
				pet = ""
			for key in ["skill_lv", "skill_bonus", "master"]:
				var v: Variant = parsed.get(key, {})
				if v is Dictionary:
					set(key, v)
			var st: Variant = parsed.get("settings", {})
			if st is Dictionary:
				for k: String in st:
					settings[k] = st[k]
			var it: Variant = parsed.get("items", null)
			if it is Dictionary:
				items = {}
				for k: String in it:
					items[k] = int(it[k])
			var gr: Variant = parsed.get("gear", {})
			if gr is Dictionary:
				for k: String in gr:
					if Gear.DATA.has(StringName(k)):
						gear[k] = int(gr[k])
			var ge: Variant = parsed.get("gear_equip", {})
			if ge is Dictionary:
				gear_equip = ge
			var pl: Variant = parsed.get("place", {})
			if pl is Dictionary:
				place = pl
			last_town = str(parsed.get("last_town", "village"))
			last_seen = int(parsed.get("last_seen", 0))
			if last_seen > 0:
				away_seconds = maxi(0, int(Time.get_unix_time_from_system()) - last_seen)
			for key in ["stats", "ach_claimed", "mail_claimed"]:
				var v2: Variant = parsed.get(key, {})
				if v2 is Dictionary:
					set(key, v2)
			var dx: Variant = parsed.get("dex", {})
			if dx is Dictionary:
				for k: String in dx:
					dex[k] = int(dx[k])
			var bk: Variant = parsed.get("books", {})
			if bk is Dictionary:
				books = {"training": int(bk.get("training", 0)), "master": int(bk.get("master", 0))}
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
						owned[key] = {"level": int(e.get("level", 1)), "stars": int(e.get("stars", 0)), "shards": int(e.get("shards", 0))}
						if not e.has("shards"):
							# 예전 저장(중복마다 바로 별 +1): 올린 별을 조각으로 돌려준다 → 모아서 직접 승급
							var old := int(e.get("stars", 0))
							owned[key]["stars"] = 0
							owned[key]["shards"] = old * int(SHARDS_PER_DUP.get(character(StringName(key)).rarity, 10))
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
	f.store_string(JSON.stringify({"version": VERSION, "gold": gold, "gems": gems, "pity": pity, "pity_w": pity_w, "selected": String(selected), "owned": owned, "weapons": weapons, "equip": equip, "quest": quest, "wlevel": wlevel, "pets": pets, "pet": pet, "skill_lv": skill_lv, "skill_bonus": skill_bonus, "master": master, "books": books, "settings": settings, "items": items, "gear": gear, "gear_equip": gear_equip, "place": place, "last_town": last_town, "last_seen": int(Time.get_unix_time_from_system()), "dex": dex, "stats": stats, "ach_claimed": ach_claimed, "mail_claimed": mail_claimed}))
