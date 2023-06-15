#version 300 es

precision mediump float;

const float CUTOFF = 0.25;


in vec2 v_position;
flat in vec4 v_color;
flat in float v_length;
flat in float v_width;

out vec4 outColor;

uniform highp float u_now;

void main() {

    float x = v_position.x + abs(v_position.y) * v_width * 1.5;
    if (x < CUTOFF || x > v_length)
        discard;

    float position = x / v_width * 0.3 - fract(u_now / 1000.0);
    outColor = v_color + fract(position);
    outColor.a = fract(position) * min(0.33, x - CUTOFF) / 0.33;
}
