#version 300 es

precision mediump float;

const float HIDE_TIME = 200.0;
const float SHOW_TIME = 200.0;

in vec2 v_position;
flat in vec4 v_color;
flat in vec2 v_image_center;
flat in vec2 v_image_size;
flat in float v_chosen;

uniform highp float u_now;
uniform highp float u_show;
uniform highp float u_hide;

uniform sampler2D u_menu_items;

out vec4 outColor;

void main() {
	float l = length(v_position);
	float alpha = 1.0;
	if (l > 1.0)
		discard;

	vec4 color = v_color;

	if (l > 0.9)
		color.a *= 0.5;

	if (u_hide > u_show) {
		if (u_now - u_hide > HIDE_TIME)
			discard;
		alpha = 1.0 - (u_now - u_hide) / HIDE_TIME;
	} else {
		if (u_now - u_show < SHOW_TIME)
			alpha = (u_now - u_show) / SHOW_TIME;
	}

	color += texture(u_menu_items, v_image_center + v_image_size * v_position * vec2(1.0,-1.0));

	color.a *= alpha;

	if (v_chosen ==  0.0)
		color += vec4(0.1,0.1,0.1,0.0);

	outColor = color;
}