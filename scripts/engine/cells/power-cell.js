import BaseCell from "./base-cell.js"
import Format from "../../utility/format.js"
import GameCells from "../game-cells.js"

export default class PowerCell extends BaseCell {
    name = "Power generator"
    
    autoLevelGroup = 1

    renderColor = [0.3, 0.5, 0.7, 1]
//    glyphColor = [0.8, 0.9, 1.0, 1]
    glyphColor = [0.9, 0.9, 0.9, 1]

    depths = []

    powers = []

    productions = []

    static price() {
        return [10 * 10 ** this.getCount()]
    }

    constructor() {
        super()
    }

    update() {
        for (let i = 0; i < this.depths.length; i++) {
            if (this.depths[i] === undefined || this.depths[i] === Infinity)
                this.productions[i] = 0
            else
                this.productions[i] = this.getPower(i) ** (1 - 1 / (this.quality + 1) ** 0.25) * 2 ** (this.level - this.depths[i])
        }

        super.update()
    }
    
    levelUp() {
        if (!super.levelUp())
            return false
        
        this.updateTargets()
        this.updateGlyphs()
        
        game.map.updateDepths()
        game.map.updateGlyphs()
        
        return true
    }
    
    levelUpInfo() {
        return `Next level can have active depth up to ${this.level+1}.`
    }
    
    reset() {
        this.level = 0
        for (let i = 0; i < this.powers.length; i++)
            if (this.powers[i])
                for (let j = 0; j < this.powers[i].length; j++)
                    if (this.powers[i][j])
                        this.powers[i][j] = 1
    
        this.queueUpdate()
    }
    
    resetDepths() {
        this.depths.length = 0
    }

    setDepth(resource, depth) {
        if ((this.depths[resource] ?? Infinity) <= depth || depth > this.level)
            return false
        this.depths[resource] = depth
        return true
    }

    addResourceDepth(result, resource) {
        if (this.depths[resource] !== undefined && this.depths[resource] <= this.level)
            result.push([resource, this.depths[resource]])

        return result
    }

    getDepthList(result, layer = null) {
        if (layer !== null) {
            return this.addResourceDepth(result, layer)
        }

        for (let i = 0; i < this.depths.length; i++)
            this.addResourceDepth(result, i)

        return result
    }

    getDepth(resource) {
        return this.depths[resource] ?? Infinity
    }
    
    addPower(source, times = 1) {
        let result = 0
        let bolted = false
        
        for (let i = 0; i < this.depths.length; i++) {
            if (!source.isFeedingResource(this, i))
                continue
            const depthHere = this.getDepth(i)

            if (!this.powers[i])
                this.powers[i] = []

            const amount = source.getProduction(i) * times
            this.powers[i][depthHere] = (this.powers[i][depthHere] ?? 1) + amount
            result += times
            
            if (!bolted) {
                if (ui.settings.powerBolts)
                    this.getBolted(source)
                bolted = true
            }

            this.displayGain(BaseCell.CELL_GAIN_TYPES.POWER + i, amount)
        }

        this.queueUpdate()
        return result
    }

    getProduction(resource) {
        return this.productions[resource] ?? 1
    }

    getPower(resource, depth = this.getDepth(resource)) {
        return this.powers[resource]?.[depth] ?? 1
    }

    action(source, times = 1) {
        super.action(source, times)

        if (!this.enabled)
            return
        
        if (ui.settings.clickerBolts)
            this.getBolted(source)

        let actions = 0
        for (let cell of this.targets)
            actions += cell.addPower?.(this, times) ?? 0

        if (this.targets.length > 0)
            this.registerAPS(actions, true)
    
    }
    
    isFeedingResource(target, resource) {
        if (target instanceof GameCells.ProducerCell)
            return target.resource.id === resource

        const depthHere = this.getDepth(resource)
        if (depthHere === Infinity || depthHere > this.level)
            return false
    
        const depthThere = target.getDepth(resource)
        if (depthThere >= depthHere)
            return false
    
        return true
    }
    
    isFeeding(target, building = false) {
        if (!building && this.targets.indexOf(target) === -1)
            return false
        
        if (target instanceof GameCells.ProducerCell)
            return true
        if (target instanceof GameCells.PowerCell) {
            for (let i = 0; i < this.depths.length; i++)
                if (this.isFeedingResource(target, i))
                    return true
        }
        
        return false
    }
    
    updateTargets(area = 1) {
        super.updateTargets(area)
    }
    
    wantTarget(target) {
        if (this.isFeeding(target, true))
            return true
        return false
    }
    
    hoverInfo() {
        return `${super.hoverInfo()}
    production:
${this.depths.map((x,i) => this.getDepth(i) <= this.level ? `        ${game.resources.getName(i)}(${this.getDepth(i)}): ${Format.displayNumber(this.getProduction(i))} (${Format.displayNumber(this.getPower(i))} power)` : null).filter(x => x).join("\n")}`
    }

    getSaveData() {
        const saveData = super.getSaveData()
        saveData.powers = this.powers
        return saveData
    }

    loadData(data) {
        super.loadData(data)
        this.powers = data.powers
    }
}