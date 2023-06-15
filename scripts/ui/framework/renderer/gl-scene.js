//Instance functions:
// beforeRender(now) - called before ui every frame
// beforeElement(now) - called before rendering each element every frame
// updateView() - send viewport data to uniforms
// activate()
// deactivate()

import GLSceneElement from "./gl-scene-element.js"
import Trigger from "../../../utility/trigger.js"
import GLTexture from "./gl-texture.js"

export default class GLScene {
	constructor(gl, renderer, view) {
		this.gl = gl
		this.renderer = renderer
		this.view = view
	}

	getBuffer(name, arrayType) {
		if (this.buffers[name] !== undefined) {
			return this.buffers[name].buffer
		}
		if (this.bufferData[name] !== undefined) {
			const data = new arrayType(this.bufferData[name])
			const buffer = this.gl.createBuffer()
			this.buffers[name] = {
				data, buffer, 
				update : true,
				forceUpdate : false,
			}				
			return buffer
		}
	}

	initElements() {
		this.buffers ??= {}
		this.elements = {}
		this.renderElements = []
		
		for (let [name,data] of Object.entries(this.elementData)) {
			const element = new GLSceneElement(this.gl, this.renderer, this, data)
			this.elements[name] = element
			if (element.renderOrder !== undefined)
				this.renderElements.push(element)
		}
		
		this.updateOrder()

		this.finalizeElements?.()
	}

	initTextures() {
		this.textures ??= {}
//		this.activeTextures = new Array(8).fill("")
		if (this.textureData === undefined)
			return
		
		const gl = this.gl
		
		for (let [name, data] of Object.entries(this.textureData))
			this.textures[name] = new GLTexture(gl, data)

	}

	setTexture(slot, textureID) {
//		if (this.activeTextures[slot] === textureID)
//			return
		
		const texture = this.textures[textureID]

		texture.set(slot)
		
//		this.activeTextures[slot] = textureID
	}

	setTextures(textures) {
		if (textures === undefined  || textures.length === 0)
			return
		
		for (let i = 0; i < textures.length; i++)
			this.setTexture(i, textures[i])
	}

	render(now) {
		const gl = this.gl
				
		this.beforeRender?.(now)

		for (let buffer of Object.values(this.buffers)) {
			if (!buffer.update) 
				continue
			
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer)
			gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.DYNAMIC_DRAW)
			buffer.update = buffer.forceUpdate
		}
		
		for (let element of this.renderElements) {
			this.beforeElement?.(element, now)
			element.render(now)
		}
	}

	updateOrder() {
		this.renderElements.sort((x,y) => x.renderOrder - y.renderOrder)
	}

	setView(view = this.view) {
		this.view = view
		this.viewData = this.view.getView()
		this.updateView()
		
		if (this.viewTrigger !== undefined)
			this.viewTrigger.reattach(this.view.events.change)
		else 
			this.viewTrigger = Trigger.on(this.view.events.change, () => {
				this.updateView?.(this.view)
			})		
	}

	prepare(renderer = this.renderer, view = this.view) {
		this.initTextures()

		this.initElements?.()

		this.setView(view)
	}

	deactivate() {
	}

	activate() {
	}

	setInstanceAttribute(instance, name, ...values) {
		const buffer = this.buffers[name]
		
		if (buffer === undefined) 
			return false
		
		if (typeof values[0] === "object")
			values = values[0]
		
		const size = values.length
		
		buffer.data.set(values, instance * size)
		buffer.update = true
	}

	zeroBuffer(name) {
		const buffer = this.buffers[name]

		if (buffer === undefined)
			return false

		buffer.data.fill(0)
		buffer.update = true
	}

}