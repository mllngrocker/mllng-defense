extends Node2D
## 맵 전체에 내리는 눈송이(그림만, 부딪힘 없음).
## storm_boss가 있으면: 그 보스를 잡기 전에는 눈보라(옆으로 몰아치는 굵은 눈 + 하얀 안개 + 돌풍),
## 잡은 뒤 처음 들어오면 눈보라가 몇 초에 걸쳐 잦아들고, 그다음부터는 잔잔한 눈만 내린다.

@export var area := Rect2(0, 0, 544, 480)
@export var count := 120
@export var storm_boss := ""
## 보스와 상관없이 늘 부는 눈보라 세기(0 잔잔 ~ 1 매서움): 설산은 오를수록 세진다
@export var intensity := 0.0

const CALM_SECONDS := 5.0

var t := 0.0
var storm := 0.0  # 1 = 눈보라, 0 = 잔잔
var _calming := false
var _fog: ShaderMaterial
var _gust := 0.0
var _white: ColorRect  # 화면 전체가 하얗게 흐려지는 막


func _ready() -> void:
	z_index = 30
	if storm_boss == "":
		storm = intensity
		if storm > 0.0:
			_make_fog()
		return
	var key := "calm_" + storm_boss
	if not Quests.boss_defeated(storm_boss):
		storm = 1.0
	elif not bool(Save.quest.get(key, false)):
		storm = 1.0
		_calming = true  # 보스를 잡고 처음 왔다: 눈보라가 걷힌다
		Save.quest[key] = true
		Events.notice.emit.call_deferred("눈보라가 잦아들었다", "수정 거미 여왕이 쓰러지자 설산의 바람이 잠잠해졌어요")
	if storm > 0.0:
		_make_fog()


func _make_fog() -> void:
	if true:
		var layer := CanvasLayer.new()
		layer.layer = 0
		var r := ColorRect.new()
		r.set_anchors_preset(Control.PRESET_FULL_RECT)
		r.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_fog = ShaderMaterial.new()
		_fog.shader = preload("res://shared/fog.gdshader")
		_fog.set_shader_parameter(&"fog_color", Color(0.94, 0.97, 1.0))
		r.material = _fog
		layer.add_child(r)
		_white = ColorRect.new()
		_white.set_anchors_preset(Control.PRESET_FULL_RECT)
		_white.mouse_filter = Control.MOUSE_FILTER_IGNORE
		layer.add_child(_white)
		add_child(layer)


func _process(delta: float) -> void:
	t += delta
	if _calming:
		storm = maxf(0.0, storm - delta / CALM_SECONDS)
		if storm <= 0.0:
			_calming = false
	if storm > 0.0:
		_gust = 0.5 + 0.5 * sin(t * 0.9) * sin(t * 2.3)  # 돌풍: 세졌다 약해졌다
	if _fog:
		_fog.set_shader_parameter(&"strength", (0.78 + 0.2 * _gust) * storm)
	if _white:
		_white.color = Color(0.92, 0.96, 1.0, (0.1 + 0.12 * _gust) * storm)
	queue_redraw()


func _draw() -> void:
	# 잔잔한 눈(언제나)
	for i in count:
		var s := float(i) * 7.913
		var speed := 14.0 + fmod(s * 3.1, 16.0)
		var y := fmod(fmod(s * 61.0, area.size.y) + t * speed, area.size.y)
		var x := fmod(s * 97.0, area.size.x) + sin(t * 0.8 + s) * 8.0
		var big := i % 4 == 0
		draw_rect(Rect2(area.position + Vector2(x, y), Vector2(2, 2) if big else Vector2(1, 1)), Color(1, 1, 1, 0.85 if big else 0.6))
	if storm <= 0.0:
		return
	# 눈보라: 바람에 옆으로 날리는 굵은 눈발(줄무늬)
	var wind := Vector2(1.0, 0.45).normalized()
	var n := int(600 * storm)  # 휴대폰 렉 줄이기(예전 900)
	for i in n:
		var s := float(i) * 3.731 + 11.0
		var speed := (160.0 + fmod(s * 13.7, 140.0)) * (0.8 + 0.6 * _gust)
		var d := fmod(fmod(s * 53.0, area.size.x + area.size.y) + t * speed, area.size.x + area.size.y)
		var start := Vector2(-area.size.y * 0.45 + fmod(s * 89.0, area.size.x + area.size.y * 0.45), fmod(s * 41.0, area.size.y))
		var p := start + wind * d
		p = Vector2(fposmod(p.x, area.size.x), fposmod(p.y, area.size.y))
		var len := 6.0 + fmod(s * 5.3, 10.0) * (0.7 + _gust)
		var a := (0.55 + fmod(s * 0.37, 0.45)) * storm
		draw_line(area.position + p, area.position + p - wind * len, Color(1, 1, 1, a), 1.0 if i % 3 else 2.5)
