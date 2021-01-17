/**
 * Simpartic
 *
 * Framework core class to provide core functionality.
 */
class Simpartic {
    /**
     * Function to fire to init the whole app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        // start in new thread, otherwise it
        // will collide with live web server
        setTimeout(init_function,0);
    }
}