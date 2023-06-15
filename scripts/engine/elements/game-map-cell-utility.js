import GameCells from "../game-cells.js"

const GameMapCellUtility = (base) => class extends base {
    update(...args) {
        super.update(...args)
        this.updateConductors()
        this.updateDepths()
        this.updateTargets()
        this.updateCellCounts()
    }

    updateConductors() {
        for (let cell of this.cells)
            if (cell instanceof GameCells.ConductorCell)
                cell.updateConnections()
    }

    updateDepths() {
        let updates = new Set()
        let nextUpdates = new Set()

        for (let cell of this.cells) {
            if (cell instanceof GameCells.PowerCell)
                cell.resetDepths()

            if (cell instanceof GameCells.ProducerCell)
                updates.add(cell)
        }

        nextUpdates.clear()

        for (let base of updates) {
            const cells = this.getTypeNeighbours(base, GameCells.PowerCell)
            for (let cell of cells) {
                cell.setDepth(base.resource.id, 0)
                nextUpdates.add(cell)
            }
        }

        while (nextUpdates.size) {
            [nextUpdates, updates] = [updates, nextUpdates]
            nextUpdates.clear()

            for (let base of updates) {
                const cells = this.getTypeNeighbours(base, GameCells.PowerCell)
                for (let cell of cells) {
                    for (let i = 0; i < base.depths.length; i++) {
                        if (!cell.setDepth(i, base.getDepth(i) + 1))
                            continue
                        nextUpdates.add(cell)
                    }
                }
            }
        }
    }

    updateTargets() {
        for (let cell of this.cells)
            cell.updateTargets()
    }

}

export default GameMapCellUtility