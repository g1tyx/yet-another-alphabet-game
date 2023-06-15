import BaseCell from "../../../../engine/cells/base-cell.js"
import GameCells from "../../../../engine/game-cells.js"
import glyphsSheet from "../glyphs-sheet.js"

const MAX_GLYPHS = 2048;

const GlyphsElement = (base) => class extends base {
    glyphIndices = {}
    currentGlyph = 0
    
    constructor(...args) {
        super(...args)
        
        Object.assign(this.bufferData, {
            "glyphPosition" : MAX_GLYPHS * 4,
            "glyphData" : MAX_GLYPHS * 4,
            "glyphColor" : MAX_GLYPHS * 4,
        })

        this.textureData.glyphs = {}
        
        this.elementData.glyphs = {
            alpha : true,
            program : "glyphs",
            position : "a_position",
            attributeData : {
                a_glyph_position : {
                    buffer : "glyphPosition",
                },
                a_glyph_data : {
                    buffer : "glyphData",
                },
                a_glyph_color : {
                    buffer : "glyphColor",
                },
            },
            textures : ["glyphs"],
            count : 0,
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    finalizeElements(...args) {
        super.finalizeElements(...args)
        this.textures.glyphs.assign(glyphsSheet())
    }
    
    updateGlyphColor(cellID, color) {
        const id = this.glyphIndices[cellID]
        if (id === undefined)
            return
        this.setInstanceAttribute(id, "glyphColor", color)
    }
    
    addGlyph(x, y, tx, ty, color, scale = 1) {
        if (this.currentGlyph >= MAX_GLYPHS)
            return
        
        this.setInstanceAttribute(this.currentGlyph, "glyphPosition", [x, y, BaseCell.RENDER_SIZE * 0.6 * scale, 1])
        this.setInstanceAttribute(this.currentGlyph, "glyphData", [0, 0, tx, ty])
        this.setInstanceAttribute(this.currentGlyph, "glyphColor", color)

        return this.currentGlyph++
    }
    
    setGlyphs(glyphs) {
        this.currentGlyph = 0
        this.glyphIndices = {}
        for (let glyph of glyphs) {
            const cellID = glyph.pop()
            this.glyphIndices[cellID] = this.addGlyph(...glyph)
        }
        this.elements.glyphs.count = this.currentGlyph
    }

    clearGlyphs() {
        this.setGlyphs([])
    }
    
    forgetGlyphIndex(cellID) {
        delete this.glyphIndices[cellID]
    }

    reset() {
        super.reset()
        this.clearGlyphs()
    }
}

export default GlyphsElement