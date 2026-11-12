class_name SkillCaster
extends Node
## 캐릭터마다 하나씩 있는 스킬(스킬 버튼·E/L 키). 재사용 시간은 CharacterData.skill_cooldown.
## 어떤 스킬을 쓸지는 캐릭터 id로 고른다. 스킬 하나가 함수 하나다.

const THUNDER := preload("res://assets/ninja/fx/thunder.png")
const ROCK_SPIKE := preload("res://assets/ninja/fx/rock_spike.png")
const WATER_PILLAR := preload("res://assets/ninja/fx/water_pillar.png")
const WATER_SPLASH := preload("res://assets/ninja/fx/water_splash.png")
const ICE_BURST := preload("res://assets/ninja/fx/ice_burst.png")
const ROCK := preload("res://assets/ninja/fx/rock.png")
const SPIRIT := preload("res://assets/ninja/fx/spirit.png")
const BOOST := preload("res://assets/ninja/fx/boost.png")
const SPARK := preload("res://assets/ninja/fx/spark.png")
const CIRCLE := preload("res://assets/ninja/fx/circle.png")
const SHIELD := preload("res://assets/ninja/fx/shield.png")
const CIRCULAR := preload("res://assets/ninja/fx/circular_slash.png")
const CLAW := preload("res://assets/ninja/fx/claw_double.png")
const SLASH_DOUBLE := preload("res://assets/ninja/fx/slash_double.png")
const AURA := preload("res://assets/ninja/fx/aura.png")
const CUT_X := preload("res://assets/ninja/fx/cut_x.png")
const EXPLOSION := preload("res://assets/ninja/fx/explosion.png")
const FLAME := preload("res://assets/ninja/fx/flame.png")
const LEAF := preload("res://assets/ninja/fx/leaf.png")
const SMOKE := preload("res://assets/ninja/fx/smoke.png")

var player: Player
var data: CharacterData
var cooldown := 0.0  # 고유기(a1) 남은 재사용 시간(예전 이름 그대로)
var cds: Dictionary = {"a1": 0.0, "a2": 0.0, "a3": 0.0}  # 슬롯별 남은 재사용 시간
var power := 1.0  # 지금 쓰는 스킬의 피해 배율(스킬 레벨·숙련·오의)
var last_name := ""  # 컷인에 보일 이름
var fx_scale := 1.0  # 별 등급 연출: 스킬 그림 크기 배율(5성부터)
var fx_tint := Color.WHITE  # 별 색으로 살짝 물들이기
var _orbit: Array[Sprite2D] = []  # 잎새 회오리 잎사귀
var _orbit_t := 0.0


func setup(p: Player, d: CharacterData) -> void:
	player = p
	data = d


func ready_ratio(node := "a1") -> float:
	var full := SkillTree.cooldown(data.id, node) if Save.is_owned(data.id) else data.skill_cooldown
	if full <= 0.0:
		return 1.0
	return 1.0 - clampf(float(cds.get(node, 0.0)) / full, 0.0, 1.0)


## 이 슬롯 스킬을 배웠는지(고유기는 늘)
func has_skill(node: String) -> bool:
	if node == "a1":
		return true
	if not Save.is_owned(data.id):
		return false
	return Save.skill_level(data.id, node) > 0


func _physics_process(delta: float) -> void:
	for k: String in cds:
		cds[k] = maxf(float(cds[k]) - delta, 0.0)
	cooldown = cds["a1"]
	if not _orbit.is_empty():
		_orbit_t += delta
		for i in _orbit.size():
			var a := _orbit_t * 9.0 + i * TAU / _orbit.size()
			_orbit[i].position = Vector2.from_angle(a) * Vector2(30, 20) + Vector2(0, -10)
			_orbit[i].rotation = a * 2.0


## 스킬 사용(node: a1 고유기 · a2 · a3 오의). 안 배웠거나 재사용 대기 중이면 false.
func try_cast(node := "a1") -> bool:
	if not has_skill(node) or float(cds.get(node, 0.0)) > 0.0 or player.hp <= 0:
		return false
	var owned := Save.is_owned(data.id)
	cds[node] = SkillTree.cooldown(data.id, node) if owned else data.skill_cooldown
	cooldown = cds["a1"]
	power = SkillTree.power(data.id, node) if owned else 1.0
	var info := SkillTree.info(data.id, node)
	last_name = info["name"]
	player.style.cancel()
	Events.skill_cast.emit(data)
	Quests.track("skill")
	player.flash(0.8)
	Game.sfx(Game.ELEMENT_SFX[clampi(data.element, 0, 5)], -3.0, 0.0)  # 속성마다 다른 소리
	_awaken_fx(Save.rank_of(data.id) if owned else data.rarity)
	match StringName(info["behavior"]):
		&"kemo1": _gale_dash()
		&"kemo2": _ice_rain()
		&"kemo3": _flame_burst()
		&"fairy3": _leaf_whirl()
		&"fairy2": _water_pillars()
		&"maid2": _flame_flurry()
		&"maid3": _earth_split()
		&"maid1": _judgement()
		&"maid4": _shadow_raid()
		&"fairy1": _petal_storm()
		&"scarlet": _shadow_raid()
		&"elf1": _wind_dance()
		&"elf2": _light_rain()
		&"devil4": _feather_storm()
		&"devil1": _frost_crack()
		&"elf3": _thorn_rise()
		&"elf4": _gale_charge()
		&"devil2": _dark_wings()
		&"devil3": _abyss_rain()
		_: _flame_burst()
	return true


## 별 등급 연출: 5성부터 스킬 그림이 커지고(×1.12 · 1.25 · 1.4) 별 색 충격파가 퍼진다. 7성은 화면이 붉게 번쩍이고 불꽃이 튄다.
func _awaken_fx(rank: int) -> void:
	fx_scale = 1.0
	fx_tint = Color.WHITE
	if rank < 5:
		return
	fx_scale = [1.12, 1.25, 1.4][clampi(rank - 5, 0, 2)]
	fx_tint = Gt.STAR_BY_RARITY.get(mini(rank, 7), Color.WHITE)
	var c := player.body_center()
	var ring := fx(CIRCLE, 4, c, 14.0, 2.4, Color(fx_tint, 0.9))
	ring.z_index = 4
	if rank >= 6:
		fx(CIRCLE, 4, c, 10.0, 3.6, Color(fx_tint.lightened(0.3), 0.7))
	if rank >= 7:
		Game.flash(Color(1, 0.15, 0.2, 0.22), 0.25)
		Game.add_shake(6.0)
		for i in 8:
			var d := Vector2.from_angle(i * TAU / 8.0)
			fx(SPARK, 10, c + d * 22.0, 20.0, 1.3, fx_tint, d.angle())


# ── 도구 ──

## center에서 radius 안의 살아 있는 적(가까운 순, 최대 limit)
func enemies_in(center: Vector2, radius: float, limit := 99) -> Array[Node2D]:
	var found: Array[Node2D] = []
	for e: Node2D in get_tree().get_nodes_in_group(&"enemies"):
		if e.get(&"hp") > 0 and e.global_position.distance_to(center) <= radius:
			found.append(e)
	found.sort_custom(func(a: Node2D, b: Node2D) -> bool: return a.global_position.distance_to(center) < b.global_position.distance_to(center))
	return found.slice(0, limit)


func fx(tex: Texture2D, frames: int, pos: Vector2, fps := 16.0, sc := 1.0, tint := Color.WHITE, rot := 0.0) -> Fx:
	var f := Fx.spawn(player.fx_parent(), tex, frames, pos, fps)
	f.scale = Vector2.ONE * sc * fx_scale  # 별이 높을수록 크게
	f.modulate = tint.lerp(fx_tint, 0.25) if fx_tint != Color.WHITE else tint
	f.rotation = rot
	return f


func hit_all(list: Array, mult: float, knock: float, from: Vector2) -> void:
	for e: Variant in list:
		if is_instance_valid(e) and e.get(&"hp") > 0:
			player.hit(e, mult * power * Weapons.mod(player.weapon, "skill"), knock, from)


func wait(sec: float) -> void:
	await get_tree().create_timer(sec, false).timeout


func alive() -> bool:
	return is_instance_valid(player) and player.hp > 0


# ── 스킬 10종 ──

## 시로: 질풍 일섬 — 조준 방향으로 돌진, 지나간 길의 적을 3번 벤다
func _gale_dash() -> void:
	var dir := player.aim(110.0)
	var start := player.global_position
	player.lock_for_skill(0.2, dir * 480.0, true)
	Game.sfx(&"dash", 0.0)
	await wait(0.2)
	if not alive():
		return
	var end := player.global_position
	var hits: Array[Node2D] = []
	for e: Node2D in enemies_in((start + end) / 2.0, start.distance_to(end) / 2.0 + 24.0):
		if Geometry2D.get_closest_point_to_segment(e.global_position, start, end).distance_to(e.global_position) < 22.0:
			hits.append(e)
	for k in 3:
		for e in hits:
			if is_instance_valid(e):
				fx(CUT_X, 4, e.global_position + Vector2(0, -8), 22.0, 1.2, data.trail_color, randf() * TAU)
		hit_all(hits, 1.3, 60.0 if k < 2 else 220.0, start)
		Game.sfx(&"slash", -2.0)
		await wait(0.1)
		if not alive():
			return


## 미즈하: 얼음 비 — 3번에 걸쳐 주변 적 머리 위로 얼음이 떨어진다
func _ice_rain() -> void:
	fx(BOOST, 8, player.body_center(), 16.0, 1.4, Color(0.7, 0.95, 1.0))
	for wave in 3:
		if not alive():
			return
		var targets := enemies_in(player.global_position, 130.0, 6)
		var spots: Array[Vector2] = []
		for e in targets:
			spots.append(e.global_position)
		while spots.size() < 4:
			spots.append(player.global_position + Vector2.from_angle(randf() * TAU) * randf_range(30, 90))
		for p in spots:
			fx(ICE_BURST, 10, p + Vector2(0, -10), 22.0, 1.3)
		Game.sfx(&"ice_shot", 0.0)
		hit_all(targets, 1.4, 80.0, player.global_position)
		Game.add_shake(3.0)
		await wait(0.35)


## 카라: 화염 대폭발 — 잠깐 힘을 모았다가 주변을 크게 폭발
func _flame_burst() -> void:
	player.lock_for_skill(0.35, Vector2.ZERO, true)
	player.squash(Vector2(0.8, 1.2), 0.3)
	fx(AURA, 5, player.body_center() + Vector2(0, 4), 14.0, 1.6, Color(1.0, 0.6, 0.3))
	Game.sfx(&"charge", -4.0, 0.0)
	await wait(0.32)
	if not alive():
		return
	var c := player.body_center()
	fx(EXPLOSION, 9, c, 18.0, 2.4)
	for i in 8:
		fx(FLAME, 8, c + Vector2.from_angle(i * TAU / 8.0) * 40.0, 16.0, 0.9)
	Game.sfx(&"boom", 2.0)
	Game.add_shake(10.0)
	player.squash(Vector2(1.3, 0.8))
	hit_all(enemies_in(c, 60.0), 3.5, 420.0, c)


## 리프: 잎새 회오리 — 3초 동안 잎사귀를 둘러 닿는 적을 계속 벤다
func _leaf_whirl() -> void:
	for i in 6:
		var s := Sprite2D.new()
		s.texture = LEAF
		s.hframes = 6
		s.frame = i % 6
		s.scale = Vector2.ONE * 1.6
		s.z_index = 5
		player.add_child(s)
		_orbit.append(s)
	for tick in 12:
		if not alive():
			break
		var c := player.body_center()
		if tick % 2 == 0:
			fx(CIRCULAR, 4, c, 18.0, 1.8, Color(0.6, 1.0, 0.5, 0.9))
			Game.sfx(&"slash", -8.0)
		hit_all(enemies_in(c, 42.0), 0.6, 120.0, c)
		await wait(0.25)
	for s in _orbit:
		if is_instance_valid(s):
			s.queue_free()
	_orbit.clear()


## 아쿠아: 물기둥 — 가까운 적 4명 발밑에서 물기둥
func _water_pillars() -> void:
	var targets := enemies_in(player.global_position, 150.0, 4)
	if targets.is_empty():
		fx(WATER_PILLAR, 9, player.global_position + player.aim(1.0) * 40.0 + Vector2(0, -14), 14.0, 1.4)
		return
	for e in targets:
		if not is_instance_valid(e):
			continue
		fx(WATER_PILLAR, 9, e.global_position + Vector2(0, -14), 14.0, 1.4)
		fx(WATER_SPLASH, 10, e.global_position, 18.0, 0.9)
		Game.sfx(&"ice_shot", -2.0)
		hit_all([e], 2.2, 30.0, e.global_position + Vector2(0, 1))
		await wait(0.08)


## 베리: 불꽃 난무 — 가장 가까운 적을 6번 몰아친다
func _flame_flurry() -> void:
	var dir := player.aim(70.0)
	player.lock_for_skill(0.65, Vector2.ZERO, true)
	for k in 6:
		if not alive():
			return
		var c := player.body_center() + dir * 18.0
		fx(SLASH_DOUBLE, 4, c, 24.0, 1.5, Color(1.0, 0.55, 0.35), dir.angle() + (0.6 if k % 2 else -0.6))
		hit_all(enemies_in(c, 26.0), 0.75, 40.0 if k < 5 else 300.0, player.global_position)
		Game.sfx(&"slash", -3.0)
		player.squash(Vector2(1.08, 0.94), 0.08)
		await wait(0.1)
	if alive():
		var c := player.body_center() + dir * 20.0
		for i in 3:
			fx(FLAME, 8, c + Vector2(randf_range(-12, 12), randf_range(-8, 8)), 16.0, 0.9)
		Game.add_shake(5.0)


## 레몬: 대지 가르기 — 앞쪽으로 바위 가시가 줄지어 솟는다
func _earth_split() -> void:
	var dir := player.aim(140.0)
	player.lock_for_skill(0.25, Vector2.ZERO, true)
	player.squash(Vector2(1.25, 0.8))
	Game.sfx(&"heavy", 0.0)
	Game.add_shake(5.0)
	var origin := player.global_position
	for i in 6:
		var p := origin + dir * (24.0 + i * 22.0)
		fx(ROCK_SPIKE, 10, p + Vector2(0, -16), 20.0, 1.1)
		fx(SMOKE, 6, p, 16.0, 0.8, Color(0.85, 0.7, 0.5))
		hit_all(enemies_in(p, 20.0), 1.8, 260.0, p - dir * 10.0)
		Game.sfx(&"boom", -10.0)
		await wait(0.06)


## 리넨: 천벌의 빛 — 넓은 범위 모든 적에게 번개
func _judgement() -> void:
	fx(SHIELD, 6, player.body_center() + Vector2(0, -6), 12.0, 1.8)
	fx(SPARK, 10, player.body_center(), 16.0, 1.6)
	await wait(0.2)
	var targets := enemies_in(player.global_position, 180.0, 8)
	for e in targets:
		if not alive():
			return
		if not is_instance_valid(e):
			continue
		var f := fx(THUNDER, 8, e.global_position + Vector2(0, -20), 20.0, 1.8, Color(1.0, 1.0, 0.8))
		f.z_index = 8
		fx(SPARK, 10, e.global_position, 18.0, 1.0)
		hit_all([e], 2.5, 120.0, e.global_position + Vector2(0, -1))
		Game.sfx(&"boom", -6.0)
		Game.add_shake(3.0)
		await wait(0.07)


## 코튼: 그림자 습격 — 주변 적 4명에게 순간이동하며 벤다(그동안 무적)
func _shadow_raid() -> void:
	var targets := enemies_in(player.global_position, 140.0, 4)
	player.lock_for_skill(0.15 + targets.size() * 0.16, Vector2.ZERO, true)
	fx(SMOKE, 6, player.body_center(), 18.0, 1.2, Color(0.6, 0.4, 0.9))
	for e in targets:
		if not alive():
			return
		if not is_instance_valid(e):
			continue
		var side := Vector2.from_angle(randf() * TAU) * 14.0
		fx(SMOKE, 6, player.body_center(), 20.0, 0.9, Color(0.5, 0.3, 0.8))
		player.global_position = e.global_position + side
		fx(CLAW, 4, e.global_position + Vector2(0, -8), 22.0, 1.4, Color(0.8, 0.55, 1.0), randf() * TAU)
		hit_all([e], 1.9, 160.0, player.global_position)
		Game.sfx(&"slash", 0.0)
		await wait(0.16)


## 플로라: 꽃잎 폭풍 — 꿰뚫는 꽃잎 회오리 3개를 부채꼴로
func _petal_storm() -> void:
	var dir := player.aim(160.0)
	fx(SPARK, 10, player.body_center(), 16.0, 1.4, Color(1.0, 0.75, 0.9))
	for k in 3:
		var d := dir.rotated((k - 1) * 0.35)
		var pr := Projectile.spawn(player, player.body_center() + d * 8.0, d, {
			"speed": 150.0, "tex": SPIRIT, "frames": 5, "angle_offset": 0.0, "radius": 10.0,
			"mult": 2.0, "knock": 180.0, "pierce": 99, "range": 210.0, "scale": 1.5,
			"hit_tex": SPARK, "hit_frames": 10,
		})
		pr.sprite.modulate = Color(1.0, 0.7, 0.9)
	Game.sfx(&"ice_shot", 0.0, 0.0)
	player.squash(Vector2(0.85, 1.15))


# ── 엘프·마족 8명 전용 스킬 ──

## 적을 잠깐 묶는다(맞으면 0.3초로 덮이므로 hit 다음에 부른다)
func _bind(list: Array, sec: float, tint: Color) -> void:
	for e: Variant in list:
		if is_instance_valid(e) and e.get(&"hp") > 0:
			e.stun_t = maxf(float(e.stun_t), sec)
			var sp := e.get_node_or_null(^"Sprite") as Sprite2D
			if sp:
				sp.modulate = tint
				e.create_tween().tween_property(sp, ^"modulate", Color.WHITE, sec)


## 핀: 질풍 난무 — 세 번 회전하며 돌 때마다 바람 칼날 8개를 사방으로 날린다
func _wind_dance() -> void:
	player.lock_for_skill(0.9, Vector2.ZERO, true)
	for spin in 3:
		if not alive():
			return
		var c := player.body_center()
		fx(CIRCULAR, 4, c, 20.0, 2.0, Color(0.55, 1.0, 0.65), spin * 0.8)
		player.squash(Vector2(1.2, 0.85), 0.12)
		for i in 8:
			var d := Vector2.from_angle(i * TAU / 8.0 + spin * 0.4)
			var pr := Projectile.spawn(player, c + d * 10.0, d, {
				"speed": 210.0, "tex": LEAF, "frames": 6, "angle_offset": 0.0, "radius": 8.0,
				"mult": 0.7, "knock": 90.0, "pierce": 3, "range": 120.0, "scale": 1.3,
				"hit_tex": CUT_X, "hit_frames": 4,
			})
			pr.sprite.modulate = Color(0.6, 1.0, 0.7)
		hit_all(enemies_in(c, 34.0), 0.8, 140.0, c)
		Game.sfx(&"slash", -2.0)
		await wait(0.28)


## 리아: 성광의 비 — 1.2초 동안 빛줄기가 쏟아지고, 마지막에 큰 빛기둥과 함께 체력을 조금 회복
func _light_rain() -> void:
	fx(SHIELD, 6, player.body_center() + Vector2(0, -6), 12.0, 1.6, Color(1.0, 0.95, 0.6))
	for k in 10:
		if not alive():
			return
		var targets := enemies_in(player.global_position, 150.0, 8)
		var p: Vector2
		if not targets.is_empty() and k % 3 != 2:
			p = targets[k % targets.size()].global_position + Vector2(randf_range(-8, 8), randf_range(-6, 6))
		else:
			p = player.global_position + Vector2.from_angle(randf() * TAU) * randf_range(20, 110)
		var f := fx(THUNDER, 8, p + Vector2(0, -20), 22.0, 1.2, Color(1.0, 0.95, 0.55))
		f.z_index = 8
		fx(SPARK, 10, p, 20.0, 0.8, Color(1.0, 0.95, 0.7))
		hit_all(enemies_in(p, 22.0), 0.9, 60.0, p + Vector2(0, -1))
		Game.sfx(&"boom", -12.0)
		await wait(0.12)
	if alive():
		var c := player.global_position
		var big := fx(THUNDER, 8, c + Vector2(0, -26), 16.0, 2.4, Color(1.0, 1.0, 0.75))
		big.z_index = 8
		fx(CIRCLE, 4, player.body_center(), 12.0, 3.0, Color(1.0, 0.95, 0.6, 0.8))
		hit_all(enemies_in(c, 70.0), 2.0, 260.0, c)
		player.heal(maxi(1, roundi(player.max_hp * 0.05)))
		Game.add_shake(6.0)
		Game.sfx(&"heal", -2.0, 0.0)


## 레비: 깃털 폭풍 — 검은 깃털 7개를 부채꼴로 두 번 흩뿌린다(두 번째는 엇갈리게)
func _feather_storm() -> void:
	var dir := player.aim(150.0)
	for wave in 2:
		if not alive():
			return
		var c := player.body_center()
		fx(SMOKE, 6, c, 18.0, 1.0, Color(0.3, 0.45, 0.25))
		for k in 7:
			var d := dir.rotated((k - 3) * 0.2 + wave * 0.1)
			var pr := Projectile.spawn(player, c + d * 8.0, d, {
				"speed": 230.0, "tex": LEAF, "frames": 6, "angle_offset": 0.0, "radius": 8.0,
				"mult": 0.9, "knock": 120.0, "pierce": 2, "range": 170.0, "scale": 1.2,
				"hit_tex": CLAW, "hit_frames": 4,
			})
			pr.sprite.modulate = Color(0.25, 0.3, 0.2)
		player.squash(Vector2(0.85, 1.15), 0.1)
		Game.sfx(&"ice_shot", -2.0)
		await wait(0.25)


## 카일: 빙결 균열 — 땅을 내려쳐 네 방향으로 얼음이 갈라지고, 맞은 적은 1.5초 얼어붙는다
func _frost_crack() -> void:
	player.lock_for_skill(0.4, Vector2.ZERO, true)
	player.squash(Vector2(0.85, 1.2), 0.15)
	await wait(0.15)
	if not alive():
		return
	player.squash(Vector2(1.3, 0.75))
	Game.sfx(&"heavy", 0.0)
	Game.add_shake(7.0)
	var o := player.global_position
	fx(ICE_BURST, 10, o + Vector2(0, -8), 20.0, 1.8)
	var hit: Array[Node2D] = []
	for step in 5:
		for d: Vector2 in [Vector2.RIGHT, Vector2.LEFT, Vector2.UP, Vector2.DOWN]:
			var p := o + d * (22.0 + step * 20.0)
			fx(ICE_BURST, 10, p + Vector2(0, -8), 24.0, 0.9 + step * 0.05, Color(0.75, 0.9, 1.0))
			for e in enemies_in(p, 18.0):
				if not hit.has(e):
					hit.append(e)
		Game.sfx(&"ice_shot", -8.0)
		await wait(0.05)
	if not alive():
		return
	hit_all(hit, 2.2, 40.0, o)
	_bind(hit, 1.5, Color(0.6, 0.85, 1.0))


## 엘린: 가시덩굴 솟음 — 적 6명 발밑에서 덩굴이 솟아 2초 묶고, 다시 한 번 찌른다
func _thorn_rise() -> void:
	var targets := enemies_in(player.global_position, 160.0, 6)
	if targets.is_empty():
		fx(ROCK_SPIKE, 10, player.global_position + player.aim(1.0) * 40.0 + Vector2(0, -16), 20.0, 1.1, Color(0.55, 0.9, 0.35))
		return
	for e in targets:
		if is_instance_valid(e):
			fx(ROCK_SPIKE, 10, e.global_position + Vector2(0, -16), 20.0, 1.1, Color(0.55, 0.9, 0.35))
			fx(LEAF, 6, e.global_position + Vector2(0, -6), 14.0, 1.2, Color(0.6, 1.0, 0.4))
	Game.sfx(&"heavy", -4.0)
	hit_all(targets, 1.4, 0.0, player.global_position)
	_bind(targets, 2.0, Color(0.7, 1.0, 0.55))
	await wait(0.7)
	if not alive():
		return
	for e in targets:
		if is_instance_valid(e) and e.get(&"hp") > 0:
			fx(ROCK_SPIKE, 10, e.global_position + Vector2(0, -16), 24.0, 1.4, Color(0.4, 0.8, 0.3))
	hit_all(targets, 1.6, 200.0, player.global_position)
	Game.sfx(&"boom", -6.0)


## 로웬: 질풍 돌격 — 가까운 적을 향해 세 번 연달아 돌진하며 벤다(마지막은 크게)
func _gale_charge() -> void:
	for k in 3:
		if not alive():
			return
		var near := enemies_in(player.global_position, 140.0, 1)
		var dir := player.aim(1.0)
		if not near.is_empty():
			dir = player.global_position.direction_to(near[0].global_position)
		var start := player.global_position
		player.lock_for_skill(0.16, dir * 520.0, true)
		Game.sfx(&"dash", -2.0)
		for i in 3:
			fx(SMOKE, 6, start + dir * (i * 18.0), 18.0, 0.7, Color(0.7, 1.0, 0.8, 0.8))
		await wait(0.16)
		if not alive():
			return
		var end := player.global_position
		var hits: Array[Node2D] = []
		for e: Node2D in enemies_in((start + end) / 2.0, start.distance_to(end) / 2.0 + 26.0):
			if Geometry2D.get_closest_point_to_segment(e.global_position, start, end).distance_to(e.global_position) < 26.0:
				hits.append(e)
		var last := k == 2
		fx(SLASH_DOUBLE, 4, end + Vector2(0, -8), 22.0, 1.6 if last else 1.2, Color(0.6, 1.0, 0.75), dir.angle())
		hit_all(hits, 2.6 if last else 1.2, 360.0 if last else 80.0, start)
		Game.add_shake(8.0 if last else 3.0)
		Game.sfx(&"slash", 0.0)
		await wait(0.06)


## 벨라: 칠흑의 날개 — 날개를 펼쳐(무적) 어둠 구슬 8개가 나선으로 퍼진 뒤 한가운데서 터진다
func _dark_wings() -> void:
	player.lock_for_skill(1.1, Vector2.ZERO, true)
	var c := player.body_center()
	fx(AURA, 5, c + Vector2(0, 4), 12.0, 1.8, Color(0.75, 0.2, 0.35))
	fx(CLAW, 4, c + Vector2(-14, -6), 14.0, 1.6, Color(0.5, 0.1, 0.2), -0.5)
	fx(CLAW, 4, c + Vector2(14, -6), 14.0, 1.6, Color(0.5, 0.1, 0.2), PI + 0.5)
	Game.sfx(&"charge", -4.0, 0.0)
	for k in 8:
		var d := Vector2.from_angle(k * TAU / 8.0)
		var pr := Projectile.spawn(player, c + d * 12.0, d.rotated(0.6), {
			"speed": 120.0, "tex": SPIRIT, "frames": 5, "angle_offset": 0.0, "radius": 10.0,
			"mult": 1.0, "knock": 100.0, "pierce": 99, "range": 110.0, "scale": 1.3,
			"hit_tex": SPARK, "hit_frames": 10,
		})
		pr.sprite.modulate = Color(0.85, 0.2, 0.4)
	await wait(0.8)
	if not alive():
		return
	c = player.body_center()
	fx(EXPLOSION, 9, c, 18.0, 2.2, Color(0.7, 0.15, 0.4))
	fx(CIRCLE, 4, c, 12.0, 3.2, Color(0.9, 0.25, 0.45, 0.8))
	hit_all(enemies_in(c, 75.0), 3.0, 380.0, c)
	Game.add_shake(9.0)
	Game.sfx(&"boom", 0.0)


## 실바: 심연의 비 — 꼬리로 한 바퀴 휩쓸어 밀어낸 뒤, 주변에 깊은 바다 물방울이 네 번 쏟아진다
func _abyss_rain() -> void:
	var c := player.body_center()
	fx(CIRCULAR, 4, c, 18.0, 2.2, Color(0.45, 0.9, 1.0))
	hit_all(enemies_in(c, 44.0), 1.2, 300.0, c)
	Game.sfx(&"slash", 0.0)
	for wave in 4:
		await wait(0.22)
		if not alive():
			return
		var targets := enemies_in(player.global_position, 140.0, 5)
		var spots: Array[Vector2] = []
		for e in targets:
			spots.append(e.global_position)
		while spots.size() < 5:
			spots.append(player.global_position + Vector2.from_angle(randf() * TAU) * randf_range(30, 110))
		for p in spots:
			fx(WATER_SPLASH, 10, p, 20.0, 1.1, Color(0.5, 0.95, 0.9))
			fx(WATER_PILLAR, 9, p + Vector2(0, -14), 22.0, 0.8, Color(0.55, 0.9, 1.0))
		hit_all(targets, 1.0, 70.0, player.global_position)
		Game.sfx(&"ice_shot", -4.0)
		Game.add_shake(2.5)
