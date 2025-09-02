//----------------------------------------------------------------------------------------------------

SipaHelperSpec = {};
SipaHelperSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaHelper', () => {
    beforeEach(() => {
    });
    describe('.mergeOptions()', () => {
        it('should merge two objects', () => {
            const obj_one = {a: 1, b: "two"};
            const obj_two = {b: "TWO", c: null};
            const merged = SipaHelper.mergeOptions(obj_one, obj_two);
            expect(merged).toEqual({a: 1, b: "TWO", c: null});
        });
        it('should not modify the source object', () => {
            const obj_one = {a: 1, b: "two"};
            const obj_two = {b: "TWO", c: null};
            const merged = SipaHelper.mergeOptions(obj_one, obj_two);
            expect(obj_one).toEqual({a: 1, b: "two"});
        });
        it('should throw an error if source is not an object', () => {
            expect(() => {
                SipaHelper.mergeOptions(null, {b: "TWO", c: null});
            }).toThrow("Invalid parameter 'source' given. Expected type 'Object' but got type 'null'!");
            expect(() => {
                SipaHelper.mergeOptions(42, {b: "TWO", c: null});
            }).toThrow("Invalid parameter 'source' given. Expected type 'Object' but got type 'number'!");
            expect(() => {
                SipaHelper.mergeOptions("not an object", {b: "TWO", c: null});
            }).toThrow("Invalid parameter 'source' given. Expected type 'Object' but got type 'string'!");
        });
        it('should throw an error if addition is not an object', () => {
            expect(() => {
                SipaHelper.mergeOptions({a: 1, b: "two"}, null);
            }).toThrow("Invalid parameter 'addition' given. Expected type 'Object' but got type 'null'!");
            expect(() => {
                SipaHelper.mergeOptions({a: 1, b: "two"}, 42);
            }).toThrow("Invalid parameter 'addition' given. Expected type 'Object' but got type 'number'!");
            expect(() => {
                SipaHelper.mergeOptions({a: 1, b: "two"}, "not an object");
            }).toThrow("Invalid parameter 'addition' given. Expected type 'Object' but got type 'string'!");
        });
    });
    describe('.isArrayContainingEmptyValue()', () => {
        it('should return true for an array of size 1 containing empty', () => {
            let arr = ["one"];
            delete arr[0];
            expect(SipaHelper.isArrayContainingEmptyValue(arr)).toBeTrue();
        });
        it('should return false for an array of size 1 not containing empty', () => {
            let arr = ["one"];
            expect(SipaHelper.isArrayContainingEmptyValue(arr)).toBeFalse();
        });
        it('should throw an error for an array not of size 1', () => {
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue([]);
            }).toThrowError();
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue([1, 2]);
            }).toThrowError();
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue([undefined, undefined]);
            }).toThrowError();
        });
        it('should throw an error if value is not an array', () => {
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue(null);
            }).toThrowError();
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue(42);
            }).toThrowError();
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue("not an array");
            }).toThrowError();
            expect(() => {
                SipaHelper.isArrayContainingEmptyValue({});
            }).toThrowError();
        });
    });
    describe('.validateParams()', () => {
        it('should not throw an error for valid parameters', () => {
            expect(() => {
                SipaHelper.validateParams([
                    {param_name: 'param_one', param_value: {}, expected_type: 'Object'},
                    {param_name: 'param_two', param_value: true, expected_type: 'boolean'},
                    {param_name: 'param_three', param_value: 42, expected_type: 'number'},
                    {param_name: 'param_four', param_value: "a string", expected_type: 'string'},
                    {param_name: 'param_five', param_value: [], expected_type: 'Array'},
                ]);
            }).not.toThrowError();
        });
    });
    describe('.throwParamError()', () => {
        it('should always throw an error', () => {
            expect(() => {
                SipaHelper.throwParamError('param_one', "one", 'Object');
            }).toThrow("Invalid parameter 'param_one' given. Expected type 'Object' but got type 'string'!");
        });
    });
    describe('.cutLeadingCharacters()', () => {
        it('should cut leading characters from a string', () => {
            expect(SipaHelper.cutLeadingCharacters('/some/path/is/that', '/')).toBe('some/path/is/that');
            expect(SipaHelper.cutLeadingCharacters('///some/path/is/that', '///')).toBe('some/path/is/that');
            expect(SipaHelper.cutLeadingCharacters('---some-path-is-that', '---')).toBe('some-path-is-that');
            expect(SipaHelper.cutLeadingCharacters('   some path is that', '   ')).toBe('some path is that');
            expect(SipaHelper.cutLeadingCharacters('xyzxyzxyzThis is a test', 'xyzxyzxyz')).toBe('This is a test');
        });
        it('should return the original string if no leading characters match', () => {
            expect(SipaHelper.cutLeadingCharacters('some/path/is/that', '/')).toBe('some/path/is/that');
            expect(SipaHelper.cutLeadingCharacters('some-path-is-that', '-')).toBe('some-path-is-that');
            expect(SipaHelper.cutLeadingCharacters('some path is that', ' ')).toBe('some path is that');
            expect(SipaHelper.cutLeadingCharacters('This is a test', 'xyz')).toBe('This is a test');
        });
        it('should return an empty string if the entire string consists of the leading characters', () => {
            expect(SipaHelper.cutLeadingCharacters('/////', '/////')).toBe('');
            expect(SipaHelper.cutLeadingCharacters('-----', '-----')).toBe('');
            expect(SipaHelper.cutLeadingCharacters('     ', '     ')).toBe('');
            expect(SipaHelper.cutLeadingCharacters('xyzxyzxyz', 'xyzxyzxyz')).toBe('');
        });
    });
    describe('.cutTrailingCharacters()', () => {
        it('should cut trailing characters from a string', () => {
            expect(SipaHelper.cutTrailingCharacters('/some/path/file.ext', '.ext')).toBe('/some/path/file');
            expect(SipaHelper.cutTrailingCharacters('/some/path/file.ext.ext', '.ext')).toBe('/some/path/file.ext');
            expect(SipaHelper.cutTrailingCharacters('some-path-is-that---', '---')).toBe('some-path-is-that');
            expect(SipaHelper.cutTrailingCharacters('some path is that   ', '   ')).toBe('some path is that');
            expect(SipaHelper.cutTrailingCharacters('This is a testxyzxyzxyz', 'xyz')).toBe('This is a testxyzxyz');
        });
        it('should return the original string if no trailing characters match', () => {
            expect(SipaHelper.cutTrailingCharacters('/some/path/file', '.ext')).toBe('/some/path/file');
            expect(SipaHelper.cutTrailingCharacters('some-path-is-that', '-')).toBe('some-path-is-that');
            expect(SipaHelper.cutTrailingCharacters('some path is that', ' ')).toBe('some path is that');
            expect(SipaHelper.cutTrailingCharacters('This is a test', 'xyz')).toBe('This is a test');
        });
        it('should return an empty string if the entire string consists of the trailing characters', () => {
            expect(SipaHelper.cutTrailingCharacters('.....', '.....')).toBe('');
            expect(SipaHelper.cutTrailingCharacters('-----', '-----')).toBe('');
            expect(SipaHelper.cutTrailingCharacters('     ', '     ')).toBe('');
            expect(SipaHelper.cutTrailingCharacters('xyzxyzxyz', 'xyzxyzxyz')).toBe('');
        });
    });
    describe('.constantizeString()', () => {
        it('should convert a string to its constant representation', () => {
            expect(SipaHelper.constantizeString('SipaUrl')).toBe(SipaUrl);
        });
        it('should throw an error if the parameter is not a string', () => {
            expect(() => {
                SipaHelper.constantizeString(null);
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString(42);
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString({});
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString([]);
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString("");
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString(undefined);
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString(" ");
            }).toThrowError();
            expect(() => {
                SipaHelper.constantizeString("NotDefinedAnyWhere");
            }).toThrowError();
        });
        it('should throw an error if the parameter has invalid characters and so is no valid constant', () => {
            expect(() => {
                SipaHelper.constantizeString('123invalid');
            }).toThrowError("Constant '123invalid' is not defined");
            expect(() => {
                SipaHelper.constantizeString('invalid-constant!');
            }).toThrowError("Invalid constant 'invalid-constant!'");
        });
        it('should handle numeric strings correctly', () => {
            expect(SipaHelper.constantizeString('222')).toBe(222);
            expect(SipaHelper.constantizeString('222.000')).toBe(222.000);
        });
        it('should handle already constant strings correctly', () => {
            ALREADY_CONSTANT = "I am already a constant!";
            expect(SipaHelper.constantizeString('ALREADY_CONSTANT')).toBe(ALREADY_CONSTANT);
        });
    });
});

//----------------------------------------------------------------------------------------------------