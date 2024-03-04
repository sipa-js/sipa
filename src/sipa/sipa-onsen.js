
class SipaOnsen extends Sipa {
    /**
     * Function to fire to init the whole Sipa app
     *
     * @param {function} init_function
     */
    static init(init_function) {
        ons.ready(function () {
            setTimeout(init_function,0);
        });
    }
}