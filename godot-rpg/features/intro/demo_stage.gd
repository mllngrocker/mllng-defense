class_name DemoStage
extends Node2D
## 시작 화면의 "예시": 푸른 초원에서 고른 동료가 허수아비 몬스터를 자동으로 때리고 스킬을 쓴다.
## 진짜 Player를 쓰지만 몬스터는 움직이지 않고 쓰러지지도 않는다(저장·도감·경험치에 아무 영향 없음).

const DUMMIES := [["slime", Vector2(-70, -20)], ["mushroom", Vector2(70, -10)], ["slime", Vector2(0, -70)]]
const AREA := Rect2(-220, -170, 440, 320)

var character: CharacterData
var player: Player
var _t := 0.0
var _skill_t := 1.2  # 처음엔 금방, 그다음엔 3초마다 스킬


func _ready() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = 11
	var deco := _Meadow.new()
	deco.rng_seed = rng.randi()
	add_child(deco)
	for d: Array in DUMMIES:
		var e := (load("res://features/enemy/%s.tscn" % d[0]) as PackedScene).instantiate() as Enemy
		e.position = d[1]
		add_child(e)
		e.set_physics_process(false)  # 허수아비: 움직이지도 때리지도 않는다
		e.max_hp = 99999999
		e.hp = 99999999
	player = (load("res://features/player/player.tscn") as PackedScene).instantiate() as Player
	player.character_override = character
	player.position = Vector2(0, 40)
	add_child(player)
	player.auto = true
	(player.get_node(^"Camera") as Camera2D).zoom = Vector2(2.6, 2.6)  # 예시는 조금 크게


func _process(delta: float) -> void:
	_t += delta
	if is_instance_valid(player):
		player.mp = player.max_mp  # 예시라 마나는 늘 가득
		player.hp = player.max_hp
		if not AREA.has_point(player.position):
			player.position = Vector2(0, 40)
		_skill_t -= delta
		if _skill_t <= 0.0 and player.skill_lock_t <= 0.0 and player.skills:
			_skill_t = 3.0
			player.skills.cds["a1"] = 0.0
			player.skills.try_cast("a1")  # 예시: 스킬도 보여 준다
	for e in get_children():
		if e is Enemy:
			(e as Enemy).hp = 99999999


## 푸른 초원 바닥: 풀색 + 풀잎·꽃 점
class _Meadow:
	extends Node2D
	var rng_seed := 0

	func _ready() -> void:
		z_index = -10

	func _draw() -> void:
		draw_rect(Rect2(-400, -300, 800, 600), Color("6fbf4f"))
		var rng := RandomNumberGenerator.new()
		rng.seed = rng_seed
		for i in 220:
			var p := Vector2(rng.randf_range(-400, 400), rng.randf_range(-300, 300))
			match i % 5:
				0:
					draw_circle(p, rng.randf_range(10, 22), Color("63b145"))
				1, 2:
					draw_line(p, p + Vector2(-1.5, -4), Color("3f8f34"), 1.0)
					draw_line(p + Vector2(2, 0), p + Vector2(3, -5), Color("3f8f34"), 1.0)
				3:
					draw_circle(p, 1.4, [Color("fff4a8"), Color("ffffff"), Color("ffb3c7")][rng.randi() % 3])
				_:
					draw_circle(p, rng.randf_range(4, 8), Color("7ccd5a"))
