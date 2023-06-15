import Trigger from "../../../utility/trigger.js"

const VIEWPORT_DEFAULT_SETTINGS = {
	canvasScale : 1, // canvas grain
	devicePixelRatio : 1,
}

// noinspection JSUnusedGlobalSymbols
export default class Viewport extends Trigger.Class(["change"]) {
	constructor(canvas, settings) {
		super()

		this.settings = Object.assign({}, VIEWPORT_DEFAULT_SETTINGS, settings)
		
		this.canvas = canvas
		
		this.updateDimensions()
	}
	
// private

	// set up viewport and canvas dimensions
	updateDimensions() {
		//surface size
		this.realWidth  = this.canvas.clientWidth 
		this.realHeight = this.canvas.clientHeight
		
		//ui surface size
		this.width  = this.realWidth  / this.settings.canvasScale * this.settings.devicePixelRatio
		this.height = this.realHeight / this.settings.canvasScale * this.settings.devicePixelRatio
		
		this.canvas.width  = this.width
		this.canvas.height = this.height

		this.events.change(this.width, this.height)
	}
	
	getSurfaceSize(info = {}) {
		info.width  = this.realWidth
		info.height = this.realHeight
		return info
	}
	
	getSize(info = {}) {
		info.width  = this.width
		info.height = this.height
		return info
	}
	
	// check if canvas size changed, update accordingly
	updateSize() {	
		if (this.canvas.clientWidth === this.realWidth && this.canvas.clientHeight === this.realHeight)
			return

		this.updateDimensions()
	}
	
// public

}