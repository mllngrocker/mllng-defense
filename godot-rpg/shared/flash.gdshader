shader_type canvas_item;
// 맞았을 때 하얗게 번쩍이게 한다. flash 0 = 원래 그림, 1 = 완전히 하양.

uniform float flash : hint_range(0.0, 1.0) = 0.0;
uniform vec4 flash_color : source_color = vec4(1.0);

void fragment() {
	vec4 c = texture(TEXTURE, UV) * COLOR;
	COLOR = vec4(mix(c.rgb, flash_color.rgb, flash), c.a);
}
