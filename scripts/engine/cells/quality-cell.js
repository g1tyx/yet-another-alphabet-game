import BaseCell from "./base-cell.js"
import Format from "../../utility/format.js"

export default class QualityCell extends BaseCell {
    name = "Quality generator"
    
    autoLevelGroup = 4
    
    renderColor = [0.0, 0.5, 0.0, 1]
    production = 1
    
    static price() {
        return [0, 0, 10 * 10 ** this.getCount()]
    }
    
    levelUpInfo() {
        return `Next level will be twice as effective.`
    }
    
    update() {
        this.production = Math.log10(this.quality + this.level) * 2 ** this.level + 1

        super.update()
    }

    action(source, times = 1) {
        super.action(source, times)

        if (!this.enabled)
            return
    
        if (ui.settings.clickerBolts)
            this.getBolted(source)

        if (this.targets.length > 0)
            this.registerAPS(times * this.targets.length, true)
        
        for (let cell of this.targets)
            cell.addQuality?.(this.production * times, this)
    }
    
    updateTargets(area = 1) {
        super.updateTargets(area)
        if (game.rules.qualitySelf)
            this.targets.add(this)
    }
    
    hoverInfo() {
        return `${super.hoverInfo()}
    production: ${Format.displayNumber(this.production)}`
    }
}