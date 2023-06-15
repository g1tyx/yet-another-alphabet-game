import GLTypes from "./gl-types.js"

const DEBUG_SHADERS = true

export default class GLProgram {
	createShader(type, source, check = false) {
		const gl = this.gl
		
		const shader = gl.createShader(type)
		gl.shaderSource(shader, source)
		gl.compileShader(shader)
		
		if (!check) return shader
		
		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
		if (success)
			return shader
		
		const log = `Failed to compile shader:\n${gl.getShaderInfoLog(shader)}`
		gl.deleteShader(shader)
		console.log(log)
		throw new Error (log)
	}
	
	createProgram(vertexShader, fragmentShader, attributePositions, check = false) {
		const gl = this.gl
		
		const program = gl.createProgram()
		
		if (attributePositions) {
			for (let [name, position] of Object.entries(attributePositions)) {
				gl.bindAttribLocation(program, position, name)
			}
		}
		
		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)
		
		if (!check) return program
		
		const success = gl.getProgramParameter(program, gl.LINK_STATUS)
		if (success)
			return program
		
		const log = gl.getProgramInfoLog(program)
		gl.deleteProgram(program)
		console.log(log)
		throw new Error (log)
	}
	
	constructor(gl, source, attributePositions) {
		this.gl = gl
		this.source = source
		this.attributePositions = attributePositions
		this.shaders ??= {}
	}

	compileShaders() {
		const gl = this.gl
		this.shaders.vertex ??= this.createShader(gl.VERTEX_SHADER, this.source.vertex, DEBUG_SHADERS)
		this.shaders.fragment ??= this.createShader(gl.FRAGMENT_SHADER, this.source.fragment, DEBUG_SHADERS)
	}

	link() {
		const gl = this.gl
		
		this.program = this.createProgram(this.shaders.vertex, this.shaders.fragment, this.attributePositions, DEBUG_SHADERS)
	}

	initSetters() {
		const gl = this.gl
						
		this.uniforms = {}
		const uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS)
		
		for (let i = 0; i < uniformCount; ++i) {
			const data = gl.getActiveUniform(this.program, i)
			
			const name = data.name.match(/[^[]*/)[0]
			const type = GLTypes.get(data.type)
			const address = gl.getUniformLocation(this.program, data.name)
			
			this.uniforms[name] = {
				address, name, data,
				type : type.type,
				size : type.size,
				set : gl[type.setter]?.bind(gl, address),
				setArray : gl[type.arraySetter]?.bind(gl, address),
			}
		}
		
		this.attributes = {}
		const attributeCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES)
		
		for (let i = 0; i < attributeCount; ++i) {
			const data = gl.getActiveAttrib(this.program, i)
			const address = gl.getAttribLocation(this.program, data.name)
		
			const type = GLTypes.get(data.type)

			this.attributes[data.name] = {
				data, address,
				type : type.type,
				size : type.size,
				arrayType : type.arrayType,
				setPointer : gl[type.attributePointerSetter]?.bind(gl, address, type.size, type.type),
			}
		}
	}

	use() {
		const gl = this.gl
		gl.useProgram(this.program)
	}

	setUniform(name, value) {
		if (this.uniforms[name] === undefined)
			return false
		if (typeof value == "object")
			this.uniforms[name].setArray(value)
		else
			this.uniforms[name].set(value)
		return true
	}
}