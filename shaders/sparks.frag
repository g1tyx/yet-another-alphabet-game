#version 300 es

precision mediump float; 

in vec2 v_position;
flat in vec4 v_color;
flat in float v_life;

out vec4 outColor;

void main() {
	
	if (v_life == 0.0)
		discard;

	vec2 position = abs(v_position);

	float l = position.x + position.y;//length(v_position);

	if (l > 1.0)
		discard;
		
	outColor = vec4(v_color.rgb + 0.5 - l * 0.2,(1.5 - l * 1.5) * v_life);
}