export default class GLTexture {
    constructor(gl, data) {
        this.gl = gl

        this.texture = gl.createTexture()

//        console.log("!")
        
        if (data.array === undefined)
            this.type = gl.TEXTURE_2D
        else {
            this.type = gl.TEXTURE_2D_ARRAY
            this.array = data.array
        }

        gl.bindTexture(this.type, this.texture)

        //TODO: clean up, bind to data.repeat, data.interpolation
        gl.texParameteri(this.type, gl.TEXTURE_WRAP_S, data.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.type, gl.TEXTURE_WRAP_T, data.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE)
        gl.texParameteri(this.type, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(this.type, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

        if (data.array === undefined) {
            if (data.url)
                this.load(data.url)
            else
                gl.texImage2D(this.type,
                    0, //mipLevel
                    data.internalFormat ?? gl.RGBA,
                    data.width ?? 512,
                    data.height ?? 512,
                    data.border ?? 0,
                    data.format ?? gl.RGBA,
                    data.type ?? gl.UNSIGNED_BYTE,
                    null) //if provided, load image, set delayed data here
        } else {
            gl.texImage3D(this.type,
                0, //mipLevel
                data.internalFormat ?? gl.RGBA,
                data.width ?? 512,
                data.height ?? 512,
                data.array,
                data.border ?? 0,
                data.format ?? gl.RGBA,
                data.type ?? gl.UNSIGNED_BYTE,
                null) //if provided, load image, set delayed data here
        }
    }

    set(slot) {
        const gl = this.gl

        gl.activeTexture(gl.TEXTURE0+slot)
        gl.bindTexture(this.type, this.texture)
    }
    
    load(url) {
//        console.log("!!")
        const gl = this.gl
        
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
    
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));
    
        const img = new Image()
        img.src = url
        img.onload = () => {
            this.assign(img)
        }
    
        return this.texture
    }
    
    assign(data) {
//        console.log("!!!")
        const gl = this.gl
    
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
        gl.generateMipmap(gl.TEXTURE_2D);

        return this.texture
    }
}