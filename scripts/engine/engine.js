import Workhole from "../utility/workhole.js"
import Game from "./game.js"
import MENU_ITEMS from "./menu-data.js"
import RoundMenu from "../utility/round-menu.js"

let lastTime, lastSave

const engine = {
    game : new Game(),

    roundMenuBackend : new RoundMenu.Back(MENU_ITEMS, (data) => {
        if (data.cellID !== undefined)
            data.cell = game.map.getCell(data.cellID)
        return data
    }),

    start() {
        game.reset(true)

        game.load()

        lastTime = performance.now()
        lastSave = performance.now()

        this.boundAdvance = this.advance.bind(this)
        this.advance()
    },

    advance() {
        let now = performance.now()
        game.targetTime += now - lastTime
        lastTime = now

        if (!game.isBusy()) {
            game.advance()

            if (now - lastSave > 30000) {
                lastSave = now
                game.save()
            }
        }

        setTimeout(this.boundAdvance, game.targetTime > game.now ? 10 : 100)
    },

    cellHoverInfo(cellID) {
        return game.map.getCell(cellID)?.hoverInfo?.()
    },

    cellAction(cellID) {
        game.map.getCell(cellID)?.action?.()
    },

    moveCell(x, y, cellID) {
        game.map.moveCell(x, y, cellID)
    },

    setActiveCell(cellID) {
        game.setActiveCell(cellID)
    },
}

export default engine

//attach to game depending on load type

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope){
    //is worker
    const workhole = new Workhole(self)

    workhole.export(engine, "engine")
    workhole.export(engine.roundMenuBackend, "roundMenuBackend")

    self.ui = await workhole.expectExport("ui")
    self.scene = await workhole.expectExport("scene")
    self.core = await workhole.expectExport("core")
    self.game = engine.game
} else {
    //is plain module
    window.engine = engine
    window.roundMenuBackend = engine.roundMenuBackend
    window.game = engine.game
}
