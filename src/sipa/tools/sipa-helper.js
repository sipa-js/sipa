//<!-- MODULE -->//
if (typeof require === 'function' && typeof module !== 'undefined' && module.exports) {
    LuckyCase = require('lucky-case');
    Typifier = require('typifier');
}
//<!-- /MODULE -->//

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
}

/**
 * Custom type definitions for excellent IDE auto complete support
 *
 * @typedef {Object} SipaParamValidation
 * @property {any} param_value
 * @property {string} param_name
 * @property {string} expected_type, e.g. 'Object', 'String, 'Array', ...
 */


//<!-- MODULE -->//
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SipaHelper;
}
//<!-- /MODULE -->//