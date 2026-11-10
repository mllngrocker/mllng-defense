extends Node
## 전역 신호 버스. 게임 전체가 알아야 하는 일만 둔다.

signal character_changed(data: CharacterData, level: int)
signal player_hp_changed(hp: int, max_hp: int)
signal player_died
signal enemy_died(kind: String)
signal skill_cast(data: CharacterData)
signal map_entered(title: String)
signal boss_hp(name: String, hp: int, max_hp: int)
## 화면 가운데 알림(제목, 설명) — HUD가 보여 준다
signal notice(title: String, sub: String)
