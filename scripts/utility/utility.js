// noinspection JSUnusedGlobalSymbols

"use strict"

// unsorted utility functions

import Format from "./format.js"

export function getPosition(x, y) {
	return `${x},${y}`
}

export function priceText(price, short = true) {
	if ((price?.length ?? 0) === 0)
		return "free"
	let priceList = price.map((x,i) => x ? `${Format.displayNumber(x, 0)} ${game.resources.getName(i)}` : "").filter(x => x !== "")
	if (short && priceList.length > 3) {
		priceList.splice(1,priceList.length - 2, "to")
	}
	return priceList.join("\n")
}

export function getConstantName(storage, value, unknown = "unidentified") {
	const index = Object.values(storage).indexOf(value)
	if (index === -1)
		return unknown
	return Object.keys(storage)[value]
}

export function shuffle(array) {
	let m = array.length, t, i;

	// While there remain elements to shuffle…
	while (m) {

		// Pick a remaining element…
		i = Math.floor(Math.random() * m--);

		// And swap it with the current element.
		t = array[m];
		array[m] = array[i];
		array[i] = t;
	}

	return array;
}
