class_name IdleReward
extends Control
## 방치 보상: 게임을 꺼 둔 동안(5분 이상, 최대 12시간) 용사가 사냥한 몫을 로비에 들어올 때 한 번 받는다.
## 얼마나 버는지는 지금까지 잡은 보스 수(=갈 수 있는 가장 깊은 사냥터)로 정한다.

signal closed

const MIN_SECONDS := 300
const MAX_MINUTES := 720
const KILLS_PER_MIN := 5
## 잡은 보스 수 → 그 사냥터 몬스터 한 마리 골드
const GOLD_BY_TIER: Array[int] = [6, 12, 30, 55, 95, 150, 210, 280, 320, 380, 440, 500]

static var shown := false  # 켤 때마다 한 번만

var reward: Dictionary = {}
var _t := 0.0


## 비운 시간으로 받을 것 계산 {minutes, kills, gold, gems, potion, gear: [id...]}
static func compute(seconds: int) -> Dictionary:
	var minutes := mini(seconds / 60, MAX_MINUTES)
	var tier := clampi((Save.quest.get("bosses", {}) as Dictionary).size(), 0, GOLD_BY_TIER.size() - 1)
	var kills := minutes * KILLS_PER_MIN
	var gear: Array[StringName] = []
	for i in mini(minutes / 45, 10):
		gear.append(Gear.roll(false))
	return {"minutes": minutes, "kills": kills, "gold": kills * GOLD_BY_TIER[tier] / 2, "gems": minutes / 12, "potion": minutes / 60, "gear": gear}


## 받을 게 있으면 창을 띄운다(로비에서 부른다)
static func try_show(host: Control) -> void:
	if shown or Save.away_seconds < MIN_SECONDS:
		return
	shown = true
	var box := IdleReward.new()
	box.reward = compute(Save.away_seconds)
	host.add_child(box)


## 실제로 받기
static func grant(r: Dictionary) -> void:
	Save.add_gold(int(r["gold"]))
	Save.add_gems(int(r["gems"]))
	Save.give_item(&"potion", int(r["potion"]))
	for g: StringName in r["gear"]:
		Save.give_gear(g)
	Save.away_seconds = 0
	Save.save_game()


func _ready() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	mouse_filter = Control.MOUSE_FILTER_STOP
	z_index = 60
	var b := GameButton.new()
	b.label = "받기"
	b.kind = Gt.Kind.YELLOW
	b.font_size = 22
	b.set_anchors_preset(Control.PRESET_CENTER)
	b.offset_left = -110
	b.offset_right = 110
	b.offset_top = 150
	b.offset_bottom = 214
	b.pressed.connect(func() -> void:
		IdleReward.grant(reward)
		Game.sfx(&"coin", -2.0, 0.0)
		closed.emit()
		queue_free())
	add_child(b)
	Game.sfx(&"success", -4.0, 0.0)


func _process(delta: float) -> void:
	_t += delta
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(Vector2.ZERO, size), Color(Gt.INK, 0.65))
	var r := Rect2(size / 2.0 - Vector2(240, 250), Vector2(480, 480))
	Gt.panel(self, r)
	Gt.header(self, r.position + Vector2(20, 46), "자리를 비운 사이", "IDLE REWARD", 22)
	var m := int(reward["minutes"])
	var t := "%d시간 %d분" % [m / 60, m % 60] if m >= 60 else "%d분" % m
	Gt.text(self, Vector2(r.get_center().x, r.position.y + 96), "%s 동안 용사가 몬스터 %d마리를 잡았어요" % [t, int(reward["kills"])], 15, Gt.NAVY, 1)
	if m >= MAX_MINUTES:
		Gt.text(self, Vector2(r.get_center().x, r.position.y + 118), "(최대 12시간까지 쌓여요)", 11, Gt.GRAY, 1, false)
	# 보상 줄
	var rows: Array = [[&"coin", "골드", int(reward["gold"])], [&"gem", "보석", int(reward["gems"])], [&"potion", "회복 물약", int(reward["potion"])]]
	var y := r.position.y + 140.0
	for row: Array in rows:
		var rr := Rect2(Vector2(r.position.x + 30, y), Vector2(r.size.x - 60, 44))
		Gt.pbox(self, rr, Gt.CREAM, Gt.INK, 2, false, true)
		Gt.icon(self, row[0], rr.position + Vector2(26, 22), 28)
		Gt.text(self, rr.position + Vector2(50, 29), row[1], 16, Gt.NAVY)
		Gt.text(self, Vector2(rr.end.x - 14, rr.position.y + 29), "+%s" % _comma(int(row[2])), 18, Gt.NAVY, 2)
		y += 50.0
	# 장비(등급색 작은 카드)
	var gear: Array = reward["gear"]
	Gt.text(self, Vector2(r.position.x + 32, y + 22), "장비 %d개" % gear.size() if not gear.is_empty() else "장비는 45분마다 하나씩 쌓여요", 14, Gt.NAVY_SOFT, 0, false)
	for i in gear.size():
		var cr := Rect2(Vector2(r.position.x + 30 + i * 42, y + 32), Vector2(38, 46))
		Gear.draw_card(self, gear[i], cr, false)


func _comma(n: int) -> String:
	var s := str(absi(n))
	var out := ""
	while s.length() > 3:
		out = "," + s.substr(s.length() - 3) + out
		s = s.substr(0, s.length() - 3)
	return s + out
