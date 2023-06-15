"use strict"

;(() => {
    let wakeLock = null

    function storeLock(lock) {
        wakeLock = lock
    }

    function startLock() {
        if (document.visibilityState !== 'visible')
            return
        navigator.wakeLock?.request('screen')
            .then(storeLock)
    }

    startLock()

    document.addEventListener('visibilitychange', (event) => {
        startLock()
    })
})()