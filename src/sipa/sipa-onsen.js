/**
 * SipaOnsen
 *
 * Framework core class to provide core functionality for OnsenUI.
 */
class SipaOnsen extends Sipa {
    /**
     * Function to fire to init the whole Sipa OnsenUI based app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        ons.ready(function () {
            setTimeout(init_function,0);
        });
    }
}