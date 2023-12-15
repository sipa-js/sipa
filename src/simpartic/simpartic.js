/**
 * Sipa
 *
 * Framework core class to provide core functionality.
 */
class Sipa {
    /**
     * Get the version of the used library
     * @returns {string}
     */
    static getVersion() {
        const self = Sipa;
        return self._version;
    }
    /**
     * Function to fire to init the whole Sipa app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        document.addEventListener('DOMContentLoaded', function () {
            // start in new thread, otherwise it
            // will collide with live web server
            setTimeout(init_function,0);
        }, false);
    }
}

/**
 * @type {string}
 * @private
 */
Sipa._version = "0.8.8";

// Alias
var Simpartic = Sipa;