extends Node
## 업적·우편함 확인(헤드리스): 진행도, 받기(한 번만), 우편 모두 받기.

var fails := 0


func _ready() -> void:
	Save.persist = false
	Save.dex = {}
	Save.ach_claimed = {}
	Save.mail_claimed = {}
	Save.stats = {}
	var kill1: Array = Achievements.DATA[0]
	_check("처음엔 첫 사냥꾼 미완료", not Achievements.is_done(kill1))
	Save.dex = {"slime": 80, "bat": 25}
	var gems := Save.gems
	_check("몬스터 105마리 → 첫 사냥꾼 달성, 보석 +%d" % int(kill1[5]), Achievements.is_done(kill1) and Achievements.claim(kill1) and Save.gems == gems + maxi(1, roundi(int(kill1[5]) * 0.5)))
	_check("두 번은 못 받는다", not Achievements.claim(kill1))
	Save.add_stat("pulls", 10)
	var pull1: Array = []
	for a: Array in Achievements.DATA:
		if a[0] == "pull1":
			pull1 = a
	_check("소환 10번 업적", Achievements.is_done(pull1))
	# 우편
	var n := Mail.unread()
	_check("안 받은 우편 %d통" % n, n == Mail.LIST.size())
	var g := Save.gold
	_check("우편 받기 → 골드·아이템", Mail.claim(Mail.LIST[0]) and Save.gold > g and Mail.unread() == n - 1)
	_check("받은 우편은 다시 못 받음", not Mail.claim(Mail.LIST[0]))
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit()


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
