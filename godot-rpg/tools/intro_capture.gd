extends Node
## 시작 화면 캡처용: -- --pick 이면 동료 고르기 단계부터

func _ready() -> void:
	Save.persist = false
	Save.fresh = true
	Save.settings["nick"] = "엄준식앙"  # 한글 이름이 네모 없이 보이는지
	var intro := IntroScreen.new()
	add_child(intro)
	if "--pick" in OS.get_cmdline_user_args():
		Save.settings["nick"] = "곰돌이"
		intro.step = 1
		intro.pick = &"kemo3"
		intro.call_deferred(&"_refresh")
