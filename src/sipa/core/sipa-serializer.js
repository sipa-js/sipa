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
     * Serialize given value to be stored in JSON without loosing its original value.
     *
     * @example
     *
     * const my_example_object = {
     *    name: "My Object",
     *    created: new Date(),
     *    pattern: /abc/i,
     *    doSomething: function(a, b) { return a + b; },
     *    nothing: null,
     *    not_defined: undefined,
     *    not_a_number: NaN,
     *    infinite: Infinity,
     *    items: [1, 2, 3, 4]
     *  };
     *
     *  delete my_example_object.items[2]; // create an empty entry in the array
     *  console.log(my_example_object.items); // [1, 2, empty, 4]
     *
     *
     *  const serialized = SipaSerializer.serialize(my_example_object);
     *  console.log(serialized);
     *  // Example output (formatted for readability):
     *  /*{
     *    "name": "My Object",
     *    "created": "::Date::2023-10-05T12:34:56.789Z",
     *    "pattern": "::RegExp::/abc/i",
     *    "doSomething": "function(a, b) { return a + b; }",
     *    "nothing": null,
     *    "not_defined": "::undefined::",
     *    "not_a_number": "::NaN::",
     *    "infinite": "::Infinity::",
     *    "items": [1, 2, "::empty::", 4]
     *  }* /
     *  // serialized is now a valid JSON string that can be stored without data loss
     *
     *
     *  const deserialized = SipaSerializer.deserialize(serialized);
     *  // deserialized is now a clone of my_example_object with all original values and types
     *  console.log(deserialized.name); // "My Object"
     *  console.log(deserialized.created instanceof Date); // true
     *  console.log(deserialized.pattern instanceof RegExp); // true
     *  console.log(typeof deserialized.doSomething === 'function'); // true
     *  console.log(deserialized.nothing === null); // true
     *  console.log(typeof deserialized.not_defined === 'undefined'); // true
     *  console.log(typeof deserialized.not_a_number === 'number' && isNaN(deserialized.not_a_number)); // true
     *  console.log(deserialized.infinite === Infinity); // true
     *  console.log(Array.isArray(deserialized.items) && deserialized.items.length === 4 && !(2 in deserialized.items)); // true, note the empty entry at index 2
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
     * Serialize given value to be stored in JSON without loosing its original value.
     *
     * @example
     *
     * const serialized = `{
     *   "name": "My Object",
     *   "created": "::Date::2023-10-05T12:34:56.789Z",
     *   "pattern": "::RegExp::/abc/i",
     *   "doSomething": "function(a, b) { return a + b; }",
     *   "nothing": null,
     *   "not_defined": "::undefined::",
     *   "not_a_number": "::NaN::",
     *   "infinite": "::Infinity::",
     *   "items": [1, 2, "::empty::", 4]
     *   }`;
     *
     *   const deserialized = SipaSerializer.deserialize(serialized);
     *   // deserialized is now a clone of my_example_object with all original values and types
     *   console.log(deserialized); // show the full object
     *   {
     *       name: "My Object",
     *       created: Date, // actual Date object
     *       pattern: RegExp, // actual RegExp object
     *       doSomething: function(a, b) { return a + b; }, //
     *       nothing: null,
     *       not_defined: undefined,
     *       not_a_number: NaN,
     *       infinite: Infinity,
     *       items: [1, 2, empty, 4]
     *   }
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
     * Check if given string is a valid javascript function.
     *
     * Note: This method does not check if the function makes sense, only if the syntax is valid.
     *
     * @example
     *
     * SipaSerializer.isFunctionString("function(a, b) { return a + b; }"); // true
     * SipaSerializer.isFunctionString("(a, b) => { return a + b; }"); // true
     * SipaSerializer.isFunctionString("a => a * 2"); // true
     * SipaSerializer.isFunctionString("function myFunc(a, b) { return a + b; }"); // true
     * SipaSerializer.isFunctionString("myFunc(a, b) { return a + b; }"); // true, function name without prefix 'function'
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
     * Check if given string is a valid javascript array.
     *
     * @example
     *
     * SipaSerializer.isArrayString("[1, 2, 3]"); // true
     * SipaSerializer.isArrayString("['a', 'b', 'c']"); // true
     * SipaSerializer.isArrayString("[true, false, null]"); // true
     * SipaSerializer.isArrayString("[1, [2, 3], {a: 4}]"); // true
     * SipaSerializer.isArrayString("{a: 1, b: 2}"); // false
     * SipaSerializer.isArrayString("function() {}"); // false
     * SipaSerializer.isArrayString("not an array"); // false
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
     * Check if given string is a valid javascript object.
     *
     * @example
     *
     * SipaSerializer.isObjectString("{a: 1, b: 2}"); // true
     * SipaSerializer.isObjectString("{'a': 1, 'b': 2}"); // true
     * SipaSerializer.isObjectString('{"a": 1, "b": 2}'); // true
     * SipaSerializer.isObjectString("{a: 1, b: {c: 3}}"); // true
     * SipaSerializer.isObjectString("[1, 2, 3]"); // false
     * SipaSerializer.isObjectString("function() {}"); // false
     * SipaSerializer.isObjectString("not an object"); // false
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
     * Deserialize a valid javascript string into a callable function.
     *
     * @example
     *
     * const fn1 = SipaSerializer.deserializeFunctionString("function(a, b) { return a + b; }");
     * console.log(fn1(2, 3)); // 5
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
     * @example
     *
     * const my_example_object = {
     *   name: "My Object",
     *   created: new Date(),
     *   pattern: /abc/i,
     *   doSomething: function(a, b) { return a + b; },
     *   nothing: null,
     *   not_defined: undefined,
     *   not_a_number: NaN,
     *   infinite: Infinity,
     *   items: [1, 2, 3, 4]
     * };
     *
     * delete my_example_object.items[2]; // create an empty entry in the array
     * console.log(my_example_object.items); // [1, 2, empty, 4]
     *
     * const escaped = SipaSerializer.deepSerializeSpecialTypes(my_example_object);
     * console.log(escaped);
     * {
     *   name: "My Object",
     *   created: "::Date::2023-10-05T12:34:56.789Z",
     *   pattern: "::RegExp::/abc/i",
     *   doSomething: "function(a, b) { return a + b; }",
     *   nothing: null,
     *   not_defined: "::undefined::",
     *   not_a_number: "::NaN::",
     *   infinite: "::Infinity::",
     *   items: [1, 2, "::empty::", 4]
     * }
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
     * Deserializes (unescapes) all special types of the given Array or Object.
     *
     * Original Array or Object is cloned and will not be manipulated.
     *
     * @example
     *
     * const escaped = {
     *   name: "My Object",
     *   created: "::Date::2023-10-05T12:34:56.789Z",
     *   pattern: "::RegExp::/abc/i",
     *   doSomething: "function(a, b) { return a + b; }",
     *   nothing: null,
     *   not_defined: "::undefined::",
     *   not_a_number: "::NaN::",
     *   infinite: "::Infinity::",
     *   items: [1, 2, "::empty::", 4]
     * };
     *
     * const deserialized = SipaSerializer.deepDeserializeSpecialTypes(escaped);
     * console.log(deserialized);
     * {
     *   name: "My Object",
     *   created: Date, // actual Date object
     *   pattern: RegExp, // actual RegExp object
     *   doSomething: function(a, b) { return a + b; }, // actual function
     *   nothing: null,
     *   not_defined: undefined,
     *   not_a_number: NaN,
     *   infinite: Infinity,
     *   items: [1, 2, empty, 4] // note the empty entry at index 2
     * }
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
     * Original Array is manipulated (no clone).
     *
     * @example
     *
     * let arr = [1, 2, 3, 4];
     * delete arr[2]; // create an empty entry in the array
     * console.log(arr); // [1, 2, empty, 4]
     * arr = SipaSerializer._serializeEmptyArrayValues(arr);
     * console.log(arr); // [1, 2, "::empty::", 4]
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
     * Deserialize (unescape) special type 'empty' inside given Array.
     * Only on first dimension/level, nesting is ignored.
     *
     * Original Array is manipulated (no clone).
     *
     * @example
     *
     * let arr = [1, 2, "::empty::", 4];
     * console.log(arr); // [1, 2, "::empty::", 4]
     * arr = SipaSerializer._deserializeEmptyArrayValues(arr);
     * console.log(arr); // [1, 2, empty, 4]
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
     * @example
     *
     * SipaSerializer._isSpecialType(undefined); // true
     * SipaSerializer._isSpecialType(NaN); // true
     * SipaSerializer._isSpecialType(Infinity); // true
     * SipaSerializer._isSpecialType(new Date()); // true
     * SipaSerializer._isSpecialType(/abc/i); // true
     * SipaSerializer._isSpecialType(function() {}); // true
     * SipaSerializer._isSpecialType(null); // false
     * SipaSerializer._isSpecialType(123); // false
     * SipaSerializer._isSpecialType("string"); // false
     * SipaSerializer._isSpecialType([1, 2, 3]); // false
     * SipaSerializer._isSpecialType({a: 1, b: 2}); // false
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
     * Check if given value is a serialized (escaped) special type.
     *
     * @example
     *
     * SipaSerializer._isSerializedSpecialType("::undefined::"); // true
     * SipaSerializer._isSerializedSpecialType("::NaN::"); // true
     * SipaSerializer._isSerializedSpecialType("::Infinity::"); // true
     * SipaSerializer._isSerializedSpecialType("::Date::2023-10-05T12:34:56.789Z"); // true
     * SipaSerializer._isSerializedSpecialType("::RegExp::/abc/i"); // true
     * SipaSerializer._isSerializedSpecialType("function(a, b) { return a + b; }"); // true
     * SipaSerializer._isSerializedSpecialType("not a special type"); // false
     * SipaSerializer._isSerializedSpecialType(123); // false
     * SipaSerializer._isSerializedSpecialType(null); // false
     * SipaSerializer._isSerializedSpecialType(undefined); // false
     * SipaSerializer._isSerializedSpecialType([1, 2, 3]); // false
     * SipaSerializer._isSerializedSpecialType({a: 1, b: 2}); // false
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
     * Original Array or Object is not manipulated.
     *
     * @example
     *
     * const originalArray = [1, 2, 3];
     * const clonedArray = SipaSerializer._cloneObject(originalArray);
     * console.log(clonedArray); // [1, 2, 3]
     * clonedArray[0] = 99;
     * console.log(originalArray); // [1, 2, 3] - original
     * console.log(clonedArray); // [99, 2, 3] - cloned
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

/**
 * Placeholders for special types when serialized.
 * These placeholders are used to identify and restore the special types during deserialization.
 *
 * @type {{"::undefined::": undefined, "::NaN::": number, "::Infinity::": number, "::empty::": string, "::Date::": DateConstructor, "::RegExp::": RegExpConstructor}}
 */
SipaSerializer.STORAGE_PLACEHOLDERS = {
    '::undefined::': undefined,
    '::NaN::': NaN,
    '::Infinity::': Infinity,
    '::empty::': 'SpecialCaseForDeletedArrayEntryThatBehavesSimilarLikeUndefined',
    '::Date::': Date,
    '::RegExp::': RegExp
}