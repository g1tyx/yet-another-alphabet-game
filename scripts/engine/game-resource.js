import Format from "../utility/format.js"

const RESOURCE_NAMES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split``

const MAX_DEBT = 1e300
const MAX_VALUE = 1e300

export default class GameResource {
    cell
    
    static getName(id) {
        return RESOURCE_NAMES[id]
    }
    
    constructor(last) {
        this.last = last
        this.id = (last?.id ?? -1) + 1

        this.name = RESOURCE_NAMES[this.id]
        
        this.debt = 0
        this.value = 0
        
        this.material = this.last
        
        if (this.material)
            this.material.consumer = this
    }
    
    canPay(value) {
        return this.debt + value <= MAX_DEBT
    }
    
    produce(amount) {
        this.value = Math.min(MAX_VALUE, this.value + amount)
        this.cell?.queueUpdate()
    }
    
    consume(amount) {
        if (this.value < amount)
            return false
        
        this.value -= amount
        this.cell?.queueUpdate()
        
        return true
    }
    
    pay(amount) {
        if (!this.canPay(amount))
            return false
        
        this.debt += amount
        this.cell?.queueUpdate()
        
        return true
    }
    
    haveDebt() {
        return this.debt > 0
    }
    
    canPayDebt() {
        return this.debt <= this.value
    }
    
    payDebt() {
        if (!this.canPayDebt())
            return false
        
        this.value -= this.debt
        this.debt = 0
        this.cell?.queueUpdate()
        
        return true
    }
    
    getSaveData() {
        return {
            value : this.value,
            debt : this.debt,
        }
    }
    
    loadData(data) {
        this.value = data.value
        this.debt = data.debt
    }
    
    setCell(cell) {
        this.cell = cell
    }
    
    resetCell() {
        delete this.cell
    }
    
    getProduction() {
        if (!this.cell)
            return 0
        const aps = this.cell.updateAPS(true)
        return this.cell.production * aps
    }
    
    getConsumption() {
        if (!this.consumer?.cell)
            return 0
        const aps = this.consumer.cell.updateAPS(true)
        return this.consumer.cell.production * this.consumer.cell.rate * aps
    }
    
    hoverInfo() {
        const production = this.getProduction()
        const consumption = this.getConsumption()
        return `Resource ${this.name}: ${Format.displayNumber(this.value, 0)}

Production: ${Format.displayNumber(production, 0)} ${this.name}/s
Consumption: ${Format.displayNumber(consumption, 0)} ${this.name}/s
Change: ${Format.displayNumber(production - consumption, 0)} ${this.name}/s${this.debt > 0?`

Debt: ${Format.displayNumber(this.debt, 0)}

Debt can only be paid out
for all resources at once.
You can't build next Resource Generator
until all debts are paid out.`:``}`
        
        /*        const aps = this.updateAPS(true)
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
*/
    }
}