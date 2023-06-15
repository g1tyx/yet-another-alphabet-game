import ClickerCell from "./clicker-cell.js"
import HexCells from "../../utility/hex-cells.js"

export default class WideClickerCell extends ClickerCell {
    name = "Area clicker"
    
    autoLevelGroup = 5
    
    renderColor = [0.5, 0.0, 0.2, 1]
    renderData = [3,0.1,0.3,0]

    area = 1
    
    static price() {
        return [0, 0, 0, 0, 0, 10 * 10 ** this.getCount()]
    }
    
    levelUpInfo() {
        const change = Math.floor(Math.log10(this.quality) / 3 + (this.level + 1) / 3) - Math.floor(Math.log10(this.quality) / 3 + this.level / 3)
        if (change > 0)
            return `Next level will have wider area.`
        else
            return `One level is not enough to increase area.`
    }
    
    update() {
        const lastArea = this.area
        this.area = 2 + Math.floor(Math.log10(this.quality) / 3 + this.level / 3)
        if (this.area !== lastArea)
            this.updateTargets()

        super.update()
    }

    updateTargets() {
        super.updateTargets(this.area)
    }
    
    wantTarget(target) {
        if (target instanceof ClickerCell && HexCells.getHexDistance(target.x - this.x, target.y - this.y) > game.rules.wideHitClickersArea)
            return false
        return true
    }

    hoverInfo() {
        return `${super.hoverInfo()}
    area: ${this.area}`
    }

}