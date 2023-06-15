const COPY_MODE = {
	NONE : 0,
	EXTRACT : 1, 	// only overwrite already present fields
	MERGE : 2,		// overwrite old data
	COPY : 3,		// remove old data, shallow copy
	REFERENCE : 4,	// copy by reference
}

const DEFAULT_COORDINATES = {
	x : 0,
	y : 0,
	changed : false,
}

export default class WorldPoint{
	constructor(data) {
		this.data  = Object.assign({}, data)
		this.real  = Object.assign({}, DEFAULT_COORDINATES, this.data.real )
		this.world = Object.assign({}, DEFAULT_COORDINATES, this.data.world)
	}
	
	// stores real coordinates, and updates world coordinates if viewport is provided
	setReal(x, y, viewport) {
		if (this.real.x !== x || this.real.y !== y) {
			this.real.x = x
			this.real.y = y
			this.real.changed = true
		} else
			this.real.changed = false
		
		if (viewport !== undefined) {
			this.setWorld(
				viewport.getWorldX(x),
				viewport.getWorldY(y),
			)
		}
		return this.real.changed
	}
	
	// stores world coordinates, and updates real coordinates if viewport is provided
	setWorld(x, y, viewport) {
		if (this.world.x !== x || this.world.y !== y) {
			this.world.x = x
			this.world.y = y
			this.world.changed = true
		} else
			this.world.changed = false
		
		if (viewport !== undefined) {
			this.setReal(
				viewport.getRealX(x),
				viewport.getRealY(y),
			)
		}
		return this.world.changed
	}
	
	setData(data, copyData = COPY_MODE.MERGE) {
		switch (copyData) {
			case COPY_MODE.MERGE : 
				Object.assign(this.data, data) 
				break
			case COPY_MODE.COPY :
				this.data = Object.assign({}, data) 
				break
			case COPY_MODE.REFERENCE :
				this.data = data
				break
		}
	}
	
	// copy data from another state
	set(point, copyData) {
		this.real.x  = point.real.x
		this.real.y  = point.real.y
		
		this.world.x = point.world.x
		this.world.y = point.world.y

		this.setData(point.data, copyData)
	}
}
	