import Trigger from "../../../utility/trigger.js"
import "../../../utility/math.js"

const WORLDVIEW_DEFAULT_BOUNDARIES = {
	left : -100,
	right : 100,
	bottom : -100,
	top : 100,
}

const WORLDVIEW_DEFAULT_SETTINGS = {
	snapXY : 1,				// minimum distance to animate
	snapZoom : 0.01,		// minimum zoom to animate
	speed : 50,				// time to halve the (target-current) distance higher = slower
	expandView : 40,		// extra space around boundaries
	minView : 50,			// minimum visible dimension (max zoom)
	capped : true,
}

const WORLDVIEW_DEFAULT_COMPONENTS = {
	x : 0, 
	y : 0, 
	zoom : 1,
}

// noinspection JSUnusedGlobalSymbols
export default class WorldView extends Trigger.Class(["change"]) {
	constructor(viewport, settings, data) {
		super()

		if (!viewport) 
			throw Error("WorldView can't exist without a viewport")

		this.viewport = viewport
		this.settings = Object.assign({}, WORLDVIEW_DEFAULT_SETTINGS, settings)		

		this.max = Object.assign({}, WORLDVIEW_DEFAULT_COMPONENTS)
		this.min = Object.assign({}, WORLDVIEW_DEFAULT_COMPONENTS)
		this.current = Object.assign({}, WORLDVIEW_DEFAULT_COMPONENTS)
		this.target = Object.assign({}, WORLDVIEW_DEFAULT_COMPONENTS)
		
		this.boundaries = Object.assign({}, WORLDVIEW_DEFAULT_BOUNDARIES, data?.boundaries)
		
		this.setBoundaries(this.boundaries)

		Trigger.on(this.viewport.events.change, () => {
			let zoomRatio = this.target.zoom / this.min.zoom
			
			this.updateZoomLimits()
			
			this.setZoom(zoomRatio * this.min.zoom, true, false)
			
			this.updated()
		})
	}

	updated() {
		this.events.change(this.current.x, this.current.y, this.current.zoom)
	}

	// sets target x, y or zoom to a clamped value
	setClamped(field, value) { 
		this.target[field] = Math.clamp(this.min[field], value, this.max[field])
	}

	// moves current x, y or zoom towards target by given value and snaps it if needed
	attract(field, value = 0.5, snap = 0.01) {
		this.current[field] += (this.target[field] - this.current[field]) * value
		
		if (Math.abs(this.current[field] - this.target[field]) <= snap)
			this.current[field] = this.target[field]
	}

	// sets up x and y limits based on boundaries and target zoom
	updateXYLimits() {
		const shrinkX = this.settings.expandView - (this.viewport.width  / 2) / this.target.zoom		
		this.min.x = Math.min(this.boundaries.centerX, this.boundaries.left  - shrinkX)
		this.max.x = Math.max(this.boundaries.centerX, this.boundaries.right + shrinkX)

		const shrinkY = this.settings.expandView - (this.viewport.height / 2) / this.target.zoom
		this.min.y = Math.min(this.boundaries.centerY, this.boundaries.bottom - shrinkY)
		this.max.y = Math.max(this.boundaries.centerY, this.boundaries.top    + shrinkY)

		//update target to clamped coordinates
		this.setXY(this.target.x, this.target.y) 
	}

	// sets up zoom limits based on boundaries and viewport size
	updateZoomLimits(zoomOut = true) {
		//update zoom limits
		const minZoom = zoomOut && this.target.zoom === this.min.zoom
		
		this.max.zoom = Math.min(this.viewport.width, this.viewport.height) / this.settings.minView

		this.min.zoom = Math.min(
			this.max.zoom, 
			this.viewport.width  / (this.boundaries.width  + 2 * this.settings.expandView),
			this.viewport.height / (this.boundaries.height + 2 * this.settings.expandView))	
	
		//update target to clamped zoom, which also updates x and y limits
		if (minZoom)
			this.setZoom(this.min.zoom)
		else
			this.setZoom(this.target.zoom)
	}

// public

	// advances current x, y and zoom towards target 
	advance(time = 10) {
		if (this.current.x === this.target.x && this.current.y === this.target.y && this.current.zoom === this.target.zoom)
			return
		
		const change = 1 - 0.5 ** (time / this.settings.speed)
		
		this.attract("x", change, this.settings.snapXY)
		this.attract("y", change, this.settings.snapXY)
		this.attract("zoom", change, this.settings.snapZoom)
		
		this.updated()
	}

	getSize(info = {}) {
		info.width  = this.viewport.width  / this.current.zoom
		info.height = this.viewport.height / this.current.zoom
		return info
	}

	getCenter(info = {}) {
		info.x = this.current.x
		info.y = this.current.y
		return info
	}

	getView(info = {}) {
		info.x = this.current.x
		info.y = this.current.y
		info.zoom = this.current.zoom
		return info
	}

	// returns / updates current view info
	getInfo(info = {}) {
		this.getSize(info)
		this.getView(info)
			
		info.left   = info.x - info.width  / 2
		info.bottom = info.y - info.height / 2
		
		info.right = info.left   + info.width
		info.top   = info.bottom + info.height
			
		return info
	}

	getWorldPixelSize() {
		return 1 / Math.min(this.viewport.width, this.viewport.height)
	}

	// set world boundaries, calculate basic world data, setup view
	setBoundaries(boundaries, zoomOut = true) {
		Object.assign(this.boundaries, boundaries)
		
		this.boundaries.width  = this.boundaries.right - this.boundaries.left
		this.boundaries.height = this.boundaries.top   - this.boundaries.bottom
		
		this.boundaries.centerX = this.boundaries.left   + this.boundaries.width / 2
		this.boundaries.centerY = this.boundaries.bottom + this.boundaries.height / 2
		
		this.updateZoomLimits(zoomOut)
	}

	// set target center coordinates
	setXY(x, y, instant = false, event = true) {
		if (this.settings.capped) {
			this.setClamped("x", x)
			this.setClamped("y", y)
		} else {
			this.target.x = x
			this.target.y = y
		}
		
		if (instant && (this.current.x !== this.target.x || this.current.y !== this.target.y)) {
			this.current.x = this.target.x
			this.current.y = this.target.y
			if (event)
				this.updated()
		}		
	}

	// set target zoom, update x and y limits accordingly
	setZoom(value, instant = false, event = true) {
		if (this.settings.capped)
			this.setClamped("zoom", value)
		else
			this.target.zoom = value
		
		this.updateXYLimits()
		
		if (instant && this.current.zoom !== this.target.zoom) {
			this.current.zoom = this.target.zoom
			if (event)
				this.updated()
		}			
	}

	// set target x, y and zoom at once
	set(x, y, zoom, instant = false, event = true) {
		this.setZoom(zoom, instant, event)
		this.setXY(x, y, instant, event)
	}

	// adjust x and y by given values
	translate(dx, dy, instant = false, event = true) {
		this.setXY(
			this.target.x + dx, 
			this.target.y + dy, 
			instant, event)
	}

	// adjust zoom by value
	zoom(value, instant = false, event = true) {
		this.setZoom(
			this.target.zoom + value, 
			instant, event)
	}

	// adjust x, y and zoom at once
	adjust(dx, dy, zoomValue, instant = false, event = true) {
		this.zoom(zoomValue, instant, event)
		this.translate(dx, dy, instant, event)
	}

	// adjust zoom, keeping given world x and y at the same viewport point
	zoomAt(x, y, zoomValue, instant = true, event = true) {
		//does not work properly with instant === false with current animation
		const shift = zoomValue / this.target.zoom
		
		this.adjust(
			(x - this.current.x) * shift,
			(y - this.current.y) * shift,
			zoomValue,
			instant, event)
	}

	// real x => world x
	getWorldX(realX) {
		return this.current.x + (realX / this.viewport.settings.canvasScale * this.viewport.settings.devicePixelRatio - this.viewport.width  / 2) / this.current.zoom
	}

	// real y => world y
	getWorldY(realY) {
		return this.current.y - (realY / this.viewport.settings.canvasScale * this.viewport.settings.devicePixelRatio - this.viewport.height / 2) / this.current.zoom
	}

	// world x => real x
	getRealX(worldX) {
		//TODO
	}

	// world y => real y
	getRealY(worldY) {
		//TODO
	}

	// real x,y => world x,y
	realToWorld(real, world = {}) {
		world.x = this.getWorldX(real.x)
		world.y = this.getWorldY(real.y)
		return world
	}

	// world x,y => real x,y
	worldToReal(world, real = {}) {
		real.x = this.getRealX(world.x)
		real.y = this.getRealY(world.y)
		return real
	}

	// adjust x and y for world point to end up in given point
	moveWorldPoint(worldX, worldY, realX, realY) {
//		const originRealX = this.getRealX(worldX)
//		const originRealY = this.getRealY(worldY)
		const targetWorldX = this.getWorldX(realX)
		const targetWorldY = this.getWorldY(realY)
		this.translate(worldX - targetWorldX, worldY - targetWorldY, true)
	}

	cap() {
		this.settings.capped = true
		this.translate(0, 0)
		this.zoom(0)
	}

	uncap() {
		this.settings.capped = false
	}

	// adjust zoom and position based on two world points and two surface points
	// distance between world points => distance between points
	// world x, y => real x, y
	moveWorldPoints(worldX1, worldY1, worldX2, worldY2, realX1, realY1, realX2, realY2) {
		//adjust zoom
		const distanceWorld = Math.hypot(worldX1 - worldX2, worldY1 - worldY2)
		const distanceReal  = Math.hypot(realX1  - realX2 , realY1  - realY2 )
		this.setZoom(distanceReal / this.viewport.settings.canvasScale * this.viewport.settings.devicePixelRatio / distanceWorld, true)
		
		//move center point
		this.moveWorldPoint(
			(worldX1 + worldX2) / 2,
			(worldY1 + worldY2) / 2,
			(realX1 + realX2) / 2,
			(realY1 + realY2) / 2,
		)
	}

	inertia() {
		//TODO : inertia
	}
}