/**
 * Tool class to store global states at different persistence levels.
 *
 * Level 1 (variable): Data will be lost after reload (SipaState.LEVEL.VARIABLE)
 *                     You can even store references and functions!
 *
 * Level 2 (session): Data will be lost when browser is closed (SipaState.LEVEL.SESSION)
 *                    You can not store references or functions!
 *
 * Level 3 (storage): Data will be lost when clearing browser cache only (SipaState.LEVEL.STORAGE)
 *                    You can not store references or functions!
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
     * @param {boolean} options.force=false overwrite value, if it is set at another level already
     */
    static set(key, value, options = {}) {
        const self = SipaState;
        SipaHelper.validateParams([
            {param_name: 'key', param_value: key, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        if (!options) options = {};
        if (typeof options.level === 'undefined') options.level = self.LEVEL.SESSION;
        let store = self._getStoreByLevel(options.level);
        if (self.getLevel(key) === options.level || !self.hasKey(key) || options.force) {
            if (options.level === self.LEVEL.VARIABLE) {
                store[self._makeFinalKey(key)] = value;
            } else {
                store.setItem(self._makeFinalKey(key), SipaSerializer.serialize(value));
            }
        } else {
            self._throwKeyAlreadySetError(key);
        }
    }

    /**
     * Set value in persistence level 1 (variable)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setVariable(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.VARIABLE;
        self.set(key, value, options);
    }

    /**
     * Set value in persistence level 2 (session)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setSession(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.SESSION;
        self.set(key, value, options);
    }

    /**
     * Set value in persistence level 3 (storage)
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {boolean} options.force=false overwrite value without throwing error, if it is set at another level already
     */
    static setStorage(key, value, options = {}) {
        const self = SipaState;
        if (!options) options = {};
        options.level = self.LEVEL.STORAGE;
        self.set(key, value, options);
    }

    /**
     * Get the persistence level of the value stored at the given key.
     * If key is not set at any level, returns null.
     *
     * @param {string} key
     * @returns {SipaState.LEVEL.VARIABLE, SipaState.LEVEL.SESSION, SipaState.LEVEL.STORAGE, null}
     */
    static getLevel(key) {
        const self = SipaState;
        if (Object.keys(self.getVariables()).includes(key)) {
            return self.LEVEL.VARIABLE;
        } else if (Object.keys(self.getSession()).includes(key)) {
            return self.LEVEL.SESSION;
        } else if (Object.keys(self.getStorage()).includes(key)) {
            return self.LEVEL.STORAGE;
        } else {
            return null;
        }
    }

    /**
     * Check if key is set already at any persistence level
     *
     * @param {string} key
     * @returns {boolean}
     */
    static hasKey(key) {
        const self = SipaState;
        return Object.keys(self.getAll()).includes(key);
    }

    /**
     * Get the value of the given key. Persistence level does not matter and is implicit.
     *
     * @param {string} key
     */
    static get(key) {
        const self = SipaState;
        return self.getAll()[key];
    }

    /**
     * Get all entries of persistence level 1 (variables)
     *
     * @returns {Object<String, any>}
     */
    static getVariables() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.VARIABLE);
    }

    /**
     * Get all entries of persistence level 2 (session)
     *
     * @returns {Object<String, any>}
     */
    static getSession() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.SESSION);
    }

    /**
     * Get all entries of persistence level 3 (storage)
     *
     * @returns {Object<String, any>}
     */
    static getStorage() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.STORAGE);
    }

    /**
     * Get all stored entries
     *
     * @returns {Object<String, any>}
     */
    static getAll() {
        const self = SipaState;
        return Object.assign(Object.assign(self.getVariables(), self.getSession()), self.getStorage());
    }

    /**
     * Get all keys
     * @returns {Array<String>}
     */
    static getKeys() {
        const self = SipaState;
        return Object.keys(self.getAll());
    }

    /**
     * Remove the stored value of the given key(s)
     *
     * @param {string|Array} key key or keys to remove
     * @returns {boolean} true if value of any key was set and has been removed. False if no key did exist.
     */
    static remove(key) {
        const self = SipaState;
        let any_key_exists = false;
        let keys = null;
        if (SipaHelper.isString(key)) {
            keys = [key];
        } else if (SipaHelper.isArray(key)) {
            keys = key;
        } else {
            throw `Invalid parameter type for key: ${SipaHelper.getType(key)}`;
        }
        keys.forEach((key) => {
            const key_exists = self.hasKey(key);
            if (key_exists) {
                any_key_exists = true;
                switch (self.getLevel(key)) {
                    case self.LEVEL.VARIABLE:
                        delete self._variables[self._makeFinalKey(key)];
                        break;
                    case self.LEVEL.SESSION:
                        sessionStorage.removeItem(self._makeFinalKey(key));
                        break;
                    case self.LEVEL.STORAGE:
                        localStorage.removeItem((self._makeFinalKey(key)));
                        break;
                }
            }
        });
        return any_key_exists;
    }

    /**
     * Delete all stored data - alias method for reset()
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static removeAll() {
        const self = SipaState;
        return self.reset();
    }

    /**
     * Delete all stored data
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static reset() {
        const self = SipaState;
        const remove_result = self.remove(self.getKeys());
        return remove_result;
    }

    /**
     *
     * @param {SipaState.LEVEL.VARIABLE, SipaState.LEVEL.SESSION, SipaState.LEVEL.STORAGE} level
     * @return {object<string, any>}
     * @private
     */
    static _getAllBy(level) {
        const self = SipaState;
        let store = self._getStoreByLevel(level);
        const keys = Object.keys(store).filter((i) => {
            return i.startsWith(self.PERSISTENCE_PREFIX);
        });
        let all = {};
        for (let key of keys) {
            all[self._reduceKey(key)] = SipaSerializer.deserialize(store[key]);
        }
        return all;
    }

    /**
     * Get store by level
     *
     * @param {SipaState.LEVEL.VARIABLE, SipaState.LEVEL.SESSION, SipaState.LEVEL.STORAGE} level
     * @returns {Storage|object}
     * @private
     */
    static _getStoreByLevel(level) {
        const self = SipaState;
        switch (level) {
            case self.LEVEL.VARIABLE:
                return self._variables;
            case self.LEVEL.SESSION:
                return sessionStorage;
            case self.LEVEL.STORAGE:
                return localStorage;
            default:
                throw `Invalid level '${level}'.`
        }
    }

    /**
     * Ensure key is prefixed
     *
     * @param {string} key
     * @returns {string}
     * @private
     */
    static _makeFinalKey(key) {
        const self = SipaState;
        if (key.startsWith(self.PERSISTENCE_PREFIX)) {
            return key;
        } else {
            return self.PERSISTENCE_PREFIX + key;
        }
    }

    /**
     * Get key without prefix
     *
     * @param key
     * @private
     */
    static _reduceKey(key) {
        const self = SipaState;
        if (key.startsWith(self.PERSISTENCE_PREFIX)) {
            return key.substr(self.PERSISTENCE_PREFIX.length);
        } else {
            return key;
        }
    }

    static _throwKeyAlreadySetError(key) {
        const self = SipaState;
        throw `Key '${key}' has already been set at persistence level '${self.getLevel(key)}'!`;
    }

    static get length() {
        const self = SipaState;
        return self.getKeys().length;
    }
}

SipaState.LEVEL = {
    VARIABLE: 'variable',
    SESSION: 'session',
    STORAGE: 'storage',
}

SipaState.PERSISTENCE_PREFIX = 'SipaState_';

SipaState._variables = {}; // Level 1 persistence
