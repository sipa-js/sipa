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
    /*
        Run this before running tests.

        It will prepare the Sipa environment for testing.

        For example it will:
        * SipaComponent: disable performance optimized render limits per period, to ensure instant renderings for instant test runs
     */
    static enableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = true;
    }

    static disableTestingMode() {
        const self = SipaTest;
        self._is_testing_mode = false;
    }

    static isTestingMode() {
        const self = SipaTest;
        return self._is_testing_mode;
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