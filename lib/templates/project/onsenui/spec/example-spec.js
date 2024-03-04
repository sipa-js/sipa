
//----------------------------------------------------------------------------------------------------

describe('Example', function () {
    beforeEach(function () {
    });
    it('This is an simple example', function () {
        expect(true).toEqual(true);
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