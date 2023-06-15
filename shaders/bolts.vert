#version 300 es

precision mediump float;

const float HALF_ROOT_3 = 0.866; 		//sqrt(3) / 2

in vec2 a_position;

in highp vec4 a_bolt_start;
in highp vec4 a_bolt_end;
in vec4 a_bolt_color;

uniform vec2 u_center;
uniform vec2 u_size;
uniform float u_cell_size;
uniform highp float u_now;

out vec2 v_position;
flat out vec4 v_color;
flat out float v_length;
flat out float v_width;
flat out float v_life;
flat out float v_thin;
flat out highp float v_random;

vec2 cell_position(vec4 position) {
    return vec2(position.x * HALF_ROOT_3, position.y - position.x / 2.0);
}

void main() {
    v_position = a_position;
    v_color = a_bolt_color;
    if (a_bolt_end[2] == 0.0 || u_now > a_bolt_start[2] + a_bolt_end[2]) {
        gl_Position = vec4(0.0,0.0,0.0,0.0);
        return;
    }

    v_thin = a_bolt_start[3];
    v_random = a_bolt_end[3];
    v_life = 1.0 - (u_now - a_bolt_start[2]) / a_bolt_end[2];

    vec2 start = cell_position(a_bolt_start);
    vec2 end = cell_position(a_bolt_end);
    vec2 path = end - start;

    float length = length(path);
    vec2 direction = normalize(path);

    v_length = length;
    v_width = 0.2;

    vec2 offset = vec2(direction.y, -direction.x) * v_width;

    vec2 position = start + v_position.y * offset + (v_position.x + 1.0) / 2.0 * (path - 0.2 * direction) + 0.2 * direction;
//    vec2 position = start + v_position.y * offset + (v_position.x + 1.0 + 2.0 * (length - 1.0) * fract(v_random)) / 2.0 * (direction) + 0.2 * direction;

    gl_Position = vec4((position * u_cell_size - u_center) / u_size * 2.0, 0.0, 1.0);
}
