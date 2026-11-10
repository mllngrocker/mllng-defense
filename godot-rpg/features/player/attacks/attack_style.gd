class_name AttackStyle
extends Node
## 공격 방식의 공통 틀. 용사(Player)가 버튼 입력과 매 프레임을 넘겨준다.
## 방식마다 이 파일을 상속해서 press·release·physics를 채운다.

var player: Player
var data: CharacterData
## true면 용사가 직접 못 움직이고 lunge 속도로만 움직인다
var busy := false
var lunge := Vector2.ZERO
## 이동 속도 배율(기 모으는 동안 느려지는 등)
var move_scale := 1.0


func setup(p: Player, d: CharacterData) -> void:
	player = p
	data = d


## 지금 공격 버튼을 받아도 되는지
func wants_press() -> bool:
	return true


func press() -> void:
	pass


func release() -> void:
	pass


func physics(_delta: float) -> void:
	pass


## 구르기 등으로 공격이 끊길 때
func cancel() -> void:
	busy = false
	lunge = Vector2.ZERO
	move_scale = 1.0


## 공격 그림 효과를 띄운다. 방향(angle)과 색은 캐릭터마다.
func spawn_fx(tex: Texture2D, frames: int, pos: Vector2, angle: float, fps := 18.0, fx_scale := 1.0, tint := Color.WHITE) -> Fx:
	var fx := Fx.spawn(player.fx_parent(), tex, frames, pos, fps)
	fx.rotation = angle
	fx.scale = Vector2.ONE * fx_scale
	fx.modulate = tint
	return fx
