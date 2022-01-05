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
]

//----------------------------------------------------------------------------------------------------

describe('serialize and deserialize ', () => {
    beforeEach(() => {
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

//----------------------------------------------------------------------------------------------------