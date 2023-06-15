#version 300 es

precision mediump float;

const float CUTOFF = 0.25;

in vec2 v_position;
flat in vec4 v_color;
flat in float v_length;
flat in float v_width;
flat in float v_life;
flat in float v_thin;
flat in highp float v_random;

out vec4 outColor;

uniform highp float u_now;


float random() {
    float rand = fract(v_random);
    float result = (sin((v_random + v_position.x * 2.0) * (1.5 + rand * 1.0) * v_length) + sin(sin((v_random + v_position.x * 2.0) * 8.0 * v_length )) / 5.0) / 5.0 + fract(v_random) - 0.5;
    if (v_thin == 0.0)
        result *= (v_position.x + 1.0);
    return result;
}


void main() {
    if (v_life <= 0.0 || v_position.x * 0.5 > 2.0 * (1.0 - v_life))
        discard;

    float distance = abs(v_position.y - random()) * 3.0 + max(0.0, 1.0 - v_length * (1.5 - abs(v_position.x - 0.5)));

    outColor = v_color + 1.0 - distance;
    outColor.a = min(v_life * 2.0, 1.0) - distance - max(0.0, v_position.x * 5.0 - 4.0);
}
