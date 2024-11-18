//----------------------------------------------------------------------------------------------------

describe('Example', function () {
    beforeAll(function () {
        SipaTest.enableTestingMode();
    });
    beforeEach(function () {
    });
    it('This is an simple example', function () {
        expect(true).toEqual(true);
    });
});

//----------------------------------------------------------------------------------------------------

describe('NestedExample', function () {
    beforeAll(function () {
        SipaTest.enableTestingMode();
    });
    beforeEach(function () {
    });
    describe('nesting context', function () {
        it('This is an simple nested example', function () {
            expect(false).toEqual(false);
        });
    });
});

//----------------------------------------------------------------------------------------------------