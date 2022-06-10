/**
 * Simpartic
 *
 * Framework core class to provide core functionality.
 */
class Simpartic {
    /**
     * Get the version of the used library
     * @returns {string}
     */
    static getVersion() {
        const self = Simpartic;
        return self._version;
    }
    /**
     * Function to fire to init the whole Simpartic app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        // start in new thread, otherwise it
        // will collide with live web server
        setTimeout(init_function,0);
    }
}

/**
 * @type {string}
 * @private
 */
Simpartic._version = "0.7.1";