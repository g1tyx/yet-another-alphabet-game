import {getPosition} from "../../utility/utility.js"
import UniqueID from "../../utility/unique-id.js"
import Format from "../../utility/format.js"
import HexCells from "../../utility/hex-cells.js"

export default class BaseCell {
    static CELL_GAIN_TYPES = {
        QUALITY : 0,
        EXPERIENCE : 1,
        RESOURCE : 2,
        POWER : 28,
    }

    static RENDER_SIZE = 40

    name = this.constructor.name
    uid = UniqueID()

    autoLevelGroup = -1
    
    lastActivation = 0
    activations = []
    activationsPerSecond = 0
    
    activeActivations = []
    activeActivationsPerSecond = 0
    
    renderColor = [0.5, 0.5, 0.5, 1]
    renderData = [0, 0, 0, 0]
    glyphColor = [1,1,1,0.5]
    
    gained = []
    lastDisplayed = []
    
    quality = 1
    experience = 0

    level = 0
    maxLevel = 0
    leveled = false

    enabled = true

    queuedUpdate = false
    queuedDisplayUpdate = false
    
    targets = []

    static getCount() {
        return window?.game?.map?.countCells(this) ?? 0
    }
    
    static price() {
        return [10 * 10 ** BaseCell.getCount()]
    }
    
    constructor() {
        this.queueUpdate()
    }

    update() {
        this.queuedUpdate = false
        this.maxLevel = Math.max(0,Math.floor(Math.log(this.experience) / Math.log(game.rules.levelExpScale)))
        
        if (this.maxLevel > this.level && this.autoLevelGroup > -1 &&
            game.rules.autoLevel[this.autoLevelGroup] &&
            game.settings.autoLevel[this.autoLevelGroup])
            this.maximizeLevel()

        this.queueUpdateDisplay()
//        this.updateDisplay()
    }

    levelPrice(level, price = []) {
        for (let i = 0; i <= level; i++) {
            price[i] = (price[i] ?? 0) + (10 ** (level - i + 1))
        }
        return price
    }
    
    levelUpPrice(max = false) {
        const price = []
        this.levelPrice(this.level, price)
        
        if (max) {
            for (let i = this.level + 1; i < this.maxLevel; i++) {
                this.levelPrice(i, price)
            }
        }
        
        return price
    }
    
    levelUp() {
        if (this.maxLevel <= this.level)
            return false
    
        if (!game.rules.freeLevels) {
            const price = this.levelUpPrice()
    
            if (!game.resources.pay(price))
                return false
        }
        
        this.level++
        this.leveled = true
        this.queueUpdate()
        
        return true
    }
    
    levelUpInfo() {
//        const price = this.levelUpPrice()
        return ``
    }
    
    maximizeLevel() {
        while (this.levelUp()) {}
    }

    queueUpdate() {
        if (this.queuedUpdate)
            return
        
        this.queuedUpdate = true
        game.queueUpdate(this)
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
        const [squareX, squareY] = HexCells.hexToSquare(x, y)
        this.squareX = squareX 
        this.squareY = squareY
        this.position = getPosition(x, y)
        this.queueUpdate()
    }

    remove() {
        delete this.x
        delete this.y
        delete this.position
        scene.removeCell(this.uid)
        this.queueUpdate()
    }

    addQuality(amount, source) {
        this.quality += amount
        this.displayGain(BaseCell.CELL_GAIN_TYPES.QUALITY, amount)

        if (ui.settings.qualityBolts)
            this.getBolted(source)
        
        this.queueUpdate()
    }
    
    updateAPS(active = false) {
        let x
        
        for (x = 0; this.activations.length > x && this.activations[x] < game.now - 1000; x += 2) {
            this.activationsPerSecond -= this.activations[x+1]
        }
        
        if (x > 0)
            this.activations.splice(0,x)
    
        for (x = 0; this.activeActivations.length > x && this.activeActivations[x] < game.now - 1000; x += 2) {
            this.activeActivationsPerSecond -= this.activeActivations[x+1]
        }
        
        if (x > 0)
            this.activeActivations.splice(0,x)
        
        return active ? this.activeActivationsPerSecond : this.activationsPerSecond
    }
    
    registerAPS(times, active = false) {
        if (times <= 0)
            return
        if (active) {
            if (this.activeActivations.length > 0 && this.activeActivations[this.activeActivations.length - 2] > game.now - 100)
                this.activeActivations[this.activeActivations.length - 1] += times
            else
                this.activeActivations.push(game.now, times)
            this.activeActivationsPerSecond += times
        } else {
            if (this.activations.length > 0 && this.activations[this.activations.length - 2] > game.now - 100)
                this.activations[this.activations.length - 1] += times
            else
                this.activations.push(game.now, times)
            this.activationsPerSecond += times
        }

        if (this.activations.length > 40 || this.activeActivations.length > 40)
            this.updateAPS()
    }
    
    action(source, times = 1) {
        this.lastActivation = performance.now()
        this.registerAPS(times)
        
        const amount = times * Math.log10(this.quality + 10)
        this.experience += amount
        this.displayGain(BaseCell.CELL_GAIN_TYPES.EXPERIENCE, amount)
        
        this.queueUpdate()
    }
    
    queueAction(source, times = 1) {
        game.queueAction(this, source, times)
    }

    queueUpdateDisplay() {
        if (this.queuedDisplayUpdate)
            return
    
        this.queuedDisplayUpdate = true
        ui.queueUpdateDisplay(this)
    }

    updateTargets(area = 1) {
        this.targets.length = 0
        game.map.getNeighbours(this, area, this.targets)
    }
    
    wantTarget(target) {
        return true
    }
    
    updateDisplay() {
        this.queuedDisplayUpdate = false
        scene.updateCellData(this.getRenderData())

        const now = performance.now()
        for (let i = 0; i < this.gained.length; i++) {
            const amount = this.gained[i]
            if (!amount)
                continue

            const lastDisplayed = this.lastDisplayed[i] ?? 1

            let type = i
            let resource = null

            if (i >= BaseCell.CELL_GAIN_TYPES.RESOURCE && i < BaseCell.CELL_GAIN_TYPES.RESOURCE + 26) {
                type = BaseCell.CELL_GAIN_TYPES.RESOURCE
                resource = i - BaseCell.CELL_GAIN_TYPES.RESOURCE
            }

            if (i >= BaseCell.CELL_GAIN_TYPES.POWER && i < BaseCell.CELL_GAIN_TYPES.POWER + 26) {
                type = BaseCell.CELL_GAIN_TYPES.POWER
                resource = i - BaseCell.CELL_GAIN_TYPES.POWER
            }

            if (now - lastDisplayed < ui.getGate(type))
                continue

            ui.mapScene.animateGain(this, type, amount, resource)

            this.gained[i] = 0
            this.lastDisplayed[i] = now
        }

        if (this.leveled) {
            ui.mapScene.displayLevelUp(this)
            this.leveled = false
        }
    }

    updateGlyphs() {
        game.map.updateGlyphs()
    }

    displayGain(type, amount) {
        this.gained[type] = (this.gained[type] ?? 0) + amount

        this.queueUpdateDisplay()
//        ui.mapScene.fireworks()
    }
    
    getBolted(source) {
        ui.bolt(source, this)
    }
    
    isFeeding(target) {
        return this.targets.indexOf(target) > -1
    }

    disable() {
        this.enabled = false
        this.queueUpdateDisplay()
    }

    enable() {
        this.enabled = true
        this.queueUpdateDisplay()
    }

    hoverInfo() {
        const aps = this.updateAPS(true)
//    position: ${this.position}
        return `Lv${this.level} ${this.name}
    max level: ${this.maxLevel} (${Format.displayNumber(this.experience)}/${Format.displayNumber(game.rules.levelExpScale ** (this.maxLevel + 1))} exp)
    quality: ${Format.displayNumber(this.quality)}
    APS : ${Math.ceil(aps)} / ${this.activationsPerSecond}
    APS efficiency : ${this.activationsPerSecond ? Format.displayNumber(100 * aps / this.activationsPerSecond, 2) : 0}%`
    }
    
    getSaveData() {
        return {
            type : this.constructor.name,
            experience : this.experience,
            quality : this.quality,
            enabled : this.enabled,
            level : this.level,
        }
    }

    loadData(data) {
        this.experience = data.experience ?? 0
        this.quality = data.quality ?? 0
        this.enabled = data.enabled ?? true
        this.level = data.level ?? 0
    }

    getRenderData() {
        return Object.assign({}, this)
        return {
            x : this.x,
            y : this.y,
            type : this.constructor.name,
            position : this.position,
            renderColor : this.renderColor,
            glyphColor : this.glyphColor,
            level : this.level,
            maxLevel : this.maxLevel,
        }
    }
}