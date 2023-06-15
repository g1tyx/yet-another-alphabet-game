#version 300 es

precision highp float;

const float HALF_ROOT_3 = 0.866; 		//sqrt(3) / 2
const float BORDER_WIDTH = 0.1;

in vec2 v_position;
flat in vec4 v_color;
flat in vec4 v_data;
flat in float v_last_activation;
flat in float v_level;
flat in float v_max_level;
flat in float v_enabled;

flat in vec4 v_neighbour_color[6];

in vec2[3] v_sector_position;

uniform float u_now;

out vec4 outColor;

const vec4 COLOR = vec4(1.0,1.0,1.0,0.0);

const vec4 BORDER_GLOW[6] = vec4[6](
	vec4(-0.05,-0.05,-0.05,0.0),
	vec4(0.15,0.15,0.15,0.0),
	vec4(0.2,0.2,0.2,0.0),
	vec4(0.1,0.1,0.1,0.0),
	vec4(-0.1,-0.1,-0.1,0.0),
	vec4(-0.2,-0.2,-0.2,0.0)
);

float get_timer_position(float startTime, float maxTime, float start, float distance) {
	float time = u_now - start - startTime;
	return fract(time / maxTime - distance);
}

void main() {
	vec4 color = v_color;
//	vec4 level_color = vec4(color.rgb, 0.0);
	vec4 level_color = vec4(0.5,0.5,0.5, 0.0);
	vec4 flash_color = vec4(0.2,0.2,0.2, 0.0);

	int sector;
	float x, y;

	for (int i = 0; i < 3; i++) {
		if (abs(v_sector_position[i].y / v_sector_position[i].x) > 2.0) {
			sector = i;
			x = v_sector_position[i].x;
			y = v_sector_position[i].y;

			if (y < 0.0) {
				sector += 3;
				y = -y;
				x = -x;
			}
			break;
		}
	}

	float level_edge = 0.1;
	int level_sector = sector;

	if (v_data[0] == 1.0) {
		y += abs(x) * 1.5 - 0.1;
		if (x < 0.0)
			sector = (sector + 1) % 6;
		level_edge += abs(x);
	}

	if (v_data[0] == 2.0) {
		if (v_data[2] > 0.0)
			flash_color = vec4(0.2,-0.2,0.0,0.0);
	}

	if (v_data[0] == 3.0) {
		y += abs(x) * v_data[2] - v_data[1];
		if (x < 0.0)
			sector = (sector + 1) % 6;
		level_edge += abs(x) * v_data[2];
	}

	if (v_data[0] == 4.0) {
		if (abs(x) > 0.2)
			discard;
		if (v_enabled > 0.0) {
			color = mix(v_neighbour_color[(sector + 3) % 6], v_neighbour_color[sector], 0.5 - y/2.0);
			color.a *= v_color.a;
		}

		y = max(y - 0.15 + abs(x * 4.0),0.95);
		if (x < 0.0)
			sector = (sector + 2) % 6;
	}

	if (y > 1.0)
	discard;

	float inner_distance = y / (1.0 - BORDER_WIDTH);

	if (inner_distance > 1.0) {
		color += BORDER_GLOW[sector];
	} else if (v_data[0] == 2.0 && inner_distance > 0.55 && inner_distance < 0.65) {
		color += BORDER_GLOW[(sector + 3) % 6];
	} else {
		if (v_data[0] == 1.0)
			color += COLOR * 0.2 * (0.25 - 0.5 * get_timer_position(v_data[1], v_data[2], v_data[3], inner_distance));

		float level_section = float((level_sector + 3) % 6);

		if (abs(x) * 2.0 < y - level_edge) {
			if (inner_distance > 0.85 && inner_distance < 0.95 && level_section < v_max_level) {
				if (level_section < v_level)
					color += level_color * 0.8;
				else
					color -= level_color * 0.6;
			}


			if (inner_distance > 0.7 && inner_distance < 0.8 && (
					x < -0.025 && level_section * 2.0 + 7.0 < v_max_level ||
					x > 0.025 && level_section * 2.0 + 6.0 < v_max_level
				)) {
				if (
					x < -0.025 && level_section * 2.0 + 7.0 < v_level ||
					x > 0.025 && level_section * 2.0 + 6.0 < v_level
				)
					color += level_color * 0.8;
				else
					color -= level_color * 0.6;
			}
		}
	}

	color += flash_color * pow(max(0.0, 1.0 - (u_now - v_last_activation) / 1000.0), 2.0);

	if (v_enabled == 0.0)
		color.a *= 0.5;

	outColor = color;
}