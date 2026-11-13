shader_type canvas_item;
// 흘러가는 안개(화면 전체): 두 겹의 부드러운 노이즈가 서로 다른 방향으로 천천히 흐른다
uniform vec4 fog_color : source_color = vec4(0.86, 0.9, 1.0, 1.0);
uniform float strength = 0.62;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
	float v = 0.0; float a = 0.5;
	for (int k = 0; k < 3; k++) { v += a * noise(p); p *= 2.03; a *= 0.5; }  // 휴대폰에서 가볍게(예전 4겹)
	return v;
}
void fragment() {
	vec2 p = SCREEN_UV * vec2(3.0, 5.0);
	float a = fbm(p + vec2(TIME * 0.05, TIME * 0.015));
	float b = fbm(p * 1.6 - vec2(TIME * 0.03, -TIME * 0.02));
	float f = smoothstep(0.22, 0.78, a * 0.6 + b * 0.5);
	COLOR = vec4(fog_color.rgb, f * strength);
}
