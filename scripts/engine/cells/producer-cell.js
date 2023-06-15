import BaseCell from "./base-cell.js"
import Format from "../../utility/format.js"

const GLYPH_COLORS = {
    OK : [1, 1, 1, 0.8],
    DEBT : [0.1, 0.3, 0.0, 1.0],
    DEEP_DEBT : [0.6, 0.1, 0.0, 1.0],
}

const BASE_NAME = "Resource generator"

export default class ProducerCell extends BaseCell {
    name = BASE_NAME //updated on construction
    
    autoLevelGroup = 0
    
    renderColor = [0.5, 0.6, 0.0, 1]
    renderData = [2,0,0,0]
    glyphColor = GLYPH_COLORS.OK

    power = 1

    production = 1

    rate = 10
    
    static price(resource) {
        const result = []
        result[resource.id ?? resource] = game.rules.newResourceDebt
            return result
    }

    constructor(resource) {
        super()
        this.setResource(resource)
    }
    
    setResource(resource) {
        this.resource?.resetCell()
        this.resource = resource
        this.name = `${BASE_NAME} (${this.resource?.name ?? "?"})`
        this.resource?.setCell(this)
    }

    update() {
//        this.production = this.power ** (1 - 1 / (this.quality + 1) ** 0.25)
        this.production = Math.floor(this.power * 2 ** this.level)
        this.rate = Math.ceil(Math.max(10, 200 / (1 + this.level)) / Math.log10(this.quality + 10) ** 0.25)
        
        this.glyphColor = this.resource.haveDebt() ? this.resource.canPayDebt() ? GLYPH_COLORS.DEBT : GLYPH_COLORS.DEEP_DEBT : GLYPH_COLORS.OK

        super.update()
    }
    
    addPower(source, times = 1) {
        const amount = source.getProduction(this.resource.id)
        this.power += amount * times
    
        if (ui.settings.powerBolts)
            this.getBolted(source)
        
        this.displayGain(BaseCell.CELL_GAIN_TYPES.POWER + this.resource.id, amount)

        this.queueUpdate()
        return times
    }

    action(source, times = 1) {
        super.action(source, times, false)
        
        if (!this.enabled)
            return
    
        if (ui.settings.clickerBolts)
            this.getBolted(source)

        const consumable = this.resource.material
        
        let production = this.production * times
        const singleCost = this.production * this.rate

        if (consumable) {
            let consumption
            if (game.rules.partialProduction) {
                const units = Math.floor(consumable.value / this.rate)
                times = Math.min(Math.ceil(units / this.production), times)
                production = Math.min(units, this.production * times)
                consumption = production * this.rate
                times = consumption / singleCost
                
            } else {
                times = Math.min(Math.floor(consumable.value / singleCost), times)
                production = this.production * times
                consumption = singleCost * times
            }
            if (times === 0 || !consumable.consume(consumption)) {
                this.renderData[2] = 1
                return
            }
        }
        
        this.registerAPS(times, true)
    
        this.renderData[2] = 0
        this.resource.produce(production)

        this.displayGain(BaseCell.CELL_GAIN_TYPES.RESOURCE + this.resource.id, production)
    }
    
    levelUpInfo() {
        let result = `Next level will have double production`
        
        if (this.resource?.material)
            result = `${result} at lower rate`
        
        return `${result}.`
    }
    
    reset() {
        this.power = 1
        this.level = 0
        this.queueUpdate()
    }
    
    updateTargets(area = 1) {
        this.targets.length = 0
        const target = this.resource.consumer?.cell
        if (target)
            this.targets.push(target)
    }
    
    hoverInfo() {
        const aps = this.updateAPS(true)
        const nextCell = this.resource.consumer?.cell
        const apsNext = nextCell?.updateAPS(true) ?? 0
        const consumption = apsNext * (nextCell?.production ?? 0) * (nextCell?.rate ?? 0)
        return `${super.hoverInfo()}
    power: ${Format.displayNumber(this.power)}
    unit cost: ${this.resource.material ? `${Format.displayNumber(this.rate, 0)} ${this.resource.material.name}` : "free"}
    production: ${Format.displayNumber(this.production, 0)}
    consumption: ${this.resource.material ? `${Format.displayNumber(this.rate * this.production, 0)} ${this.resource.material.name}` : "none"}
    
    ${this.resource.material ? `${this.resource.material.name} CPS : ${Format.displayNumber(this.production * aps * this.rate)} / ${Format.displayNumber(this.resource.material.value)}` : `no consumption`}
    PPS : ${Format.displayNumber(this.production * aps)}
    ${apsNext === 0 ? `no consumption` : `CPS : ${Format.displayNumber(consumption)} / ${Format.displayNumber(this.resource.value)}`}`
    }


    getSaveData() {
        const saveData = super.getSaveData()
        saveData.power = this.power
        saveData.resource = this.resource.id
        return saveData
    }

    loadData(data) {
        super.loadData(data)
        this.power = data.power
        this.setResource(game.resources.getResource(data.resource))
    }
}