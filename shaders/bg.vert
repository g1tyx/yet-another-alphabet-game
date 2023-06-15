#version 300 es

precision mediump float;

const float ROOT_3 = 1.732;
const float HALF_ROOT_3 = 0.866;

const vec2 grid_direction[3] = vec2[3](
	vec2(0.0,1.0),
	vec2(HALF_ROOT_3,0.5),
	vec2(HALF_ROOT_3,-0.5)
);

const vec2 reverse_grid_direction[3] = vec2[3](
	vec2(-0.5,1.0),
	vec2(0.5,0.5),
	vec2(1.0,-0.5)
);

const vec2 grid_cell = vec2(ROOT_3, 0.5);

in vec2 a_position;

out vec2 v_position;
out vec3 v_hex_offset;

out vec2 v_grid_position[3];
flat out float v_grid_width;

flat out float v_pixel;

uniform float u_pixel;
uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_cell_size;

uniform vec2 u_highlight_cell;

void main() {
	v_pixel = min(u_size.x,u_size.y) * 1.2 * u_pixel;
	v_grid_width = v_pixel / u_cell_size;

	v_position = (a_position / 2.0) * u_size + u_center;

	for (int i = 0; i < 3; i++) {
		v_grid_position[i] = vec2(
			grid_direction[i].x * v_position.y - grid_direction[i].y * v_position.x,
			dot(grid_direction[i], v_position)
		) / (u_cell_size * grid_cell);

		v_hex_offset[i] = dot(v_position, grid_direction[i]) / u_cell_size - dot(u_highlight_cell, reverse_grid_direction[i]);
	}

	gl_Position = vec4(a_position, 0.0, 1.0);
}