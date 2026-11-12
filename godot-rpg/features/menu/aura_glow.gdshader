shader_type canvas_item;
// 로비 일러스트 뒤 아우라: 그림의 윤곽(투명도)을 둘레로 번지게 해서 한 가지 색 빛으로 칠한다.
// rainbow > 0이면 위치·시간에 따라 무지개색으로 흐른다(7성).

uniform vec4 glow_color : source_color = vec4(1.0, 1.0, 1.0, 0.0);  // 기본은 투명(로비가 별 색을 넣기 전 첫 화면에 다른 색이 비치지 않게)
uniform float radius = 14.0;
uniform float strength = 1.0;
uniform float rainbow = 0.0;
uniform float time = 0.0;

vec3 hue(float h) {
	return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
}

void fragment() {
	vec2 px = TEXTURE_PIXEL_SIZE * radius;
	float a = 0.0;
	for (int i = 0; i < 16; i++) {
		float ang = float(i) / 16.0 * 6.2831853;
		a += texture(TEXTURE, UV + vec2(cos(ang), sin(ang)) * px).a;
		a += texture(TEXTURE, UV + vec2(cos(ang + 0.2), sin(ang + 0.2)) * px * 0.55).a;
	}
	a = clamp(a / 9.0, 0.0, 1.0);
	vec3 c = mix(glow_color.rgb, hue(fract(UV.y * 0.8 - time * 0.25)), rainbow);
	COLOR = vec4(c, glow_color.a * a * strength);
}
