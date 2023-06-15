"use strict"

// HTML DOM
export default class DOM {
	static createElement(typ = "div", clas, parent, text) {
		let element = document.createElement(typ)
		if (clas !== undefined) element.className = clas
		if (text !== undefined) element.innerText = text
		if (parent) parent.appendChild(element)
		return element
	}
	
	static createDiv(parent, clas, text) {
		return this.createElement("div", clas, parent, text)
	}
}