import Trigger from "../../../utility/trigger.js"
import GLProgram from "./gl-program.js"

const GL_QUAD_ARRAY = new Float32Array([
	-1, -1, 
	-1,  1,  
	 1, -1, 
	-1,  1,  
	 1, -1, 
	 1,  1,
])

export default class GLRenderer {
	constructor(canvas, viewport, data) {
		this.data = data
		this.active ??= false
		this.nextFrame = -1

		this.viewport = viewport
		if (!this.viewport) {
			console.log("ERROR: GLRenderer needs a viewport")
		}

		this.canvas = canvas
		if (!this.canvas) {
			console.log("ERROR: GLRenderer needs a canvas")
		}

		this.gl = this.canvas.getContext("webgl2", {alpha: false})
		if (!this.gl) {
			console.log("ERROR: GLRenderer failed to create a WebGL2 context!")
		}

		this.shaders ??= {}
		this.initShaders()

		this.initPositionBuffer()

		this.resetViewport()

		this.tempFramebuffer = this.gl.createFramebuffer()

		Trigger.on(this.viewport.events.change, (width, height) => {
			this.gl.viewport(0, 0, width, height)
		})

		this.boundFrame = this.frame.bind(this)
	}

	initShaders() {
		console.log("Compiling shaders:")

		if (this.data?.shaders === undefined)
			return false

		this.programs = {}
		const gl = this.gl

		for (let [name, source] of Object.entries(this.data.shaders)) {
			this.programs[name] = new GLProgram(gl, source, this.data.attributePositions)
		}

		const programs = Object.values(this.programs)

		for (let program of programs)
			program.compileShaders()

		for (let program of programs)
			program.link()

		for (let program of programs)
			program.initSetters()
		//shader/lists => uniform/attribute proper data

		console.log("Shaders compiled.")
	}

	initPositionBuffer() {
		const gl = this.gl

		this.positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, GL_QUAD_ARRAY, gl.STATIC_DRAW)
	}

	activate() {
		if (this.active)
			return
		this.active = true

		this.nextFrame = requestAnimationFrame(this.boundFrame)
		this.then = 0
	}

	deactivate() {
		if (!this.active)
			return
		this.active = false

		if (this.nextFrame > -1)
			cancelAnimationFrame(this.nextFrame)
		this.nextFrame = -1
	}

	resetViewport() {
		this.gl.viewport(0, 0, this.viewport.width, this.viewport.height)
	}

	frame(now) {
		if (!this.view)
			return

		if (this.countStart === undefined) {
			this.countFrames = 0
			this.countStart = now
		}

		if (now - this.countStart > 200) {
//			dev.report("fps",(1000 * this.countFrames / (now - this.countStart)).toFixed(2))
			this.countStart = now
			this.countFrames = 0
		}

		this.countFrames++

		if (!this.active)
			return

		this.viewport.updateSize()

		const deltaTime = now - this.then
		this.then = now

		this.view.advance(deltaTime)

		const gl = this.gl

		gl.clearColor(0.0, 0.0, 0.0, 0.0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		this.scene.render(now)

		gl.bindVertexArray(null)

		this.nextFrame = requestAnimationFrame(this.boundFrame)
	}

	setScene(scene) {
		if (this.scene !== undefined)
			this.scene.deactivate()

		this.scene = scene
		scene.prepare(this, this.view)

		this.scene.activate()
	}

	setView(view) {
		this.view = view

		this.scene?.updateView(this.view)

		this.viewTrigger?.cancel()
		this.viewTrigger = Trigger.on(this.view.events.change, () => {
			this.scene.updateView(this.view)
		})
	}
}

