import {getPosition} from "../utility/utility.js"
import BaseCell from "./cells/base-cell.js"
import GameCells from "./game-cells.js"
import HexCells from "../utility/hex-cells.js"
import CompositeClass from "../utility/composite-class.js"
import GameMapCells from "./elements/game-map-cells.js"
import GameMapGlyphs from "./elements/game-map-glyphs.js"
import GameMapNeighbours from "./elements/game-map-neighbours.js"
import GameMapCellUtility from "./elements/game-map-cell-utility.js"
import GameMapBounds from "./elements/game-map-bounds.js"
import GameMapArrows from "./elements/game-map-arrows.js"


class GameMapGeneral {
    reset() {}
    update() {}

    getSaveData() {
        return {}
    }
    
    loadData(data) {
        this.update()
    }
}

const GameMap = CompositeClass(
    GameMapGeneral,
    GameMapBounds,
    GameMapCells,
    GameMapCellUtility,
    GameMapGlyphs,
    GameMapNeighbours,
    GameMapArrows,
)

export default GameMap