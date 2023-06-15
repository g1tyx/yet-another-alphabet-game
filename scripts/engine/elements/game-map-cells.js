import {getPosition} from "../../utility/utility.js"
import GameCells from "../game-cells.js"

const GameMapCells = (base) => class extends base {
    grid = new Map()
    cells = new Set()
    cellsById = {}
    typeCounts = new Map()

    reset(...args) {
        super.reset(...args)
        for (let cell of this.cells)
            cell.remove()
        this.grid.clear()
        this.cells.clear()
        this.cellsById = {}
        scene.clearCells()
    }

    update(...args) {
        super.update(...args)
        this.updateCellCounts()
    }

    addCell(x, y, cell, update = true) {
        const position = getPosition(x, y)

        if (this.grid.get(position) !== undefined)
            return false

        this.grid.set(position, cell)
        this.cells.add(cell)
        this.cellsById[cell.uid] = cell
        cell.setPosition(x, y)

        if (update)
            this.update()

        return true
    }

    moveCell(x, y, cellID, update = true) {
        const cell = this.getCell(cellID)
        if (cell === undefined)
            return

        const oldPosition = cell.position
        const position = getPosition(x, y)

        const there = this.grid.get(position)

        if (there) {
            const oldX = cell.x
            const oldY = cell.y
            this.grid.delete(position)
            this.grid.delete(oldPosition)
            this.addCell(x, y, cell, false)
            this.addCell(oldX, oldY, there, false)
        } else {
            this.grid.delete(oldPosition)
            this.addCell(x, y, cell, false)
        }

        if (update)
            this.update()

        return true
    }

    removeCell(cell, update = true) {
        const position = cell.position
        if (!position)
            return false

        this.grid.delete(position)
        this.cells.delete(cell)
        delete this.cellsById[cell.uid]

        if (update)
            this.update()

        cell.remove()

        return true
    }

    getCell(cellID) {
        return this.cellsById[cellID]
    }

    updateCellCounts() {
        this.typeCounts.clear()
        for (let cell of this.cells) {
            const type = GameCells[cell.constructor.name]
            this.typeCounts.set(type, (this.typeCounts.get(type) ?? 0) + 1)
        }
    }

    countCells(type) {
        return this.typeCounts.get(type) ?? 0
    }

    getSaveData() {
        const saveData = super.getSaveData()
        for (let [position, cell] of this.grid)
            saveData[position] = cell.getSaveData()
        return saveData
    }

    loadData(data) {
        for (let [position, cellData] of Object.entries(data)) {
            const CellType = GameCells[cellData.type]
            if (CellType === undefined)
                continue
            const cell = new CellType()
            cell.loadData(cellData)
            const [x,y] = position.split(",").map(Number)
            this.addCell(x, y, cell, false)
        }

        super.loadData(data)
    }

}

export default GameMapCells