#version 300 es

precision mediump float;

in vec2 a_position;

in vec4 a_spark_color;
in vec4 a_spark_position;
in highp vec4 a_spark_time;

out vec2 v_position;
flat out vec4 v_color;
flat out float v_life;

uniform vec2 u_center;
uniform vec2 u_size;

uniform highp float u_now;
uniform float u_pixel;
			
void main() {
	v_position = a_position;
	v_color = a_spark_color;

	float time = u_now - a_spark_time[0];

//	time /= 10.0;

	if (time > a_spark_time[1] || a_spark_time[1] == 0.0) {
		gl_Position = vec4(0.0,0.0,0.0,0.0);
		return;
	}
		
	v_life = max(0.0, 1.0 - (time / a_spark_time[1]));
	
	float scale = max(1.0,min(u_size.x,u_size.y) * 1.5 * u_pixel);

	vec2 direction = vec2(cos(a_spark_position[2]), sin(a_spark_position[2]));
	vec2 speed = direction * a_spark_position[3] * scale;
	vec2 center = a_spark_position.xy + speed * time;
	vec2 s_position = vec2(a_position.x * a_spark_position[3] * 20.0, a_position.y) * scale;
	
	vec2 position = center + vec2(
		dot(s_position, direction),
		s_position.x * direction.y - s_position.y * direction.x);
	
	gl_Position = vec4((position - u_center) / u_size * 2.0, 0, 1.0);
}