import MapScene from "./map/map-scene.js"
import mapControlScheme from "./map/map-control-scheme.js"
import BaseCell from "../../engine/cells/base-cell.js"

const SCENARIOS = {
    map : {
        sceneClass : MapScene,
        controlScheme : mapControlScheme,
        viewSettings : {
            minView : BaseCell.RENDER_SIZE * 3
        }
    }
}

export default SCENARIOS