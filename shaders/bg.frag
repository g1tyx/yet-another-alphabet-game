#version 300 es

precision mediump float;

in vec2 v_position;
in vec3 v_hex_offset;

in vec2 v_grid_position[3];
flat in float v_grid_width;

flat in float v_pixel;

uniform highp float u_now;

uniform vec2 u_center;

uniform vec2 u_mouse;
uniform vec4 u_highlight_color;

out vec4 outColor;

vec4 color;
float grid_width;

vec4 grid_colors[3] = vec4[3](
	vec4(1.0,0.5,0.5,1.0),
	vec4(0.5,1.0,0.5,1.0),
	vec4(0.5,0.5,1.0,1.0)
);

void make_line(vec2 grid_position, vec4 grid_color) {
	vec2 cell_position = 0.5 - abs(fract(grid_position) - 0.5);

	if (cell_position.y > grid_width)
		return; //too far from the the edge

	float row = round(grid_position.y);
	bool odd = abs(fract(row / 2.0) - 0.5) < 0.1;

	if (odd)
		cell_position.x = 0.5 - cell_position.x;

	if (cell_position.x < 0.15)
		return; //too deep within cell

	//fade from edge into cell
	float light = grid_width - cell_position.y;

	//fade of hanging part from corner into cell
	light *= min(0.4, cell_position.x * 2.0 - 0.3);

	//highlight edge
	if (cell_position.y < v_grid_width && cell_position.x > 0.3)
		light *= 2.0;

	float animation_shift = u_now / 20000.0;
	if (odd)
		animation_shift = -animation_shift;

	float animation_position = fract(row * 0.3242 + grid_position.x / 23.0 + animation_shift);

	light *= min(5.0, 0.02 / min(0.02, abs(0.5 - animation_position)));

	color += light * grid_color;
}

void main() {

	grid_width = 0.1;

	//check if highlighted cell
	vec3 hex_offset = abs(v_hex_offset);
	float max_offset = max(max(hex_offset.x, hex_offset.y), hex_offset.z);
	float min_offset = min(min(hex_offset.x, hex_offset.y), hex_offset.z);
	bool highlight = max_offset < 0.5;

	if (highlight) {
		grid_width *= 2.0;
	}

	//draw grid
	for (int i = 0; i < 3; i++)
		make_line(v_grid_position[i], grid_colors[i]);

	if (highlight) {
		float highlight_offset = max_offset;
		if (max_offset < 0.5 - v_grid_width)
			highlight_offset -= min_offset * (1.0 - max_offset) * 2.0 * (0.35 - abs(fract(u_now / 2500.0) - 0.5));
		color = (color - 0.02) * 5.0 + pow(highlight_offset, 2.0) * 3.0 * u_highlight_color;//mix(color * 3.0, highlight, 1.0 - max_offset * 2.0);
	}

	//finalize
	color = clamp(color, 0.0, 1.0);
	color.a = 1.0;

	outColor = color;
}