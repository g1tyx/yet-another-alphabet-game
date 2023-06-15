"use strict"

Math.clamp = function(min, value, max) {
	if (value < min) 
		return min

	if (value > max) 
		return max
	
	return value
}

Math.mix = function(value1, value2, ratio, clamped = false) {
	if (clamped)
		ratio = Math.clamp(0, ratio, 1)
	
	return value1 + (value2 - value1) * ratio
}