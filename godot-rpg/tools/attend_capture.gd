extends Node
## 출석 달력 캡처용: 9일째(7일 큰 보상은 받은 상태)


func _ready() -> void:
	Save.persist = false
	Save.settings["attend"] = {"day": 8, "last": "2000-01-01"}
	add_child(Attendance.new())
