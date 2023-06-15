import DOM from "../utility/dom.js"
import GameResource from "../engine/game-resource.js"
import Format from "../utility/format.js"

export default class UIResourceDisplay {
    enabled = false
    
    constructor(parent, id) {
        this.id = id
        
        this.dvMain = DOM.createDiv(parent, "resource hidden")
        this.dvName = DOM.createDiv(this.dvMain, "name", GameResource.getName(this.id))
        this.dvValues = DOM.createDiv(this.dvMain, "values")
        this.dvAmount = DOM.createDiv(this.dvValues, "value amount", 0)
        this.dvDebt = DOM.createDiv(this.dvValues, "value debt", 0)
        
        this.dvName.onmousemove = (event) => {
            ui.setHoverObject(event.clientX, event.clientY, this.resource)
        }

        this.dvName.onmouseleave = this.dvMain.onmousecancel = (event) => {
            ui.resetHover()
        }
    }
    
    enable(resource) {
        this.resource = resource
        this.enabled = true
        this.dvMain.classList.remove("hidden")
    }
    
    disable() {
        delete this.resource
        this.dvMain.classList.add("hidden")
        this.enabled = false
    }
    
    update() {
        if (!this.enabled)
            return
        this.dvAmount.innerText = Format.displayNumber(this.resource.value, 0)
        this.dvDebt.innerText = Format.displayNumber(this.resource.debt, 0)
        this.dvMain.classList.toggle("expensive", this.resource.debt > this.resource.value)
    }
}