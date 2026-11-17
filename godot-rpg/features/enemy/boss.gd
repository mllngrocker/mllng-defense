class_name Boss
extends Enemy
## 보스: 평소엔 일반 몬스터처럼 움직이다가, 용사가 가까이 오면 깨어나 HUD 위쪽에 큰 체력바가 뜬다.
## 몇 초마다 땅을 내려치기 전에 빨간 원으로 범위를 알려 주고(피할 시간), 내려치면 그 안의 용사가 크게 다친다.
## 체력이 반 아래로 떨어지면 화가 나서 더 자주 내려치고, 부하(summon)를 불러낸다.
## 보스마다 고유 기술(PATTERNS)을 몇 초마다 섞어 쓴다: 돌진(charge) · 탄막(ring) · 장판(puddle) · 도약(jump) · 순간이동(blink).
## 모든 기술은 먼저 빨간 예고를 보여 줘서 피할 시간이 있다.

const EXPLOSION := preload("res://assets/ninja/fx/explosion.png")
const CIRCLE := preload("res://assets/ninja/fx/circle.png")
const WAKE_RANGE := 170.0
const TELEGRAPH := 0.9

@export var boss_name := "보스"
@export var slam_radius := 48.0
@export var slam_damage := 20
const BOSS_HP_MULT := 1.6
@export var summon: PackedScene
## 9장부터: 기술을 쉴 새 없이 이어 쓰고(콤보), 체력 반 아래면 2페이즈(더 빨라짐), 발밑에 마법진
@export var hard := false
@export var aura_scale := 1.0

var awake := false
var attack_t := 2.5
var telegraph_t := -1.0
var minions: Array[Node2D] = []

## 보스 → [고유 기술들, 탄·장판 색]
const PATTERNS := {
	"king_slime": [["jump"], Color("6fd36f")],
	"cyclope_king": [["charge"], Color("ffb347")],
	"spider_queen": [["ring", "puddle"], Color("b48cff")],
	"yeti_king": [["charge", "ring"], Color("9fe0ff")],
	"kraken": [["puddle", "ring"], Color("3d3a6b")],
	"flame_dragon": [["ring", "puddle", "charge"], Color("ff6b2b")],
	"demon_lord": [["charge", "ring", "blink"], Color("d23c6a")],
	"giant_soul": [["ring", "jump", "puddle", "charge"], Color("6fe0ff")],
	"storm_king": [["blink", "ring", "charge"], Color("ffe27a")],
	"root_worm": [["puddle", "charge"], Color("8ccf5a")],
	"black_gardener": [["blink", "puddle", "ring"], Color("a35cff")],
	"mist_apostle": [["blink", "ring", "charge"], Color("8fd3ff")],
	"meteor_golem": [["jump", "charge", "rain", "nova", "jump"], Color("c08cff")],
	"star_heart": [["spiral", "ring", "nova", "puddle", "blink", "rain"], Color("ff5ad8")],
	"star_eater": [["blink", "charge", "rain", "cross", "puddle", "nova"], Color("b05cff")],
	"void_mage": [["beam", "blink", "spiral", "beam", "rain", "cross"], Color("7a5cff")],
	"star_lich": [["beam", "cross", "rain", "spiral", "nova", "blink", "beam"], Color("ffd06a")],
}
var skill_t := 5.0
var pat := ""  # 지금 쓰는 기술
var pat_t := 0.0
var pat_stage := 0
var pat_dir := Vector2.ZERO
var pat_pos := Vector2.ZERO  # 도약·장판 목표(맵 좌표)
var _charge_hit := false
var _roar_t := -1.0  # 대면 포효(충격파 고리) 진행 시간
var _beams: Array = []  # 빔 각도(라디안)
var _beam_hit := false
var _phase2 := false
var _aura := 0.0
const BEAM_LEN := 440.0
const BEAM_W := 13.0


func _ready() -> void:
	super._ready()
	is_boss = true
	max_hp = roundi(max_hp * BOSS_HP_MULT)  # 보스는 더 단단하게(몬스터 배율 위에 한 번 더)
	hp = max_hp
	slam_damage = roundi(slam_damage * Enemy.DMG_MULT)
	add_to_group(&"bosses")
	if Game.dungeon == "" and Quests.boss_defeated(kind_id()):
		# 이미 잡은 보스는 맵에 다시 나오지 않는다(로비·맵을 다녀와도). 깨어나 체력바를 띄우기 전에 바로 꺼 둔다
		awake = true
		hp = 0
		visible = false
		set_physics_process(false)
		remove_from_group(&"enemies")
		remove_from_group(&"bosses")
		queue_free.call_deferred()


func _physics_process(delta: float) -> void:
	if hp <= 0:
		return
	super._physics_process(delta)
	if target == null or target.hp <= 0:
		return
	var d := global_position.distance_to(target.global_position)
	if not awake:
		if d < WAKE_RANGE:
			awake = true
			Events.boss_hp.emit(boss_name, hp, max_hp)
			_roar()
		return
	if hard and not _phase2 and _angry():
		_phase2 = true
		_roar()
		Events.notice.emit(boss_name, "분노! 기술이 쉴 새 없이 쏟아진다")
	if pat != "":
		_run_pattern(delta)
		return
	skill_t -= delta
	if skill_t <= 0.0 and telegraph_t < 0.0 and PATTERNS.has(kind_id()):
		if hard:
			skill_t = randf_range(0.8, 1.4) if _angry() else randf_range(1.5, 2.4)
		else:
			skill_t = randf_range(3.5, 5.0) if _angry() else randf_range(5.0, 7.0)
		var list: Array = PATTERNS[kind_id()][0]
		_start_pattern(list[randi() % list.size()])
		return
	if telegraph_t >= 0.0:
		telegraph_t -= delta
		stun_t = 0.1  # 기 모으는 동안 멈춘다
		queue_redraw()
		if telegraph_t < 0.0:
			_slam()
		return
	attack_t -= delta
	if attack_t <= 0.0 and d < WAKE_RANGE:
		telegraph_t = TELEGRAPH
		attack_t = randf_range(2.2, 3.2) if _angry() else randf_range(3.2, 4.6)
		Game.sfx(&"charge", -6.0, 0.0)


## 대면 연출: 포효 → 화면이 크게 흔들리고 충격파가 퍼지며 용사가 한 번 밀려난다
func _roar() -> void:
	_roar_t = 0.0
	Game.sfx(&"alert", 0.0, 0.0)
	Game.sfx(&"boom", -2.0, 0.0)
	Game.add_shake(12.0)
	Game.flash(Color(1, 0.3, 0.3, 0.35), 0.18)
	if is_instance_valid(target):
		var away := global_position.direction_to(target.global_position)
		target.knockback = (away if away != Vector2.ZERO else Vector2.DOWN) * 380.0


func _process(delta: float) -> void:
	if hard and awake and hp > 0:
		_aura += delta
		queue_redraw()
	if _roar_t >= 0.0:
		_roar_t += delta
		if _roar_t > 0.9:
			_roar_t = -1.0
		queue_redraw()


# ── 고유 기술 ──

func _color() -> Color:
	return PATTERNS[kind_id()][1] if PATTERNS.has(kind_id()) else Color("ff5d5d")


func _start_pattern(p: String) -> void:
	pat = p
	pat_stage = 0
	_charge_hit = false
	match p:
		"charge":
			pat_t = 0.75
			pat_dir = global_position.direction_to(target.global_position)
			Game.sfx(&"charge", -4.0, 0.0)
		"ring":
			pat_t = 0.55
			Game.sfx(&"charge", -6.0, 0.0)
		"puddle":
			pat_t = 0.3
		"jump":
			pat_t = 0.9
			pat_pos = _safe_pos(target.global_position)
			Game.sfx(&"charge", -4.0, 0.0)
		"blink":
			pat_t = 0.35
			Game.sfx(&"skill_dark", -4.0, 0.0)
		"beam":  # 용사 쪽으로 부채꼴 빔(예고선 → 발사)
			pat_t = 0.7 if not _angry() else 0.55
			var base := (target.global_position - _core()).angle()
			var n := 5 if _angry() else 3
			_beams.clear()
			for i in n:
				_beams.append(base + (i - (n - 1) / 2.0) * 0.38)
			_beam_hit = false
			Game.sfx(&"charge", -2.0, 0.0)
		"cross":  # 십자 빔이 보스를 축으로 돈다(빔 사이로 따라 돌며 피해야 함)
			pat_t = 0.7
			var n := 6 if _angry() else 4
			var a0 := randf() * TAU
			_beams.clear()
			for i in n:
				_beams.append(a0 + i * TAU / n)
			pat_dir = Vector2(1.0 if randf() < 0.5 else -1.0, 0.0)  # 도는 방향
			Game.sfx(&"charge", -2.0, 0.0)
		"rain":  # 용사를 쫓아 연달아 떨어지는 빛 덩이
			pat_t = 0.15
			Game.sfx(&"skill_dark", -4.0, 0.0)
		"spiral":  # 나선 탄막
			pat_t = 2.4 if _angry() else 1.8
			pat_dir = Vector2.from_angle(randf() * TAU)
			Game.sfx(&"charge", -4.0, 0.0)
		"nova":  # 커지는 충격파(닿는 순간 구르기)
			pat_t = 0.65
			Game.sfx(&"charge", -2.0, 0.0)
	queue_redraw()


func _run_pattern(delta: float) -> void:
	pat_t -= delta
	stun_t = 0.1  # 기술 쓰는 동안은 걸어서 쫓지 않는다
	queue_redraw()
	match pat:
		"charge":
			if pat_stage == 0 and pat_t <= 0.0:
				pat_stage = 1
				pat_t = 0.5
				Game.sfx(&"dash", 0.0)
			elif pat_stage == 1:
				velocity = pat_dir * 320.0
				move_and_slide()
				if not _charge_hit and target.global_position.distance_to(global_position) < 26.0:
					_charge_hit = true
					target.take_hit(roundi(damage * 1.5), global_position, 320.0)
				if pat_t <= 0.0:
					_end_pattern()
		"ring":
			if pat_t <= 0.0:
				var n := 16 if _angry() else 10
				var off := 0.0 if pat_stage == 0 else PI / n
				for i in n:
					var a := off + i * TAU / n
					BossShot.fire(_effects_parent(), global_position + Vector2(0, -10), Vector2.from_angle(a) * 95.0, roundi(damage * 0.6), _color())
				Game.sfx(&"skill_light", -4.0)
				pat_stage += 1
				pat_t = 0.45
				if pat_stage >= (2 if _angry() else 1):
					_end_pattern()
		"puddle":
			if pat_t <= 0.0:
				var spots := [target.global_position]
				for i in (4 if _angry() else 2):
					spots.append(target.global_position + Vector2.from_angle(randf() * TAU) * randf_range(30.0, 60.0))
				for sp: Vector2 in spots:
					BossPuddle.drop(_effects_parent(), sp, 24.0, roundi(damage * 0.35), _color())
				Game.sfx(&"burn", -6.0)
				_end_pattern()
		"jump":
			if pat_t <= 0.0:
				global_position = pat_pos
				_slam()
				_end_pattern()
		"beam":
			if pat_stage == 0 and pat_t <= 0.0:
				pat_stage = 1
				pat_t = 0.32
				Game.sfx(&"skill_light", 0.0)
				Game.add_shake(6.0)
				Game.flash(Color(_color(), 0.18), 0.1)
			elif pat_stage == 1:
				_beam_check(roundi(damage * 1.7))
				if pat_t <= 0.0:
					_beams.clear()
					_end_pattern()
		"cross":
			if pat_stage == 0 and pat_t <= 0.0:
				pat_stage = 1
				pat_t = 2.6 if _angry() else 2.0
				Game.sfx(&"skill_light", -2.0)
				Game.add_shake(5.0)
			elif pat_stage == 1:
				var spd := (1.25 if _angry() else 0.9) * pat_dir.x
				for i in _beams.size():
					_beams[i] += spd * delta
				_beam_check(roundi(damage * 1.2))
				if pat_t <= 0.0:
					_beams.clear()
					_end_pattern()
		"rain":
			if pat_t <= 0.0:
				var lead: Vector2 = target.velocity * 0.35
				BossMark.drop(_effects_parent(), target.global_position + lead + Vector2.from_angle(randf() * TAU) * randf_range(0.0, 26.0), 30.0, 0.7, roundi(damage * 1.3), _color())
				pat_stage += 1
				pat_t = 0.11 if _angry() else 0.15
				if pat_stage >= (16 if _angry() else 10):
					_end_pattern()
		"spiral":
			pat_stage += 1
			if pat_stage % 4 == 0:
				var arms := 4 if _angry() else 3
				var a := pat_dir.angle() + pat_t * 3.4
				for k in arms:
					BossShot.fire(_effects_parent(), _core(), Vector2.from_angle(a + k * TAU / arms) * 118.0, roundi(damage * 0.5), _color())
			if pat_t <= 0.0:
				_end_pattern()
		"nova":
			if pat_t <= 0.0:
				BossNova.fire(_effects_parent(), global_position, roundi(damage * 1.4), _color(), 250.0 if _angry() else 215.0)
				Game.sfx(&"boom", -4.0)
				Game.add_shake(5.0)
				pat_stage += 1
				pat_t = 0.5
				if pat_stage >= (3 if _angry() else 2):
					_end_pattern()
		"blink":
			if pat_stage == 0:
				sprite.modulate.a = clampf(pat_t / 0.35, 0.0, 1.0)
				if pat_t <= 0.0:
					var behind := target.global_position - target.global_position.direction_to(global_position) * 40.0
					global_position = _safe_pos(behind)
					Fx.spawn(_effects_parent(), preload("res://assets/ninja/fx/smoke.png"), 6, global_position + Vector2(0, -8), 18.0)
					pat_stage = 1
					pat_t = 0.25
			else:
				sprite.modulate.a = clampf(1.0 - pat_t / 0.25, 0.0, 1.0)
				if pat_t <= 0.0:
					sprite.modulate.a = 1.0
					telegraph_t = TELEGRAPH * 0.7  # 나타나자마자 내려치기 예고
					_end_pattern()


func _end_pattern() -> void:
	pat = ""
	velocity = Vector2.ZERO
	queue_redraw()
	if hard and randf() < (0.75 if _angry() else 0.45):
		skill_t = minf(skill_t, 0.25)  # 콤보: 바로 다음 기술


## 빔·탄이 나가는 자리(몸 가운데)
func _core() -> Vector2:
	return global_position + Vector2(0, -14)


## 빔에 닿았는지(한 번 맞으면 그 기술 동안 무적 시간이 있어서 연속으로 깎이진 않는다)
func _beam_check(dmg: int) -> void:
	if target == null or target.hp <= 0:
		return
	var rel := target.global_position - _core()
	for a: float in _beams:
		var dir := Vector2.from_angle(a)
		var along := rel.dot(dir)
		if along > 0.0 and along < BEAM_LEN and absf(rel.cross(dir)) < BEAM_W:
			target.take_hit(dmg, _core(), 240.0)
			return


## 벽·물 속이 아닌 가까운 빈 자리(맵 길찾기 격자 사용)
func _safe_pos(p: Vector2) -> Vector2:
	var world := get_tree().get_first_node_in_group(&"world")
	if world and world.has_method(&"nav_path"):
		world.call(&"nav_path", p, p)  # 격자 만들기
		var c: Vector2i = world.call(&"_nav_cell", p)
		return Vector2(c) * 16.0 + Vector2(8, 8)
	return p


func _angry() -> bool:
	return hp < max_hp / 2


func _slam() -> void:
	queue_redraw()
	var c := global_position
	var fx := Fx.spawn(_effects_parent(), EXPLOSION, 9, c + Vector2(0, -8), 18.0)
	fx.scale = Vector2.ONE * (slam_radius / 20.0)
	var ring := Fx.spawn(_effects_parent(), CIRCLE, 4, c, 14.0)
	ring.scale = Vector2(slam_radius / 14.0, slam_radius / 28.0)
	Game.sfx(&"boom", 0.0)
	Game.add_shake(9.0)
	Game.flash(Color(1, 0.25, 0.2, 0.16), 0.18)
	if target and target.hp > 0 and target.global_position.distance_to(c) < slam_radius:
		target.take_hit(slam_damage, c, 300.0)
	if _angry() and summon:
		minions = minions.filter(func(m: Node2D) -> bool: return is_instance_valid(m))
		for i in mini(2, 4 - minions.size()):
			var m := summon.instantiate() as Node2D
			m.position = c + Vector2.from_angle(randf() * TAU) * 30.0
			_effects_parent().add_child(m)
			minions.append(m)


func take_hit(amount: int, from: Vector2, knock := 210.0, crit := false) -> void:
	# 보스는 덜 밀려난다
	super.take_hit(amount, from, knock * 0.25, crit)
	if not awake:
		awake = true
	Events.boss_hp.emit(boss_name, maxi(hp, 0), max_hp)


func _draw() -> void:
	# 9장 보스 발밑 마법진(두 겹 고리 + 도는 별 문양, 2페이즈면 더 밝고 빠르게)
	if hard and awake and hp > 0:
		var col0 := _color()
		var rr := 46.0 * aura_scale
		var sp := 1.8 if _phase2 else 0.9
		draw_set_transform(Vector2(0, -2), 0.0, Vector2(1.0, 0.5))
		draw_circle(Vector2.ZERO, rr * 1.05, Color(col0, 0.10 + (0.08 if _phase2 else 0.0)))
		draw_arc(Vector2.ZERO, rr, 0, TAU, 64, Color(col0.lightened(0.2), 0.75), 2.0, true)
		draw_arc(Vector2.ZERO, rr * 0.78, 0, TAU, 64, Color(col0, 0.55), 1.5, true)
		for i in 6:
			var a := _aura * sp + i * TAU / 6.0
			var q := Vector2.from_angle(a) * rr * 0.89
			draw_colored_polygon(PackedVector2Array([q + Vector2(0, -5), q + Vector2(3, 0), q + Vector2(0, 5), q + Vector2(-3, 0)]), Color(1, 1, 1, 0.8))
		for i in 3:
			var a := -_aura * sp * 0.7 + i * TAU / 3.0
			draw_line(Vector2.from_angle(a) * rr * 0.78, Vector2.from_angle(a + TAU / 3.0) * rr * 0.78, Color(col0.lightened(0.3), 0.5), 1.5)
		draw_set_transform(Vector2.ZERO)
		# 위로 떠오르는 빛 알갱이
		for i in 8:
			var ph := fmod(_aura * 0.6 + i * 0.125, 1.0)
			var x := sin(i * 2.4 + _aura) * rr * 0.7
			draw_circle(Vector2(x, -ph * 70.0 * aura_scale), 1.8 * (1.0 - ph) + 0.6, Color(col0.lightened(0.4), 1.0 - ph))
	# 빔: 예고(깜빡이는 가는 선) → 발사(굵은 빛줄기 + 하얀 심)
	if not _beams.is_empty():
		var c := Vector2(0, -14)
		var bc := _color()
		var firing := pat_stage == 1
		for a: float in _beams:
			var d := Vector2.from_angle(a)
			var end := c + d * BEAM_LEN
			if not firing:
				var bl := 0.5 + 0.5 * sin(_aura * 30.0 + Time.get_ticks_msec() * 0.03)
				draw_line(c, end, Color(bc, 0.18), BEAM_W * 2.0)
				draw_line(c, end, Color(bc.lightened(0.3), 0.5 + 0.4 * bl), 1.5)
			else:
				var w := BEAM_W * (1.0 + 0.15 * sin(Time.get_ticks_msec() * 0.05))
				draw_line(c, end, Color(bc, 0.45), w * 2.2)
				draw_line(c, end, Color(bc.lightened(0.35), 0.9), w)
				draw_line(c, end, Color(1, 1, 1, 0.95), w * 0.35)
				draw_circle(c, w * 1.2, Color(1, 1, 1, 0.8))
	# 나선·충격파 기 모으기
	if pat == "nova" or pat == "spiral":
		var k := 1.0 - clampf(pat_t / 0.65, 0.0, 1.0) if pat == "nova" else 0.6 + 0.4 * sin(Time.get_ticks_msec() * 0.02)
		draw_circle(Vector2(0, -14), 10.0 + 14.0 * k, Color(_color().lightened(0.3), 0.35))
		draw_circle(Vector2(0, -14), 5.0 + 6.0 * k, Color(1, 1, 1, 0.7))
	# 대면 포효: 퍼져 나가는 충격파 고리 두 겹
	if _roar_t >= 0.0:
		for k in 2:
			var tt := clampf((_roar_t - k * 0.18) / 0.7, 0.0, 1.0)
			if tt > 0.0 and tt < 1.0:
				draw_arc(Vector2(0, -10), 20.0 + tt * 150.0, 0, TAU, 48, Color(1, 0.85, 0.7, (1.0 - tt) * 0.8), 6.0 * (1.0 - tt) + 1.0)
	# 고유 기술 예고
	var col := _color()
	if pat == "charge" and pat_stage == 0:
		var w := 26.0
		var len := 170.0
		var pts := PackedVector2Array([pat_dir.orthogonal() * w / 2.0, pat_dir.orthogonal() * w / 2.0 + pat_dir * len, -pat_dir.orthogonal() * w / 2.0 + pat_dir * len, -pat_dir.orthogonal() * w / 2.0])
		draw_colored_polygon(pts, Color(1, 0.2, 0.2, 0.22))
		draw_polyline(PackedVector2Array([pts[0], pts[1], pts[2], pts[3], pts[0]]), Color(1, 0.3, 0.3, 0.9), 2.0)
	elif pat == "ring":
		draw_arc(Vector2(0, -10), 20.0 + 10.0 * (1.0 - pat_t / 0.55), 0, TAU, 24, Color(col, 0.8), 3.0)
	elif pat == "jump":
		var lp := pat_pos - global_position
		var k := 1.0 - clampf(pat_t / 0.9, 0.0, 1.0)
		draw_set_transform(lp, 0.0, Vector2(1.0, 0.55))
		draw_circle(Vector2.ZERO, slam_radius, Color(1, 0.2, 0.2, 0.18))
		draw_circle(Vector2.ZERO, slam_radius * k, Color(1, 0.25, 0.2, 0.3))
		draw_arc(Vector2.ZERO, slam_radius, 0, TAU, 48, Color(1, 0.3, 0.3, 0.9), 2.0, true)
		draw_set_transform(Vector2.ZERO)
	# 내려치기 예고: 점점 차오르는 빨간 원(일반 몬스터의 작은 체력바는 그리지 않는다)
	if telegraph_t >= 0.0 and hp > 0:
		var k := 1.0 - telegraph_t / TELEGRAPH
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.55))
		draw_circle(Vector2.ZERO, slam_radius, Color(1, 0.2, 0.2, 0.18))
		draw_circle(Vector2.ZERO, slam_radius * k, Color(1, 0.25, 0.2, 0.3))
		draw_arc(Vector2.ZERO, slam_radius, 0, TAU, 48, Color(1, 0.3, 0.3, 0.9), 2.0, true)
		draw_set_transform(Vector2.ZERO)
