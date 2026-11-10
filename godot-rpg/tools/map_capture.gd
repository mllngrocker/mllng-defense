extends Node
## 맵 전체를 그림 한 장으로 저장(확인용): HUD를 빼고 맵 크기 그대로 찍는다.
## 실행: godot --path godot-rpg res://tools/map_capture.tscn -- --map=village --out=C:/경로/village.png

func _ready() -> void:
	Save.persist = false
	var map := "village"
	var out := "user://map.png"
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--map="):
			map = a.trim_prefix("--map=")
		elif a.begins_with("--out="):
			out = a.trim_prefix("--out=")
	var path := "res://features/world/%s.tscn" % ("world" if map == "field" else map)
	var world := (load(path) as PackedScene).instantiate() as Node2D
	var ground := world.get_node(^"Ground") as TileMapLayer
	var rect := ground.get_used_rect()
	var px := Vector2i(rect.size * 16)
	var vp := SubViewport.new()
	vp.size = px
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(vp)
	vp.add_child(world)
	world.get_node(^"HUD").queue_free()
	var cam := world.get_node(^"Entities/Player/Camera") as Camera2D
	cam.enabled = false
	var fixed := Camera2D.new()
	fixed.position = Vector2(px) / 2.0
	vp.add_child(fixed)
	fixed.make_current()
	for e in get_tree().get_nodes_in_group(&"enemies"):
		e.set_physics_process(false)
	for i in 6:
		await RenderingServer.frame_post_draw
	vp.get_texture().get_image().save_png(out)
	print("저장: ", out, " ", px)
	get_tree().quit()
