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
@export var summon: PackedScene

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
	"giant_soul": [["ring", "jump"], Color("ffe27a")],
	"root_worm": [["puddle", "charge"], Color("8ccf5a")],
	"black_gardener": [["blink", "puddle", "ring"], Color("a35cff")],
	"mist_apostle": [["blink", "ring", "charge"], Color("8fd3ff")],
}
var skill_t := 5.0
var pat := ""  # 지금 쓰는 기술
var pat_t := 0.0
var pat_stage := 0
var pat_dir := Vector2.ZERO
var pat_pos := Vector2.ZERO  # 도약·장판 목표(맵 좌표)
var _charge_hit := false


func _ready() -> void:
	super._ready()
	is_boss = true
	add_to_group(&"bosses")


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
			Game.sfx(&"alert", 0.0, 0.0)
			Game.add_shake(4.0)
		return
	if pat != "":
		_run_pattern(delta)
		return
	skill_t -= delta
	if skill_t <= 0.0 and telegraph_t < 0.0 and PATTERNS.has(kind_id()):
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
