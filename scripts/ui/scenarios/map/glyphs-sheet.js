const SCALE = 128

export default function glyphsSheet() {
    const canvas = document.createElement("canvas")
    canvas.width = SCALE * 16
    canvas.height = SCALE * 32
    const c = canvas.getContext("2d")
/*
    canvas.className = "debug"
    document.body.append(canvas)
    c.beginPath()
    c.strokeStyle = "red"
    for (let i = 0; i < 32; i++) {
        c.moveTo(i * SCALE, 0)
        c.lineTo(i * SCALE, 32 * SCALE)
        c.moveTo(0, i * SCALE)
        c.lineTo(16 * SCALE, i * SCALE)
    }
    c.stroke()
*/
    c.textAlign = "center"
    c.textBaseline = "middle"
    c.fillStyle = "white"
    c.scale(SCALE, SCALE)
    for (let i = 0; i < 26; i++) {
        c.save()
        c.textAlign = "center"
        c.translate(0, i)
        c.font = `0.95px Share Tech Mono`
        c.fillText(String.fromCharCode(65 + i), 0.5, 0.57)
        c.font = `0.9px Share Tech Mono`
        for (let j = 0; j < 13; j++) {
            c.fillText(String.fromCharCode(97 + i), j + (j > 9 && j < 12 ? 1.19 : 1.39), 0.5)
        }
        c.font = `0.9px Share Tech Mono`
        c.fillText(`${String.fromCharCode(65 + i)}`, 14.25, 0.5)
        c.fillText(`${String.fromCharCode(97 + i)}`, 15.25, 0.5)
        c.font = `0.6px Share Tech Mono`
        c.fillText(`▲`, 14.7, 0.5)
        c.fillText(`▲`, 15.7, 0.5)
        c.textAlign = "left"
        for (let j = 0; j < 13; j++) {
            c.fillText(j === 12 ? "n" : j, j + (j > 9 && j < 12 ? 1.39 : 1.59), 0.7)
        }
        c.restore()
    }
    c.font = `2px Share Tech Mono`
    c.fillText("+", 0.5, 26.55)
    c.font = `0.6px Share Tech Mono`
    c.fillText("QLT", 0.5, 27.5)
    c.fillText("EXP", 1.5, 27.5)
    return canvas
}