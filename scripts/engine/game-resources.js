import GameResource from "./game-resource.js"

export default class GameResources {
    lastResource
    
    constructor() {
        this.resources = []
        ui.resetResourceDisplays()
    }

    addResource() {
        if (this.canAdd()) {
            this.lastResource = new GameResource(this.lastResource)
            this.resources.push(this.lastResource)
            ui.enableResourceDisplay(this.lastResource)
            return this.lastResource
        }
    }
    
    getResource(resource) {
        return this.resources[resource]
    }
    
    nextResource() {
        if (this.lastResource)
            return this.lastResource.id + 1
        return 0
    }

    getName(resource) {
        return this.resources[resource]?.name ?? GameResource.getName(resource) ?? "?"
    }
    
    canAdd() {
        return !this.lastResource || this.lastResource.id < 25
    }

    canPay(amounts) {
        if (amounts.length > this.resources.length)
            return false
        
        for (let i = 0; i < amounts.length; i++)
            if (!this.resources[i].canPay(amounts[i] ?? 0))
                return false
        
        return true
    }
    
    pay (amounts) {
        if (!this.canPay(amounts))
            return false
        
        for (let i = 0; i < amounts.length; i++) {
            this.resources[i].pay(amounts[i])
        }
        
        return true
    }
    
    tryPayDebt() {
        for (let resource of this.resources) {
            if (!resource.canPayDebt())
                return false
        }

        for (let resource of this.resources) {
            resource.payDebt()
        }
        
        return true
    }

    getSaveData() {
        return {
            resources : this.resources.map(resource => resource.getSaveData())
        }
    }

    loadData(data) {
        ui.resetResourceDisplays()
        this.resources = []
        delete this.lastResource
        for (let resourceData of data.resources) {
            this.lastResource = this.addResource()
            this.lastResource.loadData(resourceData)
        }
    }

    hoverInfo() {
        return `Resources (owned / debt):
${this.resources.map(x => x.hoverInfo()).join("\n")}`
    }
}
