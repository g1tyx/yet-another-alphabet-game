import CompositeClass from "../../../utility/composite-class.js"

import GLScene from "../../framework/renderer/gl-scene.js"

import MapSceneGeneral from "./map-scene-general.js"

import MapBGElement from "./elements/element-bg.js"
import CellsElement from "./elements/element-cells.js"
import GlyphsElement from "./elements/element-glyphs.js"
import BoltsElement from "./elements/element-bolts.js"
import ArrowsElement from "./elements/element-arrows.js"
import SparksElement from "./elements/element-sparks.js"
import GainsElement from "./elements/element-gains.js"
import RoundMenuElement from "./elements/element-menu.js"

import BaseCell from "../../../engine/cells/base-cell.js"

const MapBase = (base) => class extends base{
	textureData = {}
	bufferData = {}
	elementData = {}

	finalizeElements() {
		for (let element of Object.values(this.elements)) {
			if (element.program.uniforms.u_cell_size !== undefined)
				element.uniforms.u_cell_size = BaseCell.RENDER_SIZE
		}
	}

	beforeElement(element, now) {
		if (element.program.uniforms.u_phase !== undefined)
			element.uniforms.u_phase = (now / 100) % (Math.PI * 840)
		if (element.program.uniforms.u_now !== undefined)
			element.uniforms.u_now = performance.now()
		if (element.program.uniforms.u_mouse !== undefined)
			element.uniforms.u_mouse = [ui.surface.pointer.current.world.x, ui.surface.pointer.current.world.y]
	}
	
	updateView() {
		this.view.getSize(this.viewData)
		this.view.getCenter(this.viewData)
		this.pixelSize = this.view.getWorldPixelSize()
		
		for (let element of this.renderElements) {

			if (element.program.uniforms.u_size !== undefined) {
				element.uniforms.u_size = [this.viewData.width, this.viewData.height]
			}

			if (element.program.uniforms.u_center !== undefined) {
				element.uniforms.u_center = [this.viewData.x, this.viewData.y]
			}

			if (element.program.uniforms.u_pixel !== undefined) {
				element.uniforms.u_pixel = this.pixelSize
			}
		}
	}
	
}

const MapScene = CompositeClass(
	GLScene,
	
	MapBase,
	MapSceneGeneral,
	
	MapBGElement,
	CellsElement,
	GlyphsElement,
	BoltsElement,
	ArrowsElement,
	SparksElement,
	GainsElement,
	RoundMenuElement,
)

export default MapScene