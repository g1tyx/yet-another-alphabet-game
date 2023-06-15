"use strict"

export default class GLSceneElement {
	constructor(gl, renderer, scene, data) {
		this.gl = gl
		this.renderer = renderer
		this.scene = scene

		Object.assign(this, data)

		this.uniforms ??= {}
		this.attributes ??= {}
		this.attributeData ??= {}
		this.start ??= 0
		this.count ??= 1

		//get positions

		if (typeof this.program == "string")
			this.program = this.renderer.programs[this.program]

		if (!this.initVertexArray())
			throw Error("Failed to initialize scene element")
	}

	initVertexArray() {
		const gl = this.gl

		if (!gl)
			return false

		this.vao = gl.createVertexArray()
		gl.bindVertexArray(this.vao)

		if (this.position !== undefined && this.program.attributes[this.position]) {
			this.attributeData[this.position] = {
				buffer: this.renderer.positionBuffer,
				vertex: true,
			}
		}

		for (let [name, attribute] of Object.entries(this.attributeData)) {
			if (this.program.attributes[name] === undefined) {
				continue
			}

			if (typeof attribute.buffer === "string")
				attribute.buffer = this.scene.getBuffer(attribute.buffer, this.program.attributes[name].arrayType)

			gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer)
			gl.enableVertexAttribArray(this.program.attributes[name].address)

			this.program.attributes[name].setPointer(
				attribute.normalized ?? false,
				attribute.offset ?? 0,
				attribute.stride ?? 0)

			if (!attribute.vertex)
				gl.vertexAttribDivisor(this.program.attributes[name].address, 1)

			this.attributes[name] = attribute
		}

		return true
	}

	render() {
		if (this.count <= 0)
			return

		const gl = this.gl

		if (!gl)
			return false

		//set uniforms

		this.program.use()

		if (this.alpha !== undefined)
			if (this.alpha) {
				gl.enable(gl.BLEND);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			} else {
				gl.disable(gl.BLEND)
			}

		gl.bindVertexArray(this.vao)

		for (let [name, value] of Object.entries(this.uniforms)) {
			this.program.setUniform(name, value)
		}

		if (this.textures !== undefined) {
			this.scene.setTextures(this.textures)
		}

		gl.drawArraysInstanced(gl.TRIANGLES, this.start, 6, this.count)
	}

	renderToTexture(target, width, height, layer = 0) {
		const texture = this.scene.textures[target]
		if (texture === undefined)
			return

		width ??= texture.width ?? 512
		height ??= texture.height ?? 512

		const gl = this.gl

		gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderer.tempFramebuffer)

		if (texture.array === undefined)
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture.texture, 0)
		else
			gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, texture.texture, 0, layer)

		gl.viewport(0, 0, width, height)

		this.render()

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)

		this.renderer.resetViewport()

	}
}

