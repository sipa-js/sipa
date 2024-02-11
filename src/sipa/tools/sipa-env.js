/**
 * SipaEnv
 *
 * Tool class with environment dependent methods
 */
class SipaEnv {
    /**
     * Get the current version of your app.
     *
     * The returned value within this method will automatically be
     * updated at every release build cycle
     *
     * @returns {string}
     */
    static version() {
        const obj = {
            "version": "0.0.1"
        }
        return obj.version;
    }

    /**
     * Check if Sipa is running at localhost
     *
     * @returns {boolean} true if localhost, otherwise false
     */
    static isRunningLocalHost() {
        const host = window.location.hostname;
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled
     *
     * @param {string|any} text
     */
    static debugLog(text) {
        const self = SipaEnv;
        if(self.isDebugMode()) {
            console.warn(text);
        }
    }
}