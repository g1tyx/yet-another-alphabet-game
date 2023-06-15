import GameCells from "../../../../engine/game-cells.js"
import HexCells from "../../../../utility/hex-cells.js"

const MAX_CELLS = 4096

const CellsElement = (base) => class extends base {
    cells = {}
    indices = {}
    grid = {}

    lastCell = -1

    constructor(...args) {
        super(...args)
    
        Object.assign(this.bufferData, {
            "cellPosition": MAX_CELLS * 4,
            "cellData": MAX_CELLS * 4,
            "cellColor": MAX_CELLS * 4,
            "cellLevels": MAX_CELLS * 2,
            "cellNeighbourColor0": MAX_CELLS * 4,
            "cellNeighbourColor1": MAX_CELLS * 4,
            "cellNeighbourColor2": MAX_CELLS * 4,
            "cellNeighbourColor3": MAX_CELLS * 4,
            "cellNeighbourColor4": MAX_CELLS * 4,
            "cellNeighbourColor5": MAX_CELLS * 4,
        })
        
        this.elementData.cells = {
            alpha : true,
            program : "cells",
            position : "a_position",
            attributeData : {
                a_cell_position : {
                    buffer : "cellPosition",
                },
                a_cell_levels : {
                    buffer : "cellLevels",
                },
                a_cell_data : {
                    buffer : "cellData",
                },
                a_cell_color : {
                    buffer : "cellColor",
                },
                a_cell_neighbour_color0 : {
                    buffer : "cellNeighbourColor0",
                },
                a_cell_neighbour_color1 : {
                    buffer : "cellNeighbourColor1",
                },
                a_cell_neighbour_color2 : {
                    buffer : "cellNeighbourColor2",
                },
                a_cell_neighbour_color3 : {
                    buffer : "cellNeighbourColor3",
                },
                a_cell_neighbour_color4 : {
                    buffer : "cellNeighbourColor4",
                },
                a_cell_neighbour_color5 : {
                    buffer : "cellNeighbourColor5",
                },
            },
            count : 0,
            renderOrder : Object.entries(this.elementData).length,
        }
    }

    updateCellData(cell) {
        cell.hoverInfo = async () => await engine.cellHoverInfo(cell.uid)
        if (this.cells[cell.uid]?.position !== cell.position) {
            delete this.grid[this.cells[cell.uid]?.position]
            if (cell.position !== undefined)
            this.grid[cell.position] = cell
        }
        this.cells[cell.uid] = cell
        this.updateCell(cell.uid)
    }

    getCell(cellID) {
        return this.cells[cellID]
    }

    updateCell(cellID, index = this.indices[cellID], x, y) {
        const cell = this.getCell(cellID)
        if (cell === undefined)
            return

        x ??= cell.x
        if (x === undefined)
            return

        y ??= cell.y

        if (index === undefined) {
            this.lastCell++
            index = this.lastCell
            this.indices[cellID] = index
            this.elements.cells.count = this.lastCell + 1
        }
        
        this.setInstanceAttribute(index,"cellPosition", [x, y, cell.lastActivation, cell.enabled ? 1 : 0])
        this.setInstanceAttribute(index,"cellLevels", [cell.level, cell.maxLevel])
        this.setInstanceAttribute(index,"cellColor", cell.renderColor)
        this.setInstanceAttribute(index,"cellData", cell.renderData)
        
        if (cell instanceof GameCells.ConductorCell) {
            for (let i = 0; i < 6; i++) {
                let there = cell.getConnection(...HexCells.ADJACENT_POSITION_SHIFTS[i]) //TODO
                this.setInstanceAttribute(index, `cellNeighbourColor${i}`, there?.renderColor ?? cell.renderColor)
            }
        }
        
        if (cell instanceof GameCells.ProducerCell)
            this.updateGlyphColor(cellID, cell.glyphColor)
    }

    removeCell(cellID) {
        const index = this.indices[cellID]
        if (index === undefined)
            return

        delete this.indices[cellID]

        const cell = this.getCell(cellID)
        delete this.cells[cellID]
        delete this.grid[cell?.position]
        this.forgetGlyphIndex?.(cellID)

        this.elements.cells.count--

        for (let [other, otherIndex] of Object.entries(this.indices)) {
            if (otherIndex === this.lastCell) {
                this.lastCell--
                this.indices[other] = index
                this.updateCell(other)
                return
            }
        }
    }

    clearCells() {
        this.cells = {}
        this.indices = {}
        this.lastCell = -1
        this.elements.cells.count = 0
        delete this.previewCell
    }

    setPreviewCell(cellID, x, y) {
        this.extendBoundaries(20)

        const cell = this.getCell(cellID)
        if (!cell)
            return

        if (this.previewCell === undefined) {
            this.elements.cells.count++
        }

        cell.renderColor[3] = 0.5

        this.previewCell = cellID
        this.updateCell(cellID, this.lastCell + 1, x, y)
        this.updateCell(cellID)
        
        this.clearArrows?.()
        this.addArrow?.(cell.x, cell.y, x, y, cell.renderColor)
    }

    resetPreviewCell() {
        if (this.previewCell === undefined)
            return

        this.extendBoundaries(0)

        const cell = this.getCell(this.previewCell)
        cell.renderColor[3] = 1.0

        this.updateCell(this.previewCell)

        this.elements.cells.count--
        delete this.previewCell
    }

    reset() {
        super.reset()
        this.resetPreviewCell()
        this.clearCells()
    }
}

export default CellsElement