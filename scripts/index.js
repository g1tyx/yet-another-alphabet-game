import Workhole from "./utility/workhole.js"
import UI from "./ui/ui.js"
import "./utility/wakelock.js"
import ShaderLoader from "./utility/shader-loader.js"
import core from "./core.js"

//comment out for worker way:
import engine from "./engine/engine.js"

const SHADER_LIST = {
    bg: `./shaders/bg`,
    cells: `./shaders/cells`,
    glyphs: `./shaders/glyphs`,
    sparks: `./shaders/sparks`,
    arrows: `./shaders/arrows`,
    menu: `./shaders/menu`,
    bolts: `./shaders/bolts`,
}

window.onload = async () => {
    const preloader = document.getElementById("preload")
    
    let workhole

    try {
        preloader.innerText += `Loading engine...\n`

        if (window.engine === undefined) {
            //uses worker

            const worker = new Worker("./scripts/engine/engine.js", {
                type: "module"
            })
            workhole = new Workhole(worker)

            window.engine = await workhole.expectExport("engine")
            window.roundMenuBackend = await workhole.expectExport("roundMenuBackend")
        }

        preloader.innerText += "Loading shaders...\n"
        const shaders = await ShaderLoader.loadShaders(SHADER_LIST)

        preloader.innerText += "Building UI...\n"
        window.ui = new UI({
            shaders
        })

        if (workhole === undefined) {
            //does not use worker
            window.scene = ui.mapScene
        }
    } catch (e) {
        preloader.innerText += `${e}\n\nSorry, the game could not run.`
        throw e
    }

    preloader.remove()

    if (workhole !== undefined) {
        //uses worker
        workhole.export(ui, "ui")
        workhole.export(ui.mapScene, "scene")
        workhole.export(core, "core")
    }

    engine.start()
}
