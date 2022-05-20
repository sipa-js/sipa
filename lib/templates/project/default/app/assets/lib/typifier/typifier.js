/**
 * typifier
 *
 * The javascript library to get or check the type of a given variable.
 *
 * @version 0.0.10
 * @date 2022-05-20T16:39:57.200Z
 * @link https://github.com/magynhard/typifier
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */


/**
 * Typifier
 *
 * The javascript library to get or check the type of a given variable.
 *
 */
class Typifier {
    /**
     * Get the version of the used library
     * @returns {string}
     */
    static getVersion() {
        const self = Typifier;
        return self._version;
    }

    /**
     * Check if given variable is of type Array
     *
     * @param {any} value
     * @returns {boolean} true if Array, otherwise false
     */
    static isArray(value) {
        return value instanceof Array && value.constructor.name === 'Array';
    }

    /**
     * Check if given variable is of type Object
     *
     * @param {any} value
     * @returns {boolean} true if Object, otherwise false
     */
    static isObject(value) {
        return value instanceof Object && value.constructor.name === 'Object';
    }

    /**
     * Check if given variable is of type string (primitive)
     *
     * @param {any} value
     * @returns {boolean} true if 'string', otherwise false
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * Check if given variable is of type String (class instance)
     *
     * @param {any} value
     * @returns {boolean} true if instance of class 'String', otherwise false
     */
    static isStringClass(value) {
        return value instanceof Object && value.constructor.name === 'String';
    }

    /**
     * Check if given variable is of type number (primitive)
     *
     * @param {any} value
     * @returns {boolean} true if 'number', otherwise false
     */
    static isNumber(value) {
        return typeof value === 'number';
    }

    /**
     * Check if given variable is of type Number (class instance)
     *
     * @param {any} value
     * @returns {boolean} true if instance of class 'Number', otherwise false
     */
    static isNumberClass(value) {
        return value instanceof Object && value.constructor.name === 'Number';
    }

    /**
     * Check if given variable is of type Date
     *
     * @param {any} value
     * @returns {boolean} true if Date, otherwise false
     */
    static isDate(value) {
        return value instanceof Date;
    }

    /**
     * Check if given variable is of type RegExp
     *
     * @param {any} value
     * @returns {boolean} true if RegExp, otherwise false
     */
    static isRegExp(value) {
        return value instanceof RegExp;
    }

    /**
     * Check if given variable is of type NaN
     *
     * @param {any} value
     * @returns {boolean} true if NaN, otherwise false
     */
    static isNaN(value) {
        return typeof value === 'number' && (value).toString() === 'NaN';
    }

    /**
     * Check if given variable is of type Infinity
     *
     * @param {any} value
     * @returns {boolean} true if Infinity, otherwise false
     */
    static isInfinity(value) {
        return value === Infinity;
    }

    /**
     * Check if given variable is of type undefined
     *
     * @param {any} value
     * @returns {boolean} true if undefined, otherwise false
     */
    static isUndefined(value) {
        return typeof value === 'undefined';
    }

    /**
     * Check if given variable is of type null
     *
     * @param {any} value
     * @returns {boolean} true if null, otherwise false
     */
    static isNull(value) {
        return typeof value === null;
    }

    /**
     * Check if given variable is of type boolean (primitive)
     *
     * @param {any} value
     * @returns {boolean} true if 'boolean' or instance of class 'Boolean', otherwise false
     */
    static isBoolean(value) {
        return typeof value === 'boolean' || (value instanceof Object && value.constructor.name === 'Boolean');
    }

    /**
     * Check if given variable is of type Boolean (class instance)
     *
     * @param {any} value
     * @returns {boolean} true if instance of class 'Boolean', otherwise false
     */
    static isBooleanClass(value) {
        return value instanceof Object && value.constructor.name === 'Boolean';
    }

    /**
     * Check if given variable is of type function
     *
     * @param {any} value
     * @returns {boolean} true if function, otherwise false
     */
    static isFunction(value) {
        return typeof value === 'function';
    }

    /**
     * Check if the given value is of the given type.
     *
     * @example
     *  Typifier.is('Array',[1,2,3]) // => true
     *
     * @param {string} type
     * @param {any} value
     * @returns {boolean} true if the value is of the given type
     */
    static is(type, value) {
        const self = Typifier;
        return self.getType(value) === type;
    }

    /**
     * Get the type of the given value.
     * Primitive types are lower case.
     *
     * @example
     *  'Object'
     * @example
     *  'string'
     *
     * @param {any} value
     * @returns {string} type in pascal case format
     */
    static getType(value) {
        const self = Typifier;
        if (self.isArray(value)) {
            return 'Array';
        } else if (self.isObject(value)) {
            return 'Object';
        } else if (self.isString(value)) {
            return 'string';
        } else if (self.isStringClass(value)) {
            return 'String';
        } else if (self.isNumber(value)) {
            return 'number';
        } else if (self.isNumberClass(value)) {
            return 'Number';
        } else if (self.isDate(value)) {
            return 'Date';
        } else if (self.isRegExp(value)) {
            return 'RegExp';
        } else if (self.isNaN(value)) {
            return 'NaN';
        } else if (self.isInfinity(value)) {
            return 'Infinity';
        } else if (self.isUndefined(value)) {
            return 'undefined';
        } else if (self.isNull(value)) {
            return 'null';
        } else if (self.isBoolean(value)) {
            return 'boolean';
        } else if (self.isBooleanClass(value)) {
            return 'Boolean';
        } else if (self.isFunction(value)) {
            return 'function';
        } else {
            let type = 'Unknown';
            if (value && value.constructor) {
                type = value.constructor.name;
            } else if (value && value.prop && value.prop.constructor) {
                type = value.prop.constructor;
            } else {
                type = typeof value;
            }
            return LuckyCase.toPascalCase(type);
        }
    }
}

/**
 * @type {string}
 * @private
 */
Typifier._version = "0.0.10";


