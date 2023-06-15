import ClickerCell from "./clicker-cell.js"
import Format from "../../utility/format.js"

export default class RapidClickerCell extends ClickerCell {
    name = "Rapid clicker"
    
    autoLevelGroup = 3
    
    renderColor = [0.5, 0.2, 0.0, 1]
    renderData = [3,0.1,2,0]
    
    static price() {
        return [0, 0, 0, 10 * 10 ** this.getCount()]
    }
    
    levelUpInfo() {
        return `Next level increases produced clicks by ${2 ** this.level}.`
    }
    
    update() {
        this.clicks = Math.floor(Math.log10(this.quality)) + 2 ** this.level

        super.update()
    }

    hoverInfo() {
        return `${super.hoverInfo()}
    clicks: ${Format.displayNumber(this.clicks)}`
    }
}