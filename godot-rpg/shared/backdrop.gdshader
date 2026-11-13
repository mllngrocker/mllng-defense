shader_type canvas_item;
// 맵 뒤 배경(물·허공 자리에 보인다). mode 0: 하늘(구름 바다, height가 높을수록 짙은 남색 + 별)
// mode 1: 바다(짙은 파랑, 물결 빛 무늬 + 위로 오르는 거품). cam: 카메라 위치(천천히 따라 움직임)
uniform int mode = 0;
uniform float height = 0.0;
uniform vec2 cam = vec2(0.0);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
	vec2 i = floor(p); vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
	float v = 0.0; float a = 0.5;
	for (int k = 0; k < 3; k++) { v += a * noise(p); p *= 2.02; a *= 0.5; }  // 휴대폰에서 가볍게(예전 5겹)
	return v;
}
void fragment() {
	vec2 res = 1.0 / SCREEN_PIXEL_SIZE;
	vec2 p = (SCREEN_UV * res + cam * 0.35) / 160.0;
	vec3 col;
	if (mode == 0) {
		vec3 low = mix(vec3(0.55, 0.78, 1.0), vec3(0.10, 0.12, 0.32), height);
		vec3 deep = mix(vec3(0.75, 0.88, 1.0), vec3(0.03, 0.04, 0.14), height);
		col = mix(deep, low, SCREEN_UV.y);
		float c = fbm(p * 1.2 + vec2(TIME * 0.02, 0.0));
		float c2 = fbm(p * 2.3 - vec2(TIME * 0.035, TIME * 0.01));
		float cloud = smoothstep(0.42, 0.75, c * 0.65 + c2 * 0.45) * (1.0 - height * 0.75);
		col = mix(col, vec3(1.0, 1.0, 1.0) * (1.0 - height * 0.4), cloud * 0.9);
		// 높이 올라갈수록 별
		float st = step(0.995 - height * 0.006, hash(floor((SCREEN_UV * res + cam * 0.1) / 3.0)));
		col += vec3(st) * height * (0.6 + 0.4 * sin(TIME * 3.0 + hash(floor(SCREEN_UV * res / 3.0)) * 6.0));
	} else {
		col = mix(vec3(0.05, 0.25, 0.42), vec3(0.01, 0.08, 0.2), SCREEN_UV.y);
		float w = fbm(p * 3.0 + vec2(TIME * 0.05, TIME * 0.03));
		float w2 = fbm(p * 3.0 - vec2(TIME * 0.04, -TIME * 0.02) + 7.0);
		float caustic = pow(1.0 - abs(w - w2) * 4.0, 6.0);
		col += vec3(0.25, 0.55, 0.65) * clamp(caustic, 0.0, 1.0) * 0.35;
		// 위로 떠오르는 거품
		vec2 bp = SCREEN_UV * res / 26.0 + vec2(0.0, TIME * 0.8);
		vec2 cell = floor(bp); vec2 f = fract(bp) - 0.5;
		float r = hash(cell);
		if (r > 0.86) { col += vec3(0.6, 0.85, 1.0) * smoothstep(0.12, 0.05, length(f + vec2(sin(TIME + r * 20.0) * 0.15, 0.0))) * 0.6; }
	}
	COLOR = vec4(col, 1.0);
}
