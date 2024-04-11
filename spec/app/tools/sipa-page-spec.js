//----------------------------------------------------------------------------------------------------

SipaPageSpec = {};
SipaPageSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaPage', () => {
    beforeEach(() => {
        SipaState.reset();
    });
    describe('.extractIdOfTemplate', () => {
        it('page level 1 full path', function () {
            expect(SipaPage.extractIdOfTemplate('views/pages/test/test.html')).toEqual('test');
            expect(SipaPage.extractIdOfTemplate('views/pages/quark/quark.html')).toEqual('quark');
        });
        it('page level 1 relative path', function () {
            expect(SipaPage.extractIdOfTemplate('test/test.html')).toEqual('test');
            expect(SipaPage.extractIdOfTemplate('quark/quark.html')).toEqual('quark');
        });
        it('page level 1 incomplete path', function () {
            expect(SipaPage.extractIdOfTemplate('views/pages/test/')).toEqual('test');
            expect(SipaPage.extractIdOfTemplate('views/pages/quark/')).toEqual('quark');
        });
        it('page level 2 full path', function () {
            expect(SipaPage.extractIdOfTemplate('views/pages/test/suppe/suppe.html')).toEqual('test/suppe');
            expect(SipaPage.extractIdOfTemplate('views/pages/quark/stark/stark.html')).toEqual('quark/stark');
        });
        it('page level 2 relative path', function () {
            expect(SipaPage.extractIdOfTemplate('test/best/best.html')).toEqual('test/best');
            expect(SipaPage.extractIdOfTemplate('quark/gut/gut.html')).toEqual('quark/gut');
        });
        it('page level 2 incomplete path', function () {
            expect(SipaPage.extractIdOfTemplate('views/pages/test/kist')).toEqual('test/kist');
            expect(SipaPage.extractIdOfTemplate('views/pages/quark/kist')).toEqual('quark/kist');
        });
    });
});

//----------------------------------------------------------------------------------------------------
