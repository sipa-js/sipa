//----------------------------------------------------------------------------------------------------

SipaSerializerSpec = {};
SipaSerializerSpec.options = {};

//----------------------------------------------------------------------------------------------------

SipaSerializerSpec.sample = [
    {
        "greatly": -1477869417.3788404,
        "refused": -634091.8457775116,
        "NaN": NaN,
        "organized": [
            [
                false,
                -1991878207.4514284,
                "raise",
                undefined
            ],
            [
                [
                    [
                        -1338413385.6324291,
                        "recent",
                        {
                            "alive": {
                                "Infinity": Infinity,
                                "person": [
                                    "may",
                                    {
                                        "hurry": -966919295,
                                        "rubbed": 1046850511,
                                        "trip": [
                                            false,
                                            {
                                                "face": {
                                                    "production": {
                                                        "harder": "roll",
                                                        "flight": {
                                                            "leg": -2125288827.3326163,
                                                            "to": false,
                                                            "earn": true
                                                        },
                                                        "selection": [
                                                            [
                                                                {
                                                                    "underline": [
                                                                        [
                                                                            {
                                                                                "frog": true,
                                                                                "symbol": 1479373502.9205155,
                                                                                "material": 194813229.29058266
                                                                            },
                                                                            true,
                                                                            "one"
                                                                        ],
                                                                        -404594850.6582928,
                                                                        "own"
                                                                    ],
                                                                    "worth": 1831897472.624887,
                                                                    "motor": true
                                                                },
                                                                "donkey",
                                                                true,
                                                                null
                                                            ],
                                                            "slight",
                                                            false,
                                                            {
                                                                "RegExp": /abcdefg/gm
                                                            }
                                                        ]
                                                    },
                                                    "undefined": undefined,
                                                    "program": -234291160.83348703,
                                                    "prove": "finest"
                                                },
                                                "engine": true,
                                                "left": -2057408352.642222,
                                                "Date": new Date()
                                            },
                                            true
                                        ]
                                    },
                                    "easy"
                                ],
                                "title": true,
                                "grandfather": false
                            },
                            "environment": "grade",
                            "complete": -331335698
                        }
                    ],
                    "task",
                    "success"
                ],
                442676832.9296899,
                2034091380
            ],
            "bet"
        ]
    },
    "wave",
    true
];

//----------------------------------------------------------------------------------------------------

describe('SipaSerializer', () => {
    beforeEach(() => {
    });
    describe('serialize and deserialize ', () => {
        beforeEach(() => {
        });
        it('serializes and deserializes all specific data types', function () {
            const undefined_value = undefined;
            const serialized_undefined = SipaSerializer.serialize(undefined_value);
            expect(serialized_undefined).toEqual("::undefined::");
            expect(SipaSerializer.deserialize(undefined_value)).toEqual(undefined);
            const nan_value = NaN;
            const serialized_nan = SipaSerializer.serialize(nan_value);
            expect(serialized_nan).toEqual("::NaN::");
            expect(SipaSerializer.deserialize(serialized_nan)).toEqual(NaN);
            const infinity_value = Infinity;
            const serialized_infinity = SipaSerializer.serialize(infinity_value);
            expect(serialized_infinity).toEqual("::Infinity::");
            expect(SipaSerializer.deserialize(serialized_infinity)).toEqual(Infinity);
            const neg_infinity_value = -Infinity;
            const serialized_neg_infinity = SipaSerializer.serialize(neg_infinity_value);
            expect(serialized_neg_infinity).toEqual("::-Infinity::");
            expect(SipaSerializer.deserialize(serialized_neg_infinity)).toEqual(-Infinity);
            const date_value = new Date();
            const serialized_date = SipaSerializer.serialize(date_value);
            expect(serialized_date).toEqual(`::Date::${date_value.toISOString()}`);
            expect(SipaSerializer.deserialize(serialized_date)).toEqual(date_value);
            const regex_value = /abcdefg/gm;
            const serialized_regex = SipaSerializer.serialize(regex_value);
            expect(serialized_regex).toEqual("::RegExp::/abcdefg/gm");
            expect(SipaSerializer.deserialize(serialized_regex)).toEqual(regex_value);
            const func_value = function test(param1, param2) {
                return param1 + param2;
            };
            const serialized_func = SipaSerializer.serialize(func_value);
            // replace all linebreaks with next line indention with " "
            expect(serialized_func.replaceAll(/\\n|\s+/g,"")).toEqual(`"function test (param1, param2) { return param1 + param2; }"`.replaceAll(/\\n|\s+/g,""));
            const deserialized_func = SipaSerializer.deserialize(serialized_func);
            expect(deserialized_func(5, 7)).toEqual(12);
            expect(SipaSerializer.deserialize(SipaSerializer.serialize(func_value))(5, 7)).toEqual(12);

        });
        it('serializes and deserializes a complex nested Array', function () {
            // work with copy to ensure no references
            const object = Object.assign([], SipaSerializerSpec.sample);
            const original = SipaSerializerSpec.sample;
            expect(object).toEqual(original);
            const serialized = SipaSerializer.serialize(object);
            expect(serialized).not.toEqual(JSON.stringify(original));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(deserialized).toEqual(original);
        });
        it('serializes and deserializes a complex nested Object', function () {
            // work with copy to ensure no references
            const object = Object.assign({}, SipaSerializerSpec.sample[0]);
            const original = SipaSerializerSpec.sample[0];
            expect(object).toEqual(original);
            const serialized = SipaSerializer.serialize(object);
            expect(serialized).not.toEqual(JSON.stringify(original));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(deserialized).toEqual(original);
        });
    });
    describe('isFunctionString', () => {
        beforeEach(() => {
        });
        it('detects function without name', function () {
            const func_str = "function (param1, param2) { return param1+param2; }";
            expect(SipaSerializer.isFunctionString(func_str)).toBeTrue();
        });
        it('detects function with name', function () {
            const func_str = "function myfunc(param1, param2) { return param1+param2; }";
            expect(SipaSerializer.isFunctionString(func_str)).toBeTrue();
        });
        it('detects function without function key word', function () {
            const func_str = "myfunc(param1, param2) { return param1+param2; }";
            expect(SipaSerializer.isFunctionString(func_str)).toBeTrue();
        });
        it('detects arrow function without name', function () {
            const func_str = "(param1, param2) => { return param1+param2; }";
            expect(SipaSerializer.isFunctionString(func_str)).toBeTrue();
        });
        it('detects non-function', function () {
            const func_str = "this is not a function";
            expect(SipaSerializer.isFunctionString(func_str)).toBeFalse();
        });
    });
    describe('serialize and deserialize functions', () => {
        it('serializes and deserializes a function with name', function () {
            const my_func = function test(param1, param2) {
                return param1 + param2;
            };
            expect(my_func(5, 7)).toEqual(12);
            const serialized = SipaSerializer.serialize(my_func);
            expect(serialized.replaceAll(/\\n|\s+/g,"")).toEqual(`"function test(param1, param2) { return param1 + param2; }"`.replaceAll(/\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(deserialized(5, 7)).toEqual(12);
        });
        it('serializes and deserializes a function without name', function () {
            const my_func = function (param1, param2) {
                return param1 + param2;
            };
            expect(my_func(5, 7)).toEqual(12);
            const serialized = SipaSerializer.serialize(my_func);
            expect(serialized.replaceAll(/\\n|\s+/g,"")).toEqual(`"function (param1, param2) { return param1 + param2; }"`.replaceAll(/\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(deserialized(5, 7)).toEqual(12);
        });
        it('serializes and deserializes an arrow function', function () {
            const my_func = (param1, param2) => {
                return param1 + param2;
            };
            expect(my_func(5, 7)).toEqual(12);
            const serialized = SipaSerializer.serialize(my_func);
            expect(serialized.replaceAll(/\\n|\s+/g,"")).toEqual(`"(param1, param2) => { return param1 + param2; }"`.replaceAll(/\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(deserialized(5, 7)).toEqual(12);
        });
        it('serializes and deserializes a function inside a complex object', function () {
            const object = {
                name: "Gorki",
                funk: function (param1, param2) {
                    return param1 + param2;
                },
                arr: [
                    5,
                    7,
                    (a, b) => {
                        return a * b;
                    }
                ]
            };
            expect(object.funk(5, 7)).toEqual(12);
            expect(object.arr[2](5, 7)).toEqual(35);
            const serialized = SipaSerializer.serialize(object);
            expect(serialized.replaceAll(/\\n|\\\\n|\s+/g,"")).toEqual(`{"name":"Gorki","funk":"\\"function (param1, param2) { return param1 + param2; }\\"","arr":[5,7,"\\"(a, b) => { return a * b; }\\""]}`.replaceAll(/\\n|\\\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(typeof deserialized).toEqual(typeof object);
            expect(deserialized.toString()).toEqual(object.toString());
            expect(deserialized.funk(5, 7)).toEqual(12);
            expect(deserialized.arr[2](5, 7)).toEqual(35);
        });
    });
    describe('Serializes empty values in arrays and objects in high and deep levels', () => {
        it('serializes and deserializes empty values in arrays', function () {
            let object = [5, null, 7, [9, null, 11, [13, null, 15]], null, 17, null, null];
            delete object[1];
            delete object[3][1];
            delete object[3][3][1];
            delete object[4];
            delete object[6];
            delete object[7];
            const serialized = SipaSerializer.serialize(object);
            expect(serialized.replaceAll(/\\n|\s+/g,"")).toEqual('[5,"::empty::",7,[9,"::empty::",11,[13,"::empty::",15]],"::empty::",17,"::empty::","::empty::"]'.replaceAll(/\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(object).toEqual(deserialized);
        });
        it('serializes and deserializes empty values in arrays inside objects', function () {
            let object = {
                name: "Gorki",
                arr: [5, null, 7, [9, null, 11, [13, null, 15]], null, 17, null, null],
                more: {
                    arr: [19, null, 21, [23, null, 25, [27, null, 29]], null, 31, null, null]
                }
            };
            delete object.arr[1];
            delete object.arr[3][1];
            delete object.arr[3][3][1];
            delete object.arr[4];
            delete object.arr[6];
            delete object.arr[7];
            delete object.more.arr[1];
            delete object.more.arr[3][1];
            delete object.more.arr[3][3][1];
            delete object.more.arr[4];
            delete object.more.arr[6];
            delete object.more.arr[7];
            const serialized = SipaSerializer.serialize(object);
            expect(serialized.replaceAll(/\\n|\s+/g,"")).toEqual('{"name":"Gorki","arr":[5,"::empty::",7,[9,"::empty::",11,[13,"::empty::",15]],"::empty::",17,"::empty::","::empty::"],"more":{"arr":[19,"::empty::",21,[23,"::empty::",25,[27,"::empty::",29]],"::empty::",31,"::empty::","::empty::"]}}'.replaceAll(/\\n|\s+/g,""));
            const deserialized = SipaSerializer.deserialize(serialized);
            expect(object).toEqual(deserialized);
        });
    });
});

//----------------------------------------------------------------------------------------------------