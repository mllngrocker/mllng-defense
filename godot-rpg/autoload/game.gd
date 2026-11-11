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
