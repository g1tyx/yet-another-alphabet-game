import DOM from "../utility/dom.js"
import InteractiveSurface from "./framework/surface/surface.js"
import SCENARIOS from "./scenarios/scenarios.js"
import BaseCell from "../engine/cells/base-cell.js"
import RoundMenu from "../utility/round-menu.js"
import UIHover from "./ui-hover.js"
import UIResourceDisplay from "./ui-resource-display.js"
import GameCells from "../engine/game-cells.js"
import Format from "../utility/format.js"

const DEFAULT_DISPLAY_TIME = 100
const DEFAULT_UI_SETTINGS = {
    displayGainResourceGate : DEFAULT_DISPLAY_TIME,
    displayGainPowerGate : DEFAULT_DISPLAY_TIME,
    displayGainExperienceGate: DEFAULT_DISPLAY_TIME,
    displayGainQualityGate : DEFAULT_DISPLAY_TIME,
    scaleGains : false,
    
    hoverDelay : 500,
    
    boltCooldown : 100,
    clickerBolts : false,
    wideBolts : false,
    qualityBolts : true,
    powerBolts : true,
    
    displayConnections : true,
    displayResourceConnections : false,
    displayResourcePowerConnections : true,
    displayIncomingClickers : true,
}

export default class UI {
    settings = Object.assign({}, DEFAULT_UI_SETTINGS)

    constructor(data) {
        this.updateList = []
        this.bolts = new Map()

        this.dvMain = DOM.createDiv(document.body, "layout")

        this.dvCenter = DOM.createDiv(this.dvMain, "center")
        this.canvas = DOM.createElement("canvas", "main", this.dvCenter)
        this.surface = new InteractiveSurface(this.canvas, SCENARIOS, {
            rendererData: {
                shaders : data.shaders,
            },
            viewportSettings: {
                devicePixelRatio : window.devicePixelRatio ?? 1,
            },
        })
        
        this.resources = []
        this.dvFirstResources = DOM.createDiv(this.dvCenter, "first resources")
        for (let i = 0; i < 13; i++)
            this.resources.push(new UIResourceDisplay(this.dvFirstResources, i))

        this.dvSecondResources = DOM.createDiv(this.dvCenter, "second resources")
        for (let i = 0; i < 13; i++)
            this.resources.push(new UIResourceDisplay(this.dvSecondResources, i + 13))

        this.dvTime = DOM.createDiv(this.dvCenter, "time")
    
        this.roundMenu = new RoundMenu.Front(roundMenuBackend)

        this.hover = new UIHover()
        this.hover.setDelay(this.settings.hoverDelay)
//        this.dvFooter = createDiv(this.dvMain, "footer")

        this.surface.setScenario("map")

        this.surface.activate()

        this.mapScene = this.surface.scenarios.map.scene

        requestAnimationFrame(this.frame.bind(this))
    }

    async updateHover() {
        if (this.hoverObject !== undefined) {
            this.hover.setText(await this.hoverObject.hoverInfo?.())
        }
    }

    frame(/*now*/) {
        this.update()

        if (this.updateQueued) {
            this.updateQueued = false

            this.updateHover()

            this.dvTime.innerHTML = `${Format.displayTime(game.now)} ${game.targetTime < game.now + 1000 ? `` : ` / ${Format.displayTime(game.targetTime)}`}`
            
            for (let resource of this.resources)
                resource.update()
        }

        requestAnimationFrame(this.frame.bind(this))
    }

    reset() {
        this.resetHover()
        this.hideMenu()
        this.mapScene.reset()
        this.surface.pointer.reset()
        this.surface.pointer.data = {}
    }

    queueUpdate() {
        this.updateQueued = true
    }

    queueUpdateDisplay(element) {
        this.updateList.push(element)
    }

    update() {
        for (let element of this.updateList)
            element.updateDisplay()

        this.updateList.length = 0
    }

    getGate(type) {
        return {
            [BaseCell.CELL_GAIN_TYPES.RESOURCE] : this.settings.displayGainResourceGate,
            [BaseCell.CELL_GAIN_TYPES.POWER] : this.settings.displayGainPowerGate,
            [BaseCell.CELL_GAIN_TYPES.EXPERIENCE] : this.settings.displayGainExperienceGate,
            [BaseCell.CELL_GAIN_TYPES.QUALITY] : this.settings.displayGainQualityGate,
        }[type]
    }

    showMenu(position, cellID) {
        this.roundMenu.setData({position, cellID})
            .then(() => this.mapScene.displayMenu())

        return this.roundMenu
    }
    
    hideMenu() {
        this.roundMenu.cancel()
        this.surface.pointer.reset()
    }

    setHighlightCell(x, y) {
        this.mapScene.setHighlightCell(x, y)
    }

    setHover(x, y, text) {
        const rect = this.canvas.getBoundingClientRect()
        this.hover.set(x + rect.x, y + rect.y, text)
    }
    
    setHoverObject(x, y, object) {
        this.hoverObject = object
        if (object)
            this.setHover(x, y, this.hoverObject.hoverInfo?.())
        else
            this.resetHover()
    }
    
    hideArrows() {
        this.mapScene.setArrows([])
    }

    addArrow(start, end) {
        this.mapScene.addArrow(start, end)
    }

    resetHover() {
        this.hover.cancel()
    }
    
    enableResourceDisplay(resource) {
        this.resources[resource.id].enable(resource)
    }
    
    resetResourceDisplays(){
        for (let resource of this.resources)
            resource.disable()
    }
    
    bolt(start, end) {
        if (!start || !end || !ui.settings.wideBolts && start instanceof GameCells.WideClickerCell)
            return
        
        const startBolts = this.bolts.get(start) ?? new Map()
        const lastBolt = startBolts.get(end) ?? 0
        const now = performance.now()
        
        if (lastBolt > now - this.settings.boltCooldown)
            return
        
        startBolts.set(end, now)
        this.bolts.set(start, startBolts)
        
        this.mapScene.bolt(start, end)
    }

}