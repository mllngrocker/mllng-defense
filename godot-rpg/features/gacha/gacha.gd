class_name Gacha
extends RefCounted
## 뽑기 규칙: 등급 확률(★5 1% · ★4 9% · ★3 90%), 10회 뽑기는 ★4 이상 1개 확정,
## ★5가 50번 안 나오면 50번째에 확정(천장). 같은 캐릭터면 별 +1, 별이 다 찼으면 골드로 바꿔 준다.
## 무기 뽑기(pull_weapons)도 확률·확정·천장 규칙은 같고 천장은 따로 센다(Save.pity_w). 같은 무기면 재련 +1.

const COST_ONE := 50
const COST_TEN := 450
const RATE_5 := 0.01
const RATE_4 := 0.09
const PITY_5 := 100
const MAXED_GOLD: Dictionary[int, int] = {3: 300, 4: 800, 5: 2000}


static func pool(rarity: int) -> Array[StringName]:
	var out: Array[StringName] = []
	for id in Save.ROSTER:
		if Save.character(id).rarity == rarity:
			out.append(id)
	return out


## count번 뽑는다(보석은 미리 낸 상태여야 함). 결과마다 {id, rarity, result("new"/"shard"/"max"), stars, shards, gold}
static func pull(count: int, rng: RandomNumberGenerator) -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	var got_4 := false
	for i in count:
		var force_4 := count >= 10 and i == count - 1 and not got_4
		var rarity := _roll_rarity(rng, force_4)
		if rarity >= 4:
			got_4 = true
		Save.pity = 0 if rarity == 5 else Save.pity + 1
		var ids := pool(rarity)
		var id := ids[rng.randi() % ids.size()]
		var result := Save.grant_character(id)
		var gold := 0
		if result == "max":
			gold = MAXED_GOLD[rarity]
			Save.add_gold(gold)
		results.append({"id": id, "rarity": rarity, "result": result, "stars": Save.stars_of(id), "shards": Save.shards_per_dup(id), "gold": gold})
	Quests.track("pull", "", count)
	Save.add_stat("pulls", count)
	Save.save_game()
	return results


## 무기 count번 뽑기. 결과마다 {weapon, rarity, result("new"/"refine"/"max"), refine, gold}
static func pull_weapons(count: int, rng: RandomNumberGenerator) -> Array[Dictionary]:
	var results: Array[Dictionary] = []
	var got_4 := false
	for i in count:
		var force_4 := count >= 10 and i == count - 1 and not got_4
		var rarity := _roll_rarity(rng, force_4, Save.pity_w)
		if rarity >= 4:
			got_4 = true
		Save.pity_w = 0 if rarity == 5 else Save.pity_w + 1
		var ids := Weapons.pool(rarity)
		var w := ids[rng.randi() % ids.size()]
		var result := Save.grant_weapon(w)
		var gold := 0
		if result == "max":
			gold = MAXED_GOLD[rarity]
			Save.add_gold(gold)
		results.append({"weapon": w, "rarity": rarity, "result": result, "refine": Save.refine_of(w), "gold": gold})
	Quests.track("pull", "", count)
	Save.add_stat("pulls", count)
	Save.save_game()
	return results


static func _roll_rarity(rng: RandomNumberGenerator, force_4: bool, pity := -1) -> int:
	if (Save.pity if pity < 0 else pity) >= PITY_5 - 1:
		return 5
	var r := rng.randf()
	if r < RATE_5:
		return 5
	if r < RATE_5 + RATE_4 or force_4:
		return 4
	return 3
