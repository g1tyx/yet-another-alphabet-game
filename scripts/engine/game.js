import GameResources from "./game-resources.js"
import GameMap from "./game-map.js"
import Trigger from "../utility/trigger.js"
import GameCells from "./game-cells.js"
import ClickerCell from "./cells/clicker-cell.js"
import core from "../core.js"

const GAME_MAX_ITERATIONS = 100
const DEFAULT_SAVE_SLOT = "yaag_save"

const DEFAULT_GAME_SETTINGS = {
    autoLevel : [
        true, //production
        true, //power
        true, //timer
        true, //multi
        true, //quality
        true, //area
    ]
}

const DEFAULT_GAME_RULES = {
    minTimer : 1000,
    qualitySelf : false,
    wideHitClickersArea : 0,
    newResourceDebt : 100,
    levelExpScale : 10,
    freeLevels : false,
    autoLevel : [
        false, //production
        false, //power
        false, //timer
        false, //multi
        false, //quality
        false, //area
    ],
    partialProduction : false,
}

export default class Game extends Trigger.Class(["advance"]) {
    settings = Object.assign({}, DEFAULT_GAME_SETTINGS)
    busy = 0

    constructor() {
        super()
    }

    reset(newGame = false) {
        this.busy = true
        ui.reset()

        this.rules = Object.assign({}, DEFAULT_GAME_RULES)
        this.settings = Object.assign({}, DEFAULT_GAME_SETTINGS)

//        this.rules.autoLevel = this.rules.autoLevel.map(x => true) //DEBUG

        this.map ??= new GameMap()
        this.map.reset()

        this.targetTime = this.now = 0

        this.resources = new GameResources()

        this.timers = new Set()
        this.updateList = []//new Set()
        this.actionsList = []

        if (newGame) {
            const resource = this.resources.addResource()

            const startCell = new GameCells.ProducerCell(resource)
            this.map.addCell(0, 0, startCell)
            this.resources.pay([this.rules.newResourceDebt])
        }this.busy = false

    }

    queueUpdate(element) {
        this.updateList.push(element)
    }

    update() {
        let element
        
        while (element = this.updateList.pop())
            element.update()
        
        this.resources.tryPayDebt()

        ui.queueUpdate()
    }

    registerTimer(timer) {
        this.timers.add(timer)
    }

    unregisterTimer(timer) {
        this.timers.delete(timer)
    }

    addBusy() {
        this.busy++
    }

    removeBusy() {
        if (this.busy > 0)
            this.busy--
    }

    resetBusy() {
        this.busy = 0
    }

    isBusy() {
        return this.busy > 0
    }


    advance() {
        this.addBusy()
        let iterations = 0
        while (this.targetTime > this.now && iterations < GAME_MAX_ITERATIONS) {
            iterations++

            let timeStep = this.targetTime - this.now
            for (let timer of this.timers)
                if (timer.time < timeStep)
                    timeStep = timer.time
            
            this.now += timeStep
            
            this.events.advance(timeStep)
            
            this.executeActions()
            
            this.update()
        }
        this.removeBusy()

    }
    
    queueAction(cell, source, times) {
        this.actionsList.push([cell, source, times])
    }
    
    executeActions() {
        let actionData
        while (actionData = this.actionsList.pop()) {
            actionData[0].action(actionData[1], actionData[2])
        }
    }
    
    analyzeActions(actionMap = new Map()) {
        let actionData
        while (actionData = this.actionsList.pop()) {
            if (actionData[0] instanceof ClickerCell)
                actionData[0].action(actionData[1], actionData[2])
            actionMap.set(actionData[0], (actionMap.get(actionData[0]) ?? 0) + actionData[2])
        }
        return actionMap
    }
    
    analyzeCell(cell) {
        cell.queueAction()
        console.log(this.analyzeActions())
    }

    spawnCell(position, type, ...args) {
        if (!this.resources.pay(type.price(...args)))
            return false
        
        const [x,y] = position.split(",").map(Number)
        this.map.addCell(x, y, new type(...args))
    }

    setActiveCell(cellID){
        this.map.updateArrows(cellID)
    }

    getSaveData() {
        this.addBusy()
        const saveData = {
            map : this.map.getSaveData(),
            resources : this.resources.getSaveData(),
            settings : this.settings,
            now : this.now,
            targetTime : this.targetTime,
            saveTime : Date.now(),
        }
        this.removeBusy()
        return saveData
    }

    loadData(data) {
        this.reset()

        this.addBusy()

        Object.assign(this.settings, data.settings)
        
        this.resources.loadData(data.resources)
        this.map.loadData(data.map)
        
        this.now = data.now ?? 0
        this.targetTime = data.targetTime ?? this.now

        this.targetTime += Date.now() - (data.saveTime ?? Date.now())

        this.removeBusy()
//        this.targetTime = data.now
    }
    
    save(slot = DEFAULT_SAVE_SLOT) {
        this.addBusy()
        core.setLocalStorage(slot, JSON.stringify(game.getSaveData()))
        this.removeBusy()
    }
    
    async load(slot = DEFAULT_SAVE_SLOT) {
        try {
            this.addBusy()
            const saveData = await core.getLocalStorage(slot)
            if (saveData !== undefined) {
                this.loadData(JSON.parse(saveData))
                return true
            }
            this.removeBusy()
            return false
        } catch (e) {
            console.log(e)
            this.reset(true)
            this.resetBusy()
            return true
        }
    }

    moveCell(x, y, cellID) {
        this.map.moveCell(x, y, cellID)
    }
}