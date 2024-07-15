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
     * Callback function to fire to init the whole Sipa app.
     *
     * This is the entry point for your app. The given callback is called after Sipa is initialized.
     *
     * @example
     * Sipa.init(() => {
     *   SipaPage.load('login');
     * });
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
Sipa._version = "0.9.32";

// Alias
var Simpartic = Sipa;