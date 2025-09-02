//<!-- MODULE -->//
if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {

}
//<!-- /MODULE -->//

/**
 * SipaTest
 *
 * Helper class for testing with Sipa
 */
class SipaTest {
    /**
        Run this before running tests. Usually this should be called in your `beforeAll()` method of your test.

        It will prepare the Sipa environment for testing.

        For example, it will:
        - SipaComponent: disable performance optimized render limits per period, to ensure instant renderings for instant test runs
     */
    static enableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = true;
    }

    /**
        Disable testing mode.
    */
    static disableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = false;
    }

    /**
     *  Check if testing mode is enabled.
     *
     * @return {boolean}
     */
    static isTestingMode() {
        const self = SipaTest;
        return self._is_testing_mode;
    }

    /**
     * Reset all Sipa states to initial state.
     */
    static reset() {
        const self = SipaTest;
        self._is_testing_mode = false;
    }
}

/**
 * @type {boolean}
 * @private
 */
SipaTest._is_testing_mode = false;

//<!-- MODULE -->//
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SipaTest;
}
//<!-- /MODULE -->//