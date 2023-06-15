"use strict"

export default class PointerControlScheme{
	constructor(handlers, script, defaultActivity = "Default") {
		this.handlers = handlers
		this.activities = {}
		this.script = script
		this.defaultActivity = defaultActivity
	}
	
	prepare(pointer) {
		this.pointer = pointer
		if (this.script) {
			this.pointer.compiler.compile(this, this.script)
			delete this.script
		}
	}
}