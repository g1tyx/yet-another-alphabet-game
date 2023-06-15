import GameCells from "../../../../engine/game-cells.js"

const MAX_BOLTS = 16384//8192

const BoltsElement = (base) => class extends base {
    currentBolt = 0
    
    constructor(...args) {
        super(...args)
        Object.assign(this.bufferData, {
            "boltStart" : MAX_BOLTS * 4,
            "boltEnd" : MAX_BOLTS * 4,
            "boltColor" : MAX_BOLTS * 4,
        })
        this.elementData.bolts = {
            alpha : true,
            program : "bolts",
            position : "a_position",
            attributeData : {
                a_bolt_start : {
                    buffer : "boltStart",
                },
                a_bolt_end : {
                    buffer : "boltEnd",
                },
                a_bolt_color : {
                    buffer : "boltColor",
                },
            },
            count : MAX_BOLTS,
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    bolt(start, end) {
        this.setInstanceAttribute(this.currentBolt, "boltStart", [start.x, start.y, performance.now(), start instanceof GameCells.ClickerCell ? 0 : 1])
        this.setInstanceAttribute(this.currentBolt, "boltEnd", [end.x, end.y, 500, Math.random() * 1000])
        this.setInstanceAttribute(this.currentBolt, "boltColor", start.renderColor)
        
        this.currentBolt++
        if (this.currentBolt >= MAX_BOLTS)
            this.currentBolt = 0
    }
}

export default BoltsElement