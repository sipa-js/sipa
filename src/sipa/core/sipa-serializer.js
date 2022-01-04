class SipaSerializer {

    static serialize(value) {
        const self = SipaSerializer;
        if (typeof value === 'undefined') {
            return '::undefined::';
        } else if (value === null) {
            return null;
        } else if (typeof value === 'function') {
            return value.toString();
        } else if (SipaHelper.isNaN(value)) {
            return '::NaN::';
        } else if (SipaHelper.isInfinity(value)) {
            return '::Infinity::';
        } else if (SipaHelper.isDate(value)) {
            return `::Date::${value.toISOString()}`;
        } else if (SipaHelper.isRegExp(value)) {
            return `::RegExp::${value.toString()}`;
        } else if (typeof value !== 'undefined' && typeof JSON.stringify(value) === 'undefined') {
            throw `You can store references only at persistence level ${self.LEVEL.VARIABLE}`;
        } else if (value !== null && typeof value === 'object') {
            return JSON.stringify(self.deepSerializeSpecialTypes(value));
        } else {
            return JSON.stringify(value);
        }
    }

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
        } else if (SipaHelper.isString(value) && value.startsWith('::Date::')) {
            return new Date(value.replace('::Date::',''));
        } else if (SipaHelper.isString(value) && value.startsWith('::RegExp::')) {
            let full_regex_string = value.replace('::RegExp::','');
            let regex_source = full_regex_string.substring(1,full_regex_string.lastIndexOf('/'));
            let regex_flags = full_regex_string.substring(full_regex_string.lastIndexOf('/')+1,full_regex_string.length);
            return new RegExp(regex_source, regex_flags);
        } else {
            try {
                let parsed = JSON.parse(value);
                if (parsed !== null && typeof parsed === 'object') {
                    return self.deepDeserializeSpecialTypes(parsed);
                } else {
                    return parsed;
                }
            } catch (e) {
                return value;
            }
        }
    }

    static isFunctionString(value) {
        const self = SipaSerializer;
        if (!SipaHelper.isString(value)) {
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

    static isArrayString(value) {
        const self = SipaSerializer;
        if(SipaHelper.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('[') && trimmed.endsWith(']')) {
                try {
                    let array = JSON.parse(trimmed);
                    return SipaHelper.isArray(array);
                } catch(e) {
                }
            }
        }
        return false;
    }

    static isObjectString(value) {
        const self = SipaSerializer;
        if(SipaHelper.isString(value)) {
            let trimmed = value.trim();
            if(trimmed.startsWith('{') && trimmed.endsWith('}')) {
                try {
                    let object = JSON.parse(trimmed);
                    return SipaHelper.isObject(object);
                } catch(e) {
                }
            }
        }
        return false;
    }

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

    static deepSerializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (SipaHelper.isArray(copy)) {
            copy = self._serializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (typeof value === 'object' && value !== null) {
                return self.deepSerializeSpecialTypes(copy[key]);
            } else if (self._isSpecialType(copy[key])) {
                copy[key] = self.serialize(copy[key]);
            }
        });
        return copy;
    }

    static deepDeserializeSpecialTypes(obj) {
        const self = SipaSerializer;
        let copy = self._cloneObject(obj);
        // check if empty entries
        if (SipaHelper.isArray(copy)) {
            copy = self._deserializeEmptyArrayValues(copy);
        }
        Object.entries(copy).forEach((entry, index) => {
            const key = entry[0];
            const value = entry[1];
            // array or object, recursive rerun
            if (typeof value === 'object' && value !== null) {
                return self.deepDeserializeSpecialTypes(copy[key]);
            } else if (self._isSerializedSpecialType(copy[key])) {
                copy[key] = self.deserialize(copy[key]);
            }
        });
        return copy;
    }

    static _serializeEmptyArrayValues(array) {
        if (SipaHelper.isArray(array) && Object.entries(array).length < array.length) {
            for (let i = 0; i < array.length; ++i) {
                if (SipaHelper.isArrayContainingEmptyValue(array.slice(i, i + 1))) {
                    array[i] = '::empty::';
                }
            }
        }
        return array;
    }

    static _deserializeEmptyArrayValues(array) {
        for (let i = 0; i < array.length; ++i) {
            if (array[i] === '::empty::') {
                delete array[i];
            }
        }
        return array;
    }

    static _isSpecialType(value) {
        const h = SipaHelper;
        return h.isUndefined(value) ||
            h.isNaN(value) ||
            h.isInfinity(value) ||
            h.isDate(value) ||
            h.isRegExp(value)
    }

    static _isSerializedSpecialType(value) {
        const self = SipaSerializer;
        const special_types = Object.keys(self.STORAGE_PLACEHOLDERS);
        for(let i = 0; i < special_types.length; ++i) {
            if(SipaHelper.isString(value) && value.startsWith(special_types[i])) {
                return true;
            }
        }
        return false;
    }

    static _cloneObject(obj) {
        let clone = null;
        if(SipaHelper.isArray(obj)) {
            clone = obj.slice();
        } else if(SipaHelper.isObject(obj)) {
            clone = Object.assign({}, obj);
        } else {
            throw `Parameter must be of type 'Array' or 'Object'! Given type: '${SipaHelper.getType(obj)}'`;
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