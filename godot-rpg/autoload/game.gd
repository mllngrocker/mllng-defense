extends Node
## 게임 전체 연출 도우미: 효과음, 화면 흔들림, 타격 순간 멈춤, 기본 글꼴.

const SFX: Dictionary[StringName, AudioStream] = {
	&"slash": preload("res://assets/ninja/sfx/slash.wav"),
	&"hit": preload("res://assets/ninja/sfx/hit.wav"),
	&"kill": preload("res://assets/ninja/sfx/kill.wav"),
	&"hurt": preload("res://assets/ninja/sfx/hurt.wav"),
	&"pickup": preload("res://assets/ninja/sfx/pickup.wav"),
	&"dash": preload("res://assets/ninja/sfx/dash.wav"),
	&"bush": preload("res://assets/ninja/sfx/bush.wav"),
	&"ice_shot": preload("res://assets/ninja/sfx/ice_shot.wav"),
	&"charge": preload("res://assets/ninja/sfx/charge.wav"),
	&"charged": preload("res://assets/ninja/sfx/charged.wav"),
	&"heavy": preload("res://assets/ninja/sfx/heavy.wav"),
	&"boom": preload("res://assets/ninja/sfx/boom.wav"),
	&"coin": preload("res://assets/ninja/sfx/coin.wav"),
	&"success": preload("res://assets/ninja/sfx/success.wav"),
	&"levelup": preload("res://assets/ninja/sfx/levelup.wav"),
	&"crit": preload("res://assets/ninja/sfx/crit.wav"),
	&"skill_fire": preload("res://assets/ninja/sfx/skill_fire.wav"),
	&"skill_water": preload("res://assets/ninja/sfx/skill_water.wav"),
	&"skill_wind": preload("res://assets/ninja/sfx/skill_wind.wav"),
	&"skill_earth": preload("res://assets/ninja/sfx/skill_earth.wav"),
	&"skill_light": preload("res://assets/ninja/sfx/skill_light.wav"),
	&"skill_dark": preload("res://assets/ninja/sfx/skill_dark.wav"),
	&"alert": preload("res://assets/ninja/sfx/alert.wav"),
	&"heal": preload("res://assets/ninja/sfx/heal.wav"),
	&"powerup": preload("res://assets/ninja/sfx/powerup.wav"),
	&"burn": preload("res://assets/ninja/sfx/burn.wav"),
	&"hit_heavy": preload("res://assets/ninja/sfx/hit_heavy.wav"),
}
const VOICES := 8

## 지금 화면 흔들림 세기(픽셀). 카메라가 읽어 가며 줄인다.
var shake := 0.0
## 녹화용 연출에서는 끈다(녹화 프레임 계산이 꼬여서).
var hitstop_enabled := true
## 맵을 옮길 때 도착할 지점 이름(새 맵의 Spawns/이름). 비면 맵의 기본 시작 위치.
var next_spawn := ""
## 로비에서 모험으로 돌아올 때 세울 자리(없으면 Vector2.INF)
var resume_pos := Vector2.INF
## 일일 던전 중이면 종류("gold"·"gear"·"book"), 아니면 빈 값
var dungeon := ""
## 퀘스트 자동 이동 중이면 {goal: 맵 id, kind, target}(Travel), 아니면 빈 값
var travel: Dictionary = {}
var _voices: Array[AudioStreamPlayer] = []
var _next_voice := 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	for bus in ["Music", "SFX"]:
		if AudioServer.get_bus_index(bus) < 0:
			AudioServer.add_bus()
			AudioServer.set_bus_name(AudioServer.bus_count - 1, bus)
			AudioServer.set_bus_send(AudioServer.bus_count - 1, &"Master")
	apply_volume.call_deferred()
	for i in VOICES:
		var p := AudioStreamPlayer.new()
		p.bus = &"SFX"
		add_child(p)
		_voices.append(p)
	_setup_font()


func sfx(sound: StringName, volume_db := 0.0, pitch_jitter := 0.08) -> void:
	var p := _voices[_next_voice]
	_next_voice = (_next_voice + 1) % VOICES
	p.stream = SFX[sound]
	p.volume_db = volume_db
	p.pitch_scale = 1.0 + randf_range(-pitch_jitter, pitch_jitter)
	p.play()


func add_shake(amount: float) -> void:
	if not bool(Save.settings.get("shake", true)):
		return
	shake = maxf(shake, amount)


## 설정의 배경음·효과음 크기를 소리 버스에 반영
func apply_volume() -> void:
	for pair: Array in [["Music", "bgm"], ["SFX", "sfx"]]:
		var i := AudioServer.get_bus_index(pair[0])
		if i < 0:
			continue
		var v := float(Save.settings.get(pair[1], 0.8))
		AudioServer.set_bus_mute(i, v <= 0.01)
		AudioServer.set_bus_volume_db(i, linear_to_db(maxf(v, 0.001)))


## 다른 맵으로 이동(이동문에서 부른다). 저장하고 장면을 바꾼다.
func go_to(scene_path: String, spawn: String) -> void:
	next_spawn = spawn
	Engine.time_scale = 1.0
	Save.save_game()
	get_tree().change_scene_to_file.call_deferred(scene_path)


## 맞는 순간 게임을 아주 잠깐 거의 멈춰서 타격감을 준다.
## 화면 전체를 잠깐 색으로 번쩍(치명타·보스 내려치기·레벨 업)
var _flash_rect: ColorRect


func flash(color: Color, duration := 0.12) -> void:
	if not bool(Save.settings.get("shake", true)):
		return
	if not is_instance_valid(_flash_rect):
		var layer := CanvasLayer.new()
		layer.layer = 60
		add_child(layer)
		_flash_rect = ColorRect.new()
		_flash_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
		_flash_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
		layer.add_child(_flash_rect)
	_flash_rect.color = color
	var tw := _flash_rect.create_tween()
	tw.tween_property(_flash_rect, ^"color:a", 0.0, duration)


## 속성 → 스킬 쓸 때 소리
const ELEMENT_SFX: Array[StringName] = [&"skill_fire", &"skill_water", &"skill_wind", &"skill_earth", &"skill_light", &"skill_dark"]


func hitstop(duration: float) -> void:
	if not hitstop_enabled:
		return
	Engine.time_scale = 0.05
	await get_tree().create_timer(duration, true, false, true).timeout
	Engine.time_scale = 1.0


## 도트 글꼴(영문·숫자) + 한글은 시스템 글꼴로 대신(한글은 고해상도라 부드럽게).
func _setup_font() -> void:
	var font := load("res://assets/ninja/ui/font.ttf") as FontFile
	font.antialiasing = TextServer.FONT_ANTIALIASING_NONE
	font.hinting = TextServer.HINTING_NONE
	font.subpixel_positioning = TextServer.SUBPIXEL_POSITIONING_DISABLED
	var korean := SystemFont.new()
	korean.font_names = PackedStringArray(["Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans CJK KR"])
	font.fallbacks = [korean]
	ThemeDB.fallback_font = font
