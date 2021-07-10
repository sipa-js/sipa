/**
 * Tool class to store global states at different persistence levels.
 *
 * Level 1: Data will be lost after reload (variable = SipaState.LEVEL.VARIABLE)
 * Level 2: Data will be lost when browser is closed (session = SipaState.LEVEL.SESSION)
 * Level 3: Data will be lost when clearing browser cache only (storage = SipaState.LEVEL.STORAGE)
 *
 */
class SipaState {
    /**
     * Set a value with the given persistence level, by default SipaState.LEVEL.SESSION
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {SipaState.LEVEL.VARIABLE, SipaState.LEVEL.SESSION, SipaState.LEVEL.STORAGE} options.level=SipaState.LEVEL.SESSION
     */
    static set(key, value, options) {

    }

    static setVariable(key, value, options) {

    }

    static setSession(key, value, options) {

    }

    static setStorage(key, value, options) {

    }

    /**
     * Get the persistence level of the value stored at the given key
     *
     * @param key
     * @return {SipaState.LEVEL.VARIABLE, SipaState.LEVEL.SESSION, SipaState.LEVEL.STORAGE}
     */
    static getLevel(key) {

    }

    static get(key) {

    }

    static remove(key) {

    }
}

SipaState.LEVEL = {
    VARIABLE: 'variable',
    SESSION: 'session',
    STORAGE: 'storage',
}