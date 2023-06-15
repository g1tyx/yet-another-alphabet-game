"use strict"

// Pointer actions : MouseAction, WheelAction, ButtonAction, TouchAction
//
// Helper class to keep handlers bound to specific inputs
// and coordinates of each independent input (touch, mouse, button, key) 

import WorldPoint from "../viewport/world-point.js"
import {getConstantName} from "../../../utility/utility.js"

const POINTER_ACTION_TYPE = {
	MOUSE : 0,
	BUTTON : 1,
	KEY : 2,
	TOUCH : 3,
}

function pointerInteractionEventHandler(eventID, ...args) {
	if (!this.handlers.has(eventID))
		return
	
	const handler = this.handlers.get(eventID)
	return handler(...args)
}	

class PointerInteraction {
	constructor(pointer, data) {
		this.pointer = pointer
		this.handlers = new Map()
		this.events = new Set()
		Object.assign(this, data)
	}

	registerEvents(events) {
		for (let event of events) {
			this.events.add(event)
			this[event] = pointerInteractionEventHandler.bind(this, event)
		}
	}

	hasEvent(event) {
		return this.events.has(event)
	}

	setHandler(event, handler) {
		if (!this.events.has(event))
			throw Error(`Pointer type ${getConstantName(POINTER_ACTION_TYPE,this.type)} has no "${event}" event`)
		this.handlers.set(event, handler)
	}
	
	resetHandlers() {
		this.handlers.clear()
	}
}

const positionable = (baseClass) => class extends baseClass {
	current = new WorldPoint(this.data)

	constructor(...args){
		super(...args)
		this.registerEvents(["move", "move_world", "move_real"])
	}

	updateWorldPosition() {
		this.setState(this.current.real.x, this.current.real.y)
	}
	
	setState(x, y, data) {
		this.current.setReal(x, y, this.pointer.view)
		
		if (data !== undefined)
			this.current.setData(data)
		
		this.pointer?.moveEvent(this, this.current.real.changed, this.pointer.view && this.current.world.changed)
	}
}

const anchorable = (baseClass) => class extends baseClass {
	anchor = new WorldPoint(this.data)

	setAnchor(state = this.current) {
		this.anchor.set(state)
		this.anchor.time = Date.now()
	}
}

const pressable = (baseClass) => class extends baseClass {
	constructor(...args){
		super(...args)
		this.registerEvents(["up", "down"])
	}
}

const scrollable = (baseClass) => class extends baseClass {
	constructor(...args){
		super(...args)
		this.registerEvents(["scroll"])
	}
}

const shiftable = (baseClass) => class extends baseClass {
	constructor(...args){
		super(...args)
		this.registerEvents(["modifier"])
		this.modifiers = Object.assign(this.modifiers ?? {}, {
			shift : false,
			alt : false,
			ctrl : false,
			meta : false,
		})
	}
}

const sizeable = (baseClass) => class extends baseClass {
	constructor(...args){
		super(...args)
		this.modifiers = Object.assign(this.modifiers ?? {}, {
			radiusX : 0,
			radiusY : 0,
		})
	}
}

export class MouseInteraction extends positionable(anchorable(shiftable(scrollable(PointerInteraction)))) {
	type = POINTER_ACTION_TYPE.MOUSE
}

export class ButtonInteraction extends anchorable(pressable(PointerInteraction)) {
	type = POINTER_ACTION_TYPE.BUTTON
}

export class KeyInteraction extends pressable(PointerInteraction) {
	type = POINTER_ACTION_TYPE.KEY
}

export class TouchInteraction extends positionable(pressable(anchorable(sizeable(scrollable(PointerInteraction))))) {
	type = POINTER_ACTION_TYPE.TOUCH
}