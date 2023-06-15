const MAX_BOLTS = 16384//8192

const MapBGElement = (base) => class extends base {
    static HIGHLIGHT_COLORS = {
        SELECT : [0,0,0,1],
        MENU : [1,1,0,1],
    }
    
    constructor(...args) {
        super(...args)

        this.elementData.bg = {
            alpha : false,
            program : "bg",
            position : "a_position",
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    setHighlightCell(x, y) {
        this.elements.bg.uniforms.u_highlight_cell = [x, y]
    }
    
    setHighlightColor(color) {
        this.elements.bg.uniforms.u_highlight_color = color
    }
}

export default MapBGElement