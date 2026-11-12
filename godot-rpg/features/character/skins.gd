class_name Skins
extends RefCounted
## 스킨: 지금은 미즈하「진홍 각성」·스칼렛「푸른 방울」 두 가지. 그 캐릭터가 7성이 되면 열리고,
## 로비 일러스트 위 '스킨' 버튼으로 켜고 끈다(Save.settings["skin_캐릭터"]). 켜 두면 색이 바뀌고 능력치가 오른다.
## 색 바꾸기는 shared/skin_flash.gdshader: [원래 색상, 폭, 바꿀 색상, 채도 배율, 밝기 배율] 최대 두 묶음(0 빨강·0.6 파랑).

## 캐릭터 → [스킨 이름, 색 묶음들, 능력치 {atk·hp·crit}]
const DATA := {
	&"kemo2": ["진홍 각성", [[0.45, 0.07, 0.985, 1.35, 0.88], [0.75, 0.10, 0.97, 1.05, 0.95]], {"atk": 0.12, "crit": 0.05}],
	&"scarlet": ["푸른 방울", [[0.99, 0.05, 0.60, 0.95, 0.9]], {"atk": 0.08, "hp": 0.15}],
}
const STAT_NAMES := {"atk": "공격력", "hp": "체력", "crit": "치명타"}


## 스킨이 있는 캐릭터인지(아직 못 열었어도)
static func exists(id: StringName) -> bool:
	return DATA.has(id)


## 열렸는지(7성)
static func unlocked(id: StringName) -> bool:
	return DATA.has(id) and Save.is_owned(id) and Save.rank_of(id) >= Save.MAX_RANK


## 지금 입고 있는지(열렸고 켜 둠)
static func has_skin(id: StringName) -> bool:
	return unlocked(id) and bool(Save.settings.get("skin_" + String(id), true))


static func toggle(id: StringName) -> void:
	Save.settings["skin_" + String(id)] = not has_skin(id)
	Save.equip_changed.emit()
	Save.save_game()


static func name_of(id: StringName) -> String:
	return DATA[id][0] if DATA.has(id) else ""


## 입고 있을 때 능력치(stat: atk·hp·crit)
static func bonus(id: StringName, stat: String) -> float:
	return float((DATA[id][2] as Dictionary).get(stat, 0.0)) if has_skin(id) else 0.0


static func bonus_text(id: StringName) -> String:
	var parts: Array[String] = []
	var b: Dictionary = DATA[id][2]
	for k: String in b:
		parts.append("%s +%d%%" % [STAT_NAMES[k], roundi(float(b[k]) * 100.0)])
	return " · ".join(parts)


## 셰이더 값 넣기(on=false면 원래 그림)
static func apply(mat: ShaderMaterial, id: StringName, on: bool) -> void:
	if mat == null:
		return
	if not on or not DATA.has(id):
		mat.set_shader_parameter(&"skin", 0.0)
		return
	var maps: Array = DATA[id][1]
	var v := [Vector4.ZERO, Vector4.ZERO, Vector4.ZERO, Vector4.ONE, Vector4.ONE]
	for i in mini(maps.size(), 2):
		var m: Array = maps[i]
		for k in 5:
			var vec: Vector4 = v[k]
			vec[i] = float(m[k])
			v[k] = vec
	mat.set_shader_parameter(&"src_hue", v[0])
	mat.set_shader_parameter(&"src_width", v[1])
	mat.set_shader_parameter(&"dst_hue", v[2])
	mat.set_shader_parameter(&"sat_mul", v[3])
	mat.set_shader_parameter(&"val_mul", v[4])
	mat.set_shader_parameter(&"skin", 1.0)
