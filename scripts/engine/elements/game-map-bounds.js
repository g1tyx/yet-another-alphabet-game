const GameMapBounds = (base) => class extends base {
    update(...args) {
        super.update(...args)
        this.updateBounds()
    }

    capped = true

    uncap() {
        this.capped = false
        this.updateBounds()
    }

    cap() {
        this.capped = true
        this.updateBounds()
    }

    updateBounds() {
        const boundaries = {
            left : Infinity,
            top : -Infinity,
            right : -Infinity,
            bottom : Infinity,
        }

        for (let cell of this.cells) {
            boundaries.left = Math.min(boundaries.left, cell.squareX)
            boundaries.right = Math.max(boundaries.right, cell.squareX)
            boundaries.bottom = Math.min(boundaries.bottom, cell.squareY)
            boundaries.top = Math.max(boundaries.top, cell.squareY)
        }

        const extra = 2
        boundaries.left -= extra * 2
        boundaries.right += extra * 2
        boundaries.bottom -= extra
        boundaries.top += extra

        scene.setBoundaries(boundaries)
    }

}

export default GameMapBounds