extends Node
## 9장 보스 난이도 숫자 확인(진짜 저장 안 건드림): 추천 레벨 용사(장비·펫 보정 포함 어림)가
## 기술 한 대에 체력 몇 % 잃는지, 평타·스킬로 잡는 데 몇 초 걸리는지.
## 실행: godot --headless --path godot-rpg --script res://tools/boss_balance.tscn

const BOSSES := [["demon_lord", 60], ["storm_king", 110], ["giant_soul", 150], ["meteor_golem", 155], ["star_heart", 163], ["star_eater", 171], ["void_mage", 176], ["star_lich", 180]]
const GEAR_HP := 1.9  # 장비·펫·도감·별 보정 어림(체력)
const GEAR_ATK := 2.6  # (공격력: 무기 공격력 포함)
const HITS_PER_SEC := 1.6  # 평타 + 스킬을 섞은 초당 타수 어림


func _ready() -> void:
	var cd := load("res://data/characters/kemo1.tres") as CharacterData
	print("보스            Lv  용사HP   용사공격  보스HP      평타   빔    운석  충격파 내려치기 | 잡는시간")
	for b: Array in BOSSES:
		var lv: int = b[1]
		var hp := roundi(cd.hp_at(lv) * GEAR_HP)
		var atk := roundi(cd.atk_at(lv) * GEAR_ATK)
		var e := (load("res://features/enemy/%s.tscn" % b[0]) as PackedScene).instantiate()
		var bhp := roundi(int(e.get(&"max_hp")) * Enemy.HP_MULT * Boss.BOSS_HP_MULT)
		var dmg := roundi(int(e.get(&"damage")) * Enemy.DMG_MULT)
		var slam := roundi(int(e.get(&"slam_damage")) * Enemy.DMG_MULT)
		var pct := func(v: float) -> String: return "%3d%%" % roundi(v / hp * 100.0)
		print("%-14s %3d %7d %8d %10d   %s  %s  %s  %s   %s  | %5.0f초" % [b[0], lv, hp, atk, bhp, pct.call(dmg), pct.call(dmg * 1.7), pct.call(dmg * 1.3), pct.call(dmg * 1.4), pct.call(slam), bhp / (atk * HITS_PER_SEC)])
		e.free()
	get_tree().quit()
