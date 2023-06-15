import BaseCell from "./base-cell.js"

export default class ClickerCell extends BaseCell {
    name = "Clicker"

    renderColor = [0.5, 0, 0, 1]

    clicked = false
    clicks = 1

    action(source, times = 1) {
        super.action(source, times)
        
        if (!this.enabled)
            return
    
        if (ui.settings.clickerBolts)
            this.getBolted(source)
    
        let hits = this.targets.length
        if (this.targets.indexOf(source) > -1)
            hits--
        
        this.registerAPS(this.clicks * hits, true)
        
        for (let cell of this.targets)
            cell.queueAction(this, this.clicks)

        this.queueUpdate()
    }
    
    queueAction(source, times = 1) {
        if (this.clicked)
            return
        
        this.clicked = true
        super.queueAction(source, times)
    }
    
    update() {
        super.update()

        this.clicked = false
    }
}