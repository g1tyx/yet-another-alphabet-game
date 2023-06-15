#version 300 es

precision highp float;

in vec2 v_position;
flat in vec4 v_color;
flat in float v_life;

uniform float u_now;

out vec4 outColor;

const vec4 COLOR = vec4(1.0,1.0,1.0,0.0);

const vec4 BORDER_GLOW[6] = vec4[6](
	vec4(0.2,0.2,0.2,0.0),
	vec4(0.2,0.2,0.2,0.0),
	vec4(0.0,0.0,0.0,0.0),
	vec4(-0.2,-0.2,-0.2,0.0),
	vec4(-0.2,-0.2,-0.2,0.0),
	vec4(0.0,0.0,0.0,0.0)
);

const vec2 X_STEP = vec2(1.0 / 128.0, 0.0);
const vec2 Y_STEP = vec2(0.0, 1.0 / 128.0);

uniform sampler2D u_glyphs;

void main() {
	if (v_life > 1.0)
		discard;

	vec4 color = v_color;

	vec4 texture_color;

	texture_color = texture(u_glyphs, v_position);

	texture_color.a = abs(texture_color.a);
	color.a *= 1.0 - v_life;

	outColor = color * (texture_color);
}