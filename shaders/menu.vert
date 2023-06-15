#version 300 es

precision mediump float;

const float HIDE_TIME = 200.0;
const float SHOW_TIME = 200.0;

in vec2 a_position;

in float a_item_index;
in vec4 a_item_color;

out vec2 v_position;
flat out vec2 v_image_center;
flat out vec2 v_image_size;
flat out float v_chosen;
flat out vec4 v_color;

uniform float u_items;
uniform vec2 u_center;
uniform vec2 u_size;

uniform highp float u_now;
uniform float u_pixel;

uniform highp float u_show;
uniform highp float u_hide;
uniform float u_choice;

void main() {
	v_color = a_item_color;
	v_position = a_position;
	if (u_choice == -1.0)
		v_chosen = -1.0;
	else
		v_chosen = min(min(abs(u_choice - a_item_index), abs(u_choice + u_items - a_item_index)), abs(u_choice - u_items - a_item_index));

	float y = floor(a_item_index / 4.0);
	float x = a_item_index - 4.0 * y;

	v_image_center = 0.125 + vec2(x, y) * 0.25;
	v_image_size = vec2(0.125,0.125);

	float angle = 3.1415926 * 2.0 * a_item_index / u_items;
	float distance = 0.2 + 0.05 * u_items;
	float scale = 1.0;

	if (u_hide > u_show) {
		if (u_now - u_hide > HIDE_TIME) {
			gl_Position = vec4(0.0,0.0,0.0,0.0);
			return;
		}

		float delta = (u_now - u_hide) / HIDE_TIME;
		if (u_choice == a_item_index)
			scale += delta;
		else
			scale -= delta;

	} else {
		if (u_now - u_show < SHOW_TIME) {
			float progress = (u_now - u_show) / SHOW_TIME;
			angle += pow(1.0 - progress, 1.0);
			distance *= progress;
		}
	}

	vec2 position = distance * vec2(cos(angle), sin(angle));

	float ratio = u_size.y / u_size.x;
	vec2 position_ratio = vec2(ratio, 1.0);
	if (ratio > 1.0)
		position_ratio = vec2(1.0, 1.0 / ratio);

	gl_Position = vec4(position_ratio * (position + 0.25 * a_position * scale), 0, 1.0);
}