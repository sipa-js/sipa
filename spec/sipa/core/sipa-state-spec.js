//----------------------------------------------------------------------------------------------------

SipaStateSpec = {};
SipaStateSpec.options = {};

//----------------------------------------------------------------------------------------------------

class SipaStateSpecTestClass {
    static staticAddMethod(a, b) {
        return a + b;
    }

    dynamicAddMethod(a, b) {
        return a + b;
    }
}

//----------------------------------------------------------------------------------------------------

describe('SipaState', () => {
    beforeEach(() => {
    });

    //----------------------------------------------------------------------------------------------------

    describe('set and get: ', () => {
        beforeEach(() => {
            SipaState.reset();
        });
        describe('level by option and method behave the same: ', () => {
            it('level 1', function () {
                const options = {level: SipaState.LEVEL.VARIABLE};
                let key = 'spec1';
                let value = 123;
                SipaState.setVariable(key, value);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.VARIABLE);
                key = 'spec2';
                value = 234;
                SipaState.set(key, value, options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.VARIABLE);
            });
            it('level 2', function () {
                const options = {level: SipaState.LEVEL.SESSION};
                let key = 'spec3';
                let value = 345;
                SipaState.setSession(key, value);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.SESSION);
                key = 'spec4';
                value = 456;
                SipaState.set(key, value, options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.SESSION);
            });
            it('level 3', function () {
                const options = {level: SipaState.LEVEL.STORAGE};
                let key = 'spec5';
                let value = 567;
                SipaState.setStorage(key, value);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.STORAGE);
                key = 'spec6';
                value = 678;
                SipaState.set(key, value, options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.STORAGE);
            });
        });
        describe('level 1 - variable: ', () => {
            beforeEach(() => {
                SipaStateSpec.options = {level: SipaState.LEVEL.VARIABLE};
            });
            it('set and get number', function () {
                let key = 'spec7';
                let value = 123;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get string', function () {
                let key = 'spec8';
                let value = 'SomeString';
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get boolean', function () {
                let key = 'spec9';
                let value = true;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get null', function () {
                let key = 'spec10';
                let value = null;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get undefined', function () {
                let key = 'spec11';
                let value = undefined;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get NaN', function () {
                let key = 'spec12';
                let value = NaN;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get Infinity', function () {
                let key = 'spec13';
                let value = Infinity;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get array', function () {
                let key = 'spec14';
                let value = [0, 'mixed', null, 3];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get nested array', function () {
                let key = 'spec14_2';
                let value = [[0, 1, [2, 3, null, undefined, NaN, Infinity]]];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get object', function () {
                let key = 'spec15';
                let value = {
                    a: 1,
                    b: true,
                    c: null,
                    d: [1, 2, '3'],
                    e: {
                        a: [null, undefined, NaN, Infinity],
                        nan: NaN,
                        null: null,
                        undefined: undefined,
                        infinity: Infinity,
                        deeper: {RegExp: /abc123/gm, Date: new Date()}
                    }
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get arrow function', function () {
                let key = 'spec16';
                let value = (a, b) => {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.get(key)(13, 5)).toEqual(18);
            });
            it('set and get unnamed common function', function () {
                let key = 'spec17';
                let value = function (a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get named common function', function () {
                let key = 'spec18';
                let value = function abc(a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get static class method', function () {
                let key = 'spec19';
                let value = SipaStateSpecTestClass.staticAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.get(key)(2, 7)).toEqual(9);
            });
            it('set and get dynamic class method', function () {
                let key = 'spec19';
                let value = new SipaStateSpecTestClass().dynamicAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
                expect(SipaState.get(key)(7, 13)).toEqual(20);
            });
            it('set and get Date', function () {
                let key = 'spec19_2';
                let value = new Date();
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get RegExp', function () {
                let key = 'spec19_3';
                let value = /abcdefg12345/gms;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
        });
        describe('level 2 - session: ', () => {
            beforeEach(() => {
                SipaStateSpec.options = {level: SipaState.LEVEL.SESSION};
            });
            it('set and get number', function () {
                let key = 'spec20';
                let value = 123;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get string', function () {
                let key = 'spec21';
                let value = 'SomeString';
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get boolean', function () {
                let key = 'spec22';
                let value = true;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get null', function () {
                let key = 'spec23';
                let value = null;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get undefined', function () {
                let key = 'spec24';
                let value = undefined;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get NaN', function () {
                let key = 'spec25';
                let value = NaN;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get Infinity', function () {
                let key = 'spec26';
                let value = Infinity;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get array', function () {
                let key = 'spec27';
                let value = [0, 'mixed', null, 3];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get nested array', function () {
                let key = 'spec27_2';
                let value = [[0, 1, [2, 3, null, undefined, NaN, Infinity]]];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get object', function () {
                let key = 'spec28';
                let value = {
                    a: 1,
                    b: true,
                    c: null,
                    d: [1, 2, '3'],
                    e: {
                        a: [null, undefined, NaN, Infinity],
                        nan: NaN,
                        null: null,
                        undefined: undefined,
                        infinity: Infinity,
                        deeper: {RegExp: /abc123/gm, Date: new Date()}
                    }
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get arrow function', function () {
                let key = 'spec29';
                let value = (a, b) => {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(13, 5)).toEqual(18);
            });
            it('set and get unnamed common function', function () {
                let key = 'spec30';
                let value = function (a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get named common function', function () {
                let key = 'spec31';
                let value = function abc(a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get static class method', function () {
                let key = 'spec32';
                let value = SipaStateSpecTestClass.staticAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(2, 7)).toEqual(9);
            });
            it('set and get dynamic class method', function () {
                let key = 'spec33';
                let value = new SipaStateSpecTestClass().dynamicAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(7, 13)).toEqual(20);
            });
            it('set and get Date', function () {
                let key = 'spec33_2';
                let value = new Date();
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get RegExp', function () {
                let key = 'spec33_3';
                let value = /abcdefg12345/gms;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
        });
        describe('level 3 - storage: ', () => {
            beforeEach(() => {
                SipaStateSpec.options = {level: SipaState.LEVEL.STORAGE};
            });
            it('set and get number', function () {
                let key = 'spec34';
                let value = 123;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get string', function () {
                let key = 'spec35';
                let value = 'SomeString';
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get boolean', function () {
                let key = 'spec36';
                let value = true;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get null', function () {
                let key = 'spec37';
                let value = null;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get undefined', function () {
                let key = 'spec38';
                let value = undefined;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get NaN', function () {
                let key = 'spec39';
                let value = NaN;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get Infinity', function () {
                let key = 'spec40';
                let value = Infinity;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get array', function () {
                let key = 'spec41';
                let value = [0, 'mixed', null, 3];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get nested array', function () {
                let key = 'spec42';
                let value = [[0, 1, [2, 3, null, undefined, NaN, Infinity]]];
                delete value[3]; // make position 3 to type 'empty'
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get object', function () {
                let key = 'spec43';
                let value = {
                    a: 1,
                    b: true,
                    c: null,
                    d: [1, 2, '3'],
                    e: {
                        a: [null, undefined, NaN, Infinity],
                        nan: NaN,
                        null: null,
                        undefined: undefined,
                        infinity: Infinity,
                        deeper: {RegExp: /abc123/gm, Date: new Date()}
                    }
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get arrow function', function () {
                let key = 'spec44';
                let value = (a, b) => {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(13, 5)).toEqual(18);
            });
            it('set and get unnamed common function', function () {
                let key = 'spec45';
                let value = function (a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get named common function', function () {
                let key = 'spec46';
                let value = function abc(a, b) {
                    return a + b;
                };
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(17, 9)).toEqual(26);
            });
            it('set and get static class method', function () {
                let key = 'spec47';
                let value = SipaStateSpecTestClass.staticAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(2, 7)).toEqual(9);
            });
            it('set and get dynamic class method', function () {
                let key = 'spec48';
                let value = new SipaStateSpecTestClass().dynamicAddMethod;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)(7, 13)).toEqual(20);
            });
            it('set and get Date', function () {
                let key = 'spec49';
                let value = new Date();
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
            it('set and get RegExp', function () {
                let key = 'spec50';
                let value = /abcdefg12345/gms;
                SipaState.set(key, value, SipaStateSpec.options);
                expect(SipaState.get(key)).toEqual(value);
            });
        });
    });

//----------------------------------------------------------------------------------------------------

    describe('reset: ', () => {
        beforeEach(() => {
        });
        it('resets values on all persistance levels', function () {
            SipaState.reset();
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec100';
            const value1 = 123;
            SipaState.setVariable(key1, value1);
            const key2 = 'spec101';
            const value2 = 234;
            SipaState.setSession(key2, value2);
            const key3 = 'spec102';
            const value3 = 345;
            SipaState.setStorage(key3, value3);
            expect(SipaState.length).toEqual(3);
            SipaState.reset();
            expect(SipaState.length).toEqual(0);
        });
    });

//----------------------------------------------------------------------------------------------------

    describe('remove: ', () => {
        beforeEach(() => {
            SipaState.reset();
        });
        it('removes on level 1', function () {
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec120';
            const value1 = 123;
            SipaState.setVariable(key1, value1);
            const key2 = 'spec121';
            const value2 = 234;
            SipaState.setVariable(key2, value2);
            expect(SipaState.length).toEqual(2);
            expect(SipaState.hasKey(key1)).toEqual(true);
            expect(SipaState.hasKey(key2)).toEqual(true);
            SipaState.remove(key1);
            expect(SipaState.length).toEqual(1);
            expect(SipaState.hasKey(key1)).toEqual(false);
            expect(SipaState.hasKey(key2)).toEqual(true);
            expect(SipaState.get(key1)).toEqual(undefined);
        });
        it('removes on level 2', function () {
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec122';
            const value1 = 123;
            SipaState.setSession(key1, value1);
            const key2 = 'spec123';
            const value2 = 234;
            SipaState.setSession(key2, value2);
            expect(SipaState.length).toEqual(2);
            expect(SipaState.hasKey(key1)).toEqual(true);
            expect(SipaState.hasKey(key2)).toEqual(true);
            SipaState.remove(key1);
            expect(SipaState.length).toEqual(1);
            expect(SipaState.hasKey(key1)).toEqual(false);
            expect(SipaState.hasKey(key2)).toEqual(true);
            expect(SipaState.get(key1)).toEqual(undefined);
        });
        it('removes on level 3', function () {
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec123';
            const value1 = 123;
            SipaState.setStorage(key1, value1);
            const key2 = 'spec124';
            const value2 = 234;
            SipaState.setStorage(key2, value2);
            expect(SipaState.length).toEqual(2);
            expect(SipaState.hasKey(key1)).toEqual(true);
            expect(SipaState.hasKey(key2)).toEqual(true);
            SipaState.remove(key1);
            expect(SipaState.length).toEqual(1);
            expect(SipaState.hasKey(key1)).toEqual(false);
            expect(SipaState.hasKey(key2)).toEqual(true);
            expect(SipaState.get(key1)).toEqual(undefined);
        });
        it('removes on mixed levels', function () {
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec123';
            const value1 = 123;
            SipaState.setVariable(key1, value1);
            const key2 = 'spec124';
            const value2 = 234;
            SipaState.setSession(key2, value2);
            const key3 = 'spec125';
            const value3 = 234;
            SipaState.setStorage(key3, value3);
            expect(SipaState.length).toEqual(3);
            expect(SipaState.hasKey(key1)).toEqual(true);
            expect(SipaState.hasKey(key2)).toEqual(true);
            expect(SipaState.hasKey(key3)).toEqual(true);
            SipaState.remove(key2);
            expect(SipaState.length).toEqual(2);
            expect(SipaState.hasKey(key1)).toEqual(true);
            expect(SipaState.hasKey(key2)).toEqual(false);
            expect(SipaState.hasKey(key3)).toEqual(true);
            expect(SipaState.get(key2)).toEqual(undefined);
        });
    });

//----------------------------------------------------------------------------------------------------

    describe('reset: ', () => {
        beforeEach(() => {
        });
        it('resets values on all persistance levels', function () {
            SipaState.reset();
            expect(SipaState.length).toEqual(0);
            const key1 = 'spec100';
            const value1 = 123;
            SipaState.setVariable(key1, value1);
            const key2 = 'spec101';
            const value2 = 234;
            SipaState.setSession(key2, value2);
            const key3 = 'spec102';
            const value3 = 345;
            SipaState.setStorage(key3, value3);
            expect(SipaState.length).toEqual(3);
            SipaState.reset();
            expect(SipaState.length).toEqual(0);
        });
    });

//----------------------------------------------------------------------------------------------------

});