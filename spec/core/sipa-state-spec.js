
//----------------------------------------------------------------------------------------------------

describe('set and get', function () {
    beforeEach(function () {
    });
    it('set and get number', function () {
        const key = 'spec1';
        const value = 123;
        SipaState.set(key,value);
        expect(SipaState.get(key)).toEqual(value);
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