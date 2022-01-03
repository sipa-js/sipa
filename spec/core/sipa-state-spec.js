//----------------------------------------------------------------------------------------------------
var options = {};

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
            let key = 'spec1';
            let value = 123;
            SipaState.setVariable(key, value);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.VARIABLE);
            key = 'spec2';
            value = 456;
            SipaState.set(key, value, options);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.VARIABLE);
        });
        it('set and get string', function () {
            let key = 'spec3';
            let value = 'SomeString';
            SipaState.setVariable(key, value);
            expect(SipaState.get(key)).toEqual(value);
            expect(SipaState.getLevel(key)).toEqual(SipaState.LEVEL.VARIABLE);
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