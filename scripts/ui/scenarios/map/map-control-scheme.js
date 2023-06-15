// noinspection JSUnusedGlobalSymbols

import PointerControlScheme from "../../framework/pointer/scheme.js"
import BaseCell from "../../../engine/cells/base-cell.js"
import {getPosition} from "../../../utility/utility.js"
import HexCells from "../../../utility/hex-cells.js"

const handlers = {
	target_cell(input, pointer) {
		let [x,y] = HexCells.squareToHex(
			input.current.world.x / BaseCell.RENDER_SIZE,
			input.current.world.y / BaseCell.RENDER_SIZE,
			)
		
		if (input.current.real.x === 0 && input.current.real.y === 0) {
			x = 10000
			y = 10000
		}

		pointer.data.lastX = x
		pointer.data.lastY = y
		pointer.data.position = getPosition(x, y)
		const lastClosest = pointer.data.closest
		pointer.data.closest = pointer.scene.grid[pointer.data.position]

		if (pointer.data.moveCell !== undefined) {
			if (pointer.data.movePosition !== pointer.data.position) {
				pointer.data.movePosition = pointer.data.position
				pointer.scene.setPreviewCell(pointer.data.moveCell.uid, x, y)
			}
		} else {
			ui.setHighlightCell(x, y)
			if (pointer.data.closest && lastClosest !== pointer.data.closest)
				engine.setActiveCell(pointer.data.closest.uid)
		}

		if (pointer.data.closest !== undefined) {
			ui.setHoverObject(input.current.real.x, input.current.real.y, pointer.data.closest)
		
			return ">Cell"
		}
		
		ui.resetHover()
	
		if (lastClosest !== pointer.data.closest)
			ui.hideArrows()
		
		return ">Default"
	},
	
	update_hover(input, pointer) {
		if (pointer.data.closest !== undefined && pointer.data.moveCell === undefined) {
			ui.setHoverObject(input.current.real.x, input.current.real.y, pointer.data.closest)
		} else {
			ui.resetHover()
		}
	},

	drag_view(input, pointer) {
		pointer.view.moveWorldPoint(
			input.anchor.world.x, input.anchor.world.y,
			input.current.real.x, input.current.real.y)
	},

	zoom_view(input, pointer) {
		pointer.view.zoomAt(input.current.world.x, input.current.world.y, - input.current.data.direction / 10 * pointer.view.current.zoom)
	},

	pinch_zoom_view(input, pointer) {
		const first = pointer.interactions.first
		const second = pointer.interactions.second

		pointer.view.moveWorldPoints(
			first.anchor.world.x, first.anchor.world.y,
			second.anchor.world.x, second.anchor.world.y,
			first.current.real.x, first.current.real.y,
			second.current.real.x, second.current.real.y)
	},

	inertia(input, pointer) {
		pointer.view.inertia()
	},

	cell(input, pointer) {
		if (pointer.data.moveCell !== undefined) {
			engine.moveCell(pointer.data.lastX, pointer.data.lastY,pointer.data.moveCell.uid)
			pointer.scene.resetPreviewCell()
			delete pointer.data.moveCell
			return "target_cell"
		}
		engine.cellAction(pointer.data.closest?.uid)
	},

	special(input, pointer) {
		if (pointer.data.moveCell) {
			delete pointer.data.moveCell
			pointer.scene.resetPreviewCell()
			return "target_cell"
		}

		pointer.view.uncap()
		if (pointer.data.closest)
			pointer.view.setXY(pointer.data.closest.squareX * BaseCell.RENDER_SIZE, pointer.data.closest.squareY * BaseCell.RENDER_SIZE)
		else
			pointer.view.setXY(input.current.world.x, input.current.world.y)

		pointer.data.menu = ui.showMenu(pointer.data.position, pointer.data.closest?.uid)
		
		ui.resetHover()
		
		return ">Menu"
	},

	select_menu(input, pointer) {
		pointer.view.cap()

		const result = pointer.data.menu.select(pointer.data.choice)
		pointer.scene.hideMenu()
		delete pointer.data.menu

		if (result === "move") {
			pointer.data.moveCell = pointer.data.closest
			pointer.data.movePosition = pointer.data.position
			pointer.scene.setPreviewCell(pointer.data.moveCell.uid, pointer.data.lastX, pointer.data.lastY)
		}
	},

	cancel_menu(input, pointer) {
		pointer.view.cap()
		pointer.scene.hideMenu()
		pointer.data.menu.cancel()
		delete pointer.data.menu
	},

	target_menu(input, pointer) {
		const width = pointer.view.viewport.realWidth
		const height = pointer.view.viewport.realHeight
		const min = Math.min(width, height) / 2

		pointer.data.choice = pointer.data.menu.getChoiceAt(
			(input.current.real.x - width / 2) / min,
			(input.current.real.y - height / 2) / min
		)

		pointer.scene.setMenuChoice(pointer.data.choice)
	},
	
	update_menu_hover(input, pointer) {
		if (pointer.data.choice > -1)
			ui.setHoverObject(input.current.real.x, input.current.real.y, pointer.data.menu.hoverObject(pointer.data.choice))
		else
			ui.resetHover()
	}
}

const script = `
		##Default { //Default assumes mouse on empty field
			
			mouse first . move = target_cell							// move mouse or start touch to choose nearest target
			mouse first . move_real = update_hover
			
			lmb . down = {
				mouse . move = anchor >DragView
				lmb . up = cell special target_cell
			}
			first . down = {
				first.move = anchor >DragView
				first.up = cell special target_cell
				second.down = anchor_all >PinchZoomView
				
				idle 200 = special
			}
			
			rmb.up = special				 		// RMB to center at target

			mouse.scroll = zoom_view					  	 	// allow wheel zoom		
		}
		
		#Cell {
			mouse first . move = target_cell							// move mouse or start touch to choose nearest target
			mouse first . move_real = update_hover

			lmb . down = anchor {
				mouse . move = anchor >DragView       // mouse or first touch moved : we draggin'
				lmb . up = cell target_cell	            // LMB or touch released without moving : we clickin'

				mouse.scroll = zoom_view					// scale node with mouse wheel
			}
			first . down = anchor {
				first . move = anchor >DragView       // mouse or first touch moved : we draggin'
				first . up = cell target_cell	            // LMB or touch released without moving : we clickin'
				second.down = anchor_all >PinchZoomView                // another touch added : we pinchin'

				idle 200 = special
			}

			rmb.up = special						 		// RMB to center at target		
			mouse.scroll = zoom_view              		    // allow wheel zoom
		}
		
		
		#DragView {					
			//it's not safe to use move or move_world here as viewport will emit change events
			//and world coordinates will change
			
			first second mouse . move_real = drag_view 		    // move whatever is down : drag
			
			first second lmb . up = inertia target_cell       		    // release whatever is down : see what's under cursor
			first second . down = anchor_all >PinchZoomView  // add second input : start pinch zoom
			mouse.scroll = zoom_view              		    // allow wheel zoom
		}                           
		
		#PinchZoomView {
			first second . up = anchor_all >DragView			// release one touch : go back to drag with other
			first second . move_real = pinch_zoom_view           // move either touch : adjust viewport
		}

		#Menu {
			mouse first . move = target_menu
			mouse first . move_real = update_menu_hover
			lmb first . down = {
				mouse first . move = target_menu
				lmb first . up = select_menu target_cell
				idle 500 = ^
			}
			rmb . up = cancel_menu target_cell
		}
	`

const mapControlScheme = new PointerControlScheme(handlers, script)

export default mapControlScheme