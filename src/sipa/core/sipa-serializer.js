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