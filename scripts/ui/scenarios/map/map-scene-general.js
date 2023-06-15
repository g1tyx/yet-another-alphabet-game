import MapScene from "./map-scene.js"
import BaseCell from "../../../engine/cells/base-cell.js"

const DEFAULT_BOUNDARIES = {
    left : -3,
    right : 3,
    bottom : -3,
    top : 3,
}

const MapSceneGeneral = (base) => class extends base {
    textureQuality = 512
    layer = null

    boundaries = Object.assign({}, DEFAULT_BOUNDARIES)

    boundaryExtension = 0
    
    finalizeElements(...args) {
        super.finalizeElements(...args)
    
        this.setHighlightColor(MapScene.HIGHLIGHT_COLORS.SELECT)
    }
    
    updateView(...args) {
        super.updateView(...args)
        
        window.ui?.resetHover()
        this.textureQuality = 2 ** Math.min(9, Math.ceil(Math.log(0.5 / this.pixelSize) / Math.log(2)))
    }
    
    displayLevelUp(cell) {
        this.fireworks(
            cell.squareX * BaseCell.RENDER_SIZE, cell.squareY * BaseCell.RENDER_SIZE,
            100 + 10 * cell.level,
            0, 6.29,
            0.1, 0.2 + 0.02 * cell.level,
            100, 1000 + 100 * cell.level,
            cell.renderColor
        )
    }
    
    onLayer(resource) {
        return (this.layer === null || resource === null || resource === this.layer)
    }
    
    extendBoundaries(value) {
        this.boundaryExtension = value
        this.setBoundaries(this.boundaries)
    }

    setBoundaries(boundaries = this.boundaries) {
        this.boundaries = boundaries
        this.view.setBoundaries({
            left : (boundaries.left - this.boundaryExtension) * BaseCell.RENDER_SIZE,
            right : (boundaries.right + this.boundaryExtension) * BaseCell.RENDER_SIZE,
            bottom : (boundaries.bottom - this.boundaryExtension) * BaseCell.RENDER_SIZE,
            top : (boundaries.top + this.boundaryExtension) * BaseCell.RENDER_SIZE,
        }, this.boundaryExtension === 0)
    }

    reset() {
        this.setBoundaries(DEFAULT_BOUNDARIES)
        this.extendBoundaries(0)
        this.view.cap()
    }
}
export default MapSceneGeneral