import GameCells from "../game-cells.js"
import HexCells from "../../utility/hex-cells.js"

const GameMapArrows = (base) => class extends base {
    updateArrows(cellID) {
        const arrows = []

        const cell = this.getCell(cellID)
        if (cell === undefined)
            return arrows

        if (cell instanceof GameCells.ConductorCell) {
            for (let shift of HexCells.ADJACENT_POSITION_SHIFTS) {
                let start = cell.getConnection(shift[0], shift[1])
                if (start === undefined)
                    continue
                let end = cell.getConnection(-shift[0], -shift[1])
                if (end === undefined)
                    continue
                if (start.isFeeding(end)) {
                    const shared = end.isFeeding(start)
                    arrows.push([start.x, start.y, end.x, end.y, start.renderColor, shared ? 0.2 : 0.4, shared ? 0.3 : 0])
                }
            }
            return
        }

        let width = 0.33
        if (cell instanceof GameCells.WideClickerCell)
            width /= cell.area ** 0.5
        if (cell instanceof GameCells.ProducerCell)
            width = 0.5

        if (!(cell instanceof GameCells.ProducerCell) || ui.settings.displayResourceConnections)
            for (let target of cell.targets) {
                arrows.push([cell.x, cell.y, target.x, target.y, cell.renderColor, width])
            }

        for (let other of game.map.cells) {
            if (!other.isFeeding(cell))
                continue

            let width = 0.2
            if (other instanceof GameCells.ProducerCell) {
                if (ui.settings.displayResourceConnections)
                    width = 0.5
                else
                    continue
            }
            if (other instanceof GameCells.ClickerCell) {
                if (ui.settings.displayIncomingClickers)
                    width = 0.1
                else
                    continue
            }

            arrows.push([other.x, other.y, cell.x, cell.y, other.renderColor, width])
        }

        if (ui.settings.displayResourcePowerConnections)
            if (cell instanceof GameCells.ProducerCell) {
                for (let other of game.map.cells) {
                    if (!(other instanceof GameCells.PowerCell))
                        continue
                    for (let target of other.targets)
                        if (target !== cell && other.isFeedingResource(target, cell.resource.id))
                            arrows.push([other.x, other.y, target.x, target.y, other.renderColor, 0.2])
                }
            }
        
        scene.setArrows(arrows)
    }
}

export default GameMapArrows