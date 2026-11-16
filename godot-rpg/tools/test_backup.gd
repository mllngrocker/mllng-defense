extends Node
## 백업 코드 확인(헤드리스): 코드로 만들고 → 저장을 바꾼 뒤 → 코드로 되살리면 원래 값으로 돌아오는지. 원래 저장 파일은 끝나고 되돌린다.

var fails := 0


func _ready() -> void:
	var had := FileAccess.file_exists(Save.PATH)
	var original := FileAccess.get_file_as_string(Save.PATH) if had else ""
	Save.persist = true
	Save.gems = 12345
	Save.settings["nick"] = "백업곰"
	var code := Save.export_code()
	_check("백업 코드가 만들어짐(%d글자)" % code.length(), code.begins_with(Save.CODE_HEAD) and code.length() > 20)
	Save.gems = 1
	Save.settings["nick"] = "다른이름"
	Save.save_game()
	_check("잘못된 코드는 거절", not Save.import_code("엉터리코드"))
	_check("코드로 불러오면 되살아남", Save.import_code(code) and Save.gems == 12345 and Save.nickname() == "백업곰")
	# 원래 저장으로 되돌리기
	if had:
		var f := FileAccess.open(Save.PATH, FileAccess.WRITE)
		f.store_string(original)
		f.close()
	else:
		DirAccess.remove_absolute(ProjectSettings.globalize_path(Save.PATH))
	print("결과: ", "통과" if fails == 0 else "실패 %d개" % fails)
	get_tree().quit(fails)


func _check(label: String, ok: bool) -> void:
	print(("  OK  " if ok else "  FAIL ") + label)
	if not ok:
		fails += 1
