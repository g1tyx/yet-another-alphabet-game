const MAX_SPARKS = 8192

const SparksElement = (base) => class extends base {
    currentSpark = 0
    
    constructor(...args) {
        super(...args)
        Object.assign(this.bufferData, {
            "sparkPosition" : MAX_SPARKS * 4,
            "sparkTime" : MAX_SPARKS * 4,
            "sparkColor" : MAX_SPARKS * 4,
        })
        this.elementData.sparks = {
            alpha : true,
            program : "sparks",
            position : "a_position",
            attributeData : {
                a_spark_position : {
                    buffer : "sparkPosition",
                },
                a_spark_color : {
                    buffer : "sparkColor",
                },
                a_spark_time : {
                    buffer : "sparkTime",
                },
            },
            count : MAX_SPARKS,
            renderOrder : Object.entries(this.elementData).length,
        }
    }
    
    
    spark(x, y, angle, speed, life, color) {
        this.setInstanceAttribute(this.currentSpark, "sparkPosition", [x, y, angle, speed])
        this.setInstanceAttribute(this.currentSpark, "sparkTime", [performance.now(), life, 0, 0])
        this.setInstanceAttribute(this.currentSpark, "sparkColor", color)
        
        this.currentSpark++
        if (this.currentSpark >= MAX_SPARKS)
            this.currentSpark = 0
    }
    
    fireworks(x, y, amount, minAngle, maxAngle, minSpeed, maxSpeed, minLife, maxLife, color) {
        for (let i = 0; i < amount; i++) {
            this.spark(x, y,
                minAngle + Math.random() * (maxAngle - minAngle),
                minSpeed + Math.random() * (maxSpeed - minSpeed),
                minLife + Math.random() * (maxLife - minLife),
                color)
        }
    }
}

export default SparksElement