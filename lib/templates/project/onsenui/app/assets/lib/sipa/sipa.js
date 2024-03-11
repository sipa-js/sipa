/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version 0.9.25
 * @date 2024-03-11T18:24:48.535Z
 * @link https://github.com/magynhard/sipa
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */
/**
 * Basic class for pages and layouts
 */
class SipaBasicView {
    static onInit() {
        // called when page has been loaded, before fade animation
    }

    static onDestroy() {
        // called when leaving page, before next page will be loaded
    }

    static reinit() {
        this.onDestroy();
        this.onInit();
    }

    /**
     * Check if the current view is loaded
     *
     * @example
     * // ImprintPage is loaded
     * LoginPage.isLoaded();
     * // => false
     *
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        const navigator = SipaPage.isInitialized() ? SipaPage : SipaOnsenPage.isInitialized() ? SipaOnsenPage : false;
        if(navigator === false) {
            throw `SipaPage.setConfig or SipaOnsenPage.setConfig was not executed before application start.`;
        }
        // no page loaded at all
        if(!navigator.currentPageId()) {
            return false;
        } else if(this.type() === 'page') {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentPageId().replace(/\//g,'-'))) + 'Page').endsWith(this.className() );
        } else {
            return (LuckyCase.toPascalCase(navigator.extractIdOfTemplate(navigator.currentLayoutId().replace(/\//g,'-'))) + 'Layout').endsWith(this.className());
        }
    }

    /**
     * Get the class name of the current view
     *
     * @example
     * class MyPage extends SipaBasicView {
     * }
     *
     * const a = MyPage;
     * a.className()
     * // => 'MyPage'
     *
     * @returns {string}
     */
    static className() {
        return this.name;
    }

    /**
     * Get the type of the current view
     *
     * @example
     * class MyLayout extends SipaBasicView {
     * }
     *
     * MyLayout.type()
     * // => 'layout'
     *
     * @returns {'page'|'layout'}
     */
    static type() {
        const self = SipaBasicView;
        if(this.className().endsWith('Page')) {
            return 'page';
        } else {
            return 'layout';
        }
    }
}
/**
 * Serializer to serialize data of primitive types or even complex Objects,
 * to ensure to be stored as valid JSON and can be deserialized back without data loss.
 *
 * Includes support for
 * - Boolean, Number, String, Array, Object, null (native JS[SON] support)
 * And special type handling to support the following types
 * - Functions
 * - RegExp, Date
 * - NaN, Infinity, undefined
 * - empty (special type when deleting an item of an array)
 *
 * The special types are escaped by an internal escaping when serialized.
 * See SipaSerializer.STORAGE_PLACEHOLDERS for the escapes.
 */
class SipaSerializer {

    /**
     * Serialize given value to be stored in JSON without loosing its original value
     *
     * @param {any} value
     * @returns {string|null} returns string or null if value is null
     */
    static serialize(value) {
        const self = SipaSerializer;
        if (typeof value === 'undefined') {
            return '::undefined::';
        } else if (value === null) {
            return null;
        } else if (typeof value === 'function') {
            return value.toString();
        } else if (Typifier.isNaN(value)) {
            return '::NaN::';
        } else if (Typifier.isInfinity(value)) {
            return '::Infinity::';
        } else if (Typifier.isDate(value)) {
            return `::Date::${value.toISOString()}`;
        } else if (Typifier.isRegExp(value)) {
            return `::RegExp::${value.toString()}`;
        } else if (typeof value !== 'undefined' && typeof JSON.stringify(value) === 'undefined') {
            throw `You can store references only at persistence level ${self.LEVEL.VARIABLE}`;
        } else if (Typifier.isArray(value) || Typifier.isObject(value)) {
            return JSON.stringify(self.deepSerializeSpecialTypes(value));
        } else {
            return JSON.stringify(value);
        }
    }

    /**
     * Serialize given value to be stored in JSON without loosing its original value
     *
     * @param {String|null} value
     * @returns {Boolean|String|Number|Array|Object|RegExp|Date|undefined|NaN|Infinity|null|*}
     */
    static deserialize(value) {
        const self = SipaSerializer;
        if (value === '::undefined::') {
            return undefined;
        } else if (value === '::NaN::') {
            return NaN;
        } else if (value === '::Infinity::') {
            return Infinity;
        } else if (SipaSerializer.isFunctionString(value)) {
            return SipaSerializer.deserializeFunctionString(value);
        } else if (Typifier.isString(value) && value.startsWith('::Date::')) {
            return new Date(value.replace('::Date::',''));
        } else if (Typifier.isString(value) && value.startsWith('::RegExp::')) {
            let full_regex_string = value.replace('::RegExp::','');
            let regex_source = full_regex_string.substring(1,full_regex_string.lastIndexOf('/'));
            let regex_flags = full_regex_string.substring(full_regex_string.lastIndexOf('/')+1,full_regex_string.length);
            return new RegExp(regex_source, regex_flags);
        } else {
            try {
                let parsed = JSON.parse(value);
                if (Typifier.isArray(parsed) || Typifier.isObject(parsed)) {
                    return self.deepDeserializeSpecialTypes(parsed);
                } else {
                    return parsed;
                }
            } catch (e) {
                return value;
            }
        }
    }

    /**
     * Check if given string is a valid javascript function
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isFunctionString(value) {
        const self = SipaSerializer;
        if (!Typifier.isString(value)) {
            return false;
        }
        // complete function for final evaluation
        if (value.match(self.VALID_FUNCTION_WITHOUT_PREFIX_REGEX)) {
            value = 'function ' + value;
        }
        if (value.match(self.VALID_FUNCTION_WITHOUT_NAME_REGEX)) {
            value = value.replace('function', 'function fn');
        }

        // if complete and valid, make final validation
        if (value.match(self.VALID_FUNCTION_REGEX)) {
            try {
                // finally evaluate correct function syntax
                new Function(value);
                return true;
            } catch (e) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Check if given string is a valid javascript array
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isArrayString(value) {
        const self = SipaSerializer;
        if(Typifier.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    let array = JSON.parse(trimmed);
                    return Typifier.isArray(array);
                } catch(e) {
                }
            }
        }
        return false;
    }

    /**
     * Check if given string is a valid javascript object
     *
     * @param {String} value
     * @returns {boolean}
     */
    static isObjectString(value) {
        const self = SipaSerializer;
        if(Typifier.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    let object = JSON.parse(trimmed);
                    return Typifier.isObject(object);
                } catch(e) {
                }
            }
        }
        return false;
    }

    /**
     * Deserialize a valid javascript string into a callable function
     *
     * @param {String} value
     * @returns {Function}
     */
    static deserializeFunctionString(value) {
        const self = SipaSerializer;
        let fn = null;
        if (value.match(self.VALID_FUNCTION_WITHOUT_PREFIX_REGEX)) {
            eval('fn = function ' + value);
        } else {
            eval('fn = ' + value);
        }
        return fn;
    }

    /**
     * Serializes (escapes) all special types within an Array or Object
     * to be stored in JSON without data loss.
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     */
    static deepSerializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (Typifier.isArray(copy)) {
            copy = self._serializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (Typifier.isArray(value) || Typifier.isObject(value)) {
                return copy[key] = self.deepSerializeSpecialTypes(copy[key]);
            } else if (self._isSpecialType(copy[key])) {
                copy[key] = self.serialize(copy[key]);
            }
        });
        return copy;
    }

    /**
     * Deserializes (unescapes) all special types of the given Array or Object
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     */
    static deepDeserializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (Typifier.isArray(copy)) {
            copy = self._deserializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (Typifier.isArray(value) || Typifier.isObject(value)) {
                return copy[key] = self.deepDeserializeSpecialTypes(copy[key]);
            } else if (self._isSerializedSpecialType(copy[key])) {
                copy[key] = self.deserialize(copy[key]);
            }
        });
        return copy;
    }

    /**
     * Serialize (escape) special type 'empty' inside the given Array.
     * Only on first dimension/level, nesting is ignored.
     *
     * @param {Array} array
     * @returns {Array}
     * @private
     */
    static _serializeEmptyArrayValues(array) {
        if (Typifier.isArray(array) && Object.entries(array).length < array.length) {
            for (let i = 0; i < array.length; ++i) {
                if (SipaHelper.isArrayContainingEmptyValue(array.slice(i, i + 1))) {
                    array[i] = '::empty::';
                }
            }
        }
        return array;
    }

    /**
     * Deserialize (unescape) special type 'empty' inside given Array
     * Only on first dimension/level, nesting is ignored.
     *
     * @param {Array} array
     * @returns {Array}
     * @private
     */
    static _deserializeEmptyArrayValues(array) {
        for (let i = 0; i < array.length; ++i) {
            if (array[i] === '::empty::') {
                delete array[i];
            }
        }
        return array;
    }

    /**
     * Check if given value is of special type that needs
     * to be escaped before parsing to JSON.
     *
     * @param {any} value
     * @returns {boolean} true if special type
     * @private
     */
    static _isSpecialType(value) {
        return Typifier.isUndefined(value) ||
            Typifier.isNaN(value) ||
            Typifier.isInfinity(value) ||
            Typifier.isDate(value) ||
            Typifier.isRegExp(value)
    }

    /**
     * Check if given value is an serialized (escaped) special type
     *
     * @param {any} value
     * @returns {boolean}
     * @private
     */
    static _isSerializedSpecialType(value) {
        const self = SipaSerializer;
        if(!Typifier.isString(value)) {
            return false;
        }
        const special_types = Object.keys(self.STORAGE_PLACEHOLDERS);
        for(let i = 0; i < special_types.length; ++i) {
            if(value.startsWith(special_types[i])) {
                return true;
            }
        }
        return false;
    }

    /**
     * Clone the given Array or Object.
     *
     * @param {Array|Object} obj
     * @returns {Array|Object}
     * @private
     */
    static _cloneObject(obj) {
        let clone = null;
        if(Typifier.isArray(obj)) {
            clone = obj.slice();
        } else if(Typifier.isObject(obj)) {
            clone = Object.assign({}, obj);
        } else {
            throw `Parameter must be of type 'Array' or 'Object'! Given type: '${Typifier.getType(obj)}'`;
        }
        return clone;
    }
}

// Regex to match usual functions and arrow functions
SipaSerializer.VALID_FUNCTION_REGEX = /^\s*(\([^\)]*\)\s*\=\>|function\s*[^\s0-9]+[^\s]*\s*(\([^\)]*\)))\s*\{.*\}\s*$/gms;
// Regex to match valid functions without function name
SipaSerializer.VALID_FUNCTION_WITHOUT_NAME_REGEX = /^(\s*function)(\s*)((\([^\)]*\))\s*\{.*\}\s*)$/gms;
// Regex to match valid function with name but without prefix 'function'
SipaSerializer.VALID_FUNCTION_WITHOUT_PREFIX_REGEX = /^\s*((?!function).)\s*[^\s0-9]+[^\s]*\s*(\([^\)]*\))\s*\{.*\}\s*$/gms;

SipaSerializer.STORAGE_PLACEHOLDERS = {
    '::undefined::': undefined,
    '::NaN::': NaN,
    '::Infinity::': Infinity,
    '::empty::': 'SpecialCaseForDeletedArrayEntryThatBehavesSimilarLikeUndefined',
    '::Date::': Date,
    '::RegExp::': RegExp
}
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
     * Get store by level
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

/**
 * @typedef {'variable'|'session'|'storage'} SipaState.Level
 */
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


/**
 * SipaHelper
 *
 * Tool helper class with common helper methods
 */
class SipaHelper {
    /**
     * Merge default options (source) with custom options (addition)
     *
     * Works only fine with one level depth, don't merge nested (Object) options, as references are copied then!
     *
     * @example
     * SipaHelper.mergeOptions({ a: 1, b: "two"},{b: "TWO", c: null });
     * // => { a: 1, b: "TWO", c: null }
     *
     * @param {Object} source
     * @param {Object} addition
     * @returns {Object} merged object
     */
    static mergeOptions(source, addition) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'source', param_value: source, expected_type: 'Object'},
            {param_name: 'addition', param_value: addition, expected_type: 'Object'},
        ]);
        const merged = Object.assign({}, source);
        return Object.assign(merged, addition);
    }

    /**
     * Check if given value is a array (slice) of size 1 and contains type empty
     *
     * @example
     * let arr = ["one"];
     * delete arr[1]:
     * arr;
     * // => [empty]
     * SipaHelper.isArrayContainingEmptyValue(arr);
     * // => true
     *
     * @param {any} value
     * @returns {boolean} true if a array of size 1 and contains empty => [empty], if size is 1 and not of type empty then false
     * @throws {Error} if array is not of size 1
     */
    static isArrayContainingEmptyValue(value) {
        const self = SipaHelper;
        if(Typifier.isArray(value) && value.length === 1) {
            if(Object.entries(value).length === 0) {
                return true;
            } else {
                return false;
            }
        } else {
            throw new Error()
        }
    }

    /**
     * Check the given parameter to be of the expected type.
     * If is is not valid, throw an exception.
     *
     * @example
     * function Example(param_one, other_param) {
     *     SipaHelper.validateParams([
     *         {param_name: 'param_one', param_value: param_one, expected_type: 'Object'},
     *         {param_name: 'other_param', param_value: other_param, expected_type: 'boolean'},
     *     ]);
     * }
     * Example("one",true);
     * // => Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!`
     *
     * @param {Array<SipaParamValidation>} params
     * @throws {Error} throws an error if given parameter is not valid.
     */
    static validateParams(params = []) {
        const self = SipaHelper;
        if (Typifier.getType(params) !== 'Array') {
            self.throwParamError('params', params, 'Array');
        } else {
            params.forEach((elem) => {
                if (Typifier.getType(elem.param_value) !== elem.expected_type) {
                    self.throwParamError(elem.param_name, elem.param_value, elem.expected_type);
                }
            });
        }
    }

    static throwParamError(param_name, param, expected_type) {
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '${Typifier.getType(param)}'!`;
    }

    /**
     * Cut leading characters (string) from given text
     *
     * @example
     *  .cutLeadingCharacters('/some/path/is/that','/')
     *  // => 'some/path/is/that'
     *
     * @param {string} text to cut
     * @param {string} leading_characters to cut from text
     * @returns {string}
     */
    static cutLeadingCharacters(text, leading_characters) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'text', param_value: text, expected_type: 'string'},
            {param_name: 'leading_characters', param_value: leading_characters, expected_type: 'string'},
        ]);
        if (text.startsWith(leading_characters)) {
            return text.substr(leading_characters.length);
        } else {
            return text;
        }
    }

    /**
     * Cut trailing characters (string) from given text
     *
     * @example
     *  .cutLeadingCharacters('/some/path/file.ext','.ext')
     *  // => 'some/path/file'
     *
     * @param {string} text to cut
     * @param {string} trailing_characters to cut from text
     * @returns {string}
     */
    static cutTrailingCharacters(text, trailing_characters) {
        const self = SipaHelper;
        self.validateParams([
            {param_name: 'text', param_value: text, expected_type: 'string'},
            {param_name: 'trailing_characters', param_value: trailing_characters, expected_type: 'string'},
        ]);
        if (text.endsWith(trailing_characters)) {
            return text.substr(0,text.indexOf(trailing_characters));
        } else {
            return text;
        }
    }

    /**
     * Transform the given string into its constant representation.
     *
     * @example
     * class Foo {
     *     static function bar() { console.log("foobar"); }
     * }
     *
     * SipaHelper.constantizeString("Foo").bar();
     * // => foobar
     *
     * @param {string} constant
     * @returns {*}
     */
    static constantizeString(constant) {
        const self = SipaHelper;
        if (!self._constant_cache[constant]) {
            // check for valid constant name
            if (constant.match(/^[a-zA-Z0-9_]+$/)) {
                self._constant_cache[constant] = eval(constant);
            } else {
                throw new Error(`Invalid constant '${constant}'`);
            }
        }
        return self._constant_cache[constant];
    }
}

/**
 * @type {Object.<string, any>}
 * @private
 */
SipaHelper._constant_cache = {};

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} SipaParamValidation
 * @property {any} param_value
 * @property {string} param_name
 * @property {string} expected_type, e.g. 'Object', 'String, 'Array', ...
 */


/**
 * SipaHooks
 *
 * App hook manager
 */

class SipaHooks {

    /**
     * Set, remove or trigger event 'beforeInitPage'
     *
     * @example
     * SipaHooks.beforeInitPage('on', () => {
     *     console.log("This is run before onInit() of any page is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeInitPage(type, func, page_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyPage'
     *
     * @example
     * SipaHooks.beforeDestroyPage('on', () => {
     *     console.log("This is run before onDestroy() of any page is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeDestroyPage(type, func, page_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeInitLayout'
     *
     * @example
     * SipaHooks.beforeInitLayout('on', () => {
     *     console.log("This is run before onInit() of any layout is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} layout_id
     */
    static beforeInitLayout(type, func, layout_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_layout_functions, layout_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyLayout'
     *
     * @example
     * SipaHooks.beforeDestroyLayout('on', () => {
     *     console.log("This is run before onDestroy) of any layout is executed!");
     * }
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} layout_id
     */
    static beforeDestroyLayout(type, func, layout_id) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_layout_functions, layout_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    // ------------ reset ------------

    static reset() {
        const self = SipaHooks;
        self._before_init_page_functions = [];
        self._before_destroy_page_functions = [];
        self._before_init_layout_functions = [];
        self._before_destroy_layout_functions = [];
    }

    // ------------ helpers ------------

    static _addFunction(array, func) {
        // register only if not already set
        if (array.indexOf(func) === -1) {
            array.push(func);
        }
    }

    static _removeFunction(array, func) {
        if (typeof func === 'function') {
            let index = array.indexOf(func);
            if (index !== -1) {
                delete array[index];
            }
        }
    }

    static _triggerFunctions(array, element_id) {
        array.forEach((fun) => {
            if (typeof fun === 'function') {
                fun(element_id);
            }
        });
    }
}

SipaHooks._before_init_page_functions = [];
SipaHooks._before_destroy_page_functions = [];
SipaHooks._before_init_layout_functions = [];
SipaHooks._before_destroy_layout_functions = [];


/**
 * @typedef {'on'|'off'|'trigger'} SipaHooks.HookType
 */
/**
 * SipaOnsenHooks
 *
 * App hook manager
 */

class SipaOnsenHooks extends SipaHooks {

    /**
     * Set, remove or trigger event 'beforeShowPage'
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeShowPage(type, func, page_id) {
        const self = SipaOnsenHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_show_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_show_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_show_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeHidePage'
     *
     * @param {SipaHooks.HookType} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     * @param {string} page_id
     */
    static beforeHidePage(type, func, page_id) {
        const self = SipaOnsenHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_hide_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_hide_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_hide_page_functions, page_id);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    // ------------ reset ------------

    static reset() {
        const self = SipaOnsenHooks;
        self._before_show_page_functions = [];
        self._before_hide_page_functions = [];
        super.reset();
    }

    // ------------ helpers ------------

}

SipaOnsenHooks._before_show_page_functions = [];
SipaOnsenHooks._before_hide_page_functions = [];


/**
 * SipaPage
 *
 * Tool class with page loader with included router
 */
class SipaPage {
    /**
     * Load given page by page_id
     *
     * @param {string} page_id to load
     * @param {Object} options
     * @param {string} options.layout_id specify custom layout, overwrite default layout
     * @param {boolean} options.force_load=false force to load the page again, even if it is already loaded
     * @param {boolean} options.fade_effect=true use fade effect for the page container
     * @param {boolean} options.stack_page=true stack page in page history
     * @param {Object} options.params parameters to be set at the new page
     * @param {boolean} options.keep_params=true keep parameters when loading other page
     * @param {string} options.anchor anchor to be set at the new page
     * @param {boolean} options.keep_anchor=false keep current anchor when loading other page
     * @param {Array<String>} options.remove_params parameters to be removed at the new page
     * @param {function} options.success function to be called after successful loading
     * @param {function} options.error function to be called after loading fails
     * @param {function} options.always function to be called always after successful/erroneous loading
     */
    static load(page_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            layout_id: self.config.default_layout,
            force_load: false,
            fade_effect: true,
            stack_page: true,
            keep_anchor: Typifier.isBoolean(self.config.keep_anchor) ? self.config.keep_anchor : false,
            keep_params: Typifier.isBoolean(self.config.keep_params) ? self.config.keep_params : true,
        }
        const new_page_id = self.extractIdOfTemplate(page_id, {type: 'page'});
        if(!options.layout_id && self.config.default_layouts && self.config.default_layouts.hasOwnProperty(new_page_id)) {
            options.layout_id = self.config.default_layouts[new_page_id];
        }
        options = SipaHelper.mergeOptions(default_options, options);
        if(!options.anchor && SipaUrl.getAnchorOfUrl(page_id)) {
            options.anchor = SipaUrl.getAnchorOfUrl(page_id);
        } else if(!options.anchor && !options.keep_anchor && !SipaUrl.getAnchorOfUrl(page_id)) {
            SipaUrl.removeAnchor();
        }
        if(!options.params && Object.keys(SipaUrl.getParamsOfUrl(page_id)).length > 0) {
            if(options.keep_params) {
                options.params = SipaHelper.mergeOptions(SipaUrl.getParams(), SipaUrl.getParamsOfUrl(page_id));
            } else {
                options.params = SipaUrl.getParamsOfUrl(page_id);
            }
        }
        if(!options.keep_params) {
            SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
        }
        const last_page_id = self.currentPageId();
        const layout_id = self.extractIdOfTemplate(options.layout_id, {type: 'layout'});
        const page_path = self._makeFullPath(new_page_id, {type: 'page'});
        const j_body = $('body');
        j_body.attr('data-page-id', new_page_id);
        self.loadLayout(layout_id, {
            success: (data, text, response) => {
                $.ajax({
                    url: page_path,
                    method: 'GET',
                    dataType: 'html',
                    cache: false,
                    success: (data, text, response) => {
                        const j_container = $(self.page_container_css_selector);
                        const load_function = () => {
                            SipaHooks.beforeDestroyPage('trigger');
                            if (last_page_id) {
                                self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: new_page_id}]);
                            }
                            j_container.html(data);
                            SipaHooks.beforeInitPage('trigger');
                            if (options.fade_effect) {
                                j_container.fadeIn(150);
                            }
                            if (options.stack_page) {
                                self.stackHistoryState({page_id: new_page_id, layout_id: layout_id, options: options});
                            }
                            if (options.params) {
                                SipaUrl.setParams(options.params);
                            }
                            if (options.remove_params) {
                                SipaUrl.removeParams(options.remove_params);
                            }
                            // ensure anchor is set and jumped to on page load or initial (re)load
                            if (options.anchor || SipaUrl.getAnchor()) {
                                const current_anchor = options.anchor || SipaUrl.getAnchor();
                                SipaUrl.setAnchor(current_anchor, true);
                            }
                            self.callMethodOfPage(new_page_id, 'onInit', [{last_page_id: last_page_id}]);
                            if(Typifier.isFunction(options.success)) {
                                options.success(data, text, response);
                            }
                            if(Typifier.isFunction(options.always)) {
                                options.always(data, text, response);
                            }
                        }
                        if (options.fade_effect) {
                            j_container.fadeOut(50, load_function);
                        } else {
                            load_function();
                        }
                    },
                    error: (response, text, data) => {
                        j_body.attr('data-page-id', last_page_id);
                        if(Typifier.isFunction(options.error)) {
                            options.error(response, text, data);
                        }
                        if(Typifier.isFunction(options.always)) {
                            options.always(data, text, response);
                        }
                    }
                });
            }
        });
    }

    /**
     * Get the id only of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     */
    static extractIdOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        let id = SipaHelper.cutLeadingCharacters(template, '/');
        // cut params
        if(id.indexOf('?') !== -1) {
            id = id.split('?')[0];
        }
        // cut anchor
        if(id.indexOf('#') !== -1) {
            id = id.split('#')[0];
        }
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
        return LuckyCase.toDashCase(id);
    }

    /**
     * Get the class name of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} class name
     */
    static getClassNameOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const id = CurlyBracketParser._replaceAll(self.extractIdOfTemplate(template, options),'/', '_');
        return LuckyCase.toPascalCase(id + '_' + options.type);
    }

    /**
     * Get the options of the given type
     *
     * @param {SipaPage.PageType} type
     * @returns {TypeOptionsType} type options
     */
    static typeOptions(type) {
        const types = {
            page: {
                prefix: 'views/pages/',
                file_ext: '.html'
            },
            layout: {
                prefix: 'views/layouts/',
                file_ext: '.html'
            }
        };
        if (!types[type]) {
            throw `Invalid type '${type}'. Valid types are: ${Object.keys(types).join(' ')}`;
        }
        return types[type];
    }

    /**
     * Get page id of current loaded page
     *
     * @returns {string} page id
     */
    static currentPageId() {
        return $('body').attr('data-page-id');
    }

    /**
     * Get current page class
     *
     * @return {SipaBasicView}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaPage.getClassNameOfTemplate(SipaPage.currentPageId()));
    }

    /**
     * Get layout id of current loaded layout
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body').attr('data-layout-id');
    }

    /**
     * Load the given layout
     *
     * @param {string} layout_id to load
     * @param {Object} options
     * @param {boolean} options.fade_effect=true fade effect on layout change
     * @param {boolean} options.keep_page=false keep the loaded page, but change the layout only
     */
    static loadLayout(layout_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            fade_effect: true,
            success: null
        };
        options = SipaHelper.mergeOptions(default_options, options);
        const j_body = $('body');
        const layout_path = self._makeFullPath(layout_id, {type: 'layout'});
        const last_layout_id = self.currentLayoutId();
        j_body.attr('data-layout-id', layout_id);
        /**
         * @param {'success'|'always'} type
         */
        const after_loaded_function = (data, text, response, type) => {
            SipaHooks.beforeDestroyLayout('trigger');
            if (last_layout_id) {
                self.callMethodOfLayout(last_layout_id, 'onDestroy', [{next_layout_id: layout_id}]);
            }
            j_body.hide();
            j_body.html(data);
            SipaHooks.beforeInitLayout('trigger');
            self.callMethodOfLayout(layout_id, 'onInit', [{last_layout_id: last_layout_id}]);
            if (typeof options[type] === 'function') {
                options[type](data, text, response);
            }
            const layout_has_changed = last_layout_id !== layout_id;
            if (options.fade_effect && layout_has_changed) {
                j_body.fadeIn(150);
            } else {
                j_body.show();
            }
        };

        $.ajax({
            url: layout_path,
            method: 'GET',
            dataType: 'html',
            cache: false,
            success: (data, text, response) => {
                after_loaded_function(data, text, response, 'success');
            },
            always: (data, text, response) => {
                after_loaded_function(data, text, response, 'always');
            },
            error: (response, text, data) => {
                console.error(`Error ${response.status} - ${response.statusText} - could not load layout '${layout_path}'`);
                if (typeof options.error === 'function') {
                    options.error(response, text, data);
                }
            }
        });
    }

    /**
     * Call the given method of the given page with given parameters (optional)
     *
     * @param {string} page_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfPage(page_id, method_name, parameters = []) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const page_class = self.getClassNameOfTemplate(page_id, {type: 'page'});
        const class_exists = eval(`typeof ${page_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${page_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${page_class}.${method_name}(...parameters);`)
            }
        }
    }

    /**
     * Call the given method of the given layout with given parameters (optional)
     *
     * @param {string} layout_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfLayout(layout_id, method_name, parameters = []) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const layout_class = self.getClassNameOfTemplate(layout_id, {type: 'layout'});
        const class_exists = eval(`typeof ${layout_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${layout_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${layout_class}.${method_name}(...parameters);`)
            }
        }
    }

    /**
     * Ensure full path of given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     * @private
     */
    static _makeFullPath(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        const id_split = template.split('/');
        const file_name = id_split[id_split.length-1];
        let full_path = SipaHelper.cutLeadingCharacters(template, '/');
        full_path = SipaHelper.cutTrailingCharacters(full_path, type.file_ext);
        if (!full_path.startsWith(type.prefix)) {
            full_path = type.prefix + full_path;
        }
        full_path += '/' + file_name + type.file_ext;
        return full_path;
    }

    /**
     * Initialize the router for single page app browser history
     */
    static initHistoryState() {
        const self = SipaPage;
        // listen to browser back event
        window.onpopstate = (e) => {
            if (e.state && e.state.page_id) {
                const page_id = e.state.page_id;
                let options = e.state.options;
                // as we go back in history, we do not stack the previous page when loading it
                options.stack_page = false;
                if (page_id) {
                    self.load(page_id, options);
                }
            }
        }
    }

    /**
     * Stack the current page and layout state to the browser history
     *
     * @param {Object} state
     * @param {string} state.page_id
     * @param {string} state.layout_id
     * @param {Object} state.options
     * @param {boolean} replace_state=false
     */
    static stackHistoryState(state = {page_id: null, layout_id: null, options: null}, replace_state = false) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'state', param_value: state, expected_type: 'Object'},
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'boolean'},
        ]);
        const original_url = SipaUrl.getUrl();
        let params = {page: state.page_id};
        if (replace_state) {
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        } else {
            window.history.pushState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        }
    }

    /**
     * Set the configuration of pages and layouts
     *
     * @example
     *   SipaPage.setConfig({
     *       // default layout for all pages
     *       default_layout: 'default',
     *       // specific layouts for some pages { <page-name>: <layout-name> }
     *       default_layouts: {
     *           // overwrites the layout for the page 'login-page' with layout 'mini-dialog'
     *           'login-page': 'mini-dialog'
     *       }
     *   });
     *
     * @param {SipaPage.Config} config
     */
    static setConfig(config) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
        // init only when running in browser
        if(typeof window !== 'undefined') {
            SipaPage.initHistoryState();
        }
    }

    static isInitialized() {
        const self = SipaPage;
        return self.config !== null;
    }
}

SipaPage.page_container_css_selector = '#page-container';

/**
 * @type {SipaPageConfig}
 */
SipaPage.config = null;

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} TypeOptionsType
 * @property {string} prefix
 * @property {string} file_ext
 *
 *
 * @typedef {Object} SipaPage.Config
 * @param {string} default_layout
 * @param {Object} default_layouts
 * @param {boolean} keep_anchor
 *
 *
 * @typedef {'layout'|'page'} SipaPage.PageType
 */



/**
 * SipaOnsenPage
 *
 * Tool class with page loader with included router for OnsenUI
 */
class SipaOnsenPage {
    /**
     * Load given page by page_id
     *
     * @param {string} page_id to load
     * @param {Object} options
     * @param {boolean} options.stack_page=true stack page in page history
     * @param {boolean} options.reset=false reset page to given page
     * @param {boolean} options.replace=false replace current page with given page. If reset=true is set, this setting will be ignored
     * @param {boolean} options.init_history_tree=false force to load history tree, default false
     * @param {Object} options.params parameters to be set at the new page
     * @param {boolean} options.keep_params=true keep parameters when loading other page
     * @param {string} options.anchor anchor to be set at the new page
     * @param {boolean} options.keep_anchor=false keep current anchor when loading other page
     * @param {Array<String>} options.remove_params parameters to be removed at the new page
     * @param {function} options.success function to be called after successful loading
     * @param {function} options.error function to be called after loading fails
     * @param {function} options.always function to be called always after successful/erroneous loading
     */
    static load(page_id, options = {}) {
        return new Promise((resolve, reject) => {
            const self = SipaOnsenPage;
            self.connectOnsenHooks();
            SipaHelper.validateParams([
                {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
                {param_name: 'options', param_value: options, expected_type: 'Object'},
            ]);
            const default_options = {
                layout_id: self.config.default_layout,
                fade_effect: true,
                stack_page: true,
                keep_anchor: Typifier.isBoolean(self.config.keep_anchor) ? self.config.keep_anchor : false,
                keep_params: Typifier.isBoolean(self.config.keep_params) ? self.config.keep_params : true,
            }
            options = SipaHelper.mergeOptions(default_options, options);
            if(!options.anchor && SipaUrl.getAnchorOfUrl(page_id)) {
                options.anchor = SipaUrl.getAnchorOfUrl(page_id);
            } else if(!options.anchor && !options.keep_anchor && !SipaUrl.getAnchorOfUrl(page_id)) {
                SipaUrl.removeAnchor();
            }
            if(!options.params && Object.keys(SipaUrl.getParamsOfUrl(page_id)).length > 0) {
                if(options.keep_params) {
                    options.params = SipaHelper.mergeOptions(SipaUrl.getParams(), SipaUrl.getParamsOfUrl(page_id));
                } else {
                    options.params = SipaUrl.getParamsOfUrl(page_id);
                }
            }
            if(!options.keep_params) {
                SipaUrl.removeParams(Object.keys(SipaUrl.getParams()));
            }
            page_id = self.extractIdOfTemplate(page_id, {type: 'page'});
            const last_page_id = self.currentPageId();
            const layout_id = self.extractIdOfTemplate(options.layout_id, {type: 'layout'});
            const page_path = self._makeFullPath(page_id, {type: 'page'});
            const j_body = $('body');
            j_body.attr('data-page-id', page_id);
            self.loadLayout(layout_id, {
                success: (data, text, response) => {
                    $.ajax({
                        url: page_path,
                        method: 'GET',
                        dataType: 'html',
                        cache: false,
                        success: (data, text, response) => {
                            const navi = self.getOnsenNavigator();
                            self._current_page = {page_id: page_id, last_page_id: last_page_id, options: options};
                            const afterFunction = () => {
                                self._getPageStack().getLast().setAttribute('data-page-id', page_id);
                                if(options && options.init_history_tree) {
                                    self._history_tree_loaded = false;
                                }
                                resolve(page_id);
                            };
                            if (options && options.reset) {
                                navi.resetToPage(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
                            } else if (options && options.replace) {
                                navi.replacePage(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
                            } else {
                                navi.bringPageTop(self._makeFullPath(page_id)).then(() => {
                                    afterFunction();
                                });
                            }
                        },
                        error: (response, text, data) => {
                            j_body.attr('data-page-id', last_page_id);
                            if (Typifier.isFunction(options.error)) {
                                options.error(response, text, data);
                            }
                            if (Typifier.isFunction(options.always)) {
                                options.always(data, text, response);
                            }
                            reject(page_id);
                        }
                    });
                }
            });
        });
    }

    static getOnsenNavigator() {
        const self = SipaOnsenPage;
        return document.querySelector(self.page_container_css_selector);
    }

    /**
     * Get the id only of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     */
    static extractIdOfTemplate(template, options = {}) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        let id = SipaHelper.cutLeadingCharacters(template, '/');
        // cut params
        if(id.indexOf('?') !== -1) {
            id = id.split('?')[0];
        }
        // cut anchor
        if(id.indexOf('#') !== -1) {
            id = id.split('#')[0];
        }
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
        return LuckyCase.toDashCase(id);
    }

    /**
     * Get the class name of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} class name
     */
    static getClassNameOfTemplate(template, options = {}) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const id = CurlyBracketParser._replaceAll(self.extractIdOfTemplate(template, options), '/', '_');
        return LuckyCase.toPascalCase(id + '_' + options.type);
    }

    /**
     * Get the options of the given type
     *
     * @param {SipaPage.PageType} type
     * @returns {TypeOptionsType} type options
     */
    static typeOptions(type) {
        const types = {
            page: {
                prefix: 'views/pages/',
                file_ext: '.html'
            },
            layout: {
                prefix: 'views/layouts/',
                file_ext: '.html'
            }
        };
        if (!types[type]) {
            throw `Invalid type '${type}'. Valid types are: ${Object.keys(types).join(' ')}`;
        }
        return types[type];
    }

    /**
     * Get page id of current loaded page
     *
     * @returns {string} page id
     */
    static currentPageId() {
        const self = SipaOnsenPage;
        const last_page = self._getPageStack().getLast();
        if (last_page) {
            return self._getPageStack().getLast().getAttribute('data-page-id');
        }
    }

    /**
     * Get current page class
     *
     * @return {SipaBasicView}
     */
    static currentPageClass() {
        const self = SipaPage;
        return SipaHelper.constantizeString(SipaOnsenPage.getClassNameOfTemplate(SipaOnsenPage.currentPageId()));
    }

    /**
     * Get layout id of current loaded layout
     *
     * @returns {string}
     */
    static currentLayoutId() {
        return $('body').attr('data-layout-id');
    }

    /**
     * Load the given layout
     *
     * @param {string} layout_id to load
     * @param {Object} options
     * @param {boolean} options.fade_effect=true fade effect on layout change
     * @param {boolean} options.keep_page=false keep the loaded page, but change the layout only
     */
    static loadLayout(layout_id, options = {}) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            fade_effect: true,
            success: null
        };
        options = SipaHelper.mergeOptions(default_options, options);
        const j_body = $('body');
        const layout_path = self._makeFullPath(layout_id, {type: 'layout'});
        const last_layout_id = self.currentLayoutId();
        if (last_layout_id === layout_id) {
            if (typeof options.success === 'function') {
                options.success();
            }
            if (typeof options.always === 'function') {
                options.always();
            }
        } else {
            j_body.attr('data-layout-id', layout_id);
            /**
             * @param {'success'|'always'} type
             */
            const after_loaded_function = (data, text, response, type) => {
                if (last_layout_id) {
                    SipaOnsenHooks.beforeDestroyLayout('trigger', null, last_layout_id);
                    self.callMethodOfLayout(last_layout_id, 'onDestroy', [{next_layout_id: layout_id}]);
                }
                j_body.hide();
                j_body.html(data);
                SipaOnsenHooks.beforeInitLayout('trigger', null, layout_id);
                self.callMethodOfLayout(layout_id, 'onInit', [{last_layout_id: last_layout_id}]);
                if (typeof options[type] === 'function') {
                    options[type](data, text, response);
                }
                const layout_has_changed = last_layout_id !== layout_id;
                if (options.fade_effect && layout_has_changed) {
                    j_body.fadeIn(150);
                } else {
                    j_body.show();
                }
            };

            $.ajax({
                url: layout_path,
                method: 'GET',
                dataType: 'html',
                cache: false,
                success: (data, text, response) => {
                    after_loaded_function(data, text, response, 'success');
                },
                always: (data, text, response) => {
                    after_loaded_function(data, text, response, 'always');
                },
                error: (response, text, data) => {
                    console.error(`Error ${response.status} - ${response.statusText} - could not load layout '${layout_path}'`);
                    if (typeof options.error === 'function') {
                        options.error(response, text, data);
                    }
                }
            });
        }
    }

    /**
     * Call the given method of the given page with given parameters (optional)
     *
     * @param {string} page_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfPage(page_id, method_name, parameters = []) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const page_class = self.getClassNameOfTemplate(page_id, {type: 'page'});
        const class_exists = eval(`typeof ${page_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${page_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${page_class}.${method_name}(...parameters);`)
            }
        }
    }

    /**
     * Call the given method of the given layout with given parameters (optional)
     *
     * @param {string} layout_id
     * @param {string} method_name
     * @param {Array} parameters
     */
    static callMethodOfLayout(layout_id, method_name, parameters = []) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'string'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'string'},
            {param_name: 'parameters', param_value: parameters, expected_type: 'Array'},
        ]);
        const layout_class = self.getClassNameOfTemplate(layout_id, {type: 'layout'});
        const class_exists = eval(`typeof ${layout_class} !== 'undefined'`);
        if (class_exists) {
            const method_exists = eval(`typeof ${layout_class}.${method_name} === 'function'`);
            if (method_exists) {
                eval(`${layout_class}.${method_name}(...parameters);`)
            }
        }
    }

    static _getPageStack() {
        return [...document.querySelectorAll('ons-navigator ons-page')];
    }

    /**
     * Ensure full path of given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {SipaPage.PageType} options.type='page'
     * @returns {string} absolute path
     * @private
     */
    static _makeFullPath(template, options = {}) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'string'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        const id_split = template.split('/');
        const file_name = id_split[id_split.length - 1];
        let full_path = SipaHelper.cutLeadingCharacters(template, '/');
        full_path = SipaHelper.cutTrailingCharacters(full_path, type.file_ext);
        if (!full_path.startsWith(type.prefix)) {
            full_path = type.prefix + full_path;
        }
        full_path += '/' + file_name + type.file_ext;
        return full_path;
    }

    /**
     * Initialize the router for single page app browser history
     */
    static initHistoryState() {
        const self = SipaOnsenPage;
        // listen to browser back/forward event
        window.onpopstate = (e) => {
            if (e.state === null) {
                return;
            }
            const current_history_index = e.state.index || 0;
            self.last_history_index = self.last_history_index === null ? current_history_index : self.last_history_index;
            if (e.state && e.state.page_id) {
                const page_id = e.state.page_id;
                let options = e.state.options;
                // as we go back in history, we do not stack the previous page when loading it
                options.stack_page = false;
                if (page_id) {
                    const forward_button_clicked = current_history_index - self.last_history_index >= 1;
                    if (forward_button_clicked) {
                        //console.log(`history.forward (${current_history_index}/${self.last_history_index})`);
                        self.load(page_id, options);
                    } else {
                        //console.log(`history.backward (${current_history_index}/${self.last_history_index})`);
                        self.popPage();
                    }
                }
                self.last_history_index = current_history_index;
            }
        }
    }


    static connectOnsenHooks() {
        const self = SipaOnsenPage;
        if (!self.onsen_hooks_connected) {
            document.addEventListener('init', function (event) {
                if (self._is_loading_history_tree || self._getPageStack().length === 0) {
                    return;
                }
                const page_id = self._current_page.page_id;
                const last_page_id = self._current_page.page_id;
                const options = self._current_page.options;
                if (options.stack_page) {
                    self.stackHistoryState({page_id: page_id, layout_id: options.layout_id, options: options});
                }
                if (options.params) {
                    SipaUrl.setParams(options.params);
                }
                if (options.remove_params) {
                    SipaUrl.removeParams(options.remove_params);
                }
                self._initPage(page_id, last_page_id);
                if (Typifier.isFunction(options.success)) {
                    options.success(data, text, response);
                }
                if (Typifier.isFunction(options.always)) {
                    options.always(data, text, response);
                }
            }, false);

            document.addEventListener('hide', function (event) {
                const page_id = event.target.getAttribute('data-page-id');
                self._historyPageInit();
                const next_page_id = self._getPageStack()[self._getPageStack().length - 2];
                if (page_id) {
                    SipaOnsenHooks.beforeHidePage("trigger", null, page_id);
                    self.callMethodOfPage(page_id, 'onHide', [{next_page_id: next_page_id}]);
                }
            }, false);

            document.addEventListener('postpop', function (event) {
                const page_id = self.currentPageId();
            }, false);

            document.addEventListener('prepop', function (event) {
                const page_id = self.currentPageId();
            }, false);

            document.addEventListener('destroy', function (event) {
                const last_page_id = self.currentPageId();
                const next_page_id = self._getPageStack()[self._getPageStack().length - 2];
                if (last_page_id) {
                    SipaOnsenHooks.beforeDestroyPage('trigger', null, last_page_id);
                    self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: next_page_id}]);
                }
            }, false);

            document.addEventListener('show', function (event) {
                const page_id = self.currentPageId();
                if (self._getPageStack().length > 0) {
                    self.initHistoryTree();
                } else {
                    // layout show
                }
                if (page_id) {
                    SipaOnsenHooks.beforeShowPage("trigger", null, page_id);
                    self.callMethodOfPage(page_id, 'onShow');
                }
            }, false);
            self.onsen_hooks_connected = true;
        }
    }

    /**
     * Stack the current page and layout state to the browser history
     *
     * @param {Object} state
     * @param {string} state.page_id
     * @param {string} state.layout_id
     * @param {Object} state.options
     * @param {boolean} replace_state=false
     */
    static stackHistoryState(state = {page_id: null, layout_id: null, options: null}, replace_state = false) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'state', param_value: state, expected_type: 'Object'},
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'boolean'},
        ]);
        const original_url = SipaUrl.getUrl();
        let params = {page: state.page_id};
        if (!window.history.state) {
            replace_state = true;
        }
        if (replace_state) {
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        } else {
            state.index = window.history.length;
            window.history.pushState(state, '', SipaUrl.setParamsOfUrl(original_url, params));
        }
    }

    static initHistoryTree(force = false) {
        const self = SipaOnsenPage;
        if (!self._history_tree_loaded || force) {
            self._is_loading_history_tree = true;
            self._history_tree_loaded = true;
            const page_id_param = SipaUrl.getParams().page;
            if (page_id_param) {
                const last_tree_elements = SipaOnsenPage.config.history_trees.map((el) => {
                    return el.getLast();
                });
                if (last_tree_elements.indexOf(page_id_param) !== -1) {
                    const history_tree = self.config.history_trees[last_tree_elements.indexOf(page_id_param)];
                    const without_last_item = _.slice(history_tree, 0, history_tree.length - 1);
                    const history_count = without_last_item.length;
                    without_last_item.reverse().eachWithIndex((page, i) => {
                        const page_id = self.extractIdOfTemplate(page);
                        const page_params = SipaUrl.getParamsOfUrl(page);
                        const page_anchor = SipaUrl.getAnchorOfUrl(page);
                        self.getOnsenNavigator().insertPage(0, self._makeFullPath(page_id)).then((el) => {
                            el.setAttribute('data-history-tree', 'true');
                            el.setAttribute('data-page-id', page_id);
                            el.setAttribute('data-page-parameters', JSON.stringify(page_params));
                            el.setAttribute('data-page-anchor', page_anchor);
                            if (self._getPageStack().length === history_count + 1) {
                                self._is_loading_history_tree = false;
                            }
                        });
                    });
                } else {
                    self._is_loading_history_tree = false;
                }
            } else {
                self._is_loading_history_tree = false;
            }
        }
    }

    static initializeBackButton() {
        const self = SipaOnsenPage;
        const back_buttons = [...document.querySelectorAll('ons-back-button')];
        if (back_buttons && back_buttons.length > 0) {
            const latest_back_button = back_buttons.getLast();
            if (latest_back_button) {
                latest_back_button.onClick = function (event) {
                    event.preventDefault();
                    if (!self._hasHistoryPage()) {
                        window.history.back();
                    } else {
                        self.popPage();
                    }
                    return;
                };
            }
        }
    }

    static popPage() {
        const self = SipaOnsenPage;
        return self.getOnsenNavigator().popPage();
    }

    /**
     * Set the configuration of pages and layouts
     *
     * @example
     *   SipaOnsenPage.setConfig({
     *       // default layout for all pages
     *       default_layout: 'default',
     *       // specific layouts for some pages { <page-name>: <layout-name> }
     *       default_layouts: {
     *           // overwrites the layout for the page 'login-page' with layout 'mini-dialog'
     *           'login-page': 'mini-dialog'
     *       }
     *   });
     *
     * @param {Object} config
     * @param {string} config.default_layout
     * @param {Object} config.default_layouts
     */
    static setConfig(config) {
        const self = SipaOnsenPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
        // init only when running in browser
        if (typeof window !== 'undefined') {
            SipaOnsenPage.initHistoryState();
        }
    }

    static isInitialized() {
        const self = SipaOnsenPage;
        return self.config !== null;
    }

    /**
     * Check if current page was inserted by history tree.
     * If yes, then run its onInit method and remove its history tree class.
     *
     * This ensures, that the init method of pages is called once when they are displayed first.
     *
     * @private
     */
    static _historyPageInit() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const last_page = page_stack[page_stack.length - 1];
        const new_page = page_stack[page_stack.length - 2];
        if (new_page && new_page.getAttribute('data-history-tree')) {
            const last_page_id = last_page.getAttribute('data-page-id');
            const new_page_id = new_page.getAttribute('data-page-id');
            let new_page_parameters = null;
            if(new_page.getAttribute('data-page-parameters')) {
                new_page_parameters = JSON.parse(new_page.getAttribute('data-page-parameters'));
            }
            const new_page_anchor = new_page.getAttribute('data-page-anchor');
            new_page.removeAttribute('data-history-tree');
            self._initPage(new_page_id, last_page_id, new_page_parameters, new_page_anchor);
            return true;
        }
        return false;
    }

    static _hasHistoryPage() {
        const self = SipaOnsenPage;
        const page_stack = self._getPageStack();
        const new_page = page_stack[page_stack.length - 2];
        return new_page && new_page.getAttribute('data-history-tree');
    }

    static _initPage(page_id, last_page_id, params = {}, anchor) {
        const self = SipaOnsenPage;
        if(!params) {
            params = {};
        }
        SipaUrl.setParams(SipaHelper.mergeOptions(params, {page: page_id}));
        if(anchor) {
            SipaUrl.setAnchor(anchor);
        }
        self._getPageStack().getLast().setAttribute('data-page-id', page_id);
        SipaOnsenHooks.beforeInitPage("trigger", null, page_id);
        self.callMethodOfPage(page_id, 'onInit', [{last_page_id: last_page_id}]);
        self.initializeBackButton();
    }
}

SipaOnsenPage.page_container_css_selector = 'ons-navigator';

/**
 * @type {SipaOnsenPageConfig}
 */
SipaOnsenPage.config = null;
SipaOnsenPage.last_history_index = null;
SipaOnsenPage.onsen_hooks_connected = false;
SipaOnsenPage._history_tree_loaded = false;

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} TypeOptionsType
 * @property {string} prefix
 * @property {string} file_ext
 *
 *
 * @typedef {Object} SipaOnsenPageConfig
 * @param {string} default_layout
 * @param {Object} default_layouts
 */

/**
 * SipaUrl
 *
 * Tool class to access and manipulate
 * the current or given URLs
 */
class SipaUrl {
    /**
     * Get the current address of the website
     *
     * @example
     * SipaUrl.getUrl();
     * // => https://my-website.com/web/?page=abc&param=ok
     *
     * @returns {string}
     */
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the protocol of the current url (without colon)
     *
     * @example
     * SipaUrl.getProtocol();
     * // => 'https'
     *
     * @returns {'http'|'https'}
     */
    static getProtocol() {
        return window.location.protocol.replace(':', '');
    }

    /**
     * Get the host name of the current url
     *
     * @example
     *      localhost
     *      127.0.0.1
     *      localhost:7000
     *      my-domain.com
     *
     * @returns {string}
     */
    static getHostName() {
        return window.location.hostname;
    }

    /**
     * Get all params of the current URL
     *
     * @example
     * // URL: https://my-business.com/?one=1&stat=true
     * SipaUrl.getParams();
     * // => { "one": "1", "stat": "true" }
     *
     * @returns {Object<string, string>}
     */
    static getParams() {
        const self = SipaUrl;
        return self.getParamsOfUrl(self.getUrl());
    }

    /**
     * Set or overwrite given parameters of the current url
     *
     * @example
     * // URL: https://my-business.com/?one=1&stat=true&that=cool
     * SipaUrl.setParams({ "more": "better", "stat": "false"});
     * // URL: https://my-business.com/?one=1&stat=false&that=cool&more=better
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     */
    static setParams(params) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: params, param_name: 'params', expected_type: 'Object'}]);
        const new_url = self.setParamsOfUrl(self.getUrl(), params);
        self._setUrl(new_url);
    }

    /**
     * Set or overwrite one specific parameter of the current url
     *
     * @example
     * // URL: https://my-business.com/?super=banana&coca=cola
     * SipaUrl.setParam("pepsi","coke");
     * // URL: https://my-business.com/?super=banana&coca=cola&pepsi=coke
     *
     * @param {string} param_key
     * @param {string} value
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
    }

    /**
     * Remove given params of the current url
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar&more=power
     * SipaUrl.removeParams(["some","more"]);
     * // URL: https://my-business.com/?foo=bar
     *
     * @param {Array<String>} param_keys
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self._setUrl(new_url);
    }

    /**
     * Remove given param of the current url
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar
     * SipaUrl.removeParam("foo");
     * // URL: https://my-business.com/?some=stuff
     * @param {string} param_key
     */
    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'string'}]);
        self.removeParams([param_key]);
    }

    /**
     * Set or overwrite given anchor of the current url
     *
     * @param {string} anchor without leading # character
     * @param {boolean} jump jump to anchor
     */
    static setAnchor(anchor, jump=false) {
        const self = SipaUrl;
        if(jump) {
            let state = {};
            if(window.history.state) {
                state = window.history.state;
            }
            let params = {page: state.page_id};
            self.removeAnchor();
            window.location.href = window.location.href + '#' + anchor;
            window.history.replaceState(state, '', SipaUrl.setParamsOfUrl(SipaUrl.getUrl(), params));
        } else {
            const new_url = self.setAnchorOfUrl(self.getUrl(), anchor);
            self._setUrl(new_url);
        }
    }

    /**
     * Remove the anchor of the current URL
     *
     * @example
     * // URL: https://my-business.com/?some=stuff&foo=bar#my-anchor
     * SipaUrl.removeAnchor();
     * // URL: https://my-business.com/?some=stuff&foo=bar
     *
     */
    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self._setUrl(new_url);
    }

    /**
     * Get the anchor of the current URL without leading #
     *
     * @returns {string}
     */
    static getAnchor() {
        const self = SipaUrl;
        return self.getAnchorOfUrl(self.getUrl());
    }

    /**
     * Creates an url query string based on the given key<->value object
     *
     * @example
     *  { a: 1, b: [1,2,3], c: "test space" }
     *  =>
     *  'a=1&b=1&b=2&b=3&c=test%20space'
     *
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @param {Object} options
     * @param {boolean} options.url_encode url encode parameter keys and values, default: true
     * @param {boolean} options.multi_param_attributes if attribute is of array, make it 'id=1&id=2&id=3' on true, or 'id=1,2,3' on false
     * @returns {string}
     */
    static createUrlParams(params, options = {}) {
        const default_options = {
            url_encode: true,
            multi_param_attributes: true
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const ret = [];
        for (let d in params) {
            let key = d;
            let value = params[d];
            if(Typifier.isArray(value) && options.multi_param_attributes) {
                if(options.url_encode) {
                    ret.push(
                        encodeURIComponent(key) + '=' + value.map(encodeURIComponent).join('&' + encodeURIComponent(key) + '=')
                    );
                } else {
                    ret.push(
                        key + '=' + value.join(key + '=')
                    );
                }
            } else {
                if(options.url_encode) {
                    ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(params[d]));
                } else {
                    ret.push(d + '=' + params[d]);
                }
            }
        }
        return ret.join('&');
    }

    /**
     * Create a JSON, containing the parameters of the given url
     *
     * @example
     * SipaUrl.getParamsOfUrl("https://my-business.com/?some=stuff&foo=bar");
     * // => { "some": "stuff", "foo": "bar" }
     *
     * @param {string} url the url to extract parameters from
     * @param {Object} options
     * @param {boolean} options.decode_uri decode uri parameter values
     * @returns {Object<string, string>} return a JSON with { param1: value1, param2: value2, ... }
     */
    static getParamsOfUrl(url, options = {}) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            decode_uri: true, // decode url variables
        };
        options = SipaHelper.mergeOptions(default_options, options);
        url = self.removeAnchorOfUrl(url);
        let obj = {};
        let query_string = null;
        try {
            query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : (new URL(url)).search.slice(1);
        } catch (e) {
            return obj; // return empty object if it is no valid url
        }
        if (query_string) {
            query_string = self.removeAnchorOfUrl(query_string);
            // split our query string into its parts
            let arr = query_string.split('&');
            for (let i = 0; i < arr.length; i++) {
                // separate the keys and values
                let a = arr[i].split('=');
                // set parameter name and value (use 'true' if empty)
                let param_name = a[0];
                let param_value = typeof (a[1]) === 'undefined' ? true : a[1];
                if (options.decode_uri) {
                    param_value = decodeURIComponent(param_value);
                }
                // if the param_name ends with square brackets, e.g. colors[] or colors[2]
                if (param_name.match(/\[(\d+)?\]$/)) {
                    // create key if it doesn't exist
                    let key = param_name.replace(/\[(\d+)?\]/, '');
                    if (!obj[key]) obj[key] = [];
                    // if it's an indexed array e.g. colors[2]
                    if (param_name.match(/\[\d+\]$/)) {
                        // get the index value and add the entry at the appropriate position
                        let index = /\[(\d+)\]/.exec(param_name)[1];
                        obj[key][index] = param_value;
                    } else {
                        // otherwise add the value to the end of the array
                        obj[key].push(param_value);
                    }
                } else {
                    // we're dealing with a string
                    if (!obj[param_name]) {
                        // if it doesn't exist, create property
                        obj[param_name] = param_value;
                    } else if (obj[param_name] && typeof obj[param_name] === 'string') {
                        // if property does exist and it's a string, convert it to an array
                        obj[param_name] = [obj[param_name]];
                        obj[param_name].push(param_value);
                    } else {
                        // otherwise add the property
                        obj[param_name].push(param_value);
                    }
                }
            }
        }
        return obj;
    }

    /**
     * Remove the given parameters from the given url
     *
     * @param {string} url to remove the params from
     * @param {Array<String>} param_keys array of keys to remove from the given url, e.g. ['key1','key2'}
     * @returns {string}
     */
    static removeParamsOfUrl(url, param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_name: 'param_keys', param_value: param_keys, expected_type: 'Array'},
            {param_name: 'url', param_value: url, expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (curr_params[key]) {
                delete curr_params[key];
            }
        });
        let query_params = self.createUrlParams(curr_params);
        if(query_params) {
            query_params = '?' + query_params;
        }
        return self._getUrlWithoutParams(url) + query_params + anchor;
    }

    /**
     * Remove the given one parameter from the given url
     *
     * @param {string} url
     * @param {string} param_key name of the param
     */
    static removeParamOfUrl(url, param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: param_key, param_name: 'param_key', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        self.removeParamsOfUrl(url, [param_key]);
    }

    /**
     * Set/overwrite the parameters of the given url
     *
     * @param {string} url
     * @param {Object<string, string>} params in format { param1: value1, param2: value2, ... }
     * @returns {string} with given parameters
     */
    static setParamsOfUrl(url, params) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: params, param_name: 'params', expected_type: 'Object'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self.removeAnchorOfUrl(self._getUrlWithoutParams(url)) + '?' + self.createUrlParams(curr_params) + anchor;
    }



    /**
     * Set/overwrite the anchor of the given url
     *
     * @param {string} url
     * @param {string} anchor as string, without leading #
     * @returns {string} with given anchor
     */
    static setAnchorOfUrl(url, anchor) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: anchor, param_name: 'anchor', expected_type: 'string'},
            {param_value: url, param_name: 'url', expected_type: 'string'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        let final_url = self._getUrlWithoutParams(url);
        if(Object.keys(curr_params).length > 0) {
            final_url += '?';
        }
        return final_url + self.createUrlParams(curr_params) + '#' + anchor;
    }

    /**
     * Get the anchor of the given url
     *
     * @param {string} url
     * @param {object} options
     * @param {boolean} options.return_prefixed_hash return the prefixed hash
     * @returns {string} the anchor of the given url
     */
    static getAnchorOfUrl(url, options = {}) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            return_prefixed_hash: false
        }
        options = SipaHelper.mergeOptions(default_options, options);
        let prefix = '#';
        if (!options.return_prefixed_hash) {
            prefix = '';
        }
        if (url.indexOf('#') !== -1) {
            return prefix + url.split('#')[1];
        } else {
            return '';
        }
    }

    /**
     * Remove the anchor of the given url
     *
     * @param {string} url
     * @returns {string} without anchor
     */
    static removeAnchorOfUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if (url.indexOf('#') !== -1) {
            return url.split('#')[0];
        } else {
            return url;
        }
    }

    /**
     * Get the given url without query parameters
     *
     * @param {string} url
     * @returns {string} url without parameters
     * @private
     */
    static _getUrlWithoutParams(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        if(url.indexOf('?') !== -1) {
            return url.substr(0, url.indexOf('?'));
        } else {
            return url;
        }
    }

    /**
     * Overwrite the current url with the given url
     *
     * @param {string} url
     * @private
     */
    static _setUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'string'}
        ]);
        window.history.replaceState(window.history.state, '', url);
    }
}

/**
 * Sipa
 *
 * Framework core class to provide core functionality.
 */
class Sipa {
    /**
     * Get the version of the used library
     * @returns {string}
     */
    static getVersion() {
        const self = Sipa;
        return self._version;
    }
    /**
     * Callback function to fire to init the whole Sipa app.
     *
     * This is the entry point for your app. The given callback is called after Sipa is initialized.
     *
     * @example
     * Sipa.init(() => {
     *   SipaPage.load('login');
     * });
     *
     * @param {function} init_function
     */
    static init(init_function) {
        document.addEventListener('DOMContentLoaded', function () {
            // start in new thread, otherwise it
            // will collide with live web server
            setTimeout(init_function,0);
        }, false);
    }
}

/**
 * @type {string}
 * @private
 */
Sipa._version = "0.9.25";

// Alias
var Simpartic = Sipa;
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
