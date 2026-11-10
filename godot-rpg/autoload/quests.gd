extends Node
## 퀘스트: 메인 이야기(순서대로 하나씩), 일일 퀘스트(날마다 초기화), 출석.
## 게임 곳곳에서 track("종류", "대상", 양)을 부르면 진행도가 오른다. 상태는 Save.quest에 저장된다.
## 종류: talk(마을 사람 이름), reach(맵 id), kill(몬스터 id / "desert" / ""=아무거나), boss(보스 id),
##       pull(소환 횟수), equip(무기 장착), level(최고 레벨), levelup(레벨 업 횟수), skill(스킬 사용), gold(얻은 골드), login

signal changed
signal completed(title: String)

const DESERT_KINDS: Array[String] = ["snake", "lizard", "mole", "eye", "cyclope", "cyclope_king"]  # 폐허의 해골·유령은 숲 몬스터라 안 셈
## 지역별 몬스터(처치 퀘스트 대상 "snow"·"temple"·"lava"·"hell"·"south")
const REGION_KINDS := {
	"desert": DESERT_KINDS,
	"south": ["kappa", "lantern", "rat", "spider", "bluebat", "axolot", "butterfly", "octopus", "racoon", "spider_queen"],
	"snow": ["panda", "bear", "ice_skull", "frost_spirit", "snow_bat", "snow_mouse", "yeti_king"],
	"temple": ["blue_axolot", "deep_octopus", "green_octopus", "red_octopus", "jump_fish", "kappa_red", "kraken"],
	"lava": ["flam", "flam2", "dragon", "dragon_y", "trex", "grey_trex", "heart_red", "flame_dragon"],
	"hell": ["lantern_red", "demon_eye", "skull", "dragon", "grey_trex", "demon_lord"],
}

const MAIN: Array[Dictionary] = [
	{"title": "촌장에게 인사하기", "desc": "마을 광장에 있는 촌장에게 가까이 가서 이야기를 듣자.", "type": "talk", "target": "촌장", "count": 1, "gold": 100, "gems": 30},
	{"title": "초원으로!", "desc": "마을 동쪽 끝의 빛나는 문으로 나가 초록 초원에 가 보자.", "type": "reach", "target": "field", "count": 1, "gold": 100, "gems": 0},
	{"title": "슬라임 퇴치", "desc": "초록 초원에서 통통 튀는 슬라임을 5마리 물리치자.", "type": "kill", "target": "slime", "count": 5, "gold": 200, "gems": 30},
	{"title": "새 동료 부르기", "desc": "로비의 상점 탭에서 소환을 1번 해 보자.", "type": "pull", "target": "", "count": 1, "gold": 0, "gems": 100},
	{"title": "무기 장착하기", "desc": "아바타 탭의 무기 칸을 눌러 무기를 장착하자.", "type": "equip", "target": "", "count": 1, "gold": 300, "gems": 0},
	{"title": "꽃바람 언덕으로", "desc": "초록 초원 동쪽 문을 지나 꽃바람 언덕에 가 보자.", "type": "reach", "target": "hill", "count": 1, "gold": 200, "gems": 30},
	{"title": "버섯 소동", "desc": "버섯 몬스터를 8마리 물리치자. 언덕에 많이 산다.", "type": "kill", "target": "mushroom", "count": 8, "gold": 300, "gems": 30},
	{"title": "성장하기", "desc": "골드로 레벨을 올려 아무 캐릭터나 레벨 5를 만들자.", "type": "level", "target": "", "count": 5, "gold": 300, "gems": 50},
	{"title": "어스름 숲으로", "desc": "언덕 동쪽 문을 지나 어두운 숲에 들어가 보자.", "type": "reach", "target": "forest", "count": 1, "gold": 300, "gems": 30},
	{"title": "스킬 연습", "desc": "전투에서 스킬(E 키 / 노란 버튼)을 5번 써 보자.", "type": "skill", "target": "", "count": 5, "gold": 200, "gems": 30},
	{"title": "숲의 주인", "desc": "어스름 숲 북동쪽 깊은 곳의 킹 슬라임을 물리치자. 사막 길이 열린다!", "type": "boss", "target": "king_slime", "count": 1, "gold": 800, "gems": 150},
	{"title": "뜨거운 사막", "desc": "어스름 숲 동쪽 끝의 문을 지나 사막에 도착하자.", "type": "reach", "target": "desert", "count": 1, "gold": 200, "gems": 0},
	{"title": "사막 정찰", "desc": "사막의 몬스터를 15마리 물리치자.", "type": "kill", "target": "desert", "count": 15, "gold": 500, "gems": 50},
	{"title": "모래바람 협곡", "desc": "사막 동쪽 문을 지나 바위투성이 협곡으로 들어가자.", "type": "reach", "target": "desert2", "count": 1, "gold": 300, "gems": 30},
	{"title": "저주받은 폐허", "desc": "협곡 끝, 뼈만 남은 폐허에 발을 들이자. 공기가 무겁다…", "type": "reach", "target": "desert3", "count": 1, "gold": 400, "gems": 50},
	{"title": "외눈 거인 왕", "desc": "저주받은 폐허 남동쪽 깊은 곳의 외눈 거인 왕을 물리치고 1장을 끝내자!", "type": "boss", "target": "cyclope_king", "count": 1, "gold": 2000, "gems": 300},
	# 2장 설산
	{"title": "2장: 눈꽃 평원", "desc": "마을 북쪽 설산 입구의 동굴이 열렸다! 들어가서 눈꽃 평원에 가 보자.", "type": "reach", "target": "snow1", "count": 1, "gold": 800, "gems": 50},
	{"title": "설원의 사냥", "desc": "설산의 몬스터를 25마리 물리치자.", "type": "kill", "target": "snow", "count": 25, "gold": 1500, "gems": 80},
	{"title": "서리 전나무 숲", "desc": "얼어붙은 호수와 눈보라 협곡을 지나 서리 전나무 숲에 닿자.", "type": "reach", "target": "snow4", "count": 1, "gold": 1500, "gems": 60},
	{"title": "설원의 대왕곰", "desc": "빙하 동굴 너머 설산 정상의 대왕곰을 물리치자. 해저 신전의 봉인이 풀린다!", "type": "boss", "target": "yeti_king", "count": 1, "gold": 5000, "gems": 400},
	# 3장 해저 신전
	{"title": "3장: 해저 신전", "desc": "마을 서쪽 나루터의 신전 문이 열렸다. 해저 신전으로 들어가자.", "type": "reach", "target": "temple1", "count": 1, "gold": 2000, "gems": 80},
	{"title": "신전 정화", "desc": "해저 신전의 몬스터를 30마리 물리치자.", "type": "kill", "target": "temple", "count": 30, "gold": 3000, "gems": 120},
	{"title": "심연 계단", "desc": "신전 깊은 곳, 심연 계단까지 내려가자.", "type": "reach", "target": "temple5", "count": 1, "gold": 3000, "gems": 100},
	{"title": "심해의 크라켄", "desc": "해신의 제단에 도사린 크라켄을 물리치자. 저주받은 폐허 동쪽 길이 열린다!", "type": "boss", "target": "kraken", "count": 1, "gold": 10000, "gems": 600},
	# 4장 용암·지옥
	{"title": "4장: 잿빛 황무지", "desc": "저주받은 폐허 동쪽 문을 지나 용암 지대로 가자.", "type": "reach", "target": "lava1", "count": 1, "gold": 4000, "gems": 100},
	{"title": "불꽃 사냥", "desc": "용암 지대의 몬스터를 40마리 물리치자.", "type": "kill", "target": "lava", "count": 40, "gold": 6000, "gems": 150},
	{"title": "화염룡 이그니스", "desc": "용암 지대 끝, 화염룡의 둥지에서 이그니스를 물리치자. 지옥문이 열린다!", "type": "boss", "target": "flame_dragon", "count": 1, "gold": 15000, "gems": 800},
	{"title": "지옥문", "desc": "지옥문을 지나 지옥에 발을 들이자.", "type": "reach", "target": "hell1", "count": 1, "gold": 6000, "gems": 120},
	{"title": "지옥 정화", "desc": "지옥의 몬스터를 50마리 물리치자.", "type": "kill", "target": "hell", "count": 50, "gold": 9000, "gems": 200},
	{"title": "마왕 아자젤", "desc": "마왕의 옥좌에서 마왕 아자젤을 쓰러뜨리고 세상을 구하자!", "type": "boss", "target": "demon_lord", "count": 1, "gold": 50000, "gems": 3000},
]

const DAILY: Array[Dictionary] = [
	{"id": "login", "title": "출석하기", "type": "login", "target": "", "count": 1, "gold": 0, "gems": 20},
	{"id": "hunt", "title": "몬스터 30마리 물리치기", "type": "kill", "target": "", "count": 30, "gold": 0, "gems": 30},
	{"id": "skill", "title": "스킬 5번 쓰기", "type": "skill", "target": "", "count": 5, "gold": 0, "gems": 20},
	{"id": "pull", "title": "소환 1번 하기", "type": "pull", "target": "", "count": 1, "gold": 0, "gems": 30},
	{"id": "levelup", "title": "레벨 업 1번 하기", "type": "levelup", "target": "", "count": 1, "gold": 300, "gems": 0},
	{"id": "gold", "title": "골드 1,000 모으기", "type": "gold", "target": "", "count": 1000, "gold": 0, "gems": 20},
]
const DAILY_BONUS_GEMS := 100


func _ready() -> void:
	_ensure()
	_check_day()
	track("login")


## 저장 상태(Save.quest) 기본값 채우기
func _ensure() -> void:
	var q := Save.quest
	if not q.has("main"):
		q["main"] = 0
	if not q.has("progress"):
		q["progress"] = 0
	if not q.has("day"):
		q["day"] = ""
	if not q.has("daily"):
		q["daily"] = {}
	if not q.has("claimed"):
		q["claimed"] = {}
	if not q.has("bonus"):
		q["bonus"] = false


func _today() -> String:
	return Time.get_date_string_from_system()


## 날짜가 바뀌었으면 일일 퀘스트를 새로 시작
func _check_day() -> void:
	_ensure()
	var q := Save.quest
	if q["day"] != _today():
		q["day"] = _today()
		q["daily"] = {}
		q["claimed"] = {}
		q["bonus"] = false


# ── 메인 ──

func main_index() -> int:
	_ensure()
	return int(Save.quest["main"])


func current() -> Dictionary:
	var i := main_index()
	return MAIN[i] if i < MAIN.size() else {}


func main_progress() -> int:
	var q := current()
	if q.is_empty():
		return 0
	match String(q["type"]):
		"level":
			return _max_level()
		"equip":
			return 1 if not Save.equip.is_empty() else 0
	return int(Save.quest["progress"])


func main_done() -> bool:
	var q := current()
	return not q.is_empty() and main_progress() >= int(q["count"])


func all_main_cleared() -> bool:
	return main_index() >= MAIN.size()


## 메인 보상 받기 → 다음 이야기로
func claim_main() -> bool:
	if not main_done():
		return false
	var q := current()
	_reward(q)
	Save.quest["main"] = main_index() + 1
	Save.quest["progress"] = 0
	Save.save_game()
	changed.emit()
	if main_done():  # 이미 조건을 채운 다음 퀘스트(레벨·장착 등)
		completed.emit(current()["title"])
	return true


# ── 일일 ──

func daily_progress(d: Dictionary) -> int:
	_check_day()
	return mini(int(Save.quest["daily"].get(d["id"], 0)), int(d["count"]))


func daily_done(d: Dictionary) -> bool:
	return daily_progress(d) >= int(d["count"])


func daily_claimed(d: Dictionary) -> bool:
	return bool(Save.quest["claimed"].get(d["id"], false))


func claim_daily(id: String) -> bool:
	for d in DAILY:
		if d["id"] == id and daily_done(d) and not daily_claimed(d):
			Save.quest["claimed"][id] = true
			_reward(d)
			Save.save_game()
			changed.emit()
			return true
	return false


func all_daily_claimed() -> bool:
	for d in DAILY:
		if not daily_claimed(d):
			return false
	return true


func claim_bonus() -> bool:
	if Save.quest["bonus"] or not all_daily_claimed():
		return false
	Save.quest["bonus"] = true
	Save.add_gems(DAILY_BONUS_GEMS)
	Save.save_game()
	changed.emit()
	return true


# ── 보스 처치 기록(길 열림 판단) ──

func boss_defeated(kind: String) -> bool:
	return kind == "" or Save.quest.get("bosses", {}).has(kind)


func mark_boss(kind: String) -> void:
	_ensure()
	if not Save.quest.has("bosses"):
		Save.quest["bosses"] = {}
	Save.quest["bosses"][kind] = true
	Save.save_game()


## 받을 보상이 하나라도 있으면 true(탭에 빨간 점)
func has_reward() -> bool:
	if main_done():
		return true
	for d in DAILY:
		if daily_done(d) and not daily_claimed(d):
			return true
	return all_daily_claimed() and not Save.quest["bonus"]


# ── 진행 ──

## 게임에서 일어난 일을 알린다. 메인·일일 진행도가 오르고, 새로 다 채운 퀘스트가 있으면 completed 신호.
func track(type: String, target := "", amount := 1) -> void:
	_check_day()
	var q := current()
	if not q.is_empty() and String(q["type"]) == type and not main_done():
		if _matches(String(q["target"]), target):
			if type not in ["level", "equip"]:
				Save.quest["progress"] = int(Save.quest["progress"]) + amount
			if main_done():
				completed.emit(q["title"])
				Game.sfx(&"charged", -2.0, 0.0)
	for d in DAILY:
		if String(d["type"]) == type and not daily_done(d) and _matches(String(d["target"]), target):
			Save.quest["daily"][d["id"]] = int(Save.quest["daily"].get(d["id"], 0)) + amount
			if daily_done(d) and type != "login":
				completed.emit("[일일] " + String(d["title"]))
	changed.emit()


func _matches(want: String, got: String) -> bool:
	if want == "":
		return true
	if REGION_KINDS.has(want):
		return got in REGION_KINDS[want]
	return want == got


func _max_level() -> int:
	var best := 1
	for key: String in Save.owned:
		best = maxi(best, int(Save.owned[key].get("level", 1)))
	return best


func _reward(q: Dictionary) -> void:
	if int(q.get("gold", 0)) > 0:
		Save.add_gold(int(q["gold"]))
	if int(q.get("gems", 0)) > 0:
		Save.add_gems(int(q["gems"]))
	Game.sfx(&"pickup", 0.0, 0.0)


## 보상 문구("300G · 보석 30")
static func reward_text(q: Dictionary) -> String:
	var parts: Array[String] = []
	if int(q.get("gold", 0)) > 0:
		parts.append("%dG" % int(q["gold"]))
	if int(q.get("gems", 0)) > 0:
		parts.append("보석 %d" % int(q["gems"]))
	return " · ".join(parts)
