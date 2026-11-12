shader_type canvas_item;
// 7성 스킨 색 바꾸기 + 맞았을 때 번쩍임(용사 그림·로비 일러스트 공용).
// 색 바꾸기: 원래 색상(hue)이 src_hue ± src_width 안인 채도 있는 부분을 dst_hue로 옮긴다(두 묶음까지).
// 살색(채도 낮은 주황)은 min_sat으로 건드리지 않는다. skin = 0이면 원래 그림 그대로.

uniform float flash : hint_range(0.0, 1.0) = 0.0;
uniform vec4 flash_color : source_color = vec4(1.0);
uniform float skin = 0.0;
uniform float min_sat = 0.18;
uniform vec4 src_hue = vec4(0.0);      // x, y = 첫째·둘째 묶음 원래 색상
uniform vec4 src_width = vec4(0.0);    // x, y = 묶음 폭(0이면 안 씀)
uniform vec4 dst_hue = vec4(0.0);      // x, y = 바꿀 색상
uniform vec4 sat_mul = vec4(1.0);      // x, y = 채도 배율
uniform vec4 val_mul = vec4(1.0);      // x, y = 밝기 배율

vec3 rgb2hsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
	vec3 p = abs(fract(c.xxx + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0);
	return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

float hue_dist(float a, float b) {
	float d = abs(a - b);
	return min(d, 1.0 - d);
}

vec3 remap(vec3 hsv, float s_hue, float s_w, float d_hue, float s_mul, float v_mul) {
	if (s_w <= 0.0 || hsv.y < min_sat) {
		return hsv;
	}
	float d = hue_dist(hsv.x, s_hue);
	float k = 1.0 - smoothstep(s_w * 0.7, s_w, d);  // 가장자리는 부드럽게
	if (k <= 0.0) {
		return hsv;
	}
	float off = hsv.x - s_hue;
	off = off - round(off);
	vec3 n = vec3(fract(d_hue + off * 0.5), clamp(hsv.y * s_mul, 0.0, 1.0), clamp(hsv.z * v_mul, 0.0, 1.0));
	return mix(hsv, n, k);
}

void fragment() {
	vec4 c = texture(TEXTURE, UV) * COLOR;
	if (skin > 0.0) {
		vec3 hsv = rgb2hsv(c.rgb);
		vec3 a = remap(hsv, src_hue.x, src_width.x, dst_hue.x, sat_mul.x, val_mul.x);
		vec3 b = remap(a, src_hue.y, src_width.y, dst_hue.y, sat_mul.y, val_mul.y);
		c.rgb = mix(c.rgb, hsv2rgb(b), skin);
	}
	COLOR = vec4(mix(c.rgb, flash_color.rgb, flash), c.a);
}
