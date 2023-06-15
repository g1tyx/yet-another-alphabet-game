#version 300 es

precision highp float;

const float HALF_ROOT_3 = 0.866; 		//sqrt(3) / 2

const vec2 v_sector_direction[3] = vec2[3](
	vec2(HALF_ROOT_3,0.5),
	vec2(0.0,1.0),
	vec2(-HALF_ROOT_3,0.5)
);

in vec2 a_position;

in vec4 a_cell_color;
in vec4 a_cell_position;
in vec4 a_cell_data;
in vec2 a_cell_levels;

in vec4 a_cell_neighbour_color0;
in vec4 a_cell_neighbour_color1;
in vec4 a_cell_neighbour_color2;
in vec4 a_cell_neighbour_color3;
in vec4 a_cell_neighbour_color4;
in vec4 a_cell_neighbour_color5;

flat out vec4 v_neighbour_color[6];

out vec2 v_position;

out vec2 v_sector_position[3];

flat out vec4 v_color;
flat out vec4 v_data;
flat out float v_last_activation;
flat out float v_level;
flat out float v_max_level;
flat out float v_enabled;

uniform vec2 u_center;
uniform vec2 u_size;

uniform float u_now;
uniform float u_pixel;
uniform float u_cell_size;

void main() {
	v_position = a_position;
	v_color = a_cell_color;
	v_data = a_cell_data;
	v_last_activation = a_cell_position[2];
	v_enabled = a_cell_position[3];
	v_level = a_cell_levels[0];
	v_max_level = a_cell_levels[1];

	v_neighbour_color = vec4[6](
		a_cell_neighbour_color0,
		a_cell_neighbour_color1,
		a_cell_neighbour_color2,
		a_cell_neighbour_color3,
		a_cell_neighbour_color4,
		a_cell_neighbour_color5
	);

	for (int i = 0; i < 3; i++) {
		v_sector_position[i] = vec2(
			(v_position.x * v_sector_direction[i].y - v_position.y * v_sector_direction[i].x),
			dot(v_position, v_sector_direction[i]) / HALF_ROOT_3
		);
	}

	vec2 center = vec2(a_cell_position.x * HALF_ROOT_3, a_cell_position.y - a_cell_position.x / 2.0);

	vec2 position = (center + v_position / 2.0) * u_cell_size;

	gl_Position = vec4((position - u_center) / u_size * 2.0, 0, 1.0);
}