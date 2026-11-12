class_name Achievements
extends RefCounted
## 업적: 오래 쌓이는 목표(처치 수·보스·레벨·별·도감…)를 채우면 보석을 받는다. 받은 것은 Save.ach_claimed.
## 진행도는 이미 있는 기록에서 바로 센다(따로 세는 것은 Save.stats: 던전·소환·승급).

## [id, 이름, 설명, 무엇을 세는지, 목표, 보석]
const DATA: Array = [
	["kill1", "첫 사냥꾼", "몬스터 100마리 물리치기", "kills", 100, 50],
	["kill2", "숙련 사냥꾼", "몬스터 1,000마리 물리치기", "kills", 1000, 150],
	["kill3", "전설의 사냥꾼", "몬스터 5,000마리 물리치기", "kills", 5000, 400],
	["kill4", "끝없는 사냥", "몬스터 20,000마리 물리치기", "kills", 20000, 1000],
	["boss1", "첫 보스", "보스 1마리 물리치기", "bosses", 1, 100],
	["boss2", "땅의 주인들", "보스 5마리 물리치기", "bosses", 5, 300],
	["boss3", "모든 주인을 잠재우다", "보스 11마리 물리치기", "bosses", 11, 1000],
	["lv1", "성장의 시작", "아무 캐릭터나 레벨 10", "level", 10, 50],
	["lv2", "든든한 용사", "아무 캐릭터나 레벨 50", "level", 50, 200],
	["lv3", "백전노장", "아무 캐릭터나 레벨 100", "level", 100, 500],
	["lv4", "한계를 넘어", "아무 캐릭터나 레벨 150", "level", 150, 1000],
	["chr1", "모이는 동료", "캐릭터 5명 모으기", "chars", 5, 100],
	["chr2", "모두 모였다", "캐릭터 11명 모두 모으기", "chars", 11, 500],
	["rank1", "첫 승급", "아무 캐릭터나 5성", "rank", 5, 200],
	["rank2", "붉은 별", "아무 캐릭터나 7성", "rank", 7, 1000],
	["gear1", "장비 수집가", "장비 8종 모으기", "gear", 8, 150],
	["gear2", "완벽한 무장", "장비 16종 모두 모으기", "gear", 16, 600],
	["pet1", "친구가 늘었다", "펫 5마리 모으기", "pets", 5, 100],
	["pet2", "동물의 왕", "펫 14마리 모두 모으기", "pets", 14, 600],
	["dex1", "도감 채우기", "몬스터 30종 발견", "dex", 30, 200],
	["dex2", "살아 있는 도감", "몬스터 78종 모두 발견", "dex", 78, 1000],
	["dun1", "투기장 단골", "일일 던전 5번 끝내기", "dungeon", 5, 100],
	["dun2", "투기장의 왕", "일일 던전 30번 끝내기", "dungeon", 30, 400],
	["pull1", "소환의 즐거움", "소환 10번 하기", "pulls", 10, 100],
	["pull2", "소환 장인", "소환 100번 하기", "pulls", 100, 500],
]


static func progress(stat: String) -> int:
	match stat:
		"kills":
			var n := 0
			for k: String in Save.dex:
				n += int(Save.dex[k])
			return n
		"bosses":
			return (Save.quest.get("bosses", {}) as Dictionary).size()
		"level":
			var best := 1
			for key: String in Save.owned:
				best = maxi(best, int(Save.owned[key].get("level", 1)))
			return best
		"chars":
			return Save.owned.size()
		"rank":
			var best := 0
			for key: String in Save.owned:
				best = maxi(best, Save.rank_of(StringName(key)))
			return best
		"gear":
			return Save.gear.size()
		"pets":
			return Save.pets.size()
		"dex":
			return Save.dex.size()
	return int(Save.stats.get(stat, 0))


static func is_done(a: Array) -> bool:
	return progress(a[3]) >= int(a[4])


static func is_claimed(a: Array) -> bool:
	return Save.ach_claimed.has(a[0])


## 받을 수 있는 업적 수(빨간 점)
static func claimable() -> int:
	var n := 0
	for a: Array in DATA:
		if is_done(a) and not is_claimed(a):
			n += 1
	return n


static func claim(a: Array) -> bool:
	if not is_done(a) or is_claimed(a):
		return false
	Save.ach_claimed[a[0]] = true
	Save.add_gems(int(a[5]))
	Save.save_game()
	return true
