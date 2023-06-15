"use strict"

// Pointer class
//
// Implements an intuitive action-based mouse/touch control flow
// based on activities
//
// For each state there are things one expects to happen when 
// specific actions are taken, and those actions changed expected
// future actions, which is reflected by different activities.
// 
// Supports multi-touch, wide taps, long tap
// TODO : mouse move threshold

import PointerScriptCompiler from "./script-compiler.js"
import WorldPoint from "../viewport/world-point.js"
import Trigger from "../../../utility/trigger.js"
import {ButtonInteraction, MouseInteraction, TouchInteraction} from "./interactions.js"
import PointerControlScheme from "./scheme.js"

const POINTER_DEFAULT_SETTINGS = {
	defaultActivity : "Default",
	activityStackSize : 10,
	touchThreshold : 20,
	mouseThreshold : 5,
	buttons : 3,
	touches : 2,
}

const POINTER_INTERACTION_ALIAS = {	//for convenient addressing
	lmb    : "button0",
	left   : "button0",
	rmb    : "button2",
	right  : "button2",
	first  : "touch0",
	second : "touch1",
	third  : "touch2",
}

const POINTER_EVENT_ALIAS = {	//for touch / button event coupling
	start  : "down",
	end    : "up",
	out    : "up",
	cancel : "up",
	wheel  : "scroll",
}

const POINTER_ACTIVE = {
	INACTIVE : 0,	// button/touch is up
	THRESHOLD : 1,	// touch is down and did not move beyond threshold
	ACTIVE : 2,		// button/touch is down and active
	ALWAYS : 3,		// mouse cursor is always active
}

export default class Pointer {
	constructor(surface, viewport, settings) {
		this.settings = Object.assign({}, POINTER_DEFAULT_SETTINGS, settings)

		this.current = new WorldPoint({
					radiusX : 0,
					radiusY : 0,
					shift : false,
					alt : false,
					ctrl : false,
					meta : false,
				})

		this.viewport = viewport
		this.surface = surface

		this.data = {}
		
		this.activityStack = []
		this.activityName = ""
		
		this.scheme ??= new PointerControlScheme({},``)

		this.idleTimeouts = []
		
		this.initInteractions()		
		
		if (this.surface !== undefined)
			this.addPointerListeners(this.surface)
		
		if (this.view !== undefined)
			this.setView(this.view)
		
		this.compiler = new PointerScriptCompiler(this)
	}
	
	// builds a table of possible actions and aliases to them
	initInteractions() {
		this.interactions = {
			mouse : new MouseInteraction(this, {
				active : POINTER_ACTIVE.ALWAYS,
			}),
		}
		
		for (let i = 0; i < this.settings.buttons; i++) {
			this.interactions[`button${i}`] = new ButtonInteraction(this, {
				id : i,
				current : this.interactions.mouse.current,
				anchor : this.interactions.mouse.anchor,
			})
		}

		for (let i = 0; i < this.settings.touches; i++) {
			this.interactions[`touch${i}`] = new TouchInteraction(this, {
				id : i,
			})
		}
		
		for (let [alias, target] of Object.entries(POINTER_INTERACTION_ALIAS)) {
			this.interactions[alias] = this.interactions[target]
		}
		
		this.lastInteraction = this.interactions.mouse
	}
	
	// binds all touch and mouse event listeners to working surface
	addPointerListeners(element) {
		const options = {
			passive : false,
			capture : true,
		}
		
		const mouseEventHandler = this.mouseEvent.bind(this)
		element.addEventListener("mousewheel", mouseEventHandler, options)
		element.addEventListener("mousemove", mouseEventHandler, options)
		element.addEventListener("mousedown", mouseEventHandler, options)
		element.addEventListener("mouseup",   mouseEventHandler, options)
		element.addEventListener("mouseout",  mouseEventHandler, options)

		const touchEventHandler = this.touchEvent.bind(this)
		element.addEventListener("touchstart",  touchEventHandler, options)
		element.addEventListener("touchmove",   touchEventHandler, options)
		element.addEventListener("touchend",    touchEventHandler, options)
		element.addEventListener("touchcancel", touchEventHandler, options)
		
		element.addEventListener("contextmenu", (event) => event.preventDefault(), options)
	}

	// get interactions for given button
	getButtonInteraction(button) {
		return this.interactions[`button${button}`]
	}
	
	// get interactions for given touch
	getTouchInteraction(touch) {
		return this.interactions[`touch${touch}`]
	}
	
	// reset every event handler
	resetActivity() {
		// does not iterate over .actions to avoid resetting by alias
		for (let [name, interaction] of Object.entries(this.interactions)) {
			if (POINTER_INTERACTION_ALIAS[name] !== undefined)
				continue
			interaction.resetHandlers()
		}
	}
	
	// mouse events : up down move out wheel
	mouseEvent(event) {
		if (event.target !== this.surface)
			return

		event.preventDefault()
		event.stopPropagation()
		
		this.current.setData({
			shift : event.shiftKey, 
			alt : event.altKey, 
			ctrl : event.ctrlKey,
			meta : event.metaKey,
		})
		
		this.current.setReal(event.offsetX, event.offsetY, this.view)	
		
		this.interactions.mouse.setState(
			event.offsetX, 
			event.offsetY, 
			{
				shift : event.shiftKey, 
				alt : event.altKey, 
				ctrl : event.ctrlKey,
				meta : event.metaKey,
				direction : Math.sign(event.deltaY),
			})
			
		let eventType = event.type.slice(5)
		eventType = POINTER_EVENT_ALIAS[eventType] ?? eventType				
				
		this.resetIdle()

		if (eventType === "scroll") {
			this.lastInteraction = this.interactions.mouse
			const next = this.interactions.mouse.scroll(this.interactions.mouse, this)
			if (next !== undefined)
				this.nextAction(next)
			return
		}

		const interaction = this.getButtonInteraction(event.button)
		if (!interaction) 
			return
		
		this.lastInteraction = interaction

		if (eventType === "up")
			interaction.active = POINTER_ACTIVE.INACTIVE
		if (eventType === "down")
			interaction.active = POINTER_ACTIVE.ACTIVE

		const next = interaction[eventType]?.(interaction, this)
		if (next !== undefined)
			this.nextAction(next)
	}
	
	// touch events : start move end cancel
	touchEvent(event) {
		if (event.target !== this.surface)
			return

		event.preventDefault()
		event.stopPropagation()
		
		let eventType = event.type.slice(5)
		eventType = POINTER_EVENT_ALIAS[eventType] ?? eventType				
		
		for (let touch of event.changedTouches) {			
			let offsetX = touch.pageX - this.surface.offsetLeft
			let offsetY = touch.pageY - this.surface.offsetTop
			
			const interaction = this.getTouchInteraction(touch.identifier)
			if (!interaction) 
				return
			
			if (interaction.active === POINTER_ACTIVE.THRESHOLD) {
				if (Math.hypot(interaction.anchor.real.x - offsetX, interaction.anchor.real.y - offsetY) < this.settings.touchThreshold) {
					offsetX = interaction.anchor.real.x
					offsetY = interaction.anchor.real.y
				} else
					interaction.active = POINTER_ACTIVE.ACTIVE
			}
			
			// update current position
			if (touch.identifier === 0) {
				this.current.setReal(offsetX, offsetY, this.view)
				this.current.setData({
					radiusX : touch.radiusX, 
					radiusY : touch.radiusY, 
				})
			}

			interaction.setState(
				offsetX, offsetY, 
				{
					radiusX : touch.radiusX, 
					radiusY : touch.radiusY, 
				})

			if (eventType === "move") 
				continue

			this.resetIdle()
			this.lastInteraction = interaction
									
			if (eventType === "up")
				interaction.active = POINTER_ACTIVE.INACTIVE
			if (eventType === "down")
				interaction.active = POINTER_ACTIVE.THRESHOLD
		
			const next = interaction[eventType]?.(interaction, this)
			if (next !== undefined)
				this.nextAction(next)
		}		
	}
	
	// actual movement event, can be caused by viewport change
	// so it's a special case called from within interaction
	moveEvent(source, real, world) {		
		let next

		if (world || real) {
			this.resetIdle()
			this.lastInteraction = source

			next = source.move(source, this)
		}
		
		if (next === undefined && real)
			next = source.move_real(source, this)
		
		if (next === undefined && world)
			next = source.move_world(source, this)
		
		if (next !== undefined)
			this.nextAction(next)
	}
	
	// handler can be a function or a name of function on handlers list
	// this returns an actual function
	getActualHandler(handler) {
		if (typeof handler !== "function") {
			if (!this.handlers[handler])
				throw Error(`Undefined handler: ${handler}`)

			return this.handlers[handler]
		}
		
		return handler
	}
	
//public
	
	// sets handler for specific event on one or more actions
	// address : action_action_action.event (rmb.up, button0_touch0.down, etc)
	setHandler(address, handler) {
		let [interactions, event] = address.split(".")
		
		const data = interactions.split("_")
		if (data.length <= 0)
			throw Error(`Wrong handler address: ${address}`)


		if (data[0] === "idle") {
			const delay = +data[1]
			if (isNaN(delay) || delay <= 0)
				return
			
			this.onIdle(delay, handler)
			
			return
		}
		
		event = POINTER_EVENT_ALIAS[event] ?? event
		
		for (let interactionName of data) {
			interactionName = POINTER_INTERACTION_ALIAS[interactionName] ?? interactionName
			
			const interaction = this.interactions[interactionName]
			
			if (!interaction)
				throw Error(`Unknown interaction: ${interaction}`)


			interaction.setHandler(event, handler)
		}
	}
	
	// sets handlers according to list for given activity
	setActivity(activityName, fromStack = false) {
		if (activityName === this.activityName)
			return
		
		if (activityName === this.settings.defaultActivity)
			this.activityStack.length = 0
		else 
			if (!fromStack) {
				this.activityStack.push(this.activityName)
				if (this.activityStack.length > this.settings.activityStackSize)
					this.activityStack.splice(1, 1)
			}
		
/*
		if (window.dev) {
//			dev.clearLog()
			if (dev.debugControls)
				dev.report("activity", this.activityName + " => " + activityName)
		}
*/

		this.activityName = activityName
		
		const activity = this.activities[activityName]
		if (!activity)
			throw (`Unknown pointer activity: ${activityName}`)
		
		this.resetActivity()
		
		for (let [address, handler] of Object.entries(activity)) {
			this.setHandler(address, handler)
		}
		
	}
	
	// returns to previous activity
	previousActivity() {
		if (this.activityStack.length === 0)
			return false
		
		this.setActivity(this.activityStack.pop(), true)
		return true
	}
	
	// sets default activity
	reset() {
		this.setActivity(this.settings.defaultActivity)
	}
	
	// executes action if idle for TIME milliseconds in context of last action
	onIdle(time, handler) {
		const actualHandler = this.getActualHandler(handler)
		
		const timeout = setTimeout(() => {
			const next = actualHandler(this.lastInteraction,this)
			if (next !== undefined)
				this.nextAction(next)
		}, time)
		this.idleTimeouts.push(timeout)
	}

	//resets idle timer
	resetIdle() {
		if (this.idleTimeouts.length === 0)
			return
		
		for (let timeout of this.idleTimeouts)
			clearTimeout(timeout)
		
		this.idleTimeouts.length = 0
	}
	
	//anchors all active input
	setAnchors() {
		this.interactions.mouse.setAnchor()
			
		for (let i = 0; i < this.settings.touches; i++)
			this.interactions[`touch${i}`].setAnchor()
	}

	setView(view) {
		this.view = view
				
//		this.scene.updateView(this.view)
//		
		this.viewTrigger?.cancel()
		this.viewTrigger = Trigger.on(this.view.events.change, () => {
			this.view.realToWorld(this.current.real, this.current.world)
			this.interactions.mouse.updateWorldPosition()
		})
	}

	setControlScheme(scheme) {
		scheme.prepare(this)
		this.activities = scheme.activities
		this.handlers = scheme.handlers
		this.defaultActivity = scheme.defaultActivity
		this.setActivity(this.defaultActivity)
	}
	
	nextAction(action = `>${this.defaultActivity}`) {
		if (action[0] === ">") {
			this.setActivity(action.slice(1))
			return
		}
		const actualHandler = this.getActualHandler(action)
		const next = actualHandler(this.lastInteraction,this)
		if (next !== undefined)
			this.nextAction(next)
	}
}