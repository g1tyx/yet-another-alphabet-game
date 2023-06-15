// noinspection JSUnusedGlobalSymbols

import Web from "./web.js"

export default class ShaderLoader {
	static VERTEX_SHADER_EXTENSION = ".vert"
	static FRAGMENT_SHADER_EXTENSION = ".frag"

	static loadShaders(list) {
		const loaders = []
		const shaders = {}
		
		function loadShader(name, type, path) {
			return Web.getTextData(path)
				.then(data => shaders[name][type] = data)
				.catch(error => console.log("Failed to load " + type + " shader for " + name))
		}
		
		for (let [name, address] of Object.entries(list)) {
			shaders[name] = {}
			loaders.push(loadShader(name, "vertex", address + this.VERTEX_SHADER_EXTENSION))
			loaders.push(loadShader(name, "fragment", address + this.FRAGMENT_SHADER_EXTENSION))
		}
		
		return Promise.all(loaders)
			.then(() => Promise.resolve(shaders))
	}
}
