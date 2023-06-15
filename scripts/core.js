const core = {
    getLocalStorage(x) {
        return localStorage[x]
    },

    setLocalStorage(x, value) {
        localStorage[x] = value
    },

}

export default core