class_name Boss
extends Enemy
## 보스: 평소엔 일반 몬스터처럼 움직이다가, 용사가 가까이 오면 깨어나 HUD 위쪽에 큰 체력바가 뜬다.
## 몇 초마다 땅을 내려치기 전에 빨간 원으로 범위를 알려 주고(피할 시간), 내려치면 그 안의 용사가 크게 다친다.
## 체력이 반 아래로 떨어지면 화가 나서 더 자주 내려치고, 부하(summon)를 불러낸다.

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
			Game.sfx(&"charged", 0.0, 0.0)
			Game.add_shake(4.0)
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
	# 내려치기 예고: 점점 차오르는 빨간 원(일반 몬스터의 작은 체력바는 그리지 않는다)
	if telegraph_t >= 0.0 and hp > 0:
		var k := 1.0 - telegraph_t / TELEGRAPH
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(1.0, 0.55))
		draw_circle(Vector2.ZERO, slam_radius, Color(1, 0.2, 0.2, 0.18))
		draw_circle(Vector2.ZERO, slam_radius * k, Color(1, 0.25, 0.2, 0.3))
		draw_arc(Vector2.ZERO, slam_radius, 0, TAU, 48, Color(1, 0.3, 0.3, 0.9), 2.0, true)
		draw_set_transform(Vector2.ZERO)
