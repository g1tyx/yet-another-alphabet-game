import BaseCell from "../cells/base-cell.js"
import HexCells from "../../utility/hex-cells.js"
import {getPosition} from "../../utility/utility.js"
import GameCells from "../game-cells.js"

const GameMapNeighbours = (base) => class extends base {
    getTypeNeighbours(cell, type = BaseCell, result = []) {
        if (!cell || !cell.position)
            return result

        for (let shift of HexCells.ADJACENT_POSITION_SHIFTS) {
            let other = this.grid.get(getPosition(cell.x + shift[0], cell.y + shift[1]))

            if (!(cell instanceof GameCells.WideClickerCell)) {
                if (other instanceof GameCells.ConductorCell)
                    other = other.getConnection(...shift)
            }

            if (!other || !(other instanceof type))
                continue

            result.push(other)
        }

        return result
    }

    getNeighbours(cell, area, result = []) {
        for (let dy = -area; dy <= area; dy++) {
            const minX = Math.max(-area, dy - area)
            const maxX = Math.min(area, dy + area)
            for (let dx = minX; dx <= maxX; dx++) {
                if (dx === 0 && dy === 0)
                    continue

                let other = this.grid.get(getPosition(cell.x + dx, cell.y + dy))

                if (!(cell instanceof GameCells.WideClickerCell) && area === 1) {
                    if (other instanceof GameCells.ConductorCell)
                        other = other.getConnection(dx, dy)
                }

                if (!other || other instanceof GameCells.ConductorCell)
                    continue

                if (!cell.wantTarget(other))
                    continue

                result.push(other)
            }
        }

        return result
    }

}

export default GameMapNeighbours