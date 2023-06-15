import Trigger from "../utility/trigger.js"

export default class GameTimer extends Trigger.Class(["tick", "ticks"]) {
    constructor(maxTime = 1000, enabled = true) {
        super()
        this.time = this.maxTime = maxTime
        this.enabled = enabled

        this.advanceEvent = Trigger.on(game.events.advance, this.advance.bind(this))

        if (this.enabled)
            this.enable()
    }

    advance(time) {
        this.time -= time

        if (this.time > 0)
            return 0

        if (this.maxTime <= 0) {
            this.time = 0
            return 0
        }

        const result = 1 + Math.floor(-this.time / this.maxTime)

        this.time += result * this.maxTime

        this.events.ticks()

        for (let i = 0; i < result; i++)
            this.events.tick()

        return result
    }

    setMaxTime(maxTime, reset = false) {
        this.maxTime = maxTime

        if (reset || this.time > this.maxTime)
            this.time = this.maxTime
    }

    enable() {
        game.registerTimer(this)
        this.advanceEvent.enable()
        this.enabled = true
    }

    disable() {
        this.enabled = false
        this.advanceEvent.disable()
        game.unregisterTimer(this)
    }
}