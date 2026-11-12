class_name Mail
extends RefCounted
## 우편함: 업데이트·점검 보상을 여기 적어 두면, 다음에 게임을 켠 모든 사람이 한 번씩 받는다(받은 것은 Save.mail_claimed).
## 새 보상을 주려면 맨 위에 한 줄 추가하고 빌드·배포하면 된다. id는 겹치지 않게.

## {id, 날짜, 제목, 내용, 보상: {gold, gems, items: {id: 수}, books: [트레이닝, 마스터]}}
const LIST: Array = [
	{"id": "u_2026_11_12", "date": "2026.11.12", "title": "업데이트 기념 선물", "body": "방치 보상·일일 던전·도감·업적·우편함이 생겼어요! 새 기능 기념 선물이에요.",
		"gold": 20000, "gems": 300, "items": {"stone": 30, "potion": 5}, "books": [2, 0]},
	{"id": "m_2026_11_12", "date": "2026.11.12", "title": "점검 보상", "body": "별 조각 승급으로 바뀐 것에 대한 사과 보상이에요. 조각을 모아 직접 승급해 주세요!",
		"gold": 0, "gems": 200, "items": {"return_scroll": 3}, "books": [0, 0]},
	{"id": "w_welcome", "date": "2026.11.01", "title": "용사님, 환영해요!", "body": "레몬 마을에 온 걸 환영해요. 모험에 도움이 될 작은 선물이에요.",
		"gold": 3000, "gems": 100, "items": {"potion": 3}, "books": [1, 0]},
]


static func unread() -> int:
	var n := 0
	for m: Dictionary in LIST:
		if not Save.mail_claimed.has(m["id"]):
			n += 1
	return n


static func reward_text(m: Dictionary) -> String:
	var parts: Array[String] = []
	if int(m["gold"]) > 0:
		parts.append("골드 %d" % int(m["gold"]))
	if int(m["gems"]) > 0:
		parts.append("보석 %d" % int(m["gems"]))
	for k: String in m["items"]:
		parts.append("%s %d" % [Items.name_of(StringName(k)), int(m["items"][k])])
	var b: Array = m["books"]
	if int(b[0]) > 0:
		parts.append("트레이닝 북 %d" % int(b[0]))
	if int(b[1]) > 0:
		parts.append("마스터 북 %d" % int(b[1]))
	return " · ".join(parts)


static func claim(m: Dictionary) -> bool:
	if Save.mail_claimed.has(m["id"]):
		return false
	Save.mail_claimed[m["id"]] = true
	Save.add_gold(int(m["gold"]))
	Save.add_gems(int(m["gems"]))
	for k: String in m["items"]:
		Save.give_item(StringName(k), int(m["items"][k]))
	var b: Array = m["books"]
	if int(b[0]) > 0 or int(b[1]) > 0:
		Save.give_books(int(b[0]), int(b[1]))
	Save.save_game()
	return true
