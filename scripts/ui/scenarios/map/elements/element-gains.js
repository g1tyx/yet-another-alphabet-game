import BaseCell from "../../../../engine/cells/base-cell.js"

const MAX_GAINS = 4096

const GAIN_COLORS = {
    [BaseCell.CELL_GAIN_TYPES.POWER] : [0.0,0.1,0.3,1],
    [BaseCell.CELL_GAIN_TYPES.QUALITY] : [0.0,0.3,0.1,1],
    [BaseCell.CELL_GAIN_TYPES.RESOURCE] : [0.3,0.1,0.0,1],
    [BaseCell.CELL_GAIN_TYPES.EXPERIENCE] : [1,1,0.2,1],
}


const GainsElement = (base) => class extends base {
    currentGain = 0
    
    constructor(...args) {
        super(...args)
        Object.assign(this.bufferData, {
            "gainPosition" : MAX_GAINS * 4,
            "gainData" : MAX_GAINS * 4,
            "gainColor" : MAX_GAINS * 4,
        })
        this.elementData.gains = {
            alpha : true,
            program : "glyphs",
            position : "a_position",
            attributeData : {
                a_glyph_position : {
                    buffer : "gainPosition",
                },
                a_glyph_data : {
                    buffer : "gainData",
                },
                a_glyph_color : {
                    buffer : "gainColor",
                },
            },
            textures : ["glyphs"],
            count : MAX_GAINS,
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    
    animateGain(cell, type, amount, resource = null) {
        if (!this.onLayer(resource))
            return
        
        let x = type
        let y = 27
        let size = Math.log10(amount) | 0
        
        
        if (type === BaseCell.CELL_GAIN_TYPES.POWER) {
            size = (1 + size) ** 0.5 - 1
            x = 15
            y = resource
        }
        
        if (type === BaseCell.CELL_GAIN_TYPES.RESOURCE) {
            size = (1 + size) ** 0.5 - 1
            x = 14
            y = resource
        }
        
        this.setInstanceAttribute(this.currentGain, "gainPosition", [
            cell.x + (Math.random() * 0.5 - 0.25),
            cell.y + (Math.random() * 0.5 - 0.25),
            BaseCell.RENDER_SIZE * Math.min(1, (ui.settings.scaleGains ? 0.1 + size / 30 : 0.15)), 0])
        this.setInstanceAttribute(this.currentGain, "gainData", [performance.now(), 1000, x, y])
        this.setInstanceAttribute(this.currentGain, "gainColor", GAIN_COLORS[type])
        
        this.currentGain++
        if (this.currentGain >= MAX_GAINS)
            this.currentGain = 0
    }
}

export default GainsElement