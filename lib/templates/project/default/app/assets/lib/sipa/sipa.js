/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version 0.9.1
 * @date 2023-12-15T14:21:36.184Z
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
     * @returns {boolean}
     */
    static isLoaded() {
        const self = SipaBasicView;
        if(self.type() === 'page') {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentPageId())).endsWith(self.className());
        } else {
            return LuckyCase.toPascalCase(SipaPage.extractIdOfTemplate(SipaPage.currentLayoutId())).endsWith(self.className());
        }
    }

    /**
     * Get the class name of the current view
     *
     * @returns {string}
     */
    static className() {
        return this.name;
    }

    /**
     * Get the type of the current view
     *
     * @returns {('page','layout')}
     */
    static type() {
        const self = SipaBasicView;
        if(self.className().endsWith('Page')) {
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
        const h = SipaHelper;
        return h.isUndefined(value) ||
            h.isNaN(value) ||
            h.isInfinity(value) ||
            h.isDate(value) ||
            h.isRegExp(value)
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
     * @returns {boolean} true if localhost, otherweise false
     */
    static isRunningLocalHost() {
        const host = window.location.hostname;
        return host.indexOf('localhost') !== -1 || host.indexOf('127.0.0.1') !== -1;
    }

    /**
     * Check if debug mode is enabled
     *
     * @returns {boolean} true if enabled, otherwise false
     */
    static isDebugMode() {
        return !!SipaUrl.getParams().debug && SipaUrl.getParams().debug !== 'false';
    }

    /**
     * Debug output on console if debug mode is enabled
     *
     * @param {string, any} text
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
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '${Typifier.getType(param)}!'`;
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
            {param_name: 'text', param_value: text, expected_type: 'String'},
            {param_name: 'leading_characters', param_value: leading_characters, expected_type: 'String'},
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
            {param_name: 'text', param_value: text, expected_type: 'String'},
            {param_name: 'trailing_characters', param_value: trailing_characters, expected_type: 'String'},
        ]);
        if (text.endsWith(trailing_characters)) {
            return text.substr(0,text.indexOf(trailing_characters));
        } else {
            return text;
        }
    }
}

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
     * @param {('on','off','trigger')} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeInitPage(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_page_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyPage'
     * 
     * @param {('on','off','trigger')} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeDestroyPage(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_page_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_page_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_page_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeInitLayout'
     * 
     * @param {('on','off','trigger')} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeInitLayout(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_init_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_init_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_init_layout_functions);
                break;
            default:
                throw `Invalid type '${type}'`;
        }
    }

    /**
     * Set, remove or trigger event 'beforeDestroyLayout'
     * 
     * @param {('on','off','trigger')} type
     * @param {function} func function to set or remove, ignored if parameter type is 'trigger'
     */
    static beforeDestroyLayout(type, func) {
        const self = SipaHooks;
        switch (type) {
            case 'on':
                self._addFunction(self._before_destroy_layout_functions, func);
                break;
            case 'off':
                self._removeFunction(self._before_destroy_layout_functions, func);
                break;
            case 'trigger':
                self._triggerFunctions(self._before_destroy_layout_functions);
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

    static _triggerFunctions(array) {
        array.forEach((fun) => {
            if (typeof fun === 'function') {
                fun();
            }
        });
    }
}

SipaHooks._before_init_page_functions = [];
SipaHooks._before_destroy_page_functions = [];
SipaHooks._before_init_layout_functions = [];
SipaHooks._before_destroy_layout_functions = [];


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
     * @param {Array<String>} options.remove_params parameters to be removed at the new page
     * @param {function} options.success function to be called after successful loading
     * @param {function} options.error function to be called after loading fails
     * @param {function} options.always function to be called always after successful/erroneous loading
     */
    static load(page_id, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'page_id', param_value: page_id, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            layout_id: self.config.default_layout,
            force_load: false,
            fade_effect: true,
            stack_page: true
        }
        if(!options.layout_id && self.config.default_layouts && self.config.default_layouts.hasOwnProperty(page_id)) {
            options.layout_id = self.config.default_layouts[page_id];
        }
        options = SipaHelper.mergeOptions(default_options, options);
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
                        const j_container = $(self.page_container_css_selector);
                        const load_function = () => {
                            SipaHooks.beforeDestroyPage('trigger');
                            if (last_page_id) {
                                self.callMethodOfPage(last_page_id, 'onDestroy', [{next_page_id: page_id}]);
                            }
                            j_container.html(data);
                            SipaHooks.beforeInitPage('trigger');
                            if (options.fade_effect) {
                                j_container.fadeIn(150);
                            }
                            if (options.stack_page) {
                                self.stackHistoryState({page_id: page_id, layout_id: layout_id, options: options});
                            }
                            if (options.params) {
                                SipaUrl.setParams(options.params);
                            }
                            if (options.remove_params) {
                                SipaUrl.removeParams(options.remove_params);
                            }
                            self.callMethodOfPage(page_id, 'onInit', [{last_page_id: last_page_id}]);
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
     * @param {('layout','page')} options.type='page'
     * @returns {string} absolute path
     */
    static extractIdOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
            {param_name: 'options', param_value: options, expected_type: 'Object'},
        ]);
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const type = self.typeOptions(options.type);
        let id = SipaHelper.cutLeadingCharacters(template, '/');
        id = SipaHelper.cutLeadingCharacters(id, type.prefix);
        id = SipaHelper.cutTrailingCharacters(id, type.file_ext);
        return LuckyCase.toDashCase(id);
    }

    /**
     * Get the class name of the given template
     *
     * @param {string} template id or path of page or layout
     * @param {Object} options
     * @param {('layout','page')} options.type='page'
     * @returns {string} class name
     */
    static getClassNameOfTemplate(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
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
     * @param {('page','layout')} type
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
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'String'},
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
         * @param {('success','always')} type
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
            {param_name: 'page_id', param_value: page_id, expected_type: 'String'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'String'},
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
            {param_name: 'layout_id', param_value: layout_id, expected_type: 'String'},
            {param_name: 'method_name', param_value: method_name, expected_type: 'String'},
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
     * @param {('layout','page')} options.type='page'
     * @returns {string} absolute path
     * @private
     */
    static _makeFullPath(template, options = {}) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'template', param_value: template, expected_type: 'String'},
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
            {param_name: 'replace_state', param_value: replace_state, expected_type: 'Boolean'},
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
     * @param {Object} config
     * @param {string} config.default_layout
     * @param {Object} config.default_layouts
     */
    static setConfig(config) {
        const self = SipaPage;
        SipaHelper.validateParams([
            {param_name: 'config', param_value: config, expected_type: 'Object'},
        ]);
        self.config = config;
    }
}

SipaPage.page_container_css_selector = '#page-container';

// init only when running in browser
if(typeof window !== 'undefined') {
    SipaPage.initHistoryState();
}

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
 * @typedef {Object} SipaPageConfig
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
    static getUrl() {
        return window.location.href;
    }

    /**
     * Get the protocol of the current url (without colon)
     *
     * @returns {('http'|'https')}
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

    static getParams() {
        const self = SipaUrl;
        return self.getParamsOfUrl(self.getUrl());
    }

    /**
     * Set or overwrite given parameters of the current url
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
     * @param {string} param_key
     * @param {string} value
     */
    static setParam(param_key, value) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'String'}]);
        let param = {};
        param[param_key] = value;
        self.setParams(param);
    }

    /**
     * Remove given params of the current url
     *
     * @param {Array<String>} param_keys
     */
    static removeParams(param_keys) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_keys, param_name: 'param_keys', expected_type: 'Array'}]);
        const new_url = self.removeParamsOfUrl(self.getUrl(), param_keys);
        self._setUrl(new_url);
    }

    static removeParam(param_key) {
        const self = SipaUrl;
        SipaHelper.validateParams([{param_value: param_key, param_name: 'param_key', expected_type: 'String'}]);
        self.removeParams([param_key]);
    }

    static removeAnchor() {
        const self = SipaUrl;
        const new_url = self.removeAnchorOfUrl(self.getUrl());
        self._setUrl(new_url);
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
     * @param {string} url the url to extract parameters from
     * @param {Object} options
     * @param {boolean} options.decode_uri decode uri parameter values
     * @returns {Object<string, string>} return a JSON with { param1: value1, param2: value2, ... }
     */
    static getParamsOfUrl(url, options = {}) {
        const self = SipaUrl;
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'},
            {param_value: options, param_name: 'options', expected_type: 'Object'}
        ]);
        const default_options = {
            decode_uri: true, // decode url variables
        };
        options = SipaHelper.mergeOptions(default_options, options);
        let query_string = url.indexOf('?') !== -1 ? url.split('?')[1] : (new URL(url)).search.slice(1);
        let obj = {};
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
            {param_name: 'url', param_value: url, expected_type: 'String'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        param_keys.forEach((key) => {
            if (curr_params[key]) {
                delete curr_params[key];
            }
        });
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
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
            {param_value: param_key, param_name: 'param_key', expected_type: 'String'},
            {param_value: url, param_name: 'url', expected_type: 'String'},
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
            {param_value: url, param_name: 'url', expected_type: 'String'},
        ]);
        let curr_params = self.getParamsOfUrl(url);
        const anchor = self.getAnchorOfUrl(url, {return_prefixed_hash: true});
        for (let key of Object.keys(params)) {
            curr_params[key] = params[key];
        }
        return self._getUrlWithoutParams(url) + '?' + self.createUrlParams(curr_params) + anchor;
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
            {param_value: url, param_name: 'url', expected_type: 'String'},
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
            {param_value: url, param_name: 'url', expected_type: 'String'}
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
            {param_value: url, param_name: 'url', expected_type: 'String'}
        ]);
        return url.substr(0, url.indexOf('?'));
    }

    /**
     * Overwrite the current url with the given url
     *
     * @param {string} url
     * @private
     */
    static _setUrl(url) {
        SipaHelper.validateParams([
            {param_value: url, param_name: 'url', expected_type: 'String'}
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
     * Function to fire to init the whole Sipa app
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
Sipa._version = "0.9.1";

// Alias
var Simpartic = Sipa;
