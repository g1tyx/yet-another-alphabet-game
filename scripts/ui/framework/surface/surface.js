import Viewport from "../viewport/viewport.js"
import WorldView from "../viewport/world-view.js"
import GLRenderer from "../renderer/gl-renderer.js"
import Pointer from "../pointer/pointer.js"

export default class InteractiveSurface {
	constructor(canvas, scenarios, data) {
		this.canvas = canvas
		this.scenarios = scenarios
		
		this.viewport = new Viewport(this.canvas, data?.viewportSettings)

		this.pointer = new Pointer(this.canvas, this.viewport, data?.pointerSettings)

		this.renderer = new (data?.rendererType ?? GLRenderer)(this.canvas, this.viewport, data?.rendererData)

		this.prepareScenarios(this.scenarios)
	}

	prepareScenarios(scenarios) {
		if (!scenarios)
			throw new Error("No scenarios provided for InteractiveSurface!")

		for (let scenario of Object.values(scenarios)) {
			scenario.view = new WorldView(this.viewport, scenario.viewSettings)
			scenario.scene = new scenario.sceneClass(this.renderer.gl, this.renderer, scenario.view)
//			scenario.scene.prepare()
		}
	}

	activate() {
		this.renderer.activate()
		this.pointer.reset()
	}
	
	setScenario(name) {
		this.renderer.setScene(this.scenarios[name].scene)
		this.pointer.setControlScheme(this.scenarios[name].controlScheme)
		this.pointer.scene = this.scenarios[name].scene

		this.view = this.scenarios[name].view

		this.renderer.setView(this.view)
		this.pointer.setView(this.view)
	}
	
	deactivate() {
		this.renderer.deactivate()
		this.pointer.reset()
	}
	
}