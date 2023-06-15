import GameCells from "../../../../engine/game-cells.js"
import HexCells from "../../../../utility/hex-cells.js"

const MAX_ARROWS = 1024

const ArrowsElement = (base) => class extends base {
    currentGlyph = 0

    constructor(...args) {
        super(...args)
        Object.assign(this.bufferData, {
            "arrowStart" : MAX_ARROWS * 4,
            "arrowEnd" : MAX_ARROWS * 4,
            "arrowColor" : MAX_ARROWS * 4,
        })
        
        this.elementData.arrows = {
            alpha : true,
            program : "arrows",
            position : "a_position",
            attributeData : {
                a_arrow_start : {
                    buffer : "arrowStart",
                },
                a_arrow_end : {
                    buffer : "arrowEnd",
                },
                a_arrow_color : {
                    buffer : "arrowColor",
                },
            },
            count : 0,
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    
    addArrow(startX, startY, endX, endY, color, width = 0.33, shift = 0) {
        if (this.currentArrow >= MAX_ARROWS - 1)
            return

        this.setInstanceAttribute(this.currentArrow, "arrowStart", [startX, startY, width, shift])
        this.setInstanceAttribute(this.currentArrow, "arrowEnd", [endX, endY, 0, 0])
        this.setInstanceAttribute(this.currentArrow, "arrowColor", color)

        return this.currentArrow++
    }
    
    setArrows(arrows) {
        this.currentArrow = 0
        this.elements.arrows.count = 0

        if (!ui.settings.displayConnections)
            return

        for (let arrow of arrows) {
            this.addArrow(...arrow)
        }
        this.elements.arrows.count = this.currentArrow
    }
    
    clearArrows() {
        this.setArrows([])
    }

    reset() {
        super.reset()
        this.clearArrows()
    }

}

export default ArrowsElement