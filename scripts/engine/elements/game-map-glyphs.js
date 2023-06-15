import GameCells from "../game-cells.js"

const POWER_COLUMNS = [0,1,1,2,2,2,2,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]

const GameMapGlyphs = (base) => class extends base {
    glyphLayer = null

    reset(...args) {
        super.reset(...args)
        this.capped = true
        this.glyphLayer = null
    }

    update(...args) {
        super.update(...args)
        this.updateGlyphs()
    }

    toggleLayer(layer = null) {
        if (this.glyphLayer !== layer)
            this.glyphLayer = layer
        else
            this.glyphLayer = null

        this.updateGlyphs()
    }

    updateGlyphs() {
        const glyphs = []

        const depths = []

        for (let cell of this.cells) {
            if (cell instanceof GameCells.ClickerCell)
                continue

            if (cell instanceof GameCells.ConductorCell)
                continue

            if (cell instanceof GameCells.PowerCell) {
                depths.length = 0
                cell.getDepthList(depths, this.glyphLayer)

                if (depths.length === 1) {
                    glyphs.push([cell.x, cell.y, Math.min(13, depths[0][1] + 1), depths[0][0], cell.glyphColor, cell.uid])
                    continue
                }

                const columns = POWER_COLUMNS[depths.length]
                const lines = Math.ceil(depths.length / columns)

                const scale = 1.0 / Math.max(columns, lines)

                const dx = 0.6 / columns
                const dy = 0.6 / lines

                const sx = - (columns - 1) / 2
                const sy = - (lines - 1) / 2

                for (let i = 0; i < depths.length; i++) {
                    const y = Math.floor(i / columns)
                    const x = i - y * columns
                    glyphs.push([cell.x + (x + sx) * dx, cell.y - (y + sy) * dy, Math.min(13, depths[i][1] + 1), depths[i][0], cell.glyphColor, scale, cell.uid])
                }
            } else {
                let x = 0
                let y = 0

                if (cell instanceof GameCells.ProducerCell)
                    y = cell.resource.id

                if (cell instanceof GameCells.QualityCell)
                    y = 26

                glyphs.push([cell.x, cell.y, x, y, cell.glyphColor, cell.uid])
            }
        }

        scene.setGlyphs(glyphs)
    }

}

export default GameMapGlyphs