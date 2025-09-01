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
     * updated from your package.json at every release build cycle.
     *
     * @example
     *
     * SipaEnv.version()
     * // => '1.0.0'
     *
     * @returns {string}
     */
    static version() {
        const obj = {
            "version": "0.0.1", "unique_id": "SipaEnv.version.selector"
        }
        return obj.version;
    }

    /**
     * Get the current name of your app.
     *
     * The returned value within this method will automatically be
     * updated from your package.json at every release build cycle.
     *
     * @example
     *
     * SipaEnv.name()
     * // => 'My App'
     *
     * @returns {string}
     */
    static name() {
        const obj = {
            "name": "Name", "unique_id": "SipaEnv.name.selector"
        }
        return obj.version;
    }



    /**
     * Get the current description of your app.
     *
     * The returned value within this method will automatically be
     * updated from your package.json at every release build cycle.
     *
     * @example
     *
     * SipaEnv.description()
     * // => 'This is my app'
     *
     * @returns {string}
     */
    static description() {
        const obj = {
            "description": "Description", "unique_id": "SipaEnv.description.selector"
        }
        return obj.version;
    }

    /**
     * Check if Sipa is running at localhost.
     *
     * The address can be either 'localhost' or '127.0.0.1'.
     *
     * @example
     *
     * // running local at localhost
     * SipaEnv.isRunningLocalHost()
     * // => true
     *
     * // running online at example.com
     * SipaEnv.isRunningLocalHost()
     * // => false
     *
     * @returns {boolean} true if localhost, otherwise false
     */
    static isRunningLocalHost() {
        const host = window.location.hostname;
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled.
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.
     *
     * @example
     *
     * // running with debug mode enabled
     * // http://localhost:8000/?debug=true
     * SipaEnv.isDebugMode()
     * // => true
     *
     * // running with debug mode disabled
     * // http://localhost:8000/
     * SipaEnv.isDebugMode()
     * // => false
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled.
     *
     * The debug mode can be enabled, by adding a query parameter 'debug=true' into your URL.
     *
     * @example
     *
     * // running with debug mode enabled
     * // http://localhost:8000/?debug=true
     * SipaEnv.debugLog("This is a debug message");
     * // => "This is a debug message" on console
     *
     * // running with debug mode disabled
     * // http://localhost:8000/
     * SipaEnv.debugLog("This is a debug message");
     * // => no output on console
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