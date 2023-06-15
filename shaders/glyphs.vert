#version 300 es

precision highp float;

in vec2 a_position;

in vec4 a_glyph_color;
in vec4 a_glyph_position;
in vec4 a_glyph_data;

out vec2 v_position;
flat out vec4 v_color;
flat out float v_life;

uniform vec2 u_center;
uniform vec2 u_size;

uniform float u_now;
uniform float u_pixel;
uniform float u_cell_size;

void main() {
	v_color = a_glyph_color;
	v_position = (a_position * vec2(0.5, -0.5) + a_glyph_data.pq + 0.5) / vec2(16.0, 32.0);

	if (a_glyph_data[1] > 0.0)
		v_life = (u_now - a_glyph_data[0]) / a_glyph_data[1];
	else
		v_life = 0.0;

	vec2 center = vec2(a_glyph_position.x * 0.866, a_glyph_position.y - floor(a_glyph_position.x + 0.5) / 2.0 + v_life / 2.0);
	vec2 position = center * u_cell_size + a_position * a_glyph_position.z * 0.5;

	gl_Position = vec4((position - u_center) / u_size * 2.0, 0, 1.0);
}