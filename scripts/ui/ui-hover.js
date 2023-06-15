import DOM from "../utility/dom.js"

export default class UIHover {
    delay = 200
    visible = false
    timeout = 0
    text = ""
    
    x = 0
    y = 0
    mouseAlignX = 5
    mouseAlignY = -10
    
    constructor() {
        this.dvMain = DOM.createDiv(document.body, "hover hidden", "Hover test")
        this.boundShow = this.show.bind(this)
    }
    
    setDelay(delay) {
        this.delay = delay
    }

    align() {
        let width = this.dvMain.offsetWidth
        let height = this.dvMain.offsetHeight
    
    
        this.dvMain.style.transform = `translate(${
            ((this.x > window.innerWidth - width - this.mouseAlignX) ? Math.max(-this.x,-(width + this.mouseAlignX)) : Math.min(window.innerWidth - width - this.x, this.mouseAlignX))}px,${
            -Math.min(this.y, Math.max(this.y - (window.innerHeight - height), -this.mouseAlignY))}px)`
    }
    
    setPosition(x, y) {
        this.cancel()
        
        this.x = x
        this.y = y
        
        this.dvMain.style.left = `${x}px`
        this.dvMain.style.top = `${y}px`

        this.timeout = setTimeout(this.boundShow, this.delay)
    }
    
    setText(text) {
        if (this.text === text)
            return
        
        this.text = text
        this.dvMain.innerText = text
        
        this.align()
    }
    
    set(x, y, text) {
        this.setPosition(x, y)
        this.setText(text)
    }
    
    show() {
        this.cancel()
        this.dvMain.classList.remove("hidden")
        this.visible = true
        this.align()
    }
    
    hide() {
        this.dvMain.classList.add("hidden")
        this.visible = false
    }
    
    cancel() {
        this.hide()
        
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = 0
        }
    }
}