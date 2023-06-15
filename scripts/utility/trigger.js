// Event system
//
// Trigger: 
//
// Trigger.on(event, handler, ...args) - registers a handler for given event, returns TriggerEventHandler
// Trigger.once(event, handler, ...args) - same, but will only trigger once, returns TriggerEventHandler
//
// Trigger(event, ...args) - triggers given event with extra arguments for handlers
// Trigger handlers are queued, sorted by priority (if set) within single event activation
//
// Trigger.now(event, ...args) - adds new triggers to the beginning of the queue
// Trigger.async(event, ...args) - triggers given event asynchronously (setTimeout(...,0))
//
// Trigger.ify(events) - adds list of unique events for object
// <object>.events.<name>(...args) triggers every handler created with Trigger.on(<object>.events.<name>)
//
// Trigger.Class(events) - creates Trigger.ify-ed empty class

// TriggerEventHandler:
//
// .disable - disables handler
// .cancel - disables handler, cancels all its queued resolutions, blocks enabling
// .enable - enables handler if if was not cancelled
// .setPriority(x) - the higher, the earlier handler will be added to queue for an event
//
// event can be identified by anything supported as a key to Map,
// noinspection JSUnusedGlobalSymbols

const events = new Map()

let executing = false
const executionQueue = []

function getEvent(eventID, create = true) {
	if (!events.has(eventID)) {
		if (!create)
			return false

		return new TriggerEvent(eventID)
	}

	return events.get(eventID)
}

function executeQueue() {
	if (executing)
		return
	executing = true
	while (executionQueue.length) {
		const {handler, args} = executionQueue.shift()
		handler.execute(...args)
	}
	executing = false
}

class TriggerEventHandler {
	constructor(event, handler, args) {
		if (event === undefined)
			throw Error ("Can't set trigger for undefined")

		this.priority = 0

		this.event = event
		this.handler = handler
		this.args = args

		this.enable()
	}

	//not intended for manual use!
	kill() {
		this.active = false
	}

	queue(...args) {
		executionQueue.push({
			handler : this,
			args
		})

		if (this.once === true)
			this.disable()
	}

	queueNow(...args) {
		executionQueue.unshift({
			handler : this,
			args
		})

		if (this.once === true)
			this.disable()
	}

	execute(...args) {
		if (this.cancelled)
			return

		this.handler(...this.args, ...args)
	}

//public
	setPriority(priority) {
		this.priority = priority

		const event = getEvent(this.event)
		event.modified = true
	}

	enable() {
		if (this.cancelled)
			return false

		const event = getEvent(this.event)

		event.add(this)

		this.active = true

		return true
	}

	disable() {
		const event = getEvent(this.event)

		event.delete(this)

		this.active = false

		return true
	}

	cancel() {
		this.disable()
		this.cancelled = true
	}

	reattach(newEvent) {
		if (this.active)
			this.disable()

		delete this.cancelled

		this.event = newEvent
		this.enable()
	}
}

class TriggerEvent {
	constructor(id) {
		this.id = id
		this.handlers = new Set()
		this.sortedHandlers = []
		this.modified = false
		events.set(this.id, this)
	}

	add(handler) {
		this.handlers.add(handler)
		this.modified = true
	}

	delete(handler) {
		this.handlers.delete(handler)
		this.modified = true
	}

	clear() {
		this.modified = false

		for (let handler of this.handlers)
			handler.kill()

		this.handlers.clear()
		this.sortedHandlers = []

		events.delete(this.id)
	}

	trigger(...args) {
		if (this.modified)
			this.sortHandlers()

		for (let eventHandler of this.sortedHandlers) {
			eventHandler.queue(...args)
		}

		executeQueue()
	}

	triggerNow(...args) {
		if (this.modified)
			this.sortHandlers()

		for (let eventHandler of this.sortedHandlers) {
			eventHandler.queueNow(...args)
		}

		executeQueue()
	}

	sortHandlers() {
		this.modified = false
		this.sortedHandlers = [...this.handlers].sort(
			({priority : x = 0}, {priority : y = 0}) => y - x
		)
	}
}

const Trigger = Object.assign(function(...args) {
	Trigger.event(...args)
}, {

	now (eventID, ...args) {
		const event = events.get(eventID)
		event.triggerNow(...args)
	},

	once (event, handler, ...args) {
		const eventHandler = new TriggerEventHandler(event, handler, args)
		eventHandler.once = true
		return eventHandler
	},

	on (event, handler, ...args) {
		return new TriggerEventHandler(event, handler, args)
	},

	event(eventID, ...args) {
		const event = getEvent(eventID)
		event.trigger(...args)
	},

	async (eventID, ...args) {
		setTimeout(Trigger.bind(Trigger, eventID, ...args), 0)
	},

	registerEvents(element, eventList) {
		element.events ??= {}

		for (let event of eventList) {
			element.events[event] = function trigger(...args) {
				Trigger.event(trigger, ...args)
			}
		}
	},

	ify (baseClass, eventList) {
		return class extends baseClass {
			constructor(...args) {
				super(...args)
				Trigger.registerEvents(this, eventList)
			}
		}
	},

	Class (eventList) {
		return Trigger.ify(class{}, eventList)
	}
})

export default Trigger