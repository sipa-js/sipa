/**
 * Tool class to store global states at different persistence levels.
 *
 * Level 1 (variable): Data will be lost after reload (SipaState.LEVEL.VARIABLE)
 *                     You can even store references and functions!
 *
 * Level 2 (session): Data will be lost when browser is closed (SipaState.LEVEL.SESSION)
 *                    You can not store references but thanks to SipaSerializer isolated functions are possible!
 *
 * Level 3 (storage): Data will be lost when clearing browser cache only (SipaState.LEVEL.STORAGE)
 *                    You can not store references but thanks to SipaSerializer isolated functions are possible!
 *
 */
class SipaState {
    /**
     * Set a value with the given persistence level, by default SipaState.LEVEL.SESSION
     *
     * @example
     *
     * // Set a variable that will be lost after reload
     * SipaState.set("my_var", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE});
     *
     * // Set a session value that will be lost after closing the browser
     * SipaState.set("my_sess", {a:1, b:2}, {level: SipaState.LEVEL.SESSION});
     * SipaState.set("my_sess", {a:1, b:2});
     *
     * // Set a storage value that
     * SipaState.set("my_store", {a:1, b:2}, {level: SipaState.LEVEL.STORAGE});
     *
     * @param {string} key
     * @param {any} value
     * @param {object} options
     * @param {SipaState.Level} options.level='session'
     * @param {boolean} options.force=false overwrite value, if it is set at another level already
     */
    static set(key, value, options = {}) {
        const self = SipaState;
        SipaHelper.validateParams([
            {param_name: 'key', param_value: key, expected_type: 'string'},
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
     * Set value in persistence level 1 (variable).
     *
     * @example
     *
     * // Set a variable that will be lost after reload
     * SipaState.setVariable("my_var", {a:1, b:2});
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
     * Set value in persistence level 2 (session).
     *
     * @example
     *
     * // Set a session value that will be lost after closing the browser
     * SipaState.setSession("my_sess", {a:1, b:2});
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
     * @example
     *
     * // Set a storage value that will be lost when clearing browser cache only
     * SipaState.setStorage("my_store", {a:1, b:2});
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
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.getLevel("my_sess"); // returns 'session'
     *
     * SipaState.setVariable("my_var", {a:1, b:2});
     * SipaState.getLevel("my_var"); // returns 'variable'
     *
     * SipaState.setStorage("my_store", {a:1, b:2});
     * SipaState.getLevel("my_store"); // returns 'storage'
     *
     * SipaState.getLevel("not_existing_key"); // returns null
     *
     * // If key is set at multiple levels, the highest level is returned (storage > session > variable)
     * SipaState.setStorage("my_key", {a:1, b:2});
     * SipaState.setSession("my_key", {a:1, b:2});
     * SipaState.setVariable("my_key", {a:1, b:2});
     * SipaState.getLevel("my_key"); // returns 'storage'
     *
     * SipaState.remove("my_key");
     * SipaState.setSession("my_key", {a:1, b:2});
     * SipaState.setVariable("my_key", {a:1, b:2});
     * SipaState.getLevel("my_key"); // returns 'session'
     *
     * SipaState.set("my_key", {a:1, b:2}, {level: SipaState.LEVEL.VARIABLE, force: true});
     * SipaState.getLevel("my_key"); // returns 'variable'
     *
     * @param {string} key
     * @returns {SipaState.LEVEL|null}
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
     * Check if key is set already at any persistence level.
     *
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.hasKey("my_sess"); // returns true
     *
     * SipaState.hasKey("not_existing_key"); // returns false
     *
     * SipaState.setStorage("my_store", {a:1, b:2});
     * SipaState.hasKey("my_store"); // returns true
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
     * The priority is storage > session > variable.
     *
     * @example
     *
     * SipaState.setSession("my_sess", {a:1, b:2});
     * SipaState.get("my_sess"); // returns {a:1, b:2}
     *
     * SipaState.get("not_existing_key"); // returns undefined
     *
     * @param {string} key
     * @returns {any|undefined} value or undefined if key does not exist
     */
    static get(key) {
        const self = SipaState;
        return self.getAll()[key];
    }

    /**
     * Get all entries of persistence level 1 (variables).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setVariable("var2", 2);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getVariables(); // returns {var1: 1, var2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getVariables() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.VARIABLE);
    }

    /**
     * Get all entries of persistence level 2 (session).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setSession("sess2", 2);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getSession(); // returns {sess1: 1, sess2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getSession() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.SESSION);
    }

    /**
     * Get all entries of persistence level 3 (storage).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     * SipaState.setStorage("store2", 2);
     *
     * SipaState.getStorage(); // returns {store1: 1, store2: 2}
     *
     * @returns {Object<String, any>}
     */
    static getStorage() {
        const self = SipaState;
        return self._getAllBy(self.LEVEL.STORAGE);
    }

    /**
     * Get all stored entries.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getAll(); // returns {var1: 1, sess1: 1, store1: 1}
     *
     * @returns {Object<String, any>}
     */
    static getAll() {
        const self = SipaState;
        return Object.assign(Object.assign(self.getVariables(), self.getSession()), self.getStorage());
    }

    /**
     * Get all keys.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.getKeys(); // returns ['var1', 'sess1', 'store1']
     *
     * @returns {Array<String>}
     */
    static getKeys() {
        const self = SipaState;
        return Object.keys(self.getAll());
    }

    /**
     * Remove the stored value of the given key(s).
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.remove("sess1"); // returns true
     * SipaState.getKeys(); // returns ['var1', 'store1']
     *
     * SipaState.remove("not_existing"); // returns false
     *
     * SipaState.remove(["var1", "store1"]); // returns true
     *
     * @param {string|Array} key key or keys to remove
     * @returns {boolean} true if value of any key was set and has been removed. False if no key did exist.
     */
    static remove(key) {
        const self = SipaState;
        let any_key_exists = false;
        let keys = null;
        if (Typifier.isString(key)) {
            keys = [key];
        } else if (Typifier.isArray(key)) {
            keys = key;
        } else {
            throw `Invalid parameter type for key: ${Typifier.getType(key)}`;
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
     * Delete all stored data - alias method for reset().
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.removeAll(); // returns true
     * SipaState.getKeys(); // returns []
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static removeAll() {
        const self = SipaState;
        return self.reset();
    }

    /**
     * Delete all stored data.
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState.reset(); // returns true
     * SipaState.getKeys(); // returns []
     *
     * @returns {boolean} true if one or more entries have been deleted
     */
    static reset() {
        const self = SipaState;
        const remove_result = self.remove(self.getKeys());
        return remove_result;
    }

    /**
     * Get all entries by level
     *
     * @example
     *
     * SipaState.setVariable("var1", 1);
     * SipaState.setVariable("var2", 2);
     * SipaState.setSession("sess1", 1);
     * SipaState.setStorage("store1", 1);
     *
     * SipaState._getAllBy(SipaState.LEVEL.VARIABLE); // returns {var1: 1, var2: 2}
     *
     * @param {SipaState.Level} level
     * @return {Object<string, any>}
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
     * Get store by level.
     *
     * @example
     *
     * SipaState._getStoreByLevel(SipaState.LEVEL.VARIABLE); // returns SipaState._variables
     * SipaState._getStoreByLevel(SipaState.LEVEL.SESSION); // returns sessionStorage
     * SipaState._getStoreByLevel(SipaState.LEVEL.STORAGE); // returns localStorage
     *
     * @param {SipaState.Level} level
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
     * Ensure key is prefixed.
     *
     * @example
     *
     * SipaState._makeFinalKey("my_key"); // returns "SipaState_my_key"
     * SipaState._makeFinalKey("SipaState_my_key"); // returns "SipaState_my_key"
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
     * Get key without prefix.
     *
     * @example
     *
     * SipaState._reduceKey("my_key"); // returns "my_key"
     * SipaState._reduceKey("SipaState_my_key"); // returns "my_key"
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

/**
 * Persistence levels
 *
 * @type {{VARIABLE: string, SESSION: string, STORAGE: string}}
 */
SipaState.LEVEL = {
    VARIABLE: 'variable',
    SESSION: 'session',
    STORAGE: 'storage',
}

/**
 * Prefix for all keys to avoid conflicts with other data in sessionStorage or localStorage.
 *
 * @type {string}
 */
SipaState.PERSISTENCE_PREFIX = 'SipaState_';

/**
 * In-memory storage for level 1 persistence (variables).
 *
 * @type {{}}
 * @private
 */
SipaState._variables = {}; // Level 1 persistence

/**
 * @typedef {'variable'|'session'|'storage'} SipaState.Level
 */