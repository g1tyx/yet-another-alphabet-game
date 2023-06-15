"use strict"

// PointerScriptCompiler
// Part of Pointer object
//
// Control scheme script compiler
// Language is simplistic, so token-level state machine is used
//
// TODO (low priority): alphabet checks, collision checks

/*
	// denotes commentary
	
	#Name {} : activity (convention : Capitalized)
	##Name : default activity
	activities have global visibility (don't have to be declared before use within same script)
	
	{} block : inline activity
	
	line format : <inputs> . <events> = <interactions>
	
	Inputs and their events:
		mouse - move
		wheel - scroll
		button0(lmb), button1, button2(rmb) - down(start), up(end), out(cancel)
		touch0(first), touch1(second) - start(down), move, end(up), cancel(out)
	
	Special event:
		idle <time>
	
	Keyword interactions: 
		anchor - sets anchor for activating input
		anchor_all - sets anchor for every input
		^ - return to previous activity (stacks, ^^ goes two levels)
		> <activity> - go to given activity
	
	Handlers can be part of interactions list
	If a handler returns a value, chain is stopped and state with returned name is activated
	
	> and {} can only be last in interactions description
*/

const POINTER_HANDLER_TYPES = {
	KEYWORD : 0,
	USER : 1,
	NEXT : 2,
}

// noinspection JSUnusedLocalSymbols
const POINTER_KEYWORD_HANDLERS = {	//executed in context of interaction like all handlers
	"^" : function (input, pointer) {
		pointer.previousActivity()
	},
	"anchor" : function (input, pointer) {
		input.setAnchor?.()
	},
	"anchor_all" : function (input, pointer) {
		pointer.setAnchors()
	},
}

// used to compile multiple handlers into one that can use different `this`
function complexSchemeHandlerMaker(functions) {
	return function(...args) {
		for (let func of functions) {
			const next = func(...args)
			if (next !== undefined) {
				return next
			}
		}
	}
}

// helper object to store parsed elements of a single control interaction
class PointerScriptCompilerControl {
	constructor(interactions, events, handlers, idle = -1) {
		this.interactions  = Object.assign([], interactions )
		this.events   = Object.assign([], events  )
		this.handlers = Object.assign([], handlers)
		this.idle = idle
	}
	
	reset() {
		this.interactions.length  = 0
		this.events.length   = 0
		this.handlers.length = 0
		this.idle = -1
	}
	
	// compiles control into fragment of activity for given pointer
	compile(scheme) {
		// create handler function
		const functions = []
		
		for (let {type, data} of this.handlers) {
			if (type === POINTER_HANDLER_TYPES.KEYWORD)
				functions.push(POINTER_KEYWORD_HANDLERS[data])
			
			if (type === POINTER_HANDLER_TYPES.USER)
				functions.push(scheme.handlers[data])
			
			if (type === POINTER_HANDLER_TYPES.NEXT)
				functions.push(() => data)
			
		}
		const handler = complexSchemeHandlerMaker(functions)
		
		// bind handler function to every event provided 
		const result = {}
		
		// special case for idle event
		if (this.idle > -1) {
			result["idle_"+this.idle] = handler
			return result
		}
		
		// one event for all interactions per record
		const interactionLine = this.interactions.join("_")+"."
		for (let event of this.events) {
			const eventLine = interactionLine + event
			result[eventLine] = handler
		}

		return result
	}
}

class PointerScriptCompilerContext {
	constructor(name, scheme, topmost = false) {
		this.name = name
		this.scheme = scheme
		this.topmost = topmost
		
		this.controls = []
		
		this.control = new PointerScriptCompilerControl()
	}
	
	// compiles closed context into an activity
	// by combining compiled controls into single activity
	createActivity () {
		const activity = {}
		
		for (let control of this.controls) {
			Object.assign(activity, control.compile(this.scheme))
		}
		
		this.scheme.activities[this.name] = activity
		return activity
	}
		
	// saves current control to storage, then resets current control
	saveControl() {
		if (this.control.interactions.length || this.control.idle > -1)
			this.controls.push(new PointerScriptCompilerControl(
				this.control.interactions,
				this.control.events,
				this.control.handlers,
				this.control.idle
			))
		
		this.control.reset()
	}
}

// global object to compile scripts
export default class PointerScriptCompiler {
	constructor(pointer) {
		this.pointer = pointer
		this.counter = 0
		this.keywordHandlers = new Set(Object.keys(POINTER_KEYWORD_HANDLERS))
		this.initStates()
	}
	
	// gives a name for anonymous context
	newContextName() {
		return "_" + this.counter++
	}
	
	// token type checkers
	isInteraction (token) {
		return this.interactions.has(token)
	}
	
	isKeywordHandler (token) {
		return this.keywordHandlers.has(token)
	}
	
	isUserHandler (token) {
		return this.userHandlers.has(token)
	}
	
	isActivity (token) {
		return this.activityList.has(token)
	}
		
	// checks whether every interaction listed have given input
	isEvent (interactions, token) {
		for (let interaction of interactions)
			if (!this.pointer.interactions[interaction].hasEvent(token))
				throw Error(interaction + " does not have event " + token)
			
		return true
	}
	
	// every {} block is a context, representing an activity
	// opening a block creates a context and sets it active
	// closing a block compiles context into activity and sets previous context active
	contextStack = []

	pushContext(name = this.newContextName()) {
		const context = new PointerScriptCompilerContext(name, this.scheme, this.contextStack.length === 0)
				
		this.contextStack.push(context)			
		this.context = context

		return context
	}

	popContext()  {
		const context = this.contextStack.pop()
		
		if (this.contextStack.length === 0 && !context.topmost)
			throw Error("} without opening {")
		
		const activity = context.createActivity()
		
		this.context = this.contextStack[this.contextStack.length - 1]
		
		return activity
	}

	initStates() {
		this.states = {
			top : (token) => {
				if (token === "#") {
					this.newName = ""
					return this.states.nameActivity
				}

				if (token === ",") {
					return this.states.top
				}
				
				return false

			},
			
			new : (token) => {
				if (token === "}") {
					if (this.popContext() !== false)
						if (this.contextStack.length === 0)
							return this.states.top
						else
							return this.states.new
					return false
				}
			
				if (token === "#") {
					this.newName = ""
					return this.states.nameActivity
				}

				if (token === ",") {
					return this.states.new
				}

				return this.states.inputs(token)
			},
			
			inputs : (token) => {
				if (token === ".") {
					if (this.context.control.interactions.length === 0)
						throw Error("No interactions defined before events")

					return this.states.events
				}

				if (token === "idle") {
					return this.states.setIdle
				}

				if (this.isInteraction(token)) {
					this.context.control.interactions.push(token)
					return this.states.inputs
				}

				throw Error("Unexpected token "+token)
			},

			events : (token) => {
				if (token === "=") {
					if (this.context.control.events.length === 0)
						throw ("No events defined for " + this.context.control.interactions.join(", "))

					return this.states.handlers
				}

				if (this.isEvent(this.context.control.interactions, token)) {
					this.context.control.events.push(token)

					return this.states.events
				}

				throw Error("Unexpected token "+token)
			},

			setIdle : (token) => {
				if (token === "=")
					throw Error("Time not defined for idle event")

				this.context.control.idle = +token
				if (isNaN(this.context.control.idle) || this.context.control.idle <= 0)
					throw Error(`${token} is not a valid time for idle event`)

				return this.states.finishIdle
			},

			finishIdle : (token) => {
				if (token === "=") {
					return this.states.handlers
				}
				throw Error("Unexpected token at idle event")
			},

			handlers : (token) => {
				if (token === "}") {
					this.context.saveControl()

					if (this.popContext() !== false)
						if (this.contextStack.length === 0)
							return this.states.top
						else
							return this.states.new

					throw Error("Unexpected token "+token)
				}

				if (token === ">") {
					return this.states.next
				}

				if (token === ",") {
					this.context.saveControl()

					return this.states.new
				}

				if (token === "{") {
					const context = this.context
					this.pushContext()
					
					context.control.handlers.push({
						type : POINTER_HANDLER_TYPES.NEXT,
						data : `>${this.context.name}`,
					})
					context.saveControl()
					
					return this.states.new
				}

				if (this.isKeywordHandler(token)) {
					this.context.control.handlers.push({
						type : POINTER_HANDLER_TYPES.KEYWORD,
						data : token,
					})
					return this.states.handlers
				}

				if (this.isUserHandler(token)) {
					this.context.control.handlers.push({
						type : POINTER_HANDLER_TYPES.USER,
						data : token,
					})
					return this.states.handlers
				}

				throw Error("Unknown handler " + token)
			},

			nameActivity : (token) => {
				if (token === "#") {
					return this.states.nameDefaultActivity
				}
				if (token === "{")
					throw Error("Creating nameless declared activity")

				this.newName = token

				return this.states.createActivity
			},

			nameDefaultActivity : (token) => {
				if (token === "{") 
					throw Error("Creating nameless declared activity")

				this.newName = token
				this.scheme.defaultActivity = token

				return this.states.createActivity
			},

			createActivity : (token) => {
				if (token === "{") {
					this.pushContext(this.newName)
					return this.states.new
				}

				throw Error("Unexpected token during declaration of activity " + this.newName)
			},

			next : (token) => {
				if (this.isActivity(token)) {
					this.context.control.handlers.push({
						type : POINTER_HANDLER_TYPES.NEXT,
						data : `>${token}`,
					})
					return this.states.handlers
				}

				throw Error("Unknown activity: " + token)
			}
		}
	}
	
	execute(tokens) {
		this.state = this.states.top
		
		for (let token of tokens) {
//			console.log("State `" + state.name + "` is processing `" + token + "`")
			this.state = this.state(token)
			
			if (!this.state)
				break
		}
		
		if (!this.state)
			throw Error("Compile failed")
		
		if (this.state !== this.states.top) 
			throw Error("Unexpected end of input. Compile failed.")

		console.log("Control script compiled.")
		return true
	}

	compile(scheme, script) {
		console.log("Compiling control script:")
		
		this.scheme = scheme

		// convert script to token stream
		const stream = script
						.replace(/\/\/.*/gm, "")					// remove comments
						.trim()
						.replace(/[ \t]*(\n[ \t]*)+/g, "\n")		// remove empty lines
						.replace(/([,.{}=#>^])/g, " $1 ")		    // wrap special symbols into spaces
						.replace(/\n/g, " , ")			            // replace newlines with equivalent comma separators
						.replace(/[ \t]+/g, " ")			        // remove double whitespace
						.replace(/({) ,|, (})/g, "$1$2")			// remove unnecessary commas
						
		const tokens = stream.trim().split(" ")						// break stream into tokens

		// find all activity declarations in the stream, which should be between # and {
		const declaredActivities = stream.match(/(?<=# )[^ ]+(?= {)/g)	

		this.interactions = new Set(Object.keys(this.pointer.interactions))
		this.userHandlers = new Set(Object.keys(scheme.handlers))
		this.activityList = new Set([...declaredActivities,...Object.keys(scheme.activities)])

		this.execute(tokens)
	}
}