import ClickerCell from "./clicker-cell.js"
import Trigger from "../../utility/trigger.js"
import GameTimer from "../game-timer.js"
import Format from "../../utility/format.js"

const TIMER_CELL_MAX_TIME = 5000
const TIMER_CELL_MIN_REAL_TIME = 1000
const TIMER_LEVEL_DECREASE = 300

export default class TimerCell extends ClickerCell {
    name = "Timed clicker"
    
    autoLevelGroup = 2
    
    renderColor = [0.5, 0.0, 0.0, 1]
    renderData = [1, 0, 0, 0]
    glyphColor = [1,1,1,0.2]

    maxTimer = TIMER_CELL_MAX_TIME
    maxTime = TIMER_CELL_MAX_TIME
    stage = 0
    
    static price() {
        return [0, 10 * 10 ** this.getCount()]
    }
    
    constructor() {
        super()

        this.timer = new GameTimer(this.maxTimer, false)
        this.timer.time -= Math.random() //phase offset

        Trigger.on(this.timer.events.ticks, this.action.bind(this, this))
    }
    
    levelUpInfo() {
        return `Next level will have base activation time lower by ${Format.displayNumber(TIMER_LEVEL_DECREASE / 1000, 1)}s.`
    }
    
    setPosition(x, y) {
        super.setPosition(x, y)

        this.timer.enable()
    }

    remove() {
        this.timer.disable()

        super.remove()
    }

    update() {
        this.maxTime = game.rules.minTimer + 1000 * (TIMER_CELL_MAX_TIME - game.rules.minTimer - TIMER_LEVEL_DECREASE * this.level) / (1000 + (this.quality - 1) ** 0.5)
        this.timer.setMaxTime(Math.max(TIMER_CELL_MIN_REAL_TIME, this.maxTime))
        this.renderData[1] = this.timer.time
        this.renderData[2] = this.timer.maxTime
        this.renderData[3] = performance.now()

        super.update()
    }
    
    action(source, times) {
        this.clicks = 1
        if (this.maxTime < TIMER_CELL_MIN_REAL_TIME) {
            this.stage += TIMER_CELL_MIN_REAL_TIME
            this.clicks = Math.floor(this.stage / this.maxTime)
            this.stage -= this.clicks * this.maxTime
        }
        super.action(source, times)
    }

    hoverInfo() {
        let result = `${super.hoverInfo()}
    time: ${this.timer.time | 0}/${this.timer.maxTime | 0}`
        if (this.maxTime < TIMER_CELL_MIN_REAL_TIME) {
            result = `${result}
    stage: ${Format.displayNumber(this.stage, 2)} / ${Format.displayNumber(this.maxTime, 0)}
    last clicks: ${Format.displayNumber(this.clicks, 0)}`
        }
        return result
    }

    getSaveData() {
        const saveData = super.getSaveData()
        saveData.time = this.timer.time
        return saveData
    }

    loadData(data) {
        super.loadData(data)
        this.timer.time = data.time
    }

}