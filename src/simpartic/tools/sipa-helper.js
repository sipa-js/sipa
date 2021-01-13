/**
 * SipaHelper
 *
 * Tool helper class with common helper methods
 */
class SipaHelper {
    /**
     * Merge default options (source) with custom options (addition)
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
     * Check if given variable is of type Array
     *
     * @param {any} value
     * @returns {boolean} true if Array, otherwise false
     */
    static isArray(value) {
        return value instanceof Array;
    }

    /**
     * Check if given variable is of type Object
     *
     * @param {any} value
     * @returns {boolean} true if Object, otherwise false
     */
    static isObject(value) {
        return value instanceof Object;
    }

    /**
     * Check if given variable is of type String
     *
     * @param {any} value
     * @returns {boolean} true if String, otherweise false
     */
    static isString(value) {
        return typeof value === 'string';
    }

    /**
     * Get the type of the given value as pascal case formatted string
     *
     * @example
     *  'Object'
     *  'String'
     *  'Array'
     *  'MyClass'
     *
     * @param {any} value
     * @returns {string} type in pascal case format
     */
    static getType(value) {
        const self = SipaHelper;
        if(self.isArray(value)) {
            return 'Array';
        } else if(self.isObject(value)) {
            return 'Object';
        } else if(selb.isString(value)) {
            return 'String';
        } else {
            let type = 'Unknown';
            if(value && value.constructor) {
                type = value.constructor;
            } else if(value && value.prop && value.prop.constructor) {
                type = value.prop.constructor;
            } else {
                type = typeof value;
            }
            return LuckyCase.toPascalCase(type);
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
        if(self.getType(params) !== 'Array') {
            self.throwParamError('params', params, 'Array');
        } else {
            params.forEach((elem) => {
                if(self.getType(elem.param_value) !== elem.expected_type) {
                    self.throwParamError(elem.param_name, elem.param_value, elem.expected_type);
                }
            });
        }
    }

    static throwParamError(param_name, param, expected_type) {
        throw `Invalid parameter '${param_name}' given. Expected type '${expected_type}' but got type '" + ${SipaHelper.getType(param)}!`;
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