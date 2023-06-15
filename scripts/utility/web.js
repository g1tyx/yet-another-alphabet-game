export default class Web {
	
	static httpStatus(response) {
		if (response.status >= 200 && response.status < 300) {
			return Promise.resolve(response)
		} else {
			return Promise.reject(new Error(response.statusText))
		}
	}
	
	static getTextData(url) {
		return fetch(url)
			.then(this.httpStatus)
			.then((response) => response.text())
			.catch((message) => {
				console.log("Failed to fetch " + url + " - " + message)
			})
	}
}