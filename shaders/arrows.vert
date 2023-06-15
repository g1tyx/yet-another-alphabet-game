#version 300 es

precision mediump float;

const float HALF_ROOT_3 = 0.866; 		//sqrt(3) / 2

in vec2 a_position;

in vec4 a_arrow_start;
in vec4 a_arrow_end;
in vec4 a_arrow_color;

uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_cell_size;

out vec2 v_position;
flat out vec4 v_color;
flat out float v_length;
flat out float v_width;

vec2 cell_position(vec4 position) {
    return vec2(position.x * HALF_ROOT_3, position.y - position.x / 2.0);
}

void main() {
    v_position = a_position;
    v_color = a_arrow_color;

    vec2 start = cell_position(a_arrow_start);
    vec2 end = cell_position(a_arrow_end);
    vec2 path = end - start;

    float length = length(path);
    vec2 direction = normalize(path);

    v_length = length;
    v_width = a_arrow_start[2] / 2.0;
    v_position.x = (v_position.x + 1.0) / 2.0 * length;

    vec2 offset = vec2(direction.y, -direction.x) * v_width;

    vec2 position = start + (v_position.y + a_arrow_start[3] / a_arrow_start[2]) * offset + v_position.x * direction;

    gl_Position = vec4((position * u_cell_size - u_center) / u_size * 2.0, 0.0, 1.0);
}
