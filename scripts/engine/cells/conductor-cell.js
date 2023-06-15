import BaseCell from "./base-cell.js"
import {getPosition} from "../../utility/utility.js"
import HexCells from "../../utility/hex-cells.js"

export default class ConductorCell extends BaseCell {
    name = "Conductor"
    renderColor = [0.1, 0.1, 0.1, 1.0]
    renderData = [4,0,0,0]
    connections = new Map()
//    glyphColor = [0.8, 0.9, 1.0, 1]

    productionType = BaseCell.CELL_GAIN_TYPES.POWER

    static price() {
        return [0, 0, 0, 0, 10 * 10 ** this.getCount()]
    }
    
    update() {
        this.queueUpdateDisplay()
    }
    
    disable() {
        super.disable()
        game.map.update()
    }
    
    enable() {
        super.enable()
        game.map.update()
    }
    
    levelUp() {
    }
    
    action(source, times = 1) {
    }

    hoverInfo() {
        return `Conductor cell.
        
Connects cells on opposite edges across itself.`
    }

    updateTargets(area = 1) {
    }
    
    updateConnections() {
        this.connections.clear()
        for (let shift of HexCells.ADJACENT_POSITION_SHIFTS) {
            let step = 0
            let other = this
            while (other instanceof ConductorCell) {
                step++
                other = game.map.grid.get(getPosition(this.x + step * shift[0], this.y + step * shift[1]))
            }
            if (other)
                this.connections.set(getPosition(...shift), other)
        }
        this.queueUpdateDisplay()
    }
    
    getConnection(dx, dy) {
        if (this.enabled)
            return this.connections.get(getPosition(dx, dy))
    }
    
    loadData(data) {
        super.loadData(data)
    }
}