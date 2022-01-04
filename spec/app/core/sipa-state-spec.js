//----------------------------------------------------------------------------------------------------
var options = {};

class SpecTestClass {
    static staticAddMethod(a,b) {
        return a+b;
    }

    dynamicAddMethod(a,b) {
        return a+b;
    }
}

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
            options = {level: SipaState.LEVEL.VARIABLE};
        });
        it('set and get number', function () {
            let key = 'spec7';
            let value = 123;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get string', function () {
            let key = 'spec8';
            let value = 'SomeString';
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get boolean', function () {
            let key = 'spec9';
            let value = true;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get null', function () {
            let key = 'spec10';
            let value = null;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get undefined', function () {
            let key = 'spec11';
            let value = undefined;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get NaN', function () {
            let key = 'spec12';
            let value = NaN;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get Infinity', function () {
            let key = 'spec13';
            let value = Infinity;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get array', function () {
            let key = 'spec14';
            let value = [1,'mixed',3];
            delete value[2];
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get object', function () {
            let key = 'spec15';
            let value = { a: 1, b: true, c: null, d: [1,2,'3'], e: { a: [], nan: NaN, null: null, undefined: undefined, infinity: Infinity }};
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get arrow function', function () {
            let key = 'spec16';
            let value = (a,b) => { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.get(key)(13,5)).toEqual(18);
        });
        it('set and get unnamed common function', function () {
            let key = 'spec17';
            let value = function (a,b) { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.get(key)(17,9)).toEqual(26);
        });
        it('set and get named common function', function () {
            let key = 'spec18';
            let value = function abc(a,b) { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.get(key)(17,9)).toEqual(26);
        });
        it('set and get static class method', function () {
            let key = 'spec19';
            let value = SpecTestClass.staticAddMethod;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.get(key)(2,7)).toEqual(9);
        });
        it('set and get dynamic class method', function () {
            let key = 'spec19';
            let value = new SpecTestClass().dynamicAddMethod;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.get(key)(7,13)).toEqual(20);
        });
    });
    describe('level 2 - session: ', () => {
        beforeEach(() => {
            options = {level: SipaState.LEVEL.SESSION};
        });
        it('set and get number', function () {
            let key = 'spec20';
            let value = 123;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get string', function () {
            let key = 'spec21';
            let value = 'SomeString';
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get boolean', function () {
            let key = 'spec22';
            let value = true;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get null', function () {
            let key = 'spec23';
            let value = null;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get undefined', function () {
            let key = 'spec24';
            let value = undefined;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get NaN', function () {
            let key = 'spec25';
            let value = NaN;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get Infinity', function () {
            let key = 'spec26';
            let value = Infinity;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get array', function () {
            let key = 'spec27';
            let value = [1,'mixed', null];
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get object', function () {
            let key = 'spec28';
            let value = { a: 1, b: true, c: null, d: [1,2,'3'], e: { a: [], nan: NaN, null: null, undefined: undefined, infinity: Infinity }};
            SipaState.set(key, value, options);
            console.warn(SipaState.get(key));
            expect(SipaState.get(key)).toEqual(value);
        });
        it('set and get arrow function', function () {
            let key = 'spec29';
            let value = (a,b) => { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)(13,5)).toEqual(18);
        });
        it('set and get unnamed common function', function () {
            let key = 'spec30';
            let value = function (a,b) { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)(17,9)).toEqual(26);
        });
        it('set and get named common function', function () {
            let key = 'spec31';
            let value = function abc(a,b) { return a+b; };
            SipaState.set(key, value, options);
            expect(SipaState.get(key)(17,9)).toEqual(26);
        });
        it('set and get static class method', function () {
            let key = 'spec32';
            let value = SpecTestClass.staticAddMethod;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)(2,7)).toEqual(9);
        });
        it('set and get dynamic class method', function () {
            let key = 'spec33';
            let value = new SpecTestClass().dynamicAddMethod;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)(7,13)).toEqual(20);
        });
    });
});

//----------------------------------------------------------------------------------------------------

describe('NestedExample', function () {
    beforeEach(function () {
    });
    describe('nesting context', function () {
        it('This is an simple nested example', function () {
            expect(false).toEqual(false);
        });
    });
});

//----------------------------------------------------------------------------------------------------